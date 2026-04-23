"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Pagination from "../tables/Pagination";
import {
  formatDate,
  getClinicalData,
  getTriageClasses,
  type VisitaEnriched,
} from "@/lib/clinicalData";
import {
  assignVisitToBed,
  attachEmergencyBoard,
  EMERGENCY_BEDS_PER_ROOM,
  getNextAvailableBed,
  getRequiredRoomCount,
  markVisitAttended,
  releaseVisitBed,
  reopenEmergencyVisit,
  sortEmergencyVisits,
  subscribeEmergencyBoard,
  type EmergencyVisit,
  type EmergencyVisitStatus,
} from "@/lib/emergencyBoard";

const PAGE_SIZE = 7;

type QueueFilter = "" | EmergencyVisitStatus;

const QUEUE_LABELS: Record<EmergencyVisitStatus, string> = {
  waiting: "En espera",
  in_bed: "En cama",
  attended: "Atendido",
};

const QUEUE_CLASSES: Record<EmergencyVisitStatus, string> = {
  waiting: "bg-amber-100 text-amber-800 ring-amber-200",
  in_bed: "bg-blue-100 text-blue-800 ring-blue-200",
  attended: "bg-emerald-100 text-emerald-800 ring-emerald-200",
};

const Emergency = () => {
  const [visitas, setVisitas] = useState<VisitaEnriched[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedQueueStatus, setSelectedQueueStatus] = useState<QueueFilter>("");
  const [showAttended, setShowAttended] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<EmergencyVisit | null>(null);
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getClinicalData();
      setVisitas(data.visitasEnriched);
    } catch (error) {
      console.error("Error al cargar datos de emergencia:", error);
      setVisitas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
    return subscribeEmergencyBoard(() => {
      void fetchData();
    });
  }, [fetchData]);

  useEffect(() => {
    if (!actionError && !actionMessage) return;
    const timer = window.setTimeout(() => {
      setActionError("");
      setActionMessage("");
    }, 4500);
    return () => window.clearTimeout(timer);
  }, [actionError, actionMessage]);

  const operationalVisits = useMemo(
    () => sortEmergencyVisits(attachEmergencyBoard(visitas)),
    [visitas]
  );

  const specialties = useMemo(
    () =>
      Array.from(
        new Set(operationalVisits.map((visita) => visita.especialidad).filter(Boolean))
      ).sort(),
    [operationalVisits]
  );

  const filteredVisits = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return operationalVisits.filter((visita) => {
      const matchesQuery =
        !query ||
        visita.paciente?.cedula?.toLowerCase().includes(query) ||
        visita.paciente?.nombre?.toLowerCase().includes(query) ||
        visita.prediagnostico?.toLowerCase().includes(query) ||
        visita.diagnostico?.diagnostico?.toLowerCase().includes(query);

      const matchesStatus = !selectedStatus || visita.evaluacion_triaje === selectedStatus;
      const matchesSpecialty = !selectedSpecialty || visita.especialidad === selectedSpecialty;
      const matchesQueueStatus = !selectedQueueStatus || visita.board.status === selectedQueueStatus;
      const shouldDisplayAttended = showAttended || visita.board.status !== "attended";

      return (
        matchesQuery &&
        matchesStatus &&
        matchesSpecialty &&
        matchesQueueStatus &&
        shouldDisplayAttended
      );
    });
  }, [operationalVisits, searchQuery, selectedQueueStatus, selectedSpecialty, selectedStatus, showAttended]);

  const paginatedVisits = filteredVisits.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedQueueStatus, selectedSpecialty, selectedStatus, showAttended]);

  useEffect(() => {
    if (!selectedVisit?.id) return;
    const updatedVisit = operationalVisits.find((visita) => visita.id === selectedVisit.id) ?? null;
    setSelectedVisit(updatedVisit);
  }, [operationalVisits, selectedVisit?.id]);

  const stats = {
    waiting: operationalVisits.filter((visita) => visita.board.status === "waiting").length,
    inBed: operationalVisits.filter((visita) => visita.board.status === "in_bed").length,
    attended: operationalVisits.filter((visita) => visita.board.status === "attended").length,
    critical: operationalVisits.filter(
      (visita) =>
        visita.board.status !== "attended" &&
        visita.evaluacion_triaje.toLowerCase() === "rojo"
    ).length,
  };

  function setFeedback(message: string, kind: "error" | "success") {
    if (kind === "error") {
      setActionError(message);
      setActionMessage("");
      return;
    }

    setActionMessage(message);
    setActionError("");
  }

  function ensureVisitId(visita: EmergencyVisit) {
    if (typeof visita.id !== "number") {
      throw new Error("La visita no tiene ID válido.");
    }
    return visita.id;
  }

  function assignBed(visita: EmergencyVisit) {
    try {
      const visitId = ensureVisitId(visita);
      if (visita.board.status === "attended") {
        setFeedback("El paciente ya está marcado como atendido.", "error");
        return;
      }

      const occupiedBeds = new Set(
        operationalVisits
          .filter(
            (item) =>
              item.id !== visitId && item.board.status === "in_bed" && Boolean(item.board.bedCode)
          )
          .map((item) => item.board.bedCode as string)
      );

      const activeVisits = operationalVisits.filter(
        (item) => item.id !== visitId && item.board.status !== "attended"
      ).length + 1;

      const roomCount = getRequiredRoomCount(activeVisits, Array.from(occupiedBeds));
      const bed =
        getNextAvailableBed(occupiedBeds, roomCount, EMERGENCY_BEDS_PER_ROOM) ??
        getNextAvailableBed(occupiedBeds, roomCount + 1, EMERGENCY_BEDS_PER_ROOM);

      if (!bed) {
        setFeedback("No hay camas disponibles en este momento.", "error");
        return;
      }

      assignVisitToBed(visitId, bed.bedCode);
      setFeedback(
        `${visita.paciente?.nombre ?? "Paciente"} asignado a ${bed.bedCode}.`,
        "success"
      );
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "No se pudo asignar la cama.", "error");
    }
  }

  function sendToWaiting(visita: EmergencyVisit) {
    try {
      const visitId = ensureVisitId(visita);
      releaseVisitBed(visitId);
      setFeedback(
        `${visita.paciente?.nombre ?? "Paciente"} regresó a lista de espera.`,
        "success"
      );
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "No se pudo liberar la cama.", "error");
    }
  }

  function markAttended(visita: EmergencyVisit) {
    try {
      const visitId = ensureVisitId(visita);
      markVisitAttended(visitId);
      setFeedback(`${visita.paciente?.nombre ?? "Paciente"} marcado como atendido.`, "success");
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "No se pudo marcar como atendido.",
        "error"
      );
    }
  }

  function reopenVisit(visita: EmergencyVisit) {
    try {
      const visitId = ensureVisitId(visita);
      reopenEmergencyVisit(visitId);
      setFeedback(`${visita.paciente?.nombre ?? "Paciente"} reabierto en espera.`, "success");
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "No se pudo reabrir el caso.",
        "error"
      );
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-amber-700">Lista de espera</p>
          <p className="mt-2 text-3xl font-bold text-amber-800">{stats.waiting}</p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-blue-700">Pacientes en cama</p>
          <p className="mt-2 text-3xl font-bold text-blue-800">{stats.inBed}</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-emerald-700">Atendidos</p>
          <p className="mt-2 text-3xl font-bold text-emerald-800">{stats.attended}</p>
        </div>
        <div className="rounded-2xl border border-red-100 bg-red-50 p-5 shadow-sm">
          <p className="text-sm font-medium text-red-700">Críticos activos</p>
          <p className="mt-2 text-3xl font-bold text-red-800">{stats.critical}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Dashboard de Emergencia</h2>
              <p className="text-sm text-slate-500">
                Cola operativa con lista de espera, camas y egreso de pacientes atendidos.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <input
                type="text"
                placeholder="Buscar por nombre, cédula o prediagnóstico"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Todos los triajes</option>
                <option value="Rojo">Rojo</option>
                <option value="Naranja">Naranja</option>
                <option value="Amarillo">Amarillo</option>
                <option value="Verde">Verde</option>
                <option value="Azul">Azul</option>
              </select>

              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Todas las especialidades</option>
                {specialties.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>

              <select
                value={selectedQueueStatus}
                onChange={(e) => setSelectedQueueStatus(e.target.value as QueueFilter)}
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Todos los estados</option>
                <option value="waiting">En espera</option>
                <option value="in_bed">En cama</option>
                <option value="attended">Atendidos</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <input
              id="show-attended"
              type="checkbox"
              checked={showAttended}
              onChange={(event) => setShowAttended(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="show-attended" className="text-sm text-slate-600">
              Mostrar pacientes atendidos en la tabla
            </label>
          </div>
        </div>

        {(actionError || actionMessage) && (
          <div className="px-6 pt-5">
            {actionError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {actionError}
              </div>
            ) : null}
            {actionMessage ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {actionMessage}
              </div>
            ) : null}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Paciente</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Triaje</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Estado</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Cama</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Especialidad</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Ingreso</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {paginatedVisits.map((visita) => (
                <tr key={visita.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-slate-900">
                      {visita.paciente?.nombre ?? "Sin paciente"}
                    </div>
                    <div className="text-sm text-slate-500">
                      {visita.paciente?.cedula ?? "Sin cédula"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getTriageClasses(visita.evaluacion_triaje)}`}>
                      {visita.evaluacion_triaje}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${QUEUE_CLASSES[visita.board.status]}`}>
                      {QUEUE_LABELS[visita.board.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {visita.board.bedCode ?? "Sin asignar"}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">{visita.especialidad}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{formatDate(visita.hora_entrada)}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {visita.board.status === "in_bed" ? (
                        <button
                          onClick={() => sendToWaiting(visita)}
                          className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
                        >
                          Enviar a espera
                        </button>
                      ) : visita.board.status !== "attended" ? (
                        <button
                          onClick={() => assignBed(visita)}
                          className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                        >
                          Asignar cama
                        </button>
                      ) : null}

                      {visita.board.status === "attended" ? (
                        <button
                          onClick={() => reopenVisit(visita)}
                          className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
                        >
                          Reabrir
                        </button>
                      ) : (
                        <button
                          onClick={() => markAttended(visita)}
                          className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                        >
                          Marcar atendido
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedVisit(visita)}
                        className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                      >
                        Ver detalle
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredVisits.length === 0 && (
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            No hay visitas que coincidan con los filtros actuales.
          </div>
        )}

        <div className="px-6 py-5">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.max(1, Math.ceil(filteredVisits.length / PAGE_SIZE))}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {selectedVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">
                  {selectedVisit.paciente?.nombre ?? "Paciente sin nombre"}
                </h3>
                <p className="text-sm text-slate-500">
                  {selectedVisit.paciente?.cedula ?? "Sin cédula"} · {selectedVisit.especialidad}
                </p>
              </div>
              <button
                onClick={() => setSelectedVisit(null)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Estado actual</p>
                <p className="mt-2 text-sm text-slate-700">
                  {QUEUE_LABELS[selectedVisit.board.status]}
                  {selectedVisit.board.bedCode ? ` · ${selectedVisit.board.bedCode}` : ""}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Prediagnóstico</p>
                <p className="mt-2 text-sm text-slate-700">{selectedVisit.prediagnostico}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Resultado rPPG</p>
                <p className="mt-2 text-sm text-slate-700">
                  {selectedVisit.diagnostico?.resultado_rppg ?? "Sin resultado registrado"}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Diagnóstico</p>
                <p className="mt-2 text-sm text-slate-700">
                  {selectedVisit.diagnostico?.diagnostico ?? "Sin diagnóstico final"}
                </p>
                <p className="mt-3 text-sm text-slate-500">
                  {selectedVisit.diagnostico?.informe_prediagnostico ?? "No hay informe disponible."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Emergency;

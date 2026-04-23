"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  formatDate,
  getClinicalData,
  getTriageClasses,
  type VisitaEnriched,
} from "@/lib/clinicalData";

type Cubicle = {
  id: number;
  name: string;
  visits: VisitaEnriched[];
};

const BEDS_PER_CUBICLE = 5;

const Camas = () => {
  const [visitas, setVisitas] = useState<VisitaEnriched[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCubicle, setExpandedCubicle] = useState<number | null>(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getClinicalData();
        setVisitas(
          data.visitasEnriched.sort((a, b) => {
            const left = new Date(a.hora_entrada).getTime();
            const right = new Date(b.hora_entrada).getTime();
            return right - left;
          })
        );
      } catch (error) {
        console.error("Error fetching data:", error);
        setVisitas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const cubicles = useMemo<Cubicle[]>(() => {
    return visitas.reduce<Cubicle[]>((acc, visita, index) => {
      const cubicleIndex = Math.floor(index / BEDS_PER_CUBICLE);
      if (!acc[cubicleIndex]) {
        acc[cubicleIndex] = {
          id: cubicleIndex + 1,
          name: `Cubículo ${cubicleIndex + 1}`,
          visits: [],
        };
      }

      acc[cubicleIndex].visits.push(visita);
      return acc;
    }, []);
  }, [visitas]);

  const filteredCubicles = cubicles.filter((cubicle) =>
    cubicle.visits.some((visita) => {
      const query = searchTerm.toLowerCase();
      return (
        !query ||
        visita.paciente?.cedula?.toLowerCase().includes(query) ||
        visita.paciente?.nombre?.toLowerCase().includes(query)
      );
    })
  );

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
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Ocupación por Cubículos</h2>
            <p className="text-sm text-slate-500">
              Distribución automática de visitas activas agrupadas por cubículo de emergencia.
            </p>
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre o cédula"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {filteredCubicles.map((cubicle) => {
        const occupiedBeds = cubicle.visits.length;
        const occupancy = Math.round((occupiedBeds / BEDS_PER_CUBICLE) * 100);

        return (
          <div key={cubicle.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <button
              onClick={() =>
                setExpandedCubicle(expandedCubicle === cubicle.id ? null : cubicle.id)
              }
              className="flex w-full items-center justify-between bg-slate-900 px-6 py-4 text-left text-white"
            >
              <div>
                <h3 className="text-lg font-semibold">{cubicle.name}</h3>
                <p className="text-sm text-slate-300">
                  {occupiedBeds}/{BEDS_PER_CUBICLE} camas ocupadas
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{occupancy}%</p>
                <p className="text-xs uppercase tracking-wide text-slate-400">ocupación</p>
              </div>
            </button>

            {expandedCubicle === cubicle.id && (
              <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
                {cubicle.visits.map((visita, index) => (
                  <div key={visita.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Cama {index + 1}
                        </p>
                        <h4 className="mt-1 text-lg font-semibold text-slate-900">
                          {visita.paciente?.nombre ?? "Sin paciente"}
                        </h4>
                      </div>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getTriageClasses(visita.evaluacion_triaje)}`}>
                        {visita.evaluacion_triaje}
                      </span>
                    </div>

                    <dl className="mt-4 space-y-2 text-sm text-slate-600">
                      <div className="flex justify-between gap-3">
                        <dt>Cédula</dt>
                        <dd className="font-medium text-slate-800">{visita.paciente?.cedula ?? "Sin cédula"}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt>Especialidad</dt>
                        <dd className="font-medium text-slate-800">{visita.especialidad}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt>Ingreso</dt>
                        <dd className="font-medium text-slate-800">{formatDate(visita.hora_entrada)}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt>Diagnóstico</dt>
                        <dd className="max-w-[180px] text-right font-medium text-slate-800">
                          {visita.diagnostico?.diagnostico ?? "Pendiente"}
                        </dd>
                      </div>
                    </dl>
                  </div>
                ))}

                {Array.from({ length: Math.max(0, BEDS_PER_CUBICLE - occupiedBeds) }).map((_, index) => (
                  <div
                    key={`empty-${cubicle.id}-${index}`}
                    className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-400"
                  >
                    Cama disponible
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {filteredCubicles.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-sm">
          No se encontraron cubículos con ese paciente o cédula.
        </div>
      )}
    </div>
  );
};

export default Camas;

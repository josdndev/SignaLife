'use client'

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import React, { useState } from "react";
import Link from "next/link";

const API_URL = "http://localhost:8000";

export default function EmergenciaPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    cedula: "",
    edad: "",
    especialidad: "Medicina General",
    prediagnostico: "",
    evaluacion_triaje: "Rojo", // Por defecto para emergencias
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pacienteId, setPacienteId] = useState(null);
  const [historiaId, setHistoriaId] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "edad" ? (value ? parseInt(value) : "") : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // 1. Registrar paciente
      const pacienteResponse = await fetch(`${API_URL}/pacientes/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          cedula: formData.cedula,
          edad: parseInt(formData.edad),
        }),
      });

      if (!pacienteResponse.ok) {
        const errorData = await pacienteResponse.json();
        throw new Error(errorData.detail || "Error al registrar paciente");
      }

      const pacienteData = await pacienteResponse.json();
      setPacienteId(pacienteData.paciente.id);

      // 2. Crear historia clínica
      const fecha = new Date().toISOString().split("T")[0];
      const historiaResponse = await fetch(`${API_URL}/historias/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paciente_id: pacienteData.paciente.id,
          fecha: fecha,
        }),
      });

      if (!historiaResponse.ok) {
        const errorData = await historiaResponse.json();
        throw new Error(errorData.detail || "Error al crear historia clínica");
      }

      const historiaData = await historiaResponse.json();
      setHistoriaId(historiaData.historia.id);

      // 3. Registrar visita
      const horaEntrada = new Date().toISOString();
      const visitaResponse = await fetch(`${API_URL}/visitas/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          historia_id: historiaData.historia.id,
          hora_entrada: horaEntrada,
          evaluacion_triaje: formData.evaluacion_triaje,
          prediagnostico: formData.prediagnostico || "Emergencia - Pendiente de evaluación",
          especialidad: formData.especialidad,
          numero_visita: 1,
        }),
      });

      if (!visitaResponse.ok) {
        const errorData = await visitaResponse.json();
        throw new Error(errorData.detail || "Error al registrar visita");
      }

      setSuccess("Paciente registrado exitosamente para atención de emergencia");
      // Limpiar formulario
      setFormData({
        nombre: "",
        cedula: "",
        edad: "",
        especialidad: "Medicina General",
        prediagnostico: "",
        evaluacion_triaje: "Rojo",
      });
    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "Error al procesar el registro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Registro de Emergencias" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-[630px]">
          <h3 className="mb-4 text-center font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
            Formulario de Registro para Emergencias
          </h3>
          <p className="mb-8 text-center text-sm text-gray-500 dark:text-gray-400 sm:text-base">
            Complete los datos del paciente para atención de emergencia
          </p>

          {error && (
            <div className="mb-6 rounded-lg bg-danger/10 p-4 text-danger">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-lg bg-success/10 p-4 text-success">
              {success}
              <div className="mt-4 flex justify-center space-x-4">
                <Link href="/registro">
                  <button className="rounded-lg bg-gray-200 px-4 py-2 text-gray-800 transition-all hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                    Volver al Inicio
                  </button>
                </Link>
                <button
                  onClick={() => {
                    setSuccess("");
                    setPacienteId(null);
                    setHistoriaId(null);
                  }}
                  className="rounded-lg bg-primary px-4 py-2 text-white transition-all hover:bg-primary/90"
                >
                  Nuevo Registro
                </button>
              </div>
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Datos personales */}
              <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-800/50">
                <h4 className="mb-4 font-medium text-gray-700 dark:text-gray-200">
                  Datos Personales
                </h4>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="nombre"
                      className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-700 focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="cedula"
                      className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Cédula *
                    </label>
                    <input
                      type="text"
                      id="cedula"
                      name="cedula"
                      value={formData.cedula}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-700 focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="edad"
                      className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Edad *
                    </label>
                    <input
                      type="number"
                      id="edad"
                      name="edad"
                      value={formData.edad}
                      onChange={handleChange}
                      required
                      min="0"
                      max="150"
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-700 focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Datos de emergencia */}
              <div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-800/50">
                <h4 className="mb-4 font-medium text-gray-700 dark:text-gray-200">
                  Datos de la Emergencia
                </h4>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="evaluacion_triaje"
                      className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Nivel de Triaje *
                    </label>
                    <select
                      id="evaluacion_triaje"
                      name="evaluacion_triaje"
                      value={formData.evaluacion_triaje}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-700 focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="Rojo">Rojo - Resucitación</option>
                      <option value="Naranja">Naranja - Emergencia</option>
                      <option value="Amarillo">Amarillo - Urgencia</option>
                      <option value="Verde">Verde - Estándar</option>
                      <option value="Azul">Azul - No Urgente</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="especialidad"
                      className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Especialidad Requerida *
                    </label>
                    <select
                      id="especialidad"
                      name="especialidad"
                      value={formData.especialidad}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-700 focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="Medicina General">Medicina General</option>
                      <option value="Cardiología">Cardiología</option>
                      <option value="Traumatología">Traumatología</option>
                      <option value="Neurología">Neurología</option>
                      <option value="Pediatría">Pediatría</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label
                      htmlFor="prediagnostico"
                      className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Descripción de la Emergencia *
                    </label>
                    <textarea
                      id="prediagnostico"
                      name="prediagnostico"
                      value={formData.prediagnostico}
                      onChange={handleChange}
                      required
                      rows="3"
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-700 focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Link href="/registro">
                  <button
                    type="button"
                    className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-gray-700 transition-all hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-primary px-6 py-2.5 text-white transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Procesando..." : "Registrar Emergencia"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

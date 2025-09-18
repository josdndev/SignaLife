"use client";
import DiagnosticosList from "@/components/admin/DiagnosticosList";

export default function DiagnosticosListadoPage() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Listado de Diagnósticos</h1>
      <DiagnosticosList />
    </div>
  );
}

"use client";

import HistoriasList from "@/components/admin/HistoriasList";

export default function HistoriasTodasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Todas las Historias Clínicas</h1>
        <p className="mt-2 text-sm text-gray-600">
          Consulta transversal para revisar cada historia y su paciente asociado.
        </p>
      </div>
      <HistoriasList />
    </div>
  );
}

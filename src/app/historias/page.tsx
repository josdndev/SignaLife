"use client";

import HistoriasList from '@/components/admin/HistoriasList';

const HistoriasPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Historias Clínicas</h1>
        <p className="mt-2 text-sm text-gray-600">
          Vista centralizada de historias con su paciente asociado.
        </p>
      </div>
      <HistoriasList />
    </div>
  );
};

export default HistoriasPage;

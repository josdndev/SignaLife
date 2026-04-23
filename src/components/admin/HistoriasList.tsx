'use client';

import { useEffect, useState } from 'react';
import {
  formatDate,
  getClinicalData,
  type HistoriaWithPaciente,
} from '@/lib/clinicalData';

const HistoriasList = () => {
  const [historias, setHistorias] = useState<HistoriaWithPaciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadHistorias = async () => {
      try {
        setLoading(true);
        const data = await getClinicalData();
        setHistorias(data.historiasConPaciente);
        setError('');
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar las historias clínicas.');
      } finally {
        setLoading(false);
      }
    };

    loadHistorias();
  }, []);

  const filteredHistorias = historias.filter((historia) => {
    const query = searchTerm.toLowerCase();
    return (
      historia.fecha.toLowerCase().includes(query) ||
      historia.paciente?.nombre?.toLowerCase().includes(query) ||
      historia.paciente?.cedula?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Historias Clínicas</h2>
            <p className="text-sm text-slate-500">Resumen consolidado por paciente y fecha de apertura.</p>
          </div>
          <div className="rounded-full bg-slate-900 px-3 py-1 text-sm font-semibold text-white">
            {filteredHistorias.length} historias
          </div>
        </div>
      </div>

      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por paciente, cédula o fecha"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Historia</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Paciente</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Cédula</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Edad</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredHistorias.map((historia) => (
              <tr key={historia.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm font-semibold text-slate-900">#{historia.id ?? 'N/A'}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{historia.paciente?.nombre ?? 'Sin paciente asociado'}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{historia.paciente?.cedula ?? 'Sin cédula'}</td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {typeof historia.paciente?.edad === 'number' ? `${historia.paciente.edad} años` : 'Sin edad'}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{formatDate(historia.fecha)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredHistorias.length === 0 && (
        <div className="px-6 py-12 text-center text-sm text-slate-500">
          No hay historias que coincidan con la búsqueda actual.
        </div>
      )}
    </div>
  );
};

export default HistoriasList;

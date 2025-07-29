'use client';

import { useState, useEffect } from 'react';
import { getVisitas, type Visita } from '@/functions/api';

const VisitasList = () => {
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarVisitas();
  }, []);

  const cargarVisitas = async () => {
    try {
      setLoading(true);
      const data = await getVisitas();
      setVisitas(data);
      setError('');
    } catch (err) {
      setError('Error al cargar visitas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (evaluacion: string) => {
    switch (evaluacion.toLowerCase()) {
      case 'crítico':
        return 'bg-red-100 text-red-800';
      case 'urgente':
        return 'bg-orange-100 text-orange-800';
      case 'estable':
        return 'bg-green-100 text-green-800';
      case 'leve':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Visitas ({visitas.length})</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Historia ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hora Entrada
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Evaluación
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Especialidad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                N° Visita
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {visitas.map((visita) => (
              <tr key={visita.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {visita.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {visita.historia_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(visita.hora_entrada).toLocaleString('es-ES')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(visita.evaluacion_triaje)}`}>
                    {visita.evaluacion_triaje}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {visita.especialidad}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {visita.numero_visita}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {visitas.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay visitas registradas
        </div>
      )}
    </div>
  );
};

export default VisitasList; 
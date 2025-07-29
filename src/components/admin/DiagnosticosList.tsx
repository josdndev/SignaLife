'use client';

import { useState, useEffect } from 'react';
import { getDiagnosticos, type Diagnostico } from '@/functions/api';

const DiagnosticosList = () => {
  const [diagnosticos, setDiagnosticos] = useState<Diagnostico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarDiagnosticos();
  }, []);

  const cargarDiagnosticos = async () => {
    try {
      setLoading(true);
      const data = await getDiagnosticos();
      setDiagnosticos(data);
      setError('');
    } catch (err) {
      setError('Error al cargar diagnósticos');
      console.error(err);
    } finally {
      setLoading(false);
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
        <h2 className="text-xl font-semibold text-gray-800">Diagnósticos ({diagnosticos.length})</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Visita ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Diagnóstico
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Resultado RPGP
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {diagnosticos.map((diagnostico) => (
              <tr key={diagnostico.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {diagnostico.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {diagnostico.visita_id}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                  {diagnostico.diagnostico}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    diagnostico.resultado_rppg === 'Normal' ? 'bg-green-100 text-green-800' :
                    diagnostico.resultado_rppg === 'Anormal' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {diagnostico.resultado_rppg}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {diagnosticos.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay diagnósticos registrados
        </div>
      )}
    </div>
  );
};

export default DiagnosticosList; 
"use client";

import React, { useState, useEffect } from 'react';
import { getHistorias, getPacientes, HistoriaClinica as HistoriaAPI, Paciente as PacienteAPI } from '@/functions/api';

type HistoriaWithPaciente = HistoriaAPI & { paciente?: PacienteAPI };

const HistoriasPage = () => {
  const [historias, setHistorias] = useState<HistoriaClinica[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [historiasData, pacientesData] = await Promise.all([
          getHistorias(),
          getPacientes()
        ]);

        // Match pacientes with historias
        const historiasWithPacientes = historiasData.map((historia: HistoriaClinica) => ({
          ...historia,
          paciente: pacientesData.find(p => p.id === historia.paciente_id)
        }));

        setHistorias(historiasWithPacientes);
        setPacientes(pacientesData);
      } catch (error: any) {
        setError(error.message || 'Error cargando datos');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando historias clínicas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Historias Clínicas</h1>

      {historias.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No hay historias clínicas registradas.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paciente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cédula
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Edad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {historias.map((historia, index) => (
                <tr key={historia.id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(historia.fecha).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {historia.paciente?.nombre || 'Desconocido'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {historia.paciente?.cedula || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {historia.paciente?.edad ? `${historia.paciente.edad} años` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      className="text-blue-600 hover:text-blue-900"
                      onClick={() => {
                        // Future: open modal or navigate to detailed view
                        alert('Funcionalidad de detalle en desarrollo');
                      }}
                    >
                      Ver Detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Información</h3>
        <p className="text-blue-700 text-sm">
          Esta sección muestra las historias clínicas registradas. Próximamente se incluirán:
        </p>
        <ul className="list-disc list-inside text-blue-700 text-sm mt-2 space-y-1">
          <li>Vista detallada de cada historia</li>
          <li>Registro de nuevas historias</li>
          <li>Asociación con diagnósticos y tratamientos</li>
        </ul>
      </div>
    </div>
  );
};

export default HistoriasPage;

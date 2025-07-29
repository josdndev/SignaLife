'use client';

import { useState, useEffect } from 'react';
import { 
  getDoctores, 
  getPacientes, 
  getHistorias, 
  getVisitas, 
  getDiagnosticos 
} from '@/functions/api';

const StatsCards = () => {
  const [stats, setStats] = useState({
    doctores: 0,
    pacientes: 0,
    historias: 0,
    visitas: 0,
    diagnosticos: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
    // Actualizar cada 30 segundos
    const interval = setInterval(cargarEstadisticas, 30000);
    return () => clearInterval(interval);
  }, []);

  const cargarEstadisticas = async () => {
    try {
      const [doctores, pacientes, historias, visitas, diagnosticos] = await Promise.all([
        getDoctores(),
        getPacientes(),
        getHistorias(),
        getVisitas(),
        getDiagnosticos()
      ]);

      setStats({
        doctores: doctores.length,
        pacientes: pacientes.length,
        historias: historias.length,
        visitas: visitas.length,
        diagnosticos: diagnosticos.length
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      title: 'Doctores',
      value: stats.doctores,
      color: 'bg-blue-500',
      icon: '👨‍⚕️'
    },
    {
      title: 'Pacientes',
      value: stats.pacientes,
      color: 'bg-green-500',
      icon: '👥'
    },
    {
      title: 'Historias Clínicas',
      value: stats.historias,
      color: 'bg-yellow-500',
      icon: '📋'
    },
    {
      title: 'Visitas',
      value: stats.visitas,
      color: 'bg-purple-500',
      icon: '🏥'
    },
    {
      title: 'Diagnósticos',
      value: stats.diagnosticos,
      color: 'bg-red-500',
      icon: '🔬'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
            <div className={`${card.color} text-white p-3 rounded-full text-xl`}>
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards; 
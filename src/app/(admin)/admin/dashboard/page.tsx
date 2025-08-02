"use client";

import DoctoresList from '@/components/admin/DoctoresList';
import PacientesList from '@/components/admin/PacientesList';
import VisitasList from '@/components/admin/VisitasList';
import DiagnosticosList from '@/components/admin/DiagnosticosList';
import DataManager from '@/components/admin/DataManager';
import StatsCards from '@/components/admin/StatsCards';
import { useNotification } from '@/components/admin/Notification';

export default function AdminDashboard() {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Notificaciones */}
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`fixed top-4 right-4 z-50 max-w-sm w-full animate-slide-in`}
        >
          <div className={`border rounded-lg p-4 shadow-lg ${
            notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
            notification.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
            'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3">
                <span className="text-lg">
                  {notification.type === 'success' ? '✅' :
                   notification.type === 'error' ? '❌' :
                   notification.type === 'warning' ? '⚠️' : 'ℹ️'}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{notification.message}</p>
              </div>
              <div className="flex-shrink-0 ml-3">
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Administrativo</h1>
          <p className="text-gray-600 mt-2">Gestión y visualización de datos de la API clínica</p>
        </div>

        {/* Estadísticas */}
        <StatsCards />

        {/* Gestor de Datos */}
        <div className="mb-8">
          <DataManager />
        </div>

        {/* Grid de componentes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Doctores */}
          <div>
            <DoctoresList />
          </div>

          {/* Pacientes */}
          <div>
            <PacientesList />
          </div>

          {/* Visitas */}
          <div className="lg:col-span-2">
            <VisitasList />
          </div>

          {/* Diagnósticos */}
          <div className="lg:col-span-2">
            <DiagnosticosList />
          </div>
        </div>
      </div>
    </div>
  );
} 
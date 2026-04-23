'use client'
import PacientesList from "@/components/admin/PacientesList"
import StatsCards from "@/components/admin/StatsCards";

export default function Ecommerce() {
    return (
     <div className="space-y-8">
      <StatsCards />
  
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Listado General de Pacientes</h1>
        <p className="mt-2 text-sm text-gray-600">
          Pacientes con resumen de historias y última visita registrada.
        </p>
      </div>
      <div className="lg:col-span-2">
        <PacientesList />
      </div>
     </div>
    );
  }
  

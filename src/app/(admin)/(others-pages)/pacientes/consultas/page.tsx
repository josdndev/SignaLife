'use client'
import PacientesList from "@/components/admin/PacientesList"
import StatsCards from "@/components/admin/StatsCards";
import VisitasList from "@/components/admin/VisitasList";

export default function Ecommerce() {
    return (
     <div className="space-y-8">
      <StatsCards />
  
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pacientes en Consultas</h1>
          <p className="mt-2 text-sm text-gray-600">
            Vista del padrón de pacientes y sus visitas asociadas para consulta.
          </p>
        </div>

        <PacientesList />
        <VisitasList />
      </div>
     </div>
    );
  }
  

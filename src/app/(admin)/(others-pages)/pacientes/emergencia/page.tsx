'use client'
import VisitasList from "@/components/admin/VisitasList"
import Emergency from "@/components/uiBasic/Emergency";

export default function Ecommerce() {
    return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pacientes en Emergencia</h1>
        <p className="mt-2 text-sm text-gray-600">
          Panel operativo de emergencia con triage, especialidad y diagnósticos disponibles.
        </p>
      </div>
      <Emergency/>
      <div className="lg:col-span-2">
        <VisitasList />
      </div>
    </div>
  
       
    );
  }
  

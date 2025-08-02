"use client";

import PacientList from "@/components/uiBasic/Emergency";

import DoctoresList from '@/components/admin/DoctoresList';
import PacientesList from '@/components/admin/PacientesList';
import VisitasList from '@/components/admin/VisitasList';
import DiagnosticosList from '@/components/admin/DiagnosticosList';
import StatsCards from '@/components/admin/StatsCards';
import { useNotification } from '@/components/admin/Notification';
import Emergency from "@/components/uiBasic/Emergency";


export default function Ecommerce() {
  return (
   <div>
    <StatsCards />

    <div className="mt-8">
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

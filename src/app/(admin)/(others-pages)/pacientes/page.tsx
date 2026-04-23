'use client';

import Link from 'next/link';
import StatsCards from '@/components/admin/StatsCards';

const sections = [
  {
    title: 'Listado General',
    description: 'Vista consolidada de pacientes, historias y última visita registrada.',
    href: '/pacientes/listado',
  },
  {
    title: 'Emergencia',
    description: 'Panel de triage, diagnóstico y visitas activas de emergencia.',
    href: '/pacientes/emergencia',
  },
  {
    title: 'Cubículos',
    description: 'Distribución por camas y ocupación de cubículos de emergencia.',
    href: '/pacientes/habitaciones',
  },
  {
    title: 'Consultas',
    description: 'Seguimiento de pacientes que pasaron por flujo de consulta.',
    href: '/pacientes/consultas',
  },
];

export default function PacientesDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pacientes</h1>
        <p className="mt-2 text-sm text-gray-600">
          Accesos rápidos a los módulos de pacientes y sus tableros operativos.
        </p>
      </div>

      <StatsCards />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{section.description}</p>
            <span className="mt-6 inline-flex text-sm font-medium text-blue-600">
              Abrir modulo
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

"use client";

import Link from 'next/link';

export default function AdminIndexPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Administración</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/admin/historias" className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Historias Clínicas</h2>
          <p className="text-gray-600">Ver todas las historias clínicas del sistema</p>
        </Link>

        <Link href="/doctores" className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Doctores</h2>
          <p className="text-gray-600">Administrar información de doctores</p>
        </Link>

        <Link href="/pacientes" className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Pacientes</h2>
          <p className="text-gray-600">Administrar información de pacientes</p>
        </Link>

        <Link href="/diagnosticos" className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Diagnósticos</h2>
          <p className="text-gray-600">Ver diagnósticos del sistema</p>
        </Link>

        <Link href="/registro" className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Registros</h2>
          <p className="text-gray-600">Acceso a diferentes tipos de registros</p>
        </Link>

        <Link href="/" className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Dashboard Principal</h2>
          <p className="text-gray-600">Regresar al dashboard principal del sistema</p>
        </Link>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const AdminNavigation = () => {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/admin/dashboard',
      label: 'Dashboard',
      description: 'Vista general de todos los datos'
    },
    {
      href: '/admin/data-manager',
      label: 'Gestor de Datos',
      description: 'Poblar base de datos con datos de prueba'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Panel de Administración</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`p-4 rounded-lg border-2 transition-colors ${
              pathname === item.href
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            }`}
          >
            <h3 className="font-semibold text-lg">{item.label}</h3>
            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Acceso Restringido</h3>
        <p className="text-sm text-yellow-700">
          Esta sección es solo para administradores. Los datos mostrados son sensibles y requieren autorización.
        </p>
      </div>
    </div>
  );
};

export default AdminNavigation; 
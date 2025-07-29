import AdminNavigation from '@/components/admin/AdminNavigation';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Administración del Sistema</h1>
          <p className="text-gray-600 mt-2">Gestión de datos y configuración del sistema clínico</p>
        </div>

        <AdminNavigation />

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Información del Sistema</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">API Status</h3>
              <p className="text-sm text-blue-700">
                Conectando a: <code className="bg-blue-100 px-2 py-1 rounded">http://localhost:8000</code>
              </p>
              <p className="text-sm text-blue-600 mt-2">
                Endpoints disponibles: /doctores, /pacientes, /historias, /visitas, /diagnosticos
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Funcionalidades</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Visualización de datos en tiempo real</li>
                <li>• Población automática de base de datos</li>
                <li>• Gestión de entidades clínicas</li>
                <li>• Interfaz administrativa segura</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Instrucciones de Uso</h3>
            <ol className="text-sm text-gray-700 space-y-2">
              <li>1. <strong>Dashboard:</strong> Visualiza todos los datos del sistema en tablas organizadas</li>
              <li>2. <strong>Gestor de Datos:</strong> Usa los botones para poblar la base de datos con datos de prueba</li>
              <li>3. <strong>Navegación:</strong> Usa los enlaces de arriba para cambiar entre secciones</li>
              <li>4. <strong>Actualización:</strong> Los datos se actualizan automáticamente al cargar las páginas</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
} 
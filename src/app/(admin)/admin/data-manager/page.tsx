import DataManager from '@/components/admin/DataManager';

export default function DataManagerPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Panel de Administración</h1>
          <p className="text-gray-600 mt-2">Gestión y población de datos de la API</p>
        </div>
        
        <DataManager />
      </div>
    </div>
  );
} 
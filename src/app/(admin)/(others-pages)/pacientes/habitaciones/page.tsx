'use client'
import Camas from "@/components/uiBasic/Camas";
import StatsCards from "@/components/admin/StatsCards";

export default function Ecommerce() {
    return (
     <div className="space-y-8">
      <StatsCards />
  
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cubículos y Camas</h1>
        <p className="mt-2 text-sm text-gray-600">
          Ocupación de cubículos de emergencia construida a partir de las visitas registradas.
        </p>
      </div>
      <div className="lg:col-span-2">
        <Camas />
      </div>
     </div>
    );
  }
  

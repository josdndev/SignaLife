'use client'
import PacientesList from "@/components/admin/PacientesList"
import StatsCards from "@/components/admin/StatsCards";

export default function Ecommerce() {
    return (
     <div>
      <StatsCards />
  
      <div className="mt-8">

            <div className="lg:col-span-2">
              <PacientesList />
            </div>
          </div>
      </div>
    );
  }
  
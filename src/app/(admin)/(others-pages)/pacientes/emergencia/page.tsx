'use client'
import VisitasList from "@/components/admin/VisitasList"
import Emergency from "@/components/uiBasic/Emergency";

export default function Ecommerce() {
    return (

    <div className="mt-8">
            <Emergency/>
            {/* Visitas */}
            <div className="lg:col-span-2">
              <VisitasList />
            </div>
    </div>
  
       
    );
  }
  
'use client'
import Camas from "@/components/uiBasic/Camas";
import StatsCards from "@/components/admin/StatsCards";

export default function Ecommerce() {
    return (
     <div>
      <StatsCards />
  
      <div className="mt-8">

            <div className="lg:col-span-2">
              <Camas />
            </div>
          </div>
      </div>
    );
  }
  
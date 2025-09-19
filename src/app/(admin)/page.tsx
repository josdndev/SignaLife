import StatsCards from '@/components/admin/StatsCards';
import Emergency from "@/components/uiBasic/Emergency";

export default function AdminDashboard() {
  return (
   <div>
    <StatsCards />

    <div className="mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          <div className="lg:col-span-2">
            <Emergency/>
          </div>

        </div>
    </div>
   </div>
  );
}

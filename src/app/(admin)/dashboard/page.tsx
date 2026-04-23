"use client";

import Emergency from "@/components/uiBasic/Emergency";

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Dashboard Operativo
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Panel de control de emergencias y pacientes.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Emergency />
      </div>
    </div>
  );
}
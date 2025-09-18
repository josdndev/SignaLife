"use client";
import DoctoresList from "@/components/admin/DoctoresList";

export default function DoctoresListadoPage() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Listado de Doctores</h1>
      <DoctoresList />
    </div>
  );
}

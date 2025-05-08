"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[240px]" // Ajustado para reducir el ancho de la sidebar expandida
    : "lg:ml-[80px]"; // Ajustado para reducir el ancho de la sidebar colapsada

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
      >
        {/* Header */}
        <AppHeader title="Bienvenido, Doctor" />

        {/* Page Content */}
        <div className="p-3 md:p-4 lg:p-5 xl:p-6">{children}</div>
      </div>
    </div>
  );
}

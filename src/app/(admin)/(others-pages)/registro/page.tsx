"use client"

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Link from "next/link";
import React from "react";

export default function RegistroPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Registro de Pacientes" />
      <div className="mb-6 rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h2 className="mb-4 text-xl font-semibold text-black dark:text-white">
          Sistema de Registro de Pacientes
        </h2>
        <p className="mb-6 text-base text-gray-600 dark:text-gray-400">
          Bienvenido al sistema de registro de pacientes. Seleccione el tipo de atención que desea registrar:
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-7.5 sm:grid-cols-2">
        {/* Consultas Card */}
        <div className="rounded-sm border border-stroke bg-white shadow-default transition-all hover:shadow-lg dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              Consultas Programadas
            </h3>
          </div>
          <div className="p-6.5">
            <div className="mb-4.5">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-8 w-8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                  />
                </svg>
              </div>
              <p className="mb-5 text-black dark:text-white">
                Registro de pacientes para consultas programadas con especialistas. Utilice esta opción para agendar citas médicas regulares.
              </p>
              <ul className="mb-6 list-disc pl-6 text-sm text-gray-600 dark:text-gray-400">
                <li className="mb-1">Consultas con especialistas</li>
                <li className="mb-1">Seguimiento de tratamientos</li>
                <li className="mb-1">Chequeos médicos rutinarios</li>
              </ul>
              <Link href="/registro/consultas">
                <button className="flex w-full justify-center rounded bg-primary p-3 font-medium text-white transition-all hover:bg-primary/90">
                  Ir a Consultas
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Emergencia Card */}
        <div className="rounded-sm border border-stroke bg-white shadow-default transition-all hover:shadow-lg dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              Atención de Emergencia
            </h3>
          </div>
          <div className="p-6.5">
            <div className="mb-4.5">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-danger/10 text-danger">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-8 w-8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                  />
                </svg>
              </div>
              <p className="mb-5 text-black dark:text-white">
                Registro de pacientes que requieren atención médica inmediata. Utilice esta opción para casos urgentes.
              </p>
              <ul className="mb-6 list-disc pl-6 text-sm text-gray-600 dark:text-gray-400">
                <li className="mb-1">Atención médica inmediata</li>
                <li className="mb-1">Casos de urgencia</li>
                <li className="mb-1">Situaciones que requieren intervención rápida</li>
              </ul>
              <Link href="/registro/emergencia">
                <button className="flex w-full justify-center rounded bg-danger p-3 font-medium text-white transition-all hover:bg-danger/90">
                  Ir a Emergencias
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

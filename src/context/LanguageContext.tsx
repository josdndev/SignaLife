'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  es: {
    "pacientes.title": "Lista de Pacientes",
    "pacientes.searchPlaceholder": "Buscar por nombre o cédula...",
    "pacientes.noPacientes": "No se encontraron pacientes",
    "pacientes.noPacientesMessage": "No hay pacientes que coincidan con tu búsqueda.",
    "pacientes.noPacientesMessage2": "No hay pacientes registrados.",
    "pacientes.loading": "Cargando pacientes...",
    "pacientes.error": "Error al cargar pacientes",
    "pacientes.id": "ID",
    "pacientes.personalInfo": "Información Personal",
    "pacientes.contact": "Contacto",
    "pacientes.medicalDetails": "Detalles Médicos",
    "pacientes.status": "Estado",
    "pacientes.active": "Activo",
    "doctores.title": "Lista de Doctores",
    "doctores.searchPlaceholder": "Buscar por nombre o email...",
    "doctores.noDoctores": "No se encontraron doctores",
    "doctores.noDoctoresMessage": "No hay doctores registrados.",
    "doctores.loading": "Cargando doctores...",
    "doctores.error": "Error al cargar doctores",
    "doctores.id": "ID",
    "doctores.name": "Nombre",
    "doctores.email": "Email",
    "doctores.specialty": "Especialidad",
    "visitas.title": "Lista de Visitas",
    "visitas.searchPlaceholder": "Buscar por ID de historia o evaluación...",
    "visitas.noVisitas": "No se encontraron visitas",
    "visitas.noVisitasMessage": "No hay visitas registradas.",
    "visitas.loading": "Cargando visitas...",
    "visitas.error": "Error al cargar visitas",
    "visitas.id": "ID",
    "visitas.historyId": "ID Historia",
    "visitas.entryTime": "Hora Entrada",
    "visitas.evaluation": "Evaluación",
    "visitas.specialty": "Especialidad",
    "visitas.visitNumber": "N° Visita",
    "diagnosticos.title": "Lista de Diagnósticos",
    "diagnosticos.searchPlaceholder": "Buscar por diagnóstico o resultado...",
    "diagnosticos.noDiagnosticos": "No se encontraron diagnósticos",
    "diagnosticos.noDiagnosticosMessage": "No hay diagnósticos registrados.",
    "diagnosticos.loading": "Cargando diagnósticos...",
    "diagnosticos.error": "Error al cargar diagnósticos",
    "diagnosticos.id": "ID",
    "diagnosticos.visitId": "ID Visita",
    "diagnosticos.diagnosis": "Diagnóstico",
    "diagnosticos.rppgResult": "Resultado RPPG"
  },
  en: {
    "pacientes.title": "Patient List",
    "pacientes.searchPlaceholder": "Search by name or ID...",
    "pacientes.noPacientes": "No patients found",
    "pacientes.noPacientesMessage": "No patients match your search.",
    "pacientes.noPacientesMessage2": "No patients registered.",
    "pacientes.loading": "Loading patients...",
    "pacientes.error": "Error loading patients",
    "pacientes.id": "ID",
    "pacientes.personalInfo": "Personal Information",
    "pacientes.contact": "Contact",
    "pacientes.medicalDetails": "Medical Details",
    "pacientes.status": "Status",
    "pacientes.active": "Active",
    "doctores.title": "Doctors List",
    "doctores.searchPlaceholder": "Search by name or email...",
    "doctores.noDoctores": "No doctors found",
    "doctores.noDoctoresMessage": "No doctors registered.",
    "doctores.loading": "Loading doctors...",
    "doctores.error": "Error loading doctors",
    "doctores.id": "ID",
    "doctores.name": "Name",
    "doctores.email": "Email",
    "doctores.specialty": "Specialty",
    "visitas.title": "Visits List",
    "visitas.searchPlaceholder": "Search by history ID or evaluation...",
    "visitas.noVisitas": "No visits found",
    "visitas.noVisitasMessage": "No visits registered.",
    "visitas.loading": "Loading visits...",
    "visitas.error": "Error loading visits",
    "visitas.id": "ID",
    "visitas.historyId": "History ID",
    "visitas.entryTime": "Entry Time",
    "visitas.evaluation": "Evaluation",
    "visitas.specialty": "Specialty",
    "visitas.visitNumber": "Visit Number",
    "diagnosticos.title": "Diagnoses List",
    "diagnosticos.searchPlaceholder": "Search by diagnosis or result...",
    "diagnosticos.noDiagnosticos": "No diagnoses found",
    "diagnosticos.noDiagnosticosMessage": "No diagnoses registered.",
    "diagnosticos.loading": "Loading diagnoses...",
    "diagnosticos.error": "Error loading diagnoses",
    "diagnosticos.id": "ID",
    "diagnosticos.visitId": "Visit ID",
    "diagnosticos.diagnosis": "Diagnosis",
    "diagnosticos.rppgResult": "RPPG Result"
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('es');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

import {
  getDiagnosticos,
  getDoctores,
  getHistorias,
  getPacientes,
  getVisitas,
  type Diagnostico,
  type Doctor,
  type HistoriaClinica,
  type Paciente,
  type Visita,
} from "@/functions/api";

export type HistoriaWithPaciente = HistoriaClinica & {
  paciente?: Paciente;
};

export type VisitaEnriched = Visita & {
  historia?: HistoriaClinica;
  paciente?: Paciente;
  doctor?: Doctor;
  diagnostico?: Diagnostico;
};

export type PacienteEnriched = Paciente & {
  historias: HistoriaClinica[];
  visitas: VisitaEnriched[];
  ultimaVisita?: VisitaEnriched;
};

export type DoctorEnriched = Doctor & {
  visitas: VisitaEnriched[];
  totalPacientes: number;
};

export async function getClinicalData() {
  const [pacientes, historias, visitas, doctores, diagnosticos] = await Promise.all([
    getPacientes(),
    getHistorias(),
    getVisitas(),
    getDoctores(),
    getDiagnosticos(),
  ]);

  const historiasById = new Map<number, HistoriaClinica>();
  const historiasByPacienteId = new Map<number, HistoriaClinica[]>();

  historias.forEach((historia) => {
    if (historia.id == null) return;
    historiasById.set(historia.id, historia);

    const bucket = historiasByPacienteId.get(historia.paciente_id) ?? [];
    bucket.push(historia);
    historiasByPacienteId.set(historia.paciente_id, bucket);
  });

  const pacientesById = new Map<number, Paciente>();
  pacientes.forEach((paciente) => {
    if (paciente.id != null) {
      pacientesById.set(paciente.id, paciente);
    }
  });

  const diagnosticosByVisitaId = new Map<number, Diagnostico>();
  diagnosticos.forEach((diagnostico) => {
    if (diagnostico.visita_id != null) {
      diagnosticosByVisitaId.set(diagnostico.visita_id, diagnostico);
    }
  });

  const visitasEnriched: VisitaEnriched[] = visitas.map((visita) => {
    const historia = historiasById.get(visita.historia_id);
    const paciente = historia ? pacientesById.get(historia.paciente_id) : undefined;
    const doctor = doctores.find((candidate) => candidate.especialidad === visita.especialidad);

    return {
      ...visita,
      historia,
      paciente,
      doctor,
      diagnostico: visita.id != null ? diagnosticosByVisitaId.get(visita.id) : undefined,
    };
  });

  const historiasConPaciente: HistoriaWithPaciente[] = historias.map((historia) => ({
    ...historia,
    paciente: pacientesById.get(historia.paciente_id),
  }));

  const pacientesEnriched: PacienteEnriched[] = pacientes.map((paciente) => {
    const historiasPaciente = historiasByPacienteId.get(paciente.id ?? -1) ?? [];
    const visitasPaciente = visitasEnriched
      .filter((visita) => visita.paciente?.id === paciente.id)
      .sort((a, b) => {
        const left = new Date(a.hora_entrada).getTime();
        const right = new Date(b.hora_entrada).getTime();
        return right - left;
      });

    return {
      ...paciente,
      historias: historiasPaciente,
      visitas: visitasPaciente,
      ultimaVisita: visitasPaciente[0],
    };
  });

  const doctoresEnriched: DoctorEnriched[] = doctores.map((doctor) => {
    const visitasDoctor = visitasEnriched.filter(
      (visita) => visita.especialidad === doctor.especialidad
    );
    const pacienteIds = new Set(
      visitasDoctor
        .map((visita) => visita.paciente?.id)
        .filter((id): id is number => typeof id === "number")
    );

    return {
      ...doctor,
      visitas: visitasDoctor,
      totalPacientes: pacienteIds.size,
    };
  });

  return {
    pacientes,
    historias,
    visitas,
    doctores,
    diagnosticos,
    historiasConPaciente,
    visitasEnriched,
    pacientesEnriched,
    doctoresEnriched,
  };
}

export function formatDate(value?: string) {
  if (!value) return "Sin fecha";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-VE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function getTriageClasses(status?: string) {
  switch ((status ?? "").toLowerCase()) {
    case "rojo":
    case "crítico":
      return "bg-red-100 text-red-700 ring-red-200";
    case "naranja":
    case "urgente":
      return "bg-orange-100 text-orange-700 ring-orange-200";
    case "amarillo":
      return "bg-amber-100 text-amber-700 ring-amber-200";
    case "verde":
    case "estable":
      return "bg-emerald-100 text-emerald-700 ring-emerald-200";
    case "azul":
    case "leve":
      return "bg-sky-100 text-sky-700 ring-sky-200";
    default:
      return "bg-slate-100 text-slate-700 ring-slate-200";
  }
}

export type RiskLevel = "bajo" | "moderado" | "alto" | "critico";

export type PatientIntake = {
  nombre: string;
  cedula: string;
  edad: number | "";
  sexo: string;
  motivoConsulta: string;
  antecedentes: string;
  alergias: string;
};

export type QuestionAnswer = {
  id: string;
  question: string;
  answer: string;
};

export type SignalPoint = {
  timestamp: number;
  r: number;
  g: number;
  b: number;
};

export type VitalSigns = {
  bpm: number | null;
  respiratoryRate: number | null;
  hrvSdnn: number | null;
  hrvRmssd: number | null;
  spo2: number | null;
  stressIndex: number | null;
  signalQuality: number;
  confidence: number;
};

export type VisualAssessment = {
  brightness: number;
  contrast: number;
  motionScore: number;
  faceDetected: boolean;
  summary: string;
};

export type TriageSummary = {
  patient: {
    nombre: string;
    edad: number | null;
    sexo: string;
  };
  chiefComplaint: string;
  symptoms: string[];
  allergies: string[];
  conditions: string[];
  redFlags: string[];
  riskLevel: RiskLevel;
  specialty: string;
  summary: string;
  recommendations: string[];
};

export type FusedClinicalResult = {
  vitals: VitalSigns;
  interview: TriageSummary;
  visual: VisualAssessment;
  notes: string[];
};

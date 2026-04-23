import type {
  FusedClinicalResult,
  PatientIntake,
  QuestionAnswer,
  RiskLevel,
  TriageSummary,
  VisualAssessment,
  VitalSigns,
} from "./types";

export const TRIAGE_QUESTIONS = [
  "¿Tiene dolor en el pecho?",
  "¿Tiene dificultad para respirar?",
  "¿Presenta fiebre o escalofríos?",
  "¿Ha tenido desmayos, confusión o debilidad importante?",
  "¿Padece hipertensión, diabetes o cardiopatías?",
  "¿Está tomando algún medicamento actualmente?",
];

function splitList(value: string) {
  return value
    .split(/[,\n;]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function inferSymptoms(intake: PatientIntake, answers: QuestionAnswer[]) {
  const symptoms = splitList(intake.motivoConsulta);

  answers.forEach((answer) => {
    if (!answer.answer.trim()) return;
    symptoms.push(`${answer.question} ${answer.answer}`);
  });

  return symptoms;
}

function inferRisk(vitals: VitalSigns, intake: PatientIntake, answers: QuestionAnswer[]): RiskLevel {
  const normalizedAnswers = answers.map((answer) => answer.answer.toLowerCase());

  const hasRedFlagAnswer = normalizedAnswers.some((answer) =>
    /(si|sí|intenso|severo|grave|urgente)/.test(answer)
  );

  if (hasRedFlagAnswer && /(pecho|respirar|desmayo|confusi)/i.test(normalizedAnswers.join(" "))) {
    return "critico";
  }

  if (
    (vitals.bpm != null && (vitals.bpm > 120 || vitals.bpm < 50)) ||
    (vitals.respiratoryRate != null && vitals.respiratoryRate > 24) ||
    (vitals.spo2 != null && vitals.spo2 < 92)
  ) {
    return "alto";
  }

  if (hasRedFlagAnswer || /(dolor|mareo|fatiga|palpit)/i.test(intake.motivoConsulta)) {
    return "moderado";
  }

  return "bajo";
}

function inferSpecialty(intake: PatientIntake, answers: QuestionAnswer[]) {
  const corpus = [intake.motivoConsulta, ...answers.map((answer) => answer.answer)].join(" ").toLowerCase();

  if (/(pecho|palpit|presion|hipert|card)/.test(corpus)) return "Cardiología";
  if (/(dolor|fract|trauma|golpe)/.test(corpus)) return "Traumatología";
  if (/(respirar|fiebre|tos)/.test(corpus)) return "Medicina General";
  if (/(cefalea|mareo|desmayo|neurol)/.test(corpus)) return "Neurología";
  return "Medicina General";
}

export function buildLocalTriageSummary(
  intake: PatientIntake,
  answers: QuestionAnswer[],
  vitals: VitalSigns
): TriageSummary {
  const conditions = splitList(intake.antecedentes);
  const allergies = splitList(intake.alergias);
  const symptoms = inferSymptoms(intake, answers);
  const riskLevel = inferRisk(vitals, intake, answers);
  const specialty = inferSpecialty(intake, answers);

  const redFlags = answers
    .filter((answer) => /(si|sí|grave|severo|intenso)/i.test(answer.answer))
    .map((answer) => answer.question);

  const recommendations = [
    riskLevel === "critico"
      ? "Priorizar evaluación médica inmediata."
      : riskLevel === "alto"
        ? "Valorar por médico en el menor tiempo posible."
        : "Continuar con evaluación clínica y correlación con examen físico.",
    vitals.signalQuality < 45
      ? "Repetir medición con mejor iluminación y menor movimiento."
      : "La calidad de señal es aceptable para un uso orientativo.",
  ];

  return {
    patient: {
      nombre: intake.nombre,
      edad: typeof intake.edad === "number" ? intake.edad : null,
      sexo: intake.sexo,
    },
    chiefComplaint: intake.motivoConsulta.trim(),
    symptoms,
    allergies,
    conditions,
    redFlags,
    riskLevel,
    specialty,
    summary: `Paciente ${intake.nombre || "sin identificar"} con motivo de consulta "${intake.motivoConsulta || "no especificado"}". Riesgo ${riskLevel}. Especialidad sugerida: ${specialty}.`,
    recommendations,
  };
}

function fallbackVisualSummary(visual: VisualAssessment) {
  const notes: string[] = [];

  if (!visual.faceDetected) {
    notes.push("No se detectó rostro de forma consistente.");
  } else {
    notes.push("El rostro se mantuvo visible durante la captura.");
  }

  if (visual.brightness < 70) {
    notes.push("La iluminación parece baja.");
  } else if (visual.brightness > 190) {
    notes.push("La escena está muy iluminada.");
  } else {
    notes.push("La iluminación es adecuada.");
  }

  if (visual.motionScore > 20) {
    notes.push("Se observó movimiento relevante durante la toma.");
  } else {
    notes.push("La estabilidad del video fue aceptable.");
  }

  return notes.join(" ");
}

export async function generateVisualAssessment(
  frameDataUrl: string | null,
  intake: PatientIntake,
  fallback: Omit<VisualAssessment, "summary">
): Promise<VisualAssessment> {
  const apiKey = typeof window !== "undefined" ? window.localStorage.getItem("gemini_api_key") : null;

  if (!apiKey || !frameDataUrl) {
    return {
      ...fallback,
      summary: fallbackVisualSummary({
        ...fallback,
        summary: "",
      }),
    };
  }

  try {
    const base64Data = frameDataUrl.split(",")[1];
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Describe de forma breve y clínica la apariencia general del paciente para un flujo de triage. Nombre: ${intake.nombre || "No indicado"}, edad: ${intake.edad || "No indicada"}, motivo: ${intake.motivoConsulta || "No indicado"}. No diagnostiques, solo observaciones visuales prudentes.`,
                },
                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: base64Data,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Gemini visual request failed");
    }

    const data = await response.json();
    const summary =
      data?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text).join(" ").trim() ||
      fallbackVisualSummary({ ...fallback, summary: "" });

    return {
      ...fallback,
      summary,
    };
  } catch (error) {
    console.error(error);
    return {
      ...fallback,
      summary: fallbackVisualSummary({ ...fallback, summary: "" }),
    };
  }
}

export async function generateClinicalSummary(
  intake: PatientIntake,
  answers: QuestionAnswer[],
  vitals: VitalSigns
): Promise<TriageSummary> {
  const fallback = buildLocalTriageSummary(intake, answers, vitals);
  const apiKey = typeof window !== "undefined" ? window.localStorage.getItem("gemini_api_key") : null;

  if (!apiKey) {
    return fallback;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Eres un asistente de triage. Devuelve exclusivamente JSON válido con esta estructura:
{
  "patient": {"nombre": "string", "edad": 0, "sexo": "string"},
  "chiefComplaint": "string",
  "symptoms": ["string"],
  "allergies": ["string"],
  "conditions": ["string"],
  "redFlags": ["string"],
  "riskLevel": "bajo|moderado|alto|critico",
  "specialty": "string",
  "summary": "string",
  "recommendations": ["string"]
}

Datos del paciente: ${JSON.stringify(intake)}
Respuestas: ${JSON.stringify(answers)}
Signos vitales estimados: ${JSON.stringify(vitals)}
No inventes laboratorios ni diagnósticos definitivos.`,
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Gemini clinical request failed");
    }

    const data = await response.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw) as TriageSummary;
    return {
      ...fallback,
      ...parsed,
    };
  } catch (error) {
    console.error(error);
    return fallback;
  }
}

export function fuseClinicalResults(
  vitals: VitalSigns,
  interview: TriageSummary,
  visual: VisualAssessment
): FusedClinicalResult {
  const notes: string[] = [];

  if (vitals.spo2 != null && vitals.spo2 < 92) {
    notes.push("La saturación estimada está por debajo del rango esperado.");
  }
  if (vitals.bpm != null && vitals.bpm > 120) {
    notes.push("La frecuencia cardíaca estimada es alta.");
  }
  if (interview.redFlags.length > 0) {
    notes.push(`Se reportaron signos de alarma: ${interview.redFlags.join(", ")}.`);
  }
  if (visual.motionScore > 20) {
    notes.push("El análisis visual detectó movimiento relevante, lo que puede degradar la señal.");
  }

  return {
    vitals,
    interview,
    visual,
    notes,
  };
}

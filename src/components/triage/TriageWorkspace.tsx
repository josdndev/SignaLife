"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  createDiagnostico,
  createHistoria,
  createPaciente,
  createVisita,
  sendRPPGApi,
} from "@/functions/api";
import { registerEmergencyVisit } from "@/lib/emergencyBoard";
import {
  TRIAGE_QUESTIONS,
  fuseClinicalResults,
  generateClinicalSummary,
  generateVisualAssessment,
} from "@/lib/triage/interview";
import { getSpeechRecognition, type SpeechRecognitionEventLike } from "@/lib/triage/browser";
import { analyzeSignal } from "@/lib/triage/signal";
import type {
  FusedClinicalResult,
  PatientIntake,
  QuestionAnswer,
  SignalPoint,
  VisualAssessment,
  VitalSigns,
} from "@/lib/triage/types";

const SAMPLE_RATE = 12;
const DURATION_SECONDS = 30;
const GEMINI_STORAGE_KEY = "gemini_api_key";

const initialIntake: PatientIntake = {
  nombre: "",
  cedula: "",
  edad: "",
  sexo: "No especificado",
  motivoConsulta: "",
  antecedentes: "",
  alergias: "",
};

type FrameTelemetry = {
  brightness: number[];
  contrast: number[];
  motion: number[];
  faceDetections: number;
};

function mean(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function riskToTriageColor(risk: FusedClinicalResult["interview"]["riskLevel"]) {
  switch (risk) {
    case "critico":
      return "bg-red-100 text-red-700 ring-red-200";
    case "alto":
      return "bg-orange-100 text-orange-700 ring-orange-200";
    case "moderado":
      return "bg-amber-100 text-amber-700 ring-amber-200";
    default:
      return "bg-emerald-100 text-emerald-700 ring-emerald-200";
  }
}

function buildVisualFallback(frameTelemetry: FrameTelemetry): Omit<VisualAssessment, "summary"> {
  return {
    brightness: mean(frameTelemetry.brightness),
    contrast: mean(frameTelemetry.contrast),
    motionScore: mean(frameTelemetry.motion),
    faceDetected: frameTelemetry.faceDetections > 0,
  };
}

function mergeVitals(localVitals: VitalSigns, remoteResult: any): VitalSigns {
  return {
    ...localVitals,
    bpm: remoteResult?.hr?.[0] ? Math.round(remoteResult.hr[0]) : localVitals.bpm,
    respiratoryRate: remoteResult?.respiratory_rate
      ? Math.round(remoteResult.respiratory_rate)
      : localVitals.respiratoryRate,
    hrvSdnn: remoteResult?.hrv ? Math.round(remoteResult.hrv * 10) / 10 : localVitals.hrvSdnn,
    confidence: Math.max(localVitals.confidence, remoteResult ? 0.74 : localVitals.confidence),
  };
}

function progressCopy(progress: number, isCapturing: boolean) {
  if (!isCapturing) return "Listo para iniciar una nueva captura.";
  if (progress < 20) return "Estabilizando iluminación y encuadre facial.";
  if (progress < 55) return "Muestreando señal cromática y evaluando calidad.";
  if (progress < 85) return "Consolidando biometría y completando ventana temporal.";
  return "Cerrando captura y preparando fusión clínica.";
}

export default function TriageWorkspace() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<number | null>(null);
  const frameRef = useRef<string | null>(null);
  const lastPointRef = useRef<SignalPoint | null>(null);
  const frameTelemetryRef = useRef<FrameTelemetry>({
    brightness: [],
    contrast: [],
    motion: [],
    faceDetections: 0,
  });

  const [intake, setIntake] = useState<PatientIntake>(initialIntake);
  const [answers, setAnswers] = useState<QuestionAnswer[]>(
    TRIAGE_QUESTIONS.map((question, index) => ({
      id: `q-${index + 1}`,
      question,
      answer: "",
    }))
  );
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [transcriptDraft, setTranscriptDraft] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [cameraReady, setCameraReady] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [signalPoints, setSignalPoints] = useState<SignalPoint[]>([]);
  const [vitals, setVitals] = useState<VitalSigns | null>(null);
  const [visual, setVisual] = useState<VisualAssessment | null>(null);
  const [fusedResult, setFusedResult] = useState<FusedClinicalResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(
    "Complete la ficha, prepare al paciente y ejecute una captura estable de 30 segundos."
  );
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [selectedTriageColor, setSelectedTriageColor] = useState("Verde");

  const currentQuestion = answers[activeQuestion];
  const speechRecognitionCtor = useMemo(() => getSpeechRecognition(), []);

  const answeredCount = answers.filter((answer) => answer.answer.trim()).length;
  const interviewProgress = Math.round((answeredCount / answers.length) * 100);
  const intakeComplete =
    !!intake.nombre.trim() &&
    !!intake.cedula.trim() &&
    typeof intake.edad === "number" &&
    !!intake.motivoConsulta.trim();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedKey = window.localStorage.getItem(GEMINI_STORAGE_KEY) ?? "";
    setGeminiKey(storedKey);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (geminiKey.trim()) {
      window.localStorage.setItem(GEMINI_STORAGE_KEY, geminiKey.trim());
    } else {
      window.localStorage.removeItem(GEMINI_STORAGE_KEY);
    }
  }, [geminiKey]);

  function cleanupCapture() {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.warn('[TriageWorkspace] Error stopping recorder:', e);
      }
      mediaRecorderRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
    setCapturing(false);
  }

  useEffect(() => {
    return () => {
      cleanupCapture();
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    if (!capturing) {
      setStatus(progressCopy(progress, false));
    }
  }, [capturing, progress]);

  async function ensureCamera() {
    if (streamRef.current && videoRef.current && videoRef.current.videoWidth > 0) {
      console.log('[TriageWorkspace] Camera stream already available and ready');
      setCameraReady(true);
      return streamRef.current;
    }

    cleanupCapture();
    console.log('[TriageWorkspace] Requesting camera permissions...');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 960 },
          height: { ideal: 540 },
          facingMode: "user",
        },
        audio: false,
      });
      console.log('[TriageWorkspace] Camera permissions granted, stream obtained:', stream.id);

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        console.log('[TriageWorkspace] Video element connected to stream and playing');
        
        await new Promise<void>((resolve) => {
          const checkVideo = () => {
            if (videoRef.current && videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
              console.log('[TriageWorkspace] Video ready with dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
              resolve();
            } else {
              setTimeout(checkVideo, 100);
            }
          };
          checkVideo();
        });
      }

      setCameraReady(true);
      return stream;
    } catch (err) {
      console.error('[TriageWorkspace] Failed to access camera:', err);
      throw err;
    }
  }

  async function detectFaceBox(video: HTMLVideoElement) {
    if (window.FaceDetector) {
      try {
        const detector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
        const faces = await detector.detect(video);
        if (faces[0]?.boundingBox) {
          frameTelemetryRef.current.faceDetections += 1;
          console.log('[TriageWorkspace] Face detected:', faces[0].boundingBox);
          return faces[0].boundingBox;
        }
      } catch (faceError) {
        console.warn("[TriageWorkspace] Face detection failed, using fallback ROI:", faceError);
      }
    }

    // Fallback to fixed ROI if FaceDetector is not available or fails
    const width = video.videoWidth;
    const height = video.videoHeight;
    console.log('[TriageWorkspace] Using fallback ROI for face detection');
    return new DOMRect(width * 0.28, height * 0.18, width * 0.44, height * 0.56);
  }

  async function sampleFrame(timestamp: number) {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) {
      console.warn("[TriageWorkspace] Video or canvas not ready", { 
        hasVideo: !!video, 
        hasCanvas: !!canvas
      });
      return null;
    }

    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      console.warn("[TriageWorkspace] Video not ready for frame sampling", { 
        readyState: video.readyState,
        videoWidth: video.videoWidth, 
        videoHeight: video.videoHeight 
      });
      return null;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;

    try {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    } catch (drawError) {
      console.warn("[TriageWorkspace] Error drawing video frame:", drawError);
      return null;
    }

    const faceBox = await detectFaceBox(video);
    const roiX = Math.max(0, Math.floor(faceBox.x + faceBox.width * 0.2));
    const roiY = Math.max(0, Math.floor(faceBox.y + faceBox.height * 0.12));
    const roiWidth = Math.max(10, Math.floor(faceBox.width * 0.6));
    const roiHeight = Math.max(10, Math.floor(faceBox.height * 0.18));

    let imageData: ImageData;
    try {
      imageData = ctx.getImageData(roiX, roiY, roiWidth, roiHeight);
    } catch (imgError) {
      console.warn("[TriageWorkspace] Error getting image data:", imgError);
      return null;
    }
    
    const data = imageData.data;
    const reds: number[] = [];
    const greens: number[] = [];
    const blues: number[] = [];

    for (let index = 0; index < data.length; index += 4) {
      reds.push(data[index]);
      greens.push(data[index + 1]);
      blues.push(data[index + 2]);
    }

    const point: SignalPoint = {
      timestamp,
      r: mean(reds),
      g: mean(greens),
      b: mean(blues),
    };

    const previousPoint = lastPointRef.current;
    const motion =
      previousPoint == null ? 0 : Math.abs(point.g - previousPoint.g) + Math.abs(point.r - previousPoint.r);
    lastPointRef.current = point;

    frameTelemetryRef.current.brightness.push(mean([...reds, ...greens, ...blues]));
    frameTelemetryRef.current.contrast.push(
      Math.max(...reds, ...greens, ...blues) - Math.min(...reds, ...greens, ...blues)
    );
    frameTelemetryRef.current.motion.push(motion);

    frameRef.current = canvas.toDataURL("image/jpeg", 0.88);
    return point;
  }

  function stopRecorderAndUpload() {
    console.log('[TriageWorkspace] Stopping recorder and uploading...');
    return new Promise<any | null>((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder) {
        console.warn("[TriageWorkspace] No media recorder available");
        resolve(null);
        return;
      }

      recorder.onstop = async () => {
        if (chunksRef.current.length === 0) {
          console.warn("[TriageWorkspace] No video data recorded");
          setError("No se grabó ningún dato de video. Intente nuevamente.");
          resolve(null);
          return;
        }

        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "video/webm" });
        const formData = new FormData();
        formData.append("file", blob, "triage-recording.webm");
        console.log('[TriageWorkspace] Video blob created, size:', blob.size, 'bytes');

        try {
          console.log('[TriageWorkspace] Sending video to API...');
          const remoteResult = await sendRPPGApi(formData);
          console.log('[TriageWorkspace] API response received:', remoteResult);
          resolve(remoteResult);
        } catch (remoteError) {
          console.error("[TriageWorkspace] Error sending video:", remoteError);
          
          let errorMessage = "Error al procesar el video. ";
          
          if (remoteError instanceof Error) {
            if (remoteError.message.includes("Tiempo de espera agotado")) {
              errorMessage += "El servidor tardó demasiado en responder. Intente nuevamente.";
            } else if (remoteError.message.includes("Error de conexión")) {
              errorMessage += "No se pudo conectar con el servidor. Verifique su conexión a internet.";
            } else {
              errorMessage += remoteError.message;
            }
          } else {
            errorMessage += "Intente nuevamente.";
          }
          
          setError(errorMessage);
          resolve(null);
        }
      };

      recorder.stop();
    });
  }

  async function finalizeCapture() {
    console.log('[TriageWorkspace] Finalizing capture...');
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setCapturing(false);
    setProgress(100);
    setStatus("Consolidando biometría, entrevista y observación visual...");

    const localVitals = analyzeSignal(signalPoints, SAMPLE_RATE);
    console.log('[TriageWorkspace] Local vitals analyzed:', localVitals);
    
    // Check if we have enough data for analysis
    if (signalPoints.length < SAMPLE_RATE * 10) {
      console.warn(`[TriageWorkspace] Insufficient data for analysis: ${signalPoints.length} points (need at least ${SAMPLE_RATE * 10})`);
      setError(`Captura incompleta: solo se obtuvieron ${signalPoints.length} muestras. Se necesitan al menos ${SAMPLE_RATE * 10} para un análisis confiable.`);
    }
    
    console.log('[TriageWorkspace] Stopping recorder and uploading...');
    
    // Skip backend processing and use local analysis only
    console.log('[TriageWorkspace] Using local analysis only (skipping backend)');
    const finalVitals = localVitals;
    console.log('[TriageWorkspace] Final vitals:', finalVitals);
    setVitals(finalVitals);

    const visualAssessment = await generateVisualAssessment(
      frameRef.current,
      intake,
      buildVisualFallback(frameTelemetryRef.current)
    );
    setVisual(visualAssessment);

    const interview = await generateClinicalSummary(intake, answers, finalVitals);
    const fused = fuseClinicalResults(finalVitals, interview, visualAssessment);
    setFusedResult(fused);
    setStatus("Análisis completado. Revise la confianza, las alertas y guarde el caso si es adecuado.");
  }

  async function startCapture() {
    if (!intakeComplete) {
      setError("Complete nombre, cédula, edad y motivo de consulta antes de iniciar.");
      return;
    }

    console.log('[TriageWorkspace] Starting capture process...');
    try {
      // Ensure camera is ready before starting capture
      console.log('[TriageWorkspace] Ensuring camera is ready...');
      const stream = await ensureCamera();
      
      // Double-check video is ready
      if (!videoRef.current || videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
        console.error('[TriageWorkspace] Video not ready after ensureCamera');
        throw new Error("La cámara no está lista. Espere un momento e intente nuevamente.");
      }
      console.log('[TriageWorkspace] Camera ready, starting MediaRecorder...');
      setError("");
      setSavedMessage("");
      setSignalPoints([]);
      setVitals(null);
      setVisual(null);
      setFusedResult(null);
      setProgress(0);
      setStatus("Preparando cámara y calibrando condiciones de captura...");
      frameRef.current = null;
      lastPointRef.current = null;
      frameTelemetryRef.current = {
        brightness: [],
        contrast: [],
        motion: [],
        faceDetections: 0,
      };

      chunksRef.current = [];

      // Check for supported mime types
      const mimeTypes = [
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm;codecs=vp9",
        "video/webm;codecs=vp8",
        "video/webm",
        "video/mp4",
      ];
      
      let selectedMimeType = "";
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          break;
        }
      }
      
      if (!selectedMimeType) {
        throw new Error("No supported video format found in this browser");
      }
      
      const recorder = new MediaRecorder(streamRef.current!, { mimeType: selectedMimeType });
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      recorder.start(1000); // Collect data every second
      console.log('[TriageWorkspace] MediaRecorder started with timeslice 1000ms');
      setCapturing(true);
      console.log('[TriageWorkspace] Capture started, progress tracking initiated');

      const startedAt = performance.now();
      intervalRef.current = window.setInterval(async () => {
        const elapsed = performance.now() - startedAt;
        const point = await sampleFrame(elapsed);
        if (point) {
          setSignalPoints((current) => [...current, point]);
        } else {
          // Log warning if frame sampling fails
          console.warn(`[TriageWorkspace] Frame sampling failed at ${elapsed}ms`);
        }

        const nextProgress = Math.min(
          100,
          Math.round((elapsed / (DURATION_SECONDS * 1000)) * 100)
        );
        setProgress(nextProgress);
        setStatus(progressCopy(nextProgress, true));

        if (elapsed >= DURATION_SECONDS * 1000) {
          await finalizeCapture();
        }
      }, Math.round(1000 / SAMPLE_RATE));
    } catch (captureError) {
      console.error(captureError);
      
      let errorMessage = "No fue posible iniciar la cámara. ";
      
      if (captureError instanceof Error) {
        if (captureError.name === "NotAllowedError" || captureError.name === "PermissionDeniedError") {
          errorMessage += "Permiso de cámara denegado. Por favor, permita el acceso a la cámara en la configuración del navegador.";
        } else if (captureError.name === "NotFoundError" || captureError.name === "DevicesNotFoundError") {
          errorMessage += "No se encontró una cámara. Verifique que haya una cámara conectada.";
        } else if (captureError.name === "NotReadableError" || captureError.name === "TrackStartError") {
          errorMessage += "La cámara está siendo usada por otra aplicación. Cierre otras aplicaciones que usen la cámara.";
        } else if (captureError.name === "OverconstrainedError") {
          errorMessage += "La cámara no soporta la resolución solicitada.";
        } else if (captureError.name === "TypeError") {
          errorMessage += "Error de configuración de la cámara.";
        } else {
          errorMessage += captureError.message;
        }
      } else {
        errorMessage += "Verifique permisos, iluminación y vuelva a intentar.";
      }
      
      setError(errorMessage);
      setCapturing(false);
      setCameraReady(false);
    }
  }

  function speakQuestion() {
    if (!currentQuestion) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentQuestion.question);
    utterance.lang = "es-VE";
    utterance.rate = 1;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }

  function startListening() {
    if (!speechRecognitionCtor) {
      setError("Este navegador no soporta reconocimiento de voz. Puede responder por texto.");
      return;
    }

    const recognition = new speechRecognitionCtor();
    recognition.lang = "es-VE";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join(" ")
        .trim();
      setTranscriptDraft(transcript);
      setListening(false);
    };
    recognition.onerror = (event) => {
      setListening(false);
      setError(`No se pudo capturar la voz: ${event.error}`);
    };
    recognition.start();
    setListening(true);
  }



  function saveTranscriptAnswer(answerOverride?: string) {
    if (!currentQuestion) return;

    const nextAnswer = (answerOverride ?? transcriptDraft).trim();
    if (!nextAnswer) {
      setError("Agregue una respuesta antes de avanzar.");
      return;
    }

    setAnswers((current) =>
      current.map((answer, index) =>
        index === activeQuestion ? { ...answer, answer: nextAnswer } : answer
      )
    );
    setTranscriptDraft("");
    setError("");

    if (activeQuestion < answers.length - 1) {
      setActiveQuestion((current) => current + 1);
    }
  }

  async function saveCase() {
    if (!fusedResult) return;
    if (!intakeComplete || typeof intake.edad !== "number") {
      setError("Complete la ficha clínica principal antes de guardar el caso.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const paciente = await createPaciente({
        nombre: intake.nombre,
        cedula: intake.cedula,
        edad: intake.edad,
      });
      if (typeof paciente.id !== "number") {
        throw new Error("La API no devolvió el ID del paciente.");
      }

      const historia = await createHistoria({
        paciente_id: paciente.id,
        fecha: new Date().toISOString().slice(0, 10),
      });
      if (typeof historia.id !== "number") {
        throw new Error("La API no devolvió el ID de la historia clínica.");
      }

      const triageColor = selectedTriageColor;

      const visita = await createVisita({
        historia_id: historia.id,
        hora_entrada: new Date().toISOString(),
        evaluacion_triaje: triageColor,
        prediagnostico: fusedResult.interview.summary,
        especialidad: fusedResult.interview.specialty,
        numero_visita: 1,
      });
      if (typeof visita.id !== "number") {
        throw new Error("La API no devolvió el ID de la visita.");
      }

      registerEmergencyVisit(visita.id);

      await createDiagnostico({
        visita_id: visita.id,
        diagnostico: fusedResult.interview.summary,
        resultado_rppg: fusedResult.vitals.bpm
          ? `FC ${fusedResult.vitals.bpm} BPM, FR ${fusedResult.vitals.respiratoryRate ?? "N/A"}, SpO2 ${fusedResult.vitals.spo2 ?? "N/A"}`
          : "Sin lectura confiable",
        informe_prediagnostico: [
          fusedResult.interview.summary,
          `Observación visual: ${fusedResult.visual.summary}`,
          `Confianza: ${fusedResult.vitals.confidence}`,
          ...fusedResult.notes,
        ].join(" "),
      });

      setSavedMessage("Caso guardado correctamente en pacientes, historia, visita y diagnóstico.");
    } catch (saveError) {
      console.error(saveError);
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar el caso.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(11,165,236,0.18),_transparent_32%),linear-gradient(135deg,_#f8fbff_0%,_#eef4ff_48%,_#f8fafc_100%)] p-8 shadow-sm">
        <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="inline-flex rounded-full border border-blue-200 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-blue-700 backdrop-blur">
              Triage Digital
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950">
              Un flujo clínico más serio, local y legible para capturar video, entrevistar y priorizar.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
              La experiencia ahora prioriza estabilidad de captura, control de calidad, fusión clínica prudente
              y trazabilidad visual del caso antes de guardar datos en el sistema.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <StatusCard label="Ficha clínica" value={intakeComplete ? "Completa" : "Pendiente"} tone={intakeComplete ? "success" : "warning"} />
            <StatusCard label="Cámara" value={cameraReady ? "Lista" : "No iniciada"} tone={cameraReady ? "success" : "neutral"} />
            <StatusCard label="Entrevista" value={`${interviewProgress}%`} tone={interviewProgress > 60 ? "success" : "neutral"} />
            <StatusCard label="Gemini" value={geminiKey.trim() ? "Conectado" : "Fallback local"} tone={geminiKey.trim() ? "success" : "neutral"} />
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
        <div className="space-y-6">
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Ficha del paciente</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Datos mínimos para emitir un triage legible y poder guardar el caso.
                </p>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                obligatorio
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="Nombre completo">
                <input value={intake.nombre} onChange={(e) => setIntake((current) => ({ ...current, nombre: e.target.value }))} placeholder="Ej. Ana Pérez" className={fieldClassName} />
              </Field>
              <Field label="Cédula">
                <input value={intake.cedula} onChange={(e) => setIntake((current) => ({ ...current, cedula: e.target.value }))} placeholder="Ej. 12345678" className={fieldClassName} />
              </Field>
              <Field label="Edad">
                <input type="number" value={intake.edad} onChange={(e) => setIntake((current) => ({ ...current, edad: e.target.value ? Number(e.target.value) : "" }))} placeholder="Edad" className={fieldClassName} />
              </Field>
              <Field label="Sexo">
                <select value={intake.sexo} onChange={(e) => setIntake((current) => ({ ...current, sexo: e.target.value }))} className={fieldClassName}>
                  <option>No especificado</option>
                  <option>Masculino</option>
                  <option>Femenino</option>
                  <option>Otro</option>
                </select>
              </Field>
              <Field label="Motivo de consulta" className="md:col-span-2">
                <textarea value={intake.motivoConsulta} onChange={(e) => setIntake((current) => ({ ...current, motivoConsulta: e.target.value }))} rows={3} placeholder="Describa síntomas, inicio y contexto." className={fieldClassName} />
              </Field>
              <Field label="Antecedentes" className="md:col-span-2">
                <textarea value={intake.antecedentes} onChange={(e) => setIntake((current) => ({ ...current, antecedentes: e.target.value }))} rows={3} placeholder="Hipertensión, diabetes, cardiopatías, cirugías..." className={fieldClassName} />
              </Field>
              <Field label="Alergias" className="md:col-span-2">
                <textarea value={intake.alergias} onChange={(e) => setIntake((current) => ({ ...current, alergias: e.target.value }))} rows={2} placeholder="Medicamentos o sustancias relevantes." className={fieldClassName} />
              </Field>
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Captura biométrica</h2>
                <p className="mt-1 text-sm text-slate-500">
                  ROI facial con fallback local, muestreo a {SAMPLE_RATE} FPS y ventana de {DURATION_SECONDS} segundos.
                </p>
              </div>
               <button
                 onClick={startCapture}
                 disabled={capturing}
                 className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
               >
                 {capturing ? "Capturando..." : "Iniciar captura"}
               </button>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <div>
                <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-950">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="aspect-video w-full object-cover"
                    width={960}
                    height={540}
                  />
                </div>
                <canvas ref={canvasRef} width={960} height={540} className="hidden" />

                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <span>Progreso de adquisición</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-[linear-gradient(90deg,_#0ba5ec,_#465fff)] transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{status}</p>
                </div>
              </div>

              <div className="grid gap-4">
                <MetricPanel label="Muestras útiles" value={String(signalPoints.length)} helper="Frames promediados en la ROI." />
                <MetricPanel label="Calidad de señal" value={`${vitals?.signalQuality ?? 0}%`} helper="Basada en dominancia espectral y estabilidad." />
                <MetricPanel label="Confianza" value={String(vitals?.confidence ?? 0)} helper="Cuanto mayor, más defendible es la lectura." />
                <MetricPanel label="Estado de captura" value={capturing ? "En curso" : cameraReady ? "Preparada" : "Pendiente"} helper="Revise iluminación frontal y poco movimiento." />
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Asistente de triage</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Responda por voz o texto y avance con confirmación explícita.
                </p>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                {interviewProgress}% completado
              </div>
            </div>

            {currentQuestion && (
              <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Pregunta {activeQuestion + 1} de {answers.length}
                </p>
                <h3 className="mt-3 text-lg font-semibold text-slate-950">{currentQuestion.question}</h3>

                <textarea
                  value={transcriptDraft}
                  onChange={(e) => setTranscriptDraft(e.target.value)}
                  rows={4}
                  placeholder="Escriba la respuesta del paciente o utilice el micrófono."
                  className={`${fieldClassName} mt-4`}
                />

                <div className="mt-4 flex flex-wrap gap-2">
                  {["Sí", "No", "Leve", "Moderado", "Severo"].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => saveTranscriptAnswer(preset)}
                      className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button onClick={speakQuestion} className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-white">
                    {speaking ? "Leyendo..." : "Leer pregunta"}
                  </button>
                  <button onClick={startListening} className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-white">
                    {listening ? "Escuchando..." : "Capturar voz"}
                  </button>
                  <button onClick={() => saveTranscriptAnswer()} className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
                    Confirmar respuesta
                  </button>
                  <button
                    onClick={() => activeQuestion > 0 && setActiveQuestion((current) => current - 1)}
                    className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-white"
                  >
                    Anterior
                  </button>
                </div>
              </div>
            )}

            <div className="mt-5 space-y-3">
              {answers.map((answer, index) => (
                <div key={answer.id} className="rounded-2xl border border-slate-200 px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-slate-900">
                      {index + 1}. {answer.question}
                    </p>
                    <button
                      onClick={() => setActiveQuestion(index)}
                      className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600"
                    >
                      editar
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{answer.answer || "Sin respuesta registrada"}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">Configuración clínica</h2>
            <p className="mt-1 text-sm text-slate-500">
              Puede operar solo con fallback local o añadir una clave para enriquecer los resúmenes con Gemini.
            </p>
            <div className="mt-5">
              <Field label="Clave Gemini opcional">
                <input
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="Se guarda localmente en este navegador"
                  className={fieldClassName}
                />
              </Field>
              <p className="mt-3 text-xs leading-6 text-slate-500">
                Sin clave, el sistema sigue funcionando con clasificación local, observación visual prudente
                y recomendaciones basadas en reglas.
              </p>
            </div>
          </section>
        </div>
      </div>

      {(vitals || fusedResult) && (
        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">Dashboard clínico integrado</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                Este tablero cruza biometría, entrevista y observación visual para producir una lectura más prudente
                y defendible del caso.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-700">Color de Triaje:</label>
                <select
                  value={selectedTriageColor}
                  onChange={(e) => setSelectedTriageColor(e.target.value)}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold"
                >
                  <option value="Verde">Verde</option>
                  <option value="Amarillo">Amarillo</option>
                  <option value="Naranja">Naranja</option>
                  <option value="Rojo">Rojo</option>
                </select>
              </div>
              <button
                onClick={saveCase}
                disabled={!fusedResult || saving}
                className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Guardar caso"}
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricPanel label="Frecuencia cardíaca" value={vitals?.bpm ? `${vitals.bpm} BPM` : "N/A"} helper="Medición local orientativa." />
            <MetricPanel label="Frecuencia respiratoria" value={vitals?.respiratoryRate ? `${vitals.respiratoryRate} rpm` : "N/A"} helper="Estimación basada en modulación espectral." />
            <MetricPanel label="HRV (SDNN / RMSSD)" value={vitals ? `${vitals.hrvSdnn ?? "N/A"} / ${vitals.hrvRmssd ?? "N/A"}` : "N/A"} helper="Variabilidad entre latidos detectados." />
            <MetricPanel label="SpO₂ / Estrés" value={vitals ? `${vitals.spo2 ?? "N/A"}% / ${vitals.stressIndex ?? "N/A"}` : "N/A"} helper="Proxy no validado clínicamente." />
          </div>

          {fusedResult && (
            <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-[28px] bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-slate-950">Ficha de triage</h3>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ${riskToTriageColor(fusedResult.interview.riskLevel)}`}>
                    {fusedResult.interview.riskLevel}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-700">{fusedResult.interview.summary}</p>
                <DetailList title="Síntomas" items={fusedResult.interview.symptoms} />
                <DetailList title="Signos de alarma" items={fusedResult.interview.redFlags} emptyLabel="Sin red flags explícitos." />
                <DetailList title="Recomendaciones" items={fusedResult.interview.recommendations} />
              </div>

              <div className="space-y-4 rounded-[28px] bg-slate-50 p-5">
                <h3 className="text-lg font-semibold text-slate-950">Observación visual y control de calidad</h3>
                <p className="text-sm leading-7 text-slate-700">{fusedResult.visual.summary}</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <MetricPanel label="Brillo" value={String(Math.round(fusedResult.visual.brightness))} helper="Valor medio de la escena." compact />
                  <MetricPanel label="Contraste" value={String(Math.round(fusedResult.visual.contrast))} helper="Separación tonal útil." compact />
                  <MetricPanel label="Movimiento" value={String(Math.round(fusedResult.visual.motionScore))} helper="Movimiento relativo estimado." compact />
                  <MetricPanel label="Especialidad sugerida" value={fusedResult.interview.specialty} helper="A partir de motivo y respuestas." compact />
                </div>
                <DetailList title="Notas de integración" items={fusedResult.notes} emptyLabel="Sin alertas adicionales." />
              </div>
            </div>
          )}
        </section>
      )}

      {(error || savedMessage) && (
        <div className="space-y-3">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {savedMessage && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {savedMessage}
            </div>
          )}
        </div>
      )}

      <p className="px-2 text-xs leading-6 text-slate-500">
        Herramienta de apoyo tecnológico. No sustituye juicio médico, examen físico, ni dispositivos clínicos validados.
      </p>
    </div>
  );
}

const fieldClassName =
  "w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function StatusCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "success" | "warning" | "neutral";
}) {
  const toneClassName =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : tone === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-slate-200 bg-white/70 text-slate-700";

  return (
    <div className={`rounded-2xl border px-4 py-4 ${toneClassName}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em]">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function MetricPanel({
  label,
  value,
  helper,
  compact = false,
}: {
  label: string;
  value: string;
  helper: string;
  compact?: boolean;
}) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white ${compact ? "p-4" : "p-5"}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className={`mt-2 font-semibold text-slate-950 ${compact ? "text-xl" : "text-2xl"}`}>{value}</p>
      <p className="mt-2 text-xs leading-6 text-slate-500">{helper}</p>
    </div>
  );
}

function DetailList({
  title,
  items,
  emptyLabel = "Sin elementos",
}: {
  title: string;
  items: string[];
  emptyLabel?: string;
}) {
  return (
    <div className="mt-5">
      <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</h4>
      <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-700">
        {items.length === 0
          ? <li>{emptyLabel}</li>
          : items.map((item, index) => (
              <li key={`${title}-${index}`} className="rounded-xl bg-white px-4 py-3">
                {item}
              </li>
            ))}
      </ul>
    </div>
  );
}

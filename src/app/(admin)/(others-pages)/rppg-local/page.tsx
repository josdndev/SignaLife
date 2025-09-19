// src/app/rppg-local/page.tsx

"use client";

import React, { useRef, useState } from 'react';
import { sendRPPGApi } from '@/functions/api';

const RPPGNativePage = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }

      // Start recording for 30 seconds max (enough for rPPG analysis)
      setIsRecording(true);

      setTimeout(() => {
        stopRecording();
      }, 30000);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Error accessing camera. Please allow camera permissions.');
    }
  };

  const stopRecording = async () => {
    if (!streamRef.current) return;

    setIsRecording(false);
    setLoading(true);

    try {
      // Create a MediaRecorder
      const mediaRecorder = new MediaRecorder(streamRef.current);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const videoBlob = new Blob(chunks, { type: 'video/webm' });

        if (videoBlob.size === 0) {
          alert('Recording failed. Try again.');
          setLoading(false);
          return;
        }

        // Create a FormData to send the file
        const formData = new FormData();
        formData.append('file', videoBlob, 'recording.webm');

        try {
          const result = await sendRPPGApi(formData);
          setResults(result);
        } catch (error) {
          console.error('Error sending video:', error);
          alert('Error processing video. Please try again.');
        } finally {
          setLoading(false);
        }
      };

      // Stop the current stream and start recording
      mediaRecorder.start();
      streamRef.current.getTracks().forEach(track => track.stop());

      setTimeout(() => {
        mediaRecorder.stop();
      }, 500);
    } catch (error) {
      console.error('Error stopping recording:', error);
      setLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsRecording(false);
    setResults(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">rPPG - Análisis de Signos Vitales Local</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Camera Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Grabación de Video</h2>

          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 bg-gray-100 border rounded-lg"
            />

            {isRecording && (
              <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm">
                GRABANDO...
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={startRecording}
              disabled={isRecording}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {isRecording ? 'Grabando...' : 'Iniciar Grabación'}
            </button>

            <button
              onClick={stopCamera}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Detener Cámara
            </button>
          </div>

          <p className="text-sm text-gray-600">
            Coloque su rostro claro en la cámara durante 30 segundos para analizar frecuencia cardíaca,
            tasa respiratoria y HRV.
          </p>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Resultados del Análisis</h2>

          {loading && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800">Procesando video... Esto puede tomar unos momentos.</p>
            </div>
          )}

          {results && (
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">✅ Análisis Completado</h3>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Frecuencia Cardíaca:</span>
                  <span className="font-semibold">{results.hr?.[0]?.toFixed(1)} BPM</span>
                </div>

                <div className="flex justify-between">
                  <span>Tasa Respiratoria:</span>
                  <span className="font-semibold">{results.respiratory_rate?.toFixed(1)} resp/min</span>
                </div>

                {results.hrv && (
                  <div className="flex justify-between">
                    <span>HRV (SDNN):</span>
                    <span className="font-semibold">{results.hrv.toFixed(1)} ms</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  const dataStr = JSON.stringify(results, null, 2);
                  const blob = new Blob([dataStr], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'resultados-rppg.json';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="mt-3 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
              >
                Descargar Resultados
              </button>
            </div>
          )}

          {!loading && !results && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600">Realice una grabación para ver los resultados del análisis rPPG.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RPPGNativePage;

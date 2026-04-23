import type { SignalPoint, VitalSigns } from "./types";

function mean(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function std(values: number[]) {
  if (values.length < 2) return 0;
  const avg = mean(values);
  const variance =
    values.reduce((sum, value) => sum + (value - avg) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function movingAverage(values: number[], windowSize: number) {
  return values.map((_, index) => {
    const start = Math.max(0, index - windowSize + 1);
    const slice = values.slice(start, index + 1);
    return mean(slice);
  });
}

function detrend(values: number[], windowSize: number) {
  const trend = movingAverage(values, windowSize);
  return values.map((value, index) => value - trend[index]);
}

function normalize(values: number[]) {
  const avg = mean(values);
  const deviation = std(values) || 1;
  return values.map((value) => (value - avg) / deviation);
}

function dftMagnitude(values: number[], sampleRate: number) {
  const bins: { frequency: number; magnitude: number }[] = [];
  const n = values.length;

  for (let k = 0; k < Math.floor(n / 2); k += 1) {
    let real = 0;
    let imaginary = 0;

    for (let i = 0; i < n; i += 1) {
      const angle = (2 * Math.PI * k * i) / n;
      real += values[i] * Math.cos(angle);
      imaginary -= values[i] * Math.sin(angle);
    }

    bins.push({
      frequency: (k * sampleRate) / n,
      magnitude: Math.sqrt(real ** 2 + imaginary ** 2),
    });
  }

  return bins;
}

function dominantFrequency(
  values: number[],
  sampleRate: number,
  minHz: number,
  maxHz: number
) {
  const bins = dftMagnitude(values, sampleRate).filter(
    (bin) => bin.frequency >= minHz && bin.frequency <= maxHz
  );

  if (bins.length === 0) {
    return null;
  }

  return bins.reduce((best, current) =>
    current.magnitude > best.magnitude ? current : best
  );
}

function detectPeaks(values: number[], sampleRate: number, minDistanceSeconds: number) {
  const peaks: number[] = [];
  const minDistance = Math.max(1, Math.floor(sampleRate * minDistanceSeconds));

  for (let index = 1; index < values.length - 1; index += 1) {
    const isPeak = values[index] > values[index - 1] && values[index] > values[index + 1];
    if (!isPeak) continue;

    const previousPeak = peaks[peaks.length - 1];
    if (previousPeak == null || index - previousPeak >= minDistance) {
      peaks.push(index);
    } else if (values[index] > values[previousPeak]) {
      peaks[peaks.length - 1] = index;
    }
  }

  return peaks;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function analyzeSignal(points: SignalPoint[], sampleRate: number): VitalSigns {
  if (points.length < sampleRate * 10) {
    return {
      bpm: null,
      respiratoryRate: null,
      hrvSdnn: null,
      hrvRmssd: null,
      spo2: null,
      stressIndex: null,
      signalQuality: 0,
      confidence: 0,
    };
  }

  const green = normalize(detrend(points.map((point) => point.g), Math.floor(sampleRate * 1.5)));
  const red = normalize(detrend(points.map((point) => point.r), Math.floor(sampleRate * 1.5)));
  const blue = normalize(detrend(points.map((point) => point.b), Math.floor(sampleRate * 1.5)));

  const pulsePeak = dominantFrequency(green, sampleRate, 0.75, 4.0);
  const respirationPeak = dominantFrequency(green, sampleRate, 0.1, 0.5);

  const bpm = pulsePeak ? pulsePeak.frequency * 60 : null;
  const respiratoryRate = respirationPeak ? respirationPeak.frequency * 60 : null;

  const peaks = detectPeaks(green, sampleRate, 0.45);
  const ibi = peaks
    .slice(1)
    .map((peak, index) => ((peak - peaks[index]) / sampleRate) * 1000);

  const hrvSdnn = ibi.length > 1 ? std(ibi) : null;
  const hrvRmssd =
    ibi.length > 2
      ? Math.sqrt(
          ibi
            .slice(1)
            .map((value, index) => (value - ibi[index]) ** 2)
            .reduce((sum, value) => sum + value, 0) /
            (ibi.length - 1)
        )
      : null;

  const acRed = std(red);
  const dcRed = Math.abs(mean(points.map((point) => point.r))) || 1;
  const acBlue = std(blue);
  const dcBlue = Math.abs(mean(points.map((point) => point.b))) || 1;
  const ratio = (acRed / dcRed) / ((acBlue / dcBlue) || 1);
  const spo2 = clamp(104 - 17 * ratio, 85, 100);

  const qualityRaw = pulsePeak ? pulsePeak.magnitude / (std(green) || 1) : 0;
  const signalQuality = clamp(Math.round(qualityRaw * 20), 0, 100);
  const confidence = clamp(signalQuality / 100, 0, 1);

  const stressIndex =
    hrvRmssd == null
      ? null
      : clamp(Math.round(100 - Math.min(hrvRmssd, 120) * 0.8), 0, 100);

  return {
    bpm: bpm ? Math.round(bpm) : null,
    respiratoryRate: respiratoryRate ? Math.round(respiratoryRate) : null,
    hrvSdnn: hrvSdnn ? Math.round(hrvSdnn * 10) / 10 : null,
    hrvRmssd: hrvRmssd ? Math.round(hrvRmssd * 10) / 10 : null,
    spo2: Number.isFinite(spo2) ? Math.round(spo2 * 10) / 10 : null,
    stressIndex,
    signalQuality,
    confidence: Math.round(confidence * 100) / 100,
  };
}

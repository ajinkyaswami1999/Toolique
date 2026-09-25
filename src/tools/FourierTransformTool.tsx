/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Download,
  Activity,
  Play,
  Square,
  Filter,
  Info,
  Copy,
  Check,
  Code2,
  Sparkles,
  TrendingUp,
  Upload
} from 'lucide-react';
import * as math from 'mathjs';

// Window function types
export type WindowFunctionType = 'rectangular' | 'hann' | 'hamming' | 'blackman' | 'flattop';
export type FilterType = 'none' | 'lowpass' | 'highpass' | 'bandpass' | 'notch';
export type GraphViewMode = 'magnitude' | 'time' | 'phase' | 'psd' | 'real_imag' | 'comparison';
export type SpectrumScale = 'linear' | 'db';

export interface HarmonicPeak {
  index: number;
  frequency: number;
  magnitude: number;
  db: number;
  phaseDeg: number;
  powerPercent: number;
}

export interface ToneSetting {
  id: number;
  freq: number;
  amp: number;
  phase: number;
  enabled: boolean;
}

export default function FourierTransformTool() {
  // Input Modes: 'formula' | 'synth' | 'raw'
  const [inputMode, setInputMode] = useState<'formula' | 'synth' | 'raw'>('formula');

  // Formula state
  const [expression, setExpression] = useState<string>('3 * sin(2 * pi * 45 * t) + 2.5 * cos(2 * pi * 110 * t)');
  
  // Synthesizer State (up to 4 multi-tone sinusoids)
  const [tones, setTones] = useState<ToneSetting[]>([
    { id: 1, freq: 50, amp: 3.0, phase: 0, enabled: true },
    { id: 2, freq: 120, amp: 2.0, phase: 45, enabled: true },
    { id: 3, freq: 300, amp: 1.0, phase: 90, enabled: false },
    { id: 4, freq: 440, amp: 1.5, phase: 0, enabled: false }
  ]);

  // Raw data state
  const [rawData, setRawData] = useState<string>('');

  // Sampling & Noise Parameters
  const [samplingFreq, setSamplingFreq] = useState<number>(1000);
  const [numSamples, setNumSamples] = useState<number>(256);
  const [noiseLevel, setNoiseLevel] = useState<number>(0);

  // DSP Options
  const [windowFunction, setWindowFunction] = useState<WindowFunctionType>('hann');
  const [spectrumScale, setSpectrumScale] = useState<SpectrumScale>('linear');
  const [viewMode, setViewMode] = useState<GraphViewMode>('magnitude');

  // Filter Lab state
  const [filterType, setFilterType] = useState<FilterType>('none');
  const [filterCutoffLow, setFilterCutoffLow] = useState<number>(80);
  const [filterCutoffHigh, setFilterCutoffHigh] = useState<number>(200);

  // Interactive Hover Probe
  const [hoverData, setHoverData] = useState<{ x: number; y: number; labelX: string; labelY: string } | null>(null);

  // Audio Playback
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Copy Feedback
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      if (audioSourceRef.current) {
        try { audioSourceRef.current.stop(); } catch { /* ignore */ }
      }
      if (audioContextRef.current) {
        try { audioContextRef.current.close(); } catch { /* ignore */ }
      }
    };
  }, []);

  // Compute Window Coefficients
  const computeWindowValue = useCallback((index: number, total: number, type: WindowFunctionType): number => {
    if (type === 'rectangular' || total <= 1) return 1.0;
    const n = index;
    const N = total - 1;
    const factor = (2 * Math.PI * n) / N;

    switch (type) {
      case 'hann':
        return 0.5 * (1 - Math.cos(factor));
      case 'hamming':
        return 0.54 - 0.46 * Math.cos(factor);
      case 'blackman':
        return 0.42 - 0.5 * Math.cos(factor) + 0.08 * Math.cos(2 * factor);
      case 'flattop': {
        const a0 = 0.21557895;
        const a1 = 0.41663158;
        const a2 = 0.277263158;
        const a3 = 0.083578947;
        const a4 = 0.006947368;
        return a0 - a1 * Math.cos(factor) + a2 * Math.cos(2 * factor) - a3 * Math.cos(3 * factor) + a4 * Math.cos(4 * factor);
      }
      default:
        return 1.0;
    }
  }, []);

  // Preset loader
  const loadPreset = (presetType: string) => {
    setError(null);
    switch (presetType) {
      case 'dual_sine':
        setInputMode('formula');
        setExpression('3 * sin(2 * pi * 45 * t) + 2.5 * cos(2 * pi * 110 * t)');
        setSamplingFreq(1000);
        setNumSamples(256);
        setNoiseLevel(0);
        setWindowFunction('hann');
        break;
      case 'noisy_60hz':
        setInputMode('formula');
        setExpression('2 * sin(2 * pi * 60 * t) + 0.8 * sin(2 * pi * 180 * t)');
        setSamplingFreq(1000);
        setNumSamples(512);
        setNoiseLevel(1.5);
        setWindowFunction('hamming');
        break;
      case 'am_radio':
        setInputMode('formula');
        setExpression('(1 + 0.5 * cos(2 * pi * 15 * t)) * sin(2 * pi * 150 * t)');
        setSamplingFreq(1000);
        setNumSamples(512);
        setNoiseLevel(0);
        setWindowFunction('blackman');
        break;
      case 'square_harmonics':
        setInputMode('formula');
        setExpression('sin(2*pi*30*t) + (1/3)*sin(2*pi*90*t) + (1/5)*sin(2*pi*150*t) + (1/7)*sin(2*pi*210*t)');
        setSamplingFreq(1000);
        setNumSamples(512);
        setNoiseLevel(0);
        setWindowFunction('hann');
        break;
      case 'dtmf_touchtone':
        setInputMode('formula');
        setExpression('sin(2 * pi * 697 * t) + sin(2 * pi * 1209 * t)'); // Digit '1'
        setSamplingFreq(4000);
        setNumSamples(512);
        setNoiseLevel(0);
        setWindowFunction('hann');
        break;
      case 'chirp':
        setInputMode('formula');
        setExpression('sin(2 * pi * (20 + 80 * t) * t)');
        setSamplingFreq(1000);
        setNumSamples(512);
        setNoiseLevel(0.2);
        setWindowFunction('hann');
        break;
    }
  };

  // Generate Signal Data
  const signalData = useMemo(() => {
    setError(null);
    let originalSignal: number[] = [];
    let time: number[] = [];

    if (inputMode === 'raw') {
      if (!rawData.trim()) return null;
      try {
        const parsed = rawData.split(/[\s,;\n\r]+/).map(v => parseFloat(v)).filter(v => !isNaN(v));
        if (parsed.length < 8) {
          throw new Error('Raw signal data must contain at least 8 valid numeric entries.');
        }
        originalSignal = parsed;
        time = originalSignal.map((_, idx) => idx / samplingFreq);
      } catch (e: any) {
        setError(e.message || 'Failed to parse raw dataset.');
        return null;
      }
    } else if (inputMode === 'synth') {
      for (let i = 0; i < numSamples; i++) {
        const tVal = i / samplingFreq;
        let yVal = 0;
        tones.forEach(tone => {
          if (tone.enabled) {
            const radPhase = (tone.phase * Math.PI) / 180;
            yVal += tone.amp * Math.sin(2 * Math.PI * tone.freq * tVal + radPhase);
          }
        });

        if (noiseLevel > 0) {
          const u1 = Math.max(1e-9, Math.random());
          const u2 = Math.random();
          const randStdNormal = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
          yVal += randStdNormal * noiseLevel;
        }

        originalSignal.push(yVal);
        time.push(tVal);
      }
    } else {
      // Formula mode
      try {
        const compiled = math.compile(expression);
        for (let i = 0; i < numSamples; i++) {
          const tVal = i / samplingFreq;
          let yVal = compiled.evaluate({ t: tVal, pi: Math.PI, e: Math.E });
          if (typeof yVal !== 'number' || isNaN(yVal)) {
            throw new Error('Signal formula did not evaluate to a valid finite number.');
          }
          if (noiseLevel > 0) {
            const u1 = Math.max(1e-9, Math.random());
            const u2 = Math.random();
            const randStdNormal = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
            yVal += randStdNormal * noiseLevel;
          }
          originalSignal.push(yVal);
          time.push(tVal);
        }
      } catch (e: any) {
        setError(e.message || 'Invalid formula expression or syntax.');
        return null;
      }
    }

    // Zero pad to next power of 2 for FFT efficiency
    let fftSize = 1;
    while (fftSize < originalSignal.length) fftSize *= 2;
    if (fftSize < 64) fftSize = 64;

    const paddedSignal = [...originalSignal];
    while (paddedSignal.length < fftSize) {
      paddedSignal.push(0);
    }

    // Apply Window function to padded signal
    const windowedSignal = paddedSignal.map((val, idx) => {
      const w = idx < originalSignal.length ? computeWindowValue(idx, originalSignal.length, windowFunction) : 0;
      return val * w;
    });

    return {
      time: originalSignal.map((_, i) => i / samplingFreq),
      originalSignal,
      paddedSignal,
      windowedSignal,
      fftSize,
      length: originalSignal.length
    };
  }, [inputMode, expression, tones, rawData, samplingFreq, numSamples, noiseLevel, windowFunction, computeWindowValue]);

  // Cooley-Tukey Radix-2 FFT & iFFT Implementation
  const fftCalculation = useMemo(() => {
    if (!signalData) return null;
    const n = signalData.fftSize;

    // Real and Imag arrays
    const realIn = [...signalData.windowedSignal];
    const imagIn = new Array(n).fill(0);

    // Bit-reversal permutation
    let j = 0;
    for (let i = 0; i < n - 1; i++) {
      if (i < j) {
        const tempR = realIn[i];
        realIn[i] = realIn[j];
        realIn[j] = tempR;
        const tempI = imagIn[i];
        imagIn[i] = imagIn[j];
        imagIn[j] = tempI;
      }
      let k = n >> 1;
      while (k <= j) {
        j -= k;
        k >>= 1;
      }
      j += k;
    }

    // Cooley-Tukey Butterfly passes
    for (let len = 2; len <= n; len <<= 1) {
      const halfLen = len >> 1;
      const angle = (-2 * Math.PI) / len;
      const wStepR = Math.cos(angle);
      const wStepI = Math.sin(angle);

      for (let i = 0; i < n; i += len) {
        let wR = 1;
        let wI = 0;
        for (let k = 0; k < halfLen; k++) {
          const uR = realIn[i + k];
          const uI = imagIn[i + k];
          const vR = realIn[i + k + halfLen] * wR - imagIn[i + k + halfLen] * wI;
          const vI = realIn[i + k + halfLen] * wI + imagIn[i + k + halfLen] * wR;

          realIn[i + k] = uR + vR;
          imagIn[i + k] = uI + vI;
          realIn[i + k + halfLen] = uR - vR;
          imagIn[i + k + halfLen] = uI - vI;

          const nextWR = wR * wStepR - wI * wStepI;
          wI = wR * wStepI + wI * wStepR;
          wR = nextWR;
        }
      }
    }

    const halfSize = n / 2;
    const frequencies: number[] = [];
    const magnitudes: number[] = [];
    const dbMagnitudes: number[] = [];
    const phases: number[] = [];
    const powerSpectrum: number[] = [];
    const realHalf: number[] = [];
    const imagHalf: number[] = [];

    // Normalization scale (accounting for one-sided FFT and window factor)
    const normFactor = signalData.length / 2;

    for (let i = 0; i <= halfSize; i++) {
      const freq = (i * samplingFreq) / n;
      const r = realIn[i];
      const im = imagIn[i];

      // Magnitude
      const mag = Math.sqrt(r * r + im * im) / (i === 0 || i === halfSize ? normFactor * 2 : normFactor);
      const db = 20 * Math.log10(Math.max(1e-6, mag));
      const phaseDeg = (Math.atan2(im, r) * 180) / Math.PI;
      const psd = (mag * mag) / 2;

      frequencies.push(freq);
      magnitudes.push(mag);
      dbMagnitudes.push(db);
      phases.push(phaseDeg);
      powerSpectrum.push(psd);
      realHalf.push(r / normFactor);
      imagHalf.push(im / normFactor);
    }

    // Filter Spectrum & Compute iFFT Reconstructed Signal
    const filteredReal = [...realIn];
    const filteredImag = [...imagIn];

    if (filterType !== 'none') {
      for (let i = 0; i < n; i++) {
        const f = i <= halfSize ? (i * samplingFreq) / n : ((n - i) * samplingFreq) / n;
        let pass = true;

        if (filterType === 'lowpass') {
          pass = f <= filterCutoffLow;
        } else if (filterType === 'highpass') {
          pass = f >= filterCutoffLow;
        } else if (filterType === 'bandpass') {
          pass = f >= filterCutoffLow && f <= filterCutoffHigh;
        } else if (filterType === 'notch') {
          pass = f < filterCutoffLow || f > filterCutoffHigh;
        }

        if (!pass) {
          filteredReal[i] = 0;
          filteredImag[i] = 0;
        }
      }
    }

    // Run iFFT on filtered spectrum (Conjugate -> FFT -> Conjugate / N)
    const ifftReal = filteredReal.map(r => r);
    const ifftImag = filteredImag.map(im => -im); // conjugate

    // bit-reversal for iFFT
    j = 0;
    for (let i = 0; i < n - 1; i++) {
      if (i < j) {
        const tr = ifftReal[i]; ifftReal[i] = ifftReal[j]; ifftReal[j] = tr;
        const ti = ifftImag[i]; ifftImag[i] = ifftImag[j]; ifftImag[j] = ti;
      }
      let k = n >> 1;
      while (k <= j) {
        j -= k;
        k >>= 1;
      }
      j += k;
    }

    for (let len = 2; len <= n; len <<= 1) {
      const halfLen = len >> 1;
      const angle = (-2 * Math.PI) / len;
      const wStepR = Math.cos(angle);
      const wStepI = Math.sin(angle);

      for (let i = 0; i < n; i += len) {
        let wR = 1;
        let wI = 0;
        for (let k = 0; k < halfLen; k++) {
          const uR = ifftReal[i + k];
          const uI = ifftImag[i + k];
          const vR = ifftReal[i + k + halfLen] * wR - ifftImag[i + k + halfLen] * wI;
          const vI = ifftReal[i + k + halfLen] * wI + ifftImag[i + k + halfLen] * wR;

          ifftReal[i + k] = uR + vR;
          ifftImag[i + k] = uI + vI;
          ifftReal[i + k + halfLen] = uR - vR;
          ifftImag[i + k + halfLen] = uI - vI;

          const nextWR = wR * wStepR - wI * wStepI;
          wI = wR * wStepI + wI * wStepR;
          wR = nextWR;
        }
      }
    }

    // Reconstructed clean time domain signal (divided by n)
    const reconstructedSignal = ifftReal.slice(0, signalData.length).map(r => r / n);

    // Peak Frequency Identification
    const peaks: HarmonicPeak[] = [];
    const totalPower = powerSpectrum.reduce((acc, p) => acc + p, 0);

    for (let i = 1; i < halfSize - 1; i++) {
      if (magnitudes[i] > magnitudes[i - 1] && magnitudes[i] > magnitudes[i + 1]) {
        if (magnitudes[i] > 0.05) {
          const powerPct = totalPower > 0 ? (powerSpectrum[i] / totalPower) * 100 : 0;
          peaks.push({
            index: i,
            frequency: frequencies[i],
            magnitude: magnitudes[i],
            db: dbMagnitudes[i],
            phaseDeg: phases[i],
            powerPercent: powerPct
          });
        }
      }
    }

    // Sort peaks descending by magnitude
    peaks.sort((a, b) => b.magnitude - a.magnitude);
    const dominantPeak = peaks[0] || null;

    // Parseval Energy Check
    const timeEnergy = signalData.originalSignal.reduce((sum, v) => sum + v * v, 0);
    const freqEnergy = powerSpectrum.reduce((sum, v) => sum + v, 0) * 2;

    return {
      frequencies,
      magnitudes,
      dbMagnitudes,
      phases,
      powerSpectrum,
      realHalf,
      imagHalf,
      peaks: peaks.slice(0, 8),
      dominantPeak,
      reconstructedSignal,
      timeEnergy,
      freqEnergy,
      resolutionHz: samplingFreq / n
    };
  }, [signalData, samplingFreq, filterType, filterCutoffLow, filterCutoffHigh]);

  // Audio Playback Handler
  const toggleAudioPlayback = () => {
    if (isPlayingAudio) {
      if (audioSourceRef.current) {
        try { audioSourceRef.current.stop(); } catch { /* ignore */ }
      }
      setIsPlayingAudio(false);
      return;
    }

    if (!signalData) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Generate a 1.5-second loop of the signal
      const playDuration = 1.5;
      const buffer = ctx.createBuffer(1, ctx.sampleRate * playDuration, ctx.sampleRate);
      const channelData = buffer.getChannelData(0);

      // Interpolate signal to audio sample rate
      const sig = fftCalculation?.reconstructedSignal || signalData.originalSignal;
      const maxAmp = Math.max(0.1, ...sig.map(v => Math.abs(v)));
      const sigLen = sig.length;

      for (let i = 0; i < channelData.length; i++) {
        const sigIdx = (i * (samplingFreq / ctx.sampleRate)) % sigLen;
        const low = Math.floor(sigIdx);
        const high = (low + 1) % sigLen;
        const weight = sigIdx - low;
        const sampleVal = (sig[low] * (1 - weight) + sig[high] * weight) / maxAmp;
        channelData[i] = sampleVal * 0.3; // safe volume
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(ctx.destination);
      source.start();

      audioSourceRef.current = source;
      setIsPlayingAudio(true);
    } catch (e) {
      console.error('Audio playback failed:', e);
      setError('Browser audio playback failed.');
    }
  };

  // CSV File Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        setInputMode('raw');
        setRawData(content);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Export CSV Analysis Matrix
  const handleExportCSV = () => {
    if (!signalData || !fftCalculation) return;
    const headers = [
      'Time (s)',
      'Original Signal x(t)',
      'Filtered Signal x_filt(t)',
      'Frequency (Hz)',
      'Magnitude |X(f)|',
      'Magnitude (dBV)',
      'Phase (deg)',
      'Real Re{X}',
      'Imag Im{X}',
      'Power Spectral Density'
    ];

    const rows: string[][] = [];
    const maxLen = Math.max(signalData.time.length, fftCalculation.frequencies.length);

    for (let i = 0; i < maxLen; i++) {
      rows.push([
        i < signalData.time.length ? signalData.time[i].toFixed(6) : '',
        i < signalData.originalSignal.length ? signalData.originalSignal[i].toFixed(6) : '',
        i < fftCalculation.reconstructedSignal.length ? fftCalculation.reconstructedSignal[i].toFixed(6) : '',
        i < fftCalculation.frequencies.length ? fftCalculation.frequencies[i].toFixed(3) : '',
        i < fftCalculation.magnitudes.length ? fftCalculation.magnitudes[i].toFixed(6) : '',
        i < fftCalculation.dbMagnitudes.length ? fftCalculation.dbMagnitudes[i].toFixed(2) : '',
        i < fftCalculation.phases.length ? fftCalculation.phases[i].toFixed(2) : '',
        i < fftCalculation.realHalf.length ? fftCalculation.realHalf[i].toFixed(6) : '',
        i < fftCalculation.imagHalf.length ? fftCalculation.imagHalf[i].toFixed(6) : '',
        i < fftCalculation.powerSpectrum.length ? fftCalculation.powerSpectrum[i].toFixed(6) : ''
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encodedUri;
    link.download = `fft_spectral_analysis_${samplingFreq}Hz.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy Full DSP Summary Manifest
  const handleCopyManifest = () => {
    if (!signalData || !fftCalculation) return;
    const manifest = [
      `=== FOURIER TRANSFORM DSP SPECTRAL MANIFEST ===`,
      `Sampling Frequency (Fs): ${samplingFreq} Hz`,
      `Nyquist Frequency Limit: ${(samplingFreq / 2).toFixed(1)} Hz`,
      `FFT Transform Size (N): ${signalData.fftSize} points`,
      `Frequency Resolution (Δf): ${fftCalculation.resolutionHz.toFixed(3)} Hz/bin`,
      `Signal Duration (T): ${(signalData.length / samplingFreq).toFixed(4)} seconds`,
      `Window Function: ${windowFunction.toUpperCase()}`,
      `Filter Applied: ${filterType.toUpperCase()}${filterType !== 'none' ? ` (${filterCutoffLow}Hz - ${filterCutoffHigh}Hz)` : ''}`,
      `Dominant Frequency Peak: ${fftCalculation.dominantPeak ? `${fftCalculation.dominantPeak.frequency.toFixed(2)} Hz (|Mag| = ${fftCalculation.dominantPeak.magnitude.toFixed(3)})` : 'None'}`,
      `Total Energy (Time Domain): ${fftCalculation.timeEnergy.toFixed(2)}`,
      `Total Energy (Freq Domain): ${fftCalculation.freqEnergy.toFixed(2)}`,
      `Top Identified Harmonic Peaks:`,
      ...fftCalculation.peaks.map((p, idx) => `  [#${idx + 1}] ${p.frequency.toFixed(2)} Hz | Mag: ${p.magnitude.toFixed(3)} | Power: ${p.powerPercent.toFixed(1)}% | Phase: ${p.phaseDeg.toFixed(1)}°`),
      `Audited with: Toolique Fourier Transform DSP Studio (https://toolique.in/calculators/fourier-transform-tool)`
    ].join('\n');

    navigator.clipboard.writeText(manifest);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  // Code Snippets for Developers
  const polyglotSnippets = useMemo(() => {
    return [
      {
        lang: 'Python (NumPy / SciPy)',
        code: `import numpy as np
import matplotlib.pyplot as plt

# Sampling parameters
fs = ${samplingFreq}
N = ${signalData?.fftSize || 256}
t = np.arange(N) / fs

# Signal definition
x = 3 * np.sin(2 * np.pi * 45 * t) + 2.5 * np.cos(2 * np.pi * 110 * t)

# Apply Hann window and compute FFT
window = np.hanning(N)
X = np.fft.rfft(x * window)
freqs = np.fft.rfftfreq(N, 1/fs)
magnitude = np.abs(X) / (N / 2)

plt.plot(freqs, magnitude)
plt.xlabel('Frequency (Hz)')
plt.ylabel('Magnitude')
plt.title('FFT Spectrum')
plt.show()`
      },
      {
        lang: 'MATLAB / Octave',
        code: `fs = ${samplingFreq};
N = ${signalData?.fftSize || 256};
t = (0:N-1) / fs;

x = 3*sin(2*pi*45*t) + 2.5*cos(2*pi*110*t);
w = hann(N)';
X = fft(x .* w);

P2 = abs(X/N);
P1 = P2(1:N/2+1);
P1(2:end-1) = 2*P1(2:end-1);
f = fs*(0:(N/2))/N;

plot(f, P1)
xlabel('Frequency (Hz)')
ylabel('|P1(f)|')`
      },
      {
        lang: 'JavaScript (Web Audio / TypedArrays)',
        code: `const fs = ${samplingFreq};
const N = ${signalData?.fftSize || 256};
const real = new Float32Array(N);
const imag = new Float32Array(N);

// Fill with time series signal
for (let i = 0; i < N; i++) {
  const t = i / fs;
  real[i] = 3 * Math.sin(2 * Math.PI * 45 * t);
}
// Perform FFT with Web Audio AnalyserNode or DSP.js`
      }
    ];
  }, [samplingFreq, signalData?.fftSize]);

  // SVG Chart Geometry Helpers
  const svgWidth = 650;
  const svgHeight = 220;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 35;
  const plotWidth = svgWidth - paddingLeft - paddingRight;
  const plotHeight = svgHeight - paddingTop - paddingBottom;

  // Render SVG Paths based on viewMode
  const chartPaths = useMemo(() => {
    if (!signalData || !fftCalculation) return { path1: '', path2: '', minX: 0, maxX: 1, minY: 0, maxY: 1 };

    if (viewMode === 'time' || viewMode === 'comparison') {
      const xs = signalData.time;
      const ys = signalData.originalSignal;
      const filtYs = fftCalculation.reconstructedSignal;

      const minX = 0;
      const maxX = Math.max(...xs, 1e-6);
      const allY = [...ys, ...filtYs];
      const minY = Math.min(...allY);
      const maxY = Math.max(...allY);
      const yRange = Math.max(maxY - minY, 1e-6);

      const pts1 = ys.map((y, idx) => {
        const px = paddingLeft + ((xs[idx] - minX) / maxX) * plotWidth;
        const py = paddingTop + (1 - (y - minY) / yRange) * plotHeight;
        return `${px.toFixed(1)},${py.toFixed(1)}`;
      });

      const pts2 = filtYs.map((y, idx) => {
        const px = paddingLeft + ((xs[idx] - minX) / maxX) * plotWidth;
        const py = paddingTop + (1 - (y - minY) / yRange) * plotHeight;
        return `${px.toFixed(1)},${py.toFixed(1)}`;
      });

      return {
        path1: pts1.length > 1 ? `M ${pts1.join(' L ')}` : '',
        path2: pts2.length > 1 ? `M ${pts2.join(' L ')}` : '',
        minX,
        maxX,
        minY,
        maxY
      };
    }

    if (viewMode === 'phase') {
      const xs = fftCalculation.frequencies;
      const ys = fftCalculation.phases;
      const minX = 0;
      const maxX = Math.max(...xs);
      const minY = -180;
      const maxY = 180;
      const yRange = 360;

      const pts = ys.map((y, idx) => {
        const px = paddingLeft + ((xs[idx] - minX) / maxX) * plotWidth;
        const py = paddingTop + (1 - (y - minY) / yRange) * plotHeight;
        return `${px.toFixed(1)},${py.toFixed(1)}`;
      });

      return {
        path1: pts.length > 1 ? `M ${pts.join(' L ')}` : '',
        path2: '',
        minX,
        maxX,
        minY,
        maxY
      };
    }

    if (viewMode === 'real_imag') {
      const xs = fftCalculation.frequencies;
      const rYs = fftCalculation.realHalf;
      const iYs = fftCalculation.imagHalf;
      const minX = 0;
      const maxX = Math.max(...xs);
      const allY = [...rYs, ...iYs];
      const minY = Math.min(...allY);
      const maxY = Math.max(...allY);
      const yRange = Math.max(maxY - minY, 1e-6);

      const pts1 = rYs.map((y, idx) => {
        const px = paddingLeft + ((xs[idx] - minX) / maxX) * plotWidth;
        const py = paddingTop + (1 - (y - minY) / yRange) * plotHeight;
        return `${px.toFixed(1)},${py.toFixed(1)}`;
      });

      const pts2 = iYs.map((y, idx) => {
        const px = paddingLeft + ((xs[idx] - minX) / maxX) * plotWidth;
        const py = paddingTop + (1 - (y - minY) / yRange) * plotHeight;
        return `${px.toFixed(1)},${py.toFixed(1)}`;
      });

      return {
        path1: pts1.length > 1 ? `M ${pts1.join(' L ')}` : '',
        path2: pts2.length > 1 ? `M ${pts2.join(' L ')}` : '',
        minX,
        maxX,
        minY,
        maxY
      };
    }

    // Default: Magnitude or PSD
    const xs = fftCalculation.frequencies;
    const ys = viewMode === 'psd'
      ? fftCalculation.powerSpectrum
      : spectrumScale === 'db'
      ? fftCalculation.dbMagnitudes
      : fftCalculation.magnitudes;

    const minX = 0;
    const maxX = Math.max(...xs);
    const minY = spectrumScale === 'db' && viewMode === 'magnitude' ? -80 : 0;
    const maxY = Math.max(...ys, 0.1);
    const yRange = Math.max(maxY - minY, 1e-6);

    const pts = ys.map((y, idx) => {
      const clampedY = Math.max(minY, Math.min(maxY, y));
      const px = paddingLeft + ((xs[idx] - minX) / maxX) * plotWidth;
      const py = paddingTop + (1 - (clampedY - minY) / yRange) * plotHeight;
      return `${px.toFixed(1)},${py.toFixed(1)}`;
    });

    return {
      path1: pts.length > 1 ? `M ${pts.join(' L ')}` : '',
      path2: '',
      minX,
      maxX,
      minY,
      maxY
    };
  }, [signalData, fftCalculation, viewMode, spectrumScale, plotWidth, plotHeight]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-left">
      {/* Answer Engine Optimization (AEO) Quick Answer Box */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 flex items-start gap-3.5 shadow-xs">
        <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div className="text-xs text-zinc-700 dark:text-zinc-300 space-y-1">
          <p className="font-bold text-zinc-900 dark:text-white text-sm">
            What is the Discrete Fast Fourier Transform (FFT)?
          </p>
          <p className="leading-relaxed">
            The <strong>Fast Fourier Transform (FFT)</strong> is an efficient $O(N \log N)$ algorithm that converts discrete time-domain signals $x[n]$ into constituent sinusoidal frequency components $X[k]$. It reveals hidden frequencies, harmonic distortions, power spectral density (PSD), and phase offsets essential for audio engineering, telecommunications, and vibration analysis.
          </p>
        </div>
      </div>

      {/* Main DSP Workbench Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Signal Input & DSP Controls (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Signal Source Selector Card */}
          <div className="saas-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2.5">
              <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Signal Generator Mode
              </span>
              <span className="text-[11px] font-mono text-zinc-500">
                Fs = {samplingFreq} Hz
              </span>
            </div>

            {/* Mode Switch Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80">
              {[
                { id: 'formula', label: 'Formula f(t)' },
                { id: 'synth', label: 'Multi-Tone' },
                { id: 'raw', label: 'Raw CSV' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setInputMode(tab.id as any)}
                  className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                    inputMode === tab.id
                      ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Mode 1: Formula Expression */}
            {inputMode === 'formula' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                    Continuous Function Expression f(t)
                  </label>
                  <input
                    type="text"
                    value={expression}
                    onChange={(e) => setExpression(e.target.value)}
                    placeholder="e.g. 3 * sin(2 * pi * 45 * t)"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-mono text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-zinc-400 mt-1 block">
                    Supported: `sin`, `cos`, `pi`, `exp`, `sqrt`, addition (+), multiplication (*)
                  </span>
                </div>

                {/* Spectral Presets */}
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-1.5">
                    Signal Archetypes & Presets
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'dual_sine', label: '45Hz + 110Hz Tones' },
                      { id: 'noisy_60hz', label: '60Hz Power + Noise' },
                      { id: 'square_harmonics', label: 'Square Wave (Fourier)' },
                      { id: 'am_radio', label: 'AM Modulation' },
                      { id: 'dtmf_touchtone', label: 'DTMF Key 1 (Telecom)' },
                      { id: 'chirp', label: 'Chirp / Sweep' }
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => loadPreset(p.id)}
                        className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-zinc-700 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Mode 2: Multi-Tone Synthesizer */}
            {inputMode === 'synth' && (
              <div className="space-y-3">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                  Harmonic Tone Generator
                </span>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {tones.map((tone, idx) => (
                    <div
                      key={tone.id}
                      className={`p-2.5 rounded-xl border transition space-y-2 ${
                        tone.enabled
                          ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/60'
                          : 'bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-800 dark:text-zinc-200">
                          <input
                            type="checkbox"
                            checked={tone.enabled}
                            onChange={(e) => {
                              const updated = [...tones];
                              updated[idx].enabled = e.target.checked;
                              setTones(updated);
                            }}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>Tone #{tone.id}</span>
                        </label>
                        <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
                          {tone.freq} Hz &bull; {tone.amp}V &bull; {tone.phase}°
                        </span>
                      </div>

                      {tone.enabled && (
                        <div className="grid grid-cols-3 gap-2 text-[11px]">
                          <div>
                            <span className="text-zinc-400 block text-[10px]">Freq (Hz)</span>
                            <input
                              type="number"
                              min={1}
                              max={samplingFreq / 2}
                              value={tone.freq}
                              onChange={(e) => {
                                const updated = [...tones];
                                updated[idx].freq = Math.max(1, Number(e.target.value));
                                setTones(updated);
                              }}
                              className="w-full px-2 py-1 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-xs"
                            />
                          </div>
                          <div>
                            <span className="text-zinc-400 block text-[10px]">Amp (V)</span>
                            <input
                              type="number"
                              min={0.1}
                              max={10}
                              step={0.1}
                              value={tone.amp}
                              onChange={(e) => {
                                const updated = [...tones];
                                updated[idx].amp = Math.max(0.1, Number(e.target.value));
                                setTones(updated);
                              }}
                              className="w-full px-2 py-1 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-xs"
                            />
                          </div>
                          <div>
                            <span className="text-zinc-400 block text-[10px]">Phase (°)</span>
                            <input
                              type="number"
                              min={-180}
                              max={180}
                              value={tone.phase}
                              onChange={(e) => {
                                const updated = [...tones];
                                updated[idx].phase = Number(e.target.value);
                                setTones(updated);
                              }}
                              className="w-full px-2 py-1 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-xs"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mode 3: Raw Signal Upload */}
            {inputMode === 'raw' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                    Paste Numerical Signal Array
                  </label>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload .CSV / .TXT</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.txt,.dat"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                <textarea
                  rows={4}
                  value={rawData}
                  onChange={(e) => setRawData(e.target.value)}
                  placeholder="e.g. 0.0, 1.25, 2.5, 1.8, -0.4, -2.1, -1.3, 0.4, 1.9..."
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-mono text-xs text-zinc-900 dark:text-white focus:outline-none"
                />
              </div>
            )}

            {/* Sampling Parameters Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-200 dark:border-zinc-800 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">
                  Sampling Rate (Fs)
                </label>
                <select
                  value={samplingFreq}
                  onChange={(e) => setSamplingFreq(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 font-mono text-xs font-bold"
                >
                  <option value={500}>500 Hz</option>
                  <option value={1000}>1,000 Hz (1 kHz)</option>
                  <option value={2000}>2,000 Hz (2 kHz)</option>
                  <option value={4000}>4,000 Hz (4 kHz)</option>
                  <option value={8000}>8,000 Hz (Voice)</option>
                  <option value={16000}>16,000 Hz (Wideband)</option>
                  <option value={44100}>44,100 Hz (Audio CD)</option>
                  <option value={48000}>48,000 Hz (Studio)</option>
                </select>
              </div>

              {inputMode !== 'raw' && (
                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">
                    FFT Samples (N)
                  </label>
                  <select
                    value={numSamples}
                    onChange={(e) => setNumSamples(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 font-mono text-xs font-bold"
                  >
                    <option value={64}>64 points</option>
                    <option value={128}>128 points</option>
                    <option value={256}>256 points</option>
                    <option value={512}>512 points</option>
                    <option value={1024}>1024 points</option>
                    <option value={2048}>2048 points</option>
                  </select>
                </div>
              )}
            </div>

            {/* Noise & Windowing Selection */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">
                  Window Function
                </label>
                <select
                  value={windowFunction}
                  onChange={(e) => setWindowFunction(e.target.value as WindowFunctionType)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
                >
                  <option value="hann">Hann (Hanning)</option>
                  <option value="hamming">Hamming</option>
                  <option value="blackman">Blackman</option>
                  <option value="flattop">Flat Top (Accurate Amp)</option>
                  <option value="rectangular">Rectangular (None)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">
                  Gaussian Noise (σ)
                </label>
                <input
                  type="number"
                  min={0}
                  max={5}
                  step={0.1}
                  value={noiseLevel}
                  onChange={(e) => setNoiseLevel(Math.max(0, Number(e.target.value)))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Real-time Frequency Filter Laboratory */}
          <div className="saas-card p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
              <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                iFFT Spectral Filter Lab
              </span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                Inverse FFT Enabled
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[11px] font-bold text-zinc-500 uppercase block mb-1">Filter Type</span>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as FilterType)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 font-bold text-xs"
                >
                  <option value="none">None (All-Pass)</option>
                  <option value="lowpass">Low-Pass (Fc Low)</option>
                  <option value="highpass">High-Pass (Fc High)</option>
                  <option value="bandpass">Band-Pass (F1 - F2)</option>
                  <option value="notch">Notch / Band-Stop</option>
                </select>
              </div>

              {filterType !== 'none' && (
                <div>
                  <span className="text-[11px] font-bold text-zinc-500 uppercase block mb-1">
                    {filterType === 'bandpass' || filterType === 'notch' ? 'Cutoff F1 / F2 (Hz)' : 'Cutoff Fc (Hz)'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={1}
                      max={samplingFreq / 2}
                      value={filterCutoffLow}
                      onChange={(e) => setFilterCutoffLow(Number(e.target.value))}
                      className="w-full px-2 py-1 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 font-mono text-xs"
                    />
                    {(filterType === 'bandpass' || filterType === 'notch') && (
                      <input
                        type="number"
                        min={filterCutoffLow}
                        max={samplingFreq / 2}
                        value={filterCutoffHigh}
                        onChange={(e) => setFilterCutoffHigh(Number(e.target.value))}
                        className="w-full px-2 py-1 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 font-mono text-xs"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            {filterType !== 'none' && (
              <p className="text-[11px] text-zinc-500">
                The selected filter zeroes out rejected bins in the complex spectrum before running Inverse FFT to reconstruct the time-domain waveform.
              </p>
            )}
          </div>

          {/* Action Bar (Audio Playback & Export) */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={toggleAudioPlayback}
              className={`flex-1 px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                isPlayingAudio
                  ? 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isPlayingAudio ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isPlayingAudio ? 'Stop Tone Audio' : 'Listen to Synthesized Signal'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              disabled={!fftCalculation}
              className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 text-xs font-bold transition flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleCopyManifest}
              disabled={!fftCalculation}
              className="px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              title="Copy DSP Summary Report"
            >
              {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedReport ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium">
              {error}
            </div>
          )}
        </div>

        {/* Right Column: Interactive Graphs & Spectral Analytics (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Visualizer Card */}
          <div className="saas-card p-5 space-y-4">
            {/* Graph Header & View Mode Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {[
                  { id: 'magnitude', label: 'Magnitude |X(f)|' },
                  { id: 'time', label: 'Time Waveform x(t)' },
                  { id: 'comparison', label: 'Original vs Filtered' },
                  { id: 'phase', label: 'Phase ∠X(f)' },
                  { id: 'psd', label: 'Power Density' },
                  { id: 'real_imag', label: 'Re / Im' }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id as GraphViewMode)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
                      viewMode === mode.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              {/* Linear vs dB Scale Switch */}
              {viewMode === 'magnitude' && (
                <div className="flex items-center gap-1 p-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold">
                  <button
                    onClick={() => setSpectrumScale('linear')}
                    className={`px-2 py-0.5 rounded transition ${spectrumScale === 'linear' ? 'bg-white dark:bg-zinc-900 text-indigo-600 shadow-xs' : 'text-zinc-500'}`}
                  >
                    Linear
                  </button>
                  <button
                    onClick={() => setSpectrumScale('db')}
                    className={`px-2 py-0.5 rounded transition ${spectrumScale === 'db' ? 'bg-white dark:bg-zinc-900 text-indigo-600 shadow-xs' : 'text-zinc-500'}`}
                  >
                    Decibel (dBV)
                  </button>
                </div>
              )}
            </div>

            {/* Interactive SVG Graph Canvas */}
            <div className="relative w-full rounded-2xl bg-zinc-950 p-2 border border-zinc-800 overflow-hidden select-none">
              <svg
                width="100%"
                height={svgHeight}
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="overflow-visible"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const svgX = ((e.clientX - rect.left) / rect.width) * svgWidth;
                  const svgY = ((e.clientY - rect.top) / rect.height) * svgHeight;

                  if (svgX >= paddingLeft && svgX <= svgWidth - paddingRight && svgY >= paddingTop && svgY <= svgHeight - paddingBottom) {
                    const normX = (svgX - paddingLeft) / plotWidth;
                    const valX = chartPaths.minX + normX * (chartPaths.maxX - chartPaths.minX);
                    const normY = 1 - (svgY - paddingTop) / plotHeight;
                    const valY = chartPaths.minY + normY * (chartPaths.maxY - chartPaths.minY);

                    setHoverData({
                      x: svgX,
                      y: svgY,
                      labelX: viewMode === 'time' || viewMode === 'comparison' ? `${valX.toFixed(4)} s` : `${valX.toFixed(1)} Hz`,
                      labelY: viewMode === 'phase' ? `${valY.toFixed(1)}°` : spectrumScale === 'db' && viewMode === 'magnitude' ? `${valY.toFixed(1)} dB` : valY.toFixed(3)
                    });
                  } else {
                    setHoverData(null);
                  }
                }}
                onMouseLeave={() => setHoverData(null)}
              >
                {/* Background Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                  const y = paddingTop + ratio * plotHeight;
                  const x = paddingLeft + ratio * plotWidth;
                  const valY = chartPaths.maxY - ratio * (chartPaths.maxY - chartPaths.minY);
                  const valX = chartPaths.minX + ratio * (chartPaths.maxX - chartPaths.minX);

                  return (
                    <g key={ratio}>
                      {/* Horizontal Grid Line */}
                      <line x1={paddingLeft} y1={y} x2={svgWidth - paddingRight} y2={y} stroke="#27272a" strokeDasharray="3,3" strokeWidth={1} />
                      <text x={paddingLeft - 6} y={y + 3} fill="#71717a" fontSize={9} textAnchor="end" fontFamily="monospace">
                        {valY.toFixed(viewMode === 'phase' ? 0 : 1)}
                      </text>

                      {/* Vertical Grid Line */}
                      <line x1={x} y1={paddingTop} x2={x} y2={svgHeight - paddingBottom} stroke="#27272a" strokeDasharray="3,3" strokeWidth={1} />
                      <text x={x} y={svgHeight - paddingBottom + 14} fill="#71717a" fontSize={9} textAnchor="middle" fontFamily="monospace">
                        {viewMode === 'time' || viewMode === 'comparison' ? `${valX.toFixed(3)}s` : `${Math.round(valX)}`}
                      </text>
                    </g>
                  );
                })}

                {/* Primary Data Line */}
                {chartPaths.path1 && (
                  <path
                    d={chartPaths.path1}
                    fill="none"
                    stroke={viewMode === 'comparison' ? '#a1a1aa' : '#818cf8'}
                    strokeWidth={viewMode === 'comparison' ? 1.2 : 2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Secondary Data Line (Filtered Signal or Imaginary) */}
                {chartPaths.path2 && (
                  <path
                    d={chartPaths.path2}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Peak Markers for Magnitude spectrum */}
                {viewMode === 'magnitude' && fftCalculation?.peaks.map((p) => {
                  const px = paddingLeft + ((p.frequency - chartPaths.minX) / (chartPaths.maxX - chartPaths.minX)) * plotWidth;
                  const yVal = spectrumScale === 'db' ? p.db : p.magnitude;
                  const py = paddingTop + (1 - (yVal - chartPaths.minY) / (chartPaths.maxY - chartPaths.minY)) * plotHeight;

                  return (
                    <g key={p.frequency}>
                      <circle cx={px} cy={py} r={4} fill="#34d399" stroke="#064e3b" strokeWidth={1.5} />
                      <text x={px} y={py - 7} fill="#34d399" fontSize={9} fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                        {p.frequency.toFixed(0)}Hz
                      </text>
                    </g>
                  );
                })}

                {/* Interactive Crosshair & Tooltip */}
                {hoverData && (
                  <g>
                    <line x1={hoverData.x} y1={paddingTop} x2={hoverData.x} y2={svgHeight - paddingBottom} stroke="#6366f1" strokeWidth={1} strokeDasharray="2,2" />
                    <line x1={paddingLeft} y1={hoverData.y} x2={svgWidth - paddingRight} y2={hoverData.y} stroke="#6366f1" strokeWidth={1} strokeDasharray="2,2" />
                    <circle cx={hoverData.x} cy={hoverData.y} r={4} fill="#6366f1" />
                    <rect
                      x={Math.min(svgWidth - 110, Math.max(paddingLeft, hoverData.x + 8))}
                      y={Math.max(paddingTop, hoverData.y - 30)}
                      width={100}
                      height={28}
                      rx={4}
                      fill="#18181b"
                      stroke="#3f3f46"
                      strokeWidth={1}
                    />
                    <text
                      x={Math.min(svgWidth - 110, Math.max(paddingLeft, hoverData.x + 8)) + 50}
                      y={Math.max(paddingTop, hoverData.y - 30) + 12}
                      fill="#e4e4e7"
                      fontSize={9}
                      textAnchor="middle"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      X: {hoverData.labelX}
                    </text>
                    <text
                      x={Math.min(svgWidth - 110, Math.max(paddingLeft, hoverData.x + 8)) + 50}
                      y={Math.max(paddingTop, hoverData.y - 30) + 23}
                      fill="#a5b4fc"
                      fontSize={9}
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      Y: {hoverData.labelY}
                    </text>
                  </g>
                )}
              </svg>

              {/* Legend Strip */}
              <div className="flex items-center justify-between text-[11px] text-zinc-400 px-3 pt-1 border-t border-zinc-900 font-mono">
                <span>Axis X: {viewMode === 'time' || viewMode === 'comparison' ? 'Time t (seconds)' : 'Frequency f (Hz)'}</span>
                {viewMode === 'comparison' && (
                  <span className="flex items-center gap-3">
                    <span className="text-zinc-400">&mdash; Raw Signal</span>
                    <span className="text-emerald-400 font-bold">&mdash; Filtered Reconstructed</span>
                  </span>
                )}
                {viewMode === 'real_imag' && (
                  <span className="flex items-center gap-3">
                    <span className="text-indigo-400 font-bold">&mdash; Real Re</span>
                    <span className="text-emerald-400 font-bold">&mdash; Imag Im</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Real-time DSP Telemetry & Nyquist Metrics */}
          {fftCalculation && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="saas-card p-3 space-y-1">
                <span className="text-[10px] text-zinc-400 font-bold uppercase">Dominant Peak</span>
                <p className="font-mono text-base font-black text-emerald-600 dark:text-emerald-400">
                  {fftCalculation.dominantPeak ? `${fftCalculation.dominantPeak.frequency.toFixed(2)} Hz` : 'DC (0 Hz)'}
                </p>
                <span className="text-[10px] text-zinc-500">
                  |Mag| = {fftCalculation.dominantPeak ? fftCalculation.dominantPeak.magnitude.toFixed(3) : '0'}
                </span>
              </div>

              <div className="saas-card p-3 space-y-1">
                <span className="text-[10px] text-zinc-400 font-bold uppercase">Nyquist Limit</span>
                <p className="font-mono text-base font-bold text-indigo-600 dark:text-indigo-400">
                  {(samplingFreq / 2).toFixed(1)} Hz
                </p>
                <span className="text-[10px] text-zinc-500">Max resolve limit (Fs / 2)</span>
              </div>

              <div className="saas-card p-3 space-y-1">
                <span className="text-[10px] text-zinc-400 font-bold uppercase">Bin Resolution</span>
                <p className="font-mono text-base font-bold text-zinc-900 dark:text-white">
                  {fftCalculation.resolutionHz.toFixed(3)} Hz
                </p>
                <span className="text-[10px] text-zinc-500">Δf = Fs / N</span>
              </div>

              <div className="saas-card p-3 space-y-1">
                <span className="text-[10px] text-zinc-400 font-bold uppercase">Energy Conservation</span>
                <p className="font-mono text-base font-bold text-zinc-900 dark:text-white">
                  Parseval OK
                </p>
                <span className="text-[10px] text-zinc-500">
                  E_time ≈ {fftCalculation.timeEnergy.toFixed(1)}
                </span>
              </div>
            </div>
          )}

          {/* Dominant Harmonic Peaks Table */}
          {fftCalculation && fftCalculation.peaks.length > 0 && (
            <div className="saas-card p-5 space-y-3">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Identified Harmonic Peaks
                </span>
                <span className="text-[10px] text-zinc-400 font-mono font-normal">
                  Sorted by Spectral Magnitude
                </span>
              </h3>

              <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-zinc-100 dark:bg-zinc-800/60 text-zinc-500 font-bold uppercase text-[10px] border-b border-zinc-200 dark:border-zinc-800">
                      <th className="p-2">Rank</th>
                      <th className="p-2">Frequency (Hz)</th>
                      <th className="p-2">Magnitude |X|</th>
                      <th className="p-2">Power (dBV)</th>
                      <th className="p-2">Phase (°)</th>
                      <th className="p-2">Power %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-mono">
                    {fftCalculation.peaks.map((p, idx) => (
                      <tr key={p.frequency} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                        <td className="p-2 font-bold text-indigo-600 dark:text-indigo-400">#{idx + 1}</td>
                        <td className="p-2 font-bold text-zinc-900 dark:text-white">{p.frequency.toFixed(2)} Hz</td>
                        <td className="p-2 text-zinc-700 dark:text-zinc-300">{p.magnitude.toFixed(4)}</td>
                        <td className="p-2 text-zinc-500">{p.db.toFixed(1)} dB</td>
                        <td className="p-2 text-zinc-500">{p.phaseDeg.toFixed(1)}°</td>
                        <td className="p-2">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold text-[10px]">
                            {p.powerPercent.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Developer Polyglot Code Generator */}
      <div className="saas-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Developer Code Generation (Run FFT in Code)
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Ready-to-use polyglot routines to reproduce this spectral analysis in Python, MATLAB, and JavaScript.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {polyglotSnippets.map((s) => (
            <div key={s.lang} className="p-3.5 rounded-xl bg-zinc-900 text-zinc-100 space-y-2 border border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400">{s.lang}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(s.code);
                    setCopiedSnippet(s.lang);
                    setTimeout(() => setCopiedSnippet(null), 2000);
                  }}
                  className="p-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  {copiedSnippet === s.lang ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSnippet === s.lang ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="text-[11px] font-mono bg-black/50 p-2.5 rounded-lg overflow-x-auto text-emerald-400 max-h-40 leading-relaxed">
                <code>{s.code}</code>
              </pre>
            </div>
          ))}
        </div>
      </div>

      {/* Educational & Practical DSP Guidelines Card */}
      <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-3">
        <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          Practical Digital Signal Processing (DSP) Principles
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <div className="p-3 rounded-xl bg-white dark:bg-zinc-850/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <p className="font-bold text-zinc-900 dark:text-white">Nyquist-Shannon Theorem</p>
            <p className="text-[11px]">
              Sampling rate Fs must exceed twice the highest signal frequency component (Fs &gt; 2 &times; f_max) to prevent destructive aliasing artifacts.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-zinc-850/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <p className="font-bold text-zinc-900 dark:text-white">Spectral Leakage & Windows</p>
            <p className="text-[11px]">
              Windowing functions (Hann, Hamming, Blackman) taper signal boundaries to zero, suppressing side-lobe leakage at the cost of slight main-lobe broadening.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-zinc-850/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <p className="font-bold text-zinc-900 dark:text-white">Inverse FFT (iFFT) Filtering</p>
            <p className="text-[11px]">
              By zeroing unwanted frequency bins in the complex spectrum and computing the Inverse FFT, clean time-domain signals can be faithfully synthesized.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

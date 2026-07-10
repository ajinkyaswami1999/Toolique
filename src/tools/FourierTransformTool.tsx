import { useState, useMemo } from 'react';
import { ArrowLeft, RotateCcw, Download, BarChart2 } from 'lucide-react';
import * as math from 'mathjs';
import SEO from '../components/SEO';
import { computeFFT, type FFTResult } from '../utils/mathAdvanced';

export default function FourierTransformTool() {
  const [expression, setExpression] = useState<string>('3 * sin(2 * pi * 45 * t) + 2.5 * cos(2 * pi * 110 * t)');
  const [samplingFreq, setSamplingFreq] = useState<number>(1000);
  const [numSamples, setNumSamples] = useState<number>(256);
  const [noiseLevel, setNoiseLevel] = useState<number>(0);
  const [rawData, setRawData] = useState<string>('');
  const [useRaw, setUseRaw] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Examples helper
  const loadExample = (expr: string, fs: number, samples: number, noise: number) => {
    setUseRaw(false);
    setExpression(expr);
    setSamplingFreq(fs);
    setNumSamples(samples);
    setNoiseLevel(noise);
    setError(null);
  };

  // Generate signal from formula
  const signalData = useMemo(() => {
    if (useRaw) {
      if (!rawData.trim()) return null;
      try {
        const parsed = rawData.split(/[\s,]+/).map(v => parseFloat(v)).filter(v => !isNaN(v));
        if (parsed.length < 8) {
          throw new Error('Raw signal data must contain at least 8 numerical values.');
        }
        // Zero-pad to next power of 2
        let size = 1;
        while (size < parsed.length) size *= 2;
        
        const padded = [...parsed];
        while (padded.length < size) padded.push(0);

        const time = padded.map((_, idx) => idx / samplingFreq);

        return {
          time,
          signal: padded,
          originalLength: parsed.length
        };
      } catch (e: any) {
        setError(e.message || 'Error parsing raw input numbers.');
        return null;
      }
    }

    // From formula
    setError(null);
    try {
      const compiled = math.compile(expression);
      const signal: number[] = [];
      const time: number[] = [];

      for (let i = 0; i < numSamples; i++) {
        const tVal = i / samplingFreq;
        let yVal = compiled.evaluate({ t: tVal, pi: Math.PI });
        if (typeof yVal !== 'number' || isNaN(yVal)) {
          throw new Error('Formula evaluation did not return a valid number.');
        }
        if (noiseLevel > 0) {
          // Add Gaussian-like noise
          const u1 = Math.random();
          const u2 = Math.random();
          const randStdNormal = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
          yVal += randStdNormal * noiseLevel;
        }
        signal.push(yVal);
        time.push(tVal);
      }

      return {
        time,
        signal,
        originalLength: numSamples
      };
    } catch (e: any) {
      setError(e.message || 'Invalid formula expression or parameters.');
      return null;
    }
  }, [expression, samplingFreq, numSamples, noiseLevel, rawData, useRaw]);

  // Compute FFT
  const fftResult = useMemo<FFTResult | null>(() => {
    if (!signalData) return null;
    try {
      return computeFFT(signalData.signal, samplingFreq);
    } catch (e: any) {
      setError(e.message || 'FFT calculation failed.');
      return null;
    }
  }, [signalData, samplingFreq]);

  // Export FFT results to CSV
  const handleExportCSV = () => {
    if (!signalData || !fftResult) return;
    const headers = ['Time(s)', 'Signal', 'Frequency(Hz)', 'Magnitude', 'Real', 'Imaginary'];
    const rows: string[][] = [];

    const len = signalData.signal.length;
    const fftLen = fftResult.frequencies.length;
    const maxLen = Math.max(len, fftLen);

    for (let i = 0; i < maxLen; i++) {
      rows.push([
        i < len ? signalData.time[i].toFixed(6) : '',
        i < len ? signalData.signal[i].toFixed(6) : '',
        i < fftLen ? fftResult.frequencies[i].toFixed(2) : '',
        i < fftLen ? fftResult.magnitudes[i].toFixed(6) : '',
        i < fftLen ? fftResult.real[i].toFixed(6) : '',
        i < fftLen ? fftResult.imag[i].toFixed(6) : ''
      ]);
    }

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "fft_spectral_analysis.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setExpression('3 * sin(2 * pi * 45 * t) + 2.5 * cos(2 * pi * 110 * t)');
    setSamplingFreq(1000);
    setNumSamples(256);
    setNoiseLevel(0);
    setRawData('');
    setUseRaw(false);
    setError(null);
  };

  // SVGs Paths and scaling
  const svgWidth = 400;
  const svgHeight = 150;
  const padding = 25;

  const timePath = useMemo(() => {
    if (!signalData || signalData.signal.length === 0) return '';
    const xs = signalData.time;
    const ys = signalData.signal;

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const xRange = Math.max(maxX - minX, 1e-9);
    const yRange = Math.max(maxY - minY, 1e-9);

    const points = signalData.signal.map((yVal, idx) => {
      const pctX = (signalData.time[idx] - minX) / xRange;
      const pctY = (yVal - minY) / yRange;
      const sx = padding + pctX * (svgWidth - 2 * padding);
      const sy = svgHeight - padding - pctY * (svgHeight - 2 * padding);
      return `${sx.toFixed(1)},${sy.toFixed(1)}`;
    });

    return points.length > 1 ? `M ${points.join(' L ')}` : '';
  }, [signalData]);

  const freqPath = useMemo(() => {
    if (!fftResult || fftResult.frequencies.length === 0) return '';
    const xs = fftResult.frequencies;
    const ys = fftResult.magnitudes;

    const minX = 0;
    const maxX = Math.max(...xs);
    const minY = 0;
    const maxY = Math.max(...ys);

    const xRange = Math.max(maxX - minX, 1e-9);
    const yRange = Math.max(maxY - minY, 1e-9);

    const points = fftResult.magnitudes.map((yVal, idx) => {
      const pctX = (fftResult.frequencies[idx] - minX) / xRange;
      const pctY = yVal / yRange;
      const sx = padding + pctX * (svgWidth - 2 * padding);
      const sy = svgHeight - padding - pctY * (svgHeight - 2 * padding);
      return `${sx.toFixed(1)},${sy.toFixed(1)}`;
    });

    return points.length > 1 ? `M ${points.join(' L ')}` : '';
  }, [fftResult]);

  return (
    <>
      <SEO
        title="Fourier Transform Spectral Analyzer | FFT Calculator"
        description="Calculate 1D Fast Fourier Transform (FFT) of custom signal equations or raw time-series data. View spectrum amplitude, Nyquist status, and export spectral logs."
        keywords={['fourier transform', 'fft calculator', 'spectral analysis', 'frequency spectrum', 'time domain signal']}
      />

      {/* Breadcrumbs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-4 mb-6">
        <a
          href="/math-studio"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-indigo-500 dark:text-zinc-400 dark:hover:text-indigo-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Math Studio</span>
        </a>
        <div className="text-xs text-zinc-450 dark:text-zinc-500 font-semibold flex items-center gap-1.5">
          <a href="/" className="hover:text-indigo-500 transition-colors">Home</a>
          <span className="text-zinc-350 dark:text-zinc-700">&gt;</span>
          <a href="/math-studio" className="hover:text-indigo-500 transition-colors">Math Studio</a>
          <span className="text-zinc-350 dark:text-zinc-700">&gt;</span>
          <span className="text-zinc-650 dark:text-zinc-300 font-medium">FFT Spectral Analyzer</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-650 dark:text-indigo-400">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white">
              Fourier Transform Spectral Analyzer
            </h1>
            <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-0.5">
              Analyze mathematical signal functions or raw amplitude series in frequency domain using Cooley-Tukey FFT.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          {/* Inputs Section */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
              {/* Input Choice */}
              <div>
                <label className="block text-xs font-bold text-zinc-450 uppercase tracking-wider mb-2">
                  Signal Input Source
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setUseRaw(false)}
                    className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl border transition ${
                      !useRaw
                        ? 'border-indigo-650 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400'
                        : 'border-zinc-250 dark:border-zinc-850 hover:bg-zinc-50 text-zinc-650 dark:text-zinc-450'
                    }`}
                  >
                    Formula Expression
                  </button>
                  <button
                    onClick={() => setUseRaw(true)}
                    className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl border transition ${
                      useRaw
                        ? 'border-indigo-650 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400'
                        : 'border-zinc-250 dark:border-zinc-850 hover:bg-zinc-50 text-zinc-650 dark:text-zinc-450'
                    }`}
                  >
                    Raw Amplitude Data
                  </button>
                </div>
              </div>

              {/* Dynamic Inputs depending on useRaw */}
              {!useRaw ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-zinc-455 uppercase tracking-wider mb-2">
                      Signal Formula f(t)
                    </label>
                    <input
                      type="text"
                      value={expression}
                      onChange={(e) => setExpression(e.target.value)}
                      placeholder="e.g. 3 * sin(2 * pi * 50 * t)"
                      className="w-full px-3 py-2.5 rounded-xl border border-zinc-250 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-950 font-mono text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-450 uppercase tracking-wider mb-2">
                        Samples (Power of 2)
                      </label>
                      <select
                        value={numSamples}
                        onChange={(e) => setNumSamples(parseInt(e.target.value) || 256)}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100"
                      >
                        <option value={64}>64</option>
                        <option value={128}>128</option>
                        <option value={256}>256</option>
                        <option value={512}>512</option>
                        <option value={1024}>1024</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-455 uppercase tracking-wider mb-2">
                        Gaussian Noise (σ)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={10}
                        step="0.1"
                        value={noiseLevel}
                        onChange={(e) => setNoiseLevel(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-sm font-mono text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-zinc-455 uppercase tracking-wider mb-2">
                    Paste CSV or space-separated values
                  </label>
                  <textarea
                    rows={4}
                    value={rawData}
                    onChange={(e) => setRawData(e.target.value)}
                    placeholder="e.g. 0.0, 1.2, 2.5, 1.8, -0.5, -2.1, -1.3, 0.4"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-250 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-950 font-mono text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-450 uppercase tracking-wider mb-2">
                  Sampling Frequency (fs) in Hz
                </label>
                <input
                  type="number"
                  min={1}
                  max={100000}
                  value={samplingFreq}
                  onChange={(e) => setSamplingFreq(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-sm font-mono text-zinc-900 dark:text-zinc-100"
                />
                <span className="text-[10px] text-zinc-400 mt-1 block">
                  Nyquist Frequency Limit: {(samplingFreq / 2).toFixed(1)} Hz (Max frequencies detectable)
                </span>
              </div>

              {/* Presets */}
              <div className="pt-2 border-t border-zinc-150 dark:border-zinc-800">
                <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-2">
                  Spectral Presets
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => loadExample('3 * sin(2 * pi * 45 * t) + 2.5 * cos(2 * pi * 110 * t)', 1000, 256, 0)}
                    className="px-2 py-1 bg-zinc-50 dark:bg-zinc-800 text-[10px] rounded hover:bg-zinc-100 transition-colors text-zinc-700 dark:text-zinc-300"
                  >
                    45Hz + 110Hz Sine
                  </button>
                  <button
                    onClick={() => loadExample('sin(2 * pi * 60 * t)', 500, 128, 1.2)}
                    className="px-2 py-1 bg-zinc-50 dark:bg-zinc-800 text-[10px] rounded hover:bg-zinc-100 transition-colors text-zinc-700 dark:text-zinc-300"
                  >
                    60Hz wave + Noise
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-250 dark:border-zinc-850 hover:bg-zinc-50 text-xs font-bold text-zinc-650 dark:text-zinc-400 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
                {fftResult && (
                  <button
                    onClick={handleExportCSV}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-750 text-white text-xs font-bold transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/20 text-rose-600 dark:text-rose-455 text-xs font-semibold">
                {error}
              </div>
            )}
          </div>

          {/* Right Column: Graphs & Spectral details */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Time Domain plot */}
            {signalData && (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
                <h4 className="text-xs font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider mb-3 flex justify-between">
                  <span>Time Domain Waveform</span>
                  <span className="text-[10px] text-zinc-400 font-mono">Amplitude vs Time</span>
                </h4>
                <div className="flex items-center justify-center">
                  <svg
                    width="100%"
                    height={svgHeight}
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    className="border border-zinc-100 dark:border-zinc-850 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20"
                  >
                    <line x1={padding} y1={svgHeight / 2} x2={svgWidth - padding} y2={svgHeight / 2} stroke="currentColor" className="text-zinc-300 dark:text-zinc-800" strokeWidth={1} />
                    {timePath && (
                      <path
                        d={timePath}
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    )}
                  </svg>
                </div>
              </div>
            )}

            {/* 2. Frequency Domain spectrum plot */}
            {fftResult && (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
                <h4 className="text-xs font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider mb-3 flex justify-between">
                  <span>Frequency Amplitude Spectrum</span>
                  <span className="text-[10px] text-zinc-400 font-mono">Magnitude vs Frequency (Hz)</span>
                </h4>
                <div className="flex items-center justify-center">
                  <svg
                    width="100%"
                    height={svgHeight}
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    className="border border-zinc-100 dark:border-zinc-850 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20"
                  >
                    <line x1={padding} y1={svgHeight - padding} x2={svgWidth - padding} y2={svgHeight - padding} stroke="currentColor" className="text-zinc-300 dark:text-zinc-800" strokeWidth={1} />
                    {freqPath && (
                      <path
                        d={freqPath}
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    )}
                  </svg>
                </div>
              </div>
            )}

            {/* dominant frequency panel */}
            {fftResult && (
              <div className="bg-zinc-900 dark:bg-zinc-950 text-white rounded-2xl p-6 shadow-md border border-zinc-800 space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
                  <h4 className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider">
                    Spectral FFT Analysis
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-zinc-400 block uppercase tracking-wider mb-1">
                      Dominant Frequency Peak
                    </span>
                    <span className="font-mono text-xl font-black text-emerald-400">
                      {fftResult.dominantFrequency.toFixed(2)} Hz
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block uppercase tracking-wider mb-1">
                      Nyquist Bound
                    </span>
                    <span className="font-mono text-xl font-bold text-indigo-400">
                      {(samplingFreq / 2).toFixed(1)} Hz
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Fourier Transform Info */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">
                Spectral Analysis Guidelines
              </h4>
              <div className="text-xs text-zinc-650 dark:text-zinc-350 space-y-3 leading-relaxed">
                <p>
                  The Fourier Transform decomposes a function of time into its component frequencies. It converts a signal from the time domain to the frequency domain.
                </p>
                <ul className="list-disc pl-4 space-y-1 font-mono text-[10px] text-zinc-550 dark:text-zinc-400">
                  <li>Nyquist Rate: You must sample at least twice as fast as the highest frequency component to avoid aliasing.</li>
                  <li>Zero padding: Padded values are appended to allow Cooley-Tukey operations (requires length = power of 2).</li>
                  <li>Noise filters: Frequency bins can isolate pure sine peaks from ambient Gaussian white noise.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

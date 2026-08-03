import { useState } from 'react';
import { Copy, Check, Info, LayoutGrid, Ruler, ShieldCheck } from 'lucide-react';

type UnitType = 'm' | 'ft';
type BuildingClass = 'residential' | 'commercial' | 'industrial';
type CityPreset = 'delhi' | 'mumbai' | 'bengaluru' | 'chennai';

interface CityConfig {
  label: string;
  desc: string;
  defaultPlotWidth: number; // meters
  defaultPlotDepth: number; // meters
}

const CITY_PRESETS: Record<CityPreset, CityConfig> = {
  delhi: {
    label: 'Delhi (DDA Bylaws)',
    defaultPlotWidth: 15,
    defaultPlotDepth: 25,
    desc: 'Setbacks are calculated based on plot area size category (e.g. smaller plots get row-housing concessions with 0m side setbacks).'
  },
  mumbai: {
    label: 'Mumbai (MCGM Rules)',
    defaultPlotWidth: 20,
    defaultPlotDepth: 35,
    desc: 'Strict fire safety setbacks. Side/rear margins are scaled as 1/5th to 1/6th of building height.'
  },
  bengaluru: {
    label: 'Bengaluru (BBMP Zoning)',
    defaultPlotWidth: 12,
    defaultPlotDepth: 18,
    desc: 'Setbacks are categorized by plot depth thresholds. Side setbacks step up as height increases.'
  },
  chennai: {
    label: 'Chennai (CMDA Rules)',
    defaultPlotWidth: 18,
    defaultPlotDepth: 30,
    desc: 'Non-high rise buildings require a minimum 3m front, 1.5m side, and 3m rear setbacks on roads >= 9m.'
  }
};

export default function SetbackCalculator() {
  const [unit, setUnit] = useState<UnitType>('m');
  const [city, setCity] = useState<CityPreset>('delhi');
  const [buildingType, setBuildingType] = useState<BuildingClass>('residential');
  const [plotWidth, setPlotWidth] = useState<number>(15); // in feet or meters
  const [plotDepth, setPlotDepth] = useState<number>(25); // in feet or meters
  const [height, setHeight] = useState<number>(12); // in feet or meters
  const [roadWidth, setRoadWidth] = useState<number>(12); // in feet or meters
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    // Convert inputs to meters internally for zoning calculations
    const factor = unit === 'ft' ? 0.3048 : 1;
    const plotWM = plotWidth * factor;
    const plotDM = plotDepth * factor;
    const heightM = height * factor;
    const roadWM = roadWidth * factor;

    const plotAreaM = plotWM * plotDM;

    let frontM = 3.0;
    let sideM = 2.0;
    let rearM = 2.0;

    // Apply Indian Major City bylaws
    if (city === 'delhi') {
      // DDA Bylaws based on plot area size
      if (plotAreaM < 100) {
        frontM = 1.5;
        sideM = 0; // row housing
        rearM = 0;
      } else if (plotAreaM <= 250) {
        frontM = 3.0;
        sideM = 0;
        rearM = 1.5;
      } else if (plotAreaM <= 500) {
        frontM = 4.5;
        sideM = 1.5;
        rearM = 2.0;
      } else {
        frontM = 6.0;
        sideM = 3.0;
        rearM = 3.0;
      }
    } else if (city === 'mumbai') {
      // MCGM: Height-based margins
      frontM = buildingType === 'residential' ? 4.5 : 6.0;
      // Side & Rear scaled relative to building height (typical H / 5)
      sideM = Math.max(3.0, heightM / 5);
      rearM = Math.max(3.0, heightM / 5);
    } else if (city === 'bengaluru') {
      // BBMP stepped setbacks based on plot depth
      if (plotDM <= 12) {
        frontM = 1.0;
        sideM = 1.0;
        rearM = 1.0;
      } else if (plotDM <= 18) {
        frontM = 1.5;
        sideM = 1.0;
        rearM = 1.0;
      } else if (plotDM <= 24) {
        frontM = 2.0;
        sideM = 1.5;
        rearM = 1.5;
      } else {
        frontM = 3.0;
        sideM = 2.0;
        rearM = 2.0;
      }
      // If height is high, increase side margins
      if (heightM > 12) {
        sideM += 1.0;
        rearM += 1.0;
      }
    } else if (city === 'chennai') {
      // CMDA: Non-high rise rules
      if (roadWM < 9) {
        frontM = 1.5;
        sideM = 1.0;
        rearM = 1.5;
      } else {
        frontM = heightM <= 12 ? 3.0 : 4.5;
        sideM = 1.5;
        rearM = 3.0;
      }
    }

    // Commercial adjustment (commercial layouts require extra buffer)
    if (buildingType === 'commercial' && city !== 'mumbai') {
      frontM += 1.0;
      sideM += 0.5;
    }

    // Compute Net Envelope after setback offset
    const envelopeWM = Math.max(0, plotWM - (sideM * 2));
    const envelopeDM = Math.max(0, plotDM - frontM - rearM);
    const envelopeAreaM = envelopeWM * envelopeDM;
    const maxCoverage = plotAreaM > 0 ? (envelopeAreaM / plotAreaM) * 100 : 0;

    // Convert output metrics back to user unit
    const scale = unit === 'ft' ? 1 / 0.3048 : 1;
    const finalFront = frontM * scale;
    const finalSide = sideM * scale;
    const finalRear = rearM * scale;
    const finalEnvelopeW = envelopeWM * scale;
    const finalEnvelopeD = envelopeDM * scale;
    const finalEnvelopeArea = envelopeAreaM * Math.pow(scale, 2);
    const finalPlotArea = plotAreaM * Math.pow(scale, 2);

    return {
      front: Number(finalFront.toFixed(1)),
      side: Number(finalSide.toFixed(1)),
      rear: Number(finalRear.toFixed(1)),
      envelopeWidth: Number(finalEnvelopeW.toFixed(1)),
      envelopeDepth: Number(finalEnvelopeD.toFixed(1)),
      envelopeArea: Number(finalEnvelopeArea.toFixed(1)),
      plotArea: Number(finalPlotArea.toFixed(1)),
      coverageRatio: Number(maxCoverage.toFixed(1)),
      // Visual percentages (normalized to canvas height/width)
      frontPct: Math.min(40, (frontM / plotDM) * 100),
      rearPct: Math.min(40, (rearM / plotDM) * 100),
      sidePct: Math.min(40, (sideM / plotWM) * 100)
    };
  };

  const results = calculate();

  const handleCityChange = (key: CityPreset) => {
    setCity(key);
    const preset = CITY_PRESETS[key];
    const multiplier = unit === 'ft' ? 1 / 0.3048 : 1;
    setPlotWidth(Math.round(preset.defaultPlotWidth * multiplier));
    setPlotDepth(Math.round(preset.defaultPlotDepth * multiplier));
  };

  const copyReport = () => {
    const text = `Zoning Setback Clearance Audit (${CITY_PRESETS[city].label})
----------------------------------------
Building Class: ${buildingType.toUpperCase()}
Plot size: ${plotWidth} x ${plotDepth} ${unit} (Total: ${results.plotArea} sq ${unit})
Proposed Height: ${height} ${unit} | Front Road Width: ${roadWidth} ${unit}

Calculated Clear Setbacks:
- Front Margin: ${results.front} ${unit}
- Side Margin (Left/Right): ${results.side} ${unit}
- Rear Margin: ${results.rear} ${unit}

Permissible Building Footprint:
- Max Footprint: ${results.envelopeWidth} x ${results.envelopeDepth} ${unit}
- Net Allowable Footprint Area: ${results.envelopeArea} sq ${unit}
- Permissible Plot Coverage Ratio: ${results.coverageRatio}%`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Configuration Column */}
      <div className="lg:col-span-7 space-y-6">
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Ruler className="w-5 h-5 text-indigo-500 animate-pulse" />
            <span>Site & Indian Bylaw Parameters</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                City Municipal Bylaw
              </label>
              <select
                value={city}
                onChange={(e) => handleCityChange(e.target.value as CityPreset)}
                className="saas-input font-bold"
              >
                {Object.entries(CITY_PRESETS).map(([k, preset]) => (
                  <option key={k} value={k}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                Scale Unit System
              </label>
              <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                {(['m', 'ft'] as const).map((u) => (
                  <button
                    key={u}
                    onClick={() => setUnit(u)}
                    className={`flex-1 py-1 rounded-md text-xs font-bold transition ${
                      unit === u
                        ? 'bg-white dark:bg-zinc-700 text-indigo-650 dark:text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-650'
                    }`}
                  >
                    {u === 'm' ? 'Meters' : 'Feet'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                Building Classification
              </label>
              <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                {(['residential', 'commercial'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setBuildingType(t)}
                    className={`flex-1 py-1.5 rounded-md text-[10px] font-bold capitalize transition ${
                      buildingType === t
                        ? 'bg-white dark:bg-zinc-700 text-indigo-650 dark:text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-650'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed italic">
            {CITY_PRESETS[city].desc}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Plot Width (Frontage - {unit})
              </label>
              <input
                type="number"
                value={plotWidth}
                onChange={(e) => setPlotWidth(parseFloat(e.target.value) || 0)}
                className="saas-input font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Plot Depth (Length - {unit})
              </label>
              <input
                type="number"
                value={plotDepth}
                onChange={(e) => setPlotDepth(parseFloat(e.target.value) || 0)}
                className="saas-input font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                Proposed Building Height ({unit})
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
                className="saas-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Front access Road Width ({unit})
              </label>
              <input
                type="number"
                value={roadWidth}
                onChange={(e) => setRoadWidth(parseFloat(e.target.value) || 0)}
                className="saas-input"
              />
            </div>
          </div>
        </div>

        {/* Live CSS Interactive Layout Simulator */}
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-sm">Visual Site Plan & Building Envelope</h3>
          <p className="text-xs text-zinc-400">
            Top-down blueprint view. The outer border represents the plot boundary. Dotted orange lines show the setbacks, and the central blue box is the net permissible building envelope.
          </p>

          <div className="relative w-full aspect-[16/9] bg-zinc-950 border-4 border-zinc-800 rounded-2xl p-6 shadow-inner flex items-center justify-center overflow-hidden">
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-25 pointer-events-none" />

            {/* Property Plot Box */}
            <div className="w-[85%] h-[90%] border-2 border-slate-700/60 rounded-xl relative flex items-center justify-center bg-zinc-900/10">
              <span className="absolute top-2 left-2 text-[6.5px] font-black text-slate-500 uppercase tracking-widest">
                PROPERTY BOUNDARY LINE ({plotWidth}x{plotDepth} {unit})
              </span>

              {/* Net Building Envelope Box */}
              <div
                style={{
                  top: `${results.frontPct}%`,
                  bottom: `${results.rearPct}%`,
                  left: `${results.sidePct}%`,
                  right: `${results.sidePct}%`
                }}
                className="absolute bg-indigo-500/10 border-2 border-indigo-500 rounded-lg flex flex-col justify-center items-center shadow-lg transition-all duration-300"
              >
                <span className="text-[7.5px] font-black text-indigo-400 uppercase tracking-widest text-center leading-none mb-1">
                  BUILDING ENVELOPE
                </span>
                <span className="text-[10px] font-black text-indigo-500 font-mono">
                  {results.envelopeWidth} x {results.envelopeDepth} {unit}
                </span>
              </div>

              {/* Setback dimension labels */}
              {/* Front setback label (Bottom) */}
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-bold text-amber-500 bg-slate-900 border border-amber-500/20 px-2 py-0.5 rounded">
                Front: {results.front} {unit}
              </div>

              {/* Rear setback label (Top) */}
              <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] font-bold text-amber-500 bg-slate-900 border border-amber-500/20 px-2 py-0.5 rounded">
                Rear: {results.rear} {unit}
              </div>

              {/* Side setbacks (Left/Right) */}
              <div className="absolute left-1 top-1/2 -translate-y-1/2 text-[8px] font-bold text-amber-500 bg-slate-900 border border-amber-500/20 px-2 py-0.5 rounded">
                Side: {results.side} {unit}
              </div>
              <div className="absolute right-1 top-1/2 -translate-y-1/2 text-[8px] font-bold text-amber-500 bg-slate-900 border border-amber-500/20 px-2 py-0.5 rounded">
                Side: {results.side} {unit}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Column */}
      <div className="lg:col-span-5 space-y-6">
        <div className="saas-card p-6 flex flex-col justify-between h-full space-y-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <LayoutGrid className="w-3.5 h-3.5 text-indigo-500" />
                <span>Site Analysis</span>
              </span>
              <button
                onClick={copyReport}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <span className="text-xs text-zinc-400">Net Allowable Footprint Area</span>
                <div className="text-3xl font-black mt-1 font-mono text-zinc-950 dark:text-white">
                  {results.envelopeArea} <span className="text-sm font-semibold">sq {unit}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded mt-2 border text-emerald-500 bg-emerald-500/10 border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Permissible Plot Coverage: {results.coverageRatio}%</span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Front Setback Line</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">{results.front} {unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Side Setback (Left/Right)</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">{results.side} {unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Rear Setback Line</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">{results.rear} {unit}</span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Total Plot Size Area</span>
                  <span className="font-bold font-mono text-indigo-500">
                    {results.plotArea} sq {unit}
                  </span>
                </div>
                <div className="flex justify-between border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
                  <span className="text-zinc-400 font-semibold">Max Footprint Dimensions</span>
                  <span className="font-bold font-mono text-indigo-650 dark:text-indigo-400">
                    {results.envelopeWidth} x {results.envelopeDepth} {unit}
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 text-[11px] text-zinc-400 leading-relaxed flex gap-2">
                <Info className="w-5 h-5 text-indigo-500 shrink-0" />
                <p>
                  Setbacks prevent overshadowing adjacent structures, allow natural lighting and natural ventilation, and ensure perimeter vehicular access for municipal emergency services.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { Copy, Check, Info, Layout, Sun, Wind } from 'lucide-react';

type UnitType = 'ft' | 'm';
type RoomType = 'habitable' | 'bathroom' | 'kitchen' | 'office';
type WindowStyle = 'sliding' | 'casement' | 'fixed' | 'doublehung';

interface RoomConfig {
  label: string;
  lightRatio: number; // % of floor area
  ventRatio: number; // % of floor area
}

const ROOM_PRESETS: Record<RoomType, RoomConfig> = {
  habitable: { label: 'Habitable Room (Living/Bedroom)', lightRatio: 8, ventRatio: 4 },
  bathroom: { label: 'Bathroom / Utility Space', lightRatio: 10, ventRatio: 5 },
  kitchen: { label: 'Kitchen / Cooking Area', lightRatio: 10, ventRatio: 5 },
  office: { label: 'Commercial Workspace / Office', lightRatio: 8, ventRatio: 4 }
};

interface StyleConfig {
  label: string;
  factor: number; // fraction openable
}

const WINDOW_STYLES: Record<WindowStyle, StyleConfig> = {
  sliding: { label: 'Horizontal Sliding (50% Openable)', factor: 0.50 },
  casement: { label: 'Casement / Hinged (90% Openable)', factor: 0.90 },
  fixed: { label: 'Fixed Pane (0% Openable / Light Only)', factor: 0.00 },
  doublehung: { label: 'Double Hung (50% Openable)', factor: 0.50 }
};

export default function WindowSizeCalculator() {
  const [unit, setUnit] = useState<UnitType>('ft');
  const [roomType, setRoomType] = useState<RoomType>('habitable');
  const [roomLength, setRoomLength] = useState<number>(15);
  const [roomWidth, setRoomWidth] = useState<number>(12);
  
  // Proposed Window specs
  const [winWidth, setWinWidth] = useState<number>(4); // in ft or meters
  const [winHeight, setWinHeight] = useState<number>(5); // in ft or meters
  const [winCount, setWinCount] = useState<number>(2);
  const [winStyle, setWinStyle] = useState<WindowStyle>('sliding');
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    const roomArea = roomLength * roomWidth;
    const preset = ROOM_PRESETS[roomType];
    
    // Required areas
    const reqLightArea = roomArea * (preset.lightRatio / 100);
    const reqVentArea = roomArea * (preset.ventRatio / 100);

    // Proposed areas
    const singleWindowArea = winWidth * winHeight;
    const totalProposedGlazing = singleWindowArea * winCount;
    
    const styleFactor = WINDOW_STYLES[winStyle].factor;
    const totalProposedVentilation = totalProposedGlazing * styleFactor;

    const isLightCompliant = totalProposedGlazing >= reqLightArea;
    const isVentCompliant = winStyle === 'fixed' ? (reqVentArea === 0) : (totalProposedVentilation >= reqVentArea);

    // Graphical daylight ray intensity percentage
    const lightProportion = Math.min(100, (totalProposedGlazing / reqLightArea) * 100);

    return {
      roomArea,
      reqLightArea,
      reqVentArea,
      totalProposedGlazing,
      totalProposedVentilation,
      isLightCompliant,
      isVentCompliant,
      lightProportion
    };
  };

  const results = calculate();

  const copyReport = () => {
    const text = `Window Glazing & Ventilation Audit
----------------------------------------
Room Type: ${ROOM_PRESETS[roomType].label}
Room Size: ${roomLength} x ${roomWidth} ${unit} (Area: ${results.roomArea} ${unit === 'ft' ? 'Sq. Ft' : 'm²'})
Window Dimensions: ${winWidth} x ${winHeight} ${unit} (Qty: ${winCount})
Window Style: ${WINDOW_STYLES[winStyle].label}

Required Natural Light Area (Glazing): ${results.reqLightArea.toFixed(2)} ${unit === 'ft' ? 'Sq. Ft' : 'm²'}
Proposed Glazing Area: ${results.totalProposedGlazing.toFixed(2)} ${unit === 'ft' ? 'Sq. Ft' : 'm²'}
Status: ${results.isLightCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'}

Required Ventilation Area (Openable): ${results.reqVentArea.toFixed(2)} ${unit === 'ft' ? 'Sq. Ft' : 'm²'}
Proposed Openable Area: ${results.totalProposedVentilation.toFixed(2)} ${unit === 'ft' ? 'Sq. Ft' : 'm²'}
Status: ${results.isVentCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Configuration Column */}
      <div className="lg:col-span-7 space-y-6">
        {/* Room Dimensions */}
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Layout className="w-5 h-5 text-indigo-500" />
            <span>Room Specifications</span>
          </h3>

          <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg max-w-[200px]">
            {(['ft', 'm'] as const).map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                className={`flex-1 py-1 rounded-md text-xs font-bold transition ${
                  unit === u
                    ? 'bg-white dark:bg-zinc-700 text-indigo-650 dark:text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-650'
                }`}
              >
                {u === 'ft' ? 'Feet' : 'Meters'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                Room Classification
              </label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value as RoomType)}
                className="saas-input"
              >
                {Object.keys(ROOM_PRESETS).map((k) => (
                  <option key={k} value={k}>
                    {ROOM_PRESETS[k as RoomType].label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Room Length ({unit})
              </label>
              <input
                type="number"
                value={roomLength}
                onChange={(e) => setRoomLength(parseFloat(e.target.value) || 0)}
                className="saas-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Room Width ({unit})
              </label>
              <input
                type="number"
                value={roomWidth}
                onChange={(e) => setRoomWidth(parseFloat(e.target.value) || 0)}
                className="saas-input"
              />
            </div>
            <div>
              <div className="text-xs text-zinc-400 mt-6 leading-relaxed flex gap-1">
                <Info className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>
                  Requires {ROOM_PRESETS[roomType].lightRatio}% daylight glazing area & {ROOM_PRESETS[roomType].ventRatio}% open air ventilation area.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Proposed Windows */}
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-sm">Proposed Window Schedule</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                Window Width ({unit})
              </label>
              <input
                type="number"
                value={winWidth}
                onChange={(e) => setWinWidth(parseFloat(e.target.value) || 0)}
                className="saas-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                Window Height ({unit})
              </label>
              <input
                type="number"
                value={winHeight}
                onChange={(e) => setWinHeight(parseFloat(e.target.value) || 0)}
                className="saas-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                Window Quantity
              </label>
              <input
                type="number"
                value={winCount}
                onChange={(e) => setWinCount(parseInt(e.target.value) || 1)}
                className="saas-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
              Window Opening Style (Aeration Factor)
            </label>
            <select
              value={winStyle}
              onChange={(e) => setWinStyle(e.target.value as WindowStyle)}
              className="saas-input"
            >
              {Object.keys(WINDOW_STYLES).map((s) => (
                <option key={s} value={s}>
                  {WINDOW_STYLES[s as WindowStyle].label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live CSS Interactive Layout Simulator */}
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-sm">Interactive Room Daylight Simulator</h3>
          <p className="text-xs text-zinc-400">
            Top-down room elevation view. Yellow rays represent natural sunlight penetration. The window aperture size adjusts based on your proposed window width dimensions.
          </p>

          <div className="relative w-full aspect-[16/9] bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center justify-center p-6 shadow-inner overflow-hidden">
            {/* Room envelope */}
            <div className="w-[85%] h-[80%] border-2 border-zinc-400 dark:border-zinc-800 rounded-lg relative flex items-center justify-center bg-zinc-100 dark:bg-zinc-900/60">
              <span className="absolute top-2 left-2 text-[9px] font-black text-zinc-500">
                ROOM ENVELOPE ({roomLength}x{roomWidth} {unit})
              </span>

              {/* Daylighting rays coming from top wall */}
              {winWidth > 0 && (
                <div
                  style={{
                    width: `${Math.min(90, (winWidth * winCount * 5))}%`,
                    opacity: results.lightProportion / 100
                  }}
                  className="absolute top-0 h-4/5 bg-gradient-to-b from-amber-400/30 to-transparent blur-md rounded-t-full transition-all duration-300 pointer-events-none"
                />
              )}

              {/* Window marking on top wall */}
              <div className="absolute -top-1 w-2/5 h-2 bg-sky-400 rounded flex items-center justify-center border border-sky-650">
                <span className="absolute -top-4 text-[8px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-widest">
                  Proposed Windows
                </span>
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
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Compliance Audit
              </span>
              <button
                onClick={copyReport}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="space-y-6">
              {/* Natural Lighting Panel */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-semibold flex items-center gap-1">
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span>Natural Light Area (Glazing)</span>
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      results.isLightCompliant
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-rose-500/10 text-rose-500'
                    }`}
                  >
                    {results.isLightCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'}
                  </span>
                </div>
                <div className="text-2xl font-black font-mono text-zinc-950 dark:text-white">
                  {results.totalProposedGlazing.toFixed(1)} <span className="text-xs text-zinc-450">{unit === 'ft' ? 'sq ft' : 'm²'}</span>
                </div>
                <div className="flex justify-between text-[11px] text-zinc-400">
                  <span>Code Target ({ROOM_PRESETS[roomType].lightRatio}%):</span>
                  <span>{results.reqLightArea.toFixed(1)} {unit === 'ft' ? 'sq ft' : 'm²'}</span>
                </div>
              </div>

              {/* Natural Ventilation Panel */}
              <div className="space-y-2 border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-semibold flex items-center gap-1">
                    <Wind className="w-4 h-4 text-sky-500" />
                    <span>Natural Ventilation (Air)</span>
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      results.isVentCompliant
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-rose-500/10 text-rose-500'
                    }`}
                  >
                    {results.isVentCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'}
                  </span>
                </div>
                <div className="text-2xl font-black font-mono text-zinc-950 dark:text-white">
                  {results.totalProposedVentilation.toFixed(1)} <span className="text-xs text-zinc-450">{unit === 'ft' ? 'sq ft' : 'm²'}</span>
                </div>
                <div className="flex justify-between text-[11px] text-zinc-400">
                  <span>Code Target ({ROOM_PRESETS[roomType].ventRatio}%):</span>
                  <span>{results.reqVentArea.toFixed(1)} {unit === 'ft' ? 'sq ft' : 'm²'}</span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 text-[11px] text-zinc-400 leading-relaxed flex gap-2">
                <Info className="w-5 h-5 text-indigo-500 shrink-0" />
                <p>
                  Building codes require minimum glazing areas to ensure adequate visual acuity and circadian rhythm stimulus, while openable panels provide emergency passive cooling and IAQ ventilation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
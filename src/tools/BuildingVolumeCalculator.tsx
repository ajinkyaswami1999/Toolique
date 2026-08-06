import { useState } from 'react';
import { Copy, Check, Info, Ruler, Home } from 'lucide-react';

type UnitType = 'm' | 'ft';
type RoofStyle = 'flat' | 'gable' | 'pyramid' | 'hip';

interface RoofPreset {
  label: string;
  desc: string;
}

const ROOF_STYLES: Record<RoofStyle, RoofPreset> = {
  flat: {
    label: 'Flat Roof Envelope',
    desc: 'Standard commercial slab layout. Volume is computed purely as base area multiplied by wall height.'
  },
  gable: {
    label: 'Gable (A-Frame) Roof',
    desc: 'Triangular roof volume added to the rectangular wall base.'
  },
  pyramid: {
    label: 'Pyramid (Symmetric Hip)',
    desc: 'Four-sided sloped roof meeting at a single center peak. Roof volume is 1/3 of the base area times roof height.'
  },
  hip: {
    label: 'Hip Roof (Trapezoidal)',
    desc: 'Four-sided sloped roof with a central ridge. Calculated with trapezoidal volumetric formulas.'
  }
};

export default function BuildingVolumeCalculator() {
  const [unit, setUnit] = useState<UnitType>('m');
  const [roofStyle, setRoofStyle] = useState<RoofStyle>('gable');

  // Dimensions
  const [width, setWidth] = useState<number>(10); // meters or feet
  const [length, setLength] = useState<number>(14); // meters or feet
  const [wallHeight, setWallHeight] = useState<number>(4); // meters or feet
  const [roofHeight, setRoofHeight] = useState<number>(3); // meters or feet
  
  // Custom multipliers
  const [costPerVol, setCostPerVol] = useState<number>(150); // currency per cu unit
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    const floorArea = width * length;
    const wallVol = floorArea * wallHeight;
    let roofVol = 0;

    if (roofStyle === 'flat') {
      roofVol = 0;
    } else if (roofStyle === 'gable') {
      // Gable: 0.5 * W * L * H_roof
      roofVol = 0.5 * width * length * roofHeight;
    } else if (roofStyle === 'pyramid') {
      // Pyramid: 1/3 * W * L * H_roof
      roofVol = (1 / 3) * width * length * roofHeight;
    } else if (roofStyle === 'hip') {
      // Hip roof trapezoidal volume formula approximation: 1/3 * W * L * H_roof * (factor)
      // Standard approximation: 1/3 * W * H_roof * (3*L - W) / 2
      const ridgeLen = Math.max(0, length - width);
      roofVol = (1 / 6) * width * (2 * length + ridgeLen) * roofHeight;
    }

    const totalVolume = wallVol + roofVol;

    // HVAC load estimations
    // 1 Ton of Refrigeration (TR) cools approx 12,000 BTU/h.
    // Prescriptive guideline: ~4 BTU/h per cubic foot (approx 141 BTU/h per cubic meter)
    const btuFactor = unit === 'm' ? 141 : 4;
    const totalBtuNeeded = totalVolume * btuFactor;
    const tonsRefrigeration = totalBtuNeeded / 12000;

    // ACH Airflow Rate required (Standard: 5 ACH for general occupancy)
    const airflowRate = totalVolume * 5;

    const projectedCost = totalVolume * costPerVol;

    return {
      floorArea: Number(floorArea.toFixed(1)),
      wallVolume: Number(wallVol.toFixed(1)),
      roofVolume: Number(roofVol.toFixed(1)),
      totalVolume: Number(totalVolume.toFixed(1)),
      btuLoad: Number(totalBtuNeeded.toFixed(0)),
      tonsLoad: Number(tonsRefrigeration.toFixed(1)),
      airflowRate: Number(airflowRate.toFixed(0)),
      projectedCost: Number(projectedCost.toFixed(0))
    };
  };

  const results = calculate();

  const handleUnitChange = (newUnit: UnitType) => {
    const factor = newUnit === 'ft' ? 3.28084 : 1 / 3.28084;
    setUnit(newUnit);
    setWidth(Number((width * factor).toFixed(1)));
    setLength(Number((length * factor).toFixed(1)));
    setWallHeight(Number((wallHeight * factor).toFixed(1)));
    setRoofHeight(Number((roofHeight * factor).toFixed(1)));
    setCostPerVol(newUnit === 'ft' ? Number((costPerVol / 35.3147).toFixed(2)) : Number((costPerVol * 35.3147).toFixed(1)));
  };

  const copyReport = () => {
    const volUnit = `cu ${unit}`;
    const areaUnit = `sq ${unit}`;
    const flowUnit = unit === 'm' ? 'm³/h' : 'CFM';

    const text = `Building Envelope Volume & HVAC Spec Audit
----------------------------------------
Roof Style Profile: ${ROOF_STYLES[roofStyle].label}
Building Dimensions: ${width} x ${length} ${unit} | Wall Ht: ${wallHeight} ${unit}

Volumetric Calculations:
- Ground Floor Area: ${results.floorArea} ${areaUnit}
- Wall Envelope Volume: ${results.wallVolume} ${volUnit}
- Roof Attic Volume: ${results.roofVolume} ${volUnit}
- Total Building Volume: ${results.totalVolume} ${volUnit}

HVAC Thermal Estimates:
- Recommended Cooling: ${results.btuLoad} BTU/h (${results.tonsLoad} Tons)
- Required Airflow (5 ACH): ${results.airflowRate} ${flowUnit}

Project Cost Projection:
- Cost Factor: ${costPerVol} per ${volUnit}
- Envelope Cost Projection: $${results.projectedCost.toLocaleString()}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // SVG 3D Isometric Projection Points Builder
  // Standard projection center (250, 190). Scales coordinates for realistic drafting box view.
  const render3DBuilding = () => {
    const scale = 8;
    const w = width * scale;
    const l = length * scale;
    const hw = wallHeight * scale;
    const hr = roofHeight * scale;

    const cx = 250;
    const cy = 200;

    // Isometric vector conversions: X_iso = (x - y) * cos(30), Y_iso = (x + y) * sin(30)
    const cos30 = 0.866;
    const sin30 = 0.5;

    const getIso = (x: number, y: number, z: number) => {
      return {
        px: cx + (x - y) * cos30,
        py: cy + (x + y) * sin30 - z
      };
    };

    // 3D Box vertices
    // Ground level base: P0 (0,0), P1 (w,0), P2 (w,l), P3 (0,l)
    const p0 = getIso(0, 0, 0);
    const p1 = getIso(w, 0, 0);
    const p2 = getIso(w, l, 0);
    const p3 = getIso(0, l, 0);

    // Wall Top level: P4 (0,0), P5 (w,0), P6 (w,l), P7 (0,l)
    const p4 = getIso(0, 0, hw);
    const p5 = getIso(w, 0, hw);
    const p6 = getIso(w, l, hw);
    const p7 = getIso(0, l, hw);

    // Roof ridge peak vertices depending on style
    let r1 = p4;
    let r2 = p5;

    if (roofStyle === 'pyramid') {
      // Single center peak: center is (w/2, l/2)
      const pPeak = getIso(w / 2, l / 2, hw + hr);
      r1 = pPeak;
      r2 = pPeak;
    } else if (roofStyle === 'gable') {
      // Gable ridge goes along the length centered on the width: from (w/2, 0) to (w/2, l)
      r1 = getIso(w / 2, 0, hw + hr);
      r2 = getIso(w / 2, l, hw + hr);
    } else if (roofStyle === 'hip') {
      // Hip ridge is shorter than length: from (w/2, w/2) to (w/2, l - w/2)
      const ridgeStart = Math.min(l / 2, w / 2);
      r1 = getIso(w / 2, ridgeStart, hw + hr);
      r2 = getIso(w / 2, l - ridgeStart, hw + hr);
    }

    return (
      <svg className="w-full h-full p-4" viewBox="0 0 500 380">
        {/* Floor area plane */}
        <polygon
          points={`${p0.px},${p0.py} ${p1.px},${p1.py} ${p2.px},${p2.py} ${p3.px},${p3.py}`}
          fill="rgba(99, 102, 241, 0.05)"
          stroke="#334155"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />

        {/* Vertical Wall lines */}
        <line x1={p0.px} y1={p0.py} x2={p4.px} y2={p4.py} stroke="#475569" strokeWidth="2" />
        <line x1={p1.px} y1={p1.py} x2={p5.px} y2={p5.py} stroke="#475569" strokeWidth="2" />
        <line x1={p2.px} y1={p2.py} x2={p6.px} y2={p6.py} stroke="#475569" strokeWidth="2" />
        <line x1={p3.px} y1={p3.py} x2={p7.px} y2={p7.py} stroke="#475569" strokeWidth="2" />

        {/* Wall top perimeter plane */}
        <polygon
          points={`${p4.px},${p4.py} ${p5.px},${p5.py} ${p6.px},${p6.py} ${p7.px},${p7.py}`}
          fill="none"
          stroke="#475569"
          strokeWidth="2"
        />

        {/* Roof rendering */}
        {roofStyle !== 'flat' && (
          <>
            {/* Draw Ridge Line */}
            {roofStyle !== 'pyramid' && (
              <line x1={r1.px} y1={r1.py} x2={r2.px} y2={r2.py} stroke="#eab308" strokeWidth="2.5" />
            )}

            {/* Sloped hip/gable planes lines */}
            <line x1={p4.px} y1={p4.py} x2={r1.px} y2={r1.py} stroke="#eab308" strokeWidth="2" />
            <line x1={p5.px} y1={p5.py} x2={r1.px} y2={r1.py} stroke="#eab308" strokeWidth="2" />
            <line x1={p6.px} y1={p6.py} x2={r2.px} y2={r2.py} stroke="#eab308" strokeWidth="2" />
            <line x1={p7.px} y1={p7.py} x2={r2.px} y2={r2.py} stroke="#eab308" strokeWidth="2" />

            {/* If Hip roof, draw connection lines from corners to peak ridge offsets */}
            {roofStyle === 'hip' && (
              <>
                <line x1={p4.px} y1={p4.py} x2={r1.px} y2={r1.py} stroke="#eab308" strokeWidth="2" />
                <line x1={p7.px} y1={p7.py} x2={r2.px} y2={r2.py} stroke="#eab308" strokeWidth="2" />
              </>
            )}
          </>
        )}

        {/* Key Dimension lines annotation overlay */}
        {/* Width Dimension */}
        <line x1={p0.px - 10} y1={p0.py + 5} x2={p1.px - 10} y2={p1.py + 5} stroke="#64748b" strokeWidth="0.8" />
        <text x={(p0.px + p1.px) / 2 - 20} y={(p0.py + p1.py) / 2 + 15} fill="#64748b" fontSize="8" fontFamily="monospace">
          W: {width}{unit}
        </text>

        {/* Wall Height Dimension */}
        <line x1={p1.px + 10} y1={p1.py} x2={p1.px + 10} y2={p5.py} stroke="#64748b" strokeWidth="0.8" />
        <text x={p1.px + 15} y={(p1.py + p5.py) / 2 + 4} fill="#64748b" fontSize="8" fontFamily="monospace">
          H_wall: {wallHeight}{unit}
        </text>
      </svg>
    );
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Parameter Column */}
      <div className="lg:col-span-7 space-y-6">
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Ruler className="w-5 h-5 text-indigo-500 animate-pulse" />
            <span>Building Envelope Dimensions</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Roof Profile
              </label>
              <select
                value={roofStyle}
                onChange={(e) => setRoofStyle(e.target.value as RoofStyle)}
                className="saas-input font-bold"
              >
                {Object.entries(ROOF_STYLES).map(([k, cfg]) => (
                  <option key={k} value={k}>
                    {cfg.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Scale Unit System
              </label>
              <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                {(['m', 'ft'] as const).map((u) => (
                  <button
                    key={u}
                    onClick={() => handleUnitChange(u)}
                    className={`flex-1 py-1 rounded-md text-[10px] font-bold uppercase transition ${
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
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Cost Factor ($/cu {unit})
              </label>
              <input
                type="number"
                value={costPerVol}
                onChange={(e) => setCostPerVol(parseFloat(e.target.value) || 0)}
                className="saas-input font-bold"
              />
            </div>
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed italic">
            {ROOF_STYLES[roofStyle].desc}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-t pt-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Base Width ({unit})
              </label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
                className="saas-input font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Base Length ({unit})
              </label>
              <input
                type="number"
                value={length}
                onChange={(e) => setLength(parseFloat(e.target.value) || 0)}
                className="saas-input font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Wall Height ({unit})
              </label>
              <input
                type="number"
                value={wallHeight}
                onChange={(e) => setWallHeight(parseFloat(e.target.value) || 0)}
                className="saas-input font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Roof Height ({unit})
              </label>
              <input
                type="number"
                disabled={roofStyle === 'flat'}
                value={roofHeight}
                onChange={(e) => setRoofHeight(parseFloat(e.target.value) || 0)}
                className="saas-input font-bold disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Dynamic 3D Isometric Viewport Representation */}
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-sm">3D Isometric Viewport</h3>
          <p className="text-xs text-zinc-455">
            3D axonometric vector schematic. Golden lines delineate the roof truss shape. Blue coordinates indicate wall limits.
          </p>

          <div className="relative w-full aspect-[16/10] bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center shadow-inner overflow-hidden">
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-20 pointer-events-none" />

            {/* Axonometric svg drawing */}
            <div className="absolute inset-0 flex items-center justify-center">
              {render3DBuilding()}
            </div>
          </div>
        </div>
      </div>

      {/* Results details panel */}
      <div className="lg:col-span-5 space-y-6">
        <div className="saas-card p-6 flex flex-col justify-between h-full space-y-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-indigo-500" />
                <span>Volumetric Audit</span>
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
                <span className="text-xs text-zinc-455">Total Building Volume</span>
                <div className="text-3xl font-black mt-1 font-mono text-zinc-950 dark:text-white">
                  {results.totalVolume.toLocaleString()} <span className="text-sm font-semibold">cu {unit}</span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 text-xs">
                <span className="text-[10px] text-zinc-555 font-black uppercase tracking-wider block">Envelope Volume Breakdown</span>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Ground Floor footprint</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">
                    {results.floorArea.toLocaleString()} sq {unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Wall Envelope Volume</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">
                    {results.wallVolume.toLocaleString()} cu {unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Roof Attic Volume</span>
                  <span className="font-bold font-mono text-indigo-500">
                    {results.roofVolume.toLocaleString()} cu {unit}
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 text-xs">
                <span className="text-[10px] text-zinc-555 font-black uppercase tracking-wider block">HVAC & Thermal Sizing</span>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Estimated Cooling Load</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">
                    {results.btuLoad.toLocaleString()} BTU/h (~ {results.tonsLoad} Tons)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Airflow Circulation Rate (5 ACH)</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">
                    {results.airflowRate.toLocaleString()} {unit === 'm' ? 'm³/h' : 'CFM'}
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 text-xs">
                <span className="text-[10px] text-zinc-555 font-black uppercase tracking-wider block">Cost Projections</span>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Projected Construction Cost</span>
                  <span className="font-bold font-mono text-emerald-500">
                    $ {results.projectedCost.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 text-[11px] text-zinc-400 leading-relaxed flex gap-2">
                <Info className="w-5 h-5 text-indigo-500 shrink-0" />
                <p>
                  Building volume regulates thermal gains and air changes. Choosing the right roof style profile ensures energy efficient HVAC sizing and accurate material estimations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
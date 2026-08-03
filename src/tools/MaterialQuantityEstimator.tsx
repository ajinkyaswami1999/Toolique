import { useState } from 'react';
import { Copy, Check, Info, Box, Landmark, Droplet } from 'lucide-react';

type EstimateMode = 'concrete' | 'brickwork' | 'plaster';
type UnitType = 'ft' | 'm';

interface MixGrade {
  label: string;
  cement: number;
  sand: number;
  aggregate: number;
}

const CONCRETE_GRADES: Record<string, MixGrade> = {
  M25: { label: 'M25 (1 : 1 : 2)', cement: 1, sand: 1, aggregate: 2 },
  M20: { label: 'M20 (1 : 1.5 : 3)', cement: 1, sand: 1.5, aggregate: 3 },
  M15: { label: 'M15 (1 : 2 : 4)', cement: 1, sand: 2, aggregate: 4 },
  M10: { label: 'M10 (1 : 3 : 6)', cement: 1, sand: 3, aggregate: 6 }
};

const MORTAR_RATIOS: Record<string, { label: string; cement: number; sand: number }> = {
  '1:3': { label: '1 : 3 (Rich Mix)', cement: 1, sand: 3 },
  '1:4': { label: '1 : 4 (Standard Wall)', cement: 1, sand: 4 },
  '1:5': { label: '1 : 5 (Medium)', cement: 1, sand: 5 },
  '1:6': { label: '1 : 6 (Lean Mix)', cement: 1, sand: 6 }
};

export default function MaterialQuantityEstimator() {
  const [mode, setMode] = useState<EstimateMode>('concrete');
  const [unit, setUnit] = useState<UnitType>('ft');
  const [copied, setCopied] = useState(false);

  // Concrete state
  const [cLength, setCLength] = useState<number>(30);
  const [cWidth, setCWidth] = useState<number>(20);
  const [cThickness, setCThickness] = useState<number>(6); // inches or cm
  const [cGrade, setCGrade] = useState<string>('M20');

  // Brickwork state
  const [bLength, setBLength] = useState<number>(50);
  const [bHeight, setBHeight] = useState<number>(10);
  const [bThickness, setBThickness] = useState<number>(9); // inches or cm
  const [bRatio, setBRatio] = useState<string>('1:4');
  const [wasteFactor, setWasteFactor] = useState<boolean>(true); // 5% waste

  // Plaster state
  const [pArea, setPArea] = useState<number>(600);
  const [pThickness, setPThickness] = useState<number>(15); // mm
  const [pRatio, setPRatio] = useState<string>('1:4');

  const calculateConcrete = () => {
    let volM3 = 0;
    if (unit === 'ft') {
      const lengthM = cLength * 0.3048;
      const widthM = cWidth * 0.3048;
      const thickM = (cThickness / 12) * 0.3048;
      volM3 = lengthM * widthM * thickM;
    } else {
      const thickM = cThickness / 100;
      volM3 = cLength * cWidth * thickM;
    }

    const dryVol = volM3 * 1.54; // 54% dry volume expansion
    const grade = CONCRETE_GRADES[cGrade];
    const totalParts = grade.cement + grade.sand + grade.aggregate;

    const cementM3 = (dryVol * grade.cement) / totalParts;
    // 1 bag of cement is 0.035 cubic meters
    const cementBags = Math.ceil(cementM3 / 0.035);
    const sandM3 = (dryVol * grade.sand) / totalParts;
    const aggregateM3 = (dryVol * grade.aggregate) / totalParts;
    
    // Water estimation: Cement weight (bags * 50kg) * 0.45 water-cement ratio
    const waterLiters = cementBags * 50 * 0.45;

    return {
      volume: volM3,
      cement: cementBags,
      sand: sandM3,
      aggregate: aggregateM3,
      water: waterLiters
    };
  };

  const calculateBrickwork = () => {
    let wallVolM3 = 0;
    if (unit === 'ft') {
      const lengthM = bLength * 0.3048;
      const heightM = bHeight * 0.3048;
      const thickM = (bThickness / 12) * 0.3048;
      wallVolM3 = lengthM * heightM * thickM;
    } else {
      const thickM = bThickness / 100;
      wallVolM3 = bLength * bHeight * thickM;
    }

    // Standard modular brick with mortar: 20cm x 10cm x 10cm = 0.002 m3
    // Bricks per m3 of wall = 500 bricks
    let brickCount = wallVolM3 * 500;
    if (wasteFactor) brickCount *= 1.05; // 5% wastage

    // Brick size without mortar: 19cm x 9cm x 9cm = 0.001539 m3
    const actualBricksCount = Math.ceil(wallVolM3 * 500);
    const brickVolNoMortar = actualBricksCount * 0.001539;
    const wetMortarVol = Math.max(0, wallVolM3 - brickVolNoMortar);
    const dryMortarVol = wetMortarVol * 1.33; // 33% dry mortar shrinkage

    const ratio = MORTAR_RATIOS[bRatio];
    const totalParts = ratio.cement + ratio.sand;
    const cementM3 = (dryMortarVol * ratio.cement) / totalParts;
    const cementBags = Math.ceil(cementM3 / 0.035);
    const sandM3 = (dryMortarVol * ratio.sand) / totalParts;

    return {
      volume: wallVolM3,
      bricks: Math.ceil(brickCount),
      cement: cementBags,
      sand: sandM3
    };
  };

  const calculatePlaster = () => {
    let areaM2 = 0;
    if (unit === 'ft') {
      areaM2 = pArea * 0.092903;
    } else {
      areaM2 = pArea;
    }

    const thicknessM = pThickness / 1000;
    const wetVol = areaM2 * thicknessM;
    const dryVol = wetVol * 1.35; // 35% dry expansion for plaster

    const ratio = MORTAR_RATIOS[pRatio];
    const totalParts = ratio.cement + ratio.sand;
    const cementM3 = (dryVol * ratio.cement) / totalParts;
    const cementBags = Math.ceil(cementM3 / 0.035);
    const sandM3 = (dryVol * ratio.sand) / totalParts;

    return {
      volume: wetVol,
      cement: cementBags,
      sand: sandM3
    };
  };

  const cResults = calculateConcrete();
  const bResults = calculateBrickwork();
  const pResults = calculatePlaster();

  const copyReport = () => {
    let text = `Material Quantity Estimation Report\n----------------------------------------\n`;
    if (mode === 'concrete') {
      text += `Job: Concrete Slab/Foundation
Dimensions: ${cLength} x ${cWidth} ${unit === 'ft' ? 'ft' : 'm'} (Thickness: ${cThickness} ${unit === 'ft' ? 'in' : 'cm'})
Mix Grade: ${CONCRETE_GRADES[cGrade].label}
Total Volume: ${cResults.volume.toFixed(2)} m³
Cement Bags (50kg): ${cResults.cement} Bags
Sand Quantity: ${cResults.sand.toFixed(2)} m³
Coarse Aggregate: ${cResults.aggregate.toFixed(2)} m³
Water Required: ${cResults.water.toFixed(0)} Liters`;
    } else if (mode === 'brickwork') {
      text += `Job: Brick Masonry Wall
Wall Dimensions: ${bLength} x ${bHeight} ${unit === 'ft' ? 'ft' : 'm'} (Thickness: ${bThickness} ${unit === 'ft' ? 'in' : 'cm'})
Mortar Ratio: ${MORTAR_RATIOS[bRatio].label}
Total Bricks Required: ${bResults.bricks} Bricks
Cement Bags (50kg): ${bResults.cement} Bags
Sand Quantity: ${bResults.sand.toFixed(2)} m³`;
    } else {
      text += `Job: Wall Plastering
Area: ${pArea} ${unit === 'ft' ? 'sq ft' : 'm²'} (Thickness: ${pThickness} mm)
Mortar Ratio: ${MORTAR_RATIOS[pRatio].label}
Cement Bags (50kg): ${pResults.cement} Bags
Sand Quantity: ${pResults.sand.toFixed(2)} m³`;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Configuration Column */}
      <div className="lg:col-span-7 space-y-6">
        {/* Estimator Modes */}
        <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl max-w-md">
          {[
            { id: 'concrete', label: 'Concrete Slab' },
            { id: 'brickwork', label: 'Brick Wall' },
            { id: 'plaster', label: 'Plastering' }
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id as EstimateMode)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
                mode === m.id
                  ? 'bg-white dark:bg-zinc-700 text-indigo-650 dark:text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-650'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Input Details */}
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Box className="w-5 h-5 text-indigo-500" />
            <span>Job Details</span>
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
                {u === 'ft' ? 'Feet / Inches' : 'Meters / Cm'}
              </button>
            ))}
          </div>

          {/* Concrete Inputs */}
          {mode === 'concrete' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                    Slab Length ({unit === 'ft' ? 'Feet' : 'Meters'})
                  </label>
                  <input
                    type="number"
                    value={cLength}
                    onChange={(e) => setCLength(parseFloat(e.target.value) || 0)}
                    className="saas-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                    Slab Width ({unit === 'ft' ? 'Feet' : 'Meters'})
                  </label>
                  <input
                    type="number"
                    value={cWidth}
                    onChange={(e) => setCWidth(parseFloat(e.target.value) || 0)}
                    className="saas-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                    Thickness ({unit === 'ft' ? 'Inches' : 'Cm'})
                  </label>
                  <input
                    type="number"
                    value={cThickness}
                    onChange={(e) => setCThickness(parseFloat(e.target.value) || 0)}
                    className="saas-input"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                  Nominal Concrete Mix
                </label>
                <select
                  value={cGrade}
                  onChange={(e) => setCGrade(e.target.value)}
                  className="saas-input"
                >
                  {Object.keys(CONCRETE_GRADES).map((g) => (
                    <option key={g} value={g}>
                      {CONCRETE_GRADES[g].label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Brickwork Inputs */}
          {mode === 'brickwork' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                    Wall Length ({unit === 'ft' ? 'Feet' : 'Meters'})
                  </label>
                  <input
                    type="number"
                    value={bLength}
                    onChange={(e) => setBLength(parseFloat(e.target.value) || 0)}
                    className="saas-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                    Wall Height ({unit === 'ft' ? 'Feet' : 'Meters'})
                  </label>
                  <input
                    type="number"
                    value={bHeight}
                    onChange={(e) => setBHeight(parseFloat(e.target.value) || 0)}
                    className="saas-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                    Wall Thickness ({unit === 'ft' ? 'Inches' : 'Cm'})
                  </label>
                  <input
                    type="number"
                    value={bThickness}
                    onChange={(e) => setBThickness(parseFloat(e.target.value) || 0)}
                    className="saas-input"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                    Mortar Mix Ratio
                  </label>
                  <select
                    value={bRatio}
                    onChange={(e) => setBRatio(e.target.value)}
                    className="saas-input"
                  >
                    {Object.keys(MORTAR_RATIOS).map((r) => (
                      <option key={r} value={r}>
                        {MORTAR_RATIOS[r].label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    checked={wasteFactor}
                    id="waste"
                    onChange={(e) => setWasteFactor(e.target.checked)}
                    className="rounded border-zinc-300 text-indigo-650 focus:ring-indigo-500"
                  />
                  <label htmlFor="waste" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                    Include 5% Wastage Buffer
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Plastering Inputs */}
          {mode === 'plaster' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                    Plaster Area ({unit === 'ft' ? 'Sq. Feet' : 'Sq. Meters'})
                  </label>
                  <input
                    type="number"
                    value={pArea}
                    onChange={(e) => setPArea(parseFloat(e.target.value) || 0)}
                    className="saas-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                    Plaster Thickness (mm)
                  </label>
                  <input
                    type="number"
                    value={pThickness}
                    onChange={(e) => setPThickness(parseFloat(e.target.value) || 0)}
                    className="saas-input"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                  Mortar Mix Ratio
                </label>
                <select
                  value={pRatio}
                  onChange={(e) => setPRatio(e.target.value)}
                  className="saas-input"
                >
                  {Object.keys(MORTAR_RATIOS).map((r) => (
                    <option key={r} value={r}>
                      {MORTAR_RATIOS[r].label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Column */}
      <div className="lg:col-span-5 space-y-6">
        <div className="saas-card p-6 flex flex-col justify-between h-full space-y-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Estimation Results
              </span>
              <button
                onClick={copyReport}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Concrete Output */}
            {mode === 'concrete' && (
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-zinc-400">Total Concrete Volume</span>
                  <div className="text-2xl font-black mt-1 font-mono text-zinc-950 dark:text-white">
                    {cResults.volume.toFixed(2)} m³
                  </div>
                </div>

                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 text-xs">
                  <div className="flex justify-between items-center p-2 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg">
                    <span className="font-semibold text-zinc-550 flex items-center gap-1.5">
                      <Landmark className="w-4 h-4 text-indigo-500" />
                      <span>Cement Bags (50kg)</span>
                    </span>
                    <span className="font-bold font-mono text-indigo-650 dark:text-indigo-400">
                      {cResults.cement} Bags
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg">
                    <span className="font-semibold text-zinc-550">Fine Sand Volume</span>
                    <span className="font-bold font-mono text-zinc-950 dark:text-white">
                      {cResults.sand.toFixed(2)} m³
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg">
                    <span className="font-semibold text-zinc-550">Coarse Aggregates</span>
                    <span className="font-bold font-mono text-zinc-950 dark:text-white">
                      {cResults.aggregate.toFixed(2)} m³
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg border border-dashed border-sky-200">
                    <span className="font-semibold text-zinc-550 flex items-center gap-1.5">
                      <Droplet className="w-4 h-4 text-sky-500" />
                      <span>Est. Mixing Water</span>
                    </span>
                    <span className="font-bold font-mono text-sky-600 dark:text-sky-400">
                      {cResults.water.toFixed(0)} Liters
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Brickwork Output */}
            {mode === 'brickwork' && (
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-zinc-400">Bricks Count Required</span>
                  <div className="text-2xl font-black mt-1 font-mono text-zinc-950 dark:text-white">
                    {bResults.bricks} Bricks
                  </div>
                </div>

                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 text-xs">
                  <div className="flex justify-between items-center p-2 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg">
                    <span className="font-semibold text-zinc-550 flex items-center gap-1.5">
                      <Landmark className="w-4 h-4 text-indigo-500" />
                      <span>Mortar Cement Bags</span>
                    </span>
                    <span className="font-bold font-mono text-indigo-650 dark:text-indigo-400">
                      {bResults.cement} Bags
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg">
                    <span className="font-semibold text-zinc-550">Mortar Sand Volume</span>
                    <span className="font-bold font-mono text-zinc-950 dark:text-white">
                      {bResults.sand.toFixed(2)} m³
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-100 dark:border-zinc-800 pt-3">
                    <span className="text-zinc-400">Total Wall Volume</span>
                    <span className="font-bold font-mono">{bResults.volume.toFixed(2)} m³</span>
                  </div>
                </div>
              </div>
            )}

            {/* Plaster Output */}
            {mode === 'plaster' && (
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-zinc-400">Plaster Wet Volume</span>
                  <div className="text-2xl font-black mt-1 font-mono text-zinc-950 dark:text-white">
                    {pResults.volume.toFixed(3)} m³
                  </div>
                </div>

                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 text-xs">
                  <div className="flex justify-between items-center p-2 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg">
                    <span className="font-semibold text-zinc-550 flex items-center gap-1.5">
                      <Landmark className="w-4 h-4 text-indigo-500" />
                      <span>Mortar Cement Bags</span>
                    </span>
                    <span className="font-bold font-mono text-indigo-650 dark:text-indigo-400">
                      {pResults.cement} Bags
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg">
                    <span className="font-semibold text-zinc-550">Mortar Sand Volume</span>
                    <span className="font-bold font-mono text-zinc-950 dark:text-white">
                      {pResults.sand.toFixed(2)} m³
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 text-[11px] text-zinc-400 leading-relaxed flex gap-2">
              <Info className="w-5 h-5 text-indigo-500 shrink-0" />
              <p>
                Calculations conform to standard dry volume expansion indexes (1.54x for concrete, 1.33x for brick mortar, 1.35x for plastering). Bricks estimates assume standard modular size (19cm x 9cm x 9cm).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
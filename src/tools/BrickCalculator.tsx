import { useState, useEffect } from 'react';
import { Ruler, Copy, Check, RotateCcw } from 'lucide-react';

interface BrickType {
  name: string;
  l: number; // in inches
  w: number;
  h: number;
}

const brickSizes: Record<string, BrickType> = {
  standard: { name: 'Standard Modular (9"x4.5"x3")', l: 9, w: 4.5, h: 3 },
  clay: { name: 'Traditional Clay (9"x4.25"x2.75")', l: 9, w: 4.25, h: 2.75 },
  flyash: { name: 'Fly Ash Brick (9"x4"x3")', l: 9, w: 4, h: 3 },
};

const mortarRatios: Record<string, { name: string; cement: number; sand: number }> = {
  '1:3': { name: '1:3 (Rich Mortar)', cement: 1, sand: 3 },
  '1:4': { name: '1:4 (Standard Wall)', cement: 1, sand: 4 },
  '1:5': { name: '1:5 (Plastering/Masonry)', cement: 1, sand: 5 },
  '1:6': { name: '1:6 (Standard Partition)', cement: 1, sand: 6 },
};

export default function BrickCalculator() {
  const [wallLength, setWallLength] = useState<number>(20);
  const [wallHeight, setWallHeight] = useState<number>(10);
  const [thickness, setThickness] = useState<number>(9); // 9 inch or 4.5 inch
  const [brickType, setBrickType] = useState<string>('standard');
  const [mortarRatio, setMortarRatio] = useState<string>('1:5');
  const [wastage, setWastage] = useState<number>(5);
  const [copied, setCopied] = useState<boolean>(false);

  const [results, setResults] = useState({
    numBricks: 0,
    mortarVolume: 0, // cu m
    cementBags: 0,
    sandCuft: 0,
  });

  useEffect(() => {
    // 1. Calculate wall volume u/s cubic meters
    const wallVolM3 = (wallLength * 0.3048) * (wallHeight * 0.3048) * ((thickness / 12) * 0.3048);

    // 2. Load brick size u/s meters (without mortar)
    const b = brickSizes[brickType] || brickSizes.standard;
    const bVol = (b.l * 0.0254) * (b.w * 0.0254) * (b.h * 0.0254);

    // 3. Size with mortar (assuming standard 10mm or 0.4 inches joint)
    const joint = 10 / 1000; // 10mm in meters
    const bVolWithMortar = (b.l * 0.0254 + joint) * (b.w * 0.0254 + joint) * (b.h * 0.0254 + joint);

    // 4. Compute number of bricks
    let numBricks = wallVolM3 / bVolWithMortar;
    numBricks = numBricks * (1 + wastage / 100);

    // 5. Compute mortar volume (in cubic meters)
    const cleanBricks = wallVolM3 / bVolWithMortar;
    const totalBrickVol = cleanBricks * bVol;
    let wetMortarVol = wallVolM3 - totalBrickVol;

    // Expand wet mortar to dry volume (dry volume is approx 1.33 times wet volume)
    const dryMortarVol = wetMortarVol * 1.33;

    // Mortar splits u/s mix ratio
    const ratio = mortarRatios[mortarRatio] || mortarRatios['1:5'];
    const totalParts = ratio.cement + ratio.sand;

    const cementVol = (ratio.cement / totalParts) * dryMortarVol;
    const sandVol = (ratio.sand / totalParts) * dryMortarVol;

    // 1 bag of cement = 0.0347 m3
    const cementBags = cementVol / 0.0347;
    const sandCuft = sandVol * 35.3147;

    setResults({
      numBricks: Math.ceil(numBricks),
      mortarVolume: Number(wetMortarVol.toFixed(3)),
      cementBags: Math.ceil(cementBags),
      sandCuft: Number(sandCuft.toFixed(2)),
    });
  }, [wallLength, wallHeight, thickness, brickType, mortarRatio, wastage]);

  const copyReport = () => {
    const text = `Brick Masonry Estimate (Toolique)
----------------------------------------
Wall Size  : ${wallLength} ft x ${wallHeight} ft (${thickness}" Thickness)
Brick Type : ${brickSizes[brickType].name}
Mortar Mix : ${mortarRatios[mortarRatio].name}
Wastage    : ${wastage}%
----------------------------------------
Bricks Req : ${results.numBricks.toLocaleString()} Pcs
Cement Req : ${results.cementBags} Bags (50 kg)
Sand Req   : ${results.sandCuft} Cu Ft
Mortar Vol : ${results.mortarVolume} m³
----------------------------------------
Estimated u/s standard brick joint ratios.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setWallLength(20);
    setWallHeight(10);
    setThickness(9);
    setBrickType('standard');
    setMortarRatio('1:5');
    setWastage(5);
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      {/* Input Panel */}
      <div className="md:col-span-7 p-6 saas-card space-y-4">
        <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Ruler className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-zinc-805 dark:text-white text-sm">Wall & Brick details</h3>
          </div>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-650 dark:hover:text-zinc-200 transition"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Wall Dimensions */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 mb-1.5">
              Length (ft)
            </label>
            <input
              type="number"
              value={wallLength || ''}
              onChange={(e) => setWallLength(Math.max(0, parseFloat(e.target.value) || 0))}
              className="saas-input"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 mb-1.5">
              Height (ft)
            </label>
            <input
              type="number"
              value={wallHeight || ''}
              onChange={(e) => setWallHeight(Math.max(0, parseFloat(e.target.value) || 0))}
              className="saas-input"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 mb-1.5">
              Thickness
            </label>
            <select
              value={thickness}
              onChange={(e) => setThickness(parseInt(e.target.value) || 9)}
              className="saas-select animate-none"
            >
              <option value={9}>9-inch (Outer Wall)</option>
              <option value={4.5}>4.5-inch (Partition)</option>
            </select>
          </div>
        </div>

        {/* Brick Type */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 mb-1.5">
            Brick Size / Class
          </label>
          <select
            value={brickType}
            onChange={(e) => setBrickType(e.target.value)}
            className="saas-select"
          >
            {Object.keys(brickSizes).map((k) => (
              <option key={k} value={k}>
                {brickSizes[k].name}
              </option>
            ))}
          </select>
        </div>

        {/* Mortar and Wastage */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 mb-1.5">
              Mortar Mix Ratio
            </label>
            <select
              value={mortarRatio}
              onChange={(e) => setMortarRatio(e.target.value)}
              className="saas-select"
            >
              {Object.keys(mortarRatios).map((k) => (
                <option key={k} value={k}>
                  {mortarRatios[k].name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 mb-1.5">
              Wastage Buffer (%)
            </label>
            <input
              type="number"
              min="0"
              value={wastage || ''}
              onChange={(e) => setWastage(Math.max(0, parseInt(e.target.value) || 0))}
              className="saas-input"
            />
          </div>
        </div>
      </div>

      {/* Output Panel */}
      <div className="md:col-span-5 p-6 saas-card flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
              Required Materials
            </span>
            <button
              onClick={copyReport}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition shadow-sm active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-zinc-400">Total Bricks Count</span>
              <div className="text-2xl md:text-3xl font-black text-indigo-650 dark:text-indigo-400 mt-1 leading-tight font-mono">
                {results.numBricks.toLocaleString()} Pcs
              </div>
            </div>

            <div className="border-t border-zinc-100 dark:border-zinc-800/60 pt-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-medium">Cement (50kg bags)</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-300 font-mono">
                  {results.cementBags} Bags
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-medium">Sand (Fine Aggregate)</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-300 font-mono">
                  {results.sandCuft} Cu Ft
                </span>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-zinc-100 dark:border-zinc-800/40 pb-3">
                <span className="text-zinc-400 font-medium">Mortar Wet Volume</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-300 font-mono">
                  {results.mortarVolume} m³
                </span>
              </div>
            </div>

            {/* Visual wall structure preview */}
            <div className="space-y-2.5 pt-1">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
                Wall Laying Preview (Running Bond)
              </span>
              <div className="flex flex-col gap-1 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800/80">
                {[...Array(4)].map((_, rowIndex) => {
                  const isOffset = rowIndex % 2 === 1;
                  return (
                    <div key={rowIndex} className="flex gap-1 justify-center w-full">
                      {isOffset ? (
                        <>
                          <div className="h-3.5 bg-amber-700/80 dark:bg-amber-800/40 border border-amber-700/20 rounded-xs flex-1" />
                          <div className="h-3.5 bg-amber-700/80 dark:bg-amber-800/40 border border-amber-700/20 rounded-xs flex-[2]" />
                          <div className="h-3.5 bg-amber-700/80 dark:bg-amber-800/40 border border-amber-700/20 rounded-xs flex-[2]" />
                          <div className="h-3.5 bg-amber-700/80 dark:bg-amber-800/40 border border-amber-700/20 rounded-xs flex-1" />
                        </>
                      ) : (
                        <>
                          <div className="h-3.5 bg-amber-700/80 dark:bg-amber-800/40 border border-amber-700/20 rounded-xs flex-[2]" />
                          <div className="h-3.5 bg-amber-700/80 dark:bg-amber-800/40 border border-amber-700/20 rounded-xs flex-[2]" />
                          <div className="h-3.5 bg-amber-700/80 dark:bg-amber-800/40 border border-amber-700/20 rounded-xs flex-[2]" />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between items-center text-[9px] text-zinc-550 dark:text-zinc-450 font-medium">
                <span>Mortar Joint: 10mm (Standard)</span>
                <span>Brick Size: {brickType === 'standard' ? 'Modular' : brickType === 'clay' ? 'Clay' : 'Fly Ash'}</span>
              </div>
            </div>

          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-800/60 text-[10px] text-zinc-450 dark:text-zinc-555 leading-relaxed">
          <p>
            Standard brick joint calculations assume 10mm mortar thickness per standard guidelines, applying a standard 1.33 shrinkage expansion parameter for dry mortar values.
          </p>
        </div>
      </div>
    </div>
  );
}

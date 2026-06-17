import { useState, useEffect } from 'react';
import { Compass, Copy, Check, RotateCcw } from 'lucide-react';
import { getStoredArchRates, saveStoredArchRates, DEFAULT_ARCH_RATES } from '../data/civilRatesData';
import MaterialTrendGraph from '../components/MaterialTrendGraph';

export default function FloorTileCalculator() {
  const [unit, setUnit] = useState<'imperial' | 'metric'>('imperial');
  const [floorLength, setFloorLength] = useState<number>(15);
  const [floorWidth, setFloorWidth] = useState<number>(12);
  const [tileSizePreset, setTileSizePreset] = useState<string>('2x2');
  const [tileLength, setTileLength] = useState<number>(24); // inches (2ft)
  const [tileWidth, setTileWidth] = useState<number>(24); // inches (2ft)
  const [wastage, setWastage] = useState<number>(8); // percentage
  const [boxSize, setBoxSize] = useState<number>(4); // tiles per box
  const [copied, setCopied] = useState<boolean>(false);
  const [prices, setPrices] = useState(getStoredArchRates());

  const [results, setResults] = useState({
    floorArea: 0,
    tileArea: 0,
    netTiles: 0,
    wastageTiles: 0,
    totalTiles: 0,
    totalBoxes: 0,
    materialCost: 0,
    laborCost: 0,
    totalCost: 0,
  });

  // Sync rates via storage events
  useEffect(() => {
    const handleStorage = () => {
      setPrices(getStoredArchRates());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Handle preset tile sizes
  useEffect(() => {
    if (unit === 'imperial') {
      if (tileSizePreset === '1x1') {
        setTileLength(12);
        setTileWidth(12);
      } else if (tileSizePreset === '2x1') {
        setTileLength(24);
        setTileWidth(12);
      } else if (tileSizePreset === '2x2') {
        setTileLength(24);
        setTileWidth(24);
      } else if (tileSizePreset === '4x2') {
        setTileLength(48);
        setTileWidth(24);
      }
    } else {
      // Metric (cm)
      if (tileSizePreset === '1x1') {
        setTileLength(30);
        setTileWidth(30);
      } else if (tileSizePreset === '2x1') {
        setTileLength(60);
        setTileWidth(30);
      } else if (tileSizePreset === '2x2') {
        setTileLength(60);
        setTileWidth(60);
      } else if (tileSizePreset === '4x2') {
        setTileLength(120);
        setTileWidth(60);
      }
    }
  }, [tileSizePreset, unit]);

  useEffect(() => {
    const floorArea = floorLength * floorWidth; // sq ft or sq m
    let tileArea = 0; // sq ft or sq m

    if (unit === 'imperial') {
      // tileLength and tileWidth are in inches
      tileArea = (tileLength * tileWidth) / 144; // sq ft
    } else {
      // tileLength and tileWidth are in cm
      tileArea = (tileLength * tileWidth) / 10000; // sq m
    }

    if (tileArea <= 0 || floorArea <= 0) return;

    const netTiles = Math.ceil(floorArea / tileArea);
    const wastageTiles = Math.ceil(netTiles * (wastage / 100));
    const totalTiles = netTiles + wastageTiles;
    const totalBoxes = Math.ceil(totalTiles / (boxSize || 1));

    // Calculate material cost using the shared tiles price per sq ft
    const tilesRateSqUnit = prices.tiles || DEFAULT_ARCH_RATES.tiles;
    const tilePricePerUnit = tileArea * tilesRateSqUnit;
    const materialCost = totalTiles * tilePricePerUnit;

    // Calculate labor cost: floor area * labor rate
    const laborRateSqUnit = prices.tileLabor || DEFAULT_ARCH_RATES.tileLabor;
    const laborCost = floorArea * laborRateSqUnit;
    const totalCost = materialCost + laborCost;

    setResults({
      floorArea: Number(floorArea.toFixed(2)),
      tileArea: Number(tileArea.toFixed(4)),
      netTiles,
      wastageTiles,
      totalTiles,
      totalBoxes,
      materialCost: Math.round(materialCost),
      laborCost: Math.round(laborCost),
      totalCost: Math.round(totalCost),
    });
  }, [floorLength, floorWidth, tileLength, tileWidth, wastage, boxSize, prices, unit]);

  const handlePriceChange = (key: keyof typeof DEFAULT_ARCH_RATES, val: number) => {
    const updatedPrices = { ...prices, [key]: val };
    setPrices(updatedPrices);
    saveStoredArchRates({ [key]: val });
  };

  const copyReport = () => {
    const areaUnit = unit === 'imperial' ? 'sq ft' : 'sq m';
    const dimUnit = unit === 'imperial' ? 'ft' : 'm';
    const tileDimUnit = unit === 'imperial' ? 'in' : 'cm';

    const text = `Floor Tiles & Cost Calculator Report (Toolique)
----------------------------------------
Floor Area        : ${floorLength} x ${floorWidth} ${dimUnit} = ${results.floorArea} ${areaUnit}
Tile Size         : ${tileLength} x ${tileWidth} ${tileDimUnit}
Wastage Buffer    : ${wastage}%
Tiles Per Box     : ${boxSize}
----------------------------------------
Net Tiles Needed  : ${results.netTiles}
Wastage Tiles     : ${results.wastageTiles}
Total Tiles Req   : ${results.totalTiles}
Total Boxes Req   : ${results.totalBoxes}
----------------------------------------
Material Cost     : ₹${results.materialCost.toLocaleString('en-IN')} (at ₹${prices.tiles}/${areaUnit})
Labor Cost        : ₹${results.laborCost.toLocaleString('en-IN')} (at ₹${prices.tileLabor}/${areaUnit})
Total Flooring    : ₹${results.totalCost.toLocaleString('en-IN')}
----------------------------------------
Calculated u/s layout tiles optimization algorithms.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setFloorLength(15);
    setFloorWidth(12);
    setTileSizePreset('2x2');
    setWastage(8);
    setBoxSize(4);
    const defaults = DEFAULT_ARCH_RATES;
    setPrices(defaults);
    saveStoredArchRates(defaults);
  };

  const areaUnit = unit === 'imperial' ? 'sq ft' : 'sq m';
  const dimUnit = unit === 'imperial' ? 'ft' : 'm';
  const tileDimUnit = unit === 'imperial' ? 'in' : 'cm';

  // Calculate grid dimensions
  const tileL_units = unit === 'imperial' ? tileLength / 12 : tileLength / 100;
  const tileW_units = unit === 'imperial' ? tileWidth / 12 : tileWidth / 100;
  const approxCols = Math.max(1, Math.min(10, Math.round(floorLength / (tileL_units || 1))));
  const approxRows = Math.max(1, Math.min(8, Math.round(floorWidth / (tileW_units || 1))));

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Input Panel */}
        <div className="md:col-span-7 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/85 dark:border-zinc-800/80 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-850 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Compass className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-bold text-zinc-800 dark:text-white text-sm">Floor & Tile Sizes</h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex rounded-lg bg-zinc-100 dark:bg-zinc-800 p-0.5 text-[10px] font-bold border border-zinc-200/40 dark:border-zinc-700/60">
                <button
                  onClick={() => {
                    setUnit('imperial');
                    setTileSizePreset('2x2');
                  }}
                  className={`px-2 py-1 rounded-md transition-all duration-200 ${unit === 'imperial' ? 'bg-white dark:bg-zinc-700 text-indigo-650 dark:text-indigo-400 shadow-sm' : 'text-zinc-400 hover:text-zinc-650'}`}
                >
                  Imperial (ft)
                </button>
                <button
                  onClick={() => {
                    setUnit('metric');
                    setTileSizePreset('2x2');
                  }}
                  className={`px-2 py-1 rounded-md transition-all duration-200 ${unit === 'metric' ? 'bg-white dark:bg-zinc-700 text-indigo-655 dark:text-indigo-405 shadow-sm' : 'text-zinc-400 hover:text-zinc-650'}`}
                >
                  Metric (m)
                </button>
              </div>
              <button
                onClick={handleReset}
                className="p-1.5 rounded-lg text-zinc-405 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-650 dark:hover:text-zinc-200 transition"
                title="Reset Parameters & Rates"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Floor Size */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                Floor Length ({dimUnit})
              </label>
              <input
                type="number"
                value={floorLength || ''}
                onChange={(e) => setFloorLength(Math.max(0, parseFloat(e.target.value) || 0))}
                className="saas-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Floor Width ({dimUnit})
              </label>
              <input
                type="number"
                value={floorWidth || ''}
                onChange={(e) => setFloorWidth(Math.max(0, parseFloat(e.target.value) || 0))}
                className="saas-input"
              />
            </div>
          </div>

          {/* Tile Size Preset */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 dark:text-zinc-550 mb-1.5">
              Tile Size Slabs
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {['1x1', '2x1', '2x2', '4x2'].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setTileSizePreset(preset)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-bold border transition-all duration-200 ${
                    tileSizePreset === preset
                      ? 'border-indigo-500 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400'
                      : 'border-zinc-205 dark:border-zinc-800 text-zinc-650 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                  }`}
                >
                  {preset === '1x1'
                    ? unit === 'imperial'
                      ? '1x1 ft'
                      : '30x30 cm'
                    : preset === '2x1'
                    ? unit === 'imperial'
                      ? '2x1 ft'
                      : '60x30 cm'
                    : preset === '2x2'
                    ? unit === 'imperial'
                      ? '2x2 ft'
                      : '60x60 cm'
                    : unit === 'imperial'
                    ? '4x2 ft'
                    : '120x60 cm'}
                </button>
              ))}
              <button
                onClick={() => setTileSizePreset('custom')}
                className={`px-2 py-1.5 rounded-lg text-xs font-bold border transition-all duration-200 ${
                  tileSizePreset === 'custom'
                    ? 'border-indigo-500 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400'
                    : 'border-zinc-205 dark:border-zinc-800 text-zinc-650 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                }`}
              >
                Custom
              </button>
            </div>
          </div>

          {/* Custom dimensions if custom selected */}
          {tileSizePreset === 'custom' && (
            <div className="grid grid-cols-2 gap-4 border-t border-zinc-150 dark:border-zinc-850 pt-3 animate-none">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 mb-1.5">
                  Tile Length ({tileDimUnit})
                </label>
                <input
                  type="number"
                  value={tileLength || ''}
                  onChange={(e) => setTileLength(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="saas-input"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 mb-1.5">
                  Tile Width ({tileDimUnit})
                </label>
                <input
                  type="number"
                  value={tileWidth || ''}
                  onChange={(e) => setTileWidth(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="saas-input"
                />
              </div>
            </div>
          )}

          {/* Pricing, Wastage, Box details */}
          <div className="grid grid-cols-2 gap-3 border-t border-zinc-150 dark:border-zinc-850 pt-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                Wastage Buffer (%)
              </label>
              <input
                type="number"
                value={wastage || ''}
                onChange={(e) => setWastage(Math.max(0, parseFloat(e.target.value) || 0))}
                className="saas-input py-1.5 px-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Tiles / Box
              </label>
              <input
                type="number"
                value={boxSize || ''}
                onChange={(e) => setBoxSize(Math.max(1, parseInt(e.target.value) || 1))}
                className="saas-input py-1.5 px-2 text-xs"
              />
            </div>
          </div>

          {/* Editable Finishing Rates */}
          <div className="border-t border-zinc-150 dark:border-zinc-850 pt-4 mt-3">
            <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">Edit Unit Rates (₹)</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-zinc-455 dark:text-zinc-550 mb-1">Tile Price (₹ / {areaUnit})</label>
                <input
                  type="number"
                  value={prices.tiles}
                  onChange={(e) => handlePriceChange('tiles', Math.max(0, parseFloat(e.target.value) || 0))}
                  className="saas-input py-2 font-mono font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-zinc-455 dark:text-zinc-550 mb-1">Laying Labor (₹ / {areaUnit})</label>
                <input
                  type="number"
                  value={prices.tileLabor}
                  onChange={(e) => handlePriceChange('tileLabor', Math.max(0, parseFloat(e.target.value) || 0))}
                  className="saas-input py-2 font-mono font-semibold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Output Panel */}
        <div className="md:col-span-5 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/85 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 border-b border-zinc-100 dark:border-zinc-850 pb-3">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
                Required Tiles & Cost
              </span>
              <button
                onClick={copyReport}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition shadow-sm active:scale-95 animate-none"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-zinc-405">Total Flooring Cost</span>
                <div className="text-2xl md:text-3xl font-black text-indigo-650 dark:text-indigo-400 mt-1 leading-tight font-mono">
                  ₹{results.totalCost.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="border-t border-zinc-150 dark:border-zinc-800/60 pt-4 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="text-zinc-405 font-medium block">Tiles Materials</span>
                    <span className="text-[10px] text-zinc-450 font-mono">{results.totalTiles} Tiles ({results.totalBoxes} Boxes)</span>
                  </div>
                  <span className="font-bold text-zinc-800 dark:text-zinc-300 font-mono">
                    ₹{results.materialCost.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs border-t border-zinc-50 dark:border-zinc-850 pt-2">
                  <div>
                    <span className="text-zinc-450 font-medium block">Installation Labor</span>
                    <span className="text-[10px] text-zinc-450 font-mono">{results.floorArea} {areaUnit} @ ₹{prices.tileLabor}/{areaUnit}</span>
                  </div>
                  <span className="font-bold text-zinc-800 dark:text-zinc-300 font-mono">
                    ₹{results.laborCost.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs border-t border-zinc-50 dark:border-zinc-850 pt-2 pb-2">
                  <span className="text-zinc-450 font-medium">Floor Area</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-300 font-mono">
                    {results.floorArea} {areaUnit}
                  </span>
                </div>
              </div>

              {/* Responsive tile grid visual representation */}
              <div className="space-y-2.5 pt-1">
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest block">
                  Floor Tile Layout Map
                </span>
                <div className="relative w-full h-32 rounded-xl bg-zinc-55 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2 flex items-center justify-center">
                  <div 
                    className="grid gap-0.5 w-full h-full border border-zinc-300 dark:border-zinc-800 bg-zinc-200 dark:bg-zinc-800 p-0.5 rounded-lg overflow-hidden"
                    style={{
                      gridTemplateColumns: `repeat(${approxCols}, minmax(0, 1fr))`,
                      gridTemplateRows: `repeat(${approxRows}, minmax(0, 1fr))`,
                    }}
                  >
                    {[...Array(approxCols * approxRows)].map((_, i) => (
                      <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200/20 dark:border-zinc-800/10 rounded-xs" />
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-800/60 text-[10px] text-zinc-450 dark:text-zinc-550 leading-relaxed">
            <p>
              An additional 8-10% of tiles is recommended to account for cuts, corners, borders, and breakage during laying.
            </p>
          </div>
        </div>
      </div>

      {/* SVG Trend Graph spanning full width */}
      <MaterialTrendGraph allowedMaterials={['tiles', 'fitoutCost']} />
    </div>
  );
}

import { useState } from 'react';
import { Copy, Check, Info, Layout, Layers, Box } from 'lucide-react';

type UnitType = 'ft' | 'm';
type ShapeType = 'rect' | 'lshape' | 'circle';

export default function FacadeAreaCalculator() {
  const [unit, setUnit] = useState<UnitType>('ft');
  const [shape, setShape] = useState<ShapeType>('rect');
  const [copied, setCopied] = useState(false);

  // Dimensions
  const [length, setLength] = useState<number>(60);
  const [width, setWidth] = useState<number>(40);
  const [height, setHeight] = useState<number>(30); // building height
  const [wwr, setWwr] = useState<number>(30); // Window-to-Wall Ratio (%)
  const [excludedSides, setExcludedSides] = useState<number>(0); // e.g. shared party walls

  const calculate = () => {
    let perimeter = 0;
    
    if (shape === 'rect') {
      perimeter = 2 * (length + width);
    } else if (shape === 'lshape') {
      // Approximate perimeter for a standard L-shape is same as its bounding box perimeter
      perimeter = 2 * (length + width);
    } else if (shape === 'circle') {
      // Length is treated as diameter
      perimeter = Math.PI * length;
    }

    // Exclude party/shared walls (rectangular assumption)
    let excludedPerimeter = 0;
    if (shape === 'rect' && excludedSides > 0) {
      // Exclude sides based on width/length
      // If 1 side excluded, exclude 'width' side. If 2 sides, exclude 'width + length', etc.
      if (excludedSides === 1) excludedPerimeter = width;
      else if (excludedSides === 2) excludedPerimeter = width + length;
      else if (excludedSides === 3) excludedPerimeter = 2 * width + length;
      else if (excludedSides >= 4) excludedPerimeter = perimeter;
    }

    const grossFacade = perimeter * height;
    const netFacade = Math.max(0, (perimeter - excludedPerimeter) * height);
    const glassArea = netFacade * (wwr / 100);
    const solidArea = netFacade - glassArea;

    return {
      perimeter,
      grossFacade,
      netFacade,
      glassArea,
      solidArea
    };
  };

  const results = calculate();

  const copyReport = () => {
    const text = `Facade Surface Area Analysis
----------------------------------------
Building Shape: ${shape.toUpperCase()}
Gross Perimeter: ${results.perimeter.toFixed(1)} ${unit}
Building Height: ${height} ${unit}
Shared/Excluded Sides: ${excludedSides}

Total Gross Facade Area: ${results.grossFacade.toFixed(2)} ${unit === 'ft' ? 'Sq. Ft' : 'm²'}
Net Facade Area (Active): ${results.netFacade.toFixed(2)} ${unit === 'ft' ? 'Sq. Ft' : 'm²'}
Solid Wall Cladding Area: ${results.solidArea.toFixed(2)} ${unit === 'ft' ? 'Sq. Ft' : 'm²'}
Glass Glazing Area (WWR ${wwr}%): ${results.glassArea.toFixed(2)} ${unit === 'ft' ? 'Sq. Ft' : 'm²'}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Configuration Column */}
      <div className="lg:col-span-7 space-y-6">
        {/* Main Parameters */}
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Layout className="w-5 h-5 text-indigo-500" />
            <span>Building Envelope Specification</span>
          </h3>

          <div className="flex gap-4">
            <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg max-w-[200px] flex-1">
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

            <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex-1">
              {[
                { id: 'rect', label: 'Rectangular' },
                { id: 'lshape', label: 'L-Shaped' },
                { id: 'circle', label: 'Circular' }
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setShape(s.id as ShapeType)}
                  className={`flex-1 py-1 rounded-md text-xs font-bold transition ${
                    shape === s.id
                      ? 'bg-white dark:bg-zinc-700 text-indigo-650 dark:text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-650'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                {shape === 'circle' ? 'Diameter' : 'Outer Length'} ({unit})
              </label>
              <input
                type="number"
                value={length}
                onChange={(e) => setLength(parseFloat(e.target.value) || 0)}
                className="saas-input"
              />
            </div>
            {shape !== 'circle' && (
              <div>
                <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                  Outer Width ({unit})
                </label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
                  className="saas-input"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                Building Height ({unit})
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
                className="saas-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Window-to-Wall Ratio (WWR %)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={wwr}
                  max={100}
                  min={0}
                  onChange={(e) => setWwr(parseFloat(e.target.value) || 0)}
                  className="saas-input pr-12 font-bold font-mono"
                />
                <span className="absolute right-3 top-2.5 text-xs text-zinc-400 font-bold">%</span>
              </div>
            </div>
            {shape === 'rect' && (
              <div>
                <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                  Shared Party Walls (Excluded Sides)
                </label>
                <select
                  value={excludedSides}
                  onChange={(e) => setExcludedSides(parseInt(e.target.value) || 0)}
                  className="saas-input"
                >
                  <option value={0}>0 Sides (Fully Detached)</option>
                  <option value={1}>1 Side (Semi-Detached / Shared)</option>
                  <option value={2}>2 Sides (Terraced / Shared)</option>
                  <option value={3}>3 Sides (Shared End Wall)</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Live CSS Interactive Layout Simulator */}
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-sm">Visual Isometric Elevation</h3>
          <p className="text-xs text-zinc-400">
            Below is a dynamic elevations model representing the building solid wall (gray) vs glazing ratio window apertures (blue).
          </p>

          <div className="relative w-full aspect-[16/9] bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center justify-center p-8 shadow-inner">
            <div className="w-1/2 h-4/5 border-2 border-zinc-400/80 rounded-xl relative flex flex-col justify-end overflow-hidden bg-zinc-250 dark:bg-zinc-800">
              <span className="absolute top-2 left-2 text-[9px] font-black text-zinc-450 uppercase">
                Active Elevation Envelope
              </span>

              {/* Glazed Ratio Layer */}
              <div
                style={{ height: `${wwr}%` }}
                className="w-full bg-sky-400/30 border-t-2 border-sky-450 transition-all duration-300 flex items-center justify-center relative pattern-grid"
              >
                <span className="text-[10px] font-bold text-sky-650 dark:text-sky-400 uppercase tracking-wider">
                  Glazing ({wwr}%)
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
                Facade Analysis
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
                <span className="text-xs text-zinc-400">Net Active Facade Area</span>
                <div className="text-3xl font-black mt-1 font-mono text-zinc-950 dark:text-white">
                  {results.netFacade.toFixed(1)} {unit === 'ft' ? 'Sq. Ft' : 'm²'}
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 text-xs">
                <div className="flex justify-between items-center p-2 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg">
                  <span className="font-semibold text-zinc-550 flex items-center gap-1.5">
                    <Box className="w-4 h-4 text-indigo-500" />
                    <span>Solid Cladding Wall Area</span>
                  </span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">
                    {results.solidArea.toFixed(1)} {unit === 'ft' ? 'Sq. Ft' : 'm²'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg">
                  <span className="font-semibold text-zinc-550 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-sky-500" />
                    <span>Glass Glazing Aperture</span>
                  </span>
                  <span className="font-bold font-mono text-sky-600 dark:text-sky-400">
                    {results.glassArea.toFixed(1)} {unit === 'ft' ? 'Sq. Ft' : 'm²'}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                  <span className="text-zinc-400">Total Gross Perimeter</span>
                  <span className="font-bold font-mono">{results.perimeter.toFixed(1)} {unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Gross Exterior Facade Area</span>
                  <span className="font-bold font-mono">
                    {results.grossFacade.toFixed(1)} {unit === 'ft' ? 'Sq. Ft' : 'm²'}
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 text-[11px] text-zinc-400 leading-relaxed flex gap-2">
                <Info className="w-5 h-5 text-indigo-500 shrink-0" />
                <p>
                  Facade area determines thermal insulation cladding parameters, heat load profiles, and exterior window-to-wall ratios (WWR) required for municipal energy performance guidelines.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Compass, Plus, Trash2, Copy, Check, RotateCcw } from 'lucide-react';
import { getStoredArchRates, saveStoredArchRates, DEFAULT_ARCH_RATES } from '../data/civilRatesData';
import MaterialTrendGraph from '../components/MaterialTrendGraph';

interface RoomItem {
  id: string;
  name: string;
  length: number;
  width: number;
  includeInCarpet: boolean;
}

export default function RoomAreaCalculator() {
  const [unit, setUnit] = useState<'feet' | 'meters'>('feet');
  const [wallThickness, setWallThickness] = useState<number>(9); // inches
  const [loadingFactor, setLoadingFactor] = useState<number>(30); // percentage
  const [ratePerSqUnit, setRatePerSqUnit] = useState<number>(5000); // INR per sq unit
  const [copied, setCopied] = useState<boolean>(false);
  const [prices, setPrices] = useState(getStoredArchRates());

  const [rooms, setRooms] = useState<RoomItem[]>([
    { id: '1', name: 'Living Room', length: 16, width: 12, includeInCarpet: true },
    { id: '2', name: 'Master Bedroom', length: 14, width: 11, includeInCarpet: true },
    { id: '3', name: 'Kitchen', length: 10, width: 8, includeInCarpet: true },
    { id: '4', name: 'Balcony', length: 8, width: 4, includeInCarpet: false }, // Balconies excluded from RERA carpet
  ]);

  const [results, setResults] = useState({
    carpetArea: 0,
    balconyArea: 0,
    wallArea: 0,
    builtupArea: 0,
    superBuiltupArea: 0,
    totalPropertyCost: 0,
    totalFitoutCost: 0,
  });

  // Sync rates via storage
  useEffect(() => {
    const handleStorage = () => {
      setPrices(getStoredArchRates());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    let innerCarpet = 0;
    let balcony = 0;
    let perimeterSum = 0;

    rooms.forEach((r) => {
      const area = r.length * r.width;
      if (r.includeInCarpet) {
        innerCarpet += area;
      } else {
        balcony += area;
      }
      // Perimeter to approximate internal partition wall area
      perimeterSum += 2 * (r.length + r.width);
    });

    // Approximate wall area: wall thickness converted to feet/meters * perimeter
    // 9 inches = 0.75 feet. 23cm = 0.23m.
    const thicknessInUnits = unit === 'feet' ? wallThickness / 12 : wallThickness / 100;
    // We divide wall area by 2 because adjacent rooms share walls
    const wallArea = (perimeterSum * thicknessInUnits) / 2;

    const carpetArea = innerCarpet;
    const builtupArea = carpetArea + wallArea + balcony;
    const superBuiltupArea = builtupArea * (1 + loadingFactor / 100);
    
    // Property cost based on super built-up area
    const totalPropertyCost = superBuiltupArea * ratePerSqUnit;

    // Fitout cost based on carpet area (internal layout spaces)
    // If unit is metric (sq m), we scale standard sq ft rate: 1 sq m = 10.764 sq ft
    const baseFitoutRate = prices.fitoutCost || DEFAULT_ARCH_RATES.fitoutCost;
    const fitoutRateSqUnit = unit === 'feet' ? baseFitoutRate : baseFitoutRate * 10.764;
    const totalFitoutCost = carpetArea * fitoutRateSqUnit;

    setResults({
      carpetArea: Number(carpetArea.toFixed(1)),
      balconyArea: Number(balcony.toFixed(1)),
      wallArea: Number(wallArea.toFixed(1)),
      builtupArea: Number(builtupArea.toFixed(1)),
      superBuiltupArea: Number(superBuiltupArea.toFixed(1)),
      totalPropertyCost: Math.round(totalPropertyCost),
      totalFitoutCost: Math.round(totalFitoutCost),
    });
  }, [rooms, wallThickness, loadingFactor, ratePerSqUnit, prices, unit]);

  const handlePriceChange = (key: keyof typeof DEFAULT_ARCH_RATES, val: number) => {
    const updatedPrices = { ...prices, [key]: val };
    setPrices(updatedPrices);
    saveStoredArchRates({ [key]: val });
  };

  const addRoom = () => {
    const newId = (rooms.length + 1).toString();
    setRooms([
      ...rooms,
      { id: newId, name: `Room ${newId}`, length: 10, width: 10, includeInCarpet: true },
    ]);
  };

  const removeRoom = (id: string) => {
    setRooms(rooms.filter((r) => r.id !== id));
  };

  const updateRoom = (id: string, field: keyof RoomItem, value: any) => {
    setRooms(
      rooms.map((r) => {
        if (r.id === id) {
          return { ...r, [field]: value };
        }
        return r;
      })
    );
  };

  const copyReport = () => {
    const areaUnit = unit === 'feet' ? 'sq ft' : 'sq m';
    const rateUnit = unit === 'feet' ? 'sq ft' : 'sq m';

    let roomDetails = rooms
      .map(
        (r) =>
          `- ${r.name}: ${r.length} x ${r.width} = ${(r.length * r.width).toFixed(1)} ${areaUnit} (${
            r.includeInCarpet ? 'Carpet' : 'Balcony/Excl'
          })`
      )
      .join('\n');

    const text = `Property Area & Interior Budget Report (Toolique)
----------------------------------------
Unit Mode         : ${unit === 'feet' ? 'Imperial (Feet)' : 'Metric (Meters)'}
Wall Thickness    : ${wallThickness} ${unit === 'feet' ? 'inches' : 'cm'}
Common Loading    : ${loadingFactor}%
----------------------------------------
Rooms List:
${roomDetails}
----------------------------------------
RERA Carpet Area  : ${results.carpetArea.toLocaleString()} ${areaUnit}
Balcony/Terrace   : ${results.balconyArea.toLocaleString()} ${areaUnit}
Est. Wall Area    : ${results.wallArea.toLocaleString()} ${areaUnit}
Built-up Area     : ${results.builtupArea.toLocaleString()} ${areaUnit}
Super Built-up    : ${results.superBuiltupArea.toLocaleString()} ${areaUnit}
----------------------------------------
Est. Property Cost: ₹${results.totalPropertyCost.toLocaleString()} (at ₹${ratePerSqUnit}/${rateUnit})
Est. Fit-Out Budget: ₹${results.totalFitoutCost.toLocaleString()} (at ₹${prices.fitoutCost}/${rateUnit})
----------------------------------------
Calculated according to Indian RERA Standard Guidelines.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setWallThickness(9);
    setLoadingFactor(30);
    setRatePerSqUnit(5000);
    const defaults = DEFAULT_ARCH_RATES;
    setPrices(defaults);
    saveStoredArchRates(defaults);
    setRooms([
      { id: '1', name: 'Living Room', length: 16, width: 12, includeInCarpet: true },
      { id: '2', name: 'Master Bedroom', length: 14, width: 11, includeInCarpet: true },
      { id: '3', name: 'Kitchen', length: 10, width: 8, includeInCarpet: true },
      { id: '4', name: 'Balcony', length: 8, width: 4, includeInCarpet: false },
    ]);
  };

  const areaUnit = unit === 'feet' ? 'sq ft' : 'sq m';

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Input Panel */}
        <div className="md:col-span-8 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/85 dark:border-zinc-800/80 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-850 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-violet-500/10 text-violet-650 dark:text-violet-400">
                <Compass className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-bold text-zinc-808 dark:text-white text-sm">Room Areas & Dimensions</h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex rounded-lg bg-zinc-100 dark:bg-zinc-800 p-0.5 text-xs font-bold border border-zinc-200/40 dark:border-zinc-700/60">
                <button
                  onClick={() => setUnit('feet')}
                  className={`px-2 py-1 rounded-md transition ${unit === 'feet' ? 'bg-white dark:bg-zinc-700 text-violet-600 shadow-sm' : 'text-slate-400'}`}
                >
                  Feet
                </button>
                <button
                  onClick={() => setUnit('meters')}
                  className={`px-2 py-1 rounded-md transition ${unit === 'meters' ? 'bg-white dark:bg-zinc-700 text-violet-600 shadow-sm' : 'text-slate-400'}`}
                >
                  Meters
                </button>
              </div>
              <button
                onClick={handleReset}
                className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-650 dark:hover:text-zinc-200 transition"
                title="Reset Parameters & Rates"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Dynamic Rooms List */}
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {rooms.map((room) => (
              <div key={room.id} className="flex flex-wrap items-center gap-2 bg-zinc-50 dark:bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-150 dark:border-zinc-850">
                <input
                  type="text"
                  value={room.name}
                  onChange={(e) => updateRoom(room.id, 'name', e.target.value)}
                  placeholder="Room Name"
                  className="flex-1 min-w-[120px] px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-zinc-800 dark:text-zinc-250 font-semibold focus:outline-none"
                />
                <div className="flex items-center gap-1.5 w-[140px]">
                  <input
                    type="number"
                    value={room.length || ''}
                    onChange={(updateVal) => updateRoom(room.id, 'length', Math.max(0, parseFloat(updateVal.target.value) || 0))}
                    placeholder="L"
                    className="w-16 px-2 py-1.5 text-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-zinc-800 dark:text-zinc-250 focus:outline-none"
                  />
                  <span className="text-[10px] text-zinc-400 font-bold">x</span>
                  <input
                    type="number"
                    value={room.width || ''}
                    onChange={(updateVal) => updateRoom(room.id, 'width', Math.max(0, parseFloat(updateVal.target.value) || 0))}
                    placeholder="W"
                    className="w-16 px-2 py-1.5 text-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-zinc-800 dark:text-zinc-250 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    id={`carpet-${room.id}`}
                    checked={room.includeInCarpet}
                    onChange={(e) => updateRoom(room.id, 'includeInCarpet', e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-zinc-300 dark:border-zinc-800 text-violet-600 focus:ring-violet-500 cursor-pointer"
                  />
                  <label htmlFor={`carpet-${room.id}`} className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 cursor-pointer">
                    RERA Carpet
                  </label>
                </div>
                <button
                  onClick={() => removeRoom(room.id)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addRoom}
            className="flex items-center gap-1 text-[11px] font-bold text-violet-650 hover:text-violet-750 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom Room</span>
          </button>

          {/* Wall & Loading Factor */}
          <div className="grid grid-cols-3 gap-3 border-t border-zinc-150 dark:border-zinc-850 pt-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                Wall Thickness ({unit === 'feet' ? 'in' : 'cm'})
              </label>
              <input
                type="number"
                value={wallThickness || ''}
                onChange={(e) => setWallThickness(Math.max(0, parseFloat(e.target.value) || 0))}
                className="saas-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                Common Loading (%)
              </label>
              <input
                type="number"
                value={loadingFactor || ''}
                onChange={(e) => setLoadingFactor(Math.max(0, parseFloat(e.target.value) || 0))}
                className="saas-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                Property Cost / {unit === 'feet' ? 'Sq Ft' : 'Sq M'} (₹)
              </label>
              <input
                type="number"
                value={ratePerSqUnit || ''}
                onChange={(e) => setRatePerSqUnit(Math.max(0, parseInt(e.target.value) || 0))}
                className="saas-input"
              />
            </div>
          </div>

          {/* Editable Fit-out Rates */}
          <div className="border-t border-zinc-150 dark:border-zinc-850 pt-4">
            <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">Edit Interior Fit-Out Rate (₹)</h4>
            <div>
              <label className="block text-[10px] font-semibold text-zinc-450 dark:text-zinc-500 mb-1">Fit-Out Cost per {areaUnit}</label>
              <input
                type="number"
                value={prices.fitoutCost}
                onChange={(e) => handlePriceChange('fitoutCost', Math.max(0, parseFloat(e.target.value) || 0))}
                className="saas-input py-2 font-mono font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Output Panel */}
        <div className="md:col-span-4 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/85 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 border-b border-zinc-150 dark:border-zinc-850 pb-3">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
                Calculated Area Summary
              </span>
              <button
                onClick={copyReport}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-violet-650 hover:bg-violet-750 text-white text-[11px] font-bold transition shadow-sm active:scale-95"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-zinc-405 block">Est. Property Value</span>
                <div className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white mt-0.5 font-mono">
                  ₹{results.totalPropertyCost.toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-zinc-400">Based on Super Built-up: {results.superBuiltupArea} {areaUnit}</span>
              </div>

              <div>
                <span className="text-xs font-semibold text-zinc-405 block">Est. Fit-Out Budget</span>
                <div className="text-lg font-bold text-teal-650 dark:text-teal-400 mt-0.5 font-mono">
                  ₹{results.totalFitoutCost.toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-zinc-400">Based on RERA Carpet: {results.carpetArea} {areaUnit}</span>
              </div>

              <div className="border-t border-zinc-150 dark:border-zinc-850 pt-4 space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-450 font-medium">RERA Carpet Area</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-300 font-mono">
                    {results.carpetArea.toLocaleString()} {areaUnit}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-450 font-medium">Balcony & Utility</span>
                  <span className="font-bold text-zinc-700 dark:text-zinc-350 font-mono">
                    {results.balconyArea.toLocaleString()} {areaUnit}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-450 font-medium">Built-up Area</span>
                  <span className="font-bold text-zinc-700 dark:text-zinc-350 font-mono">
                    {results.builtupArea.toLocaleString()} {areaUnit}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-zinc-150 dark:border-zinc-850/60 text-[9px] text-zinc-450 leading-relaxed">
            <p>
              * **Carpet Area** represents net usable floor area.
              * **Super Built-up Area** incorporates common amenities via the loading multiplier.
            </p>
          </div>
        </div>
      </div>

      {/* SVG Trend Graph spanning full width */}
      <MaterialTrendGraph allowedMaterials={['fitoutCost']} defaultMaterial="fitoutCost" title="Interior Fit-Out Cost Index Trends" />
    </div>
  );
}

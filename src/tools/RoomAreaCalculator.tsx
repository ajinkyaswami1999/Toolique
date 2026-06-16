import { useState, useEffect } from 'react';
import { Compass, Plus, Trash2, Copy, Check, RotateCcw } from 'lucide-react';

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
  });

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
    const totalPropertyCost = superBuiltupArea * ratePerSqUnit;

    setResults({
      carpetArea: Number(carpetArea.toFixed(1)),
      balconyArea: Number(balcony.toFixed(1)),
      wallArea: Number(wallArea.toFixed(1)),
      builtupArea: Number(builtupArea.toFixed(1)),
      superBuiltupArea: Number(superBuiltupArea.toFixed(1)),
      totalPropertyCost: Math.round(totalPropertyCost),
    });
  }, [rooms, wallThickness, loadingFactor, ratePerSqUnit, unit]);

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

    const text = `Property Area Calculator Report (Toolique)
----------------------------------------
Unit Mode         : ${unit === 'feet' ? 'Imperial (Feet)' : 'Metric (Meters)'}
Wall Thickness    : ${wallThickness} ${unit === 'feet' ? 'inches' : 'cm'}
Common Loading    : ${loadingFactor}%
Rate per ${rateUnit} : ₹${ratePerSqUnit.toLocaleString()}
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
Est. Property Cost: ₹${results.totalPropertyCost.toLocaleString()}
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
    setRooms([
      { id: '1', name: 'Living Room', length: 16, width: 12, includeInCarpet: true },
      { id: '2', name: 'Master Bedroom', length: 14, width: 11, includeInCarpet: true },
      { id: '3', name: 'Kitchen', length: 10, width: 8, includeInCarpet: true },
      { id: '4', name: 'Balcony', length: 8, width: 4, includeInCarpet: false },
    ]);
  };

  const areaUnit = unit === 'feet' ? 'sq ft' : 'sq m';

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      {/* Input Panel */}
      <div className="md:col-span-8 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <Compass className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Room Areas & Dimensions</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-bold">
              <button
                onClick={() => setUnit('feet')}
                className={`px-2 py-1 rounded-md transition ${unit === 'feet' ? 'bg-white dark:bg-slate-700 text-violet-600 shadow-sm' : 'text-slate-400'}`}
              >
                Feet
              </button>
              <button
                onClick={() => setUnit('meters')}
                className={`px-2 py-1 rounded-md transition ${unit === 'meters' ? 'bg-white dark:bg-slate-700 text-violet-600 shadow-sm' : 'text-slate-400'}`}
              >
                Meters
              </button>
            </div>
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-650 dark:hover:text-slate-200 transition"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Rooms List */}
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
          {rooms.map((room) => (
            <div key={room.id} className="flex flex-wrap items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <input
                type="text"
                value={room.name}
                onChange={(e) => updateRoom(room.id, 'name', e.target.value)}
                placeholder="Room Name"
                className="flex-1 min-w-[120px] px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-250 font-semibold focus:outline-none"
              />
              <div className="flex items-center gap-1.5 w-[140px]">
                <input
                  type="number"
                  value={room.length || ''}
                  onChange={(e) => updateRoom(room.id, 'length', Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="L"
                  className="w-16 px-1.5 py-1 text-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-250 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 font-bold">x</span>
                <input
                  type="number"
                  value={room.width || ''}
                  onChange={(e) => updateRoom(room.id, 'width', Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="W"
                  className="w-16 px-1.5 py-1 text-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-250 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="checkbox"
                  id={`carpet-${room.id}`}
                  checked={room.includeInCarpet}
                  onChange={(e) => updateRoom(room.id, 'includeInCarpet', e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-800 text-violet-600 focus:ring-violet-500"
                />
                <label htmlFor={`carpet-${room.id}`} className="text-[10px] font-bold text-slate-500 dark:text-slate-400 cursor-pointer">
                  RERA Carpet
                </label>
              </div>
              <button
                onClick={() => removeRoom(room.id)}
                className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={addRoom}
          className="flex items-center gap-1 text-[11px] font-bold text-violet-600 hover:text-violet-700 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Custom Room</span>
        </button>

        {/* Wall & Loading Factor */}
        <div className="grid grid-cols-3 gap-4 border-t border-slate-100 dark:border-slate-800/60 pt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Wall Thickness ({unit === 'feet' ? 'in' : 'cm'})
            </label>
            <input
              type="number"
              value={wallThickness || ''}
              onChange={(e) => setWallThickness(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:border-violet-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Common Loading (%)
            </label>
            <input
              type="number"
              value={loadingFactor || ''}
              onChange={(e) => setLoadingFactor(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:border-violet-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Rate per {unit === 'feet' ? 'Sq Ft' : 'Sq M'} (₹)
            </label>
            <input
              type="number"
              value={ratePerSqUnit || ''}
              onChange={(e) => setRatePerSqUnit(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:border-violet-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Output Panel */}
      <div className="md:col-span-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
              Calculated Area Summary
            </span>
            <button
              onClick={copyReport}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-bold transition shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-slate-400">Super Built-up Area</span>
              <div className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-0.5 font-mono">
                {results.superBuiltupArea.toLocaleString()} {areaUnit}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400">RERA Carpet Area</span>
              <div className="text-lg font-bold text-teal-600 dark:text-teal-400 mt-0.5 font-mono">
                {results.carpetArea.toLocaleString()} {areaUnit}
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Balcony & Utility</span>
                <span className="font-bold text-slate-700 dark:text-slate-350 font-mono">
                  {results.balconyArea.toLocaleString()} {areaUnit}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium font-mono">Internal Walls (Est)</span>
                <span className="font-bold text-slate-700 dark:text-slate-350 font-mono">
                  {results.wallArea.toLocaleString()} {areaUnit}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium font-mono">Built-up Area</span>
                <span className="font-bold text-slate-700 dark:text-slate-350 font-mono">
                  {results.builtupArea.toLocaleString()} {areaUnit}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-slate-100 dark:border-slate-800/40 pt-2">
                <span className="text-slate-400 font-medium">Estimated Value</span>
                <span className="font-extrabold text-violet-600 dark:text-violet-400 font-mono">
                  ₹{results.totalPropertyCost.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800/60 text-[9px] text-slate-400 leading-relaxed">
          <p>
            * **RERA Carpet Area** excludes external walls, common areas, and exclusive balconies/terraces.
            * **Super Built-up Area** includes common passages, lifts, lobbies, and security rooms marked up by the loading factor.
          </p>
        </div>
      </div>
    </div>
  );
}

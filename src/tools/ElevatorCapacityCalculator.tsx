import { useState, useEffect } from 'react';
import { Copy, Check, Info, ArrowUp, ArrowDown, Layout } from 'lucide-react';

type UnitType = 'ft' | 'm';
type BuildingType = 'office' | 'hotel' | 'hospital' | 'residential';
type CarSize = '2000' | '2500' | '3000' | '3500' | '4000';

interface BuildingConfig {
  label: string;
  peakRate: number; // % of population arriving in 5 mins
  targetInterval: number; // target waiting interval in seconds
}

const BUILDING_PRESETS: Record<BuildingType, BuildingConfig> = {
  office: { label: 'Commercial Office (High Peak)', peakRate: 12, targetInterval: 30 },
  hotel: { label: 'Hotel / Hospitality (Medium)', peakRate: 10, targetInterval: 40 },
  hospital: { label: 'Hospital / Clinical Care (Priority)', peakRate: 9, targetInterval: 35 },
  residential: { label: 'Residential Condominium (Low)', peakRate: 7, targetInterval: 50 }
};

interface CarConfig {
  label: string;
  passengers: number; // max passengers
  weight: number; // lbs
}

const CAR_SIZES: Record<CarSize, CarConfig> = {
  '2000': { label: '2,000 lbs (8 Passengers)', passengers: 8, weight: 2000 },
  '2500': { label: '2,500 lbs (12 Passengers)', passengers: 12, weight: 2500 },
  '3000': { label: '3,000 lbs (15 Passengers)', passengers: 15, weight: 3000 },
  '3500': { label: '3,500 lbs (17 Passengers)', passengers: 17, weight: 3500 },
  '4000': { label: '4,000 lbs (20 Passengers)', passengers: 20, weight: 4000 }
};

export default function ElevatorCapacityCalculator() {
  const [unit, setUnit] = useState<UnitType>('ft');
  const [buildingType, setBuildingType] = useState<BuildingType>('office');
  const [floors, setFloors] = useState<number>(10);
  const [population, setPopulation] = useState<number>(600);
  
  // Elevator Spec Inputs
  const [carSize, setCarSize] = useState<CarSize>('2500');
  const [speed, setSpeed] = useState<number>(350); // fpm (feet per minute)
  const [copied, setCopied] = useState(false);

  // Animation state for simulated elevator car
  const [currentSimFloor, setCurrentSimFloor] = useState<number>(0);
  const [direction, setDirection] = useState<'up' | 'down'>('up');

  // Simple state loop to animate the elevator car going up and down
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSimFloor((prev) => {
        if (direction === 'up') {
          if (prev >= floors - 1) {
            setDirection('down');
            return prev - 1;
          }
          return prev + 1;
        } else {
          if (prev <= 0) {
            setDirection('up');
            return prev + 1;
          }
          return prev - 1;
        }
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [floors, direction]);

  const calculate = () => {
    const preset = BUILDING_PRESETS[buildingType];
    const car = CAR_SIZES[carSize];

    // Floor heights: default 12 ft per floor
    const floorHeight = unit === 'm' ? 3.6576 : 12; // 12 feet
    const totalHeight = floors * floorHeight;

    // Peak 5-min arrival rate (number of people to transport in 5 mins)
    const peakArrivals = population * (preset.peakRate / 100);

    // Passengers per trip during peak (assumed at 80% car capacity)
    const passengersPerTrip = Math.max(1, car.passengers * 0.8);

    // Speed in fps (feet per second)
    const speedFps = unit === 'm' ? (speed * 0.3048) / 60 : speed / 60;

    // Barney & dos Santos formula constants:
    // Probable Stops (S) = N * (1 - (1 - 1/N)^P)
    // where N is number of floors, P is passengers per trip
    const N = floors;
    const P = passengersPerTrip;
    const probableStops = N * (1 - Math.pow(1 - 1 / N, P));

    // Travel RTT = (2 * Height / Speed) + (Stops * (DoorTime + AccelTime)) + (Passengers * BoardTime)
    // Standard times in seconds: DoorOpenClose = 4s, AccelDecelDelay = 3s, PassengerBoardExit = 2.4s
    const travelTime = speedFps > 0 ? (2 * totalHeight) / speedFps : 0;
    const stopsDelay = probableStops * (4 + 3);
    const passengerDelay = P * 2.4;
    const rtt = travelTime + stopsDelay + passengerDelay + 10; // 10s general loss

    // Handling capacity of a single car in 5 mins (300 seconds)
    const singleCarCapacity = rtt > 0 ? (300 / rtt) * P : 0;

    // Required elevators count (rounded up)
    const requiredElevators = Math.max(1, Math.ceil(peakArrivals / singleCarCapacity));

    // Waiting Interval (seconds) = RTT / Number of Elevators
    const waitingInterval = requiredElevators > 0 ? rtt / requiredElevators : 0;
    const isIntervalAcceptable = waitingInterval <= preset.targetInterval;

    return {
      totalHeight,
      peakArrivals,
      probableStops: Number(probableStops.toFixed(1)),
      rtt: Number(rtt.toFixed(0)),
      singleCarCapacity: Number(singleCarCapacity.toFixed(1)),
      requiredElevators,
      waitingInterval: Number(waitingInterval.toFixed(0)),
      isIntervalAcceptable,
      targetInterval: preset.targetInterval
    };
  };

  const results = calculate();

  const copyReport = () => {
    const text = `Elevator Traffic & Capacity Audit
----------------------------------------
Building Type: ${BUILDING_PRESETS[buildingType].label}
Building Population: ${population} Persons (Floors: ${floors})
Elevator Car Class: ${CAR_SIZES[carSize].label}
Elevator Velocity: ${speed} FPM

Round Trip Time (RTT): ${results.rtt} seconds
Peak 5-Min Arrival Rate: ${results.peakArrivals.toFixed(0)} Persons
Single Car 5-Min Capacity: ${results.singleCarCapacity} Persons
----------------------------------------
Required Elevators Count: ${results.requiredElevators} Cars
Average Waiting Interval: ${results.waitingInterval} seconds (Target: ${results.targetInterval}s)
QoS Level: ${results.isIntervalAcceptable ? 'ACCEPTABLE' : 'INTERVAL TOO LONG (Consider adding cars)'}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Configuration Column */}
      <div className="lg:col-span-7 space-y-6">
        {/* Dimensions */}
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Layout className="w-5 h-5 text-indigo-500" />
            <span>Building Specifications</span>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                Building Classification
              </label>
              <select
                value={buildingType}
                onChange={(e) => setBuildingType(e.target.value as BuildingType)}
                className="saas-input"
              >
                {Object.keys(BUILDING_PRESETS).map((k) => (
                  <option key={k} value={k}>
                    {BUILDING_PRESETS[k as BuildingType].label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Building Population (Total occupants)
              </label>
              <input
                type="number"
                value={population}
                onChange={(e) => setPopulation(parseInt(e.target.value) || 0)}
                className="saas-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Number of Floors
              </label>
              <input
                type="number"
                value={floors}
                min={2}
                max={60}
                onChange={(e) => setFloors(parseInt(e.target.value) || 2)}
                className="saas-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                Car Size Capacity (lbs)
              </label>
              <select
                value={carSize}
                onChange={(e) => setCarSize(e.target.value as CarSize)}
                className="saas-input"
              >
                {Object.keys(CAR_SIZES).map((s) => (
                  <option key={s} value={s}>
                    {CAR_SIZES[s as CarSize].label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                Elevator Velocity (fpm)
              </label>
              <select
                value={speed}
                onChange={(e) => setSpeed(parseInt(e.target.value) || 150)}
                className="saas-input font-bold font-mono"
              >
                <option value={150}>150 FPM (Low Rise Hydraulic)</option>
                <option value={350}>350 FPM (Mid Rise Geared Traction)</option>
                <option value={500}>500 FPM (High Rise Gearless)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Live CSS Interactive Layout Simulator */}
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-sm">Visual Elevator Shaft Simulator</h3>
          <p className="text-xs text-zinc-400">
            Top-down structural cutaway profile showing the building floors, current elevator car location, and travel direction.
          </p>

          <div className="relative w-full aspect-[16/9] bg-zinc-950 border-4 border-zinc-800 rounded-2xl flex p-6 shadow-inner overflow-hidden">
            {/* Architectural Grid Lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:100%_2rem] opacity-25 pointer-events-none" />

            {/* Vertical Elevator Shaft Track */}
            <div className="w-16 border-r-2 border-dashed border-zinc-700/60 h-full flex flex-col justify-end relative items-center p-2 pr-3 shrink-0">
              <span className="absolute bottom-2 text-[6px] font-black text-zinc-600 uppercase tracking-widest leading-none">
                SHAFT TRACK
              </span>

              {/* Elevator Car Block */}
              <div
                style={{
                  bottom: `${(currentSimFloor / (floors - 1)) * 80 + 5}%`
                }}
                className="absolute w-8 h-10 bg-indigo-500 border-2 border-indigo-650 rounded shadow-md transition-all duration-1000 flex flex-col justify-center items-center text-white"
              >
                <span className="text-[9px] font-black font-mono">F{currentSimFloor + 1}</span>
                {direction === 'up' ? (
                  <ArrowUp className="w-3 h-3 text-white animate-bounce mt-0.5" />
                ) : (
                  <ArrowDown className="w-3 h-3 text-white animate-bounce mt-0.5" />
                )}
              </div>
            </div>

            {/* Floors indicator listing */}
            <div className="flex-1 flex flex-col justify-between h-full pl-6 border-l border-zinc-800 font-bold text-[10px] text-zinc-500 pointer-events-none select-none">
              <div className="flex justify-between w-full border-b border-zinc-900 pb-1">
                <span>Floor {floors} (Roof Level)</span>
                <span>{results.totalHeight.toFixed(0)} {unit}</span>
              </div>
              <div className="flex justify-between w-full border-b border-zinc-900/60 pb-1">
                <span>Floor {Math.ceil(floors * 0.75)}</span>
              </div>
              <div className="flex justify-between w-full border-b border-zinc-900/60 pb-1">
                <span>Floor {Math.ceil(floors * 0.50)} (Mid Height)</span>
              </div>
              <div className="flex justify-between w-full border-b border-zinc-900/60 pb-1">
                <span>Floor {Math.ceil(floors * 0.25)}</span>
              </div>
              <div className="flex justify-between w-full border-b border-zinc-900 pb-1">
                <span>Floor 1 (Lobby Entrance)</span>
                <span>0 {unit}</span>
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
                Traffic Results
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
                <span className="text-xs text-zinc-400">Required Elevator Bank</span>
                <div className="text-3xl font-black mt-1 font-mono text-zinc-950 dark:text-white">
                  {results.requiredElevators} Car(s)
                </div>
              </div>

              <div>
                <span className="text-xs text-zinc-400">Average Waiting Interval</span>
                <div className="text-3xl font-black mt-1 font-mono text-indigo-650 dark:text-indigo-400">
                  {results.waitingInterval} seconds
                </div>
                <div
                  className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded mt-2 border ${
                    results.isIntervalAcceptable
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                  }`}
                >
                  {results.isIntervalAcceptable ? 'QoS: ACCEPTABLE (Within Interval Limit)' : 'QoS: INTERVAL EXCEEDED (Consider adding cars)'}
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Round Trip Time (RTT)</span>
                  <span className="font-bold font-mono">{results.rtt} seconds</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Target Interval Limit</span>
                  <span className="font-bold font-mono text-zinc-550">{results.targetInterval} seconds</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Probable Stops Per Trip (S)</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">{results.probableStops}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">5-min handling capacity (Per Car)</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">
                    {results.singleCarCapacity} Persons
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 text-[11px] text-zinc-400 leading-relaxed flex gap-2">
                <Info className="w-5 h-5 text-indigo-500 shrink-0" />
                <p>
                  Elevator capacity configurations are calculated based on peak traffic patterns. Offices require high handling rates during morning peaks, while hotels require balanced luggage-person distribution.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
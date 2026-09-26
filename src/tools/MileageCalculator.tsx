/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from 'react';
import {
  Car,
  Fuel,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Download,
  Zap,
  Gauge,
  Leaf,
  Coins,
  MapPin,
  Users,
  Route,
  CircleDollarSign,
  Compass
} from 'lucide-react';

// --- Types & Interfaces ---
export type FuelType = 'petrol' | 'diesel' | 'cng' | 'lpg' | 'ev';
export type MileageCalcMode = 'trip' | 'range_planner' | 'fuel_comparison' | 'emissions';
export type UnitSystem = 'metric' | 'imperial_us' | 'imperial_uk';

export interface MileageArchetype {
  id: string;
  name: string;
  desc: string;
  fuelType: FuelType;
  distance: number;
  fuelFilled: number;
  fuelPrice: number;
  currency: string;
  tankCapacity: number;
  passengers: number;
  tollsParking: number;
  acOn: boolean;
}

const ARCHETYPES: MileageArchetype[] = [
  {
    id: 'petrol_hatchback',
    name: '🚗 1.2L Petrol City Hatchback',
    desc: 'Commuter car: 16.5 km/L @ ₹102/L',
    fuelType: 'petrol',
    distance: 330,
    fuelFilled: 20,
    fuelPrice: 102.5,
    currency: '₹',
    tankCapacity: 37,
    passengers: 1,
    tollsParking: 150,
    acOn: true
  },
  {
    id: 'diesel_suv',
    name: '🚙 1.5L Diesel Highway SUV',
    desc: 'Highway cruiser: 21.0 km/L @ ₹89/L',
    fuelType: 'diesel',
    distance: 630,
    fuelFilled: 30,
    fuelPrice: 89.2,
    currency: '₹',
    tankCapacity: 50,
    passengers: 4,
    tollsParking: 420,
    acOn: true
  },
  {
    id: 'cng_sedan',
    name: '🚖 1.0L CNG Urban Sedan',
    desc: 'High efficiency cab: 28.0 km/kg @ ₹78/kg',
    fuelType: 'cng',
    distance: 280,
    fuelFilled: 10,
    fuelPrice: 78.0,
    currency: '₹',
    tankCapacity: 12,
    passengers: 2,
    tollsParking: 0,
    acOn: false
  },
  {
    id: 'scooter_110cc',
    name: '🛵 110cc Two-Wheeler',
    desc: 'Urban commuter: 52.0 km/L @ ₹102/L',
    fuelType: 'petrol',
    distance: 260,
    fuelFilled: 5,
    fuelPrice: 102.5,
    currency: '₹',
    tankCapacity: 5.3,
    passengers: 1,
    tollsParking: 0,
    acOn: false
  },
  {
    id: 'ev_suv',
    name: '⚡ Long-Range Electric EV',
    desc: 'EV: 15 kWh/100km (6.67 km/kWh) @ ₹8/kWh',
    fuelType: 'ev',
    distance: 400,
    fuelFilled: 60, // 60 kWh
    fuelPrice: 8.5, // ₹/kWh
    currency: '₹',
    tankCapacity: 60, // 60 kWh battery
    passengers: 2,
    tollsParking: 200,
    acOn: true
  }
];

export default function MileageCalculator() {
  // Navigation Mode
  const [activeMode, setActiveMode] = useState<MileageCalcMode>('trip');

  // General Settings
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
  const [fuelType, setFuelType] = useState<FuelType>('petrol');
  const [currency, setCurrency] = useState('₹');

  // Input states
  const [distance, setDistance] = useState<number>(330); // km or miles
  const [fuelConsumed, setFuelConsumed] = useState<number>(20); // Liters, kg, or kWh
  const [fuelPrice, setFuelPrice] = useState<number>(102.5); // per unit
  const [tankCapacity, setTankCapacity] = useState<number>(40); // Liters, kg, or kWh
  const [passengers, setPassengers] = useState<number>(1);
  const [tollsParking, setTollsParking] = useState<number>(150);
  const [isRoundTrip, setIsRoundTrip] = useState<boolean>(false);
  const [acPenaltyPct, setAcPenaltyPct] = useState<number>(10); // 10% penalty if AC is on
  const [acActive, setAcActive] = useState<boolean>(true);

  // Odometer Method Toggle
  const [useOdometer, setUseOdometer] = useState<boolean>(false);
  const [startOdo, setStartOdo] = useState<number>(12400);
  const [endOdo, setEndOdo] = useState<number>(12730);

  // Comparison Matrix Input (Daily / Annual distance)
  const [dailyCommuteKm, setDailyCommuteKm] = useState<number>(35);

  const [copied, setCopied] = useState(false);

  // Sync distance if odometer is used
  const effectiveDistance = useMemo(() => {
    let d = distance;
    if (useOdometer) {
      d = Math.max(0, endOdo - startOdo);
    }
    return isRoundTrip ? d * 2 : d;
  }, [distance, useOdometer, startOdo, endOdo, isRoundTrip]);

  // Adjust fuel consumed if AC penalty is toggled
  const effectiveFuelConsumed = useMemo(() => {
    let f = fuelConsumed;
    if (isRoundTrip && !useOdometer) {
      f = f * 2;
    }
    return f;
  }, [fuelConsumed, isRoundTrip, useOdometer]);

  // --- Core Calculations ---
  const calculations = useMemo(() => {
    const d = effectiveDistance;
    const f = effectiveFuelConsumed;

    if (d <= 0 || f <= 0) {
      return {
        efficiencyKmPerL: 0,
        efficiencyLPer100Km: 0,
        efficiencyUsMpg: 0,
        efficiencyUkMpg: 0,
        fuelCost: 0,
        costPerKm: 0,
        costPerPerson: 0,
        totalTripBudget: 0,
        maxRangeFullTank: 0,
        stopsNeeded: 0,
        co2EmissionsKg: 0,
        treesNeededYear: 0,
        unitLabel: fuelType === 'cng' ? 'kg' : fuelType === 'ev' ? 'kWh' : 'Liters',
        efficiencyLabel: fuelType === 'cng' ? 'km / kg' : fuelType === 'ev' ? 'km / kWh' : 'km / Liter'
      };
    }

    // 1. Primary Efficiency (km/unit or miles/unit)
    const baseEfficiency = d / f; // km/L, km/kg, or km/kWh

    // Conversions
    // 1 km/L = 2.352145 US MPG = 2.82481 UK MPG
    // L/100km = 100 / (km/L)
    const efficiencyKmPerL = baseEfficiency;
    const efficiencyLPer100Km = baseEfficiency > 0 ? 100 / baseEfficiency : 0;
    const efficiencyUsMpg = baseEfficiency * 2.352145;
    const efficiencyUkMpg = baseEfficiency * 2.82481;

    // 2. Trip Financials
    const fuelCost = f * fuelPrice;
    const totalTripBudget = fuelCost + tollsParking;
    const costPerKm = d > 0 ? fuelCost / d : 0;
    const totalCostPerKm = d > 0 ? totalTripBudget / d : 0;
    const costPerPerson = passengers > 0 ? totalTripBudget / passengers : totalTripBudget;

    // 3. Tank Range & Refueling Stops
    const maxRangeFullTank = baseEfficiency * tankCapacity;
    // Safe driving range with 15% reserve buffer
    const safeDrivingRange = maxRangeFullTank * 0.85;
    const stopsNeeded = safeDrivingRange > 0 ? Math.floor(d / safeDrivingRange) : 0;

    // 4. Carbon Footprint (CO2 Emissions in kg)
    // Petrol: ~2.31 kg CO2/L | Diesel: ~2.68 kg CO2/L | CNG: ~2.75 kg CO2/kg | LPG: ~1.51 kg CO2/L | EV (Grid avg): ~0.70 kg CO2/kWh
    const emissionFactors: Record<FuelType, number> = {
      petrol: 2.31,
      diesel: 2.68,
      cng: 2.75,
      lpg: 1.51,
      ev: 0.70 // Indian grid average ~700g CO2/kWh
    };
    const co2EmissionsKg = f * emissionFactors[fuelType];
    // 1 mature tree absorbs ~21.77 kg CO2 per year
    const treesNeededYear = Number((co2EmissionsKg / 21.77).toFixed(1));

    return {
      efficiencyKmPerL: Number(efficiencyKmPerL.toFixed(2)),
      efficiencyLPer100Km: Number(efficiencyLPer100Km.toFixed(2)),
      efficiencyUsMpg: Number(efficiencyUsMpg.toFixed(1)),
      efficiencyUkMpg: Number(efficiencyUkMpg.toFixed(1)),
      fuelCost: Math.round(fuelCost),
      costPerKm: Number(costPerKm.toFixed(2)),
      totalCostPerKm: Number(totalCostPerKm.toFixed(2)),
      costPerPerson: Math.round(costPerPerson),
      totalTripBudget: Math.round(totalTripBudget),
      maxRangeFullTank: Math.round(maxRangeFullTank),
      stopsNeeded,
      co2EmissionsKg: Number(co2EmissionsKg.toFixed(1)),
      treesNeededYear,
      unitLabel: fuelType === 'cng' ? 'kg' : fuelType === 'ev' ? 'kWh' : 'Liters',
      efficiencyLabel: fuelType === 'cng' ? 'km / kg' : fuelType === 'ev' ? 'km / kWh' : 'km / Liter'
    };
  }, [effectiveDistance, effectiveFuelConsumed, fuelPrice, tankCapacity, passengers, tollsParking, fuelType]);

  // Annual Commute Comparison Matrix across all 4 fuels + EV
  const comparisonMatrix = useMemo(() => {
    const annualKm = dailyCommuteKm * 365;

    const fuels: Array<{
      type: FuelType;
      name: string;
      typicalEff: number; // km/L, km/kg, or km/kWh
      price: number;
      unit: string;
    }> = [
      { type: 'petrol', name: 'Petrol Car', typicalEff: 16.0, price: 102.5, unit: 'L' },
      { type: 'diesel', name: 'Diesel Car', typicalEff: 20.0, price: 89.2, unit: 'L' },
      { type: 'cng', name: 'CNG Vehicle', typicalEff: 26.0, price: 78.0, unit: 'kg' },
      { type: 'ev', name: 'Electric (EV)', typicalEff: 7.0, price: 8.5, unit: 'kWh' } // 7 km/kWh ~ 14.3 kWh/100km
    ];

    return fuels.map((item) => {
      const unitsPerYear = annualKm / item.typicalEff;
      const annualCost = unitsPerYear * item.price;
      const monthlyCost = annualCost / 12;
      const costPerKm = annualCost / annualKm;
      const fiveYearCost = annualCost * 5;

      return {
        ...item,
        annualCost: Math.round(annualCost),
        monthlyCost: Math.round(monthlyCost),
        costPerKm: Number(costPerKm.toFixed(2)),
        fiveYearCost: Math.round(fiveYearCost)
      };
    });
  }, [dailyCommuteKm]);

  // Archetype Handler
  const handleApplyArchetype = (preset: MileageArchetype) => {
    setFuelType(preset.fuelType);
    setDistance(preset.distance);
    setFuelConsumed(preset.fuelFilled);
    setFuelPrice(preset.fuelPrice);
    setCurrency(preset.currency);
    setTankCapacity(preset.tankCapacity);
    setPassengers(preset.passengers);
    setTollsParking(preset.tollsParking);
    setAcActive(preset.acOn);
    setUseOdometer(false);
    setIsRoundTrip(false);
  };

  const handleReset = () => {
    setDistance(330);
    setFuelConsumed(20);
    setFuelPrice(102.5);
    setTankCapacity(40);
    setPassengers(1);
    setTollsParking(150);
    setIsRoundTrip(false);
    setUseOdometer(false);
    setFuelType('petrol');
    setCurrency('₹');
    setAcActive(true);
  };

  // Copy Comprehensive Trip Report
  const handleCopyReport = () => {
    const reportText = `=========================================
TOOLIQUE VEHICLE MILEAGE & TRIP REPORT
=========================================
Vehicle Propulsion: ${fuelType.toUpperCase()}
Total Trip Distance: ${effectiveDistance} ${unitSystem === 'metric' ? 'km' : 'miles'} (${isRoundTrip ? 'Round Trip' : 'One Way'})
Fuel Consumed: ${effectiveFuelConsumed} ${calculations.unitLabel}
Fuel Price: ${currency}${fuelPrice} / ${calculations.unitLabel}

-----------------------------------------
EFFICIENCY & PERFORMANCE:
-----------------------------------------
• Fuel Efficiency: ${calculations.efficiencyKmPerL} ${calculations.efficiencyLabel}
• Consumption Rate: ${calculations.efficiencyLPer100Km} L / 100 km
• US Fuel Economy: ${calculations.efficiencyUsMpg} MPG (US)
• UK Fuel Economy: ${calculations.efficiencyUkMpg} MPG (Imperial UK)
• Estimated Full-Tank Range: ${calculations.maxRangeFullTank} ${unitSystem === 'metric' ? 'km' : 'miles'}

-----------------------------------------
TRIP FINANCIALS:
-----------------------------------------
• Total Fuel Cost: ${currency}${calculations.fuelCost}
• Tolls & Parking: ${currency}${tollsParking}
• Total Trip Budget: ${currency}${calculations.totalTripBudget}
• Running Cost per km: ${currency}${calculations.costPerKm} / km
• Passenger Share (${passengers} Person${passengers > 1 ? 's' : ''}): ${currency}${calculations.costPerPerson} each

-----------------------------------------
ENVIRONMENTAL IMPACT:
-----------------------------------------
• Estimated CO2 Emissions: ${calculations.co2EmissionsKg} kg CO2
• Annual Tree Offset: ${calculations.treesNeededYear} Trees/Year

Generated via Toolique India (https://toolique.com/automobile/mileage-calculator)`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export CSV
  const handleExportCsv = () => {
    const csvRows = [
      ['Metric', 'Value', 'Unit', 'Notes'],
      ['Trip Distance', effectiveDistance, unitSystem === 'metric' ? 'km' : 'miles', isRoundTrip ? 'Round Trip' : 'One Way'],
      ['Fuel Consumed', effectiveFuelConsumed, calculations.unitLabel, 'Tank filled'],
      ['Fuel Price', fuelPrice, `${currency}/${calculations.unitLabel}`, 'Retail price'],
      ['Fuel Efficiency', calculations.efficiencyKmPerL, calculations.efficiencyLabel, 'Primary metric'],
      ['Consumption 100km', calculations.efficiencyLPer100Km, 'L/100km', 'European standard'],
      ['US MPG', calculations.efficiencyUsMpg, 'MPG', 'US Gallons'],
      ['UK MPG', calculations.efficiencyUkMpg, 'MPG', 'Imperial Gallons'],
      ['Total Fuel Cost', calculations.fuelCost, currency, 'Direct fuel spend'],
      ['Tolls and Parking', tollsParking, currency, 'Transit fees'],
      ['Total Trip Budget', calculations.totalTripBudget, currency, 'Fuel + Tolls'],
      ['Cost per km', calculations.costPerKm, `${currency}/km`, 'Fuel only'],
      ['Cost per Person', calculations.costPerPerson, `${currency}/person`, `${passengers} passengers`],
      ['Estimated Full Tank Range', calculations.maxRangeFullTank, 'km', `Tank: ${tankCapacity} ${calculations.unitLabel}`],
      ['CO2 Emissions', calculations.co2EmissionsKg, 'kg CO2', 'Direct tailpipe'],
      ['Tree Offset', calculations.treesNeededYear, 'trees/year', 'Carbon absorption']
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mileage_trip_report_${effectiveDistance}km.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-left">
      {/* AEO Fuel Efficiency & Trip Economics Insights Card (Zero Double Heading) */}
      <div className="bg-gradient-to-br from-emerald-50/90 via-white to-sky-50/70 dark:from-emerald-950/30 dark:via-zinc-900/60 dark:to-sky-950/20 border border-emerald-200/80 dark:border-emerald-900/40 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-600 text-white uppercase tracking-wider flex items-center gap-1">
                <Car className="w-3 h-3" /> AEO Fuel & Mobility Studio
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Multi-Fuel, EV & Trip Budget Engine
              </span>
            </div>
            <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 flex-wrap">
              <span>Efficiency: <strong className="font-mono text-base text-emerald-600 dark:text-emerald-400">{calculations.efficiencyKmPerL} {calculations.efficiencyLabel}</strong></span>
              <span className="text-zinc-300 dark:text-zinc-700">|</span>
              <span>Trip Cost: <strong className="font-mono text-zinc-900 dark:text-white">{currency}{calculations.totalTripBudget.toLocaleString('en-IN')}</strong></span>
              <span className="text-zinc-300 dark:text-zinc-700">|</span>
              <span>Running Cost: <strong className="font-mono text-indigo-600 dark:text-indigo-400">{currency}{calculations.costPerKm} / km</strong></span>
              <span className="text-zinc-300 dark:text-zinc-700">|</span>
              <span>Range: <strong className="font-mono text-zinc-700 dark:text-zinc-300">{calculations.maxRangeFullTank} km</strong></span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyReport}
              className="px-3 py-1.5 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-200 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-emerald-600" />}
              <span>{copied ? 'Copied Report!' : 'Copy Trip Report'}</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* 1-Click Archetype Presets */}
        <div className="mt-3 pt-3 border-t border-emerald-100/70 dark:border-emerald-900/30 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-emerald-500" /> Archetypes:
          </span>
          {ARCHETYPES.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleApplyArchetype(preset)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white/80 dark:bg-zinc-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/80 transition cursor-pointer"
              title={preset.desc}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-zinc-200 dark:border-zinc-800">
        {[
          { id: 'trip', name: '⛽ Fuel Economy & Trip Budget', icon: Gauge },
          { id: 'range_planner', name: '🗺️ Range & Refueling Stops', icon: Route },
          { id: 'fuel_comparison', name: '⚖️ Petrol vs Diesel vs CNG vs EV', icon: Coins },
          { id: 'emissions', name: '🌿 Carbon Footprint & Trees', icon: Leaf }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeMode === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveMode(tab.id as MileageCalcMode)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Trip & Vehicle Parameters */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Fuel className="w-4 h-4 text-emerald-500" />
                <span>Vehicle & Journey Parameters</span>
              </h3>

              <div className="flex items-center gap-2">
                {/* Currency selector */}
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-bold text-zinc-900 dark:text-white"
                >
                  <option value="₹">₹ INR</option>
                  <option value="$">$ USD</option>
                  <option value="€">€ EUR</option>
                  <option value="£">£ GBP</option>
                  <option value="AED">AED</option>
                </select>

                <button
                  onClick={handleReset}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 p-1 transition cursor-pointer"
                  title="Reset to default values"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Fuel Type Selector */}
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Fuel & Propulsion Type
              </label>
              <div className="grid grid-cols-5 gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs font-bold text-center">
                {[
                  { id: 'petrol', label: 'Petrol' },
                  { id: 'diesel', label: 'Diesel' },
                  { id: 'cng', label: 'CNG' },
                  { id: 'lpg', label: 'LPG' },
                  { id: 'ev', label: '⚡ EV' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setFuelType(item.id as FuelType)}
                    className={`py-1.5 rounded-lg transition cursor-pointer ${
                      fuelType === item.id
                        ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Distance Input Mode (Direct vs Odometer) */}
            <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  Distance Calculation Method
                </label>
                <button
                  onClick={() => setUseOdometer(!useOdometer)}
                  className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  {useOdometer ? 'Switch to Direct Distance' : 'Use Odometer Reading'}
                </button>
              </div>

              {!useOdometer ? (
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" /> One-Way Distance ({unitSystem === 'metric' ? 'km' : 'miles'})
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100000}
                    value={distance}
                    onChange={(e) => setDistance(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-white"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                      Start Odometer
                    </label>
                    <input
                      type="number"
                      value={startOdo}
                      onChange={(e) => setStartOdo(Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                      End Odometer
                    </label>
                    <input
                      type="number"
                      value={endOdo}
                      onChange={(e) => setEndOdo(Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              )}

              {/* Round Trip Checkbox */}
              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRoundTrip}
                  onChange={(e) => setIsRoundTrip(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Include Return Journey (Round Trip = {effectiveDistance} km)</span>
              </label>
            </div>

            {/* Fuel Consumed & Price */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Fuel Added ({calculations.unitLabel})
                </label>
                <input
                  type="number"
                  step="0.1"
                  min={0.1}
                  value={fuelConsumed}
                  onChange={(e) => setFuelConsumed(Math.max(0.1, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Fuel Price ({currency} / {calculations.unitLabel})
                </label>
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  value={fuelPrice}
                  onChange={(e) => setFuelPrice(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-white"
                />
              </div>
            </div>

            {/* Tank Capacity & Passengers */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Tank / Battery Capacity ({calculations.unitLabel})
                </label>
                <input
                  type="number"
                  min={1}
                  value={tankCapacity}
                  onChange={(e) => setTankCapacity(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1 flex items-center gap-1">
                  <Users className="w-3 h-3 text-zinc-400" /> Carpool Passengers
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={passengers}
                  onChange={(e) => setPassengers(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white"
                />
              </div>
            </div>

            {/* Tolls and AC */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Tolls & Parking ({currency})
                </label>
                <input
                  type="number"
                  min={0}
                  value={tollsParking}
                  onChange={(e) => setTollsParking(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white"
                />
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer pb-2">
                  <input
                    type="checkbox"
                    checked={acActive}
                    onChange={(e) => setAcActive(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Air Conditioning (AC) On</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Output Dashboards & Mode Views */}
        <div className="lg:col-span-7 space-y-5">
          {/* MODE 1: Fuel Economy & Trip Budget */}
          {activeMode === 'trip' && (
            <div className="space-y-5">
              {/* Primary Fuel Efficiency Highlight Card */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      Calculated Fuel Efficiency
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-4xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                        {calculations.efficiencyKmPerL}
                      </span>
                      <span className="text-sm font-semibold text-zinc-500">{calculations.efficiencyLabel}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">Total Journey Cost</span>
                    <span className="text-2xl font-black font-mono text-zinc-900 dark:text-white">
                      {currency}{calculations.totalTripBudget.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Multi-Unit Standard Efficiency Grid */}
                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60 text-center">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">L / 100 km</span>
                    <p className="text-base font-extrabold text-zinc-900 dark:text-white font-mono mt-0.5">
                      {calculations.efficiencyLPer100Km}
                    </p>
                    <p className="text-[9px] text-zinc-500">European metric</p>
                  </div>

                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60 text-center">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">US MPG</span>
                    <p className="text-base font-extrabold text-zinc-900 dark:text-white font-mono mt-0.5">
                      {calculations.efficiencyUsMpg}
                    </p>
                    <p className="text-[9px] text-zinc-500">Miles / US Gal</p>
                  </div>

                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60 text-center">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">UK Imperial MPG</span>
                    <p className="text-base font-extrabold text-zinc-900 dark:text-white font-mono mt-0.5">
                      {calculations.efficiencyUkMpg}
                    </p>
                    <p className="text-[9px] text-zinc-500">Miles / UK Gal</p>
                  </div>
                </div>
              </div>

              {/* Financial Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 space-y-1 shadow-2xs">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <CircleDollarSign className="w-3 h-3 text-emerald-500" /> Cost per Kilometer
                  </span>
                  <div className="text-base font-extrabold text-zinc-900 dark:text-white font-mono">
                    {currency}{calculations.costPerKm} <span className="text-xs font-normal">/ km</span>
                  </div>
                  <p className="text-[10px] text-zinc-500">Fuel cost only</p>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 space-y-1 shadow-2xs">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <Users className="w-3 h-3 text-indigo-500" /> Per Person Share
                  </span>
                  <div className="text-base font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                    {currency}{calculations.costPerPerson}
                  </div>
                  <p className="text-[10px] text-zinc-500">{passengers} passenger{passengers > 1 ? 's' : ''} split</p>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 space-y-1 shadow-2xs">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <Compass className="w-3 h-3 text-purple-500" /> Full Tank Range
                  </span>
                  <div className="text-base font-extrabold text-zinc-900 dark:text-white font-mono">
                    {calculations.maxRangeFullTank} <span className="text-xs font-normal">km</span>
                  </div>
                  <p className="text-[10px] text-zinc-500">Based on {tankCapacity} {calculations.unitLabel}</p>
                </div>
              </div>
            </div>
          )}

          {/* MODE 2: Range & Refueling Stops */}
          {activeMode === 'range_planner' && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Route className="w-4 h-4 text-emerald-500" />
                  <span>Highway Range & Refueling Logistics</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60">
                  <span className="text-[10px] font-bold uppercase text-zinc-400">Total Route Distance</span>
                  <p className="text-2xl font-black text-zinc-900 dark:text-white font-mono mt-0.5">
                    {effectiveDistance} km
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {isRoundTrip ? 'Includes return round trip' : 'One-way highway transit'}
                  </p>
                </div>

                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60">
                  <span className="text-[10px] font-bold uppercase text-zinc-400">Refueling Stops Required</span>
                  <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                    {calculations.stopsNeeded} Stop{calculations.stopsNeeded !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    With 15% safety reserve buffer (~{Math.round(calculations.maxRangeFullTank * 0.85)} km interval)
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/30 rounded-xl text-xs text-emerald-900 dark:text-emerald-300 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-600" /> Safe Highway Range Recommendation
                </p>
                <p className="leading-relaxed opacity-90">
                  Your vehicle can travel approximately <strong>{calculations.maxRangeFullTank} km</strong> on a full tank of {tankCapacity} {calculations.unitLabel}. For highway journeys, plan fuel stops before the fuel gauge drops below 15% capacity (around {Math.round(calculations.maxRangeFullTank * 0.85)} km).
                </p>
              </div>
            </div>
          )}

          {/* MODE 3: Petrol vs Diesel vs CNG vs EV */}
          {activeMode === 'fuel_comparison' && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 flex-wrap gap-2">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Coins className="w-4 h-4 text-emerald-500" />
                  <span>Commute Economics Matrix: Petrol vs Diesel vs CNG vs EV</span>
                </h3>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-zinc-500">Daily Commute:</label>
                  <input
                    type="number"
                    min={5}
                    max={500}
                    value={dailyCommuteKm}
                    onChange={(e) => setDailyCommuteKm(Math.max(1, Number(e.target.value)))}
                    className="w-16 px-2 py-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-bold text-zinc-900 dark:text-white font-mono"
                  />
                  <span className="text-xs text-zinc-400">km/day</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-bold uppercase text-[10px]">
                      <th className="p-2.5 rounded-l-lg">Fuel Type</th>
                      <th className="p-2.5">Typical Mileage</th>
                      <th className="p-2.5">Cost / km</th>
                      <th className="p-2.5">Monthly Spend</th>
                      <th className="p-2.5 rounded-r-lg">5-Year TCO</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {comparisonMatrix.map((item) => {
                      const isEv = item.type === 'ev';
                      const isCng = item.type === 'cng';

                      return (
                        <tr key={item.type} className={isEv ? 'bg-emerald-50/50 dark:bg-emerald-950/20 font-bold text-emerald-700 dark:text-emerald-300' : 'text-zinc-700 dark:text-zinc-300'}>
                          <td className="p-2.5 font-bold flex items-center gap-1.5">
                            {isEv ? <Zap className="w-3.5 h-3.5 text-emerald-500" /> : <Fuel className="w-3.5 h-3.5 text-zinc-400" />}
                            {item.name}
                          </td>
                          <td className="p-2.5 font-mono">{item.typicalEff} km/{item.unit}</td>
                          <td className="p-2.5 font-mono">{currency}{item.costPerKm}</td>
                          <td className="p-2.5 font-mono">{currency}{item.monthlyCost.toLocaleString('en-IN')}</td>
                          <td className="p-2.5 font-mono font-bold text-zinc-900 dark:text-white">
                            {currency}{item.fiveYearCost.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <p className="text-[11px] text-zinc-500 leading-relaxed">
                * Note: Annual calculations assume 365 days of commuting at {dailyCommuteKm} km/day ({(dailyCommuteKm * 365).toLocaleString('en-IN')} km/year). EV charging is modeled at commercial/home grid average rates.
              </p>
            </div>
          )}

          {/* MODE 4: Carbon Footprint & Trees */}
          {activeMode === 'emissions' && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-emerald-500" />
                  <span>Carbon Footprint & Environmental Offset</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60">
                  <span className="text-[10px] font-bold uppercase text-zinc-400">Total Trip CO₂ Emissions</span>
                  <div className="text-3xl font-black text-rose-600 dark:text-rose-400 font-mono mt-0.5">
                    {calculations.co2EmissionsKg} <span className="text-sm font-normal text-zinc-500">kg CO₂</span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">Based on {effectiveFuelConsumed} {calculations.unitLabel} of {fuelType}</p>
                </div>

                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60">
                  <span className="text-[10px] font-bold uppercase text-zinc-400">Tree Carbon Offset Equivalent</span>
                  <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                    {calculations.treesNeededYear} <span className="text-sm font-normal text-zinc-500">Trees/Year</span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">Trees required to neutralize emissions</p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
                <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                  Eco-Driving Tips for 15–20% Fuel Savings:
                </p>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <li>Maintain steady speeds between 60–80 km/h on highways to minimize aerodynamic drag.</li>
                  <li>Check tyre pressure monthly: Under-inflated tyres increase rolling resistance and fuel burn by up to 4%.</li>
                  <li>Avoid sudden acceleration and aggressive braking in stop-and-go traffic.</li>
                  <li>Turn off the engine during railway crossings or traffic stops exceeding 60 seconds.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

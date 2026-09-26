/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from 'react';
import {
  Car,
  TrendingDown,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Download,
  ShieldCheck,
  Coins,
  Calendar,
  Gauge,
  Scale,
  DollarSign,
  AlertCircle,
  FileSpreadsheet,
  Info
} from 'lucide-react';

// --- Types & Interfaces ---
export type DepreciationMethod = 'standard_curve' | 'declining_balance' | 'straight_line';
export type CarCondition = 'flawless' | 'good' | 'fair' | 'poor';
export type FuelType = 'petrol' | 'diesel' | 'cng' | 'ev';
export type CalcMode = 'schedule' | 'used_evaluator' | 'tco' | 'new_vs_used';

export interface DepreciationArchetype {
  id: string;
  name: string;
  desc: string;
  originalPrice: number;
  vehicleAgeYears: number;
  odometerKm: number;
  fuelType: FuelType;
  condition: CarCondition;
  ownersCount: number;
  depreciationRate: number; // annual % for declining balance
  method: DepreciationMethod;
  currency: string;
}

const ARCHETYPES: DepreciationArchetype[] = [
  {
    id: 'petrol_hatchback',
    name: '🚗 New Compact Petrol Hatchback',
    desc: '₹8.5 Lakhs, Brand New (0y) - Standard market curve',
    originalPrice: 850000,
    vehicleAgeYears: 0,
    odometerKm: 0,
    fuelType: 'petrol',
    condition: 'flawless',
    ownersCount: 1,
    depreciationRate: 15,
    method: 'standard_curve',
    currency: '₹'
  },
  {
    id: 'diesel_suv',
    name: '🚙 1.5L Midsize Diesel SUV',
    desc: '₹16.0 Lakhs, 2 Years Old (32,000 km)',
    originalPrice: 1600000,
    vehicleAgeYears: 2,
    odometerKm: 32000,
    fuelType: 'diesel',
    condition: 'good',
    ownersCount: 1,
    depreciationRate: 14,
    method: 'standard_curve',
    currency: '₹'
  },
  {
    id: 'luxury_sedan',
    name: '🏎️ Luxury German Sedan',
    desc: '₹55.0 Lakhs, High 22% annual depreciation curve',
    originalPrice: 5500000,
    vehicleAgeYears: 3,
    odometerKm: 42000,
    fuelType: 'petrol',
    condition: 'good',
    ownersCount: 1,
    depreciationRate: 22,
    method: 'declining_balance',
    currency: '₹'
  },
  {
    id: 'electric_ev',
    name: '⚡ Long-Range Electric EV',
    desc: '₹18.5 Lakhs, EV Battery aging & tech evolution curve',
    originalPrice: 1850000,
    vehicleAgeYears: 1,
    odometerKm: 18000,
    fuelType: 'ev',
    condition: 'good',
    ownersCount: 1,
    depreciationRate: 18,
    method: 'standard_curve',
    currency: '₹'
  },
  {
    id: 'commercial_cab',
    name: '🚖 Commercial Taxi / Fleet Cab',
    desc: '₹9.0 Lakhs, High mileage (50,000 km/yr, Straight-Line)',
    originalPrice: 900000,
    vehicleAgeYears: 4,
    odometerKm: 180000,
    fuelType: 'cng',
    condition: 'fair',
    ownersCount: 1,
    depreciationRate: 20,
    method: 'straight_line',
    currency: '₹'
  },
  {
    id: 'certified_preowned',
    name: '🏷️ 3-Year Certified Used Car',
    desc: '₹12.0 Lakhs original MSRP, Buying at 3y sweet spot',
    originalPrice: 1200000,
    vehicleAgeYears: 3,
    odometerKm: 45000,
    fuelType: 'petrol',
    condition: 'good',
    ownersCount: 1,
    depreciationRate: 15,
    method: 'standard_curve',
    currency: '₹'
  }
];

export default function CarDepreciationCalculator() {
  // Navigation Mode
  const [activeMode, setActiveMode] = useState<CalcMode>('schedule');

  // Core Inputs
  const [originalPrice, setOriginalPrice] = useState<number>(1000000); // 10 Lakhs
  const [vehicleAgeYears, setVehicleAgeYears] = useState<number>(3); // 0 - 15 years
  const [customDepreciationRate, setCustomDepreciationRate] = useState<number>(15); // % annual for DBM
  const [depreciationMethod, setDepreciationMethod] = useState<DepreciationMethod>('standard_curve');
  const [currency, setCurrency] = useState('₹');

  // Condition & Usage Modifiers for Used Car Evaluation
  const [odometerKm, setOdometerKm] = useState<number>(42000);
  const [fuelType, setFuelType] = useState<FuelType>('petrol');
  const [condition, setCondition] = useState<CarCondition>('good');
  const [ownersCount, setOwnersCount] = useState<number>(1);
  const scrapValuePercent = 8; // Salvage floor

  // TCO Mode Specifics
  const [annualInsurance, setAnnualInsurance] = useState<number>(25000);
  const [annualMaintenance, setAnnualMaintenance] = useState<number>(18000);
  const [annualFuelSpend, setAnnualFuelSpend] = useState<number>(75000);
  const [annualKmDriven, setAnnualKmDriven] = useState<number>(14000);

  const [copied, setCopied] = useState(false);

  // --- Depreciation Schedule Engine ---
  // Standard IRDAI / Industry baseline schedule:
  // Year 0 (immediate showroom drive-off): ~9% loss (registration, taxes)
  // Year 1: ~18% total loss
  // Year 2: ~28% total loss
  // Year 3: ~38% total loss
  // Year 4: ~47% total loss
  // Year 5: ~56% total loss
  // Year 6: ~64% total loss
  // Year 7: ~71% total loss
  // Year 8: ~77% total loss
  // Year 9: ~82% total loss
  // Year 10: ~86% total loss
  const getStandardDepreciationPct = (year: number): number => {
    if (year <= 0) return 0;
    const standardRates = [0, 18, 28, 38, 47, 56, 64, 71, 77, 82, 86, 89, 91, 93, 94, 95];
    if (year < standardRates.length) return standardRates[year];
    return Math.min(95, 86 + (year - 10) * 1.8);
  };

  // Computes base car value at any given year under selected method
  const computeBaseValueAtYear = (p: number, year: number, method: DepreciationMethod, ratePct: number, salvagePct: number): number => {
    const salvageFloor = p * (salvagePct / 100);

    if (year <= 0) return p;

    if (method === 'standard_curve') {
      const depPct = getStandardDepreciationPct(year);
      const val = p * (1 - depPct / 100);
      return Math.max(salvageFloor, val);
    } else if (method === 'declining_balance') {
      const r = ratePct / 100;
      const val = p * Math.pow(1 - r, year);
      return Math.max(salvageFloor, val);
    } else {
      // Straight Line Method across 10 years
      const usefulLife = 10;
      const annualDrop = (p - salvageFloor) / usefulLife;
      const val = p - annualDrop * Math.min(usefulLife, year);
      return Math.max(salvageFloor, val);
    }
  };

  // Condition & Odometer Adjustment Factor
  const conditionFactor = useMemo(() => {
    let factor = 1.0;

    // Condition multiplier
    if (condition === 'flawless') factor += 0.06;
    else if (condition === 'good') factor += 0.0;
    else if (condition === 'fair') factor -= 0.08;
    else if (condition === 'poor') factor -= 0.18;

    // Ownership count penalty
    if (ownersCount === 2) factor -= 0.06;
    else if (ownersCount >= 3) factor -= 0.14;

    // Mileage deviation penalty (average ~ 12,000 km/year)
    const expectedKm = Math.max(1, vehicleAgeYears) * 12000;
    if (odometerKm > expectedKm * 1.4) {
      factor -= 0.07; // High mileage penalty
    } else if (odometerKm < expectedKm * 0.6 && odometerKm > 0) {
      factor += 0.04; // Low mileage bonus
    }

    // Fuel type longevity factor
    if (fuelType === 'diesel') {
      factor -= 0.03; // NGT 10-year limit / diesel stigma
    } else if (fuelType === 'ev') {
      factor -= 0.04; // Rapid battery tech depreciation
    }

    return factor;
  }, [condition, ownersCount, odometerKm, vehicleAgeYears, fuelType]);

  // Current Estimated Value Calculation
  const currentValuation = useMemo(() => {
    const baseValue = computeBaseValueAtYear(
      originalPrice,
      vehicleAgeYears,
      depreciationMethod,
      customDepreciationRate,
      scrapValuePercent
    );

    const adjustedFairValue = Math.round(baseValue * conditionFactor);
    const totalValueLost = Math.max(0, originalPrice - adjustedFairValue);
    const totalDepreciationPct = originalPrice > 0 ? (totalValueLost / originalPrice) * 100 : 0;
    const residualRetentionPct = originalPrice > 0 ? (adjustedFairValue / originalPrice) * 100 : 0;

    // 5-Year Residual Value Projection
    const valueAt5Years = computeBaseValueAtYear(
      originalPrice,
      5,
      depreciationMethod,
      customDepreciationRate,
      scrapValuePercent
    );
    const residual5YearPct = originalPrice > 0 ? (valueAt5Years / originalPrice) * 100 : 0;

    // Buying/Selling price bands for used cars
    const privateSellerPrice = adjustedFairValue;
    const dealerTradeInPrice = Math.round(adjustedFairValue * 0.88); // 12% dealer margin
    const certifiedShowroomPrice = Math.round(adjustedFairValue * 1.10); // 10% premium

    return {
      baseValue: Math.round(baseValue),
      adjustedFairValue,
      totalValueLost,
      totalDepreciationPct: Number(totalDepreciationPct.toFixed(1)),
      residualRetentionPct: Number(residualRetentionPct.toFixed(1)),
      residual5YearPct: Number(residual5YearPct.toFixed(1)),
      privateSellerPrice,
      dealerTradeInPrice,
      certifiedShowroomPrice
    };
  }, [
    originalPrice,
    vehicleAgeYears,
    depreciationMethod,
    customDepreciationRate,
    scrapValuePercent,
    conditionFactor
  ]);

  // 10-Year Schedule Table Data
  const scheduleTable = useMemo(() => {
    const rows = [];
    for (let yr = 0; yr <= 10; yr++) {
      const val = computeBaseValueAtYear(
        originalPrice,
        yr,
        depreciationMethod,
        customDepreciationRate,
        scrapValuePercent
      );
      const prevVal = yr === 0 ? originalPrice : computeBaseValueAtYear(
        originalPrice,
        yr - 1,
        depreciationMethod,
        customDepreciationRate,
        scrapValuePercent
      );
      const annualDrop = Math.max(0, prevVal - val);
      const cumulativeDrop = originalPrice - val;
      const retainedPct = originalPrice > 0 ? (val / originalPrice) * 100 : 0;

      rows.push({
        year: yr,
        value: Math.round(val),
        annualDrop: Math.round(annualDrop),
        cumulativeDrop: Math.round(cumulativeDrop),
        retainedPct: Number(retainedPct.toFixed(1))
      });
    }
    return rows;
  }, [originalPrice, depreciationMethod, customDepreciationRate, scrapValuePercent]);

  // Total Cost of Ownership (TCO) Calculations
  const tcoCalculations = useMemo(() => {
    const currentVal = currentValuation.adjustedFairValue;
    // Next 1 year projected value
    const nextYearVal = computeBaseValueAtYear(
      originalPrice,
      vehicleAgeYears + 1,
      depreciationMethod,
      customDepreciationRate,
      scrapValuePercent
    ) * conditionFactor;

    const annualDepreciationLoss = Math.max(0, currentVal - nextYearVal);
    const totalAnnualOperatingCost = annualDepreciationLoss + annualInsurance + annualMaintenance + annualFuelSpend;
    const monthlyDrain = totalAnnualOperatingCost / 12;
    const costPerKmDriven = annualKmDriven > 0 ? totalAnnualOperatingCost / annualKmDriven : 0;

    return {
      annualDepreciationLoss: Math.round(annualDepreciationLoss),
      totalAnnualOperatingCost: Math.round(totalAnnualOperatingCost),
      monthlyDrain: Math.round(monthlyDrain),
      costPerKmDriven: Number(costPerKmDriven.toFixed(2))
    };
  }, [
    currentValuation.adjustedFairValue,
    originalPrice,
    vehicleAgeYears,
    depreciationMethod,
    customDepreciationRate,
    scrapValuePercent,
    conditionFactor,
    annualInsurance,
    annualMaintenance,
    annualFuelSpend,
    annualKmDriven
  ]);

  // New vs 3-Year Used Car Comparison
  const newVsUsedComparison = useMemo(() => {
    const newPrice = originalPrice;
    // Value at year 3
    const usedBuyPrice = computeBaseValueAtYear(originalPrice, 3, 'standard_curve', 15, 8);
    // Value at year 6
    const usedSellPriceAt6 = computeBaseValueAtYear(originalPrice, 6, 'standard_curve', 15, 8);

    const new3YearDepreciationLoss = newPrice - usedBuyPrice;
    const used3YearDepreciationLoss = usedBuyPrice - usedSellPriceAt6;
    const savingsBuyingUsed = new3YearDepreciationLoss - used3YearDepreciationLoss;

    return {
      newPrice: Math.round(newPrice),
      usedBuyPrice: Math.round(usedBuyPrice),
      usedSellPriceAt6: Math.round(usedSellPriceAt6),
      new3YearDepreciationLoss: Math.round(new3YearDepreciationLoss),
      used3YearDepreciationLoss: Math.round(used3YearDepreciationLoss),
      savingsBuyingUsed: Math.round(savingsBuyingUsed),
      savingsPct: new3YearDepreciationLoss > 0 ? Number(((savingsBuyingUsed / new3YearDepreciationLoss) * 100).toFixed(0)) : 0
    };
  }, [originalPrice]);

  // Archetype Handler
  const handleApplyArchetype = (preset: DepreciationArchetype) => {
    setOriginalPrice(preset.originalPrice);
    setVehicleAgeYears(preset.vehicleAgeYears);
    setOdometerKm(preset.odometerKm);
    setFuelType(preset.fuelType);
    setCondition(preset.condition);
    setOwnersCount(preset.ownersCount);
    setCustomDepreciationRate(preset.depreciationRate);
    setDepreciationMethod(preset.method);
    setCurrency(preset.currency);
  };

  const handleReset = () => {
    setOriginalPrice(1000000);
    setVehicleAgeYears(3);
    setOdometerKm(42000);
    setCustomDepreciationRate(15);
    setDepreciationMethod('standard_curve');
    setCurrency('₹');
    setCondition('good');
    setOwnersCount(1);
    setFuelType('petrol');
  };

  // Copy Valuation Report
  const handleCopyReport = () => {
    const reportText = `=========================================
TOOLIQUE CAR DEPRECIATION & VALUATION REPORT
=========================================
Vehicle Profile: ${vehicleAgeYears} Years Old | ${fuelType.toUpperCase()} | Condition: ${condition.toUpperCase()}
Original Purchase Price: ${currency}${originalPrice.toLocaleString('en-IN')}
Odometer Reading: ${odometerKm.toLocaleString('en-IN')} km | Ownership: ${ownersCount} Owner(s)
Depreciation Methodology: ${depreciationMethod.replace('_', ' ').toUpperCase()}

-----------------------------------------
CURRENT VALUATION & RESIDUAL VALUE:
-----------------------------------------
• Estimated Fair Market Value: ${currency}${currentValuation.adjustedFairValue.toLocaleString('en-IN')}
• Total Value Depreciated: ${currency}${currentValuation.totalValueLost.toLocaleString('en-IN')} (${currentValuation.totalDepreciationPct}%)
• Retained Residual Equity: ${currentValuation.residualRetentionPct}%
• 5-Year Residual Value Retention: ${currentValuation.residual5YearPct}%

-----------------------------------------
USED CAR RESALE PRICING BANDS:
-----------------------------------------
• Private Seller Listing Price: ${currency}${currentValuation.privateSellerPrice.toLocaleString('en-IN')}
• Dealer Instant Trade-In Price: ${currency}${currentValuation.dealerTradeInPrice.toLocaleString('en-IN')}
• Certified Dealership Showroom Price: ${currency}${currentValuation.certifiedShowroomPrice.toLocaleString('en-IN')}

-----------------------------------------
TOTAL COST OF OWNERSHIP (ANNUAL DRAIN):
-----------------------------------------
• Annual Depreciation Loss: ${currency}${tcoCalculations.annualDepreciationLoss.toLocaleString('en-IN')}
• Total Annual Running Cost: ${currency}${tcoCalculations.totalAnnualOperatingCost.toLocaleString('en-IN')}
• Monthly Value & Operating Drain: ${currency}${tcoCalculations.monthlyDrain.toLocaleString('en-IN')} / month
• True Cost per Kilometer: ${currency}${tcoCalculations.costPerKmDriven} / km

Generated via Toolique India (https://toolique.com/automobile/car-depreciation-calculator)`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export CSV
  const handleExportCsv = () => {
    const csvRows = [
      ['Year', 'Opening Value', 'Annual Depreciation', 'Closing Value', 'Retained %'],
      ...scheduleTable.map((r) => [
        `Year ${r.year}`,
        r.year === 0 ? originalPrice : r.value + r.annualDrop,
        r.annualDrop,
        r.value,
        `${r.retainedPct}%`
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `car_depreciation_schedule_${originalPrice}_${vehicleAgeYears}yrs.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-left">
      {/* AEO Vehicle Valuation Insights Card (Strict Zero Double Heading) */}
      <div className="bg-gradient-to-br from-amber-50/90 via-white to-indigo-50/70 dark:from-amber-950/30 dark:via-zinc-900/60 dark:to-indigo-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-600 text-white uppercase tracking-wider flex items-center gap-1">
                <Car className="w-3 h-3" /> AEO Vehicle Valuation Studio
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Residual Value & Depreciation Engine
              </span>
            </div>
            <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 flex-wrap">
              <span>Fair Market Value: <strong className="font-mono text-base text-zinc-900 dark:text-white">{currency}{currentValuation.adjustedFairValue.toLocaleString('en-IN')}</strong></span>
              <span className="text-zinc-300 dark:text-zinc-700">|</span>
              <span>Value Depreciated: <strong className="font-mono text-rose-600 dark:text-rose-400">-{currentValuation.totalDepreciationPct}% ({currency}{currentValuation.totalValueLost.toLocaleString('en-IN')})</strong></span>
              <span className="text-zinc-300 dark:text-zinc-700">|</span>
              <span>Retained Equity: <strong className="font-mono text-emerald-600 dark:text-emerald-400">{currentValuation.residualRetentionPct}%</strong></span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyReport}
              className="px-3 py-1.5 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-200 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-amber-500" />}
              <span>{copied ? 'Copied Valuation!' : 'Copy Report'}</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV Schedule</span>
            </button>
          </div>
        </div>

        {/* 1-Click Archetype Presets */}
        <div className="mt-3 pt-3 border-t border-amber-100/70 dark:border-amber-900/30 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Archetypes:
          </span>
          {ARCHETYPES.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleApplyArchetype(preset)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white/80 dark:bg-zinc-800/80 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/80 transition cursor-pointer"
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
          { id: 'schedule', name: '📉 10-Year Depreciation Schedule', icon: TrendingDown },
          { id: 'used_evaluator', name: '🔍 Used Car Fair Market Value', icon: ShieldCheck },
          { id: 'tco', name: '💸 TCO & Monthly Value Drain', icon: Coins },
          { id: 'new_vs_used', name: '⚖️ New Car vs 3-Year Used Car', icon: Scale }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeMode === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveMode(tab.id as CalcMode)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-amber-600 text-white shadow-xs'
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
        {/* Left Column: Vehicle & Financial Parameters */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-500" />
                <span>Vehicle Financial Inputs</span>
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
                  title="Reset to defaults"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Original Purchase Price */}
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Original Invoice / Ex-Showroom Price ({currency})
              </label>
              <input
                type="number"
                step="10000"
                min={50000}
                value={originalPrice}
                onChange={(e) => setOriginalPrice(Math.max(1000, Number(e.target.value)))}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-base font-bold text-zinc-900 dark:text-white"
              />
            </div>

            {/* Vehicle Age Slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" /> Vehicle Age: <strong className="text-amber-600 dark:text-amber-400">{vehicleAgeYears} Years Old</strong>
                </label>
              </div>
              <input
                type="range"
                min={0}
                max={15}
                value={vehicleAgeYears}
                onChange={(e) => setVehicleAgeYears(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
            </div>

            {/* Depreciation Method Selector */}
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Depreciation Methodology
              </label>
              <select
                value={depreciationMethod}
                onChange={(e) => setDepreciationMethod(e.target.value as DepreciationMethod)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white"
              >
                <option value="standard_curve">Industry Standard Market Curve (IRDAI / Real Market)</option>
                <option value="declining_balance">Declining Balance Method (DBM - Fixed Annual %)</option>
                <option value="straight_line">Straight Line Method (SLM - Uniform Commercial Fleet)</option>
              </select>
            </div>

            {depreciationMethod === 'declining_balance' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                    Annual Depreciation Rate: <strong className="text-amber-600 dark:text-amber-400">{customDepreciationRate}% / Year</strong>
                  </label>
                </div>
                <input
                  type="range"
                  min={5}
                  max={35}
                  value={customDepreciationRate}
                  onChange={(e) => setCustomDepreciationRate(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
              </div>
            )}

            {/* Used Car Specific Inputs (Odometer, Condition, Owners) */}
            <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1 flex items-center gap-1">
                    <Gauge className="w-3.5 h-3.5 text-zinc-400" /> Odometer (km)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="1000"
                    value={odometerKm}
                    onChange={(e) => setOdometerKm(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Previous Owners
                  </label>
                  <select
                    value={ownersCount}
                    onChange={(e) => setOwnersCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white"
                  >
                    <option value={1}>1st Owner (Single hand)</option>
                    <option value={2}>2nd Owner (-6% discount)</option>
                    <option value={3}>3rd Owner or more (-14%)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Vehicle Condition
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as CarCondition)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white"
                  >
                    <option value="flawless">Mint / Flawless (+6%)</option>
                    <option value="good">Good / Well Maintained (0%)</option>
                    <option value="fair">Fair / Scratches (-8%)</option>
                    <option value="poor">Poor / High Wear (-18%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Fuel Propulsion
                  </label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value as FuelType)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white"
                  >
                    <option value="petrol">Petrol / Gasoline</option>
                    <option value="diesel">Diesel</option>
                    <option value="cng">CNG (Factory)</option>
                    <option value="ev">Electric Vehicle (EV)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* TCO Advanced Inputs (When TCO mode is open) */}
            {activeMode === 'tco' && (
              <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Annual Operating Overheads
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 mb-1">Annual Insurance</label>
                    <input
                      type="number"
                      value={annualInsurance}
                      onChange={(e) => setAnnualInsurance(Math.max(0, Number(e.target.value)))}
                      className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 mb-1">Annual Service</label>
                    <input
                      type="number"
                      value={annualMaintenance}
                      onChange={(e) => setAnnualMaintenance(Math.max(0, Number(e.target.value)))}
                      className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 mb-1">Annual Fuel Spend</label>
                    <input
                      type="number"
                      value={annualFuelSpend}
                      onChange={(e) => setAnnualFuelSpend(Math.max(0, Number(e.target.value)))}
                      className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 mb-1">Annual Mileage (km)</label>
                    <input
                      type="number"
                      value={annualKmDriven}
                      onChange={(e) => setAnnualKmDriven(Math.max(1, Number(e.target.value)))}
                      className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Calculations, Schedules & Insights */}
        <div className="lg:col-span-7 space-y-5">
          {/* MODE 1: 10-Year Schedule */}
          {activeMode === 'schedule' && (
            <div className="space-y-5">
              {/* Residual Value Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 space-y-1 shadow-2xs">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <Car className="w-3 h-3 text-amber-500" /> Current Value
                  </span>
                  <div className="text-lg font-extrabold text-zinc-900 dark:text-white font-mono">
                    {currency}{currentValuation.adjustedFairValue.toLocaleString('en-IN')}
                  </div>
                  <p className="text-[10px] text-zinc-500">At {vehicleAgeYears} years of age</p>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 space-y-1 shadow-2xs">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <TrendingDown className="w-3 h-3 text-rose-500" /> Total Depreciation
                  </span>
                  <div className="text-lg font-extrabold text-rose-600 dark:text-rose-400 font-mono">
                    -{currentValuation.totalDepreciationPct}%
                  </div>
                  <p className="text-[10px] text-zinc-500">Loss: {currency}{currentValuation.totalValueLost.toLocaleString('en-IN')}</p>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 space-y-1 shadow-2xs">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" /> 5-Year Residual
                  </span>
                  <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                    {currentValuation.residual5YearPct}%
                  </div>
                  <p className="text-[10px] text-zinc-500">Retained value benchmark</p>
                </div>
              </div>

              {/* Interactive Schedule Table */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-amber-500" />
                    <span>Year-by-Year Depreciation Trajectory</span>
                  </h3>
                  <span className="text-xs text-zinc-400 font-mono">
                    Method: {depreciationMethod.replace('_', ' ')}
                  </span>
                </div>

                <div className="overflow-x-auto max-h-80">
                  <table className="w-full text-xs text-left">
                    <thead className="sticky top-0 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5 rounded-l-lg">Timeline</th>
                        <th className="p-2.5">Annual Drop</th>
                        <th className="p-2.5">Total Depreciated</th>
                        <th className="p-2.5">Resale Value</th>
                        <th className="p-2.5 rounded-r-lg">Retained %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {scheduleTable.map((row) => {
                        const isCurrentYear = row.year === vehicleAgeYears;
                        return (
                          <tr
                            key={row.year}
                            className={
                              isCurrentYear
                                ? 'bg-amber-50/70 dark:bg-amber-950/30 font-bold text-amber-900 dark:text-amber-200'
                                : 'text-zinc-700 dark:text-zinc-300'
                            }
                          >
                            <td className="p-2.5 font-mono">
                              {row.year === 0 ? 'Brand New (0y)' : `Year ${row.year}`}
                              {isCurrentYear && <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-sm bg-amber-500 text-white">Current</span>}
                            </td>
                            <td className="p-2.5 font-mono text-zinc-500">
                              {row.year === 0 ? '—' : `-${currency}${row.annualDrop.toLocaleString('en-IN')}`}
                            </td>
                            <td className="p-2.5 font-mono text-rose-600 dark:text-rose-400">
                              -{currency}{row.cumulativeDrop.toLocaleString('en-IN')}
                            </td>
                            <td className="p-2.5 font-mono font-bold text-zinc-900 dark:text-white">
                              {currency}{row.value.toLocaleString('en-IN')}
                            </td>
                            <td className="p-2.5 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                              {row.retainedPct}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MODE 2: Used Car Fair Market Evaluator */}
          {activeMode === 'used_evaluator' && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Fair Market Value & Resale Pricing Bands</span>
                </h3>
              </div>

              {/* 3 Pricing Channels */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60 text-center space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Dealer Instant Trade-In</span>
                  <p className="text-xl font-black text-zinc-900 dark:text-white font-mono">
                    {currency}{currentValuation.dealerTradeInPrice.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] text-zinc-500">Fastest sale, 10–12% dealer margin</p>
                </div>

                <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 rounded-2xl border border-amber-200/80 dark:border-amber-900/40 text-center space-y-1 shadow-xs">
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase">
                    ⭐ Private Party Sale (Fair)
                  </span>
                  <p className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
                    {currency}{currentValuation.privateSellerPrice.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] text-zinc-500">Direct buyer-to-seller market value</p>
                </div>

                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60 text-center space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Certified Showroom</span>
                  <p className="text-xl font-black text-zinc-900 dark:text-white font-mono">
                    {currency}{currentValuation.certifiedShowroomPrice.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] text-zinc-500">With dealer warranty & refurbishing</p>
                </div>
              </div>

              {/* Valuation Insights */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60 text-xs text-zinc-600 dark:text-zinc-300 space-y-2">
                <p className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-500" /> Valuation Factor Breakdown:
                </p>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <li><strong>Odometer:</strong> {odometerKm.toLocaleString('en-IN')} km driven ({Math.round(odometerKm / Math.max(1, vehicleAgeYears)).toLocaleString('en-IN')} km/year vs national average 12,000 km/year).</li>
                  <li><strong>Physical Condition:</strong> {condition.toUpperCase()} grade ({condition === 'flawless' ? '+6% premium' : condition === 'poor' ? '-18% discount' : 'standard market rate'}).</li>
                  <li><strong>Ownership Count:</strong> {ownersCount} owner{ownersCount > 1 ? 's' : ''} on Registration Certificate (RC).</li>
                  <li><strong>Fuel Policy Factor:</strong> {fuelType.toUpperCase()} engine.</li>
                </ul>
              </div>
            </div>
          )}

          {/* MODE 3: TCO & Monthly Drain */}
          {activeMode === 'tco' && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-500" />
                  <span>Total Cost of Ownership & Monthly Value Drain</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60 text-center">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Annual Depreciation Loss</span>
                  <p className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono mt-0.5">
                    {currency}{tcoCalculations.annualDepreciationLoss.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] text-zinc-500">Invisible asset value loss</p>
                </div>

                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60 text-center">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Monthly Ownership Drain</span>
                  <p className="text-xl font-black text-zinc-900 dark:text-white font-mono mt-0.5">
                    {currency}{tcoCalculations.monthlyDrain.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] text-zinc-500">Depreciation + Fuel + Maintenance</p>
                </div>

                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60 text-center">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">True Cost per km Driven</span>
                  <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                    {currency}{tcoCalculations.costPerKmDriven} / km
                  </p>
                  <p className="text-[10px] text-zinc-500">Across {annualKmDriven.toLocaleString('en-IN')} km/year</p>
                </div>
              </div>

              {/* TCO Cost Composition Breakdown */}
              <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Annual Outflow Composition: {currency}{tcoCalculations.totalAnnualOperatingCost.toLocaleString('en-IN')} / Year
                </span>
                <div className="h-3 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex shadow-inner">
                  <div
                    className="h-full bg-rose-500"
                    style={{
                      width: `${(tcoCalculations.annualDepreciationLoss / tcoCalculations.totalAnnualOperatingCost) * 100}%`
                    }}
                    title="Depreciation"
                  />
                  <div
                    className="h-full bg-amber-500"
                    style={{
                      width: `${(annualFuelSpend / tcoCalculations.totalAnnualOperatingCost) * 100}%`
                    }}
                    title="Fuel"
                  />
                  <div
                    className="h-full bg-indigo-500"
                    style={{
                      width: `${(annualInsurance / tcoCalculations.totalAnnualOperatingCost) * 100}%`
                    }}
                    title="Insurance"
                  />
                  <div
                    className="h-full bg-emerald-500"
                    style={{
                      width: `${(annualMaintenance / tcoCalculations.totalAnnualOperatingCost) * 100}%`
                    }}
                    title="Maintenance"
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between text-[10px] text-zinc-400 pt-1">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> Depreciation ({Math.round((tcoCalculations.annualDepreciationLoss / tcoCalculations.totalAnnualOperatingCost) * 100)}%)</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Fuel ({Math.round((annualFuelSpend / tcoCalculations.totalAnnualOperatingCost) * 100)}%)</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500" /> Insurance ({Math.round((annualInsurance / tcoCalculations.totalAnnualOperatingCost) * 100)}%)</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Maintenance ({Math.round((annualMaintenance / tcoCalculations.totalAnnualOperatingCost) * 100)}%)</span>
                </div>
              </div>
            </div>
          )}

          {/* MODE 4: New vs 3-Year Used Car */}
          {activeMode === 'new_vs_used' && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Scale className="w-4 h-4 text-amber-500" />
                  <span>The 3-Year Certified Used Car Sweet Spot</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60 space-y-2">
                  <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 block">
                    Option A: Buy Brand New (0y → 3y)
                  </span>
                  <p className="text-lg font-bold text-zinc-900 dark:text-white font-mono">
                    Buy: {currency}{newVsUsedComparison.newPrice.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-bold font-mono">
                    3-Year Depreciation Loss: -{currency}{newVsUsedComparison.new3YearDepreciationLoss.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[11px] text-zinc-500">Takes the steepest ~38% initial depreciation hit.</p>
                </div>

                <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/40 space-y-2">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block">
                    Option B: Buy 3-Year Used (3y → 6y)
                  </span>
                  <p className="text-lg font-bold text-zinc-900 dark:text-white font-mono">
                    Buy: {currency}{newVsUsedComparison.usedBuyPrice.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                    Next 3-Year Depreciation Loss: -{currency}{newVsUsedComparison.used3YearDepreciationLoss.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[11px] text-zinc-500">Much flatter depreciation curve (only ~26% drop).</p>
                </div>
              </div>

              {/* Net Financial Savings Box */}
              <div className="p-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    Net Depreciation Capital Saved
                  </span>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                    {currency}{newVsUsedComparison.savingsBuyingUsed.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold font-mono">
                    {newVsUsedComparison.savingsPct}% Less Depreciation
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Legal / Insurance Disclaimer */}
          <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/30 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-amber-900 dark:text-amber-200">
              <p className="font-bold">Insurance & Resale Valuation Notice</p>
              <p className="leading-relaxed opacity-90">
                Car market values fluctuate based on regional demand, brand reliability reputations, service history records, local road taxes, and state green tax regulations. Actual dealer trade-in appraisals may vary by ±5–10%.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

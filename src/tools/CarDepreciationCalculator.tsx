/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from 'react';
import {
  Car,
  Bike,
  Truck,
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
  Info,
  Zap
} from 'lucide-react';

// --- Types & Interfaces ---
export type VehicleCategory = 'car' | 'bike' | 'truck' | 'taxi' | 'auto' | 'van' | 'ev';
export type DepreciationMethod = 'standard_curve' | 'declining_balance' | 'straight_line';
export type CarCondition = 'flawless' | 'good' | 'fair' | 'poor';
export type FuelType = 'petrol' | 'diesel' | 'cng' | 'ev' | 'lpg';
export type CalcMode = 'schedule' | 'used_evaluator' | 'tco' | 'new_vs_used';

export interface DepreciationArchetype {
  id: string;
  category: VehicleCategory;
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

export interface VehicleCategoryConfig {
  id: VehicleCategory;
  label: string;
  icon: any;
  defaultPrice: number;
  expectedAnnualKm: number;
  defaultDepRate: number;
  salvagePct: number;
  defaultInsurance: number;
  defaultMaintenance: number;
  defaultFuel: number;
  defaultFuelType: FuelType;
  allowedFuelTypes: FuelType[];
}

export const VEHICLE_CATEGORIES: VehicleCategoryConfig[] = [
  {
    id: 'car',
    label: 'Car / SUV',
    icon: Car,
    defaultPrice: 1000000,
    expectedAnnualKm: 12000,
    defaultDepRate: 15,
    salvagePct: 8,
    defaultInsurance: 25000,
    defaultMaintenance: 18000,
    defaultFuel: 75000,
    defaultFuelType: 'petrol',
    allowedFuelTypes: ['petrol', 'diesel', 'cng', 'ev', 'lpg']
  },
  {
    id: 'bike',
    label: 'Motorcycle / Scooter',
    icon: Bike,
    defaultPrice: 120000,
    expectedAnnualKm: 8000,
    defaultDepRate: 13,
    salvagePct: 10,
    defaultInsurance: 3500,
    defaultMaintenance: 5500,
    defaultFuel: 24000,
    defaultFuelType: 'petrol',
    allowedFuelTypes: ['petrol', 'ev']
  },
  {
    id: 'truck',
    label: 'Commercial Truck / LCV',
    icon: Truck,
    defaultPrice: 2800000,
    expectedAnnualKm: 60000,
    defaultDepRate: 18,
    salvagePct: 15,
    defaultInsurance: 65000,
    defaultMaintenance: 90000,
    defaultFuel: 450000,
    defaultFuelType: 'diesel',
    allowedFuelTypes: ['diesel', 'cng', 'ev', 'petrol']
  },
  {
    id: 'taxi',
    label: 'Taxi / Fleet Cab',
    icon: Car,
    defaultPrice: 920000,
    expectedAnnualKm: 45000,
    defaultDepRate: 22,
    salvagePct: 8,
    defaultInsurance: 35000,
    defaultMaintenance: 45000,
    defaultFuel: 180000,
    defaultFuelType: 'cng',
    allowedFuelTypes: ['cng', 'diesel', 'petrol', 'ev']
  },
  {
    id: 'auto',
    label: 'Auto Rickshaw (3-Wheeler)',
    icon: Gauge,
    defaultPrice: 260000,
    expectedAnnualKm: 30000,
    defaultDepRate: 18,
    salvagePct: 10,
    defaultInsurance: 9000,
    defaultMaintenance: 18000,
    defaultFuel: 75000,
    defaultFuelType: 'cng',
    allowedFuelTypes: ['cng', 'petrol', 'ev', 'diesel', 'lpg']
  },
  {
    id: 'van',
    label: 'Delivery Van / Cargo LCV',
    icon: Truck,
    defaultPrice: 850000,
    expectedAnnualKm: 35000,
    defaultDepRate: 18,
    salvagePct: 10,
    defaultInsurance: 28000,
    defaultMaintenance: 35000,
    defaultFuel: 150000,
    defaultFuelType: 'diesel',
    allowedFuelTypes: ['diesel', 'cng', 'petrol', 'ev']
  },
  {
    id: 'ev',
    label: 'Electric Vehicle (EV)',
    icon: Zap,
    defaultPrice: 1850000,
    expectedAnnualKm: 14000,
    defaultDepRate: 18,
    salvagePct: 10,
    defaultInsurance: 30000,
    defaultMaintenance: 12000,
    defaultFuel: 32000,
    defaultFuelType: 'ev',
    allowedFuelTypes: ['ev']
  }
];

const ARCHETYPES: DepreciationArchetype[] = [
  // Car Presets
  {
    id: 'petrol_hatchback',
    category: 'car',
    name: '🚗 Compact Petrol Hatchback',
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
    category: 'car',
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
    category: 'car',
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
  // Two-Wheeler / Bike Presets
  {
    id: 'commuter_bike',
    category: 'bike',
    name: '🏍️ 125cc Commuter Motorcycle',
    desc: '₹95,000, 2 Years Old (16,000 km, strong resale retention)',
    originalPrice: 95000,
    vehicleAgeYears: 2,
    odometerKm: 16000,
    fuelType: 'petrol',
    condition: 'good',
    ownersCount: 1,
    depreciationRate: 12,
    method: 'standard_curve',
    currency: '₹'
  },
  {
    id: 'cruiser_bike',
    category: 'bike',
    name: '🏍️ 350cc Cruiser / Premium Bike',
    desc: '₹2.2 Lakhs, 1 Year Old (7,000 km)',
    originalPrice: 220000,
    vehicleAgeYears: 1,
    odometerKm: 7000,
    fuelType: 'petrol',
    condition: 'flawless',
    ownersCount: 1,
    depreciationRate: 13,
    method: 'standard_curve',
    currency: '₹'
  },
  {
    id: 'electric_scooter',
    category: 'bike',
    name: '🛵 Electric 2-Wheeler Scooter',
    desc: '₹1.35 Lakhs, 1 Year Old (9,000 km)',
    originalPrice: 135000,
    vehicleAgeYears: 1,
    odometerKm: 9000,
    fuelType: 'ev',
    condition: 'good',
    ownersCount: 1,
    depreciationRate: 15,
    method: 'standard_curve',
    currency: '₹'
  },
  // Commercial Truck Presets
  {
    id: 'heavy_truck',
    category: 'truck',
    name: '🚛 16-Ton Heavy Commercial Truck (HCV)',
    desc: '₹32.0 Lakhs, 4 Years Old (240,000 km, Straight-Line Fleet)',
    originalPrice: 3200000,
    vehicleAgeYears: 4,
    odometerKm: 240000,
    fuelType: 'diesel',
    condition: 'good',
    ownersCount: 1,
    depreciationRate: 18,
    method: 'straight_line',
    currency: '₹'
  },
  {
    id: 'light_truck',
    category: 'truck',
    name: '🚚 3.5-Ton Light Commercial Vehicle (LCV)',
    desc: '₹11.5 Lakhs, 3 Years Old (110,000 km)',
    originalPrice: 1150000,
    vehicleAgeYears: 3,
    odometerKm: 110000,
    fuelType: 'diesel',
    condition: 'good',
    ownersCount: 1,
    depreciationRate: 18,
    method: 'straight_line',
    currency: '₹'
  },
  // Commercial Taxi Presets
  {
    id: 'commercial_cab',
    category: 'taxi',
    name: '🚖 Commercial Fleet Sedan / Cab',
    desc: '₹9.2 Lakhs, 3 Years Old (140,000 km, High Duty Cycle)',
    originalPrice: 920000,
    vehicleAgeYears: 3,
    odometerKm: 140000,
    fuelType: 'cng',
    condition: 'good',
    ownersCount: 1,
    depreciationRate: 22,
    method: 'declining_balance',
    currency: '₹'
  },
  // Auto Rickshaw Presets
  {
    id: 'auto_rickshaw',
    category: 'auto',
    name: '🛺 3-Wheeler Passenger Auto Rickshaw',
    desc: '₹2.6 Lakhs, 2 Years Old (65,000 km, City Duty)',
    originalPrice: 260000,
    vehicleAgeYears: 2,
    odometerKm: 65000,
    fuelType: 'cng',
    condition: 'good',
    ownersCount: 1,
    depreciationRate: 18,
    method: 'standard_curve',
    currency: '₹'
  },
  {
    id: 'electric_cargo_3w',
    category: 'auto',
    name: '🛺 Electric Cargo 3-Wheeler',
    desc: '₹3.1 Lakhs, 1 Year Old (28,000 km)',
    originalPrice: 310000,
    vehicleAgeYears: 1,
    odometerKm: 28000,
    fuelType: 'ev',
    condition: 'good',
    ownersCount: 1,
    depreciationRate: 18,
    method: 'standard_curve',
    currency: '₹'
  },
  // Van Presets
  {
    id: 'delivery_van',
    category: 'van',
    name: '🚐 Commercial Delivery Cargo Van',
    desc: '₹8.5 Lakhs, 3 Years Old (95,000 km)',
    originalPrice: 850000,
    vehicleAgeYears: 3,
    odometerKm: 95000,
    fuelType: 'diesel',
    condition: 'good',
    ownersCount: 1,
    depreciationRate: 18,
    method: 'straight_line',
    currency: '₹'
  },
  // EV Presets
  {
    id: 'electric_ev_suv',
    category: 'ev',
    name: '⚡ Long-Range Electric SUV',
    desc: '₹19.5 Lakhs, 2 Years Old (26,000 km)',
    originalPrice: 1950000,
    vehicleAgeYears: 2,
    odometerKm: 26000,
    fuelType: 'ev',
    condition: 'good',
    ownersCount: 1,
    depreciationRate: 18,
    method: 'standard_curve',
    currency: '₹'
  }
];

export default function CarDepreciationCalculator() {
  // Navigation Mode
  const [activeMode, setActiveMode] = useState<CalcMode>('schedule');

  // Vehicle Category
  const [vehicleCategory, setVehicleCategory] = useState<VehicleCategory>('car');

  // Core Inputs
  const [originalPrice, setOriginalPrice] = useState<number>(1000000); // 10 Lakhs
  const [vehicleAgeYears, setVehicleAgeYears] = useState<number>(3); // 0 - 15 years
  const [customDepreciationRate, setCustomDepreciationRate] = useState<number>(15); // % annual for DBM
  const [depreciationMethod, setDepreciationMethod] = useState<DepreciationMethod>('standard_curve');
  const [currency, setCurrency] = useState('₹');

  // Condition & Usage Modifiers for Used Vehicle Evaluation
  const [odometerKm, setOdometerKm] = useState<number>(36000);
  const [fuelType, setFuelType] = useState<FuelType>('petrol');
  const [condition, setCondition] = useState<CarCondition>('good');
  const [ownersCount, setOwnersCount] = useState<number>(1);
  const scrapValuePercent = 8; // Salvage floor

  // TCO Mode Specifics
  const [annualInsurance, setAnnualInsurance] = useState<number>(25000);
  const [annualMaintenance, setAnnualMaintenance] = useState<number>(18000);
  const [annualFuelSpend, setAnnualFuelSpend] = useState<number>(75000);
  const [annualKmDriven, setAnnualKmDriven] = useState<number>(12000);

  const [copied, setCopied] = useState(false);

  // Active Category Config
  const activeCategoryConfig = useMemo(() => {
    return VEHICLE_CATEGORIES.find((c) => c.id === vehicleCategory) || VEHICLE_CATEGORIES[0];
  }, [vehicleCategory]);

  // Handler for category switch
  const handleCategorySelect = (cat: VehicleCategory) => {
    setVehicleCategory(cat);
    const config = VEHICLE_CATEGORIES.find((c) => c.id === cat) || VEHICLE_CATEGORIES[0];
    setOriginalPrice(config.defaultPrice);
    setVehicleAgeYears(3);
    setCustomDepreciationRate(config.defaultDepRate);
    setFuelType(config.defaultFuelType);
    setAnnualInsurance(config.defaultInsurance);
    setAnnualMaintenance(config.defaultMaintenance);
    setAnnualFuelSpend(config.defaultFuel);
    setAnnualKmDriven(config.expectedAnnualKm);
    setOdometerKm(config.expectedAnnualKm * 3);
  };

  // --- Depreciation Schedule Engine ---
  // Standard IRDAI / Industry baseline schedule:
  const getStandardDepreciationPct = (year: number, category: VehicleCategory): number => {
    if (year <= 0) return 0;
    
    // Taxi & Commercial high duty curves drop faster
    if (category === 'taxi') {
      const taxiRates = [0, 25, 40, 52, 62, 70, 77, 83, 88, 91, 93];
      if (year < taxiRates.length) return taxiRates[year];
      return Math.min(95, 93 + (year - 10) * 0.5);
    }
    
    // Two-wheelers maintain strong secondary value
    if (category === 'bike') {
      const bikeRates = [0, 15, 24, 33, 42, 50, 58, 65, 71, 76, 80];
      if (year < bikeRates.length) return bikeRates[year];
      return Math.min(92, 80 + (year - 10) * 2.0);
    }

    const standardRates = [0, 18, 28, 38, 47, 56, 64, 71, 77, 82, 86, 89, 91, 93, 94, 95];
    if (year < standardRates.length) return standardRates[year];
    return Math.min(95, 86 + (year - 10) * 1.8);
  };

  // Computes base vehicle value at any given year under selected method
  const computeBaseValueAtYear = (
    p: number,
    year: number,
    method: DepreciationMethod,
    ratePct: number,
    salvagePct: number,
    cat: VehicleCategory
  ): number => {
    const salvageFloor = p * (salvagePct / 100);

    if (year <= 0) return p;

    if (method === 'standard_curve') {
      const depPct = getStandardDepreciationPct(year, cat);
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

    // Mileage deviation penalty calibrated by vehicle category
    const expectedAnnual = activeCategoryConfig.expectedAnnualKm;
    const expectedKm = Math.max(1, vehicleAgeYears) * expectedAnnual;
    if (odometerKm > expectedKm * 1.4) {
      factor -= 0.07; // High mileage penalty
    } else if (odometerKm < expectedKm * 0.6 && odometerKm > 0) {
      factor += 0.04; // Low mileage bonus
    }

    // Fuel type longevity factor
    if (fuelType === 'diesel') {
      factor -= 0.03; // NGT 10-year limit / diesel regulatory stigma
    } else if (fuelType === 'ev') {
      factor -= 0.04; // Rapid battery tech depreciation
    }

    return factor;
  }, [condition, ownersCount, odometerKm, vehicleAgeYears, fuelType, activeCategoryConfig]);

  // Current Estimated Value Calculation
  const currentValuation = useMemo(() => {
    const baseValue = computeBaseValueAtYear(
      originalPrice,
      vehicleAgeYears,
      depreciationMethod,
      customDepreciationRate,
      scrapValuePercent,
      vehicleCategory
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
      scrapValuePercent,
      vehicleCategory
    );
    const residual5YearPct = originalPrice > 0 ? (valueAt5Years / originalPrice) * 100 : 0;

    // Buying/Selling price bands for used vehicles
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
    vehicleCategory,
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
        scrapValuePercent,
        vehicleCategory
      );
      const prevVal = yr === 0 ? originalPrice : computeBaseValueAtYear(
        originalPrice,
        yr - 1,
        depreciationMethod,
        customDepreciationRate,
        scrapValuePercent,
        vehicleCategory
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
  }, [originalPrice, depreciationMethod, customDepreciationRate, scrapValuePercent, vehicleCategory]);

  // Total Cost of Ownership (TCO) Calculations
  const tcoCalculations = useMemo(() => {
    const currentVal = currentValuation.adjustedFairValue;
    // Next 1 year projected value
    const nextYearVal = computeBaseValueAtYear(
      originalPrice,
      vehicleAgeYears + 1,
      depreciationMethod,
      customDepreciationRate,
      scrapValuePercent,
      vehicleCategory
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
    vehicleCategory,
    conditionFactor,
    annualInsurance,
    annualMaintenance,
    annualFuelSpend,
    annualKmDriven
  ]);

  // New vs 3-Year Used Vehicle Comparison
  const newVsUsedComparison = useMemo(() => {
    const newPrice = originalPrice;
    // Value at year 3
    const usedBuyPrice = computeBaseValueAtYear(originalPrice, 3, 'standard_curve', 15, 8, vehicleCategory);
    // Value at year 6
    const usedSellPriceAt6 = computeBaseValueAtYear(originalPrice, 6, 'standard_curve', 15, 8, vehicleCategory);

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
  }, [originalPrice, vehicleCategory]);

  // Archetype Handler
  const handleApplyArchetype = (preset: DepreciationArchetype) => {
    setVehicleCategory(preset.category);
    setOriginalPrice(preset.originalPrice);
    setVehicleAgeYears(preset.vehicleAgeYears);
    setOdometerKm(preset.odometerKm);
    setFuelType(preset.fuelType);
    setCondition(preset.condition);
    setOwnersCount(preset.ownersCount);
    setCustomDepreciationRate(preset.depreciationRate);
    setDepreciationMethod(preset.method);
    setCurrency(preset.currency);

    const config = VEHICLE_CATEGORIES.find((c) => c.id === preset.category) || VEHICLE_CATEGORIES[0];
    setAnnualInsurance(config.defaultInsurance);
    setAnnualMaintenance(config.defaultMaintenance);
    setAnnualFuelSpend(config.defaultFuel);
    setAnnualKmDriven(config.expectedAnnualKm);
  };

  const handleReset = () => {
    const config = activeCategoryConfig;
    setOriginalPrice(config.defaultPrice);
    setVehicleAgeYears(3);
    setOdometerKm(config.expectedAnnualKm * 3);
    setCustomDepreciationRate(config.defaultDepRate);
    setDepreciationMethod('standard_curve');
    setCurrency('₹');
    setCondition('good');
    setOwnersCount(1);
    setFuelType(config.defaultFuelType);
    setAnnualInsurance(config.defaultInsurance);
    setAnnualMaintenance(config.defaultMaintenance);
    setAnnualFuelSpend(config.defaultFuel);
    setAnnualKmDriven(config.expectedAnnualKm);
  };

  // Copy Valuation Report
  const handleCopyReport = () => {
    const reportText = `=========================================
TOOLIQUE VEHICLE DEPRECIATION & VALUATION REPORT
=========================================
Vehicle Category: ${activeCategoryConfig.label.toUpperCase()}
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
USED VEHICLE RESALE PRICING BANDS:
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
      ['Vehicle Category', activeCategoryConfig.label],
      ['Original Price', `${currency}${originalPrice}`],
      ['Age (Years)', vehicleAgeYears],
      ['Odometer (km)', odometerKm],
      ['Depreciation Method', depreciationMethod],
      [],
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
    link.setAttribute('download', `vehicle_depreciation_${vehicleCategory}_${originalPrice}_${vehicleAgeYears}yrs.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter archetypes for the active category + highlight
  const filteredArchetypes = useMemo(() => {
    const categoryMatches = ARCHETYPES.filter((a) => a.category === vehicleCategory);
    if (categoryMatches.length > 0) return categoryMatches;
    return ARCHETYPES.slice(0, 4);
  }, [vehicleCategory]);

  return (
    <div className="space-y-6 text-left">
      {/* AEO Vehicle Valuation Insights Card (Strict Zero Double Heading) */}
      <div className="bg-gradient-to-br from-amber-50/90 via-white to-indigo-50/70 dark:from-amber-950/30 dark:via-zinc-900/60 dark:to-indigo-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-600 text-white uppercase tracking-wider flex items-center gap-1">
                <Car className="w-3 h-3" /> Vehicle Valuation Studio
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Cars • Bikes • Trucks • Taxis • Auto Rickshaws • EVs
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
            <Sparkles className="w-3 h-3 text-amber-500" /> {activeCategoryConfig.label} Presets:
          </span>
          {filteredArchetypes.map((preset) => (
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

      {/* Vehicle Category Selector Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 shadow-xs">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Select Vehicle Type:</span>
          <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">{activeCategoryConfig.label} Active</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {VEHICLE_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = vehicleCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition cursor-pointer text-center ${
                  isSelected
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-zinc-50 dark:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200/60 dark:border-zinc-700/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="truncate w-full">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-zinc-200 dark:border-zinc-800">
        {[
          { id: 'schedule', name: '📉 10-Year Depreciation Schedule', icon: TrendingDown },
          { id: 'used_evaluator', name: '🔍 Used Vehicle Fair Market Value', icon: ShieldCheck },
          { id: 'tco', name: '💸 TCO & Monthly Value Drain', icon: Coins },
          { id: 'new_vs_used', name: '⚖️ New Vehicle vs 3-Year Used', icon: Scale }
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
                <span>{activeCategoryConfig.label} Financial Inputs</span>
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
                  title="Reset to category defaults"
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
                min={10000}
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
                <option value="standard_curve">Industry Standard Market Curve (IRDAI / Category Benchmarked)</option>
                <option value="declining_balance">Declining Balance Method (DBM - Fixed Annual %)</option>
                <option value="straight_line">Straight Line Method (SLM - Commercial Fleet)</option>
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

            {/* Used Vehicle Specific Inputs (Odometer, Condition, Owners) */}
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
                    {activeCategoryConfig.allowedFuelTypes.includes('petrol') && (
                      <option value="petrol">Petrol / Gasoline</option>
                    )}
                    {activeCategoryConfig.allowedFuelTypes.includes('diesel') && (
                      <option value="diesel">Diesel</option>
                    )}
                    {activeCategoryConfig.allowedFuelTypes.includes('cng') && (
                      <option value="cng">CNG (Natural Gas)</option>
                    )}
                    {activeCategoryConfig.allowedFuelTypes.includes('ev') && (
                      <option value="ev">Electric Vehicle (EV Battery)</option>
                    )}
                    {activeCategoryConfig.allowedFuelTypes.includes('lpg') && (
                      <option value="lpg">LPG / AutoGas</option>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* TCO Advanced Inputs (When TCO mode is open) */}
            {activeMode === 'tco' && (
              <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Annual Operating Overheads ({activeCategoryConfig.label})
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
                    <label className="block text-[11px] font-medium text-zinc-500 mb-1">Annual Service/Tyres</label>
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
                    <label className="block text-[11px] font-medium text-zinc-500 mb-1">Annual Fuel / Charging</label>
                    <input
                      type="number"
                      value={annualFuelSpend}
                      onChange={(e) => setAnnualFuelSpend(Math.max(0, Number(e.target.value)))}
                      className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 mb-1">Annual Distance (km)</label>
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
                    <Car className="w-3 h-3 text-amber-500" /> Current Fair Value
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
                    <span>{activeCategoryConfig.label} 10-Year Trajectory</span>
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

          {/* MODE 2: Used Vehicle Fair Market Evaluator */}
          {activeMode === 'used_evaluator' && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Fair Market Resale Valuation Bands ({activeCategoryConfig.label})</span>
                </h3>
              </div>

              {/* 3 Pricing Channels */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60 text-center space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Dealer Instant Trade-In</span>
                  <p className="text-xl font-black text-zinc-900 dark:text-white font-mono">
                    {currency}{currentValuation.dealerTradeInPrice.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] text-zinc-500">Fastest liquid sale, 10–12% dealer margin</p>
                </div>

                <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 rounded-2xl border border-amber-200/80 dark:border-amber-900/40 text-center space-y-1 shadow-xs">
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase">
                    ⭐ Private Party Sale (Fair)
                  </span>
                  <p className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
                    {currency}{currentValuation.privateSellerPrice.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] text-zinc-500">Direct buyer-to-seller fair value</p>
                </div>

                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60 text-center space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Certified Showroom</span>
                  <p className="text-xl font-black text-zinc-900 dark:text-white font-mono">
                    {currency}{currentValuation.certifiedShowroomPrice.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] text-zinc-500">With dealer refurbishment & warranty</p>
                </div>
              </div>

              {/* Valuation Insights */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60 text-xs text-zinc-600 dark:text-zinc-300 space-y-2">
                <p className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-500" /> Appraisal Audit Breakdown:
                </p>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <li><strong>Odometer:</strong> {odometerKm.toLocaleString('en-IN')} km driven ({Math.round(odometerKm / Math.max(1, vehicleAgeYears)).toLocaleString('en-IN')} km/year vs category benchmark {activeCategoryConfig.expectedAnnualKm.toLocaleString('en-IN')} km/year).</li>
                  <li><strong>Physical Condition:</strong> {condition.toUpperCase()} grade ({condition === 'flawless' ? '+6% premium' : condition === 'poor' ? '-18% discount' : 'standard market rate'}).</li>
                  <li><strong>Ownership Count:</strong> {ownersCount} owner{ownersCount > 1 ? 's' : ''} on Registration Certificate (RC).</li>
                  <li><strong>Fuel Propulsion:</strong> {fuelType.toUpperCase()} powertrain.</li>
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
                  <span>Total Cost of Ownership & Monthly Value Drain ({activeCategoryConfig.label})</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60 text-center">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Annual Depreciation Loss</span>
                  <p className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono mt-0.5">
                    {currency}{tcoCalculations.annualDepreciationLoss.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] text-zinc-500">Invisible asset value erosion</p>
                </div>

                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60 text-center">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Monthly Ownership Drain</span>
                  <p className="text-xl font-black text-zinc-900 dark:text-white font-mono mt-0.5">
                    {currency}{tcoCalculations.monthlyDrain.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] text-zinc-500">Depreciation + Fuel + Maintenance</p>
                </div>

                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60 text-center">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">True Cost per km</span>
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
                    title="Fuel/Energy"
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
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Fuel/Energy ({Math.round((annualFuelSpend / tcoCalculations.totalAnnualOperatingCost) * 100)}%)</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500" /> Insurance ({Math.round((annualInsurance / tcoCalculations.totalAnnualOperatingCost) * 100)}%)</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Maintenance ({Math.round((annualMaintenance / tcoCalculations.totalAnnualOperatingCost) * 100)}%)</span>
                </div>
              </div>
            </div>
          )}

          {/* MODE 4: New vs 3-Year Used Vehicle */}
          {activeMode === 'new_vs_used' && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Scale className="w-4 h-4 text-amber-500" />
                  <span>The 3-Year Used Vehicle Sweet Spot ({activeCategoryConfig.label})</span>
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
                  <p className="text-[11px] text-zinc-500">Takes the steepest initial depreciation hit.</p>
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
                  <p className="text-[11px] text-zinc-500">Much flatter depreciation slope saves capital.</p>
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
              <p className="font-bold">Insurance IDV & Resale Valuation Notice</p>
              <p className="leading-relaxed opacity-90">
                Vehicle market values fluctuate based on regional demand, brand reliability reputations, service history records, local road taxes, commercial permits, and state green tax regulations. Actual dealer trade-in appraisals may vary by ±5–10%.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

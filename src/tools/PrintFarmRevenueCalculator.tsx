import { useState, useMemo } from 'react';
import { 
  Printer, 
  Clock, 
  Layers, 
  Copy, 
  Check, 
  Download, 
  Sparkles, 
  Sliders, 
  PieChart, 
  BarChart3, 
  Info, 
  Coins, 
  Boxes, 
  Factory, 
  Calendar
} from 'lucide-react';
import { jsPDF } from 'jspdf';

// --- Multi-Currency Configurations ---
interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  defaultPrinterCost: number;
  defaultHourlyRate: number;
  defaultSpoolPrice: number;
  defaultElecRate: number;
  defaultLaborRate: number;
  defaultPartRevenue: number;
}

const CURRENCIES: Record<string, CurrencyConfig> = {
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee (₹)',
    defaultPrinterCost: 45000,
    defaultHourlyRate: 150,
    defaultSpoolPrice: 1100,
    defaultElecRate: 8.0,
    defaultLaborRate: 250,
    defaultPartRevenue: 450
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar ($)',
    defaultPrinterCost: 650,
    defaultHourlyRate: 6.0,
    defaultSpoolPrice: 18,
    defaultElecRate: 0.16,
    defaultLaborRate: 20,
    defaultPartRevenue: 18
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro (€)',
    defaultPrinterCost: 680,
    defaultHourlyRate: 6.5,
    defaultSpoolPrice: 20,
    defaultElecRate: 0.28,
    defaultLaborRate: 22,
    defaultPartRevenue: 20
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound (£)',
    defaultPrinterCost: 580,
    defaultHourlyRate: 5.5,
    defaultSpoolPrice: 17,
    defaultElecRate: 0.26,
    defaultLaborRate: 18,
    defaultPartRevenue: 16
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar (C$)',
    defaultPrinterCost: 880,
    defaultHourlyRate: 8.0,
    defaultSpoolPrice: 25,
    defaultElecRate: 0.18,
    defaultLaborRate: 26,
    defaultPartRevenue: 24
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar (A$)',
    defaultPrinterCost: 980,
    defaultHourlyRate: 9.0,
    defaultSpoolPrice: 28,
    defaultElecRate: 0.25,
    defaultLaborRate: 29,
    defaultPartRevenue: 27
  }
};

// --- Farm Fleet Scale Presets ---
interface FarmPreset {
  id: string;
  name: string;
  printers: number;
  dailyHours: number;
  utilization: number;
  jobTimeHours: number;
  partWeightGrams: number;
  operatorHoursDaily: number;
  desc: string;
  badge: string;
}

const FARM_PRESETS: FarmPreset[] = [
  {
    id: 'side_hustle',
    name: 'Side Hustle / Starter Farm',
    printers: 4,
    dailyHours: 16,
    utilization: 75,
    jobTimeHours: 3.5,
    partWeightGrams: 75,
    operatorHoursDaily: 2,
    desc: '4 high-speed desktop printers running in a garage or studio space',
    badge: 'Micro Startup'
  },
  {
    id: 'commercial_studio',
    name: 'Commercial Print Studio',
    printers: 12,
    dailyHours: 20,
    utilization: 82,
    jobTimeHours: 4.0,
    partWeightGrams: 90,
    operatorHoursDaily: 4,
    desc: '12-printer farm running dedicated Etsy/Shopify catalog lines',
    badge: 'Growing Business'
  },
  {
    id: 'industrial_microfactory',
    name: 'Industrial Micro-Factory',
    printers: 30,
    dailyHours: 22,
    utilization: 88,
    jobTimeHours: 5.0,
    partWeightGrams: 140,
    operatorHoursDaily: 8,
    desc: '30-printer facility executing on-demand B2B contract manufacturing',
    badge: 'Commercial Plant'
  },
  {
    id: 'mass_production',
    name: 'Continuous Mass Production',
    printers: 60,
    dailyHours: 24,
    utilization: 92,
    jobTimeHours: 3.0,
    partWeightGrams: 65,
    operatorHoursDaily: 14,
    desc: 'Automated 60+ rack cluster replacing low-volume injection molding',
    badge: 'High-Volume Enterprise'
  }
];

export default function PrintFarmRevenueCalculator() {
  // Currency State
  const [currencyKey, setCurrencyKey] = useState<string>('INR');
  const currency = CURRENCIES[currencyKey] || CURRENCIES.INR;

  // Selected Fleet Preset
  const [selectedPresetId, setSelectedPresetId] = useState<string>('commercial_studio');

  // Revenue Modeling Mode: 'job' (Per Part / E-Commerce Sales) vs 'hourly' (B2B Machine Rate)
  const [pricingMode, setPricingMode] = useState<'job' | 'hourly'>('job');

  // Timeframe View Tab: 'daily' | 'monthly' | 'yearly' | 'scaling'
  const [timeframeTab, setTimeframeTab] = useState<'monthly' | 'yearly' | 'daily' | 'scaling'>('monthly');

  // --- Fleet Hardware Inputs ---
  const [printerCount, setPrinterCount] = useState<number>(12);
  const [printerUnitCost, setPrinterUnitCost] = useState<number>(currency.defaultPrinterCost);
  const [powerWattsPerPrinter, setPowerWattsPerPrinter] = useState<number>(125); // Avg FDM heated bed + toolhead

  // --- Production & Runtime Inputs ---
  const [plannedOperatingHours, setPlannedOperatingHours] = useState<number>(20); // Scheduled hours/day
  const [utilizationPercent, setUtilizationPercent] = useState<number>(82); // OEE uptime factor
  const [jobDurationHours, setJobDurationHours] = useState<number>(4.0); // Avg print time per bed/part
  const [partWeightGrams, setPartWeightGrams] = useState<number>(85); // Grams per part

  // --- Pricing & Revenue Inputs ---
  const [revenuePerPart, setRevenuePerPart] = useState<number>(currency.defaultPartRevenue); // In 'job' mode
  const [hourlyB2BRate, setHourlyB2BRate] = useState<number>(currency.defaultHourlyRate); // In 'hourly' mode
  const [marketplaceFeePercent, setMarketplaceFeePercent] = useState<number>(8.0); // Etsy/Stripe/E-comm blend

  // --- Operating Expenses (OPEX) Inputs ---
  const [spoolPrice, setSpoolPrice] = useState<number>(currency.defaultSpoolPrice);
  const [spoolWeightGrams, setSpoolWeightGrams] = useState<number>(1000);
  const [bulkMaterialDiscountPercent, setBulkMaterialDiscountPercent] = useState<number>(12); // 10-20% discount on wholesale

  const [electricityTariff, setElectricityTariff] = useState<number>(currency.defaultElecRate); // $/kWh or ₹/unit
  const [operatorHoursPerDay, setOperatorHoursPerDay] = useState<number>(4);
  const [operatorHourlyWage, setOperatorHourlyWage] = useState<number>(currency.defaultLaborRate);
  const [monthlyMaintenanceBudget, setMonthlyMaintenanceBudget] = useState<number>(
    currencyKey === 'INR' ? 4000 : 75
  ); // Spare nozzles, PEI sheets, grease, belts
  const [monthlyFacilityRent, setMonthlyFacilityRent] = useState<number>(0); // Rent / shop overhead

  // UI States
  const [copied, setCopied] = useState<boolean>(false);
  const [showAdvancedOpex, setShowAdvancedOpex] = useState<boolean>(false);

  // --- Currency Change Handler ---
  const handleCurrencyChange = (newKey: string) => {
    const newCurr = CURRENCIES[newKey];
    if (!newCurr) return;
    setCurrencyKey(newKey);
    setPrinterUnitCost(newCurr.defaultPrinterCost);
    setSpoolPrice(newCurr.defaultSpoolPrice);
    setElectricityTariff(newCurr.defaultElecRate);
    setOperatorHourlyWage(newCurr.defaultLaborRate);
    setRevenuePerPart(newCurr.defaultPartRevenue);
    setHourlyB2BRate(newCurr.defaultHourlyRate);
    setMonthlyMaintenanceBudget(newKey === 'INR' ? 4000 : 75);
  };

  // --- Preset Fleet Profile Handler ---
  const handlePresetChange = (presetId: string) => {
    setSelectedPresetId(presetId);
    const p = FARM_PRESETS.find(item => item.id === presetId);
    if (!p) return;
    setPrinterCount(p.printers);
    setPlannedOperatingHours(p.dailyHours);
    setUtilizationPercent(p.utilization);
    setJobDurationHours(p.jobTimeHours);
    setPartWeightGrams(p.partWeightGrams);
    setOperatorHoursPerDay(p.operatorHoursDaily);
  };

  // --- Comprehensive Math Engine ---
  const calculations = useMemo(() => {
    const validPrinters = Math.max(1, printerCount);
    const validHours = Math.max(1, Math.min(24, plannedOperatingHours));
    const validUtil = Math.max(1, Math.min(100, utilizationPercent)) / 100;
    const validJobTime = Math.max(0.1, jobDurationHours);

    // 1. Machine Uptime & Throughput
    const totalScheduledHoursDaily = validPrinters * validHours;
    const effectiveActiveHoursDaily = totalScheduledHoursDaily * validUtil;
    const effectiveHoursPerPrinterDaily = validHours * validUtil;

    // Completed Parts / Beds
    const dailyCompletedParts = (effectiveActiveHoursDaily / validJobTime);
    const monthlyCompletedParts = dailyCompletedParts * 30;
    const yearlyCompletedParts = dailyCompletedParts * 365;

    // 2. Material & Filament Flow
    const effectiveSpoolPrice = spoolPrice * (1 - bulkMaterialDiscountPercent / 100);
    const costPerGram = spoolWeightGrams > 0 ? effectiveSpoolPrice / spoolWeightGrams : 0;
    const dailyFilamentGrams = dailyCompletedParts * partWeightGrams * 1.06; // 6% purge & skirt overhead
    const dailyFilamentKg = dailyFilamentGrams / 1000;
    const monthlyFilamentKg = (dailyFilamentGrams * 30) / 1000;
    const yearlyFilamentKg = (dailyFilamentGrams * 365) / 1000;
    const monthlySpoolsUsed = Math.ceil((monthlyFilamentKg * 1000) / (spoolWeightGrams || 1000));

    // Daily & Monthly Material Cost
    const dailyMaterialCost = dailyFilamentGrams * costPerGram;
    const monthlyMaterialCost = dailyMaterialCost * 30;
    const yearlyMaterialCost = dailyMaterialCost * 365;

    // 3. Electrical Power Consumption
    const totalFleetPowerKw = (validPrinters * powerWattsPerPrinter) / 1000;
    const dailyElectricityKwh = totalFleetPowerKw * effectiveHoursPerPrinterDaily;
    const monthlyElectricityKwh = dailyElectricityKwh * 30;
    const yearlyElectricityKwh = dailyElectricityKwh * 365;

    const dailyElectricityCost = dailyElectricityKwh * electricityTariff;
    const monthlyElectricityCost = dailyElectricityCost * 30;
    const yearlyElectricityCost = dailyElectricityCost * 365;

    // 4. Labor Cost
    const dailyLaborCost = operatorHoursPerDay * operatorHourlyWage;
    const monthlyLaborCost = dailyLaborCost * 30;
    const yearlyLaborCost = dailyLaborCost * 365;

    // 5. Maintenance & Facilities
    const dailyMaintenanceCost = monthlyMaintenanceBudget / 30;
    const yearlyMaintenanceCost = monthlyMaintenanceBudget * 12;
    const dailyFacilityCost = monthlyFacilityRent / 30;
    const yearlyFacilityCost = monthlyFacilityRent * 12;

    // 6. Revenue Calculations
    let dailyGrossRevenue = 0;
    if (pricingMode === 'job') {
      dailyGrossRevenue = dailyCompletedParts * revenuePerPart;
    } else {
      // Hourly billing mode
      dailyGrossRevenue = effectiveActiveHoursDaily * hourlyB2BRate;
    }

    const monthlyGrossRevenue = dailyGrossRevenue * 30;
    const yearlyGrossRevenue = dailyGrossRevenue * 365;

    // 7. Marketplace & Sales Transaction Fees
    const dailyMarketplaceFees = dailyGrossRevenue * (marketplaceFeePercent / 100);
    const monthlyMarketplaceFees = monthlyGrossRevenue * (marketplaceFeePercent / 100);
    const yearlyMarketplaceFees = yearlyGrossRevenue * (marketplaceFeePercent / 100);

    // 8. Total Operating Expenses (OPEX)
    const dailyTotalOpex = dailyMaterialCost + dailyElectricityCost + dailyLaborCost + dailyMaintenanceCost + dailyFacilityCost + dailyMarketplaceFees;
    const monthlyTotalOpex = monthlyMaterialCost + monthlyElectricityCost + monthlyLaborCost + monthlyMaintenanceBudget + monthlyFacilityRent + monthlyMarketplaceFees;
    const yearlyTotalOpex = yearlyMaterialCost + yearlyElectricityCost + yearlyLaborCost + yearlyMaintenanceCost + yearlyFacilityCost + yearlyMarketplaceFees;

    // 9. Net Profit & Margins
    const dailyNetProfit = dailyGrossRevenue - dailyTotalOpex;
    const monthlyNetProfit = monthlyGrossRevenue - monthlyTotalOpex;
    const yearlyNetProfit = yearlyGrossRevenue - yearlyTotalOpex;

    const netMarginPercent = monthlyGrossRevenue > 0 
      ? (monthlyNetProfit / monthlyGrossRevenue) * 100 
      : 0;

    const grossMarginPercent = monthlyGrossRevenue > 0
      ? ((monthlyGrossRevenue - monthlyMaterialCost - monthlyElectricityCost) / monthlyGrossRevenue) * 100
      : 0;

    // 10. Capital Expenditure (CAPEX) & Payback Analysis
    const totalFleetCapex = validPrinters * printerUnitCost;
    const capexPaybackMonths = monthlyNetProfit > 0 
      ? totalFleetCapex / monthlyNetProfit 
      : 999;

    const revenuePerPrinterMonthly = monthlyGrossRevenue / validPrinters;
    const netProfitPerPrinterMonthly = monthlyNetProfit / validPrinters;
    const returnOnCapitalAnnual = totalFleetCapex > 0 
      ? (yearlyNetProfit / totalFleetCapex) * 100 
      : 0;

    // 11. Cost Percentage Breakdown for Donut / Visual Stack
    const opexBase = Math.max(0.01, monthlyTotalOpex);
    const pctMaterial = (monthlyMaterialCost / opexBase) * 100;
    const pctElectricity = (monthlyElectricityCost / opexBase) * 100;
    const pctLabor = (monthlyLaborCost / opexBase) * 100;
    const pctMaintenance = ((monthlyMaintenanceBudget + monthlyFacilityRent) / opexBase) * 100;
    const pctFees = (monthlyMarketplaceFees / opexBase) * 100;

    // 12. Fleet Scaling Multiplier Table (5, 10, 25, 50, 100 printers)
    const scalingTiers = [5, 10, 25, 50, 100].map(count => {
      const scaleFactor = count / validPrinters;
      const scaleRevenue = monthlyGrossRevenue * scaleFactor;
      const scaleNetProfit = monthlyNetProfit * scaleFactor;
      const scaleFilamentKg = monthlyFilamentKg * scaleFactor;
      const scaleCapex = count * printerUnitCost;
      const scalePayback = scaleNetProfit > 0 ? (scaleCapex / scaleNetProfit).toFixed(1) : 'N/A';
      return {
        printers: count,
        monthlyRevenue: scaleRevenue,
        monthlyNetProfit: scaleNetProfit,
        monthlyFilamentKg: scaleFilamentKg.toFixed(0),
        capex: scaleCapex,
        paybackMonths: scalePayback
      };
    });

    return {
      validPrinters,
      effectiveActiveHoursDaily,
      effectiveHoursPerPrinterDaily,
      dailyCompletedParts,
      monthlyCompletedParts,
      yearlyCompletedParts,
      dailyFilamentKg,
      monthlyFilamentKg,
      yearlyFilamentKg,
      monthlySpoolsUsed,
      dailyElectricityKwh,
      monthlyElectricityKwh,
      yearlyElectricityKwh,
      dailyMaterialCost,
      monthlyMaterialCost,
      yearlyMaterialCost,
      dailyElectricityCost,
      monthlyElectricityCost,
      yearlyElectricityCost,
      dailyLaborCost,
      monthlyLaborCost,
      yearlyLaborCost,
      dailyGrossRevenue,
      monthlyGrossRevenue,
      yearlyGrossRevenue,
      dailyMarketplaceFees,
      monthlyMarketplaceFees,
      yearlyMarketplaceFees,
      dailyTotalOpex,
      monthlyTotalOpex,
      yearlyTotalOpex,
      dailyNetProfit,
      monthlyNetProfit,
      yearlyNetProfit,
      netMarginPercent,
      grossMarginPercent,
      totalFleetCapex,
      capexPaybackMonths,
      revenuePerPrinterMonthly,
      netProfitPerPrinterMonthly,
      returnOnCapitalAnnual,
      pctMaterial,
      pctElectricity,
      pctLabor,
      pctMaintenance,
      pctFees,
      scalingTiers
    };
  }, [
    printerCount,
    printerUnitCost,
    powerWattsPerPrinter,
    plannedOperatingHours,
    utilizationPercent,
    jobDurationHours,
    partWeightGrams,
    pricingMode,
    revenuePerPart,
    hourlyB2BRate,
    marketplaceFeePercent,
    spoolPrice,
    spoolWeightGrams,
    bulkMaterialDiscountPercent,
    electricityTariff,
    operatorHoursPerDay,
    operatorHourlyWage,
    monthlyMaintenanceBudget,
    monthlyFacilityRent
  ]);

  // Currency Formatter
  const fmt = (val: number, decimals: number = 0) => {
    return `${currency.symbol}${val.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
  };

  // --- Copy Executive Summary ---
  const handleCopyPitch = () => {
    const c = calculations;
    const summary = `=== 3D PRINT FARM FINANCIAL & CAPACITY PROJECTION ===
Generated via Toolique Manufacturing Farm Engine

[FLEET ARCHITECTURE]
Fleet Size: ${printerCount} 3D Printers
Operating Schedule: ${plannedOperatingHours} hrs/day @ ${utilizationPercent}% Uptime
Effective Fleet Output: ${c.effectiveActiveHoursDaily.toFixed(1)} machine-hours/day
Daily Part Throughput: ${c.dailyCompletedParts.toFixed(1)} parts/day (~${c.monthlyCompletedParts.toFixed(0)} parts/month)

[FINANCIAL FORECAST]
Monthly Gross Revenue: ${fmt(c.monthlyGrossRevenue)}
Monthly Total OPEX: ${fmt(c.monthlyTotalOpex)}
- Raw Materials: ${fmt(c.monthlyMaterialCost)} (${c.monthlyFilamentKg.toFixed(1)} kg / ${c.monthlySpoolsUsed} spools)
- Power & Electricity: ${fmt(c.monthlyElectricityCost)} (${c.monthlyElectricityKwh.toFixed(0)} kWh)
- Operator Labor: ${fmt(c.monthlyLaborCost)}
- Maintenance & Shop: ${fmt(monthlyMaintenanceBudget + monthlyFacilityRent)}
- Marketplace / Platform Fees: ${fmt(c.monthlyMarketplaceFees)}
-----------------------------------------------------
MONTHLY NET OPERATING PROFIT: ${fmt(c.monthlyNetProfit)}
ANNUAL NET OPERATING INCOME: ${fmt(c.yearlyNetProfit)}
NET PROFIT MARGIN: ${c.netMarginPercent.toFixed(1)}%

[CAPITAL & EFFICIENCY METRICS]
Total Fleet CAPEX: ${fmt(c.totalFleetCapex)}
Estimated Capital Payback: ${c.capexPaybackMonths.toFixed(1)} months
Monthly Revenue / Printer: ${fmt(c.revenuePerPrinterMonthly)}
Annual Return on Capital (ROIC): ${c.returnOnCapitalAnnual.toFixed(0)}%
=====================================================`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- Professional Commercial PDF Export ---
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const c = calculations;
    const currSym = currency.symbol;

    // Banner
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 30, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text('3D PRINT FARM CAPACITY & FINANCIAL PROJECTION REPORT', 14, 13);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225);
    doc.text(`Fleet Size: ${printerCount} Printers | Model: ${pricingMode === 'job' ? 'E-Commerce / Unit Production' : 'B2B Hourly Machine Lease'} | Currency: ${currency.code}`, 14, 20);
    doc.text(`Generated: ${new Date().toLocaleDateString()} | Toolique Manufacturing Intelligence | Toolique.in`, 14, 25);

    // Section 1: Executive KPI Summary Box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 36, 182, 36, 3, 3, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, 36, 182, 36, 3, 3, 'S');

    // KPI 1: Monthly Revenue
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('MONTHLY REVENUE', 20, 44);
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text(`${currSym}${Math.round(c.monthlyGrossRevenue).toLocaleString()}`, 20, 52);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Annual: ${currSym}${Math.round(c.yearlyGrossRevenue).toLocaleString()}`, 20, 58);

    // KPI 2: Net Operating Profit
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('MONTHLY NET PROFIT', 80, 44);
    doc.setFontSize(14);
    doc.setTextColor(16, 185, 129); // emerald
    doc.text(`${currSym}${Math.round(c.monthlyNetProfit).toLocaleString()}`, 80, 52);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Net Margin: ${c.netMarginPercent.toFixed(1)}%`, 80, 58);

    // KPI 3: Fleet Throughput
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('MONTHLY THROUGHPUT', 140, 44);
    doc.setFontSize(14);
    doc.setTextColor(79, 70, 229); // indigo
    doc.text(`${Math.round(c.monthlyCompletedParts).toLocaleString()} Units`, 140, 52);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Filament: ${c.monthlyFilamentKg.toFixed(1)} kg/mo`, 140, 58);

    // Section 2: Financial Time Horizon Matrix
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.text('1. TIME HORIZON FINANCIAL STATEMENT', 14, 80);

    let y = 86;
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, 182, 7, 'F');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text('Financial Metric', 18, y + 5);
    doc.text('Daily Run-Rate', 85, y + 5);
    doc.text('Monthly (30 Days)', 125, y + 5);
    doc.text('Annual Forecast (365 Days)', 160, y + 5);

    const horizonRows = [
      { name: 'Gross Revenue', d: `${currSym}${c.dailyGrossRevenue.toFixed(0)}`, m: `${currSym}${c.monthlyGrossRevenue.toFixed(0)}`, a: `${currSym}${c.yearlyGrossRevenue.toFixed(0)}` },
      { name: 'Filament & Consumables Cost', d: `-${currSym}${c.dailyMaterialCost.toFixed(0)}`, m: `-${currSym}${c.monthlyMaterialCost.toFixed(0)}`, a: `-${currSym}${c.yearlyMaterialCost.toFixed(0)}` },
      { name: 'Electricity & Energy Tariff', d: `-${currSym}${c.dailyElectricityCost.toFixed(0)}`, m: `-${currSym}${c.monthlyElectricityCost.toFixed(0)}`, a: `-${currSym}${c.yearlyElectricityCost.toFixed(0)}` },
      { name: 'Operator & Technician Labor', d: `-${currSym}${c.dailyLaborCost.toFixed(0)}`, m: `-${currSym}${c.monthlyLaborCost.toFixed(0)}`, a: `-${currSym}${c.yearlyLaborCost.toFixed(0)}` },
      { name: 'Maintenance, Spares & Rent', d: `-${currSym}${(monthlyMaintenanceBudget/30 + monthlyFacilityRent/30).toFixed(0)}`, m: `-${currSym}${(monthlyMaintenanceBudget + monthlyFacilityRent).toFixed(0)}`, a: `-${currSym}${(monthlyMaintenanceBudget*12 + monthlyFacilityRent*12).toFixed(0)}` },
      { name: 'Marketplace / Gateway Fees', d: `-${currSym}${c.dailyMarketplaceFees.toFixed(0)}`, m: `-${currSym}${c.monthlyMarketplaceFees.toFixed(0)}`, a: `-${currSym}${c.yearlyMarketplaceFees.toFixed(0)}` },
    ];

    y += 7;
    horizonRows.forEach((r, idx) => {
      doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
      doc.rect(14, y, 182, 6.5, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      doc.text(r.name, 18, y + 4.5);
      doc.setTextColor(71, 85, 105);
      doc.text(r.d, 85, y + 4.5);
      doc.text(r.m, 125, y + 4.5);
      doc.text(r.a, 160, y + 4.5);
      y += 6.5;
    });

    // Net Profit Highlight Row
    doc.setFillColor(224, 231, 255);
    doc.rect(14, y, 182, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(67, 56, 202);
    doc.text('NET OPERATING PROFIT', 18, y + 5.5);
    doc.text(`${currSym}${c.dailyNetProfit.toFixed(0)}`, 85, y + 5.5);
    doc.text(`${currSym}${c.monthlyNetProfit.toFixed(0)}`, 125, y + 5.5);
    doc.text(`${currSym}${c.yearlyNetProfit.toFixed(0)}`, 160, y + 5.5);

    // Section 3: Fleet Capital & Operational Economics
    y += 16;
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text('2. FLEET CAPEX & OPERATIONAL PRODUCTIVITY', 14, y);

    y += 6;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, y, 182, 28, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, y, 182, 28, 2, 2, 'S');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(`Fleet Hardware CAPEX: ${currSym}${c.totalFleetCapex.toLocaleString()}`, 20, y + 7);
    doc.text(`Capital Payback Period: ${c.capexPaybackMonths.toFixed(1)} Months`, 20, y + 14);
    doc.text(`Annual Return on Capital (ROIC): ${c.returnOnCapitalAnnual.toFixed(0)}%`, 20, y + 21);

    doc.text(`Monthly Revenue / Printer: ${currSym}${c.revenuePerPrinterMonthly.toFixed(0)}`, 105, y + 7);
    doc.text(`Monthly Net Profit / Printer: ${currSym}${c.netProfitPerPrinterMonthly.toFixed(0)}`, 105, y + 14);
    doc.text(`Effective Fleet Runtime: ${c.effectiveActiveHoursDaily.toFixed(1)} hrs/day`, 105, y + 21);

    // Section 4: Fleet Scaling Table
    y += 36;
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text('3. FLEET EXPANSION & CAPACITY SCALING MATRIX', 14, y);

    y += 6;
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, 182, 7, 'F');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text('Printers', 18, y + 5);
    doc.text('Monthly Sales', 50, y + 5);
    doc.text('Monthly Net Profit', 90, y + 5);
    doc.text('Filament (kg)', 135, y + 5);
    doc.text('Payback', 170, y + 5);

    y += 7;
    c.scalingTiers.forEach((tier, i) => {
      doc.setFillColor(i % 2 === 0 ? 255 : 248, i % 2 === 0 ? 255 : 250, i % 2 === 0 ? 255 : 252);
      doc.rect(14, y, 182, 6, 'F');
      doc.setFont('helvetica', tier.printers === printerCount ? 'bold' : 'normal');
      doc.setTextColor(tier.printers === printerCount ? 79 : 51, tier.printers === printerCount ? 70 : 65, tier.printers === printerCount ? 229 : 85);
      doc.text(`${tier.printers} Machines`, 18, y + 4.2);
      doc.text(`${currSym}${Math.round(tier.monthlyRevenue).toLocaleString()}`, 50, y + 4.2);
      doc.text(`${currSym}${Math.round(tier.monthlyNetProfit).toLocaleString()}`, 90, y + 4.2);
      doc.text(`${tier.monthlyFilamentKg} kg`, 135, y + 4.2);
      doc.text(`${tier.paybackMonths} mo`, 170, y + 4.2);
      y += 6;
    });

    // Footer
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Toolique Industrial Micro-Factory Financial Modeler. All figures computed client-side.', 14, 285);

    doc.save(`3D_Print_Farm_Financial_Forecast_${Date.now()}.pdf`);
  };

  const c = calculations;

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-left pb-12">
      {/* Top Banner & Multi-Currency Switcher */}
      <div className="saas-card p-5 bg-gradient-to-r from-zinc-50 via-indigo-50/20 to-zinc-50 dark:from-zinc-900/90 dark:via-indigo-950/20 dark:to-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
            <Factory className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
              Print Farm Fleet & Revenue Modeler
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                CAPACITY & OPEX
              </span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Multi-printer throughput forecasts, unit COGS, power consumption, labor wages, and CAPEX payback metrics.
            </p>
          </div>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-xs">
          <span className="text-[11px] font-bold text-zinc-400 px-2">CURRENCY:</span>
          {Object.keys(CURRENCIES).map((curr) => (
            <button
              key={curr}
              onClick={() => handleCurrencyChange(curr)}
              className={`px-2.5 py-1 text-xs font-black rounded-lg transition-all cursor-pointer ${
                currencyKey === curr
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'
              }`}
            >
              {CURRENCIES[curr].symbol} {curr}
            </button>
          ))}
        </div>
      </div>

      {/* Preset Fleet Profiles */}
      <div className="saas-card p-4 space-y-2.5">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> 1-Click Fleet Scale Presets
          </span>
          <span className="text-[11px] text-zinc-400">Auto-calibrates realistic machine counts & runtimes</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {FARM_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => handlePresetChange(p.id)}
              className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                selectedPresetId === p.id
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 dark:border-indigo-500/60 ring-1 ring-indigo-500'
                  : 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200/70 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs text-zinc-900 dark:text-white">{p.name}</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                  {p.badge}
                </span>
              </div>
              <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold font-mono mt-1">
                {p.printers} Printers · {p.dailyHours}h/day @ {p.utilization}%
              </div>
              <div className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">{p.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Pricing Paradigm & Export Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <div className="flex gap-2">
          <button
            onClick={() => setPricingMode('job')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              pricingMode === 'job'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            <Boxes className="w-4 h-4" />
            E-Commerce / Per-Part Revenue Model
          </button>
          <button
            onClick={() => setPricingMode('hourly')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              pricingMode === 'hourly'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            <Clock className="w-4 h-4" />
            B2B Contract Machine Hourly Rate
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyPitch}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition cursor-pointer border border-zinc-200/60 dark:border-zinc-700"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-indigo-500" />}
            <span>{copied ? 'Copied Pitch' : 'Copy Pitch Summary'}</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition cursor-pointer border border-indigo-200/80 dark:border-indigo-800/80"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PDF Business Plan</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Inputs (7 cols) vs Outputs & Financial Forecast (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Fleet Parameters & Operational Expenses (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Section 1: Fleet Sizing & Runtime Efficiency */}
          <div className="saas-card p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                  1. Fleet Size & Operational Duty Cycle
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {c.effectiveActiveHoursDaily.toFixed(1)} Machine-Hrs / Day
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Printer Count Slider */}
              <div className="space-y-1.5 sm:col-span-2 bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-xl border border-zinc-200/50 dark:border-zinc-800">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-200">Total Active 3D Printers</label>
                  <div className="text-base font-black text-indigo-600 dark:text-indigo-400 font-mono">
                    {printerCount} Machines
                  </div>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  step="1"
                  value={printerCount}
                  onChange={(e) => setPrinterCount(Math.max(1, Number(e.target.value)))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                  <span>1 Unit (Solo)</span>
                  <span>10 Units (Studio)</span>
                  <span>50 Units (Factory)</span>
                  <span>100 Units</span>
                </div>
              </div>

              {/* Scheduled Hours / Day */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Scheduled Operating Hours</label>
                  <span className="text-xs font-mono font-bold text-zinc-400">{plannedOperatingHours} hrs/day</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={plannedOperatingHours}
                    onChange={(e) => setPlannedOperatingHours(Math.max(1, Math.min(24, Number(e.target.value))))}
                    className="saas-input font-mono"
                  />
                  <span className="text-xs font-bold text-zinc-400">hrs/day</span>
                </div>
              </div>

              {/* Utilization / Uptime % */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Uptime & Utilization</label>
                  <span className="text-xs font-mono font-bold text-zinc-400">{utilizationPercent}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="40"
                    max="98"
                    step="1"
                    value={utilizationPercent}
                    onChange={(e) => setUtilizationPercent(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <span className="text-xs font-bold font-mono text-zinc-400 min-w-[35px]">{utilizationPercent}%</span>
                </div>
              </div>

              {/* Average Job Duration */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Avg Print Duration / Bed</label>
                  <span className="text-xs font-mono font-bold text-zinc-400">{jobDurationHours} hrs</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0.2"
                    step="0.5"
                    value={jobDurationHours}
                    onChange={(e) => setJobDurationHours(Math.max(0.1, Number(e.target.value)))}
                    className="saas-input font-mono"
                  />
                  <span className="text-xs font-bold text-zinc-400">hrs</span>
                </div>
              </div>

              {/* Part Weight */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Avg Part / Bed Weight</label>
                  <span className="text-xs font-mono font-bold text-zinc-400">{partWeightGrams} g</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={partWeightGrams}
                    onChange={(e) => setPartWeightGrams(Math.max(1, Number(e.target.value)))}
                    className="saas-input font-mono"
                  />
                  <span className="text-xs font-bold text-zinc-400">g</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Pricing & Revenue Parameters */}
          <div className="saas-card p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                  2. Pricing & Sales Income Model
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                Gross Sales: {fmt(c.monthlyGrossRevenue)}/mo
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pricingMode === 'job' ? (
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Revenue Per Finished Print / Part</label>
                    <span className="text-xs font-mono font-bold text-zinc-400">{fmt(revenuePerPart)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-400">{currency.symbol}</span>
                    <input
                      type="number"
                      min="1"
                      step="5"
                      value={revenuePerPart}
                      onChange={(e) => setRevenuePerPart(Math.max(1, Number(e.target.value)))}
                      className="saas-input font-mono"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">B2B Machine Rate / Hour</label>
                    <span className="text-xs font-mono font-bold text-zinc-400">{fmt(hourlyB2BRate)}/hr</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-400">{currency.symbol}</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={hourlyB2BRate}
                      onChange={(e) => setHourlyB2BRate(Math.max(0.1, Number(e.target.value)))}
                      className="saas-input font-mono"
                    />
                    <span className="text-xs font-bold text-zinc-400">/hr</span>
                  </div>
                </div>
              )}

              {/* Platform / Marketplace Commission Rate */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Sales Channel / Gateway Fee %</label>
                  <span className="text-xs font-mono font-bold text-zinc-400">{marketplaceFeePercent}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="30"
                    step="0.5"
                    value={marketplaceFeePercent}
                    onChange={(e) => setMarketplaceFeePercent(Math.max(0, Number(e.target.value)))}
                    className="saas-input font-mono"
                  />
                  <span className="text-xs font-bold text-zinc-400">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Operating Expenses (OPEX) & Labor */}
          <div className="saas-card p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                  3. Consumables, Electricity & Labor OPEX
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-rose-500 dark:text-rose-400">
                Total OPEX: {fmt(c.monthlyTotalOpex)}/mo
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Spool Price & Bulk Discount */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Spool Purchase Price (1kg)</label>
                  <span className="text-xs font-mono font-bold text-zinc-400">{fmt(spoolPrice)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-400">{currency.symbol}</span>
                  <input
                    type="number"
                    min="1"
                    step="10"
                    value={spoolPrice}
                    onChange={(e) => setSpoolPrice(Math.max(1, Number(e.target.value)))}
                    className="saas-input font-mono"
                  />
                </div>
              </div>

              {/* Bulk Purchasing Discount */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Bulk Spool Discount</label>
                  <span className="text-xs font-mono font-bold text-zinc-400">{bulkMaterialDiscountPercent}% off</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="1"
                    value={bulkMaterialDiscountPercent}
                    onChange={(e) => setBulkMaterialDiscountPercent(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <span className="text-xs font-bold font-mono text-zinc-400 min-w-[35px]">{bulkMaterialDiscountPercent}%</span>
                </div>
              </div>

              {/* Operator Staffing Hours */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Technician Labor (Hrs/Day)</label>
                  <span className="text-xs font-mono font-bold text-zinc-400">{operatorHoursPerDay} hrs/day</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="24"
                    step="0.5"
                    value={operatorHoursPerDay}
                    onChange={(e) => setOperatorHoursPerDay(Math.max(0, Number(e.target.value)))}
                    className="saas-input font-mono"
                  />
                  <span className="text-xs font-bold text-zinc-400">hrs/day</span>
                </div>
              </div>

              {/* Operator Hourly Wage */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Operator Hourly Wage</label>
                  <span className="text-xs font-mono font-bold text-zinc-400">{fmt(operatorHourlyWage)}/hr</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-400">{currency.symbol}</span>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={operatorHourlyWage}
                    onChange={(e) => setOperatorHourlyWage(Math.max(0, Number(e.target.value)))}
                    className="saas-input font-mono"
                  />
                  <span className="text-xs font-bold text-zinc-400">/hr</span>
                </div>
              </div>

              {/* Spool Size Selector */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Spool Net Size Format</label>
                <select
                  value={spoolWeightGrams}
                  onChange={(e) => setSpoolWeightGrams(Number(e.target.value))}
                  className="saas-input"
                >
                  <option value="1000">1,000 g (Standard 1kg Spool)</option>
                  <option value="2500">2,500 g (2.5kg Farm Spool)</option>
                  <option value="5000">5,000 g (5kg Master Spool)</option>
                </select>
              </div>
            </div>

            {/* Advanced OPEX & Rent Toggle */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <button
                onClick={() => setShowAdvancedOpex(!showAdvancedOpex)}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 hover:underline cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                {showAdvancedOpex ? 'Hide Power Tariff & Rent Details' : 'Configure Power (Watts), Electricity Tariff & Facility Rent'}
              </button>

              {showAdvancedOpex && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-500">Power Draw / Printer</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="30"
                        max="800"
                        value={powerWattsPerPrinter}
                        onChange={(e) => setPowerWattsPerPrinter(Math.max(1, Number(e.target.value)))}
                        className="saas-input text-xs font-mono"
                      />
                      <span className="text-[10px] text-zinc-400 font-bold">W</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-500">Electricity Rate / kWh</label>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-zinc-400">{currency.symbol}</span>
                      <input
                        type="number"
                        min="0"
                        step="0.05"
                        value={electricityTariff}
                        onChange={(e) => setElectricityTariff(Math.max(0, Number(e.target.value)))}
                        className="saas-input text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-500">Monthly Shop Rent</label>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-zinc-400">{currency.symbol}</span>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={monthlyFacilityRent}
                        onChange={(e) => setMonthlyFacilityRent(Math.max(0, Number(e.target.value)))}
                        className="saas-input text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 sm:col-span-3">
                    <label className="text-[11px] font-bold text-zinc-500">Printer Purchase CAPEX / Machine</label>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-zinc-400">{currency.symbol}</span>
                      <input
                        type="number"
                        min="1"
                        step="500"
                        value={printerUnitCost}
                        onChange={(e) => setPrinterUnitCost(Math.max(1, Number(e.target.value)))}
                        className="saas-input text-xs font-mono"
                      />
                      <span className="text-[10px] text-zinc-400">Total Fleet CAPEX: {fmt(c.totalFleetCapex)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Financial Forecast & Scaling Matrix (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Main Profit KPI Highlight Card */}
          <div className="saas-card p-6 bg-gradient-to-br from-white via-zinc-50 to-indigo-50/30 dark:from-zinc-900 dark:via-zinc-900 dark:to-indigo-950/20 border-2 border-indigo-500/30 shadow-lg space-y-5">
            {/* Header / Horizon Selector */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Financial Forecast
              </span>

              <div className="flex bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg text-[10px] font-bold">
                <button
                  onClick={() => setTimeframeTab('monthly')}
                  className={`px-2 py-0.5 rounded-md transition ${timeframeTab === 'monthly' ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-xs' : 'text-zinc-500'}`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setTimeframeTab('yearly')}
                  className={`px-2 py-0.5 rounded-md transition ${timeframeTab === 'yearly' ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-xs' : 'text-zinc-500'}`}
                >
                  Yearly
                </button>
                <button
                  onClick={() => setTimeframeTab('daily')}
                  className={`px-2 py-0.5 rounded-md transition ${timeframeTab === 'daily' ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-xs' : 'text-zinc-500'}`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setTimeframeTab('scaling')}
                  className={`px-2 py-0.5 rounded-md transition ${timeframeTab === 'scaling' ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-xs' : 'text-zinc-500'}`}
                >
                  Scale Matrix
                </button>
              </div>
            </div>

            {/* View 1: Monthly Horizon */}
            {timeframeTab === 'monthly' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                    Monthly Net Operating Income
                  </div>
                  <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono my-1">
                    {fmt(c.monthlyNetProfit)}
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex justify-between font-medium">
                    <span>Gross Sales: {fmt(c.monthlyGrossRevenue)}</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Margin: {c.netMarginPercent.toFixed(1)}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60">
                    <div className="text-zinc-400 text-[10px] font-bold">Monthly Output</div>
                    <div className="font-mono font-black text-zinc-900 dark:text-white text-base mt-0.5">
                      {Math.round(c.monthlyCompletedParts).toLocaleString()} Parts
                    </div>
                    <div className="text-[9px] text-zinc-400 mt-0.5 font-mono">~{c.dailyCompletedParts.toFixed(1)} parts/day</div>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60">
                    <div className="text-zinc-400 text-[10px] font-bold">Filament Consumption</div>
                    <div className="font-mono font-black text-indigo-650 dark:text-indigo-400 text-base mt-0.5">
                      {c.monthlyFilamentKg.toFixed(1)} kg
                    </div>
                    <div className="text-[9px] text-zinc-400 mt-0.5 font-mono">{c.monthlySpoolsUsed} Spools / Month</div>
                  </div>
                </div>
              </div>
            )}

            {/* View 2: Yearly Horizon */}
            {timeframeTab === 'yearly' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/25">
                  <div className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                    Annual Net Operating Income (365d)
                  </div>
                  <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 font-mono my-1">
                    {fmt(c.yearlyNetProfit)}
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex justify-between font-medium">
                    <span>Annual Sales: {fmt(c.yearlyGrossRevenue)}</span>
                    <span>Annual OPEX: {fmt(c.yearlyTotalOpex)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60">
                    <div className="text-zinc-400 text-[10px] font-bold">Annual Part Production</div>
                    <div className="font-mono font-black text-zinc-900 dark:text-white text-base mt-0.5">
                      {Math.round(c.yearlyCompletedParts).toLocaleString()} Units
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60">
                    <div className="text-zinc-400 text-[10px] font-bold">Annual Filament Tonnage</div>
                    <div className="font-mono font-black text-indigo-650 dark:text-indigo-400 text-base mt-0.5">
                      {c.yearlyFilamentKg.toFixed(1)} kg
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* View 3: Daily Run-Rate */}
            {timeframeTab === 'daily' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700">
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Daily Fleet Gross Revenue
                  </div>
                  <div className="text-3xl font-black text-zinc-900 dark:text-white font-mono my-1">
                    {fmt(c.dailyGrossRevenue)}
                  </div>
                  <div className="text-[11px] text-zinc-400 flex justify-between">
                    <span>Daily Profit: {fmt(c.dailyNetProfit)}</span>
                    <span>Daily OPEX: {fmt(c.dailyTotalOpex)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60">
                    <div className="text-zinc-400 text-[10px] font-bold">Daily Power Consumption</div>
                    <div className="font-mono font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
                      {c.dailyElectricityKwh.toFixed(1)} kWh ({fmt(c.dailyElectricityCost)})
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60">
                    <div className="text-zinc-400 text-[10px] font-bold">Daily Filament Usage</div>
                    <div className="font-mono font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
                      {c.dailyFilamentKg.toFixed(2)} kg ({fmt(c.dailyMaterialCost)})
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* View 4: Scaling Comparison Matrix */}
            {timeframeTab === 'scaling' && (
              <div className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 pb-1">
                  Fleet Sizing & Profit Expansion
                </div>
                <div className="space-y-1.5 max-h-[190px] overflow-y-auto pr-1">
                  {c.scalingTiers.map((tier) => (
                    <div
                      key={tier.printers}
                      className={`flex items-center justify-between p-2 rounded-xl text-xs border ${
                        tier.printers === printerCount
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 font-bold'
                          : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200/60 dark:border-zinc-700/60'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-zinc-900 dark:text-white">{tier.printers} Printers</div>
                        <div className="text-[9px] text-zinc-400">{tier.monthlyFilamentKg} kg/mo · Payback: {tier.paybackMonths}m</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{fmt(tier.monthlyNetProfit)}/mo</div>
                        <div className="text-[9px] font-mono text-zinc-400">Sales: {fmt(tier.monthlyRevenue)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* OPEX Expense Breakdown Visual Stack */}
            <div className="space-y-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
              <div className="flex justify-between items-center text-xs font-bold text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <PieChart className="w-3.5 h-3.5 text-indigo-500" /> Monthly OPEX Breakdown
                </span>
                <span className="font-mono text-[10px] text-zinc-400">{fmt(c.monthlyTotalOpex)}</span>
              </div>

              {/* Stacked Progress Bar */}
              <div className="h-3 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden flex shadow-inner">
                <div style={{ width: `${c.pctMaterial}%` }} title={`Material: ${c.pctMaterial.toFixed(1)}%`} className="bg-indigo-500 h-full" />
                <div style={{ width: `${c.pctElectricity}%` }} title={`Power: ${c.pctElectricity.toFixed(1)}%`} className="bg-amber-500 h-full" />
                <div style={{ width: `${c.pctLabor}%` }} title={`Labor: ${c.pctLabor.toFixed(1)}%`} className="bg-blue-500 h-full" />
                <div style={{ width: `${c.pctMaintenance}%` }} title={`Maintenance & Rent: ${c.pctMaintenance.toFixed(1)}%`} className="bg-purple-500 h-full" />
                <div style={{ width: `${c.pctFees}%` }} title={`Platform Fees: ${c.pctFees.toFixed(1)}%`} className="bg-rose-500 h-full" />
              </div>

              {/* Legend Badges */}
              <div className="grid grid-cols-3 gap-y-1 gap-x-2 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 pt-1">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                  <span className="truncate">Polymer: {fmt(c.monthlyMaterialCost)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <span className="truncate">Power: {fmt(c.monthlyElectricityCost)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  <span className="truncate">Labor: {fmt(c.monthlyLaborCost)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                  <span className="truncate">Shop: {fmt(monthlyMaintenanceBudget + monthlyFacilityRent)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  <span className="truncate">Fees: {fmt(c.monthlyMarketplaceFees)}</span>
                </div>
                <div className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="truncate">Net Margin: {c.netMarginPercent.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Unit Economics & Fleet Productivity */}
          <div className="saas-card p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-indigo-500" /> Fleet Productivity & CAPEX Economics
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800">
                <div className="text-[10px] font-bold text-zinc-400">Revenue / Printer / Mo</div>
                <div className="text-sm font-black text-zinc-800 dark:text-zinc-200 font-mono mt-0.5">
                  {fmt(c.revenuePerPrinterMonthly)}
                </div>
                <div className="text-[9px] text-zinc-400 mt-0.5">Machine asset velocity</div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800">
                <div className="text-[10px] font-bold text-zinc-400">Profit / Printer / Mo</div>
                <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                  {fmt(c.netProfitPerPrinterMonthly)}
                </div>
                <div className="text-[9px] text-zinc-400 mt-0.5">Net cash yield per bed</div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800">
                <div className="text-[10px] font-bold text-zinc-400">CAPEX Payback Duration</div>
                <div className="text-sm font-black text-indigo-650 dark:text-indigo-400 font-mono mt-0.5">
                  {c.capexPaybackMonths.toFixed(1)} Months
                </div>
                <div className="text-[9px] text-zinc-400 mt-0.5">To recoup {fmt(c.totalFleetCapex)} hardware</div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-zinc-800">
                <div className="text-[10px] font-bold text-zinc-400">Annual Return on Capital</div>
                <div className="text-sm font-black text-zinc-800 dark:text-zinc-200 font-mono mt-0.5">
                  {c.returnOnCapitalAnnual.toFixed(0)}% ROIC
                </div>
                <div className="text-[9px] text-zinc-400 mt-0.5">Annualized asset return</div>
              </div>
            </div>
          </div>

          {/* Privacy & Sandbox Badge */}
          <div className="p-3.5 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              <strong>100% Client-Side Farm Sandbox:</strong> All fleet capacity models, financial projections, labor cost allocations, and investor summaries are executed locally in your browser memory.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

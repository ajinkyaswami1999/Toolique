import { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Clock, 
  Layers, 
  Copy, 
  Check, 
  Download, 
  Sparkles, 
  Sliders, 
  PieChart, 
  BarChart3, 
  Store, 
  Info, 
  Coins, 
  Boxes
} from 'lucide-react';
import { jsPDF } from 'jspdf';

// --- Multi-Currency Configs ---
interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  defaultSpoolPrice: number;
  defaultElecRate: number;
  defaultLaborRate: number;
  defaultSellingPrice: number;
  defaultShippingCost: number;
  defaultPackagingCost: number;
  fixedListingFee: number;
  fixedGatewayFee: number;
}

const CURRENCIES: Record<string, CurrencyConfig> = {
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee (₹)',
    defaultSpoolPrice: 1200,
    defaultElecRate: 8.0,
    defaultLaborRate: 250,
    defaultSellingPrice: 650,
    defaultShippingCost: 80,
    defaultPackagingCost: 25,
    fixedListingFee: 16.5, // Etsy ~0.20 USD
    fixedGatewayFee: 20.0  // Etsy ~0.25 USD
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar ($)',
    defaultSpoolPrice: 20,
    defaultElecRate: 0.16,
    defaultLaborRate: 20,
    defaultSellingPrice: 25,
    defaultShippingCost: 4.5,
    defaultPackagingCost: 1.5,
    fixedListingFee: 0.20,
    fixedGatewayFee: 0.25
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro (€)',
    defaultSpoolPrice: 22,
    defaultElecRate: 0.28,
    defaultLaborRate: 22,
    defaultSellingPrice: 28,
    defaultShippingCost: 4.8,
    defaultPackagingCost: 1.6,
    fixedListingFee: 0.19,
    fixedGatewayFee: 0.24
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound (£)',
    defaultSpoolPrice: 19,
    defaultElecRate: 0.26,
    defaultLaborRate: 18,
    defaultSellingPrice: 24,
    defaultShippingCost: 3.9,
    defaultPackagingCost: 1.3,
    fixedListingFee: 0.16,
    fixedGatewayFee: 0.20
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar (C$)',
    defaultSpoolPrice: 28,
    defaultElecRate: 0.18,
    defaultLaborRate: 25,
    defaultSellingPrice: 35,
    defaultShippingCost: 6.5,
    defaultPackagingCost: 2.0,
    fixedListingFee: 0.27,
    fixedGatewayFee: 0.34
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar (A$)',
    defaultSpoolPrice: 32,
    defaultElecRate: 0.25,
    defaultLaborRate: 28,
    defaultSellingPrice: 38,
    defaultShippingCost: 7.5,
    defaultPackagingCost: 2.2,
    fixedListingFee: 0.30,
    fixedGatewayFee: 0.38
  }
};

// --- Marketplace Platform Presets ---
interface PlatformPreset {
  id: string;
  name: string;
  platformPercent: number;
  gatewayPercent: number;
  fixedListing: number;
  fixedGateway: number;
  offsiteAdsPercent: number;
  desc: string;
}

const PLATFORM_PRESETS: PlatformPreset[] = [
  {
    id: 'etsy',
    name: 'Etsy Marketplace',
    platformPercent: 6.5,
    gatewayPercent: 3.0,
    fixedListing: 0.20,
    fixedGateway: 0.25,
    offsiteAdsPercent: 0,
    desc: '6.5% transaction + 3% payment + $0.20 listing + $0.25 processing'
  },
  {
    id: 'shopify',
    name: 'Shopify / Direct Store',
    platformPercent: 0.0,
    gatewayPercent: 2.9,
    fixedListing: 0.0,
    fixedGateway: 0.30,
    offsiteAdsPercent: 0,
    desc: 'Direct website sales with Stripe / Razorpay payment gateway'
  },
  {
    id: 'amazon',
    name: 'Amazon Handmade',
    platformPercent: 15.0,
    gatewayPercent: 0.0,
    fixedListing: 0.0,
    fixedGateway: 0.0,
    offsiteAdsPercent: 0,
    desc: '15.0% flat referral fee with integrated payment gateway'
  },
  {
    id: 'ebay',
    name: 'eBay Store',
    platformPercent: 13.25,
    gatewayPercent: 0.0,
    fixedListing: 0.35,
    fixedGateway: 0.30,
    offsiteAdsPercent: 0,
    desc: '13.25% final value fee + $0.35 insertion + $0.30 order fee'
  },
  {
    id: 'b2b',
    name: 'Direct B2B / Bank Wire',
    platformPercent: 0.0,
    gatewayPercent: 0.0,
    fixedListing: 0.0,
    fixedGateway: 0.0,
    offsiteAdsPercent: 0,
    desc: '0% fees for direct client invoices, NEFT/UPI, or cash transactions'
  },
  {
    id: 'custom',
    name: 'Custom Marketplace',
    platformPercent: 8.0,
    gatewayPercent: 2.5,
    fixedListing: 0.0,
    fixedGateway: 0.0,
    offsiteAdsPercent: 0,
    desc: 'Custom commission percentages and fixed per-order charges'
  }
];

// --- Quick Starter Print Job Templates ---
interface PrintTemplate {
  id: string;
  name: string;
  weightG: number;
  printHours: number;
  laborMins: number;
  materialType: string;
  sellingMultiplier: number;
  desc: string;
}

const PRINT_TEMPLATES: PrintTemplate[] = [
  {
    id: 'custom',
    name: 'Custom Project',
    weightG: 85,
    printHours: 4.5,
    laborMins: 10,
    materialType: 'PLA',
    sellingMultiplier: 3.5,
    desc: 'Manual custom parameters'
  },
  {
    id: 'articulated',
    name: 'Articulated Dragon / Toy',
    weightG: 120,
    printHours: 6.5,
    laborMins: 8,
    materialType: 'Silk PLA',
    sellingMultiplier: 4.0,
    desc: 'Popular Etsy sensory toy / flexi print with high perceived value'
  },
  {
    id: 'phone_stand',
    name: 'Desk / Phone Stand',
    weightG: 55,
    printHours: 2.5,
    laborMins: 5,
    materialType: 'PETG',
    sellingMultiplier: 3.2,
    desc: 'Fast utility print with low post-processing and steady demand'
  },
  {
    id: 'b2b_enclosure',
    name: 'Electronics Enclosure',
    weightG: 175,
    printHours: 9.0,
    laborMins: 20,
    materialType: 'ABS / PA-CF',
    sellingMultiplier: 4.5,
    desc: 'Functional engineering jig with heat-set brass inserts'
  },
  {
    id: 'miniature',
    name: 'Tabletop Miniature',
    weightG: 35,
    printHours: 3.5,
    laborMins: 25,
    materialType: 'Resin / Fine PLA',
    sellingMultiplier: 5.0,
    desc: 'High-detail tabletop model requiring support cleanup and curing'
  }
];

export default function PrintProfitCalculator() {
  // Currency State
  const [currencyKey, setCurrencyKey] = useState<string>('INR');
  const currency = CURRENCIES[currencyKey] || CURRENCIES.INR;

  // Operating Mode Tab: 'forward' (Selling Price -> Profit), 'reverse' (Target Margin -> Price), 'batch' (Volume Analysis)
  const [modeTab, setModeTab] = useState<'forward' | 'reverse' | 'batch'>('forward');

  // Selected Platform Preset
  const [platformId, setPlatformId] = useState<string>('etsy');
  const activePreset = PLATFORM_PRESETS.find(p => p.id === platformId) || PLATFORM_PRESETS[0];

  // Selected Template Preset
  const [templateId, setTemplateId] = useState<string>('custom');

  // --- Manufacturing COGS Inputs ---
  const [partWeightGrams, setPartWeightGrams] = useState<number>(85);
  const [spoolPrice, setSpoolPrice] = useState<number>(currency.defaultSpoolPrice);
  const [spoolWeightGrams, setSpoolWeightGrams] = useState<number>(1000);
  const [wasteScrapPercent, setWasteScrapPercent] = useState<number>(8); // AMS purge, skirts, supports

  const [printHours, setPrintHours] = useState<number>(4);
  const [printMinutes, setPrintMinutes] = useState<number>(30);
  const [machineDeprPerHour, setMachineDeprPerHour] = useState<number>(
    currencyKey === 'INR' ? 25 : 0.50
  );

  const [machinePowerWatts, setMachinePowerWatts] = useState<number>(120); // Avg FDM heated bed + hotend
  const [electricityRate, setElectricityRate] = useState<number>(currency.defaultElecRate);

  const [laborMinutes, setLaborMinutes] = useState<number>(10);
  const [laborHourlyRate, setLaborHourlyRate] = useState<number>(currency.defaultLaborRate);

  const [packagingCost, setPackagingCost] = useState<number>(currency.defaultPackagingCost);
  const [hardwareCost, setHardwareCost] = useState<number>(0); // M3 bolts, heat inserts, magnets
  const [failureRiskPercent, setFailureRiskPercent] = useState<number>(5); // 5% buffer for reprints

  // --- Pricing & Marketplace Inputs ---
  const [sellingPrice, setSellingPrice] = useState<number>(currency.defaultSellingPrice);
  const [customerShippingPaid, setCustomerShippingPaid] = useState<number>(0);
  const [actualShippingCost, setActualShippingCost] = useState<number>(0);

  // Platform Customization Overrides
  const [platformFeePercent, setPlatformFeePercent] = useState<number>(activePreset.platformPercent);
  const [paymentGatewayPercent, setPaymentGatewayPercent] = useState<number>(activePreset.gatewayPercent);
  const [fixedListingFee, setFixedListingFee] = useState<number>(
    currencyKey === 'INR' ? activePreset.fixedListing * 83 : activePreset.fixedListing
  );
  const [fixedGatewayFee, setFixedGatewayFee] = useState<number>(
    currencyKey === 'INR' ? activePreset.fixedGateway * 83 : activePreset.fixedGateway
  );
  const [offsiteAdsPercent, setOffsiteAdsPercent] = useState<number>(0);

  // Target Margin Mode Input
  const [targetMarginPercent, setTargetMarginPercent] = useState<number>(50);

  // Batch Mode Input
  const [batchQuantity, setBatchQuantity] = useState<number>(50);

  // UI States
  const [copied, setCopied] = useState<boolean>(false);
  const [showAdvancedOverheads, setShowAdvancedOverheads] = useState<boolean>(false);

  // --- Currency Change Handler ---
  const handleCurrencyChange = (newKey: string) => {
    const newCurr = CURRENCIES[newKey];
    if (!newCurr) return;
    setCurrencyKey(newKey);
    setSpoolPrice(newCurr.defaultSpoolPrice);
    setElectricityRate(newCurr.defaultElecRate);
    setLaborHourlyRate(newCurr.defaultLaborRate);
    setSellingPrice(newCurr.defaultSellingPrice);
    setPackagingCost(newCurr.defaultPackagingCost);
    setMachineDeprPerHour(newKey === 'INR' ? 25 : 0.50);
    setFixedListingFee(newKey === 'INR' ? activePreset.fixedListing * 83 : activePreset.fixedListing);
    setFixedGatewayFee(newKey === 'INR' ? activePreset.fixedGateway * 83 : activePreset.fixedGateway);
  };

  // --- Platform Change Handler ---
  const handlePlatformChange = (pId: string) => {
    setPlatformId(pId);
    const p = PLATFORM_PRESETS.find(item => item.id === pId) || PLATFORM_PRESETS[0];
    setPlatformFeePercent(p.platformPercent);
    setPaymentGatewayPercent(p.gatewayPercent);
    setFixedListingFee(currencyKey === 'INR' ? p.fixedListing * 83 : p.fixedListing);
    setFixedGatewayFee(currencyKey === 'INR' ? p.fixedGateway * 83 : p.fixedGateway);
    setOffsiteAdsPercent(p.offsiteAdsPercent);
  };

  // --- Template Preset Handler ---
  const handleTemplateChange = (tId: string) => {
    setTemplateId(tId);
    const t = PRINT_TEMPLATES.find(item => item.id === tId);
    if (!t || t.id === 'custom') return;
    setPartWeightGrams(t.weightG);
    const totalMins = t.printHours * 60;
    setPrintHours(Math.floor(t.printHours));
    setPrintMinutes(Math.round(totalMins % 60));
    setLaborMinutes(t.laborMins);
  };

  // --- Core Calculations ---
  const calculations = useMemo(() => {
    const totalPrintHours = Math.max(0.01, printHours + printMinutes / 60);

    // 1. Material Cost (with purge/waste buffer)
    const effectiveFilamentGrams = partWeightGrams * (1 + wasteScrapPercent / 100);
    const costPerGram = spoolWeightGrams > 0 ? spoolPrice / spoolWeightGrams : 0;
    const materialCost = effectiveFilamentGrams * costPerGram;

    // 2. Machine Depreciation & Wear Cost
    const machineWearCost = totalPrintHours * machineDeprPerHour;

    // 3. Electricity Cost
    const electricityKwh = (machinePowerWatts / 1000) * totalPrintHours;
    const electricityCost = electricityKwh * electricityRate;

    // 4. Labor Cost
    const laborHours = laborMinutes / 60;
    const laborCost = laborHours * laborHourlyRate;

    // 5. Packaging & Hardware
    const packagingTotal = packagingCost + hardwareCost;

    // 6. Direct Manufacturing Subtotal & Failure Buffer
    const manufacturingSubtotal = materialCost + machineWearCost + electricityCost + laborCost + packagingTotal;
    const failureBufferCost = manufacturingSubtotal * (failureRiskPercent / 100);
    const totalUnitCOGS = manufacturingSubtotal + failureBufferCost;

    // 7. Marketplace & Platform Fee Calculations
    const grossCustomerPaid = sellingPrice + customerShippingPaid;
    const totalFeeRatePercent = platformFeePercent + paymentGatewayPercent + offsiteAdsPercent;
    
    // Fee = % on Gross + fixed listing + fixed gateway
    const percentageFees = grossCustomerPaid * (totalFeeRatePercent / 100);
    const fixedFees = fixedListingFee + fixedGatewayFee;
    const totalPlatformFees = percentageFees + fixedFees;

    // 8. Shipping Delta (if actual shipping > customer paid shipping)
    const netShippingExpense = Math.max(0, actualShippingCost - customerShippingPaid);

    // 9. Forward Profit Metrics
    const netRevenueReceived = grossCustomerPaid - totalPlatformFees;
    const totalAllExpenses = totalUnitCOGS + actualShippingCost;
    const netProfit = grossCustomerPaid - totalPlatformFees - totalUnitCOGS - (actualShippingCost - customerShippingPaid);
    
    const grossMarginPercent = grossCustomerPaid > 0 
      ? ((grossCustomerPaid - totalUnitCOGS) / grossCustomerPaid) * 100 
      : 0;
    
    const netMarginPercent = grossCustomerPaid > 0 
      ? (netProfit / grossCustomerPaid) * 100 
      : 0;

    const markupMultiplier = totalUnitCOGS > 0 
      ? sellingPrice / totalUnitCOGS 
      : 0;

    const roiPercent = totalUnitCOGS > 0 
      ? (netProfit / totalUnitCOGS) * 100 
      : 0;

    const hourlyEarnings = totalPrintHours > 0 
      ? netProfit / totalPrintHours 
      : 0;

    const profitPerGram = partWeightGrams > 0 
      ? netProfit / partWeightGrams 
      : 0;

    // 10. Reverse Target Margin Pricing Engine
    // Equation: Target Selling Price P = (COGS + fixedFees + netShippingExpense) / (1 - FeePercent - TargetMarginPercent)
    const feeFraction = totalFeeRatePercent / 100;
    const targetMarginFraction = targetMarginPercent / 100;
    const reverseDenominator = 1 - feeFraction - targetMarginFraction;
    
    const calculatedTargetPrice = reverseDenominator > 0.05
      ? (totalUnitCOGS + fixedFees + netShippingExpense) / reverseDenominator
      : (totalUnitCOGS * 3.5);

    // Tiers for Reverse pricing
    const calcTierPrice = (marginPct: number) => {
      const denom = 1 - feeFraction - (marginPct / 100);
      if (denom <= 0.05) return totalUnitCOGS * (1 + marginPct / 100) * 1.5;
      return (totalUnitCOGS + fixedFees + netShippingExpense) / denom;
    };

    const tierBudget = calcTierPrice(30);
    const tierBalanced = calcTierPrice(50);
    const tierPremium = calcTierPrice(70);

    // 11. Batch Production Mode Metrics
    const batchTotalUnits = Math.max(1, batchQuantity);
    const batchTotalRevenue = grossCustomerPaid * batchTotalUnits;
    const batchTotalCOGS = totalUnitCOGS * batchTotalUnits;
    const batchTotalPlatformFees = totalPlatformFees * batchTotalUnits;
    const batchTotalNetProfit = netProfit * batchTotalUnits;
    const batchTotalPrintHours = totalPrintHours * batchTotalUnits;
    const batchTotalPrintDays = (batchTotalPrintHours / 24).toFixed(1);
    const batchTotalFilamentKg = ((effectiveFilamentGrams * batchTotalUnits) / 1000).toFixed(2);
    const batchSpoolsRequired = Math.ceil((effectiveFilamentGrams * batchTotalUnits) / (spoolWeightGrams || 1000));
    const batchTotalElectricityKwh = (electricityKwh * batchTotalUnits).toFixed(1);

    // Break-even Analysis (Units to cover a $500 / ₹40,000 3D printer hardware investment)
    const printerCapitalEstimate = currencyKey === 'INR' ? 35000 : 450;
    const breakEvenUnits = netProfit > 0 
      ? Math.ceil(printerCapitalEstimate / netProfit) 
      : 999;

    // 12. Percentages Breakdown for Chart
    const breakdownTotal = Math.max(0.01, totalUnitCOGS + totalPlatformFees + (netProfit > 0 ? netProfit : 0));
    const pctMaterial = (materialCost / breakdownTotal) * 100;
    const pctMachineElec = ((machineWearCost + electricityCost) / breakdownTotal) * 100;
    const pctLabor = (laborCost / breakdownTotal) * 100;
    const pctPackaging = (packagingTotal / breakdownTotal) * 100;
    const pctPlatformFees = (totalPlatformFees / breakdownTotal) * 100;
    const pctNetProfit = Math.max(0, (netProfit / breakdownTotal) * 100);

    return {
      totalPrintHours,
      effectiveFilamentGrams,
      materialCost,
      machineWearCost,
      electricityKwh,
      electricityCost,
      laborHours,
      laborCost,
      packagingTotal,
      manufacturingSubtotal,
      failureBufferCost,
      totalUnitCOGS,
      grossCustomerPaid,
      totalFeeRatePercent,
      percentageFees,
      fixedFees,
      totalPlatformFees,
      netShippingExpense,
      netRevenueReceived,
      totalAllExpenses,
      netProfit,
      grossMarginPercent,
      netMarginPercent,
      markupMultiplier,
      roiPercent,
      hourlyEarnings,
      profitPerGram,
      calculatedTargetPrice,
      tierBudget,
      tierBalanced,
      tierPremium,
      batchTotalUnits,
      batchTotalRevenue,
      batchTotalCOGS,
      batchTotalPlatformFees,
      batchTotalNetProfit,
      batchTotalPrintHours,
      batchTotalPrintDays,
      batchTotalFilamentKg,
      batchSpoolsRequired,
      batchTotalElectricityKwh,
      breakEvenUnits,
      printerCapitalEstimate,
      pctMaterial,
      pctMachineElec,
      pctLabor,
      pctPackaging,
      pctPlatformFees,
      pctNetProfit
    };
  }, [
    partWeightGrams,
    wasteScrapPercent,
    spoolPrice,
    spoolWeightGrams,
    printHours,
    printMinutes,
    machineDeprPerHour,
    machinePowerWatts,
    electricityRate,
    laborMinutes,
    laborHourlyRate,
    packagingCost,
    hardwareCost,
    failureRiskPercent,
    sellingPrice,
    customerShippingPaid,
    actualShippingCost,
    platformFeePercent,
    paymentGatewayPercent,
    offsiteAdsPercent,
    fixedListingFee,
    fixedGatewayFee,
    targetMarginPercent,
    batchQuantity,
    currencyKey
  ]);

  // Format Helper
  const fmt = (val: number, decimals: number = 2) => {
    return `${currency.symbol}${val.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
  };

  // --- Copy Quote to Clipboard ---
  const handleCopyQuote = () => {
    const c = calculations;
    const quoteText = `--- 3D PRINT COMMERCIAL QUOTE & PROFIT BREAKDOWN ---
Generated via Toolique Print Profit Engine

[PROJECT SPECIFICATIONS]
Part Weight: ${partWeightGrams}g (Effective: ${c.effectiveFilamentGrams.toFixed(1)}g with waste)
Print Time: ${printHours}h ${printMinutes}m (${c.totalPrintHours.toFixed(2)} hrs)
Platform: ${activePreset.name}

[UNIT COST OF GOODS SOLD (COGS)]
Material (Filament): ${fmt(c.materialCost)}
Machine Depreciation: ${fmt(c.machineWearCost)}
Electricity (${machinePowerWatts}W @ ${currency.symbol}${electricityRate}/kWh): ${fmt(c.electricityCost)}
Post-Processing Labor (${laborMinutes} min): ${fmt(c.laborCost)}
Packaging & Hardware: ${fmt(c.packagingTotal)}
Scrap Contingency (${failureRiskPercent}%): ${fmt(c.failureBufferCost)}
---------------------------------------------
TOTAL UNIT COGS: ${fmt(c.totalUnitCOGS)}

[COMMERCIAL PRICING & MARKETPLACE FEES]
Retail Selling Price: ${fmt(sellingPrice)}
Total Marketplace & Gateway Fees: ${fmt(c.totalPlatformFees)} (${c.totalFeeRatePercent}% + fixed)
---------------------------------------------
NET PROFIT PER UNIT: ${fmt(c.netProfit)}
NET PROFIT MARGIN: ${c.netMarginPercent.toFixed(1)}%
MARKUP MULTIPLIER: ${c.markupMultiplier.toFixed(2)}x
PRINT FARM HOURLY RETURN: ${fmt(c.hourlyEarnings)}/hour

[BATCH PRODUCTION (${c.batchTotalUnits} UNITS)]
Total Batch Revenue: ${fmt(c.batchTotalRevenue)}
Total Batch Net Profit: ${fmt(c.batchTotalNetProfit)}
Total Filament: ${c.batchTotalFilamentKg} kg (${c.batchSpoolsRequired} spools)
Total Machine Time: ${c.batchTotalPrintHours.toFixed(1)} hrs (~${c.batchTotalPrintDays} days)
---------------------------------------------`;

    navigator.clipboard.writeText(quoteText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- Professional Commercial PDF Export ---
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const c = calculations;
    const currSym = currency.symbol;

    // Header Banner
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 30, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('3D PRINT COMMERCIAL COSTING & PROFIT REPORT', 14, 13);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225);
    doc.text(`Platform: ${activePreset.name} | Currency: ${currency.code} | Date: ${new Date().toLocaleDateString()}`, 14, 20);
    doc.text(`Toolique Manufacturing Intelligence Suite | Toolique.in`, 14, 25);

    // Section 1: Executive KPI Cards
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 36, 182, 36, 3, 3, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, 36, 182, 36, 3, 3, 'S');

    // KPI 1: Retail Price
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('SELLING PRICE', 20, 44);
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text(`${currSym}${sellingPrice.toFixed(2)}`, 20, 52);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`COGS: ${currSym}${c.totalUnitCOGS.toFixed(2)}`, 20, 58);

    // KPI 2: Net Profit
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('NET PROFIT / UNIT', 80, 44);
    doc.setFontSize(14);
    doc.setTextColor(16, 185, 129); // emerald-600
    doc.text(`${currSym}${c.netProfit.toFixed(2)}`, 80, 52);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`ROI: ${c.roiPercent.toFixed(0)}% on cost`, 80, 58);

    // KPI 3: Net Margin %
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('NET MARGIN', 140, 44);
    doc.setFontSize(14);
    doc.setTextColor(79, 70, 229); // indigo-600
    doc.text(`${c.netMarginPercent.toFixed(1)}%`, 140, 52);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Markup: ${c.markupMultiplier.toFixed(2)}x`, 140, 58);

    // Section 2: Detailed Cost Itemization Table
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('1. ITEMIZED UNIT MANUFACTURING COGS BREAKDOWN', 14, 82);

    let y = 88;
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, 182, 7, 'F');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text('Cost Component', 18, y + 5);
    doc.text('Parameters / Details', 75, y + 5);
    doc.text('Amount', 165, y + 5);

    const costRows = [
      { name: 'Raw Material (Filament)', detail: `${partWeightGrams}g + ${wasteScrapPercent}% waste @ ${currSym}${spoolPrice}/spool`, val: `${currSym}${c.materialCost.toFixed(2)}` },
      { name: 'Machine Depreciation & Wear', detail: `${c.totalPrintHours.toFixed(2)} hrs @ ${currSym}${machineDeprPerHour}/hr`, val: `${currSym}${c.machineWearCost.toFixed(2)}` },
      { name: 'Electricity & Energy', detail: `${machinePowerWatts}W @ ${currSym}${electricityRate}/kWh (${c.electricityKwh.toFixed(3)} kWh)`, val: `${currSym}${c.electricityCost.toFixed(2)}` },
      { name: 'Post-Processing & Assembly Labor', detail: `${laborMinutes} mins @ ${currSym}${laborHourlyRate}/hr`, val: `${currSym}${c.laborCost.toFixed(2)}` },
      { name: 'Packaging, Box & Embedded Hardware', detail: `Mailer box (${currSym}${packagingCost}) + Hardware (${currSym}${hardwareCost})`, val: `${currSym}${c.packagingTotal.toFixed(2)}` },
      { name: 'Scrap & Failure Buffer', detail: `${failureRiskPercent}% reprint risk contingency`, val: `${currSym}${c.failureBufferCost.toFixed(2)}` },
    ];

    y += 7;
    costRows.forEach((row, i) => {
      doc.setFillColor(i % 2 === 0 ? 255 : 248, i % 2 === 0 ? 255 : 250, i % 2 === 0 ? 255 : 252);
      doc.rect(14, y, 182, 7, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      doc.text(row.name, 18, y + 5);
      doc.setTextColor(100, 116, 139);
      doc.text(row.detail, 75, y + 5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(row.val, 165, y + 5);
      y += 7;
    });

    // Subtotal Row
    doc.setFillColor(224, 231, 255);
    doc.rect(14, y, 182, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(67, 56, 202);
    doc.text('TOTAL DIRECT UNIT COGS', 18, y + 5.5);
    doc.text(`${currSym}${c.totalUnitCOGS.toFixed(2)}`, 165, y + 5.5);

    // Section 3: Marketplace Platform Deductions
    y += 16;
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('2. PLATFORM DEDUCTIONS & NET DISBURSEMENT', 14, y);

    y += 6;
    const feeRows = [
      { name: `Platform Commission (${platformFeePercent}%)`, val: `${currSym}${(c.grossCustomerPaid * platformFeePercent / 100).toFixed(2)}` },
      { name: `Payment Gateway Fee (${paymentGatewayPercent}% + ${currSym}${fixedGatewayFee.toFixed(2)})`, val: `${currSym}${(c.grossCustomerPaid * paymentGatewayPercent / 100 + fixedGatewayFee).toFixed(2)}` },
      { name: `Fixed Listing & Insertion Fee`, val: `${currSym}${fixedListingFee.toFixed(2)}` },
      { name: `Total Deductions Taken by Platform`, val: `-${currSym}${c.totalPlatformFees.toFixed(2)}` },
      { name: `Net Payout Disbursed to Maker`, val: `${currSym}${c.netRevenueReceived.toFixed(2)}` }
    ];

    feeRows.forEach((r, idx) => {
      doc.setFillColor(idx === 3 ? 254 : (idx === 4 ? 236 : (idx % 2 === 0 ? 255 : 248)), idx === 3 ? 242 : (idx === 4 ? 253 : 250), idx === 3 ? 242 : (idx === 4 ? 245 : 252));
      doc.rect(14, y, 182, 6.5, 'F');
      doc.setFont('helvetica', idx >= 3 ? 'bold' : 'normal');
      doc.setTextColor(idx === 3 ? 220 : (idx === 4 ? 16 : 30), idx === 3 ? 38 : (idx === 4 ? 185 : 41), idx === 3 ? 38 : (idx === 4 ? 129 : 59));
      doc.text(r.name, 18, y + 4.5);
      doc.text(r.val, 165, y + 4.5);
      y += 6.5;
    });

    // Section 4: Batch Economics & Farm Scaling
    y += 14;
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(`3. COMMERCIAL BATCH PRODUCTION FORECAST (${c.batchTotalUnits} UNITS)`, 14, y);

    y += 6;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, y, 182, 28, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, y, 182, 28, 2, 2, 'S');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(`Total Gross Revenue: ${currSym}${c.batchTotalRevenue.toFixed(2)}`, 20, y + 7);
    doc.text(`Total Manufacturing Cost: ${currSym}${c.batchTotalCOGS.toFixed(2)}`, 20, y + 14);
    doc.text(`Total Marketplace Fees: ${currSym}${c.batchTotalPlatformFees.toFixed(2)}`, 20, y + 21);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129);
    doc.text(`NET BATCH TAKE-HOME: ${currSym}${c.batchTotalNetProfit.toFixed(2)}`, 105, y + 7);
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Print Time: ${c.batchTotalPrintHours.toFixed(1)} hrs (~${c.batchTotalPrintDays} days)`, 105, y + 14);
    doc.text(`Raw Material: ${c.batchTotalFilamentKg} kg (${c.batchSpoolsRequired} spools)`, 105, y + 21);

    // Footer
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Generated strictly in client sandbox. Verified 3D Print Financial Engineering Standard.', 14, 285);

    doc.save(`3D_Print_Profit_Quote_${Date.now()}.pdf`);
  };

  const c = calculations;

  // Margin Health Color
  const getMarginBadge = (m: number) => {
    if (m >= 60) return { bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', label: 'Exceptional (60%+)' };
    if (m >= 40) return { bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20', label: 'Healthy Commercial (40-60%)' };
    if (m >= 20) return { bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', label: 'Moderate / Wholesale (20-40%)' };
    if (m > 0) return { bg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20', label: 'Thin Margin (<20%)' };
    return { bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20', label: 'Loss Making Alert!' };
  };

  const marginBadge = getMarginBadge(c.netMarginPercent);

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-left pb-12">
      {/* Top Header & Preset Tool Bar */}
      <div className="saas-card p-5 bg-gradient-to-r from-zinc-50 via-indigo-50/20 to-zinc-50 dark:from-zinc-900/90 dark:via-indigo-950/20 dark:to-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
              Print Profit & Commercial Quote Engine
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                PRO E-COMMERCE
              </span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Precise COGS, marketplace commissions (Etsy/Shopify/Amazon), target margin reverse pricing & batch forecasts.
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

      {/* Mode Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <div className="flex gap-2">
          <button
            onClick={() => setModeTab('forward')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              modeTab === 'forward'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Forward Profit & Margin Analysis
          </button>
          <button
            onClick={() => setModeTab('reverse')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              modeTab === 'reverse'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Target Margin Reverse Pricing
          </button>
          <button
            onClick={() => setModeTab('batch')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              modeTab === 'batch'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            <Boxes className="w-4 h-4" />
            Batch Production & Farm Scaling
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyQuote}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition cursor-pointer border border-zinc-200/60 dark:border-zinc-700"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-indigo-500" />}
            <span>{copied ? 'Copied Quote' : 'Copy Quote'}</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition cursor-pointer border border-indigo-200/80 dark:border-indigo-800/80"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PDF Export</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Inputs vs Outputs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Cost of Goods Sold & Platform Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Quick Starter Template Bar */}
          <div className="saas-card p-4 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> 1-Click Part Presets
              </span>
              <span className="text-[11px] text-zinc-400">Loads realistic weights & print times</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRINT_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => handleTemplateChange(tpl.id)}
                  className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                    templateId === tpl.id
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 dark:border-indigo-500/60 ring-1 ring-indigo-500'
                      : 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200/70 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="font-bold text-xs text-zinc-900 dark:text-white truncate">{tpl.name}</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5 font-mono">{tpl.weightG}g · {tpl.printHours}h · {tpl.materialType}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 1: Raw Material & Filament Cost */}
          <div className="saas-card p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                  1. Filament & Raw Material
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                Material: {fmt(c.materialCost)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Part Print Weight</label>
                  <span className="text-xs font-mono font-bold text-zinc-400">{partWeightGrams} grams</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={partWeightGrams}
                    onChange={(e) => setPartWeightGrams(Math.max(1, Number(e.target.value)))}
                    className="saas-input font-mono"
                  />
                  <span className="text-xs font-bold text-zinc-400">g</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Spool Purchase Price</label>
                  <span className="text-xs font-mono font-bold text-zinc-400">{fmt(spoolPrice)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-400">{currency.symbol}</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={spoolPrice}
                    onChange={(e) => setSpoolPrice(Math.max(0, Number(e.target.value)))}
                    className="saas-input font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Spool Net Weight</label>
                <select
                  value={spoolWeightGrams}
                  onChange={(e) => setSpoolWeightGrams(Number(e.target.value))}
                  className="saas-input"
                >
                  <option value="1000">1,000 g (Standard 1kg Spool)</option>
                  <option value="750">750 g (Specialty / PolyLite)</option>
                  <option value="500">500 g (Half Spool / Sample)</option>
                  <option value="2500">2,500 g (2.5kg Farm Spool)</option>
                  <option value="5000">5,000 g (5kg Bulk Spool)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Purge & Support Waste</label>
                  <span className="text-xs font-mono font-bold text-zinc-400">{wasteScrapPercent}% ({c.effectiveFilamentGrams.toFixed(1)}g)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="35"
                  step="1"
                  value={wasteScrapPercent}
                  onChange={(e) => setWasteScrapPercent(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Machine Time, Electricity & Labor */}
          <div className="saas-card p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                  2. Machine Runtime, Energy & Labor
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                Op Cost: {fmt(c.machineWearCost + c.electricityCost + c.laborCost)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Print Time Hours & Mins */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Total Slicer Print Time</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="0"
                      max="200"
                      value={printHours}
                      onChange={(e) => setPrintHours(Math.max(0, Number(e.target.value)))}
                      className="saas-input font-mono text-center"
                    />
                    <span className="text-xs font-bold text-zinc-400">hrs</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={printMinutes}
                      onChange={(e) => setPrintMinutes(Math.max(0, Math.min(59, Number(e.target.value))))}
                      className="saas-input font-mono text-center"
                    />
                    <span className="text-xs font-bold text-zinc-400">mins</span>
                  </div>
                </div>
              </div>

              {/* Machine Maintenance & Depreciation Rate */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Machine Hourly Depreciation</label>
                  <span className="text-xs font-mono font-bold text-zinc-400">{fmt(machineDeprPerHour)}/hr</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-400">{currency.symbol}</span>
                  <input
                    type="number"
                    min="0"
                    step="0.05"
                    value={machineDeprPerHour}
                    onChange={(e) => setMachineDeprPerHour(Math.max(0, Number(e.target.value)))}
                    className="saas-input font-mono"
                  />
                  <span className="text-xs font-bold text-zinc-400">/hr</span>
                </div>
              </div>

              {/* Hands-On Labor */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Post-Process & Packing Labor</label>
                  <span className="text-xs font-mono font-bold text-zinc-400">{laborMinutes} mins</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={laborMinutes}
                    onChange={(e) => setLaborMinutes(Math.max(0, Number(e.target.value)))}
                    className="saas-input font-mono"
                  />
                  <span className="text-xs font-bold text-zinc-400">mins</span>
                </div>
              </div>

              {/* Labor Hourly Rate */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Labor Hourly Rate</label>
                  <span className="text-xs font-mono font-bold text-zinc-400">{fmt(laborHourlyRate)}/hr</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-400">{currency.symbol}</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={laborHourlyRate}
                    onChange={(e) => setLaborHourlyRate(Math.max(0, Number(e.target.value)))}
                    className="saas-input font-mono"
                  />
                  <span className="text-xs font-bold text-zinc-400">/hr</span>
                </div>
              </div>
            </div>

            {/* Advanced Overheads Toggle */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <button
                onClick={() => setShowAdvancedOverheads(!showAdvancedOverheads)}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 hover:underline cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                {showAdvancedOverheads ? 'Hide Energy & Scrap Details' : 'Configure Power (Watts), kWh Cost & Scrap Buffer'}
              </button>

              {showAdvancedOverheads && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-500">Avg Printer Power</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="20"
                        max="1000"
                        value={machinePowerWatts}
                        onChange={(e) => setMachinePowerWatts(Math.max(1, Number(e.target.value)))}
                        className="saas-input text-xs font-mono"
                      />
                      <span className="text-[10px] font-bold text-zinc-400">W</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-500">Electricity Rate / kWh</label>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-zinc-400">{currency.symbol}</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={electricityRate}
                        onChange={(e) => setElectricityRate(Math.max(0, Number(e.target.value)))}
                        className="saas-input text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-500">Print Failure Buffer %</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="30"
                        value={failureRiskPercent}
                        onChange={(e) => setFailureRiskPercent(Math.max(0, Number(e.target.value)))}
                        className="saas-input text-xs font-mono"
                      />
                      <span className="text-[10px] font-bold text-zinc-400">%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Marketplace Platform & Sales Fees */}
          <div className="saas-card p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                  3. Marketplace & Platform Preset
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-rose-500 dark:text-rose-400">
                Total Fees: {fmt(c.totalPlatformFees)}
              </span>
            </div>

            {/* Platform Select Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PLATFORM_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handlePlatformChange(p.id)}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                    platformId === p.id
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 dark:border-indigo-500/60 ring-1 ring-indigo-500'
                      : 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200/70 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="font-bold text-xs text-zinc-900 dark:text-white flex items-center gap-1.5">
                    {p.name}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-1 line-clamp-1">{p.desc}</div>
                </button>
              ))}
            </div>

            {/* Fee Breakdown Inputs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-500">Platform % Fee</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    value={platformFeePercent}
                    onChange={(e) => setPlatformFeePercent(Math.max(0, Number(e.target.value)))}
                    className="saas-input text-xs font-mono"
                  />
                  <span className="text-[10px] text-zinc-400">%</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-500">Gateway % Fee</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    value={paymentGatewayPercent}
                    onChange={(e) => setPaymentGatewayPercent(Math.max(0, Number(e.target.value)))}
                    className="saas-input text-xs font-mono"
                  />
                  <span className="text-[10px] text-zinc-400">%</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-500">Fixed Listing Fee</label>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-zinc-400">{currency.symbol}</span>
                  <input
                    type="number"
                    step="0.05"
                    value={fixedListingFee}
                    onChange={(e) => setFixedListingFee(Math.max(0, Number(e.target.value)))}
                    className="saas-input text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-500">Fixed Order Fee</label>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-zinc-400">{currency.symbol}</span>
                  <input
                    type="number"
                    step="0.05"
                    value={fixedGatewayFee}
                    onChange={(e) => setFixedGatewayFee(Math.max(0, Number(e.target.value)))}
                    className="saas-input text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Packaging & Shipping Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Packaging Box & Tape</label>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-zinc-400">{currency.symbol}</span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={packagingCost}
                    onChange={(e) => setPackagingCost(Math.max(0, Number(e.target.value)))}
                    className="saas-input font-mono text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Hardware / Inserts</label>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-zinc-400">{currency.symbol}</span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={hardwareCost}
                    onChange={(e) => setHardwareCost(Math.max(0, Number(e.target.value)))}
                    className="saas-input font-mono text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Shipping Paid by Buyer</label>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-zinc-400">{currency.symbol}</span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={customerShippingPaid}
                    onChange={(e) => setCustomerShippingPaid(Math.max(0, Number(e.target.value)))}
                    className="saas-input font-mono text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Actual Shipping Label Cost</label>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-zinc-400">{currency.symbol}</span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={actualShippingCost}
                    onChange={(e) => setActualShippingCost(Math.max(0, Number(e.target.value)))}
                    className="saas-input font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Results & Interactive Analytics (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Main Profit KPI Highlight Box */}
          <div className="saas-card p-6 bg-gradient-to-br from-white via-zinc-50 to-indigo-50/30 dark:from-zinc-900 dark:via-zinc-900 dark:to-indigo-950/20 border-2 border-indigo-500/30 shadow-lg space-y-5">
            {/* Top Badge & Health Status */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                PROFITABILITY HEALTH
              </span>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${marginBadge.bg}`}>
                {marginBadge.label}
              </span>
            </div>

            {/* Mode-Specific Primary Display */}
            {modeTab === 'forward' && (
              <div className="space-y-4">
                {/* Selling Price Input Slider */}
                <div className="space-y-1.5 bg-zinc-50 dark:bg-zinc-800/60 p-3.5 rounded-2xl border border-zinc-200/70 dark:border-zinc-700/80">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-200">
                      Retail Selling Price
                    </label>
                    <div className="text-lg font-black text-indigo-650 dark:text-indigo-400 font-mono">
                      {fmt(sellingPrice)}
                    </div>
                  </div>
                  <input
                    type="range"
                    min={Math.max(1, Math.round(c.totalUnitCOGS * 0.8))}
                    max={Math.round(c.totalUnitCOGS * 8)}
                    step={currencyKey === 'INR' ? 10 : 0.5}
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                    <span>Min: {fmt(c.totalUnitCOGS)} (Cost)</span>
                    <span>Markup: {c.markupMultiplier.toFixed(1)}x</span>
                    <span>Max: {fmt(c.totalUnitCOGS * 8)}</span>
                  </div>
                </div>

                {/* Primary Net Profit Number */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                      Net Take-Home Profit
                    </div>
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                      {fmt(c.netProfit)}
                    </div>
                    <div className="text-[10px] font-medium text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
                      After all fees & COGS
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                      Net Profit Margin
                    </div>
                    <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-1">
                      {c.netMarginPercent.toFixed(1)}%
                    </div>
                    <div className="text-[10px] font-medium text-indigo-600/80 dark:text-indigo-400/80 mt-0.5">
                      ROI: {c.roiPercent.toFixed(0)}% on cost
                    </div>
                  </div>
                </div>
              </div>
            )}

            {modeTab === 'reverse' && (
              <div className="space-y-4">
                {/* Desired Target Margin Slider */}
                <div className="space-y-1.5 bg-zinc-50 dark:bg-zinc-800/60 p-3.5 rounded-2xl border border-zinc-200/70 dark:border-zinc-700/80">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-200">
                      Desired Target Net Margin (%)
                    </label>
                    <div className="text-lg font-black text-indigo-650 dark:text-indigo-400 font-mono">
                      {targetMarginPercent}%
                    </div>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="80"
                    step="1"
                    value={targetMarginPercent}
                    onChange={(e) => setTargetMarginPercent(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                    <span>15% Wholesale</span>
                    <span>50% Balanced</span>
                    <span>80% Luxury</span>
                  </div>
                </div>

                {/* Target Price Output */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-indigo-500/15 border border-indigo-500/30">
                  <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Recommended Retail Listing Price
                  </div>
                  <div className="text-3xl font-black text-zinc-900 dark:text-white font-mono my-1">
                    {fmt(c.calculatedTargetPrice)}
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Guarantees {targetMarginPercent}% net take-home margin after covering all {c.totalFeeRatePercent}% {activePreset.name} deductions.
                  </div>
                  <button
                    onClick={() => {
                      setSellingPrice(Math.round(c.calculatedTargetPrice));
                      setModeTab('forward');
                    }}
                    className="mt-3 w-full py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    Apply Price ({fmt(Math.round(c.calculatedTargetPrice))}) to Calculator →
                  </button>
                </div>

                {/* Price Tier Recommendations */}
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60">
                    <div className="text-[10px] font-bold text-zinc-400">Budget (30%)</div>
                    <div className="text-xs font-bold font-mono text-zinc-800 dark:text-zinc-200 mt-0.5">{fmt(c.tierBudget, 0)}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800">
                    <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">Standard (50%)</div>
                    <div className="text-xs font-bold font-mono text-indigo-650 dark:text-indigo-300 mt-0.5">{fmt(c.tierBalanced, 0)}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                    <div className="text-[10px] font-bold text-purple-600 dark:text-purple-400">Premium (70%)</div>
                    <div className="text-xs font-bold font-mono text-purple-600 dark:text-purple-300 mt-0.5">{fmt(c.tierPremium, 0)}</div>
                  </div>
                </div>
              </div>
            )}

            {modeTab === 'batch' && (
              <div className="space-y-4">
                {/* Batch Quantity Selector */}
                <div className="space-y-1.5 bg-zinc-50 dark:bg-zinc-800/60 p-3.5 rounded-2xl border border-zinc-200/70 dark:border-zinc-700/80">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-200">
                      Batch Production Quantity
                    </label>
                    <div className="text-lg font-black text-indigo-650 dark:text-indigo-400 font-mono">
                      {batchQuantity} units
                    </div>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="500"
                    step="5"
                    value={batchQuantity}
                    onChange={(e) => setBatchQuantity(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                    <span>5 pcs</span>
                    <span>100 pcs</span>
                    <span>500 pcs</span>
                  </div>
                </div>

                {/* Batch Net Earnings */}
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                    Total Batch Net Profit
                  </div>
                  <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono my-1">
                    {fmt(c.batchTotalNetProfit)}
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Gross Sales: {fmt(c.batchTotalRevenue)} | Total COGS: {fmt(c.batchTotalCOGS)}
                  </div>
                </div>

                {/* Batch Logistics Breakdown */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60">
                    <div className="text-zinc-400 text-[10px] font-bold">Total Print Farm Time</div>
                    <div className="font-mono font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
                      {c.batchTotalPrintHours.toFixed(1)} hrs (~{c.batchTotalPrintDays} days)
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60">
                    <div className="text-zinc-400 text-[10px] font-bold">Filament Required</div>
                    <div className="font-mono font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
                      {c.batchTotalFilamentKg} kg ({c.batchSpoolsRequired} spools)
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Proportional Cost & Profit Breakdown Visual Bar */}
            <div className="space-y-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
              <div className="flex justify-between items-center text-xs font-bold text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <PieChart className="w-3.5 h-3.5 text-indigo-500" /> Revenue Distribution
                </span>
                <span className="font-mono text-[10px] text-zinc-400">100% Gross</span>
              </div>

              {/* Segmented Stacked Bar */}
              <div className="h-3 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden flex shadow-inner">
                <div style={{ width: `${c.pctMaterial}%` }} title={`Material: ${c.pctMaterial.toFixed(1)}%`} className="bg-indigo-500 h-full" />
                <div style={{ width: `${c.pctMachineElec}%` }} title={`Machine & Power: ${c.pctMachineElec.toFixed(1)}%`} className="bg-amber-500 h-full" />
                <div style={{ width: `${c.pctLabor}%` }} title={`Labor: ${c.pctLabor.toFixed(1)}%`} className="bg-blue-500 h-full" />
                <div style={{ width: `${c.pctPackaging}%` }} title={`Packaging: ${c.pctPackaging.toFixed(1)}%`} className="bg-purple-500 h-full" />
                <div style={{ width: `${c.pctPlatformFees}%` }} title={`Marketplace Fees: ${c.pctPlatformFees.toFixed(1)}%`} className="bg-rose-500 h-full" />
                <div style={{ width: `${c.pctNetProfit}%` }} title={`Net Profit: ${c.pctNetProfit.toFixed(1)}%`} className="bg-emerald-500 h-full" />
              </div>

              {/* Legend Badges */}
              <div className="grid grid-cols-3 gap-y-1.5 gap-x-2 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 pt-1">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                  <span className="truncate">Filament: {fmt(c.materialCost)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <span className="truncate">Machine: {fmt(c.machineWearCost + c.electricityCost)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  <span className="truncate">Labor: {fmt(c.laborCost)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                  <span className="truncate">Pack: {fmt(c.packagingTotal)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  <span className="truncate">Fees: {fmt(c.totalPlatformFees)}</span>
                </div>
                <div className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="truncate">Profit: {fmt(c.netProfit)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Efficiency & Unit Economics Cards */}
          <div className="saas-card p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-indigo-500" /> Print Farm Operational Metrics
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800">
                <div className="text-[10px] font-bold text-zinc-400">Earnings Per Machine Hour</div>
                <div className="text-sm font-black text-zinc-800 dark:text-zinc-200 font-mono mt-0.5">
                  {fmt(c.hourlyEarnings)}/hr
                </div>
                <div className="text-[9px] text-zinc-400 mt-0.5">Print bed productivity rate</div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800">
                <div className="text-[10px] font-bold text-zinc-400">Profit Per Gram Material</div>
                <div className="text-sm font-black text-zinc-800 dark:text-zinc-200 font-mono mt-0.5">
                  {fmt(c.profitPerGram)}/g
                </div>
                <div className="text-[9px] text-zinc-400 mt-0.5">Weight yield efficiency</div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800">
                <div className="text-[10px] font-bold text-zinc-400">Break-Even Unit Sales</div>
                <div className="text-sm font-black text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                  {c.breakEvenUnits} Units
                </div>
                <div className="text-[9px] text-zinc-400 mt-0.5">To pay off printer ({fmt(c.printerCapitalEstimate, 0)})</div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800">
                <div className="text-[10px] font-bold text-zinc-400">Net Realization Rate</div>
                <div className="text-sm font-black text-zinc-800 dark:text-zinc-200 font-mono mt-0.5">
                  {((c.netRevenueReceived / (c.grossCustomerPaid || 1)) * 100).toFixed(1)}%
                </div>
                <div className="text-[9px] text-zinc-400 mt-0.5">Kept after platform commission</div>
              </div>
            </div>
          </div>

          {/* Privacy & Engine Badge */}
          <div className="p-3.5 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              <strong>100% Offline & Private:</strong> All cost accounting, marketplace fee math, and quotations run in local browser memory. No pricing or farm numbers are ever transmitted or saved on servers.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

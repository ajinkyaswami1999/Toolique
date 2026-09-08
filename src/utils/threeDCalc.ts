export interface CustomCostItem {
  id: string;
  name: string;
  cost: number;
}

export interface FilamentSlot {
  id: string;
  name: string;
  materialType: string;
  pricePerKg: number;
  weightGrams: number;
  isSupport?: boolean;
}

export interface CostCalculatorInputs {
  // Mode: FDM or Resin
  printTechnology: 'fdm' | 'resin';

  // Product Details
  name: string;
  category: string;
  customerName?: string;
  notes?: string;
  image?: string; // Base64 image URL or empty

  // FDM Filament Inputs
  filamentSlots: FilamentSlot[];
  filamentPrice: number; // fallback / single spool price per kg
  filamentUsed: number; // fallback / single spool weight grams
  filamentWastage: number; // % (e.g. 5)
  supportUsed: number; // grams (e.g. 20)
  failedWastage: number; // grams (e.g. 10)
  amsPurgeMultiplier: number; // % extra purge for multi-color (e.g. 10%)

  // Resin / SLA Inputs
  resinType: string;
  resinPricePerLiter: number; // e.g. 1800
  resinVolumeMl: number; // e.g. 45
  resinDensity: number; // g/ml (default 1.1)
  washCostPerBatch: number; // e.g. 20 (IPA / wash fluid)
  cureTimeMinutes: number; // e.g. 10
  fepWearCostPerJob: number; // e.g. 15 (film wear)
  ppeCostPerJob: number; // e.g. 12 (gloves, filters)

  // Print Time / Machine Cost
  printDuration: number; // hours (e.g. 8)
  electricityUnitCost: number; // ₹/unit or $/kWh (e.g. 8)
  printerWattage: number; // Watts (e.g. 150)
  machineWearCost: number; // ₹/hour (e.g. 5)
  maintenanceCost: number; // ₹/hour (e.g. 2)
  printerPurchasePrice: number; // For ROI calculation (e.g. 45000)

  // Labour Cost (Fixed setup vs Variable per unit)
  designTime: number; // hours (Fixed setup)
  slicingTime: number; // hours (Fixed setup)
  postProcessingTime: number; // hours (Variable)
  paintingTime: number; // hours (Variable)
  packingTime: number; // hours (Variable)
  labourRate: number; // hourly rate

  // Extra Material & Shipping Cost
  paintCost: number;
  glueCost: number;
  sandpaperCost: number;
  screwsMagnetsCost: number;
  packagingBoxCost: number;
  bubbleWrapCost: number;
  labelStickerCost: number;
  courierHandlingCost: number;

  // Custom Cost Fields
  customCosts: CustomCostItem[];

  // Batch Quantity
  batchQuantity: number; // e.g. 1

  // Business Cost & Margins
  platformCommission: number; // %
  paymentGateway: number; // %
  gst: number; // %
  marketingCost: number; // %
  miscellaneousCost: number; // flat cost (e.g. 50)
  discount: number; // %
  profitMargin: number; // %
}

export interface BatchTier {
  qty: number;
  label: string;
  discountPct: number;
  unitCost: number;
  unitPrice: number;
  unitProfit: number;
  totalOrderPrice: number;
  totalSavings: number;
}

export interface MachineRoiOutput {
  printerPurchasePrice: number;
  hourlyDepreciationEarned: number;
  hoursToPayoff: number;
  jobsToPayoff: number;
  monthlyEarningsAt60Pct: number;
  monthlyDepreciationFund: number;
}

export interface CostCalculatorOutputs {
  // Material breakdown
  materialCost: number;
  totalFilamentGrams: number;
  filamentSlotsBreakdown: { name: string; cost: number; weight: number }[];

  // Operational breakdown
  electricityCost: number;
  machineCost: number;
  machineWearCost: number;
  maintenanceCost: number;
  setupLabourCost: number;
  variableLabourCost: number;
  labourCost: number;
  extraMaterialCost: number;
  customCostTotal: number;
  totalProductionCost: number; // Per single unit or for full batch depending on context

  // Business overheads & Taxes
  platformCommissionAmount: number;
  paymentGatewayAmount: number;
  marketingCostAmount: number;
  businessOverhead: number;
  profitAmount: number;
  gstAmount: number;

  // Pricing Results
  suggestedSellingPrice: number; // before discount
  discountAmount: number;
  finalSellingPrice: number; // after discount

  // Batch Specifics
  unitProductionCost: number;
  unitSellingPrice: number;
  unitProfitAmount: number;
  batchTotalSellingPrice: number;
  batchTiers: BatchTier[];

  // Unit Rates
  pricePerGram: number;
  pricePerPrintHour: number;
  costPerPrintHour: number;

  // Smart Pricing Tiers
  minSellingPrice: number;
  recSellingPrice: number;
  premiumSellingPrice: number;

  // Rounded Charm Prices
  rounded49: number;
  rounded99: number;
  rounded95: number;

  // Machine ROI
  roi: MachineRoiOutput;
}

export interface CalculatorSettings {
  currencySymbol: string;
  filamentPrice: number;
  electricityUnitCost: number;
  printerWattage: number;
  machineWearCost: number;
  maintenanceCost: number;
  labourRate: number;
  filamentWastage: number;
  profitMargin: number;
  gst: number;
  platformCommission: number;
  paymentGateway: number;
  packagingBoxCost: number;
  courierHandlingCost: number;
  printerPurchasePrice: number;
  productCategories: string[];
  roundingRule: 'nearest' | 'up' | 'down' | 'none';
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  inputs: CostCalculatorInputs;
  outputs: CostCalculatorOutputs;
}

/**
 * Robust, high-precision commercial 3D printing cost calculator.
 * Supports FDM multi-material & purge calculations, SLA resin photopolymer calculations,
 * batch quantity scaling, and print farm ROI modeling.
 */
export function calculate3DPrintCosts(inputs: CostCalculatorInputs): CostCalculatorOutputs {
  const qty = Math.max(inputs.batchQuantity || 1, 1);
  const isResin = inputs.printTechnology === 'resin';

  // 1. Material Cost Calculation
  let materialCost = 0;
  let totalFilamentGrams = 0;
  const filamentSlotsBreakdown: { name: string; cost: number; weight: number }[] = [];

  if (isResin) {
    // Resin / SLA Mode
    // Resin cost = (volume in ml / 1000) * price per liter
    const resinCost = (inputs.resinVolumeMl / 1000) * inputs.resinPricePerLiter;
    // Wash & Cure consumables
    const washAndPpeCost = inputs.washCostPerBatch + inputs.fepWearCostPerJob + inputs.ppeCostPerJob;
    materialCost = resinCost + washAndPpeCost;
    totalFilamentGrams = inputs.resinVolumeMl * (inputs.resinDensity || 1.1);
    filamentSlotsBreakdown.push({
      name: `${inputs.resinType || 'Standard Resin'} (${inputs.resinVolumeMl}ml)`,
      cost: resinCost,
      weight: totalFilamentGrams
    });
  } else {
    // FDM Mode
    if (inputs.filamentSlots && inputs.filamentSlots.length > 0) {
      const wastageMultiplier = 1 + (inputs.filamentWastage + (inputs.amsPurgeMultiplier || 0)) / 100;
      inputs.filamentSlots.forEach((slot) => {
        const slotWeightWithWaste = slot.weightGrams * wastageMultiplier;
        const slotCost = (slotWeightWithWaste / 1000) * slot.pricePerKg;
        materialCost += slotCost;
        totalFilamentGrams += slot.weightGrams;
        filamentSlotsBreakdown.push({
          name: slot.name || `${slot.materialType} Slot`,
          cost: slotCost,
          weight: slot.weightGrams
        });
      });

      // Add failed print wastage if specified
      if (inputs.failedWastage > 0) {
        const avgPrice = inputs.filamentSlots.reduce((sum, s) => sum + s.pricePerKg, 0) / inputs.filamentSlots.length;
        const failCost = (inputs.failedWastage / 1000) * avgPrice;
        materialCost += failCost;
        totalFilamentGrams += inputs.failedWastage;
      }
    } else {
      // Single spool fallback
      const totalWeight = inputs.filamentUsed + inputs.supportUsed + inputs.failedWastage;
      const wastageMultiplier = 1 + inputs.filamentWastage / 100;
      materialCost = (totalWeight * wastageMultiplier / 1000) * inputs.filamentPrice;
      totalFilamentGrams = totalWeight;
      filamentSlotsBreakdown.push({
        name: 'Primary Filament',
        cost: materialCost,
        weight: totalWeight
      });
    }
  }

  // 2. Electricity Cost Calculation
  // Power (kWh) = (Watts * Duration) / 1000
  let totalWatts = inputs.printerWattage;
  let effectiveDuration = inputs.printDuration;
  let electricityCost = 0;
  if (isResin && inputs.cureTimeMinutes > 0) {
    // Add UV Curing Station power (assume 60W for curing time)
    const curingHours = inputs.cureTimeMinutes / 60;
    const curingKwh = (60 * curingHours) / 1000;
    const printerKwh = (inputs.printerWattage * inputs.printDuration) / 1000;
    const totalKwh = printerKwh + curingKwh;
    electricityCost = totalKwh * inputs.electricityUnitCost;
  } else {
    electricityCost = (effectiveDuration * totalWatts * inputs.electricityUnitCost) / 1000;
  }

  // 3. Machine Depreciation & Maintenance
  const machineWearCost = effectiveDuration * inputs.machineWearCost;
  const maintenanceCost = effectiveDuration * inputs.maintenanceCost;
  const machineCost = machineWearCost + maintenanceCost;

  // 4. Labour Cost (Separated into Fixed Setup vs Variable Per Unit)
  // Fixed setup (design + slicing) amortizes over batch quantity
  const fixedLabourHours = inputs.designTime + inputs.slicingTime;
  const setupLabourCost = fixedLabourHours * inputs.labourRate;

  // Variable labour (post processing + painting + packing) scales with quantity
  const variableLabourHours = inputs.postProcessingTime + inputs.paintingTime + inputs.packingTime;
  const variableLabourCost = variableLabourHours * inputs.labourRate;

  const labourCost = setupLabourCost + (variableLabourCost * qty);

  // 5. Extra Materials & Packaging Cost (Scaled by batch quantity)
  const extraMaterialPerUnit =
    inputs.paintCost +
    inputs.glueCost +
    inputs.sandpaperCost +
    inputs.screwsMagnetsCost +
    inputs.packagingBoxCost +
    inputs.bubbleWrapCost +
    inputs.labelStickerCost +
    inputs.courierHandlingCost;
  const extraMaterialCost = extraMaterialPerUnit * qty;

  // 6. Custom Accessories
  const customCostTotal = inputs.customCosts.reduce((acc, curr) => acc + curr.cost, 0) * qty;

  // 7. Total Production Cost (For the full batch)
  // Variable costs scale by qty, fixed costs stay fixed
  const totalVariableCostPerUnit =
    materialCost +
    electricityCost +
    machineCost +
    variableLabourCost +
    extraMaterialPerUnit +
    (inputs.customCosts.reduce((acc, curr) => acc + curr.cost, 0));

  const totalProductionCost = (totalVariableCostPerUnit * qty) + setupLabourCost + inputs.miscellaneousCost;
  const unitProductionCost = totalProductionCost / qty;

  // 8. Profit Calculation
  const profitAmount = totalProductionCost * (inputs.profitMargin / 100);

  // 9. Business Overheads & Merchant Fees
  const overheadsBase = totalProductionCost + profitAmount;
  const platformCommissionAmount = overheadsBase * (inputs.platformCommission / 100);
  const paymentGatewayAmount = overheadsBase * (inputs.paymentGateway / 100);
  const marketingCostAmount = overheadsBase * (inputs.marketingCost / 100);
  const businessOverhead = platformCommissionAmount + paymentGatewayAmount + marketingCostAmount;

  // 10. Suggested Selling Price before GST & Taxes
  const subtotalBeforeGst = overheadsBase + businessOverhead;
  const gstAmount = subtotalBeforeGst * (inputs.gst / 100);
  const suggestedSellingPrice = subtotalBeforeGst + gstAmount;

  // 11. Discount Deductions
  const discountAmount = suggestedSellingPrice * (inputs.discount / 100);
  const finalSellingPrice = Math.max(suggestedSellingPrice - discountAmount, 0);

  // Unit metrics for batch
  const unitSellingPrice = finalSellingPrice / qty;
  const unitProfitAmount = profitAmount / qty;

  // 12. Unit Rates (Price per Gram & Price per Print Hour)
  const activeWeight = totalFilamentGrams > 0 ? totalFilamentGrams : 1;
  const activeDuration = effectiveDuration > 0 ? effectiveDuration : 1;
  const pricePerGram = unitSellingPrice / activeWeight;
  const pricePerPrintHour = unitSellingPrice / activeDuration;
  const costPerPrintHour = unitProductionCost / activeDuration;

  // 13. Smart Pricing Tiers (Minimum, Recommended, Premium)
  // Minimum: 0% profit margin
  const minBase = totalProductionCost;
  const minOverheads = minBase * ((inputs.platformCommission + inputs.paymentGateway + inputs.marketingCost) / 100);
  const minSubtotal = minBase + minOverheads;
  const minSellingPrice = minSubtotal + (minSubtotal * (inputs.gst / 100));

  // Recommended: User's set profit margin
  const recSellingPrice = finalSellingPrice;

  // Premium: Higher profit margin (e.g. 55% or 1.6x)
  const premiumMargin = Math.max(inputs.profitMargin * 1.5, 50);
  const premiumProfit = totalProductionCost * (premiumMargin / 100);
  const premiumBase = totalProductionCost + premiumProfit;
  const premiumOverheads = premiumBase * ((inputs.platformCommission + inputs.paymentGateway + inputs.marketingCost) / 100);
  const premiumSubtotal = premiumBase + premiumOverheads;
  const premiumSellingPrice = premiumSubtotal + (premiumSubtotal * (inputs.gst / 100));

  // 14. Psychological / Charm Pricing
  const rounded49 = Math.max(Math.round((unitSellingPrice - 49) / 100) * 100 + 49, 49);
  const rounded99 = Math.max(Math.round((unitSellingPrice - 99) / 100) * 100 + 99, 99);
  const rounded95 = Math.max(Math.round((unitSellingPrice - 95) / 100) * 100 + 95, 95);

  // 15. Batch Quantity Tier Matrix (1x, 5x, 10x, 25x, 50x, 100x)
  const tierCounts = [1, 5, 10, 25, 50, 100];
  const batchTiers: BatchTier[] = tierCounts.map((tQty) => {
    // Fixed setup cost amortized across tQty
    const tSetupPerUnit = setupLabourCost / tQty;
    const tUnitCost = totalVariableCostPerUnit + tSetupPerUnit + (inputs.miscellaneousCost / tQty);
    
    // Volume discount tiers
    let discountPct = 0;
    if (tQty >= 50) discountPct = 15;
    else if (tQty >= 25) discountPct = 10;
    else if (tQty >= 10) discountPct = 7;
    else if (tQty >= 5) discountPct = 4;

    const tProfit = tUnitCost * (inputs.profitMargin / 100);
    const tOverheadsBase = tUnitCost + tProfit;
    const tOverhead = tOverheadsBase * ((inputs.platformCommission + inputs.paymentGateway + inputs.marketingCost) / 100);
    const tSub = tOverheadsBase + tOverhead;
    const tGst = tSub * (inputs.gst / 100);
    const rawPrice = tSub + tGst;

    const discountedUnitPrice = rawPrice * (1 - discountPct / 100);
    const totalOrderPrice = discountedUnitPrice * tQty;
    const singleBasePriceTotal = (unitSellingPrice * tQty);
    const totalSavings = Math.max(singleBasePriceTotal - totalOrderPrice, 0);

    return {
      qty: tQty,
      label: tQty === 1 ? '1 Unit (Standard)' : `${tQty} Units (${discountPct}% Off)`,
      discountPct,
      unitCost: tUnitCost,
      unitPrice: discountedUnitPrice,
      unitProfit: tProfit,
      totalOrderPrice,
      totalSavings
    };
  });

  // 16. Machine Payback & Farm ROI Analysis
  const purchasePrice = inputs.printerPurchasePrice > 0 ? inputs.printerPurchasePrice : 45000;
  const totalHourlyDepreciation = inputs.machineWearCost + inputs.maintenanceCost;
  const hoursToPayoff = totalHourlyDepreciation > 0 ? purchasePrice / totalHourlyDepreciation : 5000;
  const jobsToPayoff = effectiveDuration > 0 ? Math.ceil(hoursToPayoff / effectiveDuration) : 500;
  // 60% bed utilization in a 30-day month = 30 * 24 * 0.6 = 432 operating hours/month
  const monthlyOperatingHours = 432;
  const monthlyDepreciationFund = monthlyOperatingHours * totalHourlyDepreciation;
  const estimatedHourlyProfit = effectiveDuration > 0 ? (profitAmount / qty) / effectiveDuration : 50;
  const monthlyEarningsAt60Pct = monthlyOperatingHours * estimatedHourlyProfit;

  const roi: MachineRoiOutput = {
    printerPurchasePrice: purchasePrice,
    hourlyDepreciationEarned: totalHourlyDepreciation,
    hoursToPayoff: Math.round(hoursToPayoff),
    jobsToPayoff: Math.round(jobsToPayoff),
    monthlyEarningsAt60Pct: Math.round(monthlyEarningsAt60Pct),
    monthlyDepreciationFund: Math.round(monthlyDepreciationFund)
  };

  return {
    materialCost,
    totalFilamentGrams,
    filamentSlotsBreakdown,
    electricityCost,
    machineCost,
    machineWearCost,
    maintenanceCost,
    setupLabourCost,
    variableLabourCost,
    labourCost,
    extraMaterialCost,
    customCostTotal,
    totalProductionCost,
    platformCommissionAmount,
    paymentGatewayAmount,
    marketingCostAmount,
    businessOverhead,
    profitAmount,
    gstAmount,
    suggestedSellingPrice,
    discountAmount,
    finalSellingPrice,
    unitProductionCost,
    unitSellingPrice,
    unitProfitAmount,
    batchTotalSellingPrice: finalSellingPrice,
    batchTiers,
    pricePerGram,
    pricePerPrintHour,
    costPerPrintHour,
    minSellingPrice,
    recSellingPrice,
    premiumSellingPrice,
    rounded49,
    rounded99,
    rounded95,
    roi
  };
}

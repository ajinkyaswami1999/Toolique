export interface CustomCostItem {
  id: string;
  name: string;
  cost: number;
}

export interface CostCalculatorInputs {
  // Product Details
  name: string;
  category: string;
  customerName?: string;
  notes?: string;
  image?: string; // Base64 image URL or empty

  // Filament Cost
  filamentPrice: number; // per kg (e.g. 1500)
  filamentUsed: number; // grams (e.g. 120)
  filamentWastage: number; // % (e.g. 5)
  supportUsed: number; // grams (e.g. 20)
  failedWastage: number; // grams (e.g. 10)

  // Print Time / Machine Cost
  printDuration: number; // hours (e.g. 8)
  electricityUnitCost: number; // ₹/unit (e.g. 8)
  printerWattage: number; // Watts (e.g. 150)
  machineWearCost: number; // ₹/hour (e.g. 5)
  maintenanceCost: number; // ₹/hour (e.g. 2)

  // Labour Cost
  designTime: number; // hours
  slicingTime: number; // hours
  postProcessingTime: number; // hours
  paintingTime: number; // hours
  packingTime: number; // hours
  labourRate: number; // ₹/hour

  // Extra Material Cost
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

  // Business Cost
  platformCommission: number; // %
  paymentGateway: number; // %
  gst: number; // %
  marketingCost: number; // %
  miscellaneousCost: number; // flat cost (e.g. 50)
  discount: number; // %
  profitMargin: number; // %
}

export interface CostCalculatorOutputs {
  filamentCost: number;
  electricityCost: number;
  machineCost: number;
  labourCost: number;
  extraMaterialCost: number;
  customCostTotal: number;
  totalProductionCost: number;

  platformCommissionAmount: number;
  paymentGatewayAmount: number;
  marketingCostAmount: number;
  businessOverhead: number;

  profitAmount: number;
  gstAmount: number;

  suggestedSellingPrice: number; // before discount
  discountAmount: number;
  finalSellingPrice: number; // after discount

  pricePerGram: number;
  pricePerPrintHour: number;

  minSellingPrice: number;
  recSellingPrice: number;
  premiumSellingPrice: number;

  rounded49: number;
  rounded99: number;
}

export interface CalculatorSettings {
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
  currencySymbol: string;
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
 * Calculates 3D printed product costs and selling price suggestions.
 * Follows cost-plus pricing strategy accounting for materials, wear, electricity, labour, overheads, and taxes.
 */
export function calculate3DPrintCosts(inputs: CostCalculatorInputs): CostCalculatorOutputs {
  // 1. Filament Cost Calculation
  // Total filament used = active object weight + support material weight + failed print waste weight
  const totalWeight = inputs.filamentUsed + inputs.supportUsed + inputs.failedWastage;
  const wastageScale = 1 + inputs.filamentWastage / 100;
  const filamentCost = (totalWeight * wastageScale / 1000) * inputs.filamentPrice;

  // 2. Electricity Cost Calculation
  // Power consumption (kWh) = (Watts * Hours) / 1000
  const electricityCost = (inputs.printDuration * inputs.printerWattage * inputs.electricityUnitCost) / 1000;

  // 3. Machine Depreciation & Wear Cost
  // Total Machine Cost = print duration * (wear depreciation rate + maintenance buffer)
  const machineCost = inputs.printDuration * (inputs.machineWearCost + inputs.maintenanceCost);

  // 4. Labour Cost
  // Sum up all stages of labor duration
  const totalLabourHours =
    inputs.designTime +
    inputs.slicingTime +
    inputs.postProcessingTime +
    inputs.paintingTime +
    inputs.packingTime;
  const labourCost = totalLabourHours * inputs.labourRate;

  // 5. Extra Material Cost
  const extraMaterialCost =
    inputs.paintCost +
    inputs.glueCost +
    inputs.sandpaperCost +
    inputs.screwsMagnetsCost +
    inputs.packagingBoxCost +
    inputs.bubbleWrapCost +
    inputs.labelStickerCost +
    inputs.courierHandlingCost;

  // 6. Custom Cost Summation
  const customCostTotal = inputs.customCosts.reduce((acc, curr) => acc + curr.cost, 0);

  // 7. Total Production Cost
  const totalProductionCost =
    filamentCost +
    electricityCost +
    machineCost +
    labourCost +
    extraMaterialCost +
    customCostTotal +
    inputs.miscellaneousCost;

  // 8. Profit Amount
  const profitAmount = totalProductionCost * (inputs.profitMargin / 100);

  // 9. Business Overheads
  // Overheads are calculated on top of (Production Cost + Profit)
  const overheadsBase = totalProductionCost + profitAmount;
  const platformCommissionAmount = overheadsBase * (inputs.platformCommission / 100);
  const paymentGatewayAmount = overheadsBase * (inputs.paymentGateway / 100);
  const marketingCostAmount = overheadsBase * (inputs.marketingCost / 100);
  const businessOverhead = platformCommissionAmount + paymentGatewayAmount + marketingCostAmount;

  // 10. Suggested Selling Price before GST
  const subtotalBeforeGst = overheadsBase + businessOverhead;
  const gstAmount = subtotalBeforeGst * (inputs.gst / 100);
  const suggestedSellingPrice = subtotalBeforeGst + gstAmount;

  // 11. Discount Deductions
  const discountAmount = suggestedSellingPrice * (inputs.discount / 100);
  const finalSellingPrice = Math.max(suggestedSellingPrice - discountAmount, 0);

  // 12. Unit Rates (Price per Gram / Price per Hour)
  const activeWeight = inputs.filamentUsed > 0 ? inputs.filamentUsed : 1;
  const activeDuration = inputs.printDuration > 0 ? inputs.printDuration : 1;
  const pricePerGram = finalSellingPrice / activeWeight;
  const pricePerPrintHour = finalSellingPrice / activeDuration;

  // 13. Smart Pricing Recommendations
  // Minimum selling price (0% profit margin target)
  const overheadsBaseMin = totalProductionCost;
  const overheadsMin = overheadsBaseMin * ((inputs.platformCommission + inputs.paymentGateway + inputs.marketingCost) / 100);
  const subtotalMin = totalProductionCost + overheadsMin;
  const minSellingPrice = subtotalMin + (subtotalMin * (inputs.gst / 100));

  // Recommended selling price (Current margin target)
  const recSellingPrice = finalSellingPrice;

  // Premium selling price (target higher profit margin, e.g. Math.max(margin * 1.8, 50%))
  const premiumMargin = Math.max(inputs.profitMargin * 1.6, 50);
  const profitPremium = totalProductionCost * (premiumMargin / 100);
  const overheadsBasePremium = totalProductionCost + profitPremium;
  const overheadsPremium = overheadsBasePremium * ((inputs.platformCommission + inputs.paymentGateway + inputs.marketingCost) / 100);
  const subtotalPremium = totalProductionCost + profitPremium + overheadsPremium;
  const premiumSellingPrice = subtotalPremium + (subtotalPremium * (inputs.gst / 100));

  // 14. Rounded Charm Prices
  // Nearest ₹49: Math.round((price - 49) / 100) * 100 + 49
  const rounded49 = Math.round((finalSellingPrice - 49) / 100) * 100 + 49;
  // Nearest ₹99: Math.round((price - 99) / 100) * 100 + 99
  const rounded99 = Math.round((finalSellingPrice - 99) / 100) * 100 + 99;

  return {
    filamentCost,
    electricityCost,
    machineCost,
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
    pricePerGram,
    pricePerPrintHour,
    minSellingPrice,
    recSellingPrice,
    premiumSellingPrice,
    rounded49: rounded49 > 0 ? rounded49 : 49,
    rounded99: rounded99 > 0 ? rounded99 : 99
  };
}

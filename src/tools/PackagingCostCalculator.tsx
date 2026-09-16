import { useState, useMemo } from 'react';
import { 
  Package, 
  Copy, 
  Check, 
  Download, 
  Sparkles, 
  PieChart, 
  BarChart3, 
  Info, 
  Coins, 
  Boxes, 
  Tag, 
  ShieldCheck, 
  AlertTriangle
} from 'lucide-react';
import { jsPDF } from 'jspdf';

// --- Multi-Currency Configurations ---
interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  defaultBoxCost: number;
  defaultBubbleCostPerMeter: number;
  defaultLabelCost: number;
  defaultStickerCost: number;
  defaultCardCost: number;
  defaultTapeCostPerMeter: number;
  defaultDesiccantCost: number;
  defaultLaborRate: number;
  defaultRetailPrice: number;
}

const CURRENCIES: Record<string, CurrencyConfig> = {
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee (₹)',
    defaultBoxCost: 22.0,
    defaultBubbleCostPerMeter: 4.5,
    defaultLabelCost: 1.8,
    defaultStickerCost: 2.5,
    defaultCardCost: 3.0,
    defaultTapeCostPerMeter: 0.8,
    defaultDesiccantCost: 1.5,
    defaultLaborRate: 200,
    defaultRetailPrice: 650
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar ($)',
    defaultBoxCost: 0.85,
    defaultBubbleCostPerMeter: 0.25,
    defaultLabelCost: 0.08,
    defaultStickerCost: 0.15,
    defaultCardCost: 0.12,
    defaultTapeCostPerMeter: 0.05,
    defaultDesiccantCost: 0.06,
    defaultLaborRate: 18,
    defaultRetailPrice: 25
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro (€)',
    defaultBoxCost: 0.90,
    defaultBubbleCostPerMeter: 0.28,
    defaultLabelCost: 0.09,
    defaultStickerCost: 0.16,
    defaultCardCost: 0.14,
    defaultTapeCostPerMeter: 0.06,
    defaultDesiccantCost: 0.07,
    defaultLaborRate: 20,
    defaultRetailPrice: 28
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound (£)',
    defaultBoxCost: 0.75,
    defaultBubbleCostPerMeter: 0.22,
    defaultLabelCost: 0.07,
    defaultStickerCost: 0.13,
    defaultCardCost: 0.11,
    defaultTapeCostPerMeter: 0.04,
    defaultDesiccantCost: 0.05,
    defaultLaborRate: 16,
    defaultRetailPrice: 24
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar (C$)',
    defaultBoxCost: 1.15,
    defaultBubbleCostPerMeter: 0.32,
    defaultLabelCost: 0.10,
    defaultStickerCost: 0.19,
    defaultCardCost: 0.16,
    defaultTapeCostPerMeter: 0.07,
    defaultDesiccantCost: 0.08,
    defaultLaborRate: 22,
    defaultRetailPrice: 35
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar (A$)',
    defaultBoxCost: 1.30,
    defaultBubbleCostPerMeter: 0.35,
    defaultLabelCost: 0.12,
    defaultStickerCost: 0.22,
    defaultCardCost: 0.18,
    defaultTapeCostPerMeter: 0.08,
    defaultDesiccantCost: 0.09,
    defaultLaborRate: 25,
    defaultRetailPrice: 38
  }
};

// --- Packaging Preset Profiles ---
interface PackagingPreset {
  id: string;
  name: string;
  containerType: string;
  boxLengthCm: number;
  boxWidthCm: number;
  boxHeightCm: number;
  bubbleMeters: number;
  hasDesiccant: boolean;
  hasThankYouCard: boolean;
  hasLogoSticker: boolean;
  hasPolybag: boolean;
  tapeMeters: number;
  packingMins: number;
  desc: string;
  badge: string;
}

const PACKAGING_PRESETS: PackagingPreset[] = [
  {
    id: 'bubble_mailer',
    name: 'Padded Poly Bubble Mailer',
    containerType: 'Padded Mailer',
    boxLengthCm: 20,
    boxWidthCm: 15,
    boxHeightCm: 3,
    bubbleMeters: 0.4,
    hasDesiccant: true,
    hasThankYouCard: true,
    hasLogoSticker: true,
    hasPolybag: true,
    tapeMeters: 0.3,
    packingMins: 2.0,
    desc: 'Lightweight waterproof pouch for miniatures, keychains & small flexible toys',
    badge: 'Ultra-Light / Low Cost'
  },
  {
    id: 'standard_box',
    name: 'Standard Corrugated Box',
    containerType: '3-Ply Corrugated Box',
    boxLengthCm: 22,
    boxWidthCm: 16,
    boxHeightCm: 12,
    bubbleMeters: 1.2,
    hasDesiccant: true,
    hasThankYouCard: true,
    hasLogoSticker: true,
    hasPolybag: false,
    tapeMeters: 1.0,
    packingMins: 3.5,
    desc: 'Standard 3-ply carton for desk stands, organizers, and medium mechanical parts',
    badge: 'Most Popular'
  },
  {
    id: 'delicate_premium',
    name: 'Heavy-Duty Fragile & Unboxing',
    containerType: '5-Ply Double-Wall Box',
    boxLengthCm: 30,
    boxWidthCm: 25,
    boxHeightCm: 20,
    bubbleMeters: 2.5,
    hasDesiccant: true,
    hasThankYouCard: true,
    hasLogoSticker: true,
    hasPolybag: true,
    tapeMeters: 1.8,
    packingMins: 6.0,
    desc: 'Reinforced carton with extensive cushioning, corner pads, and branded inserts',
    badge: 'High Protection'
  },
  {
    id: 'wholesale_bulk',
    name: 'Wholesale Master Shipper (25 pcs)',
    containerType: 'Master Shipping Carton',
    boxLengthCm: 45,
    boxWidthCm: 35,
    boxHeightCm: 30,
    bubbleMeters: 4.0,
    hasDesiccant: true,
    hasThankYouCard: false,
    hasLogoSticker: true,
    hasPolybag: true,
    tapeMeters: 3.0,
    packingMins: 12.0,
    desc: 'Master carton for multi-part commercial contracts & B2B batches',
    badge: 'Bulk B2B'
  }
];

export default function PackagingCostCalculator() {
  // Currency State
  const [currencyKey, setCurrencyKey] = useState<string>('INR');
  const currency = CURRENCIES[currencyKey] || CURRENCIES.INR;

  // Selected Preset
  const [selectedPresetId, setSelectedPresetId] = useState<string>('standard_box');

  // Mode Tab: 'unit' (Single Order BOM) vs 'batch' (Monthly/Batch Volume) vs 'procurement' (Bulk Discount Tier Analysis)
  const [activeTab, setActiveTab] = useState<'unit' | 'batch' | 'procurement'>('unit');

  // --- Box / Outer Container Inputs ---
  const [containerCost, setContainerCost] = useState<number>(currency.defaultBoxCost);
  const [boxLengthCm, setBoxLengthCm] = useState<number>(22);
  const [boxWidthCm, setBoxWidthCm] = useState<number>(16);
  const [boxHeightCm, setBoxHeightCm] = useState<number>(12);
  const [actualPartWeightGrams, setActualPartWeightGrams] = useState<number>(180);

  // --- Cushioning & Fillers Inputs ---
  const [bubbleWrapMeters, setBubbleWrapMeters] = useState<number>(1.2);
  const [bubbleWrapCostPerMeter, setBubbleWrapCostPerMeter] = useState<number>(currency.defaultBubbleCostPerMeter);
  const [crinklePaperCost, setCrinklePaperCost] = useState<number>(
    currencyKey === 'INR' ? 3.0 : 0.10
  );
  const [desiccantPouchCost, setDesiccantPouchCost] = useState<number>(currency.defaultDesiccantCost);
  const [hasDesiccant, setHasDesiccant] = useState<boolean>(true);
  const [polybagCost, setPolybagCost] = useState<number>(
    currencyKey === 'INR' ? 2.0 : 0.08
  );
  const [hasPolybag, setHasPolybag] = useState<boolean>(false);

  // --- Branding, Labels & Inserts ---
  const [shippingLabelCost, setShippingLabelCost] = useState<number>(currency.defaultLabelCost); // 4x6 thermal label
  const [logoStickerCost, setLogoStickerCost] = useState<number>(currency.defaultStickerCost);
  const [hasLogoSticker, setHasLogoSticker] = useState<boolean>(true);
  const [thankYouCardCost, setThankYouCardCost] = useState<number>(currency.defaultCardCost);
  const [hasThankYouCard, setHasThankYouCard] = useState<boolean>(true);
  const [freebieSwagCost, setFreebieSwagCost] = useState<number>(0); // Sample print, coupon, keychain

  // --- Sealing & Taping ---
  const [tapeMetersUsed, setTapeMetersUsed] = useState<number>(1.0);
  const [tapeCostPerMeter, setTapeCostPerMeter] = useState<number>(currency.defaultTapeCostPerMeter);

  // --- Labor & Warehouse Packing Time ---
  const [packingMinutes, setPackingMinutes] = useState<number>(3.5);
  const [packerHourlyWage, setPackerHourlyWage] = useState<number>(currency.defaultLaborRate);

  // --- Commercial Context ---
  const [productRetailPrice, setProductRetailPrice] = useState<number>(currency.defaultRetailPrice);
  const [monthlyShipmentVolume, setMonthlyShipmentVolume] = useState<number>(150);

  // UI States
  const [copied, setCopied] = useState<boolean>(false);

  // --- Currency Change Handler ---
  const handleCurrencyChange = (newKey: string) => {
    const newCurr = CURRENCIES[newKey];
    if (!newCurr) return;
    setCurrencyKey(newKey);
    setContainerCost(newCurr.defaultBoxCost);
    setBubbleWrapCostPerMeter(newCurr.defaultBubbleCostPerMeter);
    setShippingLabelCost(newCurr.defaultLabelCost);
    setLogoStickerCost(newCurr.defaultStickerCost);
    setThankYouCardCost(newCurr.defaultCardCost);
    setTapeCostPerMeter(newCurr.defaultTapeCostPerMeter);
    setDesiccantPouchCost(newCurr.defaultDesiccantCost);
    setPackerHourlyWage(newCurr.defaultLaborRate);
    setProductRetailPrice(newCurr.defaultRetailPrice);
    setCrinklePaperCost(newKey === 'INR' ? 3.0 : 0.10);
    setPolybagCost(newKey === 'INR' ? 2.0 : 0.08);
  };

  // --- Preset Change Handler ---
  const handlePresetChange = (presetId: string) => {
    setSelectedPresetId(presetId);
    const p = PACKAGING_PRESETS.find(item => item.id === presetId);
    if (!p) return;
    setBoxLengthCm(p.boxLengthCm);
    setBoxWidthCm(p.boxWidthCm);
    setBoxHeightCm(p.boxHeightCm);
    setBubbleWrapMeters(p.bubbleMeters);
    setHasDesiccant(p.hasDesiccant);
    setHasThankYouCard(p.hasThankYouCard);
    setHasLogoSticker(p.hasLogoSticker);
    setHasPolybag(p.hasPolybag);
    setTapeMetersUsed(p.tapeMeters);
    setPackingMinutes(p.packingMins);
  };

  // --- Mathematical Computation Engine ---
  const calculations = useMemo(() => {
    // 1. Container Subtotal
    const boxCost = Math.max(0, containerCost);

    // 2. Cushioning Subtotal
    const bubbleCost = Math.max(0, bubbleWrapMeters * bubbleWrapCostPerMeter);
    const desiccantCost = hasDesiccant ? Math.max(0, desiccantPouchCost) : 0;
    const polyCost = hasPolybag ? Math.max(0, polybagCost) : 0;
    const crinkleCost = Math.max(0, crinklePaperCost);
    const totalCushioningCost = bubbleCost + desiccantCost + polyCost + crinkleCost;

    // 3. Branding & Labeling Subtotal
    const labelCost = Math.max(0, shippingLabelCost);
    const stickerCost = hasLogoSticker ? Math.max(0, logoStickerCost) : 0;
    const cardCost = hasThankYouCard ? Math.max(0, thankYouCardCost) : 0;
    const swagCost = Math.max(0, freebieSwagCost);
    const totalBrandingCost = labelCost + stickerCost + cardCost + swagCost;

    // 4. Sealing & Tape Subtotal
    const totalTapeCost = Math.max(0, tapeMetersUsed * tapeCostPerMeter);

    // 5. Direct Materials Packaging Total
    const totalMaterialCost = boxCost + totalCushioningCost + totalBrandingCost + totalTapeCost;

    // 6. Labor Packing Cost
    const laborCost = (Math.max(0, packingMinutes) / 60) * Math.max(0, packerHourlyWage);

    // 7. Total Landed Packaging Cost (Materials + Labor)
    const totalPackagingCost = totalMaterialCost + laborCost;

    // 8. Percentage of Product Retail Price
    const packagingPctOfRetail = productRetailPrice > 0 
      ? (totalPackagingCost / productRetailPrice) * 100 
      : 0;

    // 9. Volumetric Weight Calculation (Courier Standard L * W * H / 5000 in cm)
    const boxVolumeCm3 = Math.max(1, boxLengthCm * boxWidthCm * boxHeightCm);
    const volumetricWeightKg = boxVolumeCm3 / 5000;
    const volumetricWeightGrams = volumetricWeightKg * 1000;
    const totalDeadweightDifferenceGrams = volumetricWeightGrams - actualPartWeightGrams;
    const isVolumetricPenalty = totalDeadweightDifferenceGrams > 250;

    // 10. Monthly & Batch Fulfillment Forecast
    const monthlyShipments = Math.max(1, monthlyShipmentVolume);
    const monthlyPackagingMaterials = totalMaterialCost * monthlyShipments;
    const monthlyLaborExpense = laborCost * monthlyShipments;
    const monthlyTotalPackagingBudget = totalPackagingCost * monthlyShipments;
    const monthlyBubbleWrapMeters = bubbleWrapMeters * monthlyShipments;
    const monthlyTapeMeters = tapeMetersUsed * monthlyShipments;
    const monthlyPackingHours = (packingMinutes * monthlyShipments) / 60;

    // 11. Cost Component Breakdown Percentages for Stack Bar
    const totalBase = Math.max(0.01, totalPackagingCost);
    const pctBox = (boxCost / totalBase) * 100;
    const pctCushioning = (totalCushioningCost / totalBase) * 100;
    const pctBranding = (totalBrandingCost / totalBase) * 100;
    const pctTape = (totalTapeCost / totalBase) * 100;
    const pctLabor = (laborCost / totalBase) * 100;

    // 12. Bulk Procurement Tier Savings Analysis (50 pcs vs 250 pcs vs 1,000 pcs)
    const procurementTiers = [
      { qty: 50, discountPct: 0, label: 'Small Batch (50 units)', unitCost: totalMaterialCost },
      { qty: 250, discountPct: 15, label: 'Wholesale Pack (250 units)', unitCost: totalMaterialCost * 0.85 },
      { qty: 1000, discountPct: 35, label: 'Factory Pallet (1,000 units)', unitCost: totalMaterialCost * 0.65 }
    ].map(tier => {
      const orderTotal = tier.unitCost * tier.qty;
      const savingsVsRetail = (totalMaterialCost - tier.unitCost) * tier.qty;
      const annualSavingsAtCurrentRunrate = (totalMaterialCost - tier.unitCost) * monthlyShipments * 12;
      return {
        ...tier,
        orderTotal,
        savingsVsRetail,
        annualSavingsAtCurrentRunrate
      };
    });

    return {
      boxCost,
      bubbleCost,
      desiccantCost,
      polyCost,
      crinkleCost,
      totalCushioningCost,
      labelCost,
      stickerCost,
      cardCost,
      swagCost,
      totalBrandingCost,
      totalTapeCost,
      totalMaterialCost,
      laborCost,
      totalPackagingCost,
      packagingPctOfRetail,
      boxVolumeCm3,
      volumetricWeightKg,
      volumetricWeightGrams,
      totalDeadweightDifferenceGrams,
      isVolumetricPenalty,
      monthlyShipments,
      monthlyPackagingMaterials,
      monthlyLaborExpense,
      monthlyTotalPackagingBudget,
      monthlyBubbleWrapMeters,
      monthlyTapeMeters,
      monthlyPackingHours,
      pctBox,
      pctCushioning,
      pctBranding,
      pctTape,
      pctLabor,
      procurementTiers
    };
  }, [
    containerCost,
    bubbleWrapMeters,
    bubbleWrapCostPerMeter,
    crinklePaperCost,
    desiccantPouchCost,
    hasDesiccant,
    polybagCost,
    hasPolybag,
    shippingLabelCost,
    logoStickerCost,
    hasLogoSticker,
    thankYouCardCost,
    hasThankYouCard,
    freebieSwagCost,
    tapeMetersUsed,
    tapeCostPerMeter,
    packingMinutes,
    packerHourlyWage,
    productRetailPrice,
    boxLengthCm,
    boxWidthCm,
    boxHeightCm,
    actualPartWeightGrams,
    monthlyShipmentVolume
  ]);

  // Currency Formatter
  const fmt = (val: number, decimals: number = 2) => {
    return `${currency.symbol}${val.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
  };

  // --- Copy Packaging BOM ---
  const handleCopyBOM = () => {
    const c = calculations;
    const summary = `=== 3D PRINT PACKAGING BILL OF MATERIALS (BOM) ===
Generated via Toolique Packaging Cost Engine

[CONTAINER & BOX]
Outer Mailer/Box (${boxLengthCm}x${boxWidthCm}x${boxHeightCm} cm): ${fmt(c.boxCost)}
Volumetric Shipping Weight: ${c.volumetricWeightGrams.toFixed(0)}g (Actual Part: ${actualPartWeightGrams}g)

[CUSHIONING & FILLERS]
Bubble Wrap (${bubbleWrapMeters}m @ ${fmt(bubbleWrapCostPerMeter)}/m): ${fmt(c.bubbleCost)}
Crinkle Kraft Paper: ${fmt(c.crinkleCost)}
Silica Gel Desiccant: ${hasDesiccant ? fmt(c.desiccantCost) : 'None'}
Protective Polybag: ${hasPolybag ? fmt(c.polyCost) : 'None'}
Subtotal Cushioning: ${fmt(c.totalCushioningCost)}

[BRANDING & UNBOXING]
Thermal Shipping Label (4x6"): ${fmt(c.labelCost)}
Custom Logo Die-Cut Sticker: ${hasLogoSticker ? fmt(c.stickerCost) : 'None'}
Thank You Card / Flyer: ${hasThankYouCard ? fmt(c.cardCost) : 'None'}
Freebie Swag / Insert: ${fmt(c.swagCost)}
Subtotal Branding: ${fmt(c.totalBrandingCost)}

[SEALING & TAPE]
Reinforced Tape (${tapeMetersUsed}m): ${fmt(c.totalTapeCost)}
--------------------------------------------------
TOTAL PACKAGING MATERIALS: ${fmt(c.totalMaterialCost)}
PACKING LABOR (${packingMinutes} min @ ${fmt(packerHourlyWage)}/hr): ${fmt(c.laborCost)}
TOTAL LANDED PACKAGING COST: ${fmt(c.totalPackagingCost)}
(% of Product Retail Price: ${c.packagingPctOfRetail.toFixed(1)}%)

[MONTHLY FULFILLMENT FORECAST (${c.monthlyShipments} ORDERS)]
Monthly Materials Spend: ${fmt(c.monthlyPackagingMaterials)}
Monthly Packaging Labor: ${fmt(c.monthlyLaborExpense)} (${c.monthlyPackingHours.toFixed(1)} hrs)
Monthly Bubble Wrap Needed: ${c.monthlyBubbleWrapMeters.toFixed(0)} meters
==================================================`;

    navigator.clipboard.writeText(summary);
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
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text('3D PRINT PRODUCT PACKAGING & BOM COST REPORT', 14, 13);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225);
    doc.text(`Packaging Spec: ${selectedPresetId.toUpperCase()} | Box Dimensions: ${boxLengthCm}x${boxWidthCm}x${boxHeightCm}cm | Currency: ${currency.code}`, 14, 20);
    doc.text(`Generated: ${new Date().toLocaleDateString()} | Toolique E-Commerce Logistics Suite | Toolique.in`, 14, 25);

    // Section 1: Executive KPI Cards
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 36, 182, 36, 3, 3, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, 36, 182, 36, 3, 3, 'S');

    // KPI 1: Unit Packaging Cost
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('UNIT PACKAGING COST', 20, 44);
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text(`${currSym}${c.totalPackagingCost.toFixed(2)}`, 20, 52);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Materials: ${currSym}${c.totalMaterialCost.toFixed(2)} | Labor: ${currSym}${c.laborCost.toFixed(2)}`, 20, 58);

    // KPI 2: % of Retail Price
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('% OF RETAIL PRICE', 80, 44);
    doc.setFontSize(14);
    doc.setTextColor(79, 70, 229); // indigo
    doc.text(`${c.packagingPctOfRetail.toFixed(1)}%`, 80, 52);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Retail Price: ${currSym}${productRetailPrice.toFixed(2)}`, 80, 58);

    // KPI 3: Volumetric Shipping Weight
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('VOLUMETRIC WEIGHT', 140, 44);
    doc.setFontSize(14);
    doc.setTextColor(c.isVolumetricPenalty ? 220 : 16, c.isVolumetricPenalty ? 38 : 185, c.isVolumetricPenalty ? 38 : 129);
    doc.text(`${c.volumetricWeightGrams.toFixed(0)} g`, 140, 52);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Actual Weight: ${actualPartWeightGrams} g`, 140, 58);

    // Section 2: Detailed Itemized Packaging BOM Table
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.text('1. ITEMIZED PACKAGING MATERIAL BILL OF MATERIALS (BOM)', 14, 80);

    let y = 86;
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, 182, 7, 'F');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text('Component Item', 18, y + 5);
    doc.text('Specification / Usage Quantity', 75, y + 5);
    doc.text('Unit Cost', 165, y + 5);

    const bomRows = [
      { name: 'Outer Shipper / Box', spec: `${boxLengthCm}x${boxWidthCm}x${boxHeightCm} cm Corrugated Carton`, cost: `${currSym}${c.boxCost.toFixed(2)}` },
      { name: 'Protective Bubble Wrap', spec: `${bubbleWrapMeters} meters @ ${currSym}${bubbleWrapCostPerMeter.toFixed(2)}/m`, cost: `${currSym}${c.bubbleCost.toFixed(2)}` },
      { name: 'Silica Gel Desiccant Pouch', spec: hasDesiccant ? '1x 2g Moisture Absorber' : 'Omitted', cost: `${currSym}${c.desiccantCost.toFixed(2)}` },
      { name: 'Airtight Polybag / Wrap', spec: hasPolybag ? 'Protective dust barrier' : 'Omitted', cost: `${currSym}${c.polyCost.toFixed(2)}` },
      { name: 'Thermal Shipping Label', spec: '4x6" Direct Thermal Barcode Label', cost: `${currSym}${c.labelCost.toFixed(2)}` },
      { name: 'Branded Die-Cut Sticker', spec: hasLogoSticker ? 'Vinyl Logo Package Seal' : 'Omitted', cost: `${currSym}${c.stickerCost.toFixed(2)}` },
      { name: 'Thank You Card / Insert', spec: hasThankYouCard ? 'Branded Unboxing Insert' : 'Omitted', cost: `${currSym}${c.cardCost.toFixed(2)}` },
      { name: 'Reinforced Sealing Tape', spec: `${tapeMetersUsed} meters gummed tape`, cost: `${currSym}${c.totalTapeCost.toFixed(2)}` },
      { name: 'Packing & Assembly Labor', spec: `${packingMinutes} mins @ ${currSym}${packerHourlyWage}/hr`, cost: `${currSym}${c.laborCost.toFixed(2)}` },
    ];

    y += 7;
    bomRows.forEach((r, idx) => {
      doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
      doc.rect(14, y, 182, 6.5, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      doc.text(r.name, 18, y + 4.5);
      doc.setTextColor(100, 116, 139);
      doc.text(r.spec, 75, y + 4.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(r.cost, 165, y + 4.5);
      y += 6.5;
    });

    // Subtotal Row
    doc.setFillColor(224, 231, 255);
    doc.rect(14, y, 182, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(67, 56, 202);
    doc.text('TOTAL LANDED PACKAGING COST PER ORDER', 18, y + 5.5);
    doc.text(`${currSym}${c.totalPackagingCost.toFixed(2)}`, 165, y + 5.5);

    // Section 3: Monthly Fulfillment Forecast
    y += 16;
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`2. MONTHLY FULFILLMENT FORECAST (${c.monthlyShipments} ORDERS/MO)`, 14, y);

    y += 6;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, y, 182, 28, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, y, 182, 28, 2, 2, 'S');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(`Monthly Packaging Material Cost: ${currSym}${c.monthlyPackagingMaterials.toFixed(2)}`, 20, y + 7);
    doc.text(`Monthly Packing Labor Cost: ${currSym}${c.monthlyLaborExpense.toFixed(2)} (${c.monthlyPackingHours.toFixed(1)} hrs)`, 20, y + 14);
    doc.text(`Total Monthly Packaging Spend: ${currSym}${c.monthlyTotalPackagingBudget.toFixed(2)}`, 20, y + 21);

    doc.text(`Total Bubble Wrap Rolls: ${c.monthlyBubbleWrapMeters.toFixed(0)} meters`, 110, y + 7);
    doc.text(`Total Sealing Tape: ${c.monthlyTapeMeters.toFixed(0)} meters`, 110, y + 14);
    doc.text(`Total Boxes Consumed: ${c.monthlyShipments} cartons`, 110, y + 21);

    // Section 4: Bulk Procurement Savings Table
    y += 36;
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text('3. BULK PROCUREMENT VOLUME SAVINGS ANALYSIS', 14, y);

    y += 6;
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, 182, 7, 'F');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text('Order Tier', 18, y + 5);
    doc.text('Discount', 65, y + 5);
    doc.text('Unit Cost', 95, y + 5);
    doc.text('Batch Total', 125, y + 5);
    doc.text('Annual Savings (at current volume)', 150, y + 5);

    y += 7;
    c.procurementTiers.forEach((tier, i) => {
      doc.setFillColor(i % 2 === 0 ? 255 : 248, i % 2 === 0 ? 255 : 250, i % 2 === 0 ? 255 : 252);
      doc.rect(14, y, 182, 6, 'F');
      doc.setFont('helvetica', i === 2 ? 'bold' : 'normal');
      doc.setTextColor(i === 2 ? 16 : 51, i === 2 ? 185 : 65, i === 2 ? 129 : 85);
      doc.text(tier.label, 18, y + 4.2);
      doc.text(`${tier.discountPct}%`, 65, y + 4.2);
      doc.text(`${currSym}${tier.unitCost.toFixed(2)}`, 95, y + 4.2);
      doc.text(`${currSym}${tier.orderTotal.toFixed(0)}`, 125, y + 4.2);
      doc.text(`${currSym}${tier.annualSavingsAtCurrentRunrate.toFixed(0)}/yr`, 150, y + 4.2);
      y += 6;
    });

    // Footer
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Toolique E-Commerce & 3D Print Packaging Logistics Modeler. All calculations client-side.', 14, 285);

    doc.save(`3D_Print_Packaging_BOM_${Date.now()}.pdf`);
  };

  const c = calculations;

  // Packaging Health Rating
  const getPackagingRating = (pct: number) => {
    if (pct <= 5.0) return { bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', label: 'Lean & Cost-Effective (<5%)' };
    if (pct <= 10.0) return { bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20', label: 'Balanced Unboxing (5-10%)' };
    return { bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', label: 'High Packaging Burden (>10%)' };
  };

  const ratingBadge = getPackagingRating(c.packagingPctOfRetail);

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-left pb-12">
      {/* Top Banner & Multi-Currency Switcher */}
      <div className="saas-card p-5 bg-gradient-to-r from-zinc-50 via-indigo-50/20 to-zinc-50 dark:from-zinc-900/90 dark:via-indigo-950/20 dark:to-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
              Packaging & Fulfillment BOM Modeler
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                LOGISTICS & UNBOXING
              </span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Itemized boxes, bubble wraps, logo stickers, thank-you cards, desiccants, volumetric weights, and bulk savings.
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

      {/* Preset Packaging Profiles */}
      <div className="saas-card p-4 space-y-2.5">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> 1-Click Packaging Templates
          </span>
          <span className="text-[11px] text-zinc-400">Loads realistic box sizes & materials</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {PACKAGING_PRESETS.map((p) => (
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
                <span className="font-bold text-xs text-zinc-900 dark:text-white truncate">{p.name}</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 shrink-0">
                  {p.badge}
                </span>
              </div>
              <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold font-mono mt-1">
                {p.boxLengthCm}x{p.boxWidthCm}x{p.boxHeightCm} cm · {p.bubbleMeters}m bubble
              </div>
              <div className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">{p.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Tabs & Export Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('unit')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'unit'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            <Package className="w-4 h-4" />
            Unit Packaging BOM & Economics
          </button>
          <button
            onClick={() => setActiveTab('batch')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'batch'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            <Boxes className="w-4 h-4" />
            Monthly Fulfillment Forecast
          </button>
          <button
            onClick={() => setActiveTab('procurement')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'procurement'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            <Coins className="w-4 h-4" />
            Bulk Procurement Discount Optimizer
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyBOM}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition cursor-pointer border border-zinc-200/60 dark:border-zinc-700"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-indigo-500" />}
            <span>{copied ? 'Copied BOM' : 'Copy Packaging BOM'}</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition cursor-pointer border border-indigo-200/80 dark:border-indigo-800/80"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PDF Spec Sheet</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Inputs (7 cols) vs Outputs & BOM Analysis (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Component Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Section 1: Box / Outer Shipper Container */}
          <div className="saas-card p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                  1. Outer Shipper Box / Mailer
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                Box: {fmt(c.boxCost)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Unit Box / Mailer Purchase Price</label>
                  <span className="text-xs font-mono font-bold text-zinc-400">{fmt(containerCost)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-400">{currency.symbol}</span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={containerCost}
                    onChange={(e) => setContainerCost(Math.max(0, Number(e.target.value)))}
                    className="saas-input font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Actual Product Weight</label>
                  <span className="text-xs font-mono font-bold text-zinc-400">{actualPartWeightGrams} g</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    step="10"
                    value={actualPartWeightGrams}
                    onChange={(e) => setActualPartWeightGrams(Math.max(1, Number(e.target.value)))}
                    className="saas-input font-mono"
                  />
                  <span className="text-xs font-bold text-zinc-400">g</span>
                </div>
              </div>

              {/* Box Dimensions: Length x Width x Height */}
              <div className="space-y-1.5 sm:col-span-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Box Dimensions (L × W × H in cm)</label>
                  <span className="text-xs font-mono text-zinc-400">
                    Vol: {c.boxVolumeCm3.toLocaleString()} cm³ ({c.volumetricWeightGrams.toFixed(0)}g volumetric)
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="1"
                      value={boxLengthCm}
                      onChange={(e) => setBoxLengthCm(Math.max(1, Number(e.target.value)))}
                      className="saas-input font-mono text-center"
                    />
                    <span className="text-[10px] text-zinc-400">L</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="1"
                      value={boxWidthCm}
                      onChange={(e) => setBoxWidthCm(Math.max(1, Number(e.target.value)))}
                      className="saas-input font-mono text-center"
                    />
                    <span className="text-[10px] text-zinc-400">W</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="1"
                      value={boxHeightCm}
                      onChange={(e) => setBoxHeightCm(Math.max(1, Number(e.target.value)))}
                      className="saas-input font-mono text-center"
                    />
                    <span className="text-[10px] text-zinc-400">H</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Cushioning, Bubble Wrap & Protection */}
          <div className="saas-card p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                  2. Cushioning & Interior Protection
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                Protection: {fmt(c.totalCushioningCost)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Bubble Wrap Meters */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Bubble Wrap Length Used</label>
                  <span className="text-xs font-mono font-bold text-zinc-400">{bubbleWrapMeters} meters</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="0.2"
                    value={bubbleWrapMeters}
                    onChange={(e) => setBubbleWrapMeters(Math.max(0, Number(e.target.value)))}
                    className="saas-input font-mono"
                  />
                  <span className="text-xs font-bold text-zinc-400">m</span>
                </div>
              </div>

              {/* Bubble Wrap Cost / Meter */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Bubble Wrap Cost / Meter</label>
                  <span className="text-xs font-mono font-bold text-zinc-400">{fmt(bubbleWrapCostPerMeter)}/m</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-400">{currency.symbol}</span>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={bubbleWrapCostPerMeter}
                    onChange={(e) => setBubbleWrapCostPerMeter(Math.max(0, Number(e.target.value)))}
                    className="saas-input font-mono"
                  />
                </div>
              </div>

              {/* Desiccant Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800">
                <div>
                  <div className="font-bold text-xs text-zinc-900 dark:text-white">Silica Gel Desiccant Pack</div>
                  <div className="text-[10px] text-zinc-400">Prevents polymer moisture absorption</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-zinc-400">{fmt(desiccantPouchCost)}</span>
                  <input
                    type="checkbox"
                    checked={hasDesiccant}
                    onChange={(e) => setHasDesiccant(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Polybag Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800">
                <div>
                  <div className="font-bold text-xs text-zinc-900 dark:text-white">Airtight Zip-Lock / Polybag</div>
                  <div className="text-[10px] text-zinc-400">Dust & scratch prevention</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-zinc-400">{fmt(polybagCost)}</span>
                  <input
                    type="checkbox"
                    checked={hasPolybag}
                    onChange={(e) => setHasPolybag(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Branding, Unboxing Inserts & Sealing */}
          <div className="saas-card p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                  3. Branding, Labels & Sealing Tape
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                Branding & Tape: {fmt(c.totalBrandingCost + c.totalTapeCost)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Shipping Label */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">4×6" Shipping Label Cost</label>
                  <span className="text-xs font-mono font-bold text-zinc-400">{fmt(shippingLabelCost)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-400">{currency.symbol}</span>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={shippingLabelCost}
                    onChange={(e) => setShippingLabelCost(Math.max(0, Number(e.target.value)))}
                    className="saas-input font-mono"
                  />
                </div>
              </div>

              {/* Sealing Tape Length */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Packing Tape Used (Meters)</label>
                  <span className="text-xs font-mono font-bold text-zinc-400">{tapeMetersUsed} m ({fmt(c.totalTapeCost)})</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="0.2"
                    value={tapeMetersUsed}
                    onChange={(e) => setTapeMetersUsed(Math.max(0, Number(e.target.value)))}
                    className="saas-input font-mono"
                  />
                  <span className="text-xs font-bold text-zinc-400">m</span>
                </div>
              </div>

              {/* Logo Sticker Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800">
                <div>
                  <div className="font-bold text-xs text-zinc-900 dark:text-white">Custom Logo Die-Cut Sticker</div>
                  <div className="text-[10px] text-zinc-400">Branded package seal</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-zinc-400">{fmt(logoStickerCost)}</span>
                  <input
                    type="checkbox"
                    checked={hasLogoSticker}
                    onChange={(e) => setHasLogoSticker(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Thank You Card Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800">
                <div>
                  <div className="font-bold text-xs text-zinc-900 dark:text-white">Thank You Card / Flyer</div>
                  <div className="text-[10px] text-zinc-400">Discount coupon / care guide</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-zinc-400">{fmt(thankYouCardCost)}</span>
                  <input
                    type="checkbox"
                    checked={hasThankYouCard}
                    onChange={(e) => setHasThankYouCard(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Freebie Swag Cost */}
              <div className="space-y-1.5 sm:col-span-2">
                <div className="flex justify-between">
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Freebie Swag / Insert (Sample print, keychain, candy)</label>
                  <span className="text-xs font-mono font-bold text-zinc-400">{fmt(freebieSwagCost)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-400">{currency.symbol}</span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={freebieSwagCost}
                    onChange={(e) => setFreebieSwagCost(Math.max(0, Number(e.target.value)))}
                    className="saas-input font-mono text-xs"
                  />
                </div>
              </div>

              {/* Packing Labor Time & Wage */}
              <div className="space-y-1.5 sm:col-span-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300">Packing Time / Box</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={packingMinutes}
                        onChange={(e) => setPackingMinutes(Math.max(0, Number(e.target.value)))}
                        className="saas-input font-mono text-xs"
                      />
                      <span className="text-[10px] text-zinc-400">mins</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300">Packer Wage / Hour</label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-zinc-400">{currency.symbol}</span>
                      <input
                        type="number"
                        min="0"
                        step="10"
                        value={packerHourlyWage}
                        onChange={(e) => setPackerHourlyWage(Math.max(0, Number(e.target.value)))}
                        className="saas-input font-mono text-xs"
                      />
                      <span className="text-[10px] text-zinc-400">/hr</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Results & Cost Breakdown (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Main Packaging Cost Highlight Box */}
          <div className="saas-card p-6 bg-gradient-to-br from-white via-zinc-50 to-indigo-50/30 dark:from-zinc-900 dark:via-zinc-900 dark:to-indigo-950/20 border-2 border-indigo-500/30 shadow-lg space-y-5">
            {/* Health Badge */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                PACKAGING RATIO
              </span>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${ratingBadge.bg}`}>
                {ratingBadge.label}
              </span>
            </div>

            {/* Tab 1: Unit Cost View */}
            {activeTab === 'unit' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/25">
                  <div className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                    Total Landed Packaging Cost
                  </div>
                  <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 font-mono my-1">
                    {fmt(c.totalPackagingCost)}
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex justify-between font-medium">
                    <span>Materials: {fmt(c.totalMaterialCost)}</span>
                    <span>Labor: {fmt(c.laborCost)} ({packingMinutes}m)</span>
                  </div>
                </div>

                {/* Product Retail Price Slider */}
                <div className="space-y-1.5 bg-zinc-50 dark:bg-zinc-800/60 p-3.5 rounded-2xl border border-zinc-200/70 dark:border-zinc-700/80">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-200">
                      Product Retail Selling Price
                    </label>
                    <div className="text-sm font-black text-zinc-900 dark:text-white font-mono">
                      {fmt(productRetailPrice)}
                    </div>
                  </div>
                  <input
                    type="range"
                    min={Math.round(c.totalPackagingCost * 2)}
                    max={Math.round(c.totalPackagingCost * 40)}
                    step={currencyKey === 'INR' ? 20 : 1}
                    value={productRetailPrice}
                    onChange={(e) => setProductRetailPrice(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                    <span>Packaging is {c.packagingPctOfRetail.toFixed(1)}% of price</span>
                    <span>Standard benchmark: 4-8%</span>
                  </div>
                </div>

                {/* Volumetric Warning Badge */}
                {c.isVolumetricPenalty && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <strong>Volumetric Weight Alert:</strong> Box volume calculates to {c.volumetricWeightGrams.toFixed(0)}g courier weight, which exceeds physical part weight ({actualPartWeightGrams}g) by {c.totalDeadweightDifferenceGrams.toFixed(0)}g. Consider a smaller box to save on shipping charges.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Monthly Forecast */}
            {activeTab === 'batch' && (
              <div className="space-y-4">
                <div className="space-y-1.5 bg-zinc-50 dark:bg-zinc-800/60 p-3.5 rounded-2xl border border-zinc-200/70 dark:border-zinc-700/80">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-200">
                      Monthly Shipment Orders
                    </label>
                    <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-mono">
                      {monthlyShipmentVolume} packages/mo
                    </div>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="1000"
                    step="10"
                    value={monthlyShipmentVolume}
                    onChange={(e) => setMonthlyShipmentVolume(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                    Monthly Total Packaging Spend
                  </div>
                  <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono my-1">
                    {fmt(c.monthlyTotalPackagingBudget)}
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Materials: {fmt(c.monthlyPackagingMaterials)} | Labor: {fmt(c.monthlyLaborExpense)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60">
                    <div className="text-zinc-400 text-[10px] font-bold">Bubble Wrap Consumed</div>
                    <div className="font-mono font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
                      {c.monthlyBubbleWrapMeters.toFixed(0)} meters
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60">
                    <div className="text-zinc-400 text-[10px] font-bold">Total Packing Labor</div>
                    <div className="font-mono font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
                      {c.monthlyPackingHours.toFixed(1)} hrs/month
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Bulk Procurement Optimizer */}
            {activeTab === 'procurement' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Bulk Purchase Tiers & Annual Savings
                </div>
                <div className="space-y-2">
                  {c.procurementTiers.map((tier) => (
                    <div key={tier.qty} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                          {tier.label}
                          {tier.discountPct > 0 && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                              {tier.discountPct}% OFF
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-zinc-400 mt-0.5">
                          Unit: {fmt(tier.unitCost)} | Order: {fmt(tier.orderTotal, 0)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          +{fmt(tier.annualSavingsAtCurrentRunrate, 0)}/yr
                        </div>
                        <div className="text-[9px] text-zinc-400">Annual Savings</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stacked Proportional Bar */}
            <div className="space-y-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
              <div className="flex justify-between items-center text-xs font-bold text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <PieChart className="w-3.5 h-3.5 text-indigo-500" /> Cost Distribution
                </span>
                <span className="font-mono text-[10px] text-zinc-400">{fmt(c.totalPackagingCost)}</span>
              </div>

              {/* Segmented Stacked Bar */}
              <div className="h-3 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden flex shadow-inner">
                <div style={{ width: `${c.pctBox}%` }} title={`Box: ${c.pctBox.toFixed(1)}%`} className="bg-indigo-500 h-full" />
                <div style={{ width: `${c.pctCushioning}%` }} title={`Cushioning: ${c.pctCushioning.toFixed(1)}%`} className="bg-amber-500 h-full" />
                <div style={{ width: `${c.pctBranding}%` }} title={`Branding: ${c.pctBranding.toFixed(1)}%`} className="bg-purple-500 h-full" />
                <div style={{ width: `${c.pctTape}%` }} title={`Tape: ${c.pctTape.toFixed(1)}%`} className="bg-rose-500 h-full" />
                <div style={{ width: `${c.pctLabor}%` }} title={`Labor: ${c.pctLabor.toFixed(1)}%`} className="bg-emerald-500 h-full" />
              </div>

              {/* Legend */}
              <div className="grid grid-cols-3 gap-y-1 gap-x-2 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 pt-1">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                  <span className="truncate">Box: {fmt(c.boxCost)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <span className="truncate">Cushion: {fmt(c.totalCushioningCost)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                  <span className="truncate">Brand: {fmt(c.totalBrandingCost)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  <span className="truncate">Tape: {fmt(c.totalTapeCost)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="truncate">Labor: {fmt(c.laborCost)}</span>
                </div>
                <div className="flex items-center gap-1 font-bold text-zinc-800 dark:text-zinc-200">
                  <span>Total: {fmt(c.totalPackagingCost)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Fulfillment Logistics & Volumetric Metric */}
          <div className="saas-card p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-indigo-500" /> Logistics & Volumetric Economics
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800">
                <div className="text-[10px] font-bold text-zinc-400">Volumetric Weight</div>
                <div className="text-sm font-black text-zinc-800 dark:text-zinc-200 font-mono mt-0.5">
                  {c.volumetricWeightGrams.toFixed(0)} grams
                </div>
                <div className="text-[9px] text-zinc-400 mt-0.5">L×W×H / 5000 courier formula</div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800">
                <div className="text-[10px] font-bold text-zinc-400">Deadweight Air Gap</div>
                <div className="text-sm font-black text-indigo-650 dark:text-indigo-400 font-mono mt-0.5">
                  {c.totalDeadweightDifferenceGrams > 0 ? `+${c.totalDeadweightDifferenceGrams.toFixed(0)}g` : '0g'}
                </div>
                <div className="text-[9px] text-zinc-400 mt-0.5">Volumetric vs Part weight</div>
              </div>
            </div>
          </div>

          {/* Privacy Badge */}
          <div className="p-3.5 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              <strong>100% Client-Side Fulfillment Sandbox:</strong> All BOM cost calculations, volume projections, and bulk procurement analyses run securely in your local browser memory.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

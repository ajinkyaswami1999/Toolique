import { useState, useMemo, useEffect } from 'react';
import { 
  Palette, Copy, Check, RotateCcw, Download, 
  Layers, Box, Zap, Eye, Save, Trash2, 
  Flame, Sparkles, Sliders
} from 'lucide-react';
import { jsPDF } from 'jspdf';

// --- Types & Data Definitions ---
export type KitchenShape = 'straight' | 'l_shaped' | 'parallel' | 'u_shaped' | 'island';
export type CarcassMaterial = 'bwp_marine' | 'hdhmr' | 'bwr_ply' | 'commercial_mr' | 'ss_304';
export type ShutterFinish = 
  | 'matte_laminate' 
  | 'high_gloss_acrylic' 
  | 'anti_fingerprint_matte' 
  | 'membrane_pvc' 
  | 'natural_veneer_pu' 
  | 'pu_duco_paint' 
  | 'tinted_fluted_glass' 
  | 'sintered_porcelain';
export type CountertopType = 'none' | 'granite_black' | 'engineered_quartz' | 'nano_white' | 'sintered_stone' | 'corian_solid';
export type HardwareBrand = 'standard_ebco' | 'premium_hettich' | 'luxury_blum';
export type VisualizerTheme = 'white_gold' | 'charcoal_slate' | 'emerald_brass' | 'walnut_cream' | 'navy_bronze' | 'scandinavian_oak';

interface SavedKitchenQuote {
  id: string;
  name: string;
  shape: KitchenShape;
  finish: ShutterFinish;
  totalCost: number;
  totalRunningFt: number;
  date: string;
}

// Layout Presets
const LAYOUT_PRESETS = [
  {
    id: 'compact_1bhk',
    name: '1BHK Compact Straight (8 ft)',
    shape: 'straight' as KitchenShape,
    straightLen: 8,
    wallA: 8,
    wallB: 0,
    wallC: 0,
    parallelLen1: 8,
    parallelLen2: 0,
    islandLen: 0,
    islandWidth: 0,
    includeLoft: true,
    loftHeight: 2,
    tallUnits: 0,
    carcass: 'hdhmr' as CarcassMaterial,
    finish: 'matte_laminate' as ShutterFinish,
    countertop: 'granite_black' as CountertopType,
    hardware: 'standard_ebco' as HardwareBrand,
    desc: 'Budget-friendly linear kitchen with high storage efficiency for compact apartments (8 Rft)'
  },
  {
    id: 'standard_2bhk_lshape',
    name: '2BHK Classic L-Shape (10 + 7 ft)',
    shape: 'l_shaped' as KitchenShape,
    straightLen: 10,
    wallA: 10,
    wallB: 7,
    wallC: 0,
    parallelLen1: 10,
    parallelLen2: 7,
    islandLen: 0,
    islandWidth: 0,
    includeLoft: true,
    loftHeight: 2,
    tallUnits: 1,
    carcass: 'bwp_marine' as CarcassMaterial,
    finish: 'high_gloss_acrylic' as ShutterFinish,
    countertop: 'engineered_quartz' as CountertopType,
    hardware: 'premium_hettich' as HardwareBrand,
    desc: 'Most popular Indian family layout with 1 tall pantry and corner magic carousel (17 Rft)'
  },
  {
    id: 'master_3bhk_parallel',
    name: '3BHK Master Galley/Parallel (10 + 9 ft)',
    shape: 'parallel' as KitchenShape,
    straightLen: 10,
    wallA: 10,
    wallB: 9,
    wallC: 0,
    parallelLen1: 10,
    parallelLen2: 9,
    islandLen: 0,
    islandWidth: 0,
    includeLoft: true,
    loftHeight: 2.2,
    tallUnits: 1,
    carcass: 'bwp_marine' as CarcassMaterial,
    finish: 'high_gloss_acrylic' as ShutterFinish,
    countertop: 'engineered_quartz' as CountertopType,
    hardware: 'premium_hettich' as HardwareBrand,
    desc: 'Dual-counter galley workflow with dedicated wet sink zone & dry cooking zone (19 Rft)'
  },
  {
    id: 'luxury_4bhk_ushape',
    name: '4BHK Luxury U-Shape (8 + 10 + 8 ft)',
    shape: 'u_shaped' as KitchenShape,
    straightLen: 10,
    wallA: 8,
    wallB: 10,
    wallC: 8,
    parallelLen1: 10,
    parallelLen2: 10,
    islandLen: 0,
    islandWidth: 0,
    includeLoft: true,
    loftHeight: 2.5,
    tallUnits: 2,
    carcass: 'bwp_marine' as CarcassMaterial,
    finish: 'anti_fingerprint_matte' as ShutterFinish,
    countertop: 'sintered_stone' as CountertopType,
    hardware: 'luxury_blum' as HardwareBrand,
    desc: 'Maximized 3-sided counter space with dual corner units, 2 appliance towers, and Blum Aventos lift-ups (26 Rft)'
  },
  {
    id: 'grand_villa_island',
    name: 'Grand Villa L-Shape + Island (14 ft + 6×3 ft)',
    shape: 'island' as KitchenShape,
    straightLen: 14,
    wallA: 10,
    wallB: 8,
    wallC: 0,
    parallelLen1: 10,
    parallelLen2: 8,
    islandLen: 6,
    islandWidth: 3,
    includeLoft: true,
    loftHeight: 2.5,
    tallUnits: 2,
    carcass: 'bwp_marine' as CarcassMaterial,
    finish: 'pu_duco_paint' as ShutterFinish,
    countertop: 'sintered_stone' as CountertopType,
    hardware: 'luxury_blum' as HardwareBrand,
    desc: 'Luxury open kitchen with central breakfast island, PU Duco Italian finish, and built-in appliances (24 Rft)'
  }
];

// Carcass materials
const CARCASS_CONFIG = {
  bwp_marine: {
    name: 'BWP Marine Plywood (IS:710)',
    tag: '100% Waterproof',
    baseRateSqFt: 1550,
    desc: 'Boiling waterproof marine ply with 15-yr warranty. Highly recommended for wet sink zones.'
  },
  hdhmr: {
    name: 'HDHMR Board (Action TESA 850+ kg/m³)',
    tag: 'High Density & Moisture Proof',
    baseRateSqFt: 1420,
    desc: 'High-density moisture-resistant green board with superior screw holding and termite resistance.'
  },
  bwr_ply: {
    name: 'BWR Grade Plywood (IS:303)',
    tag: 'Boiling Water Resistant',
    baseRateSqFt: 1320,
    desc: 'Durable boiling water resistant ply, ideal for dry wall units and upper storage lofts.'
  },
  commercial_mr: {
    name: 'Commercial MR Plywood (IS:303)',
    tag: 'Budget Moisture Resistant',
    baseRateSqFt: 1180,
    desc: 'Standard commercial grade plywood for budget rental apartments and dry storage.'
  },
  ss_304: {
    name: 'SS 304 Stainless Steel Grade',
    tag: 'Commercial Ultra-Hygiene',
    baseRateSqFt: 2850,
    desc: 'Hospital-grade rustproof, termite-proof, fireproof stainless steel modular carcass boxes.'
  }
};

// Shutter finishes
const FINISH_CONFIG = {
  matte_laminate: {
    name: 'Matte / Suede Laminate (1.0mm Merino/Century)',
    premiumPerSqFt: 0,
    desc: 'Scratch-resistant, budget-friendly, vast range of textures & solid colors.'
  },
  high_gloss_acrylic: {
    name: 'High-Gloss Acrylic (1.5mm - 2.0mm Mirror Gloss)',
    premiumPerSqFt: 320,
    desc: 'Ultra-glossy mirror finish, seamless modern aesthetics, UV stable & non-toxic.'
  },
  anti_fingerprint_matte: {
    name: 'Anti-Fingerprint Super Matte (FENIX NTM / Soft-Touch)',
    premiumPerSqFt: 550,
    desc: 'Velvety thermal-healing matte surface with zero fingerprint smudges & soft touch.'
  },
  membrane_pvc: {
    name: 'Seamless 3D Membrane / PVC Molded Foil',
    premiumPerSqFt: 240,
    desc: 'Seamless wrap around edges, ideal for classic grooved shaker profiles.'
  },
  natural_veneer_pu: {
    name: 'Natural Wood Veneer + PU Polish (Teak/Walnut)',
    premiumPerSqFt: 950,
    desc: 'Real exotic wood flitches coated with high-end Italian PU melamine polish.'
  },
  pu_duco_paint: {
    name: 'PU Duco Paint (7-Layer Italian Spray Finish)',
    premiumPerSqFt: 1250,
    desc: 'Seamless bespoke painted finish with zero edge joints in high gloss or satin matte.'
  },
  tinted_fluted_glass: {
    name: 'Tinted Fluted Glass in Slim Black Aluminium Frame',
    premiumPerSqFt: 1350,
    desc: 'Contemporary luxury glass showcase shutters with integrated LED profile lighting.'
  },
  sintered_porcelain: {
    name: 'Sintered Porcelain / Ceramic Stone Facade (4mm-6mm)',
    premiumPerSqFt: 1650,
    desc: 'Impervious to heat, scratches, direct flames, and household chemicals.'
  }
};

// Countertop materials
const COUNTERTOP_CONFIG = {
  none: {
    name: 'None / Existing Builder Slab',
    ratePerSqFt: 0,
    mouldingPerRft: 0,
    desc: 'Civil granite slab already installed by builder or contractor.'
  },
  granite_black: {
    name: 'Jet Black / Telephone Black Granite (18-20mm)',
    ratePerSqFt: 280,
    mouldingPerRft: 180,
    desc: 'Indian kitchen gold standard: 100% heat & acid proof with full-bullnose edge polishing.'
  },
  engineered_quartz: {
    name: 'Premium Engineered Quartz (KalingaStone / Caesarstone)',
    ratePerSqFt: 550,
    mouldingPerRft: 260,
    desc: 'Non-porous, antibacterial, uniform luxury veining with zero stain absorption.'
  },
  nano_white: {
    name: 'Nano White / G5 Crystallized Composite Marble',
    ratePerSqFt: 680,
    mouldingPerRft: 280,
    desc: 'Pure pristine white crystalline surface, highly stain and scratch resistant.'
  },
  sintered_stone: {
    name: 'Sintered Porcelain Stone (Dekton / Neolith / Nexion)',
    ratePerSqFt: 980,
    mouldingPerRft: 420,
    desc: 'Ultra-compact surface: place hot pans directly without trivets, 100% scratchproof.'
  },
  corian_solid: {
    name: 'Corian Solid Surface (Seamless Jointing)',
    ratePerSqFt: 820,
    mouldingPerRft: 350,
    desc: 'Seamless thermoformed joints, integrated sinks, and non-porous repairable surface.'
  }
};

// Hardware motion tiers
const HARDWARE_CONFIG = {
  standard_ebco: {
    name: 'Standard Soft-Close (Ebco / Godrej / Ozone)',
    multiplier: 1.00,
    drawerRunnerRate: 1400,
    desc: 'Reliable soft-close auto concealed hinges and standard telescopic ball-bearing channels.'
  },
  premium_hettich: {
    name: 'Premium German Tandem Box (Hettich InnoTech / Hafele Matrix)',
    multiplier: 1.12,
    drawerRunnerRate: 2600,
    desc: 'Double-walled steel drawer sides, 30kg load capacity, synchronized silent motion.'
  },
  luxury_blum: {
    name: 'Luxury Austrian Motion (Blum LEGRABOX / Aventos HF)',
    multiplier: 1.25,
    drawerRunnerRate: 4200,
    desc: 'Ultra-slim 12.8mm metallic drawers, Aventos bi-fold lift-ups, and feather-light touch motion.'
  }
};

// Theme presets for 2D visualizer
const THEMES: Record<VisualizerTheme, { name: string; baseBg: string; wallBg: string; loftBg: string; counterBg: string; accentColor: string; handleColor: string }> = {
  white_gold: {
    name: 'Pearl White & Champagne Gold',
    baseBg: '#F8FAFC',
    wallBg: '#FFFFFF',
    loftBg: '#F1F5F9',
    counterBg: '#1E293B',
    accentColor: '#D97706',
    handleColor: '#F59E0B'
  },
  charcoal_slate: {
    name: 'Matte Charcoal & Carbon',
    baseBg: '#334155',
    wallBg: '#1E293B',
    loftBg: '#0F172A',
    counterBg: '#E2E8F0',
    accentColor: '#0EA5E9',
    handleColor: '#64748B'
  },
  emerald_brass: {
    name: 'Emerald Forest & Brushed Brass',
    baseBg: '#064E3B',
    wallBg: '#047857',
    loftBg: '#064E3B',
    counterBg: '#F8FAFC',
    accentColor: '#FBBF24',
    handleColor: '#F59E0B'
  },
  walnut_cream: {
    name: 'Warm Walnut Wood & Ivory',
    baseBg: '#78350F',
    wallBg: '#FEF3C7',
    loftBg: '#92400E',
    counterBg: '#1C1917',
    accentColor: '#D97706',
    handleColor: '#B45309'
  },
  navy_bronze: {
    name: 'Midnight Navy & Rose Gold',
    baseBg: '#1E3A8A',
    wallBg: '#172554',
    loftBg: '#0F172A',
    counterBg: '#F1F5F9',
    accentColor: '#FB7185',
    handleColor: '#F43F5E'
  },
  scandinavian_oak: {
    name: 'Scandinavian Oak & Matte White',
    baseBg: '#D97706',
    wallBg: '#FFFFFF',
    loftBg: '#FEF3C7',
    counterBg: '#334155',
    accentColor: '#10B981',
    handleColor: '#6B7280'
  }
};

export default function ModularKitchenCostCalculator() {
  // --- STATE HOOKS ---
  // Unit & Layout
  const [unit, setUnit] = useState<'feet' | 'meters'>('feet');
  const [shape, setShape] = useState<KitchenShape>('l_shaped');

  // Dimensions
  const [straightLen, setStraightLen] = useState<number>(10);
  const [wallA, setWallA] = useState<number>(10); // L / U shape Wall 1
  const [wallB, setWallB] = useState<number>(7);  // L / U shape Wall 2
  const [wallC, setWallC] = useState<number>(8);  // U shape Wall 3
  const [parallelLen1, setParallelLen1] = useState<number>(10);
  const [parallelLen2, setParallelLen2] = useState<number>(8);
  const [islandLen, setIslandLen] = useState<number>(6);
  const [islandWidth, setIslandWidth] = useState<number>(3);

  // Overhead Lofts & Tall Units
  const [includeLoft, setIncludeLoft] = useState<boolean>(true);
  const [loftHeight, setLoftHeight] = useState<number>(2.0); // Feet
  const [tallUnits, setTallUnits] = useState<number>(1); // Count of 2ft × 7ft pantry towers

  // Materials & Hardware
  const [carcassMaterial, setCarcassMaterial] = useState<CarcassMaterial>('bwp_marine');
  const [shutterFinish, setShutterFinish] = useState<ShutterFinish>('high_gloss_acrylic');
  const [countertop, setCountertop] = useState<CountertopType>('engineered_quartz');
  const [hardware, setHardware] = useState<HardwareBrand>('premium_hettich');

  // Smart Storage Organizers (BOQ Items)
  const [tandemDrawerCount, setTandemDrawerCount] = useState<number>(4);
  const [bottlePulloutCount, setBottlePulloutCount] = useState<number>(1);
  const [cornerSolution, setCornerSolution] = useState<'none' | 'lemans_trays' | 'magic_corner' | 'lazy_susan'>('lemans_trays');
  const [tallPantryMechanism, setTallPantryMechanism] = useState<boolean>(true);
  const [underSinkOrganizer, setUnderSinkOrganizer] = useState<boolean>(true);
  const [bifoldLiftupCount, setBifoldLiftupCount] = useState<number>(2);
  const [includeLedProfileLights, setIncludeLedProfileLights] = useState<boolean>(true);
  const [includeTambourShutter, setIncludeTambourShutter] = useState<boolean>(false);
  const [wickerBasketCount] = useState<number>(1);

  // Appliances & Sanitary Package (Optional)
  const [includeChimney, setIncludeChimney] = useState<boolean>(true);
  const [chimneyType, setChimneyType] = useState<'filterless_60' | 'autoclean_90' | 'island_hood'>('autoclean_90');
  const [includeHob, setIncludeHob] = useState<boolean>(true);
  const [hobType, setHobType] = useState<'brass_3burner' | 'brass_4burner'>('brass_3burner');
  const [includeSinkTap, setIncludeSinkTap] = useState<boolean>(true);
  const [sinkType, setSinkType] = useState<'ss_handmade' | 'quartz_granite'>('quartz_granite');
  const [includeBuiltInOven, setIncludeBuiltInOven] = useState<boolean>(false);
  const [includeDishwasher, setIncludeDishwasher] = useState<boolean>(false);

  // Commercials & Taxes
  const [includeInstallation] = useState<boolean>(true);
  const [includeGst, setIncludeGst] = useState<boolean>(true);
  const [customDiscountPercent, setCustomDiscountPercent] = useState<number>(0);

  // Visualizer Settings
  const [activeTheme, setActiveTheme] = useState<VisualizerTheme>('white_gold');
  const [ledGlowActive, setLedGlowActive] = useState<boolean>(true);

  // UI state
  const [copied, setCopied] = useState<boolean>(false);
  const [savedQuotes, setSavedQuotes] = useState<SavedKitchenQuote[]>([]);
  const [quoteName, setQuoteName] = useState<string>('My Dream Kitchen Quote');
  const [activeTab, setActiveTab] = useState<'config' | 'organizers' | 'appliances' | 'boq'>('config');

  // Load Saved Quotes
  useEffect(() => {
    try {
      const stored = localStorage.getItem('toolique_kitchen_quotes');
      if (stored) setSavedQuotes(JSON.parse(stored));
    } catch {}
  }, []);

  // Multiplier for meters
  const lengthMultiplier = unit === 'meters' ? 3.28084 : 1;

  // --- MATHEMATICAL & ARCHITECTURAL ENGINE ---
  const calculations = useMemo(() => {
    // 1. Calculate Base Counter Running Length (Feet)
    let baseRunningFt = 0;
    if (shape === 'straight') {
      baseRunningFt = straightLen * lengthMultiplier;
    } else if (shape === 'l_shaped') {
      // Deduct 2ft corner overlap
      baseRunningFt = Math.max(4, (wallA + wallB - 2) * lengthMultiplier);
    } else if (shape === 'parallel') {
      baseRunningFt = (parallelLen1 + parallelLen2) * lengthMultiplier;
    } else if (shape === 'u_shaped') {
      // Deduct two 2ft corner overlaps = 4ft
      baseRunningFt = Math.max(6, (wallA + wallB + wallC - 4) * lengthMultiplier);
    } else if (shape === 'island') {
      baseRunningFt = (straightLen + islandLen) * lengthMultiplier;
    }

    // 2. Wall Overhead Cabinets Length
    // Wall cabinets typically cover 80% to 85% of base run (leaving space for chimney hood / window)
    const tallUnitsOccupiedFt = tallUnits * 2; // 2ft wide each
    const wallRunningFt = Math.max(0, (baseRunningFt - tallUnitsOccupiedFt) * 0.85);

    // 3. Overhead Loft Length
    const loftRunningFt = includeLoft ? Math.max(0, baseRunningFt) : 0;
    const effectiveLoftHeightFt = loftHeight * lengthMultiplier;

    // 4. Square Footage of Front Facades (Standard Heights: Base = 2.83ft (34"), Wall = 2.5ft (30"))
    const baseAreaSqFt = baseRunningFt * 2.83;
    const wallAreaSqFt = wallRunningFt * 2.5;
    const loftAreaSqFt = includeLoft ? loftRunningFt * effectiveLoftHeightFt : 0;
    const tallUnitAreaSqFt = tallUnits * (2 * 7); // 14 sq ft per unit

    const totalWoodworkAreaSqFt = baseAreaSqFt + wallAreaSqFt + loftAreaSqFt + tallUnitAreaSqFt;

    // 5. Carcass Base Rate + Shutter Finish Premium
    const carcassInfo = CARCASS_CONFIG[carcassMaterial];
    const finishInfo = FINISH_CONFIG[shutterFinish];
    const hardwareInfo = HARDWARE_CONFIG[hardware];

    // Effective Carcass & Shutter Rates per Sq Ft
    const effectiveBaseRateSqFt = (carcassInfo.baseRateSqFt + finishInfo.premiumPerSqFt) * hardwareInfo.multiplier;
    const effectiveWallRateSqFt = (carcassInfo.baseRateSqFt * 0.90 + finishInfo.premiumPerSqFt) * hardwareInfo.multiplier;
    const effectiveLoftRateSqFt = (carcassInfo.baseRateSqFt * 0.70 + finishInfo.premiumPerSqFt) * hardwareInfo.multiplier;
    const effectiveTallRateSqFt = (carcassInfo.baseRateSqFt * 1.05 + finishInfo.premiumPerSqFt) * hardwareInfo.multiplier;

    // Total Cabinetry Base Costs
    const baseCabinetsCost = baseAreaSqFt * effectiveBaseRateSqFt;
    const wallCabinetsCost = wallAreaSqFt * effectiveWallRateSqFt;
    const loftCabinetsCost = loftAreaSqFt * effectiveLoftRateSqFt;
    const tallUnitsCost = tallUnitAreaSqFt * effectiveTallRateSqFt;
    const totalCabinetryCost = baseCabinetsCost + wallCabinetsCost + loftCabinetsCost + tallUnitsCost;

    // 6. Countertop Slab & Fabrication
    const counterConfig = COUNTERTOP_CONFIG[countertop];
    // Countertop depth standard = 2.2ft (26 inches)
    const countertopAreaSqFt = (shape === 'island' 
      ? (straightLen * 2.2 + islandLen * islandWidth) 
      : baseRunningFt * 2.2) * lengthMultiplier;
    const countertopLengthRft = baseRunningFt;

    const countertopMaterialCost = countertopAreaSqFt * counterConfig.ratePerSqFt;
    const countertopMouldingCost = countertopLengthRft * counterConfig.mouldingPerRft;
    const sinkCutoutCost = countertop !== 'none' ? 1800 : 0; // Cutout & edge chamfering
    const totalCountertopCost = countertopMaterialCost + countertopMouldingCost + sinkCutoutCost;

    // 7. Internal Storage Organizers & Hardware Accessories
    const tandemDrawersCost = tandemDrawerCount * hardwareInfo.drawerRunnerRate;
    const bottlePulloutCost = bottlePulloutCount * 3800; // 2-tier / 3-tier SS bottle rack
    
    let cornerCost = 0;
    if (cornerSolution === 'lemans_trays') cornerCost = 14500;
    else if (cornerSolution === 'magic_corner') cornerCost = 18500;
    else if (cornerSolution === 'lazy_susan') cornerCost = 7500;

    const tallPantryMechanismCost = (tallUnits > 0 && tallPantryMechanism) ? tallUnits * 16500 : 0;
    const underSinkCost = underSinkOrganizer ? 4800 : 0; // Waste dual bins + detergent pullout
    const bifoldLiftupsCost = bifoldLiftupCount * (hardware === 'luxury_blum' ? 9500 : 4500); // Blum Aventos HF vs Gas lift
    const ledProfileLightsCost = includeLedProfileLights ? Math.ceil(wallRunningFt) * 450 + 1800 : 0; // ₹450/rft + 100W SMPS Driver
    const tambourShutterCost = includeTambourShutter ? 14500 : 0;
    const wickerBasketsCost = wickerBasketCount * 3200;

    const totalOrganizersCost = 
      tandemDrawersCost + 
      bottlePulloutCost + 
      cornerCost + 
      tallPantryMechanismCost + 
      underSinkCost + 
      bifoldLiftupsCost + 
      ledProfileLightsCost + 
      tambourShutterCost + 
      wickerBasketsCost;

    // 8. Appliances & Sanitary Package
    let chimneyCost = 0;
    if (includeChimney) {
      if (chimneyType === 'filterless_60') chimneyCost = 14500;
      else if (chimneyType === 'autoclean_90') chimneyCost = 22500;
      else if (chimneyType === 'island_hood') chimneyCost = 42000;
    }

    let hobCost = 0;
    if (includeHob) {
      if (hobType === 'brass_3burner') hobCost = 13500;
      else if (hobType === 'brass_4burner') hobCost = 18500;
    }

    let sinkTapCost = 0;
    if (includeSinkTap) {
      if (sinkType === 'ss_handmade') sinkTapCost = 9500 + 4200; // Sink + Pullout tap
      else if (sinkType === 'quartz_granite') sinkTapCost = 14500 + 5500; // Quartz sink + tap
    }

    const ovenCost = includeBuiltInOven ? 38500 : 0;
    const dishwasherCost = includeDishwasher ? 42000 : 0;

    const totalAppliancesCost = chimneyCost + hobCost + sinkTapCost + ovenCost + dishwasherCost;

    // 9. Labor, Assembly & PUR Edge-Banding
    const modularSubtotal = totalCabinetryCost + totalCountertopCost + totalOrganizersCost;
    const installationLaborCost = includeInstallation ? modularSubtotal * 0.10 : 0; // 10% Onsite installation & calibration

    const preDiscountTotal = modularSubtotal + totalAppliancesCost + installationLaborCost;
    const discountAmount = (preDiscountTotal * customDiscountPercent) / 100;
    const discountedTotal = preDiscountTotal - discountAmount;

    const gstAmount = includeGst ? discountedTotal * 0.18 : 0;
    const grandTotal = discountedTotal + gstAmount;

    const effectiveRatePerRft = baseRunningFt > 0 ? Math.round(grandTotal / baseRunningFt) : 0;
    const effectiveRatePerSqFt = totalWoodworkAreaSqFt > 0 ? Math.round((totalCabinetryCost + totalOrganizersCost) / totalWoodworkAreaSqFt) : 0;

    return {
      baseRunningFt: Number(baseRunningFt.toFixed(1)),
      wallRunningFt: Number(wallRunningFt.toFixed(1)),
      loftRunningFt: Number(loftRunningFt.toFixed(1)),
      countertopAreaSqFt: Number(countertopAreaSqFt.toFixed(1)),
      totalWoodworkAreaSqFt: Number(totalWoodworkAreaSqFt.toFixed(1)),
      // Itemized Costs
      baseCabinetsCost: Math.round(baseCabinetsCost),
      wallCabinetsCost: Math.round(wallCabinetsCost),
      loftCabinetsCost: Math.round(loftCabinetsCost),
      tallUnitsCost: Math.round(tallUnitsCost),
      totalCabinetryCost: Math.round(totalCabinetryCost),
      // Countertop
      countertopMaterialCost: Math.round(countertopMaterialCost),
      countertopMouldingCost: Math.round(countertopMouldingCost),
      totalCountertopCost: Math.round(totalCountertopCost),
      // Organizers
      tandemDrawersCost: Math.round(tandemDrawersCost),
      bottlePulloutCost: Math.round(bottlePulloutCost),
      cornerCost: Math.round(cornerCost),
      tallPantryMechanismCost: Math.round(tallPantryMechanismCost),
      underSinkCost: Math.round(underSinkCost),
      bifoldLiftupsCost: Math.round(bifoldLiftupsCost),
      ledProfileLightsCost: Math.round(ledProfileLightsCost),
      tambourShutterCost: Math.round(tambourShutterCost),
      wickerBasketsCost: Math.round(wickerBasketsCost),
      totalOrganizersCost: Math.round(totalOrganizersCost),
      // Appliances
      chimneyCost: Math.round(chimneyCost),
      hobCost: Math.round(hobCost),
      sinkTapCost: Math.round(sinkTapCost),
      ovenCost: Math.round(ovenCost),
      dishwasherCost: Math.round(dishwasherCost),
      totalAppliancesCost: Math.round(totalAppliancesCost),
      // Commercials
      installationLaborCost: Math.round(installationLaborCost),
      preDiscountTotal: Math.round(preDiscountTotal),
      discountAmount: Math.round(discountAmount),
      discountedTotal: Math.round(discountedTotal),
      gstAmount: Math.round(gstAmount),
      grandTotal: Math.round(grandTotal),
      effectiveRatePerRft,
      effectiveRatePerSqFt
    };
  }, [
    shape, straightLen, wallA, wallB, wallC, parallelLen1, parallelLen2, islandLen, islandWidth,
    includeLoft, loftHeight, tallUnits, carcassMaterial, shutterFinish, countertop, hardware,
    tandemDrawerCount, bottlePulloutCount, cornerSolution, tallPantryMechanism, underSinkOrganizer,
    bifoldLiftupCount, includeLedProfileLights, includeTambourShutter, wickerBasketCount,
    includeChimney, chimneyType, includeHob, hobType, includeSinkTap, sinkType, includeBuiltInOven, includeDishwasher,
    includeInstallation, includeGst, customDiscountPercent, lengthMultiplier
  ]);

  // Apply layout preset
  const applyPreset = (preset: typeof LAYOUT_PRESETS[0]) => {
    setShape(preset.shape);
    setStraightLen(preset.straightLen);
    setWallA(preset.wallA);
    setWallB(preset.wallB);
    setWallC(preset.wallC);
    setParallelLen1(preset.parallelLen1);
    setParallelLen2(preset.parallelLen2);
    setIslandLen(preset.islandLen);
    setIslandWidth(preset.islandWidth);
    setIncludeLoft(preset.includeLoft);
    setLoftHeight(preset.loftHeight);
    setTallUnits(preset.tallUnits);
    setCarcassMaterial(preset.carcass);
    setShutterFinish(preset.finish);
    setCountertop(preset.countertop);
    setHardware(preset.hardware);
  };

  // Reset to default
  const handleReset = () => {
    applyPreset(LAYOUT_PRESETS[1]); // 2BHK L-Shape default
    setCustomDiscountPercent(0);
    setTandemDrawerCount(4);
    setBottlePulloutCount(1);
    setCornerSolution('lemans_trays');
    setIncludeChimney(true);
    setIncludeHob(true);
    setIncludeSinkTap(true);
    setIncludeBuiltInOven(false);
    setIncludeDishwasher(false);
  };

  // Save quote to localStorage
  const saveCurrentQuote = () => {
    const newQuote: SavedKitchenQuote = {
      id: Date.now().toString(),
      name: quoteName.trim() || 'Custom Kitchen Estimate',
      shape,
      finish: shutterFinish,
      totalCost: calculations.grandTotal,
      totalRunningFt: calculations.baseRunningFt,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    };
    const updated = [newQuote, ...savedQuotes.slice(0, 7)];
    setSavedQuotes(updated);
    try {
      localStorage.setItem('toolique_kitchen_quotes', JSON.stringify(updated));
    } catch {}
  };

  // Delete saved quote
  const deleteSavedQuote = (id: string) => {
    const updated = savedQuotes.filter(q => q.id !== id);
    setSavedQuotes(updated);
    try {
      localStorage.setItem('toolique_kitchen_quotes', JSON.stringify(updated));
    } catch {}
  };

  // Copy Quotation to Clipboard
  const copyReport = () => {
    const unitLabel = unit === 'feet' ? 'ft' : 'm';
    const text = `🍽️ MODULAR KITCHEN ESTIMATION SUMMARY (Toolique Studio)
--------------------------------------------------
Layout Style      : ${shape.toUpperCase().replace('_', '-')} (${calculations.baseRunningFt} Rft)
Carcass Body Box  : ${CARCASS_CONFIG[carcassMaterial].name}
Shutter Facade    : ${FINISH_CONFIG[shutterFinish].name}
Countertop Slab   : ${COUNTERTOP_CONFIG[countertop].name}
Motion Hardware   : ${HARDWARE_CONFIG[hardware].name}
Tall Pantry Towers: ${tallUnits} Unit(s) | Overhead Loft: ${includeLoft ? `YES (${loftHeight} ${unitLabel})` : 'NO'}
--------------------------------------------------
ITEMIZED BILL OF QUANTITIES (BOQ):
• Base Cabinets (Drawers/Boxes)   : ₹${calculations.baseCabinetsCost.toLocaleString('en-IN')}
• Wall Overhead Storage Units    : ₹${calculations.wallCabinetsCost.toLocaleString('en-IN')}
• Overhead Ceiling-Touch Lofts    : ₹${calculations.loftCabinetsCost.toLocaleString('en-IN')}
• Tall Appliance/Pantry Towers    : ₹${calculations.tallUnitsCost.toLocaleString('en-IN')}
• Countertop Slab & Fabrication  : ₹${calculations.totalCountertopCost.toLocaleString('en-IN')}
• Smart Storage & Hardware       : ₹${calculations.totalOrganizersCost.toLocaleString('en-IN')}
• Built-in Appliances & Sinks    : ₹${calculations.totalAppliancesCost.toLocaleString('en-IN')}
• Factory PUR & Site Assembly    : ₹${calculations.installationLaborCost.toLocaleString('en-IN')}
--------------------------------------------------
Subtotal Before Taxes            : ₹${calculations.discountedTotal.toLocaleString('en-IN')}
GST (18% Modular Works)          : ₹${calculations.gstAmount.toLocaleString('en-IN')}
--------------------------------------------------
GRAND TOTAL QUOTE                : ₹${calculations.grandTotal.toLocaleString('en-IN')}
Effective Rate per Running Foot  : ₹${calculations.effectiveRatePerRft.toLocaleString('en-IN')} / Rft
Effective Rate per Woodwork Sq Ft: ₹${calculations.effectiveRatePerSqFt.toLocaleString('en-IN')} / Sq Ft
--------------------------------------------------
Generated via Toolique Interior Engineering Suite.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate Professional PDF Quotation
  const generatePdfQuote = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Brand Header
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 38, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('TOOLIQUE ARCHITECTURAL INTERIORS', 14, 18);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225);
    doc.text('Modular Kitchen Engineering Specification & BOQ Estimate', 14, 25);
    doc.text(`Generated Date: ${new Date().toLocaleDateString('en-IN')} | Ref: TLI-KIT-${Date.now().toString().slice(-6)}`, 14, 31);

    // Section 1: Specifications
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('1. Project & Technical Specifications', 14, 48);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);

    const specs = [
      ['Layout Shape', `${shape.toUpperCase().replace('_', '-')} (${calculations.baseRunningFt} Running Feet)`],
      ['Carcass Body Box', CARCASS_CONFIG[carcassMaterial].name],
      ['Shutter Finish', FINISH_CONFIG[shutterFinish].name],
      ['Countertop Slab', COUNTERTOP_CONFIG[countertop].name],
      ['Hardware & Motion', HARDWARE_CONFIG[hardware].name],
      ['Overhead Lofts', includeLoft ? `Included (${loftHeight} ft Height)` : 'Not Included'],
      ['Pantry Tall Units', `${tallUnits} Unit(s) (2ft × 7ft)`]
    ];

    let yPos = 55;
    specs.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, 14, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 60, yPos);
      yPos += 6;
    });

    // Section 2: Bill of Quantities Table
    yPos += 4;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('2. Detailed Bill of Quantities (BOQ)', 14, yPos);

    yPos += 6;
    doc.setFillColor(241, 245, 249);
    doc.rect(14, yPos, pageWidth - 28, 7, 'F');
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Item Description', 18, yPos + 5);
    doc.text('Scope / Qty', 115, yPos + 5);
    doc.text('Amount (INR)', pageWidth - 20, yPos + 5, { align: 'right' });

    yPos += 7;
    const boqItems = [
      ['Base Cabinets (Drawers, Carcass & Shutters)', `${calculations.baseRunningFt} Rft`, `Rs. ${calculations.baseCabinetsCost.toLocaleString('en-IN')}`],
      ['Wall Overhead Cabinets (Single/Lift-up)', `${calculations.wallRunningFt} Rft`, `Rs. ${calculations.wallCabinetsCost.toLocaleString('en-IN')}`],
      ['Overhead Ceiling-Touch Lofts', includeLoft ? `${calculations.loftRunningFt} Rft` : 'N/A', `Rs. ${calculations.loftCabinetsCost.toLocaleString('en-IN')}`],
      ['Tall Pantry / Appliance Towers', `${tallUnits} Units`, `Rs. ${calculations.tallUnitsCost.toLocaleString('en-IN')}`],
      ['Countertop Slab, Bullnose Moulding & Cutouts', `${calculations.countertopAreaSqFt} Sq Ft`, `Rs. ${calculations.totalCountertopCost.toLocaleString('en-IN')}`],
      ['Smart Organizers (Tandems, Pullouts, Corners)', `${tandemDrawerCount} Drawers + Addons`, `Rs. ${calculations.totalOrganizersCost.toLocaleString('en-IN')}`],
      ['Appliances & Sanitary Fixtures Suite', 'Chimney, Hob & Sink', `Rs. ${calculations.totalAppliancesCost.toLocaleString('en-IN')}`],
      ['Factory PUR Edge-Banding & Site Assembly', 'Complete Fitting', `Rs. ${calculations.installationLaborCost.toLocaleString('en-IN')}`]
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);

    boqItems.forEach(([desc, qty, amt], index) => {
      if (index % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, yPos, pageWidth - 28, 6.5, 'F');
      }
      doc.text(desc, 18, yPos + 4.5);
      doc.text(qty, 115, yPos + 4.5);
      doc.text(amt, pageWidth - 20, yPos + 4.5, { align: 'right' });
      yPos += 6.5;
    });

    // Summary Totals
    yPos += 4;
    doc.setDrawColor(226, 232, 240);
    doc.line(14, yPos, pageWidth - 14, yPos);
    yPos += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Subtotal Before Taxes:', 115, yPos);
    doc.text(`Rs. ${calculations.discountedTotal.toLocaleString('en-IN')}`, pageWidth - 20, yPos, { align: 'right' });

    yPos += 6;
    doc.text('GST (18% Modular Works):', 115, yPos);
    doc.text(`Rs. ${calculations.gstAmount.toLocaleString('en-IN')}`, pageWidth - 20, yPos, { align: 'right' });

    yPos += 7;
    doc.setFillColor(236, 72, 153); // pink-600
    doc.rect(110, yPos - 5, pageWidth - 124, 9, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('GRAND TOTAL:', 115, yPos + 1.5);
    doc.text(`Rs. ${calculations.grandTotal.toLocaleString('en-IN')}`, pageWidth - 20, yPos + 1.5, { align: 'right' });

    // Footer & Terms
    yPos = 265;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text('Standards & Compliance Notes:', 14, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('• All carcass boxes factory-processed with 1.0mm/2.0mm hot-melt PUR edge-banding for moisture protection.', 14, yPos + 4.5);
    doc.text('• BWP Grade Marine Plywood conforms to IS:710 standards with boiling waterproof test compliance.', 14, yPos + 8.5);
    doc.text('• Final pricing subject to actual laser site measurements and civil plumbing / electrical alignment.', 14, yPos + 12.5);

    doc.save(`Toolique_Modular_Kitchen_Quote_${Date.now().toString().slice(-6)}.pdf`);
  };

  const currentTheme = THEMES[activeTheme];
  const unitSuffix = unit === 'feet' ? 'ft' : 'm';

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-left">
      {/* Top Header Card */}
      <div className="p-6 rounded-3xl bg-linear-to-r from-pink-900/40 via-purple-900/30 to-slate-900/50 border border-pink-500/20 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="p-2 rounded-xl bg-pink-600/20 text-pink-400 border border-pink-500/30">
                <Palette className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-500/10 text-pink-400 border border-pink-500/20 tracking-wide uppercase">
                2026 Modular Interior Suite
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Modular Kitchen Cost Calculator & 2D Studio
            </h1>
            <p className="text-xs lg:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Architectural BOQ estimator supporting L-Shape, Parallel, Straight, U-Shape & Island layouts with BWP Marine Ply, Acrylic, Quartz, Hettich/Blum hardware, and 2D elevation visualizer.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 bg-white/60 dark:bg-slate-900/80 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Estimated Quote</span>
              <span className="text-xl font-black text-pink-600 dark:text-pink-400 font-mono">
                ₹{calculations.grandTotal.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Running Span</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono">
                {calculations.baseRunningFt} {unitSuffix}
              </span>
            </div>
          </div>
        </div>

        {/* Layout Presets Fast-Bar */}
        <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              Quick Layout Presets:
            </span>
            <span className="text-[11px] text-slate-600 dark:text-slate-400">Click to auto-populate layout and materials</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {LAYOUT_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => applyPreset(p)}
                className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/40 dark:bg-slate-900/50 hover:border-pink-500/50 hover:bg-pink-500/5 text-left transition group"
              >
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-pink-600 dark:group-hover:text-pink-400 truncate">
                  {p.name}
                </div>
                <div className="text-[10px] text-slate-600 dark:text-slate-400 truncate mt-0.5">
                  {p.desc}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Controls + Visualizer + Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Tabbed Configurator (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Tab Navigation */}
          <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-900/90 p-1 border border-slate-200/80 dark:border-slate-800">
            {[
              { id: 'config', label: '1. Layout & Core', icon: Layers },
              { id: 'organizers', label: '2. Smart Organizers', icon: Box },
              { id: 'appliances', label: '3. Appliances', icon: Flame },
              { id: 'boq', label: '4. Full BOQ', icon: Sliders }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-slate-800 text-pink-600 dark:text-pink-400 shadow-sm'
                      : 'text-slate-655 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[1]}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: Layout & Core Configuration */}
          {activeTab === 'config' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-5">
              {/* Unit & Reset Bar */}
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800/60">
                <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                  <Palette className="w-4 h-4 text-pink-500" />
                  Kitchen Layout & Material Matrix
                </h3>
                <div className="flex items-center gap-2">
                  <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-bold">
                    <button
                      onClick={() => setUnit('feet')}
                      className={`px-2.5 py-1 rounded-md transition ${unit === 'feet' ? 'bg-white dark:bg-slate-700 text-pink-600 shadow-xs' : 'text-slate-655 dark:text-slate-400'}`}
                    >
                      Feet (ft)
                    </button>
                    <button
                      onClick={() => setUnit('meters')}
                      className={`px-2.5 py-1 rounded-md transition ${unit === 'meters' ? 'bg-white dark:bg-slate-700 text-pink-600 shadow-xs' : 'text-slate-655 dark:text-slate-400'}`}
                    >
                      Meters (m)
                    </button>
                  </div>
                  <button
                    onClick={handleReset}
                    className="p-1.5 rounded-lg text-slate-655 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Reset to Defaults"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 1. Kitchen Shape Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  A. Select Kitchen Layout Architecture
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'straight', label: 'Straight Line', desc: 'Single Wall' },
                    { id: 'l_shaped', label: 'L-Shaped', desc: 'Dual Wall' },
                    { id: 'parallel', label: 'Parallel', desc: 'Galley Walkway' },
                    { id: 'u_shaped', label: 'U-Shaped', desc: '3-Side Wrap' },
                    { id: 'island', label: 'Island Kitchen', desc: 'Open Breakfast' }
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setShape(s.id as KitchenShape)}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        shape === s.id
                          ? 'border-pink-500 bg-pink-500/10 text-pink-600 dark:text-pink-400 font-bold shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="text-xs font-bold">{s.label}</div>
                      <div className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Shape-Specific Dimensions */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 space-y-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  B. Counter Dimensions & Wall Spans ({unitSuffix})
                </span>

                {shape === 'straight' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Counter Length ({unitSuffix})
                    </label>
                    <input
                      type="number"
                      min={4}
                      max={25}
                      step={0.5}
                      value={straightLen || ''}
                      onChange={(e) => setStraightLen(Math.max(4, parseFloat(e.target.value) || 0))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-800 dark:text-white focus:border-pink-500 focus:outline-hidden"
                    />
                  </div>
                )}

                {shape === 'l_shaped' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Wall A (Cooking / Hob Wall) ({unitSuffix})
                      </label>
                      <input
                        type="number"
                        min={4}
                        max={25}
                        step={0.5}
                        value={wallA || ''}
                        onChange={(e) => setWallA(Math.max(4, parseFloat(e.target.value) || 0))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-800 dark:text-white focus:border-pink-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Wall B (Sink / Prep Wall) ({unitSuffix})
                      </label>
                      <input
                        type="number"
                        min={4}
                        max={25}
                        step={0.5}
                        value={wallB || ''}
                        onChange={(e) => setWallB(Math.max(4, parseFloat(e.target.value) || 0))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-800 dark:text-white focus:border-pink-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                )}

                {shape === 'parallel' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Counter 1 (Cooking Hob Run) ({unitSuffix})
                      </label>
                      <input
                        type="number"
                        min={4}
                        max={25}
                        step={0.5}
                        value={parallelLen1 || ''}
                        onChange={(e) => setParallelLen1(Math.max(4, parseFloat(e.target.value) || 0))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-800 dark:text-white focus:border-pink-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Counter 2 (Sink & Prep Run) ({unitSuffix})
                      </label>
                      <input
                        type="number"
                        min={4}
                        max={25}
                        step={0.5}
                        value={parallelLen2 || ''}
                        onChange={(e) => setParallelLen2(Math.max(4, parseFloat(e.target.value) || 0))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-800 dark:text-white focus:border-pink-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                )}

                {shape === 'u_shaped' && (
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Left Wall A ({unitSuffix})
                      </label>
                      <input
                        type="number"
                        min={4}
                        max={25}
                        step={0.5}
                        value={wallA || ''}
                        onChange={(e) => setWallA(Math.max(4, parseFloat(e.target.value) || 0))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-800 dark:text-white focus:border-pink-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Center Wall B ({unitSuffix})
                      </label>
                      <input
                        type="number"
                        min={4}
                        max={25}
                        step={0.5}
                        value={wallB || ''}
                        onChange={(e) => setWallB(Math.max(4, parseFloat(e.target.value) || 0))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-800 dark:text-white focus:border-pink-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Right Wall C ({unitSuffix})
                      </label>
                      <input
                        type="number"
                        min={4}
                        max={25}
                        step={0.5}
                        value={wallC || ''}
                        onChange={(e) => setWallC(Math.max(4, parseFloat(e.target.value) || 0))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-800 dark:text-white focus:border-pink-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                )}

                {shape === 'island' && (
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Main Wall ({unitSuffix})
                      </label>
                      <input
                        type="number"
                        min={6}
                        max={30}
                        step={0.5}
                        value={straightLen || ''}
                        onChange={(e) => setStraightLen(Math.max(6, parseFloat(e.target.value) || 0))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-800 dark:text-white focus:border-pink-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Island Length ({unitSuffix})
                      </label>
                      <input
                        type="number"
                        min={4}
                        max={12}
                        step={0.5}
                        value={islandLen || ''}
                        onChange={(e) => setIslandLen(Math.max(4, parseFloat(e.target.value) || 0))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-800 dark:text-white focus:border-pink-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Island Width ({unitSuffix})
                      </label>
                      <input
                        type="number"
                        min={2}
                        max={5}
                        step={0.5}
                        value={islandWidth || ''}
                        onChange={(e) => setIslandWidth(Math.max(2, parseFloat(e.target.value) || 0))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-800 dark:text-white focus:border-pink-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                )}

                {/* Lofts & Tall Pantry Towers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeLoft}
                          onChange={(e) => setIncludeLoft(e.target.checked)}
                          className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500"
                        />
                        Overhead Storage Loft
                      </label>
                      {includeLoft && (
                        <span className="text-[10px] font-bold text-pink-600 dark:text-pink-400">
                          {loftHeight} {unitSuffix} Height
                        </span>
                      )}
                    </div>
                    {includeLoft && (
                      <input
                        type="number"
                        min={1}
                        max={4}
                        step={0.2}
                        value={loftHeight || ''}
                        onChange={(e) => setLoftHeight(Math.max(1, parseFloat(e.target.value) || 0))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-xs font-semibold text-slate-800 dark:text-white focus:border-pink-500 focus:outline-hidden"
                      />
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Tall Pantry / Appliance Towers
                      </label>
                      <span className="text-[10px] font-bold text-slate-655 dark:text-slate-400">
                        {tallUnits} Unit(s) (2×7 ft)
                      </span>
                    </div>
                    <select
                      value={tallUnits}
                      onChange={(e) => setTallUnits(parseInt(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-xs font-semibold text-slate-800 dark:text-white focus:border-pink-500 focus:outline-hidden"
                    >
                      <option value={0} className="dark:bg-slate-900">0 Towers (None)</option>
                      <option value={1} className="dark:bg-slate-900">1 Tower (6-Tier Pullout / Oven)</option>
                      <option value={2} className="dark:bg-slate-900">2 Towers (Pantry + Built-in Casing)</option>
                      <option value={3} className="dark:bg-slate-900">3 Towers (Villa Luxury Suite)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. Core Carcass Material (IS Codes) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  C. Carcass Core Board (Cabinet Body Box)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(CARCASS_CONFIG).map(([key, val]) => (
                    <button
                      key={key}
                      onClick={() => setCarcassMaterial(key as CarcassMaterial)}
                      className={`p-3 rounded-xl border text-left transition ${
                        carcassMaterial === key
                          ? 'border-pink-500 bg-pink-500/10 text-pink-600 dark:text-pink-400 font-bold shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold truncate">{val.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-800 text-slate-655 dark:text-slate-300 font-mono">
                          ₹{val.baseRateSqFt}/sq ft
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                        {val.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Shutter Exterior Finish */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  D. Shutter Facade Exterior Finish
                </label>
                <select
                  value={shutterFinish}
                  onChange={(e) => setShutterFinish(e.target.value as ShutterFinish)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold text-slate-800 dark:text-white focus:border-pink-500 focus:outline-hidden"
                >
                  {Object.entries(FINISH_CONFIG).map(([key, val]) => (
                    <option key={key} value={key} className="dark:bg-slate-900">
                      {val.name} {val.premiumPerSqFt > 0 ? `(+₹${val.premiumPerSqFt}/sq ft)` : '(Baseline)'}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1.5">
                  {FINISH_CONFIG[shutterFinish].desc}
                </p>
              </div>

              {/* 5. Countertop Slab & Hardware Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    E. Kitchen Countertop Slab
                  </label>
                  <select
                    value={countertop}
                    onChange={(e) => setCountertop(e.target.value as CountertopType)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-white focus:border-pink-500 focus:outline-hidden"
                  >
                    {Object.entries(COUNTERTOP_CONFIG).map(([key, val]) => (
                      <option key={key} value={key} className="dark:bg-slate-900">
                        {val.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    F. Motion Hardware Brand
                  </label>
                  <select
                    value={hardware}
                    onChange={(e) => setHardware(e.target.value as HardwareBrand)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-white focus:border-pink-500 focus:outline-hidden"
                  >
                    {Object.entries(HARDWARE_CONFIG).map(([key, val]) => (
                      <option key={key} value={key} className="dark:bg-slate-900">
                        {val.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Smart Storage Organizers */}
          {activeTab === 'organizers' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800/60">
                <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                  <Box className="w-4 h-4 text-pink-500" />
                  Smart Modular Storage & Internal Hardware
                </h3>
                <span className="text-xs font-bold text-pink-600 dark:text-pink-400 font-mono">
                  +₹{calculations.totalOrganizersCost.toLocaleString('en-IN')} Total
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Tandem Drawers */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Tandem Box Drawers (Cutlery/Thali)
                    </span>
                    <span className="text-xs font-mono font-bold text-pink-600 dark:text-pink-400">
                      ₹{calculations.tandemDrawersCost.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[2, 4, 6, 8].map((count) => (
                      <button
                        key={count}
                        onClick={() => setTandemDrawerCount(count)}
                        className={`flex-1 py-1 rounded-lg text-xs font-bold border transition ${
                          tandemDrawerCount === count
                            ? 'border-pink-500 bg-pink-500/10 text-pink-600 dark:text-pink-400'
                            : 'border-slate-200 dark:border-slate-700 text-slate-655 dark:text-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        {count} Drawers
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bottle Pullouts */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Bottle & Spice Pull-Outs (150mm/200mm)
                    </span>
                    <span className="text-xs font-mono font-bold text-pink-600 dark:text-pink-400">
                      ₹{calculations.bottlePulloutCost.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[0, 1, 2].map((count) => (
                      <button
                        key={count}
                        onClick={() => setBottlePulloutCount(count)}
                        className={`flex-1 py-1 rounded-lg text-xs font-bold border transition ${
                          bottlePulloutCount === count
                            ? 'border-pink-500 bg-pink-500/10 text-pink-600 dark:text-pink-400'
                            : 'border-slate-200 dark:border-slate-700 text-slate-655 dark:text-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        {count === 0 ? 'None' : `${count} Unit`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Corner Solution */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Blind Corner Optimization
                    </span>
                    <span className="text-xs font-mono font-bold text-pink-600 dark:text-pink-400">
                      ₹{calculations.cornerCost.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <select
                    value={cornerSolution}
                    onChange={(e) => setCornerSolution(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-white"
                  >
                    <option value="none">None / Fixed Wooden Shelves (₹0)</option>
                    <option value="lazy_susan">Lazy Susan 360° Carousel (+₹7,500)</option>
                    <option value="lemans_trays">LeMans S-Corner Pull-Out Trays (+₹14,500)</option>
                    <option value="magic_corner">Universal Magic Corner 4-Basket (+₹18,500)</option>
                  </select>
                </div>

                {/* Bifold Lift-up Flaps */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Wall Bi-Fold Lift-Up Shutters
                    </span>
                    <span className="text-xs font-mono font-bold text-pink-600 dark:text-pink-400">
                      ₹{calculations.bifoldLiftupsCost.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[0, 1, 2, 4].map((count) => (
                      <button
                        key={count}
                        onClick={() => setBifoldLiftupCount(count)}
                        className={`flex-1 py-1 rounded-lg text-xs font-bold border transition ${
                          bifoldLiftupCount === count
                            ? 'border-pink-500 bg-pink-500/10 text-pink-600 dark:text-pink-400'
                            : 'border-slate-200 dark:border-slate-700 text-slate-655 dark:text-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        {count === 0 ? 'None' : `${count} Flaps`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Toggles List */}
              <div className="pt-2 space-y-2.5">
                {[
                  {
                    id: 'led',
                    label: 'Under-Cabinet Profile Warm LED Strip Lighting (with 100W Driver)',
                    checked: includeLedProfileLights,
                    cost: calculations.ledProfileLightsCost,
                    toggle: () => setIncludeLedProfileLights(!includeLedProfileLights)
                  },
                  {
                    id: 'undersink',
                    label: 'Under-Sink Detergent Pullout + Dual Dustbin Waste Sorter',
                    checked: underSinkOrganizer,
                    cost: calculations.underSinkCost,
                    toggle: () => setUnderSinkOrganizer(!underSinkOrganizer)
                  },
                  {
                    id: 'pantry_mech',
                    label: 'Tall Pantry 6-Tier Swing-Out Larder Basket System (if pantry active)',
                    checked: tallPantryMechanism && tallUnits > 0,
                    cost: calculations.tallPantryMechanismCost,
                    toggle: () => setTallPantryMechanism(!tallPantryMechanism)
                  },
                  {
                    id: 'tambour',
                    label: 'Appliance Garage with Acrylic/Glass Rolling Tambour Shutter',
                    checked: includeTambourShutter,
                    cost: calculations.tambourShutterCost,
                    toggle: () => setIncludeTambourShutter(!includeTambourShutter)
                  }
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={item.toggle}
                    className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between cursor-pointer hover:border-pink-500/40 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => {}}
                        className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500"
                      />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        {item.label}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
                      ₹{item.cost.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Appliances & Sanitary Package */}
          {activeTab === 'appliances' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800/60">
                <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                  <Flame className="w-4 h-4 text-pink-500" />
                  Appliances & Kitchen Sanitary Package
                </h3>
                <span className="text-xs font-bold text-pink-600 dark:text-pink-400 font-mono">
                  +₹{calculations.totalAppliancesCost.toLocaleString('en-IN')} Total
                </span>
              </div>

              {/* Chimney */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeChimney}
                      onChange={(e) => setIncludeChimney(e.target.checked)}
                      className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500"
                    />
                    Auto-Clean Kitchen Chimney Hood
                  </label>
                  <span className="text-xs font-mono font-bold text-pink-600 dark:text-pink-400">
                    ₹{calculations.chimneyCost.toLocaleString('en-IN')}
                  </span>
                </div>
                {includeChimney && (
                  <select
                    value={chimneyType}
                    onChange={(e) => setChimneyType(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-white"
                  >
                    <option value="filterless_60">60cm Filterless Motion Sensor (₹14,500)</option>
                    <option value="autoclean_90">90cm Thermal Auto-Clean 1500 m³/hr (₹22,500)</option>
                    <option value="island_hood">Island Ceiling-Suspended Luxury Hood (₹42,000)</option>
                  </select>
                )}
              </div>

              {/* Built-in Hob */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeHob}
                      onChange={(e) => setIncludeHob(e.target.checked)}
                      className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500"
                    />
                    Built-in Toughened Glass Gas Hob
                  </label>
                  <span className="text-xs font-mono font-bold text-pink-600 dark:text-pink-400">
                    ₹{calculations.hobCost.toLocaleString('en-IN')}
                  </span>
                </div>
                {includeHob && (
                  <select
                    value={hobType}
                    onChange={(e) => setHobType(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-white"
                  >
                    <option value="brass_3burner">3-Burner Italian Brass Burners (₹13,500)</option>
                    <option value="brass_4burner">4-Burner Heavy Duty Cast Iron Support (₹18,500)</option>
                  </select>
                )}
              </div>

              {/* Sink & Faucet */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeSinkTap}
                      onChange={(e) => setIncludeSinkTap(e.target.checked)}
                      className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500"
                    />
                    Kitchen Sink & High-Arc Mixer Tap
                  </label>
                  <span className="text-xs font-mono font-bold text-pink-600 dark:text-pink-400">
                    ₹{calculations.sinkTapCost.toLocaleString('en-IN')}
                  </span>
                </div>
                {includeSinkTap && (
                  <select
                    value={sinkType}
                    onChange={(e) => setSinkType(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-white"
                  >
                    <option value="ss_handmade">SS 304 Handmade Matte Sink + Pullout Spray Tap (₹13,700)</option>
                    <option value="quartz_granite">Carysil Engineered Quartz Sink + Designer Mixer (₹20,000)</option>
                  </select>
                )}
              </div>

              {/* Built-in Oven & Dishwasher */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setIncludeBuiltInOven(!includeBuiltInOven)}
                  className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between cursor-pointer hover:border-pink-500/40 transition"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={includeBuiltInOven}
                      onChange={() => {}}
                      className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500"
                    />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Built-in Oven Combo
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
                    ₹38,500
                  </span>
                </div>

                <div
                  onClick={() => setIncludeDishwasher(!includeDishwasher)}
                  className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between cursor-pointer hover:border-pink-500/40 transition"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={includeDishwasher}
                      onChange={() => {}}
                      className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500"
                    />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Built-in 14-Place Dishwasher
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
                    ₹42,000
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Commercials & Full BOQ Breakdown */}
          {activeTab === 'boq' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800/60">
                <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-pink-500" />
                  Itemized Bill of Quantities (BOQ)
                </h3>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  {calculations.totalWoodworkAreaSqFt} Sq Ft Total Woodwork
                </span>
              </div>

              {/* BOQ Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase text-[10px]">
                      <th className="py-2">Item Category</th>
                      <th className="py-2">Specification / Size</th>
                      <th className="py-2 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-700 dark:text-slate-300">
                    <tr>
                      <td className="py-2.5 font-bold">Base Cabinets Body</td>
                      <td className="py-2.5 text-slate-600 dark:text-slate-400">{calculations.baseRunningFt} Rft ({carcassMaterial})</td>
                      <td className="py-2.5 text-right font-mono font-bold">₹{calculations.baseCabinetsCost.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-bold">Wall Overhead Cabinets</td>
                      <td className="py-2.5 text-slate-600 dark:text-slate-400">{calculations.wallRunningFt} Rft ({shutterFinish})</td>
                      <td className="py-2.5 text-right font-mono font-bold">₹{calculations.wallCabinetsCost.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-bold">Overhead Ceiling Lofts</td>
                      <td className="py-2.5 text-slate-600 dark:text-slate-400">{includeLoft ? `${calculations.loftRunningFt} Rft (${loftHeight} ft ht)` : 'None'}</td>
                      <td className="py-2.5 text-right font-mono font-bold">₹{calculations.loftCabinetsCost.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-bold">Tall Pantry Towers</td>
                      <td className="py-2.5 text-slate-600 dark:text-slate-400">{tallUnits} Unit(s) (2ft × 7ft)</td>
                      <td className="py-2.5 text-right font-mono font-bold">₹{calculations.tallUnitsCost.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-bold">Countertop Slab & Moulding</td>
                      <td className="py-2.5 text-slate-600 dark:text-slate-400">{calculations.countertopAreaSqFt} sq ft ({countertop})</td>
                      <td className="py-2.5 text-right font-mono font-bold">₹{calculations.totalCountertopCost.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-bold">Hardware & Storage Organizers</td>
                      <td className="py-2.5 text-slate-600 dark:text-slate-400">{tandemDrawerCount} Tandems, Baskets & LEDs</td>
                      <td className="py-2.5 text-right font-mono font-bold">₹{calculations.totalOrganizersCost.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-bold">Appliances & Sanitary</td>
                      <td className="py-2.5 text-slate-600 dark:text-slate-400">Chimney, Hob & Sink Package</td>
                      <td className="py-2.5 text-right font-mono font-bold">₹{calculations.totalAppliancesCost.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-bold">Factory PUR & Site Fitting</td>
                      <td className="py-2.5 text-slate-600 dark:text-slate-400">10% Modular installation</td>
                      <td className="py-2.5 text-right font-mono font-bold">₹{calculations.installationLaborCost.toLocaleString('en-IN')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Commercials Adjustments */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Apply Promotional Discount (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={customDiscountPercent || ''}
                    onChange={(e) => setCustomDiscountPercent(Math.min(30, Math.max(0, parseInt(e.target.value) || 0)))}
                    placeholder="0"
                    className="w-16 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono font-bold text-slate-800 dark:text-white text-center"
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={includeGst}
                      onChange={(e) => setIncludeGst(e.target.checked)}
                      className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500"
                    />
                    Include 18% GST (Tax)
                  </label>
                  <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
                    ₹{calculations.gstAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: 2D Visualizer + Quote Output + Action Tools (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* 2D Architectural Visualizer Card */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800/60">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400">
                  <Eye className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white text-xs">
                  2D Architectural Elevation Studio
                </h3>
              </div>

              {/* LED Lighting Glow Toggle */}
              <button
                onClick={() => setLedGlowActive(!ledGlowActive)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                  ledGlowActive
                    ? 'border-amber-400 bg-amber-400/10 text-amber-500 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-655 dark:text-slate-400'
                }`}
              >
                <Zap className="w-3 h-3" />
                <span>{ledGlowActive ? 'LED Glow ON' : 'LED OFF'}</span>
              </button>
            </div>

            {/* SVG Visualizer Canvas */}
            <div className="relative rounded-2xl bg-slate-950 p-4 border border-slate-800 overflow-hidden shadow-inner flex items-center justify-center min-h-[220px]">
              <svg viewBox="0 0 400 240" className="w-full h-auto drop-shadow-md">
                <defs>
                  {/* Under cabinet LED warm glow filter */}
                  <filter id="ledGlowWarm" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <linearGradient id="warmLightBeam" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#FBBF24" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Background Wall Tiles */}
                <rect x="10" y="10" width="380" height="220" fill="#0F172A" rx="8" />
                <pattern id="tileGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1E293B" strokeWidth="0.5" />
                </pattern>
                <rect x="10" y="10" width="380" height="220" fill="url(#tileGrid)" />

                {/* 1. Overhead Lofts (Y: 20 to 55) */}
                {includeLoft && (
                  <g>
                    <rect x="25" y="20" width="280" height="35" fill={currentTheme.loftBg} stroke="#334155" strokeWidth="1" rx="2" />
                    <line x1="95" y1="20" x2="95" y2="55" stroke="#334155" strokeWidth="1" />
                    <line x1="165" y1="20" x2="165" y2="55" stroke="#334155" strokeWidth="1" />
                    <line x1="235" y1="20" x2="235" y2="55" stroke="#334155" strokeWidth="1" />
                    <text x="165" y="42" fill="#64748B" fontSize="8" fontWeight="bold" textAnchor="middle">
                      OVERHEAD LOFT STORAGE ({loftHeight} FT)
                    </text>
                  </g>
                )}

                {/* 2. Wall Cabinets (Y: 58 to 110) */}
                <g>
                  {/* Cabinet 1: Fluted Glass / Shutter */}
                  <rect x="25" y="58" width="65" height="52" fill={currentTheme.wallBg} stroke="#334155" strokeWidth="1" rx="2" />
                  <line x1="57.5" y1="58" x2="57.5" y2="110" stroke="#334155" strokeWidth="0.8" />
                  
                  {/* Chimney Hood Gap or Center Cabinet */}
                  {includeChimney ? (
                    <g>
                      <path d="M 125 58 L 145 58 L 155 85 L 115 85 Z" fill="#475569" />
                      <rect x="110" y="85" width="50" height="8" fill="#64748B" rx="1" />
                      <circle cx="135" cy="98" r="3" fill="#EF4444" opacity="0.8" />
                    </g>
                  ) : (
                    <rect x="95" y="58" width="80" height="52" fill={currentTheme.wallBg} stroke="#334155" strokeWidth="1" rx="2" />
                  )}

                  {/* Cabinet 3: Lift-Up Flap Unit */}
                  <rect x="180" y="58" width="125" height="52" fill={currentTheme.wallBg} stroke="#334155" strokeWidth="1" rx="2" />
                  <line x1="180" y1="84" x2="305" y2="84" stroke="#334155" strokeWidth="0.8" strokeDasharray="2,2" />
                  <text x="242" y="74" fill="#64748B" fontSize="7" textAnchor="middle">AVENTOS LIFT-UP</text>
                </g>

                {/* LED Task Lighting Beam */}
                {includeLedProfileLights && ledGlowActive && (
                  <g>
                    <polygon points="25,110 305,110 320,150 10,150" fill="url(#warmLightBeam)" opacity="0.75" />
                    <line x1="25" y1="110" x2="305" y2="110" stroke="#FBBF24" strokeWidth="2.5" filter="url(#ledGlowWarm)" />
                  </g>
                )}

                {/* Backsplash Tile Band */}
                <rect x="25" y="110" width="280" height="40" fill="#1E293B" opacity="0.4" />
                {includeHob && (
                  <g>
                    {/* Gas Hob on Countertop */}
                    <rect x="115" y="147" width="40" height="4" fill="#0F172A" stroke="#475569" strokeWidth="0.5" rx="1" />
                    <circle cx="125" cy="149" r="2.5" fill="#EF4444" />
                    <circle cx="145" cy="149" r="2.5" fill="#EF4444" />
                  </g>
                )}

                {/* 3. Countertop Slab (Y: 150 to 156) */}
                <rect x="20" y="150" width="290" height="7" fill={currentTheme.counterBg} stroke="#64748B" strokeWidth="0.5" rx="1.5" />

                {/* 4. Base Cabinets (Y: 157 to 220) */}
                <g>
                  {/* Base Module 1: 3-Tandem Drawers */}
                  <rect x="25" y="157" width="70" height="60" fill={currentTheme.baseBg} stroke="#334155" strokeWidth="1" rx="2" />
                  <line x1="25" y1="177" x2="95" y2="177" stroke="#334155" strokeWidth="0.8" />
                  <line x1="25" y1="197" x2="95" y2="197" stroke="#334155" strokeWidth="0.8" />
                  {/* Handles */}
                  <rect x="50" y="166" width="20" height="2" fill={currentTheme.handleColor} rx="1" />
                  <rect x="50" y="186" width="20" height="2" fill={currentTheme.handleColor} rx="1" />
                  <rect x="50" y="206" width="20" height="2" fill={currentTheme.handleColor} rx="1" />

                  {/* Base Module 2: Hob & Spice Pullout */}
                  <rect x="100" y="157" width="70" height="60" fill={currentTheme.baseBg} stroke="#334155" strokeWidth="1" rx="2" />
                  <rect x="105" y="162" width="15" height="50" fill={currentTheme.loftBg} stroke="#334155" strokeWidth="0.5" rx="1" />
                  <text x="112.5" y="190" fill="#94A3B8" fontSize="6" textAnchor="middle" transform="rotate(-90, 112.5, 190)">BOTTLE</text>
                  <rect x="125" y="162" width="40" height="50" fill={currentTheme.baseBg} stroke="#334155" strokeWidth="0.5" rx="1" />
                  <rect x="140" y="185" width="10" height="2" fill={currentTheme.handleColor} rx="1" />

                  {/* Base Module 3: Sink & Corner Unit */}
                  <rect x="175" y="157" width="130" height="60" fill={currentTheme.baseBg} stroke="#334155" strokeWidth="1" rx="2" />
                  <line x1="240" y1="157" x2="240" y2="217" stroke="#334155" strokeWidth="0.8" />
                  <rect x="200" y="185" width="15" height="2" fill={currentTheme.handleColor} rx="1" />
                  <rect x="265" y="185" width="15" height="2" fill={currentTheme.handleColor} rx="1" />
                  <text x="207" y="170" fill="#64748B" fontSize="6.5" textAnchor="middle">SINK UNIT</text>
                  <text x="272" y="170" fill="#64748B" fontSize="6.5" textAnchor="middle">CORNER CAROUSEL</text>
                </g>

                {/* 5. Tall Pantry Tower (If active) (X: 310 to 375, Y: 20 to 220) */}
                {tallUnits > 0 && (
                  <g>
                    <rect x="312" y="20" width="60" height="197" fill={currentTheme.baseBg} stroke="#334155" strokeWidth="1" rx="2" />
                    <line x1="312" y1="90" x2="372" y2="90" stroke="#334155" strokeWidth="0.8" />
                    <line x1="312" y1="150" x2="372" y2="150" stroke="#334155" strokeWidth="0.8" />
                    <rect x="322" y="100" width="40" height="40" fill="#0F172A" stroke="#475569" strokeWidth="0.8" rx="2" />
                    <text x="342" y="123" fill="#38BDF8" fontSize="7" fontWeight="bold" textAnchor="middle">OVEN</text>
                    <rect x="360" y="45" width="2" height="25" fill={currentTheme.handleColor} rx="1" />
                    <rect x="360" y="165" width="2" height="25" fill={currentTheme.handleColor} rx="1" />
                    <text x="342" y="210" fill="#94A3B8" fontSize="6" textAnchor="middle">TALL PANTRY</text>
                  </g>
                )}

                {/* Skirting Base Line */}
                <rect x="20" y="217" width="355" height="5" fill="#020617" />
              </svg>
            </div>

            {/* Theme Selector Palette */}
            <div>
              <span className="text-[11px] font-bold text-slate-655 dark:text-slate-400 block mb-2">
                Color Palette & Visualizer Theme
              </span>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(THEMES).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => setActiveTheme(key as VisualizerTheme)}
                    className={`p-2 rounded-xl border text-left transition flex items-center gap-2 ${
                      activeTheme === key
                        ? 'border-pink-500 bg-pink-500/10 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-700 shrink-0" style={{ backgroundColor: val.baseBg }} />
                    <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate">
                      {val.name.split('&')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quotation Summary Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Official Estimate Summary
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyReport}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold transition shadow-sm"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Quote'}</span>
                </button>
                <button
                  onClick={generatePdfQuote}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold transition shadow-sm"
                >
                  <Download className="w-3.5 h-3.5 text-pink-400" />
                  <span>PDF Quote</span>
                </button>
              </div>
            </div>

            {/* Total Grand Price */}
            <div>
              <span className="text-xs font-semibold text-slate-655 dark:text-slate-400">Total Project Investment (All-Inclusive)</span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-0.5 font-mono tracking-tight">
                ₹{calculations.grandTotal.toLocaleString('en-IN')}
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-655 dark:text-slate-400 font-medium">
                <span>₹{calculations.effectiveRatePerRft.toLocaleString('en-IN')}/Rft</span>
                <span>•</span>
                <span>₹{calculations.effectiveRatePerSqFt.toLocaleString('en-IN')}/Sq Ft Woodwork</span>
                <span>•</span>
                <span>{shape.toUpperCase().replace('_', '-')}</span>
              </div>
            </div>

            {/* Price Breakdown Micro-Rows */}
            <div className="border-t border-slate-100 dark:border-slate-800/60 pt-3 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Cabinetry & Shutters</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                  ₹{calculations.totalCabinetryCost.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Countertop Stone & Fabrication</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                  ₹{calculations.totalCountertopCost.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Smart Storage & Hardware</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                  ₹{calculations.totalOrganizersCost.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Appliances & Sinks Package</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                  ₹{calculations.totalAppliancesCost.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Factory Assembly & Installation</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                  ₹{calculations.installationLaborCost.toLocaleString('en-IN')}
                </span>
              </div>
              {includeGst && (
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span>GST (18% Modular Works)</span>
                  <span className="font-bold font-mono">
                    ₹{calculations.gstAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
            </div>

            {/* Save Quote Box */}
            <div className="border-t border-slate-100 dark:border-slate-800/60 pt-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={quoteName}
                  onChange={(e) => setQuoteName(e.target.value)}
                  placeholder="Quote Name (e.g. Master Kitchen Acrylic)"
                  className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-white focus:border-pink-500 focus:outline-hidden"
                />
                <button
                  onClick={saveCurrentQuote}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-600 dark:text-pink-400 border border-pink-500/30 text-xs font-bold transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>

              {/* Saved Quotes List */}
              {savedQuotes.length > 0 && (
                <div className="mt-3 space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  <span className="text-[10px] uppercase font-bold text-slate-655 dark:text-slate-400 block mb-1">
                    Saved Quotes ({savedQuotes.length})
                  </span>
                  {savedQuotes.map((q) => (
                    <div
                      key={q.id}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="truncate pr-2">
                        <div className="font-bold text-slate-800 dark:text-slate-200 truncate">{q.name}</div>
                        <div className="text-[10px] text-slate-655 dark:text-slate-400">
                          {q.shape.toUpperCase()} • {q.totalRunningFt} Rft • {q.date}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono font-bold text-pink-600 dark:text-pink-400">
                          ₹{q.totalCost.toLocaleString('en-IN')}
                        </span>
                        <button
                          onClick={() => deleteSavedQuote(q.id)}
                          className="p-1 rounded text-slate-400 hover:text-red-500 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

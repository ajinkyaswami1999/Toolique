import { useState, useMemo } from 'react';
import {
  Ruler, Copy, Check, RotateCcw, Building, Plus, Trash2,
  FileSpreadsheet, FileText, Share2, Layers,
  Compass, Truck, Scale, Droplets
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import SEO from '../components/SEO';
import MaterialTrendGraph from '../components/MaterialTrendGraph';

// -------------------------------------------------------------
// Engineering Types & Constants (IS 383:2016 / IS 1542 / IS 2116)
// -------------------------------------------------------------
export interface SandTypeOption {
  id: string;
  name: string;
  category: 'river' | 'msand' | 'psand' | 'pit';
  zone: string;
  finenessModulus: string;
  bulkDensityKgM3: number; // 1500 to 1750 kg/m3
  densityKgCft: number; // ~42.5 to 49.5 kg/cft
  siltLimitPct: number;
  description: string;
  recommendedFor: string;
  isEcoFriendly?: boolean;
}

export interface ConcreteElementSand {
  id: string;
  name: string;
  type: 'slab' | 'beam' | 'column' | 'footing' | 'flooring';
  length: number; // ft or m
  width: number; // ft or m
  depthOrHeight: number; // in or cm
  count: number;
  mixGrade: string;
}

export const SAND_TYPE_OPTIONS: Record<string, SandTypeOption> = {
  river_sand: {
    id: 'river_sand',
    name: 'Natural River Sand (IS 383 Zone II)',
    category: 'river',
    zone: 'Zone II (Medium)',
    finenessModulus: '2.6 - 2.9',
    bulkDensityKgM3: 1600,
    densityKgCft: 45.3,
    siltLimitPct: 3.0,
    description: 'Natural riverbed sand with rounded grains. Excellent workability and pumpability for RCC.',
    recommendedFor: 'Structural RCC Slabs & Beams'
  },
  msand_zone2: {
    id: 'msand_zone2',
    name: 'Manufactured Sand (M-Sand Zone II)',
    category: 'msand',
    zone: 'Zone II (Coarse/Medium)',
    finenessModulus: '2.8 - 3.2',
    bulkDensityKgM3: 1750,
    densityKgCft: 49.5,
    siltLimitPct: 0.0,
    description: 'Crushed granite/basalt aggregate sand. 0% silt, eco-friendly, 10-15% higher compressive strength.',
    recommendedFor: 'High-Strength RCC Columns & Footings',
    isEcoFriendly: true
  },
  psand_plaster: {
    id: 'psand_plaster',
    name: 'Plastering M-Sand (P-Sand Zone IV / IS 1542)',
    category: 'psand',
    zone: 'Zone IV (Fine Screened)',
    finenessModulus: '1.5 - 2.1',
    bulkDensityKgM3: 1650,
    densityKgCft: 46.7,
    siltLimitPct: 0.0,
    description: 'Micro-screened fine manufactured sand (<2.36mm) for smooth crack-free wall and ceiling plastering.',
    recommendedFor: 'Internal & External Plastering',
    isEcoFriendly: true
  },
  pit_coarse: {
    id: 'pit_coarse',
    name: 'Pit / Coarse Quarry Sand (Zone I)',
    category: 'pit',
    zone: 'Zone I (Coarse)',
    finenessModulus: '3.0 - 3.4',
    bulkDensityKgM3: 1550,
    densityKgCft: 43.8,
    siltLimitPct: 5.0,
    description: 'Excavated pit sand with sharp angular grains. High friction for mass concrete foundations.',
    recommendedFor: 'Sub-base PCC & Foundation Bedding'
  }
};

export const CONCRETE_MIX_SAND: Record<string, { name: string; cement: number; sand: number; agg: number }> = {
  M5: { name: 'M5 (1:5:10)', cement: 1, sand: 5, agg: 10 },
  M75: { name: 'M7.5 (1:4:8)', cement: 1, sand: 4, agg: 8 },
  M10: { name: 'M10 (1:3:6)', cement: 1, sand: 3, agg: 6 },
  M15: { name: 'M15 (1:2:4)', cement: 1, sand: 2, agg: 4 },
  M20: { name: 'M20 (1:1.5:3)', cement: 1, sand: 1.5, agg: 3 },
  M25: { name: 'M25 (1:1:2)', cement: 1, sand: 1, agg: 2 },
  M30: { name: 'M30 (1:0.75:1.5)', cement: 1, sand: 0.75, agg: 1.5 }
};

export const MASONRY_MORTAR_SAND: Record<string, { name: string; cement: number; sand: number; desc: string }> = {
  '1:3': { name: '1:3 (Rich Mortar)', cement: 1, sand: 3, desc: 'Water retaining masonry, parapets & high load' },
  '1:4': { name: '1:4 (Standard 4.5" Partition)', cement: 1, sand: 4, desc: 'Recommended for 4.5" half-brick walls' },
  '1:5': { name: '1:5 (Medium Load)', cement: 1, sand: 5, desc: 'General load-bearing internal walls' },
  '1:6': { name: '1:6 (Standard 9" External)', cement: 1, sand: 6, desc: 'Most common mix for 9" external brickwork' },
  '1:8': { name: '1:8 (Lean Compound Wall)', cement: 1, sand: 8, desc: 'Boundary walls and low-stress compound masonry' }
};

export const PLASTER_SAND_PRESETS: Record<string, { name: string; thkMm: number; cement: number; sand: number; mult: number }> = {
  ceiling_6mm: { name: 'Ceiling Plaster (6mm in 1:3)', thkMm: 6, cement: 1, sand: 3, mult: 1.55 },
  internal_12mm_14: { name: 'Internal Wall Plaster (12mm in 1:4)', thkMm: 12, cement: 1, sand: 4, mult: 1.60 },
  internal_12mm_15: { name: 'Internal Wall Plaster (12mm in 1:5)', thkMm: 12, cement: 1, sand: 5, mult: 1.60 },
  internal_12mm_16: { name: 'Internal Wall Plaster (12mm in 1:6)', thkMm: 12, cement: 1, sand: 6, mult: 1.60 },
  rough_15mm: { name: 'Rough Uneven Wall (15mm in 1:4)', thkMm: 15, cement: 1, sand: 4, mult: 1.65 },
  external_20mm: { name: 'External Waterproof Double Coat (20mm in 1:4)', thkMm: 20, cement: 1, sand: 4, mult: 1.60 }
};

export const CITY_SAND_RATES: Record<string, { name: string; riverSandCft: number; msandCft: number; psandCft: number; truckCapacityCft: number }> = {
  mumbai: { name: 'Mumbai (MMR)', riverSandCft: 56, msandCft: 48, psandCft: 52, truckCapacityCft: 300 },
  delhi: { name: 'Delhi NCR', riverSandCft: 48, msandCft: 42, psandCft: 46, truckCapacityCft: 400 },
  bengaluru: { name: 'Bengaluru', riverSandCft: 60, msandCft: 45, psandCft: 48, truckCapacityCft: 350 },
  hyderabad: { name: 'Hyderabad', riverSandCft: 52, msandCft: 42, psandCft: 45, truckCapacityCft: 350 },
  pune: { name: 'Pune', riverSandCft: 54, msandCft: 46, psandCft: 50, truckCapacityCft: 300 },
  chennai: { name: 'Chennai', riverSandCft: 58, msandCft: 46, psandCft: 49, truckCapacityCft: 350 },
  kolkata: { name: 'Kolkata', riverSandCft: 46, msandCft: 38, psandCft: 42, truckCapacityCft: 300 },
  ahmedabad: { name: 'Ahmedabad', riverSandCft: 48, msandCft: 40, psandCft: 44, truckCapacityCft: 350 }
};

// -------------------------------------------------------------
// Main Component Implementation
// -------------------------------------------------------------
export default function SandCalculator() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'concrete' | 'masonry' | 'plaster' | 'compare_bulking' | 'consolidated_quote'>('concrete');
  const [unitMode, setUnitMode] = useState<'feet' | 'meters'>('feet');

  // Selected Sand Type & Rates
  const [selectedSandType, setSelectedSandType] = useState<string>('msand_zone2');
  const [selectedCity, setSelectedCity] = useState<string>('mumbai');
  const [sandRateCft, setSandRateCft] = useState<number>(48);
  const [bulkingMoisturePct, setBulkingMoisturePct] = useState<number>(4); // 4-6% moisture = 15-25% bulking

  // TAB 1: Concrete Elements State
  const [concreteElements, setConcreteElements] = useState<ConcreteElementSand[]>([
    { id: 'c_1', name: 'Main RCC Slab (5")', type: 'slab', length: 30, width: 20, depthOrHeight: 5, count: 1, mixGrade: 'M20' },
    { id: 'c_2', name: 'Columns (9" x 12")', type: 'column', length: 0.75, width: 1.0, depthOrHeight: 120, count: 8, mixGrade: 'M25' },
    { id: 'c_3', name: 'Beams (9" x 12")', type: 'beam', length: 120, width: 0.75, depthOrHeight: 12, count: 1, mixGrade: 'M20' }
  ]);

  // Quick Concrete Batch Calculator
  const [quickConcreteVol, setQuickConcreteVol] = useState<number>(100); // cu.ft or m3
  const [quickConcreteMix, setQuickConcreteMix] = useState<string>('M20');
  const [quickWastagePct, setQuickWastagePct] = useState<number>(5);

  // TAB 2: Brick Masonry State
  const [masonryLength, setMasonryLength] = useState<number>(30);
  const [masonryHeight, setMasonryHeight] = useState<number>(10);
  const [masonryThicknessInches, setMasonryThicknessInches] = useState<number>(9);
  const [masonryMixRatio, setMasonryMixRatio] = useState<string>('1:6');
  const [masonryOpeningsSqFt, setMasonryOpeningsSqFt] = useState<number>(42);
  const [masonryWastagePct, setMasonryWastagePct] = useState<number>(5);

  // TAB 3: Plastering State
  const [plasterPresetId, setPlasterPresetId] = useState<string>('internal_12mm_14');
  const [plasterArea, setPlasterArea] = useState<number>(800); // sq.ft or m2
  const [plasterDeductionSqFt, setPlasterDeductionSqFt] = useState<number>(50);
  const [plasterWastagePct, setPlasterWastagePct] = useState<number>(10);

  // Toast & Copied helpers
  const [copied, setCopied] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleApplyCityRates = (cityKey: string) => {
    setSelectedCity(cityKey);
    const c = CITY_SAND_RATES[cityKey];
    if (c) {
      const rate = selectedSandType.includes('river') ? c.riverSandCft : selectedSandType.includes('psand') ? c.psandCft : c.msandCft;
      setSandRateCft(rate);
      showToast(`Applied ${c.name} sand market rate: ₹${rate}/cft!`);
    }
  };

  // Bulking expansion multiplier
  const bulkingFactor = useMemo(() => {
    // Bulking curve: 0% -> 1.0, 2% -> 1.15, 4% -> 1.25, 6% -> 1.20, 10% -> 1.05
    if (bulkingMoisturePct <= 0) return 1.0;
    if (bulkingMoisturePct <= 4) return 1 + (bulkingMoisturePct * 0.06);
    if (bulkingMoisturePct <= 6) return 1.24 - ((bulkingMoisturePct - 4) * 0.02);
    return Math.max(1.0, 1.20 - ((bulkingMoisturePct - 6) * 0.03));
  }, [bulkingMoisturePct]);

  // Current Sand Density in kg/cft
  const sandDef = useMemo(() => {
    return SAND_TYPE_OPTIONS[selectedSandType] || SAND_TYPE_OPTIONS.msand_zone2;
  }, [selectedSandType]);

  // -------------------------------------------------------------
  // Tab 1: Structural Concrete Sand Calculation
  // -------------------------------------------------------------
  const concreteCalculation = useMemo(() => {
    const isM = unitMode === 'meters';
    let totalWetVolM3 = 0;

    const itemDetails = concreteElements.map(el => {
      let wetVolM3 = 0;
      if (isM) {
        const depthM = el.depthOrHeight / 100;
        wetVolM3 = el.length * el.width * depthM * el.count;
      } else {
        const depthFt = el.depthOrHeight / 12;
        const volCft = el.length * el.width * depthFt * el.count;
        wetVolM3 = volCft * 0.0283168;
      }

      // IS 456 dry factor: 1.54
      const dryVolM3 = wetVolM3 * 1.54;
      const mix = CONCRETE_MIX_SAND[el.mixGrade] || CONCRETE_MIX_SAND.M20;
      const totalParts = mix.cement + mix.sand + mix.agg;

      const sandVolM3 = (mix.sand / totalParts) * dryVolM3;
      const cementVolM3 = (mix.cement / totalParts) * dryVolM3;
      const aggVolM3 = (mix.agg / totalParts) * dryVolM3;

      const sandCft = sandVolM3 * 35.3147;
      const cementBags = Math.ceil(cementVolM3 / 0.0347);
      const aggCft = aggVolM3 * 35.3147;

      totalWetVolM3 += wetVolM3;

      return {
        ...el,
        wetVolM3: Number(wetVolM3.toFixed(3)),
        wetVolCft: Number((wetVolM3 * 35.3147).toFixed(1)),
        sandCft: Number(sandCft.toFixed(1)),
        sandBrass: Number((sandCft / 100).toFixed(2)),
        sandTonnes: Number(((sandCft * sandDef.densityKgCft) / 1000).toFixed(2)),
        cementBags,
        aggCft: Number(aggCft.toFixed(1))
      };
    });

    let sumSandCft = 0;
    let sumCementBags = 0;
    let sumAggCft = 0;

    itemDetails.forEach(i => {
      sumSandCft += i.sandCft;
      sumCementBags += i.cementBags;
      sumAggCft += i.aggCft;
    });

    // Quick output
    const qWetM3 = isM ? quickConcreteVol : quickConcreteVol * 0.0283168;
    const qDryM3 = qWetM3 * 1.54 * (1 + quickWastagePct / 100);
    const qMix = CONCRETE_MIX_SAND[quickConcreteMix] || CONCRETE_MIX_SAND.M20;
    const qParts = qMix.cement + qMix.sand + qMix.agg;
    const qSandCft = Number((((qMix.sand / qParts) * qDryM3) * 35.3147).toFixed(1));
    const qSandBrass = Number((qSandCft / 100).toFixed(2));
    const qSandTonnes = Number(((qSandCft * sandDef.densityKgCft) / 1000).toFixed(2));

    const totalBrass = Number((sumSandCft / 100).toFixed(2));
    const totalTonnes = Number(((sumSandCft * sandDef.densityKgCft) / 1000).toFixed(2));
    const bulkingAdjustedCft = Number((sumSandCft * bulkingFactor).toFixed(1));
    const totalCost = Math.round(sumSandCft * sandRateCft);

    // Logistics: Truck loads
    const trolleys100cft = Math.ceil(sumSandCft / 100);
    const tippers300cft = Math.ceil(sumSandCft / 300);
    const hyvas600cft = Math.ceil(sumSandCft / 600);

    return {
      itemDetails,
      totalWetVolM3: Number(totalWetVolM3.toFixed(3)),
      totalWetVolCft: Number((totalWetVolM3 * 35.3147).toFixed(1)),
      sumSandCft: Number(sumSandCft.toFixed(1)),
      totalBrass,
      totalTonnes,
      bulkingAdjustedCft,
      sumCementBags,
      sumAggCft: Number(sumAggCft.toFixed(1)),
      totalCost,
      trolleys100cft,
      tippers300cft,
      hyvas600cft,
      qSandCft,
      qSandBrass,
      qSandTonnes,
      qCost: Math.round(qSandCft * sandRateCft)
    };
  }, [concreteElements, quickConcreteVol, quickConcreteMix, quickWastagePct, unitMode, sandDef, bulkingFactor, sandRateCft]);

  // -------------------------------------------------------------
  // Tab 2: Brick Masonry Sand Calculation
  // -------------------------------------------------------------
  const masonryCalculation = useMemo(() => {
    const isM = unitMode === 'meters';
    const lenM = isM ? masonryLength : masonryLength * 0.3048;
    const htM = isM ? masonryHeight : masonryHeight * 0.3048;
    const thkM = (masonryThicknessInches / 12) * 0.3048;

    const grossWallAreaSqM = lenM * htM;
    const grossWallAreaSqFt = grossWallAreaSqM * 10.7639;

    const openingsSqM = isM ? masonryOpeningsSqFt : masonryOpeningsSqFt * 0.092903;
    const netWallAreaSqM = Math.max(0, grossWallAreaSqM - openingsSqM);
    const netWallAreaSqFt = netWallAreaSqM * 10.7639;
    const netWallVolM3 = netWallAreaSqM * thkM;
    const netWallVolCft = netWallVolM3 * 35.3147;

    // Mortar volume in 9" brickwork is approx 28% of wall volume
    const wetMortarVolM3 = netWallVolM3 * 0.28;
    const dryMortarVolM3 = wetMortarVolM3 * 1.33 * (1 + masonryWastagePct / 100);
    const dryMortarVolCft = dryMortarVolM3 * 35.3147;

    const parts = MASONRY_MORTAR_SAND[masonryMixRatio] || MASONRY_MORTAR_SAND['1:6'];
    const totalParts = parts.cement + parts.sand;

    const sandVolM3 = (parts.sand / totalParts) * dryMortarVolM3;
    const cementVolM3 = (parts.cement / totalParts) * dryMortarVolM3;

    const sandCft = Number((sandVolM3 * 35.3147).toFixed(1));
    const sandBrass = Number((sandCft / 100).toFixed(2));
    const sandTonnes = Number(((sandCft * sandDef.densityKgCft) / 1000).toFixed(2));
    const cementBags = Math.ceil(cementVolM3 / 0.0347);
    const bricksCount = Math.ceil(netWallVolM3 * 450 * (1 + masonryWastagePct / 100));
    const totalCost = Math.round(sandCft * sandRateCft);

    return {
      grossWallAreaSqFt: Number(grossWallAreaSqFt.toFixed(1)),
      netWallAreaSqFt: Number(netWallAreaSqFt.toFixed(1)),
      netWallVolM3: Number(netWallVolM3.toFixed(3)),
      netWallVolCft: Number(netWallVolCft.toFixed(1)),
      dryMortarVolCft: Number(dryMortarVolCft.toFixed(1)),
      sandCft,
      sandBrass,
      sandTonnes,
      cementBags,
      bricksCount,
      totalCost
    };
  }, [masonryLength, masonryHeight, masonryThicknessInches, masonryMixRatio, masonryOpeningsSqFt, masonryWastagePct, unitMode, sandDef, sandRateCft]);

  // -------------------------------------------------------------
  // Tab 3: Plastering Sand Calculation (IS 1542 / IS 1661)
  // -------------------------------------------------------------
  const plasterCalculation = useMemo(() => {
    const isM = unitMode === 'meters';
    const grossAreaSqM = isM ? plasterArea : plasterArea * 0.092903;
    const openingDeductionSqM = isM ? plasterDeductionSqFt : plasterDeductionSqFt * 0.092903;

    const netAreaSqM = Math.max(0, grossAreaSqM - openingDeductionSqM);
    const netAreaSqFt = netAreaSqM * 10.7639;

    const preset = PLASTER_SAND_PRESETS[plasterPresetId] || PLASTER_SAND_PRESETS.internal_12mm_14;
    const wetVolM3 = netAreaSqM * (preset.thkMm / 1000);
    const dryVolM3 = wetVolM3 * preset.mult * (1 + plasterWastagePct / 100);
    const dryVolCft = dryVolM3 * 35.3147;

    const totalParts = preset.cement + preset.sand;
    const sandVolM3 = (preset.sand / totalParts) * dryVolM3;
    const cementVolM3 = (preset.cement / totalParts) * dryVolM3;

    const sandCft = Number((sandVolM3 * 35.3147).toFixed(1));
    const sandBrass = Number((sandCft / 100).toFixed(2));
    const sandTonnes = Number(((sandCft * sandDef.densityKgCft) / 1000).toFixed(2));
    const cementBags = Math.ceil(cementVolM3 / 0.0347);
    const totalCost = Math.round(sandCft * sandRateCft);

    return {
      netAreaSqFt: Number(netAreaSqFt.toFixed(1)),
      netAreaSqM: Number(netAreaSqM.toFixed(2)),
      dryVolCft: Number(dryVolCft.toFixed(1)),
      sandCft,
      sandBrass,
      sandTonnes,
      cementBags,
      totalCost
    };
  }, [plasterPresetId, plasterArea, plasterDeductionSqFt, plasterWastagePct, unitMode, sandDef, sandRateCft]);

  // -------------------------------------------------------------
  // Consolidated Grand Total Indent
  // -------------------------------------------------------------
  const consolidatedIndent = useMemo(() => {
    const totalCft = Number((concreteCalculation.sumSandCft + masonryCalculation.sandCft + plasterCalculation.sandCft).toFixed(1));
    const totalBrass = Number((totalCft / 100).toFixed(2));
    const totalTonnes = Number(((totalCft * sandDef.densityKgCft) / 1000).toFixed(2));
    const totalCost = Math.round(totalCft * sandRateCft);

    const totalCementBags = concreteCalculation.sumCementBags + masonryCalculation.cementBags + plasterCalculation.cementBags;

    // Logistics breakdown
    const trolleys = Math.ceil(totalCft / 100);
    const tippers = Math.ceil(totalCft / 300);
    const hyvas = Math.ceil(totalCft / 600);

    return {
      totalCft,
      totalBrass,
      totalTonnes,
      totalCost,
      totalCementBags,
      trolleys,
      tippers,
      hyvas
    };
  }, [concreteCalculation, masonryCalculation, plasterCalculation, sandDef, sandRateCft]);

  // -------------------------------------------------------------
  // Actions & Exporters
  // -------------------------------------------------------------
  const handleAddConcreteElement = () => {
    const newEl: ConcreteElementSand = {
      id: `c_${Date.now()}`,
      name: `Concrete Member #${concreteElements.length + 1}`,
      type: 'beam',
      length: 20,
      width: 0.75,
      depthOrHeight: 12,
      count: 1,
      mixGrade: 'M20'
    };
    setConcreteElements(prev => [...prev, newEl]);
    showToast('Added concrete element to sand takeoff');
  };

  const handleRemoveConcreteElement = (id: string) => {
    if (concreteElements.length <= 1) {
      showToast('Keep at least 1 element in schedule');
      return;
    }
    setConcreteElements(prev => prev.filter(e => e.id !== id));
    showToast('Removed element');
  };

  const generateWhatsAppQuote = () => {
    const lines = [
      '*🏖️ SAND & AGGREGATE QUANTITY ESTIMATE (IS 383:2016)*',
      '----------------------------------------',
      `*Sand Spec:* ${sandDef.name}`,
      `*Market City:* ${CITY_SAND_RATES[selectedCity]?.name || 'Standard'} (Rate: ₹${sandRateCft}/cft)`,
      `*Bulking Allowance:* ${bulkingMoisturePct}% moisture (${Math.round((bulkingFactor - 1) * 100)}% volume expansion)`,
      '----------------------------------------',
      '*DISCIPLINE BREAKDOWN:*',
      `• *1. Structural Concrete:* ${concreteCalculation.sumSandCft} cft (${concreteCalculation.totalBrass} Brass / ${concreteCalculation.totalTonnes} Tonnes)`,
      `• *2. Brick Masonry:* ${masonryCalculation.sandCft} cft (${masonryCalculation.sandBrass} Brass / ${masonryCalculation.sandTonnes} Tonnes)`,
      `• *3. Wall Plastering:* ${plasterCalculation.sandCft} cft (${plasterCalculation.sandBrass} Brass / ${plasterCalculation.sandTonnes} Tonnes)`,
      '----------------------------------------',
      '*CONSOLIDATED SAND INDENT:*',
      `• *TOTAL SAND:* ${consolidatedIndent.totalCft} CFT (${consolidatedIndent.totalBrass} Brass)`,
      `• *TOTAL WEIGHT:* ${consolidatedIndent.totalTonnes} Metric Tonnes`,
      `• *ESTIMATED COST:* ₹${consolidatedIndent.totalCost.toLocaleString('en-IN')}`,
      '----------------------------------------',
      '*TRANSPORT & LOGISTICS REQUIREMENT:*',
      `• *Tractor Trolleys (100 cft):* ~${consolidatedIndent.trolleys} Trips`,
      `• *Standard Tippers (300 cft / 3 Brass):* ~${consolidatedIndent.tippers} Trucks`,
      `• *10-12 Wheeler Hyvas (600 cft / 6 Brass):* ~${consolidatedIndent.hyvas} Trucks`,
      '----------------------------------------',
      '_Generated via Toolique Sand Calculator India._'
    ];
    return lines.join('\n');
  };

  const handleCopyQuote = () => {
    const text = generateWhatsAppQuote();
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Quotation copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = generateWhatsAppQuote();
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Multi-Sheet Excel Export
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Consolidated Summary
    const summaryData: (string | number)[][] = [
      ['SAND & FINE AGGREGATE QUANTITY TAKEOFF (IS 383:2016)'],
      ['Sand Type:', sandDef.name],
      ['Market / City:', CITY_SAND_RATES[selectedCity]?.name || 'Standard'],
      ['Unit Rate:', `₹${sandRateCft} / cft`],
      ['Date:', new Date().toLocaleDateString('en-IN')],
      [],
      ['DISCIPLINE', 'SAND (CFT)', 'SAND (BRASS)', 'SAND (TONNES)', 'CO-CEMENT (BAGS)', 'EST. COST (INR)'],
      ['1. Structural Concrete', concreteCalculation.sumSandCft, concreteCalculation.totalBrass, concreteCalculation.totalTonnes, concreteCalculation.sumCementBags, concreteCalculation.totalCost],
      ['2. Brickwork Masonry', masonryCalculation.sandCft, masonryCalculation.sandBrass, masonryCalculation.sandTonnes, masonryCalculation.cementBags, masonryCalculation.totalCost],
      ['3. Wall Plastering', plasterCalculation.sandCft, plasterCalculation.sandBrass, plasterCalculation.sandTonnes, plasterCalculation.cementBags, plasterCalculation.totalCost],
      [],
      ['GRAND TOTAL SAND INDENT', consolidatedIndent.totalCft, `${consolidatedIndent.totalBrass} Brass`, `${consolidatedIndent.totalTonnes} Tonnes`, consolidatedIndent.totalCementBags, consolidatedIndent.totalCost],
      [],
      ['TRUCK TRANSPORTATION LOGISTICS', 'QUANTITY', 'UNIT'],
      ['Tractor Trolley Loads (100 cft)', consolidatedIndent.trolleys, 'Trolleys (1 Brass each)'],
      ['Standard Tipper Trucks (300 cft)', consolidatedIndent.tippers, 'Tipper Trucks (3 Brass each)'],
      ['Heavy Hyva Dumper (600 cft)', consolidatedIndent.hyvas, 'Hyva Trucks (6 Brass each)']
    ];

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Consolidated Sand Indent');

    // Sheet 2: Concrete Schedule
    const concreteRows: (string | number)[][] = [
      ['CONCRETE STRUCTURAL ELEMENTS SAND BREAKDOWN'],
      [],
      ['Element Description', 'Type', 'Dimensions', 'Count', 'Mix Grade', 'Wet Vol (m³)', 'Sand (cft)', 'Sand (Brass)', 'Sand (Tonnes)']
    ];

    concreteCalculation.itemDetails.forEach(el => {
      concreteRows.push([
        el.name,
        el.type.toUpperCase(),
        `${el.length}x${el.width} (${el.depthOrHeight} ${unitMode === 'meters' ? 'cm' : 'in'})`,
        el.count,
        el.mixGrade,
        el.wetVolM3,
        el.sandCft,
        el.sandBrass,
        el.sandTonnes
      ]);
    });

    const wsConcrete = XLSX.utils.aoa_to_sheet(concreteRows);
    XLSX.utils.book_append_sheet(wb, wsConcrete, 'Concrete Schedule');

    XLSX.writeFile(wb, `Sand_Quantity_Takeoff_${Date.now()}.xlsx`);
    showToast('Downloaded Excel Workbook (.xlsx)');
  };

  // High-Resolution PDF Export
  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const margin = 14;
    let y = 14;

    // Header Banner
    doc.setFillColor(30, 41, 59); // slate-800
    doc.rect(0, 0, 210, 36, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('SAND & FINE AGGREGATE QUANTITY TAKEOFF', margin, 16);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225);
    doc.text('Compliant with IS 383:2016, IS 1542, IS 2116 & CPWD DSR Specifications', margin, 23);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')} | Sand: ${sandDef.name} | Rate: Rs.${sandRateCft}/cft`, margin, 29);

    y = 44;

    // Summary Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, 182, 38, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(217, 119, 6); // amber-600
    doc.text('CONSOLIDATED SAND INDENT & LOGISTICS', margin + 4, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);

    doc.text(`• Total Volume: ${consolidatedIndent.totalCft} CFT (${consolidatedIndent.totalBrass} Brass)`, margin + 4, y + 14);
    doc.text(`• Total Weight: ${consolidatedIndent.totalTonnes} Metric Tonnes (@ ${sandDef.densityKgCft} kg/cft)`, margin + 4, y + 20);
    doc.text(`• Total Sand Budget: Rs.${consolidatedIndent.totalCost.toLocaleString('en-IN')}`, margin + 4, y + 26);
    doc.text(`• Bulking Factor: ${Math.round((bulkingFactor - 1) * 100)}% Volume Expansion (@ ${bulkingMoisturePct}% moisture)`, margin + 4, y + 32);

    doc.text(`• Structural Concrete Sand: ${concreteCalculation.sumSandCft} cft`, margin + 105, y + 14);
    doc.text(`• Brick Masonry Sand: ${masonryCalculation.sandCft} cft`, margin + 105, y + 20);
    doc.text(`• Wall Plastering Sand: ${plasterCalculation.sandCft} cft`, margin + 105, y + 26);
    doc.text(`• Transport Requirement: ~${consolidatedIndent.tippers} Tippers / ${consolidatedIndent.trolleys} Trolleys`, margin + 105, y + 32);

    y += 44;

    // Discipline Breakdown Table Header
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(margin, y, 182, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('Work Discipline', margin + 3, y + 5);
    doc.text('Mix Specification', margin + 60, y + 5);
    doc.text('Sand (CFT)', margin + 105, y + 5);
    doc.text('Sand (Brass)', margin + 130, y + 5);
    doc.text('Amount (Rs)', margin + 155, y + 5);

    y += 7;

    const disciplineRows = [
      ['1. Structural Concrete (Slabs, Beams, Columns)', 'M20 / M25 (1.54x)', `${concreteCalculation.sumSandCft} cft`, `${concreteCalculation.totalBrass} Brass`, `Rs.${concreteCalculation.totalCost.toLocaleString('en-IN')}`],
      ['2. Brickwork Masonry (9" / 4.5" Walls)', `${masonryMixRatio} Mortar (1.33x)`, `${masonryCalculation.sandCft} cft`, `${masonryCalculation.sandBrass} Brass`, `Rs.${masonryCalculation.totalCost.toLocaleString('en-IN')}`],
      ['3. Wall & Ceiling Plastering', `${plasterPresetId} (1.60x)`, `${plasterCalculation.sandCft} cft`, `${plasterCalculation.sandBrass} Brass`, `Rs.${plasterCalculation.totalCost.toLocaleString('en-IN')}`]
    ];

    disciplineRows.forEach((row, i) => {
      doc.setFillColor(i % 2 === 0 ? 255 : 248, i % 2 === 0 ? 255 : 250, i % 2 === 0 ? 255 : 252);
      doc.rect(margin, y, 182, 7, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y + 7, margin + 182, y + 7);

      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(row[0], margin + 3, y + 5);
      doc.text(row[1], margin + 60, y + 5);
      doc.setFont('helvetica', 'bold');
      doc.text(row[2], margin + 105, y + 5);
      doc.setFont('helvetica', 'normal');
      doc.text(row[3], margin + 130, y + 5);
      doc.setFont('helvetica', 'bold');
      doc.text(row[4], margin + 155, y + 5);
      y += 7;
    });

    // Grand Total Banner
    y += 3;
    doc.setFillColor(217, 119, 6); // amber-600
    doc.roundedRect(margin, y, 182, 12, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('TOTAL SAND PROCUREMENT:', margin + 4, y + 8);
    doc.setFontSize(13);
    doc.text(`${consolidatedIndent.totalCft} CFT (${consolidatedIndent.totalBrass} Brass)`, margin + 105, y + 8.5);

    y += 18;

    // Sand Quality & Bulking Notes
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(margin, y, 182, 24, 2, 2, 'F');
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('Engineering Standards & Bulking Rules (IS 2386 / IS 383):', margin + 4, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text('• 1 Brass = 100 Cubic Feet (CFT) = 2.8317 Cubic Meters (m3) in Indian construction practice.', margin + 4, y + 10);
    doc.text('• Sand Bulking: Damp sand with 4-6% moisture expands by 15-25% in volume. Adjust batch volumes accordingly.', margin + 4, y + 15);
    doc.text('• Silt Testing: Field jar test must show <= 3% silt by volume. Excessive silt weakens concrete bond strength.', margin + 4, y + 20);

    y += 28;

    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.text('Standard Conversion Factors:', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text('Concrete dry multiplier: 1.54x | Mortar dry multiplier: 1.33x | Plastering multiplier: 1.60x.', margin, y + 4.5);

    doc.save(`Sand_Quantity_Indent_${Date.now()}.pdf`);
    showToast('Downloaded PDF Engineering Takeoff!');
  };

  const handleReset = () => {
    setConcreteElements([
      { id: 'c_1', name: 'Main RCC Slab (5")', type: 'slab', length: 30, width: 20, depthOrHeight: 5, count: 1, mixGrade: 'M20' },
      { id: 'c_2', name: 'Columns (9" x 12")', type: 'column', length: 0.75, width: 1.0, depthOrHeight: 120, count: 8, mixGrade: 'M25' },
      { id: 'c_3', name: 'Beams (9" x 12")', type: 'beam', length: 120, width: 0.75, depthOrHeight: 12, count: 1, mixGrade: 'M20' }
    ]);
    setQuickConcreteVol(100);
    setQuickConcreteMix('M20');
    setMasonryLength(30);
    setMasonryHeight(10);
    setMasonryThicknessInches(9);
    setMasonryMixRatio('1:6');
    setMasonryOpeningsSqFt(42);
    setPlasterPresetId('internal_12mm_14');
    setPlasterArea(800);
    setSelectedSandType('msand_zone2');
    handleApplyCityRates('mumbai');
    showToast('Reset all parameters to Indian Standard defaults!');
  };

  return (
    <>
      <SEO
        title="Sand Calculator India | CFT, Brass & Metric Ton Estimator (IS 383:2016)"
        description="Calculate sand volume in Cubic Feet (CFT), Brass, and Metric Tonnes for concrete slabs, brick masonry, and wall plastering per IS 383 & IS 1542. Includes sand bulking test & truck trips."
        keywords={['sand calculator india', 'sand cft calculator', 'sand brass to tons calculator', 'is 383 sand grading zones', 'm sand vs river sand calculator', 'sand bulking calculator', 'plaster sand calculation']}
      />

      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-bounce">
          <Check className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-6 text-left">
        
        {/* Hero Banner with Metric Highlights */}
        <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-amber-950 via-orange-950 to-zinc-950 text-white border border-amber-800/40 shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <Building className="w-80 h-80" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5" />
                <span>IS 383:2016 • IS 1542 • IS 2116 • IS 2386 Compliant</span>
              </div>
              <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white">
                Sand &amp; Fine Aggregate Calculator India
              </h1>
              <p className="text-xs md:text-sm text-amber-200/80 leading-relaxed">
                Compute sand volume in <strong>Cubic Feet (CFT)</strong>, <strong>Brass (100 CFT)</strong>, and <strong>Metric Tonnes</strong> across Structural Concrete (M5 to M30), Brickwork Masonry, and Plastering. Includes River Sand vs M-Sand grading zones (I to IV), moisture bulking corrections, and tipper truck logistics.
              </p>
            </div>

            {/* Top Stat Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl text-right min-w-[210px] shadow-lg">
              <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">
                Total Sand Indent
              </span>
              <div className="text-2xl md:text-3xl font-black text-amber-300 font-mono">
                {activeTab === 'concrete' ? concreteCalculation.sumSandCft : activeTab === 'masonry' ? masonryCalculation.sandCft : activeTab === 'plaster' ? plasterCalculation.sandCft : consolidatedIndent.totalCft}
                <span className="text-sm font-bold text-white/80 ml-1.5">CFT</span>
              </div>
              <span className="text-[10px] text-amber-200/70 block font-mono">
                {activeTab === 'concrete' ? `${concreteCalculation.totalBrass} Brass (${concreteCalculation.totalTonnes} T)` : activeTab === 'masonry' ? `${masonryCalculation.sandBrass} Brass (${masonryCalculation.sandTonnes} T)` : activeTab === 'plaster' ? `${plasterCalculation.sandBrass} Brass (${plasterCalculation.sandTonnes} T)` : `${consolidatedIndent.totalBrass} Brass (${consolidatedIndent.totalTonnes} T)`} • ₹{(activeTab === 'concrete' ? concreteCalculation.totalCost : activeTab === 'masonry' ? masonryCalculation.totalCost : activeTab === 'plaster' ? plasterCalculation.totalCost : consolidatedIndent.totalCost).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Navigation Tab Bar */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap gap-2">
            {[
              { id: 'concrete', label: '1. Concrete Elements Sand', icon: Building },
              { id: 'masonry', label: '2. Brick Masonry Sand', icon: Layers },
              { id: 'plaster', label: '3. Plastering Sand', icon: Ruler },
              { id: 'compare_bulking', label: '4. River vs M-Sand & Bulking Lab', icon: Droplets },
              { id: 'consolidated_quote', label: `5. Indent & Logistics (${consolidatedIndent.totalBrass} Brass)`, icon: Share2 }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30'
                      : 'bg-white/5 hover:bg-white/10 text-white/90 border border-white/10'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: Concrete Elements Sand */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'concrete' && (
          <div className="space-y-6">
            
            {/* Quick Batch Estimator */}
            <div className="p-6 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/30 rounded-3xl space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Building className="w-4 h-4 text-amber-500" />
                    Direct Concrete Batch Sand Estimator
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Instantly compute CFT, Brass, and Metric Tonnes of sand for any bulk wet concrete volume.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl flex text-xs font-bold">
                    <button
                      onClick={() => setUnitMode('feet')}
                      className={`px-3 py-1 rounded-lg transition ${unitMode === 'feet' ? 'bg-amber-500 text-slate-950 font-black' : 'text-zinc-500'}`}
                    >
                      Cu.Ft (cft)
                    </button>
                    <button
                      onClick={() => setUnitMode('meters')}
                      className={`px-3 py-1 rounded-lg transition ${unitMode === 'meters' ? 'bg-amber-500 text-slate-950 font-black' : 'text-zinc-500'}`}
                    >
                      Cu.Meters (m³)
                    </button>
                  </div>
                  <button
                    onClick={handleReset}
                    className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    title="Reset defaults"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 block">Wet Concrete Vol ({unitMode === 'meters' ? 'm³' : 'cu.ft'})</label>
                  <input
                    type="number"
                    value={quickConcreteVol}
                    onChange={(e) => setQuickConcreteVol(Math.max(0.1, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 block">Mix Grade (IS 456)</label>
                  <select
                    value={quickConcreteMix}
                    onChange={(e) => setQuickConcreteMix(e.target.value)}
                    className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-xs font-bold"
                  >
                    {Object.entries(CONCRETE_MIX_SAND).map(([k, v]) => (
                      <option key={k} value={k}>{v.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 block">Wastage Markup (%)</label>
                  <input
                    type="number"
                    value={quickWastagePct}
                    onChange={(e) => setQuickWastagePct(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-xs font-mono font-bold"
                  />
                </div>
                <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 flex flex-col justify-center text-center">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-amber-950">Sand Output</span>
                  <span className="text-lg font-black font-mono">{concreteCalculation.qSandCft} CFT ({concreteCalculation.qSandBrass} Brass)</span>
                  <span className="text-[9px] text-amber-900 font-bold">{concreteCalculation.qSandTonnes} Tonnes • ₹{concreteCalculation.qCost.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Elements Schedule Table */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-5 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                    Structural Concrete Elements Sand Takeoff ({concreteElements.length} Elements)
                  </h3>
                  <p className="text-[10px] text-zinc-400">
                    Fine aggregate volumes for Slabs, Columns, Beams, Footings based on IS 456 1.54x dry volume factor.
                  </p>
                </div>
                <button
                  onClick={handleAddConcreteElement}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition inline-flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Member</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                      <th className="py-3 px-3">Member Name</th>
                      <th className="py-3 px-3 text-center">Type</th>
                      <th className="py-3 px-3 text-center">Dimensions (L x W x D)</th>
                      <th className="py-3 px-3 text-center">Count</th>
                      <th className="py-3 px-3 text-center">Mix</th>
                      <th className="py-3 px-3 text-right">Wet Vol</th>
                      <th className="py-3 px-3 text-right">Sand (CFT)</th>
                      <th className="py-3 px-3 text-right">Sand (Brass)</th>
                      <th className="py-3 px-3 text-right">Weight (T)</th>
                      <th className="py-3 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-medium">
                    {concreteCalculation.itemDetails.map(el => (
                      <tr key={el.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/20 transition">
                        <td className="py-3 px-3 font-bold text-zinc-900 dark:text-white">
                          <input
                            type="text"
                            value={el.name}
                            onChange={(e) => {
                              const val = e.target.value;
                              setConcreteElements(prev => prev.map(item => item.id === el.id ? { ...item, name: val } : item));
                            }}
                            className="bg-transparent font-bold text-zinc-900 dark:text-white border-b border-transparent hover:border-zinc-300 focus:outline-none"
                          />
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 font-bold uppercase">
                            {el.type}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono">
                          {el.length} &times; {el.width} &times; {el.depthOrHeight} {unitMode === 'meters' ? 'cm' : 'in'}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <input
                            type="number"
                            min={1}
                            value={el.count}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 1;
                              setConcreteElements(prev => prev.map(item => item.id === el.id ? { ...item, count: val } : item));
                            }}
                            className="w-12 px-1 py-0.5 border border-zinc-200 dark:border-zinc-700 rounded text-center font-mono font-bold"
                          />
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-indigo-600 dark:text-indigo-400">
                          {el.mixGrade}
                        </td>
                        <td className="py-3 px-3 text-right font-mono">
                          {el.wetVolM3} m³
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-amber-600 dark:text-amber-400">
                          {el.sandCft}
                        </td>
                        <td className="py-3 px-3 text-right font-mono">
                          {el.sandBrass}
                        </td>
                        <td className="py-3 px-3 text-right font-mono">
                          {el.sandTonnes} T
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => handleRemoveConcreteElement(el.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg"
                            title="Remove element"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Bar */}
              <div className="p-6 rounded-2xl bg-zinc-950 text-white border border-zinc-800 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Total Concrete Sand</span>
                  <div className="text-2xl font-black text-amber-400 font-mono">
                    {concreteCalculation.sumSandCft} <span className="text-xs text-zinc-400 font-normal">CFT</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Volume in Brass</span>
                  <div className="text-2xl font-black text-amber-400 font-mono">
                    {concreteCalculation.totalBrass} <span className="text-xs text-zinc-400 font-normal">Brass</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Weight in Tonnes</span>
                  <div className="text-2xl font-black text-amber-400 font-mono">
                    {concreteCalculation.totalTonnes} <span className="text-xs text-zinc-400 font-normal">Tonnes</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Estimated Sand Budget</span>
                  <div className="text-2xl font-black text-emerald-400 font-mono">
                    ₹{concreteCalculation.totalCost.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: Brick Masonry Sand */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'masonry' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <div className="lg:col-span-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-6 shadow-sm">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🧱</span>
                  <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                    Brickwork Mortar Sand Dimensions
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 block">Wall Length ({unitMode === 'meters' ? 'm' : 'ft'})</label>
                  <input
                    type="number"
                    value={masonryLength}
                    onChange={(e) => setMasonryLength(Math.max(0.1, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-mono font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 block">Wall Height ({unitMode === 'meters' ? 'm' : 'ft'})</label>
                  <input
                    type="number"
                    value={masonryHeight}
                    onChange={(e) => setMasonryHeight(Math.max(0.1, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-mono font-bold text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 block">Wall Thickness</label>
                  <select
                    value={masonryThicknessInches}
                    onChange={(e) => setMasonryThicknessInches(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-bold text-xs"
                  >
                    <option value={4.5}>4.5&quot; (Partition / Half-Brick)</option>
                    <option value={9}>9&quot; (Standard 1-Brick External)</option>
                    <option value={13.5}>13.5&quot; (1.5-Brick Heavy)</option>
                    <option value={18}>18&quot; (2-Brick Foundation)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 block">Mortar Mix Ratio</label>
                  <select
                    value={masonryMixRatio}
                    onChange={(e) => setMasonryMixRatio(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-bold text-xs"
                  >
                    {Object.entries(MASONRY_MORTAR_SAND).map(([k, v]) => (
                      <option key={k} value={k}>{v.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 block">Openings Deducted (IS 1200)</label>
                  <input
                    type="number"
                    value={masonryOpeningsSqFt}
                    onChange={(e) => setMasonryOpeningsSqFt(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-mono font-bold text-xs"
                  />
                  <span className="text-[9px] text-zinc-400">sq.ft or m²</span>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 block">Mortar Wastage (%)</label>
                  <input
                    type="number"
                    value={masonryWastagePct}
                    onChange={(e) => setMasonryWastagePct(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-mono font-bold text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-5">
              <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-zinc-900/40 border-2 border-amber-500/40 rounded-3xl p-6 space-y-5 shadow-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                      Brickwork Sand Required
                    </span>
                    <div className="text-4xl font-black text-zinc-900 dark:text-white font-mono">
                      {masonryCalculation.sandCft}
                      <span className="text-sm font-bold text-zinc-500 ml-1.5">CFT</span>
                    </div>
                    <span className="text-xs text-zinc-500 font-mono">{masonryCalculation.sandBrass} Brass ({masonryCalculation.sandTonnes} Tonnes)</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400 block">Co-Material Indent</span>
                    <span className="text-sm font-black text-zinc-800 dark:text-zinc-200 font-mono">
                      {masonryCalculation.cementBags} Cement Bags
                    </span>
                    <span className="text-[10px] text-zinc-400 block">~{masonryCalculation.bricksCount.toLocaleString()} Bricks</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800 text-xs">
                  <div className="flex justify-between py-1 text-zinc-600 dark:text-zinc-400">
                    <span>Dry Mortar Volume (1.33x factor):</span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-white">{masonryCalculation.dryMortarVolCft} CFT</span>
                  </div>
                  <div className="flex justify-between py-1 text-zinc-600 dark:text-zinc-400">
                    <span>Net Brickwork Volume:</span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-white">{masonryCalculation.netWallVolM3} m³ ({masonryCalculation.netWallVolCft} cft)</span>
                  </div>
                  <div className="flex justify-between py-1 text-zinc-600 dark:text-zinc-400">
                    <span>Estimated Masonry Sand Cost:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">₹{masonryCalculation.totalCost.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: Plastering Sand */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'plaster' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <div className="lg:col-span-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-6 shadow-sm">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🖌️</span>
                  <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                    Plastering Area &amp; Sand Specifications (IS 1542)
                  </h3>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 block">Select Plaster Specification:</label>
                <select
                  value={plasterPresetId}
                  onChange={(e) => setPlasterPresetId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-bold text-xs"
                >
                  {Object.entries(PLASTER_SAND_PRESETS).map(([k, v]) => (
                    <option key={k} value={k}>{v.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 block">Plaster Surface Area ({unitMode === 'meters' ? 'm²' : 'sq.ft'})</label>
                  <input
                    type="number"
                    value={plasterArea}
                    onChange={(e) => setPlasterArea(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-mono font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 block">Openings Deduction ({unitMode === 'meters' ? 'm²' : 'sq.ft'})</label>
                  <input
                    type="number"
                    value={plasterDeductionSqFt}
                    onChange={(e) => setPlasterDeductionSqFt(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-mono font-bold text-xs"
                  />
                  <span className="text-[9px] text-zinc-400">IS 1200 Pt-12 deduction rules</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 block">Wastage / Joint Filling Markup (%)</label>
                <input
                  type="number"
                  value={plasterWastagePct}
                  onChange={(e) => setPlasterWastagePct(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-mono font-bold text-xs"
                />
                <span className="text-[9px] text-zinc-400">10% standard markup for drops and joints</span>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-5">
              <div className="bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-zinc-900/40 border-2 border-amber-500/40 rounded-3xl p-6 space-y-5 shadow-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                      Plaster Sand Required (Zone IV / P-Sand)
                    </span>
                    <div className="text-4xl font-black text-zinc-900 dark:text-white font-mono">
                      {plasterCalculation.sandCft}
                      <span className="text-sm font-bold text-zinc-500 ml-1.5">CFT</span>
                    </div>
                    <span className="text-xs text-zinc-500 font-mono">{plasterCalculation.sandBrass} Brass ({plasterCalculation.sandTonnes} Tonnes)</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400 block">Co-Cement Indent</span>
                    <span className="text-sm font-black text-zinc-800 dark:text-zinc-200 font-mono">
                      {plasterCalculation.cementBags} Bags
                    </span>
                    <span className="text-[10px] text-zinc-400 block">PPC Recommended</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800 text-xs">
                  <div className="flex justify-between py-1 text-zinc-600 dark:text-zinc-400">
                    <span>Dry Mortar Volume (1.60x factor):</span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-white">{plasterCalculation.dryVolCft} CFT</span>
                  </div>
                  <div className="flex justify-between py-1 text-zinc-600 dark:text-zinc-400">
                    <span>Net Plaster Surface Area:</span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-white">{plasterCalculation.netAreaSqFt} sq.ft</span>
                  </div>
                  <div className="flex justify-between py-1 text-zinc-600 dark:text-zinc-400">
                    <span>Estimated Plaster Sand Budget:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">₹{plasterCalculation.totalCost.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 4: River vs M-Sand Benchmark & Bulking Lab */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'compare_bulking' && (
          <div className="space-y-6">
            
            {/* Sand Type Selector & Technical Benchmark */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-5 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Scale className="w-4 h-4 text-amber-500" />
                    Indian Sand Types &amp; Grading Comparison (IS 383:2016)
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Select your sand specification to automatically update dry density weights and batch properties.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.values(SAND_TYPE_OPTIONS).map(s => {
                  const isSelected = selectedSandType === s.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => {
                        setSelectedSandType(s.id);
                        handleApplyCityRates(selectedCity);
                      }}
                      className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500 shadow-md ring-2 ring-amber-500/30'
                          : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                            {s.zone}
                          </span>
                          {s.isEcoFriendly && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-500 text-white rounded">
                              Eco M-Sand
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-white">{s.name}</h4>
                        <p className="text-[11px] text-zinc-500">{s.description}</p>
                        <div className="space-y-1 text-[10px] text-zinc-400 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                          <div><strong>Bulk Density:</strong> {s.bulkDensityKgM3} kg/m³ ({s.densityKgCft} kg/cft)</div>
                          <div><strong>Fineness Modulus:</strong> {s.finenessModulus}</div>
                          <div><strong>Silt Max Limit:</strong> {s.siltLimitPct}%</div>
                        </div>
                      </div>

                      <div className="mt-4 pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center text-xs font-bold text-amber-600 dark:text-amber-400">
                        <span>{isSelected ? '✓ ACTIVE SELECTION' : 'CLICK TO SELECT'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Interactive Sand Bulking Lab */}
            <div className="p-6 bg-zinc-950 text-white border border-zinc-800 rounded-3xl space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-amber-400" />
                    Interactive Sand Bulking Lab &amp; Moisture Correction (IS 2386 Pt-3)
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Surface moisture in fine aggregate creates surface tension films that push particles apart, increasing volume by up to 25%.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-400 block">Applied Volume Expansion</span>
                  <span className="text-2xl font-black text-amber-400 font-mono">
                    +{Math.round((bulkingFactor - 1) * 100)}%
                  </span>
                </div>
              </div>

              {/* Slider */}
              <div className="space-y-2 p-4 bg-zinc-900 rounded-2xl border border-zinc-800">
                <div className="flex justify-between text-xs font-bold">
                  <span>Surface Moisture Content:</span>
                  <span className="font-mono text-amber-400">{bulkingMoisturePct}% Moisture</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={12}
                  step={0.5}
                  value={bulkingMoisturePct}
                  onChange={(e) => setBulkingMoisturePct(parseFloat(e.target.value))}
                  className="w-full accent-amber-500"
                />
                <div className="flex justify-between text-[9px] text-zinc-400">
                  <span>0% (Bone Dry Sand)</span>
                  <span>4% - 6% (Peak Bulking Zone: 20-25%)</span>
                  <span>10%+ (Saturated Inundated)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span className="text-[10px] text-zinc-400 block">Dry Solid Sand Req</span>
                  <span className="text-lg font-black text-white font-mono">{concreteCalculation.sumSandCft} CFT</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span className="text-[10px] text-amber-400 block">Damp Bulked Batch Volume</span>
                  <span className="text-lg font-black text-amber-400 font-mono">{concreteCalculation.bulkingAdjustedCft} CFT</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span className="text-[10px] text-emerald-400 block">Site Field Jar Test Formula</span>
                  <span className="text-[11px] font-mono text-zinc-300">Bulking % = [(H1 - H2) / H2] &times; 100</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 5: Consolidated Indent, Regional Rates & Quote */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'consolidated_quote' && (
          <div className="space-y-6">
            
            {/* Grand Rollup */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-amber-500 text-slate-950 shadow-xl shadow-amber-500/20 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-950">Total Sand Required</span>
                <div className="text-3xl font-black font-mono">
                  {consolidatedIndent.totalCft} <span className="text-sm font-normal">CFT</span>
                </div>
                <span className="text-[10px] text-amber-900 font-bold block">{consolidatedIndent.totalBrass} Brass</span>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Total Net Weight</span>
                <div className="text-3xl font-black font-mono text-zinc-900 dark:text-white">
                  {consolidatedIndent.totalTonnes} <span className="text-sm font-normal text-zinc-500">Tonnes</span>
                </div>
                <span className="text-[10px] text-zinc-400 block">@ {sandDef.densityKgCft} kg/cft bulk density</span>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Co-Cement Indent</span>
                <div className="text-3xl font-black font-mono text-indigo-600 dark:text-indigo-400">
                  {consolidatedIndent.totalCementBags} <span className="text-sm font-normal text-zinc-500">Bags</span>
                </div>
                <span className="text-[10px] text-zinc-400 block">Concrete + Masonry + Plaster</span>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Total Estimated Budget</span>
                <div className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                  ₹{consolidatedIndent.totalCost.toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-zinc-400 block">@ ₹{sandRateCft} per CFT</span>
              </div>
            </div>

            {/* City Rates & Logistics */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* City Rates */}
              <div className="lg:col-span-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-5 shadow-sm">
                <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                    Regional City Sand Rate Matrix
                  </h3>
                  <p className="text-[10px] text-zinc-400">
                    Local market prices per Cubic Foot (CFT) &amp; Brass (100 CFT).
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 block">Select Market City:</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(CITY_SAND_RATES).map(([key, c]) => (
                      <button
                        key={key}
                        onClick={() => handleApplyCityRates(key)}
                        className={`p-2 rounded-xl text-xs font-bold transition text-left border ${
                          selectedCity === key
                            ? 'bg-amber-500 text-slate-950 border-amber-500 font-black shadow-md'
                            : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-500 block">Custom Sand Rate (₹/CFT)</label>
                  <input
                    type="number"
                    value={sandRateCft}
                    onChange={(e) => setSandRateCft(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-mono font-bold text-xs"
                  />
                  <span className="text-[9px] text-zinc-400">₹{sandRateCft * 100} per Brass</span>
                </div>
              </div>

              {/* Truck Logistics Card */}
              <div className="lg:col-span-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-sm">
                <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-500" />
                  <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                    Site Delivery &amp; Tipper Logistics
                  </h3>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Tractor Trolley</span>
                    <div className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">
                      ~{consolidatedIndent.trolleys} Trips
                    </div>
                    <span className="text-[9px] text-zinc-500">1 Brass (100 cft)</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">6-Wheeler Tipper</span>
                    <div className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">
                      ~{consolidatedIndent.tippers} Trucks
                    </div>
                    <span className="text-[9px] text-zinc-500">3 Brass (300 cft)</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">10-12W Hyva</span>
                    <div className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">
                      ~{consolidatedIndent.hyvas} Trucks
                    </div>
                    <span className="text-[9px] text-zinc-500">6 Brass (600 cft)</span>
                  </div>
                </div>

                <p className="text-[11px] text-zinc-500 leading-relaxed bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  💡 <strong>Procurement Tip:</strong> Ordering bulk 3-Brass tippers or 6-Brass Hyvas reduces freight handling charges by 15-20% compared to multiple tractor trolley trips.
                </p>
              </div>
            </div>

            {/* Export Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* WhatsApp Card */}
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 block">
                    1-Click WhatsApp Share
                  </span>
                  <p className="text-[11px] text-zinc-500">
                    Share complete sand takeoff in CFT, Brass, Tonnes, and truck trips directly on WhatsApp.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleShareWhatsApp}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition inline-flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Send Quote</span>
                  </button>
                  <button
                    onClick={handleCopyQuote}
                    className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 text-xs"
                    title="Copy quotation text"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Excel Card */}
              <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-3 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 block">
                    Excel Workbook (.xlsx)
                  </span>
                  <p className="text-[11px] text-zinc-500">
                    Multi-sheet workbook containing Concrete Elements Schedule and Consolidated BOQ Indent.
                  </p>
                </div>
                <button
                  onClick={handleExportExcel}
                  className="w-full py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-xs hover:bg-zinc-800 transition inline-flex items-center justify-center gap-2"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Download Excel</span>
                </button>
              </div>

              {/* PDF Card */}
              <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/20 space-y-3 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-black text-red-700 dark:text-red-400 block">
                    Engineering PDF Takeoff
                  </span>
                  <p className="text-[11px] text-zinc-500">
                    High-res PDF document with IS 383:2016 grading specifications, bulking corrections, and takeoff.
                  </p>
                </div>
                <button
                  onClick={handleExportPDF}
                  className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs transition inline-flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>

            {/* Live WhatsApp Quotation Preview */}
            <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-3 font-mono text-xs">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                Live WhatsApp Quotation Preview:
              </span>
              <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed overflow-x-auto p-4 bg-black/40 rounded-2xl border border-zinc-800/80">
                {generateWhatsAppQuote()}
              </pre>
            </div>
          </div>
        )}

        {/* Live Material Market Trends Graph */}
        <MaterialTrendGraph allowedMaterials={['sand', 'cement', 'aggregate']} />

        {/* Comprehensive Technical Guide & Engineering FAQs (SEO / AEO / GEO) */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 space-y-8 shadow-sm">
          
          <div className="space-y-3">
            <h3 className="text-lg md:text-xl font-black text-zinc-900 dark:text-white">
              Indian Standard (IS) Sand Calculation Rules &amp; Aggregate Mathematics
            </h3>
            <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Fine aggregate estimation in India is governed by <strong>IS 383:2016 (Grading of Coarse and Fine Aggregates)</strong>, <strong>IS 1542 (Sand for Plaster)</strong>, <strong>IS 2116 (Sand for Masonry Mortars)</strong>, and <strong>IS 2386 (Aggregate Testing &amp; Bulking)</strong>. Understanding the volumetric units (Brass &amp; CFT) and dry expansion factors ensures 100% material accounting accuracy on site.
            </p>
          </div>

          {/* Quick Technical Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <h4 className="font-bold text-xs text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                1. What is 1 Brass of Sand?
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                In Indian civil engineering practice, <strong>1 Brass = 100 Cubic Feet (CFT) = 2.8317 Cubic Meters (m³)</strong>. 1 Brass of dry sand weights approximately <strong>4.5 to 4.95 Metric Tonnes</strong> depending on grain density (River vs M-Sand).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <h4 className="font-bold text-xs text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                2. River Sand vs M-Sand (Zone II)
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                <strong>M-Sand (Manufactured Sand)</strong> is crushed from high-grade granite rocks with zero silt and uniform grading per IS 383. It produces 10–15% higher compressive concrete strength than river sand and eliminates illegal riverbed mining.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <h4 className="font-bold text-xs text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                3. The Bulking Phenomenon
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                When moisture is between 4% and 6%, sand volume expands by up to 25% due to surface tension. If volumetric batching is done on site with damp sand, extra sand must be measured using the bulking multiplier to avoid cement-rich, weak mixes.
              </p>
            </div>
          </div>

          {/* FAQ Accordion Section */}
          <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">
              Frequently Asked Questions (AEO / GEO Knowledge Hub)
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                <h4 className="font-bold text-zinc-900 dark:text-white">
                  How many CFT of sand is required for 100 cu.ft of M20 concrete?
                </h4>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  For 100 cu.ft of wet M20 concrete (1:1.5:3 mix), the dry volume required is 154 cu.ft (1.54x factor). The sand share is (1.5 / 5.5) &times; 154 = <strong>42 cu.ft (0.42 Brass or ~1.9 Metric Tonnes)</strong>, along with 23 bags of cement and 84 cu.ft of 20mm aggregate.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                <h4 className="font-bold text-zinc-900 dark:text-white">
                  How much does 1 Brass of sand weigh in tonnes in India?
                </h4>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  1 Brass (100 CFT) of natural river sand weighs approximately <strong>4.53 Metric Tonnes (4530 kg)</strong>. 1 Brass of manufactured M-Sand weighs approximately <strong>4.95 Metric Tonnes (4950 kg)</strong> due to higher packing density and angular crushed rock structure.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                <h4 className="font-bold text-zinc-900 dark:text-white">
                  What is the difference between M-Sand and P-Sand?
                </h4>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  <strong>M-Sand (Zone II)</strong> has coarser particles (up to 4.75mm) designed for structural RCC concrete slabs, columns, and beams. <strong>P-Sand (Zone IV / IS 1542)</strong> is finely screened manufactured sand (under 2.36mm) tailored specifically for internal/external wall plastering and brick masonry mortar to ensure a smooth, crack-resistant finish.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </>
  );
}

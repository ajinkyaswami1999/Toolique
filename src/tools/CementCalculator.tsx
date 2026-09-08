import { useState, useMemo } from 'react';
import {
  Layers, Copy, Check, RotateCcw, Building, Plus, Trash2,
  FileSpreadsheet, FileText, Share2, Ruler,
  TrendingDown, HardHat, Compass, Warehouse, ShieldAlert
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import SEO from '../components/SEO';
import MaterialTrendGraph from '../components/MaterialTrendGraph';

// -------------------------------------------------------------
// Engineering Constants & Indian Standards (IS 456 / IS 1077 / IS 1661)
// -------------------------------------------------------------
export interface ConcreteMixDef {
  id: string;
  name: string;
  grade: string;
  cementPart: number;
  sandPart: number;
  aggregatePart: number;
  strengthMpa: number;
  description: string;
  recommendedFor: string;
}

export interface PlasterPreset {
  id: string;
  name: string;
  thicknessMm: number;
  ratio: string;
  cementPart: number;
  sandPart: number;
  multiplier: number; // 1.33 dry * 1.20 joints/wastage = 1.60
  description: string;
}

export interface StructuralElement {
  id: string;
  name: string;
  type: 'slab' | 'beam' | 'column' | 'footing' | 'flooring';
  length: number; // ft or m
  width: number; // ft or m
  depthOrHeight: number; // in inches (ft mode) or cm (m mode)
  count: number;
  mixGrade: string;
}

export const CONCRETE_MIX_PRESETS: Record<string, ConcreteMixDef> = {
  M5: { id: 'M5', name: 'M5 (1:5:10)', grade: 'M5', cementPart: 1, sandPart: 5, aggregatePart: 10, strengthMpa: 5, description: 'Lean concrete for sub-base leveling and foundation bedding.', recommendedFor: 'Sub-base / Bedding' },
  M75: { id: 'M75', name: 'M7.5 (1:4:8)', grade: 'M7.5', cementPart: 1, sandPart: 4, aggregatePart: 8, strengthMpa: 7.5, description: 'Mass foundation, retaining wall base, and trench leveling.', recommendedFor: 'Mass PCC' },
  M10: { id: 'M10', name: 'M10 (1:3:6)', grade: 'M10', cementPart: 1, sandPart: 3, aggregatePart: 6, strengthMpa: 10, description: 'PCC bed flooring, boundary foundation, and pathway paving.', recommendedFor: 'Flooring Bed' },
  M15: { id: 'M15', name: 'M15 (1:2:4)', grade: 'M15', cementPart: 1, sandPart: 2, aggregatePart: 4, strengthMpa: 15, description: 'General plain concrete and low-load single storey slabs.', recommendedFor: 'Light RCC / Pavement' },
  M20: { id: 'M20', name: 'M20 (1:1.5:3)', grade: 'M20', cementPart: 1, sandPart: 1.5, aggregatePart: 3, strengthMpa: 20, description: 'Standard structural RCC mix for slabs, beams, columns per IS 456.', recommendedFor: 'Standard RCC Slabs & Beams' },
  M25: { id: 'M25', name: 'M25 (1:1:2)', grade: 'M25', cementPart: 1, sandPart: 1, aggregatePart: 2, strengthMpa: 25, description: 'Heavy structural columns, footings, water tanks, and cantilever beams.', recommendedFor: 'Heavy Columns & Footings' },
  M30: { id: 'M30', name: 'M30 (1:0.75:1.5 Nominal)', grade: 'M30', cementPart: 1, sandPart: 0.75, aggregatePart: 1.5, strengthMpa: 30, description: 'High-strength structural design mix for high-rise residential towers.', recommendedFor: 'High-Rise Columns' }
};

export const MASONRY_MORTAR_PRESETS = {
  '1:3': { id: '1:3', name: '1:3 (Rich Mortar)', cement: 1, sand: 3, description: 'Parapet walls, water retaining brickwork, and damp-proof masonry.' },
  '1:4': { id: '1:4', name: '1:4 (Standard 4.5" Partition)', cement: 1, sand: 4, description: 'Mandatory mix for 4.5" half-brick partition walls per CPWD.' },
  '1:5': { id: '1:5', name: '1:5 (Medium Load)', cement: 1, sand: 5, description: 'General load-bearing brick walls and internal boundary masonry.' },
  '1:6': { id: '1:6', name: '1:6 (Standard 9" External Wall)', cement: 1, sand: 6, description: 'Standard mix for 9" external structural brick masonry.' },
  '1:8': { id: '1:8', name: '1:8 (Lean Compound Wall)', cement: 1, sand: 8, description: 'Low-stress boundary walls and compound masonry.' }
};

export const PLASTER_PRESETS: Record<string, PlasterPreset> = {
  ceiling_6mm: { id: 'ceiling_6mm', name: 'Ceiling Plaster (6mm in 1:3)', thicknessMm: 6, ratio: '1:3', cementPart: 1, sandPart: 3, multiplier: 1.55, description: 'Smooth thin-coat ceiling plaster with rich 1:3 bond mix.' },
  internal_12mm_14: { id: 'internal_12mm_14', name: 'Internal Wall Plaster (12mm in 1:4)', thicknessMm: 12, ratio: '1:4', cementPart: 1, sandPart: 4, multiplier: 1.60, description: 'Standard single-coat internal plaster for brick and concrete walls.' },
  internal_12mm_15: { id: 'internal_12mm_15', name: 'Internal Wall Plaster (12mm in 1:5)', thicknessMm: 12, ratio: '1:5', cementPart: 1, sandPart: 5, multiplier: 1.60, description: 'Economy single-coat internal wall plaster.' },
  internal_12mm_16: { id: 'internal_12mm_16', name: 'Internal Wall Plaster (12mm in 1:6)', thicknessMm: 12, ratio: '1:6', cementPart: 1, sandPart: 6, multiplier: 1.60, description: 'Standard internal plaster on smooth brickwork surfaces.' },
  rough_15mm: { id: 'rough_15mm', name: 'Rough / Uneven Wall (15mm in 1:4)', thicknessMm: 15, ratio: '1:4', cementPart: 1, sandPart: 4, multiplier: 1.65, description: 'Single coat on uneven stone/country brick masonry.' },
  external_20mm: { id: 'external_20mm', name: 'External Waterproof Double Coat (20mm in 1:4)', thicknessMm: 20, ratio: '1:4', cementPart: 1, sandPart: 4, multiplier: 1.60, description: '12mm base coat (1:4) + 8mm finish coat (1:3) with waterproofing chemical.' }
};

export const CEMENT_TYPE_GUIDE = [
  {
    grade: 'OPC 53 (IS 12269)',
    name: 'Ordinary Portland Cement 53 Grade',
    strength: 'Fast 28-day 53 MPa strength',
    bestFor: 'RCC Slabs, Beams, Columns, Precast & High-Rise Structures',
    curingPeriod: '10 - 14 Days',
    heat: 'High heat of hydration',
    tag: 'Structural RCC'
  },
  {
    grade: 'OPC 43 (IS 8112)',
    name: 'Ordinary Portland Cement 43 Grade',
    strength: 'Medium 43 MPa strength',
    bestFor: 'General RCC works, pathways, non-critical casting',
    curingPeriod: '14 Days',
    heat: 'Moderate heat',
    tag: 'General Purpose'
  },
  {
    grade: 'PPC (IS 1489)',
    name: 'Portland Pozzolana Cement (Fly Ash based)',
    strength: 'Gradual long-term strength gain',
    bestFor: 'Wall Plastering, Brick Masonry, Mass Concrete, Marine/Coastal Works',
    curingPeriod: '14 - 21 Days',
    heat: 'Low heat (prevents shrinkage cracks)',
    tag: 'Best for Plaster & Brickwork'
  },
  {
    grade: 'PSC (IS 455)',
    name: 'Portland Slag Cement',
    strength: 'High chemical & sulfate resistance',
    bestFor: 'Coastal structures, sewage treatment, foundations in aggressive soils',
    curingPeriod: '14 - 21 Days',
    heat: 'Very low heat',
    tag: 'Marine & Foundation'
  }
];

export const CITY_CEMENT_RATES: Record<string, { name: string; opc53: number; ppc: number; sandCft: number; aggregateCft: number }> = {
  mumbai: { name: 'Mumbai (MMR)', opc53: 410, ppc: 380, sandCft: 52, aggregateCft: 44 },
  delhi: { name: 'Delhi NCR', opc53: 390, ppc: 360, sandCft: 45, aggregateCft: 40 },
  bengaluru: { name: 'Bengaluru', opc53: 405, ppc: 375, sandCft: 55, aggregateCft: 42 },
  hyderabad: { name: 'Hyderabad', opc53: 385, ppc: 355, sandCft: 48, aggregateCft: 38 },
  pune: { name: 'Pune', opc53: 400, ppc: 370, sandCft: 50, aggregateCft: 42 },
  chennai: { name: 'Chennai', opc53: 395, ppc: 365, sandCft: 54, aggregateCft: 40 },
  kolkata: { name: 'Kolkata', opc53: 375, ppc: 345, sandCft: 42, aggregateCft: 36 },
  ahmedabad: { name: 'Ahmedabad', opc53: 380, ppc: 350, sandCft: 44, aggregateCft: 39 }
};

// -------------------------------------------------------------
// Main Component Implementation
// -------------------------------------------------------------
export default function CementCalculator() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'concrete' | 'masonry' | 'plaster' | 'consolidated' | 'storage_rates'>('concrete');
  const [unitMode, setUnitMode] = useState<'feet' | 'meters'>('feet');

  // Selected City & Rates
  const [selectedCity, setSelectedCity] = useState<string>('mumbai');
  const [cementRatePerBag, setCementRatePerBag] = useState<number>(390);
  const [sandRateCft, setSandRateCft] = useState<number>(48);
  const [aggregateRateCft, setAggregateRateCft] = useState<number>(42);

  // TAB 1: Concrete Structural Elements State
  const [concreteElements, setConcreteElements] = useState<StructuralElement[]>([
    { id: 'elem_1', name: 'Main RCC Roof Slab (5")', type: 'slab', length: 30, width: 20, depthOrHeight: 5, count: 1, mixGrade: 'M20' },
    { id: 'elem_2', name: 'Main Columns (9" x 12")', type: 'column', length: 0.75, width: 1.0, depthOrHeight: 120, count: 8, mixGrade: 'M25' },
    { id: 'elem_3', name: 'Plinth & Roof Beams (9" x 12")', type: 'beam', length: 120, width: 0.75, depthOrHeight: 12, count: 1, mixGrade: 'M20' }
  ]);

  // Fast Concrete Quick Calculator State
  const [quickConcreteVolume, setQuickConcreteVolume] = useState<number>(100); // cu.ft or m3
  const [quickConcreteMix, setQuickConcreteMix] = useState<string>('M20');
  const [quickConcreteWastage, setQuickConcreteWastage] = useState<number>(5);

  // TAB 2: Brick Masonry State
  const [masonryWallLength, setMasonryWallLength] = useState<number>(30);
  const [masonryWallHeight, setMasonryWallHeight] = useState<number>(10);
  const [masonryThicknessInches, setMasonryThicknessInches] = useState<number>(9);
  const [masonryMixRatio, setMasonryMixRatio] = useState<string>('1:6');
  const [masonryOpeningsAreaSqFt, setMasonryOpeningsAreaSqFt] = useState<number>(42); // Door + Window
  const [masonryWastagePct, setMasonryWastagePct] = useState<number>(5);

  // TAB 3: Plastering State
  const [plasterPresetId, setPlasterPresetId] = useState<string>('internal_12mm_14');
  const [plasterSurfaceArea, setPlasterSurfaceArea] = useState<number>(800); // sqft or m2
  const [plasterCustomThicknessMm, setPlasterCustomThicknessMm] = useState<number>(12);
  const [plasterCustomMix, setPlasterCustomMix] = useState<string>('1:4');
  const [plasterOpeningDeductionSqFt, setPlasterOpeningDeductionSqFt] = useState<number>(50);
  const [plasterWastagePct, setPlasterWastagePct] = useState<number>(10);

  // UI helpers
  const [copied, setCopied] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // City preset rate applicator
  const handleApplyCityRates = (cityKey: string) => {
    setSelectedCity(cityKey);
    const p = CITY_CEMENT_RATES[cityKey];
    if (p) {
      setCementRatePerBag(p.opc53);
      setSandRateCft(p.sandCft);
      setAggregateRateCft(p.aggregateCft);
      showToast(`Applied ${p.name} construction material rates!`);
    }
  };

  // -------------------------------------------------------------
  // Calculations: Concrete Structural Elements
  // -------------------------------------------------------------
  const concreteCalculation = useMemo(() => {
    const isM = unitMode === 'meters';
    let totalWetVolM3 = 0;

    const itemDetails = concreteElements.map(el => {
      let wetVolM3 = 0;
      if (isM) {
        // el.length in m, el.width in m, el.depthOrHeight in cm
        const depthM = el.depthOrHeight / 100;
        wetVolM3 = el.length * el.width * depthM * el.count;
      } else {
        // el.length in ft, el.width in ft, el.depthOrHeight in inches (or ft for column length/width)
        const depthFt = el.depthOrHeight / 12;
        const volCft = el.length * el.width * depthFt * el.count;
        wetVolM3 = volCft * 0.0283168; // 1 cft = 0.0283168 m3
      }

      // IS 456 Dry volume factor: 1.54
      const dryVolM3 = wetVolM3 * 1.54;
      const mix = CONCRETE_MIX_PRESETS[el.mixGrade] || CONCRETE_MIX_PRESETS.M20;
      const totalParts = mix.cementPart + mix.sandPart + mix.aggregatePart;

      const cementVolM3 = (mix.cementPart / totalParts) * dryVolM3;
      const sandVolM3 = (mix.sandPart / totalParts) * dryVolM3;
      const aggVolM3 = (mix.aggregatePart / totalParts) * dryVolM3;

      // 1 cement bag (50kg) = 0.0347 m3
      const bags = cementVolM3 / 0.0347;
      const sandCft = sandVolM3 * 35.3147;
      const aggCft = aggVolM3 * 35.3147;

      totalWetVolM3 += wetVolM3;

      return {
        ...el,
        wetVolM3: Number(wetVolM3.toFixed(3)),
        wetVolCft: Number((wetVolM3 * 35.3147).toFixed(2)),
        cementBags: Math.ceil(bags),
        cementKg: Math.round(bags * 50),
        sandCft: Number(sandCft.toFixed(1)),
        aggCft: Number(aggCft.toFixed(1))
      };
    });

    // Also factor Quick Concrete Calculator
    const quickWetVolM3 = isM ? quickConcreteVolume : quickConcreteVolume * 0.0283168;
    const quickDryVolM3 = quickWetVolM3 * 1.54 * (1 + quickConcreteWastage / 100);
    const qMix = CONCRETE_MIX_PRESETS[quickConcreteMix] || CONCRETE_MIX_PRESETS.M20;
    const qParts = qMix.cementPart + qMix.sandPart + qMix.aggregatePart;
    const qCementBags = Math.ceil(((qMix.cementPart / qParts) * quickDryVolM3) / 0.0347);
    const qSandCft = Number((((qMix.sandPart / qParts) * quickDryVolM3) * 35.3147).toFixed(1));
    const qAggCft = Number((((qMix.aggregatePart / qParts) * quickDryVolM3) * 35.3147).toFixed(1));

    let sumBags = 0;
    let sumSandCft = 0;
    let sumAggCft = 0;

    itemDetails.forEach(i => {
      sumBags += i.cementBags;
      sumSandCft += i.sandCft;
      sumAggCft += i.aggCft;
    });

    const totalWetVolCft = totalWetVolM3 * 35.3147;
    const waterLitres = Math.round(sumBags * 27.5); // 0.55 w/c ratio = ~27.5 L per bag
    const totalCostCement = sumBags * cementRatePerBag;
    const totalCostSand = sumSandCft * sandRateCft;
    const totalCostAgg = sumAggCft * aggregateRateCft;

    return {
      itemDetails,
      totalWetVolM3: Number(totalWetVolM3.toFixed(3)),
      totalWetVolCft: Number(totalWetVolCft.toFixed(1)),
      totalCementBags: sumBags,
      totalCementKg: sumBags * 50,
      totalCementTonnes: Number(((sumBags * 50) / 1000).toFixed(2)),
      totalSandCft: Number(sumSandCft.toFixed(1)),
      totalSandBrass: Number((sumSandCft / 100).toFixed(2)),
      totalAggCft: Number(sumAggCft.toFixed(1)),
      totalAggBrass: Number((sumAggCft / 100).toFixed(2)),
      waterLitres,
      totalCostCement,
      totalCostSand,
      totalCostAgg,
      grandCostConcrete: totalCostCement + totalCostSand + totalCostAgg,
      // Quick outputs
      qCementBags,
      qSandCft,
      qAggCft,
      qWaterLitres: Math.round(qCementBags * 27.5),
      qCostCement: qCementBags * cementRatePerBag
    };
  }, [concreteElements, quickConcreteVolume, quickConcreteMix, quickConcreteWastage, unitMode, cementRatePerBag, sandRateCft, aggregateRateCft]);

  // -------------------------------------------------------------
  // Calculations: Masonry Mortar & Cement
  // -------------------------------------------------------------
  const masonryCalculation = useMemo(() => {
    const isM = unitMode === 'meters';
    let lenM = isM ? masonryWallLength : masonryWallLength * 0.3048;
    let htM = isM ? masonryWallHeight : masonryWallHeight * 0.3048;
    let thkM = (masonryThicknessInches / 12) * 0.3048;

    const grossWallAreaSqM = lenM * htM;
    const grossWallAreaSqFt = grossWallAreaSqM * 10.7639;

    const openingsSqM = isM ? masonryOpeningsAreaSqFt : masonryOpeningsAreaSqFt * 0.092903;
    const netWallAreaSqM = Math.max(0, grossWallAreaSqM - openingsSqM);
    const netWallAreaSqFt = netWallAreaSqM * 10.7639;
    const netWallVolM3 = netWallAreaSqM * thkM;
    const netWallVolCft = netWallVolM3 * 35.3147;

    // Mortar volume in standard 9" brickwork is approx 28% of total wall volume per CPWD
    const wetMortarVolM3 = netWallVolM3 * 0.28;
    // Dry factor 1.33 + wastage
    const dryMortarVolM3 = wetMortarVolM3 * 1.33 * (1 + masonryWastagePct / 100);
    const dryMortarVolCft = dryMortarVolM3 * 35.3147;

    const parts = (MASONRY_MORTAR_PRESETS as any)[masonryMixRatio] || MASONRY_MORTAR_PRESETS['1:6'];
    const totalParts = parts.cement + parts.sand;

    const cementVolM3 = (parts.cement / totalParts) * dryMortarVolM3;
    const sandVolM3 = (parts.sand / totalParts) * dryMortarVolM3;

    const cementBags = Math.ceil(cementVolM3 / 0.0347);
    const cementKg = cementBags * 50;
    const sandCft = Number((sandVolM3 * 35.3147).toFixed(1));
    const sandBrass = Number((sandCft / 100).toFixed(2));

    // Bricks quantity estimate (approx 500 modular bricks or 440 country bricks per m3)
    const bricksCount = Math.ceil(netWallVolM3 * 450 * (1 + masonryWastagePct / 100));
    const waterLitres = Math.round(cementBags * 28 + netWallVolM3 * 15);
    const totalCostCement = cementBags * cementRatePerBag;
    const totalCostSand = sandCft * sandRateCft;

    return {
      grossWallAreaSqFt: Number(grossWallAreaSqFt.toFixed(1)),
      netWallAreaSqFt: Number(netWallAreaSqFt.toFixed(1)),
      netWallVolM3: Number(netWallVolM3.toFixed(3)),
      netWallVolCft: Number(netWallVolCft.toFixed(1)),
      wetMortarVolM3: Number(wetMortarVolM3.toFixed(3)),
      dryMortarVolCft: Number(dryMortarVolCft.toFixed(1)),
      cementBags,
      cementKg,
      sandCft,
      sandBrass,
      bricksCount,
      waterLitres,
      totalCostCement,
      totalCostSand,
      grandCostMasonry: totalCostCement + totalCostSand
    };
  }, [masonryWallLength, masonryWallHeight, masonryThicknessInches, masonryMixRatio, masonryOpeningsAreaSqFt, masonryWastagePct, unitMode, cementRatePerBag, sandRateCft]);

  // -------------------------------------------------------------
  // Calculations: Plastering Cement & Sand (IS 1661)
  // -------------------------------------------------------------
  const plasterCalculation = useMemo(() => {
    const isM = unitMode === 'meters';
    const grossAreaSqM = isM ? plasterSurfaceArea : plasterSurfaceArea * 0.092903;
    const openingDeductionSqM = isM ? plasterOpeningDeductionSqFt : plasterOpeningDeductionSqFt * 0.092903;

    const netAreaSqM = Math.max(0, grossAreaSqM - openingDeductionSqM);
    const netAreaSqFt = netAreaSqM * 10.7639;

    const preset = PLASTER_PRESETS[plasterPresetId];
    const thkMm = preset ? preset.thicknessMm : plasterCustomThicknessMm;
    const cementPart = preset ? preset.cementPart : (plasterCustomMix === '1:3' ? 1 : plasterCustomMix === '1:4' ? 1 : 1);
    const sandPart = preset ? preset.sandPart : (plasterCustomMix === '1:3' ? 3 : plasterCustomMix === '1:4' ? 4 : plasterCustomMix === '1:5' ? 5 : 6);
    const multiplier = preset ? preset.multiplier : 1.60;

    const wetVolM3 = netAreaSqM * (thkMm / 1000);
    const dryVolM3 = wetVolM3 * multiplier * (1 + plasterWastagePct / 100);
    const dryVolCft = dryVolM3 * 35.3147;

    const totalParts = cementPart + sandPart;
    const cementVolM3 = (cementPart / totalParts) * dryVolM3;
    const sandVolM3 = (sandPart / totalParts) * dryVolM3;

    const cementBags = Math.ceil(cementVolM3 / 0.0347);
    const cementKg = cementBags * 50;
    const sandCft = Number((sandVolM3 * 35.3147).toFixed(1));
    const sandBrass = Number((sandCft / 100).toFixed(2));

    // Waterproofing compound for external plaster: 200ml per bag (Dr. Fixit LW+)
    const isExternal = plasterPresetId.includes('external') || thkMm >= 20;
    const waterproofingLiters = isExternal ? Number(((cementBags * 200) / 1000).toFixed(1)) : 0;
    const waterLitres = Math.round(cementBags * 25);

    const totalCostCement = cementBags * cementRatePerBag;
    const totalCostSand = sandCft * sandRateCft;
    const totalCostWaterproofing = Math.round(waterproofingLiters * 160); // ~₹160/L

    return {
      netAreaSqFt: Number(netAreaSqFt.toFixed(1)),
      netAreaSqM: Number(netAreaSqM.toFixed(2)),
      wetVolM3: Number(wetVolM3.toFixed(3)),
      dryVolCft: Number(dryVolCft.toFixed(1)),
      cementBags,
      cementKg,
      sandCft,
      sandBrass,
      waterproofingLiters,
      waterLitres,
      totalCostCement,
      totalCostSand,
      totalCostWaterproofing,
      grandCostPlaster: totalCostCement + totalCostSand + totalCostWaterproofing
    };
  }, [plasterPresetId, plasterSurfaceArea, plasterCustomThicknessMm, plasterCustomMix, plasterOpeningDeductionSqFt, plasterWastagePct, unitMode, cementRatePerBag, sandRateCft]);

  // -------------------------------------------------------------
  // Consolidated Takeoff Data
  // -------------------------------------------------------------
  const consolidatedTakeoff = useMemo(() => {
    const totalBags = concreteCalculation.totalCementBags + masonryCalculation.cementBags + plasterCalculation.cementBags;
    const totalKg = totalBags * 50;
    const totalTonnes = Number((totalKg / 1000).toFixed(2));

    const totalSandCft = Number((concreteCalculation.totalSandCft + masonryCalculation.sandCft + plasterCalculation.sandCft).toFixed(1));
    const totalSandBrass = Number((totalSandCft / 100).toFixed(2));
    const totalAggCft = concreteCalculation.totalAggCft;
    const totalAggBrass = concreteCalculation.totalAggBrass;

    const totalCost = concreteCalculation.grandCostConcrete + masonryCalculation.grandCostMasonry + plasterCalculation.grandCostPlaster;

    // Storage requirements per IS 4082:
    // 1 bag occupies approx 0.3 sq.ft floor area when stacked 10 bags high
    const stackHeight = 10;
    const stacksCount = Math.ceil(totalBags / stackHeight);
    const storageFloorSqFt = Math.ceil(stacksCount * 3.5); // includes safety perimeter passage

    return {
      totalBags,
      totalKg,
      totalTonnes,
      totalSandCft,
      totalSandBrass,
      totalAggCft,
      totalAggBrass,
      totalCost,
      storageFloorSqFt,
      stacksCount
    };
  }, [concreteCalculation, masonryCalculation, plasterCalculation]);

  // -------------------------------------------------------------
  // Concrete Elements Actions
  // -------------------------------------------------------------
  const handleAddConcreteElement = () => {
    const newEl: StructuralElement = {
      id: `elem_${Date.now()}`,
      name: `Structural Element #${concreteElements.length + 1}`,
      type: 'beam',
      length: 20,
      width: 0.75,
      depthOrHeight: 12,
      count: 1,
      mixGrade: 'M20'
    };
    setConcreteElements(prev => [...prev, newEl]);
    showToast('Added structural element to concrete schedule');
  };

  const handleRemoveConcreteElement = (id: string) => {
    if (concreteElements.length <= 1) {
      showToast('Keep at least 1 element in schedule');
      return;
    }
    setConcreteElements(prev => prev.filter(e => e.id !== id));
    showToast('Removed element from schedule');
  };

  // -------------------------------------------------------------
  // WhatsApp Quotation & Exporters
  // -------------------------------------------------------------
  const generateWhatsAppQuote = () => {
    const quoteLines: string[] = [
      '*🏗️ CEMENT & MASONRY QUANTITY ESTIMATE (IS 456 / CPWD)*',
      '----------------------------------------',
      `*Location / Market:* ${CITY_CEMENT_RATES[selectedCity]?.name || 'Standard India'}`,
      `*Cement Rate Applied:* ₹${cementRatePerBag} / 50kg bag`,
      '----------------------------------------',
      '*MODULE-WISE CEMENT REQUIREMENT:*',
      `• *1. Structural Concrete:* ${concreteCalculation.totalCementBags} Bags (${concreteCalculation.totalCementKg} kg)`,
      `   - Fine Sand: ${concreteCalculation.totalSandCft} cft (${concreteCalculation.totalSandBrass} Brass)`,
      `   - Coarse Aggregate: ${concreteCalculation.totalAggCft} cft (${concreteCalculation.totalAggBrass} Brass)`,
      `• *2. Brick Masonry:* ${masonryCalculation.cementBags} Bags (${masonryCalculation.cementKg} kg)`,
      `   - Bricks Req: ~${masonryCalculation.bricksCount.toLocaleString()} Pcs`,
      `   - Sand: ${masonryCalculation.sandCft} cft (${masonryCalculation.sandBrass} Brass)`,
      `• *3. Wall Plastering:* ${plasterCalculation.cementBags} Bags (${plasterCalculation.cementKg} kg)`,
      `   - Sand: ${plasterCalculation.sandCft} cft (${plasterCalculation.sandBrass} Brass)`,
      plasterCalculation.waterproofingLiters > 0 ? `   - Waterproofing Chemical: ${plasterCalculation.waterproofingLiters} Litres` : '',
      '----------------------------------------',
      '*CONSOLIDATED MATERIAL TOTALS:*',
      `• *TOTAL CEMENT:* ${consolidatedTakeoff.totalBags} Bags (${consolidatedTakeoff.totalTonnes} Metric Tonnes)`,
      `• *TOTAL SAND:* ${consolidatedTakeoff.totalSandCft} cft (${consolidatedTakeoff.totalSandBrass} Brass)`,
      `• *TOTAL AGGREGATE:* ${consolidatedTakeoff.totalAggCft} cft (${consolidatedTakeoff.totalAggBrass} Brass)`,
      `• *ESTIMATED TOTAL BUDGET:* ₹${consolidatedTakeoff.totalCost.toLocaleString('en-IN')}`,
      `• *Storage Footprint:* ~${consolidatedTakeoff.storageFloorSqFt} sq.ft (${consolidatedTakeoff.stacksCount} stacks @ 10 bags high)`,
      '----------------------------------------',
      '_Generated via Toolique Cement Calculator India._'
    ].filter(Boolean);

    return quoteLines.join('\n');
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

  // Multi-Sheet Excel Workbook Export
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Consolidated Project Summary
    const summaryData: (string | number)[][] = [
      ['PROJECT CEMENT & MATERIALS QUANTITY TAKEOFF'],
      ['Standards Compliant:', 'IS 456:2000, IS 1077, IS 1661, CPWD DSR'],
      ['City / Region:', CITY_CEMENT_RATES[selectedCity]?.name || 'Standard'],
      ['Date:', new Date().toLocaleDateString('en-IN')],
      [],
      ['CONSTRUCTION DISCIPLINE', 'CEMENT (50kg BAGS)', 'CEMENT (KG)', 'SAND (CFT)', 'AGGREGATE (CFT)', 'EST. COST (INR)'],
      ['1. Structural Concrete', concreteCalculation.totalCementBags, concreteCalculation.totalCementKg, concreteCalculation.totalSandCft, concreteCalculation.totalAggCft, concreteCalculation.grandCostConcrete],
      ['2. Brickwork Masonry', masonryCalculation.cementBags, masonryCalculation.cementKg, masonryCalculation.sandCft, 0, masonryCalculation.grandCostMasonry],
      ['3. Wall Plastering', plasterCalculation.cementBags, plasterCalculation.cementKg, plasterCalculation.sandCft, 0, plasterCalculation.grandCostPlaster],
      [],
      ['GRAND TOTAL PROJECT REQUIREMENTS', consolidatedTakeoff.totalBags, `${consolidatedTakeoff.totalTonnes} Tonnes`, `${consolidatedTakeoff.totalSandBrass} Brass`, `${consolidatedTakeoff.totalAggBrass} Brass`, consolidatedTakeoff.totalCost],
      [],
      ['SITE LOGISTICS & STORAGE (IS 4082)', 'VALUE', 'UNIT'],
      ['Total Stack Count (10 bags high)', consolidatedTakeoff.stacksCount, 'Stacks'],
      ['Required Storage Floor Area', consolidatedTakeoff.storageFloorSqFt, 'Sq.Ft (Raised Timber Base)']
    ];

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Consolidated Indent');

    // Sheet 2: Concrete Elements Schedule
    const concreteRows: (string | number)[][] = [
      ['STRUCTURAL CONCRETE ELEMENTS SCHEDULE'],
      [],
      ['Element Description', 'Type', 'Dimensions', 'Count', 'Mix Grade', 'Wet Vol (m³)', 'Cement Bags', 'Sand (cft)', 'Aggregate (cft)']
    ];

    concreteCalculation.itemDetails.forEach(el => {
      concreteRows.push([
        el.name,
        el.type.toUpperCase(),
        `${el.length}x${el.width} (${el.depthOrHeight} ${unitMode === 'meters' ? 'cm' : 'in'})`,
        el.count,
        el.mixGrade,
        el.wetVolM3,
        el.cementBags,
        el.sandCft,
        el.aggCft
      ]);
    });

    const wsConcrete = XLSX.utils.aoa_to_sheet(concreteRows);
    XLSX.utils.book_append_sheet(wb, wsConcrete, 'Concrete Schedule');

    XLSX.writeFile(wb, `Cement_BOQ_Material_Indent_${Date.now()}.xlsx`);
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
    doc.text('CEMENT & MASONRY MATERIAL QUANTITY TAKEOFF', margin, 16);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225);
    doc.text('Compliant with IS 456:2000, IS 1077, IS 1661:1972 & CPWD DSR Specifications', margin, 23);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')} | Market: ${CITY_CEMENT_RATES[selectedCity]?.name || 'Standard'} (Cement: Rs.${cementRatePerBag}/bag)`, margin, 29);

    y = 44;

    // Summary Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, 182, 38, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(79, 70, 229); // indigo-600
    doc.text('CONSOLIDATED PROJECT MATERIAL INDENT', margin + 4, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);

    doc.text(`• Total Cement Required: ${consolidatedTakeoff.totalBags} Bags (${consolidatedTakeoff.totalTonnes} Metric Tonnes)`, margin + 4, y + 14);
    doc.text(`• Fine Sand / M-Sand: ${consolidatedTakeoff.totalSandCft} cft (${consolidatedTakeoff.totalSandBrass} Brass)`, margin + 4, y + 20);
    doc.text(`• Coarse Aggregate (20mm): ${consolidatedTakeoff.totalAggCft} cft (${consolidatedTakeoff.totalAggBrass} Brass)`, margin + 4, y + 26);
    doc.text(`• Total Estimated Material Budget: Rs.${consolidatedTakeoff.totalCost.toLocaleString('en-IN')}`, margin + 4, y + 32);

    doc.text(`• Structural Concrete Bags: ${concreteCalculation.totalCementBags} Bags`, margin + 105, y + 14);
    doc.text(`• Brick Masonry Bags: ${masonryCalculation.cementBags} Bags`, margin + 105, y + 20);
    doc.text(`• Wall Plastering Bags: ${plasterCalculation.cementBags} Bags`, margin + 105, y + 26);
    doc.text(`• Storage Footprint: ~${consolidatedTakeoff.storageFloorSqFt} sq.ft (IS 4082)`, margin + 105, y + 32);

    y += 44;

    // Discipline Breakdown Table Header
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(margin, y, 182, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('Work Discipline', margin + 3, y + 5);
    doc.text('Dry Mix Ratio', margin + 55, y + 5);
    doc.text('Cement Bags', margin + 95, y + 5);
    doc.text('Sand (cft)', margin + 130, y + 5);
    doc.text('Est. Cost (Rs)', margin + 155, y + 5);

    y += 7;

    const disciplineRows = [
      ['1. Structural Concrete (Slabs, Beams, Columns)', 'M20 / M25 (1.54x)', `${concreteCalculation.totalCementBags} Bags`, `${concreteCalculation.totalSandCft} cft`, `Rs.${concreteCalculation.grandCostConcrete.toLocaleString('en-IN')}`],
      ['2. Brickwork Masonry (Walls & Deductions)', `${masonryMixRatio} Mortar (1.33x)`, `${masonryCalculation.cementBags} Bags`, `${masonryCalculation.sandCft} cft`, `Rs.${masonryCalculation.grandCostMasonry.toLocaleString('en-IN')}`],
      ['3. Wall & Ceiling Plastering', `${plasterPresetId} (1.60x)`, `${plasterCalculation.cementBags} Bags`, `${plasterCalculation.sandCft} cft`, `Rs.${plasterCalculation.grandCostPlaster.toLocaleString('en-IN')}`]
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
      doc.text(row[1], margin + 55, y + 5);
      doc.setFont('helvetica', 'bold');
      doc.text(row[2], margin + 95, y + 5);
      doc.setFont('helvetica', 'normal');
      doc.text(row[3], margin + 130, y + 5);
      doc.setFont('helvetica', 'bold');
      doc.text(row[4], margin + 155, y + 5);
      y += 7;
    });

    // Grand Total Banner
    y += 3;
    doc.setFillColor(16, 185, 129); // emerald-500
    doc.roundedRect(margin, y, 182, 12, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('TOTAL CEMENT PROCUREMENT:', margin + 4, y + 8);
    doc.setFontSize(13);
    doc.text(`${consolidatedTakeoff.totalBags} Bags (Rs.${consolidatedTakeoff.totalCost.toLocaleString('en-IN')})`, margin + 115, y + 8.5);

    y += 18;

    // Cement Storage & Site Rules (IS 4082)
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(margin, y, 182, 24, 2, 2, 'F');
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('Cement Storage Guidelines per IS 4082:', margin + 4, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text('• Stacking Limit: Max 10 to 12 bags high on raised timber plinths (150mm above ground) to prevent warehouse setting.', margin + 4, y + 10);
    doc.text('• Weather Protection: Keep min 450mm clear from external walls; enclose in heavy gauge tarpaulin sheets.', margin + 4, y + 15);
    doc.text('• Shelf-Life Rule: Use cement within 90 days of manufacturing. Strength reduces 20% after 3 months & 30% after 6 months.', margin + 4, y + 20);

    y += 28;

    // Engineering Notes
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.text('Standard Civil Engineering Coefficients Applied:', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text('1. Concrete dry volume factor: 1.54x wet volume (IS 456). 1 bag = 50kg = 0.0347 m3.', margin, y + 4.5);
    doc.text('2. Brickwork mortar dry factor: 1.33x wet volume. Deductions follow IS 1200 Part 3.', margin, y + 8.5);
    doc.text('3. Plastering dry factor: 1.60x nominal volume (1.33x dry + 20% joint filling & wastage per IS 1661).', margin, y + 12.5);

    doc.save(`Cement_Material_Indent_${Date.now()}.pdf`);
    showToast('Downloaded PDF Engineering Takeoff!');
  };

  const handleReset = () => {
    setConcreteElements([
      { id: 'elem_1', name: 'Main RCC Roof Slab (5")', type: 'slab', length: 30, width: 20, depthOrHeight: 5, count: 1, mixGrade: 'M20' },
      { id: 'elem_2', name: 'Main Columns (9" x 12")', type: 'column', length: 0.75, width: 1.0, depthOrHeight: 120, count: 8, mixGrade: 'M25' },
      { id: 'elem_3', name: 'Plinth & Roof Beams (9" x 12")', type: 'beam', length: 120, width: 0.75, depthOrHeight: 12, count: 1, mixGrade: 'M20' }
    ]);
    setQuickConcreteVolume(100);
    setQuickConcreteMix('M20');
    setMasonryWallLength(30);
    setMasonryWallHeight(10);
    setMasonryThicknessInches(9);
    setMasonryMixRatio('1:6');
    setMasonryOpeningsAreaSqFt(42);
    setPlasterPresetId('internal_12mm_14');
    setPlasterSurfaceArea(800);
    handleApplyCityRates('mumbai');
    showToast('Reset all parameters to standard Indian civil engineering values!');
  };

  return (
    <>
      <SEO
        title="Cement Calculator India | Concrete, Brickwork & Plaster Bags Estimator (IS 456)"
        description="Calculate exact cement bags required for concrete slabs, columns, beams, brick masonry walls, and plastering per IS 456, IS 1077 & IS 1661. Free PDF & Excel BOQ export."
        keywords={['cement calculator india', 'calculate cement bags for slab', 'cement required for brickwork', 'plaster cement calculation formula', 'is 456 cement bag volume', 'opc 53 vs ppc cement', 'cement sand ratio calculator']}
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
        <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-zinc-950 text-white border border-indigo-800/40 shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <Building className="w-80 h-80" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-black uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5" />
                <span>IS 456:2000 • IS 1077 • IS 1661:1972 • IS 4082 Compliant</span>
              </div>
              <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white">
                Cement Quantity Calculator India
              </h1>
              <p className="text-xs md:text-sm text-indigo-200/80 leading-relaxed">
                High-precision civil engineering estimator for 50kg cement bags, sand, and aggregate across Structural Concrete (M5 to M30), Brickwork Masonry, and Wall/Ceiling Plastering. Includes IS dry volume expansion factors, water-cement ratios, and site storage footprint.
              </p>
            </div>

            {/* Top Stat Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl text-right min-w-[210px] shadow-lg">
              <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider block">
                Total Cement Indent
              </span>
              <div className="text-2xl md:text-3xl font-black text-indigo-300 font-mono">
                {activeTab === 'concrete' ? concreteCalculation.totalCementBags : activeTab === 'masonry' ? masonryCalculation.cementBags : activeTab === 'plaster' ? plasterCalculation.cementBags : consolidatedTakeoff.totalBags}
                <span className="text-sm font-bold text-white/80 ml-1.5">Bags</span>
              </div>
              <span className="text-[10px] text-indigo-200/70 block font-mono">
                {activeTab === 'concrete' ? `${concreteCalculation.totalCementTonnes} Tonnes` : activeTab === 'masonry' ? `${(masonryCalculation.cementKg / 1000).toFixed(2)} Tonnes` : activeTab === 'plaster' ? `${(plasterCalculation.cementKg / 1000).toFixed(2)} Tonnes` : `${consolidatedTakeoff.totalTonnes} Tonnes`} • ₹{(activeTab === 'concrete' ? concreteCalculation.totalCostCement : activeTab === 'masonry' ? masonryCalculation.totalCostCement : activeTab === 'plaster' ? plasterCalculation.totalCostCement : consolidatedTakeoff.totalBags * cementRatePerBag).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Navigation Tab Bar */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap gap-2">
            {[
              { id: 'concrete', label: '1. Concrete Elements (Slab/Beam/Col)', icon: Building },
              { id: 'masonry', label: '2. Brick Masonry Mortar', icon: Layers },
              { id: 'plaster', label: '3. Wall & Ceiling Plastering', icon: Ruler },
              { id: 'consolidated', label: `4. Consolidated Indent (${consolidatedTakeoff.totalBags} Bags)`, icon: TrendingDown },
              { id: 'storage_rates', label: '5. Storage, Rates & Quote', icon: Share2 }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-indigo-500 text-white font-black shadow-lg shadow-indigo-500/30'
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
        {/* TAB 1: Concrete Structural Elements */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'concrete' && (
          <div className="space-y-6">
            
            {/* Quick Concrete Mix Estimator Banner */}
            <div className="p-6 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent border border-indigo-500/30 rounded-3xl space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Building className="w-4 h-4 text-indigo-500" />
                    Quick Concrete Batch Estimator (Direct Volume)
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Instantly compute cement bags, sand, and 20mm aggregate for any bulk wet concrete volume.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl flex text-xs font-bold">
                    <button
                      onClick={() => setUnitMode('feet')}
                      className={`px-3 py-1 rounded-lg transition ${unitMode === 'feet' ? 'bg-indigo-600 text-white font-black' : 'text-zinc-500'}`}
                    >
                      Cu.Ft (cft)
                    </button>
                    <button
                      onClick={() => setUnitMode('meters')}
                      className={`px-3 py-1 rounded-lg transition ${unitMode === 'meters' ? 'bg-indigo-600 text-white font-black' : 'text-zinc-500'}`}
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
                  <label className="text-[10px] font-bold text-zinc-500 block">Total Wet Concrete Vol ({unitMode === 'meters' ? 'm³' : 'cu.ft'})</label>
                  <input
                    type="number"
                    value={quickConcreteVolume}
                    onChange={(e) => setQuickConcreteVolume(Math.max(0.1, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 block">Concrete Mix Grade (IS 456)</label>
                  <select
                    value={quickConcreteMix}
                    onChange={(e) => setQuickConcreteMix(e.target.value)}
                    className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-xs font-bold"
                  >
                    {Object.values(CONCRETE_MIX_PRESETS).map(m => (
                      <option key={m.id} value={m.id}>{m.name} - {m.recommendedFor}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 block">Wastage / Spill Allowance (%)</label>
                  <input
                    type="number"
                    value={quickConcreteWastage}
                    onChange={(e) => setQuickConcreteWastage(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-xs font-mono font-bold"
                  />
                </div>
                <div className="p-2.5 rounded-xl bg-indigo-600 text-white flex flex-col justify-center text-center">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-200">Quick Cement Output</span>
                  <span className="text-lg font-black font-mono">{concreteCalculation.qCementBags} Bags</span>
                  <span className="text-[9px] text-indigo-100">Sand: {concreteCalculation.qSandCft} cft | Agg: {concreteCalculation.qAggCft} cft</span>
                </div>
              </div>
            </div>

            {/* Structural Elements Schedule Table */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-5 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                    Structural RCC Elements Schedule ({concreteElements.length} Elements)
                  </h3>
                  <p className="text-[10px] text-zinc-400">
                    Individual Slabs, Columns, Beams, and Footings takeoff with mix designs per IS 456:2000.
                  </p>
                </div>
                <button
                  onClick={handleAddConcreteElement}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-black text-xs hover:bg-indigo-500 transition inline-flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Element</span>
                </button>
              </div>

              {/* Elements Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                      <th className="py-3 px-3">Element Name</th>
                      <th className="py-3 px-3 text-center">Type</th>
                      <th className="py-3 px-3 text-center">Dimensions (L x W x D)</th>
                      <th className="py-3 px-3 text-center">Count</th>
                      <th className="py-3 px-3 text-center">Mix Grade</th>
                      <th className="py-3 px-3 text-right">Wet Volume</th>
                      <th className="py-3 px-3 text-right">Cement (Bags)</th>
                      <th className="py-3 px-3 text-right">Sand (cft)</th>
                      <th className="py-3 px-3 text-right">Agg (cft)</th>
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
                          <select
                            value={el.type}
                            onChange={(e) => {
                              const val = e.target.value as any;
                              setConcreteElements(prev => prev.map(item => item.id === el.id ? { ...item, type: val } : item));
                            }}
                            className="bg-zinc-100 dark:bg-zinc-800 rounded px-1.5 py-0.5 text-[10px] font-bold"
                          >
                            <option value="slab">Slab</option>
                            <option value="column">Column</option>
                            <option value="beam">Beam</option>
                            <option value="footing">Footing</option>
                            <option value="flooring">Flooring PCC</option>
                          </select>
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
                        <td className="py-3 px-3 text-center">
                          <select
                            value={el.mixGrade}
                            onChange={(e) => {
                              const val = e.target.value;
                              setConcreteElements(prev => prev.map(item => item.id === el.id ? { ...item, mixGrade: val } : item));
                            }}
                            className="bg-zinc-100 dark:bg-zinc-800 rounded px-1.5 py-0.5 text-[10px] font-bold"
                          >
                            {Object.values(CONCRETE_MIX_PRESETS).map(m => (
                              <option key={m.id} value={m.id}>{m.grade}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-3 text-right font-mono">
                          {el.wetVolM3} m³
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-black text-indigo-600 dark:text-indigo-400">
                          {el.cementBags}
                        </td>
                        <td className="py-3 px-3 text-right font-mono">
                          {el.sandCft}
                        </td>
                        <td className="py-3 px-3 text-right font-mono">
                          {el.aggCft}
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

              {/* Consolidated Concrete Summary Card */}
              <div className="p-6 rounded-2xl bg-zinc-950 text-white border border-zinc-800 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Total Concrete Cement</span>
                  <div className="text-2xl font-black text-indigo-400 font-mono">
                    {concreteCalculation.totalCementBags} <span className="text-xs text-zinc-400 font-normal">Bags ({concreteCalculation.totalCementTonnes} T)</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Fine Sand Req</span>
                  <div className="text-2xl font-black text-amber-400 font-mono">
                    {concreteCalculation.totalSandCft} <span className="text-xs text-zinc-400 font-normal">cft ({concreteCalculation.totalSandBrass} Brass)</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">20mm Coarse Aggregate</span>
                  <div className="text-2xl font-black text-amber-400 font-mono">
                    {concreteCalculation.totalAggCft} <span className="text-xs text-zinc-400 font-normal">cft ({concreteCalculation.totalAggBrass} Brass)</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Concrete Material Budget</span>
                  <div className="text-2xl font-black text-emerald-400 font-mono">
                    ₹{concreteCalculation.grandCostConcrete.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: Brick Masonry Mortar */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'masonry' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Masonry Input Panel */}
            <div className="lg:col-span-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-6 shadow-sm">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🧱</span>
                  <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                    Brick Masonry Dimensions &amp; Mix
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 block">Wall Length ({unitMode === 'meters' ? 'm' : 'ft'})</label>
                  <input
                    type="number"
                    value={masonryWallLength}
                    onChange={(e) => setMasonryWallLength(Math.max(0.1, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-mono font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 block">Wall Height ({unitMode === 'meters' ? 'm' : 'ft'})</label>
                  <input
                    type="number"
                    value={masonryWallHeight}
                    onChange={(e) => setMasonryWallHeight(Math.max(0.1, parseFloat(e.target.value) || 0))}
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
                    <option value={4.5}>4.5&quot; (Half-Brick Partition)</option>
                    <option value={9}>9&quot; (Standard 1-Brick External)</option>
                    <option value={13.5}>13.5&quot; (1.5-Brick Heavy)</option>
                    <option value={18}>18&quot; (2-Brick Foundation)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 block">Mortar Mix Ratio (Cement:Sand)</label>
                  <select
                    value={masonryMixRatio}
                    onChange={(e) => setMasonryMixRatio(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-bold text-xs"
                  >
                    {Object.values(MASONRY_MORTAR_PRESETS).map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 block">Openings Deducted (Doors/Windows)</label>
                  <input
                    type="number"
                    value={masonryOpeningsAreaSqFt}
                    onChange={(e) => setMasonryOpeningsAreaSqFt(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-mono font-bold text-xs"
                  />
                  <span className="text-[9px] text-zinc-400">IS 1200 Pt-3 rules apply</span>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 block">Wastage Markup (%)</label>
                  <input
                    type="number"
                    value={masonryWastagePct}
                    onChange={(e) => setMasonryWastagePct(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-mono font-bold text-xs"
                  />
                  <span className="text-[9px] text-zinc-400">5% standard CPWD norm</span>
                </div>
              </div>
            </div>

            {/* Masonry Output Panel */}
            <div className="lg:col-span-6 space-y-5">
              <div className="bg-gradient-to-br from-indigo-500/10 via-amber-500/5 to-zinc-900/40 border-2 border-indigo-500/40 rounded-3xl p-6 space-y-5 shadow-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                      Cement for Brick Masonry
                    </span>
                    <div className="text-4xl font-black text-zinc-900 dark:text-white font-mono">
                      {masonryCalculation.cementBags}
                      <span className="text-sm font-bold text-zinc-500 ml-1.5">Bags</span>
                    </div>
                    <span className="text-xs text-zinc-500 font-mono">{masonryCalculation.cementKg} kg OPC/PPC</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400 block">Net Masonry Vol</span>
                    <span className="text-sm font-black text-zinc-800 dark:text-zinc-200 font-mono">
                      {masonryCalculation.netWallVolM3} m³ ({masonryCalculation.netWallVolCft} cft)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">River / M-Sand</span>
                    <div className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">
                      {masonryCalculation.sandCft} cft
                    </div>
                    <span className="text-[10px] text-zinc-500">{masonryCalculation.sandBrass} Brass</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Bricks Count</span>
                    <div className="text-xl font-black text-orange-600 dark:text-orange-400 font-mono">
                      ~{masonryCalculation.bricksCount.toLocaleString()} Pcs
                    </div>
                    <span className="text-[10px] text-zinc-500">Traditional / Modular</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800 text-xs">
                  <div className="flex justify-between py-1 text-zinc-600 dark:text-zinc-400">
                    <span>Dry Mortar Volume (1.33x factor):</span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-white">{masonryCalculation.dryMortarVolCft} cft</span>
                  </div>
                  <div className="flex justify-between py-1 text-zinc-600 dark:text-zinc-400">
                    <span>Curing Water Requirement:</span>
                    <span className="font-mono font-bold text-sky-600 dark:text-sky-400">~{masonryCalculation.waterLitres} Litres</span>
                  </div>
                  <div className="flex justify-between py-1 text-zinc-600 dark:text-zinc-400">
                    <span>Estimated Masonry Cement Cost:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">₹{masonryCalculation.totalCostCement.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: Wall & Ceiling Plastering (IS 1661) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'plaster' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Plaster Input Panel */}
            <div className="lg:col-span-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-6 shadow-sm">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🖌️</span>
                  <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                    Plastering Area &amp; Specifications (IS 1661)
                  </h3>
                </div>
              </div>

              {/* Preset Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 block">Select Plaster Location / Coating Preset:</label>
                <select
                  value={plasterPresetId}
                  onChange={(e) => setPlasterPresetId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-bold text-xs"
                >
                  {Object.values(PLASTER_PRESETS).map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <p className="text-[11px] text-zinc-500 italic">
                  {PLASTER_PRESETS[plasterPresetId]?.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 block">Surface Area ({unitMode === 'meters' ? 'm²' : 'sq.ft'})</label>
                  <input
                    type="number"
                    value={plasterSurfaceArea}
                    onChange={(e) => setPlasterSurfaceArea(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-mono font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 block">Openings Deduction ({unitMode === 'meters' ? 'm²' : 'sq.ft'})</label>
                  <input
                    type="number"
                    value={plasterOpeningDeductionSqFt}
                    onChange={(e) => setPlasterOpeningDeductionSqFt(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-mono font-bold text-xs"
                  />
                  <span className="text-[9px] text-zinc-400">IS 1200 Part 12 rules apply</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 block">Plaster Mix Ratio</label>
                  <select
                    value={plasterCustomMix}
                    onChange={(e) => setPlasterCustomMix(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-bold text-xs"
                  >
                    <option value="1:3">1:3 (Rich Ceiling/Waterproof)</option>
                    <option value="1:4">1:4 (Standard Internal)</option>
                    <option value="1:5">1:5 (Economy Internal)</option>
                    <option value="1:6">1:6 (Smooth Finish)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 block">Custom Thickness (mm)</label>
                  <input
                    type="number"
                    value={plasterCustomThicknessMm}
                    onChange={(e) => setPlasterCustomThicknessMm(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-mono font-bold text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 block">Wastage / Joint Filling (%)</label>
                <input
                  type="number"
                  value={plasterWastagePct}
                  onChange={(e) => setPlasterWastagePct(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-mono font-bold text-xs"
                />
                <span className="text-[9px] text-zinc-400">10% standard for plaster drops &amp; joints</span>
              </div>
            </div>

            {/* Plaster Output Panel */}
            <div className="lg:col-span-6 space-y-5">
              <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-zinc-900/40 border-2 border-indigo-500/40 rounded-3xl p-6 space-y-5 shadow-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                      Cement for Plastering
                    </span>
                    <div className="text-4xl font-black text-zinc-900 dark:text-white font-mono">
                      {plasterCalculation.cementBags}
                      <span className="text-sm font-bold text-zinc-500 ml-1.5">Bags</span>
                    </div>
                    <span className="text-xs text-zinc-500 font-mono">{plasterCalculation.cementKg} kg (PPC recommended)</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400 block">Net Plaster Surface</span>
                    <span className="text-sm font-black text-zinc-800 dark:text-zinc-200 font-mono">
                      {plasterCalculation.netAreaSqFt} sq.ft ({plasterCalculation.netAreaSqM} m²)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Screened Plaster Sand</span>
                    <div className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">
                      {plasterCalculation.sandCft} cft
                    </div>
                    <span className="text-[10px] text-zinc-500">{plasterCalculation.sandBrass} Brass (Zone IV sand)</span>
                  </div>

                  {plasterCalculation.waterproofingLiters > 0 ? (
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 space-y-1">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Waterproofing Chemical</span>
                      <div className="text-xl font-black text-sky-600 dark:text-sky-400 font-mono">
                        {plasterCalculation.waterproofingLiters} L
                      </div>
                      <span className="text-[10px] text-zinc-500">Dr. Fixit LW+ (200ml/bag)</span>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 space-y-1">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Curing Water</span>
                      <div className="text-xl font-black text-sky-600 dark:text-sky-400 font-mono">
                        ~{plasterCalculation.waterLitres} L
                      </div>
                      <span className="text-[10px] text-zinc-500">Min 7 days ponding/spray</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800 text-xs">
                  <div className="flex justify-between py-1 text-zinc-600 dark:text-zinc-400">
                    <span>Dry Mortar Volume (1.60x multiplier):</span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-white">{plasterCalculation.dryVolCft} cft</span>
                  </div>
                  <div className="flex justify-between py-1 text-zinc-600 dark:text-zinc-400">
                    <span>Estimated Plaster Material Budget:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">₹{plasterCalculation.grandCostPlaster.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 4: Consolidated Project Indent & Cement Grade Selector */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'consolidated' && (
          <div className="space-y-6">
            
            {/* Grand Rollup Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-200">Total Project Cement</span>
                <div className="text-3xl font-black font-mono">
                  {consolidatedTakeoff.totalBags} <span className="text-sm font-normal">Bags</span>
                </div>
                <span className="text-[10px] text-indigo-100 block">{consolidatedTakeoff.totalTonnes} Metric Tonnes</span>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Total Fine Sand</span>
                <div className="text-3xl font-black font-mono text-amber-600 dark:text-amber-400">
                  {consolidatedTakeoff.totalSandCft} <span className="text-sm font-normal text-zinc-500">cft</span>
                </div>
                <span className="text-[10px] text-zinc-400 block">{consolidatedTakeoff.totalSandBrass} Brass</span>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">20mm Aggregate</span>
                <div className="text-3xl font-black font-mono text-zinc-900 dark:text-white">
                  {consolidatedTakeoff.totalAggCft} <span className="text-sm font-normal text-zinc-500">cft</span>
                </div>
                <span className="text-[10px] text-zinc-400 block">{consolidatedTakeoff.totalAggBrass} Brass</span>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Estimated Total Cost</span>
                <div className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                  ₹{consolidatedTakeoff.totalCost.toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-zinc-400 block">Cement + Sand + Agg</span>
              </div>
            </div>

            {/* Discipline Summary Table */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-5 shadow-sm">
              <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                Consolidated Discipline-Wise Takeoff
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                      <th className="py-3 px-3">Discipline</th>
                      <th className="py-3 px-3 text-center">Applied Dry Multiplier</th>
                      <th className="py-3 px-3 text-right">Cement (Bags)</th>
                      <th className="py-3 px-3 text-right">Sand (cft)</th>
                      <th className="py-3 px-3 text-right">Aggregate (cft)</th>
                      <th className="py-3 px-3 text-right">Estimated Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-medium">
                    <tr className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/20">
                      <td className="py-3 px-3 font-bold text-zinc-900 dark:text-white">1. Structural Concrete (RCC / PCC)</td>
                      <td className="py-3 px-3 text-center font-mono text-zinc-500">1.54x (IS 456)</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">{concreteCalculation.totalCementBags}</td>
                      <td className="py-3 px-3 text-right font-mono">{concreteCalculation.totalSandCft}</td>
                      <td className="py-3 px-3 text-right font-mono">{concreteCalculation.totalAggCft}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">₹{concreteCalculation.grandCostConcrete.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/20">
                      <td className="py-3 px-3 font-bold text-zinc-900 dark:text-white">2. Brickwork Masonry ({masonryMixRatio})</td>
                      <td className="py-3 px-3 text-center font-mono text-zinc-500">1.33x (CPWD)</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">{masonryCalculation.cementBags}</td>
                      <td className="py-3 px-3 text-right font-mono">{masonryCalculation.sandCft}</td>
                      <td className="py-3 px-3 text-right font-mono">—</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">₹{masonryCalculation.grandCostMasonry.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/20">
                      <td className="py-3 px-3 font-bold text-zinc-900 dark:text-white">3. Wall &amp; Ceiling Plastering</td>
                      <td className="py-3 px-3 text-center font-mono text-zinc-500">1.60x (IS 1661)</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">{plasterCalculation.cementBags}</td>
                      <td className="py-3 px-3 text-right font-mono">{plasterCalculation.sandCft}</td>
                      <td className="py-3 px-3 text-right font-mono">—</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">₹{plasterCalculation.grandCostPlaster.toLocaleString('en-IN')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cement Grades Application Guide */}
            <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-4 shadow-sm">
              <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <HardHat className="w-4 h-4 text-indigo-500" />
                Indian Cement Grades Selection Guide (OPC 53 vs PPC vs PSC)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {CEMENT_TYPE_GUIDE.map((c, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 block w-fit">
                      {c.tag}
                    </span>
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-white">{c.grade}</h4>
                    <p className="text-[11px] text-zinc-500">{c.bestFor}</p>
                    <div className="space-y-1 text-[10px] text-zinc-400 pt-2 border-t border-zinc-200/60 dark:border-zinc-800">
                      <div><strong>Strength:</strong> {c.strength}</div>
                      <div><strong>Curing:</strong> {c.curingPeriod}</div>
                      <div><strong>Thermal:</strong> {c.heat}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 5: Storage Logistics, Rates & WhatsApp Quote */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'storage_rates' && (
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* City Rates Modifier */}
              <div className="lg:col-span-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-6 shadow-sm">
                <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                    Regional City Market Rates
                  </h3>
                  <p className="text-[10px] text-zinc-400">
                    Average retail prices for Grade A cement brands (Ultratech, ACC, Ambuja, Dalmia, Shree).
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-zinc-500 block">Select Market City:</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(CITY_CEMENT_RATES).map(([key, c]) => (
                      <button
                        key={key}
                        onClick={() => handleApplyCityRates(key)}
                        className={`p-2 rounded-xl text-xs font-bold transition text-left border ${
                          selectedCity === key
                            ? 'bg-indigo-600 text-white border-indigo-600 font-black shadow-md'
                            : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 block">Cement Rate (₹/bag)</label>
                    <input
                      type="number"
                      value={cementRatePerBag}
                      onChange={(e) => setCementRatePerBag(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-mono font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 block">Sand Rate (₹/cft)</label>
                    <input
                      type="number"
                      value={sandRateCft}
                      onChange={(e) => setSandRateCft(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-mono font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 block">Aggregate (₹/cft)</label>
                    <input
                      type="number"
                      value={aggregateRateCft}
                      onChange={(e) => setAggregateRateCft(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-mono font-bold text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Site Storage Logistics Card (IS 4082) */}
              <div className="lg:col-span-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-sm">
                <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3 flex items-center gap-2">
                  <Warehouse className="w-4 h-4 text-indigo-500" />
                  <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                    Site Storage &amp; Warehouse Planning (IS 4082)
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Storage Floor Area</span>
                    <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                      ~{consolidatedTakeoff.storageFloorSqFt} sq.ft
                    </div>
                    <span className="text-[9px] text-zinc-500">Raised timber base (150mm)</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total Stacks</span>
                    <div className="text-xl font-black text-zinc-900 dark:text-white font-mono">
                      {consolidatedTakeoff.stacksCount} Stacks
                    </div>
                    <span className="text-[9px] text-zinc-500">Max 10 bags high per stack</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1.5 text-xs text-amber-900 dark:text-amber-300">
                  <div className="flex items-center gap-1.5 font-bold">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    <span>Shelf-Life &amp; Strength Degradation Rules:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-400">
                    Use cement within 90 days of manufacturing date printed on bag. Strength reduces by <strong>20% at 3 months</strong>, <strong>30% at 6 months</strong>, and <strong>40% at 12 months</strong> due to atmospheric moisture absorption.
                  </p>
                </div>
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
                    Share complete consolidated cement and material indent directly with contractors and clients.
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
                    Engineering PDF Report
                  </span>
                  <p className="text-[11px] text-zinc-500">
                    High-res PDF document with IS 456 / IS 1661 technical coefficients, storage notes, and breakdown.
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
        <MaterialTrendGraph allowedMaterials={['cement', 'sand', 'aggregate']} />

        {/* Comprehensive Technical Guide & Engineering FAQs (SEO / AEO / GEO) */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 space-y-8 shadow-sm">
          
          <div className="space-y-3">
            <h3 className="text-lg md:text-xl font-black text-zinc-900 dark:text-white">
              Indian Standard (IS) Cement Calculation Rules &amp; Mix Design Mathematics
            </h3>
            <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Cement calculations in India are governed by <strong>IS 456:2000 (Plain &amp; Reinforced Concrete)</strong>, <strong>IS 269 / IS 1489 (OPC &amp; PPC Specifications)</strong>, <strong>IS 1661:1972 (Plastering Code)</strong>, and <strong>IS 4082 (Stacking &amp; Storage)</strong>. Understanding the dry volume multipliers and unit densities is vital for 100% material accounting on site.
            </p>
          </div>

          {/* Quick Technical Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <h4 className="font-bold text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                1. Standard Cement Bag Constants
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                1 Standard Bag of Cement in India weights exactly <strong>50 kg</strong>. With a standard density of <strong>1440 kg/m³</strong>, 1 bag occupies <strong>0.0347 m³ (34.7 Litres or 1.226 cu.ft)</strong>. Exactly <strong>28.8 bags</strong> equal 1 cubic meter of solid cement volume.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <h4 className="font-bold text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                2. Dry Volume Multipliers Explained
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                • <strong>Concrete: 1.54x</strong> (accounts for 54% void shrinkage when cement &amp; sand disperse between coarse aggregate).<br />
                • <strong>Brickwork Mortar: 1.33x</strong> (33% shrinkage).<br />
                • <strong>Plastering: 1.60x</strong> (1.33x dry volume + 20% joint filling &amp; surface roughness markup).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <h4 className="font-bold text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                3. Water-Cement Ratio &amp; Curing
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                For structural M20/M25 concrete, IS 456 prescribes a water-cement ratio of <strong>0.45 to 0.55</strong> (approx <strong>25 to 27.5 Litres per 50kg bag</strong>). PPC requires 14–21 days of continuous water curing to achieve full pozzolanic strength.
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
                  How many cement bags are required for 100 cu.ft of M20 concrete slab?
                </h4>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  100 cu.ft of wet M20 concrete (1:1.5:3) equals 2.831 m³. Multiplying by 1.54 dry factor gives 4.36 m³ dry volume. Cement share is 1 / 5.5 = 0.793 m³. Dividing by 0.0347 m³ per bag yields approximately <strong>23 bags of cement</strong>, along with <strong>35 cft of sand</strong> and <strong>70 cft of 20mm aggregate</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                <h4 className="font-bold text-zinc-900 dark:text-white">
                  Which cement is best: OPC 53 Grade or PPC (Portland Pozzolana Cement)?
                </h4>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  <strong>OPC 53</strong> is best for structural RCC members (slabs, columns, beams) requiring high early strength and faster formwork removal. <strong>PPC</strong> is superior for wall plastering, brick masonry, and foundations because it generates lower heat of hydration, resists sulfate attack, and prevents shrinkage micro-cracks.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                <h4 className="font-bold text-zinc-900 dark:text-white">
                  How much cement is needed for 1000 sq.ft of 12mm internal wall plaster?
                </h4>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  For 1000 sq.ft (92.9 m²) of 12mm plaster in 1:4 mix ratio, the wet volume is 1.115 m³. Applying the 1.60x dry/wastage multiplier gives 1.784 m³ dry mortar. Cement volume is 1/5 = 0.357 m³, which requires approximately <strong>10.5 to 11 bags of cement</strong> (50kg each) and <strong>38 cft of fine sand</strong>.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </>
  );
}

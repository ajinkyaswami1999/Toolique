import { useState, useMemo } from 'react';
import {
  Ruler, Copy, Check, RotateCcw, Building, Plus, Trash2,
  FileSpreadsheet, FileText, Share2, Layers,
  TrendingDown, Eye, HardHat, Compass
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import SEO from '../components/SEO';
import MaterialTrendGraph from '../components/MaterialTrendGraph';

// -------------------------------------------------------------
// Engineering Types & Constants (IS 1077 / IS 2212 / IS 1200 Pt-3)
// -------------------------------------------------------------
export interface BrickType {
  id: string;
  name: string;
  category: 'clay' | 'flyash' | 'aac' | 'concrete' | 'custom';
  lengthMm: number;
  widthMm: number;
  heightMm: number;
  weightKg: number;
  isAAC?: boolean;
  isHollow?: boolean;
  defaultMortarJointMm?: number;
  description: string;
  isStandard?: boolean;
}

export interface MortarRatio {
  id: string;
  name: string;
  cement: number;
  sand: number;
  isAdhesive?: boolean;
  description: string;
}

export interface WallOpening {
  id: string;
  name: string;
  type: 'door' | 'window' | 'ventilator' | 'custom';
  width: number; // in current unit (ft or m)
  height: number; // in current unit (ft or m)
  count: number;
}

export interface ScheduledWall {
  id: string;
  name: string;
  length: number;
  height: number;
  thicknessInches: number; // 4.5, 9, 13.5, 18
  brickTypeId: string;
  mortarRatioId: string;
  bondType: 'stretcher' | 'english' | 'flemish' | 'rattrap';
  wastagePercent: number;
  openings: WallOpening[];
}

export const BRICK_PRESETS: Record<string, BrickType> = {
  modular: {
    id: 'modular',
    name: 'Modular Standard Brick (IS 1077: 190x90x90 mm)',
    category: 'clay',
    lengthMm: 190,
    widthMm: 90,
    heightMm: 90,
    weightKg: 2.7,
    defaultMortarJointMm: 10,
    description: 'Bureau of Indian Standards (BIS) standard modular size. With 10mm mortar, nominal size is 200x100x100 mm.',
    isStandard: true
  },
  traditional: {
    id: 'traditional',
    name: 'Traditional Red Clay Brick (9" x 4.25" x 2.75" / 228x114x76 mm)',
    category: 'clay',
    lengthMm: 228.6,
    widthMm: 114.3,
    heightMm: 76.2,
    weightKg: 3.4,
    defaultMortarJointMm: 10,
    description: 'Most widely used country red brick in residential construction across Indian states.',
    isStandard: true
  },
  flyash: {
    id: 'flyash',
    name: 'Fly Ash Lime Brick (IS 12894)',
    category: 'flyash',
    lengthMm: 230,
    widthMm: 110,
    heightMm: 70,
    weightKg: 3.1,
    defaultMortarJointMm: 10,
    description: 'Eco-friendly Class 10/15 brick made of pulverized fuel ash, cement, and lime. Smooth finish.',
    isStandard: true
  },
  aac_4: {
    id: 'aac_4',
    name: 'AAC Block 4" Partition (600x200x100 mm)',
    category: 'aac',
    lengthMm: 600,
    widthMm: 100,
    heightMm: 200,
    weightKg: 8.5,
    isAAC: true,
    defaultMortarJointMm: 3,
    description: 'Autoclaved Aerated Concrete for internal partitions. Lightweight, fireproof & thermal insulating.'
  },
  aac_6: {
    id: 'aac_6',
    name: 'AAC Block 6" External (600x200x150 mm)',
    category: 'aac',
    lengthMm: 600,
    widthMm: 150,
    heightMm: 200,
    weightKg: 12.8,
    isAAC: true,
    defaultMortarJointMm: 3,
    description: 'Standard external wall block. Replaces 9" conventional red brick with 50% lighter dead load.'
  },
  aac_8: {
    id: 'aac_8',
    name: 'AAC Block 8" Heavy (600x200x200 mm)',
    category: 'aac',
    lengthMm: 600,
    widthMm: 200,
    heightMm: 200,
    weightKg: 17.0,
    isAAC: true,
    defaultMortarJointMm: 3,
    description: 'Heavy duty external boundary & acoustic walls for multi-storey high rise structures.'
  },
  solid_concrete: {
    id: 'solid_concrete',
    name: 'Solid Concrete Block (400x200x150 mm)',
    category: 'concrete',
    lengthMm: 400,
    widthMm: 150,
    heightMm: 200,
    weightKg: 19.5,
    defaultMortarJointMm: 10,
    description: 'High compressive strength precast cement concrete block per IS 2185 Part-1.'
  },
  hollow_concrete: {
    id: 'hollow_concrete',
    name: 'Hollow Concrete Block (400x200x200 mm)',
    category: 'concrete',
    lengthMm: 400,
    widthMm: 200,
    heightMm: 200,
    weightKg: 14.2,
    isHollow: true,
    defaultMortarJointMm: 10,
    description: 'Hollow core cellular concrete block for thermal efficiency and cable/conduit routing.'
  },
  wirecut: {
    id: 'wirecut',
    name: 'Wire-Cut Facing Brick (230x110x75 mm)',
    category: 'clay',
    lengthMm: 230,
    widthMm: 110,
    heightMm: 75,
    weightKg: 3.2,
    defaultMortarJointMm: 8,
    description: 'Machine pressed exposed clay brick with uniform edges for unplastered aesthetic facades.'
  },
  custom: {
    id: 'custom',
    name: 'Custom Dimension Brick / Block',
    category: 'custom',
    lengthMm: 230,
    widthMm: 115,
    heightMm: 75,
    weightKg: 3.2,
    defaultMortarJointMm: 10,
    description: 'Custom dimensions specified in millimeters.'
  }
};

export const MORTAR_PRESETS: Record<string, MortarRatio> = {
  '1:3': { id: '1:3', name: '1:3 (Rich Mortar)', cement: 1, sand: 3, description: 'Water retaining structures, parapets, and heavy foundation loads.' },
  '1:4': { id: '1:4', name: '1:4 (Standard 4.5" Partition)', cement: 1, sand: 4, description: 'Recommended for 4.5" half-brick partition walls per CPWD specifications.' },
  '1:5': { id: '1:5', name: '1:5 (Medium Masonry)', cement: 1, sand: 5, description: 'Standard general purpose masonry for load bearing walls.' },
  '1:6': { id: '1:6', name: '1:6 (Standard 9" External Wall)', cement: 1, sand: 6, description: 'Most common mix for 9" thick brickwork in residential and commercial buildings.' },
  '1:7': { id: '1:7', name: '1:7 (Low Load Partition)', cement: 1, sand: 7, description: 'Internal non-load bearing wall masonry.' },
  '1:8': { id: '1:8', name: '1:8 (Boundary Wall / Lean)', cement: 1, sand: 8, description: 'Boundary walls and low-stress single-storey compound masonry.' },
  'aac_adhesive': { id: 'aac_adhesive', name: 'Polymer Thin-Bed Block Adhesive (3mm)', cement: 0, sand: 0, isAdhesive: true, description: 'Pre-mixed polymer modified thin joint adhesive (1 bag 20kg covers ~120 sq.ft of 4" AAC blockwork).' }
};

export const STANDARD_OPENINGS = [
  { name: 'Main Door (3.5 ft x 7 ft)', widthFt: 3.5, heightFt: 7.0, widthM: 1.05, heightM: 2.13 },
  { name: 'Internal Room Door (3 ft x 7 ft)', widthFt: 3.0, heightFt: 7.0, widthM: 0.91, heightM: 2.13 },
  { name: 'Bathroom Door (2.5 ft x 7 ft)', widthFt: 2.5, heightFt: 7.0, widthM: 0.76, heightM: 2.13 },
  { name: 'Large Living Window (5 ft x 4 ft)', widthFt: 5.0, heightFt: 4.0, widthM: 1.52, heightM: 1.22 },
  { name: 'Standard Bedroom Window (4 ft x 4 ft)', widthFt: 4.0, heightFt: 4.0, widthM: 1.22, heightM: 1.22 },
  { name: 'Kitchen / Small Window (3 ft x 3 ft)', widthFt: 3.0, heightFt: 3.0, widthM: 0.91, heightM: 0.91 },
  { name: 'Toilet Ventilator (2 ft x 1.5 ft)', widthFt: 2.0, heightFt: 1.5, widthM: 0.61, heightM: 0.46 }
];

export const CITY_RATE_PRESETS: Record<string, { name: string; brick: number; aac: number; cement: number; sand: number; masonWage: number; helperWage: number }> = {
  mumbai: { name: 'Mumbai (MMR)', brick: 10.5, aac: 68, cement: 395, sand: 52, masonWage: 950, helperWage: 650 },
  delhi: { name: 'Delhi NCR', brick: 9.0, aac: 62, cement: 375, sand: 45, masonWage: 850, helperWage: 600 },
  bengaluru: { name: 'Bengaluru', brick: 10.0, aac: 65, cement: 390, sand: 55, masonWage: 900, helperWage: 650 },
  hyderabad: { name: 'Hyderabad', brick: 9.5, aac: 60, cement: 370, sand: 48, masonWage: 850, helperWage: 600 },
  pune: { name: 'Pune', brick: 9.8, aac: 64, cement: 385, sand: 50, masonWage: 900, helperWage: 620 },
  chennai: { name: 'Chennai', brick: 9.5, aac: 63, cement: 380, sand: 54, masonWage: 880, helperWage: 620 },
  kolkata: { name: 'Kolkata', brick: 8.5, aac: 58, cement: 360, sand: 42, masonWage: 800, helperWage: 550 },
  ahmedabad: { name: 'Ahmedabad', brick: 8.8, aac: 60, cement: 365, sand: 44, masonWage: 820, helperWage: 580 }
};

// -------------------------------------------------------------
// Component Implementation
// -------------------------------------------------------------
export default function BrickCalculator() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'single' | 'multi' | 'compare' | 'labour' | 'export'>('single');
  const [unitMode, setUnitMode] = useState<'feet' | 'meters'>('feet');

  // Single Wall State
  const [wallLength, setWallLength] = useState<number>(20);
  const [wallHeight, setWallHeight] = useState<number>(10);
  const [wallThicknessInches, setWallThicknessInches] = useState<number>(9); // 4.5, 9, 13.5, 18
  const [brickTypeId, setBrickTypeId] = useState<string>('traditional');
  const [customBrickL, setCustomBrickL] = useState<number>(230);
  const [customBrickW, setCustomBrickW] = useState<number>(115);
  const [customBrickH, setCustomBrickH] = useState<number>(75);
  const [mortarRatioId, setMortarRatioId] = useState<string>('1:6');
  const [bondType, setBondType] = useState<'stretcher' | 'english' | 'flemish' | 'rattrap'>('english');
  const [mortarJointMm, setMortarJointMm] = useState<number>(10);
  const [wastagePercent, setWastagePercent] = useState<number>(5);

  // Single Wall Openings
  const [singleWallOpenings, setSingleWallOpenings] = useState<WallOpening[]>([
    { id: 'op_1', name: 'Standard Window (4x4 ft)', type: 'window', width: 4, height: 4, count: 1 },
    { id: 'op_2', name: 'Room Door (3x7 ft)', type: 'door', width: 3, height: 7, count: 1 }
  ]);

  // Multi-Wall Schedule State
  const [scheduledWalls, setScheduledWalls] = useState<ScheduledWall[]>([
    {
      id: 'w1',
      name: 'North External Wall (9")',
      length: 25,
      height: 10,
      thicknessInches: 9,
      brickTypeId: 'traditional',
      mortarRatioId: '1:6',
      bondType: 'english',
      wastagePercent: 5,
      openings: [
        { id: 'w1_o1', name: 'Living Window', type: 'window', width: 5, height: 4, count: 1 }
      ]
    },
    {
      id: 'w2',
      name: 'South External Wall (9")',
      length: 25,
      height: 10,
      thicknessInches: 9,
      brickTypeId: 'traditional',
      mortarRatioId: '1:6',
      bondType: 'english',
      wastagePercent: 5,
      openings: [
        { id: 'w2_o1', name: 'Balcony Door', type: 'door', width: 4, height: 7, count: 1 }
      ]
    },
    {
      id: 'w3',
      name: 'Internal Partition Wall (4.5")',
      length: 15,
      height: 10,
      thicknessInches: 4.5,
      brickTypeId: 'traditional',
      mortarRatioId: '1:4',
      bondType: 'stretcher',
      wastagePercent: 5,
      openings: [
        { id: 'w3_o1', name: 'Bedroom Door', type: 'door', width: 3, height: 7, count: 1 }
      ]
    }
  ]);

  // Fast Room Generator state
  const [roomLengthFt, setRoomLengthFt] = useState<number>(16);
  const [roomWidthFt, setRoomWidthFt] = useState<number>(12);
  const [roomCeilingHeightFt, setRoomCeilingHeightFt] = useState<number>(10);
  const [roomOuterThickness, setRoomOuterThickness] = useState<number>(9);

  // Rate Matrix State & sync
  const [selectedCity, setSelectedCity] = useState<string>('mumbai');
  const [prices, setPrices] = useState({
    brickPcs: 9.5,
    aacBlockPcs: 65,
    cementBag: 380,
    sandCft: 48,
    adhesiveBag20kg: 380,
    masonWageDay: 900,
    helperWageDay: 620,
    contractorMarginPct: 15,
    gstPercent: 18
  });

  const [copied, setCopied] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // City preset rate applicator
  const handleApplyCityRates = (cityKey: string) => {
    setSelectedCity(cityKey);
    const p = CITY_RATE_PRESETS[cityKey];
    if (p) {
      setPrices(prev => ({
        ...prev,
        brickPcs: p.brick,
        aacBlockPcs: p.aac,
        cementBag: p.cement,
        sandCft: p.sand,
        masonWageDay: p.masonWage,
        helperWageDay: p.helperWage
      }));
      showToast(`Applied ${p.name} construction market rates!`);
    }
  };

  // -------------------------------------------------------------
  // Core Calculation Function (per wall)
  // -------------------------------------------------------------
  const calculateWallMetrics = (
    length: number,
    height: number,
    thicknessInches: number,
    brickKey: string,
    mortarKey: string,
    bond: 'stretcher' | 'english' | 'flemish' | 'rattrap',
    wastagePct: number,
    openings: WallOpening[],
    isMetric: boolean
  ) => {
    // 1. Convert dimensions to SI meters
    const lenM = isMetric ? length : length * 0.3048;
    const htM = isMetric ? height : height * 0.3048;
    const thkM = (thicknessInches / 12) * 0.3048;

    const grossWallAreaSqM = lenM * htM;

    // 2. Openings Deduction per IS 1200 Part 3
    let openingDeductionAreaSqM = 0;
    openings.forEach(op => {
      const opWM = isMetric ? op.width : op.width * 0.3048;
      const opHM = isMetric ? op.height : op.height * 0.3048;
      const areaEach = opWM * opHM;
      // IS 1200 rule: Openings >= 0.1 sq.m are deducted
      if (areaEach >= 0.1) {
        openingDeductionAreaSqM += areaEach * (op.count || 1);
      }
    });

    const netWallAreaSqM = Math.max(0, grossWallAreaSqM - openingDeductionAreaSqM);
    const netWallVolM3 = netWallAreaSqM * thkM;

    // 3. Brick & Mortar Dimensions in Meters
    const brickDef = BRICK_PRESETS[brickKey] || BRICK_PRESETS.traditional;
    const bLenM = (brickKey === 'custom' ? customBrickL : brickDef.lengthMm) / 1000;
    const bWidM = (brickKey === 'custom' ? customBrickW : brickDef.widthMm) / 1000;
    const bHtM = (brickKey === 'custom' ? customBrickH : brickDef.heightMm) / 1000;

    const jointM = (brickDef.isAAC ? (brickDef.defaultMortarJointMm || 3) : mortarJointMm) / 1000;

    // Net single brick volume (clean without mortar)
    const singleBrickVolM3 = bLenM * bWidM * bHtM;
    // Brick volume with mortar joint
    const nominalBrickVolM3 = (bLenM + jointM) * (bWidM + jointM) * (bHtM + jointM);

    // 4. Quantity of Bricks with Bond Adjustment
    let baseBricksCount = netWallVolM3 > 0 && nominalBrickVolM3 > 0 ? netWallVolM3 / nominalBrickVolM3 : 0;

    // Rat-Trap bond saves ~24% bricks and creates cavity
    if (bond === 'rattrap') {
      baseBricksCount = baseBricksCount * 0.76;
    }

    const netBricksWithWastage = Math.ceil(baseBricksCount * (1 + wastagePct / 100));

    // 5. Mortar Volume Calculation
    const cleanBricksTotalVolM3 = baseBricksCount * singleBrickVolM3;
    let wetMortarVolM3 = Math.max(0, netWallVolM3 - cleanBricksTotalVolM3);

    // Rat-Trap bond reduces mortar consumption by ~35%
    if (bond === 'rattrap') {
      wetMortarVolM3 = wetMortarVolM3 * 0.65;
    }

    // Dry volume factor: 1.33 for conventional cement-sand mortar
    const dryMortarVolM3 = wetMortarVolM3 * 1.33;
    const dryMortarVolCft = dryMortarVolM3 * 35.3147;

    // 6. Split Cement & Sand by Mix Ratio
    const mortarDef = MORTAR_PRESETS[mortarKey] || MORTAR_PRESETS['1:6'];
    let cementBags = 0;
    let cementKg = 0;
    let sandCft = 0;
    let sandBrass = 0;
    let sandTonnes = 0;
    let adhesiveBags20kg = 0;

    if (brickDef.isAAC || mortarDef.isAdhesive) {
      // AAC block thin-bed adhesive rule: ~1 bag (20kg) per 120 sq.ft of 4" wall or 85 sq.ft of 6" wall
      const netWallAreaSqFt = netWallAreaSqM * 10.7639;
      const coveragePerBag = thicknessInches <= 4.5 ? 120 : thicknessInches <= 6 ? 85 : 60;
      adhesiveBags20kg = Math.max(1, Math.ceil((netWallAreaSqFt / coveragePerBag) * (1 + wastagePct / 100)));
    } else {
      const totalParts = (mortarDef.cement || 1) + (mortarDef.sand || 6);
      const cementVolM3 = (mortarDef.cement / totalParts) * dryMortarVolM3;
      const sandVolM3 = (mortarDef.sand / totalParts) * dryMortarVolM3;

      // 1 bag cement (50kg) = 0.0347 m3, density = 1440 kg/m3
      cementBags = Math.ceil(cementVolM3 / 0.0347);
      cementKg = Math.round(cementBags * 50);

      sandCft = Number((sandVolM3 * 35.3147).toFixed(2));
      sandBrass = Number((sandCft / 100).toFixed(3));
      sandTonnes = Number((sandCft * 0.045).toFixed(2)); // ~45 kg per cft
    }

    // 7. Curing Water Requirement (Approx 28 Litres per cement bag)
    const waterLitres = Math.round(cementBags * 28 + netWallVolM3 * 15);

    // 8. Structural Dead Load
    const totalBrickWeightTonnes = ((netBricksWithWastage * brickDef.weightKg) / 1000);
    const totalMortarWeightTonnes = (wetMortarVolM3 * 2.16); // 2160 kg/m3 wet mortar density
    const totalWallDeadWeightTonnes = Number((totalBrickWeightTonnes + totalMortarWeightTonnes).toFixed(2));

    // 9. Labour Estimation (CPWD Constants per m3)
    const masonMandays = Number((netWallVolM3 * 0.94).toFixed(2));
    const helperMandays = Number((netWallVolM3 * 1.40).toFixed(2));
    const bhistiMandays = Number((netWallVolM3 * 0.20).toFixed(2));

    // 10. Financial Costs
    const brickUnitRate = brickDef.isAAC ? prices.aacBlockPcs : prices.brickPcs;
    const costBricks = netBricksWithWastage * brickUnitRate;
    const costCement = cementBags * prices.cementBag;
    const costSand = sandCft * prices.sandCft;
    const costAdhesive = adhesiveBags20kg * prices.adhesiveBag20kg;
    const costMaterialBase = costBricks + (brickDef.isAAC ? costAdhesive : (costCement + costSand));

    const costLabour = Math.round((masonMandays * prices.masonWageDay) + (helperMandays * prices.helperWageDay));
    const costScaffolding = Math.round(netWallVolM3 * 85);
    const costSubtotal = costMaterialBase + costLabour + costScaffolding;
    const costMargin = costSubtotal * (prices.contractorMarginPct / 100);
    const costGst = (costSubtotal + costMargin) * (prices.gstPercent / 100);
    const costGrandTotal = Math.round(costSubtotal + costMargin + costGst);

    const netWallAreaSqFt = netWallAreaSqM * 10.7639;
    const costPerSqFt = netWallAreaSqFt > 0 ? Math.round(costGrandTotal / netWallAreaSqFt) : 0;
    const costPerM3 = netWallVolM3 > 0 ? Math.round(costGrandTotal / netWallVolM3) : 0;

    return {
      grossWallAreaSqFt: Number((grossWallAreaSqM * 10.7639).toFixed(2)),
      grossWallAreaSqM: Number(grossWallAreaSqM.toFixed(2)),
      openingsDeductedAreaSqFt: Number((openingDeductionAreaSqM * 10.7639).toFixed(2)),
      openingsDeductedAreaSqM: Number(openingDeductionAreaSqM.toFixed(2)),
      netWallAreaSqFt: Number(netWallAreaSqFt.toFixed(2)),
      netWallAreaSqM: Number(netWallAreaSqM.toFixed(2)),
      netWallVolM3: Number(netWallVolM3.toFixed(3)),
      netWallVolCft: Number((netWallVolM3 * 35.3147).toFixed(2)),
      numBricks: netBricksWithWastage,
      rawBricksCount: Math.ceil(baseBricksCount),
      wetMortarVolM3: Number(wetMortarVolM3.toFixed(3)),
      dryMortarVolM3: Number(dryMortarVolM3.toFixed(3)),
      dryMortarVolCft: Number(dryMortarVolCft.toFixed(2)),
      cementBags,
      cementKg,
      sandCft,
      sandBrass,
      sandTonnes,
      adhesiveBags20kg,
      waterLitres,
      totalWallDeadWeightTonnes,
      masonMandays,
      helperMandays,
      bhistiMandays,
      costBricks,
      costCement,
      costSand,
      costAdhesive,
      costMaterialBase,
      costLabour,
      costScaffolding,
      costMargin,
      costGst,
      costGrandTotal,
      costPerSqFt,
      costPerM3
    };
  };

  // Single Wall Memoized Results
  const singleResults = useMemo(() => {
    return calculateWallMetrics(
      wallLength,
      wallHeight,
      wallThicknessInches,
      brickTypeId,
      mortarRatioId,
      bondType,
      wastagePercent,
      singleWallOpenings,
      unitMode === 'meters'
    );
  }, [
    wallLength,
    wallHeight,
    wallThicknessInches,
    brickTypeId,
    customBrickL,
    customBrickW,
    customBrickH,
    mortarRatioId,
    bondType,
    mortarJointMm,
    wastagePercent,
    singleWallOpenings,
    unitMode,
    prices
  ]);

  // Multi-Wall Memoized Results
  const multiWallResults = useMemo(() => {
    let totalBricks = 0;
    let totalCementBags = 0;
    let totalSandCft = 0;
    let totalAdhesiveBags = 0;
    let totalWallAreaSqFt = 0;
    let totalWallVolM3 = 0;
    let totalDeadWeightTonnes = 0;
    let totalCost = 0;

    const wallDetails = scheduledWalls.map(w => {
      const metrics = calculateWallMetrics(
        w.length,
        w.height,
        w.thicknessInches,
        w.brickTypeId,
        w.mortarRatioId,
        w.bondType,
        w.wastagePercent,
        w.openings,
        unitMode === 'meters'
      );

      totalBricks += metrics.numBricks;
      totalCementBags += metrics.cementBags;
      totalSandCft += metrics.sandCft;
      totalAdhesiveBags += metrics.adhesiveBags20kg;
      totalWallAreaSqFt += metrics.netWallAreaSqFt;
      totalWallVolM3 += metrics.netWallVolM3;
      totalDeadWeightTonnes += metrics.totalWallDeadWeightTonnes;
      totalCost += metrics.costGrandTotal;

      return {
        ...w,
        metrics
      };
    });

    return {
      wallDetails,
      totalBricks,
      totalCementBags,
      totalSandCft: Number(totalSandCft.toFixed(1)),
      totalSandBrass: Number((totalSandCft / 100).toFixed(2)),
      totalAdhesiveBags,
      totalWallAreaSqFt: Number(totalWallAreaSqFt.toFixed(1)),
      totalWallVolM3: Number(totalWallVolM3.toFixed(2)),
      totalDeadWeightTonnes: Number(totalDeadWeightTonnes.toFixed(1)),
      totalCost
    };
  }, [scheduledWalls, unitMode, prices, customBrickL, customBrickW, customBrickH, mortarJointMm]);

  // -------------------------------------------------------------
  // Masonry Alternatives Comparison Data
  // -------------------------------------------------------------
  const comparisonData = useMemo(() => {
    const len = wallLength;
    const ht = wallHeight;
    const isM = unitMode === 'meters';

    // 1. Traditional Red Clay Brick (9" English Bond)
    const clayRes = calculateWallMetrics(len, ht, 9, 'traditional', '1:6', 'english', 5, singleWallOpenings, isM);
    // 2. Fly Ash Brick (9" English Bond)
    const flyashRes = calculateWallMetrics(len, ht, 9, 'flyash', '1:6', 'english', 5, singleWallOpenings, isM);
    // 3. AAC Block 6" External (Thin Bed Adhesive)
    const aacRes = calculateWallMetrics(len, ht, 6, 'aac_6', 'aac_adhesive', 'stretcher', 3, singleWallOpenings, isM);
    // 4. Laurie Baker Rat-Trap Bond Red Brick (9" Cavity)
    const ratTrapRes = calculateWallMetrics(len, ht, 9, 'traditional', '1:6', 'rattrap', 4, singleWallOpenings, isM);

    return [
      {
        type: 'Standard Red Clay Brick (9")',
        isRecommended: false,
        spec: '228x114x76 mm, 1:6 Cement Mortar',
        unitsRequired: `${clayRes.numBricks.toLocaleString()} Bricks`,
        cementReq: `${clayRes.cementBags} Bags`,
        sandReq: `${clayRes.sandCft} cft (${clayRes.sandBrass} Brass)`,
        deadWeight: `${clayRes.totalWallDeadWeightTonnes} Tonnes`,
        thermalInsulation: 'Moderate (U-value ~ 2.0 W/m²K)',
        speed: 'Standard (~60-80 sqft/day)',
        totalCost: clayRes.costGrandTotal,
        costPerSqFt: clayRes.costPerSqFt,
        tag: 'Traditional'
      },
      {
        type: 'Fly Ash Lime Brick (9")',
        isRecommended: false,
        spec: '230x110x70 mm, 1:6 Mortar (IS 12894)',
        unitsRequired: `${flyashRes.numBricks.toLocaleString()} Bricks`,
        cementReq: `${flyashRes.cementBags} Bags`,
        sandReq: `${flyashRes.sandCft} cft (${flyashRes.sandBrass} Brass)`,
        deadWeight: `${flyashRes.totalWallDeadWeightTonnes} Tonnes`,
        thermalInsulation: 'Better (U-value ~ 1.8 W/m²K)',
        speed: 'Faster plaster (Smooth edges)',
        totalCost: flyashRes.costGrandTotal,
        costPerSqFt: flyashRes.costPerSqFt,
        tag: 'Eco Friendly'
      },
      {
        type: 'AAC Blocks 6" External Wall',
        isRecommended: true,
        spec: '600x200x150 mm + Polymer Adhesive (3mm)',
        unitsRequired: `${aacRes.numBricks.toLocaleString()} Blocks`,
        cementReq: '0 Bags (3mm Adhesive)',
        sandReq: '0 cft (Sand Free)',
        deadWeight: `${aacRes.totalWallDeadWeightTonnes} Tonnes (55% Lighter)`,
        thermalInsulation: 'Superior (U-value ~ 0.65 W/m²K)',
        speed: '3x Faster (~250 sqft/day)',
        totalCost: aacRes.costGrandTotal,
        costPerSqFt: aacRes.costPerSqFt,
        tag: 'Lowest Dead Load'
      },
      {
        type: 'Rat-Trap Cavity Bond (9")',
        isRecommended: true,
        spec: 'Laurie Baker Cavity Bond, 1:6 Mortar',
        unitsRequired: `${ratTrapRes.numBricks.toLocaleString()} Bricks (-24%)`,
        cementReq: `${ratTrapRes.cementBags} Bags (-35%)`,
        sandReq: `${ratTrapRes.sandCft} cft (-35%)`,
        deadWeight: `${ratTrapRes.totalWallDeadWeightTonnes} Tonnes`,
        thermalInsulation: 'Built-in Air Cavity Insulation',
        speed: 'Requires skilled mason',
        totalCost: ratTrapRes.costGrandTotal,
        costPerSqFt: ratTrapRes.costPerSqFt,
        tag: 'Lowest Material Cost'
      }
    ];
  }, [wallLength, wallHeight, unitMode, singleWallOpenings, prices, customBrickL, customBrickW, customBrickH, mortarJointMm]);

  // -------------------------------------------------------------
  // Openings Management
  // -------------------------------------------------------------
  const handleAddSingleOpening = (preset?: typeof STANDARD_OPENINGS[0]) => {
    const isM = unitMode === 'meters';
    const newOp: WallOpening = {
      id: `op_${Date.now()}`,
      name: preset ? preset.name : 'Custom Opening',
      type: preset?.name.toLowerCase().includes('door') ? 'door' : preset?.name.toLowerCase().includes('vent') ? 'ventilator' : 'window',
      width: preset ? (isM ? preset.widthM : preset.widthFt) : (isM ? 1.0 : 3.0),
      height: preset ? (isM ? preset.heightM : preset.heightFt) : (isM ? 1.2 : 4.0),
      count: 1
    };
    setSingleWallOpenings(prev => [...prev, newOp]);
    showToast('Added opening deduction per IS 1200 Pt-3');
  };

  const handleRemoveSingleOpening = (id: string) => {
    setSingleWallOpenings(prev => prev.filter(o => o.id !== id));
  };

  // -------------------------------------------------------------
  // Multi-Wall Schedule Actions
  // -------------------------------------------------------------
  const handleAddScheduledWall = () => {
    const newWall: ScheduledWall = {
      id: `w_${Date.now()}`,
      name: `Wall #${scheduledWalls.length + 1}`,
      length: 15,
      height: 10,
      thicknessInches: 9,
      brickTypeId: 'traditional',
      mortarRatioId: '1:6',
      bondType: 'english',
      wastagePercent: 5,
      openings: []
    };
    setScheduledWalls(prev => [...prev, newWall]);
    showToast('Added new wall to building schedule');
  };

  const handleGenerateRoom4Walls = () => {
    const wLen = roomLengthFt;
    const wWid = roomWidthFt;
    const wHt = roomCeilingHeightFt;
    const thk = roomOuterThickness;

    const generated: ScheduledWall[] = [
      {
        id: `room_w1_${Date.now()}`,
        name: `Room Front Wall (${wLen} ft)`,
        length: wLen,
        height: wHt,
        thicknessInches: thk,
        brickTypeId: 'traditional',
        mortarRatioId: '1:6',
        bondType: 'english',
        wastagePercent: 5,
        openings: [
          { id: `op_door_${Date.now()}`, name: 'Entrance Door (3x7 ft)', type: 'door', width: 3, height: 7, count: 1 }
        ]
      },
      {
        id: `room_w2_${Date.now()}`,
        name: `Room Back Wall (${wLen} ft)`,
        length: wLen,
        height: wHt,
        thicknessInches: thk,
        brickTypeId: 'traditional',
        mortarRatioId: '1:6',
        bondType: 'english',
        wastagePercent: 5,
        openings: [
          { id: `op_win_${Date.now()}`, name: 'Large Window (5x4 ft)', type: 'window', width: 5, height: 4, count: 1 }
        ]
      },
      {
        id: `room_w3_${Date.now()}`,
        name: `Room Left Wall (${wWid} ft)`,
        length: wWid,
        height: wHt,
        thicknessInches: thk,
        brickTypeId: 'traditional',
        mortarRatioId: '1:6',
        bondType: 'english',
        wastagePercent: 5,
        openings: []
      },
      {
        id: `room_w4_${Date.now()}`,
        name: `Room Right Wall (${wWid} ft)`,
        length: wWid,
        height: wHt,
        thicknessInches: thk,
        brickTypeId: 'traditional',
        mortarRatioId: '1:6',
        bondType: 'english',
        wastagePercent: 5,
        openings: []
      }
    ];

    setScheduledWalls(prev => [...prev, ...generated]);
    showToast(`Generated 4-wall envelope for ${wLen}x${wWid} ft room!`);
  };

  const handleRemoveScheduledWall = (id: string) => {
    if (scheduledWalls.length <= 1) {
      showToast('Keep at least 1 wall in schedule');
      return;
    }
    setScheduledWalls(prev => prev.filter(w => w.id !== id));
    showToast('Wall removed from schedule');
  };

  // -------------------------------------------------------------
  // WhatsApp Quotation & Exporters
  // -------------------------------------------------------------
  const generateWhatsAppQuote = () => {
    const isSingle = activeTab === 'single' || activeTab === 'labour';
    const bDef = BRICK_PRESETS[brickTypeId] || BRICK_PRESETS.traditional;

    const quoteLines: string[] = [
      '*🧱 BRICKWORK & MASONRY ESTIMATE (IS 1077 / CPWD)*',
      '----------------------------------------',
      `*Location / Market:* ${CITY_RATE_PRESETS[selectedCity]?.name || 'India Standard'}`
    ];

    if (isSingle) {
      quoteLines.push(`*Wall Size:* ${wallLength} ${unitMode === 'meters' ? 'm' : 'ft'} x ${wallHeight} ${unitMode === 'meters' ? 'm' : 'ft'} (${wallThicknessInches}" Thickness)`);
      quoteLines.push(`*Masonry Bond:* ${bondType.toUpperCase()} Bond`);
      quoteLines.push(`*Brick/Block:* ${bDef.name}`);
      quoteLines.push(`*Net Wall Surface:* ${singleResults.netWallAreaSqFt} sq.ft (${singleResults.netWallVolM3} m³)`);
    } else {
      quoteLines.push(`*Total Scheduled Walls:* ${scheduledWalls.length} Walls`);
      quoteLines.push(`*Total Net Wall Area:* ${multiWallResults.totalWallAreaSqFt} sq.ft (${multiWallResults.totalWallVolM3} m³)`);
    }

    quoteLines.push('----------------------------------------');
    quoteLines.push('*MATERIAL REQUIREMENTS:*');

    if (bDef.isAAC) {
      quoteLines.push(`• *AAC Blocks:* ${(isSingle ? singleResults.numBricks : multiWallResults.totalBricks).toLocaleString()} Blocks`);
      quoteLines.push(`• *Polymer Adhesive (20kg):* ${isSingle ? singleResults.adhesiveBags20kg : multiWallResults.totalAdhesiveBags} Bags`);
    } else {
      quoteLines.push(`• *Total Bricks Req:* ${(isSingle ? singleResults.numBricks : multiWallResults.totalBricks).toLocaleString()} Pcs`);
      quoteLines.push(`• *Cement (50kg Bags):* ${isSingle ? singleResults.cementBags : multiWallResults.totalCementBags} Bags (${isSingle ? singleResults.cementKg : multiWallResults.totalCementBags * 50} kg)`);
      quoteLines.push(`• *Sand Quantity:* ${isSingle ? singleResults.sandCft : multiWallResults.totalSandCft} Cu.Ft (${isSingle ? singleResults.sandBrass : multiWallResults.totalSandBrass} Brass)`);
      quoteLines.push(`• *Curing Water:* ~${isSingle ? singleResults.waterLitres : Math.round(multiWallResults.totalCementBags * 28)} Litres`);
    }

    quoteLines.push('----------------------------------------');
    quoteLines.push('*COST ESTIMATION:*');
    quoteLines.push(`• *Total Estimated Cost:* ₹${(isSingle ? singleResults.costGrandTotal : multiWallResults.totalCost).toLocaleString('en-IN')}`);

    if (isSingle) {
      quoteLines.push(`• *Rate per Sq.Ft:* ₹${singleResults.costPerSqFt} / sq.ft`);
      quoteLines.push(`• *Rate per Cum (m³):* ₹${singleResults.costPerM3} / m³`);
    }

    quoteLines.push('----------------------------------------');
    quoteLines.push('_Generated via Toolique Brick Calculator India._');

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

  // Multi-Sheet Excel Export
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Single Wall Summary
    const summaryData: (string | number)[][] = [
      ['BRICKWORK & MASONRY ESTIMATION REPORT'],
      ['Standard:', 'IS 1077, IS 2212, IS 1200 Part 3, CPWD DSR'],
      ['City / Region:', CITY_RATE_PRESETS[selectedCity]?.name || 'Standard'],
      ['Date:', new Date().toLocaleDateString('en-IN')],
      [],
      ['PARAMETER', 'VALUE', 'UNIT'],
      ['Wall Length', wallLength, unitMode === 'meters' ? 'm' : 'ft'],
      ['Wall Height', wallHeight, unitMode === 'meters' ? 'm' : 'ft'],
      ['Wall Thickness', `${wallThicknessInches}"`, 'Inches'],
      ['Masonry Bond Type', bondType.toUpperCase(), 'Bond'],
      ['Brick / Block Type', BRICK_PRESETS[brickTypeId]?.name || brickTypeId, ''],
      ['Mortar Ratio', MORTAR_PRESETS[mortarRatioId]?.name || mortarRatioId, ''],
      ['Gross Wall Area', singleResults.grossWallAreaSqFt, 'Sq.Ft'],
      ['Deducted Openings Area', singleResults.openingsDeductedAreaSqFt, 'Sq.Ft'],
      ['Net Wall Area', singleResults.netWallAreaSqFt, 'Sq.Ft'],
      ['Net Wall Volume', singleResults.netWallVolM3, 'm³'],
      [],
      ['MATERIAL INDENT', 'QUANTITY', 'UNIT RATE (INR)', 'TOTAL AMOUNT (INR)'],
      ['Bricks / Blocks', singleResults.numBricks, prices.brickPcs, singleResults.costBricks],
      ['Cement (50 kg Bags)', singleResults.cementBags, prices.cementBag, singleResults.costCement],
      ['River / M-Sand', singleResults.sandCft, prices.sandCft, singleResults.costSand],
      ['Polymer Block Adhesive', singleResults.adhesiveBags20kg, prices.adhesiveBag20kg, singleResults.costAdhesive],
      ['Skilled & Unskilled Labour', '—', '—', singleResults.costLabour],
      ['Scaffolding & Tools', '—', '—', singleResults.costScaffolding],
      ['Contractor Profit & Margin', `${prices.contractorMarginPct}%`, '—', singleResults.costMargin],
      ['GST Tax', `${prices.gstPercent}%`, '—', singleResults.costGst],
      ['GRAND TOTAL ESTIMATED COST', '—', '—', singleResults.costGrandTotal],
      ['Rate per Sq.Ft', singleResults.costPerSqFt, 'INR / sq.ft', '']
    ];

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Single Wall Estimate');

    // Sheet 2: Multi-Wall Schedule
    const scheduleRows: (string | number)[][] = [
      ['MULTI-WALL BUILDING MASONRY SCHEDULE'],
      [],
      ['Wall Name', 'Length (ft)', 'Height (ft)', 'Thickness', 'Bond', 'Brick Type', 'Net Area (sqft)', 'Net Vol (m³)', 'Bricks (pcs)', 'Cement (bags)', 'Sand (cft)', 'Est. Cost (INR)']
    ];

    multiWallResults.wallDetails.forEach(w => {
      scheduleRows.push([
        w.name,
        w.length,
        w.height,
        `${w.thicknessInches}"`,
        w.bondType.toUpperCase(),
        BRICK_PRESETS[w.brickTypeId]?.name || w.brickTypeId,
        w.metrics.netWallAreaSqFt,
        w.metrics.netWallVolM3,
        w.metrics.numBricks,
        w.metrics.cementBags,
        w.metrics.sandCft,
        w.metrics.costGrandTotal
      ]);
    });

    const wsSchedule = XLSX.utils.aoa_to_sheet(scheduleRows);
    XLSX.utils.book_append_sheet(wb, wsSchedule, 'Building Wall Schedule');

    XLSX.writeFile(wb, `Brick_Masonry_BOQ_Estimate_${Date.now()}.xlsx`);
    showToast('Downloaded Excel Workbook (.xlsx)');
  };

  // High-Resolution PDF Export
  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const margin = 14;
    let y = 14;

    // Header Banner
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 36, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('BRICK MASONRY & MATERIAL QUANTITY TAKEOFF', margin, 16);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225);
    doc.text('Compliant with IS 1077, IS 2212, IS 1200 (Part 3) & CPWD DSR Specifications', margin, 23);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')} | City / Market: ${CITY_RATE_PRESETS[selectedCity]?.name || 'Standard'}`, margin, 29);

    y = 44;

    // Wall Parameters Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, 182, 38, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(217, 119, 6);
    doc.text('WALL & MASONRY SPECIFICATIONS', margin + 4, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);

    const bDef = BRICK_PRESETS[brickTypeId] || BRICK_PRESETS.traditional;
    doc.text(`• Dimensions: ${wallLength} ${unitMode === 'meters' ? 'm' : 'ft'} (L) x ${wallHeight} ${unitMode === 'meters' ? 'm' : 'ft'} (H) x ${wallThicknessInches}" (Thick)`, margin + 4, y + 14);
    doc.text(`• Brick / Block: ${bDef.name}`, margin + 4, y + 20);
    doc.text(`• Masonry Bond: ${bondType.toUpperCase()} Bond`, margin + 4, y + 26);
    doc.text(`• Mortar Mix: ${MORTAR_PRESETS[mortarRatioId]?.name || mortarRatioId}`, margin + 4, y + 32);

    doc.text(`• Gross Wall Area: ${singleResults.grossWallAreaSqFt} sq.ft`, margin + 95, y + 14);
    doc.text(`• Net Wall Area: ${singleResults.netWallAreaSqFt} sq.ft (${singleResults.netWallVolM3} m³)`, margin + 95, y + 20);
    doc.text(`• Openings Deducted: ${singleResults.openingsDeductedAreaSqFt} sq.ft (${singleWallOpenings.length} openings)`, margin + 95, y + 26);
    doc.text(`• Dead Load Weight: ${singleResults.totalWallDeadWeightTonnes} Metric Tonnes`, margin + 95, y + 32);

    y += 44;

    // Material Takeoff Table Header
    doc.setFillColor(15, 23, 42);
    doc.rect(margin, y, 182, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('Material / Cost Component', margin + 3, y + 5);
    doc.text('Quantity Indent', margin + 70, y + 5);
    doc.text('Unit Rate (INR)', margin + 120, y + 5);
    doc.text('Total Amount (INR)', margin + 155, y + 5);

    y += 7;

    // Material Rows
    const materialItems = [
      ['Bricks / Blocks', `${singleResults.numBricks.toLocaleString()} Pcs`, `Rs.${prices.brickPcs}/pc`, `Rs.${singleResults.costBricks.toLocaleString('en-IN')}`],
      ['Cement (50 kg Bags)', `${singleResults.cementBags} Bags (${singleResults.cementKg} kg)`, `Rs.${prices.cementBag}/bag`, `Rs.${singleResults.costCement.toLocaleString('en-IN')}`],
      ['River / M-Sand', `${singleResults.sandCft} cft (${singleResults.sandBrass} Brass)`, `Rs.${prices.sandCft}/cft`, `Rs.${singleResults.costSand.toLocaleString('en-IN')}`],
      ['Polymer Block Adhesive', `${singleResults.adhesiveBags20kg} Bags (20 kg)`, `Rs.${prices.adhesiveBag20kg}/bag`, `Rs.${singleResults.costAdhesive.toLocaleString('en-IN')}`],
      ['Labour (Masons & Helpers)', `${singleResults.masonMandays} Mason + ${singleResults.helperMandays} Helper`, 'CPWD DSR', `Rs.${singleResults.costLabour.toLocaleString('en-IN')}`],
      ['Scaffolding & Sundries', 'Lump-sum per m3', '—', `Rs.${singleResults.costScaffolding.toLocaleString('en-IN')}`],
      ['Contractor Margin & Overheads', `${prices.contractorMarginPct}%`, 'Direct Cost', `Rs.${singleResults.costMargin.toLocaleString('en-IN')}`],
      ['GST Tax on Works', `${prices.gstPercent}%`, 'Compounded', `Rs.${singleResults.costGst.toLocaleString('en-IN')}`]
    ];

    materialItems.forEach((row, i) => {
      doc.setFillColor(i % 2 === 0 ? 255 : 248, i % 2 === 0 ? 255 : 250, i % 2 === 0 ? 255 : 252);
      doc.rect(margin, y, 182, 6.5, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y + 6.5, margin + 182, y + 6.5);

      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(row[0], margin + 3, y + 4.5);
      doc.text(row[1], margin + 70, y + 4.5);
      doc.text(row[2], margin + 120, y + 4.5);
      doc.setFont('helvetica', 'bold');
      doc.text(row[3], margin + 155, y + 4.5);
      y += 6.5;
    });

    // Total Banner
    y += 3;
    doc.setFillColor(16, 185, 129);
    doc.roundedRect(margin, y, 182, 12, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('ESTIMATED GRAND TOTAL COST:', margin + 4, y + 8);
    doc.setFontSize(13);
    doc.text(`Rs. ${singleResults.costGrandTotal.toLocaleString('en-IN')}`, margin + 135, y + 8.5);

    y += 18;

    // Multi-Wall Summary if exists
    if (scheduledWalls.length > 1) {
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(margin, y, 182, 20, 2, 2, 'F');
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(`Multi-Wall Building Schedule (${scheduledWalls.length} Walls):`, margin + 4, y + 6);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`Total Bricks: ${multiWallResults.totalBricks.toLocaleString()} pcs | Total Cement: ${multiWallResults.totalCementBags} bags | Sand: ${multiWallResults.totalSandCft} cft (${multiWallResults.totalSandBrass} Brass)`, margin + 4, y + 11);
      doc.text(`Combined Building Masonry Budget: Rs.${multiWallResults.totalCost.toLocaleString('en-IN')} (Net Surface Area: ${multiWallResults.totalWallAreaSqFt} sq.ft / ${multiWallResults.totalWallVolM3} m3)`, margin + 4, y + 16);
      y += 24;
    }

    // Engineering Notes
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.text('Engineering Standards & Measurement Notes:', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text('1. Mortar calculations apply 1.33 dry volume expansion multiplier and 10mm nominal joints per CPWD DSR.', margin, y + 4.5);
    doc.text('2. Deductions comply with IS 1200 Part 3 (openings up to 0.1 sq.m are not deducted from masonry volume).', margin, y + 8.5);
    doc.text('3. Rates are indicative market averages and subject to local freight, lead distance, GST slab, and site access.', margin, y + 12.5);

    doc.save(`Brick_Masonry_Estimate_${Date.now()}.pdf`);
    showToast('Downloaded PDF Engineering Estimate!');
  };

  const handleReset = () => {
    setWallLength(20);
    setWallHeight(10);
    setWallThicknessInches(9);
    setBrickTypeId('traditional');
    setMortarRatioId('1:6');
    setBondType('english');
    setMortarJointMm(10);
    setWastagePercent(5);
    setSingleWallOpenings([
      { id: 'op_1', name: 'Standard Window (4x4 ft)', type: 'window', width: 4, height: 4, count: 1 },
      { id: 'op_2', name: 'Room Door (3x7 ft)', type: 'door', width: 3, height: 7, count: 1 }
    ]);
    handleApplyCityRates('mumbai');
    showToast('Reset all parameters to default Indian standards!');
  };

  return (
    <>
      <SEO
        title="Brick Calculator India | Masonry Material & Mortar Estimator IS 1077 / CPWD"
        description="Calculate exact number of bricks, cement bags, sand cft/brass, and mortar volume for 4.5-inch partition, 9-inch external, AAC blocks and Rat-Trap bond walls. Free PDF and WhatsApp quote export."
        keywords={['brick calculator india', 'brick masonry calculator', 'number of bricks in 9 inch wall', 'cement sand mortar calculator for brickwork', 'aac block vs red brick calculator', 'rat trap bond brick calculator', 'cpwd brick rate analysis']}
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
        <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-amber-900 via-orange-950 to-slate-950 text-white border border-amber-800/40 shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <Building className="w-80 h-80" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5" />
                <span>IS 1077 • IS 2212 • IS 1200 Pt-3 • CPWD DSR Compliant</span>
              </div>
              <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white">
                Brickwork &amp; Masonry Estimator India
              </h1>
              <p className="text-xs md:text-sm text-amber-200/80 leading-relaxed">
                High-precision civil engineering quantity takeoff for 4.5&quot; partition walls, 9&quot; / 13.5&quot; external walls, AAC blocks, and cost-saving Laurie Baker Rat-Trap cavity bonds. Complete with opening deductions, cement-sand mortar split, and live city market pricing.
              </p>
            </div>

            {/* Top Stat Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl text-right min-w-[200px] shadow-lg">
              <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">
                Estimated Masonry Cost
              </span>
              <div className="text-2xl md:text-3xl font-black text-amber-300 font-mono">
                ₹{(activeTab === 'single' || activeTab === 'labour' ? singleResults.costGrandTotal : multiWallResults.totalCost).toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-amber-200/70 block">
                ₹{singleResults.costPerSqFt} / sq.ft • ₹{singleResults.costPerM3} / m³
              </span>
            </div>
          </div>

          {/* Navigation Tab Bar */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap gap-2">
            {[
              { id: 'single', label: '1. Single Wall Estimator', icon: Ruler },
              { id: 'multi', label: `2. Multi-Wall Schedule (${scheduledWalls.length})`, icon: Layers },
              { id: 'compare', label: '3. AAC vs Clay vs Rat-Trap', icon: TrendingDown },
              { id: 'labour', label: '4. CPWD Labour & Rates', icon: HardHat },
              { id: 'export', label: '5. Export & WhatsApp Quote', icon: Share2 }
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
        {/* TAB 1: Single Wall Estimator */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'single' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Controls Panel */}
            <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-6 shadow-sm">
              
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📐</span>
                  <h2 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                    Wall Dimensions &amp; Masonry Specs
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  {/* Unit Toggle */}
                  <div className="bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl flex text-xs font-bold">
                    <button
                      onClick={() => setUnitMode('feet')}
                      className={`px-3 py-1 rounded-lg transition ${unitMode === 'feet' ? 'bg-amber-500 text-slate-950 font-black' : 'text-zinc-500'}`}
                    >
                      Feet (ft)
                    </button>
                    <button
                      onClick={() => setUnitMode('meters')}
                      className={`px-3 py-1 rounded-lg transition ${unitMode === 'meters' ? 'bg-amber-500 text-slate-950 font-black' : 'text-zinc-500'}`}
                    >
                      Meters (m)
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

              {/* Dimensions Inputs */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-zinc-500">Wall Length ({unitMode === 'meters' ? 'm' : 'ft'})</label>
                  <input
                    type="number"
                    value={wallLength}
                    onChange={(e) => setWallLength(Math.max(0.1, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-mono font-bold text-zinc-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-zinc-500">Wall Height ({unitMode === 'meters' ? 'm' : 'ft'})</label>
                  <input
                    type="number"
                    value={wallHeight}
                    onChange={(e) => setWallHeight(Math.max(0.1, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-mono font-bold text-zinc-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-zinc-500">Wall Thickness</label>
                  <select
                    value={wallThicknessInches}
                    onChange={(e) => setWallThicknessInches(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-bold text-zinc-900 dark:text-white text-xs"
                  >
                    <option value={4.5}>4.5&quot; (Single / Partition)</option>
                    <option value={6}>6&quot; (AAC Block External)</option>
                    <option value={9}>9&quot; (Standard External / 1-Brick)</option>
                    <option value={13.5}>13.5&quot; (1.5-Brick Heavy)</option>
                    <option value={18}>18&quot; (2-Brick Foundation)</option>
                  </select>
                </div>
              </div>

              {/* Brick Selection */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-zinc-500">
                  Brick / Masonry Block Specification (IS 1077 / IS 2185)
                </label>
                <select
                  value={brickTypeId}
                  onChange={(e) => setBrickTypeId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-bold text-zinc-900 dark:text-white text-xs"
                >
                  {Object.values(BRICK_PRESETS).map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                <p className="text-[11px] text-zinc-500 italic">
                  {BRICK_PRESETS[brickTypeId]?.description}
                </p>
              </div>

              {/* Custom Brick Dimensions if custom selected */}
              {brickTypeId === 'custom' && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-2xl space-y-3">
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-300 block">
                    Custom Brick Dimensions (in Millimeters):
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 block">Length (mm)</label>
                      <input
                        type="number"
                        value={customBrickL}
                        onChange={(e) => setCustomBrickL(Math.max(10, parseFloat(e.target.value) || 0))}
                        className="w-full px-2.5 py-1.5 border border-zinc-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 block">Width (mm)</label>
                      <input
                        type="number"
                        value={customBrickW}
                        onChange={(e) => setCustomBrickW(Math.max(10, parseFloat(e.target.value) || 0))}
                        className="w-full px-2.5 py-1.5 border border-zinc-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 block">Height (mm)</label>
                      <input
                        type="number"
                        value={customBrickH}
                        onChange={(e) => setCustomBrickH(Math.max(10, parseFloat(e.target.value) || 0))}
                        className="w-full px-2.5 py-1.5 border border-zinc-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-xs font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Bond Type & Mortar Ratio Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-zinc-500">Masonry Bond Pattern</label>
                  <select
                    value={bondType}
                    onChange={(e) => setBondType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-bold text-zinc-900 dark:text-white text-xs"
                  >
                    <option value="english">English Bond (Strongest Load Bearing)</option>
                    <option value="stretcher">Stretcher Bond (Standard 4.5&quot; Partition)</option>
                    <option value="flemish">Flemish Bond (Decorative Elevation)</option>
                    <option value="rattrap">Laurie Baker Rat-Trap Bond (24% Brick &amp; 35% Mortar Saving)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-zinc-500">Mortar Ratio (Cement : Sand)</label>
                  <select
                    value={mortarRatioId}
                    onChange={(e) => setMortarRatioId(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-bold text-zinc-900 dark:text-white text-xs"
                  >
                    {Object.values(MORTAR_PRESETS).map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Joint Thickness & Wastage */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-zinc-500">
                    <span>Mortar Joint Thickness</span>
                    <span className="font-mono text-zinc-900 dark:text-white">{mortarJointMm} mm</span>
                  </div>
                  <input
                    type="range"
                    min={3}
                    max={20}
                    step={1}
                    value={mortarJointMm}
                    onChange={(e) => setMortarJointMm(parseInt(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                  <div className="flex justify-between text-[9px] text-zinc-400">
                    <span>3mm (AAC Adhesive)</span>
                    <span>10mm (Standard CPWD)</span>
                    <span>20mm</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-zinc-500">
                    <span>Site Wastage &amp; Breakage</span>
                    <span className="font-mono text-zinc-900 dark:text-white">{wastagePercent}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={15}
                    step={1}
                    value={wastagePercent}
                    onChange={(e) => setWastagePercent(parseInt(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                  <div className="flex justify-between text-[9px] text-zinc-400">
                    <span>0% (Tight)</span>
                    <span>5% (IS Standard)</span>
                    <span>15%</span>
                  </div>
                </div>
              </div>

              {/* Openings Deductions (IS 1200 Part 3) */}
              <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                      Doors &amp; Windows Deductions (IS 1200 Pt-3)
                    </h3>
                    <p className="text-[10px] text-zinc-400">
                      Openings &ge; 0.1 m&sup2; (1 sq.ft) are automatically deducted from masonry volume.
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleAddSingleOpening()}
                      className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-bold text-zinc-800 dark:text-zinc-200 inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Custom Opening</span>
                    </button>
                  </div>
                </div>

                {/* Quick Add Presets */}
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] text-zinc-400 self-center mr-1">Quick Add:</span>
                  {STANDARD_OPENINGS.slice(0, 5).map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAddSingleOpening(preset)}
                      className="text-[10px] font-bold px-2 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/20 transition"
                    >
                      + {preset.name.split('(')[0].trim()}
                    </button>
                  ))}
                </div>

                {/* Openings Table */}
                {singleWallOpenings.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {singleWallOpenings.map(op => (
                      <div key={op.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs">
                        <span className="font-bold text-zinc-700 dark:text-zinc-300 w-32 truncate">{op.name}</span>
                        <div className="flex items-center gap-1 font-mono">
                          <input
                            type="number"
                            value={op.width}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setSingleWallOpenings(prev => prev.map(item => item.id === op.id ? { ...item, width: val } : item));
                            }}
                            className="w-14 px-1.5 py-1 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 text-center font-bold"
                          />
                          <span className="text-zinc-400">&times;</span>
                          <input
                            type="number"
                            value={op.height}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setSingleWallOpenings(prev => prev.map(item => item.id === op.id ? { ...item, height: val } : item));
                            }}
                            className="w-14 px-1.5 py-1 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 text-center font-bold"
                          />
                          <span className="text-zinc-400">{unitMode === 'meters' ? 'm' : 'ft'}</span>
                        </div>
                        <div className="flex items-center gap-1 ml-auto font-mono">
                          <span className="text-zinc-400 text-[10px]">Qty:</span>
                          <input
                            type="number"
                            min={1}
                            value={op.count || 1}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 1;
                              setSingleWallOpenings(prev => prev.map(item => item.id === op.id ? { ...item, count: val } : item));
                            }}
                            className="w-10 px-1 py-1 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 text-center font-bold"
                          />
                        </div>
                        <button
                          onClick={() => handleRemoveSingleOpening(op.id)}
                          className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded"
                          title="Remove opening"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 italic p-3 text-center bg-zinc-50 dark:bg-zinc-950 rounded-xl">
                    No openings added. Wall is calculated as continuous solid masonry.
                  </p>
                )}
              </div>
            </div>

            {/* Right Output Dashboard */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Primary Material Takeoff Card */}
              <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-zinc-900/40 dark:bg-zinc-900 border-2 border-amber-500/40 rounded-3xl p-6 space-y-5 shadow-lg relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                      Total Masonry Units Required
                    </span>
                    <div className="text-4xl font-black text-zinc-900 dark:text-white font-mono tracking-tight">
                      {singleResults.numBricks.toLocaleString()}
                      <span className="text-sm font-bold text-zinc-500 ml-1.5">
                        {BRICK_PRESETS[brickTypeId]?.isAAC ? 'Blocks' : 'Bricks'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400 block">Net Volume</span>
                    <span className="text-sm font-black text-zinc-800 dark:text-zinc-200 font-mono">
                      {singleResults.netWallVolM3} m&sup3; ({singleResults.netWallVolCft} cft)
                    </span>
                  </div>
                </div>

                {/* Material Indent Breakdown */}
                <div className="grid grid-cols-2 gap-3">
                  {BRICK_PRESETS[brickTypeId]?.isAAC ? (
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 space-y-1 col-span-2">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        Polymer Block Adhesive (20kg Bags)
                      </span>
                      <div className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">
                        {singleResults.adhesiveBags20kg} Bags
                      </div>
                      <span className="text-[10px] text-zinc-500 block">
                        3mm thin-bed joint • No sand/cement required
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 space-y-1">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                          Cement (50 kg Bags)
                        </span>
                        <div className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">
                          {singleResults.cementBags} Bags
                        </div>
                        <span className="text-[10px] text-zinc-500 block">
                          {singleResults.cementKg} kg OPC/PPC
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 space-y-1">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                          River / M-Sand
                        </span>
                        <div className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">
                          {singleResults.sandCft} cft
                        </div>
                        <span className="text-[10px] text-zinc-500 block">
                          {singleResults.sandBrass} Brass ({singleResults.sandTonnes} T)
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Additional Engineering Metrics */}
                <div className="space-y-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800 text-xs">
                  <div className="flex justify-between py-1 text-zinc-600 dark:text-zinc-400">
                    <span>Gross Wall Surface Area:</span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-white">
                      {singleResults.grossWallAreaSqFt} sq.ft ({singleResults.grossWallAreaSqM} m&sup2;)
                    </span>
                  </div>
                  <div className="flex justify-between py-1 text-zinc-600 dark:text-zinc-400">
                    <span>Openings Deducted (IS 1200):</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      - {singleResults.openingsDeductedAreaSqFt} sq.ft
                    </span>
                  </div>
                  <div className="flex justify-between py-1 text-zinc-600 dark:text-zinc-400">
                    <span>Net Masonry Surface Area:</span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-white">
                      {singleResults.netWallAreaSqFt} sq.ft
                    </span>
                  </div>
                  <div className="flex justify-between py-1 text-zinc-600 dark:text-zinc-400">
                    <span>Wet / Dry Mortar Volume:</span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-white">
                      {singleResults.dryMortarVolCft} cft ({singleResults.dryMortarVolM3} m&sup3;)
                    </span>
                  </div>
                  <div className="flex justify-between py-1 text-zinc-600 dark:text-zinc-400">
                    <span>Structural Dead Load:</span>
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                      {singleResults.totalWallDeadWeightTonnes} Metric Tonnes
                    </span>
                  </div>
                  <div className="flex justify-between py-1 text-zinc-600 dark:text-zinc-400">
                    <span>Curing Water Requirement:</span>
                    <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
                      ~ {singleResults.waterLitres} Litres
                    </span>
                  </div>
                </div>

                {/* Interactive 2D Wall Elevation & Bond Visualizer */}
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      2D Wall Elevation &amp; Bond Pattern
                    </span>
                    <span className="font-mono text-[10px] text-amber-400">
                      {bondType.toUpperCase()} BOND
                    </span>
                  </div>

                  {/* SVG Wall Canvas */}
                  <div className="w-full h-36 bg-zinc-900 rounded-xl p-2 border border-zinc-800 relative flex items-center justify-center overflow-hidden">
                    <svg viewBox="0 0 300 140" className="w-full h-full">
                      {/* Wall Outline */}
                      <rect x="10" y="10" width="280" height="120" fill="#27272a" stroke="#d97706" strokeWidth="2" rx="4" />
                      
                      {/* Brick Pattern Simulation */}
                      {Array.from({ length: 6 }).map((_, row) => {
                        const isOffset = row % 2 === 1;
                        const brickW = bondType === 'rattrap' ? 44 : 32;
                        const count = Math.ceil(280 / brickW) + 1;
                        return Array.from({ length: count }).map((__, col) => {
                          const x = 10 + col * brickW - (isOffset ? brickW / 2 : 0);
                          const y = 10 + row * 20;
                          if (x < 10 || x + brickW > 290) return null;
                          return (
                            <rect
                              key={`${row}-${col}`}
                              x={x + 1}
                              y={y + 1}
                              width={brickW - 2}
                              height={18}
                              fill={bondType === 'rattrap' ? '#9a3412' : '#c2410c'}
                              stroke="#431407"
                              strokeWidth="0.8"
                              rx="1"
                              opacity={0.85}
                            />
                          );
                        });
                      })}

                      {/* Openings Representation */}
                      {singleWallOpenings.map((op, i) => {
                        const ox = 40 + i * 80;
                        const oy = op.type === 'door' ? 50 : 35;
                        const ow = 50;
                        const oh = op.type === 'door' ? 80 : 50;
                        return (
                          <g key={op.id}>
                            <rect x={ox} y={oy} width={ow} height={oh} fill="#09090b" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 2" rx="2" />
                            <text x={ox + ow / 2} y={oy + oh / 2} fill="#38bdf8" fontSize="8" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">
                              {op.type.toUpperCase()}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: Multi-Wall & Whole House Schedule */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'multi' && (
          <div className="space-y-6">
            
            {/* Quick 4-Wall Room Envelope Generator */}
            <div className="p-6 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/30 rounded-3xl space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Building className="w-4 h-4 text-amber-500" />
                    Fast 4-Wall Room Envelope Generator
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Instantly creates 4 masonry walls (Front, Back, Left, Right) with standard doors and windows.
                  </p>
                </div>

                <button
                  onClick={handleGenerateRoom4Walls}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition shadow-lg shadow-amber-500/20 inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Generate Room Envelope</span>
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 block">Room Length (ft)</label>
                  <input
                    type="number"
                    value={roomLengthFt}
                    onChange={(e) => setRoomLengthFt(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 block">Room Width (ft)</label>
                  <input
                    type="number"
                    value={roomWidthFt}
                    onChange={(e) => setRoomWidthFt(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 block">Ceiling Height (ft)</label>
                  <input
                    type="number"
                    value={roomCeilingHeightFt}
                    onChange={(e) => setRoomCeilingHeightFt(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 block">Wall Thickness</label>
                  <select
                    value={roomOuterThickness}
                    onChange={(e) => setRoomOuterThickness(parseFloat(e.target.value))}
                    className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-xs font-bold"
                  >
                    <option value={4.5}>4.5&quot; Partition</option>
                    <option value={6}>6&quot; AAC Block</option>
                    <option value={9}>9&quot; External</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Scheduled Walls Table */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-5 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                    Building Masonry Wall Schedule ({scheduledWalls.length} Walls)
                  </h3>
                  <p className="text-[10px] text-zinc-400">
                    Individual wall dimensions, bonds, brick specifications and openings deductions.
                  </p>
                </div>
                <button
                  onClick={handleAddScheduledWall}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Wall</span>
                </button>
              </div>

              {/* Table Component */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                      <th className="py-3 px-3">Wall Description</th>
                      <th className="py-3 px-3 text-center">Dimensions</th>
                      <th className="py-3 px-3 text-center">Thickness</th>
                      <th className="py-3 px-3 text-center">Brick &amp; Bond</th>
                      <th className="py-3 px-3 text-right">Net Area</th>
                      <th className="py-3 px-3 text-right">Bricks Req</th>
                      <th className="py-3 px-3 text-right">Cement Bags</th>
                      <th className="py-3 px-3 text-right">Est. Cost</th>
                      <th className="py-3 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-medium">
                    {multiWallResults.wallDetails.map((w) => (
                      <tr key={w.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/20 transition">
                        <td className="py-3 px-3 font-bold text-zinc-900 dark:text-white">
                          <input
                            type="text"
                            value={w.name}
                            onChange={(e) => {
                              const val = e.target.value;
                              setScheduledWalls(prev => prev.map(item => item.id === w.id ? { ...item, name: val } : item));
                            }}
                            className="bg-transparent font-bold text-zinc-900 dark:text-white border-b border-transparent hover:border-zinc-300 focus:outline-none"
                          />
                        </td>
                        <td className="py-3 px-3 text-center font-mono">
                          {w.length} x {w.height} {unitMode === 'meters' ? 'm' : 'ft'}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-amber-600 dark:text-amber-400">
                          {w.thicknessInches}&quot;
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 font-bold">
                            {w.bondType.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono">
                          {w.metrics.netWallAreaSqFt} sq.ft
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-zinc-900 dark:text-white">
                          {w.metrics.numBricks.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-amber-600 dark:text-amber-400 font-bold">
                          {w.metrics.cementBags}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-black text-emerald-600 dark:text-emerald-400">
                          ₹{w.metrics.costGrandTotal.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => handleRemoveScheduledWall(w.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg"
                            title="Remove wall"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Consolidated Grand Summary Bar */}
              <div className="p-6 rounded-2xl bg-zinc-950 text-white border border-zinc-800 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Total Bricks</span>
                  <div className="text-2xl font-black text-amber-400 font-mono">
                    {multiWallResults.totalBricks.toLocaleString()} <span className="text-xs text-zinc-400 font-normal">Pcs</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Total Cement</span>
                  <div className="text-2xl font-black text-amber-400 font-mono">
                    {multiWallResults.totalCementBags} <span className="text-xs text-zinc-400 font-normal">Bags</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Total Sand</span>
                  <div className="text-2xl font-black text-amber-400 font-mono">
                    {multiWallResults.totalSandCft} <span className="text-xs text-zinc-400 font-normal">cft ({multiWallResults.totalSandBrass} Brass)</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Grand Masonry Budget</span>
                  <div className="text-2xl font-black text-emerald-400 font-mono">
                    ₹{multiWallResults.totalCost.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: AAC vs Clay vs Fly Ash vs Rat-Trap Benchmark */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'compare' && (
          <div className="space-y-6">
            <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-4 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                    Masonry Wall Technology Benchmark Comparison
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Side-by-side engineering and financial comparison for standard {wallLength}x{wallHeight} {unitMode === 'meters' ? 'm' : 'ft'} wall ({singleResults.netWallAreaSqFt} sq.ft surface).
                  </p>
                </div>
              </div>

              {/* Comparison Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {comparisonData.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-5 rounded-2xl border transition relative flex flex-col justify-between ${
                      item.isRecommended
                        ? 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/50 shadow-md'
                        : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
                          {item.tag}
                        </span>
                        {item.isRecommended && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-500 text-white rounded">
                            Recommended
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                        {item.type}
                      </h4>
                      <p className="text-[11px] text-zinc-500">
                        {item.spec}
                      </p>

                      <div className="space-y-1.5 text-xs pt-2 border-t border-zinc-200/60 dark:border-zinc-800">
                        <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                          <span>Units Req:</span>
                          <span className="font-mono font-bold text-zinc-900 dark:text-white">{item.unitsRequired}</span>
                        </div>
                        <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                          <span>Cement:</span>
                          <span className="font-mono font-bold text-zinc-900 dark:text-white">{item.cementReq}</span>
                        </div>
                        <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                          <span>Sand:</span>
                          <span className="font-mono font-bold text-zinc-900 dark:text-white">{item.sandReq}</span>
                        </div>
                        <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                          <span>Dead Load:</span>
                          <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{item.deadWeight}</span>
                        </div>
                        <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                          <span>Thermal U-Val:</span>
                          <span className="font-mono text-[10px] text-zinc-700 dark:text-zinc-300">{item.thermalInsulation}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-end">
                      <div>
                        <span className="text-[9px] text-zinc-400 uppercase tracking-wider block">Total Wall Cost</span>
                        <div className="text-xl font-black text-zinc-900 dark:text-white font-mono">
                          ₹{item.totalCost.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div className="text-right font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                        ₹{item.costPerSqFt}/sqft
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 4: CPWD Labour & Rate Analysis */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'labour' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Rates & Wages Modifier */}
            <div className="lg:col-span-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-6 shadow-sm">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🛠️</span>
                  <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                    Regional City Matrix &amp; Unit Rates
                  </h3>
                </div>
              </div>

              {/* City Selection Pills */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-500 block">Select City Market Preset:</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(CITY_RATE_PRESETS).map(([key, c]) => (
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

              {/* Editable Rate Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 block">Red Brick Rate (₹/pc)</label>
                  <input
                    type="number"
                    value={prices.brickPcs}
                    onChange={(e) => setPrices(prev => ({ ...prev, brickPcs: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-mono font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 block">AAC Block Rate (₹/block)</label>
                  <input
                    type="number"
                    value={prices.aacBlockPcs}
                    onChange={(e) => setPrices(prev => ({ ...prev, aacBlockPcs: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-mono font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 block">Cement Rate (₹/50kg bag)</label>
                  <input
                    type="number"
                    value={prices.cementBag}
                    onChange={(e) => setPrices(prev => ({ ...prev, cementBag: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-mono font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 block">Sand Rate (₹/cft)</label>
                  <input
                    type="number"
                    value={prices.sandCft}
                    onChange={(e) => setPrices(prev => ({ ...prev, sandCft: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-mono font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 block">Mason Daily Wage (₹/day)</label>
                  <input
                    type="number"
                    value={prices.masonWageDay}
                    onChange={(e) => setPrices(prev => ({ ...prev, masonWageDay: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-mono font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 block">Helper Daily Wage (₹/day)</label>
                  <input
                    type="number"
                    value={prices.helperWageDay}
                    onChange={(e) => setPrices(prev => ({ ...prev, helperWageDay: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-mono font-bold text-xs"
                  />
                </div>
              </div>
            </div>

            {/* CPWD Labour Analysis Card */}
            <div className="lg:col-span-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-6 shadow-sm">
              <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                  CPWD DSR Itemized Rate Breakdown
                </h3>
                <p className="text-[10px] text-zinc-400">
                  Standard labour coefficients per cubic meter of brick masonry.
                </p>
              </div>

              {/* Rate Breakdown Table */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-600 dark:text-zinc-400">Mason Output (0.94 Mandays/m&sup3;):</span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-white">
                    {singleResults.masonMandays} Days (&times; ₹{prices.masonWageDay}) = ₹{Math.round(singleResults.masonMandays * prices.masonWageDay).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-600 dark:text-zinc-400">Helper Output (1.40 Mandays/m&sup3;):</span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-white">
                    {singleResults.helperMandays} Days (&times; ₹{prices.helperWageDay}) = ₹{Math.round(singleResults.helperMandays * prices.helperWageDay).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-600 dark:text-zinc-400">Materials Total Cost:</span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-white">
                    ₹{singleResults.costMaterialBase.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-600 dark:text-zinc-400">Scaffolding &amp; Sundries:</span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-white">
                    ₹{singleResults.costScaffolding.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-600 dark:text-zinc-400">Contractor Profit &amp; Overheads ({prices.contractorMarginPct}%):</span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-white">
                    ₹{Math.round(singleResults.costMargin).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-600 dark:text-zinc-400">GST on Construction Work ({prices.gstPercent}%):</span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-white">
                    ₹{Math.round(singleResults.costGst).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex justify-between items-center">
                  <span className="font-black text-amber-900 dark:text-amber-300">
                    Grand Total Unit Rate:
                  </span>
                  <div className="text-right">
                    <span className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono block">
                      ₹{singleResults.costPerSqFt} / sq.ft
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      (₹{singleResults.costPerM3} / m&sup3;)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 5: Export & WhatsApp Quotation Hub */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'export' && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
            <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div>
                <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-amber-500" />
                  Instant WhatsApp Quotation &amp; Document Exports
                </h3>
                <p className="text-xs text-zinc-500">
                  Generate professional quotes for clients, contractors, and multi-sheet Excel BOQ takeoff reports.
                </p>
              </div>
            </div>

            {/* 3 Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* WhatsApp Card */}
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 block">
                    1-Click WhatsApp Share
                  </span>
                  <p className="text-[11px] text-zinc-500">
                    Share complete formatted estimate with material counts and price breakdown directly on WhatsApp.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleShareWhatsApp}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition inline-flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Send to Client</span>
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
                    Download multi-sheet workbook containing Single Wall Takeoff and Multi-Wall schedule with rate analysis.
                  </p>
                </div>
                <button
                  onClick={handleExportExcel}
                  className="w-full py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-xs hover:bg-zinc-800 transition inline-flex items-center justify-center gap-2"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Download Excel (.xlsx)</span>
                </button>
              </div>

              {/* PDF Card */}
              <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/20 space-y-3 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-black text-red-700 dark:text-red-400 block">
                    Engineering PDF Estimate
                  </span>
                  <p className="text-[11px] text-zinc-500">
                    High-resolution PDF document with IS 1077/1200 technical details, material indent, and CPWD notes.
                  </p>
                </div>
                <button
                  onClick={handleExportPDF}
                  className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs transition inline-flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download PDF Report</span>
                </button>
              </div>
            </div>

            {/* Live WhatsApp Quotation Preview */}
            <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-3 font-mono text-xs">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                Live Quotation Text Preview:
              </span>
              <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed overflow-x-auto p-4 bg-black/40 rounded-2xl border border-zinc-800/80">
                {generateWhatsAppQuote()}
              </pre>
            </div>
          </div>
        )}

        {/* Live Material Market Trends Graph */}
        <MaterialTrendGraph allowedMaterials={['bricks', 'cement', 'sand']} />

        {/* Comprehensive Technical Guide & Engineering FAQs (SEO / AEO / GEO) */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 space-y-8 shadow-sm">
          
          <div className="space-y-3">
            <h3 className="text-lg md:text-xl font-black text-zinc-900 dark:text-white">
              Indian Standard (IS) Brick Masonry Rules &amp; Engineering Mathematics
            </h3>
            <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Brickwork calculations in India are governed by <strong>IS 1077 (Clay Bricks)</strong>, <strong>IS 2212 (Code of Practice for Brickwork)</strong>, and <strong>IS 1200 Part 3 (Method of Measurement for Building Works)</strong>. Understanding the dry volume multiplier, frog filling factor, and openings deduction rules ensures 100% material accounting accuracy on site.
            </p>
          </div>

          {/* Quick Technical Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <h4 className="font-bold text-xs text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                1. IS 1077 Brick Modular vs Traditional
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Standard modular brick is 190 &times; 90 &times; 90 mm (200 &times; 100 &times; 100 mm nominal with mortar). Traditional country red brick is 9&quot; &times; 4.25&quot; &times; 2.75&quot; (228.6 &times; 114.3 &times; 76.2 mm). 1 cubic meter of 9&quot; brickwork requires approximately 490 to 500 modular bricks or 430 to 450 traditional bricks.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <h4 className="font-bold text-xs text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                2. IS 1200 Part 3 Deduction Standards
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Openings &lt; 0.1 m&sup2; (approx 1 sq.ft), ends of beams/lintels up to 500 cm&sup2;, and wall plates are <strong>NOT deducted</strong> from brickwork volume. All doors, windows, and openings &ge; 0.1 m&sup2; must be deducted in full.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <h4 className="font-bold text-xs text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                3. Mortar Dry Volume Constant (1.33x)
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                When water is added to dry cement and sand, voids shrink. Therefore, 1.33 &times; wet mortar volume is required to calculate dry cement and sand quantities. In AAC blocks, thin-bed polymer adhesive (3mm) replaces bulky mortar completely.
              </p>
            </div>
          </div>

          {/* Mathematical Formulations */}
          <div className="p-5 rounded-2xl bg-zinc-950 text-white border border-zinc-800 space-y-3 font-mono text-xs">
            <h4 className="font-bold text-amber-400 uppercase tracking-wider">
              Fundamental Masonry Formulae:
            </h4>
            <div className="space-y-1 text-zinc-300 leading-relaxed">
              <p>1. Net Wall Volume = Net Length &times; Net Height &times; Wall Thickness</p>
              <p>2. Bricks Required = (Net Wall Volume / Nominal Brick Volume) &times; (1 + Wastage %)</p>
              <p>3. Wet Mortar Vol = Net Wall Vol - (Bricks Count &times; Clean Brick Vol)</p>
              <p>4. Dry Mortar Vol = Wet Mortar Vol &times; 1.33</p>
              <p>5. Cement (Bags) = [Cement Ratio / (Cement + Sand Ratio)] &times; Dry Vol / 0.0347 m&sup3;</p>
              <p>6. Sand (Cu.Ft) = [Sand Ratio / (Cement + Sand Ratio)] &times; Dry Vol &times; 35.3147</p>
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
                  How many bricks are required in a 100 sq.ft 9-inch wall in India?
                </h4>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  A 100 sq.ft wall of 9-inch thickness has a total volume of 75 cubic feet (2.124 cubic meters). Using standard country red bricks with 10mm mortar joints, it requires approximately <strong>900 to 950 bricks</strong>, <strong>4 to 5 bags of cement</strong> (in 1:6 ratio), and <strong>24 to 28 cft of sand</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                <h4 className="font-bold text-zinc-900 dark:text-white">
                  What is Laurie Baker Rat-Trap Bond and how does it save cost?
                </h4>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Rat-Trap Bond is a modular masonry technique where bricks are placed on edge instead of flat. This creates an internal thermal cavity within a 9-inch wall. It consumes <strong>24% fewer bricks</strong>, <strong>35% less cement mortar</strong>, reduces structural dead load, and provides built-in thermal and acoustic insulation without compromising load-bearing strength.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                <h4 className="font-bold text-zinc-900 dark:text-white">
                  Why choose AAC blocks over traditional red clay bricks?
                </h4>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  AAC blocks are 50% lighter than red clay bricks, significantly reducing the dead load on RCC columns and foundations. They use 3mm thin-bed polymer adhesive instead of thick cement-sand mortar, speed up wall construction by 3x, and have a superior thermal U-value (0.65 W/m&sup2;K vs 2.0 W/m&sup2;K), cutting building HVAC air-conditioning electricity costs by up to 25%.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </>
  );
}

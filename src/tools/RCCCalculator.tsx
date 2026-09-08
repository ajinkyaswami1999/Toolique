import { useState, useEffect, useMemo } from 'react';
import {
  Copy, Check, RotateCcw, Plus, Trash2,
  Printer, MessageCircle, Box,
  Layers, ShieldCheck, Download,
  FileText, Truck, Clock
} from 'lucide-react';
import { getStoredRates, saveStoredRates, DEFAULT_CIVIL_RATES } from '../data/civilRatesData';
import MaterialTrendGraph from '../components/MaterialTrendGraph';
import { jsPDF } from 'jspdf';

// -------------------------------------------------------------
// Structural Elements & Mix Specifications (IS 456:2000)
// -------------------------------------------------------------
export type RCCElementType =
  | 'slab'
  | 'beam'
  | 'column_rect'
  | 'column_round'
  | 'footing'
  | 'retaining_wall'
  | 'stairs'
  | 'lintel_chajja'
  | 'direct_volume';

export interface ConcreteGradeMix {
  grade: string;
  name: string;
  cement: number;
  sand: number;
  aggregate: number;
  strengthMpa: number;
  waterCementRatio: number; // liters / cement wt
  recommendedFor: string;
}

export const RCC_MIX_GRADES: Record<string, ConcreteGradeMix> = {
  M15: { grade: 'M15', name: 'M15 (1:2:4)', cement: 1, sand: 2, aggregate: 4, strengthMpa: 15, waterCementRatio: 0.60, recommendedFor: 'Light PCC, pathways, non-load bearing members' },
  M20: { grade: 'M20', name: 'M20 (1:1.5:3)', cement: 1, sand: 1.5, aggregate: 3, strengthMpa: 20, waterCementRatio: 0.55, recommendedFor: 'Standard residential RCC slabs, beams, columns (IS 456 min)' },
  M25: { grade: 'M25', name: 'M25 (1:1:2)', cement: 1, sand: 1, aggregate: 2, strengthMpa: 25, waterCementRatio: 0.50, recommendedFor: 'High-rise columns, heavy footings, water retaining tanks' },
  M30: { grade: 'M30', name: 'M30 (1:0.75:1.5)', cement: 1, sand: 0.75, aggregate: 1.5, strengthMpa: 30, waterCementRatio: 0.45, recommendedFor: 'Commercial buildings, cantilever slabs, pre-stressed members' },
  M35: { grade: 'M35', name: 'M35 (Design Mix)', cement: 1, sand: 0.65, aggregate: 1.35, strengthMpa: 35, waterCementRatio: 0.42, recommendedFor: 'Heavy infrastructure, industrial slabs, bridge piers' },
};

// Standard Steel Reinforcement Rules of Thumb (IS 456)
export const DEFAULT_STEEL_RATIOS: Record<RCCElementType, { min: number; max: number; std: number; kgPerM3: number; shutteringFactor: number; clearCoverMm: number }> = {
  slab: { min: 0.7, max: 1.2, std: 1.0, kgPerM3: 78.5, shutteringFactor: 11.5, clearCoverMm: 20 },
  beam: { min: 1.0, max: 2.5, std: 1.8, kgPerM3: 141.3, shutteringFactor: 12.0, clearCoverMm: 25 },
  column_rect: { min: 1.5, max: 4.0, std: 2.5, kgPerM3: 196.25, shutteringFactor: 13.5, clearCoverMm: 40 },
  column_round: { min: 1.5, max: 4.0, std: 2.5, kgPerM3: 196.25, shutteringFactor: 14.0, clearCoverMm: 40 },
  footing: { min: 0.5, max: 1.0, std: 0.8, kgPerM3: 62.8, shutteringFactor: 4.5, clearCoverMm: 50 },
  retaining_wall: { min: 0.8, max: 1.8, std: 1.2, kgPerM3: 94.2, shutteringFactor: 10.0, clearCoverMm: 30 },
  stairs: { min: 0.9, max: 1.5, std: 1.2, kgPerM3: 94.2, shutteringFactor: 14.5, clearCoverMm: 20 },
  lintel_chajja: { min: 1.0, max: 2.0, std: 1.4, kgPerM3: 109.9, shutteringFactor: 15.0, clearCoverMm: 20 },
  direct_volume: { min: 0.5, max: 4.0, std: 1.2, kgPerM3: 94.2, shutteringFactor: 10.0, clearCoverMm: 25 },
};

// Bill of Quantities (BOQ) Schedule Item
export interface RCCTakeoffItem {
  id: string;
  elementType: RCCElementType;
  elementLabel: string;
  specs: string;
  quantity: number;
  concreteVolM3: number;
  cementBags: number;
  sandBrass: number;
  aggregateBrass: number;
  steelKg: number;
  steelTonnes: number;
  shutteringSqFt: number;
  totalCost: number;
}

export default function RCCCalculator() {
  // Global & Active Unit Settings
  const [elementType, setElementType] = useState<RCCElementType>('slab');
  const [unitMode, setUnitMode] = useState<'metric' | 'feet'>('metric');
  const [mixGrade, setMixGrade] = useState<string>('M20');
  const [quantity, setQuantity] = useState<number>(1);
  const [wastagePercent, setWastagePercent] = useState<number>(5); // 5% standard concrete wastage
  const [steelPercent, setSteelPercent] = useState<number>(1.0);
  const [steelGrade, setSteelGrade] = useState<string>('Fe 500D'); // Fe 500D standard
  const [includeAdmixture, setIncludeAdmixture] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  // Material Prices & Rates
  const [prices, setPrices] = useState(getStoredRates());
  const [admixtureRate] = useState<number>(130); // ₹/Liter

  // Multi-element BOQ Takeoff List
  const [takeoffList, setTakeoffList] = useState<RCCTakeoffItem[]>([]);

  // -------------------------------------------------------------
  // Dimension States (Element Specific)
  // -------------------------------------------------------------
  // 1. Slab
  const [slabLength, setSlabLength] = useState<number>(6.0); // m or ft (20 ft)
  const [slabWidth, setSlabWidth] = useState<number>(4.5);   // m or ft (15 ft)
  const [slabThickMm, setSlabThickMm] = useState<number>(125); // 125mm (5 inches)

  // 2. Beam
  const [beamLength, setBeamLength] = useState<number>(4.5); // m or ft (15 ft)
  const [beamWidthMm, setBeamWidthMm] = useState<number>(230); // 230mm (9 inches)
  const [beamDepthMm, setBeamDepthMm] = useState<number>(375); // 375mm (15 inches)

  // 3. Rectangular Column
  const [colWidthMm, setColWidthMm] = useState<number>(300); // 300mm (12 inches)
  const [colDepthMm, setColDepthMm] = useState<number>(300); // 300mm (12 inches)
  const [colHeight, setColHeight] = useState<number>(3.0);   // 3.0 m (10 ft)

  // 4. Circular Column
  const [roundColDiaMm, setRoundColDiaMm] = useState<number>(350); // mm (14 inches)
  const [roundColHeight, setRoundColHeight] = useState<number>(3.0); // m

  // 5. Footing
  const [footingLength, setFootingLength] = useState<number>(1.5); // m
  const [footingWidth, setFootingWidth] = useState<number>(1.5);   // m
  const [footingDepthMm, setFootingDepthMm] = useState<number>(400); // mm

  // 6. Retaining / Shear Wall
  const [wallLength, setWallLength] = useState<number>(6.0); // m
  const [wallHeight, setWallHeight] = useState<number>(2.7); // m
  const [wallThickMm, setWallThickMm] = useState<number>(200); // mm

  // 7. Staircase
  const [stairWidth, setStairWidth] = useState<number>(1.2); // m
  const [stairStepsCount, setStairStepsCount] = useState<number>(10);
  const [stairTreadMm, setStairTreadMm] = useState<number>(250); // mm
  const [stairRiserMm, setStairRiserMm] = useState<number>(150); // mm
  const [stairWaistMm, setStairWaistMm] = useState<number>(125); // mm

  // 8. Lintel & Chajja
  const [lintelLength, setLintelLength] = useState<number>(2.1); // m (including bearing)
  const [lintelWidthMm, setLintelWidthMm] = useState<number>(230); // mm
  const [lintelDepthMm, setLintelDepthMm] = useState<number>(150); // mm
  const [chajjaProjMm, setChajjaProjMm] = useState<number>(600); // mm
  const [chajjaThickMm, setChajjaThickMm] = useState<number>(75); // mm

  // 9. Direct Volume
  const [directVolume, setDirectVolume] = useState<number>(10); // m3 or ft3

  // Sync Storage Rates
  useEffect(() => {
    const handleStorage = () => setPrices(getStoredRates());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Update default steel ratio when element changes
  useEffect(() => {
    const def = DEFAULT_STEEL_RATIOS[elementType];
    if (def) {
      setSteelPercent(def.std);
    }
  }, [elementType]);

  // Handle Price Changes
  const handlePriceChange = (key: keyof typeof DEFAULT_CIVIL_RATES, val: number) => {
    const updated = { ...prices, [key]: val };
    setPrices(updated);
    saveStoredRates({ [key]: val });
  };

  // -------------------------------------------------------------
  // Comprehensive RCC Math Engine
  // -------------------------------------------------------------
  const activeCalc = useMemo(() => {
    let rawWetVolumeM3 = 0;
    let shutteringAreaSqFt = 0;
    let specDescription = '';

    // Unit conversion helpers
    const isFeet = unitMode === 'feet';

    if (isFeet) {
      // FEET INPUTS
      if (elementType === 'slab') {
        const l_m = slabLength * 0.3048;
        const w_m = slabWidth * 0.3048;
        const t_m = (slabThickMm / 12) * 0.3048; // slabThickMm acts as inches in feet mode
        rawWetVolumeM3 = l_m * w_m * t_m * quantity;
        shutteringAreaSqFt = (slabLength * slabWidth + 2 * (slabLength + slabWidth) * (slabThickMm / 12)) * quantity;
        specDescription = `Slab ${slabLength}' x ${slabWidth}' x ${slabThickMm}" (${quantity} Nos)`;
      } else if (elementType === 'beam') {
        const l_m = beamLength * 0.3048;
        const w_m = (beamWidthMm / 12) * 0.3048;
        const d_m = (beamDepthMm / 12) * 0.3048;
        rawWetVolumeM3 = l_m * w_m * d_m * quantity;
        shutteringAreaSqFt = (2 * (beamDepthMm / 12) + (beamWidthMm / 12)) * beamLength * quantity;
        specDescription = `Beam ${beamLength}' x ${beamWidthMm}" x ${beamDepthMm}" (${quantity} Nos)`;
      } else if (elementType === 'column_rect') {
        const w_m = (colWidthMm / 12) * 0.3048;
        const d_m = (colDepthMm / 12) * 0.3048;
        const h_m = colHeight * 0.3048;
        rawWetVolumeM3 = w_m * d_m * h_m * quantity;
        shutteringAreaSqFt = 2 * ((colWidthMm / 12) + (colDepthMm / 12)) * colHeight * quantity;
        specDescription = `Column ${colWidthMm}" x ${colDepthMm}" x ${colHeight}' (${quantity} Nos)`;
      } else if (elementType === 'column_round') {
        const r_m = ((roundColDiaMm / 12) / 2) * 0.3048;
        const h_m = roundColHeight * 0.3048;
        rawWetVolumeM3 = Math.PI * Math.pow(r_m, 2) * h_m * quantity;
        shutteringAreaSqFt = Math.PI * (roundColDiaMm / 12) * roundColHeight * quantity;
        specDescription = `Circular Column Ø${roundColDiaMm}" x ${roundColHeight}' (${quantity} Nos)`;
      } else if (elementType === 'footing') {
        const l_m = footingLength * 0.3048;
        const w_m = footingWidth * 0.3048;
        const d_m = (footingDepthMm / 12) * 0.3048;
        rawWetVolumeM3 = l_m * w_m * d_m * quantity;
        shutteringAreaSqFt = 2 * (footingLength + footingWidth) * (footingDepthMm / 12) * quantity;
        specDescription = `Footing ${footingLength}' x ${footingWidth}' x ${footingDepthMm}" (${quantity} Nos)`;
      } else if (elementType === 'retaining_wall') {
        const l_m = wallLength * 0.3048;
        const h_m = wallHeight * 0.3048;
        const t_m = (wallThickMm / 12) * 0.3048;
        rawWetVolumeM3 = l_m * h_m * t_m * quantity;
        shutteringAreaSqFt = 2 * (wallLength * wallHeight) * quantity;
        specDescription = `Wall ${wallLength}' x ${wallHeight}' x ${wallThickMm}" (${quantity} Nos)`;
      } else if (elementType === 'stairs') {
        const w_m = stairWidth * 0.3048;
        const t_m = (stairTreadMm / 12) * 0.3048;
        const r_m = (stairRiserMm / 12) * 0.3048;
        const waist_m = (stairWaistMm / 12) * 0.3048;
        const stepsVol = stairStepsCount * (0.5 * t_m * r_m) * w_m;
        const horizontalLen = stairStepsCount * t_m;
        const verticalLen = stairStepsCount * r_m;
        const inclineFlightLen = Math.sqrt(Math.pow(horizontalLen, 2) + Math.pow(verticalLen, 2));
        const waistVol = inclineFlightLen * w_m * waist_m;
        rawWetVolumeM3 = (stepsVol + waistVol) * quantity;
        shutteringAreaSqFt = (inclineFlightLen * stairWidth * 3.28084 * 3.28084 + stairStepsCount * (stairRiserMm / 12) * stairWidth) * quantity;
        specDescription = `Stairs ${stairStepsCount} Steps (${stairWidth}' flight) (${quantity} Nos)`;
      } else if (elementType === 'lintel_chajja') {
        const l_m = lintelLength * 0.3048;
        const w_m = (lintelWidthMm / 12) * 0.3048;
        const d_m = (lintelDepthMm / 12) * 0.3048;
        const c_proj_m = (chajjaProjMm / 12) * 0.3048;
        const c_thick_m = (chajjaThickMm / 12) * 0.3048;
        const lintelVol = l_m * w_m * d_m;
        const chajjaVol = l_m * c_proj_m * c_thick_m;
        rawWetVolumeM3 = (lintelVol + chajjaVol) * quantity;
        shutteringAreaSqFt = (2 * (lintelDepthMm / 12) + (lintelWidthMm / 12)) * lintelLength * quantity + (lintelLength * (chajjaProjMm / 12)) * quantity;
        specDescription = `Lintel & Chajja ${lintelLength}' x ${chajjaProjMm}" Proj (${quantity} Nos)`;
      } else {
        // Direct Volume in cu ft
        rawWetVolumeM3 = directVolume * 0.0283168;
        shutteringAreaSqFt = directVolume * 0.35; // approx 10 sq.m per m3 -> ~0.35 sq.ft per cu.ft
        specDescription = `Direct RCC Volume: ${directVolume} cu.ft`;
      }
    } else {
      // METRIC INPUTS (m, mm, cm)
      if (elementType === 'slab') {
        const t_m = slabThickMm / 1000;
        rawWetVolumeM3 = slabLength * slabWidth * t_m * quantity;
        const contactSqm = (slabLength * slabWidth + 2 * (slabLength + slabWidth) * t_m) * quantity;
        shutteringAreaSqFt = contactSqm * 10.7639;
        specDescription = `Slab ${slabLength}m x ${slabWidth}m x ${slabThickMm}mm (${quantity} Nos)`;
      } else if (elementType === 'beam') {
        const w_m = beamWidthMm / 1000;
        const d_m = beamDepthMm / 1000;
        rawWetVolumeM3 = beamLength * w_m * d_m * quantity;
        const contactSqm = (2 * d_m + w_m) * beamLength * quantity;
        shutteringAreaSqFt = contactSqm * 10.7639;
        specDescription = `Beam ${beamLength}m x ${beamWidthMm}mm x ${beamDepthMm}mm (${quantity} Nos)`;
      } else if (elementType === 'column_rect') {
        const w_m = colWidthMm / 1000;
        const d_m = colDepthMm / 1000;
        rawWetVolumeM3 = w_m * d_m * colHeight * quantity;
        const contactSqm = 2 * (w_m + d_m) * colHeight * quantity;
        shutteringAreaSqFt = contactSqm * 10.7639;
        specDescription = `Column ${colWidthMm}mm x ${colDepthMm}mm x ${colHeight}m (${quantity} Nos)`;
      } else if (elementType === 'column_round') {
        const r_m = (roundColDiaMm / 1000) / 2;
        rawWetVolumeM3 = Math.PI * Math.pow(r_m, 2) * roundColHeight * quantity;
        const contactSqm = Math.PI * (roundColDiaMm / 1000) * roundColHeight * quantity;
        shutteringAreaSqFt = contactSqm * 10.7639;
        specDescription = `Circular Column Ø${roundColDiaMm}mm x ${roundColHeight}m (${quantity} Nos)`;
      } else if (elementType === 'footing') {
        const d_m = footingDepthMm / 1000;
        rawWetVolumeM3 = footingLength * footingWidth * d_m * quantity;
        const contactSqm = 2 * (footingLength + footingWidth) * d_m * quantity;
        shutteringAreaSqFt = contactSqm * 10.7639;
        specDescription = `Footing ${footingLength}m x ${footingWidth}m x ${footingDepthMm}mm (${quantity} Nos)`;
      } else if (elementType === 'retaining_wall') {
        const t_m = wallThickMm / 1000;
        rawWetVolumeM3 = wallLength * wallHeight * t_m * quantity;
        const contactSqm = 2 * (wallLength * wallHeight) * quantity;
        shutteringAreaSqFt = contactSqm * 10.7639;
        specDescription = `Wall ${wallLength}m x ${wallHeight}m x ${wallThickMm}mm (${quantity} Nos)`;
      } else if (elementType === 'stairs') {
        const t_m = stairTreadMm / 1000;
        const r_m = stairRiserMm / 1000;
        const waist_m = stairWaistMm / 1000;
        const stepsVol = stairStepsCount * (0.5 * t_m * r_m) * stairWidth;
        const horizontalLen = stairStepsCount * t_m;
        const verticalLen = stairStepsCount * r_m;
        const inclineFlightLen = Math.sqrt(Math.pow(horizontalLen, 2) + Math.pow(verticalLen, 2));
        const waistVol = inclineFlightLen * stairWidth * waist_m;
        rawWetVolumeM3 = (stepsVol + waistVol) * quantity;
        const contactSqm = (inclineFlightLen * stairWidth + stairStepsCount * r_m * stairWidth) * quantity;
        shutteringAreaSqFt = contactSqm * 10.7639;
        specDescription = `Stairs ${stairStepsCount} Steps (${stairWidth}m flight) (${quantity} Nos)`;
      } else if (elementType === 'lintel_chajja') {
        const w_m = lintelWidthMm / 1000;
        const d_m = lintelDepthMm / 1000;
        const c_proj_m = chajjaProjMm / 1000;
        const c_thick_m = chajjaThickMm / 1000;
        const lintelVol = lintelLength * w_m * d_m;
        const chajjaVol = lintelLength * c_proj_m * c_thick_m;
        rawWetVolumeM3 = (lintelVol + chajjaVol) * quantity;
        const contactSqm = ((2 * d_m + w_m) * lintelLength + lintelLength * c_proj_m) * quantity;
        shutteringAreaSqFt = contactSqm * 10.7639;
        specDescription = `Lintel & Chajja ${lintelLength}m x ${chajjaProjMm}mm Proj (${quantity} Nos)`;
      } else {
        // Direct Volume in m3
        rawWetVolumeM3 = directVolume;
        shutteringAreaSqFt = directVolume * (DEFAULT_STEEL_RATIOS.direct_volume.shutteringFactor * 10.7639);
        specDescription = `Direct RCC Volume: ${directVolume} m³`;
      }
    }

    // Concrete Wet and Dry Volumes
    const wetVolumeWithWastageM3 = rawWetVolumeM3 * (1 + wastagePercent / 100);
    const dryVolumeM3 = wetVolumeWithWastageM3 * 1.54; // 1.54 IS 456 dry bulkage/void factor
    const wetVolumeCuFt = wetVolumeWithWastageM3 * 35.3147;

    // Mix Ratios Calculation
    const activeMix = RCC_MIX_GRADES[mixGrade] || RCC_MIX_GRADES.M20;
    const totalParts = activeMix.cement + activeMix.sand + activeMix.aggregate;

    // 1. Cement Calculation
    const cementVolumeM3 = (activeMix.cement / totalParts) * dryVolumeM3;
    const cementWeightKg = cementVolumeM3 * 1440; // 1440 kg/m3 density of cement
    const cementBags = Math.ceil(cementWeightKg / 50);
    const cementTonnes = Number((cementWeightKg / 1000).toFixed(3));

    // 2. Sand Calculation
    const sandVolumeM3 = (activeMix.sand / totalParts) * dryVolumeM3;
    const sandCuFt = sandVolumeM3 * 35.3147;
    const sandBrass = Number((sandCuFt / 100).toFixed(2));
    const sandTonnes = Number(((sandVolumeM3 * 1600) / 1000).toFixed(2)); // 1600 kg/m3

    // 3. Coarse Aggregate Calculation
    const aggVolumeM3 = (activeMix.aggregate / totalParts) * dryVolumeM3;
    const aggCuFt = aggVolumeM3 * 35.3147;
    const aggBrass = Number((aggCuFt / 100).toFixed(2));
    const aggTonnes = Number(((aggVolumeM3 * 1500) / 1000).toFixed(2)); // 1500 kg/m3
    const agg20mmTonnes = Number((aggTonnes * 0.6).toFixed(2)); // 60% 20mm
    const agg10mmTonnes = Number((aggTonnes * 0.4).toFixed(2)); // 40% 10mm

    // 4. Mixing Water
    const waterLiters = Math.round(cementWeightKg * activeMix.waterCementRatio);

    // 5. Admixture (200 ml per 50kg bag)
    const admixtureLiters = Number(((cementBags * 200) / 1000).toFixed(1));

    // 6. Steel Reinforcement Calculation (IS 456 / SP 34)
    // Steel Volume = Concrete Volume * Steel %
    // Steel Weight = Steel Volume * 7850 kg/m3
    const steelVolumeM3 = rawWetVolumeM3 * (steelPercent / 100);
    const steelWeightKg = Math.round(steelVolumeM3 * 7850);
    const steelTonnes = Number((steelWeightKg / 1000).toFixed(3));
    const steelQuintals = Number((steelWeightKg / 100).toFixed(2));
    const bindingWireKg = Math.max(1, Math.round(steelWeightKg * 0.009)); // 9kg per ton
    const coverBlocksCount = Math.ceil(rawWetVolumeM3 * 18); // ~18 blocks per m3

    // Rebar Diameter Splits (Realistic distribution for the structural element)
    let rebarSplits = {
      dia8mmKg: 0,
      dia10mmKg: 0,
      dia12mmKg: 0,
      dia16mmKg: 0,
      dia20mmKg: 0,
    };

    if (elementType === 'slab') {
      rebarSplits = {
        dia8mmKg: Math.round(steelWeightKg * 0.4),  // Distribution bars
        dia10mmKg: Math.round(steelWeightKg * 0.5), // Main bars
        dia12mmKg: Math.round(steelWeightKg * 0.1), // Cranked/support bars
        dia16mmKg: 0,
        dia20mmKg: 0,
      };
    } else if (elementType === 'beam') {
      rebarSplits = {
        dia8mmKg: Math.round(steelWeightKg * 0.25), // 2-legged stirrups
        dia10mmKg: 0,
        dia12mmKg: Math.round(steelWeightKg * 0.25), // Hangar bars
        dia16mmKg: Math.round(steelWeightKg * 0.35), // Main bottom bars
        dia20mmKg: Math.round(steelWeightKg * 0.15), // Heavy bottom bars
      };
    } else if (elementType === 'column_rect' || elementType === 'column_round') {
      rebarSplits = {
        dia8mmKg: Math.round(steelWeightKg * 0.2),  // Lateral ties / rings
        dia10mmKg: 0,
        dia12mmKg: Math.round(steelWeightKg * 0.2),
        dia16mmKg: Math.round(steelWeightKg * 0.4),  // Main vertical bars
        dia20mmKg: Math.round(steelWeightKg * 0.2),  // Corner vertical bars
      };
    } else if (elementType === 'footing') {
      rebarSplits = {
        dia8mmKg: 0,
        dia10mmKg: Math.round(steelWeightKg * 0.3),
        dia12mmKg: Math.round(steelWeightKg * 0.6), // Mat mesh
        dia16mmKg: Math.round(steelWeightKg * 0.1), // Dowel bars
        dia20mmKg: 0,
      };
    } else {
      rebarSplits = {
        dia8mmKg: Math.round(steelWeightKg * 0.3),
        dia10mmKg: Math.round(steelWeightKg * 0.3),
        dia12mmKg: Math.round(steelWeightKg * 0.4),
        dia16mmKg: 0,
        dia20mmKg: 0,
      };
    }

    // 7. Shuttering / Formwork Calculation
    const shutteringSqM = Number((shutteringAreaSqFt / 10.7639).toFixed(1));
    const shutteringPlySheets = Math.ceil(shutteringAreaSqFt / 32); // 8x4 ft plywood = 32 sq.ft
    const shutteringPropsCount = Math.ceil(shutteringAreaSqFt / 12); // ~1 prop per 12 sq.ft
    const formworkOilLiters = Number((shutteringSqM / 35).toFixed(1)); // 1L per 35 m2

    // 8. Ready-Mix Transit Truck Loads
    const rmcTrucks6m3 = Math.ceil(wetVolumeWithWastageM3 / 6);

    // 9. Cost Itemization
    const cementCost = cementBags * (prices.cement || DEFAULT_CIVIL_RATES.cement);
    const sandCost = Math.round(sandCuFt * (prices.sand || DEFAULT_CIVIL_RATES.sand));
    const aggregateCost = Math.round(aggCuFt * (prices.aggregate || DEFAULT_CIVIL_RATES.aggregate));
    const steelCost = Math.round(steelWeightKg * (prices.steel || DEFAULT_CIVIL_RATES.steel));
    const shutteringCost = Math.round(shutteringAreaSqFt * (prices.shuttering || DEFAULT_CIVIL_RATES.shuttering));
    const admixtureCost = includeAdmixture ? Math.round(admixtureLiters * admixtureRate) : 0;
    const waterCost = Math.round((waterLiters / 1000) * 80); // ₹80 per 1000L tanker

    const materialSubtotal = cementCost + sandCost + aggregateCost + steelCost + shutteringCost + admixtureCost + waterCost;
    const totalCost = materialSubtotal;

    return {
      specDescription,
      rawWetVolumeM3: Number(rawWetVolumeM3.toFixed(3)),
      wetVolumeWithWastageM3: Number(wetVolumeWithWastageM3.toFixed(3)),
      wetVolumeCuFt: Number(wetVolumeCuFt.toFixed(1)),
      dryVolumeM3: Number(dryVolumeM3.toFixed(3)),
      cementBags,
      cementWeightKg: Math.round(cementWeightKg),
      cementTonnes,
      sandCuFt: Math.round(sandCuFt),
      sandBrass,
      sandTonnes,
      aggCuFt: Math.round(aggCuFt),
      aggBrass,
      aggTonnes,
      agg20mmTonnes,
      agg10mmTonnes,
      waterLiters,
      admixtureLiters,
      steelWeightKg,
      steelTonnes,
      steelQuintals,
      bindingWireKg,
      coverBlocksCount,
      rebarSplits,
      shutteringAreaSqFt: Math.round(shutteringAreaSqFt),
      shutteringSqM,
      shutteringPlySheets,
      shutteringPropsCount,
      formworkOilLiters,
      rmcTrucks6m3,
      cementCost,
      sandCost,
      aggregateCost,
      steelCost,
      shutteringCost,
      admixtureCost,
      waterCost,
      materialSubtotal,
      totalCost,
    };
  }, [
    elementType, unitMode, mixGrade, quantity, wastagePercent, steelPercent, includeAdmixture,
    slabLength, slabWidth, slabThickMm,
    beamLength, beamWidthMm, beamDepthMm,
    colWidthMm, colDepthMm, colHeight,
    roundColDiaMm, roundColHeight,
    footingLength, footingWidth, footingDepthMm,
    wallLength, wallHeight, wallThickMm,
    stairWidth, stairStepsCount, stairTreadMm, stairRiserMm, stairWaistMm,
    lintelLength, lintelWidthMm, lintelDepthMm, chajjaProjMm, chajjaThickMm,
    directVolume, prices, admixtureRate
  ]);

  // Add Item to Takeoff List
  const handleAddToTakeoff = () => {
    const newItem: RCCTakeoffItem = {
      id: 'rcc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      elementType,
      elementLabel: elementType.toUpperCase().replace('_', ' '),
      specs: activeCalc.specDescription,
      quantity,
      concreteVolM3: activeCalc.wetVolumeWithWastageM3,
      cementBags: activeCalc.cementBags,
      sandBrass: activeCalc.sandBrass,
      aggregateBrass: activeCalc.aggBrass,
      steelKg: activeCalc.steelWeightKg,
      steelTonnes: activeCalc.steelTonnes,
      shutteringSqFt: activeCalc.shutteringAreaSqFt,
      totalCost: activeCalc.totalCost,
    };

    setTakeoffList(prev => [...prev, newItem]);
  };

  const handleRemoveTakeoffItem = (id: string) => {
    setTakeoffList(prev => prev.filter(it => it.id !== id));
  };

  const handleClearTakeoff = () => {
    if (window.confirm('Clear all items from the RCC Takeoff schedule?')) {
      setTakeoffList([]);
    }
  };

  // Cumulative Takeoff Stats
  const takeoffSummary = useMemo(() => {
    const totalConcreteM3 = takeoffList.reduce((acc, it) => acc + it.concreteVolM3, 0);
    const totalCementBags = takeoffList.reduce((acc, it) => acc + it.cementBags, 0);
    const totalSandBrass = takeoffList.reduce((acc, it) => acc + it.sandBrass, 0);
    const totalAggBrass = takeoffList.reduce((acc, it) => acc + it.aggregateBrass, 0);
    const totalSteelKg = takeoffList.reduce((acc, it) => acc + it.steelKg, 0);
    const totalSteelTonnes = totalSteelKg / 1000;
    const totalShutteringSqFt = takeoffList.reduce((acc, it) => acc + it.shutteringSqFt, 0);
    const totalCost = takeoffList.reduce((acc, it) => acc + it.totalCost, 0);

    return {
      totalConcreteM3: Number(totalConcreteM3.toFixed(2)),
      totalCementBags,
      totalSandBrass: Number(totalSandBrass.toFixed(2)),
      totalAggBrass: Number(totalAggBrass.toFixed(2)),
      totalSteelKg,
      totalSteelTonnes: Number(totalSteelTonnes.toFixed(3)),
      totalShutteringSqFt,
      totalCost,
      itemCount: takeoffList.length,
    };
  }, [takeoffList]);

  // Copy Summary to Clipboard
  const copyReport = () => {
    const text = `*RCC Structural BOQ & Reinforcement Schedule (Toolique)*
----------------------------------------
*Element:* ${activeCalc.specDescription}
*Concrete Grade:* ${mixGrade} (${RCC_MIX_GRADES[mixGrade]?.name})
*Concrete Volume:* ${activeCalc.wetVolumeWithWastageM3} m³ (${activeCalc.wetVolumeCuFt} cu.ft incl. ${wastagePercent}% wastage)
*Steel Ratio:* ${steelPercent}% (${steelGrade}) -> *${activeCalc.steelWeightKg.toLocaleString()} kg* (${activeCalc.steelTonnes} MT)
*Shuttering Area:* ${activeCalc.shutteringAreaSqFt.toLocaleString()} sq.ft (${activeCalc.shutteringSqM} m²)
----------------------------------------
*MATERIALS BREAKDOWN:*
• Cement (50kg): ${activeCalc.cementBags} Bags (${activeCalc.cementTonnes} MT) - ₹${activeCalc.cementCost.toLocaleString('en-IN')}
• Sand: ${activeCalc.sandBrass} Brass (${activeCalc.sandCuFt} cu.ft) - ₹${activeCalc.sandCost.toLocaleString('en-IN')}
• Aggregate (10/20mm): ${activeCalc.aggBrass} Brass (${activeCalc.aggCuFt} cu.ft) - ₹${activeCalc.aggregateCost.toLocaleString('en-IN')}
• Steel Rebar: ${activeCalc.steelWeightKg.toLocaleString()} kg (${activeCalc.steelTonnes} MT) - ₹${activeCalc.steelCost.toLocaleString('en-IN')}
• Shuttering Formwork: ${activeCalc.shutteringAreaSqFt} sq.ft (~${activeCalc.shutteringPlySheets} sheets) - ₹${activeCalc.shutteringCost.toLocaleString('en-IN')}
• GI Binding Wire: ~${activeCalc.bindingWireKg} kg | Cover Blocks: ~${activeCalc.coverBlocksCount} pcs
• Mixing Water: ~${activeCalc.waterLiters} Liters
----------------------------------------
*TOTAL ESTIMATED COST: ₹${activeCalc.totalCost.toLocaleString('en-IN')}*
----------------------------------------
Calculated per IS 456:2000 & SP 34 standard civil engineering codes.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // WhatsApp Share Requisition
  const handleWhatsAppShare = () => {
    let msg = `*🏗️ RCC STRUCTURAL BOQ & PROCUREMENT SCHEDULE*\n`;
    msg += `*Code Standard:* IS 456:2000 & SP 34 Reinforcement Detailing\n\n`;

    if (takeoffList.length > 0) {
      msg += `*📋 PROJECT TAKE OFF (${takeoffList.length} Elements):*\n`;
      takeoffList.forEach((it, idx) => {
        msg += `${idx + 1}. *${it.specs}*\n`;
        msg += `   • Concrete: ${it.concreteVolM3} m³ | Cement: ${it.cementBags} Bags\n`;
        msg += `   • Steel: ${it.steelKg.toLocaleString()} kg (${it.steelTonnes} MT)\n`;
        msg += `   • Shuttering: ${it.shutteringSqFt} sq.ft | Cost: ₹${it.totalCost.toLocaleString('en-IN')}\n\n`;
      });
      msg += `*📊 CUMULATIVE PROCUREMENT TOTALS:*\n`;
      msg += `• Total Concrete: *${takeoffSummary.totalConcreteM3} m³*\n`;
      msg += `• Cement (50kg bags): *${takeoffSummary.totalCementBags} Bags*\n`;
      msg += `• Sand: *${takeoffSummary.totalSandBrass} Brass*\n`;
      msg += `• Aggregate: *${takeoffSummary.totalAggBrass} Brass*\n`;
      msg += `• Steel Rebar: *${takeoffSummary.totalSteelKg.toLocaleString()} kg* (*${takeoffSummary.totalSteelTonnes} MT*)\n`;
      msg += `• Formwork Shuttering: *${takeoffSummary.totalShutteringSqFt.toLocaleString()} sq.ft*\n`;
      msg += `• Total Budget: *₹${takeoffSummary.totalCost.toLocaleString('en-IN')}*\n`;
    } else {
      msg += `*Element:* ${activeCalc.specDescription}\n`;
      msg += `*Mix Grade:* ${mixGrade} (${RCC_MIX_GRADES[mixGrade]?.name})\n`;
      msg += `*Concrete Volume:* ${activeCalc.wetVolumeWithWastageM3} m³ (${activeCalc.wetVolumeCuFt} cu.ft)\n\n`;
      msg += `*Material Requirements:*\n`;
      msg += `• Cement: *${activeCalc.cementBags} Bags* (${activeCalc.cementTonnes} T)\n`;
      msg += `• Sand: *${activeCalc.sandBrass} Brass* (${activeCalc.sandCuFt} cu.ft)\n`;
      msg += `• Coarse Aggregate: *${activeCalc.aggBrass} Brass* (${activeCalc.aggCuFt} cu.ft)\n`;
      msg += `• Steel Rebar (${steelGrade}): *${activeCalc.steelWeightKg.toLocaleString()} kg* (${activeCalc.steelTonnes} MT)\n`;
      msg += `• Shuttering Contact: *${activeCalc.shutteringAreaSqFt} sq.ft* (~${activeCalc.shutteringPlySheets} sheets)\n`;
      msg += `• Total Cost: *₹${activeCalc.totalCost.toLocaleString('en-IN')}*\n`;
    }

    msg += `\n_Generated via Toolique.in RCC Calculator_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Generate Professional PDF RCC BOQ & BBS Report
  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      const primaryColor = [79, 70, 229]; // Indigo-600
      const darkColor = [15, 23, 42]; // Slate-900

      // Header Banner
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 24, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text('TOOLIQUE RCC STRUCTURAL BOQ & BBS SCHEDULE', 14, 15);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.text('IS 456:2000 & SP 34 Reinforced Cement Concrete Procurement Indent', 14, 21);

      // Meta Info
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setFontSize(9);
      doc.text(`Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, 14, 32);
      doc.text(`Doc Ref: RCC-BOQ-${Date.now().toString().slice(-6)}`, 140, 32);
      doc.text(`Mix Grade: ${mixGrade} (${RCC_MIX_GRADES[mixGrade]?.name}) | Steel: ${steelGrade}`, 14, 38);

      // Summary Box
      doc.setDrawColor(224, 231, 255);
      doc.setFillColor(245, 247, 255);
      doc.roundedRect(14, 44, 182, 36, 3, 3, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('TOTAL ESTIMATED PROCUREMENT BUDGET', 20, 52);

      const displayCost = takeoffList.length > 0 ? takeoffSummary.totalCost : activeCalc.totalCost;
      const displayConcrete = takeoffList.length > 0 ? takeoffSummary.totalConcreteM3 : activeCalc.wetVolumeWithWastageM3;
      const displaySteel = takeoffList.length > 0 ? takeoffSummary.totalSteelKg : activeCalc.steelWeightKg;
      const displaySteelT = takeoffList.length > 0 ? takeoffSummary.totalSteelTonnes : activeCalc.steelTonnes;
      const displayShuttering = takeoffList.length > 0 ? takeoffSummary.totalShutteringSqFt : activeCalc.shutteringAreaSqFt;

      doc.setFontSize(16);
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.text(`₹${displayCost.toLocaleString('en-IN')}`, 20, 62);

      doc.setFontSize(8.5);
      doc.setTextColor(70, 70, 70);
      doc.text(`Total Concrete: ${displayConcrete} m³ | Total Steel: ${displaySteel.toLocaleString()} kg (${displaySteelT} MT)`, 20, 70);
      doc.text(`Shuttering Contact Area: ${displayShuttering.toLocaleString()} sq.ft (~${Math.ceil(displayShuttering / 32)} Plywood Sheets)`, 20, 76);

      // Items Schedule Table
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.text('MATERIAL INDENT & BREAKDOWN SCHEDULE', 14, 90);
      doc.line(14, 92, 196, 92);

      let y = 100;
      const drawRow = (mat: string, qtyText: string, unitRate: string, total: string, isHeader = false) => {
        if (isHeader) {
          doc.setFillColor(240, 240, 245);
          doc.rect(14, y - 5, 182, 7, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(80, 80, 80);
        } else {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
        }
        doc.text(mat, 16, y);
        doc.text(qtyText, 95, y);
        doc.text(unitRate, 142, y);
        doc.text(total, 175, y);
        if (!isHeader) {
          doc.setDrawColor(240, 240, 240);
          doc.line(14, y + 2, 196, y + 2);
        }
        y += 8;
      };

      drawRow('MATERIAL / ITEM DESCRIPTION', 'QUANTITY / PACKAGING', 'UNIT RATE', 'TOTAL (₹)', true);
      drawRow('OPC / PPC Cement (50kg bags)', `${activeCalc.cementBags} Bags (${activeCalc.cementTonnes} MT)`, `₹${prices.cement}/bag`, `₹${activeCalc.cementCost.toLocaleString('en-IN')}`);
      drawRow('Fine Sand (River / M-Sand)', `${activeCalc.sandBrass} Brass (${activeCalc.sandCuFt} cu.ft)`, `₹${prices.sand}/cu.ft`, `₹${activeCalc.sandCost.toLocaleString('en-IN')}`);
      drawRow('Coarse Aggregate (10mm + 20mm)', `${activeCalc.aggBrass} Brass (${activeCalc.aggCuFt} cu.ft)`, `₹${prices.aggregate}/cu.ft`, `₹${activeCalc.aggregateCost.toLocaleString('en-IN')}`);
      drawRow(`TMT Rebar Steel (${steelGrade})`, `${activeCalc.steelWeightKg.toLocaleString()} kg (${activeCalc.steelTonnes} MT)`, `₹${prices.steel}/kg`, `₹${activeCalc.steelCost.toLocaleString('en-IN')}`);
      drawRow('Shuttering / Formwork Contact', `${activeCalc.shutteringAreaSqFt.toLocaleString()} sq.ft (~${activeCalc.shutteringPlySheets} sheets)`, `₹${prices.shuttering}/sq.ft`, `₹${activeCalc.shutteringCost.toLocaleString('en-IN')}`);
      drawRow('GI Binding Wire (18 Gauge)', `${activeCalc.bindingWireKg} kg (included in BBS)`, 'Site Std', '-');
      drawRow('PVC / Concrete Cover Blocks', `${activeCalc.coverBlocksCount} Pcs (${DEFAULT_STEEL_RATIOS[elementType]?.clearCoverMm || 20}mm Cover)`, 'Included', '-');
      if (includeAdmixture) {
        drawRow('Waterproofing Admixture', `${activeCalc.admixtureLiters} Liters (200ml/bag)`, `₹${admixtureRate}/L`, `₹${activeCalc.admixtureCost.toLocaleString('en-IN')}`);
      }

      // Rebar Size Breakdown
      y += 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text('BAR BENDING SCHEDULE (BBS) DIAMETER ESTIMATE', 14, y);
      doc.line(14, y + 2, 196, y + 2);
      y += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text(`• Ø8 mm (Stirrups / Ties / Dist): ${activeCalc.rebarSplits.dia8mmKg} kg`, 16, y);
      doc.text(`• Ø10 mm (Slab / Mesh Rebar): ${activeCalc.rebarSplits.dia10mmKg} kg`, 110, y);
      y += 6;
      doc.text(`• Ø12 mm (Slab / Column / Footing): ${activeCalc.rebarSplits.dia12mmKg} kg`, 16, y);
      doc.text(`• Ø16 mm (Beam Tension / Column): ${activeCalc.rebarSplits.dia16mmKg} kg`, 110, y);
      y += 6;
      if (activeCalc.rebarSplits.dia20mmKg > 0) {
        doc.text(`• Ø20 mm (Heavy Structural Bars): ${activeCalc.rebarSplits.dia20mmKg} kg`, 16, y);
        y += 6;
      }

      // Footer
      doc.setFontSize(7.5);
      doc.setTextColor(140, 140, 140);
      doc.text('Calculated strictly as per Indian Standards IS 456:2000, IS 1786, and SP 34 guidelines.', 14, 280);
      doc.text('Toolique Civil Engineering Suite • www.toolique.in', 14, 285);

      doc.save(`RCC_BOQ_${elementType}_${Date.now().toString().slice(-4)}.pdf`);
    } catch (e) {
      alert('Error generating RCC BOQ PDF: ' + e);
    }
  };

  const handleReset = () => {
    setElementType('slab');
    setUnitMode('metric');
    setMixGrade('M20');
    setQuantity(1);
    setWastagePercent(5);
    setSteelPercent(1.0);
    setSlabLength(6.0);
    setSlabWidth(4.5);
    setSlabThickMm(125);
    setPrices(DEFAULT_CIVIL_RATES);
    saveStoredRates(DEFAULT_CIVIL_RATES);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-left">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight">RCC Calculator & Reinforcement BOQ</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              IS 456 & SP 34 Compliant
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Calculate concrete mix quantities, TMT steel reinforcement (BBS), and shuttering formwork area for slabs, beams, columns, footings, and stairs.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Unit Switcher */}
          <div className="flex rounded-xl bg-zinc-100 dark:bg-zinc-800 p-0.5 border border-zinc-200 dark:border-zinc-700 text-xs font-bold">
            <button
              onClick={() => setUnitMode('metric')}
              className={`px-3 py-1 rounded-lg transition ${
                unitMode === 'metric'
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-zinc-500'
              }`}
            >
              Metric (m/mm)
            </button>
            <button
              onClick={() => setUnitMode('feet')}
              className={`px-3 py-1 rounded-lg transition ${
                unitMode === 'feet'
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-zinc-500'
              }`}
            >
              Imperial (ft/in)
            </button>
          </div>

          <button
            onClick={generatePDF}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 text-xs font-bold hover:bg-indigo-100 transition shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PDF Indent</span>
          </button>
          <button
            onClick={handleWhatsAppShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition shadow-sm"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Share Requisition</span>
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-xl text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 1. Structural Element Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
          1. Select RCC Structural Member
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {[
            { id: 'slab', name: 'Roof / Floor Slab', desc: '1.0% Steel • 20mm Cover' },
            { id: 'beam', name: 'RCC Beam', desc: '1.8% Steel • Stirrups' },
            { id: 'column_rect', name: 'Rect Column', desc: '2.5% Steel • 40mm Cover' },
            { id: 'column_round', name: 'Round Column', desc: '2.5% Steel • Spiral Ties' },
            { id: 'footing', name: 'Isolated Footing', desc: '0.8% Steel • 50mm Cover' },
            { id: 'retaining_wall', name: 'Retaining Wall', desc: '1.2% Steel • 2 Faces' },
            { id: 'stairs', name: 'RCC Staircase', desc: 'Waist Slab + Steps' },
            { id: 'lintel_chajja', name: 'Lintel & Chajja', desc: 'Door Lintel + Sunshade' },
            { id: 'direct_volume', name: 'Direct Volume (m³)', desc: 'Custom Mix & Ratio' },
          ].map((el) => (
            <button
              key={el.id}
              onClick={() => setElementType(el.id as RCCElementType)}
              className={`p-2.5 rounded-xl border text-left transition ${
                elementType === el.id
                  ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20 shadow-sm'
                  : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
              }`}
            >
              <div className="text-xs font-bold truncate">{el.name}</div>
              <div className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">{el.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Parameters & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Form Controls */}
        <div className="lg:col-span-7 space-y-5 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          {/* Concrete Mix Grade Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">
                Concrete Mix Grade (IS 456)
              </label>
              <select
                value={mixGrade}
                onChange={(e) => setMixGrade(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {Object.values(RCC_MIX_GRADES).map((g) => (
                  <option key={g.grade} value={g.grade}>
                    {g.name} - {g.strengthMpa} MPa ({g.recommendedFor.substring(0, 32)}...)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">
                TMT Steel Rebar Grade
              </label>
              <select
                value={steelGrade}
                onChange={(e) => setSteelGrade(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Fe 500D">Fe 500D (Super Ductile / Earthquake Std)</option>
                <option value="Fe 550D">Fe 550D (High Tensile Heavy RCC)</option>
                <option value="Fe 500">Fe 500 (Standard Commercial)</option>
                <option value="Fe 415">Fe 415 (General Low-Rise)</option>
              </select>
            </div>
          </div>

          {/* Dynamic Element Inputs */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 space-y-4">
            {/* 1. Slab */}
            {elementType === 'slab' && (
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">
                    Length ({unitMode === 'metric' ? 'm' : 'ft'})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={slabLength || ''}
                    onChange={(e) => setSlabLength(Math.max(0.1, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">
                    Width ({unitMode === 'metric' ? 'm' : 'ft'})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={slabWidth || ''}
                    onChange={(e) => setSlabWidth(Math.max(0.1, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">
                    Thickness ({unitMode === 'metric' ? 'mm' : 'in'})
                  </label>
                  <input
                    type="number"
                    value={slabThickMm || ''}
                    onChange={(e) => setSlabThickMm(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* 2. Beam */}
            {elementType === 'beam' && (
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">
                    Length ({unitMode === 'metric' ? 'm' : 'ft'})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={beamLength || ''}
                    onChange={(e) => setBeamLength(Math.max(0.1, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">
                    Width ({unitMode === 'metric' ? 'mm' : 'in'})
                  </label>
                  <input
                    type="number"
                    value={beamWidthMm || ''}
                    onChange={(e) => setBeamWidthMm(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">
                    Depth ({unitMode === 'metric' ? 'mm' : 'in'})
                  </label>
                  <input
                    type="number"
                    value={beamDepthMm || ''}
                    onChange={(e) => setBeamDepthMm(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* 3. Column Rect */}
            {elementType === 'column_rect' && (
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">
                    Width ({unitMode === 'metric' ? 'mm' : 'in'})
                  </label>
                  <input
                    type="number"
                    value={colWidthMm || ''}
                    onChange={(e) => setColWidthMm(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">
                    Depth ({unitMode === 'metric' ? 'mm' : 'in'})
                  </label>
                  <input
                    type="number"
                    value={colDepthMm || ''}
                    onChange={(e) => setColDepthMm(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">
                    Height ({unitMode === 'metric' ? 'm' : 'ft'})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={colHeight || ''}
                    onChange={(e) => setColHeight(Math.max(0.1, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* 4. Column Round */}
            {elementType === 'column_round' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">
                    Diameter ({unitMode === 'metric' ? 'mm' : 'in'})
                  </label>
                  <input
                    type="number"
                    value={roundColDiaMm || ''}
                    onChange={(e) => setRoundColDiaMm(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">
                    Height ({unitMode === 'metric' ? 'm' : 'ft'})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={roundColHeight || ''}
                    onChange={(e) => setRoundColHeight(Math.max(0.1, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* 5. Footing */}
            {elementType === 'footing' && (
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">
                    Length ({unitMode === 'metric' ? 'm' : 'ft'})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={footingLength || ''}
                    onChange={(e) => setFootingLength(Math.max(0.1, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">
                    Width ({unitMode === 'metric' ? 'm' : 'ft'})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={footingWidth || ''}
                    onChange={(e) => setFootingWidth(Math.max(0.1, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">
                    Depth ({unitMode === 'metric' ? 'mm' : 'in'})
                  </label>
                  <input
                    type="number"
                    value={footingDepthMm || ''}
                    onChange={(e) => setFootingDepthMm(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* 6. Retaining Wall */}
            {elementType === 'retaining_wall' && (
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">
                    Length ({unitMode === 'metric' ? 'm' : 'ft'})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={wallLength || ''}
                    onChange={(e) => setWallLength(Math.max(0.1, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">
                    Height ({unitMode === 'metric' ? 'm' : 'ft'})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={wallHeight || ''}
                    onChange={(e) => setWallHeight(Math.max(0.1, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">
                    Thickness ({unitMode === 'metric' ? 'mm' : 'in'})
                  </label>
                  <input
                    type="number"
                    value={wallThickMm || ''}
                    onChange={(e) => setWallThickMm(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* 7. Stairs */}
            {elementType === 'stairs' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">
                    Flight Width ({unitMode === 'metric' ? 'm' : 'ft'})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={stairWidth || ''}
                    onChange={(e) => setStairWidth(Math.max(0.1, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">
                    Step Count (Risers)
                  </label>
                  <input
                    type="number"
                    value={stairStepsCount || ''}
                    onChange={(e) => setStairStepsCount(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">
                    Tread ({unitMode === 'metric' ? 'mm' : 'in'})
                  </label>
                  <input
                    type="number"
                    value={stairTreadMm || ''}
                    onChange={(e) => setStairTreadMm(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">
                    Riser ({unitMode === 'metric' ? 'mm' : 'in'})
                  </label>
                  <input
                    type="number"
                    value={stairRiserMm || ''}
                    onChange={(e) => setStairRiserMm(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">
                    Waist Slab ({unitMode === 'metric' ? 'mm' : 'in'})
                  </label>
                  <input
                    type="number"
                    value={stairWaistMm || ''}
                    onChange={(e) => setStairWaistMm(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* 8. Lintel & Chajja */}
            {elementType === 'lintel_chajja' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">
                    Lintel Length ({unitMode === 'metric' ? 'm' : 'ft'})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={lintelLength || ''}
                    onChange={(e) => setLintelLength(Math.max(0.1, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">
                    Wall Width ({unitMode === 'metric' ? 'mm' : 'in'})
                  </label>
                  <input
                    type="number"
                    value={lintelWidthMm || ''}
                    onChange={(e) => setLintelWidthMm(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">
                    Lintel Depth ({unitMode === 'metric' ? 'mm' : 'in'})
                  </label>
                  <input
                    type="number"
                    value={lintelDepthMm || ''}
                    onChange={(e) => setLintelDepthMm(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">
                    Chajja Proj ({unitMode === 'metric' ? 'mm' : 'in'})
                  </label>
                  <input
                    type="number"
                    value={chajjaProjMm || ''}
                    onChange={(e) => setChajjaProjMm(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">
                    Chajja Thick ({unitMode === 'metric' ? 'mm' : 'in'})
                  </label>
                  <input
                    type="number"
                    value={chajjaThickMm || ''}
                    onChange={(e) => setChajjaThickMm(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* 9. Direct Volume */}
            {elementType === 'direct_volume' && (
              <div>
                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">
                  Concrete Volume ({unitMode === 'metric' ? 'm³' : 'cu.ft'})
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={directVolume || ''}
                  onChange={(e) => setDirectVolume(Math.max(0.1, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Steel Percentage, Element Count, and Wastage */}
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 grid grid-cols-3 gap-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300">Steel Ratio (%)</label>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-bold">
                  {(steelPercent * 78.5).toFixed(0)} kg/m³
                </span>
              </div>
              <input
                type="number"
                step="0.1"
                min="0.4"
                max="6.0"
                value={steelPercent || ''}
                onChange={(e) => setSteelPercent(Math.max(0.1, parseFloat(e.target.value) || 0))}
                className="w-full px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-300 mb-1">Number of Units</label>
              <input
                type="number"
                min="1"
                value={quantity || ''}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-300 mb-1">Concrete Wastage</label>
              <select
                value={wastagePercent}
                onChange={(e) => setWastagePercent(parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold focus:outline-none"
              >
                <option value={3}>+3% (Precise RMC)</option>
                <option value={5}>+5% (Standard Site)</option>
                <option value={8}>+8% (Manual Mix)</option>
                <option value={10}>+10% (High Wastage)</option>
              </select>
            </div>
          </div>

          {/* Unit Rates Config */}
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
            <div className="flex justify-between items-center mb-2">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                Live Material Procurement Rates (₹)
              </label>
              <label className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeAdmixture}
                  onChange={(e) => setIncludeAdmixture(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Include Admixture (₹130/L)</span>
              </label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-zinc-500 block mb-0.5">Cement (₹/bag)</span>
                <input
                  type="number"
                  value={prices.cement}
                  onChange={(e) => handlePriceChange('cement', parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-mono font-bold text-xs"
                />
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block mb-0.5">Steel (₹/kg)</span>
                <input
                  type="number"
                  value={prices.steel}
                  onChange={(e) => handlePriceChange('steel', parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-mono font-bold text-xs"
                />
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block mb-0.5">Sand (₹/cu ft)</span>
                <input
                  type="number"
                  value={prices.sand}
                  onChange={(e) => handlePriceChange('sand', parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-mono font-bold text-xs"
                />
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block mb-0.5">Shuttering (₹/sq ft)</span>
                <input
                  type="number"
                  value={prices.shuttering}
                  onChange={(e) => handlePriceChange('shuttering', parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-mono font-bold text-xs"
                />
              </div>
            </div>
          </div>

          {/* Add to Takeoff Button */}
          <button
            type="button"
            onClick={handleAddToTakeoff}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add this Element to Structural BOQ Schedule</span>
          </button>
        </div>

        {/* Right 5 Columns: Results & Output Breakdown */}
        <div className="lg:col-span-5 space-y-4">
          {/* Primary Budget & Volume Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/20 border border-indigo-200 dark:border-indigo-800/80 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Total Estimated Cost
                </span>
                <div className="text-3xl font-black text-zinc-900 dark:text-white mt-1 font-mono tracking-tight">
                  ₹{activeCalc.totalCost.toLocaleString('en-IN')}
                </div>
              </div>

              <button
                onClick={copyReport}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-indigo-100 dark:border-indigo-900/40">
                <span className="text-[10px] text-zinc-400 block font-semibold">Concrete Vol</span>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 font-mono">
                  {activeCalc.wetVolumeWithWastageM3} m³
                </span>
              </div>
              <div className="p-2 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-indigo-100 dark:border-indigo-900/40">
                <span className="text-[10px] text-zinc-400 block font-semibold">TMT Rebar</span>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                  {activeCalc.steelWeightKg.toLocaleString()} kg
                </span>
              </div>
              <div className="p-2 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-indigo-100 dark:border-indigo-900/40">
                <span className="text-[10px] text-zinc-400 block font-semibold">Shuttering</span>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 font-mono">
                  {activeCalc.shutteringAreaSqFt} sq.ft
                </span>
              </div>
            </div>

            {/* RMC Truck Pill */}
            <div className="pt-2 border-t border-indigo-200/60 dark:border-indigo-800/60 flex justify-between items-center text-xs">
              <span className="text-zinc-500 font-medium flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-indigo-500" />
                <span>RMC Transit Mixers (6m³):</span>
              </span>
              <span className="font-bold text-indigo-700 dark:text-indigo-300 font-mono">
                {activeCalc.rmcTrucks6m3} Trucks
              </span>
            </div>
          </div>

          {/* Itemized Material Indent Card */}
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Box className="w-3.5 h-3.5 text-indigo-500" />
              <span>Material Procurement Schedule</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500">OPC / PPC Cement (50kg)</span>
                <div className="text-right">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">
                    {activeCalc.cementBags} Bags
                  </span>
                  <span className="text-[10px] text-zinc-400 block">({activeCalc.cementTonnes} MT) • ₹{activeCalc.cementCost.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500">Fine Sand (River / M-Sand)</span>
                <div className="text-right">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">
                    {activeCalc.sandBrass} Brass
                  </span>
                  <span className="text-[10px] text-zinc-400 block">({activeCalc.sandCuFt} cu.ft) • ₹{activeCalc.sandCost.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500">Coarse Aggregate (10/20mm)</span>
                <div className="text-right">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">
                    {activeCalc.aggBrass} Brass
                  </span>
                  <span className="text-[10px] text-zinc-400 block">({activeCalc.agg20mmTonnes}T 20mm + {activeCalc.agg10mmTonnes}T 10mm)</span>
                </div>
              </div>

              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500">TMT Steel Rebar ({steelGrade})</span>
                <div className="text-right">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                    {activeCalc.steelWeightKg.toLocaleString()} kg
                  </span>
                  <span className="text-[10px] text-zinc-400 block">({activeCalc.steelTonnes} MT / {activeCalc.steelQuintals} Q) • ₹{activeCalc.steelCost.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500">Formwork Shuttering Area</span>
                <div className="text-right">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">
                    {activeCalc.shutteringAreaSqFt} sq.ft
                  </span>
                  <span className="text-[10px] text-zinc-400 block">(~{activeCalc.shutteringPlySheets} Ply Sheets + {activeCalc.shutteringPropsCount} Props)</span>
                </div>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-zinc-500">GI Binding Wire & Blocks</span>
                <span className="font-mono text-zinc-700 dark:text-zinc-300 font-semibold">
                  ~{activeCalc.bindingWireKg} kg wire • ~{activeCalc.coverBlocksCount} blocks
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Element Project Takeoff BOQ Table */}
      {takeoffList.length > 0 && (
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Building Structural RCC Takeoff Schedule ({takeoffList.length} Elements)
              </h3>
            </div>
            <button
              onClick={handleClearTakeoff}
              className="text-xs text-red-500 hover:text-red-600 font-semibold px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition"
            >
              Clear All Elements
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2 px-3">#</th>
                  <th className="py-2 px-3">Member Details</th>
                  <th className="py-2 px-3">Qty</th>
                  <th className="py-2 px-3">Concrete (m³)</th>
                  <th className="py-2 px-3">Cement (Bags)</th>
                  <th className="py-2 px-3">Sand (Brass)</th>
                  <th className="py-2 px-3">Steel (kg)</th>
                  <th className="py-2 px-3">Shuttering</th>
                  <th className="py-2 px-3">Est. Cost</th>
                  <th className="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-medium">
                {takeoffList.map((it, idx) => (
                  <tr key={it.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition">
                    <td className="py-2.5 px-3 font-mono text-zinc-400">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-bold text-zinc-800 dark:text-zinc-200">{it.specs}</td>
                    <td className="py-2.5 px-3 font-mono text-indigo-600 font-bold">{it.quantity}</td>
                    <td className="py-2.5 px-3 font-mono">{it.concreteVolM3}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-zinc-800 dark:text-zinc-200">{it.cementBags}</td>
                    <td className="py-2.5 px-3 font-mono text-zinc-500">{it.sandBrass}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-indigo-600">{it.steelKg.toLocaleString()}</td>
                    <td className="py-2.5 px-3 font-mono text-zinc-500">{it.shutteringSqFt} sq.ft</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      ₹{it.totalCost.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleRemoveTakeoffItem(it.id)}
                        className="p-1 rounded text-zinc-400 hover:text-red-500 transition"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Combined Summary Bar */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full sm:w-auto text-left">
              <div>
                <span className="text-[10px] text-zinc-400 block font-semibold">Total Concrete</span>
                <span className="text-base font-black text-zinc-800 dark:text-zinc-100 font-mono">
                  {takeoffSummary.totalConcreteM3} m³
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block font-semibold">Cement Bags</span>
                <span className="text-base font-black text-indigo-600 font-mono">
                  {takeoffSummary.totalCementBags} Bags
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block font-semibold">Total Steel Rebar</span>
                <span className="text-base font-black text-indigo-600 font-mono">
                  {takeoffSummary.totalSteelKg.toLocaleString()} kg ({takeoffSummary.totalSteelTonnes} MT)
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block font-semibold">Project Budget</span>
                <span className="text-base font-black text-emerald-600 font-mono">
                  ₹{takeoffSummary.totalCost.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              onClick={generatePDF}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Project BOQ PDF</span>
            </button>
          </div>
        </div>
      )}

      {/* IS 456 Structural Reference Guidelines Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600">
            <Layers className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
            Quick Reference: Indian Standard (IS 456:2000) RCC Detailing Guidelines
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/80 dark:border-zinc-800/80 space-y-2">
            <h4 className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              <span>Minimum Clear Cover Requirements (IS 456: Cl. 26.4)</span>
            </h4>
            <ul className="space-y-1 text-zinc-600 dark:text-zinc-400 list-disc list-inside">
              <li><strong className="text-zinc-800 dark:text-zinc-200">Slabs:</strong> 20 mm (or bar diameter)</li>
              <li><strong className="text-zinc-800 dark:text-zinc-200">Beams:</strong> 25 mm</li>
              <li><strong className="text-zinc-800 dark:text-zinc-200">Columns:</strong> 40 mm (40mm or diameter of bar)</li>
              <li><strong className="text-zinc-800 dark:text-zinc-200">Footings & Rafts:</strong> 50 mm (touching soil)</li>
              <li><strong className="text-zinc-800 dark:text-zinc-200">Retaining Walls:</strong> 30 mm</li>
            </ul>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/80 dark:border-zinc-800/80 space-y-2">
            <h4 className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span>Formwork Striking / De-Shuttering Times (IS 456: Cl. 11.3)</span>
            </h4>
            <ul className="space-y-1 text-zinc-600 dark:text-zinc-400 list-disc list-inside">
              <li><strong className="text-zinc-800 dark:text-zinc-200">Beam sides, Columns, Walls:</strong> 16–24 hours</li>
              <li><strong className="text-zinc-800 dark:text-zinc-200">Slab soffits (props left under):</strong> 3 days</li>
              <li><strong className="text-zinc-800 dark:text-zinc-200">Beam soffits (props left under):</strong> 7 days</li>
              <li><strong className="text-zinc-800 dark:text-zinc-200">Props under slabs (spans up to 4.5m):</strong> 7 days</li>
              <li><strong className="text-zinc-800 dark:text-zinc-200">Props under beams (spans over 6m):</strong> 21 days</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Historical Price Trend Graph */}
      <MaterialTrendGraph allowedMaterials={['concreteMix', 'steel', 'sand', 'aggregate', 'shuttering']} defaultMaterial="concreteMix" title="RCC Construction Materials Price Index (5-Year Trend)" />
    </div>
  );
}

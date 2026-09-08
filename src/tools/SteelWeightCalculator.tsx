import { useState, useMemo } from 'react';
import {
  Copy, Check, RotateCcw, Plus, Trash2,
  Printer, MessageCircle,
  Layers, ShieldCheck, Download,
  FileText
} from 'lucide-react';
import { getStoredRates, saveStoredRates } from '../data/civilRatesData';
import MaterialTrendGraph from '../components/MaterialTrendGraph';
import { jsPDF } from 'jspdf';

// -------------------------------------------------------------
// Steel Types & Grades Definitions
// -------------------------------------------------------------
export type SectionShape =
  | 'tmt'
  | 'round'
  | 'plate'
  | 'chequered_plate'
  | 'flat'
  | 'angle_equal'
  | 'angle_unequal'
  | 'channel_ismc'
  | 'beam_ismb'
  | 'shs_square_tube'
  | 'rhs_rect_tube'
  | 'pipe_round_tube'
  | 'square_bar'
  | 'hex_bar';

export interface MetalGrade {
  id: string;
  name: string;
  category: string;
  density: number; // kg/m3
  standard: string;
  yieldStrength?: string;
  description: string;
}

export const METAL_GRADES: MetalGrade[] = [
  // TMT Reinforcement (IS 1786)
  { id: 'tmt_fe500d', name: 'TMT Fe 500D (Ductile)', category: 'TMT Rebar', density: 7850, standard: 'IS 1786', yieldStrength: '500 MPa', description: 'Primary standard for earthquake & high-rise civil construction.' },
  { id: 'tmt_fe550d', name: 'TMT Fe 550D (High Strength)', category: 'TMT Rebar', density: 7850, standard: 'IS 1786', yieldStrength: '550 MPa', description: 'Heavy infrastructure, bridges, marine & metro flyover projects.' },
  { id: 'tmt_fe500', name: 'TMT Fe 500 (Standard)', category: 'TMT Rebar', density: 7850, standard: 'IS 1786', yieldStrength: '500 MPa', description: 'Standard residential and commercial building construction.' },
  { id: 'tmt_fe415', name: 'TMT Fe 415 (General)', category: 'TMT Rebar', density: 7850, standard: 'IS 1786', yieldStrength: '415 MPa', description: 'Low-rise housing and light structural RCC members.' },
  { id: 'tmt_fe600', name: 'TMT Fe 600 (Ultra High)', category: 'TMT Rebar', density: 7850, standard: 'IS 1786', yieldStrength: '600 MPa', description: 'Expressways, marine pilings & heavy industrial foundations.' },
  { id: 'tmt_crs', name: 'TMT Fe 500D CRS (Corrosion Resistant)', category: 'TMT Rebar', density: 7850, standard: 'IS 1786', yieldStrength: '500 MPa', description: 'Coastal areas, high humidity, chemical plants & water retaining tanks.' },

  // Structural Mild Steel (IS 2062)
  { id: 'ms_e250', name: 'Mild Steel MS E250 (Gr. A/B)', category: 'Structural Carbon Steel', density: 7850, standard: 'IS 2062', yieldStrength: '250 MPa', description: 'Standard plates, channels, angles, beams & industrial fabrication.' },
  { id: 'ms_e350', name: 'High Tensile MS E350', category: 'Structural Carbon Steel', density: 7850, standard: 'IS 2062', yieldStrength: '350 MPa', description: 'Heavy structural trusses, pre-engineered buildings (PEB) & cranes.' },
  { id: 'corten', name: 'Corten Steel (Weathering Steel)', category: 'Structural Carbon Steel', density: 7850, standard: 'ASTM A588 / IS 2062', yieldStrength: '345 MPa', description: 'Atmospheric corrosion resistant steel for bridges, facades & containers.' },

  // Stainless Steel
  { id: 'ss_304', name: 'Stainless Steel SS 304 / 304L', category: 'Stainless Steel', density: 7930, standard: 'ASTM A240 / IS 6911', yieldStrength: '205 MPa', description: 'Food grade, architectural railings, pharmaceutical & dairy equipment.' },
  { id: 'ss_316', name: 'Stainless Steel SS 316 / 316L', category: 'Stainless Steel', density: 8000, standard: 'ASTM A240 / IS 6911', yieldStrength: '220 MPa', description: 'Marine grade, acid resistant chemical piping & coastal cladding.' },
  { id: 'ss_202', name: 'Stainless Steel SS 202 (Decorative)', category: 'Stainless Steel', density: 7750, standard: 'Commercial', yieldStrength: '240 MPa', description: 'Interior architectural grilles, decorative gates & indoor railings.' },
  { id: 'ss_410', name: 'Stainless Steel SS 410 / 430', category: 'Stainless Steel', density: 7750, standard: 'Ferritic', yieldStrength: '275 MPa', description: 'High hardness, wear resistance, cutlery & heat resistant flue ducts.' },

  // Non-Ferrous Alloys
  { id: 'al_6061', name: 'Aluminium Alloy 6061 / 6082', category: 'Non-Ferrous Metals', density: 2700, standard: 'IS 733', yieldStrength: '240 MPa', description: 'Lightweight structural frames, solar panel mounting & automotive parts.' },
  { id: 'copper_pure', name: 'Pure Electrolytic Copper', category: 'Non-Ferrous Metals', density: 8960, standard: 'IS 1897', yieldStrength: '200 MPa', description: 'Electrical busbars, earthing strips, HVAC refrigeration piping.' },
  { id: 'brass_comm', name: 'Commercial Brass (70/30)', category: 'Non-Ferrous Metals', density: 8500, standard: 'IS 410', yieldStrength: '180 MPa', description: 'Plumbing fittings, architectural hardware, decorative bushings.' },
  { id: 'cast_iron', name: 'Grey Cast Iron (FG 200)', category: 'Non-Ferrous Metals', density: 7200, standard: 'IS 210', yieldStrength: '200 MPa', description: 'Manhole covers, machine beds, counterweights & drainage pipes.' },
];

// -------------------------------------------------------------
// Indian BIS Presets & Tables
// -------------------------------------------------------------
export interface RebarStandard {
  dia: number; // mm
  weightPerMeter: number; // kg/m
  weightPer12m: number; // kg per 12m length
  pcsPerBundle: number;
  bundleWeight: number; // kg
  areaSqMm: number;
}

export const TMT_REBAR_DATA: Record<number, RebarStandard> = {
  6: { dia: 6, weightPerMeter: 0.222, weightPer12m: 2.664, pcsPerBundle: 20, bundleWeight: 53.28, areaSqMm: 28.3 },
  8: { dia: 8, weightPerMeter: 0.395, weightPer12m: 4.740, pcsPerBundle: 10, bundleWeight: 47.40, areaSqMm: 50.3 },
  10: { dia: 10, weightPerMeter: 0.617, weightPer12m: 7.404, pcsPerBundle: 7, bundleWeight: 51.83, areaSqMm: 78.5 },
  12: { dia: 12, weightPerMeter: 0.888, weightPer12m: 10.656, pcsPerBundle: 5, bundleWeight: 53.28, areaSqMm: 113.1 },
  16: { dia: 16, weightPerMeter: 1.578, weightPer12m: 18.936, pcsPerBundle: 3, bundleWeight: 56.81, areaSqMm: 201.1 },
  20: { dia: 20, weightPerMeter: 2.466, weightPer12m: 29.592, pcsPerBundle: 2, bundleWeight: 59.18, areaSqMm: 314.2 },
  25: { dia: 25, weightPerMeter: 3.853, weightPer12m: 46.236, pcsPerBundle: 1, bundleWeight: 46.24, areaSqMm: 490.9 },
  28: { dia: 28, weightPerMeter: 4.834, weightPer12m: 58.008, pcsPerBundle: 1, bundleWeight: 58.01, areaSqMm: 615.8 },
  32: { dia: 32, weightPerMeter: 6.313, weightPer12m: 75.756, pcsPerBundle: 1, bundleWeight: 75.76, areaSqMm: 804.2 },
  36: { dia: 36, weightPerMeter: 7.990, weightPer12m: 95.880, pcsPerBundle: 1, bundleWeight: 95.88, areaSqMm: 1017.9 },
  40: { dia: 40, weightPerMeter: 9.865, weightPer12m: 118.380, pcsPerBundle: 1, bundleWeight: 118.38, areaSqMm: 1256.6 },
};

// ISMC Channels (IS 808)
export const ISMC_PRESETS: { code: string; name: string; depth: number; flange: number; webThick: number; flangeThick: number; weightPerM: number }[] = [
  { code: 'ISMC 75', name: 'ISMC 75 x 40', depth: 75, flange: 40, webThick: 4.8, flangeThick: 7.5, weightPerM: 7.14 },
  { code: 'ISMC 100', name: 'ISMC 100 x 50', depth: 100, flange: 50, webThick: 5.0, flangeThick: 7.7, weightPerM: 9.56 },
  { code: 'ISMC 125', name: 'ISMC 125 x 65', depth: 125, flange: 65, webThick: 5.3, flangeThick: 8.2, weightPerM: 13.10 },
  { code: 'ISMC 150', name: 'ISMC 150 x 75', depth: 150, flange: 75, webThick: 5.7, flangeThick: 9.0, weightPerM: 16.80 },
  { code: 'ISMC 175', name: 'ISMC 175 x 75', depth: 175, flange: 75, webThick: 6.0, flangeThick: 10.2, weightPerM: 19.60 },
  { code: 'ISMC 200', name: 'ISMC 200 x 75', depth: 200, flange: 75, webThick: 6.2, flangeThick: 11.4, weightPerM: 22.30 },
  { code: 'ISMC 250', name: 'ISMC 250 x 82', depth: 250, flange: 82, webThick: 7.2, flangeThick: 14.1, weightPerM: 30.40 },
  { code: 'ISMC 300', name: 'ISMC 300 x 90', depth: 300, flange: 90, webThick: 7.8, flangeThick: 13.6, weightPerM: 36.30 },
  { code: 'ISMC 350', name: 'ISMC 350 x 100', depth: 350, flange: 100, webThick: 8.3, flangeThick: 15.3, weightPerM: 42.10 },
  { code: 'ISMC 400', name: 'ISMC 400 x 100', depth: 400, flange: 100, webThick: 8.8, flangeThick: 15.3, weightPerM: 50.10 },
];

// ISMB Beams (IS 808)
export const ISMB_PRESETS: { code: string; name: string; depth: number; flange: number; webThick: number; flangeThick: number; weightPerM: number }[] = [
  { code: 'ISMB 100', name: 'ISMB 100 x 50', depth: 100, flange: 50, webThick: 4.7, flangeThick: 7.0, weightPerM: 11.50 },
  { code: 'ISMB 125', name: 'ISMB 125 x 70', depth: 125, flange: 70, webThick: 5.0, flangeThick: 8.0, weightPerM: 13.30 },
  { code: 'ISMB 150', name: 'ISMB 150 x 75', depth: 150, flange: 75, webThick: 5.0, flangeThick: 8.0, weightPerM: 15.00 },
  { code: 'ISMB 175', name: 'ISMB 175 x 85', depth: 175, flange: 85, webThick: 5.8, flangeThick: 9.0, weightPerM: 19.30 },
  { code: 'ISMB 200', name: 'ISMB 200 x 100', depth: 200, flange: 100, webThick: 5.7, flangeThick: 10.0, weightPerM: 25.40 },
  { code: 'ISMB 250', name: 'ISMB 250 x 125', depth: 250, flange: 125, webThick: 6.9, flangeThick: 12.5, weightPerM: 37.30 },
  { code: 'ISMB 300', name: 'ISMB 300 x 140', depth: 300, flange: 140, webThick: 7.5, flangeThick: 12.4, weightPerM: 44.20 },
  { code: 'ISMB 350', name: 'ISMB 350 x 140', depth: 350, flange: 140, webThick: 8.1, flangeThick: 14.2, weightPerM: 52.40 },
  { code: 'ISMB 400', name: 'ISMB 400 x 140', depth: 400, flange: 140, webThick: 8.9, flangeThick: 16.0, weightPerM: 61.60 },
  { code: 'ISMB 450', name: 'ISMB 450 x 150', depth: 450, flange: 150, webThick: 9.4, flangeThick: 17.4, weightPerM: 72.40 },
  { code: 'ISMB 500', name: 'ISMB 500 x 180', depth: 500, flange: 180, webThick: 10.2, flangeThick: 17.2, weightPerM: 86.90 },
  { code: 'ISMB 600', name: 'ISMB 600 x 210', depth: 600, flange: 210, webThick: 12.0, flangeThick: 20.8, weightPerM: 122.60 },
];

// Equal Angles (ISA - IS 808)
export const ISA_EQUAL_PRESETS: { code: string; leg: number; thick: number; weightPerM: number }[] = [
  { code: 'ISA 25x25x3', leg: 25, thick: 3, weightPerM: 1.12 },
  { code: 'ISA 25x25x5', leg: 25, thick: 5, weightPerM: 1.80 },
  { code: 'ISA 35x35x4', leg: 35, thick: 4, weightPerM: 2.10 },
  { code: 'ISA 40x40x5', leg: 40, thick: 5, weightPerM: 3.00 },
  { code: 'ISA 45x45x5', leg: 45, thick: 5, weightPerM: 3.40 },
  { code: 'ISA 50x50x5', leg: 50, thick: 5, weightPerM: 3.80 },
  { code: 'ISA 50x50x6', leg: 50, thick: 6, weightPerM: 4.50 },
  { code: 'ISA 65x65x6', leg: 65, thick: 6, weightPerM: 5.90 },
  { code: 'ISA 65x65x8', leg: 65, thick: 8, weightPerM: 7.70 },
  { code: 'ISA 75x75x6', leg: 75, thick: 6, weightPerM: 6.80 },
  { code: 'ISA 75x75x8', leg: 75, thick: 8, weightPerM: 8.90 },
  { code: 'ISA 75x75x10', leg: 75, thick: 10, weightPerM: 11.00 },
  { code: 'ISA 90x90x8', leg: 90, thick: 8, weightPerM: 10.80 },
  { code: 'ISA 100x100x8', leg: 100, thick: 8, weightPerM: 12.10 },
  { code: 'ISA 100x100x10', leg: 100, thick: 10, weightPerM: 14.90 },
  { code: 'ISA 100x100x12', leg: 100, thick: 12, weightPerM: 17.70 },
  { code: 'ISA 130x130x12', leg: 130, thick: 12, weightPerM: 23.40 },
  { code: 'ISA 150x150x12', leg: 150, thick: 12, weightPerM: 27.20 },
];

// Circular Pipes Nominal Bore (IS 1239 / IS 1161)
export interface PipeNBPreset {
  nb: number;
  inch: string;
  od: number; // mm
  lightA: { thick: number; weightPerM: number };
  mediumB: { thick: number; weightPerM: number };
  heavyC: { thick: number; weightPerM: number };
}

export const PIPE_NB_PRESETS: PipeNBPreset[] = [
  { nb: 15, inch: '1/2"', od: 21.3, lightA: { thick: 2.0, weightPerM: 0.95 }, mediumB: { thick: 2.6, weightPerM: 1.21 }, heavyC: { thick: 3.2, weightPerM: 1.44 } },
  { nb: 20, inch: '3/4"', od: 26.9, lightA: { thick: 2.3, weightPerM: 1.41 }, mediumB: { thick: 2.6, weightPerM: 1.57 }, heavyC: { thick: 3.2, weightPerM: 1.88 } },
  { nb: 25, inch: '1"', od: 33.7, lightA: { thick: 2.6, weightPerM: 2.01 }, mediumB: { thick: 3.2, weightPerM: 2.42 }, heavyC: { thick: 4.0, weightPerM: 2.95 } },
  { nb: 32, inch: '1-1/4"', od: 42.4, lightA: { thick: 2.6, weightPerM: 2.58 }, mediumB: { thick: 3.2, weightPerM: 3.12 }, heavyC: { thick: 4.0, weightPerM: 3.82 } },
  { nb: 40, inch: '1-1/2"', od: 48.3, lightA: { thick: 2.9, weightPerM: 3.27 }, mediumB: { thick: 3.2, weightPerM: 3.58 }, heavyC: { thick: 4.0, weightPerM: 4.41 } },
  { nb: 50, inch: '2"', od: 60.3, lightA: { thick: 2.9, weightPerM: 4.15 }, mediumB: { thick: 3.6, weightPerM: 5.08 }, heavyC: { thick: 4.5, weightPerM: 6.24 } },
  { nb: 65, inch: '2-1/2"', od: 76.1, lightA: { thick: 3.2, weightPerM: 5.80 }, mediumB: { thick: 3.6, weightPerM: 6.49 }, heavyC: { thick: 4.5, weightPerM: 8.01 } },
  { nb: 80, inch: '3"', od: 88.9, lightA: { thick: 3.2, weightPerM: 6.81 }, mediumB: { thick: 4.0, weightPerM: 8.44 }, heavyC: { thick: 4.8, weightPerM: 10.04 } },
  { nb: 100, inch: '4"', od: 114.3, lightA: { thick: 3.6, weightPerM: 9.89 }, mediumB: { thick: 4.5, weightPerM: 12.28 }, heavyC: { thick: 5.4, weightPerM: 14.61 } },
  { nb: 125, inch: '5"', od: 139.7, lightA: { thick: 4.5, weightPerM: 15.00 }, mediumB: { thick: 4.8, weightPerM: 16.09 }, heavyC: { thick: 5.4, weightPerM: 17.99 } },
  { nb: 150, inch: '6"', od: 165.1, lightA: { thick: 4.5, weightPerM: 17.80 }, mediumB: { thick: 4.8, weightPerM: 19.12 }, heavyC: { thick: 5.4, weightPerM: 21.43 } },
];

// Bill of Materials / Steel Takeoff Item
export interface TakeoffItem {
  id: string;
  shape: SectionShape;
  shapeLabel: string;
  grade: string;
  specs: string;
  lengthMeters: number;
  lengthDisplay: string;
  quantity: number;
  weightPerMeter: number;
  weightPerPcKg: number;
  totalWeightKg: number;
  totalWeightTonnes: number;
  cost: number;
}

export default function SteelWeightCalculator() {
  // Global & Active Settings
  const [gradeId, setGradeId] = useState<string>('tmt_fe500d');
  const [shape, setShape] = useState<SectionShape>('tmt');
  const [lengthUnit, setLengthUnit] = useState<'m' | 'ft'>('m');
  const [length, setLength] = useState<number>(12); // Standard 12m for TMT
  const [quantity, setQuantity] = useState<number>(10);
  const [ratePerKg, setRatePerKg] = useState<number>(() => getStoredRates().steel || 68);
  const [gstPercent, setGstPercent] = useState<number>(18); // 18% GST standard on steel in India
  const [wastageBuffer, setWastageBuffer] = useState<number>(3); // 3% cutting / scrap buffer
  const [copied, setCopied] = useState<boolean>(false);

  // Shape Specific States
  const [tmtDia, setTmtDia] = useState<number>(12);
  const [tmtBundleMode, setTmtBundleMode] = useState<'pcs' | 'bundles'>('pcs');
  const [tmtBundlesInput, setTmtBundlesInput] = useState<number>(2);

  // Plate / Chequered Plate Dimensions
  const [plateLength, setPlateLength] = useState<number>(2.5); // meters
  const [plateWidth, setPlateWidth] = useState<number>(1.25); // meters (standard 8x4 ft sheet)
  const [plateThickness, setPlateThickness] = useState<number>(6); // mm

  // Flat Bar (Patti)
  const [flatWidth, setFlatWidth] = useState<number>(50); // mm
  const [flatThickness, setFlatThickness] = useState<number>(6); // mm

  // Angle Bar
  const [angleMode, setAngleMode] = useState<'preset' | 'custom'>('preset');
  const [anglePresetIndex, setAnglePresetIndex] = useState<number>(5); // ISA 50x50x5
  const [angleLegA, setAngleLegA] = useState<number>(50); // mm
  const [angleLegB, setAngleLegB] = useState<number>(50); // mm
  const [angleThick, setAngleThick] = useState<number>(5); // mm

  // ISMC Channels
  const [channelMode, setChannelMode] = useState<'preset' | 'custom'>('preset');
  const [channelPresetCode, setChannelPresetCode] = useState<string>('ISMC 100');
  const [channelDepth, setChannelDepth] = useState<number>(100);
  const [channelFlange, setChannelFlange] = useState<number>(50);
  const [channelWebT, setChannelWebT] = useState<number>(5);

  // ISMB Beams
  const [beamMode, setBeamMode] = useState<'preset' | 'custom'>('preset');
  const [beamPresetCode, setBeamPresetCode] = useState<string>('ISMB 150');
  const [beamDepth, setBeamDepth] = useState<number>(150);
  const [beamFlange, setBeamFlange] = useState<number>(75);
  const [beamWebT, setBeamWebT] = useState<number>(5);
  const [beamFlangeT, setBeamFlangeT] = useState<number>(8);

  // SHS & RHS Hollow Tubes
  const [shsSide, setShsSide] = useState<number>(50); // mm
  const [shsThick, setShsThick] = useState<number>(3.2); // mm
  const [rhsWidth, setRhsWidth] = useState<number>(80); // mm
  const [rhsHeight, setRhsHeight] = useState<number>(40); // mm
  const [rhsThick, setRhsThick] = useState<number>(3.2); // mm

  // Circular Pipe
  const [pipeMode, setPipeMode] = useState<'nb' | 'custom'>('nb');
  const [pipeNBIndex, setPipeNBIndex] = useState<number>(2); // 1" (NB 25)
  const [pipeClass, setPipeClass] = useState<'lightA' | 'mediumB' | 'heavyC'>('mediumB');
  const [pipeOD, setPipeOD] = useState<number>(48.3); // mm
  const [pipeThick, setPipeThick] = useState<number>(3.2); // mm

  // Solid Square & Hex
  const [solidSquareSide, setSolidSquareSide] = useState<number>(25); // mm
  const [solidHexAF, setSolidHexAF] = useState<number>(25); // mm across flats

  // Multi-item Takeoff Requisition / Bill of Materials (BOM)
  const [takeoffList, setTakeoffList] = useState<TakeoffItem[]>([]);

  // Selected Metal Grade
  const selectedGrade = useMemo(() => {
    return METAL_GRADES.find(g => g.id === gradeId) || METAL_GRADES[0];
  }, [gradeId]);

  // Adjust length preset when shape changes
  const handleShapeChange = (newShape: SectionShape) => {
    setShape(newShape);
    if (newShape === 'tmt') {
      setLength(12);
      setLengthUnit('m');
    } else if (newShape === 'plate' || newShape === 'chequered_plate') {
      setLength(1);
    } else if (newShape === 'beam_ismb' || newShape === 'channel_ismc' || newShape === 'angle_equal' || newShape === 'angle_unequal') {
      setLength(6); // 6m standard structural length
      setLengthUnit('m');
    }
  };

  // Sync Rate Changes to LocalStorage
  const handleRateChange = (newRate: number) => {
    const val = Math.max(0, newRate);
    setRatePerKg(val);
    saveStoredRates({ steel: val });
  };

  // -------------------------------------------------------------
  // Calculate Active Steel Section Calculations
  // -------------------------------------------------------------
  const activeCalc = useMemo(() => {
    const densityRatio = selectedGrade.density / 7850; // Reference steel density is 7850 kg/m3
    let lenMeters = lengthUnit === 'ft' ? length * 0.3048 : length;
    let actualQty = quantity;

    if (shape === 'tmt' && tmtBundleMode === 'bundles') {
      const bundlePcs = TMT_REBAR_DATA[tmtDia]?.pcsPerBundle || 1;
      actualQty = tmtBundlesInput * bundlePcs;
    }

    let weightPerM = 0;
    let specDescription = '';

    switch (shape) {
      case 'tmt': {
        // D^2 / 162.2 kg/m for steel (density 7850)
        weightPerM = ((tmtDia * tmtDia) / 162.2) * densityRatio;
        specDescription = `Ø${tmtDia} mm Rebar (IS 1786)`;
        break;
      }
      case 'round': {
        const radiusM = (tmtDia / 2) / 1000;
        const volPerM = Math.PI * Math.pow(radiusM, 2) * 1;
        weightPerM = volPerM * selectedGrade.density;
        specDescription = `Ø${tmtDia} mm Round Bar`;
        break;
      }
      case 'plate': {
        // Length(m) * Width(m) * Thick(mm) * 7.85 kg
        const wMeters = plateWidth;
        const tM = plateThickness / 1000;
        const areaPerM = wMeters * tM;
        weightPerM = areaPerM * selectedGrade.density;
        lenMeters = plateLength;
        specDescription = `Plate ${plateThickness}mm (${plateLength}m x ${plateWidth}m)`;
        break;
      }
      case 'chequered_plate': {
        const wMeters = plateWidth;
        const tM = plateThickness / 1000;
        const areaPerM = wMeters * tM;
        // Base plate weight + 2.1 kg/m2 for teardrop / diamond pattern
        weightPerM = (areaPerM * selectedGrade.density) + (wMeters * 2.1);
        lenMeters = plateLength;
        specDescription = `Chequered Plate ${plateThickness}mm (+2.1 kg/m² pattern)`;
        break;
      }
      case 'flat': {
        const wM = flatWidth / 1000;
        const tM = flatThickness / 1000;
        weightPerM = wM * tM * selectedGrade.density;
        specDescription = `Flat Bar (Patti) ${flatWidth} x ${flatThickness} mm`;
        break;
      }
      case 'angle_equal': {
        if (angleMode === 'preset') {
          const preset = ISA_EQUAL_PRESETS[anglePresetIndex] || ISA_EQUAL_PRESETS[0];
          weightPerM = preset.weightPerM * densityRatio;
          specDescription = `${preset.code} (IS 808)`;
        } else {
          weightPerM = ((2 * angleLegA - angleThick) * angleThick * 0.00785) * densityRatio;
          specDescription = `Angle ${angleLegA} x ${angleLegA} x ${angleThick} mm`;
        }
        break;
      }
      case 'angle_unequal': {
        weightPerM = ((angleLegA + angleLegB - angleThick) * angleThick * 0.00785) * densityRatio;
        specDescription = `Unequal Angle ${angleLegA} x ${angleLegB} x ${angleThick} mm`;
        break;
      }
      case 'channel_ismc': {
        if (channelMode === 'preset') {
          const preset = ISMC_PRESETS.find(p => p.code === channelPresetCode) || ISMC_PRESETS[1];
          weightPerM = preset.weightPerM * densityRatio;
          specDescription = `${preset.name} (IS 808)`;
        } else {
          // Channel approx formula
          weightPerM = ((channelDepth + 2 * channelFlange - 2 * channelWebT) * channelWebT * 0.00785) * densityRatio;
          specDescription = `Channel ${channelDepth} x ${channelFlange} mm`;
        }
        break;
      }
      case 'beam_ismb': {
        if (beamMode === 'preset') {
          const preset = ISMB_PRESETS.find(p => p.code === beamPresetCode) || ISMB_PRESETS[2];
          weightPerM = preset.weightPerM * densityRatio;
          specDescription = `${preset.name} (IS 808)`;
        } else {
          const webH = beamDepth - (2 * beamFlangeT);
          const areaSqMm = (2 * beamFlange * beamFlangeT) + (webH * beamWebT);
          weightPerM = (areaSqMm / 1000000) * selectedGrade.density;
          specDescription = `Beam ${beamDepth} x ${beamFlange} mm (Custom)`;
        }
        break;
      }
      case 'shs_square_tube': {
        // 4 * (Side - Thick) * Thick * 0.00785
        weightPerM = (4 * (shsSide - shsThick) * shsThick * 0.00785) * densityRatio;
        specDescription = `SHS Tube ${shsSide} x ${shsSide} x ${shsThick} mm`;
        break;
      }
      case 'rhs_rect_tube': {
        // 2 * (Width + Height - 2*Thick) * Thick * 0.00785
        weightPerM = (2 * (rhsWidth + rhsHeight - 2 * rhsThick) * rhsThick * 0.00785) * densityRatio;
        specDescription = `RHS Tube ${rhsWidth} x ${rhsHeight} x ${rhsThick} mm`;
        break;
      }
      case 'pipe_round_tube': {
        if (pipeMode === 'nb') {
          const preset = PIPE_NB_PRESETS[pipeNBIndex] || PIPE_NB_PRESETS[2];
          const classData = preset[pipeClass];
          weightPerM = classData.weightPerM * densityRatio;
          const classLabel = pipeClass === 'lightA' ? 'Class A (Light)' : pipeClass === 'mediumB' ? 'Class B (Medium)' : 'Class C (Heavy)';
          specDescription = `Pipe NB ${preset.nb}mm (${preset.inch}) OD ${preset.od}mm - ${classLabel}`;
        } else {
          // (OD - t) * t * 0.02466
          weightPerM = ((pipeOD - pipeThick) * pipeThick * 0.02466) * densityRatio;
          specDescription = `Pipe OD ${pipeOD}mm x ${pipeThick}mm wall`;
        }
        break;
      }
      case 'square_bar': {
        weightPerM = ((solidSquareSide * solidSquareSide) * 0.00785) * densityRatio;
        specDescription = `Square Bar ${solidSquareSide} x ${solidSquareSide} mm`;
        break;
      }
      case 'hex_bar': {
        weightPerM = ((solidHexAF * solidHexAF) * 0.0068) * densityRatio;
        specDescription = `Hex Bar ${solidHexAF} mm Across Flats`;
        break;
      }
    }

    const weightPerPcKg = Number((weightPerM * lenMeters).toFixed(3));
    const totalWeightKg = Number((weightPerPcKg * actualQty).toFixed(2));
    const totalWeightTonnes = Number((totalWeightKg / 1000).toFixed(4));
    const totalWeightQuintals = Number((totalWeightKg / 100).toFixed(2));
    const totalWeightLbs = Number((totalWeightKg * 2.20462).toFixed(2));

    // Cost Breakdown
    const baseCost = totalWeightKg * ratePerKg;
    const wastageAmount = baseCost * (wastageBuffer / 100);
    const subtotalWithWastage = baseCost + wastageAmount;
    const gstAmount = subtotalWithWastage * (gstPercent / 100);
    const totalEstimatedCost = Math.round(subtotalWithWastage + gstAmount);

    // TMT Bundle Info
    let tmtBundleBreakdown = null;
    if (shape === 'tmt') {
      const perBundle = TMT_REBAR_DATA[tmtDia]?.pcsPerBundle || 1;
      const fullBundles = Math.floor(actualQty / perBundle);
      const loosePcs = actualQty % perBundle;
      tmtBundleBreakdown = {
        pcsPerBundle: perBundle,
        fullBundles,
        loosePcs,
        bundleWeightKg: Number((TMT_REBAR_DATA[tmtDia]?.bundleWeight || 0).toFixed(2)),
      };
    }

    return {
      specDescription,
      weightPerM: Number(weightPerM.toFixed(4)),
      weightPerPcKg,
      totalWeightKg,
      totalWeightTonnes,
      totalWeightQuintals,
      totalWeightLbs,
      actualQty,
      lenMeters: Number(lenMeters.toFixed(3)),
      baseCost: Math.round(baseCost),
      wastageAmount: Math.round(wastageAmount),
      gstAmount: Math.round(gstAmount),
      totalEstimatedCost,
      tmtBundleBreakdown,
    };
  }, [
    shape, selectedGrade, length, lengthUnit, quantity, ratePerKg, gstPercent, wastageBuffer,
    tmtDia, tmtBundleMode, tmtBundlesInput,
    plateLength, plateWidth, plateThickness,
    flatWidth, flatThickness,
    angleMode, anglePresetIndex, angleLegA, angleLegB, angleThick,
    channelMode, channelPresetCode, channelDepth, channelFlange, channelWebT,
    beamMode, beamPresetCode, beamDepth, beamFlange, beamWebT, beamFlangeT,
    shsSide, shsThick, rhsWidth, rhsHeight, rhsThick,
    pipeMode, pipeNBIndex, pipeClass, pipeOD, pipeThick,
    solidSquareSide, solidHexAF
  ]);

  // Add Item to Takeoff BOM Requisition
  const handleAddToTakeoff = () => {
    const newItem: TakeoffItem = {
      id: 'item_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      shape,
      shapeLabel: shape.toUpperCase().replace('_', ' '),
      grade: selectedGrade.name,
      specs: activeCalc.specDescription,
      lengthMeters: activeCalc.lenMeters,
      lengthDisplay: `${length} ${lengthUnit}`,
      quantity: activeCalc.actualQty,
      weightPerMeter: activeCalc.weightPerM,
      weightPerPcKg: activeCalc.weightPerPcKg,
      totalWeightKg: activeCalc.totalWeightKg,
      totalWeightTonnes: activeCalc.totalWeightTonnes,
      cost: activeCalc.totalEstimatedCost,
    };

    setTakeoffList(prev => [...prev, newItem]);
  };

  const handleRemoveTakeoffItem = (id: string) => {
    setTakeoffList(prev => prev.filter(item => item.id !== id));
  };

  const handleClearTakeoff = () => {
    if (window.confirm('Clear all items from the steel takeoff list?')) {
      setTakeoffList([]);
    }
  };

  // Cumulative Takeoff Stats
  const takeoffSummary = useMemo(() => {
    const totalKg = takeoffList.reduce((acc, it) => acc + it.totalWeightKg, 0);
    const totalTonnes = totalKg / 1000;
    const totalQuintals = totalKg / 100;
    const totalCost = takeoffList.reduce((acc, it) => acc + it.cost, 0);
    const totalPcs = takeoffList.reduce((acc, it) => acc + it.quantity, 0);

    return {
      totalKg: Number(totalKg.toFixed(2)),
      totalTonnes: Number(totalTonnes.toFixed(3)),
      totalQuintals: Number(totalQuintals.toFixed(2)),
      totalCost,
      totalPcs,
      itemCount: takeoffList.length,
    };
  }, [takeoffList]);

  // Copy Summary to Clipboard
  const copyReport = () => {
    const text = `*Steel Weight & Procurement Estimate (Toolique)*
----------------------------------------
*Item / Section:* ${activeCalc.specDescription}
*Steel Grade:* ${selectedGrade.name} (${selectedGrade.standard})
*Dimensions / Spec:* ${activeCalc.specDescription}
*Length per Piece:* ${length} ${lengthUnit} (${activeCalc.lenMeters} m)
*Quantity:* ${activeCalc.actualQty} Pcs ${activeCalc.tmtBundleBreakdown ? `(${activeCalc.tmtBundleBreakdown.fullBundles} Bundles + ${activeCalc.tmtBundleBreakdown.loosePcs} Loose)` : ''}
----------------------------------------
*Unit Weight:* ${activeCalc.weightPerM} kg/m | ${activeCalc.weightPerPcKg} kg/pc
*Total Steel Weight:* ${activeCalc.totalWeightKg.toLocaleString()} kg (${activeCalc.totalWeightTonnes} MT / ${activeCalc.totalWeightQuintals} Quintals)
*Current Steel Rate:* ₹${ratePerKg}/kg (incl. ${wastageBuffer}% buffer + ${gstPercent}% GST)
*Estimated Total Cost:* ₹${activeCalc.totalEstimatedCost.toLocaleString('en-IN')}
----------------------------------------
Calculated via Toolique Steel Weight Calculator (IS 1786 / IS 2062 Compliant)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // WhatsApp Requisition Share
  const handleWhatsAppShare = () => {
    let msg = `*🏗️ STEEL REQUISITION & CUTTING SCHEDULE*\n`;
    msg += `*Source:* Toolique Civil Engineering Suite (IS 1786 / IS 2062)\n\n`;

    if (takeoffList.length > 0) {
      msg += `*📋 BILL OF QUANTITIES (${takeoffList.length} Items):*\n`;
      takeoffList.forEach((it, idx) => {
        msg += `${idx + 1}. *${it.specs}* (${it.grade})\n`;
        msg += `   • Qty: ${it.quantity} pcs @ ${it.lengthDisplay} (${it.lengthMeters}m)\n`;
        msg += `   • Weight: ${it.totalWeightKg.toLocaleString()} kg (${it.totalWeightTonnes} MT)\n`;
        msg += `   • Est. Cost: ₹${it.cost.toLocaleString('en-IN')}\n\n`;
      });
      msg += `*📊 TOTAL PROCUREMENT SUMMARY:*\n`;
      msg += `• Total Steel Weight: *${takeoffSummary.totalKg.toLocaleString()} kg* (*${takeoffSummary.totalTonnes} MT* / *${takeoffSummary.totalQuintals} Q*)\n`;
      msg += `• Total Material Cost: *₹${takeoffSummary.totalCost.toLocaleString('en-IN')}*\n`;
    } else {
      msg += `*Active Section:* ${activeCalc.specDescription}\n`;
      msg += `*Grade:* ${selectedGrade.name}\n`;
      msg += `*Qty & Length:* ${activeCalc.actualQty} pcs @ ${length} ${lengthUnit}\n`;
      if (activeCalc.tmtBundleBreakdown) {
        msg += `*Bundles:* ${activeCalc.tmtBundleBreakdown.fullBundles} Bundles + ${activeCalc.tmtBundleBreakdown.loosePcs} Pcs\n`;
      }
      msg += `*Total Weight:* *${activeCalc.totalWeightKg.toLocaleString()} kg* (${activeCalc.totalWeightTonnes} MT)\n`;
      msg += `*Rate:* ₹${ratePerKg}/kg\n`;
      msg += `*Estimated Cost:* *₹${activeCalc.totalEstimatedCost.toLocaleString('en-IN')}* (incl. GST & buffer)\n`;
    }

    msg += `\n_Generated via Toolique.in_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Generate Professional PDF Steel Requisition & Cutting Schedule
  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      const primaryColor = [13, 148, 136]; // Teal-600
      const darkColor = [15, 23, 42]; // Slate-900

      // Header Banner
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 24, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text('TOOLIQUE STRUCTURAL STEEL REQUISITION', 14, 15);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.text('IS 1786 / IS 2062 / IS 808 Bar Bending & Material Takeoff', 14, 21);

      // Meta info
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setFontSize(9);
      doc.text(`Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, 14, 32);
      doc.text(`Doc Ref: TMT-REQ-${Date.now().toString().slice(-6)}`, 140, 32);

      // Active Section / Requisition Summary Block
      doc.setDrawColor(204, 251, 241);
      doc.setFillColor(240, 253, 250);
      doc.roundedRect(14, 38, 182, 38, 3, 3, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('TOTAL STEEL WEIGHT & COST SUMMARY', 20, 46);

      const displayKg = takeoffList.length > 0 ? takeoffSummary.totalKg : activeCalc.totalWeightKg;
      const displayTonnes = takeoffList.length > 0 ? takeoffSummary.totalTonnes : activeCalc.totalWeightTonnes;
      const displayCost = takeoffList.length > 0 ? takeoffSummary.totalCost : activeCalc.totalEstimatedCost;

      doc.setFontSize(18);
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.text(`${displayKg.toLocaleString()} kg (${displayTonnes} MT)`, 20, 56);

      doc.setFontSize(9);
      doc.setTextColor(70, 70, 70);
      doc.text(`Estimated Procurement Budget: ₹${displayCost.toLocaleString('en-IN')}`, 20, 64);
      doc.text(`Standard Steel Base Rate: ₹${ratePerKg}/kg | GST: ${gstPercent}% | Buffer: ${wastageBuffer}%`, 20, 70);

      // Items Table
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.text('STEEL SECTION CUTTING & INDENT SCHEDULE', 14, 86);
      doc.line(14, 88, 196, 88);

      let y = 96;
      const drawRow = (desc: string, lengthText: string, qtyText: string, weightText: string, costText: string, isHeader = false) => {
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
        doc.text(desc, 16, y);
        doc.text(lengthText, 85, y);
        doc.text(qtyText, 115, y);
        doc.text(weightText, 140, y);
        doc.text(costText, 172, y);

        if (!isHeader) {
          doc.setDrawColor(240, 240, 240);
          doc.line(14, y + 2, 196, y + 2);
        }
        y += 8;
      };

      drawRow('SECTION SPECIFICATION', 'LENGTH', 'QTY (PCS)', 'WEIGHT (KG)', 'EST. COST (₹)', true);

      if (takeoffList.length > 0) {
        takeoffList.forEach((it) => {
          drawRow(
            it.specs.substring(0, 32),
            it.lengthDisplay,
            `${it.quantity}`,
            `${it.totalWeightKg.toLocaleString()} kg`,
            `₹${it.cost.toLocaleString('en-IN')}`
          );
        });
      } else {
        drawRow(
          activeCalc.specDescription.substring(0, 32),
          `${length} ${lengthUnit}`,
          `${activeCalc.actualQty}`,
          `${activeCalc.totalWeightKg.toLocaleString()} kg`,
          `₹${activeCalc.totalEstimatedCost.toLocaleString('en-IN')}`
        );
      }

      // Footer Notes
      doc.setFontSize(7.5);
      doc.setTextColor(140, 140, 140);
      doc.text('Calculated strictly as per Indian Standards (IS 1786 for TMT, IS 2062 for Mild Steel, IS 808 for Structural Sections).', 14, 280);
      doc.text('Toolique Civil & Structural Suite • www.toolique.in', 14, 285);

      doc.save(`Steel_Requisition_${Date.now().toString().slice(-4)}.pdf`);
    } catch (e) {
      alert('Error generating Steel Requisition PDF: ' + e);
    }
  };

  const handleReset = () => {
    setShape('tmt');
    setGradeId('tmt_fe500d');
    setLength(12);
    setLengthUnit('m');
    setQuantity(10);
    setTmtDia(12);
    setTmtBundleMode('pcs');
    setFlatWidth(50);
    setFlatThickness(6);
    setPlateLength(2.5);
    setPlateWidth(1.25);
    setPlateThickness(6);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-left">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight">Steel Weight Calculator & BBS Indent</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              IS 1786 / IS 2062 / IS 808
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Calculate weight and procurement cost for TMT Rebars, Plates, Channels (ISMC), Beams (ISMB), Angles (ISA), Hollow Sections, and Pipes.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={generatePDF}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800/60 text-xs font-bold hover:bg-teal-100 transition shadow-sm"
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
            title="Reset to defaults"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Section Shape Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
          1. Select Steel / Metal Profile Type
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {[
            { id: 'tmt', name: 'TMT Rebar', desc: 'IS 1786 / 12m' },
            { id: 'plate', name: 'MS Plate / Sheet', desc: 'IS 2062 Plain' },
            { id: 'chequered_plate', name: 'Chequered Plate', desc: '+2.1 kg/m² pattern' },
            { id: 'flat', name: 'Flat Bar (Patti)', desc: 'Width x Thick' },
            { id: 'angle_equal', name: 'Equal Angle (ISA)', desc: 'IS 808 L-Section' },
            { id: 'angle_unequal', name: 'Unequal Angle', desc: 'IS 808 Legs' },
            { id: 'channel_ismc', name: 'ISMC Channel', desc: 'IS 808 C-Section' },
            { id: 'beam_ismb', name: 'ISMB Beam / Joist', desc: 'IS 808 I-Section' },
            { id: 'shs_square_tube', name: 'Square Hollow (SHS)', desc: 'IS 4923 Tube' },
            { id: 'rhs_rect_tube', name: 'Rect Hollow (RHS)', desc: 'IS 4923 Tube' },
            { id: 'pipe_round_tube', name: 'Round Pipe (NB)', desc: 'IS 1239 / 1161' },
            { id: 'round', name: 'Solid Round Bar', desc: 'Shaft / Rod' },
            { id: 'square_bar', name: 'Solid Square Bar', desc: 'IS 1732 S-Bar' },
            { id: 'hex_bar', name: 'Hexagonal Bar', desc: 'Across Flats' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => handleShapeChange(s.id as SectionShape)}
              className={`p-2.5 rounded-xl border text-left transition ${
                shape === s.id
                  ? 'bg-teal-500/10 border-teal-500 text-teal-600 dark:text-teal-400 ring-2 ring-teal-500/20 shadow-sm'
                  : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
              }`}
            >
              <div className="text-xs font-bold truncate">{s.name}</div>
              <div className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">{s.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Dimensions & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Parameters (7 Cols) */}
        <div className="lg:col-span-7 space-y-5 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          {/* Grade & Material Selector */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Steel Grade & Metal Density
              </label>
              <span className="text-[11px] font-mono text-teal-600 dark:text-teal-400 font-bold">
                {selectedGrade.density} kg/m³
              </span>
            </div>
            <select
              value={gradeId}
              onChange={(e) => setGradeId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              {['TMT Rebar', 'Structural Carbon Steel', 'Stainless Steel', 'Non-Ferrous Metals'].map((cat) => (
                <optgroup key={cat} label={`--- ${cat} ---`}>
                  {METAL_GRADES.filter((g) => g.category === cat).map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.standard}) - {g.density} kg/m³
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
              {selectedGrade.description}
            </p>
          </div>

          {/* Dynamic Inputs Based on Shape */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 space-y-4">
            {/* 1. TMT Rebar Inputs */}
            {shape === 'tmt' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">
                      Bar Diameter (IS 1786)
                    </label>
                    <select
                      value={tmtDia}
                      onChange={(e) => setTmtDia(parseInt(e.target.value) || 12)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    >
                      {Object.keys(TMT_REBAR_DATA).map((d) => (
                        <option key={d} value={d}>
                          {d} mm ({TMT_REBAR_DATA[Number(d)].weightPerMeter} kg/m | ~{TMT_REBAR_DATA[Number(d)].pcsPerBundle} pcs/bundle)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">
                      Standard Bar Length
                    </label>
                    <div className="flex rounded-xl bg-zinc-100 dark:bg-zinc-800 p-0.5 border border-zinc-200 dark:border-zinc-700 text-xs font-bold">
                      {[
                        { label: '12m (40ft Std)', val: 12, unit: 'm' as const },
                        { label: '6m (20ft)', val: 6, unit: 'm' as const },
                        { label: '1m Custom', val: 1, unit: 'm' as const },
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => { setLength(item.val); setLengthUnit(item.unit); }}
                          className={`flex-1 py-1.5 rounded-lg transition ${
                            length === item.val && lengthUnit === item.unit
                              ? 'bg-white dark:bg-zinc-900 text-teal-600 dark:text-teal-400 shadow-sm'
                              : 'text-zinc-500'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bundle Mode Toggle */}
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800/80 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Quantity Input Method
                    </span>
                    <div className="flex rounded-lg bg-zinc-200 dark:bg-zinc-800 p-0.5 text-[11px] font-bold">
                      <button
                        onClick={() => setTmtBundleMode('pcs')}
                        className={`px-2.5 py-1 rounded-md transition ${tmtBundleMode === 'pcs' ? 'bg-white dark:bg-zinc-900 text-teal-600' : 'text-zinc-500'}`}
                      >
                        Loose Pieces
                      </button>
                      <button
                        onClick={() => setTmtBundleMode('bundles')}
                        className={`px-2.5 py-1 rounded-md transition ${tmtBundleMode === 'bundles' ? 'bg-white dark:bg-zinc-900 text-teal-600' : 'text-zinc-500'}`}
                      >
                        Full Bundles
                      </button>
                    </div>
                  </div>

                  {tmtBundleMode === 'pcs' ? (
                    <div>
                      <label className="block text-[11px] text-zinc-500 mb-1">Total Pieces Required</label>
                      <input
                        type="number"
                        min="1"
                        value={quantity || ''}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] text-zinc-500 mb-1">
                        Number of Full Factory Bundles (1 Bundle = {TMT_REBAR_DATA[tmtDia]?.pcsPerBundle} pcs of 12m)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={tmtBundlesInput || ''}
                        onChange={(e) => setTmtBundlesInput(Math.max(1, parseInt(e.target.value) || 0))}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. Plates & Chequered Plates */}
            {(shape === 'plate' || shape === 'chequered_plate') && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">Length (m)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={plateLength || ''}
                      onChange={(e) => setPlateLength(Math.max(0.1, parseFloat(e.target.value) || 0))}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">Width (m)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={plateWidth || ''}
                      onChange={(e) => setPlateWidth(Math.max(0.1, parseFloat(e.target.value) || 0))}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">Thickness (mm)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={plateThickness || ''}
                      onChange={(e) => setPlateThickness(Math.max(0.5, parseFloat(e.target.value) || 0))}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Popular Indian Sheet Presets */}
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1.5">Standard Plate Thickness Presets (IS 2062)</label>
                  <div className="flex flex-wrap gap-1.5">
                    {[1.6, 2.0, 2.5, 3.15, 4.0, 5.0, 6.0, 8.0, 10, 12, 16, 20, 25].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setPlateThickness(t)}
                        className={`px-2 py-1 rounded-lg text-xs font-bold border transition ${
                          plateThickness === t
                            ? 'bg-teal-50 border-teal-300 text-teal-600 dark:bg-teal-950/40 dark:border-teal-700'
                            : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50'
                        }`}
                      >
                        {t} mm
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 3. Flat Bar (Patti) */}
            {shape === 'flat' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">Width (mm)</label>
                  <input
                    type="number"
                    value={flatWidth || ''}
                    onChange={(e) => setFlatWidth(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">Thickness (mm)</label>
                  <input
                    type="number"
                    value={flatThickness || ''}
                    onChange={(e) => setFlatThickness(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* 4. Angle Bars (ISA) */}
            {shape === 'angle_equal' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Angle Size Selection</span>
                  <div className="flex rounded-lg bg-zinc-100 dark:bg-zinc-800 p-0.5 text-xs font-bold">
                    <button
                      onClick={() => setAngleMode('preset')}
                      className={`px-2.5 py-1 rounded-md transition ${angleMode === 'preset' ? 'bg-white dark:bg-zinc-900 text-teal-600' : 'text-zinc-500'}`}
                    >
                      IS 808 Presets
                    </button>
                    <button
                      onClick={() => setAngleMode('custom')}
                      className={`px-2.5 py-1 rounded-md transition ${angleMode === 'custom' ? 'bg-white dark:bg-zinc-900 text-teal-600' : 'text-zinc-500'}`}
                    >
                      Custom Dimensions
                    </button>
                  </div>
                </div>

                {angleMode === 'preset' ? (
                  <select
                    value={anglePresetIndex}
                    onChange={(e) => setAnglePresetIndex(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    {ISA_EQUAL_PRESETS.map((p, idx) => (
                      <option key={idx} value={idx}>
                        {p.code} ({p.weightPerM} kg/m)
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">Leg Size A (mm)</label>
                      <input
                        type="number"
                        value={angleLegA || ''}
                        onChange={(e) => setAngleLegA(Math.max(1, parseFloat(e.target.value) || 0))}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">Thickness (mm)</label>
                      <input
                        type="number"
                        value={angleThick || ''}
                        onChange={(e) => setAngleThick(Math.max(1, parseFloat(e.target.value) || 0))}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {shape === 'angle_unequal' && (
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">Leg A (mm)</label>
                  <input
                    type="number"
                    value={angleLegA || ''}
                    onChange={(e) => setAngleLegA(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">Leg B (mm)</label>
                  <input
                    type="number"
                    value={angleLegB || ''}
                    onChange={(e) => setAngleLegB(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">Thickness (mm)</label>
                  <input
                    type="number"
                    value={angleThick || ''}
                    onChange={(e) => setAngleThick(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* 5. ISMC Channels */}
            {shape === 'channel_ismc' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Channel Standard (IS 808)</span>
                  <div className="flex rounded-lg bg-zinc-100 dark:bg-zinc-800 p-0.5 text-xs font-bold">
                    <button
                      onClick={() => setChannelMode('preset')}
                      className={`px-2.5 py-1 rounded-md transition ${channelMode === 'preset' ? 'bg-white dark:bg-zinc-900 text-teal-600' : 'text-zinc-500'}`}
                    >
                      ISMC Presets
                    </button>
                    <button
                      onClick={() => setChannelMode('custom')}
                      className={`px-2.5 py-1 rounded-md transition ${channelMode === 'custom' ? 'bg-white dark:bg-zinc-900 text-teal-600' : 'text-zinc-500'}`}
                    >
                      Custom Channel
                    </button>
                  </div>
                </div>

                {channelMode === 'preset' ? (
                  <select
                    value={channelPresetCode}
                    onChange={(e) => setChannelPresetCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    {ISMC_PRESETS.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.name} ({p.weightPerM} kg/m) - Web: {p.depth}mm, Flange: {p.flange}mm
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">Web Depth (mm)</label>
                      <input
                        type="number"
                        value={channelDepth || ''}
                        onChange={(e) => setChannelDepth(Math.max(1, parseFloat(e.target.value) || 0))}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">Flange (mm)</label>
                      <input
                        type="number"
                        value={channelFlange || ''}
                        onChange={(e) => setChannelFlange(Math.max(1, parseFloat(e.target.value) || 0))}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">Thickness (mm)</label>
                      <input
                        type="number"
                        value={channelWebT || ''}
                        onChange={(e) => setChannelWebT(Math.max(1, parseFloat(e.target.value) || 0))}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 6. ISMB Beams */}
            {shape === 'beam_ismb' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Beam Standard (IS 808)</span>
                  <div className="flex rounded-lg bg-zinc-100 dark:bg-zinc-800 p-0.5 text-xs font-bold">
                    <button
                      onClick={() => setBeamMode('preset')}
                      className={`px-2.5 py-1 rounded-md transition ${beamMode === 'preset' ? 'bg-white dark:bg-zinc-900 text-teal-600' : 'text-zinc-500'}`}
                    >
                      ISMB Presets
                    </button>
                    <button
                      onClick={() => setBeamMode('custom')}
                      className={`px-2.5 py-1 rounded-md transition ${beamMode === 'custom' ? 'bg-white dark:bg-zinc-900 text-teal-600' : 'text-zinc-500'}`}
                    >
                      Custom Beam
                    </button>
                  </div>
                </div>

                {beamMode === 'preset' ? (
                  <select
                    value={beamPresetCode}
                    onChange={(e) => setBeamPresetCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    {ISMB_PRESETS.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.name} ({p.weightPerM} kg/m) - Depth: {p.depth}mm, Flange: {p.flange}mm
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-500 mb-1">Depth (mm)</label>
                      <input
                        type="number"
                        value={beamDepth || ''}
                        onChange={(e) => setBeamDepth(Math.max(1, parseFloat(e.target.value) || 0))}
                        className="w-full px-2.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-500 mb-1">Flange (mm)</label>
                      <input
                        type="number"
                        value={beamFlange || ''}
                        onChange={(e) => setBeamFlange(Math.max(1, parseFloat(e.target.value) || 0))}
                        className="w-full px-2.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-500 mb-1">Web T (mm)</label>
                      <input
                        type="number"
                        value={beamWebT || ''}
                        onChange={(e) => setBeamWebT(Math.max(1, parseFloat(e.target.value) || 0))}
                        className="w-full px-2.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-500 mb-1">Flange T (mm)</label>
                      <input
                        type="number"
                        value={beamFlangeT || ''}
                        onChange={(e) => setBeamFlangeT(Math.max(1, parseFloat(e.target.value) || 0))}
                        className="w-full px-2.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 7. SHS & RHS Hollow Tubes */}
            {shape === 'shs_square_tube' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">Outer Side (mm)</label>
                  <input
                    type="number"
                    value={shsSide || ''}
                    onChange={(e) => setShsSide(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">Wall Thickness (mm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={shsThick || ''}
                    onChange={(e) => setShsThick(Math.max(0.5, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {shape === 'rhs_rect_tube' && (
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">Width (mm)</label>
                  <input
                    type="number"
                    value={rhsWidth || ''}
                    onChange={(e) => setRhsWidth(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">Height (mm)</label>
                  <input
                    type="number"
                    value={rhsHeight || ''}
                    onChange={(e) => setRhsHeight(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">Thickness (mm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={rhsThick || ''}
                    onChange={(e) => setRhsThick(Math.max(0.5, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* 8. Circular Pipes */}
            {shape === 'pipe_round_tube' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Pipe Sizing Standard</span>
                  <div className="flex rounded-lg bg-zinc-100 dark:bg-zinc-800 p-0.5 text-xs font-bold">
                    <button
                      onClick={() => setPipeMode('nb')}
                      className={`px-2.5 py-1 rounded-md transition ${pipeMode === 'nb' ? 'bg-white dark:bg-zinc-900 text-teal-600' : 'text-zinc-500'}`}
                    >
                      IS 1239 (NB)
                    </button>
                    <button
                      onClick={() => setPipeMode('custom')}
                      className={`px-2.5 py-1 rounded-md transition ${pipeMode === 'custom' ? 'bg-white dark:bg-zinc-900 text-teal-600' : 'text-zinc-500'}`}
                    >
                      Custom OD / Thick
                    </button>
                  </div>
                </div>

                {pipeMode === 'nb' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">
                        Nominal Bore (NB)
                      </label>
                      <select
                        value={pipeNBIndex}
                        onChange={(e) => setPipeNBIndex(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      >
                        {PIPE_NB_PRESETS.map((p, idx) => (
                          <option key={idx} value={idx}>
                            NB {p.nb}mm ({p.inch}) - OD {p.od}mm
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">
                        Pipe Class (IS 1239)
                      </label>
                      <select
                        value={pipeClass}
                        onChange={(e) => setPipeClass(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      >
                        <option value="lightA">Class A (Light / Yellow)</option>
                        <option value="mediumB">Class B (Medium / Blue - Std)</option>
                        <option value="heavyC">Class C (Heavy / Red)</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">Outer Diameter (mm)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={pipeOD || ''}
                        onChange={(e) => setPipeOD(Math.max(1, parseFloat(e.target.value) || 0))}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">Wall Thickness (mm)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={pipeThick || ''}
                        onChange={(e) => setPipeThick(Math.max(0.5, parseFloat(e.target.value) || 0))}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 9. Solid Square & Hex */}
            {shape === 'round' && (
              <div>
                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">Bar Diameter (mm)</label>
                <input
                  type="number"
                  value={tmtDia || ''}
                  onChange={(e) => setTmtDia(Math.max(1, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            )}

            {shape === 'square_bar' && (
              <div>
                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">Side Dimension (mm)</label>
                <input
                  type="number"
                  value={solidSquareSide || ''}
                  onChange={(e) => setSolidSquareSide(Math.max(1, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            )}

            {shape === 'hex_bar' && (
              <div>
                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">Across Flats Size (mm)</label>
                <input
                  type="number"
                  value={solidHexAF || ''}
                  onChange={(e) => setSolidHexAF(Math.max(1, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Piece Length & Quantity (Unless Plate or TMT Bundle Mode) */}
          {shape !== 'plate' && shape !== 'chequered_plate' && !(shape === 'tmt' && tmtBundleMode === 'bundles') && (
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Length per Piece</label>
                  <div className="flex rounded-md bg-zinc-100 dark:bg-zinc-800 p-0.5 text-[10px] font-bold">
                    <button
                      onClick={() => setLengthUnit('m')}
                      className={`px-1.5 py-0.5 rounded transition ${lengthUnit === 'm' ? 'bg-white dark:bg-zinc-900 text-teal-600' : 'text-zinc-400'}`}
                    >
                      Meters
                    </button>
                    <button
                      onClick={() => setLengthUnit('ft')}
                      className={`px-1.5 py-0.5 rounded transition ${lengthUnit === 'ft' ? 'bg-white dark:bg-zinc-900 text-teal-600' : 'text-zinc-400'}`}
                    >
                      Feet
                    </button>
                  </div>
                </div>
                <input
                  type="number"
                  step="0.1"
                  value={length || ''}
                  onChange={(e) => setLength(Math.max(0.1, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">
                  Quantity / Pieces
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity || ''}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Pricing & GST Configuration */}
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-zinc-500 mb-1">Steel Rate (₹/kg)</label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-xs font-bold text-zinc-400">₹</span>
                <input
                  type="number"
                  value={ratePerKg || ''}
                  onChange={(e) => handleRateChange(parseFloat(e.target.value) || 0)}
                  className="w-full pl-6 pr-2 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-500 mb-1">GST Tax (%)</label>
              <select
                value={gstPercent}
                onChange={(e) => setGstPercent(parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold focus:outline-none"
              >
                <option value={18}>18% GST (Standard)</option>
                <option value={12}>12% GST</option>
                <option value={5}>5% GST</option>
                <option value={0}>0% (Ex-GST)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-500 mb-1">Wastage / Scrap</label>
              <select
                value={wastageBuffer}
                onChange={(e) => setWastageBuffer(parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold focus:outline-none"
              >
                <option value={0}>0% Exact</option>
                <option value={3}>+3% Standard</option>
                <option value={5}>+5% High Scrap</option>
                <option value={8}>+8% Cutting Loss</option>
              </select>
            </div>
          </div>

          {/* Add to Takeoff / Indent Button */}
          <button
            type="button"
            onClick={handleAddToTakeoff}
            className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add this Section to Steel Takeoff List</span>
          </button>
        </div>

        {/* Right Output: Results & Summary (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Primary Weight Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/20 border border-teal-200 dark:border-teal-800/80 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  Total Steel Weight
                </span>
                <div className="text-3xl font-black text-zinc-900 dark:text-white mt-1 font-mono tracking-tight">
                  {activeCalc.totalWeightKg.toLocaleString()}{' '}
                  <span className="text-lg font-bold text-teal-600">kg</span>
                </div>
              </div>

              <button
                onClick={copyReport}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Metric Conversions Pills */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-teal-100 dark:border-teal-900/40">
                <span className="text-[10px] text-zinc-400 block font-semibold">Tonnes (MT)</span>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 font-mono">
                  {activeCalc.totalWeightTonnes} MT
                </span>
              </div>
              <div className="p-2 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-teal-100 dark:border-teal-900/40">
                <span className="text-[10px] text-zinc-400 block font-semibold">Quintals</span>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 font-mono">
                  {activeCalc.totalWeightQuintals} Q
                </span>
              </div>
              <div className="p-2 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-teal-100 dark:border-teal-900/40">
                <span className="text-[10px] text-zinc-400 block font-semibold">Pounds (lbs)</span>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 font-mono">
                  {activeCalc.totalWeightLbs.toLocaleString()} lbs
                </span>
              </div>
            </div>

            {/* Estimated Procurement Cost */}
            <div className="pt-3 border-t border-teal-200/60 dark:border-teal-800/60 flex justify-between items-baseline">
              <div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                  Est. Material Cost
                </span>
                <span className="text-xl font-black text-teal-700 dark:text-teal-300 font-mono">
                  ₹{activeCalc.totalEstimatedCost.toLocaleString('en-IN')}
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 font-medium">
                ₹{ratePerKg}/kg + {gstPercent}% GST
              </span>
            </div>
          </div>

          {/* Section Engineering Details Card */}
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
              <span>Section Specifications</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500">Unit Weight</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">
                  {activeCalc.weightPerM} kg/m
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500">Weight per Piece</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">
                  {activeCalc.weightPerPcKg} kg ({activeCalc.lenMeters}m)
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500">Total Running Length</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">
                  {(activeCalc.lenMeters * activeCalc.actualQty).toFixed(2)} meters
                </span>
              </div>

              {activeCalc.tmtBundleBreakdown && (
                <div className="p-2.5 rounded-xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-900/40 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 dark:text-teal-400 block">
                    TMT Factory Bundle Breakdown
                  </span>
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span>Full Bundles:</span>
                    <span className="text-teal-700 dark:text-teal-300 font-mono font-bold">
                      {activeCalc.tmtBundleBreakdown.fullBundles} Bundles
                    </span>
                  </div>
                  {activeCalc.tmtBundleBreakdown.loosePcs > 0 && (
                    <div className="flex justify-between text-[11px] font-semibold">
                      <span>Loose Pieces:</span>
                      <span className="text-teal-700 dark:text-teal-300 font-mono font-bold">
                        {activeCalc.tmtBundleBreakdown.loosePcs} pcs
                      </span>
                    </div>
                  )}
                  <div className="text-[10px] text-zinc-400 pt-1">
                    Standard trade packaging for Ø{tmtDia}mm is {activeCalc.tmtBundleBreakdown.pcsPerBundle} bars/bundle (~{activeCalc.tmtBundleBreakdown.bundleWeightKg} kg).
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Item Steel Takeoff / Bill of Materials (BOM) Table */}
      {takeoffList.length > 0 && (
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Steel Takeoff & Combined Procurement Schedule ({takeoffList.length} Items)
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearTakeoff}
                className="text-xs text-red-500 hover:text-red-600 font-semibold px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2 px-3">#</th>
                  <th className="py-2 px-3">Section Description</th>
                  <th className="py-2 px-3">Grade</th>
                  <th className="py-2 px-3">Length</th>
                  <th className="py-2 px-3">Qty</th>
                  <th className="py-2 px-3">Unit Wt (kg/m)</th>
                  <th className="py-2 px-3">Total Weight</th>
                  <th className="py-2 px-3">Est. Cost</th>
                  <th className="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-medium">
                {takeoffList.map((it, idx) => (
                  <tr key={it.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition">
                    <td className="py-2.5 px-3 font-mono text-zinc-400">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-bold text-zinc-800 dark:text-zinc-200">{it.specs}</td>
                    <td className="py-2.5 px-3 text-zinc-500">{it.grade}</td>
                    <td className="py-2.5 px-3 font-mono">{it.lengthDisplay}</td>
                    <td className="py-2.5 px-3 font-bold text-teal-600 font-mono">{it.quantity}</td>
                    <td className="py-2.5 px-3 font-mono text-zinc-500">{it.weightPerMeter}</td>
                    <td className="py-2.5 px-3 font-bold font-mono text-zinc-900 dark:text-white">
                      {it.totalWeightKg.toLocaleString()} kg
                    </td>
                    <td className="py-2.5 px-3 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      ₹{it.cost.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleRemoveTakeoffItem(it.id)}
                        className="p-1 rounded text-zinc-400 hover:text-red-500 transition"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Combined Takeoff Summary Bar */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full sm:w-auto text-left">
              <div>
                <span className="text-[10px] text-zinc-400 block font-semibold">Total Steel Weight</span>
                <span className="text-base font-black text-teal-600 font-mono">
                  {takeoffSummary.totalKg.toLocaleString()} kg
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block font-semibold">Metric Tonnes</span>
                <span className="text-base font-black text-zinc-800 dark:text-zinc-200 font-mono">
                  {takeoffSummary.totalTonnes} MT
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block font-semibold">Total Pieces</span>
                <span className="text-base font-black text-zinc-800 dark:text-zinc-200 font-mono">
                  {takeoffSummary.totalPcs} Pcs
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block font-semibold">Total Budget</span>
                <span className="text-base font-black text-emerald-600 font-mono">
                  ₹{takeoffSummary.totalCost.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={generatePDF}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download BOQ Schedule</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Indian BIS Standard TMT Weight Reference Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600">
            <Layers className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
            Quick Reference: Standard Indian TMT Rebar Weight Chart (IS 1786)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2 px-3">Diameter (mm)</th>
                <th className="py-2 px-3">Weight (kg/m) [D²/162]</th>
                <th className="py-2 px-3">Weight (kg/ft) [D²/533]</th>
                <th className="py-2 px-3">Standard 12m Bar (kg)</th>
                <th className="py-2 px-3">Bars per Bundle</th>
                <th className="py-2 px-3">Bundle Weight (kg)</th>
                <th className="py-2 px-3">Cross-Section Area (mm²)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-medium">
              {Object.values(TMT_REBAR_DATA).map((item) => (
                <tr key={item.dia} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition">
                  <td className="py-2 px-3 font-bold text-teal-600">{item.dia} mm</td>
                  <td className="py-2 px-3 font-mono font-semibold">{item.weightPerMeter} kg/m</td>
                  <td className="py-2 px-3 font-mono text-zinc-500">{(item.weightPerMeter / 3.28084).toFixed(3)} kg/ft</td>
                  <td className="py-2 px-3 font-mono font-bold text-zinc-800 dark:text-zinc-200">{item.weightPer12m} kg</td>
                  <td className="py-2 px-3 font-mono text-zinc-600 dark:text-zinc-400">{item.pcsPerBundle} pcs</td>
                  <td className="py-2 px-3 font-mono font-bold text-emerald-600">{item.bundleWeight} kg</td>
                  <td className="py-2 px-3 font-mono text-zinc-400">{item.areaSqMm} mm²</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historical Price Trend Graph */}
      <MaterialTrendGraph allowedMaterials={['steel']} defaultMaterial="steel" title="Structural Steel Price Trends (5-Year Historical Index)" />
    </div>
  );
}

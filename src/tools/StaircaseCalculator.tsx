import { useState, useMemo } from 'react';
import {
  Compass, Copy, Check, RotateCcw,
  Layers, ShieldCheck, AlertTriangle, CheckCircle2,
  FileSpreadsheet, FileText, Info, Wrench, Grid,
  Eye, Sparkles, Building2
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

// ============================================================================
// Types & Engineering Constants (NBC 2016 / IRC / IBC / UK Part K)
// ============================================================================

export type UnitType = 'mm' | 'cm' | 'm' | 'in' | 'ft';
export type StairType = 'straight' | 'l_shape' | 'dog_legged' | 'spiral';
export type BuildingCodeType = 'nbc_res' | 'nbc_pub' | 'irc_us' | 'ibc_us' | 'uk_part_k';
export type MaterialMode = 'rcc' | 'timber' | 'steel';

export interface BuildingCodeConfig {
  id: BuildingCodeType;
  name: string;
  region: string;
  codeRef: string;
  maxRiserMm: number;
  minRiserMm: number;
  minTreadMm: number;
  minWidthMm: number;
  minHeadroomMm: number;
  maxPitchDeg: number;
  minPitchDeg: number;
  maxRisersPerFlight: number;
  idealComfortMinMm: number; // 2R + T
  idealComfortMaxMm: number;
  description: string;
}

export const BUILDING_CODES: Record<BuildingCodeType, BuildingCodeConfig> = {
  nbc_res: {
    id: 'nbc_res',
    name: 'NBC 2016 India (Residential Dwellings)',
    region: 'India',
    codeRef: 'National Building Code of India 2016 Part 3 Cl. 12.18 / Part 4 Fire Life Safety',
    maxRiserMm: 190,
    minRiserMm: 100,
    minTreadMm: 250,
    minWidthMm: 900,
    minHeadroomMm: 2200,
    maxPitchDeg: 40,
    minPitchDeg: 25,
    maxRisersPerFlight: 15,
    idealComfortMinMm: 600,
    idealComfortMaxMm: 640,
    description: 'Mandatory standard for residential homes, bungalows, and apartments across Indian municipal bye-laws (MCGM, DDA, BBMP, HMDA). Max 190mm riser, min 250mm tread, min 900mm clear width.',
  },
  nbc_pub: {
    id: 'nbc_pub',
    name: 'NBC 2016 India (Commercial & Public Buildings)',
    region: 'India',
    codeRef: 'NBC 2016 Part 4 Fire Safety & Part 3 Accessibility Norms',
    maxRiserMm: 150,
    minRiserMm: 100,
    minTreadMm: 300,
    minWidthMm: 1500,
    minHeadroomMm: 2400,
    maxPitchDeg: 35,
    minPitchDeg: 20,
    maxRisersPerFlight: 12,
    idealComfortMinMm: 600,
    idealComfortMaxMm: 630,
    description: 'For offices, hospitals, educational institutions, malls, and public transit. Max 150mm riser, min 300mm tread, min 1500mm wide corridor stairs with mid-landings every 12 risers.',
  },
  irc_us: {
    id: 'irc_us',
    name: 'IRC 2021 / 2024 (US Residential Code)',
    region: 'USA',
    codeRef: 'International Residential Code (IRC) Section R311.7',
    maxRiserMm: 196.85, // 7.75 inches
    minRiserMm: 101.6, // 4 inches
    minTreadMm: 254, // 10.0 inches
    minWidthMm: 914.4, // 36 inches
    minHeadroomMm: 2032, // 80 inches (6 ft 8 in)
    maxPitchDeg: 42,
    minPitchDeg: 28,
    maxRisersPerFlight: 18,
    idealComfortMinMm: 609.6, // 24 in
    idealComfortMaxMm: 635.0, // 25 in
    description: 'Governs single-family homes and duplexes in the United States. Max 7 3/4" riser, min 10" tread run, min 36" clear stairway width, and min 80" continuous headroom clearance.',
  },
  ibc_us: {
    id: 'ibc_us',
    name: 'IBC 2021 / 2024 (US Commercial & Multi-Family)',
    region: 'USA',
    codeRef: 'International Building Code (IBC) Section 1011',
    maxRiserMm: 177.8, // 7.0 inches
    minRiserMm: 101.6, // 4 inches
    minTreadMm: 279.4, // 11.0 inches
    minWidthMm: 1117.6, // 44 inches
    minHeadroomMm: 2032, // 80 inches
    maxPitchDeg: 38,
    minPitchDeg: 26,
    maxRisersPerFlight: 16,
    idealComfortMinMm: 610,
    idealComfortMaxMm: 640,
    description: 'Mandatory for commercial offices, apartments, hotels, and egress stairs. Max 7" riser, min 11" tread, min 44" stair width (or 36" for occupancy < 50), min 80" headroom.',
  },
  uk_part_k: {
    id: 'uk_part_k',
    name: 'UK Building Regs Approved Document K',
    region: 'UK',
    codeRef: 'UK Building Regulations Part K (Protection from falling, collision and impact)',
    maxRiserMm: 220, // Private stair
    minRiserMm: 150,
    minTreadMm: 220,
    minWidthMm: 850,
    minHeadroomMm: 2000,
    maxPitchDeg: 42,
    minPitchDeg: 25,
    maxRisersPerFlight: 16,
    idealComfortMinMm: 550,
    idealComfortMaxMm: 700,
    description: 'UK standard for private dwellings (max 220mm riser, min 220mm going, max 42° pitch) and public utility stairs. 2R + G relationship must sit between 550mm and 700mm.',
  }
};

export const STAIR_PRESETS = [
  {
    id: 'indian_res_10ft',
    name: 'Indian Standard 10ft RCC (Dog-Legged / Straight)',
    type: 'straight' as StairType,
    unit: 'mm' as UnitType,
    riseMm: 3000,
    targetRiserMm: 157.9,
    targetTreadMm: 280,
    widthMm: 1000,
    nosingMm: 25,
    slabThickMm: 150,
    ceilingOpenMm: 2800,
    code: 'nbc_res' as BuildingCodeType,
    desc: 'Standard 3.0m (10 ft) floor-to-floor height common in Indian apartments and independent houses.'
  },
  {
    id: 'us_irc_9ft',
    name: 'US IRC 9ft Residential Straight Flight',
    type: 'straight' as StairType,
    unit: 'in' as UnitType,
    riseMm: 2743.2, // 108 inches (9 ft)
    targetRiserMm: 182.88, // 7.2 inches
    targetTreadMm: 266.7, // 10.5 inches
    widthMm: 914.4, // 36 inches
    nosingMm: 25.4, // 1 inch
    slabThickMm: 254, // 10 inch floor joist
    ceilingOpenMm: 2743.2,
    code: 'irc_us' as BuildingCodeType,
    desc: 'Standard 9ft ceiling height framed with 2x12 timber stringers compliant with US IRC.'
  },
  {
    id: 'commercial_12ft',
    name: 'Commercial High-Traffic 12ft Public Stair',
    type: 'straight' as StairType,
    unit: 'mm' as UnitType,
    riseMm: 3600,
    targetRiserMm: 150,
    targetTreadMm: 300,
    widthMm: 1500,
    nosingMm: 25,
    slabThickMm: 200,
    ceilingOpenMm: 3600,
    code: 'nbc_pub' as BuildingCodeType,
    desc: 'Low fatigue 150mm riser with deep 300mm tread, engineered for schools, hospitals, and transit hubs.'
  },
  {
    id: 'spiral_luxury',
    name: 'Circular Spiral / Helical Staircase',
    type: 'spiral' as StairType,
    unit: 'mm' as UnitType,
    riseMm: 2800,
    targetRiserMm: 175,
    targetTreadMm: 260,
    widthMm: 800,
    nosingMm: 20,
    slabThickMm: 150,
    ceilingOpenMm: 1800,
    code: 'nbc_res' as BuildingCodeType,
    desc: 'Space-saving architectural circular staircase with central steel/RCC column.'
  },
  {
    id: 'compact_attic',
    name: 'Compact Attic / Mezzanine Space-Saver',
    type: 'straight' as StairType,
    unit: 'mm' as UnitType,
    riseMm: 2400,
    targetRiserMm: 184.6,
    targetTreadMm: 230,
    widthMm: 750,
    nosingMm: 25,
    slabThickMm: 150,
    ceilingOpenMm: 2200,
    code: 'uk_part_k' as BuildingCodeType,
    desc: 'Steeper pitch design optimized for tight floorplans, lofts, and duplex mezzanine lofts.'
  }
];

// Helper to convert mm into current display unit
function formatDim(valMm: number, unit: UnitType, showUnit = true, precision = 1): string {
  if (isNaN(valMm) || valMm === undefined) return '-';
  let numStr = '';
  let label = unit;
  
  switch (unit) {
    case 'mm':
      numStr = Math.round(valMm).toString();
      label = 'mm';
      break;
    case 'cm':
      numStr = (valMm / 10).toFixed(precision);
      label = 'cm';
      break;
    case 'm':
      numStr = (valMm / 1000).toFixed(Math.max(2, precision));
      label = 'm';
      break;
    case 'in':
      numStr = (valMm / 25.4).toFixed(precision);
      label = 'in';
      break;
    case 'ft':
      numStr = (valMm / 304.8).toFixed(2);
      label = 'ft';
      break;
  }
  return showUnit ? `${numStr} ${label}` : numStr;
}

// Helper to convert imperial inches to nearest 1/16" fraction
function toFractionInches(inches: number): string {
  if (isNaN(inches)) return '-';
  const whole = Math.floor(inches);
  const remainder = inches - whole;
  const sixteenths = Math.round(remainder * 16);
  if (sixteenths === 0) return `${whole}"`;
  if (sixteenths === 16) return `${whole + 1}"`;
  
  let num = sixteenths;
  let den = 16;
  while (num % 2 === 0 && den % 2 === 0) {
    num /= 2;
    den /= 2;
  }
  return whole > 0 ? `${whole} ${num}/${den}"` : `${num}/${den}"`;
}

// Helper to convert from active unit to internal mm
function toMm(value: number, unit: UnitType): number {
  switch (unit) {
    case 'mm': return value;
    case 'cm': return value * 10;
    case 'm': return value * 1000;
    case 'in': return value * 25.4;
    case 'ft': return value * 304.8;
  }
}

export default function StaircaseCalculator() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'blueprint' | 'compliance' | 'stringer' | 'boq' | 'multitype'>('blueprint');

  // Active preset tracker
  const [activePresetId, setActivePresetId] = useState<string | null>('indian_res_10ft');

  // Core configuration states (Internal store in Millimeters)
  const [unit, setUnit] = useState<UnitType>('mm');
  const [stairType, setStairType] = useState<StairType>('straight');
  const [selectedCode, setSelectedCode] = useState<BuildingCodeType>('nbc_res');
  const [materialMode, setMaterialMode] = useState<MaterialMode>('rcc');

  // Geometric Inputs (in mm)
  const [totalRiseMm, setTotalRiseMm] = useState<number>(3000); // 3m / 10 ft
  const [targetRiserMm, setTargetRiserMm] = useState<number>(166.7); // ~6.5 in
  const [targetTreadMm, setTargetTreadMm] = useState<number>(280); // ~11 in
  const [stairWidthMm, setStairWidthMm] = useState<number>(1000); // 1.0 m (39.4 in)
  const [nosingMm, setNosingMm] = useState<number>(25); // 1 in
  const [treadThickMm, setTreadThickMm] = useState<number>(30); // 1.2 in
  const [waistThickMm, setWaistThickMm] = useState<number>(150); // 6 in RCC waist slab
  const [slabThickMm, setSlabThickMm] = useState<number>(150); // Upper floor slab
  const [ceilingOpenMm, setCeilingOpenMm] = useState<number>(2800); // Floor opening length
  const [flushTopStep, setFlushTopStep] = useState<boolean>(true); // Top step flush with upper landing

  // Multi-flight & Landing parameters
  const [landingLengthMm, setLandingLengthMm] = useState<number>(1000);
  const [flight1RiserCount, setFlight1RiserCount] = useState<number>(9);

  // Spiral staircase parameters
  const [spiralOuterDiameterMm, setSpiralOuterDiameterMm] = useState<number>(1800);
  const [spiralCenterPostMm, setSpiralCenterPostMm] = useState<number>(150);
  const [spiralAngleDeg, setSpiralAngleDeg] = useState<number>(360);

  // Cost & Material rates
  const [currencySymbol, setCurrencySymbol] = useState<string>('₹');
  const [rccConcreteRatePerM3, setRccConcreteRatePerM3] = useState<number>(6500);
  const [rebarRatePerKg, setRebarRatePerKg] = useState<number>(75);
  const [formworkRatePerM2, setFormworkRatePerM2] = useState<number>(450);
  const [tilingRatePerM2, setTilingRatePerM2] = useState<number>(950);
  const [railingRatePerM, setRailingRatePerM] = useState<number>(1800);
  
  // Timber material rates
  const [timberStringerRatePerPiece, setTimberStringerRatePerPiece] = useState<number>(2200);
  const [timberTreadRatePerPiece, setTimberTreadRatePerPiece] = useState<number>(950);
  const [timberRiserRatePerPiece, setTimberRiserRatePerPiece] = useState<number>(450);
  const [timberBalusterRatePerPiece, setTimberBalusterRatePerPiece] = useState<number>(250);

  // Blueprint view options
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const [showBlueprintGrid, setShowBlueprintGrid] = useState<boolean>(true);
  const [showHeadroomRay, setShowHeadroomRay] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  // Active Building Code rules
  const activeCode = BUILDING_CODES[selectedCode];

  // ============================================================================
  // Core Stair Geometry Calculations
  // ============================================================================
  const geo = useMemo(() => {
    const rise = Math.max(100, totalRiseMm);
    const targetR = Math.max(50, targetRiserMm);
    const targetT = Math.max(100, targetTreadMm);

    // 1. Risers count (nearest integer)
    const numRisers = Math.max(1, Math.round(rise / targetR));
    const actualRiserMm = rise / numRisers;

    // 2. Treads count (flush with top floor = numRisers - 1, or dropped = numRisers)
    const numTreads = flushTopStep ? Math.max(1, numRisers - 1) : numRisers;
    const actualTreadMm = targetT;
    const totalRunMm = numTreads * actualTreadMm;

    // 3. Stringer length (Hypotenuse)
    const stringerLengthMm = Math.sqrt(Math.pow(rise, 2) + Math.pow(totalRunMm, 2));

    // 4. Incline Pitch Angle (deg)
    const angleRad = Math.atan(actualRiserMm / actualTreadMm);
    const pitchAngleDeg = (angleRad * 180) / Math.PI;

    // 5. Ergonomic Formulas & Comfort Metrics
    // Blondel's Comfort Formula: 2R + T
    const blondelMm = 2 * actualRiserMm + actualTreadMm;
    const blondelIdealMm = 630; // 63 cm / 24.5 in
    const blondelDiff = Math.abs(blondelMm - blondelIdealMm);
    const comfortScorePct = Math.max(0, Math.min(100, Math.round(100 - (blondelDiff / 60) * 100)));

    // Stride Safety Rule: R + T (Ideal 430 - 460 mm / 17 - 18 in)
    const strideMm = actualRiserMm + actualTreadMm;

    // Grip Rule: R * T (Ideal 450 - 485 cm2 / 70 - 75 sq in)
    const gripCm2 = (actualRiserMm / 10) * (actualTreadMm / 10);

    // 6. Headroom Clearance Check
    let headroomClearanceMm = 9999;
    let headroomPass = true;
    if (ceilingOpenMm < totalRunMm) {
      const coveredRunMm = totalRunMm - ceilingOpenMm;
      const stairElevationAtHeaderMm = rise - (coveredRunMm * (actualRiserMm / actualTreadMm));
      headroomClearanceMm = (rise - slabThickMm) - stairElevationAtHeaderMm;
      if (headroomClearanceMm < activeCode.minHeadroomMm) {
        headroomPass = false;
      }
    } else {
      headroomClearanceMm = Math.max(activeCode.minHeadroomMm + 500, 3000);
    }

    // 7. Stringer Throat Depth (for wood / RCC structural shear)
    const stringerThroatMm = waistThickMm;

    // 8. Carpenter Bottom Riser Cut Adjustment
    const bottomRiserCutMm = Math.max(0, actualRiserMm - treadThickMm);

    // 9. Step-by-Step Layout Points (for framing layout)
    const stepPoints = [];
    for (let i = 1; i <= numRisers; i++) {
      const stepRiseY = i * actualRiserMm;
      const stepRunX = Math.min((i - 1) * actualTreadMm, totalRunMm);
      const hypPointMm = Math.sqrt(Math.pow(stepRiseY, 2) + Math.pow(stepRunX, 2));
      stepPoints.push({
        stepNum: i,
        stepRiseY,
        stepRunX,
        hypPointMm,
        isLanding: false,
      });
    }

    // 10. Multi-flight & L-Shape / Dog-Legged distribution
    const f1Risers = Math.max(1, Math.min(flight1RiserCount, numRisers - 1));
    const f2Risers = numRisers - f1Risers;
    const f1RunMm = Math.max(0, f1Risers - 1) * actualTreadMm;
    const f2RunMm = Math.max(0, f2Risers - 1) * actualTreadMm;
    const dogLeggedStairwellLengthMm = Math.max(f1RunMm, f2RunMm) + landingLengthMm;
    const dogLeggedStairwellWidthMm = (stairWidthMm * 2) + 150; // with 150mm well gap

    // 11. Spiral Staircase Calculations
    const spiralRadiusMm = spiralOuterDiameterMm / 2;
    const spiralCenterRadiusMm = spiralCenterPostMm / 2;
    const spiralWalklineRadiusMm = spiralCenterRadiusMm + ((spiralRadiusMm - spiralCenterRadiusMm) * 0.6); // 60% from center
    const spiralCircumferenceMm = 2 * Math.PI * spiralRadiusMm * (spiralAngleDeg / 360);
    const spiralWalklineCircumferenceMm = 2 * Math.PI * spiralWalklineRadiusMm * (spiralAngleDeg / 360);
    const spiralInnerCircumferenceMm = 2 * Math.PI * spiralCenterRadiusMm * (spiralAngleDeg / 360);
    
    const spiralTreadOuterMm = spiralCircumferenceMm / numRisers;
    const spiralTreadWalklineMm = spiralWalklineCircumferenceMm / numRisers;
    const spiralTreadInnerMm = spiralInnerCircumferenceMm / numRisers;
    const degreesPerTread = spiralAngleDeg / numRisers;

    return {
      numRisers,
      actualRiserMm,
      numTreads,
      actualTreadMm,
      totalRunMm,
      stringerLengthMm,
      pitchAngleDeg,
      blondelMm,
      comfortScorePct,
      strideMm,
      gripCm2,
      headroomClearanceMm,
      headroomPass,
      stringerThroatMm,
      bottomRiserCutMm,
      stepPoints,
      f1Risers,
      f2Risers,
      f1RunMm,
      f2RunMm,
      dogLeggedStairwellLengthMm,
      dogLeggedStairwellWidthMm,
      spiralRadiusMm,
      spiralWalklineRadiusMm,
      spiralTreadOuterMm,
      spiralTreadWalklineMm,
      spiralTreadInnerMm,
      degreesPerTread,
    };
  }, [
    totalRiseMm, targetRiserMm, targetTreadMm, stairWidthMm,
    flushTopStep, ceilingOpenMm, slabThickMm, waistThickMm,
    treadThickMm, flight1RiserCount, landingLengthMm,
    spiralOuterDiameterMm, spiralCenterPostMm, spiralAngleDeg,
    activeCode
  ]);

  // ============================================================================
  // Code Compliance Evaluation Engine
  // ============================================================================
  const compliance = useMemo(() => {
    const checks = [
      {
        id: 'riser_max',
        name: 'Maximum Riser Height',
        actual: `${geo.actualRiserMm.toFixed(1)} mm (${toFractionInches(geo.actualRiserMm / 25.4)})`,
        limit: `Max ${activeCode.maxRiserMm} mm (${toFractionInches(activeCode.maxRiserMm / 25.4)})`,
        passed: geo.actualRiserMm <= activeCode.maxRiserMm,
        warning: geo.actualRiserMm > activeCode.maxRiserMm,
        message: geo.actualRiserMm <= activeCode.maxRiserMm
          ? 'Complies with maximum allowable step riser height.'
          : `Exceeds maximum allowable height by ${(geo.actualRiserMm - activeCode.maxRiserMm).toFixed(1)} mm. Risk of tripping.`
      },
      {
        id: 'riser_min',
        name: 'Minimum Riser Height',
        actual: `${geo.actualRiserMm.toFixed(1)} mm`,
        limit: `Min ${activeCode.minRiserMm} mm`,
        passed: geo.actualRiserMm >= activeCode.minRiserMm,
        warning: geo.actualRiserMm < activeCode.minRiserMm,
        message: geo.actualRiserMm >= activeCode.minRiserMm
          ? 'Step riser is high enough to register as a distinct step.'
          : 'Step riser is too shallow. May cause shuffling accidents.'
      },
      {
        id: 'tread_min',
        name: 'Minimum Tread Depth (Going)',
        actual: `${geo.actualTreadMm.toFixed(1)} mm (${toFractionInches(geo.actualTreadMm / 25.4)})`,
        limit: `Min ${activeCode.minTreadMm} mm (${toFractionInches(activeCode.minTreadMm / 25.4)})`,
        passed: geo.actualTreadMm >= activeCode.minTreadMm,
        warning: geo.actualTreadMm < activeCode.minTreadMm,
        message: geo.actualTreadMm >= activeCode.minTreadMm
          ? 'Ample horizontal surface for adult foot placement.'
          : `Below minimum safe depth. Increase tread by at least ${(activeCode.minTreadMm - geo.actualTreadMm).toFixed(1)} mm.`
      },
      {
        id: 'pitch_angle',
        name: 'Stair Pitch (Incline Angle)',
        actual: `${geo.pitchAngleDeg.toFixed(1)}°`,
        limit: `${activeCode.minPitchDeg}° to ${activeCode.maxPitchDeg}°`,
        passed: geo.pitchAngleDeg >= activeCode.minPitchDeg && geo.pitchAngleDeg <= activeCode.maxPitchDeg,
        warning: geo.pitchAngleDeg < activeCode.minPitchDeg || geo.pitchAngleDeg > activeCode.maxPitchDeg,
        message: geo.pitchAngleDeg >= activeCode.minPitchDeg && geo.pitchAngleDeg <= activeCode.maxPitchDeg
          ? 'Slope angle is within the safe ergonomic walking envelope.'
          : geo.pitchAngleDeg > activeCode.maxPitchDeg
            ? 'Staircase is too steep. Difficult for elderly occupants and children.'
            : 'Staircase is too flat. Takes excessive floor area; consider a ramp.'
      },
      {
        id: 'stair_width',
        name: 'Clear Staircase Width',
        actual: `${stairWidthMm} mm (${(stairWidthMm / 25.4).toFixed(1)}")`,
        limit: `Min ${activeCode.minWidthMm} mm (${(activeCode.minWidthMm / 25.4).toFixed(1)}")`,
        passed: stairWidthMm >= activeCode.minWidthMm,
        warning: stairWidthMm < activeCode.minWidthMm,
        message: stairWidthMm >= activeCode.minWidthMm
          ? 'Sufficient egress width for two-way passing and furniture moving.'
          : `Width is restricted. Code requires at least ${activeCode.minWidthMm} mm clear passage.`
      },
      {
        id: 'headroom',
        name: 'Continuous Headroom Clearance',
        actual: geo.headroomClearanceMm > 5000 ? 'Fully Open Overhead' : `${Math.round(geo.headroomClearanceMm)} mm (${(geo.headroomClearanceMm / 25.4).toFixed(1)}")`,
        limit: `Min ${activeCode.minHeadroomMm} mm (${(activeCode.minHeadroomMm / 25.4).toFixed(1)}")`,
        passed: geo.headroomPass,
        warning: !geo.headroomPass,
        message: geo.headroomPass
          ? 'Safe vertical ceiling clearance. No risk of head collision.'
          : `Severe headroom violation! Enlarge ceiling opening by ${(activeCode.minHeadroomMm - geo.headroomClearanceMm).toFixed(0)} mm.`
      },
      {
        id: 'flight_risers',
        name: 'Max Risers Per Continuous Flight',
        actual: `${geo.numRisers} Risers`,
        limit: `Max ${activeCode.maxRisersPerFlight} Risers`,
        passed: geo.numRisers <= activeCode.maxRisersPerFlight,
        warning: geo.numRisers > activeCode.maxRisersPerFlight,
        message: geo.numRisers <= activeCode.maxRisersPerFlight
          ? 'Flight length is safe without causing fatigue.'
          : `Exceeds ${activeCode.maxRisersPerFlight} risers. Code requires an intermediate landing.`
      },
      {
        id: 'blondel_comfort',
        name: 'Blondel Comfort Rule (2R + T)',
        actual: `${geo.blondelMm.toFixed(1)} mm (${(geo.blondelMm / 25.4).toFixed(1)}")`,
        limit: `${activeCode.idealComfortMinMm} to ${activeCode.idealComfortMaxMm} mm`,
        passed: geo.blondelMm >= activeCode.idealComfortMinMm && geo.blondelMm <= activeCode.idealComfortMaxMm,
        warning: geo.blondelMm < activeCode.idealComfortMinMm || geo.blondelMm > activeCode.idealComfortMaxMm,
        message: geo.blondelMm >= activeCode.idealComfortMinMm && geo.blondelMm <= activeCode.idealComfortMaxMm
          ? 'Ideal walking rhythm matching standard human stride mechanics.'
          : 'Slightly off-stride. Walkers may experience unnatural step pacing.'
      }
    ];

    const failedCount = checks.filter(c => !c.passed).length;
    const overallStatus = failedCount === 0 ? 'fully_compliant' : failedCount <= 2 ? 'warning' : 'non_compliant';

    return {
      checks,
      failedCount,
      overallStatus
    };
  }, [geo, activeCode, stairWidthMm]);

  // ============================================================================
  // Bill of Quantities (BOQ) & Cost Estimation
  // ============================================================================
  const boq = useMemo(() => {
    const widthM = stairWidthMm / 1000;
    const riseM = totalRiseMm / 1000;
    const runM = geo.totalRunMm / 1000;
    const hypotenuseM = geo.stringerLengthMm / 1000;
    const waistM = waistThickMm / 1000;
    const landingM = landingLengthMm / 1000;

    // 1. RCC Concrete Volume Calculations
    const waistSlabVolM3 = widthM * waistM * hypotenuseM;
    const singleStepTriangleVolM3 = 0.5 * (geo.actualRiserMm / 1000) * (geo.actualTreadMm / 1000) * widthM;
    const stepsVolM3 = geo.numRisers * singleStepTriangleVolM3;
    const landingVolM3 = (stairType === 'l_shape' || stairType === 'dog_legged') ? widthM * landingM * waistM : 0;
    const totalConcreteM3 = waistSlabVolM3 + stepsVolM3 + landingVolM3;
    const totalConcreteCuFt = totalConcreteM3 * 35.3147;

    // Materials breakdown (Nominal M20 grade 1:1.5:3 mix)
    const cementBags = Math.ceil(totalConcreteM3 * 8.4);
    const sandM3 = Number((totalConcreteM3 * 0.425).toFixed(2));
    const sandTons = Number((sandM3 * 1.6).toFixed(2));
    const aggregateM3 = Number((totalConcreteM3 * 0.85).toFixed(2));
    const aggregateTons = Number((aggregateM3 * 1.6).toFixed(2));
    const rebarKg = Math.ceil(totalConcreteM3 * 105);

    // Formwork area
    const soffitFormworkM2 = hypotenuseM * widthM;
    const riserFaceFormworkM2 = geo.numRisers * (geo.actualRiserMm / 1000) * widthM;
    const sideFormworkM2 = 2 * (0.5 * riseM * runM + (hypotenuseM * waistM));
    const landingFormworkM2 = (stairType === 'l_shape' || stairType === 'dog_legged') ? (widthM * landingM) : 0;
    const totalFormworkM2 = Number((soffitFormworkM2 + riserFaceFormworkM2 + sideFormworkM2 + landingFormworkM2).toFixed(2));
    const totalFormworkSqFt = Number((totalFormworkM2 * 10.7639).toFixed(1));

    // Cladding (Granite / Vitrified Tiles with 10% wastage)
    const treadsAreaM2 = geo.numTreads * (geo.actualTreadMm / 1000) * widthM;
    const risersAreaM2 = geo.numRisers * (geo.actualRiserMm / 1000) * widthM;
    const landingAreaM2 = (stairType === 'l_shape' || stairType === 'dog_legged') ? (widthM * landingM) : 0;
    const totalCladdingM2 = Number(((treadsAreaM2 + risersAreaM2 + landingAreaM2) * 1.10).toFixed(2));
    const totalCladdingSqFt = Number((totalCladdingM2 * 10.7639).toFixed(1));

    // Handrail length
    const railingLengthM = Number((hypotenuseM + ((stairType === 'l_shape' || stairType === 'dog_legged') ? landingM : 0) + 0.6).toFixed(2));

    // Cost Breakdown for RCC
    const costConcrete = Math.round(totalConcreteM3 * rccConcreteRatePerM3);
    const costRebar = Math.round(rebarKg * rebarRatePerKg);
    const costFormwork = Math.round(totalFormworkM2 * formworkRatePerM2);
    const costCladding = Math.round(totalCladdingM2 * tilingRatePerM2);
    const costRailing = Math.round(railingLengthM * railingRatePerM);
    const totalRccCost = costConcrete + costRebar + costFormwork + costCladding + costRailing;

    // 2. Timber / Wood Mode Calculations
    const stringersCount = Math.max(2, Math.ceil(stairWidthMm / 400));
    const stringerBoardLengthFt = Math.ceil((geo.stringerLengthMm + 300) / 304.8);
    const treadsCount = geo.numTreads;
    const risersCount = geo.numRisers;
    const balustersCount = Math.ceil(geo.totalRunMm / 100);

    const costTimberStringers = stringersCount * timberStringerRatePerPiece;
    const costTimberTreads = treadsCount * timberTreadRatePerPiece;
    const costTimberRisers = risersCount * timberRiserRatePerPiece;
    const costTimberBalusters = balustersCount * timberBalusterRatePerPiece;
    const costTimberRailing = Math.round(railingLengthM * (railingRatePerM * 0.8));
    const totalTimberCost = costTimberStringers + costTimberTreads + costTimberRisers + costTimberBalusters + costTimberRailing;

    return {
      totalConcreteM3: Number(totalConcreteM3.toFixed(3)),
      totalConcreteCuFt: Number(totalConcreteCuFt.toFixed(1)),
      cementBags,
      sandM3,
      sandTons,
      aggregateM3,
      aggregateTons,
      rebarKg,
      totalFormworkM2,
      totalFormworkSqFt,
      totalCladdingM2,
      totalCladdingSqFt,
      railingLengthM,
      costConcrete,
      costRebar,
      costFormwork,
      costCladding,
      costRailing,
      totalRccCost,
      stringersCount,
      stringerBoardLengthFt,
      treadsCount,
      risersCount,
      balustersCount,
      costTimberStringers,
      costTimberTreads,
      costTimberRisers,
      costTimberBalusters,
      costTimberRailing,
      totalTimberCost,
    };
  }, [
    stairWidthMm, totalRiseMm, geo, waistThickMm, landingLengthMm,
    stairType, rccConcreteRatePerM3, rebarRatePerKg, formworkRatePerM2,
    tilingRatePerM2, railingRatePerM, timberStringerRatePerPiece,
    timberTreadRatePerPiece, timberRiserRatePerPiece, timberBalusterRatePerPiece
  ]);

  // ============================================================================
  // Presets & Handlers
  // ============================================================================
  const applyPreset = (presetId: string) => {
    const p = STAIR_PRESETS.find(x => x.id === presetId);
    if (!p) return;
    setActivePresetId(presetId);
    setStairType(p.type);
    setUnit(p.unit);
    setTotalRiseMm(p.riseMm);
    setTargetRiserMm(p.targetRiserMm);
    setTargetTreadMm(p.targetTreadMm);
    setStairWidthMm(p.widthMm);
    setNosingMm(p.nosingMm);
    setSlabThickMm(p.slabThickMm);
    setCeilingOpenMm(p.ceilingOpenMm);
    setSelectedCode(p.code);
  };

  const handleReset = () => {
    applyPreset('indian_res_10ft');
  };

  const copyReport = () => {
    const reportText = `=====================================================
TOOLIQUE STAIRCASE GEOMETRY & COMPLIANCE REPORT
Generated: ${new Date().toLocaleDateString()} | Unit: ${unit.toUpperCase()}
=====================================================

1. STAIRCASE SPECIFICATIONS
-----------------------------------------------------
• Stair Configuration   : ${stairType.replace('_', ' ').toUpperCase()}
• Building Code Profile : ${activeCode.name}
• Total Floor Rise (H)  : ${formatDim(totalRiseMm, unit)} (${(totalRiseMm / 304.8).toFixed(2)} ft)
• Stair Clear Width     : ${formatDim(stairWidthMm, unit)}
• Ceiling Well Opening  : ${formatDim(ceilingOpenMm, unit)}
• Upper Floor Slab      : ${formatDim(slabThickMm, unit)}

2. CALCULATED GEOMETRIC RESULTS
-----------------------------------------------------
• Total Number of Risers: ${geo.numRisers} Steps
• Actual Riser Height   : ${formatDim(geo.actualRiserMm, unit)} (${toFractionInches(geo.actualRiserMm / 25.4)})
• Number of Treads      : ${geo.numTreads} Treads
• Actual Tread Going (T): ${formatDim(geo.actualTreadMm, unit)} (${toFractionInches(geo.actualTreadMm / 25.4)})
• Total Horizontal Run  : ${formatDim(geo.totalRunMm, unit)} (${(geo.totalRunMm / 304.8).toFixed(2)} ft)
• Stringer Hypotenuse   : ${formatDim(geo.stringerLengthMm, unit)} (${(geo.stringerLengthMm / 304.8).toFixed(2)} ft)
• Stair Pitch Slope     : ${geo.pitchAngleDeg.toFixed(1)}° (${geo.pitchAngleDeg <= 38 ? 'Ideal Walkable' : 'Steep'})
• Headroom Clearance    : ${formatDim(geo.headroomClearanceMm, unit)} [${geo.headroomPass ? 'PASSED' : 'VIOLATION'}]

3. ERGONOMIC & COMFORT METRICS
-----------------------------------------------------
• Blondel's Rule (2R+T) : ${formatDim(geo.blondelMm, unit)} (Comfort Score: ${geo.comfortScorePct}%)
• Safety Stride (R+T)   : ${formatDim(geo.strideMm, unit)} (Target: 430 - 460 mm / 17 - 18 in)
• Grip Proportion (R*T) : ${geo.gripCm2.toFixed(1)} cm² (Target: 450 - 485 cm²)

4. CARPENTER STRINGER CUT-LIST
-----------------------------------------------------
• Recommended Stock     : 2x12 Lumber (50 x 300 mm)
• Bottom Step Deduction : Drop bottom cut by ${formatDim(geo.bottomRiserCutMm, unit)} (tread thickness)
• Throat Waist Depth    : ${formatDim(geo.stringerThroatMm, unit)}

5. MATERIAL & BOQ SUMMARY (RCC CONCRETE)
-----------------------------------------------------
• Total Concrete Volume : ${boq.totalConcreteM3} m³ (${boq.totalConcreteCuFt} cu.ft)
• Cement Required       : ${boq.cementBags} Bags (50kg M20 mix)
• River Sand / M-Sand   : ${boq.sandM3} m³ (${boq.sandTons} Tonnes)
• 20mm Coarse Aggregate : ${boq.aggregateM3} m³ (${boq.aggregateTons} Tonnes)
• Steel Rebar (Fe500)   : ${boq.rebarKg} kg
• Shuttering Area       : ${boq.totalFormworkM2} m² (${boq.totalFormworkSqFt} sq.ft)
• Tile / Granite Area   : ${boq.totalCladdingM2} m² (+10% wastage)
• Total Estimated Cost  : ${currencySymbol}${boq.totalRccCost.toLocaleString()}

=====================================================
Calculated with Toolique India Staircase Studio.
Complies with NBC 2016 / IRC / IBC / UK Part K.`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // PDF Export
  const exportPDF = () => {
    const doc = new jsPDF();
    const margin = 14;
    let y = 18;

    // Header
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 210, 24, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('TOOLIQUE ARCHITECTURAL STAIRCASE REPORT', margin, 12);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString()} | Code: ${activeCode.name}`, margin, 18);

    y = 34;
    doc.setTextColor(30, 41, 59);

    // Section 1: Core Geometry
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('1. STAIRCASE GEOMETRIC DIMENSIONS', margin, y);
    y += 6;

    const geoData = [
      ['Configuration Type', stairType.toUpperCase()],
      ['Total Floor Rise (H)', `${formatDim(totalRiseMm, unit)} (${(totalRiseMm / 304.8).toFixed(2)} ft)`],
      ['Number of Risers', `${geo.numRisers} Risers`],
      ['Actual Riser Height (R)', `${formatDim(geo.actualRiserMm, unit)} (${toFractionInches(geo.actualRiserMm / 25.4)})`],
      ['Number of Treads', `${geo.numTreads} Treads`],
      ['Actual Tread Depth (T)', `${formatDim(geo.actualTreadMm, unit)} (${toFractionInches(geo.actualTreadMm / 25.4)})`],
      ['Total Horizontal Run', `${formatDim(geo.totalRunMm, unit)} (${(geo.totalRunMm / 304.8).toFixed(2)} ft)`],
      ['Stringer Hypotenuse', `${formatDim(geo.stringerLengthMm, unit)} (${(geo.stringerLengthMm / 304.8).toFixed(2)} ft)`],
      ['Stair Incline Pitch', `${geo.pitchAngleDeg.toFixed(1)}°`],
      ['Headroom Clearance', `${formatDim(geo.headroomClearanceMm, unit)} (${geo.headroomPass ? 'PASS' : 'FAIL'})`],
      ['Blondel Index (2R+T)', `${formatDim(geo.blondelMm, unit)} (Score: ${geo.comfortScorePct}%)`]
    ];

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    geoData.forEach(([label, val]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(val, margin + 70, y);
      y += 5;
    });

    // Section 2: Code Compliance
    y += 4;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('2. BUILDING CODE COMPLIANCE AUDIT', margin, y);
    y += 6;

    compliance.checks.slice(0, 6).forEach((c) => {
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(c.passed ? 22 : 220, c.passed ? 101 : 38, c.passed ? 52 : 38);
      doc.text(`[${c.passed ? 'PASS' : 'FAIL'}] ${c.name}:`, margin, y);
      doc.setTextColor(51, 65, 85);
      doc.setFont('helvetica', 'normal');
      doc.text(`Actual: ${c.actual} | Limit: ${c.limit}`, margin + 65, y);
      y += 5;
    });

    // Section 3: Material Takeoff (BOQ)
    y += 4;
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('3. MATERIAL ESTIMATOR & BILL OF QUANTITIES (RCC)', margin, y);
    y += 6;

    const boqData = [
      ['Total Concrete Volume', `${boq.totalConcreteM3} m³ (${boq.totalConcreteCuFt} cu.ft)`],
      ['Cement Bags (50kg)', `${boq.cementBags} Bags (M20 Grade)`],
      ['Fine Sand (River/M-Sand)', `${boq.sandM3} m³ (${boq.sandTons} Tonnes)`],
      ['20mm Coarse Aggregate', `${boq.aggregateM3} m³ (${boq.aggregateTons} Tonnes)`],
      ['Steel Rebar (Fe500)', `${boq.rebarKg} kg`],
      ['Formwork Shuttering Ply', `${boq.totalFormworkM2} m² (${boq.totalFormworkSqFt} sq.ft)`],
      ['Granite / Tile Cladding', `${boq.totalCladdingM2} m² (+10% wastage)`],
      ['Total Estimated Cost', `${currencySymbol}${boq.totalRccCost.toLocaleString()}`]
    ];

    doc.setFontSize(9);
    boqData.forEach(([label, val]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(val, margin + 70, y);
      y += 5;
    });

    // Footer
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Toolique India Engineering Studio • Conforms to NBC 2016 / IRC 2024 / UK Part K Standards', margin, 285);

    doc.save(`Staircase-Engineering-Report-${Date.now()}.pdf`);
  };

  // Excel Export
  const exportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Geometry & Specs
    const geoRows = [
      ['Toolique Staircase Geometry & Engineering Schedule'],
      ['Generated Date', new Date().toISOString()],
      ['Building Code Standard', activeCode.name],
      ['Stair Configuration', stairType.toUpperCase()],
      [],
      ['Parameter', 'Value', 'Unit', 'Imperial Equiv'],
      ['Total Floor-to-Floor Rise', totalRiseMm, 'mm', `${(totalRiseMm / 25.4).toFixed(2)} in`],
      ['Staircase Clear Width', stairWidthMm, 'mm', `${(stairWidthMm / 25.4).toFixed(2)} in`],
      ['Number of Risers', geo.numRisers, 'Count', `${geo.numRisers} Steps`],
      ['Actual Riser Height', geo.actualRiserMm.toFixed(2), 'mm', toFractionInches(geo.actualRiserMm / 25.4)],
      ['Number of Treads', geo.numTreads, 'Count', `${geo.numTreads} Treads`],
      ['Actual Tread Going', geo.actualTreadMm.toFixed(2), 'mm', toFractionInches(geo.actualTreadMm / 25.4)],
      ['Total Horizontal Run', geo.totalRunMm.toFixed(2), 'mm', `${(geo.totalRunMm / 304.8).toFixed(2)} ft`],
      ['Stringer Hypotenuse', geo.stringerLengthMm.toFixed(2), 'mm', `${(geo.stringerLengthMm / 304.8).toFixed(2)} ft`],
      ['Pitch Slope Angle', geo.pitchAngleDeg.toFixed(2), 'Degrees', `${geo.pitchAngleDeg.toFixed(1)}°`],
      ['Headroom Clearance', geo.headroomClearanceMm.toFixed(2), 'mm', `${(geo.headroomClearanceMm / 25.4).toFixed(2)} in`],
      ['Blondel Comfort Formula (2R+T)', geo.blondelMm.toFixed(2), 'mm', `${geo.comfortScorePct}% Score`],
    ];
    const wsGeo = XLSX.utils.aoa_to_sheet(geoRows);
    XLSX.utils.book_append_sheet(wb, wsGeo, 'Stair Geometry');

    // Sheet 2: Carpenter Cut List
    const cutRows = [
      ['Step #', 'Step Rise (mm)', 'Cumulative Height Y (mm)', 'Cumulative Run X (mm)', 'Hypotenuse Point (mm)'],
      ...geo.stepPoints.map(p => [
        p.stepNum,
        geo.actualRiserMm.toFixed(1),
        p.stepRiseY.toFixed(1),
        p.stepRunX.toFixed(1),
        p.hypPointMm.toFixed(1)
      ])
    ];
    const wsCut = XLSX.utils.aoa_to_sheet(cutRows);
    XLSX.utils.book_append_sheet(wb, wsCut, 'Carpenter Cut Schedule');

    // Sheet 3: Material BOQ
    const boqRows = [
      ['Item Description', 'Quantity', 'Unit', 'Rate', 'Total Cost'],
      ['RCC Concrete (M20 Grade)', boq.totalConcreteM3, 'm³', rccConcreteRatePerM3, boq.costConcrete],
      ['Cement Bags (50kg)', boq.cementBags, 'Bags', '-', '-'],
      ['Fine River / M-Sand', boq.sandM3, 'm³', '-', '-'],
      ['20mm Coarse Aggregate', boq.aggregateM3, 'm³', '-', '-'],
      ['Steel Reinforcement (Fe500 Rebar)', boq.rebarKg, 'kg', rebarRatePerKg, boq.costRebar],
      ['Shuttering / Formwork Ply', boq.totalFormworkM2, 'm²', formworkRatePerM2, boq.costFormwork],
      ['Granite / Tile Cladding (+10% Waste)', boq.totalCladdingM2, 'm²', tilingRatePerM2, boq.costCladding],
      ['SS 304 / MS Safety Handrail', boq.railingLengthM, 'R.Meter', railingRatePerM, boq.costRailing],
      [],
      ['Total Estimated Project Cost', '', '', '', boq.totalRccCost]
    ];
    const wsBoq = XLSX.utils.aoa_to_sheet(boqRows);
    XLSX.utils.book_append_sheet(wb, wsBoq, 'Material BOQ');

    XLSX.writeFile(wb, `Staircase-BOQ-Schedule-${Date.now()}.xlsx`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-left">
      {/* Top Controls & Preset Toolbar */}
      <div className="p-5 saas-card space-y-4 bg-gradient-to-r from-indigo-900/5 via-purple-900/5 to-transparent border-indigo-500/20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Standard Architectural Presets:
            </span>
          </div>

          {/* Quick Export & Reset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={copyReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-bold transition shadow-xs cursor-pointer"
              title="Copy Summary Report"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              onClick={exportPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20 cursor-pointer"
              title="Export Professional PDF"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDF Report</span>
            </button>

            <button
              onClick={exportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20 cursor-pointer"
              title="Export Excel Schedule"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Excel BOQ</span>
            </button>

            <button
              onClick={handleReset}
              className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition cursor-pointer"
              title="Reset to Default"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Preset Pill Buttons */}
        <div className="flex flex-wrap gap-2">
          {STAIR_PRESETS.map((p) => {
            const isSelected = activePresetId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-500/50 shadow-xs'
                    : 'bg-white dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border-zinc-200/80 dark:border-zinc-700 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
                title={p.desc}
              >
                {p.name}
              </button>
            );
          })}
        </div>

        {/* Global Unit & Configuration Selector Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5 pt-5 border-t border-zinc-200/60 dark:border-zinc-800/60">
          {/* Unit System */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
              Unit System
            </label>
            <div className="grid grid-cols-5 gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 text-[11px] font-bold">
              {(['mm', 'cm', 'm', 'in', 'ft'] as UnitType[]).map((u) => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  className={`py-1 rounded-lg transition-all ${
                    unit === u
                      ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          {/* Staircase Type */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
              Stair Layout
            </label>
            <select
              value={stairType}
              onChange={(e) => setStairType(e.target.value as StairType)}
              className="w-full text-xs font-semibold px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none text-zinc-800 dark:text-zinc-200 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="straight">Straight Flight (Standard)</option>
              <option value="l_shape">L-Shaped (Quarter Turn 90°)</option>
              <option value="dog_legged">Dog-Legged / U-Shape (180°)</option>
              <option value="spiral">Circular Spiral / Helical</option>
            </select>
          </div>

          {/* Building Code Standard */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
              Regulatory Code
            </label>
            <select
              value={selectedCode}
              onChange={(e) => setSelectedCode(e.target.value as BuildingCodeType)}
              className="w-full text-xs font-semibold px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none text-zinc-800 dark:text-zinc-200 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="nbc_res">NBC 2016 (India Residential)</option>
              <option value="nbc_pub">NBC 2016 (India Commercial)</option>
              <option value="irc_us">US IRC (Residential)</option>
              <option value="ibc_us">US IBC (Commercial)</option>
              <option value="uk_part_k">UK Approved Doc K</option>
            </select>
          </div>

          {/* Material Mode */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
              Construction Material
            </label>
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 text-[11px] font-bold">
              <button
                onClick={() => setMaterialMode('rcc')}
                className={`py-1 rounded-lg transition-all ${
                  materialMode === 'rcc'
                    ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                RCC Slab
              </button>
              <button
                onClick={() => setMaterialMode('timber')}
                className={`py-1 rounded-lg transition-all ${
                  materialMode === 'timber'
                    ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                Timber
              </button>
              <button
                onClick={() => setMaterialMode('steel')}
                className={`py-1 rounded-lg transition-all ${
                  materialMode === 'steel'
                    ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                Steel MS
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Studio Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs Column (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 saas-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-indigo-500" />
                <span>Primary Dimensions</span>
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold">
                Input Unit: {unit.toUpperCase()}
              </span>
            </div>

            {/* Total Rise Input */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Total Floor-to-Floor Rise (H)
                </label>
                <span className="text-[10px] font-mono text-zinc-400">
                  {formatDim(totalRiseMm, unit)} ({toFractionInches(totalRiseMm / 25.4)})
                </span>
              </div>
              <input
                type="number"
                step="1"
                value={Number(formatDim(totalRiseMm, unit, false, 2)) || ''}
                onChange={(e) => setTotalRiseMm(Math.max(100, toMm(parseFloat(e.target.value) || 0, unit)))}
                className="saas-input font-mono font-bold text-sm"
              />
              <p className="text-[10px] text-zinc-400 mt-1">
                Finished lower floor to finished upper floor level.
              </p>
            </div>

            {/* Target Riser & Target Tread */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Target Riser
                  </label>
                </div>
                <input
                  type="number"
                  step="0.1"
                  value={Number(formatDim(targetRiserMm, unit, false, 2)) || ''}
                  onChange={(e) => setTargetRiserMm(Math.max(50, toMm(parseFloat(e.target.value) || 0, unit)))}
                  className="saas-input font-mono text-xs"
                />
                <p className="text-[9px] text-zinc-400 mt-1">Ideal: 150-180 mm (6-7")</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Target Tread
                  </label>
                </div>
                <input
                  type="number"
                  step="0.1"
                  value={Number(formatDim(targetTreadMm, unit, false, 2)) || ''}
                  onChange={(e) => setTargetTreadMm(Math.max(100, toMm(parseFloat(e.target.value) || 0, unit)))}
                  className="saas-input font-mono text-xs"
                />
                <p className="text-[9px] text-zinc-400 mt-1">Ideal: 250-300 mm (10-12")</p>
              </div>
            </div>

            {/* Clear Stair Width */}
            <div className="pt-2">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Staircase Clear Width
                </label>
                <span className="text-[10px] font-mono text-zinc-400">
                  {formatDim(stairWidthMm, unit)}
                </span>
              </div>
              <input
                type="number"
                step="1"
                value={Number(formatDim(stairWidthMm, unit, false, 2)) || ''}
                onChange={(e) => setStairWidthMm(Math.max(500, toMm(parseFloat(e.target.value) || 0, unit)))}
                className="saas-input font-mono text-xs"
              />
              <p className="text-[10px] text-zinc-400 mt-1">
                NBC Min: 900mm (Res) / 1500mm (Public) • US IRC Min: 36"
              </p>
            </div>

            {/* Top Step Alignment Option */}
            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={flushTopStep}
                  onChange={(e) => setFlushTopStep(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-zinc-300 dark:border-zinc-700"
                />
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Top step flush with upper landing (Treads = Risers - 1)
                </span>
              </label>
            </div>
          </div>

          {/* Advanced Structural & Clearance Parameters */}
          <div className="p-5 saas-card space-y-4">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <Layers className="w-4 h-4 text-purple-500" />
              <span>Clearances & Structural Details</span>
            </h3>

            {/* Ceiling Opening (Headroom) */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Ceiling Opening Length (Well Cutout)
                </label>
                <span className="text-[10px] font-mono text-zinc-400">
                  {formatDim(ceilingOpenMm, unit)}
                </span>
              </div>
              <input
                type="number"
                value={Number(formatDim(ceilingOpenMm, unit, false, 2)) || ''}
                onChange={(e) => setCeilingOpenMm(Math.max(500, toMm(parseFloat(e.target.value) || 0, unit)))}
                className="saas-input font-mono text-xs"
              />
              <p className="text-[9px] text-zinc-400 mt-1">
                Determines overhead headroom under upper floor opening.
              </p>
            </div>

            {/* Slab Thickness & Nosing Overhang */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Floor Slab Thick
                </label>
                <input
                  type="number"
                  value={Number(formatDim(slabThickMm, unit, false, 2)) || ''}
                  onChange={(e) => setSlabThickMm(Math.max(50, toMm(parseFloat(e.target.value) || 0, unit)))}
                  className="saas-input font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Nosing Overhang
                </label>
                <input
                  type="number"
                  value={Number(formatDim(nosingMm, unit, false, 2)) || ''}
                  onChange={(e) => setNosingMm(Math.max(0, toMm(parseFloat(e.target.value) || 0, unit)))}
                  className="saas-input font-mono text-xs"
                />
              </div>
            </div>

            {/* Waist Slab & Tread Board Thickness */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Waist Slab / Throat
                </label>
                <input
                  type="number"
                  value={Number(formatDim(waistThickMm, unit, false, 2)) || ''}
                  onChange={(e) => setWaistThickMm(Math.max(50, toMm(parseFloat(e.target.value) || 0, unit)))}
                  className="saas-input font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Tread Plank Thick
                </label>
                <input
                  type="number"
                  value={Number(formatDim(treadThickMm, unit, false, 2)) || ''}
                  onChange={(e) => setTreadThickMm(Math.max(0, toMm(parseFloat(e.target.value) || 0, unit)))}
                  className="saas-input font-mono text-xs"
                />
              </div>
            </div>

            {/* Landing Length (for L/Dog-legged) */}
            {(stairType === 'l_shape' || stairType === 'dog_legged') && (
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Mid-Landing Length / Depth
                  </label>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {formatDim(landingLengthMm, unit)}
                  </span>
                </div>
                <input
                  type="number"
                  value={Number(formatDim(landingLengthMm, unit, false, 2)) || ''}
                  onChange={(e) => setLandingLengthMm(Math.max(500, toMm(parseFloat(e.target.value) || 0, unit)))}
                  className="saas-input font-mono text-xs"
                />
                <p className="text-[9px] text-zinc-400 mt-1">
                  NBC requires landing depth $\ge$ stair width ({formatDim(stairWidthMm, unit)}).
                </p>
              </div>
            )}

            {/* Spiral Specific Inputs */}
            {stairType === 'spiral' && (
              <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Spiral Outer Diameter
                  </label>
                  <input
                    type="number"
                    value={Number(formatDim(spiralOuterDiameterMm, unit, false, 2)) || ''}
                    onChange={(e) => setSpiralOuterDiameterMm(Math.max(1000, toMm(parseFloat(e.target.value) || 0, unit)))}
                    className="saas-input font-mono text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Center Column Ø
                    </label>
                    <input
                      type="number"
                      value={Number(formatDim(spiralCenterPostMm, unit, false, 2)) || ''}
                      onChange={(e) => setSpiralCenterPostMm(Math.max(50, toMm(parseFloat(e.target.value) || 0, unit)))}
                      className="saas-input font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Total Turn Angle
                    </label>
                    <select
                      value={spiralAngleDeg}
                      onChange={(e) => setSpiralAngleDeg(parseInt(e.target.value))}
                      className="saas-input text-xs"
                    >
                      <option value="270">270° (3/4 Turn)</option>
                      <option value="360">360° (Full 1 Turn)</option>
                      <option value="450">450° (1 1/4 Turn)</option>
                      <option value="540">540° (1 1/2 Turns)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Output & Tabs Column (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Key Metrics Dashboard Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Risers Count */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                Total Risers
              </span>
              <div className="text-xl md:text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                {geo.numRisers} <span className="text-xs font-bold text-zinc-400">Steps</span>
              </div>
              <div className="text-[10px] font-semibold text-zinc-500 mt-1 flex items-center justify-between">
                <span>Height:</span>
                <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                  {formatDim(geo.actualRiserMm, unit)}
                </span>
              </div>
            </div>

            {/* Total Run */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                Total Run
              </span>
              <div className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white font-mono mt-0.5">
                {formatDim(geo.totalRunMm, unit, false)} <span className="text-xs font-bold text-zinc-400">{unit}</span>
              </div>
              <div className="text-[10px] font-semibold text-zinc-500 mt-1 flex items-center justify-between">
                <span>Treads:</span>
                <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                  {geo.numTreads} × {formatDim(geo.actualTreadMm, unit)}
                </span>
              </div>
            </div>

            {/* Pitch Angle */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                Pitch Angle
              </span>
              <div className={`text-xl md:text-2xl font-black font-mono mt-0.5 ${
                geo.pitchAngleDeg <= activeCode.maxPitchDeg && geo.pitchAngleDeg >= activeCode.minPitchDeg
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}>
                {geo.pitchAngleDeg.toFixed(1)}°
              </div>
              <div className="text-[10px] font-semibold text-zinc-500 mt-1 flex items-center justify-between">
                <span>Stringer:</span>
                <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                  {formatDim(geo.stringerLengthMm, unit)}
                </span>
              </div>
            </div>

            {/* Comfort Rating (Blondel) */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                Blondel Comfort
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xl md:text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">
                  {geo.comfortScorePct}%
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                  geo.comfortScorePct >= 90
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : geo.comfortScorePct >= 75
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                }`}>
                  {geo.comfortScorePct >= 90 ? 'Ideal' : geo.comfortScorePct >= 75 ? 'Good' : 'Acceptable'}
                </span>
              </div>
              <div className="text-[10px] font-semibold text-zinc-500 mt-1 flex items-center justify-between">
                <span>2R+T:</span>
                <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                  {formatDim(geo.blondelMm, unit)}
                </span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-zinc-200 dark:border-zinc-800 space-x-1 overflow-x-auto pb-1 text-xs font-bold">
            <button
              onClick={() => setActiveTab('blueprint')}
              className={`px-3 py-2 rounded-t-xl transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === 'blueprint'
                  ? 'bg-white dark:bg-zinc-900 border-t-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Interactive Blueprint</span>
            </button>

            <button
              onClick={() => setActiveTab('compliance')}
              className={`px-3 py-2 rounded-t-xl transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === 'compliance'
                  ? 'bg-white dark:bg-zinc-900 border-t-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Code Audit ({compliance.failedCount === 0 ? 'Passed' : `${compliance.failedCount} Issues`})</span>
            </button>

            <button
              onClick={() => setActiveTab('stringer')}
              className={`px-3 py-2 rounded-t-xl transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === 'stringer'
                  ? 'bg-white dark:bg-zinc-900 border-t-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Carpenter Cut-List</span>
            </button>

            <button
              onClick={() => setActiveTab('boq')}
              className={`px-3 py-2 rounded-t-xl transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === 'boq'
                  ? 'bg-white dark:bg-zinc-900 border-t-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Material BOQ & Cost</span>
            </button>

            <button
              onClick={() => setActiveTab('multitype')}
              className={`px-3 py-2 rounded-t-xl transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === 'multitype'
                  ? 'bg-white dark:bg-zinc-900 border-t-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Flight & Spiral</span>
            </button>
          </div>

          {/* TAB 1: INTERACTIVE BLUEPRINT */}
          {activeTab === 'blueprint' && (
            <div className="p-5 saas-card space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-indigo-500" />
                  <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                    2D Architectural Elevation Blueprint
                  </h4>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-semibold text-zinc-500">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showBlueprintGrid}
                      onChange={(e) => setShowBlueprintGrid(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span>Grid</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showHeadroomRay}
                      onChange={(e) => setShowHeadroomRay(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span>Headroom Ray</span>
                  </label>
                </div>
              </div>

              {/* Dynamic SVG Blueprint Drawing */}
              <div className="relative w-full h-80 sm:h-96 rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden flex items-center justify-center p-4 select-none">
                <svg
                  viewBox="-40 -30 680 440"
                  className="w-full h-full text-zinc-200"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <defs>
                    <pattern id="blueprintGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(99, 102, 241, 0.12)" strokeWidth="0.75" />
                    </pattern>
                    <linearGradient id="concreteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4338ca" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.8" />
                    </linearGradient>
                    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#818cf8" />
                    </marker>
                  </defs>

                  {/* Blueprint Background Grid */}
                  {showBlueprintGrid && (
                    <rect x="-40" y="-30" width="680" height="440" fill="url(#blueprintGrid)" />
                  )}

                  {(() => {
                    const originX = 50;
                    const originY = 350;
                    const maxDrawWidth = 420;
                    const maxDrawHeight = 280;
                    
                    const scaleX = maxDrawWidth / Math.max(1000, geo.totalRunMm);
                    const scaleY = maxDrawHeight / Math.max(1000, totalRiseMm);

                    let stepsPath = `M ${originX} ${originY} `;
                    const stepRects: { num: number; x: number; y: number; w: number; h: number }[] = [];

                    for (let i = 0; i < geo.numRisers; i++) {
                      const curX = originX + (i * geo.actualTreadMm * scaleX);
                      const curY = originY - (i * geo.actualRiserMm * scaleY);
                      const nextY = curY - (geo.actualRiserMm * scaleY);
                      const nextX = curX + (geo.actualTreadMm * scaleX);

                      stepsPath += `V ${nextY} H ${nextX} `;

                      stepRects.push({
                        num: i + 1,
                        x: curX,
                        y: nextY,
                        w: geo.actualTreadMm * scaleX,
                        h: geo.actualRiserMm * scaleY
                      });
                    }

                    const topEndX = originX + (geo.totalRunMm * scaleX);
                    const topEndY = originY - (totalRiseMm * scaleY);

                    // Underside waist slab polygon points
                    const waistOffset = (waistThickMm * scaleY) * 1.2;
                    const waistPath = `${stepsPath} L ${topEndX + 50} ${topEndY} L ${topEndX + 50} ${topEndY + waistOffset} L ${originX + 20} ${originY} Z`;

                    // Ceiling header location
                    const ceilingX = originX + (ceilingOpenMm * scaleX);
                    const ceilingSlabY = topEndY;

                    return (
                      <g>
                        {/* Ground and Top Floor Landing slabs */}
                        <line x1="10" y1={originY} x2="550" y2={originY} stroke="#475569" strokeWidth="2" />
                        <text x="15" y={originY + 15} fill="#64748b" fontSize="9" fontWeight="bold">FINISHED LOWER FLOOR (0.00)</text>

                        {/* Top Landing Floor */}
                        <line x1={topEndX} y1={topEndY} x2="550" y2={topEndY} stroke="#818cf8" strokeWidth="2" />
                        <text x={topEndX + 10} y={topEndY - 8} fill="#a5b4fc" fontSize="9" fontWeight="bold">
                          UPPER FLOOR (+{formatDim(totalRiseMm, unit)})
                        </text>

                        {/* Concrete Waist Slab / Timber Stringer Fill */}
                        <path d={waistPath} fill="url(#concreteGrad)" stroke="#6366f1" strokeWidth="1.5" />

                        {/* Incline Slope Line (Hypotenuse) */}
                        <line
                          x1={originX}
                          y1={originY}
                          x2={topEndX}
                          y2={topEndY}
                          stroke="#94a3b8"
                          strokeDasharray="4 4"
                          strokeWidth="1.2"
                        />

                        {/* Stair Step Lines & Interactive Steps */}
                        <path d={stepsPath} fill="none" stroke="#ffffff" strokeWidth="2" strokeLinejoin="round" />

                        {/* Interactive Step Hover areas */}
                        {stepRects.map((s) => (
                          <g
                            key={s.num}
                            onMouseEnter={() => setHoveredStep(s.num)}
                            onMouseLeave={() => setHoveredStep(null)}
                            className="cursor-pointer"
                          >
                            <rect
                              x={s.x}
                              y={s.y}
                              width={s.w}
                              height={s.h}
                              fill={hoveredStep === s.num ? 'rgba(99, 102, 241, 0.4)' : 'transparent'}
                              stroke={hoveredStep === s.num ? '#a5b4fc' : 'none'}
                              strokeWidth="1.5"
                            />
                          </g>
                        ))}

                        {/* Ceiling Cutout Header & Headroom Ray */}
                        {showHeadroomRay && (
                          <g>
                            {/* Ceiling Opening Slab */}
                            <rect
                              x={ceilingX}
                              y={ceilingSlabY}
                              width="250"
                              height={slabThickMm * scaleY}
                              fill="#334155"
                              stroke="#64748b"
                              strokeWidth="1.5"
                            />
                            <text x={ceilingX + 10} y={ceilingSlabY + 16} fill="#cbd5e1" fontSize="8" fontWeight="bold">
                              CEILING SLAB
                            </text>

                            {/* Vertical Headroom Line */}
                            {ceilingOpenMm < geo.totalRunMm && (
                              <g>
                                <line
                                  x1={ceilingX}
                                  y1={ceilingSlabY + (slabThickMm * scaleY)}
                                  x2={ceilingX}
                                  y2={originY - ((geo.totalRunMm - ceilingOpenMm) * (geo.actualRiserMm / geo.actualTreadMm) * scaleY)}
                                  stroke={geo.headroomPass ? '#10b981' : '#f43f5e'}
                                  strokeWidth="2"
                                  strokeDasharray="3 3"
                                  markerStart="url(#arrow)"
                                  markerEnd="url(#arrow)"
                                />
                                <text
                                  x={ceilingX + 8}
                                  y={ceilingSlabY + (slabThickMm * scaleY) + 30}
                                  fill={geo.headroomPass ? '#34d399' : '#fb7185'}
                                  fontSize="9"
                                  fontWeight="bold"
                                >
                                  Headroom: {formatDim(geo.headroomClearanceMm, unit)}
                                </text>
                              </g>
                            )}
                          </g>
                        )}

                        {/* Dimension Line 1: Total Rise (Vertical) */}
                        <g>
                          <line x1="30" y1={originY} x2="30" y2={topEndY} stroke="#818cf8" strokeWidth="1.5" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
                          <text
                            x="-190"
                            y="22"
                            transform="rotate(-90)"
                            fill="#818cf8"
                            fontSize="10"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            Total Rise: {formatDim(totalRiseMm, unit)}
                          </text>
                        </g>

                        {/* Dimension Line 2: Total Run (Horizontal) */}
                        <g>
                          <line x1={originX} y1={originY + 25} x2={topEndX} y2={originY + 25} stroke="#818cf8" strokeWidth="1.5" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
                          <text
                            x={originX + (geo.totalRunMm * scaleX) / 2}
                            y={originY + 40}
                            fill="#818cf8"
                            fontSize="10"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            Total Run: {formatDim(geo.totalRunMm, unit)} ({geo.numTreads} Treads)
                          </text>
                        </g>

                        {/* Pitch Angle Indicator Arc */}
                        <path
                          d={`M ${originX + 35} ${originY} A 35 35 0 0 0 ${originX + 30} ${originY - 20}`}
                          fill="none"
                          stroke="#34d399"
                          strokeWidth="2"
                        />
                        <text x={originX + 42} y={originY - 10} fill="#34d399" fontSize="10" fontWeight="bold">
                          {geo.pitchAngleDeg.toFixed(1)}°
                        </text>
                      </g>
                    );
                  })()}
                </svg>

                {/* Live Step Tooltip */}
                {hoveredStep !== null && (
                  <div className="absolute bottom-3 left-3 bg-zinc-900/90 backdrop-blur-md border border-zinc-700 px-3 py-1.5 rounded-xl text-xs text-white shadow-lg pointer-events-none">
                    <span className="font-bold text-indigo-400">Step #{hoveredStep}</span> of {geo.numRisers} •
                    Elevation: <span className="font-mono font-bold">{formatDim(hoveredStep * geo.actualRiserMm, unit)}</span> •
                    Riser: <span className="font-mono">{formatDim(geo.actualRiserMm, unit)}</span>
                  </div>
                )}
              </div>

              {/* Ergonomics & Comfort Rules Legend */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Blondel's Rule</div>
                  <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
                    2R + T = {formatDim(geo.blondelMm, unit)}
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Optimal: 600 - 640 mm (24-25"). Score: <b>{geo.comfortScorePct}%</b>
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Stride Safety Rule</div>
                  <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
                    R + T = {formatDim(geo.strideMm, unit)}
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Target: 430 - 460 mm (17-18"). Safe step boundary.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Grip Ratio</div>
                  <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
                    R × T = {geo.gripCm2.toFixed(1)} cm²
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Target: 450 - 485 cm² (70-75 sq.in). Prevents overreaching.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CODE COMPLIANCE AUDIT */}
          {activeTab === 'compliance' && (
            <div className="p-5 saas-card space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Regulatory Code Compliance Audit</span>
                  </h4>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Evaluated against <b>{activeCode.name}</b> ({activeCode.codeRef})
                  </p>
                </div>

                <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                  compliance.overallStatus === 'fully_compliant'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : compliance.overallStatus === 'warning'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                }`}>
                  {compliance.overallStatus === 'fully_compliant' ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>100% Code Compliant</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{compliance.failedCount} Compliance Warning(s)</span>
                    </>
                  )}
                </div>
              </div>

              {/* Code Description Banner */}
              <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-800/40 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{activeCode.description}</p>
              </div>

              {/* Checklist Table */}
              <div className="space-y-2.5">
                {compliance.checks.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      item.passed
                        ? 'bg-white dark:bg-zinc-900/60 border-zinc-200/80 dark:border-zinc-800'
                        : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        {item.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                        )}
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {item.name}
                        </span>
                      </div>

                      <div className="text-xs font-mono font-semibold text-zinc-600 dark:text-zinc-300 pl-6 sm:pl-0">
                        Actual: <span className="font-bold text-zinc-900 dark:text-white">{item.actual}</span> • Target: <span className="text-zinc-500">{item.limit}</span>
                      </div>
                    </div>
                    <p className={`text-[11px] mt-1.5 pl-6 ${
                      item.passed ? 'text-zinc-500 dark:text-zinc-400' : 'text-rose-600 dark:text-rose-400 font-medium'
                    }`}>
                      {item.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CARPENTER STRINGER CUT-LIST */}
          {activeTab === 'stringer' && (
            <div className="p-5 saas-card space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-amber-500" />
                    <span>Carpenter Stringer Layout & Cut-List Schedule</span>
                  </h4>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Framing square guide, step drops, and cumulative marking coordinates
                  </p>
                </div>

                <button
                  onClick={() => {
                    const cutText = geo.stepPoints.map(p => `Step ${p.stepNum}: Rise=${geo.actualRiserMm.toFixed(1)}mm, Y=${p.stepRiseY.toFixed(1)}mm, X=${p.stepRunX.toFixed(1)}mm`).join('\n');
                    navigator.clipboard.writeText(cutText);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-200 transition"
                >
                  {copied ? 'Copied Cut-List!' : 'Copy Cut-List'}
                </button>
              </div>

              {/* Essential Carpentry Guidelines */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                    Bottom Step Drop
                  </span>
                  <div className="text-base font-black text-amber-900 dark:text-amber-200 font-mono mt-0.5">
                    {formatDim(geo.bottomRiserCutMm, unit)}
                  </div>
                  <p className="text-[10px] text-amber-700 dark:text-amber-300 mt-1">
                    Subtract tread thickness ({formatDim(treadThickMm, unit)}) from bottom riser cut so finished step heights match.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                    Stringer Throat Depth
                  </span>
                  <div className="text-base font-black text-indigo-900 dark:text-indigo-200 font-mono mt-0.5">
                    {formatDim(geo.stringerThroatMm, unit)}
                  </div>
                  <p className="text-[10px] text-indigo-700 dark:text-indigo-300 mt-1">
                    Minimum 3.5" (90 mm) solid wood remaining along the waist for shear load capacity.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                    Framing Square Pins
                  </span>
                  <div className="text-base font-black text-emerald-900 dark:text-emerald-200 font-mono mt-0.5">
                    {formatDim(geo.actualRiserMm, unit)} × {formatDim(geo.actualTreadMm, unit)}
                  </div>
                  <p className="text-[10px] text-emerald-700 dark:text-emerald-300 mt-1">
                    Set riser measurement on the tongue and tread measurement on the body of the square.
                  </p>
                </div>
              </div>

              {/* Step by Step Cumulative Marking Table */}
              <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/80 text-zinc-500 font-bold border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="p-2.5">Step #</th>
                      <th className="p-2.5">Unit Rise</th>
                      <th className="p-2.5">Cumulative Rise (Y)</th>
                      <th className="p-2.5">Cumulative Run (X)</th>
                      <th className="p-2.5">Hypotenuse Pt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-mono">
                    {geo.stepPoints.map((p) => (
                      <tr key={p.stepNum} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                        <td className="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">Step {p.stepNum}</td>
                        <td className="p-2.5">{formatDim(geo.actualRiserMm, unit)}</td>
                        <td className="p-2.5 font-bold text-zinc-800 dark:text-zinc-200">{formatDim(p.stepRiseY, unit)}</td>
                        <td className="p-2.5">{formatDim(p.stepRunX, unit)}</td>
                        <td className="p-2.5 text-zinc-400">{formatDim(p.hypPointMm, unit)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: MATERIAL BOQ & CONSTRUCTION COST */}
          {activeTab === 'boq' && (
            <div className="p-5 saas-card space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-500" />
                    <span>Bill of Quantities (BOQ) & Cost Estimator</span>
                  </h4>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {materialMode === 'rcc' ? 'Civil materials take-off, cement bags, rebar steel, and formwork' : 'Timber lumber stringers, tread boards, risers, and balusters'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-500">Currency:</span>
                  <select
                    value={currencySymbol}
                    onChange={(e) => setCurrencySymbol(e.target.value)}
                    className="text-xs font-bold px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border-none text-zinc-700 dark:text-zinc-200"
                  >
                    <option value="₹">₹ (INR)</option>
                    <option value="$">$ (USD)</option>
                    <option value="£">£ (GBP)</option>
                    <option value="€">€ (EUR)</option>
                    <option value="AED ">AED</option>
                  </select>
                </div>
              </div>

              {/* Material Takeoff Cards for RCC */}
              {materialMode === 'rcc' ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">Concrete Vol</span>
                      <div className="text-lg font-black text-zinc-900 dark:text-white font-mono mt-0.5">
                        {boq.totalConcreteM3} m³
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        {boq.totalConcreteCuFt} cu.ft
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">Cement (M20)</span>
                      <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                        {boq.cementBags} Bags
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        50kg bags (1:1.5:3 mix)
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">Rebar Steel</span>
                      <div className="text-lg font-black text-purple-600 dark:text-purple-400 font-mono mt-0.5">
                        {boq.rebarKg} kg
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        Fe500 TMT (105 kg/m³)
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">Cladding Area</span>
                      <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                        {boq.totalCladdingM2} m²
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        {boq.totalCladdingSqFt} sq.ft (+10% waste)
                      </div>
                    </div>
                  </div>

                  {/* RCC Cost Breakdown Table */}
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-50 dark:bg-zinc-800/80 text-zinc-500 font-bold border-b border-zinc-200 dark:border-zinc-800">
                        <tr>
                          <th className="p-3">Material / Work Item</th>
                          <th className="p-3">Quantity</th>
                          <th className="p-3">Unit Rate</th>
                          <th className="p-3 text-right">Estimated Cost</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-mono">
                        <tr>
                          <td className="p-3 font-sans font-semibold text-zinc-800 dark:text-zinc-200">
                            RCC Concrete (Mix M20 supply & pour)
                          </td>
                          <td className="p-3">{boq.totalConcreteM3} m³</td>
                          <td className="p-3">
                            <input
                              type="number"
                              value={rccConcreteRatePerM3}
                              onChange={(e) => setRccConcreteRatePerM3(parseFloat(e.target.value) || 0)}
                              className="w-24 px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 border-none text-xs"
                            />
                          </td>
                          <td className="p-3 text-right font-bold text-zinc-900 dark:text-white">
                            {currencySymbol}{boq.costConcrete.toLocaleString()}
                          </td>
                        </tr>

                        <tr>
                          <td className="p-3 font-sans font-semibold text-zinc-800 dark:text-zinc-200">
                            Steel Reinforcement (Fe500 Rebar fabrication)
                          </td>
                          <td className="p-3">{boq.rebarKg} kg</td>
                          <td className="p-3">
                            <input
                              type="number"
                              value={rebarRatePerKg}
                              onChange={(e) => setRebarRatePerKg(parseFloat(e.target.value) || 0)}
                              className="w-24 px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 border-none text-xs"
                            />
                          </td>
                          <td className="p-3 text-right font-bold text-zinc-900 dark:text-white">
                            {currencySymbol}{boq.costRebar.toLocaleString()}
                          </td>
                        </tr>

                        <tr>
                          <td className="p-3 font-sans font-semibold text-zinc-800 dark:text-zinc-200">
                            Shuttering Formwork (Plywood & Staging)
                          </td>
                          <td className="p-3">{boq.totalFormworkM2} m²</td>
                          <td className="p-3">
                            <input
                              type="number"
                              value={formworkRatePerM2}
                              onChange={(e) => setFormworkRatePerM2(parseFloat(e.target.value) || 0)}
                              className="w-24 px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 border-none text-xs"
                            />
                          </td>
                          <td className="p-3 text-right font-bold text-zinc-900 dark:text-white">
                            {currencySymbol}{boq.costFormwork.toLocaleString()}
                          </td>
                        </tr>

                        <tr>
                          <td className="p-3 font-sans font-semibold text-zinc-800 dark:text-zinc-200">
                            Tread & Riser Granite / Tile Cladding
                          </td>
                          <td className="p-3">{boq.totalCladdingM2} m²</td>
                          <td className="p-3">
                            <input
                              type="number"
                              value={tilingRatePerM2}
                              onChange={(e) => setTilingRatePerM2(parseFloat(e.target.value) || 0)}
                              className="w-24 px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 border-none text-xs"
                            />
                          </td>
                          <td className="p-3 text-right font-bold text-zinc-900 dark:text-white">
                            {currencySymbol}{boq.costCladding.toLocaleString()}
                          </td>
                        </tr>

                        <tr>
                          <td className="p-3 font-sans font-semibold text-zinc-800 dark:text-zinc-200">
                            SS 304 / MS Safety Handrail
                          </td>
                          <td className="p-3">{boq.railingLengthM} Meter</td>
                          <td className="p-3">
                            <input
                              type="number"
                              value={railingRatePerM}
                              onChange={(e) => setRailingRatePerM(parseFloat(e.target.value) || 0)}
                              className="w-24 px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 border-none text-xs"
                            />
                          </td>
                          <td className="p-3 text-right font-bold text-zinc-900 dark:text-white">
                            {currencySymbol}{boq.costRailing.toLocaleString()}
                          </td>
                        </tr>

                        <tr className="bg-indigo-50/50 dark:bg-indigo-950/30">
                          <td colSpan={3} className="p-3 font-sans font-bold text-indigo-900 dark:text-indigo-200 text-sm">
                            Total Estimated RCC Construction Cost
                          </td>
                          <td className="p-3 text-right font-black text-indigo-600 dark:text-indigo-400 text-base">
                            {currencySymbol}{boq.totalRccCost.toLocaleString()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">2x12 Stringers</span>
                      <div className="text-lg font-black text-zinc-900 dark:text-white font-mono mt-0.5">
                        {boq.stringersCount} Pieces
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        Length: {boq.stringerBoardLengthFt} ft each
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">Tread Boards</span>
                      <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                        {boq.treadsCount} Planks
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        Width: {formatDim(stairWidthMm, unit)}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">Riser Fascias</span>
                      <div className="text-lg font-black text-purple-600 dark:text-purple-400 font-mono mt-0.5">
                        {boq.risersCount} Boards
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        Height: {formatDim(geo.actualRiserMm, unit)}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">Balusters</span>
                      <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                        {boq.balustersCount} Spindles
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        Max 4" (100mm) o.c.
                      </div>
                    </div>
                  </div>

                  {/* Timber Cost Table */}
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-50 dark:bg-zinc-800/80 text-zinc-500 font-bold border-b border-zinc-200 dark:border-zinc-800">
                        <tr>
                          <th className="p-3">Timber Framing Item</th>
                          <th className="p-3">Quantity</th>
                          <th className="p-3">Unit Rate</th>
                          <th className="p-3 text-right">Estimated Cost</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-mono">
                        <tr>
                          <td className="p-3 font-sans font-semibold text-zinc-800 dark:text-zinc-200">
                            2x12 Lumber Structural Stringers ({boq.stringerBoardLengthFt}ft)
                          </td>
                          <td className="p-3">{boq.stringersCount} Pieces</td>
                          <td className="p-3">
                            <input
                              type="number"
                              value={timberStringerRatePerPiece}
                              onChange={(e) => setTimberStringerRatePerPiece(parseFloat(e.target.value) || 0)}
                              className="w-24 px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 border-none text-xs"
                            />
                          </td>
                          <td className="p-3 text-right font-bold text-zinc-900 dark:text-white">
                            {currencySymbol}{boq.costTimberStringers.toLocaleString()}
                          </td>
                        </tr>

                        <tr>
                          <td className="p-3 font-sans font-semibold text-zinc-800 dark:text-zinc-200">
                            Hardwood Tread Planks ({formatDim(stairWidthMm, unit)})
                          </td>
                          <td className="p-3">{boq.treadsCount} Planks</td>
                          <td className="p-3">
                            <input
                              type="number"
                              value={timberTreadRatePerPiece}
                              onChange={(e) => setTimberTreadRatePerPiece(parseFloat(e.target.value) || 0)}
                              className="w-24 px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 border-none text-xs"
                            />
                          </td>
                          <td className="p-3 text-right font-bold text-zinc-900 dark:text-white">
                            {currencySymbol}{boq.costTimberTreads.toLocaleString()}
                          </td>
                        </tr>

                        <tr>
                          <td className="p-3 font-sans font-semibold text-zinc-800 dark:text-zinc-200">
                            Riser Fascia Boards
                          </td>
                          <td className="p-3">{boq.risersCount} Boards</td>
                          <td className="p-3">
                            <input
                              type="number"
                              value={timberRiserRatePerPiece}
                              onChange={(e) => setTimberRiserRatePerPiece(parseFloat(e.target.value) || 0)}
                              className="w-24 px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 border-none text-xs"
                            />
                          </td>
                          <td className="p-3 text-right font-bold text-zinc-900 dark:text-white">
                            {currencySymbol}{boq.costTimberRisers.toLocaleString()}
                          </td>
                        </tr>

                        <tr>
                          <td className="p-3 font-sans font-semibold text-zinc-800 dark:text-zinc-200">
                            Turned Wood Balusters (4" spacing)
                          </td>
                          <td className="p-3">{boq.balustersCount} Spindles</td>
                          <td className="p-3">
                            <input
                              type="number"
                              value={timberBalusterRatePerPiece}
                              onChange={(e) => setTimberBalusterRatePerPiece(parseFloat(e.target.value) || 0)}
                              className="w-24 px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 border-none text-xs"
                            />
                          </td>
                          <td className="p-3 text-right font-bold text-zinc-900 dark:text-white">
                            {currencySymbol}{boq.costTimberBalusters.toLocaleString()}
                          </td>
                        </tr>

                        <tr className="bg-indigo-50/50 dark:bg-indigo-950/30">
                          <td colSpan={3} className="p-3 font-sans font-bold text-indigo-900 dark:text-indigo-200 text-sm">
                            Total Estimated Timber Staircase Cost
                          </td>
                          <td className="p-3 text-right font-black text-indigo-600 dark:text-indigo-400 text-base">
                            {currencySymbol}{boq.totalTimberCost.toLocaleString()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 5: MULTI-FLIGHT & SPIRAL EXPLORER */}
          {activeTab === 'multitype' && (
            <div className="p-5 saas-card space-y-5">
              <div className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span>Multi-Flight (L-Shape / Dog-Legged) & Spiral Analyzer</span>
                </h4>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Shaft room dimensions, flight riser distributions, and circular helical step angles
                </p>
              </div>

              {/* Dog-Legged & L-Shape Analyzer */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                    Dog-Legged (180° Half Turn) Stairwell Space Envelope
                  </h5>
                  
                  {/* Flight 1 Riser count control */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-zinc-500">Flight 1 Risers:</span>
                    <input
                      type="number"
                      min={1}
                      max={geo.numRisers - 1}
                      value={flight1RiserCount}
                      onChange={(e) => setFlight1RiserCount(Math.max(1, Math.min(geo.numRisers - 1, parseInt(e.target.value) || 1)))}
                      className="w-16 px-2 py-1 rounded bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Flight 1 (Going Up)</span>
                    <div className="text-base font-black text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                      {geo.f1Risers} Risers
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      Run: {formatDim(geo.f1RunMm, unit)}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Flight 2 (To Floor)</span>
                    <div className="text-base font-black text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                      {geo.f2Risers} Risers
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      Run: {formatDim(geo.f2RunMm, unit)}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Required Stair Room</span>
                    <div className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                      {formatDim(geo.dogLeggedStairwellLengthMm, unit, false)} × {formatDim(geo.dogLeggedStairwellWidthMm, unit, false)} {unit}
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      Minimum room footprint
                    </p>
                  </div>
                </div>
              </div>

              {/* Spiral Staircase Metrics */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-4">
                <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  Circular Spiral / Helical Staircase Geometry
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Inner Tread (at Post)</span>
                    <div className="text-sm font-black text-zinc-900 dark:text-white font-mono mt-0.5">
                      {formatDim(geo.spiralTreadInnerMm, unit)}
                    </div>
                    <p className="text-[9px] text-zinc-400 mt-0.5">Min 100mm required</p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Walkline Going (60%)</span>
                    <div className="text-sm font-black text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                      {formatDim(geo.spiralTreadWalklineMm, unit)}
                    </div>
                    <p className="text-[9px] text-zinc-400 mt-0.5">Primary foot placement</p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Outer Tread</span>
                    <div className="text-sm font-black text-zinc-900 dark:text-white font-mono mt-0.5">
                      {formatDim(geo.spiralTreadOuterMm, unit)}
                    </div>
                    <p className="text-[9px] text-zinc-400 mt-0.5">Wide perimeter edge</p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Angle Per Step</span>
                    <div className="text-sm font-black text-purple-600 dark:text-purple-400 font-mono mt-0.5">
                      {geo.degreesPerTread.toFixed(1)}°
                    </div>
                    <p className="text-[9px] text-zinc-400 mt-0.5">{spiralAngleDeg}° total rotation</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

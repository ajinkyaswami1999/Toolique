import { useState, useMemo } from 'react';
import {
  Ruler, Copy, Check, RotateCcw, Building,
  FileSpreadsheet, FileText, Share2, Layers,
  Compass, Scale, Droplets, ShieldCheck,
  AlertTriangle, CheckCircle2,
  Maximize2
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import SEO from '../components/SEO';
import MaterialTrendGraph from '../components/MaterialTrendGraph';

// -------------------------------------------------------------
// Engineering Types & Constants (Harmonised 2021 / NBC 2016 / ADA / UK Part M)
// -------------------------------------------------------------
export type UnitType = 'mm' | 'm' | 'in' | 'ft';
export type StandardType = 'harmonised2021' | 'nbc2016' | 'ada2010' | 'ukPartM' | 'hospitalStretcher';
export type LayoutType = 'straight' | 'l_shape' | 'switchback';

export interface StandardConfig {
  id: StandardType;
  label: string;
  codeRef: string;
  maxSlopeRatio: number; // e.g. 12 for 1:12 (8.33%)
  recommendedSlopeRatio: number; // e.g. 15 for 1:15 (6.67%)
  maxSingleRiseMm: number; // in mm
  maxSingleRunLengthMm: number; // in mm
  minWidthMm: number; // in mm
  landingLengthMm: number; // in mm
  landingWidthMm: number; // in mm
  handrailUpperHeightMm: number; // 900mm
  handrailLowerHeightMm: number; // 760mm
  handrailExtensionMm: number; // 300mm
  kerbMinHeightMm: number; // 75mm - 100mm
  tactileStripDepthMm: number; // 300mm
  maxCrossSlopePct: number; // 2.0%
  description: string;
}

export const REGULATORY_STANDARDS: Record<StandardType, StandardConfig> = {
  harmonised2021: {
    id: 'harmonised2021',
    label: 'Harmonised Guidelines 2021 (India - MoHUA / CPWD)',
    codeRef: 'Harmonised Guidelines 2021 Sec 4.4 / CPWD Accessibility Norms',
    maxSlopeRatio: 12,
    recommendedSlopeRatio: 15,
    maxSingleRiseMm: 750,
    maxSingleRunLengthMm: 9000,
    minWidthMm: 1500, // 1200mm internal, 1500mm public
    landingLengthMm: 1500,
    landingWidthMm: 1500,
    handrailUpperHeightMm: 900,
    handrailLowerHeightMm: 760,
    handrailExtensionMm: 300,
    kerbMinHeightMm: 75,
    tactileStripDepthMm: 300,
    maxCrossSlopePct: 2.0,
    description: 'Mandatory standard for barrier-free built environment in India. Max gradient 1:12 (short rise ≤150mm), ideal 1:15 to 1:20. Minimum clear width 1500mm for public access. 1500x1500mm landing every 750mm rise.'
  },
  nbc2016: {
    id: 'nbc2016',
    label: 'NBC India 2016 (Part 3 Accessibility)',
    codeRef: 'National Building Code of India 2016 Part 3 Annex B / Cl. 13',
    maxSlopeRatio: 12,
    recommendedSlopeRatio: 15,
    maxSingleRiseMm: 750,
    maxSingleRunLengthMm: 9000,
    minWidthMm: 1200,
    landingLengthMm: 1500,
    landingWidthMm: 1500,
    handrailUpperHeightMm: 900,
    handrailLowerHeightMm: 750,
    handrailExtensionMm: 300,
    kerbMinHeightMm: 50,
    tactileStripDepthMm: 300,
    maxCrossSlopePct: 2.0,
    description: 'Bureau of Indian Standards NBC 2016 Part 3. Max slope 1:12, preferred 1:15. Max single flight rise 750mm between intermediate resting landings. Minimum clear width 1200mm (residential) or 1500mm (commercial).'
  },
  ada2010: {
    id: 'ada2010',
    label: 'ADA Standards 2010 (US Access Board)',
    codeRef: '2010 ADA Standards for Accessible Design Section 405 (Ramps)',
    maxSlopeRatio: 12,
    recommendedSlopeRatio: 16,
    maxSingleRiseMm: 762, // 30 inches
    maxSingleRunLengthMm: 9144, // 30 feet
    minWidthMm: 915, // 36 inches
    landingLengthMm: 1525, // 60 inches
    landingWidthMm: 1525, // 60 inches
    handrailUpperHeightMm: 915, // 34-38 inches
    handrailLowerHeightMm: 700,
    handrailExtensionMm: 305, // 12 inches
    kerbMinHeightMm: 50, // 2 inches
    tactileStripDepthMm: 610, // 24 inches
    maxCrossSlopePct: 2.08, // 1:48
    description: 'US Department of Justice ADA 2010 Standards Section 405. Max slope 1:12 (8.33%). Max single rise 30 inches (762mm). Minimum clear width 36 inches (915mm). Intermediate landings minimum 60x60 inches.'
  },
  ukPartM: {
    id: 'ukPartM',
    label: 'UK Approved Document M (Vol 1 & 2)',
    codeRef: 'HM Government Building Regs 2010 Approved Document M',
    maxSlopeRatio: 12,
    recommendedSlopeRatio: 20,
    maxSingleRiseMm: 500,
    maxSingleRunLengthMm: 10000,
    minWidthMm: 1500,
    landingLengthMm: 1500,
    landingWidthMm: 1500,
    handrailUpperHeightMm: 900,
    handrailLowerHeightMm: 600,
    handrailExtensionMm: 300,
    kerbMinHeightMm: 100,
    tactileStripDepthMm: 400,
    maxCrossSlopePct: 2.0,
    description: 'UK Access to and use of buildings. Max single flight rise 500mm. Stepped maximum slopes: 1:12 for rise ≤166mm, 1:15 for rise ≤333mm, 1:20 for rise ≤500mm. Clear width min 1500mm.'
  },
  hospitalStretcher: {
    id: 'hospitalStretcher',
    label: 'Hospital Stretcher & Bed Transfer Ramp',
    codeRef: 'AERB & NABH Hospital Infrastructure Standards / IS 12433',
    maxSlopeRatio: 15,
    recommendedSlopeRatio: 20,
    maxSingleRiseMm: 600,
    maxSingleRunLengthMm: 9000,
    minWidthMm: 1800,
    landingLengthMm: 2000,
    landingWidthMm: 2000,
    handrailUpperHeightMm: 900,
    handrailLowerHeightMm: 750,
    handrailExtensionMm: 450,
    kerbMinHeightMm: 100,
    tactileStripDepthMm: 300,
    maxCrossSlopePct: 1.5,
    description: 'Clinical & hospital emergency bed transfer guidelines. Gentle 1:15 to 1:20 slope with extra-wide 1800-2000mm clear width to accommodate standard 2.2m patient stretchers and turning radii.'
  }
};

export interface RegionalRate {
  city: string;
  rccConcretePerM3: number; // ₹/m3 (M20 grade)
  ssHandrailPerRmt: number; // ₹/RMT (SS 304 dual rail)
  flooringPerSqFt: number; // ₹/sq.ft (Anti-skid flamed granite/vitrified)
  tactileTilePerPiece: number; // ₹/tile (300x300mm TGSI)
}

export const REGIONAL_RATES: Record<string, RegionalRate> = {
  mumbai: {
    city: 'Mumbai MMR',
    rccConcretePerM3: 6800,
    ssHandrailPerRmt: 3400,
    flooringPerSqFt: 140,
    tactileTilePerPiece: 180
  },
  delhi: {
    city: 'Delhi NCR',
    rccConcretePerM3: 6200,
    ssHandrailPerRmt: 3100,
    flooringPerSqFt: 120,
    tactileTilePerPiece: 160
  },
  bengaluru: {
    city: 'Bengaluru',
    rccConcretePerM3: 6500,
    ssHandrailPerRmt: 3250,
    flooringPerSqFt: 130,
    tactileTilePerPiece: 170
  },
  hyderabad: {
    city: 'Hyderabad',
    rccConcretePerM3: 6100,
    ssHandrailPerRmt: 2950,
    flooringPerSqFt: 115,
    tactileTilePerPiece: 150
  },
  pune: {
    city: 'Pune',
    rccConcretePerM3: 6300,
    ssHandrailPerRmt: 3150,
    flooringPerSqFt: 125,
    tactileTilePerPiece: 165
  },
  chennai: {
    city: 'Chennai',
    rccConcretePerM3: 6400,
    ssHandrailPerRmt: 3050,
    flooringPerSqFt: 120,
    tactileTilePerPiece: 155
  },
  kolkata: {
    city: 'Kolkata',
    rccConcretePerM3: 5900,
    ssHandrailPerRmt: 2850,
    flooringPerSqFt: 110,
    tactileTilePerPiece: 140
  },
  ahmedabad: {
    city: 'Ahmedabad',
    rccConcretePerM3: 6000,
    ssHandrailPerRmt: 2900,
    flooringPerSqFt: 115,
    tactileTilePerPiece: 145
  }
};

export default function AccessibleRampCalculator() {
  const [activeTab, setActiveTab] = useState<number>(1);
  const [unit, setUnit] = useState<UnitType>('mm');
  const [standard, setStandard] = useState<StandardType>('harmonised2021');
  const [layout, setLayout] = useState<LayoutType>('straight');

  // Dimension Inputs in Selected Display Unit
  const [totalRiseInput, setTotalRiseInput] = useState<number>(600); // 600 mm default
  const [rampWidthInput, setRampWidthInput] = useState<number>(1500); // 1500 mm default
  const [slopeRatioInput, setSlopeRatioInput] = useState<number>(12); // 1:12 default
  const [slabThicknessMm, setSlabThicknessMm] = useState<number>(150); // 150 mm RCC slab
  const [kerbHeightMm, setKerbHeightMm] = useState<number>(100); // 100 mm kerb
  const [concreteGrade, setConcreteGrade] = useState<'M20' | 'M25'>('M20');
  const [selectedCity, setSelectedCity] = useState<string>('mumbai');

  // UI state
  const [copied, setCopied] = useState<boolean>(false);

  // Conversion Helpers to Base MM
  const toMmFactor = useMemo(() => {
    switch (unit) {
      case 'm': return 1000;
      case 'in': return 25.4;
      case 'ft': return 304.8;
      case 'mm': default: return 1;
    }
  }, [unit]);

  const fromMmFactor = useMemo(() => 1 / toMmFactor, [toMmFactor]);

  // Unit conversion handler
  const handleUnitChange = (newUnit: UnitType) => {
    let oldFactor = 1;
    if (unit === 'm') oldFactor = 1000;
    else if (unit === 'in') oldFactor = 25.4;
    else if (unit === 'ft') oldFactor = 304.8;

    let newFactor = 1;
    if (newUnit === 'm') newFactor = 1000;
    else if (newUnit === 'in') newFactor = 25.4;
    else if (newUnit === 'ft') newFactor = 304.8;

    const ratio = oldFactor / newFactor;
    setUnit(newUnit);
    setTotalRiseInput(parseFloat((totalRiseInput * ratio).toFixed(newUnit === 'mm' ? 0 : 2)));
    setRampWidthInput(parseFloat((rampWidthInput * ratio).toFixed(newUnit === 'mm' ? 0 : 2)));
  };

  // Base Values in Millimeters
  const baseRiseMm = Math.max(1, totalRiseInput * toMmFactor);
  const baseWidthMm = Math.max(100, rampWidthInput * toMmFactor);
  const baseSlopeRatio = Math.max(1, slopeRatioInput);

  const currentStandardConfig = REGULATORY_STANDARDS[standard];

  // -------------------------------------------------------------
  // Comprehensive Architectural & Civil Engineering Calculations
  // -------------------------------------------------------------
  const rampCalc = useMemo(() => {
    const std = currentStandardConfig;
    const maxRisePerFlight = std.maxSingleRiseMm;

    // Flights calculation
    let calculatedFlights = Math.max(1, Math.ceil(baseRiseMm / maxRisePerFlight));
    if (layout === 'l_shape' && calculatedFlights < 2) calculatedFlights = 2;
    if (layout === 'switchback' && calculatedFlights < 2) calculatedFlights = 2;

    const flightsCount = calculatedFlights;
    const intermediateLandingsCount = flightsCount - 1;
    const totalLandingsCount = intermediateLandingsCount + 2; // Top + Bottom + Intermediates

    // Single Flight Geometry
    const risePerFlightMm = baseRiseMm / flightsCount;
    const horizontalRunPerFlightMm = risePerFlightMm * baseSlopeRatio;
    const slopeHypotenusePerFlightMm = Math.sqrt(
      horizontalRunPerFlightMm * horizontalRunPerFlightMm + risePerFlightMm * risePerFlightMm
    );

    // Total Ramp Slope & Run Lengths
    const totalRampRunLengthMm = horizontalRunPerFlightMm * flightsCount;
    const totalRampSlopeLengthMm = slopeHypotenusePerFlightMm * flightsCount;

    // Landings
    const landingLenMm = std.landingLengthMm;
    const landingWidthMm = Math.max(baseWidthMm, std.landingWidthMm);

    // Slope angle & gradient
    const slopePct = (1 / baseSlopeRatio) * 100;
    const slopeAngleDeg = Math.atan(1 / baseSlopeRatio) * (180 / Math.PI);

    // Overall Footprint Dimensions based on Layout
    let footprintLengthMm = 0;
    let footprintWidthMm = 0;

    if (layout === 'straight') {
      // Linear run: Bottom landing + Flights + Intermediate landings + Top landing
      footprintLengthMm = landingLenMm * 2 + totalRampRunLengthMm + intermediateLandingsCount * landingLenMm;
      footprintWidthMm = baseWidthMm + 200; // Including kerbs & handrails
    } else if (layout === 'l_shape') {
      // 90 deg turn: Flight 1 + Corner Landing + Flight 2
      const f1Run = horizontalRunPerFlightMm;
      const f2Run = horizontalRunPerFlightMm * (flightsCount - 1);
      footprintLengthMm = landingLenMm + f1Run + landingWidthMm;
      footprintWidthMm = landingLenMm + f2Run + landingWidthMm;
    } else if (layout === 'switchback') {
      // 180 deg U-turn: Parallel flights side by side
      const longestFlightRun = horizontalRunPerFlightMm * Math.ceil(flightsCount / 2);
      footprintLengthMm = landingLenMm * 2 + longestFlightRun; // Bottom landing + run + switchback turning landing
      footprintWidthMm = baseWidthMm * 2 + 300; // Two flight widths + 300mm central railing divide
    }

    const footprintAreaSqM = (footprintLengthMm * footprintWidthMm) / 1_000_000;
    const footprintAreaSqFt = footprintAreaSqM * 10.7639;

    // Handrail requirements
    const handrailsRequired = baseRiseMm > 150 || horizontalRunPerFlightMm > 1800;
    const totalHandrailLengthM = (
      (totalRampSlopeLengthMm + (totalLandingsCount * landingLenMm) + (std.handrailExtensionMm * 2 * flightsCount)) * 4
    ) / 1000; // 4 rows total (dual rails both left & right)

    const balusterPostCount = Math.max(4, Math.ceil((totalRampRunLengthMm + totalLandingsCount * landingLenMm) / 1200) * 2);

    // Compliance Matrix Audits
    const slopeAudit = {
      name: 'Slope Ratio & Gradient',
      target: `1:${baseSlopeRatio} (${slopePct.toFixed(2)}%)`,
      limit: `Max 1:${std.maxSlopeRatio} (${((1 / std.maxSlopeRatio) * 100).toFixed(2)}%)`,
      pass: baseSlopeRatio >= std.maxSlopeRatio,
      note: baseSlopeRatio >= std.recommendedSlopeRatio
        ? 'Optimal gentle gradient for effortless self-propelling wheelchairs.'
        : baseSlopeRatio >= std.maxSlopeRatio
        ? 'Compliant with maximum regulatory threshold, but steeper than recommended.'
        : `Non-compliant! Exceeds maximum permissible slope of 1:${std.maxSlopeRatio}.`
    };

    const riseAudit = {
      name: 'Single Flight Max Rise',
      target: `${risePerFlightMm.toFixed(0)} mm`,
      limit: `Max ${std.maxSingleRiseMm} mm`,
      pass: risePerFlightMm <= std.maxSingleRiseMm + 0.1,
      note: risePerFlightMm <= std.maxSingleRiseMm
        ? `Within safe limits. Ramp is divided into ${flightsCount} flight(s) with ${intermediateLandingsCount} resting landing(s).`
        : `Exceeds single rise threshold! Add more intermediate landings.`
    };

    const widthAudit = {
      name: 'Clear Ramp Width',
      target: `${baseWidthMm.toFixed(0)} mm`,
      limit: `Min ${std.minWidthMm} mm`,
      pass: baseWidthMm >= std.minWidthMm,
      note: baseWidthMm >= std.minWidthMm
        ? 'Passes minimum clear passage width for accessible wheelchairs.'
        : `Deficient width! Requires minimum ${std.minWidthMm} mm clear passage.`
    };

    const landingAudit = {
      name: 'Landing Platform Dimensions',
      target: `${landingLenMm} × ${landingWidthMm} mm`,
      limit: `Min ${std.landingLengthMm} × ${std.landingWidthMm} mm`,
      pass: landingLenMm >= std.landingLengthMm && landingWidthMm >= std.landingWidthMm,
      note: 'Accommodates standard Ø1500mm (60") wheelchair 360° turning circle.'
    };

    const handrailAudit = {
      name: 'Dual Continuous Handrails',
      target: `${std.handrailUpperHeightMm} mm (Upper) & ${std.handrailLowerHeightMm} mm (Lower)`,
      limit: `Dual heights + ${std.handrailExtensionMm} mm horizontal extensions`,
      pass: true,
      note: 'Continuous on both sides with rounded ends and tactile indicators.'
    };

    const kerbAudit = {
      name: 'Edge Protection Kerb',
      target: `${kerbHeightMm} mm height`,
      limit: `Min ${std.kerbMinHeightMm} mm height`,
      pass: kerbHeightMm >= std.kerbMinHeightMm,
      note: kerbHeightMm >= std.kerbMinHeightMm
        ? 'Prevents wheelchair castors and walking sticks from slipping off edge.'
        : `Sub-standard kerb! Increase kerb height to at least ${std.kerbMinHeightMm} mm.`
    };

    const tgsiAudit = {
      name: 'TGSI Tactile Hazard Tiles',
      target: `${std.tactileStripDepthMm} mm deep warning strip`,
      limit: `Mandatory at top & bottom approaches`,
      pass: true,
      note: 'Provides tactile and luminance contrast warning for visually impaired persons.'
    };

    const allAudits = [slopeAudit, riseAudit, widthAudit, landingAudit, handrailAudit, kerbAudit, tgsiAudit];
    const isOverallCompliant = allAudits.every(a => a.pass);

    // -------------------------------------------------------------
    // Structural Takeoff & Material Estimates
    // -------------------------------------------------------------
    const slabThickM = slabThicknessMm / 1000;
    const kerbHeightM = kerbHeightMm / 1000;
    const kerbWidthM = 0.100; // 100 mm wide kerb
    const rampWidthM = baseWidthMm / 1000;

    // Wet Concrete Volumes (m3)
    const inclinedSlabVolM3 = (totalRampSlopeLengthMm / 1000) * rampWidthM * slabThickM;
    const landingsVolM3 = totalLandingsCount * (landingLenMm / 1000) * (landingWidthMm / 1000) * slabThickM;
    const kerbsVolM3 = 2 * ((totalRampSlopeLengthMm + (totalLandingsCount * landingLenMm)) / 1000) * kerbWidthM * kerbHeightM;
    const totalWetConcreteM3 = inclinedSlabVolM3 + landingsVolM3 + kerbsVolM3;
    const totalWetConcreteCuFt = totalWetConcreteM3 * 35.3147;

    // Dry Concrete Multiplier = 1.54x (IS 456)
    const dryConcreteM3 = totalWetConcreteM3 * 1.54;

    // Mix Proportions: M20 (1:1.5:3, sum = 5.5) or M25 (1:1:2, sum = 4)
    const mixSum = concreteGrade === 'M20' ? 5.5 : 4;
    const cementRatio = 1;
    const sandRatio = concreteGrade === 'M20' ? 1.5 : 1;
    const aggRatio = concreteGrade === 'M20' ? 3 : 2;

    const cementM3 = (dryConcreteM3 * cementRatio) / mixSum;
    const cementBags = cementM3 / 0.0347; // 50kg bag = 0.0347 m3
    const cementWeightKg = cementBags * 50;

    const sandM3 = (dryConcreteM3 * sandRatio) / mixSum;
    const sandCuFt = sandM3 * 35.3147;
    const sandBrass = sandCuFt / 100;
    const sandTonnes = (sandM3 * 1600) / 1000; // 1600 kg/m3

    const aggM3 = (dryConcreteM3 * aggRatio) / mixSum;
    const aggCuFt = aggM3 * 35.3147;
    const aggBrass = aggCuFt / 100;
    const aggTonnes = (aggM3 * 1550) / 1000; // 1550 kg/m3

    // Flooring & Tactile Warning Tiles
    const rampSurfaceAreaSqM = ((totalRampSlopeLengthMm + totalLandingsCount * landingLenMm) / 1000) * rampWidthM;
    const rampSurfaceAreaSqFt = rampSurfaceAreaSqM * 10.7639;

    const tactileTileWidthM = 0.3; // 300x300mm tile
    const tactileStripsCount = 2; // Top and bottom
    const tactileTilesNeeded = Math.ceil((rampWidthM / tactileTileWidthM) * tactileStripsCount);

    // Cost Breakdown based on City Rates
    const cityRates = REGIONAL_RATES[selectedCity] || REGIONAL_RATES.mumbai;
    const costConcrete = totalWetConcreteM3 * cityRates.rccConcretePerM3;
    const costHandrails = totalHandrailLengthM * cityRates.ssHandrailPerRmt;
    const costFlooring = rampSurfaceAreaSqFt * cityRates.flooringPerSqFt;
    const costTactile = tactileTilesNeeded * cityRates.tactileTilePerPiece;
    const totalEstimatedCost = costConcrete + costHandrails + costFlooring + costTactile;

    return {
      flightsCount,
      intermediateLandingsCount,
      totalLandingsCount,
      risePerFlightMm,
      horizontalRunPerFlightMm,
      slopeHypotenusePerFlightMm,
      totalRampRunLengthMm,
      totalRampSlopeLengthMm,
      landingLenMm,
      landingWidthMm,
      slopePct,
      slopeAngleDeg,
      footprintLengthMm,
      footprintWidthMm,
      footprintAreaSqM,
      footprintAreaSqFt,
      handrailsRequired,
      totalHandrailLengthM,
      balusterPostCount,
      allAudits,
      isOverallCompliant,
      // Takeoff
      totalWetConcreteM3,
      totalWetConcreteCuFt,
      cementBags,
      cementWeightKg,
      sandCuFt,
      sandBrass,
      sandTonnes,
      aggCuFt,
      aggBrass,
      aggTonnes,
      rampSurfaceAreaSqM,
      rampSurfaceAreaSqFt,
      tactileTilesNeeded,
      // Cost
      costConcrete,
      costHandrails,
      costFlooring,
      costTactile,
      totalEstimatedCost,
      cityRates
    };
  }, [baseRiseMm, baseWidthMm, baseSlopeRatio, currentStandardConfig, layout, slabThicknessMm, kerbHeightMm, concreteGrade, selectedCity]);

  // Quick Format Helper for Display Units
  const fmt = (valMm: number, decimals: number = 0) => {
    const val = valMm * fromMmFactor;
    return val.toLocaleString('en-IN', { maximumFractionDigits: decimals });
  };

  // 1-Click Clipboard summary
  const copySummaryReport = () => {
    const std = REGULATORY_STANDARDS[standard];
    const text = `♿ ACCESSIBLE RAMP AUDIT & COMPLIANCE REPORT
--------------------------------------------------
Standard: ${std.label} (${std.codeRef})
Layout Geometry: ${layout.toUpperCase().replace('_', ' ')}
Total Rise: ${totalRiseInput} ${unit} (${baseRiseMm.toFixed(0)} mm)
Clear Ramp Width: ${rampWidthInput} ${unit} (${baseWidthMm.toFixed(0)} mm)
Slope Ratio: 1:${baseSlopeRatio} (${rampCalc.slopePct.toFixed(2)}% / ${rampCalc.slopeAngleDeg.toFixed(1)}°)

📐 GEOMETRY & FLIGHT BREAKDOWN:
- Number of Flights: ${rampCalc.flightsCount} flight(s)
- Rise per Flight: ${fmt(rampCalc.risePerFlightMm, 1)} ${unit}
- Single Flight Horizontal Run: ${fmt(rampCalc.horizontalRunPerFlightMm, 1)} ${unit}
- Net Ramp Run Length: ${fmt(rampCalc.totalRampRunLengthMm, 1)} ${unit}
- Intermediate Landings: ${rampCalc.intermediateLandingsCount} resting landing(s) (${fmt(rampCalc.landingLenMm)} × ${fmt(rampCalc.landingWidthMm)} ${unit})
- Total Footprint: ${fmt(rampCalc.footprintLengthMm, 1)} × ${fmt(rampCalc.footprintWidthMm, 1)} ${unit} (${rampCalc.footprintAreaSqFt.toFixed(1)} sq.ft)

🛡️ COMPLIANCE STATUS: ${rampCalc.isOverallCompliant ? '✅ 100% COMPLIANT' : '⚠️ NON-COMPLIANT'}
- Slope Gradient: ${rampCalc.allAudits[0].pass ? 'PASS' : 'FAIL'}
- Single Rise Threshold: ${rampCalc.allAudits[1].pass ? 'PASS' : 'FAIL'}
- Clear Passage Width: ${rampCalc.allAudits[2].pass ? 'PASS' : 'FAIL'}
- Landing Dimensions: ${rampCalc.allAudits[3].pass ? 'PASS' : 'FAIL'}
- Continuous Dual Handrails: 900mm upper / 760mm lower (Total: ${rampCalc.totalHandrailLengthM.toFixed(1)} RMT)
- Edge Protection Kerb: ${kerbHeightMm} mm height

🏗️ MATERIAL & BOQ TAKEOFF (${concreteGrade} Grade):
- RCC Concrete Volume: ${rampCalc.totalWetConcreteM3.toFixed(2)} m³ (${rampCalc.totalWetConcreteCuFt.toFixed(1)} cu.ft)
- Cement Bags (50kg): ${Math.ceil(rampCalc.cementBags)} bags
- Fine Aggregate / Sand: ${rampCalc.sandBrass.toFixed(2)} Brass (${rampCalc.sandCuFt.toFixed(1)} CFT / ${rampCalc.sandTonnes.toFixed(2)} T)
- Coarse Aggregate: ${rampCalc.aggBrass.toFixed(2)} Brass (${rampCalc.aggCuFt.toFixed(1)} CFT)
- Dual SS 304 Railing: ${rampCalc.totalHandrailLengthM.toFixed(1)} RMT (${(rampCalc.totalHandrailLengthM * 3.28084).toFixed(1)} RFT)
- Anti-Skid Ramp Flooring: ${rampCalc.rampSurfaceAreaSqFt.toFixed(1)} sq.ft (${rampCalc.rampSurfaceAreaSqM.toFixed(2)} m²)
- TGSI Tactile Hazard Pavers: ${rampCalc.tactileTilesNeeded} tiles (300×300mm)
- Estimated Project Cost (${rampCalc.cityRates.city}): ₹${Math.round(rampCalc.totalEstimatedCost).toLocaleString('en-IN')}

Generated via ToolStack India Accessible Ramp Engineering Suite.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // WhatsApp Share Handler
  const shareViaWhatsApp = () => {
    const summary = `*♿ Accessible Ramp Design & BOQ Estimate*
*Standard:* ${REGULATORY_STANDARDS[standard].label}
*Layout:* ${layout.toUpperCase().replace('_', ' ')}
*Total Rise:* ${totalRiseInput} ${unit} | *Clear Width:* ${rampWidthInput} ${unit}
*Slope:* 1:${baseSlopeRatio} (${rampCalc.slopePct.toFixed(2)}%)
*Status:* ${rampCalc.isOverallCompliant ? '✅ COMPLIANT' : '⚠️ NON-COMPLIANT'}

*Key Dimensions:*
- Flights: ${rampCalc.flightsCount} | Landings: ${rampCalc.totalLandingsCount}
- Single Run: ${fmt(rampCalc.horizontalRunPerFlightMm)} ${unit}
- Total Footprint: ${fmt(rampCalc.footprintLengthMm)} × ${fmt(rampCalc.footprintWidthMm)} ${unit}

*Material Takeoff:*
- Concrete: ${rampCalc.totalWetConcreteM3.toFixed(2)} m³ (${Math.ceil(rampCalc.cementBags)} cement bags)
- Sand: ${rampCalc.sandBrass.toFixed(2)} Brass | SS304 Rails: ${rampCalc.totalHandrailLengthM.toFixed(1)} RMT
- Est. Cost (${rampCalc.cityRates.city}): ₹${Math.round(rampCalc.totalEstimatedCost).toLocaleString('en-IN')}

_Calculated on ToolStack India Ramp Engineering Suite_`;

    const url = `https://wa.me/?text=${encodeURIComponent(summary)}`;
    window.open(url, '_blank');
  };

  // Multi-Sheet Excel Export
  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Ramp Geometry & Parameters
    const geomData = [
      ['ACCESSIBLE RAMP DESIGN & AUDIT SHEET'],
      ['Project Standard', REGULATORY_STANDARDS[standard].label],
      ['Standard Reference Code', REGULATORY_STANDARDS[standard].codeRef],
      ['Layout Configuration', layout.toUpperCase().replace('_', ' ')],
      ['Unit System', unit.toUpperCase()],
      [''],
      ['PARAMETER', 'VALUE', 'UNIT', 'STANDARD REQUIREMENT', 'STATUS'],
      ['Total Target Rise', totalRiseInput, unit, `${REGULATORY_STANDARDS[standard].maxSingleRiseMm} mm max per flight`, 'INPUT'],
      ['Clear Ramp Width', rampWidthInput, unit, `Min ${REGULATORY_STANDARDS[standard].minWidthMm} mm`, rampCalc.allAudits[2].pass ? 'PASS' : 'FAIL'],
      ['Slope Ratio (1:X)', `1:${baseSlopeRatio}`, '-', `Max 1:${REGULATORY_STANDARDS[standard].maxSlopeRatio} (Ideal 1:${REGULATORY_STANDARDS[standard].recommendedSlopeRatio})`, rampCalc.allAudits[0].pass ? 'PASS' : 'FAIL'],
      ['Slope Gradient (%)', `${rampCalc.slopePct.toFixed(2)}%`, '%', `${((1 / REGULATORY_STANDARDS[standard].maxSlopeRatio) * 100).toFixed(2)}% max`, rampCalc.allAudits[0].pass ? 'PASS' : 'FAIL'],
      ['Slope Angle (Degrees)', `${rampCalc.slopeAngleDeg.toFixed(2)}°`, 'Deg', '-', 'INFO'],
      ['Number of Flights', rampCalc.flightsCount, 'flights', '-', 'CALCULATED'],
      ['Rise per Flight', fmt(rampCalc.risePerFlightMm, 1), unit, `${REGULATORY_STANDARDS[standard].maxSingleRiseMm} mm max`, rampCalc.allAudits[1].pass ? 'PASS' : 'FAIL'],
      ['Horizontal Run per Flight', fmt(rampCalc.horizontalRunPerFlightMm, 1), unit, '-', 'CALCULATED'],
      ['Total Ramp Run Length', fmt(rampCalc.totalRampRunLengthMm, 1), unit, '-', 'CALCULATED'],
      ['Total Ramp Slope Length', fmt(rampCalc.totalRampSlopeLengthMm, 1), unit, '-', 'CALCULATED'],
      ['Intermediate Landings', rampCalc.intermediateLandingsCount, 'landings', 'Required every 750mm rise', 'INFO'],
      ['Landing Dimensions', `${fmt(rampCalc.landingLenMm)} x ${fmt(rampCalc.landingWidthMm)}`, unit, `Min ${REGULATORY_STANDARDS[standard].landingLengthMm} x ${REGULATORY_STANDARDS[standard].landingWidthMm} mm`, rampCalc.allAudits[3].pass ? 'PASS' : 'FAIL'],
      ['Footprint Length', fmt(rampCalc.footprintLengthMm, 1), unit, '-', 'CALCULATED'],
      ['Footprint Width', fmt(rampCalc.footprintWidthMm, 1), unit, '-', 'CALCULATED'],
      ['Footprint Area', `${rampCalc.footprintAreaSqM.toFixed(2)} m² (${rampCalc.footprintAreaSqFt.toFixed(1)} sq.ft)`, '-', '-', 'CALCULATED'],
      ['Overall Compliance Audit', rampCalc.isOverallCompliant ? '100% COMPLIANT' : 'NON-COMPLIANT', '-', 'All accessibility clauses', rampCalc.isOverallCompliant ? 'PASS' : 'FAIL']
    ];
    const wsGeom = XLSX.utils.aoa_to_sheet(geomData);
    XLSX.utils.book_append_sheet(wb, wsGeom, 'Ramp Geometry');

    // Sheet 2: Material Takeoff & BOQ
    const boqData = [
      ['BILL OF QUANTITIES & MATERIAL TAKEOFF (BOQ)'],
      ['Concrete Mix Grade', concreteGrade],
      ['City Market Preset', rampCalc.cityRates.city],
      [''],
      ['ITEM DESCRIPTION', 'QUANTITY', 'UNIT', 'UNIT RATE (INR)', 'TOTAL AMOUNT (INR)'],
      ['RCC M20/M25 Concrete (Inclined Slab + Landings + Kerbs)', rampCalc.totalWetConcreteM3.toFixed(2), 'Cubic Meter (m³)', rampCalc.cityRates.rccConcretePerM3, Math.round(rampCalc.costConcrete)],
      ['Cement Bags (50kg OPC/PPC)', Math.ceil(rampCalc.cementBags), 'Bags (50kg)', '-', '-'],
      ['Fine Aggregate / Sand', `${rampCalc.sandBrass.toFixed(2)} Brass (${rampCalc.sandCuFt.toFixed(1)} CFT)`, 'Brass / CFT', '-', '-'],
      ['Coarse Aggregate 20mm', `${rampCalc.aggBrass.toFixed(2)} Brass (${rampCalc.aggCuFt.toFixed(1)} CFT)`, 'Brass / CFT', '-', '-'],
      ['SS 304 Dual Continuous Handrails (900mm & 760mm heights)', rampCalc.totalHandrailLengthM.toFixed(2), 'Running Metre (RMT)', rampCalc.cityRates.ssHandrailPerRmt, Math.round(rampCalc.costHandrails)],
      ['Anti-Skid Ramp Vitrified / Flamed Granite Flooring', rampCalc.rampSurfaceAreaSqFt.toFixed(2), 'Square Feet (sq.ft)', rampCalc.cityRates.flooringPerSqFt, Math.round(rampCalc.costFlooring)],
      ['TGSI Tactile Hazard Warning Pavers (300x300mm)', rampCalc.tactileTilesNeeded, 'Pieces', rampCalc.cityRates.tactileTilePerPiece, Math.round(rampCalc.costTactile)],
      [''],
      ['TOTAL ESTIMATED DIRECT COST (INR)', '', '', '', Math.round(rampCalc.totalEstimatedCost)]
    ];
    const wsBoq = XLSX.utils.aoa_to_sheet(boqData);
    XLSX.utils.book_append_sheet(wb, wsBoq, 'Material BOQ & Cost');

    XLSX.writeFile(wb, `Accessible_Ramp_Takeoff_${standard}_${layout}.xlsx`);
  };

  // High-Resolution PDF Compliance Certificate & Report
  const generatePdfReport = () => {
    const doc = new jsPDF();
    const std = REGULATORY_STANDARDS[standard];

    // Header Banner
    doc.setFillColor(30, 41, 59); // Slate-900
    doc.rect(0, 0, 210, 32, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('ACCESSIBLE RAMP COMPLIANCE & TAKEOFF REPORT', 14, 15);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(`Standard: ${std.label} | Layout: ${layout.toUpperCase()}`, 14, 23);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} | ToolStack India`, 14, 28);

    // Compliance Status Pill
    if (rampCalc.isOverallCompliant) {
      doc.setFillColor(16, 185, 129); // Emerald-500
      doc.roundedRect(145, 10, 50, 14, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('100% COMPLIANT', 151, 19);
    } else {
      doc.setFillColor(239, 68, 68); // Red-500
      doc.roundedRect(145, 10, 50, 14, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('NON-COMPLIANT', 152, 19);
    }

    let y = 42;

    // Section 1: Geometric Specifications
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('1. Geometric Design Parameters', 14, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    const geomRows = [
      ['Total Target Rise', `${totalRiseInput} ${unit} (${baseRiseMm.toFixed(0)} mm)`],
      ['Clear Ramp Passage Width', `${rampWidthInput} ${unit} (${baseWidthMm.toFixed(0)} mm) [Min: ${std.minWidthMm} mm]`],
      ['Slope Gradient & Ratio', `1:${baseSlopeRatio} (${rampCalc.slopePct.toFixed(2)}% / ${rampCalc.slopeAngleDeg.toFixed(1)}°) [Max: 1:${std.maxSlopeRatio}]`],
      ['Flights & Landings Configuration', `${rampCalc.flightsCount} Flight(s) with ${rampCalc.intermediateLandingsCount} Intermediate Resting Landing(s)`],
      ['Single Flight Rise & Run', `Rise: ${fmt(rampCalc.risePerFlightMm, 1)} ${unit} | Run: ${fmt(rampCalc.horizontalRunPerFlightMm, 1)} ${unit}`],
      ['Landing Dimensions', `${fmt(rampCalc.landingLenMm)} × ${fmt(rampCalc.landingWidthMm)} ${unit} (Accommodates Ø1500mm turning circle)`],
      ['Total Ramp Footprint (L × W)', `${fmt(rampCalc.footprintLengthMm, 1)} × ${fmt(rampCalc.footprintWidthMm, 1)} ${unit} (${rampCalc.footprintAreaSqFt.toFixed(1)} sq.ft / ${rampCalc.footprintAreaSqM.toFixed(2)} m²)`]
    ];

    geomRows.forEach(([lbl, val]) => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text(lbl + ':', 16, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(val, 85, y);
      y += 5.5;
    });

    y += 4;

    // Section 2: Statutory Compliance Checklist
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('2. Accessibility Code Compliance Audit Matrix', 14, y);
    y += 6;

    rampCalc.allAudits.forEach((audit) => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(audit.pass ? 16 : 220, audit.pass ? 149 : 38, audit.pass ? 93 : 38);
      doc.text(audit.pass ? '[PASS]' : '[FAIL]', 16, y);

      doc.setTextColor(15, 23, 42);
      doc.text(audit.name, 35, y);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(`${audit.target} vs ${audit.limit}`, 95, y);

      y += 5.5;
    });

    y += 6;

    // Section 3: Material Takeoff & Cost Estimation
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`3. Structural Material Takeoff & Cost Estimate (${rampCalc.cityRates.city})`, 14, y);
    y += 6;

    const boqRows = [
      ['RCC Concrete M20/M25 (150mm slab + kerb)', `${rampCalc.totalWetConcreteM3.toFixed(2)} m³ (${rampCalc.totalWetConcreteCuFt.toFixed(1)} cu.ft)`, `₹${Math.round(rampCalc.costConcrete).toLocaleString('en-IN')}`],
      ['Cement Bags Required (50 kg)', `${Math.ceil(rampCalc.cementBags)} bags (${(rampCalc.cementWeightKg / 1000).toFixed(2)} Tonnes)`, 'Included'],
      ['Fine Aggregate (Sand)', `${rampCalc.sandBrass.toFixed(2)} Brass (${rampCalc.sandCuFt.toFixed(1)} CFT / ${rampCalc.sandTonnes.toFixed(2)} T)`, 'Included'],
      ['Coarse Aggregate (20mm)', `${rampCalc.aggBrass.toFixed(2)} Brass (${rampCalc.aggCuFt.toFixed(1)} CFT)`, 'Included'],
      ['SS 304 Dual Continuous Handrails', `${rampCalc.totalHandrailLengthM.toFixed(1)} RMT (${(rampCalc.totalHandrailLengthM * 3.28084).toFixed(1)} RFT)`, `₹${Math.round(rampCalc.costHandrails).toLocaleString('en-IN')}`],
      ['Anti-Skid Ramp Tile / Granite Flooring', `${rampCalc.rampSurfaceAreaSqFt.toFixed(1)} sq.ft (${rampCalc.rampSurfaceAreaSqM.toFixed(2)} m²)`, `₹${Math.round(rampCalc.costFlooring).toLocaleString('en-IN')}`],
      ['TGSI Tactile Hazard Warning Pavers', `${rampCalc.tactileTilesNeeded} tiles (300×300 mm)`, `₹${Math.round(rampCalc.costTactile).toLocaleString('en-IN')}`],
      ['TOTAL ESTIMATED DIRECT BUDGET (INR)', '', `₹${Math.round(rampCalc.totalEstimatedCost).toLocaleString('en-IN')}`]
    ];

    boqRows.forEach(([lbl, qty, amt], idx) => {
      const isTotal = idx === boqRows.length - 1;
      if (isTotal) {
        y += 2;
        doc.setFillColor(241, 245, 249);
        doc.rect(14, y - 4, 182, 8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
      }
      doc.text(lbl, 16, y);
      doc.text(qty, 125, y);
      doc.text(amt, 175, y, { align: 'right' });
      y += 6;
    });

    // Footer note
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(148, 163, 184);
    doc.text('Note: This document complies with Harmonised Guidelines 2021 (MoHUA), NBC 2016 Part 3, and ADA 2010 accessibility specifications.', 14, 285);

    doc.save(`Accessible_Ramp_Compliance_Report_${standard}.pdf`);
  };

  // Reset function
  const handleReset = () => {
    setUnit('mm');
    setStandard('harmonised2021');
    setLayout('straight');
    setTotalRiseInput(600);
    setRampWidthInput(1500);
    setSlopeRatioInput(12);
    setSlabThicknessMm(150);
    setKerbHeightMm(100);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-left">
      <SEO
        title="Accessible Ramp Calculator | ADA & NBC 2016 Wheelchair Ramp Slope Design"
        description="Calculate wheelchair and disabled-access ramp slopes, runs, landing platforms, CAD elevation blueprints, and RCC material takeoff conforming to Harmonised Guidelines 2021, NBC 2016, and ADA standards."
        keywords={[
          'accessible ramp calculator',
          'wheelchair ramp slope calculator',
          'ADA ramp calculator',
          'NBC India ramp slope',
          'harmonised guidelines 2021 ramp',
          'switchback ramp calculator',
          'ramp gradient calculator 1:12 1:15',
          'disabled access ramp design'
        ]}
      />

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-zinc-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Harmonised Guidelines 2021 • NBC 2016 • ADA 2010 • UK Part M</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Accessible Ramp Calculator & Compliance Suite
            </h1>
            <p className="text-zinc-300 text-sm max-w-3xl leading-relaxed">
              Design barrier-free wheelchair ramps with automated slope gradients, intermediate resting landings, 
              dual handrails, edge kerbs, dynamic 2D/Plan CAD blueprints, and instant RCC material takeoffs.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={copySummaryReport}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/10 shadow-sm"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Report!' : 'Copy Summary'}</span>
            </button>
            <button
              onClick={shareViaWhatsApp}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
            >
              <Share2 className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={exportToExcel}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel (.xlsx)</span>
            </button>
            <button
              onClick={generatePdfReport}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm"
            >
              <FileText className="w-4 h-4" />
              <span>PDF Report</span>
            </button>
            <button
              onClick={handleReset}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition"
              title="Reset to Defaults"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Metric Highlights Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-white/10 text-xs">
          <div className="bg-white/5 p-3 rounded-xl">
            <span className="text-zinc-400 block text-[11px]">Total Rise</span>
            <span className="font-mono text-base font-bold text-white">
              {totalRiseInput} {unit}
            </span>
          </div>
          <div className="bg-white/5 p-3 rounded-xl">
            <span className="text-zinc-400 block text-[11px]">Slope Ratio</span>
            <span className="font-mono text-base font-bold text-indigo-300">
              1:{baseSlopeRatio} ({rampCalc.slopePct.toFixed(1)}%)
            </span>
          </div>
          <div className="bg-white/5 p-3 rounded-xl">
            <span className="text-zinc-400 block text-[11px]">Flights & Landings</span>
            <span className="font-mono text-base font-bold text-white">
              {rampCalc.flightsCount} Flight{rampCalc.flightsCount > 1 ? 's' : ''} ({rampCalc.intermediateLandingsCount} Lnd)
            </span>
          </div>
          <div className="bg-white/5 p-3 rounded-xl">
            <span className="text-zinc-400 block text-[11px]">Total Footprint</span>
            <span className="font-mono text-base font-bold text-white">
              {fmt(rampCalc.footprintLengthMm, 1)} × {fmt(rampCalc.footprintWidthMm, 1)} {unit}
            </span>
          </div>
          <div className="bg-white/5 p-3 rounded-xl">
            <span className="text-zinc-400 block text-[11px]">RCC Concrete</span>
            <span className="font-mono text-base font-bold text-amber-300">
              {rampCalc.totalWetConcreteM3.toFixed(2)} m³
            </span>
          </div>
          <div className="bg-white/5 p-3 rounded-xl">
            <span className="text-zinc-400 block text-[11px]">Compliance Audit</span>
            <span className={`font-mono text-base font-bold ${rampCalc.isOverallCompliant ? 'text-emerald-400' : 'text-rose-400'}`}>
              {rampCalc.isOverallCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'}
            </span>
          </div>
        </div>
      </div>

      {/* 5-Tab Navigation Bar */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 1, label: '1. Ramp Designer & CAD Blueprint', icon: Ruler },
          { id: 2, label: '2. Compliance Audit Matrix', icon: ShieldCheck },
          { id: 3, label: '3. Spatial Footprint & Switchback Lab', icon: Compass },
          { id: 4, label: '4. BOQ & Material Takeoff', icon: Layers },
          { id: 5, label: '5. Regional Rates & CAD Specs', icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs md:text-sm font-bold border-b-2 whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-t-xl'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* --------------------------------------------------------- */}
      {/* TAB 1: RAMP DESIGNER & CAD BLUEPRINT SIMULATOR */}
      {/* --------------------------------------------------------- */}
      {activeTab === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="saas-card p-6 space-y-4">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Ruler className="w-4 h-4 text-indigo-500" />
                <span>Primary Design Parameters</span>
              </h3>

              {/* Standard Selector */}
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Accessibility Standard & Code
                </label>
                <select
                  value={standard}
                  onChange={(e) => setStandard(e.target.value as StandardType)}
                  className="saas-input font-semibold text-xs"
                >
                  {Object.entries(REGULATORY_STANDARDS).map(([k, cfg]) => (
                    <option key={k} value={k}>{cfg.label}</option>
                  ))}
                </select>
                <p className="text-[11px] text-zinc-400 mt-1 leading-tight">
                  {currentStandardConfig.codeRef}
                </p>
              </div>

              {/* Layout Geometry & Unit Selector */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Layout Geometry
                  </label>
                  <select
                    value={layout}
                    onChange={(e) => setLayout(e.target.value as LayoutType)}
                    className="saas-input font-semibold text-xs"
                  >
                    <option value="straight">Straight Run (Linear)</option>
                    <option value="l_shape">L-Shaped (90° Turn)</option>
                    <option value="switchback">Switchback (180° Dog-Leg)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Measurement Unit
                  </label>
                  <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
                    {(['mm', 'm', 'in', 'ft'] as const).map((u) => (
                      <button
                        key={u}
                        onClick={() => handleUnitChange(u)}
                        className={`flex-1 py-1 rounded-md text-xs font-bold transition uppercase ${
                          unit === u
                            ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-white shadow-sm'
                            : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dimensions Input Grid */}
              <div className="grid grid-cols-2 gap-3 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Total Target Rise ({unit})
                  </label>
                  <input
                    type="number"
                    value={totalRiseInput}
                    onChange={(e) => setTotalRiseInput(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="saas-input font-mono font-bold"
                  />
                  <span className="text-[10px] text-zinc-400">
                    ≈ {baseRiseMm.toFixed(0)} mm
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Clear Passage Width ({unit})
                  </label>
                  <input
                    type="number"
                    value={rampWidthInput}
                    onChange={(e) => setRampWidthInput(Math.max(100, parseFloat(e.target.value) || 0))}
                    className="saas-input font-mono font-bold"
                  />
                  <span className="text-[10px] text-zinc-400">
                    Min required: {fmt(currentStandardConfig.minWidthMm)} {unit}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Target Slope Ratio (1:X)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={slopeRatioInput}
                    onChange={(e) => setSlopeRatioInput(Math.max(1, parseFloat(e.target.value) || 1))}
                    className="saas-input font-mono font-bold"
                  />
                  <span className="text-[10px] text-zinc-400">
                    Max: 1:{currentStandardConfig.maxSlopeRatio} | Rec: 1:{currentStandardConfig.recommendedSlopeRatio}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Edge Kerb Height (mm)
                  </label>
                  <input
                    type="number"
                    value={kerbHeightMm}
                    onChange={(e) => setKerbHeightMm(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="saas-input font-mono font-bold"
                  />
                  <span className="text-[10px] text-zinc-400">
                    Min required: {currentStandardConfig.kerbMinHeightMm} mm
                  </span>
                </div>
              </div>

              {/* Quick Preset Slope Sliders */}
              <div className="space-y-1.5 pt-2">
                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block">
                  Quick Gradient Selector:
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { ratio: 12, label: '1:12 (8.3%)', desc: 'Max Limit' },
                    { ratio: 15, label: '1:15 (6.7%)', desc: 'Preferred' },
                    { ratio: 18, label: '1:18 (5.6%)', desc: 'Comfort' },
                    { ratio: 20, label: '1:20 (5.0%)', desc: 'Ideal/Hospital' }
                  ].map((preset) => (
                    <button
                      key={preset.ratio}
                      onClick={() => setSlopeRatioInput(preset.ratio)}
                      className={`p-2 rounded-xl border text-center transition ${
                        slopeRatioInput === preset.ratio
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 font-bold'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <span className="block text-xs font-bold">{preset.label}</span>
                      <span className="block text-[9px] text-zinc-400">{preset.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Geometric Results Card */}
            <div className="saas-card p-6 space-y-3">
              <h3 className="font-bold text-sm flex items-center justify-between">
                <span>Calculated Geometry</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  rampCalc.isOverallCompliant
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                }`}>
                  {rampCalc.isOverallCompliant ? '100% Code Compliant' : 'Requires Adjustment'}
                </span>
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-500">Single Flight Rise:</span>
                  <span className="font-mono font-bold">{fmt(rampCalc.risePerFlightMm, 1)} {unit} ({rampCalc.risePerFlightMm.toFixed(0)} mm)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-500">Single Flight Run:</span>
                  <span className="font-mono font-bold">{fmt(rampCalc.horizontalRunPerFlightMm, 1)} {unit}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-500">Net Ramp Slope Length:</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{fmt(rampCalc.totalRampSlopeLengthMm, 1)} {unit}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-500">Intermediate Landings:</span>
                  <span className="font-mono font-bold">{rampCalc.intermediateLandingsCount} landing(s)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-500">Landing Dimensions:</span>
                  <span className="font-mono font-bold">{fmt(rampCalc.landingLenMm)} × {fmt(rampCalc.landingWidthMm)} {unit}</span>
                </div>
                <div className="flex justify-between py-1 text-sm font-bold text-zinc-800 dark:text-zinc-100">
                  <span>Overall Footprint:</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400">
                    {fmt(rampCalc.footprintLengthMm, 1)} × {fmt(rampCalc.footprintWidthMm, 1)} {unit}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Blueprint Simulator Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* 2D Elevation CAD Blueprint */}
            <div className="saas-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm">2D CAD Elevation Blueprint</h3>
                  <p className="text-xs text-zinc-400">
                    Sectional elevation profile displaying slope trajectory, dual continuous handrails, and level landings.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-1 rounded">
                  {rampCalc.flightsCount} Flight{rampCalc.flightsCount > 1 ? 's' : ''} • {rampCalc.slopeAngleDeg.toFixed(1)}° Slope
                </span>
              </div>

              {/* Dynamic SVG Blueprint Canvas */}
              <div className="relative w-full aspect-[16/9] bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center p-4 shadow-inner overflow-hidden">
                {/* Blueprint Grid Lines */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:1.25rem_1.25rem] opacity-30 pointer-events-none" />

                <svg className="w-full h-full" viewBox="0 0 600 240" preserveAspectRatio="xMidYMid meet">
                  {/* Title text */}
                  <text x="20" y="25" fill="#64748b" fontSize="9" fontFamily="monospace" fontWeight="bold">
                    CAD SECTION ELEVATION (SLOPE 1:{baseSlopeRatio} / {rampCalc.slopePct.toFixed(1)}%)
                  </text>

                  {/* Ground reference line */}
                  <line x1="20" y1="200" x2="580" y2="200" stroke="#475569" strokeWidth="2" strokeDasharray="6 3" />
                  <text x="540" y="215" fill="#475569" fontSize="8" fontFamily="monospace">GROUND</text>

                  {rampCalc.flightsCount === 1 ? (
                    // Single Flight Layout
                    <g>
                      {/* Bottom landing */}
                      <rect x="30" y="195" width="80" height="5" fill="#4f46e5" />
                      <line x1="30" y1="195" x2="110" y2="195" stroke="#818cf8" strokeWidth="3" />
                      <text x="45" y="188" fill="#94a3b8" fontSize="8" fontFamily="monospace">BOTTOM LND</text>

                      {/* Inclined Ramp Slab */}
                      <line x1="110" y1="195" x2="450" y2="75" stroke="#6366f1" strokeWidth="4" />
                      {/* Ramp thickness hatch */}
                      <polygon points="110,195 450,75 450,90 110,210" fill="#312e81" opacity="0.4" />

                      {/* Top landing */}
                      <line x1="450" y1="75" x2="550" y2="75" stroke="#818cf8" strokeWidth="3" />
                      <text x="470" y="68" fill="#94a3b8" fontSize="8" fontFamily="monospace">TOP LND</text>

                      {/* Dual Handrails */}
                      {/* Top Handrail (900mm) */}
                      <line x1="15" y1="165" x2="110" y2="165" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 2" />
                      <line x1="110" y1="165" x2="450" y2="45" stroke="#38bdf8" strokeWidth="1.5" />
                      <line x1="450" y1="45" x2="565" y2="45" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 2" />

                      {/* Lower Handrail (760mm) */}
                      <line x1="15" y1="175" x2="110" y2="175" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="3 2" />
                      <line x1="110" y1="175" x2="450" y2="55" stroke="#0ea5e9" strokeWidth="1" />
                      <line x1="450" y1="55" x2="565" y2="55" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="3 2" />

                      {/* Vertical Baluster Posts */}
                      {[110, 195, 280, 365, 450].map((x, idx) => {
                        const yRamp = 195 - ((x - 110) / (450 - 110)) * (195 - 75);
                        return <line key={idx} x1={x} y1={yRamp} x2={x} y2={yRamp - 30} stroke="#64748b" strokeWidth="1" />;
                      })}

                      {/* Dimension Dimension witness lines */}
                      {/* Total Rise */}
                      <line x1="560" y1="75" x2="560" y2="195" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 2" />
                      <line x1="555" y1="75" x2="565" y2="75" stroke="#f59e0b" strokeWidth="1" />
                      <line x1="555" y1="195" x2="565" y2="195" stroke="#f59e0b" strokeWidth="1" />
                      <text x="568" y="140" fill="#f59e0b" fontSize="8" fontFamily="monospace" fontWeight="bold">
                        RISE: {totalRiseInput}{unit}
                      </text>

                      {/* Horizontal Run */}
                      <line x1="110" y1="215" x2="450" y2="215" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
                      <text x="230" y="228" fill="#94a3b8" fontSize="8" fontFamily="monospace">
                        RUN: {fmt(rampCalc.totalRampRunLengthMm)} {unit}
                      </text>

                      {/* TGSI Tactile Pavers representation */}
                      <rect x="90" y="193" width="18" height="4" fill="#fbbf24" />
                      <rect x="452" y="73" width="18" height="4" fill="#fbbf24" />
                      <text x="65" y="180" fill="#fbbf24" fontSize="7" fontFamily="monospace">TGSI</text>

                      {/* Wheelchair Climber Silhouette */}
                      <g transform="translate(250, 105) rotate(-18)">
                        <circle cx="12" cy="12" r="5" fill="none" stroke="#a5b4fc" strokeWidth="1.5" />
                        <line x1="12" y1="8" x2="16" y2="14" stroke="#a5b4fc" strokeWidth="1.5" />
                        <line x1="16" y1="14" x2="20" y2="14" stroke="#a5b4fc" strokeWidth="1.5" />
                        <circle cx="16" cy="5" r="2.5" fill="#a5b4fc" />
                      </g>
                    </g>
                  ) : (
                    // Multi-Flight Cascading / Switchback Elevation
                    <g>
                      {/* Flight 1 */}
                      <line x1="30" y1="195" x2="90" y2="195" stroke="#818cf8" strokeWidth="3" />
                      <line x1="90" y1="195" x2="260" y2="135" stroke="#6366f1" strokeWidth="4" />
                      {/* Intermediate Landing */}
                      <line x1="260" y1="135" x2="350" y2="135" stroke="#818cf8" strokeWidth="4" />
                      <text x="275" y="125" fill="#38bdf8" fontSize="8" fontFamily="monospace" fontWeight="bold">RESTING LANDING</text>

                      {/* Flight 2 */}
                      <line x1="350" y1="135" x2="520" y2="75" stroke="#6366f1" strokeWidth="4" />
                      {/* Top landing */}
                      <line x1="520" y1="75" x2="570" y2="75" stroke="#818cf8" strokeWidth="3" />

                      {/* Handrails */}
                      <line x1="90" y1="165" x2="260" y2="105" stroke="#38bdf8" strokeWidth="1.5" />
                      <line x1="260" y1="105" x2="350" y2="105" stroke="#38bdf8" strokeWidth="1.5" />
                      <line x1="350" y1="105" x2="520" y2="45" stroke="#38bdf8" strokeWidth="1.5" />

                      {/* Dimensions */}
                      <text x="140" y="180" fill="#94a3b8" fontSize="8" fontFamily="monospace">Flight 1</text>
                      <text x="400" y="120" fill="#94a3b8" fontSize="8" fontFamily="monospace">Flight 2</text>
                      <line x1="565" y1="75" x2="565" y2="195" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 2" />
                      <text x="568" y="140" fill="#f59e0b" fontSize="8" fontFamily="monospace" fontWeight="bold">
                        TOTAL RISE: {totalRiseInput}{unit}
                      </text>
                    </g>
                  )}
                </svg>
              </div>
            </div>

            {/* Plan View CAD Layout */}
            <div className="saas-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm">Plan View & Wheelchair Turning Blueprint</h3>
                  <p className="text-xs text-zinc-400">
                    Top-down architectural plan highlighting clear widths and Ø1500mm (60") turning clearances.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded">
                  Ø1500mm Turning Circle
                </span>
              </div>

              <div className="relative w-full aspect-[2/1] bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center p-4 shadow-inner overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="xMidYMid meet">
                  <text x="20" y="25" fill="#64748b" fontSize="9" fontFamily="monospace" fontWeight="bold">
                    PLAN VIEW: {layout.toUpperCase().replace('_', ' ')} CONFIGURATION
                  </text>

                  {layout === 'straight' && (
                    <g>
                      {/* Straight Run Plan */}
                      <rect x="40" y="60" width="80" height="80" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
                      <text x="55" y="105" fill="#94a3b8" fontSize="8" fontFamily="monospace">BOTTOM LND</text>
                      <circle cx="80" cy="100" r="30" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" />

                      {/* Ramp Flights */}
                      <rect x="120" y="65" width="360" height="70" fill="#312e81" opacity="0.3" stroke="#6366f1" strokeWidth="2" />
                      {/* Slope Direction Arrows */}
                      <line x1="140" y1="100" x2="460" y2="100" stroke="#818cf8" strokeWidth="2" markerEnd="url(#arrow)" />
                      <text x="280" y="90" fill="#c7d2fe" fontSize="9" fontFamily="monospace" fontWeight="bold">UP SLOPE (1:{baseSlopeRatio})</text>

                      {/* Top Landing */}
                      <rect x="480" y="60" width="80" height="80" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
                      <text x="500" y="105" fill="#94a3b8" fontSize="8" fontFamily="monospace">TOP LND</text>
                      <circle cx="520" cy="100" r="30" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" />

                      {/* Kerbs */}
                      <rect x="120" y="60" width="360" height="5" fill="#64748b" />
                      <rect x="120" y="135" width="360" height="5" fill="#64748b" />
                    </g>
                  )}

                  {layout === 'switchback' && (
                    <g>
                      {/* Flight 1 (Up) */}
                      <rect x="140" y="40" width="280" height="50" fill="#312e81" opacity="0.3" stroke="#6366f1" strokeWidth="1.5" />
                      <text x="250" y="70" fill="#c7d2fe" fontSize="8" fontFamily="monospace">FLIGHT 1 (UP →)</text>

                      {/* Switchback Turning Landing (180 deg) */}
                      <rect x="420" y="40" width="100" height="120" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                      <circle cx="470" cy="100" r="38" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" />
                      <text x="435" y="105" fill="#38bdf8" fontSize="8" fontFamily="monospace" fontWeight="bold">180° TURN</text>

                      {/* Flight 2 (Up continued) */}
                      <rect x="140" y="110" width="280" height="50" fill="#312e81" opacity="0.3" stroke="#6366f1" strokeWidth="1.5" />
                      <text x="250" y="140" fill="#c7d2fe" fontSize="8" fontFamily="monospace">(← UP) FLIGHT 2</text>

                      {/* Bottom & Top Landings */}
                      <rect x="40" y="40" width="100" height="50" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
                      <text x="55" y="70" fill="#94a3b8" fontSize="8" fontFamily="monospace">START</text>

                      <rect x="40" y="110" width="100" height="50" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
                      <text x="55" y="140" fill="#94a3b8" fontSize="8" fontFamily="monospace">FINISH</text>

                      {/* Dividing barrier */}
                      <line x1="140" y1="100" x2="420" y2="100" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 2" />
                    </g>
                  )}

                  {layout === 'l_shape' && (
                    <g>
                      {/* Flight 1 */}
                      <rect x="60" y="120" width="260" height="60" fill="#312e81" opacity="0.3" stroke="#6366f1" strokeWidth="1.5" />
                      <text x="160" y="155" fill="#c7d2fe" fontSize="8" fontFamily="monospace">FLIGHT 1 (→)</text>

                      {/* 90 deg corner landing */}
                      <rect x="320" y="120" width="80" height="60" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                      <circle cx="360" cy="150" r="28" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" />
                      <text x="330" y="155" fill="#38bdf8" fontSize="8" fontFamily="monospace" fontWeight="bold">90° TURN</text>

                      {/* Flight 2 */}
                      <rect x="320" y="30" width="80" height="90" fill="#312e81" opacity="0.3" stroke="#6366f1" strokeWidth="1.5" />
                      <text x="340" y="80" fill="#c7d2fe" fontSize="8" fontFamily="monospace">(↑) FLIGHT 2</text>
                    </g>
                  )}
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* TAB 2: COMPLIANCE AUDIT MATRIX */}
      {/* --------------------------------------------------------- */}
      {activeTab === 2 && (
        <div className="space-y-6">
          <div className="saas-card p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-500" />
                  <span>Statutory Accessibility Code Compliance Audit</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Evaluated against <span className="font-bold text-zinc-700 dark:text-zinc-200">{currentStandardConfig.label}</span> ({currentStandardConfig.codeRef}).
                </p>
              </div>

              <div className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${
                rampCalc.isOverallCompliant
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
              }`}>
                {rampCalc.isOverallCompliant ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                <span>Overall Layout Status: {rampCalc.isOverallCompliant ? 'FULLY COMPLIANT' : 'DEFICIENCIES DETECTED'}</span>
              </div>
            </div>

            {/* Checklist Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 uppercase text-[10px]">
                    <th className="py-3 px-3">Audit Parameter</th>
                    <th className="py-3 px-3">Provided Value</th>
                    <th className="py-3 px-3">Statutory Limit</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Engineering Commentary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {rampCalc.allAudits.map((audit, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition">
                      <td className="py-3 px-3 font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                        {audit.pass ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        )}
                        <span>{audit.name}</span>
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                        {audit.target}
                      </td>
                      <td className="py-3 px-3 font-mono text-zinc-500">
                        {audit.limit}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          audit.pass
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                        }`}>
                          {audit.pass ? 'PASS' : 'FAIL'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-zinc-500 dark:text-zinc-400">
                        {audit.note}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Standard Comparison Reference Grid */}
          <div className="saas-card p-6 space-y-4">
            <h3 className="font-bold text-sm">International & Indian Accessibility Standards Comparison</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {Object.values(REGULATORY_STANDARDS).map((std) => (
                <div
                  key={std.id}
                  className={`p-4 rounded-2xl border transition ${
                    std.id === standard
                      ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20 shadow-sm'
                      : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-zinc-800 dark:text-zinc-100">{std.label}</span>
                    {std.id === standard && (
                      <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-bold uppercase">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-tight mb-3">
                    {std.description}
                  </p>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Max Slope:</span>
                      <span className="font-mono font-bold">1:{std.maxSlopeRatio}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Preferred Slope:</span>
                      <span className="font-mono font-bold text-emerald-600">1:{std.recommendedSlopeRatio}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Max Flight Rise:</span>
                      <span className="font-mono font-bold">{std.maxSingleRiseMm} mm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Min Clear Width:</span>
                      <span className="font-mono font-bold">{std.minWidthMm} mm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Landing Dimensions:</span>
                      <span className="font-mono font-bold">{std.landingLengthMm}×{std.landingWidthMm} mm</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* TAB 3: SPATIAL FOOTPRINT & SWITCHBACK LAB */}
      {/* --------------------------------------------------------- */}
      {activeTab === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-6">
            <div className="saas-card p-6 space-y-4">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-500" />
                <span>Spatial Footprint Comparison Lab</span>
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Compare plot footprint requirements across Straight, L-Shaped ($90^\circ$), and Switchback ($180^\circ$) layouts. 
                Switchback ramps drastically reduce linear corridor encroachment by folding runs side-by-side.
              </p>

              {/* Layout Comparative Metrics */}
              <div className="space-y-3">
                {[
                  {
                    type: 'straight' as LayoutType,
                    name: 'Linear Straight Run',
                    lenMm: currentStandardConfig.landingLengthMm * 2 + rampCalc.totalRampRunLengthMm + (rampCalc.flightsCount - 1) * currentStandardConfig.landingLengthMm,
                    widthMm: baseWidthMm + 200,
                    desc: 'Requires long uninterrupted linear corridor or setback space.'
                  },
                  {
                    type: 'l_shape' as LayoutType,
                    name: 'L-Shaped (90° Corner Turn)',
                    lenMm: currentStandardConfig.landingLengthMm + (rampCalc.horizontalRunPerFlightMm) + baseWidthMm,
                    widthMm: currentStandardConfig.landingLengthMm + (rampCalc.horizontalRunPerFlightMm * Math.max(1, rampCalc.flightsCount - 1)) + baseWidthMm,
                    desc: 'Wraps around building corners or perimeter plinths.'
                  },
                  {
                    type: 'switchback' as LayoutType,
                    name: 'Switchback (180° Dog-Leg Turn)',
                    lenMm: currentStandardConfig.landingLengthMm * 2 + (rampCalc.horizontalRunPerFlightMm * Math.ceil(rampCalc.flightsCount / 2)),
                    widthMm: baseWidthMm * 2 + 300,
                    desc: 'Most space-efficient layout for compact entry foyers & verandas.'
                  }
                ].map((item) => {
                  const areaSqM = (item.lenMm * item.widthMm) / 1_000_000;
                  const isSelected = layout === item.type;
                  return (
                    <div
                      key={item.type}
                      onClick={() => setLayout(item.type)}
                      className={`p-4 rounded-2xl border cursor-pointer transition ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 shadow-md'
                          : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{item.name}</span>
                        {isSelected && (
                          <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded font-bold uppercase">
                            Selected
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 mb-3">{item.desc}</p>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-white/60 dark:bg-zinc-800/60 p-2 rounded-lg">
                          <span className="text-zinc-400 block text-[10px]">Length Required</span>
                          <span className="font-mono font-bold">{fmt(item.lenMm, 1)} {unit}</span>
                        </div>
                        <div className="bg-white/60 dark:bg-zinc-800/60 p-2 rounded-lg">
                          <span className="text-zinc-400 block text-[10px]">Width Required</span>
                          <span className="font-mono font-bold">{fmt(item.widthMm, 1)} {unit}</span>
                        </div>
                        <div className="bg-white/60 dark:bg-zinc-800/60 p-2 rounded-lg">
                          <span className="text-zinc-400 block text-[10px]">Plot Area</span>
                          <span className="font-mono font-bold text-indigo-600">{(areaSqM * 10.7639).toFixed(1)} sq.ft</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            {/* Wheelchair Dynamics & Turning Geometry Card */}
            <div className="saas-card p-6 space-y-4">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-indigo-500" />
                <span>Wheelchair Ergonomics & Turning Standards</span>
              </h3>

              <div className="space-y-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-850 rounded-xl space-y-1">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                    1. Ø1500 mm (60") Turning Circle Clearance
                  </span>
                  <p className="text-[11px] text-zinc-500">
                    A standard manual wheelchair requires a minimum diameter of 1500 mm to perform a 360° turn without bumping walls. All resting landings and corner platforms are sized to clear this envelope.
                  </p>
                </div>

                <div className="p-3 bg-zinc-50 dark:bg-zinc-850 rounded-xl space-y-1">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                    2. Cross-Slope & Drainage Drainage (Max 1:50 / 2%)
                  </span>
                  <p className="text-[11px] text-zinc-500">
                    To prevent rainwater stagnation while ensuring wheelchair stability, the maximum cross-slope perpendicular to the direction of travel must not exceed 2.0% (1:50).
                  </p>
                </div>

                <div className="p-3 bg-zinc-50 dark:bg-zinc-850 rounded-xl space-y-1">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                    3. Dual Handrail Ergonomics (900 mm & 760 mm)
                  </span>
                  <p className="text-[11px] text-zinc-500">
                    Continuous handrails on both sides of the ramp: upper rail at 900 mm for standing persons, lower rail at 760 mm for wheelchair users and children, extending 300 mm past the ramp top and bottom.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* TAB 4: BOQ & MATERIAL TAKEOFF */}
      {/* --------------------------------------------------------- */}
      {activeTab === 4 && (
        <div className="space-y-6">
          <div className="saas-card p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-500" />
                  <span>Bill of Quantities (BOQ) & Structural Takeoff</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Complete civil material requirements calculated using IS 456 ($1.54	imes$ dry volume factor) and CPWD DSR norms.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase">Concrete Mix</label>
                  <select
                    value={concreteGrade}
                    onChange={(e) => setConcreteGrade(e.target.value as 'M20' | 'M25')}
                    className="saas-input text-xs font-bold py-1 px-2.5"
                  >
                    <option value="M20">M20 (1:1.5:3)</option>
                    <option value="M25">M25 (1:1:2)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase">Slab Thickness</label>
                  <select
                    value={slabThicknessMm}
                    onChange={(e) => setSlabThicknessMm(parseInt(e.target.value))}
                    className="saas-input text-xs font-bold py-1 px-2.5"
                  >
                    <option value={125}>125 mm (5")</option>
                    <option value={150}>150 mm (6") Standard</option>
                    <option value={200}>200 mm (8") Heavy Duty</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Material Takeoff Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: RCC Concrete */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-500">Wet Concrete Volume</span>
                  <Building className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="font-mono text-2xl font-black text-zinc-900 dark:text-white">
                  {rampCalc.totalWetConcreteM3.toFixed(2)} <span className="text-xs font-normal">m³</span>
                </div>
                <div className="text-[11px] text-zinc-400 space-y-0.5 pt-1 border-t border-zinc-200 dark:border-zinc-800">
                  <div>Equivalent: <span className="font-mono font-bold text-zinc-700 dark:text-zinc-200">{rampCalc.totalWetConcreteCuFt.toFixed(1)} cu.ft</span></div>
                  <div>Inclined: {(rampCalc.totalRampSlopeLengthMm / 1000 * (baseWidthMm / 1000) * (slabThicknessMm / 1000)).toFixed(2)} m³</div>
                  <div>Landings + Kerbs: {(rampCalc.totalWetConcreteM3 - (rampCalc.totalRampSlopeLengthMm / 1000 * (baseWidthMm / 1000) * (slabThicknessMm / 1000))).toFixed(2)} m³</div>
                </div>
              </div>

              {/* Card 2: Cement & Fine Aggregate */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-500">Cement & Sand</span>
                  <Scale className="w-4 h-4 text-amber-500" />
                </div>
                <div className="font-mono text-2xl font-black text-amber-600 dark:text-amber-400">
                  {Math.ceil(rampCalc.cementBags)} <span className="text-xs font-normal">Bags (50kg)</span>
                </div>
                <div className="text-[11px] text-zinc-400 space-y-0.5 pt-1 border-t border-zinc-200 dark:border-zinc-800">
                  <div>Cement Mass: <span className="font-mono font-bold">{(rampCalc.cementWeightKg / 1000).toFixed(2)} Tonnes</span></div>
                  <div>Sand Volume: <span className="font-mono font-bold">{rampCalc.sandBrass.toFixed(2)} Brass</span> ({rampCalc.sandCuFt.toFixed(1)} CFT)</div>
                  <div>Coarse Agg (20mm): <span className="font-mono font-bold">{rampCalc.aggBrass.toFixed(2)} Brass</span></div>
                </div>
              </div>

              {/* Card 3: SS Handrail Piping */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-500">SS 304 Handrails</span>
                  <Ruler className="w-4 h-4 text-sky-500" />
                </div>
                <div className="font-mono text-2xl font-black text-sky-600 dark:text-sky-400">
                  {rampCalc.totalHandrailLengthM.toFixed(1)} <span className="text-xs font-normal">RMT</span>
                </div>
                <div className="text-[11px] text-zinc-400 space-y-0.5 pt-1 border-t border-zinc-200 dark:border-zinc-800">
                  <div>Imperial: <span className="font-mono font-bold">{(rampCalc.totalHandrailLengthM * 3.28084).toFixed(1)} RFT</span></div>
                  <div>Posts: <span className="font-mono font-bold">{rampCalc.balusterPostCount} Balusters</span> (@1.2m c/c)</div>
                  <div>Configuration: Dual height (900/760mm)</div>
                </div>
              </div>

              {/* Card 4: Flooring & Tactile Warning Tiles */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-500">Flooring & TGSI Pavers</span>
                  <Droplets className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="font-mono text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {rampCalc.rampSurfaceAreaSqFt.toFixed(1)} <span className="text-xs font-normal">sq.ft</span>
                </div>
                <div className="text-[11px] text-zinc-400 space-y-0.5 pt-1 border-t border-zinc-200 dark:border-zinc-800">
                  <div>Metric Area: <span className="font-mono font-bold">{rampCalc.rampSurfaceAreaSqM.toFixed(2)} m²</span></div>
                  <div>TGSI Warning Tiles: <span className="font-mono font-bold text-amber-500">{rampCalc.tactileTilesNeeded} pcs</span> (300×300mm)</div>
                  <div>Finish: Flamed granite / Anti-skid vitrified</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* TAB 5: REGIONAL RATES & CAD SPECS */}
      {/* --------------------------------------------------------- */}
      {activeTab === 5 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-6">
            <div className="saas-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Building className="w-5 h-5 text-indigo-500" />
                  <span>Regional Cost Estimator</span>
                </h3>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="saas-input text-xs font-bold py-1 px-3"
                >
                  {Object.entries(REGIONAL_RATES).map(([key, val]) => (
                    <option key={key} value={key}>{val.city}</option>
                  ))}
                </select>
              </div>

              {/* Itemized Cost Breakdown Table */}
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
                <div className="py-2.5 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 block">RCC Structure ({concreteGrade})</span>
                    <span className="text-[11px] text-zinc-400">{rampCalc.totalWetConcreteM3.toFixed(2)} m³ @ ₹{rampCalc.cityRates.rccConcretePerM3}/m³</span>
                  </div>
                  <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">₹{Math.round(rampCalc.costConcrete).toLocaleString('en-IN')}</span>
                </div>

                <div className="py-2.5 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 block">SS 304 Dual Handrail Piping</span>
                    <span className="text-[11px] text-zinc-400">{rampCalc.totalHandrailLengthM.toFixed(1)} RMT @ ₹{rampCalc.cityRates.ssHandrailPerRmt}/RMT</span>
                  </div>
                  <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">₹{Math.round(rampCalc.costHandrails).toLocaleString('en-IN')}</span>
                </div>

                <div className="py-2.5 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 block">Anti-Skid Ramp Flooring</span>
                    <span className="text-[11px] text-zinc-400">{rampCalc.rampSurfaceAreaSqFt.toFixed(1)} sq.ft @ ₹{rampCalc.cityRates.flooringPerSqFt}/sq.ft</span>
                  </div>
                  <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">₹{Math.round(rampCalc.costFlooring).toLocaleString('en-IN')}</span>
                </div>

                <div className="py-2.5 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 block">TGSI Tactile Warning Tiles</span>
                    <span className="text-[11px] text-zinc-400">{rampCalc.tactileTilesNeeded} pcs @ ₹{rampCalc.cityRates.tactileTilePerPiece}/tile</span>
                  </div>
                  <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">₹{Math.round(rampCalc.costTactile).toLocaleString('en-IN')}</span>
                </div>

                <div className="pt-4 flex justify-between items-center text-sm font-black">
                  <span className="text-zinc-900 dark:text-white">Estimated Total Budget</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400 text-lg">
                    ₹{Math.round(rampCalc.totalEstimatedCost).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            {/* Ready-to-Paste CAD Drawing Specifications */}
            <div className="saas-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <span>CAD Drawing Specification Notes</span>
                </h3>
                <button
                  onClick={() => {
                    const notes = `ACCESSIBILITY RAMP GENERAL NOTES (${REGULATORY_STANDARDS[standard].label}):
1. RAMP SLOPE GRADIENT SHALL NOT EXCEED 1:${baseSlopeRatio} (${rampCalc.slopePct.toFixed(2)}%).
2. CLEAR PASSAGE WIDTH BETWEEN INNER HANDRAILS SHALL BE MINIMUM ${baseWidthMm} MM.
3. INTERMEDIATE LEVEL RESTING LANDINGS OF MINIMUM ${rampCalc.landingLenMm} X ${rampCalc.landingWidthMm} MM PROVIDED EVERY ${rampCalc.risePerFlightMm.toFixed(0)} MM OF VERTICAL RISE.
4. CONTINUOUS STAINLESS STEEL (GRADE 304) DUAL HANDRAILS TO BE INSTALLED AT HEIGHTS OF 900 MM AND 760 MM ABOVE FINISHED RAMP SURFACE.
5. HANDRAILS MUST EXTEND 300 MM HORIZONTALLY BEYOND TOP AND BOTTOM OF RAMP RUNS WITH ROUNDED DOWNWARD RETURN ENDS.
6. RAISED EDGE PROTECTION KERB OF MINIMUM ${kerbHeightMm} MM HEIGHT REQUIRED ON ALL EXPOSED EDGES.
7. TGSI TACTILE HAZARD WARNING STRIPS (300 MM DEPTH) WITH DOMED STUDS SHALL BE INSTALLED 300 MM BEFORE TOP AND BOTTOM LANDINGS.
8. MAXIMUM PERMISSIBLE CROSS-SLOPE FOR DRAINAGE SHALL BE 1:50 (2.0%).`;
                    navigator.clipboard.writeText(notes);
                    alert('CAD General Notes copied to clipboard!');
                  }}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy CAD Notes</span>
                </button>
              </div>

              <div className="p-4 bg-zinc-950 text-emerald-400 font-mono text-[11px] rounded-xl leading-relaxed overflow-x-auto border border-zinc-800">
                <p>1. SLOPE: Max 1:{baseSlopeRatio} ({rampCalc.slopePct.toFixed(2)}%) per {REGULATORY_STANDARDS[standard].codeRef}.</p>
                <p>2. CLEAR WIDTH: {baseWidthMm} mm clear passage between handrails.</p>
                <p>3. LANDINGS: {rampCalc.landingLenMm} × {rampCalc.landingWidthMm} mm at all direction changes and intermediate stops.</p>
                <p>4. HANDRAILS: Dual SS304 rails at 900mm (upper) & 760mm (lower) with 300mm extensions.</p>
                <p>5. KERB: {kerbHeightMm}mm continuous safety wheel kerb.</p>
                <p>6. TGSI: 300mm tactile hazard warning pavers at landings.</p>
                <p>7. FINISH: Flame-textured granite or R11 rated anti-skid vitrified tiles.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Market Trends Graph Component */}
      <MaterialTrendGraph
        allowedMaterials={['cement', 'sand', 'aggregate', 'steel']}
        defaultMaterial="cement"
        title="Ramp Construction Material Price Trends (5-Year Historical)"
      />
    </div>
  );
}

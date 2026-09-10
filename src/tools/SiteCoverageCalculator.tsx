import { useState, useMemo } from 'react';
import {
  Copy, Check, RotateCcw,
  Sparkles, BarChart2,
  Sliders, ChevronDown, ChevronUp,
  Calculator, Layers, Scale,
  Activity, TrendingUp,
  Compass, ShieldCheck,
  Target, ArrowRight,
  Zap, TreePine, Building2, Droplets, CheckCircle2, AlertTriangle,
  Plus, Trash2, Maximize2, FileText, CloudRain
} from 'lucide-react';

type CoverageMode = 'standard_coverage' | 'zoning_compliance_by_typology' | 'permeability_stormwater' | 'multi_building_campus' | 'setbacks_envelope' | 'vertical_far_massing';
type AreaUnit = 'sqft' | 'sqm';

interface CampusBuilding {
  id: string;
  name: string;
  footprint: number;
  stories: number;
  heightMeters: number;
  color: string;
}

interface PresetScenario {
  name: string;
  category: string;
  badgeColor: string;
  mode: CoverageMode;
  plotArea: number;
  plotWidth: number;
  plotDepth: number;
  footprint: number;
  stories: number;
  pavedArea: number;
  semiPermeableArea: number;
  maxAllowedCoveragePct: number;
  minRequiredGreenPct: number;
  maxAllowedFAR: number;
  setbackFront: number;
  setbackRear: number;
  setbackSideL: number;
  setbackSideR: number;
  stormIntensity: number; // mm/hr
  annualRainfall: number; // mm
  campusBuildings?: CampusBuilding[];
}

const PRESETS: PresetScenario[] = [
  {
    name: 'Suburban Luxury Villa / Bungalow',
    category: 'Residential Villa',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    mode: 'standard_coverage',
    plotArea: 6000,
    plotWidth: 60,
    plotDepth: 100,
    footprint: 2200,
    stories: 2,
    pavedArea: 1200,
    semiPermeableArea: 600,
    maxAllowedCoveragePct: 40,
    minRequiredGreenPct: 30,
    maxAllowedFAR: 1.2,
    setbackFront: 15,
    setbackRear: 12,
    setbackSideL: 8,
    setbackSideR: 8,
    stormIntensity: 50,
    annualRainfall: 850
  },
  {
    name: 'High-Density Commercial Office Plaza',
    category: 'Commercial Hub',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    mode: 'zoning_compliance_by_typology',
    plotArea: 30000,
    plotWidth: 150,
    plotDepth: 200,
    footprint: 16500,
    stories: 6,
    pavedArea: 8500,
    semiPermeableArea: 1500,
    maxAllowedCoveragePct: 60,
    minRequiredGreenPct: 15,
    maxAllowedFAR: 3.5,
    setbackFront: 25,
    setbackRear: 20,
    setbackSideL: 15,
    setbackSideR: 15,
    stormIntensity: 65,
    annualRainfall: 950
  },
  {
    name: 'Industrial Logistics & Distribution Hub',
    category: 'Industrial Park',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    mode: 'permeability_stormwater',
    plotArea: 120000,
    plotWidth: 300,
    plotDepth: 400,
    footprint: 75000,
    stories: 1,
    pavedArea: 32000,
    semiPermeableArea: 3000,
    maxAllowedCoveragePct: 65,
    minRequiredGreenPct: 10,
    maxAllowedFAR: 1.0,
    setbackFront: 30,
    setbackRear: 25,
    setbackSideL: 20,
    setbackSideR: 20,
    stormIntensity: 75,
    annualRainfall: 750
  },
  {
    name: 'High-Rise Residential Podium & Tower',
    category: 'High-Rise / LEED',
    badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
    mode: 'vertical_far_massing',
    plotArea: 50000,
    plotWidth: 200,
    plotDepth: 250,
    footprint: 14000,
    stories: 18,
    pavedArea: 8000,
    semiPermeableArea: 5000,
    maxAllowedCoveragePct: 35,
    minRequiredGreenPct: 35,
    maxAllowedFAR: 4.5,
    setbackFront: 30,
    setbackRear: 25,
    setbackSideL: 20,
    setbackSideR: 20,
    stormIntensity: 60,
    annualRainfall: 1100
  },
  {
    name: 'Multi-Building Corporate / Tech Campus',
    category: 'Campus Master Plan',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
    mode: 'multi_building_campus',
    plotArea: 150000,
    plotWidth: 350,
    plotDepth: 428.5,
    footprint: 48000,
    stories: 5,
    pavedArea: 35000,
    semiPermeableArea: 15000,
    maxAllowedCoveragePct: 40,
    minRequiredGreenPct: 30,
    maxAllowedFAR: 2.5,
    setbackFront: 35,
    setbackRear: 30,
    setbackSideL: 25,
    setbackSideR: 25,
    stormIntensity: 55,
    annualRainfall: 900,
    campusBuildings: [
      { id: 'b1', name: 'Tower Alpha (Primary Office)', footprint: 24000, stories: 8, heightMeters: 32, color: 'bg-indigo-600' },
      { id: 'b2', name: 'Tower Beta (Engineering Wing)', footprint: 14000, stories: 6, heightMeters: 24, color: 'bg-blue-600' },
      { id: 'b3', name: 'Multi-Level Parking Podium', footprint: 7500, stories: 4, heightMeters: 14, color: 'bg-slate-600' },
      { id: 'b4', name: 'Clubhouse & Cafeteria Pavilion', footprint: 2500, stories: 2, heightMeters: 8, color: 'bg-emerald-600' }
    ]
  },
  {
    name: 'Eco-School Educational Institutional Campus',
    category: 'Institutional Eco',
    badgeColor: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
    mode: 'permeability_stormwater',
    plotArea: 80000,
    plotWidth: 250,
    plotDepth: 320,
    footprint: 20000,
    stories: 3,
    pavedArea: 12000,
    semiPermeableArea: 10000,
    maxAllowedCoveragePct: 30,
    minRequiredGreenPct: 40,
    maxAllowedFAR: 1.5,
    setbackFront: 25,
    setbackRear: 25,
    setbackSideL: 20,
    setbackSideR: 20,
    stormIntensity: 50,
    annualRainfall: 1000
  },
  {
    name: 'Dense Urban Infill Townhome / Row House',
    category: 'Urban Infill',
    badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
    mode: 'setbacks_envelope',
    plotArea: 2500,
    plotWidth: 25,
    plotDepth: 100,
    footprint: 1750,
    stories: 3,
    pavedArea: 400,
    semiPermeableArea: 100,
    maxAllowedCoveragePct: 75,
    minRequiredGreenPct: 10,
    maxAllowedFAR: 2.2,
    setbackFront: 10,
    setbackRear: 8,
    setbackSideL: 0,
    setbackSideR: 0,
    stormIntensity: 45,
    annualRainfall: 800
  },
  {
    name: 'Healthcare Complex & Specialty Hospital',
    category: 'Healthcare / Critical',
    badgeColor: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300',
    mode: 'multi_building_campus',
    plotArea: 90000,
    plotWidth: 300,
    plotDepth: 300,
    footprint: 36000,
    stories: 6,
    pavedArea: 22000,
    semiPermeableArea: 8000,
    maxAllowedCoveragePct: 45,
    minRequiredGreenPct: 25,
    maxAllowedFAR: 2.8,
    setbackFront: 30,
    setbackRear: 25,
    setbackSideL: 20,
    setbackSideR: 20,
    stormIntensity: 65,
    annualRainfall: 950,
    campusBuildings: [
      { id: 'h1', name: 'Main Hospital Ward Tower', footprint: 20000, stories: 8, heightMeters: 36, color: 'bg-cyan-600' },
      { id: 'h2', name: 'Emergency & Surgical Diagnostic Wing', footprint: 10000, stories: 3, heightMeters: 14, color: 'bg-rose-600' },
      { id: 'h3', name: 'Outpatient Clinic & Administration', footprint: 4500, stories: 4, heightMeters: 16, color: 'bg-indigo-600' },
      { id: 'h4', name: 'Central MEP Plant & Oxygen Substation', footprint: 1500, stories: 1, heightMeters: 5, color: 'bg-slate-600' }
    ]
  }
];

export default function SiteCoverageCalculator() {
  const [unit, setUnit] = useState<AreaUnit>('sqft');
  const [mode, setMode] = useState<CoverageMode>('standard_coverage');

  // Core Area & Dimensions Inputs
  const [plotArea, setPlotArea] = useState<number>(6000);
  const [plotWidth, setPlotWidth] = useState<number>(60);
  const [plotDepth, setPlotDepth] = useState<number>(100);
  const [footprint, setFootprint] = useState<number>(2200);
  const [stories, setStories] = useState<number>(2);
  const [pavedArea, setPavedArea] = useState<number>(1200);
  const [semiPermeableArea, setSemiPermeableArea] = useState<number>(600);

  // Zoning Bylaw & Master Plan Constraints
  const [maxAllowedCoveragePct, setMaxAllowedCoveragePct] = useState<number>(40);
  const [minRequiredGreenPct, setMinRequiredGreenPct] = useState<number>(30);
  const [maxAllowedFAR, setMaxAllowedFAR] = useState<number>(1.2);

  // Setbacks Inputs (Linear unit: ft or m)
  const [setbackFront, setSetbackFront] = useState<number>(15);
  const [setbackRear, setSetbackRear] = useState<number>(12);
  const [setbackSideL, setSetbackSideL] = useState<number>(8);
  const [setbackSideR, setSetbackSideR] = useState<number>(8);

  // Stormwater & Environmental
  const [stormIntensity, setStormIntensity] = useState<number>(50); // mm/hr
  const [annualRainfall, setAnnualRainfall] = useState<number>(850); // mm

  // Campus Multi-Building List
  const [campusBuildings, setCampusBuildings] = useState<CampusBuilding[]>([
    { id: 'b1', name: 'Main Residential / Office Tower', footprint: 20000, stories: 8, heightMeters: 30, color: 'bg-indigo-600' },
    { id: 'b2', name: 'Parking Podium / Service Core', footprint: 12000, stories: 4, heightMeters: 15, color: 'bg-slate-600' },
    { id: 'b3', name: 'Clubhouse & Amenities Pavilion', footprint: 4000, stories: 2, heightMeters: 8, color: 'bg-emerald-600' }
  ]);

  // UI States
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(true);

  // Apply Preset
  const handleApplyPreset = (preset: PresetScenario) => {
    setMode(preset.mode);
    setPlotArea(preset.plotArea);
    setPlotWidth(preset.plotWidth);
    setPlotDepth(preset.plotDepth);
    setFootprint(preset.footprint);
    setStories(preset.stories);
    setPavedArea(preset.pavedArea);
    setSemiPermeableArea(preset.semiPermeableArea);
    setMaxAllowedCoveragePct(preset.maxAllowedCoveragePct);
    setMinRequiredGreenPct(preset.minRequiredGreenPct);
    setMaxAllowedFAR(preset.maxAllowedFAR);
    setSetbackFront(preset.setbackFront);
    setSetbackRear(preset.setbackRear);
    setSetbackSideL(preset.setbackSideL);
    setSetbackSideR(preset.setbackSideR);
    setStormIntensity(preset.stormIntensity);
    setAnnualRainfall(preset.annualRainfall);
    if (preset.campusBuildings) {
      setCampusBuildings(preset.campusBuildings);
    }
  };

  // Reset to Defaults
  const handleReset = () => {
    handleApplyPreset(PRESETS[0]);
  };

  // Dynamic Campus Building Handlers
  const handleAddBuilding = () => {
    const newId = 'b_' + Date.now();
    setCampusBuildings([
      ...campusBuildings,
      {
        id: newId,
        name: `Building ${campusBuildings.length + 1}`,
        footprint: Math.round(plotArea * 0.08),
        stories: 3,
        heightMeters: 12,
        color: 'bg-indigo-600'
      }
    ]);
  };

  const handleRemoveBuilding = (id: string) => {
    if (campusBuildings.length <= 1) return;
    setCampusBuildings(campusBuildings.filter((b) => b.id !== id));
  };

  const handleUpdateBuilding = (id: string, field: keyof CampusBuilding, value: any) => {
    setCampusBuildings(
      campusBuildings.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    );
  };

  // Campus Aggregated Footprint & GFA
  const campusAggregates = useMemo(() => {
    const totalCampusFootprint = campusBuildings.reduce((sum, b) => sum + (Number(b.footprint) || 0), 0);
    const totalCampusGFA = campusBuildings.reduce((sum, b) => sum + ((Number(b.footprint) || 0) * (Number(b.stories) || 1)), 0);
    return { totalCampusFootprint, totalCampusGFA };
  }, [campusBuildings]);

  // Effective Active Footprint
  const effectiveFootprint = mode === 'multi_building_campus' ? campusAggregates.totalCampusFootprint : footprint;

  // Primary Calculations & Analysis
  const results = useMemo(() => {
    // 1. Softscape Green Area is the remaining unbuilt/unpaved land
    const occupiedSoFar = effectiveFootprint + pavedArea + semiPermeableArea;
    const computedGreenArea = Math.max(0, plotArea - occupiedSoFar);

    // 2. Percentage Land Allocations
    const builtRatio = plotArea > 0 ? (effectiveFootprint / plotArea) * 100 : 0;
    const pavedRatio = plotArea > 0 ? (pavedArea / plotArea) * 100 : 0;
    const semiPermRatio = plotArea > 0 ? (semiPermeableArea / plotArea) * 100 : 0;
    const greenRatio = plotArea > 0 ? (computedGreenArea / plotArea) * 100 : 0;
    const openSpaceRatio = Math.max(0, 100 - builtRatio); // Unbuilt land

    // 3. Volumetric Gross Floor Area & FAR / FSI
    const grossFloorArea = mode === 'multi_building_campus' 
      ? campusAggregates.totalCampusGFA 
      : effectiveFootprint * Math.max(1, stories);
    const calculatedFAR = plotArea > 0 ? grossFloorArea / plotArea : 0;
    const isFARCompliant = calculatedFAR <= maxAllowedFAR + 0.01;

    // 4. Setbacks & Theoretical Buildable Envelope
    const buildableWidth = Math.max(0, plotWidth - setbackSideL - setbackSideR);
    const buildableDepth = Math.max(0, plotDepth - setbackFront - setbackRear);
    const buildableEnvelopeArea = buildableWidth * buildableDepth;
    const buildableEnvelopeRatio = plotArea > 0 ? (buildableEnvelopeArea / plotArea) * 100 : 0;
    const isFootprintWithinEnvelope = effectiveFootprint <= buildableEnvelopeArea + 1;

    // 5. Total Impervious Cover & Weighted Runoff Coefficient (C)
    // Runoff Coefficients (C): Roof=0.90, Concrete/Asphalt=0.85, Semi-Permeable=0.40, Green Lawns=0.15
    const cRoof = 0.90;
    const cPaved = 0.85;
    const cSemi = 0.40;
    const cGreen = 0.15;
    const cPreDevNatural = 0.20;

    const totalImperviousArea = effectiveFootprint + pavedArea;
    const totalImperviousPct = builtRatio + pavedRatio;
    const effectivePermeableArea = (computedGreenArea * 1.0) + (semiPermeableArea * 0.60);
    const effectivePermeablePct = plotArea > 0 ? (effectivePermeableArea / plotArea) * 100 : 0;

    const totalWeightedC = (effectiveFootprint * cRoof) + (pavedArea * cPaved) + (semiPermeableArea * cSemi) + (computedGreenArea * cGreen);
    const compositeRunoffCoefficient = plotArea > 0 ? totalWeightedC / plotArea : 0;

    // 6. Rational Method Stormwater Runoff Peak (Q = C * I * A / 3.6 in L/s)
    const plotAreaInM2 = unit === 'sqft' ? plotArea * 0.092903 : plotArea;
    const roofAreaInM2 = unit === 'sqft' ? effectiveFootprint * 0.092903 : effectiveFootprint;

    const peakRunoffLitersPerSec = (compositeRunoffCoefficient * stormIntensity * plotAreaInM2) / 3.6;
    const peakRunoffGPM = peakRunoffLitersPerSec * 15.8503; // Gallons per minute

    const preDevPeakRunoffLitersPerSec = (cPreDevNatural * stormIntensity * plotAreaInM2) / 3.6;
    const runoffDeltaLitersPerSec = Math.max(0, peakRunoffLitersPerSec - preDevPeakRunoffLitersPerSec);

    // Detention Tank Sizing (for 30-min peak event: Delta Q * 1800 sec)
    const requiredDetentionLiters = runoffDeltaLitersPerSec * 1800;
    const requiredDetentionGallons = requiredDetentionLiters * 0.264172;

    // Annual Rainwater Harvesting Potential (Roof * Annual Rain * 0.90 * 0.85 filter eff)
    const annualHarvestLiters = roofAreaInM2 * annualRainfall * cRoof * 0.85;
    const annualHarvestGallons = annualHarvestLiters * 0.264172;

    // 7. Zoning Compliance Assessment
    const maxAllowedFootprint = (maxAllowedCoveragePct / 100) * plotArea;
    const minRequiredGreenArea = (minRequiredGreenPct / 100) * plotArea;
    const coverageSurplusDeficit = maxAllowedFootprint - effectiveFootprint;
    const greenSurplusDeficit = computedGreenArea - minRequiredGreenArea;

    const isCoverageCompliant = builtRatio <= maxAllowedCoveragePct + 0.01;
    const isGreenCompliant = greenRatio >= minRequiredGreenPct - 0.01;
    const isMasterCompliant = isCoverageCompliant && isGreenCompliant && isFARCompliant && isFootprintWithinEnvelope;

    return {
      computedGreenArea,
      builtRatio,
      pavedRatio,
      semiPermRatio,
      greenRatio,
      openSpaceRatio,
      grossFloorArea,
      calculatedFAR,
      isFARCompliant,
      buildableWidth,
      buildableDepth,
      buildableEnvelopeArea,
      buildableEnvelopeRatio,
      isFootprintWithinEnvelope,
      totalImperviousArea,
      totalImperviousPct,
      effectivePermeableArea,
      effectivePermeablePct,
      compositeRunoffCoefficient,
      peakRunoffLitersPerSec,
      peakRunoffGPM,
      preDevPeakRunoffLitersPerSec,
      runoffDeltaLitersPerSec,
      requiredDetentionLiters,
      requiredDetentionGallons,
      annualHarvestLiters,
      annualHarvestGallons,
      maxAllowedFootprint,
      minRequiredGreenArea,
      coverageSurplusDeficit,
      greenSurplusDeficit,
      isCoverageCompliant,
      isGreenCompliant,
      isMasterCompliant
    };
  }, [
    plotArea, effectiveFootprint, pavedArea, semiPermeableArea, 
    stories, maxAllowedCoveragePct, minRequiredGreenPct, maxAllowedFAR,
    plotWidth, plotDepth, setbackFront, setbackRear, setbackSideL, setbackSideR,
    stormIntensity, annualRainfall, unit, mode, campusAggregates
  ]);

  // Vertical Massing Trade-Off Matrix (Target GFA vs Stories vs Resulting Footprint & Coverage)
  const verticalMassingScenarios = useMemo(() => {
    const targetGFA = results.grossFloorArea > 0 ? results.grossFloorArea : plotArea * 1.5;
    const storyLevels = [1, 2, 3, 4, 6, 8, 12, 16, 20];

    return storyLevels.map((lvl) => {
      const reqFootprint = Math.round(targetGFA / lvl);
      const reqCoveragePct = plotArea > 0 ? (reqFootprint / plotArea) * 100 : 0;
      const resOpenSpacePct = Math.max(0, 100 - reqCoveragePct);
      const isWithinCap = reqCoveragePct <= maxAllowedCoveragePct;
      const isCurrent = lvl === stories;

      return {
        stories: lvl,
        reqFootprint,
        reqCoveragePct,
        resOpenSpacePct,
        isWithinCap,
        isCurrent
      };
    });
  }, [results.grossFloorArea, plotArea, maxAllowedCoveragePct, stories]);

  // 5x5 Sensitivity Matrix: Plot Size vs Footprint -> Ground Coverage %
  const sensitivityMatrix = useMemo(() => {
    const plotMultipliers = [0.6, 0.8, 1.0, 1.25, 1.5];
    const footprintMultipliers = [0.6, 0.8, 1.0, 1.2, 1.4];

    return footprintMultipliers.map((fMult) => {
      const testFootprint = Math.round(effectiveFootprint * fMult);
      const cells = plotMultipliers.map((pMult) => {
        const testPlot = Math.round(plotArea * pMult);
        const testGCR = testPlot > 0 ? (testFootprint / testPlot) * 100 : 0;
        const isCompliant = testGCR <= maxAllowedCoveragePct;
        return {
          testPlot,
          testFootprint,
          testGCR,
          isCompliant,
          isBaseline: Math.abs(fMult - 1.0) < 0.05 && Math.abs(pMult - 1.0) < 0.05
        };
      });
      return { testFootprint, cells };
    });
  }, [effectiveFootprint, plotArea, maxAllowedCoveragePct]);

  // SVG Geometry for Master Plan Top-Down Blueprint
  const svgData = useMemo(() => {
    const width = 640;
    const height = 340;
    const padding = 30;
    const plotW = width - padding * 2;
    const plotH = height - padding * 2;

    // Setback margins scaled proportionally
    const pW = Math.max(1, plotWidth);
    const pD = Math.max(1, plotDepth);

    const scaleX = plotW / pW;
    const scaleY = plotH / pD;

    const sbLeft = Math.min(plotW * 0.35, setbackSideL * scaleX);
    const sbRight = Math.min(plotW * 0.35, setbackSideR * scaleX);
    const sbFront = Math.min(plotH * 0.35, setbackFront * scaleY);
    const sbRear = Math.min(plotH * 0.35, setbackRear * scaleY);

    const envX = padding + sbLeft;
    const envY = padding + sbRear;
    const envW = Math.max(10, plotW - sbLeft - sbRight);
    const envH = Math.max(10, plotH - sbFront - sbRear);

    // Building Footprint scaling inside envelope
    const builtRatioSqrt = Math.sqrt(Math.max(0, results.builtRatio) / 100);
    const bW = Math.min(envW, Math.max(40, builtRatioSqrt * plotW * 0.8));
    const bH = Math.min(envH, Math.max(35, builtRatioSqrt * plotH * 0.8));

    return {
      width,
      height,
      padding,
      plotW,
      plotH,
      envX,
      envY,
      envW,
      envH,
      bW,
      bH,
      sbLeft,
      sbRight,
      sbFront,
      sbRear
    };
  }, [plotWidth, plotDepth, setbackSideL, setbackSideR, setbackFront, setbackRear, results.builtRatio]);

  const unitLabel = unit === 'sqft' ? 'sq ft' : 'm²';
  const linearUnit = unit === 'sqft' ? 'ft' : 'm';

  const copyReport = () => {
    const text = `Site Coverage & Spatial Master Planning Specification
===========================================================
TOTAL PLOT PARAMETERS:
- Plot Area: ${plotArea.toLocaleString()} ${unitLabel} (${plotWidth} ${linearUnit} × ${plotDepth} ${linearUnit})
- Ground Footprint (Plinth): ${effectiveFootprint.toLocaleString()} ${unitLabel} (${results.builtRatio.toFixed(1)}% GCR)
- Paved Hardscape: ${pavedArea.toLocaleString()} ${unitLabel} (${results.pavedRatio.toFixed(1)}%)
- Porous Turf Pavers: ${semiPermeableArea.toLocaleString()} ${unitLabel} (${results.semiPermRatio.toFixed(1)}%)
- Softscape Open Green Space: ${results.computedGreenArea.toLocaleString()} ${unitLabel} (${results.greenRatio.toFixed(1)}%)
- Total Open Space Ratio (OSR): ${results.openSpaceRatio.toFixed(1)}%

VERTICAL MASSING & FLOOR AREA RATIO (FAR/FSI):
- Number of Stories: ${stories}
- Total Gross Floor Area (GFA): ${results.grossFloorArea.toLocaleString()} ${unitLabel}
- Proposed FAR / FSI: ${results.calculatedFAR.toFixed(2)} (Max Allowed: ${maxAllowedFAR.toFixed(2)}) -> ${results.isFARCompliant ? 'COMPLIANT' : 'FAR VIOLATION'}

SETBACKS & BUILDABLE ENVELOPE:
- Setbacks (Front / Rear / Left / Right): ${setbackFront} / ${setbackRear} / ${setbackSideL} / ${setbackSideR} ${linearUnit}
- Theoretical Max Buildable Envelope: ${results.buildableEnvelopeArea.toLocaleString()} ${unitLabel} (${results.buildableEnvelopeRatio.toFixed(1)}% of plot)
- Setback Envelope Compliance: ${results.isFootprintWithinEnvelope ? 'COMPLIANT (Within Envelope)' : 'VIOLATION (Encroaches Setbacks)'}

STORMWATER & ENVIRONMENTAL COMPLIANCE:
- Total Impervious Cover: ${results.totalImperviousPct.toFixed(1)}%
- Weighted Composite Runoff Factor (C): ${results.compositeRunoffCoefficient.toFixed(2)}
- Peak Post-Development Storm Runoff: ${results.peakRunoffLitersPerSec.toFixed(1)} L/s (${results.peakRunoffGPM.toFixed(1)} GPM)
- Runoff Surge Delta (Post - Pre): +${results.runoffDeltaLitersPerSec.toFixed(1)} L/s
- Required Detention Tank Volume (30-min peak): ${Math.round(results.requiredDetentionLiters).toLocaleString()} Liters (${Math.round(results.requiredDetentionGallons).toLocaleString()} Gallons)
- Annual Rainwater Harvesting Potential: ${Math.round(results.annualHarvestLiters).toLocaleString()} L/yr (${Math.round(results.annualHarvestGallons).toLocaleString()} Gal/yr)

MUNICIPAL ZONING AUDIT:
- Ground Coverage Cap: ${maxAllowedCoveragePct}% -> ${results.isCoverageCompliant ? 'COMPLIANT' : 'EXCEEDED'}
- Minimum Green Landscape: ${minRequiredGreenPct}% -> ${results.isGreenCompliant ? 'COMPLIANT' : 'DEFICIT'}
- Overall Zoning Verification: ${results.isMasterCompliant ? 'PASSED (Fully Compliant)' : 'FAILED (Requires Revision)'}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormula(id);
    setTimeout(() => setCopiedFormula(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 text-left pb-16">
      {/* Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-xl">
              <Compass className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Site Coverage & Master Planning Suite
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Calculate Ground Coverage Ratio (GCR %), open space ratio, setback buildable envelopes, FAR vertical massing, and stormwater detention cisterns.
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setUnit('sqft')}
              className={`px-3 py-1 rounded-lg transition-all ${
                unit === 'sqft'
                  ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Sq Ft (Imperial)
            </button>
            <button
              onClick={() => setUnit('sqm')}
              className={`px-3 py-1 rounded-lg transition-all ${
                unit === 'sqm'
                  ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              m² (Metric)
            </button>
          </div>

          <button
            onClick={copyReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Spec'}</span>
          </button>

          <button
            onClick={handleReset}
            className="p-2 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
            title="Reset to villa preset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preset Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Architectural Typology & Municipal Zoning Presets
          </span>
          <span className="text-xs text-zinc-400">Load master planning scenario</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => handleApplyPreset(p)}
              className="p-2.5 text-left bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-400 dark:hover:border-emerald-600 rounded-xl transition-all shadow-xs hover:shadow-md group flex flex-col justify-between"
            >
              <div>
                <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full mb-1 ${p.badgeColor}`}>
                  {p.category}
                </span>
                <p className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-tight">
                  {p.name}
                </p>
              </div>
              <span className="text-[9px] text-zinc-400 mt-2 flex items-center gap-0.5">
                Apply <ArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-1.5 bg-zinc-100 dark:bg-zinc-800/60 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setMode('standard_coverage')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
            mode === 'standard_coverage'
              ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span className="truncate">Standard Coverage</span>
        </button>

        <button
          onClick={() => setMode('zoning_compliance_by_typology')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
            mode === 'zoning_compliance_by_typology'
              ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="truncate">Zoning Compliance</span>
        </button>

        <button
          onClick={() => setMode('setbacks_envelope')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
            mode === 'setbacks_envelope'
              ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span className="truncate">Setbacks Envelope</span>
        </button>

        <button
          onClick={() => setMode('vertical_far_massing')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
            mode === 'vertical_far_massing'
              ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span className="truncate">FAR & Massing</span>
        </button>

        <button
          onClick={() => setMode('permeability_stormwater')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
            mode === 'permeability_stormwater'
              ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Droplets className="w-3.5 h-3.5" />
          <span className="truncate">Stormwater & Rain</span>
        </button>

        <button
          onClick={() => setMode('multi_building_campus')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
            mode === 'multi_building_campus'
              ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span className="truncate">Campus Master Plan</span>
        </button>
      </div>

      {/* Main Grid: Control Inputs (5 cols) + Hero Cards (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Inputs (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-emerald-500" />
                Plot & Footprint Specifications ({unitLabel})
              </span>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline font-medium"
              >
                {showAdvanced ? 'Hide Detailed Controls' : 'Show Detailed Controls'}
                {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* If Multi-Building Campus Mode, Show Dynamic Buildings Manager */}
            {mode === 'multi_building_campus' ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                    Campus Buildings Footprint Schedule
                  </label>
                  <button
                    onClick={handleAddBuilding}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all shadow-xs"
                  >
                    <Plus className="w-3 h-3" /> Add Building
                  </button>
                </div>

                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                  {campusBuildings.map((b, idx) => (
                    <div
                      key={b.id}
                      className="p-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={b.name}
                          onChange={(e) => handleUpdateBuilding(b.id, 'name', e.target.value)}
                          className="font-bold text-zinc-800 dark:text-zinc-200 bg-transparent border-b border-transparent hover:border-zinc-300 focus:border-indigo-500 outline-none w-full text-xs"
                        />
                        {campusBuildings.length > 1 && (
                          <button
                            onClick={() => handleRemoveBuilding(b.id)}
                            className="text-zinc-400 hover:text-rose-500 p-1"
                            title="Remove building"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-zinc-500">Footprint ({unitLabel})</label>
                          <input
                            type="number"
                            value={b.footprint}
                            onChange={(e) => handleUpdateBuilding(b.id, 'footprint', Math.max(0, parseFloat(e.target.value) || 0))}
                            className="w-full px-2 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-zinc-500">Stories / Floors</label>
                          <input
                            type="number"
                            min="1"
                            value={b.stories}
                            onChange={(e) => handleUpdateBuilding(b.id, 'stories', Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full px-2 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 rounded-xl flex justify-between items-center text-xs">
                  <span className="text-zinc-600 dark:text-zinc-400">Total Campus Footprint:</span>
                  <span className="font-bold font-mono text-indigo-700 dark:text-indigo-300">
                    {campusAggregates.totalCampusFootprint.toLocaleString()} {unitLabel} ({results.builtRatio.toFixed(1)}%)
                  </span>
                </div>
              </div>
            ) : (
              /* Single Building Primary Spatial Inputs */
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Total Site Plot Area ({unitLabel})
                    </label>
                    <span className="text-[11px] text-zinc-400 font-mono">
                      {plotWidth} × {plotDepth} {linearUnit}
                    </span>
                  </div>
                  <input
                    type="number"
                    value={plotArea}
                    onChange={(e) => {
                      const val = Math.max(1, parseFloat(e.target.value) || 0);
                      setPlotArea(val);
                      // Proportionally sync width/depth
                      const newW = Math.round(Math.sqrt(val / 1.5));
                      setPlotWidth(newW);
                      setPlotDepth(Math.round(val / newW));
                    }}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-mono text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Building Ground Footprint / Plinth ({unitLabel})
                    </label>
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {results.builtRatio.toFixed(1)}% GCR
                    </span>
                  </div>
                  <input
                    type="number"
                    value={footprint}
                    onChange={(e) => setFootprint(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-mono text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Vertical Stories / Floors
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={stories}
                      onChange={(e) => setStories(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-mono text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Paved Hardscape ({unitLabel})
                    </label>
                    <input
                      type="number"
                      value={pavedArea}
                      onChange={(e) => setPavedArea(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-mono text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Porous / Turf Grid Pavers ({unitLabel})
                  </label>
                  <input
                    type="number"
                    value={semiPermeableArea}
                    onChange={(e) => setSemiPermeableArea(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-mono text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* Advanced Setbacks, Zoning & Stormwater Controls */}
            {showAdvanced && (
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
                {/* Setbacks Subsection */}
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-2">
                    Mandatory Boundary Setbacks ({linearUnit})
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <label className="block text-[10px] text-zinc-500">Front</label>
                      <input
                        type="number"
                        value={setbackFront}
                        onChange={(e) => setSetbackFront(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full px-2 py-1 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-500">Rear</label>
                      <input
                        type="number"
                        value={setbackRear}
                        onChange={(e) => setSetbackRear(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full px-2 py-1 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-500">Side (Left)</label>
                      <input
                        type="number"
                        value={setbackSideL}
                        onChange={(e) => setSetbackSideL(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full px-2 py-1 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-500">Side (Right)</label>
                      <input
                        type="number"
                        value={setbackSideR}
                        onChange={(e) => setSetbackSideR(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full px-2 py-1 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Zoning Caps */}
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-2">
                    Zoning Caps & Floor Space Index (FAR)
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-zinc-500">Max GCR (%)</label>
                      <input
                        type="number"
                        value={maxAllowedCoveragePct}
                        onChange={(e) => setMaxAllowedCoveragePct(Math.min(100, Math.max(1, parseFloat(e.target.value) || 0)))}
                        className="w-full px-2 py-1 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-500">Min Green (%)</label>
                      <input
                        type="number"
                        value={minRequiredGreenPct}
                        onChange={(e) => setMinRequiredGreenPct(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                        className="w-full px-2 py-1 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-500">Max FAR / FSI</label>
                      <input
                        type="number"
                        step="0.1"
                        value={maxAllowedFAR}
                        onChange={(e) => setMaxAllowedFAR(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                        className="w-full px-2 py-1 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Stormwater Controls */}
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-2">
                    Hydrology & Stormwater Parameters
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-zinc-500">Peak Storm (mm/h)</label>
                      <input
                        type="number"
                        value={stormIntensity}
                        onChange={(e) => setStormIntensity(Math.max(1, parseFloat(e.target.value) || 0))}
                        className="w-full px-2 py-1 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-500">Annual Rain (mm)</label>
                      <input
                        type="number"
                        value={annualRainfall}
                        onChange={(e) => setAnnualRainfall(Math.max(1, parseFloat(e.target.value) || 0))}
                        className="w-full px-2 py-1 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Hero Card & Comprehensive Spatial Metrics (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Hero Card */}
          <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-emerald-800/30">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs uppercase font-bold tracking-widest text-emerald-300 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  Site Ground Coverage Ratio (GCR)
                </span>
                <div className="text-4xl sm:text-5xl font-black font-mono my-2 tracking-tight text-white flex items-baseline gap-2">
                  <span>{results.builtRatio.toFixed(1)}%</span>
                  <span className="text-sm font-normal text-emerald-200">of Total Plot</span>
                </div>
              </div>

              <div className="text-right">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                  results.isMasterCompliant 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {results.isMasterCompliant ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  {results.isMasterCompliant ? 'Bylaws Compliant' : 'Zoning Violation'}
                </span>
                <p className="text-[11px] font-mono text-emerald-200 mt-1">
                  Permitted Cap: {maxAllowedCoveragePct}%
                </p>
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 mt-4 border-t border-white/10 text-xs">
              <div className="bg-white/5 rounded-xl p-2.5 backdrop-blur-xs">
                <span className="text-emerald-300 block text-[10px] font-medium uppercase">Open Space (OSR)</span>
                <span className="text-base font-bold font-mono text-white mt-0.5 block">
                  {results.openSpaceRatio.toFixed(1)}%
                </span>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5 backdrop-blur-xs">
                <span className="text-emerald-300 block text-[10px] font-medium uppercase">FAR / FSI</span>
                <span className="text-base font-bold font-mono text-white mt-0.5 block">
                  {results.calculatedFAR.toFixed(2)}
                </span>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5 backdrop-blur-xs">
                <span className="text-emerald-300 block text-[10px] font-medium uppercase">Total GFA Built</span>
                <span className="text-base font-bold font-mono text-white mt-0.5 block truncate">
                  {results.grossFloorArea.toLocaleString()}
                </span>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5 backdrop-blur-xs">
                <span className="text-emerald-300 block text-[10px] font-medium uppercase">Peak Runoff (Q)</span>
                <span className="text-base font-bold font-mono text-white mt-0.5 block">
                  {results.peakRunoffLitersPerSec.toFixed(1)} L/s
                </span>
              </div>
            </div>
          </div>

          {/* Land Allocation Stack Bar */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-500" />
                Ground Surface Land Use Breakdown
              </span>
              <span className="text-zinc-400 font-mono text-[11px]">Plot = 100% ({plotArea.toLocaleString()} {unitLabel})</span>
            </div>

            {/* Stacked Progress Bar */}
            <div className="w-full h-4 rounded-full overflow-hidden flex bg-zinc-100 dark:bg-zinc-800">
              <div
                style={{ width: `${Math.max(0, results.builtRatio)}%` }}
                className="bg-indigo-600 h-full transition-all"
                title={`Building Footprint: ${results.builtRatio.toFixed(1)}%`}
              />
              <div
                style={{ width: `${Math.max(0, results.pavedRatio)}%` }}
                className="bg-slate-500 h-full transition-all"
                title={`Paved Hardscape: ${results.pavedRatio.toFixed(1)}%`}
              />
              <div
                style={{ width: `${Math.max(0, results.semiPermRatio)}%` }}
                className="bg-amber-500 h-full transition-all"
                title={`Porous Pavers: ${results.semiPermRatio.toFixed(1)}%`}
              />
              <div
                style={{ width: `${Math.max(0, results.greenRatio)}%` }}
                className="bg-emerald-500 h-full transition-all"
                title={`Softscape Green: ${results.greenRatio.toFixed(1)}%`}
              />
            </div>

            {/* Legend Breakdown Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">Built Footprint</span>
                </div>
                <span className="font-bold font-mono text-zinc-800 dark:text-zinc-200">
                  {results.builtRatio.toFixed(1)}% ({effectiveFootprint.toLocaleString()})
                </span>
              </div>

              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div className="w-2 h-2 rounded-full bg-slate-500 shrink-0" />
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">Paved Hardscape</span>
                </div>
                <span className="font-bold font-mono text-zinc-800 dark:text-zinc-200">
                  {results.pavedRatio.toFixed(1)}% ({pavedArea.toLocaleString()})
                </span>
              </div>

              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">Porous Pavers</span>
                </div>
                <span className="font-bold font-mono text-zinc-800 dark:text-zinc-200">
                  {results.semiPermRatio.toFixed(1)}% ({semiPermeableArea.toLocaleString()})
                </span>
              </div>

              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">Green Softscape</span>
                </div>
                <span className="font-bold font-mono text-zinc-800 dark:text-zinc-200">
                  {results.greenRatio.toFixed(1)}% ({results.computedGreenArea.toLocaleString()})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SVG Interactive Top-Down Blueprint & Setback Envelope Visualizer */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              Architectural Site Layout, Setbacks & Buildable Envelope Model
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Interactive top-down master plan rendering plot limits, mandatory setbacks, legal buildable envelope, and plinth footprints.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-indigo-600" />
              <span className="text-zinc-600 dark:text-zinc-300 font-semibold">Building Plinth</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded border border-dashed border-amber-500 bg-amber-500/10" />
              <span className="text-zinc-600 dark:text-zinc-300 font-semibold">Buildable Envelope</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-500" />
              <span className="text-zinc-600 dark:text-zinc-300 font-semibold">Paved</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500" />
              <span className="text-zinc-600 dark:text-zinc-300 font-semibold">Softscape Green</span>
            </div>
          </div>
        </div>

        <div className="relative w-full overflow-x-auto bg-zinc-50/50 dark:bg-zinc-950/50 rounded-xl p-3 border border-zinc-100 dark:border-zinc-800">
          <svg
            viewBox={`0 0 ${svgData.width} ${svgData.height}`}
            className="w-full h-auto max-h-[380px] font-sans select-none"
          >
            {/* Plot Boundary */}
            <rect
              x={svgData.padding}
              y={svgData.padding}
              width={svgData.plotW}
              height={svgData.plotH}
              rx="8"
              className="fill-emerald-500/10 stroke-emerald-600/50 dark:stroke-emerald-500/40"
              strokeWidth="2"
            />
            <text
              x={svgData.padding + 12}
              y={svgData.padding + 18}
              className="text-[11px] font-bold fill-emerald-800 dark:fill-emerald-300"
            >
              Plot Limits: {plotArea.toLocaleString()} {unitLabel} ({plotWidth} × {plotDepth} {linearUnit})
            </text>

            {/* Setback Buildable Envelope (Dashed Rect) */}
            <rect
              x={svgData.envX}
              y={svgData.envY}
              width={svgData.envW}
              height={svgData.envH}
              rx="6"
              className="fill-amber-500/5 stroke-amber-500/60 dark:stroke-amber-400/50 stroke-dasharray-4"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <text
              x={svgData.envX + 8}
              y={svgData.envY + 14}
              className="text-[10px] font-bold fill-amber-700 dark:fill-amber-300"
            >
              Legal Buildable Envelope: {results.buildableEnvelopeArea.toLocaleString()} {unitLabel} ({results.buildableEnvelopeRatio.toFixed(1)}%)
            </text>

            {/* Paved Parking / Driveway Stripe along Bottom */}
            {results.pavedRatio > 0 && (
              <rect
                x={svgData.padding}
                y={svgData.padding + svgData.plotH - 45}
                width={svgData.plotW}
                height={45}
                rx="4"
                className="fill-slate-500/25 stroke-slate-500/40"
                strokeWidth="1.5"
              />
            )}
            {results.pavedRatio > 0 && (
              <text
                x={svgData.padding + svgData.plotW / 2}
                y={svgData.padding + svgData.plotH - 18}
                textAnchor="middle"
                className="text-[10px] font-bold fill-slate-700 dark:fill-slate-300"
              >
                Paved Access Driveway / Parking: {pavedArea.toLocaleString()} {unitLabel} ({results.pavedRatio.toFixed(1)}%)
              </text>
            )}

            {/* Building Footprint(s) Rendering */}
            {mode === 'multi_building_campus' ? (
              // Multi Building Campus Layout
              campusBuildings.map((b, i) => {
                const offsetX = svgData.envX + 15 + (i % 2) * (svgData.envW * 0.45);
                const offsetY = svgData.envY + 25 + Math.floor(i / 2) * (svgData.envH * 0.42);
                const bW = Math.max(35, Math.min(svgData.envW * 0.4, (b.footprint / effectiveFootprint) * svgData.envW * 0.7));
                const bH = Math.max(30, Math.min(svgData.envH * 0.35, (b.footprint / effectiveFootprint) * svgData.envH * 0.6));

                return (
                  <g key={b.id}>
                    <rect
                      x={offsetX}
                      y={offsetY}
                      width={bW}
                      height={bH}
                      rx="4"
                      className="fill-indigo-600/85 stroke-indigo-400"
                      strokeWidth="1.5"
                    />
                    <text
                      x={offsetX + 6}
                      y={offsetY + 15}
                      className="text-[9px] font-bold fill-white truncate"
                    >
                      {b.name}
                    </text>
                    <text
                      x={offsetX + 6}
                      y={offsetY + 27}
                      className="text-[8px] font-mono fill-indigo-200"
                    >
                      {b.footprint.toLocaleString()} {unitLabel} ({b.stories}F)
                    </text>
                  </g>
                );
              })
            ) : (
              // Single Building Block
              <g>
                <rect
                  x={svgData.envX + 15}
                  y={svgData.envY + 25}
                  width={Math.min(svgData.envW - 30, Math.max(50, svgData.bW))}
                  height={Math.min(svgData.envH - 40, Math.max(40, svgData.bH))}
                  rx="6"
                  className="fill-indigo-600/85 stroke-indigo-400 shadow-md"
                  strokeWidth="2"
                />
                <text
                  x={svgData.envX + 25}
                  y={svgData.envY + 50}
                  className="text-[11px] font-black fill-white"
                >
                  Building Plinth Footprint
                </text>
                <text
                  x={svgData.envX + 25}
                  y={svgData.envY + 66}
                  className="text-[10px] font-mono fill-indigo-200"
                >
                  {effectiveFootprint.toLocaleString()} {unitLabel} | GCR: {results.builtRatio.toFixed(1)}%
                </text>
              </g>
            )}

            {/* Setback Dimensions Dimension Labels */}
            <text
              x={svgData.padding + svgData.plotW / 2}
              y={svgData.padding + 14}
              textAnchor="middle"
              className="text-[9px] font-mono fill-zinc-500"
            >
              Rear Setback: {setbackRear} {linearUnit}
            </text>
            <text
              x={svgData.padding + 10}
              y={svgData.padding + svgData.plotH / 2}
              textAnchor="start"
              className="text-[9px] font-mono fill-zinc-500"
            >
              Side L: {setbackSideL} {linearUnit}
            </text>
            <text
              x={svgData.padding + svgData.plotW - 10}
              y={svgData.padding + svgData.plotH / 2}
              textAnchor="end"
              className="text-[9px] font-mono fill-zinc-500"
            >
              Side R: {setbackSideR} {linearUnit}
            </text>
          </svg>
        </div>
      </div>

      {/* Advanced Analysis Tabs: Vertical Massing Trade-Off & Stormwater Sizing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Vertical Massing & Stories vs Ground Footprint Trade-off */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                Vertical Density: Stories vs Ground Footprint
              </h4>
              <p className="text-[11px] text-zinc-500">
                Target GFA: {results.grossFloorArea.toLocaleString()} {unitLabel} (Building taller frees up ground open space).
              </p>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[220px]">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  <th className="p-2 border border-zinc-200 dark:border-zinc-700 font-semibold">Stories</th>
                  <th className="p-2 border border-zinc-200 dark:border-zinc-700 font-semibold">Footprint</th>
                  <th className="p-2 border border-zinc-200 dark:border-zinc-700 font-semibold">GCR (%)</th>
                  <th className="p-2 border border-zinc-200 dark:border-zinc-700 font-semibold">Open Space</th>
                  <th className="p-2 border border-zinc-200 dark:border-zinc-700 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {verticalMassingScenarios.map((sc) => (
                  <tr
                    key={sc.stories}
                    className={`hover:bg-zinc-50 dark:hover:bg-zinc-800/40 ${
                      sc.isCurrent ? 'bg-indigo-50/70 dark:bg-indigo-950/40 font-bold' : ''
                    }`}
                  >
                    <td className="p-2 border border-zinc-200 dark:border-zinc-700 font-mono">
                      {sc.stories} {sc.stories === 1 ? 'Floor' : 'Floors'} {sc.isCurrent ? '★' : ''}
                    </td>
                    <td className="p-2 border border-zinc-200 dark:border-zinc-700 font-mono">
                      {sc.reqFootprint.toLocaleString()} {unitLabel}
                    </td>
                    <td className="p-2 border border-zinc-200 dark:border-zinc-700 font-mono">
                      {sc.reqCoveragePct.toFixed(1)}%
                    </td>
                    <td className="p-2 border border-zinc-200 dark:border-zinc-700 font-mono text-emerald-600 dark:text-emerald-400">
                      {sc.resOpenSpacePct.toFixed(1)}%
                    </td>
                    <td className="p-2 border border-zinc-200 dark:border-zinc-700 font-mono">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        sc.isWithinCap ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'
                      }`}>
                        {sc.isWithinCap ? 'Compliant' : 'Over Cap'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Card 2: Civil Stormwater Detention & Rainwater Harvesting Tank Sizer */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <CloudRain className="w-3.5 h-3.5 text-cyan-500" />
                Stormwater Detention & Rainwater Cistern Sizer
              </h4>
              <p className="text-[11px] text-zinc-500">
                Civil drainage sizing for peak mitigation & groundwater recharge.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">Peak Runoff Surge (ΔQ)</span>
              <span className="text-lg font-black font-mono text-indigo-600 dark:text-indigo-400 block">
                +{results.runoffDeltaLitersPerSec.toFixed(1)} L/s
              </span>
              <span className="text-[10px] text-zinc-400">
                Pre: {results.preDevPeakRunoffLitersPerSec.toFixed(1)} L/s → Post: {results.peakRunoffLitersPerSec.toFixed(1)} L/s
              </span>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">Detention Tank Capacity</span>
              <span className="text-lg font-black font-mono text-cyan-600 dark:text-cyan-400 block">
                {Math.round(results.requiredDetentionLiters).toLocaleString()} Liters
              </span>
              <span className="text-[10px] text-zinc-400">
                {Math.round(results.requiredDetentionGallons).toLocaleString()} US Gallons (30-min peak)
              </span>
            </div>

            <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-1 col-span-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-emerald-800 dark:text-emerald-300 uppercase font-bold">
                  Annual Roof Rainwater Harvesting Yield
                </span>
                <span className="text-[10px] font-mono text-emerald-600">η = 85% capture</span>
              </div>
              <div className="text-xl font-black font-mono text-emerald-700 dark:text-emerald-300">
                {Math.round(results.annualHarvestLiters).toLocaleString()} Liters / year
                <span className="text-xs font-normal text-emerald-600 dark:text-emerald-400 ml-2">
                  ({Math.round(results.annualHarvestGallons).toLocaleString()} Gal/yr)
                </span>
              </div>
              <p className="text-[10px] text-zinc-500">
                Replaces domestic non-potable flushing / landscape irrigation demand.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5x5 Sensitivity Matrix: Plot Size vs Footprint -> GCR % */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-500" />
              5×5 Sensitivity Matrix: Building Footprint vs Plot Area (GCR %)
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Ground Coverage Percentage across varying plinth footprint sizes and total plot areas.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              <tr className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                <th className="p-2.5 text-left border border-zinc-200 dark:border-zinc-700 font-semibold">
                  Footprint \ Plot Area
                </th>
                {sensitivityMatrix[0]?.cells.map((c, i) => (
                  <th key={i} className="p-2.5 border border-zinc-200 dark:border-zinc-700 font-mono">
                    {c.testPlot.toLocaleString()} {unitLabel}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sensitivityMatrix.map((row) => (
                <tr key={row.testFootprint} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="p-2 text-left font-bold font-mono border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 text-zinc-800 dark:text-zinc-200">
                    {row.testFootprint.toLocaleString()} {unitLabel}
                  </td>
                  {row.cells.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      className={`p-2 border border-zinc-200 dark:border-zinc-700 font-mono ${
                        cell.isBaseline
                          ? 'bg-emerald-100 dark:bg-emerald-900/60 font-black text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500'
                          : cell.isCompliant
                          ? 'text-emerald-700 dark:text-emerald-300'
                          : 'text-rose-600 dark:text-rose-400 font-semibold bg-rose-50/40 dark:bg-rose-950/20'
                      }`}
                    >
                      <div className="font-bold">{cell.testGCR.toFixed(1)}%</div>
                      <div className="text-[10px] text-zinc-400 font-sans">
                        {cell.isCompliant ? 'Compliant' : 'Exceeds Cap'}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* LaTeX Formal Architectural Formulations */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Formal Site Planning & Civil Stormwater Formulations
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Rigorous architectural equations formatted in LaTeX. Click any equation block to copy for specifications.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Proof 1: Ground Coverage Ratio */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2 relative group">
            <div className="flex justify-between items-center">
              <span className="font-bold text-zinc-800 dark:text-zinc-200">1. Ground Coverage & Open Space Ratios</span>
              <button
                onClick={() => copyToClipboard('\text{GCR} = \left( \frac{A_{\text{footprint}}}{A_{\text{plot}}} \right) \times 100\%', 'gcr_proof')}
                className="text-zinc-400 hover:text-emerald-600 transition-colors"
                title="Copy LaTeX"
              >
                {copiedFormula === 'gcr_proof' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-zinc-400" />}
              </button>
            </div>
            <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border font-mono text-[11px] text-emerald-900 dark:text-emerald-300 overflow-x-auto">
              {"\text{GCR} = \left( \frac{A_{\text{footprint}}}{A_{\text{plot}}} \right) \times 100\%"}
              <br />
              {"\text{Open Space Ratio (OSR)} = 100\% - \text{GCR}"}
            </div>
            <p className="text-[11px] text-zinc-500">
              Measures the portion of the plot footprint covered by the plinth of all ground-level structures.
            </p>
          </div>

          {/* Proof 2: Buildable Setback Envelope */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2 relative group">
            <div className="flex justify-between items-center">
              <span className="font-bold text-zinc-800 dark:text-zinc-200">2. Buildable Envelope Area</span>
              <button
                onClick={() => copyToClipboard('A_{\text{envelope}} = (W_{\text{plot}} - S_L - S_R) \times (D_{\text{plot}} - S_F - S_R)', 'envelope_proof')}
                className="text-zinc-400 hover:text-emerald-600 transition-colors"
                title="Copy LaTeX"
              >
                {copiedFormula === 'envelope_proof' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-zinc-400" />}
              </button>
            </div>
            <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border font-mono text-[11px] text-emerald-900 dark:text-emerald-300 overflow-x-auto">
              {"A_{\text{envelope}} = (W - S_{\text{side,L}} - S_{\text{side,R}}) \times (D - S_{\text{front}} - S_{\text{rear}})"}
            </div>
            <p className="text-[11px] text-zinc-500">
              Theoretical maximum rectangle formed by mandatory front, rear, and lateral yard setbacks.
            </p>
          </div>

          {/* Proof 3: Weighted Runoff Coefficient */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2 relative group">
            <div className="flex justify-between items-center">
              <span className="font-bold text-zinc-800 dark:text-zinc-200">3. Weighted Composite Runoff (C)</span>
              <button
                onClick={() => copyToClipboard('C_{\text{comp}} = \frac{\sum (C_i \cdot A_i)}{A_{\text{plot}}}', 'runoff_proof')}
                className="text-zinc-400 hover:text-emerald-600 transition-colors"
                title="Copy LaTeX"
              >
                {copiedFormula === 'runoff_proof' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-zinc-400" />}
              </button>
            </div>
            <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border font-mono text-[11px] text-emerald-900 dark:text-emerald-300 overflow-x-auto">
              {"C_{\text{comp}} = \frac{C_{\text{roof}} A_{\text{built}} + C_{\text{paved}} A_{\text{paved}} + C_{\text{semi}} A_{\text{semi}} + C_{\text{green}} A_{\text{green}}}{A_{\text{plot}}}"}
            </div>
            <p className="text-[11px] text-zinc-500">
              Area-weighted composite runoff factor utilized in civil stormwater drainage design and detention sizing.
            </p>
          </div>

          {/* Proof 4: Rational Stormwater Peak Discharge */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2 relative group">
            <div className="flex justify-between items-center">
              <span className="font-bold text-zinc-800 dark:text-zinc-200">4. Rational Stormwater Peak Discharge</span>
              <button
                onClick={() => copyToClipboard('Q = \frac{C \cdot I \cdot A}{3.6} \quad [\text{Liters / second}]', 'rational_proof')}
                className="text-zinc-400 hover:text-emerald-600 transition-colors"
                title="Copy LaTeX"
              >
                {copiedFormula === 'rational_proof' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-zinc-400" />}
              </button>
            </div>
            <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border font-mono text-[11px] text-emerald-900 dark:text-emerald-300 overflow-x-auto">
              {"Q_{\text{peak}} = \frac{C_{\text{comp}} \cdot I(\text{mm/h}) \cdot A(\text{m}^2)}{3.6}"}
              <br />
              {"V_{\text{detention}} = \Delta Q \times t_{\text{storm}} \times 60"}
            </div>
            <p className="text-[11px] text-zinc-500">
              Determines peak stormwater discharge rates and sizing required for retention tanks to avoid municipal main flooding.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

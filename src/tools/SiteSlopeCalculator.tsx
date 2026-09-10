import { useState, useMemo } from 'react';
import {
  Copy, Check, RotateCcw,
  Sparkles,
  Sliders, ChevronDown, ChevronUp,
  Calculator, Layers,
  Activity, TrendingUp,
  ShieldCheck,
  ArrowRight,
  Building2, CheckCircle2,
  Mountain, Shovel, Car, Accessibility
} from 'lucide-react';

type SlopeMode = 'elevation_points' | 'rise_run' | 'grading_suitability' | 'earthwork_cut_fill' | 'infrastructure_compliance' | 'topo_transect';
type SlopeUnit = 'imperial' | 'metric';

interface MultiSegmentPoint {
  id: string;
  name: string;
  run: number;
  rise: number;
}

interface PresetScenario {
  name: string;
  category: string;
  badgeColor: string;
  mode: SlopeMode;
  elevationStart: number;
  elevationEnd: number;
  horizontalRun: number;
  targetSlopePct?: number;
  padWidth?: number;
  padLength?: number;
  padTargetElevation?: number;
  description: string;
}

const PRESETS: PresetScenario[] = [
  {
    name: 'Flat Suburban Lot (Drainage Ponding Risk)',
    category: 'Drainage & Ponding',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    mode: 'elevation_points',
    elevationStart: 100.0,
    elevationEnd: 100.8,
    horizontalRun: 100,
    targetSlopePct: 2.0,
    description: 'Requires minimum 1.5–2% slope to prevent water ponding near footings.'
  },
  {
    name: 'Optimal Residential Site Grading',
    category: 'Ideal Building Pad',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    mode: 'elevation_points',
    elevationStart: 100.0,
    elevationEnd: 103.5,
    horizontalRun: 100,
    targetSlopePct: 3.5,
    description: 'Ideal 2–4% natural slope for positive gravity drainage and easy foundations.'
  },
  {
    name: 'ADA / Universal Accessible Pedestrian Walkway',
    category: 'Accessibility Walkway',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    mode: 'infrastructure_compliance',
    elevationStart: 50.0,
    elevationEnd: 52.4,
    horizontalRun: 50,
    targetSlopePct: 4.8,
    description: 'Compliant with 1:20 (5.0%) maximum unassisted pathway gradient.'
  },
  {
    name: 'Steep Hillside Residential Driveway',
    category: 'Driveway Grade',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
    mode: 'infrastructure_compliance',
    elevationStart: 100.0,
    elevationEnd: 110.0,
    horizontalRun: 80,
    targetSlopePct: 12.5,
    description: '12.5% (1:8) slope near maximum vehicle traction and crest transition limit.'
  },
  {
    name: 'Terraced Mountain Villa Pad (Cut & Fill)',
    category: 'Hillside Terracing',
    badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
    mode: 'earthwork_cut_fill',
    elevationStart: 100.0,
    elevationEnd: 115.0,
    horizontalRun: 100,
    padWidth: 40,
    padLength: 60,
    padTargetElevation: 107.5,
    description: '15% slope requiring balanced cut-and-fill pad and engineered retaining walls.'
  },
  {
    name: 'Stormwater Bio-Swale / Grass Drainage Swale',
    category: 'Stormwater Swale',
    badgeColor: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
    mode: 'rise_run',
    elevationStart: 200.0,
    elevationEnd: 203.75,
    horizontalRun: 150,
    targetSlopePct: 2.5,
    description: '2.5% longitudinal slope ensures self-cleansing velocity without erosion.'
  },
  {
    name: 'Steep Urban Infill Ramp (1:12 ADA Max)',
    category: 'Wheelchair Ramp',
    badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
    mode: 'infrastructure_compliance',
    elevationStart: 10.0,
    elevationEnd: 12.5,
    horizontalRun: 30,
    targetSlopePct: 8.33,
    description: '1:12 (8.33%) statutory ceiling for accessible entrance ramps with handrails.'
  },
  {
    name: 'Severe Escarpment / Restricted Mountain Slope',
    category: 'Extreme Terrain',
    badgeColor: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    mode: 'grading_suitability',
    elevationStart: 500.0,
    elevationEnd: 535.0,
    horizontalRun: 100,
    targetSlopePct: 35.0,
    description: '35% slope exceeding safe conventional construction limits; pile stilts required.'
  }
];

export default function SiteSlopeCalculator() {
  const [unit, setUnit] = useState<SlopeUnit>('imperial');
  const [mode, setMode] = useState<SlopeMode>('elevation_points');

  // Primary Input Variables
  const [elevationStart, setElevationStart] = useState<number>(100.0);
  const [elevationEnd, setElevationEnd] = useState<number>(103.5);
  const [horizontalRun, setHorizontalRun] = useState<number>(100.0);
  const [targetSlopePct, setTargetSlopePct] = useState<number>(3.5);

  // Earthwork Cut & Fill Pad Parameters
  const [padWidth, setPadWidth] = useState<number>(40);
  const [padLength, setPadLength] = useState<number>(60);
  const [padTargetElevation, setPadTargetElevation] = useState<number>(101.75);

  // Multi-Segment Topo Profile
  const [segments, setSegments] = useState<MultiSegmentPoint[]>([
    { id: 's1', name: 'Front Access Road & Sidewalk', run: 30, rise: 0.6 },
    { id: 's2', name: 'Front Lawn / Driveway Approach', run: 40, rise: 2.0 },
    { id: 's3', name: 'Building Footprint Pad', run: 50, rise: 0.5 },
    { id: 's4', name: 'Rear Yard & Hillside Backslope', run: 40, rise: 6.0 }
  ]);

  // UI States
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(true);

  // Unit Labels
  const linearUnit = unit === 'imperial' ? 'ft' : 'm';
  const volumeUnit = unit === 'imperial' ? 'cu yd' : 'm³';

  // Apply Preset
  const handleApplyPreset = (preset: PresetScenario) => {
    setMode(preset.mode);
    setElevationStart(preset.elevationStart);
    setElevationEnd(preset.elevationEnd);
    setHorizontalRun(preset.horizontalRun);
    if (preset.targetSlopePct !== undefined) setTargetSlopePct(preset.targetSlopePct);
    if (preset.padWidth !== undefined) setPadWidth(preset.padWidth);
    if (preset.padLength !== undefined) setPadLength(preset.padLength);
    if (preset.padTargetElevation !== undefined) setPadTargetElevation(preset.padTargetElevation);
  };

  // Reset to Defaults
  const handleReset = () => {
    handleApplyPreset(PRESETS[1]);
  };

  // Primary Slope Calculations
  const results = useMemo(() => {
    // 1. Rise & Elevation Delta
    const rise = elevationEnd - elevationStart;
    const absRise = Math.abs(rise);
    const run = Math.max(0.001, horizontalRun);

    // 2. Slope Percentage, Angle & Ratios
    const slopeDecimal = absRise / run;
    const slopePercentage = slopeDecimal * 100;
    const slopeAngleRad = Math.atan(slopeDecimal);
    const slopeAngleDeg = (slopeAngleRad * 180) / Math.PI;

    // Slope Ratio 1 : N (Run per 1 unit Rise)
    const ratioN = absRise > 0 ? run / absRise : 9999;
    const ratioString = absRise > 0 ? `1 : ${ratioN.toFixed(1)}` : '1 : ∞ (Flat)';

    // Pitch in Inches per Foot (Imperial) or mm per Meter (Metric)
    const pitchInchesPerFoot = slopeDecimal * 12;
    const pitchMmPerMeter = slopeDecimal * 1000;

    // Actual True Hypotenuse Slope Surface Distance
    const slopeSurfaceDistance = Math.sqrt(Math.pow(absRise, 2) + Math.pow(run, 2));

    // 3. Terrain Buildability & Grading Classification
    let suitabilityClass = '';
    let suitabilityBadge = '';
    let suitabilityDesc = '';
    let maxDrivewayCompliant = true;
    let adaCompliant = true;

    if (slopePercentage < 1.0) {
      suitabilityClass = 'Flat / Ponding Warning';
      suitabilityBadge = 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300';
      suitabilityDesc = 'Critically flat. High risk of stormwater ponding and foundation water seepage. Minimum 1.5–2.0% grading recommended away from footings.';
    } else if (slopePercentage <= 5.0) {
      suitabilityClass = 'Gentle / Ideal Buildability';
      suitabilityBadge = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300';
      suitabilityDesc = 'Optimal building grade. Easy vehicular access, positive gravity drainage, minimal foundation earthwork, and universal accessibility.';
    } else if (slopePercentage <= 10.0) {
      suitabilityClass = 'Moderate Slope';
      suitabilityBadge = 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      suitabilityDesc = 'Suitable for standard residential construction. May require minor stepped footings or shallow walk-out basements. Driveways are easily manageable.';
    } else if (slopePercentage <= 15.0) {
      suitabilityClass = 'Steep / Engineered Grading';
      suitabilityBadge = 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300';
      suitabilityDesc = 'Upper threshold for conventional residential driveways (max 12–15%). Requires cut/fill retaining walls, erosion control swales, and split-level floor plans.';
    } else if (slopePercentage <= 25.0) {
      suitabilityClass = 'Very Steep / Terraced Foundation';
      suitabilityBadge = 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300';
      suitabilityDesc = 'High earthwork and construction cost. Stepped retaining terraces, geotechnical slope stability analysis, and cantilevered decks required.';
      maxDrivewayCompliant = false;
    } else {
      suitabilityClass = 'Severe / Extreme Mountainous';
      suitabilityBadge = 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300';
      suitabilityDesc = 'Severe slope hazard. Restricted by many municipal building codes. Severe landslide risk; structural pile/caisson foundations strictly required.';
      maxDrivewayCompliant = false;
    }

    // Infrastructure Checks
    adaCompliant = slopePercentage <= 8.33 + 0.05; // 1:12
    const walkwayCompliant = slopePercentage <= 5.0 + 0.05; // 1:20
    const parkingLotCompliant = slopePercentage >= 1.0 && slopePercentage <= 5.0;

    // 4. Earthwork Cut & Fill Pad Estimator (Prismoidal Approximation for Building Pad)
    // Natural ground line across pad length
    const naturalElevationMid = (elevationStart + elevationEnd) / 2;
    const padArea = padWidth * padLength;

    // Wedge Cut & Fill Volume calculations
    const slopeOverPad = (slopePercentage / 100) * padLength;
    
    // Average cut depth and fill depth across the pad
    const naturalElevationAtStartOfPad = naturalElevationMid - (slopeOverPad / 2);
    const naturalElevationAtEndOfPad = naturalElevationMid + (slopeOverPad / 2);

    const hStart = padTargetElevation - naturalElevationAtStartOfPad; // >0 is fill, <0 is cut
    const hEnd = padTargetElevation - naturalElevationAtEndOfPad;

    let cutVolume = 0;
    let fillVolume = 0;

    if (hStart >= 0 && hEnd >= 0) {
      // Entire pad is in fill
      fillVolume = padArea * ((hStart + hEnd) / 2);
      cutVolume = 0;
    } else if (hStart <= 0 && hEnd <= 0) {
      // Entire pad is in cut
      cutVolume = padArea * ((Math.abs(hStart) + Math.abs(hEnd)) / 2);
      fillVolume = 0;
    } else {
      // Transition pad: part cut, part fill
      const zeroCrossRatio = Math.abs(hStart) / (Math.abs(hStart) + Math.abs(hEnd));
      if (hStart > 0) {
        fillVolume = padWidth * (zeroCrossRatio * padLength) * (hStart / 2);
        cutVolume = padWidth * ((1 - zeroCrossRatio) * padLength) * (Math.abs(hEnd) / 2);
      } else {
        cutVolume = padWidth * (zeroCrossRatio * padLength) * (Math.abs(hStart) / 2);
        fillVolume = padWidth * ((1 - zeroCrossRatio) * padLength) * (hEnd / 2);
      }
    }

    // Convert to Cubic Yards if Imperial (1 cu yd = 27 cu ft)
    const cutVolumeDisplay = unit === 'imperial' ? cutVolume / 27 : cutVolume;
    const fillVolumeDisplay = unit === 'imperial' ? fillVolume / 27 : fillVolume;
    const netEarthworkDelta = cutVolumeDisplay - fillVolumeDisplay;

    // 5. Multi-Segment Topo Summary
    const totalTopoRun = segments.reduce((sum, s) => sum + s.run, 0);
    const totalTopoRise = segments.reduce((sum, s) => sum + s.rise, 0);
    const averageTopoGrade = totalTopoRun > 0 ? (totalTopoRise / totalTopoRun) * 100 : 0;
    const maxSegmentSlope = Math.max(...segments.map((s) => (s.run > 0 ? (Math.abs(s.rise) / s.run) * 100 : 0)));

    return {
      rise,
      absRise,
      run,
      slopeDecimal,
      slopePercentage,
      slopeAngleRad,
      slopeAngleDeg,
      ratioN,
      ratioString,
      pitchInchesPerFoot,
      pitchMmPerMeter,
      slopeSurfaceDistance,
      suitabilityClass,
      suitabilityBadge,
      suitabilityDesc,
      maxDrivewayCompliant,
      adaCompliant,
      walkwayCompliant,
      parkingLotCompliant,
      padArea,
      cutVolumeDisplay,
      fillVolumeDisplay,
      netEarthworkDelta,
      totalTopoRun,
      totalTopoRise,
      averageTopoGrade,
      maxSegmentSlope
    };
  }, [elevationStart, elevationEnd, horizontalRun, padWidth, padLength, padTargetElevation, segments, unit]);

  // 5x5 Sensitivity Matrix: Elevation Rise vs Horizontal Run -> Slope %
  const sensitivityMatrix = useMemo(() => {
    const riseMultipliers = [0.5, 0.75, 1.0, 1.5, 2.0];
    const runMultipliers = [0.5, 0.75, 1.0, 1.25, 1.5];

    return riseMultipliers.map((rMult) => {
      const testRise = Math.round(results.absRise * rMult * 10) / 10;
      const cells = runMultipliers.map((runMult) => {
        const testRun = Math.round(results.run * runMult);
        const testSlopePct = testRun > 0 ? (testRise / testRun) * 100 : 0;
        const isBaseline = Math.abs(rMult - 1.0) < 0.05 && Math.abs(runMult - 1.0) < 0.05;
        return {
          testRun,
          testRise,
          testSlopePct,
          isBaseline
        };
      });
      return { testRise, cells };
    });
  }, [results.absRise, results.run]);

  // SVG Geometry for Interactive Elevation Profile Diagram
  const svgData = useMemo(() => {
    const width = 640;
    const height = 300;
    const padding = 45;
    const plotW = width - padding * 2;
    const plotH = height - padding * 2;

    const startX = padding + 20;
    const endX = padding + plotW - 20;
    
    // Normalized elevations
    const isUphill = results.rise >= 0;
    const visualSlopePct = Math.min(60, Math.max(2, results.slopePercentage));
    const deltaY = (visualSlopePct / 60) * (plotH * 0.7);

    const startY = isUphill ? padding + plotH - 30 : padding + 30 + deltaY;
    const endY = isUphill ? padding + plotH - 30 - deltaY : padding + 30;

    return {
      width,
      height,
      padding,
      plotW,
      plotH,
      startX,
      endX,
      startY,
      endY,
      isUphill
    };
  }, [results.rise, results.slopePercentage]);

  const copyReport = () => {
    const text = `Site Slope & Terrain Grading Engineering Report
===================================================
TERRAIN & ELEVATION SPECIFICATIONS:
- Station A (Start) Elevation: ${elevationStart.toFixed(2)} ${linearUnit}
- Station B (End) Elevation: ${elevationEnd.toFixed(2)} ${linearUnit}
- Elevation Rise (ΔZ): ${results.rise > 0 ? '+' : ''}${results.rise.toFixed(2)} ${linearUnit}
- Horizontal Run (D): ${results.run.toFixed(2)} ${linearUnit}
- True Slope Hypotenuse Distance: ${results.slopeSurfaceDistance.toFixed(2)} ${linearUnit}

CALCULATED SLOPE GRADIENTS:
- Slope Percentage: ${results.slopePercentage.toFixed(2)}%
- Slope Angle (θ): ${results.slopeAngleDeg.toFixed(2)}°
- Slope Ratio: ${results.ratioString}
- Slope Pitch: ${results.pitchInchesPerFoot.toFixed(2)} in/ft (${results.pitchMmPerMeter.toFixed(1)} mm/m)

BUILDING CODE & SITE SUITABILITY:
- Terrain Classification: ${results.suitabilityClass}
- ADA Ramp Compliant (Max 1:12 / 8.33%): ${results.adaCompliant ? 'YES' : 'NO (Exceeds Limit)'}
- Walkway Compliant (Max 1:20 / 5.0%): ${results.walkwayCompliant ? 'YES' : 'NO'}
- Vehicle Driveway Max Limit (15%): ${results.maxDrivewayCompliant ? 'COMPLIANT' : 'TOO STEEP'}

EARTHWORK CUT & FILL ESTIMATION (Pad ${padWidth}×${padLength} ${linearUnit}):
- Estimated Cut Volume: ${results.cutVolumeDisplay.toFixed(1)} ${volumeUnit}
- Estimated Fill Volume: ${results.fillVolumeDisplay.toFixed(1)} ${volumeUnit}
- Net Earthwork Balance: ${results.netEarthworkDelta > 0 ? '+' : ''}${results.netEarthworkDelta.toFixed(1)} ${volumeUnit} (${results.netEarthworkDelta > 0 ? 'Surplus Soil Cut' : 'Borrow Fill Needed'})`;

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
              <Mountain className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Site Slope & Terrain Grading Suite
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Calculate elevation rise/run percentages, slope angles (degrees/pitch), ADA/driveway code compliance, and earthwork cut/fill volume.
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setUnit('imperial')}
              className={`px-3 py-1 rounded-lg transition-all ${
                unit === 'imperial'
                  ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Feet / Inches (Imperial)
            </button>
            <button
              onClick={() => setUnit('metric')}
              className={`px-3 py-1 rounded-lg transition-all ${
                unit === 'metric'
                  ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Meters (Metric)
            </button>
          </div>

          <button
            onClick={copyReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Report'}</span>
          </button>

          <button
            onClick={handleReset}
            className="p-2 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
            title="Reset to default preset"
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
            Topographical & Grading Presets
          </span>
          <span className="text-xs text-zinc-400">Load terrain scenario</span>
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
          onClick={() => setMode('elevation_points')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
            mode === 'elevation_points'
              ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Mountain className="w-3.5 h-3.5" />
          <span className="truncate">Elevation Points (Z₁-Z₂)</span>
        </button>

        <button
          onClick={() => setMode('rise_run')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
            mode === 'rise_run'
              ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span className="truncate">Rise & Run Direct</span>
        </button>

        <button
          onClick={() => setMode('grading_suitability')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
            mode === 'grading_suitability'
              ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span className="truncate">Terrain Suitability</span>
        </button>

        <button
          onClick={() => setMode('earthwork_cut_fill')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
            mode === 'earthwork_cut_fill'
              ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Shovel className="w-3.5 h-3.5" />
          <span className="truncate">Cut & Fill Earthwork</span>
        </button>

        <button
          onClick={() => setMode('infrastructure_compliance')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
            mode === 'infrastructure_compliance'
              ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Accessibility className="w-3.5 h-3.5" />
          <span className="truncate">ADA / Road Compliance</span>
        </button>

        <button
          onClick={() => setMode('topo_transect')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
            mode === 'topo_transect'
              ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span className="truncate">Multi-Segment Transect</span>
        </button>
      </div>

      {/* Main Grid: Control Inputs (5 cols) + Hero Card (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Inputs (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-emerald-500" />
                Topographical Parameters ({linearUnit})
              </span>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline font-medium"
              >
                {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
                {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Mode-Specific Input Controls */}
            {mode === 'topo_transect' ? (
              // Multi-Segment Transect Editor
              <div className="space-y-3">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                  Site Cross-Section Profile Segments
                </span>
                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                  {segments.map((seg, idx) => (
                    <div key={seg.id} className="p-2.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs space-y-1.5">
                      <div className="font-bold text-zinc-800 dark:text-zinc-200">
                        {idx + 1}. {seg.name}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-zinc-500">Run ({linearUnit})</label>
                          <input
                            type="number"
                            value={seg.run}
                            onChange={(e) => {
                              const val = Math.max(1, parseFloat(e.target.value) || 0);
                              setSegments(segments.map((s) => (s.id === seg.id ? { ...s, run: val } : s)));
                            }}
                            className="w-full px-2 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-zinc-500">Rise (ΔZ) ({linearUnit})</label>
                          <input
                            type="number"
                            value={seg.rise}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setSegments(segments.map((s) => (s.id === seg.id ? { ...s, rise: val } : s)));
                            }}
                            className="w-full px-2 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : mode === 'earthwork_cut_fill' ? (
              // Earthwork Cut & Fill Pad Parameters
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Start Elevation Z₁ ({linearUnit})
                    </label>
                    <input
                      type="number"
                      value={elevationStart}
                      onChange={(e) => setElevationStart(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      End Elevation Z₂ ({linearUnit})
                    </label>
                    <input
                      type="number"
                      value={elevationEnd}
                      onChange={(e) => setElevationEnd(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Horizontal Distance / Run ({linearUnit})
                  </label>
                  <input
                    type="number"
                    value={horizontalRun}
                    onChange={(e) => setHorizontalRun(Math.max(1, parseFloat(e.target.value) || 1))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-mono"
                  />
                </div>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Graded Building Pad Dimensions
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-zinc-500">Pad Width ({linearUnit})</label>
                      <input
                        type="number"
                        value={padWidth}
                        onChange={(e) => setPadWidth(Math.max(1, parseFloat(e.target.value) || 1))}
                        className="w-full px-2 py-1 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-500">Pad Length ({linearUnit})</label>
                      <input
                        type="number"
                        value={padLength}
                        onChange={(e) => setPadLength(Math.max(1, parseFloat(e.target.value) || 1))}
                        className="w-full px-2 py-1 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500">Target Finished Pad Elevation ({linearUnit})</label>
                    <input
                      type="number"
                      value={padTargetElevation}
                      onChange={(e) => setPadTargetElevation(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            ) : (
              // Standard Elevation Points & Rise/Run Inputs
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Elevation Z₁ (Start) ({linearUnit})
                    </label>
                    <input
                      type="number"
                      value={elevationStart}
                      onChange={(e) => setElevationStart(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-mono text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Elevation Z₂ (End) ({linearUnit})
                    </label>
                    <input
                      type="number"
                      value={elevationEnd}
                      onChange={(e) => setElevationEnd(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-mono text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Horizontal Distance / Run ({linearUnit})
                    </label>
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      Rise: {results.rise > 0 ? '+' : ''}{results.rise.toFixed(2)} {linearUnit}
                    </span>
                  </div>
                  <input
                    type="number"
                    value={horizontalRun}
                    onChange={(e) => setHorizontalRun(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-mono text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Target Slope Sizer Shortcut */}
                {showAdvanced && (
                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Target Slope Gradient Sizer (% or Ratio)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.5"
                        value={targetSlopePct}
                        onChange={(e) => {
                          const target = Math.max(0.1, parseFloat(e.target.value) || 0.1);
                          setTargetSlopePct(target);
                          // Auto calculate required end elevation for this target slope
                          const reqRise = (target / 100) * horizontalRun;
                          setElevationEnd(elevationStart + reqRise);
                        }}
                        className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono"
                      />
                      <span className="text-xs text-zinc-500 whitespace-nowrap">% Target</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Hero Card & Slope Analysis (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Hero Card */}
          <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-emerald-800/30">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs uppercase font-bold tracking-widest text-emerald-300 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Site Slope Grade (Rise / Run)
                </span>
                <div className="text-4xl sm:text-5xl font-black font-mono my-2 tracking-tight text-white flex items-baseline gap-2">
                  <span>{results.slopePercentage.toFixed(2)}%</span>
                  <span className="text-sm font-normal text-emerald-200">({results.slopeAngleDeg.toFixed(2)}°)</span>
                </div>
              </div>

              <div className="text-right">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${results.suitabilityBadge}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {results.suitabilityClass}
                </span>
                <p className="text-[11px] font-mono text-emerald-200 mt-1">
                  Ratio: {results.ratioString}
                </p>
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 mt-4 border-t border-white/10 text-xs">
              <div className="bg-white/5 rounded-xl p-2.5 backdrop-blur-xs">
                <span className="text-emerald-300 block text-[10px] font-medium uppercase">Elevation Rise (ΔZ)</span>
                <span className="text-base font-bold font-mono text-white mt-0.5 block">
                  {results.rise > 0 ? '+' : ''}{results.rise.toFixed(2)} {linearUnit}
                </span>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5 backdrop-blur-xs">
                <span className="text-emerald-300 block text-[10px] font-medium uppercase">Horizontal Run</span>
                <span className="text-base font-bold font-mono text-white mt-0.5 block">
                  {results.run.toFixed(2)} {linearUnit}
                </span>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5 backdrop-blur-xs">
                <span className="text-emerald-300 block text-[10px] font-medium uppercase">Slope Distance</span>
                <span className="text-base font-bold font-mono text-white mt-0.5 block">
                  {results.slopeSurfaceDistance.toFixed(2)} {linearUnit}
                </span>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5 backdrop-blur-xs">
                <span className="text-emerald-300 block text-[10px] font-medium uppercase">Pitch (in/ft)</span>
                <span className="text-base font-bold font-mono text-white mt-0.5 block">
                  {results.pitchInchesPerFoot.toFixed(2)} in/ft
                </span>
              </div>
            </div>
          </div>

          {/* Compliance & Suitability Badge Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3.5 shadow-xs flex items-center gap-3">
              <div className={`p-2 rounded-xl shrink-0 ${results.adaCompliant ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'}`}>
                <Accessibility className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <span className="text-zinc-500 font-medium block">ADA Ramp (1:12)</span>
                <span className="font-bold font-mono text-zinc-900 dark:text-zinc-100">
                  {results.adaCompliant ? 'Compliant (≤8.3%)' : 'Exceeds ADA Max'}
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3.5 shadow-xs flex items-center gap-3">
              <div className={`p-2 rounded-xl shrink-0 ${results.walkwayCompliant ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'}`}>
                <Activity className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <span className="text-zinc-500 font-medium block">Walkway (1:20)</span>
                <span className="font-bold font-mono text-zinc-900 dark:text-zinc-100">
                  {results.walkwayCompliant ? 'Pedestrian Safe (≤5%)' : 'Steep for Pedestrians'}
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3.5 shadow-xs flex items-center gap-3">
              <div className={`p-2 rounded-xl shrink-0 ${results.maxDrivewayCompliant ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'}`}>
                <Car className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <span className="text-zinc-500 font-medium block">Driveway (15% Max)</span>
                <span className="font-bold font-mono text-zinc-900 dark:text-zinc-100">
                  {results.maxDrivewayCompliant ? 'Vehicle Traction OK' : 'Exceeds 15% Max'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SVG Interactive Elevation Cross-Section Diagram */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              Dynamic 2D Terrain Elevation Profile & Drainage Vector
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Cross-section visualization showing elevation stations, vertical rise ΔZ, horizontal run D, and slope surface angle.
            </p>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-600" />
              <span className="text-zinc-600 dark:text-zinc-300 font-semibold">Terrain Surface Line</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded border border-dashed border-zinc-400 bg-zinc-200 dark:bg-zinc-800" />
              <span className="text-zinc-600 dark:text-zinc-300 font-semibold">Datum Baseline</span>
            </div>
          </div>
        </div>

        <div className="relative w-full overflow-x-auto bg-zinc-50/50 dark:bg-zinc-950/50 rounded-xl p-3 border border-zinc-100 dark:border-zinc-800">
          <svg
            viewBox={`0 0 ${svgData.width} ${svgData.height}`}
            className="w-full h-auto max-h-[340px] font-sans select-none"
          >
            {/* Ground Polygon under Slope */}
            <polygon
              points={`${svgData.startX},${svgData.startY} ${svgData.endX},${svgData.endY} ${svgData.endX},${svgData.padding + svgData.plotH} ${svgData.startX},${svgData.padding + svgData.plotH}`}
              className="fill-emerald-500/15 stroke-none"
            />

            {/* Horizontal Datum Baseline (Run) */}
            <line
              x1={svgData.startX}
              y1={svgData.startY}
              x2={svgData.endX}
              y2={svgData.startY}
              className="stroke-zinc-400 dark:stroke-zinc-600 stroke-dasharray-4"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <text
              x={(svgData.startX + svgData.endX) / 2}
              y={svgData.startY + 16}
              textAnchor="middle"
              className="text-[10px] font-mono fill-zinc-500 font-bold"
            >
              Horizontal Run: {results.run.toFixed(1)} {linearUnit}
            </text>

            {/* Vertical Rise Line (ΔZ) */}
            <line
              x1={svgData.endX}
              y1={svgData.startY}
              x2={svgData.endX}
              y2={svgData.endY}
              className="stroke-indigo-500"
              strokeWidth="2"
            />
            <text
              x={svgData.endX + 8}
              y={(svgData.startY + svgData.endY) / 2}
              textAnchor="start"
              className="text-[10px] font-mono fill-indigo-600 dark:fill-indigo-400 font-bold"
            >
              Rise ΔZ: {results.rise > 0 ? '+' : ''}{results.rise.toFixed(2)} {linearUnit}
            </text>

            {/* Main Slope Hypotenuse Line */}
            <line
              x1={svgData.startX}
              y1={svgData.startY}
              x2={svgData.endX}
              y2={svgData.endY}
              className="stroke-emerald-600 dark:stroke-emerald-400 shadow-md"
              strokeWidth="3.5"
            />

            {/* Station A (Start) Point */}
            <circle
              cx={svgData.startX}
              cy={svgData.startY}
              r="5"
              className="fill-emerald-600 stroke-white dark:stroke-zinc-900"
              strokeWidth="2"
            />
            <text
              x={svgData.startX}
              y={svgData.startY - 12}
              textAnchor="middle"
              className="text-[11px] font-bold fill-zinc-800 dark:fill-zinc-200"
            >
              Station A: {elevationStart.toFixed(1)} {linearUnit}
            </text>

            {/* Station B (End) Point */}
            <circle
              cx={svgData.endX}
              cy={svgData.endY}
              r="5"
              className="fill-indigo-600 stroke-white dark:stroke-zinc-900"
              strokeWidth="2"
            />
            <text
              x={svgData.endX}
              y={svgData.endY - 12}
              textAnchor="middle"
              className="text-[11px] font-bold fill-zinc-800 dark:fill-zinc-200"
            >
              Station B: {elevationEnd.toFixed(1)} {linearUnit}
            </text>

            {/* Surface Distance Label */}
            <text
              x={(svgData.startX + svgData.endX) / 2}
              y={(svgData.startY + svgData.endY) / 2 - 14}
              textAnchor="middle"
              className="text-[11px] font-mono font-black fill-emerald-800 dark:fill-emerald-300"
            >
              Slope: {results.slopePercentage.toFixed(1)}% ({results.slopeAngleDeg.toFixed(1)}°) | Hypotenuse: {results.slopeSurfaceDistance.toFixed(1)} {linearUnit}
            </text>
          </svg>
        </div>
      </div>

      {/* Earthwork Cut/Fill & 5x5 Sensitivity Matrix Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Earthwork Cut & Fill Volumetric Balance */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Shovel className="w-3.5 h-3.5 text-amber-500" />
                Earthwork Cut & Fill Grading Volume (Pad {padWidth}×{padLength} {linearUnit})
              </h4>
              <p className="text-[11px] text-zinc-500">
                Prismoidal soil volume required to terrace natural slope to finished grade.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800 space-y-1">
              <span className="text-[10px] text-amber-800 dark:text-amber-300 uppercase font-bold block">Excavation Cut Volume</span>
              <span className="text-lg font-black font-mono text-amber-700 dark:text-amber-300 block">
                {results.cutVolumeDisplay.toFixed(1)} {volumeUnit}
              </span>
              <span className="text-[10px] text-zinc-500">Earth to be excavated</span>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800 space-y-1">
              <span className="text-[10px] text-blue-800 dark:text-blue-300 uppercase font-bold block">Embankment Fill Volume</span>
              <span className="text-lg font-black font-mono text-blue-700 dark:text-blue-300 block">
                {results.fillVolumeDisplay.toFixed(1)} {volumeUnit}
              </span>
              <span className="text-[10px] text-zinc-500">Compacted fill required</span>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-1 col-span-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-zinc-600 dark:text-zinc-400 uppercase font-bold">
                  Net Mass Haul Earth Balance (Cut - Fill)
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  Math.abs(results.netEarthworkDelta) < 10 
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' 
                    : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200'
                }`}>
                  {Math.abs(results.netEarthworkDelta) < 10 ? 'Balanced Earthwork' : results.netEarthworkDelta > 0 ? 'Surplus Soil Export' : 'Import Fill Required'}
                </span>
              </div>
              <div className="text-xl font-black font-mono text-zinc-900 dark:text-zinc-100">
                {results.netEarthworkDelta > 0 ? '+' : ''}{results.netEarthworkDelta.toFixed(1)} {volumeUnit}
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: 5x5 Sensitivity Matrix */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-emerald-500" />
                5×5 Sensitivity Matrix: Rise (ΔZ) vs Run (D)
              </h4>
              <p className="text-[11px] text-zinc-500">
                Resulting slope gradient percentages across variations in horizontal run & vertical rise.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  <th className="p-2 text-left border border-zinc-200 dark:border-zinc-700 font-semibold">
                    Rise \ Run
                  </th>
                  {sensitivityMatrix[0]?.cells.map((c, i) => (
                    <th key={i} className="p-2 border border-zinc-200 dark:border-zinc-700 font-mono">
                      {c.testRun} {linearUnit}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sensitivityMatrix.map((row) => (
                  <tr key={row.testRise} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                    <td className="p-2 text-left font-bold font-mono border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 text-zinc-800 dark:text-zinc-200">
                      {row.testRise} {linearUnit}
                    </td>
                    {row.cells.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className={`p-2 border border-zinc-200 dark:border-zinc-700 font-mono ${
                          cell.isBaseline
                            ? 'bg-emerald-100 dark:bg-emerald-900/60 font-black text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500'
                            : cell.testSlopePct <= 8.33
                            ? 'text-emerald-700 dark:text-emerald-300'
                            : cell.testSlopePct <= 15.0
                            ? 'text-amber-700 dark:text-amber-300'
                            : 'text-rose-600 dark:text-rose-400 font-semibold bg-rose-50/40 dark:bg-rose-950/20'
                        }`}
                      >
                        <div className="font-bold">{cell.testSlopePct.toFixed(1)}%</div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* LaTeX Formal Mathematical Formulations */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Formal Terrain Grading & Slope Trigonometric Formulations
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Rigorous civil surveying formulations formatted in LaTeX. Click any equation block to copy.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Proof 1: Slope Percentage */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2 relative group">
            <div className="flex justify-between items-center">
              <span className="font-bold text-zinc-800 dark:text-zinc-200">1. Slope Percentage & Grade</span>
              <button
                onClick={() => copyToClipboard('\text{Slope \%} = \left( \frac{\Delta Z}{D_{\text{horiz}}} \right) \times 100\%', 'slope_pct_proof')}
                className="text-zinc-400 hover:text-emerald-600 transition-colors"
                title="Copy LaTeX"
              >
                {copiedFormula === 'slope_pct_proof' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-zinc-400" />}
              </button>
            </div>
            <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border font-mono text-[11px] text-emerald-900 dark:text-emerald-300 overflow-x-auto">
              {"\text{Slope \%} = \left( \frac{Z_2 - Z_1}{D_{\text{run}}} \right) \times 100\%"}
              <br />
              {"\text{Ratio} = 1 : N \quad \text{where } N = \frac{D_{\text{run}}}{\Delta Z}"}
            </div>
            <p className="text-[11px] text-zinc-500">
              Standard civil gradient formula expressing vertical elevation change per 100 units of horizontal run.
            </p>
          </div>

          {/* Proof 2: Slope Angle & Trigonometry */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2 relative group">
            <div className="flex justify-between items-center">
              <span className="font-bold text-zinc-800 dark:text-zinc-200">2. Slope Angle (θ) & Surface Distance</span>
              <button
                onClick={() => copyToClipboard('\theta = \arctan\left(\frac{\Delta Z}{D}\right), \quad L_{\text{slope}} = \sqrt{\Delta Z^2 + D^2}', 'trig_proof')}
                className="text-zinc-400 hover:text-emerald-600 transition-colors"
                title="Copy LaTeX"
              >
                {copiedFormula === 'trig_proof' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-zinc-400" />}
              </button>
            </div>
            <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border font-mono text-[11px] text-emerald-900 dark:text-emerald-300 overflow-x-auto">
              {"\theta = \arctan\left( \frac{\text{Rise}}{\text{Run}} \right) \times \frac{180^\circ}{\pi}"}
              <br />
              {"L_{\text{hypotenuse}} = \sqrt{(\Delta Z)^2 + (D_{\text{run}})^2}"}
            </div>
            <p className="text-[11px] text-zinc-500">
              Computes true terrain surface length and inclinometer angular inclination.
            </p>
          </div>

          {/* Proof 3: Earthwork Wedge Volume */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2 relative group">
            <div className="flex justify-between items-center">
              <span className="font-bold text-zinc-800 dark:text-zinc-200">3. Prismoidal Earthwork Cut/Fill</span>
              <button
                onClick={() => copyToClipboard('V_{\text{wedge}} = \frac{1}{2} \cdot W_{\text{pad}} \cdot L_{\text{cut/fill}} \cdot h_{\text{max}}', 'cutfill_proof')}
                className="text-zinc-400 hover:text-emerald-600 transition-colors"
                title="Copy LaTeX"
              >
                {copiedFormula === 'cutfill_proof' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-zinc-400" />}
              </button>
            </div>
            <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border font-mono text-[11px] text-emerald-900 dark:text-emerald-300 overflow-x-auto">
              {"V_{\text{cut}} = \frac{1}{2} \cdot W_{\text{pad}} \cdot L_{\text{cut}} \cdot \Delta h_{\text{cut}}"}
              <br />
              {"V_{\text{fill}} = \frac{1}{2} \cdot W_{\text{pad}} \cdot L_{\text{fill}} \cdot \Delta h_{\text{fill}}"}
            </div>
            <p className="text-[11px] text-zinc-500">
              Calculates excavation and embankment volume for leveling sloped parcels into building pads.
            </p>
          </div>

          {/* Proof 4: Pitch & Slope Gradient Units */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2 relative group">
            <div className="flex justify-between items-center">
              <span className="font-bold text-zinc-800 dark:text-zinc-200">4. Slope Pitch & Gradient Units</span>
              <button
                onClick={() => copyToClipboard('\text{Pitch (in/ft)} = \text{Slope Decimal} \times 12', 'pitch_proof')}
                className="text-zinc-400 hover:text-emerald-600 transition-colors"
                title="Copy LaTeX"
              >
                {copiedFormula === 'pitch_proof' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-zinc-400" />}
              </button>
            </div>
            <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border font-mono text-[11px] text-emerald-900 dark:text-emerald-300 overflow-x-auto">
              {"\text{Pitch (in/ft)} = \left( \frac{\text{Rise}}{\text{Run}} \right) \times 12"}
              <br />
              {"\text{Gradient (mm/m)} = \text{Slope \%} \times 10"}
            </div>
            <p className="text-[11px] text-zinc-500">
              Converts civil engineering slope percentages into architectural pitch and drainage slope units.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

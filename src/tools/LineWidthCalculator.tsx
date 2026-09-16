import { useState, useMemo } from 'react';
import { 
  Printer, Copy, Check, Download, Sparkles, Sliders, Boxes
} from 'lucide-react';
import { jsPDF } from 'jspdf';

// --- Preset Definitions ---
interface NozzlePreset {
  diameter: number;
  label: string;
  desc: string;
}

const NOZZLE_PRESETS: NozzlePreset[] = [
  { diameter: 0.2, label: '0.2 mm', desc: 'Ultra-Fine Miniatures & High Detail' },
  { diameter: 0.4, label: '0.4 mm', desc: 'Standard Universal All-Rounder' },
  { diameter: 0.6, label: '0.6 mm', desc: 'Strength & Speed Optimization' },
  { diameter: 0.8, label: '0.8 mm', desc: 'Heavy Structural & Rapid Enclosures' },
  { diameter: 1.0, label: '1.0 mm', desc: 'Volcano High-Flow Large Format' },
  { diameter: 1.2, label: '1.2 mm', desc: 'Super Volcano & Industrial Jigs' }
];

interface LayerHeightPreset {
  height: number;
  label: string;
}

const LAYER_HEIGHT_PRESETS: LayerHeightPreset[] = [
  { height: 0.12, label: '0.12 mm (Fine)' },
  { height: 0.16, label: '0.16 mm (Optimal)' },
  { height: 0.20, label: '0.20 mm (Standard)' },
  { height: 0.24, label: '0.24 mm (Speed)' },
  { height: 0.28, label: '0.28 mm (Draft)' },
  { height: 0.32, label: '0.32 mm (Rough)' }
];

interface MaterialPreset {
  id: string;
  name: string;
  widthMultiplier: number;
  flowLimitMm3s: number;
  notes: string;
}

const MATERIAL_PRESETS: MaterialPreset[] = [
  { id: 'pla', name: 'PLA / PLA+', widthMultiplier: 1.125, flowLimitMm3s: 18, notes: 'Standard 112.5% ratio gives crisp corners and excellent layer bonding.' },
  { id: 'petg', name: 'PETG', widthMultiplier: 1.15, flowLimitMm3s: 15, notes: 'Slightly wider bead improves translucency and interlayer bonding without stringing.' },
  { id: 'abs_asa', name: 'ABS / ASA', widthMultiplier: 1.18, flowLimitMm3s: 17, notes: 'Higher squish reduces delamination and internal shear stress in enclosures.' },
  { id: 'tpu', name: 'TPU / Flex (95A)', widthMultiplier: 1.08, flowLimitMm3s: 6, notes: 'Tighter line width avoids backpressure buckling in direct-drive extruders.' },
  { id: 'pa_cf', name: 'PA-CF / Nylon CF', widthMultiplier: 1.20, flowLimitMm3s: 20, notes: 'Wider bead aligns chopped carbon fibers horizontally for peak tensile strength.' },
  { id: 'pc', name: 'Polycarbonate (PC)', widthMultiplier: 1.22, flowLimitMm3s: 16, notes: 'Deep squish maximizes interlayer fusion for extreme thermal and mechanical loads.' }
];

interface ProfileGoal {
  id: string;
  name: string;
  desc: string;
  factor: number;
}

const PROFILE_GOALS: ProfileGoal[] = [
  { id: 'standard', name: 'Standard Balanced', desc: 'Clean aesthetics with strong structural layer cohesion', factor: 1.125 },
  { id: 'strength', name: 'Maximum Layer Bonding & Strength', desc: 'Maximum inter-layer squish for structural functional parts', factor: 1.25 },
  { id: 'aesthetic', name: 'High Precision & Sharp Corners', desc: 'Minimal die swell for tight tolerance mechanical assemblies', factor: 1.02 },
  { id: 'speed', name: 'High Speed Draft', desc: 'Wide volumetric beads to cut print time by 30-40%', factor: 1.35 },
  { id: 'watertight', name: 'Watertight & Airtight Vesseling', desc: 'Heavy bead overlap to prevent fluid micro-leaks', factor: 1.28 }
];

export default function LineWidthCalculator() {
  // --- Core Inputs ---
  const [nozzleDiameter, setNozzleDiameter] = useState<number>(0.4);
  const [layerHeight, setLayerHeight] = useState<number>(0.20);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('pla');
  const [selectedGoal, setSelectedGoal] = useState<string>('standard');
  const [hotendFlowLimit, setHotendFlowLimit] = useState<number>(18); // mm^3/s
  const [printSpeed, setPrintSpeed] = useState<number>(150); // mm/s

  // Thin wall calculator input
  const [targetWallThickness, setTargetWallThickness] = useState<number>(1.6); // mm

  // UI States
  const [activeTab, setActiveTab] = useState<'slicer' | 'bead' | 'thinwall' | 'gcode'>('slicer');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Current material object
  const currentMaterial = useMemo(() => {
    return MATERIAL_PRESETS.find(m => m.id === selectedMaterial) || MATERIAL_PRESETS[0];
  }, [selectedMaterial]);

  const currentGoal = useMemo(() => {
    return PROFILE_GOALS.find(g => g.id === selectedGoal) || PROFILE_GOALS[0];
  }, [selectedGoal]);

  // --- Mathematical Extrusion Engine ---
  const calculations = useMemo(() => {
    const nd = nozzleDiameter;
    const lh = layerHeight;
    const goalMult = currentGoal.factor;

    // Line widths for various slicer features
    const defaultWidth = nd * goalMult;
    const firstLayerWidth = nd * 1.25; // 125% for maximum bed adhesion squish
    const outerPerimeterWidth = nd * 1.02; // Fine detail, zero ringing
    const innerPerimeterWidth = nd * Math.min(1.30, goalMult * 1.05); // Strong structural walls
    const topSolidInfillWidth = nd * 1.00; // Perfect ironing / flat top layer
    const bottomSolidInfillWidth = nd * 1.15; // Solid floor
    const sparseInfillWidth = nd * Math.min(1.45, goalMult * 1.15); // Fast deposition
    const supportWidth = nd * 0.95; // Easy breakaway
    const bridgeWidth = nd * 1.00; // Unconstrained cooling

    // Bead Geometry Cross-Sectional Area (stadium / oval formula used by modern slicers)
    // Area = (w - h) * h + pi * (h/2)^2 = h * (w - 0.2146 * h)
    const computeBeadArea = (w: number) => {
      return lh * (w - (1 - Math.PI / 4) * lh);
    };

    const defaultArea = computeBeadArea(defaultWidth);
    const defaultAspect = defaultWidth / lh; // w/h ratio
    const contactWidth = Math.max(0, defaultWidth - lh); // flat contact line with previous layer

    // Volumetric Flow Rates at target print speed
    const defaultFlowRate = defaultArea * printSpeed;
    const maxSafeSpeed = defaultArea > 0 ? hotendFlowLimit / defaultArea : 0;
    const flowUtilization = hotendFlowLimit > 0 ? (defaultFlowRate / hotendFlowLimit) * 100 : 0;

    // Squish Health Assessment
    let squishStatus = 'Optimal Squish';
    let squishColor = 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (defaultAspect < 1.6) {
      squishStatus = 'Under-Squished (Round Bead - Poor Adhesion)';
      squishColor = 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20';
    } else if (defaultAspect > 4.2) {
      squishStatus = 'Severe Over-Squish (High Backpressure / Curling)';
      squishColor = 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20';
    } else if (defaultAspect >= 2.0 && defaultAspect <= 3.2) {
      squishStatus = 'Peak Mechanical Bond (2.0 - 3.2 Aspect Ratio)';
      squishColor = 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    }

    // Thin Wall Optimizer
    const rawPerimeters = targetWallThickness / defaultWidth;
    const integerPerimeters = Math.max(1, Math.round(rawPerimeters));
    const tunedLineWidth = targetWallThickness / integerPerimeters;
    const tunedBeadArea = computeBeadArea(tunedLineWidth);
    const gapFillVoid = targetWallThickness - (integerPerimeters * defaultWidth);

    return {
      defaultWidth: Number(defaultWidth.toFixed(3)),
      firstLayerWidth: Number(firstLayerWidth.toFixed(3)),
      outerPerimeterWidth: Number(outerPerimeterWidth.toFixed(3)),
      innerPerimeterWidth: Number(innerPerimeterWidth.toFixed(3)),
      topSolidInfillWidth: Number(topSolidInfillWidth.toFixed(3)),
      bottomSolidInfillWidth: Number(bottomSolidInfillWidth.toFixed(3)),
      sparseInfillWidth: Number(sparseInfillWidth.toFixed(3)),
      supportWidth: Number(supportWidth.toFixed(3)),
      bridgeWidth: Number(bridgeWidth.toFixed(3)),
      defaultArea: Number(defaultArea.toFixed(4)),
      defaultAspect: Number(defaultAspect.toFixed(2)),
      contactWidth: Number(contactWidth.toFixed(3)),
      defaultFlowRate: Number(defaultFlowRate.toFixed(1)),
      maxSafeSpeed: Number(maxSafeSpeed.toFixed(0)),
      flowUtilization: Number(flowUtilization.toFixed(1)),
      squishStatus,
      squishColor,
      integerPerimeters,
      tunedLineWidth: Number(tunedLineWidth.toFixed(3)),
      tunedBeadArea: Number(tunedBeadArea.toFixed(4)),
      gapFillVoid: Number(gapFillVoid.toFixed(3))
    };
  }, [nozzleDiameter, layerHeight, currentGoal, hotendFlowLimit, printSpeed, targetWallThickness]);

  // Copy helper
  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Export Bambu Studio / OrcaSlicer Configuration String
  const getOrcaConfigText = () => {
    return `# ----------------------------------------------------
# OrcaSlicer / Bambu Studio Extrusion Line Widths
# Nozzle: ${nozzleDiameter}mm | Layer Height: ${layerHeight}mm | Profile: ${currentGoal.name}
# ----------------------------------------------------
default_line_width = ${calculations.defaultWidth}
first_layer_line_width = ${calculations.firstLayerWidth}
outer_wall_line_width = ${calculations.outerPerimeterWidth}
inner_wall_line_width = ${calculations.innerPerimeterWidth}
top_surface_line_width = ${calculations.topSolidInfillWidth}
sparse_infill_line_width = ${calculations.sparseInfillWidth}
support_line_width = ${calculations.supportWidth}
internal_solid_infill_line_width = ${calculations.bottomSolidInfillWidth}
# Hotend Flow Limit: ${hotendFlowLimit} mm3/s -> Max Speed: ${calculations.maxSafeSpeed} mm/s`;
  };

  // Export PDF Calibration Certificate
  const exportPDF = () => {
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const c = calculations;

      // Header Banner
      doc.setFillColor(30, 41, 59);
      doc.rect(0, 0, 210, 28, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('3D PRINT LINE WIDTH & EXTRUSION CALIBRATION', 14, 12);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Nozzle: ${nozzleDiameter}mm | Layer Height: ${layerHeight}mm | Material: ${currentMaterial.name}`, 14, 18);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} | Toolique.in`, 14, 23);

      // Section 1: KPI Cards
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, 34, 182, 38, 3, 3, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, 34, 182, 38, 3, 3, 'S');

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('RECOMMENDED DEFAULT WIDTH', 20, 42);
      doc.setFontSize(16);
      doc.setTextColor(79, 70, 229);
      doc.text(`${c.defaultWidth} mm`, 20, 50);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`Ratio: ${(c.defaultWidth / nozzleDiameter * 100).toFixed(0)}% of Nozzle`, 20, 56);

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('BEAD ASPECT RATIO (W/H)', 85, 42);
      doc.setFontSize(14);
      doc.setTextColor(16, 185, 129);
      doc.text(`${c.defaultAspect} : 1`, 85, 50);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(c.squishStatus.split('(')[0], 85, 56);

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('MAX SPEED (AT FLOW LIMIT)', 145, 42);
      doc.setFontSize(14);
      doc.setTextColor(245, 158, 11);
      doc.text(`${c.maxSafeSpeed} mm/s`, 145, 50);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`Flow: ${hotendFlowLimit} mm3/s Max`, 145, 56);

      // Section 2: Complete Slicer Feature Table
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('1. Complete Slicer Line Width Specifications', 14, 82);

      let startY = 88;
      doc.setFillColor(241, 245, 249);
      doc.rect(14, startY, 182, 7, 'F');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text('SLICER FEATURE', 18, startY + 5);
      doc.text('LINE WIDTH', 75, startY + 5);
      doc.text('% OF NOZZLE', 115, startY + 5);
      doc.text('PRIMARY ENGINEERING PURPOSE', 145, startY + 5);

      startY += 8;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);

      const rows = [
        ['Default Line Width', `${c.defaultWidth} mm`, `${(c.defaultWidth/nozzleDiameter*100).toFixed(0)}%`, 'General baseline extrusion'],
        ['First Layer (Bed Adhesion)', `${c.firstLayerWidth} mm`, `${(c.firstLayerWidth/nozzleDiameter*100).toFixed(0)}%`, 'Max bed contact area & squish'],
        ['Outer / External Wall', `${c.outerPerimeterWidth} mm`, `${(c.outerPerimeterWidth/nozzleDiameter*100).toFixed(0)}%`, 'Dimensional precision & surface'],
        ['Inner / Structural Walls', `${c.innerPerimeterWidth} mm`, `${(c.innerPerimeterWidth/nozzleDiameter*100).toFixed(0)}%`, 'Maximum shear & tensile load'],
        ['Top Solid Infill', `${c.topSolidInfillWidth} mm`, `${(c.topSolidInfillWidth/nozzleDiameter*100).toFixed(0)}%`, 'Smooth ironing finish'],
        ['Sparse Infill', `${c.sparseInfillWidth} mm`, `${(c.sparseInfillWidth/nozzleDiameter*100).toFixed(0)}%`, 'Speed & structural support'],
        ['Support Interface', `${c.supportWidth} mm`, `${(c.supportWidth/nozzleDiameter*100).toFixed(0)}%`, 'Clean breakaway without marks']
      ];

      rows.forEach((r, idx) => {
        doc.text(r[0], 18, startY + (idx * 6.5));
        doc.text(r[1], 75, startY + (idx * 6.5));
        doc.text(r[2], 115, startY + (idx * 6.5));
        doc.text(r[3], 145, startY + (idx * 6.5));
      });

      // Section 3: Thin Wall Tuning
      const sec3Y = startY + (rows.length * 6.5) + 10;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('2. Thin Wall Zero-Gap-Fill Calibration', 14, sec3Y);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`• Target Wall Thickness: ${targetWallThickness} mm`, 16, sec3Y + 7);
      doc.text(`• Exact Perimeter Count: ${c.integerPerimeters} continuous perimeter loops`, 16, sec3Y + 13);
      doc.text(`• Tuned Line Width (Zero Gap-Fill): ${c.tunedLineWidth} mm (vs ${c.defaultWidth}mm default)`, 16, sec3Y + 19);
      doc.text(`• Flat Contact Bonding Area: ${c.contactWidth} mm width per extrusion trace`, 16, sec3Y + 25);

      // Footer
      doc.setDrawColor(203, 213, 225);
      doc.line(14, 280, 196, 280);
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text('Toolique 3D Printing Engineering Suite • Slicer Calibration Tool • toolique.in', 14, 285);

      doc.save(`Line_Width_Calibration_${nozzleDiameter}mm_${Date.now()}.pdf`);
    } catch (e) {
      console.error('PDF Generation Error', e);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-left">
      
      {/* -------------------- Top Action Toolbar -------------------- */}
      <div className="saas-card p-5 md:p-6 space-y-4 bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 border border-indigo-500/20">
            <Printer className="w-3.5 h-3.5" />
            <span>Slicer Extrusion Bead Physics & Layer Bonding Engine</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => copyToClipboard(getOrcaConfigText(), 'orca')}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              {copiedKey === 'orca' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'orca' ? 'Copied' : 'Copy Slicer Config'}</span>
            </button>

            <button
              onClick={exportPDF}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-black uppercase tracking-wider transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF Calibration Card</span>
            </button>
          </div>
        </div>

        {/* Quick Nozzle Diameter Selector */}
        <div className="pt-3 border-t border-zinc-200/60 dark:border-zinc-800/80">
          <div className="flex items-center gap-2 mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[11px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Select Nozzle Bore Diameter:
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {NOZZLE_PRESETS.map(preset => (
              <button
                key={preset.diameter}
                type="button"
                onClick={() => {
                  setNozzleDiameter(preset.diameter);
                  // Auto-scale layer height to 50% of nozzle
                  setLayerHeight(Number((preset.diameter * 0.5).toFixed(2)));
                }}
                className={`px-3.5 py-2 rounded-xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                  nozzleDiameter === preset.diameter
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-zinc-100/70 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border-zinc-200/70 dark:border-zinc-700/60'
                }`}
              >
                <span>{preset.label}</span>
                <span className={`text-[10px] opacity-80 ${nozzleDiameter === preset.diameter ? 'text-white' : 'text-zinc-400'}`}>
                  ({preset.diameter * 0.5}mm std)
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* -------------------- Main Two-Column Layout -------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive Parameters (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Hardware & Material Settings Card */}
          <div className="saas-card p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200/60 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                  Extruder & Filament Parameters
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-zinc-400">
                Live Geometry Tuning
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nozzle Size */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Nozzle Bore Diameter ($d_n$)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0.1"
                    max="2.5"
                    step="0.05"
                    value={nozzleDiameter}
                    onChange={e => setNozzleDiameter(parseFloat(e.target.value) || 0.4)}
                    className="saas-input font-mono text-sm"
                  />
                  <span className="text-xs font-bold text-zinc-400">mm</span>
                </div>
              </div>

              {/* Layer Height */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Layer Height ($h$)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0.04"
                    max={nozzleDiameter * 0.85}
                    step="0.02"
                    value={layerHeight}
                    onChange={e => setLayerHeight(parseFloat(e.target.value) || 0.2)}
                    className="saas-input font-mono text-sm"
                  />
                  <span className="text-xs font-bold text-zinc-400">mm</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {LAYER_HEIGHT_PRESETS.map(preset => (
                    <button
                      key={preset.height}
                      type="button"
                      onClick={() => setLayerHeight(preset.height)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                        layerHeight === preset.height
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {preset.height}mm
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-zinc-400 mt-1 block">
                  {(layerHeight / nozzleDiameter * 100).toFixed(0)}% of nozzle diameter (Safe range: 25% - 80%)
                </span>
              </div>

              {/* Filament Material */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Filament Polymer
                </label>
                <select
                  value={selectedMaterial}
                  onChange={e => {
                    setSelectedMaterial(e.target.value);
                    const mat = MATERIAL_PRESETS.find(m => m.id === e.target.value);
                    if (mat) setHotendFlowLimit(mat.flowLimitMm3s);
                  }}
                  className="saas-input text-xs font-bold"
                >
                  {MATERIAL_PRESETS.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-zinc-400 mt-1 block">
                  {currentMaterial.notes}
                </span>
              </div>

              {/* Printing Goal / Profile */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Optimization Goal
                </label>
                <select
                  value={selectedGoal}
                  onChange={e => setSelectedGoal(e.target.value)}
                  className="saas-input text-xs font-bold"
                >
                  {PROFILE_GOALS.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-zinc-400 mt-1 block">
                  {currentGoal.desc}
                </span>
              </div>

              {/* Hotend Max Volumetric Flow Limit */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Hotend Max Flow Limit
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="2"
                    max="80"
                    step="1"
                    value={hotendFlowLimit}
                    onChange={e => setHotendFlowLimit(parseFloat(e.target.value) || 18)}
                    className="saas-input font-mono text-sm"
                  />
                  <span className="text-xs font-bold text-zinc-400">mm³/s</span>
                </div>
                <span className="text-[10px] text-zinc-400 mt-1 block">
                  Std: 12-18 mm³/s • High-Flow: 24-35 mm³/s
                </span>
              </div>

              {/* Target Print Speed */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Target Print Speed
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="10"
                    max="600"
                    step="10"
                    value={printSpeed}
                    onChange={e => setPrintSpeed(parseFloat(e.target.value) || 150)}
                    className="saas-input font-mono text-sm"
                  />
                  <span className="text-xs font-bold text-zinc-400">mm/s</span>
                </div>
                <span className="text-[10px] text-zinc-400 mt-1 block">
                  Flow at speed: {calculations.defaultFlowRate} mm³/s ({calculations.flowUtilization}% of hotend)
                </span>
              </div>
            </div>
          </div>

          {/* Thin Wall & Perimeter Optimization Card */}
          <div className="saas-card p-6 space-y-4 border-indigo-100/70 dark:border-zinc-800">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Boxes className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                  Thin Wall & Zero Gap-Fill Tuner
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                Eliminate Micro-Gaps
              </span>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
              Specify your 3D CAD target shell wall thickness. The calculator determines exact continuous perimeter counts and micro-adjusts line width to prevent slow, vibrating gap-fill moves.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Target CAD Wall Thickness
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0.4"
                    max="10"
                    step="0.1"
                    value={targetWallThickness}
                    onChange={e => setTargetWallThickness(parseFloat(e.target.value) || 1.6)}
                    className="saas-input font-mono text-sm"
                  />
                  <span className="text-xs font-bold text-zinc-400">mm</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200/60 dark:border-zinc-700/60 flex flex-col justify-between">
                <span className="text-[10px] font-black uppercase text-zinc-400">Perimeter Loops</span>
                <div className="text-lg font-black font-mono text-indigo-650 dark:text-indigo-400">
                  {calculations.integerPerimeters} Loops
                </div>
                <span className="text-[10px] text-zinc-400">Continuous perimeters</span>
              </div>

              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col justify-between">
                <span className="text-[10px] font-black uppercase text-indigo-650 dark:text-indigo-400">Tuned Line Width</span>
                <div className="text-lg font-black font-mono text-indigo-950 dark:text-indigo-200">
                  {calculations.tunedLineWidth} mm
                </div>
                <span className="text-[10px] text-indigo-650/80 dark:text-indigo-400/80">0% Gap-fill / 100% Solid</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Extrusion Dashboard & Slicer Table (5 cols) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          
          {/* Hero Recommendation Card */}
          <div className="saas-card p-6 md:p-7 space-y-6 border-indigo-200/80 dark:border-indigo-900/40 bg-gradient-to-br from-white via-indigo-50/20 to-purple-50/20 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 shadow-md">
            
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Primary Extrusion Recommendation
              </span>
              <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${calculations.squishColor}`}>
                {calculations.squishStatus.split('(')[0]}
              </div>
            </div>

            {/* Optimal Line Width Hero Display */}
            <div>
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Recommended Default Line Width
              </span>
              <div className="text-3xl sm:text-4xl font-black font-mono text-indigo-650 dark:text-indigo-400 tracking-tight mt-1">
                {calculations.defaultWidth}
                <span className="text-sm font-bold font-sans text-zinc-400 ml-2">mm</span>
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                {(calculations.defaultWidth / nozzleDiameter * 100).toFixed(0)}% of {nozzleDiameter}mm nozzle • {calculations.defaultAspect}:1 Aspect Ratio
              </div>
            </div>

            {/* Bead Squish & Contact Bar */}
            <div className="space-y-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-zinc-700 dark:text-zinc-300">Inter-Layer Bond Surface Area</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">{calculations.contactWidth} mm flat contact</span>
              </div>

              {/* Progress bar visualizer for aspect ratio */}
              <div className="h-2.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                <div 
                  style={{ width: `${Math.min(100, (calculations.defaultAspect / 4.5) * 100)}%` }} 
                  className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full transition-all duration-300"
                />
              </div>

              <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                <span>1.5:1 (Round/Weak)</span>
                <span className="text-indigo-500 font-bold">2.25:1 (Ideal Squish)</span>
                <span>4.0:1 (Heavy Flange)</span>
              </div>
            </div>

            {/* Flow & Speed Safety KPIs */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-200/60 dark:border-zinc-800 text-xs">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200/50 dark:border-zinc-800">
                <span className="text-[10px] font-bold text-zinc-400 uppercase block">Max Safe Speed</span>
                <span className="text-base font-black font-mono text-zinc-900 dark:text-white">
                  {calculations.maxSafeSpeed} mm/s
                </span>
                <span className="text-[9px] text-zinc-400 block mt-0.5">At {hotendFlowLimit} mm³/s limit</span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200/50 dark:border-zinc-800">
                <span className="text-[10px] font-bold text-zinc-400 uppercase block">Bead Area</span>
                <span className="text-base font-black font-mono text-zinc-900 dark:text-white">
                  {calculations.defaultArea} mm²
                </span>
                <span className="text-[9px] text-zinc-400 block mt-0.5">Cross-section volume</span>
              </div>
            </div>
          </div>

          {/* Slicer Feature Table & Visualizer Tabs */}
          <div className="saas-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('slicer')}
                  className={`text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'slicer'
                      ? 'bg-indigo-500/10 text-indigo-650 dark:text-indigo-400'
                      : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  Slicer Breakdown
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('bead')}
                  className={`text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'bead'
                      ? 'bg-indigo-500/10 text-indigo-650 dark:text-indigo-400'
                      : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  2D Bead Physics
                </button>
              </div>

              <span className="text-[10px] font-mono font-bold text-zinc-400">
                Bambu • Orca • Prusa • Cura
              </span>
            </div>

            {/* Tab 1: Complete Slicer Feature Table */}
            {activeTab === 'slicer' && (
              <div className="space-y-2 text-xs">
                {[
                  { name: 'Default Line Width', val: calculations.defaultWidth, desc: 'Base extrusion for perimeter loops', pct: (calculations.defaultWidth/nozzleDiameter*100).toFixed(0) },
                  { name: 'First Layer (Bed Adhesion)', val: calculations.firstLayerWidth, desc: 'Max squish to eliminate elephant foot gaps', pct: (calculations.firstLayerWidth/nozzleDiameter*100).toFixed(0) },
                  { name: 'Outer / External Wall', val: calculations.outerPerimeterWidth, desc: 'Highest dimensional accuracy & crisp corners', pct: (calculations.outerPerimeterWidth/nozzleDiameter*100).toFixed(0) },
                  { name: 'Inner / Structural Walls', val: calculations.innerPerimeterWidth, desc: 'Deep inter-layer penetration for part strength', pct: (calculations.innerPerimeterWidth/nozzleDiameter*100).toFixed(0) },
                  { name: 'Top Solid Infill', val: calculations.topSolidInfillWidth, desc: 'Ironing finish without over-extrusion ridges', pct: (calculations.topSolidInfillWidth/nozzleDiameter*100).toFixed(0) },
                  { name: 'Sparse Infill (Gyroid/Grid)', val: calculations.sparseInfillWidth, desc: 'Fast internal volume deposition', pct: (calculations.sparseInfillWidth/nozzleDiameter*100).toFixed(0) },
                  { name: 'Support Structure', val: calculations.supportWidth, desc: 'Low bonding for effortless support removal', pct: (calculations.supportWidth/nozzleDiameter*100).toFixed(0) }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/60">
                    <div>
                      <div className="font-extrabold text-zinc-900 dark:text-white">{item.name}</div>
                      <div className="text-[10px] text-zinc-400">{item.desc}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-black text-indigo-650 dark:text-indigo-400 text-sm">
                        {item.val} <span className="text-[10px] font-sans font-bold text-zinc-400">mm</span>
                      </div>
                      <div className="text-[9px] font-mono text-zinc-400 font-bold">{item.pct}% bore</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 2: 2D Bead SVG Schematic */}
            {activeTab === 'bead' && (
              <div className="space-y-3">
                <div className="w-full aspect-[4/3] bg-zinc-950 rounded-2xl p-4 relative overflow-hidden border border-zinc-800 flex flex-col justify-between">
                  <div className="relative z-10 flex justify-between items-center text-[10px] font-mono text-zinc-400 border-b border-zinc-800/80 pb-2">
                    <span className="text-indigo-400 font-bold">STADIUM BEAD CROSS-SECTION</span>
                    <span>W/H = {calculations.defaultAspect}</span>
                  </div>

                  {/* SVG Canvas */}
                  <div className="relative z-10 flex-grow flex items-center justify-center p-2">
                    <svg viewBox="0 0 320 180" className="w-full h-full max-h-[150px]">
                      {/* Substrate / Previous Layer */}
                      <rect x="20" y="130" width="280" height="35" fill="#1e293b" stroke="#334155" strokeWidth="1.5" rx="2" />
                      <text x="30" y="152" fill="#64748b" fontSize="9" fontFamily="monospace">Previous Printed Layer (N-1)</text>

                      {/* Nozzle Orifice Cutout at Top */}
                      <polygon points="120,10 200,10 180,60 140,60" fill="#f59e0b" opacity="0.3" />
                      <line x1="140" y1="60" x2="180" y2="60" stroke="#f59e0b" strokeWidth="2.5" />
                      <text x="142" y="52" fill="#fbbf24" fontSize="8" fontWeight="bold">Nozzle Bore ({nozzleDiameter}mm)</text>

                      {/* Squished Extrusion Bead (Capsule/Stadium) */}
                      <rect 
                        x="70" 
                        y="80" 
                        width="180" 
                        height="50" 
                        rx="25" 
                        fill="url(#beadGradient)" 
                        stroke="#6366f1" 
                        strokeWidth="2" 
                      />

                      {/* Flat Contact Line indicator */}
                      <line x1="95" y1="130" x2="225" y2="130" stroke="#10b981" strokeWidth="3" />

                      {/* Dimension lines */}
                      {/* Width Dimension */}
                      <line x1="70" y1="72" x2="250" y2="72" stroke="#818cf8" strokeWidth="1" strokeDasharray="3 2" />
                      <text x="130" y="68" fill="#818cf8" fontSize="8" fontWeight="bold">Width w = {calculations.defaultWidth}mm</text>

                      {/* Height Dimension */}
                      <line x1="260" y1="80" x2="260" y2="130" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 2" />
                      <text x="265" y="108" fill="#38bdf8" fontSize="8" fontWeight="bold">h = {layerHeight}mm</text>

                      <defs>
                        <linearGradient id="beadGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.5" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                  <div className="relative z-10 flex justify-between items-center text-[9px] font-mono text-zinc-500 pt-2 border-t border-zinc-800/80">
                    <span>FLAT BOND: {calculations.contactWidth} mm</span>
                    <span>AREA: {calculations.defaultArea} mm²</span>
                  </div>
                </div>

                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                  <strong>Physics Insight:</strong> Modern slicers model extrusion lines with rounded semicircular sides. Setting line width 110-125% of nozzle diameter creates optimal internal pressure to squash molten thermoplastic onto the layer below.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

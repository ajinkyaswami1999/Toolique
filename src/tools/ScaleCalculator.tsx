import { useState, useMemo } from 'react';
import { 
  Maximize2, 
  Copy, 
  Check, 
  Info, 
  Lock, 
  Unlock, 
  Sliders, 
  Box, 
  AlertTriangle, 
  Download, 
  Layers, 
  Sparkles, 
  ArrowRightLeft, 
  ShieldCheck, 
  Maximize, 
  Grid 
} from 'lucide-react';
import jsPDF from 'jspdf';

// --- Types & Data ---

interface ScalePreset {
  id: string;
  name: string;
  ratio: number; // e.g. 1/12 = 0.083333
  ratioStr: string;
  category: 'Tabletop / Miniatures' | 'Model Kits & Collectibles' | 'Model Rail & RC' | 'Architectural & Naval';
  description: string;
  nominalHeightMm: number; // based on 1.8m human
}

const SCALE_PRESETS: ScalePreset[] = [
  // Tabletop & Miniatures
  { id: 'epic_6mm', name: '6mm / Epic Scale (1:285)', ratio: 1/285, ratioStr: '1:285', category: 'Tabletop / Miniatures', description: 'Micro armor, Epic 40k, BattleTech micro warfare.', nominalHeightMm: 6.3 },
  { id: 'warmaster_10mm', name: '10mm / Warmaster (1:160)', ratio: 1/160, ratioStr: '1:160', category: 'Tabletop / Miniatures', description: 'Mass-battle fantasy & historical wargames.', nominalHeightMm: 11.25 },
  { id: 'fow_15mm', name: '15mm / Flames of War (1:100)', ratio: 1/100, ratioStr: '1:100', category: 'Tabletop / Miniatures', description: 'WWII tactical wargaming & Team Yankee.', nominalHeightMm: 18.0 },
  { id: 'heroic_28mm', name: '28mm "Heroic" / Warhammer 40K (1:56)', ratio: 1/56, ratioStr: '1:56', category: 'Tabletop / Miniatures', description: 'Warhammer 40k / Age of Sigmar, exaggerated heroic heads and weapons.', nominalHeightMm: 32.1 },
  { id: 'true_28mm', name: '28mm "True Scale" (1:64)', ratio: 1/64, ratioStr: '1:64', category: 'Tabletop / Miniatures', description: 'Historical 28mm realistic anatomy miniatures.', nominalHeightMm: 28.1 },
  { id: 'heroic_32mm', name: '32mm Heroic / D&D Modern (1:50)', ratio: 1/50, ratioStr: '1:50', category: 'Tabletop / Miniatures', description: 'Modern Dungeons & Dragons, Marvel Crisis Protocol, Star Wars Shatterpoint.', nominalHeightMm: 36.0 },
  { id: 'inq_54mm', name: '54mm / Inquisitor (1:32)', ratio: 1/32, ratioStr: '1:32', category: 'Tabletop / Miniatures', description: 'Collector display miniatures, vintage toy soldiers.', nominalHeightMm: 56.25 },
  { id: 'display_75mm', name: '75mm Display Resin Figurine (1:24)', ratio: 1/24, ratioStr: '1:24', category: 'Tabletop / Miniatures', description: 'High-detail resin display busts & painter showcase models.', nominalHeightMm: 75.0 },

  // Collectibles & Action Figures
  { id: 'fig_1_6', name: '1:6 Scale (Hot Toys / 12″ Action Figures)', ratio: 1/6, ratioStr: '1:6', category: 'Model Kits & Collectibles', description: 'High-end collector 12-inch figures (Sideshow, Hot Toys, Barbie).', nominalHeightMm: 300.0 },
  { id: 'fig_1_10', name: '1:10 Scale (Statues / Kotobukiya ARTFX)', ratio: 1/10, ratioStr: '1:10', category: 'Model Kits & Collectibles', description: 'Collector resin statues, superhero display figures.', nominalHeightMm: 180.0 },
  { id: 'fig_1_12', name: '1:12 Scale (6″ Action Figures / Dollhouse)', ratio: 1/12, ratioStr: '1:12', category: 'Model Kits & Collectibles', description: 'Marvel Legends, Star Wars Black Series, standard dollhouse furniture.', nominalHeightMm: 150.0 },
  { id: 'fig_1_18', name: '1:18 Scale (3.75″ Figures / Diecast Cars)', ratio: 1/18, ratioStr: '1:18', category: 'Model Kits & Collectibles', description: 'Vintage Star Wars, G.I. Joe, 1:18 diecast muscle cars.', nominalHeightMm: 100.0 },
  { id: 'gunpla_1_100', name: '1:100 Scale (Master Grade Gunpla)', ratio: 1/100, ratioStr: '1:100', category: 'Model Kits & Collectibles', description: 'Gundam MG / FM kits, architectural detail models.', nominalHeightMm: 18.0 },
  { id: 'gunpla_1_144', name: '1:144 Scale (High Grade / Real Grade Gunpla)', ratio: 1/144, ratioStr: '1:144', category: 'Model Kits & Collectibles', description: 'Gundam HG/RG kits, modern military aircraft.', nominalHeightMm: 12.5 },

  // Model Rail & RC
  { id: 'g_scale', name: '1:24 Scale (G Scale / Slot Cars / Model Cars)', ratio: 1/24, ratioStr: '1:24', category: 'Model Rail & RC', description: 'Garden railways, 1:24 plastic model car kits.', nominalHeightMm: 75.0 },
  { id: 'armor_1_35', name: '1:35 Scale (Military Tanks & Dioramas)', ratio: 1/35, ratioStr: '1:35', category: 'Model Rail & RC', description: 'World standard for military tanks, armor, and soldier kits (Tamiya).', nominalHeightMm: 51.4 },
  { id: 'air_1_48', name: '1:48 Scale (O Scale / Military Aircraft)', ratio: 1/48, ratioStr: '1:48', category: 'Model Rail & RC', description: 'Quarter-inch architectural scale, WWII fighter aircraft, O-gauge trains.', nominalHeightMm: 37.5 },
  { id: 'air_1_72', name: '1:72 Scale (Aircraft & Small Armor)', ratio: 1/72, ratioStr: '1:72', category: 'Model Rail & RC', description: 'Compact military aircraft and armor kits.', nominalHeightMm: 25.0 },
  { id: 'ho_scale', name: '1:87 Scale (HO Scale Trains)', ratio: 1/87.1, ratioStr: '1:87', category: 'Model Rail & RC', description: 'Most popular model railroading scale worldwide.', nominalHeightMm: 20.67 },
  { id: 'n_scale', name: '1:160 Scale (N Scale Trains)', ratio: 1/160, ratioStr: '1:160', category: 'Model Rail & RC', description: 'Compact space-saving model railways.', nominalHeightMm: 11.25 },

  // Architectural & Naval
  { id: 'arch_1_50', name: '1:50 Scale (Architectural Interior Models)', ratio: 1/50, ratioStr: '1:50', category: 'Architectural & Naval', description: 'Detailed building interior and section models.', nominalHeightMm: 36.0 },
  { id: 'arch_1_100', name: '1:100 Scale (Architectural Masterplans)', ratio: 1/100, ratioStr: '1:100', category: 'Architectural & Naval', description: 'Standard architectural presentation massing models.', nominalHeightMm: 18.0 },
  { id: 'arch_1_200', name: '1:200 Scale (Site / Campus Models)', ratio: 1/200, ratioStr: '1:200', category: 'Architectural & Naval', description: 'Large site context models and skyscraper towers.', nominalHeightMm: 9.0 },
  { id: 'ship_1_350', name: '1:350 Scale (Naval Warships)', ratio: 1/350, ratioStr: '1:350', category: 'Architectural & Naval', description: 'Detailed battleship and aircraft carrier models.', nominalHeightMm: 5.14 },
  { id: 'ship_1_700', name: '1:700 Scale (Waterline Fleet Models)', ratio: 1/700, ratioStr: '1:700', category: 'Architectural & Naval', description: 'Waterline collection naval miniature dioramas.', nominalHeightMm: 2.57 }
];

interface PrinterBedPreset {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
}

const PRINTER_BEDS: PrinterBedPreset[] = [
  { id: 'bambu_x1c', name: 'Bambu Lab X1C / P1S / A1 (256 × 256 × 256 mm)', x: 256, y: 256, z: 256 },
  { id: 'bambu_a1_mini', name: 'Bambu Lab A1 Mini (180 × 180 × 180 mm)', x: 180, y: 180, z: 180 },
  { id: 'prusa_mk4', name: 'Prusa MK4 / MK3S+ (250 × 210 × 220 mm)', x: 250, y: 210, z: 220 },
  { id: 'prusa_xl', name: 'Prusa XL (360 × 360 × 360 mm)', x: 360, y: 360, z: 360 },
  { id: 'ender_3', name: 'Creality Ender 3 / V3 (220 × 220 × 250 mm)', x: 220, y: 220, z: 250 },
  { id: 'cr_m4', name: 'Creality CR-M4 (450 × 450 × 470 mm)', x: 450, y: 450, z: 470 },
  { id: 'elegoo_saturn', name: 'Elegoo Saturn 4 Ultra Resin (218 × 123 × 220 mm)', x: 218, y: 123, z: 220 },
  { id: 'elegoo_mars', name: 'Elegoo Mars 4 Resin (153 × 77 × 165 mm)', x: 153, y: 77, z: 165 },
  { id: 'custom_bed', name: 'Custom Printer Volume', x: 200, y: 200, z: 200 }
];

export default function ScaleCalculator() {
  // Main Tab / Calculator Mode
  const [activeTab, setActiveTab] = useState<'dimensions' | 'miniatures' | 'bedFit'>('dimensions');

  // --- Dimension Scaling Mode State ---
  const [origX, setOrigX] = useState<number>(100);
  const [origY, setOrigY] = useState<number>(80);
  const [origZ, setOrigZ] = useState<number>(120);
  const [unit, setUnit] = useState<'mm' | 'cm' | 'in'>('mm');

  const [isLockedUniform, setIsLockedUniform] = useState<boolean>(true);
  const [uniformScalePct, setUniformScalePct] = useState<number>(150);

  // Non-uniform scales
  const [scaleX, setScaleX] = useState<number>(150);
  const [scaleY, setScaleY] = useState<number>(150);
  const [scaleZ, setScaleZ] = useState<number>(150);

  // Target Dimension Scaling helper
  const [targetAxis, setTargetAxis] = useState<'X' | 'Y' | 'Z'>('Z');
  const [targetDimensionVal, setTargetDimensionVal] = useState<number>(180);

  // Original Reference Mass (optional estimation)
  const [origWeightGrams, setOrigWeightGrams] = useState<number>(75);

  // --- Miniature Cross-Scale Converter State ---
  const [sourceScaleId, setSourceScaleId] = useState<string>('fig_1_12');
  const [targetScaleId, setTargetScaleId] = useState<string>('heroic_28mm');
  const [customRealHeightM, setCustomRealHeightM] = useState<number>(1.80); // 1.8m human baseline
  const [sourceModelHeightMm, setSourceModelHeightMm] = useState<number>(150);

  // --- Printer Bed Fit State ---
  const [selectedBedId, setSelectedBedId] = useState<string>('bambu_x1c');
  const [customBedX, setCustomBedX] = useState<number>(200);
  const [customBedY, setCustomBedY] = useState<number>(200);
  const [customBedZ, setCustomBedZ] = useState<number>(200);

  // Copy Feedback
  const [copied, setCopied] = useState<boolean>(false);

  // Sync uniform scale to non-uniform states when locked
  const handleUniformScaleChange = (newPct: number) => {
    setUniformScalePct(newPct);
    setScaleX(newPct);
    setScaleY(newPct);
    setScaleZ(newPct);
  };

  // Sync when user types target dimension
  const handleApplyTargetDimension = () => {
    let baseDim = origZ;
    if (targetAxis === 'X') baseDim = origX;
    if (targetAxis === 'Y') baseDim = origY;

    if (baseDim > 0 && targetDimensionVal > 0) {
      const calculatedPct = Math.round((targetDimensionVal / baseDim) * 10000) / 100;
      handleUniformScaleChange(calculatedPct);
    }
  };

  // --- Calculations for Mode 1: 3D Dimensions ---
  const dimCalculations = useMemo(() => {
    const sFactorX = (isLockedUniform ? uniformScalePct : scaleX) / 100.0;
    const sFactorY = (isLockedUniform ? uniformScalePct : scaleY) / 100.0;
    const sFactorZ = (isLockedUniform ? uniformScalePct : scaleZ) / 100.0;

    const scaledX = origX * sFactorX;
    const scaledY = origY * sFactorY;
    const scaledZ = origZ * sFactorZ;

    // Linear multiplier
    const avgLinearMultiplier = (sFactorX + sFactorY + sFactorZ) / 3.0;

    // Surface area scaling factor (X * Y, Y * Z, X * Z avg)
    const areaMultiplier = (sFactorX * sFactorY + sFactorY * sFactorZ + sFactorX * sFactorZ) / 3.0;

    // Volume & Mass scaling factor (X * Y * Z)
    const volumeMultiplier = sFactorX * sFactorY * sFactorZ;

    // Projected Weight
    const estimatedWeightGrams = origWeightGrams * volumeMultiplier;

    // Aspect Ratios
    const minDim = Math.min(origX, origY, origZ) || 1;
    const aspectX = (origX / minDim).toFixed(2);
    const aspectY = (origY / minDim).toFixed(2);
    const aspectZ = (origZ / minDim).toFixed(2);

    // Converted to other units
    const unitMultiplier = unit === 'in' ? 25.4 : unit === 'cm' ? 10 : 1;
    const scaledX_mm = scaledX * unitMultiplier;
    const scaledY_mm = scaledY * unitMultiplier;
    const scaledZ_mm = scaledZ * unitMultiplier;

    // Thin Wall Alert (e.g. 1mm feature scaled down)
    const minScale = Math.min(sFactorX, sFactorY, sFactorZ);
    const thinWallSampleMm = 1.0 * minScale * unitMultiplier;
    const isThinWallWarning = thinWallSampleMm < 0.4;

    return {
      sFactorX,
      sFactorY,
      sFactorZ,
      scaledX,
      scaledY,
      scaledZ,
      scaledX_mm,
      scaledY_mm,
      scaledZ_mm,
      avgLinearMultiplier,
      areaMultiplier,
      volumeMultiplier,
      estimatedWeightGrams,
      aspectRatioStr: `${aspectX} : ${aspectY} : ${aspectZ}`,
      thinWallSampleMm,
      isThinWallWarning
    };
  }, [origX, origY, origZ, unit, isLockedUniform, uniformScalePct, scaleX, scaleY, scaleZ, origWeightGrams]);

  // --- Calculations for Mode 2: Miniature Scale Converter ---
  const miniCalculations = useMemo(() => {
    const srcPreset = SCALE_PRESETS.find(p => p.id === sourceScaleId) || SCALE_PRESETS[0];
    const tgtPreset = SCALE_PRESETS.find(p => p.id === targetScaleId) || SCALE_PRESETS[1];

    // Conversion ratio from source to target = target.ratio / source.ratio
    const crossScaleMultiplier = tgtPreset.ratio / srcPreset.ratio;
    const slicerScalePct = crossScaleMultiplier * 100.0;

    // Target height based on input source model height
    const convertedHeightMm = sourceModelHeightMm * crossScaleMultiplier;

    // Human baseline heights
    const srcHumanHeightMm = (customRealHeightM * 1000) * srcPreset.ratio;
    const tgtHumanHeightMm = (customRealHeightM * 1000) * tgtPreset.ratio;

    // Volume & Mass change (cubic law)
    const volumeChangeFactor = Math.pow(crossScaleMultiplier, 3);
    const surfaceChangeFactor = Math.pow(crossScaleMultiplier, 2);

    return {
      srcPreset,
      tgtPreset,
      crossScaleMultiplier,
      slicerScalePct,
      convertedHeightMm,
      srcHumanHeightMm,
      tgtHumanHeightMm,
      volumeChangeFactor,
      surfaceChangeFactor
    };
  }, [sourceScaleId, targetScaleId, customRealHeightM, sourceModelHeightMm]);

  // --- Calculations for Mode 3: Printer Bed Max Fit ---
  const bedCalculations = useMemo(() => {
    let bedX = 256, bedY = 256, bedZ = 256;
    if (selectedBedId === 'custom_bed') {
      bedX = customBedX; bedY = customBedY; bedZ = customBedZ;
    } else {
      const b = PRINTER_BEDS.find(p => p.id === selectedBedId);
      if (b) { bedX = b.x; bedY = b.y; bedZ = b.z; }
    }

    const unitMultiplier = unit === 'in' ? 25.4 : unit === 'cm' ? 10 : 1;
    const modelX_mm = origX * unitMultiplier;
    const modelY_mm = origY * unitMultiplier;
    const modelZ_mm = origZ * unitMultiplier;

    // Max scale to fit inside bed in standard orientation
    const maxScaleX = (bedX / (modelX_mm || 1)) * 100;
    const maxScaleY = (bedY / (modelY_mm || 1)) * 100;
    const maxScaleZ = (bedZ / (modelZ_mm || 1)) * 100;

    const maxUniformFitPct = Math.min(maxScaleX, maxScaleY, maxScaleZ);

    // Current scaled dimensions vs Bed
    const currentFitX = dimCalculations.scaledX_mm <= bedX;
    const currentFitY = dimCalculations.scaledY_mm <= bedY;
    const currentFitZ = dimCalculations.scaledZ_mm <= bedZ;
    const isOverallFit = currentFitX && currentFitY && currentFitZ;

    return {
      bedX,
      bedY,
      bedZ,
      maxUniformFitPct,
      currentFitX,
      currentFitY,
      currentFitZ,
      isOverallFit
    };
  }, [selectedBedId, customBedX, customBedY, customBedZ, origX, origY, origZ, unit, dimCalculations]);

  // Copy Results to Clipboard
  const handleCopy = () => {
    let lines: string[] = [];
    if (activeTab === 'dimensions') {
      lines = [
        `=== 3D Model Scale Conversion Summary ===`,
        `Original Dimensions: ${origX} × ${origY} × ${origZ} ${unit}`,
        `Scale Applied: X: ${(dimCalculations.sFactorX * 100).toFixed(1)}%, Y: ${(dimCalculations.sFactorY * 100).toFixed(1)}%, Z: ${(dimCalculations.sFactorZ * 100).toFixed(1)}%`,
        `Scaled Dimensions: ${dimCalculations.scaledX.toFixed(2)} × ${dimCalculations.scaledY.toFixed(2)} × ${dimCalculations.scaledZ.toFixed(2)} ${unit}`,
        `Scaled (mm): ${dimCalculations.scaledX_mm.toFixed(1)} × ${dimCalculations.scaledY_mm.toFixed(1)} × ${dimCalculations.scaledZ_mm.toFixed(1)} mm`,
        `Linear Multiplier: ${dimCalculations.avgLinearMultiplier.toFixed(3)}x`,
        `Surface Area Multiplier: ${dimCalculations.areaMultiplier.toFixed(3)}x (${(dimCalculations.areaMultiplier * 100).toFixed(1)}%)`,
        `Volume / Mass Multiplier: ${dimCalculations.volumeMultiplier.toFixed(4)}x (${(dimCalculations.volumeMultiplier * 100).toFixed(2)}%)`,
        `Projected Net Weight: ${dimCalculations.estimatedWeightGrams.toFixed(1)} grams (from ${origWeightGrams}g original)`
      ];
    } else if (activeTab === 'miniatures') {
      lines = [
        `=== Tabletop Miniature Scale Conversion ===`,
        `Source Scale: ${miniCalculations.srcPreset.name} (${miniCalculations.srcPreset.ratioStr})`,
        `Target Scale: ${miniCalculations.tgtPreset.name} (${miniCalculations.tgtPreset.ratioStr})`,
        `Slicer Input Scale: ${miniCalculations.slicerScalePct.toFixed(2)}% (${miniCalculations.crossScaleMultiplier.toFixed(4)}x)`,
        `Source Model Height: ${sourceModelHeightMm} mm`,
        `Converted Model Height: ${miniCalculations.convertedHeightMm.toFixed(1)} mm`,
        `Volume / Material Ratio: ${miniCalculations.volumeChangeFactor.toFixed(4)}x (${(miniCalculations.volumeChangeFactor * 100).toFixed(2)}%)`
      ];
    } else {
      lines = [
        `=== 3D Printer Bed Fit & Max Scale ===`,
        `Model Original: ${origX} × ${origY} × ${origZ} ${unit}`,
        `Target Printer: ${bedCalculations.bedX} × ${bedCalculations.bedY} × ${bedCalculations.bedZ} mm`,
        `Maximum Uniform Scale to Fit: ${bedCalculations.maxUniformFitPct.toFixed(1)}%`,
        `Current Scaled Dimensions: ${dimCalculations.scaledX_mm.toFixed(1)} × ${dimCalculations.scaledY_mm.toFixed(1)} × ${dimCalculations.scaledZ_mm.toFixed(1)} mm`,
        `Fits on Build Plate: ${bedCalculations.isOverallFit ? 'YES (Fits inside volume)' : 'NO (Exceeds build volume)'}`
      ];
    }

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export PDF Technical Spec Sheet
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header Banner
    doc.setFillColor(79, 70, 229); // Indigo 600
    doc.rect(0, 0, pageWidth, 24, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('3D MODEL & MINIATURE SCALE CONVERSION REPORT', 14, 15);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString()} | Toolique 3D Suite`, pageWidth - 14, 15, { align: 'right' });

    let y = 35;
    doc.setTextColor(30, 41, 59);

    // Section 1: Dimensions
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('1. Bounding Box & Slicer Percentage Conversion', 14, y);
    y += 7;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Original Bounding Box: ${origX} × ${origY} × ${origZ} ${unit}`, 14, y);
    doc.text(`Unit: ${unit.toUpperCase()}`, 120, y);
    y += 5;
    doc.text(`Slicer Percentage: X: ${(dimCalculations.sFactorX * 100).toFixed(1)}% | Y: ${(dimCalculations.sFactorY * 100).toFixed(1)}% | Z: ${(dimCalculations.sFactorZ * 100).toFixed(1)}%`, 14, y);
    y += 5;
    doc.text(`Scaled Output (${unit}): ${dimCalculations.scaledX.toFixed(2)} × ${dimCalculations.scaledY.toFixed(2)} × ${dimCalculations.scaledZ.toFixed(2)} ${unit}`, 14, y);
    doc.text(`Scaled Output (mm): ${dimCalculations.scaledX_mm.toFixed(1)} × ${dimCalculations.scaledY_mm.toFixed(1)} × ${dimCalculations.scaledZ_mm.toFixed(1)} mm`, 120, y);
    y += 9;

    // Section 2: Square-Cube Physical Law
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('2. Physical Multiplier & Square-Cube Law', 14, y);
    y += 7;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Linear Scale Factor: ${dimCalculations.avgLinearMultiplier.toFixed(3)}x`, 14, y);
    doc.text(`Surface Area Multiplier (s²): ${dimCalculations.areaMultiplier.toFixed(3)}x (${(dimCalculations.areaMultiplier * 100).toFixed(1)}%)`, 120, y);
    y += 5;
    doc.text(`Volume / Mass Multiplier (s³): ${dimCalculations.volumeMultiplier.toFixed(4)}x (${(dimCalculations.volumeMultiplier * 100).toFixed(2)}%)`, 14, y);
    doc.text(`Projected Net Part Mass: ${dimCalculations.estimatedWeightGrams.toFixed(1)} g (from ${origWeightGrams}g original)`, 120, y);
    y += 9;

    // Section 3: Miniature Scales
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('3. Tabletop & Miniature Cross-Scale Comparison', 14, y);
    y += 7;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Source Scale: ${miniCalculations.srcPreset.name}`, 14, y);
    doc.text(`Target Scale: ${miniCalculations.tgtPreset.name}`, 120, y);
    y += 5;
    doc.text(`Slicer Input Setting: ${miniCalculations.slicerScalePct.toFixed(2)}% (${miniCalculations.crossScaleMultiplier.toFixed(4)}x multiplier)`, 14, y);
    y += 5;
    doc.text(`Source Height (${sourceModelHeightMm} mm) -> Converted Height: ${miniCalculations.convertedHeightMm.toFixed(1)} mm`, 14, y);
    y += 9;

    // Section 4: Build Plate Compatibility
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('4. 3D Printer Build Volume Fit', 14, y);
    y += 7;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Build Volume: ${bedCalculations.bedX} × ${bedCalculations.bedY} × ${bedCalculations.bedZ} mm`, 14, y);
    doc.text(`Max Fit Scale: ${bedCalculations.maxUniformFitPct.toFixed(1)}%`, 120, y);
    y += 5;
    doc.text(`Compatibility: ${bedCalculations.isOverallFit ? 'Model fits comfortably inside build volume.' : 'WARNING: Model exceeds printer dimensions!'}`, 14, y);
    y += 12;

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Toolique 3D Suite • Fast client-side scaling calculations for FDM & SLA 3D printing.', 14, 285);

    doc.save('3D_Model_Scale_Report.pdf');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left">

      {/* Mode Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-2 rounded-2xl bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab('dimensions')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'dimensions'
                ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Maximize2 className="w-4 h-4" />
            3D Dimension & Slicer %
          </button>
          <button
            onClick={() => setActiveTab('miniatures')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'miniatures'
                ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Tabletop & Miniatures Converter
          </button>
          <button
            onClick={() => setActiveTab('bedFit')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'bedFit'
                ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Grid className="w-4 h-4" />
            Max Bed Fit & Volume
          </button>
        </div>

        {/* Global Unit Selector */}
        <div className="flex items-center gap-2 pr-2">
          <span className="text-[11px] font-bold text-zinc-500 uppercase">Unit:</span>
          {(['mm', 'cm', 'in'] as const).map(u => (
            <button
              key={u}
              onClick={() => setUnit(u)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                unit === u
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: 3D Dimensions & Slicer Scaling Mode */}
      {activeTab === 'dimensions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Inputs (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Original Bounding Box Inputs */}
            <div className="saas-card p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
                <div className="flex items-center gap-2">
                  <Box className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                    Original Model Dimensions ({unit})
                  </h3>
                </div>
                <button
                  onClick={() => setIsLockedUniform(!isLockedUniform)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isLockedUniform 
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800' 
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                  title={isLockedUniform ? 'Aspect Ratio Locked' : 'Aspect Ratio Unlocked'}
                >
                  {isLockedUniform ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  <span>{isLockedUniform ? 'Uniform Locked' : 'Non-Uniform'}</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Width (X)</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={origX}
                    onChange={(e) => setOrigX(Math.max(0.01, Number(e.target.value)))}
                    className="saas-input text-xs font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Depth (Y)</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={origY}
                    onChange={(e) => setOrigY(Math.max(0.01, Number(e.target.value)))}
                    className="saas-input text-xs font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Height (Z)</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={origZ}
                    onChange={(e) => setOrigZ(Math.max(0.01, Number(e.target.value)))}
                    className="saas-input text-xs font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
                <span>Aspect Ratio: <strong className="text-zinc-800 dark:text-zinc-200">{dimCalculations.aspectRatioStr}</strong></span>
                <span>Orig Vol: {((origX * origY * origZ) / (unit === 'mm' ? 1000 : unit === 'cm' ? 1 : 0.0610237)).toFixed(1)} cm³</span>
              </div>
            </div>

            {/* Scaling Controls: Percentage / Sliders */}
            <div className="saas-card p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                    Scaling Multiplier (%)
                  </h3>
                </div>
                <div className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                  {isLockedUniform ? `${uniformScalePct}%` : `X:${scaleX}% Y:${scaleY}% Z:${scaleZ}%`}
                </div>
              </div>

              {isLockedUniform ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="500"
                      step="1"
                      value={uniformScalePct}
                      onChange={(e) => handleUniformScaleChange(Number(e.target.value))}
                      className="flex-grow accent-indigo-600 cursor-pointer"
                    />
                    <div className="flex items-center gap-1 w-24">
                      <input
                        type="number"
                        min="1"
                        max="5000"
                        value={uniformScalePct}
                        onChange={(e) => handleUniformScaleChange(Math.max(0.1, Number(e.target.value)))}
                        className="saas-input text-xs font-bold text-center"
                      />
                      <span className="text-xs font-bold text-zinc-500">%</span>
                    </div>
                  </div>

                  {/* Preset Scale Multiplier Buttons */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[25, 50, 75, 100, 125, 150, 175, 200, 250, 300].map(pct => (
                      <button
                        key={pct}
                        onClick={() => handleUniformScaleChange(pct)}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                          uniformScalePct === pct
                            ? 'bg-indigo-600 text-white'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-zinc-600 dark:text-zinc-400">
                      <span>Scale X:</span>
                      <span className="text-indigo-600 font-extrabold">{scaleX}%</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="400"
                      value={scaleX}
                      onChange={(e) => setScaleX(Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-zinc-600 dark:text-zinc-400">
                      <span>Scale Y:</span>
                      <span className="text-indigo-600 font-extrabold">{scaleY}%</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="400"
                      value={scaleY}
                      onChange={(e) => setScaleY(Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-zinc-600 dark:text-zinc-400">
                      <span>Scale Z:</span>
                      <span className="text-indigo-600 font-extrabold">{scaleZ}%</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="400"
                      value={scaleZ}
                      onChange={(e) => setScaleZ(Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Dimension Target Solver */}
            <div className="saas-card p-5 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
                <Maximize className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                  Target Dimension Solver (Auto-Compute %)
                </h3>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Specify your desired final measurement on any axis to automatically compute the required slicer scaling percentage:
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={targetAxis}
                  onChange={(e) => setTargetAxis(e.target.value as 'X' | 'Y' | 'Z')}
                  className="saas-input w-28 text-xs font-bold cursor-pointer"
                >
                  <option value="X">Width (X)</option>
                  <option value="Y">Depth (Y)</option>
                  <option value="Z">Height (Z)</option>
                </select>
                <input
                  type="number"
                  min="0.1"
                  step="1"
                  value={targetDimensionVal}
                  onChange={(e) => setTargetDimensionVal(Number(e.target.value))}
                  className="saas-input w-36 text-xs font-bold"
                  placeholder={`Desired ${unit}`}
                />
                <span className="text-xs font-bold text-zinc-500">{unit}</span>
                <button
                  onClick={handleApplyTargetDimension}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors cursor-pointer"
                >
                  Solve & Scale
                </button>
              </div>
            </div>
          </div>

          {/* Right Results Column (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Output Card 1: New Dimensions */}
            <div className="saas-card p-5 space-y-4 border-indigo-500/30">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
                <div className="flex items-center gap-2">
                  <Maximize2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                    Scaled Bounding Box
                  </h3>
                </div>
                <button
                  onClick={handleCopy}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/50 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-300 block">Scaled Width (X)</span>
                    <span className="text-lg font-black text-zinc-900 dark:text-white">
                      {dimCalculations.scaledX.toFixed(2)} <span className="text-xs font-semibold text-zinc-500">{unit}</span>
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-zinc-500">
                    ({dimCalculations.scaledX_mm.toFixed(1)} mm)
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/50 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-300 block">Scaled Depth (Y)</span>
                    <span className="text-lg font-black text-zinc-900 dark:text-white">
                      {dimCalculations.scaledY.toFixed(2)} <span className="text-xs font-semibold text-zinc-500">{unit}</span>
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-zinc-500">
                    ({dimCalculations.scaledY_mm.toFixed(1)} mm)
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/50 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-300 block">Scaled Height (Z)</span>
                    <span className="text-lg font-black text-zinc-900 dark:text-white">
                      {dimCalculations.scaledZ.toFixed(2)} <span className="text-xs font-semibold text-zinc-500">{unit}</span>
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-zinc-500">
                    ({dimCalculations.scaledZ_mm.toFixed(1)} mm)
                  </span>
                </div>
              </div>
            </div>

            {/* Square-Cube Physical Law Analysis */}
            <div className="saas-card p-5 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
                <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                  Square-Cube Physics Impact
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-1.5 border-b border-zinc-100 dark:border-zinc-800/60 text-xs">
                  <span className="text-zinc-500">Linear Scale Factor:</span>
                  <span className="font-extrabold text-zinc-900 dark:text-white">
                    {dimCalculations.avgLinearMultiplier.toFixed(3)}× ({((dimCalculations.avgLinearMultiplier - 1) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-zinc-100 dark:border-zinc-800/60 text-xs">
                  <span className="text-zinc-500">Surface Area Multiplier (s²):</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                    {dimCalculations.areaMultiplier.toFixed(3)}× ({(dimCalculations.areaMultiplier * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-zinc-100 dark:border-zinc-800/60 text-xs">
                  <span className="text-zinc-500">Volume & Mass Multiplier (s³):</span>
                  <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                    {dimCalculations.volumeMultiplier.toFixed(4)}× ({(dimCalculations.volumeMultiplier * 100).toFixed(2)}%)
                  </span>
                </div>

                {/* Weight Estimator */}
                <div className="pt-2">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-bold text-zinc-600 dark:text-zinc-400">Original Part Mass (g):</span>
                    <input
                      type="number"
                      min="0"
                      value={origWeightGrams}
                      onChange={(e) => setOrigWeightGrams(Number(e.target.value))}
                      className="saas-input w-20 text-xs font-bold text-right py-1 px-2"
                    />
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 flex justify-between items-center">
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">Projected Mass:</span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                      {dimCalculations.estimatedWeightGrams.toFixed(1)} grams
                    </span>
                  </div>
                </div>

                {/* Thin Wall Warning */}
                {dimCalculations.isThinWallWarning && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      <strong>Thin Feature Warning:</strong> Scaling down reduces 1mm wall details to <strong>{dimCalculations.thinWallSampleMm.toFixed(2)}mm</strong>, which is thinner than standard 0.4mm nozzle lines.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Export & Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleExportPDF}
                className="w-full py-2.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download PDF Spec Sheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Tabletop & Miniature Cross-Scale Converter */}
      {activeTab === 'miniatures' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Inputs (6 cols) */}
          <div className="lg:col-span-6 space-y-5">
            
            <div className="saas-card p-5 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
                <ArrowRightLeft className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                  Cross-Scale Miniature Converter
                </h3>
              </div>

              {/* Source Scale */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">From Source Scale (Original File)</label>
                <select
                  value={sourceScaleId}
                  onChange={(e) => setSourceScaleId(e.target.value)}
                  className="saas-input text-xs font-bold cursor-pointer"
                >
                  {SCALE_PRESETS.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} [{p.category}]
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {miniCalculations.srcPreset.description}
                </p>
              </div>

              {/* Target Scale */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">To Target Scale (Desired Print)</label>
                <select
                  value={targetScaleId}
                  onChange={(e) => setTargetScaleId(e.target.value)}
                  className="saas-input text-xs font-bold cursor-pointer"
                >
                  {SCALE_PRESETS.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} [{p.category}]
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {miniCalculations.tgtPreset.description}
                </p>
              </div>

              {/* Baseline Height Setting */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Real Human Height (m)</label>
                  <input
                    type="number"
                    step="0.05"
                    min="1.0"
                    max="2.5"
                    value={customRealHeightM}
                    onChange={(e) => setCustomRealHeightM(Number(e.target.value))}
                    className="saas-input text-xs font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Source Model Height (mm)</label>
                  <input
                    type="number"
                    min="1"
                    value={sourceModelHeightMm}
                    onChange={(e) => setSourceModelHeightMm(Number(e.target.value))}
                    className="saas-input text-xs font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Miniature Conversion Outputs (6 cols) */}
          <div className="lg:col-span-6 space-y-5">
            
            {/* Primary KPI Card: Slicer Input */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent border border-indigo-500/30 saas-card space-y-4">
              <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400">
                <span className="text-xs font-bold uppercase tracking-wider">Required Slicer Scale Input</span>
                <Sparkles className="w-5 h-5" />
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-zinc-900 dark:text-white">
                  {miniCalculations.slicerScalePct.toFixed(2)}%
                </span>
                <span className="text-sm font-bold text-zinc-500">
                  ({miniCalculations.crossScaleMultiplier.toFixed(4)}× multiplier)
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/60 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Converted Miniature Height:</span>
                  <strong className="text-zinc-900 dark:text-white font-mono">{miniCalculations.convertedHeightMm.toFixed(1)} mm</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Human Baseline in Target Scale:</span>
                  <strong className="text-zinc-900 dark:text-white font-mono">{miniCalculations.tgtHumanHeightMm.toFixed(1)} mm</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Resin / Filament Volume Ratio:</span>
                  <strong className="text-indigo-600 dark:text-indigo-400 font-mono">
                    {miniCalculations.volumeChangeFactor.toFixed(4)}× ({(miniCalculations.volumeChangeFactor * 100).toFixed(2)}%)
                  </strong>
                </div>
              </div>
            </div>

            {/* Quick Reference Miniature Table */}
            <div className="saas-card p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Popular Miniature Scale Reference Guide
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold uppercase text-[10px]">
                      <th className="pb-2">Scale</th>
                      <th className="pb-2">Ratio</th>
                      <th className="pb-2">Human Height</th>
                      <th className="pb-2">Popular Games</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-zinc-700 dark:text-zinc-300">
                    <tr>
                      <td className="py-2 font-bold text-indigo-600">28mm Heroic</td>
                      <td className="py-2 font-mono">1:56</td>
                      <td className="py-2">~32 mm</td>
                      <td className="py-2 text-[11px] text-zinc-500">Warhammer 40k, AoS</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-bold text-indigo-600">32mm Heroic</td>
                      <td className="py-2 font-mono">1:50</td>
                      <td className="py-2">~36 mm</td>
                      <td className="py-2 text-[11px] text-zinc-500">D&D 5e, Marvel Crisis</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-bold text-indigo-600">1:12 Scale</td>
                      <td className="py-2 font-mono">1:12</td>
                      <td className="py-2">150 mm (6″)</td>
                      <td className="py-2 text-[11px] text-zinc-500">Marvel Legends, Black Series</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-bold text-indigo-600">1:18 Scale</td>
                      <td className="py-2 font-mono">1:18</td>
                      <td className="py-2">100 mm (3.75″)</td>
                      <td className="py-2 text-[11px] text-zinc-500">Vintage Star Wars, G.I. Joe</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 3D Printer Bed Max Fit & Volume */}
      {activeTab === 'bedFit' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Inputs (6 cols) */}
          <div className="lg:col-span-6 space-y-5">
            <div className="saas-card p-5 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
                <Grid className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                  Target Printer Build Plate
                </h3>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Printer Preset</label>
                <select
                  value={selectedBedId}
                  onChange={(e) => setSelectedBedId(e.target.value)}
                  className="saas-input text-xs font-bold cursor-pointer"
                >
                  {PRINTER_BEDS.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              {selectedBedId === 'custom_bed' && (
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Bed X (mm)</label>
                    <input
                      type="number"
                      min="50"
                      value={customBedX}
                      onChange={(e) => setCustomBedX(Number(e.target.value))}
                      className="saas-input text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Bed Y (mm)</label>
                    <input
                      type="number"
                      min="50"
                      value={customBedY}
                      onChange={(e) => setCustomBedY(Number(e.target.value))}
                      className="saas-input text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Bed Z (mm)</label>
                    <input
                      type="number"
                      min="50"
                      value={customBedZ}
                      onChange={(e) => setCustomBedZ(Number(e.target.value))}
                      className="saas-input text-xs font-bold"
                    />
                  </div>
                </div>
              )}

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1">
                <div className="text-zinc-500 font-bold uppercase text-[10px]">Model Original Bounds:</div>
                <div className="font-mono font-bold text-zinc-900 dark:text-white">
                  {origX} × {origY} × {origZ} {unit} ({dimCalculations.scaledX_mm.toFixed(1)} × {dimCalculations.scaledY_mm.toFixed(1)} × {dimCalculations.scaledZ_mm.toFixed(1)} mm)
                </div>
              </div>
            </div>
          </div>

          {/* Right Fit Outputs (6 cols) */}
          <div className="lg:col-span-6 space-y-5">
            
            {/* Fit Status Card */}
            <div className={`p-6 rounded-2xl saas-card space-y-4 border ${
              bedCalculations.isOverallFit
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-rose-500/10 border-rose-500/30'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                  Build Volume Compatibility
                </span>
                {bedCalculations.isOverallFit ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                )}
              </div>

              <div className="text-xl font-black text-zinc-900 dark:text-white">
                {bedCalculations.isOverallFit ? (
                  <span className="text-emerald-600 dark:text-emerald-400">✓ Model Fits Inside Build Volume</span>
                ) : (
                  <span className="text-rose-600 dark:text-rose-400">✕ Model Exceeds Printer Dimensions</span>
                )}
              </div>

              {/* Max Uniform Fit Percentage Button */}
              <div className="p-3 rounded-xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-600 dark:text-zinc-400 font-bold">Max Possible Uniform Scale:</span>
                  <span className="text-base font-black text-indigo-600 dark:text-indigo-400">
                    {bedCalculations.maxUniformFitPct.toFixed(1)}%
                  </span>
                </div>
                <button
                  onClick={() => handleUniformScaleChange(Math.floor(bedCalculations.maxUniformFitPct))}
                  className="w-full py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer"
                >
                  Scale to Max Fit ({Math.floor(bedCalculations.maxUniformFitPct)}%)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Notice Banner */}
      <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200/50 dark:border-zinc-800/50 flex items-start gap-3">
        <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
        <span className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          <strong>100% Client-Side Computation:</strong> All dimension scaling, aspect ratio translations, and square-cube volumetric mass calculations are processed locally inside your browser sandbox.
        </span>
      </div>
    </div>
  );
}

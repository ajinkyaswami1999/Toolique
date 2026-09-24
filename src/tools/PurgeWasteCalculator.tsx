import { useState, useMemo } from 'react';
import {
  Printer, Copy, Check, RotateCcw,
  Sparkles, CheckCircle2,
  FileSpreadsheet, FileText, Info, Wrench,
  TrendingDown, DollarSign,
  Leaf, Scale, Sliders
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

// ============================================================================
// Types & Engineering Constants
// ============================================================================

export type FilamentType = 'pla' | 'petg' | 'abs' | 'tpu' | 'pc' | 'pla_cf' | 'pva';
export type HardwarePresetType = 'bambu_ams_std' | 'bambu_ams_tuned' | 'prusa_mmu3' | 'anycubic_ace' | 'creality_cfs' | 'voron_ercf' | 'idex_dual';

export interface MaterialConfig {
  id: FilamentType;
  name: string;
  density: number; // g/cm3
  defaultCostPerKg: number; // in INR
  co2Factor: number; // kg CO2e per kg plastic
  desc: string;
}

export const FILAMENT_MATERIALS: Record<FilamentType, MaterialConfig> = {
  pla: {
    id: 'pla',
    name: 'PLA / PLA+ (Polylactic Acid)',
    density: 1.24,
    defaultCostPerKg: 1400,
    co2Factor: 3.1,
    desc: 'Most popular biodegradable multi-color filament. Standard density 1.24 g/cm³.'
  },
  petg: {
    id: 'petg',
    name: 'PETG (Polyethylene Terephthalate)',
    density: 1.27,
    defaultCostPerKg: 1550,
    co2Factor: 4.2,
    desc: 'Durable, chemical-resistant. Requires slightly higher flush volume to clear stringing.'
  },
  abs: {
    id: 'abs',
    name: 'ABS / ASA (Acrylonitrile Styrene)',
    density: 1.04,
    defaultCostPerKg: 1650,
    co2Factor: 5.5,
    desc: 'Lightweight high-temp plastic. Lower density means more volume per gram of waste.'
  },
  tpu: {
    id: 'tpu',
    name: 'TPU 95A (Flexible Elastomer)',
    density: 1.21,
    defaultCostPerKg: 2200,
    co2Factor: 4.8,
    desc: 'Flexible filament. Requires slower purge extrusion speeds and higher flush volume.'
  },
  pc: {
    id: 'pc',
    name: 'Polycarbonate (PC)',
    density: 1.20,
    defaultCostPerKg: 2800,
    co2Factor: 6.2,
    desc: 'Engineering grade high-impact filament.'
  },
  pla_cf: {
    id: 'pla_cf',
    name: 'Carbon Fiber PLA (PLA-CF)',
    density: 1.29,
    defaultCostPerKg: 2400,
    co2Factor: 4.5,
    desc: 'Abrasive matte composite. High cost per gram makes purge waste expensive.'
  },
  pva: {
    id: 'pva',
    name: 'PVA / BVOH (Water Soluble Support)',
    density: 1.23,
    defaultCostPerKg: 3800,
    co2Factor: 5.0,
    desc: 'Premium soluble support material. Extremely costly to waste in purge chutes.'
  }
};

export interface HardwarePreset {
  id: HardwarePresetType;
  name: string;
  system: string;
  swaps: number;
  avgFlushMm3: number;
  flushMultiplier: number;
  swapTimeSec: number;
  flushIntoInfill: boolean;
  flushIntoSupport: boolean;
  primeTowerEnabled: boolean;
  towerWidthMm: number;
  towerDepthMm: number;
  material: FilamentType;
  desc: string;
}

export const HARDWARE_PRESETS: HardwarePreset[] = [
  {
    id: 'bambu_ams_std',
    name: 'Bambu Lab X1C / P1S / A1 (AMS Standard)',
    system: 'Single-Nozzle 4-Color AMS',
    swaps: 220,
    avgFlushMm3: 250,
    flushMultiplier: 1.0,
    swapTimeSec: 58,
    flushIntoInfill: false,
    flushIntoSupport: false,
    primeTowerEnabled: true,
    towerWidthMm: 25,
    towerDepthMm: 25,
    material: 'pla',
    desc: 'Factory default Bambu Studio settings with standard 1.0x flush volumes and prime tower.'
  },
  {
    id: 'bambu_ams_tuned',
    name: 'Bambu Lab (Tuned Eco 0.6x Flush + Infill Purge)',
    system: 'Single-Nozzle Optimized AMS',
    swaps: 220,
    avgFlushMm3: 160,
    flushMultiplier: 0.65,
    swapTimeSec: 52,
    flushIntoInfill: true,
    flushIntoSupport: true,
    primeTowerEnabled: true,
    towerWidthMm: 15,
    towerDepthMm: 15,
    material: 'pla',
    desc: 'Tuned dark-to-light flush matrix with flush-into-infill active. Saves up to 60% waste!'
  },
  {
    id: 'prusa_mmu3',
    name: 'Prusa MK4 / MK3.9 with MMU3',
    system: 'Single-Nozzle 5-Color MMU3',
    swaps: 180,
    avgFlushMm3: 210,
    flushMultiplier: 0.9,
    swapTimeSec: 46,
    flushIntoInfill: true,
    flushIntoSupport: false,
    primeTowerEnabled: true,
    towerWidthMm: 30,
    towerDepthMm: 20,
    material: 'pla',
    desc: 'PrusaSlicer Wipe Tower architecture with smart ramming sequence.'
  },
  {
    id: 'anycubic_ace',
    name: 'Anycubic Kobra 3 with ACE Pro',
    system: 'Single-Nozzle 4-Color ACE',
    swaps: 200,
    avgFlushMm3: 240,
    flushMultiplier: 1.0,
    swapTimeSec: 60,
    flushIntoInfill: false,
    flushIntoSupport: false,
    primeTowerEnabled: true,
    towerWidthMm: 25,
    towerDepthMm: 25,
    material: 'pla',
    desc: 'Anycubic Next multi-color system with automated filament cutter and wipe chute.'
  },
  {
    id: 'creality_cfs',
    name: 'Creality K2 Plus / K1C with CFS',
    system: 'Single-Nozzle 4-Color CFS',
    swaps: 190,
    avgFlushMm3: 230,
    flushMultiplier: 1.0,
    swapTimeSec: 55,
    flushIntoInfill: false,
    flushIntoSupport: false,
    primeTowerEnabled: true,
    towerWidthMm: 25,
    towerDepthMm: 25,
    material: 'pla',
    desc: 'Creality Filament System multi-color architecture with rear poop chute discharge.'
  },
  {
    id: 'voron_ercf',
    name: 'Voron CoreXY with ERCF / Happy Hare',
    system: 'Enraged Rabbit Carrot Feeder (8-12 Colors)',
    swaps: 260,
    avgFlushMm3: 260,
    flushMultiplier: 1.0,
    swapTimeSec: 65,
    flushIntoInfill: true,
    flushIntoSupport: false,
    primeTowerEnabled: true,
    towerWidthMm: 25,
    towerDepthMm: 25,
    material: 'abs',
    desc: 'Open-source multi-material setup running Klipper Happy Hare with custom wipe buckets.'
  },
  {
    id: 'idex_dual',
    name: 'IDEX / Toolchanger (Dual Independent Extruders)',
    system: 'Independent Dual Extruder (2 Nozzles)',
    swaps: 150,
    avgFlushMm3: 0,
    flushMultiplier: 0.0,
    swapTimeSec: 6,
    flushIntoInfill: false,
    flushIntoSupport: false,
    primeTowerEnabled: false,
    towerWidthMm: 0,
    towerDepthMm: 0,
    material: 'pla',
    desc: 'Zero poop waste! Two dedicated nozzles eliminate filament purge entirely.'
  }
];

// Color Matrix Presets
export const STANDARD_COLORS = [
  { id: 'white', name: 'White', hex: '#ffffff', brightness: 100 },
  { id: 'black', name: 'Black', hex: '#18181b', brightness: 10 },
  { id: 'red', name: 'Bright Red', hex: '#ef4444', brightness: 45 },
  { id: 'yellow', name: 'Yellow', hex: '#eab308', brightness: 85 },
  { id: 'blue', name: 'Royal Blue', hex: '#3b82f6', brightness: 40 },
  { id: 'green', name: 'Emerald Green', hex: '#10b981', brightness: 50 },
  { id: 'orange', name: 'Orange', hex: '#f97316', brightness: 60 },
  { id: 'grey', name: 'Silver / Grey', hex: '#9ca3af', brightness: 65 }
];

export default function PurgeWasteCalculator() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'calculator' | 'matrix' | 'playbook' | 'farm'>('calculator');

  // Active Preset Tracker
  const [activePresetId, setActivePresetId] = useState<string | null>('bambu_ams_std');

  // Core Inputs
  const [modelNetGrams, setModelNetGrams] = useState<number>(65); // Net printed model weight
  const [swaps, setSwaps] = useState<number>(220); // Total filament retractions/swaps
  const [layersCount, setLayersCount] = useState<number>(450); // Total model layers
  const [avgFlushMm3, setAvgFlushMm3] = useState<number>(250); // mm³ per swap
  const [flushMultiplier, setFlushMultiplier] = useState<number>(1.0); // Slicer multiplier (0.3x - 1.5x)
  const [selectedMaterial, setSelectedMaterial] = useState<FilamentType>('pla');
  const [costPerKg, setCostPerKg] = useState<number>(1400); // Currency per kg
  const [currencySymbol, setCurrencySymbol] = useState<string>('₹');
  const [swapTimeSec, setSwapTimeSec] = useState<number>(58); // Seconds per swap cycle
  const [batchQuantity, setBatchQuantity] = useState<number>(1); // Copies on build plate

  // Advanced Waste Reduction Options
  const [flushIntoInfill, setFlushIntoInfill] = useState<boolean>(false);
  const [infillAbsorptionPct, setInfillAbsorptionPct] = useState<number>(30); // 30% of flush absorbed by infill
  const [flushIntoSupport, setFlushIntoSupport] = useState<boolean>(false);
  const [supportAbsorptionPct, setSupportAbsorptionPct] = useState<number>(15); // 15% absorbed by supports

  // Prime Tower Parameters
  const [primeTowerEnabled, setPrimeTowerEnabled] = useState<boolean>(true);
  const [towerWidthMm, setTowerWidthMm] = useState<number>(25);
  const [towerDepthMm, setTowerDepthMm] = useState<number>(25);
  const [towerLayersPct, setTowerLayersPct] = useState<number>(65); // % of total layers with swaps

  // Copy feedback
  const [copied, setCopied] = useState<boolean>(false);

  // Active Material Configuration
  const material = FILAMENT_MATERIALS[selectedMaterial];

  // ============================================================================
  // Mathematical Calculations Engine
  // ============================================================================
  const calc = useMemo(() => {
    const density = material.density; // g/cm³
    const effectiveFlushMm3 = avgFlushMm3 * flushMultiplier;

    // 1. Single Swap Raw Mass
    // 1 mm³ = 0.001 cm³ -> grams = mm³ * 0.001 * density
    const singleSwapRawGrams = effectiveFlushMm3 * 0.001 * density;

    // 2. Gross Poop Waste (before infill/support absorption)
    const grossPoopGrams = swaps * singleSwapRawGrams;

    // 3. Infill & Support Absorption Savings
    let absorptionFactor = 0;
    if (flushIntoInfill) absorptionFactor += (infillAbsorptionPct / 100);
    if (flushIntoSupport) absorptionFactor += (supportAbsorptionPct / 100);
    absorptionFactor = Math.min(0.65, absorptionFactor); // max 65% absorbable

    const absorbedGrams = grossPoopGrams * absorptionFactor;
    const netPoopGrams = Math.max(0, grossPoopGrams - absorbedGrams);

    // 4. Prime Tower Mass Calculation
    // Prime tower volume = Width * Depth * Layer Height (0.2mm) * Layers * Infill Density (approx 40% solid + walls)
    let primeTowerGrams = 0;
    if (primeTowerEnabled && towerWidthMm > 0 && towerDepthMm > 0) {
      const activeTowerLayers = Math.max(1, Math.round(layersCount * (towerLayersPct / 100)));
      const layerHeightMm = 0.20;
      const towerVolumeMm3 = (towerWidthMm * towerDepthMm * layerHeightMm * 0.45) * activeTowerLayers;
      primeTowerGrams = towerVolumeMm3 * 0.001 * density;
    }

    // 5. Total Purge Waste Mass (Total for the ENTIRE bed, shared across batch copies)
    const totalWasteGrams = netPoopGrams + primeTowerGrams;
    const totalWasteKg = totalWasteGrams / 1000;

    // 6. Model Net Mass Total (multiplied by batch quantity)
    const totalModelNetGrams = modelNetGrams * batchQuantity;
    const totalModelNetKg = totalModelNetGrams / 1000;

    // 7. Total Spool Filament Extruded
    const totalFilamentUsedGrams = totalModelNetGrams + totalWasteGrams;
    const totalFilamentUsedKg = totalFilamentUsedGrams / 1000;

    // 8. Waste-to-Model Ratio %
    const wasteToModelRatioPct = totalModelNetGrams > 0 ? (totalWasteGrams / totalModelNetGrams) * 100 : 0;
    const wasteOfTotalPrintPct = totalFilamentUsedGrams > 0 ? (totalWasteGrams / totalFilamentUsedGrams) * 100 : 0;

    // 9. Financial Cost Breakdown
    const costPerGram = costPerKg / 1000;
    const poopWasteCost = netPoopGrams * costPerGram;
    const primeTowerCost = primeTowerGrams * costPerGram;
    const totalWasteCost = totalWasteGrams * costPerGram;
    const usefulModelCost = totalModelNetGrams * costPerGram;
    const totalPrintSpoolCost = totalFilamentUsedGrams * costPerGram;

    // Per-Unit Cost & Waste (when batch printing)
    const wasteGramsPerUnit = totalWasteGrams / Math.max(1, batchQuantity);
    const wasteCostPerUnit = totalWasteCost / Math.max(1, batchQuantity);
    const totalCostPerUnit = totalPrintSpoolCost / Math.max(1, batchQuantity);

    // 10. Print Time Penalty Overhead from Color Swaps
    const totalSwapTimeSeconds = swaps * swapTimeSec;
    const swapTimeHours = totalSwapTimeSeconds / 3600;
    const swapTimeMinutes = Math.floor((totalSwapTimeSeconds % 3600) / 60);
    const swapTimeFormatted = `${Math.floor(swapTimeHours)}h ${swapTimeMinutes}m`;

    // 11. Environmental Impact (Carbon Footprint)
    const carbonFootprintWasteKg = totalWasteKg * material.co2Factor;

    // 12. Batch Scaling Simulation (1 to 16 copies)
    const batchScales = [1, 2, 4, 6, 8, 12, 16].map((qty) => {
      const bModelGrams = modelNetGrams * qty;
      const bWasteRatio = (totalWasteGrams / bModelGrams) * 100;
      const bWastePerPieceGrams = totalWasteGrams / qty;
      const bCostPerPiece = (modelNetGrams * costPerGram) + (totalWasteCost / qty);
      const bSavingsVsSingle = qty > 1 ? Math.round(((totalWasteGrams - bWastePerPieceGrams) / totalWasteGrams) * 100) : 0;
      return {
        qty,
        modelGrams: bModelGrams,
        wastePerPieceGrams: Number(bWastePerPieceGrams.toFixed(1)),
        wasteRatioPct: Number(bWasteRatio.toFixed(1)),
        costPerPiece: Number(bCostPerPiece.toFixed(2)),
        savingsVsSinglePct: bSavingsVsSingle
      };
    });

    return {
      singleSwapRawGrams: Number(singleSwapRawGrams.toFixed(3)),
      grossPoopGrams: Number(grossPoopGrams.toFixed(1)),
      absorbedGrams: Number(absorbedGrams.toFixed(1)),
      netPoopGrams: Number(netPoopGrams.toFixed(1)),
      primeTowerGrams: Number(primeTowerGrams.toFixed(1)),
      totalWasteGrams: Number(totalWasteGrams.toFixed(1)),
      totalWasteKg: Number(totalWasteKg.toFixed(3)),
      totalModelNetGrams: Number(totalModelNetGrams.toFixed(1)),
      totalModelNetKg: Number(totalModelNetKg.toFixed(3)),
      totalFilamentUsedGrams: Number(totalFilamentUsedGrams.toFixed(1)),
      totalFilamentUsedKg: Number(totalFilamentUsedKg.toFixed(3)),
      wasteToModelRatioPct: Number(wasteToModelRatioPct.toFixed(1)),
      wasteOfTotalPrintPct: Number(wasteOfTotalPrintPct.toFixed(1)),
      poopWasteCost: Number(poopWasteCost.toFixed(2)),
      primeTowerCost: Number(primeTowerCost.toFixed(2)),
      totalWasteCost: Number(totalWasteCost.toFixed(2)),
      usefulModelCost: Number(usefulModelCost.toFixed(2)),
      totalPrintSpoolCost: Number(totalPrintSpoolCost.toFixed(2)),
      wasteGramsPerUnit: Number(wasteGramsPerUnit.toFixed(1)),
      wasteCostPerUnit: Number(wasteCostPerUnit.toFixed(2)),
      totalCostPerUnit: Number(totalCostPerUnit.toFixed(2)),
      totalSwapTimeSeconds,
      swapTimeFormatted,
      carbonFootprintWasteKg: Number(carbonFootprintWasteKg.toFixed(2)),
      batchScales
    };
  }, [
    modelNetGrams, swaps, layersCount, avgFlushMm3, flushMultiplier,
    material, costPerKg, swapTimeSec, batchQuantity, flushIntoInfill,
    infillAbsorptionPct, flushIntoSupport, supportAbsorptionPct,
    primeTowerEnabled, towerWidthMm, towerDepthMm, towerLayersPct
  ]);

  // ============================================================================
  // Preset Application
  // ============================================================================
  const applyPreset = (presetId: HardwarePresetType) => {
    const p = HARDWARE_PRESETS.find(x => x.id === presetId);
    if (!p) return;
    setActivePresetId(presetId);
    setSwaps(p.swaps);
    setAvgFlushMm3(p.avgFlushMm3);
    setFlushMultiplier(p.flushMultiplier);
    setSwapTimeSec(p.swapTimeSec);
    setFlushIntoInfill(p.flushIntoInfill);
    setFlushIntoSupport(p.flushIntoSupport);
    setPrimeTowerEnabled(p.primeTowerEnabled);
    setTowerWidthMm(p.towerWidthMm);
    setTowerDepthMm(p.towerDepthMm);
    setSelectedMaterial(p.material);
    setCostPerKg(FILAMENT_MATERIALS[p.material].defaultCostPerKg);
  };

  const handleReset = () => {
    applyPreset('bambu_ams_std');
    setModelNetGrams(65);
    setBatchQuantity(1);
    setLayersCount(450);
  };

  // Copy Summary Report
  const copyReport = () => {
    const report = `=====================================================
TOOLIQUE 3D PRINT PURGE WASTE & COST AUDIT
Material: ${material.name} | Density: ${material.density} g/cm³
=====================================================

1. PRINT & HARDWARE CONFIGURATION
-----------------------------------------------------
• Model Net Weight (1 unit)  : ${modelNetGrams} g (Batch Qty: ${batchQuantity} copies)
• Total Filament Swaps       : ${swaps} swaps
• Average Flush Volume       : ${avgFlushMm3} mm³ (Multiplier: ${flushMultiplier}x)
• Swap Overhead Time         : ${calc.swapTimeFormatted} (${swapTimeSec}s/swap)
• Flush-into-Infill Active   : ${flushIntoInfill ? `YES (Absorbs ~${infillAbsorptionPct}%)` : 'NO'}
• Prime Tower Status         : ${primeTowerEnabled ? `ENABLED (${towerWidthMm}x${towerDepthMm}mm)` : 'DISABLED'}

2. PURGE WASTE BREAKDOWN
-----------------------------------------------------
• Net Poop Chute Waste       : ${calc.netPoopGrams} g (${(calc.netPoopGrams / 1000).toFixed(2)} kg)
• Prime Tower Waste Mass     : ${calc.primeTowerGrams} g
• Total Purge Plastic Mass   : ${calc.totalWasteGrams} g (${calc.totalWasteKg} kg)
• Total Filament Extruded    : ${calc.totalFilamentUsedGrams} g (${calc.totalFilamentUsedKg} kg)
• Waste-to-Model Ratio       : ${calc.wasteToModelRatioPct}%
• Waste of Entire Spool      : ${calc.wasteOfTotalPrintPct}%

3. FINANCIAL & BATCH METRICS
-----------------------------------------------------
• Filament Spool Price       : ${currencySymbol}${costPerKg} / kg
• Monetary Loss (Wasted)     : ${currencySymbol}${calc.totalWasteCost}
• Useful Model Plastic Cost  : ${currencySymbol}${calc.usefulModelCost}
• Total Print Material Cost  : ${currencySymbol}${calc.totalPrintSpoolCost}
• Waste Loss Per Unit (Batch): ${calc.wasteGramsPerUnit} g (${currencySymbol}${calc.wasteCostPerUnit}/unit)
• CO2e Carbon Emissions      : ${calc.carbonFootprintWasteKg} kg CO2e

=====================================================
Generated with Toolique 3D Print Studio.`;

    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export PDF Report
  const exportPDF = () => {
    const doc = new jsPDF();
    const margin = 14;
    let y = 18;

    doc.setFillColor(99, 102, 241);
    doc.rect(0, 0, 210, 24, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('3D PRINT PURGE WASTE & MULTI-COLOR COST REPORT', margin, 12);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString()} | Material: ${material.name}`, margin, 18);

    y = 34;
    doc.setTextColor(30, 41, 59);

    // Section 1: Core Parameters
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('1. PRINT & MULTI-COLOR PARAMETERS', margin, y);
    y += 6;

    const data1 = [
      ['Model Net Mass (Single)', `${modelNetGrams} g`],
      ['Batch Quantity on Plate', `${batchQuantity} Units`],
      ['Total Filament Swaps', `${swaps} Swaps`],
      ['Average Flush Volume', `${avgFlushMm3} mm³ (Multiplier: ${flushMultiplier}x)`],
      ['Flush into Infill / Support', `${flushIntoInfill ? 'Enabled' : 'Disabled'} / ${flushIntoSupport ? 'Enabled' : 'Disabled'}`],
      ['Prime Tower Status', primeTowerEnabled ? `Active (${towerWidthMm}x${towerDepthMm} mm)` : 'Disabled'],
      ['Filament Unit Rate', `${currencySymbol}${costPerKg} / kg`]
    ];

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    data1.forEach(([label, val]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(val, margin + 70, y);
      y += 5;
    });

    // Section 2: Calculated Waste
    y += 4;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('2. PURGE PLASTIC MASS & FINANCIAL LOSS', margin, y);
    y += 6;

    const data2 = [
      ['Poop Chute Discharge Mass', `${calc.netPoopGrams} g (${(calc.netPoopGrams / 1000).toFixed(2)} kg)`],
      ['Prime Tower Solid Mass', `${calc.primeTowerGrams} g`],
      ['Total Purged Waste Mass', `${calc.totalWasteGrams} g (${calc.totalWasteKg} kg)`],
      ['Useful Model Plastic Mass', `${calc.totalModelNetGrams} g`],
      ['Waste-to-Model Ratio', `${calc.wasteToModelRatioPct}%`],
      ['Total Wasted Expense', `${currencySymbol}${calc.totalWasteCost}`],
      ['Useful Model Expense', `${currencySymbol}${calc.usefulModelCost}`],
      ['Total Print Spool Cost', `${currencySymbol}${calc.totalPrintSpoolCost}`],
      ['Time Overhead from Swaps', calc.swapTimeFormatted]
    ];

    data2.forEach(([label, val]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(val, margin + 70, y);
      y += 5;
    });

    // Section 3: Batch Scaling Analysis
    y += 4;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('3. BATCH PRINTING WASTE REDUCTION SCHEDULE', margin, y);
    y += 6;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Batch Qty | Model Mass | Waste / Unit | Waste Ratio | Cost / Unit | Waste Savings', margin, y);
    y += 4;
    doc.line(margin, y, 196, y);
    y += 4;

    doc.setFont('helvetica', 'normal');
    calc.batchScales.forEach((b) => {
      doc.text(
        `${b.qty} units  |  ${b.modelGrams}g  |  ${b.wastePerPieceGrams}g/pc  |  ${b.wasteRatioPct}%  |  ${currencySymbol}${b.costPerPiece}  |  ${b.savingsVsSinglePct}% Saved`,
        margin,
        y
      );
      y += 4.5;
    });

    // Footer
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Toolique 3D Print Studio • Bambu Lab AMS / Prusa MMU3 / Voron ERCF Optimization Engine', margin, 285);

    doc.save(`Purge-Waste-Report-${Date.now()}.pdf`);
  };

  // Export Excel
  const exportExcel = () => {
    const wb = XLSX.utils.book_new();

    const summaryRows = [
      ['Toolique 3D Print Purge Waste Schedule'],
      ['Generated Date', new Date().toISOString()],
      ['Material Type', material.name],
      ['Material Density', material.density, 'g/cm³'],
      [],
      ['Parameter', 'Value', 'Unit'],
      ['Model Net Mass (Single)', modelNetGrams, 'grams'],
      ['Batch Quantity', batchQuantity, 'units'],
      ['Total Swaps', swaps, 'swaps'],
      ['Average Flush Volume', avgFlushMm3, 'mm³'],
      ['Flush Multiplier', flushMultiplier, 'x'],
      ['Poop Chute Waste Mass', calc.netPoopGrams, 'grams'],
      ['Prime Tower Waste Mass', calc.primeTowerGrams, 'grams'],
      ['Total Purged Plastic Mass', calc.totalWasteGrams, 'grams'],
      ['Useful Model Plastic Mass', calc.totalModelNetGrams, 'grams'],
      ['Waste-to-Model Ratio', `${calc.wasteToModelRatioPct}%`, '%'],
      ['Filament Cost Rate', costPerKg, 'per kg'],
      ['Monetary Waste Loss', calc.totalWasteCost, currencySymbol],
      ['Total Print Spool Cost', calc.totalPrintSpoolCost, currencySymbol],
      ['Swap Time Overhead', calc.swapTimeFormatted, 'duration']
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Purge Waste Summary');

    const batchRows = [
      ['Batch Quantity', 'Model Total Mass (g)', 'Waste Per Piece (g)', 'Waste Ratio (%)', 'Cost Per Piece', 'Waste Savings vs Single (%)'],
      ...calc.batchScales.map(b => [
        b.qty,
        b.modelGrams,
        b.wastePerPieceGrams,
        b.wasteRatioPct,
        b.costPerPiece,
        b.savingsVsSinglePct
      ])
    ];
    const wsBatch = XLSX.utils.aoa_to_sheet(batchRows);
    XLSX.utils.book_append_sheet(wb, wsBatch, 'Batch Scale Savings');

    XLSX.writeFile(wb, `Purge-Waste-Schedule-${Date.now()}.xlsx`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-left">
      {/* Top Controls & Hardware Presets Toolbar (NO duplicate H1 heading) */}
      <div className="p-5 saas-card space-y-4 bg-gradient-to-r from-indigo-900/5 via-purple-900/5 to-transparent border-indigo-500/20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
              <Printer className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Multi-Color Hardware Profiles:
            </span>
          </div>

          {/* Quick Export & Action Buttons */}
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
              title="Export Professional PDF Report"
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
              title="Reset to Factory Defaults"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hardware Preset Pills */}
        <div className="flex flex-wrap gap-2">
          {HARDWARE_PRESETS.map((p) => {
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
      </div>

      {/* Main Studio Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 saas-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-500" />
                <span>Slicer Print Parameters</span>
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold">
                {material.name.split(' ')[0]} ({material.density} g/cm³)
              </span>
            </div>

            {/* Model Net Mass & Batch Quantity */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Model Net Mass (Single)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={modelNetGrams || ''}
                    onChange={(e) => {
                      setModelNetGrams(Math.max(1, parseFloat(e.target.value) || 0));
                      setActivePresetId(null);
                    }}
                    className="saas-input font-mono font-bold pr-8 text-xs"
                  />
                  <span className="absolute right-2.5 top-2.5 text-xs text-zinc-400 font-bold">g</span>
                </div>
                <p className="text-[9px] text-zinc-400 mt-1">Useful printed part weight</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Batch Qty on Plate
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="64"
                    value={batchQuantity || ''}
                    onChange={(e) => setBatchQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="saas-input font-mono font-bold pr-10 text-xs"
                  />
                  <span className="absolute right-2.5 top-2.5 text-xs text-zinc-400 font-bold">copies</span>
                </div>
                <p className="text-[9px] text-zinc-400 mt-1">Shares identical purge swaps</p>
              </div>
            </div>

            {/* Total Filament Swaps & Sliced Layers */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Total Filament Swaps
                </label>
                <input
                  type="number"
                  min="0"
                  value={swaps || ''}
                  onChange={(e) => {
                    setSwaps(Math.max(0, parseInt(e.target.value) || 0));
                    setActivePresetId(null);
                  }}
                  className="saas-input font-mono text-xs"
                />
                <p className="text-[9px] text-zinc-400 mt-1">Reported by slicer preview</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Total Sliced Layers
                </label>
                <input
                  type="number"
                  min="1"
                  value={layersCount || ''}
                  onChange={(e) => setLayersCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="saas-input font-mono text-xs"
                />
                <p className="text-[9px] text-zinc-400 mt-1">Z-height layer count</p>
              </div>
            </div>

            {/* Average Flush Volume & Multiplier */}
            <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Average Flush Volume
                  </label>
                  <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {avgFlushMm3} mm³ ({(avgFlushMm3 * 0.001 * material.density).toFixed(2)}g / swap)
                  </span>
                </div>
                <input
                  type="number"
                  step="10"
                  min="0"
                  max="1000"
                  value={avgFlushMm3 || ''}
                  onChange={(e) => {
                    setAvgFlushMm3(Math.max(0, parseFloat(e.target.value) || 0));
                    setActivePresetId(null);
                  }}
                  className="saas-input font-mono text-xs"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Flush Multiplier: <span className="font-bold text-indigo-600 dark:text-indigo-400">{flushMultiplier}x</span>
                  </label>
                  <span className="text-[10px] text-zinc-400">
                    {flushMultiplier <= 0.65 ? 'Aggressive Eco' : flushMultiplier <= 0.9 ? 'Tuned' : 'Default'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.3"
                  max="1.5"
                  step="0.05"
                  value={flushMultiplier}
                  onChange={(e) => {
                    setFlushMultiplier(parseFloat(e.target.value));
                    setActivePresetId(null);
                  }}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-zinc-400 font-mono">
                  <span>0.3x (Risky Bleed)</span>
                  <span>0.65x (Tuned)</span>
                  <span>1.0x (Standard)</span>
                  <span>1.5x (Deep Purge)</span>
                </div>
              </div>
            </div>

            {/* Material & Cost Settings */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Filament Material
                </label>
                <select
                  value={selectedMaterial}
                  onChange={(e) => {
                    const m = e.target.value as FilamentType;
                    setSelectedMaterial(m);
                    setCostPerKg(FILAMENT_MATERIALS[m].defaultCostPerKg);
                  }}
                  className="saas-input text-xs font-semibold cursor-pointer"
                >
                  {Object.values(FILAMENT_MATERIALS).map((mat) => (
                    <option key={mat.id} value={mat.id}>
                      {mat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Spool Cost ({currencySymbol}/kg)
                  </label>
                  <select
                    value={currencySymbol}
                    onChange={(e) => setCurrencySymbol(e.target.value)}
                    className="text-[10px] font-bold bg-transparent border-none text-indigo-600 dark:text-indigo-400 p-0"
                  >
                    <option value="₹">₹ INR</option>
                    <option value="$">$ USD</option>
                    <option value="£">£ GBP</option>
                    <option value="€">€ EUR</option>
                    <option value="AED ">AED</option>
                  </select>
                </div>
                <input
                  type="number"
                  min="0"
                  value={costPerKg || ''}
                  onChange={(e) => setCostPerKg(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="saas-input font-mono text-xs font-bold"
                />
              </div>
            </div>
          </div>

          {/* Slicer Waste Absorption & Prime Tower Features */}
          <div className="p-5 saas-card space-y-4">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <Wrench className="w-4 h-4 text-purple-500" />
              <span>Waste Reduction & Prime Tower</span>
            </h3>

            {/* Flush Into Infill Toggle */}
            <div className="space-y-2">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={flushIntoInfill}
                    onChange={(e) => setFlushIntoInfill(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-zinc-300"
                  />
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                    Flush into Object Infill (Sparse Infill Purge)
                  </span>
                </div>
                {flushIntoInfill && (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    Saves ~{infillAbsorptionPct}%
                  </span>
                )}
              </label>

              {flushIntoInfill && (
                <div className="pl-6 pt-1">
                  <div className="flex justify-between text-[10px] text-zinc-500 font-semibold mb-1">
                    <span>Infill Absorption Capacity:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{infillAbsorptionPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="50"
                    step="5"
                    value={infillAbsorptionPct}
                    onChange={(e) => setInfillAbsorptionPct(parseInt(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Flush Into Support Toggle */}
            <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={flushIntoSupport}
                    onChange={(e) => setFlushIntoSupport(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-zinc-300"
                  />
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                    Flush into Support Structures
                  </span>
                </div>
                {flushIntoSupport && (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    Saves ~{supportAbsorptionPct}%
                  </span>
                )}
              </label>

              {flushIntoSupport && (
                <div className="pl-6 pt-1">
                  <div className="flex justify-between text-[10px] text-zinc-500 font-semibold mb-1">
                    <span>Support Absorption Capacity:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{supportAbsorptionPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="5"
                    value={supportAbsorptionPct}
                    onChange={(e) => setSupportAbsorptionPct(parseInt(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Prime Tower Configuration */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={primeTowerEnabled}
                    onChange={(e) => setPrimeTowerEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-zinc-300"
                  />
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                    Enable Prime / Wipe Tower
                  </span>
                </div>
                {primeTowerEnabled && (
                  <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
                    {calc.primeTowerGrams}g Tower
                  </span>
                )}
              </label>

              {primeTowerEnabled && (
                <div className="space-y-2.5 pl-6 pt-1">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 mb-1">
                        Tower Width (X)
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="60"
                        value={towerWidthMm || ''}
                        onChange={(e) => setTowerWidthMm(Math.max(10, parseInt(e.target.value) || 10))}
                        className="saas-input text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 mb-1">
                        Tower Depth (Y)
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="60"
                        value={towerDepthMm || ''}
                        onChange={(e) => setTowerDepthMm(Math.max(10, parseInt(e.target.value) || 10))}
                        className="saas-input text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-zinc-500 font-semibold mb-1">
                      <span>Tower Height Layer Span:</span>
                      <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{towerLayersPct}% of layers</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      step="5"
                      value={towerLayersPct}
                      onChange={(e) => setTowerLayersPct(parseInt(e.target.value))}
                      className="w-full accent-purple-600 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Output Dashboard & Tabs Column (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Total Purge Waste */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                Total Purge Waste
              </span>
              <div className="text-xl md:text-2xl font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5">
                {calc.totalWasteGrams} <span className="text-xs font-bold text-zinc-400">g</span>
              </div>
              <div className="text-[10px] font-semibold text-zinc-500 mt-1 flex items-center justify-between">
                <span>Total Loss:</span>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                  {currencySymbol}{calc.totalWasteCost}
                </span>
              </div>
            </div>

            {/* Waste-to-Model Ratio */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                Waste / Model Ratio
              </span>
              <div className={`text-xl md:text-2xl font-black font-mono mt-0.5 ${
                calc.wasteToModelRatioPct <= 50
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : calc.wasteToModelRatioPct <= 120
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-rose-600 dark:text-rose-400'
              }`}>
                {calc.wasteToModelRatioPct}%
              </div>
              <div className="text-[10px] font-semibold text-zinc-500 mt-1 flex items-center justify-between">
                <span>Model Mass:</span>
                <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                  {calc.totalModelNetGrams}g
                </span>
              </div>
            </div>

            {/* Total Spool Cost */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                Total Extrusion Cost
              </span>
              <div className="text-xl md:text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                {currencySymbol}{calc.totalPrintSpoolCost}
              </div>
              <div className="text-[10px] font-semibold text-zinc-500 mt-1 flex items-center justify-between">
                <span>Per Unit:</span>
                <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                  {currencySymbol}{calc.totalCostPerUnit}
                </span>
              </div>
            </div>

            {/* Swap Time Overhead */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                Swap Time Added
              </span>
              <div className="text-xl md:text-2xl font-black text-purple-600 dark:text-purple-400 font-mono mt-0.5">
                {calc.swapTimeFormatted}
              </div>
              <div className="text-[10px] font-semibold text-zinc-500 mt-1 flex items-center justify-between">
                <span>Swaps:</span>
                <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                  {swaps} × {swapTimeSec}s
                </span>
              </div>
            </div>
          </div>

          {/* Visual Plastic Distribution Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-2.5">
            <div className="flex justify-between items-center text-xs font-bold text-zinc-700 dark:text-zinc-300">
              <span className="flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-indigo-500" />
                Filament Mass Distribution Breakdown
              </span>
              <span className="font-mono text-zinc-500">
                Total: {calc.totalFilamentUsedGrams}g ({calc.totalFilamentUsedKg} kg)
              </span>
            </div>

            {/* Progress Segment Bar */}
            <div className="w-full h-4 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex shadow-inner">
              {/* Useful Model Mass */}
              <div
                style={{ width: `${Math.max(2, (calc.totalModelNetGrams / Math.max(1, calc.totalFilamentUsedGrams)) * 100)}%` }}
                className="h-full bg-emerald-500 transition-all duration-300"
                title={`Useful Model: ${calc.totalModelNetGrams}g (${((calc.totalModelNetGrams / calc.totalFilamentUsedGrams) * 100).toFixed(1)}%)`}
              />
              {/* Poop Chute Waste */}
              <div
                style={{ width: `${Math.max(2, (calc.netPoopGrams / Math.max(1, calc.totalFilamentUsedGrams)) * 100)}%` }}
                className="h-full bg-amber-500 transition-all duration-300"
                title={`Poop Chute: ${calc.netPoopGrams}g (${((calc.netPoopGrams / calc.totalFilamentUsedGrams) * 100).toFixed(1)}%)`}
              />
              {/* Prime Tower */}
              {primeTowerEnabled && (
                <div
                  style={{ width: `${Math.max(2, (calc.primeTowerGrams / Math.max(1, calc.totalFilamentUsedGrams)) * 100)}%` }}
                  className="h-full bg-purple-500 transition-all duration-300"
                  title={`Prime Tower: ${calc.primeTowerGrams}g (${((calc.primeTowerGrams / calc.totalFilamentUsedGrams) * 100).toFixed(1)}%)`}
                />
              )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-between text-[11px] font-semibold pt-1 gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-zinc-600 dark:text-zinc-300">Model Plastic:</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-white">{calc.totalModelNetGrams}g</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-zinc-600 dark:text-zinc-300">Poop Waste:</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{calc.netPoopGrams}g</span>
              </div>

              {primeTowerEnabled && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span className="text-zinc-600 dark:text-zinc-300">Prime Tower:</span>
                  <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{calc.primeTowerGrams}g</span>
                </div>
              )}

              {calc.absorbedGrams > 0 && (
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="w-3 h-3" />
                  <span>Infill Absorbed: <b>{calc.absorbedGrams}g Saved</b></span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-zinc-200 dark:border-zinc-800 space-x-1 overflow-x-auto pb-1 text-xs font-bold">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-3 py-2 rounded-t-xl transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === 'calculator'
                  ? 'bg-white dark:bg-zinc-900 border-t-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Batch Scaling Matrix</span>
            </button>

            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-3 py-2 rounded-t-xl transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === 'matrix'
                  ? 'bg-white dark:bg-zinc-900 border-t-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Color Transition Matrix</span>
            </button>

            <button
              onClick={() => setActiveTab('playbook')}
              className={`px-3 py-2 rounded-t-xl transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === 'playbook'
                  ? 'bg-white dark:bg-zinc-900 border-t-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Slicer Waste Reduction Playbook</span>
            </button>

            <button
              onClick={() => setActiveTab('farm')}
              className={`px-3 py-2 rounded-t-xl transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === 'farm'
                  ? 'bg-white dark:bg-zinc-900 border-t-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Farm Economics & Eco Impact</span>
            </button>
          </div>

          {/* TAB 1: BATCH SCALING MATRIX */}
          {activeTab === 'calculator' && (
            <div className="p-5 saas-card space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                    Batch Plate Multiplier Savings (1 to 16 Copies)
                  </h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Because all copies share the same layer swaps and prime tower, purge waste per unit drops exponentially!
                  </p>
                </div>
              </div>

              {/* Batch Table */}
              <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/80 text-zinc-500 font-bold border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="p-2.5">Batch Qty</th>
                      <th className="p-2.5">Model Mass</th>
                      <th className="p-2.5">Waste / Unit</th>
                      <th className="p-2.5">Waste Ratio</th>
                      <th className="p-2.5">Cost / Piece</th>
                      <th className="p-2.5 text-right">Waste Reduction</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-mono">
                    {calc.batchScales.map((b) => {
                      const isCurrent = batchQuantity === b.qty;
                      return (
                        <tr
                          key={b.qty}
                          onClick={() => setBatchQuantity(b.qty)}
                          className={`cursor-pointer transition-colors ${
                            isCurrent
                              ? 'bg-indigo-50/70 dark:bg-indigo-950/40 font-bold text-indigo-900 dark:text-indigo-200'
                              : 'hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300'
                          }`}
                        >
                          <td className="p-2.5 flex items-center gap-1.5 font-sans font-bold">
                            {isCurrent && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                            <span>{b.qty} {b.qty === 1 ? 'copy' : 'copies'}</span>
                          </td>
                          <td className="p-2.5">{b.modelGrams}g</td>
                          <td className="p-2.5 font-bold text-amber-600 dark:text-amber-400">{b.wastePerPieceGrams}g</td>
                          <td className="p-2.5">{b.wasteRatioPct}%</td>
                          <td className="p-2.5 font-bold text-zinc-900 dark:text-white">
                            {currencySymbol}{b.costPerPiece}
                          </td>
                          <td className="p-2.5 text-right">
                            {b.savingsVsSinglePct > 0 ? (
                              <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                                -{b.savingsVsSinglePct}% Waste
                              </span>
                            ) : (
                              <span className="text-zinc-400 text-[10px]">Baseline</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Key Insight Box */}
              <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-800/40 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <b>Pro Tip:</b> Never print a single tiny multi-color object alone. By printing <b>6 to 8 copies</b> on the build plate, your purge waste per item drops by over <b>80%</b> without adding a single extra filament swap!
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: COLOR TRANSITION MATRIX */}
          {activeTab === 'matrix' && (
            <div className="p-5 saas-card space-y-4">
              <div className="pb-2 border-b border-zinc-100 dark:border-zinc-800">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  Bambu Studio / PrusaSlicer Color Contrast Transition Matrix
                </h4>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Flush volumes (in mm³) needed between colors to eliminate color bleeding
                </p>
              </div>

              {/* Transition Matrix Grid */}
              <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-center text-[11px] border-collapse font-mono">
                  <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold">
                    <tr>
                      <th className="p-2 text-left font-sans text-xs">From \ To</th>
                      {STANDARD_COLORS.slice(0, 6).map((c) => (
                        <th key={c.id} className="p-2">
                          <div className="flex items-center justify-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full border border-zinc-300" style={{ backgroundColor: c.hex }} />
                            <span>{c.name.split(' ')[0]}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {STANDARD_COLORS.slice(0, 6).map((fromC) => (
                      <tr key={fromC.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40">
                        <td className="p-2 text-left font-sans font-bold flex items-center gap-1.5 text-zinc-800 dark:text-zinc-200">
                          <span className="w-2.5 h-2.5 rounded-full border border-zinc-300" style={{ backgroundColor: fromC.hex }} />
                          <span>{fromC.name}</span>
                        </td>
                        {STANDARD_COLORS.slice(0, 6).map((toC) => {
                          if (fromC.id === toC.id) {
                            return <td key={toC.id} className="p-2 text-zinc-300 dark:text-zinc-700 bg-zinc-50 dark:bg-zinc-900">-</td>;
                          }
                          const brightnessDiff = toC.brightness - fromC.brightness;
                          let baseFlush = 240;
                          if (brightnessDiff > 40) {
                            baseFlush = 580;
                          } else if (brightnessDiff > 15) {
                            baseFlush = 380;
                          } else if (brightnessDiff < -40) {
                            baseFlush = 130;
                          } else if (brightnessDiff < -15) {
                            baseFlush = 180;
                          }

                          const tunedFlush = Math.round(baseFlush * flushMultiplier);
                          const isHighRisk = tunedFlush >= 450;
                          const isLowFlush = tunedFlush <= 180;

                          return (
                            <td
                              key={toC.id}
                              className={`p-2 font-bold ${
                                isHighRisk
                                  ? 'text-rose-600 dark:text-rose-400 bg-rose-50/30 dark:bg-rose-950/20'
                                  : isLowFlush
                                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20'
                                    : 'text-zinc-700 dark:text-zinc-300'
                              }`}
                            >
                              {tunedFlush}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] pt-1">
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-300">
                  <span className="font-bold block">🔴 Dark-to-Light Flush (500-700 mm³)</span>
                  Black/Red to White/Yellow requires maximum flush to eliminate dirty color tinting.
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                  <span className="font-bold block">🟢 Light-to-Dark Flush (120-180 mm³)</span>
                  White/Yellow to Black can be aggressively reduced to 120mm³ with zero bleed.
                </div>
                <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-800 dark:text-indigo-300">
                  <span className="font-bold block">🟣 Slicer Multiplier Slider</span>
                  Adjust the global slider in Settings to scale this entire matrix simultaneously!
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OPTIMIZATION PLAYBOOK */}
          {activeTab === 'playbook' && (
            <div className="p-5 saas-card space-y-4">
              <div className="pb-2 border-b border-zinc-100 dark:border-zinc-800">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  Top 5 Multi-Color Waste Reduction Strategies
                </h4>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Proven techniques in Bambu Studio, OrcaSlicer, and PrusaSlicer to cut poop waste by up to 75%
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-900 dark:text-white">1. Enable "Flush into Objects Infill & Supports"</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                      Saves 25-45% Waste
                    </span>
                  </div>
                  <p className="text-zinc-500 dark:text-zinc-400 text-[11px] leading-relaxed">
                    In Bambu Studio / OrcaSlicer, right click your model $\to$ <b>Flush Options</b> $\to$ Check <i>Flush into this object's infill</i> and <i>Flush into this object's support</i>. The purged material is deposited inside the infill cavity rather than shot into the poop chute!
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-900 dark:text-white">2. Auto-Calculate Flush Volumes with 0.6x Multiplier</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                      Saves 35-50% Waste
                    </span>
                  </div>
                  <p className="text-zinc-500 dark:text-zinc-400 text-[11px] leading-relaxed">
                    Default slicer flush volumes are overly conservative (often 250-400 mm³ for every swap). In Bambu Studio, click <b>Flushing Volumes</b> $\to$ set <b>Multiplier to 0.60</b> $\to$ click <b>Auto-Calculate</b>. This keeps dark-to-light safe while slashing light-to-dark flush waste.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-900 dark:text-white">3. Purge-to-Object (Sacrificial Secondary Model)</span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-[10px]">
                      Turns Waste into Useful Items
                    </span>
                  </div>
                  <p className="text-zinc-500 dark:text-zinc-400 text-[11px] leading-relaxed">
                    Place a functional print (like a tool holder, fidget toy, or gridfinity bin) on the plate. Set its flush property to <b>Flush into this object</b>. All color swaps will build the secondary model, giving you a free rainbow colored utility print instead of unusable waste plastic!
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-900 dark:text-white">4. Align Colors Horizontally (Orientation Optimization)</span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-[10px]">
                      Reduces Swaps by 50-80%
                    </span>
                  </div>
                  <p className="text-zinc-500 dark:text-zinc-400 text-[11px] leading-relaxed">
                    If colors run vertically from top to bottom (like a sign or badge), lay the model flat on the bed. When color boundaries span only 2 or 3 Z-layers instead of 400 layers, total swaps drop from 400 down to just 2!
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-900 dark:text-white">5. Minimize Prime Tower Dimensions</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[10px]">
                      Saves 15-30g per print
                    </span>
                  </div>
                  <p className="text-zinc-500 dark:text-zinc-400 text-[11px] leading-relaxed">
                    Reduce prime tower width from 35mm to 15-20mm, and enable <i>Prime tower only on layers with tool changes</i>. This prevents the printer from extruding a full solid column through tall single-color sections.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FARM ECONOMICS & ECO IMPACT */}
          {activeTab === 'farm' && (
            <div className="p-5 saas-card space-y-4">
              <div className="pb-2 border-b border-zinc-100 dark:border-zinc-800">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  Commercial Print Farm Waste Economics & Sustainability
                </h4>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Annual financial drain from multi-color purge scrap and recycling ROI
                </p>
              </div>

              {/* Monthly / Annual Farm Drain Calculator */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Single Print Waste</span>
                  <div className="text-base font-black text-rose-600 dark:text-rose-400 font-mono mt-0.5">
                    {currencySymbol}{calc.totalWasteCost}
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-0.5">{calc.totalWasteGrams}g wasted</p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Monthly Farm Drain (30 Prints)</span>
                  <div className="text-base font-black text-rose-600 dark:text-rose-400 font-mono mt-0.5">
                    {currencySymbol}{(calc.totalWasteCost * 30).toLocaleString()}
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-0.5">{(calc.totalWasteGrams * 30 / 1000).toFixed(1)} kg scrap plastic</p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Annual Farm Loss (365 Prints)</span>
                  <div className="text-base font-black text-rose-600 dark:text-rose-400 font-mono mt-0.5">
                    {currencySymbol}{(calc.totalWasteCost * 365).toLocaleString()}
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-0.5">{(calc.totalWasteGrams * 365 / 1000).toFixed(1)} kg scrap plastic</p>
                </div>
              </div>

              {/* Environmental / Carbon Footprint Banner */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                  <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Environmental Carbon Footprint Estimate</span>
                </div>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
                  Every 1 kg of extruded PLA emits approximately <b>{material.co2Factor} kg CO₂e</b> in industrial production and transport. This single print's purge waste generates approximately <b>{calc.carbonFootprintWasteKg} kg CO₂e</b> of non-recyclable thermoplastic waste.
                </p>
              </div>

              {/* Filament Recycler / Pellet Extruder ROI */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-800/40 space-y-2 text-xs">
                <span className="font-bold text-indigo-900 dark:text-indigo-200 block">
                  Filament Shredder & Pellet Extruder ROI (e.g. Filabot / Felfil / Artme 3D)
                </span>
                <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                  If your print farm generates more than <b>15 kg of purge poop monthly</b> (approx. ₹25,000+ in waste), investing in a desktop filament pellet extruder can recycle your clean PLA/PETG poop into recycled test spools with an estimated payback period of <b>8 to 14 months</b>.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

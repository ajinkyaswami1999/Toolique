import { useState, useEffect, useMemo } from 'react';
import {
  Ruler, Copy, Check, RotateCcw, Printer,
  Layers, ShieldCheck, Box, MessageCircle,
  Truck, DollarSign, Calculator
} from 'lucide-react';
import { getStoredRates, saveStoredRates, DEFAULT_CIVIL_RATES } from '../data/civilRatesData';
import MaterialTrendGraph from '../components/MaterialTrendGraph';
import { jsPDF } from 'jspdf';

// Structural Elements Definition
export type ElementType = 'slab' | 'footing' | 'column_rect' | 'column_round' | 'beam' | 'wall' | 'stairs' | 'direct';

interface MixRatio {
  name: string;
  grade: string;
  cement: number;
  sand: number;
  aggregate: number;
  strengthMpa: number;
  waterRatio: number; // liters per bag
  recommendedFor: string;
}

const MIX_RATIOS: Record<string, MixRatio> = {
  M5: {
    name: 'M5 (1:5:10)',
    grade: 'M5',
    cement: 1,
    sand: 5,
    aggregate: 10,
    strengthMpa: 5,
    waterRatio: 30,
    recommendedFor: 'Levelling course, sub-base blinding'
  },
  M75: {
    name: 'M7.5 (1:4:8)',
    grade: 'M7.5',
    cement: 1,
    sand: 4,
    aggregate: 8,
    strengthMpa: 7.5,
    waterRatio: 28,
    recommendedFor: 'Mass foundation bed, non-structural paving'
  },
  M10: {
    name: 'M10 (1:3:6)',
    grade: 'M10',
    cement: 1,
    sand: 3,
    aggregate: 6,
    strengthMpa: 10,
    waterRatio: 26,
    recommendedFor: 'PCC foundations, bed concrete under masonry'
  },
  M15: {
    name: 'M15 (1:2:4)',
    grade: 'M15',
    cement: 1,
    sand: 2,
    aggregate: 4,
    strengthMpa: 15,
    waterRatio: 25,
    recommendedFor: 'Plain flooring, small pathways, light slabs'
  },
  M20: {
    name: 'M20 (1:1.5:3)',
    grade: 'M20',
    cement: 1,
    sand: 1.5,
    aggregate: 3,
    strengthMpa: 20,
    waterRatio: 24,
    recommendedFor: 'Standard RCC (Roof slabs, beams, columns, staircases)'
  },
  M25: {
    name: 'M25 (1:1:2)',
    grade: 'M25',
    cement: 1,
    sand: 1,
    aggregate: 2,
    strengthMpa: 25,
    waterRatio: 22.5,
    recommendedFor: 'Heavy load columns, raft foundations, water retaining tanks'
  },
  M30: {
    name: 'M30 (1:0.75:1.5)',
    grade: 'M30',
    cement: 1,
    sand: 0.75,
    aggregate: 1.5,
    strengthMpa: 30,
    waterRatio: 20,
    recommendedFor: 'Commercial multi-storey framing, pre-stressed elements'
  }
};

const STEEL_DENSITY_PRESETS: Record<ElementType, number> = {
  slab: 70,        // kg/m3 (~0.89% vol)
  footing: 65,     // kg/m3 (~0.83% vol)
  column_rect: 180,// kg/m3 (~2.29% vol)
  column_round: 190,// kg/m3 (~2.42% vol)
  beam: 120,       // kg/m3 (~1.53% vol)
  wall: 85,        // kg/m3 (~1.08% vol)
  stairs: 90,      // kg/m3 (~1.15% vol)
  direct: 80
};

export default function ConcreteCalculator() {
  // Navigation & Form Modes
  const [elementType, setElementType] = useState<ElementType>('slab');
  const [unit, setUnit] = useState<'ft' | 'm'>('ft');
  const [mix, setMix] = useState<string>('M20');
  const [wastage, setWastage] = useState<number>(5);
  const [copied, setCopied] = useState<boolean>(false);

  // Structural Dimensions (Default Imperial ft / in)
  const [length, setLength] = useState<number>(20);
  const [width, setWidth] = useState<number>(15);
  const [thickness, setThickness] = useState<number>(5); // inches (or cm in metric)
  const [depth, setDepth] = useState<number>(3); // for footings / beams
  const [height, setHeight] = useState<number>(10); // for columns / walls
  const [diameter, setDiameter] = useState<number>(12); // inches for round column
  const [quantity, setQuantity] = useState<number>(1);
  
  // Stairs specific
  const [stepCount, setStepCount] = useState<number>(12);
  const [stepTread, setStepTread] = useState<number>(10); // inches / cm
  const [stepRiser, setStepRiser] = useState<number>(6);  // inches / cm
  const [waistThickness, setWaistThickness] = useState<number>(5); // inches / cm

  // Direct Volume input mode
  const [directVol, setDirectVol] = useState<number>(10);
  const [directVolUnit, setDirectVolUnit] = useState<'m3' | 'cuft' | 'brass'>('cuft');

  // Reinforcement Steel (RCC) Options
  const [includeSteel, setIncludeSteel] = useState<boolean>(true);
  const [steelDensity, setSteelDensity] = useState<number>(70); // kg/m3

  // Chemical Admixture & Aggregate Split
  const [includeAdmixture, setIncludeAdmixture] = useState<boolean>(true);
  const [aggregateSplit, setAggregateSplit] = useState<boolean>(true); // 60% 20mm + 40% 10mm

  // Live Civil Material Rates
  const [prices, setPrices] = useState(getStoredRates());
  const [admixtureRate, setAdmixtureRate] = useState<number>(140); // ₹/liter

  // Project Info for Quotation
  const [projectName, setProjectName] = useState<string>('Residential RCC Slab Pour');
  const [clientName, setClientName] = useState<string>('Site Engineer / Contractor');

  // Real-time syncing with civil storage
  useEffect(() => {
    const handleStorage = () => {
      setPrices(getStoredRates());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Update steel density when element changes
  useEffect(() => {
    setSteelDensity(STEEL_DENSITY_PRESETS[elementType] || 80);
  }, [elementType]);

  // Comprehensive Mathematical Results Memo
  const results = useMemo(() => {
    let rawWetVolumeM3 = 0;
    let shutteringAreaSqFt = 0;

    // 1. Calculate Geometric Wet Volume in m³ based on element type
    if (elementType === 'direct') {
      if (directVolUnit === 'm3') {
        rawWetVolumeM3 = directVol;
      } else if (directVolUnit === 'cuft') {
        rawWetVolumeM3 = directVol * 0.0283168;
      } else {
        // Brass: 1 Brass = 100 cu ft = 2.83168 m3
        rawWetVolumeM3 = directVol * 2.83168;
      }
      shutteringAreaSqFt = rawWetVolumeM3 * 35.3147 * 0.8; // estimated
    } else if (unit === 'ft') {
      // Imperial Mode
      if (elementType === 'slab') {
        const l_m = length * 0.3048;
        const w_m = width * 0.3048;
        const t_m = (thickness / 12) * 0.3048;
        rawWetVolumeM3 = l_m * w_m * t_m;
        shutteringAreaSqFt = (length * width) + (2 * (length + width) * (thickness / 12));
      } else if (elementType === 'footing') {
        const l_m = length * 0.3048;
        const w_m = width * 0.3048;
        const d_m = depth * 0.3048;
        rawWetVolumeM3 = l_m * w_m * d_m * quantity;
        shutteringAreaSqFt = 2 * (length + width) * depth * quantity;
      } else if (elementType === 'column_rect') {
        const l_m = (length / 12) * 0.3048;
        const w_m = (width / 12) * 0.3048;
        const h_m = height * 0.3048;
        rawWetVolumeM3 = l_m * w_m * h_m * quantity;
        shutteringAreaSqFt = 2 * ((length / 12) + (width / 12)) * height * quantity;
      } else if (elementType === 'column_round') {
        const r_m = ((diameter / 12) / 2) * 0.3048;
        const h_m = height * 0.3048;
        rawWetVolumeM3 = Math.PI * Math.pow(r_m, 2) * h_m * quantity;
        shutteringAreaSqFt = Math.PI * (diameter / 12) * height * quantity;
      } else if (elementType === 'beam') {
        const l_m = length * 0.3048;
        const w_m = (width / 12) * 0.3048;
        const d_m = (depth / 12) * 0.3048;
        rawWetVolumeM3 = l_m * w_m * d_m * quantity;
        shutteringAreaSqFt = ((2 * (depth / 12)) + (width / 12)) * length * quantity;
      } else if (elementType === 'wall') {
        const l_m = length * 0.3048;
        const h_m = height * 0.3048;
        const t_m = (thickness / 12) * 0.3048;
        rawWetVolumeM3 = l_m * h_m * t_m * quantity;
        shutteringAreaSqFt = 2 * (length * height) * quantity;
      } else if (elementType === 'stairs') {
        const w_m = width * 0.3048;
        const t_m = (stepTread / 12) * 0.3048;
        const r_m = (stepRiser / 12) * 0.3048;
        const waist_m = (waistThickness / 12) * 0.3048;
        const stepsVol = stepCount * (0.5 * t_m * r_m) * w_m;
        const totalHorizontal = stepCount * t_m;
        const totalVertical = stepCount * r_m;
        const inclinedFlightLength = Math.sqrt(Math.pow(totalHorizontal, 2) + Math.pow(totalVertical, 2));
        const waistVol = inclinedFlightLength * w_m * waist_m;
        rawWetVolumeM3 = (stepsVol + waistVol) * quantity;
        shutteringAreaSqFt = (inclinedFlightLength * width * 3.28084) + (stepCount * (stepRiser / 12) * width);
      }
    } else {
      // Metric Mode (m, cm)
      if (elementType === 'slab') {
        rawWetVolumeM3 = length * width * (thickness / 100);
        shutteringAreaSqFt = ((length * width) + (2 * (length + width) * (thickness / 100))) * 10.7639;
      } else if (elementType === 'footing') {
        rawWetVolumeM3 = length * width * depth * quantity;
        shutteringAreaSqFt = 2 * (length + width) * depth * quantity * 10.7639;
      } else if (elementType === 'column_rect') {
        rawWetVolumeM3 = (length / 100) * (width / 100) * height * quantity;
        shutteringAreaSqFt = 2 * ((length / 100) + (width / 100)) * height * quantity * 10.7639;
      } else if (elementType === 'column_round') {
        const r_m = (diameter / 100) / 2;
        rawWetVolumeM3 = Math.PI * Math.pow(r_m, 2) * height * quantity;
        shutteringAreaSqFt = Math.PI * (diameter / 100) * height * quantity * 10.7639;
      } else if (elementType === 'beam') {
        rawWetVolumeM3 = length * (width / 100) * (depth / 100) * quantity;
        shutteringAreaSqFt = ((2 * (depth / 100)) + (width / 100)) * length * quantity * 10.7639;
      } else if (elementType === 'wall') {
        rawWetVolumeM3 = length * height * (thickness / 100) * quantity;
        shutteringAreaSqFt = 2 * (length * height) * quantity * 10.7639;
      } else if (elementType === 'stairs') {
        const w_m = width;
        const t_m = stepTread / 100;
        const r_m = stepRiser / 100;
        const waist_m = waistThickness / 100;
        const stepsVol = stepCount * (0.5 * t_m * r_m) * w_m;
        const totalHorizontal = stepCount * t_m;
        const totalVertical = stepCount * r_m;
        const inclinedFlightLength = Math.sqrt(Math.pow(totalHorizontal, 2) + Math.pow(totalVertical, 2));
        const waistVol = inclinedFlightLength * w_m * waist_m;
        rawWetVolumeM3 = (stepsVol + waistVol) * quantity;
        shutteringAreaSqFt = ((inclinedFlightLength * w_m) + (stepCount * r_m * w_m)) * 10.7639;
      }
    }

    // 2. Add Wastage Buffer
    const wetVolumeM3 = rawWetVolumeM3 * (1 + wastage / 100);
    const wetVolumeCuFt = wetVolumeM3 * 35.3147;
    const wetVolumeBrass = wetVolumeCuFt / 100;

    // 3. Dry Volume (1.54 shrinkage multiplier for voids compensation)
    const dryVolumeM3 = wetVolumeM3 * 1.54;
    const dryVolumeCuFt = dryVolumeM3 * 35.3147;

    // 4. Mix Proportion Partitions
    const ratio = MIX_RATIOS[mix] || MIX_RATIOS.M20;
    const totalParts = ratio.cement + ratio.sand + ratio.aggregate;

    const cementVolM3 = (ratio.cement / totalParts) * dryVolumeM3;
    const sandVolM3 = (ratio.sand / totalParts) * dryVolumeM3;
    const aggVolM3 = (ratio.aggregate / totalParts) * dryVolumeM3;

    // 5. Quantity Breakdown
    // 1 Bag Cement = 50kg = 0.03472 m3
    const cementBags = Math.ceil(cementVolM3 / 0.03472);
    const cementWeightKg = cementBags * 50;
    const cementWeightTonnes = cementWeightKg / 1000;

    // Sand: CuFt, Brass, and Weight in Tonnes (density ~1600 kg/m3 = 1.6 tonnes/m3)
    const sandCuFt = Number((sandVolM3 * 35.3147).toFixed(2));
    const sandBrass = Number((sandCuFt / 100).toFixed(2));
    const sandTonnes = Number((sandVolM3 * 1.6).toFixed(2));

    // Aggregate: CuFt, Brass, and Weight in Tonnes (density ~1500 kg/m3 = 1.5 tonnes/m3)
    const aggCuFt = Number((aggVolM3 * 35.3147).toFixed(2));
    const aggBrass = Number((aggCuFt / 100).toFixed(2));
    const aggTonnes = Number((aggVolM3 * 1.5).toFixed(2));

    // Aggregate Split (60% 20mm + 40% 10mm)
    const agg20mmCuFt = Number((aggCuFt * 0.6).toFixed(2));
    const agg10mmCuFt = Number((aggCuFt * 0.4).toFixed(2));

    // Water Requirement (~24 liters per bag of cement)
    const waterLiters = Math.round(cementBags * ratio.waterRatio);

    // Chemical Admixture (~0.20 Liters per 50kg bag)
    const admixtureLiters = includeAdmixture ? Number((cementBags * 0.20).toFixed(1)) : 0;

    // Steel Reinforcement Calculation
    let steelWeightKg = 0;
    let bindingWireKg = 0;
    if (includeSteel) {
      steelWeightKg = Math.round(wetVolumeM3 * steelDensity);
      bindingWireKg = Math.ceil(steelWeightKg * 0.01); // 1kg wire per 100kg steel
    }
    const steelTonnes = Number((steelWeightKg / 1000).toFixed(2));

    // RMC Transit Mixer Trucks Required (6m3 & 7m3 capacity)
    const rmcMixer6m3Trucks = Math.ceil(wetVolumeM3 / 6);
    const rmcMixer7m3Trucks = Math.ceil(wetVolumeM3 / 7);

    // 6. Cost Estimations
    const cementCost = cementBags * (prices.cement || DEFAULT_CIVIL_RATES.cement);
    const sandCost = sandCuFt * (prices.sand || DEFAULT_CIVIL_RATES.sand);
    const aggregateCost = aggCuFt * (prices.aggregate || DEFAULT_CIVIL_RATES.aggregate);
    const steelCost = steelWeightKg * (prices.steel || DEFAULT_CIVIL_RATES.steel);
    const shutteringCost = Math.round(shutteringAreaSqFt * (prices.shuttering || DEFAULT_CIVIL_RATES.shuttering));
    const admixtureCost = Math.round(admixtureLiters * admixtureRate);
    const waterCost = Math.round(waterLiters * 0.15); // ~₹0.15/L tanker water

    const materialSubtotal = cementCost + sandCost + aggregateCost + admixtureCost + waterCost;
    const totalWithSteelAndShuttering = materialSubtotal + steelCost + shutteringCost;

    // RMC Comparison Cost
    const rmcTotalCost = Math.round(wetVolumeM3 * (prices.concreteMix || DEFAULT_CIVIL_RATES.concreteMix));

    return {
      wetVolumeM3: Number(wetVolumeM3.toFixed(3)),
      wetVolumeCuFt: Number(wetVolumeCuFt.toFixed(2)),
      wetVolumeBrass: Number(wetVolumeBrass.toFixed(2)),
      dryVolumeM3: Number(dryVolumeM3.toFixed(3)),
      dryVolumeCuFt: Number(dryVolumeCuFt.toFixed(2)),
      shutteringAreaSqFt: Math.round(shutteringAreaSqFt),
      cementBags,
      cementWeightKg,
      cementWeightTonnes,
      sandCuFt,
      sandBrass,
      sandTonnes,
      aggCuFt,
      aggBrass,
      aggTonnes,
      agg20mmCuFt,
      agg10mmCuFt,
      waterLiters,
      admixtureLiters,
      steelWeightKg,
      steelTonnes,
      bindingWireKg,
      rmcMixer6m3Trucks,
      rmcMixer7m3Trucks,
      cementCost,
      sandCost,
      aggregateCost,
      steelCost,
      shutteringCost,
      admixtureCost,
      waterCost,
      materialSubtotal,
      totalCost: totalWithSteelAndShuttering,
      rmcTotalCost
    };
  }, [
    elementType, unit, mix, wastage, length, width, thickness, depth, height,
    diameter, quantity, stepCount, stepTread, stepRiser, waistThickness,
    directVol, directVolUnit, includeSteel, steelDensity, includeAdmixture,
    prices, admixtureRate
  ]);

  const handlePriceChange = (key: keyof typeof DEFAULT_CIVIL_RATES, val: number) => {
    const updatedPrices = { ...prices, [key]: val };
    setPrices(updatedPrices);
    saveStoredRates({ [key]: val });
  };

  const handleReset = () => {
    setLength(20);
    setWidth(15);
    setThickness(5);
    setDepth(3);
    setHeight(10);
    setDiameter(12);
    setQuantity(1);
    setMix('M20');
    setWastage(5);
    setElementType('slab');
    setPrices(DEFAULT_CIVIL_RATES);
    saveStoredRates(DEFAULT_CIVIL_RATES);
  };

  // WhatsApp Site Report Share
  const handleShareWhatsApp = () => {
    const text = `*CONCRETE MATERIAL INDENT & BOQ* 🏗️
*Project:* ${projectName} (${clientName})
*Structural Member:* ${elementType.toUpperCase()} (${quantity} unit)
*Grade:* ${MIX_RATIOS[mix].name}
*Wet Volume:* ${results.wetVolumeM3} m³ (${results.wetVolumeCuFt} cu.ft / ${results.wetVolumeBrass} Brass)

📦 *REQUIRED MATERIALS:*
• *Cement:* ${results.cementBags} Bags (50kg) - ₹${results.cementCost.toLocaleString('en-IN')}
• *Sand:* ${results.sandCuFt} cu.ft (${results.sandBrass} Brass / ${results.sandTonnes} T) - ₹${results.sandCost.toLocaleString('en-IN')}
• *Aggregate:* ${results.aggCuFt} cu.ft (${results.aggBrass} Brass / ${results.aggTonnes} T) - ₹${results.aggregateCost.toLocaleString('en-IN')}
${aggregateSplit ? `  ↳ 20mm Jelly: ${results.agg20mmCuFt} cu.ft\n  ↳ 10mm Grit: ${results.agg10mmCuFt} cu.ft\n` : ''}• *Water Req.:* ~${results.waterLiters} Liters
${includeAdmixture ? `• *Waterproofing Admixture:* ${results.admixtureLiters} Liters\n` : ''}${includeSteel ? `• *Steel Rebar:* ${results.steelWeightKg} kg (${results.steelTonnes} Tonnes) - ₹${results.steelCost.toLocaleString('en-IN')}\n• *Binding Wire:* ${results.bindingWireKg} kg\n` : ''}
💰 *TOTAL ESTIMATED COST:* *₹${results.totalCost.toLocaleString('en-IN')}*
🚚 *RMC Transit Mixers Needed:* ~${results.rmcMixer6m3Trucks} Trucks (6 m³ each)

Generated on *Toolique Civil Engineering Studio* (www.toolique.in/calculators/concrete-calculator)`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Copy Clipboard Text
  const copyReport = () => {
    const text = `--- CONCRETE MATERIAL ESTIMATION BOQ ---
Project: ${projectName} (${clientName})
Element: ${elementType.toUpperCase()} | Mix Grade: ${MIX_RATIOS[mix].name}
Total Wet Volume: ${results.wetVolumeM3} m³ (${results.wetVolumeCuFt} cu.ft | ${results.wetVolumeBrass} Brass)
Dry Shrinkage Volume (1.54x): ${results.dryVolumeM3} m³
Wastage Buffer: ${wastage}%

--- MATERIAL BREAKDOWN ---
1. Cement: ${results.cementBags} Bags (50 kg) = ₹${results.cementCost.toLocaleString('en-IN')} (@ ₹${prices.cement}/bag)
2. Sand: ${results.sandCuFt} cu.ft (${results.sandBrass} Brass) = ₹${results.sandCost.toLocaleString('en-IN')} (@ ₹${prices.sand}/cu.ft)
3. Coarse Aggregate: ${results.aggCuFt} cu.ft (${results.aggBrass} Brass) = ₹${results.aggregateCost.toLocaleString('en-IN')} (@ ₹${prices.aggregate}/cu.ft)
${aggregateSplit ? `   - 20mm Aggregate: ${results.agg20mmCuFt} cu.ft\n   - 10mm Aggregate: ${results.agg10mmCuFt} cu.ft\n` : ''}4. Water Required: ~${results.waterLiters} Liters
${includeAdmixture ? `5. Integral Waterproofing Admixture: ${results.admixtureLiters} Liters (@ ₹${admixtureRate}/L)\n` : ''}${includeSteel ? `6. Steel Rebar Reinforcement: ${results.steelWeightKg} kg = ₹${results.steelCost.toLocaleString('en-IN')} (@ ₹${prices.steel}/kg)\n   - Binding Wire: ${results.bindingWireKg} kg\n` : ''}7. Shuttering / Formwork Area: ${results.shutteringAreaSqFt} sq.ft = ₹${results.shutteringCost.toLocaleString('en-IN')}

TOTAL PROJECT COST: ₹${results.totalCost.toLocaleString('en-IN')}
Ready-Mix Concrete (RMC) Alternative: ₹${results.rmcTotalCost.toLocaleString('en-IN')} (~${results.rmcMixer6m3Trucks} transit trucks of 6m³)
Calculated via Toolique Civil Engineering Studio.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export PDF BOQ Sheet
  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      const primaryColor = [79, 70, 229]; // Indigo
      const darkColor = [24, 24, 27];

      // Header Banner
      doc.setFillColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.rect(0, 0, 210, 36, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('CONCRETE MATERIAL INDENT & BOQ', 14, 20);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text('Civil Engineering Material Quantity Takeoff & Cost Schedule', 14, 28);

      // Metadata
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(9);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 145, 18);
      doc.text(`Ref: CC-${Date.now().toString().slice(-6)}`, 145, 25);
      doc.text(`Mix: ${MIX_RATIOS[mix].name}`, 145, 32);

      // Project Box
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.text('PROJECT & SPECIFICATION DETAILS', 14, 46);
      doc.setDrawColor(220, 220, 220);
      doc.line(14, 48, 196, 48);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text(`Project Name: ${projectName}`, 14, 55);
      doc.text(`Client / Contractor: ${clientName}`, 14, 61);
      doc.text(`Structural Member: ${elementType.toUpperCase()} (Qty: ${quantity})`, 14, 67);
      doc.text(`Mix Grade: ${MIX_RATIOS[mix].name} (Strength: ${MIX_RATIOS[mix].strengthMpa} MPa)`, 14, 73);

      doc.text(`Wet Volume: ${results.wetVolumeM3} m³ (${results.wetVolumeCuFt} cu.ft / ${results.wetVolumeBrass} Brass)`, 110, 55);
      doc.text(`Dry Volume: ${results.dryVolumeM3} m³ (${results.dryVolumeCuFt} cu.ft)`, 110, 61);
      doc.text(`Wastage Allowance: ${wastage}%`, 110, 67);
      doc.text(`Shuttering Contact Area: ${results.shutteringAreaSqFt} sq.ft`, 110, 73);

      // Total Value Banner
      doc.setFillColor(245, 247, 255);
      doc.roundedRect(14, 80, 182, 22, 2.5, 2.5, 'F');
      doc.setDrawColor(199, 210, 254);
      doc.roundedRect(14, 80, 182, 22, 2.5, 2.5, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('TOTAL ESTIMATED PROCUREMENT COST', 20, 88);
      doc.setFontSize(16);
      doc.text(`₹${results.totalCost.toLocaleString('en-IN')}`, 20, 97);

      doc.setFontSize(8.5);
      doc.setTextColor(80, 80, 80);
      doc.text(`Materials Subtotal: ₹${results.materialSubtotal.toLocaleString('en-IN')}`, 110, 89);
      if (includeSteel) doc.text(`Steel Reinforcement (${results.steelWeightKg} kg): ₹${results.steelCost.toLocaleString('en-IN')}`, 110, 96);

      // Line Items Table
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.text('MATERIAL INDENT SCHEDULE', 14, 112);
      doc.line(14, 114, 196, 114);

      let y = 122;
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
        doc.text(unitRate, 140, y);
        doc.text(total, 175, y);
        if (!isHeader) {
          doc.setDrawColor(240, 240, 240);
          doc.line(14, y + 2, 196, y + 2);
        }
        y += 8;
      };

      drawRow('MATERIAL DESCRIPTION', 'QUANTITY / PACKAGING', 'UNIT RATE', 'TOTAL', true);
      drawRow('OPC / PPC Cement (50kg bags)', `${results.cementBags} Bags (${results.cementWeightTonnes} T)`, `₹${prices.cement}/bag`, `₹${results.cementCost.toLocaleString('en-IN')}`);
      drawRow('Fine Sand (River / M-Sand)', `${results.sandCuFt} cu.ft (${results.sandBrass} Brass)`, `₹${prices.sand}/cu.ft`, `₹${results.sandCost.toLocaleString('en-IN')}`);
      drawRow('Coarse Aggregate (10mm + 20mm)', `${results.aggCuFt} cu.ft (${results.aggBrass} Brass)`, `₹${prices.aggregate}/cu.ft`, `₹${results.aggregateCost.toLocaleString('en-IN')}`);
      drawRow('Mixing & Curing Water', `~${results.waterLiters} Liters`, 'Standard Tanker', `₹${results.waterCost}`);
      
      if (includeAdmixture) {
        drawRow('Integral Waterproofing Admixture', `${results.admixtureLiters} Liters`, `₹${admixtureRate}/L`, `₹${results.admixtureCost.toLocaleString('en-IN')}`);
      }

      if (includeSteel) {
        drawRow('TMT Rebar Steel (Fe500/550)', `${results.steelWeightKg} kg (${results.steelTonnes} T)`, `₹${prices.steel}/kg`, `₹${results.steelCost.toLocaleString('en-IN')}`);
        drawRow('GI Binding Wire', `${results.bindingWireKg} kg`, 'Included', '-');
      }

      drawRow('Formwork / Shuttering Supply', `${results.shutteringAreaSqFt} sq.ft contact`, `₹${prices.shuttering}/sq.ft`, `₹${results.shutteringCost.toLocaleString('en-IN')}`);

      // Footer
      doc.setFontSize(7.5);
      doc.setTextColor(150, 150, 150);
      doc.text('Calculated strictly as per IS 456 & IS 10262 guidelines on Toolique (www.toolique.in). All material weights are site estimates.', 14, 285);

      doc.save(`Concrete_BOQ_${elementType}_${Date.now().toString().slice(-4)}.pdf`);
    } catch (e) {
      alert('Error generating PDF: ' + e);
    }
  };

  const activeRatio = MIX_RATIOS[mix] || MIX_RATIOS.M20;
  const totalParts = activeRatio.cement + activeRatio.sand + activeRatio.aggregate;
  const cementPct = (activeRatio.cement / totalParts) * 100;
  const sandPct = (activeRatio.sand / totalParts) * 100;
  const aggregatePct = (activeRatio.aggregate / totalParts) * 100;

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-left">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight">Concrete Calculator & Material BOQ</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              IS 456 Compliant
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Estimate exact cement bags, sand brass, coarse aggregate tons, water, rebar steel, and ready-mix trucks for slabs, columns, footings, and beams.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Unit Switcher */}
          <div className="flex rounded-xl bg-zinc-100 dark:bg-zinc-800/80 p-0.5 border border-zinc-200/60 dark:border-zinc-700/60 text-xs font-bold">
            <button
              onClick={() => { setUnit('ft'); setThickness(5); }}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                unit === 'ft'
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Feet / Inches
            </button>
            <button
              onClick={() => { setUnit('m'); setThickness(12.5); }}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                unit === 'm'
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Metric (Meters / cm)
            </button>
          </div>

          <button
            onClick={handleReset}
            className="saas-button-secondary text-xs flex items-center gap-1.5 cursor-pointer py-1.5 px-3"
            title="Reset parameters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Structural Element Shape Selector Chips */}
      <div className="space-y-2">
        <label className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
          Select Structural Member Geometry
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {[
            { id: 'slab', label: 'Slab / Patio', icon: Layers },
            { id: 'footing', label: 'Footing / Pad', icon: Box },
            { id: 'column_rect', label: 'Rect. Column', icon: Ruler },
            { id: 'column_round', label: 'Round Column', icon: Ruler },
            { id: 'beam', label: 'Plinth Beam', icon: Box },
            { id: 'wall', label: 'Retaining Wall', icon: Layers },
            { id: 'stairs', label: 'Staircase', icon: Layers },
            { id: 'direct', label: 'Direct Volume', icon: Calculator }
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = elementType === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setElementType(item.id as ElementType)}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-extrabold shadow-xs'
                    : 'border-zinc-200/60 dark:border-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 font-semibold'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400'}`} />
                <span className="text-[11px] leading-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Dimensions & Mix Inputs */}
        <div className="md:col-span-7 space-y-6">

          {/* 1. Dimension Inputs Box */}
          <div className="saas-card p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-800/60">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <Ruler className="w-4 h-4" />
                <span>1. {elementType.toUpperCase()} Dimensions</span>
              </h3>
              <span className="text-[10px] text-zinc-400 font-semibold">
                {unit === 'ft' ? 'Imperial Dimensions (Ft / In)' : 'Metric Dimensions (M / cm)'}
              </span>
            </div>

            {/* Direct Volume Mode */}
            {elementType === 'direct' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Input Concrete Volume</label>
                  <input
                    type="number"
                    value={directVol}
                    onChange={(e) => setDirectVol(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="saas-input text-xs font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Volume Unit</label>
                  <select
                    value={directVolUnit}
                    onChange={(e) => setDirectVolUnit(e.target.value as any)}
                    className="saas-select text-xs"
                  >
                    <option value="cuft">Cubic Feet (cu.ft / cft)</option>
                    <option value="m3">Cubic Meters (m³)</option>
                    <option value="brass">Brass (100 cu.ft)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Slab / Patio Mode */}
            {elementType === 'slab' && (
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Length ({unit})</label>
                  <input
                    type="number"
                    value={length}
                    onChange={(e) => setLength(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="saas-input text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Width ({unit})</label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="saas-input text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Thickness ({unit === 'ft' ? 'Inches' : 'cm'})</label>
                  <input
                    type="number"
                    value={thickness}
                    onChange={(e) => setThickness(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="saas-input text-xs font-bold"
                  />
                </div>
              </div>
            )}

            {/* Footing Mode */}
            {elementType === 'footing' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase">Length ({unit})</label>
                  <input
                    type="number"
                    value={length}
                    onChange={(e) => setLength(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="saas-input text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase">Width ({unit})</label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="saas-input text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase">Depth ({unit})</label>
                  <input
                    type="number"
                    value={depth}
                    onChange={(e) => setDepth(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="saas-input text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase">No. of Footings</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="saas-input text-xs font-bold"
                  />
                </div>
              </div>
            )}

            {/* Rectangular Column Mode */}
            {elementType === 'column_rect' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase">Width ({unit === 'ft' ? 'Inches' : 'cm'})</label>
                  <input
                    type="number"
                    value={length}
                    onChange={(e) => setLength(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="saas-input text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase">Depth ({unit === 'ft' ? 'Inches' : 'cm'})</label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="saas-input text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase">Height ({unit})</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="saas-input text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase">No. of Columns</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="saas-input text-xs font-bold"
                  />
                </div>
              </div>
            )}

            {/* Round Column Mode */}
            {elementType === 'column_round' && (
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Diameter ({unit === 'ft' ? 'Inches' : 'cm'})</label>
                  <input
                    type="number"
                    value={diameter}
                    onChange={(e) => setDiameter(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="saas-input text-xs font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Height ({unit})</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="saas-input text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">No. of Columns</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="saas-input text-xs font-bold"
                  />
                </div>
              </div>
            )}

            {/* Beam Mode */}
            {elementType === 'beam' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase">Length ({unit})</label>
                  <input
                    type="number"
                    value={length}
                    onChange={(e) => setLength(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="saas-input text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase">Width ({unit === 'ft' ? 'Inches' : 'cm'})</label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="saas-input text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase">Depth ({unit === 'ft' ? 'Inches' : 'cm'})</label>
                  <input
                    type="number"
                    value={depth}
                    onChange={(e) => setDepth(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="saas-input text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase">No. of Beams</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="saas-input text-xs font-bold"
                  />
                </div>
              </div>
            )}

            {/* Wall Mode */}
            {elementType === 'wall' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase">Length ({unit})</label>
                  <input
                    type="number"
                    value={length}
                    onChange={(e) => setLength(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="saas-input text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase">Height ({unit})</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="saas-input text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase">Thickness ({unit === 'ft' ? 'Inches' : 'cm'})</label>
                  <input
                    type="number"
                    value={thickness}
                    onChange={(e) => setThickness(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="saas-input text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase">No. of Walls</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="saas-input text-xs font-bold"
                  />
                </div>
              </div>
            )}

            {/* Stairs Mode */}
            {elementType === 'stairs' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase">Stair Width ({unit})</label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="saas-input text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase">No. of Steps</label>
                  <input
                    type="number"
                    min="1"
                    value={stepCount}
                    onChange={(e) => setStepCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="saas-input text-xs font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase">Tread Depth ({unit === 'ft' ? 'Inches' : 'cm'})</label>
                  <input
                    type="number"
                    value={stepTread}
                    onChange={(e) => setStepTread(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="saas-input text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase">Riser Height ({unit === 'ft' ? 'Inches' : 'cm'})</label>
                  <input
                    type="number"
                    value={stepRiser}
                    onChange={(e) => setStepRiser(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="saas-input text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase">Waist Slab ({unit === 'ft' ? 'Inches' : 'cm'})</label>
                  <input
                    type="number"
                    value={waistThickness}
                    onChange={(e) => setWaistThickness(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="saas-input text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase">No. of Flights</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="saas-input text-xs font-bold"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. Concrete Mix & Wastage Design */}
          <div className="saas-card p-6 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              <span>2. Concrete Mix Grade & Proportions</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Nominal Mix Grade (IS 456)</label>
                <select
                  value={mix}
                  onChange={(e) => setMix(e.target.value)}
                  className="saas-select text-xs font-bold"
                >
                  {Object.keys(MIX_RATIOS).map((m) => (
                    <option key={m} value={m}>
                      {MIX_RATIOS[m].name} — {MIX_RATIOS[m].strengthMpa} MPa
                    </option>
                  ))}
                </select>
                <span className="text-[9px] text-zinc-400 block pt-0.5">{MIX_RATIOS[mix].recommendedFor}</span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Wastage & Spillage Allowance (%)</label>
                <input
                  type="number"
                  min="0"
                  max="25"
                  value={wastage}
                  onChange={(e) => setWastage(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="saas-input text-xs"
                />
                <span className="text-[9px] text-zinc-400 block pt-0.5">Recommended 5% for slabs, 8% for footings</span>
              </div>
            </div>

            {/* Checkbox Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={aggregateSplit}
                  onChange={(e) => setAggregateSplit(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Split Aggregate (60% 20mm + 40% 10mm)</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeAdmixture}
                  onChange={(e) => setIncludeAdmixture(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Include Integral Waterproofing (200ml/bag)</span>
              </label>
            </div>
          </div>

          {/* 3. Steel Rebar Reinforcement Estimator */}
          <div className="saas-card p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-800/60">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>3. Steel Rebar Reinforcement (RCC)</span>
              </h3>
              <label className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSteel}
                  onChange={(e) => setIncludeSteel(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span>Include Steel</span>
              </label>
            </div>

            {includeSteel ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Structural Steel Density (kg/m³)</label>
                  <input
                    type="number"
                    value={steelDensity}
                    onChange={(e) => setSteelDensity(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="saas-input text-xs font-bold"
                  />
                  <span className="text-[9px] text-zinc-400 block pt-0.5">
                    Standard: Slabs ~70 kg/m³, Beams ~120 kg/m³, Columns ~180 kg/m³
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 space-y-1 text-xs">
                  <div className="flex justify-between font-semibold text-zinc-600 dark:text-zinc-400">
                    <span>Steel Rebar Weight:</span>
                    <strong className="text-indigo-600 dark:text-indigo-400 font-mono">{results.steelWeightKg} kg ({results.steelTonnes} T)</strong>
                  </div>
                  <div className="flex justify-between text-zinc-500">
                    <span>GI Binding Wire:</span>
                    <strong className="font-mono">{results.bindingWireKg} kg</strong>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-zinc-400">PCC (Plain Cement Concrete) mode active. Steel rebar calculation omitted.</p>
            )}
          </div>

          {/* 4. Unit Rates Editor */}
          <div className="saas-card p-6 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4" />
              <span>4. Live Construction Material Rates (₹)</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-500 uppercase">Cement (₹/bag)</label>
                <input
                  type="number"
                  value={prices.cement}
                  onChange={(e) => handlePriceChange('cement', Math.max(0, parseFloat(e.target.value) || 0))}
                  className="saas-input text-xs font-mono font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-500 uppercase">Sand (₹/cu.ft)</label>
                <input
                  type="number"
                  value={prices.sand}
                  onChange={(e) => handlePriceChange('sand', Math.max(0, parseFloat(e.target.value) || 0))}
                  className="saas-input text-xs font-mono font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-500 uppercase">Aggregate (₹/cu.ft)</label>
                <input
                  type="number"
                  value={prices.aggregate}
                  onChange={(e) => handlePriceChange('aggregate', Math.max(0, parseFloat(e.target.value) || 0))}
                  className="saas-input text-xs font-mono font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-500 uppercase">Steel Rebar (₹/kg)</label>
                <input
                  type="number"
                  value={prices.steel}
                  onChange={(e) => handlePriceChange('steel', Math.max(0, parseFloat(e.target.value) || 0))}
                  className="saas-input text-xs font-mono font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-500 uppercase">Admixture (₹/L)</label>
                <input
                  type="number"
                  value={admixtureRate}
                  onChange={(e) => setAdmixtureRate(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="saas-input text-xs font-mono font-semibold"
                />
              </div>
            </div>
          </div>

          {/* 5. Project Metadata for BOQ */}
          <div className="saas-card p-6 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <Printer className="w-4 h-4" />
              <span>5. Site Project Details for Procurement BOQ</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Project / Site Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="saas-input text-xs"
                  placeholder="e.g. Dream Villa Slab Casting"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Client / Contractor Name</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="saas-input text-xs"
                  placeholder="e.g. Apex Infra"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Sticky Material Quantities & BOQ Summary */}
        <div className="md:col-span-5 md:sticky md:top-20 space-y-6">

          {/* Main Price Card */}
          <div className="saas-card p-6 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border-indigo-500/20 space-y-5 text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-1 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-4">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">
                  TOTAL ESTIMATED COST
                </span>
                <span className="text-[10px] font-bold text-zinc-400">
                  {results.wetVolumeM3} m³ ({results.wetVolumeCuFt} cu.ft)
                </span>
              </div>

              <h2 className="text-3xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                ₹{results.totalCost.toLocaleString('en-IN')}
              </h2>

              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-semibold pt-1">
                Volume: <strong className="text-zinc-900 dark:text-zinc-100">{results.wetVolumeBrass} Brass</strong> (Dry Vol: {results.dryVolumeM3} m³)
              </div>
            </div>

            {/* Material Quantities Schedule */}
            <div className="space-y-2.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              {/* Cement */}
              <div className="flex justify-between items-center py-1 border-b border-zinc-100 dark:border-zinc-900">
                <div>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 block">Cement: {results.cementBags} Bags (50kg)</span>
                  <span className="text-[10px] text-zinc-400 font-mono">{results.cementWeightTonnes} Metric Tonnes</span>
                </div>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono">₹{results.cementCost.toLocaleString('en-IN')}</span>
              </div>

              {/* Sand */}
              <div className="flex justify-between items-center py-1 border-b border-zinc-100 dark:border-zinc-900">
                <div>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 block">Sand: {results.sandCuFt} cu.ft</span>
                  <span className="text-[10px] text-zinc-400 font-mono">{results.sandBrass} Brass ({results.sandTonnes} T)</span>
                </div>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono">₹{results.sandCost.toLocaleString('en-IN')}</span>
              </div>

              {/* Aggregate */}
              <div className="flex justify-between items-center py-1 border-b border-zinc-100 dark:border-zinc-900">
                <div>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 block">Coarse Aggregate: {results.aggCuFt} cu.ft</span>
                  <span className="text-[10px] text-zinc-400 font-mono">{results.aggBrass} Brass ({results.aggTonnes} T)</span>
                  {aggregateSplit && (
                    <span className="text-[9px] text-zinc-400 block">20mm: {results.agg20mmCuFt} cft | 10mm: {results.agg10mmCuFt} cft</span>
                  )}
                </div>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono">₹{results.aggregateCost.toLocaleString('en-IN')}</span>
              </div>

              {/* Water & Admixture */}
              <div className="flex justify-between items-center py-1 border-b border-zinc-100 dark:border-zinc-900">
                <div>
                  <span className="text-zinc-700 dark:text-zinc-300 block">Water: ~{results.waterLiters} Liters</span>
                  {includeAdmixture && <span className="text-[10px] text-zinc-400">Admixture: {results.admixtureLiters} L</span>}
                </div>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono">₹{(results.waterCost + results.admixtureCost).toLocaleString('en-IN')}</span>
              </div>

              {/* Steel */}
              {includeSteel && (
                <div className="flex justify-between items-center py-1 border-b border-zinc-100 dark:border-zinc-900 text-indigo-600 dark:text-indigo-400 font-bold">
                  <div>
                    <span className="block">Steel Rebar: {results.steelWeightKg} kg</span>
                    <span className="text-[10px] text-zinc-400">Binding Wire: {results.bindingWireKg} kg</span>
                  </div>
                  <span className="font-mono">₹{results.steelCost.toLocaleString('en-IN')}</span>
                </div>
              )}

              {/* Shuttering Formwork */}
              <div className="flex justify-between items-center py-1 border-b border-zinc-100 dark:border-zinc-900">
                <div>
                  <span className="text-zinc-700 dark:text-zinc-300 block">Formwork: {results.shutteringAreaSqFt} sq.ft</span>
                </div>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono">₹{results.shutteringCost.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Mix Map Progress Bar */}
            <div className="space-y-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
              <div className="flex justify-between text-[10px] font-bold text-zinc-400 uppercase">
                <span>Volume Distribution ({mix})</span>
                <span>Dry 1.54x factor</span>
              </div>
              <div className="w-full h-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex">
                <div className="bg-indigo-500 h-full" style={{ width: `${cementPct}%` }} title={`Cement: ${cementPct.toFixed(1)}%`} />
                <div className="bg-amber-500 h-full" style={{ width: `${sandPct}%` }} title={`Sand: ${sandPct.toFixed(1)}%`} />
                <div className="bg-zinc-500 h-full" style={{ width: `${aggregatePct}%` }} title={`Aggregate: ${aggregatePct.toFixed(1)}%`} />
              </div>
              <div className="flex justify-between text-[9px] text-zinc-400 font-medium">
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">Cement: {cementPct.toFixed(0)}%</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">Sand: {sandPct.toFixed(0)}%</span>
                <span className="text-zinc-600 dark:text-zinc-300 font-bold">Aggregate: {aggregatePct.toFixed(0)}%</span>
              </div>
            </div>

            {/* RMC Ready Mix Concrete Insight */}
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 space-y-1.5 text-xs">
              <div className="flex items-center justify-between font-bold text-zinc-800 dark:text-zinc-200">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-indigo-500" />
                  <span>RMC Transit Mixers Needed:</span>
                </div>
                <span className="text-indigo-600 dark:text-indigo-400 font-extrabold font-mono">
                  ~{results.rmcMixer6m3Trucks} Trucks (6m³)
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 leading-relaxed">
                Ready-Mix Concrete alternative cost: <strong className="text-zinc-800 dark:text-zinc-200 font-mono">₹{results.rmcTotalCost.toLocaleString('en-IN')}</strong> (@ ₹{prices.concreteMix}/m³).
              </p>
            </div>

            {/* Action Bar */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={copyReport}
                className="saas-button-secondary py-2 text-xs flex items-center justify-center gap-1.5 cursor-pointer w-full"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Estimate'}</span>
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition w-full"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp BOQ</span>
              </button>

              <button
                onClick={handleExportPDF}
                className="col-span-full saas-button-primary py-2.5 text-xs flex items-center justify-center gap-1.5 cursor-pointer w-full"
              >
                <Printer className="w-4 h-4" />
                <span>Download Site Material PDF BOQ</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Historical Material Price Trends */}
      <MaterialTrendGraph allowedMaterials={['cement', 'sand', 'aggregate', 'steel', 'concreteMix']} defaultMaterial="cement" />
    </div>
  );
}

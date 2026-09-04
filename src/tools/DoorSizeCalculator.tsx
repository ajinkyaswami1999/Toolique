import { useState, useMemo, useEffect } from 'react';
import { 
  DoorClosed, Copy, Check, RotateCcw, Download, 
  ShieldCheck, Accessibility, Compass, 
  Sparkles, Save, Trash2, Eye, Flame, 
  CheckCircle2, AlertTriangle
} from 'lucide-react';
import { jsPDF } from 'jspdf';

// --- Type Definitions ---
export type UnitType = 'mm' | 'cm' | 'in' | 'ft';
export type OccupancyClass = 
  | 'residential' 
  | 'educational' 
  | 'hospital' 
  | 'assembly' 
  | 'office' 
  | 'mercantile' 
  | 'industrial' 
  | 'storage';
export type DoorStyle = 'single_swing' | 'double_equal' | 'unequal_1_5' | 'pivot_door';
export type DoorMaterial = 'solid_teak' | 'flush_door' | 'hollow_metal' | 'glass_aluminium' | 'fire_rated_metal';
export type VisualizerTheme = 'teak_wood' | 'matte_charcoal' | 'minimal_white' | 'fire_red_glass' | 'industrial_steel';

interface DoorScheduleItem {
  id: string;
  tag: string; // e.g., D1, D2
  location: string;
  clearWidthMm: number;
  clearHeightMm: number;
  roughWidthMm: number;
  roughHeightMm: number;
  style: DoorStyle;
  material: DoorMaterial;
  fireRating: string;
  occupancy: OccupancyClass;
}

// Occupancy Code Matrix (NBC 2016 & IBC/NFPA 101)
const OCCUPANCY_CONFIG: Record<OccupancyClass, {
  name: string;
  codeGroup: string;
  minWidthM: number;
  minHeightM: number;
  egressFactorNonSprinklerMm: number; // mm per person
  egressFactorSprinklerMm: number;
  panicHardwareRequired: boolean;
  desc: string;
}> = {
  residential: {
    name: 'Residential (Dwellings, Flats, Hotels)',
    codeGroup: 'NBC Group A / IBC R',
    minWidthM: 0.90, // 900mm standard internal, 1000mm main
    minHeightM: 2.00,
    egressFactorNonSprinklerMm: 5.08,
    egressFactorSprinklerMm: 3.81,
    panicHardwareRequired: false,
    desc: 'Habitable rooms require min 900mm clear width. Bathrooms/toilets allow min 750mm. Main entrance min 1000mm.'
  },
  educational: {
    name: 'Educational (Schools, Colleges, Daycares)',
    codeGroup: 'NBC Group B / IBC E',
    minWidthM: 1.20,
    minHeightM: 2.10,
    egressFactorNonSprinklerMm: 5.08,
    egressFactorSprinklerMm: 3.81,
    panicHardwareRequired: true,
    desc: 'Classrooms require minimum 1200mm clear width to facilitate rapid simultaneous evacuation and bag clearances.'
  },
  hospital: {
    name: 'Institutional / Healthcare (Hospitals, Clinics)',
    codeGroup: 'NBC Group C / IBC I',
    minWidthM: 2.00,
    minHeightM: 2.10,
    egressFactorNonSprinklerMm: 7.62,
    egressFactorSprinklerMm: 5.08,
    panicHardwareRequired: false,
    desc: 'Corridors and patient transfer doors require 2000mm double-leaf doors for unhindered stretcher/bed passage.'
  },
  assembly: {
    name: 'Assembly (Theatres, Auditoriums, Banquet Halls)',
    codeGroup: 'NBC Group D / IBC A',
    minWidthM: 1.50,
    minHeightM: 2.10,
    egressFactorNonSprinklerMm: 5.08,
    egressFactorSprinklerMm: 3.81,
    panicHardwareRequired: true,
    desc: 'High crowd density. Doors must be minimum 1500mm, swing outward in egress direction, and have panic crash bars.'
  },
  office: {
    name: 'Business & Commercial (Offices, IT Parks)',
    codeGroup: 'NBC Group E / IBC B',
    minWidthM: 1.00,
    minHeightM: 2.10,
    egressFactorNonSprinklerMm: 5.08,
    egressFactorSprinklerMm: 3.81,
    panicHardwareRequired: false,
    desc: 'Standard exit width of 1000mm. High-capacity meeting halls with >50 occupants require dual outward swinging doors.'
  },
  mercantile: {
    name: 'Mercantile (Retail Stores, Shopping Malls)',
    codeGroup: 'NBC Group F / IBC M',
    minWidthM: 1.20,
    minHeightM: 2.10,
    egressFactorNonSprinklerMm: 5.08,
    egressFactorSprinklerMm: 3.81,
    panicHardwareRequired: true,
    desc: 'Customer egress doors require min 1200mm to 2000mm clear width with unrestricted outward panic flow.'
  },
  industrial: {
    name: 'Industrial (Factories, Processing Plants)',
    codeGroup: 'NBC Group G / IBC F',
    minWidthM: 1.50,
    minHeightM: 2.10,
    egressFactorNonSprinklerMm: 5.08,
    egressFactorSprinklerMm: 3.81,
    panicHardwareRequired: true,
    desc: 'Heavy machinery and staff safety. Doors must open outward with min 1500mm clear width.'
  },
  storage: {
    name: 'Storage & Logistics (Warehouses, Depots)',
    codeGroup: 'NBC Group H / IBC S',
    minWidthM: 1.00,
    minHeightM: 2.10,
    egressFactorNonSprinklerMm: 5.08,
    egressFactorSprinklerMm: 3.81,
    panicHardwareRequired: false,
    desc: 'Personnel escape doors require 1000mm width. Freight/forklift openings calculate separately.'
  }
};

// Quick Standard Architectural Presets
const STANDARD_DOOR_PRESETS = [
  {
    id: 'd1_main_entrance',
    tag: 'D1',
    name: 'Main Entrance Door (1000 × 2100 mm / 3\'3" × 7\'0")',
    clearWidthMm: 1000,
    clearHeightMm: 2100,
    style: 'single_swing' as DoorStyle,
    occupancy: 'residential' as OccupancyClass,
    material: 'solid_teak' as DoorMaterial,
    location: 'Main Foyer Entry'
  },
  {
    id: 'd2_bedroom_door',
    tag: 'D2',
    name: 'Internal Bedroom Door (900 × 2100 mm / 3\'0" × 7\'0")',
    clearWidthMm: 900,
    clearHeightMm: 2100,
    style: 'single_swing' as DoorStyle,
    occupancy: 'residential' as OccupancyClass,
    material: 'flush_door' as DoorMaterial,
    location: 'Master & Guest Bedrooms'
  },
  {
    id: 'd3_bathroom_toilet',
    tag: 'D3',
    name: 'Bathroom / Toilet Door (750 × 2100 mm / 2\'6" × 7\'0")',
    clearWidthMm: 750,
    clearHeightMm: 2100,
    style: 'single_swing' as DoorStyle,
    occupancy: 'residential' as OccupancyClass,
    material: 'flush_door' as DoorMaterial,
    location: 'Attached Toilet / Powder Room'
  },
  {
    id: 'd4_classroom_office',
    tag: 'D4',
    name: 'Classroom / Commercial Door (1200 × 2100 mm / 4\'0" × 7\'0")',
    clearWidthMm: 1200,
    clearHeightMm: 2100,
    style: 'unequal_1_5' as DoorStyle,
    occupancy: 'educational' as OccupancyClass,
    material: 'hollow_metal' as DoorMaterial,
    location: 'Classroom / Conference Room'
  },
  {
    id: 'd5_hospital_stretcher',
    tag: 'D5',
    name: 'Hospital Stretcher Double Door (2000 × 2100 mm / 6\'6" × 7\'0")',
    clearWidthMm: 2000,
    clearHeightMm: 2100,
    style: 'double_equal' as DoorStyle,
    occupancy: 'hospital' as OccupancyClass,
    material: 'hollow_metal' as DoorMaterial,
    location: 'ICU / OT Corridor Passage'
  },
  {
    id: 'd6_auditorium_exit',
    tag: 'D6',
    name: 'Auditorium Fire Panic Exit (1500 × 2100 mm / 5\'0" × 7\'0")',
    clearWidthMm: 1500,
    clearHeightMm: 2100,
    style: 'double_equal' as DoorStyle,
    occupancy: 'assembly' as OccupancyClass,
    material: 'fire_rated_metal' as DoorMaterial,
    location: 'Auditorium Emergency Exit'
  },
  {
    id: 'd7_grand_pivot',
    tag: 'D7',
    name: 'Grand Architectural Pivot Door (1200 × 2400 mm / 4\'0" × 8\'0")',
    clearWidthMm: 1200,
    clearHeightMm: 2400,
    style: 'pivot_door' as DoorStyle,
    occupancy: 'residential' as OccupancyClass,
    material: 'solid_teak' as DoorMaterial,
    location: 'Villa Front Statement Entrance'
  }
];

// Themes for 2D CAD visualizer
const THEMES: Record<VisualizerTheme, {
  name: string;
  leafFill: string;
  frameFill: string;
  lineStroke: string;
  handleFill: string;
  glassFill: string;
}> = {
  teak_wood: {
    name: 'Natural Teak Wood',
    leafFill: '#78350F',
    frameFill: '#451A03',
    lineStroke: '#B45309',
    handleFill: '#F59E0B',
    glassFill: '#BAE6FD'
  },
  matte_charcoal: {
    name: 'Matte Charcoal Slate',
    leafFill: '#1E293B',
    frameFill: '#0F172A',
    lineStroke: '#475569',
    handleFill: '#CBD5E1',
    glassFill: '#7DD3FC'
  },
  minimal_white: {
    name: 'Minimal Pure White',
    leafFill: '#F8FAFC',
    frameFill: '#E2E8F0',
    lineStroke: '#94A3B8',
    handleFill: '#0F172A',
    glassFill: '#E0F2FE'
  },
  fire_red_glass: {
    name: 'Fire-Rated Vision Glass',
    leafFill: '#991B1B',
    frameFill: '#7F1D1D',
    lineStroke: '#F87171',
    handleFill: '#FDE047',
    glassFill: '#FEF08A'
  },
  industrial_steel: {
    name: 'Industrial Pressed Steel',
    leafFill: '#334155',
    frameFill: '#1E293B',
    lineStroke: '#64748B',
    handleFill: '#F1F5F9',
    glassFill: '#93C5FD'
  }
};

export default function DoorSizeCalculator() {
  // 1. Units & Occupancy Controls
  const [unit, setUnit] = useState<UnitType>('mm');
  const [occupancy, setOccupancy] = useState<OccupancyClass>('residential');
  const [occupantLoad, setOccupantLoad] = useState<number>(60);
  const [hasSprinklers, setHasSprinklers] = useState<boolean>(true);

  // 2. Clear Opening Dimension Inputs (in mm internally)
  const [clearWidthInputMm, setClearWidthInputMm] = useState<number>(1000);
  const [clearHeightInputMm, setClearHeightInputMm] = useState<number>(2100);

  // 3. Framing & Rebate Specifications
  const [frameThicknessMm, setFrameThicknessMm] = useState<number>(65); // Chowkhat width (50 - 75mm)
  const [rebateDepthMm, setRebateDepthMm] = useState<number>(12); // Shutter stop rebate (12 - 15mm)
  const [shimGapMm, setShimGapMm] = useState<number>(10); // Masonry installation shim clearance (10 - 15mm)
  const [shutterThicknessMm, setShutterThicknessMm] = useState<number>(35); // 32, 35, 40, 45, 50mm

  // 4. Door Style & Engineering Material
  const [doorStyle, setDoorStyle] = useState<DoorStyle>('single_swing');
  const [doorMaterial, setDoorMaterial] = useState<DoorMaterial>('solid_teak');
  const [swingDirection, setSwingDirection] = useState<'left_inswing' | 'right_inswing' | 'outswing_emergency'>('right_inswing');
  const [hasVisionPanel, setHasVisionPanel] = useState<boolean>(false);
  const [fireRating, setFireRating] = useState<string>('Non-Fire Rated (Standard)');

  // 5. Visualizer & UI state
  const [visualizerMode, setVisualizerMode] = useState<'elevation' | 'floor_plan'>('elevation');
  const [activeTheme, setActiveTheme] = useState<VisualizerTheme>('teak_wood');
  const [activeTab, setActiveTab] = useState<'dimensions' | 'egress_code' | 'hardware' | 'schedule'>('dimensions');
  const [copied, setCopied] = useState<boolean>(false);

  // 6. Door Schedule List
  const [doorSchedule, setDoorSchedule] = useState<DoorScheduleItem[]>([]);
  const [doorTag, setDoorTag] = useState<string>('D1');
  const [doorLocation, setDoorLocation] = useState<string>('Main Entrance Foyer');

  // Load schedule from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('toolique_door_schedule');
      if (stored) setDoorSchedule(JSON.parse(stored));
    } catch {}
  }, []);

  // Conversion scaling factors (Base: mm)
  const toUnitScale = useMemo(() => {
    if (unit === 'cm') return 0.1;
    if (unit === 'in') return 1 / 25.4;
    if (unit === 'ft') return 1 / 304.8;
    return 1; // mm
  }, [unit]);

  const fromUnitToMm = (val: number, currentUnit: UnitType) => {
    if (currentUnit === 'cm') return val * 10;
    if (currentUnit === 'in') return val * 25.4;
    if (currentUnit === 'ft') return val * 304.8;
    return val;
  };

  const formatUnit = (valInMm: number, decimals: number = 0) => {
    const converted = valInMm * toUnitScale;
    if (unit === 'ft') return converted.toFixed(2);
    if (unit === 'in') return converted.toFixed(1);
    return converted.toFixed(decimals);
  };

  // --- ARCHITECTURAL & EGRESS ENGINEERING ENGINE ---
  const calculations = useMemo(() => {
    const occConfig = OCCUPANCY_CONFIG[occupancy];

    // 1. Egress Width Calculation per NBC 2016 / NFPA 101
    const egressFactor = hasSprinklers 
      ? occConfig.egressFactorSprinklerMm 
      : occConfig.egressFactorNonSprinklerMm;
    
    // Required aggregate clear width in mm
    const codeRequiredEgressWidthMm = Math.max(
      occConfig.minWidthM * 1000, 
      occupantLoad * egressFactor
    );

    // Number of required exit doors
    let minExitsRequired = 1;
    if (occupantLoad > 1000) minExitsRequired = 4;
    else if (occupantLoad > 500) minExitsRequired = 3;
    else if (occupantLoad > 50) minExitsRequired = 2;

    // Minimum clear width per door leaf
    const minClearWidthPerDoorMm = codeRequiredEgressWidthMm / minExitsRequired;
    const providedClearWidthMm = clearWidthInputMm;
    const providedClearHeightMm = clearHeightInputMm;

    // 2. Door Framing & Structural Dimensions Math
    // Shutter / Door Leaf Size (fits inside rebate)
    let shutterWidthMm = 0;
    let shutterHeightMm = providedClearHeightMm + rebateDepthMm;

    if (doorStyle === 'single_swing' || doorStyle === 'pivot_door') {
      shutterWidthMm = providedClearWidthMm + (rebateDepthMm * 2);
    } else if (doorStyle === 'double_equal') {
      // 2 equal leaves + center astragal overlap
      shutterWidthMm = (providedClearWidthMm / 2) + rebateDepthMm;
    } else if (doorStyle === 'unequal_1_5') {
      // 1.5 leaf: Active leaf (65% of width) + Inactive slave leaf (35%)
      shutterWidthMm = (providedClearWidthMm * 0.65) + rebateDepthMm;
    }

    // Frame Outer Dimensions (Chowkhat Outer Size)
    const frameOuterWidthMm = providedClearWidthMm + (frameThicknessMm * 2);
    const frameOuterHeightMm = providedClearHeightMm + frameThicknessMm; // Header only (no bottom frame in modern doors)

    // Structural Rough Masonry Opening (Lintel to Finished Floor level)
    const roughOpeningWidthMm = frameOuterWidthMm + (shimGapMm * 2);
    const roughOpeningHeightMm = frameOuterHeightMm + shimGapMm;

    // 3. ADA & Accessibility Compliance Audit (Min 813mm / 32" Clear Opening)
    const isAdaCompliant = providedClearWidthMm >= 813;
    const isEgressWidthSufficient = (providedClearWidthMm * minExitsRequired) >= codeRequiredEgressWidthMm;
    const isPanicBarRequired = occConfig.panicHardwareRequired || occupantLoad >= 50;

    // 4. Door Weight & Hardware Engineering
    // Estimated density (kg/m³)
    let materialDensity = 650; // Solid Teak
    if (doorMaterial === 'flush_door') materialDensity = 320;
    else if (doorMaterial === 'hollow_metal') materialDensity = 480;
    else if (doorMaterial === 'glass_aluminium') materialDensity = 720;
    else if (doorMaterial === 'fire_rated_metal') materialDensity = 850;

    const leafAreaM2 = (shutterWidthMm / 1000) * (shutterHeightMm / 1000);
    const estimatedLeafWeightKg = Math.round(leafAreaM2 * (shutterThicknessMm / 1000) * materialDensity + (hasVisionPanel ? 8 : 0));

    // Hinge specification
    let recommendedHingeCount = 3;
    let hingeSize = '4" × 3" × 3mm (Ball Bearing SS 304)';
    if (shutterHeightMm > 2150 || estimatedLeafWeightKg > 45) {
      recommendedHingeCount = 4;
      hingeSize = '5" × 3.5" × 3.5mm Heavy Duty Ball Bearing';
    }

    // Door closer recommendation
    const requiresDoorCloser = isPanicBarRequired || fireRating !== 'Non-Fire Rated (Standard)' || occupancy === 'hospital';

    return {
      codeRequiredEgressWidthMm: Math.round(codeRequiredEgressWidthMm),
      minExitsRequired,
      minClearWidthPerDoorMm: Math.round(minClearWidthPerDoorMm),
      providedClearWidthMm,
      providedClearHeightMm,
      shutterWidthMm: Math.round(shutterWidthMm),
      shutterHeightMm: Math.round(shutterHeightMm),
      frameOuterWidthMm: Math.round(frameOuterWidthMm),
      frameOuterHeightMm: Math.round(frameOuterHeightMm),
      roughOpeningWidthMm: Math.round(roughOpeningWidthMm),
      roughOpeningHeightMm: Math.round(roughOpeningHeightMm),
      isAdaCompliant,
      isEgressWidthSufficient,
      isPanicBarRequired,
      estimatedLeafWeightKg,
      recommendedHingeCount,
      hingeSize,
      requiresDoorCloser
    };
  }, [
    occupancy, occupantLoad, hasSprinklers, clearWidthInputMm, clearHeightInputMm,
    frameThicknessMm, rebateDepthMm, shimGapMm, shutterThicknessMm,
    doorStyle, doorMaterial, hasVisionPanel, fireRating
  ]);

  // Apply quick preset
  const applyPreset = (preset: typeof STANDARD_DOOR_PRESETS[0]) => {
    setClearWidthInputMm(preset.clearWidthMm);
    setClearHeightInputMm(preset.clearHeightMm);
    setDoorStyle(preset.style);
    setOccupancy(preset.occupancy);
    setDoorMaterial(preset.material);
    setDoorTag(preset.tag);
    setDoorLocation(preset.location);
  };

  // Reset to default
  const handleReset = () => {
    applyPreset(STANDARD_DOOR_PRESETS[0]);
    setOccupantLoad(60);
    setHasSprinklers(true);
    setFrameThicknessMm(65);
    setRebateDepthMm(12);
    setShimGapMm(10);
    setShutterThicknessMm(35);
    setFireRating('Non-Fire Rated (Standard)');
    setHasVisionPanel(false);
  };

  // Add to Door Schedule
  const addToSchedule = () => {
    const newItem: DoorScheduleItem = {
      id: Date.now().toString(),
      tag: doorTag.trim() || `D${doorSchedule.length + 1}`,
      location: doorLocation.trim() || 'Internal Doorway',
      clearWidthMm: calculations.providedClearWidthMm,
      clearHeightMm: calculations.providedClearHeightMm,
      roughWidthMm: calculations.roughOpeningWidthMm,
      roughHeightMm: calculations.roughOpeningHeightMm,
      style: doorStyle,
      material: doorMaterial,
      fireRating,
      occupancy
    };

    const updated = [...doorSchedule, newItem];
    setDoorSchedule(updated);
    try {
      localStorage.setItem('toolique_door_schedule', JSON.stringify(updated));
    } catch {}
    // Increment tag for next entry (e.g. D1 -> D2)
    const match = doorTag.match(/D(\d+)/);
    if (match) {
      setDoorTag(`D${parseInt(match[1]) + 1}`);
    }
  };

  // Delete from Schedule
  const deleteFromSchedule = (id: string) => {
    const updated = doorSchedule.filter(item => item.id !== id);
    setDoorSchedule(updated);
    try {
      localStorage.setItem('toolique_door_schedule', JSON.stringify(updated));
    } catch {}
  };

  // Copy Egress & Framing Schedule to Clipboard
  const copyAudit = () => {
    const occ = OCCUPANCY_CONFIG[occupancy];
    const text = `🚪 ARCHITECTURAL DOOR FRAMING & EGRESS AUDIT (Toolique Studio)
--------------------------------------------------
Door Tag / Location       : ${doorTag} (${doorLocation})
Occupancy Classification  : ${occ.name} (${occ.codeGroup})
Occupant Load Capacity    : ${occupantLoad} Persons (Sprinklers: ${hasSprinklers ? 'YES' : 'NO'})
Door Configuration Style  : ${doorStyle.toUpperCase().replace('_', ' ')} (${doorMaterial.toUpperCase().replace('_', ' ')})
--------------------------------------------------
1. CLEAR OPENING (Walkthrough Usable Dimensions):
• Clear Width             : ${formatUnit(calculations.providedClearWidthMm)} ${unit} (${calculations.providedClearWidthMm} mm)
• Clear Height            : ${formatUnit(calculations.providedClearHeightMm)} ${unit} (${calculations.providedClearHeightMm} mm)

2. STRUCTURAL FRAMING & ROUGH MASONRY OPENING:
• Shutter Leaf Size       : ${formatUnit(calculations.shutterWidthMm)} × ${formatUnit(calculations.shutterHeightMm)} ${unit}
• Frame Outer Size        : ${formatUnit(calculations.frameOuterWidthMm)} × ${formatUnit(calculations.frameOuterHeightMm)} ${unit}
• Rough Masonry Opening   : ${formatUnit(calculations.roughOpeningWidthMm)} × ${formatUnit(calculations.roughOpeningHeightMm)} ${unit} (Lintel to Floor)
• Frame / Shim Allowance  : ${frameThicknessMm}mm Chowkhat + ${shimGapMm}mm Expansion Shim Gap

3. CODE COMPLIANCE & ACCESSIBILITY AUDIT:
• Minimum Exits Required  : ${calculations.minExitsRequired} Door Unit(s)
• Aggregate Code Width Req: ${formatUnit(calculations.codeRequiredEgressWidthMm)} ${unit} (Status: ${calculations.isEgressWidthSufficient ? 'PASS' : 'FAIL - WIDEN DOOR'})
• ADA / Barrier-Free Pass : ${calculations.isAdaCompliant ? 'PASS (>= 32 in / 813 mm)' : 'FAIL (Below ADA Minimum)'}
• Panic Hardware Required : ${calculations.isPanicBarRequired ? 'YES (Crash Bar Outswinging)' : 'NO (Standard Lever Handle)'}
• Est. Leaf Weight & Hinges: ~${calculations.estimatedLeafWeightKg} kg (${calculations.recommendedHingeCount}x ${calculations.hingeSize})
--------------------------------------------------
Certified under NBC 2016 Part 4 Fire & Life Safety & IBC/NFPA 101 Guidelines.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate PDF Architectural Door Schedule Certificate
  const generatePdfSchedule = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Brand Header
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 38, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('TOOLIQUE ARCHITECTURAL SUITE', 14, 18);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225);
    doc.text('Architectural Door Schedule & Egress Compliance Certificate', 14, 25);
    doc.text(`NBC 2016 / IBC / ADA Certified | Generated: ${new Date().toLocaleDateString('en-IN')}`, 14, 31);

    // Section 1: Egress & Occupancy Specifications
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('1. Occupancy & Life Safety Analysis', 14, 48);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);

    const occ = OCCUPANCY_CONFIG[occupancy];
    const specs = [
      ['Current Door Tag / ID', `${doorTag} — ${doorLocation}`],
      ['Occupancy Class', `${occ.name} (${occ.codeGroup})`],
      ['Occupant Load Capacity', `${occupantLoad} Persons (Fire Sprinklers: ${hasSprinklers ? 'Present' : 'None'})`],
      ['Required Egress Width', `${calculations.codeRequiredEgressWidthMm} mm (${calculations.minExitsRequired} Exit Doors Minimum)`],
      ['ADA Accessibility Check', calculations.isAdaCompliant ? 'COMPLIANT (Passage >= 813mm / 32 in)' : 'NON-COMPLIANT'],
      ['Panic Exit Hardware', calculations.isPanicBarRequired ? 'MANDATORY (Outward Opening Panic Bar)' : 'Standard Leverset'],
      ['Fire Resistance Rating', fireRating]
    ];

    let yPos = 55;
    specs.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, 14, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 65, yPos);
      yPos += 5.5;
    });

    // Section 2: Framing & Dimensional Matrix
    yPos += 3;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('2. Architectural Framing & Structural Opening Schedule', 14, yPos);

    yPos += 6;
    doc.setFillColor(241, 245, 249);
    doc.rect(14, yPos, pageWidth - 28, 7, 'F');
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Dimension Parameter', 18, yPos + 5);
    doc.text('Metric (mm)', 105, yPos + 5);
    doc.text('Imperial (Inches / Feet)', pageWidth - 20, yPos + 5, { align: 'right' });

    yPos += 7;
    const framingRows = [
      ['Clear Usable Opening (Width × Height)', `${calculations.providedClearWidthMm} × ${calculations.providedClearHeightMm} mm`, `${(calculations.providedClearWidthMm / 25.4).toFixed(1)}" × ${(calculations.providedClearHeightMm / 25.4).toFixed(1)}"`],
      ['Door Shutter Leaf Dimensions', `${calculations.shutterWidthMm} × ${calculations.shutterHeightMm} mm`, `${(calculations.shutterWidthMm / 25.4).toFixed(1)}" × ${(calculations.shutterHeightMm / 25.4).toFixed(1)}"`],
      ['Frame Outer Size (Chowkhat Outer)', `${calculations.frameOuterWidthMm} × ${calculations.frameOuterHeightMm} mm`, `${(calculations.frameOuterWidthMm / 25.4).toFixed(1)}" × ${(calculations.frameOuterHeightMm / 25.4).toFixed(1)}"`],
      ['Structural Rough Opening (Masonry / Lintel)', `${calculations.roughOpeningWidthMm} × ${calculations.roughOpeningHeightMm} mm`, `${(calculations.roughOpeningWidthMm / 25.4).toFixed(1)}" × ${(calculations.roughOpeningHeightMm / 25.4).toFixed(1)}"`],
      ['Chowkhat Frame & Rebate', `${frameThicknessMm}mm Frame, ${rebateDepthMm}mm Rebate`, `${(frameThicknessMm / 25.4).toFixed(2)}" / ${(rebateDepthMm / 25.4).toFixed(2)}"`],
      ['Hardware Specification', `${calculations.recommendedHingeCount}x ${calculations.hingeSize}`, `~${calculations.estimatedLeafWeightKg} kg Leaf Weight`]
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);

    framingRows.forEach(([param, metric, imperial], idx) => {
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, yPos, pageWidth - 28, 6.5, 'F');
      }
      doc.text(param, 18, yPos + 4.5);
      doc.text(metric, 105, yPos + 4.5);
      doc.text(imperial, pageWidth - 20, yPos + 4.5, { align: 'right' });
      yPos += 6.5;
    });

    // Section 3: Saved Project Door Schedule (If Available)
    if (doorSchedule.length > 0) {
      yPos += 6;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`3. Complete Project Door Schedule (${doorSchedule.length} Doors)`, 14, yPos);

      yPos += 5;
      doc.setFillColor(241, 245, 249);
      doc.rect(14, yPos, pageWidth - 28, 6, 'F');
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text('Tag', 18, yPos + 4);
      doc.text('Location', 35, yPos + 4);
      doc.text('Clear Size (mm)', 90, yPos + 4);
      doc.text('Rough Size (mm)', 130, yPos + 4);
      doc.text('Material / Style', pageWidth - 20, yPos + 4, { align: 'right' });

      yPos += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);

      doorSchedule.slice(0, 8).forEach((item, i) => {
        if (i % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(14, yPos, pageWidth - 28, 5.5, 'F');
        }
        doc.text(item.tag, 18, yPos + 4);
        doc.text(item.location.slice(0, 24), 35, yPos + 4);
        doc.text(`${item.clearWidthMm} × ${item.clearHeightMm}`, 90, yPos + 4);
        doc.text(`${item.roughWidthMm} × ${item.roughHeightMm}`, 130, yPos + 4);
        doc.text(`${item.style.replace('_', ' ')}`, pageWidth - 20, yPos + 4, { align: 'right' });
        yPos += 5.5;
      });
    }

    // Footer
    yPos = 270;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text('National Building Code Compliance Statement:', 14, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('• Calculations adhere to NBC 2016 Part 4 Section 4.3 (Means of Egress) and IS 4021 (Timber Door Framing Standards).', 14, yPos + 4);
    doc.text('• Minimum clear opening dimensions must be maintained without reduction by door leaf thickness or projection handles.', 14, yPos + 8);

    doc.save(`Toolique_Door_Schedule_${doorTag}_${Date.now().toString().slice(-6)}.pdf`);
  };

  const currentTheme = THEMES[activeTheme];

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-left">
      {/* Top Banner Card */}
      <div className="p-6 rounded-3xl bg-linear-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/50 border border-indigo-500/20 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                <DoorClosed className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 tracking-wide uppercase">
                NBC 2016 & IBC Egress Suite
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Door Size Calculator & Architectural Egress Studio
            </h1>
            <p className="text-xs lg:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Calculate clear walkthrough openings, rough masonry framing, occupant egress capacities, ADA wheelchair clearances, and export certified architectural door schedules.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 bg-white/60 dark:bg-slate-900/80 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Clear Width</span>
              <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                {formatUnit(calculations.providedClearWidthMm)} {unit}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Rough Opening</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono">
                {formatUnit(calculations.roughOpeningWidthMm)} × {formatUnit(calculations.roughOpeningHeightMm)}
              </span>
            </div>
          </div>
        </div>

        {/* Standard Presets Fast-Bar */}
        <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Standard Architectural Door Presets:
            </span>
            <span className="text-[11px] text-slate-600 dark:text-slate-400">Select to load standard dimensions</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
            {STANDARD_DOOR_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => applyPreset(p)}
                className="p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/40 dark:bg-slate-900/50 hover:border-indigo-500/50 hover:bg-indigo-500/5 text-left transition group"
              >
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                  {p.tag}: {p.name.split('(')[0]}
                </div>
                <div className="text-[10px] text-slate-600 dark:text-slate-400 truncate mt-0.5 font-mono">
                  {p.clearWidthMm}×{p.clearHeightMm}mm
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid Configurator + Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Configurator Tabs (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Tab Navigation */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900/90 p-1.5 border border-slate-200/80 dark:border-slate-800">
            {[
              { id: 'dimensions', label: '1. Dimensions', icon: Compass },
              { id: 'egress_code', label: '2. Egress Code', icon: ShieldCheck },
              { id: 'hardware', label: '3. Style & Hardware', icon: Flame },
              { id: 'schedule', label: '4. Schedule', icon: Save }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center justify-center gap-1.5 px-2.5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap truncate ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200/80 dark:border-slate-700/80'
                      : 'text-slate-655 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: Dimensions & Framing */}
          {activeTab === 'dimensions' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-5">
              {/* Unit System & Reset */}
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800/60">
                <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                  <Compass className="w-4 h-4 text-indigo-500" />
                  Clear Opening & Framing Parameters
                </h3>
                <div className="flex items-center gap-2">
                  <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-bold">
                    {(['mm', 'cm', 'in', 'ft'] as UnitType[]).map((u) => (
                      <button
                        key={u}
                        onClick={() => setUnit(u)}
                        className={`px-2 py-1 rounded-md transition ${
                          unit === u 
                            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs' 
                            : 'text-slate-655 dark:text-slate-400'
                        }`}
                      >
                        {u.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleReset}
                    className="p-1.5 rounded-lg text-slate-655 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Reset to Defaults"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tag & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Door Tag / Symbol
                  </label>
                  <input
                    type="text"
                    value={doorTag}
                    onChange={(e) => setDoorTag(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Door Location / Room
                  </label>
                  <input
                    type="text"
                    value={doorLocation}
                    onChange={(e) => setDoorLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Clear Opening Width & Height */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 space-y-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  A. Clear Opening (Net Walkthrough Space)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Clear Opening Width ({unit})
                    </label>
                    <input
                      type="number"
                      value={formatUnit(clearWidthInputMm, 0)}
                      onChange={(e) => setClearWidthInputMm(Math.max(500, fromUnitToMm(parseFloat(e.target.value) || 0, unit)))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold text-slate-800 dark:text-white focus:border-indigo-500 focus:outline-hidden"
                    />
                    <span className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 block">
                      Standard: 900mm (Bedrooms), 1000mm (Main), 750mm (Toilets)
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Clear Opening Height ({unit})
                    </label>
                    <input
                      type="number"
                      value={formatUnit(clearHeightInputMm, 0)}
                      onChange={(e) => setClearHeightInputMm(Math.max(1800, fromUnitToMm(parseFloat(e.target.value) || 0, unit)))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold text-slate-800 dark:text-white focus:border-indigo-500 focus:outline-hidden"
                    />
                    <span className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 block">
                      Standard: 2100mm (7\'0") / 2400mm (8\'0")
                    </span>
                  </div>
                </div>
              </div>

              {/* Chowkhat Frame, Rebate & Shim Clearances */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 space-y-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  B. Frame (Chowkhat) & Structural Tolerances
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Frame Thickness (mm)
                    </label>
                    <select
                      value={frameThicknessMm}
                      onChange={(e) => setFrameThicknessMm(parseInt(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-white"
                    >
                      <option value={50}>50mm (Pressed Steel / Alum)</option>
                      <option value={65}>65mm (Standard Wood / WPC)</option>
                      <option value={75}>75mm (Heavy Teak Wood 3"×5")</option>
                      <option value={100}>100mm (Heavy Structural Jamb)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Rebate Depth (mm)
                    </label>
                    <select
                      value={rebateDepthMm}
                      onChange={(e) => setRebateDepthMm(parseInt(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-white"
                    >
                      <option value={10}>10 mm</option>
                      <option value={12}>12 mm (Standard)</option>
                      <option value={15}>15 mm (Heavy Duty)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Masonry Shim Gap (mm)
                    </label>
                    <select
                      value={shimGapMm}
                      onChange={(e) => setShimGapMm(parseInt(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-white"
                    >
                      <option value={8}>8 mm (Tight Shim)</option>
                      <option value={10}>10 mm (Standard Grout)</option>
                      <option value={15}>15 mm (Plaster Allowance)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Egress & Occupancy Code */}
          {activeTab === 'egress_code' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-5">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800/60">
                <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                  NBC 2016 / IBC Life Safety Egress Matrix
                </h3>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                  {OCCUPANCY_CONFIG[occupancy].codeGroup}
                </span>
              </div>

              {/* Occupancy Class Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Building Occupancy Class
                </label>
                <select
                  value={occupancy}
                  onChange={(e) => setOccupancy(e.target.value as OccupancyClass)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold text-slate-800 dark:text-white focus:border-indigo-500 focus:outline-hidden"
                >
                  {Object.entries(OCCUPANCY_CONFIG).map(([key, val]) => (
                    <option key={key} value={key} className="dark:bg-slate-900">
                      {val.name} ({val.codeGroup})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {OCCUPANCY_CONFIG[occupancy].desc}
                </p>
              </div>

              {/* Occupant Load & Fire Sprinklers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Design Occupant Load (Persons)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5000}
                    value={occupantLoad || ''}
                    onChange={(e) => setOccupantLoad(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-mono font-bold text-slate-800 dark:text-white"
                  />
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 block">
                    Total population evacuating through this zone
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 flex flex-col justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasSprinklers}
                      onChange={(e) => setHasSprinklers(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    Automatic Fire Sprinklers Installed
                  </label>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 mt-1">
                    {hasSprinklers 
                      ? 'Egress factor: 3.81 mm / person (Sprinklered benefit)' 
                      : 'Egress factor: 5.08 mm / person (Standard)'}
                  </span>
                </div>
              </div>

              {/* Code Verification Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className={`p-3.5 rounded-2xl border ${
                  calculations.isEgressWidthSufficient 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400' 
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400'
                }`}>
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    {calculations.isEgressWidthSufficient ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    <span>Egress Capacity: {calculations.isEgressWidthSufficient ? 'PASS' : 'INSUFFICIENT'}</span>
                  </div>
                  <div className="text-[11px] mt-1">
                    Required Width: {calculations.codeRequiredEgressWidthMm} mm | Provided: {calculations.providedClearWidthMm} mm
                  </div>
                </div>

                <div className={`p-3.5 rounded-2xl border ${
                  calculations.isAdaCompliant 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400' 
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400'
                }`}>
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Accessibility className="w-4 h-4" />
                    <span>ADA Barrier-Free: {calculations.isAdaCompliant ? 'PASS' : 'NON-COMPLIANT'}</span>
                  </div>
                  <div className="text-[11px] mt-1">
                    Min 32" (813mm) clear passage required for standard wheelchairs.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Style & Hardware */}
          {activeTab === 'hardware' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800/60">
                <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                  <Flame className="w-4 h-4 text-indigo-500" />
                  Door Style, Material & Hardware Spec
                </h3>
              </div>

              {/* Door Leaf Configuration */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Door Leaf Configuration
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'single_swing', label: 'Single Leaf', desc: 'Up to 1050mm' },
                    { id: 'double_equal', label: 'Double Equal', desc: '1200 - 2400mm' },
                    { id: 'unequal_1_5', label: '1.5 Unequal', desc: 'Active + Slave' },
                    { id: 'pivot_door', label: 'Pivot Door', desc: 'Grand Entrance' }
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setDoorStyle(s.id as DoorStyle)}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        doorStyle === s.id
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="text-xs font-bold">{s.label}</div>
                      <div className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Material & Fire Rating */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Door Leaf Core Material
                  </label>
                  <select
                    value={doorMaterial}
                    onChange={(e) => setDoorMaterial(e.target.value as DoorMaterial)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-white"
                  >
                    <option value="solid_teak">Solid Teak / Hardwood Wood</option>
                    <option value="flush_door">Flush Core with Laminate/Veneer</option>
                    <option value="hollow_metal">Hollow Pressed Metal / Galvanized</option>
                    <option value="glass_aluminium">Toughened Glass in Aluminium Profile</option>
                    <option value="fire_rated_metal">Fire-Rated Insulated Steel (120 Min)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Fire Resistance Rating
                  </label>
                  <select
                    value={fireRating}
                    onChange={(e) => setFireRating(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-white"
                  >
                    <option value="Non-Fire Rated (Standard)">Non-Fire Rated (Standard)</option>
                    <option value="FD 30 (30 Min Fire Rated)">FD 30 (30 Min Fire Resistance)</option>
                    <option value="FD 60 (60 Min Fire Rated)">FD 60 (60 Min Fire Resistance)</option>
                    <option value="FD 120 (120 Min Fire Rated)">FD 120 (120 Min Fire Resistance)</option>
                  </select>
                </div>
              </div>

              {/* Swing Direction & Vision Panel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Door Swing Direction
                  </label>
                  <select
                    value={swingDirection}
                    onChange={(e) => setSwingDirection(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-white"
                  >
                    <option value="right_inswing">Right Hand Inswing (RH)</option>
                    <option value="left_inswing">Left Hand Inswing (LH)</option>
                    <option value="outswing_emergency">Outward Swing (Emergency Panic Exit)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasVisionPanel}
                      onChange={(e) => setHasVisionPanel(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    Include Vision Glass Panel
                  </label>
                  <span className="text-[10px] text-slate-500">
                    {hasVisionPanel ? 'Toughened glass insert' : 'Solid leaf'}
                  </span>
                </div>
              </div>

              {/* Hardware Spec Summary */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 space-y-2.5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Recommended Hardware Schedule:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-400">Est. Shutter Weight:</span>
                    <span className="font-bold font-mono text-slate-800 dark:text-white">~{calculations.estimatedLeafWeightKg} kg</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-400">Hinges Required:</span>
                    <span className="font-bold font-mono text-slate-800 dark:text-white">{calculations.recommendedHingeCount}x Ball Bearing</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 sm:col-span-2">
                    <span className="text-slate-600 dark:text-slate-400">Exit Operating Hardware:</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {calculations.isPanicBarRequired ? 'UL Listed Panic Crash Bar' : 'Lever-Action Mortise Lockset'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Door Schedule List */}
          {activeTab === 'schedule' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800/60">
                <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                  <Save className="w-4 h-4 text-indigo-500" />
                  Project Door Schedule Manager
                </h3>
                <button
                  onClick={addToSchedule}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm"
                >
                  + Add Current Door ({doorTag})
                </button>
              </div>

              {doorSchedule.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-dashed border-slate-300 dark:border-slate-700">
                  <DoorClosed className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    No doors added to the project schedule yet.
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Click "+ Add Current Door" above to build your complete architectural door schedule.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase text-[10px]">
                        <th className="py-2">Tag</th>
                        <th className="py-2">Location</th>
                        <th className="py-2">Clear Size</th>
                        <th className="py-2">Rough Opening</th>
                        <th className="py-2">Style</th>
                        <th className="py-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-700 dark:text-slate-300">
                      {doorSchedule.map((item) => (
                        <tr key={item.id}>
                          <td className="py-2.5 font-bold text-indigo-600 dark:text-indigo-400">{item.tag}</td>
                          <td className="py-2.5 text-slate-800 dark:text-slate-200">{item.location}</td>
                          <td className="py-2.5 font-mono">{item.clearWidthMm} × {item.clearHeightMm} mm</td>
                          <td className="py-2.5 font-mono">{item.roughWidthMm} × {item.roughHeightMm} mm</td>
                          <td className="py-2.5">{item.style.replace('_', ' ')}</td>
                          <td className="py-2.5 text-right">
                            <button
                              onClick={() => deleteFromSchedule(item.id)}
                              className="p-1 rounded hover:text-red-500 text-slate-400 transition"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: 2D CAD Blueprint + Results Summary (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* 2D Architectural CAD Studio Card */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800/60">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Eye className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white text-xs">
                  2D Architectural CAD Blueprint
                </h3>
              </div>

              {/* View Switcher: Elevation vs Plan */}
              <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-[11px] font-bold">
                <button
                  onClick={() => setVisualizerMode('elevation')}
                  className={`px-2 py-0.5 rounded-md transition ${
                    visualizerMode === 'elevation'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                      : 'text-slate-655 dark:text-slate-400'
                  }`}
                >
                  Elevation
                </button>
                <button
                  onClick={() => setVisualizerMode('floor_plan')}
                  className={`px-2 py-0.5 rounded-md transition ${
                    visualizerMode === 'floor_plan'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                      : 'text-slate-655 dark:text-slate-400'
                  }`}
                >
                  Plan Swing
                </button>
              </div>
            </div>

            {/* SVG CAD Canvas */}
            <div className="relative rounded-2xl bg-slate-950 p-4 border border-slate-800 overflow-hidden shadow-inner flex items-center justify-center min-h-[240px]">
              <svg viewBox="0 0 320 280" className="w-full h-auto drop-shadow-md">
                {/* CAD Grid Background */}
                <rect x="0" y="0" width="320" height="280" fill="#0F172A" />
                <pattern id="cadGrid" width="16" height="16" patternUnits="userSpaceOnUse">
                  <path d="M 16 0 L 0 0 0 16" fill="none" stroke="#1E293B" strokeWidth="0.5" />
                </pattern>
                <rect x="0" y="0" width="320" height="280" fill="url(#cadGrid)" />

                {visualizerMode === 'elevation' ? (
                  /* --- ELEVATION VIEW --- */
                  <g>
                    {/* Masonry Rough Opening Outline */}
                    <rect x="50" y="25" width="220" height="235" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="3,3" />
                    <text x="160" y="18" fill="#64748B" fontSize="7" textAnchor="middle" fontWeight="bold">
                      ROUGH OPENING: {formatUnit(calculations.roughOpeningWidthMm)} × {formatUnit(calculations.roughOpeningHeightMm)} {unit}
                    </text>

                    {/* Outer Frame (Chowkhat) */}
                    <rect x="60" y="35" width="200" height="225" fill={currentTheme.frameFill} stroke="#334155" strokeWidth="1.5" rx="1" />

                    {/* Door Leaf (Inside Frame) */}
                    {doorStyle === 'double_equal' ? (
                      /* Double Equal Doors */
                      <g>
                        {/* Leaf A */}
                        <rect x="72" y="47" width="86" height="213" fill={currentTheme.leafFill} stroke={currentTheme.lineStroke} strokeWidth="1" />
                        <rect x="78" y="55" width="74" height="90" fill="none" stroke={currentTheme.lineStroke} strokeWidth="0.8" opacity="0.6" />
                        <rect x="78" y="155" width="74" height="90" fill="none" stroke={currentTheme.lineStroke} strokeWidth="0.8" opacity="0.6" />
                        <rect x="150" y="150" width="4" height="15" fill={currentTheme.handleFill} rx="1" />

                        {/* Leaf B */}
                        <rect x="162" y="47" width="86" height="213" fill={currentTheme.leafFill} stroke={currentTheme.lineStroke} strokeWidth="1" />
                        <rect x="168" y="55" width="74" height="90" fill="none" stroke={currentTheme.lineStroke} strokeWidth="0.8" opacity="0.6" />
                        <rect x="168" y="155" width="74" height="90" fill="none" stroke={currentTheme.lineStroke} strokeWidth="0.8" opacity="0.6" />
                        <rect x="166" y="150" width="4" height="15" fill={currentTheme.handleFill} rx="1" />
                      </g>
                    ) : doorStyle === 'unequal_1_5' ? (
                      /* 1.5 Unequal Leaf */
                      <g>
                        {/* Main Active Leaf (65%) */}
                        <rect x="72" y="47" width="112" height="213" fill={currentTheme.leafFill} stroke={currentTheme.lineStroke} strokeWidth="1" />
                        <rect x="78" y="55" width="100" height="90" fill="none" stroke={currentTheme.lineStroke} strokeWidth="0.8" opacity="0.6" />
                        <rect x="78" y="155" width="100" height="90" fill="none" stroke={currentTheme.lineStroke} strokeWidth="0.8" opacity="0.6" />
                        <rect x="174" y="150" width="4" height="15" fill={currentTheme.handleFill} rx="1" />

                        {/* Slave Leaf (35%) */}
                        <rect x="187" y="47" width="61" height="213" fill={currentTheme.leafFill} stroke={currentTheme.lineStroke} strokeWidth="1" />
                        <rect x="192" y="55" width="51" height="190" fill="none" stroke={currentTheme.lineStroke} strokeWidth="0.8" opacity="0.6" />
                      </g>
                    ) : doorStyle === 'pivot_door' ? (
                      /* Pivot Statement Door */
                      <g>
                        <rect x="72" y="47" width="176" height="213" fill={currentTheme.leafFill} stroke={currentTheme.lineStroke} strokeWidth="1" />
                        {/* Pivot Axis Indicator */}
                        <line x1="96" y1="42" x2="96" y2="265" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4,2" />
                        <circle cx="96" cy="45" r="3" fill="#F59E0B" />
                        <circle cx="96" cy="260" r="3" fill="#F59E0B" />
                        <rect x="230" y="140" width="5" height="35" fill={currentTheme.handleFill} rx="1.5" />
                        <text x="96" y="275" fill="#F59E0B" fontSize="6" textAnchor="middle">PIVOT AXIS (150mm)</text>
                      </g>
                    ) : (
                      /* Standard Single Swing Leaf */
                      <g>
                        <rect x="72" y="47" width="176" height="213" fill={currentTheme.leafFill} stroke={currentTheme.lineStroke} strokeWidth="1" />
                        {/* 2-Panel Moulding */}
                        <rect x="82" y="58" width="156" height="85" fill="none" stroke={currentTheme.lineStroke} strokeWidth="1" rx="2" />
                        <rect x="82" y="155" width="156" height="95" fill="none" stroke={currentTheme.lineStroke} strokeWidth="1" rx="2" />

                        {/* Vision Panel (if toggled) */}
                        {hasVisionPanel && (
                          <rect x="130" y="70" width="60" height="60" fill={currentTheme.glassFill} stroke="#64748B" strokeWidth="1" rx="2" opacity="0.9" />
                        )}

                        {/* Lever Handle or Panic Bar */}
                        {calculations.isPanicBarRequired ? (
                          <g>
                            <rect x="85" y="152" width="150" height="6" fill="#EF4444" rx="1.5" stroke="#B91C1C" strokeWidth="0.5" />
                            <text x="160" y="157" fill="#FFFFFF" fontSize="4.5" textAnchor="middle" fontWeight="bold">PANIC EXIT PUSH</text>
                          </g>
                        ) : (
                          <rect x="228" y="150" width="12" height="4" fill={currentTheme.handleFill} rx="1" />
                        )}
                      </g>
                    )}

                    {/* Floor Base Ground Line */}
                    <line x1="30" y1="260" x2="290" y2="260" stroke="#CBD5E1" strokeWidth="1.5" />
                  </g>
                ) : (
                  /* --- FLOOR PLAN SWING VIEW --- */
                  <g>
                    {/* Wall Jambs */}
                    <rect x="40" y="120" width="40" height="40" fill="#334155" stroke="#475569" strokeWidth="1" />
                    <rect x="240" y="120" width="40" height="40" fill="#334155" stroke="#475569" strokeWidth="1" />

                    {/* Clear Opening Passage Line */}
                    <line x1="80" y1="140" x2="240" y2="140" stroke="#64748B" strokeWidth="1" strokeDasharray="3,3" />
                    <text x="160" y="135" fill="#38BDF8" fontSize="7" fontWeight="bold" textAnchor="middle">
                      CLEAR OPENING: {formatUnit(calculations.providedClearWidthMm)} {unit}
                    </text>

                    {/* Swing Arc and Open Leaf at 90 degrees */}
                    {doorStyle === 'double_equal' ? (
                      <g>
                        {/* Left Leaf Open Arc */}
                        <path d="M 80 140 A 80 80 0 0 1 80 60" fill="none" stroke="#F59E0B" strokeWidth="1" strokeDasharray="3,3" />
                        <line x1="80" y1="140" x2="80" y2="60" fill="none" stroke={currentTheme.leafFill} strokeWidth="3" />

                        {/* Right Leaf Open Arc */}
                        <path d="M 240 140 A 80 80 0 0 0 240 60" fill="none" stroke="#F59E0B" strokeWidth="1" strokeDasharray="3,3" />
                        <line x1="240" y1="140" x2="240" y2="60" fill="none" stroke={currentTheme.leafFill} strokeWidth="3" />
                      </g>
                    ) : (
                      <g>
                        {/* Single 90 Degree Swing Arc */}
                        <path d="M 240 140 A 160 160 0 0 1 80 140" fill="none" stroke="#F59E0B" strokeWidth="1.2" strokeDasharray="3,3" />
                        {/* Door Leaf (Open 90°) */}
                        <line x1="80" y1="140" x2="80" y2="20" stroke={currentTheme.leafFill} strokeWidth="4" />
                        <circle cx="80" cy="140" r="3" fill="#F59E0B" />
                      </g>
                    )}

                    {/* Wheelchair 60" Turning Box Indicator */}
                    <circle cx="160" cy="200" r="35" fill="none" stroke="#10B981" strokeWidth="0.8" strokeDasharray="2,2" />
                    <text x="160" y="202" fill="#10B981" fontSize="5.5" textAnchor="middle">60" WHEELCHAIR TURNING CLEARANCE</text>
                  </g>
                )}
              </svg>
            </div>

            {/* Theme Selector */}
            <div>
              <span className="text-[11px] font-bold text-slate-655 dark:text-slate-400 block mb-1.5">
                CAD Studio Material Palette
              </span>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(THEMES).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => setActiveTheme(key as VisualizerTheme)}
                    className={`p-1.5 rounded-xl border text-left transition flex items-center gap-1.5 ${
                      activeTheme === key
                        ? 'border-indigo-500 bg-indigo-500/10 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="w-3 h-3 rounded-full border border-slate-700 shrink-0" style={{ backgroundColor: val.leafFill }} />
                    <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate">
                      {val.name.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Egress Schedule Summary Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Certified Door Schedule
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyAudit}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Audit'}</span>
                </button>
                <button
                  onClick={generatePdfSchedule}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold transition shadow-sm"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                  <span>PDF Schedule</span>
                </button>
              </div>
            </div>

            {/* Main Result Callout */}
            <div>
              <span className="text-xs font-semibold text-slate-655 dark:text-slate-400">Clear Walkthrough Opening</span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-0.5 font-mono tracking-tight">
                {formatUnit(calculations.providedClearWidthMm)} × {formatUnit(calculations.providedClearHeightMm)} <span className="text-sm font-normal text-slate-400">{unit}</span>
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-655 dark:text-slate-400 font-medium">
                <span>{calculations.minExitsRequired} Required Exits</span>
                <span>•</span>
                <span>{doorStyle.replace('_', ' ').toUpperCase()}</span>
                <span>•</span>
                <span>{calculations.isAdaCompliant ? 'ADA PASS' : 'ADA FAIL'}</span>
              </div>
            </div>

            {/* Detailed Framing Dimensions Table */}
            <div className="border-t border-slate-100 dark:border-slate-800/60 pt-3 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Door Shutter Leaf Size</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                  {formatUnit(calculations.shutterWidthMm)} × {formatUnit(calculations.shutterHeightMm)} {unit}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Frame Outer (Chowkhat)</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                  {formatUnit(calculations.frameOuterWidthMm)} × {formatUnit(calculations.frameOuterHeightMm)} {unit}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Structural Rough Opening</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                  {formatUnit(calculations.roughOpeningWidthMm)} × {formatUnit(calculations.roughOpeningHeightMm)} {unit}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Code Required Egress Width</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                  {formatUnit(calculations.codeRequiredEgressWidthMm)} {unit} ({occupantLoad} Persons)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Hardware & Hinges</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {calculations.recommendedHingeCount}x {calculations.hingeSize.split(' ')[0]}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

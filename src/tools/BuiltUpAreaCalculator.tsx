import { useState, useMemo } from 'react';
import { 
  Building2, Copy, Check, Download, Plus, Trash2, 
  Sparkles, Layers, Ruler, Calculator, 
  Info, ShieldCheck, Landmark, ArrowRightLeft, FileSpreadsheet,
  Grid, CopyPlus
} from 'lucide-react';
import { jsPDF } from 'jspdf';

// --- Types & Interfaces ---
export type AreaUnit = 'sqft' | 'sqm' | 'sqyd';
export type LinearUnit = 'in' | 'mm' | 'ft' | 'cm';
export type RoomCategory = 'carpet' | 'balcony' | 'utility' | 'terrace' | 'passage';

export interface RoomItem {
  id: string;
  name: string;
  category: RoomCategory;
  width: number;
  length: number;
  count: number;
}

export interface WallPreset {
  id: string;
  name: string;
  externalThicknessInches: number;
  internalThicknessInches: number;
  description: string;
}

export interface LayoutPreset {
  name: string;
  desc: string;
  unit: AreaUnit;
  wallPresetId: string;
  rooms: Omit<RoomItem, 'id'>[];
  floorsCount: number;
}

const WALL_PRESETS: WallPreset[] = [
  {
    id: 'brick-standard',
    name: 'Standard Red Brick (9" Ext / 4.5" Int)',
    externalThicknessInches: 9,
    internalThicknessInches: 4.5,
    description: 'Traditional 230mm exterior load-bearing/envelope walls with 115mm interior partition walls.'
  },
  {
    id: 'aac-blocks',
    name: 'AAC Light Blockwork (8" Ext / 4" Int)',
    externalThicknessInches: 8,
    internalThicknessInches: 4,
    description: 'Modern 200mm exterior Autoclaved Aerated Concrete with 100mm lightweight internal partitions.'
  },
  {
    id: 'mivan-rcc',
    name: 'Mivan / Monolithic RCC (6.3" Ext / 4" Int)',
    externalThicknessInches: 6.3, // ~160mm
    internalThicknessInches: 4,   // ~100mm
    description: 'High-rise shear wall aluminum formwork system (160mm external / 100mm internal RCC walls).'
  },
  {
    id: 'drywall-steel',
    name: 'Steel Stud & Drywall (6" Ext / 3" Int)',
    externalThicknessInches: 6,
    internalThicknessInches: 3,
    description: 'Commercial & modular pre-fab drywall partitions with insulated exterior cladding.'
  },
  {
    id: 'stone-masonry',
    name: 'Heavy Stone Masonry (12" Ext / 6" Int)',
    externalThicknessInches: 12,
    internalThicknessInches: 6,
    description: 'Stone or solid masonry walls common in traditional or hill station residential construction.'
  },
  {
    id: 'custom',
    name: 'Custom Wall Thickness',
    externalThicknessInches: 9,
    internalThicknessInches: 4.5,
    description: 'Manually specify custom exterior and interior wall thicknesses.'
  }
];

const LAYOUT_PRESETS: Record<string, LayoutPreset> = {
  '1bhk': {
    name: '1 BHK Compact (450 sq ft)',
    desc: 'Standard urban 1 Bedroom, Hall, Kitchen with Balcony & Utility',
    unit: 'sqft',
    wallPresetId: 'brick-standard',
    floorsCount: 1,
    rooms: [
      { name: 'Living & Dining Room', category: 'carpet', width: 11, length: 14, count: 1 },
      { name: 'Master Bedroom', category: 'carpet', width: 10, length: 12, count: 1 },
      { name: 'Kitchen', category: 'carpet', width: 7, length: 9, count: 1 },
      { name: 'Bathroom / WC', category: 'carpet', width: 5, length: 7, count: 1 },
      { name: 'Passage & Entry Foyer', category: 'passage', width: 4, length: 6, count: 1 },
      { name: 'Living Balcony', category: 'balcony', width: 4, length: 10, count: 1 },
      { name: 'Kitchen Dry Utility', category: 'utility', width: 3.5, length: 6, count: 1 }
    ]
  },
  '2bhk': {
    name: '2 BHK Standard (780 sq ft)',
    desc: 'Ideal family 2 Bedroom apartment with 2 Bathrooms, 2 Balconies, and Utility',
    unit: 'sqft',
    wallPresetId: 'brick-standard',
    floorsCount: 1,
    rooms: [
      { name: 'Living Room', category: 'carpet', width: 12, length: 16, count: 1 },
      { name: 'Dining Space', category: 'carpet', width: 9, length: 10, count: 1 },
      { name: 'Master Bedroom', category: 'carpet', width: 11, length: 13, count: 1 },
      { name: 'Kids / Guest Bedroom', category: 'carpet', width: 10, length: 11, count: 1 },
      { name: 'Kitchen', category: 'carpet', width: 8, length: 10, count: 1 },
      { name: 'Master Bathroom', category: 'carpet', width: 5, length: 8, count: 1 },
      { name: 'Common Bathroom', category: 'carpet', width: 4.5, length: 7, count: 1 },
      { name: 'Entry Foyer & Lobby', category: 'passage', width: 4.5, length: 8, count: 1 },
      { name: 'Living Balcony', category: 'balcony', width: 4.5, length: 12, count: 1 },
      { name: 'Bedroom Balcony', category: 'balcony', width: 4, length: 9, count: 1 },
      { name: 'Dry Balcony / Utility', category: 'utility', width: 3.5, length: 7, count: 1 }
    ]
  },
  '3bhk': {
    name: '3 BHK Premium (1,250 sq ft)',
    desc: 'Spacious 3 Bedroom flat with Dressers, 3 Toilets, Balconies, and Store',
    unit: 'sqft',
    wallPresetId: 'aac-blocks',
    floorsCount: 1,
    rooms: [
      { name: 'Grand Living Room', category: 'carpet', width: 14, length: 18, count: 1 },
      { name: 'Dining Room', category: 'carpet', width: 10, length: 12, count: 1 },
      { name: 'Master Suite', category: 'carpet', width: 13, length: 15, count: 1 },
      { name: 'Bedroom 2', category: 'carpet', width: 12, length: 13, count: 1 },
      { name: 'Bedroom 3 / Study', category: 'carpet', width: 11, length: 12, count: 1 },
      { name: 'Kitchen & Pantry', category: 'carpet', width: 9, length: 12, count: 1 },
      { name: 'Puja / Store Room', category: 'carpet', width: 4, length: 5, count: 1 },
      { name: 'Attached Bath 1', category: 'carpet', width: 5.5, length: 8.5, count: 1 },
      { name: 'Attached Bath 2', category: 'carpet', width: 5, length: 8, count: 1 },
      { name: 'Common Powder Room', category: 'carpet', width: 4.5, length: 6.5, count: 1 },
      { name: 'Internal Corridors', category: 'passage', width: 4, length: 14, count: 1 },
      { name: 'Deck / Main Balcony', category: 'balcony', width: 5, length: 14, count: 1 },
      { name: 'Bed 2 Balcony', category: 'balcony', width: 4, length: 10, count: 1 },
      { name: 'Utility Yard', category: 'utility', width: 4, length: 8, count: 1 }
    ]
  },
  'duplex-villa': {
    name: 'Duplex Villa (2,600 sq ft)',
    desc: 'Independent 2-Level Luxury Bungalow with Staircase Core, Portico & Terraces',
    unit: 'sqft',
    wallPresetId: 'brick-standard',
    floorsCount: 2,
    rooms: [
      { name: 'Ground Floor Living', category: 'carpet', width: 16, length: 20, count: 1 },
      { name: 'Dining & Open Kitchen', category: 'carpet', width: 14, length: 16, count: 1 },
      { name: 'Ground Master Bed', category: 'carpet', width: 13, length: 15, count: 1 },
      { name: 'Guest Bedroom', category: 'carpet', width: 12, length: 13, count: 1 },
      { name: 'First Floor Family Lounge', category: 'carpet', width: 14, length: 16, count: 1 },
      { name: 'Upper Master Suite', category: 'carpet', width: 15, length: 17, count: 1 },
      { name: 'Upper Bedroom 4', category: 'carpet', width: 12, length: 14, count: 1 },
      { name: 'Staircase & Duplex Void', category: 'passage', width: 8, length: 14, count: 1 },
      { name: 'Bathrooms (4 Nos)', category: 'carpet', width: 5.5, length: 8.5, count: 4 },
      { name: 'Ground Entry Porch / Verandah', category: 'balcony', width: 6, length: 14, count: 1 },
      { name: 'Upper Master Terrace', category: 'terrace', width: 8, length: 15, count: 1 },
      { name: 'Upper Lounge Balcony', category: 'balcony', width: 5, length: 12, count: 1 },
      { name: 'Service / Washing Area', category: 'utility', width: 5, length: 9, count: 1 }
    ]
  },
  'studio': {
    name: 'Studio Apartment (320 sq ft)',
    desc: 'Smart single-room living concept with kitchenette and compact bathroom',
    unit: 'sqft',
    wallPresetId: 'aac-blocks',
    floorsCount: 1,
    rooms: [
      { name: 'Studio Living / Bed Zone', category: 'carpet', width: 12, length: 16, count: 1 },
      { name: 'Kitchenette Area', category: 'carpet', width: 6, length: 7, count: 1 },
      { name: 'Compact Bathroom', category: 'carpet', width: 4.5, length: 6.5, count: 1 },
      { name: 'Standing Juliet Balcony', category: 'balcony', width: 3, length: 8, count: 1 }
    ]
  }
};

const QUICK_ROOM_PRESETS = [
  { name: 'Living Room', category: 'carpet' as RoomCategory, width: 12, length: 16, label: 'Living (12×16)' },
  { name: 'Master Bedroom', category: 'carpet' as RoomCategory, width: 11, length: 13, label: 'Master Bed (11×13)' },
  { name: 'Bedroom 2', category: 'carpet' as RoomCategory, width: 10, length: 11, label: 'Bed 2 (10×11)' },
  { name: 'Kitchen', category: 'carpet' as RoomCategory, width: 8, length: 10, label: 'Kitchen (8×10)' },
  { name: 'Bathroom / WC', category: 'carpet' as RoomCategory, width: 5, length: 8, label: 'Bathroom (5×8)' },
  { name: 'Living Balcony', category: 'balcony' as RoomCategory, width: 4.5, length: 12, label: 'Balcony (4.5×12)' },
  { name: 'Dry Utility Area', category: 'utility' as RoomCategory, width: 3.5, length: 7, label: 'Dry Utility (3.5×7)' },
  { name: 'Entry Foyer', category: 'passage' as RoomCategory, width: 4.5, length: 8, label: 'Foyer (4.5×8)' },
  { name: 'Open Terrace', category: 'terrace' as RoomCategory, width: 8, length: 12, label: 'Terrace (8×12)' }
];

export default function BuiltUpAreaCalculator() {
  // --- Calculation Mode ---
  const [calcMode, setCalcMode] = useState<'scheduler' | 'quick' | 'reverse'>('scheduler');
  const [unit, setUnit] = useState<AreaUnit>('sqft');
  const [roomFilter, setRoomFilter] = useState<'all' | RoomCategory>('all');
  
  // --- Mode 1: Room-by-Room Scheduler State ---
  const [rooms, setRooms] = useState<RoomItem[]>([
    { id: '1', name: 'Living & Dining Room', category: 'carpet', width: 12, length: 16, count: 1 },
    { id: '2', name: 'Master Bedroom', category: 'carpet', width: 11, length: 13, count: 1 },
    { id: '3', name: 'Second Bedroom', category: 'carpet', width: 10, length: 11, count: 1 },
    { id: '4', name: 'Kitchen', category: 'carpet', width: 8, length: 10, count: 1 },
    { id: '5', name: 'Master Bathroom', category: 'carpet', width: 5, length: 8, count: 1 },
    { id: '6', name: 'Common Bathroom', category: 'carpet', width: 4.5, length: 7, count: 1 },
    { id: '7', name: 'Passage & Foyer', category: 'passage', width: 4.5, length: 8, count: 1 },
    { id: '8', name: 'Living Balcony', category: 'balcony', width: 4.5, length: 12, count: 1 },
    { id: '9', name: 'Kitchen Dry Utility', category: 'utility', width: 3.5, length: 7, count: 1 }
  ]);

  const [selectedWallPreset, setSelectedWallPreset] = useState<string>('brick-standard');
  const [customExtWallInches, setCustomExtWallInches] = useState<number>(9);
  const [customIntWallInches, setCustomIntWallInches] = useState<number>(4.5);
  const [balconyBylawFactor, setBalconyBylawFactor] = useState<number>(100); // 100% or 50%
  const [floorsCount, setFloorsCount] = useState<number>(1);
  const [shaftDuctArea, setShaftDuctArea] = useState<number>(15); // sq ft
  const [commonLoadingPct, setCommonLoadingPct] = useState<number>(25); // For Super Built-up comparison
  const [costPerUnitRate, setCostPerUnitRate] = useState<number>(2200); // ₹ / sq ft or $ / sq m

  // --- Mode 2: Quick Factor State ---
  const [quickCarpet, setQuickCarpet] = useState<number>(850);
  const [quickBalconies, setQuickBalconies] = useState<number>(90);
  const [quickIntWallPct, setQuickIntWallPct] = useState<number>(4.5);
  const [quickExtWallPct, setQuickExtWallPct] = useState<number>(9.5);
  const [quickShafts, setQuickShafts] = useState<number>(15);
  const [quickFloors, setQuickFloors] = useState<number>(1);

  // --- Mode 3: Reverse Built-up Splitter ---
  const [revTargetBuiltUp, setRevTargetBuiltUp] = useState<number>(1200);
  const [revBalconySharePct, setRevBalconySharePct] = useState<number>(8); // 8% of BUA
  const [revWallSharePct, setRevWallSharePct] = useState<number>(13); // 13% of BUA

  // UI state
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'blueprint' | 'financials' | 'standards'>('blueprint');
  const [hoveredRoomId, setHoveredRoomId] = useState<string | null>(null);

  // --- Helpers for Wall Thickness ---
  const currentExtWallInches = useMemo(() => {
    if (selectedWallPreset === 'custom') return customExtWallInches;
    const p = WALL_PRESETS.find(w => w.id === selectedWallPreset);
    return p ? p.externalThicknessInches : 9;
  }, [selectedWallPreset, customExtWallInches]);

  const currentIntWallInches = useMemo(() => {
    if (selectedWallPreset === 'custom') return customIntWallInches;
    const p = WALL_PRESETS.find(w => w.id === selectedWallPreset);
    return p ? p.internalThicknessInches : 4.5;
  }, [selectedWallPreset, customIntWallInches]);

  // Unit conversion multipliers (all math standardized in sqft base)
  const unitLabel = unit === 'sqft' ? 'sq ft' : unit === 'sqm' ? 'sq m' : 'sq yd';
  const dimUnitLabel = unit === 'sqft' ? 'ft' : unit === 'sqm' ? 'm' : 'yd';
  const toSqFtMultiplier = unit === 'sqft' ? 1 : unit === 'sqm' ? 10.7639 : 9;

  // Category Theme Meta
  const getCategoryMeta = (cat: RoomCategory) => {
    switch (cat) {
      case 'carpet':
        return { 
          label: 'Carpet Area', 
          badge: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/80',
          barColor: 'bg-indigo-500',
          accent: 'border-l-indigo-500'
        };
      case 'balcony':
        return { 
          label: 'Balcony', 
          badge: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80',
          barColor: 'bg-emerald-500',
          accent: 'border-l-emerald-500'
        };
      case 'utility':
        return { 
          label: 'Dry Utility', 
          badge: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/80',
          barColor: 'bg-amber-500',
          accent: 'border-l-amber-500'
        };
      case 'terrace':
        return { 
          label: 'Terrace', 
          badge: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/80',
          barColor: 'bg-purple-500',
          accent: 'border-l-purple-500'
        };
      case 'passage':
        return { 
          label: 'Passage/Foyer', 
          badge: 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/80',
          barColor: 'bg-sky-500',
          accent: 'border-l-sky-500'
        };
    }
  };

  // --- Room Management Functions ---
  const addRoom = (preset?: typeof QUICK_ROOM_PRESETS[0]) => {
    const newRoom: RoomItem = {
      id: Date.now().toString(),
      name: preset ? preset.name : `Room ${rooms.length + 1}`,
      category: preset ? preset.category : 'carpet',
      width: preset ? preset.width : 10,
      length: preset ? preset.length : 12,
      count: 1
    };
    setRooms(prev => [...prev, newRoom]);
  };

  const duplicateRoom = (room: RoomItem) => {
    const newRoom: RoomItem = {
      ...room,
      id: Date.now().toString(),
      name: `${room.name} (Copy)`
    };
    setRooms(prev => [...prev, newRoom]);
  };

  const removeRoom = (id: string) => {
    if (rooms.length <= 1) return;
    setRooms(prev => prev.filter(r => r.id !== id));
  };

  const updateRoom = (id: string, updates: Partial<RoomItem>) => {
    setRooms(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const applyLayoutPreset = (presetKey: string) => {
    const preset = LAYOUT_PRESETS[presetKey];
    if (!preset) return;
    setUnit(preset.unit);
    setSelectedWallPreset(preset.wallPresetId);
    setFloorsCount(preset.floorsCount);
    setRooms(preset.rooms.map((r, idx) => ({ ...r, id: `${Date.now()}-${idx}` })));
  };

  // Filtered rooms list for display
  const filteredRooms = useMemo(() => {
    if (roomFilter === 'all') return rooms;
    return rooms.filter(r => r.category === roomFilter);
  }, [rooms, roomFilter]);

  // Total floor area sum of rooms (single floor)
  const totalSingleFloorArea = useMemo(() => {
    return rooms.reduce((acc, r) => acc + (r.width * r.length * (r.count || 1)), 0);
  }, [rooms]);

  // --- Core Built-Up Area Mathematical Engine ---
  const calculationResults = useMemo(() => {
    if (calcMode === 'scheduler') {
      let carpetSubtotal = 0;
      let balconySubtotal = 0;
      let utilitySubtotal = 0;
      let terraceSubtotal = 0;
      let passageSubtotal = 0;

      rooms.forEach(r => {
        const area = (r.width * r.length) * (r.count || 1);
        if (r.category === 'carpet') carpetSubtotal += area;
        else if (r.category === 'balcony') balconySubtotal += area;
        else if (r.category === 'utility') utilitySubtotal += area;
        else if (r.category === 'terrace') terraceSubtotal += area;
        else if (r.category === 'passage') passageSubtotal += area;
      });

      const totalReraCarpetSingleFloor = carpetSubtotal + passageSubtotal;
      const totalBalconyUtilitySingleFloor = balconySubtotal + utilitySubtotal + terraceSubtotal;

      const extWallThicknessFeet = (currentExtWallInches / 12);
      const internalFootprintSqft = (totalReraCarpetSingleFloor + totalBalconyUtilitySingleFloor) * toSqFtMultiplier;
      const approxSideLengthFt = Math.sqrt(Math.max(10, internalFootprintSqft));
      const estimatedExternalPerimeterFt = (approxSideLengthFt * 4) * 1.08;
      
      const extWallAreaSqFt = (estimatedExternalPerimeterFt * extWallThicknessFeet) + (4 * extWallThicknessFeet * extWallThicknessFeet);
      const extWallAreaConverted = extWallAreaSqFt / toSqFtMultiplier;

      const intWallFactor = (currentIntWallInches / 4.5) * 0.048;
      const intWallAreaConverted = totalReraCarpetSingleFloor * intWallFactor;

      const totalWallAreaSingleFloor = extWallAreaConverted + intWallAreaConverted;
      const effectiveBalconyAreaSingleFloor = (totalBalconyUtilitySingleFloor * balconyBylawFactor) / 100;

      const singleFloorBuiltUp = totalReraCarpetSingleFloor + effectiveBalconyAreaSingleFloor + totalWallAreaSingleFloor + shaftDuctArea;

      const totalGrossBuiltUp = singleFloorBuiltUp * floorsCount;
      const totalReraCarpet = totalReraCarpetSingleFloor * floorsCount;
      const totalBalcony = totalBalconyUtilitySingleFloor * floorsCount;
      const totalWallArea = totalWallAreaSingleFloor * floorsCount;
      const totalExtWallArea = extWallAreaConverted * floorsCount;
      const totalIntWallArea = intWallAreaConverted * floorsCount;

      const floorEfficiencyRatio = totalGrossBuiltUp > 0 ? (totalReraCarpet / totalGrossBuiltUp) * 100 : 0;
      const wallAreaRatio = totalGrossBuiltUp > 0 ? (totalWallArea / totalGrossBuiltUp) * 100 : 0;
      const balconyRatio = totalGrossBuiltUp > 0 ? (totalBalcony / totalGrossBuiltUp) * 100 : 0;
      const superBuiltUpArea = totalGrossBuiltUp * (1 + (commonLoadingPct / 100));

      return {
        totalGrossBuiltUp,
        totalReraCarpet,
        totalBalcony,
        totalWallArea,
        totalExtWallArea,
        totalIntWallArea,
        shaftDuctArea: shaftDuctArea * floorsCount,
        floorEfficiencyRatio,
        wallAreaRatio,
        balconyRatio,
        superBuiltUpArea,
        singleFloorBuiltUp,
        carpetSubtotal: carpetSubtotal * floorsCount,
        balconySubtotal: balconySubtotal * floorsCount,
        utilitySubtotal: utilitySubtotal * floorsCount,
        terraceSubtotal: terraceSubtotal * floorsCount,
        passageSubtotal: passageSubtotal * floorsCount,
        estimatedExternalPerimeter: estimatedExternalPerimeterFt
      };
    } else if (calcMode === 'quick') {
      const intWallArea = quickCarpet * (quickIntWallPct / 100);
      const extWallArea = (quickCarpet + quickBalconies) * (quickExtWallPct / 100);
      const totalWall = intWallArea + extWallArea;
      const singleFloor = quickCarpet + quickBalconies + totalWall + quickShafts;
      const totalGrossBuiltUp = singleFloor * quickFloors;
      const totalReraCarpet = quickCarpet * quickFloors;
      const totalBalcony = quickBalconies * quickFloors;
      const totalWallArea = totalWall * quickFloors;

      const floorEfficiencyRatio = totalGrossBuiltUp > 0 ? (totalReraCarpet / totalGrossBuiltUp) * 100 : 0;
      const wallAreaRatio = totalGrossBuiltUp > 0 ? (totalWallArea / totalGrossBuiltUp) * 100 : 0;
      const balconyRatio = totalGrossBuiltUp > 0 ? (totalBalcony / totalGrossBuiltUp) * 100 : 0;
      const superBuiltUpArea = totalGrossBuiltUp * (1 + (commonLoadingPct / 100));

      return {
        totalGrossBuiltUp,
        totalReraCarpet,
        totalBalcony,
        totalWallArea,
        totalExtWallArea: extWallArea * quickFloors,
        totalIntWallArea: intWallArea * quickFloors,
        shaftDuctArea: quickShafts * quickFloors,
        floorEfficiencyRatio,
        wallAreaRatio,
        balconyRatio,
        superBuiltUpArea,
        singleFloorBuiltUp: singleFloor,
        carpetSubtotal: totalReraCarpet,
        balconySubtotal: totalBalcony,
        utilitySubtotal: 0,
        terraceSubtotal: 0,
        passageSubtotal: 0,
        estimatedExternalPerimeter: 0
      };
    } else {
      const totalGrossBuiltUp = revTargetBuiltUp;
      const totalBalcony = revTargetBuiltUp * (revBalconySharePct / 100);
      const totalWallArea = revTargetBuiltUp * (revWallSharePct / 100);
      const totalReraCarpet = Math.max(0, totalGrossBuiltUp - totalBalcony - totalWallArea);

      const floorEfficiencyRatio = (totalReraCarpet / totalGrossBuiltUp) * 100;
      const wallAreaRatio = (totalWallArea / totalGrossBuiltUp) * 100;
      const balconyRatio = (totalBalcony / totalGrossBuiltUp) * 100;
      const superBuiltUpArea = totalGrossBuiltUp * (1 + (commonLoadingPct / 100));

      return {
        totalGrossBuiltUp,
        totalReraCarpet,
        totalBalcony,
        totalWallArea,
        totalExtWallArea: totalWallArea * 0.65,
        totalIntWallArea: totalWallArea * 0.35,
        shaftDuctArea: 0,
        floorEfficiencyRatio,
        wallAreaRatio,
        balconyRatio,
        superBuiltUpArea,
        singleFloorBuiltUp: totalGrossBuiltUp,
        carpetSubtotal: totalReraCarpet,
        balconySubtotal: totalBalcony,
        utilitySubtotal: 0,
        terraceSubtotal: 0,
        passageSubtotal: 0,
        estimatedExternalPerimeter: 0
      };
    }
  }, [
    calcMode,
    rooms,
    selectedWallPreset,
    customExtWallInches,
    customIntWallInches,
    balconyBylawFactor,
    floorsCount,
    shaftDuctArea,
    commonLoadingPct,
    toSqFtMultiplier,
    quickCarpet,
    quickBalconies,
    quickIntWallPct,
    quickExtWallPct,
    quickShafts,
    quickFloors,
    revTargetBuiltUp,
    revBalconySharePct,
    revWallSharePct
  ]);

  // Financial Estimates
  const financialEstimates = useMemo(() => {
    const bua = calculationResults.totalGrossBuiltUp;
    const carpet = calculationResults.totalReraCarpet;
    const superBua = calculationResults.superBuiltUpArea;

    const totalCivilCost = bua * costPerUnitRate;
    const effectiveCarpetRate = carpet > 0 ? totalCivilCost / carpet : 0;
    const effectiveSuperBuaRate = superBua > 0 ? totalCivilCost / superBua : 0;

    const buaSqFt = bua * toSqFtMultiplier;
    const cementBags = Math.round(buaSqFt * 0.42);
    const steelKg = Math.round(buaSqFt * 3.85);
    const sandCuFt = Math.round(buaSqFt * 1.85);
    const aggregateCuFt = Math.round(buaSqFt * 1.35);
    const bricksCount = Math.round((calculationResults.totalWallArea * toSqFtMultiplier) * 9.5);

    return {
      totalCivilCost,
      effectiveCarpetRate,
      effectiveSuperBuaRate,
      cementBags,
      steelKg,
      sandCuFt,
      aggregateCuFt,
      bricksCount
    };
  }, [calculationResults, costPerUnitRate, toSqFtMultiplier]);

  // Copy Architectural Schedule Summary
  const copyAuditReport = () => {
    const res = calculationResults;
    const text = `=====================================================
TOOLIQUE ARCHITECTURAL BUILT-UP AREA SCHEDULE
=====================================================
Calculation Standard   : IS 3861:2002 & RERA Real Estate Act 2016
Selected Unit          : ${unitLabel.toUpperCase()}
Floor Levels / Multiplier: ${floorsCount} Floor(s)
Wall Construction      : ${WALL_PRESETS.find(w => w.id === selectedWallPreset)?.name || 'Custom'}
- Exterior Envelope Wall: ${currentExtWallInches} inches (${(currentExtWallInches * 25.4).toFixed(0)} mm)
- Interior Partition Wall: ${currentIntWallInches} inches (${(currentIntWallInches * 25.4).toFixed(0)} mm)

-----------------------------------------------------
PRIMARY SPATIAL COMPUTATIONS
-----------------------------------------------------
1. Total RERA Usable Carpet Area : ${res.totalReraCarpet.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${unitLabel} (${res.floorEfficiencyRatio.toFixed(1)}% Efficiency)
2. Total Balconies & Verandahs   : ${res.totalBalcony.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${unitLabel} (${res.balconyRatio.toFixed(1)}%)
3. Total Structural Wall Footprint: ${res.totalWallArea.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${unitLabel} (${res.wallAreaRatio.toFixed(1)}%)
   - Exterior Perimeter Walls    : ${res.totalExtWallArea.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${unitLabel}
   - Interior Partition Walls    : ${res.totalIntWallArea.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${unitLabel}
4. Shafts, Columns & Duct Area   : ${res.shaftDuctArea.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${unitLabel}
-----------------------------------------------------
TOTAL GROSS BUILT-UP AREA (BUA)  : ${res.totalGrossBuiltUp.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${unitLabel}
-----------------------------------------------------
Estimated Super Built-up Area    : ${res.superBuiltUpArea.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${unitLabel} (with ${commonLoadingPct}% common loading)

-----------------------------------------------------
CIVIL FINANCIALS & MATERIAL THUMB-RULES
-----------------------------------------------------
Estimated Civil Construction Cost: ₹${financialEstimates.totalCivilCost.toLocaleString()} (@ ₹${costPerUnitRate}/${unitLabel})
- Equivalent Rate on Net Carpet  : ₹${financialEstimates.effectiveCarpetRate.toLocaleString(undefined, { maximumFractionDigits: 0 })} / ${unitLabel}
- Estimated Structural Cement    : ${financialEstimates.cementBags.toLocaleString()} Bags (50kg)
- Estimated Structural Steel     : ${financialEstimates.steelKg.toLocaleString()} kg (~${(financialEstimates.steelKg / 1000).toFixed(2)} MT)
- Estimated Sand Requirement     : ${financialEstimates.sandCuFt.toLocaleString()} cu.ft
- Estimated Bricks / AAC Blocks  : ${financialEstimates.bricksCount.toLocaleString()} units

Generated via Toolique Architecture Suite (https://toolique.in)
=====================================================`;

    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  // Export CSV Room Schedule
  const exportCSV = () => {
    const headers = ['Room Name', 'Classification', 'Width', 'Length', 'Count', `Total Area (${unitLabel})`];
    const rows = rooms.map(r => [
      `"${r.name}"`,
      r.category.toUpperCase(),
      r.width,
      r.length,
      r.count,
      ((r.width * r.length) * r.count).toFixed(2)
    ]);
    const summaryRows = [
      [],
      ['SUMMARY AUDIT METRICS', '', '', '', '', ''],
      ['RERA Net Usable Carpet', '', '', '', '', calculationResults.totalReraCarpet.toFixed(2)],
      ['Balconies & Projections', '', '', '', '', calculationResults.totalBalcony.toFixed(2)],
      ['Structural Wall Footprint', '', '', '', '', calculationResults.totalWallArea.toFixed(2)],
      ['GROSS BUILT-UP AREA (BUA)', '', '', '', '', calculationResults.totalGrossBuiltUp.toFixed(2)],
      ['Super Built-Up Area', '', '', '', '', calculationResults.superBuiltUpArea.toFixed(2)]
    ];

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(',')), ...summaryRows.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Toolique_BuiltUp_Area_Schedule_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Professional PDF Certificate
  const exportPDF = () => {
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const res = calculationResults;
      const fin = financialEstimates;

      doc.setFillColor(30, 41, 59);
      doc.rect(0, 0, 210, 28, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('ARCHITECTURAL BUILT-UP AREA AUDIT', 14, 12);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Standardized Measurement Certificate (IS 3861:2002 & RERA Compliance)', 14, 18);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} | Toolique.in`, 14, 23);

      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, 34, 182, 38, 3, 3, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, 34, 182, 38, 3, 3, 'S');

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('TOTAL GROSS BUILT-UP (BUA)', 20, 42);
      doc.setFontSize(16);
      doc.setTextColor(79, 70, 229);
      doc.text(`${res.totalGrossBuiltUp.toLocaleString(undefined, { maximumFractionDigits: 1 })} ${unitLabel}`, 20, 50);

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('RERA USABLE CARPET', 85, 42);
      doc.setFontSize(14);
      doc.setTextColor(16, 185, 129);
      doc.text(`${res.totalReraCarpet.toLocaleString(undefined, { maximumFractionDigits: 1 })} ${unitLabel}`, 85, 50);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`Efficiency: ${res.floorEfficiencyRatio.toFixed(1)}%`, 85, 55);

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('WALLS + BALCONIES', 145, 42);
      doc.setFontSize(14);
      doc.setTextColor(245, 158, 11);
      doc.text(`${(res.totalWallArea + res.totalBalcony).toLocaleString(undefined, { maximumFractionDigits: 1 })} ${unitLabel}`, 145, 50);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`Walls: ${res.wallAreaRatio.toFixed(1)}% | Balc: ${res.balconyRatio.toFixed(1)}%`, 145, 55);

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('1. Wall Thickness & Structural Envelope Specifications', 14, 80);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`• Selected Construction Preset: ${WALL_PRESETS.find(w => w.id === selectedWallPreset)?.name || 'Custom Specification'}`, 16, 87);
      doc.text(`• External Perimeter Wall Width: ${currentExtWallInches} inches (${(currentExtWallInches * 25.4).toFixed(0)} mm)`, 16, 93);
      doc.text(`• Internal Partition Wall Width: ${currentIntWallInches} inches (${(currentIntWallInches * 25.4).toFixed(0)} mm)`, 16, 99);
      doc.text(`• Multi-Floor Multiplier: ${floorsCount} Level(s) | Balcony Municipal Treatment: ${balconyBylawFactor}% inclusion`, 16, 105);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('2. Architectural Room & Spatial Schedule', 14, 118);

      let startY = 125;
      doc.setFillColor(241, 245, 249);
      doc.rect(14, startY, 182, 7, 'F');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text('SPACE / ROOM', 18, startY + 5);
      doc.text('CLASSIFICATION', 80, startY + 5);
      doc.text('DIMENSIONS (W x L)', 125, startY + 5);
      doc.text(`AREA (${unitLabel.toUpperCase()})`, 165, startY + 5);

      startY += 8;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);

      rooms.slice(0, 12).forEach((room, idx) => {
        const rowArea = (room.width * room.length * room.count);
        doc.text(`${idx + 1}. ${room.name} ${room.count > 1 ? `(${room.count}x)` : ''}`, 18, startY + (idx * 6));
        doc.text(room.category.toUpperCase(), 80, startY + (idx * 6));
        doc.text(`${room.width} x ${room.length} ${dimUnitLabel}`, 125, startY + (idx * 6));
        doc.text(`${rowArea.toFixed(1)} ${unitLabel}`, 165, startY + (idx * 6));
      });

      const nextSectionY = startY + (Math.min(rooms.length, 12) * 6) + 12;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('3. Civil Construction & Material Thumb-rules', 14, nextSectionY);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`• Estimated Total Civil Cost: Rs. ${fin.totalCivilCost.toLocaleString()} (@ Rs. ${costPerUnitRate}/${unitLabel} Plinth Rate)`, 16, nextSectionY + 7);
      doc.text(`• Effective Cost per RERA Net Carpet Area: Rs. ${fin.effectiveCarpetRate.toLocaleString(undefined, { maximumFractionDigits: 0 })} / ${unitLabel}`, 16, nextSectionY + 13);
      doc.text(`• Structural Cement Estimate: ~${fin.cementBags.toLocaleString()} Bags (50kg OPC/PPC 43/53 Grade)`, 16, nextSectionY + 19);
      doc.text(`• Fe500D TMT Reinforcement Steel: ~${fin.steelKg.toLocaleString()} kg (~${(fin.steelKg / 1000).toFixed(2)} Metric Tonnes)`, 16, nextSectionY + 25);
      doc.text(`• Masonry Wall Units (Bricks/AAC Blocks): ~${fin.bricksCount.toLocaleString()} units`, 16, nextSectionY + 31);

      doc.setDrawColor(203, 213, 225);
      doc.line(14, 280, 196, 280);
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text('Toolique Architecture & Civil Calculations Suite • Free Instant Client-Side Computation Tool • toolique.in', 14, 285);

      doc.save(`BuiltUp_Area_Audit_Certificate_${Date.now()}.pdf`);
    } catch (e) {
      console.error('PDF Generation Error', e);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-left">
      
      {/* -------------------- Top Action Toolbar & Layout Presets -------------------- */}
      <div className="saas-card p-5 md:p-6 space-y-4 bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 border border-indigo-500/20">
            <Building2 className="w-3.5 h-3.5" />
            <span>IS 3861:2002 & RERA Compliant Plinth Calculation Engine</span>
          </div>

          {/* Unit Switcher & Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-zinc-100/80 dark:bg-zinc-850/80 p-1 rounded-xl border border-zinc-200/60 dark:border-zinc-800 flex items-center">
              {(['sqft', 'sqm', 'sqyd'] as AreaUnit[]).map(u => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnit(u)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    unit === u
                      ? 'bg-white dark:bg-zinc-900 text-indigo-650 dark:text-indigo-400 shadow-xs border border-zinc-200/50 dark:border-zinc-700/50'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  {u === 'sqft' ? 'Sq. Ft' : u === 'sqm' ? 'Sq. Meters' : 'Sq. Yards'}
                </button>
              ))}
            </div>

            <button
              onClick={copyAuditReport}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              {copiedReport ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedReport ? 'Copied' : 'Copy Audit'}</span>
            </button>

            <button
              onClick={exportPDF}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-black uppercase tracking-wider transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              title="Download Architectural Certificate"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF Report</span>
            </button>
          </div>
        </div>

        {/* Quick Layout Presets Bar */}
        <div className="pt-3 border-t border-zinc-200/60 dark:border-zinc-800/80">
          <div className="flex items-center gap-2 mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[11px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Instant Architectural Layout Presets:
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(LAYOUT_PRESETS).map(([key, preset]) => (
              <button
                key={key}
                type="button"
                onClick={() => applyLayoutPreset(key)}
                className="px-3 py-1.5 rounded-xl bg-zinc-100/70 dark:bg-zinc-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-zinc-700 dark:text-zinc-300 hover:text-indigo-650 dark:hover:text-indigo-400 border border-zinc-200/60 dark:border-zinc-700/60 text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <span>{preset.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* -------------------- Calculation Mode Tabs -------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-2 bg-zinc-100/90 dark:bg-zinc-900/90 p-1.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setCalcMode('scheduler')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              calcMode === 'scheduler'
                ? 'bg-white dark:bg-zinc-800 text-indigo-650 dark:text-indigo-400 shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>1. Room-by-Room Scheduler</span>
          </button>

          <button
            type="button"
            onClick={() => setCalcMode('quick')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              calcMode === 'quick'
                ? 'bg-white dark:bg-zinc-800 text-indigo-650 dark:text-indigo-400 shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>2. Quick Loading Factor</span>
          </button>

          <button
            type="button"
            onClick={() => setCalcMode('reverse')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              calcMode === 'reverse'
                ? 'bg-white dark:bg-zinc-800 text-indigo-650 dark:text-indigo-400 shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>3. Reverse BUA Splitter</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>NBC 2016 Part 3 Spatial Regulations</span>
        </div>
      </div>

      {/* -------------------- Main Two-Column Layout -------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Mode 1: Room-by-Room Scheduler */}
          {calcMode === 'scheduler' && (
            <div className="space-y-6">
              
              {/* Construction Wall Presets & Thickness Controls */}
              <div className="saas-card p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <Ruler className="w-4 h-4 text-indigo-500" />
                      <span>Wall Construction & Thickness Settings</span>
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                      Select typical structural masonry or customize exterior envelope and interior partition widths.
                    </p>
                  </div>
                </div>

                {/* Wall Presets Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {WALL_PRESETS.map(preset => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSelectedWallPreset(preset.id)}
                      className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                        selectedWallPreset === preset.id
                          ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                          : 'bg-zinc-50/80 dark:bg-zinc-900/50 border-zinc-200/60 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div>
                        <div className="font-extrabold text-xs text-zinc-900 dark:text-white">
                          {preset.name}
                        </div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
                          {preset.description}
                        </div>
                      </div>
                      <div className="mt-3 pt-2 border-t border-zinc-200/40 dark:border-zinc-800/40 flex justify-between text-[10px] font-mono font-bold text-indigo-650 dark:text-indigo-400">
                        <span>Ext: {preset.externalThicknessInches}"</span>
                        <span>Int: {preset.internalThicknessInches}"</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Custom Wall Thickness Inputs */}
                {selectedWallPreset === 'custom' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Exterior Perimeter Wall Thickness (Inches)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        step="0.5"
                        value={customExtWallInches}
                        onChange={e => setCustomExtWallInches(parseFloat(e.target.value) || 0)}
                        className="saas-input font-mono text-sm"
                      />
                      <span className="text-[10px] text-zinc-400 mt-1 block">
                        Equivalent: {(customExtWallInches * 25.4).toFixed(0)} mm / {(customExtWallInches / 12).toFixed(2)} ft
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Interior Partition Wall Thickness (Inches)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        step="0.5"
                        value={customIntWallInches}
                        onChange={e => setCustomIntWallInches(parseFloat(e.target.value) || 0)}
                        className="saas-input font-mono text-sm"
                      />
                      <span className="text-[10px] text-zinc-400 mt-1 block">
                        Equivalent: {(customIntWallInches * 25.4).toFixed(0)} mm / {(customIntWallInches / 12).toFixed(2)} ft
                      </span>
                    </div>
                  </div>
                )}

                {/* Additional Multipliers */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Floors / Duplex Multiplier
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={floorsCount}
                      onChange={e => setFloorsCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="saas-input font-mono text-sm"
                    />
                    <span className="text-[10px] text-zinc-400 mt-1 block">
                      Multiplies gross built-up footprint across floors
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Balcony Municipal Factor
                    </label>
                    <select
                      value={balconyBylawFactor}
                      onChange={e => setBalconyBylawFactor(parseInt(e.target.value) || 100)}
                      className="saas-input text-xs font-bold"
                    >
                      <option value={100}>100% Inclusion (Standard BUA / RERA)</option>
                      <option value={50}>50% Inclusion (Municipal Concession)</option>
                    </select>
                    <span className="text-[10px] text-zinc-400 mt-1 block">
                      Local municipal FSI / BUA discount
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Shafts, Ducts & Columns ({unitLabel})
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={shaftDuctArea}
                      onChange={e => setShaftDuctArea(parseFloat(e.target.value) || 0)}
                      className="saas-input font-mono text-sm"
                    />
                    <span className="text-[10px] text-zinc-400 mt-1 block">
                      Plumbing/electrical service voids within plinth
                    </span>
                  </div>
                </div>
              </div>

              {/* -------------------- Enhanced Room Schedule Section -------------------- */}
              <div className="saas-card p-6 space-y-5 border border-indigo-100/70 dark:border-zinc-800 shadow-sm">
                
                {/* Section Header with Live Badges */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-200/70 dark:border-zinc-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-650 dark:text-indigo-400">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                          Architectural Room & Balcony Schedule
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                          Define internal carpet dimensions (W × L) and classify each space.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Header Metrics Pill & Top Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/90 border border-zinc-200/60 dark:border-zinc-700/60 text-xs font-bold text-zinc-700 dark:text-zinc-300 font-mono">
                      <span className="text-indigo-650 dark:text-indigo-400 font-black">{rooms.length}</span> Spaces • <span className="text-indigo-650 dark:text-indigo-400 font-black">{totalSingleFloorArea.toFixed(1)}</span> {unitLabel}
                    </div>

                    <button
                      type="button"
                      onClick={exportCSV}
                      className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      title="Export CSV Schedule"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="hidden sm:inline">CSV</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => addRoom()}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-black uppercase tracking-wider transition-all shadow-sm hover:shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Room</span>
                    </button>
                  </div>
                </div>

                {/* Quick Add Presets Bar */}
                <div className="space-y-2 bg-zinc-50/70 dark:bg-zinc-900/50 p-3 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/60">
                  <div className="flex items-center justify-between text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>One-Click Standard Room Adder:</span>
                    </span>
                    <span className="text-[10px] uppercase font-mono text-zinc-400">Pre-dimensioned</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_ROOM_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => addRoom(preset)}
                        className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-zinc-700 dark:text-zinc-300 hover:text-indigo-650 dark:hover:text-indigo-400 border border-zinc-200/70 dark:border-zinc-700/70 text-[11px] font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Plus className="w-3 h-3 text-indigo-500" />
                        <span>{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Filter Tabs */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {[
                    { id: 'all', label: 'All Spaces', count: rooms.length },
                    { id: 'carpet', label: 'Carpet Area', count: rooms.filter(r => r.category === 'carpet').length },
                    { id: 'balcony', label: 'Balconies', count: rooms.filter(r => r.category === 'balcony').length },
                    { id: 'utility', label: 'Utility / Wash', count: rooms.filter(r => r.category === 'utility').length },
                    { id: 'passage', label: 'Passage / Foyer', count: rooms.filter(r => r.category === 'passage').length },
                    { id: 'terrace', label: 'Terraces', count: rooms.filter(r => r.category === 'terrace').length },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setRoomFilter(tab.id as 'all' | RoomCategory)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        roomFilter === tab.id
                          ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs'
                          : 'bg-zinc-100/70 dark:bg-zinc-850/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-black ${
                        roomFilter === tab.id
                          ? 'bg-white/20 dark:bg-zinc-900/20 text-white dark:text-zinc-900'
                          : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Rooms List Container */}
                <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
                  {filteredRooms.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-400">
                      <p className="text-xs font-bold">No rooms matching this category filter.</p>
                      <button
                        type="button"
                        onClick={() => setRoomFilter('all')}
                        className="mt-2 text-xs font-extrabold text-indigo-600 dark:text-indigo-400 underline cursor-pointer"
                      >
                        Show all spaces
                      </button>
                    </div>
                  ) : (
                    filteredRooms.map((room, idx) => {
                      const meta = getCategoryMeta(room.category);
                      const rowArea = (room.width * room.length) * (room.count || 1);
                      const footprintPct = totalSingleFloorArea > 0 ? (rowArea / totalSingleFloorArea) * 100 : 0;

                      return (
                        <div
                          key={room.id}
                          onMouseEnter={() => setHoveredRoomId(room.id)}
                          onMouseLeave={() => setHoveredRoomId(null)}
                          className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden flex flex-col gap-3.5 border-l-4 ${meta.accent} ${
                            hoveredRoomId === room.id
                              ? 'bg-indigo-500/5 dark:bg-indigo-950/20 border-indigo-400/40 dark:border-indigo-600/40 shadow-sm'
                              : 'bg-white/90 dark:bg-zinc-900/60 border-zinc-200/70 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700'
                          }`}
                        >
                          {/* Top Row: Room Number, Icon, Name, and Category */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            
                            {/* Room Info Block */}
                            <div className="flex items-center gap-2.5 flex-grow">
                              <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-650 dark:text-zinc-300 shrink-0 font-mono text-xs font-black" title={`Space #${idx + 1}`}>
                                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono font-black">#{idx + 1}</span>
                              </div>

                              <div className="flex-grow">
                                <input
                                  type="text"
                                  value={room.name}
                                  onChange={e => updateRoom(room.id, { name: e.target.value })}
                                  className="saas-input py-1 px-2 text-xs font-extrabold text-zinc-900 dark:text-white bg-transparent border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:bg-white dark:focus:bg-zinc-900 w-full"
                                  placeholder="Room name..."
                                />
                              </div>
                            </div>

                            {/* Classification Dropdown */}
                            <div className="shrink-0 flex items-center gap-2">
                              <select
                                value={room.category}
                                onChange={e => updateRoom(room.id, { category: e.target.value as RoomCategory })}
                                className={`py-1.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider border cursor-pointer ${meta.badge}`}
                              >
                                <option value="carpet">Carpet Area</option>
                                <option value="balcony">Balcony / Verandah</option>
                                <option value="utility">Dry Utility / Wash</option>
                                <option value="passage">Passage / Foyer</option>
                                <option value="terrace">Open Terrace</option>
                              </select>
                            </div>
                          </div>

                          {/* Bottom Row: Dimensions Controls, Multiplier, Computed Area, and Action Buttons */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80">
                            
                            {/* Width x Length Dimensions */}
                            <div className="flex items-center gap-2">
                              <div className="flex items-center bg-zinc-50 dark:bg-zinc-850 px-2.5 py-1 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60">
                                <span className="text-[10px] font-black uppercase text-zinc-400 mr-1.5">W</span>
                                <input
                                  type="number"
                                  min="1"
                                  step="0.5"
                                  value={room.width}
                                  onChange={e => updateRoom(room.id, { width: parseFloat(e.target.value) || 0 })}
                                  className="w-14 text-xs font-bold font-mono bg-transparent text-zinc-900 dark:text-white focus:outline-none text-center"
                                  title="Width"
                                />
                                <span className="text-[10px] font-bold text-zinc-400">{dimUnitLabel}</span>
                              </div>

                              <span className="text-zinc-400 font-black text-xs">×</span>

                              <div className="flex items-center bg-zinc-50 dark:bg-zinc-850 px-2.5 py-1 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60">
                                <span className="text-[10px] font-black uppercase text-zinc-400 mr-1.5">L</span>
                                <input
                                  type="number"
                                  min="1"
                                  step="0.5"
                                  value={room.length}
                                  onChange={e => updateRoom(room.id, { length: parseFloat(e.target.value) || 0 })}
                                  className="w-14 text-xs font-bold font-mono bg-transparent text-zinc-900 dark:text-white focus:outline-none text-center"
                                  title="Length"
                                />
                                <span className="text-[10px] font-bold text-zinc-400">{dimUnitLabel}</span>
                              </div>

                              {/* Multiplier Stepper */}
                              <div className="flex items-center bg-zinc-50 dark:bg-zinc-850 px-2 py-1 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60">
                                <span className="text-[10px] font-black uppercase text-zinc-400 mr-1">Qty</span>
                                <select
                                  value={room.count || 1}
                                  onChange={e => updateRoom(room.id, { count: parseInt(e.target.value) || 1 })}
                                  className="text-xs font-black font-mono bg-transparent text-zinc-900 dark:text-white focus:outline-none cursor-pointer"
                                >
                                  <option value={1}>1x</option>
                                  <option value={2}>2x</option>
                                  <option value={3}>3x</option>
                                  <option value={4}>4x</option>
                                  <option value={5}>5x</option>
                                </select>
                              </div>
                            </div>

                            {/* Subtotal Area & Actions */}
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className="text-xs sm:text-sm font-black font-mono text-zinc-900 dark:text-white">
                                  {rowArea.toFixed(1)} <span className="text-[10px] font-sans font-bold text-zinc-400">{unitLabel}</span>
                                </div>
                                <div className="text-[10px] font-mono font-bold text-zinc-400">
                                  {footprintPct.toFixed(1)}% footprint
                                </div>
                              </div>

                              <div className="flex items-center gap-1 border-l border-zinc-200 dark:border-zinc-800 pl-2">
                                <button
                                  type="button"
                                  onClick={() => duplicateRoom(room)}
                                  className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition cursor-pointer"
                                  title="Duplicate Room"
                                >
                                  <CopyPlus className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => removeRoom(room.id)}
                                  disabled={rooms.length <= 1}
                                  className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition disabled:opacity-30 cursor-pointer"
                                  title="Delete Room"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Subtotals Summary Bar */}
                <div className="p-4 rounded-2xl bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-500">Live Spatial Distribution:</span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 font-bold">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                      <span className="text-zinc-600 dark:text-zinc-400">Carpet:</span>
                      <span className="font-mono font-black text-zinc-900 dark:text-white">
                        {calculationResults.carpetSubtotal.toFixed(1)} {unitLabel}
                      </span>
                    </span>

                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-zinc-600 dark:text-zinc-400">Balconies:</span>
                      <span className="font-mono font-black text-zinc-900 dark:text-white">
                        {calculationResults.balconySubtotal.toFixed(1)} {unitLabel}
                      </span>
                    </span>

                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="text-zinc-600 dark:text-zinc-400">Utilities:</span>
                      <span className="font-mono font-black text-zinc-900 dark:text-white">
                        {calculationResults.utilitySubtotal.toFixed(1)} {unitLabel}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mode 2: Quick Factor */}
          {calcMode === 'quick' && (
            <div className="saas-card p-6 space-y-6">
              <div className="space-y-1">
                <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-indigo-500" />
                  <span>Quick Carpet-to-Built-up Multipliers</span>
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  Instant estimation using standard architectural loading percentages for internal and external masonry.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Net Usable Carpet Area ({unitLabel})
                  </label>
                  <input
                    type="number"
                    value={quickCarpet}
                    onChange={e => setQuickCarpet(parseFloat(e.target.value) || 0)}
                    className="saas-input font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Balconies & Open Verandahs ({unitLabel})
                  </label>
                  <input
                    type="number"
                    value={quickBalconies}
                    onChange={e => setQuickBalconies(parseFloat(e.target.value) || 0)}
                    className="saas-input font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Internal Wall Factor (% of Carpet)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={quickIntWallPct}
                    onChange={e => setQuickIntWallPct(parseFloat(e.target.value) || 0)}
                    className="saas-input font-mono text-sm"
                  />
                  <span className="text-[10px] text-zinc-400 mt-1 block">Typical: 4% to 6%</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    External Envelope Wall Factor (% of Footprint)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={quickExtWallPct}
                    onChange={e => setQuickExtWallPct(parseFloat(e.target.value) || 0)}
                    className="saas-input font-mono text-sm"
                  />
                  <span className="text-[10px] text-zinc-400 mt-1 block">Typical: 8% to 12%</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Shafts, Columns & Duct Area ({unitLabel})
                  </label>
                  <input
                    type="number"
                    value={quickShafts}
                    onChange={e => setQuickShafts(parseFloat(e.target.value) || 0)}
                    className="saas-input font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Number of Floors Multiplier
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quickFloors}
                    onChange={e => setQuickFloors(parseInt(e.target.value) || 1)}
                    className="saas-input font-mono text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Mode 3: Reverse Built-up Splitter */}
          {calcMode === 'reverse' && (
            <div className="saas-card p-6 space-y-6">
              <div className="space-y-1">
                <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-indigo-500" />
                  <span>Reverse Target Built-up Splitter</span>
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  Given a permissible gross Built-up Area (from plot FSI or brochure), derive maximum achievable RERA carpet space.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Target Gross Built-Up Area ({unitLabel})
                  </label>
                  <input
                    type="number"
                    value={revTargetBuiltUp}
                    onChange={e => setRevTargetBuiltUp(parseFloat(e.target.value) || 0)}
                    className="saas-input font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Target Balcony Share (% of BUA)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={revBalconySharePct}
                    onChange={e => setRevBalconySharePct(parseFloat(e.target.value) || 0)}
                    className="saas-input font-mono text-sm"
                  />
                  <span className="text-[10px] text-zinc-400 mt-1 block">Typical: 6% to 12%</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Structural Wall Deduction (% of BUA)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={revWallSharePct}
                    onChange={e => setRevWallSharePct(parseFloat(e.target.value) || 0)}
                    className="saas-input font-mono text-sm"
                  />
                  <span className="text-[10px] text-zinc-400 mt-1 block">Typical: 12% to 15%</span>
                </div>
              </div>
            </div>
          )}

          {/* Real Estate Super Built-up Loading & Financial Configuration */}
          <div className="saas-card p-6 space-y-4">
            <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Landmark className="w-4 h-4 text-emerald-500" />
              <span>Real Estate Loading & Construction Cost Controls</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Common Area Developer Loading Factor (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={commonLoadingPct}
                  onChange={e => setCommonLoadingPct(parseFloat(e.target.value) || 0)}
                  className="saas-input font-mono text-sm"
                />
                <span className="text-[10px] text-zinc-400 mt-1 block">
                  For Super Built-up estimation (Lobbies, stairs, lift shafts ~ 20% to 35%)
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Civil Construction Plinth Rate (₹ / {unitLabel})
                </label>
                <input
                  type="number"
                  min="500"
                  step="50"
                  value={costPerUnitRate}
                  onChange={e => setCostPerUnitRate(parseFloat(e.target.value) || 0)}
                  className="saas-input font-mono text-sm"
                />
                <span className="text-[10px] text-zinc-400 mt-1 block">
                  Average RCC residential civil plinth construction cost
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Audit Dashboard & Visualizer (5 cols) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          
          {/* Main Hero KPI Card */}
          <div className="saas-card p-6 md:p-7 space-y-6 border-indigo-200/80 dark:border-indigo-900/40 bg-gradient-to-br from-white via-indigo-50/20 to-purple-50/20 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 shadow-md">
            
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Primary Area Computation
              </span>
              <div className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {calculationResults.floorEfficiencyRatio >= 80 ? 'Optimal Efficiency' : 'Standard Efficiency'}
              </div>
            </div>

            {/* Total Gross Built-Up Area Display */}
            <div>
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Total Gross Built-up Area (BUA)
              </span>
              <div className="text-3xl sm:text-4xl font-black font-mono text-indigo-650 dark:text-indigo-400 tracking-tight mt-1">
                {calculationResults.totalGrossBuiltUp.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                <span className="text-sm font-bold font-sans text-zinc-400 ml-2">{unitLabel}</span>
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                {floorsCount > 1 ? `Across ${floorsCount} floors (~${calculationResults.singleFloorBuiltUp.toFixed(1)} ${unitLabel} per floor)` : 'Single floor plinth footprint'}
              </div>
            </div>

            {/* Area Breakdown Progress Bar */}
            <div className="space-y-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-zinc-700 dark:text-zinc-300">Space Allocation Distribution</span>
                <span className="font-mono text-indigo-650 dark:text-indigo-400">100% Plinth</span>
              </div>
              
              <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                <div 
                  style={{ width: `${Math.min(100, calculationResults.floorEfficiencyRatio)}%` }} 
                  className="bg-indigo-500 h-full transition-all duration-500"
                  title={`Carpet Area: ${calculationResults.floorEfficiencyRatio.toFixed(1)}%`}
                />
                <div 
                  style={{ width: `${Math.min(100, calculationResults.balconyRatio)}%` }} 
                  className="bg-emerald-500 h-full transition-all duration-500"
                  title={`Balconies: ${calculationResults.balconyRatio.toFixed(1)}%`}
                />
                <div 
                  style={{ width: `${Math.min(100, calculationResults.wallAreaRatio)}%` }} 
                  className="bg-amber-500 h-full transition-all duration-500"
                  title={`Structural Walls: ${calculationResults.wallAreaRatio.toFixed(1)}%`}
                />
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center justify-between text-[11px] font-bold text-zinc-500 pt-1">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  Carpet ({calculationResults.floorEfficiencyRatio.toFixed(1)}%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Balconies ({calculationResults.balconyRatio.toFixed(1)}%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Walls ({calculationResults.wallAreaRatio.toFixed(1)}%)
                </span>
              </div>
            </div>

            {/* Detailed KPI Metric Rows */}
            <div className="space-y-3 pt-2 border-t border-zinc-200/60 dark:border-zinc-800 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-zinc-600 dark:text-zinc-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  RERA Net Usable Carpet Area:
                </span>
                <span className="font-mono font-bold text-zinc-900 dark:text-white">
                  {calculationResults.totalReraCarpet.toLocaleString(undefined, { maximumFractionDigits: 1 })} {unitLabel}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-zinc-600 dark:text-zinc-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Balconies & Open Verandahs:
                </span>
                <span className="font-mono font-bold text-zinc-900 dark:text-white">
                  {calculationResults.totalBalcony.toLocaleString(undefined, { maximumFractionDigits: 1 })} {unitLabel}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-zinc-600 dark:text-zinc-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Structural Walls (Ext + Int):
                </span>
                <span className="font-mono font-bold text-zinc-900 dark:text-white">
                  {calculationResults.totalWallArea.toLocaleString(undefined, { maximumFractionDigits: 1 })} {unitLabel}
                </span>
              </div>

              <div className="pl-4 text-[11px] text-zinc-450 dark:text-zinc-500 space-y-1">
                <div className="flex justify-between">
                  <span>• Exterior Perimeter Envelope:</span>
                  <span className="font-mono">{calculationResults.totalExtWallArea.toFixed(1)} {unitLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span>• Interior Room Partitions:</span>
                  <span className="font-mono">{calculationResults.totalIntWallArea.toFixed(1)} {unitLabel}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-600 dark:text-zinc-400 font-semibold">
                  Estimated Super Built-up (Saleable):
                </span>
                <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                  {calculationResults.superBuiltUpArea.toLocaleString(undefined, { maximumFractionDigits: 1 })} {unitLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Visualizer & Blueprint Tabs */}
          <div className="saas-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('blueprint')}
                  className={`text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-lg transition-all ${
                    activeTab === 'blueprint'
                      ? 'bg-indigo-500/10 text-indigo-650 dark:text-indigo-400'
                      : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  2D Schematic
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('financials')}
                  className={`text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-lg transition-all ${
                    activeTab === 'financials'
                      ? 'bg-indigo-500/10 text-indigo-650 dark:text-indigo-400'
                      : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  Civil Materials
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('standards')}
                  className={`text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-lg transition-all ${
                    activeTab === 'standards'
                      ? 'bg-indigo-500/10 text-indigo-650 dark:text-indigo-400'
                      : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  RERA Guide
                </button>
              </div>

              <span className="text-[10px] font-mono text-zinc-400 font-bold">
                Auto-scaled
              </span>
            </div>

            {/* Tab 1: Live 2D SVG Blueprint */}
            {activeTab === 'blueprint' && (
              <div className="space-y-3">
                <div className="w-full aspect-[4/3] bg-zinc-950 rounded-2xl p-4 relative overflow-hidden border border-zinc-800 flex flex-col justify-between">
                  {/* Grid background effect */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

                  {/* Header in Blueprint */}
                  <div className="relative z-10 flex justify-between items-center text-[10px] font-mono text-zinc-400 border-b border-zinc-800/80 pb-2">
                    <span className="text-indigo-400 font-bold">PLINTH SCHEMATIC PLAN</span>
                    <span>EXT WALL: {currentExtWallInches}" | INT: {currentIntWallInches}"</span>
                  </div>

                  {/* SVG Blueprint Canvas */}
                  <div className="relative z-10 flex-grow flex items-center justify-center p-2">
                    <svg viewBox="0 0 320 200" className="w-full h-full max-h-[160px]">
                      {/* External Thick Envelope Wall */}
                      <rect 
                        x="10" 
                        y="10" 
                        width="300" 
                        height="180" 
                        fill="none" 
                        stroke="#6366f1" 
                        strokeWidth="6" 
                        rx="4" 
                        className="opacity-80"
                      />
                      <rect 
                        x="13" 
                        y="13" 
                        width="294" 
                        height="174" 
                        fill="#0b0f19" 
                        stroke="#312e81" 
                        strokeWidth="1.5" 
                      />

                      {/* Living & Dining Room Block */}
                      <rect 
                        x="20" 
                        y="20" 
                        width="160" 
                        height="95" 
                        fill="#1e1b4b" 
                        stroke="#4338ca" 
                        strokeWidth="2" 
                        rx="2"
                        className="transition-all hover:fill-indigo-900/60"
                      />
                      <text x="30" y="45" fill="#a5b4fc" fontSize="10" fontWeight="bold">Living & Dining</text>
                      <text x="30" y="60" fill="#6366f1" fontSize="8" fontFamily="monospace">Carpet Zone</text>

                      {/* Kitchen Block */}
                      <rect 
                        x="185" 
                        y="20" 
                        width="115" 
                        height="70" 
                        fill="#14532d" 
                        stroke="#15803d" 
                        strokeWidth="2" 
                        rx="2"
                      />
                      <text x="195" y="45" fill="#86efac" fontSize="9" fontWeight="bold">Kitchen</text>
                      <text x="195" y="58" fill="#4ade80" fontSize="7.5" fontFamily="monospace">Carpet</text>

                      {/* Kitchen Dry Utility */}
                      <rect 
                        x="185" 
                        y="93" 
                        width="115" 
                        height="22" 
                        fill="#451a03" 
                        stroke="#d97706" 
                        strokeWidth="1.5" 
                        strokeDasharray="3 2"
                        rx="2"
                      />
                      <text x="195" y="107" fill="#fde68a" fontSize="7.5" fontWeight="bold">Dry Utility</text>

                      {/* Master Bedroom */}
                      <rect 
                        x="20" 
                        y="120" 
                        width="120" 
                        height="65" 
                        fill="#0c4a6e" 
                        stroke="#0284c7" 
                        strokeWidth="2" 
                        rx="2"
                      />
                      <text x="30" y="145" fill="#7dd3fc" fontSize="9" fontWeight="bold">Master Bed</text>

                      {/* Bathrooms & Passage */}
                      <rect 
                        x="145" 
                        y="120" 
                        width="80" 
                        height="65" 
                        fill="#1e293b" 
                        stroke="#475569" 
                        strokeWidth="2" 
                        rx="2"
                      />
                      <text x="153" y="145" fill="#cbd5e1" fontSize="8" fontWeight="bold">Toilets & Foyer</text>

                      {/* Main Balcony Cantilever Projection */}
                      <rect 
                        x="230" 
                        y="120" 
                        width="70" 
                        height="65" 
                        fill="#064e3b" 
                        stroke="#10b981" 
                        strokeWidth="2" 
                        strokeDasharray="4 2"
                        rx="2"
                      />
                      <text x="238" y="145" fill="#6ee7b7" fontSize="8" fontWeight="bold">Balcony</text>
                      <text x="238" y="157" fill="#34d399" fontSize="7" fontFamily="monospace">Cantilever</text>
                    </svg>
                  </div>

                  {/* Footer in Blueprint */}
                  <div className="relative z-10 flex justify-between items-center text-[9px] font-mono text-zinc-500 pt-2 border-t border-zinc-800/80">
                    <span>CARPET EFFICIENCY: {calculationResults.floorEfficiencyRatio.toFixed(1)}%</span>
                    <span>TOTAL BUA: {calculationResults.totalGrossBuiltUp.toFixed(0)} {unitLabel.toUpperCase()}</span>
                  </div>
                </div>

                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                  <strong>Architectural Note:</strong> Built-up area measures up to the outer finished face of exterior perimeter walls and includes full balcony projections plus half of party walls shared with adjoining units.
                </div>
              </div>
            )}

            {/* Tab 2: Civil Materials Thumb-rules */}
            {activeTab === 'financials' && (
              <div className="space-y-3 text-xs">
                <div className="space-y-2">
                  <div className="flex justify-between p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800">
                    <span className="font-semibold text-zinc-600 dark:text-zinc-400">Total Civil Budget:</span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-white">
                      ₹{financialEstimates.totalCivilCost.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800">
                    <span className="font-semibold text-zinc-600 dark:text-zinc-400">Effective Carpet Rate:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{financialEstimates.effectiveCarpetRate.toLocaleString(undefined, { maximumFractionDigits: 0 })} / {unitLabel}
                    </span>
                  </div>

                  <div className="flex justify-between p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800">
                    <span className="font-semibold text-zinc-600 dark:text-zinc-400">Structural Cement Bags:</span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-white">
                      ~{financialEstimates.cementBags.toLocaleString()} Bags
                    </span>
                  </div>

                  <div className="flex justify-between p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800">
                    <span className="font-semibold text-zinc-600 dark:text-zinc-400">TMT Steel Rebars:</span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-white">
                      ~{financialEstimates.steelKg.toLocaleString()} kg ({(financialEstimates.steelKg / 1000).toFixed(2)} MT)
                    </span>
                  </div>

                  <div className="flex justify-between p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800">
                    <span className="font-semibold text-zinc-600 dark:text-zinc-400">Masonry Wall Units:</span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-white">
                      ~{financialEstimates.bricksCount.toLocaleString()} Bricks / Blocks
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: RERA & Bylaw Standards Guide */}
            {activeTab === 'standards' && (
              <div className="space-y-3 text-xs text-zinc-600 dark:text-zinc-300">
                <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-1.5">
                  <div className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-indigo-500" />
                    <span>RERA Real Estate Act 2016 Rule:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                    Carpet area is the net usable floor area excluding external walls, service shafts, and private balconies, but <strong>including internal partition walls</strong>.
                  </p>
                </div>

                <div className="space-y-1.5 text-[11px] leading-relaxed">
                  <p><strong>• Built-up Area (BUA):</strong> Carpet Area + All Wall Footprints + Balconies + Service ducts within plinth.</p>
                  <p><strong>• Super Built-up Area:</strong> BUA + Proportional share of common entrance lobbies, staircases, lift shafts, and generator rooms.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

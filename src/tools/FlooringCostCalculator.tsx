import { useState, useMemo, useEffect } from 'react';
import { 
  Palette, Clipboard, Check, RotateCcw, 
  Download, Layers, Sparkles, 
  Grid, Eye, Save, Trash2, Package, Plus
} from 'lucide-react';
import { jsPDF } from 'jspdf';

// --- Type Definitions ---
type UnitType = 'feet' | 'meters';
type LayingPattern = 'straight_grid' | 'diagonal_45' | 'herringbone' | 'brick_bond' | 'bookmatched_marble';

interface MaterialConfig {
  id: string;
  name: string;
  category: 'tiles' | 'marble' | 'granite_stone' | 'wooden_vinyl';
  materialCostSqFt: number; // INR per sq ft
  laborCostSqFt: number; // INR per sq ft (laying + cutting)
  polishingCostSqFt: number; // INR per sq ft (0 for tiles, high for marble)
  boxSizeSqFt: number; // Standard box coverage in sq ft
  adhesiveRequired: boolean; // Needs adhesive vs cement mortar
  needsPolishing: boolean;
  desc: string;
}

interface RoomItem {
  id: string;
  name: string;
  lengthFt: number;
  widthFt: number;
}

interface SavedFlooringQuote {
  id: string;
  name: string;
  materialName: string;
  totalCost: number;
  netAreaSqFt: number;
  grossAreaSqFt: number;
  date: string;
}

// 11 Industry-Standard Flooring Presets
const FLOORING_MATERIALS: MaterialConfig[] = [
  {
    id: 'vitrified_standard',
    name: 'Vitrified Tiles (2×2 ft Double Charged)',
    category: 'tiles',
    materialCostSqFt: 75,
    laborCostSqFt: 25,
    polishingCostSqFt: 0,
    boxSizeSqFt: 16,
    adhesiveRequired: true,
    needsPolishing: false,
    desc: 'Most popular living and bedroom floor tile with zero water absorption'
  },
  {
    id: 'gvt_large_format',
    name: 'Large GVT / PGVT Tiles (4×2 ft High Gloss)',
    category: 'tiles',
    materialCostSqFt: 110,
    laborCostSqFt: 35,
    polishingCostSqFt: 0,
    boxSizeSqFt: 16,
    adhesiveRequired: true,
    needsPolishing: false,
    desc: 'Seamless mirror-finish glazed vitrified slabs for luxury modern interiors'
  },
  {
    id: 'ceramic_tiles',
    name: 'Ceramic Floor Tiles (1×1 ft Anti-Skid)',
    category: 'tiles',
    materialCostSqFt: 45,
    laborCostSqFt: 20,
    polishingCostSqFt: 0,
    boxSizeSqFt: 10,
    adhesiveRequired: true,
    needsPolishing: false,
    desc: 'Cost-effective slip-resistant tile for bathrooms, kitchens, and balconies'
  },
  {
    id: 'indian_marble',
    name: 'Indian White Marble (Makrana / Morwad)',
    category: 'marble',
    materialCostSqFt: 140,
    laborCostSqFt: 35,
    polishingCostSqFt: 45,
    boxSizeSqFt: 1, // Slabs
    adhesiveRequired: false,
    needsPolishing: true,
    desc: 'Natural Indian marble slabs laid with mortar bed and 5-stage tin polish'
  },
  {
    id: 'italian_marble',
    name: 'Italian Marble (Statuario / Botticino / Dyna)',
    category: 'marble',
    materialCostSqFt: 450,
    laborCostSqFt: 55,
    polishingCostSqFt: 110,
    boxSizeSqFt: 1, // Slabs
    adhesiveRequired: false,
    needsPolishing: true,
    desc: 'Ultra-luxury imported marble requiring fiber-mesh backing and 8-stage diamond polish'
  },
  {
    id: 'granite_flooring',
    name: 'Granite Flooring (Black Galaxy / Tan Brown)',
    category: 'granite_stone',
    materialCostSqFt: 160,
    laborCostSqFt: 45,
    polishingCostSqFt: 15,
    boxSizeSqFt: 1, // Slabs
    adhesiveRequired: false,
    needsPolishing: true,
    desc: 'Heavy-duty scratch-proof natural stone for high-traffic corridors and foyers'
  },
  {
    id: 'kota_stone',
    name: 'Kota / Mandana Natural Stone',
    category: 'granite_stone',
    materialCostSqFt: 45,
    laborCostSqFt: 25,
    polishingCostSqFt: 20,
    boxSizeSqFt: 1, // Slabs
    adhesiveRequired: false,
    needsPolishing: true,
    desc: 'Traditional cool limestone for verandas, utility areas, and commercial floors'
  },
  {
    id: 'laminate_wooden',
    name: 'Laminate Wooden Flooring (AC4 HDF Click)',
    category: 'wooden_vinyl',
    materialCostSqFt: 95,
    laborCostSqFt: 22,
    polishingCostSqFt: 0,
    boxSizeSqFt: 20,
    adhesiveRequired: false,
    needsPolishing: false,
    desc: 'Floating tongue-and-groove click lock with PE foam underlayment'
  },
  {
    id: 'engineered_wood',
    name: 'Engineered Hardwood Flooring (Oak/Teak)',
    category: 'wooden_vinyl',
    materialCostSqFt: 320,
    laborCostSqFt: 45,
    polishingCostSqFt: 0,
    boxSizeSqFt: 18,
    adhesiveRequired: true,
    needsPolishing: false,
    desc: 'Real wood top veneer with multi-ply core for supreme warmth and luxury'
  },
  {
    id: 'spc_vinyl',
    name: 'SPC Stone Plastic Vinyl (100% Waterproof)',
    category: 'wooden_vinyl',
    materialCostSqFt: 115,
    laborCostSqFt: 20,
    polishingCostSqFt: 0,
    boxSizeSqFt: 24,
    adhesiveRequired: false,
    needsPolishing: false,
    desc: 'Rigid core waterproof planks with integrated IXPE sound acoustic padding'
  },
  {
    id: 'custom_material',
    name: 'Custom Flooring Material',
    category: 'tiles',
    materialCostSqFt: 100,
    laborCostSqFt: 30,
    polishingCostSqFt: 0,
    boxSizeSqFt: 16,
    adhesiveRequired: true,
    needsPolishing: false,
    desc: 'Specify custom material supply and contractor labor installation rates'
  }
];

// Quick Home Presets
const HOME_LAYOUT_PRESETS = [
  { name: '1 BHK Apartment (450 sq ft)', area: 450, desc: 'Living + Bedroom + Kitchen' },
  { name: '2 BHK Apartment (850 sq ft)', area: 850, desc: 'Living Dining + 2 Bedrooms + Kitchen' },
  { name: '3 BHK Apartment (1,400 sq ft)', area: 1400, desc: 'Grand Living + 3 Bedrooms + Passages' },
  { name: '4 BHK Luxury Flat (2,400 sq ft)', area: 2400, desc: 'Double Living + 4 Master Suites' },
  { name: 'Single Master Bedroom (200 sq ft)', area: 200, desc: 'Standard 14×14 ft Bedroom' },
  { name: 'Living & Dining Hall (350 sq ft)', area: 350, desc: 'Main Living and Entrance Foyer' }
];

export default function FlooringCostCalculator() {
  // 1. Area & Calculation Mode
  const [unit, setUnit] = useState<UnitType>('feet');
  const [inputMode, setInputMode] = useState<'total_area' | 'room_by_room'>('total_area');
  const [totalAreaInput, setTotalAreaInput] = useState<number>(850); // Sq ft

  // Multi-room list
  const [rooms, setRooms] = useState<RoomItem[]>([
    { id: '1', name: 'Living & Dining Hall', lengthFt: 22, widthFt: 15 },
    { id: '2', name: 'Master Bedroom', lengthFt: 14, widthFt: 14 },
    { id: '3', name: 'Kids Bedroom', lengthFt: 12, widthFt: 12 },
    { id: '4', name: 'Kitchen & Utility', lengthFt: 12, widthFt: 8 }
  ]);

  // 2. Material & Pattern
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('gvt_large_format');
  const [pattern, setPattern] = useState<LayingPattern>('straight_grid');
  const [customMatRate, setCustomMatRate] = useState<number>(100);
  const [customLabRate, setCustomLabRate] = useState<number>(30);
  const [customPolishRate, setCustomPolishRate] = useState<number>(0);

  // 3. Skirting & Demolition Add-ons
  const [includeSkirting, setIncludeSkirting] = useState<boolean>(true);
  const [skirtingHeightInches, setSkirtingHeightInches] = useState<number>(4);
  const [includeOldFloorDemolition, setIncludeOldFloorDemolition] = useState<boolean>(false);
  const [demolitionRateSqFt, setDemolitionRateSqFt] = useState<number>(18); // Demolition + Debris carting
  const [includeGst, setIncludeGst] = useState<boolean>(true);

  // UI state
  const [copied, setCopied] = useState<boolean>(false);
  const [savedQuotes, setSavedQuotes] = useState<SavedFlooringQuote[]>([]);
  const [quoteName, setQuoteName] = useState<string>('My Home Flooring Project');

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('toolique_flooring_quotes');
      if (saved) setSavedQuotes(JSON.parse(saved));
    } catch {}
  }, []);

  const activeMaterial = useMemo(() => {
    return FLOORING_MATERIALS.find(m => m.id === selectedMaterialId) || FLOORING_MATERIALS[0];
  }, [selectedMaterialId]);

  // Unit multiplier (1 sq m = 10.7639 sq ft)
  const unitToSqFtMultiplier = unit === 'meters' ? 10.7639 : 1;

  // Compute Net Floor Area in Sq Ft
  const netAreaSqFt = useMemo(() => {
    if (inputMode === 'total_area') {
      return totalAreaInput * unitToSqFtMultiplier;
    } else {
      return rooms.reduce((acc, r) => acc + (r.lengthFt * r.widthFt * unitToSqFtMultiplier), 0);
    }
  }, [inputMode, totalAreaInput, rooms, unitToSqFtMultiplier]);

  // Estimated Perimeter for Skirting (Approx 4 * sqrt(Area) if single room, or sum of room perimeters)
  const totalPerimeterFt = useMemo(() => {
    if (inputMode === 'room_by_room') {
      return rooms.reduce((acc, r) => acc + (2 * (r.lengthFt + r.widthFt) * (unit === 'meters' ? 3.28084 : 1)), 0);
    } else {
      // Geometric approximation for typical residential rooms
      return Math.round(4 * Math.sqrt(netAreaSqFt) * 1.3);
    }
  }, [inputMode, rooms, netAreaSqFt, unit]);

  // Dynamic Wastage Percentage based on pattern and material
  const wastagePercentage = useMemo(() => {
    let base = 8;
    if (pattern === 'straight_grid') base = 7;
    else if (pattern === 'brick_bond') base = 10;
    else if (pattern === 'diagonal_45') base = 14;
    else if (pattern === 'herringbone') base = 16;
    else if (pattern === 'bookmatched_marble') base = 18;

    if (activeMaterial.category === 'marble' && pattern !== 'bookmatched_marble') base += 3;
    return base;
  }, [pattern, activeMaterial]);

  // --- CORE COST & BILL OF QUANTITIES (BOQ) CALCULATIONS ---
  const calculations = useMemo(() => {
    const isCustom = activeMaterial.id === 'custom_material';
    const matRate = isCustom ? customMatRate : activeMaterial.materialCostSqFt;
    const labRate = isCustom ? customLabRate : activeMaterial.laborCostSqFt;
    const polishRate = isCustom ? customPolishRate : activeMaterial.polishingCostSqFt;

    // Skirting area (Perimeter * Height in feet)
    const skirtingHeightFt = skirtingHeightInches / 12;
    const skirtingAreaSqFt = includeSkirting ? totalPerimeterFt * skirtingHeightFt : 0;

    // Total area to procure with wastage buffer
    const wastageAreaSqFt = netAreaSqFt * (wastagePercentage / 100);
    const grossMaterialAreaSqFt = netAreaSqFt + wastageAreaSqFt + skirtingAreaSqFt;

    // Costs
    const materialCostTotal = grossMaterialAreaSqFt * matRate;
    // Labor is charged on actual laid area + skirting
    const laborLayingCostTotal = (netAreaSqFt + skirtingAreaSqFt) * labRate;
    const polishingCostTotal = activeMaterial.needsPolishing || polishRate > 0 ? (netAreaSqFt + skirtingAreaSqFt) * polishRate : 0;

    // Consumables (Cement, Sand, Adhesive, Grout)
    let cementSandCost = 0;
    let adhesiveGroutCost = 0;
    let cementBagsCount = 0;
    let adhesiveBagsCount = 0;
    let groutBagsCount = 0;

    if (activeMaterial.adhesiveRequired) {
      // Tile Adhesive: ~1 bag (20kg) covers 40-50 sq ft
      adhesiveBagsCount = Math.ceil(grossMaterialAreaSqFt / 45);
      groutBagsCount = Math.ceil(grossMaterialAreaSqFt / 100); // 1kg epoxy grout per 100 sq ft
      adhesiveGroutCost = (adhesiveBagsCount * 380) + (groutBagsCount * 650);
    } else {
      // Mortar Bed (1.5" thickness): ~1 cement bag (50kg) per 40 sq ft + Sand
      cementBagsCount = Math.ceil(grossMaterialAreaSqFt / 38);
      cementSandCost = (cementBagsCount * 420) + (grossMaterialAreaSqFt * 18); // Cement + Sand bulk
    }

    // Demolition cost
    const demolitionCost = includeOldFloorDemolition ? netAreaSqFt * demolitionRateSqFt : 0;

    // Total boxes of tiles needed
    const tileBoxesCount = Math.ceil(grossMaterialAreaSqFt / (activeMaterial.boxSizeSqFt || 16));

    // Subtotals & Taxes
    const subtotal = materialCostTotal + laborLayingCostTotal + polishingCostTotal + cementSandCost + adhesiveGroutCost + demolitionCost;
    const gstAmount = includeGst ? subtotal * 0.18 : 0;
    const grandTotal = subtotal + gstAmount;

    return {
      netAreaSqFt: Math.round(netAreaSqFt),
      skirtingAreaSqFt: Math.round(skirtingAreaSqFt),
      wastageAreaSqFt: Math.round(wastageAreaSqFt),
      grossMaterialAreaSqFt: Math.round(grossMaterialAreaSqFt),
      materialCostTotal: Math.round(materialCostTotal),
      laborLayingCostTotal: Math.round(laborLayingCostTotal),
      polishingCostTotal: Math.round(polishingCostTotal),
      cementSandCost: Math.round(cementSandCost),
      adhesiveGroutCost: Math.round(adhesiveGroutCost),
      demolitionCost: Math.round(demolitionCost),
      tileBoxesCount,
      cementBagsCount,
      adhesiveBagsCount,
      groutBagsCount,
      subtotal: Math.round(subtotal),
      gstAmount: Math.round(gstAmount),
      grandTotal: Math.round(grandTotal),
      effectiveRatePerSqFt: netAreaSqFt > 0 ? Math.round(grandTotal / netAreaSqFt) : 0
    };
  }, [
    netAreaSqFt, totalPerimeterFt, includeSkirting, skirtingHeightInches,
    wastagePercentage, activeMaterial, customMatRate, customLabRate, customPolishRate,
    includeOldFloorDemolition, demolitionRateSqFt, includeGst
  ]);

  // Copy Full Material & BOQ Report
  const handleCopyReport = () => {
    let report = `FLOORING PROJECT ESTIMATE & MATERIAL BOQ\n`;
    report += `==========================================\n`;
    report += `Project: ${quoteName}\n`;
    report += `Material: ${activeMaterial.name}\n`;
    report += `Laying Pattern: ${pattern.replace(/_/g, ' ').toUpperCase()}\n\n`;
    report += `AREA MEASUREMENTS:\n`;
    report += `• Net Floor Area: ${calculations.netAreaSqFt} sq ft (${(calculations.netAreaSqFt * 0.092903).toFixed(1)} m²)\n`;
    report += `• Wall Skirting Area: ${calculations.skirtingAreaSqFt} sq ft (${totalPerimeterFt} linear ft @ ${skirtingHeightInches}")\n`;
    report += `• Cutting & Wastage Buffer (${wastagePercentage}%): ${calculations.wastageAreaSqFt} sq ft\n`;
    report += `• Total Material Required to Procure: ${calculations.grossMaterialAreaSqFt} sq ft\n`;
    if (activeMaterial.category === 'tiles') {
      report += `• Total Tile Boxes: ${calculations.tileBoxesCount} Boxes (${activeMaterial.boxSizeSqFt} sq ft/box)\n`;
    }
    report += `\nITEMIZED COST BREAKDOWN:\n`;
    report += `• Flooring Tiles / Slabs Material: ₹${calculations.materialCostTotal.toLocaleString()}\n`;
    report += `• Laying & Fitting Labor: ₹${calculations.laborLayingCostTotal.toLocaleString()}\n`;
    if (calculations.polishingCostTotal > 0) {
      report += `• Multi-Stage Diamond Polishing: ₹${calculations.polishingCostTotal.toLocaleString()}\n`;
    }
    if (calculations.adhesiveGroutCost > 0) {
      report += `• Tile Adhesive & Epoxy Grout (${calculations.adhesiveBagsCount} bags): ₹${calculations.adhesiveGroutCost.toLocaleString()}\n`;
    }
    if (calculations.cementSandCost > 0) {
      report += `• Cement & Sand Mortar Bed (${calculations.cementBagsCount} bags cement): ₹${calculations.cementSandCost.toLocaleString()}\n`;
    }
    if (includeOldFloorDemolition) {
      report += `• Old Floor Demolition & Debris Removal: ₹${calculations.demolitionCost.toLocaleString()}\n`;
    }
    if (includeGst) {
      report += `• GST (18% Construction / Tiles): ₹${calculations.gstAmount.toLocaleString()}\n`;
    }
    report += `------------------------------------------\n`;
    report += `GRAND TOTAL BUDGET: ₹${calculations.grandTotal.toLocaleString()} (₹${calculations.effectiveRatePerSqFt}/sq ft)\n`;
    report += `==========================================\n`;
    report += `Generated on Toolique Interior Studio.`;

    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download PDF Estimate
  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('Toolique — Flooring Cost Estimate & BOQ', 14, 18);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Project: ${quoteName} | Date: ${new Date().toLocaleDateString('en-IN')}`, 14, 25);

      let y = 35;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('1. Scope & Area Specifications', 14, y);
      y += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`• Material: ${activeMaterial.name}`, 16, y); y += 6;
      doc.text(`• Laying Pattern: ${pattern.replace(/_/g, ' ').toUpperCase()} (Wastage: ${wastagePercentage}%)`, 16, y); y += 6;
      doc.text(`• Net Carpet Area: ${calculations.netAreaSqFt} Sq. Ft (${(calculations.netAreaSqFt * 0.092903).toFixed(1)} Sq. Meters)`, 16, y); y += 6;
      doc.text(`• Wall Skirting: ${calculations.skirtingAreaSqFt} Sq. Ft (${totalPerimeterFt} Linear Feet)`, 16, y); y += 6;
      doc.text(`• Gross Material Required: ${calculations.grossMaterialAreaSqFt} Sq. Ft (${calculations.tileBoxesCount} Boxes)`, 16, y); y += 10;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('2. Itemized Bill of Quantities (BOQ)', 14, y);
      y += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`• Material Supply Cost: INR ${calculations.materialCostTotal.toLocaleString()}`, 16, y); y += 6;
      doc.text(`• Installation & Laying Labor: INR ${calculations.laborLayingCostTotal.toLocaleString()}`, 16, y); y += 6;
      if (calculations.polishingCostTotal > 0) {
        doc.text(`• Diamond Polishing & Crystallization: INR ${calculations.polishingCostTotal.toLocaleString()}`, 16, y); y += 6;
      }
      if (calculations.adhesiveGroutCost > 0) {
        doc.text(`• Tile Adhesive & Epoxy Grout: INR ${calculations.adhesiveGroutCost.toLocaleString()}`, 16, y); y += 6;
      }
      if (calculations.cementSandCost > 0) {
        doc.text(`• Cement Sand Bedding: INR ${calculations.cementSandCost.toLocaleString()}`, 16, y); y += 6;
      }
      if (includeOldFloorDemolition) {
        doc.text(`• Demolition & Debris Disposal: INR ${calculations.demolitionCost.toLocaleString()}`, 16, y); y += 6;
      }
      if (includeGst) {
        doc.text(`• GST (18%): INR ${calculations.gstAmount.toLocaleString()}`, 16, y); y += 6;
      }
      y += 4;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(`GRAND TOTAL ESTIMATE: INR ${calculations.grandTotal.toLocaleString()} (~INR ${calculations.effectiveRatePerSqFt}/sq ft)`, 16, y);

      doc.save(`flooring-estimate-${quoteName.toLowerCase().replace(/\s+/g, '-')}.pdf`);
    } catch (e) {
      console.error(e);
    }
  };

  // Save Quote to history
  const handleSaveQuote = () => {
    if (!quoteName.trim()) return;
    const newQuote: SavedFlooringQuote = {
      id: Date.now().toString(),
      name: quoteName,
      materialName: activeMaterial.name,
      totalCost: calculations.grandTotal,
      netAreaSqFt: calculations.netAreaSqFt,
      grossAreaSqFt: calculations.grossMaterialAreaSqFt,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    };
    const updated = [newQuote, ...savedQuotes.slice(0, 9)];
    setSavedQuotes(updated);
    localStorage.setItem('toolique_flooring_quotes', JSON.stringify(updated));
  };

  const handleDeleteSavedQuote = (id: string) => {
    const updated = savedQuotes.filter(q => q.id !== id);
    setSavedQuotes(updated);
    localStorage.setItem('toolique_flooring_quotes', JSON.stringify(updated));
  };

  const addRoom = () => {
    setRooms([
      ...rooms,
      { id: Date.now().toString(), name: `Room ${rooms.length + 1}`, lengthFt: 12, widthFt: 10 }
    ]);
  };

  const removeRoom = (id: string) => {
    if (rooms.length <= 1) return;
    setRooms(rooms.filter(r => r.id !== id));
  };

  const updateRoom = (id: string, field: keyof RoomItem, val: any) => {
    setRooms(rooms.map(r => r.id === id ? { ...r, [field]: val } : r));
  };

  const handleReset = () => {
    setTotalAreaInput(850);
    setInputMode('total_area');
    setSelectedMaterialId('gvt_large_format');
    setPattern('straight_grid');
    setIncludeSkirting(true);
    setSkirtingHeightInches(4);
    setIncludeOldFloorDemolition(false);
  };

  return (
    <div className="space-y-8">
      {/* HEADER CONTROLS & HOME PRESETS */}
      <div className="saas-card p-6 space-y-4 text-left">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-zinc-200/60 dark:border-zinc-800/60">
          <div>
            <h2 className="text-base font-black text-zinc-900 dark:text-white flex items-center gap-2">
              <Palette className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Flooring Cost & Material Engineering Studio</span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
              Accurate tile packaging, Indian & Italian marble diamond polishing, mortar bedding, and itemized contractor BOQ
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Unit Switcher */}
            <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60">
              <button
                type="button"
                onClick={() => setUnit('feet')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                  unit === 'feet'
                    ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                Sq. Feet
              </button>
              <button
                type="button"
                onClick={() => setUnit('meters')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                  unit === 'meters'
                    ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                Sq. Meters
              </button>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 transition cursor-pointer"
              title="Reset to Defaults"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Apartment & Home Presets */}
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-2">
            Quick Residential Apartment Presets:
          </span>
          <div className="flex flex-wrap gap-2">
            {HOME_LAYOUT_PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputMode('total_area');
                  setTotalAreaInput(p.area);
                }}
                className="px-3 py-1.5 rounded-xl bg-zinc-100/80 dark:bg-zinc-900/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 border border-zinc-200/60 dark:border-zinc-800/60 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500/30 transition cursor-pointer"
                title={p.desc}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TWO COLUMN WORKBENCH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: AREA INPUTS & MATERIAL SPECIFICATIONS */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. AREA INPUT & MULTI-ROOM ESTIMATOR */}
          <div className="saas-card p-6 space-y-4 text-left">
            <div className="flex justify-between items-center border-b border-zinc-200/60 dark:border-zinc-800/60 pb-3">
              <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Grid className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>1. Floor Area & Room Dimensions</span>
              </h3>

              {/* Mode Toggle */}
              <div className="flex rounded-xl bg-zinc-100 dark:bg-zinc-900 p-1 border border-zinc-200/60 dark:border-zinc-800/60">
                <button
                  type="button"
                  onClick={() => setInputMode('total_area')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                    inputMode === 'total_area'
                      ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-zinc-400'
                  }`}
                >
                  Direct Area
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('room_by_room')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                    inputMode === 'room_by_room'
                      ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-zinc-400'
                  }`}
                >
                  Room by Room
                </button>
              </div>
            </div>

            {inputMode === 'total_area' ? (
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Total Floor Carpet Area ({unit === 'feet' ? 'Sq. Ft' : 'Sq. M'})
                </label>
                <input
                  type="number"
                  value={totalAreaInput}
                  onChange={(e) => setTotalAreaInput(Math.max(1, parseFloat(e.target.value) || 0))}
                  className="saas-input font-mono font-bold text-base"
                />
                <span className="text-[10px] text-zinc-400">Total area of all floors/rooms</span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-zinc-500">Individual Room Dimensions ({unit === 'feet' ? 'ft' : 'm'}):</span>
                  <button
                    type="button"
                    onClick={addRoom}
                    className="px-2.5 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Room
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {rooms.map((room) => (
                    <div key={room.id} className="flex items-center gap-2 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-800/60">
                      <input
                        type="text"
                        value={room.name}
                        onChange={(e) => updateRoom(room.id, 'name', e.target.value)}
                        className="flex-1 px-2 py-1 text-xs font-bold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none"
                      />
                      <div className="w-20 flex items-center gap-1">
                        <input
                          type="number"
                          value={room.lengthFt}
                          onChange={(e) => updateRoom(room.id, 'lengthFt', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-xs font-bold font-mono bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none"
                        />
                        <span className="text-[10px] text-zinc-400">L</span>
                      </div>
                      <div className="w-20 flex items-center gap-1">
                        <input
                          type="number"
                          value={room.widthFt}
                          onChange={(e) => updateRoom(room.id, 'widthFt', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-xs font-bold font-mono bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none"
                        />
                        <span className="text-[10px] text-zinc-400">W</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 w-16 text-right">
                        {(room.lengthFt * room.widthFt).toFixed(0)} {unit === 'feet' ? 'sqft' : 'sqm'}
                      </span>
                      {rooms.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRoom(room.id)}
                          className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skirting & Demolition Add-ons */}
            <div className="pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-800/60 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeSkirting}
                    onChange={(e) => setIncludeSkirting(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">Include Wall Skirting</span>
                    <span className="text-[10px] text-zinc-400">Border around perimeter ({totalPerimeterFt} ft)</span>
                  </div>
                </label>
                {includeSkirting && (
                  <div className="flex items-center justify-between pt-1 border-t border-zinc-200/40 dark:border-zinc-800/40">
                    <span className="text-[10px] font-bold text-zinc-400">Skirting Height:</span>
                    <select
                      value={skirtingHeightInches}
                      onChange={(e) => setSkirtingHeightInches(parseInt(e.target.value) || 4)}
                      className="px-2 py-0.5 text-xs font-bold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none"
                    >
                      <option value={3}>3 Inches</option>
                      <option value={4}>4 Inches (Standard)</option>
                      <option value={5}>5 Inches</option>
                      <option value={6}>6 Inches (High)</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-800/60 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeOldFloorDemolition}
                    onChange={(e) => setIncludeOldFloorDemolition(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">Old Floor Demolition</span>
                    <span className="text-[10px] text-zinc-400">Tile chipping & debris disposal</span>
                  </div>
                </label>
                {includeOldFloorDemolition && (
                  <div className="flex items-center justify-between pt-1 border-t border-zinc-200/40 dark:border-zinc-800/40">
                    <span className="text-[10px] font-bold text-zinc-400">Demolition Rate (₹/sq ft):</span>
                    <input
                      type="number"
                      value={demolitionRateSqFt}
                      onChange={(e) => setDemolitionRateSqFt(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-16 px-2 py-0.5 text-xs font-bold font-mono bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none text-right"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 2. FLOORING MATERIAL PICKER */}
          <div className="saas-card p-6 space-y-4 text-left">
            <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-3">
              <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>2. Flooring Material & Polish Specification</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {FLOORING_MATERIALS.map((mat) => (
                <button
                  key={mat.id}
                  type="button"
                  onClick={() => setSelectedMaterialId(mat.id)}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    selectedMaterialId === mat.id
                      ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-600 text-indigo-950 dark:text-indigo-200 ring-1 ring-indigo-600'
                      : 'bg-zinc-50 dark:bg-zinc-950/40 border-zinc-200/60 dark:border-zinc-800/60 text-zinc-700 dark:text-zinc-300 hover:border-indigo-500/40'
                  }`}
                >
                  <div>
                    <span className="text-xs font-black block">{mat.name}</span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">{mat.desc}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-1 border-t border-zinc-200/40 dark:border-zinc-800/40 text-[10px] font-mono">
                    <span className="text-zinc-500 font-bold">Mat: ₹{mat.materialCostSqFt}/sqft</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">Labor: ₹{mat.laborCostSqFt + mat.polishingCostSqFt}/sqft</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Custom Rates Input if custom material selected */}
            {selectedMaterialId === 'custom_material' && (
              <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block">Material (₹/sq ft)</label>
                  <input
                    type="number"
                    value={customMatRate}
                    onChange={(e) => setCustomMatRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 text-xs font-bold font-mono bg-white dark:bg-zinc-800 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block">Laying Labor (₹/sq ft)</label>
                  <input
                    type="number"
                    value={customLabRate}
                    onChange={(e) => setCustomLabRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 text-xs font-bold font-mono bg-white dark:bg-zinc-800 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block">Polishing (₹/sq ft)</label>
                  <input
                    type="number"
                    value={customPolishRate}
                    onChange={(e) => setCustomPolishRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 text-xs font-bold font-mono bg-white dark:bg-zinc-800 border rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 3. LAYING PATTERN & WASTAGE BUFFER */}
          <div className="saas-card p-6 space-y-4 text-left">
            <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-3">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>3. Laying Pattern & Cutting Buffer</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'straight_grid', label: 'Straight Grid', wastage: '7%' },
                { id: 'brick_bond', label: 'Brick Bond / Staggered', wastage: '10%' },
                { id: 'diagonal_45', label: 'Diagonal 45° Diamond', wastage: '14%' },
                { id: 'herringbone', label: 'Herringbone / Chevron', wastage: '16%' },
                { id: 'bookmatched_marble', label: 'Bookmatched Vein Slabs', wastage: '18%' }
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPattern(p.id as LayingPattern)}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    pattern === p.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                      : 'bg-zinc-50 dark:bg-zinc-950/40 border-zinc-200/60 dark:border-zinc-800/60 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <span className="text-xs font-black block">{p.label}</span>
                  <span className={`text-[10px] block mt-0.5 ${pattern === p.id ? 'text-indigo-100' : 'text-zinc-400'}`}>
                    Wastage: ~{p.wastage}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 2D BLUEPRINT & DETAILED CONTRACTOR BOQ */}
        <div className="lg:col-span-5 space-y-6">
          {/* PRIMARY TOTAL HERO CARD */}
          <div className="p-6 rounded-3xl bg-zinc-950 text-white shadow-xl space-y-5 text-left border border-zinc-800">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-800 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block">
                  Estimated Flooring Budget
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-3xl font-black font-mono text-indigo-400">
                    ₹{calculations.grandTotal.toLocaleString()}
                  </h3>
                </div>
                <span className="text-[11px] text-zinc-400 font-medium block mt-1">
                  ₹{calculations.effectiveRatePerSqFt}/sq ft • {calculations.grossMaterialAreaSqFt} sq ft to order
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopyReport}
                  className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-200 transition flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/20"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF BOQ</span>
                </button>
              </div>
            </div>

            {/* Quick 3-Metric Strip */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                <span className="text-[9px] font-black uppercase text-zinc-400 block">Tile/Slab Material</span>
                <span className="text-xs font-black font-mono text-white mt-0.5 block">₹{calculations.materialCostTotal.toLocaleString()}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                <span className="text-[9px] font-black uppercase text-zinc-400 block">Laying & Polish</span>
                <span className="text-xs font-black font-mono text-indigo-300 mt-0.5 block">₹{(calculations.laborLayingCostTotal + calculations.polishingCostTotal).toLocaleString()}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                <span className="text-[9px] font-black uppercase text-zinc-400 block">Consumables/GST</span>
                <span className="text-xs font-black font-mono text-emerald-400 mt-0.5 block">₹{(calculations.cementSandCost + calculations.adhesiveGroutCost + calculations.gstAmount).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* 2D PATTERN & MATERIAL TEXTURE VISUALIZER */}
          <div className="saas-card p-6 space-y-4 text-left">
            <div className="flex justify-between items-center border-b border-zinc-200/60 dark:border-zinc-800/60 pb-3">
              <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>2D Floor Pattern Visualizer</span>
              </h3>
              <span className="text-[10px] font-bold text-zinc-400 capitalize">
                {pattern.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="w-full h-48 bg-zinc-950 rounded-2xl flex items-center justify-center p-4 relative overflow-hidden border border-zinc-800">
              <svg className="w-full h-full" viewBox="0 0 200 120">
                {/* Skirting Outer Frame */}
                {includeSkirting && (
                  <rect x="5" y="5" width="190" height="110" fill="none" stroke="#6366f1" strokeWidth="4" rx="4" />
                )}

                {/* Pattern Tiles Grid */}
                {pattern === 'straight_grid' && (
                  <g transform="translate(10, 10)">
                    {Array.from({ length: 4 }).map((_, r) => (
                      Array.from({ length: 6 }).map((_, c) => (
                        <rect
                          key={`${r}-${c}`}
                          x={c * 30}
                          y={r * 25}
                          width="28"
                          height="23"
                          fill={activeMaterial.category === 'marble' ? '#312e81' : activeMaterial.category === 'wooden_vinyl' ? '#78350f' : '#1e1b4b'}
                          fillOpacity="0.4"
                          stroke="#818cf8"
                          strokeWidth="0.8"
                          rx="1"
                        />
                      ))
                    ))}
                  </g>
                )}

                {pattern === 'diagonal_45' && (
                  <g transform="translate(100, 60) rotate(45)">
                    {Array.from({ length: 5 }).map((_, r) => (
                      Array.from({ length: 5 }).map((_, c) => (
                        <rect
                          key={`${r}-${c}`}
                          x={(c - 2.5) * 25}
                          y={(r - 2.5) * 25}
                          width="23"
                          height="23"
                          fill="#312e81"
                          fillOpacity="0.4"
                          stroke="#818cf8"
                          strokeWidth="0.8"
                        />
                      ))
                    ))}
                  </g>
                )}

                {pattern === 'herringbone' && (
                  <g transform="translate(10, 10)">
                    {Array.from({ length: 4 }).map((_, r) => (
                      Array.from({ length: 4 }).map((_, c) => (
                        <g key={`${r}-${c}`} transform={`translate(${c * 45}, ${r * 25})`}>
                          <rect x="0" y="0" width="35" height="10" fill="#78350f" fillOpacity="0.5" stroke="#f59e0b" strokeWidth="0.8" transform="rotate(45)" />
                          <rect x="18" y="0" width="35" height="10" fill="#78350f" fillOpacity="0.4" stroke="#f59e0b" strokeWidth="0.8" transform="rotate(-45)" />
                        </g>
                      ))
                    ))}
                  </g>
                )}

                {(pattern === 'brick_bond' || pattern === 'bookmatched_marble') && (
                  <g transform="translate(10, 10)">
                    {Array.from({ length: 4 }).map((_, r) => (
                      Array.from({ length: 4 }).map((_, c) => (
                        <rect
                          key={`${r}-${c}`}
                          x={c * 46 + (r % 2 === 1 ? 23 : 0)}
                          y={r * 25}
                          width="44"
                          height="23"
                          fill={activeMaterial.category === 'marble' ? '#1e1b4b' : '#312e81'}
                          fillOpacity="0.5"
                          stroke="#a5b4fc"
                          strokeWidth="0.8"
                          rx="1"
                        />
                      ))
                    ))}
                  </g>
                )}

                <text x="100" y="112" textAnchor="middle" fontSize="8" className="fill-white font-mono font-bold">
                  {calculations.grossMaterialAreaSqFt} sq ft ({calculations.tileBoxesCount} boxes)
                </text>
              </svg>
            </div>
          </div>

          {/* DETAILED CONTRACTOR BOQ & MATERIAL QUANTITIES */}
          <div className="saas-card p-6 space-y-4 text-left">
            <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-3">
              <Package className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Material Procurement & Contractor BOQ</span>
            </h3>

            {/* GST & Custom Adjustments */}
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={includeGst}
                  onChange={(e) => setIncludeGst(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span>Include GST (18% Construction Services)</span>
              </label>
              <span className="text-[10px] font-mono font-bold text-zinc-400">
                {includeGst ? `+₹${calculations.gstAmount.toLocaleString()}` : 'Excluded'}
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="flex justify-between items-center">
                <span>Tile / Marble Slabs ({calculations.grossMaterialAreaSqFt} sq ft):</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-white">₹{calculations.materialCostTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Laying & Cutting Labor:</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-white">₹{calculations.laborLayingCostTotal.toLocaleString()}</span>
              </div>
              {calculations.polishingCostTotal > 0 && (
                <div className="flex justify-between items-center">
                  <span>Diamond Polishing & Grouting:</span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-white">₹{calculations.polishingCostTotal.toLocaleString()}</span>
                </div>
              )}
              {calculations.adhesiveGroutCost > 0 && (
                <div className="flex justify-between items-center">
                  <span>Adhesive & Epoxy Grout ({calculations.adhesiveBagsCount} bags):</span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-white">₹{calculations.adhesiveGroutCost.toLocaleString()}</span>
                </div>
              )}
              {calculations.cementSandCost > 0 && (
                <div className="flex justify-between items-center">
                  <span>Cement Bedding ({calculations.cementBagsCount} bags) + Sand:</span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-white">₹{calculations.cementSandCost.toLocaleString()}</span>
                </div>
              )}
              {includeOldFloorDemolition && (
                <div className="flex justify-between items-center">
                  <span>Demolition & Debris Disposal:</span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-white">₹{calculations.demolitionCost.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between items-center border-t border-zinc-200 dark:border-zinc-800 pt-2 font-bold text-sm">
                <span className="text-indigo-600 dark:text-indigo-400">Total Project Estimate:</span>
                <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                  ₹{calculations.grandTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SAVED QUOTES HISTORY SECTION */}
      <div className="saas-card p-6 space-y-4 text-left">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-3">
          <div>
            <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block">
              Saved Flooring Projects & Estimates
            </h3>
            <span className="text-[10px] text-zinc-400 font-medium">Save flooring estimates for different rooms, flats, or renovation projects</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={quoteName}
              onChange={(e) => setQuoteName(e.target.value)}
              placeholder="Project Name (e.g. 3BHK Italian Marble)"
              className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none flex-1 sm:w-56"
            />
            <button
              type="button"
              onClick={handleSaveQuote}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Estimate</span>
            </button>
          </div>
        </div>

        {savedQuotes.length === 0 ? (
          <div className="py-6 text-center text-xs text-zinc-400">
            No saved flooring projects yet. Click "Save Estimate" above to store this calculation.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {savedQuotes.map((q) => (
              <div key={q.id} className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-800/60 flex justify-between items-center gap-3">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black text-zinc-900 dark:text-white truncate max-w-[180px]">{q.name}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-medium">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold truncate max-w-[120px]">{q.materialName}</span>
                    <span>•</span>
                    <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300">{q.netAreaSqFt} sq ft</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-xs">₹{q.totalCost.toLocaleString()}</span>
                    <span className="text-[9px] text-zinc-400">{q.date}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteSavedQuote(q.id)}
                  className="p-1.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition cursor-pointer"
                  title="Delete Estimate"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useMemo, useEffect } from 'react';
import { 
  Compass, Plus, Trash2, Clipboard, Check, RotateCcw, 
  Download, Grid, Eye, Save, DollarSign, Building
} from 'lucide-react';
import { jsPDF } from 'jspdf';

// --- Type Definitions ---
type UnitSystem = 'feet' | 'meters';
type RoomType = 'carpet_habitable' | 'attached_toilet' | 'balcony_terrace' | 'utility_wash' | 'passage_foyer';

interface RoomItem {
  id: string;
  name: string;
  type: RoomType;
  length: number;
  width: number;
}

interface SavedFloorPlan {
  id: string;
  name: string;
  carpetAreaSqFt: number;
  superBuiltupSqFt: number;
  propertyCost: number;
  roomsCount: number;
  date: string;
}

// 6 Popular Residential Flat Floor Plan Presets in India
const FLOOR_PLAN_PRESETS = [
  {
    id: '1bhk_compact',
    name: '1 BHK Standard (450 sq ft Carpet)',
    desc: '450 sq ft RERA Carpet • 600 sq ft Super Built-Up',
    rooms: [
      { id: '1', name: 'Living & Dining Room', type: 'carpet_habitable' as RoomType, length: 14, width: 11 },
      { id: '2', name: 'Master Bedroom', type: 'carpet_habitable' as RoomType, length: 12, width: 10 },
      { id: '3', name: 'Kitchen', type: 'carpet_habitable' as RoomType, length: 9, width: 7 },
      { id: '4', name: 'Attached Bathroom', type: 'attached_toilet' as RoomType, length: 7, width: 4.5 },
      { id: '5', name: 'Balcony', type: 'balcony_terrace' as RoomType, length: 8, width: 4 }
    ]
  },
  {
    id: '2bhk_family',
    name: '2 BHK Family (720 sq ft Carpet)',
    desc: '720 sq ft RERA Carpet • 980 sq ft Super Built-Up',
    rooms: [
      { id: '1', name: 'Living & Dining Hall', type: 'carpet_habitable' as RoomType, length: 18, width: 12 },
      { id: '2', name: 'Master Bedroom', type: 'carpet_habitable' as RoomType, length: 14, width: 12 },
      { id: '3', name: 'Master Toilet', type: 'attached_toilet' as RoomType, length: 8, width: 5 },
      { id: '4', name: 'Kids / Guest Bedroom', type: 'carpet_habitable' as RoomType, length: 12, width: 11 },
      { id: '5', name: 'Common Toilet', type: 'attached_toilet' as RoomType, length: 7, width: 4.5 },
      { id: '6', name: 'Kitchen & Dining', type: 'carpet_habitable' as RoomType, length: 11, width: 8 },
      { id: '7', name: 'Living Balcony', type: 'balcony_terrace' as RoomType, length: 10, width: 4.5 },
      { id: '8', name: 'Dry Utility Area', type: 'utility_wash' as RoomType, length: 6, width: 4 }
    ]
  },
  {
    id: '3bhk_luxury',
    name: '3 BHK Premium (1,180 sq ft Carpet)',
    desc: '1,180 sq ft RERA Carpet • 1,600 sq ft Super Built-Up',
    rooms: [
      { id: '1', name: 'Grand Living Hall', type: 'carpet_habitable' as RoomType, length: 22, width: 14 },
      { id: '2', name: 'Dining Room / Foyer', type: 'passage_foyer' as RoomType, length: 12, width: 10 },
      { id: '3', name: 'Master Suite', type: 'carpet_habitable' as RoomType, length: 16, width: 14 },
      { id: '4', name: 'Master Ensuite Toilet', type: 'attached_toilet' as RoomType, length: 9, width: 6 },
      { id: '5', name: 'Bedroom 2 (Guest)', type: 'carpet_habitable' as RoomType, length: 13, width: 12 },
      { id: '6', name: 'Bedroom 3 (Kids)', type: 'carpet_habitable' as RoomType, length: 13, width: 11 },
      { id: '7', name: 'Common Toilet', type: 'attached_toilet' as RoomType, length: 7.5, width: 5 },
      { id: '8', name: 'Modular Kitchen', type: 'carpet_habitable' as RoomType, length: 12, width: 9 },
      { id: '9', name: 'Main Deck Balcony', type: 'balcony_terrace' as RoomType, length: 14, width: 5 },
      { id: '10', name: 'Dry Wash Yard', type: 'utility_wash' as RoomType, length: 7, width: 4.5 }
    ]
  },
  {
    id: '4bhk_penthouse',
    name: '4 BHK Presidential (2,150 sq ft Carpet)',
    desc: '2,150 sq ft RERA Carpet • 2,950 sq ft Super Built-Up',
    rooms: [
      { id: '1', name: 'Double-Height Living Hall', type: 'carpet_habitable' as RoomType, length: 26, width: 16 },
      { id: '2', name: 'Formal Dining Area', type: 'carpet_habitable' as RoomType, length: 16, width: 12 },
      { id: '3', name: 'Master Suite & Walk-in', type: 'carpet_habitable' as RoomType, length: 20, width: 15 },
      { id: '4', name: 'Master Bath & Jacuzzi', type: 'attached_toilet' as RoomType, length: 11, width: 8 },
      { id: '5', name: 'Bedroom 2 (Junior Suite)', type: 'carpet_habitable' as RoomType, length: 15, width: 13 },
      { id: '6', name: 'Bedroom 3', type: 'carpet_habitable' as RoomType, length: 14, width: 12 },
      { id: '7', name: 'Bedroom 4 / Home Office', type: 'carpet_habitable' as RoomType, length: 14, width: 11 },
      { id: '8', name: 'Kitchen & Store', type: 'carpet_habitable' as RoomType, length: 14, width: 10 },
      { id: '9', name: 'Private Sky Terrace', type: 'balcony_terrace' as RoomType, length: 20, width: 8 },
      { id: '10', name: 'Utility & Servant Room', type: 'utility_wash' as RoomType, length: 10, width: 6 }
    ]
  }
];

export default function RoomAreaCalculator() {
  // 1. Units & Architecture Parameters
  const [unit, setUnit] = useState<UnitSystem>('feet');
  const [wallThicknessInches, setWallThicknessInches] = useState<number>(9); // 9 inch external / 4.5 internal average
  const [loadingPercentage, setLoadingPercentage] = useState<number>(30); // Builder common loading %
  
  // 2. Financial Pricing Inputs
  const [propertyRatePerSqFt, setPropertyRatePerSqFt] = useState<number>(6500); // Rate on Super Built-up
  const [interiorFitoutRatePerSqFt, setInteriorFitoutRatePerSqFt] = useState<number>(1400); // Rate on Carpet
  const [stampDutyPercent, setStampDutyPercent] = useState<number>(6.0); // %
  const [registrationRatePercent] = useState<number>(1.0); // 1% standard
  const [includeGst, setIncludeGst] = useState<boolean>(true); // 5% residential under-construction / 0% ready

  // 3. Room Items
  const [rooms, setRooms] = useState<RoomItem[]>([
    { id: '1', name: 'Living & Dining Room', type: 'carpet_habitable', length: 18, width: 12 },
    { id: '2', name: 'Master Bedroom', type: 'carpet_habitable', length: 14, width: 12 },
    { id: '3', name: 'Attached Toilet', type: 'attached_toilet', length: 8, width: 5 },
    { id: '4', name: 'Kitchen', type: 'carpet_habitable', length: 11, width: 8 },
    { id: '5', name: 'Balcony', type: 'balcony_terrace', length: 10, width: 4.5 },
    { id: '6', name: 'Dry Utility', type: 'utility_wash', length: 6, width: 4 }
  ]);

  // UI state
  const [copied, setCopied] = useState<boolean>(false);
  const [savedPlans, setSavedPlans] = useState<SavedFloorPlan[]>([]);
  const [planName, setPlanName] = useState<string>('My 2 BHK Floor Plan');

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('toolique_room_area_plans');
      if (saved) setSavedPlans(JSON.parse(saved));
    } catch {}
  }, []);

  const unitMultiplier = unit === 'meters' ? 3.28084 : 1;

  // --- CORE RERA & NBC AREA CALCULATIONS ---
  const calculations = useMemo(() => {
    let internalHabitableSqFt = 0;
    let toiletsSqFt = 0;
    let balconiesSqFt = 0;
    let utilitiesSqFt = 0;
    let foyersSqFt = 0;
    let perimeterSumFt = 0;

    rooms.forEach((r) => {
      const lFt = r.length * unitMultiplier;
      const wFt = r.width * unitMultiplier;
      const area = lFt * wFt;

      if (r.type === 'carpet_habitable') internalHabitableSqFt += area;
      else if (r.type === 'attached_toilet') toiletsSqFt += area;
      else if (r.type === 'balcony_terrace') balconiesSqFt += area;
      else if (r.type === 'utility_wash') utilitiesSqFt += area;
      else if (r.type === 'passage_foyer') foyersSqFt += area;

      perimeterSumFt += 2 * (lFt + wFt);
    });

    // RERA Carpet Area: Net usable floor area inside structural walls + internal partition walls + attached toilets
    const netUsableCarpetSqFt = internalHabitableSqFt + toiletsSqFt + foyersSqFt;

    // Wall Area: Internal partitions (4.5") + External perimeter walls (9")
    // Formula: (Perimeter / 2) * (Wall thickness in feet)
    const wallThicknessFt = wallThicknessInches / 12;
    const internalWallAreaSqFt = (perimeterSumFt / 2.2) * wallThicknessFt;

    // Built-up Area: RERA Carpet + Balconies + Utilities + Wall Area
    const totalBalconiesAndUtilitiesSqFt = balconiesSqFt + utilitiesSqFt;
    const builtupAreaSqFt = netUsableCarpetSqFt + totalBalconiesAndUtilitiesSqFt + internalWallAreaSqFt;

    // Super Built-up Area (Saleable Area): Built-up Area * (1 + Loading%)
    const superBuiltupAreaSqFt = builtupAreaSqFt * (1 + loadingPercentage / 100);
    const commonAmenityLoadingAreaSqFt = superBuiltupAreaSqFt - builtupAreaSqFt;

    // Carpet Efficiency Index
    const carpetEfficiencyPercent = superBuiltupAreaSqFt > 0 ? (netUsableCarpetSqFt / superBuiltupAreaSqFt) * 100 : 0;

    // --- FINANCIAL METRICS ---
    const basePropertyCost = superBuiltupAreaSqFt * propertyRatePerSqFt;
    // Effective Rate on usable carpet space
    const effectiveCarpetRatePerSqFt = netUsableCarpetSqFt > 0 ? basePropertyCost / netUsableCarpetSqFt : 0;

    // Fit-out Cost (Interior woodwork, civil tiling, electricals, false ceiling)
    const totalInteriorFitoutCost = netUsableCarpetSqFt * interiorFitoutRatePerSqFt;

    // Government Taxes & Statutory Charges
    const stampDutyAmount = (basePropertyCost * stampDutyPercent) / 100;
    const registrationAmount = (basePropertyCost * registrationRatePercent) / 100;
    const gstAmount = includeGst ? basePropertyCost * 0.05 : 0; // 5% standard residential GST
    const totalPurchaseOutflow = basePropertyCost + stampDutyAmount + registrationAmount + gstAmount;

    return {
      netUsableCarpetSqFt: Math.round(netUsableCarpetSqFt),
      internalHabitableSqFt: Math.round(internalHabitableSqFt),
      toiletsSqFt: Math.round(toiletsSqFt),
      balconiesSqFt: Math.round(balconiesSqFt),
      utilitiesSqFt: Math.round(utilitiesSqFt),
      foyersSqFt: Math.round(foyersSqFt),
      internalWallAreaSqFt: Math.round(internalWallAreaSqFt),
      totalBalconiesAndUtilitiesSqFt: Math.round(totalBalconiesAndUtilitiesSqFt),
      builtupAreaSqFt: Math.round(builtupAreaSqFt),
      superBuiltupAreaSqFt: Math.round(superBuiltupAreaSqFt),
      commonAmenityLoadingAreaSqFt: Math.round(commonAmenityLoadingAreaSqFt),
      carpetEfficiencyPercent: Number(carpetEfficiencyPercent.toFixed(1)),
      basePropertyCost: Math.round(basePropertyCost),
      effectiveCarpetRatePerSqFt: Math.round(effectiveCarpetRatePerSqFt),
      totalInteriorFitoutCost: Math.round(totalInteriorFitoutCost),
      stampDutyAmount: Math.round(stampDutyAmount),
      registrationAmount: Math.round(registrationAmount),
      gstAmount: Math.round(gstAmount),
      totalPurchaseOutflow: Math.round(totalPurchaseOutflow)
    };
  }, [
    rooms, unitMultiplier, wallThicknessInches, loadingPercentage,
    propertyRatePerSqFt, interiorFitoutRatePerSqFt, stampDutyPercent,
    registrationRatePercent, includeGst
  ]);

  // Copy Full RERA & Budget Report
  const handleCopyReport = () => {
    let report = `RERA FLOOR PLAN AREA CERTIFICATE & VALUATION\n`;
    report += `==============================================\n`;
    report += `Project Plan: ${planName}\n`;
    report += `Unit System: ${unit.toUpperCase()} | Rooms Count: ${rooms.length}\n`;
    report += `Wall Thickness: ${wallThicknessInches} inches | Loading Factor: ${loadingPercentage}%\n\n`;
    report += `ROOM-BY-ROOM AREA BREAKDOWN:\n`;
    rooms.forEach((r) => {
      const a = (r.length * r.width * (unit === 'meters' ? 10.7639 : 1)).toFixed(1);
      report += `• ${r.name}: ${r.length} × ${r.width} ${unit} (${a} sq ft) — [${r.type.replace(/_/g, ' ').toUpperCase()}]\n`;
    });
    report += `\nRERA AREA METRICS:\n`;
    report += `• RERA Net Carpet Area: ${calculations.netUsableCarpetSqFt.toLocaleString()} sq ft (${(calculations.netUsableCarpetSqFt * 0.092903).toFixed(1)} m²)\n`;
    report += `• Balconies & Verandahs: ${calculations.balconiesSqFt} sq ft\n`;
    report += `• Utility & Wash Area: ${calculations.utilitiesSqFt} sq ft\n`;
    report += `• Structural Walls Area: ${calculations.internalWallAreaSqFt} sq ft\n`;
    report += `• Built-up Plinth Area: ${calculations.builtupAreaSqFt.toLocaleString()} sq ft\n`;
    report += `• Common Loading (${loadingPercentage}%): ${calculations.commonAmenityLoadingAreaSqFt} sq ft\n`;
    report += `• Super Built-up (Saleable): ${calculations.superBuiltupAreaSqFt.toLocaleString()} sq ft\n`;
    report += `• Carpet Space Efficiency: ${calculations.carpetEfficiencyPercent}%\n\n`;
    report += `FINANCIAL VALUATION & BUYER OUTFLOW:\n`;
    report += `• Base Property Cost (Super Area): ₹${calculations.basePropertyCost.toLocaleString()} (@ ₹${propertyRatePerSqFt}/sq ft)\n`;
    report += `• Effective Carpet Rate: ₹${calculations.effectiveCarpetRatePerSqFt.toLocaleString()}/sq ft\n`;
    report += `• Stamp Duty (${stampDutyPercent}%): ₹${calculations.stampDutyAmount.toLocaleString()}\n`;
    report += `• Registration Charges (1%): ₹${calculations.registrationAmount.toLocaleString()}\n`;
    if (includeGst) report += `• GST (5% Residential): ₹${calculations.gstAmount.toLocaleString()}\n`;
    report += `• Total Home Acquisition Outflow: ₹${calculations.totalPurchaseOutflow.toLocaleString()}\n`;
    report += `• Interior Fit-out & Turnkey Budget: ₹${calculations.totalInteriorFitoutCost.toLocaleString()} (@ ₹${interiorFitoutRatePerSqFt}/sq ft carpet)\n`;
    report += `==============================================\n`;
    report += `Generated on Toolique Architecture Studio.`;

    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download PDF Architectural Certificate
  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('Toolique — RERA Area Certificate & Valuation', 14, 18);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Layout Plan: ${planName} | Date: ${new Date().toLocaleDateString('en-IN')}`, 14, 25);

      let y = 35;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('1. Room-by-Room Area Inventory', 14, y);
      y += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      rooms.forEach((r) => {
        const a = (r.length * r.width * (unit === 'meters' ? 10.7639 : 1)).toFixed(1);
        doc.text(`• ${r.name}: ${r.length} x ${r.width} ${unit} (${a} sq ft) — ${r.type.replace(/_/g, ' ')}`, 16, y);
        y += 6;
      });
      y += 4;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('2. Official RERA & NBC Area Classification', 14, y);
      y += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`• RERA Net Carpet Area: ${calculations.netUsableCarpetSqFt.toLocaleString()} Sq. Ft (${(calculations.netUsableCarpetSqFt * 0.092903).toFixed(1)} Sq. M)`, 16, y); y += 6;
      doc.text(`• Balconies, Verandahs & Utilities: ${calculations.totalBalconiesAndUtilitiesSqFt} Sq. Ft`, 16, y); y += 6;
      doc.text(`• Internal & External Wall Thickness Area: ${calculations.internalWallAreaSqFt} Sq. Ft`, 16, y); y += 6;
      doc.text(`• Total Built-up Area: ${calculations.builtupAreaSqFt.toLocaleString()} Sq. Ft`, 16, y); y += 6;
      doc.text(`• Super Built-up Area (${loadingPercentage}% Loading): ${calculations.superBuiltupAreaSqFt.toLocaleString()} Sq. Ft`, 16, y); y += 6;
      doc.text(`• Usable Carpet Efficiency: ${calculations.carpetEfficiencyPercent}%`, 16, y); y += 10;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('3. Property Valuation & Acquisition Outflow', 14, y);
      y += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`• Base Property Cost: INR ${calculations.basePropertyCost.toLocaleString()} (@ INR ${propertyRatePerSqFt}/sq ft)`, 16, y); y += 6;
      doc.text(`• Effective Carpet Rate: INR ${calculations.effectiveCarpetRatePerSqFt.toLocaleString()}/sq ft usable space`, 16, y); y += 6;
      doc.text(`• Stamp Duty (${stampDutyPercent}%) + Reg (1%): INR ${(calculations.stampDutyAmount + calculations.registrationAmount).toLocaleString()}`, 16, y); y += 6;
      if (includeGst) {
        doc.text(`• GST (5%): INR ${calculations.gstAmount.toLocaleString()}`, 16, y); y += 6;
      }
      doc.text(`• Total Acquisition Outflow: INR ${calculations.totalPurchaseOutflow.toLocaleString()}`, 16, y); y += 6;
      doc.text(`• Estimated Interior Fit-out Budget: INR ${calculations.totalInteriorFitoutCost.toLocaleString()}`, 16, y);

      doc.save(`rera-area-plan-${planName.toLowerCase().replace(/\s+/g, '-')}.pdf`);
    } catch (e) {
      console.error(e);
    }
  };

  // Save Plan to history
  const handleSavePlan = () => {
    if (!planName.trim()) return;
    const newPlan: SavedFloorPlan = {
      id: Date.now().toString(),
      name: planName,
      carpetAreaSqFt: calculations.netUsableCarpetSqFt,
      superBuiltupSqFt: calculations.superBuiltupAreaSqFt,
      propertyCost: calculations.totalPurchaseOutflow,
      roomsCount: rooms.length,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    };
    const updated = [newPlan, ...savedPlans.slice(0, 9)];
    setSavedPlans(updated);
    localStorage.setItem('toolique_room_area_plans', JSON.stringify(updated));
  };

  const handleDeleteSavedPlan = (id: string) => {
    const updated = savedPlans.filter(p => p.id !== id);
    setSavedPlans(updated);
    localStorage.setItem('toolique_room_area_plans', JSON.stringify(updated));
  };

  const applyPreset = (preset: typeof FLOOR_PLAN_PRESETS[0]) => {
    setRooms(preset.rooms.map(r => ({ ...r, id: Math.random().toString() })));
  };

  const addCustomRoom = () => {
    setRooms([
      ...rooms,
      { id: Date.now().toString(), name: `Room ${rooms.length + 1}`, type: 'carpet_habitable', length: 12, width: 10 }
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
    setUnit('feet');
    setWallThicknessInches(9);
    setLoadingPercentage(30);
    setPropertyRatePerSqFt(6500);
    setInteriorFitoutRatePerSqFt(1400);
    setStampDutyPercent(6.0);
    setIncludeGst(true);
    applyPreset(FLOOR_PLAN_PRESETS[1]);
  };

  return (
    <div className="space-y-8">
      {/* HEADER CONTROLS & APARTMENT PRESETS */}
      <div className="saas-card p-6 space-y-4 text-left">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-zinc-200/60 dark:border-zinc-800/60">
          <div>
            <h2 className="text-base font-black text-zinc-900 dark:text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Room Area, RERA Carpet & Layout Planning Studio</span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
              Multi-room architectural floor plan builder, RERA Carpet vs Built-up vs Super Built-up area breakdown & property costs
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
                Feet (ft)
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
                Meters (m)
              </button>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 transition cursor-pointer"
              title="Reset Layout & Rates"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Apartment Presets */}
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-2">
            Standard Indian Residential Floor Plan Presets:
          </span>
          <div className="flex flex-wrap gap-2">
            {FLOOR_PLAN_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p)}
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
        {/* LEFT COLUMN: MULTI-ROOM LAYOUT BUILDER & WALL PARAMETERS */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. ROOM-BY-ROOM BUILDER */}
          <div className="saas-card p-6 space-y-4 text-left">
            <div className="flex justify-between items-center border-b border-zinc-200/60 dark:border-zinc-800/60 pb-3">
              <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Grid className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>1. Multi-Room Layout Inventory</span>
              </h3>
              <button
                type="button"
                onClick={addCustomRoom}
                className="px-2.5 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Room
              </button>
            </div>

            {/* Room List Table */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-800/60 flex flex-col sm:flex-row items-start sm:items-center gap-2.5"
                >
                  <input
                    type="text"
                    value={room.name}
                    onChange={(e) => updateRoom(room.id, 'name', e.target.value)}
                    className="flex-1 w-full sm:w-auto px-2.5 py-1.5 text-xs font-bold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none"
                    placeholder="Room Name"
                  />

                  {/* Room Type Selector */}
                  <select
                    value={room.type}
                    onChange={(e) => updateRoom(room.id, 'type', e.target.value as RoomType)}
                    className="px-2 py-1.5 text-xs font-bold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none cursor-pointer"
                  >
                    <option value="carpet_habitable">Living / Bed / Kitchen (Carpet)</option>
                    <option value="attached_toilet">Bathroom / Toilet (Carpet)</option>
                    <option value="balcony_terrace">Balcony / Terrace (Built-up)</option>
                    <option value="utility_wash">Dry Utility / Wash (Built-up)</option>
                    <option value="passage_foyer">Passage / Foyer (Carpet)</option>
                  </select>

                  <div className="flex items-center gap-1.5">
                    <div className="w-16 flex items-center gap-1">
                      <input
                        type="number"
                        step="0.5"
                        value={room.length}
                        onChange={(e) => updateRoom(room.id, 'length', Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full px-2 py-1 text-xs font-bold font-mono bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none text-center"
                      />
                      <span className="text-[10px] text-zinc-400 font-bold">L</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-bold">×</span>
                    <div className="w-16 flex items-center gap-1">
                      <input
                        type="number"
                        step="0.5"
                        value={room.width}
                        onChange={(e) => updateRoom(room.id, 'width', Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full px-2 py-1 text-xs font-bold font-mono bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none text-center"
                      />
                      <span className="text-[10px] text-zinc-400 font-bold">W</span>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 w-16 text-right shrink-0">
                    {(room.length * room.width * (unit === 'meters' ? 10.7639 : 1)).toFixed(0)} sqft
                  </span>

                  {rooms.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRoom(room.id)}
                      className="p-1.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Architectural Wall & Loading Parameters */}
            <div className="pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Wall Thickness ({unit === 'feet' ? 'Inches' : 'cm'})
                </label>
                <select
                  value={wallThicknessInches}
                  onChange={(e) => setWallThicknessInches(parseInt(e.target.value) || 9)}
                  className="saas-select text-xs font-bold"
                >
                  <option value={4.5}>4.5" (Internal Partition Walls Only)</option>
                  <option value={6}>6" (Modern RCC Shear Wall Mivan)</option>
                  <option value={9}>9" (Standard External Brick Wall)</option>
                  <option value={11}>11" (Heavy Load-Bearing Masonry)</option>
                </select>
                <span className="text-[10px] text-zinc-400">Calculates wall cross-section area</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Common Amenity Loading Factor (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={loadingPercentage}
                  onChange={(e) => setLoadingPercentage(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="saas-input font-mono font-bold"
                />
                <span className="text-[10px] text-zinc-400">Lobbies, lifts, corridors & club (25–35%)</span>
              </div>
            </div>
          </div>

          {/* 2. REAL ESTATE VALUATION & INTERIOR FITOUT RATES */}
          <div className="saas-card p-6 space-y-4 text-left">
            <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-3">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              <span>2. Property Cost & Interior Fit-out Rates</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Rate / Sq. Ft (Super Area)</label>
                <input
                  type="number"
                  value={propertyRatePerSqFt}
                  onChange={(e) => setPropertyRatePerSqFt(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="saas-input font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Interior Fit-out / Sq. Ft</label>
                <input
                  type="number"
                  value={interiorFitoutRatePerSqFt}
                  onChange={(e) => setInteriorFitoutRatePerSqFt(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="saas-input font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Stamp Duty (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={stampDutyPercent}
                  onChange={(e) => setStampDutyPercent(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="saas-input font-mono font-bold"
                />
              </div>
            </div>

            {/* GST Checkbox */}
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={includeGst}
                  onChange={(e) => setIncludeGst(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span>Include GST (5% Under-Construction Residential)</span>
              </label>
              <span className="text-[10px] font-mono font-bold text-zinc-400">
                {includeGst ? `+₹${calculations.gstAmount.toLocaleString()}` : '0% (Ready-to-move)'}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 2D FLOOR PLAN VISUALIZER & RERA METRICS */}
        <div className="lg:col-span-5 space-y-6">
          {/* PRIMARY AREA HERO CARD */}
          <div className="p-6 rounded-3xl bg-zinc-950 text-white shadow-xl space-y-5 text-left border border-zinc-800">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-800 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block">
                  RERA Net Carpet Area
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-3xl font-black font-mono text-indigo-400">
                    {calculations.netUsableCarpetSqFt.toLocaleString()}
                  </h3>
                  <span className="text-sm font-bold text-zinc-400">Sq. Feet</span>
                </div>
                <span className="text-[11px] text-zinc-400 font-medium block mt-1">
                  {(calculations.netUsableCarpetSqFt * 0.092903).toFixed(1)} m² • {calculations.carpetEfficiencyPercent}% Carpet Efficiency
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
                  <span>PDF Report</span>
                </button>
              </div>
            </div>

            {/* Quick 3-Area Matrix */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                <span className="text-[9px] font-black uppercase text-zinc-400 block">Balcony / Utility</span>
                <span className="text-xs font-black font-mono text-amber-300 mt-0.5 block">{calculations.totalBalconiesAndUtilitiesSqFt} sq ft</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                <span className="text-[9px] font-black uppercase text-zinc-400 block">Built-up (Plinth)</span>
                <span className="text-xs font-black font-mono text-indigo-300 mt-0.5 block">{calculations.builtupAreaSqFt} sq ft</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                <span className="text-[9px] font-black uppercase text-zinc-400 block">Super Built-Up</span>
                <span className="text-xs font-black font-mono text-emerald-400 mt-0.5 block">{calculations.superBuiltupAreaSqFt} sq ft</span>
              </div>
            </div>
          </div>

          {/* 2D ARCHITECTURAL FLOOR PLAN LAYOUT VISUALIZER */}
          <div className="saas-card p-6 space-y-4 text-left">
            <div className="flex justify-between items-center border-b border-zinc-200/60 dark:border-zinc-800/60 pb-3">
              <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>2D Layout Schematic Plan</span>
              </h3>
              <span className="text-[10px] font-bold text-zinc-400">
                {rooms.length} Rooms Configured
              </span>
            </div>

            <div className="w-full h-56 bg-zinc-950 rounded-2xl flex flex-col items-center justify-center p-3 relative overflow-hidden border border-zinc-800">
              <div className="w-full h-full grid grid-cols-2 sm:grid-cols-3 gap-2 overflow-y-auto p-1">
                {rooms.map((room) => {
                  let badgeBg = 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300';
                  if (room.type === 'balcony_terrace') badgeBg = 'bg-amber-500/20 border-amber-500/40 text-amber-300';
                  if (room.type === 'attached_toilet') badgeBg = 'bg-teal-500/20 border-teal-500/40 text-teal-300';
                  if (room.type === 'utility_wash') badgeBg = 'bg-rose-500/20 border-rose-500/40 text-rose-300';

                  return (
                    <div
                      key={room.id}
                      className={`p-2 rounded-xl border flex flex-col justify-between ${badgeBg}`}
                    >
                      <div>
                        <span className="text-[10px] font-black truncate block">{room.name}</span>
                        <span className="text-[8px] text-zinc-400 uppercase font-mono">
                          {room.length}×{room.width} {unit}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-black mt-1">
                        {(room.length * room.width * (unit === 'meters' ? 10.7639 : 1)).toFixed(0)} sq ft
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* FINANCIAL BREAKDOWN & FIT-OUT BUDGET */}
          <div className="saas-card p-6 space-y-4 text-left">
            <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-3">
              <Building className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Real Estate Purchase & Fit-out Valuation</span>
            </h3>

            <div className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="flex justify-between items-center">
                <span>Base Property Agreement Cost:</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-white">₹{calculations.basePropertyCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
                <span>Effective Usable Carpet Rate:</span>
                <span className="font-mono">₹{calculations.effectiveCarpetRatePerSqFt.toLocaleString()}/sq ft</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Stamp Duty ({stampDutyPercent}%) + Reg (1%):</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-white">₹{(calculations.stampDutyAmount + calculations.registrationAmount).toLocaleString()}</span>
              </div>
              {includeGst && (
                <div className="flex justify-between items-center">
                  <span>GST (5% Residential):</span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-white">₹{calculations.gstAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between items-center border-t border-zinc-200 dark:border-zinc-800 pt-2 font-bold">
                <span className="text-zinc-900 dark:text-white">Total Home Acquisition Outflow:</span>
                <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">₹{calculations.totalPurchaseOutflow.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center border-t border-zinc-200 dark:border-zinc-800 pt-2">
                <span>Turnkey Interior Fit-out Budget:</span>
                <span className="font-mono font-bold text-purple-600 dark:text-purple-400">₹{calculations.totalInteriorFitoutCost.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SAVED PLANS HISTORY SECTION */}
      <div className="saas-card p-6 space-y-4 text-left">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-3">
          <div>
            <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block">
              Saved Floor Plans & Architectural Records
            </h3>
            <span className="text-[10px] text-zinc-400 font-medium">Store custom flat and villa floor plan measurements in local browser storage</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder="Plan Label (e.g. Tower A 3BHK)"
              className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none flex-1 sm:w-56"
            />
            <button
              type="button"
              onClick={handleSavePlan}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Plan</span>
            </button>
          </div>
        </div>

        {savedPlans.length === 0 ? (
          <div className="py-6 text-center text-xs text-zinc-400">
            No saved floor plans yet. Click "Save Plan" above to store this layout calculation.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {savedPlans.map((p) => (
              <div key={p.id} className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-800/60 flex justify-between items-center gap-3">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black text-zinc-900 dark:text-white truncate max-w-[180px]">{p.name}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-medium">
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{p.carpetAreaSqFt} sq ft Carpet</span>
                    <span>•</span>
                    <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300">{p.superBuiltupSqFt} sq ft Super</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-xs">₹{p.propertyCost.toLocaleString()}</span>
                    <span className="text-[9px] text-zinc-400">{p.date}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteSavedPlan(p.id)}
                  className="p-1.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition cursor-pointer"
                  title="Delete Plan"
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

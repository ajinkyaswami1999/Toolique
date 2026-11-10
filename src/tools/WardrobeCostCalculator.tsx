import { useState, useMemo, useEffect } from 'react';
import { 
  Palette, RotateCcw, 
  Download, Layers, Sliders, Shield, Sparkles, 
  Shirt, Grid, Eye, Save, Trash2
} from 'lucide-react';
import { downloadPdfReport } from '../utils/pdf';
import { CopyButton, ShareWhatsApp, UnitSwitcher } from '../components/common';

// --- Type Definitions ---
type WardrobeLayout = 'straight' | 'l_shaped' | 'with_dresser' | 'walk_in';
type DoorMechanism = 'hinged' | 'sliding_2track' | 'sliding_3track' | 'bifold' | 'open_walkin';
type CoreMaterial = 'commercial_ply' | 'bwp_marine' | 'hdhmr' | 'mdf_particle' | 'teak_wood';
type FinishType = 'matte_laminate' | 'gloss_acrylic_laminate' | 'solid_acrylic' | 'veneer_pu' | 'tinted_fluted_glass' | 'pu_duco_paint';
type HardwareBrand = 'standard_ebco' | 'premium_hettich' | 'luxury_blum_hafele';

interface SavedQuote {
  id: string;
  name: string;
  layout: string;
  totalCost: number;
  areaSqFt: number;
  date: string;
}

// Layout presets
const LAYOUT_PRESETS = [
  { id: 'compact_2door', name: 'Compact 2-Door (4×7 ft)', layout: 'straight' as WardrobeLayout, width: 4, height: 7, depth: 24, loft: false, loftHeight: 2, door: 'hinged' as DoorMechanism, desc: 'Ideal for guest bedroom or kids room (28 sq ft)' },
  { id: 'standard_3door', name: 'Standard 3-Door (6×7 ft)', layout: 'straight' as WardrobeLayout, width: 6, height: 7, depth: 24, loft: true, loftHeight: 2, door: 'hinged' as DoorMechanism, desc: 'Most popular 3BHK secondary bedroom wardrobe' },
  { id: 'master_sliding', name: 'Master 2-Track Sliding (6×9 ft)', layout: 'straight' as WardrobeLayout, width: 6, height: 7, depth: 26, loft: true, loftHeight: 2, door: 'sliding_2track' as DoorMechanism, desc: 'Ceiling-touch sliding with overhead storage' },
  { id: 'grand_sliding', name: 'Grand 3-Track Sliding (9×9.5 ft)', layout: 'straight' as WardrobeLayout, width: 9, height: 7, depth: 26, loft: true, loftHeight: 2.5, door: 'sliding_3track' as DoorMechanism, desc: 'Wide Master suite with integrated loft' },
  { id: 'l_corner', name: 'L-Shaped Corner (7+5 ft)', layout: 'l_shaped' as WardrobeLayout, width: 12, height: 7, depth: 24, loft: true, loftHeight: 2, door: 'hinged' as DoorMechanism, desc: 'Corner utilization with dead-space carousel' },
  { id: 'vanity_combo', name: 'Wardrobe + Vanity Dresser (8×7 ft)', layout: 'with_dresser' as WardrobeLayout, width: 8, height: 7, depth: 24, loft: true, loftHeight: 2, door: 'hinged' as DoorMechanism, desc: '6ft wardrobe + 2ft illuminated dressing mirror unit' }
];

export default function WardrobeCostCalculator() {
  // 1. Dimensions & Layout
  const [unit, setUnit] = useState<'feet' | 'meters'>('feet');
  const [layout, setLayout] = useState<WardrobeLayout>('straight');
  const [width, setWidth] = useState<number>(6); // Feet
  const [height, setHeight] = useState<number>(7); // Feet
  const [depthInches, setDepthInches] = useState<number>(24); // Inches (21-26)
  
  // Overhead Loft
  const [includeLoft, setIncludeLoft] = useState<boolean>(true);
  const [loftHeight, setLoftHeight] = useState<number>(2); // Feet

  // 2. Core Material & Door Mechanism
  const [coreMaterial, setCoreMaterial] = useState<CoreMaterial>('bwp_marine');
  const [doorMechanism, setDoorMechanism] = useState<DoorMechanism>('sliding_2track');
  const [finishType, setFinishType] = useState<FinishType>('gloss_acrylic_laminate');
  const [hardwareBrand, setHardwareBrand] = useState<HardwareBrand>('premium_hettich');

  // 3. Internal Modules & Smart Accessories
  const [drawerCount, setDrawerCount] = useState<number>(4);
  const [includeTrouserRack, setIncludeTrouserRack] = useState<boolean>(true);
  const [includeJewelryTray, setIncludeJewelryTray] = useState<boolean>(false);
  const [includeHydraulicLift, setIncludeHydraulicLift] = useState<boolean>(false);
  const [includeLedSensorLights, setIncludeLedSensorLights] = useState<boolean>(true);
  const [includeDigitalSafe, setIncludeDigitalSafe] = useState<boolean>(false);
  const [includeMirrorShutter, setIncludeMirrorShutter] = useState<boolean>(true);

  // 4. Commercials & Taxes
  const [includeGst, setIncludeGst] = useState<boolean>(true);
  const [customSqFtRateOffset, setCustomSqFtRateOffset] = useState<number>(0);

  // UI state
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([]);
  const [quoteName, setQuoteName] = useState<string>('Master Bedroom Wardrobe');

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('toolique_wardrobe_quotes');
      if (saved) setSavedQuotes(JSON.parse(saved));
    } catch {}
  }, []);

  // Multiplier for dimensions if meters
  const lengthMultiplier = unit === 'meters' ? 3.28084 : 1;
  const widthFt = width * lengthMultiplier;
  const heightFt = height * lengthMultiplier;
  const loftHeightFt = includeLoft ? loftHeight * lengthMultiplier : 0;

  // --- CORE COST ENGINE ---
  const calculations = useMemo(() => {
    // 1. Facade Area
    const mainCabinetAreaSqFt = widthFt * heightFt;
    const loftAreaSqFt = includeLoft ? widthFt * loftHeightFt : 0;
    const totalAreaSqFt = mainCabinetAreaSqFt + loftAreaSqFt;

    // 2. Core Material Base Rate per Sq Ft (Indian Interior Market Benchmarks 2026)
    // Rates include 18mm Carcass + 18mm Shutters + 8mm Backing Sheet
    let baseRatePerSqFt = 1450; // BWP Marine standard
    if (coreMaterial === 'commercial_ply') baseRatePerSqFt = 1250;
    else if (coreMaterial === 'bwp_marine') baseRatePerSqFt = 1500;
    else if (coreMaterial === 'hdhmr') baseRatePerSqFt = 1380;
    else if (coreMaterial === 'mdf_particle') baseRatePerSqFt = 1100;
    else if (coreMaterial === 'teak_wood') baseRatePerSqFt = 2950;

    // 3. Door Mechanism Factor
    // Sliding tracks, rollers, brush strips and heavy profiles add ₹350 - ₹750/sq ft
    let doorMechanismRate = 0;
    if (doorMechanism === 'hinged') doorMechanismRate = 0; // Standard included in base
    else if (doorMechanism === 'sliding_2track') doorMechanismRate = 420;
    else if (doorMechanism === 'sliding_3track') doorMechanismRate = 650;
    else if (doorMechanism === 'bifold') doorMechanismRate = 580;
    else if (doorMechanism === 'open_walkin') doorMechanismRate = -180; // No doors

    // 4. Exterior Finish Cost Premium (Per Sq Ft of front shutters)
    let finishPremiumPerSqFt = 0;
    if (finishType === 'matte_laminate') finishPremiumPerSqFt = 0; // Baseline 1mm
    else if (finishType === 'gloss_acrylic_laminate') finishPremiumPerSqFt = 280;
    else if (finishType === 'solid_acrylic') finishPremiumPerSqFt = 520;
    else if (finishType === 'veneer_pu') finishPremiumPerSqFt = 850;
    else if (finishType === 'tinted_fluted_glass') finishPremiumPerSqFt = 1100;
    else if (finishType === 'pu_duco_paint') finishPremiumPerSqFt = 1250;

    // 5. Hardware Brand Multiplier
    let hardwareMultiplier = 1.0;
    if (hardwareBrand === 'standard_ebco') hardwareMultiplier = 0.95;
    else if (hardwareBrand === 'premium_hettich') hardwareMultiplier = 1.08;
    else if (hardwareBrand === 'luxury_blum_hafele') hardwareMultiplier = 1.22;

    // Base Carcass & Shutter Costs
    const effectiveMainRate = (baseRatePerSqFt + doorMechanismRate + finishPremiumPerSqFt + customSqFtRateOffset) * hardwareMultiplier;
    // Overhead Lofts have simple shelf partition (costs ~72% of main unit)
    const effectiveLoftRate = (baseRatePerSqFt * 0.72 + finishPremiumPerSqFt + customSqFtRateOffset) * hardwareMultiplier;

    const mainCabinetCost = mainCabinetAreaSqFt * effectiveMainRate;
    const loftCabinetCost = loftAreaSqFt * effectiveLoftRate;

    // 6. Internal Fittings & Smart Accessories
    const drawerCost = drawerCount * (hardwareBrand === 'luxury_blum_hafele' ? 3200 : hardwareBrand === 'premium_hettich' ? 2400 : 1600);
    const trouserRackCost = includeTrouserRack ? 3800 : 0;
    const jewelryTrayCost = includeJewelryTray ? 4500 : 0;
    const hydraulicLiftCost = includeHydraulicLift ? 6800 : 0;
    const ledSensorCost = includeLedSensorLights ? Math.max(1, Math.ceil(widthFt / 3)) * 1850 : 0;
    const digitalSafeCost = includeDigitalSafe ? 7500 : 0;
    const mirrorShutterCost = includeMirrorShutter ? 3200 : 0;

    const totalAccessoriesCost = drawerCost + trouserRackCost + jewelryTrayCost + hydraulicLiftCost + ledSensorCost + digitalSafeCost + mirrorShutterCost;

    // 7. Carpentry Assembly, Edge-Banding & Labor
    const subtotal = mainCabinetCost + loftCabinetCost + totalAccessoriesCost;
    const laborAndInstallationCost = subtotal * 0.12; // 12% on-site / factory fitting charge

    const totalBeforeTax = subtotal + laborAndInstallationCost;
    const gstAmount = includeGst ? totalBeforeTax * 0.18 : 0;
    const grandTotal = totalBeforeTax + gstAmount;

    // Number of doors estimate
    let doorCount = Math.max(2, Math.round(widthFt / 2));
    if (doorMechanism === 'sliding_2track') doorCount = 2;
    if (doorMechanism === 'sliding_3track') doorCount = 3;

    return {
      mainCabinetAreaSqFt: Number(mainCabinetAreaSqFt.toFixed(1)),
      loftAreaSqFt: Number(loftAreaSqFt.toFixed(1)),
      totalAreaSqFt: Number(totalAreaSqFt.toFixed(1)),
      mainCabinetCost: Math.round(mainCabinetCost),
      loftCabinetCost: Math.round(loftCabinetCost),
      drawerCost,
      trouserRackCost,
      jewelryTrayCost,
      hydraulicLiftCost,
      ledSensorCost,
      digitalSafeCost,
      mirrorShutterCost,
      totalAccessoriesCost,
      laborAndInstallationCost: Math.round(laborAndInstallationCost),
      totalBeforeTax: Math.round(totalBeforeTax),
      gstAmount: Math.round(gstAmount),
      grandTotal: Math.round(grandTotal),
      effectiveRatePerSqFt: totalAreaSqFt > 0 ? Math.round(grandTotal / totalAreaSqFt) : 0,
      doorCount
    };
  }, [
    widthFt, heightFt, includeLoft, loftHeightFt,
    coreMaterial, doorMechanism, finishType, hardwareBrand,
    customSqFtRateOffset, drawerCount, includeTrouserRack, includeJewelryTray,
    includeHydraulicLift, includeLedSensorLights, includeDigitalSafe, includeMirrorShutter,
    includeGst
  ]);

  // Detailed Text Quote for Copy & WhatsApp
  const getQuoteText = () => {
    let text = `MODULAR WARDROBE COST ESTIMATION & BOQ\n`;
    text += `=========================================\n`;
    text += `Project: ${quoteName}\n`;
    text += `Dimensions: ${width} × ${height} ${unit} (Depth: ${depthInches} inches)\n`;
    if (includeLoft) text += `Overhead Loft: Included (${loftHeight} ${unit} height)\n`;
    text += `Door Type: ${doorMechanism.replace(/_/g, ' ').toUpperCase()}\n`;
    text += `Core Board: ${coreMaterial.replace(/_/g, ' ').toUpperCase()}\n`;
    text += `Exterior Finish: ${finishType.replace(/_/g, ' ').toUpperCase()}\n`;
    text += `Hardware Brand: ${hardwareBrand.replace(/_/g, ' ').toUpperCase()}\n\n`;
    text += `DIMENSIONS & BILLABLE AREA:\n`;
    text += `• Main Cabinet Area: ${calculations.mainCabinetAreaSqFt} sq ft\n`;
    text += `• Overhead Loft Area: ${calculations.loftAreaSqFt} sq ft\n`;
    text += `• Total Facade Area: ${calculations.totalAreaSqFt} sq ft\n\n`;
    text += `ITEMIZED COST BREAKDOWN:\n`;
    text += `• Main Cabinetry & Shutters: ₹${calculations.mainCabinetCost.toLocaleString()}\n`;
    if (includeLoft) text += `• Overhead Loft Cabinets: ₹${calculations.loftCabinetCost.toLocaleString()}\n`;
    text += `• Internal Soft-Close Drawers (${drawerCount} nos): ₹${calculations.drawerCost.toLocaleString()}\n`;
    if (includeTrouserRack) text += `• Pull-out Trouser Organizer: ₹${calculations.trouserRackCost.toLocaleString()}\n`;
    if (includeJewelryTray) text += `• Velvet Jewelry/Watch Tray: ₹${calculations.jewelryTrayCost.toLocaleString()}\n`;
    if (includeHydraulicLift) text += `• High-Reach Hydraulic Wardrobe Lift: ₹${calculations.hydraulicLiftCost.toLocaleString()}\n`;
    if (includeLedSensorLights) text += `• Auto Motion-Sensor LED Strips: ₹${calculations.ledSensorCost.toLocaleString()}\n`;
    if (includeDigitalSafe) text += `• Integrated Digital Locker: ₹${calculations.digitalSafeCost.toLocaleString()}\n`;
    if (includeMirrorShutter) text += `• Dressing Mirror Shutter Inlay: ₹${calculations.mirrorShutterCost.toLocaleString()}\n`;
    text += `• Factory Edge-Banding & On-Site Installation (12%): ₹${calculations.laborAndInstallationCost.toLocaleString()}\n`;
    if (includeGst) text += `• GST (18% Interior Services): ₹${calculations.gstAmount.toLocaleString()}\n`;
    text += `-----------------------------------------\n`;
    text += `GRAND TOTAL ESTIMATE: ₹${calculations.grandTotal.toLocaleString()} (₹${calculations.effectiveRatePerSqFt}/sq ft)\n`;
    text += `=========================================\n`;
    text += `Generated on Toolique Modular Interior Studio.`;
    return text;
  };

  // Standardized Branded PDF Quotation (Pillar 2)
  const handleDownloadPDF = () => {
    const rows = [
      { item: 'Main Cabinetry & Shutters', area: `${calculations.mainCabinetAreaSqFt} sq.ft`, rate: `Base Rate`, amount: `₹${calculations.mainCabinetCost.toLocaleString('en-IN')}` },
      ...(includeLoft ? [{ item: 'Overhead Storage Lofts', area: `${calculations.loftAreaSqFt} sq.ft`, rate: `Loft Spec`, amount: `₹${calculations.loftCabinetCost.toLocaleString('en-IN')}` }] : []),
      { item: `Internal Soft-Close Drawers (${drawerCount} nos)`, area: `${drawerCount} units`, rate: `₹2,200/unit`, amount: `₹${calculations.drawerCost.toLocaleString('en-IN')}` },
      ...(includeTrouserRack ? [{ item: 'Pull-out Trouser Organizer', area: '1 unit', rate: 'Accessory', amount: `₹${calculations.trouserRackCost.toLocaleString('en-IN')}` }] : []),
      ...(includeJewelryTray ? [{ item: 'Velvet Jewelry/Watch Tray', area: '1 unit', rate: 'Accessory', amount: `₹${calculations.jewelryTrayCost.toLocaleString('en-IN')}` }] : []),
      ...(includeHydraulicLift ? [{ item: 'High-Reach Hydraulic Wardrobe Lift', area: '1 unit', rate: 'Hardware', amount: `₹${calculations.hydraulicLiftCost.toLocaleString('en-IN')}` }] : []),
      ...(includeLedSensorLights ? [{ item: 'Auto Motion-Sensor LED Strips', area: 'Full run', rate: 'Electrical', amount: `₹${calculations.ledSensorCost.toLocaleString('en-IN')}` }] : []),
      ...(includeDigitalSafe ? [{ item: 'Integrated Digital Locker', area: '1 unit', rate: 'Security', amount: `₹${calculations.digitalSafeCost.toLocaleString('en-IN')}` }] : []),
      ...(includeMirrorShutter ? [{ item: 'Dressing Mirror Shutter Inlay', area: '1 shutter', rate: 'Glazing', amount: `₹${calculations.mirrorShutterCost.toLocaleString('en-IN')}` }] : []),
      { item: 'Factory Edge-Banding & On-Site Installation (12%)', area: 'Fitting & PUR', rate: '12%', amount: `₹${calculations.laborAndInstallationCost.toLocaleString('en-IN')}` },
      ...(includeGst ? [{ item: 'GST on Modular Works (18%)', area: 'Statutory', rate: '18%', amount: `₹${calculations.gstAmount.toLocaleString('en-IN')}` }] : [])
    ];

    downloadPdfReport({
      title: 'Modular Wardrobe Cost Estimation & BOQ',
      subtitle: `Scope: ${quoteName} | Door Type: ${doorMechanism.replace(/_/g, ' ').toUpperCase()}`,
      category: 'interior',
      complianceBadge: 'IS 710 & IS 2046',
      referenceId: `WDB-${Date.now().toString().slice(-6)}`,
      theme: 'brand',
      project: {
        projectName: quoteName,
        clientName: 'Client Requisition',
        notes: `Core: ${coreMaterial.replace(/_/g, ' ')} | Finish: ${finishType.replace(/_/g, ' ')} | Hardware: ${hardwareBrand.replace(/_/g, ' ')}`
      },
      kpis: [
        { label: 'Grand Total', value: `₹${calculations.grandTotal.toLocaleString('en-IN')}`, highlight: true },
        { label: 'Total Facade Area', value: `${calculations.totalAreaSqFt} sq.ft` },
        { label: 'Effective Rate', value: `₹${calculations.effectiveRatePerSqFt}/sq.ft` },
        { label: 'Main Cabinet', value: `₹${calculations.mainCabinetCost.toLocaleString('en-IN')}` }
      ],
      parameters: [
        { label: 'Dimensions', value: `${width} ft Width × ${height} ft Height (Depth: ${depthInches}")` },
        { label: 'Overhead Loft', value: includeLoft ? `Yes (${loftHeight} ft Height)` : 'None' },
        { label: 'Door Mechanism', value: doorMechanism.replace(/_/g, ' ').toUpperCase() },
        { label: 'Core Board', value: coreMaterial.replace(/_/g, ' ').toUpperCase() },
        { label: 'Exterior Finish', value: finishType.replace(/_/g, ' ').toUpperCase() },
        { label: 'Hardware Brand', value: hardwareBrand.replace(/_/g, ' ').toUpperCase() },
      ],
      tables: [
        {
          title: 'Bill of Quantities (BOQ) & Itemized Estimate',
          columns: [
            { header: 'Item Description', dataKey: 'item' },
            { header: 'Scope / Qty', dataKey: 'area' },
            { header: 'Rate Spec', dataKey: 'rate' },
            { header: 'Amount (INR)', dataKey: 'amount', align: 'right' },
          ],
          rows,
          totalsRow: [
            { dataKey: 'item', value: 'Grand Total' },
            { dataKey: 'amount', value: `₹${calculations.grandTotal.toLocaleString('en-IN')}` },
          ],
        }
      ],
      disclaimers: [
        'All carcass panels factory pre-grooved and edged with hot-melt 2mm PVC/PUR edge bands.',
        'Final dimensions and drawer runouts are subject to onsite laser survey and civil plumb check.',
        'Warranty adheres to manufacturer standards (Hettich / Blum / Hafele warranty for fittings).'
      ],
      includeSignoff: true,
      fileName: `wardrobe-quote-${quoteName.toLowerCase().replace(/\s+/g, '-')}.pdf`
    });
  };

  // Save Quote to local storage
  const handleSaveQuote = () => {
    if (!quoteName.trim()) return;
    const newQuote: SavedQuote = {
      id: Date.now().toString(),
      name: quoteName,
      layout,
      totalCost: calculations.grandTotal,
      areaSqFt: calculations.totalAreaSqFt,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    };
    const updated = [newQuote, ...savedQuotes.slice(0, 9)];
    setSavedQuotes(updated);
    localStorage.setItem('toolique_wardrobe_quotes', JSON.stringify(updated));
  };

  const handleDeleteSavedQuote = (id: string) => {
    const updated = savedQuotes.filter(q => q.id !== id);
    setSavedQuotes(updated);
    localStorage.setItem('toolique_wardrobe_quotes', JSON.stringify(updated));
  };

  const applyLayoutPreset = (p: typeof LAYOUT_PRESETS[0]) => {
    setLayout(p.layout);
    setWidth(p.width);
    setHeight(p.height);
    setDepthInches(p.depth);
    setIncludeLoft(p.loft);
    if (p.loftHeight) setLoftHeight(p.loftHeight);
    setDoorMechanism(p.door);
  };

  const handleReset = () => {
    setWidth(6);
    setHeight(7);
    setDepthInches(24);
    setIncludeLoft(true);
    setLoftHeight(2);
    setCoreMaterial('bwp_marine');
    setDoorMechanism('sliding_2track');
    setFinishType('gloss_acrylic_laminate');
    setHardwareBrand('premium_hettich');
    setDrawerCount(4);
    setIncludeTrouserRack(true);
    setIncludeJewelryTray(false);
    setIncludeHydraulicLift(false);
    setIncludeLedSensorLights(true);
    setIncludeDigitalSafe(false);
    setIncludeMirrorShutter(true);
  };

  return (
    <div className="space-y-8">
      {/* TOP CONTROLS & QUICK PRESETS */}
      <div className="saas-card p-6 space-y-4 text-left">
        <div className="flex flex-wrap justify-between items-center gap-4 pb-4 border-b border-zinc-200/60 dark:border-zinc-800/60">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" />
              <span>IS 710 BWP &amp; HDHMR Specs</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Unit Switcher */}
            <UnitSwitcher<'feet' | 'meters'>
              value={unit}
              onChange={setUnit}
              preset="meters-feet"
              size="sm"
            />

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

        {/* Quick Bedroom Wardrobe Presets */}
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-2">
            Standard Indian Modular Bedroom Presets:
          </span>
          <div className="flex flex-wrap gap-2">
            {LAYOUT_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyLayoutPreset(p)}
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
        {/* LEFT COLUMN: SPECIFICATIONS & MATERIAL PICKERS */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. DIMENSIONS & LOFT CONFIG */}
          <div className="saas-card p-6 space-y-4 text-left">
            <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-3">
              <Grid className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>1. Wardrobe Dimensions & Wall Niche</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Width ({unit})
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={width}
                  onChange={(e) => setWidth(Math.max(1, parseFloat(e.target.value) || 0))}
                  className="saas-input font-mono font-bold"
                />
                <span className="text-[10px] text-zinc-400">Wall width span</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Main Height ({unit})
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={height}
                  onChange={(e) => setHeight(Math.max(1, parseFloat(e.target.value) || 0))}
                  className="saas-input font-mono font-bold"
                />
                <span className="text-[10px] text-zinc-400">Standard 7.0 ft</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Depth (Inches)
                </label>
                <select
                  value={depthInches}
                  onChange={(e) => setDepthInches(parseInt(e.target.value) || 24)}
                  className="saas-select text-xs font-bold"
                >
                  <option value={21}>21" (Compact Hinged)</option>
                  <option value={24}>24" (Standard Standard)</option>
                  <option value={26}>26" (Sliding Tracks)</option>
                  <option value={28}>28" (Deep Walk-in)</option>
                </select>
                <span className="text-[10px] text-zinc-400">Internal hanger depth</span>
              </div>
            </div>

            {/* Loft Switch */}
            <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="includeLoft"
                  checked={includeLoft}
                  onChange={(e) => setIncludeLoft(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="includeLoft" className="text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer">
                  Include Overhead Storage Loft (Ceiling Touch)
                </label>
              </div>

              {includeLoft && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-500">Loft Height:</span>
                  <input
                    type="number"
                    step="0.25"
                    value={loftHeight}
                    onChange={(e) => setLoftHeight(Math.max(0.5, parseFloat(e.target.value) || 0))}
                    className="w-20 px-2 py-1 text-xs font-bold font-mono bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none"
                  />
                  <span className="text-xs text-zinc-400 font-bold">{unit}</span>
                </div>
              )}
            </div>
          </div>

          {/* 2. CORE MATERIAL & DOOR MECHANISM */}
          <div className="saas-card p-6 space-y-4 text-left">
            <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-3">
              <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>2. Core Board & Door Mechanism</span>
            </h3>

            {/* Door Mechanism Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Door Mechanism
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'hinged', label: 'Hinged Doors', desc: 'Standard swing opening' },
                  { id: 'sliding_2track', label: '2-Track Sliding', desc: 'Space-saving top hung' },
                  { id: 'sliding_3track', label: '3-Track Sliding', desc: 'For 9ft+ wide units' },
                  { id: 'bifold', label: 'Bi-Fold Panorama', desc: 'Full width folding doors' },
                  { id: 'open_walkin', label: 'Open / Walk-in', desc: 'Minimalist profile' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDoorMechanism(item.id as DoorMechanism)}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      doorMechanism === item.id
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                        : 'bg-zinc-50 dark:bg-zinc-950/40 border-zinc-200/60 dark:border-zinc-800/60 text-zinc-700 dark:text-zinc-300 hover:border-indigo-500/40'
                    }`}
                  >
                    <span className="text-xs font-black block">{item.label}</span>
                    <span className={`text-[10px] block mt-0.5 ${doorMechanism === item.id ? 'text-indigo-100' : 'text-zinc-400'}`}>
                      {item.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Core Carcass Board */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Core Carcass Board (Structural Box)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { id: 'bwp_marine', name: 'BWP Marine Ply (IS:710)', desc: '100% Waterproof & Termite Resistant', tag: 'Recommended' },
                  { id: 'commercial_ply', name: 'Commercial MR Ply (IS:303)', desc: 'Moisture resistant standard grade', tag: 'Budget' },
                  { id: 'hdhmr', name: 'HDHMR Board (Action TESA)', desc: 'High density water resistant fiber', tag: 'Modern' },
                  { id: 'mdf_particle', name: 'Pre-Lam Particle / MDF', desc: 'Standard factory modular board', tag: 'Economy' },
                  { id: 'teak_wood', name: 'Solid Teak / Hardwood', desc: 'Traditional heavy luxury timber', tag: 'Ultra' }
                ].map((mat) => (
                  <button
                    key={mat.id}
                    type="button"
                    onClick={() => setCoreMaterial(mat.id as CoreMaterial)}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex justify-between items-start ${
                      coreMaterial === mat.id
                        ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-600 text-indigo-950 dark:text-indigo-200 ring-1 ring-indigo-600'
                        : 'bg-zinc-50 dark:bg-zinc-950/40 border-zinc-200/60 dark:border-zinc-800/60 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-black block">{mat.name}</span>
                      <span className="text-[10px] text-zinc-400 block mt-0.5">{mat.desc}</span>
                    </div>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 shrink-0">
                      {mat.tag}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. EXTERIOR SHUTTER FINISH & HARDWARE */}
          <div className="saas-card p-6 space-y-4 text-left">
            <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-3">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>3. Exterior Finish & Hardware Brand</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Front Shutter Finish
                </label>
                <select
                  value={finishType}
                  onChange={(e) => setFinishType(e.target.value as FinishType)}
                  className="saas-select text-xs font-bold"
                >
                  <option value="matte_laminate">1.0mm Matte / Suede Laminate</option>
                  <option value="gloss_acrylic_laminate">High-Gloss Acrylic Laminate</option>
                  <option value="solid_acrylic">2.0mm Solid Acrylic (Mirror Gloss)</option>
                  <option value="veneer_pu">Natural Wood Veneer + PU Polish</option>
                  <option value="tinted_fluted_glass">Tinted Fluted Glass + Aluminum Profile</option>
                  <option value="pu_duco_paint">Seamless PU Duco Paint Finish</option>
                </select>
                <span className="text-[10px] text-zinc-400">Exterior facade look</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Hinges & Hardware Brand
                </label>
                <select
                  value={hardwareBrand}
                  onChange={(e) => setHardwareBrand(e.target.value as HardwareBrand)}
                  className="saas-select text-xs font-bold"
                >
                  <option value="premium_hettich">Hettich (German Soft-Close)</option>
                  <option value="luxury_blum_hafele">Hafele / Blum (Luxury Austrian)</option>
                  <option value="standard_ebco">Ebco / Ozone (Standard Heavy-Duty)</option>
                </select>
                <span className="text-[10px] text-zinc-400">Concealed soft-close fittings</span>
              </div>
            </div>
          </div>

          {/* 4. SMART INTERNAL ACCESSORIES */}
          <div className="saas-card p-6 space-y-4 text-left">
            <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-3">
              <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>4. Internal Modules & Smart Accessories</span>
            </h3>

            <div className="space-y-3">
              {/* Drawers Count Slider */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-800/60">
                <div className="flex items-center gap-2">
                  <Shirt className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">Soft-Close Drawers</span>
                    <span className="text-[10px] text-zinc-400">Telescopic / undermount soft closing</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDrawerCount(Math.max(0, drawerCount - 1))}
                    className="w-7 h-7 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 transition"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-mono font-bold text-sm text-zinc-900 dark:text-white">
                    {drawerCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDrawerCount(Math.min(10, drawerCount + 1))}
                    className="w-7 h-7 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 transition"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Toggles for special accessories */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { checked: includeTrouserRack, onChange: setIncludeTrouserRack, label: 'Pull-Out Trouser / Saree Rack', price: '₹3,800' },
                  { checked: includeJewelryTray, onChange: setIncludeJewelryTray, label: 'Velvet Jewelry & Watch Tray', price: '₹4,500' },
                  { checked: includeHydraulicLift, onChange: setIncludeHydraulicLift, label: 'Hydraulic Wardrobe Lift', price: '₹6,800' },
                  { checked: includeLedSensorLights, onChange: setIncludeLedSensorLights, label: 'Motion-Sensor Profile LEDs', price: '₹1,850/bay' },
                  { checked: includeDigitalSafe, onChange: setIncludeDigitalSafe, label: 'Built-in Digital Safe / Locker', price: '₹7,500' },
                  { checked: includeMirrorShutter, onChange: setIncludeMirrorShutter, label: 'Full Dressing Mirror Inlay', price: '₹3,200' }
                ].map((item, idx) => (
                  <label
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-800/60 cursor-pointer hover:border-indigo-500/40 transition"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={(e) => item.onChange(e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{item.label}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                      {item.price}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 2D BLUEPRINT VISUALIZER & QUOTATION */}
        <div className="lg:col-span-5 space-y-6">
          {/* PRIMARY TOTAL HERO CARD */}
          <div className="p-6 rounded-3xl bg-zinc-950 text-white shadow-xl space-y-5 text-left border border-zinc-800">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-800 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block">
                  Estimated Wardrobe Cost
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-3xl font-black font-mono text-indigo-400">
                    ₹{calculations.grandTotal.toLocaleString()}
                  </h3>
                </div>
                <span className="text-[11px] text-zinc-400 font-medium block mt-1">
                  ₹{calculations.effectiveRatePerSqFt}/sq ft • {calculations.totalAreaSqFt} sq ft total
                </span>
              </div>

              <div className="flex items-center gap-2">
                <CopyButton text={getQuoteText} label="Copy Quote" copiedLabel="Copied" size="xs" variant="secondary" />
                <ShareWhatsApp text={getQuoteText} label="WhatsApp" size="xs" variant="solid" />
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/20"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF Quote</span>
                </button>
              </div>
            </div>

            {/* Quick 3-Metric Strip */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                <span className="text-[9px] font-black uppercase text-zinc-400 block">Main Cabinet</span>
                <span className="text-xs font-black font-mono text-white mt-0.5 block">₹{calculations.mainCabinetCost.toLocaleString()}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                <span className="text-[9px] font-black uppercase text-zinc-400 block">Overhead Loft</span>
                <span className="text-xs font-black font-mono text-indigo-300 mt-0.5 block">₹{calculations.loftCabinetCost.toLocaleString()}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                <span className="text-[9px] font-black uppercase text-zinc-400 block">Accessories</span>
                <span className="text-xs font-black font-mono text-emerald-400 mt-0.5 block">₹{calculations.totalAccessoriesCost.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* 2D ARCHITECTURAL ELEVATION VISUALIZER */}
          <div className="saas-card p-6 space-y-4 text-left">
            <div className="flex justify-between items-center border-b border-zinc-200/60 dark:border-zinc-800/60 pb-3">
              <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>2D Architectural Elevation Preview</span>
              </h3>
              <span className="text-[10px] font-bold text-zinc-400">
                {width} × {height + (includeLoft ? loftHeight : 0)} {unit}
              </span>
            </div>

            <div className="w-full h-64 bg-zinc-950 rounded-2xl flex flex-col items-center justify-center p-4 relative overflow-hidden border border-zinc-800">
              {/* SVG Elevation Drawing */}
              <svg className="w-full h-full max-h-56" viewBox="0 0 200 180">
                {/* Background grid */}
                <pattern id="wardrobe-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#27272a" strokeWidth="0.5" />
                </pattern>
                <rect width="200" height="180" fill="url(#wardrobe-grid)" />

                {/* Loft Box */}
                {includeLoft && (
                  <g transform="translate(30, 15)">
                    <rect x="0" y="0" width="140" height="30" fill="#312e81" fillOpacity="0.4" stroke="#6366f1" strokeWidth="1.5" rx="2" />
                    <line x1="70" y1="0" x2="70" y2="30" stroke="#6366f1" strokeWidth="1" strokeDasharray="2 2" />
                    <text x="70" y="18" textAnchor="middle" fontSize="6" className="fill-indigo-300 font-sans font-bold">Overhead Loft ({loftHeight} ft)</text>
                  </g>
                )}

                {/* Main Wardrobe Box */}
                <g transform={`translate(30, ${includeLoft ? 48 : 25})`}>
                  <rect x="0" y="0" width="140" height="110" fill="#1e1b4b" fillOpacity="0.3" stroke="#818cf8" strokeWidth="2" rx="3" />

                  {/* Doors partition lines */}
                  {doorMechanism.startsWith('sliding') ? (
                    <>
                      {/* Sliding Shutter 1 */}
                      <rect x="2" y="2" width="72" height="106" fill="#4338ca" fillOpacity="0.25" stroke="#a5b4fc" strokeWidth="1.2" rx="2" />
                      <line x1="70" y1="50" x2="70" y2="65" stroke="#e0e7ff" strokeWidth="2" strokeLinecap="round" />
                      {/* Sliding Shutter 2 */}
                      <rect x="66" y="2" width="72" height="106" fill="#3730a3" fillOpacity="0.25" stroke="#a5b4fc" strokeWidth="1.2" rx="2" />
                      <line x1="134" y1="50" x2="134" y2="65" stroke="#e0e7ff" strokeWidth="2" strokeLinecap="round" />
                      {/* Sliding track indicators */}
                      <line x1="5" y1="4" x2="135" y2="4" stroke="#6366f1" strokeWidth="1.5" />
                      <line x1="5" y1="106" x2="135" y2="106" stroke="#6366f1" strokeWidth="1.5" />
                    </>
                  ) : (
                    <>
                      {/* Hinged Doors Split */}
                      {Array.from({ length: calculations.doorCount }).map((_, idx) => {
                        const doorW = 140 / calculations.doorCount;
                        const xPos = idx * doorW;
                        return (
                          <g key={idx}>
                            <rect x={xPos + 1} y="2" width={doorW - 2} height="106" fill="#312e81" fillOpacity="0.2" stroke="#818cf8" strokeWidth="1" rx="1" />
                            {/* Door handle */}
                            <circle cx={xPos + doorW - 6} cy="55" r="2" fill="#fbbf24" />
                          </g>
                        );
                      })}
                    </>
                  )}

                  {/* Mirror Overlay if selected */}
                  {includeMirrorShutter && (
                    <rect x="10" y="10" width="25" height="90" fill="#38bdf8" fillOpacity="0.2" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="3 3" />
                  )}

                  {/* Drawers internal indicators */}
                  {drawerCount > 0 && (
                    <g transform="translate(85, 70)">
                      <rect x="0" y="0" width="45" height="35" fill="#18181b" fillOpacity="0.8" stroke="#52525b" strokeWidth="1" />
                      {Array.from({ length: Math.min(3, drawerCount) }).map((_, dIdx) => (
                        <line key={dIdx} x1="2" y1={(dIdx + 1) * 11} x2="43" y2={(dIdx + 1) * 11} stroke="#71717a" strokeWidth="0.8" />
                      ))}
                    </g>
                  )}
                </g>

                {/* Overall Width Tag */}
                <text x="100" y={includeLoft ? 170 : 148} textAnchor="middle" fontSize="8" className="fill-zinc-400 font-mono font-bold">
                  {width} {unit} Width
                </text>
              </svg>
            </div>
          </div>

          {/* ITEMIZED BILL OF QUANTITIES (BOQ) */}
          <div className="saas-card p-6 space-y-4 text-left">
            <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-3">
              <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Itemized Contractor Bill of Quantities (BOQ)</span>
            </h3>

            {/* Commercial Adjustments & GST Toggle */}
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-800/60 space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={includeGst}
                    onChange={(e) => setIncludeGst(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span>Include GST (18% Standard Services)</span>
                </label>
                <span className="text-[10px] font-mono font-bold text-zinc-400">
                  {includeGst ? `+₹${calculations.gstAmount.toLocaleString()}` : 'Excluded'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-zinc-200/60 dark:border-zinc-800/60">
                <span className="text-[10px] font-bold text-zinc-500">Contractor Rate Offset (± ₹/sq ft):</span>
                <input
                  type="number"
                  step="50"
                  value={customSqFtRateOffset}
                  onChange={(e) => setCustomSqFtRateOffset(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-20 px-2 py-0.5 text-xs font-bold font-mono bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none text-right"
                />
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="flex justify-between items-center">
                <span>Main Carcass & Shutters ({calculations.mainCabinetAreaSqFt} sq ft):</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-white">₹{calculations.mainCabinetCost.toLocaleString()}</span>
              </div>
              {includeLoft && (
                <div className="flex justify-between items-center">
                  <span>Overhead Storage Loft ({calculations.loftAreaSqFt} sq ft):</span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-white">₹{calculations.loftCabinetCost.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span>Soft-Close Drawers ({drawerCount} nos):</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-white">₹{calculations.drawerCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Internal Accessories & Lighting:</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-white">₹{(calculations.totalAccessoriesCost - calculations.drawerCost).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Factory Edge-Banding & Installation (12%):</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-white">₹{calculations.laborAndInstallationCost.toLocaleString()}</span>
              </div>
              {includeGst && (
                <div className="flex justify-between items-center">
                  <span>GST (18% Interior Services):</span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-white">₹{calculations.gstAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between items-center border-t border-zinc-200 dark:border-zinc-800 pt-2 font-bold text-sm">
                <span className="text-indigo-600 dark:text-indigo-400">Grand Total Quote:</span>
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
              Saved Wardrobe Quotations & Room Projects
            </h3>
            <span className="text-[10px] text-zinc-400 font-medium">Save wardrobe calculations for master, kids, or guest bedrooms</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={quoteName}
              onChange={(e) => setQuoteName(e.target.value)}
              placeholder="Room Label (e.g. Master Bedroom)"
              className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none flex-1 sm:w-56"
            />
            <button
              type="button"
              onClick={handleSaveQuote}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Quote</span>
            </button>
          </div>
        </div>

        {savedQuotes.length === 0 ? (
          <div className="py-6 text-center text-xs text-zinc-400">
            No saved wardrobe projects yet. Click "Save Quote" above to store this estimate in your browser.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {savedQuotes.map((q) => (
              <div key={q.id} className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-800/60 flex justify-between items-center gap-3">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black text-zinc-900 dark:text-white truncate max-w-[180px]">{q.name}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-medium">
                    <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300">{q.areaSqFt} sq ft</span>
                    <span>•</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">₹{q.totalCost.toLocaleString()}</span>
                  </div>
                  <span className="text-[9px] text-zinc-400 block">{q.date}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteSavedQuote(q.id)}
                  className="p-1.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition cursor-pointer"
                  title="Delete Quote"
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

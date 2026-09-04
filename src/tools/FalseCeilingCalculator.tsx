import { useState, useMemo, useEffect } from 'react';
import { 
  Palette, Clipboard, Check, RotateCcw, 
  Download, Layers, 
  Eye, Save, Trash2, Plus, Zap,
  ShieldCheck, Lightbulb
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import MaterialTrendGraph from '../components/MaterialTrendGraph';

// --- Types & Interfaces ---
type UnitType = 'feet' | 'meters';
type ComplexityTier = 'flat_single' | 'single_cove_tray' | 'floating_island' | 'custom_cnc_curves';
type LightColorTemp = 'warm_white_3000k' | 'neutral_4000k' | 'cool_daylight_6500k';

interface CeilingSystem {
  id: string;
  name: string;
  category: 'gypsum' | 'pop' | 'pvc' | 'wooden' | 'grid' | 'metal';
  baseRateSqFt: number; // INR per sq ft (Board/Panel + standard GI steel framing)
  description: string;
  needsPainting: boolean;
  warrantyYears: number;
  bestFor: string;
}

interface RoomCeilingItem {
  id: string;
  name: string;
  length: number;
  width: number;
  systemId: string;
  complexity: ComplexityTier;
  includeCoveLight: boolean;
  coveRunningLengthCustom?: number; // Custom Rft if user wants to override
  numDownlights: number;
  numCobSpots: number;
  includeMagneticTrack: boolean;
  magneticTrackLengthFt: number;
  includeCeilingPaint: boolean;
  fanHookPoints: number;
}

interface SavedCeilingQuote {
  id: string;
  name: string;
  totalCost: number;
  totalAreaSqFt: number;
  totalRooms: number;
  primarySystem: string;
  date: string;
}

// 6 Industry-Standard Ceiling Systems in India
const CEILING_SYSTEMS: CeilingSystem[] = [
  {
    id: 'gyproc_gypsum',
    name: 'Saint-Gobain Gyproc Gypsum (12.5mm)',
    category: 'gypsum',
    baseRateSqFt: 105,
    description: 'Tapered edge Gypsum boards over GI Ultra-Steel framing with jointing paste & paper tape',
    needsPainting: true,
    warrantyYears: 10,
    bestFor: 'Modern living rooms, bedrooms, and seamless designer halls'
  },
  {
    id: 'pop_plaster',
    name: 'POP Hand-Plastered (over GI Mesh)',
    category: 'pop',
    baseRateSqFt: 130,
    description: 'Chicken wire mesh + heavy gauge GI channels with 3 hand-troweled coats of Plaster of Paris',
    needsPainting: true,
    warrantyYears: 15,
    bestFor: 'Custom organic curves, domes, intricate cornices, and artistic arches'
  },
  {
    id: 'pvc_panels',
    name: 'Waterproof PVC Laminated Panels',
    category: 'pvc',
    baseRateSqFt: 85,
    description: 'Tongue-and-groove 100% moisture-proof and termite-proof PVC planks (no paint required)',
    needsPainting: false,
    warrantyYears: 10,
    bestFor: 'Balconies, bathrooms, kitchens, and coastal damp-prone ceilings'
  },
  {
    id: 'wpc_wooden_louvers',
    name: 'WPC / Charcoal Fluted Wooden Louvers',
    category: 'wooden',
    baseRateSqFt: 260,
    description: 'High-density acoustic polymer Wood-Plastic Composite fluted rafters with natural timber veneer',
    needsPainting: false,
    warrantyYears: 15,
    bestFor: 'Luxury dining spaces, master suites, TV backdrops, and foyer statements'
  },
  {
    id: 'armstrong_grid',
    name: 'Modular Acoustic Grid (2×2 ft Armstrong)',
    category: 'grid',
    baseRateSqFt: 75,
    description: 'Exposed T-Grid suspension with 595×595mm mineral fiber / vinyl-faced gypsum tiles',
    needsPainting: false,
    warrantyYears: 8,
    bestFor: 'Offices, clinics, server rooms, and commercial rental spaces'
  },
  {
    id: 'metal_baffle',
    name: 'Architectural Aluminium Linear Baffle',
    category: 'metal',
    baseRateSqFt: 380,
    description: 'Powder-coated architectural aluminium U-baffles with concealed carrier grid suspension',
    needsPainting: false,
    warrantyYears: 20,
    bestFor: 'Double-height foyers, modern villas, and luxury commercial reception areas'
  }
];

// Complexity Tiers & Vertical Drop Multipliers
const COMPLEXITY_TIERS: { id: ComplexityTier; name: string; fasciaMultiplier: number; laborMarkupPct: number; desc: string }[] = [
  {
    id: 'flat_single',
    name: 'Flat Single Level (Minimalist)',
    fasciaMultiplier: 1.0,
    laborMarkupPct: 0,
    desc: 'Single plane with flush perimeter shadow gap. Ideal for low ceiling heights (9–10 ft).'
  },
  {
    id: 'single_cove_tray',
    name: 'Single Cove Light Tray (4–6" Drop)',
    fasciaMultiplier: 1.20,
    laborMarkupPct: 15,
    desc: 'Perimeter dropped border with 3-inch recessed cove lip for indirect soft LED illumination.'
  },
  {
    id: 'floating_island',
    name: 'Double Floating Island Tray + Dual Cove',
    fasciaMultiplier: 1.35,
    laborMarkupPct: 30,
    desc: 'Two-tier ceiling with central floating island and dual perimeter + center LED glow.'
  },
  {
    id: 'custom_cnc_curves',
    name: 'Designer CNC Geometric / Curved Domes',
    fasciaMultiplier: 1.60,
    laborMarkupPct: 55,
    desc: 'Complex multi-level parametric profiles, circular coves, and acoustic geometric patterns.'
  }
];

export default function FalseCeilingCalculator() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'blueprint' | 'hardware' | 'boq'>('calculator');
  const [unit, setUnit] = useState<UnitType>('feet');
  const [wastagePct, setWastagePct] = useState<number>(8); // % buffer for board cutting
  const [contractorMarginPct, setContractorMarginPct] = useState<number>(10); // %
  const [includeGst, setIncludeGst] = useState<boolean>(true); // 18% GST

  // Electrical Rates
  const [coveLightRatePerFt, setCoveLightRatePerFt] = useState<number>(140); // ₹140/Rft (LED strip + alu profile + wiring)
  const [downlightPrice, setDownlightPrice] = useState<number>(380); // ₹380 per 9W/12W fixture + cutout + labor
  const [cobSpotPrice, setCobSpotPrice] = useState<number>(550); // ₹550 per COB focus spot
  const [magneticTrackRatePerFt, setMagneticTrackRatePerFt] = useState<number>(650); // ₹650/ft
  const [ceilingPaintRatePerSqFt, setCeilingPaintRatePerSqFt] = useState<number>(16); // ₹16/sq ft (2 coats plastic emulsion)

  // Visualizer interactive lighting switch
  const [isLightsOn, setIsLightsOn] = useState<boolean>(true);
  const [lightColorTemp, setLightColorTemp] = useState<LightColorTemp>('warm_white_3000k');

  // Saved quotes & UI feedback
  const [copied, setCopied] = useState<boolean>(false);
  const [savedQuotes, setSavedQuotes] = useState<SavedCeilingQuote[]>([]);
  const [quoteName, setQuoteName] = useState<string>('My Home False Ceiling');

  // Multi-Room State
  const [rooms, setRooms] = useState<RoomCeilingItem[]>([
    {
      id: 'room_1',
      name: 'Living & Dining Hall',
      length: 18,
      width: 14,
      systemId: 'gyproc_gypsum',
      complexity: 'floating_island',
      includeCoveLight: true,
      numDownlights: 8,
      numCobSpots: 4,
      includeMagneticTrack: false,
      magneticTrackLengthFt: 0,
      includeCeilingPaint: true,
      fanHookPoints: 2
    },
    {
      id: 'room_2',
      name: 'Master Bedroom',
      length: 14,
      width: 12,
      systemId: 'gyproc_gypsum',
      complexity: 'single_cove_tray',
      includeCoveLight: true,
      numDownlights: 6,
      numCobSpots: 2,
      includeMagneticTrack: false,
      magneticTrackLengthFt: 0,
      includeCeilingPaint: true,
      fanHookPoints: 1
    },
    {
      id: 'room_3',
      name: 'Balcony / Verandah',
      length: 12,
      width: 6,
      systemId: 'pvc_panels',
      complexity: 'flat_single',
      includeCoveLight: false,
      numDownlights: 3,
      numCobSpots: 0,
      includeMagneticTrack: false,
      magneticTrackLengthFt: 0,
      includeCeilingPaint: false,
      fanHookPoints: 1
    }
  ]);

  // Active Blueprint room
  const [blueprintRoomId, setBlueprintRoomId] = useState<string>('room_1');

  // Load saved quotes from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('toolique_false_ceiling_quotes');
      if (saved) {
        setSavedQuotes(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error reading false ceiling quotes:', e);
    }
  }, []);

  const handleSaveQuote = () => {
    const newQuote: SavedCeilingQuote = {
      id: Date.now().toString(),
      name: quoteName || 'False Ceiling Project',
      totalCost: projectSummary.finalGrandTotal,
      totalAreaSqFt: projectSummary.totalNetAreaSqFt,
      totalRooms: rooms.length,
      primarySystem: CEILING_SYSTEMS.find(s => s.id === rooms[0]?.systemId)?.name || 'Gyproc Gypsum',
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    };
    const updated = [newQuote, ...savedQuotes];
    setSavedQuotes(updated);
    localStorage.setItem('toolique_false_ceiling_quotes', JSON.stringify(updated));
    alert('Ceiling Estimate Saved Successfully!');
  };

  const handleDeleteQuote = (id: string) => {
    const updated = savedQuotes.filter(q => q.id !== id);
    setSavedQuotes(updated);
    localStorage.setItem('toolique_false_ceiling_quotes', JSON.stringify(updated));
  };

  // Add Room
  const handleAddRoom = () => {
    const newId = `room_${Date.now()}`;
    const newRoom: RoomCeilingItem = {
      id: newId,
      name: `Bedroom ${rooms.length}`,
      length: unit === 'feet' ? 12 : 3.6,
      width: unit === 'feet' ? 10 : 3.0,
      systemId: 'gyproc_gypsum',
      complexity: 'single_cove_tray',
      includeCoveLight: true,
      numDownlights: 4,
      numCobSpots: 2,
      includeMagneticTrack: false,
      magneticTrackLengthFt: 0,
      includeCeilingPaint: true,
      fanHookPoints: 1
    };
    setRooms([...rooms, newRoom]);
    setBlueprintRoomId(newId);
  };

  const handleRemoveRoom = (id: string) => {
    if (rooms.length <= 1) {
      alert('At least one room must be defined.');
      return;
    }
    const filtered = rooms.filter(r => r.id !== id);
    setRooms(filtered);
    if (blueprintRoomId === id) {
      setBlueprintRoomId(filtered[0].id);
    }
  };

  const handleUpdateRoom = <K extends keyof RoomCeilingItem>(id: string, key: K, value: RoomCeilingItem[K]) => {
    setRooms(rooms.map(r => (r.id === id ? { ...r, [key]: value } : r)));
  };

  const handleResetAll = () => {
    setUnit('feet');
    setWastagePct(8);
    setContractorMarginPct(10);
    setIncludeGst(true);
    setCoveLightRatePerFt(140);
    setDownlightPrice(380);
    setCobSpotPrice(550);
    setMagneticTrackRatePerFt(650);
    setCeilingPaintRatePerSqFt(16);
    setRooms([
      {
        id: 'room_1',
        name: 'Living & Dining Hall',
        length: 18,
        width: 14,
        systemId: 'gyproc_gypsum',
        complexity: 'floating_island',
        includeCoveLight: true,
        numDownlights: 8,
        numCobSpots: 4,
        includeMagneticTrack: false,
        magneticTrackLengthFt: 0,
        includeCeilingPaint: true,
        fanHookPoints: 2
      },
      {
        id: 'room_2',
        name: 'Master Bedroom',
        length: 14,
        width: 12,
        systemId: 'gyproc_gypsum',
        complexity: 'single_cove_tray',
        includeCoveLight: true,
        numDownlights: 6,
        numCobSpots: 2,
        includeMagneticTrack: false,
        magneticTrackLengthFt: 0,
        includeCeilingPaint: true,
        fanHookPoints: 1
      }
    ]);
  };

  // Detailed Room Math
  const roomCalculations = useMemo(() => {
    return rooms.map(room => {
      const lengthFt = unit === 'feet' ? room.length : room.length * 3.28084;
      const widthFt = unit === 'feet' ? room.width : room.width * 3.28084;

      const flatAreaSqFt = lengthFt * widthFt;
      const perimeterFt = 2 * (lengthFt + widthFt);

      const system = CEILING_SYSTEMS.find(s => s.id === room.systemId) || CEILING_SYSTEMS[0];
      const complexityConfig = COMPLEXITY_TIERS.find(c => c.id === room.complexity) || COMPLEXITY_TIERS[1];

      // Effective surface area accounting for vertical drop fascias
      const effectiveAreaSqFt = flatAreaSqFt * complexityConfig.fasciaMultiplier;

      // Cove lighting Rft
      let coveLengthRft = 0;
      if (room.includeCoveLight) {
        if (room.coveRunningLengthCustom) {
          coveLengthRft = room.coveRunningLengthCustom;
        } else if (room.complexity === 'single_cove_tray') {
          // Outer tray cove roughly perimeter - offset
          coveLengthRft = Math.max(0, perimeterFt - 8);
        } else if (room.complexity === 'floating_island') {
          // Perimeter cove + floating island perimeter
          coveLengthRft = Math.round(perimeterFt * 1.55);
        } else if (room.complexity === 'custom_cnc_curves') {
          coveLengthRft = Math.round(perimeterFt * 1.8);
        }
      }

      // Base ceiling material + framing cost
      const baseMaterialCost = effectiveAreaSqFt * system.baseRateSqFt;
      // Complexity labor markup
      const complexityMarkupCost = baseMaterialCost * (complexityConfig.laborMarkupPct / 100);
      // Wastage cost
      const wastageCost = (baseMaterialCost + complexityMarkupCost) * (wastagePct / 100);
      const totalCeilingCivilCost = Math.round(baseMaterialCost + complexityMarkupCost + wastageCost);

      // Electrical & Lighting Costs
      const coveLightCost = Math.round(coveLengthRft * coveLightRatePerFt);
      const smpsDriversCount = room.includeCoveLight ? Math.ceil(coveLengthRft / 50) : 0; // 1 driver per 50 Rft
      const smpsDriversCost = smpsDriversCount * 850;

      const downlightsCost = room.numDownlights * downlightPrice;
      const cobSpotsCost = room.numCobSpots * cobSpotPrice;
      const magneticTrackCost = room.includeMagneticTrack ? Math.round(room.magneticTrackLengthFt * magneticTrackRatePerFt) : 0;
      const fanHookCost = room.fanHookPoints * 450; // clamp + electrical wiring point

      const totalElectricalCost = coveLightCost + smpsDriversCost + downlightsCost + cobSpotsCost + magneticTrackCost + fanHookCost;

      // Painting Cost (if applicable)
      const paintCost = (system.needsPainting && room.includeCeilingPaint)
        ? Math.round(effectiveAreaSqFt * ceilingPaintRatePerSqFt)
        : 0;

      const roomTotalCost = totalCeilingCivilCost + totalElectricalCost + paintCost;

      return {
        ...room,
        lengthFt,
        widthFt,
        flatAreaSqFt: Number(flatAreaSqFt.toFixed(1)),
        perimeterFt: Number(perimeterFt.toFixed(1)),
        effectiveAreaSqFt: Number(effectiveAreaSqFt.toFixed(1)),
        coveLengthRft: Number(coveLengthRft.toFixed(1)),
        system,
        complexityConfig,
        baseMaterialCost: Math.round(baseMaterialCost),
        complexityMarkupCost: Math.round(complexityMarkupCost),
        wastageCost: Math.round(wastageCost),
        totalCeilingCivilCost,
        coveLightCost,
        smpsDriversCount,
        smpsDriversCost,
        downlightsCost,
        cobSpotsCost,
        magneticTrackCost,
        fanHookCost,
        totalElectricalCost,
        paintCost,
        roomTotalCost
      };
    });
  }, [
    rooms, unit, wastagePct, coveLightRatePerFt, downlightPrice, cobSpotPrice, 
    magneticTrackRatePerFt, ceilingPaintRatePerSqFt
  ]);

  // Overall Project Summary
  const projectSummary = useMemo(() => {
    const totalFlatAreaSqFt = roomCalculations.reduce((sum, r) => sum + r.flatAreaSqFt, 0);
    const totalNetAreaSqFt = roomCalculations.reduce((sum, r) => sum + r.effectiveAreaSqFt, 0);
    const totalCoveRft = roomCalculations.reduce((sum, r) => sum + r.coveLengthRft, 0);
    const totalDownlights = roomCalculations.reduce((sum, r) => sum + r.numDownlights, 0);
    const totalCobSpots = roomCalculations.reduce((sum, r) => sum + r.numCobSpots, 0);
    const totalSmpsDrivers = roomCalculations.reduce((sum, r) => sum + r.smpsDriversCount, 0);

    const totalCivilCeilingCost = roomCalculations.reduce((sum, r) => sum + r.totalCeilingCivilCost, 0);
    const totalElectricalCost = roomCalculations.reduce((sum, r) => sum + r.totalElectricalCost, 0);
    const totalPaintCost = roomCalculations.reduce((sum, r) => sum + r.paintCost, 0);

    const subTotal = totalCivilCeilingCost + totalElectricalCost + totalPaintCost;
    const contractorMargin = Math.round(subTotal * (contractorMarginPct / 100));
    const preTaxTotal = subTotal + contractorMargin;
    const gstAmount = includeGst ? Math.round(preTaxTotal * 0.18) : 0;
    const finalGrandTotal = preTaxTotal + gstAmount;

    // Hardware Bill of Materials (for standard 12.5mm Gypsum/POP frameworks)
    const gypsumArea = roomCalculations
      .filter(r => r.system.category === 'gypsum' || r.system.category === 'pop')
      .reduce((sum, r) => sum + r.effectiveAreaSqFt, 0);

    const gypsumBoardsCount = Math.ceil((gypsumArea / 24) * (1 + wastagePct / 100)); // 6x4 ft boards (24 sq ft)
    const perimeterChannelsCount = Math.ceil(roomCalculations.reduce((sum, r) => sum + r.perimeterFt, 0) / 12); // 12 ft length
    const ceilingSectionsCount = Math.ceil((gypsumArea / 12) * 1.1); // Spaced at 457mm c/c
    const intermediateChannelsCount = Math.ceil((gypsumArea / 36) * 1.1); // Spaced at 1220mm c/c
    const ceilingAnglesCount = Math.ceil((gypsumArea / 40) * 1.1);
    const drywallScrewsBox = Math.ceil(gypsumArea / 250); // 1 box per 250 sq ft
    const rawlPlugsPkt = Math.ceil(gypsumArea / 300);
    const jointCompoundBags = Math.ceil((gypsumArea * 0.25) / 25); // 25kg bags

    return {
      totalFlatAreaSqFt: Number(totalFlatAreaSqFt.toFixed(1)),
      totalNetAreaSqFt: Number(totalNetAreaSqFt.toFixed(1)),
      totalCoveRft: Number(totalCoveRft.toFixed(1)),
      totalDownlights,
      totalCobSpots,
      totalSmpsDrivers,
      totalCivilCeilingCost,
      totalElectricalCost,
      totalPaintCost,
      subTotal,
      contractorMargin,
      preTaxTotal,
      gstAmount,
      finalGrandTotal,
      // Hardware
      gypsumBoardsCount,
      perimeterChannelsCount,
      ceilingSectionsCount,
      intermediateChannelsCount,
      ceilingAnglesCount,
      drywallScrewsBox,
      rawlPlugsPkt,
      jointCompoundBags
    };
  }, [roomCalculations, contractorMarginPct, includeGst, wastagePct]);

  // Active Blueprint Room Object
  const activeBlueprintRoom = useMemo(() => {
    return roomCalculations.find(r => r.id === blueprintRoomId) || roomCalculations[0];
  }, [roomCalculations, blueprintRoomId]);

  // Copy Formatted Text Quote
  const handleCopyQuote = () => {
    const text = `========================================
TOOLIQUE ARCHITECTURAL FALSE CEILING BOQ
========================================
Project Name     : ${quoteName}
Total Rooms      : ${rooms.length} Room(s)
Total Carpet Area: ${projectSummary.totalFlatAreaSqFt} sq ft
Effective Fascia : ${projectSummary.totalNetAreaSqFt} sq ft
----------------------------------------
ROOM-BY-ROOM SPECIFICATIONS:
${roomCalculations.map((r, i) => `${i + 1}. ${r.name} (${r.length}x${r.width} ${unit === 'feet' ? 'ft' : 'm'} = ${r.flatAreaSqFt} sq ft)
   - System: ${r.system.name}
   - Design: ${r.complexityConfig.name}
   - Lighting: ${r.includeCoveLight ? `${r.coveLengthRft} Rft Cove` : 'No Cove'} | ${r.numDownlights} Downlights | ${r.numCobSpots} COB Spots
   - Room Total: ₹${r.roomTotalCost.toLocaleString('en-IN')}`).join('\n')}
----------------------------------------
ELECTRICAL & FIXTURE PROCUREMENT:
- LED Cove Strip Light : ${projectSummary.totalCoveRft} Running Feet (@ ₹${coveLightRatePerFt}/Rft)
- 12V/24V SMPS Drivers : ${projectSummary.totalSmpsDrivers} Units
- Recessed Downlights  : ${projectSummary.totalDownlights} Units (@ ₹${downlightPrice}/ea)
- COB Focus Spots      : ${projectSummary.totalCobSpots} Units (@ ₹${cobSpotPrice}/ea)
----------------------------------------
ITEMIZED COST SUMMARY (INR):
1. False Ceiling Civil & Framing  : ₹${projectSummary.totalCivilCeilingCost.toLocaleString('en-IN')}
2. Electrical Fixtures & Drivers  : ₹${projectSummary.totalElectricalCost.toLocaleString('en-IN')}
3. Ceiling Painting (2 Coats)     : ₹${projectSummary.totalPaintCost.toLocaleString('en-IN')}
   Materials & Labor Subtotal     : ₹${projectSummary.subTotal.toLocaleString('en-IN')}
4. Contractor Overhead & Margin   : ₹${projectSummary.contractorMargin.toLocaleString('en-IN')} (${contractorMarginPct}%)
${includeGst ? `5. GST @ 18%                      : ₹${projectSummary.gstAmount.toLocaleString('en-IN')}` : ''}
----------------------------------------
ESTIMATED GRAND TOTAL : ₹${projectSummary.finalGrandTotal.toLocaleString('en-IN')}
========================================
Generated via Toolique India (https://toolique.in)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export PDF BOQ
  const handleExportPdf = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header Banner
      doc.setFillColor(219, 39, 119); // Pink / Rose Accent
      doc.rect(0, 0, pageWidth, 28, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('FALSE CEILING & LIGHTING ESTIMATE', 14, 18);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on ${new Date().toLocaleDateString('en-IN')} | Toolique India`, pageWidth - 14, 18, { align: 'right' });

      // Project Info
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`Project: ${quoteName}`, 14, 38);
      doc.text(`Total Ceiling Area: ${projectSummary.totalNetAreaSqFt} sq ft | Rooms: ${rooms.length}`, 14, 44);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Cove Lighting: ${projectSummary.totalCoveRft} Rft | Total Downlights: ${projectSummary.totalDownlights} Nos`, 14, 50);

      // Section 1: Room Breakdown Table
      let yPos = 60;
      doc.setFillColor(243, 244, 246);
      doc.rect(14, yPos, pageWidth - 28, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('ROOM NAME', 18, yPos + 5);
      doc.text('SIZE & SYSTEM', 65, yPos + 5);
      doc.text('DESIGN TIER', 120, yPos + 5);
      doc.text('LIGHTS', 155, yPos + 5);
      doc.text('AMOUNT', 180, yPos + 5);
      yPos += 12;

      doc.setFont('helvetica', 'normal');
      roomCalculations.forEach((r, idx) => {
        if (idx % 2 === 1) {
          doc.setFillColor(249, 250, 251);
          doc.rect(14, yPos - 4, pageWidth - 28, 7, 'F');
        }
        doc.text(r.name, 18, yPos);
        doc.text(`${r.length}x${r.width} ${unit === 'feet' ? 'ft' : 'm'} (${r.system.category.toUpperCase()})`, 65, yPos);
        doc.text(r.complexityConfig.name.split(' ')[0], 120, yPos);
        doc.text(`${r.numDownlights}D + ${r.numCobSpots}S`, 155, yPos);
        doc.text(`₹${r.roomTotalCost.toLocaleString('en-IN')}`, 180, yPos);
        yPos += 7;
      });

      // Section 2: Hardware Procurement
      yPos += 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Key Structural GI Framework & Electrical Quantities', 14, yPos);
      yPos += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`• Gypsum Boards (12.5mm, 6x4 ft): ${projectSummary.gypsumBoardsCount} Sheets`, 18, yPos);
      yPos += 5;
      doc.text(`• GI Perimeter Channels (12 ft): ${projectSummary.perimeterChannelsCount} Nos | Ceiling Sections (12 ft): ${projectSummary.ceilingSectionsCount} Nos`, 18, yPos);
      yPos += 5;
      doc.text(`• Intermediate Channels: ${projectSummary.intermediateChannelsCount} Nos | Ceiling Angles: ${projectSummary.ceilingAnglesCount} Nos`, 18, yPos);
      yPos += 5;
      doc.text(`• LED Cove Lighting Strips: ${projectSummary.totalCoveRft} Rft | 12V SMPS Power Drivers: ${projectSummary.totalSmpsDrivers} Units`, 18, yPos);
      yPos += 5;
      doc.text(`• Recessed LED Downlights: ${projectSummary.totalDownlights} Nos | COB Focus Spots: ${projectSummary.totalCobSpots} Nos`, 18, yPos);

      // Section 3: Cost BOQ Table
      yPos += 10;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Itemized Cost Estimate (BOQ)', 14, yPos);
      yPos += 6;

      doc.setFillColor(243, 244, 246);
      doc.rect(14, yPos, pageWidth - 28, 7, 'F');
      doc.setFontSize(9);
      doc.text('ITEM DESCRIPTION', 18, yPos + 5);
      doc.text('QUANTITY', 110, yPos + 5);
      doc.text('SUBTOTAL (INR)', 165, yPos + 5);
      yPos += 12;

      const boqRows = [
        { desc: 'False Ceiling Boarding, GI Channels & Framing', qty: `${projectSummary.totalNetAreaSqFt} sq ft`, total: `₹${projectSummary.totalCivilCeilingCost.toLocaleString('en-IN')}` },
        { desc: 'Electrical Fixtures (LED Cove, Downlights, COB Spots, SMPS)', qty: 'Lump sum', total: `₹${projectSummary.totalElectricalCost.toLocaleString('en-IN')}` },
        { desc: 'Ceiling Surface Painting (Primer + 2 Coats Emulsion)', qty: `${projectSummary.totalNetAreaSqFt} sq ft`, total: `₹${projectSummary.totalPaintCost.toLocaleString('en-IN')}` },
        { desc: `Contractor Supervision & Overhead Margin (${contractorMarginPct}%)`, qty: '-', total: `₹${projectSummary.contractorMargin.toLocaleString('en-IN')}` },
      ];

      if (includeGst) {
        boqRows.push({ desc: 'GST @ 18% on Goods & Services', qty: '18%', total: `₹${projectSummary.gstAmount.toLocaleString('en-IN')}` });
      }

      doc.setFont('helvetica', 'normal');
      boqRows.forEach((row, i) => {
        if (i % 2 === 1) {
          doc.setFillColor(249, 250, 251);
          doc.rect(14, yPos - 4, pageWidth - 28, 6, 'F');
        }
        doc.text(row.desc, 18, yPos);
        doc.text(row.qty, 110, yPos);
        doc.text(row.total, 165, yPos);
        yPos += 6;
      });

      // Total Callout
      yPos += 4;
      doc.setFillColor(219, 39, 119);
      doc.rect(14, yPos, pageWidth - 28, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('ESTIMATED GRAND TOTAL (ALL INCLUSIVE):', 18, yPos + 7);
      doc.text(`INR ${projectSummary.finalGrandTotal.toLocaleString('en-IN')}`, pageWidth - 18, yPos + 7, { align: 'right' });

      doc.save(`False_Ceiling_Estimate_${quoteName.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
      alert('Unable to generate PDF. Please use the Copy Quote button.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-left">
      {/* Top Header & View Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400">
              <Palette className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                Architectural False Ceiling & Lighting Design Studio
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Gyproc Gypsum, POP, PVC, WPC Louvers, structural GI framework BOQ, and 2D lighting blueprint
              </p>
            </div>
          </div>
        </div>

        {/* Action Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'calculator'
                ? 'bg-white dark:bg-zinc-700 text-pink-600 dark:text-pink-400 shadow-xs font-bold'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Room Planner</span>
          </button>
          <button
            onClick={() => setActiveTab('blueprint')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'blueprint'
                ? 'bg-white dark:bg-zinc-700 text-pink-600 dark:text-pink-400 shadow-xs font-bold'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>2D Blueprint</span>
          </button>
          <button
            onClick={() => setActiveTab('hardware')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'hardware'
                ? 'bg-white dark:bg-zinc-700 text-pink-600 dark:text-pink-400 shadow-xs font-bold'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>GI Hardware BOQ</span>
          </button>
          <button
            onClick={() => setActiveTab('boq')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'boq'
                ? 'bg-white dark:bg-zinc-700 text-pink-600 dark:text-pink-400 shadow-xs font-bold'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Contractor BOQ</span>
          </button>
        </div>
      </div>

      {/* TAB 1: CALCULATOR & ROOM PLANNER */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Inputs Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Global Settings Card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                  Global Project Parameters
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex rounded-lg bg-zinc-100 dark:bg-zinc-800 p-0.5 text-xs font-semibold">
                    <button
                      onClick={() => setUnit('feet')}
                      className={`px-2.5 py-1 rounded-md transition ${unit === 'feet' ? 'bg-white dark:bg-zinc-700 text-pink-600 dark:text-pink-400 shadow-xs' : 'text-zinc-500'}`}
                    >
                      Feet (ft)
                    </button>
                    <button
                      onClick={() => setUnit('meters')}
                      className={`px-2.5 py-1 rounded-md transition ${unit === 'meters' ? 'bg-white dark:bg-zinc-700 text-pink-600 dark:text-pink-400 shadow-xs' : 'text-zinc-500'}`}
                    >
                      Meters (m)
                    </button>
                  </div>
                  <button
                    onClick={handleResetAll}
                    title="Reset All Parameters"
                    className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200 transition"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Rates Settings Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                    Cove Light (₹/Rft)
                  </label>
                  <input
                    type="number"
                    value={coveLightRatePerFt}
                    onChange={(e) => setCoveLightRatePerFt(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="saas-input py-1.5 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                    Downlight (₹/pc)
                  </label>
                  <input
                    type="number"
                    value={downlightPrice}
                    onChange={(e) => setDownlightPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="saas-input py-1.5 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                    COB Spot (₹/pc)
                  </label>
                  <input
                    type="number"
                    value={cobSpotPrice}
                    onChange={(e) => setCobSpotPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="saas-input py-1.5 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                    Cutting Wastage
                  </label>
                  <select
                    value={wastagePct}
                    onChange={(e) => setWastagePct(parseInt(e.target.value) || 5)}
                    className="saas-select w-full text-xs py-1.5 font-semibold"
                  >
                    <option value={5}>5% Buffer</option>
                    <option value={8}>8% (Standard)</option>
                    <option value={12}>12% Curved</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Room-by-Room False Ceiling Manager */}
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div>
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider block">
                    Room-by-Room Ceiling Layouts ({rooms.length})
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Customize ceiling system, complexity tier, and light fixtures for every room
                  </span>
                </div>
                <button
                  onClick={handleAddRoom}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 dark:bg-pink-950/50 dark:hover:bg-pink-900 text-pink-700 dark:text-pink-300 text-xs font-bold transition shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Room</span>
                </button>
              </div>

              {/* Rooms List */}
              <div className="space-y-4">
                {rooms.map((room, index) => {
                  const roomCalc = roomCalculations.find(r => r.id === room.id);
                  return (
                    <div
                      key={room.id}
                      className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/70 dark:border-zinc-800/80 space-y-3.5"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-pink-600 text-white flex items-center justify-center text-[10px] font-bold">
                            {index + 1}
                          </span>
                          <input
                            type="text"
                            value={room.name}
                            onChange={(e) => handleUpdateRoom(room.id, 'name', e.target.value)}
                            className="font-bold text-xs bg-transparent border-b border-dashed border-zinc-300 dark:border-zinc-700 focus:border-pink-500 focus:outline-hidden text-zinc-900 dark:text-white"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-bold text-pink-600 dark:text-pink-400">
                            ₹{roomCalc?.roomTotalCost.toLocaleString('en-IN')}
                          </span>
                          {rooms.length > 1 && (
                            <button
                              onClick={() => handleRemoveRoom(room.id)}
                              className="p-1 rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                              title="Delete Room"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Dimension Inputs */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <div>
                          <label className="block text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                            Length ({unit === 'feet' ? 'ft' : 'm'})
                          </label>
                          <input
                            type="number"
                            value={room.length || ''}
                            onChange={(e) => handleUpdateRoom(room.id, 'length', Math.max(0, parseFloat(e.target.value) || 0))}
                            className="saas-input py-1.5 text-xs font-mono font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                            Width ({unit === 'feet' ? 'ft' : 'm'})
                          </label>
                          <input
                            type="number"
                            value={room.width || ''}
                            onChange={(e) => handleUpdateRoom(room.id, 'width', Math.max(0, parseFloat(e.target.value) || 0))}
                            className="saas-input py-1.5 text-xs font-mono font-semibold"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                            Ceiling Material System
                          </label>
                          <select
                            value={room.systemId}
                            onChange={(e) => handleUpdateRoom(room.id, 'systemId', e.target.value)}
                            className="saas-select w-full py-1.5 text-xs font-semibold"
                          >
                            {CEILING_SYSTEMS.map(sys => (
                              <option key={sys.id} value={sys.id}>
                                {sys.name} (₹{sys.baseRateSqFt}/sq ft)
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Complexity & Cove Light Controls */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        <div>
                          <label className="block text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                            Ceiling Design Complexity
                          </label>
                          <select
                            value={room.complexity}
                            onChange={(e) => handleUpdateRoom(room.id, 'complexity', e.target.value as ComplexityTier)}
                            className="saas-select w-full py-1.5 text-xs font-semibold"
                          >
                            {COMPLEXITY_TIERS.map(tier => (
                              <option key={tier.id} value={tier.id}>
                                {tier.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Cove Lighting Toggle */}
                        <div className="flex items-center gap-3 pt-4">
                          <label className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={room.includeCoveLight}
                              onChange={(e) => handleUpdateRoom(room.id, 'includeCoveLight', e.target.checked)}
                              className="w-3.5 h-3.5 rounded text-pink-600 focus:ring-pink-500"
                            />
                            <span>LED Cove Light ({roomCalc?.coveLengthRft || 0} Rft)</span>
                          </label>
                        </div>
                      </div>

                      {/* Fixtures & Downlights */}
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 pt-1 border-t border-zinc-200/50 dark:border-zinc-800">
                        <div>
                          <label className="block text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                            Downlights (6W/12W)
                          </label>
                          <input
                            type="number"
                            value={room.numDownlights}
                            onChange={(e) => handleUpdateRoom(room.id, 'numDownlights', Math.max(0, parseInt(e.target.value) || 0))}
                            className="saas-input py-1 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                            COB Spots (7W/15W)
                          </label>
                          <input
                            type="number"
                            value={room.numCobSpots}
                            onChange={(e) => handleUpdateRoom(room.id, 'numCobSpots', Math.max(0, parseInt(e.target.value) || 0))}
                            className="saas-input py-1 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                            Fan Hooks / Boxes
                          </label>
                          <input
                            type="number"
                            value={room.fanHookPoints}
                            onChange={(e) => handleUpdateRoom(room.id, 'fanHookPoints', Math.max(0, parseInt(e.target.value) || 0))}
                            className="saas-input py-1 text-xs font-mono"
                          />
                        </div>
                        <div className="flex flex-col justify-end">
                          <label className="flex items-center gap-1.5 text-[10px] font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer select-none pb-1.5">
                            <input
                              type="checkbox"
                              checked={room.includeCeilingPaint}
                              onChange={(e) => handleUpdateRoom(room.id, 'includeCeilingPaint', e.target.checked)}
                              className="w-3.5 h-3.5 rounded text-pink-600 focus:ring-pink-500"
                            />
                            <span>2-Coat Paint</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Summary & BOQ Highlights Column */}
          <div className="lg:col-span-5 space-y-6">
            {/* Grand Total Budget Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-5">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
                  False Ceiling Budget
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleCopyQuote}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold transition shadow-xs"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Clipboard className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Quote'}</span>
                  </button>
                  <button
                    onClick={handleExportPdf}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold transition"
                    title="Export PDF Estimate"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Big Price Display */}
              <div>
                <div className="text-3xl font-black text-pink-600 dark:text-pink-400 font-mono tracking-tight">
                  ₹{projectSummary.finalGrandTotal.toLocaleString('en-IN')}
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>Carpet Area: <strong className="text-zinc-800 dark:text-zinc-200">{projectSummary.totalFlatAreaSqFt} sq ft</strong></span>
                  <span>•</span>
                  <span>₹{(projectSummary.finalGrandTotal / (projectSummary.totalFlatAreaSqFt || 1)).toFixed(1)}/sq ft all-in</span>
                </div>
              </div>

              {/* Key Scope Highlights */}
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800 space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-600 dark:text-zinc-400 font-medium">Effective Fascia Area:</span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-white">
                    {projectSummary.totalNetAreaSqFt} sq ft
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-600 dark:text-zinc-400 font-medium">LED Cove Light Length:</span>
                  <span className="font-mono font-bold text-pink-600 dark:text-pink-400">
                    {projectSummary.totalCoveRft} Running Feet
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-600 dark:text-zinc-400 font-medium">Downlights & Spots Count:</span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-white">
                    {projectSummary.totalDownlights} Downlights + {projectSummary.totalCobSpots} Spots
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-600 dark:text-zinc-400 font-medium">12V Power SMPS Drivers:</span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-white">
                    {projectSummary.totalSmpsDrivers} Units (150W ea)
                  </span>
                </div>
              </div>

              {/* Subtotal Split */}
              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 space-y-2 text-xs">
                <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
                  <span>Ceiling Boarding & Framing</span>
                  <span className="font-mono font-semibold text-zinc-900 dark:text-white">
                    ₹{projectSummary.totalCivilCeilingCost.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
                  <span>Electrical Cove & Light Fixtures</span>
                  <span className="font-mono font-semibold text-zinc-900 dark:text-white">
                    ₹{projectSummary.totalElectricalCost.toLocaleString('en-IN')}
                  </span>
                </div>
                {projectSummary.totalPaintCost > 0 && (
                  <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
                    <span>Ceiling Emulsion Painting</span>
                    <span className="font-mono font-semibold text-zinc-900 dark:text-white">
                      ₹{projectSummary.totalPaintCost.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
                  <span>Contractor Margin ({contractorMarginPct}%)</span>
                  <span className="font-mono font-semibold text-zinc-900 dark:text-white">
                    ₹{projectSummary.contractorMargin.toLocaleString('en-IN')}
                  </span>
                </div>
                {includeGst && (
                  <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
                    <span>GST (18% Goods & Services)</span>
                    <span className="font-mono font-semibold text-zinc-900 dark:text-white">
                      ₹{projectSummary.gstAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
              </div>

              {/* Save Quote Box */}
              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 flex gap-2">
                <input
                  type="text"
                  value={quoteName}
                  onChange={(e) => setQuoteName(e.target.value)}
                  placeholder="Project / Client Name"
                  className="saas-input py-1.5 text-xs flex-1"
                />
                <button
                  onClick={handleSaveQuote}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold transition shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>
            </div>

            {/* Saved Estimates Tray */}
            {savedQuotes.length > 0 && (
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-3">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider block">
                  Saved Project Estimates ({savedQuotes.length})
                </span>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {savedQuotes.map(quote => (
                    <div
                      key={quote.id}
                      className="flex justify-between items-center p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800 text-xs"
                    >
                      <div>
                        <div className="font-bold text-zinc-900 dark:text-white">{quote.name}</div>
                        <div className="text-[10px] text-zinc-500">
                          {quote.totalAreaSqFt} sq ft • {quote.totalRooms} Rooms • {quote.date}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-pink-600 dark:text-pink-400">
                          ₹{quote.totalCost.toLocaleString('en-IN')}
                        </span>
                        <button
                          onClick={() => handleDeleteQuote(quote.id)}
                          className="p-1 rounded-md text-zinc-400 hover:text-red-500 transition"
                          title="Delete Quote"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: 2D CEILING LIGHTING BLUEPRINT */}
      {activeTab === 'blueprint' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                2D Ceiling Lighting & Step Tray Blueprint
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Architectural ceiling reflection plan showing cove ribbons, downlights, and fan points
              </p>
            </div>

            {/* Room Selector & Light Glow Switch */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-500">Room:</span>
                <select
                  value={blueprintRoomId}
                  onChange={(e) => setBlueprintRoomId(e.target.value)}
                  className="saas-select text-xs font-semibold py-1.5"
                >
                  {roomCalculations.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.length}x{r.width} {unit === 'feet' ? 'ft' : 'm'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Lighting Switch */}
              <button
                onClick={() => setIsLightsOn(!isLightsOn)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition shadow-xs ${
                  isLightsOn
                    ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                    : 'border-zinc-300 dark:border-zinc-700 text-zinc-500'
                }`}
              >
                <Lightbulb className={`w-3.5 h-3.5 ${isLightsOn ? 'fill-amber-400 text-amber-500' : ''}`} />
                <span>Lights {isLightsOn ? 'ON' : 'OFF'}</span>
              </button>

              {/* Color Temperature Selector */}
              {isLightsOn && (
                <div className="flex items-center gap-1 text-[11px]">
                  <button
                    onClick={() => setLightColorTemp('warm_white_3000k')}
                    className={`px-2 py-1 rounded-md border ${lightColorTemp === 'warm_white_3000k' ? 'border-amber-500 bg-amber-100 dark:bg-amber-900/50 font-bold' : 'border-zinc-200'}`}
                  >
                    3000K (Warm)
                  </button>
                  <button
                    onClick={() => setLightColorTemp('neutral_4000k')}
                    className={`px-2 py-1 rounded-md border ${lightColorTemp === 'neutral_4000k' ? 'border-amber-500 bg-amber-100 dark:bg-amber-900/50 font-bold' : 'border-zinc-200'}`}
                  >
                    4000K (Neutral)
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* SVG Ceiling Blueprint Canvas */}
          <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-100 flex flex-col items-center justify-center overflow-x-auto select-none">
            <svg
              viewBox="0 0 700 450"
              className="w-full max-w-[650px] h-80"
            >
              {/* Outer Room Boundary */}
              <rect
                x="40"
                y="30"
                width="620"
                height="390"
                fill="#0F172A"
                stroke="#334155"
                strokeWidth="3"
                rx="8"
              />

              {/* Dimension Labels */}
              <text x="350" y="22" textAnchor="middle" fill="#94A3B8" fontSize="11" fontWeight="bold">
                Room Length: {activeBlueprintRoom.length} {unit === 'feet' ? 'ft' : 'm'}
              </text>
              <text x="18" y="230" textAnchor="middle" fill="#94A3B8" fontSize="11" fontWeight="bold" transform="rotate(-90 18 230)">
                Width: {activeBlueprintRoom.width} {unit === 'feet' ? 'ft' : 'm'}
              </text>

              {/* Perimeter Drop Band (Fascia) */}
              <rect
                x="60"
                y="50"
                width="580"
                height="350"
                fill="#1E293B"
                stroke="#475569"
                strokeWidth="2"
                strokeDasharray="4 2"
                rx="6"
              />

              {/* Cove Light Ribbon (Glow Effect) */}
              {activeBlueprintRoom.includeCoveLight && (
                <rect
                  x="75"
                  y="65"
                  width="550"
                  height="320"
                  fill="none"
                  stroke={
                    isLightsOn 
                      ? (lightColorTemp === 'warm_white_3000k' ? '#FBBF24' : '#FDE047') 
                      : '#475569'
                  }
                  strokeWidth={isLightsOn ? 4 : 1.5}
                  filter={isLightsOn ? 'drop-shadow(0px 0px 8px #F59E0B)' : 'none'}
                  rx="4"
                />
              )}

              {/* Central Recessed Tray */}
              <rect
                x="90"
                y="80"
                width="520"
                height="290"
                fill="#0F172A"
                stroke="#334155"
                strokeWidth="1.5"
                rx="4"
              />

              {/* Floating Island if complexity is floating_island */}
              {activeBlueprintRoom.complexity === 'floating_island' && (
                <g>
                  <rect
                    x="210"
                    y="145"
                    width="280"
                    height="160"
                    fill="#1E293B"
                    stroke="#475569"
                    strokeWidth="2"
                    rx="4"
                  />
                  {activeBlueprintRoom.includeCoveLight && isLightsOn && (
                    <rect
                      x="210"
                      y="145"
                      width="280"
                      height="160"
                      fill="none"
                      stroke="#FBBF24"
                      strokeWidth="3"
                      filter="drop-shadow(0px 0px 6px #F59E0B)"
                      rx="4"
                    />
                  )}
                  <text x="350" y="230" textAnchor="middle" fill="#CBD5E1" fontSize="10" fontWeight="bold">
                    Floating Center Island
                  </text>
                </g>
              )}

              {/* Recessed Downlights Array */}
              {[
                { cx: 140, cy: 115 },
                { cx: 350, cy: 115 },
                { cx: 560, cy: 115 },
                { cx: 140, cy: 225 },
                { cx: 560, cy: 225 },
                { cx: 140, cy: 335 },
                { cx: 350, cy: 335 },
                { cx: 560, cy: 335 },
              ].slice(0, Math.min(8, activeBlueprintRoom.numDownlights)).map((pt, i) => (
                <g key={`dl_${i}`}>
                  <circle
                    cx={pt.cx}
                    cy={pt.cy}
                    r={isLightsOn ? 8 : 6}
                    fill={isLightsOn ? '#FEF08A' : '#64748B'}
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    filter={isLightsOn ? 'drop-shadow(0px 0px 7px #FACC15)' : 'none'}
                  />
                  <text x={pt.cx} y={pt.cy + 18} textAnchor="middle" fill="#94A3B8" fontSize="8">
                    DL {i + 1}
                  </text>
                </g>
              ))}

              {/* COB Accent Focus Spots if any */}
              {activeBlueprintRoom.numCobSpots > 0 && [
                { cx: 200, cy: 72 },
                { cx: 500, cy: 72 },
                { cx: 200, cy: 378 },
                { cx: 500, cy: 378 }
              ].slice(0, activeBlueprintRoom.numCobSpots).map((pt, i) => (
                <g key={`cob_${i}`}>
                  <polygon
                    points={`${pt.cx},${pt.cy - 5} ${pt.cx + 5},${pt.cy + 5} ${pt.cx - 5},${pt.cy + 5}`}
                    fill={isLightsOn ? '#38BDF8' : '#64748B'}
                    stroke="#FFFFFF"
                    strokeWidth="1"
                    filter={isLightsOn ? 'drop-shadow(0px 0px 6px #0284C7)' : 'none'}
                  />
                  <text x={pt.cx} y={pt.cy - 8} textAnchor="middle" fill="#38BDF8" fontSize="7" fontWeight="bold">
                    COB {i + 1}
                  </text>
                </g>
              ))}

              {/* Center Fan / Chandelier Point */}
              {activeBlueprintRoom.fanHookPoints > 0 && (
                <g transform="translate(350, 225)">
                  <circle cx="0" cy="0" r="16" fill="none" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="3 3" />
                  <line x1="-10" y1="0" x2="10" y2="0" stroke="#E2E8F0" strokeWidth="2" />
                  <line x1="0" y1="-10" x2="0" y2="10" stroke="#E2E8F0" strokeWidth="2" />
                  <text x="0" y="28" textAnchor="middle" fill="#CBD5E1" fontSize="9" fontWeight="bold">
                    Fan / Chandelier Hook
                  </text>
                </g>
              )}
            </svg>
          </div>

          {/* Blueprint Legend */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
              <span className="w-3.5 h-3.5 rounded-full bg-amber-400 shadow-xs" />
              <div>
                <strong className="block text-zinc-900 dark:text-white">LED Cove Light</strong>
                <span className="text-[10px] text-zinc-500">{activeBlueprintRoom.coveLengthRft} Running Feet</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
              <span className="w-3.5 h-3.5 rounded-full bg-yellow-200 border border-zinc-400" />
              <div>
                <strong className="block text-zinc-900 dark:text-white">Recessed Downlights</strong>
                <span className="text-[10px] text-zinc-500">{activeBlueprintRoom.numDownlights} Nos (9W Ambient)</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
              <span className="w-3.5 h-3.5 rounded-sm bg-sky-400" />
              <div>
                <strong className="block text-zinc-900 dark:text-white">COB Wall Spotlights</strong>
                <span className="text-[10px] text-zinc-500">{activeBlueprintRoom.numCobSpots} Nos (Wall Grazing)</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
              <span className="w-3.5 h-3.5 rounded-full border-2 border-dashed border-zinc-500" />
              <div>
                <strong className="block text-zinc-900 dark:text-white">Fan / Chandelier Point</strong>
                <span className="text-[10px] text-zinc-500">{activeBlueprintRoom.fanHookPoints} Concealed Hook(s)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GI HARDWARE & BILL OF MATERIALS */}
      {activeTab === 'hardware' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-6">
          <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              Structural GI Framework & Hardware Bill of Materials (BOM)
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Calculated for IS 2095 Gyproc/POP steel grid framing (0.5mm Ultra-steel channels & suspension hardware)
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/70 dark:border-zinc-800">
              <span className="text-zinc-400 block text-[10px] uppercase font-bold">Gypsum Boards (12.5mm)</span>
              <div className="text-xl font-black text-pink-600 dark:text-pink-400 font-mono mt-1">
                {projectSummary.gypsumBoardsCount}
              </div>
              <span className="text-[10px] text-zinc-500">6ft x 4ft (24 sq ft) sheets</span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/70 dark:border-zinc-800">
              <span className="text-zinc-400 block text-[10px] uppercase font-bold">Perimeter Channels</span>
              <div className="text-xl font-black text-pink-600 dark:text-pink-400 font-mono mt-1">
                {projectSummary.perimeterChannelsCount}
              </div>
              <span className="text-[10px] text-zinc-500">12 ft lengths (0.5mm GI)</span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/70 dark:border-zinc-800">
              <span className="text-zinc-400 block text-[10px] uppercase font-bold">Ceiling Sections</span>
              <div className="text-xl font-black text-pink-600 dark:text-pink-400 font-mono mt-1">
                {projectSummary.ceilingSectionsCount}
              </div>
              <span className="text-[10px] text-zinc-500">Spaced 457mm c/c</span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/70 dark:border-zinc-800">
              <span className="text-zinc-400 block text-[10px] uppercase font-bold">Intermediate Channels</span>
              <div className="text-xl font-black text-pink-600 dark:text-pink-400 font-mono mt-1">
                {projectSummary.intermediateChannelsCount}
              </div>
              <span className="text-[10px] text-zinc-500">Spaced 1220mm c/c (0.9mm)</span>
            </div>
          </div>

          {/* Consumables List */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 text-zinc-600 dark:text-zinc-300 font-bold uppercase text-[10px]">
                  <th className="p-3">Component / Material</th>
                  <th className="p-3">Standard Specification</th>
                  <th className="p-3 text-right">Required Quantity</th>
                  <th className="p-3">Primary Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-mono">
                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="p-3 font-sans font-semibold text-zinc-900 dark:text-white">Ceiling Angles</td>
                  <td className="p-3 font-sans text-zinc-500">25×10×0.5 mm (12 ft)</td>
                  <td className="p-3 text-right text-zinc-900 dark:text-white font-bold">{projectSummary.ceilingAnglesCount} Pcs</td>
                  <td className="p-3 font-sans text-zinc-500">Vertical soffit suspension from slab</td>
                </tr>
                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="p-3 font-sans font-semibold text-zinc-900 dark:text-white">Drywall Screws (25mm & 35mm)</td>
                  <td className="p-3 font-sans text-zinc-500">Black Phosphate Coated</td>
                  <td className="p-3 text-right text-zinc-900 dark:text-white font-bold">{projectSummary.drywallScrewsBox} Box(es)</td>
                  <td className="p-3 font-sans text-zinc-500">Fastening board to steel channels</td>
                </tr>
                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="p-3 font-sans font-semibold text-zinc-900 dark:text-white">Soffit Rawl Plugs & Bolts</td>
                  <td className="p-3 font-sans text-zinc-500">8mm Heavy Duty Metal</td>
                  <td className="p-3 text-right text-zinc-900 dark:text-white font-bold">{projectSummary.rawlPlugsPkt} Pkt(s)</td>
                  <td className="p-3 font-sans text-zinc-500">Concrete slab anchor fixing</td>
                </tr>
                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="p-3 font-sans font-semibold text-zinc-900 dark:text-white">Jointing Compound & Paper Tape</td>
                  <td className="p-3 font-sans text-zinc-500">Gyproc ProMix Plus (25kg)</td>
                  <td className="p-3 text-right text-zinc-900 dark:text-white font-bold">{projectSummary.jointCompoundBags} Bag(s)</td>
                  <td className="p-3 font-sans text-zinc-500">Seamless joint finishing without cracks</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ITEMIZED CONTRACTOR BOQ */}
      {activeTab === 'boq' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-6">
          <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Contractor False Ceiling Bill of Quantities (BOQ)
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Detailed procurement sheet with material specifications, lighting, labor, and taxes
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyQuote}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold transition shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Clipboard className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Quote'}</span>
              </button>
              <button
                onClick={handleExportPdf}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>

          {/* BOQ Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 text-zinc-600 dark:text-zinc-300 font-bold uppercase text-[10px]">
                  <th className="p-3">#</th>
                  <th className="p-3">Description of Work / Material Item</th>
                  <th className="p-3 text-right">Quantity / Unit</th>
                  <th className="p-3 text-right">Unit Rate (INR)</th>
                  <th className="p-3 text-right font-bold">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-mono">
                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="p-3 font-sans text-zinc-400">01</td>
                  <td className="p-3 font-sans font-semibold text-zinc-900 dark:text-white">
                    False Ceiling Boarding, GI Ultra-Steel Framing & Step Levels
                    <span className="block text-[10px] text-zinc-400 font-mono">Perimeter channels, ceiling sections, rawl plugs & fasteners</span>
                  </td>
                  <td className="p-3 text-right text-zinc-700 dark:text-zinc-300">{projectSummary.totalNetAreaSqFt} sq ft</td>
                  <td className="p-3 text-right text-zinc-700 dark:text-zinc-300">₹{(projectSummary.totalCivilCeilingCost / (projectSummary.totalNetAreaSqFt || 1)).toFixed(1)}/sq ft</td>
                  <td className="p-3 text-right font-bold text-zinc-900 dark:text-white">₹{projectSummary.totalCivilCeilingCost.toLocaleString('en-IN')}</td>
                </tr>

                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="p-3 font-sans text-zinc-400">02</td>
                  <td className="p-3 font-sans font-semibold text-zinc-900 dark:text-white">
                    LED Strip Cove Lighting (240 LEDs/m + Alu Profile Diffusers)
                    <span className="block text-[10px] text-zinc-400 font-mono">Continuous perimeter and island soft indirect lighting</span>
                  </td>
                  <td className="p-3 text-right text-zinc-700 dark:text-zinc-300">{projectSummary.totalCoveRft} Rft</td>
                  <td className="p-3 text-right text-zinc-700 dark:text-zinc-300">₹{coveLightRatePerFt}/Rft</td>
                  <td className="p-3 text-right font-bold text-zinc-900 dark:text-white">₹{Math.round(projectSummary.totalCoveRft * coveLightRatePerFt).toLocaleString('en-IN')}</td>
                </tr>

                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="p-3 font-sans text-zinc-400">03</td>
                  <td className="p-3 font-sans font-semibold text-zinc-900 dark:text-white">
                    12V/24V SMPS Constant Voltage LED Power Drivers
                  </td>
                  <td className="p-3 text-right text-zinc-700 dark:text-zinc-300">{projectSummary.totalSmpsDrivers} Units</td>
                  <td className="p-3 text-right text-zinc-700 dark:text-zinc-300">₹850/ea</td>
                  <td className="p-3 text-right font-bold text-zinc-900 dark:text-white">₹{(projectSummary.totalSmpsDrivers * 850).toLocaleString('en-IN')}</td>
                </tr>

                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="p-3 font-sans text-zinc-400">04</td>
                  <td className="p-3 font-sans font-semibold text-zinc-900 dark:text-white">
                    Recessed LED Downlights (6W/12W) with Hole-Saw Cutout & Wiring
                  </td>
                  <td className="p-3 text-right text-zinc-700 dark:text-zinc-300">{projectSummary.totalDownlights} Nos</td>
                  <td className="p-3 text-right text-zinc-700 dark:text-zinc-300">₹{downlightPrice}/ea</td>
                  <td className="p-3 text-right font-bold text-zinc-900 dark:text-white">₹{(projectSummary.totalDownlights * downlightPrice).toLocaleString('en-IN')}</td>
                </tr>

                {projectSummary.totalCobSpots > 0 && (
                  <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                    <td className="p-3 font-sans text-zinc-400">05</td>
                    <td className="p-3 font-sans font-semibold text-zinc-900 dark:text-white">
                      COB Focus Accent Spotlights (7W/15W Wall Grazers)
                    </td>
                    <td className="p-3 text-right text-zinc-700 dark:text-zinc-300">{projectSummary.totalCobSpots} Nos</td>
                    <td className="p-3 text-right text-zinc-700 dark:text-zinc-300">₹{cobSpotPrice}/ea</td>
                    <td className="p-3 text-right font-bold text-zinc-900 dark:text-white">₹{(projectSummary.totalCobSpots * cobSpotPrice).toLocaleString('en-IN')}</td>
                  </tr>
                )}

                {projectSummary.totalPaintCost > 0 && (
                  <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                    <td className="p-3 font-sans text-zinc-400">06</td>
                    <td className="p-3 font-sans font-semibold text-zinc-900 dark:text-white">
                      Ceiling Painting (1 Coat Sealer Primer + 2 Coats Acrylic Emulsion)
                    </td>
                    <td className="p-3 text-right text-zinc-700 dark:text-zinc-300">{projectSummary.totalNetAreaSqFt} sq ft</td>
                    <td className="p-3 text-right text-zinc-700 dark:text-zinc-300">₹{ceilingPaintRatePerSqFt}/sq ft</td>
                    <td className="p-3 text-right font-bold text-zinc-900 dark:text-white">₹{projectSummary.totalPaintCost.toLocaleString('en-IN')}</td>
                  </tr>
                )}

                {/* Contractor Margin */}
                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="p-3 font-sans text-zinc-400">07</td>
                  <td className="p-3 font-sans font-semibold text-zinc-900 dark:text-white">
                    Contractor Supervision, Scaffolding & Margin ({contractorMarginPct}%)
                  </td>
                  <td className="p-3 text-right text-zinc-700 dark:text-zinc-300">-</td>
                  <td className="p-3 text-right text-zinc-700 dark:text-zinc-300">-</td>
                  <td className="p-3 text-right font-bold text-zinc-900 dark:text-white">₹{projectSummary.contractorMargin.toLocaleString('en-IN')}</td>
                </tr>

                {/* GST */}
                {includeGst && (
                  <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                    <td className="p-3 font-sans text-zinc-400">08</td>
                    <td className="p-3 font-sans font-semibold text-zinc-900 dark:text-white">
                      GST @ 18% (Applicable on Interior Works & Fitouts)
                    </td>
                    <td className="p-3 text-right text-zinc-700 dark:text-zinc-300">18%</td>
                    <td className="p-3 text-right text-zinc-700 dark:text-zinc-300">-</td>
                    <td className="p-3 text-right font-bold text-zinc-900 dark:text-white">₹{projectSummary.gstAmount.toLocaleString('en-IN')}</td>
                  </tr>
                )}
              </tbody>

              {/* Total Footer */}
              <tfoot>
                <tr className="border-t-2 border-zinc-900 dark:border-white bg-pink-600 text-white font-bold text-sm">
                  <td colSpan={2} className="p-3 uppercase">Total Estimated Ceiling Project Budget</td>
                  <td className="p-3 text-right font-mono">{projectSummary.totalFlatAreaSqFt} sq ft</td>
                  <td className="p-3 text-right font-mono">₹{(projectSummary.finalGrandTotal / (projectSummary.totalFlatAreaSqFt || 1)).toFixed(1)}/sq ft</td>
                  <td className="p-3 text-right font-mono text-base font-black">₹{projectSummary.finalGrandTotal.toLocaleString('en-IN')}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* SVG Trend Graph spanning full width */}
      <MaterialTrendGraph allowedMaterials={['fitoutCost', 'paint']} />
    </div>
  );
}

import { useState, useMemo, useEffect } from 'react';
import { 
  Compass, Clipboard, Check, RotateCcw, 
  Download, Layers, Sparkles, 
  Eye, Save, Trash2, Plus, TrendingUp,
  ShieldCheck, Info, Paintbrush
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import MaterialTrendGraph from '../components/MaterialTrendGraph';

// --- Types & Interfaces ---
type UnitType = 'feet' | 'meters';
type SurfaceProcess = 'fresh_plaster' | 'standard_repaint' | 'heavy_renovation';
type PaintQualityTier = 'luxury' | 'mid_range' | 'economy' | 'exterior';

interface PaintProduct {
  id: string;
  brand: string;
  name: string;
  tier: PaintQualityTier;
  category: 'interior' | 'exterior' | 'ceiling';
  pricePerLiter: number; // INR per Liter
  coverage2CoatsSqFt: number; // sq ft per Liter for 2 coats
  sheen: string;
  washability: string;
  dilution: string;
  recommendedFor: string;
}

interface BrandHistoricalData {
  brand: string;
  productLine: string;
  tier: PaintQualityTier;
  prices: { year: number; price: number }[]; // INR per liter
  cagr5Yr: number;
}

interface RoomItem {
  id: string;
  name: string;
  length: number;
  width: number;
  height: number;
  includeCeiling: boolean;
  numDoors: number;
  numWindows: number;
  customDeductionSqFt: number;
  hasAccentWall: boolean;
  accentWallColor: string;
  wallColor: string;
}

interface SavedPaintQuote {
  id: string;
  name: string;
  brandName: string;
  productName: string;
  totalCost: number;
  netAreaSqFt: number;
  totalPaintLiters: number;
  date: string;
}

// --- Top Indian Paint Brands Database ---
const INDIAN_PAINT_PRODUCTS: PaintProduct[] = [
  // Asian Paints
  {
    id: 'ap_royale_luxury',
    brand: 'Asian Paints',
    name: 'Royale Luxury Emulsion',
    tier: 'luxury',
    category: 'interior',
    pricePerLiter: 630,
    coverage2CoatsSqFt: 140,
    sheen: 'Soft Sheen / Pearl Luster',
    washability: 'High (Teflon Surface Protector)',
    dilution: '40% with clean water',
    recommendedFor: 'Living rooms, master bedrooms & premium hallways'
  },
  {
    id: 'ap_royale_matt',
    brand: 'Asian Paints',
    name: 'Royale Matt Interior',
    tier: 'luxury',
    category: 'interior',
    pricePerLiter: 660,
    coverage2CoatsSqFt: 135,
    sheen: 'Ultra-Rich Dead Matt',
    washability: 'High (Burnish Resistant)',
    dilution: '40% with clean water',
    recommendedFor: 'Modern designer spaces & accent feature walls'
  },
  {
    id: 'ap_apcolite_premium',
    brand: 'Asian Paints',
    name: 'Apcolite Premium Emulsion',
    tier: 'mid_range',
    category: 'interior',
    pricePerLiter: 375,
    coverage2CoatsSqFt: 115,
    sheen: 'Smooth Satin Matt',
    washability: 'Medium-High (Stain Guard)',
    dilution: '40% with clean water',
    recommendedFor: 'Bedrooms, dining rooms & family lounges'
  },
  {
    id: 'ap_tractor_emulsion',
    brand: 'Asian Paints',
    name: 'Tractor Emulsion',
    tier: 'economy',
    category: 'interior',
    pricePerLiter: 195,
    coverage2CoatsSqFt: 95,
    sheen: 'Smooth Matt',
    washability: 'Moderate (Washable with damp cloth)',
    dilution: '40%-50% with clean water',
    recommendedFor: 'Budget homes, rental properties & ceilings'
  },
  {
    id: 'ap_apex_ultima',
    brand: 'Asian Paints',
    name: 'Apex Ultima Exterior',
    tier: 'exterior',
    category: 'exterior',
    pricePerLiter: 480,
    coverage2CoatsSqFt: 110,
    sheen: 'Rich Sheen',
    washability: 'Extreme Anti-Algal & Rain Guard',
    dilution: '40% with clean water',
    recommendedFor: 'Exterior balconies, outer facades & weather walls'
  },

  // Berger Paints
  {
    id: 'berger_silk_glamor',
    brand: 'Berger Paints',
    name: 'Silk Glamor Luxury Emulsion',
    tier: 'luxury',
    category: 'interior',
    pricePerLiter: 610,
    coverage2CoatsSqFt: 135,
    sheen: 'Metallic / Ultra Silk Glow',
    washability: 'High (Elastomeric Film Washable)',
    dilution: '40% with clean water',
    recommendedFor: 'Luxury drawing rooms & premium suites'
  },
  {
    id: 'berger_easy_clean',
    brand: 'Berger Paints',
    name: 'Easy Clean Fresh Emulsion',
    tier: 'mid_range',
    category: 'interior',
    pricePerLiter: 365,
    coverage2CoatsSqFt: 115,
    sheen: 'Soft Sheen',
    washability: 'High (Cross-Linking Polymer Washable)',
    dilution: '40% with clean water',
    recommendedFor: 'Kids bedrooms, high-traffic corridors & kitchens'
  },
  {
    id: 'berger_bison_emulsion',
    brand: 'Berger Paints',
    name: 'Bison Acrylic Emulsion',
    tier: 'economy',
    category: 'interior',
    pricePerLiter: 188,
    coverage2CoatsSqFt: 95,
    sheen: 'Smooth Matt',
    washability: 'Moderate',
    dilution: '45% with clean water',
    recommendedFor: 'Affordable repaints, ceilings & store rooms'
  },
  {
    id: 'berger_weathercoat',
    brand: 'Berger Paints',
    name: 'WeatherCoat Long Life',
    tier: 'exterior',
    category: 'exterior',
    pricePerLiter: 470,
    coverage2CoatsSqFt: 105,
    sheen: 'High Sheen',
    washability: '10-Year PU Rain Proof Guard',
    dilution: '40% with clean water',
    recommendedFor: 'Building facades & external boundary walls'
  },

  // Kansai Nerolac
  {
    id: 'nerolac_impressions_hd',
    brand: 'Kansai Nerolac',
    name: 'Impressions HD Luxury',
    tier: 'luxury',
    category: 'interior',
    pricePerLiter: 595,
    coverage2CoatsSqFt: 135,
    sheen: 'Micro-Reflective High Def Sheen',
    washability: 'High (Zero VOC & Odorless)',
    dilution: '40% with clean water',
    recommendedFor: 'Eco-conscious premium residential spaces'
  },
  {
    id: 'nerolac_beauty_gold',
    brand: 'Kansai Nerolac',
    name: 'Beauty Gold Washable',
    tier: 'mid_range',
    category: 'interior',
    pricePerLiter: 355,
    coverage2CoatsSqFt: 110,
    sheen: 'Soft Sheen',
    washability: 'Medium-High',
    dilution: '40% with clean water',
    recommendedFor: 'Family living rooms and master suites'
  },
  {
    id: 'nerolac_beauty_smooth',
    brand: 'Kansai Nerolac',
    name: 'Beauty Smooth Emulsion',
    tier: 'economy',
    category: 'interior',
    pricePerLiter: 180,
    coverage2CoatsSqFt: 90,
    sheen: 'Smooth Matt',
    washability: 'Moderate',
    dilution: '45% with clean water',
    recommendedFor: 'Standard residential interior surfaces'
  },
  {
    id: 'nerolac_excel_mica',
    brand: 'Kansai Nerolac',
    name: 'Excel Mica Marble Exterior',
    tier: 'exterior',
    category: 'exterior',
    pricePerLiter: 460,
    coverage2CoatsSqFt: 105,
    sheen: 'Mica Glaze Luster',
    washability: 'Extreme Heat & Heavy Rain Deflector',
    dilution: '40% with clean water',
    recommendedFor: 'Coastal & heavy monsoon exterior structures'
  },

  // Dulux (AkzoNobel)
  {
    id: 'dulux_velvet_touch',
    brand: 'Dulux',
    name: 'Dulux Velvet Touch Diamond Glo',
    tier: 'luxury',
    category: 'interior',
    pricePerLiter: 620,
    coverage2CoatsSqFt: 140,
    sheen: 'Ultra-Smooth Diamond Pearl Glo',
    washability: 'High (Anti-bacterial & Scrub proof)',
    dilution: '35%-40% with clean water',
    recommendedFor: 'Luxury interior feature walls & master suites'
  },
  {
    id: 'dulux_superclean',
    brand: 'Dulux',
    name: 'Dulux SuperClean 3-in-1',
    tier: 'mid_range',
    category: 'interior',
    pricePerLiter: 360,
    coverage2CoatsSqFt: 115,
    sheen: 'Silky Sheen',
    washability: 'High (Beaded Water & Stain Repel)',
    dilution: '40% with clean water',
    recommendedFor: 'Kitchens, dining halls & children rooms'
  },
  {
    id: 'dulux_promise',
    brand: 'Dulux',
    name: 'Dulux Promise Interior',
    tier: 'economy',
    category: 'interior',
    pricePerLiter: 182,
    coverage2CoatsSqFt: 95,
    sheen: 'Matt Chalk-Free',
    washability: 'Moderate',
    dilution: '40% with clean water',
    recommendedFor: 'Ceilings, utility areas & budget apartments'
  },
  {
    id: 'dulux_weathershield',
    brand: 'Dulux',
    name: 'Dulux Weathershield Powerflexx',
    tier: 'exterior',
    category: 'exterior',
    pricePerLiter: 490,
    coverage2CoatsSqFt: 110,
    sheen: 'Rich Sheen',
    washability: 'Elastomeric Micro-Crack Bridging',
    dilution: '40% with clean water',
    recommendedFor: 'Exterior concrete facades & high-rise towers'
  },

  // Indigo Paints
  {
    id: 'indigo_dirtproof',
    brand: 'Indigo Paints',
    name: 'Indigo Dirtproof & Waterproof',
    tier: 'luxury',
    category: 'interior',
    pricePerLiter: 545,
    coverage2CoatsSqFt: 130,
    sheen: 'Rich Luster Sheen',
    washability: 'High (Nanotechnology Dust Barrier)',
    dilution: '40% with clean water',
    recommendedFor: 'Urban apartments prone to dust & traffic smog'
  },
  {
    id: 'indigo_ceiling_coat',
    brand: 'Indigo Paints',
    name: 'Indigo Bright Ceiling Coat',
    tier: 'mid_range',
    category: 'ceiling',
    pricePerLiter: 270,
    coverage2CoatsSqFt: 120,
    sheen: 'Dead Matt Anti-Glare',
    washability: 'High Opacity Non-Drip',
    dilution: '35% with clean water',
    recommendedFor: 'All gypsum, POP & false ceilings'
  },
  {
    id: 'indigo_acrylic_emulsion',
    brand: 'Indigo Paints',
    name: 'Indigo Acrylic Emulsion',
    tier: 'economy',
    category: 'interior',
    pricePerLiter: 190,
    coverage2CoatsSqFt: 95,
    sheen: 'Smooth Matt',
    washability: 'Moderate',
    dilution: '40% with clean water',
    recommendedFor: 'General interior plaster repainting'
  },

  // Birla Opus (Grasim)
  {
    id: 'birla_prime_luxury',
    brand: 'Birla Opus',
    name: 'Prime Luxury Interior Emulsion',
    tier: 'luxury',
    category: 'interior',
    pricePerLiter: 580,
    coverage2CoatsSqFt: 135,
    sheen: 'Ultra-Rich Luminous Sheen',
    washability: 'High (Advanced Stain Release)',
    dilution: '40% with clean water',
    recommendedFor: 'Modern luxury home interiors'
  },
  {
    id: 'birla_one_interior',
    brand: 'Birla Opus',
    name: 'One Interior Emulsion',
    tier: 'mid_range',
    category: 'interior',
    pricePerLiter: 345,
    coverage2CoatsSqFt: 115,
    sheen: 'Satin Sheen',
    washability: 'Medium-High',
    dilution: '40% with clean water',
    recommendedFor: 'Living, bed and dining rooms'
  },
  {
    id: 'birla_style_emulsion',
    brand: 'Birla Opus',
    name: 'Style Acrylic Emulsion',
    tier: 'economy',
    category: 'interior',
    pricePerLiter: 175,
    coverage2CoatsSqFt: 90,
    sheen: 'Matt',
    washability: 'Moderate',
    dilution: '45% with clean water',
    recommendedFor: 'Value for money residential painting'
  }
];

// --- 5-Year Historical Indian Paint Brand Price Benchmark (2022 to 2026) ---
const HISTORICAL_PAINT_PRICE_TRENDS: BrandHistoricalData[] = [
  {
    brand: 'Asian Paints',
    productLine: 'Royale Luxury Emulsion (₹/L)',
    tier: 'luxury',
    prices: [
      { year: 2022, price: 490 },
      { year: 2023, price: 520 },
      { year: 2024, price: 560 },
      { year: 2025, price: 595 },
      { year: 2026, price: 630 }
    ],
    cagr5Yr: 6.48
  },
  {
    brand: 'Asian Paints',
    productLine: 'Apcolite Premium Emulsion (₹/L)',
    tier: 'mid_range',
    prices: [
      { year: 2022, price: 290 },
      { year: 2023, price: 310 },
      { year: 2024, price: 335 },
      { year: 2025, price: 355 },
      { year: 2026, price: 375 }
    ],
    cagr5Yr: 6.64
  },
  {
    brand: 'Asian Paints',
    productLine: 'Tractor Emulsion (₹/L)',
    tier: 'economy',
    prices: [
      { year: 2022, price: 145 },
      { year: 2023, price: 160 },
      { year: 2024, price: 175 },
      { year: 2025, price: 185 },
      { year: 2026, price: 195 }
    ],
    cagr5Yr: 7.68
  },
  {
    brand: 'Berger Paints',
    productLine: 'Silk Glamor Luxury (₹/L)',
    tier: 'luxury',
    prices: [
      { year: 2022, price: 470 },
      { year: 2023, price: 500 },
      { year: 2024, price: 540 },
      { year: 2025, price: 575 },
      { year: 2026, price: 610 }
    ],
    cagr5Yr: 6.74
  },
  {
    brand: 'Berger Paints',
    productLine: 'Easy Clean Fresh (₹/L)',
    tier: 'mid_range',
    prices: [
      { year: 2022, price: 280 },
      { year: 2023, price: 300 },
      { year: 2024, price: 325 },
      { year: 2025, price: 345 },
      { year: 2026, price: 365 }
    ],
    cagr5Yr: 6.85
  },
  {
    brand: 'Kansai Nerolac',
    productLine: 'Impressions HD Luxury (₹/L)',
    tier: 'luxury',
    prices: [
      { year: 2022, price: 460 },
      { year: 2023, price: 490 },
      { year: 2024, price: 530 },
      { year: 2025, price: 560 },
      { year: 2026, price: 595 }
    ],
    cagr5Yr: 6.64
  },
  {
    brand: 'Dulux',
    productLine: 'Velvet Touch Diamond Glo (₹/L)',
    tier: 'luxury',
    prices: [
      { year: 2022, price: 480 },
      { year: 2023, price: 515 },
      { year: 2024, price: 550 },
      { year: 2025, price: 585 },
      { year: 2026, price: 620 }
    ],
    cagr5Yr: 6.60
  },
  {
    brand: 'Dulux',
    productLine: 'Promise Interior Emulsion (₹/L)',
    tier: 'economy',
    prices: [
      { year: 2022, price: 138 },
      { year: 2023, price: 150 },
      { year: 2024, price: 162 },
      { year: 2025, price: 172 },
      { year: 2026, price: 182 }
    ],
    cagr5Yr: 7.16
  },
  {
    brand: 'Indigo Paints',
    productLine: 'Dirtproof & Waterproof (₹/L)',
    tier: 'luxury',
    prices: [
      { year: 2022, price: 420 },
      { year: 2023, price: 450 },
      { year: 2024, price: 485 },
      { year: 2025, price: 515 },
      { year: 2026, price: 545 }
    ],
    cagr5Yr: 6.73
  },
  {
    brand: 'All Brands Benchmark',
    productLine: 'Acrylic Wall Putty (₹/40kg Bag)',
    tier: 'economy',
    prices: [
      { year: 2022, price: 680 },
      { year: 2023, price: 740 },
      { year: 2024, price: 800 },
      { year: 2025, price: 840 },
      { year: 2026, price: 880 }
    ],
    cagr5Yr: 6.65
  },
  {
    brand: 'All Brands Benchmark',
    productLine: 'Interior Wall Primer (₹/20L Drum)',
    tier: 'mid_range',
    prices: [
      { year: 2022, price: 1900 },
      { year: 2023, price: 2100 },
      { year: 2024, price: 2280 },
      { year: 2025, price: 2420 },
      { year: 2026, price: 2550 }
    ],
    cagr5Yr: 7.63
  },
  {
    brand: 'Contractor Benchmark',
    productLine: 'Painting Labor (₹/sq ft complete)',
    tier: 'mid_range',
    prices: [
      { year: 2022, price: 8.5 },
      { year: 2023, price: 9.8 },
      { year: 2024, price: 11.2 },
      { year: 2025, price: 12.8 },
      { year: 2026, price: 14.0 }
    ],
    cagr5Yr: 13.28
  }
];

// Color Swatches Palette
const POPULAR_COLOR_SWATCHES = [
  { name: 'Pure Chalk White', hex: '#F9FAFB', border: '#E5E7EB' },
  { name: 'Warm Cream Linen', hex: '#FAF5EE', border: '#E8DFC8' },
  { name: 'Soft Sage Mist', hex: '#E2ECE9', border: '#BBD2CB' },
  { name: 'Morning Mist Blue', hex: '#E0F2FE', border: '#BAE6FD' },
  { name: 'Dusty Rose Peach', hex: '#FCE7F3', border: '#FBCFE8' },
  { name: 'Royal Navy Blue', hex: '#1E3A8A', border: '#172554' },
  { name: 'Earthy Terracotta', hex: '#9A3412', border: '#7C2D12' },
  { name: 'Charcoal Accent', hex: '#374151', border: '#1F2937' },
];

export default function PaintCalculator() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'trends' | 'visualizer' | 'boq'>('calculator');
  const [unit, setUnit] = useState<UnitType>('feet');
  const [processType, setProcessType] = useState<SurfaceProcess>('fresh_plaster');
  const [selectedProductId, setSelectedProductId] = useState<string>('ap_royale_luxury');
  const [numCoats, setNumCoats] = useState<number>(2);
  const [bufferWastage, setBufferWastage] = useState<number>(10); // % buffer for touchup / spills
  const [contractorMarginPct, setContractorMarginPct] = useState<number>(10); // %
  const [includeGst, setIncludeGst] = useState<boolean>(true); // 18% GST

  // Undercoats Rates
  const [puttyPricePerKg, setPuttyPricePerKg] = useState<number>(22); // ₹22/kg (₹880/40kg)
  const [primerPricePerLiter, setPrimerPricePerLiter] = useState<number>(128); // ₹128/L (₹2550/20L)
  const [laborRatePerSqFt, setLaborRatePerSqFt] = useState<number>(14); // ₹14/sq ft

  // Saved quotes & UI feedback
  const [copied, setCopied] = useState<boolean>(false);
  const [savedQuotes, setSavedQuotes] = useState<SavedPaintQuote[]>([]);
  const [quoteName, setQuoteName] = useState<string>('My Home Painting');

  // Trend graph filter state
  const [trendBrandFilter, setTrendBrandFilter] = useState<string>('all');
  const [trendTierFilter, setTrendTierFilter] = useState<string>('all');

  // Multi-Room State
  const [rooms, setRooms] = useState<RoomItem[]>([
    {
      id: 'room_1',
      name: 'Living & Dining Room',
      length: 18,
      width: 14,
      height: 10,
      includeCeiling: true,
      numDoors: 2,
      numWindows: 2,
      customDeductionSqFt: 0,
      hasAccentWall: true,
      accentWallColor: '#1E3A8A',
      wallColor: '#FAF5EE'
    },
    {
      id: 'room_2',
      name: 'Master Bedroom',
      length: 14,
      width: 12,
      height: 10,
      includeCeiling: true,
      numDoors: 1,
      numWindows: 2,
      customDeductionSqFt: 0,
      hasAccentWall: false,
      accentWallColor: '#9A3412',
      wallColor: '#E2ECE9'
    },
    {
      id: 'room_3',
      name: 'Kitchen & Utility',
      length: 10,
      width: 8,
      height: 10,
      includeCeiling: true,
      numDoors: 1,
      numWindows: 1,
      customDeductionSqFt: 40, // Cabinet tiled walls deduction
      hasAccentWall: false,
      accentWallColor: '#374151',
      wallColor: '#F9FAFB'
    }
  ]);

  // Active visualizer room
  const [visualizerRoomId, setVisualizerRoomId] = useState<string>('room_1');

  // Selected Paint Product Object
  const selectedProduct = useMemo(() => {
    return INDIAN_PAINT_PRODUCTS.find(p => p.id === selectedProductId) || INDIAN_PAINT_PRODUCTS[0];
  }, [selectedProductId]);

  // Load saved quotes from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('toolique_paint_quotes');
      if (saved) {
        setSavedQuotes(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error loading saved paint quotes:', e);
    }
  }, []);

  // Save quotes to localStorage
  const handleSaveQuote = () => {
    const newQuote: SavedPaintQuote = {
      id: Date.now().toString(),
      name: quoteName || 'Home Painting Project',
      brandName: selectedProduct.brand,
      productName: selectedProduct.name,
      totalCost: computedSummary.finalGrandTotal,
      netAreaSqFt: computedSummary.totalNetPaintAreaSqFt,
      totalPaintLiters: computedSummary.totalPaintLitersWithBuffer,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    };
    const updated = [newQuote, ...savedQuotes];
    setSavedQuotes(updated);
    localStorage.setItem('toolique_paint_quotes', JSON.stringify(updated));
    alert('Project Quote Saved Successfully!');
  };

  const handleDeleteQuote = (id: string) => {
    const updated = savedQuotes.filter(q => q.id !== id);
    setSavedQuotes(updated);
    localStorage.setItem('toolique_paint_quotes', JSON.stringify(updated));
  };

  // Add Room
  const handleAddRoom = () => {
    const newId = `room_${Date.now()}`;
    const newRoom: RoomItem = {
      id: newId,
      name: `Room ${rooms.length + 1}`,
      length: unit === 'feet' ? 12 : 3.6,
      width: unit === 'feet' ? 10 : 3.0,
      height: unit === 'feet' ? 10 : 3.0,
      includeCeiling: true,
      numDoors: 1,
      numWindows: 1,
      customDeductionSqFt: 0,
      hasAccentWall: false,
      accentWallColor: '#1E3A8A',
      wallColor: '#FAF5EE'
    };
    setRooms([...rooms, newRoom]);
    setVisualizerRoomId(newId);
  };

  // Remove Room
  const handleRemoveRoom = (id: string) => {
    if (rooms.length <= 1) {
      alert('At least one room must be defined.');
      return;
    }
    const filtered = rooms.filter(r => r.id !== id);
    setRooms(filtered);
    if (visualizerRoomId === id) {
      setVisualizerRoomId(filtered[0].id);
    }
  };

  // Update Room property
  const handleUpdateRoom = <K extends keyof RoomItem>(id: string, key: K, value: RoomItem[K]) => {
    setRooms(rooms.map(r => (r.id === id ? { ...r, [key]: value } : r)));
  };

  // Reset to default
  const handleResetAll = () => {
    setUnit('feet');
    setProcessType('fresh_plaster');
    setSelectedProductId('ap_royale_luxury');
    setNumCoats(2);
    setBufferWastage(10);
    setContractorMarginPct(10);
    setIncludeGst(true);
    setPuttyPricePerKg(22);
    setPrimerPricePerLiter(128);
    setLaborRatePerSqFt(14);
    setRooms([
      {
        id: 'room_1',
        name: 'Living & Dining Room',
        length: 18,
        width: 14,
        height: 10,
        includeCeiling: true,
        numDoors: 2,
        numWindows: 2,
        customDeductionSqFt: 0,
        hasAccentWall: true,
        accentWallColor: '#1E3A8A',
        wallColor: '#FAF5EE'
      },
      {
        id: 'room_2',
        name: 'Master Bedroom',
        length: 14,
        width: 12,
        height: 10,
        includeCeiling: true,
        numDoors: 1,
        numWindows: 2,
        customDeductionSqFt: 0,
        hasAccentWall: false,
        accentWallColor: '#9A3412',
        wallColor: '#E2ECE9'
      }
    ]);
  };

  // Core Room Calculations
  const roomCalculations = useMemo(() => {
    return rooms.map(room => {
      // Dimensions converted to sq ft
      const lengthFt = unit === 'feet' ? room.length : room.length * 3.28084;
      const widthFt = unit === 'feet' ? room.width : room.width * 3.28084;
      const heightFt = unit === 'feet' ? room.height : room.height * 3.28084;

      // 4 Walls gross area: 2 * (L + W) * H
      const grossWallAreaSqFt = 2 * (lengthFt + widthFt) * heightFt;
      const ceilingAreaSqFt = room.includeCeiling ? lengthFt * widthFt : 0;

      // Deductions
      const doorDeductionSqFt = room.numDoors * 21; // standard Indian door 3ft x 7ft = 21 sq ft
      const windowDeductionSqFt = room.numWindows * 16; // standard Indian window 4ft x 4ft = 16 sq ft
      const customDeductionSqFt = unit === 'feet' ? room.customDeductionSqFt : room.customDeductionSqFt * 10.764;
      const totalDeductionsSqFt = doorDeductionSqFt + windowDeductionSqFt + customDeductionSqFt;

      const netWallAreaSqFt = Math.max(0, grossWallAreaSqFt - totalDeductionsSqFt);
      const totalNetPaintAreaSqFt = netWallAreaSqFt + ceilingAreaSqFt;

      return {
        ...room,
        lengthFt,
        widthFt,
        heightFt,
        grossWallAreaSqFt,
        ceilingAreaSqFt,
        totalDeductionsSqFt,
        netWallAreaSqFt,
        totalNetPaintAreaSqFt
      };
    });
  }, [rooms, unit]);

  // Overall Project Summary & Material Math
  const computedSummary = useMemo(() => {
    const totalGrossWallAreaSqFt = roomCalculations.reduce((sum, r) => sum + r.grossWallAreaSqFt, 0);
    const totalCeilingAreaSqFt = roomCalculations.reduce((sum, r) => sum + r.ceilingAreaSqFt, 0);
    const totalDeductionsSqFt = roomCalculations.reduce((sum, r) => sum + r.totalDeductionsSqFt, 0);
    const totalNetPaintAreaSqFt = roomCalculations.reduce((sum, r) => sum + r.totalNetPaintAreaSqFt, 0);

    // Coverage & Paint Required
    const coveragePerLiter = (selectedProduct.coverage2CoatsSqFt / 2) * (2 / numCoats);
    const basePaintLiters = totalNetPaintAreaSqFt / (coveragePerLiter || 1);
    const bufferMultiplier = 1 + bufferWastage / 100;
    const totalPaintLitersWithBuffer = Number((basePaintLiters * bufferMultiplier).toFixed(1));

    // Undercoats Math depending on Process Type
    let puttyKgRequired = 0;
    let primerLitersRequired = 0;
    let sandingPaperCount = 0;
    let maskingTapeRolls = Math.ceil(totalNetPaintAreaSqFt / 250);

    if (processType === 'fresh_plaster') {
      // 2 Coats Putty: 1 kg covers ~12-14 sq ft
      puttyKgRequired = Math.ceil((totalNetPaintAreaSqFt / 13) * bufferMultiplier);
      // 1 Coat Primer: 1 L covers ~135 sq ft
      primerLitersRequired = Math.ceil((totalNetPaintAreaSqFt / 135) * bufferMultiplier);
      sandingPaperCount = Math.ceil(totalNetPaintAreaSqFt / 120);
    } else if (processType === 'standard_repaint') {
      // Touch-up putty on 20% area
      puttyKgRequired = Math.ceil((totalNetPaintAreaSqFt * 0.2 / 13) * bufferMultiplier);
      // 1 Coat Primer
      primerLitersRequired = Math.ceil((totalNetPaintAreaSqFt / 140) * bufferMultiplier);
      sandingPaperCount = Math.ceil(totalNetPaintAreaSqFt / 200);
    } else if (processType === 'heavy_renovation') {
      // Deep scraping + 2 coats putty
      puttyKgRequired = Math.ceil((totalNetPaintAreaSqFt / 10) * bufferMultiplier);
      // 2 Coats Damp Primer
      primerLitersRequired = Math.ceil((totalNetPaintAreaSqFt / 75) * bufferMultiplier);
      sandingPaperCount = Math.ceil(totalNetPaintAreaSqFt / 80);
    }

    // Packaging Distribution for Finish Paint
    let remPaintL = totalPaintLitersWithBuffer;
    const paintCans20L = Math.floor(remPaintL / 20);
    remPaintL %= 20;
    const paintCans10L = Math.floor(remPaintL / 10);
    remPaintL %= 10;
    const paintCans4L = Math.floor(remPaintL / 4);
    remPaintL %= 4;
    const paintCans1L = Math.ceil(remPaintL);

    // Packaging for Primer
    let remPrimerL = primerLitersRequired;
    const primerCans20L = Math.floor(remPrimerL / 20);
    remPrimerL %= 20;
    const primerCans10L = Math.floor(remPrimerL / 10);
    remPrimerL %= 10;
    const primerCans4L = Math.floor(remPrimerL / 4);
    remPrimerL %= 4;
    const primerCans1L = Math.ceil(remPrimerL);

    // Packaging for Putty (40kg bags & 5kg packs)
    const puttyBags40Kg = Math.floor(puttyKgRequired / 40);
    const puttyPacks5Kg = Math.ceil((puttyKgRequired % 40) / 5);

    // Cost Breakdowns
    const topcoatCost = Math.round(totalPaintLitersWithBuffer * selectedProduct.pricePerLiter);
    const primerCost = Math.round(primerLitersRequired * primerPricePerLiter);
    const puttyCost = Math.round(puttyKgRequired * puttyPricePerKg);
    const consumablesCost = Math.round(sandingPaperCount * 25 + maskingTapeRolls * 65 + 450); // masking plastic drop sheets

    const totalMaterialsCost = topcoatCost + primerCost + puttyCost + consumablesCost;

    // Labor Cost
    let effectiveLaborRate = laborRatePerSqFt;
    if (processType === 'standard_repaint') {
      effectiveLaborRate = laborRatePerSqFt * 0.75;
    } else if (processType === 'heavy_renovation') {
      effectiveLaborRate = laborRatePerSqFt * 1.35;
    }

    const totalLaborCost = Math.round(totalNetPaintAreaSqFt * effectiveLaborRate);

    const subTotal = totalMaterialsCost + totalLaborCost;
    const contractorMargin = Math.round(subTotal * (contractorMarginPct / 100));
    const preTaxTotal = subTotal + contractorMargin;
    const gstAmount = includeGst ? Math.round(preTaxTotal * 0.18) : 0;
    const finalGrandTotal = preTaxTotal + gstAmount;

    return {
      totalGrossWallAreaSqFt: Number(totalGrossWallAreaSqFt.toFixed(1)),
      totalCeilingAreaSqFt: Number(totalCeilingAreaSqFt.toFixed(1)),
      totalDeductionsSqFt: Number(totalDeductionsSqFt.toFixed(1)),
      totalNetPaintAreaSqFt: Number(totalNetPaintAreaSqFt.toFixed(1)),
      totalPaintLitersWithBuffer,
      coveragePerLiter: Number(coveragePerLiter.toFixed(1)),
      puttyKgRequired,
      primerLitersRequired,
      sandingPaperCount,
      maskingTapeRolls,
      paintCans20L,
      paintCans10L,
      paintCans4L,
      paintCans1L,
      primerCans20L,
      primerCans10L,
      primerCans4L,
      primerCans1L,
      puttyBags40Kg,
      puttyPacks5Kg,
      topcoatCost,
      primerCost,
      puttyCost,
      consumablesCost,
      totalMaterialsCost,
      effectiveLaborRate: Number(effectiveLaborRate.toFixed(1)),
      totalLaborCost,
      subTotal,
      contractorMargin,
      preTaxTotal,
      gstAmount,
      finalGrandTotal
    };
  }, [
    roomCalculations, selectedProduct, numCoats, bufferWastage, processType, 
    puttyPricePerKg, primerPricePerLiter, laborRatePerSqFt, contractorMarginPct, includeGst
  ]);

  // Current visualizer room object
  const activeVisualizerRoom = useMemo(() => {
    return roomCalculations.find(r => r.id === visualizerRoomId) || roomCalculations[0];
  }, [roomCalculations, visualizerRoomId]);

  // Copy Formatted BOQ Report to Clipboard
  const handleCopyReport = () => {
    const text = `========================================
TOOLIQUE ADVANCED PAINT & BOQ ESTIMATOR
========================================
Project Name     : ${quoteName}
Selected Brand   : ${selectedProduct.brand} (${selectedProduct.name})
Quality Tier     : ${selectedProduct.tier.toUpperCase()} (${selectedProduct.sheen})
Process Type     : ${processType.replace('_', ' ').toUpperCase()}
Total Rooms      : ${rooms.length} Room(s)
----------------------------------------
SURFACE AREA SUMMARY:
- Gross Wall Area: ${computedSummary.totalGrossWallAreaSqFt} sq ft
- Ceiling Area   : ${computedSummary.totalCeilingAreaSqFt} sq ft
- Deductions     : -${computedSummary.totalDeductionsSqFt} sq ft (Doors/Windows)
- Net Paint Area : ${computedSummary.totalNetPaintAreaSqFt} sq ft (${(computedSummary.totalNetPaintAreaSqFt / 10.764).toFixed(1)} sq m)
----------------------------------------
MATERIAL REQUIRED:
- Finish Paint   : ${computedSummary.totalPaintLitersWithBuffer} Liters (${selectedProduct.brand})
  Packaging      : [20L: ${computedSummary.paintCans20L}] [10L: ${computedSummary.paintCans10L}] [4L: ${computedSummary.paintCans4L}] [1L: ${computedSummary.paintCans1L}]
- Wall Putty     : ${computedSummary.puttyKgRequired} Kg (${computedSummary.puttyBags40Kg} Bags of 40kg + ${computedSummary.puttyPacks5Kg} Packs of 5kg)
- Wall Primer    : ${computedSummary.primerLitersRequired} Liters
- Sanding/Masking: ${computedSummary.sandingPaperCount} Emery Sheets + ${computedSummary.maskingTapeRolls} Masking Rolls
----------------------------------------
ITEMIZED COST BREAKDOWN (INR):
1. Topcoat Paint (${computedSummary.totalPaintLitersWithBuffer} L @ ₹${selectedProduct.pricePerLiter}/L) : ₹${computedSummary.topcoatCost.toLocaleString('en-IN')}
2. Wall Putty (${computedSummary.puttyKgRequired} Kg @ ₹${puttyPricePerKg}/Kg)        : ₹${computedSummary.puttyCost.toLocaleString('en-IN')}
3. Wall Primer (${computedSummary.primerLitersRequired} L @ ₹${primerPricePerLiter}/L)        : ₹${computedSummary.primerCost.toLocaleString('en-IN')}
4. Consumables (Tape, Paper, Plastic)          : ₹${computedSummary.consumablesCost.toLocaleString('en-IN')}
   Total Materials Subtotal                    : ₹${computedSummary.totalMaterialsCost.toLocaleString('en-IN')}
5. Skilled Labor & Sanding (@ ₹${computedSummary.effectiveLaborRate}/sq ft)   : ₹${computedSummary.totalLaborCost.toLocaleString('en-IN')}
6. Contractor Overhead & Margin (${contractorMarginPct}%)       : ₹${computedSummary.contractorMargin.toLocaleString('en-IN')}
${includeGst ? `7. GST @ 18%                                    : ₹${computedSummary.gstAmount.toLocaleString('en-IN')}` : ''}
----------------------------------------
ESTIMATED GRAND TOTAL : ₹${computedSummary.finalGrandTotal.toLocaleString('en-IN')}
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
      doc.setFillColor(30, 58, 138); // Indigo / Navy
      doc.rect(0, 0, pageWidth, 28, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('PAINTING BOQ & MATERIAL ESTIMATE', 14, 18);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on ${new Date().toLocaleDateString('en-IN')} | Toolique India`, pageWidth - 14, 18, { align: 'right' });

      // Project Info Box
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`Project: ${quoteName}`, 14, 38);
      doc.text(`Brand & Product: ${selectedProduct.brand} - ${selectedProduct.name}`, 14, 44);
      doc.setFont('helvetica', 'normal');
      doc.text(`Process: ${processType.replace('_', ' ').toUpperCase()} | Sheen: ${selectedProduct.sheen}`, 14, 50);
      doc.text(`Net Paint Area: ${computedSummary.totalNetPaintAreaSqFt} sq ft | Finish Paint: ${computedSummary.totalPaintLitersWithBuffer} L`, 14, 56);

      // Section 1: Room Breakdown Table
      doc.setFillColor(243, 244, 246);
      doc.rect(14, 62, pageWidth - 28, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('ROOM NAME', 18, 67);
      doc.text('DIMENSIONS (LxWxH)', 65, 67);
      doc.text('GROSS AREA', 115, 67);
      doc.text('DEDUCTIONS', 145, 67);
      doc.text('NET AREA', 175, 67);

      let yPos = 75;
      doc.setFont('helvetica', 'normal');
      roomCalculations.forEach((r, idx) => {
        if (idx % 2 === 1) {
          doc.setFillColor(249, 250, 251);
          doc.rect(14, yPos - 5, pageWidth - 28, 7, 'F');
        }
        doc.text(r.name, 18, yPos);
        doc.text(`${r.length} x ${r.width} x ${r.height} ${unit === 'feet' ? 'ft' : 'm'}`, 65, yPos);
        doc.text(`${r.grossWallAreaSqFt + r.ceilingAreaSqFt} sq ft`, 115, yPos);
        doc.text(`-${r.totalDeductionsSqFt} sq ft`, 145, yPos);
        doc.text(`${r.totalNetPaintAreaSqFt} sq ft`, 175, yPos);
        yPos += 7;
      });

      // Section 2: Materials Packaging
      yPos += 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Required Material Procurement Splits', 14, yPos);
      yPos += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`• Finish Topcoat (${selectedProduct.brand}): ${computedSummary.totalPaintLitersWithBuffer} Liters`, 18, yPos);
      yPos += 5;
      doc.text(`   Packaging: ${computedSummary.paintCans20L} x 20L Drum, ${computedSummary.paintCans10L} x 10L Bucket, ${computedSummary.paintCans4L} x 4L Can, ${computedSummary.paintCans1L} x 1L Tin`, 22, yPos);
      yPos += 6;
      doc.text(`• Acrylic Wall Putty: ${computedSummary.puttyKgRequired} Kg (${computedSummary.puttyBags40Kg} Bags of 40kg + ${computedSummary.puttyPacks5Kg} Packs of 5kg)`, 18, yPos);
      yPos += 5;
      doc.text(`• Interior Wall Primer: ${computedSummary.primerLitersRequired} Liters (${computedSummary.primerCans20L} x 20L Drum, ${computedSummary.primerCans10L} x 10L Bucket, ${computedSummary.primerCans4L} x 4L Can, ${computedSummary.primerCans1L} x 1L Tin)`, 18, yPos);
      yPos += 5;
      doc.text(`• Sanding Emery Paper & Masking: ${computedSummary.sandingPaperCount} Sheets + ${computedSummary.maskingTapeRolls} Masking Rolls`, 18, yPos);

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
      doc.text('QTY / UNIT', 110, yPos + 5);
      doc.text('UNIT RATE (INR)', 145, yPos + 5);
      doc.text('TOTAL (INR)', 175, yPos + 5);
      yPos += 12;

      const boqRows = [
        { desc: `Topcoat Paint (${selectedProduct.name})`, qty: `${computedSummary.totalPaintLitersWithBuffer} L`, rate: `₹${selectedProduct.pricePerLiter}`, total: `₹${computedSummary.topcoatCost.toLocaleString('en-IN')}` },
        { desc: 'Acrylic Wall Putty (2 Coats)', qty: `${computedSummary.puttyKgRequired} Kg`, rate: `₹${puttyPricePerKg}`, total: `₹${computedSummary.puttyCost.toLocaleString('en-IN')}` },
        { desc: 'Water-Thinnable Wall Primer', qty: `${computedSummary.primerLitersRequired} L`, rate: `₹${primerPricePerLiter}`, total: `₹${computedSummary.primerCost.toLocaleString('en-IN')}` },
        { desc: 'Consumables (Masking Tape, Sandpaper, Sheets)', qty: 'Lump sum', rate: '-', total: `₹${computedSummary.consumablesCost.toLocaleString('en-IN')}` },
        { desc: 'Skilled Painting Labor & Sanding Prep', qty: `${computedSummary.totalNetPaintAreaSqFt} sq ft`, rate: `₹${computedSummary.effectiveLaborRate}/sq ft`, total: `₹${computedSummary.totalLaborCost.toLocaleString('en-IN')}` },
        { desc: `Contractor Margin / Contingency (${contractorMarginPct}%)`, qty: '-', rate: '-', total: `₹${computedSummary.contractorMargin.toLocaleString('en-IN')}` },
      ];

      if (includeGst) {
        boqRows.push({ desc: 'GST @ 18% on Goods & Services', qty: '18%', rate: '-', total: `₹${computedSummary.gstAmount.toLocaleString('en-IN')}` });
      }

      doc.setFont('helvetica', 'normal');
      boqRows.forEach((row, i) => {
        if (i % 2 === 1) {
          doc.setFillColor(249, 250, 251);
          doc.rect(14, yPos - 4, pageWidth - 28, 6, 'F');
        }
        doc.text(row.desc, 18, yPos);
        doc.text(row.qty, 110, yPos);
        doc.text(row.rate, 145, yPos);
        doc.text(row.total, 175, yPos);
        yPos += 6;
      });

      // Total Callout
      yPos += 4;
      doc.setFillColor(30, 58, 138);
      doc.rect(14, yPos, pageWidth - 28, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('ESTIMATED GRAND TOTAL (ALL INCLUSIVE):', 18, yPos + 7);
      doc.text(`INR ${computedSummary.finalGrandTotal.toLocaleString('en-IN')}`, pageWidth - 18, yPos + 7, { align: 'right' });

      // Footer
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Note: Actual paint coverage may vary ±10% based on wall substrate roughness and application method.', 14, 285);

      doc.save(`Painting_Estimate_${selectedProduct.brand.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
      alert('Unable to generate PDF. Please use the Copy Report button.');
    }
  };

  // Filtered Historical Trends Data
  const filteredTrends = useMemo(() => {
    return HISTORICAL_PAINT_PRICE_TRENDS.filter(item => {
      const matchBrand = trendBrandFilter === 'all' || item.brand === trendBrandFilter;
      const matchTier = trendTierFilter === 'all' || item.tier === trendTierFilter;
      return matchBrand && matchTier;
    });
  }, [trendBrandFilter, trendTierFilter]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-left">
      {/* Top Header & View Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Paintbrush className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                Architectural Paint Estimator & Indian Brand Price Trends Studio
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Multi-room wall & ceiling paint BOQ, undercoats solver, and 5-year historical pricing engine
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
                ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Estimator</span>
          </button>
          <button
            onClick={() => setActiveTab('visualizer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'visualizer'
                ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>2D Elevation</span>
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'trends'
                ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>5-Yr Price Trends</span>
          </button>
          <button
            onClick={() => setActiveTab('boq')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'boq'
                ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Itemized BOQ</span>
          </button>
        </div>
      </div>

      {/* TAB 1: ESTIMATOR & ROOM PLANNER */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Inputs Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Global Settings Card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                  1. Brand Selection & Surface Process
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex rounded-lg bg-zinc-100 dark:bg-zinc-800 p-0.5 text-xs font-semibold">
                    <button
                      onClick={() => setUnit('feet')}
                      className={`px-2.5 py-1 rounded-md transition ${unit === 'feet' ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-zinc-500'}`}
                    >
                      Feet (ft)
                    </button>
                    <button
                      onClick={() => setUnit('meters')}
                      className={`px-2.5 py-1 rounded-md transition ${unit === 'meters' ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-zinc-500'}`}
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

              {/* Brand & Product Selector */}
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1.5">
                  Select Indian Paint Brand & Product Line
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="saas-select w-full font-semibold text-xs py-2"
                >
                  <optgroup label="Asian Paints">
                    {INDIAN_PAINT_PRODUCTS.filter(p => p.brand === 'Asian Paints').map(p => (
                      <option key={p.id} value={p.id}>{p.brand} - {p.name} (₹{p.pricePerLiter}/L)</option>
                    ))}
                  </optgroup>
                  <optgroup label="Berger Paints">
                    {INDIAN_PAINT_PRODUCTS.filter(p => p.brand === 'Berger Paints').map(p => (
                      <option key={p.id} value={p.id}>{p.brand} - {p.name} (₹{p.pricePerLiter}/L)</option>
                    ))}
                  </optgroup>
                  <optgroup label="Kansai Nerolac">
                    {INDIAN_PAINT_PRODUCTS.filter(p => p.brand === 'Kansai Nerolac').map(p => (
                      <option key={p.id} value={p.id}>{p.brand} - {p.name} (₹{p.pricePerLiter}/L)</option>
                    ))}
                  </optgroup>
                  <optgroup label="Dulux (AkzoNobel)">
                    {INDIAN_PAINT_PRODUCTS.filter(p => p.brand === 'Dulux').map(p => (
                      <option key={p.id} value={p.id}>{p.brand} - {p.name} (₹{p.pricePerLiter}/L)</option>
                    ))}
                  </optgroup>
                  <optgroup label="Indigo Paints">
                    {INDIAN_PAINT_PRODUCTS.filter(p => p.brand === 'Indigo Paints').map(p => (
                      <option key={p.id} value={p.id}>{p.brand} - {p.name} (₹{p.pricePerLiter}/L)</option>
                    ))}
                  </optgroup>
                  <optgroup label="Birla Opus">
                    {INDIAN_PAINT_PRODUCTS.filter(p => p.brand === 'Birla Opus').map(p => (
                      <option key={p.id} value={p.id}>{p.brand} - {p.name} (₹{p.pricePerLiter}/L)</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Product Quick Specs Card */}
              <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-xs space-y-1.5">
                <div className="flex justify-between items-center font-semibold text-indigo-950 dark:text-indigo-200">
                  <span>{selectedProduct.brand} • {selectedProduct.name}</span>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white font-mono text-[10px] uppercase font-bold">
                    {selectedProduct.tier}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-zinc-600 dark:text-zinc-300 font-mono">
                  <div><span className="text-zinc-400 block text-[9px] uppercase">Sheen</span>{selectedProduct.sheen}</div>
                  <div><span className="text-zinc-400 block text-[9px] uppercase">2-Coat Coverage</span>{selectedProduct.coverage2CoatsSqFt} sq ft/L</div>
                  <div><span className="text-zinc-400 block text-[9px] uppercase">Dilution</span>{selectedProduct.dilution}</div>
                  <div><span className="text-zinc-400 block text-[9px] uppercase">Washability</span>{selectedProduct.washability.split(' ')[0]}</div>
                </div>
              </div>

              {/* Surface Process Type */}
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1.5">
                  Surface Preparation & Work Scope
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => setProcessType('fresh_plaster')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      processType === 'fresh_plaster'
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 shadow-xs'
                        : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="font-bold text-xs">Fresh Plaster</div>
                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">2 coats putty + 1 primer + 2 topcoat</div>
                  </button>

                  <button
                    onClick={() => setProcessType('standard_repaint')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      processType === 'standard_repaint'
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 shadow-xs'
                        : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="font-bold text-xs">Standard Repaint</div>
                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">Touchup putty + 1 primer + 2 topcoat</div>
                  </button>

                  <button
                    onClick={() => setProcessType('heavy_renovation')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      processType === 'heavy_renovation'
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 shadow-xs'
                        : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="font-bold text-xs">Damp / Renovation</div>
                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">Scraping + damp primer + 2 putty + 2 coat</div>
                  </button>
                </div>
              </div>

              {/* Number of Coats & Buffers */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                    Topcoat Layers
                  </label>
                  <select
                    value={numCoats}
                    onChange={(e) => setNumCoats(parseInt(e.target.value) || 2)}
                    className="saas-select w-full text-xs py-1.5 font-semibold"
                  >
                    <option value={1}>1 Coat (Touchup)</option>
                    <option value={2}>2 Coats (Standard)</option>
                    <option value={3}>3 Coats (Deep Tone)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                    Spill / Touchup Margin
                  </label>
                  <select
                    value={bufferWastage}
                    onChange={(e) => setBufferWastage(parseInt(e.target.value) || 10)}
                    className="saas-select w-full text-xs py-1.5 font-semibold"
                  >
                    <option value={5}>5% Buffer</option>
                    <option value={10}>10% (Recommended)</option>
                    <option value={15}>15% Buffer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                    Labor Rate (₹/{unit === 'feet' ? 'sq ft' : 'sq m'})
                  </label>
                  <input
                    type="number"
                    value={laborRatePerSqFt}
                    onChange={(e) => setLaborRatePerSqFt(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="saas-input py-1.5 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                    Contractor Margin
                  </label>
                  <select
                    value={contractorMarginPct}
                    onChange={(e) => setContractorMarginPct(parseInt(e.target.value) || 0)}
                    className="saas-select w-full text-xs py-1.5 font-semibold"
                  >
                    <option value={0}>0% (Direct DIY)</option>
                    <option value={10}>10% Contractor</option>
                    <option value={15}>15% Turnkey</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Room Dimensions & Multi-Room Manager */}
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div>
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider block">
                    2. Room-by-Room Layout & Openings
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Add all rooms in your home to compute total house painting load
                  </span>
                </div>
                <button
                  onClick={handleAddRoom}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition shadow-xs"
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
                      className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/70 dark:border-zinc-800/80 space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                            {index + 1}
                          </span>
                          <input
                            type="text"
                            value={room.name}
                            onChange={(e) => handleUpdateRoom(room.id, 'name', e.target.value)}
                            className="font-bold text-xs bg-transparent border-b border-dashed border-zinc-300 dark:border-zinc-700 focus:border-indigo-500 focus:outline-hidden text-zinc-900 dark:text-white"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            Net: {roomCalc?.totalNetPaintAreaSqFt || 0} sq ft
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

                      {/* Dimension inputs */}
                      <div className="grid grid-cols-3 gap-2.5">
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
                        <div>
                          <label className="block text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                            Height ({unit === 'feet' ? 'ft' : 'm'})
                          </label>
                          <input
                            type="number"
                            value={room.height || ''}
                            onChange={(e) => handleUpdateRoom(room.id, 'height', Math.max(0, parseFloat(e.target.value) || 0))}
                            className="saas-input py-1.5 text-xs font-mono font-semibold"
                          />
                        </div>
                      </div>

                      {/* Deductions & Ceiling Toggle */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                        <div>
                          <label className="block text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                            Doors (21 sq ft ea)
                          </label>
                          <input
                            type="number"
                            value={room.numDoors}
                            onChange={(e) => handleUpdateRoom(room.id, 'numDoors', Math.max(0, parseInt(e.target.value) || 0))}
                            className="saas-input py-1.5 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                            Windows (16 sq ft ea)
                          </label>
                          <input
                            type="number"
                            value={room.numWindows}
                            onChange={(e) => handleUpdateRoom(room.id, 'numWindows', Math.max(0, parseInt(e.target.value) || 0))}
                            className="saas-input py-1.5 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                            Custom Deduction ({unit === 'feet' ? 'sq ft' : 'sq m'})
                          </label>
                          <input
                            type="number"
                            value={room.customDeductionSqFt || ''}
                            onChange={(e) => handleUpdateRoom(room.id, 'customDeductionSqFt', Math.max(0, parseFloat(e.target.value) || 0))}
                            placeholder="Wardrobe / Tile"
                            className="saas-input py-1.5 text-xs font-mono"
                          />
                        </div>
                        <div className="flex flex-col justify-end">
                          <label className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer select-none pb-2">
                            <input
                              type="checkbox"
                              checked={room.includeCeiling}
                              onChange={(e) => handleUpdateRoom(room.id, 'includeCeiling', e.target.checked)}
                              className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>Include Ceiling</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Summary & Packaging Column */}
          <div className="lg:col-span-5 space-y-6">
            {/* Grand Total Budget Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-5">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
                  Estimated Painting Budget
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleCopyReport}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs"
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
                <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 font-mono tracking-tight">
                  ₹{computedSummary.finalGrandTotal.toLocaleString('en-IN')}
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>Net Surface Area: <strong className="text-zinc-800 dark:text-zinc-200">{computedSummary.totalNetPaintAreaSqFt} sq ft</strong></span>
                  <span>•</span>
                  <span>₹{(computedSummary.finalGrandTotal / (computedSummary.totalNetPaintAreaSqFt || 1)).toFixed(1)}/sq ft all-inclusive</span>
                </div>
              </div>

              {/* Material Requirement Highlights */}
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800 space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-600 dark:text-zinc-400 font-medium">Finish Paint ({selectedProduct.brand}):</span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-white">
                    {computedSummary.totalPaintLitersWithBuffer} Liters
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-600 dark:text-zinc-400 font-medium">Acrylic Wall Putty:</span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-white">
                    {computedSummary.puttyKgRequired} Kg ({computedSummary.puttyBags40Kg} Bags + {computedSummary.puttyPacks5Kg} Pks)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-600 dark:text-zinc-400 font-medium">Water-Thinnable Primer:</span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-white">
                    {computedSummary.primerLitersRequired} Liters
                  </span>
                </div>
              </div>

              {/* Paint Can Optimizer Grid */}
              <div>
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-2">
                  Optimized Paint Pack Split ({selectedProduct.name})
                </span>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
                    <div className="text-indigo-600 dark:text-indigo-400 font-black font-mono text-sm">{computedSummary.paintCans20L}</div>
                    <div className="text-[10px] text-zinc-500 uppercase font-bold mt-0.5">20L Drum</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
                    <div className="text-indigo-600 dark:text-indigo-400 font-black font-mono text-sm">{computedSummary.paintCans10L}</div>
                    <div className="text-[10px] text-zinc-500 uppercase font-bold mt-0.5">10L Bucket</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
                    <div className="text-indigo-600 dark:text-indigo-400 font-black font-mono text-sm">{computedSummary.paintCans4L}</div>
                    <div className="text-[10px] text-zinc-500 uppercase font-bold mt-0.5">4L Can</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
                    <div className="text-indigo-600 dark:text-indigo-400 font-black font-mono text-sm">{computedSummary.paintCans1L}</div>
                    <div className="text-[10px] text-zinc-500 uppercase font-bold mt-0.5">1L Tin</div>
                  </div>
                </div>
              </div>

              {/* Quick Cost Breakdown */}
              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 space-y-2 text-xs">
                <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
                  <span>Paint Materials Subtotal</span>
                  <span className="font-mono font-semibold text-zinc-900 dark:text-white">
                    ₹{computedSummary.totalMaterialsCost.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
                  <span>Skilled Painting Labor ({processType.replace('_', ' ')})</span>
                  <span className="font-mono font-semibold text-zinc-900 dark:text-white">
                    ₹{computedSummary.totalLaborCost.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
                  <span>Contractor Overhead & Margin ({contractorMarginPct}%)</span>
                  <span className="font-mono font-semibold text-zinc-900 dark:text-white">
                    ₹{computedSummary.contractorMargin.toLocaleString('en-IN')}
                  </span>
                </div>
                {includeGst && (
                  <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
                    <span>GST (18% on Goods & Services)</span>
                    <span className="font-mono font-semibold text-zinc-900 dark:text-white">
                      ₹{computedSummary.gstAmount.toLocaleString('en-IN')}
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
                          {quote.brandName} • {quote.netAreaSqFt} sq ft • {quote.date}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
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

      {/* TAB 2: 2D ROOM ELEVATION & COLOR VISUALIZER */}
      {activeTab === 'visualizer' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                2D Room Elevation & Wall Color Visualizer
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Interactive unfolded 4-wall layout showing door/window cutouts and accent colors
              </p>
            </div>

            {/* Room Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-500">Select Room:</span>
              <select
                value={visualizerRoomId}
                onChange={(e) => setVisualizerRoomId(e.target.value)}
                className="saas-select text-xs font-semibold py-1.5"
              >
                {roomCalculations.map(r => (
                  <option key={r.id} value={r.id}>{r.name} ({r.length}x{r.width} {unit === 'feet' ? 'ft' : 'm'})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Color Swatch Picker */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Pick Wall Paint Shade ({activeVisualizerRoom.name}):
            </label>
            <div className="flex flex-wrap gap-2">
              {POPULAR_COLOR_SWATCHES.map(swatch => (
                <button
                  key={swatch.name}
                  onClick={() => handleUpdateRoom(activeVisualizerRoom.id, 'wallColor', swatch.hex)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition ${
                    activeVisualizerRoom.wallColor === swatch.hex
                      ? 'ring-2 ring-indigo-500 border-transparent shadow-xs'
                      : 'border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-black/10"
                    style={{ backgroundColor: swatch.hex }}
                  />
                  <span className="text-zinc-800 dark:text-zinc-200 text-[11px]">{swatch.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Accent Wall Toggle */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800 text-xs">
            <label className="flex items-center gap-2 font-semibold text-zinc-800 dark:text-zinc-200 cursor-pointer">
              <input
                type="checkbox"
                checked={activeVisualizerRoom.hasAccentWall}
                onChange={(e) => handleUpdateRoom(activeVisualizerRoom.id, 'hasAccentWall', e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>Enable Designer Accent / Feature Wall (Wall A)</span>
            </label>
            {activeVisualizerRoom.hasAccentWall && (
              <div className="flex items-center gap-1.5 ml-auto">
                <span className="text-[11px] text-zinc-500">Accent Tone:</span>
                {['#1E3A8A', '#9A3412', '#374151', '#065F46', '#831843'].map(c => (
                  <button
                    key={c}
                    onClick={() => handleUpdateRoom(activeVisualizerRoom.id, 'accentWallColor', c)}
                    className={`w-5 h-5 rounded-full border transition ${
                      activeVisualizerRoom.accentWallColor === c ? 'ring-2 ring-indigo-500 scale-110' : 'border-zinc-300'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Unfolded 4-Walls SVG Graphic */}
          <div className="p-4 rounded-2xl bg-zinc-100/70 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 overflow-x-auto">
            <svg
              viewBox="0 0 920 280"
              className="w-full min-w-[700px] h-64 text-zinc-800 dark:text-zinc-200 select-none"
            >
              {/* Ceiling Strip if included */}
              {activeVisualizerRoom.includeCeiling && (
                <g>
                  <rect
                    x="20"
                    y="15"
                    width="880"
                    height="35"
                    fill="#FDFDFD"
                    stroke="#CBD5E1"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                    rx="4"
                  />
                  <text x="460" y="37" textAnchor="middle" fill="#64748B" fontSize="11" fontWeight="bold">
                    Ceiling Area: {activeVisualizerRoom.ceilingAreaSqFt} sq ft (Length {activeVisualizerRoom.length} x Width {activeVisualizerRoom.width})
                  </text>
                </g>
              )}

              {/* 4 Walls Unfolded */}
              {/* Wall A (Front / Accent) */}
              <g transform="translate(20, 60)">
                <rect
                  x="0"
                  y="0"
                  width="210"
                  height="180"
                  fill={activeVisualizerRoom.hasAccentWall ? activeVisualizerRoom.accentWallColor : activeVisualizerRoom.wallColor}
                  stroke="#94A3B8"
                  strokeWidth="2"
                  rx="6"
                />
                <text x="105" y="25" textAnchor="middle" fill={activeVisualizerRoom.hasAccentWall ? '#FFFFFF' : '#334155'} fontSize="11" fontWeight="bold">
                  Wall A ({activeVisualizerRoom.hasAccentWall ? 'Accent Wall' : 'Front'})
                </text>
                <text x="105" y="42" textAnchor="middle" fill={activeVisualizerRoom.hasAccentWall ? '#E2E8F0' : '#64748B'} fontSize="9">
                  {activeVisualizerRoom.length} ft x {activeVisualizerRoom.height} ft
                </text>

                {/* Door Cutout if any */}
                {activeVisualizerRoom.numDoors > 0 && (
                  <g transform="translate(30, 80)">
                    <rect x="0" y="0" width="50" height="100" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.5" strokeDasharray="3 3" rx="2" />
                    <text x="25" y="55" textAnchor="middle" fill="#475569" fontSize="9" fontWeight="bold">Door 1</text>
                    <text x="25" y="68" textAnchor="middle" fill="#94A3B8" fontSize="8">-21 sq ft</text>
                  </g>
                )}
              </g>

              {/* Wall B (Right) */}
              <g transform="translate(240, 60)">
                <rect
                  x="0"
                  y="0"
                  width="210"
                  height="180"
                  fill={activeVisualizerRoom.wallColor}
                  stroke="#94A3B8"
                  strokeWidth="2"
                  rx="6"
                />
                <text x="105" y="25" textAnchor="middle" fill="#334155" fontSize="11" fontWeight="bold">
                  Wall B (Right Wall)
                </text>
                <text x="105" y="42" textAnchor="middle" fill="#64748B" fontSize="9">
                  {activeVisualizerRoom.width} ft x {activeVisualizerRoom.height} ft
                </text>

                {/* Window Cutout if any */}
                {activeVisualizerRoom.numWindows > 0 && (
                  <g transform="translate(70, 70)">
                    <rect x="0" y="0" width="70" height="60" fill="#BAE6FD" stroke="#0284C7" strokeWidth="1.5" rx="3" />
                    <line x1="35" y1="0" x2="35" y2="60" stroke="#0284C7" strokeWidth="1" />
                    <line x1="0" y1="30" x2="70" y2="30" stroke="#0284C7" strokeWidth="1" />
                    <text x="35" y="80" textAnchor="middle" fill="#0369A1" fontSize="9" fontWeight="bold">Window 1</text>
                    <text x="35" y="92" textAnchor="middle" fill="#64748B" fontSize="8">-16 sq ft</text>
                  </g>
                )}
              </g>

              {/* Wall C (Back) */}
              <g transform="translate(460, 60)">
                <rect
                  x="0"
                  y="0"
                  width="210"
                  height="180"
                  fill={activeVisualizerRoom.wallColor}
                  stroke="#94A3B8"
                  strokeWidth="2"
                  rx="6"
                />
                <text x="105" y="25" textAnchor="middle" fill="#334155" fontSize="11" fontWeight="bold">
                  Wall C (Back Wall)
                </text>
                <text x="105" y="42" textAnchor="middle" fill="#64748B" fontSize="9">
                  {activeVisualizerRoom.length} ft x {activeVisualizerRoom.height} ft
                </text>

                {/* Second Window Cutout if any */}
                {activeVisualizerRoom.numWindows > 1 && (
                  <g transform="translate(70, 70)">
                    <rect x="0" y="0" width="70" height="60" fill="#BAE6FD" stroke="#0284C7" strokeWidth="1.5" rx="3" />
                    <line x1="35" y1="0" x2="35" y2="60" stroke="#0284C7" strokeWidth="1" />
                    <line x1="0" y1="30" x2="70" y2="30" stroke="#0284C7" strokeWidth="1" />
                    <text x="35" y="80" textAnchor="middle" fill="#0369A1" fontSize="9" fontWeight="bold">Window 2</text>
                    <text x="35" y="92" textAnchor="middle" fill="#64748B" fontSize="8">-16 sq ft</text>
                  </g>
                )}
              </g>

              {/* Wall D (Left) */}
              <g transform="translate(680, 60)">
                <rect
                  x="0"
                  y="0"
                  width="210"
                  height="180"
                  fill={activeVisualizerRoom.wallColor}
                  stroke="#94A3B8"
                  strokeWidth="2"
                  rx="6"
                />
                <text x="105" y="25" textAnchor="middle" fill="#334155" fontSize="11" fontWeight="bold">
                  Wall D (Left Wall)
                </text>
                <text x="105" y="42" textAnchor="middle" fill="#64748B" fontSize="9">
                  {activeVisualizerRoom.width} ft x {activeVisualizerRoom.height} ft
                </text>

                {/* Second Door or Custom deduction */}
                {activeVisualizerRoom.numDoors > 1 ? (
                  <g transform="translate(40, 80)">
                    <rect x="0" y="0" width="50" height="100" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.5" strokeDasharray="3 3" rx="2" />
                    <text x="25" y="55" textAnchor="middle" fill="#475569" fontSize="9" fontWeight="bold">Door 2</text>
                  </g>
                ) : (
                  <text x="105" y="110" textAnchor="middle" fill="#94A3B8" fontSize="10" fontStyle="italic">
                    Solid Wall Surface
                  </text>
                )}
              </g>
            </svg>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700">
              <span className="text-zinc-400 block text-[10px] uppercase">Gross Surface Area</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">
                {activeVisualizerRoom.grossWallAreaSqFt + activeVisualizerRoom.ceilingAreaSqFt} sq ft
              </span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700">
              <span className="text-zinc-400 block text-[10px] uppercase">Deductions (Openings)</span>
              <span className="font-bold text-red-500 font-mono">
                -{activeVisualizerRoom.totalDeductionsSqFt} sq ft
              </span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700">
              <span className="text-zinc-400 block text-[10px] uppercase">Net Paintable Area</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                {activeVisualizerRoom.totalNetPaintAreaSqFt} sq ft
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 5-YEAR HISTORICAL MATERIAL PRICE TRENDS */}
      {activeTab === 'trends' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  5-Year Historical Material Price Trends (2022–2026)
                </h3>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Indian paint brand retail benchmark price movements, undercoat trends, and inflation drivers
              </p>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <select
                value={trendBrandFilter}
                onChange={(e) => setTrendBrandFilter(e.target.value)}
                className="saas-select py-1.5 font-semibold text-xs"
              >
                <option value="all">All Brands & Undercoats</option>
                <option value="Asian Paints">Asian Paints</option>
                <option value="Berger Paints">Berger Paints</option>
                <option value="Kansai Nerolac">Kansai Nerolac</option>
                <option value="Dulux">Dulux</option>
                <option value="Indigo Paints">Indigo Paints</option>
                <option value="All Brands Benchmark">Putty & Primer</option>
                <option value="Contractor Benchmark">Labor Rate</option>
              </select>

              <select
                value={trendTierFilter}
                onChange={(e) => setTrendTierFilter(e.target.value)}
                className="saas-select py-1.5 font-semibold text-xs"
              >
                <option value="all">All Tiers</option>
                <option value="luxury">Luxury Emulsions</option>
                <option value="mid_range">Mid-Range Emulsions</option>
                <option value="economy">Economy / Distemper</option>
              </select>
            </div>
          </div>

          {/* Interactive Multi-Brand SVG Trend Chart */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200/80 dark:border-zinc-800">
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-3">
              Price Evolution Graph (INR per Liter / Unit)
            </span>

            <div className="overflow-x-auto">
              <svg viewBox="0 0 800 240" className="w-full min-w-[650px] h-56 text-zinc-700 dark:text-zinc-300">
                {/* Horizontal Grid lines */}
                {[50, 100, 150, 200].map((y, idx) => (
                  <g key={y}>
                    <line x1="60" y1={y} x2="760" y2={y} stroke="#E2E8F0" strokeDasharray="3 3" className="dark:stroke-zinc-800" />
                    <text x="50" y={y + 4} textAnchor="end" fill="#94A3B8" fontSize="9" fontFamily="monospace">
                      ₹{idx === 0 ? 600 : idx === 1 ? 400 : idx === 2 ? 200 : 0}
                    </text>
                  </g>
                ))}

                {/* Years X Axis */}
                {[
                  { yr: 2022, x: 100 },
                  { yr: 2023, x: 250 },
                  { yr: 2024, x: 410 },
                  { yr: 2025, x: 570 },
                  { yr: 2026, x: 730 }
                ].map(pt => (
                  <g key={pt.yr}>
                    <line x1={pt.x} y1="40" x2={pt.x} y2="205" stroke="#F1F5F9" strokeDasharray="2 2" className="dark:stroke-zinc-850" />
                    <text x={pt.x} y="222" textAnchor="middle" fill="#64748B" fontSize="10" fontWeight="bold">
                      {pt.yr}
                    </text>
                  </g>
                ))}

                {/* Render Filtered Lines */}
                {filteredTrends.slice(0, 5).map((item, lineIdx) => {
                  const colors = ['#4F46E5', '#0284C7', '#059669', '#D97706', '#E11D48'];
                  const color = colors[lineIdx % colors.length];

                  // Map points to SVG coordinates (Scale max ₹700 to y=40, ₹0 to y=200)
                  const getY = (val: number) => {
                    const normalized = Math.min(680, Math.max(0, val));
                    return 200 - (normalized / 680) * 155;
                  };

                  const coords = item.prices.map((pt, pIdx) => {
                    const xPositions = [100, 250, 410, 570, 730];
                    return { x: xPositions[pIdx], y: getY(pt.price), price: pt.price, year: pt.year };
                  });

                  const pathD = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');

                  return (
                    <g key={item.productLine}>
                      <path
                        d={pathD}
                        fill="none"
                        stroke={color}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {coords.map(c => (
                        <g key={c.year}>
                          <circle cx={c.x} cy={c.y} r="4" fill={color} stroke="#FFFFFF" strokeWidth="1.5" />
                          <text
                            x={c.x}
                            y={c.y - 8}
                            textAnchor="middle"
                            fill={color}
                            fontSize="8"
                            fontWeight="bold"
                            fontFamily="monospace"
                          >
                            ₹{c.price}
                          </text>
                        </g>
                      ))}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 pt-3 border-t border-zinc-200/60 dark:border-zinc-800 text-[11px]">
              {filteredTrends.slice(0, 5).map((item, idx) => {
                const colors = ['#4F46E5', '#0284C7', '#059669', '#D97706', '#E11D48'];
                return (
                  <div key={item.productLine} className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[idx % colors.length] }} />
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">{item.brand}: {item.productLine}</span>
                    <span className="text-zinc-400 font-mono text-[10px]">({item.cagr5Yr}% CAGR)</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Historical Price Benchmarking Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 text-zinc-600 dark:text-zinc-300 font-bold uppercase text-[10px]">
                  <th className="p-3">Brand & Product Line</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-right">2022</th>
                  <th className="p-3 text-right">2023</th>
                  <th className="p-3 text-right">2024</th>
                  <th className="p-3 text-right">2025</th>
                  <th className="p-3 text-right font-black text-indigo-600 dark:text-indigo-400">2026 (Current)</th>
                  <th className="p-3 text-right">5-Yr CAGR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-mono">
                {filteredTrends.map(row => (
                  <tr key={row.productLine} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                    <td className="p-3 font-sans font-semibold text-zinc-900 dark:text-white">
                      <div>{row.brand}</div>
                      <div className="text-[10px] text-zinc-400 font-mono font-normal">{row.productLine}</div>
                    </td>
                    <td className="p-3 capitalize font-sans text-zinc-500">{row.tier.replace('_', ' ')}</td>
                    <td className="p-3 text-right text-zinc-600 dark:text-zinc-400">₹{row.prices[0]?.price}</td>
                    <td className="p-3 text-right text-zinc-600 dark:text-zinc-400">₹{row.prices[1]?.price}</td>
                    <td className="p-3 text-right text-zinc-600 dark:text-zinc-400">₹{row.prices[2]?.price}</td>
                    <td className="p-3 text-right text-zinc-600 dark:text-zinc-400">₹{row.prices[3]?.price}</td>
                    <td className="p-3 text-right font-bold text-indigo-600 dark:text-indigo-400">₹{row.prices[4]?.price}</td>
                    <td className="p-3 text-right text-emerald-600 dark:text-emerald-400 font-bold">+{row.cagr5Yr}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Market Drivers & Raw Material Inflation Factors */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800 space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-white">
                <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Raw Material Drivers</span>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed text-[11px]">
                Paint formulations rely heavily on <strong>Titanium Dioxide (TiO₂)</strong> for opacity/whiteness and crude-oil derived acrylic monomers (VAM, Butyl Acrylate). Crude oil fluctuations directly influence base paint retail pricing.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800 space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-white">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Birla Opus & Market Disruption</span>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed text-[11px]">
                The aggressive entry of Aditya Birla's Birla Opus with ₹10,000+ Cr capacity has introduced price-matching discounts and 10% extra tinting margins across Asian Paints, Berger, and Nerolac dealer networks in 2024–2026.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800 space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-white">
                <Info className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>GST & Packaging Economics</span>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed text-[11px]">
                Paints in India attract an <strong>18% GST slab</strong>. Buying 20-Liter master drums offers a 12% to 18% unit price economy compared to multiple 1-Liter tins due to tinplate and packaging overheads.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ITEMIZED CONTRACTOR BOQ */}
      {activeTab === 'boq' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-6">
          <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Contractor Painting Bill of Quantities (BOQ)
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Detailed procurement sheet with material specifications, labor rates, scaffolding, and GST
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyReport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs"
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
                  <th className="p-3">Description of Work / Material</th>
                  <th className="p-3">Brand / Grade</th>
                  <th className="p-3 text-right">Quantity</th>
                  <th className="p-3 text-right">Unit Rate</th>
                  <th className="p-3 text-right font-bold">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-mono">
                {/* Material Line Items */}
                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="p-3 font-sans text-zinc-400">01</td>
                  <td className="p-3 font-sans font-semibold text-zinc-900 dark:text-white">
                    Premium Topcoat Emulsion ({selectedProduct.name})
                    <span className="block text-[10px] text-zinc-400 font-mono">2 Coats application with 40% clean water dilution</span>
                  </td>
                  <td className="p-3 font-sans text-zinc-600 dark:text-zinc-400">{selectedProduct.brand}</td>
                  <td className="p-3 text-right text-zinc-700 dark:text-zinc-300">{computedSummary.totalPaintLitersWithBuffer} Liters</td>
                  <td className="p-3 text-right text-zinc-700 dark:text-zinc-300">₹{selectedProduct.pricePerLiter}/L</td>
                  <td className="p-3 text-right font-bold text-zinc-900 dark:text-white">₹{computedSummary.topcoatCost.toLocaleString('en-IN')}</td>
                </tr>

                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="p-3 font-sans text-zinc-400">02</td>
                  <td className="p-3 font-sans font-semibold text-zinc-900 dark:text-white">
                    Acrylic Wall Putty
                    <span className="block text-[10px] text-zinc-400 font-mono">2 Knife coats for micro-crack filling and smooth levelling</span>
                  </td>
                  <td className="p-3 font-sans text-zinc-600 dark:text-zinc-400">Birla White / JK / Asian</td>
                  <td className="p-3 text-right text-zinc-700 dark:text-zinc-300">{computedSummary.puttyKgRequired} Kg</td>
                  <td className="p-3 text-right text-zinc-700 dark:text-zinc-300">₹{puttyPricePerKg}/Kg</td>
                  <td className="p-3 text-right font-bold text-zinc-900 dark:text-white">₹{computedSummary.puttyCost.toLocaleString('en-IN')}</td>
                </tr>

                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="p-3 font-sans text-zinc-400">03</td>
                  <td className="p-3 font-sans font-semibold text-zinc-900 dark:text-white">
                    Water-Thinnable Interior/Exterior Primer
                    <span className="block text-[10px] text-zinc-400 font-mono">1 Uniform sealing coat before topcoat paint</span>
                  </td>
                  <td className="p-3 font-sans text-zinc-600 dark:text-zinc-400">TruCare / BP / Nerolac</td>
                  <td className="p-3 text-right text-zinc-700 dark:text-zinc-300">{computedSummary.primerLitersRequired} Liters</td>
                  <td className="p-3 text-right text-zinc-700 dark:text-zinc-300">₹{primerPricePerLiter}/L</td>
                  <td className="p-3 text-right font-bold text-zinc-900 dark:text-white">₹{computedSummary.primerCost.toLocaleString('en-IN')}</td>
                </tr>

                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="p-3 font-sans text-zinc-400">04</td>
                  <td className="p-3 font-sans font-semibold text-zinc-900 dark:text-white">
                    Site Protection & Consumables
                    <span className="block text-[10px] text-zinc-400 font-mono">Sanding emery paper (180/240/320 grit), masking tape rolls, floor drop sheets</span>
                  </td>
                  <td className="p-3 font-sans text-zinc-600 dark:text-zinc-400">Industrial Standard</td>
                  <td className="p-3 text-right text-zinc-700 dark:text-zinc-300">Lump sum</td>
                  <td className="p-3 text-right text-zinc-700 dark:text-zinc-300">-</td>
                  <td className="p-3 text-right font-bold text-zinc-900 dark:text-white">₹{computedSummary.consumablesCost.toLocaleString('en-IN')}</td>
                </tr>

                {/* Labor Line Item */}
                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 bg-indigo-50/30 dark:bg-indigo-950/10">
                  <td className="p-3 font-sans text-zinc-400">05</td>
                  <td className="p-3 font-sans font-semibold text-indigo-950 dark:text-indigo-200">
                    Skilled Painting Labor & Sanding Prep ({processType.replace('_', ' ').toUpperCase()})
                    <span className="block text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                      Scraping, 2-coat putty sanding with emery disc, primer coat, 2 coats topcoat finish & site cleanup
                    </span>
                  </td>
                  <td className="p-3 font-sans text-zinc-600 dark:text-zinc-400">Contractor Crew</td>
                  <td className="p-3 text-right text-zinc-700 dark:text-zinc-300">{computedSummary.totalNetPaintAreaSqFt} sq ft</td>
                  <td className="p-3 text-right text-zinc-700 dark:text-zinc-300">₹{computedSummary.effectiveLaborRate}/sq ft</td>
                  <td className="p-3 text-right font-bold text-indigo-600 dark:text-indigo-400">₹{computedSummary.totalLaborCost.toLocaleString('en-IN')}</td>
                </tr>

                {/* Contractor Margin */}
                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="p-3 font-sans text-zinc-400">06</td>
                  <td className="p-3 font-sans font-semibold text-zinc-900 dark:text-white">
                    Contractor Supervision, Scaffolding & Margin ({contractorMarginPct}%)
                  </td>
                  <td className="p-3 font-sans text-zinc-600 dark:text-zinc-400">-</td>
                  <td className="p-3 text-right text-zinc-700 dark:text-zinc-300">-</td>
                  <td className="p-3 text-right text-zinc-700 dark:text-zinc-300">-</td>
                  <td className="p-3 text-right font-bold text-zinc-900 dark:text-white">₹{computedSummary.contractorMargin.toLocaleString('en-IN')}</td>
                </tr>

                {/* GST */}
                {includeGst && (
                  <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                    <td className="p-3 font-sans text-zinc-400">07</td>
                    <td className="p-3 font-sans font-semibold text-zinc-900 dark:text-white">
                      GST @ 18% (Applicable on Goods & Services)
                    </td>
                    <td className="p-3 font-sans text-zinc-600 dark:text-zinc-400">Government Tax</td>
                    <td className="p-3 text-right text-zinc-700 dark:text-zinc-300">18%</td>
                    <td className="p-3 text-right text-zinc-700 dark:text-zinc-300">-</td>
                    <td className="p-3 text-right font-bold text-zinc-900 dark:text-white">₹{computedSummary.gstAmount.toLocaleString('en-IN')}</td>
                  </tr>
                )}
              </tbody>

              {/* Total Footer */}
              <tfoot>
                <tr className="border-t-2 border-zinc-900 dark:border-white bg-indigo-600 text-white font-bold text-sm">
                  <td colSpan={3} className="p-3 uppercase">Total Estimated Project Budget (All-Inclusive)</td>
                  <td className="p-3 text-right font-mono">{computedSummary.totalNetPaintAreaSqFt} sq ft</td>
                  <td className="p-3 text-right font-mono">₹{(computedSummary.finalGrandTotal / (computedSummary.totalNetPaintAreaSqFt || 1)).toFixed(1)}/sq ft</td>
                  <td className="p-3 text-right font-mono text-base font-black">₹{computedSummary.finalGrandTotal.toLocaleString('en-IN')}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* SVG Trend Graph spanning full width */}
      <MaterialTrendGraph allowedMaterials={['paint', 'fitoutCost']} />
    </div>
  );
}

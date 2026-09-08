import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  IndianRupee, Layers, Gauge, Box, Droplet, Printer,
  Search, HelpCircle, ChevronDown, Sparkles, ArrowRight, Play, Pause, Lightbulb, Power,
  Grid, List, Sliders, BookOpen, CheckCircle2, TrendingUp, DollarSign,
  Fan, Flame, Palette, Activity
} from 'lucide-react';
import SEO from '../components/SEO';

interface ToolItem {
  name: string;
  slug: string;
  desc: string;
}

interface ToolCluster {
  name: string;
  iconName: string;
  shortTag: string;
  summary: string;
  tools: ToolItem[];
}

const topicClusters: ToolCluster[] = [
  {
    name: 'Filament Sizing, Density & Inventory',
    iconName: 'Layers',
    shortTag: 'Materials & Spools',
    summary: 'Calculate spool weights, remaining filament on partially used rolls, multi-part batch usage, and comparative material running costs per gram.',
    tools: [
      { name: 'Filament Cost Calculator', slug: 'filament-cost-calculator', desc: 'Calculate the exact raw material cost of 3D prints based on model weight in grams, spool price, and spool size.' },
      { name: 'Filament Weight Calculator', slug: 'filament-weight-calculator', desc: 'Convert linear filament spool length (meters) directly into weight (grams) using standard material densities.' },
      { name: 'Filament Usage Calculator', slug: 'filament-usage-calculator', desc: 'Forecast total rolls required, spare margins, and cost splits for high-volume multi-part batch production.' },
      { name: 'Remaining Filament Calculator', slug: 'remaining-filament-calculator', desc: 'Measure leftover filament on active spools by subtracting empty tare spool weight from current gross weight.' },
      { name: 'Material Cost Comparison', slug: 'material-cost-comparison', desc: 'Compare running material costs per gram across PLA, PETG, ABS, ASA, TPU, and Nylon engineering polymers.' }
    ]
  },
  {
    name: 'Print Cost, Farm Revenue & Commercial Business',
    iconName: 'IndianRupee',
    shortTag: 'Pricing & Business',
    summary: 'Comprehensive commercial calculators for total job pricing, profit margins, machine depreciation, utility power draw, and print farm capacity forecasting.',
    tools: [
      { name: '3D Printing Cost Calculator', slug: '3d-printing-cost-calculator', desc: 'Estimate total print production cost factoring filament mass, electricity kWh rates, machine wear, and labor markup.' },
      { name: 'Print Profit Calculator', slug: 'print-profit-calculator', desc: 'Determine net earnings, target profit margins, and marketplace transaction fee deductions for 3D printed sales.' },
      { name: 'Print Farm Revenue Calculator', slug: 'print-farm-revenue-calculator', desc: 'Forecast daily, monthly, and yearly turnover projections across multi-printer print farms with uptime ratios.' },
      { name: 'Electricity Cost Calculator', slug: 'electricity-cost-calculator', desc: 'Compute operational electrical energy consumption utility costs based on printer wattage and local kWh rates.' },
      { name: 'Packaging Cost Calculator', slug: 'packaging-cost-calculator', desc: 'Calculate custom shipping boxes, bubble mailers, protective inserts, and brand logo label packaging budgets.' },
      { name: 'Shipping Cost Calculator', slug: 'shipping-cost-calculator', desc: 'Estimate shipping margins, dimensional weight carrier rates, and final delivery pricing breakdowns.' },
      { name: 'Machine Utilization Calculator', slug: 'machine-utilization-calculator', desc: 'Track active machine operating hours and calculate overall farm uptime efficiency metrics and idle bottlenecks.' },
      { name: 'Monthly Production Calculator', slug: 'monthly-production-calculator', desc: 'Estimate total monthly unit production capacities, batch turnaround schedules, and maximum yield throughput.' },
      { name: 'Print Queue Time Calculator', slug: 'print-queue-time-calculator', desc: 'Determine job queue completion timelines, customer delivery dates, and machine allocation order.' }
    ]
  },
  {
    name: 'Extrusion Physics, Slicing & Printer Utility',
    iconName: 'Gauge',
    shortTag: 'Speed & Slicing',
    summary: 'Dial in slicing parameters, volumetric flow ceilings, nozzle line widths, cooling fan profiles, and build plate nesting capacities.',
    tools: [
      { name: 'Print Time Estimator', slug: 'print-time-estimator', desc: 'Calculate accurate print durations based on print speeds, acceleration limits, layer counts, and total z-height.' },
      { name: 'Layer Height Calculator', slug: 'layer-height-calculator', desc: 'Calculate optimal magic number layer heights matching stepper motor pitch for maximum vertical surface quality.' },
      { name: 'Print Speed Calculator', slug: 'print-speed-calculator', desc: 'Determine actual print travel speeds, perimeter velocities, and acceleration limits across toolpath segments.' },
      { name: 'Nozzle Flow Calculator', slug: 'nozzle-flow-calculator', desc: 'Determine output extrusion volume rates (mm³/s) based on nozzle size, layer height, and print velocity.' },
      { name: 'Volumetric Flow Calculator', slug: 'volumetric-flow-calculator', desc: 'Determine hotend volumetric flow ceilings (mm³/s) to prevent extruder skipping and under-extrusion at high speeds.' },
      { name: 'Cooling Fan Recommendation', slug: 'cooling-fan-recommendation', desc: 'Determine optimal part cooling fan percentages for layer adhesion, overhang bridging, and stringing prevention.' },
      { name: 'Nozzle Size Comparison', slug: 'nozzle-size-comparison', desc: 'Compare print times, mechanical layer strengths, and resolution details across 0.2mm, 0.4mm, 0.6mm, and 0.8mm nozzles.' },
      { name: 'Line Width Calculator', slug: 'line-width-calculator', desc: 'Calculate optimal extrusion line widths and perimeter overlap ratios for strong structural layer bonding.' },
      { name: 'Layer Width Calculator', slug: 'layer-width-calculator', desc: 'Determine perimeter shell counts and wall thickness dimensions matching structural strength requirements.' },
      { name: 'Build Plate Utilization Calculator', slug: 'build-plate-utilization-calculator', desc: 'Check nesting limits and spacing clearances for batch model printing on 256x256mm and custom build beds.' }
    ]
  },
  {
    name: '3D Models, STL & Volume Analysis',
    iconName: 'Box',
    shortTag: '3D Files & STL',
    summary: 'Analyze binary and ASCII STL mesh files directly in your browser. Calculate exact cubic volumes, physical boundary dimensions, model weights, and scaling ratios.',
    tools: [
      { name: 'STL Volume Calculator', slug: 'stl-volume-calculator', desc: 'Parse STL mesh files locally in browser memory to compute exact solid volume in cm³ and estimated weight.' },
      { name: 'STL Bounding Box Calculator', slug: 'stl-bounding-box-calculator', desc: 'Calculate maximum X, Y, and Z physical bounding box dimensions to verify printer bed clearance.' },
      { name: 'Scale Calculator', slug: 'scale-calculator', desc: 'Convert 3D model dimensions across percentages, uniform ratios, and target physical dimensions.' },
      { name: 'Model Weight Calculator', slug: 'model-weight-calculator', desc: 'Calculate 3D printed model mass using cubic centimeters volume, infill density percentages, and filament densities.' }
    ]
  },
  {
    name: 'Resin (SLA / MSLA / DLP) Printing',
    iconName: 'Droplet',
    shortTag: 'Resin & SLA',
    summary: 'Specialized calculators for liquid photopolymer resin printing, vat volume conversion, cure exposure calibration, and bottle unit pricing.',
    tools: [
      { name: 'Resin Cost Calculator', slug: 'resin-cost-calculator', desc: 'Calculate liquid photopolymer UV resin print costs factoring bottle prices, volume (ml), and wash/cure loss.' },
      { name: 'Resin Volume Calculator', slug: 'resin-volume-calculator', desc: 'Convert liquid resin volume (milliliters) to mass weight (grams) using precise UV liquid resin density values.' },
      { name: 'Exposure Time Helper', slug: 'exposure-time-helper', desc: 'Determine recommended bottom burn-in and normal layer cure exposure seconds for mono and color LCD screens.' }
    ]
  },
  {
    name: 'HueForge & Bambu Lab Multi-Color / AMS',
    iconName: 'Printer',
    shortTag: 'Multi-Color & AMS',
    summary: 'Advanced tools for layered filament painting, Transmission Distance (TD) calculations, AMS color slot mapping, and purge waste minimization.',
    tools: [
      { name: 'Filament Art Maker', slug: 'filament-art-maker', desc: 'Turn any image into layered 3D printable filament art — free, private, and directly in your browser.' },
      { name: 'HueForge Filament Calculator', slug: 'hueforge-filament-calculator', desc: 'Calculate layer boundaries and transmission distances (TD) for blended filament painting projects.' },
      { name: 'HueForge Layer Calculator', slug: 'hueforge-layer-calculator', desc: 'Determine exact layer number indices from physical millimeter heights for manual or slicer color swap pauses.' },
      { name: 'HueForge Color Swap Planner', slug: 'hueforge-color-swap-planner', desc: 'Plan color swaps and generate step-by-step layer height change instructions for multicolor HueForge art.' },
      { name: 'AMS Filament Planner', slug: 'ams-filament-planner', desc: 'Organize slot colors and filament roll assignments across multi-unit Bambu Lab AMS assemblies.' },
      { name: 'Filament Change Estimator', slug: 'filament-change-estimator', desc: 'Estimate total print time added by AMS filament retractions, cutting cycles, and nozzle purge flushes.' },
      { name: 'Purge Waste Calculator', slug: 'purge-waste-calculator', desc: 'Calculate plastic mass wasted in purge towers and purge poop chutes during multi-color 3D prints.' },
      { name: 'Flush Volume Calculator', slug: 'flush-volume-calculator', desc: 'Calculate optimized purge flush multiplier volumes for dark-to-light transitions to eliminate color bleed.' },
      { name: 'AMS Slot Planner', slug: 'ams-slot-planner', desc: 'Map model color IDs, support interface slots, and backup spools across Bambu Lab X1C, P1S, and A1 AMS units.' }
    ]
  }
];

const clusterIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Layers': Layers,
  'IndianRupee': IndianRupee,
  'Gauge': Gauge,
  'Box': Box,
  'Droplet': Droplet,
  'Printer': Printer
};

const featuredSlugs = [
  '3d-printing-cost-calculator',
  'filament-cost-calculator',
  'volumetric-flow-calculator',
  'print-profit-calculator',
  'remaining-filament-calculator',
  'purge-waste-calculator'
];

const stats = [
  { value: '40+', label: 'Calculators & Tools', desc: 'Filament, time, flow, resin & cost' },
  { value: '6', label: 'Topic Clusters', desc: 'From FDM slicing to AMS multi-color' },
  { value: '100%', label: 'Client-Side Privacy', desc: 'Local processing, zero file uploads' },
  { value: '0ms', label: 'Instant Calculations', desc: 'Fast, ad-free & no account required' }
];

const FILAMENT_PRICE_GUIDE: Record<string, Array<{ brand: string; price: number }>> = {
  pla: [
    { brand: 'Wol3D (Eco PLA)', price: 850 },
    { brand: 'Creality (Value PLA)', price: 1050 },
    { brand: 'Wol3D (Pro+ PLA)', price: 1100 },
    { brand: 'eSun (PLA+ Premium)', price: 1350 }
  ],
  abs: [
    { brand: 'Generic Economy ABS', price: 800 },
    { brand: 'Wol3D Standard ABS', price: 950 },
    { brand: 'Creality Value ABS', price: 1150 },
    { brand: 'eSun Premium ABS+', price: 1250 }
  ],
  petg: [
    { brand: 'Generic Economy PETG', price: 900 },
    { brand: 'Wol3D Standard PETG', price: 1100 },
    { brand: 'Creality Value PETG', price: 1200 },
    { brand: 'eSun Premium PETG', price: 1400 }
  ],
  asa: [
    { brand: 'Generic Import ASA', price: 1500 },
    { brand: 'Creality Standard ASA', price: 1850 },
    { brand: 'Wol3D Professional ASA', price: 1900 },
    { brand: 'eSun High-Performance ASA', price: 2100 }
  ],
  cf: [
    { brand: 'Generic CF-PETG Spool', price: 2100 },
    { brand: 'Wol3D CF-PLA Spool', price: 2400 },
    { brand: 'Creality CF-PLA Spool', price: 2600 },
    { brand: 'eSun Premium ePA-CF Spool', price: 2800 }
  ]
};

// 3D Printable Models Preset Definition for Simulator
const PRINTABLE_MODELS = [
  { id: 'cube', name: 'Voron Cube', totalLayers: 200, heightMm: 20, zScale: 1.0 },
  { id: 'benchy', name: '3D Benchy', totalLayers: 320, heightMm: 38, zScale: 1.2 },
  { id: 'vase', name: 'Spiral Vase', totalLayers: 450, heightMm: 50, zScale: 1.4 },
  { id: 'bot', name: 'Toolique Bot', totalLayers: 280, heightMm: 32, zScale: 1.1 }
] as const;

// Custom Filament Colors
const FILAMENT_COLORS = [
  { name: 'Cyan Neon', hex: '#06b6d4', glow: 'rgba(6, 182, 212, 0.4)', text: 'text-cyan-400' },
  { name: 'Bambu Orange', hex: '#f97316', glow: 'rgba(249, 115, 22, 0.4)', text: 'text-orange-400' },
  { name: 'Cyber Purple', hex: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)', text: 'text-purple-400' },
  { name: 'Emerald Silk', hex: '#10b981', glow: 'rgba(16, 185, 129, 0.4)', text: 'text-emerald-400' },
  { name: 'Solar Gold', hex: '#eab308', glow: 'rgba(234, 179, 8, 0.4)', text: 'text-yellow-400' },
  { name: 'Sakura Pink', hex: '#f43f5e', glow: 'rgba(244, 63, 94, 0.4)', text: 'text-rose-400' }
] as const;

// Speed Modes
const SPEED_MODES = [
  { id: 'standard', name: '100% Std', speedMm: 150, flowMm3: 16.5, multiplier: 1 },
  { id: 'sport', name: '166% Sport', speedMm: 250, flowMm3: 24.2, multiplier: 1.66 },
  { id: 'ludicrous', name: '300% Ludicrous', speedMm: 450, flowMm3: 38.0, multiplier: 3.0 }
] as const;

const masterFaqs = [
  {
    q: 'What is Toolique 3D Print Studio?',
    a: 'Toolique 3D Print Studio is a comprehensive suite of 40+ free online 3D printing calculators and utilities designed for makers, 3D printing hobbyists, commercial print farms, and professional workshops. It provides instant, browser-based computations for filament costs, total print pricing, hotend volumetric flow limits, STL model dimensions, liquid resin exposure times, and Bambu Lab AMS multi-color configurations.'
  },
  {
    q: 'Are all 3D printing calculators on Toolique free to use?',
    a: 'Yes. Every calculator and tool within the 3D Print Studio is 100% free with no subscriptions, premium paywalls, or account registrations required.'
  },
  {
    q: 'How does client-side privacy work for STL files and proprietary models?',
    a: 'All 3D model parsing (such as in the STL Volume Calculator and STL Bounding Box Calculator) executes entirely inside your web browser using HTML5 File API and JavaScript binary readers. Your 3D models and proprietary CAD designs are never uploaded to any remote server or third-party cloud service.'
  },
  {
    q: 'How do I accurately calculate selling prices for 3D printed products?',
    a: 'To calculate an accurate, sustainable selling price for 3D printed items, combine direct raw material costs (grams used × cost per gram), electrical power consumption (hours × machine wattage × kWh rate), machine depreciation ($1–$2 per operating hour), preparation and post-processing labor, packaging costs, and a target gross profit margin (typically 40% to 60% for commercial print farms).'
  },
  {
    q: 'What is volumetric flow rate and why does it cap 3D printing speed?',
    a: 'Volumetric flow rate (measured in mm³/s) defines the maximum volume of molten plastic a hotend can melt and extrude per second. Even if your printer kinematics can move at 500 mm/s, your actual speed ceiling is limited by: Max Speed = Max Volumetric Flow / (Layer Height × Line Width). Exceeding this limit causes extruder gear grinding, clicking, and severe under-extrusion.'
  },
  {
    q: 'How do Bambu Lab AMS tools help minimize purge waste?',
    a: 'Multi-color printing with a single nozzle generates significant purge waste during filament color swaps. Our Bambu Lab tools (Purge Waste Calculator and Flush Volume Calculator) calculate exact purge mass and help optimize dark-to-light flush multipliers, reducing waste plastic by up to 50% without color bleeding.'
  },
  {
    q: 'Can print farm operators use these tools for production planning?',
    a: 'Yes. The Print Farm section includes the Print Farm Revenue Calculator, Machine Utilization Calculator, Monthly Production Calculator, and Print Queue Time Calculator to help farm owners track fleet uptime, forecast batch delivery timelines, and optimize job schedules across multiple 3D printers.'
  },
  {
    q: 'What is HueForge and how do the HueForge calculators work?',
    a: 'HueForge is a filament painting technique that blends colored filaments at micro layer heights using filament translucency (Transmission Distance or TD). Our HueForge calculators compute layer step heights, color swap layer numbers, and TD boundaries so you can configure slicer layer pauses accurately.'
  }
];

export default function ThreeDPrintStudio() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCluster, setActiveCluster] = useState('all');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grouped' | 'list'>('grouped');

  // Interactive 3D Printer Simulation State
  const [printerPower, setPrinterPower] = useState(true);
  const [chamberLight, setChamberLight] = useState(true);
  const [isPrinting, setIsPrinting] = useState(true);
  const [printProgress, setPrintProgress] = useState(46);
  const [selectedModel, setSelectedModel] = useState<typeof PRINTABLE_MODELS[number]>(PRINTABLE_MODELS[0]);
  const [filamentColorIdx, setFilamentColorIdx] = useState(0);
  const [speedMode, setSpeedMode] = useState<typeof SPEED_MODES[number]>(SPEED_MODES[0]);

  // Telemetry dynamics
  const [nozzleTemp, setNozzleTemp] = useState(220);
  const [bedTemp, setBedTemp] = useState(60);
  const [fanSpeed, setFanSpeed] = useState(100);
  const [simX, setSimX] = useState(128.4);
  const [simY, setSimY] = useState(115.2);

  // Indian Filament Price Index State
  const [indexMaterial, setIndexMaterial] = useState<'pla' | 'abs' | 'petg' | 'asa' | 'cf'>('pla');

  const activeFilament = FILAMENT_COLORS[filamentColorIdx];

  // Dynamic simulation loop with speed multiplier
  useEffect(() => {
    if (!printerPower) {
      setNozzleTemp(25);
      setBedTemp(25);
      setFanSpeed(0);
      return;
    }

    if (!isPrinting) {
      const cooldown = setInterval(() => {
        setNozzleTemp(prev => (prev > 32 ? prev - 3 : 28));
        setBedTemp(prev => (prev > 30 ? prev - 1 : 27));
        setFanSpeed(prev => (prev > 0 ? prev - 10 : 0));
      }, 1000);
      return () => clearInterval(cooldown);
    }

    setFanSpeed(100);
    const intervalMs = Math.max(300, Math.floor(1000 / speedMode.multiplier));

    const simTimer = setInterval(() => {
      // Temperature fluctuations around target
      setNozzleTemp(prev => {
        if (prev < 215) return prev + 15;
        return 218 + Math.floor(Math.random() * 5);
      });
      setBedTemp(prev => {
        if (prev < 58) return prev + 4;
        return 59 + Math.floor(Math.random() * 3);
      });

      // Toolhead XY coordinates
      setSimX(+(100 + Math.sin(Date.now() / 300) * 45).toFixed(1));
      setSimY(+(110 + Math.cos(Date.now() / 350) * 35).toFixed(1));

      // Layer Progress
      setPrintProgress(prev => {
        if (prev >= 100) return 0;
        return +(prev + 0.8 * speedMode.multiplier).toFixed(1);
      });
    }, intervalMs);

    return () => clearInterval(simTimer);
  }, [printerPower, isPrinting, speedMode]);

  const currentLayer = Math.min(
    selectedModel.totalLayers,
    Math.max(1, Math.floor((printProgress / 100) * selectedModel.totalLayers))
  );
  const currentZmm = ((printProgress / 100) * selectedModel.heightMm).toFixed(2);

  const allTools = topicClusters.flatMap(c => c.tools.map(t => ({ ...t, cluster: c.name, clusterTag: c.shortTag })));

  const filteredTools = allTools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tool.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCluster = activeCluster === 'all' || tool.cluster === activeCluster;
    return matchesSearch && matchesCluster;
  });

  const featuredTools = allTools.filter(t => featuredSlugs.includes(t.slug));

  const scrollToTools = () => {
    const el = document.getElementById('studio-directory');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Structured Schema for Answer Engine & Generative AI Optimization
  const hubSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': 'https://www.toolique.in/3d-printing-tools#collection',
        'name': 'Free 3D Printing Calculators & Tools Suite | Toolique 3D Print Studio',
        'description': '40+ free online 3D printing calculators for FDM filament cost, print pricing, resin volume, volumetric flow rate, print farm revenue, HueForge, and Bambu Lab AMS.',
        'url': 'https://www.toolique.in/3d-printing-tools',
        'mainEntity': {
          '@type': 'ItemList',
          'name': '3D Printing Tools & Calculators Suite',
          'numberOfItems': allTools.length,
          'itemListElement': allTools.map((tool, index) => ({
            '@type': 'ListItem',
            'position': index + 1,
            'url': `https://www.toolique.in/3d-printing-tools/${tool.slug}`,
            'name': tool.name,
            'description': tool.desc
          }))
        }
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://www.toolique.in/3d-printing-tools#faq',
        'mainEntity': masterFaqs.map(faq => ({
          '@type': 'Question',
          'name': faq.q,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': faq.a
          }
        }))
      },
      {
        '@type': 'BreadcrumbList',
        '@id': 'https://www.toolique.in/3d-printing-tools#breadcrumb',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.toolique.in/' },
          { '@type': 'ListItem', 'position': 2, 'name': '3D Printing Tools', 'item': 'https://www.toolique.in/3d-printing-tools' }
        ]
      }
    ]
  };

  // Calculate dynamic model height in SVG
  const normalizedHeight = Math.min(1, Math.max(0.05, printProgress / 100));
  const maxModelHeightPx = 36 * selectedModel.zScale;
  const currentModelHeightPx = maxModelHeightPx * normalizedHeight;
  const topFaceY = 140 - currentModelHeightPx;

  return (
    <div className="bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 md:p-12 space-y-16 mt-4 relative overflow-hidden">
      {/* CSS Animation Injection */}
      <style>{`
        .dot-matrix {
          background-image: radial-gradient(circle, rgba(148, 163, 184, 0.08) 1px, transparent 1px);
          background-size: 24px 24px;
        }
        .dark .dot-matrix {
          background-image: radial-gradient(circle, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
        }
        
        @keyframes toolheadMove {
          0% { transform: translate(0px, 0px); }
          20% { transform: translate(24px, -6px); }
          40% { transform: translate(12px, 14px); }
          60% { transform: translate(-18px, 8px); }
          80% { transform: translate(-8px, -12px); }
          100% { transform: translate(0px, 0px); }
        }
        
        @keyframes bedHeatWave {
          0%, 100% { stroke: rgba(245, 158, 11, 0.2); }
          50% { stroke: rgba(239, 68, 68, 0.7); }
        }
        
        @keyframes activeLayerShimmer {
          0%, 100% { opacity: 0.8; filter: drop-shadow(0 0 4px var(--fil-glow)); }
          50% { opacity: 1; filter: drop-shadow(0 0 10px var(--fil-glow)); }
        }
        
        @keyframes fanSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes spoolSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes particlePulse {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.6); opacity: 1; filter: drop-shadow(0 0 6px #f59e0b); }
        }
        
        .anim-toolhead {
          animation: toolheadMove ${4 / speedMode.multiplier}s infinite cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .anim-bed-heat {
          animation: bedHeatWave 2.5s infinite ease-in-out;
        }
        
        .anim-layer-shimmer {
          animation: activeLayerShimmer 1.2s infinite ease-in-out;
        }
        
        .anim-fan-spin {
          animation: fanSpin ${0.6 / speedMode.multiplier}s infinite linear;
          transform-origin: center;
        }
        
        .anim-spool-spin {
          animation: spoolSpin ${8 / speedMode.multiplier}s infinite linear;
          transform-origin: 165px 42px;
        }
        
        .anim-spark {
          animation: particlePulse 1s infinite ease-in-out;
        }
      `}</style>

      {/* Grid Pattern Backdrop */}
      <div className="absolute inset-0 dot-matrix pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)]" />
      <div className="absolute top-[-10%] left-[20%] w-[320px] h-[320px] bg-cyan-500/[0.05] dark:bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] w-[300px] h-[300px] bg-indigo-500/[0.05] dark:bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <SEO
        title="Free 3D Printing Calculators & Tools Suite | Toolique 3D Print Studio"
        description="40+ free online 3D printing calculators for FDM filament cost, print pricing, resin volume, volumetric flow rate, print farm revenue, HueForge, and Bambu Lab AMS."
        keywords={[
          '3D printing calculator',
          'filament cost calculator',
          '3D print pricing calculator',
          'volumetric flow calculator',
          'print farm calculator',
          'Bambu Lab AMS tools',
          'HueForge calculator',
          'resin volume calculator',
          'STL volume calculator'
        ]}
        canonicalUrl="https://www.toolique.in/3d-printing-tools"
        schemaMarkup={hubSchema}
      />

      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center pt-4 relative z-10 max-w-6xl mx-auto">
        {/* Left Column: Title & Price Index */}
        <div className="lg:col-span-6 text-left space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-[10px] font-extrabold uppercase tracking-wider text-cyan-700 dark:text-cyan-300 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
            <span>40+ Free 3D Printing Calculators & Toolkits</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.1] bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 dark:from-cyan-400 dark:via-indigo-400 dark:to-purple-400">
            3D Printing Tools & Calculation Suite
          </h1>

          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-xl">
            Professional browser-based calculators engineered for makers, hobbyists, and print farms. Calculate filament costs, total selling prices, volumetric flow ceilings, liquid resin curing, and Bambu Lab AMS multi-color setups.
          </p>

          {/* India Filament Price Index */}
          <div className="p-4.5 sm:p-5 rounded-2xl bg-zinc-50/60 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 backdrop-blur-md space-y-3.5 text-left shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                <span>India Filament Price Benchmark Index</span>
              </span>
              <span className="text-[9px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">Live Rates</span>
            </div>

            {/* Price Index Tabs */}
            <div className="grid grid-cols-5 gap-1.5">
              {(['pla', 'abs', 'petg', 'asa', 'cf'] as const).map(mat => {
                const isSelected = indexMaterial === mat;
                return (
                  <button
                    key={mat}
                    onClick={() => setIndexMaterial(mat)}
                    className={`py-1.5 px-1 rounded-lg border text-[10px] font-bold tracking-wider uppercase transition cursor-pointer text-center ${
                      isSelected
                        ? 'border-indigo-500/80 bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 shadow-xs'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-950/40 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    {mat}
                  </button>
                );
              })}
            </div>

            {/* Price Table Listings */}
            <div className="space-y-1.5 pt-1">
              {FILAMENT_PRICE_GUIDE[indexMaterial].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 px-3 rounded-xl bg-white/80 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800/40 text-[11px] font-semibold">
                  <span className="text-zinc-800 dark:text-zinc-200">{item.brand}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400">₹{item.price} / kg</span>
                    <Link
                      to={`/3d-printing-tools/3d-printing-cost-calculator?price=${item.price}&material=${indexMaterial}`}
                      className="px-2 py-0.5 rounded bg-indigo-500/10 hover:bg-indigo-600 hover:text-white text-indigo-600 dark:text-indigo-400 text-[9px] font-extrabold transition cursor-pointer"
                    >
                      Calculate
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[9px] font-medium text-zinc-400 dark:text-zinc-500 text-center">
              Load rates directly inside the <Link to="/3d-printing-tools/3d-printing-cost-calculator" className="text-indigo-500 hover:underline font-bold">3D Printing Cost Calculator</Link> to build precise quotations.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={scrollToTools}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-extrabold text-xs tracking-wider uppercase shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
            >
              <span>Explore All 40 Tools</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              to="/3d-printing-tools/filament-art-maker"
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-200 hover:border-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-400 font-bold text-xs tracking-wider uppercase transition"
            >
              <Sparkles className="w-4 h-4 text-cyan-500" />
              <span>Filament Art Maker</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Advanced Interactive 3D Printer Simulation & OLED Deck */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div
            className="relative w-full rounded-3xl border border-zinc-200 dark:border-zinc-800/90 bg-gradient-to-b from-zinc-50/90 via-zinc-100/50 to-zinc-50/90 dark:from-zinc-900/90 dark:via-zinc-950/80 dark:to-zinc-900/90 p-5 shadow-2xl overflow-hidden backdrop-blur-xl"
            style={{ '--fil-glow': activeFilament.glow } as React.CSSProperties}
          >
            {/* Ambient Lighting glow from active filament & chamber light */}
            {chamberLight && printerPower && (
              <div
                className="absolute top-0 left-1/4 w-1/2 h-32 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-500"
                style={{ backgroundColor: activeFilament.hex }}
              />
            )}

            {/* Top Interactive Customization Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3.5 mb-3.5 text-left">
              {/* Model Preset Selector */}
              <div className="flex items-center gap-1 bg-white/80 dark:bg-zinc-900/80 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <span className="text-[9px] font-extrabold uppercase px-2 text-zinc-400">Model:</span>
                {PRINTABLE_MODELS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedModel(m);
                      setPrintProgress(20);
                    }}
                    className={`px-2 py-1 rounded-lg text-[9px] font-bold transition cursor-pointer ${
                      selectedModel.id === m.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>

              {/* Filament Color Swatches */}
              <div className="flex items-center gap-1.5 bg-white/80 dark:bg-zinc-900/80 px-2 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <Palette className="w-3 h-3 text-zinc-400 mr-0.5" />
                {FILAMENT_COLORS.map((col, idx) => (
                  <button
                    key={col.name}
                    onClick={() => setFilamentColorIdx(idx)}
                    title={col.name}
                    className={`w-3.5 h-3.5 rounded-full transition-transform cursor-pointer border ${
                      filamentColorIdx === idx
                        ? 'scale-125 border-white dark:border-zinc-200 shadow-sm ring-2 ring-indigo-500/50'
                        : 'border-transparent opacity-80 hover:opacity-100 hover:scale-110'
                    }`}
                    style={{ backgroundColor: col.hex }}
                  />
                ))}
              </div>
            </div>

            {/* Simulator Main Stage: SVG Printer + High-Tech OLED HUD */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Left Stage: Detailed SVG 3D Printer Animation (7 cols) */}
              <div className="md:col-span-7 aspect-square w-full max-w-[240px] md:max-w-none mx-auto relative flex items-center justify-center">
                <svg
                  viewBox="0 0 220 220"
                  className={`w-full h-full transition duration-500 ${
                    printerPower ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-300 dark:text-zinc-800 opacity-50'
                  }`}
                >
                  <defs>
                    {/* Chamber Light Cone */}
                    <linearGradient id="chamberBeam" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity={chamberLight && printerPower ? "0.35" : "0"} />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                    </linearGradient>

                    {/* Heated Bed Heatmap Gradient */}
                    <linearGradient id="bedHeatGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                      <stop offset="50%" stopColor="#ef4444" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.4" />
                    </linearGradient>

                    {/* Active Laser / Molten Filament Beam */}
                    <linearGradient id="extrusionBeam" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="1" />
                      <stop offset="40%" stopColor={activeFilament.hex} stopOpacity="0.9" />
                      <stop offset="100%" stopColor={activeFilament.hex} stopOpacity="0.2" />
                    </linearGradient>

                    {/* Toolhead Shadow Filter */}
                    <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="2" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* 1. CoreXY Chassis Enclosure (Aluminum T-Slot 2020 Frame) */}
                  <rect x="25" y="25" width="170" height="170" rx="10" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.4" />
                  <rect x="23" y="23" width="174" height="174" rx="12" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.2" strokeDasharray="4 2" />

                  {/* Corner Accent Brackets */}
                  <rect x="24" y="24" width="8" height="8" className="fill-zinc-400 dark:fill-zinc-700" />
                  <rect x="188" y="24" width="8" height="8" className="fill-zinc-400 dark:fill-zinc-700" />
                  <rect x="24" y="188" width="8" height="8" className="fill-zinc-400 dark:fill-zinc-700" />
                  <rect x="188" y="188" width="8" height="8" className="fill-zinc-400 dark:fill-zinc-700" />

                  {/* Dual Z-Axis Precision Lead Screws */}
                  <line x1="38" y1="35" x2="38" y2="180" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.5" />
                  <line x1="182" y1="35" x2="182" y2="180" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.5" />

                  {/* 2. Top Mounted Spool Holder & Rotating Filament Spool */}
                  <line x1="110" y1="18" x2="165" y2="42" stroke="currentColor" strokeWidth="2" />
                  <g className={printerPower && isPrinting ? 'anim-spool-spin' : ''}>
                    {/* Outer Spool Rim */}
                    <circle cx="165" cy="42" r="18" className="fill-zinc-200 dark:fill-zinc-850 stroke-zinc-400 dark:stroke-zinc-600" strokeWidth="2" />
                    {/* Wounded Filament Coils */}
                    <circle cx="165" cy="42" r="14" fill="none" stroke={activeFilament.hex} strokeWidth="4" strokeDasharray="14 4" opacity="0.9" />
                    {/* Center Spool Hub Core */}
                    <circle cx="165" cy="42" r="6" className="fill-zinc-400 dark:fill-zinc-950 stroke-zinc-500 dark:stroke-zinc-700" strokeWidth="1.5" />
                    {/* Spool Windows */}
                    <line x1="153" y1="42" x2="177" y2="42" stroke="currentColor" strokeWidth="1" opacity="0.4" />
                    <line x1="165" y1="30" x2="165" y2="54" stroke="currentColor" strokeWidth="1" opacity="0.4" />
                  </g>

                  {/* Flexible Bowden Tube / Filament Line Feeding into Printhead */}
                  <path
                    d="M 165,42 Q 130,22 110,65"
                    fill="none"
                    stroke={activeFilament.hex}
                    strokeWidth="1.5"
                    strokeDasharray={printerPower && isPrinting ? "3 1.5" : "none"}
                    opacity="0.8"
                  />

                  {/* 3. Chamber Light Overhead Flood Beam */}
                  {chamberLight && printerPower && (
                    <polygon
                      points="35,28 185,28 175,150 45,150"
                      fill="url(#chamberBeam)"
                      className="pointer-events-none mix-blend-screen transition-opacity duration-300"
                    />
                  )}

                  {/* 4. Magnetic Textured Spring Steel Heated Bed (Isometric Perspective) */}
                  <g className="transition-all duration-300">
                    {/* Bed Support Stiffeners */}
                    <polygon points="45,148 110,120 175,148 110,176" className="fill-zinc-300 dark:fill-zinc-900 stroke-zinc-400 dark:stroke-zinc-800" strokeWidth="1" />
                    
                    {/* Heated PEI Plate Top Surface */}
                    <polygon
                      points="48,146 110,122 172,146 110,170"
                      className={`transition-all duration-300 ${
                        printerPower && bedTemp > 35
                          ? 'fill-amber-500/10 dark:fill-amber-500/15 stroke-amber-500/50 anim-bed-heat'
                          : 'fill-zinc-100 dark:fill-zinc-950/80 stroke-zinc-300 dark:stroke-zinc-800'
                      }`}
                      strokeWidth="1.5"
                    />

                    {/* Bed Alignment Grid Matrix */}
                    <polygon points="62,146 110,127 158,146 110,165" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.3" strokeDasharray="3 3" />
                    
                    {/* Front Pull Notch Tab */}
                    <polygon points="104,170 116,170 113,174 107,174" className="fill-amber-500 stroke-amber-600" strokeWidth="0.5" />
                  </g>

                  {/* 5. Dynamic 3D Model Building (Layers Grow from Bed) */}
                  {printerPower && (
                    <g className="transition-all duration-200" style={{ filter: `drop-shadow(0 4px 10px ${activeFilament.glow})` }}>
                      {/* Base Solid Layers (Printed Material) */}
                      {selectedModel.id === 'cube' && (
                        <g>
                          {/* Bottom facet */}
                          <polygon
                            points={`85,146 110,136 135,146 110,156`}
                            fill={activeFilament.hex}
                            fillOpacity="0.3"
                            stroke={activeFilament.hex}
                            strokeWidth="1"
                          />
                          {/* Left Wall */}
                          <polygon
                            points={`85,146 85,${topFaceY + 6} 110,${topFaceY + 16} 110,156`}
                            fill={activeFilament.hex}
                            fillOpacity="0.6"
                            stroke={activeFilament.hex}
                            strokeWidth="1"
                          />
                          {/* Right Wall */}
                          <polygon
                            points={`110,156 110,${topFaceY + 16} 135,${topFaceY + 6} 135,146`}
                            fill={activeFilament.hex}
                            fillOpacity="0.4"
                            stroke={activeFilament.hex}
                            strokeWidth="1"
                          />
                          {/* Active Top Sliced Layer (Glowing Hot Cross-Section) */}
                          <polygon
                            points={`85,${topFaceY + 6} 110,${topFaceY - 4} 135,${topFaceY + 6} 110,${topFaceY + 16}`}
                            fill={activeFilament.hex}
                            fillOpacity="0.85"
                            stroke="#ffffff"
                            strokeWidth="1.5"
                            className={isPrinting ? 'anim-layer-shimmer' : ''}
                          />
                          {/* Voron Infill Grid Lines on Top Layer */}
                          <line x1="97" y1={topFaceY + 1} x2="123" y2={topFaceY + 11} stroke="#ffffff" strokeWidth="0.8" opacity="0.7" />
                          <line x1="97" y1={topFaceY + 11} x2="123" y2={topFaceY + 1} stroke="#ffffff" strokeWidth="0.8" opacity="0.7" />
                        </g>
                      )}

                      {selectedModel.id === 'benchy' && (
                        <g>
                          {/* Benchy Boat Hull Isometric Body */}
                          <polygon
                            points={`75,146 110,132 145,146 110,158`}
                            fill={activeFilament.hex}
                            fillOpacity="0.35"
                            stroke={activeFilament.hex}
                            strokeWidth="1"
                          />
                          <polygon
                            points={`75,146 80,${topFaceY + 8} 110,${topFaceY + 16} 110,158`}
                            fill={activeFilament.hex}
                            fillOpacity="0.65"
                            stroke={activeFilament.hex}
                            strokeWidth="1"
                          />
                          <polygon
                            points={`110,158 110,${topFaceY + 16} 140,${topFaceY + 8} 145,146`}
                            fill={activeFilament.hex}
                            fillOpacity="0.45"
                            stroke={activeFilament.hex}
                            strokeWidth="1"
                          />
                          {/* Cabin & Deck top slice */}
                          <polygon
                            points={`80,${topFaceY + 8} 110,${topFaceY - 4} 140,${topFaceY + 8} 110,${topFaceY + 16}`}
                            fill={activeFilament.hex}
                            fillOpacity="0.9"
                            stroke="#ffffff"
                            strokeWidth="1.5"
                            className={isPrinting ? 'anim-layer-shimmer' : ''}
                          />
                        </g>
                      )}

                      {selectedModel.id === 'vase' && (
                        <g>
                          {/* Cylindrical / Polygon Vase Body */}
                          <polygon
                            points={`80,146 110,134 140,146 110,158`}
                            fill={activeFilament.hex}
                            fillOpacity="0.25"
                            stroke={activeFilament.hex}
                            strokeWidth="1"
                          />
                          <polygon
                            points={`80,146 88,${topFaceY + 4} 110,${topFaceY + 14} 110,158`}
                            fill={activeFilament.hex}
                            fillOpacity="0.55"
                            stroke={activeFilament.hex}
                            strokeWidth="1"
                          />
                          <polygon
                            points={`110,158 110,${topFaceY + 14} 132,${topFaceY + 4} 140,146`}
                            fill={activeFilament.hex}
                            fillOpacity="0.4"
                            stroke={activeFilament.hex}
                            strokeWidth="1"
                          />
                          {/* Spiral Top Rim */}
                          <polygon
                            points={`88,${topFaceY + 4} 110,${topFaceY - 6} 132,${topFaceY + 4} 110,${topFaceY + 14}`}
                            fill={activeFilament.hex}
                            fillOpacity="0.95"
                            stroke="#ffffff"
                            strokeWidth="1.5"
                            className={isPrinting ? 'anim-layer-shimmer' : ''}
                          />
                        </g>
                      )}

                      {selectedModel.id === 'bot' && (
                        <g>
                          {/* Robot Base & Body */}
                          <polygon
                            points={`82,146 110,135 138,146 110,157`}
                            fill={activeFilament.hex}
                            fillOpacity="0.3"
                            stroke={activeFilament.hex}
                            strokeWidth="1"
                          />
                          <polygon
                            points={`82,146 86,${topFaceY + 6} 110,${topFaceY + 16} 110,157`}
                            fill={activeFilament.hex}
                            fillOpacity="0.65"
                            stroke={activeFilament.hex}
                            strokeWidth="1"
                          />
                          <polygon
                            points={`110,157 110,${topFaceY + 16} 134,${topFaceY + 6} 138,146`}
                            fill={activeFilament.hex}
                            fillOpacity="0.45"
                            stroke={activeFilament.hex}
                            strokeWidth="1"
                          />
                          {/* Top Antenna Head Slice */}
                          <polygon
                            points={`86,${topFaceY + 6} 110,${topFaceY - 4} 134,${topFaceY + 6} 110,${topFaceY + 16}`}
                            fill={activeFilament.hex}
                            fillOpacity="0.9"
                            stroke="#ffffff"
                            strokeWidth="1.5"
                            className={isPrinting ? 'anim-layer-shimmer' : ''}
                          />
                        </g>
                      )}
                    </g>
                  )}

                  {/* 6. Precision Toolhead Gantry & Printhead Assembly */}
                  <g className={printerPower && isPrinting ? 'anim-toolhead' : ''}>
                    {/* Carbon Fiber X-Gantry Cross Rail */}
                    <line x1="26" y1={Math.max(45, topFaceY - 14)} x2="194" y2={Math.max(45, topFaceY - 14)} stroke="currentColor" strokeWidth="2.5" opacity="0.6" />
                    <line x1="26" y1={Math.max(45, topFaceY - 12)} x2="194" y2={Math.max(45, topFaceY - 12)} stroke="#6366f1" strokeWidth="0.8" opacity="0.8" />

                    {/* Toolhead Extruder Housing */}
                    <g transform={`translate(0, ${Math.max(0, topFaceY - 95)})`}>
                      {/* Main Body Chassis */}
                      <rect x="92" y="66" width="36" height="24" rx="4" className="fill-zinc-900 stroke-zinc-700 dark:fill-zinc-800 dark:stroke-zinc-600 shadow-xl" strokeWidth="1.5" />
                      
                      {/* Carbon Fiber Faceplate Inset */}
                      <rect x="96" y="70" width="28" height="12" rx="2" className="fill-zinc-950 stroke-zinc-800" strokeWidth="1" />
                      
                      {/* RGB Status LED Light (Bambu Style) */}
                      <circle
                        cx="101"
                        cy="76"
                        r="2.5"
                        fill={printerPower ? (nozzleTemp > 210 ? activeFilament.hex : '#f59e0b') : '#ef4444'}
                        className={isPrinting && printerPower ? 'animate-pulse' : ''}
                      />
                      
                      {/* Dual 4010 Part Cooling Fan Grilles with Spinning Blades */}
                      <circle cx="115" cy="76" r="4.5" className="fill-zinc-900 stroke-zinc-700" strokeWidth="0.8" />
                      <g className={printerPower && isPrinting ? 'anim-fan-spin' : ''} style={{ transformOrigin: '115px 76px' }}>
                        <line x1="112" y1="76" x2="118" y2="76" stroke="currentColor" strokeWidth="0.8" opacity="0.8" />
                        <line x1="115" y1="73" x2="115" y2="79" stroke="currentColor" strokeWidth="0.8" opacity="0.8" />
                      </g>

                      {/* Hotend Heatblock (Brass / Copper) */}
                      <rect x="105" y="90" width="10" height="4" rx="1" className="fill-amber-600 dark:fill-amber-500" />

                      {/* Hardened Steel / Brass Nozzle Tip */}
                      <polygon points="107,94 113,94 110,101" className="fill-amber-400 dark:fill-amber-300 stroke-amber-600" strokeWidth="0.5" />

                      {/* Active Extrusion Molten Plastic Bead & Deposition Sparks */}
                      {printerPower && isPrinting && (
                        <g>
                          {/* Molten Filament Flow Jet */}
                          <line x1="110" y1="101" x2="110" y2="124" stroke="url(#extrusionBeam)" strokeWidth="2" strokeLinecap="round" />
                          
                          {/* Nozzle Contact Point Sparkle */}
                          <circle cx="110" cy="101" r="2.5" fill="#f59e0b" className="anim-spark" />
                          <circle cx="110" cy="122" r="2" fill={activeFilament.hex} className="anim-spark" />
                        </g>
                      )}
                    </g>
                  </g>
                </svg>
              </div>

              {/* Right Stage: Glassmorphic OLED Telemetry Deck & HUD (5 cols) */}
              <div className="md:col-span-5 space-y-3 text-left">
                {/* OLED Display Box */}
                <div
                  className={`p-4 rounded-2xl border font-mono text-[10px] tracking-tight leading-snug space-y-2 relative overflow-hidden transition-all duration-300 shadow-xl ${
                    printerPower
                      ? 'bg-zinc-950/95 border-zinc-800 text-zinc-200 shadow-emerald-500/5'
                      : 'bg-zinc-950 border-zinc-900 text-zinc-700 shadow-none'
                  }`}
                >
                  {/* Status Header Badge */}
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                    <div className="flex items-center gap-1.5 font-bold">
                      <div className={`w-2 h-2 rounded-full ${printerPower ? (isPrinting ? 'bg-emerald-400 animate-ping' : 'bg-amber-400') : 'bg-red-500'}`} />
                      <span className={printerPower ? 'text-emerald-400' : 'text-zinc-600'}>
                        {printerPower ? (isPrinting ? 'PRINTING' : 'STANDBY') : 'OFFLINE'}
                      </span>
                    </div>
                    <span className="text-[9px] text-zinc-500 font-bold tracking-wider uppercase">
                      {selectedModel.name}
                    </span>
                  </div>

                  {/* Live Telemetry Grid */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {/* Nozzle Temperature */}
                    <div className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800/80 space-y-0.5">
                      <div className="text-[8px] uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-orange-400" />
                        <span>Nozzle</span>
                      </div>
                      <div className="text-xs font-bold text-orange-400">
                        {printerPower ? `${nozzleTemp}°C` : '---'}
                        <span className="text-[9px] text-zinc-500 font-normal ml-1">/ 220°</span>
                      </div>
                    </div>

                    {/* Bed Temperature */}
                    <div className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800/80 space-y-0.5">
                      <div className="text-[8px] uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-amber-400" />
                        <span>Bed</span>
                      </div>
                      <div className="text-xs font-bold text-amber-400">
                        {printerPower ? `${bedTemp}°C` : '---'}
                        <span className="text-[9px] text-zinc-500 font-normal ml-1">/ 60°</span>
                      </div>
                    </div>

                    {/* Speed & Volumetric Flow */}
                    <div className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800/80 space-y-0.5">
                      <div className="text-[8px] uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                        <Gauge className="w-3 h-3 text-cyan-400" />
                        <span>Flow Rate</span>
                      </div>
                      <div className="text-xs font-bold text-cyan-400">
                        {printerPower && isPrinting ? `${speedMode.flowMm3} mm³/s` : '0.0 mm³/s'}
                      </div>
                    </div>

                    {/* Fan RPM */}
                    <div className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800/80 space-y-0.5">
                      <div className="text-[8px] uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                        <Fan className="w-3 h-3 text-blue-400" />
                        <span>Part Fan</span>
                      </div>
                      <div className="text-xs font-bold text-blue-400">
                        {printerPower && isPrinting ? `${fanSpeed}% (8.4k)` : '0%'}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar & Layer Counter */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[9px] font-bold text-zinc-400">
                      <span>Layer {printerPower ? `${currentLayer}/${selectedModel.totalLayers}` : '0/0'} (Z: {currentZmm}mm)</span>
                      <span className={activeFilament.text}>{printProgress}%</span>
                    </div>
                    {/* Glowing Progress Track */}
                    <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${printerPower ? printProgress : 0}%`,
                          backgroundColor: activeFilament.hex,
                          boxShadow: `0 0 10px ${activeFilament.glow}`
                        }}
                      />
                    </div>
                  </div>

                  {/* Kinematics Coordinate HUD */}
                  <div className="flex justify-between items-center text-[8px] text-zinc-500 pt-0.5 border-t border-zinc-900">
                    <span>POS: X:{simX} Y:{simY}</span>
                    <span className="flex items-center gap-1 text-zinc-400">
                      <Activity className="w-2.5 h-2.5 text-indigo-400" />
                      <span>{speedMode.name}</span>
                    </span>
                  </div>
                </div>

                {/* Speed Mode Multiplier Selector */}
                <div className="grid grid-cols-3 gap-1 bg-white/60 dark:bg-zinc-900/50 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 text-center">
                  {SPEED_MODES.map(sm => (
                    <button
                      key={sm.id}
                      onClick={() => setSpeedMode(sm)}
                      className={`py-1 rounded-lg text-[9px] font-extrabold transition cursor-pointer ${
                        speedMode.id === sm.id
                          ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-xs'
                          : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      {sm.name}
                    </button>
                  ))}
                </div>

                {/* Hardware Toggle Buttons Deck */}
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => {
                      setPrinterPower(!printerPower);
                      if (printerPower) {
                        setChamberLight(false);
                        setIsPrinting(false);
                      } else {
                        setIsPrinting(true);
                      }
                    }}
                    className={`py-2 px-2 rounded-xl border text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                      printerPower
                        ? 'border-red-500/30 hover:border-red-500 bg-red-500/10 text-red-600 dark:text-red-400 shadow-xs'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{printerPower ? 'Kill' : 'Power'}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (!printerPower) return;
                      setIsPrinting(!isPrinting);
                    }}
                    disabled={!printerPower}
                    className={`py-2 px-2 rounded-xl border text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                      isPrinting
                        ? 'border-amber-500/30 hover:border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : 'border-emerald-500/30 hover:border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {isPrinting ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPrinting ? 'Pause' : 'Resume'}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (!printerPower) return;
                      setChamberLight(!chamberLight);
                    }}
                    disabled={!printerPower}
                    className={`py-2 px-2 rounded-xl border text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                      chamberLight
                        ? 'border-yellow-500/40 hover:border-yellow-500 bg-yellow-500/15 text-yellow-700 dark:text-yellow-300 shadow-xs'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-500'
                    }`}
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Light</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Badges */}
          <div className="grid grid-cols-2 gap-2 text-left">
            {stats.map((stat, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 space-y-0.5 shadow-xs">
                <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">{stat.value}</span>
                <h4 className="text-[9px] font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">{stat.label}</h4>
                <p className="text-[8px] text-zinc-500 dark:text-zinc-400 font-medium leading-tight">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tools Section */}
      <section className="space-y-6 relative z-10 text-left max-w-6xl mx-auto">
        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3 flex justify-between items-center">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">Popular Maker Calculators</h2>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold mt-0.5">Most frequently used calculation utilities across FDM & AMS setups</p>
          </div>
          <span className="text-[9px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider bg-zinc-100 dark:bg-zinc-900 px-2.5 py-1 rounded-full">Top 6</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredTools.map((tool) => (
            <Link
              key={tool.slug}
              to={`/3d-printing-tools/${tool.slug}`}
              className="group p-5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 hover:border-cyan-500/40 hover:bg-white dark:hover:bg-zinc-900/80 hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                    {tool.clusterTag}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition">
                  {tool.name}
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                  {tool.desc}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60 text-[9px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <span>Launch Calculator</span>
                <span>&rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Directory Section Header & 6 Topic Clusters */}
      <section id="studio-directory" className="space-y-8 pt-6 relative z-10 text-left max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">All 40 3D Printing Tools & Clusters</h2>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold mt-0.5">Organized across 6 specialized engineering and production clusters</p>
          </div>

          {/* Dual-View Mode Toggles */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setViewMode('grouped')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                viewMode === 'grouped'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs border border-zinc-200 dark:border-zinc-700'
                  : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Topic Clusters</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs border border-zinc-200 dark:border-zinc-700'
                  : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Filter & Search</span>
            </button>
          </div>
        </div>

        {/* View Mode 1: 6 Topic Clusters View */}
        {viewMode === 'grouped' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topicClusters.map((cluster) => {
              const IconComponent = clusterIcons[cluster.iconName] || Box;
              return (
                <div
                  key={cluster.name}
                  className="group p-6 rounded-2xl bg-zinc-50/60 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/40 hover:bg-white dark:hover:bg-zinc-900/70 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Cluster Header */}
                    <div className="flex items-start justify-between border-b border-zinc-200/60 dark:border-zinc-800/60 pb-3 gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                          <IconComponent className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                            {cluster.name}
                          </h3>
                          <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-semibold">{cluster.shortTag}</span>
                        </div>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 shrink-0">
                        {cluster.tools.length} Tools
                      </span>
                    </div>

                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                      {cluster.summary}
                    </p>

                    {/* Tools Links List */}
                    <div className="space-y-1.5 py-1">
                      {cluster.tools.map((tool) => (
                        <Link
                          key={tool.slug}
                          to={`/3d-printing-tools/${tool.slug}`}
                          className="flex items-start gap-2 group/link py-1 hover:translate-x-1 transition-transform duration-200"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/60 mt-1.5 shrink-0 group-hover/link:scale-150 group-hover/link:bg-indigo-600 transition-all" />
                          <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 group-hover/link:text-indigo-600 dark:group-hover/link:text-indigo-400 transition-colors">
                            {tool.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-4 border-t border-zinc-200/60 dark:border-zinc-800/60 mt-4">
                    <button
                      onClick={() => {
                        setActiveCluster(cluster.name);
                        setViewMode('list');
                        scrollToTools();
                      }}
                      className="w-full py-2 text-[9px] font-bold uppercase tracking-wider border border-indigo-200 dark:border-indigo-900/50 rounded-xl text-center text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-500 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-all cursor-pointer"
                    >
                      Filter {cluster.shortTag} ({cluster.tools.length})
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View Mode 2: Search & Filter Grid */}
        {viewMode === 'list' && (
          <div className="space-y-6">
            {/* Search Input */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 40+ 3D printing calculators (e.g. filament cost, volumetric flow, AMS flush)..."
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white focus:border-cyan-500 focus:outline-none transition shadow-xs"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 justify-center py-2">
              <button
                onClick={() => setActiveCluster('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                  activeCluster === 'all'
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-white shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                All Tools ({allTools.length})
              </button>
              {topicClusters.map(cluster => {
                const isActive = activeCluster === cluster.name;
                return (
                  <button
                    key={cluster.name}
                    onClick={() => setActiveCluster(cluster.name)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-cyan-600 dark:bg-cyan-500 text-white dark:text-zinc-950 border-cyan-600 dark:border-cyan-400 shadow-xs'
                        : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    <span>{cluster.shortTag}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white dark:bg-zinc-950/30 dark:text-zinc-900' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400'}`}>
                      {cluster.tools.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Filtered Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTools.length > 0 ? (
                filteredTools.map((tool) => (
                  <Link
                    key={tool.slug}
                    to={`/3d-printing-tools/${tool.slug}`}
                    className="group p-5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 hover:border-cyan-500/40 hover:bg-white dark:hover:bg-zinc-900/60 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between shadow-xs"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                          {tool.clusterTag}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all" />
                      </div>
                      <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition">
                        {tool.name}
                      </h3>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                        {tool.desc}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60 text-[9px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <span>Open Calculator</span>
                      <span>&rarr;</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-zinc-400 dark:text-zinc-500 font-semibold text-xs">
                  No 3D printing calculators match your search query.
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* 3D Printing Knowledge Base & Engineering Guides (GEO / AEO Content) */}
      <section className="space-y-8 relative z-10 text-left max-w-6xl mx-auto pt-6">
        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3 flex justify-between items-center">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">3D Printing Knowledge Base & Guides</h2>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold mt-0.5">Essential formulas, material density benchmarks, and production physics</p>
          </div>
          <BookOpen className="w-4 h-4 text-cyan-500" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Guide 1: Pricing 3D Prints */}
          <article className="p-6 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
              <DollarSign className="w-4 h-4" />
              <span>Production Economics</span>
            </div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">How to Accurately Price 3D Printed Parts</h3>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
              Commercial print pricing requires accounting for both direct variable costs and fixed overheads. The master formula for quoting custom parts is:
            </p>
            <div className="p-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 font-mono text-[10px] text-indigo-700 dark:text-indigo-300">
              Price = (Material Cost + Electricity + Machine Depreciation + Labor + Packaging) × (1 + Margin)
            </div>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Standard commercial markups range from <strong>40% to 60%</strong> for consumer items, and <strong>80% to 150%</strong> for fast-turnaround rapid prototyping jobs.
            </p>
          </article>

          {/* Guide 2: Volumetric Flow Ceilings */}
          <article className="p-6 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 text-xs font-bold">
              <Gauge className="w-4 h-4" />
              <span>Extrusion Physics</span>
            </div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Understanding Volumetric Flow Ceilings</h3>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
              Print speed settings in your slicer are constrained by your hotend melting capacity. Max volumetric speed governs true toolpath velocity:
            </p>
            <div className="p-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 font-mono text-[10px] text-cyan-700 dark:text-cyan-300">
              Max Speed (mm/s) = Hotend Max Flow (mm³/s) / (Layer Height × Line Width)
            </div>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              A standard V6 hotend supports ~12–15 mm³/s, a Bambu Lab stock hotend reaches ~28–32 mm³/s, and high-flow CHT nozzles achieve 35–45 mm³/s.
            </p>
          </article>

          {/* Guide 3: Multi-Color Purge Optimization */}
          <article className="p-6 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-xs font-bold">
              <Printer className="w-4 h-4" />
              <span>Multi-Color Efficiency</span>
            </div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Minimizing AMS Flush & Purge Waste</h3>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
              Multi-color prints can waste 40% to 70% of total filament in purge blocks and poop chutes. You can minimize waste by:
            </p>
            <ul className="space-y-1 text-[10px] text-zinc-600 dark:text-zinc-400">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Enabling <strong>Flush into Object's Infill</strong> and <strong>Flush into Support</strong> in your slicer.</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Adjusting flush volume matrices for light-to-dark transitions down from 240mm³ to 80mm³.</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Nesting duplicate models on the build plate to amortize purge cycles across multiple units.</span>
              </li>
            </ul>
          </article>

          {/* Guide 4: Material Density Reference Table */}
          <article className="p-6 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-bold">
              <TrendingUp className="w-4 h-4" />
              <span>Material Science</span>
            </div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">3D Printing Polymer Density Benchmarks</h3>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
              Material density (g/cm³) directly affects final printed part weight and spool length:
            </p>
            <div className="grid grid-cols-3 gap-2 text-[10px] font-semibold text-zinc-700 dark:text-zinc-300">
              <div className="p-2 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-center">
                <span className="text-zinc-400 text-[9px] block">PLA / PLA+</span>
                <strong>1.24 g/cm³</strong>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-center">
                <span className="text-zinc-400 text-[9px] block">PETG</span>
                <strong>1.27 g/cm³</strong>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-center">
                <span className="text-zinc-400 text-[9px] block">ABS / ASA</span>
                <strong>1.04–1.07 g/cm³</strong>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-center">
                <span className="text-zinc-400 text-[9px] block">TPU 95A</span>
                <strong>1.21 g/cm³</strong>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-center">
                <span className="text-zinc-400 text-[9px] block">PA-CF (Nylon)</span>
                <strong>1.18 g/cm³</strong>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-center">
                <span className="text-zinc-400 text-[9px] block">UV Resin</span>
                <strong>1.12 g/cm³</strong>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Master FAQ Accordion */}
      <section className="space-y-6 relative z-10 text-left max-w-4xl mx-auto pt-6">
        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3 flex justify-between items-center">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">Frequently Asked Questions</h2>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold mt-0.5">Direct answers to common 3D printing calculation questions</p>
          </div>
          <HelpCircle className="w-4 h-4 text-cyan-500" />
        </div>

        <div className="space-y-3">
          {masterFaqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4.5 flex justify-between items-center text-left text-zinc-800 dark:text-zinc-100 hover:text-cyan-600 dark:hover:text-cyan-400 font-bold text-xs cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 pr-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0" />
                    <span>{faq.q}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-zinc-400 dark:text-zinc-500 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-cyan-500' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4.5 pb-4.5 text-[11px] text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium border-t border-zinc-200/80 dark:border-zinc-800/80 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer Navigation Bar */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-zinc-400 dark:text-zinc-500 font-semibold max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span>Toolique 3D Print Studio</span>
          <span>•</span>
          <span>40 Dedicated Calculators</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/" className="hover:text-cyan-500 transition-colors">Home</Link>
          <Link to="/tools" className="hover:text-cyan-500 transition-colors">All Tools</Link>
          <Link to="/why-toolique" className="hover:text-cyan-500 transition-colors">Why Toolique</Link>
          <a href="#studio-directory" className="hover:text-cyan-500 transition-colors">Back to Top &uarr;</a>
        </div>
      </div>
    </div>
  );
}

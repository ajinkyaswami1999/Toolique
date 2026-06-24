import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  IndianRupee, Layers, Gauge, Disc, Box, Droplet, Truck, Cpu, Paintbrush, Printer,
  Search, HelpCircle, ChevronDown, Sparkles, ArrowRight, Play, Pause, Lightbulb, Power,
  Grid, List, Sliders
} from 'lucide-react';
import SEO from '../components/SEO';

const toolGroups = [
  {
    name: 'Cost & Pricing',
    icon: 'IndianRupee',
    tools: [
      { name: 'Filament Cost Calculator', slug: 'filament-cost-calculator', desc: 'Calculate the exact filament cost of 3D prints based on weight, price, and spool specifications.' },
      { name: '3D Printing Cost Calculator', slug: '3d-printing-cost-calculator', desc: 'Estimate overall cost including filament, electricity, machine wear, and labor markup.' },
      { name: 'Print Profit Calculator', slug: 'print-profit-calculator', desc: 'Determine net earnings, margins, and platform transaction fees for 3D printed sales.' },
      { name: 'Print Farm Revenue Calculator', slug: 'print-farm-revenue-calculator', desc: 'Project daily, monthly, and yearly revenue forecasts for multiple 3D printers.' }
    ]
  },
  {
    name: 'Material Tools',
    icon: 'Layers',
    tools: [
      { name: 'Filament Weight Calculator', slug: 'filament-weight-calculator', desc: 'Convert filament roll length directly to weight based on material densities.' },
      { name: 'Filament Usage Calculator', slug: 'filament-usage-calculator', desc: 'Project total rolls required and cost splits for large multi-part batch orders.' },
      { name: 'Remaining Filament Calculator', slug: 'remaining-filament-calculator', desc: 'Calculate the leftover filament on a spool using tare spool weights.' },
      { name: 'Material Cost Comparison', slug: 'material-cost-comparison', desc: 'Compare running costs per gram across PLA, PETG, ABS, and Nylon.' }
    ]
  },
  {
    name: 'Printing Tools',
    icon: 'Gauge',
    tools: [
      { name: 'Print Time Estimator', slug: 'print-time-estimator', desc: 'Estimate 3D print durations based on print speeds, layer counts, and height.' },
      { name: 'Layer Height Calculator', slug: 'layer-height-calculator', desc: 'Calculate optimal layer heights for vertical detail quality.' },
      { name: 'Print Speed Calculator', slug: 'print-speed-calculator', desc: 'Calculate the actual print travel speed based on segment lengths and times.' },
      { name: 'Nozzle Flow Calculator', slug: 'nozzle-flow-calculator', desc: 'Determine output extrusion volume rates based on printing speed.' },
      { name: 'Volumetric Flow Calculator', slug: 'volumetric-flow-calculator', desc: 'Determine your hotend volumetric flow limit (mm³/s) based on max feedrate.' },
      { name: 'Cooling Fan Recommendation', slug: 'cooling-fan-recommendation', desc: 'Calculate optimal fan percentages for layer adhesion and overhang bridges.' }
    ]
  },
  {
    name: 'Nozzle Tools',
    icon: 'Disc',
    tools: [
      { name: 'Nozzle Size Comparison', slug: 'nozzle-size-comparison', desc: 'Compare print speeds, structural strengths, and resolution details across nozzles.' },
      { name: 'Line Width Calculator', slug: 'line-width-calculator', desc: 'Calculate optimal extrusion line widths for solid layer bonding.' },
      { name: 'Layer Width Calculator', slug: 'layer-width-calculator', desc: 'Determine perimeter wall widths for shell counts.' }
    ]
  },
  {
    name: 'Model Tools',
    icon: 'Box',
    tools: [
      { name: 'STL Volume Calculator', slug: 'stl-volume-calculator', desc: 'Parse STL files locally in your browser to calculate exact cubic volume and mass weight.' },
      { name: 'STL Bounding Box Calculator', slug: 'stl-bounding-box-calculator', desc: 'Calculate the maximum X, Y, Z boundary dimensions of STL models.' },
      { name: 'Scale Calculator', slug: 'scale-calculator', desc: 'Convert model dimensions to different percentages and aspect ratios.' },
      { name: 'Model Weight Calculator', slug: 'model-weight-calculator', desc: 'Find model weights using cubic volumes and material densities.' }
    ]
  },
  {
    name: 'Resin Printing',
    icon: 'Droplet',
    tools: [
      { name: 'Resin Cost Calculator', slug: 'resin-cost-calculator', desc: 'Calculate the liquid UV resin cost for SLA/MSLA 3D prints.' },
      { name: 'Resin Volume Calculator', slug: 'resin-volume-calculator', desc: 'Convert resin volume (ml) to mass weight based on liquid densities.' },
      { name: 'Exposure Time Helper', slug: 'exposure-time-helper', desc: 'Provides recommended bottom and normal layer cure times for LCD printers.' }
    ]
  },
  {
    name: 'Electricity & Shipping',
    icon: 'Truck',
    tools: [
      { name: 'Electricity Cost Calculator', slug: 'electricity-cost-calculator', desc: 'Calculate operational power consumption utility costs for your printers.' },
      { name: 'Packaging Cost Calculator', slug: 'packaging-cost-calculator', desc: 'Calculate cardboard boxes, bubble wraps, and logo labels packaging material costs.' },
      { name: 'Shipping Cost Calculator', slug: 'shipping-cost-calculator', desc: 'Estimate shipping margins and final delivery pricing splits.' }
    ]
  },
  {
    name: 'Print Farm Tools',
    icon: 'Cpu',
    tools: [
      { name: 'Machine Utilization Calculator', slug: 'machine-utilization-calculator', desc: 'Track active machine setups and calculate farm uptime percentages.' },
      { name: 'Monthly Production Calculator', slug: 'monthly-production-calculator', desc: 'Estimate total monthly unit production capacities and yield values.' },
      { name: 'Print Queue Time Calculator', slug: 'print-queue-time-calculator', desc: 'Determine job queue wait times based on farm workloads.' }
    ]
  },
  {
    name: 'HueForge Tools',
    icon: 'Paintbrush',
    tools: [
      { name: 'HueForge Filament Calculator', slug: 'hueforge-filament-calculator', desc: 'Calculate layer boundaries and transmission distances for HueForge painting layers.' },
      { name: 'HueForge Layer Calculator', slug: 'hueforge-layer-calculator', desc: 'Determine layer number indices from physical heights for slicer settings.' },
      { name: 'HueForge Color Swap Planner', slug: 'hueforge-color-swap-planner', desc: 'Plan color swaps listing instructions for HueForge model setups.' }
    ]
  },
  {
    name: 'Bambu Lab Tools',
    icon: 'Printer',
    tools: [
      { name: 'AMS Filament Planner', slug: 'ams-filament-planner', desc: 'Organize slot colors and filament rolls assignments for multi-color AMS assemblies.' },
      { name: 'Filament Change Estimator', slug: 'filament-change-estimator', desc: 'Estimate time added to print runs by AMS filament retracting changes.' },
      { name: 'Purge Waste Calculator', slug: 'purge-waste-calculator', desc: 'Calculate plastic mass waste in purge towers and poop shoots.' },
      { name: 'Flush Volume Calculator', slug: 'flush-volume-calculator', desc: 'Calculate optimized purge flushes for dark-to-light filament changes.' },
      { name: 'AMS Slot Planner', slug: 'ams-slot-planner', desc: 'Map color and support interface slots for Bambu Lab X1C, P1S, or A1 setups.' },
      { name: 'Build Plate Utilization Calculator', slug: 'build-plate-utilization-calculator', desc: 'Check nesting limits for model sizes relative to Bambu 256x256mm build plates.' }
    ]
  }
];

const groupIcons: Record<string, React.ComponentType<any>> = {
  'Cost & Pricing': IndianRupee,
  'Material Tools': Layers,
  'Printing Tools': Gauge,
  'Nozzle Tools': Disc,
  'Model Tools': Box,
  'Resin Printing': Droplet,
  'Electricity & Shipping': Truck,
  'Print Farm Tools': Cpu,
  'HueForge Tools': Paintbrush,
  'Bambu Lab Tools': Printer
};

const featuredSlugs = [
  '3d-printing-cost-calculator',
  'filament-cost-calculator',
  'print-profit-calculator',
  'remaining-filament-calculator',
  'print-time-estimator',
  'purge-waste-calculator'
];

const groupMeta: Record<string, { gradient: string, border: string, text: string, bg: string, hoverBorder: string, glow: string, shadow: string }> = {
  'Cost & Pricing': {
    gradient: 'from-amber-500/10 to-orange-500/10',
    border: 'border-amber-500/25 dark:border-amber-500/15',
    text: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/5 dark:bg-amber-500/10',
    hoverBorder: 'hover:border-amber-500/40 dark:hover:border-amber-500/30',
    glow: 'group-hover:shadow-amber-500/[0.04]',
    shadow: 'hover:shadow-[0_0_15px_rgba(245,158,11,0.15)] dark:hover:shadow-[0_0_15px_rgba(245,158,11,0.08)]'
  },
  'Material Tools': {
    gradient: 'from-indigo-500/10 to-blue-500/10',
    border: 'border-indigo-500/25 dark:border-indigo-500/15',
    text: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-500/5 dark:bg-indigo-500/10',
    hoverBorder: 'hover:border-indigo-500/40 dark:hover:border-indigo-500/30',
    glow: 'group-hover:shadow-indigo-500/[0.04]',
    shadow: 'hover:shadow-[0_0_15px_rgba(99,102,241,0.15)] dark:hover:shadow-[0_0_15px_rgba(99,102,241,0.08)]'
  },
  'Printing Tools': {
    gradient: 'from-cyan-500/10 to-blue-500/10',
    border: 'border-cyan-500/25 dark:border-cyan-500/15',
    text: 'text-cyan-600 dark:text-cyan-400',
    bg: 'bg-cyan-500/5 dark:bg-cyan-500/10',
    hoverBorder: 'hover:border-cyan-500/40 dark:hover:border-cyan-500/30',
    glow: 'group-hover:shadow-cyan-500/[0.04]',
    shadow: 'hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] dark:hover:shadow-[0_0_15px_rgba(6,182,212,0.08)]'
  },
  'Nozzle Tools': {
    gradient: 'from-violet-500/10 to-purple-500/10',
    border: 'border-violet-500/25 dark:border-violet-500/15',
    text: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-500/5 dark:bg-violet-500/10',
    hoverBorder: 'hover:border-violet-500/40 dark:hover:border-violet-500/30',
    glow: 'group-hover:shadow-violet-500/[0.04]',
    shadow: 'hover:shadow-[0_0_15px_rgba(139,92,246,0.15)] dark:hover:shadow-[0_0_15px_rgba(139,92,246,0.08)]'
  },
  'Model Tools': {
    gradient: 'from-blue-500/10 to-indigo-500/10',
    border: 'border-blue-500/25 dark:border-blue-500/15',
    text: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-500/5 dark:bg-blue-500/10',
    hoverBorder: 'hover:border-blue-500/40 dark:hover:border-blue-500/30',
    glow: 'group-hover:shadow-blue-500/[0.04]',
    shadow: 'hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] dark:hover:shadow-[0_0_15px_rgba(59,130,246,0.08)]'
  },
  'Resin Printing': {
    gradient: 'from-emerald-500/10 to-teal-500/10',
    border: 'border-emerald-500/25 dark:border-emerald-500/15',
    text: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/5 dark:bg-emerald-500/10',
    hoverBorder: 'hover:border-emerald-500/40 dark:hover:border-emerald-500/30',
    glow: 'group-hover:shadow-emerald-500/[0.04]',
    shadow: 'hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] dark:hover:shadow-[0_0_15px_rgba(16,185,129,0.08)]'
  },
  'Electricity & Shipping': {
    gradient: 'from-yellow-500/10 to-amber-500/10',
    border: 'border-yellow-500/25 dark:border-yellow-500/15',
    text: 'text-yellow-600 dark:text-yellow-500',
    bg: 'bg-yellow-500/5 dark:bg-yellow-500/10',
    hoverBorder: 'hover:border-yellow-500/40 dark:hover:border-yellow-500/30',
    glow: 'group-hover:shadow-yellow-500/[0.04]',
    shadow: 'hover:shadow-[0_0_15px_rgba(234,179,8,0.15)] dark:hover:shadow-[0_0_15px_rgba(234,179,8,0.08)]'
  },
  'Print Farm Tools': {
    gradient: 'from-fuchsia-500/10 to-purple-500/10',
    border: 'border-fuchsia-500/25 dark:border-fuchsia-500/15',
    text: 'text-fuchsia-600 dark:text-fuchsia-400',
    bg: 'bg-fuchsia-500/5 dark:bg-fuchsia-500/10',
    hoverBorder: 'hover:border-fuchsia-500/40 dark:hover:border-fuchsia-500/30',
    glow: 'group-hover:shadow-fuchsia-500/[0.04]',
    shadow: 'hover:shadow-[0_0_15px_rgba(217,70,239,0.15)] dark:hover:shadow-[0_0_15px_rgba(217,70,239,0.08)]'
  },
  'HueForge Tools': {
    gradient: 'from-rose-500/10 to-pink-500/10',
    border: 'border-rose-500/25 dark:border-rose-500/15',
    text: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-500/5 dark:bg-rose-500/10',
    hoverBorder: 'hover:border-rose-500/40 dark:hover:border-rose-500/30',
    glow: 'group-hover:shadow-rose-500/[0.04]',
    shadow: 'hover:shadow-[0_0_15px_rgba(244,63,94,0.15)] dark:hover:shadow-[0_0_15px_rgba(244,63,94,0.08)]'
  },
  'Bambu Lab Tools': {
    gradient: 'from-green-500/10 to-emerald-500/10',
    border: 'border-green-500/25 dark:border-green-500/15',
    text: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-500/5 dark:bg-green-500/10',
    hoverBorder: 'hover:border-green-500/40 dark:hover:border-green-500/30',
    glow: 'group-hover:shadow-green-500/[0.04]',
    shadow: 'hover:shadow-[0_0_15px_rgba(34,197,94,0.15)] dark:hover:shadow-[0_0_15px_rgba(34,197,94,0.08)]'
  }
};

const stats = [
  { value: '39', label: 'Calculators', desc: 'Filament, time, flow & cost' },
  { value: '10', label: 'Toolkits', desc: 'From AMS to HueForge planning' },
  { value: '100%', label: 'Local Run', desc: 'No files ever upload to servers' },
  { value: 'Fast', label: 'Performance', desc: 'Instant calculations and reports' }
];

const FILAMENT_PRICE_GUIDE: Record<string, Array<{ brand: string, price: number }>> = {
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

export default function ThreeDPrintStudio() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState('all');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grouped' | 'list'>('grouped');

  // Interactive Printer States
  const [printerPower, setPrinterPower] = useState(true);
  const [chamberLight, setChamberLight] = useState(true);
  const [isPrinting, setIsPrinting] = useState(true);
  const [printProgress, setPrintProgress] = useState(42);
  const [nozzleTemp, setNozzleTemp] = useState(220);
  const [bedTemp, setBedTemp] = useState(60);

  // Indian Filament Price Index State
  const [indexMaterial, setIndexMaterial] = useState<'pla' | 'abs' | 'petg' | 'asa' | 'cf'>('pla');

  // Dynamic simulation values
  useEffect(() => {
    if (!printerPower) {
      setNozzleTemp(25);
      setBedTemp(25);
      return;
    }

    if (!isPrinting) {
      // Cool down to standby
      const timer = setInterval(() => {
        setNozzleTemp(prev => (prev > 30 ? prev - 4 : 25));
        setBedTemp(prev => (prev > 30 ? prev - 2 : 25));
      }, 1000);
      return () => clearInterval(timer);
    }

    // Printing: Heat up / maintain and tick progress
    const timer = setInterval(() => {
      setNozzleTemp(prev => {
        if (prev < 215) return prev + 20;
        return 218 + Math.floor(Math.random() * 5); // fluctuate
      });
      setBedTemp(prev => {
        if (prev < 58) return prev + 5;
        return 59 + Math.floor(Math.random() * 3); // fluctuate
      });
      setPrintProgress(prev => (prev >= 100 ? 0 : prev + 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [printerPower, isPrinting]);

  const allTools = toolGroups.flatMap(g => g.tools.map(t => ({ ...t, group: g.name })));

  const filteredTools = allTools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tool.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup = activeGroup === 'all' || tool.group === activeGroup;
    return matchesSearch && matchesGroup;
  });

  const featuredTools = allTools.filter(t => featuredSlugs.includes(t.slug));

  // Calculations not required for Price Index

  const faqs = [
    {
      q: 'What is 3D Print Studio?',
      a: '3D Print Studio is a specialized premium suite of interactive calculators designed for 3D printing enthusiasts, makers, print farms, and professional workshops. It handles print pricing, filament mass estimations, resin curing exposure guides, and Bambu Lab AMS configurations.'
    },
    {
      q: 'Is it free?',
      a: 'Yes, all calculators in the 3D Print Studio are completely free to use without requiring registration, subscription fees, or account setups.'
    },
    {
      q: 'Do I need to upload STL files?',
      a: 'No, uploading STL files is optional. Calculators like the Filament Cost or Print Time estimator work via manual input values. However, specialized tools like the STL Volume Calculator feature client-side binary STL parsing that reads model volumes and sizes locally in your browser memory.'
    },
    {
      q: 'Can I calculate selling price for 3D printed products?',
      a: 'Yes, the Print Profit Calculator and the 3D Printing Cost Calculator allow you to specify filament costs, machine run times, power rates, and customized markup percentages to calculate optimal selling prices.'
    },
    {
      q: 'Is this useful for Bambu Lab users?',
      a: 'Absolutely! The Bambu Lab tools group features custom calculators for AMS filament mapping, purge waste, purge flush volume setups, and build plate utilization nesting.'
    },
    {
      q: 'Can print farms use these calculators?',
      a: 'Yes, the Print Farm group features machine utilization, queue delay estimators, and monthly production capacity metrics tailored for print farm operators.'
    }
  ];

  const scrollToTools = () => {
    const el = document.getElementById('studio-directory');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // CollectionPage Schema Markup for Answer Engine Optimization (AEO)
  const studioSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    'name': '3D Print Studio - Free 3D Printing Calculators & Tools',
    'description': 'Free 3D printing calculators for filament cost, print pricing, resin, print farms, Bambu Lab, HueForge, STL volume, electricity cost, and print profit.',
    'url': 'https://toolique.in/3d-print-studio',
    'mainEntity': {
      '@type': 'ItemList',
      'numberOfItems': allTools.length,
      'itemListElement': allTools.map((tool, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'url': `https://toolique.in/tool/${tool.slug}`,
        'name': tool.name
      }))
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 md:p-12 space-y-16 mt-4 relative overflow-hidden">
      {/* CSS Styles injection */}
      <style>{`
        .dot-matrix {
          background-image: radial-gradient(circle, rgba(148, 163, 184, 0.08) 1px, transparent 1px);
          background-size: 24px 24px;
        }
        .dark .dot-matrix {
          background-image: radial-gradient(circle, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
        }
        
        @keyframes nozzleMove {
          0% { transform: translate(0px, 0px); }
          25% { transform: translate(25px, 8px); }
          50% { transform: translate(12px, 20px); }
          75% { transform: translate(-12px, 12px); }
          100% { transform: translate(0px, 0px); }
        }
        @keyframes bedGlow {
          0%, 100% { stroke: rgba(6, 182, 212, 0.2); }
          50% { stroke: rgba(6, 182, 212, 0.6); }
        }
        @keyframes nozzleSpark {
          0%, 100% { r: 1.5; opacity: 0.5; }
          50% { r: 3; opacity: 1; }
        }
        @keyframes spoolRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-nozzle {
          animation: nozzleMove 6s infinite linear;
        }
        .animate-bed {
          animation: bedGlow 3s infinite ease-in-out;
        }
        .animate-spark {
          animation: nozzleSpark 1.5s infinite ease-in-out;
        }
        .animate-spool {
          animation: spoolRotate 12s infinite linear;
          transform-origin: 160px 45px;
        }
      `}</style>

      {/* Grid Pattern Backdrop overlay */}
      <div className="absolute inset-0 dot-matrix pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)]" />

      {/* Background Neon Glows */}
      <div className="absolute top-[-10%] left-[20%] w-[300px] h-[300px] bg-indigo-500/[0.05] dark:bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] w-[250px] h-[250px] bg-cyan-500/[0.05] dark:bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      <SEO
        title="3D Print Studio - Free 3D Printing Calculators & Tools"
        description="Free 3D printing calculators for filament cost, print pricing, resin, print farms, Bambu Lab, HueForge, STL volume, electricity cost, and print profit."
        keywords={['3D printing calculator', 'filament cost calculator', '3D print pricing calculator', 'print farm calculator', 'Bambu Lab tools', 'HueForge calculator', 'STL volume calculator']}
        canonicalUrl="https://toolique.in/3d-print-studio"
        schemaMarkup={studioSchema}
      />

      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center pt-6 relative z-10 max-w-6xl mx-auto">
        {/* Left Column - Info & Quick Estimator */}
        <div className="lg:col-span-7 text-left space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Professional Maker Tools</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-[1.1] bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 dark:from-cyan-400 dark:via-indigo-400 dark:to-purple-400">
            3D Print Studio
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xl">
            Professional 3D printing calculators for filament cost, print pricing, material usage, print farms, Bambu Lab, HueForge, resin printing, and production planning.
          </p>

          {/* Indian Filament Price Index Card */}
          <div className="p-5 rounded-2xl bg-zinc-50/40 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 backdrop-blur-md space-y-4 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                <span>India Filament Price Index</span>
              </span>
              <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">Representative Rates</span>
            </div>

            {/* Price Index Tabs row */}
            <div className="grid grid-cols-5 gap-1.5">
              {(['pla', 'abs', 'petg', 'asa', 'cf'] as const).map(mat => {
                const isSelected = indexMaterial === mat;
                return (
                  <button
                    key={mat}
                    onClick={() => setIndexMaterial(mat)}
                    className={`py-1.5 px-1 rounded-lg border text-[10px] font-bold tracking-wider uppercase transition cursor-pointer text-center ${
                      isSelected
                        ? 'border-indigo-500/80 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-950/20 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    {mat}
                  </button>
                );
              })}
            </div>

            {/* Price Table Listings */}
            <div className="space-y-2 pt-1">
              {FILAMENT_PRICE_GUIDE[indexMaterial].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 px-3 rounded-xl bg-white/50 dark:bg-zinc-950/40 border border-zinc-200/40 dark:border-zinc-800/30 text-[11px] font-semibold">
                  <span className="text-zinc-700 dark:text-zinc-300">{item.brand}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">₹{item.price} / kg</span>
                    <Link
                      to={`/tool/3d-printing-cost-calculator?price=${item.price}&material=${indexMaterial}`}
                      className="px-2 py-0.5 rounded bg-indigo-500/10 hover:bg-indigo-550 dark:hover:bg-indigo-500 hover:text-white text-indigo-600 dark:text-indigo-400 text-[9px] font-extrabold transition cursor-pointer"
                    >
                      Use
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[9px] font-semibold text-zinc-400 dark:text-zinc-500 text-center leading-relaxed">
              Use these rates directly inside the <Link to="/tool/3d-printing-cost-calculator" className="text-indigo-500 hover:underline font-bold">3D Printing Cost Calculator</Link> to build precise estimates.
            </p>
          </div>

          <div className="pt-2 flex justify-start">
            <button
              onClick={scrollToTools}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 text-white font-extrabold text-xs tracking-wider uppercase shadow-lg shadow-indigo-500/10 hover:scale-102 active:scale-98 transition cursor-pointer"
            >
              <span>Explore 3D Printing Tools</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column - Interactive 3D Printer Animation & HUD Panel */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="relative w-full rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/20 p-5 shadow-inner overflow-hidden">
            {/* Visual Grid Layer inside the simulator card */}
            <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.03] pointer-events-none" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              {/* Animated Printer SVG */}
              <div className="aspect-square w-full max-w-[200px] mx-auto flex items-center justify-center relative">
                <svg viewBox="0 0 200 200" className={`w-full h-full transition ${printerPower ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-300 dark:text-zinc-700 opacity-60'}`}>
                  {/* Top Spool Holder and Spool */}
                  <line x1="100" y1="20" x2="160" y2="45" stroke="currentColor" strokeWidth="1.5" />
                  <g className={printerPower && isPrinting ? 'animate-spool' : ''}>
                    {/* Filament Spool Roll */}
                    <circle cx="160" cy="45" r="16" className="fill-zinc-200 dark:fill-zinc-800 stroke-zinc-400 dark:stroke-zinc-600" strokeWidth="1.5" />
                    <circle cx="160" cy="45" r="12" className="fill-transparent stroke-indigo-500/80" strokeWidth="3" strokeDasharray="16 6" />
                    <circle cx="160" cy="45" r="5" className="fill-zinc-300 dark:fill-zinc-900 stroke-zinc-400 dark:stroke-zinc-600" strokeWidth="1.5" />
                  </g>
                  {/* Filament Path to carriage */}
                  <path d="M 160,45 Q 120,30 100,60" fill="transparent" stroke="rgb(99, 102, 241)" strokeWidth="1" strokeDasharray="2 2" className="opacity-70" />

                  {/* Printer frame vertical guide rods */}
                  <line x1="30" y1="30" x2="30" y2="170" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
                  <line x1="170" y1="30" x2="170" y2="170" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
                  <line x1="30" y1="30" x2="170" y2="30" stroke="currentColor" strokeWidth="2" />
                  
                  {/* Print Bed (Isometric Plate) */}
                  <polygon
                    points="40,140 100,110 160,140 100,170"
                    className={`fill-zinc-100 dark:fill-zinc-950/70 stroke-zinc-300 dark:stroke-zinc-800 transition ${printerPower && bedTemp > 30 ? 'animate-bed' : ''}`}
                    strokeWidth="1.5"
                  />
                  <polygon
                    points="55,140 100,118 145,140 100,162"
                    className="fill-transparent stroke-zinc-200 dark:stroke-zinc-900"
                    strokeWidth="1"
                  />

                  {/* The chamber light beam (cone overlay) */}
                  {chamberLight && printerPower && (
                    <polygon
                      points="30,30 170,30 160,140 40,140"
                      fill="url(#chamberLightGradient)"
                      className="pointer-events-none mix-blend-screen opacity-50 transition-opacity duration-300"
                    />
                  )}

                  {/* The printed object (Isometric glowing cube) */}
                  {printerPower && (
                    <g className="transition-opacity duration-300">
                      <polygon points="85,140 100,132 115,140 100,148" fill="rgba(99, 102, 241, 0.05)" stroke="rgb(99, 102, 241)" strokeWidth="1.5" className="opacity-80" />
                      <polygon points="85,140 85,120 100,128 100,148" fill="rgba(99, 102, 241, 0.1)" stroke="rgb(99, 102, 241)" strokeWidth="1.5" className="opacity-85" />
                      <polygon points="100,148 100,128 115,120 115,140" fill="rgba(6, 182, 212, 0.1)" stroke="rgb(6, 182, 212)" strokeWidth="1.5" className="opacity-85" />
                      <polygon points="85,120 100,112 115,120 100,128" fill="rgba(6, 182, 212, 0.2)" stroke="rgb(6, 182, 212)" strokeWidth="1.5" className={isPrinting ? 'animate-pulse' : ''} />
                    </g>
                  )}

                  {/* Printhead carriage */}
                  <g className={printerPower && isPrinting ? 'animate-nozzle' : ''}>
                    <line x1="30" y1="70" x2="170" y2="70" stroke="currentColor" strokeWidth="1" opacity="0.3" />
                    <rect x="85" y="60" width="30" height="15" rx="3" className="fill-zinc-800 dark:fill-zinc-200 stroke-zinc-700 dark:stroke-zinc-100 shadow-lg" strokeWidth="1" />
                    <polygon points="97,75 103,75 100,82" className="fill-amber-500 dark:fill-amber-400" />
                    <line x1="100" y1="50" x2="100" y2="60" stroke="rgb(99, 102, 241)" strokeWidth="1.5" strokeDasharray="2 2" />
                    <rect x="95" y="72" width="10" height="3" className="fill-zinc-600 dark:fill-zinc-400" />
                    
                    {/* Active Extruding laser line indicator */}
                    {printerPower && isPrinting && (
                      <g>
                        <line x1="100" y1="82" x2="100" y2="120" stroke="url(#laserGradient)" strokeWidth="1.5" strokeLinecap="round" />
                        <circle cx="100" cy="82" r="2.5" fill="#f59e0b" className="animate-spark" />
                      </g>
                    )}
                  </g>

                  <defs>
                    <linearGradient id="laserGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1" />
                    </linearGradient>
                    <linearGradient id="chamberLightGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#eab308" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#eab308" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* HUD Screen Control Panel */}
              <div className="space-y-3 text-left">
                {/* LCD Display */}
                <div className={`p-3.5 rounded-xl border font-mono text-[9px] tracking-tight leading-tight space-y-1 relative overflow-hidden transition-all duration-300 ${
                  printerPower
                    ? 'bg-zinc-900 border-zinc-700 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] shadow-inner'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-750 shadow-none'
                }`}>
                  {printerPower && (
                    <div className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  )}
                  <div>SYS: {printerPower ? 'ONLINE (v1.0)' : 'OFFLINE'}</div>
                  <div>
                    STATUS: {printerPower ? (isPrinting ? 'PRINTING...' : 'IDLE') : 'NO POWER'}
                  </div>
                  <div>
                    NOZ: {printerPower ? `${nozzleTemp}°C / 220°C` : '---'}
                  </div>
                  <div>
                    BED: {printerPower ? `${bedTemp}°C / 60°C` : '---'}
                  </div>
                  <div>
                    PROG: {printerPower ? (
                      `[${'█'.repeat(Math.floor(printProgress / 10))}${'░'.repeat(10 - Math.floor(printProgress / 10))}] ${printProgress}%`
                    ) : '------------'}
                  </div>
                  <div className="text-zinc-500 text-[8px] pt-1">
                    XYZ: {printerPower && isPrinting ? `${(90 + Math.random()*20).toFixed(1)}, ${(100 + Math.random()*20).toFixed(1)}, ${(printProgress * 0.4).toFixed(2)}` : '0.0, 0.0, 0.00'}
                  </div>
                </div>

                {/* Control Action Buttons */}
                <div className="flex gap-1.5 justify-center sm:justify-start">
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
                    title="Toggle Printer Power"
                    className={`p-2 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer w-full ${
                      printerPower
                        ? 'border-red-500/30 hover:border-red-500 bg-red-500/5 hover:bg-red-500/10 text-red-500'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-650 dark:text-zinc-305'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">{printerPower ? 'Kill' : 'Power'}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (!printerPower) return;
                      setIsPrinting(!isPrinting);
                    }}
                    disabled={!printerPower}
                    title="Toggle Print/Pause"
                    className={`p-2 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer w-full disabled:opacity-40 disabled:cursor-not-allowed ${
                      isPrinting
                        ? 'border-amber-500/30 hover:border-amber-500 bg-amber-500/5 hover:bg-amber-500/10 text-amber-600 dark:text-amber-500'
                        : 'border-emerald-500/30 hover:border-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {isPrinting ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span className="hidden md:inline">{isPrinting ? 'Pause' : 'Print'}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (!printerPower) return;
                      setChamberLight(!chamberLight);
                    }}
                    disabled={!printerPower}
                    title="Toggle Chamber Light"
                    className={`p-2 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer w-full disabled:opacity-40 disabled:cursor-not-allowed ${
                      chamberLight
                        ? 'border-yellow-500/40 hover:border-yellow-500 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 shadow-sm'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-500'
                    }`}
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Light</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Display Grid */}
          <div className="grid grid-cols-2 gap-2 text-left">
            {stats.map((stat, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-200/60 dark:border-zinc-800/60 space-y-0.5 shadow-sm">
                <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">{stat.value}</span>
                <h4 className="text-[8px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">{stat.label}</h4>
                <p className="text-[8px] text-zinc-400 dark:text-zinc-500 font-semibold leading-tight">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tools Section */}
      <section className="space-y-6 relative z-10 text-left">
        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3 flex justify-between items-center">
          <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">Featured Toolkits</h2>
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Top 6 Calculators</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredTools.map((tool) => {
            const meta = groupMeta[tool.group] || { hoverBorder: 'hover:border-cyan-500/30', glow: '', shadow: '' };
            return (
              <Link
                key={tool.slug}
                to={`/tool/${tool.slug}`}
                className={`group p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 ${meta.hoverBorder} hover:bg-white dark:hover:bg-zinc-900/50 hover:shadow-xl ${meta.shadow} transition-all duration-300 flex flex-col justify-between`}
              >
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition">
                    {tool.name}
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-semibold">
                    {tool.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-900 flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition">
                  <span>{tool.group}</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Directory Section Header & Search */}
      <section id="studio-directory" className="space-y-8 pt-6 relative z-10 text-left">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">All 3D Printing Tools</h2>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold mt-0.5">Filter and search the complete list of 39 calculators</p>
          </div>

          {/* Dual-View Mode Toggles */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setViewMode('grouped')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                viewMode === 'grouped'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200 dark:border-zinc-700'
                  : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Toolkit View</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200 dark:border-zinc-700'
                  : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List View</span>
            </button>
          </div>
        </div>

        {/* View Mode 1: Toolkit Grouped View (Default) */}
        {viewMode === 'grouped' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {toolGroups.map((group) => {
              const IconComponent = groupIcons[group.name] || Box;
              const meta = groupMeta[group.name] || { text: '', bg: '', border: '', shadow: '', hoverBorder: '' };
              return (
                <div
                  key={group.name}
                  className={`group p-6 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-200/80 dark:border-zinc-800/80 ${meta.hoverBorder} ${meta.shadow} hover:shadow-lg transition-all duration-300 flex flex-col justify-between`}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-800/60 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl ${meta.bg} ${meta.text}`}>
                          <IconComponent className="w-4.5 h-4.5" />
                        </div>
                        <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-950 dark:group-hover:text-white transition">
                          {group.name}
                        </h3>
                      </div>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${meta.bg} ${meta.text}`}>
                        {group.tools.length} Tools
                      </span>
                    </div>

                    {/* Checkbox-style Subtool Links list */}
                    <div className="space-y-1.5 py-1">
                      {group.tools.map((tool) => (
                        <Link
                          key={tool.slug}
                          to={`/tool/${tool.slug}`}
                          className="flex items-start gap-2 group/link py-1 hover:translate-x-1 transition-transform duration-200"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${meta.bg} ${meta.text} mt-1.5 shrink-0 group-hover/link:scale-125 transition-transform`} />
                          <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 group-hover/link:text-indigo-600 dark:group-hover/link:text-indigo-400 transition-colors">
                            {tool.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="pt-4 border-t border-zinc-200/60 dark:border-zinc-800/60 mt-4">
                    <button
                      onClick={() => {
                        setActiveGroup(group.name);
                        setViewMode('list');
                        scrollToTools();
                      }}
                      className={`w-full py-2 text-[9px] font-bold uppercase tracking-wider border rounded-xl text-center cursor-pointer transition-colors ${meta.text} ${meta.border} bg-white dark:bg-zinc-950/60 hover:bg-zinc-50 dark:hover:bg-zinc-800`}
                    >
                      Search this toolkit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View Mode 2: Search List Grid View */}
        {viewMode === 'list' && (
          <div className="space-y-6">
            {/* Large Search Input */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 3D printing calculators..."
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/40 text-sm font-semibold text-zinc-900 dark:text-white focus:border-cyan-500 dark:focus:border-cyan-400 focus:outline-none transition shadow-sm"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2 justify-center py-2">
              <button
                onClick={() => setActiveGroup('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                  activeGroup === 'all'
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-white shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                All Toolkits ({allTools.length})
              </button>
              {toolGroups.map(group => {
                const isActive = activeGroup === group.name;
                return (
                  <button
                    key={group.name}
                    onClick={() => setActiveGroup(group.name)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition border cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-cyan-600 dark:bg-cyan-500 text-white dark:text-zinc-950 border-cyan-600 dark:border-cyan-400 shadow-sm'
                        : 'bg-zinc-100 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <span>{group.name}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white dark:bg-zinc-950/20 dark:text-zinc-900' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500'}`}>
                      {group.tools.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Grid Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.length > 0 ? (
                filteredTools.map((tool) => {
                  const IconComponent = groupIcons[tool.group] || Box;
                  const meta = groupMeta[tool.group] || { hoverBorder: 'hover:border-cyan-500/20', shadow: '', text: '' };
                  return (
                    <Link
                      key={tool.slug}
                      to={`/tool/${tool.slug}`}
                      className={`group p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800/80 ${meta.hoverBorder} hover:bg-white dark:hover:bg-zinc-900/40 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between shadow-sm hover:shadow-md ${meta.shadow}`}
                    >
                      <div className="space-y-3">
                        <div className={`p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 ${meta.text} group-hover:scale-105 w-fit transition-transform`}>
                          <IconComponent className="w-4.5 h-4.5" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">
                            {tool.name}
                          </h3>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-semibold">
                            {tool.desc}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-900 flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
                        <span>{tool.group}</span>
                        <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="col-span-full py-12 text-center text-zinc-400 dark:text-zinc-500 font-semibold text-xs">
                  No 3D printing calculators match your search filter criteria.
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* FAQs Section */}
      <section className="space-y-6 relative z-10 text-left">
        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3 flex justify-between items-center">
          <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">Frequently Asked Questions</h2>
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">FAQ Hub</span>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10 overflow-hidden transition-colors animate-fade-in"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 flex justify-between items-center text-left text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white font-bold text-xs cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-cyan-500 dark:text-cyan-400 shrink-0" />
                    <span>{faq.q}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-zinc-400 dark:text-zinc-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-semibold border-t border-zinc-200 dark:border-zinc-800 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
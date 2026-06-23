import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  IndianRupee, Layers, Gauge, Disc, Box, Droplet, Truck, Cpu, Paintbrush, Printer,
  Search, HelpCircle, ChevronDown, Sparkles, ArrowRight
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

export default function ThreeDPrintStudio() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState('all');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const allTools = toolGroups.flatMap(g => g.tools.map(t => ({ ...t, group: g.name })));

  const filteredTools = allTools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tool.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup = activeGroup === 'all' || tool.group === activeGroup;
    return matchesSearch && matchesGroup;
  });

  const featuredTools = allTools.filter(t => featuredSlugs.includes(t.slug));

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

  return (
    <div className="bg-zinc-950 text-zinc-100 rounded-3xl border border-zinc-800 shadow-2xl p-6 md:p-12 space-y-16 mt-4 relative overflow-hidden">
      {/* Background Neon Glows */}
      <div className="absolute top-[-10%] left-[20%] w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] w-[250px] h-[250px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      <SEO
        title="3D Print Studio - Free 3D Printing Calculators & Tools"
        description="Free 3D printing calculators for filament cost, print pricing, resin, print farms, Bambu Lab, HueForge, STL volume, electricity cost, and print profit."
        keywords={['3D printing calculator', 'filament cost calculator', '3D print pricing calculator', 'print farm calculator', 'Bambu Lab tools', 'HueForge calculator', 'STL volume calculator']}
        canonicalUrl="https://toolique.in/3d-print-studio"
      />

      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-6 pt-6 relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-[10px] font-bold uppercase tracking-wider text-cyan-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Professional Maker Tools</span>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400">
          3D Print Studio
        </h1>
        <p className="text-sm md:text-base text-zinc-400 leading-relaxed max-w-2xl mx-auto">
          Professional 3D printing calculators for filament cost, print pricing, material usage, print farms, Bambu Lab, HueForge, resin printing, and production planning.
        </p>

        <div className="pt-4 flex justify-center">
          <button
            onClick={scrollToTools}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 text-white font-extrabold text-xs tracking-wider uppercase shadow-lg shadow-indigo-500/10 hover:scale-105 active:scale-95 transition cursor-pointer"
          >
            <span>Explore 3D Printing Tools</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Featured Tools Section */}
      <section className="space-y-6 relative z-10">
        <div className="border-b border-zinc-800 pb-3 flex justify-between items-center">
          <h2 className="text-sm font-bold uppercase tracking-widest text-cyan-400">Featured Toolkits</h2>
          <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-wider">Top 6 Calculators</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredTools.map((tool) => {
            return (
              <Link
                key={tool.slug}
                to={`/tool/${tool.slug}`}
                className="group p-6 rounded-2xl bg-zinc-900/30 border border-zinc-850 hover:border-cyan-500/30 hover:bg-zinc-900/50 hover:shadow-lg hover:shadow-cyan-500/[0.01] transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-zinc-200 group-hover:text-cyan-400 transition">
                    {tool.name}
                  </h3>
                  <p className="text-[11px] text-zinc-450 leading-relaxed font-semibold">
                    {tool.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-900 flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-zinc-500 group-hover:text-zinc-300 transition">
                  <span>{tool.group}</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Search & Directory Header */}
      <section id="studio-directory" className="space-y-6 pt-6 relative z-10">
        <div className="border-b border-zinc-800 pb-3">
          <h2 className="text-sm font-bold uppercase tracking-widest text-cyan-400">All 3D Printing Tools</h2>
        </div>

        {/* Large Search Input */}
        <div className="max-w-2xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 3D printing calculators..."
            className="w-full pl-12 pr-4 py-4 rounded-xl border border-zinc-800 bg-zinc-900/40 text-sm font-semibold text-white focus:border-cyan-400 focus:outline-none transition"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 justify-center py-2">
          <button
            onClick={() => setActiveGroup('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
              activeGroup === 'all'
                ? 'bg-zinc-100 text-zinc-950 border-white'
                : 'bg-zinc-900/50 text-zinc-400 border-zinc-850 hover:text-white'
            }`}
          >
            All Toolkits
          </button>
          {toolGroups.map(group => {
            return (
              <button
                key={group.name}
                onClick={() => setActiveGroup(group.name)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                  activeGroup === group.name
                    ? 'bg-cyan-500 text-zinc-950 border-cyan-400'
                    : 'bg-zinc-900/50 text-zinc-400 border-zinc-850 hover:text-white'
                }`}
              >
                {group.name}
              </button>
            );
          })}
        </div>

        {/* Dynamic Grid Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.length > 0 ? (
            filteredTools.map((tool) => {
              const IconComponent = groupIcons[tool.group] || Box;
              return (
                <Link
                  key={tool.slug}
                  to={`/tool/${tool.slug}`}
                  className="group p-6 rounded-2xl bg-zinc-900/20 border border-zinc-850 hover:border-cyan-500/20 hover:bg-zinc-900/40 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-400 group-hover:text-cyan-400 w-fit transition">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold text-zinc-200 group-hover:text-white transition">
                        {tool.name}
                      </h3>
                      <p className="text-[11px] text-zinc-455 leading-relaxed font-semibold">
                        {tool.desc}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-zinc-900 flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-zinc-550 group-hover:text-zinc-400 transition">
                    <span>{tool.group}</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition" />
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center text-zinc-550 font-semibold text-xs">
              No 3D printing calculators match your search filter criteria.
            </div>
          )}
        </div>
      </section>

      {/* FAQs Section */}
      <section className="space-y-6 relative z-10">
        <div className="border-b border-zinc-800 pb-3 flex justify-between items-center">
          <h2 className="text-sm font-bold uppercase tracking-widest text-cyan-400">Frequently Asked Questions</h2>
          <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-wider">FAQ Hub</span>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-zinc-850 bg-zinc-900/10 overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 flex justify-between items-center text-left text-zinc-200 hover:text-white font-bold text-xs cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{faq.q}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-[11px] text-zinc-400 leading-relaxed font-semibold border-t border-zinc-850 pt-3">
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
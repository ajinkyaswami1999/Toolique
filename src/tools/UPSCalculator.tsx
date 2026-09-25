/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from 'react';
import {
  Zap,
  Sparkles,
  Copy,
  Check,
  Trash2,
  Server,
  Download,
  Sliders,
  Shield,
  Cpu,
  Flame,
  BatteryCharging
} from 'lucide-react';

// --- Type Definitions ---
export type UpsCalculatorMode = 'standard_sizer' | 'datacenter_rack' | 'battery_wiring' | 'load_aggregator' | 'generator_pairing';
export type UpsTopology = 'offline' | 'line_interactive' | 'online_double_conversion';
export type RedundancyScheme = 'standalone' | 'n_plus_1' | 'two_n';
export type BatteryChemistry = 'tubular' | 'agm' | 'gel' | 'lithium_nmc' | 'lifepo4';
export type DcVoltageOption = 12 | 24 | 36 | 48 | 72 | 96 | 120 | 192 | 240;

export interface UpsTopologyProfile {
  name: string;
  fullName: string;
  transferTimeMs: string;
  efficiencyPercent: number;
  waveform: string;
  bestFor: string;
}

export const TOPOLOGY_PROFILES: Record<UpsTopology, UpsTopologyProfile> = {
  offline: {
    name: 'Offline / Standby',
    fullName: 'Offline / Standby Topology (Basic)',
    transferTimeMs: '4–10 ms',
    efficiencyPercent: 92,
    waveform: 'Modified Sine Wave / Square Wave',
    bestFor: 'Home PCs, Wi-Fi routers, non-critical desktop appliances'
  },
  line_interactive: {
    name: 'Line-Interactive (AVR)',
    fullName: 'Line-Interactive with Automatic Voltage Regulation (AVR)',
    transferTimeMs: '2–4 ms',
    efficiencyPercent: 94,
    waveform: 'Simulated / Pure Sine Wave',
    bestFor: 'Workstations, retail POS, telecom nodes, small business servers'
  },
  online_double_conversion: {
    name: 'Online Double-Conversion',
    fullName: 'Online Double-Conversion (True Pure Sine Wave)',
    transferTimeMs: '0 ms (Zero Transfer)',
    efficiencyPercent: 90,
    waveform: 'True Pure Sine Wave (THD < 2%)',
    bestFor: 'Data centers, hospital critical care, industrial automation, enterprise servers'
  }
};

export const BATTERY_PROFILES: Record<BatteryChemistry, { name: string; dod: number; cycleLife: number; peukert: number }> = {
  tubular: { name: 'Tubular Lead-Acid', dod: 0.50, cycleLife: 1200, peukert: 1.25 },
  agm: { name: 'AGM High-Rate VRLA', dod: 0.60, cycleLife: 800, peukert: 1.15 },
  gel: { name: 'GEL Deep-Cycle', dod: 0.70, cycleLife: 1500, peukert: 1.15 },
  lithium_nmc: { name: 'Lithium-Ion (NMC)', dod: 0.85, cycleLife: 2500, peukert: 1.05 },
  lifepo4: { name: 'Lithium LiFePO4 (LFP)', dod: 0.95, cycleLife: 5000, peukert: 1.02 }
};

// Standard Commercial UPS Standard Ratings (VA / kVA)
const STANDARD_COMMERCIAL_UPS_RATINGS = [
  600, 800, 1000, 1100, 1500, 2000, 3000, 5000, 6000, 7500, 10000, 15000, 20000, 30000, 40000, 50000, 60000, 80000, 100000
];

export interface UpsLoadItem {
  id: string;
  name: string;
  continuousWatts: number;
  surgeMultiplier: number;
  qty: number;
  hoursNeeded: number;
}

const PRESET_LOAD_CATALOG: Omit<UpsLoadItem, 'id'>[] = [
  { name: 'Desktop PC & 24" Monitor', continuousWatts: 180, surgeMultiplier: 1.2, qty: 2, hoursNeeded: 2 },
  { name: 'Dual Monitor Workstation (GPU)', continuousWatts: 380, surgeMultiplier: 1.3, qty: 1, hoursNeeded: 3 },
  { name: '1U Rackmount Server (Dual PSU)', continuousWatts: 350, surgeMultiplier: 1.5, qty: 2, hoursNeeded: 1 },
  { name: '2U Storage Server / NAS Array', continuousWatts: 550, surgeMultiplier: 1.6, qty: 1, hoursNeeded: 1 },
  { name: '24-Port Managed Gigabit PoE Switch', continuousWatts: 120, surgeMultiplier: 1.2, qty: 2, hoursNeeded: 4 },
  { name: 'Wi-Fi 6 Router & Fiber Gateway', continuousWatts: 25, surgeMultiplier: 1.1, qty: 1, hoursNeeded: 8 },
  { name: 'Network Video Recorder (NVR) + 8 Cams', continuousWatts: 90, surgeMultiplier: 1.2, qty: 1, hoursNeeded: 6 },
  { name: 'Office Laser Printer (Standby/Print)', continuousWatts: 450, surgeMultiplier: 2.8, qty: 1, hoursNeeded: 0.5 },
  { name: 'Medical Patient Monitor / Ventilator', continuousWatts: 120, surgeMultiplier: 1.4, qty: 1, hoursNeeded: 4 },
  { name: 'BLDC Fan & LED Room Lights', continuousWatts: 100, surgeMultiplier: 1.2, qty: 2, hoursNeeded: 4 }
];

export interface UpsScenarioPreset {
  id: string;
  name: string;
  subtitle: string;
  loadWatts: number;
  powerFactor: number;
  surgeWatts: number;
  backupHours: number;
  topology: UpsTopology;
  dcVoltage: DcVoltageOption;
  chemistry: BatteryChemistry;
}

const UPS_PRESETS: UpsScenarioPreset[] = [
  {
    id: 'pc_workstation',
    name: 'Home Office Workstation',
    subtitle: 'PC, 2 Monitors, Router (~350W for 1.5 hours backup)',
    loadWatts: 350,
    powerFactor: 0.80,
    surgeWatts: 500,
    backupHours: 1.5,
    topology: 'line_interactive',
    dcVoltage: 12,
    chemistry: 'tubular'
  },
  {
    id: 'it_server_rack',
    name: 'Small Server Rack (2 Servers + PoE)',
    subtitle: '1,200W IT load, Pure Sine Wave, 48V Bus for 2 Hours',
    loadWatts: 1200,
    powerFactor: 0.90,
    surgeWatts: 1800,
    backupHours: 2.0,
    topology: 'online_double_conversion',
    dcVoltage: 48,
    chemistry: 'lifepo4'
  },
  {
    id: 'medical_critical',
    name: 'Medical Critical Care Lab',
    subtitle: 'Zero transfer 0ms, 800W load for 3 Hours at 24V DC Bus',
    loadWatts: 800,
    powerFactor: 0.85,
    surgeWatts: 1200,
    backupHours: 3.0,
    topology: 'online_double_conversion',
    dcVoltage: 24,
    chemistry: 'lifepo4'
  },
  {
    id: 'enterprise_rack_n1',
    name: 'Enterprise Data Center (N+1)',
    subtitle: '5,000W redundant compute load for 4 Hours at 96V DC Bus',
    loadWatts: 5000,
    powerFactor: 0.95,
    surgeWatts: 7500,
    backupHours: 4.0,
    topology: 'online_double_conversion',
    dcVoltage: 96,
    chemistry: 'lifepo4'
  }
];

export default function UPSCalculator() {
  // Navigation & Mode
  const [activeMode, setActiveMode] = useState<UpsCalculatorMode>('standard_sizer');

  // Core Sizing Parameters
  const [loadWatts, setLoadWatts] = useState<number>(600);
  const [powerFactor, setPowerFactor] = useState<number>(0.85); // 0.85 typical IT
  const [growthMarginPercent, setGrowthMarginPercent] = useState<number>(25); // 25% expansion headroom
  const [backupHours, setBackupHours] = useState<number>(2); // 2 hours
  const [topology, setTopology] = useState<UpsTopology>('line_interactive');
  const [dcVoltage, setDcVoltage] = useState<DcVoltageOption>(24);
  const [chemistry, setChemistry] = useState<BatteryChemistry>('tubular');
  const [singleBatteryAh, setSingleBatteryAh] = useState<number>(150); // standard unit block Ah

  // Data Center Mode (Mode 2)
  const [redundancy, setRedundancy] = useState<RedundancyScheme>('standalone');
  const [serverCount1U, setServerCount1U] = useState<number>(4);
  const [serverCount2U, setServerCount2U] = useState<number>(2);
  const [switchCount, setSwitchCount] = useState<number>(2);

  // Load Aggregator Mode (Mode 3)
  const [loadList, setLoadList] = useState<UpsLoadItem[]>([
    { id: 'l1', name: 'Dual Monitor Workstation (GPU)', continuousWatts: 380, surgeMultiplier: 1.3, qty: 1, hoursNeeded: 2 },
    { id: 'l2', name: 'Wi-Fi 6 Router & Fiber Gateway', continuousWatts: 25, surgeMultiplier: 1.1, qty: 1, hoursNeeded: 6 },
    { id: 'l3', name: 'Network Video Recorder (NVR)', continuousWatts: 90, surgeMultiplier: 1.2, qty: 1, hoursNeeded: 4 }
  ]);

  // Generator Pairing Settings (Mode 5)
  const [dgOversizeFactor, setDgOversizeFactor] = useState<number>(1.75); // 1.75x recommended for UPS THD

  // Copy Feedback
  const [copied, setCopied] = useState<boolean>(false);

  // --- Dynamic Mathematical Calculations ---
  const activeTopology = useMemo(() => TOPOLOGY_PROFILES[topology], [topology]);
  const activeBattery = useMemo(() => BATTERY_PROFILES[chemistry], [chemistry]);

  // Sizing Calculations (Mode 1 & Core)
  const sizingMetrics = useMemo(() => {
    // 1. Apparent Power (VA) = Real Power (Watts) / Power Factor
    const continuousVa = loadWatts / Math.max(0.4, powerFactor);

    // 2. Headroom & Growth Sizing
    const headroomMultiplier = 1.0 + (growthMarginPercent / 100);
    const calculatedUpsVa = continuousVa * headroomMultiplier;

    // 3. Find next standard commercial UPS rating
    const recommendedStandardVa =
      STANDARD_COMMERCIAL_UPS_RATINGS.find(r => r >= calculatedUpsVa) ||
      Math.ceil(calculatedUpsVa / 5000) * 5000;

    const recommendedKva = recommendedStandardVa / 1000;

    // 4. Energy Required from Battery Bank
    // System Efficiency = Topology Inverter Efficiency * Wiring Efficiency (0.97)
    const systemEfficiency = (activeTopology.efficiencyPercent / 100) * 0.97;
    const grossEnergyWh = (loadWatts * backupHours) / (systemEfficiency * activeBattery.dod);
    const grossEnergyKwh = grossEnergyWh / 1000;

    // 5. Total Ah Required at DC Bus Voltage
    const totalBankAh = grossEnergyWh / dcVoltage;

    // 6. Battery Wiring Calculation (Series string for DC Voltage, Parallel for Ah)
    // Assume 12V modular battery units
    const seriesUnits = dcVoltage / 12;
    const parallelStrings = Math.max(1, Math.ceil(totalBankAh / singleBatteryAh));
    const totalPhysicalBatteries = seriesUnits * parallelStrings;
    const actualInstalledAh = parallelStrings * singleBatteryAh;
    const actualInstalledKwh = (actualInstalledAh * dcVoltage) / 1000;

    // 7. Direct Current Draw (Amps) on DC Bus
    const dcDischargeCurrentAmps = loadWatts / (dcVoltage * systemEfficiency);
    // DC Breaker Sizing = 1.25 * Continuous DC Current
    const dcBreakerRatingAmps = Math.ceil(dcDischargeCurrentAmps * 1.25 / 10) * 10;

    // Recommended Copper Cable Size (mm²) based on DC Current (approx 4 A/mm² rule)
    const recommendedCableMm2 = Math.max(4, Math.ceil(dcDischargeCurrentAmps / 4));

    // 8. Thermal Dissipation in BTU/hr
    const heatDissipationBtuHr = loadWatts * 3.41214;
    const tonsCooling = heatDissipationBtuHr / 12000;

    return {
      continuousVa,
      calculatedUpsVa,
      recommendedStandardVa,
      recommendedKva,
      grossEnergyWh,
      grossEnergyKwh,
      totalBankAh,
      seriesUnits,
      parallelStrings,
      totalPhysicalBatteries,
      actualInstalledAh,
      actualInstalledKwh,
      dcDischargeCurrentAmps,
      dcBreakerRatingAmps,
      recommendedCableMm2,
      heatDissipationBtuHr,
      tonsCooling
    };
  }, [
    loadWatts,
    powerFactor,
    growthMarginPercent,
    backupHours,
    activeTopology,
    activeBattery,
    dcVoltage,
    singleBatteryAh
  ]);

  // Data Center Rack Power Estimation (Mode 2)
  const dataCenterMetrics = useMemo(() => {
    // Standard power consumptions: 1U server ~350W, 2U storage ~550W, Switch ~120W
    const rackWatts =
      serverCount1U * 350 +
      serverCount2U * 550 +
      switchCount * 120;

    const redundancyMultiplier = redundancy === 'standalone' ? 1.0 : redundancy === 'n_plus_1' ? 1.35 : 2.0;
    const totalDcWatts = rackWatts * redundancyMultiplier;
    const totalDcVa = totalDcWatts / 0.92; // 0.92 server PSU power factor

    return {
      rackWatts,
      totalDcWatts,
      totalDcVa
    };
  }, [serverCount1U, serverCount2U, switchCount, redundancy]);

  // Load Aggregator Aggregated Watts (Mode 3)
  const aggregatedLoadTotal = useMemo(() => {
    let continuous = 0;
    let peakSurge = 0;
    loadList.forEach(item => {
      const active = item.continuousWatts * item.qty;
      continuous += active;
      peakSurge += active * item.surgeMultiplier;
    });
    return { continuous, peakSurge };
  }, [loadList]);

  // Generator Sizing Recommendation (Mode 5)
  const generatorMetrics = useMemo(() => {
    const requiredKva = sizingMetrics.recommendedKva;
    const recommendedDgKva = Math.ceil((requiredKva * dgOversizeFactor) / 2.5) * 2.5; // round to standard DG sizes (5, 7.5, 10, 15, 20 kVA)
    const dgKw = recommendedDgKva * 0.8; // standard 0.8 PF for DG sets

    return {
      recommendedDgKva,
      dgKw
    };
  }, [sizingMetrics.recommendedKva, dgOversizeFactor]);

  // Handle Preset Selection
  const handleLoadScenario = (preset: UpsScenarioPreset) => {
    setLoadWatts(preset.loadWatts);
    setPowerFactor(preset.powerFactor);
    setBackupHours(preset.backupHours);
    setTopology(preset.topology);
    setDcVoltage(preset.dcVoltage);
    setChemistry(preset.chemistry);
  };

  // Add Item to Load Aggregator
  const handleAddLoadItem = (preset: Omit<UpsLoadItem, 'id'>) => {
    const newItem: UpsLoadItem = {
      ...preset,
      id: `ups-load-${Date.now()}-${Math.random()}`
    };
    setLoadList(prev => [...prev, newItem]);
  };

  // Apply Aggregated Load to Main Sizer
  const handleApplyAggregatedLoad = () => {
    setLoadWatts(aggregatedLoadTotal.continuous);
    setActiveMode('standard_sizer');
  };

  // Copy Full Specification Sheet
  const handleCopySpecSheet = () => {
    const text = `⚡ Toolique UPS Capacity & Battery Sizing Engineering Sheet
===================================================
Generated: ${new Date().toLocaleDateString()}
Connected Electrical Load: ${loadWatts} Watts (${sizingMetrics.continuousVa.toFixed(0)} VA @ PF ${powerFactor})
Required Backup Duration: ${backupHours} Hours
UPS Topology: ${activeTopology.fullName}
Transfer Switch Time: ${activeTopology.transferTimeMs}
Safety & Headroom Margin: ${growthMarginPercent}%

🏆 RECOMMENDED UPS CAPACITY:
- Recommended Standard UPS: ${sizingMetrics.recommendedStandardVa >= 1000 ? `${sizingMetrics.recommendedKva.toFixed(1)} kVA` : `${sizingMetrics.recommendedStandardVa} VA`}
- Output Waveform: ${activeTopology.waveform}

🔋 BATTERY BANK CONFIGURATION:
- Battery Chemistry: ${activeBattery.name} (DoD: ${activeBattery.dod * 100}%)
- DC Bus Voltage: ${dcVoltage}V DC
- Required Battery Capacity: ${sizingMetrics.totalBankAh.toFixed(1)} Ah (${sizingMetrics.grossEnergyKwh.toFixed(2)} kWh)
- Recommended Modular Setup: ${sizingMetrics.totalPhysicalBatteries} × 12V ${singleBatteryAh}Ah Batteries
  (${sizingMetrics.seriesUnits} in Series × ${sizingMetrics.parallelStrings} Parallel String${sizingMetrics.parallelStrings > 1 ? 's' : ''})
- Full Load DC Discharge: ${sizingMetrics.dcDischargeCurrentAmps.toFixed(1)} Amps
- Recommended DC Breaker: ${sizingMetrics.dcBreakerRatingAmps}A DC Circuit Breaker
- Recommended Cable Cross-Section: ${sizingMetrics.recommendedCableMm2} mm² Pure Copper Cable

❄️ THERMAL & GENERATOR SIZING:
- Thermal Heat Output: ${sizingMetrics.heatDissipationBtuHr.toFixed(0)} BTU/hr (~${sizingMetrics.tonsCooling.toFixed(2)} Tons AC)
- Recommended Matching Backup DG Generator: ${generatorMetrics.recommendedDgKva} kVA
===================================================`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export CSV
  const handleExportCSV = () => {
    const lines = [
      ['Parameter', 'Value', 'Unit'],
      ['Connected Load', loadWatts.toString(), 'Watts'],
      ['Power Factor', powerFactor.toString(), ''],
      ['Apparent Power', sizingMetrics.continuousVa.toFixed(0), 'VA'],
      ['Recommended UPS Rating', sizingMetrics.recommendedStandardVa.toString(), 'VA'],
      ['UPS Topology', activeTopology.name, ''],
      ['Backup Time', backupHours.toString(), 'Hours'],
      ['Battery Voltage', dcVoltage.toString(), 'V DC'],
      ['Battery Chemistry', activeBattery.name, ''],
      ['Required Battery Bank', sizingMetrics.totalBankAh.toFixed(1), 'Ah'],
      ['Total 12V Batteries Needed', sizingMetrics.totalPhysicalBatteries.toString(), 'Units'],
      ['DC Discharge Current', sizingMetrics.dcDischargeCurrentAmps.toFixed(1), 'Amps'],
      ['Matching DG Generator', generatorMetrics.recommendedDgKva.toString(), 'kVA']
    ];
    const csvContent = lines.map(l => l.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ups_sizing_${loadWatts}W_${sizingMetrics.recommendedStandardVa}VA.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* AEO Instant UPS Insights Card (Zero Double Heading) */}
      <div className="bg-gradient-to-br from-indigo-50/90 via-white to-blue-50/70 dark:from-indigo-950/30 dark:via-zinc-900/60 dark:to-blue-950/20 border border-indigo-200/80 dark:border-indigo-900/40 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-600 text-white uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3 h-3 fill-current" /> AEO UPS Sizing
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                {activeTopology.name} ({activeTopology.transferTimeMs})
              </span>
            </div>
            <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 flex-wrap">
              <span>Recommended UPS: <strong className="text-indigo-600 dark:text-indigo-400 font-mono text-base">{sizingMetrics.recommendedStandardVa >= 1000 ? `${sizingMetrics.recommendedKva.toFixed(1)} kVA` : `${sizingMetrics.recommendedStandardVa} VA`}</strong></span>
              <span className="text-zinc-300 dark:text-zinc-700">|</span>
              <span>Battery Bank: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{sizingMetrics.totalBankAh.toFixed(0)} Ah @ {dcVoltage}V</strong></span>
              <span className="text-zinc-300 dark:text-zinc-700">|</span>
              <span>Runtime: <strong className="font-mono">{backupHours} Hours</strong></span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopySpecSheet}
              className="px-3 py-1.5 bg-white dark:bg-zinc-800 hover:bg-zinc-50 text-zinc-700 dark:text-zinc-200 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-indigo-500" />}
              <span>{copied ? 'Copied Specs!' : 'Copy Spec Sheet'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* 1-Click Scenario Presets */}
        <div className="mt-3 pt-3 border-t border-indigo-100/70 dark:border-indigo-900/30 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-indigo-500" /> Archetypes:
          </span>
          {UPS_PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => handleLoadScenario(preset)}
              className="px-2.5 py-1 rounded-lg bg-white/90 dark:bg-zinc-800/90 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 text-xs font-medium border border-zinc-200/80 dark:border-zinc-700/60 transition cursor-pointer"
            >
              {preset.name} ({preset.loadWatts}W)
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto no-scrollbar gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/70 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/60">
        {[
          { id: 'standard_sizer', label: '🖥️ UPS & Battery Bank Sizer', icon: Cpu },
          { id: 'battery_wiring', label: '🔋 Series/Parallel Wiring Spec', icon: BatteryCharging },
          { id: 'datacenter_rack', label: '🏢 Server Rack & Data Center', icon: Server },
          { id: 'load_aggregator', label: '🔌 Load Aggregator', icon: Zap },
          { id: 'generator_pairing', label: '⚡ Generator (DG) Sizing', icon: Shield }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeMode === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveMode(tab.id as UpsCalculatorMode)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs border border-zinc-200/50 dark:border-zinc-700/50'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Primary Workspace Views */}

      {/* MODE 1: STANDARD SIZER */}
      {activeMode === 'standard_sizer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Inputs (Left 7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-indigo-500" />
                <span>Electrical Load & Sizing Criteria</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-bold text-zinc-500">
                      CONNECTED LOAD (WATTS)
                    </label>
                    <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                      <span>PF:</span>
                      <select
                        value={powerFactor}
                        onChange={(e) => setPowerFactor(Number(e.target.value))}
                        className="bg-transparent font-bold text-indigo-600 focus:outline-none cursor-pointer"
                      >
                        <option value={0.7}>0.70</option>
                        <option value={0.8}>0.80</option>
                        <option value={0.85}>0.85</option>
                        <option value={0.9}>0.90</option>
                        <option value={0.95}>0.95</option>
                        <option value={1.0}>1.00</option>
                      </select>
                    </div>
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={loadWatts}
                    onChange={(e) => setLoadWatts(Math.max(1, Number(e.target.value)))}
                    className="w-full text-xs font-mono font-bold bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                  <div className="text-[10px] text-zinc-400 mt-1">
                    Continuous Apparent Power: {sizingMetrics.continuousVa.toFixed(0)} VA
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                    DESIRED BACKUP TIME (HOURS)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    max="72"
                    value={backupHours}
                    onChange={(e) => setBackupHours(Math.max(0.1, Number(e.target.value)))}
                    className="w-full text-xs font-mono font-bold bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                    UPS ARCHITECTURE & TOPOLOGY
                  </label>
                  <select
                    value={topology}
                    onChange={(e) => setTopology(e.target.value as UpsTopology)}
                    className="w-full text-xs font-bold bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer"
                  >
                    {Object.entries(TOPOLOGY_PROFILES).map(([key, prof]) => (
                      <option key={key} value={key}>
                        {prof.fullName}
                      </option>
                    ))}
                  </select>
                  <div className="text-[10px] text-zinc-400 mt-1">
                    Transfer: {activeTopology.transferTimeMs} | Waveform: {activeTopology.waveform}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                    BATTERY CHEMISTRY
                  </label>
                  <select
                    value={chemistry}
                    onChange={(e) => setChemistry(e.target.value as BatteryChemistry)}
                    className="w-full text-xs font-bold bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer"
                  >
                    {Object.entries(BATTERY_PROFILES).map(([key, prof]) => (
                      <option key={key} value={key}>
                        {prof.name} ({prof.dod * 100}% DoD, {prof.cycleLife} cycles)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                    SYSTEM DC BUS VOLTAGE (V)
                  </label>
                  <select
                    value={dcVoltage}
                    onChange={(e) => setDcVoltage(Number(e.target.value) as DcVoltageOption)}
                    className="w-full text-xs font-bold bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer"
                  >
                    <option value={12}>12 V (1 Battery)</option>
                    <option value={24}>24 V (2 Batteries in Series)</option>
                    <option value={36}>36 V (3 in Series)</option>
                    <option value={48}>48 V (4 in Series)</option>
                    <option value={72}>72 V (6 in Series)</option>
                    <option value={96}>96 V (8 in Series)</option>
                    <option value={120}>120 V</option>
                    <option value={192}>192 V (16 in Series)</option>
                    <option value={240}>240 V (20 in Series)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                    FUTURE GROWTH HEADROOM (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={growthMarginPercent}
                    onChange={(e) => setGrowthMarginPercent(Math.max(0, Number(e.target.value)))}
                    className="w-full text-xs font-mono font-bold bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 focus:outline-none"
                  />
                  <div className="text-[10px] text-zinc-400 mt-1">Recommended: 20% to 30% buffer</div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Summary Card (Right 5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-indigo-500" />
                <span>Recommended UPS Capacity</span>
              </h4>

              {/* Giant UPS kVA Box */}
              <div className="text-center py-6 px-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                <span className="block text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                  Recommended Commercial Rating
                </span>
                <div className="text-3xl font-black text-indigo-700 dark:text-indigo-300 font-mono mt-1">
                  {sizingMetrics.recommendedStandardVa >= 1000 ? `${sizingMetrics.recommendedKva.toFixed(1)} kVA` : `${sizingMetrics.recommendedStandardVa} VA`}
                </div>
                <span className="block text-[11px] text-zinc-500 mt-1">
                  Covers {loadWatts}W load + {growthMarginPercent}% headroom ({sizingMetrics.calculatedUpsVa.toFixed(0)} VA minimum)
                </span>
              </div>

              {/* Grid Specs */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-150 dark:border-zinc-850">
                  <div className="text-[10px] font-bold text-zinc-400 font-sans uppercase">Battery Bank Ah</div>
                  <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {sizingMetrics.totalBankAh.toFixed(0)} Ah
                  </div>
                  <div className="text-[10px] text-zinc-500 font-sans">At {dcVoltage}V DC bus</div>
                </div>

                <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-150 dark:border-zinc-850">
                  <div className="text-[10px] font-bold text-zinc-400 font-sans uppercase">Gross Energy</div>
                  <div className="text-base font-bold text-zinc-900 dark:text-white mt-0.5">
                    {sizingMetrics.grossEnergyKwh.toFixed(2)} kWh
                  </div>
                  <div className="text-[10px] text-zinc-500 font-sans">{activeBattery.dod * 100}% DoD applied</div>
                </div>

                <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-150 dark:border-zinc-850">
                  <div className="text-[10px] font-bold text-zinc-400 font-sans uppercase">DC Current Draw</div>
                  <div className="text-base font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
                    {sizingMetrics.dcDischargeCurrentAmps.toFixed(1)} A
                  </div>
                  <div className="text-[10px] text-zinc-500 font-sans">Fuse: {sizingMetrics.dcBreakerRatingAmps}A DC</div>
                </div>

                <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-150 dark:border-zinc-850">
                  <div className="text-[10px] font-bold text-zinc-400 font-sans uppercase">Cable Sizing</div>
                  <div className="text-base font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
                    {sizingMetrics.recommendedCableMm2} mm²
                  </div>
                  <div className="text-[10px] text-zinc-500 font-sans">Pure copper core</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: BATTERY WIRING SPEC */}
      {activeMode === 'battery_wiring' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-5">
            <div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <BatteryCharging className="w-4 h-4 text-emerald-500" />
                <span>Battery Bank Series & Parallel Wiring Architecture</span>
              </h4>
              <p className="text-xs text-zinc-500">
                Modular configuration instructions using standard 12V battery building blocks.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                  INDIVIDUAL 12V BATTERY CAPACITY (Ah)
                </label>
                <select
                  value={singleBatteryAh}
                  onChange={(e) => setSingleBatteryAh(Number(e.target.value))}
                  className="w-full text-xs font-bold bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer"
                >
                  <option value={100}>100 Ah (Standard)</option>
                  <option value={150}>150 Ah (Most Common)</option>
                  <option value={200}>200 Ah (High Capacity)</option>
                  <option value={220}>220 Ah (Tall Tubular)</option>
                  <option value={250}>250 Ah (Commercial)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                  DC BUS VOLTAGE (V)
                </label>
                <input
                  type="text"
                  readOnly
                  value={`${dcVoltage} V DC Bus (${sizingMetrics.seriesUnits} Batteries in Series)`}
                  className="w-full text-xs font-mono font-bold bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-2.5 text-zinc-700 dark:text-zinc-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                <div className="text-[10px] font-bold text-emerald-700 uppercase">Total Batteries Required</div>
                <div className="text-3xl font-black text-emerald-800 dark:text-emerald-300 font-mono mt-1">
                  {sizingMetrics.totalPhysicalBatteries} Units
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">12V {singleBatteryAh}Ah standard batteries</div>
              </div>

              <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <div className="text-[10px] font-bold text-zinc-400 uppercase">String Layout</div>
                <div className="text-lg font-bold text-zinc-900 dark:text-white font-mono mt-1">
                  {sizingMetrics.seriesUnits}S × {sizingMetrics.parallelStrings}P
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">
                  {sizingMetrics.seriesUnits} in series per string, {sizingMetrics.parallelStrings} string{sizingMetrics.parallelStrings > 1 ? 's' : ''} in parallel
                </div>
              </div>

              <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <div className="text-[10px] font-bold text-zinc-400 uppercase">Actual Installed Capacity</div>
                <div className="text-lg font-bold text-zinc-900 dark:text-white font-mono mt-1">
                  {sizingMetrics.actualInstalledAh} Ah ({sizingMetrics.actualInstalledKwh.toFixed(2)} kWh)
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">At {dcVoltage}V system voltage</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: DATACENTER RACK SIZER */}
      {activeMode === 'datacenter_rack' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-5">
            <div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Server className="w-4 h-4 text-indigo-500" />
                <span>Enterprise Data Center & Server Rack Power Sizer</span>
              </h4>
              <p className="text-xs text-zinc-500">
                Estimate total compute rack power demands, redundancy schemes (N+1 / 2N), and HVAC cooling requirements.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                  1U SERVERS (~350W)
                </label>
                <input
                  type="number"
                  min="0"
                  value={serverCount1U}
                  onChange={(e) => setServerCount1U(Math.max(0, Number(e.target.value)))}
                  className="w-full text-xs font-mono font-bold bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                  2U STORAGE NODES (~550W)
                </label>
                <input
                  type="number"
                  min="0"
                  value={serverCount2U}
                  onChange={(e) => setServerCount2U(Math.max(0, Number(e.target.value)))}
                  className="w-full text-xs font-mono font-bold bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                  POE SWITCHES (~120W)
                </label>
                <input
                  type="number"
                  min="0"
                  value={switchCount}
                  onChange={(e) => setSwitchCount(Math.max(0, Number(e.target.value)))}
                  className="w-full text-xs font-mono font-bold bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                  REDUNDANCY SCHEME
                </label>
                <select
                  value={redundancy}
                  onChange={(e) => setRedundancy(e.target.value as RedundancyScheme)}
                  className="w-full text-xs font-bold bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer"
                >
                  <option value="standalone">N (Standalone Single UPS)</option>
                  <option value="n_plus_1">N+1 (Parallel Redundant)</option>
                  <option value="two_n">2N (Dual Corded A/B Feed)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-200 dark:border-indigo-800">
                <div className="text-[10px] font-bold text-indigo-700 uppercase">Total Rack Compute Load</div>
                <div className="text-2xl font-bold font-mono text-indigo-800 dark:text-indigo-300 mt-1">
                  {dataCenterMetrics.rackWatts.toLocaleString()} Watts
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">Base IT power draw without redundancy</div>
              </div>

              <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <div className="text-[10px] font-bold text-zinc-400 uppercase">Sized Redundant UPS</div>
                <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-white mt-1">
                  {(dataCenterMetrics.totalDcVa / 1000).toFixed(1)} kVA
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">Includes {redundancy.toUpperCase()} redundancy overhead</div>
              </div>

              <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <div className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-1">
                  <Flame className="w-3 h-3 text-rose-500" />
                  <span>HVAC Cooling Requirement</span>
                </div>
                <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-white mt-1">
                  {(dataCenterMetrics.rackWatts * 3.41214 / 12000).toFixed(1)} Tons AC
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">{(dataCenterMetrics.rackWatts * 3.41214).toFixed(0)} BTU/hr heat load</div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  setLoadWatts(dataCenterMetrics.rackWatts);
                  setTopology('online_double_conversion');
                  setDcVoltage(96);
                  setChemistry('lifepo4');
                  setActiveMode('standard_sizer');
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
              >
                Apply Data Center Load ({dataCenterMetrics.rackWatts}W) to UPS Sizer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODE 4: LOAD AGGREGATOR */}
      {activeMode === 'load_aggregator' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-indigo-500" />
                  <span>Connected Device Load Inventory & Surge Aggregator</span>
                </h4>
                <p className="text-xs text-zinc-500">
                  Build your custom appliance list to compute continuous running and inrush peak surge watts.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-zinc-500">
                  Running: <strong className="text-indigo-600 text-sm">{aggregatedLoadTotal.continuous} W</strong>
                  {' '}| Surge: <strong className="text-amber-600 text-sm">{aggregatedLoadTotal.peakSurge.toFixed(0)} W</strong>
                </span>
                <button
                  onClick={handleApplyAggregatedLoad}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
                >
                  Use {aggregatedLoadTotal.continuous}W in Sizer
                </button>
              </div>
            </div>

            {/* Quick Add Catalog */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase flex items-center mr-1">
                + Quick Catalog:
              </span>
              {PRESET_LOAD_CATALOG.map((item, idx) => (
                <button
                  key={`cat-${idx}`}
                  onClick={() => handleAddLoadItem(item)}
                  className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-50 text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 text-[11px] font-medium transition cursor-pointer"
                >
                  + {item.name} ({item.continuousWatts}W)
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden mt-3">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500 uppercase text-[10px] font-bold font-sans">
                  <tr>
                    <th className="p-2.5 pl-3">Appliance</th>
                    <th className="p-2.5 text-center">Watts</th>
                    <th className="p-2.5 text-center">Surge Multiplier</th>
                    <th className="p-2.5 text-center">Quantity</th>
                    <th className="p-2.5 text-right">Subtotal Watts</th>
                    <th className="p-2.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {loadList.map(item => (
                    <tr key={item.id}>
                      <td className="p-2.5 pl-3 font-sans font-semibold text-zinc-800 dark:text-zinc-200">{item.name}</td>
                      <td className="p-2.5 text-center">{item.continuousWatts} W</td>
                      <td className="p-2.5 text-center">{item.surgeMultiplier}x</td>
                      <td className="p-2.5 text-center">
                        <input
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={(e) => {
                            const val = Math.max(1, Number(e.target.value));
                            setLoadList(prev => prev.map(l => l.id === item.id ? { ...l, qty: val } : l));
                          }}
                          className="w-12 p-1 text-center bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none"
                        />
                      </td>
                      <td className="p-2.5 text-right font-bold text-indigo-600">
                        {item.continuousWatts * item.qty} W
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          onClick={() => setLoadList(prev => prev.filter(l => l.id !== item.id))}
                          className="text-zinc-400 hover:text-rose-500 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODE 5: GENERATOR PAIRING SIZING */}
      {activeMode === 'generator_pairing' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-5">
            <div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-500" />
                <span>Backup Diesel / Gas Generator (DG Set) Sizing Compatibility</span>
              </h4>
              <p className="text-xs text-zinc-500">
                To prevent frequency oscillation, harmonic distortion (THD), and voltage hunting, generator capacity must be oversized relative to the UPS.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                  CURRENT UPS CAPACITY
                </label>
                <input
                  type="text"
                  readOnly
                  value={`${sizingMetrics.recommendedKva.toFixed(1)} kVA (${sizingMetrics.recommendedStandardVa} VA)`}
                  className="w-full text-xs font-mono font-bold bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-2.5 text-zinc-800 dark:text-zinc-200"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                  GENERATOR OVERSIZE RATIO
                </label>
                <select
                  value={dgOversizeFactor}
                  onChange={(e) => setDgOversizeFactor(Number(e.target.value))}
                  className="w-full text-xs font-bold bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer"
                >
                  <option value={1.5}>1.5× (Online UPS with Active PFC / 6-Pulse with Filter)</option>
                  <option value={1.75}>1.75× (Standard Line-Interactive & Double-Conversion)</option>
                  <option value={2.0}>2.0× (Standard Inverters / High Harmonic Non-linear Loads)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-800">
                <div className="text-[10px] font-bold text-amber-700 uppercase">Recommended Generator kVA</div>
                <div className="text-3xl font-black text-amber-800 dark:text-amber-300 font-mono mt-1">
                  {generatorMetrics.recommendedDgKva} kVA DG Set
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">
                  ({generatorMetrics.dgKw.toFixed(1)} kW prime power rating at 0.8 power factor)
                </div>
              </div>

              <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed space-y-1.5">
                <div className="font-bold text-zinc-900 dark:text-zinc-100">Why Oversizing is Required:</div>
                <p>
                  UPS rectifiers generate current harmonics and present step-load transitions when switching between mains and battery. A minimum 1.5×–1.75× ratio ensures the generator’s Electronic Governor maintains stable 50/60 Hz frequency.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

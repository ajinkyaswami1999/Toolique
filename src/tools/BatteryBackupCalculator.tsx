/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from 'react';
import {
  Zap,
  Sparkles,
  Copy,
  Check,
  Trash2,
  Sun,
  Shield,
  Clock,
  Download,
  BatteryCharging,
  Sliders,
  DollarSign
} from 'lucide-react';

// --- Type Definitions ---
export type CalculatorMode = 'runtime' | 'sizer' | 'load_builder' | 'charging' | 'tco_compare';
export type BatteryChemistry = 'tubular' | 'agm' | 'gel' | 'lithium_nmc' | 'lifepo4' | 'sodium_ion';
export type VoltageOption = 12 | 24 | 36 | 48 | 72 | 96;

export interface BatteryChemistryProfile {
  name: string;
  fullName: string;
  dod: number; // Safe Depth of Discharge (0.0 to 1.0)
  peukertExponent: number; // Peukert's constant (1.02 to 1.30)
  roundTripEfficiency: number; // Energy efficiency (0.80 to 0.98)
  cycleLife: number; // Expected cycles at rated DoD
  nominalVoltagePerCell: number;
  costPerKwhInr: number; // Approx ₹ cost per kWh
  densityWhPerKg: number;
  recommendedCRate: number; // e.g. 0.1 for C/10, 0.5 for C/2
}

export const CHEMISTRY_PROFILES: Record<BatteryChemistry, BatteryChemistryProfile> = {
  tubular: {
    name: 'Tubular Lead-Acid',
    fullName: 'Flooded Tall Tubular Lead-Acid (Deep Cycle)',
    dod: 0.50,
    peukertExponent: 1.25,
    roundTripEfficiency: 0.82,
    cycleLife: 1200,
    nominalVoltagePerCell: 2.0,
    costPerKwhInr: 9000,
    densityWhPerKg: 30,
    recommendedCRate: 0.10
  },
  agm: {
    name: 'AGM VRLA',
    fullName: 'Absorbent Glass Mat (AGM) Sealed Lead-Acid',
    dod: 0.60,
    peukertExponent: 1.18,
    roundTripEfficiency: 0.85,
    cycleLife: 800,
    nominalVoltagePerCell: 2.0,
    costPerKwhInr: 11000,
    densityWhPerKg: 35,
    recommendedCRate: 0.15
  },
  gel: {
    name: 'GEL Deep-Cycle',
    fullName: 'GEL Electrolyte Deep-Cycle Sealed VRLA',
    dod: 0.70,
    peukertExponent: 1.15,
    roundTripEfficiency: 0.88,
    cycleLife: 1500,
    nominalVoltagePerCell: 2.0,
    costPerKwhInr: 13500,
    densityWhPerKg: 38,
    recommendedCRate: 0.15
  },
  lithium_nmc: {
    name: 'Lithium-Ion (NMC)',
    fullName: 'Lithium Nickel Manganese Cobalt Oxide (NMC)',
    dod: 0.85,
    peukertExponent: 1.05,
    roundTripEfficiency: 0.94,
    cycleLife: 2500,
    nominalVoltagePerCell: 3.7,
    costPerKwhInr: 19000,
    densityWhPerKg: 160,
    recommendedCRate: 0.50
  },
  lifepo4: {
    name: 'LiFePO4 (LFP)',
    fullName: 'Lithium Iron Phosphate (LiFePO4 / LFP)',
    dod: 0.95,
    peukertExponent: 1.02,
    roundTripEfficiency: 0.97,
    cycleLife: 5000,
    nominalVoltagePerCell: 3.2,
    costPerKwhInr: 22000,
    densityWhPerKg: 130,
    recommendedCRate: 0.50
  },
  sodium_ion: {
    name: 'Sodium-Ion (Na-Ion)',
    fullName: 'Sodium-Ion Battery (Next-Gen Cold Resilient)',
    dod: 0.90,
    peukertExponent: 1.04,
    roundTripEfficiency: 0.92,
    cycleLife: 3000,
    nominalVoltagePerCell: 3.1,
    costPerKwhInr: 14000,
    densityWhPerKg: 110,
    recommendedCRate: 0.35
  }
};

export interface LoadItem {
  id: string;
  name: string;
  watts: number;
  qty: number;
  hoursNeeded: number;
}

const PRESET_LOAD_ITEMS: Omit<LoadItem, 'id'>[] = [
  { name: 'BLDC Ceiling Fan', watts: 28, qty: 3, hoursNeeded: 6 },
  { name: 'Standard Induction Fan', watts: 75, qty: 2, hoursNeeded: 4 },
  { name: 'LED Tube Light (20W)', watts: 20, qty: 4, hoursNeeded: 6 },
  { name: 'LED Bulb (9W)', watts: 9, qty: 6, hoursNeeded: 6 },
  { name: 'Wi-Fi Router & ONT', watts: 15, qty: 1, hoursNeeded: 12 },
  { name: 'Laptop Workstation', watts: 65, qty: 2, hoursNeeded: 8 },
  { name: 'Smart LED TV 55"', watts: 110, qty: 1, hoursNeeded: 4 },
  { name: 'Inverter Refrigerator (Running Avg)', watts: 120, qty: 1, hoursNeeded: 8 },
  { name: 'Medical CPAP Machine', watts: 60, qty: 1, hoursNeeded: 8 },
  { name: 'CCTV Security NVR + 4 Cameras', watts: 45, qty: 1, hoursNeeded: 24 }
];

export interface ScenarioPreset {
  id: string;
  name: string;
  subtitle: string;
  loadWatts: number;
  hoursNeeded: number;
  batteryVoltage: VoltageOption;
  batteryAh: number;
  chemistry: BatteryChemistry;
}

const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: 'wfh_standard',
    name: 'Home Office / WFH Inverter',
    subtitle: '2 Fans, 4 LEDs, 2 Laptops, Wi-Fi (~250W load for 6 hours)',
    loadWatts: 250,
    hoursNeeded: 6,
    batteryVoltage: 12,
    batteryAh: 150,
    chemistry: 'tubular'
  },
  {
    id: 'home_emergency',
    name: '2BHK Emergency Backup',
    subtitle: '3 BLDC Fans, 6 LEDs, Wi-Fi, TV (~380W load for 4 hours)',
    loadWatts: 380,
    hoursNeeded: 4,
    batteryVoltage: 12,
    batteryAh: 200,
    chemistry: 'lifepo4'
  },
  {
    id: 'cpap_medical',
    name: 'Medical CPAP / Critical Care',
    subtitle: 'Continuous 80W medical equipment for 8 hours overnight',
    loadWatts: 80,
    hoursNeeded: 8,
    batteryVoltage: 12,
    batteryAh: 100,
    chemistry: 'lifepo4'
  },
  {
    id: 'offgrid_solar',
    name: 'Off-Grid Solar Cabin',
    subtitle: 'Heavy 1200W solar load backed up for 8 hours at 48V DC Bus',
    loadWatts: 1200,
    hoursNeeded: 8,
    batteryVoltage: 48,
    batteryAh: 250,
    chemistry: 'lifepo4'
  },
  {
    id: 'telecom_cctv',
    name: 'CCTV & Telecom Tower',
    subtitle: '24-Hour continuous 120W DC load for remote surveillance',
    loadWatts: 120,
    hoursNeeded: 24,
    batteryVoltage: 24,
    batteryAh: 200,
    chemistry: 'lifepo4'
  }
];

export default function BatteryBackupCalculator() {
  // Navigation & Mode
  const [activeMode, setActiveMode] = useState<CalculatorMode>('runtime');

  // Core Inputs
  const [loadWatts, setLoadWatts] = useState<number>(300);
  const [powerFactor, setPowerFactor] = useState<number>(0.85); // For VA conversion
  const [batteryVoltage, setBatteryVoltage] = useState<VoltageOption>(12);
  const [batteryAh, setBatteryAh] = useState<number>(150);
  const [batteryQty, setBatteryQty] = useState<number>(1);
  const [chemistry, setChemistry] = useState<BatteryChemistry>('tubular');
  const [inverterEfficiency, setInverterEfficiency] = useState<number>(85); // 85%
  const [wireLossPercent, setWireLossPercent] = useState<number>(3); // 3% cable drop
  const [ambientTempC, setAmbientTempC] = useState<number>(25); // 25°C baseline
  const [usePeukert, setUsePeukert] = useState<boolean>(true);

  // Target Sizer Mode Inputs (Mode 2)
  const [targetRuntimeHours, setTargetRuntimeHours] = useState<number>(6);
  const [safetyMarginPercent, setSafetyMarginPercent] = useState<number>(20); // 20% cushion

  // Load Builder Mode State (Mode 3)
  const [loadList, setLoadList] = useState<LoadItem[]>([
    { id: 'l1', name: 'BLDC Ceiling Fan', watts: 28, qty: 3, hoursNeeded: 6 },
    { id: 'l2', name: 'LED Tube Light (20W)', watts: 20, qty: 4, hoursNeeded: 6 },
    { id: 'l3', name: 'Wi-Fi Router & Fiber ONT', watts: 15, qty: 1, hoursNeeded: 12 },
    { id: 'l4', name: 'Laptop Computer', watts: 65, qty: 2, hoursNeeded: 8 }
  ]);

  // Charging Mode State (Mode 4)
  const [chargerCurrentAmps, setChargerCurrentAmps] = useState<number>(15); // e.g. 15A mains charger
  const [solarPeakSunHours, setSolarPeakSunHours] = useState<number>(4.5);

  // Copy Feedback
  const [copied, setCopied] = useState<boolean>(false);

  // --- Dynamic Calculations ---
  const activeProfile = useMemo(() => CHEMISTRY_PROFILES[chemistry], [chemistry]);

  // Temperature Derating Factor (Capacity reduces below 25°C for lead-acid, less for LFP/Sodium)
  const tempFactor = useMemo(() => {
    if (ambientTempC >= 25) return 1.0;
    if (chemistry === 'lifepo4' || chemistry === 'sodium_ion') {
      return Math.max(0.70, 1.0 - (25 - ambientTempC) * 0.005);
    }
    // Lead acid drops ~1% per °C below 25°C
    return Math.max(0.50, 1.0 - (25 - ambientTempC) * 0.012);
  }, [ambientTempC, chemistry]);

  // Combined Inverter & Wiring Efficiency
  const totalSystemEfficiency = useMemo(() => {
    const invEff = inverterEfficiency / 100;
    const wireEff = 1.0 - (wireLossPercent / 100);
    return Math.max(0.5, invEff * wireEff);
  }, [inverterEfficiency, wireLossPercent]);

  // --- Mode 1: Runtime Engine ---
  const runtimeMetrics = useMemo(() => {
    const totalBankAh = batteryAh * batteryQty;
    const totalNominalWh = totalBankAh * batteryVoltage;
    const usableWh = totalNominalWh * activeProfile.dod * tempFactor;

    // Direct Current draw on DC Bus (Amps) = Load Watts / (Voltage * System Efficiency)
    const dcCurrentAmps = loadWatts / (batteryVoltage * totalSystemEfficiency);

    // C-Rate of discharge
    const cRate = totalBankAh > 0 ? dcCurrentAmps / totalBankAh : 0;

    // Linear runtime without Peukert (Hours)
    const linearHours = (usableWh * totalSystemEfficiency) / Math.max(1, loadWatts);

    // Peukert-corrected runtime
    let peukertHours = linearHours;
    if (usePeukert && totalBankAh > 0 && dcCurrentAmps > 0) {
      const H = 20; // 20-hour standardized rating capacity
      const k = activeProfile.peukertExponent;
      const ratedCurrent = totalBankAh / H;
      // Peukert's law formula: t = H * (I_rated / I_actual)^k
      const effectiveFullDischargeHours = H * Math.pow(ratedCurrent / dcCurrentAmps, k);
      peukertHours = effectiveFullDischargeHours * activeProfile.dod * tempFactor * totalSystemEfficiency;
    }

    const finalHoursDecimal = Math.max(0, peukertHours);
    const wholeHours = Math.floor(finalHoursDecimal);
    const minutes = Math.round((finalHoursDecimal - wholeHours) * 60);

    const apparentPowerVA = loadWatts / Math.max(0.5, powerFactor);

    return {
      totalBankAh,
      totalNominalWh,
      totalNominalKwh: totalNominalWh / 1000,
      usableWh,
      usableKwh: usableWh / 1000,
      dcCurrentAmps,
      cRate,
      apparentPowerVA,
      linearHours,
      peukertHours: finalHoursDecimal,
      wholeHours,
      minutes
    };
  }, [
    batteryAh,
    batteryQty,
    batteryVoltage,
    activeProfile,
    tempFactor,
    loadWatts,
    totalSystemEfficiency,
    usePeukert,
    powerFactor
  ]);

  // --- Mode 2: Required Battery Sizer Engine ---
  const sizerMetrics = useMemo(() => {
    // Energy needed at load = Watts * Target Hours
    const loadEnergyNeededWh = loadWatts * targetRuntimeHours;
    // Account for safety margin, system efficiency, DoD, and temperature
    const marginMultiplier = 1.0 + safetyMarginPercent / 100;
    const requiredUsableEnergyWh = (loadEnergyNeededWh * marginMultiplier) / totalSystemEfficiency;
    const requiredGrossEnergyWh = requiredUsableEnergyWh / (activeProfile.dod * tempFactor);
    const requiredGrossEnergyKwh = requiredGrossEnergyWh / 1000;

    const requiredAhAtVoltage = requiredGrossEnergyWh / batteryVoltage;

    // Standard battery units recommendations (assuming 150Ah or 200Ah 12V blocks)
    const singleBlockAh = 150;
    const singleBlockWh = 12 * singleBlockAh;
    const recommendedBatteryCount = Math.ceil(requiredGrossEnergyWh / singleBlockWh);

    const estimatedCostInr = requiredGrossEnergyKwh * activeProfile.costPerKwhInr;

    return {
      loadEnergyNeededWh,
      requiredUsableEnergyWh,
      requiredGrossEnergyWh,
      requiredGrossEnergyKwh,
      requiredAhAtVoltage,
      recommendedBatteryCount,
      estimatedCostInr
    };
  }, [
    loadWatts,
    targetRuntimeHours,
    safetyMarginPercent,
    totalSystemEfficiency,
    activeProfile,
    tempFactor,
    batteryVoltage
  ]);

  // --- Mode 3: Load Builder Aggregate Calculation ---
  const aggregatedLoadWatts = useMemo(() => {
    return loadList.reduce((acc, item) => acc + item.watts * item.qty, 0);
  }, [loadList]);

  // --- Mode 4: Charging Calculations ---
  const chargingMetrics = useMemo(() => {
    const totalBankAh = batteryAh * batteryQty;
    const totalNominalWh = totalBankAh * batteryVoltage;
    const energyToReplenishWh = totalNominalWh * activeProfile.dod;

    // AC Mains Recharging Time (0% to 100% of usable capacity)
    // Account for charge efficiency (Coulombic efficiency)
    const chargeEfficiency = activeProfile.roundTripEfficiency;
    const gridChargeHours = chargerCurrentAmps > 0
      ? (totalBankAh * activeProfile.dod) / (chargerCurrentAmps * chargeEfficiency)
      : 0;

    // Solar PV Sizing needed to recharge bank daily
    // Solar Panel Wattage = Energy (Wh) / (Peak Sun Hours * Solar System Efficiency 0.78)
    const solarWattsNeeded = energyToReplenishWh / (solarPeakSunHours * 0.78 * chargeEfficiency);
    const solarChargeControllerAmps = solarWattsNeeded / batteryVoltage;

    return {
      totalBankAh,
      energyToReplenishWh,
      gridChargeHours,
      solarWattsNeeded,
      solarChargeControllerAmps
    };
  }, [batteryAh, batteryQty, batteryVoltage, activeProfile, chargerCurrentAmps, solarPeakSunHours]);

  // --- Mode 5: 10-Year TCO Comparison (Tubular vs LiFePO4) ---
  const tcoMetrics = useMemo(() => {
    const grossKwh = runtimeMetrics.totalNominalKwh || 1.8;

    // 10-Year requirements (Assuming 300 cycles/year = 3000 cycles in 10 yrs)
    // Tubular Lead-Acid: 1200 cycles -> Needs ~2.5 to 3 replacements
    const tubularReplacements = 3;
    const tubularCostPerUnit = grossKwh * CHEMISTRY_PROFILES.tubular.costPerKwhInr;
    const tubular10YearCost = tubularCostPerUnit * tubularReplacements + 3000; // includes maintenance/water topping

    // LiFePO4: 5000+ cycles -> 0 replacements in 10 years!
    const lifepo4CostPerUnit = grossKwh * CHEMISTRY_PROFILES.lifepo4.costPerKwhInr;
    const lifepo410YearCost = lifepo4CostPerUnit;

    const net10YearSavings = tubular10YearCost - lifepo410YearCost;

    return {
      grossKwh,
      tubularCostPerUnit,
      tubularReplacements,
      tubular10YearCost,
      lifepo4CostPerUnit,
      lifepo410YearCost,
      net10YearSavings
    };
  }, [runtimeMetrics.totalNominalKwh]);

  // Load Preset
  const handleLoadScenario = (preset: ScenarioPreset) => {
    setLoadWatts(preset.loadWatts);
    setTargetRuntimeHours(preset.hoursNeeded);
    setBatteryVoltage(preset.batteryVoltage);
    setBatteryAh(preset.batteryAh);
    setBatteryQty(1);
    setChemistry(preset.chemistry);
  };

  // Add Item to Load Builder
  const handleAddLoadItem = (presetItem: Omit<LoadItem, 'id'>) => {
    const newItem: LoadItem = {
      ...presetItem,
      id: `load-${Date.now()}-${Math.random()}`
    };
    setLoadList(prev => [...prev, newItem]);
  };

  // Apply Load Builder Total to Active Load
  const handleApplyBuilderToLoad = () => {
    setLoadWatts(aggregatedLoadWatts);
    setActiveMode('runtime');
  };

  // Copy Report
  const handleCopyReport = () => {
    const text = `🔋 Toolique Battery Backup Sizing & Runtime Report
===================================================
Generated: ${new Date().toLocaleDateString()}
Connected Electrical Load: ${loadWatts} Watts (${runtimeMetrics.apparentPowerVA.toFixed(0)} VA @ PF ${powerFactor})
Battery Chemistry: ${activeProfile.fullName}
Battery Bank Configuration: ${batteryQty} × ${batteryAh} Ah @ ${batteryVoltage}V DC Bus
Total Bank Capacity: ${runtimeMetrics.totalBankAh} Ah (${runtimeMetrics.totalNominalKwh.toFixed(2)} kWh Gross)
Safe Usable Capacity (DoD ${activeProfile.dod * 100}%): ${runtimeMetrics.usableKwh.toFixed(2)} kWh

⏱️ Estimated Backup Duration:
- Peukert Corrected Runtime: ${runtimeMetrics.wholeHours} Hours ${runtimeMetrics.minutes} Minutes
- Direct Discharge Current: ${runtimeMetrics.dcCurrentAmps.toFixed(1)} Amps (Discharge C-Rate: ${runtimeMetrics.cRate.toFixed(2)}C)
- Inverter & Cable Efficiency: ${(totalSystemEfficiency * 100).toFixed(0)}%

⚡ Sizing Recommendations:
- Recommended Solar PV Sizing: ~${chargingMetrics.solarWattsNeeded.toFixed(0)} Wp Solar Array
- Mains Recharging Duration (at ${chargerCurrentAmps}A): ~${chargingMetrics.gridChargeHours.toFixed(1)} Hours
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
      ['Battery Voltage', batteryVoltage.toString(), 'Volts DC'],
      ['Battery Capacity', batteryAh.toString(), 'Ah'],
      ['Battery Quantity', batteryQty.toString(), 'Units'],
      ['Battery Chemistry', activeProfile.name, ''],
      ['Depth of Discharge', (activeProfile.dod * 100).toString(), '%'],
      ['Total Energy', runtimeMetrics.totalNominalWh.toFixed(0), 'Wh'],
      ['Usable Energy', runtimeMetrics.usableWh.toFixed(0), 'Wh'],
      ['Discharge Current', runtimeMetrics.dcCurrentAmps.toFixed(2), 'Amps'],
      ['Estimated Backup Hours', runtimeMetrics.peukertHours.toFixed(2), 'Hours']
    ];
    const csvContent = lines.map(l => l.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `battery_backup_sizing_${loadWatts}W_${batteryAh}Ah.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* AEO Instant Battery Insights Card (Zero Double Heading) */}
      <div className="bg-gradient-to-br from-emerald-50/90 via-white to-indigo-50/70 dark:from-emerald-950/30 dark:via-zinc-900/60 dark:to-indigo-950/20 border border-emerald-200/80 dark:border-emerald-900/40 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-600 text-white uppercase tracking-wider flex items-center gap-1">
                <BatteryCharging className="w-3 h-3 fill-current" /> AEO Battery Sizing
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                {activeProfile.name} ({activeProfile.dod * 100}% DoD)
              </span>
            </div>
            <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 flex-wrap">
              <span>Backup Runtime: <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-base">{runtimeMetrics.wholeHours}h {runtimeMetrics.minutes}m</strong></span>
              <span className="text-zinc-300 dark:text-zinc-700">|</span>
              <span>Usable Energy: <strong className="text-indigo-600 dark:text-indigo-400 font-mono">{runtimeMetrics.usableKwh.toFixed(2)} kWh</strong></span>
              <span className="text-zinc-300 dark:text-zinc-700">|</span>
              <span>Discharge: <strong className="font-mono">{runtimeMetrics.dcCurrentAmps.toFixed(1)} A</strong></span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyReport}
              className="px-3 py-1.5 bg-white dark:bg-zinc-800 hover:bg-zinc-50 text-zinc-700 dark:text-zinc-200 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-emerald-500" />}
              <span>{copied ? 'Copied Specs!' : 'Copy Sizing'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* 1-Click Scenario Presets */}
        <div className="mt-3 pt-3 border-t border-emerald-100/70 dark:border-emerald-900/30 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-emerald-500" /> Scenarios:
          </span>
          {SCENARIO_PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => handleLoadScenario(preset)}
              className="px-2.5 py-1 rounded-lg bg-white/90 dark:bg-zinc-800/90 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-zinc-700 dark:text-zinc-300 hover:text-emerald-600 text-xs font-medium border border-zinc-200/80 dark:border-zinc-700/60 transition cursor-pointer"
            >
              {preset.name} ({preset.loadWatts}W)
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto no-scrollbar gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/70 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/60">
        {[
          { id: 'runtime', label: '⏱️ Runtime Calculator', icon: Clock },
          { id: 'sizer', label: '🔋 Target Ah Sizer', icon: BatteryCharging },
          { id: 'load_builder', label: '🔌 Load Aggregator', icon: Zap },
          { id: 'charging', label: '⚡ Charging & Solar Sizing', icon: Sun },
          { id: 'tco_compare', label: '💰 10-Yr TCO (Lead vs LFP)', icon: DollarSign }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeMode === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveMode(tab.id as CalculatorMode)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs border border-zinc-200/50 dark:border-zinc-700/50'
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

      {/* MODE 1: RUNTIME CALCULATOR */}
      {activeMode === 'runtime' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Input Panel (Left 7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-emerald-500" />
                <span>Electrical Load & Battery Parameters</span>
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
                        className="bg-transparent font-bold text-emerald-600 focus:outline-none cursor-pointer"
                      >
                        <option value={0.8}>0.80</option>
                        <option value={0.85}>0.85</option>
                        <option value={0.9}>0.90</option>
                        <option value={1.0}>1.00</option>
                      </select>
                    </div>
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={loadWatts}
                    onChange={(e) => setLoadWatts(Math.max(1, Number(e.target.value)))}
                    className="w-full text-xs font-mono font-bold bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                  <div className="text-[10px] text-zinc-400 mt-1">
                    Apparent Power: {runtimeMetrics.apparentPowerVA.toFixed(0)} VA (@ PF {powerFactor})
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
                    {Object.entries(CHEMISTRY_PROFILES).map(([key, prof]) => (
                      <option key={key} value={key}>
                        {prof.name} ({prof.dod * 100}% DoD, {prof.cycleLife} cycles)
                      </option>
                    ))}
                  </select>
                  <div className="text-[10px] text-zinc-400 mt-1">
                    Depth of Discharge (DoD): {activeProfile.dod * 100}%
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                    DC BUS VOLTAGE (V)
                  </label>
                  <select
                    value={batteryVoltage}
                    onChange={(e) => setBatteryVoltage(Number(e.target.value) as VoltageOption)}
                    className="w-full text-xs font-bold bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer"
                  >
                    <option value={12}>12 V (1 Battery)</option>
                    <option value={24}>24 V (2 in Series)</option>
                    <option value={36}>36 V (3 in Series)</option>
                    <option value={48}>48 V (4 in Series)</option>
                    <option value={72}>72 V</option>
                    <option value={96}>96 V</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                    CAPACITY (Ah per bank)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={batteryAh}
                    onChange={(e) => setBatteryAh(Math.max(1, Number(e.target.value)))}
                    className="w-full text-xs font-mono font-bold bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                    PARALLEL STRINGS
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={batteryQty}
                    onChange={(e) => setBatteryQty(Math.max(1, Number(e.target.value)))}
                    className="w-full text-xs font-mono font-bold bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 focus:outline-none"
                  />
                </div>
              </div>

              {/* Advanced System Deratings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                    INVERTER EFFICIENCY (%)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="98"
                    value={inverterEfficiency}
                    onChange={(e) => setInverterEfficiency(Math.min(98, Math.max(50, Number(e.target.value))))}
                    className="w-full text-xs font-mono bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                    CABLE LOSS (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={wireLossPercent}
                    onChange={(e) => setWireLossPercent(Math.max(0, Number(e.target.value)))}
                    className="w-full text-xs font-mono bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                    AMBIENT TEMP (°C)
                  </label>
                  <input
                    type="number"
                    min="-10"
                    max="50"
                    value={ambientTempC}
                    onChange={(e) => setAmbientTempC(Number(e.target.value))}
                    className="w-full text-xs font-mono bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 focus:outline-none"
                  />
                </div>
              </div>

              {/* Peukert's Law Switch */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                <div>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    Apply Peukert's Law Derating (k = {activeProfile.peukertExponent})
                  </span>
                  <p className="text-[11px] text-zinc-500">
                    Calculates realistic capacity loss at high discharge rates (crucial for Lead-Acid)
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={usePeukert}
                    onChange={(e) => setUsePeukert(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-zinc-600 peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Results Summary Card (Right 5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-500" />
                <span>Backup Run-Time Sizing</span>
              </h4>

              {/* Giant Runtime Box */}
              <div className="text-center py-6 px-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="block text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                  Estimated Backup Duration
                </span>
                <div className="text-3xl font-black text-emerald-700 dark:text-emerald-300 font-mono mt-1">
                  {runtimeMetrics.wholeHours} <span className="text-xl font-bold">Hrs</span> {runtimeMetrics.minutes} <span className="text-xl font-bold">Mins</span>
                </div>
                <span className="block text-[11px] text-zinc-500 mt-1">
                  At continuous <strong>{loadWatts}W</strong> load ({runtimeMetrics.dcCurrentAmps.toFixed(1)}A DC draw)
                </span>
              </div>

              {/* Energy Specs Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-150 dark:border-zinc-850">
                  <div className="text-[10px] font-bold text-zinc-400 font-sans uppercase">Total Capacity</div>
                  <div className="text-base font-bold text-zinc-900 dark:text-white mt-0.5">
                    {runtimeMetrics.totalNominalKwh.toFixed(2)} kWh
                  </div>
                  <div className="text-[10px] text-zinc-500 font-sans">{runtimeMetrics.totalBankAh} Ah @ {batteryVoltage}V</div>
                </div>

                <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-150 dark:border-zinc-850">
                  <div className="text-[10px] font-bold text-zinc-400 font-sans uppercase">Usable Energy</div>
                  <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {runtimeMetrics.usableKwh.toFixed(2)} kWh
                  </div>
                  <div className="text-[10px] text-zinc-500 font-sans">{activeProfile.dod * 100}% Safe DoD</div>
                </div>

                <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-150 dark:border-zinc-850">
                  <div className="text-[10px] font-bold text-zinc-400 font-sans uppercase">Discharge C-Rate</div>
                  <div className="text-base font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
                    {runtimeMetrics.cRate.toFixed(2)} C
                  </div>
                  <div className="text-[10px] text-zinc-500 font-sans">
                    {runtimeMetrics.cRate < 0.2 ? 'Gentle Discharge' : 'Heavy C-Rate'}
                  </div>
                </div>

                <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-150 dark:border-zinc-850">
                  <div className="text-[10px] font-bold text-zinc-400 font-sans uppercase">Cycle Life</div>
                  <div className="text-base font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
                    {activeProfile.cycleLife.toLocaleString()} Cycles
                  </div>
                  <div className="text-[10px] text-zinc-500 font-sans">~{(activeProfile.cycleLife / 300).toFixed(1)} Years lifespan</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: TARGET AH SIZER */}
      {activeMode === 'sizer' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-5">
            <div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <BatteryCharging className="w-4 h-4 text-emerald-500" />
                <span>Target Battery Bank Capacity Sizer (Find Required Ah)</span>
              </h4>
              <p className="text-xs text-zinc-500">
                Determine the required battery Ah capacity to sustain a <strong>{loadWatts}W</strong> load for <strong>{targetRuntimeHours} hours</strong>.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                  REQUIRED BACKUP (HOURS)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="72"
                  value={targetRuntimeHours}
                  onChange={(e) => setTargetRuntimeHours(Math.max(0.5, Number(e.target.value)))}
                  className="w-full text-xs font-mono font-bold bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                  BATTERY BUS VOLTAGE (V)
                </label>
                <select
                  value={batteryVoltage}
                  onChange={(e) => setBatteryVoltage(Number(e.target.value) as VoltageOption)}
                  className="w-full text-xs font-bold bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer"
                >
                  <option value={12}>12 V</option>
                  <option value={24}>24 V</option>
                  <option value={48}>48 V</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                  SAFETY BUFFER MARGIN (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={safetyMarginPercent}
                  onChange={(e) => setSafetyMarginPercent(Math.max(0, Number(e.target.value)))}
                  className="w-full text-xs font-mono font-bold bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 focus:outline-none"
                />
              </div>
            </div>

            {/* Sizing Recommendations Box */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                <div className="text-[10px] font-bold text-emerald-700 uppercase">Recommended Bank Ah</div>
                <div className="text-2xl font-bold font-mono text-emerald-800 dark:text-emerald-300 mt-1">
                  {Math.ceil(sizerMetrics.requiredAhAtVoltage)} Ah
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">At {batteryVoltage}V DC Bus ({sizerMetrics.requiredGrossEnergyKwh.toFixed(2)} kWh)</div>
              </div>

              <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <div className="text-[10px] font-bold text-zinc-400 uppercase">Standard Battery Config</div>
                <div className="text-xl font-bold font-mono text-zinc-900 dark:text-white mt-1">
                  {sizerMetrics.recommendedBatteryCount} × 150Ah (12V)
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">
                  {batteryVoltage === 24 ? 'Connect in 2S series pairs' : batteryVoltage === 48 ? 'Connect in 4S series strings' : 'Parallel 12V connection'}
                </div>
              </div>

              <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <div className="text-[10px] font-bold text-zinc-400 uppercase">Estimated Bank Cost</div>
                <div className="text-xl font-bold font-mono text-zinc-900 dark:text-white mt-1">
                  ₹ {sizerMetrics.estimatedCostInr.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">For {activeProfile.name} chemistry</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: LOAD BUILDER */}
      {activeMode === 'load_builder' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-500" />
                  <span>Multi-Device Connected Load Aggregator</span>
                </h4>
                <p className="text-xs text-zinc-500">
                  Select devices to calculate your exact total backup running load in Watts.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-500 font-mono">
                  Total: <strong className="text-emerald-600 text-sm">{aggregatedLoadWatts} W</strong>
                </span>
                <button
                  onClick={handleApplyBuilderToLoad}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
                >
                  Use {aggregatedLoadWatts}W in Calculator
                </button>
              </div>
            </div>

            {/* Predefined Add Pills */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase flex items-center mr-1">
                + Quick Add:
              </span>
              {PRESET_LOAD_ITEMS.map((item, idx) => (
                <button
                  key={`quick-load-${idx}`}
                  onClick={() => handleAddLoadItem(item)}
                  className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-50 text-zinc-700 dark:text-zinc-300 hover:text-emerald-600 text-[11px] font-medium transition cursor-pointer"
                >
                  + {item.name} ({item.watts}W)
                </button>
              ))}
            </div>

            {/* Load Items Table */}
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden mt-3">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500 uppercase text-[10px] font-bold font-sans">
                  <tr>
                    <th className="p-2.5 pl-3">Appliance</th>
                    <th className="p-2.5 text-center">Watts</th>
                    <th className="p-2.5 text-center">Quantity</th>
                    <th className="p-2.5 text-right">Subtotal Watts</th>
                    <th className="p-2.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {loadList.map(item => (
                    <tr key={item.id}>
                      <td className="p-2.5 pl-3 font-sans font-semibold text-zinc-800 dark:text-zinc-200">{item.name}</td>
                      <td className="p-2.5 text-center">{item.watts} W</td>
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
                      <td className="p-2.5 text-right font-bold text-emerald-600">{item.watts * item.qty} W</td>
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

      {/* MODE 4: CHARGING & SOLAR SIZING */}
      {activeMode === 'charging' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-5">
            <div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Battery Recharging & Solar Panel Array Sizer</span>
              </h4>
              <p className="text-xs text-zinc-500">
                Calculate the required grid charger rating and rooftop solar panel wattage to fully replenish the battery bank.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                  MAINS CHARGER CURRENT (AMPS)
                </label>
                <input
                  type="number"
                  min="2"
                  max="100"
                  value={chargerCurrentAmps}
                  onChange={(e) => setChargerCurrentAmps(Math.max(1, Number(e.target.value)))}
                  className="w-full text-xs font-mono font-bold bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                  SOLAR PEAK SUN HOURS (PSH / DAY)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="2"
                  max="8"
                  value={solarPeakSunHours}
                  onChange={(e) => setSolarPeakSunHours(Math.max(1, Number(e.target.value)))}
                  className="w-full text-xs font-mono font-bold bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <div className="text-[10px] font-bold text-zinc-400 uppercase">Mains Recharging Time</div>
                <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-white mt-1">
                  ~{chargingMetrics.gridChargeHours.toFixed(1)} Hours
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">At {chargerCurrentAmps}A constant current</div>
              </div>

              <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-800">
                <div className="text-[10px] font-bold text-amber-700 uppercase">Required Solar PV Array</div>
                <div className="text-2xl font-bold font-mono text-amber-800 dark:text-amber-300 mt-1">
                  ~{Math.ceil(chargingMetrics.solarWattsNeeded / 50) * 50} Wp
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">Recharges {chargingMetrics.energyToReplenishWh.toFixed(0)} Wh daily</div>
              </div>

              <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <div className="text-[10px] font-bold text-zinc-400 uppercase">MPPT Charge Controller</div>
                <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-white mt-1">
                  {Math.ceil(chargingMetrics.solarChargeControllerAmps / 10) * 10} A Rating
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">At {batteryVoltage}V DC output</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 5: 10-YEAR TCO (LEAD VS LIFEPO4) */}
      {activeMode === 'tco_compare' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-5">
            <div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>10-Year Total Cost of Ownership (Tubular Lead-Acid vs LiFePO4)</span>
              </h4>
              <p className="text-xs text-zinc-500">
                Evaluates initial capital expenditure vs lifetime battery replacement cycles.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tubular Lead-Acid */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase">
                  <span>Tubular Lead-Acid</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800">1,200 Cycles</span>
                </div>
                <div className="space-y-1 text-xs font-mono">
                  <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-1">
                    <span className="text-zinc-500 font-sans">Initial Cost:</span>
                    <span className="font-bold">₹ {tcoMetrics.tubularCostPerUnit.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-200 dark:border-zinc-800 pb-1">
                    <span className="text-zinc-500 font-sans">10-Yr Replacements:</span>
                    <span className="font-bold text-rose-500">3 Battery Banks Needed</span>
                  </div>
                  <div className="flex justify-between pt-1 text-sm font-bold text-rose-600">
                    <span className="font-sans">10-Year TCO:</span>
                    <span>₹ {tcoMetrics.tubular10YearCost.toFixed(0)}</span>
                  </div>
                </div>
              </div>

              {/* LiFePO4 */}
              <div className="p-4 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-700 uppercase">
                  <span>Lithium LiFePO4 (LFP)</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">5,000+ Cycles</span>
                </div>
                <div className="space-y-1 text-xs font-mono">
                  <div className="flex justify-between border-b border-emerald-100 dark:border-emerald-800/50 pb-1">
                    <span className="text-zinc-500 font-sans">Initial Cost:</span>
                    <span className="font-bold">₹ {tcoMetrics.lifepo4CostPerUnit.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between border-b border-emerald-100 dark:border-emerald-800/50 pb-1">
                    <span className="text-zinc-500 font-sans">10-Yr Replacements:</span>
                    <span className="font-bold text-emerald-600">0 (Zero Replacements)</span>
                  </div>
                  <div className="flex justify-between pt-1 text-sm font-bold text-emerald-600">
                    <span className="font-sans">10-Year TCO:</span>
                    <span>₹ {tcoMetrics.lifepo410YearCost.toFixed(0)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* TCO Verdict Banner */}
            <div className="p-4 bg-zinc-900 text-white rounded-2xl border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-0.5 text-center sm:text-left">
                <div className="text-xs text-zinc-400 font-bold uppercase">10-Year Net Savings with LiFePO4</div>
                <div className="text-xl font-bold text-emerald-400 font-mono">
                  Save ₹ {tcoMetrics.net10YearSavings.toFixed(0)} over 10 years
                </div>
              </div>
              <div className="text-xs text-zinc-400 text-center sm:text-right">
                Higher initial investment, but <strong>40% lower cost per cycle</strong> over 10 years.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

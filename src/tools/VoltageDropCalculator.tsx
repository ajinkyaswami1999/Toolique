/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from 'react';
import {
  Zap,
  Sparkles,
  Copy,
  Check,
  Download,
  Sliders,
  Gauge,
  Activity,
  DollarSign,
  Flame,
  RefreshCw,
  Sun
} from 'lucide-react';

// --- Types & Interfaces ---
export type VoltageDropMode = 'precision_calculator' | 'max_distance_lab' | 'solar_dc_feeder' | 'motor_inrush_dip' | 'power_loss_carbon';
export type ElectricalPhase = '1phase' | '3phase' | 'dc';
export type ConductorMaterial = 'copper' | 'aluminum';
export type OperatingTempC = 20 | 60 | 70 | 90;
export type CableArrangement = 'multicore_conduit' | 'trefoil_touching' | 'flat_spaced';

export interface StandardConductorProfile {
  sizeMm2: number;
  awgEquivalent: string;
  rCopper20: number; // Ohm/km at 20C
  rAluminum20: number; // Ohm/km at 20C
}

export const CABLE_PROFILES: StandardConductorProfile[] = [
  { sizeMm2: 1.0, awgEquivalent: '18 AWG', rCopper20: 18.1, rAluminum20: 29.5 },
  { sizeMm2: 1.5, awgEquivalent: '16 AWG', rCopper20: 12.1, rAluminum20: 19.7 },
  { sizeMm2: 2.5, awgEquivalent: '14 AWG', rCopper20: 7.41, rAluminum20: 12.1 },
  { sizeMm2: 4.0, awgEquivalent: '12 AWG', rCopper20: 4.61, rAluminum20: 7.56 },
  { sizeMm2: 6.0, awgEquivalent: '10 AWG', rCopper20: 3.08, rAluminum20: 5.05 },
  { sizeMm2: 10.0, awgEquivalent: '8 AWG', rCopper20: 1.83, rAluminum20: 3.00 },
  { sizeMm2: 16.0, awgEquivalent: '6 AWG', rCopper20: 1.15, rAluminum20: 1.89 },
  { sizeMm2: 25.0, awgEquivalent: '4 AWG', rCopper20: 0.727, rAluminum20: 1.19 },
  { sizeMm2: 35.0, awgEquivalent: '2 AWG', rCopper20: 0.524, rAluminum20: 0.859 },
  { sizeMm2: 50.0, awgEquivalent: '1/0 AWG', rCopper20: 0.387, rAluminum20: 0.635 },
  { sizeMm2: 70.0, awgEquivalent: '2/0 AWG', rCopper20: 0.268, rAluminum20: 0.440 },
  { sizeMm2: 95.0, awgEquivalent: '3/0 AWG', rCopper20: 0.193, rAluminum20: 0.317 },
  { sizeMm2: 120.0, awgEquivalent: '4/0 AWG', rCopper20: 0.153, rAluminum20: 0.251 },
  { sizeMm2: 150.0, awgEquivalent: '300 kcmil', rCopper20: 0.124, rAluminum20: 0.203 },
  { sizeMm2: 185.0, awgEquivalent: '350 kcmil', rCopper20: 0.0991, rAluminum20: 0.163 },
  { sizeMm2: 240.0, awgEquivalent: '500 kcmil', rCopper20: 0.0754, rAluminum20: 0.124 },
  { sizeMm2: 300.0, awgEquivalent: '600 kcmil', rCopper20: 0.0601, rAluminum20: 0.0986 },
  { sizeMm2: 400.0, awgEquivalent: '800 kcmil', rCopper20: 0.0470, rAluminum20: 0.0771 },
  { sizeMm2: 500.0, awgEquivalent: '1000 kcmil', rCopper20: 0.0366, rAluminum20: 0.0600 },
  { sizeMm2: 630.0, awgEquivalent: '1250 kcmil', rCopper20: 0.0283, rAluminum20: 0.0464 }
];

export interface VoltageDropArchetype {
  id: string;
  name: string;
  description: string;
  phase: ElectricalPhase;
  voltage: number;
  current: number;
  cableSizeMm2: number;
  material: ConductorMaterial;
  lengthMeters: number;
  powerFactor: number;
  tempC: OperatingTempC;
}

const VOLTAGE_DROP_ARCHETYPES: VoltageDropArchetype[] = [
  {
    id: 'residential_lighting',
    name: '💡 Lighting Circuit',
    description: '1-Ph 230V, 6A Load, 1.5 mm² Cu, 35m Run',
    phase: '1phase',
    voltage: 230,
    current: 6,
    cableSizeMm2: 1.5,
    material: 'copper',
    lengthMeters: 35,
    powerFactor: 0.95,
    tempC: 60
  },
  {
    id: 'heavy_aircon',
    name: '❄️ 2.0 TR Inverter AC',
    description: '1-Ph 230V, 12A Load, 4.0 mm² Cu, 25m Run',
    phase: '1phase',
    voltage: 230,
    current: 12,
    cableSizeMm2: 4.0,
    material: 'copper',
    lengthMeters: 25,
    powerFactor: 0.88,
    tempC: 70
  },
  {
    id: 'battery_solar_inverter',
    name: '🔋 48V Battery Inverter',
    description: 'DC 48V, 80A Heavy Draw, 35 mm² Cu, 6m Run (Strict 1% Target)',
    phase: 'dc',
    voltage: 48,
    current: 80,
    cableSizeMm2: 35.0,
    material: 'copper',
    lengthMeters: 6,
    powerFactor: 1.0,
    tempC: 60
  },
  {
    id: 'solar_pv_string',
    name: '☀️ 800V Solar PV String',
    description: 'DC 800V, 15A String, 6.0 mm² Cu, 110m Array Feed',
    phase: 'dc',
    voltage: 800,
    current: 15,
    cableSizeMm2: 6.0,
    material: 'copper',
    lengthMeters: 110,
    powerFactor: 1.0,
    tempC: 70
  },
  {
    id: 'submersible_pump_30kw',
    name: '🏭 30 kW Borehole Pump',
    description: '3-Ph 415V, 55A Load, 25 mm² Cu, 140m Deep Borehole Run',
    phase: '3phase',
    voltage: 415,
    current: 55,
    cableSizeMm2: 25.0,
    material: 'copper',
    lengthMeters: 140,
    powerFactor: 0.82,
    tempC: 70
  },
  {
    id: 'building_main_incomer',
    name: '🏢 200 kVA Building Feeder',
    description: '3-Ph 415V, 260A Incomer, 185 mm² Al XLPE, 75m Substation Feeder',
    phase: '3phase',
    voltage: 415,
    current: 260,
    cableSizeMm2: 185.0,
    material: 'aluminum',
    lengthMeters: 75,
    powerFactor: 0.85,
    tempC: 90
  }
];

export default function VoltageDropCalculator() {
  // Navigation Mode
  const [activeMode, setActiveMode] = useState<VoltageDropMode>('precision_calculator');

  // Primary Input States
  const [phase, setPhase] = useState<ElectricalPhase>('1phase');
  const [voltage, setVoltage] = useState<number>(230);
  const [current, setCurrent] = useState<number>(16);
  const [cableSizeMm2, setCableSizeMm2] = useState<number>(2.5);
  const [material, setMaterial] = useState<ConductorMaterial>('copper');
  const [length, setLength] = useState<number>(45);
  const [lengthUnit, setLengthUnit] = useState<'meters' | 'feet'>('meters');
  const [powerFactor, setPowerFactor] = useState<number>(0.85);
  const [tempC, setTempC] = useState<OperatingTempC>(70);
  const [arrangement, setArrangement] = useState<CableArrangement>('multicore_conduit');
  const [targetMaxDropPercent, setTargetMaxDropPercent] = useState<number>(3.0);

  // Solar DC specific inputs (Mode 3)
  const [solarDcVolts, setSolarDcVolts] = useState<number>(48);
  const [solarDcAmps, setSolarDcAmps] = useState<number>(60);
  const [solarDcLengthMeters, setSolarDcLengthMeters] = useState<number>(8);

  // Motor Inrush Dip inputs (Mode 4)
  const [motorFlaAmps, setMotorFlaAmps] = useState<number>(40);
  const [inrushMultiplier, setInrushMultiplier] = useState<number>(6.0); // DOL: 6x, Star-Delta: 2.2x

  // Power Loss & Carbon inputs (Mode 5)
  const [hoursPerDay, setHoursPerDay] = useState<number>(12);
  const [tariffPerKwh, setTariffPerKwh] = useState<number>(8.0); // INR or $/kWh

  // UI state
  const [copied, setCopied] = useState<boolean>(false);

  // Length in meters normalized
  const lengthInMeters = useMemo(() => {
    return lengthUnit === 'feet' ? length * 0.3048 : length;
  }, [length, lengthUnit]);

  // Selected profile
  const selectedProfile = useMemo(() => {
    return CABLE_PROFILES.find(p => p.sizeMm2 === cableSizeMm2) || CABLE_PROFILES[2];
  }, [cableSizeMm2]);

  // Calculations Engine
  const calculationResults = useMemo(() => {
    const isAlum = material === 'aluminum';
    const r20 = isAlum ? selectedProfile.rAluminum20 : selectedProfile.rCopper20;

    // Temperature correction: R_T = R_20 * [1 + alpha * (T - 20)]
    const alpha = isAlum ? 0.00403 : 0.00393;
    const tempMultiplier = 1 + alpha * (tempC - 20);
    const rPerKm = r20 * tempMultiplier; // Ohm/km at T
    const rTotalOhms = (rPerKm * lengthInMeters) / 1000;

    // Reactance X (Ohm/km)
    let xPerKm = 0.08;
    if (arrangement === 'trefoil_touching') xPerKm = 0.09;
    else if (arrangement === 'flat_spaced') xPerKm = 0.12;
    const xTotalOhms = phase === 'dc' ? 0 : (xPerKm * lengthInMeters) / 1000;

    // Total Impedance Z
    const zTotalOhms = Math.sqrt(rTotalOhms * rTotalOhms + xTotalOhms * xTotalOhms);

    // Phasor / Active calculation
    const cosPhi = phase === 'dc' ? 1.0 : powerFactor;
    const sinPhi = phase === 'dc' ? 0.0 : Math.sqrt(Math.max(0, 1 - cosPhi * cosPhi));

    let vDrop = 0;
    if (phase === 'dc') {
      vDrop = 2 * current * rTotalOhms;
    } else if (phase === '1phase') {
      // 1-Phase: ΔV = 2 * I * (R*cosφ + X*sinφ)
      vDrop = 2 * current * (rTotalOhms * cosPhi + xTotalOhms * sinPhi);
    } else {
      // 3-Phase: ΔV = √3 * I * (R*cosφ + X*sinφ)
      vDrop = Math.sqrt(3) * current * (rTotalOhms * cosPhi + xTotalOhms * sinPhi);
    }

    if (isNaN(vDrop) || vDrop < 0) vDrop = 0;
    const vDropPercent = (vDrop / voltage) * 100;
    const receivingVoltage = Math.max(0, voltage - vDrop);
    const transmissionEfficiency = (receivingVoltage / voltage) * 100;

    // Conductor Power Loss: P = n * I^2 * R
    const nConductors = phase === '3phase' ? 3 : 2;
    const powerLossWatts = nConductors * (current * current) * rTotalOhms;

    // Max Distance before reaching target max drop %
    const targetDropVolts = (targetMaxDropPercent / 100) * voltage;
    const factorPhase = phase === '3phase' ? Math.sqrt(3) : 2;
    const rUnitPerMeter = rPerKm / 1000;
    const xUnitPerMeter = xPerKm / 1000;
    const denominator = factorPhase * current * (rUnitPerMeter * cosPhi + xUnitPerMeter * sinPhi);
    const maxDistanceMeters = denominator > 0 ? targetDropVolts / denominator : 0;
    const maxDistanceFeet = maxDistanceMeters * 3.28084;

    return {
      rTotalOhms,
      xTotalOhms,
      zTotalOhms,
      rPerKm,
      xPerKm,
      vDrop,
      vDropPercent,
      receivingVoltage,
      transmissionEfficiency,
      powerLossWatts,
      maxDistanceMeters,
      maxDistanceFeet,
      targetDropVolts
    };
  }, [
    selectedProfile,
    material,
    tempC,
    lengthInMeters,
    arrangement,
    phase,
    powerFactor,
    current,
    voltage,
    targetMaxDropPercent
  ]);

  // Solar DC specific analysis (Mode 3)
  const solarDcAnalysis = useMemo(() => {
    const isAlum = material === 'aluminum';
    const r20 = isAlum ? selectedProfile.rAluminum20 : selectedProfile.rCopper20;
    const rPerKm = r20 * (1 + (isAlum ? 0.00403 : 0.00393) * (tempC - 20));
    const rTotalOhms = (rPerKm * solarDcLengthMeters) / 1000;

    // 2-way DC loop
    const dcDropVolts = 2 * solarDcAmps * rTotalOhms;
    const dcDropPercent = (dcDropVolts / solarDcVolts) * 100;
    const dcReceivingVolts = Math.max(0, solarDcVolts - dcDropVolts);
    const dcPowerLossWatts = 2 * (solarDcAmps * solarDcAmps) * rTotalOhms;

    return {
      dcDropVolts,
      dcDropPercent,
      dcReceivingVolts,
      dcPowerLossWatts,
      isSolarCompliant: dcDropPercent <= 1.5 // Strict 1.5% target for solar PV/battery
    };
  }, [selectedProfile, material, tempC, solarDcLengthMeters, solarDcAmps, solarDcVolts]);

  // Motor inrush dip analysis (Mode 4)
  const motorDipAnalysis = useMemo(() => {
    const steadyDrop = calculationResults.vDrop;
    const inrushAmps = motorFlaAmps * inrushMultiplier;
    const inrushDrop = (steadyDrop / Math.max(0.1, current)) * inrushAmps;
    const inrushDropPercent = (inrushDrop / voltage) * 100;
    const startingTerminalVolts = Math.max(0, voltage - inrushDrop);

    return {
      inrushAmps,
      inrushDrop,
      inrushDropPercent,
      startingTerminalVolts,
      isSevereDip: inrushDropPercent > 15 // >15% causes contactor drops or motor stall
    };
  }, [calculationResults.vDrop, current, motorFlaAmps, inrushMultiplier, voltage]);

  // Lifecycle Power Loss & Carbon Waste (Mode 5)
  const powerLossAnalysis = useMemo(() => {
    const annualKwhWasted = (calculationResults.powerLossWatts / 1000) * (hoursPerDay * 365);
    const annualFinancialLoss = annualKwhWasted * tariffPerKwh;
    const annualKgCo2Wasted = annualKwhWasted * 0.82; // 0.82 kg CO2 per kWh grid average
    const tenYearCumulativeCost = annualFinancialLoss * 10;

    return {
      annualKwhWasted,
      annualFinancialLoss,
      annualKgCo2Wasted,
      tenYearCumulativeCost
    };
  }, [calculationResults.powerLossWatts, hoursPerDay, tariffPerKwh]);

  // Apply Preset
  const handleApplyArchetype = (arch: VoltageDropArchetype) => {
    setPhase(arch.phase);
    setVoltage(arch.voltage);
    setCurrent(arch.current);
    setCableSizeMm2(arch.cableSizeMm2);
    setMaterial(arch.material);
    setLength(arch.lengthMeters);
    setLengthUnit('meters');
    setPowerFactor(arch.powerFactor);
    setTempC(arch.tempC);
  };

  // Copy Summary
  const handleCopyReport = () => {
    const res = calculationResults;
    const p = selectedProfile;
    const summary = `===================================================
TOOLIQUE VOLTAGE DROP ENGINEERING REPORT
===================================================
⚡ SYSTEM & CABLE PARAMETERS:
- Circuit Type: ${phase === '3phase' ? '3-Phase AC 415V' : phase === '1phase' ? '1-Phase AC 230V' : 'Direct Current (DC)'}
- Source Voltage: ${voltage} V
- Design Load Current: ${current} A
- Power Factor (cos φ): ${phase === 'dc' ? '1.0 (DC)' : powerFactor.toFixed(2)}
- Conductor Size: ${p.sizeMm2} mm² (${p.awgEquivalent})
- Conductor Metal: ${material === 'copper' ? 'Electrolytic Copper (Cu)' : 'EC Grade Aluminum (Al)'}
- Operating Temperature: ${tempC}°C
- Route Length: ${length} ${lengthUnit} (${lengthInMeters.toFixed(1)} m)

📊 VOLTAGE DROP & PERFORMANCE:
- Line Voltage Drop (ΔV): ${res.vDrop.toFixed(2)} V
- Percentage Voltage Drop (ΔV%): ${res.vDropPercent.toFixed(2)}%
- Receiving End Terminal Voltage: ${res.receivingVoltage.toFixed(2)} V
- Transmission Efficiency: ${res.transmissionEfficiency.toFixed(2)}%
- Total Loop Conductor Resistance: ${res.rTotalOhms.toFixed(4)} Ω
- Total Conductor Reactance (X): ${res.xTotalOhms.toFixed(4)} Ω
- Active Conductor Heat Loss (I²R): ${res.powerLossWatts.toFixed(1)} W
- Max Allowable Distance for ${targetMaxDropPercent}% Drop: ${res.maxDistanceMeters.toFixed(1)} m (${res.maxDistanceFeet.toFixed(0)} ft)
- Code Compliance: ${res.vDropPercent <= 3.0 ? 'PASSED NEC/IS Branch Target (<3.0%)' : res.vDropPercent <= 5.0 ? 'PASSED Feeder Limit (<5.0%)' : 'FAILED - Excessive Drop (>5.0%)'}
===================================================`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export CSV
  const handleExportCSV = () => {
    const res = calculationResults;
    const p = selectedProfile;
    const lines = [
      ['Parameter', 'Value', 'Unit'],
      ['Phase Configuration', phase, ''],
      ['Source Voltage', voltage.toString(), 'Volts'],
      ['Load Current', current.toString(), 'Amps'],
      ['Conductor Size', p.sizeMm2.toString(), 'mm²'],
      ['AWG Equivalent', p.awgEquivalent, ''],
      ['Conductor Material', material, ''],
      ['Operating Temperature', tempC.toString(), '°C'],
      ['Route Length', length.toString(), lengthUnit],
      ['Power Factor', powerFactor.toString(), ''],
      ['Calculated Voltage Drop', res.vDrop.toFixed(2), 'Volts'],
      ['Voltage Drop Percentage', res.vDropPercent.toFixed(2), '%'],
      ['Receiving End Voltage', res.receivingVoltage.toFixed(2), 'Volts'],
      ['Transmission Efficiency', res.transmissionEfficiency.toFixed(2), '%'],
      ['Total Loop Resistance', res.rTotalOhms.toFixed(4), 'Ohms'],
      ['Total Reactance', res.xTotalOhms.toFixed(4), 'Ohms'],
      ['Conductor Power Loss', res.powerLossWatts.toFixed(1), 'Watts'],
      ['Max Distance for Target Drop', res.maxDistanceMeters.toFixed(1), 'Meters']
    ];
    const csvContent = lines.map(l => l.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `voltage_drop_${res.vDropPercent.toFixed(1)}pct_${p.sizeMm2}mm2.csv`;
    link.click();
  };

  const handleReset = () => {
    setPhase('1phase');
    setVoltage(230);
    setCurrent(16);
    setCableSizeMm2(2.5);
    setMaterial('copper');
    setLength(45);
    setLengthUnit('meters');
    setPowerFactor(0.85);
    setTempC(70);
    setArrangement('multicore_conduit');
    setTargetMaxDropPercent(3.0);
  };

  return (
    <div className="space-y-6 text-left">
      {/* AEO Instant Voltage Drop Insights Card (Zero Double Heading) */}
      <div className="bg-gradient-to-br from-blue-50/90 via-white to-cyan-50/70 dark:from-blue-950/30 dark:via-zinc-900/60 dark:to-cyan-950/20 border border-blue-200/80 dark:border-blue-900/40 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-600 text-white uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3 h-3 fill-current" /> AEO Voltage Drop Insights
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                NEC 210.19(A) / IS 732 / BS 7671 Criteria
              </span>
            </div>
            <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 flex-wrap">
              <span>Voltage Drop: <strong className={`font-mono text-base ${calculationResults.vDropPercent <= 3.0 ? 'text-emerald-600 dark:text-emerald-400' : calculationResults.vDropPercent <= 5.0 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>{calculationResults.vDropPercent.toFixed(2)}% ({calculationResults.vDrop.toFixed(2)} V)</strong></span>
              <span className="text-zinc-300 dark:text-zinc-700">|</span>
              <span>Receiving Voltage: <strong className="text-zinc-900 dark:text-zinc-100 font-mono">{calculationResults.receivingVoltage.toFixed(1)} V</strong></span>
              <span className="text-zinc-300 dark:text-zinc-700">|</span>
              <span>Efficiency: <strong className="font-mono text-blue-600 dark:text-blue-400">{calculationResults.transmissionEfficiency.toFixed(1)}%</strong></span>
              <span className="text-zinc-300 dark:text-zinc-700">|</span>
              <span>Loss: <strong className="font-mono text-zinc-700 dark:text-zinc-300">{calculationResults.powerLossWatts.toFixed(0)} W</strong></span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyReport}
              className="px-3 py-1.5 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-200 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-blue-500" />}
              <span>{copied ? 'Copied Report!' : 'Copy Report'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* 1-Click Archetype Presets */}
        <div className="mt-3 pt-3 border-t border-blue-100/70 dark:border-blue-900/30 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-blue-500" /> Presets:
          </span>
          {VOLTAGE_DROP_ARCHETYPES.map(arch => (
            <button
              key={arch.id}
              onClick={() => handleApplyArchetype(arch)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white/80 dark:bg-zinc-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/80 transition cursor-pointer"
              title={arch.description}
            >
              {arch.name}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Modes Bar */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
        <button
          onClick={() => setActiveMode('precision_calculator')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeMode === 'precision_calculator'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
          }`}
        >
          <Gauge className="w-4 h-4" />
          <span>1. Precision Voltage Drop</span>
        </button>

        <button
          onClick={() => setActiveMode('max_distance_lab')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeMode === 'max_distance_lab'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>2. Maximum Distance Lab</span>
        </button>

        <button
          onClick={() => setActiveMode('solar_dc_feeder')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeMode === 'solar_dc_feeder'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
          }`}
        >
          <Sun className="w-4 h-4" />
          <span>3. Solar PV & DC Battery</span>
        </button>

        <button
          onClick={() => setActiveMode('motor_inrush_dip')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeMode === 'motor_inrush_dip'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>4. Motor Starting Dip</span>
        </button>

        <button
          onClick={() => setActiveMode('power_loss_carbon')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeMode === 'power_loss_carbon'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>5. Heat Loss & Carbon</span>
        </button>
      </div>

      {/* MODE 1: Precision Voltage Drop Calculator */}
      {activeMode === 'precision_calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-500" />
                  Circuit Sizing & Conductor Inputs
                </h3>
                <button
                  onClick={handleReset}
                  className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 flex items-center gap-1 transition cursor-pointer"
                  title="Reset to defaults"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Phase and Voltage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Electrical Phase
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: '1phase', label: '1-Ph AC', defV: 230 },
                      { id: '3phase', label: '3-Ph AC', defV: 415 },
                      { id: 'dc', label: 'DC Bus', defV: 48 }
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setPhase(p.id as ElectricalPhase);
                          setVoltage(p.defV);
                        }}
                        className={`py-1.5 text-xs font-semibold rounded-lg border transition cursor-pointer ${
                          phase === p.id
                            ? 'bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'bg-zinc-50 dark:bg-zinc-800/70 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Source Nominal Voltage (V)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="33000"
                    value={voltage}
                    onChange={(e) => setVoltage(Math.max(1, parseFloat(e.target.value) || 1))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Load Current & Power Factor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Load Current (Amps)
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.5"
                    value={current}
                    onChange={(e) => setCurrent(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Power Factor (cos φ)
                  </label>
                  <input
                    type="number"
                    min="0.50"
                    max="1.00"
                    step="0.05"
                    disabled={phase === 'dc'}
                    value={powerFactor}
                    onChange={(e) => setPowerFactor(Math.min(1.0, Math.max(0.5, parseFloat(e.target.value) || 0.85)))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white disabled:opacity-50 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Conductor Cross Section & Metal */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Cable Cross Section
                  </label>
                  <select
                    value={cableSizeMm2}
                    onChange={(e) => setCableSizeMm2(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    {CABLE_PROFILES.map((p) => (
                      <option key={p.sizeMm2} value={p.sizeMm2}>
                        {p.sizeMm2} mm² ({p.awgEquivalent})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Conductor Metal
                  </label>
                  <select
                    value={material}
                    onChange={(e) => setMaterial(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="copper">Electrolytic Copper (Cu)</option>
                    <option value="aluminum">EC Grade Aluminum (Al)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Operating Temp (°C)
                  </label>
                  <select
                    value={tempC}
                    onChange={(e) => setTempC(Number(e.target.value) as OperatingTempC)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="20">20°C (Standard Lab)</option>
                    <option value="60">60°C (Average Load)</option>
                    <option value="70">70°C (PVC Full Load)</option>
                    <option value="90">90°C (XLPE Full Load)</option>
                  </select>
                </div>
              </div>

              {/* Distance & Cable Arrangement */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                      One-Way Route Length
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="5000"
                      value={length}
                      onChange={(e) => setLength(Math.max(1, parseFloat(e.target.value) || 1))}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                      Unit
                    </label>
                    <select
                      value={lengthUnit}
                      onChange={(e) => setLengthUnit(e.target.value as any)}
                      className="w-full px-2 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white"
                    >
                      <option value="meters">Meters</option>
                      <option value="feet">Feet</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Conductor Arrangement
                  </label>
                  <select
                    value={arrangement}
                    disabled={phase === 'dc'}
                    onChange={(e) => setArrangement(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white disabled:opacity-50"
                  >
                    <option value="multicore_conduit">Multi-Core in Conduit / Tray (0.08 Ω/km)</option>
                    <option value="trefoil_touching">Single Core Trefoil Formation (0.09 Ω/km)</option>
                    <option value="flat_spaced">Single Core Flat Spaced (0.12 Ω/km)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Results Summary Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/20 rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex justify-between items-center border-b border-blue-500/20 pb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Voltage Drop Compliance
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${calculationResults.vDropPercent <= 3.0 ? 'bg-emerald-500 text-white' : calculationResults.vDropPercent <= 5.0 ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'}`}>
                  {calculationResults.vDropPercent <= 3.0 ? '✓ Safe (<3% NEC Branch)' : calculationResults.vDropPercent <= 5.0 ? '⚠ Acceptable (<5% Feeder)' : '✕ Critical (>5% Limit)'}
                </span>
              </div>

              {/* Big Hero Stat */}
              <div className="text-center py-2">
                <div className="text-5xl font-black text-zinc-900 dark:text-white font-mono tracking-tight">
                  {calculationResults.vDropPercent.toFixed(2)} <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">%</span>
                </div>
                <div className="text-sm font-semibold text-zinc-600 dark:text-zinc-300 mt-1">
                  Voltage Loss: <strong className="font-mono text-zinc-900 dark:text-white">{calculationResults.vDrop.toFixed(2)} Volts</strong>
                </div>
              </div>

              {/* Visual Visual Progress Meter */}
              <div className="space-y-1.5">
                <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${Math.min(3.0, calculationResults.vDropPercent) * 20}%` }}
                  />
                  <div
                    className="h-full bg-amber-500 transition-all duration-300"
                    style={{ width: `${Math.min(2.0, Math.max(0, calculationResults.vDropPercent - 3.0)) * 20}%` }}
                  />
                  <div
                    className="h-full bg-red-500 transition-all duration-300"
                    style={{ width: `${Math.min(5.0, Math.max(0, calculationResults.vDropPercent - 5.0)) * 12}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                  <span>0% (Ideal)</span>
                  <span>3% (NEC Target)</span>
                  <span>5% (Max Limit)</span>
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-blue-500/20">
                <div className="bg-white/70 dark:bg-zinc-900/60 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
                  <span className="block text-[10px] font-bold uppercase text-zinc-400">Receiving Voltage</span>
                  <span className="text-base font-extrabold text-zinc-900 dark:text-white font-mono">
                    {calculationResults.receivingVoltage.toFixed(1)} V
                  </span>
                </div>

                <div className="bg-white/70 dark:bg-zinc-900/60 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
                  <span className="block text-[10px] font-bold uppercase text-zinc-400">Transmission Eff.</span>
                  <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                    {calculationResults.transmissionEfficiency.toFixed(1)}%
                  </span>
                </div>

                <div className="bg-white/70 dark:bg-zinc-900/60 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
                  <span className="block text-[10px] font-bold uppercase text-zinc-400">Conductor R @ {tempC}°C</span>
                  <span className="text-base font-extrabold text-zinc-900 dark:text-white font-mono">
                    {calculationResults.rTotalOhms.toFixed(4)} Ω
                  </span>
                </div>

                <div className="bg-white/70 dark:bg-zinc-900/60 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
                  <span className="block text-[10px] font-bold uppercase text-zinc-400">Conductor Reactance</span>
                  <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                    {calculationResults.xTotalOhms.toFixed(4)} Ω
                  </span>
                </div>
              </div>

              {/* Physical Power Loss & Max Distance Info */}
              <div className="p-3 bg-white/70 dark:bg-zinc-900/60 rounded-xl border border-zinc-200/80 dark:border-zinc-800 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                <div className="flex justify-between">
                  <span>Conductor Heat Loss (I²R):</span>
                  <strong className="font-mono text-zinc-800 dark:text-zinc-200">{calculationResults.powerLossWatts.toFixed(1)} W</strong>
                </div>
                <div className="flex justify-between">
                  <span>Max Route for {targetMaxDropPercent}% Drop:</span>
                  <strong className="font-mono text-zinc-800 dark:text-zinc-200">{calculationResults.maxDistanceMeters.toFixed(1)} m ({calculationResults.maxDistanceFeet.toFixed(0)} ft)</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: Maximum Distance & Reach Lab */}
      {activeMode === 'max_distance_lab' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-500" />
                  Maximum Permissible Cable Run Matrix
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  How far can each conductor size travel at {current}A before hitting your voltage drop limit?
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Target Drop Limit:</span>
                <select
                  value={targetMaxDropPercent}
                  onChange={(e) => setTargetMaxDropPercent(Number(e.target.value))}
                  className="px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-bold text-zinc-900 dark:text-white"
                >
                  <option value="1.0">1.0% (Ultra Strict)</option>
                  <option value="2.0">2.0% (Solar / Data Center)</option>
                  <option value="3.0">3.0% (NEC Branch Standard)</option>
                  <option value="5.0">5.0% (Feeder Max Limit)</option>
                </select>
              </div>
            </div>

            {/* Standard Sizes Evaluation Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 font-bold uppercase">
                    <th className="py-2.5 px-3">Size (mm²)</th>
                    <th className="py-2.5 px-3">AWG</th>
                    <th className="py-2.5 px-3">Max Run (Meters)</th>
                    <th className="py-2.5 px-3">Max Run (Feet)</th>
                    <th className="py-2.5 px-3">Drop at Current {length}m</th>
                    <th className="py-2.5 px-3">Loss (W)</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {CABLE_PROFILES.slice(0, 14).map((p) => {
                    const isSelected = p.sizeMm2 === cableSizeMm2;
                    const isAlum = material === 'aluminum';
                    const r20 = isAlum ? p.rAluminum20 : p.rCopper20;
                    const tempMultiplier = 1 + (isAlum ? 0.00403 : 0.00393) * (tempC - 20);
                    const rPerKm = r20 * tempMultiplier;
                    const rTotal = (rPerKm * lengthInMeters) / 1000;
                    const xTotal = (0.08 * lengthInMeters) / 1000;
                    const cosPhi = phase === 'dc' ? 1.0 : powerFactor;
                    const sinPhi = phase === 'dc' ? 0.0 : Math.sqrt(Math.max(0, 1 - cosPhi * cosPhi));
                    const factor = phase === '3phase' ? Math.sqrt(3) : 2;

                    let dropV = phase === 'dc'
                      ? 2 * current * rTotal
                      : factor * current * (rTotal * cosPhi + xTotal * sinPhi);
                    const dropPct = (dropV / voltage) * 100;
                    const maxDistMeters = ((targetMaxDropPercent / 100) * voltage) / (factor * current * ((rPerKm / 1000) * cosPhi + (0.08 / 1000) * sinPhi));
                    const nConductors = phase === '3phase' ? 3 : 2;
                    const pLoss = nConductors * (current * current) * rTotal;

                    return (
                      <tr
                        key={p.sizeMm2}
                        className={`transition ${
                          isSelected
                            ? 'bg-blue-500/10 font-bold text-blue-900 dark:text-blue-200'
                            : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        <td className="py-2.5 px-3 font-mono font-bold">
                          {p.sizeMm2} mm²
                          {isSelected && <span className="ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500 text-white">Active</span>}
                        </td>
                        <td className="py-2.5 px-3 font-mono">{p.awgEquivalent}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                          {maxDistMeters.toFixed(1)} m
                        </td>
                        <td className="py-2.5 px-3 font-mono text-zinc-500">
                          {(maxDistMeters * 3.28084).toFixed(0)} ft
                        </td>
                        <td className="py-2.5 px-3 font-mono">
                          <span className={dropPct <= targetMaxDropPercent ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}>
                            {dropPct.toFixed(2)}% ({dropV.toFixed(1)}V)
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono">{pLoss.toFixed(0)} W</td>
                        <td className="py-2.5 px-3">
                          {dropPct <= targetMaxDropPercent ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Compliant
                            </span>
                          ) : (
                            <span className="text-red-500 font-semibold">Exceeds {targetMaxDropPercent}%</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: Solar PV DC & Battery Feeder */}
      {activeMode === 'solar_dc_feeder' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-500" />
                  Solar PV String & Low-Voltage DC Battery Sizer
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    DC System Voltage (V)
                  </label>
                  <select
                    value={solarDcVolts}
                    onChange={(e) => setSolarDcVolts(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white"
                  >
                    <option value="12">12V DC (Vehicle / Small Solar)</option>
                    <option value="24">24V DC (Medium Solar / Off-Grid)</option>
                    <option value="48">48V DC (Standard Inverter Bank)</option>
                    <option value="96">96V DC (High Voltage Battery)</option>
                    <option value="600">600V DC (Commercial PV String)</option>
                    <option value="800">800V DC (Utility String Array)</option>
                    <option value="1000">1000V DC (Modern Utility Solar)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    DC Array Current (Amps)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={solarDcAmps}
                    onChange={(e) => setSolarDcAmps(Math.max(1, parseFloat(e.target.value) || 1))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    One-Way Cable Run (m)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={solarDcLengthMeters}
                    onChange={(e) => setSolarDcLengthMeters(Math.max(1, parseFloat(e.target.value) || 1))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-800 dark:text-amber-300 space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Solar Industry Engineering Benchmark:
                </span>
                <p>Solar arrays and battery interconnects should strictly maintain voltage drop <strong>&le; 1.5%</strong> to prevent inverter MPPT efficiency losses and false battery low-voltage disconnects.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                Solar DC Sizing Evaluation
              </h4>

              <div className="text-center py-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                <span className="block text-[10px] font-bold text-zinc-400">DC VOLTAGE DROP</span>
                <span className="text-3xl font-black text-zinc-900 dark:text-white font-mono">
                  {solarDcAnalysis.dcDropPercent.toFixed(2)}%
                </span>
                <span className={`block text-xs font-bold mt-1 ${solarDcAnalysis.isSolarCompliant ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                  {solarDcAnalysis.isSolarCompliant ? '✓ Optimal for Solar (<1.5%)' : '⚠ High Loss - Upsize Cable!'}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                  <span className="text-zinc-500">Total DC Loop Drop:</span>
                  <strong className="font-mono text-zinc-900 dark:text-white">{solarDcAnalysis.dcDropVolts.toFixed(2)} V</strong>
                </div>
                <div className="flex justify-between p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                  <span className="text-zinc-500">Inverter Terminal Voltage:</span>
                  <strong className="font-mono text-zinc-900 dark:text-white">{solarDcAnalysis.dcReceivingVolts.toFixed(2)} V</strong>
                </div>
                <div className="flex justify-between p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                  <span className="text-zinc-500">Wasted Cable Power Loss:</span>
                  <strong className="font-mono text-amber-600 dark:text-amber-400">{solarDcAnalysis.dcPowerLossWatts.toFixed(1)} W</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 4: Motor Starting Inrush Dip */}
      {activeMode === 'motor_inrush_dip' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-500" />
                  Motor Transient Starting Inrush Voltage Dip
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Motor Full Load Amps (FLA)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={motorFlaAmps}
                    onChange={(e) => setMotorFlaAmps(Math.max(1, parseFloat(e.target.value) || 1))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Starting Method & Inrush Multiplier
                  </label>
                  <select
                    value={inrushMultiplier}
                    onChange={(e) => setInrushMultiplier(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white"
                  >
                    <option value="6.0">Direct Online DOL (6.0× Inrush)</option>
                    <option value="2.2">Star-Delta Y-Δ (2.2× Inrush)</option>
                    <option value="1.8">Soft Starter (1.8× Inrush)</option>
                    <option value="1.2">VFD Inverter (1.2× Inrush)</option>
                  </select>
                </div>
              </div>

              <div className="p-3.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 rounded-xl text-xs text-blue-800 dark:text-blue-300 space-y-1">
                <span className="font-bold">Transient Stability Warning:</span>
                <p>If transient terminal voltage drops below 80% (dip &gt; 20%), contactors may release, controls may reset, and induction motors may stall without reaching synchronous speed.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                Motor Starting Transient Dip
              </h4>

              <div className="text-center py-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                <span className="block text-[10px] font-bold text-zinc-400">STARTING PEAK DIP</span>
                <span className={`text-3xl font-black font-mono ${motorDipAnalysis.isSevereDip ? 'text-red-500' : 'text-zinc-900 dark:text-white'}`}>
                  {motorDipAnalysis.inrushDropPercent.toFixed(1)}%
                </span>
                <span className="block text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Terminal Voltage Dips to: <strong className="text-zinc-800 dark:text-zinc-200 font-mono">{motorDipAnalysis.startingTerminalVolts.toFixed(0)} V</strong>
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                  <span className="text-zinc-500">Starting Peak Current:</span>
                  <strong className="font-mono text-red-600 dark:text-red-400">{motorDipAnalysis.inrushAmps.toFixed(0)} A</strong>
                </div>
                <div className="flex justify-between p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                  <span className="text-zinc-500">Transient Voltage Drop:</span>
                  <strong className="font-mono text-zinc-900 dark:text-white">{motorDipAnalysis.inrushDrop.toFixed(1)} V</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 5: Power Loss & Carbon Waste */}
      {activeMode === 'power_loss_carbon' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  Conductor Heat Dissipation & Carbon Footprint
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Electricity Cost (₹ or $ / kWh)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    step="0.5"
                    value={tariffPerKwh}
                    onChange={(e) => setTariffPerKwh(Math.max(0.1, parseFloat(e.target.value) || 8))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Daily Operating Hours
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={hoursPerDay}
                    onChange={(e) => setHoursPerDay(Math.min(24, Math.max(1, parseInt(e.target.value) || 12)))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                Annual Financial & Carbon Loss
              </h4>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl">
                  <span className="block text-[10px] font-bold text-zinc-400 uppercase">Annual Energy Lost</span>
                  <span className="text-base font-extrabold text-zinc-900 dark:text-white font-mono">
                    {powerLossAnalysis.annualKwhWasted.toFixed(0)} kWh/yr
                  </span>
                </div>

                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl">
                  <span className="block text-[10px] font-bold text-zinc-400 uppercase">Annual Bill Loss</span>
                  <span className="text-base font-extrabold text-red-600 dark:text-red-400 font-mono">
                    ₹{powerLossAnalysis.annualFinancialLoss.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">10-Year Cumulative Loss:</span>
                  <strong className="font-mono text-amber-600 dark:text-amber-400">
                    ₹{powerLossAnalysis.tenYearCumulativeCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Annual CO₂ Emissions:</span>
                  <strong className="font-mono text-zinc-700 dark:text-zinc-300">
                    {powerLossAnalysis.annualKgCo2Wasted.toFixed(0)} kg CO₂/yr
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

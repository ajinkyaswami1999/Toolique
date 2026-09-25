/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from 'react';
import {
  Zap,
  Sparkles,
  Copy,
  Check,
  Download,
  Sliders,
  Shield,
  Layers,
  DollarSign,
  Activity,
  Info,
  RefreshCw,
  Gauge
} from 'lucide-react';

// --- Types & Constants ---
export type CableCalculatorMode = 'standard_sizer' | 'voltage_drop_lab' | 'motor_sizer' | 'parallel_runs' | 'lifecycle_economics';
export type ElectricalPhase = '1phase' | '3phase' | 'dc';
export type ConductorMaterial = 'copper' | 'aluminum';
export type CableInsulation = 'pvc' | 'xlpe' | 'epr' | 'lszh';
export type InstallationMethod = 'conduit_wall' | 'conduit_surface' | 'clipped_direct' | 'buried_ground' | 'cable_tray';

export interface CableStandardSize {
  sizeMm2: number;
  awgEquivalent: string;
  diameterMm: number;
  rCopper20: number; // Ohm/km at 20C
  rAluminum20: number; // Ohm/km at 20C
  baseAmpacityCopperB: number; // Base ampacity in conduit (Ref Method B, 30C, PVC 70C)
  baseAmpacityAlumB: number;
  outerDiameter1C: number; // mm
  outerDiameter3C: number; // mm
  outerDiameter4C: number; // mm
}

// IEC 60364-5-52 / IS 694 / IS 1554 / BS 7671 Standard Conductor Profiles
export const CABLE_DATA_PROFILES: CableStandardSize[] = [
  { sizeMm2: 1.0, awgEquivalent: '18 AWG', diameterMm: 1.13, rCopper20: 18.1, rAluminum20: 29.5, baseAmpacityCopperB: 11.0, baseAmpacityAlumB: 8.5, outerDiameter1C: 5.2, outerDiameter3C: 9.8, outerDiameter4C: 10.8 },
  { sizeMm2: 1.5, awgEquivalent: '16 AWG', diameterMm: 1.38, rCopper20: 12.1, rAluminum20: 19.7, baseAmpacityCopperB: 14.5, baseAmpacityAlumB: 11.2, outerDiameter1C: 5.8, outerDiameter3C: 11.2, outerDiameter4C: 12.4 },
  { sizeMm2: 2.5, awgEquivalent: '14 AWG', diameterMm: 1.78, rCopper20: 7.41, rAluminum20: 12.1, baseAmpacityCopperB: 20.0, baseAmpacityAlumB: 15.4, outerDiameter1C: 6.6, outerDiameter3C: 12.8, outerDiameter4C: 14.2 },
  { sizeMm2: 4.0, awgEquivalent: '12 AWG', diameterMm: 2.26, rCopper20: 4.61, rAluminum20: 7.56, baseAmpacityCopperB: 26.0, baseAmpacityAlumB: 20.0, outerDiameter1C: 7.6, outerDiameter3C: 15.0, outerDiameter4C: 16.6 },
  { sizeMm2: 6.0, awgEquivalent: '10 AWG', diameterMm: 2.76, rCopper20: 3.08, rAluminum20: 5.05, baseAmpacityCopperB: 34.0, baseAmpacityAlumB: 26.2, outerDiameter1C: 8.6, outerDiameter3C: 17.2, outerDiameter4C: 19.0 },
  { sizeMm2: 10.0, awgEquivalent: '8 AWG', diameterMm: 3.57, rCopper20: 1.83, rAluminum20: 3.00, baseAmpacityCopperB: 46.0, baseAmpacityAlumB: 35.4, outerDiameter1C: 10.2, outerDiameter3C: 20.6, outerDiameter4C: 22.8 },
  { sizeMm2: 16.0, awgEquivalent: '6 AWG', diameterMm: 4.51, rCopper20: 1.15, rAluminum20: 1.89, baseAmpacityCopperB: 61.0, baseAmpacityAlumB: 47.0, outerDiameter1C: 11.8, outerDiameter3C: 24.2, outerDiameter4C: 26.8 },
  { sizeMm2: 25.0, awgEquivalent: '4 AWG', diameterMm: 5.64, rCopper20: 0.727, rAluminum20: 1.19, baseAmpacityCopperB: 80.0, baseAmpacityAlumB: 61.6, outerDiameter1C: 14.0, outerDiameter3C: 28.6, outerDiameter4C: 31.8 },
  { sizeMm2: 35.0, awgEquivalent: '2 AWG', diameterMm: 6.68, rCopper20: 0.524, rAluminum20: 0.859, baseAmpacityCopperB: 99.0, baseAmpacityAlumB: 76.2, outerDiameter1C: 15.8, outerDiameter3C: 32.2, outerDiameter4C: 35.8 },
  { sizeMm2: 50.0, awgEquivalent: '1/0 AWG', diameterMm: 7.98, rCopper20: 0.387, rAluminum20: 0.635, baseAmpacityCopperB: 119.0, baseAmpacityAlumB: 91.6, outerDiameter1C: 17.8, outerDiameter3C: 36.4, outerDiameter4C: 40.5 },
  { sizeMm2: 70.0, awgEquivalent: '2/0 AWG', diameterMm: 9.44, rCopper20: 0.268, rAluminum20: 0.440, baseAmpacityCopperB: 151.0, baseAmpacityAlumB: 116.3, outerDiameter1C: 20.2, outerDiameter3C: 41.5, outerDiameter4C: 46.2 },
  { sizeMm2: 95.0, awgEquivalent: '3/0 AWG', diameterMm: 11.0, rCopper20: 0.193, rAluminum20: 0.317, baseAmpacityCopperB: 182.0, baseAmpacityAlumB: 140.1, outerDiameter1C: 23.0, outerDiameter3C: 47.2, outerDiameter4C: 52.6 },
  { sizeMm2: 120.0, awgEquivalent: '4/0 AWG', diameterMm: 12.36, rCopper20: 0.153, rAluminum20: 0.251, baseAmpacityCopperB: 210.0, baseAmpacityAlumB: 161.7, outerDiameter1C: 25.2, outerDiameter3C: 52.0, outerDiameter4C: 58.0 },
  { sizeMm2: 150.0, awgEquivalent: '300 kcmil', diameterMm: 13.82, rCopper20: 0.124, rAluminum20: 0.203, baseAmpacityCopperB: 240.0, baseAmpacityAlumB: 184.8, outerDiameter1C: 27.8, outerDiameter3C: 57.5, outerDiameter4C: 64.0 },
  { sizeMm2: 185.0, awgEquivalent: '350 kcmil', diameterMm: 15.35, rCopper20: 0.0991, rAluminum20: 0.163, baseAmpacityCopperB: 273.0, baseAmpacityAlumB: 210.2, outerDiameter1C: 30.5, outerDiameter3C: 63.0, outerDiameter4C: 70.2 },
  { sizeMm2: 240.0, awgEquivalent: '500 kcmil', diameterMm: 17.48, rCopper20: 0.0754, rAluminum20: 0.124, baseAmpacityCopperB: 321.0, baseAmpacityAlumB: 247.2, outerDiameter1C: 34.2, outerDiameter3C: 71.0, outerDiameter4C: 79.0 },
  { sizeMm2: 300.0, awgEquivalent: '600 kcmil', diameterMm: 19.54, rCopper20: 0.0601, rAluminum20: 0.0986, baseAmpacityCopperB: 367.0, baseAmpacityAlumB: 282.6, outerDiameter1C: 38.0, outerDiameter3C: 78.5, outerDiameter4C: 87.5 },
  { sizeMm2: 400.0, awgEquivalent: '800 kcmil', diameterMm: 22.57, rCopper20: 0.0470, rAluminum20: 0.0771, baseAmpacityCopperB: 438.0, baseAmpacityAlumB: 337.3, outerDiameter1C: 43.5, outerDiameter3C: 89.0, outerDiameter4C: 99.0 },
  { sizeMm2: 500.0, awgEquivalent: '1000 kcmil', diameterMm: 25.23, rCopper20: 0.0366, rAluminum20: 0.0600, baseAmpacityCopperB: 504.0, baseAmpacityAlumB: 388.1, outerDiameter1C: 48.0, outerDiameter3C: 98.0, outerDiameter4C: 109.0 },
  { sizeMm2: 630.0, awgEquivalent: '1250 kcmil', diameterMm: 28.32, rCopper20: 0.0283, rAluminum20: 0.0464, baseAmpacityCopperB: 575.0, baseAmpacityAlumB: 442.8, outerDiameter1C: 53.5, outerDiameter3C: 110.0, outerDiameter4C: 122.0 }
];

export interface CableArchetype {
  id: string;
  name: string;
  description: string;
  loadKw: number;
  voltage: number;
  phase: ElectricalPhase;
  material: ConductorMaterial;
  lengthMeters: number;
  powerFactor: number;
  installation: InstallationMethod;
  insulation: CableInsulation;
  allowableDropPercent: number;
}

const CABLE_ARCHETYPES: CableArchetype[] = [
  {
    id: 'home_ac',
    name: '🏠 1.5 TR Inverter AC',
    description: '1-Phase 230V, 1.8 kW, 25m Run in PVC Conduit',
    loadKw: 1.8,
    voltage: 230,
    phase: '1phase',
    material: 'copper',
    lengthMeters: 25,
    powerFactor: 0.88,
    installation: 'conduit_surface',
    insulation: 'pvc',
    allowableDropPercent: 3.0
  },
  {
    id: 'commercial_kitchen',
    name: '🍳 18 kW Combi Oven',
    description: '3-Phase 415V, 18 kW Commercial Kitchen Feed, 45m',
    loadKw: 18.0,
    voltage: 415,
    phase: '3phase',
    material: 'copper',
    lengthMeters: 45,
    powerFactor: 0.95,
    installation: 'conduit_surface',
    insulation: 'xlpe',
    allowableDropPercent: 3.0
  },
  {
    id: 'factory_motor_50hp',
    name: '⚙️ 50 HP Factory Motor',
    description: '3-Phase 415V, 37 kW (50 HP) Star-Delta Feed, 65m',
    loadKw: 37.0,
    voltage: 415,
    phase: '3phase',
    material: 'aluminum',
    lengthMeters: 65,
    powerFactor: 0.85,
    installation: 'cable_tray',
    insulation: 'xlpe',
    allowableDropPercent: 4.0
  },
  {
    id: 'solar_pv_feed',
    name: '☀️ 100 kW Solar Inverter',
    description: '3-Phase 415V Grid Export Feeder, 90m on Ladder Tray',
    loadKw: 100.0,
    voltage: 415,
    phase: '3phase',
    material: 'aluminum',
    lengthMeters: 90,
    powerFactor: 0.99,
    installation: 'cable_tray',
    insulation: 'xlpe',
    allowableDropPercent: 2.0
  },
  {
    id: 'ev_fast_charger',
    name: '🚗 22 kW EV Fast Charger',
    description: '3-Phase 415V Commercial EVSE Terminal, 35m Armored',
    loadKw: 22.0,
    voltage: 415,
    phase: '3phase',
    material: 'copper',
    lengthMeters: 35,
    powerFactor: 0.98,
    installation: 'buried_ground',
    insulation: 'xlpe',
    allowableDropPercent: 2.5
  },
  {
    id: 'transformer_feeder',
    name: '🏢 150 kVA Main Sub-Panel',
    description: '3-Phase 415V Building Incomer Feeder, 50m Heavy Load',
    loadKw: 120.0,
    voltage: 415,
    phase: '3phase',
    material: 'aluminum',
    lengthMeters: 50,
    powerFactor: 0.85,
    installation: 'cable_tray',
    insulation: 'xlpe',
    allowableDropPercent: 3.0
  }
];

export default function CableSizeCalculator() {
  // Navigation Mode
  const [activeMode, setActiveMode] = useState<CableCalculatorMode>('standard_sizer');

  // Core Inputs
  const [loadValue, setLoadValue] = useState<number>(15.0);
  const [loadUnit, setLoadUnit] = useState<'kw' | 'amps' | 'hp' | 'kva'>('kw');
  const [voltage, setVoltage] = useState<number>(415);
  const [phase, setPhase] = useState<ElectricalPhase>('3phase');
  const [powerFactor, setPowerFactor] = useState<number>(0.85);
  const [lengthMeters, setLengthMeters] = useState<number>(45);
  const [material, setMaterial] = useState<ConductorMaterial>('copper');
  const [insulation, setInsulation] = useState<CableInsulation>('xlpe');
  const [installation, setInstallation] = useState<InstallationMethod>('cable_tray');
  const [allowableDropPercent, setAllowableDropPercent] = useState<number>(3.0);

  // Environmental & Derating Factors
  const [ambientTempC, setAmbientTempC] = useState<number>(40); // 40°C tropical standard
  const [groupingCircuits, setGroupingCircuits] = useState<number>(1);
  const [soilResistivityKmW, setSoilResistivityKmW] = useState<number>(1.5);
  const [burialDepthMeters, setBurialDepthMeters] = useState<number>(0.8);
  const [shortCircuitKa, setShortCircuitKa] = useState<number>(10);
  const [faultClearanceSeconds, setFaultClearanceSeconds] = useState<number>(0.2);

  // Motor Sizer State (Mode 3)
  const [motorHp, setMotorHp] = useState<number>(30);
  const [motorEfficiency, setMotorEfficiency] = useState<number>(91.5); // %
  const [startingMethod, setStartingMethod] = useState<'dol' | 'star_delta' | 'soft_starter' | 'vfd'>('star_delta');

  // Parallel Cable Sizer State (Mode 4)
  const [parallelRunsCount, setParallelRunsCount] = useState<number>(2);

  // Lifecycle Economics State (Mode 5)
  const [electricityRatePerKwh, setElectricityRatePerKwh] = useState<number>(8.5); // INR / $ equivalent
  const [operatingHoursPerDay, setOperatingHoursPerDay] = useState<number>(12);
  const [yearsLifespan, setYearsLifespan] = useState<number>(10);

  // Copy/Feedback State
  const [copied, setCopied] = useState<boolean>(false);

  // --- Calculations Engine ---

  // 1. Calculate Design Full Load Current (Amps)
  const calculatedLoadCurrent = useMemo(() => {
    let amps = 0;
    if (loadUnit === 'amps') {
      amps = loadValue;
    } else if (loadUnit === 'kva') {
      const va = loadValue * 1000;
      if (phase === 'dc') {
        amps = va / voltage;
      } else if (phase === '1phase') {
        amps = va / voltage;
      } else {
        amps = va / (Math.sqrt(3) * voltage);
      }
    } else {
      // kW or HP
      const watts = loadUnit === 'hp' ? loadValue * 745.7 : loadValue * 1000;
      if (phase === 'dc') {
        amps = watts / voltage;
      } else if (phase === '1phase') {
        amps = watts / (voltage * powerFactor);
      } else {
        amps = watts / (Math.sqrt(3) * voltage * powerFactor);
      }
    }
    return Math.max(0.1, isNaN(amps) ? 0.1 : amps);
  }, [loadValue, loadUnit, voltage, phase, powerFactor]);

  // 2. Compute Combined Derating Factor (k_total)
  const deratingFactors = useMemo(() => {
    // Temperature derating (k_temp)
    let kTemp = 1.0;
    const maxTemp = (insulation === 'xlpe' || insulation === 'epr' || insulation === 'lszh') ? 90 : 70;
    if (maxTemp === 90) {
      if (ambientTempC <= 25) kTemp = 1.04;
      else if (ambientTempC <= 30) kTemp = 1.00;
      else if (ambientTempC <= 35) kTemp = 0.96;
      else if (ambientTempC <= 40) kTemp = 0.91;
      else if (ambientTempC <= 45) kTemp = 0.87;
      else if (ambientTempC <= 50) kTemp = 0.82;
      else if (ambientTempC <= 55) kTemp = 0.76;
      else kTemp = 0.71;
    } else {
      if (ambientTempC <= 25) kTemp = 1.06;
      else if (ambientTempC <= 30) kTemp = 1.00;
      else if (ambientTempC <= 35) kTemp = 0.94;
      else if (ambientTempC <= 40) kTemp = 0.87;
      else if (ambientTempC <= 45) kTemp = 0.79;
      else if (ambientTempC <= 50) kTemp = 0.71;
      else if (ambientTempC <= 55) kTemp = 0.61;
      else kTemp = 0.50;
    }

    // Grouping derating (k_group)
    let kGroup = 1.0;
    if (groupingCircuits === 2) kGroup = 0.80;
    else if (groupingCircuits === 3) kGroup = 0.70;
    else if (groupingCircuits === 4) kGroup = 0.65;
    else if (groupingCircuits >= 5 && groupingCircuits <= 6) kGroup = 0.57;
    else if (groupingCircuits >= 7 && groupingCircuits <= 9) kGroup = 0.50;
    else if (groupingCircuits >= 10) kGroup = 0.45;

    // Soil & Depth derating for buried runs
    let kSoil = 1.0;
    let kDepth = 1.0;
    if (installation === 'buried_ground') {
      if (soilResistivityKmW <= 1.0) kSoil = 1.08;
      else if (soilResistivityKmW <= 1.5) kSoil = 1.00;
      else if (soilResistivityKmW <= 2.0) kSoil = 0.90;
      else kSoil = 0.80;

      if (burialDepthMeters <= 0.5) kDepth = 1.00;
      else if (burialDepthMeters <= 0.8) kDepth = 0.98;
      else if (burialDepthMeters <= 1.0) kDepth = 0.96;
      else kDepth = 0.94;
    }

    // Installation method multiplier
    let kMethod = 1.0;
    if (installation === 'conduit_wall') kMethod = 0.88;
    else if (installation === 'conduit_surface') kMethod = 1.00;
    else if (installation === 'clipped_direct') kMethod = 1.15;
    else if (installation === 'buried_ground') kMethod = 1.18;
    else if (installation === 'cable_tray') kMethod = 1.28;

    // Insulation baseline multiplier relative to PVC 70C
    let kInsulation = 1.0;
    if (insulation === 'xlpe' || insulation === 'epr') kInsulation = 1.22;
    else if (insulation === 'lszh') kInsulation = 1.20;

    const overallDeratingFactor = Math.max(0.2, kTemp * kGroup * kSoil * kDepth);

    return {
      kTemp,
      kGroup,
      kSoil,
      kDepth,
      kMethod,
      kInsulation,
      overallDeratingFactor
    };
  }, [ambientTempC, insulation, groupingCircuits, installation, soilResistivityKmW, burialDepthMeters]);

  // 3. Conductor Sizing Evaluation Across All Criteria
  const sizingAnalysis = useMemo(() => {
    const requiredCurrent = calculatedLoadCurrent;
    const targetDropPercent = allowableDropPercent;
    const targetDropVolts = (targetDropPercent / 100) * voltage;
    const isAlum = material === 'aluminum';

    // Temperature coefficient for resistance
    const opTemp = (insulation === 'xlpe' || insulation === 'epr' || insulation === 'lszh') ? 90 : 70;
    const alpha = isAlum ? 0.00403 : 0.00393;
    const tempResistanceMultiplier = 1 + alpha * (opTemp - 20);

    // Short-circuit adiabatic minimum section: S_sc = (I_sc * sqrt(t)) / k
    const kConstant = isAlum
      ? (opTemp === 90 ? 94 : 76)
      : (opTemp === 90 ? 143 : 115);
    const minShortCircuitMm2 = ((shortCircuitKa * 1000) * Math.sqrt(faultClearanceSeconds)) / kConstant;

    // Evaluate each standard size
    let selectedSizeProfile: CableStandardSize | null = null;
    let selectedDeratedAmpacity = 0;
    let selectedVoltageDropVolts = 0;
    let selectedVoltageDropPercent = 0;
    let selectedPowerLossWatts = 0;
    let selectedReason = '';

    const evaluatedSizes = CABLE_DATA_PROFILES.map((profile) => {
      // 1. Base ampacity
      const baseAmp = isAlum ? profile.baseAmpacityAlumB : profile.baseAmpacityCopperB;
      // Derated ampacity Iz = base * kMethod * kInsulation * overallDerating
      const deratedAmpacity = baseAmp * deratingFactors.kMethod * deratingFactors.kInsulation * deratingFactors.overallDeratingFactor;

      // 2. Resistance calculation at operating temperature
      const r20 = isAlum ? profile.rAluminum20 : profile.rCopper20;
      const rOp = (r20 * tempResistanceMultiplier * lengthMeters) / 1000; // in Ohms
      const xOp = (0.08 * lengthMeters) / 1000; // Standard 0.08 Ohm/km reactance

      // 3. Voltage drop
      let vDrop = 0;
      if (phase === 'dc') {
        vDrop = 2 * requiredCurrent * rOp;
      } else if (phase === '1phase') {
        const sinPhi = Math.sqrt(Math.max(0, 1 - powerFactor * powerFactor));
        vDrop = 2 * requiredCurrent * (rOp * powerFactor + xOp * sinPhi);
      } else {
        // 3 Phase
        const sinPhi = Math.sqrt(Math.max(0, 1 - powerFactor * powerFactor));
        vDrop = Math.sqrt(3) * requiredCurrent * (rOp * powerFactor + xOp * sinPhi);
      }
      const vDropPercent = (vDrop / voltage) * 100;

      // 4. Power loss I^2 R in conductors
      const nConductors = phase === '3phase' ? 3 : 2;
      const pLossWatts = nConductors * (requiredCurrent * requiredCurrent) * rOp;

      // Feasibility checks
      const passesAmpacity = deratedAmpacity >= requiredCurrent;
      const passesVoltageDrop = vDropPercent <= targetDropPercent;
      const passesShortCircuit = profile.sizeMm2 >= minShortCircuitMm2;
      const isCompliant = passesAmpacity && passesVoltageDrop && passesShortCircuit;

      return {
        profile,
        deratedAmpacity,
        vDrop,
        vDropPercent,
        pLossWatts,
        rOp,
        passesAmpacity,
        passesVoltageDrop,
        passesShortCircuit,
        isCompliant
      };
    });

    // Find the first compliant size
    const firstCompliant = evaluatedSizes.find(s => s.isCompliant);

    if (firstCompliant) {
      selectedSizeProfile = firstCompliant.profile;
      selectedDeratedAmpacity = firstCompliant.deratedAmpacity;
      selectedVoltageDropVolts = firstCompliant.vDrop;
      selectedVoltageDropPercent = firstCompliant.vDropPercent;
      selectedPowerLossWatts = firstCompliant.pLossWatts;

      if (!evaluatedSizes.find(s => s.passesAmpacity && s.profile.sizeMm2 < firstCompliant.profile.sizeMm2)) {
        selectedReason = 'Governed primarily by Continuous Thermal Ampacity';
      } else if (firstCompliant.profile.sizeMm2 > minShortCircuitMm2 && firstCompliant.vDropPercent > targetDropPercent * 0.8) {
        selectedReason = 'Upsized to satisfy Allowable Voltage Drop constraint';
      } else if (minShortCircuitMm2 > (evaluatedSizes.find(s => s.passesAmpacity)?.profile.sizeMm2 || 0)) {
        selectedReason = 'Upsized to withstand Short-Circuit fault thermal stress';
      } else {
        selectedReason = 'Optimal engineering match across all electrical standards';
      }
    } else {
      // If single cable exceeds 630mm², use largest size but flag parallel need
      const largest = evaluatedSizes[evaluatedSizes.length - 1];
      selectedSizeProfile = largest.profile;
      selectedDeratedAmpacity = largest.deratedAmpacity;
      selectedVoltageDropVolts = largest.vDrop;
      selectedVoltageDropPercent = largest.vDropPercent;
      selectedPowerLossWatts = largest.pLossWatts;
      selectedReason = 'Exceeds standard 630 mm² single cable. Multi-cable parallel run required!';
    }

    // Recommended Protective Circuit Breaker (MCB / MCCB / ACB)
    const standardBreakerRatings = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600];
    const recommendedBreakerAmps = standardBreakerRatings.find(b => b >= requiredCurrent) || Math.ceil(requiredCurrent * 1.25);

    // Conduit Sizing recommendation (based on 40% fill rule)
    const cableOd = phase === '3phase' ? selectedSizeProfile.outerDiameter4C : selectedSizeProfile.outerDiameter3C;
    const cableArea = Math.PI * Math.pow(cableOd / 2, 2);
    const requiredConduitArea = cableArea / 0.40; // 40% fill
    const minConduitId = Math.sqrt((4 * requiredConduitArea) / Math.PI);
    const standardConduits = [20, 25, 32, 40, 50, 63, 75, 90, 110];
    const recommendedConduitMm = standardConduits.find(c => c >= minConduitId) || Math.ceil(minConduitId);

    // Max run length before reaching target voltage drop limit
    const rUnit = (isAlum ? selectedSizeProfile.rAluminum20 : selectedSizeProfile.rCopper20) * tempResistanceMultiplier / 1000;
    const sinPhi = Math.sqrt(Math.max(0, 1 - powerFactor * powerFactor));
    const factorPhase = phase === '3phase' ? Math.sqrt(3) : 2;
    const maxDistanceMeters = targetDropVolts / (factorPhase * requiredCurrent * (rUnit * powerFactor + 0.00008 * sinPhi));

    return {
      selectedSizeProfile,
      selectedDeratedAmpacity,
      selectedVoltageDropVolts,
      selectedVoltageDropPercent,
      selectedPowerLossWatts,
      selectedReason,
      isFeasible: !!firstCompliant,
      minShortCircuitMm2,
      recommendedBreakerAmps,
      recommendedConduitMm,
      maxDistanceMeters: Math.max(1, maxDistanceMeters),
      evaluatedSizes,
      targetDropVolts
    };
  }, [
    calculatedLoadCurrent,
    allowableDropPercent,
    voltage,
    material,
    insulation,
    lengthMeters,
    powerFactor,
    phase,
    shortCircuitKa,
    faultClearanceSeconds,
    deratingFactors
  ]);

  // 4. Motor Sizer Specific Calculations (Mode 3)
  const motorAnalysis = useMemo(() => {
    const motorWatts = (motorHp * 745.7) / (motorEfficiency / 100);
    const motorFla = motorWatts / (Math.sqrt(3) * 415 * 0.85); // 415V 3-Phase standard
    const continuousDutyAmps = motorFla * 1.25; // 125% NEC 430.22 rule

    let inrushMultiplier = 6.5;
    let starterTypeLabel = 'Direct-On-Line (DOL)';
    if (startingMethod === 'star_delta') {
      inrushMultiplier = 2.2;
      starterTypeLabel = 'Star-Delta (Y-Δ)';
    } else if (startingMethod === 'soft_starter') {
      inrushMultiplier = 1.8;
      starterTypeLabel = 'Electronic Soft Starter';
    } else if (startingMethod === 'vfd') {
      inrushMultiplier = 1.2;
      starterTypeLabel = 'Variable Frequency Drive (VFD)';
    }

    const startingInrushAmps = motorFla * inrushMultiplier;
    const mpcbBreakerAmps = Math.ceil(motorFla * 1.15);
    const mpcbTripRange = `${(motorFla * 0.9).toFixed(1)}A – ${(motorFla * 1.2).toFixed(1)}A`;

    return {
      motorFla,
      continuousDutyAmps,
      startingInrushAmps,
      starterTypeLabel,
      mpcbBreakerAmps,
      mpcbTripRange
    };
  }, [motorHp, motorEfficiency, startingMethod]);

  // 5. Parallel Runs Sizer (Mode 4)
  const parallelAnalysis = useMemo(() => {
    const totalCurrent = calculatedLoadCurrent;
    const runs = parallelRunsCount;
    const currentPerRun = totalCurrent / runs;

    // Find smallest size for single run
    const singleRunSize = sizingAnalysis.selectedSizeProfile.sizeMm2;

    // Find compliant size per parallel run
    const matchedParallel = sizingAnalysis.evaluatedSizes.find(s => s.deratedAmpacity >= currentPerRun && (s.vDropPercent / runs) <= allowableDropPercent);
    const parallelSize = matchedParallel ? matchedParallel.profile.sizeMm2 : Math.ceil(singleRunSize / runs);

    return {
      runs,
      currentPerRun,
      parallelSize,
      singleRunSize
    };
  }, [calculatedLoadCurrent, parallelRunsCount, sizingAnalysis, allowableDropPercent]);

  // 6. Lifecycle Economics Comparison (Mode 5)
  const lifecycleAnalysis = useMemo(() => {
    const annualHours = operatingHoursPerDay * 365;
    const activeLossKw = sizingAnalysis.selectedPowerLossWatts / 1000;
    const annualKwhWasted = activeLossKw * annualHours;
    const annualCost = annualKwhWasted * electricityRatePerKwh;
    const lifetimeCost = annualCost * yearsLifespan;

    // Copper vs Aluminum comparison
    const cuLossWatts = sizingAnalysis.selectedPowerLossWatts;
    const alLossWatts = material === 'aluminum' ? sizingAnalysis.selectedPowerLossWatts : sizingAnalysis.selectedPowerLossWatts * 1.62;
    const alAnnualLossKwh = (alLossWatts / 1000) * annualHours;
    const alLifetimeCost = alAnnualLossKwh * electricityRatePerKwh * yearsLifespan;

    const cuAnnualLossKwh = (cuLossWatts / 1000) * annualHours;
    const cuLifetimeCost = cuAnnualLossKwh * electricityRatePerKwh * yearsLifespan;
    const lifetimeEnergySavingsWithCopper = Math.max(0, alLifetimeCost - cuLifetimeCost);

    return {
      annualKwhWasted,
      annualCost,
      lifetimeCost,
      cuLifetimeCost,
      alLifetimeCost,
      lifetimeEnergySavingsWithCopper
    };
  }, [
    sizingAnalysis.selectedPowerLossWatts,
    operatingHoursPerDay,
    electricityRatePerKwh,
    yearsLifespan,
    material
  ]);

  // Apply Archetype Preset
  const handleApplyArchetype = (arch: CableArchetype) => {
    setLoadValue(arch.loadKw);
    setLoadUnit('kw');
    setVoltage(arch.voltage);
    setPhase(arch.phase);
    setMaterial(arch.material);
    setLengthMeters(arch.lengthMeters);
    setPowerFactor(arch.powerFactor);
    setInstallation(arch.installation);
    setInsulation(arch.insulation);
    setAllowableDropPercent(arch.allowableDropPercent);
  };

  // Copy Spec Sheet
  const handleCopySpecSheet = () => {
    const p = sizingAnalysis.selectedSizeProfile;
    const text = `===================================================
TOOLIQUE CABLE SIZING & ENGINEERING SPECIFICATION
===================================================
⚡ LOAD & SYSTEM PARAMETERS:
- Connected Load: ${loadValue} ${loadUnit.toUpperCase()} (${calculatedLoadCurrent.toFixed(1)} A Full Load Current)
- System Voltage: ${voltage}V (${phase === '3phase' ? '3-Phase AC 50/60Hz' : phase === '1phase' ? '1-Phase AC 230V' : 'DC Bus'})
- Power Factor (cos φ): ${powerFactor.toFixed(2)}
- Route Distance: ${lengthMeters} meters
- Ambient Temp / Derating Factor: ${ambientTempC}°C (Combined Derating k = ${deratingFactors.overallDeratingFactor.toFixed(2)})

🎯 RECOMMENDED CABLE SPECIFICATION:
- Minimum Conductor Size: ${p.sizeMm2} mm² (${p.awgEquivalent})
- Conductor Material: ${material === 'copper' ? 'High Conductivity Electrolytic Copper (Cu)' : 'EC Grade Aluminum (Al)'}
- Cable Insulation: ${insulation.toUpperCase()} (${(insulation === 'xlpe' || insulation === 'epr' || insulation === 'lszh') ? '90°C Rated' : '70°C Rated'})
- Installation Method: ${installation.replace('_', ' ').toUpperCase()}
- Cable Core Outer Diameter: ~${phase === '3phase' ? p.outerDiameter4C : p.outerDiameter3C} mm
- Minimum Recommended Conduit: Ø ${sizingAnalysis.recommendedConduitMm} mm (40% Max Fill Rule)

📊 VOLTAGE DROP & PERFORMANCE:
- Line Voltage Drop: ${sizingAnalysis.selectedVoltageDropVolts.toFixed(2)} V (${sizingAnalysis.selectedVoltageDropPercent.toFixed(2)}% vs ${allowableDropPercent}% limit)
- Effective Derated Ampacity (Iz): ${sizingAnalysis.selectedDeratedAmpacity.toFixed(1)} A (Load = ${calculatedLoadCurrent.toFixed(1)} A)
- Conductor Power Loss (I²R): ${sizingAnalysis.selectedPowerLossWatts.toFixed(1)} Watts
- Recommended Circuit Breaker: ${sizingAnalysis.recommendedBreakerAmps}A MCB / MCCB
- Short-Circuit Withstand Capacity: Safe for ${shortCircuitKa}kA @ ${faultClearanceSeconds}s fault
===================================================`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export CSV
  const handleExportCSV = () => {
    const p = sizingAnalysis.selectedSizeProfile;
    const lines = [
      ['Parameter', 'Value', 'Unit'],
      ['Connected Load', loadValue.toString(), loadUnit.toUpperCase()],
      ['Full Load Current (Ib)', calculatedLoadCurrent.toFixed(2), 'Amps'],
      ['System Voltage', voltage.toString(), 'Volts'],
      ['Phase Configuration', phase, ''],
      ['Route Length', lengthMeters.toString(), 'Meters'],
      ['Power Factor', powerFactor.toString(), ''],
      ['Conductor Material', material, ''],
      ['Insulation Type', insulation.toUpperCase(), ''],
      ['Recommended Conductor Size', p.sizeMm2.toString(), 'mm²'],
      ['AWG Equivalent', p.awgEquivalent, ''],
      ['Derated Ampacity (Iz)', sizingAnalysis.selectedDeratedAmpacity.toFixed(1), 'Amps'],
      ['Voltage Drop', sizingAnalysis.selectedVoltageDropPercent.toFixed(2), '%'],
      ['Voltage Drop (Volts)', sizingAnalysis.selectedVoltageDropVolts.toFixed(2), 'Volts'],
      ['Power Loss', sizingAnalysis.selectedPowerLossWatts.toFixed(1), 'Watts'],
      ['Recommended Breaker', sizingAnalysis.recommendedBreakerAmps.toString(), 'Amps'],
      ['Recommended Conduit Diameter', sizingAnalysis.recommendedConduitMm.toString(), 'mm']
    ];
    const csvContent = lines.map(l => l.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cable_sizing_${p.sizeMm2}mm2_${calculatedLoadCurrent.toFixed(0)}A.csv`;
    link.click();
  };

  const handleReset = () => {
    setLoadValue(15.0);
    setLoadUnit('kw');
    setVoltage(415);
    setPhase('3phase');
    setPowerFactor(0.85);
    setLengthMeters(45);
    setMaterial('copper');
    setInsulation('xlpe');
    setInstallation('cable_tray');
    setAllowableDropPercent(3.0);
    setAmbientTempC(40);
    setGroupingCircuits(1);
    setSoilResistivityKmW(1.5);
    setBurialDepthMeters(0.8);
  };

  return (
    <div className="space-y-6 text-left">
      {/* AEO Instant Cable Insights Card (Zero Double Heading) */}
      <div className="bg-gradient-to-br from-amber-50/90 via-white to-orange-50/70 dark:from-amber-950/30 dark:via-zinc-900/60 dark:to-orange-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-600 text-white uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3 h-3 fill-current" /> AEO Cable Sizing
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                IEC 60364-5-52 / IS 732 / BS 7671 Standard
              </span>
            </div>
            <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 flex-wrap">
              <span>Required Size: <strong className="text-amber-600 dark:text-amber-400 font-mono text-base">{sizingAnalysis.selectedSizeProfile.sizeMm2} mm²</strong> <span className="text-xs text-zinc-500">({sizingAnalysis.selectedSizeProfile.awgEquivalent})</span></span>
              <span className="text-zinc-300 dark:text-zinc-700">|</span>
              <span>Full Load: <strong className="text-zinc-900 dark:text-zinc-100 font-mono">{calculatedLoadCurrent.toFixed(1)} A</strong></span>
              <span className="text-zinc-300 dark:text-zinc-700">|</span>
              <span>Voltage Drop: <strong className={`font-mono ${sizingAnalysis.selectedVoltageDropPercent <= allowableDropPercent ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{sizingAnalysis.selectedVoltageDropPercent.toFixed(2)}%</strong></span>
              <span className="text-zinc-300 dark:text-zinc-700">|</span>
              <span>Conduit: <strong className="font-mono text-zinc-800 dark:text-zinc-200">Ø {sizingAnalysis.recommendedConduitMm} mm</strong></span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopySpecSheet}
              className="px-3 py-1.5 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-200 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-amber-500" />}
              <span>{copied ? 'Copied Specs!' : 'Copy Spec Sheet'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* 1-Click Archetype Presets */}
        <div className="mt-3 pt-3 border-t border-amber-100/70 dark:border-amber-900/30 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Presets:
          </span>
          {CABLE_ARCHETYPES.map(arch => (
            <button
              key={arch.id}
              onClick={() => handleApplyArchetype(arch)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white/80 dark:bg-zinc-800/80 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/80 transition cursor-pointer"
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
          onClick={() => setActiveMode('standard_sizer')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeMode === 'standard_sizer'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>1. Standard Cable Sizer</span>
        </button>

        <button
          onClick={() => setActiveMode('voltage_drop_lab')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeMode === 'voltage_drop_lab'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
          }`}
        >
          <Gauge className="w-4 h-4" />
          <span>2. Voltage Drop & Run Lab</span>
        </button>

        <button
          onClick={() => setActiveMode('motor_sizer')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeMode === 'motor_sizer'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>3. Motor Feeder & Inrush</span>
        </button>

        <button
          onClick={() => setActiveMode('parallel_runs')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeMode === 'parallel_runs'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>4. Parallel Multi-Runs</span>
        </button>

        <button
          onClick={() => setActiveMode('lifecycle_economics')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeMode === 'lifecycle_economics'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>5. Lifecycle Economics</span>
        </button>
      </div>

      {/* MODE 1: Standard Cable Sizer */}
      {activeMode === 'standard_sizer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-500" />
                  Electrical Load & System Ratings
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

              {/* Load input */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Connected Load
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.5"
                    value={loadValue}
                    onChange={(e) => setLoadValue(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Load Unit
                  </label>
                  <select
                    value={loadUnit}
                    onChange={(e) => setLoadUnit(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="kw">Kilowatts (kW)</option>
                    <option value="amps">Amps (A)</option>
                    <option value="hp">Horsepower (HP)</option>
                    <option value="kva">kVA (Apparent)</option>
                  </select>
                </div>
              </div>

              {/* System Phase & Voltage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Phase Configuration
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
                            ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400'
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
                    System Voltage (Volts)
                  </label>
                  <input
                    type="number"
                    min="12"
                    max="33000"
                    value={voltage}
                    onChange={(e) => setVoltage(Math.max(1, parseFloat(e.target.value) || 1))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Distance & Power Factor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Cable Run Length (Meters)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="2000"
                    value={lengthMeters}
                    onChange={(e) => setLengthMeters(Math.max(1, parseFloat(e.target.value) || 1))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
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
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white disabled:opacity-50 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Conductor & Insulation */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Conductor Metal
                  </label>
                  <select
                    value={material}
                    onChange={(e) => setMaterial(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="copper">Electrolytic Copper (Cu)</option>
                    <option value="aluminum">EC Grade Aluminum (Al)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Insulation Grade
                  </label>
                  <select
                    value={insulation}
                    onChange={(e) => setInsulation(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="xlpe">XLPE (90°C Cross-Linked)</option>
                    <option value="pvc">PVC (70°C Standard)</option>
                    <option value="epr">EPR (90°C Rubber)</option>
                    <option value="lszh">LSZH (90°C Zero Halogen)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Installation Method
                  </label>
                  <select
                    value={installation}
                    onChange={(e) => setInstallation(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="cable_tray">Perforated / Ladder Tray</option>
                    <option value="conduit_surface">In Conduit / Surface Duct</option>
                    <option value="conduit_wall">In Conduit Inside Wall</option>
                    <option value="clipped_direct">Clipped Direct to Wall</option>
                    <option value="buried_ground">Direct Buried Underground</option>
                  </select>
                </div>
              </div>

              {/* Deratings Accordion */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-500" />
                  Site Derating & Protection Factors
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 mb-1">Ambient Air Temp</label>
                    <select
                      value={ambientTempC}
                      onChange={(e) => setAmbientTempC(Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold text-zinc-900 dark:text-white"
                    >
                      <option value="25">25°C (Cool)</option>
                      <option value="30">30°C (Standard)</option>
                      <option value="35">35°C (Warm)</option>
                      <option value="40">40°C (Tropical)</option>
                      <option value="45">45°C (Hot Plant)</option>
                      <option value="50">50°C (Extreme)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 mb-1">Cables Grouped</label>
                    <select
                      value={groupingCircuits}
                      onChange={(e) => setGroupingCircuits(Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold text-zinc-900 dark:text-white"
                    >
                      <option value="1">1 Circuit (None)</option>
                      <option value="2">2 Touching (0.80)</option>
                      <option value="3">3 Touching (0.70)</option>
                      <option value="4">4 Touching (0.65)</option>
                      <option value="6">6 Touching (0.57)</option>
                      <option value="9">9+ Touching (0.50)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 mb-1">Allowable Drop (%)</label>
                    <select
                      value={allowableDropPercent}
                      onChange={(e) => setAllowableDropPercent(Number(e.target.value))}
                      className="w-full px-2 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold text-zinc-900 dark:text-white"
                    >
                      <option value="2.0">2.0% (Strict/Solar)</option>
                      <option value="2.5">2.5% (Sensitive)</option>
                      <option value="3.0">3.0% (NEC/IS Standard)</option>
                      <option value="4.0">4.0% (Motor Feed)</option>
                      <option value="5.0">5.0% (Utility Feeder)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 mb-1">Fault kA @ Sec</label>
                    <div className="flex gap-1">
                      <select
                        value={shortCircuitKa}
                        onChange={(e) => setShortCircuitKa(Number(e.target.value))}
                        className="w-1/2 px-1 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold text-zinc-900 dark:text-white"
                      >
                        <option value="5">5kA</option>
                        <option value="10">10kA</option>
                        <option value="15">15kA</option>
                        <option value="25">25kA</option>
                        <option value="50">50kA</option>
                      </select>
                      <select
                        value={faultClearanceSeconds}
                        onChange={(e) => setFaultClearanceSeconds(Number(e.target.value))}
                        className="w-1/2 px-1 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold text-zinc-900 dark:text-white"
                      >
                        <option value="0.1">0.1s</option>
                        <option value="0.2">0.2s</option>
                        <option value="0.5">0.5s</option>
                        <option value="1.0">1.0s</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Conditional Buried Ground Controls */}
                {installation === 'buried_ground' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-500 mb-1">Soil Thermal Resistivity</label>
                      <select
                        value={soilResistivityKmW}
                        onChange={(e) => setSoilResistivityKmW(Number(e.target.value))}
                        className="w-full px-2 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold text-zinc-900 dark:text-white"
                      >
                        <option value="1.0">1.0 K·m/W (Moist Soil - 1.08×)</option>
                        <option value="1.5">1.5 K·m/W (Standard Soil - 1.00×)</option>
                        <option value="2.0">2.0 K·m/W (Dry Sandy - 0.90×)</option>
                        <option value="2.5">2.5 K·m/W (Very Dry - 0.80×)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-zinc-500 mb-1">Burial Depth</label>
                      <select
                        value={burialDepthMeters}
                        onChange={(e) => setBurialDepthMeters(Number(e.target.value))}
                        className="w-full px-2 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold text-zinc-900 dark:text-white"
                      >
                        <option value="0.5">0.5 Meter (Surface trench - 1.00×)</option>
                        <option value="0.8">0.8 Meter (Standard underground - 0.98×)</option>
                        <option value="1.0">1.0 Meter (Deep direct buried - 0.96×)</option>
                        <option value="1.25">1.25 Meter (High depth - 0.94×)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results Summary Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex justify-between items-center border-b border-amber-500/20 pb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Recommended Conductor
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                  {material === 'copper' ? 'Copper (Cu)' : 'Aluminum (Al)'}
                </span>
              </div>

              {/* Main Gauge Hero */}
              <div className="text-center py-2">
                <div className="text-5xl font-black text-zinc-900 dark:text-white font-mono tracking-tight">
                  {sizingAnalysis.selectedSizeProfile.sizeMm2} <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">mm²</span>
                </div>
                <div className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mt-1">
                  AWG Equivalent: <strong className="text-zinc-700 dark:text-zinc-200">{sizingAnalysis.selectedSizeProfile.awgEquivalent}</strong>
                </div>
                <div className="text-xs text-amber-700 dark:text-amber-300 font-medium mt-1.5">
                  {sizingAnalysis.selectedReason}
                </div>
              </div>

              {/* Engineering Metrics Grid */}
              <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-amber-500/20">
                <div className="bg-white/70 dark:bg-zinc-900/60 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
                  <span className="block text-[10px] font-bold uppercase text-zinc-400">Load Current (Ib)</span>
                  <span className="text-base font-extrabold text-zinc-900 dark:text-white font-mono">
                    {calculatedLoadCurrent.toFixed(1)} A
                  </span>
                </div>

                <div className="bg-white/70 dark:bg-zinc-900/60 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
                  <span className="block text-[10px] font-bold uppercase text-zinc-400">Derated Ampacity (Iz)</span>
                  <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                    {sizingAnalysis.selectedDeratedAmpacity.toFixed(1)} A
                  </span>
                </div>

                <div className="bg-white/70 dark:bg-zinc-900/60 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
                  <span className="block text-[10px] font-bold uppercase text-zinc-400">Voltage Drop</span>
                  <span className={`text-base font-extrabold font-mono ${sizingAnalysis.selectedVoltageDropPercent <= allowableDropPercent ? 'text-zinc-900 dark:text-white' : 'text-red-500'}`}>
                    {sizingAnalysis.selectedVoltageDropPercent.toFixed(2)}% ({sizingAnalysis.selectedVoltageDropVolts.toFixed(1)}V)
                  </span>
                </div>

                <div className="bg-white/70 dark:bg-zinc-900/60 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
                  <span className="block text-[10px] font-bold uppercase text-zinc-400">Protective Breaker</span>
                  <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                    {sizingAnalysis.recommendedBreakerAmps}A MCB
                  </span>
                </div>
              </div>

              {/* Physical & Conduit Specs */}
              <div className="p-3 bg-white/70 dark:bg-zinc-900/60 rounded-xl border border-zinc-200/80 dark:border-zinc-800 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                <div className="flex justify-between">
                  <span>Conduit Outer Diameter:</span>
                  <strong className="font-mono text-zinc-800 dark:text-zinc-200">Ø {sizingAnalysis.recommendedConduitMm} mm (40% max fill)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Cable Core Approx OD:</span>
                  <strong className="font-mono text-zinc-800 dark:text-zinc-200">~{phase === '3phase' ? sizingAnalysis.selectedSizeProfile.outerDiameter4C : sizingAnalysis.selectedSizeProfile.outerDiameter3C} mm</strong>
                </div>
                <div className="flex justify-between">
                  <span>Conductor I²R Heat Loss:</span>
                  <strong className="font-mono text-zinc-800 dark:text-zinc-200">{sizingAnalysis.selectedPowerLossWatts.toFixed(1)} W ({((sizingAnalysis.selectedPowerLossWatts / (calculatedLoadCurrent * voltage * (phase === '3phase' ? 1.732 : 1))) * 100).toFixed(2)}%)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Max Route for {allowableDropPercent}% Drop:</span>
                  <strong className="font-mono text-zinc-800 dark:text-zinc-200">{sizingAnalysis.maxDistanceMeters.toFixed(0)} meters</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: Voltage Drop & Distance Lab */}
      {activeMode === 'voltage_drop_lab' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-amber-500" />
                  Conductor Voltage Drop & Route Distance Curve
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Analyze voltage attenuation, conductor resistance at operating temperature, and distance limits.
                </p>
              </div>
            </div>

            {/* Distance Interactive Slider */}
            <div className="space-y-2 bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-zinc-700 dark:text-zinc-300">Interactive Route Length</span>
                <span className="font-mono font-extrabold text-amber-600 dark:text-amber-400 text-sm">{lengthMeters} Meters</span>
              </div>
              <input
                type="range"
                min="5"
                max="500"
                step="5"
                value={lengthMeters}
                onChange={(e) => setLengthMeters(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                <span>5m (Short)</span>
                <span>Max allowable at {allowableDropPercent}%: {sizingAnalysis.maxDistanceMeters.toFixed(0)}m</span>
                <span>500m (Long Feeder)</span>
              </div>
            </div>

            {/* Standard Sizes Evaluation Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 font-bold uppercase">
                    <th className="py-2.5 px-3">Size (mm²)</th>
                    <th className="py-2.5 px-3">AWG</th>
                    <th className="py-2.5 px-3">Derated Iz</th>
                    <th className="py-2.5 px-3">Drop (V)</th>
                    <th className="py-2.5 px-3">Drop (%)</th>
                    <th className="py-2.5 px-3">Heat Loss (W)</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {sizingAnalysis.evaluatedSizes.slice(0, 12).map((row) => {
                    const isSelected = row.profile.sizeMm2 === sizingAnalysis.selectedSizeProfile.sizeMm2;
                    return (
                      <tr
                        key={row.profile.sizeMm2}
                        className={`transition ${
                          isSelected
                            ? 'bg-amber-500/10 font-bold text-amber-900 dark:text-amber-200'
                            : row.isCompliant
                            ? 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300'
                            : 'opacity-50 bg-zinc-50/30 dark:bg-zinc-900/30 text-zinc-400'
                        }`}
                      >
                        <td className="py-2.5 px-3 font-mono font-bold">
                          {row.profile.sizeMm2} mm²
                          {isSelected && <span className="ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500 text-white">Selected</span>}
                        </td>
                        <td className="py-2.5 px-3 font-mono">{row.profile.awgEquivalent}</td>
                        <td className="py-2.5 px-3 font-mono">{row.deratedAmpacity.toFixed(1)} A</td>
                        <td className="py-2.5 px-3 font-mono">{row.vDrop.toFixed(2)} V</td>
                        <td className="py-2.5 px-3 font-mono">
                          <span className={row.vDropPercent <= allowableDropPercent ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}>
                            {row.vDropPercent.toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono">{row.pLossWatts.toFixed(0)} W</td>
                        <td className="py-2.5 px-3">
                          {row.isCompliant ? (
                            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
                              <Check className="w-3.5 h-3.5" /> Pass
                            </span>
                          ) : !row.passesAmpacity ? (
                            <span className="text-red-500">Overcurrent</span>
                          ) : (
                            <span className="text-amber-500">High Drop</span>
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

      {/* MODE 3: Motor Feeder & Inrush Sizer */}
      {activeMode === 'motor_sizer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-500" />
                  3-Phase Induction Motor Feeder Sizing (NEC 430 / IS 325)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Motor Rating (HP)
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    max="500"
                    value={motorHp}
                    onChange={(e) => {
                      const val = Math.max(0.5, parseFloat(e.target.value) || 0.5);
                      setMotorHp(val);
                      setLoadValue(val);
                      setLoadUnit('hp');
                      setPhase('3phase');
                      setVoltage(415);
                    }}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Motor Efficiency (%)
                  </label>
                  <input
                    type="number"
                    min="70"
                    max="98"
                    step="0.5"
                    value={motorEfficiency}
                    onChange={(e) => setMotorEfficiency(Math.min(98, Math.max(70, parseFloat(e.target.value) || 90)))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Starting Method
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'dol', label: 'DOL (6.5×)', desc: 'Direct Online' },
                    { id: 'star_delta', label: 'Star-Delta (2.2×)', desc: 'Y-Δ Transition' },
                    { id: 'soft_starter', label: 'Soft Starter (1.8×)', desc: 'Thyristor Ramp' },
                    { id: 'vfd', label: 'VFD (1.2×)', desc: 'Inverter Drive' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setStartingMethod(m.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                        startingMethod === m.id
                          ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400'
                          : 'bg-zinc-50 dark:bg-zinc-800/70 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      <span className="block text-xs font-bold">{m.label}</span>
                      <span className="block text-[10px] text-zinc-400">{m.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                Motor Feeder Engineering Breakdown
              </h4>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between p-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                  <span className="text-zinc-500">Full Load Amps (FLA):</span>
                  <strong className="font-mono text-zinc-900 dark:text-white">{motorAnalysis.motorFla.toFixed(1)} A</strong>
                </div>

                <div className="flex justify-between p-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                  <span className="text-zinc-500">125% NEC Sizing Ampacity:</span>
                  <strong className="font-mono text-amber-600 dark:text-amber-400">{motorAnalysis.continuousDutyAmps.toFixed(1)} A</strong>
                </div>

                <div className="flex justify-between p-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                  <span className="text-zinc-500">Starting Peak Inrush Current:</span>
                  <strong className="font-mono text-red-600 dark:text-red-400">{motorAnalysis.startingInrushAmps.toFixed(1)} A</strong>
                </div>

                <div className="flex justify-between p-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                  <span className="text-zinc-500">MPCB / Overload Relay Setting:</span>
                  <strong className="font-mono text-indigo-600 dark:text-indigo-400">{motorAnalysis.mpcbTripRange}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 4: Parallel Multi-Runs */}
      {activeMode === 'parallel_runs' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-500" />
                  Parallel Multi-Run Cable Sizer
                </h3>
              </div>

              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                When single heavy cables ({'>'} 240 mm²) are difficult to pull or terminate, split current across multiple parallel runs per phase.
              </p>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Number of Parallel Cables Per Phase
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[2, 3, 4, 5].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setParallelRunsCount(count)}
                      className={`py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                        parallelRunsCount === count
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      {count} Parallel Runs
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 rounded-xl text-xs text-amber-800 dark:text-amber-300 space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" /> Parallel Installation Requirements:
                </span>
                <p>1. Cables in parallel must be of exact identical length, material, cross-section, and insulation.</p>
                <p>2. Arrange phases in trefoil or flat formation with transposed phasing to maintain symmetric mutual inductance.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                Parallel Configuration Summary
              </h4>

              <div className="text-center py-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                <span className="block text-[10px] font-bold text-zinc-400">OPTIMAL PARALLEL SPECIFICATION</span>
                <span className="text-2xl font-black text-zinc-900 dark:text-white font-mono">
                  {parallelAnalysis.runs} × ({parallelAnalysis.parallelSize} mm²)
                </span>
                <span className="block text-xs text-amber-600 dark:text-amber-400 font-semibold mt-1">
                  Per Phase ({parallelAnalysis.runs * (phase === '3phase' ? 3 : 2)} total single-core cables)
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                  <span className="text-zinc-500">Total Load Current:</span>
                  <strong className="font-mono text-zinc-900 dark:text-white">{calculatedLoadCurrent.toFixed(1)} A</strong>
                </div>
                <div className="flex justify-between p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                  <span className="text-zinc-500">Current Share Per Cable:</span>
                  <strong className="font-mono text-emerald-600 dark:text-emerald-400">{parallelAnalysis.currentPerRun.toFixed(1)} A</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 5: Lifecycle Economics */}
      {activeMode === 'lifecycle_economics' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-amber-500" />
                  Conductor Power Loss & Lifecycle Economics (I²R)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Electricity Cost / kWh
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    step="0.5"
                    value={electricityRatePerKwh}
                    onChange={(e) => setElectricityRatePerKwh(Math.max(0.1, parseFloat(e.target.value) || 8))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Operating Hours / Day
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={operatingHoursPerDay}
                    onChange={(e) => setOperatingHoursPerDay(Math.min(24, Math.max(1, parseInt(e.target.value) || 12)))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Evaluation Horizon (Years)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={yearsLifespan}
                    onChange={(e) => setYearsLifespan(Math.max(1, parseInt(e.target.value) || 10))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                Financial Cost of Wasted Cable Heat
              </h4>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl">
                  <span className="block text-[10px] font-bold text-zinc-400 uppercase">Annual Energy Lost</span>
                  <span className="text-base font-extrabold text-zinc-900 dark:text-white font-mono">
                    {lifecycleAnalysis.annualKwhWasted.toFixed(0)} kWh/yr
                  </span>
                </div>

                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl">
                  <span className="block text-[10px] font-bold text-zinc-400 uppercase">Annual Loss Cost</span>
                  <span className="text-base font-extrabold text-red-600 dark:text-red-400 font-mono">
                    ₹{lifecycleAnalysis.annualCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs space-y-1 text-zinc-700 dark:text-zinc-300">
                <div className="flex justify-between font-bold">
                  <span>{yearsLifespan}-Year Cumulative Loss Cost:</span>
                  <span className="font-mono text-amber-600 dark:text-amber-400">
                    ₹{lifecycleAnalysis.lifetimeCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 pt-1">
                  Investing in a single size larger conductor pays for itself in ~2 to 3 years via reduced $I^2R$ resistance heating.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

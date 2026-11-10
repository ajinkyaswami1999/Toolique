import { useState, useEffect, useMemo } from 'react';
import { 
  Info, Building2, Trash2, Plus, 
  Printer, Download, Sparkles, Sliders, ArrowRightLeft,
  MapPin, Loader2, CheckCircle2, AlertCircle, Compass,
  Layers, Shield, BookOpen, ChevronRight, HelpCircle,
  Eye, Check, Copy, ArrowUpRight, TrendingUp, Maximize2,
  Columns, Grid, ArrowDown, ArrowUp, BarChart3, Ruler,
  Building, Landmark, Coins, FileCheck
} from 'lucide-react';
import { downloadPdfReport } from '../utils/pdf';
import { CopyButton, ShareWhatsApp } from '../components/common';
import { INDIAN_STATES_FSI_DATA, type CityZoneRegulation } from '../data/indiaFsiRegulations';
import { detectUserIndianLocation } from '../utils/indianLocationFsiResolver';

// --- Interfaces ---
type UnitType = 'sqft' | 'sqm' | 'sqyd' | 'acre' | 'hectare' | 'cent' | 'guntha' | 'bigha';
type BuildingType = 'residential' | 'commercial' | 'mixed_use' | 'industrial' | 'institutional';
type ReverseMode = 'max_builtup' | 'required_plot' | 'calculate_fsi' | 'calculate_coverage' | 'remaining_fsi';
type VisualTab = 'plot_plan' | 'elevation' | 'fsi_graph';
type KnowledgeTab = 'fsi_vs_far' | 'gross_vs_net' | 'fsi_exclusions' | 'road_width' | 'udcpr_stack';

interface FloorRow {
  id: string;
  name: string;
  area: number;
}

interface HistoryItem {
  id: string;
  name: string;
  plotArea: number;
  unit: UnitType;
  fsi: number;
  floorsCount: number;
  timestamp: string;
}

// Popular Quick Indian Cities
const POPULAR_CITIES = [
  { stateId: 'maharashtra', cityId: 'pune', name: 'Pune (PMC/PCMC)', fsi: 1.80, authority: 'PMC UDCPR' },
  { stateId: 'maharashtra', cityId: 'mumbai', name: 'Mumbai (BMC)', fsi: 2.50, authority: 'MCGM DCPR 2034' },
  { stateId: 'karnataka', cityId: 'bengaluru', name: 'Bengaluru', fsi: 2.25, authority: 'BBMP RMP 2031' },
  { stateId: 'delhi', cityId: 'delhi_central', name: 'Delhi NCR', fsi: 2.00, authority: 'DDA MPD 2021' },
  { stateId: 'telangana', cityId: 'hyderabad', name: 'Hyderabad', fsi: 3.50, authority: 'GHMC GO 168' },
  { stateId: 'gujarat', cityId: 'ahmedabad', name: 'Ahmedabad', fsi: 2.70, authority: 'AUDA / AMC GDCR' },
  { stateId: 'tamil_nadu', cityId: 'chennai', name: 'Chennai', fsi: 2.00, authority: 'CMDA CDR' },
];

export default function FARFSICalculator() {
  // 1. Calculator Modes Toggles
  const [calcMode, setCalcMode] = useState<'forward' | 'udcpr_stack' | 'reverse'>('forward');
  const [isProfessional, setIsProfessional] = useState<boolean>(true);
  const [unit, setUnit] = useState<UnitType>('sqft');
  const lengthUnit = (unit === 'sqm' || unit === 'hectare') ? 'm' : 'ft';

  // 2. Core Inputs
  const [plotArea, setPlotArea] = useState<number>(2400); // 40x60 plot
  const [permissibleFsi, setPermissibleFsi] = useState<number>(2.0);
  const [groundCoverage, setGroundCoverage] = useState<number>(50); // %
  const [avgFloorHeight, setAvgFloorHeight] = useState<number>(3.0); // meters or 10 ft
  const [roadWidth, setRoadWidth] = useState<number>(12); // meters or 40 ft
  const [plotWidth, setPlotWidth] = useState<number>(40); // ft or meters
  const [plotDepth, setPlotDepth] = useState<number>(60); // ft or meters
  const [buildingType, setBuildingType] = useState<BuildingType>('residential');
  const [devZone, setDevZone] = useState<string>('residential_zone');

  // Setbacks (Professional Mode)
  const [setbackFront, setSetbackFront] = useState<number>(10); // ft or meters
  const [setbackRear, setSetbackRear] = useState<number>(8);
  const [setbackLeft, setSetbackLeft] = useState<number>(5);
  const [setbackRight, setSetbackRight] = useState<number>(5);

  // 3. Municipal UDCPR / DCPR Stack State
  const [baseFsi, setBaseFsi] = useState<number>(1.10);
  const [enablePremiumFsi, setEnablePremiumFsi] = useState<boolean>(true);
  const [premiumFsiValue, setPremiumFsiValue] = useState<number>(0.30);
  const [readyReckonerLandRate, setReadyReckonerLandRate] = useState<number>(4500); // INR per sqft
  const [enableTdr, setEnableTdr] = useState<boolean>(true);
  const [tdrFsiValue, setTdrFsiValue] = useState<number>(0.40);
  const [enableAncillaryFungible, setEnableAncillaryFungible] = useState<boolean>(true);
  const [ancillaryPercentage, setAncillaryPercentage] = useState<number>(35); // 35% for residential, 50% for commercial
  const [isTodZone, setIsTodZone] = useState<boolean>(false); // Transit Oriented Development corridor (+0.5 FSI)

  // 4. Visual Studio & Knowledge Tabs
  const [activeVisualTab, setActiveVisualTab] = useState<VisualTab>('plot_plan');
  const [activeKnowledgeTab, setActiveKnowledgeTab] = useState<KnowledgeTab>('fsi_vs_far');
  const [showKnowledgeModal, setShowKnowledgeModal] = useState<boolean>(false);

  // 5. Floor Area Planner List
  const [plannedFloors, setPlannedFloors] = useState<FloorRow[]>([
    { id: '1', name: 'Ground Floor (Parking/Lobby)', area: 1000 },
    { id: '2', name: 'First Floor', area: 1200 },
    { id: '3', name: 'Second Floor', area: 1200 },
    { id: '4', name: 'Third Floor', area: 1200 }
  ]);
  const numFloors = plannedFloors.length;

  // 6. Reverse Calculator Inputs
  const [revMode, setRevMode] = useState<ReverseMode>('max_builtup');
  const [revDesiredFloorArea, setRevDesiredFloorArea] = useState<string>('4800');
  const [revPlotArea, setRevPlotArea] = useState<string>('2400');
  const [revFsi, setRevFsi] = useState<string>('2.0');
  const [revFootprint, setRevFootprint] = useState<string>('1200');
  const [revPlannedArea, setRevPlannedArea] = useState<string>('3600');

  // 7. Scenario Comparison Inputs
  const [enableComparison, setEnableComparison] = useState<boolean>(false);
  const [compFsiA, setCompFsiA] = useState<string>('1.5');
  const [compFsiB, setCompFsiB] = useState<string>('2.0');
  const [compFsiC, setCompFsiC] = useState<string>('2.5');

  // 8. Location Presets State
  const [statePreset, setStatePreset] = useState<string>('maharashtra');
  const [cityPreset, setCityPreset] = useState<string>('pune');
  const [zonePreset, setZonePreset] = useState<string>('residential');
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);
  const [locationMessage, setLocationMessage] = useState<{
    type: 'success' | 'error';
    text: string;
    details?: string;
  } | null>(null);

  // Location Detector
  const handleDetectLocation = async (autoApply: boolean = true) => {
    setIsDetectingLocation(true);
    setLocationMessage(null);
    try {
      const res = await detectUserIndianLocation();
      setStatePreset(res.stateId);
      setCityPreset(res.cityId);

      const stateObj = INDIAN_STATES_FSI_DATA.find(s => s.id === res.stateId);
      const cityObj = stateObj?.cities.find(c => c.id === res.cityId);
      let appliedFsiText = '';
      if (cityObj?.zones && autoApply) {
        const z = cityObj.zones as Record<string, CityZoneRegulation | undefined>;
        const reg = z[zonePreset] || z['residential'];
        if (reg) {
          setPermissibleFsi(reg.fsi);
          setBaseFsi(Number((reg.fsi * 0.6).toFixed(2)));
          appliedFsiText = ` • Auto-applied FSI: ${reg.fsi}`;
        }
      }

      setLocationMessage({
        type: 'success',
        text: `Detected: ${res.cityName}, ${res.stateName}${appliedFsiText}`,
        details: res.distanceKm > 0 
          ? `~${res.distanceKm} km away • Coordinates (${res.latitude.toFixed(2)}°, ${res.longitude.toFixed(2)}°)` 
          : 'Exact administrative match'
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unable to detect location. Please select manually.';
      setLocationMessage({
        type: 'error',
        text: errorMsg
      });
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const selectedState = useMemo(() => {
    return INDIAN_STATES_FSI_DATA.find(s => s.id === statePreset) || INDIAN_STATES_FSI_DATA[0];
  }, [statePreset]);

  const selectedCity = useMemo(() => {
    return selectedState.cities.find(c => c.id === cityPreset) || selectedState.cities[0];
  }, [selectedState, cityPreset]);

  const activePreset: CityZoneRegulation | null = useMemo(() => {
    if (!selectedCity || !selectedCity.zones) return null;
    const z = selectedCity.zones as Record<string, CityZoneRegulation | undefined>;
    return z[zonePreset] || z['residential'] || null;
  }, [selectedCity, zonePreset]);

  const availableZones = useMemo(() => {
    if (!selectedCity || !selectedCity.zones) return [{ id: 'residential', label: 'Residential' }, { id: 'commercial', label: 'Commercial' }];
    const zonesList: { id: string; label: string }[] = [];
    if (selectedCity.zones.residential) zonesList.push({ id: 'residential', label: 'Residential' });
    if (selectedCity.zones.commercial) zonesList.push({ id: 'commercial', label: 'Commercial' });
    if (selectedCity.zones.mixed_use) zonesList.push({ id: 'mixed_use', label: 'Mixed Use / High-Density' });
    if (selectedCity.zones.industrial) zonesList.push({ id: 'industrial', label: 'Industrial / Tech Park' });
    return zonesList;
  }, [selectedCity]);

  // Utility states
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [newHistoryName, setNewHistoryName] = useState<string>('My Plot Plan');

  // --- Area Unit Conversion Factor (Relative to sq ft) ---
  const conversionFactors = useMemo((): Record<UnitType, number> => {
    const bighaFactor = selectedState.bighaFactor || 27225.0;
    return {
      sqft: 1.0,
      sqm: 10.7639,
      sqyd: 9.0,
      acre: 43560.0,
      hectare: 107639.1,
      cent: 435.6,
      guntha: 1089.0,
      bigha: bighaFactor
    };
  }, [selectedState]);

  // Convert current plot area when changing units
  const handleUnitSwitch = (newUnit: UnitType) => {
    if (newUnit === unit) return;
    const oldFactor = conversionFactors[unit];
    const newFactor = conversionFactors[newUnit];
    const baseSqft = plotArea * oldFactor;
    setPlotArea(Number((baseSqft / newFactor).toFixed(2)));
    setUnit(newUnit);
  };

  // Load calculation history and URL parameters on mount
  useEffect(() => {
    const cached = localStorage.getItem('toolique_far_hist');
    if (cached) {
      try {
        setHistoryList(JSON.parse(cached));
      } catch {
        // ignore parse error
      }
    }

    const params = new URLSearchParams(window.location.search);
    const urlPlotArea = params.get('plotArea');
    const urlFsi = params.get('fsi');
    const urlMode = params.get('mode');
    const urlUnit = params.get('unit');
    
    if (urlPlotArea) setPlotArea(parseFloat(urlPlotArea) || 2400);
    if (urlFsi) setPermissibleFsi(parseFloat(urlFsi) || 2.0);
    if (urlMode === 'forward' || urlMode === 'reverse' || urlMode === 'udcpr_stack') {
      setCalcMode(urlMode as 'forward' | 'reverse' | 'udcpr_stack');
    }
    if (urlUnit) setUnit(urlUnit as UnitType);
  }, []);

  // Apply FSI preset into the calculator
  const applyPreset = () => {
    if (activePreset) {
      setPermissibleFsi(activePreset.fsi);
      setBaseFsi(Number((activePreset.fsi * 0.6).toFixed(2)));
      setPremiumFsiValue(Number((activePreset.fsi * 0.2).toFixed(2)));
      setTdrFsiValue(Number((activePreset.fsi * 0.2).toFixed(2)));
    }
  };

  const handleQuickCitySelect = (city: typeof POPULAR_CITIES[0]) => {
    setStatePreset(city.stateId);
    setCityPreset(city.cityId);
    setPermissibleFsi(city.fsi);
    setBaseFsi(Number((city.fsi * 0.6).toFixed(2)));
    setPremiumFsiValue(Number((city.fsi * 0.2).toFixed(2)));
    setTdrFsiValue(Number((city.fsi * 0.2).toFixed(2)));
  };

  // --- Dynamic Core Calculations ---
  const calculations = useMemo(() => {
    const areaFactor = conversionFactors[unit];
    const plotAreaSqft = plotArea * areaFactor;

    // Road width restrictions & Height Check (Model Building Bye-laws 2016)
    // Hmax = 1.5 * (Road Width + Front Setback)
    const isMetric = unit === 'sqm' || unit === 'hectare';
    const roadWidthMeters = isMetric ? roadWidth : roadWidth * 0.3048;
    const frontSetbackMeters = isMetric ? setbackFront : setbackFront * 0.3048;
    const maxPermissibleHeightMeters = Number((1.5 * (roadWidthMeters + frontSetbackMeters)).toFixed(1));
    const maxPermissibleHeightFeet = Number((maxPermissibleHeightMeters * 3.28084).toFixed(1));

    // Road width tiered FSI ceiling guidelines (UDCPR standard benchmarks)
    let roadWidthFsiCeiling = 1.10;
    let roadWidthAdvisory = 'Road < 9.0m: Standard Base FSI only (No TDR or Premium FSI allowed)';
    if (roadWidthMeters >= 30.0) {
      roadWidthFsiCeiling = 3.50;
      roadWidthAdvisory = 'Road ≥ 30m: High-density transit corridor (Maximum FSI & TOD incentives enabled)';
    } else if (roadWidthMeters >= 24.0) {
      roadWidthFsiCeiling = 3.00;
      roadWidthAdvisory = 'Road 24m–30m: Full TDR loading + Premium FSI allowed';
    } else if (roadWidthMeters >= 18.0) {
      roadWidthFsiCeiling = 2.50;
      roadWidthAdvisory = 'Road 18m–24m: Commercial and high-rise apartment clearance tier';
    } else if (roadWidthMeters >= 12.0) {
      roadWidthFsiCeiling = 2.20;
      roadWidthAdvisory = 'Road 12m–18m: Standard urban arterial road with moderate TDR potential';
    } else if (roadWidthMeters >= 9.0) {
      roadWidthFsiCeiling = 1.80;
      roadWidthAdvisory = 'Road 9m–12m: Base FSI + Limited Premium FSI allowed';
    }

    // Footprint constraints under setbacks
    let setbackReductionFactor = 1.0;
    let setbackLimitAreaSqft = Infinity;
    let netBuildableWidth = plotWidth;
    let netBuildableDepth = plotDepth;

    if (isProfessional && plotWidth > 0 && plotDepth > 0) {
      netBuildableWidth = Math.max(0, plotWidth - setbackLeft - setbackRight);
      netBuildableDepth = Math.max(0, plotDepth - setbackFront - setbackRear);
      const buildableAreaRect = netBuildableWidth * netBuildableDepth;
      const nominalArea = plotWidth * plotDepth;
      if (nominalArea > 0) {
        setbackReductionFactor = buildableAreaRect / nominalArea;
      }
      setbackLimitAreaSqft = isMetric ? (buildableAreaRect * conversionFactors['sqm']) : buildableAreaRect;
    }

    // Built-up capacities
    let effectivePermissibleFsi = permissibleFsi;

    // If in UDCPR Municipal Stack Mode, recalculate permissible FSI from stack components
    let totalStackFsi = baseFsi;
    let premiumFsiAreaSqft = 0;
    let premiumFsiCostInr = 0;
    let tdrFsiAreaSqft = 0;
    let ancillaryFsiAreaSqft = 0;
    let totalGrossConstructionSqft = 0;

    if (calcMode === 'udcpr_stack') {
      let stackSum = baseFsi;
      if (enablePremiumFsi) {
        stackSum += premiumFsiValue;
        premiumFsiAreaSqft = plotAreaSqft * premiumFsiValue;
        // Premium FSI cost in Maharashtra/UDCPR is typically 35% of land Ready Reckoner rate
        premiumFsiCostInr = premiumFsiAreaSqft * (readyReckonerLandRate * 0.35);
      }
      if (enableTdr) {
        stackSum += tdrFsiValue;
        tdrFsiAreaSqft = plotAreaSqft * tdrFsiValue;
      }
      if (isTodZone) {
        stackSum += 0.50; // Transit oriented bonus
      }
      totalStackFsi = Number(stackSum.toFixed(2));
      effectivePermissibleFsi = totalStackFsi;

      // Ancillary/Fungible FSI (e.g. 35% on permissible BUA)
      const basePermissibleBua = plotAreaSqft * effectivePermissibleFsi;
      if (enableAncillaryFungible) {
        ancillaryFsiAreaSqft = basePermissibleBua * (ancillaryPercentage / 100);
        totalGrossConstructionSqft = basePermissibleBua + ancillaryFsiAreaSqft;
      } else {
        totalGrossConstructionSqft = basePermissibleBua;
      }
    }

    const permissibleBuiltUpSqft = plotAreaSqft * effectivePermissibleFsi;
    const maxGroundFootprintSqft = isProfessional && plotWidth > 0 && plotDepth > 0
      ? Math.min(plotAreaSqft * (groundCoverage / 100), setbackLimitAreaSqft)
      : plotAreaSqft * (groundCoverage / 100);

    // Dynamic Floor Area Planner Math
    const totalPlannedBuiltUpSqft = plannedFloors.reduce((sum, f) => sum + (f.area || 0), 0) * (unit === 'sqft' ? 1 : areaFactor);
    const utilizedFsi = plotAreaSqft > 0 ? (totalPlannedBuiltUpSqft / plotAreaSqft) : 0;
    const remainingBuiltUpSqft = permissibleBuiltUpSqft - totalPlannedBuiltUpSqft;
    const fsiUtilizationPercentage = permissibleBuiltUpSqft > 0 ? (totalPlannedBuiltUpSqft / permissibleBuiltUpSqft) * 100 : 0;

    // Building Height Check (based on planned floors)
    const floorHeightMeters = isMetric ? avgFloorHeight : avgFloorHeight * 0.3048;
    const totalProposedHeightMeters = Number((plannedFloors.length * floorHeightMeters).toFixed(1));
    const totalProposedHeightFeet = Number((totalProposedHeightMeters * 3.28084).toFixed(1));
    const isHeightCompliant = totalProposedHeightMeters <= maxPermissibleHeightMeters;

    // Status indicators
    let statusLabel = 'Compliant (Safe)';
    let statusColor = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (fsiUtilizationPercentage > 100) {
      statusLabel = 'Exceeds Statutory Ceiling';
      statusColor = 'text-rose-500 bg-rose-500/10 border-rose-500/20';
    } else if (fsiUtilizationPercentage >= 90) {
      statusLabel = 'Near Threshold (Optimal)';
      statusColor = 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    } else if (fsiUtilizationPercentage >= 50) {
      statusLabel = 'Balanced Utilization';
      statusColor = 'text-indigo-600 bg-indigo-500/10 border-indigo-500/20';
    } else {
      statusLabel = 'Under-Utilized Capacity';
      statusColor = 'text-sky-500 bg-sky-500/10 border-sky-500/20';
    }

    return {
      permissibleBuiltUp: permissibleBuiltUpSqft / areaFactor,
      maxGroundFootprint: maxGroundFootprintSqft / areaFactor,
      totalPlannedBuiltUp: totalPlannedBuiltUpSqft / areaFactor,
      utilizedFsi: Number(utilizedFsi.toFixed(3)),
      remainingBuiltUp: remainingBuiltUpSqft / areaFactor,
      fsiUtilizationPercentage: Number(fsiUtilizationPercentage.toFixed(1)),
      effectivePermissibleFsi,
      setbackReductionFactor,
      netBuildableWidth,
      netBuildableDepth,
      roadWidthMeters,
      roadWidthFsiCeiling,
      roadWidthAdvisory,
      maxPermissibleHeightMeters,
      maxPermissibleHeightFeet,
      totalProposedHeightMeters,
      totalProposedHeightFeet,
      isHeightCompliant,
      totalStackFsi,
      premiumFsiArea: premiumFsiAreaSqft / areaFactor,
      premiumFsiCostInr,
      tdrFsiArea: tdrFsiAreaSqft / areaFactor,
      ancillaryFsiArea: ancillaryFsiAreaSqft / areaFactor,
      totalGrossConstruction: totalGrossConstructionSqft / areaFactor,
      statusLabel,
      statusColor
    };
  }, [
    plotArea,
    permissibleFsi,
    groundCoverage,
    plannedFloors,
    unit,
    isProfessional,
    plotWidth,
    plotDepth,
    setbackFront,
    setbackRear,
    setbackLeft,
    setbackRight,
    conversionFactors,
    roadWidth,
    avgFloorHeight,
    calcMode,
    baseFsi,
    enablePremiumFsi,
    premiumFsiValue,
    readyReckonerLandRate,
    enableTdr,
    tdrFsiValue,
    enableAncillaryFungible,
    ancillaryPercentage,
    isTodZone
  ]);

  // --- Dynamic Floor Management ---
  const addFloor = () => {
    const nextIdx = plannedFloors.length + 1;
    let name = `${nextIdx}th Floor`;
    if (nextIdx === 1) name = 'Ground Floor';
    else if (nextIdx === 2) name = 'First Floor';
    else if (nextIdx === 3) name = 'Second Floor';
    else if (nextIdx === 4) name = 'Third Floor';

    const defaultArea = plannedFloors.length > 0 ? plannedFloors[plannedFloors.length - 1].area : 1000;
    const newFloor: FloorRow = {
      id: Date.now().toString(),
      name,
      area: defaultArea
    };
    setPlannedFloors([...plannedFloors, newFloor]);
  };

  const removeFloor = (id: string) => {
    setPlannedFloors(plannedFloors.filter(f => f.id !== id));
  };

  const updateFloorArea = (id: string, val: number) => {
    setPlannedFloors(plannedFloors.map(f => f.id === id ? { ...f, area: val } : f));
  };

  const handleFloorsCountChange = (val: number) => {
    const target = Math.max(1, Math.min(30, val));
    if (target > plannedFloors.length) {
      const added: FloorRow[] = [];
      const defaultArea = plannedFloors.length > 0 ? plannedFloors[plannedFloors.length - 1].area : 1000;
      for (let i = plannedFloors.length + 1; i <= target; i++) {
        let name = `${i}th Floor`;
        if (i === 1) name = 'Ground Floor';
        else if (i === 2) name = 'First Floor';
        else if (i === 3) name = 'Second Floor';
        else if (i === 4) name = 'Third Floor';
        added.push({ id: `floor_${Date.now()}_${i}`, name, area: defaultArea });
      }
      setPlannedFloors([...plannedFloors, ...added]);
    } else if (target < plannedFloors.length) {
      setPlannedFloors(plannedFloors.slice(0, target));
    }
  };

  // --- Reverse Planner calculations ---
  const reverseCalculations = useMemo(() => {
    const fArea = parseFloat(revDesiredFloorArea) || 4000;
    const pArea = parseFloat(revPlotArea) || 2000;
    const fsiVal = parseFloat(revFsi) || 2.0;
    const footprint = parseFloat(revFootprint) || 1000;
    const plannedArea = parseFloat(revPlannedArea) || 3000;

    return {
      maxPermissibleArea: pArea * fsiVal,
      requiredPlotArea: fsiVal > 0 ? (fArea / fsiVal) : 0,
      actualFsi: pArea > 0 ? (plannedArea / pArea) : 0,
      actualGroundCoverage: pArea > 0 ? (footprint / pArea) * 100 : 0,
      remainingFsi: pArea > 0 ? Math.max(0, fsiVal - (plannedArea / pArea)) : 0,
      remainingBuiltUpArea: Math.max(0, (pArea * fsiVal) - plannedArea)
    };
  }, [revDesiredFloorArea, revPlotArea, revFsi, revFootprint, revPlannedArea]);

  // --- Multi Scenario comparisons ---
  const comparisonResults = useMemo(() => {
    const basePlot = plotArea;
    const fsiA = parseFloat(compFsiA) || 1.5;
    const fsiB = parseFloat(compFsiB) || 2.0;
    const fsiC = parseFloat(compFsiC) || 2.5;

    const computeOutputs = (fsiVal: number) => {
      const maxBuiltUp = basePlot * fsiVal;
      const footprint = basePlot * (groundCoverage / 100);
      const estFloors = Math.ceil(maxBuiltUp / footprint);
      return {
        maxBuiltUp: Math.round(maxBuiltUp),
        footprint: Math.round(footprint),
        estFloors
      };
    };

    return {
      scenarioA: computeOutputs(fsiA),
      scenarioB: computeOutputs(fsiB),
      scenarioC: computeOutputs(fsiC)
    };
  }, [plotArea, groundCoverage, compFsiA, compFsiB, compFsiC]);

  // --- History Management ---
  const saveCalculationToHistory = () => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      name: newHistoryName,
      plotArea,
      unit,
      fsi: calculations.effectivePermissibleFsi,
      floorsCount: plannedFloors.length,
      timestamp: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
    };

    const updated = [newItem, ...historyList].slice(0, 10);
    setHistoryList(updated);
    localStorage.setItem('toolique_far_hist', JSON.stringify(updated));
    setNewHistoryName('My Plot Plan');
  };

  const deleteHistoryItem = (id: string) => {
    const updated = historyList.filter(h => h.id !== id);
    setHistoryList(updated);
    localStorage.setItem('toolique_far_hist', JSON.stringify(updated));
  };

  // --- Copy, PDF, and Print actions ---
  const getResultsText = () => {
    const unitLabel = unit === 'sqft' ? 'sq ft' : 'sq m';
    return `FAR / FSI Statutory Planning Audit (Toolique.in)
--------------------------------------------------
Location / Authority : ${selectedCity.name}, ${selectedState.name} (${activePreset?.authority || 'Municipal Body'})
Plot Area            : ${plotArea.toLocaleString()} ${unitLabel}
Permissible FSI/FAR  : ${calculations.effectivePermissibleFsi} (${calculations.effectivePermissibleFsi * 100}% FAR)
Ground Coverage Limit: ${groundCoverage}% (Max: ${calculations.maxGroundFootprint.toFixed(1)} ${unitLabel})
Road Width           : ${roadWidth} ${lengthUnit} (Max Height: ${calculations.maxPermissibleHeightMeters}m / ${calculations.maxPermissibleHeightFeet}ft)
--------------------------------------------------
Proposed Floors      : ${plannedFloors.length} Levels
Proposed Building Ht : ${calculations.totalProposedHeightMeters}m (${calculations.isHeightCompliant ? 'Compliant' : 'Exceeds Road Limit'})
Max Permissible BUA  : ${calculations.permissibleBuiltUp.toFixed(1)} ${unitLabel}
Planned Built-up Area: ${calculations.totalPlannedBuiltUp.toFixed(1)} ${unitLabel}
Utilized FSI/FAR     : ${calculations.utilizedFsi} (${calculations.fsiUtilizationPercentage}% Consumed)
Remaining Capacity   : ${calculations.remainingBuiltUp.toFixed(1)} ${unitLabel}
--------------------------------------------------
Status Compliance    : ${calculations.statusLabel}`;
  };

  const exportCSV = () => {
    const headers = ['Floor Level', `Planned Area (${unit})`, `Coverage % of Plot`];
    const rows = plannedFloors.map(f => [
      f.name, 
      f.area, 
      plotArea > 0 ? ((f.area / plotArea) * 100).toFixed(1) : 0
    ]);
    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `FSI_FloorSchedule_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // Standardized Branded PDF Audit Report (Pillar 2)
  const handleDownloadPDF = () => {
    const floorRows = plannedFloors.map((f, i) => ({
      level: f.name || `Floor ${i + 1}`,
      planned: `${f.area} ${unit}`,
      coverage: `${plotArea > 0 ? ((f.area / plotArea) * 100).toFixed(1) : 0}%`
    }));

    const summaryRows = [
      { metric: 'Plot Area (Cadastral)', value: `${plotArea} ${unit}`, note: 'Net Buildable Area' },
      { metric: 'Statutory Permissible FSI', value: `${calculations.effectivePermissibleFsi}`, note: activePreset?.doc || 'Municipal Master Plan' },
      { metric: 'Maximum Permissible BUA', value: `${calculations.permissibleBuiltUp.toFixed(1)} ${unit}`, note: 'Statutory Zoning Cap' },
      { metric: 'Ground Coverage Footprint', value: `${groundCoverage}% (${calculations.maxGroundFootprint.toFixed(1)} ${unit})`, note: 'Ground Slab Boundary' },
      { metric: 'Front Road Width', value: `${roadWidth} ${lengthUnit}`, note: `Max Height: ${calculations.maxPermissibleHeightMeters}m` },
      { metric: 'Proposed Floors & Height', value: `${plannedFloors.length} Floors (${calculations.totalProposedHeightMeters}m)`, note: calculations.isHeightCompliant ? 'Within Road Height Limit' : 'Exceeds Road Ratio' },
      { metric: 'Total Proposed Built-Up Area', value: `${calculations.totalPlannedBuiltUp.toFixed(1)} ${unit}`, note: `${calculations.fsiUtilizationPercentage}% Consumed` },
      { metric: 'Remaining FSI Balance', value: `${calculations.remainingBuiltUp.toFixed(1)} ${unit}`, note: calculations.remainingBuiltUp >= 0 ? 'Within By-laws' : 'Exceeds Permissible Limit' },
    ];

    downloadPdfReport({
      title: 'FAR / FSI Statutory Clearance & Development Audit',
      subtitle: `Plot: ${plotArea} ${unit} | Permissible FSI: ${calculations.effectivePermissibleFsi} | Location: ${selectedCity.name}, ${selectedState.name}`,
      category: 'civil',
      complianceBadge: 'NBC 2016 & State UDCPR / DCPR',
      referenceId: `FSI-${Date.now().toString().slice(-6)}`,
      theme: 'brand',
      project: {
        projectName: `${selectedCity.name} Zoning & FSI Clearance Analysis`,
        notes: `Building Type: ${buildingType.toUpperCase()} | Authority: ${activePreset?.authority || 'Town Planning Authority'} | Status: ${calculations.statusLabel}`
      },
      kpis: [
        { label: 'Max Permissible Area', value: `${calculations.permissibleBuiltUp.toFixed(1)} ${unit}`, highlight: true },
        { label: 'Proposed Built-Up', value: `${calculations.totalPlannedBuiltUp.toFixed(1)} ${unit}` },
        { label: 'FSI Utilization', value: `${calculations.fsiUtilizationPercentage}%` },
        { label: 'Remaining Capacity', value: `${calculations.remainingBuiltUp.toFixed(1)} ${unit}`, highlight: calculations.remainingBuiltUp < 0 }
      ],
      parameters: [
        { label: 'Plot Area', value: `${plotArea} ${unit}` },
        { label: 'Permissible FSI Limit', value: `${calculations.effectivePermissibleFsi}` },
        { label: 'Ground Coverage Limit', value: `${groundCoverage}%` },
        { label: 'Building Classification', value: buildingType.toUpperCase() },
        { label: 'Front Road Width', value: `${roadWidth} ${lengthUnit}` },
        { label: 'Front / Rear Setbacks', value: `${setbackFront} ${lengthUnit} / ${setbackRear} ${lengthUnit}` },
      ],
      tables: [
        {
          title: '1. Development Potential & FSI Clearance Audit',
          columns: [
            { header: 'Metric', dataKey: 'metric' },
            { header: 'Value', dataKey: 'value', align: 'right' as const },
            { header: 'Regulatory Reference', dataKey: 'note' }
          ],
          rows: summaryRows
        },
        ...(floorRows.length > 0 ? [{
          title: '2. Floor-by-Floor Construction Schedule',
          columns: [
            { header: 'Level', dataKey: 'level' },
            { header: 'Planned Area', dataKey: 'planned', align: 'right' as const },
            { header: 'Footprint Ratio', dataKey: 'coverage' }
          ],
          rows: floorRows
        }] : [])
      ],
      disclaimers: [
        'FAR / FSI calculations adhere to Model Building Bye-Laws 2016 and local town planning authority master plans (UDCPR / DCPR 2034).',
        'Permissible ground coverage, road width multipliers, and premium/purchasable TDR FSI are subject to municipal verification.',
        'Basement, parking podiums, and service shafts may be exempt under specific state development control regulations.'
      ],
      includeSignoff: true,
      fileName: `FAR_FSI_Audit_Report_${Date.now()}.pdf`
    });
  };

  const getShareLink = () => {
    const params = new URLSearchParams();
    params.set('plotArea', plotArea.toString());
    params.set('fsi', permissibleFsi.toString());
    params.set('mode', calcMode);
    params.set('unit', unit);
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto text-left">
      
      {/* =========================================================================
          MUNICIPAL CODEBOOK & STATUTORY CITY PRESET RIBBON (No duplicate H1/H2)
          ========================================================================= */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-lg border border-indigo-500/20 space-y-3">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 shrink-0">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-white tracking-wide">
                  Active Regulations: <span className="text-indigo-300 font-extrabold">{selectedCity.name}</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-mono font-black uppercase">
                  {activePreset?.doc || 'UDCPR 2020 / NBC 2016'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-[10px] font-mono font-bold">
                  Baseline FSI: {activePreset?.fsi || permissibleFsi}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium mt-0.5">
                Authority: {activePreset?.authority || 'Town Planning Department'} • Verified: {activePreset?.verified || '2026'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto justify-end shrink-0">
            <button
              type="button"
              onClick={() => handleDetectLocation(true)}
              disabled={isDetectingLocation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-60"
              title="Auto-detect current city and load statutory FSI regulations"
            >
              {isDetectingLocation ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <MapPin className="w-3.5 h-3.5 text-amber-300" />
              )}
              <span>{isDetectingLocation ? 'Detecting...' : 'Detect My City'}</span>
            </button>
            <CopyButton text={getShareLink} label="Share" copiedLabel="Copied" size="xs" variant="secondary" />
          </div>
        </div>

        {/* Quick Popular City Selector Pills */}
        <div className="pt-2 border-t border-indigo-500/20 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider mr-1">
            Quick Cities:
          </span>
          {POPULAR_CITIES.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => handleQuickCitySelect(c)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer border ${
                cityPreset === c.cityId 
                  ? 'bg-indigo-500 text-white border-indigo-400 shadow-xs' 
                  : 'bg-white/5 hover:bg-white/10 text-indigo-200 border-white/10'
              }`}
            >
              {c.name} (FSI {c.fsi})
            </button>
          ))}
        </div>

        {/* Location Detection Alert Notification */}
        {locationMessage && (
          <div className={`p-3 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all ${
            locationMessage.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
          }`}>
            <div className="flex items-center gap-2">
              {locationMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <div>
                <span className="font-bold">{locationMessage.text}</span>
                {locationMessage.details && (
                  <span className="text-[11px] opacity-85 ml-2 block sm:inline">({locationMessage.details})</span>
                )}
              </div>
            </div>
            {locationMessage.type === 'success' && activePreset && (
              <button
                type="button"
                onClick={applyPreset}
                className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] rounded-xl transition shrink-0 cursor-pointer shadow-xs self-start sm:self-auto"
              >
                Apply Regulation FSI ({activePreset.fsi})
              </button>
            )}
          </div>
        )}
      </div>

      {/* =========================================================================
          MODE SELECTOR BAR (Forward vs UDCPR Stack vs Reverse)
          ========================================================================= */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCalcMode('forward')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              calcMode === 'forward' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-650 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>1. Standard Forward Planner</span>
          </button>
          <button
            onClick={() => setCalcMode('udcpr_stack')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              calcMode === 'udcpr_stack' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-650 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-300" />
            <span>2. Municipal UDCPR / DCPR Stack</span>
          </button>
          <button
            onClick={() => setCalcMode('reverse')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              calcMode === 'reverse' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-650 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>3. Reverse Plot / FSI Solver</span>
          </button>
        </div>

        {/* Knowledge Guide Toggle Pill */}
        <button
          onClick={() => setShowKnowledgeModal(!showKnowledgeModal)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold transition cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-500" />
          <span>FSI Rules & Knowledge Base</span>
        </button>
      </div>

      {/* =========================================================================
          INTERACTIVE KNOWLEDGE HUB (Explainers, Definitions & Bylaws)
          ========================================================================= */}
      {showKnowledgeModal && (
        <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-amber-500/30 shadow-lg space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="font-black text-zinc-900 dark:text-white text-sm">
                Indian Architectural FSI Masterclass & Statutory Rules
              </h3>
            </div>
            <button
              onClick={() => setShowKnowledgeModal(false)}
              className="text-xs font-bold text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              ✕ Close Guide
            </button>
          </div>

          {/* Sub-Tabs */}
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => setActiveKnowledgeTab('fsi_vs_far')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                activeKnowledgeTab === 'fsi_vs_far' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
              }`}
            >
              FSI vs FAR
            </button>
            <button
              onClick={() => setActiveKnowledgeTab('udcpr_stack')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                activeKnowledgeTab === 'udcpr_stack' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
              }`}
            >
              Base + Premium + TDR Stack
            </button>
            <button
              onClick={() => setActiveKnowledgeTab('road_width')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                activeKnowledgeTab === 'road_width' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
              }`}
            >
              Road Width Slabs
            </button>
            <button
              onClick={() => setActiveKnowledgeTab('fsi_exclusions')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                activeKnowledgeTab === 'fsi_exclusions' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
              }`}
            >
              Free of FSI (Exclusions)
            </button>
            <button
              onClick={() => setActiveKnowledgeTab('gross_vs_net')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                activeKnowledgeTab === 'gross_vs_net' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
              }`}
            >
              Gross vs Net Plot
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {activeKnowledgeTab === 'fsi_vs_far' && (
              <div className="space-y-2">
                <h4 className="font-bold text-indigo-600 dark:text-indigo-400">What is the difference between FSI and FAR?</h4>
                <p>
                  Mathematically, <strong>FSI (Floor Space Index)</strong> and <strong>FAR (Floor Area Ratio)</strong> are identical. FSI is expressed as a decimal ratio (e.g., <strong>2.0</strong> in Mumbai, Pune, Bengaluru), whereas FAR is expressed as a percentage (e.g., <strong>200%</strong> in Delhi, Noida, Haryana).
                </p>
                <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 font-mono text-[11px]">
                  FSI = Total Built-up Area across all floors / Net Plot Area<br />
                  FAR (%) = (Total Built-up Area / Net Plot Area) × 100
                </div>
              </div>
            )}

            {activeKnowledgeTab === 'udcpr_stack' && (
              <div className="space-y-2">
                <h4 className="font-bold text-indigo-600 dark:text-indigo-400">How the Indian Statutory FSI Stack Works (UDCPR / DCPR 2034)</h4>
                <p>
                  In major cities like Pune (PMC/PCMC) and Mumbai, permissible construction is NOT just a single number. It is built in 4 legal layers:
                </p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li><strong>Base FSI</strong>: Automatic statutory entitlement (typically 1.10 for residential non-congested). Free of charge.</li>
                  <li><strong>Premium FSI</strong>: Additional FSI (0.30–0.50) purchased directly from the municipal corporation at 35% of the land Ready Reckoner rate.</li>
                  <li><strong>TDR (Transferable Development Rights)</strong>: Market certificates (0.40–1.40) generated from road widening or reservations, loaded onto the plot subject to road width limits.</li>
                  <li><strong>Ancillary / Fungible FSI</strong>: A 35% bonus area granted for enclosed balconies, cupboards, and lift lobbies without consuming regular FSI.</li>
                </ol>
              </div>
            )}

            {activeKnowledgeTab === 'road_width' && (
              <div className="space-y-2">
                <h4 className="font-bold text-indigo-600 dark:text-indigo-400">Road Width Determines FSI & Building Height</h4>
                <p>
                  Under Indian urban planning bylaws (NBC 2016 & UDCPR Table 6A), road width directly dictates your maximum potential:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                  <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900">Road &lt; 9m: Max FSI 1.10 (No TDR allowed)</div>
                  <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900">Road 9m–12m: Max FSI 1.80 (Base 1.1 + Prem 0.3 + TDR 0.4)</div>
                  <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900">Road 12m–18m: Max FSI 2.20 (Base 1.1 + Prem 0.5 + TDR 0.6)</div>
                  <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900">Road ≥ 30m: Max FSI 3.00 to 3.50 (Transit Oriented TOD)</div>
                </div>
              </div>
            )}

            {activeKnowledgeTab === 'fsi_exclusions' && (
              <div className="space-y-2">
                <h4 className="font-bold text-indigo-600 dark:text-indigo-400">What is "Free of FSI" (Exempted from FSI Limits)?</h4>
                <p>
                  The following structural spaces do NOT count against your permissible FSI under most municipal codes:
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Basements dedicated exclusively to vehicular car parking or building utilities (substations, pumps).</li>
                  <li>Open-to-sky podium parking floors and stilt parking floors with minimum 2.4m clearance.</li>
                  <li>Staircase flights, lift shafts, fire escape towers, and mid-landing lobbies.</li>
                  <li>Refuge areas required by fire safety codes in buildings over 24 meters in height.</li>
                  <li>Rooftop solar plant structures, architectural parapet walls, and overhead water tanks.</li>
                </ul>
              </div>
            )}

            {activeKnowledgeTab === 'gross_vs_net' && (
              <div className="space-y-2">
                <h4 className="font-bold text-indigo-600 dark:text-indigo-400">Gross Plot Area vs Net Plot Area</h4>
                <p>
                  FSI calculations are legally performed on the <strong>Net Plot Area</strong>. If a portion of your land falls under municipal Development Plan (DP) road widening or public amenity reservation, that surrendered land area is deducted from the gross plot. The municipality issues <strong>TDR Certificates (FSI Credit)</strong> in exchange for the surrendered land, which can be loaded back on the remaining plot.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MAIN INTERACTIVE WORKSPACE (Two-Column Layout)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* =======================================================================
            LEFT COLUMN: CALCULATOR INPUT CONTROLS
            ======================================================================= */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* 1. FORWARD CALCULATION MODE */}
          {calcMode === 'forward' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-5">
              <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-800 pb-3">
                <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span>Forward Plot Parameters</span>
                </h3>
                
                <label className="flex items-center gap-1 text-[11px] font-bold text-zinc-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isProfessional}
                    onChange={(e) => setIsProfessional(e.target.checked)}
                    className="rounded border-zinc-300 text-indigo-600"
                  />
                  <span>CAD Setbacks</span>
                </label>
              </div>

              {/* Plot area field & unit selector */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block">Plot Area</label>
                  <select
                    value={unit}
                    onChange={(e) => handleUnitSwitch(e.target.value as UnitType)}
                    className="p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 text-[10px] font-bold bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                  >
                    <option value="sqft">Sq. Feet (sq ft)</option>
                    <option value="sqm">Sq. Meters (sq m)</option>
                    <option value="sqyd">Sq. Yards (Gaj)</option>
                    <option value="acre">Acres</option>
                    <option value="hectare">Hectares</option>
                    <option value="cent">Cents (South India)</option>
                    <option value="guntha">Gunthas (MH/KA)</option>
                    <option value="bigha">Bigha</option>
                  </select>
                </div>
                <input
                  type="number"
                  value={plotArea}
                  onChange={(e) => setPlotArea(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 font-mono text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Permissible FSI Index Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Permissible FSI Index</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="0.05"
                      value={permissibleFsi}
                      onChange={(e) => setPermissibleFsi(Math.max(0.1, parseFloat(e.target.value) || 0))}
                      className="w-20 px-2 py-1 text-right text-xs font-bold border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 rounded-lg font-mono"
                    />
                    <span className="text-[11px] text-zinc-400 font-bold">({permissibleFsi * 100}% FAR)</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="5.0"
                  step="0.05"
                  value={permissibleFsi}
                  onChange={(e) => setPermissibleFsi(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Ground Coverage % */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Ground Coverage Limit (%)</label>
                  <span className="font-mono text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    {groundCoverage}% ({Math.round(calculations.maxGroundFootprint)} {unit})
                  </span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="100"
                  step="5"
                  value={groundCoverage}
                  onChange={(e) => setGroundCoverage(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Road Width Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">
                    Front Road Width ({lengthUnit})
                  </label>
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    Max Ht: {calculations.maxPermissibleHeightMeters}m ({calculations.maxPermissibleHeightFeet}ft)
                  </span>
                </div>
                <input
                  type="number"
                  value={roadWidth}
                  onChange={(e) => setRoadWidth(Math.max(1, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 font-mono text-xs font-bold"
                />
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  ℹ️ {calculations.roadWidthAdvisory}
                </p>
              </div>

              {/* Setbacks & Plot Geometry (CAD Mode) */}
              {isProfessional && (
                <div className="p-4 rounded-2xl bg-zinc-50/70 dark:bg-zinc-950/40 border border-zinc-200/80 dark:border-zinc-800/80 space-y-3 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <Ruler className="w-3.5 h-3.5" /> Plot Geometry & Setbacks ({lengthUnit})
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase text-zinc-400">Plot Width ({lengthUnit})</label>
                      <input
                        type="number"
                        value={plotWidth}
                        onChange={(e) => {
                          const val = Math.max(1, parseFloat(e.target.value) || 0);
                          setPlotWidth(val);
                          if (plotDepth > 0) setPlotArea(val * plotDepth);
                        }}
                        className="w-full px-2.5 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-mono font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase text-zinc-400">Plot Depth ({lengthUnit})</label>
                      <input
                        type="number"
                        value={plotDepth}
                        onChange={(e) => {
                          const val = Math.max(1, parseFloat(e.target.value) || 0);
                          setPlotDepth(val);
                          if (plotWidth > 0) setPlotArea(plotWidth * val);
                        }}
                        className="w-full px-2.5 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-mono font-bold"
                      />
                    </div>
                  </div>

                  {/* 4 Setback Margins */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase text-zinc-400 block">Mandatory Setbacks ({lengthUnit})</label>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="space-y-0.5">
                        <span className="text-[8px] text-zinc-400 uppercase block">Front</span>
                        <input type="number" value={setbackFront} onChange={(e) => setSetbackFront(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full p-1.5 border rounded-lg text-center text-xs font-mono font-bold" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[8px] text-zinc-400 uppercase block">Rear</span>
                        <input type="number" value={setbackRear} onChange={(e) => setSetbackRear(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full p-1.5 border rounded-lg text-center text-xs font-mono font-bold" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[8px] text-zinc-400 uppercase block">Left</span>
                        <input type="number" value={setbackLeft} onChange={(e) => setSetbackLeft(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full p-1.5 border rounded-lg text-center text-xs font-mono font-bold" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[8px] text-zinc-400 uppercase block">Right</span>
                        <input type="number" value={setbackRight} onChange={(e) => setSetbackRight(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full p-1.5 border rounded-lg text-center text-xs font-mono font-bold" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. MUNICIPAL UDCPR / DCPR STACK MODE */}
          {calcMode === 'udcpr_stack' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-5 animate-fadeIn">
              <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-800 pb-3">
                <div>
                  <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-500" />
                    <span>Municipal FSI Composition Stack</span>
                  </h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Base + Premium FSI + TDR + Fungible Ancillary Area</p>
                </div>
                <span className="font-mono font-black text-sm text-indigo-600 dark:text-indigo-400">
                  Total FSI: {calculations.totalStackFsi}
                </span>
              </div>

              {/* Layer 1: Base FSI */}
              <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-blue-500" /> 1. Statutory Base FSI (Free)
                  </span>
                  <span className="font-mono font-black text-blue-700 dark:text-blue-300">{baseFsi}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.05"
                  value={baseFsi}
                  onChange={(e) => setBaseFsi(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-blue-200 dark:bg-blue-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {/* Layer 2: Premium FSI */}
              <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/40 space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enablePremiumFsi}
                      onChange={(e) => setEnablePremiumFsi(e.target.checked)}
                      className="rounded text-purple-600"
                    />
                    <span>2. Paid Premium FSI</span>
                  </label>
                  {enablePremiumFsi && (
                    <span className="font-mono font-black text-purple-700 dark:text-purple-300">+{premiumFsiValue}</span>
                  )}
                </div>
                {enablePremiumFsi && (
                  <div className="space-y-2 pt-1 text-xs">
                    <input
                      type="range"
                      min="0.1"
                      max="0.8"
                      step="0.05"
                      value={premiumFsiValue}
                      onChange={(e) => setPremiumFsiValue(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-purple-200 dark:bg-purple-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                    <div className="flex justify-between text-[11px] text-zinc-500">
                      <span>Ready Reckoner Land Rate:</span>
                      <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300">₹{readyReckonerLandRate}/sqft</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-purple-200/80 text-[11px] flex justify-between font-mono">
                      <span>Premium FSI Fee (35% ASR):</span>
                      <span className="font-bold text-purple-700 dark:text-purple-400">
                        ₹{Math.round(calculations.premiumFsiCostInr).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Layer 3: TDR (Transferable Development Rights) */}
              <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableTdr}
                      onChange={(e) => setEnableTdr(e.target.checked)}
                      className="rounded text-amber-600"
                    />
                    <span>3. TDR Loading Potential</span>
                  </label>
                  {enableTdr && (
                    <span className="font-mono font-black text-amber-700 dark:text-amber-300">+{tdrFsiValue}</span>
                  )}
                </div>
                {enableTdr && (
                  <div className="space-y-1 pt-1 text-xs">
                    <input
                      type="range"
                      min="0.1"
                      max="1.4"
                      step="0.05"
                      value={tdrFsiValue}
                      onChange={(e) => setTdrFsiValue(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-amber-200 dark:bg-amber-800 rounded-lg appearance-none cursor-pointer accent-amber-600"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-500">
                      <span>Purchasable TDR Capacity:</span>
                      <span className="font-mono font-bold">{Math.round(calculations.tdrFsiArea).toLocaleString()} {unit}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Layer 4: Ancillary Fungible Bonus & TOD */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableAncillaryFungible}
                      onChange={(e) => setEnableAncillaryFungible(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span>4. Ancillary / Fungible FSI ({ancillaryPercentage}%)</span>
                  </label>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                    +{Math.round(calculations.ancillaryFsiArea).toLocaleString()} {unit}
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <label className="flex items-center gap-1 text-[11px] font-bold text-zinc-600 dark:text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isTodZone}
                      onChange={(e) => setIsTodZone(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span>Transit-Oriented Corridor (TOD +0.50 FSI Bonus)</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* 3. REVERSE CALCULATION MODE */}
          {calcMode === 'reverse' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-5 animate-fadeIn">
              <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-150 dark:border-zinc-800 pb-2">
                <ArrowRightLeft className="w-4 h-4 text-indigo-500" />
                <span>Reverse Planning Equation</span>
              </h3>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Target Equation</label>
                <select
                  value={revMode}
                  onChange={(e) => setRevMode(e.target.value as ReverseMode)}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                >
                  <option value="max_builtup">Mode 1 — Max Floor Area (from FSI)</option>
                  <option value="required_plot">Mode 2 — Required Plot (from desired BUA)</option>
                  <option value="calculate_fsi">Mode 3 — Calculate FSI (from plot + floors)</option>
                  <option value="calculate_coverage">Mode 4 — Ground Coverage (from footprint)</option>
                  <option value="remaining_fsi">Mode 5 — Remaining FSI (from used area)</option>
                </select>
              </div>

              {/* Variable fields stack */}
              <div className="space-y-3 pt-2">
                {(revMode === 'max_builtup' || revMode === 'calculate_fsi' || revMode === 'calculate_coverage' || revMode === 'remaining_fsi') && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 block uppercase">Plot Area ({unit})</label>
                    <input type="number" value={revPlotArea} onChange={(e) => setRevPlotArea(e.target.value)} className="w-full p-2.5 border rounded-xl font-mono text-xs font-bold focus:outline-none" />
                  </div>
                )}

                {(revMode === 'max_builtup' || revMode === 'required_plot' || revMode === 'remaining_fsi') && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 block uppercase">Permissible FSI Index</label>
                    <input type="number" value={revFsi} onChange={(e) => setRevFsi(e.target.value)} className="w-full p-2.5 border rounded-xl font-mono text-xs font-bold focus:outline-none" />
                  </div>
                )}

                {revMode === 'required_plot' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 block uppercase">Desired Floor Area ({unit})</label>
                    <input type="number" value={revDesiredFloorArea} onChange={(e) => setRevDesiredFloorArea(e.target.value)} className="w-full p-2.5 border rounded-xl font-mono text-xs font-bold focus:outline-none" />
                  </div>
                )}

                {revMode === 'calculate_coverage' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 block uppercase">Ground Footprint ({unit})</label>
                    <input type="number" value={revFootprint} onChange={(e) => setRevFootprint(e.target.value)} className="w-full p-2.5 border rounded-xl font-mono text-xs font-bold focus:outline-none" />
                  </div>
                )}

                {(revMode === 'calculate_fsi' || revMode === 'remaining_fsi') && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 block uppercase">Planned Floor Area ({unit})</label>
                    <input type="number" value={revPlannedArea} onChange={(e) => setRevPlannedArea(e.target.value)} className="w-full p-2.5 border rounded-xl font-mono text-xs font-bold focus:outline-none" />
                  </div>
                )}
              </div>

              {/* Reverse calculation results card */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex justify-between items-center">
                <div>
                  <span className="text-[9px] font-black uppercase text-indigo-500 block tracking-wider">Calculated Value</span>
                  <div className="text-base font-black text-indigo-700 dark:text-indigo-300 mt-1 font-mono">
                    {revMode === 'max_builtup' && `Max Area: ${reverseCalculations.maxPermissibleArea.toLocaleString()} ${unit}`}
                    {revMode === 'required_plot' && `Required Plot: ${Math.round(reverseCalculations.requiredPlotArea).toLocaleString()} ${unit}`}
                    {revMode === 'calculate_fsi' && `Actual FSI: ${reverseCalculations.actualFsi.toFixed(3)}`}
                    {revMode === 'calculate_coverage' && `Actual Coverage: ${reverseCalculations.actualGroundCoverage.toFixed(1)}%`}
                    {revMode === 'remaining_fsi' && `Remaining FSI: ${reverseCalculations.remainingFsi.toFixed(3)} (${Math.round(reverseCalculations.remainingBuiltUpArea).toLocaleString()} ${unit})`}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Location Presets Drawer */}
          <div className="p-5 rounded-3xl bg-zinc-50/60 dark:bg-zinc-900/20 border border-zinc-200/80 dark:border-zinc-800/80 space-y-3">
            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block">
              Administrative Zoning Presets
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <select
                value={statePreset}
                onChange={(e) => {
                  const newStateId = e.target.value;
                  setStatePreset(newStateId);
                  const sObj = INDIAN_STATES_FSI_DATA.find(s => s.id === newStateId);
                  if (sObj && sObj.cities.length > 0) {
                    setCityPreset(sObj.cities[0].id);
                  }
                }}
                className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-xs font-bold"
              >
                {INDIAN_STATES_FSI_DATA.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              <select
                value={cityPreset}
                onChange={(e) => setCityPreset(e.target.value)}
                className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-xs font-bold"
              >
                {selectedState.cities.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {activePreset && (
              <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between text-[11px]">
                <span className="text-zinc-500">{activePreset.authority}</span>
                <button
                  type="button"
                  onClick={applyPreset}
                  className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200/60 cursor-pointer"
                >
                  Set FSI {activePreset.fsi}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* =======================================================================
            RIGHT COLUMN: DASHBOARD AUDIT & 2D VISUAL CAD STUDIO
            ======================================================================= */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* CORE CLEARANCE RESULTS AUDIT CARD */}
          <div className="p-6 rounded-3xl bg-zinc-950 text-white shadow-xl space-y-6 border border-zinc-850">
            <div className="flex justify-between items-center border-b border-zinc-850 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider block">
                  Statutory Clearance Audit
                </span>
                <h3 className="text-base font-black text-white mt-0.5 flex items-center gap-2">
                  <span>Development Potential</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${calculations.statusColor}`}>
                    {calculations.statusLabel}
                  </span>
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <CopyButton text={getResultsText} label="Copy Plan" copiedLabel="Copied" size="xs" variant="secondary" />
                <ShareWhatsApp text={getResultsText} label="WhatsApp" size="xs" variant="solid" />
              </div>
            </div>

            {/* FSI Meter Utilization Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-zinc-300">
                <span>Consumed: {calculations.utilizedFsi} / {calculations.effectivePermissibleFsi} FSI</span>
                <span className="font-mono font-bold text-indigo-400">
                  {calculations.fsiUtilizationPercentage}% Consumed
                </span>
              </div>
              <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                <div
                  className={`h-full transition-all duration-300 ${
                    calculations.utilizedFsi > calculations.effectivePermissibleFsi 
                      ? 'bg-rose-500' 
                      : calculations.fsiUtilizationPercentage >= 90 
                        ? 'bg-amber-400' 
                        : 'bg-indigo-500'
                  }`}
                  style={{ width: `${Math.min(100, calculations.fsiUtilizationPercentage)}%` }}
                />
              </div>
            </div>

            {/* 4-KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
              <div className="bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-800/80">
                <span className="text-[9px] text-zinc-400 font-bold uppercase block">Max Permissible BUA</span>
                <span className="text-sm font-black font-mono text-white mt-1 block">
                  {Math.round(calculations.permissibleBuiltUp).toLocaleString()} {unit}
                </span>
              </div>
              <div className="bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-800/80">
                <span className="text-[9px] text-zinc-400 font-bold uppercase block">Planned BUA</span>
                <span className="text-sm font-black font-mono text-indigo-400 mt-1 block">
                  {Math.round(calculations.totalPlannedBuiltUp).toLocaleString()} {unit}
                </span>
              </div>
              <div className="bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-800/80">
                <span className="text-[9px] text-zinc-400 font-bold uppercase block">Max Ground Footprint</span>
                <span className="text-sm font-black font-mono text-zinc-300 mt-1 block">
                  {Math.round(calculations.maxGroundFootprint).toLocaleString()} {unit}
                </span>
              </div>
              <div className="bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-800/80">
                <span className="text-[9px] text-zinc-400 font-bold uppercase block">Balance Capacity</span>
                <span className={`text-sm font-black font-mono mt-1 block ${calculations.remainingBuiltUp < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {Math.round(calculations.remainingBuiltUp).toLocaleString()} {unit}
                </span>
              </div>
            </div>
          </div>

          {/* =====================================================================
              2D VISUAL STUDIO (Interactive CAD Plot Plan, Elevation & Graph)
              ===================================================================== */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-150 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Maximize2 className="w-4 h-4" />
                </div>
                <h3 className="font-black text-zinc-900 dark:text-white text-xs uppercase tracking-wider">
                  2D Architectural Visualizer & Graph
                </h3>
              </div>

              {/* Visual Studio Sub-tabs */}
              <div className="flex rounded-xl bg-zinc-100 dark:bg-zinc-800 p-0.5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveVisualTab('plot_plan')}
                  className={`px-3 py-1 rounded-lg transition ${
                    activeVisualTab === 'plot_plan' ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-white shadow-xs' : 'text-zinc-500'
                  }`}
                >
                  Top Plot CAD
                </button>
                <button
                  type="button"
                  onClick={() => setActiveVisualTab('elevation')}
                  className={`px-3 py-1 rounded-lg transition ${
                    activeVisualTab === 'elevation' ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-white shadow-xs' : 'text-zinc-500'
                  }`}
                >
                  Elevation Stack
                </button>
                <button
                  type="button"
                  onClick={() => setActiveVisualTab('fsi_graph')}
                  className={`px-3 py-1 rounded-lg transition ${
                    activeVisualTab === 'fsi_graph' ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-white shadow-xs' : 'text-zinc-500'
                  }`}
                >
                  FSI Breakdown Graph
                </button>
              </div>
            </div>

            {/* TAB 1: 2D PLOT PLAN & SETBACK BLUEPRINT */}
            {activeVisualTab === 'plot_plan' && (
              <div className="space-y-3">
                <div className="w-full h-72 bg-slate-950 rounded-2xl flex items-center justify-center p-3 relative overflow-hidden border border-zinc-800">
                  <svg className="w-full h-full" viewBox="0 0 500 320">
                    <defs>
                      <pattern id="cadGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                      </pattern>
                      <pattern id="setbackHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                        <line x1="0" y1="0" x2="0" y2="8" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.3" />
                      </pattern>
                    </defs>

                    {/* Background Grid */}
                    <rect width="500" height="320" fill="url(#cadGrid)" />

                    {/* 1. Road fronting the property */}
                    <rect x="0" y="0" width="500" height="45" fill="#1e293b" />
                    <line x1="0" y1="22.5" x2="500" y2="22.5" stroke="#f8fafc" strokeWidth="1.5" strokeDasharray="6 6" strokeOpacity="0.7" />
                    <text x="250" y="15" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#94a3b8">
                      ↑ {roadWidth} {lengthUnit} WIDE MUNICIPAL ACCESS ROAD (Road Centerline) ↑
                    </text>

                    {/* 2. Cadastral Plot Boundary (x: 50, y: 55, w: 400, h: 250) */}
                    <rect x="50" y="55" width="400" height="250" fill="#0f172a" stroke="#64748b" strokeWidth="2" strokeDasharray="4 2" />
                    <text x="50" y="50" fontSize="9" fontWeight="bold" fill="#94a3b8">Plot Boundary: {plotWidth} {lengthUnit} × {plotDepth} {lengthUnit} ({plotArea.toLocaleString()} {unit})</text>

                    {/* 3. Mandatory Setbacks (Shaded orange hatch) */}
                    {/* Front Setback */}
                    <rect x="50" y="55" width="400" height="40" fill="url(#setbackHatch)" />
                    <text x="250" y="80" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#f59e0b">Front Setback: {setbackFront} {lengthUnit}</text>

                    {/* Rear Setback */}
                    <rect x="50" y="265" width="400" height="40" fill="url(#setbackHatch)" />
                    <text x="250" y="290" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#f59e0b">Rear Setback: {setbackRear} {lengthUnit}</text>

                    {/* Left Setback */}
                    <rect x="50" y="95" width="35" height="170" fill="url(#setbackHatch)" />
                    <text x="67" y="180" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#f59e0b" transform="rotate(-90 67 180)">Left: {setbackLeft} {lengthUnit}</text>

                    {/* Right Setback */}
                    <rect x="415" y="95" width="35" height="170" fill="url(#setbackHatch)" />
                    <text x="432" y="180" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#f59e0b" transform="rotate(90 432 180)">Right: {setbackRight} {lengthUnit}</text>

                    {/* 4. Buildable Footprint Envelope (x: 85, y: 95, w: 330, h: 170) */}
                    <rect x="85" y="95" width="330" height="170" fill="#4f46e5" fillOpacity="0.25" stroke="#6366f1" strokeWidth="2" rx="4" />
                    
                    {/* Center Footprint Badge */}
                    <rect x="150" y="150" width="200" height="50" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1" rx="8" />
                    <text x="250" y="170" textAnchor="middle" fontSize="11" fontWeight="900" fill="#a5b4fc">
                      NET BUILDABLE FOOTPRINT
                    </text>
                    <text x="250" y="188" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#e0e7ff">
                      Max: {Math.round(calculations.maxGroundFootprint).toLocaleString()} {unit} ({groundCoverage}% Coverage)
                    </text>
                  </svg>
                </div>
                <div className="flex justify-between items-center text-[11px] text-zinc-500 px-1">
                  <span>📐 Yellow Shading = Open Setback Buffer</span>
                  <span>🟦 Cyan/Indigo = Permissible Ground Slab Boundary</span>
                </div>
              </div>
            )}

            {/* TAB 2: 2D VERTICAL ELEVATION & HEIGHT SECTION */}
            {activeVisualTab === 'elevation' && (
              <div className="space-y-3">
                <div className="w-full h-72 bg-slate-950 rounded-2xl flex items-center justify-center p-3 relative overflow-hidden border border-zinc-800">
                  <svg className="w-full h-full" viewBox="0 0 460 320">
                    <defs>
                      <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#090d16" />
                        <stop offset="100%" stopColor="#0f172a" />
                      </linearGradient>
                      <linearGradient id="floorGradBlue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#4338ca" />
                      </linearGradient>
                    </defs>

                    {/* Sky Background */}
                    <rect width="460" height="320" fill="url(#skyGrad)" />

                    {/* Street Level datum line */}
                    <line x1="20" y1="280" x2="440" y2="280" stroke="#64748b" strokeWidth="2" />
                    <text x="30" y="295" fontSize="9" fontWeight="bold" fill="#94a3b8">±0.00m Road Level</text>

                    {/* Road Width Height Restriction Ceiling */}
                    <line x1="80" y1="80" x2="380" y2="80" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 4" />
                    <text x="230" y="74" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#f87171">
                      MAX STATUTORY HEIGHT CEILING: {calculations.maxPermissibleHeightMeters}m ({calculations.maxPermissibleHeightFeet}ft)
                    </text>

                    {/* Stacked Building Floors */}
                    {plannedFloors.slice(0, 8).map((floor, idx) => {
                      const floorH = Math.min(24, Math.max(14, 180 / Math.max(1, plannedFloors.length)));
                      const floorY = 275 - (idx + 1) * floorH;
                      return (
                        <g key={floor.id}>
                          <rect
                            x="130"
                            y={floorY}
                            width="200"
                            height={floorH - 2}
                            fill="url(#floorGradBlue)"
                            stroke="#818cf8"
                            strokeWidth="1"
                            rx="3"
                          />
                          {/* Window slits */}
                          <rect x="150" y={floorY + 4} width="20" height={floorH - 10} fill="#bae6fd" fillOpacity="0.8" rx="1" />
                          <rect x="180" y={floorY + 4} width="20" height={floorH - 10} fill="#bae6fd" fillOpacity="0.8" rx="1" />
                          <rect x="260" y={floorY + 4} width="20" height={floorH - 10} fill="#bae6fd" fillOpacity="0.8" rx="1" />
                          <rect x="290" y={floorY + 4} width="20" height={floorH - 10} fill="#bae6fd" fillOpacity="0.8" rx="1" />
                          
                          <text x="230" y={floorY + floorH / 2 + 3} textAnchor="middle" fontSize="8" fontWeight="bold" fill="#ffffff">
                            {floor.name} ({floor.area} {unit})
                          </text>
                        </g>
                      );
                    })}

                    {/* Rooftop Parapet / Water Tank cabin */}
                    {plannedFloors.length > 0 && (
                      <g>
                        <rect x="210" y={275 - plannedFloors.length * Math.min(24, Math.max(14, 180 / Math.max(1, plannedFloors.length))) - 15} width="40" height="15" fill="#312e81" stroke="#818cf8" strokeWidth="1" />
                        <text x="230" y={275 - plannedFloors.length * Math.min(24, Math.max(14, 180 / Math.max(1, plannedFloors.length))) - 4} textAnchor="middle" fontSize="7" fill="#c7d2fe">MUMTY</text>
                      </g>
                    )}

                    {/* Total Height Dimension Callout */}
                    <line x1="350" y1="280" x2="350" y2={275 - plannedFloors.length * Math.min(24, Math.max(14, 180 / Math.max(1, plannedFloors.length)))} stroke="#e2e8f0" strokeWidth="1.5" />
                    <text x="360" y="200" fontSize="10" fontWeight="bold" fill="#38bdf8">
                      Ht: {calculations.totalProposedHeightMeters}m ({calculations.totalProposedHeightFeet}ft)
                    </text>
                  </svg>
                </div>
                <div className="flex justify-between items-center text-[11px] px-1">
                  <span className={calculations.isHeightCompliant ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                    {calculations.isHeightCompliant ? '✓ Height within Safe Road Width Ratio' : '⚠️ Exceeds Permissible Road Width Ratio'}
                  </span>
                  <span className="text-zinc-400 font-mono">
                    Proposed: {calculations.totalProposedHeightMeters}m / Max: {calculations.maxPermissibleHeightMeters}m
                  </span>
                </div>
              </div>
            )}

            {/* TAB 3: FSI BREAKDOWN GRAPH */}
            {activeVisualTab === 'fsi_graph' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 space-y-4">
                  <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block">
                    FSI Layer Composition Breakdown
                  </span>
                  
                  {/* Visual Multi-Layer Stack Bar */}
                  <div className="w-full h-8 rounded-xl overflow-hidden flex border border-zinc-300 dark:border-zinc-700 font-mono text-[10px] font-black text-white text-center leading-8">
                    <div style={{ width: `${(baseFsi / Math.max(3.0, calculations.effectivePermissibleFsi)) * 100}%` }} className="bg-blue-600 truncate px-1">
                      Base {baseFsi}
                    </div>
                    {enablePremiumFsi && (
                      <div style={{ width: `${(premiumFsiValue / Math.max(3.0, calculations.effectivePermissibleFsi)) * 100}%` }} className="bg-purple-600 truncate px-1">
                        Prem {premiumFsiValue}
                      </div>
                    )}
                    {enableTdr && (
                      <div style={{ width: `${(tdrFsiValue / Math.max(3.0, calculations.effectivePermissibleFsi)) * 100}%` }} className="bg-amber-600 truncate px-1">
                        TDR {tdrFsiValue}
                      </div>
                    )}
                    {isTodZone && (
                      <div style={{ width: `${(0.5 / Math.max(3.0, calculations.effectivePermissibleFsi)) * 100}%` }} className="bg-emerald-600 truncate px-1">
                        TOD 0.5
                      </div>
                    )}
                  </div>

                  {/* Itemized Stack Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                      <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase block">1. Base FSI</span>
                      <span className="font-mono font-bold text-blue-950 dark:text-blue-200 mt-0.5 block">{baseFsi} FSI</span>
                      <span className="text-[10px] text-zinc-400">{Math.round(plotArea * baseFsi).toLocaleString()} {unit}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                      <span className="text-[9px] font-bold text-purple-600 dark:text-purple-400 uppercase block">2. Premium FSI</span>
                      <span className="font-mono font-bold text-purple-950 dark:text-purple-200 mt-0.5 block">
                        {enablePremiumFsi ? `+${premiumFsiValue} FSI` : 'Disabled'}
                      </span>
                      <span className="text-[10px] text-zinc-400">{Math.round(calculations.premiumFsiArea).toLocaleString()} {unit}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                      <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase block">3. TDR Potential</span>
                      <span className="font-mono font-bold text-amber-950 dark:text-amber-200 mt-0.5 block">
                        {enableTdr ? `+${tdrFsiValue} FSI` : 'Disabled'}
                      </span>
                      <span className="text-[10px] text-zinc-400">{Math.round(calculations.tdrFsiArea).toLocaleString()} {unit}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                      <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase block">4. Total Gross BUA</span>
                      <span className="font-mono font-bold text-emerald-950 dark:text-emerald-200 mt-0.5 block">
                        {Math.round(calculations.totalGrossConstruction).toLocaleString()} {unit}
                      </span>
                      <span className="text-[10px] text-zinc-400">Incl. Fungible Area</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* =====================================================================
              FLOOR AREA PLANNER (Custom Floor Schedule)
              ===================================================================== */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-150 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-indigo-500" />
                  <span>Floor Schedule & Level Planner</span>
                </h3>
                <p className="text-[10px] text-zinc-450 dark:text-zinc-500 font-medium">Add or customize levels to match architectural designs</p>
              </div>
              <button
                onClick={addFloor}
                className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl flex items-center gap-1 border border-indigo-200 dark:border-indigo-800 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Floor
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {plannedFloors.map((floor) => (
                <div key={floor.id} className="flex justify-between items-center gap-3 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-200/60 dark:border-zinc-800/60 text-xs">
                  <input
                    type="text"
                    value={floor.name}
                    onChange={(e) => {
                      const updated = plannedFloors.map(f => f.id === floor.id ? { ...f, name: e.target.value } : f);
                      setPlannedFloors(updated);
                    }}
                    className="bg-transparent font-bold text-zinc-800 dark:text-white focus:outline-none border-b border-transparent focus:border-indigo-500"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={floor.area}
                      onChange={(e) => updateFloorArea(floor.id, Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-24 px-2 py-1 text-right text-xs font-bold border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg focus:outline-none font-mono"
                    />
                    <span className="text-[10px] font-bold text-zinc-400">{unit}</span>
                    <button onClick={() => removeFloor(floor.id)} className="text-rose-500 p-1 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded cursor-pointer" title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          BOTTOM DOCK: DELIVERABLES, PDF EXPORT & AUDIT ACTIONS
          ========================================================================= */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-4">
        <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-800 pb-2">
          <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-indigo-500" />
            <span>Generate Certified Clearance Deliverables</span>
          </h3>
          <span className="text-[10px] font-bold text-zinc-400">NBC 2016 Compliant</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <CopyButton text={getResultsText} label="Copy Audit Summary" copiedLabel="Copied" size="sm" variant="secondary" />
          <ShareWhatsApp text={getResultsText} label="WhatsApp Audit" size="sm" variant="solid" />
          <button
            onClick={exportCSV}
            className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Download CSV Floor Schedule</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Certified PDF Report</span>
          </button>
        </div>
      </div>
    </div>
  );
}

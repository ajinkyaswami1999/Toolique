import { useState, useEffect, useMemo } from 'react';
import { 
  Copy, Check, Info, Building2, Trash2, Plus, 
  Printer, Download, Sparkles, Sliders, ArrowRightLeft
} from 'lucide-react';
import { jsPDF } from 'jspdf';

// --- Interfaces ---
type UnitType = 'sqft' | 'sqm' | 'sqyd' | 'acre' | 'hectare' | 'cent' | 'guntha' | 'bigha';
type BuildingType = 'residential' | 'commercial' | 'mixed_use' | 'industrial' | 'institutional';
type ReverseMode = 'max_builtup' | 'required_plot' | 'calculate_fsi' | 'calculate_coverage' | 'remaining_fsi';

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

export default function FARFSICalculator() {
  // 1. Calculator Modes Toggles
  const [calcMode, setCalcMode] = useState<'forward' | 'reverse'>('forward');
  const [isProfessional, setIsProfessional] = useState<boolean>(false);
  const [unit, setUnit] = useState<UnitType>('sqft');

  // 2. Core Inputs
  const [plotArea, setPlotArea] = useState<number>(2000);
  const [permissibleFsi, setPermissibleFsi] = useState<number>(2.0);
  const [groundCoverage, setGroundCoverage] = useState<number>(50); // %
  const [numFloors, setNumFloors] = useState<number>(4);
  const [avgFloorHeight, setAvgFloorHeight] = useState<number>(3.0); // meters or 10 ft
  const [roadWidth, setRoadWidth] = useState<number>(12); // meters or 40 ft
  const [plotWidth, setPlotWidth] = useState<number>(40); // ft or meters
  const [plotDepth, setPlotDepth] = useState<number>(50); // ft or meters
  const [buildingType, setBuildingType] = useState<BuildingType>('residential');
  const [devZone, setDevZone] = useState<string>('residential_zone');

  // Setbacks (Professional Mode)
  const [setbackFront, setSetbackFront] = useState<number>(3); // ft or meters
  const [setbackRear, setSetbackRear] = useState<number>(3);
  const [setbackLeft, setSetbackLeft] = useState<number>(2);
  const [setbackRight, setSetbackRight] = useState<number>(2);

  // 3. Floor Area Planner List
  const [plannedFloors, setPlannedFloors] = useState<FloorRow[]>([
    { id: '1', name: 'Ground Floor', area: 1000 },
    { id: '2', name: 'First Floor', area: 1000 },
    { id: '3', name: 'Second Floor', area: 1000 },
    { id: '4', name: 'Third Floor', area: 1000 }
  ]);

  // 4. Reverse Calculator Inputs
  const [revMode, setRevMode] = useState<ReverseMode>('max_builtup');
  const [revDesiredFloorArea, setRevDesiredFloorArea] = useState<string>('4000');
  const [revPlotArea, setRevPlotArea] = useState<string>('2000');
  const [revFsi, setRevFsi] = useState<string>('2.0');
  const [revFootprint, setRevFootprint] = useState<string>('1000');
  const [revPlannedArea, setRevPlannedArea] = useState<string>('3000');

  // 5. Scenario Comparison Inputs
  const [enableComparison, setEnableComparison] = useState<boolean>(false);
  const [compFsiA, setCompFsiA] = useState<string>('1.5');
  const [compFsiB, setCompFsiB] = useState<string>('2.0');
  const [compFsiC, setCompFsiC] = useState<string>('2.5');

  // 6. Location Presets State
  const [statePreset, setStatePreset] = useState<string>('maharashtra');
  const [cityPreset, setCityPreset] = useState<string>('mumbai');
  const [zonePreset, setZonePreset] = useState<string>('residential');

  // Utility states
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [newHistoryName, setNewHistoryName] = useState<string>('My Plot Plan');

  // --- Area Unit Conversion Factor (Relative to sq ft) ---
  const conversionFactors: Record<UnitType, number> = {
    sqft: 1.0,
    sqm: 10.7639,
    sqyd: 9.0,
    acre: 43560.0,
    hectare: 107639.1,
    cent: 435.6,
    guntha: 1089.0,
    bigha: 27000.0 // Standard/UP Bigha = 27,000 sq ft
  };

  // Convert current plot area when changing units
  const handleUnitSwitch = (newUnit: UnitType) => {
    if (newUnit === unit) return;
    const oldFactor = conversionFactors[unit];
    const newFactor = conversionFactors[newUnit];
    
    // Scale plot area safely
    const baseSqft = plotArea * oldFactor;
    setPlotArea(Number((baseSqft / newFactor).toFixed(2)));
    setUnit(newUnit);
  };

  // Load calculation history on mount
  useEffect(() => {
    const cached = localStorage.getItem('toolique_far_hist');
    if (cached) setHistoryList(JSON.parse(cached));
  }, []);

  // --- Location Presets Matrix ---
  const locationPresets: Record<string, Record<string, Record<string, {
    fsi: number;
    authority: string;
    doc: string;
    verified: string;
    notes: string;
  }>>> = {
    maharashtra: {
      mumbai: {
        residential: { fsi: 2.50, authority: "MCGM", doc: "DCPR 2034", verified: "10 Mar 2026", notes: "Suburbs base FSI, premium FSI up to 0.50 can be purchased." },
        commercial: { fsi: 3.00, authority: "MCGM", doc: "DCPR 2034", verified: "10 Mar 2026", notes: "Zonal commercial base indexes. Excludes staircase and lifts." }
      },
      pune: {
        residential: { fsi: 1.10, authority: "PMC", doc: "Pune UDCPR", verified: "14 Jan 2026", notes: "Pune Municipal Corporation base suburban FSI limit." },
        commercial: { fsi: 2.50, authority: "PMC", doc: "Pune UDCPR", verified: "14 Jan 2026", notes: "Subject to front road width and premium loading." }
      }
    },
    delhi: {
      delhi: {
        residential: { fsi: 2.00, authority: "DDA", doc: "Delhi MPD 2021", verified: "05 Feb 2026", notes: "Delhi Development Authority standard plotted residential index." },
        commercial: { fsi: 3.50, authority: "DDA", doc: "Delhi MPD 2021", verified: "05 Feb 2026", notes: "Core commercial nodes and high-density zones." }
      }
    },
    karnataka: {
      bengaluru: {
        residential: { fsi: 1.75, authority: "BBMP", doc: "BBMP Building Bye-Laws", verified: "20 Feb 2026", notes: "Applicable for plots fronting roads wider than 9 meters." },
        commercial: { fsi: 3.25, authority: "BBMP", doc: "BBMP Building Bye-Laws", verified: "20 Feb 2026", notes: "Excludes specific services ducts and parking basements." }
      }
    }
  };

  const activePreset = useMemo(() => {
    try {
      return locationPresets[statePreset]?.[cityPreset]?.[zonePreset] || null;
    } catch (e) {
      return null;
    }
  }, [statePreset, cityPreset, zonePreset]);

  // Load FSI preset into the calculator
  const applyPreset = () => {
    if (activePreset) {
      setPermissibleFsi(activePreset.fsi);
    }
  };

  // --- Dynamic Core Calculations ---
  const calculations = useMemo(() => {
    const areaFactor = conversionFactors[unit];
    const plotAreaSqft = plotArea * areaFactor;

    // Built-up capacities
    const permissibleBuiltUpSqft = plotAreaSqft * permissibleFsi;
    const maxGroundFootprintSqft = plotAreaSqft * (groundCoverage / 100);

    // Dynamic Floor Area Planner Math
    const totalPlannedBuiltUpSqft = plannedFloors.reduce((sum, f) => sum + (f.area || 0), 0) * (unit === 'sqft' ? 1 : areaFactor);
    const utilizedFsi = plotAreaSqft > 0 ? (totalPlannedBuiltUpSqft / plotAreaSqft) : 0;
    const remainingBuiltUpSqft = permissibleBuiltUpSqft - totalPlannedBuiltUpSqft;
    const fsiUtilizationPercentage = permissibleBuiltUpSqft > 0 ? (totalPlannedBuiltUpSqft / permissibleBuiltUpSqft) * 100 : 0;

    // Footprint constraints under setbacks
    let setbackReductionFactor = 1.0;
    if (isProfessional && plotWidth > 0 && plotDepth > 0) {
      const netWidth = Math.max(0, plotWidth - setbackLeft - setbackRight);
      const netDepth = Math.max(0, plotDepth - setbackFront - setbackRear);
      const buildableAreaRect = netWidth * netDepth;
      const nominalArea = plotWidth * plotDepth;
      if (nominalArea > 0) {
        setbackReductionFactor = buildableAreaRect / nominalArea;
      }
    }

    // Status indicators
    let statusLabel = 'Low utilization';
    let statusColor = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (fsiUtilizationPercentage > 100) {
      statusLabel = 'Limit Exceeded';
      statusColor = 'text-rose-500 bg-rose-500/10 border-rose-500/20';
    } else if (fsiUtilizationPercentage >= 90) {
      statusLabel = 'Near Limit';
      statusColor = 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    } else if (fsiUtilizationPercentage >= 50) {
      statusLabel = 'Moderate utilization';
      statusColor = 'text-indigo-650 bg-indigo-500/10 border-indigo-500/20';
    }

    return {
      permissibleBuiltUp: permissibleBuiltUpSqft / areaFactor,
      maxGroundFootprint: maxGroundFootprintSqft / areaFactor,
      totalPlannedBuiltUp: totalPlannedBuiltUpSqft / areaFactor,
      utilizedFsi: Number(utilizedFsi.toFixed(3)),
      remainingBuiltUp: remainingBuiltUpSqft / areaFactor,
      fsiUtilizationPercentage: Number(fsiUtilizationPercentage.toFixed(1)),
      setbackReductionFactor,
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
    setbackRight
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

  // Sync floor count when changing floors state
  useEffect(() => {
    setNumFloors(plannedFloors.length);
  }, [plannedFloors]);

  // Sync floor elements when modifying floors input number
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
  }, [revDesiredFloorArea, revPlotArea, revFsi, revFootprint, revPlannedArea, revMode]);

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
      fsi: permissibleFsi,
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
  const copyResultsText = () => {
    const unitLabel = unit === 'sqft' ? 'sq ft' : 'sq m';
    const text = `FAR / FSI Planning Audit (Toolique.in)
----------------------------------------------
Plot Area            : ${plotArea} ${unitLabel}
Permissible FSI/FAR  : ${permissibleFsi}
Ground Coverage Limit: ${groundCoverage}%
Planned Floor Levels : ${plannedFloors.length}
----------------------------------------------
Max Permissible Area : ${calculations.permissibleBuiltUp.toFixed(2)} ${unitLabel}
Planned built-up Area: ${calculations.totalPlannedBuiltUp.toFixed(2)} ${unitLabel}
Utilized FSI/FAR     : ${calculations.utilizedFsi}
FSI Utilization %    : ${calculations.fsiUtilizationPercentage}%
Remaining Capacity   : ${calculations.remainingBuiltUp.toFixed(2)} ${unitLabel}
----------------------------------------------
Status Audit         : ${calculations.statusLabel}`;

    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const exportCSV = () => {
    const headers = ['Floor Level', 'Planned Area (sq ft/m)'];
    const rows = plannedFloors.map(f => [f.name, f.area]);
    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `FAR_FSI_Amortization_FloorPlan_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>FAR / FSI Clearance Invoice - Toolique</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; }
            h2 { border-bottom: 2px solid #555; padding-bottom: 10px; }
            .row { display: flex; justify-content: space-between; margin: 12px 0; font-size: 14px; }
            .total { font-weight: bold; font-size: 1.1em; border-top: 1px solid #333; padding-top: 10px; }
          </style>
        </head>
        <body>
          <h2>FAR / FSI CLEARANCE PLAN</h2>
          <div class="row"><span>Plot Area</span><span>${plotArea} ${unit}</span></div>
          <div class="row"><span>Permissible FSI</span><span>${permissibleFsi}</span></div>
          <div class="row"><span>Ground Coverage Limit</span><span>${groundCoverage}%</span></div>
          <div class="row"><span>Planned Floors Count</span><span>${plannedFloors.length} levels</span></div>
          <div class="row total"><span>Max Permissible Area</span><span>${calculations.permissibleBuiltUp.toFixed(2)} ${unit}</span></div>
          <div class="row"><span>Utilized FSI/FAR</span><span>${calculations.utilizedFsi}</span></div>
          <div class="row"><span>FSI Utilization %</span><span>${calculations.fsiUtilizationPercentage}%</span></div>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 210, 38, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('FAR / FSI DEVELOPMENT PLAN', 15, 22);
    doc.setFontSize(10);
    doc.text('Zoning Regulation Audit — Toolique.in', 15, 30);

    doc.setTextColor(60, 60, 60);
    doc.setFontSize(12);
    doc.text('Site Regulation Parameters', 15, 52);

    doc.setFontSize(10);
    doc.text(`Plot Area: ${plotArea} ${unit}`, 15, 60);
    doc.text(`Permissible FSI limit: ${permissibleFsi}`, 15, 66);
    doc.text(`Ground Coverage limit: ${groundCoverage}%`, 15, 72);
    doc.text(`Building Type: ${buildingType.toUpperCase()}`, 15, 78);
    
    if (isProfessional) {
      doc.text(`Road Width constraint: ${roadWidth}m`, 15, 84);
      doc.text(`Setbacks: Front ${setbackFront}m | Rear ${setbackRear}m | Sides ${setbackLeft}m / ${setbackRight}m`, 15, 90);
    }

    doc.line(15, 96, 195, 96);
    
    doc.setFontSize(12);
    doc.text('Development Potential Summary', 15, 106);
    
    doc.setFontSize(10);
    doc.text(`Max Permissible Builtup Area: ${calculations.permissibleBuiltUp.toFixed(2)} ${unit}`, 15, 114);
    doc.text(`Total Proposed Area: ${calculations.totalPlannedBuiltUp.toFixed(2)} ${unit}`, 15, 120);
    doc.text(`Actual FSI Utilized: ${calculations.utilizedFsi}`, 15, 126);
    doc.text(`FSI Utilization status: ${calculations.statusLabel} (${calculations.fsiUtilizationPercentage}%)`, 15, 132);

    doc.save(`FAR_FSI_Audit_Report_${Date.now()}.pdf`);
  };

  const getShareLink = () => {
    const params = new URLSearchParams();
    params.set('amount', plotArea.toString());
    params.set('rate', permissibleFsi.toString());
    params.set('mode', calcMode);
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto text-left">
      
      {/* Top Banner Widget */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-650 dark:text-indigo-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-zinc-900 dark:text-white text-sm">Zoning & Development Planner</h3>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">Verify Floor Area Ratio (FAR) and Ground Coverage clearances</p>
          </div>
        </div>

        {/* Share scenario */}
        <button
          onClick={() => {
            navigator.clipboard.writeText(getShareLink());
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2000);
          }}
          className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm"
        >
          {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedLink ? 'Link Copied' : 'Share Scenario'}</span>
        </button>
      </div>

      {/* CORE WORKSPACE TABS */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
        <button
          onClick={() => setCalcMode('forward')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            calcMode === 'forward' ? 'bg-indigo-600 text-white shadow-md' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-650 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
          }`}
        >
          Forward FSI Planner
        </button>
        <button
          onClick={() => setCalcMode('reverse')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            calcMode === 'reverse' ? 'bg-indigo-600 text-white shadow-md' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-650 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
          }`}
        >
          Reverse FSI Planners
        </button>
      </div>

      {/* TWO COLUMN INTERACTION LAYER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: CALCULATOR INPUTS */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* FORWARD CALCULATION MODE PANEL */}
          {calcMode === 'forward' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-5">
              <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-850 pb-3">
                <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span>Forward Parameters</span>
                </h3>
                
                {/* Simple vs Professional toggle switch */}
                <label className="flex items-center gap-1 text-[10px] font-bold text-zinc-450 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isProfessional}
                    onChange={(e) => setIsProfessional(e.target.checked)}
                    className="rounded border-zinc-300 text-indigo-650"
                  />
                  <span>Professional Mode</span>
                </label>
              </div>

              {/* Plot area field & unit selector */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block">Plot Area</label>
                  <select
                    value={unit}
                    onChange={(e) => handleUnitSwitch(e.target.value as UnitType)}
                    className="p-1 rounded-lg border border-zinc-200 dark:border-zinc-850 text-[10px] font-bold bg-transparent text-zinc-550"
                  >
                    <option value="sqft">Sq. Feet</option>
                    <option value="sqm">Sq. Meters</option>
                    <option value="sqyd">Sq. Yards</option>
                    <option value="acre">Acres</option>
                    <option value="hectare">Hectares</option>
                    <option value="cent">Cents</option>
                    <option value="guntha">Gunthas</option>
                    <option value="bigha">Bigha (UP)</option>
                  </select>
                </div>
                <input
                  type="number"
                  value={plotArea}
                  onChange={(e) => setPlotArea(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 font-mono text-xs font-bold focus:outline-none"
                />
              </div>

              {/* Permissible FSI Index */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Permissible FAR / FSI</label>
                  <input
                    type="number"
                    step="0.05"
                    value={permissibleFsi}
                    onChange={(e) => setPermissibleFsi(Math.max(0.1, parseFloat(e.target.value) || 0))}
                    className="w-20 px-2 py-1 text-right text-xs font-bold border border-zinc-200 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-950 focus:outline-none rounded-lg"
                  />
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.1"
                  value={permissibleFsi}
                  onChange={(e) => setPermissibleFsi(parseFloat(e.target.value))}
                  className="w-full h-1 bg-zinc-250 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-650"
                />
              </div>

              {/* Ground Coverage % */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Ground Coverage limit (%)</label>
                  <input
                    type="number"
                    value={groundCoverage}
                    onChange={(e) => setGroundCoverage(Math.min(100, Math.max(1, parseInt(e.target.value) || 0)))}
                    className="w-16 px-2 py-1 text-right text-xs font-bold border border-zinc-200 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-950 focus:outline-none rounded-lg"
                  />
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={groundCoverage}
                  onChange={(e) => setGroundCoverage(parseInt(e.target.value))}
                  className="w-full h-1 bg-zinc-250 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-650"
                />
              </div>

              {/* Floors Stack count */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Planned Floor Levels</label>
                  <input
                    type="number"
                    value={numFloors}
                    onChange={(e) => handleFloorsCountChange(parseInt(e.target.value) || 1)}
                    className="w-16 px-2 py-1 text-right text-xs font-bold border border-zinc-200 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-950 focus:outline-none rounded-lg"
                  />
                </div>
              </div>

              {/* Professional fields stack */}
              {isProfessional && (
                <div className="p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-850 space-y-4 pt-4 border-t">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-zinc-400">Road Width (m)</label>
                      <input
                        type="number"
                        value={roadWidth}
                        onChange={(e) => setRoadWidth(Math.max(1, parseFloat(e.target.value) || 0))}
                        className="w-full px-2.5 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded text-xs font-mono font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-zinc-400">Building Type</label>
                      <select
                        value={buildingType}
                        onChange={(e) => setBuildingType(e.target.value as BuildingType)}
                        className="w-full p-2 border border-zinc-200 dark:border-zinc-850 rounded text-[10px] font-bold"
                      >
                        <option value="residential">Residential</option>
                        <option value="commercial">Commercial</option>
                        <option value="mixed_use">Mixed Use</option>
                        <option value="industrial">Industrial</option>
                        <option value="institutional">Institutional</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-zinc-400">Plot Width</label>
                      <input
                        type="number"
                        value={plotWidth}
                        onChange={(e) => setPlotWidth(Math.max(1, parseFloat(e.target.value) || 0))}
                        className="w-full px-2.5 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded text-xs font-mono font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-zinc-400">Plot Depth</label>
                      <input
                        type="number"
                        value={plotDepth}
                        onChange={(e) => setPlotDepth(Math.max(1, parseFloat(e.target.value) || 0))}
                        className="w-full px-2.5 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded text-xs font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-zinc-400">Avg Floor Height (m)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={avgFloorHeight}
                        onChange={(e) => setAvgFloorHeight(Math.max(1, parseFloat(e.target.value) || 3.0))}
                        className="w-full px-2.5 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded text-xs font-mono font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-zinc-400">Development Zone</label>
                      <select
                        value={devZone}
                        onChange={(e) => setDevZone(e.target.value)}
                        className="w-full p-2 border border-zinc-200 dark:border-zinc-850 rounded text-[10px] font-bold"
                      >
                        <option value="residential_zone">Residential Zone</option>
                        <option value="commercial_zone">Commercial Zone</option>
                        <option value="mixed_use_zone">Mixed Use Zone</option>
                        <option value="industrial_zone">Industrial Zone</option>
                      </select>
                    </div>
                  </div>

                  {/* Setbacks */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-zinc-400 block">Setbacks Clearance Guidelines</label>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[8px] text-zinc-400 uppercase block">Front</span>
                        <input type="number" value={setbackFront} onChange={(e) => setSetbackFront(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full p-1 border text-center text-xs font-mono" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[8px] text-zinc-400 uppercase block">Rear</span>
                        <input type="number" value={setbackRear} onChange={(e) => setSetbackRear(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full p-1 border text-center text-xs font-mono" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[8px] text-zinc-400 uppercase block">Left</span>
                        <input type="number" value={setbackLeft} onChange={(e) => setSetbackLeft(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full p-1 border text-center text-xs font-mono" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[8px] text-zinc-400 uppercase block">Right</span>
                        <input type="number" value={setbackRight} onChange={(e) => setSetbackRight(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full p-1 border text-center text-xs font-mono" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* REVERSE CALCULATION MODE PANEL */}
          {calcMode === 'reverse' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-5">
              <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-150 dark:border-zinc-850 pb-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>Reverse Mode</span>
              </h3>

              {/* Reverse planners selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Target Equation</label>
                <select
                  value={revMode}
                  onChange={(e) => setRevMode(e.target.value as ReverseMode)}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold bg-transparent text-zinc-700 dark:text-zinc-350"
                >
                  <option value="max_builtup">Mode 1 — Max Floor Area (from FSI)</option>
                  <option value="required_plot">Mode 2 — Required Plot (from desired area)</option>
                  <option value="calculate_fsi">Mode 3 — Calculate FSI (from plot + floors)</option>
                  <option value="calculate_coverage">Mode 4 — Ground Coverage (from footprint)</option>
                  <option value="remaining_fsi">Mode 5 — Remaining FSI (from used area)</option>
                </select>
              </div>

              {/* Variable fields stack */}
              <div className="space-y-3 pt-2">
                {(revMode === 'max_builtup' || revMode === 'calculate_fsi' || revMode === 'calculate_coverage' || revMode === 'remaining_fsi') && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-450 block">Plot Area (sq ft/m)</label>
                    <input type="number" value={revPlotArea} onChange={(e) => setRevPlotArea(e.target.value)} className="w-full p-2.5 border rounded-xl font-mono text-xs focus:outline-none" />
                  </div>
                )}

                {(revMode === 'max_builtup' || revMode === 'required_plot' || revMode === 'remaining_fsi') && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-450 block">Permissible FSI Index</label>
                    <input type="number" value={revFsi} onChange={(e) => setRevFsi(e.target.value)} className="w-full p-2.5 border rounded-xl font-mono text-xs focus:outline-none" />
                  </div>
                )}

                {revMode === 'required_plot' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-450 block">Desired Floor Area (sq ft/m)</label>
                    <input type="number" value={revDesiredFloorArea} onChange={(e) => setRevDesiredFloorArea(e.target.value)} className="w-full p-2.5 border rounded-xl font-mono text-xs focus:outline-none" />
                  </div>
                )}

                {revMode === 'calculate_coverage' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-450 block">Ground Footprint (sq ft/m)</label>
                    <input type="number" value={revFootprint} onChange={(e) => setRevFootprint(e.target.value)} className="w-full p-2.5 border rounded-xl font-mono text-xs focus:outline-none" />
                  </div>
                )}

                {(revMode === 'calculate_fsi' || revMode === 'remaining_fsi') && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-450 block">Planned Floor Area (sq ft/m)</label>
                    <input type="number" value={revPlannedArea} onChange={(e) => setRevPlannedArea(e.target.value)} className="w-full p-2.5 border rounded-xl font-mono text-xs focus:outline-none" />
                  </div>
                )}
              </div>

              {/* Reverse calculation results */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-850 flex justify-between items-center">
                <div>
                  <span className="text-[9px] font-black uppercase text-zinc-400 block tracking-wider">Calculated Value</span>
                  <div className="text-base font-black text-indigo-650 dark:text-indigo-400 mt-1 font-mono">
                    {revMode === 'max_builtup' && `Max Area: ${reverseCalculations.maxPermissibleArea.toLocaleString()} ${unit}`}
                    {revMode === 'required_plot' && `Required Plot: ${reverseCalculations.requiredPlotArea.toLocaleString()} ${unit}`}
                    {revMode === 'calculate_fsi' && `Actual FSI: ${reverseCalculations.actualFsi.toFixed(3)}`}
                    {revMode === 'calculate_coverage' && `Actual Coverage: ${reverseCalculations.actualGroundCoverage.toFixed(1)}%`}
                    {revMode === 'remaining_fsi' && `Remaining FSI: ${reverseCalculations.remainingFsi.toFixed(3)} (Capacity: ${reverseCalculations.remainingBuiltUpArea.toLocaleString()} ${unit})`}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: CORE SUMMARY RESULTS DASHBOARD */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl bg-zinc-950 text-white shadow-xl space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-850 pb-4">
              <div>
                <span className="text-[9px] font-black uppercase text-zinc-450 tracking-wider block">Clearance status audit</span>
                <h3 className="text-sm font-black text-indigo-400 mt-0.5">Development potential</h3>
              </div>
              <button
                onClick={copyResultsText}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-350 hover:bg-zinc-850 hover:text-white transition"
              >
                {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedReport ? 'Copied' : 'Copy Plan'}</span>
              </button>
            </div>

            {/* FSI meter utilization */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-zinc-400">
                <span>Used FAR/FSI: {calculations.utilizedFsi} / {permissibleFsi}</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${calculations.statusColor}`}>
                  {calculations.statusLabel} ({calculations.fsiUtilizationPercentage}%)
                </span>
              </div>
              <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden border border-zinc-850">
                <div
                  className={`h-full transition-all duration-300 ${calculations.utilizedFsi > permissibleFsi ? 'bg-rose-500' : calculations.fsiUtilizationPercentage >= 90 ? 'bg-amber-500' : 'bg-indigo-650'}`}
                  style={{ width: `${Math.min(100, calculations.fsiUtilizationPercentage)}%` }}
                />
              </div>
            </div>

            {/* Calculations Breakdown Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left pt-2">
              <div className="bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-850/40">
                <span className="text-[9px] text-zinc-400 font-extrabold uppercase block">Max Permitted</span>
                <span className="text-sm font-black font-mono text-white mt-1 block">{Math.round(calculations.permissibleBuiltUp).toLocaleString()} {unit}</span>
              </div>
              <div className="bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-850/40">
                <span className="text-[9px] text-zinc-400 font-extrabold uppercase block">Planned Area</span>
                <span className="text-sm font-black font-mono text-indigo-400 mt-1 block">{Math.round(calculations.totalPlannedBuiltUp).toLocaleString()} {unit}</span>
              </div>
              <div className="bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-850/40">
                <span className="text-[9px] text-zinc-400 font-extrabold uppercase block">Max Footprint</span>
                <span className="text-sm font-black font-mono text-zinc-300 mt-1 block">{Math.round(calculations.maxGroundFootprint).toLocaleString()} {unit}</span>
              </div>
              <div className="bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-850/40">
                <span className="text-[9px] text-zinc-400 font-extrabold uppercase block">Remaining Area</span>
                <span className={`text-sm font-black font-mono mt-1 block ${calculations.remainingBuiltUp < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{Math.round(calculations.remainingBuiltUp).toLocaleString()} {unit}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SVG INTERACTIVE SETBACK & FLOORS VISUALIZATION */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* SVG Plot Representation */}
        <div className="md:col-span-6 p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block border-b border-zinc-150 dark:border-zinc-850 pb-2">Plot Boundary & Setbacks</h3>
          
          <div className="w-full h-56 bg-zinc-50/50 dark:bg-zinc-950/20 rounded-2xl flex items-center justify-center p-4">
            <svg className="w-48 h-48" viewBox="0 0 100 100">
              {/* Outer plot border */}
              <rect x="2" y="2" width="96" height="96" fill="none" stroke="#666" strokeWidth="1" strokeDasharray="2 2" />
              {/* Setbacks clearance area */}
              {isProfessional ? (
                <rect 
                  x={Math.min(40, 2 + setbackLeft)} 
                  y={Math.min(40, 2 + setbackFront)} 
                  width={Math.max(10, 96 - setbackLeft - setbackRight)} 
                  height={Math.max(10, 96 - setbackFront - setbackRear)} 
                  fill="#4f46e5" 
                  fillOpacity="0.1" 
                  stroke="#4f46e5" 
                  strokeWidth="0.8" 
                />
              ) : (
                <rect 
                  x="15" 
                  y="15" 
                  width="70" 
                  height="70" 
                  fill="#4f46e5" 
                  fillOpacity="0.1" 
                  stroke="#4f46e5" 
                  strokeWidth="0.8" 
                />
              )}
              {/* Building Footprint area */}
              <rect 
                x="25" 
                y="25" 
                width={70 * (groundCoverage / 100)} 
                height="30" 
                fill="#818cf8" 
                fillOpacity="0.4" 
                stroke="#6366f1" 
                strokeWidth="1.2" 
              />
              <text x="50" y="55" textAnchor="middle" fontSize="5" className="fill-zinc-400 font-sans font-bold">Planned Footprint</text>
            </svg>
          </div>
        </div>

        {/* SVG Vertical Floors Stack */}
        <div className="md:col-span-6 p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block border-b border-zinc-150 dark:border-zinc-850 pb-2">Vertical Floors Stack</h3>
          
          <div className="w-full h-56 bg-zinc-50/50 dark:bg-zinc-950/20 rounded-2xl flex items-center justify-center p-4">
            <svg className="w-48 h-48" viewBox="0 0 100 100">
              {/* Ground Soil level */}
              <line x1="2" y1="90" x2="98" y2="90" stroke="#888" strokeWidth="2" />
              {/* Floors boxes loop */}
              {Array.from({ length: Math.min(10, plannedFloors.length) }).map((_, idx) => {
                const floorY = 90 - (idx + 1) * 8;
                return (
                  <g key={idx}>
                    <rect 
                      x="25" 
                      y={floorY} 
                      width="50" 
                      height="7.5" 
                      fill="url(#floorGrad)" 
                      stroke="#4f46e5" 
                      strokeWidth="0.8" 
                    />
                    <text x="50" y={floorY + 5.5} textAnchor="middle" fontSize="3.5" className="fill-white font-sans font-bold">Lvl {idx + 1}</text>
                  </g>
                );
              })}
              {plannedFloors.length > 10 && (
                <text x="50" y="5" textAnchor="middle" fontSize="4.5" className="fill-indigo-650 font-bold font-mono">+ {plannedFloors.length - 10} More levels</text>
              )}
              <defs>
                <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#4f46e5" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* FLOOR AREA PLANNER TABLE */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-150 dark:border-zinc-850 pb-3">
          <div className="space-y-1">
            <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-indigo-500" />
              <span>Floor Area Planner (DCPR clearances)</span>
            </h3>
            <p className="text-[10px] text-zinc-450 dark:text-zinc-500 font-medium">Verify custom planned areas per level to check utilization cap</p>
          </div>
          <button
            onClick={addFloor}
            className="px-3 py-1.5 bg-indigo-500/10 text-indigo-650 text-[10px] font-extrabold rounded-lg flex items-center gap-1 border border-indigo-500/20"
          >
            <Plus className="w-3.5 h-3.5" /> Add Floor
          </button>
        </div>

        {/* Planned floors layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
            {plannedFloors.map((floor) => (
              <div key={floor.id} className="flex justify-between items-center gap-3 p-3 rounded-2xl bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-150 dark:border-zinc-850">
                <input
                  type="text"
                  value={floor.name}
                  onChange={(e) => {
                    const updated = plannedFloors.map(f => f.id === floor.id ? { ...f, name: e.target.value } : f);
                    setPlannedFloors(updated);
                  }}
                  className="bg-transparent font-bold text-xs text-zinc-800 dark:text-white focus:outline-none border-b border-transparent focus:border-indigo-500"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={floor.area}
                    onChange={(e) => updateFloorArea(floor.id, Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-24 px-2 py-1 text-right text-xs font-bold border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg focus:outline-none font-mono"
                  />
                  <span className="text-[9px] font-bold text-zinc-400">{unit}</span>
                  <button onClick={() => removeFloor(floor.id)} className="text-rose-500 p-1 hover:bg-rose-50 rounded" title="Delete Floor">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Planned summary indicators */}
          <div className="p-5 rounded-3xl bg-zinc-50/40 dark:bg-zinc-950/10 border border-zinc-200 dark:border-zinc-850 space-y-4">
            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Utilization statistics</span>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-xl">
                <span className="text-[9px] text-zinc-400 font-extrabold uppercase">Utilized Area</span>
                <div className="text-base font-black font-mono text-zinc-850 dark:text-zinc-150 mt-1">{Math.round(calculations.totalPlannedBuiltUp).toLocaleString()} {unit}</div>
              </div>
              <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-xl">
                <span className="text-[9px] text-zinc-400 font-extrabold uppercase">Utilization %</span>
                <div className={`text-base font-black font-mono mt-1 ${calculations.utilizedFsi > permissibleFsi ? 'text-rose-500' : 'text-emerald-500'}`}>{calculations.fsiUtilizationPercentage}%</div>
              </div>
            </div>

            <div className="space-y-2 text-xs border-t border-zinc-200 dark:border-zinc-800 pt-3 text-zinc-550">
              <div className="flex justify-between">
                <span>Maximum Allowed Area:</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">{Math.round(calculations.permissibleBuiltUp).toLocaleString()} {unit}</span>
              </div>
              <div className="flex justify-between">
                <span>Remaining built-up capacity:</span>
                <span className={`font-bold ${calculations.remainingBuiltUp < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{Math.round(calculations.remainingBuiltUp).toLocaleString()} {unit}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LOCATION PRESETS MANAGER */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block border-b border-zinc-150 dark:border-zinc-850 pb-2">Local Regulation Presets</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-zinc-400">Select State</label>
            <select
              value={statePreset}
              onChange={(e) => { setStatePreset(e.target.value); setCityPreset(e.target.value === 'maharashtra' ? 'mumbai' : e.target.value); }}
              className="w-full p-2 border border-zinc-200 dark:border-zinc-800 rounded bg-transparent text-xs font-bold focus:outline-none"
            >
              <option value="maharashtra">Maharashtra</option>
              <option value="delhi">Delhi</option>
              <option value="karnataka">Karnataka</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-zinc-400">Select City</label>
            <select
              value={cityPreset}
              onChange={(e) => setCityPreset(e.target.value)}
              className="w-full p-2 border border-zinc-200 dark:border-zinc-800 rounded bg-transparent text-xs font-bold focus:outline-none"
            >
              {statePreset === 'maharashtra' ? (
                <>
                  <option value="mumbai">Mumbai</option>
                  <option value="pune">Pune</option>
                </>
              ) : statePreset === 'delhi' ? (
                <option value="delhi">Delhi</option>
              ) : (
                <option value="bengaluru">Bengaluru</option>
              )}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-zinc-400">Select Land Use Zone</label>
            <select
              value={zonePreset}
              onChange={(e) => setZonePreset(e.target.value)}
              className="w-full p-2 border border-zinc-200 dark:border-zinc-800 rounded bg-transparent text-xs font-bold focus:outline-none"
            >
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
            </select>
          </div>

          <div className="self-end">
            <button
              onClick={applyPreset}
              className="w-full py-2 bg-indigo-650 text-white text-xs font-extrabold rounded-lg"
            >
              Apply Regulation FSI ({activePreset?.fsi})
            </button>
          </div>
        </div>

        {activePreset && (
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-150 dark:border-zinc-850 text-xs text-zinc-600 space-y-2">
            <div className="flex justify-between">
              <span>Municipal Authority: <strong>{activePreset.authority}</strong></span>
              <span>Codebook: <strong>{activePreset.doc}</strong></span>
            </div>
            <div className="flex justify-between">
              <span>Last verified: <strong>{activePreset.verified}</strong></span>
              <span>Prescribed FSI: <strong className="text-indigo-650">{activePreset.fsi}</strong></span>
            </div>
            <p className="text-[10px] text-zinc-450 dark:text-zinc-500 italic mt-1">Note: {activePreset.notes}</p>
          </div>
        )}
      </div>

      {/* SCENARIO COMPARISON PANEL */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-850 pb-2">
          <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-indigo-500" />
            <span>Scenario Comparison Desk</span>
          </h3>
          <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-650 cursor-pointer">
            <input
              type="checkbox"
              checked={enableComparison}
              onChange={(e) => setEnableComparison(e.target.checked)}
              className="rounded border-zinc-300 text-indigo-650"
            />
            <span>Enable Comparison</span>
          </label>
        </div>

        {enableComparison && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-850 space-y-3 bg-zinc-50/50 dark:bg-zinc-950/20">
                <div className="text-xs font-bold text-zinc-800">Scenario A Parameters</div>
                <div>
                  <label className="text-[9px] text-zinc-400 font-bold block uppercase">Permissible FSI</label>
                  <input type="number" step="0.1" value={compFsiA} onChange={(e) => setCompFsiA(e.target.value)} className="w-full p-2 border border-zinc-200 dark:border-zinc-800 rounded text-xs font-mono font-bold" />
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-850 space-y-3 bg-zinc-50/50 dark:bg-zinc-950/20">
                <div className="text-xs font-bold text-zinc-800">Scenario B Parameters</div>
                <div>
                  <label className="text-[9px] text-zinc-400 font-bold block uppercase">Permissible FSI</label>
                  <input type="number" step="0.1" value={compFsiB} onChange={(e) => setCompFsiB(e.target.value)} className="w-full p-2 border border-zinc-200 dark:border-zinc-800 rounded text-xs font-mono font-bold" />
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-850 space-y-3 bg-zinc-50/50 dark:bg-zinc-950/20">
                <div className="text-xs font-bold text-zinc-800">Scenario C Parameters</div>
                <div>
                  <label className="text-[9px] text-zinc-400 font-bold block uppercase">Permissible FSI</label>
                  <input type="number" step="0.1" value={compFsiC} onChange={(e) => setCompFsiC(e.target.value)} className="w-full p-2 border border-zinc-200 dark:border-zinc-800 rounded text-xs font-mono font-bold" />
                </div>
              </div>
            </div>

            {/* Comparison results side by side layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-3 text-xs font-mono">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 space-y-2">
                <div className="font-extrabold uppercase text-zinc-400">Scenario A Results</div>
                <div>Max built-up Area: {comparisonResults.scenarioA.maxBuiltUp.toLocaleString()} {unit}</div>
                <div>Ground footprint: {comparisonResults.scenarioA.footprint.toLocaleString()} {unit}</div>
                <div>Estimated Floors: {comparisonResults.scenarioA.estFloors} levels</div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 space-y-2">
                <div className="font-extrabold uppercase text-zinc-400">Scenario B Results</div>
                <div>Max built-up Area: {comparisonResults.scenarioB.maxBuiltUp.toLocaleString()} {unit}</div>
                <div>Ground footprint: {comparisonResults.scenarioB.footprint.toLocaleString()} {unit}</div>
                <div>Estimated Floors: {comparisonResults.scenarioB.estFloors} levels</div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 space-y-2">
                <div className="font-extrabold uppercase text-zinc-400">Scenario C Results</div>
                <div>Max built-up Area: {comparisonResults.scenarioC.maxBuiltUp.toLocaleString()} {unit}</div>
                <div>Ground footprint: {comparisonResults.scenarioC.footprint.toLocaleString()} {unit}</div>
                <div>Estimated Floors: {comparisonResults.scenarioC.estFloors} levels</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* EXPORTS DOCK ACTIONS */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block border-b border-zinc-150 dark:border-zinc-850 pb-2">Export Building Reports</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={copyResultsText}
            className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedReport ? 'Report Copied' : 'Copy Audit Summary'}</span>
          </button>
          <button
            onClick={exportCSV}
            className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Download Floor CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* CALCULATION HISTORY */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-850 pb-2">
          <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block">Local Calculation History</h3>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={newHistoryName}
              onChange={(e) => setNewHistoryName(e.target.value)}
              className="px-2 py-1 border rounded text-xs focus:outline-none"
              placeholder="Name this scenario..."
            />
            <button
              onClick={saveCalculationToHistory}
              className="px-3 py-1 bg-indigo-650 text-white text-[10px] font-bold rounded"
            >
              Save Current
            </button>
          </div>
        </div>

        {historyList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {historyList.map((item) => (
              <div key={item.id} className="p-3.5 rounded-2xl border border-zinc-150 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-950/20 text-xs flex justify-between items-start">
                <div className="space-y-1">
                  <div className="font-extrabold text-zinc-800 dark:text-zinc-200">{item.name}</div>
                  <div className="text-[10px] text-zinc-450 dark:text-zinc-500">
                    Plot: {item.plotArea} {item.unit} | FSI: {item.fsi}
                  </div>
                  <div className="text-[9px] text-zinc-400">{item.timestamp}</div>
                </div>
                <button onClick={() => deleteHistoryItem(item.id)} className="text-rose-500 hover:underline text-[10px]">Delete</button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-450 italic text-center py-4">No saved scenarios yet.</p>
        )}
      </div>

      {/* Explainer / Informational bylaws notice */}
      <div className="p-5 rounded-3xl bg-zinc-50/40 dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-800/80 space-y-4">
        <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-250 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-150 dark:border-zinc-850 pb-2">
          <Info className="w-4 h-4 text-indigo-505" />
          <span>What This Calculator Does NOT Determine</span>
        </h4>
        <p className="text-xs leading-relaxed text-zinc-550 dark:text-zinc-400">
          ⚠️ <strong>Crucial Bylaws Notice:</strong> Floor Area Ratio (FAR) and Floor Space Index (FSI) restrictions represent only a single layer of municipal planning compliance. Actual building permissions and legal approvability depend on several other overlapping metrics:
        </p>
        <ul className="list-disc pl-5 text-xs text-zinc-500 space-y-1.5 leading-relaxed">
          <li><strong>Setbacks Clearance</strong>: Mandatory open boundaries left vacant on the front, rear, and side limits of the building.</li>
          <li><strong>Road Width limits</strong>: Many municipal authorities tie the permissible height and FSI directly to the front road width.</li>
          <li><strong>Zoning classifications</strong>: Commercial, Residential, mixed-use, agricultural, and industrial land allocations have unique density rules.</li>
          <li><strong>Height limits & Aviation clearances</strong>: Close proximity to airports or defense installations can strictly limit the height regardless of available FSI.</li>
        </ul>
      </div>
    </div>
  );
}

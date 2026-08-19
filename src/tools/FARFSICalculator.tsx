import { useState, useEffect } from 'react';
import { 
  Copy, Check, Info, ShieldCheck, RotateCcw, Building2, 
  Trash2, Plus, ChevronRight, ChevronDown, AlertTriangle, 
  Printer, BookOpen, Sliders
} from 'lucide-react';

type UnitType = 'sqft' | 'sqm';

interface FloorRow {
  id: string;
  name: string;
  area: number;
}

export default function FARFSICalculator() {
  const [step, setStep] = useState<number>(1);
  const [unit, setUnit] = useState<UnitType>('sqft');
  
  // Inputs
  const [plotArea, setPlotArea] = useState<number>(2000);
  const [plotLength, setPlotLength] = useState<string>('50');
  const [plotWidth, setPlotWidth] = useState<string>('40');
  const [permissibleFsi, setPermissibleFsi] = useState<number>(2.0);
  
  // Floor list
  const [floors, setFloors] = useState<FloorRow[]>([
    { id: '1', name: 'Ground Floor', area: 1000 },
    { id: '2', name: 'First Floor', area: 1000 },
    { id: '3', name: 'Second Floor', area: 900 },
    { id: '4', name: 'Third Floor', area: 750 }
  ]);

  // UI state
  const [copied, setCopied] = useState<boolean>(false);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Real-time validations
  useEffect(() => {
    const errors: Record<string, string> = {};
    if (plotArea <= 0) {
      errors.plotArea = 'Plot area must be greater than 0.';
    }
    if (permissibleFsi <= 0) {
      errors.permissibleFsi = 'Permissible FAR/FSI must be greater than 0.';
    }
    floors.forEach((f) => {
      if (f.area < 0) {
        errors[`floor_${f.id}`] = 'Floor area cannot be negative.';
      }
      if (f.area > plotArea && plotArea > 0) {
        errors[`floor_${f.id}_warn`] = 'Warning: Floor area exceeds total plot area.';
      }
    });
    setValidationErrors(errors);
  }, [plotArea, permissibleFsi, floors]);

  // Handle Length / Width changes
  const handleLengthWidthChange = (val: string, type: 'length' | 'width') => {
    const numericVal = parseFloat(val) || 0;
    if (type === 'length') {
      setPlotLength(val);
      const w = parseFloat(plotWidth) || 0;
      if (numericVal > 0 && w > 0) {
        setPlotArea(Math.round(numericVal * w));
      }
    } else {
      setPlotWidth(val);
      const l = parseFloat(plotLength) || 0;
      if (numericVal > 0 && l > 0) {
        setPlotArea(Math.round(numericVal * l));
      }
    }
  };

  // Handle direct Plot Area change
  const handlePlotAreaChange = (val: number) => {
    setPlotArea(val);
    if (val > 0) {
      // Set symmetric dimensions
      const side = Math.sqrt(val);
      setPlotLength(side.toFixed(1));
      setPlotWidth(side.toFixed(1));
    } else {
      setPlotLength('');
      setPlotWidth('');
    }
  };

  // Convert values when unit changes
  const handleUnitSwitch = (newUnit: UnitType) => {
    if (newUnit === unit) return;

    const areaFactor = newUnit === 'sqft' ? 10.7639 : 1 / 10.7639;
    const lenFactor = newUnit === 'sqft' ? 3.28084 : 1 / 3.28084;

    // Convert plot area
    const convertedArea = Math.round(plotArea * areaFactor);
    setPlotArea(convertedArea);

    // Convert dimensions
    const l = parseFloat(plotLength);
    const w = parseFloat(plotWidth);
    if (!isNaN(l)) setPlotLength((l * lenFactor).toFixed(1));
    if (!isNaN(w)) setPlotWidth((w * lenFactor).toFixed(1));

    // Convert all floors
    const updatedFloors = floors.map((f) => ({
      ...f,
      area: Math.round(f.area * areaFactor)
    }));
    setFloors(updatedFloors);
    setUnit(newUnit);
  };

  // Dynamic floor management
  const addFloorRow = () => {
    const nextNum = floors.length + 1;
    let name = '';
    if (nextNum === 1) name = 'Ground Floor';
    else if (nextNum === 2) name = 'First Floor';
    else if (nextNum === 3) name = 'Second Floor';
    else if (nextNum === 4) name = 'Third Floor';
    else name = `${nextNum}th Floor`;

    const newRow: FloorRow = {
      id: Date.now().toString(),
      name,
      area: floors.length > 0 ? floors[floors.length - 1].area : 1000
    };
    setFloors([...floors, newRow]);
  };

  const removeFloorRow = (id: string) => {
    setFloors(floors.filter((f) => f.id !== id));
  };

  const updateFloorArea = (id: string, val: number) => {
    setFloors(floors.map((f) => (f.id === id ? { ...f, area: val } : f)));
  };

  // Load quick example
  const loadExample = () => {
    setUnit('sqft');
    setPlotArea(2000);
    setPlotLength('50');
    setPlotWidth('40');
    setPermissibleFsi(2.0);
    setFloors([
      { id: '1', name: 'Ground Floor', area: 1000 },
      { id: '2', name: 'First Floor', area: 1000 },
      { id: '3', name: 'Second Floor', area: 900 },
      { id: '4', name: 'Third Floor', area: 750 }
    ]);
    setStep(3);
  };

  // Reset to default
  const handleReset = () => {
    setPlotArea(2000);
    setPlotLength('50');
    setPlotWidth('40');
    setPermissibleFsi(2.0);
    setFloors([
      { id: '1', name: 'Ground Floor', area: 1000 },
      { id: '2', name: 'First Floor', area: 1000 },
      { id: '3', name: 'Second Floor', area: 900 },
      { id: '4', name: 'Third Floor', area: 750 }
    ]);
    setValidationErrors({});
    setStep(1);
  };

  // Calculate results
  const totalProposedBuiltup = floors.reduce((sum, f) => sum + (f.area || 0), 0);
  const maxPermissibleArea = plotArea * permissibleFsi;
  const utilizedFsi = plotArea > 0 ? Number((totalProposedBuiltup / plotArea).toFixed(3)) : 0;
  const remainingArea = maxPermissibleArea - totalProposedBuiltup;
  const utilizationPercentage = maxPermissibleArea > 0 ? (totalProposedBuiltup / maxPermissibleArea) * 100 : 0;

  // Compliance checker
  const isOverLimit = totalProposedBuiltup > maxPermissibleArea;
  const isExactLimit = Math.abs(totalProposedBuiltup - maxPermissibleArea) < 0.1;

  // Copy report
  const copyReportToClipboard = () => {
    const areaUnit = unit === 'sqft' ? 'sq.ft' : 'sq.m';
    const text = `Floor Area Ratio (FAR) / Floor Space Index (FSI) Report
--------------------------------------------------
Plot Parameters:
- Plot Area: ${plotArea.toLocaleString()} ${areaUnit} (Dimensions: ${plotLength} x ${plotWidth})
- Permissible FAR/FSI: ${permissibleFsi.toFixed(2)}
- Max Permissible Built-up Area: ${maxPermissibleArea.toLocaleString()} ${areaUnit}

Proposed Parameters:
${floors.map((f) => `- ${f.name}: ${f.area.toLocaleString()} ${areaUnit}`).join('\n')}
- Total Proposed Area: ${totalProposedBuiltup.toLocaleString()} ${areaUnit}

Compliance Audit:
- FAR/FSI Used: ${utilizedFsi}
- Utilization: ${utilizationPercentage.toFixed(2)}%
- Remaining Limit: ${remainingArea.toLocaleString()} ${areaUnit}
- Status: ${
      isOverLimit 
        ? `Exceeds limits by ${Math.abs(remainingArea).toLocaleString()} ${areaUnit}` 
        : isExactLimit 
        ? 'FAR/FSI Fully Utilized' 
        : 'Within FAR/FSI Limit'
    }

Generated at: Toolique India FAR/FSI Calculator`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-left py-4 px-2 select-none">
      
      {/* 3-STEP WIZARD PROGRESS CARD & RESET / EXAMPLE BUTTONS */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="grid grid-cols-3 gap-2 flex-1 w-full">
          {[
            { id: 1, name: "1. Site Details" },
            { id: 2, name: "2. Proposed Area" },
            { id: 3, name: "3. Results Audit" }
          ].map((s) => {
            const isCompleted = s.id < step;
            const isActive = s.id === step;
            return (
              <button
                key={s.id}
                onClick={() => setStep(s.id)}
                className="flex flex-col items-start gap-1 p-2 rounded-xl text-left transition duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-1.5 w-full">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition ${
                    isCompleted 
                      ? 'bg-indigo-500 border-indigo-500 text-white' 
                      : isActive 
                      ? 'bg-indigo-500/10 border-indigo-500 text-indigo-500' 
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-550'
                  }`}>
                    {isCompleted ? '✓' : s.id}
                  </div>
                  <div className="h-0.5 flex-1 bg-zinc-100 dark:bg-zinc-800 hidden md:block">
                    <div className={`h-full bg-indigo-500 transition-all ${isCompleted ? 'w-full' : 'w-0'}`} />
                  </div>
                </div>
                <span className={`text-[10px] font-bold truncate w-full ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-500 dark:text-zinc-400'}`}>
                  {s.name}
                </span>
              </button>
            );
          })}
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={loadExample}
            className="flex-1 md:flex-initial flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-900/40 rounded-xl transition cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Try an Example</span>
          </button>
          
          <button
            onClick={handleReset}
            className="flex-1 md:flex-initial flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-850 dark:text-zinc-400 dark:hover:text-white bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* CALCULATOR INTERFACE */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* STEP 1: SITE DETAILS */}
        {step === 1 && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 rounded-2xl shadow-sm space-y-6 animate-fadeIn">
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3 flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-zinc-800 dark:text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-500" />
                  1. Site Details
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Specify the dimension boundaries of the plot and the target municipal Floor Space Index clearance limit.
                </p>
              </div>
              <div className="flex bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-zinc-200/40">
                {(['sqft', 'sqm'] as const).map((u) => (
                  <button
                    key={u}
                    onClick={() => handleUnitSwitch(u)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition uppercase cursor-pointer ${
                      unit === u ? 'bg-white dark:bg-zinc-900 text-indigo-500 shadow-sm' : 'text-zinc-400'
                    }`}
                  >
                    {u === 'sqft' ? 'sq.ft' : 'sq.m'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Left Form Inputs */}
              <div className="md:col-span-7 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1.5">Plot Length ({unit === 'sqft' ? 'ft' : 'm'})</label>
                    <input
                      type="number"
                      placeholder="e.g. 50"
                      value={plotLength}
                      onChange={(e) => handleLengthWidthChange(e.target.value, 'length')}
                      className="saas-input py-2 font-semibold font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1.5">Plot Width ({unit === 'sqft' ? 'ft' : 'm'})</label>
                    <input
                      type="number"
                      placeholder="e.g. 40"
                      value={plotWidth}
                      onChange={(e) => handleLengthWidthChange(e.target.value, 'width')}
                      className="saas-input py-2 font-semibold font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1.5">Plot Area ({unit === 'sqft' ? 'sq.ft' : 'sq.m'})</label>
                    <input
                      type="number"
                      value={plotArea || ''}
                      onChange={(e) => handlePlotAreaChange(Math.max(0, parseInt(e.target.value) || 0))}
                      className="saas-input py-2 font-semibold font-mono"
                    />
                  </div>
                </div>

                {validationErrors.plotArea && (
                  <p className="text-rose-500 text-[10px] font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {validationErrors.plotArea}
                  </p>
                )}

                <div>
                  <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1.5">Permissible FAR / FSI</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    placeholder="e.g. 2.00"
                    value={permissibleFsi || ''}
                    onChange={(e) => setPermissibleFsi(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="saas-input py-2 font-semibold font-mono"
                  />
                  {validationErrors.permissibleFsi && (
                    <p className="text-rose-500 text-[10px] font-bold flex items-center gap-1 mt-1">
                      <AlertTriangle className="w-3 h-3" />
                      {validationErrors.permissibleFsi}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Formula & Visual Guide */}
              <div className="md:col-span-5 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 p-5 rounded-2xl flex flex-col justify-between">
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Calculations Formula</h4>
                  <div className="font-mono text-xs font-bold text-zinc-800 dark:text-zinc-300 py-2 border-b border-indigo-100/40">
                    FAR / FSI = Total Built-up Area ÷ Plot Area
                  </div>
                  <p className="text-[10px] text-zinc-500 leading-relaxed pt-1">
                    Your maximum buildable gross floor area limits represent the product of your plot size multiplied by the allowed local development index ratio.
                  </p>
                </div>
                
                <div className="pt-4 border-t border-indigo-100/40 mt-3 text-right">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">Max Permissible built area</span>
                  <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-mono">
                    {maxPermissibleArea.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-zinc-500 ml-1">{unit === 'sqft' ? 'sq.ft' : 'sq.m'}</span>
                </div>
              </div>

            </div>

            {/* Stepper Navigation */}
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-5 flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!!validationErrors.plotArea || !!validationErrors.permissibleFsi}
                className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-sm hover:shadow-indigo-500/20 rounded-xl transition duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Add Proposed Floors</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PROPOSED DEVELOPMENT */}
        {step === 2 && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 rounded-2xl shadow-sm space-y-6 animate-fadeIn">
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h2 className="text-lg font-bold text-zinc-800 dark:text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-500" />
                2. Proposed Development
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Enter building floor sizes. Values are dynamically calculated to ensure zoning compliance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Floor Rows list */}
              <div className="md:col-span-8 space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold">
                        <th className="py-2.5 pl-2">Floor Index Name</th>
                        <th className="py-2.5">Floor Area ({unit === 'sqft' ? 'sq.ft' : 'sq.m'})</th>
                        <th className="py-2.5 text-right pr-2">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-semibold">
                      {floors.map((row) => (
                        <tr key={row.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                          <td className="py-3 pl-2">
                            <input
                              type="text"
                              value={row.name}
                              onChange={(e) => {
                                const updated = floors.map(f => f.id === row.id ? { ...f, name: e.target.value } : f);
                                setFloors(updated);
                              }}
                              className="bg-transparent font-bold text-zinc-700 dark:text-zinc-200 focus:outline-none border-b border-transparent focus:border-indigo-500 py-0.5"
                            />
                          </td>
                          <td className="py-2">
                            <div className="space-y-1">
                              <input
                                type="number"
                                value={row.area || ''}
                                onChange={(e) => updateFloorArea(row.id, Math.max(0, parseInt(e.target.value) || 0))}
                                className="saas-input py-1 px-2.5 font-mono max-w-[160px] font-bold"
                              />
                              {validationErrors[`floor_${row.id}`] && (
                                <p className="text-rose-500 text-[9px] font-bold block">{validationErrors[`floor_${row.id}`]}</p>
                              )}
                              {validationErrors[`floor_${row.id}_warn`] && (
                                <p className="text-amber-500 text-[9px] font-bold block">{validationErrors[`floor_${row.id}_warn`]}</p>
                              )}
                            </div>
                          </td>
                          <td className="py-3 text-right pr-2">
                            <button
                              onClick={() => removeFloorRow(row.id)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-500/5 transition cursor-pointer"
                              title="Delete Floor"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  onClick={addFloorRow}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-indigo-600 hover:text-white bg-indigo-500/5 hover:bg-indigo-500 border border-indigo-100 dark:border-indigo-900/30 rounded-xl transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Floor</span>
                </button>
              </div>

              {/* Running summary box */}
              <div className="md:col-span-4 bg-zinc-50 dark:bg-zinc-900/60 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
                <div>
                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-3">Live Summary Breakdown</h4>
                  <div className="space-y-2 text-xs">
                    {floors.map((f) => (
                      <div key={f.id} className="flex justify-between font-mono">
                        <span className="text-zinc-500 truncate max-w-[140px]">{f.name}</span>
                        <span className="font-bold text-zinc-700 dark:text-zinc-300">{(f.area || 0).toLocaleString()} {unit === 'sqft' ? 'sq.ft' : 'sq.m'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-zinc-200 dark:border-zinc-850 pt-4 mt-4 flex justify-between items-center">
                  <span className="text-xs font-bold text-zinc-500">Total Area</span>
                  <div className="text-right">
                    <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                      {totalProposedBuiltup.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400 ml-1 uppercase">{unit === 'sqft' ? 'sq.ft' : 'sq.m'}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Stepper Navigation */}
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-5 flex justify-between items-center">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition"
              >
                <span>Back</span>
              </button>
              
              <button
                onClick={() => setStep(3)}
                className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-sm hover:shadow-indigo-500/20 rounded-xl transition duration-200 cursor-pointer"
              >
                <span>View Results Audit</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: RESULTS AUDIT */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* RESULTS DASHBOARD SUMMARY CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Max Permissible Area</span>
                <div className="text-xl md:text-2xl font-black text-zinc-800 dark:text-white font-mono tracking-tight leading-tight">
                  {maxPermissibleArea.toLocaleString()}
                </div>
                <span className="text-[10px] text-zinc-400 uppercase block font-mono">
                  {permissibleFsi} FAR/FSI x {plotArea.toLocaleString()}
                </span>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Proposed Built-up Area</span>
                <div className="text-xl md:text-2xl font-black text-zinc-800 dark:text-white font-mono tracking-tight leading-tight">
                  {totalProposedBuiltup.toLocaleString()}
                </div>
                <span className="text-[10px] text-zinc-400 uppercase block font-mono">
                  Sum of {floors.length} Floors
                </span>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">FAR / FSI Used</span>
                <div className="text-xl md:text-2xl font-black text-zinc-800 dark:text-white font-mono tracking-tight leading-tight">
                  {utilizedFsi}
                </div>
                <span className="text-[10px] text-zinc-400 uppercase block font-mono">
                  Utilized Index Limit
                </span>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Remaining Area</span>
                <div className={`text-xl md:text-2xl font-black font-mono tracking-tight leading-tight ${isOverLimit ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {remainingArea.toLocaleString()}
                </div>
                <span className="text-[10px] text-zinc-400 uppercase block font-mono">
                  {isOverLimit ? 'Exceeded limit' : 'Under permissible limit'}
                </span>
              </div>
            </div>

            {/* ACTION PANEL */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-850 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                  <span>Modify Configuration</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copyReportToClipboard}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 text-zinc-600 dark:text-zinc-300 transition duration-200 cursor-pointer active:scale-95"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Report Copied!' : 'Copy Results'}</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-zinc-500 hover:text-zinc-850 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 transition duration-200 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Report</span>
                </button>
              </div>
            </div>

            {/* AUDIT COMPLIANCE & VISUAL PROGRESS */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm space-y-6">
              
              {/* Compliance status banner */}
              <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-bold ${
                isOverLimit 
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400' 
                  : isExactLimit 
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400' 
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              }`}>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <div>
                    <span className="block font-black text-sm uppercase">
                      {isOverLimit ? '⚠ FAR / FSI Limit Exceeded' : isExactLimit ? '✓ FAR / FSI Fully Utilized' : '✓ Within FAR / FSI Limit'}
                    </span>
                    <span className="text-[10px] font-semibold text-zinc-500 block mt-0.5">
                      {isOverLimit 
                        ? `Maximum Allowed: ${maxPermissibleArea.toLocaleString()} | Proposed: ${totalProposedBuiltup.toLocaleString()} | Excess: ${Math.abs(remainingArea).toLocaleString()} ${unit === 'sqft' ? 'sq.ft' : 'sq.m'}`
                        : `Your layout complies with permissible municipal floor ratios.`
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-zinc-500">FAR / FSI Utilization</span>
                  <span className="font-mono font-black text-zinc-800 dark:text-white">{utilizationPercentage.toFixed(2)}%</span>
                </div>
                
                <div className="w-full h-4 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden relative border border-zinc-200/20">
                  <div 
                    className={`h-full transition-all duration-300 ${isOverLimit ? 'bg-rose-500' : 'bg-indigo-500'}`} 
                    style={{ width: `${Math.min(100, utilizationPercentage)}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                  <span>0 / {maxPermissibleArea.toLocaleString()}</span>
                  <span>{totalProposedBuiltup.toLocaleString()} {unit === 'sqft' ? 'sq.ft' : 'sq.m'} Utilized</span>
                </div>
              </div>

            </div>

            {/* SUMMARY TABLE OF ALL FLOORS */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">Floor Built-up Area Schedule</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold">
                      <th className="py-2.5 pl-2">Floor</th>
                      <th className="py-2.5 text-right pr-2">Built-up Area</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-semibold text-zinc-650 dark:text-zinc-300">
                    {floors.map((row) => (
                      <tr key={row.id}>
                        <td className="py-3 pl-2">{row.name}</td>
                        <td className="py-3 text-right pr-2 font-mono text-zinc-700 dark:text-zinc-250">
                          {row.area.toLocaleString()} {unit === 'sqft' ? 'sq.ft' : 'sq.m'}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-zinc-50 dark:bg-zinc-800/50 font-black border-t border-zinc-200 dark:border-zinc-700">
                      <td className="py-3 pl-2 text-zinc-800 dark:text-white">Total proposed Area</td>
                      <td className="py-3 text-right pr-2 font-mono text-indigo-600 dark:text-indigo-400">
                        {totalProposedBuiltup.toLocaleString()} {unit === 'sqft' ? 'sq.ft' : 'sq.m'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* COLLAPSIBLE EXPLANATION SECTION */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                className="w-full flex justify-between items-center font-bold text-sm text-zinc-800 dark:text-zinc-300 cursor-pointer select-none"
              >
                <div className="flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-indigo-500" />
                  <span>How is this calculated?</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${showExplanation ? 'rotate-180' : ''}`} />
              </button>

              {showExplanation && (
                <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-350 space-y-3 leading-relaxed animate-fadeIn">
                  <p>
                    Floor Area Ratio (FAR) or Floor Space Index (FSI) calculations determine the maximum amount of usable space that can be legally constructed on a plot.
                  </p>
                  
                  <div className="space-y-2 p-3 bg-zinc-50 dark:bg-zinc-850/50 rounded-xl font-mono text-[11px] text-zinc-700 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-800/50">
                    <div>
                      1. Permissible Building Area Limit:<br />
                      &nbsp;&nbsp;&nbsp;{permissibleFsi.toFixed(2)} (FSI limit) × {plotArea.toLocaleString()} (Plot Size) = <span className="font-bold text-indigo-500">{maxPermissibleArea.toLocaleString()} {unit === 'sqft' ? 'sq.ft' : 'sq.m'}</span>
                    </div>
                    <div className="mt-2">
                      2. Actual Utilized Index:<br />
                      &nbsp;&nbsp;&nbsp;{totalProposedBuiltup.toLocaleString()} (Total Proposed Area) ÷ {plotArea.toLocaleString()} (Plot Size) = <span className="font-bold text-indigo-500">{utilizedFsi}</span>
                    </div>
                    <div className="mt-2">
                      3. Remaining Area Limit:<br />
                      &nbsp;&nbsp;&nbsp;{maxPermissibleArea.toLocaleString()} - {totalProposedBuiltup.toLocaleString()} = <span className={`font-bold ${isOverLimit ? 'text-rose-500' : 'text-emerald-500'}`}>{remainingArea.toLocaleString()} {unit === 'sqft' ? 'sq.ft' : 'sq.m'}</span>
                    </div>
                  </div>

                  <p>
                    If the Utilized FSI is higher than the Permissible FSI, your building configuration is considered non-compliant and requires FSI reduction or purchase of paid premium FSI keys from local development offices.
                  </p>
                </div>
              )}
            </div>

            {/* IMPORTANT DISCLAIMER */}
            <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl flex gap-3 text-[10px] text-zinc-500 leading-relaxed font-semibold">
              <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              <p>
                <strong>Important Disclaimer:</strong> FAR/FSI rules vary by location, land use, plot characteristics, road width, and applicable development regulations. This calculator provides a planning estimate and should not be treated as final municipal approval. Verify applicable local regulations before construction or approval submission.
              </p>
            </div>

          </div>
        )}

      </div>

      {/* ================================================== */}
      {/* SEO & FAQ ACCORDION SECTION */}
      {/* ================================================== */}
      <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 rounded-2xl shadow-sm space-y-6">
        <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <h2 className="text-xl font-bold text-zinc-800 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-500" />
            Understanding FAR & FSI: Calculations and Bylaws
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Learn how Floor Area Ratio (FAR) and Floor Space Index (FSI) define permissible built-up density, municipal zoning exemptions, and road width limits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-zinc-600 dark:text-zinc-350 leading-relaxed font-semibold">
          <div className="space-y-4">
            <h3 className="font-bold text-zinc-800 dark:text-zinc-250 text-sm">How is FAR / FSI Calculated?</h3>
            <p>
              Floor Space Index (FSI), also known as Floor Area Ratio (FAR), is the ratio of the total built-up area of a building across all floors to the total area of the plot it stands on. 
              The formula is simple:
            </p>
            <div className="bg-zinc-50 dark:bg-zinc-800/40 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800/60 font-mono text-[10px] text-zinc-800 dark:text-zinc-350">
              FSI = Total Built-up Area (All Floors) / Plot Area
            </div>
            <p>
              For example, if you own a plot of 2,000 sq. ft. and the permissible FSI in your zone is 1.5, the maximum gross floor area you are allowed to build across all levels is 3,000 sq. ft. You can choose to design a 2-story building with 1,500 sq. ft. per floor, or a 3-story building with 1,000 sq. ft. per floor, provided it complies with setbacks.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-zinc-800 dark:text-zinc-250 text-sm">Exemptions and Paid Premium FSI</h3>
            <p>
              In many Indian cities, certain areas are exempted from the FSI calculation (referred to as free-of-FSI spaces). These typically include basements dedicated purely to car parking, common lift shafts, staircases, utility duct lines, and sometimes open balconies up to a specific percentage.
            </p>
            <p>
              If your planned layout exceeds the basic permissible FSI, you can often purchase **Premium FSI** (or paid FSI) from the local municipal authority (like MCGM in Mumbai, DDA in Delhi, or BBMP in Bengaluru). The price is calculated as a percentage of the state land guidance value, allowing developers to add density where road infrastructure supports it.
            </p>
          </div>
        </div>

        {/* FAQs Accordion */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
          <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-300 mb-3">Frequently Asked Questions (FAQ)</h3>
          
          {[
            {
              q: "What is the difference between Floor Area Ratio (FAR) and Floor Space Index (FSI)?",
              a: "Mathematically, they are identical. FSI is expressed as a ratio (e.g., 1.5 or 2.0), whereas FAR is expressed as a decimal or percentage (e.g., 150 or 200). An FSI of 2.0 corresponds to a FAR of 200%."
            },
            {
              q: "How does road width affect the permissible FAR / FSI?",
              a: "Local municipal bylaws link density limits to adjacent road widths to manage vehicular congestion and emergency evacuation safety. Wider roads allow fire trucks to turn safely, which is why municipal corporations grant higher basic or premium FSI to plots facing wider roads."
            },
            {
              q: "Are balconies and staircases counted in the FSI area?",
              a: "It depends heavily on the local municipal development bylaws. Most cities exclude structural staircases, elevators, and basement parking from FSI calculations. However, open balconies may be partially counted or exempted up to a fixed percentage (e.g., 10% of floor area) depending on whether you pay a premium fee."
            },
            {
              q: "What is Premium FSI or Paid FSI?",
              a: "Premium FSI is additional built-up area allowed over the basic permissible FSI on payment of a premium charge to the municipal corporation. It is normally allowed on plots facing roads wider than 9 meters (or 30 feet) and capped at 30% to 40% of the basic FSI."
            }
          ].map((faq, index) => (
            <details key={index} className="group border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 transition-all duration-200 font-semibold">
              <summary className="font-bold text-xs text-zinc-700 dark:text-zinc-300 hover:text-indigo-500 cursor-pointer list-none flex justify-between items-center select-none">
                <span>{faq.q}</span>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2.5 pl-1.5 border-l-2 border-indigo-500/40 font-semibold">
                {faq.a}
              </p>
            </details>
          ))}
        </div>

        {/* JSON-LD Schema markup for Google search optimization */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What is the difference between Floor Area Ratio (FAR) and Floor Space Index (FSI)?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "FAR and FSI represent the same built density limit. FSI is a decimal index (like 1.5) while FAR is a percentage (like 150%)."
                }
              },
              {
                "@type": "Question",
                "name": "How does road width affect the permissible FAR / FSI?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Wider adjacent roads support higher traffic loads, prompting municipal authorities to grant higher FSI or allow premium FSI purchase."
                }
              },
              {
                "@type": "Question",
                "name": "Are balconies and staircases counted in the FSI area?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Staircases, elevator shafts, and parking floors are commonly exempt. Balconies might be exempt up to a statutory limit or charged with premium fees."
                }
              }
            ]
          })}
        </script>
      </section>

    </div>
  );
}

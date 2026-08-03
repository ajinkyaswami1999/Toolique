import { useState } from 'react';
import { Copy, Check, Info, AlertTriangle, CheckCircle, Percent, LayoutGrid } from 'lucide-react';

type DensityType = 'high' | 'standard' | 'executive';
type UnitType = 'sqft' | 'sqm';

interface DensityConfig {
  label: string;
  factor: number; // sq ft per desk
  desc: string;
}

const DENSITY_PRESETS: Record<DensityType, DensityConfig> = {
  high: { label: 'High Density (Call Centers / Benching)', factor: 70, desc: 'Optimized open workstations with minimal dividers.' },
  standard: { label: 'Standard Density (Open Office / Cubicles)', factor: 110, desc: 'Comfortable workstations with standard walkways.' },
  executive: { label: 'Executive Density (Private Desks)', factor: 160, desc: 'Generous personal space and larger storage desk profiles.' }
};

export default function SpacePlanningCalculator() {
  const [unit, setUnit] = useState<UnitType>('sqft');
  const [availableArea, setAvailableArea] = useState<number>(5000);
  const [employeeCount, setEmployeeCount] = useState<number>(30);
  const [density, setDensity] = useState<DensityType>('standard');
  const [privateOffices, setPrivateOffices] = useState<number>(3);
  const [largeConf, setLargeConf] = useState<number>(1);
  const [smallConf, setSmallConf] = useState<number>(2);
  const [hasReception, setHasReception] = useState<boolean>(true);
  const [hasBreakroom, setHasBreakroom] = useState<boolean>(true);
  const [circulationMargin, setCirculationMargin] = useState<number>(25); // %
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    // Standard sizes in sq ft
    const deskFactor = DENSITY_PRESETS[density].factor;
    
    const workstationArea = employeeCount * deskFactor;
    const privateOfficeArea = privateOffices * 150; // 150 sq ft per executive office (10x15)
    const largeConfArea = largeConf * 350; // 350 sq ft for ~16-20 seats
    const smallConfArea = smallConf * 200; // 200 sq ft for ~8-10 seats
    const receptionArea = hasReception ? 250 : 0;
    const breakroomArea = hasBreakroom ? 300 : 0;

    const netProgramArea = workstationArea + privateOfficeArea + largeConfArea + smallConfArea + receptionArea + breakroomArea;
    const circulationArea = netProgramArea * (circulationMargin / 100);
    const totalRequiredSqFt = netProgramArea + circulationArea;

    // Convert values back to metric if needed
    const conv = (sqft: number) => {
      return unit === 'sqm' ? sqft * 0.092903 : sqft;
    };

    const totalRequired = conv(totalRequiredSqFt);
    const deficit = totalRequired - availableArea;
    const isAdequate = deficit <= 0;

    return {
      workstations: conv(workstationArea),
      privateOffices: conv(privateOfficeArea),
      meetings: conv(largeConfArea + smallConfArea),
      amenities: conv(receptionArea + breakroomArea),
      circulation: conv(circulationArea),
      totalRequired,
      netProgramArea: conv(netProgramArea),
      deficit: Math.abs(deficit),
      isAdequate,
      workstationPct: (workstationArea / totalRequiredSqFt) * 100,
      privatePct: (privateOfficeArea / totalRequiredSqFt) * 100,
      meetingsPct: ((largeConfArea + smallConfArea) / totalRequiredSqFt) * 100,
      amenitiesPct: ((receptionArea + breakroomArea) / totalRequiredSqFt) * 100,
      circulationPct: (circulationArea / totalRequiredSqFt) * 100
    };
  };

  const results = calculate();

  const copyReport = () => {
    const text = `Office Space Planning Allocation Audit
----------------------------------------
Available Floor Area: ${availableArea} ${unit}
Staff Count: ${employeeCount} Employees (${DENSITY_PRESETS[density].label})
Private Executive Offices: ${privateOffices}
Conference Rooms: ${largeConf} Large / ${smallConf} Small

Net Programmed Area: ${results.netProgramArea.toFixed(1)} ${unit}
Circulation Factor Allowance (${circulationMargin}%): ${results.circulation.toFixed(1)} ${unit}
Total Required Floor Area: ${results.totalRequired.toFixed(1)} ${unit}
----------------------------------------
Space Audit Status: ${results.isAdequate ? 'ADEQUATE - Space surplus of ' + results.deficit.toFixed(1) + ' ' + unit : 'DEFICIT - Short of ' + results.deficit.toFixed(1) + ' ' + unit}`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Configuration Column */}
      <div className="lg:col-span-7 space-y-6">
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-base flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-indigo-500" />
            <span>Staffing & Density Parameters</span>
          </h3>

          <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg max-w-[200px]">
            {(['sqft', 'sqm'] as const).map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                className={`flex-1 py-1 rounded-md text-xs font-bold transition ${
                  unit === u
                    ? 'bg-white dark:bg-zinc-700 text-indigo-650 dark:text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-650'
                }`}
              >
                {u === 'sqft' ? 'Sq. Feet' : 'Sq. Meters'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                Total Available Floor Area
              </label>
              <input
                type="number"
                value={availableArea}
                onChange={(e) => setAvailableArea(parseFloat(e.target.value) || 0)}
                className="saas-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Target Staff / Employee count
              </label>
              <input
                type="number"
                value={employeeCount}
                onChange={(e) => setEmployeeCount(parseInt(e.target.value) || 0)}
                className="saas-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
              Workstation Density Layout Style
            </label>
            <select
              value={density}
              onChange={(e) => setDensity(e.target.value as DensityType)}
              className="saas-input"
            >
              {Object.keys(DENSITY_PRESETS).map((k) => (
                <option key={k} value={k}>
                  {DENSITY_PRESETS[k as DensityType].label}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-zinc-400 mt-1">
              {DENSITY_PRESETS[density].desc}
            </p>
          </div>
        </div>

        {/* Private Offices & Shared Meeting Rooms */}
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-sm">Accessory Program Rooms</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                Private Executive Offices
              </label>
              <input
                type="number"
                value={privateOffices}
                onChange={(e) => setPrivateOffices(parseInt(e.target.value) || 0)}
                className="saas-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                Large Conf. Rooms (16+ Seats)
              </label>
              <input
                type="number"
                value={largeConf}
                onChange={(e) => setLargeConf(parseInt(e.target.value) || 0)}
                className="saas-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                Small Conf. Rooms (8+ Seats)
              </label>
              <input
                type="number"
                value={smallConf}
                onChange={(e) => setSmallConf(parseInt(e.target.value) || 0)}
                className="saas-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={hasReception}
                id="reception"
                onChange={(e) => setHasReception(e.target.checked)}
                className="rounded border-zinc-300 text-indigo-650 focus:ring-indigo-500"
              />
              <label htmlFor="reception" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Reception / Lounge
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={hasBreakroom}
                id="breakroom"
                onChange={(e) => setHasBreakroom(e.target.checked)}
                className="rounded border-zinc-300 text-indigo-650 focus:ring-indigo-500"
              />
              <label htmlFor="breakroom" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Staff Breakroom
              </label>
            </div>
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-semibold text-zinc-450 dark:text-zinc-500 flex items-center gap-1">
                <Percent className="w-3.5 h-3.5 text-zinc-400" />
                <span>Circulation (%):</span>
              </label>
              <input
                type="number"
                value={circulationMargin}
                onChange={(e) => setCirculationMargin(parseFloat(e.target.value) || 0)}
                className="w-16 saas-input py-1 text-center font-bold"
              />
            </div>
          </div>
        </div>

        {/* Space Allocation Distribution Diagram */}
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-sm">Space Allocation Chart</h3>
          <p className="text-xs text-zinc-400">
            Relative proportional distribution of your programmed spaces.
          </p>

          <div className="w-full flex h-8 rounded-xl overflow-hidden shadow-sm border border-zinc-200 dark:border-zinc-800">
            {results.workstationPct > 0 && (
              <div
                style={{ width: `${results.workstationPct}%` }}
                className="bg-indigo-500 hover:opacity-90 transition-opacity"
                title={`Workstations: ${results.workstations.toFixed(0)} ${unit}`}
              />
            )}
            {results.privatePct > 0 && (
              <div
                style={{ width: `${results.privatePct}%` }}
                className="bg-sky-400 hover:opacity-90 transition-opacity"
                title={`Private Offices: ${results.privateOffices.toFixed(0)} ${unit}`}
              />
            )}
            {results.meetingsPct > 0 && (
              <div
                style={{ width: `${results.meetingsPct}%` }}
                className="bg-purple-500 hover:opacity-90 transition-opacity"
                title={`Meeting Rooms: ${results.meetings.toFixed(0)} ${unit}`}
              />
            )}
            {results.amenitiesPct > 0 && (
              <div
                style={{ width: `${results.amenitiesPct}%` }}
                className="bg-amber-500 hover:opacity-90 transition-opacity"
                title={`Amenities: ${results.amenities.toFixed(0)} ${unit}`}
              />
            )}
            {results.circulationPct > 0 && (
              <div
                style={{ width: `${results.circulationPct}%` }}
                className="bg-zinc-400 hover:opacity-90 transition-opacity"
                title={`Circulation: ${results.circulation.toFixed(0)} ${unit}`}
              />
            )}
          </div>

          <div className="flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-wider text-zinc-500 mt-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-indigo-500" />
              <span>Workstations ({results.workstationPct.toFixed(0)}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-sky-400" />
              <span>Private Offices ({results.privatePct.toFixed(0)}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-purple-500" />
              <span>Meetings ({results.meetingsPct.toFixed(0)}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span>Amenities ({results.amenitiesPct.toFixed(0)}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-zinc-400" />
              <span>Circulation ({results.circulationPct.toFixed(0)}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Results Compliance Panel */}
      <div className="lg:col-span-5 space-y-6">
        <div className="saas-card p-6 flex flex-col justify-between h-full space-y-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Space Requirements
              </span>
              <button
                onClick={copyReport}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <span className="text-xs text-zinc-400">Total Required Floor Area</span>
                <div className="text-3xl font-black mt-1 font-mono text-zinc-950 dark:text-white">
                  {results.totalRequired.toFixed(1)} {unit}
                </div>
                <div
                  className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-md mt-2 ${
                    results.isAdequate
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-rose-500/10 text-rose-500'
                  }`}
                >
                  {results.isAdequate ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>SUFFICIENT SPACE AVAILABLE</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>SPACE DEFICIT (Short of {results.deficit.toFixed(0)} {unit})</span>
                    </>
                  )}
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Available Floor Space Limit</span>
                  <span className="font-bold font-mono">{availableArea} {unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Net Usable Program Area</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">
                    {results.netProgramArea.toFixed(1)} {unit}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-3">
                  <span className="text-zinc-400">Circulation / Corridors Area</span>
                  <span className="font-bold font-mono text-zinc-550">
                    {results.circulation.toFixed(1)} {unit}
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-zinc-450 dark:text-zinc-500 font-semibold">Total Surplus/Remnant Space</span>
                  <span
                    className={`font-black font-mono ${
                      results.isAdequate ? 'text-emerald-500' : 'text-rose-500'
                    }`}
                  >
                    {results.isAdequate ? '+' : '-'}
                    {results.deficit.toFixed(1)} {unit}
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 text-[11px] text-zinc-400 leading-relaxed flex gap-2">
                <Info className="w-5 h-5 text-indigo-500 shrink-0" />
                <p>
                  Circulation margins account for critical corridors, server room partitions, egress paths, and structural columns. A factor of 20-30% is standard in commercial space planning.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
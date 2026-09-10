import { useState, useMemo } from 'react';
import CurrencySelector from '../../components/CurrencySelector';
import {
  Copy, Check, RotateCcw,
  Sparkles, BarChart2,
  Sliders, ChevronDown, ChevronUp,
  Calculator, Layers, Scale,
  Activity, Users, UserCheck, UserX
} from 'lucide-react';

type CalculationMode = 'headline_metrics' | 'u1_u6_hierarchy' | 'okun_law' | 'labor_flows';

interface PresetScenario {
  name: string;
  category: string;
  badgeColor: string;
  mode: CalculationMode;
  employed: number;
  unemployed: number;
  workingAge: number;
  // U1-U6 additional
  unempLongTerm: number; // 15+ weeks
  jobLosers: number;
  discouraged: number;
  marginallyAttached: number;
  involuntaryPartTime: number;
  // Okun's Law
  naturalRate: number; // NAIRU u*
  potentialGdp: number; // in billions
  okunBeta: number;
  // Labor flows
  separationRate: number; // s %
  findingRate: number; // f %
  vacancyRate: number; // v %
}

const PRESETS: PresetScenario[] = [
  {
    name: 'US 2019 Full Employment',
    category: 'Full Employment',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    mode: 'headline_metrics',
    employed: 158800000,
    unemployed: 5800000,
    workingAge: 260000000,
    unempLongTerm: 1200000,
    jobLosers: 2800000,
    discouraged: 350000,
    marginallyAttached: 1400000,
    involuntaryPartTime: 4300000,
    naturalRate: 4.4,
    potentialGdp: 21400,
    okunBeta: 2.0,
    separationRate: 1.2,
    findingRate: 33.0,
    vacancyRate: 4.5
  },
  {
    name: 'US April 2020 Pandemic Shock',
    category: 'Severe Recession',
    badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
    mode: 'u1_u6_hierarchy',
    employed: 133400000,
    unemployed: 23100000,
    workingAge: 260000000,
    unempLongTerm: 2100000,
    jobLosers: 18000000,
    discouraged: 800000,
    marginallyAttached: 2300000,
    involuntaryPartTime: 10900000,
    naturalRate: 4.5,
    potentialGdp: 22000,
    okunBeta: 2.0,
    separationRate: 4.5,
    findingRate: 15.0,
    vacancyRate: 2.8
  },
  {
    name: 'India PLFS Mixed Structure',
    category: 'Developing Economy',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    mode: 'headline_metrics',
    employed: 540000000,
    unemployed: 38000000,
    workingAge: 1020000000,
    unempLongTerm: 15000000,
    jobLosers: 20000000,
    discouraged: 12000000,
    marginallyAttached: 25000000,
    involuntaryPartTime: 45000000,
    naturalRate: 5.5,
    potentialGdp: 3800,
    okunBeta: 2.2,
    separationRate: 1.8,
    findingRate: 25.0,
    vacancyRate: 3.2
  },
  {
    name: 'Eurozone Structural Rigidity',
    category: 'High Friction',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    mode: 'u1_u6_hierarchy',
    employed: 82000000,
    unemployed: 10500000,
    workingAge: 130000000,
    unempLongTerm: 4800000,
    jobLosers: 5500000,
    discouraged: 1100000,
    marginallyAttached: 2800000,
    involuntaryPartTime: 6200000,
    naturalRate: 7.5,
    potentialGdp: 14500,
    okunBeta: 1.8,
    separationRate: 1.5,
    findingRate: 11.5,
    vacancyRate: 2.2
  },
  {
    name: '2008 Great Financial Crisis',
    category: 'Cyclical Gap',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
    mode: 'okun_law',
    employed: 138500000,
    unemployed: 15300000,
    workingAge: 236000000,
    unempLongTerm: 6000000,
    jobLosers: 9500000,
    discouraged: 900000,
    marginallyAttached: 2400000,
    involuntaryPartTime: 9200000,
    naturalRate: 4.8,
    potentialGdp: 15000,
    okunBeta: 2.0,
    separationRate: 2.2,
    findingRate: 19.5,
    vacancyRate: 2.5
  },
  {
    name: 'Japan Aging & High EPOP',
    category: 'Demographic Shift',
    badgeColor: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
    mode: 'labor_flows',
    employed: 67500000,
    unemployed: 1700000,
    workingAge: 110000000,
    unempLongTerm: 350000,
    jobLosers: 800000,
    discouraged: 150000,
    marginallyAttached: 450000,
    involuntaryPartTime: 1200000,
    naturalRate: 2.3,
    potentialGdp: 4500,
    okunBeta: 2.5,
    separationRate: 0.8,
    findingRate: 31.0,
    vacancyRate: 4.8
  }
];

export default function UnemploymentRateCalculator() {
  const [currency, setCurrency] = useState<string>('$');
  const [mode, setMode] = useState<CalculationMode>('headline_metrics');

  // Input states
  const [employed, setEmployed] = useState<number>(158800000);
  const [unemployed, setUnemployed] = useState<number>(5800000);
  const [workingAge, setWorkingAge] = useState<number>(260000000);

  // U1-U6 additional inputs
  const [unempLongTerm, setUnempLongTerm] = useState<number>(1200000);
  const [jobLosers, setJobLosers] = useState<number>(2800000);
  const [discouraged, setDiscouraged] = useState<number>(350000);
  const [marginallyAttached, setMarginallyAttached] = useState<number>(1400000);
  const [involuntaryPartTime, setInvoluntaryPartTime] = useState<number>(4300000);

  // Okun's law states
  const [naturalRate, setNaturalRate] = useState<number>(4.4);
  const [potentialGdp, setPotentialGdp] = useState<number>(21400); // Billion currency
  const [okunBeta, setOkunBeta] = useState<number>(2.0);

  // Labor flows
  const [separationRate, setSeparationRate] = useState<number>(1.2);
  const [findingRate, setFindingRate] = useState<number>(33.0);
  const [vacancyRate, setVacancyRate] = useState<number>(4.5);

  // UI state
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // Formatting helpers
  const formatNum = (val: number) => val.toLocaleString();
  const formatMoney = (val: number) => `${currency}${val.toLocaleString(undefined, { maximumFractionDigits: 1 })}`;

  // Load Preset
  const handleApplyPreset = (p: PresetScenario) => {
    setMode(p.mode);
    setEmployed(p.employed);
    setUnemployed(p.unemployed);
    setWorkingAge(p.workingAge);
    setUnempLongTerm(p.unempLongTerm);
    setJobLosers(p.jobLosers);
    setDiscouraged(p.discouraged);
    setMarginallyAttached(p.marginallyAttached);
    setInvoluntaryPartTime(p.involuntaryPartTime);
    setNaturalRate(p.naturalRate);
    setPotentialGdp(p.potentialGdp);
    setOkunBeta(p.okunBeta);
    setSeparationRate(p.separationRate);
    setFindingRate(p.findingRate);
    setVacancyRate(p.vacancyRate);
  };

  // Reset to Defaults
  const handleReset = () => {
    setMode('headline_metrics');
    setEmployed(158800000);
    setUnemployed(5800000);
    setWorkingAge(260000000);
    setUnempLongTerm(1200000);
    setJobLosers(2800000);
    setDiscouraged(350000);
    setMarginallyAttached(1400000);
    setInvoluntaryPartTime(4300000);
    setNaturalRate(4.4);
    setPotentialGdp(21400);
    setOkunBeta(2.0);
    setSeparationRate(1.2);
    setFindingRate(33.0);
    setVacancyRate(4.5);
  };

  // Copy Formula Helper
  const handleCopyFormula = (latex: string, label: string) => {
    navigator.clipboard.writeText(latex);
    setCopiedFormula(label);
    setTimeout(() => setCopiedFormula(null), 2000);
  };

  // Core Math Calculations
  const calc = useMemo(() => {
    // 1. Headline Labor Force Metrics
    const laborForce = employed + unemployed;
    const notInLaborForce = Math.max(0, workingAge - laborForce);
    const unempRate = laborForce > 0 ? (unemployed / laborForce) * 100 : 0;
    const lfpr = workingAge > 0 ? (laborForce / workingAge) * 100 : 0;
    const epop = workingAge > 0 ? (employed / workingAge) * 100 : 0;

    // 2. BLS U-1 through U-6 Hierarchy
    const u1Rate = laborForce > 0 ? (unempLongTerm / laborForce) * 100 : 0;
    const u2Rate = laborForce > 0 ? (jobLosers / laborForce) * 100 : 0;
    const u3Rate = unempRate; // Headline
    const u4LaborForce = laborForce + discouraged;
    const u4Rate = u4LaborForce > 0 ? ((unemployed + discouraged) / u4LaborForce) * 100 : 0;
    const u5LaborForce = laborForce + marginallyAttached;
    const u5Rate = u5LaborForce > 0 ? ((unemployed + marginallyAttached) / u5LaborForce) * 100 : 0;
    const u6Rate = u5LaborForce > 0 ? ((unemployed + marginallyAttached + involuntaryPartTime) / u5LaborForce) * 100 : 0;
    const underutilizationSlackGap = Math.max(0, u6Rate - u3Rate);

    // 3. Okun's Law & NAIRU Analysis
    const unempGap = unempRate - naturalRate; // Cyclical unemployment
    const cyclicalUnemployedCount = laborForce * (unempGap / 100);
    const gdpOutputGapPct = -okunBeta * unempGap;
    const lostGdpNominal = potentialGdp * (Math.abs(gdpOutputGapPct) / 100);
    const actualGdpImplied = potentialGdp * (1 + gdpOutputGapPct / 100);

    // 4. Labor Flows & Steady-State Natural Rate
    const s = separationRate / 100;
    const f = findingRate / 100;
    const steadyStateUnemp = s + f > 0 ? (s / (s + f)) * 100 : 0;
    const beveridgeRatio = vacancyRate > 0 ? unempRate / vacancyRate : 0;

    return {
      laborForce,
      notInLaborForce,
      unempRate,
      lfpr,
      epop,
      // U1-U6
      u1Rate,
      u2Rate,
      u3Rate,
      u4Rate,
      u5Rate,
      u6Rate,
      underutilizationSlackGap,
      // Okun
      unempGap,
      cyclicalUnemployedCount,
      gdpOutputGapPct,
      lostGdpNominal,
      actualGdpImplied,
      // Flows
      steadyStateUnemp,
      beveridgeRatio
    };
  }, [
    employed, unemployed, workingAge,
    unempLongTerm, jobLosers, discouraged, marginallyAttached, involuntaryPartTime,
    naturalRate, potentialGdp, okunBeta,
    separationRate, findingRate, vacancyRate
  ]);

  // U1-U6 Hierarchy Table Data
  const hierarchyData = useMemo(() => {
    return [
      {
        code: 'U-1',
        title: 'Long-Term Unemployed',
        desc: 'Persons unemployed 15 weeks or longer as a % of civilian labor force.',
        count: unempLongTerm,
        rate: calc.u1Rate,
        badge: 'Severe Hardship',
        badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
      },
      {
        code: 'U-2',
        title: 'Job Losers & Temp Layoffs',
        desc: 'Job losers and persons who completed temporary jobs as a % of civilian labor force.',
        count: jobLosers,
        rate: calc.u2Rate,
        badge: 'Involuntary Loss',
        badgeColor: 'bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300'
      },
      {
        code: 'U-3',
        title: 'Official Headline Rate',
        desc: 'Total unemployed actively seeking employment as a % of civilian labor force (Standard BLS/ILO).',
        count: unemployed,
        rate: calc.u3Rate,
        badge: 'Official Headline',
        badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
      },
      {
        code: 'U-4',
        title: 'Discouraged Workers Added',
        desc: 'Total unemployed plus discouraged workers who gave up searching due to job market pessimism.',
        count: unemployed + discouraged,
        rate: calc.u4Rate,
        badge: 'Discouraged Slack',
        badgeColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300'
      },
      {
        code: 'U-5',
        title: 'Marginally Attached Added',
        desc: 'Unemployed plus all marginally attached workers (wanted job, available, searched recently).',
        count: unemployed + marginallyAttached,
        rate: calc.u5Rate,
        badge: 'Marginal Attachment',
        badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300'
      },
      {
        code: 'U-6',
        title: 'Total Underutilization',
        desc: 'Unemployed plus marginally attached plus part-time for economic reasons (Broadest measure).',
        count: unemployed + marginallyAttached + involuntaryPartTime,
        rate: calc.u6Rate,
        badge: 'Broadest Slack',
        badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
      }
    ];
  }, [unempLongTerm, jobLosers, unemployed, discouraged, marginallyAttached, involuntaryPartTime, calc]);

  // SVG Chart Geometry
  const chartGeometry = useMemo(() => {
    const width = 620;
    const height = 280;
    const padding = { top: 30, right: 30, bottom: 40, left: 65 };

    if (mode === 'okun_law') {
      // Okun curve: X = Cyclical Unemp Gap (-3% to +6%), Y = Output Gap (+6% to -12%)
      const minX = -3.0;
      const maxX = 6.0;
      const minY = -12.0;
      const maxY = 6.0;

      const scaleX = (ug: number) => padding.left + ((ug - minX) / (maxX - minX)) * (width - padding.left - padding.right);
      const scaleY = (yg: number) => height - padding.bottom - ((yg - minY) / (maxY - minY)) * (height - padding.top - padding.bottom);

      const x1 = scaleX(minX);
      const y1 = scaleY(-okunBeta * minX);
      const x2 = scaleX(maxX);
      const y2 = scaleY(-okunBeta * maxX);

      const curX = scaleX(calc.unempGap);
      const curY = scaleY(calc.gdpOutputGapPct);

      return {
        width, height, padding,
        type: 'okun',
        x1, y1, x2, y2, curX, curY,
        zeroX: scaleX(0),
        zeroY: scaleY(0),
        scaleX, scaleY
      };
    }

    return {
      width, height, padding,
      type: 'breakdown'
    };
  }, [mode, okunBeta, calc.unempGap, calc.gdpOutputGapPct]);

  // 5x5 Sensitivity Matrix: Employment Growth vs LFPR Shift
  const sensitivityMatrix = useMemo(() => {
    const empMultipliers = [0.96, 0.98, 1.0, 1.02, 1.04]; // -4% to +4%
    const lfprRates = [56.0, 59.0, 62.0, 65.0, 68.0]; // LFPR %
    const pop = workingAge;

    return {
      empMultipliers,
      lfprRates,
      rows: lfprRates.map((lfRate) => {
        const lf = pop * (lfRate / 100);
        return {
          lfRate,
          cells: empMultipliers.map((m) => {
            const empVal = employed * m;
            const unempVal = Math.max(0, lf - empVal);
            const uRate = lf > 0 ? (unempVal / lf) * 100 : 0;
            return {
              empMult: m,
              empVal,
              uRate
            };
          })
        };
      })
    };
  }, [employed, workingAge]);

  // LaTeX Proofs
  const latexU3 = `u = \\frac{U}{LF} \\times 100\\% = \\frac{${unemployed.toLocaleString()}}{${calc.laborForce.toLocaleString()}} \\times 100\\% = ${calc.unempRate.toFixed(2)}\\%`;
  const latexLFPR = `\\text{LFPR} = \\frac{LF}{P_{\\text{working}}} \\times 100\\% = \\frac{${calc.laborForce.toLocaleString()}}{${workingAge.toLocaleString()}} \\times 100\\% = ${calc.lfpr.toFixed(2)}\\%`;
  const latexEPOP = `\\text{EPOP} = \\frac{E}{P_{\\text{working}}} \\times 100\\% = \\text{LFPR} \\times (1 - u) = ${calc.lfpr.toFixed(2)}\\% \\times (1 - ${calc.unempRate.toFixed(2)}\\%) = ${calc.epop.toFixed(2)}\\%`;
  const latexU6 = `\\text{U-6} = \\frac{U + M + PT_{\\text{econ}}}{LF + M} \\times 100\\% = \\frac{${(unemployed + marginallyAttached + involuntaryPartTime).toLocaleString()}}{${(calc.laborForce + marginallyAttached).toLocaleString()}} \\times 100\\% = ${calc.u6Rate.toFixed(2)}\\%`;
  const latexOkun = `\\frac{\\Delta Y}{Y^*} = -\\beta (u - u^*) = -${okunBeta.toFixed(1)} \\times (${calc.unempRate.toFixed(2)}\\% - ${naturalRate.toFixed(1)}\\%) = ${calc.gdpOutputGapPct.toFixed(2)}\\%`;
  const latexFlows = `u_{\\text{ss}} = \\frac{s}{s + f} \\times 100\\% = \\frac{${separationRate.toFixed(2)}\\%}{${separationRate.toFixed(2)}\\% + ${findingRate.toFixed(2)}\\%} = ${calc.steadyStateUnemp.toFixed(2)}\\%`;

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-left pb-12">
      {/* Top Presets & Actions Toolbar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Macroeconomic Presets & Mode Selector</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Analyze unemployment rates, labor force participation, and underutilization</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-800/80 px-3 py-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-700">
              <span className="text-xs font-semibold text-zinc-500">Currency:</span>
              <CurrencySelector value={currency} onChange={(sym) => setCurrency(sym)} />
            </div>
            <button
              onClick={handleReset}
              className="p-2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Reset to defaults"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Preset Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handleApplyPreset(preset)}
              className="p-2.5 rounded-2xl text-left border border-zinc-200 dark:border-zinc-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 bg-zinc-50/50 dark:bg-zinc-800/40 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all flex flex-col justify-between group"
            >
              <div>
                <span className={`inline-block px-1.5 py-0.5 rounded-md text-[10px] font-bold ${preset.badgeColor} mb-1`}>
                  {preset.category}
                </span>
                <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-1">
                  {preset.name}
                </div>
              </div>
              <div className="text-[11px] text-zinc-500 mt-1 font-mono font-medium">
                {((preset.unemployed / (preset.employed + preset.unemployed)) * 100).toFixed(1)}% U-3
              </div>
            </button>
          ))}
        </div>

        {/* Mode Navigation Tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={() => setMode('headline_metrics')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === 'headline_metrics'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            1. Headline Metrics (U-3 & LFPR)
          </button>
          <button
            onClick={() => setMode('u1_u6_hierarchy')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === 'u1_u6_hierarchy'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            2. Broad Underutilization (U-1 to U-6)
          </button>
          <button
            onClick={() => setMode('okun_law')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === 'okun_law'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            3. Okun&apos;s Law & NAIRU Gap
          </button>
          <button
            onClick={() => setMode('labor_flows')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === 'labor_flows'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            4. Labor Flows & Beveridge Curve
          </button>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Inputs Column */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  <Sliders className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {mode === 'headline_metrics' && 'Civilian Population Demographics'}
                  {mode === 'u1_u6_hierarchy' && 'BLS Underutilization Categories'}
                  {mode === 'okun_law' && 'Potential GDP & NAIRU Benchmarks'}
                  {mode === 'labor_flows' && 'Job Separation & Finding Rates'}
                </h3>
              </div>
              <span className="text-[11px] font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full font-bold">
                BLS / ILO Standard
              </span>
            </div>

            {/* Core Civilian Labor Force Inputs */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                    Employed Population (E)
                  </label>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {formatNum(employed)}
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="500000"
                  value={employed}
                  onChange={(e) => setEmployed(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm font-bold font-mono focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <UserX className="w-3.5 h-3.5 text-rose-500" />
                    Unemployed Actively Seeking (U)
                  </label>
                  <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                    {formatNum(unemployed)}
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="100000"
                  value={unemployed}
                  onChange={(e) => setUnemployed(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm font-bold font-mono focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-500" />
                    Working-Age Civilian Population (15–64 / 16+)
                  </label>
                  <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                    {formatNum(workingAge)}
                  </span>
                </div>
                <input
                  type="number"
                  min="1000"
                  step="1000000"
                  value={workingAge}
                  onChange={(e) => setWorkingAge(Math.max(1, parseFloat(e.target.value) || 1))}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm font-bold font-mono focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* U1-U6 Hierarchy Additional Inputs */}
            {mode === 'u1_u6_hierarchy' && (
              <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                  Underutilization Slack Components
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                      Unemployed 15+ Wks (U-1)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={unempLongTerm}
                      onChange={(e) => setUnempLongTerm(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                      Job Losers (U-2)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={jobLosers}
                      onChange={(e) => setJobLosers(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                      Discouraged Workers (U-4)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={discouraged}
                      onChange={(e) => setDiscouraged(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                      Marginally Attached (U-5)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={marginallyAttached}
                      onChange={(e) => setMarginallyAttached(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                    Part-Time for Economic Reasons / Involuntary (U-6)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={involuntaryPartTime}
                    onChange={(e) => setInvoluntaryPartTime(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
              </div>
            )}

            {/* Okun's Law Inputs */}
            {mode === 'okun_law' && (
              <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                  Okun&apos;s Law Parameters
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                        NAIRU / Natural Rate (u*)
                      </label>
                      <span className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {naturalRate.toFixed(1)}%
                      </span>
                    </div>
                    <input
                      type="number"
                      min="2.0"
                      max="10.0"
                      step="0.1"
                      value={naturalRate}
                      onChange={(e) => setNaturalRate(parseFloat(e.target.value) || 4.0)}
                      className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                        Okun&apos;s Beta Coefficient (β)
                      </label>
                      <span className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {okunBeta.toFixed(1)}×
                      </span>
                    </div>
                    <input
                      type="number"
                      min="1.0"
                      max="3.5"
                      step="0.1"
                      value={okunBeta}
                      onChange={(e) => setOkunBeta(parseFloat(e.target.value) || 2.0)}
                      className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                      Potential GDP (Y* in {currency} Billions)
                    </label>
                    <span className="text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400">
                      {formatMoney(potentialGdp)}B
                    </span>
                  </div>
                  <input
                    type="number"
                    min="10"
                    step="500"
                    value={potentialGdp}
                    onChange={(e) => setPotentialGdp(Math.max(1, parseFloat(e.target.value) || 1))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
              </div>
            )}

            {/* Labor Flows Inputs */}
            {mode === 'labor_flows' && (
              <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                  Flow Dynamics & Beveridge Matching
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                        Job Separation Rate (s %/mo)
                      </label>
                      <span className="text-[11px] font-mono font-bold text-rose-600 dark:text-rose-400">
                        {separationRate.toFixed(1)}%
                      </span>
                    </div>
                    <input
                      type="number"
                      min="0.1"
                      max="10.0"
                      step="0.1"
                      value={separationRate}
                      onChange={(e) => setSeparationRate(parseFloat(e.target.value) || 0.1)}
                      className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                        Job Finding Rate (f %/mo)
                      </label>
                      <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {findingRate.toFixed(1)}%
                      </span>
                    </div>
                    <input
                      type="number"
                      min="1.0"
                      max="60.0"
                      step="1.0"
                      value={findingRate}
                      onChange={(e) => setFindingRate(parseFloat(e.target.value) || 1.0)}
                      className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                      Job Vacancy Rate (v %)
                    </label>
                    <span className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {vacancyRate.toFixed(1)}%
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0.5"
                    max="15.0"
                    step="0.1"
                    value={vacancyRate}
                    onChange={(e) => setVacancyRate(parseFloat(e.target.value) || 0.5)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quick Mathematical Diagnostics Card */}
          <div className="p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-500" />
              Labor Market Aggregates
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
                <span className="text-[10px] text-zinc-500 block">Total Civilian Labor Force</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">
                  {formatNum(calc.laborForce)}
                </span>
                <span className="text-[9px] text-zinc-400 block mt-0.5">Employed + Unemployed</span>
              </div>

              <div className="p-2.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
                <span className="text-[10px] text-zinc-500 block">Not in Labor Force (NILF)</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                  {formatNum(calc.notInLaborForce)}
                </span>
                <span className="text-[9px] text-zinc-400 block mt-0.5">Students, retirees, caregivers</span>
              </div>

              <div className="p-2.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
                <span className="text-[10px] text-zinc-500 block">Employment-to-Pop (EPOP)</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  {calc.epop.toFixed(2)}%
                </span>
                <span className="text-[9px] text-zinc-400 block mt-0.5">Employed ÷ Working Age</span>
              </div>

              <div className="p-2.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
                <span className="text-[10px] text-zinc-500 block">Underutilization Slack Gap</span>
                <span className="font-mono font-bold text-purple-600 dark:text-purple-400 text-sm">
                  +{calc.underutilizationSlackGap.toFixed(2)}%
                </span>
                <span className="text-[9px] text-zinc-400 block mt-0.5">U-6 minus U-3 headline</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Output & Visualization Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Hero Gradient Result Card */}
          <div className="bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-blue-300 backdrop-blur-md flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  {mode === 'headline_metrics' && 'Official Unemployment & Participation'}
                  {mode === 'u1_u6_hierarchy' && 'BLS U-6 Comprehensive Underutilization'}
                  {mode === 'okun_law' && 'Okun Output Gap & Lost GDP'}
                  {mode === 'labor_flows' && 'Steady-State Flow Unemployment'}
                </span>
                <span className="text-xs text-blue-200/80 font-mono">
                  {formatNum(calc.laborForce)} Active Workers
                </span>
              </div>

              {/* Primary Dual Metric Display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-blue-300 text-xs font-semibold uppercase tracking-wider block">
                    {mode === 'u1_u6_hierarchy' ? 'Broadest Rate (U-6)' : 'Headline Unemployment (U-3)'}
                  </span>
                  <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white mt-1">
                    {mode === 'u1_u6_hierarchy' ? `${calc.u6Rate.toFixed(2)}%` : `${calc.unempRate.toFixed(2)}%`}
                  </div>
                  <p className="text-xs text-blue-200/70 mt-1 font-medium">
                    {mode === 'u1_u6_hierarchy'
                      ? `${formatNum(unemployed + marginallyAttached + involuntaryPartTime)} total underutilized workers`
                      : `${formatNum(unemployed)} actively seeking jobs`}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-emerald-300 text-xs font-semibold uppercase tracking-wider block">
                    {mode === 'okun_law' ? 'Okun GDP Output Gap' : 'Labor Force Participation (LFPR)'}
                  </span>
                  <div className={`text-4xl sm:text-5xl font-black font-mono tracking-tight mt-1 ${
                    mode === 'okun_law' && calc.gdpOutputGapPct < 0 ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    {mode === 'okun_law'
                      ? `${calc.gdpOutputGapPct >= 0 ? '+' : ''}${calc.gdpOutputGapPct.toFixed(2)}%`
                      : `${calc.lfpr.toFixed(2)}%`}
                  </div>
                  <p className="text-xs text-emerald-200/70 mt-1 font-medium">
                    {mode === 'okun_law'
                      ? `${calc.unempGap > 0 ? `-${formatMoney(calc.lostGdpNominal)}B output loss` : 'Economy running above potential'}`
                      : `${formatNum(calc.laborForce)} of ${formatNum(workingAge)} adults participating`}
                  </p>
                </div>
              </div>

              {/* Visual Breakdown Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-emerald-300">
                    Employed: {calc.epop.toFixed(1)}% ({formatNum(employed)})
                  </span>
                  <span className="text-rose-300">
                    Unemployed: {calc.unempRate.toFixed(1)}% ({formatNum(unemployed)})
                  </span>
                  <span className="text-slate-300">
                    NILF: {((calc.notInLaborForce / workingAge) * 100).toFixed(1)}% ({formatNum(calc.notInLaborForce)})
                  </span>
                </div>
                <div className="w-full bg-black/40 h-3.5 rounded-full overflow-hidden flex border border-white/10">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-500"
                    style={{ width: `${(employed / workingAge) * 100}%` }}
                    title={`Employed: ${formatNum(employed)}`}
                  />
                  <div
                    className="bg-rose-500 h-full transition-all duration-500"
                    style={{ width: `${(unemployed / workingAge) * 100}%` }}
                    title={`Unemployed: ${formatNum(unemployed)}`}
                  />
                  <div
                    className="bg-slate-500 h-full transition-all duration-500"
                    style={{ width: `${(calc.notInLaborForce / workingAge) * 100}%` }}
                    title={`Not in Labor Force: ${formatNum(calc.notInLaborForce)}`}
                  />
                </div>
              </div>

              {/* 3 Status Diagnostic Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/10 text-xs">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-blue-300/80 block text-[10px] uppercase font-semibold">Employment-to-Pop</span>
                  <span className="font-mono font-bold text-white text-base">
                    {calc.epop.toFixed(2)}%
                  </span>
                  <span className="text-[10px] text-blue-200/60 block mt-0.5">True economic engine ratio</span>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-blue-300/80 block text-[10px] uppercase font-semibold">Cyclical Unemployment</span>
                  <span className={`font-mono font-bold text-base ${calc.unempGap > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {calc.unempGap >= 0 ? `+${calc.unempGap.toFixed(2)}%` : `${calc.unempGap.toFixed(2)}%`}
                  </span>
                  <span className="text-[10px] text-blue-200/60 block mt-0.5">Deviation from {naturalRate}% NAIRU</span>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-blue-300/80 block text-[10px] uppercase font-semibold">Steady-State Rate</span>
                  <span className="font-mono font-bold text-indigo-300 text-base">
                    {calc.steadyStateUnemp.toFixed(2)}%
                  </span>
                  <span className="text-[10px] text-blue-200/60 block mt-0.5">Flow equilibrium (s/(s+f))</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Visual Canvas / Hierarchy Bar */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <BarChart2 className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {mode === 'okun_law' ? `Okun's Law GDP Gap Curve (β = ${okunBeta})` : 'BLS U-1 through U-6 Labor Market Staircase'}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {mode === 'okun_law'
                      ? 'Macroeconomic output gap resulting from cyclical labor deviations'
                      : 'Comprehensive multi-tiered labor market slack indicators'}
                  </p>
                </div>
              </div>
            </div>

            {mode === 'okun_law' ? (
              /* SVG Okun Line */
              <div className="w-full overflow-x-auto">
                <svg
                  viewBox={`0 0 ${chartGeometry.width} ${chartGeometry.height}`}
                  className="w-full h-auto max-h-[280px] select-none font-mono"
                >
                  {/* Axis lines */}
                  {chartGeometry.zeroX !== undefined && chartGeometry.zeroY !== undefined && (
                    <>
                      <line
                        x1={chartGeometry.zeroX}
                        y1={chartGeometry.padding.top}
                        x2={chartGeometry.zeroX}
                        y2={chartGeometry.height - chartGeometry.padding.bottom}
                        stroke="currentColor"
                        strokeDasharray="3 3"
                        className="text-zinc-300 dark:text-zinc-700"
                        strokeWidth="1.5"
                      />
                      <line
                        x1={chartGeometry.padding.left}
                        y1={chartGeometry.zeroY}
                        x2={chartGeometry.width - chartGeometry.padding.right}
                        y2={chartGeometry.zeroY}
                        stroke="currentColor"
                        strokeDasharray="3 3"
                        className="text-zinc-300 dark:text-zinc-700"
                        strokeWidth="1.5"
                      />
                    </>
                  )}

                  {/* Okun downward sloping line */}
                  {chartGeometry.x1 !== undefined && (
                    <line
                      x1={chartGeometry.x1}
                      y1={chartGeometry.y1}
                      x2={chartGeometry.x2}
                      y2={chartGeometry.y2}
                      stroke="#3b82f6"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Current Position Point */}
                  {chartGeometry.curX !== undefined && (
                    <g>
                      <circle
                        cx={chartGeometry.curX}
                        cy={chartGeometry.curY}
                        r="6"
                        className="fill-rose-500 stroke-white dark:stroke-zinc-900"
                        strokeWidth="2"
                      />
                      <text
                        x={chartGeometry.curX + 10}
                        y={chartGeometry.curY - 10}
                        className="text-[11px] font-bold fill-rose-500 font-mono"
                      >
                        Gap: {calc.gdpOutputGapPct.toFixed(1)}% ({calc.unempGap >= 0 ? '+' : ''}{calc.unempGap.toFixed(1)}% u-gap)
                      </text>
                    </g>
                  )}

                  <text
                    x={chartGeometry.width - chartGeometry.padding.right}
                    y={chartGeometry.height - 10}
                    textAnchor="end"
                    className="text-[10px] fill-zinc-400 font-mono"
                  >
                    Cyclical Unemployment Gap (u - u*) →
                  </text>
                  <text
                    x={10}
                    y={chartGeometry.padding.top}
                    className="text-[10px] fill-zinc-400 font-mono"
                  >
                    ↑ GDP Output Gap (%)
                  </text>
                </svg>
              </div>
            ) : (
              /* U1 to U6 Horizontal Progression Bar Visual */
              <div className="space-y-3 pt-2">
                {hierarchyData.map((item) => (
                  <div key={item.code} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-[11px]">
                          {item.code}
                        </span>
                        {item.title}
                      </span>
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                        {item.rate.toFixed(2)}% ({formatNum(item.count)})
                      </span>
                    </div>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.code === 'U-3' ? 'bg-blue-600' : item.code === 'U-6' ? 'bg-rose-500' : 'bg-indigo-400'
                        }`}
                        style={{ width: `${Math.min(100, (item.rate / 25) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comprehensive BLS U-1 through U-6 Hierarchy Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Layers className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                BLS Labor Underutilization Hierarchy (U-1 to U-6)
              </h3>
              <p className="text-xs text-zinc-500">
                Bureau of Labor Statistics alternative measures of labor market slack and underemployment
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            6 Official Tiers
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500">
                <th className="py-2.5 px-3 font-semibold">Tier</th>
                <th className="py-2.5 px-3 font-semibold">Classification</th>
                <th className="py-2.5 px-3 font-semibold">Definition & Methodology</th>
                <th className="py-2.5 px-3 font-semibold">Count</th>
                <th className="py-2.5 px-3 font-semibold">Rate (%)</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {hierarchyData.map((row) => (
                <tr
                  key={row.code}
                  className={`hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors ${
                    row.code === 'U-3' ? 'bg-blue-500/5 font-bold' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 font-bold text-blue-600 dark:text-blue-400">
                    {row.code}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-zinc-900 dark:text-zinc-100">
                    {row.title}
                  </td>
                  <td className="py-2.5 px-3 font-sans text-zinc-600 dark:text-zinc-400 max-w-xs">
                    {row.desc}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-zinc-800 dark:text-zinc-200">
                    {formatNum(row.count)}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {row.rate.toFixed(2)}%
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold ${row.badgeColor}`}>
                      {row.badge}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5x5 Sensitivity Matrix: Employment Growth vs LFPR Shift */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Scale className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                5×5 Sensitivity Matrix: Employment Shifts vs. Participation Rates (LFPR)
              </h3>
              <p className="text-xs text-zinc-500">
                Resulting Headline Unemployment Rate (U-3 %) under shifts in worker entry and job creation
              </p>
            </div>
          </div>
          <span className="text-xs text-zinc-400 font-mono">
            Green: &lt;4.5% | Blue: 4.5–7% | Rose: &gt;7%
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="py-2.5 px-3 text-left font-bold text-zinc-500">LFPR \\ Job Growth</th>
                {sensitivityMatrix.empMultipliers.map((m) => (
                  <th key={m} className="py-2.5 px-3 font-bold text-zinc-700 dark:text-zinc-300">
                    {m === 1.0 ? 'Baseline (0%)' : `${m > 1.0 ? '+' : ''}${((m - 1) * 100).toFixed(0)}% Jobs`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {sensitivityMatrix.rows.map((row) => (
                <tr key={row.lfRate} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                  <td className="py-2.5 px-3 text-left font-bold text-zinc-900 dark:text-zinc-100">
                    {row.lfRate.toFixed(1)}% LFPR
                  </td>
                  {row.cells.map((cell, idx) => {
                    const rate = cell.uRate;
                    let colorBg = 'bg-rose-100 text-rose-900 dark:bg-rose-950/50 dark:text-rose-300';
                    if (rate <= 4.5) colorBg = 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300';
                    else if (rate <= 7.0) colorBg = 'bg-blue-100 text-blue-900 dark:bg-blue-950/50 dark:text-blue-300';

                    return (
                      <td key={idx} className="py-2 px-2">
                        <div className={`p-2 rounded-xl ${colorBg} font-bold transition-transform hover:scale-105`}>
                          <div>{rate.toFixed(2)}%</div>
                          <div className="text-[10px] font-normal opacity-80 mt-0.5">
                            {rate <= 4.5 ? 'Full Emp' : rate <= 7.0 ? 'Moderate' : 'Slack'}
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formal LaTeX Proofs & Derivations */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Calculator className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Formal Mathematical Proofs & Labor Economics Identities
              </h3>
              <p className="text-xs text-zinc-500">
                Rigorous definitions of employment ratios, underutilization tiers, Okun output gaps, and flow dynamics
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1 hover:underline"
          >
            {showAdvanced ? 'Hide Derivations' : 'Show Derivations'}
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            {/* 1. U-3 Headline Proof */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">1. Official Headline Unemployment (U-3)</span>
                <button
                  onClick={() => handleCopyFormula(latexU3, 'u3')}
                  className="p-1 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500"
                  title="Copy LaTeX"
                >
                  {copiedFormula === 'u3' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 font-mono text-xs overflow-x-auto text-purple-600 dark:text-purple-400">
                {latexU3}
              </div>
              <p className="text-[11px] text-zinc-500">
                {"Ratio of actively searching unemployed to total civilian labor force (E + U)."}
              </p>
            </div>

            {/* 2. LFPR & EPOP Identity */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">2. Labor Force Participation & EPOP</span>
                <button
                  onClick={() => handleCopyFormula(latexEPOP, 'epop')}
                  className="p-1 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500"
                  title="Copy LaTeX"
                >
                  {copiedFormula === 'epop' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 font-mono text-xs overflow-x-auto text-purple-600 dark:text-purple-400">
                {latexEPOP}
              </div>
              <p className="text-[11px] text-zinc-500">
                {"The fundamental identity connecting Employment-to-Population with LFPR and U-3."}
              </p>
            </div>

            {/* 3. U-6 Broad Underutilization */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">3. Broadest Slack Metric (U-6)</span>
                <button
                  onClick={() => handleCopyFormula(latexU6, 'u6')}
                  className="p-1 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500"
                  title="Copy LaTeX"
                >
                  {copiedFormula === 'u6' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 font-mono text-xs overflow-x-auto text-purple-600 dark:text-purple-400">
                {latexU6}
              </div>
              <p className="text-[11px] text-zinc-500">
                {"Incorporates marginally attached workers and involuntary part-time economic workers."}
              </p>
            </div>

            {/* 4. Okun's Law GDP Gap */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">4. Okun&apos;s Law Output Gap</span>
                <button
                  onClick={() => handleCopyFormula(latexOkun, 'okun')}
                  className="p-1 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500"
                  title="Copy LaTeX"
                >
                  {copiedFormula === 'okun' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 font-mono text-xs overflow-x-auto text-purple-600 dark:text-purple-400">
                {latexOkun}
              </div>
              <p className="text-[11px] text-zinc-500">
                {"Quantifies percentage output lost when unemployment exceeds natural rate NAIRU."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

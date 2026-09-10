import { useState, useMemo } from 'react';
import {
  Copy, Check, RotateCcw,
  Sparkles, BarChart2,
  Sliders, ChevronDown, ChevronUp,
  Calculator, Layers, Scale,
  Activity, TrendingUp,
  Globe, ShieldCheck,
  Target, ArrowRight,
  Zap, ArrowLeftRight
} from 'lucide-react';

type AdvantageModel = 'output_model' | 'input_model' | 'terms_of_trade_bargain' | 'gains_from_trade_ppf';

interface PresetScenario {
  name: string;
  category: string;
  badgeColor: string;
  mode: AdvantageModel;
  countryAName: string;
  countryBName: string;
  goodXName: string;
  goodYName: string;
  countryA_X: number;
  countryA_Y: number;
  countryB_X: number;
  countryB_Y: number;
  termsOfTrade: number;
  tradeUnitsX: number;
}

const PRESETS: PresetScenario[] = [
  {
    name: 'Ricardo Classic (England & Portugal)',
    category: 'Historical Benchmark',
    badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
    mode: 'output_model',
    countryAName: 'England',
    countryBName: 'Portugal',
    goodXName: 'Cloth',
    goodYName: 'Wine',
    countryA_X: 100,
    countryA_Y: 60,
    countryB_X: 90,
    countryB_Y: 120,
    termsOfTrade: 0.90,
    tradeUnitsX: 40
  },
  {
    name: 'US vs China (Software & Hardware)',
    category: 'Modern Global Trade',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    mode: 'output_model',
    countryAName: 'United States',
    countryBName: 'China',
    goodXName: 'Software',
    goodYName: 'Hardware',
    countryA_X: 80,
    countryA_Y: 40,
    countryB_X: 30,
    countryB_Y: 90,
    termsOfTrade: 1.20,
    tradeUnitsX: 35
  },
  {
    name: 'Aircraft vs Wheat (US & Brazil)',
    category: 'Industrial vs Agri',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    mode: 'gains_from_trade_ppf',
    countryAName: 'United States',
    countryBName: 'Brazil',
    goodXName: 'Aircraft',
    goodYName: 'Wheat (kt)',
    countryA_X: 10,
    countryA_Y: 100,
    countryB_X: 2,
    countryB_Y: 60,
    termsOfTrade: 18.0,
    tradeUnitsX: 4
  },
  {
    name: 'Taiwan vs Germany (Silicon & Autos)',
    category: 'Advanced Manufacturing',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    mode: 'terms_of_trade_bargain',
    countryAName: 'Taiwan',
    countryBName: 'Germany',
    goodXName: 'Silicon Wafers',
    goodYName: 'Automobiles',
    countryA_X: 150,
    countryA_Y: 30,
    countryB_X: 50,
    countryB_Y: 80,
    termsOfTrade: 0.60,
    tradeUnitsX: 60
  },
  {
    name: 'India vs South Korea (IT vs Displays)',
    category: 'Services & Tech',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
    mode: 'output_model',
    countryAName: 'India',
    countryBName: 'South Korea',
    goodXName: 'IT Services',
    goodYName: 'Display Panels',
    countryA_X: 120,
    countryA_Y: 30,
    countryB_X: 40,
    countryB_Y: 100,
    termsOfTrade: 0.80,
    tradeUnitsX: 50
  },
  {
    name: 'Absolute Advantage Dominance Paradox',
    category: 'Dominance Paradox',
    badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
    mode: 'output_model',
    countryAName: 'Alpha (Leader)',
    countryBName: 'Beta (Follower)',
    goodXName: 'Good X',
    goodYName: 'Good Y',
    countryA_X: 100,
    countryA_Y: 200,
    countryB_X: 20,
    countryB_Y: 80,
    termsOfTrade: 2.80,
    tradeUnitsX: 30
  }
];

export default function ComparativeAdvantageCalculator() {
  const [mode, setMode] = useState<AdvantageModel>('output_model');

  // Country & Good Labels
  const [countryAName, setCountryAName] = useState<string>('England');
  const [countryBName, setCountryBName] = useState<string>('Portugal');
  const [goodXName, setGoodXName] = useState<string>('Cloth');
  const [goodYName, setGoodYName] = useState<string>('Wine');

  // Productivity Numbers (Output per unit time OR labor-hours per unit)
  const [countryA_X, setCountryA_X] = useState<number>(100);
  const [countryA_Y, setCountryA_Y] = useState<number>(60);
  const [countryB_X, setCountryB_X] = useState<number>(90);
  const [countryB_Y, setCountryB_Y] = useState<number>(120);

  // Trade Terms
  const [termsOfTrade, setTermsOfTrade] = useState<number>(0.90); // Price of 1 X in units of Y
  const [tradeUnitsX, setTradeUnitsX] = useState<number>(40);

  // UI States
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(true);

  // Apply Preset
  const handleApplyPreset = (preset: PresetScenario) => {
    setMode(preset.mode);
    setCountryAName(preset.countryAName);
    setCountryBName(preset.countryBName);
    setGoodXName(preset.goodXName);
    setGoodYName(preset.goodYName);
    setCountryA_X(preset.countryA_X);
    setCountryA_Y(preset.countryA_Y);
    setCountryB_X(preset.countryB_X);
    setCountryB_Y(preset.countryB_Y);
    setTermsOfTrade(preset.termsOfTrade);
    setTradeUnitsX(preset.tradeUnitsX);
  };

  // Reset to Defaults
  const handleReset = () => {
    handleApplyPreset(PRESETS[0]);
  };

  // Calculations
  const results = useMemo(() => {
    const isInputModel = mode === 'input_model';

    // 1. Opportunity Costs
    // In Output Model: OC_A(X) = Y_A / X_A (give up Y to get X)
    // In Input Model: OC_A(X) = a_LX / a_LY (hours for X / hours for Y)
    let ocA_X = 0;
    let ocA_Y = 0;
    let ocB_X = 0;
    let ocB_Y = 0;

    if (isInputModel) {
      ocA_X = countryA_Y > 0 ? countryA_X / countryA_Y : 0;
      ocA_Y = countryA_X > 0 ? countryA_Y / countryA_X : 0;
      ocB_X = countryB_Y > 0 ? countryB_X / countryB_Y : 0;
      ocB_Y = countryB_X > 0 ? countryB_Y / countryB_X : 0;
    } else {
      ocA_X = countryA_X > 0 ? countryA_Y / countryA_X : 0;
      ocA_Y = countryA_Y > 0 ? countryA_X / countryA_Y : 0;
      ocB_X = countryB_X > 0 ? countryB_Y / countryB_X : 0;
      ocB_Y = countryB_Y > 0 ? countryB_X / countryB_Y : 0;
    }

    // 2. Absolute Advantage
    // Output model: higher is better. Input model: lower hours is better.
    let absAdvX = 'Tie';
    let absAdvY = 'Tie';

    if (isInputModel) {
      if (countryA_X < countryB_X) absAdvX = countryAName;
      else if (countryB_X < countryA_X) absAdvX = countryBName;

      if (countryA_Y < countryB_Y) absAdvY = countryAName;
      else if (countryB_Y < countryA_Y) absAdvY = countryBName;
    } else {
      if (countryA_X > countryB_X) absAdvX = countryAName;
      else if (countryB_X > countryA_X) absAdvX = countryBName;

      if (countryA_Y > countryB_Y) absAdvY = countryAName;
      else if (countryB_Y > countryA_Y) absAdvY = countryBName;
    }

    // 3. Comparative Advantage (Lower Opportunity Cost)
    let compAdvX = countryAName;
    let compAdvY = countryBName;
    let compXIsA = true;

    if (ocA_X < ocB_X) {
      compAdvX = countryAName;
      compAdvY = countryBName;
      compXIsA = true;
    } else if (ocB_X < ocA_X) {
      compAdvX = countryBName;
      compAdvY = countryAName;
      compXIsA = false;
    }

    // 4. Terms of Trade (TOT) Range for 1 unit of Good X in terms of Good Y
    const minTotX = Math.min(ocA_X, ocB_X);
    const maxTotX = Math.max(ocA_X, ocB_X);
    const isTotBeneficial = termsOfTrade > minTotX && termsOfTrade < maxTotX;

    // Gains per unit of X traded
    const exporterName = compAdvX;
    const importerName = compAdvY;
    const exporterGainPerX = compXIsA ? termsOfTrade - ocA_X : termsOfTrade - ocB_X;
    const importerGainPerX = compXIsA ? ocB_X - termsOfTrade : ocA_X - termsOfTrade;
    const totalGainsPerX = exporterGainPerX + importerGainPerX; // maxTotX - minTotX

    // Total Trade Gains for volume tradeUnitsX
    const exporterTotalGainY = exporterGainPerX * tradeUnitsX;
    const importerTotalGainY = importerGainPerX * tradeUnitsX;
    const totalWorldGainY = totalGainsPerX * tradeUnitsX;

    // Autarky vs Specialization Simulation (Assuming 50/50 split of resources in autarky)
    const autarkyA_X = countryA_X * 0.5;
    const autarkyA_Y = countryA_Y * 0.5;
    const autarkyB_X = countryB_X * 0.5;
    const autarkyB_Y = countryB_Y * 0.5;
    const totalAutarkyX = autarkyA_X + autarkyB_X;
    const totalAutarkyY = autarkyA_Y + autarkyB_Y;

    // Specialization (100% in comparative advantage good)
    const specA_X = compXIsA ? countryA_X : 0;
    const specA_Y = compXIsA ? 0 : countryA_Y;
    const specB_X = compXIsA ? 0 : countryB_X;
    const specB_Y = compXIsA ? countryB_Y : 0;
    const totalSpecX = specA_X + specB_X;
    const totalSpecY = specA_Y + specB_Y;

    const netWorldGainX = totalSpecX - totalAutarkyX;
    const netWorldGainY = totalSpecY - totalAutarkyY;

    // Post-Trade Consumption
    // Exporter of X sends tradeUnitsX of X and receives tradeUnitsX * TOT of Y
    const tradedY = tradeUnitsX * termsOfTrade;
    let postTradeA_X = 0;
    let postTradeA_Y = 0;
    let postTradeB_X = 0;
    let postTradeB_Y = 0;

    if (compXIsA) {
      postTradeA_X = specA_X - tradeUnitsX;
      postTradeA_Y = tradedY;
      postTradeB_X = tradeUnitsX;
      postTradeB_Y = specB_Y - tradedY;
    } else {
      postTradeA_X = tradeUnitsX;
      postTradeA_Y = specA_Y - tradedY;
      postTradeB_X = specB_X - tradeUnitsX;
      postTradeB_Y = tradedY;
    }

    const netGainA_X = postTradeA_X - autarkyA_X;
    const netGainA_Y = postTradeA_Y - autarkyA_Y;
    const netGainB_X = postTradeB_X - autarkyB_X;
    const netGainB_Y = postTradeB_Y - autarkyB_Y;

    return {
      isInputModel,
      ocA_X,
      ocA_Y,
      ocB_X,
      ocB_Y,
      absAdvX,
      absAdvY,
      compAdvX,
      compAdvY,
      compXIsA,
      minTotX,
      maxTotX,
      isTotBeneficial,
      exporterName,
      importerName,
      exporterGainPerX,
      importerGainPerX,
      totalGainsPerX,
      exporterTotalGainY,
      importerTotalGainY,
      totalWorldGainY,
      autarkyA_X,
      autarkyA_Y,
      autarkyB_X,
      autarkyB_Y,
      totalAutarkyX,
      totalAutarkyY,
      specA_X,
      specA_Y,
      specB_X,
      specB_Y,
      totalSpecX,
      totalSpecY,
      netWorldGainX,
      netWorldGainY,
      tradedY,
      postTradeA_X,
      postTradeA_Y,
      postTradeB_X,
      postTradeB_Y,
      netGainA_X,
      netGainA_Y,
      netGainB_X,
      netGainB_Y
    };
  }, [mode, countryAName, countryBName, countryA_X, countryA_Y, countryB_X, countryB_Y, termsOfTrade, tradeUnitsX]);

  // 5x5 Sensitivity Matrix: Terms of Trade vs Traded Volume (X)
  const sensitivityMatrix = useMemo(() => {
    const totFactors = [0.7, 0.85, 1.0, 1.15, 1.3];
    const totValues = totFactors.map(f => {
      const mid = (results.minTotX + results.maxTotX) / 2;
      const span = (results.maxTotX - results.minTotX) / 2;
      return +(mid + (f - 1.0) * span).toFixed(2);
    });

    const volumeFactors = [0.5, 0.75, 1.0, 1.25, 1.5];
    const volumeValues = volumeFactors.map(f => Math.round(tradeUnitsX * f));

    return totValues.map((tVal) => {
      const cells = volumeValues.map((vol) => {
        const isBeneficial = tVal > results.minTotX && tVal < results.maxTotX;
        const expGain = results.compXIsA ? (tVal - results.ocA_X) * vol : (tVal - results.ocB_X) * vol;
        const impGain = results.compXIsA ? (results.ocB_X - tVal) * vol : (results.ocA_X - tVal) * vol;

        return {
          vol,
          tVal,
          isBeneficial,
          expGain,
          impGain,
          isBaseline: Math.abs(tVal - termsOfTrade) < 0.05 && vol === tradeUnitsX
        };
      });
      return { tVal, cells };
    });
  }, [results.minTotX, results.maxTotX, results.compXIsA, results.ocA_X, results.ocB_X, tradeUnitsX, termsOfTrade]);

  // SVG PPF and CPF Chart Geometry
  const svgData = useMemo(() => {
    const width = 640;
    const height = 340;
    const padding = { top: 30, right: 40, bottom: 50, left: 65 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const maxX = Math.max(countryA_X, countryB_X, results.totalSpecX, results.postTradeA_X, results.postTradeB_X, 10) * 1.25;
    const maxY = Math.max(countryA_Y, countryB_Y, results.totalSpecY, results.postTradeA_Y, results.postTradeB_Y, 10) * 1.25;

    const xScale = (val: number) => padding.left + (Math.max(0, Math.min(val, maxX)) / maxX) * chartW;
    const yScale = (val: number) => padding.top + chartH - (Math.max(0, Math.min(val, maxY)) / maxY) * chartH;

    // Country A PPF: (0, countryA_Y) to (countryA_X, 0)
    const ppfA_Start = { x: xScale(0), y: yScale(countryA_Y) };
    const ppfA_End = { x: xScale(countryA_X), y: yScale(0) };

    // Country B PPF: (0, countryB_Y) to (countryB_X, 0)
    const ppfB_Start = { x: xScale(0), y: yScale(countryB_Y) };
    const ppfB_End = { x: xScale(countryB_X), y: yScale(0) };

    // Post Trade Points
    const ptA = { x: xScale(results.postTradeA_X), y: yScale(results.postTradeA_Y) };
    const ptB = { x: xScale(results.postTradeB_X), y: yScale(results.postTradeB_Y) };

    // Autarky Points
    const autA = { x: xScale(results.autarkyA_X), y: yScale(results.autarkyA_Y) };
    const autB = { x: xScale(results.autarkyB_X), y: yScale(results.autarkyB_Y) };

    return {
      width,
      height,
      padding,
      chartW,
      chartH,
      maxX,
      maxY,
      xScale,
      yScale,
      ppfA_Start,
      ppfA_End,
      ppfB_Start,
      ppfB_End,
      ptA,
      ptB,
      autA,
      autB
    };
  }, [countryA_X, countryA_Y, countryB_X, countryB_Y, results]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormula(id);
    setTimeout(() => setCopiedFormula(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 text-left pb-16">
      {/* Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-xl">
              <Globe className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Comparative Advantage & International Trade Suite
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Determine Ricardian specializations, opportunity cost ratios, terms of trade bargaining corridors, and mutual consumption gains.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="p-2 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors self-end sm:self-center"
          title="Reset to Ricardo baseline"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Preset Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Bilateral Trade Scenarios & Historical Benchmarks
          </span>
          <span className="text-xs text-zinc-400">Select calibrated trade model</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => handleApplyPreset(p)}
              className="p-3 text-left bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-600 rounded-xl transition-all shadow-xs hover:shadow-md group flex flex-col justify-between"
            >
              <div>
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-1.5 ${p.badgeColor}`}>
                  {p.category}
                </span>
                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                  {p.name}
                </p>
              </div>
              <span className="text-[10px] text-zinc-400 mt-2 flex items-center gap-1">
                Load model <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-zinc-100 dark:bg-zinc-800/60 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setMode('output_model')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            mode === 'output_model'
              ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Output Model (Units/Time)</span>
        </button>

        <button
          onClick={() => setMode('input_model')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            mode === 'input_model'
              ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Input Model (Labor-Hours)</span>
        </button>

        <button
          onClick={() => setMode('terms_of_trade_bargain')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            mode === 'terms_of_trade_bargain'
              ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Terms of Trade Bargaining</span>
        </button>

        <button
          onClick={() => setMode('gains_from_trade_ppf')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            mode === 'gains_from_trade_ppf'
              ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>PPF & Global Surplus</span>
        </button>
      </div>

      {/* Main Grid: Parameter Controls (5 cols) + Hero Card (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Inputs (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                Country & Product Customization
              </span>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline"
              >
                {showAdvanced ? 'Hide Labels' : 'Edit Labels'}
                {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Editable Names */}
            {showAdvanced && (
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 mb-1">Country A</label>
                  <input
                    type="text"
                    value={countryAName}
                    onChange={(e) => setCountryAName(e.target.value || 'Country A')}
                    className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800/80 border rounded-lg text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 mb-1">Country B</label>
                  <input
                    type="text"
                    value={countryBName}
                    onChange={(e) => setCountryBName(e.target.value || 'Country B')}
                    className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800/80 border rounded-lg text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 mb-1">Good X Name</label>
                  <input
                    type="text"
                    value={goodXName}
                    onChange={(e) => setGoodXName(e.target.value || 'Good X')}
                    className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800/80 border rounded-lg text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 mb-1">Good Y Name</label>
                  <input
                    type="text"
                    value={goodYName}
                    onChange={(e) => setGoodYName(e.target.value || 'Good Y')}
                    className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800/80 border rounded-lg text-xs font-semibold"
                  />
                </div>
              </div>
            )}

            {/* Country A Inputs */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {countryAName} Productivity
                </span>
                <span className="text-[10px] text-zinc-400">
                  {mode === 'input_model' ? 'Hours required / unit' : 'Units produced / resource'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    {goodXName} (X)
                  </label>
                  <input
                    type="number"
                    value={countryA_X}
                    onChange={(e) => setCountryA_X(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border rounded-xl text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    {goodYName} (Y)
                  </label>
                  <input
                    type="number"
                    value={countryA_Y}
                    onChange={(e) => setCountryA_Y(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border rounded-xl text-sm font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Country B Inputs */}
            <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                  {countryBName} Productivity
                </span>
                <span className="text-[10px] text-zinc-400">
                  {mode === 'input_model' ? 'Hours required / unit' : 'Units produced / resource'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    {goodXName} (X)
                  </label>
                  <input
                    type="number"
                    value={countryB_X}
                    onChange={(e) => setCountryB_X(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border rounded-xl text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    {goodYName} (Y)
                  </label>
                  <input
                    type="number"
                    value={countryB_Y}
                    onChange={(e) => setCountryB_Y(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border rounded-xl text-sm font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Terms of Trade & Trade Volume Controls */}
            <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Terms of Trade (Price: 1 {goodXName} = ? {goodYName})
                  </label>
                  <span className={`text-[11px] font-mono font-bold ${
                    results.isTotBeneficial ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {results.isTotBeneficial ? 'Mutually Beneficial' : 'Unviable Out of Range'}
                  </span>
                </div>
                <input
                  type="number"
                  step="0.05"
                  min="0.01"
                  value={termsOfTrade}
                  onChange={(e) => setTermsOfTrade(Math.max(0.01, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border rounded-xl text-sm font-mono"
                />
                <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
                  <span>Min ({results.exporterName} OC): {results.minTotX.toFixed(2)} {goodYName}</span>
                  <span>Max ({results.importerName} OC): {results.maxTotX.toFixed(2)} {goodYName}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Trade Volume ({goodXName} Exported)
                </label>
                <input
                  type="number"
                  value={tradeUnitsX}
                  onChange={(e) => setTradeUnitsX(Math.max(1, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border rounded-xl text-sm font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Hero & Specialization Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-indigo-800/30">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs uppercase font-bold tracking-widest text-indigo-300 flex items-center gap-1.5">
                  <ArrowLeftRight className="w-4 h-4 text-amber-400" />
                  Comparative Advantage & Specialization
                </span>
                <div className="space-y-1.5 my-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-indigo-200">{results.compAdvX}</span>
                    <span className="text-xs bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full font-mono">
                      Specializes in {goodXName} (X)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-purple-200">{results.compAdvY}</span>
                    <span className="text-xs bg-purple-500/30 text-purple-300 px-2 py-0.5 rounded-full font-mono">
                      Specializes in {goodYName} (Y)
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                  results.isTotBeneficial
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {results.isTotBeneficial ? <TrendingUp className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  {results.isTotBeneficial ? 'Gains from Trade' : 'Trade Rejected'}
                </span>
                <p className="text-xs font-mono text-indigo-200 mt-1">
                  1 {goodXName} = {termsOfTrade.toFixed(2)} {goodYName}
                </p>
              </div>
            </div>

            {/* Opportunity Cost Comparison Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 mt-4 border-t border-white/10 text-xs">
              <div className="bg-white/5 rounded-xl p-2.5 backdrop-blur-xs">
                <span className="text-indigo-300 block text-[10px] font-medium uppercase">{countryAName} OC of X</span>
                <span className="text-base font-bold font-mono text-white mt-0.5 block">
                  {results.ocA_X.toFixed(2)} {goodYName}
                </span>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5 backdrop-blur-xs">
                <span className="text-indigo-300 block text-[10px] font-medium uppercase">{countryBName} OC of X</span>
                <span className="text-base font-bold font-mono text-white mt-0.5 block">
                  {results.ocB_X.toFixed(2)} {goodYName}
                </span>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5 backdrop-blur-xs">
                <span className="text-indigo-300 block text-[10px] font-medium uppercase">{countryAName} OC of Y</span>
                <span className="text-base font-bold font-mono text-white mt-0.5 block">
                  {results.ocA_Y.toFixed(2)} {goodXName}
                </span>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5 backdrop-blur-xs">
                <span className="text-indigo-300 block text-[10px] font-medium uppercase">{countryBName} OC of Y</span>
                <span className="text-base font-bold font-mono text-white mt-0.5 block">
                  {results.ocB_Y.toFixed(2)} {goodXName}
                </span>
              </div>
            </div>
          </div>

          {/* Terms of Trade Bargaining Corridor Bar */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-indigo-500" />
                Terms of Trade Bargaining Corridor (1 {goodXName} in {goodYName})
              </span>
              <span className="text-zinc-400 font-mono text-[11px]">
                Range: [{results.minTotX.toFixed(2)} , {results.maxTotX.toFixed(2)}]
              </span>
            </div>

            {/* Visual Bargaining Track */}
            <div className="relative w-full h-8 bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden flex items-center px-4">
              <div className="absolute inset-y-0 left-0 bg-rose-500/20 border-r border-rose-500/40 w-1/4 flex items-center justify-center text-[10px] text-rose-600 dark:text-rose-400 font-semibold">
                Exporter Loss
              </div>
              <div className="absolute inset-y-0 left-1/4 right-1/4 bg-emerald-500/20 border-x border-emerald-500/40 flex items-center justify-center text-[10px] text-emerald-700 dark:text-emerald-300 font-bold">
                Mutually Beneficial Trade Corridor
              </div>
              <div className="absolute inset-y-0 right-0 bg-rose-500/20 border-l border-rose-500/40 w-1/4 flex items-center justify-center text-[10px] text-rose-600 dark:text-rose-400 font-semibold">
                Importer Loss
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900">
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">{results.exporterName} (Exporter) Surplus</span>
                <span className="text-base font-bold font-mono text-indigo-700 dark:text-indigo-300">
                  +{results.exporterTotalGainY.toFixed(1)} {goodYName}
                </span>
                <span className="text-[10px] text-indigo-500 block">
                  (+{results.exporterGainPerX.toFixed(2)} per {goodXName})
                </span>
              </div>

              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900">
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">{results.importerName} (Importer) Surplus</span>
                <span className="text-base font-bold font-mono text-purple-700 dark:text-purple-300">
                  +{results.importerTotalGainY.toFixed(1)} {goodYName}
                </span>
                <span className="text-[10px] text-purple-500 block">
                  (+{results.importerGainPerX.toFixed(2)} saved per {goodXName})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SVG Interactive Production Possibilities Frontier (PPF) & Consumption Points */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" />
              Production Possibilities Frontiers (PPF) & Post-Trade Consumption (CPF)
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Comparative PPF slopes reflect opportunity costs. Trade enables consumption strictly outside domestic PPFs.
            </p>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-indigo-600 dark:bg-indigo-400" />
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{countryAName} PPF</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-purple-600 dark:bg-purple-400" />
              <span className="text-purple-600 dark:text-purple-400 font-semibold">{countryBName} PPF</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Post-Trade CPF Point</span>
            </div>
          </div>
        </div>

        <div className="relative w-full overflow-x-auto bg-zinc-50/50 dark:bg-zinc-950/50 rounded-xl p-2 border border-zinc-100 dark:border-zinc-800">
          <svg
            viewBox={`0 0 ${svgData.width} ${svgData.height}`}
            className="w-full h-auto max-h-[360px] font-sans select-none"
          >
            {/* Grid & Axis Lines */}
            <line
              x1={svgData.padding.left}
              y1={svgData.padding.top + svgData.chartH}
              x2={svgData.padding.left + svgData.chartW}
              y2={svgData.padding.top + svgData.chartH}
              stroke="currentColor"
              className="text-zinc-300 dark:text-zinc-700"
              strokeWidth="1.5"
            />
            <line
              x1={svgData.padding.left}
              y1={svgData.padding.top}
              x2={svgData.padding.left}
              y2={svgData.padding.top + svgData.chartH}
              stroke="currentColor"
              className="text-zinc-300 dark:text-zinc-700"
              strokeWidth="1.5"
            />

            {/* Country A PPF Line */}
            <line
              x1={svgData.ppfA_Start.x}
              y1={svgData.ppfA_Start.y}
              x2={svgData.ppfA_End.x}
              y2={svgData.ppfA_End.y}
              stroke="#4f46e5"
              strokeWidth="2.5"
            />
            <text
              x={svgData.ppfA_End.x - 10}
              y={svgData.ppfA_End.y - 8}
              className="text-[10px] font-bold fill-indigo-600 dark:fill-indigo-400"
            >
              {countryAName} ({countryA_X})
            </text>

            {/* Country B PPF Line */}
            <line
              x1={svgData.ppfB_Start.x}
              y1={svgData.ppfB_Start.y}
              x2={svgData.ppfB_End.x}
              y2={svgData.ppfB_End.y}
              stroke="#9333ea"
              strokeWidth="2.5"
              strokeDasharray="4 2"
            />
            <text
              x={svgData.ppfB_End.x - 10}
              y={svgData.ppfB_End.y - 8}
              className="text-[10px] font-bold fill-purple-600 dark:fill-purple-400"
            >
              {countryBName} ({countryB_X})
            </text>

            {/* Post-Trade Consumption Point for Country A */}
            <circle
              cx={svgData.ptA.x}
              cy={svgData.ptA.y}
              r="6"
              className="fill-indigo-600 stroke-white dark:stroke-zinc-900 stroke-2"
            />
            <circle
              cx={svgData.ptA.x}
              cy={svgData.ptA.y}
              r="10"
              className="fill-indigo-500/20 animate-ping pointer-events-none"
            />
            <text
              x={svgData.ptA.x + 8}
              y={svgData.ptA.y - 6}
              className="text-[10px] font-bold fill-indigo-700 dark:fill-indigo-300 font-mono"
            >
              {countryAName} Post-Trade ({results.postTradeA_X.toFixed(0)}X, {results.postTradeA_Y.toFixed(0)}Y)
            </text>

            {/* Post-Trade Consumption Point for Country B */}
            <circle
              cx={svgData.ptB.x}
              cy={svgData.ptB.y}
              r="6"
              className="fill-purple-600 stroke-white dark:stroke-zinc-900 stroke-2"
            />
            <text
              x={svgData.ptB.x + 8}
              y={svgData.ptB.y - 6}
              className="text-[10px] font-bold fill-purple-700 dark:fill-purple-300 font-mono"
            >
              {countryBName} Post-Trade ({results.postTradeB_X.toFixed(0)}X, {results.postTradeB_Y.toFixed(0)}Y)
            </text>

            {/* Axis Titles */}
            <text
              x={svgData.padding.left + svgData.chartW / 2}
              y={svgData.height - 10}
              textAnchor="middle"
              className="text-xs font-semibold fill-zinc-600 dark:fill-zinc-400"
            >
              Production / Consumption of {goodXName} (Units)
            </text>
            <text
              transform={`rotate(-90) translate(-${svgData.padding.top + svgData.chartH / 2}, 16)`}
              textAnchor="middle"
              className="text-xs font-semibold fill-zinc-600 dark:fill-zinc-400"
            >
              Production / Consumption of {goodYName} (Units)
            </text>
          </svg>
        </div>
      </div>

      {/* Autarky vs Specialization Gains Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              Autarky (No Trade) vs Complete Specialization & Trade Flow
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Shows how world production and individual country welfare expand beyond domestic autarky limits.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 font-semibold border-b border-zinc-200 dark:border-zinc-700">
                <th className="py-2.5 px-3">State / Stage</th>
                <th className="py-2.5 px-3">{countryAName} ({goodXName})</th>
                <th className="py-2.5 px-3">{countryAName} ({goodYName})</th>
                <th className="py-2.5 px-3">{countryBName} ({goodXName})</th>
                <th className="py-2.5 px-3">{countryBName} ({goodYName})</th>
                <th className="py-2.5 px-3">Global {goodXName}</th>
                <th className="py-2.5 px-3">Global {goodYName}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-mono">
              <tr>
                <td className="py-2 px-3 font-bold text-zinc-600 dark:text-zinc-400 font-sans">1. Autarky (50/50 Split)</td>
                <td className="py-2 px-3">{results.autarkyA_X.toFixed(1)}</td>
                <td className="py-2 px-3">{results.autarkyA_Y.toFixed(1)}</td>
                <td className="py-2 px-3">{results.autarkyB_X.toFixed(1)}</td>
                <td className="py-2 px-3">{results.autarkyB_Y.toFixed(1)}</td>
                <td className="py-2 px-3 font-bold text-zinc-700 dark:text-zinc-300">{results.totalAutarkyX.toFixed(1)}</td>
                <td className="py-2 px-3 font-bold text-zinc-700 dark:text-zinc-300">{results.totalAutarkyY.toFixed(1)}</td>
              </tr>
              <tr className="bg-indigo-50/50 dark:bg-indigo-950/30">
                <td className="py-2 px-3 font-bold text-indigo-700 dark:text-indigo-300 font-sans">2. Specialized Production</td>
                <td className="py-2 px-3 font-bold">{results.specA_X.toFixed(1)}</td>
                <td className="py-2 px-3 font-bold">{results.specA_Y.toFixed(1)}</td>
                <td className="py-2 px-3 font-bold">{results.specB_X.toFixed(1)}</td>
                <td className="py-2 px-3 font-bold">{results.specB_Y.toFixed(1)}</td>
                <td className="py-2 px-3 font-bold text-indigo-700 dark:text-indigo-300">{results.totalSpecX.toFixed(1)}</td>
                <td className="py-2 px-3 font-bold text-indigo-700 dark:text-indigo-300">{results.totalSpecY.toFixed(1)}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold text-purple-600 dark:text-purple-400 font-sans">3. Trade Exchange Flow</td>
                <td className="py-2 px-3 text-rose-600">{results.compXIsA ? `-${tradeUnitsX}` : `+${tradeUnitsX}`}</td>
                <td className="py-2 px-3 text-emerald-600">{results.compXIsA ? `+${results.tradedY.toFixed(1)}` : `-${results.tradedY.toFixed(1)}`}</td>
                <td className="py-2 px-3 text-emerald-600">{results.compXIsA ? `+${tradeUnitsX}` : `-${tradeUnitsX}`}</td>
                <td className="py-2 px-3 text-rose-600">{results.compXIsA ? `-${results.tradedY.toFixed(1)}` : `+${results.tradedY.toFixed(1)}`}</td>
                <td className="py-2 px-3 text-zinc-400">Net 0</td>
                <td className="py-2 px-3 text-zinc-400">Net 0</td>
              </tr>
              <tr className="bg-emerald-50/80 dark:bg-emerald-950/60 font-bold border-t-2 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200">
                <td className="py-2.5 px-3 font-sans uppercase text-[11px]">4. Post-Trade Consumption</td>
                <td className="py-2.5 px-3">{results.postTradeA_X.toFixed(1)}</td>
                <td className="py-2.5 px-3">{results.postTradeA_Y.toFixed(1)}</td>
                <td className="py-2.5 px-3">{results.postTradeB_X.toFixed(1)}</td>
                <td className="py-2.5 px-3">{results.postTradeB_Y.toFixed(1)}</td>
                <td className="py-2.5 px-3 text-emerald-700 dark:text-emerald-300">+{results.netWorldGainX.toFixed(1)} Net</td>
                <td className="py-2.5 px-3 text-emerald-700 dark:text-emerald-300">+{results.netWorldGainY.toFixed(1)} Net</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 5x5 Sensitivity Matrix: Terms of Trade vs Traded Volume */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-indigo-500" />
              5×5 Sensitivity Matrix: Terms of Trade vs Export Volume ({goodXName})
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Shows how total trade gains and welfare surplus are distributed between the exporter and importer.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              <tr className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                <th className="p-2.5 text-left border border-zinc-200 dark:border-zinc-700 font-semibold">
                  TOT (Price) \ Volume
                </th>
                {sensitivityMatrix[0]?.cells.map((c, i) => (
                  <th key={i} className="p-2.5 border border-zinc-200 dark:border-zinc-700 font-mono">
                    {c.vol} units of {goodXName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sensitivityMatrix.map((row) => (
                <tr key={row.tVal} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="p-2 text-left font-bold font-mono border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 text-zinc-800 dark:text-zinc-200">
                    1X = {row.tVal.toFixed(2)}Y
                  </td>
                  {row.cells.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      className={`p-2 border border-zinc-200 dark:border-zinc-700 font-mono ${
                        cell.isBaseline
                          ? 'bg-indigo-100 dark:bg-indigo-900/60 font-black text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500'
                          : cell.isBeneficial
                          ? 'text-zinc-700 dark:text-zinc-300'
                          : 'bg-rose-50/50 dark:bg-rose-950/20 text-rose-500'
                      }`}
                    >
                      <div className="font-bold">
                        {cell.isBeneficial ? `+${cell.expGain.toFixed(0)} / +${cell.impGain.toFixed(0)}` : 'Unviable'}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-sans">
                        {cell.isBeneficial ? 'Exp / Imp Surplus' : 'Outside Band'}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* LaTeX Formal Mathematical Proofs */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Formal Ricardian Trade Proofs & Mathematical Framework
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Rigorous economic derivations formatted in LaTeX. Click any equation block to copy for academic citations.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Proof 1: Opportunity Cost in Output vs Input Models */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2 relative group">
            <div className="flex justify-between items-center">
              <span className="font-bold text-zinc-800 dark:text-zinc-200">1. Opportunity Cost Formulations</span>
              <button
                onClick={() => copyToClipboard('\text{Output: } OC_A(X) = \frac{Y_A}{X_A}, \quad \text{Input: } OC_A(X) = \frac{a_{LX}}{a_{LY}}', 'oc_proof')}
                className="text-zinc-400 hover:text-indigo-600 transition-colors"
                title="Copy LaTeX"
              >
                {copiedFormula === 'oc_proof' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-zinc-400" />}
              </button>
            </div>
            <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border font-mono text-[11px] text-indigo-900 dark:text-indigo-300 overflow-x-auto">
              {"\text{Output Model: } OC_A(X) = \frac{Y_A}{X_A} \text{ units of Y}"}
              <br />
              {"\text{Input Model: } OC_A(X) = \frac{a_{LX}}{a_{LY}} \text{ units of Y}"}
              <br />
              {"\implies OC_A(Y) = \frac{1}{OC_A(X)}"}
            </div>
            <p className="text-[11px] text-zinc-500">
              Opportunity costs are reciprocal: if Country A has a lower opportunity cost in X, Country B must have a lower opportunity cost in Y.
            </p>
          </div>

          {/* Proof 2: Comparative Advantage Condition */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2 relative group">
            <div className="flex justify-between items-center">
              <span className="font-bold text-zinc-800 dark:text-zinc-200">2. Comparative Advantage Condition</span>
              <button
                onClick={() => copyToClipboard('OC_A(X) < OC_B(X) \iff \frac{Y_A}{X_A} < \frac{Y_B}{X_B} \implies A \text{ specializes in } X', 'comp_proof')}
                className="text-zinc-400 hover:text-indigo-600 transition-colors"
                title="Copy LaTeX"
              >
                {copiedFormula === 'comp_proof' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-zinc-400" />}
              </button>
            </div>
            <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border font-mono text-[11px] text-indigo-900 dark:text-indigo-300 overflow-x-auto">
              {"OC_A(X) < OC_B(X) \iff \frac{Y_A}{X_A} < \frac{Y_B}{X_B}"}
              <br />
              {"\iff \frac{X_B}{Y_B} < \frac{X_A}{Y_A} \iff OC_B(Y) < OC_A(Y)"}
            </div>
            <p className="text-[11px] text-zinc-500">
              Guarantees that both trading partners have a comparative advantage in exactly one distinct commodity.
            </p>
          </div>

          {/* Proof 3: Mutually Beneficial Terms of Trade */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2 relative group">
            <div className="flex justify-between items-center">
              <span className="font-bold text-zinc-800 dark:text-zinc-200">3. Mutually Beneficial Terms of Trade Band</span>
              <button
                onClick={() => copyToClipboard('OC_A(X) < TOT_X < OC_B(X) \implies \text{Gains}_A > 0 \text{ and } \text{Gains}_B > 0', 'tot_proof')}
                className="text-zinc-400 hover:text-indigo-600 transition-colors"
                title="Copy LaTeX"
              >
                {copiedFormula === 'tot_proof' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-zinc-400" />}
              </button>
            </div>
            <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border font-mono text-[11px] text-indigo-900 dark:text-indigo-300 overflow-x-auto">
              {"OC_A(X) < P_X/P_Y < OC_B(X)"}
              <br />
              {"\text{Exporter Surplus: } (P_X/P_Y) - OC_A(X) > 0"}
              <br />
              {"\text{Importer Surplus: } OC_B(X) - (P_X/P_Y) > 0"}
            </div>
            <p className="text-[11px] text-zinc-500">
              Any price strictly inside this band yields positive trade gains for both nations simultaneously.
            </p>
          </div>

          {/* Proof 4: Total Global Output Gains */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2 relative group">
            <div className="flex justify-between items-center">
              <span className="font-bold text-zinc-800 dark:text-zinc-200">4. World Output Maximization Theorem</span>
              <button
                onClick={() => copyToClipboard('\Delta Y_{\text{World}} = (X_A + 0) - (0.5 X_A + 0.5 X_B) + (0 + Y_B) - (0.5 Y_A + 0.5 Y_B) > 0', 'gain_proof')}
                className="text-zinc-400 hover:text-indigo-600 transition-colors"
                title="Copy LaTeX"
              >
                {copiedFormula === 'gain_proof' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-zinc-400" />}
              </button>
            </div>
            <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border font-mono text-[11px] text-indigo-900 dark:text-indigo-300 overflow-x-auto">
              {"\Delta X_{\text{Global}} = X_A - (0.5 X_A + 0.5 X_B) = 0.5(X_A - X_B)"}
              <br />
              {"\Delta Y_{\text{Global}} = Y_B - (0.5 Y_A + 0.5 Y_B) = 0.5(Y_B - Y_A)"}
            </div>
            <p className="text-[11px] text-zinc-500">
              Full specialization according to comparative advantage strictly maximizes aggregate global output.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

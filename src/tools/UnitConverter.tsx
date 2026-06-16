import { useState, useEffect } from 'react';
import { Ruler, ArrowUpDown } from 'lucide-react';

type Category = 'length' | 'weight' | 'temperature' | 'area';

interface Unit {
  value: string;
  label: string;
  ratio?: number; // Ratio relative to base unit (m, kg, sq m)
}

const unitsByCategory: Record<Category, Unit[]> = {
  length: [
    { value: 'mm', label: 'Millimeter (mm)', ratio: 0.001 },
    { value: 'cm', label: 'Centimeter (cm)', ratio: 0.01 },
    { value: 'm', label: 'Meter (m)', ratio: 1.0 },
    { value: 'km', label: 'Kilometer (km)', ratio: 1000.0 },
    { value: 'in', label: 'Inch (in)', ratio: 0.0254 },
    { value: 'ft', label: 'Foot (ft)', ratio: 0.3048 },
    { value: 'yd', label: 'Yard (yd)', ratio: 0.9144 },
    { value: 'mi', label: 'Mile (mi)', ratio: 1609.344 },
  ],
  weight: [
    { value: 'mg', label: 'Milligram (mg)', ratio: 0.000001 },
    { value: 'g', label: 'Gram (g)', ratio: 0.001 },
    { value: 'kg', label: 'Kilogram (kg)', ratio: 1.0 },
    { value: 'oz', label: 'Ounce (oz)', ratio: 0.028349523125 },
    { value: 'lb', label: 'Pound (lb)', ratio: 0.45359237 },
    { value: 'st', label: 'Stone (st)', ratio: 6.35029318 },
  ],
  temperature: [
    { value: 'C', label: 'Celsius (°C)' },
    { value: 'F', label: 'Fahrenheit (°F)' },
    { value: 'K', label: 'Kelvin (K)' },
  ],
  area: [
    { value: 'sq_mm', label: 'Sq Millimeter (mm²)', ratio: 0.000001 },
    { value: 'sq_cm', label: 'Sq Centimeter (cm²)', ratio: 0.0001 },
    { value: 'sq_m', label: 'Sq Meter (m²)', ratio: 1.0 },
    { value: 'sq_km', label: 'Sq Kilometer (km²)', ratio: 1000000.0 },
    { value: 'sq_in', label: 'Sq Inch (in²)', ratio: 0.00064516 },
    { value: 'sq_ft', label: 'Sq Foot (ft²)', ratio: 0.09290304 },
    { value: 'sq_yd', label: 'Sq Yard (yd²)', ratio: 0.83612736 },
    { value: 'acre', label: 'Acre (ac)', ratio: 4046.8564224 },
    { value: 'hectare', label: 'Hectare (ha)', ratio: 10000.0 },
  ],
};

export default function UnitConverter() {
  const [category, setCategory] = useState<Category>('length');
  const [inputValue, setInputValue] = useState<number>(1);
  const [fromUnit, setFromUnit] = useState<string>('m');
  const [toUnit, setToUnit] = useState<string>('cm');
  const [result, setResult] = useState<number>(0);

  const handleCategoryChange = (cat: Category) => {
    setCategory(cat);
    const list = unitsByCategory[cat];
    setFromUnit(list[0].value);
    setToUnit(list[1].value);
  };

  // Convert
  useEffect(() => {
    if (isNaN(inputValue)) {
      setResult(0);
      return;
    }

    if (fromUnit === toUnit) {
      setResult(inputValue);
      return;
    }

    if (category === 'temperature') {
      let tempInC = inputValue;
      // Convert input to Celsius
      if (fromUnit === 'F') {
        tempInC = ((inputValue - 32) * 5) / 9;
      } else if (fromUnit === 'K') {
        tempInC = inputValue - 273.15;
      }

      // Convert Celsius to output unit
      let finalTemp = tempInC;
      if (toUnit === 'F') {
        finalTemp = (tempInC * 9) / 5 + 32;
      } else if (toUnit === 'K') {
        finalTemp = tempInC + 273.15;
      }

      setResult(Number(finalTemp.toFixed(5)));
    } else {
      // Linear conversions via base ratio
      const list = unitsByCategory[category];
      const fromObj = list.find((u) => u.value === fromUnit);
      const toObj = list.find((u) => u.value === toUnit);

      if (fromObj?.ratio && toObj?.ratio) {
        const valueInBase = inputValue * fromObj.ratio;
        const valueInTarget = valueInBase / toObj.ratio;
        setResult(Number(valueInTarget.toFixed(6)));
      }
    }
  }, [inputValue, fromUnit, toUnit, category]);

  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      {/* Left Input Panel */}
      <div className="md:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-5">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Ruler className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Unit Converter</h3>
          </div>
        </div>

        {/* Category Tabs */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2">Category</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['length', 'weight', 'temperature', 'area'] as Category[]).map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize transition ${
                  category === cat
                    ? 'bg-teal-50 border-teal-200 text-teal-600 dark:bg-teal-950/20 dark:border-teal-900/60 dark:text-teal-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Value Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-455 mb-1.5">
            Value
          </label>
          <input
            type="number"
            value={inputValue || ''}
            onChange={(e) => setInputValue(parseFloat(e.target.value) || 0)}
            className="saas-input"
          />
        </div>

        {/* Units selectors & swap */}
        <div className="grid grid-cols-1 sm:grid-cols-9 items-center gap-3">
          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              From
            </label>
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="saas-select"
            >
              {unitsByCategory[category].map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-1 flex justify-center pt-5">
            <button
              onClick={handleSwap}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-500 hover:text-teal-500 dark:hover:text-teal-400 transition"
              title="Swap Units"
            >
              <ArrowUpDown className="w-4 h-4 sm:rotate-90" />
            </button>
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              To
            </label>
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="saas-select"
            >
              {unitsByCategory[category].map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Right Output Panel */}
      <div className="md:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-4">
            Conversion Result
          </span>

          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-slate-400">
                {inputValue} {fromUnit} =
              </span>
              <div className="text-2xl md:text-3xl font-black text-teal-650 dark:text-teal-400 mt-1 leading-tight font-mono break-all">
                {result.toLocaleString(undefined, { maximumFractionDigits: 6 })} {toUnit}
              </div>
            </div>

            {/* Quick formulas or extra stats */}
            <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4">
              <span className="text-xs font-semibold text-slate-450 dark:text-slate-400 block mb-2">
                Conversion Details
              </span>
              <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-mono">
                {category === 'temperature' ? (
                  fromUnit === 'C' && toUnit === 'F' ? (
                    <span>Formula: (°C × 9/5) + 32</span>
                  ) : fromUnit === 'F' && toUnit === 'C' ? (
                    <span>Formula: (°F − 32) × 5/9</span>
                  ) : fromUnit === 'C' && toUnit === 'K' ? (
                    <span>Formula: °C + 273.15</span>
                  ) : fromUnit === 'K' && toUnit === 'C' ? (
                    <span>Formula: K − 273.15</span>
                  ) : fromUnit === 'F' && toUnit === 'K' ? (
                    <span>Formula: (°F − 32) × 5/9 + 273.15</span>
                  ) : (
                    <span>Formula: (K − 273.15) × 9/5 + 32</span>
                  )
                ) : (
                  <span>
                    Multiplier: 1 {fromUnit} = {( (unitsByCategory[category].find((u)=>u.value===fromUnit)?.ratio || 1) / (unitsByCategory[category].find((u)=>u.value===toUnit)?.ratio || 1) ).toLocaleString(undefined, { maximumFractionDigits: 8 })} {toUnit}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-400 leading-relaxed">
          <p>
            Standard high-precision client-side calculations based on SI base units. Safe, private, and runs entirely in your local browser window.
          </p>
        </div>
      </div>
    </div>
  );
}


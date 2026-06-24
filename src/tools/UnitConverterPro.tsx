import { useState, useEffect, useMemo } from 'react';

interface Unit {
  name: string;
  label: string;
  factor: number; // relative to base unit
  offset?: number; // for temperature
}

interface Dimension {
  name: string;
  baseUnit: string;
  units: Unit[];
}

const dimensionsList: Dimension[] = [
  {
    name: 'Length',
    baseUnit: 'm',
    units: [
      { name: 'm', label: 'Meters (m)', factor: 1 },
      { name: 'km', label: 'Kilometers (km)', factor: 1000 },
      { name: 'cm', label: 'Centimeters (cm)', factor: 0.01 },
      { name: 'mm', label: 'Millimeters (mm)', factor: 0.001 },
      { name: 'in', label: 'Inches (in)', factor: 0.0254 },
      { name: 'ft', label: 'Feet (ft)', factor: 0.3048 },
      { name: 'yd', label: 'Yards (yd)', factor: 0.9144 },
      { name: 'mi', label: 'Miles (mi)', factor: 1609.344 }
    ]
  },
  {
    name: 'Pressure',
    baseUnit: 'Pa',
    units: [
      { name: 'Pa', label: 'Pascal (Pa)', factor: 1 },
      { name: 'kPa', label: 'Kilopascal (kPa)', factor: 1000 },
      { name: 'MPa', label: 'Megapascal (MPa)', factor: 1000000 },
      { name: 'bar', label: 'Bar', factor: 100000 },
      { name: 'psi', label: 'PSI (lbs/in²)', factor: 6894.757 },
      { name: 'atm', label: 'Atmosphere (atm)', factor: 101325 }
    ]
  },
  {
    name: 'Torque',
    baseUnit: 'Nm',
    units: [
      { name: 'Nm', label: 'Newton-meter (N·m)', factor: 1 },
      { name: 'kNm', label: 'Kilonewton-meter (kN·m)', factor: 1000 },
      { name: 'lbft', label: 'Foot-pound (lb·ft)', factor: 1.355818 },
      { name: 'lbin', label: 'Inch-pound (lb·in)', factor: 0.1129848 },
      { name: 'kgm', label: 'Kilogram-meter (kg·m)', factor: 9.80665 }
    ]
  },
  {
    name: 'Density',
    baseUnit: 'kg/m³',
    units: [
      { name: 'kg/m3', label: 'kg/m³', factor: 1 },
      { name: 'g/cm3', label: 'g/cm³', factor: 1000 },
      { name: 'lb/ft3', label: 'lb/ft³', factor: 16.01846 },
      { name: 'lb/in3', label: 'lb/in³', factor: 27679.9 }
    ]
  },
  {
    name: 'Mass',
    baseUnit: 'kg',
    units: [
      { name: 'kg', label: 'Kilograms (kg)', factor: 1 },
      { name: 'g', label: 'Grams (g)', factor: 0.001 },
      { name: 'mg', label: 'Milligrams (mg)', factor: 0.000001 },
      { name: 'lb', label: 'Pounds (lb)', factor: 0.45359237 },
      { name: 'oz', label: 'Ounces (oz)', factor: 0.028349523 }
    ]
  },
  {
    name: 'Area',
    baseUnit: 'm²',
    units: [
      { name: 'm2', label: 'Square Meters (m²)', factor: 1 },
      { name: 'km2', label: 'Square Kilometers (km²)', factor: 1000000 },
      { name: 'ft2', label: 'Square Feet (ft²)', factor: 0.092903 },
      { name: 'ac', label: 'Acres (ac)', factor: 4046.856 },
      { name: 'ha', label: 'Hectares (ha)', factor: 10000 }
    ]
  },
  {
    name: 'Volume',
    baseUnit: 'l',
    units: [
      { name: 'l', label: 'Litres (L)', factor: 1 },
      { name: 'ml', label: 'Millilitres (mL)', factor: 0.001 },
      { name: 'm3', label: 'Cubic Meters (m³)', factor: 1000 },
      { name: 'gal', label: 'Gallons (US gal)', factor: 3.78541 },
      { name: 'qt', label: 'Quarts (US qt)', factor: 0.946353 }
    ]
  },
  {
    name: 'Temperature',
    baseUnit: 'C',
    units: [
      { name: 'C', label: 'Celsius (°C)', factor: 1, offset: 0 },
      { name: 'F', label: 'Fahrenheit (°F)', factor: 5 / 9, offset: 32 },
      { name: 'K', label: 'Kelvin (K)', factor: 1, offset: 273.15 }
    ]
  },
  {
    name: 'Speed',
    baseUnit: 'm/s',
    units: [
      { name: 'm/s', label: 'Meters/second (m/s)', factor: 1 },
      { name: 'km/h', label: 'Kilometers/hour (km/h)', factor: 1 / 3.6 },
      { name: 'mph', label: 'Miles/hour (mph)', factor: 0.44704 },
      { name: 'knot', label: 'Knots', factor: 0.514444 }
    ]
  },
  {
    name: 'Energy',
    baseUnit: 'J',
    units: [
      { name: 'J', label: 'Joules (J)', factor: 1 },
      { name: 'kJ', label: 'Kilojoules (kJ)', factor: 1000 },
      { name: 'cal', label: 'Calories (cal)', factor: 4.184 },
      { name: 'kcal', label: 'Kilocalories (kcal)', factor: 4184 },
      { name: 'Wh', label: 'Watt-hour (Wh)', factor: 3600 },
      { name: 'kWh', label: 'Kilowatt-hour (kWh)', factor: 3600000 }
    ]
  },
  {
    name: 'Power',
    baseUnit: 'W',
    units: [
      { name: 'W', label: 'Watts (W)', factor: 1 },
      { name: 'kW', label: 'Kilowatts (kW)', factor: 1000 },
      { name: 'MW', label: 'Megawatts (MW)', factor: 1000000 },
      { name: 'hp', label: 'Horsepower (hp)', factor: 745.6998 }
    ]
  },
  {
    name: 'Force',
    baseUnit: 'N',
    units: [
      { name: 'N', label: 'Newtons (N)', factor: 1 },
      { name: 'kN', label: 'Kilonewtons (kN)', factor: 1000 },
      { name: 'lbf', label: 'Pounds-force (lbf)', factor: 4.448222 }
    ]
  },
  {
    name: 'Digital Storage',
    baseUnit: 'B',
    units: [
      { name: 'B', label: 'Bytes (B)', factor: 1 },
      { name: 'KB', label: 'Kilobytes (KB)', factor: 1024 },
      { name: 'MB', label: 'Megabytes (MB)', factor: 1024 * 1024 },
      { name: 'GB', label: 'Gigabytes (GB)', factor: 1024 * 1024 * 1024 },
      { name: 'TB', label: 'Terabytes (TB)', factor: 1024 * 1024 * 1024 * 1024 }
    ]
  },
  {
    name: 'Time',
    baseUnit: 's',
    units: [
      { name: 's', label: 'Seconds (s)', factor: 1 },
      { name: 'min', label: 'Minutes (min)', factor: 60 },
      { name: 'hr', label: 'Hours (hr)', factor: 3600 },
      { name: 'day', label: 'Days', factor: 86400 },
      { name: 'week', label: 'Weeks', factor: 604800 }
    ]
  },
  {
    name: 'Angle',
    baseUnit: 'rad',
    units: [
      { name: 'rad', label: 'Radians (rad)', factor: 1 },
      { name: 'deg', label: 'Degrees (°)', factor: Math.PI / 180 },
      { name: 'grad', label: 'Gradians (grad)', factor: Math.PI / 200 }
    ]
  },
  {
    name: 'Flow Rate',
    baseUnit: 'm³/s',
    units: [
      { name: 'm3/s', label: 'Cubic meters/sec', factor: 1 },
      { name: 'l/s', label: 'Litres/second', factor: 0.001 },
      { name: 'l/min', label: 'Litres/minute', factor: 0.001 / 60 },
      { name: 'gpm', label: 'Gallons/minute (gpm)', factor: 0.00006309 }
    ]
  }
];

export default function UnitConverterPro() {
  const [dimensionName, setDimensionName] = useState<string>('Length');
  const [inputValue, setInputValue] = useState<string>('1');
  const [fromUnitName, setFromUnitName] = useState<string>('');
  const [toUnitName, setToUnitName] = useState<string>('');

  const [favorites, setFavorites] = useState<{ dimension: string; from: string; to: string }[]>([]);
  const [history, setHistory] = useState<{ dimension: string; from: string; to: string; val: number; res: number }[]>([]);

  // Load dimension unit properties
  const activeDimension = useMemo(() => {
    return dimensionsList.find(d => d.name === dimensionName) || dimensionsList[0];
  }, [dimensionName]);

  // Set default units when changing dimension
  useEffect(() => {
    if (activeDimension) {
      setFromUnitName(activeDimension.units[0].name);
      setToUnitName(activeDimension.units[1]?.name || activeDimension.units[0].name);
    }
  }, [activeDimension]);

  // Load favorites & history from LocalStorage
  useEffect(() => {
    const favs = localStorage.getItem('unit_favs');
    const hist = localStorage.getItem('unit_hist');
    if (favs) setFavorites(JSON.parse(favs));
    if (hist) setHistory(JSON.parse(hist));
  }, []);

  // Compute conversion
  const computedResult = useMemo(() => {
    const val = parseFloat(inputValue);
    if (isNaN(val) || !activeDimension) return 0;

    const fromUnit = activeDimension.units.find(u => u.name === fromUnitName);
    const toUnit = activeDimension.units.find(u => u.name === toUnitName);

    if (!fromUnit || !toUnit) return 0;

    // Special temperature conversions
    if (activeDimension.name === 'Temperature') {
      let baseVal = val;
      if (fromUnit.name === 'F') baseVal = (val - 32) * (5 / 9);
      else if (fromUnit.name === 'K') baseVal = val - 273.15;

      let finalVal = baseVal;
      if (toUnit.name === 'F') finalVal = baseVal * (9 / 5) + 32;
      else if (toUnit.name === 'K') finalVal = baseVal + 273.15;
      return finalVal;
    }

    // Standard conversions
    const baseValue = val * fromUnit.factor;
    return baseValue / toUnit.factor;
  }, [inputValue, fromUnitName, toUnitName, activeDimension]);

  // Save history on changes (debounced/on blur ideally, here simply trigger on result evaluation)
  const logConversion = () => {
    const num = parseFloat(inputValue);
    if (isNaN(num)) return;

    const entry = {
      dimension: dimensionName,
      from: fromUnitName,
      to: toUnitName,
      val: num,
      res: computedResult
    };

    // Prevent duplicate adjacent logs
    if (history.length > 0) {
      const last = history[0];
      if (last.from === fromUnitName && last.to === toUnitName && last.val === num) return;
    }

    const nextHist = [entry, ...history.slice(0, 19)];
    setHistory(nextHist);
    localStorage.setItem('unit_hist', JSON.stringify(nextHist));
  };

  const handleSwap = () => {
    const temp = fromUnitName;
    setFromUnitName(toUnitName);
    setToUnitName(temp);
  };

  const handleFavoriteToggle = () => {
    const isFav = favorites.some(
      f => f.dimension === dimensionName && f.from === fromUnitName && f.to === toUnitName
    );

    let nextFavs = [];
    if (isFav) {
      nextFavs = favorites.filter(
        f => !(f.dimension === dimensionName && f.from === fromUnitName && f.to === toUnitName)
      );
    } else {
      nextFavs = [...favorites, { dimension: dimensionName, from: fromUnitName, to: toUnitName }];
    }
    setFavorites(nextFavs);
    localStorage.setItem('unit_favs', JSON.stringify(nextFavs));
  };

  const isCurrentFavorite = useMemo(() => {
    return favorites.some(
      f => f.dimension === dimensionName && f.from === fromUnitName && f.to === toUnitName
    );
  }, [favorites, dimensionName, fromUnitName, toUnitName]);

  const loadFavorite = (fav: { dimension: string; from: string; to: string }) => {
    setDimensionName(fav.dimension);
    setFromUnitName(fav.from);
    setToUnitName(fav.to);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Dimension Picker Navigation */}
      <div className="lg:col-span-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm space-y-1">
        <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2.5 mb-2">
          Dimensions
        </h4>
        <div className="space-y-1 max-h-96 overflow-y-auto pr-1">
          {dimensionsList.map((d) => (
            <button
              key={d.name}
              onClick={() => setDimensionName(d.name)}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                dimensionName === d.name
                  ? 'bg-indigo-500/10 text-indigo-750 dark:text-indigo-400'
                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-850/50 text-zinc-650 dark:text-zinc-350'
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>
      </div>

      {/* Converter Panel */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              {dimensionName} Converter
            </h3>
            <button
              onClick={handleFavoriteToggle}
              className={`p-1.5 rounded-lg border transition-colors ${
                isCurrentFavorite
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                  : 'border-zinc-250 dark:border-zinc-850 text-zinc-400 hover:text-zinc-500'
              }`}
            >
              ★
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Source Value
              </label>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={logConversion}
                className="w-full px-3 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-5 gap-2 items-center">
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  From Unit
                </label>
                <select
                  value={fromUnitName}
                  onChange={(e) => setFromUnitName(e.target.value)}
                  className="w-full text-xs bg-zinc-50 border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-850 rounded-lg p-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {activeDimension.units.map(u => (
                    <option key={`from-${u.name}`} value={u.name}>{u.label}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-1 flex justify-center pt-5">
                <button
                  onClick={handleSwap}
                  className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 transition-colors"
                >
                  ⇄
                </button>
              </div>

              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  To Unit
                </label>
                <select
                  value={toUnitName}
                  onChange={(e) => setToUnitName(e.target.value)}
                  className="w-full text-xs bg-zinc-50 border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-850 rounded-lg p-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {activeDimension.units.map(u => (
                    <option key={`to-${u.name}`} value={u.name}>{u.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-indigo-50/50 dark:bg-indigo-950/15 border border-indigo-100/30 rounded-xl p-5 text-center mt-2">
              <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">
                Converted Output
              </div>
              <div className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400">
                {computedResult.toLocaleString(undefined, { maximumFractionDigits: 6 })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* History & Favorites Side Panels */}
      <div className="lg:col-span-4 space-y-6">
        {/* Favorites */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-850 pb-2 mb-3">
            Favorite Unit Pairs
          </h3>
          {favorites.length > 0 ? (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {favorites.map((fav, idx) => (
                <button
                  key={`fav-${idx}`}
                  onClick={() => loadFavorite(fav)}
                  className="w-full flex items-center justify-between text-left p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-850 border border-zinc-100 dark:border-zinc-850 text-xs font-medium text-zinc-700 dark:text-zinc-300"
                >
                  <span>{fav.dimension}: {fav.from} ➔ {fav.to}</span>
                  <span className="text-amber-500">★</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-450 text-center py-4">
              Click the star next to any dimension to save it here.
            </p>
          )}
        </div>

        {/* History */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-850 pb-2 mb-3">
            <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
              Recent Conversions
            </h3>
            {history.length > 0 && (
              <button
                onClick={() => {
                  setHistory([]);
                  localStorage.removeItem('unit_hist');
                }}
                className="text-[10px] text-red-500 hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          {history.length > 0 ? (
            <div className="space-y-2.5 max-h-56 overflow-y-auto font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
              {history.map((hist, idx) => (
                <div key={`hist-${idx}`} className="p-2 border-b border-zinc-100 dark:border-zinc-850/60 flex justify-between">
                  <span>{hist.val} {hist.from}</span>
                  <span>➔</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-200">{hist.res.toFixed(4)} {hist.to}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-455 text-center py-6">
              No recent conversion history found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

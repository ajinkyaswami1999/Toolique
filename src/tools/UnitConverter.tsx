import { useState, useEffect, useMemo } from 'react';
import { Ruler, ArrowLeftRight, Check, Copy, Star, History, Sparkles, Trash2, Settings } from 'lucide-react';

// --- Types & Data Interfaces ---
interface Unit {
  value: string;
  label: string;
  symbol: string;
  ratio: number; // multiplier to convert to base unit
  isRegional?: boolean;
  convention?: string; // e.g. "Used in North India", "West Bengal"
}

interface Dimension {
  id: string;
  name: string;
  baseUnitName: string;
  units: Unit[];
  formula: (val: number, from: string, to: string) => string;
}

// --- Dimensions and Conversion Factors Configuration ---
const dimensions: Dimension[] = [
  {
    id: 'length',
    name: 'Length',
    baseUnitName: 'Meter',
    formula: (val, from, to) => `${val} ${from} × (factor of ${from} / factor of ${to}) = ... ${to}`,
    units: [
      { value: 'mm', label: 'Millimeter', symbol: 'mm', ratio: 0.001 },
      { value: 'cm', label: 'Centimeter', symbol: 'cm', ratio: 0.01 },
      { value: 'm', label: 'Meter', symbol: 'm', ratio: 1.0 },
      { value: 'km', label: 'Kilometer', symbol: 'km', ratio: 1000.0 },
      { value: 'in', label: 'Inch', symbol: 'in', ratio: 0.0254 },
      { value: 'ft', label: 'Foot', symbol: 'ft', ratio: 0.3048 },
      { value: 'yd', label: 'Yard', symbol: 'yd', ratio: 0.9144 },
      { value: 'mi', label: 'Mile', symbol: 'mi', ratio: 1609.344 },
      { value: 'nmi', label: 'Nautical Mile', symbol: 'nmi', ratio: 1852.0 },
    ]
  },
  {
    id: 'weight',
    name: 'Weight / Mass',
    baseUnitName: 'Kilogram',
    formula: (val, from, to) => `${val} ${from} × (factor of ${from} / factor of ${to}) = ... ${to}`,
    units: [
      { value: 'mg', label: 'Milligram', symbol: 'mg', ratio: 0.000001 },
      { value: 'g', label: 'Gram', symbol: 'g', ratio: 0.001 },
      { value: 'kg', label: 'Kilogram', symbol: 'kg', ratio: 1.0 },
      { value: 't', label: 'Metric Ton', symbol: 't', ratio: 1000.0 },
      { value: 'oz', label: 'Ounce', symbol: 'oz', ratio: 0.028349523 },
      { value: 'lb', label: 'Pound', symbol: 'lb', ratio: 0.45359237 },
      { value: 'st', label: 'Stone', symbol: 'st', ratio: 6.35029318 },
      { value: 'unton', label: 'US Ton', symbol: 'ton', ratio: 907.18474 },
      { value: 'quintal', label: 'Quintal', symbol: 'q', ratio: 100.0, isRegional: true, convention: 'Standard Indian unit (100 kg)' },
      { value: 'tola', label: 'Tola', symbol: 'tola', ratio: 0.0116638, isRegional: true, convention: 'Traditional Indian gold weight (11.66 grams)' },
    ]
  },
  {
    id: 'temperature',
    name: 'Temperature',
    baseUnitName: 'Celsius',
    formula: (val, from, to) => {
      if (from === 'C' && to === 'F') return `(${val}°C × 9/5) + 32 = ... °F`;
      if (from === 'F' && to === 'C') return `(${val}°F − 32) × 5/9 = ... °C`;
      if (from === 'C' && to === 'K') return `${val}°C + 273.15 = ... K`;
      if (from === 'K' && to === 'C') return `${val}K − 273.15 = ... °C`;
      return `Convert ${from} to Celsius, then Celsius to ${to}`;
    },
    units: [
      { value: 'C', label: 'Celsius', symbol: '°C', ratio: 1 },
      { value: 'F', label: 'Fahrenheit', symbol: '°F', ratio: 1 },
      { value: 'K', label: 'Kelvin', symbol: 'K', ratio: 1 },
    ]
  },
  {
    id: 'area',
    name: 'Area',
    baseUnitName: 'Square Meter',
    formula: (val, from, to) => `${val} ${from} × (factor of ${from} / factor of ${to}) = ... ${to}`,
    units: [
      { value: 'sq_mm', label: 'Sq Millimeter', symbol: 'mm²', ratio: 0.000001 },
      { value: 'sq_cm', label: 'Sq Centimeter', symbol: 'cm²', ratio: 0.0001 },
      { value: 'sq_m', label: 'Sq Meter', symbol: 'm²', ratio: 1.0 },
      { value: 'sq_km', label: 'Sq Kilometer', symbol: 'km²', ratio: 1000000.0 },
      { value: 'sq_in', label: 'Sq Inch', symbol: 'in²', ratio: 0.00064516 },
      { value: 'sq_ft', label: 'Sq Foot', symbol: 'ft²', ratio: 0.09290304 },
      { value: 'sq_yd', label: 'Sq Yard', symbol: 'yd²', ratio: 0.83612736 },
      { value: 'sq_mi', label: 'Sq Mile', symbol: 'mi²', ratio: 2589988.11 },
      { value: 'acre', label: 'Acre', symbol: 'ac', ratio: 4046.8564 },
      { value: 'hectare', label: 'Hectare', symbol: 'ha', ratio: 10000.0 },
      { value: 'bigha_up', label: 'Bigha (Standard/UP)', symbol: 'bigha', ratio: 2529.28, isRegional: true, convention: 'North India (UP, Punjab, Haryana)' },
      { value: 'bigha_bengal', label: 'Bigha (Bengal)', symbol: 'bigha', ratio: 1337.8, isRegional: true, convention: 'Eastern India (West Bengal, Assam)' },
      { value: 'bigha_rajasthan', label: 'Bigha (Rajasthan)', symbol: 'bigha', ratio: 1618.7, isRegional: true, convention: 'Western India (Rajasthan)' },
      { value: 'biswa', label: 'Biswa', symbol: 'biswa', ratio: 126.46, isRegional: true, convention: 'Subdivision of Bigha (1/20 Bigha)' },
      { value: 'kanal', label: 'Kanal', symbol: 'kanal', ratio: 505.857, isRegional: true, convention: 'Northern regional states' },
      { value: 'marla', label: 'Marla', symbol: 'marla', ratio: 25.292, isRegional: true, convention: 'Subdivision of Kanal (1/20 Kanal)' },
      { value: 'gaj', label: 'Gaj (Sq Yard equivalent)', symbol: 'gaj', ratio: 0.8361, isRegional: true, convention: 'Commonly used locally as 1 Square Yard' },
    ]
  },
  {
    id: 'volume',
    name: 'Volume',
    baseUnitName: 'Liter',
    formula: (val, from, to) => `${val} ${from} × (factor of ${from} / factor of ${to}) = ... ${to}`,
    units: [
      { value: 'L', label: 'Liter', symbol: 'L', ratio: 1.0 },
      { value: 'mL', label: 'Milliliter', symbol: 'mL', ratio: 0.001 },
      { value: 'cL', label: 'Centiliter', symbol: 'cL', ratio: 0.01 },
      { value: 'm3', label: 'Cubic Meter', symbol: 'm³', ratio: 1000.0 },
      { value: 'cm3', label: 'Cubic Centimeter', symbol: 'cm³', ratio: 0.001 },
      { value: 'gal_us', label: 'US Gallon', symbol: 'gal (US)', ratio: 3.7854 },
      { value: 'qt_us', label: 'US Quart', symbol: 'qt (US)', ratio: 0.9463 },
      { value: 'pt_us', label: 'US Pint', symbol: 'pt (US)', ratio: 0.4731 },
      { value: 'cup_us', label: 'US Cup', symbol: 'cup', ratio: 0.24 },
      { value: 'floz_us', label: 'US Fluid Ounce', symbol: 'fl oz (US)', ratio: 0.0295 },
      { value: 'gal_uk', label: 'Imperial Gallon', symbol: 'gal (UK)', ratio: 4.546 },
      { value: 'floz_uk', label: 'Imperial Fluid Ounce', symbol: 'fl oz (UK)', ratio: 0.0284 },
      { value: 'in3', label: 'Cubic Inch', symbol: 'in³', ratio: 0.01638 },
      { value: 'ft3', label: 'Cubic Foot', symbol: 'ft³', ratio: 28.316 },
      { value: 'yd3', label: 'Cubic Yard', symbol: 'yd³', ratio: 764.55 },
    ]
  },
  {
    id: 'time',
    name: 'Time',
    baseUnitName: 'Second',
    formula: (val, from, to) => `${val} ${from} × (factor of ${from} / factor of ${to}) = ... ${to}`,
    units: [
      { value: 'ns', label: 'Nanosecond', symbol: 'ns', ratio: 1e-9 },
      { value: 'us', label: 'Microsecond', symbol: 'µs', ratio: 1e-6 },
      { value: 'ms', label: 'Millisecond', symbol: 'ms', ratio: 0.001 },
      { value: 's', label: 'Second', symbol: 's', ratio: 1.0 },
      { value: 'min', label: 'Minute', symbol: 'min', ratio: 60.0 },
      { value: 'hr', label: 'Hour', symbol: 'hr', ratio: 3600.0 },
      { value: 'day', label: 'Day', symbol: 'day', ratio: 86400.0 },
      { value: 'week', label: 'Week', symbol: 'wk', ratio: 604800.0 },
      { value: 'month', label: 'Month (Average)', symbol: 'mo', ratio: 2629746.0 },
      { value: 'year', label: 'Year (Average)', symbol: 'yr', ratio: 31556952.0 },
    ]
  },
  {
    id: 'speed',
    name: 'Speed',
    baseUnitName: 'Meter/Second',
    formula: (val, from, to) => `${val} ${from} × (factor of ${from} / factor of ${to}) = ... ${to}`,
    units: [
      { value: 'ms', label: 'Meter/Second', symbol: 'm/s', ratio: 1.0 },
      { value: 'kmh', label: 'Kilometer/Hour', symbol: 'km/h', ratio: 0.277778 },
      { value: 'mph', label: 'Mile/Hour', symbol: 'mph', ratio: 0.44704 },
      { value: 'knot', label: 'Knot', symbol: 'kt', ratio: 0.51444 },
      { value: 'fts', label: 'Foot/Second', symbol: 'ft/s', ratio: 0.3048 },
    ]
  },
  {
    id: 'pressure',
    name: 'Pressure',
    baseUnitName: 'Pascal',
    formula: (val, from, to) => `${val} ${from} × (factor of ${from} / factor of ${to}) = ... ${to}`,
    units: [
      { value: 'Pa', label: 'Pascal', symbol: 'Pa', ratio: 1.0 },
      { value: 'kPa', label: 'Kilopascal', symbol: 'kPa', ratio: 1000.0 },
      { value: 'MPa', label: 'Megapascal', symbol: 'MPa', ratio: 1000000.0 },
      { value: 'bar', label: 'Bar', symbol: 'bar', ratio: 100000.0 },
      { value: 'psi', label: 'PSI (Pounds/sq inch)', symbol: 'psi', ratio: 6894.757 },
      { value: 'atm', label: 'Atmosphere', symbol: 'atm', ratio: 101325.0 },
      { value: 'torr', label: 'Torr', symbol: 'Torr', ratio: 133.322 },
    ]
  },
  {
    id: 'energy',
    name: 'Energy',
    baseUnitName: 'Joule',
    formula: (val, from, to) => `${val} ${from} × (factor of ${from} / factor of ${to}) = ... ${to}`,
    units: [
      { value: 'J', label: 'Joule', symbol: 'J', ratio: 1.0 },
      { value: 'kJ', label: 'Kilojoule', symbol: 'kJ', ratio: 1000.0 },
      { value: 'cal', label: 'Calorie', symbol: 'cal', ratio: 4.184 },
      { value: 'kcal', label: 'Kilocalorie', symbol: 'kcal', ratio: 4184.0 },
      { value: 'Wh', label: 'Watt-hour', symbol: 'Wh', ratio: 3600.0 },
      { value: 'kWh', label: 'Kilowatt-hour', symbol: 'kWh', ratio: 3600000.0 },
      { value: 'btu', label: 'BTU', symbol: 'BTU', ratio: 1055.056 },
    ]
  },
  {
    id: 'power',
    name: 'Power',
    baseUnitName: 'Watt',
    formula: (val, from, to) => `${val} ${from} × (factor of ${from} / factor of ${to}) = ... ${to}`,
    units: [
      { value: 'W', label: 'Watt', symbol: 'W', ratio: 1.0 },
      { value: 'kW', label: 'Kilowatt', symbol: 'kW', ratio: 1000.0 },
      { value: 'MW', label: 'Megawatt', symbol: 'MW', ratio: 1000000.0 },
      { value: 'hp', label: 'Horsepower (Mechanical)', symbol: 'hp', ratio: 745.7 },
    ]
  },
  {
    id: 'frequency',
    name: 'Frequency',
    baseUnitName: 'Hertz',
    formula: (val, from, to) => `${val} ${from} × (factor of ${from} / factor of ${to}) = ... ${to}`,
    units: [
      { value: 'Hz', label: 'Hertz', symbol: 'Hz', ratio: 1.0 },
      { value: 'kHz', label: 'Kilohertz', symbol: 'kHz', ratio: 1000.0 },
      { value: 'MHz', label: 'Megahertz', symbol: 'MHz', ratio: 1000000.0 },
      { value: 'GHz', label: 'Gigahertz', symbol: 'GHz', ratio: 1000000000.0 },
    ]
  },
  {
    id: 'data',
    name: 'Data Storage',
    baseUnitName: 'Byte',
    formula: (val, from, to) => `${val} ${from} × (factor of ${from} / factor of ${to}) = ... ${to}`,
    units: [
      { value: 'bit', label: 'Bit', symbol: 'bit', ratio: 0.125 },
      { value: 'B', label: 'Byte', symbol: 'B', ratio: 1.0 },
      { value: 'KB', label: 'Kilobyte', symbol: 'KB', ratio: 1024.0 },
      { value: 'MB', label: 'Megabyte', symbol: 'MB', ratio: 1048576.0 },
      { value: 'GB', label: 'Gigabyte', symbol: 'GB', ratio: 1073741824.0 },
      { value: 'TB', label: 'Terabyte', symbol: 'TB', ratio: 1099511627776.0 },
      { value: 'PB', label: 'Petabyte', symbol: 'PB', ratio: 1125899906842624.0 },
    ]
  },
  {
    id: 'force',
    name: 'Force',
    baseUnitName: 'Newton',
    formula: (val, from, to) => `${val} ${from} × (factor of ${from} / factor of ${to}) = ... ${to}`,
    units: [
      { value: 'N', label: 'Newton', symbol: 'N', ratio: 1.0 },
      { value: 'kN', label: 'Kilonewton', symbol: 'kN', ratio: 1000.0 },
      { value: 'lbf', label: 'Pound-force', symbol: 'lbf', ratio: 4.44822 },
      { value: 'kgf', label: 'Kilogram-force', symbol: 'kgf', ratio: 9.80665 },
    ]
  },
  {
    id: 'torque',
    name: 'Torque',
    baseUnitName: 'Newton-meter',
    formula: (val, from, to) => `${val} ${from} × (factor of ${from} / factor of ${to}) = ... ${to}`,
    units: [
      { value: 'Nm', label: 'Newton-meter', symbol: 'N·m', ratio: 1.0 },
      { value: 'kNm', label: 'Kilonewton-meter', symbol: 'kN·m', ratio: 1000.0 },
      { value: 'lbft', label: 'Foot-pound', symbol: 'lb·ft', ratio: 1.3558 },
      { value: 'lbin', label: 'Inch-pound', symbol: 'lb·in', ratio: 0.1129 },
      { value: 'kgm', label: 'Kilogram-meter', symbol: 'kg·m', ratio: 9.80665 },
    ]
  },
  {
    id: 'density',
    name: 'Density',
    baseUnitName: 'Kilogram/Cubic Meter',
    formula: (val, from, to) => `${val} ${from} × (factor of ${from} / factor of ${to}) = ... ${to}`,
    units: [
      { value: 'kgm3', label: 'Kilogram/Cubic Meter', symbol: 'kg/m³', ratio: 1.0 },
      { value: 'gcm3', label: 'Gram/Cubic Centimeter', symbol: 'g/cm³', ratio: 1000.0 },
      { value: 'lbft3', label: 'Pound/Cubic Foot', symbol: 'lb/ft³', ratio: 16.0185 },
      { value: 'lbin3', label: 'Pound/Cubic Inch', symbol: 'lb/in³', ratio: 27679.9 },
    ]
  },
  {
    id: 'flowrate',
    name: 'Flow Rate',
    baseUnitName: 'Cubic Meter/Second',
    formula: (val, from, to) => `${val} ${from} × (factor of ${from} / factor of ${to}) = ... ${to}`,
    units: [
      { value: 'm3s', label: 'Cubic Meter/Second', symbol: 'm³/s', ratio: 1.0 },
      { value: 'ls', label: 'Liter/Second', symbol: 'L/s', ratio: 0.001 },
      { value: 'lmin', label: 'Liter/Minute', symbol: 'L/min', ratio: 0.001 / 60 },
      { value: 'gpm_us', label: 'US Gallon/Minute', symbol: 'gpm (US)', ratio: 0.00006309 },
      { value: 'gpm_uk', label: 'UK Gallon/Minute', symbol: 'gpm (UK)', ratio: 0.00007576 },
    ]
  },
  {
    id: 'acceleration',
    name: 'Acceleration',
    baseUnitName: 'Meter/Second Squared',
    formula: (val, from, to) => `${val} ${from} × (factor of ${from} / factor of ${to}) = ... ${to}`,
    units: [
      { value: 'ms2', label: 'Meter/Second²', symbol: 'm/s²', ratio: 1.0 },
      { value: 'fts2', label: 'Foot/Second²', symbol: 'ft/s²', ratio: 0.3048 },
      { value: 'g', label: 'Standard Gravity', symbol: 'g', ratio: 9.80665 },
    ]
  },
  {
    id: 'angle',
    name: 'Angle',
    baseUnitName: 'Radian',
    formula: (val, from, to) => `${val} ${from} × (factor of ${from} / factor of ${to}) = ... ${to}`,
    units: [
      { value: 'rad', label: 'Radian', symbol: 'rad', ratio: 1.0 },
      { value: 'deg', label: 'Degree', symbol: '°', ratio: Math.PI / 180 },
      { value: 'grad', label: 'Gradian', symbol: 'grad', ratio: Math.PI / 200 },
      { value: 'arcmin', label: 'Arcminute', symbol: 'arcmin', ratio: Math.PI / 10800 },
      { value: 'arcsec', label: 'Arcsecond', symbol: 'arcsec', ratio: Math.PI / 648000 },
    ]
  }
];

// --- Specialized Presets for Architecture/Civil ---
const constructionPresets = [
  { label: 'm² to ft²', cat: 'area', from: 'sq_m', to: 'sq_ft', value: 1 },
  { label: 'm³ to ft³', cat: 'volume', from: 'm3', to: 'ft3', value: 1 },
  { label: 'mm to inch', cat: 'length', from: 'mm', to: 'in', value: 25 },
  { label: 'cm to inch', cat: 'length', from: 'cm', to: 'in', value: 10 },
  { label: 'm to feet', cat: 'length', from: 'm', to: 'ft', value: 1 },
  { label: 'kg to tonne', cat: 'weight', from: 'kg', to: 't', value: 1000 },
  { label: 'kN to N', cat: 'force', from: 'kN', to: 'N', value: 1 },
  { label: 'MPa to N/mm²', cat: 'pressure', from: 'MPa', to: 'psi', value: 1 }, // Standard stress mapping
];

export default function UnitConverter() {
  const [categoryID, setCategoryID] = useState<string>('length');
  const [inputValue, setInputValue] = useState<string>('1');
  const [fromUnit, setFromUnit] = useState<string>('m');
  const [toUnit, setToUnit] = useState<string>('cm');
  const [precision, setPrecision] = useState<string>('4');
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  
  // Custom searchable dropdown states
  const [showFromSearch, setShowFromSearch] = useState<boolean>(false);
  const [showToSearch, setShowToSearch] = useState<boolean>(false);
  const [searchFromText, setSearchFromText] = useState<string>('');
  const [searchToText, setSearchToText] = useState<string>('');

  // Local storage lists
  const [history, setHistory] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);

  // Smart natural language parser input
  const [smartInput, setSmartInput] = useState<string>('');
  const [smartError, setSmartError] = useState<string>('');

  // Fetch active dimension schema details
  const activeDimension = useMemo(() => {
    return dimensions.find((d) => d.id === categoryID) || dimensions[0];
  }, [categoryID]);

  // Load URL query parameters on mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('cat');
      const from = params.get('from');
      const to = params.get('to');
      const val = params.get('val');
      const prec = params.get('precision');

      if (cat) setCategoryID(cat);
      if (from) setFromUnit(from);
      if (to) setToUnit(to);
      if (val) setInputValue(val);
      if (prec) setPrecision(prec);
    } catch (e) {}

    // Load local history & favorites
    const hist = localStorage.getItem('toolique_unit_hist');
    const favs = localStorage.getItem('toolique_unit_favs');
    if (hist) setHistory(JSON.parse(hist));
    if (favs) setFavorites(JSON.parse(favs));
  }, []);

  // Update selected units when category changes
  const handleCategoryChange = (id: string) => {
    setCategoryID(id);
    const dim = dimensions.find((d) => d.id === id) || dimensions[0];
    setFromUnit(dim.units[0].value);
    setToUnit(dim.units[1]?.value || dim.units[0].value);
    setSmartError('');
    setSmartInput('');
  };

  // Convert calculation engine
  const result = useMemo(() => {
    const val = parseFloat(inputValue);
    if (isNaN(val) || !activeDimension) return 0;
    if (fromUnit === toUnit) return val;

    const fromObj = activeDimension.units.find((u) => u.value === fromUnit);
    const toObj = activeDimension.units.find((u) => u.value === toUnit);
    if (!fromObj || !toObj) return 0;

    // Handle special offset temperature values
    if (activeDimension.id === 'temperature') {
      let tempInC = val;
      if (fromUnit === 'F') {
        tempInC = ((val - 32) * 5) / 9;
      } else if (fromUnit === 'K') {
        tempInC = val - 273.15;
      }

      let finalTemp = tempInC;
      if (toUnit === 'F') {
        finalTemp = (tempInC * 9) / 5 + 32;
      } else if (toUnit === 'K') {
        finalTemp = tempInC + 273.15;
      }
      return finalTemp;
    }

    // Linear base multiplication
    const valueInBase = val * fromObj.ratio;
    return valueInBase / toObj.ratio;
  }, [inputValue, fromUnit, toUnit, activeDimension]);

  // Format utility applying precision rules (avoids trailing zeros)
  const formatResultValue = (val: number) => {
    if (precision === 'auto') {
      // Find a clean representation, removing trailing zeros
      const formatted = val.toFixed(8);
      return parseFloat(formatted).toString();
    }
    const precNum = parseInt(precision, 10);
    return parseFloat(val.toFixed(precNum)).toString();
  };

  // Log conversion history item (triggered on input blurs)
  const logToHistory = () => {
    const val = parseFloat(inputValue);
    if (isNaN(val) || !activeDimension) return;

    const fromObj = activeDimension.units.find((u) => u.value === fromUnit);
    const toObj = activeDimension.units.find((u) => u.value === toUnit);
    if (!fromObj || !toObj) return;

    const newLog = {
      id: Date.now().toString(),
      category: categoryID,
      categoryName: activeDimension.name,
      fromUnit: fromObj.label,
      fromSymbol: fromObj.symbol,
      toUnit: toObj.label,
      toSymbol: toObj.symbol,
      fromVal: val,
      toVal: result
    };

    const updated = [newLog, ...history.filter(h => !(h.fromVal === val && h.fromUnit === fromObj.label && h.toUnit === toObj.label))].slice(0, 15);
    setHistory(updated);
    localStorage.setItem('toolique_unit_hist', JSON.stringify(updated));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('toolique_unit_hist');
  };

  // Favorites management
  const toggleFavorite = () => {
    const isFav = favorites.some(
      (f) => f.category === categoryID && f.from === fromUnit && f.to === toUnit
    );

    let updated = [];
    if (isFav) {
      updated = favorites.filter(
        (f) => !(f.category === categoryID && f.from === fromUnit && f.to === toUnit)
      );
    } else {
      updated = [
        ...favorites,
        {
          category: categoryID,
          categoryName: activeDimension.name,
          from: fromUnit,
          to: toUnit,
          fromLabel: activeDimension.units.find(u => u.value === fromUnit)?.symbol || fromUnit,
          toLabel: activeDimension.units.find(u => u.value === toUnit)?.symbol || toUnit
        }
      ];
    }
    setFavorites(updated);
    localStorage.setItem('toolique_unit_favs', JSON.stringify(updated));
  };

  const isCurrentFavorite = useMemo(() => {
    return favorites.some(
      (f) => f.category === categoryID && f.from === fromUnit && f.to === toUnit
    );
  }, [favorites, categoryID, fromUnit, toUnit]);

  // Swap From / To units
  const handleSwap = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  // Copy result output
  const handleCopyResult = () => {
    navigator.clipboard.writeText(formatResultValue(result));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Copy all conversions table list
  const handleCopyAllConversions = () => {
    const list = activeDimension.units
      .filter((u) => u.value !== fromUnit)
      .map((u) => {
        const val = parseFloat(inputValue);
        if (isNaN(val)) return '';
        let converted = 0;
        if (activeDimension.id === 'temperature') {
          let tempInC = val;
          if (fromUnit === 'F') tempInC = ((val - 32) * 5) / 9;
          else if (fromUnit === 'K') tempInC = val - 273.15;
          
          if (u.value === 'F') converted = (tempInC * 9) / 5 + 32;
          else if (u.value === 'K') converted = tempInC + 273.15;
          else converted = tempInC;
        } else {
          const fromObj = activeDimension.units.find((u) => u.value === fromUnit);
          if (fromObj) {
            converted = (val * fromObj.ratio) / u.ratio;
          }
        }
        return `${val} ${fromUnit} = ${formatResultValue(converted)} ${u.symbol}`;
      })
      .join('\n');

    navigator.clipboard.writeText(list);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  // Preset executor
  const loadPreset = (preset: typeof constructionPresets[0]) => {
    setCategoryID(preset.cat);
    setFromUnit(preset.from);
    setToUnit(preset.to);
    setInputValue(preset.value.toString());
  };

  // Smart Natural Language Parser
  const handleSmartSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSmartError('');
    if (!smartInput.trim()) return;

    // Pattern 1: Composite values (e.g. 5 feet 8 inches to cm)
    const compositeMatch = smartInput.match(/^\s*(\d+)\s*(?:ft|feet|foot)\s*(\d+)\s*(?:in|inches?|inch)\s+(?:to|in)\s+([a-zA-Z°²³\s\/\-]+)\s*$/i);
    if (compositeMatch) {
      const ft = parseInt(compositeMatch[1], 10);
      const inch = parseInt(compositeMatch[2], 10);
      const targetUnitName = compositeMatch[3].trim().toLowerCase();

      // Convert feet and inches to cm
      const totalInches = ft * 12 + inch;
      // Resolve target unit
      const lenDim = dimensions[0];
      const targetUnit = lenDim.units.find(
        (u) =>
          u.value.toLowerCase() === targetUnitName ||
          u.label.toLowerCase().includes(targetUnitName) ||
          u.symbol.toLowerCase() === targetUnitName
      );

      if (targetUnit) {
        setCategoryID('length');
        setFromUnit('in');
        setToUnit(targetUnit.value);
        setInputValue(totalInches.toString());
        return;
      }
    }

    // Pattern 2: Standard simple values (e.g. 100 meters to feet, 25 C to F)
    const simpleMatch = smartInput.match(/^\s*(?:convert\s+)?([\d.]+)\s*([a-zA-Z°²³\s\/\-]+)\s+(?:to|in)\s+([a-zA-Z°²³\s\/\-]+)\s*$/i);
    if (simpleMatch) {
      const valueStr = simpleMatch[1];
      const sourceUnitName = simpleMatch[2].trim().toLowerCase();
      const targetUnitName = simpleMatch[3].trim().toLowerCase();

      // Find matching dimension category and units
      let foundCategory: Dimension | null = null;
      let foundFromUnit: Unit | null = null;
      let foundToUnit: Unit | null = null;

      for (const dim of dimensions) {
        const fromU = dim.units.find(
          (u) =>
            u.value.toLowerCase() === sourceUnitName ||
            u.label.toLowerCase().includes(sourceUnitName) ||
            u.symbol.toLowerCase() === sourceUnitName
        );
        const toU = dim.units.find(
          (u) =>
            u.value.toLowerCase() === targetUnitName ||
            u.label.toLowerCase().includes(targetUnitName) ||
            u.symbol.toLowerCase() === targetUnitName
        );

        if (fromU && toU) {
          foundCategory = dim;
          foundFromUnit = fromU;
          foundToUnit = toU;
          break;
        }
      }

      if (foundCategory && foundFromUnit && foundToUnit) {
        setCategoryID(foundCategory.id);
        setFromUnit(foundFromUnit.value);
        setToUnit(foundToUnit.value);
        setInputValue(valueStr);
        return;
      }
    }

    setSmartError('Could not recognize units. Please try e.g., "5 feet 8 inches to cm" or "100 kmh to mph".');
  };

  // Filter lists for custom searchable selects
  const filteredFromUnits = useMemo(() => {
    return activeDimension.units.filter(
      (u) =>
        u.label.toLowerCase().includes(searchFromText.toLowerCase()) ||
        u.symbol.toLowerCase().includes(searchFromText.toLowerCase())
    );
  }, [activeDimension, searchFromText]);

  const filteredToUnits = useMemo(() => {
    return activeDimension.units.filter(
      (u) =>
        u.label.toLowerCase().includes(searchToText.toLowerCase()) ||
        u.symbol.toLowerCase().includes(searchToText.toLowerCase())
    );
  }, [activeDimension, searchToText]);

  // Formulas steps text generator
  const getStepByStepText = () => {
    const val = parseFloat(inputValue);
    if (isNaN(val)) return 'Please enter a valid input number.';
    const fromObj = activeDimension.units.find(u => u.value === fromUnit);
    const toObj = activeDimension.units.find(u => u.value === toUnit);
    if (!fromObj || !toObj) return '';

    if (activeDimension.id === 'temperature') {
      if (fromUnit === 'C' && toUnit === 'F') {
        return `(${val}°C × 9/5) + 32 = ${formatResultValue(result)}°F`;
      }
      if (fromUnit === 'F' && toUnit === 'C') {
        return `(${val}°F − 32) × 5/9 = ${formatResultValue(result)}°C`;
      }
      if (fromUnit === 'C' && toUnit === 'K') {
        return `${val}°C + 273.15 = ${formatResultValue(result)} K`;
      }
      if (fromUnit === 'K' && toUnit === 'C') {
        return `${val}K − 273.15 = ${formatResultValue(result)}°C`;
      }
      return `${val} ${fromObj.symbol} converted to ${toObj.symbol} = ${formatResultValue(result)} ${toObj.symbol}`;
    }

    const conversionFactor = fromObj.ratio / toObj.ratio;
    return `${val} ${fromObj.symbol} × (${fromObj.ratio} / ${toObj.ratio}) = ${val} × ${conversionFactor.toFixed(6)} = ${formatResultValue(result)} ${toObj.symbol}`;
  };

  // Generate share link
  const getShareLink = () => {
    const params = new URLSearchParams();
    params.set('cat', categoryID);
    params.set('from', fromUnit);
    params.set('to', toUnit);
    params.set('val', inputValue);
    params.set('precision', precision);
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(getShareLink());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto text-left">
      {/* HEADER TABS: Core Dimensions & Secondary expandable list */}
      <div className="border-b border-zinc-200 dark:border-zinc-800/80 pb-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {dimensions.slice(0, 4).map((dim) => (
            <button
              key={dim.id}
              onClick={() => handleCategoryChange(dim.id)}
              className={`px-4 py-2 text-xs font-extrabold rounded-xl transition duration-300 ${
                categoryID === dim.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                  : 'bg-zinc-150/60 dark:bg-zinc-900/60 text-zinc-550 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
              }`}
            >
              {dim.name}
            </button>
          ))}
        </div>

        {/* More Converters Selector */}
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">More Categories:</label>
          <select
            value={dimensions.some(d => d.id === categoryID && !['length', 'weight', 'temperature', 'area'].includes(d.id)) ? categoryID : ''}
            onChange={(e) => {
              if (e.target.value) handleCategoryChange(e.target.value);
            }}
            className="text-xs bg-zinc-50 border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-850 rounded-xl p-2 font-bold text-zinc-700 dark:text-zinc-300 focus:outline-none"
          >
            <option value="">-- Choose Category --</option>
            {dimensions.slice(4).map((dim) => (
              <option key={dim.id} value={dim.id}>
                {dim.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* MAIN CONVERTER SECTION */}
        <div className="lg:col-span-8 space-y-6">
          {/* CONVERTER CARD */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-800/50">
              <h3 className="text-sm font-black text-zinc-805 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>{activeDimension.name} Converter</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleFavorite}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    isCurrentFavorite
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-500'
                  }`}
                  title="Favorite Conversion pair"
                >
                  ★
                </button>
                <button
                  onClick={copyShareLink}
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-500 transition-colors"
                  title="Copy shareable link"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Inputs grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              {/* Input Value */}
              <div className="md:col-span-4 space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Enter Value</label>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onBlur={logToHistory}
                  placeholder="Enter numeric amount"
                  className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* From Custom Searchable Dropdown */}
              <div className="md:col-span-3 space-y-2 relative">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">From Unit</label>
                <button
                  onClick={() => {
                    setShowFromSearch(!showFromSearch);
                    setShowToSearch(false);
                  }}
                  className="w-full text-left text-xs bg-zinc-50 border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-850 rounded-xl p-2.5 text-zinc-900 dark:text-zinc-100 font-bold flex justify-between items-center"
                >
                  <span>{activeDimension.units.find(u => u.value === fromUnit)?.label || fromUnit}</span>
                  <span className="text-[9px] text-zinc-450">▼</span>
                </button>

                {showFromSearch && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 p-3 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl z-30 space-y-2">
                    <input
                      type="text"
                      placeholder="Search units..."
                      value={searchFromText}
                      onChange={(e) => setSearchFromText(e.target.value)}
                      className="w-full p-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent focus:outline-none"
                    />
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {filteredFromUnits.map((u) => (
                        <button
                          key={`from-${u.value}`}
                          onClick={() => {
                            setFromUnit(u.value);
                            setShowFromSearch(false);
                            setSearchFromText('');
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition duration-200 flex justify-between ${
                            fromUnit === u.value
                              ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-bold'
                              : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/60 text-zinc-650 dark:text-zinc-350'
                          }`}
                        >
                          <span>{u.label}</span>
                          <span className="text-zinc-400">{u.symbol}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Swap Button */}
              <div className="md:col-span-2 flex justify-center pb-1">
                <button
                  onClick={handleSwap}
                  className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 text-zinc-550 hover:text-indigo-600 transition duration-300"
                  title="Swap units"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </button>
              </div>

              {/* To Custom Searchable Dropdown */}
              <div className="md:col-span-3 space-y-2 relative">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">To Unit</label>
                <button
                  onClick={() => {
                    setShowToSearch(!showToSearch);
                    setShowFromSearch(false);
                  }}
                  className="w-full text-left text-xs bg-zinc-50 border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-850 rounded-xl p-2.5 text-zinc-900 dark:text-zinc-100 font-bold flex justify-between items-center"
                >
                  <span>{activeDimension.units.find(u => u.value === toUnit)?.label || toUnit}</span>
                  <span className="text-[9px] text-zinc-450">▼</span>
                </button>

                {showToSearch && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 p-3 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl z-30 space-y-2">
                    <input
                      type="text"
                      placeholder="Search units..."
                      value={searchToText}
                      onChange={(e) => setSearchToText(e.target.value)}
                      className="w-full p-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent focus:outline-none"
                    />
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {filteredToUnits.map((u) => (
                        <button
                          key={`to-${u.value}`}
                          onClick={() => {
                            setToUnit(u.value);
                            setShowToSearch(false);
                            setSearchToText('');
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition duration-200 flex justify-between ${
                            toUnit === u.value
                              ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-bold'
                              : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/60 text-zinc-650 dark:text-zinc-350'
                          }`}
                        >
                          <span>{u.label}</span>
                          <span className="text-zinc-400">{u.symbol}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RESULTS VIEW */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
              {/* Primary Output */}
              <div className="p-5 rounded-2xl bg-zinc-950 text-white shadow-xl flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-black uppercase text-zinc-450 tracking-wider">Result Output</span>
                  <div className="text-2xl font-black font-mono text-indigo-400 mt-2 break-all">
                    {formatResultValue(result)}
                    <span className="text-sm font-bold text-zinc-400 ml-1.5">
                      {activeDimension.units.find(u => u.value === toUnit)?.symbol || toUnit}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 justify-between items-center mt-6">
                  <span className="text-[9px] text-zinc-500 font-semibold">
                    1 {fromUnit} = {((activeDimension.units.find(u => u.value === fromUnit)?.ratio || 1) / (activeDimension.units.find(u => u.value === toUnit)?.ratio || 1)).toFixed(6)} {toUnit}
                  </span>
                  <button
                    onClick={handleCopyResult}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:bg-zinc-850 hover:text-white transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Dynamic conversion steps */}
              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-850 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Calculation Formula</span>
                  <div className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 mt-3">
                    {activeDimension.formula(parseFloat(inputValue) || 0, fromUnit, toUnit)}
                  </div>
                </div>
                <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono mt-4 border-t border-zinc-200/60 dark:border-zinc-800/80 pt-2 bg-transparent leading-relaxed break-all">
                  <strong>Steps:</strong> {getStepByStepText()}
                </div>
              </div>
            </div>

            {/* Regional land unit notice if active */}
            {activeDimension.units.some(u => u.isRegional && (u.value === fromUnit || u.value === toUnit)) && (
              <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-xs text-amber-800 dark:text-amber-400 leading-relaxed font-semibold">
                ⚠️ <strong>Regional Unit Notice:</strong> Traditional Indian land units like Bigha and Biswa are state-dependent. For instance, Bengal Bigha represents 1,337.8 m² while Standard/UP Bigha represents 2,529.28 m². Verify applicable regional revenue conventions before final transactions.
              </div>
            )}
          </div>

          {/* DYNAMIC MULTI-UNIT COMPARISON VIEW */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">View All Conversions</h3>
                <p className="text-[10px] text-zinc-455 dark:text-zinc-500 font-semibold mt-0.5">Explore equivalents for {inputValue} {fromUnit} in all other units in this category.</p>
              </div>
              <button
                onClick={handleCopyAllConversions}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAll ? 'All Copied' : 'Copy All'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {activeDimension.units
                .filter((u) => u.value !== fromUnit)
                .map((u) => {
                  const val = parseFloat(inputValue);
                  let converted = 0;
                  if (!isNaN(val)) {
                    if (activeDimension.id === 'temperature') {
                      let tempInC = val;
                      if (fromUnit === 'F') tempInC = ((val - 32) * 5) / 9;
                      else if (fromUnit === 'K') tempInC = val - 273.15;
                      
                      if (u.value === 'F') converted = (tempInC * 9) / 5 + 32;
                      else if (u.value === 'K') converted = tempInC + 273.15;
                      else converted = tempInC;
                    } else {
                      const fromObj = activeDimension.units.find((u) => u.value === fromUnit);
                      if (fromObj) {
                        converted = (val * fromObj.ratio) / u.ratio;
                      }
                    }
                  }
                  return (
                    <div
                      key={`comp-${u.value}`}
                      className="p-3 rounded-2xl border border-zinc-150 dark:border-zinc-850/60 bg-zinc-50/20 dark:bg-zinc-950/20 flex justify-between items-center text-xs"
                    >
                      <div className="font-semibold text-zinc-500 flex flex-col">
                        <span>{u.label}</span>
                        {u.isRegional && (
                          <span className="text-[9px] text-zinc-400">{u.convention}</span>
                        )}
                      </div>
                      <span className="font-black font-mono text-zinc-900 dark:text-white break-all">
                        {formatResultValue(converted)} {u.symbol}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* SIDEBAR MODULES */}
        <div className="lg:col-span-4 space-y-6">
          {/* ADVANCED DECIMALS PRECISION */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
            <h3 className="text-xs font-black text-zinc-905 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-indigo-500" />
              <span>Precision Settings</span>
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {['auto', '0', '2', '4', '6', '8'].map((prec) => (
                <button
                  key={`prec-${prec}`}
                  onClick={() => setPrecision(prec)}
                  className={`py-1.5 rounded-lg border text-[10px] font-extrabold capitalize transition ${
                    precision === prec
                      ? 'border-indigo-600 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400'
                      : 'border-zinc-200 dark:border-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 text-zinc-500'
                  }`}
                >
                  {prec === 'auto' ? 'Auto' : `${prec} Dec`}
                </button>
              ))}
            </div>
          </div>

          {/* SMART NATURAL LANGUAGE CONVERTER */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 text-white space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span>Natural Language Input</span>
            </h3>
            <p className="text-[10px] text-zinc-400 leading-relaxed font-semibold">
              Type conversion sentences directly (e.g. <em>"5 feet 8 inches to cm"</em> or <em>"100 kmh to mph"</em>) and the tool will parse values instantly.
            </p>
            <form onSubmit={handleSmartSubmit} className="space-y-2">
              <input
                type="text"
                value={smartInput}
                onChange={(e) => setSmartInput(e.target.value)}
                placeholder="Convert 100 meters to feet..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold rounded-xl transition duration-200"
              >
                Parse & Convert
              </button>
            </form>
            {smartError && (
              <p className="text-[10px] text-rose-400 font-semibold">{smartError}</p>
            )}
          </div>

          {/* CIVIL & ARCHITECTURE SPECIALIZED PRESETS */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
            <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1">
              <Ruler className="w-4 h-4 text-indigo-500" />
              <span>Engineering Presets</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {constructionPresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => loadPreset(preset)}
                  className="px-2.5 py-1.5 text-[10px] font-bold text-zinc-650 dark:text-zinc-400 border border-zinc-150 dark:border-zinc-850 rounded-xl bg-zinc-50/40 dark:bg-zinc-950/20 hover:border-indigo-500/20 hover:bg-indigo-500/5 hover:text-indigo-600 transition"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* FAVORITE PAIRS */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
            <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Favorite Conversions</span>
            </h3>
            {favorites.length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {favorites.map((fav, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCategoryID(fav.category);
                      setFromUnit(fav.from);
                      setToUnit(fav.to);
                    }}
                    className="w-full flex items-center justify-between text-left p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-zinc-100 dark:border-zinc-850 text-xs font-bold text-zinc-700 dark:text-zinc-300"
                  >
                    <span>{fav.categoryName}: {fav.fromLabel} ➔ {fav.toLabel}</span>
                    <span className="text-amber-500">★</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-zinc-450 dark:text-zinc-500 font-semibold italic text-center py-4">
                Click the star icon on any conversion pair to save it here.
              </p>
            )}
          </div>

          {/* HISTORY */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800/50 pb-2">
              <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-4 h-4 text-teal-500" />
                <span>Recent Conversions</span>
              </h3>
              {history.length > 0 && (
                <button onClick={clearHistory} className="p-1 text-zinc-400 hover:text-red-500">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {history.length > 0 ? (
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {history.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => {
                      setCategoryID(h.category);
                      const dim = dimensions.find(d => d.id === h.category);
                      if (dim) {
                        const fromMatch = dim.units.find(u => u.label === h.fromUnit || u.symbol === h.fromSymbol);
                        const toMatch = dim.units.find(u => u.label === h.toUnit || u.symbol === h.toSymbol);
                        if (fromMatch) setFromUnit(fromMatch.value);
                        if (toMatch) setToUnit(toMatch.value);
                      }
                      setInputValue(h.fromVal.toString());
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-zinc-100 dark:border-zinc-850 flex flex-col space-y-1 font-mono text-[10px]"
                  >
                    <span className="text-zinc-400 font-bold uppercase">{h.categoryName}</span>
                    <div className="flex justify-between font-semibold text-zinc-700 dark:text-zinc-300">
                      <span>{h.fromVal} {h.fromSymbol}</span>
                      <span>➔</span>
                      <span className="text-indigo-600 dark:text-indigo-400">{formatResultValue(h.toVal)} {h.toSymbol}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-zinc-450 dark:text-zinc-500 font-semibold italic text-center py-4">
                No recent history. Conversions will appear here.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

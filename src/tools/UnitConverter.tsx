import { useState, useEffect, useMemo } from 'react';
import {
  Ruler,
  ArrowLeftRight,
  Check,
  Copy,
  Star,
  Sparkles,
  Trash2,
  Settings,
  Search,
  BookOpen,
  Zap,
  Building2,
  Compass,
  Cpu,
  Flame,
  Info,
  Layers,
  X
} from 'lucide-react';

// --- Domain & Category Interface Definitions ---
export interface Unit {
  value: string;
  label: string;
  symbol: string;
  ratio: number;
  isRegional?: boolean;
  convention?: string;
  categoryGroup?: string;
  isCustom?: boolean;
}

export interface Dimension {
  id: string;
  domainId: 'general' | 'architecture' | 'civil' | 'electrical' | 'electronics' | 'metallurgy';
  domainName: string;
  name: string;
  baseUnitName: string;
  formulaDesc: string;
  referenceStandard?: string;
  units: Unit[];
  customConvert?: (val: number, from: string, to: string) => number;
  customFormula?: (val: number, from: string, to: string) => string;
}

export interface DomainMeta {
  id: 'general' | 'architecture' | 'civil' | 'electrical' | 'electronics' | 'metallurgy';
  name: string;
  tagline: string;
  icon: any;
  colorClass: string;
  activeColor: string;
  badgeBg: string;
}

export const DOMAINS: DomainMeta[] = [
  {
    id: 'general',
    name: 'General & Regional',
    tagline: 'Standard metric, imperial & Indian land units',
    icon: Ruler,
    colorClass: 'text-indigo-600 dark:text-indigo-400',
    activeColor: 'bg-indigo-600 text-white shadow-xs',
    badgeBg: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
  },
  {
    id: 'architecture',
    name: 'Architecture',
    tagline: 'Scales, Lux lighting, U/R-values & pitch',
    icon: Compass,
    colorClass: 'text-violet-600 dark:text-violet-400',
    activeColor: 'bg-violet-600 text-white shadow-xs',
    badgeBg: 'bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300'
  },
  {
    id: 'civil',
    name: 'Civil & Structural',
    tagline: 'Stress (MPa/psi), kN, bending & discharge',
    icon: Building2,
    colorClass: 'text-amber-600 dark:text-amber-400',
    activeColor: 'bg-amber-600 text-white shadow-xs',
    badgeBg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
  },
  {
    id: 'electrical',
    name: 'Electrical',
    tagline: 'Current, Voltage, kW/kVA/kVAR, Earthing & kWh',
    icon: Zap,
    colorClass: 'text-yellow-600 dark:text-yellow-400',
    activeColor: 'bg-yellow-600 text-white shadow-xs',
    badgeBg: 'bg-yellow-50 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-300'
  },
  {
    id: 'electronics',
    name: 'Electronics',
    tagline: 'Capacitance, RF wavelength, dBm & AWG wire',
    icon: Cpu,
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    activeColor: 'bg-emerald-600 text-white shadow-xs',
    badgeBg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
  },
  {
    id: 'metallurgy',
    name: 'Metallurgy',
    tagline: 'Hardness (HRC/HV), CTE, K_IC & Sheet Gauges',
    icon: Flame,
    colorClass: 'text-rose-600 dark:text-rose-400',
    activeColor: 'bg-rose-600 text-white shadow-xs',
    badgeBg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
  }
];

// --- Specialized Conversion Functions ---
const convertTemperature = (val: number, from: string, to: string): number => {
  let cVal = 0;
  if (from === 'C') cVal = val;
  else if (from === 'F') cVal = (val - 32) * (5 / 9);
  else if (from === 'K') cVal = val - 273.15;
  else if (from === 'R') cVal = (val - 491.67) * (5 / 9);

  if (to === 'C') return cVal;
  if (to === 'F') return (cVal * 9) / 5 + 32;
  if (to === 'K') return cVal + 273.15;
  if (to === 'R') return (cVal + 273.15) * 1.8;
  return cVal;
};

const convertAcoustics = (val: number, from: string, to: string): number => {
  let pa = 0;
  if (from === 'dbspl') pa = 20e-6 * Math.pow(10, val / 20);
  else if (from === 'pa') pa = val;
  else if (from === 'ubar') pa = val * 0.1;
  else if (from === 'wm2') pa = Math.sqrt(Math.max(0, val) * 400);
  else if (from === 'dbsil') pa = Math.sqrt(Math.max(0, 1e-12 * Math.pow(10, val / 10)) * 400);

  if (to === 'pa') return pa;
  if (to === 'dbspl') return pa > 0 ? 20 * Math.log10(pa / 20e-6) : 0;
  if (to === 'ubar') return pa * 10;
  if (to === 'wm2') return (pa * pa) / 400;
  if (to === 'dbsil') {
    const wm2 = (pa * pa) / 400;
    return wm2 > 0 ? 10 * Math.log10(wm2 / 1e-12) : 0;
  }
  return pa;
};

const convertRoofPitch = (val: number, from: string, to: string): number => {
  let deg = 0;
  if (from === 'deg') deg = val;
  else if (from === 'rad') deg = (val * 180) / Math.PI;
  else if (from === 'mrad') deg = (val * 180) / (Math.PI * 1000);
  else if (from === 'pct') deg = (Math.atan(val / 100) * 180) / Math.PI;
  else if (from === 'pitch12') deg = (Math.atan(val / 12) * 180) / Math.PI;
  else if (from === 'ratio1x') deg = val > 0 ? (Math.atan(1 / val) * 180) / Math.PI : 90;

  if (to === 'deg') return deg;
  if (to === 'rad') return (deg * Math.PI) / 180;
  if (to === 'mrad') return (deg * Math.PI * 1000) / 180;
  if (to === 'pct') return Math.tan((deg * Math.PI) / 180) * 100;
  if (to === 'pitch12') return Math.tan((deg * Math.PI) / 180) * 12;
  if (to === 'ratio1x') {
    const t = Math.tan((deg * Math.PI) / 180);
    return t > 0 ? 1 / t : 0;
  }
  return deg;
};

const convertRfPower = (val: number, from: string, to: string): number => {
  let mw = 0;
  if (from === 'mw') mw = val;
  else if (from === 'w') mw = val * 1000;
  else if (from === 'dbm') mw = Math.pow(10, val / 10);
  else if (from === 'dbw') mw = Math.pow(10, (val + 30) / 10);
  else if (from === 'dbuv50') {
    const v = Math.pow(10, (val - 120) / 20);
    mw = ((v * v) / 50) * 1000;
  } else if (from === 'uw') mw = val * 1e-3;
  else if (from === 'nw') mw = val * 1e-6;
  else if (from === 'pw') mw = val * 1e-9;

  if (to === 'mw') return mw;
  if (to === 'w') return mw / 1000;
  if (to === 'dbm') return mw > 0 ? 10 * Math.log10(mw) : -999;
  if (to === 'dbw') return mw > 0 ? 10 * Math.log10(mw) - 30 : -999;
  if (to === 'dbuv50') {
    if (mw <= 0) return 0;
    const v = Math.sqrt((mw / 1000) * 50);
    return 20 * Math.log10(v) + 120;
  }
  if (to === 'uw') return mw * 1e3;
  if (to === 'nw') return mw * 1e6;
  if (to === 'pw') return mw * 1e9;
  return mw;
};

const HARDNESS_TABLE = [
  { hv: 940, hrc: 68.0, hrb: 120.0, hbw: 745, uts: 2400, mohs: 8.5 },
  { hv: 800, hrc: 64.0, hrb: 118.0, hbw: 700, uts: 2200, mohs: 8.0 },
  { hv: 700, hrc: 60.1, hrb: 116.0, hbw: 630, uts: 2000, mohs: 7.5 },
  { hv: 600, hrc: 55.2, hrb: 114.0, hbw: 560, uts: 1800, mohs: 7.0 },
  { hv: 500, hrc: 49.1, hrb: 111.0, hbw: 475, uts: 1550, mohs: 6.5 },
  { hv: 400, hrc: 40.8, hrb: 107.0, hbw: 380, uts: 1250, mohs: 6.0 },
  { hv: 350, hrc: 35.5, hrb: 104.0, hbw: 332, uts: 1090, mohs: 5.5 },
  { hv: 300, hrc: 29.8, hrb: 100.0, hbw: 285, uts: 935, mohs: 5.0 },
  { hv: 250, hrc: 22.2, hrb: 95.0, hbw: 238, uts: 780, mohs: 4.5 },
  { hv: 200, hrc: 11.5, hrb: 89.0, hbw: 190, uts: 625, mohs: 4.0 },
  { hv: 150, hrc: 0.0, hrb: 78.0, hbw: 143, uts: 470, mohs: 3.5 },
  { hv: 100, hrc: 0.0, hrb: 56.0, hbw: 95, uts: 310, mohs: 3.0 },
  { hv: 50, hrc: 0.0, hrb: 20.0, hbw: 47, uts: 150, mohs: 2.0 }
];

const convertHardness = (val: number, from: string, to: string): number => {
  if (from === to) return val;
  const n = HARDNESS_TABLE.length;
  let hv = 0;
  if (from === 'hv') {
    hv = val;
  } else {
    let found = false;
    for (let i = 0; i < n - 1; i++) {
      const p1 = HARDNESS_TABLE[i] as any;
      const p2 = HARDNESS_TABLE[i + 1] as any;
      const v1 = p1[from];
      const v2 = p2[from];
      if ((val <= v1 && val >= v2) || (val >= v1 && val <= v2)) {
        const factor = (val - v2) / (v1 - v2 || 1);
        hv = p2.hv + factor * (p1.hv - p2.hv);
        found = true;
        break;
      }
    }
    if (!found) {
      if (val > (HARDNESS_TABLE[0] as any)[from]) hv = HARDNESS_TABLE[0].hv;
      else hv = HARDNESS_TABLE[n - 1].hv;
    }
  }

  if (to === 'hv') return hv;
  for (let i = 0; i < n - 1; i++) {
    const p1 = HARDNESS_TABLE[i];
    const p2 = HARDNESS_TABLE[i + 1];
    if (hv <= p1.hv && hv >= p2.hv) {
      const factor = (hv - p2.hv) / (p1.hv - p2.hv || 1);
      const toVal2 = (p2 as any)[to];
      const toVal1 = (p1 as any)[to];
      return toVal2 + factor * (toVal1 - toVal2);
    }
  }
  if (hv > HARDNESS_TABLE[0].hv) return (HARDNESS_TABLE[0] as any)[to];
  return (HARDNESS_TABLE[n - 1] as any)[to];
};

const convertFrequencyWavelength = (val: number, from: string, to: string): number => {
  const c = 299792458;
  const isFreq = (u: string) => ['hz', 'khz', 'mhz', 'ghz', 'thz', 'rads', 'rpm'].includes(u);
  let hz = 0;
  if (isFreq(from)) {
    if (from === 'hz') hz = val;
    else if (from === 'khz') hz = val * 1e3;
    else if (from === 'mhz') hz = val * 1e6;
    else if (from === 'ghz') hz = val * 1e9;
    else if (from === 'thz') hz = val * 1e12;
    else if (from === 'rads') hz = val / (2 * Math.PI);
    else if (from === 'rpm') hz = val / 60;
  } else {
    let lambdaM = 0;
    if (from === 'lambda_m') lambdaM = val;
    else if (from === 'lambda_cm') lambdaM = val * 1e-2;
    else if (from === 'lambda_mm') lambdaM = val * 1e-3;
    else if (from === 'lambda_um') lambdaM = val * 1e-6;
    else if (from === 'lambda_nm') lambdaM = val * 1e-9;
    hz = lambdaM > 0 ? c / lambdaM : 0;
  }

  if (to === 'hz') return hz;
  if (to === 'khz') return hz * 1e-3;
  if (to === 'mhz') return hz * 1e-6;
  if (to === 'ghz') return hz * 1e-9;
  if (to === 'thz') return hz * 1e-12;
  if (to === 'rads') return hz * 2 * Math.PI;
  if (to === 'rpm') return hz * 60;
  const targetLambda = hz > 0 ? c / hz : 0;
  if (to === 'lambda_m') return targetLambda;
  if (to === 'lambda_cm') return targetLambda * 100;
  if (to === 'lambda_mm') return targetLambda * 1000;
  if (to === 'lambda_um') return targetLambda * 1e6;
  if (to === 'lambda_nm') return targetLambda * 1e9;
  return hz;
};

// --- Dimensions Configuration ---
export const dimensions: Dimension[] = [
  // ================= GENERAL & REGIONAL =================
  {
    id: 'length',
    domainId: 'general',
    domainName: 'General',
    name: 'Length & Distance',
    baseUnitName: 'Meter (m)',
    formulaDesc: 'Metric, Imperial & Regional linear measurements',
    units: [
      { value: 'mm', label: 'Millimeter', symbol: 'mm', ratio: 0.001, categoryGroup: 'Metric' },
      { value: 'cm', label: 'Centimeter', symbol: 'cm', ratio: 0.01, categoryGroup: 'Metric' },
      { value: 'm', label: 'Meter', symbol: 'm', ratio: 1.0, categoryGroup: 'Metric' },
      { value: 'km', label: 'Kilometer', symbol: 'km', ratio: 1000.0, categoryGroup: 'Metric' },
      { value: 'um', label: 'Micron', symbol: 'µm', ratio: 1e-6, categoryGroup: 'Metric' },
      { value: 'in', label: 'Inch', symbol: 'in', ratio: 0.0254, categoryGroup: 'Imperial' },
      { value: 'ft', label: 'Foot', symbol: 'ft', ratio: 0.3048, categoryGroup: 'Imperial' },
      { value: 'yd', label: 'Yard', symbol: 'yd', ratio: 0.9144, categoryGroup: 'Imperial' },
      { value: 'mi', label: 'Mile', symbol: 'mi', ratio: 1609.344, categoryGroup: 'Imperial' },
      { value: 'nmi', label: 'Nautical Mile', symbol: 'nmi', ratio: 1852.0, categoryGroup: 'Navigation' },
      { value: 'gaj_len', label: 'Gaj (Linear 3 ft)', symbol: 'gaj', ratio: 0.9144, isRegional: true, convention: 'Indian real estate length (36 in)', categoryGroup: 'Indian Regional' },
      { value: 'hath', label: 'Hath (18 in)', symbol: 'hath', ratio: 0.4572, isRegional: true, convention: 'Traditional Indian cubit (18 in)', categoryGroup: 'Indian Regional' },
      { value: 'chain', label: 'Survey Chain', symbol: 'ch', ratio: 20.1168, categoryGroup: 'Surveying' }
    ]
  },
  {
    id: 'weight',
    domainId: 'general',
    domainName: 'General',
    name: 'Weight & Mass',
    baseUnitName: 'Kilogram (kg)',
    formulaDesc: 'Metric, Imperial & Indian bullion / agricultural units',
    units: [
      { value: 'mg', label: 'Milligram', symbol: 'mg', ratio: 1e-6, categoryGroup: 'Metric' },
      { value: 'g', label: 'Gram', symbol: 'g', ratio: 0.001, categoryGroup: 'Metric' },
      { value: 'kg', label: 'Kilogram', symbol: 'kg', ratio: 1.0, categoryGroup: 'Metric' },
      { value: 't', label: 'Metric Tonne', symbol: 't', ratio: 1000.0, categoryGroup: 'Metric' },
      { value: 'oz', label: 'Ounce', symbol: 'oz', ratio: 0.028349523, categoryGroup: 'Imperial' },
      { value: 'lb', label: 'Pound (lb)', symbol: 'lb', ratio: 0.45359237, categoryGroup: 'Imperial' },
      { value: 'st', label: 'Stone', symbol: 'st', ratio: 6.35029318, categoryGroup: 'Imperial' },
      { value: 'unton', label: 'US Short Ton', symbol: 'ton (US)', ratio: 907.18474, categoryGroup: 'Imperial' },
      { value: 'quintal', label: 'Quintal (100 kg)', symbol: 'q', ratio: 100.0, isRegional: true, convention: 'Indian Mandi standard (100 kg)', categoryGroup: 'Indian Regional' },
      { value: 'tola', label: 'Tola (11.664 g)', symbol: 'tola', ratio: 0.0116638, isRegional: true, convention: 'Indian gold bullion standard', categoryGroup: 'Indian Bullion' },
      { value: 'maund', label: 'Maund (37.32 kg)', symbol: 'maund', ratio: 37.324, isRegional: true, convention: '40 seers ≈ 37.32 kg', categoryGroup: 'Indian Regional' },
      { value: 'ratti', label: 'Ratti (0.182 g)', symbol: 'ratti', ratio: 0.000182, isRegional: true, convention: 'Gemstone & Ayurvedic unit', categoryGroup: 'Indian Bullion' },
      { value: 'sovereign', label: 'Pavan (8 g)', symbol: 'pavan', ratio: 0.008, isRegional: true, convention: 'South Indian gold standard', categoryGroup: 'Indian Bullion' }
    ]
  },
  {
    id: 'area',
    domainId: 'general',
    domainName: 'General',
    name: 'Area & Land Revenue',
    baseUnitName: 'Square Meter (m²)',
    formulaDesc: 'State-wise Bigha, Biswa, Guntha, Ground, Cent & Acre',
    units: [
      { value: 'sq_mm', label: 'Square Millimeter', symbol: 'mm²', ratio: 1e-6, categoryGroup: 'Metric' },
      { value: 'sq_cm', label: 'Square Centimeter', symbol: 'cm²', ratio: 1e-4, categoryGroup: 'Metric' },
      { value: 'sq_m', label: 'Square Meter', symbol: 'm²', ratio: 1.0, categoryGroup: 'Metric' },
      { value: 'hectare', label: 'Hectare', symbol: 'ha', ratio: 10000.0, categoryGroup: 'Metric' },
      { value: 'sq_km', label: 'Square Kilometer', symbol: 'km²', ratio: 1e6, categoryGroup: 'Metric' },
      { value: 'sq_in', label: 'Square Inch', symbol: 'in²', ratio: 0.00064516, categoryGroup: 'Imperial' },
      { value: 'sq_ft', label: 'Square Foot', symbol: 'sq ft', ratio: 0.09290304, categoryGroup: 'Imperial' },
      { value: 'sq_yd', label: 'Square Yard (Gaj)', symbol: 'sq yd', ratio: 0.83612736, categoryGroup: 'Imperial' },
      { value: 'acre', label: 'Acre', symbol: 'ac', ratio: 4046.8564224, categoryGroup: 'Imperial' },
      { value: 'bigha_up', label: 'Bigha (UP / Haryana)', symbol: 'bigha (UP)', ratio: 2529.28, isRegional: true, convention: '27,225 sq ft = 3,025 sq yd', categoryGroup: 'Indian Land' },
      { value: 'bigha_bengal', label: 'Bigha (Bengal / Assam)', symbol: 'bigha (WB)', ratio: 1337.8, isRegional: true, convention: '14,400 sq ft = 20 Katha', categoryGroup: 'Indian Land' },
      { value: 'bigha_rajasthan', label: 'Bigha (Rajasthan / MP)', symbol: 'bigha (RJ)', ratio: 1618.74, isRegional: true, convention: '17,424 sq ft = 1,936 sq yd', categoryGroup: 'Indian Land' },
      { value: 'biswa', label: 'Biswa (UP / Punjab)', symbol: 'biswa', ratio: 126.464, isRegional: true, convention: '1/20 Bigha = 1,361.25 sq ft', categoryGroup: 'Indian Land' },
      { value: 'biswansi', label: 'Biswansi', symbol: 'biswansi', ratio: 6.3232, isRegional: true, convention: '68.06 sq ft', categoryGroup: 'Indian Land' },
      { value: 'kanal', label: 'Kanal (North India)', symbol: 'kanal', ratio: 505.857, isRegional: true, convention: '5,445 sq ft = 20 Marla', categoryGroup: 'Indian Land' },
      { value: 'marla', label: 'Marla', symbol: 'marla', ratio: 25.29285, isRegional: true, convention: '272.25 sq ft', categoryGroup: 'Indian Land' },
      { value: 'guntha', label: 'Guntha (MH / KA / GJ)', symbol: 'guntha', ratio: 101.1714, isRegional: true, convention: '1,089 sq ft = 1/40 Acre', categoryGroup: 'Indian Land' },
      { value: 'ground', label: 'Ground (Tamil Nadu)', symbol: 'ground', ratio: 222.967, isRegional: true, convention: '2,400 sq ft', categoryGroup: 'Indian Land' },
      { value: 'cent', label: 'Cent (South India)', symbol: 'cent', ratio: 40.4686, isRegional: true, convention: '435.6 sq ft = 1/100 Acre', categoryGroup: 'Indian Land' },
      { value: 'ankanam', label: 'Ankanam (AP)', symbol: 'ankanam', ratio: 6.689, isRegional: true, convention: '72 sq ft', categoryGroup: 'Indian Land' },
      { value: 'katha', label: 'Katha (Bengal / Bihar)', symbol: 'katha', ratio: 66.89, isRegional: true, convention: '720 sq ft', categoryGroup: 'Indian Land' },
      { value: 'chatak', label: 'Chatak', symbol: 'chatak', ratio: 4.18, isRegional: true, convention: '45 sq ft', categoryGroup: 'Indian Land' }
    ]
  },
  {
    id: 'volume',
    domainId: 'general',
    domainName: 'General',
    name: 'Volume & Bulk Construction',
    baseUnitName: 'Liter (L)',
    formulaDesc: 'Liquid volume & site bulk (Brass, CFT, Dumper)',
    units: [
      { value: 'mL', label: 'Milliliter', symbol: 'mL', ratio: 0.001, categoryGroup: 'Metric' },
      { value: 'L', label: 'Liter', symbol: 'L', ratio: 1.0, categoryGroup: 'Metric' },
      { value: 'm3', label: 'Cubic Meter (Cum)', symbol: 'm³', ratio: 1000.0, categoryGroup: 'Metric' },
      { value: 'cm3', label: 'Cubic Centimeter (cc)', symbol: 'cm³', ratio: 0.001, categoryGroup: 'Metric' },
      { value: 'gal_us', label: 'US Liquid Gallon', symbol: 'gal (US)', ratio: 3.785411784, categoryGroup: 'Imperial' },
      { value: 'gal_uk', label: 'Imperial Gallon', symbol: 'gal (UK)', ratio: 4.54609, categoryGroup: 'Imperial' },
      { value: 'floz_us', label: 'US Fluid Ounce', symbol: 'fl oz', ratio: 0.0295735, categoryGroup: 'Imperial' },
      { value: 'ft3', label: 'Cubic Foot (CFT)', symbol: 'cu ft', ratio: 28.316846592, categoryGroup: 'Imperial' },
      { value: 'yd3', label: 'Cubic Yard', symbol: 'cu yd', ratio: 764.554857984, categoryGroup: 'Imperial' },
      { value: 'brass', label: 'Brass (100 CFT)', symbol: 'brass', ratio: 2831.6846592, isRegional: true, convention: '1 Brass = 100 CFT = 2.8317 m³', categoryGroup: 'Civil Site' },
      { value: 'truck_dumper', label: 'Truck Dumper (~400 CFT)', symbol: 'dumper', ratio: 11326.738, isRegional: true, convention: '~400 CFT ≈ 4 Brass', categoryGroup: 'Civil Site' },
      { value: 'trolley', label: 'Tractor Trolley (~100 CFT)', symbol: 'trolley', ratio: 2831.6846, isRegional: true, convention: '~100 CFT ≈ 1 Brass', categoryGroup: 'Civil Site' }
    ]
  },
  {
    id: 'temperature',
    domainId: 'general',
    domainName: 'General',
    name: 'Temperature',
    baseUnitName: 'Celsius (°C)',
    formulaDesc: 'Thermodynamic & weather scales (°C, °F, K, °R)',
    units: [
      { value: 'C', label: 'Celsius', symbol: '°C', ratio: 1.0, isCustom: true },
      { value: 'F', label: 'Fahrenheit', symbol: '°F', ratio: 1.0, isCustom: true },
      { value: 'K', label: 'Kelvin', symbol: 'K', ratio: 1.0, isCustom: true },
      { value: 'R', label: 'Rankine', symbol: '°R', ratio: 1.0, isCustom: true }
    ],
    customConvert: convertTemperature,
    customFormula: (val, from, to) => {
      if (from === 'C' && to === 'F') return `(${val}°C × 9/5) + 32 = ${(val * 1.8 + 32).toFixed(2)} °F`;
      if (from === 'F' && to === 'C') return `(${val}°F − 32) × 5/9 = ${(((val - 32) * 5) / 9).toFixed(2)} °C`;
      if (from === 'C' && to === 'K') return `${val}°C + 273.15 = ${(val + 273.15).toFixed(2)} K`;
      if (from === 'K' && to === 'C') return `${val}K − 273.15 = ${(val - 273.15).toFixed(2)} °C`;
      return `Convert ${from} to Celsius base, then scale to ${to}`;
    }
  },
  {
    id: 'pressure',
    domainId: 'general',
    domainName: 'General',
    name: 'Pressure & Vacuum',
    baseUnitName: 'Pascal (Pa)',
    formulaDesc: 'Fluid, atmospheric & barometric pressure',
    units: [
      { value: 'Pa', label: 'Pascal', symbol: 'Pa', ratio: 1.0, categoryGroup: 'Metric' },
      { value: 'kPa', label: 'Kilopascal', symbol: 'kPa', ratio: 1000.0, categoryGroup: 'Metric' },
      { value: 'MPa', label: 'Megapascal', symbol: 'MPa', ratio: 1e6, categoryGroup: 'Metric' },
      { value: 'bar', label: 'Bar', symbol: 'bar', ratio: 100000.0, categoryGroup: 'Metric' },
      { value: 'mbar', label: 'Millibar / hPa', symbol: 'mbar', ratio: 100.0, categoryGroup: 'Metric' },
      { value: 'psi', label: 'PSI (lbf/in²)', symbol: 'psi', ratio: 6894.75729, categoryGroup: 'Imperial' },
      { value: 'ksi', label: 'KSI (kip/in²)', symbol: 'ksi', ratio: 6894757.29, categoryGroup: 'Imperial' },
      { value: 'atm', label: 'Atmosphere (atm)', symbol: 'atm', ratio: 101325.0, categoryGroup: 'Scientific' },
      { value: 'torr', label: 'Torr (mmHg)', symbol: 'Torr', ratio: 133.322368, categoryGroup: 'Scientific' },
      { value: 'kgf_cm2', label: 'kgf / cm²', symbol: 'kgf/cm²', ratio: 98066.5, categoryGroup: 'Technical' }
    ]
  },
  {
    id: 'energy',
    domainId: 'general',
    domainName: 'General',
    name: 'Energy & Work',
    baseUnitName: 'Joule (J)',
    formulaDesc: 'Mechanical, thermal, electrical energy & BTU',
    units: [
      { value: 'J', label: 'Joule', symbol: 'J', ratio: 1.0, categoryGroup: 'Metric' },
      { value: 'kJ', label: 'Kilojoule', symbol: 'kJ', ratio: 1000.0, categoryGroup: 'Metric' },
      { value: 'MJ', label: 'Megajoule', symbol: 'MJ', ratio: 1e6, categoryGroup: 'Metric' },
      { value: 'cal', label: 'Calorie', symbol: 'cal', ratio: 4.184, categoryGroup: 'Thermal' },
      { value: 'kcal', label: 'Kilocalorie', symbol: 'kcal', ratio: 4184.0, categoryGroup: 'Thermal' },
      { value: 'Wh', label: 'Watt-hour', symbol: 'Wh', ratio: 3600.0, categoryGroup: 'Electrical' },
      { value: 'kWh', label: 'Kilowatt-hour (Unit)', symbol: 'kWh', ratio: 3.6e6, categoryGroup: 'Electrical' },
      { value: 'btu', label: 'BTU', symbol: 'BTU', ratio: 1055.05585, categoryGroup: 'HVAC' },
      { value: 'ftlbf', label: 'Foot-Pound force', symbol: 'ft·lbf', ratio: 1.35581794833, categoryGroup: 'Mechanical' },
      { value: 'ev', label: 'Electronvolt', symbol: 'eV', ratio: 1.602176634e-19, categoryGroup: 'Atomic' }
    ]
  },
  {
    id: 'power',
    domainId: 'general',
    domainName: 'General',
    name: 'Power & Heat Rate',
    baseUnitName: 'Watt (W)',
    formulaDesc: 'Electrical kW, mechanical hp & HVAC tons (TR)',
    units: [
      { value: 'W', label: 'Watt', symbol: 'W', ratio: 1.0, categoryGroup: 'Metric' },
      { value: 'kW', label: 'Kilowatt', symbol: 'kW', ratio: 1000.0, categoryGroup: 'Metric' },
      { value: 'MW', label: 'Megawatt', symbol: 'MW', ratio: 1e6, categoryGroup: 'Metric' },
      { value: 'hp_mech', label: 'Horsepower (Mechanical)', symbol: 'hp', ratio: 745.699872, categoryGroup: 'Mechanical' },
      { value: 'hp_metric', label: 'Horsepower (Metric PS)', symbol: 'PS', ratio: 735.49875, categoryGroup: 'Mechanical' },
      { value: 'tr', label: 'Ton of Refrigeration (TR)', symbol: 'TR', ratio: 3516.85284, categoryGroup: 'HVAC' },
      { value: 'btu_hr', label: 'BTU / hr', symbol: 'BTU/hr', ratio: 0.293071, categoryGroup: 'HVAC' },
      { value: 'kcal_hr', label: 'kcal / hr', symbol: 'kcal/hr', ratio: 1.163, categoryGroup: 'HVAC' }
    ]
  },
  {
    id: 'angle',
    domainId: 'general',
    domainName: 'General',
    name: 'Angle & Rotation',
    baseUnitName: 'Degree (°)',
    formulaDesc: 'Degrees, Radians, Gradians and Turns',
    units: [
      { value: 'deg', label: 'Degree', symbol: '°', ratio: 1.0 },
      { value: 'rad', label: 'Radian', symbol: 'rad', ratio: 57.295779513 },
      { value: 'grad', label: 'Gradian (Gon)', symbol: 'grad', ratio: 0.9 },
      { value: 'arcmin', label: 'Arcminute', symbol: 'arcmin', ratio: 1 / 60 },
      { value: 'arcsec', label: 'Arcsecond', symbol: 'arcsec', ratio: 1 / 3600 },
      { value: 'rev', label: 'Revolution / Turn', symbol: 'rev', ratio: 360.0 }
    ]
  },
  {
    id: 'speed',
    domainId: 'general',
    domainName: 'General',
    name: 'Speed & Velocity',
    baseUnitName: 'Meter/Second (m/s)',
    formulaDesc: 'Velocity, km/h, mph, knots & Mach',
    units: [
      { value: 'ms', label: 'Meter/Second', symbol: 'm/s', ratio: 1.0, categoryGroup: 'Metric' },
      { value: 'kmh', label: 'Kilometer/Hour', symbol: 'km/h', ratio: 0.277777778, categoryGroup: 'Metric' },
      { value: 'mph', label: 'Mile/Hour', symbol: 'mph', ratio: 0.44704, categoryGroup: 'Imperial' },
      { value: 'knot', label: 'Knot', symbol: 'kn', ratio: 0.514444444, categoryGroup: 'Navigation' },
      { value: 'fts', label: 'Foot/Second', symbol: 'ft/s', ratio: 0.3048, categoryGroup: 'Imperial' },
      { value: 'mach', label: 'Mach (STP ~340.3 m/s)', symbol: 'Mach', ratio: 340.29, categoryGroup: 'Aero' }
    ]
  },
  {
    id: 'time',
    domainId: 'general',
    domainName: 'General',
    name: 'Time',
    baseUnitName: 'Second (s)',
    formulaDesc: 'Nanoseconds to solar years',
    units: [
      { value: 'ns', label: 'Nanosecond', symbol: 'ns', ratio: 1e-9 },
      { value: 'us', label: 'Microsecond', symbol: 'µs', ratio: 1e-6 },
      { value: 'ms', label: 'Millisecond', symbol: 'ms', ratio: 0.001 },
      { value: 's', label: 'Second', symbol: 's', ratio: 1.0 },
      { value: 'min', label: 'Minute', symbol: 'min', ratio: 60.0 },
      { value: 'hr', label: 'Hour', symbol: 'hr', ratio: 3600.0 },
      { value: 'day', label: 'Day', symbol: 'day', ratio: 86400.0 },
      { value: 'week', label: 'Week', symbol: 'wk', ratio: 604800.0 },
      { value: 'month', label: 'Month (30.44 d)', symbol: 'mo', ratio: 2629746.0 },
      { value: 'year', label: 'Year (365.25 d)', symbol: 'yr', ratio: 31557600.0 }
    ]
  },

  // ================= ARCHITECTURE & INTERIORS =================
  {
    id: 'drawingscale',
    domainId: 'architecture',
    domainName: 'Architecture',
    name: 'Drawing Scale & CAD',
    baseUnitName: 'Real World Scale (1:1)',
    formulaDesc: 'Blueprint drawing scales (IS 10711 / ISO 5455)',
    referenceStandard: 'IS 10711 / ISO 5455',
    units: [
      { value: 'scale_1_1', label: 'Full Scale (1:1)', symbol: '1:1', ratio: 1.0, categoryGroup: 'Metric Scales' },
      { value: 'scale_1_2', label: 'Half Scale (1:2)', symbol: '1:2', ratio: 2.0, categoryGroup: 'Metric Scales' },
      { value: 'scale_1_5', label: 'Detail (1:5)', symbol: '1:5', ratio: 5.0, categoryGroup: 'Metric Scales' },
      { value: 'scale_1_10', label: 'Interior Detail (1:10)', symbol: '1:10', ratio: 10.0, categoryGroup: 'Metric Scales' },
      { value: 'scale_1_20', label: 'Room Layout (1:20)', symbol: '1:20', ratio: 20.0, categoryGroup: 'Metric Scales' },
      { value: 'scale_1_50', label: 'Floor Plan (1:50)', symbol: '1:50', ratio: 50.0, categoryGroup: 'Metric Scales' },
      { value: 'scale_1_100', label: 'Building Plan (1:100)', symbol: '1:100', ratio: 100.0, categoryGroup: 'Metric Scales' },
      { value: 'scale_1_200', label: 'Site Plan (1:200)', symbol: '1:200', ratio: 200.0, categoryGroup: 'Metric Scales' },
      { value: 'scale_1_500', label: 'Master Plan (1:500)', symbol: '1:500', ratio: 500.0, categoryGroup: 'Metric Scales' },
      { value: 'scale_1_1000', label: 'City Survey (1:1000)', symbol: '1:1000', ratio: 1000.0, categoryGroup: 'Metric Scales' },
      { value: 'scale_1_2500', label: 'Town Plan (1:2500)', symbol: '1:2500', ratio: 2500.0, categoryGroup: 'Metric Scales' },
      { value: 'scale_imp_1_16', label: 'Imperial 1/16" = 1\'', symbol: '1/16"=1\'', ratio: 192.0, categoryGroup: 'Imperial Scales' },
      { value: 'scale_imp_1_8', label: 'Imperial 1/8" = 1\'', symbol: '1/8"=1\'', ratio: 96.0, categoryGroup: 'Imperial Scales' },
      { value: 'scale_imp_1_4', label: 'Imperial 1/4" = 1\'', symbol: '1/4"=1\'', ratio: 48.0, categoryGroup: 'Imperial Scales' },
      { value: 'scale_imp_1_2', label: 'Imperial 1/2" = 1\'', symbol: '1/2"=1\'', ratio: 24.0, categoryGroup: 'Imperial Scales' },
      { value: 'scale_imp_1', label: 'Imperial 1" = 1\'', symbol: '1"=1\'', ratio: 12.0, categoryGroup: 'Imperial Scales' },
      { value: 'scale_imp_3', label: 'Imperial 3" = 1\'', symbol: '3"=1\'', ratio: 4.0, categoryGroup: 'Imperial Scales' }
    ]
  },
  {
    id: 'illuminance',
    domainId: 'architecture',
    domainName: 'Architecture',
    name: 'Illuminance & Lighting',
    baseUnitName: 'Lux (lx)',
    formulaDesc: 'Lighting intensity (NBC 2016 / IS 3646)',
    referenceStandard: 'NBC 2016 Part 8 / IS 3646',
    units: [
      { value: 'lux', label: 'Lux (Lumen / m²)', symbol: 'lx', ratio: 1.0, categoryGroup: 'Metric' },
      { value: 'fc', label: 'Foot-candle (Lumen / ft²)', symbol: 'fc', ratio: 10.7639104, categoryGroup: 'Imperial' },
      { value: 'phot', label: 'Phot (Lumen / cm²)', symbol: 'ph', ratio: 10000.0, categoryGroup: 'CGS' },
      { value: 'flame', label: 'Nox / Flame', symbol: 'nox', ratio: 0.001, categoryGroup: 'Special' }
    ]
  },
  {
    id: 'thermalinsulation',
    domainId: 'architecture',
    domainName: 'Architecture',
    name: 'Thermal Insulation (U / R)',
    baseUnitName: 'U-Value SI (W/m²·K)',
    formulaDesc: 'U-value, R-value, RSI, Tog and Clo',
    referenceStandard: 'ECBC 2017 / ASHRAE 90.1',
    units: [
      { value: 'u_si', label: 'U-Value SI (W / m²·K)', symbol: 'W/m²·K', ratio: 1.0, categoryGroup: 'Transmittance' },
      { value: 'u_imp', label: 'U-Value Imperial', symbol: 'BTU/h·ft²·°F', ratio: 5.6782633, categoryGroup: 'Transmittance' },
      { value: 'rsi', label: 'RSI Resistance (m²·K / W)', symbol: 'RSI', ratio: 1.0, isCustom: true, categoryGroup: 'Resistance' },
      { value: 'r_imp', label: 'R-Value Imperial', symbol: 'R-val', ratio: 1.0, isCustom: true, categoryGroup: 'Resistance' },
      { value: 'tog', label: 'Tog (Textile Insulation)', symbol: 'tog', ratio: 1.0, isCustom: true, categoryGroup: 'Textile' },
      { value: 'clo', label: 'Clo (Clothing Insulation)', symbol: 'clo', ratio: 1.0, isCustom: true, categoryGroup: 'Comfort' }
    ],
    customConvert: (val, from, to) => {
      let uSi = 0;
      if (from === 'u_si') uSi = val;
      else if (from === 'u_imp') uSi = val * 5.6782633;
      else if (from === 'rsi') uSi = val > 0 ? 1 / val : 0;
      else if (from === 'r_imp') {
        const rsi = val * 0.17611018;
        uSi = rsi > 0 ? 1 / rsi : 0;
      } else if (from === 'tog') {
        const rsi = val * 0.1;
        uSi = rsi > 0 ? 1 / rsi : 0;
      } else if (from === 'clo') {
        const rsi = val * 0.155;
        uSi = rsi > 0 ? 1 / rsi : 0;
      }

      if (to === 'u_si') return uSi;
      if (to === 'u_imp') return uSi / 5.6782633;
      const rsi = uSi > 0 ? 1 / uSi : 0;
      if (to === 'rsi') return rsi;
      if (to === 'r_imp') return rsi / 0.17611018;
      if (to === 'tog') return rsi * 10;
      if (to === 'clo') return rsi / 0.155;
      return uSi;
    },
    customFormula: () => `R = 1 / U. RSI (m²·K/W) = 1 / U-value. R-Imp = RSI × 5.678. Tog = RSI × 10.`
  },
  {
    id: 'acoustics',
    domainId: 'architecture',
    domainName: 'Architecture',
    name: 'Acoustics & Sound Pressure',
    baseUnitName: 'dB SPL (ref 20 µPa)',
    formulaDesc: 'Sound levels & room acoustics (IS 2526 / ISO 1996)',
    referenceStandard: 'IS 2526 / NBC 2016',
    units: [
      { value: 'dbspl', label: 'Decibels (dB SPL)', symbol: 'dB SPL', ratio: 1.0, isCustom: true },
      { value: 'pa', label: 'Sound Pressure (Pa)', symbol: 'Pa', ratio: 1.0, isCustom: true },
      { value: 'ubar', label: 'Microbar (µbar)', symbol: 'µbar', ratio: 1.0, isCustom: true },
      { value: 'wm2', label: 'Sound Intensity (W/m²)', symbol: 'W/m²', ratio: 1.0, isCustom: true },
      { value: 'dbsil', label: 'Intensity Level (dB SIL)', symbol: 'dB SIL', ratio: 1.0, isCustom: true }
    ],
    customConvert: convertAcoustics,
    customFormula: () => `L_p = 20 × log10(p / 20 µPa). Intensity I = p² / (ρ × c).`
  },
  {
    id: 'roofpitch',
    domainId: 'architecture',
    domainName: 'Architecture',
    name: 'Roof Pitch & Ramp Slope',
    baseUnitName: 'Slope Angle (°)',
    formulaDesc: 'Ramp slope (1:12), drainage gradient & roof pitch',
    referenceStandard: 'NBC 2016 Access Norms',
    units: [
      { value: 'deg', label: 'Angle Degrees (°)', symbol: '°', ratio: 1.0, isCustom: true },
      { value: 'pct', label: 'Percentage Grade (%)', symbol: '% grade', ratio: 1.0, isCustom: true },
      { value: 'pitch12', label: 'Pitch X / 12 in', symbol: 'X/12', ratio: 1.0, isCustom: true },
      { value: 'ratio1x', label: 'Ratio 1 : X', symbol: '1:X', ratio: 1.0, isCustom: true },
      { value: 'mrad', label: 'Milliradians', symbol: 'mrad', ratio: 1.0, isCustom: true }
    ],
    customConvert: convertRoofPitch,
    customFormula: () => `Slope (%) = tan(θ) × 100. Pitch (X/12) = tan(θ) × 12. Ratio (1:X) X = 1/tan(θ).`
  },

  // ================= CIVIL & STRUCTURAL ENGINEERING =================
  {
    id: 'stress',
    domainId: 'civil',
    domainName: 'Civil',
    name: 'Stress & Concrete Strength',
    baseUnitName: 'Megapascal (MPa)',
    formulaDesc: 'Concrete grades (M20-M60), rebar yield & soil SBC',
    referenceStandard: 'IS 456:2000 / ACI 318',
    units: [
      { value: 'MPa', label: 'Megapascal (MPa)', symbol: 'MPa', ratio: 1.0, categoryGroup: 'SI Standards' },
      { value: 'N_mm2', label: 'Newton / mm²', symbol: 'N/mm²', ratio: 1.0, categoryGroup: 'SI Standards' },
      { value: 'GPa', label: 'Gigapascal (GPa)', symbol: 'GPa', ratio: 1000.0, categoryGroup: 'SI Standards' },
      { value: 'kPa', label: 'Kilopascal (Soil SBC)', symbol: 'kPa', ratio: 0.001, categoryGroup: 'SI Standards' },
      { value: 'psi', label: 'Pounds / sq inch (psi)', symbol: 'psi', ratio: 0.006894757, categoryGroup: 'US Customary' },
      { value: 'ksi', label: 'Kips / sq inch (ksi)', symbol: 'ksi', ratio: 6.894757, categoryGroup: 'US Customary' },
      { value: 'kgf_cm2', label: 'kgf / cm²', symbol: 'kgf/cm²', ratio: 0.0980665, categoryGroup: 'Technical' },
      { value: 'tf_m2', label: 'Tonne-force / m² (SBC)', symbol: 'tf/m²', ratio: 0.00980665, categoryGroup: 'Geotech' },
      { value: 'psf', label: 'Pounds / sq ft (psf)', symbol: 'psf', ratio: 0.00004788026, categoryGroup: 'US Customary' }
    ]
  },
  {
    id: 'structforce',
    domainId: 'civil',
    domainName: 'Civil',
    name: 'Structural Force & Load',
    baseUnitName: 'Kilonewton (kN)',
    formulaDesc: 'Column axial loads, seismic base shear & reactions',
    referenceStandard: 'IS 875 / IS 1893:2016',
    units: [
      { value: 'N', label: 'Newton', symbol: 'N', ratio: 0.001, categoryGroup: 'Metric' },
      { value: 'kN', label: 'Kilonewton (kN)', symbol: 'kN', ratio: 1.0, categoryGroup: 'Metric' },
      { value: 'MN', label: 'Meganewton (MN)', symbol: 'MN', ratio: 1000.0, categoryGroup: 'Metric' },
      { value: 'lbf', label: 'Pound-force (lbf)', symbol: 'lbf', ratio: 0.004448222, categoryGroup: 'US Customary' },
      { value: 'kip', label: 'Kip (1,000 lbf)', symbol: 'kip', ratio: 4.448221615, categoryGroup: 'US Customary' },
      { value: 'tf_force', label: 'Tonne-force (tf)', symbol: 'tf', ratio: 9.80665, categoryGroup: 'Technical' }
    ]
  },
  {
    id: 'lineload',
    domainId: 'civil',
    domainName: 'Civil',
    name: 'Distributed Line Load (UDL)',
    baseUnitName: 'kN / m',
    formulaDesc: 'Beam wall load, slab UDL per meter run',
    referenceStandard: 'IS 875 (Part 1 & 2)',
    units: [
      { value: 'kN_m', label: 'Kilonewton / meter', symbol: 'kN/m', ratio: 1.0, categoryGroup: 'Metric' },
      { value: 'N_mm', label: 'Newton / millimeter', symbol: 'N/mm', ratio: 1.0, categoryGroup: 'Metric' },
      { value: 'N_m', label: 'Newton / meter', symbol: 'N/m', ratio: 0.001, categoryGroup: 'Metric' },
      { value: 'kgf_m', label: 'kgf / meter', symbol: 'kgf/m', ratio: 0.00980665, categoryGroup: 'Technical' },
      { value: 'lbf_ft', label: 'Pounds / linear ft (plf)', symbol: 'plf', ratio: 0.0145939, categoryGroup: 'US Customary' },
      { value: 'kip_ft', label: 'Kips / linear ft (klf)', symbol: 'klf', ratio: 14.5939029, categoryGroup: 'US Customary' }
    ]
  },
  {
    id: 'bendingmoment',
    domainId: 'civil',
    domainName: 'Civil',
    name: 'Bending Moment & Torque',
    baseUnitName: 'kN·m',
    formulaDesc: 'RCC beam moments & torsion (IS 456 SP 16)',
    referenceStandard: 'IS 456:2000 Section 3',
    units: [
      { value: 'kNm', label: 'Kilonewton·meter', symbol: 'kN·m', ratio: 1.0, categoryGroup: 'Metric' },
      { value: 'Nm', label: 'Newton·meter', symbol: 'N·m', ratio: 0.001, categoryGroup: 'Metric' },
      { value: 'MNm', label: 'Meganewton·meter', symbol: 'MN·m', ratio: 1000.0, categoryGroup: 'Metric' },
      { value: 'lbfft', label: 'Pound-force·foot', symbol: 'lbf·ft', ratio: 0.001355818, categoryGroup: 'US Customary' },
      { value: 'kipft', label: 'Kip·foot', symbol: 'kip·ft', ratio: 1.355817948, categoryGroup: 'US Customary' },
      { value: 'kipin', label: 'Kip·inch', symbol: 'kip·in', ratio: 0.112984829, categoryGroup: 'US Customary' },
      { value: 'tfm', label: 'Tonne-force·meter', symbol: 'tf·m', ratio: 9.80665, categoryGroup: 'Technical' }
    ]
  },
  {
    id: 'flowrate',
    domainId: 'civil',
    domainName: 'Civil',
    name: 'Hydraulic Discharge (Flow)',
    baseUnitName: 'Cumec (m³/s)',
    formulaDesc: 'Canal discharge, drainage & municipal supply',
    referenceStandard: 'CWC / CPHEEO Manual',
    units: [
      { value: 'cumec', label: 'Cumec (m³ / sec)', symbol: 'cumec', ratio: 1.0, categoryGroup: 'Canal & Dam' },
      { value: 'cusec', label: 'Cusec (cu ft / sec)', symbol: 'cusec', ratio: 0.028316846, isRegional: true, convention: '1 cusec = 28.32 Liters/sec', categoryGroup: 'Irrigation' },
      { value: 'l_s', label: 'Liters / second', symbol: 'L/s', ratio: 0.001, categoryGroup: 'Plumbing' },
      { value: 'l_min', label: 'Liters / minute (LPM)', symbol: 'LPM', ratio: 1 / 60000, categoryGroup: 'Plumbing' },
      { value: 'm3_hr', label: 'Cubic meters / hour', symbol: 'm³/hr', ratio: 1 / 3600, categoryGroup: 'Pumping' },
      { value: 'mld', label: 'MLD (Million Litres/Day)', symbol: 'MLD', ratio: 1e6 / (1000 * 86400), isRegional: true, convention: '1 MLD = 1,000 m³/day', categoryGroup: 'WTP / STP' },
      { value: 'mgd', label: 'MGD (Million US Gal/Day)', symbol: 'MGD', ratio: 0.043812636, categoryGroup: 'US Municipal' },
      { value: 'us_gpm', label: 'US Gallons / minute (GPM)', symbol: 'GPM', ratio: 0.0000630902, categoryGroup: 'Pumping' }
    ]
  },
  {
    id: 'bulkdensity',
    domainId: 'civil',
    domainName: 'Civil',
    name: 'Bulk Density & Unit Weight',
    baseUnitName: 'kg / m³',
    formulaDesc: 'Unit weight of RCC, steel, soil & aggregates',
    referenceStandard: 'IS 875 (Part 1) Table 1',
    units: [
      { value: 'kg_m3', label: 'Kilogram / m³', symbol: 'kg/m³', ratio: 1.0, categoryGroup: 'Metric' },
      { value: 'kn_m3', label: 'Kilonewton / m³', symbol: 'kN/m³', ratio: 101.971621, categoryGroup: 'Structural' },
      { value: 'g_cm3', label: 'Gram / cm³ (SG)', symbol: 'g/cm³', ratio: 1000.0, categoryGroup: 'Materials' },
      { value: 'pcf', label: 'Pounds / cu ft (pcf)', symbol: 'pcf', ratio: 16.018463, categoryGroup: 'US Customary' },
      { value: 't_m3', label: 'Tonne / m³', symbol: 't/m³', ratio: 1000.0, categoryGroup: 'Technical' }
    ]
  },

  // ================= ELECTRICAL ENGINEERING =================
  {
    id: 'current',
    domainId: 'electrical',
    domainName: 'Electrical',
    name: 'Electric Current',
    baseUnitName: 'Ampere (A)',
    formulaDesc: 'Microamps leakage to substation kiloamperes',
    referenceStandard: 'IS 732 / IEC 60364',
    units: [
      { value: 'uA', label: 'Microampere', symbol: 'µA', ratio: 1e-6 },
      { value: 'mA', label: 'Milliampere', symbol: 'mA', ratio: 0.001 },
      { value: 'A', label: 'Ampere', symbol: 'A', ratio: 1.0 },
      { value: 'kA', label: 'Kiloampere (Fault)', symbol: 'kA', ratio: 1000.0 }
    ]
  },
  {
    id: 'voltage',
    domainId: 'electrical',
    domainName: 'Electrical',
    name: 'Voltage & Potential',
    baseUnitName: 'Volt (V)',
    formulaDesc: 'Sensors (mV) to 400kV / 765kV grid lines',
    referenceStandard: 'CEA Grid Standards',
    units: [
      { value: 'uV', label: 'Microvolt', symbol: 'µV', ratio: 1e-6 },
      { value: 'mV', label: 'Millivolt', symbol: 'mV', ratio: 0.001 },
      { value: 'V', label: 'Volt (230V / 415V)', symbol: 'V', ratio: 1.0 },
      { value: 'kV', label: 'Kilovolt (11kV to 400kV)', symbol: 'kV', ratio: 1000.0 },
      { value: 'MV', label: 'Megavolt', symbol: 'MV', ratio: 1e6 }
    ]
  },
  {
    id: 'elecpower',
    domainId: 'electrical',
    domainName: 'Electrical',
    name: 'Power (kW / kVA / kVAR)',
    baseUnitName: 'Kilowatt (kW)',
    formulaDesc: 'Active (kW), Apparent (kVA) & Reactive (kVAR)',
    referenceStandard: 'IS 2026 / IEEE 1459',
    units: [
      { value: 'W', label: 'Watt (Real)', symbol: 'W', ratio: 0.001, categoryGroup: 'Real Active' },
      { value: 'kW', label: 'Kilowatt (Real)', symbol: 'kW', ratio: 1.0, categoryGroup: 'Real Active' },
      { value: 'MW', label: 'Megawatt (Real)', symbol: 'MW', ratio: 1000.0, categoryGroup: 'Real Active' },
      { value: 'VA', label: 'Volt-Ampere (Apparent)', symbol: 'VA', ratio: 0.001, categoryGroup: 'Apparent' },
      { value: 'kVA', label: 'kVA (DG / Transformer)', symbol: 'kVA', ratio: 1.0, categoryGroup: 'Apparent' },
      { value: 'MVA', label: 'MVA (Substation)', symbol: 'MVA', ratio: 1000.0, categoryGroup: 'Apparent' },
      { value: 'var', label: 'VAR (Reactive)', symbol: 'VAR', ratio: 0.001, categoryGroup: 'Reactive' },
      { value: 'kvar', label: 'kVAR (Capacitor Bank)', symbol: 'kVAR', ratio: 1.0, categoryGroup: 'Reactive' },
      { value: 'mvar', label: 'MVAR (Grid APFC)', symbol: 'MVAR', ratio: 1000.0, categoryGroup: 'Reactive' },
      { value: 'hp_elec', label: 'Motor Horsepower', symbol: 'hp (elec)', ratio: 0.746, categoryGroup: 'Motors' }
    ]
  },
  {
    id: 'resistance',
    domainId: 'electrical',
    domainName: 'Electrical',
    name: 'Resistance & Earthing',
    baseUnitName: 'Ohm (Ω)',
    formulaDesc: 'Earth pit (<1Ω), Megger insulation (MΩ) & Siemens',
    referenceStandard: 'IS 3043 Earthing Code',
    units: [
      { value: 'uohm', label: 'Microohm (µΩ)', symbol: 'µΩ', ratio: 1e-6, categoryGroup: 'Resistance' },
      { value: 'mohm', label: 'Milliohm (mΩ)', symbol: 'mΩ', ratio: 0.001, categoryGroup: 'Resistance' },
      { value: 'ohm', label: 'Ohm (Ω)', symbol: 'Ω', ratio: 1.0, categoryGroup: 'Resistance' },
      { value: 'kohm', label: 'Kiloohm (kΩ)', symbol: 'kΩ', ratio: 1000.0, categoryGroup: 'Resistance' },
      { value: 'Mohm', label: 'Megaohm (Megger MΩ)', symbol: 'MΩ', ratio: 1e6, categoryGroup: 'Resistance' },
      { value: 'Gohm', label: 'Gigaohm (GΩ)', symbol: 'GΩ', ratio: 1e9, categoryGroup: 'Resistance' },
      { value: 'siemens', label: 'Siemens (Conductance)', symbol: 'S', ratio: 1.0, isCustom: true, categoryGroup: 'Conductance' },
      { value: 'mho', label: 'Mho (℧)', symbol: '℧', ratio: 1.0, isCustom: true, categoryGroup: 'Conductance' }
    ],
    customConvert: (val, from, to) => {
      let ohm = 0;
      if (from === 'siemens' || from === 'mho') ohm = val > 0 ? 1 / val : 0;
      else if (from === 'uohm') ohm = val * 1e-6;
      else if (from === 'mohm') ohm = val * 1e-3;
      else if (from === 'ohm') ohm = val;
      else if (from === 'kohm') ohm = val * 1e3;
      else if (from === 'Mohm') ohm = val * 1e6;
      else if (from === 'Gohm') ohm = val * 1e9;

      if (to === 'siemens' || to === 'mho') return ohm > 0 ? 1 / ohm : 0;
      if (to === 'uohm') return ohm * 1e6;
      if (to === 'mohm') return ohm * 1e3;
      if (to === 'ohm') return ohm;
      if (to === 'kohm') return ohm * 1e-3;
      if (to === 'Mohm') return ohm * 1e-6;
      if (to === 'Gohm') return ohm * 1e-9;
      return ohm;
    }
  },
  {
    id: 'energyconsumption',
    domainId: 'electrical',
    domainName: 'Electrical',
    name: 'Electricity Bill Units (kWh)',
    baseUnitName: 'kWh (1 Unit)',
    formulaDesc: 'DISCOM electricity bill meter units',
    referenceStandard: 'DISCOM Tariff Schedule',
    units: [
      { value: 'wh', label: 'Watt-hour', symbol: 'Wh', ratio: 0.001 },
      { value: 'kwh', label: 'kWh (1 Indian EB Meter Unit)', symbol: 'kWh', ratio: 1.0, isRegional: true, convention: 'Official DISCOM Billing Unit' },
      { value: 'mwh', label: 'Megawatt-hour', symbol: 'MWh', ratio: 1000.0 },
      { value: 'gwh', label: 'Gigawatt-hour', symbol: 'GWh', ratio: 1e6 },
      { value: 'mj_elec', label: 'Megajoule (MJ)', symbol: 'MJ', ratio: 1 / 3.6 },
      { value: 'btu_elec', label: 'BTU', symbol: 'BTU', ratio: 0.00029307107 }
    ]
  },
  {
    id: 'batterycap',
    domainId: 'electrical',
    domainName: 'Electrical',
    name: 'Battery Capacity (Ah / Wh)',
    baseUnitName: 'Ampere-hour (Ah)',
    formulaDesc: 'Capacity in Ah & Wh for 3.7V Li-ion, 12V Lead-Acid & 48V LFP',
    referenceStandard: 'IS 16046 / IEC 62133',
    units: [
      { value: 'mah', label: 'Milliampere-hour (mAh)', symbol: 'mAh', ratio: 0.001, categoryGroup: 'Capacity' },
      { value: 'ah', label: 'Ampere-hour (Ah)', symbol: 'Ah', ratio: 1.0, categoryGroup: 'Capacity' },
      { value: 'coulomb', label: 'Coulombs (C)', symbol: 'C', ratio: 1 / 3600, categoryGroup: 'Charge' },
      { value: 'wh_37v', label: 'Wh @ 3.7V (Li-ion)', symbol: 'Wh @ 3.7V', ratio: 1 / 3.7, isCustom: true, categoryGroup: 'Energy Equivalence' },
      { value: 'wh_12v', label: 'Wh @ 12V (Tubular)', symbol: 'Wh @ 12V', ratio: 1 / 12, isCustom: true, categoryGroup: 'Energy Equivalence' },
      { value: 'wh_48v', label: 'Wh @ 48V (Solar LFP)', symbol: 'Wh @ 48V', ratio: 1 / 48, isCustom: true, categoryGroup: 'Energy Equivalence' },
      { value: 'kwh_48v', label: 'kWh @ 48V Solar Bank', symbol: 'kWh @ 48V', ratio: 1000 / 48, isCustom: true, categoryGroup: 'Energy Equivalence' }
    ],
    customConvert: (val, from, to) => {
      let ah = 0;
      if (from === 'mah') ah = val * 0.001;
      else if (from === 'ah') ah = val;
      else if (from === 'coulomb') ah = val / 3600;
      else if (from === 'wh_37v') ah = val / 3.7;
      else if (from === 'wh_12v') ah = val / 12.0;
      else if (from === 'wh_48v') ah = val / 48.0;
      else if (from === 'kwh_48v') ah = (val * 1000) / 48.0;

      if (to === 'mah') return ah * 1000;
      if (to === 'ah') return ah;
      if (to === 'coulomb') return ah * 3600;
      if (to === 'wh_37v') return ah * 3.7;
      if (to === 'wh_12v') return ah * 12.0;
      if (to === 'wh_48v') return ah * 48.0;
      if (to === 'kwh_48v') return (ah * 48.0) / 1000;
      return ah;
    }
  },

  // ================= ELECTRONICS & TELECOMMUNICATIONS =================
  {
    id: 'capacitance',
    domainId: 'electronics',
    domainName: 'Electronics',
    name: 'Capacitance',
    baseUnitName: 'Microfarad (µF)',
    formulaDesc: 'SMD picofarads (pF) to supercapacitors (F)',
    referenceStandard: 'EIA-198 / IEC 60384',
    units: [
      { value: 'pf', label: 'Picofarad (pF)', symbol: 'pF', ratio: 1e-6 },
      { value: 'nf', label: 'Nanofarad (nF)', symbol: 'nF', ratio: 0.001 },
      { value: 'uf', label: 'Microfarad (µF)', symbol: 'µF', ratio: 1.0 },
      { value: 'mf', label: 'Millifarad (mF)', symbol: 'mF', ratio: 1000.0 },
      { value: 'f', label: 'Farad (F)', symbol: 'F', ratio: 1e6 }
    ]
  },
  {
    id: 'inductance',
    domainId: 'electronics',
    domainName: 'Electronics',
    name: 'Inductance',
    baseUnitName: 'Millihenry (mH)',
    formulaDesc: 'PCB parasitics (pH) to chokes (mH, H)',
    referenceStandard: 'IEC 60027',
    units: [
      { value: 'ph', label: 'Picohenry (pH)', symbol: 'pH', ratio: 1e-9 },
      { value: 'nh', label: 'Nanohenry (nH)', symbol: 'nH', ratio: 1e-6 },
      { value: 'uh', label: 'Microhenry (µH)', symbol: 'µH', ratio: 0.001 },
      { value: 'mh', label: 'Millihenry (mH)', symbol: 'mH', ratio: 1.0 },
      { value: 'h', label: 'Henry (H)', symbol: 'H', ratio: 1000.0 }
    ]
  },
  {
    id: 'frequency_rf',
    domainId: 'electronics',
    domainName: 'Electronics',
    name: 'Frequency & RF Wavelength (λ)',
    baseUnitName: 'Megahertz (MHz)',
    formulaDesc: 'Spectrum frequency to free-space wavelength (λ = c / f)',
    referenceStandard: 'ITU-R / WPC India',
    units: [
      { value: 'hz', label: 'Hertz (Hz)', symbol: 'Hz', ratio: 1.0, isCustom: true, categoryGroup: 'Frequency' },
      { value: 'khz', label: 'Kilohertz (kHz)', symbol: 'kHz', ratio: 1.0, isCustom: true, categoryGroup: 'Frequency' },
      { value: 'mhz', label: 'Megahertz (MHz)', symbol: 'MHz', ratio: 1.0, isCustom: true, categoryGroup: 'Frequency' },
      { value: 'ghz', label: 'Gigahertz (GHz)', symbol: 'GHz', ratio: 1.0, isCustom: true, categoryGroup: 'Frequency' },
      { value: 'thz', label: 'Terahertz (THz)', symbol: 'THz', ratio: 1.0, isCustom: true, categoryGroup: 'Frequency' },
      { value: 'rpm', label: 'RPM', symbol: 'RPM', ratio: 1.0, isCustom: true, categoryGroup: 'Rotational' },
      { value: 'rads', label: 'Rad / sec', symbol: 'rad/s', ratio: 1.0, isCustom: true, categoryGroup: 'Angular' },
      { value: 'lambda_m', label: 'Wavelength λ (m)', symbol: 'λ (m)', ratio: 1.0, isCustom: true, categoryGroup: 'Wavelength' },
      { value: 'lambda_cm', label: 'Wavelength λ (cm)', symbol: 'λ (cm)', ratio: 1.0, isCustom: true, categoryGroup: 'Wavelength' },
      { value: 'lambda_mm', label: 'Wavelength λ (mm)', symbol: 'λ (mm)', ratio: 1.0, isCustom: true, categoryGroup: 'Wavelength' }
    ],
    customConvert: convertFrequencyWavelength,
    customFormula: () => `c = f × λ where c ≈ 299,792,458 m/s (speed of light).`
  },
  {
    id: 'rfpower',
    domainId: 'electronics',
    domainName: 'Electronics',
    name: 'RF Power & Decibels (dBm)',
    baseUnitName: 'dBm',
    formulaDesc: 'Transmitter power, RSSI & 50Ω load levels',
    referenceStandard: '3GPP / IEEE 802.11',
    units: [
      { value: 'dbm', label: 'dBm (ref 1 mW)', symbol: 'dBm', ratio: 1.0, isCustom: true, categoryGroup: 'Logarithmic' },
      { value: 'dbw', label: 'dBW (ref 1 W)', symbol: 'dBW', ratio: 1.0, isCustom: true, categoryGroup: 'Logarithmic' },
      { value: 'dbuv50', label: 'dBµV (in 50 Ω)', symbol: 'dBµV (50Ω)', ratio: 1.0, isCustom: true, categoryGroup: 'Logarithmic' },
      { value: 'pw', label: 'Picowatt (pW)', symbol: 'pW', ratio: 1.0, isCustom: true, categoryGroup: 'Linear' },
      { value: 'nw', label: 'Nanowatt (nW)', symbol: 'nW', ratio: 1.0, isCustom: true, categoryGroup: 'Linear' },
      { value: 'uw', label: 'Microwatt (µW)', symbol: 'µW', ratio: 1.0, isCustom: true, categoryGroup: 'Linear' },
      { value: 'mw', label: 'Milliwatt (mW)', symbol: 'mW', ratio: 1.0, isCustom: true, categoryGroup: 'Linear' },
      { value: 'w', label: 'Watt (W)', symbol: 'W', ratio: 1.0, isCustom: true, categoryGroup: 'Linear' }
    ],
    customConvert: convertRfPower,
    customFormula: () => `P (dBm) = 10 × log10(P_mW). 0 dBm = 1 mW. 30 dBm = 1 W.`
  },
  {
    id: 'wiregauge',
    domainId: 'electronics',
    domainName: 'Electronics',
    name: 'Wire Gauge (AWG / SWG / mm²)',
    baseUnitName: 'Area in mm²',
    formulaDesc: 'AWG, SWG and Metric conductor cross-section',
    referenceStandard: 'IS 694 / ASTM B258 / BS 3737',
    units: [
      { value: 'sq_mm_wire', label: 'Metric Conductor (mm²)', symbol: 'mm²', ratio: 1.0, categoryGroup: 'Metric' },
      { value: 'cmil', label: 'Circular Mils (cmil)', symbol: 'cmil', ratio: 0.000506707479, categoryGroup: 'US' },
      { value: 'kcmil', label: 'kcmil / MCM', symbol: 'kcmil', ratio: 0.506707479, categoryGroup: 'US' },
      { value: 'awg_4_0', label: 'AWG 4/0 (107.2 mm²)', symbol: 'AWG 4/0', ratio: 107.22, categoryGroup: 'AWG' },
      { value: 'awg_2_0', label: 'AWG 2/0 (67.4 mm²)', symbol: 'AWG 2/0', ratio: 67.43, categoryGroup: 'AWG' },
      { value: 'awg_1_0', label: 'AWG 1/0 (53.5 mm²)', symbol: 'AWG 1/0', ratio: 53.49, categoryGroup: 'AWG' },
      { value: 'awg_2', label: 'AWG 2 (33.6 mm²)', symbol: 'AWG 2', ratio: 33.63, categoryGroup: 'AWG' },
      { value: 'awg_4', label: 'AWG 4 (21.2 mm²)', symbol: 'AWG 4', ratio: 21.15, categoryGroup: 'AWG' },
      { value: 'awg_6', label: 'AWG 6 (13.3 mm²)', symbol: 'AWG 6', ratio: 13.30, categoryGroup: 'AWG' },
      { value: 'awg_8', label: 'AWG 8 (8.37 mm²)', symbol: 'AWG 8', ratio: 8.366, categoryGroup: 'AWG' },
      { value: 'awg_10', label: 'AWG 10 (5.26 mm²)', symbol: 'AWG 10', ratio: 5.261, categoryGroup: 'AWG' },
      { value: 'awg_12', label: 'AWG 12 (3.31 mm²)', symbol: 'AWG 12', ratio: 3.309, categoryGroup: 'AWG' },
      { value: 'awg_14', label: 'AWG 14 (2.08 mm²)', symbol: 'AWG 14', ratio: 2.081, categoryGroup: 'AWG' },
      { value: 'awg_16', label: 'AWG 16 (1.31 mm²)', symbol: 'AWG 16', ratio: 1.309, categoryGroup: 'AWG' },
      { value: 'awg_18', label: 'AWG 18 (0.82 mm²)', symbol: 'AWG 18', ratio: 0.823, categoryGroup: 'AWG' },
      { value: 'awg_20', label: 'AWG 20 (0.52 mm²)', symbol: 'AWG 20', ratio: 0.518, categoryGroup: 'AWG' },
      { value: 'awg_22', label: 'AWG 22 (0.33 mm²)', symbol: 'AWG 22', ratio: 0.326, categoryGroup: 'AWG' },
      { value: 'awg_24', label: 'AWG 24 (0.21 mm²)', symbol: 'AWG 24', ratio: 0.205, categoryGroup: 'AWG' },
      { value: 'awg_26', label: 'AWG 26 (0.13 mm²)', symbol: 'AWG 26', ratio: 0.129, categoryGroup: 'AWG' },
      { value: 'swg_10', label: 'SWG 10 (8.30 mm²)', symbol: 'SWG 10', ratio: 8.296, categoryGroup: 'SWG' },
      { value: 'swg_12', label: 'SWG 12 (5.48 mm²)', symbol: 'SWG 12', ratio: 5.482, categoryGroup: 'SWG' },
      { value: 'swg_14', label: 'SWG 14 (3.24 mm²)', symbol: 'SWG 14', ratio: 3.243, categoryGroup: 'SWG' },
      { value: 'swg_16', label: 'SWG 16 (2.08 mm²)', symbol: 'SWG 16', ratio: 2.076, categoryGroup: 'SWG' },
      { value: 'swg_18', label: 'SWG 18 (1.17 mm²)', symbol: 'SWG 18', ratio: 1.167, categoryGroup: 'SWG' },
      { value: 'swg_20', label: 'SWG 20 (0.66 mm²)', symbol: 'SWG 20', ratio: 0.6567, categoryGroup: 'SWG' },
      { value: 'swg_22', label: 'SWG 22 (0.40 mm²)', symbol: 'SWG 22', ratio: 0.3973, categoryGroup: 'SWG' }
    ]
  },

  // ================= METALLURGY & MATERIALS SCIENCE =================
  {
    id: 'hardness',
    domainId: 'metallurgy',
    domainName: 'Metallurgy',
    name: 'Hardness Scales (ASTM E140)',
    baseUnitName: 'Vickers (HV)',
    formulaDesc: 'Steel hardness: HV, HRC, HRB, HBW & UTS (MPa)',
    referenceStandard: 'ASTM E140 / ISO 18265',
    units: [
      { value: 'hv', label: 'Vickers (HV)', symbol: 'HV', ratio: 1.0, isCustom: true, categoryGroup: 'Vickers' },
      { value: 'hrc', label: 'Rockwell C (HRC)', symbol: 'HRC', ratio: 1.0, isCustom: true, categoryGroup: 'Rockwell' },
      { value: 'hrb', label: 'Rockwell B (HRB)', symbol: 'HRB', ratio: 1.0, isCustom: true, categoryGroup: 'Rockwell' },
      { value: 'hbw', label: 'Brinell (HBW 10/3000)', symbol: 'HBW', ratio: 1.0, isCustom: true, categoryGroup: 'Brinell' },
      { value: 'uts', label: 'Tensile Strength (UTS MPa)', symbol: 'UTS (MPa)', ratio: 1.0, isCustom: true, categoryGroup: 'Tensile' },
      { value: 'mohs', label: 'Mohs Mineral Scale', symbol: 'Mohs', ratio: 1.0, isCustom: true, categoryGroup: 'Mineral' }
    ],
    customConvert: convertHardness,
    customFormula: () => `Converted using ASTM E140 / ISO 18265 Non-Austenitic Steel polynomials.`
  },
  {
    id: 'thermalexpansion',
    domainId: 'metallurgy',
    domainName: 'Metallurgy',
    name: 'Thermal Expansion (CTE)',
    baseUnitName: 'µm / (m·°C)',
    formulaDesc: 'Linear expansion (α) of steel, concrete & aluminium',
    referenceStandard: 'ASTM E228 / ISO 11359',
    units: [
      { value: 'um_m_c', label: 'µm / (m·°C) or ppm / °C', symbol: 'µm/(m·°C)', ratio: 1.0, categoryGroup: 'SI' },
      { value: 'e6_k', label: '10⁻⁶ / Kelvin (K⁻¹)', symbol: '10⁻⁶/K', ratio: 1.0, categoryGroup: 'SI' },
      { value: 'ppm_f', label: 'ppm / °F', symbol: 'ppm/°F', ratio: 1.8, categoryGroup: 'Imperial' },
      { value: 'in_in_f', label: 'µin / (in·°F)', symbol: 'µin/(in·°F)', ratio: 1.8, categoryGroup: 'Imperial' },
      { value: 'mm_m_c', label: 'mm / (m·100°C)', symbol: 'mm/(m·100°C)', ratio: 10.0, categoryGroup: 'Technical' }
    ]
  },
  {
    id: 'fracturetoughness',
    domainId: 'metallurgy',
    domainName: 'Metallurgy',
    name: 'Fracture Toughness (K_IC)',
    baseUnitName: 'MPa·√m',
    formulaDesc: 'Stress intensity factor for structural welds & vessels',
    referenceStandard: 'ASTM E399',
    units: [
      { value: 'mpa_rt_m', label: 'MPa·√m', symbol: 'MPa·√m', ratio: 1.0, categoryGroup: 'SI' },
      { value: 'n_mm_15', label: 'N / mm^(1.5)', symbol: 'N/mm^1.5', ratio: 0.0316227766, categoryGroup: 'SI' },
      { value: 'ksi_rt_in', label: 'ksi·√in', symbol: 'ksi·√in', ratio: 1.09884, categoryGroup: 'US Customary' },
      { value: 'pa_rt_m', label: 'Pa·√m', symbol: 'Pa·√m', ratio: 1e-6, categoryGroup: 'Scientific' },
      { value: 'bar_rt_m', label: 'bar·√m', symbol: 'bar·√m', ratio: 0.1, categoryGroup: 'European' }
    ]
  },
  {
    id: 'sheetgauge',
    domainId: 'metallurgy',
    domainName: 'Metallurgy',
    name: 'Sheet Metal Gauge Thickness',
    baseUnitName: 'Thickness (mm)',
    formulaDesc: 'CRCA Mild Steel, GI, SS & Aluminium sheets',
    referenceStandard: 'IS 513 / IS 277 / ASTM A480',
    units: [
      { value: 'mm_sheet', label: 'Millimeter (mm)', symbol: 'mm', ratio: 1.0, categoryGroup: 'Metric' },
      { value: 'inch_sheet', label: 'Decimal Inch (in)', symbol: 'in', ratio: 25.4, categoryGroup: 'Imperial' },
      { value: 'thou_sheet', label: 'Thou / Mils (0.001 in)', symbol: 'mil', ratio: 0.0254, categoryGroup: 'Precision' },
      { value: 'crca_10ga', label: 'CRCA Steel 10 Ga (3.42 mm)', symbol: '10 Ga (Steel)', ratio: 3.416, categoryGroup: 'CRCA Steel' },
      { value: 'crca_12ga', label: 'CRCA Steel 12 Ga (2.66 mm)', symbol: '12 Ga (Steel)', ratio: 2.657, categoryGroup: 'CRCA Steel' },
      { value: 'crca_14ga', label: 'CRCA Steel 14 Ga (1.90 mm)', symbol: '14 Ga (Steel)', ratio: 1.897, categoryGroup: 'CRCA Steel' },
      { value: 'crca_16ga', label: 'CRCA Steel 16 Ga (1.52 mm)', symbol: '16 Ga (Steel)', ratio: 1.519, categoryGroup: 'CRCA Steel' },
      { value: 'crca_18ga', label: 'CRCA Steel 18 Ga (1.21 mm)', symbol: '18 Ga (Steel)', ratio: 1.214, categoryGroup: 'CRCA Steel' },
      { value: 'crca_20ga', label: 'CRCA Steel 20 Ga (0.91 mm)', symbol: '20 Ga (Steel)', ratio: 0.912, categoryGroup: 'CRCA Steel' },
      { value: 'crca_22ga', label: 'CRCA Steel 22 Ga (0.76 mm)', symbol: '22 Ga (Steel)', ratio: 0.759, categoryGroup: 'CRCA Steel' },
      { value: 'crca_24ga', label: 'CRCA Steel 24 Ga (0.61 mm)', symbol: '24 Ga (Steel)', ratio: 0.607, categoryGroup: 'CRCA Steel' },
      { value: 'crca_26ga', label: 'CRCA Steel 26 Ga (0.45 mm)', symbol: '26 Ga (Steel)', ratio: 0.455, categoryGroup: 'CRCA Steel' },
      { value: 'gi_20ga', label: 'GI 20 Ga (1.00 mm)', symbol: '20 Ga (GI)', ratio: 1.000, categoryGroup: 'GI Sheet' },
      { value: 'gi_22ga', label: 'GI 22 Ga (0.80 mm)', symbol: '22 Ga (GI)', ratio: 0.800, categoryGroup: 'GI Sheet' },
      { value: 'gi_24ga', label: 'GI 24 Ga (0.63 mm)', symbol: '24 Ga (GI)', ratio: 0.630, categoryGroup: 'GI Sheet' },
      { value: 'ss_18ga', label: 'Stainless Steel 18 Ga (1.27 mm)', symbol: '18 Ga (SS)', ratio: 1.270, categoryGroup: 'Stainless' },
      { value: 'ss_20ga', label: 'Stainless Steel 20 Ga (0.95 mm)', symbol: '20 Ga (SS)', ratio: 0.952, categoryGroup: 'Stainless' }
    ]
  },
  {
    id: 'impacttoughness',
    domainId: 'metallurgy',
    domainName: 'Metallurgy',
    name: 'Specific Heat & Charpy Impact',
    baseUnitName: 'Specific Heat J/(kg·K)',
    formulaDesc: 'Thermal capacity & Charpy V-notch fracture energy',
    referenceStandard: 'ASTM E23 / IS 1757',
    units: [
      { value: 'j_kg_k', label: 'Specific Heat: J / (kg·K)', symbol: 'J/(kg·K)', ratio: 1.0, categoryGroup: 'Specific Heat' },
      { value: 'kj_kg_k', label: 'Specific Heat: kJ / (kg·K)', symbol: 'kJ/(kg·K)', ratio: 1000.0, categoryGroup: 'Specific Heat' },
      { value: 'cal_g_c', label: 'Specific Heat: cal / (g·°C)', symbol: 'cal/(g·°C)', ratio: 4184.0, categoryGroup: 'Specific Heat' },
      { value: 'btu_lb_f', label: 'Specific Heat: BTU / (lb·°F)', symbol: 'BTU/(lb·°F)', ratio: 4186.8, categoryGroup: 'Specific Heat' },
      { value: 'charpy_j', label: 'Charpy Impact (Joules)', symbol: 'J (CVN)', ratio: 1.0, isCustom: true, categoryGroup: 'Charpy' },
      { value: 'charpy_ftlbf', label: 'Charpy Impact (ft·lbf)', symbol: 'ft·lbf (CVN)', ratio: 1.355818, isCustom: true, categoryGroup: 'Charpy' },
      { value: 'izod_jm', label: 'Izod Strength (J / m)', symbol: 'J/m (Izod)', ratio: 1.0, isCustom: true, categoryGroup: 'Izod' }
    ],
    customConvert: (val, from, to) => {
      if (from.startsWith('charpy') || to.startsWith('charpy') || from.startsWith('izod') || to.startsWith('izod')) {
        let j = 0;
        if (from === 'charpy_j') j = val;
        else if (from === 'charpy_ftlbf') j = val * 1.355818;
        else if (from === 'izod_jm') j = val * 0.0127;

        if (to === 'charpy_j') return j;
        if (to === 'charpy_ftlbf') return j / 1.355818;
        if (to === 'izod_jm') return j / 0.0127;
        return j;
      }
      const ratios: Record<string, number> = {
        j_kg_k: 1.0,
        kj_kg_k: 1000.0,
        cal_g_c: 4184.0,
        btu_lb_f: 4186.8
      };
      const fromR = ratios[from] || 1.0;
      const toR = ratios[to] || 1.0;
      return (val * fromR) / toR;
    }
  }
];

// --- Engineering Quick Presets ---
interface EngineeringPreset {
  label: string;
  category: string;
  dimensionId: string;
  fromUnit: string;
  toUnit: string;
  value: number;
  note: string;
}

const QUICK_PRESETS: EngineeringPreset[] = [
  {
    label: 'Concrete M25 (25 MPa ➔ psi)',
    category: 'Civil',
    dimensionId: 'stress',
    fromUnit: 'MPa',
    toUnit: 'psi',
    value: 25,
    note: 'Standard RCC mix = 3,626 psi'
  },
  {
    label: 'Canal Flow (100 Cusec ➔ L/s)',
    category: 'Civil',
    dimensionId: 'flowrate',
    fromUnit: 'cusec',
    toUnit: 'l_s',
    value: 100,
    note: '100 cusecs = 2,831.68 L/s'
  },
  {
    label: 'Office Light (500 Lux ➔ fc)',
    category: 'Arch',
    dimensionId: 'illuminance',
    fromUnit: 'lux',
    toUnit: 'fc',
    value: 500,
    note: 'NBC desk standard = 46.45 fc'
  },
  {
    label: 'Ramp Slope (1:12 ➔ % Grade)',
    category: 'Arch',
    dimensionId: 'roofpitch',
    fromUnit: 'ratio1x',
    toUnit: 'pct',
    value: 12,
    note: 'Universal access = 8.33% (4.76°)'
  },
  {
    label: 'Wire (1.5 mm² ➔ AWG 16)',
    category: 'Elec',
    dimensionId: 'wiregauge',
    fromUnit: 'sq_mm_wire',
    toUnit: 'awg_16',
    value: 1.5,
    note: 'Indian lighting circuit ≈ 16 AWG'
  },
  {
    label: 'Steel (60 HRC ➔ HV & UTS)',
    category: 'Metal',
    dimensionId: 'hardness',
    fromUnit: 'hrc',
    toUnit: 'hv',
    value: 60,
    note: 'Tool steel = ~697 HV (2000 MPa UTS)'
  },
  {
    label: 'CRCA 18 Ga (18 Ga ➔ mm)',
    category: 'Metal',
    dimensionId: 'sheetgauge',
    fromUnit: 'crca_18ga',
    toUnit: 'mm_sheet',
    value: 1,
    note: 'Control panels = 1.214 mm thickness'
  },
  {
    label: 'Land (5 Bigha UP ➔ Acre)',
    category: 'Land',
    dimensionId: 'area',
    fromUnit: 'bigha_up',
    toUnit: 'acre',
    value: 5,
    note: '5 UP Bighas = 3.125 Acres'
  }
];

export default function UnitConverter() {
  // --- States ---
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [categoryID, setCategoryID] = useState<string>('length');
  const [fromUnit, setFromUnit] = useState<string>('m');
  const [toUnit, setToUnit] = useState<string>('ft');
  const [inputValue, setInputValue] = useState<string>('1');
  const [copied, setCopied] = useState<boolean>(false);
  const [precision, setPrecision] = useState<number>(4);
  const [useScientific, setUseScientific] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [smartInputQuery, setSmartInputQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'matrix' | 'presets' | 'saved'>('matrix');

  const [favorites, setFavorites] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('unit_converter_favorites_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [history, setHistory] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('unit_converter_history_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Current dimension object
  const currentDimension = useMemo(() => {
    return dimensions.find((d) => d.id === categoryID) || dimensions[0];
  }, [categoryID]);

  // Filtered dimensions based on selectedDomain and search query
  const filteredDimensions = useMemo(() => {
    return dimensions.filter((dim) => {
      const matchesDomain = selectedDomain === 'all' || dim.domainId === selectedDomain;
      if (!searchQuery.trim()) return matchesDomain;
      const q = searchQuery.toLowerCase();
      const matchesDimName = dim.name.toLowerCase().includes(q);
      const matchesBaseUnit = dim.baseUnitName.toLowerCase().includes(q);
      const matchesUnits = dim.units.some(
        (u) =>
          u.label.toLowerCase().includes(q) ||
          u.symbol.toLowerCase().includes(q) ||
          (u.convention && u.convention.toLowerCase().includes(q))
      );
      return (matchesDomain || selectedDomain === 'all') && (matchesDimName || matchesBaseUnit || matchesUnits);
    });
  }, [selectedDomain, searchQuery]);

  // Sync From and To units when dimension changes
  useEffect(() => {
    if (currentDimension) {
      const u = currentDimension.units;
      const hasFrom = u.some((unit) => unit.value === fromUnit);
      const hasTo = u.some((unit) => unit.value === toUnit);

      if (!hasFrom && u.length > 0) {
        setFromUnit(u[0].value);
      }
      if (!hasTo && u.length > 1) {
        setToUnit(u[1].value);
      } else if (!hasTo && u.length > 0) {
        setToUnit(u[0].value);
      }
    }
  }, [categoryID, currentDimension, fromUnit, toUnit]);

  // Core Conversion Engine
  const conversionResult = useMemo(() => {
    const val = parseFloat(inputValue);
    if (isNaN(val)) return null;

    const fromObj = currentDimension.units.find((u) => u.value === fromUnit);
    const toObj = currentDimension.units.find((u) => u.value === toUnit);
    if (!fromObj || !toObj) return null;

    let res = 0;
    if (currentDimension.customConvert) {
      res = currentDimension.customConvert(val, fromUnit, toUnit);
    } else {
      const baseValue = val * fromObj.ratio;
      res = baseValue / toObj.ratio;
    }

    return {
      value: res,
      fromUnitObj: fromObj,
      toUnitObj: toObj
    };
  }, [inputValue, fromUnit, toUnit, currentDimension]);

  // Format numbers nicely
  const formatResultValue = (val: number | null | undefined): string => {
    if (val === null || val === undefined || isNaN(val)) return '—';
    if (val === 0) return '0';
    if (useScientific || (Math.abs(val) < 1e-5 && Math.abs(val) > 0) || Math.abs(val) >= 1e8) {
      return val.toExponential(precision);
    }
    const fixed = val.toFixed(precision);
    return parseFloat(fixed).toString();
  };

  // Step-by-step formula string
  const formulaStepString = useMemo(() => {
    const val = parseFloat(inputValue);
    if (isNaN(val) || !conversionResult) return '';

    if (currentDimension.customFormula) {
      return currentDimension.customFormula(val, fromUnit, toUnit);
    }

    const fromObj = conversionResult.fromUnitObj;
    const toObj = conversionResult.toUnitObj;
    const baseVal = val * fromObj.ratio;

    return `${val} ${fromObj.symbol} × ${fromObj.ratio} (${currentDimension.baseUnitName}) = ${formatResultValue(
      baseVal
    )} ${currentDimension.baseUnitName} ÷ ${toObj.ratio} = ${formatResultValue(conversionResult.value)} ${toObj.symbol}`;
  }, [inputValue, fromUnit, toUnit, currentDimension, conversionResult, precision, useScientific]);

  // Add conversion to history
  useEffect(() => {
    const val = parseFloat(inputValue);
    if (!isNaN(val) && conversionResult && val !== 0) {
      const timeout = setTimeout(() => {
        setHistory((prev) => {
          const item = {
            id: Date.now(),
            category: categoryID,
            categoryName: currentDimension.name,
            fromVal: val,
            fromUnit: conversionResult.fromUnitObj.label,
            fromSymbol: conversionResult.fromUnitObj.symbol,
            toVal: conversionResult.value,
            toUnit: conversionResult.toUnitObj.label,
            toSymbol: conversionResult.toUnitObj.symbol,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          const next = [item, ...prev.filter((h) => h.category !== item.category || h.fromVal !== item.fromVal || h.toSymbol !== item.toSymbol).slice(0, 14)];
          try {
            localStorage.setItem('unit_converter_history_v2', JSON.stringify(next));
          } catch {}
          return next;
        });
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [inputValue, fromUnit, toUnit, categoryID, conversionResult, currentDimension]);

  // Favorites toggle
  const toggleFavorite = () => {
    if (!conversionResult) return;
    const pairId = `${categoryID}_${fromUnit}_${toUnit}`;
    const exists = favorites.some((f) => f.pairId === pairId);
    let updated: any[] = [];
    if (exists) {
      updated = favorites.filter((f) => f.pairId !== pairId);
    } else {
      updated = [
        ...favorites,
        {
          pairId,
          category: categoryID,
          categoryName: currentDimension.name,
          from: fromUnit,
          fromLabel: conversionResult.fromUnitObj.label,
          fromSymbol: conversionResult.fromUnitObj.symbol,
          to: toUnit,
          toLabel: conversionResult.toUnitObj.label,
          toSymbol: conversionResult.toUnitObj.symbol
        }
      ];
    }
    setFavorites(updated);
    try {
      localStorage.setItem('unit_converter_favorites_v2', JSON.stringify(updated));
    } catch {}
  };

  const isCurrentFavorite = useMemo(() => {
    const pairId = `${categoryID}_${fromUnit}_${toUnit}`;
    return favorites.some((f) => f.pairId === pairId);
  }, [favorites, categoryID, fromUnit, toUnit]);

  // Swap units
  const handleSwap = () => {
    const prevFrom = fromUnit;
    const prevTo = toUnit;
    setFromUnit(prevTo);
    setToUnit(prevFrom);
  };

  // Copy result to clipboard
  const handleCopy = () => {
    if (!conversionResult) return;
    const text = `${inputValue} ${conversionResult.fromUnitObj.symbol} = ${formatResultValue(conversionResult.value)} ${
      conversionResult.toUnitObj.symbol
    }`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Clear history
  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('unit_converter_history_v2');
    } catch {}
  };

  // Smart Natural Language Converter
  const handleSmartQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!smartInputQuery.trim()) return;

    const query = smartInputQuery.toLowerCase().trim();
    const match = query.match(/^([0-9.,]+)\s*([a-z0-9_°/·^µ-]+)\s*(?:to|in|into|➔|->)\s*([a-z0-9_°/·^µ-]+)$/i);

    if (match) {
      const num = parseFloat(match[1].replace(/,/g, ''));
      const fromStr = match[2].trim().toLowerCase();
      const toStr = match[3].trim().toLowerCase();

      for (const dim of dimensions) {
        const foundFrom = dim.units.find(
          (u) =>
            u.value.toLowerCase() === fromStr ||
            u.symbol.toLowerCase() === fromStr ||
            u.label.toLowerCase().includes(fromStr)
        );
        const foundTo = dim.units.find(
          (u) =>
            u.value.toLowerCase() === toStr ||
            u.symbol.toLowerCase() === toStr ||
            u.label.toLowerCase().includes(toStr)
        );

        if (foundFrom && foundTo) {
          setCategoryID(dim.id);
          setSelectedDomain(dim.domainId);
          setFromUnit(foundFrom.value);
          setToUnit(foundTo.value);
          setInputValue(num.toString());
          return;
        }
      }
    }

    setSearchQuery(smartInputQuery);
  };

  // Group units in current dimension
  const groupedUnits = useMemo(() => {
    const groups: { [key: string]: Unit[] } = {};
    currentDimension.units.forEach((u) => {
      const grp = u.categoryGroup || (u.isRegional ? 'Regional Indian' : 'Standard');
      if (!groups[grp]) groups[grp] = [];
      groups[grp].push(u);
    });
    return groups;
  }, [currentDimension]);

  // Comparative equivalent table for all units in current dimension
  const comparativeTableData = useMemo(() => {
    const val = parseFloat(inputValue);
    if (isNaN(val) || val === 0) return [];

    return currentDimension.units.map((targetUnit) => {
      let converted = 0;
      if (currentDimension.customConvert) {
        converted = currentDimension.customConvert(val, fromUnit, targetUnit.value);
      } else {
        const fromObj = currentDimension.units.find((u) => u.value === fromUnit);
        if (fromObj) {
          const baseVal = val * fromObj.ratio;
          converted = baseVal / targetUnit.ratio;
        }
      }

      return {
        unit: targetUnit,
        result: converted,
        formatted: formatResultValue(converted),
        isCurrentTarget: targetUnit.value === toUnit,
        isCurrentSource: targetUnit.value === fromUnit
      };
    });
  }, [inputValue, fromUnit, toUnit, currentDimension, precision, useScientific]);

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-3 space-y-3.5 animate-fade-in text-zinc-900 dark:text-zinc-100">
      {/* COMPACT TOP BAR: TITLE + SEARCH + DOMAINS */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 sm:p-4 shadow-xs space-y-3">
        {/* ROW 1: HEADER & NATURAL LANGUAGE SEARCH */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-1.5">
                <span>Unit Converter</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800">
                  Engineering Suite
                </span>
              </h1>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-none mt-0.5">
                Architecture, Civil, Electrical, Electronics, Metallurgy & Regional Land
              </p>
            </div>
          </div>

          {/* COMPACT SEARCH BAR */}
          <form onSubmit={handleSmartQuerySubmit} className="flex items-center gap-1.5 max-w-md w-full">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder='Search or AI convert (e.g. "100 psi to mpa", "5 bigha to acre")'
                value={smartInputQuery}
                onChange={(e) => {
                  setSmartInputQuery(e.target.value);
                  setSearchQuery(e.target.value);
                }}
                className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-medium placeholder-zinc-400 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
              />
              {smartInputQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSmartInputQuery('');
                    setSearchQuery('');
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1 shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Convert</span>
            </button>
          </form>
        </div>

        {/* ROW 2: ENGINEERING DOMAIN PILLS */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-t border-zinc-100 dark:border-zinc-800/60 pt-2.5">
          <button
            onClick={() => setSelectedDomain('all')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              selectedDomain === 'all'
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Domains ({dimensions.length})</span>
          </button>
          {DOMAINS.map((dom) => {
            const Icon = dom.icon;
            const isSelected = selectedDomain === dom.id;
            return (
              <button
                key={dom.id}
                onClick={() => {
                  setSelectedDomain(dom.id);
                  const firstDim = dimensions.find((d) => d.domainId === dom.id);
                  if (firstDim) setCategoryID(firstDim.id);
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? dom.activeColor
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{dom.name}</span>
              </button>
            );
          })}
        </div>

        {/* ROW 3: MEASUREMENT DIMENSION CHIPS */}
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
          {filteredDimensions.map((dim) => {
            const isSelected = categoryID === dim.id;
            return (
              <button
                key={dim.id}
                onClick={() => setCategoryID(dim.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-zinc-50 dark:bg-zinc-850 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-750 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <span>{dim.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CORE WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* LEFT / CENTER: MAIN INTERACTIVE CONVERTER (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          {/* CONVERTER CARD */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
            {/* Dimension Title & Details */}
            <div className="flex items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800/80 pb-2.5">
              <div>
                <h2 className="text-sm sm:text-base font-black text-zinc-900 dark:text-white flex items-center gap-2">
                  <span>{currentDimension.name}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                    {currentDimension.domainName}
                  </span>
                </h2>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {currentDimension.formulaDesc}
                </p>
              </div>
              {currentDimension.referenceStandard && (
                <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/80 px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
                  <BookOpen className="w-3 h-3 text-indigo-500 shrink-0" />
                  <span>{currentDimension.referenceStandard}</span>
                </div>
              )}
            </div>

            {/* INPUT & CONVERSION ROW */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              {/* VALUE INPUT */}
              <div className="md:col-span-4 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-zinc-600 dark:text-zinc-400">
                  <span>VALUE:</span>
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold">
                    <button type="button" onClick={() => setInputValue('1')} className="text-indigo-600 hover:underline">1</button>
                    <span>·</span>
                    <button type="button" onClick={() => setInputValue('100')} className="text-indigo-600 hover:underline">100</button>
                    <span>·</span>
                    <button type="button" onClick={() => setInputValue('0')} className="text-zinc-400 hover:text-zinc-600">0</button>
                  </div>
                </div>
                <input
                  type="number"
                  step="any"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="1.0"
                  className="w-full text-base font-black px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              {/* FROM SELECTOR */}
              <div className="md:col-span-3 space-y-1">
                <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block">FROM:</label>
                <select
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-bold text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-hidden cursor-pointer truncate"
                >
                  {Object.entries(groupedUnits).map(([groupName, uList]) => (
                    <optgroup key={groupName} label={groupName}>
                      {uList.map((u) => (
                        <option key={u.value} value={u.value}>
                          {u.label} ({u.symbol})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* SWAP BUTTON */}
              <div className="md:col-span-1 flex justify-center pb-0.5">
                <button
                  type="button"
                  onClick={handleSwap}
                  title="Swap Units"
                  className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 border border-zinc-200 dark:border-zinc-700 transition-transform active:scale-95 shadow-2xs"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* TO SELECTOR */}
              <div className="md:col-span-4 space-y-1">
                <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block">TO:</label>
                <select
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-bold text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-hidden cursor-pointer truncate"
                >
                  {Object.entries(groupedUnits).map(([groupName, uList]) => (
                    <optgroup key={groupName} label={groupName}>
                      {uList.map((u) => (
                        <option key={u.value} value={u.value}>
                          {u.label} ({u.symbol})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            {/* CALCULATED RESULT DISPLAY */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Conversion Result</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={toggleFavorite}
                    className={`p-1.5 rounded-lg border text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                      isCurrentFavorite
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:text-amber-500'
                    }`}
                    title="Bookmark Pair"
                  >
                    <Star className={`w-3 h-3 ${isCurrentFavorite ? 'fill-current' : ''}`} />
                    <span className="hidden sm:inline">{isCurrentFavorite ? 'Saved' : 'Save'}</span>
                  </button>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                    title="Copy Result"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* MAIN RESULT NUMBER */}
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-indigo-950 dark:text-white tracking-tight break-all">
                  {formatResultValue(conversionResult?.value)}
                </span>
                <span className="text-base sm:text-lg font-bold text-indigo-600 dark:text-indigo-400">
                  {conversionResult?.toUnitObj.symbol}
                </span>
              </div>

              <div className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                {inputValue || '0'} {conversionResult?.fromUnitObj.label} = {formatResultValue(conversionResult?.value)} {conversionResult?.toUnitObj.label}
              </div>

              {/* FORMULA PROOF / EXPLANATION */}
              {formulaStepString && (
                <div className="pt-2 border-t border-indigo-200/60 dark:border-indigo-900/60 text-[10px] font-mono text-zinc-600 dark:text-zinc-400 flex items-start gap-1.5">
                  <Info className="w-3 h-3 text-indigo-500 shrink-0 mt-0.5" />
                  <span className="break-all">{formulaStepString}</span>
                </div>
              )}
            </div>

            {/* PRECISION & SCIENTIFIC BAR */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 pt-1">
              <div className="flex items-center gap-1.5">
                <Settings className="w-3 h-3" />
                <span className="font-semibold">Decimals:</span>
                {[2, 4, 6, 8].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPrecision(p)}
                    className={`px-1.5 py-0.5 rounded-md font-bold text-[10px] ${
                      precision === p
                        ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                        : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setUseScientific(!useScientific)}
                className={`px-2 py-0.5 rounded-md font-bold text-[10px] border transition-colors ${
                  useScientific
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'
                }`}
              >
                Scientific (10^x): {useScientific ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* EQUIVALENT MATRIX GRID */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                <span>All Equivalent Units in {currentDimension.name} ({currentDimension.units.length})</span>
              </h3>
              <button
                onClick={() => {
                  const tsv = comparativeTableData
                    .map((row) => `${row.unit.label}\t${row.formatted}\t${row.unit.symbol}`)
                    .join('\n');
                  navigator.clipboard.writeText(`Unit\tConverted Value\tSymbol\n${tsv}`);
                  alert('Copied comparison table!');
                }}
                className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-[10px] font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1"
                title="Copy Table"
              >
                <Copy className="w-3 h-3" />
                <span>Copy Matrix</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
              {comparativeTableData.map((row, idx) => (
                <div
                  key={idx}
                  onClick={() => setToUnit(row.unit.value)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-colors ${
                    row.isCurrentTarget
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-600 ring-1 ring-indigo-500'
                      : row.isCurrentSource
                      ? 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-300 dark:border-zinc-600'
                      : 'bg-white dark:bg-zinc-850 border-zinc-200 dark:border-zinc-750 hover:border-zinc-400'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 truncate max-w-[100px]">
                      {row.unit.label}
                    </span>
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded-sm bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
                      {row.unit.symbol}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm font-black text-zinc-900 dark:text-white mt-0.5 truncate">
                    {row.formatted}
                  </div>
                  {row.unit.convention && (
                    <p className="text-[8px] text-amber-600 dark:text-amber-400 font-medium truncate mt-0.5">
                      {row.unit.convention}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: COMPACT SIDE-RAIL WITH TABS (PRESETS, SAVED, HISTORY, NORMS) (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          {/* TABBED RAIL CONTAINER */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3.5 shadow-xs space-y-3">
            {/* TABS */}
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('presets')}
                className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'presets'
                    ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                Presets
              </button>
              <button
                onClick={() => setActiveTab('matrix')}
                className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'matrix'
                    ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                History ({history.length})
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'saved'
                    ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                Saved ({favorites.length})
              </button>
            </div>

            {/* TAB CONTENT: PRESETS */}
            {activeTab === 'presets' && (
              <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                {QUICK_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const dim = dimensions.find((d) => d.id === preset.dimensionId);
                      if (dim) {
                        setSelectedDomain(dim.domainId);
                        setCategoryID(dim.id);
                        setFromUnit(preset.fromUnit);
                        setToUnit(preset.toUnit);
                        setInputValue(preset.value.toString());
                      }
                    }}
                    className="w-full text-left p-2 rounded-xl bg-zinc-50 dark:bg-zinc-850 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-zinc-200/80 dark:border-zinc-750 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {preset.label}
                        </span>
                      </div>
                      <span className="text-[9px] text-zinc-400 block pl-3">{preset.note}</span>
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-zinc-200/60 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
                      {preset.category}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* TAB CONTENT: HISTORY */}
            {activeTab === 'matrix' && (
              <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Recent Conversions</span>
                  {history.length > 0 && (
                    <button onClick={clearHistory} className="text-[10px] text-red-500 hover:underline flex items-center gap-0.5">
                      <Trash2 className="w-3 h-3" /> Clear
                    </button>
                  )}
                </div>
                {history.length > 0 ? (
                  history.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => {
                        const dim = dimensions.find((d) => d.id === h.category);
                        if (dim) {
                          setSelectedDomain(dim.domainId);
                          setCategoryID(h.category);
                          const matchFrom = dim.units.find((u) => u.symbol === h.fromSymbol || u.label === h.fromUnit);
                          const matchTo = dim.units.find((u) => u.symbol === h.toSymbol || u.label === h.toUnit);
                          if (matchFrom) setFromUnit(matchFrom.value);
                          if (matchTo) setToUnit(matchTo.value);
                        }
                        setInputValue(h.fromVal.toString());
                      }}
                      className="w-full text-left p-2 rounded-xl bg-zinc-50 dark:bg-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-100 dark:border-zinc-800 flex flex-col gap-0.5 font-mono text-[10px] transition-colors"
                    >
                      <div className="flex justify-between text-[9px] text-zinc-400 font-sans">
                        <span>{h.categoryName}</span>
                        <span>{h.timestamp}</span>
                      </div>
                      <div className="flex justify-between font-bold text-zinc-700 dark:text-zinc-200">
                        <span>{h.fromVal} {h.fromSymbol}</span>
                        <span>➔</span>
                        <span className="text-indigo-600 dark:text-indigo-400">{formatResultValue(h.toVal)} {h.toSymbol}</span>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-[10px] text-zinc-400 font-medium italic text-center py-6">
                    Recent conversions will appear here.
                  </p>
                )}
              </div>
            )}

            {/* TAB CONTENT: SAVED FAVORITES */}
            {activeTab === 'saved' && (
              <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                {favorites.length > 0 ? (
                  favorites.map((fav, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        const dim = dimensions.find((d) => d.id === fav.category);
                        if (dim) {
                          setSelectedDomain(dim.domainId);
                          setCategoryID(fav.category);
                          setFromUnit(fav.from);
                          setToUnit(fav.to);
                        }
                      }}
                      className="w-full text-left p-2 rounded-xl bg-zinc-50 dark:bg-zinc-850 hover:bg-indigo-50 dark:hover:bg-zinc-800 border border-zinc-100 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-colors flex items-center justify-between"
                    >
                      <div>
                        <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-bold block">{fav.categoryName}</span>
                        <span className="text-[11px] font-bold">{fav.fromSymbol} ➔ {fav.toSymbol}</span>
                      </div>
                      <span className="text-amber-500 text-xs">★</span>
                    </button>
                  ))
                ) : (
                  <p className="text-[10px] text-zinc-400 font-medium italic text-center py-6">
                    Click the star icon to pin conversion pairs.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* COMPACT NORMS SUMMARY */}
          <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-3.5 space-y-2">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
              <span>Engineering Reference Standards</span>
            </h4>
            <div className="text-[10px] text-zinc-600 dark:text-zinc-400 space-y-1.5 leading-relaxed">
              <p><strong>Civil:</strong> IS 456 concrete grades, IS 875 loads, CWC cusec/cumec discharge.</p>
              <p><strong>Architecture:</strong> NBC 2016 lux norms, ISO 5455 CAD scales & 1:12 ramp slopes.</p>
              <p><strong>Electrical & Telecom:</strong> IS 732 earthing, EIA AWG wire gauges & 3GPP dBm levels.</p>
              <p><strong>Metallurgy:</strong> ASTM E140 steel hardness polynomial equivalence & IS 513 CRCA gauges.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

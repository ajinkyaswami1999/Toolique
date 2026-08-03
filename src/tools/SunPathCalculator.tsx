import { useState } from 'react';
import { Copy, Check, Info, Sun, Navigation, MapPin } from 'lucide-react';

type CityPreset = 'delhi' | 'newyork' | 'london' | 'tokyo' | 'sydney';

interface CityConfig {
  label: string;
  lat: number;
  lng: number;
  timezone: number; // UTC offset
}

const CITY_PRESETS: Record<CityPreset, CityConfig> = {
  delhi: { label: 'New Delhi, India', lat: 28.6139, lng: 77.2090, timezone: 5.5 },
  newyork: { label: 'New York, USA', lat: 40.7128, lng: -74.0060, timezone: -4.0 },
  london: { label: 'London, UK', lat: 51.5074, lng: -0.1278, timezone: 1.0 },
  tokyo: { label: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503, timezone: 9.0 },
  sydney: { label: 'Sydney, Australia', lat: -33.8688, lng: 151.2093, timezone: 10.0 }
};

export default function SunPathCalculator() {
  const [city, setCity] = useState<CityPreset | 'custom'>('delhi');
  const [lat, setLat] = useState<number>(28.6139);
  const [lng, setLng] = useState<number>(77.2090);
  const [time, setTime] = useState<string>('12:00');
  const [date, setDate] = useState<string>('2026-06-21'); // Summer Solstice default
  const [copied, setCopied] = useState(false);

  const handleCityChange = (key: CityPreset | 'custom') => {
    setCity(key);
    if (key !== 'custom') {
      const preset = CITY_PRESETS[key];
      setLat(preset.lat);
      setLng(preset.lng);
    }
  };

  const calculateSolarPosition = () => {
    // Parse date to day of year (1-365)
    const parsedDate = new Date(date);
    const startOfYear = new Date(parsedDate.getFullYear(), 0, 0);
    const diff = parsedDate.getTime() - startOfYear.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    // 1. Solar Declination (delta) in radians
    // delta = 23.45 * sin(360/365 * (d - 80))
    const deltaDeg = 23.45 * Math.sin((360 / 365) * (dayOfYear - 80) * (Math.PI / 180));
    const deltaRad = deltaDeg * (Math.PI / 180);

    // 2. Solar Hour Angle (H)
    // Convert time to hours
    const [hours, minutes] = time.split(':').map(Number);
    const decimalTime = hours + minutes / 60;
    // Standard Hour Angle: H = (decimalTime - 12) * 15 degrees
    const hDeg = (decimalTime - 12) * 15;
    const hRad = hDeg * (Math.PI / 180);

    const latRad = lat * (Math.PI / 180);

    // 3. Solar Elevation (Altitude - beta)
    // sin(beta) = sin(Lat) * sin(delta) + cos(Lat) * cos(delta) * cos(H)
    const sinBeta = Math.sin(latRad) * Math.sin(deltaRad) + Math.cos(latRad) * Math.cos(deltaRad) * Math.cos(hRad);
    const betaRad = Math.asin(sinBeta);
    const betaDeg = betaRad * (180 / Math.PI);

    // 4. Solar Azimuth (phi)
    // cos(phi) = (sin(delta) * cos(Lat) - cos(delta) * sin(Lat) * cos(H)) / cos(beta)
    const cosPhi = (Math.sin(deltaRad) * Math.cos(latRad) - Math.cos(deltaRad) * Math.sin(latRad) * Math.cos(hRad)) / Math.cos(betaRad);
    // Clamp cosPhi between -1 and 1 to prevent NaN errors
    const clampedCosPhi = Math.max(-1, Math.min(1, cosPhi));
    let phiDeg = Math.acos(clampedCosPhi) * (180 / Math.PI);

    // Adjust azimuth depending on morning vs afternoon
    if (decimalTime > 12) {
      phiDeg = 360 - phiDeg;
    }

    // Shadow length factor: L = Height / tan(beta)
    // If sun is below horizon, shadow is infinite/none
    const elevation = Math.max(0.1, betaDeg);
    const shadowLengthMultiplier = 1 / Math.tan(elevation * (Math.PI / 180));

    return {
      elevation: Number(betaDeg.toFixed(1)),
      azimuth: Number(phiDeg.toFixed(1)),
      declination: Number(deltaDeg.toFixed(1)),
      shadowLengthMultiplier: Number(Math.min(10, shadowLengthMultiplier).toFixed(2)),
      isDaylight: betaDeg > 0
    };
  };

  const results = calculateSolarPosition();

  // Graphical Cartesian mapping for compass positioning
  // Compass radius is 80px
  const angleRad = (90 - results.azimuth) * (Math.PI / 180); // shift by 90 to align North upward
  const sunX = 50 + 40 * Math.cos(angleRad);
  const sunY = 50 - 40 * Math.sin(angleRad);

  // Shadow projected opposite to the sun's azimuth angle
  const shadowAngleRad = (results.azimuth + 90) * (Math.PI / 180); 
  const shadowLengthPixels = Math.min(45, results.shadowLengthMultiplier * 8);
  const shadowX = 50 + shadowLengthPixels * Math.cos(shadowAngleRad);
  const shadowY = 50 + shadowLengthPixels * Math.sin(shadowAngleRad);

  const copyReport = () => {
    const text = `Celestial Solar Position Report
----------------------------------------
Date: ${date} | Time: ${time} LST
Latitude: ${lat}° | Longitude: ${lng}°
City Preset: ${city.toUpperCase()}

Solar Elevation Angle: ${results.elevation}°
Solar Azimuth Angle: ${results.azimuth}° (Compass Heading)
Solar Declination Angle: ${results.declination}°
Calculated Shadow Multiplier: ${results.shadowLengthMultiplier}x height
Sun Status: ${results.isDaylight ? 'Above Horizon (Daylight)' : 'Below Horizon (Night)'}`;

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
            <MapPin className="w-5 h-5 text-indigo-500" />
            <span>Site Position & Coordinates</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
              Select City Preset
            </label>
            <select
              value={city}
              onChange={(e) => handleCityChange(e.target.value as any)}
              className="saas-input"
            >
              <option value="custom">Custom Location (Define Below)</option>
              {Object.keys(CITY_PRESETS).map((k) => (
                <option key={k} value={k}>
                  {CITY_PRESETS[k as CityPreset].label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                Latitude (Degrees)
              </label>
              <input
                type="number"
                value={lat}
                step={0.0001}
                disabled={city !== 'custom'}
                onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                className="saas-input disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                Longitude (Degrees)
              </label>
              <input
                type="number"
                value={lng}
                step={0.0001}
                disabled={city !== 'custom'}
                onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                className="saas-input disabled:opacity-60"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                Calendar Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="saas-input font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                Local Solar Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="saas-input font-bold"
              />
            </div>
          </div>
        </div>

        {/* Live CSS Interactive Layout Simulator */}
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-sm">Visual Stereographic Sun Path</h3>
          <p className="text-xs text-zinc-400">
            Heliocentric compass plot. The yellow circle represents the sun's azimuth angle. The black line represents the projected shadow direction.
          </p>

          <div className="relative w-full aspect-[16/9] bg-zinc-950 border-4 border-zinc-800 rounded-2xl flex items-center justify-center p-6 shadow-inner overflow-hidden">
            {/* Compass Dial */}
            <div className="relative w-48 h-48 border-2 border-slate-700/60 rounded-full flex items-center justify-center">
              {/* Compass Labels */}
              <span className="absolute top-1 text-[9px] font-black text-slate-500">N</span>
              <span className="absolute bottom-1 text-[9px] font-black text-slate-500">S</span>
              <span className="absolute right-2 text-[9px] font-black text-slate-500">E</span>
              <span className="absolute left-2 text-[9px] font-black text-slate-500">W</span>

              {/* Dotted path of sun from East to West */}
              <svg className="absolute inset-0 w-full h-full text-slate-700/30" viewBox="0 0 100 100">
                <path d="M 10 50 A 40 30 0 0 1 90 50" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
              </svg>

              {/* Site Center Point (Building) */}
              <div className="absolute w-3 h-3 bg-indigo-500 rounded-sm shadow border border-indigo-650 z-20" />

              {/* Shadow Vector line */}
              {results.isDaylight && (
                <svg className="absolute inset-0 w-full h-full text-slate-450 pointer-events-none z-10" viewBox="0 0 100 100">
                  <line
                    x1="50"
                    y1="50"
                    x2={shadowX}
                    y2={shadowY}
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              )}

              {/* Solar Orb (Sun icon) */}
              {results.isDaylight ? (
                <div
                  style={{
                    left: `${sunX}%`,
                    top: `${sunY}%`
                  }}
                  className="absolute w-6 h-6 -ml-3 -mt-3 bg-amber-400 border border-amber-500 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.6)] flex items-center justify-center text-amber-900 transition-all duration-300 z-30 animate-pulse"
                >
                  ☀️
                </div>
              ) : (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-650 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  Night Time
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results Column */}
      <div className="lg:col-span-5 space-y-6">
        <div className="saas-card p-6 flex flex-col justify-between h-full space-y-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Solar Vectors
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
                <span className="text-xs text-zinc-400 font-semibold flex items-center gap-1">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Solar Elevation Angle</span>
                </span>
                <div className="text-3xl font-black mt-1 font-mono text-zinc-950 dark:text-white">
                  {results.elevation}°
                </div>
              </div>

              <div>
                <span className="text-xs text-zinc-400 font-semibold flex items-center gap-1">
                  <Navigation className="w-4 h-4 text-sky-500" />
                  <span>Solar Azimuth Angle</span>
                </span>
                <div className="text-3xl font-black mt-1 font-mono text-zinc-950 dark:text-white">
                  {results.azimuth}°
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Solar Declination Angle</span>
                  <span className="font-bold font-mono">{results.declination}°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Est. Shadow Multiplier</span>
                  <span className="font-bold font-mono text-indigo-500">
                    {results.isDaylight ? `${results.shadowLengthMultiplier}x Height` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
                  <span className="text-zinc-400">Daylight Presence</span>
                  <span
                    className={`font-black uppercase ${
                      results.isDaylight ? 'text-emerald-500' : 'text-rose-500'
                    }`}
                  >
                    {results.isDaylight ? 'Daytime' : 'Night'}
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 text-[11px] text-zinc-400 leading-relaxed flex gap-2">
                <Info className="w-5 h-5 text-indigo-500 shrink-0" />
                <p>
                  Daylight path projections determine thermal solar heat gain coefficients (SHGC) and window shading overhang projections necessary to achieve passive solar efficiency.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
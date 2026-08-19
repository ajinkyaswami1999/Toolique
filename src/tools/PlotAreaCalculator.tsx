import { useState, useEffect } from 'react';
import { Clipboard, Check } from 'lucide-react';

export default function PlotAreaCalculator() {
  const [shape, setShape] = useState<'rectangle' | 'triangle' | 'quadrilateral'>('rectangle');
  const [unit, setUnit] = useState<'ft' | 'm'>('ft');

  // Rectangle Inputs
  const [length, setLength] = useState<number>(50);
  const [width, setWidth] = useState<number>(40);

  // Triangle Inputs (Heron's)
  const [sideA, setSideA] = useState<number>(30);
  const [sideB, setSideB] = useState<number>(40);
  const [sideC, setSideC] = useState<number>(50);

  // Quadrilateral Inputs (Four sides + Diagonal)
  const [quadA, setQuadA] = useState<number>(40);
  const [quadB, setQuadB] = useState<number>(30);
  const [quadC, setQuadC] = useState<number>(45);
  const [quadD, setQuadD] = useState<number>(35);
  const [diagonal, setDiagonal] = useState<number>(50);

  // Outputs
  const [areaSqFt, setAreaSqFt] = useState<number>(0);
  const [areaSqM, setAreaSqM] = useState<number>(0);
  const [areaAcres, setAreaAcres] = useState<number>(0);
  const [areaGuntha, setAreaGuntha] = useState<number>(0);
  const [areaHectares, setAreaHectares] = useState<number>(0);
  const [areaBigha, setAreaBigha] = useState<number>(0);
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Helper: Triangle Area (Heron's Formula)
  const calculateTriangleArea = (a: number, b: number, c: number) => {
    if (a + b <= c || a + c <= b || b + c <= a) return -1;
    const s = (a + b + c) / 2;
    return Math.sqrt(s * (s - a) * (s - b) * (s - c));
  };

  useEffect(() => {
    let finalArea = 0;
    setErrorMsg(null);

    if (shape === 'rectangle') {
      if (length <= 0 || width <= 0) {
        setAreaSqFt(0);
        return;
      }
      finalArea = length * width;
    } 
    
    else if (shape === 'triangle') {
      if (sideA <= 0 || sideB <= 0 || sideC <= 0) {
        setAreaSqFt(0);
        return;
      }
      const tArea = calculateTriangleArea(sideA, sideB, sideC);
      if (tArea === -1) {
        setErrorMsg('Invalid Triangle: Sum of any two sides must be greater than the third side.');
        setAreaSqFt(0);
        return;
      }
      finalArea = tArea;
    } 
    
    else if (shape === 'quadrilateral') {
      if (quadA <= 0 || quadB <= 0 || quadC <= 0 || quadD <= 0 || diagonal <= 0) {
        setAreaSqFt(0);
        return;
      }
      // A quadrilateral divided by a diagonal forms two triangles: ABC (sides a, b, diag) and ADC (sides c, d, diag)
      const t1 = calculateTriangleArea(quadA, quadB, diagonal);
      const t2 = calculateTriangleArea(quadC, quadD, diagonal);

      if (t1 === -1 || t2 === -1) {
        setErrorMsg('Invalid Quadrilateral: Diagonal does not partition into two valid triangles.');
        setAreaSqFt(0);
        return;
      }
      finalArea = t1 + t2;
    }

    // Convert values
    let sqft = 0;
    let sqm = 0;

    if (unit === 'ft') {
      sqft = finalArea;
      sqm = finalArea * 0.092903;
    } else {
      sqm = finalArea;
      sqft = finalArea / 0.092903;
    }

    // Indian Land Unit Conversions (Standardized)
    // 1 Acre = 43,560 sqft
    // 1 Guntha = 1,089 sqft
    // 1 Hectare = 107,639 sqft
    // 1 Bigha (Standard North India) = ~27,000 sqft (varies by state, standardized here to 27,000 for calculation display)
    setAreaSqFt(Number(sqft.toFixed(2)));
    setAreaSqM(Number(sqm.toFixed(2)));
    setAreaAcres(Number((sqft / 43560).toFixed(4)));
    setAreaGuntha(Number((sqft / 1089).toFixed(3)));
    setAreaHectares(Number((sqft / 107639).toFixed(4)));
    setAreaBigha(Number((sqft / 27000).toFixed(3)));

  }, [shape, unit, length, width, sideA, sideB, sideC, quadA, quadB, quadC, quadD, diagonal]);

  const handleCopy = () => {
    let text = `Plot Area Estimation Results (${shape.toUpperCase()})\n`;
    text += `Area: ${areaSqFt} Sq. Ft\n`;
    text += `Area: ${areaSqM} Sq. M\n`;
    text += `Acres: ${areaAcres} Acres\n`;
    text += `Guntha: ${areaGuntha} Gunthas\n`;
    text += `Hectares: ${areaHectares} Hectares\n`;
    text += `Bighas: ${areaBigha} Bighas\n`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Inputs */}
        <div className="lg:col-span-5 space-y-4">
          <div className="saas-card p-5 space-y-4 text-left">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-200/40 dark:border-zinc-800/40">
              <h3 className="text-sm font-black text-zinc-900 dark:text-white">
                Plot Geometry
              </h3>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setUnit('ft')}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition cursor-pointer ${
                    unit === 'ft'
                      ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-700 dark:text-indigo-400'
                      : 'border-zinc-200/60 dark:border-zinc-800 bg-white/40 text-zinc-400'
                  }`}
                >
                  Feet
                </button>
                <button
                  type="button"
                  onClick={() => setUnit('m')}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition cursor-pointer ${
                    unit === 'm'
                      ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-700 dark:text-indigo-400'
                      : 'border-zinc-200/60 dark:border-zinc-800 bg-white/40 text-zinc-400'
                  }`}
                >
                  Meters
                </button>
              </div>
            </div>

            {/* Shape selection tabs */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setShape('rectangle')}
                className={`py-2 px-1 rounded-xl text-[10px] font-black uppercase text-center border transition cursor-pointer ${
                  shape === 'rectangle'
                    ? 'bg-indigo-650 border-indigo-650 text-white'
                    : 'bg-zinc-100/50 dark:bg-zinc-950/20 border-zinc-200/50 dark:border-zinc-850/60 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-850/40'
                }`}
              >
                Rectangle
              </button>
              <button
                type="button"
                onClick={() => setShape('triangle')}
                className={`py-2 px-1 rounded-xl text-[10px] font-black uppercase text-center border transition cursor-pointer ${
                  shape === 'triangle'
                    ? 'bg-indigo-650 border-indigo-650 text-white'
                    : 'bg-zinc-100/50 dark:bg-zinc-950/20 border-zinc-200/50 dark:border-zinc-850/60 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-850/40'
                }`}
              >
                Triangle
              </button>
              <button
                type="button"
                onClick={() => setShape('quadrilateral')}
                className={`py-2 px-1 rounded-xl text-[10px] font-black uppercase text-center border transition cursor-pointer ${
                  shape === 'quadrilateral'
                    ? 'bg-indigo-650 border-indigo-650 text-white'
                    : 'bg-zinc-100/50 dark:bg-zinc-950/20 border-zinc-200/50 dark:border-zinc-850/60 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-850/40'
                }`}
              >
                4-Side Irregular
              </button>
            </div>

            <div className="space-y-4 pt-2">
              {shape === 'rectangle' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-zinc-400">Length ({unit})</label>
                    <input
                      type="number"
                      value={length}
                      onChange={(e) => setLength(Number(e.target.value))}
                      className="saas-input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-zinc-400">Width ({unit})</label>
                    <input
                      type="number"
                      value={width}
                      onChange={(e) => setWidth(Number(e.target.value))}
                      className="saas-input"
                    />
                  </div>
                </>
              )}

              {shape === 'triangle' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-zinc-400">Side A ({unit})</label>
                    <input
                      type="number"
                      value={sideA}
                      onChange={(e) => setSideA(Number(e.target.value))}
                      className="saas-input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-zinc-400">Side B ({unit})</label>
                    <input
                      type="number"
                      value={sideB}
                      onChange={(e) => setSideB(Number(e.target.value))}
                      className="saas-input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-zinc-400">Side C ({unit})</label>
                    <input
                      type="number"
                      value={sideC}
                      onChange={(e) => setSideC(Number(e.target.value))}
                      className="saas-input"
                    />
                  </div>
                </>
              )}

              {shape === 'quadrilateral' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-zinc-400">Side AB ({unit})</label>
                      <input
                        type="number"
                        value={quadA}
                        onChange={(e) => setQuadA(Number(e.target.value))}
                        className="saas-input"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-zinc-400">Side BC ({unit})</label>
                      <input
                        type="number"
                        value={quadB}
                        onChange={(e) => setQuadB(Number(e.target.value))}
                        className="saas-input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-zinc-400">Side CD ({unit})</label>
                      <input
                        type="number"
                        value={quadC}
                        onChange={(e) => setQuadC(Number(e.target.value))}
                        className="saas-input"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-zinc-400">Side DA ({unit})</label>
                      <input
                        type="number"
                        value={quadD}
                        onChange={(e) => setQuadD(Number(e.target.value))}
                        className="saas-input"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-zinc-400">Diagonal AC ({unit})</label>
                    <input
                      type="number"
                      value={diagonal}
                      onChange={(e) => setDiagonal(Number(e.target.value))}
                      className="saas-input"
                    />
                  </div>
                </>
              )}
            </div>
            
            {errorMsg && (
              <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-500 text-xs font-semibold leading-normal">
                ⚠️ {errorMsg}
              </div>
            )}
          </div>
        </div>

        {/* Right Output Area */}
        <div className="lg:col-span-7 space-y-4">
          <div className="saas-card p-6 space-y-5 text-left font-semibold">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-200/40 dark:border-zinc-800/40">
              <h3 className="text-sm font-black text-zinc-900 dark:text-white">
                Calculated Land Area
              </h3>
              <button
                type="button"
                onClick={handleCopy}
                className="saas-button-secondary py-1 px-3 text-[10px] inline-flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Clipboard className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Area'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-800/60 bg-zinc-50/20 dark:bg-zinc-950/20 text-center">
                <div className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Square Feet</div>
                <div className="text-2xl font-black text-indigo-650 dark:text-indigo-400 mt-1">
                  {areaSqFt.toLocaleString()} <span className="text-xs font-bold text-zinc-400">Sq.Ft</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-800/60 bg-zinc-50/20 dark:bg-zinc-950/20 text-center">
                <div className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Square Meters</div>
                <div className="text-2xl font-black text-indigo-650 dark:text-indigo-400 mt-1">
                  {areaSqM.toLocaleString()} <span className="text-xs font-bold text-zinc-400">m²</span>
                </div>
              </div>
            </div>

            {/* Conversions breakdown */}
            <div className="p-4 rounded-xl border border-zinc-200/20 bg-white/40 dark:bg-zinc-950/30 text-xs font-semibold space-y-3">
              <div className="text-[10px] font-black uppercase text-zinc-400 tracking-wider border-b border-zinc-200/10 pb-1.5">
                Indian & Global Land Conversions
              </div>
              <div className="grid grid-cols-2 gap-y-2 text-zinc-650 dark:text-zinc-350">
                <div className="flex justify-between pr-4 border-r border-zinc-200/10">
                  <span className="text-zinc-400">Acres:</span>
                  <span className="font-black text-zinc-900 dark:text-white">{areaAcres} ac</span>
                </div>
                <div className="flex justify-between pl-4">
                  <span className="text-zinc-400">Guntha (India):</span>
                  <span className="font-black text-zinc-900 dark:text-white">{areaGuntha} guntha</span>
                </div>
                <div className="flex justify-between pr-4 border-r border-zinc-200/10 border-t border-zinc-200/10 pt-2">
                  <span className="text-zinc-400">Hectares:</span>
                  <span className="font-black text-zinc-900 dark:text-white">{areaHectares} ha</span>
                </div>
                <div className="flex justify-between pl-4 border-t border-zinc-200/10 pt-2">
                  <span className="text-zinc-400">Bigha (Standard):</span>
                  <span className="font-black text-zinc-900 dark:text-white">{areaBigha} bigha</span>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-zinc-450 dark:text-zinc-500 font-semibold leading-relaxed border-t border-zinc-200/20 pt-3">
              ⚠️ <strong>Disclaimer:</strong> Regulations vary by location and authority. Verify applicable local building regulations before using these results for approvals or construction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

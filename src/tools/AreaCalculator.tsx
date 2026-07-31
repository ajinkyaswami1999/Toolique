import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function AreaCalculator() {
  const [shape, setShape] = useState<'rectangle' | 'circle' | 'triangle'>('rectangle');
  const [dim1, setDim1] = useState<number>(15);
  const [dim2, setDim2] = useState<number>(10);
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    let area = 0;
    let perimeter = 0;
    if (shape === 'rectangle') {
      area = dim1 * dim2;
      perimeter = 2 * (dim1 + dim2);
    } else if (shape === 'circle') {
      area = Math.PI * dim1 * dim1;
      perimeter = 2 * Math.PI * dim1;
    } else if (shape === 'triangle') {
      area = 0.5 * dim1 * dim2;
      perimeter = dim1 + dim2 + Math.sqrt(dim1*dim1 + dim2*dim2);
    }
    return { area: Math.round(area * 100) / 100, perimeter: Math.round(perimeter * 100) / 100 };
  };

  const results = calculate();

  const copyReport = () => {
    const text = `Area Calculation Report\nShape: ${shape}\nDimension 1: ${dim1}\nDimension 2: ${dim2}\nArea: ${results.area} sq units\nPerimeter: ${results.perimeter} units`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      <div className="md:col-span-7 p-6 saas-card space-y-4">
        <h3 className="font-bold text-sm">Shape & Dimensions</h3>
        <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
          {(['rectangle', 'circle', 'triangle'] as const).map(s => (
            <button key={s} onClick={() => setShape(s)} className={`flex-1 py-1.5 rounded-md text-xs font-bold capitalize ${shape === s ? 'bg-white dark:bg-zinc-700 text-indigo-650 dark:text-white shadow-sm' : 'text-zinc-400'}`}>{s}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">{shape === 'circle' ? 'Radius' : 'Width/Base'}</label>
            <input type="number" value={dim1} onChange={e => setDim1(parseFloat(e.target.value) || 0)} className="saas-input" />
          </div>
          {shape !== 'circle' && (
            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">{shape === 'rectangle' ? 'Length' : 'Height'}</label>
              <input type="number" value={dim2} onChange={e => setDim2(parseFloat(e.target.value) || 0)} className="saas-input" />
            </div>
          )}
        </div>
      </div>
      <div className="md:col-span-5 p-6 saas-card flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Results</span>
            <button onClick={copyReport} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold">
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <span className="text-xs text-zinc-400">Total Calculated Area</span>
              <div className="text-2xl font-black mt-1 font-mono text-zinc-950 dark:text-white">{results.area.toLocaleString()} sq units</div>
            </div>
            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400 font-medium font-semibold">Perimeter / Boundary</span>
                <span className="font-bold font-mono">{results.perimeter.toLocaleString()} units</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
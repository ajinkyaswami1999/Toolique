import { useState, useEffect } from 'react';
import { Settings, Copy, Check, Info } from 'lucide-react';

export default function STLBoundingBoxCalculator() {
  // Input States
  const [stlFile, setStlFile] = useState<File | null>(null);

  // Output States
  const [results, setResults] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<boolean>(false);
  const [stlDetails, setStlDetails] = useState<{ volume: number; x: number; y: number; z: number } | null>(null);

  // Math Computation
  useEffect(() => {
    if (!stlFile) {
      setResults({
        'Status': 'Please select a binary STL file to parse.'
      });
      return;
    }
    if (stlDetails) {
      setResults({
        'Bounding Box Width X': stlDetails.x.toFixed(1) + ' mm',
        'Bounding Box Depth Y': stlDetails.y.toFixed(1) + ' mm',
        'Bounding Box Height Z': stlDetails.z.toFixed(1) + ' mm'
      });
    }
  }, [stlFile, stlDetails]);

  // STL File Parsing
  const handleStlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStlFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const buffer = event.target?.result as ArrayBuffer;
      if (!buffer) return;
      
      try {
        const dv = new DataView(buffer);
        const numTriangles = dv.getUint32(80, true);
        let volume = 0;
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        let minZ = Infinity, maxZ = -Infinity;

        let offset = 84;
        for (let i = 0; i < numTriangles; i++) {
          if (offset + 50 > dv.byteLength) break;
          const x1 = dv.getFloat32(offset + 12, true);
          const y1 = dv.getFloat32(offset + 16, true);
          const z1 = dv.getFloat32(offset + 20, true);
          const x2 = dv.getFloat32(offset + 24, true);
          const y2 = dv.getFloat32(offset + 28, true);
          const z2 = dv.getFloat32(offset + 32, true);
          const x3 = dv.getFloat32(offset + 36, true);
          const y3 = dv.getFloat32(offset + 40, true);
          const z3 = dv.getFloat32(offset + 44, true);

          minX = Math.min(minX, x1, x2, x3);
          maxX = Math.max(maxX, x1, x2, x3);
          minY = Math.min(minY, y1, y2, y3);
          maxY = Math.max(maxY, y1, y2, y3);
          minZ = Math.min(minZ, z1, z2, z3);
          maxZ = Math.max(maxZ, z1, z2, z3);

          const vol = (x3 * y2 * z1 - x2 * y3 * z1 - x3 * y1 * z2 + x1 * y3 * z2 + x2 * y1 * z3 - x1 * y2 * z3) / 6.0;
          volume += vol;
          offset += 50;
        }

        const volCm3 = Math.abs(volume) / 1000.0;
        const widthX = maxX - minX;
        const depthY = maxY - minY;
        const heightZ = maxZ - minZ;

        setStlDetails({
          volume: volCm3,
          x: isFinite(widthX) ? widthX : 0,
          y: isFinite(depthY) ? depthY : 0,
          z: isFinite(heightZ) ? heightZ : 0
        });
      } catch (err) {
        setResults({ 'Error': 'Failed to parse binary STL file.' });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleCopy = () => {
    const text = Object.entries(results).map(([k, v]) => `${k}: ${v}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Inputs */}
        <div className="md:col-span-6 p-6 saas-card space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
            <Settings className="w-4 h-4 text-indigo-650 dark:text-indigo-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Settings</h3>
          </div>

          {/* Form fields */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-550 dark:text-zinc-400">Select STL Model File</label>
              <input
                type="file"
                accept=".stl"
                onChange={handleStlChange}
                className="w-full text-xs text-zinc-500 dark:text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-500/10 file:text-indigo-650 file:hover:bg-indigo-500/20 file:cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Outputs */}
        <div className="md:col-span-6 p-6 saas-card flex flex-col space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Calculated Results</h3>
            <button
              onClick={handleCopy}
              className="text-xs font-bold text-indigo-650 dark:text-indigo-400 hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="flex-grow space-y-4">
            {Object.entries(results).map(([key, val]) => (
              <div key={key} className="flex justify-between items-center py-2.5 border-b border-zinc-100 dark:border-zinc-800/50">
                <span className="text-xs font-bold text-zinc-550 dark:text-zinc-400">{key}</span>
                <span className="text-sm font-extrabold text-zinc-900 dark:text-white">{val}</span>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200/40 dark:border-zinc-800/40 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <span className="text-[10px] text-zinc-450 dark:text-zinc-500 leading-relaxed font-semibold">
              All computations are processed strictly in your local browser sandbox. No file uploads or numbers leave your machine.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Copy, Check, Info, Layers, Eye, EyeOff, FileSpreadsheet } from 'lucide-react';

interface LayerStats {
  name: string;
  total: number;
  lines: number;
  circles: number;
  texts: number;
  color: string;
}

const DEFAULT_LAYER_STATS: LayerStats[] = [
  { name: 'WALLS', total: 240, lines: 180, circles: 10, texts: 50, color: '#38bdf8' },
  { name: 'DOORS', total: 45, lines: 30, circles: 15, texts: 0, color: '#f43f5e' },
  { name: 'WINDOWS', total: 60, lines: 60, circles: 0, texts: 0, color: '#10b981' },
  { name: 'COLUMNS', total: 32, lines: 0, circles: 32, texts: 0, color: '#eab308' },
  { name: 'ANNOTATIONS', total: 95, lines: 15, circles: 0, texts: 80, color: '#a855f7' }
];

export default function CADLayerCounter() {
  const [layers, setLayers] = useState<LayerStats[]>(DEFAULT_LAYER_STATS);
  const [selectedLayer, setSelectedLayer] = useState<string>('WALLS');
  const [hiddenLayers, setHiddenLayers] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  // File parsing logic
  const handleFileUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        parseDxfLayers(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const parseDxfLayers = (text: string) => {
    const lines = text.split(/\r?\n/);
    const layerMap: Record<string, { lines: number; circles: number; texts: number; total: number }> = {};

    let currentEntity: string | null = null;
    let currentLayer = '0';
    let code = '';

    for (let i = 0; i < lines.length; i++) {
      const val = lines[i].trim();
      if (i % 2 === 0) {
        code = val;
      } else {
        if (code === '0') {
          currentEntity = val;
        } else if (code === '8' && currentEntity) {
          currentLayer = val.toUpperCase();
          if (!layerMap[currentLayer]) {
            layerMap[currentLayer] = { lines: 0, circles: 0, texts: 0, total: 0 };
          }
          layerMap[currentLayer].total++;

          if (currentEntity === 'LINE') layerMap[currentLayer].lines++;
          else if (currentEntity === 'CIRCLE') layerMap[currentLayer].circles++;
          else if (currentEntity === 'TEXT') layerMap[currentLayer].texts++;
        }
      }
    }

    const colorPalette = ['#38bdf8', '#f43f5e', '#10b981', '#eab308', '#a855f7', '#ec4899', '#6366f1'];
    const parsedStats: LayerStats[] = Object.entries(layerMap).map(([name, stats], idx) => ({
      name,
      total: stats.total,
      lines: stats.lines,
      circles: stats.circles,
      texts: stats.texts,
      color: colorPalette[idx % colorPalette.length]
    }));

    if (parsedStats.length > 0) {
      setLayers(parsedStats);
      setSelectedLayer(parsedStats[0].name);
    } else {
      alert('No layered entities detected. Ensure this is an ASCII DXF file.');
    }
  };

  const toggleHideLayer = (name: string) => {
    setHiddenLayers((prev) => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const activeSelected = layers.find((l) => l.name === selectedLayer) || layers[0];

  const copyReport = () => {
    const text = `CAD Drawing Layer Count Audit
----------------------------------------
Unique Layers Detected: ${layers.length} Layers
Total Graphic Entities: ${layers.reduce((acc, curr) => acc + curr.total, 0)} items

Layer Breakdown list:
${layers
  .map(
    (l) =>
      `- ${l.name}: ${l.total} entities (${l.lines} lines, ${l.circles} circles, ${l.texts} text notes)`
  )
  .join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* 3D Visualizer & File Upload Column */}
      <div className="lg:col-span-8 space-y-6">
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-500" />
              <span>3D Isometric CAD Layer Stack</span>
            </span>

            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-[10px] font-bold cursor-pointer transition">
              <span>Upload DXF / DWG</span>
              <input
                type="file"
                accept=".dxf,.dwg"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </h3>

          <p className="text-xs text-zinc-400">
            Hover over or click a sheet in the stacked layers below to pull it out of the isometric view and inspect its individual drafting counts.
          </p>

          {/* 3D Isometric container */}
          <div className="relative w-full aspect-[16/10] bg-zinc-950 border-4 border-zinc-800 rounded-2xl flex items-center justify-center p-8 shadow-inner overflow-hidden">
            <div className="relative w-72 h-72 flex flex-col justify-center items-center select-none">
              {/* Stack Sheets */}
              {layers.map((layer, idx) => {
                const isSelected = selectedLayer === layer.name;
                const isHidden = !!hiddenLayers[layer.name];
                
                // Stack layout translation values
                const offsetZ = idx * 24; // standard gap in stack
                const hoverTransform = isSelected
                  ? `rotateX(60deg) rotateZ(-30deg) translateZ(${offsetZ + 40}px) translateY(-20px)`
                  : `rotateX(60deg) rotateZ(-30deg) translateZ(${offsetZ}px)`;

                return (
                  <div
                    key={layer.name}
                    style={{
                      transform: hoverTransform,
                      borderColor: layer.color,
                      opacity: isHidden ? 0.2 : 1
                    }}
                    onClick={() => setSelectedLayer(layer.name)}
                    className={`absolute w-48 h-48 border-2 rounded-2xl bg-slate-900/90 shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between p-4 ${
                      isSelected ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-zinc-950' : ''
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span
                        style={{ color: layer.color }}
                        className="text-[9px] font-black tracking-widest uppercase"
                      >
                        {layer.name}
                      </span>
                      <span className="text-[9px] font-black text-slate-500 font-mono">
                        #{idx + 1}
                      </span>
                    </div>

                    {/* Vector outline mock inside each layer sheet */}
                    <div className="flex-1 border border-slate-800/40 rounded-lg m-2 flex items-center justify-center relative">
                      <div
                        style={{ borderColor: layer.color }}
                        className="w-12 h-12 border border-dashed rounded-full opacity-40 animate-pulse"
                      />
                      {isSelected && (
                        <span className="absolute bottom-2 text-[7px] font-black text-slate-500 uppercase tracking-widest">
                          Active Layer
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-end">
                      <span className="text-[8px] font-bold text-slate-450 uppercase">
                        TOTAL: {layer.total}
                      </span>
                      <span className="text-[8px] font-mono text-slate-500">
                        L:{layer.lines} C:{layer.circles}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Layer breakdown Analytics list */}
      <div className="lg:col-span-4 space-y-6">
        <div className="saas-card p-6 flex flex-col justify-between h-full space-y-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-500" />
                <span>Layer Schedule</span>
              </span>
              <button
                onClick={copyReport}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="space-y-4">
              {/* Layers List and switches */}
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {layers.map((layer) => {
                  const isSelected = selectedLayer === layer.name;
                  const isHidden = !!hiddenLayers[layer.name];
                  
                  return (
                    <div
                      key={layer.name}
                      onClick={() => setSelectedLayer(layer.name)}
                      className={`flex justify-between items-center p-2 rounded-lg border transition cursor-pointer text-xs ${
                        isSelected
                          ? 'bg-indigo-500/10 border-indigo-500/30'
                          : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-100 dark:border-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          style={{ backgroundColor: layer.color }}
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                        />
                        <span className="font-bold text-zinc-700 dark:text-zinc-350">{layer.name}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-bold font-mono">{layer.total} items</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleHideLayer(layer.name);
                          }}
                          className="text-zinc-450 hover:text-zinc-650"
                        >
                          {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Layer stats */}
              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 text-xs">
                <span className="text-[10px] text-indigo-650 dark:text-indigo-400 font-black uppercase tracking-wider block">
                  Selected Layer details ({activeSelected.name})
                </span>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Total Entities</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">
                    {activeSelected.total}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Line elements (LINE)</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">
                    {activeSelected.lines}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Circle elements (CIRCLE)</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">
                    {activeSelected.circles}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Text annotations (TEXT)</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">
                    {activeSelected.texts}
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 text-[11px] text-zinc-400 leading-relaxed flex gap-2">
                <Info className="w-5 h-5 text-indigo-500 shrink-0" />
                <p>
                  CAD layer mapping categorizes architectural geometries. Hiding layers disables their visibility status overlays, filtering output counts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
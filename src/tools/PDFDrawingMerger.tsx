import { useState } from 'react';
import { Copy, Check, Info, FileText, ArrowUp, ArrowDown, Trash2, Download, Plus, HardDrive, Cpu, ShieldCheck } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

interface PDFSheet {
  id: string;
  name: string;
  size: string;
  pages: number;
  file?: File;
}

const MOCK_SHEETS: PDFSheet[] = [
  { id: 'sheet-1', name: 'G-101_Ground_Floor_Plan.pdf', size: '2.4 MB', pages: 1 },
  { id: 'sheet-2', name: 'A-201_Building_Elevations.pdf', size: '3.8 MB', pages: 2 },
  { id: 'sheet-3', name: 'E-401_Electrical_Lighting_Layout.pdf', size: '1.9 MB', pages: 1 }
];

export default function PDFDrawingMerger() {
  const [sheets, setSheets] = useState<PDFSheet[]>(MOCK_SHEETS);
  const [isMerging, setIsMerging] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newSheets: PDFSheet[] = Array.from(files).map((file) => ({
        id: Math.random().toString(),
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        pages: 1,
        file
      }));
      setSheets((prev) => [...prev, ...newSheets]);
    }
  };

  const moveSheet = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sheets.length - 1) return;

    const newSheets = [...sheets];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    const temp = newSheets[index];
    newSheets[index] = newSheets[targetIndex];
    newSheets[targetIndex] = temp;

    setSheets(newSheets);
  };

  const removeSheet = (id: string) => {
    setSheets((prev) => prev.filter((s) => s.id !== id));
  };

  const handleMergeAndDownload = async () => {
    if (sheets.length === 0) return;
    setIsMerging(true);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const sheet of sheets) {
        if (sheet.file) {
          const fileBytes = await sheet.file.arrayBuffer();
          const srcDoc = await PDFDocument.load(fileBytes);
          const copiedPages = await mergedPdf.copyPages(srcDoc, srcDoc.getPageIndices());
          copiedPages.forEach((page) => mergedPdf.addPage(page));
        } else {
          const srcDoc = await PDFDocument.create();
          const page = srcDoc.addPage([842, 595]); // Standard A3 Landscape
          
          page.drawText('TOOLIQUE CAD PDF DRAWING COMPILER', { x: 50, y: 500, size: 20 });
          page.drawText(`Sheet Component: ${sheet.name}`, { x: 50, y: 440, size: 14 });
          page.drawText(`Layout File Size: ${sheet.size}`, { x: 50, y: 410, size: 12 });
          
          const copiedPages = await mergedPdf.copyPages(srcDoc, srcDoc.getPageIndices());
          copiedPages.forEach((p) => mergedPdf.addPage(p));
        }
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Compiled_Blueprint_Package.pdf';
      link.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Error compiling PDF Drawing package: ${err.message}`);
    } finally {
      setIsMerging(false);
    }
  };

  const copyReport = () => {
    const text = `Compiled PDF Blueprint Package Schedule
----------------------------------------
Total Sheets: ${sheets.length} pages
Compile Order:
${sheets.map((s, idx) => ` - Page ${idx + 1}: ${s.name} (${s.size})`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* File & Viewport Config Column */}
      <div className="lg:col-span-8 space-y-6">
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500 animate-pulse" />
              <span>PDF Sheet Compilation Queue</span>
            </span>

            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-750 text-white text-[10px] font-bold cursor-pointer transition shadow-md">
              <Plus className="w-3.5 h-3.5" />
              <span>Add Drawings</span>
              <input
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </h3>

          <p className="text-xs text-zinc-400">
            Reorder the blueprint pages in the queue below. Page order in the list matches the final page order of the compiled PDF package.
          </p>

          {/* Blueprint sheet deck visualizer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 border border-zinc-150 dark:border-zinc-800/80 rounded-2xl p-4 bg-zinc-50 dark:bg-zinc-900/30">
            {sheets.map((sheet, idx) => (
              <div
                key={sheet.id}
                className="saas-card p-4 flex flex-col justify-between border-slate-700/60 bg-slate-900/80 backdrop-blur-md hover:border-indigo-500/50 hover:shadow-lg transition-all duration-300 relative group transform hover:-translate-y-1"
              >
                {/* Index badge */}
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 font-mono text-[9px] font-black z-10">
                  SHEET {idx + 1}
                </div>

                {/* Professional engineering blueprint sheet layout container */}
                <div className="w-full aspect-[4/3] border border-slate-800/80 rounded-lg bg-zinc-950 flex flex-col justify-between p-3 mb-4 relative overflow-hidden select-none">
                  {/* Outer grid coordinate border lines */}
                  <div className="absolute inset-1 border border-indigo-500/10 flex flex-col justify-between p-1 pointer-events-none">
                    {/* Corner coordinates */}
                    <div className="flex justify-between text-[4.5px] text-indigo-500/40 font-mono"><span>A-1</span><span>A-2</span></div>
                    <div className="flex justify-between text-[4.5px] text-indigo-500/40 font-mono"><span>B-1</span><span>B-2</span></div>
                  </div>

                  {/* CAD floor plan wireframe schematic */}
                  <div className="flex-1 flex items-center justify-center p-3 opacity-25 group-hover:opacity-40 transition-opacity duration-300">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <rect x="15" y="15" width="70" height="70" fill="none" stroke="#6366f1" strokeWidth="1.5" />
                      <line x1="50" y1="15" x2="50" y2="85" stroke="#6366f1" strokeWidth="0.8" strokeDasharray="2 2" />
                      <line x1="15" y1="50" x2="85" y2="50" stroke="#6366f1" strokeWidth="0.8" strokeDasharray="2 2" />
                      <circle cx="50" cy="50" r="10" fill="none" stroke="#6366f1" strokeWidth="1" />
                    </svg>
                  </div>

                  {/* Standard CAD Title Block in bottom-right */}
                  <div className="self-end border border-indigo-500/30 bg-slate-900/60 p-1 rounded text-[5px] font-mono text-indigo-400 max-w-[70%] select-none leading-none scale-90 origin-bottom-right">
                    <div className="border-b border-indigo-500/20 pb-0.5 font-bold truncate">DWG: {sheet.name}</div>
                    <div className="pt-0.5 flex justify-between gap-2">
                      <span>SCALE: 1:100</span>
                      <span>PAGE: {sheet.pages}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-[10px] text-zinc-400 font-bold font-mono">{sheet.size}</span>
                  
                  {/* Reordering controllers */}
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => moveSheet(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-30 text-zinc-450"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveSheet(idx, 'down')}
                      disabled={idx === sheets.length - 1}
                      className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-30 text-zinc-450"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeSheet(sheet.id)}
                      className="p-1 rounded hover:bg-rose-500/10 text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {sheets.length === 0 && (
              <div className="col-span-full py-16 text-center text-zinc-405 text-xs italic">
                Upload your blueprint files to start compiled document grouping.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compiler Action Panel */}
      <div className="lg:col-span-4 space-y-6">
        <div className="saas-card p-6 flex flex-col justify-between h-full space-y-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                <span>Compiler details</span>
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
                <span className="text-xs text-zinc-455">Compiled Package Size</span>
                <div className="text-3xl font-black mt-1 font-mono text-zinc-950 dark:text-white">
                  {sheets.length} <span className="text-sm font-semibold">Sheets</span>
                </div>

                <div className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded mt-2 border text-emerald-500 bg-emerald-500/10 border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Compiler Core: Online (Vector mode)</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleMergeAndDownload}
                disabled={sheets.length === 0 || isMerging}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isMerging ? 'Compiling PDF Package...' : 'Compile & Download Package'}</span>
              </button>

              {/* PDF Details summary */}
              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 text-xs">
                <span className="text-[10px] text-zinc-555 font-black uppercase tracking-wider block">Document Checklist</span>
                <div className="flex items-center gap-2.5 p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-100 dark:border-zinc-800/80">
                  <HardDrive className="w-4 h-4 text-zinc-450" />
                  <div>
                    <div className="font-bold text-[10px] text-zinc-700 dark:text-zinc-300">Total Drawings in Queue</div>
                    <div className="text-[9px] text-zinc-450 mt-0.5">{sheets.length} Files</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-100 dark:border-zinc-800/80">
                  <Cpu className="w-4 h-4 text-zinc-450" />
                  <div>
                    <div className="font-bold text-[10px] text-zinc-700 dark:text-zinc-300">Format Integrity</div>
                    <div className="text-[9px] text-zinc-450 mt-0.5">Vector (PDF-lib preservation)</div>
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 text-[11px] text-zinc-400 leading-relaxed flex gap-2">
                <Info className="w-5 h-5 text-indigo-500 shrink-0" />
                <p>
                  This PDF Compiler processes document structures in client-side memory. All text layers and vector line weights are fully preserved in the compiled output.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
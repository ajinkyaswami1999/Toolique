import { useState } from 'react';
import { CopyButton } from '../components/common/CopyButton';
import { ShareWhatsApp } from '../components/common/ShareWhatsApp';
import { FileDropzone } from '../components/common/FileDropzone';
import { downloadPdfReport } from '../utils/pdf/reportGenerator';
import { Upload, FileText, Monitor, Info, Database, Download } from 'lucide-react';

interface VersionMeta {
  name: string;
  year: string;
  released: string;
  dwgFormat: string;
  compat: {
    autocad: string;
    revit: string;
    sketchup: string;
    librecad: string;
  };
  desc: string;
}

const versionDatabase: Record<string, VersionMeta> = {
  AC1032: {
    name: 'AutoCAD 2018 - 2025',
    year: '2018+',
    released: 'March 2017',
    dwgFormat: 'DWG 2018 format',
    compat: {
      autocad: 'v2018 or newer',
      revit: 'v2018 or newer',
      sketchup: 'v2018 or newer',
      librecad: 'Not supported (needs conversion)'
    },
    desc: 'Features performance optimizations, 64-bit object saves, security validation, and increased file compression efficiencies.'
  },
  AC1027: {
    name: 'AutoCAD 2013 - 2017',
    year: '2013-2017',
    released: 'March 2012',
    dwgFormat: 'DWG 2013 format',
    compat: {
      autocad: 'v2013 or newer',
      revit: 'v2013 or newer',
      sketchup: 'v2013 or newer',
      librecad: 'Partial support via DXF'
    },
    desc: 'Introduced support for large object storage, cloud workspace synchronization, and drawing format modifications.'
  },
  AC1024: {
    name: 'AutoCAD 2010 - 2012',
    year: '2010-2012',
    released: 'March 2009',
    dwgFormat: 'DWG 2010 format',
    compat: {
      autocad: 'v2010 or newer',
      revit: 'v2010 or newer',
      sketchup: 'v2013 or newer',
      librecad: 'Supported via DXF'
    },
    desc: 'Supported mesh modeling, parametric constraints, and initial PDF printing controls.'
  },
  AC1021: {
    name: 'AutoCAD 2007 - 2009',
    year: '2007-2009',
    released: 'March 2006',
    dwgFormat: 'DWG 2007 format',
    compat: {
      autocad: 'v2007 or newer',
      revit: 'v2008 or newer',
      sketchup: 'All versions',
      librecad: 'Supported'
    },
    desc: 'Major update adding full 3D solid rendering, walkthroughs, lighting effects, and PDF publishing.'
  },
  AC1018: {
    name: 'AutoCAD 2004 - 2006',
    year: '2004-2006',
    released: 'March 2003',
    dwgFormat: 'DWG 2004 format',
    compat: {
      autocad: 'v2004 or newer',
      revit: 'All versions',
      sketchup: 'All versions',
      librecad: 'Supported'
    },
    desc: 'Optimized file compression speeds and introduced tool palettes, passwords, and digital signatures.'
  },
  AC1015: {
    name: 'AutoCAD 2000 - 2002',
    year: '2000-2002',
    released: 'March 1999',
    dwgFormat: 'DWG 2000 format',
    compat: {
      autocad: 'v2000 or newer',
      revit: 'All versions',
      sketchup: 'All versions',
      librecad: 'Fully Supported'
    },
    desc: 'Added multiple document interfaces (MDI), layouts/paper spaces, and active design centers.'
  },
  AC1014: {
    name: 'AutoCAD Release 14',
    year: '1997',
    released: 'May 1997',
    dwgFormat: 'R14 format',
    compat: {
      autocad: 'All versions',
      revit: 'All versions',
      sketchup: 'All versions',
      librecad: 'Fully Supported'
    },
    desc: 'Legacy release focusing on performance optimizations and the introduction of ActiveX automation.'
  }
};

export default function DWGVersionChecker() {
  const [headerCode, setHeaderCode] = useState('AC1032');
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [hexDump, setHexDump] = useState<string[]>(['41', '43', '31', '30', '33', '32', '00', '00', '00', '00', '00', '00', '00', '00', '00', '00']);
  const [asciiDump, setAsciiDump] = useState<string[]>(['A', 'C', '1', '0', '3', '2', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.']);

  const cleanHeader = headerCode.toUpperCase().trim();
  const meta = versionDatabase[cleanHeader];

  const handleFileUpload = (file: File) => {
    setFileName(file.name);
    setFileSize((file.size / 1024).toFixed(1) + ' KB');

    const reader = new FileReader();
    reader.onload = (event) => {
      const buffer = event.target?.result as ArrayBuffer;
      if (buffer) {
        const view = new DataView(buffer);
        const hex: string[] = [];
        const ascii: string[] = [];
        let headerStr = '';
        
        for (let i = 0; i < Math.min(16, buffer.byteLength); i++) {
          const byte = view.getUint8(i);
          hex.push(byte.toString(16).toUpperCase().padStart(2, '0'));
          ascii.push(byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '.');
          if (i < 6) {
            headerStr += String.fromCharCode(byte);
          }
        }
        
        // Fill remaining spaces if file is smaller than 16 bytes
        while (hex.length < 16) {
          hex.push('00');
          ascii.push('.');
        }

        setHexDump(hex);
        setAsciiDump(ascii);
        setHeaderCode(headerStr);
      }
    };
    reader.readAsArrayBuffer(file.slice(0, 16));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHeaderCode(val);
    
    // Dynamically update hex representation for manual input
    const hex = [];
    const ascii = [];
    for (let i = 0; i < 16; i++) {
      if (i < val.length) {
        const charCode = val.charCodeAt(i);
        hex.push(charCode.toString(16).toUpperCase().padStart(2, '0'));
        ascii.push(val[i]);
      } else {
        hex.push('00');
        ascii.push('.');
      }
    }
    setHexDump(hex);
    setAsciiDump(ascii);
  };

  const getDwgReport = () => {
    return `DWG File Version Audit\nFile: ${fileName || 'Manual Input'}\nHeader Signature: ${headerCode}\nAutoCAD Version: ${meta ? meta.name : 'Unknown'}\nRelease Date: ${meta ? meta.released : 'N/A'}`;
  };

  const handleDownloadPdf = () => {
    downloadPdfReport({
      title: `DWG Header Audit: ${fileName || 'CAD File'}`,
      category: 'CAD & Engineering Analysis',
      project: 'Toolique CAD Tools',
      theme: 'amber',
      summaryCards: [
        { label: 'Header Signature', value: headerCode },
        { label: 'AutoCAD Version', value: meta ? meta.name : 'Unknown' },
        { label: 'Format ID', value: meta ? meta.dwgFormat : 'N/A' },
        { label: 'File Size', value: fileSize || 'Manual Entry' }
      ],
      tables: [
        {
          title: 'Version & Compatibility Analysis',
          headers: ['Metric', 'Value'],
          rows: [
            ['File Name', fileName || 'Manual Input'],
            ['Header Signature Code', cleanHeader],
            ['Matched CAD Version', meta ? meta.name : 'Unknown / Non-standard Header'],
            ['Release Year', meta ? meta.released : 'N/A'],
            ['Format Generation', meta ? meta.dwgFormat : 'N/A'],
            ['Technical Details', meta ? meta.desc : 'No record found for this signature']
          ]
        },
        {
          title: 'Binary Header Hex Dump (First 16 Bytes)',
          headers: ['Byte Offset', 'Hex Value', 'ASCII Character'],
          rows: hexDump.map((h, i) => [String(i).padStart(2, '0'), h, asciiDump[i] || ''])
        }
      ],
      disclaimers: [
        'DWG binary header decoded client-side using JavaScript DataView byte parsing.',
        'Zero CAD files are uploaded to external servers.'
      ]
    });
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Input / Upload Panel */}
      <div className="lg:col-span-7 space-y-6">
        {/* Upload Card */}
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-500" />
            <span>Upload Drawing File</span>
          </h3>

          <FileDropzone
            accept=".dwg,.dxf"
            onFilesSelected={(files) => {
              if (files[0]) handleFileUpload(files[0]);
            }}
            title="Drag & Drop your DWG / DXF file here"
            description="Read internal AutoCAD binary header signature (AC1032, AC1027, etc.)"
            colorTheme="amber"
          />

          {fileName && (
            <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-zinc-700/50 rounded-xl">
              <FileText className="w-8 h-8 text-indigo-500" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">{fileName}</p>
                <p className="text-[10px] text-zinc-400 mt-0.5">{fileSize}</p>
              </div>
            </div>
          )}
        </div>

        {/* Hex Editor Visualizer */}
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-500" />
            <span>Magic Signature Byte Dump (Hex View)</span>
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Every DWG file begins with a 6-byte identifier (like <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded font-mono">AC1032</code>). Here are the first 16 bytes of your file:
          </p>

          <div className="bg-zinc-950 text-emerald-400 rounded-xl p-4 font-mono text-xs overflow-x-auto shadow-inner border border-zinc-900">
            {/* Hex Header */}
            <div className="grid grid-cols-12 gap-2 text-zinc-650 border-b border-zinc-800/80 pb-2 mb-2 font-black">
              <div className="col-span-2">Offset</div>
              <div className="col-span-7 grid grid-cols-8 gap-1">
                {Array.from({ length: 8 }).map((_, i) => (
                  <span key={i}>{i.toString(16).toUpperCase().padStart(2, '0')}</span>
                ))}
              </div>
              <div className="col-span-3 text-right">ASCII</div>
            </div>
            {/* Row 1 */}
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-2 text-zinc-600">00000000</div>
              <div className="col-span-7 grid grid-cols-8 gap-1 font-semibold">
                {hexDump.slice(0, 8).map((byte, i) => (
                  <span key={i} className={i < 6 ? 'text-indigo-400' : 'text-emerald-400'}>{byte}</span>
                ))}
              </div>
              <div className="col-span-3 text-right text-zinc-400">
                {asciiDump.slice(0, 8).join('')}
              </div>
            </div>
            {/* Row 2 */}
            <div className="grid grid-cols-12 gap-2 mt-1">
              <div className="col-span-2 text-zinc-600">00000008</div>
              <div className="col-span-7 grid grid-cols-8 gap-1 font-semibold">
                {hexDump.slice(8, 16).map((byte, i) => (
                  <span key={i} className="text-emerald-400">{byte}</span>
                ))}
              </div>
              <div className="col-span-3 text-right text-zinc-400">
                {asciiDump.slice(8, 16).join('')}
              </div>
            </div>
          </div>
        </div>

        {/* Manual Overrides */}
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-sm">Manual Signature Override</h3>
          <div>
            <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">First 6 Characters</label>
            <input
              type="text"
              value={headerCode}
              maxLength={6}
              onChange={handleInputChange}
              className="saas-input font-bold tracking-widest text-indigo-650 dark:text-indigo-400 uppercase text-center"
            />
          </div>
        </div>
      </div>

      {/* Results / Compatibility Panel */}
      <div className="lg:col-span-5 space-y-6">
        {/* Version Match Card */}
        <div className="saas-card p-6 flex flex-col justify-between h-full space-y-6">
          <div>
            <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Audit Status</span>
              <div className="flex items-center gap-1.5">
                <CopyButton text={getDwgReport()} label="Copy" className="text-[11px] py-1 px-2.5" />
                <ShareWhatsApp text={getDwgReport()} className="text-[11px] py-1 px-2.5" />
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition shadow-xs"
                  title="Download PDF audit report"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>
              </div>
            </div>

            {meta ? (
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-zinc-400">DWG Format Version</span>
                  <div className="text-2xl font-black mt-1 text-zinc-950 dark:text-white">{meta.name}</div>
                  <div className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md mt-2 bg-indigo-500/10 text-indigo-500 uppercase tracking-wider">
                    {meta.dwgFormat}
                  </div>
                </div>

                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Release Date</span>
                    <span className="font-bold">{meta.released}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Internal Signature</span>
                    <span className="font-mono font-bold text-indigo-500">{headerCode.toUpperCase()}</span>
                  </div>
                </div>

                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4">
                  <h4 className="text-xs font-bold mb-2 flex items-center gap-1.5">
                    <Monitor className="w-4 h-4 text-indigo-500" />
                    <span>Software Compatibility Matrix</span>
                  </h4>
                  <div className="space-y-2 text-[11px]">
                    <div className="flex justify-between items-center p-2 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg">
                      <span className="font-semibold">Autodesk AutoCAD</span>
                      <span className="font-mono text-zinc-500">{meta.compat.autocad}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg">
                      <span className="font-semibold">Autodesk Revit</span>
                      <span className="font-mono text-zinc-500">{meta.compat.revit}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg">
                      <span className="font-semibold">Trimble SketchUp</span>
                      <span className="font-mono text-zinc-500">{meta.compat.sketchup}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg">
                      <span className="font-semibold">LibreCAD / OpenCAD</span>
                      <span className="font-mono text-zinc-500">{meta.compat.librecad}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 text-xs text-zinc-400 leading-relaxed">
                  <p>{meta.desc}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 space-y-3">
                <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mx-auto">
                  <Info className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-rose-500">Unrecognized Signature</div>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-[240px] mx-auto">
                  The header <code className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-rose-400">{headerCode}</code> does not match standard Autodesk DWG specifications.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
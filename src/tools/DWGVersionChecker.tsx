import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function DWGVersionChecker() {
  const [headerCode, setHeaderCode] = useState('AC1015');
  const [copied, setCopied] = useState(false);

  const getDwgVersion = () => {
    const versions: Record<string, string> = {
      AC1015: 'AutoCAD 2000 / 2000i / 2002',
      AC1018: 'AutoCAD 2004 / 2005 / 2006',
      AC1021: 'AutoCAD 2007 / 2008 / 2009',
      AC1024: 'AutoCAD 2010 / 2011 / 2012',
      AC1027: 'AutoCAD 2013 / 2014 / 2015 / 2016 / 2017',
      AC1032: 'AutoCAD 2018 / 2019 / 2020 / 2021 / 2022 / 2023 / 2024'
    };
    return versions[headerCode.toUpperCase().trim()] || 'Unknown / Corrupted DWG File header';
  };

  const versionText = getDwgVersion();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text && text.length >= 6) {
          const hex = text.substring(0, 6);
          setHeaderCode(hex);
        }
      };
      reader.readAsText(file.slice(0, 6)); // read first 6 bytes
    }
  };

  const copyReport = () => {
    const text = `DWG File Version Audit\nFile Header Signature: ${headerCode}\nAutoCAD Release Level: ${versionText}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      <div className="md:col-span-7 p-6 saas-card space-y-4">
        <h3 className="font-bold text-sm">Upload Drawing / Enter Header</h3>
        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Directly Upload DWG File (Header Audit)</label>
          <input type="file" accept=".dwg" onChange={handleFileUpload} className="saas-input text-xs" />
        </div>
        <div className="border-t pt-4">
          <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Manually Audit Header (First 6 Characters)</label>
          <input type="text" value={headerCode} maxLength={6} onChange={e => setHeaderCode(e.target.value)} className="saas-input font-semibold" />
        </div>
      </div>
      <div className="md:col-span-5 p-6 saas-card flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Metadata</span>
            <button onClick={copyReport} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-[11px] font-bold">
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <span className="text-xs text-zinc-400">Release Version Compatibility</span>
              <div className="text-md font-black mt-1 text-zinc-950 dark:text-white leading-relaxed">{versionText}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { Clipboard, Check, Download, RefreshCw, FileSpreadsheet } from 'lucide-react';

const FIRST_NAMES = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'John', 'Jane', 'Michael', 'Emily', 'Sarah', 'David', 'James', 'Amit', 'Rahul', 'Priya', 'Neha', 'Rohan', 'Emma', 'Daniel'];
const LAST_NAMES = ['Swami', 'Sharma', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Kumar', 'Singh', 'Patel', 'Joshi', 'Swamy', 'Taylor', 'Wilson', 'Anderson', 'Thomas'];
const DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com', 'toolique.in', 'voxelique.com', 'example.com', 'test.org'];
const COUNTRIES = ['India', 'United States', 'United Kingdom', 'Germany', 'Canada', 'Australia', 'Japan', 'Singapore', 'Netherlands'];

interface ColumnConfig {
  key: string;
  label: string;
  active: boolean;
}

export default function TestDataGenerator() {
  const [format, setFormat] = useState<'json' | 'csv' | 'sql'>('json');
  const [rows, setRows] = useState<number>(50);
  const [sqlTableName, setSqlTableName] = useState<string>('users');
  
  const [columns, setColumns] = useState<ColumnConfig[]>([
    { key: 'id', label: 'UUID (id)', active: true },
    { key: 'name', label: 'Full Name (name)', active: true },
    { key: 'email', label: 'Email (email)', active: true },
    { key: 'phone', label: 'Phone (phone)', active: true },
    { key: 'country', label: 'Country (country)', active: true },
    { key: 'age', label: 'Age (age)', active: true },
    { key: 'isActive', label: 'Status (is_active)', active: true },
  ]);

  const [output, setOutput] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const toggleColumn = (key: string) => {
    setColumns(columns.map(col => col.key === key ? { ...col, active: !col.active } : col));
  };

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  const generateRandomRow = (index: number) => {
    const fName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const domain = DOMAINS[Math.floor(Math.random() * DOMAINS.length)];
    
    return {
      id: generateUUID(),
      name: `${fName} ${lName}`,
      email: `${fName.toLowerCase()}.${lName.toLowerCase()}${index}@${domain}`,
      phone: `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`,
      country: COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)],
      age: Math.floor(18 + Math.random() * 60),
      isActive: Math.random() > 0.3
    };
  };

  const handleGenerate = () => {
    const activeCols = columns.filter(c => c.active);
    if (activeCols.length === 0) {
      setOutput('Please select at least one data column.');
      return;
    }

    const data = Array.from({ length: rows }, (_, idx) => generateRandomRow(idx + 1));

    if (format === 'json') {
      const formattedJson = data.map(item => {
        const obj: Record<string, any> = {};
        activeCols.forEach(col => {
          obj[col.key] = item[col.key as keyof typeof item];
        });
        return obj;
      });
      setOutput(JSON.stringify(formattedJson, null, 2));
    } 
    
    else if (format === 'csv') {
      const headers = activeCols.map(c => c.key).join(',');
      const rowsCsv = data.map(item => {
        return activeCols.map(col => {
          const val = item[col.key as keyof typeof item];
          return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
        }).join(',');
      }).join('\n');
      setOutput(`${headers}\n${rowsCsv}`);
    } 
    
    else if (format === 'sql') {
      const colNames = activeCols.map(c => c.key).join(', ');
      const insertStatements = data.map(item => {
        const values = activeCols.map(col => {
          const val = item[col.key as keyof typeof item];
          if (typeof val === 'string') {
            return `'${val.replace(/'/g, "''")}'`;
          }
          return val;
        }).join(', ');
        return `INSERT INTO ${sqlTableName || 'users'} (${colNames}) VALUES (${values});`;
      }).join('\n');
      setOutput(insertStatements);
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!output) return;
    const extension = format === 'json' ? 'json' : format === 'csv' ? 'csv' : 'sql';
    const mime = format === 'json' ? 'application/json' : format === 'csv' ? 'text/csv' : 'text/plain';
    
    const blob = new Blob([output], { type: `${mime};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `mock_test_data_${rows}_rows.${extension}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Controls Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="saas-card p-5 space-y-4 text-left">
            <h3 className="text-sm font-black text-zinc-900 dark:text-white">
              Data Columns Config
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {columns.map(col => (
                <label
                  key={col.key}
                  className="flex items-center gap-2.5 p-2 rounded-xl border border-zinc-200/50 dark:border-zinc-800/40 bg-zinc-50/20 dark:bg-zinc-950/20 cursor-pointer text-xs font-semibold text-zinc-650 dark:text-zinc-350 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition"
                >
                  <input
                    type="checkbox"
                    checked={col.active}
                    onChange={() => toggleColumn(col.key)}
                    className="rounded text-indigo-650 focus:ring-indigo-500/20 w-4 h-4"
                  />
                  <span>{col.label}</span>
                </label>
              ))}
            </div>

            <div className="border-t border-zinc-200/40 dark:border-zinc-800/40 pt-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-zinc-400">Format</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as any)}
                    className="saas-select"
                  >
                    <option value="json">JSON Array</option>
                    <option value="csv">CSV Sheet</option>
                    <option value="sql">SQL Inserts</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-zinc-400">Rows</label>
                  <select
                    value={rows}
                    onChange={(e) => setRows(Number(e.target.value))}
                    className="saas-select"
                  >
                    <option value={10}>10 Rows</option>
                    <option value={50}>50 Rows</option>
                    <option value={100}>100 Rows</option>
                    <option value={500}>500 Rows</option>
                    <option value={1000}>1000 Rows</option>
                  </select>
                </div>
              </div>

              {format === 'sql' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-zinc-400">SQL Table Name</label>
                  <input
                    type="text"
                    placeholder="users"
                    value={sqlTableName}
                    onChange={(e) => setSqlTableName(e.target.value)}
                    className="saas-input"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={handleGenerate}
                className="saas-button-primary w-full cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Generate Mock Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-7 space-y-4">
          <div className="saas-card p-5 h-full flex flex-col justify-between text-left">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-200/40 dark:border-zinc-800/40">
                <h3 className="text-sm font-black text-zinc-900 dark:text-white">
                  Mock Output Data
                </h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    disabled={!output}
                    className="saas-button-secondary py-1 px-3 text-[10px] inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Clipboard className="w-3 h-3" />}
                    <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={!output}
                    className="saas-button-primary py-1 px-3 text-[10px] inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    {downloadSuccess ? <Check className="w-3 h-3 text-white" /> : <Download className="w-3 h-3" />}
                    <span>{downloadSuccess ? 'Downloaded!' : 'Download file'}</span>
                  </button>
                </div>
              </div>

              {output ? (
                <textarea
                  readOnly
                  value={output}
                  className="w-full h-[360px] font-mono text-[11px] p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-emerald-400 focus:outline-none resize-none leading-relaxed"
                />
              ) : (
                <div className="w-full h-[360px] rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-50/10 dark:bg-zinc-950/20 flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500">
                  <FileSpreadsheet className="w-10 h-10 mb-2 stroke-[1.5]" />
                  <p className="text-xs font-semibold">Click "Generate Mock Data" to output sandbox records</p>
                </div>
              )}
            </div>

            <p className="text-[10px] text-zinc-450 dark:text-zinc-500 font-semibold pt-4">
              All computations are completed locally in browser sandbox. Data remains inside your browser memory.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

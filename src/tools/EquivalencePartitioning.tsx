import { useState } from 'react';
import { Clipboard, Check, Plus, HelpCircle } from 'lucide-react';

interface Partition {
  id: string;
  name: string;
  type: 'Valid' | 'Invalid';
  rangeDesc: string;
  testValue: string;
}

const PRESET_SCHEMAS: Record<string, { name: string; partitions: Omit<Partition, 'id'>[] }> = {
  age: {
    name: 'User Age Eligibility (18 to 60)',
    partitions: [
      { name: 'Underage visitor', type: 'Invalid', rangeDesc: 'Values < 18', testValue: '17' },
      { name: 'Standard adult user', type: 'Valid', rangeDesc: 'Values from 18 to 60', testValue: '35' },
      { name: 'Senior / Retired visitor', type: 'Invalid', rangeDesc: 'Values > 60', testValue: '61' },
      { name: 'Negative age error', type: 'Invalid', rangeDesc: 'Values <= 0', testValue: '-5' }
    ]
  },
  password: {
    name: 'Password Length Validator (8 to 20 chars)',
    partitions: [
      { name: 'Password too short', type: 'Invalid', rangeDesc: 'Length < 8 characters', testValue: '"abc12"' },
      { name: 'Valid password length', type: 'Valid', rangeDesc: 'Length from 8 to 20 characters', testValue: '"p@$$w0rd1234"' },
      { name: 'Password too long', type: 'Invalid', rangeDesc: 'Length > 20 characters', testValue: '"aVeryLongPassword123456789"' }
    ]
  },
  discount: {
    name: 'Discount Coupon Code Percentage (1% to 100%)',
    partitions: [
      { name: 'Zero percent discount', type: 'Invalid', rangeDesc: 'Value = 0', testValue: '0' },
      { name: 'Valid discount percentage', type: 'Valid', rangeDesc: 'Values from 1 to 100', testValue: '25' },
      { name: 'Excessive percentage error', type: 'Invalid', rangeDesc: 'Values > 100', testValue: '120' },
      { name: 'Negative value error', type: 'Invalid', rangeDesc: 'Values < 0', testValue: '-10' }
    ]
  }
};

export default function EquivalencePartitioning() {
  const [presetKey, setPresetKey] = useState<string>('age');
  const [partitions, setPartitions] = useState<Partition[]>(
    PRESET_SCHEMAS.age.partitions.map((p, i) => ({ ...p, id: `EP-${101 + i}` }))
  );

  const [customName, setCustomName] = useState('');
  const [customType, setCustomType] = useState<'Valid' | 'Invalid'>('Valid');
  const [customDesc, setCustomDesc] = useState('');
  const [customVal, setCustomVal] = useState('');
  const [copied, setCopied] = useState(false);

  const handleLoadPreset = (key: string) => {
    setPresetKey(key);
    if (PRESET_SCHEMAS[key]) {
      setPartitions(PRESET_SCHEMAS[key].partitions.map((p, i) => ({ ...p, id: `EP-${101 + i}` })));
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newPartition: Partition = {
      id: `EP-${101 + partitions.length}`,
      name: customName,
      type: customType,
      rangeDesc: customDesc || 'Custom input class range specification',
      testValue: customVal || 'N/A'
    };

    setPartitions([...partitions, newPartition]);
    setCustomName('');
    setCustomDesc('');
    setCustomVal('');
    setPresetKey('custom');
  };

  const handleRemove = (id: string) => {
    setPartitions(partitions.filter(p => p.id !== id));
    setPresetKey('custom');
  };

  const handleCopy = () => {
    if (partitions.length === 0) return;
    let md = `# Equivalence Partitioning Plan\n\n`;
    md += `| ID | Partition Name | Class Type | Range / Description | Example Test Value |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- |\n`;
    partitions.forEach(p => {
      md += `| ${p.id} | ${p.name} | ${p.type} | ${p.rangeDesc} | \`${p.testValue}\` |\n`;
    });

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column configuration */}
        <div className="lg:col-span-5 space-y-4">
          <div className="saas-card p-5 space-y-4 text-left">
            <h3 className="text-sm font-black text-zinc-900 dark:text-white">
              Preset Schemas
            </h3>
            <div className="flex flex-col gap-2">
              {Object.entries(PRESET_SCHEMAS).map(([key, item]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleLoadPreset(key)}
                  className={`w-full text-left text-xs font-bold px-3 py-2.5 rounded-xl border transition-colors cursor-pointer ${
                    presetKey === key
                      ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-700 dark:text-indigo-400'
                      : 'bg-white/40 dark:bg-zinc-950/20 border-zinc-200/50 dark:border-zinc-850/60 hover:bg-zinc-50 dark:hover:bg-zinc-850/40 text-zinc-650 dark:text-zinc-350'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          <div className="saas-card p-5 space-y-4 text-left">
            <h3 className="text-sm font-black text-zinc-900 dark:text-white">
              Add Custom Partition
            </h3>

            <form onSubmit={handleAddCustom} className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-400">Partition Name</label>
                <input
                  type="text"
                  placeholder="e.g. Decimals, Blank space"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="saas-input"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-zinc-400">Class Type</label>
                  <select
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value as any)}
                    className="saas-select"
                  >
                    <option value="Valid">Valid Input</option>
                    <option value="Invalid">Invalid Input</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-zinc-400">Test Value</label>
                  <input
                    type="text"
                    placeholder="e.g. 5.5, @#"
                    value={customVal}
                    onChange={(e) => setCustomVal(e.target.value)}
                    className="saas-input"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-400">Range Description</label>
                <input
                  type="text"
                  placeholder="e.g. Any positive integer > 10"
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  className="saas-input"
                />
              </div>

              <button
                type="submit"
                className="saas-button-primary w-full cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Partition</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right column results */}
        <div className="lg:col-span-7 space-y-4">
          <div className="saas-card p-6 space-y-4 text-left">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-200/40 dark:border-zinc-800/40">
              <h3 className="text-sm font-black text-zinc-900 dark:text-white">
                Equivalence Classes Table
              </h3>

              <button
                type="button"
                onClick={handleCopy}
                disabled={partitions.length === 0}
                className="saas-button-secondary py-1 px-3 text-[10px] inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Clipboard className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied MD!' : 'Copy Markdown'}</span>
              </button>
            </div>

            {partitions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                      <th className="py-2.5 px-2">ID</th>
                      <th className="py-2.5 px-2">Name</th>
                      <th className="py-2.5 px-2">Type</th>
                      <th className="py-2.5 px-2">Range/Description</th>
                      <th className="py-2.5 px-2">Test Value</th>
                      <th className="py-2.5 px-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partitions.map((p) => (
                      <tr
                        key={p.id}
                        className="border-b border-zinc-200/40 dark:border-zinc-800/40 hover:bg-zinc-50/30 dark:hover:bg-zinc-950/20 transition font-semibold"
                      >
                        <td className="py-3 px-2 font-mono text-[10px] text-zinc-400">{p.id}</td>
                        <td className="py-3 px-2 text-zinc-900 dark:text-white">{p.name}</td>
                        <td className="py-3 px-2">
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                              p.type === 'Valid'
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                                : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                            }`}
                          >
                            {p.type}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-zinc-500 dark:text-zinc-400 leading-normal">{p.rangeDesc}</td>
                        <td className="py-3 px-2 font-mono text-[11px] text-indigo-650 dark:text-indigo-400">
                          {p.testValue}
                        </td>
                        <td className="py-3 px-2">
                          <button
                            type="button"
                            onClick={() => handleRemove(p.id)}
                            className="text-zinc-400 hover:text-rose-500 transition cursor-pointer font-bold text-xs"
                            title="Remove partition"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500">
                <HelpCircle className="w-10 h-10 mb-2 stroke-[1.5]" />
                <p className="text-xs font-semibold">No equivalence partitions defined</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

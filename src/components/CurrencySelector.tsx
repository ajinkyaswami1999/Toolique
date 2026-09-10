import { SUPPORTED_CURRENCIES, type CurrencyOption } from '../utils/currency';

interface CurrencySelectorProps {
  value: string;
  onChange: (symbol: string, option: CurrencyOption) => void;
  className?: string;
}

export default function CurrencySelector({
  value,
  onChange,
  className = '',
}: CurrencySelectorProps) {
  const currentOption =
    SUPPORTED_CURRENCIES.find((c) => c.symbol === value || c.code === value) ||
    SUPPORTED_CURRENCIES[0];

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <select
        value={currentOption.code}
        onChange={(e) => {
          const selected =
            SUPPORTED_CURRENCIES.find((c) => c.code === e.target.value) ||
            SUPPORTED_CURRENCIES[0];
          onChange(selected.symbol, selected);
        }}
        className="px-2.5 py-1.5 text-xs font-bold rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-750 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs transition appearance-none pr-7"
        title="Select currency unit"
      >
        {SUPPORTED_CURRENCIES.map((curr) => (
          <option
            key={curr.code}
            value={curr.code}
            className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
          >
            {curr.flag} {curr.code} ({curr.symbol.trim()})
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2.5 text-zinc-400 text-[9px]">
        ▼
      </span>
    </div>
  );
}

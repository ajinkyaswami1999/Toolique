import React from 'react';

export type UnitSwitcherPreset = 'metric-imperial' | 'meters-feet' | 'cft-m3';

export interface UnitOption<T extends string = string> {
  id: T;
  label: string;
  shortLabel?: string;
  icon?: React.ReactNode;
}

export interface UnitSwitcherProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options?: UnitOption<T>[];
  preset?: UnitSwitcherPreset;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  ariaLabel?: string;
}

const PRESET_OPTIONS: Record<UnitSwitcherPreset, UnitOption<any>[]> = {
  'metric-imperial': [
    { id: 'metric', label: 'Metric (m/mm)', shortLabel: 'Metric' },
    { id: 'imperial', label: 'Imperial (ft/in)', shortLabel: 'Imperial' },
  ],
  'meters-feet': [
    { id: 'meters', label: 'Meters (m)', shortLabel: 'Meters' },
    { id: 'feet', label: 'Feet / Inches (ft)', shortLabel: 'Feet' },
  ],
  'cft-m3': [
    { id: 'cft', label: 'Cu.Ft (cft)', shortLabel: 'cu.ft' },
    { id: 'm3', label: 'Cu.Meters (m³)', shortLabel: 'm³' },
  ],
};

const SIZE_STYLES = {
  xs: {
    container: 'p-0.5 rounded-lg text-[10px]',
    item: 'px-2 py-0.5 rounded-md',
  },
  sm: {
    container: 'p-0.5 rounded-xl text-xs',
    item: 'px-3 py-1 rounded-lg',
  },
  md: {
    container: 'p-1 rounded-2xl text-sm',
    item: 'px-4 py-1.5 rounded-xl',
  },
};

export function UnitSwitcher<T extends string = string>({
  value,
  onChange,
  options,
  preset = 'metric-imperial',
  size = 'sm',
  className = '',
  ariaLabel = 'Unit system selector',
}: UnitSwitcherProps<T>) {
  const resolvedOptions: UnitOption<T>[] = options || (PRESET_OPTIONS[preset] as unknown as UnitOption<T>[]);
  const sizeClass = SIZE_STYLES[size];

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={`inline-flex items-center bg-zinc-100 dark:bg-zinc-850 p-0.5 border border-zinc-200 dark:border-zinc-700/80 font-bold select-none shadow-inner ${sizeClass.container} ${className}`}
    >
      {resolvedOptions.map((opt) => {
        const isSelected = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(opt.id)}
            className={`flex items-center gap-1.5 font-bold transition-all ${sizeClass.item} ${
              isSelected
                ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            {opt.icon && <span className="shrink-0">{opt.icon}</span>}
            <span className="hidden sm:inline">{opt.label}</span>
            <span className="inline sm:hidden">{opt.shortLabel || opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default UnitSwitcher;

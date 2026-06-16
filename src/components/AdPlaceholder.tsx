import { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface AdPlaceholderProps {
  slot?: string;
  type?: 'banner' | 'rectangle' | 'responsive';
  className?: string;
}

export default function AdPlaceholder({ slot = '0000000000', type = 'responsive', className = '' }: AdPlaceholderProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const styleMap = {
    banner: 'w-full h-[90px] md:h-[120px]',
    rectangle: 'w-full md:w-[336px] h-[280px] mx-auto',
    responsive: 'w-full min-h-[100px] py-4'
  };

  return (
    <div className={`my-6 overflow-hidden rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/30 p-2 text-center transition-all ${styleMap[type]} ${className}`}>
      <div className="flex justify-between items-center px-2 pb-1 border-b border-slate-200/40 dark:border-slate-800/40 text-[10px] font-medium tracking-wider text-slate-400 dark:text-slate-500 uppercase">
        <span className="flex items-center gap-1">
          AdSense Placeholder <span title="This slot is ready for your Google AdSense code."><HelpCircle className="w-3 h-3 cursor-help text-slate-400" /></span>
        </span>
        <button 
          onClick={() => setIsVisible(false)} 
          className="hover:text-slate-600 dark:hover:text-slate-300 p-0.5 rounded transition"
          title="Dismiss ad preview"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex flex-col items-center justify-center h-full min-h-[70px] text-xs text-slate-400/80 dark:text-slate-500/80">
        <div className="font-semibold text-slate-500 dark:text-slate-400">Advertisement Slot #{slot}</div>
        <div className="text-[10px] mt-0.5 font-mono">Format: {type.toUpperCase()} ({type === 'banner' ? 'Leaderboard' : type === 'rectangle' ? 'Medium Rectangle' : 'Auto-Responsive'})</div>
      </div>
    </div>
  );
}

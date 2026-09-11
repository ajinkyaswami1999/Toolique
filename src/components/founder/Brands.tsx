import { Link } from 'react-router-dom';
import { brands } from '../../data/founder';
import { ExternalLink, ArrowRight, Shield, Box } from 'lucide-react';

export default function Brands() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
      {brands.map(brand => {
        const PreviewIcon = brand.previewIcon;
        const isToolique = brand.name === 'Toolique';

        return (
          <div key={brand.name} className="relative group">
            {/* Ambient Background Gradient Glow on Hover */}
            <div className={`absolute -inset-px rounded-3xl ${isToolique ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-purple-500 to-indigo-500'} opacity-0 group-hover:opacity-25 blur-md transition duration-500`} />
            
            <div className="relative p-6 sm:p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-xl shadow-2xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full space-y-6">
              
              <div className="space-y-4">
                {/* Brand Visual Header Card */}
                <div className={`h-32 sm:h-36 rounded-2xl ${isToolique ? 'bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-indigo-500/10 border-emerald-500/20' : 'bg-gradient-to-br from-purple-500/15 via-indigo-500/10 to-pink-500/10 border-purple-500/20'} border flex flex-col items-center justify-center relative overflow-hidden group-hover:scale-[1.01] transition-transform`}>
                  <div className="absolute inset-0 bg-dot-grid opacity-20" />
                  <div className={`p-4 rounded-2xl ${isToolique ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-purple-500/20 text-purple-600 dark:text-purple-400'} shadow-sm relative z-10 group-hover:scale-110 transition-transform`}>
                    <PreviewIcon className="w-8 h-8" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 mt-2 relative z-10 uppercase tracking-widest">
                    {isToolique ? 'Web Utilities Ecosystem' : 'Additive Manufacturing & Prototyping'}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                    {brand.name}
                  </h3>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${brand.badgeColorClass}`}>
                    {brand.badgeLabel}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed font-normal">
                  {brand.desc}
                </p>

                {/* Micro-Features Strip */}
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                  <span className="flex items-center gap-1.5">
                    {isToolique ? <Shield className="w-3.5 h-3.5 text-emerald-500" /> : <Box className="w-3.5 h-3.5 text-purple-500" />}
                    {brand.statLine}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {brand.primaryCta.external ? (
                  <a
                    href={brand.primaryCta.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="saas-button-primary py-2.5 px-4 text-xs font-black inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span>{brand.primaryCta.label}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <Link
                    to={brand.primaryCta.href}
                    className="saas-button-primary py-2.5 px-4 text-xs font-black inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span>{brand.primaryCta.label}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}

                {brand.secondaryCta.external ? (
                  <a
                    href={brand.secondaryCta.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="saas-button-secondary py-2.5 px-4 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{brand.secondaryCta.label}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <Link
                    to={brand.secondaryCta.href}
                    className="saas-button-secondary py-2.5 px-4 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{brand.secondaryCta.label}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
}


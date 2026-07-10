import { brands } from '../../data/founder';

export default function Brands() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {brands.map(brand => {
        const PreviewIcon = brand.previewIcon;
        return (
          <div key={brand.name} className="relative group">
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-indigo-500 to-teal-500 opacity-0 group-hover:opacity-20 blur-sm transition duration-300" />
            <div className="relative p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-gradient-to-br from-white/60 to-white/20 dark:from-zinc-900/40 dark:to-zinc-950/20 shadow-sm space-y-4 flex flex-col justify-between h-full hover:-translate-y-1 transition-all duration-300">
              <div className="space-y-3">
                <div className="h-28 rounded-xl bg-gradient-to-br from-indigo-500/10 to-teal-500/10 dark:from-indigo-500/5 dark:to-teal-500/5 flex items-center justify-center">
                  <PreviewIcon className="w-10 h-10 text-indigo-500/60 dark:text-indigo-400/60" />
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                    {brand.name}
                  </h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${brand.badgeColorClass}`}>
                    {brand.badgeLabel}
                  </span>
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {brand.desc}
                </p>
                <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500">
                  {brand.statLine}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <a
                  href={brand.primaryCta.href}
                  target={brand.primaryCta.external ? '_blank' : undefined}
                  rel={brand.primaryCta.external ? 'noopener noreferrer' : undefined}
                  className="saas-button-primary py-2 px-4 text-xs"
                >
                  {brand.primaryCta.label}
                </a>
                <a
                  href={brand.secondaryCta.href}
                  target={brand.secondaryCta.external ? '_blank' : undefined}
                  rel={brand.secondaryCta.external ? 'noopener noreferrer' : undefined}
                  className="saas-button-secondary py-2 px-4 text-xs"
                >
                  {brand.secondaryCta.label}
                </a>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

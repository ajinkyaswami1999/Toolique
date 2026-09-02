import { useState, useEffect, useRef } from 'react';
import { 
  Calculator, 
  FileText, 
  Star, 
  X, 
  Layers,
  Languages,
  Clock
} from 'lucide-react';
import CalculatorPanel from './CalculatorPanel';
import NotepadPanel from './NotepadPanel';
import FavoritesPanel from './FavoritesPanel';
import RecentToolsPanel from './RecentToolsPanel';
import LanguagePanel, { initGoogleTranslate, getActiveLanguage } from './LanguagePanel';

export default function FloatingActionMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [activePanel, setActivePanel] = useState<'calculator' | 'notepad' | 'favorites' | 'recent' | 'language' | null>(null);
  const [currentLang, setCurrentLang] = useState<string>('en');
  const menuRef = useRef<HTMLDivElement>(null);

  // Initialize translator on load
  useEffect(() => {
    initGoogleTranslate();
    setCurrentLang(getActiveLanguage());
  }, []);

  // Close on Escape or click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activePanel) {
          setActivePanel(null);
        } else if (isMenuOpen) {
          setIsMenuOpen(false);
        }
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement).closest('.toolique-calculator-panel') &&
        !(e.target as HTMLElement).closest('.toolique-notepad-panel') &&
        !(e.target as HTMLElement).closest('.toolique-favorites-panel') &&
        !(e.target as HTMLElement).closest('.toolique-recent-panel') &&
        !(e.target as HTMLElement).closest('.toolique-language-panel')
      ) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen, activePanel]);

  const handleMainFabClick = () => {
    if (activePanel) {
      setActivePanel(null);
      setIsMenuOpen(false);
    } else {
      setIsMenuOpen(!isMenuOpen);
    }
  };

  const handleActionClick = (panelType: 'calculator' | 'notepad' | 'favorites' | 'recent' | 'language') => {
    setActivePanel(panelType);
    setIsMenuOpen(false);
  };

  const isOpen = isMenuOpen || activePanel !== null;

  return (
    <div ref={menuRef} className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-[90] select-none">
      
      {/* Dim Backdrop when speed dial is open */}
      {isMenuOpen && (
        <div 
          onClick={() => setIsMenuOpen(false)}
          className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-xs z-[80] transition-opacity duration-300 animate-fadeIn"
          aria-hidden="true"
        />
      )}

      {/* Speed Dial Actions (Stack expanding upward) */}
      <div 
        className={`absolute bottom-16 right-0 mb-3 flex flex-col items-end gap-3 z-[85] transition-all duration-300 ${
          isMenuOpen 
            ? 'opacity-100 pointer-events-auto translate-y-0' 
            : 'opacity-0 pointer-events-none translate-y-4'
        }`}
      >
        {/* Action 5: Language (Top of stack) */}
        <div 
          className="flex items-center gap-3 group transition-all duration-300 delay-150"
          style={{
            transform: isMenuOpen ? 'translateY(0)' : 'translateY(20px)',
            opacity: isMenuOpen ? 1 : 0
          }}
        >
          <span className="px-3 py-1.5 rounded-xl bg-white/95 dark:bg-zinc-900/95 text-xs font-black text-zinc-800 dark:text-zinc-200 shadow-xl border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-md whitespace-nowrap group-hover:scale-105 transition-transform flex items-center gap-1.5">
            <span>Language</span>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">({currentLang.toUpperCase()})</span>
          </span>
          <button
            type="button"
            onClick={() => handleActionClick('language')}
            aria-label="Change Website Language"
            className="w-12 h-12 rounded-full bg-white dark:bg-zinc-900 border border-blue-500/30 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 shadow-xl hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center relative cursor-pointer"
          >
            <Languages className="w-5 h-5" />
            {currentLang !== 'en' && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900" />
            )}
          </button>
        </div>

        {/* Action 4: Recently Used Tools */}
        <div 
          className="flex items-center gap-3 group transition-all duration-300 delay-120"
          style={{
            transform: isMenuOpen ? 'translateY(0)' : 'translateY(16px)',
            opacity: isMenuOpen ? 1 : 0
          }}
        >
          <span className="px-3 py-1.5 rounded-xl bg-white/95 dark:bg-zinc-900/95 text-xs font-black text-zinc-800 dark:text-zinc-200 shadow-xl border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-md whitespace-nowrap group-hover:scale-105 transition-transform">
            Recently Used
          </span>
          <button
            type="button"
            onClick={() => handleActionClick('recent')}
            aria-label="Open Recently Used Tools"
            className="w-12 h-12 rounded-full bg-white dark:bg-zinc-900 border border-purple-500/30 dark:border-purple-500/30 text-purple-600 dark:text-purple-400 shadow-xl hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 dark:hover:text-white hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer"
          >
            <Clock className="w-5 h-5" />
          </button>
        </div>

        {/* Action 3: Favorites */}
        <div 
          className="flex items-center gap-3 group transition-all duration-300 delay-90"
          style={{
            transform: isMenuOpen ? 'translateY(0)' : 'translateY(12px)',
            opacity: isMenuOpen ? 1 : 0
          }}
        >
          <span className="px-3 py-1.5 rounded-xl bg-white/95 dark:bg-zinc-900/95 text-xs font-black text-zinc-800 dark:text-zinc-200 shadow-xl border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-md whitespace-nowrap group-hover:scale-105 transition-transform">
            Favorites
          </span>
          <button
            type="button"
            onClick={() => handleActionClick('favorites')}
            aria-label="Open Favorites"
            className="w-12 h-12 rounded-full bg-white dark:bg-zinc-900 border border-amber-500/30 dark:border-amber-500/30 text-amber-500 shadow-xl hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 dark:hover:text-white hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer"
          >
            <Star className="w-5 h-5 fill-current" />
          </button>
        </div>

        {/* Action 2: Notepad */}
        <div 
          className="flex items-center gap-3 group transition-all duration-300 delay-60"
          style={{
            transform: isMenuOpen ? 'translateY(0)' : 'translateY(8px)',
            opacity: isMenuOpen ? 1 : 0
          }}
        >
          <span className="px-3 py-1.5 rounded-xl bg-white/95 dark:bg-zinc-900/95 text-xs font-black text-zinc-800 dark:text-zinc-200 shadow-xl border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-md whitespace-nowrap group-hover:scale-105 transition-transform">
            Notepad
          </span>
          <button
            type="button"
            onClick={() => handleActionClick('notepad')}
            aria-label="Open Notepad"
            className="w-12 h-12 rounded-full bg-white dark:bg-zinc-900 border border-emerald-500/30 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-xl hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer"
          >
            <FileText className="w-5 h-5" />
          </button>
        </div>

        {/* Action 1: Calculator */}
        <div 
          className="flex items-center gap-3 group transition-all duration-300 delay-0"
          style={{
            transform: isMenuOpen ? 'translateY(0)' : 'translateY(4px)',
            opacity: isMenuOpen ? 1 : 0
          }}
        >
          <span className="px-3 py-1.5 rounded-xl bg-white/95 dark:bg-zinc-900/95 text-xs font-black text-zinc-800 dark:text-zinc-200 shadow-xl border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-md whitespace-nowrap group-hover:scale-105 transition-transform">
            Calculator
          </span>
          <button
            type="button"
            onClick={() => handleActionClick('calculator')}
            aria-label="Open Calculator"
            className="w-12 h-12 rounded-full bg-white dark:bg-zinc-900 border border-indigo-500/30 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 shadow-xl hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer"
          >
            <Calculator className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Floating Action Button (FAB) */}
      <button
        type="button"
        onClick={handleMainFabClick}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close Quick Tools Menu' : 'Open Quick Tools Menu'}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 active:scale-95 cursor-pointer ${
          isOpen
            ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rotate-90 shadow-zinc-900/40'
            : 'bg-gradient-to-tr from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white shadow-indigo-500/30 dark:shadow-indigo-950/60 hover:scale-105'
        }`}
      >
        <div className="relative w-6 h-6 flex items-center justify-center">
          <X 
            className={`w-6 h-6 transition-all duration-300 absolute ${
              isOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'
            }`} 
          />
          <Layers 
            className={`w-6 h-6 transition-all duration-300 absolute ${
              !isOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'
            }`} 
          />
        </div>
      </button>

      {/* Floating Modal Panels */}
      {activePanel === 'calculator' && (
        <CalculatorPanel onClose={() => setActivePanel(null)} />
      )}

      {activePanel === 'notepad' && (
        <NotepadPanel onClose={() => setActivePanel(null)} />
      )}

      {activePanel === 'favorites' && (
        <FavoritesPanel onClose={() => setActivePanel(null)} />
      )}

      {activePanel === 'recent' && (
        <RecentToolsPanel onClose={() => setActivePanel(null)} />
      )}

      {activePanel === 'language' && (
        <LanguagePanel onClose={() => setActivePanel(null)} />
      )}
    </div>
  );
}

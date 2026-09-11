import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, 
  FileText, 
  Star, 
  X, 
  Languages,
  Clock,
  Sparkles
} from 'lucide-react';
import { TooliqueIcon } from '../Logo';
import CalculatorPanel from './CalculatorPanel';
import NotepadPanel from './NotepadPanel';
import FavoritesPanel from './FavoritesPanel';
import RecentToolsPanel from './RecentToolsPanel';
import LanguagePanel, { initGoogleTranslate, getActiveLanguage } from './LanguagePanel';
import { getFavoritesFromDB, getRecentlyUsedToolsFromDB } from '../../utils/indexedDB';

export default function FloatingActionMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [activePanel, setActivePanel] = useState<'calculator' | 'notepad' | 'favorites' | 'recent' | 'language' | null>(null);
  const [currentLang, setCurrentLang] = useState<string>('en');
  const [favoritesCount, setFavoritesCount] = useState<number>(0);
  const [recentCount, setRecentCount] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Initialize translator and counts on load
  useEffect(() => {
    initGoogleTranslate();
    setCurrentLang(getActiveLanguage());

    const refreshCounts = () => {
      getFavoritesFromDB().then((favs) => setFavoritesCount(favs.length)).catch(() => {});
      getRecentlyUsedToolsFromDB().then((recents) => setRecentCount(recents.length)).catch(() => {});
    };

    refreshCounts();
    window.addEventListener('toolique_favorite_toggle', refreshCounts);
    window.addEventListener('toolique_tool_used', refreshCounts);

    return () => {
      window.removeEventListener('toolique_favorite_toggle', refreshCounts);
      window.removeEventListener('toolique_tool_used', refreshCounts);
    };
  }, []);

  // Keyboard shortcut listener (Alt+Q or Option+Q to toggle quick suite)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey || e.metaKey) && e.key.toLowerCase() === 'q') {
        e.preventDefault();
        if (activePanel) {
          setActivePanel(null);
          setIsMenuOpen(false);
        } else {
          setIsMenuOpen((prev) => !prev);
        }
      } else if (e.key === 'Escape') {
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
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-xs z-[80] transition-opacity duration-300"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Speed Dial Actions (Stack expanding upward) */}
      <div 
        className={`absolute bottom-18 right-0 mb-3 flex flex-col items-end gap-3 z-[85] transition-all duration-300 ${
          isMenuOpen 
            ? 'opacity-100 pointer-events-auto translate-y-0' 
            : 'opacity-0 pointer-events-none translate-y-4'
        }`}
      >
        {/* Action 5: Language (Top of stack) */}
        <motion.div 
          initial={false}
          animate={{ y: isMenuOpen ? 0 : 20, opacity: isMenuOpen ? 1 : 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300, delay: isMenuOpen ? 0.16 : 0 }}
          className="flex items-center gap-3 group"
        >
          <span className="px-3.5 py-1.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-xl border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md whitespace-nowrap group-hover:scale-105 transition-transform flex items-center gap-1.5">
            <span>Language</span>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-black px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-200/50 dark:border-blue-800/50">
              {currentLang.toUpperCase()}
            </span>
          </span>
          <button
            type="button"
            onClick={() => handleActionClick('language')}
            aria-label="Change Website Language"
            className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-blue-500/30 text-blue-600 dark:text-blue-400 shadow-xl hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center relative cursor-pointer"
          >
            <Languages className="w-5 h-5" />
            {currentLang !== 'en' && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 animate-pulse" />
            )}
          </button>
        </motion.div>

        {/* Action 4: Recently Used Tools */}
        <motion.div 
          initial={false}
          animate={{ y: isMenuOpen ? 0 : 16, opacity: isMenuOpen ? 1 : 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300, delay: isMenuOpen ? 0.12 : 0 }}
          className="flex items-center gap-3 group"
        >
          <span className="px-3.5 py-1.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-xl border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md whitespace-nowrap group-hover:scale-105 transition-transform flex items-center gap-1.5">
            <span>Recent Tools</span>
            {recentCount > 0 && (
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">({recentCount})</span>
            )}
          </span>
          <button
            type="button"
            onClick={() => handleActionClick('recent')}
            aria-label="Open Recently Used Tools"
            className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-purple-500/30 text-purple-600 dark:text-purple-400 shadow-xl hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 dark:hover:text-white hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer"
          >
            <Clock className="w-5 h-5" />
          </button>
        </motion.div>

        {/* Action 3: Favorites */}
        <motion.div 
          initial={false}
          animate={{ y: isMenuOpen ? 0 : 12, opacity: isMenuOpen ? 1 : 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300, delay: isMenuOpen ? 0.08 : 0 }}
          className="flex items-center gap-3 group"
        >
          <span className="px-3.5 py-1.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-xl border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md whitespace-nowrap group-hover:scale-105 transition-transform flex items-center gap-1.5">
            <span>Starred Favorites</span>
            {favoritesCount > 0 && (
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-black px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 border border-amber-200/50">
                {favoritesCount}
              </span>
            )}
          </span>
          <button
            type="button"
            onClick={() => handleActionClick('favorites')}
            aria-label="Open Favorites"
            className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-amber-500/30 text-amber-500 shadow-xl hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 dark:hover:text-white hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer"
          >
            <Star className="w-5 h-5 fill-current" />
          </button>
        </motion.div>

        {/* Action 2: Notepad */}
        <motion.div 
          initial={false}
          animate={{ y: isMenuOpen ? 0 : 8, opacity: isMenuOpen ? 1 : 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300, delay: isMenuOpen ? 0.04 : 0 }}
          className="flex items-center gap-3 group"
        >
          <span className="px-3.5 py-1.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-xl border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md whitespace-nowrap group-hover:scale-105 transition-transform">
            Scratch Notepad
          </span>
          <button
            type="button"
            onClick={() => handleActionClick('notepad')}
            aria-label="Open Notepad"
            className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-xl hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer"
          >
            <FileText className="w-5 h-5" />
          </button>
        </motion.div>

        {/* Action 1: Calculator */}
        <motion.div 
          initial={false}
          animate={{ y: isMenuOpen ? 0 : 4, opacity: isMenuOpen ? 1 : 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300, delay: isMenuOpen ? 0 : 0 }}
          className="flex items-center gap-3 group"
        >
          <span className="px-3.5 py-1.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-xl border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md whitespace-nowrap group-hover:scale-105 transition-transform">
            Quick Calculator
          </span>
          <button
            type="button"
            onClick={() => handleActionClick('calculator')}
            aria-label="Open Calculator"
            className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 shadow-xl hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer"
          >
            <Calculator className="w-5 h-5" />
          </button>
        </motion.div>
      </div>

      {/* Main Floating Favicon / Action Button (FAB) */}
      <div 
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Ambient Glowing Aura Ring behind FAB */}
        <div 
          className={`absolute -inset-1 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-60 blur-md transition-all duration-500 group-hover:opacity-100 ${
            isOpen ? 'opacity-30 blur-sm scale-90' : 'animate-pulse'
          }`}
          aria-hidden="true"
        />

        {/* Floating Tooltip Pill on Hover */}
        <AnimatePresence>
          {isHovered && !isOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -10, scale: 0.95 }}
              className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-1.5 rounded-2xl bg-slate-900/95 text-white dark:bg-white dark:text-slate-900 text-[11px] font-bold shadow-2xl backdrop-blur-md border border-slate-700/50 dark:border-slate-200 whitespace-nowrap flex items-center gap-1.5 pointer-events-none"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Toolique Quick Suite</span>
              <kbd className="text-[9px] font-mono px-1 py-0.5 rounded bg-slate-800 text-slate-300 dark:bg-slate-200 dark:text-slate-700 ml-0.5">
                Alt+Q
              </kbd>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Floating Button */}
        <button
          type="button"
          onClick={handleMainFabClick}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Close Quick Tools Menu' : 'Open Quick Tools Menu'}
          className={`relative w-14 h-14 sm:w-15 sm:h-15 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 focus:outline-hidden active:scale-95 cursor-pointer border ${
            isOpen
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 rotate-90 shadow-slate-900/40 border-slate-700 dark:border-slate-200'
              : 'bg-gradient-to-tr from-indigo-600 via-indigo-600 to-violet-500 hover:from-indigo-500 hover:to-violet-400 text-white shadow-indigo-600/35 border-white/20 hover:scale-105'
          }`}
        >
          <div className="relative w-7 h-7 flex items-center justify-center">
            {/* Close cross icon when open */}
            <X 
              className={`w-6 h-6 transition-all duration-300 absolute ${
                isOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'
              }`} 
            />
            {/* Toolique brand favicon icon when closed */}
            <div 
              className={`transition-all duration-300 absolute flex items-center justify-center ${
                !isOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'
              }`}
            >
              <TooliqueIcon className="w-7 h-7 text-white drop-shadow-md" />
            </div>
          </div>

          {/* Small Notification Indicator dot if user has starred items */}
          {favoritesCount > 0 && !isOpen && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm animate-bounce">
              {favoritesCount}
            </span>
          )}
        </button>
      </div>

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

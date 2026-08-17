import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sun, Moon, Search, Menu, X, User } from 'lucide-react';
import { toolsList } from '../data/tools';
import { TooliqueLogo } from './Logo';
import LucideIcon from './LucideIcon';

export default function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const [navQuery, setNavQuery] = useState('');
  const modalInputRef = useRef<HTMLInputElement>(null);

  const filteredSuggestions = navQuery.trim()
    ? toolsList.filter(tool =>
        (tool.name || '').toLowerCase().includes(navQuery.toLowerCase()) ||
        (tool.category || '').toLowerCase().includes(navQuery.toLowerCase()) ||
        (tool.shortDescription || '').toLowerCase().includes(navQuery.toLowerCase()) ||
        (tool.keywords || []).some(k => k.toLowerCase().includes(navQuery.toLowerCase()))
      ).slice(0, 8)
    : [];

  const popularDefaultTools = toolsList.filter(t =>
    ['GSTCalculator', 'SQLMinifier', 'EMICalculator', 'JSONFormatter', 'InHandSalaryCalculator'].includes(t.id)
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (navQuery.trim()) {
      navigate(`/tools?q=${encodeURIComponent(navQuery.trim())}`);
      setNavQuery('');
      setIsSearchOpen(false);
    }
  };

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemTheme) || !savedTheme) {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
      if (!savedTheme) localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  // Keyboard shortcut Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Autofocus search input when modal opens
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        modalInputRef.current?.focus();
      }, 50);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Desktop main links (excluding dropdown Studios items)
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Tools', path: '/tools' },
    { name: 'AI Studio', path: '/ai' },
    { name: 'Academy', path: '/academy' },
    { name: 'Resources', path: '/blog' },
    { name: 'About', path: '/about' }
  ];

  // Mobile menu has a flat layout for easy accessibility
  const mobileNavLinks = [
    { name: 'Home', path: '/' },
    { name: 'Tools', path: '/tools' },
    { name: 'AI Studio', path: '/ai' },
    { name: 'Academy', path: '/academy' },
    { name: 'Playground', path: '/playground' },
    { name: '3D Studio', path: '/3d-printing' },
    { name: 'Math Studio', path: '/math-studio' },
    { name: 'Resources', path: '/blog' },
    { name: 'About', path: '/about' }
  ];

  const studioLinks = [
    { name: 'Playground', path: '/playground' },
    { name: '3D Studio', path: '/3d-printing' },
    { name: 'Math Studio', path: '/math-studio' }
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/70 dark:bg-zinc-950/75 backdrop-blur-md transition-all">
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center group">
          <TooliqueLogo iconSize="w-8.5 h-8.5" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.slice(0, 4).map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-xs font-semibold relative py-1 transition-colors duration-200 hover:text-zinc-900 dark:hover:text-white ${
                isActive(link.path)
                  ? 'text-zinc-900 dark:text-white'
                  : 'text-zinc-550 dark:text-zinc-400'
              }`}
            >
              {link.name}
              {isActive(link.path) && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-indigo-650 dark:bg-indigo-400" />
              )}
            </Link>
          ))}

          {/* Studios Hover Dropdown */}
          <div className="relative group/studio py-1">
            <button
              className={`flex items-center gap-1 text-xs font-semibold hover:text-zinc-900 dark:hover:text-white cursor-pointer transition-colors duration-200 ${
                studioLinks.some(s => isActive(s.path))
                  ? 'text-zinc-900 dark:text-white'
                  : 'text-zinc-550 dark:text-zinc-400'
              }`}
            >
              <span>Studios</span>
              <svg className="w-3.5 h-3.5 transform group-hover/studio:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className="absolute left-0 mt-2 w-44 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden py-1.5 opacity-0 invisible group-hover/studio:opacity-100 group-hover/studio:visible transition-all duration-200 translate-y-1 group-hover/studio:translate-y-0 z-50">
              {studioLinks.map((studio) => (
                <Link
                  key={studio.name}
                  to={studio.path}
                  className={`block px-4 py-2 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors ${
                    isActive(studio.path)
                      ? 'text-indigo-600 dark:text-indigo-455 bg-indigo-500/5'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  {studio.name}
                </Link>
              ))}
            </div>
          </div>

          {navLinks.slice(4).map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-xs font-semibold relative py-1 transition-colors duration-200 hover:text-zinc-900 dark:hover:text-white ${
                isActive(link.path)
                  ? 'text-zinc-900 dark:text-white'
                  : 'text-zinc-550 dark:text-zinc-400'
              }`}
            >
              {link.name}
              {isActive(link.path) && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-indigo-655 dark:bg-indigo-400" />
              )}
            </Link>
          ))}
        </nav>

        {/* Utility Actions */}
        <div className="flex items-center gap-4">
          {/* User Dashboard Profile */}
          <Link
            to="/dashboard"
            className="flex items-center justify-center p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-400 hover:text-zinc-955 dark:hover:text-white bg-zinc-100/50 dark:bg-zinc-900/40 hover:bg-zinc-100 dark:hover:bg-zinc-900/80 transition-all cursor-pointer"
            title="User Profile & Dashboard"
          >
            <User className="w-4.5 h-4.5" />
          </Link>

          {/* Theme Switcher - Segmented Control */}
          <div className="flex items-center p-0.5 rounded-xl bg-zinc-200/50 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800/80">
            <button
              onClick={() => { if (isDarkMode) toggleTheme(); }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 cursor-pointer ${
                !isDarkMode
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-305'
              }`}
              title="Light Mode"
            >
              <Sun className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Light</span>
            </button>
            <button
              onClick={() => { if (!isDarkMode) toggleTheme(); }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 cursor-pointer ${
                isDarkMode
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
              title="Dark Mode"
            >
              <Moon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dark</span>
            </button>
          </div>

          {/* Polished Command-Palette Search Trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/40 text-xs text-zinc-400 dark:text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-500 dark:hover:text-zinc-400 transition-all duration-200 cursor-pointer text-left w-36 sm:w-44"
          >
            <Search className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] font-semibold flex-grow truncate">Search tools...</span>
            <kbd className="hidden sm:inline-flex items-center h-4 select-none px-1 font-mono text-[9px] font-bold bg-zinc-200/50 dark:bg-zinc-800/80 text-zinc-400 border border-zinc-200/20 rounded">
              ⌘K
            </kbd>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 text-zinc-650 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Command Palette Search Overlay Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-zinc-950/40 dark:bg-zinc-950/60 backdrop-blur-xs z-50 flex items-start justify-center pt-20 px-4 animate-fadeIn">
          {/* Click outside backdrop container */}
          <div className="fixed inset-0" onClick={() => setIsSearchOpen(false)} />
          
          {/* Modal Container */}
          <div className="relative w-full max-w-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-50 animate-scaleIn animate-duration-200">
            {/* Input Row */}
            <form onSubmit={handleSearchSubmit} className="flex items-center border-b border-zinc-100 dark:border-zinc-900 px-4 py-3.5 gap-3">
              <Search className="w-5 h-5 text-zinc-400 dark:text-zinc-500 shrink-0" />
              <input
                ref={modalInputRef}
                type="text"
                value={navQuery}
                onChange={(e) => setNavQuery(e.target.value)}
                placeholder="Search tools, categories & keywords..."
                className="flex-grow bg-transparent border-none outline-none text-sm font-semibold text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600"
              />
              {navQuery && (
                <button
                  type="button"
                  onClick={() => setNavQuery('')}
                  className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-450 dark:text-zinc-500 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <kbd className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 bg-zinc-550/5 dark:bg-zinc-900/60 px-1.5 py-0.5 rounded border border-zinc-200/20 dark:border-zinc-800/40">
                ESC
              </kbd>
            </form>

            {/* Results/Suggestions Block */}
            <div className="max-h-96 overflow-y-auto p-2 space-y-1.5">
              {navQuery.trim() ? (
                <>
                  <div className="px-3.5 py-1 text-[9px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-550">
                    Search Results
                  </div>
                  {filteredSuggestions.length > 0 ? (
                    filteredSuggestions.map((tool) => (
                      <Link
                        key={tool.id}
                        to={`/tool/${tool.slug}`}
                        onClick={() => {
                          setNavQuery('');
                          setIsSearchOpen(false);
                        }}
                        className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 rounded-xl transition group text-left"
                      >
                        <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-500 group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
                          <LucideIcon name={tool.icon} className="w-4 h-4" />
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="text-xs font-bold text-zinc-800 dark:text-zinc-250 group-hover:text-indigo-650 dark:group-hover:text-indigo-400 truncate">{tool.name}</div>
                          <div className="text-[10px] text-zinc-450 dark:text-zinc-505 truncate">{tool.shortDescription}</div>
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-550 bg-zinc-150/40 dark:bg-zinc-900/60 px-2 py-0.5 rounded border border-zinc-200/20 dark:border-zinc-800/40 shrink-0">
                          {tool.category}
                        </span>
                      </Link>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-xs text-zinc-450 dark:text-zinc-500 text-center font-semibold">
                      No tools match your query. Try searching for something else!
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="px-3.5 py-1 text-[9px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-555">
                    Popular Tools
                  </div>
                  {popularDefaultTools.map((tool) => (
                    <Link
                      key={tool.id}
                      to={`/tool/${tool.slug}`}
                      onClick={() => {
                        setNavQuery('');
                        setIsSearchOpen(false);
                      }}
                      className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 rounded-xl transition group text-left"
                    >
                      <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-500 group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
                        <LucideIcon name={tool.icon} className="w-4 h-4" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="text-xs font-bold text-zinc-800 dark:text-zinc-250 group-hover:text-indigo-650 dark:group-hover:text-indigo-400 truncate">{tool.name}</div>
                        <div className="text-[10px] text-zinc-450 dark:text-zinc-505 truncate">{tool.shortDescription}</div>
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-555 bg-zinc-150/40 dark:bg-zinc-900/60 px-2 py-0.5 rounded border border-zinc-200/20 dark:border-zinc-800/40 shrink-0">
                        {tool.category}
                      </span>
                    </Link>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-955 px-4 py-4 space-y-3 shadow-lg transition-colors">
          {/* Quick Search bar triggers command palette search */}
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              setIsSearchOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2.5 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/40 text-xs text-zinc-450 dark:text-zinc-500 text-left font-semibold cursor-pointer mb-2"
          >
            <Search className="w-4 h-4 text-zinc-400" />
            <span>Search 255+ tools...</span>
          </button>
          
          {mobileNavLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`block px-3 py-2 rounded-xl text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-900 transition ${
                isActive(link.path)
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/5'
                  : 'text-zinc-655 dark:text-zinc-400'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

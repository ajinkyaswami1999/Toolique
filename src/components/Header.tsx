import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Sun, 
  Moon, 
  Search, 
  Menu, 
  X, 
  User, 
  ChevronDown,
  Code,
  IndianRupee,
  Compass,
  ShieldCheck,
  Scale,
  Printer,
  Sparkles,
  Terminal,
  GraduationCap,
  LayoutGrid,
  Home as HomeIcon,
  Info,
  HelpCircle
} from 'lucide-react';
import { toolsList } from '../data/tools';
import { TooliqueLogo } from './Logo';
import LucideIcon from './LucideIcon';
import { getToolCanonicalPath } from '../routes/AppRoutes';

export default function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
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
    ['GSTCalculator', 'SIPCalculator', 'SQLFormatter', 'JSONFormatter', 'ApiTester', 'IncomeTaxCalculator'].includes(t.id)
  );

  const activeResults = navQuery.trim() ? filteredSuggestions : popularDefaultTools;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && selectedIndex < activeResults.length) {
      const selectedTool = activeResults[selectedIndex];
      navigate(getToolCanonicalPath(selectedTool.category, selectedTool.slug));
      setNavQuery('');
      setIsSearchOpen(false);
      return;
    }
    if (navQuery.trim()) {
      navigate(`/tools?q=${encodeURIComponent(navQuery.trim())}`);
      setNavQuery('');
      setIsSearchOpen(false);
    }
  };

  // Keyboard navigation for Search Palette
  const handleKeyDownInSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < activeResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : activeResults.length - 1));
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

  // Global Keyboard shortcut Ctrl+K / Cmd+K listener
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
      setSelectedIndex(-1);
      setTimeout(() => {
        modalInputRef.current?.focus();
      }, 50);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Product Suites & Hubs in Dropdown
  const productSuites = [
    { name: 'Developer Hub', path: '/developer', icon: Code, desc: 'SQL, JSON, JWT & Web SEO Utilities', color: 'text-indigo-500' },
    { name: 'Finance & Tax Hub', path: '/finance', icon: IndianRupee, desc: 'Income Tax, SIP, Salary & Loans', color: 'text-emerald-500' },
    { name: 'Architecture & Civil', path: '/architecture', icon: Compass, desc: 'Plot Area, FSI, Concrete & BOQ', color: 'text-violet-500' },
    { name: 'QA Engineering', path: '/qa', icon: ShieldCheck, desc: 'Test Cases, BVA & XPath Locators', color: 'text-rose-500' },
    { name: 'Learning Academy', path: '/academy', icon: GraduationCap, desc: '15+ Coding Tracks & Daily Challenges', color: 'text-teal-500' },
    { name: 'Symbolic Math Studio', path: '/math-studio', icon: Scale, desc: 'Derivatives with Steps & Plots', color: 'text-amber-500' },
    { name: '3D Maker Studio', path: '/3d-print-studio', icon: Printer, desc: 'Filament Cost, AMS & Print Time', color: 'text-cyan-500' },
    { name: 'AI Studio', path: '/ai', icon: Sparkles, desc: 'Sandboxed AI Coding Assistants', color: 'text-purple-500' },
    { name: 'Code Playground', path: '/playground', icon: Terminal, desc: 'Client-side Scratchpad & Sandbox', color: 'text-blue-500' }
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const isSuiteActive = productSuites.some(s => isActive(s.path));

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/60 dark:border-zinc-800/60 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md transition-all">
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between">
        
        {/* Left: Brand Logo & Main Nav */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center group">
            <TooliqueLogo iconSize="w-8 h-8" />
          </Link>

          {/* Desktop Navigation Links: Home, All Tools, (Suites & Studios), About Toolique, Why Toolique */}
          <nav className="hidden lg:flex items-center gap-6">
            
            {/* 1. Home */}
            <Link
              to="/"
              className={`text-xs font-bold relative py-1 transition-colors duration-150 hover:text-indigo-600 dark:hover:text-indigo-400 ${
                location.pathname === '/'
                  ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              Home
              {location.pathname === '/' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
              )}
            </Link>

            {/* 2. All Tools */}
            <Link
              to="/tools"
              className={`text-xs font-bold relative py-1 transition-colors duration-150 hover:text-indigo-600 dark:hover:text-indigo-400 ${
                isActive('/tools')
                  ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              All Tools
              {isActive('/tools') && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
              )}
            </Link>

            {/* 3. Product Suites & Studios Dropdown */}
            <div className="relative group/suites py-1">
              <button
                className={`flex items-center gap-1 text-xs font-bold hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors duration-150 ${
                  isSuiteActive
                    ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <span>Suites & Studios</span>
                <ChevronDown className="w-3.5 h-3.5 transform group-hover/suites:rotate-180 transition-transform duration-200" />
              </button>

              {/* Mega Dropdown Menu */}
              <div className="absolute left-0 mt-2 w-80 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl overflow-hidden p-2 opacity-0 invisible group-hover/suites:opacity-100 group-hover/suites:visible transition-all duration-200 translate-y-1 group-hover/suites:translate-y-0 z-50">
                <div className="grid grid-cols-1 gap-1">
                  {productSuites.map((suite) => {
                    const Icon = suite.icon;
                    return (
                      <Link
                        key={suite.name}
                        to={suite.path}
                        className={`flex items-start gap-3 p-2.5 rounded-xl transition ${
                          isActive(suite.path)
                            ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                            : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 ${suite.color} shrink-0 mt-0.5`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-extrabold text-zinc-900 dark:text-white leading-tight truncate">
                            {suite.name}
                          </div>
                          <div className="text-[10px] text-zinc-450 dark:text-zinc-500 font-medium truncate mt-0.5">
                            {suite.desc}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 4. About Toolique */}
            <Link
              to="/about"
              className={`text-xs font-bold relative py-1 transition-colors duration-150 hover:text-indigo-600 dark:hover:text-indigo-400 ${
                isActive('/about') && !isActive('/about-founder')
                  ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              About Toolique
              {isActive('/about') && !isActive('/about-founder') && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
              )}
            </Link>

            {/* 5. Why Toolique */}
            <Link
              to="/why-toolique"
              className={`text-xs font-bold relative py-1 transition-colors duration-150 hover:text-indigo-600 dark:hover:text-indigo-400 ${
                isActive('/why-toolique')
                  ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              Why Toolique
              {isActive('/why-toolique') && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
              )}
            </Link>
          </nav>
        </div>

        {/* Right: Search Trigger, Workspace Dashboard & Controls */}
        <div className="flex items-center gap-3">
          
          {/* Command Palette Search Trigger Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-xs text-zinc-400 dark:text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-600 dark:hover:text-zinc-300 transition-all cursor-pointer text-left w-36 sm:w-48"
          >
            <Search className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] font-semibold flex-grow truncate">Search 270+ tools...</span>
            <kbd className="hidden sm:inline-flex items-center h-4.5 select-none px-1 font-mono text-[9px] font-bold bg-zinc-200/60 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200/40 dark:border-zinc-700 rounded">
              ⌘K
            </kbd>
          </button>

          {/* User Workspace Dashboard */}
          <Link
            to="/dashboard"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
              isActive('/dashboard')
                ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-extrabold shadow-xs'
                : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-50 dark:bg-zinc-900/40 hover:bg-zinc-100 dark:hover:bg-zinc-900'
            }`}
            title="My Workspace & Dashboard"
          >
            <User className="w-3.5 h-3.5" />
            <span className="text-xs font-bold hidden sm:inline">Workspace</span>
          </Link>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition cursor-pointer"
            title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-zinc-600" />}
          </button>

          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Command Palette Search Overlay Modal (React Portal Safe) */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs z-[9999] flex items-start justify-center pt-16 sm:pt-20 px-4 animate-fadeIn">
          {/* Click outside backdrop container */}
          <div className="fixed inset-0" onClick={() => setIsSearchOpen(false)} />
          
          {/* Modal Container */}
          <div className="relative w-full max-w-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-50 animate-scaleIn animate-duration-200">
            {/* Input Row */}
            <form onSubmit={handleSearchSubmit} className="flex items-center border-b border-zinc-100 dark:border-zinc-900 px-4 py-3.5 gap-3">
              <Search className="w-4.5 h-4.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
              <input
                ref={modalInputRef}
                type="text"
                value={navQuery}
                onChange={(e) => {
                  setNavQuery(e.target.value);
                  setSelectedIndex(-1);
                }}
                onKeyDown={handleKeyDownInSearch}
                placeholder="Search tools, formulas, SQL, JSON, tax, 3D printing..."
                className="flex-grow bg-transparent border-none outline-none text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600"
              />
              {navQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setNavQuery('');
                    setSelectedIndex(-1);
                  }}
                  className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <kbd className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800">
                ESC
              </kbd>
            </form>

            {/* Results/Suggestions Block */}
            <div className="max-h-96 overflow-y-auto p-2 space-y-1">
              <div className="px-3.5 py-1 text-[9px] font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-500">
                {navQuery.trim() ? 'Search Results' : 'Frequently Used Tools'}
              </div>

              {activeResults.length > 0 ? (
                activeResults.map((tool, idx) => {
                  const isHighlighted = idx === selectedIndex;
                  return (
                    <Link
                      key={tool.id}
                      to={getToolCanonicalPath(tool.category, tool.slug)}
                      onClick={() => {
                        setNavQuery('');
                        setIsSearchOpen(false);
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition text-left ${
                        isHighlighted
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300'
                          : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/50 text-zinc-800 dark:text-zinc-200'
                      }`}
                    >
                      <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-500 shrink-0">
                        <LucideIcon name={tool.icon} className="w-4 h-4" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                          {tool.name}
                        </div>
                        <div className="text-[10px] text-zinc-450 dark:text-zinc-500 truncate">
                          {tool.shortDescription}
                        </div>
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded border border-zinc-200/50 dark:border-zinc-800 shrink-0">
                        {tool.category}
                      </span>
                    </Link>
                  );
                })
              ) : (
                <div className="px-4 py-8 text-xs text-zinc-400 dark:text-zinc-500 text-center font-medium">
                  No tools matched "{navQuery}". Press Enter to view search results page.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-4 space-y-4 shadow-xl max-h-[85vh] overflow-y-auto">
          {/* Search Trigger */}
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              setIsSearchOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2.5 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-xs text-zinc-500 text-left font-semibold cursor-pointer"
          >
            <Search className="w-4 h-4 text-zinc-400" />
            <span>Search 270+ tools...</span>
          </button>

          {/* Mobile Main Links */}
          <div className="space-y-1">
            <Link
              to="/"
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                location.pathname === '/' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' : 'text-zinc-700 dark:text-zinc-300'
              }`}
            >
              <HomeIcon className="w-4 h-4" />
              <span>Home</span>
            </Link>

            <Link
              to="/tools"
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                isActive('/tools') ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' : 'text-zinc-700 dark:text-zinc-300'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>All 270+ Tools</span>
            </Link>

            <Link
              to="/dashboard"
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                isActive('/dashboard') ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' : 'text-zinc-700 dark:text-zinc-300'
              }`}
            >
              <User className="w-4 h-4" />
              <span>My Workspace & Dashboard</span>
            </Link>

            <Link
              to="/about"
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                isActive('/about') ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' : 'text-zinc-700 dark:text-zinc-300'
              }`}
            >
              <Info className="w-4 h-4" />
              <span>About Toolique</span>
            </Link>

            <Link
              to="/why-toolique"
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                isActive('/why-toolique') ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' : 'text-zinc-700 dark:text-zinc-300'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Why Toolique</span>
            </Link>
          </div>

          {/* Mobile Suites Section */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900 space-y-1">
            <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-zinc-400">
              Product Suites & Studios
            </div>
            {productSuites.map((suite) => {
              const Icon = suite.icon;
              return (
                <Link
                  key={suite.name}
                  to={suite.path}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                    isActive(suite.path)
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${suite.color}`} />
                  <span>{suite.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}

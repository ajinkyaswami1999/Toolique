import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Search, Menu, X, Layers } from 'lucide-react';

export default function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
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

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'All Tools', path: '/#tools-section' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    if (path.startsWith('/#')) return false; // Anchor links
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex items-center justify-center w-9.5 h-9.5 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 text-white shadow-md shadow-teal-500/25">
            <Layers className="w-5 h-5" />
          </div>
          <span className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
            Toolique<span className="text-teal-600 dark:text-teal-400">.in</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-sm font-semibold transition-colors duration-200 hover:text-teal-600 dark:hover:text-teal-400 ${
                isActive(link.path)
                  ? 'text-teal-600 dark:text-teal-400'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Utility Actions */}
        <div className="flex items-center gap-4">
          {/* Theme Switcher - Premium Segmented Control */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800/80 transition-colors duration-300">
            <button
              onClick={() => { if (isDarkMode) toggleTheme(); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                !isDarkMode
                  ? 'bg-white dark:bg-slate-800 text-teal-650 dark:text-teal-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Light</span>
            </button>
            <button
              onClick={() => { if (!isDarkMode) toggleTheme(); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                isDarkMode
                  ? 'bg-white dark:bg-slate-800 text-teal-650 dark:text-teal-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dark</span>
            </button>
          </div>

          {/* Quick Search Link */}
          <Link
            to="/#tools-section"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Tools</span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl border border-slate-200/80 dark:border-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-4 space-y-3 shadow-lg transition-colors">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`block px-3 py-2 rounded-xl text-base font-semibold hover:bg-slate-50 dark:hover:bg-slate-900 transition ${
                isActive(link.path)
                  ? 'text-teal-600 dark:text-teal-400 bg-teal-500/5'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <Link
            to="/#tools-section"
            className="flex items-center justify-center gap-2 w-full mt-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-semibold text-sm transition shadow-sm shadow-teal-600/15"
          >
            <Search className="w-4 h-4" />
            <span>Search all tools</span>
          </Link>
        </div>
      )}
    </header>
  );
}


import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Search, Menu, X, Command } from 'lucide-react';

export default function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Default to dark mode if no theme saved (dark-first)
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

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Directory', path: '/#tools-section' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    if (path.startsWith('/#')) return false; // Anchor links
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/70 dark:bg-zinc-950/75 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex items-center justify-center w-8.5 h-8.5 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 transition-transform duration-300 group-hover:rotate-12">
            <Command className="w-4.5 h-4.5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
            Toolique<span className="text-indigo-600 dark:text-indigo-400">.in</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-xs font-semibold relative py-1 transition-colors duration-200 hover:text-zinc-900 dark:hover:text-white ${
                isActive(link.path)
                  ? 'text-zinc-900 dark:text-white'
                  : 'text-zinc-500 dark:text-zinc-400'
              }`}
            >
              {link.name}
              {isActive(link.path) && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
              )}
            </Link>
          ))}
        </nav>

        {/* Utility Actions */}
        <div className="flex items-center gap-4">
          {/* Theme Switcher - Segmented Control */}
          <div className="flex items-center p-0.5 rounded-xl bg-zinc-200/50 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800/80">
            <button
              onClick={() => { if (isDarkMode) toggleTheme(); }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 cursor-pointer ${
                !isDarkMode
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
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

          {/* Quick Search Link */}
          <a
            href="#tools-section"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
          >
            <Search className="w-3 h-3" />
            <span>Search</span>
          </a>

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

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-4 space-y-3 shadow-lg transition-colors">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`block px-3 py-2 rounded-xl text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-900 transition ${
                isActive(link.path)
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/5'
                  : 'text-zinc-650 dark:text-zinc-400'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <a
            href="#tools-section"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center justify-center gap-2 w-full mt-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition shadow-sm"
          >
            <Search className="w-4 h-4" />
            <span>Search directory</span>
          </a>
        </div>
      )}
    </header>
  );
}

import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sun, Moon, Search, Menu, X, Command, User } from 'lucide-react';
import { toolsList } from '../data/tools';

export default function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const [navQuery, setNavQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredSuggestions = navQuery.trim()
    ? toolsList.filter(tool =>
        (tool.name || '').toLowerCase().includes(navQuery.toLowerCase()) ||
        (tool.category || '').toLowerCase().includes(navQuery.toLowerCase()) ||
        (tool.shortDescription || '').toLowerCase().includes(navQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (navQuery.trim()) {
      navigate(`/tools?q=${encodeURIComponent(navQuery.trim())}`);
      setNavQuery('');
      setIsOpen(false);
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

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Tools', path: '/tools' },
    { name: 'AI Studio', path: '/ai' },
    { name: 'Academy', path: '/academy' },
    { name: 'Playground', path: '/playground' },
    { name: '3D Studio', path: '/3d-printing' },
    { name: 'Resources', path: '/blog' },
    { name: 'About Toolique', path: '/about' },
    { name: 'About Founder', path: '/about-founder' },
    { name: 'Contact', path: '/contact' }
  ];

  const isActive = (path: string) => {
    if (path === '/tools') return location.pathname === '/tools' || location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/70 dark:bg-zinc-950/75 backdrop-blur-md transition-all">
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex items-center justify-center w-8.5 h-8.5 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 transition-transform duration-300 group-hover:rotate-12">
            <Command className="w-4.5 h-4.5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
            Toolique
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
          {/* User Dashboard Profile */}
          <Link
            to="/dashboard"
            className="flex items-center justify-center p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white bg-zinc-100/50 dark:bg-zinc-900/40 hover:bg-zinc-100 dark:hover:bg-zinc-900/80 transition-all cursor-pointer"
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

          {/* Quick Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative hidden sm:block">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/40 text-xs text-zinc-500 dark:text-zinc-400 focus-within:border-indigo-500 transition-all duration-200">
              <Search className="w-3.5 h-3.5" />
              <input
                type="text"
                placeholder="Search tools..."
                value={navQuery}
                onChange={(e) => {
                  setNavQuery(e.target.value);
                  setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                className="bg-transparent border-none outline-none text-[11px] w-24 focus:w-40 transition-all duration-200 text-zinc-900 dark:text-zinc-100 font-semibold placeholder-zinc-400 dark:placeholder-zinc-650"
              />
            </div>

            {/* Autocomplete Dropdown */}
            {isOpen && navQuery.trim() && (
              <div className="absolute right-0 mt-2 w-64 max-h-72 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-y-auto py-2 z-50">
                {filteredSuggestions.length > 0 ? (
                  filteredSuggestions.map((tool) => (
                    <Link
                      key={tool.id}
                      to={`/tool/${tool.slug}`}
                      onClick={() => {
                        setNavQuery('');
                        setIsOpen(false);
                      }}
                      className="flex flex-col px-3.5 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-left transition"
                    >
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-250">{tool.name}</span>
                      <span className="text-[10px] text-zinc-400 capitalize mt-0.5">{tool.category}</span>
                    </Link>
                  ))
                ) : (
                  <div className="px-3.5 py-2 text-xs text-zinc-400 dark:text-zinc-550 text-center">No tools found</div>
                )}
              </div>
            )}
          </form>

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
                  : 'text-zinc-655 dark:text-zinc-400'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (navQuery.trim()) {
                navigate(`/?q=${encodeURIComponent(navQuery.trim())}`);
                setNavQuery('');
                setIsMobileMenuOpen(false);
              }
            }}
            className="relative w-full mt-2"
          >
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search directory..."
              value={navQuery}
              onChange={(e) => setNavQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/40 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 font-semibold placeholder-zinc-400 dark:placeholder-zinc-650"
            />
          </form>
        </div>
      )}
    </header>
  );
}

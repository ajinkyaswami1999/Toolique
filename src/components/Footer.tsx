import { Link } from 'react-router-dom';
import { Layers, Heart, Mail, Shield, AlertTriangle, FileText } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-500 to-indigo-600 text-white">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-lg font-black tracking-tight text-slate-800 dark:text-white">
                Toolique<span className="text-teal-600 dark:text-teal-400">.in</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              Toolique provides a collection of free, high-performance web-based calculators and utility tools designed specifically for Indian professionals, developers, and students.
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              All tools run 100% locally in your web browser. No data is sent to our servers.
            </p>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-white tracking-widest uppercase mb-4">
              Categories
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/#tools-section" className="hover:text-teal-600 dark:hover:text-teal-400 transition">
                  Financial Calculators
                </Link>
              </li>
              <li>
                <Link to="/#tools-section" className="hover:text-teal-600 dark:hover:text-teal-400 transition">
                  Developer Utilities
                </Link>
              </li>
              <li>
                <Link to="/#tools-section" className="hover:text-teal-600 dark:hover:text-teal-400 transition">
                  Image Optimizers
                </Link>
              </li>
              <li>
                <Link to="/#tools-section" className="hover:text-teal-600 dark:hover:text-teal-400 transition">
                  General Utilities
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Policy Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-white tracking-widest uppercase mb-4">
              Legal & Support
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="hover:text-teal-600 dark:hover:text-teal-400 transition flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-teal-600 dark:hover:text-teal-400 transition flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-teal-600 dark:hover:text-teal-400 transition flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-conditions" className="hover:text-teal-600 dark:hover:text-teal-400 transition flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="hover:text-teal-600 dark:hover:text-teal-400 transition flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Disclaimer
                </Link>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-200/60 dark:border-slate-800/60 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 dark:text-slate-500">
          <div>
            &copy; {currentYear} Toolique. All Rights Reserved.
          </div>
          <div className="flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-rose-500 fill-rose-500 animate-pulse" /> in India
          </div>
        </div>
      </div>
    </footer>
  );
}


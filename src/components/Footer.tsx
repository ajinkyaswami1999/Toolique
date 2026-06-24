import { Link } from 'react-router-dom';
import { Heart, Mail, Shield, AlertTriangle, FileText, Command } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200/80 dark:border-zinc-900 bg-zinc-100/30 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 transition-colors duration-300">
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900">
                <Command className="w-4.5 h-4.5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
                Toolique
              </span>
            </Link>
            <p className="text-xs text-zinc-400 dark:text-zinc-550 max-w-sm leading-relaxed">
              Toolique is a modern collection of browser-based utilities built for developers, architects, designers, and students.
            </p>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-550">
              Security by default: calculations execute entirely client-side. No user data is sent or logged.
            </p>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-[10px] font-bold text-zinc-900 dark:text-zinc-300 tracking-wider uppercase mb-4">
              All Tools
            </h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link to="/?category=civil" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Civil Engineering
                </Link>
              </li>
              <li>
                <Link to="/?category=architecture" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Architecture Suite
                </Link>
              </li>
              <li>
                <Link to="/?category=pdf" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  PDF Utilities
                </Link>
              </li>
              <li>
                <Link to="/?category=developer" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Developer Tools
                </Link>
              </li>
              <li>
                <Link to="/?category=image" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Image Tools
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Policy Links */}
          <div>
            <h4 className="text-[10px] font-bold text-zinc-900 dark:text-zinc-300 tracking-wider uppercase mb-4">
              Resources & Privacy
            </h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link to="/about" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Contact support
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-conditions" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Disclaimer
                </Link>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-zinc-200/60 dark:border-zinc-800/80 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-400 dark:text-zinc-550">
          <div>
            &copy; {currentYear} Toolique. All rights reserved.
          </div>
          <div className="flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> in India
          </div>
        </div>
      </div>
    </footer>
  );
}

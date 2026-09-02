import { useState, useEffect } from 'react';
import { 
  Languages, 
  X, 
  Check, 
  Search, 
  Globe, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

export interface Language {
  code: string;
  nativeName: string;
  englishName: string;
  region: string;
}

export const INDIAN_LANGUAGES: Language[] = [
  { code: 'en', nativeName: 'English', englishName: 'English', region: 'Global / India' },
  { code: 'hi', nativeName: 'हिन्दी', englishName: 'Hindi', region: 'India (Official)' },
  { code: 'mr', nativeName: 'मराठी', englishName: 'Marathi', region: 'Maharashtra' },
  { code: 'gu', nativeName: 'ગુજરાતી', englishName: 'Gujarati', region: 'Gujarat' },
  { code: 'ta', nativeName: 'தமிழ்', englishName: 'Tamil', region: 'Tamil Nadu' },
  { code: 'te', nativeName: 'తెలుగు', englishName: 'Telugu', region: 'Andhra Pradesh & Telangana' },
  { code: 'kn', nativeName: 'ಕನ್ನಡ', englishName: 'Kannada', region: 'Karnataka' },
  { code: 'bn', nativeName: 'বাংলা', englishName: 'Bengali', region: 'West Bengal' },
  { code: 'ml', nativeName: 'മലയാളം', englishName: 'Malayalam', region: 'Kerala' },
  { code: 'pa', nativeName: 'ਪੰਜਾਬੀ', englishName: 'Punjabi', region: 'Punjab' },
  { code: 'or', nativeName: 'ଓଡ଼ିଆ', englishName: 'Odia', region: 'Odisha' },
  { code: 'ur', nativeName: 'اردو', englishName: 'Urdu', region: 'National' },
  { code: 'as', nativeName: 'অসমীয়া', englishName: 'Assamese', region: 'Assam' },
  { code: 'sa', nativeName: 'संस्कृतम्', englishName: 'Sanskrit', region: 'Classical India' }
];

interface LanguagePanelProps {
  onClose: () => void;
}

export function initGoogleTranslate() {
  if (typeof window === 'undefined') return;

  if (!document.getElementById('google-translate-script')) {
    (window as any).googleTranslateElementInit = () => {
      if ((window as any).google && (window as any).google.translate) {
        new (window as any).google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,hi,mr,gu,ta,te,kn,bn,ml,pa,or,ur,as,sa',
            autoDisplay: false
          },
          'google_translate_element'
        );
      }
    };

    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);
  }
}

export function getActiveLanguage(): string {
  if (typeof window === 'undefined') return 'en';
  const saved = localStorage.getItem('toolique_selected_lang');
  if (saved) return saved;

  const match = document.cookie.match(/googtrans=\/en\/([a-zA-Z_-]+)/);
  if (match && match[1]) return match[1];

  return 'en';
}

export function setWebsiteLanguage(langCode: string) {
  if (typeof window === 'undefined') return;

  if (langCode === 'en') {
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname + ';';
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.' + window.location.hostname + ';';
    localStorage.removeItem('toolique_selected_lang');
    window.location.reload();
    return;
  }

  const cookieVal = `/en/${langCode}`;
  document.cookie = `googtrans=${cookieVal}; path=/;`;
  document.cookie = `googtrans=${cookieVal}; path=/; domain=${window.location.hostname};`;
  document.cookie = `googtrans=${cookieVal}; path=/; domain=.${window.location.hostname};`;
  localStorage.setItem('toolique_selected_lang', langCode);

  const selectElem = document.querySelector<HTMLSelectElement>('.goog-te-combo');
  if (selectElem) {
    selectElem.value = langCode;
    selectElem.dispatchEvent(new Event('change'));
  } else {
    window.location.reload();
  }
}

export default function LanguagePanel({ onClose }: LanguagePanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLang, setCurrentLang] = useState<string>('en');
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    initGoogleTranslate();
    setCurrentLang(getActiveLanguage());
  }, []);

  const handleSelectLang = (langCode: string) => {
    if (langCode === currentLang) {
      onClose();
      return;
    }
    setIsChanging(true);
    setCurrentLang(langCode);
    setTimeout(() => {
      setWebsiteLanguage(langCode);
    }, 150);
  };

  const filteredLanguages = INDIAN_LANGUAGES.filter(l =>
    l.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeLangObj = INDIAN_LANGUAGES.find(l => l.code === currentLang) || INDIAN_LANGUAGES[0];

  return (
    <div className="toolique-language-panel fixed bottom-24 right-6 sm:bottom-26 sm:right-8 z-[95] w-[92vw] sm:w-[420px] max-h-[82vh] bg-white/95 dark:bg-zinc-950/95 border border-zinc-200/90 dark:border-zinc-800/90 rounded-3xl shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden animate-scaleIn select-none">
      
      {/* Panel Header */}
      <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-850 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/30">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Languages className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-zinc-900 dark:text-white flex items-center gap-1.5">
              <span>Select Language</span>
              <span className="text-zinc-400 text-xs font-normal">/ भाषा</span>
            </h3>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
              Translate entire Toolique website into your native language
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition cursor-pointer"
          aria-label="Close Language Selector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Active Language Ribbon */}
      <div className="px-4 py-2.5 bg-blue-500/5 dark:bg-blue-500/10 border-b border-blue-500/10 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold">
          <Globe className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '10s' }} />
          <span>Active: <strong className="font-black">{activeLangObj.nativeName} ({activeLangObj.englishName})</strong></span>
        </div>
        {currentLang !== 'en' && (
          <button
            type="button"
            onClick={() => handleSelectLang('en')}
            className="inline-flex items-center gap-1 text-[10px] font-black text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset to English</span>
          </button>
        )}
      </div>

      {/* Search Filter */}
      <div className="p-3 border-b border-zinc-100 dark:border-zinc-850">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search language (e.g. Hindi, Marathi, தமிழ், বাংলা)..."
            className="w-full pl-8.5 pr-3 py-1.5 rounded-xl bg-zinc-100/70 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800 text-xs font-semibold text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500 transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Language List Grid */}
      <div className="overflow-y-auto p-3 max-h-[50vh] space-y-1.5 divide-y-0">
        {filteredLanguages.map((lang) => {
          const isSelected = lang.code === currentLang;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleSelectLang(lang.code)}
              disabled={isChanging}
              className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left cursor-pointer group ${
                isSelected
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 shadow-xs'
                  : 'border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/30 hover:bg-zinc-100/80 dark:hover:bg-zinc-850/80 hover:border-blue-300 dark:hover:border-blue-800'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-transform group-hover:scale-105 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                }`}>
                  {lang.code.toUpperCase()}
                </div>
                <div className="truncate">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-black text-zinc-900 dark:text-white">
                      {lang.nativeName}
                    </span>
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      ({lang.englishName})
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-400 font-medium truncate mt-0.5">
                    {lang.region}
                  </div>
                </div>
              </div>

              {isSelected ? (
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              ) : (
                <span className="text-[10px] font-bold text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Translate →
                </span>
              )}
            </button>
          );
        })}

        {filteredLanguages.length === 0 && (
          <div className="p-8 text-center text-xs text-zinc-400">
            No language matching "{searchQuery}" found.
          </div>
        )}
      </div>

      {/* Footer Note */}
      <div className="p-3 border-t border-zinc-100 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-between text-[10px] text-zinc-400">
        <span className="flex items-center gap-1 font-semibold">
          <Sparkles className="w-3 h-3 text-blue-500" />
          <span>Real-time in-browser translation</span>
        </span>
        <span className="font-bold text-zinc-500">14 Native Languages</span>
      </div>
    </div>
  );
}

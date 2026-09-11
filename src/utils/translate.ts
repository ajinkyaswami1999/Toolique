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
  try {
    const saved = localStorage.getItem('toolique_selected_lang');
    if (saved) return saved;

    if (typeof document !== 'undefined' && document.cookie) {
      const match = document.cookie.match(/googtrans=\/en\/([a-zA-Z_-]+)/);
      if (match && match[1]) {
        return match[1];
      }
    }
  } catch {
    // Fail silently in restricted storage environments
  }

  return 'en';
}

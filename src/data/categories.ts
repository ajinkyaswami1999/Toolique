export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  colorClass: string; // for custom badges/borders
}

export const categories: Category[] = [
  {
    id: 'finance',
    name: 'Finance',
    description: 'Calculate GST, SIP, EMI, TDS, and in-hand salary options easily.',
    icon: 'IndianRupee',
    colorClass: 'from-emerald-400/20 to-teal-400/20 text-emerald-800 dark:text-emerald-300 border-emerald-300/40 shadow-xs'
  },
  {
    id: 'civil',
    name: 'Civil Engineering',
    description: 'Calculate concrete, bricks, steel weight, BOQs, and structural dimensions.',
    icon: 'Hammer',
    colorClass: 'from-sky-400/20 to-cyan-400/20 text-sky-800 dark:text-sky-300 border-sky-300/40 shadow-xs'
  },
  {
    id: 'architecture',
    name: 'Architecture',
    description: 'Design stairs, estimate paint/wallpaper, and calculate FAR/FSI plot clearances.',
    icon: 'Compass',
    colorClass: 'from-violet-400/20 to-purple-400/20 text-violet-800 dark:text-violet-300 border-violet-300/40 shadow-xs'
  },
  {
    id: 'interior',
    name: 'Interior Design',
    description: 'Estimate material and installation costs for modular kitchens, wardrobes, ceilings, and flooring.',
    icon: 'Palette',
    colorClass: 'from-rose-400/20 to-pink-400/20 text-rose-800 dark:text-rose-300 border-rose-300/40 shadow-xs'
  },
  {
    id: 'electrical',
    name: 'Electrical Engineering',
    description: 'Calculate voltage drop, cable sizes, load demands, solar PV capacity, and battery backups.',
    icon: 'Zap',
    colorClass: 'from-amber-400/20 to-yellow-400/20 text-amber-800 dark:text-amber-300 border-amber-300/40 shadow-xs'
  },
  {
    id: 'pdf',
    name: 'PDF Tools',
    description: 'Merge, split, compress, protect, unlock, watermark, and convert PDF files directly in your browser.',
    icon: 'FileText',
    colorClass: 'from-rose-400/20 to-orange-400/20 text-rose-800 dark:text-rose-300 border-rose-300/40 shadow-xs'
  },
  {
    id: 'image',
    name: 'Image Tools',
    description: 'Compress, optimize, crop, resize and adjust images directly in your browser.',
    icon: 'Image',
    colorClass: 'from-fuchsia-400/20 to-purple-400/20 text-fuchsia-800 dark:text-fuchsia-300 border-fuchsia-300/40 shadow-xs'
  },
  {
    id: 'developer',
    name: 'Developer Tools',
    description: 'Format SQL, beautify/validate JSON, decode JWT, and test regular expressions.',
    icon: 'Code',
    colorClass: 'from-indigo-400/20 to-blue-400/20 text-indigo-800 dark:text-indigo-300 border-indigo-300/40 shadow-xs'
  },
  {
    id: 'web',
    name: 'Web Tools',
    description: 'Generate meta tags, OG previews, robots.txt, sitemaps, and minify code assets.',
    icon: 'Globe',
    colorClass: 'from-cyan-400/20 to-teal-400/20 text-cyan-800 dark:text-cyan-300 border-cyan-300/40 shadow-xs'
  },
  {
    id: 'text',
    name: 'Text Tools',
    description: 'Count words, convert cases, reverse strings, and perform text comparisons or diff checks.',
    icon: 'Type',
    colorClass: 'from-slate-400/20 to-zinc-400/20 text-slate-800 dark:text-slate-300 border-slate-300/40 shadow-xs'
  },
  {
    id: 'social',
    name: 'Social Media Tools',
    description: 'Generate captions, hashtags, bio lines, and resize media for Instagram, YouTube, and Facebook.',
    icon: 'Share2',
    colorClass: 'from-pink-400/20 to-rose-400/20 text-pink-800 dark:text-pink-300 border-pink-300/40 shadow-xs'
  },
  {
    id: 'datetime',
    name: 'Date & Time',
    description: 'Calculate age, working experience, duration between dates, and count business days.',
    icon: 'Calendar',
    colorClass: 'from-teal-400/20 to-emerald-400/20 text-teal-800 dark:text-teal-300 border-teal-300/40 shadow-xs'
  },
  {
    id: 'unit',
    name: 'Unit Converters',
    description: 'Convert length, area, volume, weight, speed, temperature, digital storage, and angles.',
    icon: 'Scale',
    colorClass: 'from-blue-400/20 to-indigo-400/20 text-blue-800 dark:text-blue-300 border-blue-300/40 shadow-xs'
  },
  {
    id: 'security',
    name: 'Security',
    description: 'Generate secure passwords, test password strength, compute cryptographic hashes, and build secure UPI QR codes.',
    icon: 'Lock',
    colorClass: 'from-amber-400/20 to-orange-400/20 text-amber-800 dark:text-amber-300 border-amber-300/40 shadow-xs'
  },
  {
    id: 'student',
    name: 'Student Tools',
    description: 'Calculate GPA, CGPA, percentages, attendance targets, and view exam countdown timers.',
    icon: 'GraduationCap',
    colorClass: 'from-lime-400/20 to-green-400/20 text-lime-800 dark:text-lime-300 border-lime-300/40 shadow-xs'
  },
  {
    id: 'automobile',
    name: 'Automobile',
    description: 'Calculate vehicle mileage, fuel budgets, road trip expenses, and EV charging costs.',
    icon: 'Car',
    colorClass: 'from-rose-400/20 to-orange-400/20 text-rose-800 dark:text-rose-300 border-rose-300/40 shadow-xs'
  },
  {
    id: 'business',
    name: 'Business Tools',
    description: 'Compute profit margins, discounts, break-even metrics, currency exchanges, and invoice formats.',
    icon: 'Briefcase',
    colorClass: 'from-purple-400/20 to-indigo-400/20 text-purple-800 dark:text-purple-300 border-purple-300/40 shadow-xs'
  },
  {
    id: 'health',
    name: 'Health',
    description: 'Track BMI, basal metabolic rate (BMR), calorie requirements, and daily water intake targets.',
    icon: 'Heart',
    colorClass: 'from-emerald-400/20 to-green-400/20 text-emerald-800 dark:text-emerald-300 border-emerald-300/40 shadow-xs'
  },
  {
    id: '3d-printing',
    name: '3D Printing',
    description: 'Calculate filament costs, print pricing, resin volume, print farm capacity, and Bambu Lab AMS templates.',
    icon: 'Printer',
    colorClass: 'from-cyan-400/20 to-blue-400/20 text-cyan-800 dark:text-cyan-300 border-cyan-300/40 shadow-xs'
  },
  {
    id: 'math-studio',
    name: 'Advanced Math Studio',
    description: 'Solve equations, analyze data, calculate geometry, convert engineering units, and explore advanced mathematics.',
    icon: 'Calculator',
    colorClass: 'from-amber-400/20 to-orange-400/20 text-amber-800 dark:text-amber-300 border-amber-300/40 shadow-xs'
  },
  {
    id: 'qa',
    name: 'QA Engineering',
    description: 'Generate test cases, mock data, bug reports, and test parameters.',
    icon: 'ShieldAlert',
    colorClass: 'from-rose-400/20 to-pink-400/20 text-rose-800 dark:text-rose-300 border-rose-300/40 shadow-xs'
  },
  {
    id: 'economics',
    name: 'Economics Suite',
    description: 'Solve micro and macro economics formulas, price elasticity, GDP growth, inflation rate, break-even, and market equilibrium.',
    icon: 'TrendingUp',
    colorClass: 'from-blue-400/20 to-indigo-400/20 text-blue-800 dark:text-blue-300 border-blue-300/40 shadow-xs'
  }
];

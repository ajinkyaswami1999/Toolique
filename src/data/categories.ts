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
    colorClass: 'from-emerald-500/10 to-teal-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
  },
  {
    id: 'civil',
    name: 'Civil Engineering',
    description: 'Calculate concrete, bricks, steel weight, BOQs, and structural dimensions.',
    icon: 'Hammer',
    colorClass: 'from-blue-500/10 to-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20'
  },
  {
    id: 'architecture',
    name: 'Architecture',
    description: 'Design stairs, estimate paint/wallpaper, and calculate FAR/FSI plot clearances.',
    icon: 'Compass',
    colorClass: 'from-violet-500/10 to-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20'
  },
  {
    id: 'interior',
    name: 'Interior Design',
    description: 'Estimate material and installation costs for modular kitchens, wardrobes, ceilings, and flooring.',
    icon: 'Palette',
    colorClass: 'from-pink-500/10 to-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20'
  },
  {
    id: 'electrical',
    name: 'Electrical Engineering',
    description: 'Calculate voltage drop, cable sizes, load demands, solar PV capacity, and battery backups.',
    icon: 'Zap',
    colorClass: 'from-yellow-500/10 to-amber-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20'
  },
  {
    id: 'pdf',
    name: 'PDF Tools',
    description: 'Merge, split, compress, protect, unlock, watermark, and convert PDF files directly in your browser.',
    icon: 'FileText',
    colorClass: 'from-red-500/10 to-orange-500/10 text-red-700 dark:text-red-400 border-red-500/20'
  },
  {
    id: 'image',
    name: 'Image Tools',
    description: 'Compress, optimize, crop, resize and adjust images directly in your browser.',
    icon: 'Image',
    colorClass: 'from-purple-500/10 to-pink-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20'
  },
  {
    id: 'developer',
    name: 'Developer Tools',
    description: 'Format SQL, beautify/validate JSON, decode JWT, and test regular expressions.',
    icon: 'Code',
    colorClass: 'from-blue-500/10 to-indigo-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20'
  },
  {
    id: 'web',
    name: 'Web Tools',
    description: 'Generate meta tags, OG previews, robots.txt, sitemaps, and minify code assets.',
    icon: 'Globe',
    colorClass: 'from-sky-500/10 to-blue-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20'
  },
  {
    id: 'text',
    name: 'Text Tools',
    description: 'Count words, convert cases, reverse strings, and perform text comparisons or diff checks.',
    icon: 'Type',
    colorClass: 'from-stone-500/10 to-neutral-500/10 text-stone-700 dark:text-stone-400 border-stone-500/20'
  },
  {
    id: 'social',
    name: 'Social Media Tools',
    description: 'Generate captions, hashtags, bio lines, and resize media for Instagram, YouTube, and Facebook.',
    icon: 'Share2',
    colorClass: 'from-indigo-500/10 to-pink-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20'
  },
  {
    id: 'datetime',
    name: 'Date & Time',
    description: 'Calculate age, working experience, duration between dates, and count business days.',
    icon: 'Calendar',
    colorClass: 'from-amber-500/10 to-yellow-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
  },
  {
    id: 'unit',
    name: 'Unit Converters',
    description: 'Convert length, area, volume, weight, speed, temperature, digital storage, and angles.',
    icon: 'Scale',
    colorClass: 'from-teal-500/10 to-cyan-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20'
  },
  {
    id: 'security',
    name: 'Security',
    description: 'Generate secure passwords, test password strength, compute cryptographic hashes, and build secure UPI QR codes.',
    icon: 'Lock',
    colorClass: 'from-red-500/10 to-rose-500/10 text-red-700 dark:text-red-450 border-red-500/20'
  },
  {
    id: 'student',
    name: 'Student Tools',
    description: 'Calculate GPA, CGPA, percentages, attendance targets, and view exam countdown timers.',
    icon: 'GraduationCap',
    colorClass: 'from-fuchsia-500/10 to-purple-500/10 text-fuchsia-700 dark:text-fuchsia-400 border-fuchsia-500/20'
  },
  {
    id: 'automobile',
    name: 'Automobile',
    description: 'Calculate vehicle mileage, fuel budgets, road trip expenses, and EV charging costs.',
    icon: 'Car',
    colorClass: 'from-orange-500/10 to-red-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20'
  },
  {
    id: 'business',
    name: 'Business Tools',
    description: 'Compute profit margins, discounts, break-even metrics, currency exchanges, and invoice formats.',
    icon: 'Briefcase',
    colorClass: 'from-lime-500/10 to-emerald-500/10 text-emerald-800 dark:text-emerald-400 border-lime-500/20'
  },
  {
    id: 'health',
    name: 'Health',
    description: 'Track BMI, basal metabolic rate (BMR), calorie requirements, and daily water intake targets.',
    icon: 'Heart',
    colorClass: 'from-rose-500/10 to-pink-500/10 text-rose-700 dark:text-rose-455 border-rose-500/20'
  },
  {
    id: '3d-printing',
    name: '3D Printing',
    description: 'Calculate filament costs, print pricing, resin volume, print farm capacity, and Bambu Lab AMS templates.',
    icon: 'Printer',
    colorClass: 'from-indigo-500/10 to-blue-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20'
  }
];

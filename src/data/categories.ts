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
    description: 'Calculate GST, SIP, EMI, TDS, and In-hand salary options easily.',
    icon: 'IndianRupee',
    colorClass: 'from-emerald-500/10 to-teal-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
  },
  {
    id: 'developer',
    name: 'Developer',
    description: 'Format SQL, beautify/validate JSON, and optimize your code inputs.',
    icon: 'Code',
    colorClass: 'from-blue-500/10 to-indigo-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20'
  },
  {
    id: 'image',
    name: 'Image Tools',
    description: 'Compress, optimize and adjust images directly in your browser.',
    icon: 'Image',
    colorClass: 'from-purple-500/10 to-pink-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20'
  },
  {
    id: 'utility',
    name: 'Utility',
    description: 'Generate standard QR codes, UPI links, calculate age, experience, and more.',
    icon: 'Sliders',
    colorClass: 'from-amber-500/10 to-orange-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
  },
  {
    id: 'civil',
    name: 'Civil Engineering',
    description: 'Calculate concrete, bricks, steel weight, BOQs, and structural dimensions u/s industry standards.',
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
    id: 'pdf',
    name: 'PDF Tools',
    description: 'Merge, split, compress, protect, unlock, watermark, and convert PDF files directly in your browser.',
    icon: 'FileText',
    colorClass: 'from-red-500/10 to-orange-500/10 text-red-700 dark:text-red-400 border-red-500/20'
  }
];

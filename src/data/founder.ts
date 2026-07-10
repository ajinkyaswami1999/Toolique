import {
  Award,
  Code,
  Zap,
  Layers,
  Cpu,
  Sparkles,
  Target,
  BookOpen,
  Smartphone,
  Clock,
  Users,
  Shield,
  Globe,
  Box,
  Calculator,
  Wrench,
  Database
} from 'lucide-react';
import { socialLinks } from '../config/socialLinks';
import type {
  Milestone,
  BuildCategory,
  SkillCategory,
  Project,
  CoreValue,
  FunFact,
  TrustMetric,
  AboutHighlight,
  Brand
} from '../types/founder';

export const rotatingSubtitles: string[] = [
  'QA Automation Engineer',
  'AI Builder',
  '3D Printing Enthusiast',
  'Founder of Toolique'
];

export const missionStatement =
  'I build privacy-first software, AI tools, engineering utilities, and digital products that solve real-world problems.';

export const trustMetrics: TrustMetric[] = [
  { id: 'experience', icon: Clock, label: 'Years Experience', value: 4, suffix: '+' },
  { id: 'tools', icon: Layers, label: 'Tools Built', value: 190, suffix: '+' },
  { id: 'users', icon: Users, label: 'Monthly Users', value: 100, suffix: 'K+' },
  { id: 'calculations', icon: Zap, label: 'Calculations Run', value: 500, suffix: 'K+' },
  { id: 'privacy', icon: Shield, label: 'Privacy First', isBadge: true },
  { id: 'browser', icon: Globe, label: 'Browser Based', isBadge: true }
];

export const aboutHighlights: AboutHighlight[] = [
  { label: 'QA Automation', icon: Code },
  { label: 'AI Applications', icon: Sparkles },
  { label: 'Browser Based Software', icon: Globe },
  { label: 'Product Design', icon: Target },
  { label: '3D Printing', icon: Box },
  { label: 'Privacy First', icon: Shield }
];

export const milestones: Milestone[] = [
  {
    year: '2022',
    title: 'Career Launch (QA Engineer)',
    desc: 'Began professional journey in Quality Assurance, focusing on functional verification and finding structural code flaws.',
    icon: Award
  },
  {
    year: '2024',
    title: 'QA Automation Specialist',
    desc: 'Designed high-fidelity testing frameworks using Selenium, Python, and API testing models to speed up release iterations.',
    icon: Code
  },
  {
    year: '2025',
    title: 'Productivity Architect',
    desc: 'Built custom internal desktop scripts and browser automation extensions to reduce repetitive manual overhead.',
    icon: Zap
  },
  {
    year: '2026',
    title: 'Full-Stack Integration',
    desc: 'Self-taught modern frontend stacks (React, Next.js) and Node backend servers to bring personal software designs to life.',
    icon: Layers
  },
  {
    year: '2026',
    title: 'Founding Toolique',
    desc: 'Launched Toolique to deliver clean, ad-free, 100% browser-based utility calculators tailored for Indian engineering & finance.',
    icon: Cpu
  },
  {
    year: '2026',
    title: 'Founding Voxelique & Maker Era',
    desc: 'Ventured into hardware prototyping and creative manufacturing, launching Voxelique for 3D printing custom design solutions.',
    icon: Box
  },
  {
    year: '2026 & Beyond',
    title: 'Engineering the Future',
    desc: 'Scaling dynamic calculation suites, AI-driven offline tools, and hardware-software bridges to empower global makers.',
    icon: Target
  }
];

export const brands: Brand[] = [
  {
    name: 'Toolique',
    badgeLabel: 'Active Suite',
    badgeColorClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
    desc: 'A growing collection of free online calculators, engineering utilities, productivity tools, developer resources, and business estimators built for everyone. Computation occurs 100% locally.',
    previewIcon: Layers,
    statLine: '190+ Tools · 100% Browser-Based',
    primaryCta: { label: 'Visit Toolique', href: '/', external: false },
    secondaryCta: { label: 'Browse Tools', href: '/?view=all', external: false }
  },
  {
    name: 'Voxelique',
    badgeLabel: 'Manufacturing',
    badgeColorClass: 'text-purple-600 dark:text-purple-400 bg-purple-500/10',
    desc: 'A premium 3D printing brand focused on custom products, engineering prototypes, creative manufacturing, home décor, and innovative designs.',
    previewIcon: Box,
    statLine: 'Custom 3D Prints · Made-to-Order',
    primaryCta: { label: 'Visit Voxelique', href: socialLinks.voxelique, external: true },
    secondaryCta: { label: 'Learn More', href: `${socialLinks.toolique}/3d-print-studio`, external: false }
  }
];

export const buildCategories: BuildCategory[] = [
  { name: 'Developer Tools', path: '/?category=developer', icon: Code, desc: 'Minifiers, formatters, and tag generators.' },
  { name: 'PDF Tools', path: '/?category=pdf', icon: Layers, desc: 'Merge, split, and edit PDF documents client-side.' },
  { name: 'Image Tools', path: '/?category=image', icon: Sparkles, desc: 'Compress, crop, and convert images locally.' },
  { name: 'Finance Calculators', path: '/?category=finance', icon: Cpu, desc: 'Compute GST, SIP, EMI, and salary breakdowns.' },
  { name: 'Civil Engineering', path: '/?category=civil', icon: Target, desc: 'Brick, cement, steel, and concrete calculations.' },
  { name: 'Architecture Tools', path: '/?category=architecture', icon: BookOpen, desc: 'Staircase risers, paint coverage, and FAR clearances.' },
  { name: '3D Print Studio', path: '/3d-print-studio', icon: Zap, desc: 'Filament, print farm, and AMS slot configurations.' },
  { name: 'Advanced Math Studio', path: '/math-studio', icon: Award, desc: 'Equation solvers, matrices, and geometry calculations.' },
  { name: 'Construction estimation', path: '/?q=construction', icon: Target, desc: 'Detailed bill of materials and Indian standard BOQs.' },
  { name: 'Productivity Utilities', path: '/?category=text', icon: Smartphone, desc: 'Word counters, generators, and text diff checkers.' }
];

export const skillsData: SkillCategory[] = [
  {
    category: 'QA & Testing',
    skills: ['Selenium', 'Playwright', 'Appium', 'Postman', 'REST API Testing', 'Framework Design', 'Test Planning', 'SQL Testing'],
    icon: Code
  },
  {
    category: 'Programming',
    skills: ['Python', 'JavaScript', 'TypeScript', 'SQL'],
    icon: Cpu
  },
  {
    category: 'Frontend',
    skills: ['React', 'Next.js', 'Tailwind CSS', 'HTML5', 'CSS3'],
    icon: Layers
  },
  {
    category: 'Backend',
    skills: ['Node.js', 'REST APIs', 'Express'],
    icon: Zap
  },
  {
    category: 'Database',
    skills: ['MySQL', 'PostgreSQL', 'SQLite'],
    icon: Database
  },
  {
    category: 'DevOps & Other',
    skills: ['Git & GitHub', 'CI/CD Pipelines', 'Docker', 'Agile / Scrum', 'Jira', 'Rapid Prototyping'],
    icon: Wrench
  }
];

export const projectsData: Project[] = [
  {
    name: 'Toolique Suite',
    desc: 'A robust portfolio of 158+ browser-based calculation utilities. Designed with high-performance JS computation running entirely local to safeguard user privacy.',
    tech: ['React', 'Vite', 'TypeScript', 'Tailwind CSS', 'Workbox', 'MathJS'],
    url: socialLinks.toolique,
    icon: Layers
  },
  {
    name: 'Voxelique 3D Studio',
    desc: 'A custom manufacturing and 3D printing store providing industrial prototypes, rapid design iterations, functional components, and creative architectural decors.',
    tech: ['3D Printing', 'CAD Modeling', 'Additive Manufacturing', 'Product Design'],
    url: socialLinks.voxelique,
    icon: Box
  },
  {
    name: '3D Printing Cost Calculator',
    desc: 'An advanced estimator tracking filament weights, electricity metrics, depreciation, labor, packaging, and profit margins to price 3D prints professionally.',
    tech: ['React', 'TypeScript', 'Tailwind CSS', 'Local Storage API'],
    url: `${socialLinks.toolique}/tool/3d-printing-cost-calculator`,
    icon: Calculator
  },
  {
    name: 'Advanced BOQ Calculator India',
    desc: 'A heavy-duty civil engineering utility building full Bill of Quantities (BOQ) with customized material splits, labor rates, and professional PDF/Excel reporting.',
    tech: ['React', 'PDF-Lib', 'SheetJS', 'Tailwind CSS', 'Indian Standard Rules'],
    url: `${socialLinks.toolique}/tools/advanced-boq-calculator-india`,
    icon: BookOpen
  },
  {
    name: 'Construction Cost Calculator',
    desc: 'An area-based construction estimator evaluating brick, cement, steel, sand, aggregate, and labor costs dynamically based on Indian regional rates.',
    tech: ['React', 'Tailwind CSS', 'Engineering Thumb Rules'],
    url: `${socialLinks.toolique}/tool/construction-cost-calculator`,
    icon: Target
  },
  {
    name: 'Steel Weight Calculator',
    desc: 'A structural tool calculating weight profiles of round bars, tubes, beams, channels, and plates across custom alloys and dimensions.',
    tech: ['React', 'Mathematical Modeling', 'Tailwind CSS'],
    url: `${socialLinks.toolique}/tool/steel-weight-calculator`,
    icon: Cpu
  },
  {
    name: 'Advanced Math Studio',
    desc: 'A comprehensive analytical environment for resolving coordinate geometry, multi-variable calculus, matrix algebra, linear programming, and Fourier calculations.',
    tech: ['React', 'Math.js', 'Framer Motion', 'Tailwind CSS'],
    url: `${socialLinks.toolique}/math-studio`,
    icon: Award
  }
];

export const visionStatement =
  "The vision behind Toolique is to build one of India's largest collections of free online tools that work directly in the browser without requiring users to install software or create accounts.";

export const missionDetail =
  'Too many utility sites are bloated with invasive tracker networks, slow loading times, wall-to-wall banner ads, or paywalls blocking basic files. I built Toolique to counter that. Everything here is computed local to the host client, meaning we store zero record of your input. It is built for absolute privacy, speed, accuracy, accessibility, and continuous innovation.';

export const coreValues: CoreValue[] = [
  { title: 'Accuracy', desc: 'Precise formula outputs aligned with Indian and global structural standards.' },
  { title: 'Simplicity', desc: 'No signup blockades, no ads, and clean layouts that get straight to business.' },
  { title: 'Innovation', desc: 'Evolving dynamic calculations, offline service availability, and modern UX paradigms.' },
  { title: 'Performance', desc: 'Microsecond processing speeds using client-side execution, bypassing network roundtrips.' },
  { title: 'Privacy First', desc: 'All data stays on the user device. Absolute zero tracking or remote payload logging.' },
  { title: 'Continuous Learning', desc: 'Constant exploration of engineering and software standards to enrich the toolkit.' },
  { title: 'User-Centric', desc: 'Crafting responsive, intuitive flows designed by engineers, for engineers.' },
  { title: 'Problem Solving', desc: 'Converting tedious mathematical models into straightforward visual web utilities.' }
];

export const funFacts: FunFact[] = [
  { title: 'Maker Mentality', desc: 'Maintains a local custom 3D printing workshop, building functional engineering prints.', icon: Wrench },
  { title: 'Automation Addict', desc: 'If a workflow takes more than 3 steps and is repeated, a script is built for it.', icon: Zap },
  { title: 'Privacy Guard', desc: 'Staunch advocate for browser-based client computing that operates without tracking databases.', icon: Shield },
  { title: 'Tinkerer by Choice', desc: 'Spends weekends bridging hardware controls (IoT/3D design) with modern web dashboards.', icon: Cpu },
  { title: 'Constant Upskilling', desc: 'Learns emerging software libraries and mathematical standards to fuel the next 50 Toolique tools.', icon: Award }
];

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
  CheckCircle2,
  HardHat,
  FileCode2,
  Terminal,
  Server
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
  'QA Automation Architect',
  'Full-Stack Developer',
  '3D Printing & Hardware Maker',
  'Founder of Toolique & Voxelique'
];

export const missionStatement =
  'I build high-performance, privacy-first software utilities, QA automation frameworks, engineering tools, and physical 3D products that eliminate repetitive overhead and operate 100% client-side with zero data tracking.';

export const trustMetrics: TrustMetric[] = [
  { id: 'experience', icon: Clock, label: 'Years Experience', value: 4, suffix: '+' },
  { id: 'tools', icon: Layers, label: 'Tools Engineered', value: 274, suffix: '+' },
  { id: 'users', icon: Users, label: 'Monthly Users', value: 150, suffix: 'K+' },
  { id: 'calculations', icon: Zap, label: 'Calculations Run', value: 1, suffix: 'M+' },
  { id: 'privacy', icon: Shield, label: '100% Client RAM', isBadge: true },
  { id: 'browser', icon: Globe, label: 'Zero Server Logs', isBadge: true }
];

export const aboutHighlights: AboutHighlight[] = [
  { label: 'QA Automation & SDET', icon: Code },
  { label: 'Full-Stack Web Systems', icon: Sparkles },
  { label: 'Client-Side Computing', icon: Globe },
  { label: 'Additive Manufacturing & 3D', icon: Box },
  { label: 'Indian Civil & Structural BOQs', icon: HardHat },
  { label: 'Zero-Knowledge Privacy', icon: Shield }
];

export const milestones: Milestone[] = [
  {
    year: '2022',
    title: 'Career Launch (Quality Assurance)',
    desc: 'Began professional engineering journey in Quality Assurance, mastering black-box testing, boundary value analysis, and defect lifecycles across mission-critical systems.',
    icon: Award
  },
  {
    year: '2023 – 2024',
    title: 'QA Automation Specialist & SDET',
    desc: 'Architected robust end-to-end testing frameworks utilizing Selenium WebDriver, Playwright, Python, and Postman API automation, slashing regression test cycles by 60%.',
    icon: Code
  },
  {
    year: '2024 – 2025',
    title: 'Productivity Architect & Tool Builder',
    desc: 'Developed internal desktop utilities, batch processors, and browser extensions to automate mundane developer and QA workflows, establishing a passion for lightweight utility software.',
    icon: Zap
  },
  {
    year: '2025 – 2026',
    title: 'Full-Stack Modernization & Systems Design',
    desc: 'Expanded technical mastery across modern React, TypeScript, Tailwind CSS, Vite, and high-performance client-side computation engines (MathJS, Web Crypto, Web Workers).',
    icon: Layers
  },
  {
    year: '2026',
    title: 'Founding Toolique (274+ Web Utilities)',
    desc: 'Engineered and launched Toolique as a unified, ad-free, 100% browser-based utility suite spanning Finance, Indian Civil Engineering, Developer Utilities, Math, and QA Tools.',
    icon: Cpu
  },
  {
    year: '2026',
    title: 'Founding Voxelique (3D Printing & Prototyping)',
    desc: 'Launched Voxelique to bridge digital code with physical hardware, manufacturing custom 3D printed components, precision engineering prototypes, and creative art designs.',
    icon: Box
  },
  {
    year: '2026 & Beyond',
    title: 'Engineering the Open Utility Web',
    desc: 'Scaling dynamic calculation suites, offline-first WebAssembly utilities, and physical-digital maker integrations to empower engineers, students, and businesses globally.',
    icon: Target
  }
];

export const brands: Brand[] = [
  {
    name: 'Toolique',
    badgeLabel: 'Live Platform · 274+ Tools',
    badgeColorClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20',
    desc: 'A comprehensive ecosystem of 274+ lightning-fast online tools for Developers, QA Engineers, Civil Contractors, Architects, Finance Professionals, and Students. Computes 100% in browser RAM with zero tracking.',
    previewIcon: Layers,
    statLine: '274+ Tools · 21+ Suites · 100% Client-Side Privacy',
    primaryCta: { label: 'Explore Toolique', href: '/', external: false },
    secondaryCta: { label: 'Browse All Tools', href: '/tools', external: false }
  },
  {
    name: 'Voxelique',
    badgeLabel: 'Maker Studio · 3D Printing',
    badgeColorClass: 'text-purple-600 dark:text-purple-400 bg-purple-500/10 border border-purple-500/20',
    desc: 'A specialized 3D printing and custom fabrication brand delivering precision engineering prototypes, additive manufacturing parts, bespoke maker solutions, and creative home decor.',
    previewIcon: Box,
    statLine: 'Additive Manufacturing · Custom Rapid Prototyping',
    primaryCta: { label: 'Visit Voxelique Store', href: socialLinks.voxelique, external: true },
    secondaryCta: { label: '3D Print Cost Tool', href: '/tool/3d-printing-cost-calculator', external: false }
  }
];

export const buildCategories: BuildCategory[] = [
  { name: 'Developer & Code Tools', path: '/?category=developer', icon: Code, desc: 'JSON formatters, regex testers, minifiers, encoders, and hashing utilities.' },
  { name: 'QA & Test Engineering', path: '/qa-hub', icon: CheckCircle2, desc: 'BVA calculators, test case builders, bug report formatters, and mock generators.' },
  { name: 'Indian Civil & Architecture', path: '/architecture', icon: HardHat, desc: 'BOQ estimators, FSI / FAR calculators, concrete mix designs, and steel weights.' },
  { name: 'Finance & Taxation (India)', path: '/?category=finance', icon: Cpu, desc: 'Old vs New Tax slabs, GST billing, EMI amortizations, SIPs, and salary calculators.' },
  { name: '3D Printing & Maker Hub', path: '/3d-print-studio', icon: Box, desc: 'Filament mass estimators, hourly printer depreciation, and multi-color AMS costs.' },
  { name: 'Advanced Math Studio', path: '/math-studio', icon: Award, desc: 'Polynomial solvers, matrix algebra, calculus derivatives, and statistical regression.' },
  { name: 'PDF & Document Suite', path: '/?category=pdf', icon: BookOpen, desc: 'Client-side PDF merging, splitting, watermarking, and text extraction.' },
  { name: 'Media & Image Processing', path: '/?category=image', icon: Sparkles, desc: 'Local image compression, SVG formatters, color palette extractors, and EXIF readers.' },
  { name: 'Text & Productivity Utilities', path: '/?category=text', icon: Smartphone, desc: 'Text diff checkers, markdown editors, case converters, and word analysis.' }
];

export const skillsData: SkillCategory[] = [
  {
    category: 'QA Automation & Testing',
    skills: ['Selenium WebDriver', 'Playwright', 'Appium Mobile', 'Postman & REST API', 'PyTest / TestNG', 'Test Strategy & BDD', 'CI/CD Automation Pipelines', 'Boundary Value Analysis'],
    icon: CheckCircle2
  },
  {
    category: 'Core Programming',
    skills: ['TypeScript', 'JavaScript (ESNext)', 'Python', 'SQL (Postgres, MySQL)', 'HTML5 / CSS3', 'Bash Scripting'],
    icon: FileCode2
  },
  {
    category: 'Frontend & UI Engineering',
    skills: ['React 18 / 19', 'Next.js', 'Tailwind CSS', 'Vite', 'Framer Motion', 'Web Workers', 'Responsive Design', 'WAI-ARIA Accessibility'],
    icon: Layers
  },
  {
    category: 'Backend & APIs',
    skills: ['Node.js', 'Express', 'RESTful API Architecture', 'Client-Side Web Crypto', 'WebSockets', 'Serverless Functions'],
    icon: Server
  },
  {
    category: 'Hardware & 3D Fabrication',
    skills: ['FDM 3D Printing', 'Slicer Tuning (Orca/Bambu/Cura)', 'CAD Prototyping', 'Filament Material Engineering', 'Print Farm Management'],
    icon: Box
  },
  {
    category: 'Architecture & Tooling',
    skills: ['Git & GitHub Workflows', 'Client-Side Performance Optimization', 'Vite Bundle Code-Splitting', 'SEO / AEO / GEO Structuring', 'Agile / Scrum'],
    icon: Wrench
  }
];

export const projectsData: Project[] = [
  {
    name: 'Toolique Platform (274+ Web Utilities)',
    desc: 'An expansive suite of 274+ lightning-fast utility tools for software engineers, QA specialists, civil contractors, finance analysts, and students. Runs 100% in client-side RAM with zero cookies or server uploads.',
    tech: ['React', 'Vite', 'TypeScript', 'Tailwind CSS', 'MathJS', 'PDF-Lib', 'Web Crypto'],
    url: '/',
    icon: Layers
  },
  {
    name: 'Voxelique 3D Studio',
    desc: 'A rapid prototyping and custom 3D manufacturing brand producing high-durability engineering prototypes, multi-color decorative products, and functional components.',
    tech: ['Additive Manufacturing', 'FDM 3D Printing', 'Bambu Studio', 'CAD Modeling', 'PLA/PETG/ABS'],
    url: socialLinks.voxelique,
    icon: Box
  },
  {
    name: '3D Printing Cost & Pricing Calculator',
    desc: 'A full-spectrum commercial pricing engine factoring filament spool weights, electricity tariffs, machine depreciation, labor overheads, failure buffers, and profit margins.',
    tech: ['React', 'TypeScript', 'Tailwind CSS', 'LocalStorage State', 'Framer Motion'],
    url: '/tool/3d-printing-cost-calculator',
    icon: Calculator
  },
  {
    name: 'Advanced BOQ Calculator India',
    desc: 'A comprehensive civil engineering estimator generating complete Bill of Quantities (BOQ), material consumption tables, and instant Excel / PDF reports per CPWD / IS codes.',
    tech: ['React', 'PDF-Lib', 'SheetJS', 'Tailwind CSS', 'CPWD Thumb Rules'],
    url: '/tools/advanced-boq-calculator-india',
    icon: HardHat
  },
  {
    name: 'QA & Test Engineering Hub',
    desc: 'A dedicated test engineering workbench featuring Boundary Value Analysis (BVA), Equivalence Partitioning, Bug Report Markdown Generators, and Test Data Synthesizers.',
    tech: ['TypeScript', 'Testing Algorithms', 'ISTQB Methodologies', 'Tailwind CSS'],
    url: '/qa-hub',
    icon: CheckCircle2
  },
  {
    name: 'Advanced Math Studio',
    desc: 'An analytical workbench capable of graphing polynomial functions, performing matrix operations, resolving multi-variable calculus, and running statistical analysis in real time.',
    tech: ['React', 'Math.js', 'Framer Motion', 'Tailwind CSS', 'Canvas API'],
    url: '/math-studio',
    icon: Award
  }
];

export const visionStatement =
  "To democratize professional digital utilities and hardware prototyping across India and the world — providing fast, accurate, ad-free tools that respect user privacy by default.";

export const missionDetail =
  'Most online utility websites are cluttered with intrusive popups, slow server roundtrips, paywalls, and aggressive tracker scripts that log user data. Toolique was built with a contrarian engineering philosophy: zero tracking, instantaneous browser RAM processing, no accounts, and complete respect for the user. Combined with Voxelique for physical manufacturing, my mission is to deliver tangible value across both software and hardware.';

export const coreValues: CoreValue[] = [
  { title: 'Zero Data Tracking', desc: 'Calculations and file transformations happen strictly inside browser RAM. Zero telemetry.' },
  { title: 'Deterministic Precision', desc: 'Formulae rigorously verified against Indian standards (IS codes, Income Tax 1961, CPWD) and international specs.' },
  { title: 'Microsecond Performance', desc: 'No network roundtrips for computations. Everything runs natively at raw client CPU speed.' },
  { title: 'Uncompromising Simplicity', desc: 'No paywalls, no signup gates, no intrusive popups. Straightforward tools that get the job done.' },
  { title: 'Maker & Builder Spirit', desc: 'Continuously bridging software engineering with physical additive manufacturing and 3D printing.' },
  { title: 'Continuous Evolution', desc: 'Regularly shipping new calculation suites, responsive refinements, and high-utility toolsets.' }
];

export const funFacts: FunFact[] = [
  { title: 'Custom 3D Print Farm', desc: 'Maintains an active 3D printing workshop running precision engineering prototypes and bespoke designs.', icon: Wrench },
  { title: 'Automation First', desc: 'If any workflow is repeated more than twice, a clean Python or TypeScript script is immediately engineered.', icon: Zap },
  { title: 'Privacy Zealot', desc: 'Firm believer in zero-knowledge client architectures where user data never touches external backend databases.', icon: Shield },
  { title: 'Lifelong Tinkerer', desc: 'Constantly testing new slicing profiles, math models, and modern frontend frameworks on weekends.', icon: Terminal }
];


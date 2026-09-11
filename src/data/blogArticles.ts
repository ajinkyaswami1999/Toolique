export interface TableOfContentsItem {
  id: string;
  title: string;
}

export interface BlogArticle {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  category: 'Civil & Architecture' | 'Finance & Taxation' | 'Software Engineering' | 'QA & Testing' | '3D Printing' | 'Economics & Quantitative';
  categoryId: 'civil-arch' | 'finance-tax' | 'software-dev' | 'qa-testing' | '3d-printing' | 'economics';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  readTime: string;
  publishedDate: string;
  updatedDate: string;
  author: {
    name: string;
    role: string;
  };
  tags: string[];
  featured?: boolean;
  toolLink: string;
  toolName: string;
  toolCategory: string;
  keyTakeaways: string[];
  tableOfContents: TableOfContentsItem[];
  contentHtml: string;
}

export const BLOG_CATEGORIES = [
  { id: 'all', label: 'All Articles', icon: 'Sparkles' },
  { id: 'civil-arch', label: 'Civil & Architecture', icon: 'Building2' },
  { id: 'finance-tax', label: 'Finance & Taxation', icon: 'Receipt' },
  { id: 'software-dev', label: 'Software & Data', icon: 'Code2' },
  { id: 'qa-testing', label: 'QA & Test Engineering', icon: 'ShieldCheck' },
  { id: '3d-printing', label: '3D Printing & Maker', icon: 'Printer' },
  { id: 'economics', label: 'Economics & Math', icon: 'TrendingUp' }
] as const;

export const blogArticles: BlogArticle[] = [
  {
    id: 'nbc-2016-fsi-far-regulations',
    slug: 'nbc-2016-fsi-far-regulations',
    title: 'NBC 2016 & Indian FSI/FAR Calculation Standards: A Comprehensive Statutory Guide',
    subtitle: 'Master municipal Floor Space Index rules, setback formulas, fungible FSI, and staircase egress compliance across Mumbai, Delhi, Bengaluru, and Pune.',
    excerpt: 'Detailed breakdown of National Building Code (NBC 2016) provisions governing Floor Area Ratio (FAR/FSI), ground coverage limits, front/rear setback calculations, and staircase fire escape sizing.',
    category: 'Civil & Architecture',
    categoryId: 'civil-arch',
    difficulty: 'Advanced',
    readTime: '9 min read',
    publishedDate: 'January 2025',
    updatedDate: 'February 2026',
    author: {
      name: 'Ajinkya Swami',
      role: 'Lead Architect & Founder'
    },
    tags: ['#NBC2016', '#FAR', '#FSI', '#BuildingFeasibility', '#Setbacks', '#MumbaiDCR', '#PuneUDCPR'],
    featured: true,
    toolLink: '/civil/building-feasibility-checker',
    toolName: 'Building Feasibility Checker',
    toolCategory: 'civil',
    keyTakeaways: [
      'FAR/FSI determines maximum permissible built-up area relative to plot size: Built-up Area = Plot Area x Permissible FAR.',
      'NBC 2016 Part 3 mandates minimum front setbacks based on abutting road width (e.g. 3m - 6m for roads under 12m, 9m+ for arterial roads).',
      'Fungible FSI (Mumbai DCR) allows 35% residential and 20% commercial area over and above base FSI against premium payments.',
      'Fire egress stairs must maintain minimum 1.5m width for residential and 2.0m for commercial/assembly buildings with enclosed pressurization.'
    ],
    tableOfContents: [
      { id: 'what-is-far-fsi', title: '1. What is FAR / FSI?' },
      { id: 'mathematical-formula', title: '2. Mathematical Formulation' },
      { id: 'city-byelaws-comparison', title: '3. City Bye-Laws Comparison (Mumbai, Delhi, BLR, Pune)' },
      { id: 'setbacks-and-coverage', title: '4. Setback Formulas & Maximum Ground Coverage' },
      { id: 'fire-egress-nbc', title: '5. NBC 2016 Fire Egress & Staircase Sizing Rules' },
      { id: 'practical-example', title: '6. Practical Walkthrough with Calculations' }
    ],
    contentHtml: `
      <section id="what-is-far-fsi" class="space-y-3">
        <h3 class="text-lg font-black text-slate-900 dark:text-white">1. What is Floor Space Index (FSI) & Floor Area Ratio (FAR)?</h3>
        <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          In urban planning and municipal civil engineering across India, <strong>Floor Area Ratio (FAR)</strong> and <strong>Floor Space Index (FSI)</strong> represent the identical statutory metric: the ratio between the total gross floor area of a building across all levels and the gross area of the plot on which it stands.
        </p>
        <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          While international standards and northern/eastern Indian authorities (such as DDA in Delhi and KMDA in Kolkata) commonly express this as a ratio (e.g., FAR 1.5, 2.0, 2.75), western and southern municipal corporations (MCGM in Mumbai, PMC in Pune, BBMP in Bengaluru) designate it as <strong>FSI</strong> (e.g., FSI 1.0, 2.5, 3.5).
        </p>
      </section>

      <section id="mathematical-formula" class="space-y-3 mt-6">
        <h3 class="text-lg font-black text-slate-900 dark:text-white">2. Mathematical Formulation</h3>
        <div class="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
          <p class="font-mono text-xs font-bold text-emerald-800 dark:text-emerald-300">
            FAR / FSI = Total Covered Built-up Area across All Floors (sq.m) / Total Net Plot Area (sq.m)
          </p>
          <p class="font-mono text-xs text-emerald-700 dark:text-emerald-400 mt-2">
            Maximum Permissible Gross Floor Area = Plot Area x (Base FSI + TDR FSI + Premium / Fungible FSI)
          </p>
        </div>
        <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          Certain utility components are routinely <em>exempted</em> from FSI computations (FSI Free Areas) under NBC 2016 and state Unified Development Control Regulations (UDCPR):
        </p>
        <ul class="list-disc list-inside text-xs text-slate-600 dark:text-slate-400 space-y-1 pl-2">
          <li>Basement parking levels and ramp structures (provided they are strictly non-habitable).</li>
          <li>Fire escape staircases, lift shafts, and fire refuge terraces.</li>
          <li>Overhead and underground water storage tanks, pump rooms, and electrical substations / DG set rooms.</li>
          <li>Open-to-sky service ducts and ventilation shafts under statutory dimension limits.</li>
        </ul>
      </section>

      <section id="city-byelaws-comparison" class="space-y-3 mt-6">
        <h3 class="text-lg font-black text-slate-900 dark:text-white">3. City Bye-Laws Comparison</h3>
        <div class="overflow-x-auto my-3">
          <table class="w-full text-xs text-left border-collapse border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <thead class="bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-bold">
              <tr>
                <th class="p-3 border-b border-slate-200 dark:border-slate-800">City / Authority</th>
                <th class="p-3 border-b border-slate-200 dark:border-slate-800">Governing Code</th>
                <th class="p-3 border-b border-slate-200 dark:border-slate-800">Base FSI (Res)</th>
                <th class="p-3 border-b border-slate-200 dark:border-slate-800">Max FSI with TDR / Premium</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-850 text-slate-600 dark:text-slate-400">
              <tr>
                <td class="p-3 font-semibold text-slate-900 dark:text-white">Mumbai (MCGM)</td>
                <td class="p-3">DCPR 2034</td>
                <td class="p-3">1.00 - 1.33</td>
                <td class="p-3">Up to 2.70 - 4.05 (with Fungible 35%)</td>
              </tr>
              <tr>
                <td class="p-3 font-semibold text-slate-900 dark:text-white">Pune / Maharashtra</td>
                <td class="p-3">UDCPR 2020</td>
                <td class="p-3">1.10 - 1.50</td>
                <td class="p-3">Up to 2.50 - 3.50 (Road width ≥ 18m)</td>
              </tr>
              <tr>
                <td class="p-3 font-semibold text-slate-900 dark:text-white">Delhi NCR (DDA)</td>
                <td class="p-3">MPD 2021 / 2041</td>
                <td class="p-3">2.00 - 3.00</td>
                <td class="p-3">Up to 3.50 (Transit Oriented Zones)</td>
              </tr>
              <tr>
                <td class="p-3 font-semibold text-slate-900 dark:text-white">Bengaluru (BBMP/BDA)</td>
                <td class="p-3">RMP 2015 / BDA Bye-laws</td>
                <td class="p-3">1.50 - 1.75</td>
                <td class="p-3">Up to 3.25 (Premium FAR Rules)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="setbacks-and-coverage" class="space-y-3 mt-6">
        <h3 class="text-lg font-black text-slate-900 dark:text-white">4. Setback Formulas & Maximum Ground Coverage</h3>
        <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          Setbacks represent the mandatory open spaces around the building footprint to ensure natural light, ventilation, emergency firefighting access, and seismic buffer clearance.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 my-3">
          <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <h4 class="text-xs font-bold text-slate-900 dark:text-white mb-1">Front Setback Rule (NBC Cl. 4.4)</h4>
            <p class="text-[11px] text-slate-600 dark:text-slate-400">
              Front Setback = max(3.0m, Road Width / 4) for mid-rise structures. High-rises (&gt;15m) mandate a minimum 6.0m clear vehicular fire path.
            </p>
          </div>
          <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <h4 class="text-xs font-bold text-slate-900 dark:text-white mb-1">Side & Rear Setback Rule</h4>
            <p class="text-[11px] text-slate-600 dark:text-slate-400">
              Side/Rear Setback = max(1.5m, Height of Building / 3 - 3m) subject to a minimum of 3m for structures exceeding 10m in height.
            </p>
          </div>
        </div>
      </section>

      <section id="fire-egress-nbc" class="space-y-3 mt-6">
        <h3 class="text-lg font-black text-slate-900 dark:text-white">5. NBC 2016 Fire Egress & Staircase Sizing Rules</h3>
        <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          According to National Building Code 2016 (Part 4 - Fire & Life Safety):
        </p>
        <ul class="list-disc list-inside text-xs text-slate-600 dark:text-slate-400 space-y-1.5 pl-2">
          <li><strong>Staircase Minimum Width:</strong> 1.50m for residential apartments (&gt;15m height), 2.00m for commercial, institutional, and high-occupancy assembly buildings.</li>
          <li><strong>Maximum Riser Height:</strong> 150mm for commercial/public buildings, 190mm for residential units.</li>
          <li><strong>Minimum Tread Width:</strong> 300mm for public buildings, 250mm for domestic dwellings without nosing.</li>
          <li><strong>Travel Distance to Exit:</strong> Maximum 30m in non-sprinklered buildings and 45m in fully sprinklered buildings.</li>
        </ul>
      </section>

      <section id="practical-example" class="space-y-3 mt-6">
        <h3 class="text-lg font-black text-slate-900 dark:text-white">6. Practical Walkthrough with Calculations</h3>
        <div class="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-xs text-indigo-900 dark:text-indigo-200 space-y-2">
          <p class="font-bold text-indigo-950 dark:text-white">Case Study: Residential Plot in Pune (UDCPR 2020)</p>
          <p>• Plot Area = 1,000 sq.m (Abutting 18m wide public road)</p>
          <p>• Base FSI = 1.10 &rarr; Permissible Base Area = 1,100 sq.m</p>
          <p>• Permissible TDR FSI (0.60) + Premium FSI (0.50) = 1.10 &rarr; Additional Area = 1,100 sq.m</p>
          <p>• Total Gross Permissible Built-up = 1,000 x 2.20 = <strong>2,200 sq.m</strong></p>
          <p>• Max Ground Coverage (50%) = 500 sq.m footprint.</p>
        </div>
      </section>
    `
  },
  {
    id: 'is-456-rcc-concrete-design',
    slug: 'is-456-rcc-concrete-design',
    title: 'Structural RCC Concrete Mix Design & Steel Rebar Estimation (IS 456:2000)',
    subtitle: 'Step-by-step mathematical guide to characteristic cube strength, dry volume multipliers, mix proportions, and steel weight calculations.',
    excerpt: 'Deep technical guide explaining IS 456:2000 code recommendations for M15, M20, M25 concrete mix proportioning, wet-to-dry volume factor (1.54), and reinforcement steel rebar estimation formula D^2/162.',
    category: 'Civil & Architecture',
    categoryId: 'civil-arch',
    difficulty: 'Intermediate',
    readTime: '7 min read',
    publishedDate: 'February 2025',
    updatedDate: 'February 2026',
    author: {
      name: 'Ajinkya Swami',
      role: 'Lead Architect & Founder'
    },
    tags: ['#IS456', '#RCC', '#ConcreteMix', '#SteelWeight', '#CivilEngineering', '#Rebar'],
    toolLink: '/civil/rcc-calculator',
    toolName: 'RCC Slabs & Beams Calculator',
    toolCategory: 'civil',
    keyTakeaways: [
      'Wet concrete shrinks when water fills voids. The dry volume factor of 1.54 must be applied to calculate dry ingredients: Dry Volume = Wet Volume x 1.54.',
      'Nominal mix ratios: M15 (1:2:4), M20 (1:1.5:3), M25 (1:1:2) by volume.',
      'Steel rebar weight formula: Weight (kg/meter) = D^2 / 162.2, where D is the nominal rebar diameter in millimeters.',
      'Thumb-rule steel percentages: Slabs (0.8% - 1.0%), Beams (1.0% - 2.0%), Columns (1.5% - 4.0%), Footings (0.5% - 0.8%) of RCC volume.'
    ],
    tableOfContents: [
      { id: 'concrete-grades', title: '1. Concrete Grades & Characteristic Strength' },
      { id: 'dry-volume-concept', title: '2. The 1.54 Dry Volume Multiplier Explained' },
      { id: 'mix-calculation-step-by-step', title: '3. Step-by-Step Cement, Sand & Aggregate Math' },
      { id: 'steel-rebar-formula', title: '4. Steel Rebar Weight Derivation (D²/162)' },
      { id: 'field-safety-checks', title: '5. Water-Cement Ratio & Slump Test Verification' }
    ],
    contentHtml: `
      <section id="concrete-grades" class="space-y-3">
        <h3 class="text-lg font-black text-slate-900 dark:text-white">1. Concrete Grades & Characteristic Strength (IS 456:2000)</h3>
        <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          Concrete grade designates the characteristic compressive strength of 150mm cubes tested after 28 days of wet curing in Megapascals ($N/mm^2$).
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3">
          <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center">
            <span class="text-xs font-black text-blue-600 dark:text-blue-400">M15 (15 N/mm²)</span>
            <p class="text-[11px] text-slate-500 mt-1">Nominal Ratio 1 : 2 : 4<br/>PCC, levelling courses, pathways</p>
          </div>
          <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center">
            <span class="text-xs font-black text-emerald-600 dark:text-emerald-400">M20 (20 N/mm²)</span>
            <p class="text-[11px] text-slate-500 mt-1">Nominal Ratio 1 : 1.5 : 3<br/>Standard residential slabs & beams</p>
          </div>
          <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center">
            <span class="text-xs font-black text-purple-600 dark:text-purple-400">M25 (25 N/mm²)</span>
            <p class="text-[11px] text-slate-500 mt-1">Nominal Ratio 1 : 1 : 2<br/>Heavy columns, foundations, commercial</p>
          </div>
        </div>
      </section>

      <section id="dry-volume-concept" class="space-y-3 mt-6">
        <h3 class="text-lg font-black text-slate-900 dark:text-white">2. The 1.54 Dry Volume Multiplier Explained</h3>
        <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          When dry cement, fine aggregate (sand), and coarse aggregate are mixed with water, the smaller sand particles penetrate the interstitial voids of aggregate, and cement fills the microscopic pores of sand. As voids are displaced, the mixed volume decreases by approximately <strong>30% to 35%</strong> (shrinkage factor 1.52 - 1.57). In Indian civil engineering practice, standard factor <strong>1.54</strong> is adopted.
        </p>
        <div class="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-900 dark:text-amber-200 font-mono">
          Dry Volume of Mix = Wet Finished Volume (m³) x 1.54
        </div>
      </section>

      <section id="mix-calculation-step-by-step" class="space-y-3 mt-6">
        <h3 class="text-lg font-black text-slate-900 dark:text-white">3. Step-by-Step Cement, Sand & Aggregate Math (10 m³ M20 Concrete)</h3>
        <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          Let us calculate raw materials required for $10	ext{ m}^3$ of M20 grade concrete (Ratio 1 : 1.5 : 3, Total parts = 5.5):
        </p>
        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-2">
          <p>1. <strong>Dry Volume:</strong> $10 	imes 1.54 = 15.4	ext{ m}^3$</p>
          <p>2. <strong>Cement Volume:</strong> $(1 / 5.5) 	imes 15.4 = 2.80	ext{ m}^3$</p>
          <p>3. <strong>Cement Weight & Bags:</strong> $2.80	ext{ m}^3 	imes 1440	ext{ kg/m}^3 = 4,032	ext{ kg} = \mathbf{80.64	ext{ bags}}$ (50 kg each)</p>
          <p>4. <strong>Sand (Fine Aggregate):</strong> $(1.5 / 5.5) 	imes 15.4 = 4.20	ext{ m}^3 pprox 148.3	ext{ cu.ft (CFT)}$</p>
          <p>5. <strong>Coarse Aggregate (Grit):</strong> $(3 / 5.5) 	imes 15.4 = 8.40	ext{ m}^3 pprox 296.6	ext{ cu.ft (CFT)}$</p>
        </div>
      </section>

      <section id="steel-rebar-formula" class="space-y-3 mt-6">
        <h3 class="text-lg font-black text-slate-900 dark:text-white">4. Steel Rebar Weight Derivation ($D^2/162$)</h3>
        <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          Standard structural steel has a density of $7850	ext{ kg/m}^3$. For a cylindrical rebar of diameter $D$ (in mm) and length 1 meter:
        </p>
        <div class="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-800 dark:text-slate-200">
          Weight per meter = (π x D² / 4000000) x 7850 = D² / 162.28 kg/m
        </div>
        <p class="text-xs text-slate-600 dark:text-slate-400 mt-2">
          Quick Reference: 8mm = 0.395 kg/m, 10mm = 0.617 kg/m, 12mm = 0.888 kg/m, 16mm = 1.580 kg/m, 20mm = 2.469 kg/m.
        </p>
      </section>
    `
  },
  {
    id: 'new-vs-old-tax-regime-guide',
    slug: 'new-vs-old-tax-regime-guide',
    title: 'Indian Income Tax: New vs Old Tax Regime (FY 2024-25 / AY 2025-26) Breakdown',
    subtitle: 'Comprehensive mathematical comparison of standard deduction changes, 87A rebate limits, slab thresholds, and deduction breakeven points.',
    excerpt: 'Detailed analysis of the New Tax Regime (Section 115BAC) versus the Old Tax Regime under Union Budget revisions: ₹75,000 standard deduction, ₹7 Lakh rebate, and the mathematical deduction breakeven formula.',
    category: 'Finance & Taxation',
    categoryId: 'finance-tax',
    difficulty: 'Intermediate',
    readTime: '8 min read',
    publishedDate: 'January 2025',
    updatedDate: 'February 2026',
    author: {
      name: 'Ajinkya Swami',
      role: 'Lead Architect & Founder'
    },
    tags: ['#TaxRegime2025', '#IncomeTax', '#Section80C', '#StandardDeduction', '#SalaryTax', '#FinanceIndia'],
    featured: true,
    toolLink: '/calculators/in-hand-salary-calculator',
    toolName: 'In-Hand Salary Calculator',
    toolCategory: 'finance',
    keyTakeaways: [
      'New Tax Regime (Default): Standard deduction increased to ₹75,000 for salaried employees; zero tax on net taxable income up to ₹7,00,000 via Section 87A rebate.',
      'Slab revisions in New Regime: 0-3L (0%), 3-7L (5%), 7-10L (10%), 10-12L (15%), 12-15L (20%), >15L (30%).',
      'Breakeven Rule of Thumb: If total eligible deductions under Old Regime (80C, 80D, HRA, Home Loan Interest 24b) exceed ₹3.75 Lakhs - ₹4.25 Lakhs (depending on gross income), Old Regime may save tax.',
      'Employer NPS contribution under Section 80CCD(2) up to 14% of Basic + DA is deductible in the New Regime as well.'
    ],
    tableOfContents: [
      { id: 'key-differences', title: '1. Key Differences Overview' },
      { id: 'slab-rates-comparison', title: '2. Slab Rates Comparison (FY 2024-25)' },
      { id: 'section-87a-rebate', title: '3. Section 87A Rebate & Standard Deduction' },
      { id: 'breakeven-math', title: '4. Mathematical Deduction Breakeven Formula' },
      { id: 'decision-framework', title: '5. Which Regime Should You Choose?' }
    ],
    contentHtml: `
      <section id="key-differences" class="space-y-3">
        <h3 class="text-lg font-black text-slate-900 dark:text-white">1. Key Differences Overview</h3>
        <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          The Union Budget has structured the <strong>New Tax Regime (Section 115BAC)</strong> as the default regime with simplified tax slabs and reduced rates, while phasing out traditional itemized deductions such as Section 80C (PPF, ELSS, LIC), Section 80D (Health Insurance), and Section 24(b) (Self-occupied housing loan interest).
        </p>
      </section>

      <section id="slab-rates-comparison" class="space-y-3 mt-6">
        <h3 class="text-lg font-black text-slate-900 dark:text-white">2. Tax Slab Rates Comparison (FY 2024-25 / AY 2025-26)</h3>
        <div class="overflow-x-auto my-3">
          <table class="w-full text-xs text-left border-collapse border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <thead class="bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-bold">
              <tr>
                <th class="p-3 border-b border-slate-200 dark:border-slate-800">Income Slab</th>
                <th class="p-3 border-b border-slate-200 dark:border-slate-800">New Regime (Default)</th>
                <th class="p-3 border-b border-slate-200 dark:border-slate-800">Old Regime (Optional)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-850 text-slate-600 dark:text-slate-400">
              <tr>
                <td class="p-3 font-semibold text-slate-900 dark:text-white">Up to ₹2,50,000</td>
                <td class="p-3 text-emerald-600 font-bold">Nil</td>
                <td class="p-3 text-emerald-600 font-bold">Nil</td>
              </tr>
              <tr>
                <td class="p-3 font-semibold text-slate-900 dark:text-white">₹2,50,001 - ₹3,00,000</td>
                <td class="p-3 text-emerald-600 font-bold">Nil</td>
                <td class="p-3">5%</td>
              </tr>
              <tr>
                <td class="p-3 font-semibold text-slate-900 dark:text-white">₹3,00,001 - ₹5,00,000</td>
                <td class="p-3">5%</td>
                <td class="p-3">5%</td>
              </tr>
              <tr>
                <td class="p-3 font-semibold text-slate-900 dark:text-white">₹5,00,001 - ₹7,00,000</td>
                <td class="p-3">5% (Rebate up to 7L)</td>
                <td class="p-3">20%</td>
              </tr>
              <tr>
                <td class="p-3 font-semibold text-slate-900 dark:text-white">₹7,00,001 - ₹10,00,000</td>
                <td class="p-3">10%</td>
                <td class="p-3">20%</td>
              </tr>
              <tr>
                <td class="p-3 font-semibold text-slate-900 dark:text-white">₹10,00,001 - ₹12,00,000</td>
                <td class="p-3">15%</td>
                <td class="p-3">30%</td>
              </tr>
              <tr>
                <td class="p-3 font-semibold text-slate-900 dark:text-white">₹12,00,001 - ₹15,00,000</td>
                <td class="p-3">20%</td>
                <td class="p-3">30%</td>
              </tr>
              <tr>
                <td class="p-3 font-semibold text-slate-900 dark:text-white">Above ₹15,00,000</td>
                <td class="p-3">30%</td>
                <td class="p-3">30%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="section-87a-rebate" class="space-y-3 mt-6">
        <h3 class="text-lg font-black text-slate-900 dark:text-white">3. Section 87A Rebate & Standard Deduction</h3>
        <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          For salaried professionals under the New Regime:
        </p>
        <ul class="list-disc list-inside text-xs text-slate-600 dark:text-slate-400 space-y-1 pl-2">
          <li><strong>Standard Deduction:</strong> Flat ₹75,000 (increased from ₹50,000).</li>
          <li><strong>Gross Salary up to ₹7,75,000:</strong> Gross ₹7.75L - ₹75k Standard Deduction = ₹7.00L Net Taxable Income. Under Section 87A, tax payable on income up to ₹7L is fully rebated (Tax = ₹0).</li>
          <li><strong>Marginal Relief:</strong> Marginal relief applies if gross salary slightly exceeds ₹7,75,000 to ensure tax paid does not exceed income earned over the threshold.</li>
        </ul>
      </section>
    `
  },
  {
    id: 'indian-gst-invoicing-rcm-guide',
    slug: 'indian-gst-invoicing-rcm-guide',
    title: 'Indian GST Invoicing Demystified: CGST, SGST, IGST, and Reverse Charge (RCM)',
    subtitle: 'Practical guide to tax splits, HSN/SAC classification, reverse tax stripping formulas, and compliance checklists.',
    excerpt: 'Clear breakdown of Indian Goods and Services Tax (GST) invoicing architecture, intra-state vs inter-state tax splits, reverse charge liability mechanisms, and forward/reverse calculation algorithms.',
    category: 'Finance & Taxation',
    categoryId: 'finance-tax',
    difficulty: 'Beginner',
    readTime: '6 min read',
    publishedDate: 'February 2025',
    updatedDate: 'February 2026',
    author: {
      name: 'Ajinkya Swami',
      role: 'Lead Architect & Founder'
    },
    tags: ['#GSTIndia', '#CGST', '#SGST', '#IGST', '#RCM', '#Invoicing', '#Taxation'],
    toolLink: '/calculators/gst-calculator',
    toolName: 'GST Calculator & Invoice Engine',
    toolCategory: 'finance',
    keyTakeaways: [
      'Intra-State Supply (Supplier & Recipient in same state): Split equally into Central GST (CGST) and State GST (SGST) (e.g. 18% = 9% CGST + 9% SGST).',
      'Inter-State Supply (Different states or Union Territories): Full rate charged as Integrated GST (IGST) (18%).',
      'Formula to add GST: Total = Base Amount x (1 + Rate / 100).',
      'Formula to remove/strip GST: Base Amount = Total Amount / (1 + Rate / 100), GST Amount = Total - Base.'
    ],
    tableOfContents: [
      { id: 'gst-architecture', title: '1. GST Structural Architecture' },
      { id: 'tax-splitting-rules', title: '2. Intra-State vs Inter-State Splitting' },
      { id: 'forward-reverse-formulas', title: '3. Forward & Reverse Computation Math' },
      { id: 'rcm-explained', title: '4. Reverse Charge Mechanism (RCM)' }
    ],
    contentHtml: `
      <section id="gst-architecture" class="space-y-3">
        <h3 class="text-lg font-black text-slate-900 dark:text-white">1. GST Structural Architecture in India</h3>
        <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          The Goods and Services Tax (GST) is a destination-based, multi-stage consumption tax levied on every value addition across manufacturing, trading, and service delivery in India.
        </p>
      </section>

      <section id="forward-reverse-formulas" class="space-y-3 mt-6">
        <h3 class="text-lg font-black text-slate-900 dark:text-white">2. Forward & Reverse Computation Math</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 my-3">
          <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <h4 class="text-xs font-bold text-slate-900 dark:text-white mb-1">Adding GST to Base Value</h4>
            <pre class="bg-slate-100 dark:bg-slate-950 p-2 rounded text-[11px] font-mono text-slate-800 dark:text-slate-300 overflow-x-auto">GST = Base x (Rate / 100)
Gross Total = Base + GST</pre>
          </div>
          <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <h4 class="text-xs font-bold text-slate-900 dark:text-white mb-1">Stripping GST (Inclusive Price)</h4>
            <pre class="bg-slate-100 dark:bg-slate-950 p-2 rounded text-[11px] font-mono text-slate-800 dark:text-slate-300 overflow-x-auto">Base = Gross / (1 + Rate / 100)
GST = Gross - Base</pre>
          </div>
        </div>
      </section>
    `
  },
  {
    id: 'sql-joins-execution-plans',
    slug: 'sql-joins-execution-plans',
    title: 'Deep Dive into SQL JOINs, Set Theory & Query Execution Plans',
    subtitle: 'From Venn diagrams to relational algebra: Hash Joins, Merge Joins, Nested Loops, and optimizer cost models.',
    excerpt: 'Comprehensive architectural guide exploring relational set theory of INNER, LEFT, RIGHT, and FULL OUTER joins, paired with database engine execution plans and indexing strategies.',
    category: 'Software Engineering',
    categoryId: 'software-dev',
    difficulty: 'Intermediate',
    readTime: '8 min read',
    publishedDate: 'January 2025',
    updatedDate: 'February 2026',
    author: {
      name: 'Ajinkya Swami',
      role: 'Lead Architect & Founder'
    },
    tags: ['#SQLJoins', '#DatabaseArchitecture', '#QueryOptimization', '#PostgreSQL', '#MySQL', '#Indexing'],
    featured: true,
    toolLink: '/academy/learn',
    toolName: 'SQL JOIN Visualizer',
    toolCategory: 'developer',
    keyTakeaways: [
      'INNER JOIN returns only matching intersections between Cartesian products where the join predicate evaluates to TRUE.',
      'LEFT JOIN preserves all rows from the outer left relation and fills unfulfilled right projections with NULL.',
      'Database query optimizers pick among 3 physical join operators: Nested Loop Join (small datasets/indexed keys), Hash Join (large unsorted datasets), and Merge Join (pre-sorted streams).',
      'Adding B-Tree composite indexes on Foreign Key and Filter columns prevents catastrophic O(N*M) sequential scan blowups.'
    ],
    tableOfContents: [
      { id: 'relational-algebra', title: '1. Relational Algebra of SQL JOINs' },
      { id: 'four-primary-joins', title: '2. The Four Primary Join Types' },
      { id: 'physical-join-algorithms', title: '3. Physical Join Algorithms Under the Hood' },
      { id: 'indexing-strategies', title: '4. Indexing & Avoiding Full Table Scans' }
    ],
    contentHtml: `
      <section id="relational-algebra" class="space-y-3">
        <h3 class="text-lg font-black text-slate-900 dark:text-white">1. Relational Algebra of SQL JOINs</h3>
        <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          At the fundamental mathematical level, a relational join is a restricted Cartesian product ($R 	imes S$) followed by a selection operation ($\sigma_{	heta}$) that filters rows satisfying the join condition $	heta$.
        </p>
      </section>

      <section id="physical-join-algorithms" class="space-y-3 mt-6">
        <h3 class="text-lg font-black text-slate-900 dark:text-white">2. Physical Join Algorithms Under the Hood</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 my-3">
          <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <h4 class="text-xs font-bold text-slate-900 dark:text-white mb-1">Nested Loop Join</h4>
            <p class="text-[11px] text-slate-600 dark:text-slate-400">
              Iterates over outer table row-by-row and seeks into inner table via B-Tree index. Complexity: $O(N \log M)$.
            </p>
          </div>
          <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <h4 class="text-xs font-bold text-slate-900 dark:text-white mb-1">Hash Join</h4>
            <p class="text-[11px] text-slate-600 dark:text-slate-400">
              Builds in-memory hash table on smaller relation; probes rows from larger relation. Complexity: $O(N + M)$.
            </p>
          </div>
          <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <h4 class="text-xs font-bold text-slate-900 dark:text-white mb-1">Merge Join</h4>
            <p class="text-[11px] text-slate-600 dark:text-slate-400">
              Simultaneously iterates two sorted inputs. Ideal for pre-sorted clustered indexes. Complexity: $O(N + M)$.
            </p>
          </div>
        </div>
      </section>
    `
  },
  {
    id: 'equivalence-partitioning-bva-testing',
    slug: 'equivalence-partitioning-bva-testing',
    title: 'Equivalence Partitioning & Boundary Value Analysis (BVA) in Robust Test Design',
    subtitle: 'Systematic black-box test design techniques for high-yield defect discovery with minimum test case redundancy.',
    excerpt: 'Master Equivalence Partitioning (EP) and 2-value vs 3-value Boundary Value Analysis (BVA) matrices to eliminate off-by-one errors and achieve 100% boundary specification coverage.',
    category: 'QA & Testing',
    categoryId: 'qa-testing',
    difficulty: 'Beginner',
    readTime: '6 min read',
    publishedDate: 'February 2025',
    updatedDate: 'February 2026',
    author: {
      name: 'Ajinkya Swami',
      role: 'Lead Architect & Founder'
    },
    tags: ['#BVA', '#EquivalencePartitioning', '#QATesting', '#TestDesign', '#Automation', '#ISTQB'],
    toolLink: '/qa/boundary-value-analysis',
    toolName: 'Boundary Value Analysis Generator',
    toolCategory: 'qa',
    keyTakeaways: [
      'Equivalence Partitioning divides input domains into valid and invalid equivalence classes, assuming all values in a class exhibit identical program behavior.',
      'Boundary Value Analysis (BVA) targets the boundary thresholds where >80% of specification and off-by-one coding defects occur.',
      '2-Value BVA evaluates boundary points at {Min, Min-1, Max, Max+1}.',
      '3-Value BVA (Robust/ISTQB Advanced) evaluates {Min-1, Min, Min+1, Max-1, Max, Max+1} for mission-critical validation.'
    ],
    tableOfContents: [
      { id: 'why-ep-and-bva', title: '1. Why Black-Box Partitioning Matters' },
      { id: 'equivalence-classes', title: '2. Constructing Equivalence Classes' },
      { id: 'two-vs-three-value-bva', title: '3. 2-Value vs 3-Value BVA Comparison' },
      { id: 'practical-test-matrix', title: '4. Practical Form Validation Test Matrix' }
    ],
    contentHtml: `
      <section id="why-ep-and-bva" class="space-y-3">
        <h3 class="text-lg font-black text-slate-900 dark:text-white">1. Why Black-Box Partitioning Matters</h3>
        <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          Exhaustive testing of even a simple numeric age field (accepting 18 to 60) requires 43 test executions without accounting for invalid negative integers, zero, or large strings. <strong>Equivalence Partitioning</strong> and <strong>BVA</strong> reduce hundreds of redundant tests into 5 to 7 high-yield test assertions.
        </p>
      </section>

      <section id="two-vs-three-value-bva" class="space-y-3 mt-6">
        <h3 class="text-lg font-black text-slate-900 dark:text-white">2. 2-Value vs 3-Value BVA Comparison</h3>
        <div class="overflow-x-auto my-3">
          <table class="w-full text-xs text-left border-collapse border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <thead class="bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-bold">
              <tr>
                <th class="p-3 border-b border-slate-200 dark:border-slate-800">Technique</th>
                <th class="p-3 border-b border-slate-200 dark:border-slate-800">Lower Boundary (Min=18)</th>
                <th class="p-3 border-b border-slate-200 dark:border-slate-800">Upper Boundary (Max=60)</th>
                <th class="p-3 border-b border-slate-200 dark:border-slate-800">Total Cases</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-850 text-slate-600 dark:text-slate-400">
              <tr>
                <td class="p-3 font-semibold text-slate-900 dark:text-white">2-Value BVA</td>
                <td class="p-3">17 (Invalid), 18 (Valid)</td>
                <td class="p-3">60 (Valid), 61 (Invalid)</td>
                <td class="p-3 font-bold text-emerald-600">4 cases</td>
              </tr>
              <tr>
                <td class="p-3 font-semibold text-slate-900 dark:text-white">3-Value BVA</td>
                <td class="p-3">17 (Inv), 18 (Val), 19 (Val)</td>
                <td class="p-3">59 (Val), 60 (Val), 61 (Inv)</td>
                <td class="p-3 font-bold text-purple-600">6 cases</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    `
  },
  {
    id: '3d-printing-cost-farm-economics',
    slug: '3d-printing-cost-farm-economics',
    title: 'How to Accurately Model 3D Printing Production Costs & Print Farm Revenues',
    subtitle: 'Filament volumetric formulas, electrical power consumption, wear depreciation, failure rate buffers, and markup margins.',
    excerpt: 'Detailed financial and manufacturing engineering guide explaining how to calculate filament costs, machine hourly depreciation, electricity overheads, and wholesale profit margins for 3D printing businesses.',
    category: '3D Printing',
    categoryId: '3d-printing',
    difficulty: 'Intermediate',
    readTime: '7 min read',
    publishedDate: 'February 2025',
    updatedDate: 'February 2026',
    author: {
      name: 'Ajinkya Swami',
      role: 'Lead Architect & Founder'
    },
    tags: ['#3DPrinting', '#FilamentCost', '#BambuLab', '#PrintFarm', '#CostEstimation', '#AdditiveManufacturing'],
    toolLink: '/3d-printing-tools/3d-printing-cost-calculator',
    toolName: '3D Printing Cost Calculator',
    toolCategory: '3d-printing',
    keyTakeaways: [
      'Filament Cost Formula: Filament Cost = (Grams Consumed / Spool Weight in Grams) x Spool Price.',
      'Electricity Overhead: Power (kW) x Print Duration (Hours) x Electricity Tariff ($/kWh).',
      'Machine Depreciation: Allocating $0.15 - $0.35 per printing hour amortizes printer lifecycle, nozzle replacements, and belt tensioning.',
      'Failure & Scrap Buffer: Incorporate a 5% to 15% scrap rate into production cost modeling to protect gross margins.'
    ],
    tableOfContents: [
      { id: 'cost-components', title: '1. The 5 Core Cost Components' },
      { id: 'filament-math', title: '2. Filament Volumetric & Weight Math' },
      { id: 'machine-amortization', title: '3. Machine Depreciation & Wear Allocation' },
      { id: 'pricing-strategy', title: '4. Commercial Pricing & Margin Multipliers' }
    ],
    contentHtml: `
      <section id="cost-components" class="space-y-3">
        <h3 class="text-lg font-black text-slate-900 dark:text-white">1. The 5 Core Cost Components of Additive Manufacturing</h3>
        <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          Accurate commercial print pricing goes far beyond raw spool cost. A profitable print farm must model 5 fundamental overhead variables:
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 my-3">
          <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
            <span class="font-bold text-slate-900 dark:text-white">1. Direct Material:</span> Filament, purge waste, support structures, color change flushes.
          </div>
          <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
            <span class="font-bold text-slate-900 dark:text-white">2. Electricity:</span> Heated bed wattage (150W-350W) and hotend heating cycles.
          </div>
          <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
            <span class="font-bold text-slate-900 dark:text-white">3. Depreciation:</span> Machine capital cost divided over 2,000 - 5,000 running hours.
          </div>
          <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
            <span class="font-bold text-slate-900 dark:text-white">4. Labor & Post-Processing:</span> Support removal, sanding, acetone smoothing, packaging.
          </div>
        </div>
      </section>
    `
  },
  {
    id: 'price-elasticity-ped-revenue-optimization',
    slug: 'price-elasticity-ped-revenue-optimization',
    title: 'Price Elasticity of Demand (PED) & Revenue Optimization Strategies',
    subtitle: 'The midpoint formula, demand elasticity regimes, total revenue tests, and cross-price substitution mathematics.',
    excerpt: 'Deep mathematical analysis of microeconomic Price Elasticity of Demand (PED), unit elasticity tipping points, total revenue maximization, and cross-price elasticity (XED).',
    category: 'Economics & Quantitative',
    categoryId: 'economics',
    difficulty: 'Advanced',
    readTime: '7 min read',
    publishedDate: 'February 2025',
    updatedDate: 'February 2026',
    author: {
      name: 'Ajinkya Swami',
      role: 'Lead Architect & Founder'
    },
    tags: ['#PriceElasticity', '#PED', '#Microeconomics', '#RevenueOptimization', '#Economics', '#Calculators'],
    toolLink: '/economics/price-elasticity-demand-calculator',
    toolName: 'Price Elasticity of Demand Calculator',
    toolCategory: 'economics',
    keyTakeaways: [
      'Midpoint Formula eliminates direction asymmetry: PED = ((Q2 - Q1) / ((Q1 + Q2) / 2)) / ((P2 - P1) / ((P1 + P2) / 2)).',
      'Inelastic Demand (|PED| < 1): Price increase raises Total Revenue; price reduction decreases Total Revenue.',
      'Elastic Demand (|PED| > 1): Price reduction increases Total Revenue by stimulating disproportionate volume gains.',
      'Unit Elasticity (|PED| = 1): Point of maximum possible total revenue along a linear downward-sloping demand curve.'
    ],
    tableOfContents: [
      { id: 'ped-midpoint-formula', title: '1. The Midpoint Elasticity Formula' },
      { id: 'elasticity-regimes', title: '2. The 3 Elasticity Regimes' },
      { id: 'total-revenue-test', title: '3. The Total Revenue Test Matrix' },
      { id: 'practical-application', title: '4. Dynamic Pricing Application' }
    ],
    contentHtml: `
      <section id="ped-midpoint-formula" class="space-y-3">
        <h3 class="text-lg font-black text-slate-900 dark:text-white">1. The Midpoint Elasticity Formula</h3>
        <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          Standard percentage change formulas produce different elasticity coefficients depending on whether price rises or falls between two price points. The <strong>Midpoint Method</strong> solves this by dividing changes by the average quantity and average price:
        </p>
        <div class="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-800 dark:text-slate-200">
          PED = [ (Q₂ - Q₁) / ((Q₁ + Q₂) / 2) ] / [ (P₂ - P₁) / ((P₁ + P₂) / 2) ]
        </div>
      </section>
    `
  }
];

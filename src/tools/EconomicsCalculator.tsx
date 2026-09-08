import { useState, useMemo, useEffect } from 'react';
import {
  TrendingUp, Search, Copy, Check, Share2, FileSpreadsheet,
  FileText, BookOpen, HelpCircle, Activity,
  Layers, ChevronRight, Sparkles, Globe,
  Calculator, ArrowUpRight, Award
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import SEO from '../components/SEO';

// -------------------------------------------------------------
// Calculator IDs & Category Definitions
// -------------------------------------------------------------
export type CalcCategory = 'all' | 'micro' | 'macro' | 'popular' | 'recent';

export interface CalculatorMeta {
  id: string;
  name: string;
  category: 'micro' | 'macro';
  isPopular?: boolean;
  shortDesc: string;
  formulaDisplay: string;
  aeoQuestion: string;
  aeoAnswer: string;
  keywords: string[];
  tags: string[];
}

export const CALCULATORS_LIST: CalculatorMeta[] = [
  // Microeconomics (14)
  {
    id: 'ped',
    name: 'Price Elasticity of Demand (PED)',
    category: 'micro',
    isPopular: true,
    shortDesc: 'Measures the responsiveness of quantity demanded to changes in product price.',
    formulaDisplay: 'PED = (% \Delta Q_d) / (% \Delta P)',
    aeoQuestion: 'What is Price Elasticity of Demand?',
    aeoAnswer: 'Price Elasticity of Demand (PED) measures the percentage change in quantity demanded of a good in response to a 1% change in its price. When |PED| > 1, demand is elastic; when |PED| < 1, demand is inelastic.',
    keywords: ['ped', 'elasticity', 'demand elasticity', 'price elasticity', 'midpoint formula'],
    tags: ['Elasticity', 'Consumer Theory', 'Pricing Strategy']
  },
  {
    id: 'yed',
    name: 'Income Elasticity of Demand (YED)',
    category: 'micro',
    shortDesc: 'Determines whether a good is a normal necessity, luxury, or inferior good based on income changes.',
    formulaDisplay: 'YED = (% \Delta Q_d) / (% \Delta Income)',
    aeoQuestion: 'What is Income Elasticity of Demand?',
    aeoAnswer: 'Income Elasticity of Demand (YED) measures how quantity demanded responds to consumer income changes. Positive YED indicates normal goods (YED > 1 is luxury), while negative YED indicates inferior goods.',
    keywords: ['yed', 'income elasticity', 'normal good', 'inferior good', 'luxury good'],
    tags: ['Income', 'Consumer Theory']
  },
  {
    id: 'xed',
    name: 'Cross Elasticity of Demand (XED)',
    category: 'micro',
    shortDesc: 'Evaluates whether two products are substitutes, complements, or unrelated goods.',
    formulaDisplay: 'XED = (% \Delta Q_A) / (% \Delta P_B)',
    aeoQuestion: 'What is Cross Elasticity of Demand?',
    aeoAnswer: 'Cross Price Elasticity of Demand (XED) measures how the demand for Good A shifts when the price of Good B changes. Positive XED indicates substitutes, negative XED indicates complements, and zero indicates independent goods.',
    keywords: ['xed', 'cross elasticity', 'substitute goods', 'complementary goods'],
    tags: ['Market Relations', 'Pricing']
  },
  {
    id: 'pes',
    name: 'Price Elasticity of Supply (PES)',
    category: 'micro',
    shortDesc: 'Calculates the sensitivity of producer supply to market price fluctuations.',
    formulaDisplay: 'PES = (% \Delta Q_s) / (% \Delta P)',
    aeoQuestion: 'What is Price Elasticity of Supply?',
    aeoAnswer: 'Price Elasticity of Supply (PES) quantifies producer responsiveness. High PES means suppliers can rapidly scale output when market prices increase.',
    keywords: ['pes', 'supply elasticity', 'producer responsiveness', 'supply curve'],
    tags: ['Producer Theory', 'Supply']
  },
  {
    id: 'mc',
    name: 'Marginal Cost (MC)',
    category: 'micro',
    isPopular: true,
    shortDesc: 'Calculates the incremental cost incurred by producing one additional unit of output.',
    formulaDisplay: 'MC = \Delta TC / \Delta Q',
    aeoQuestion: 'What is Marginal Cost?',
    aeoAnswer: 'Marginal Cost (MC) is the change in total production cost resulting from producing one extra unit of output. In profit-maximizing competitive firms, production expands until Marginal Revenue equals Marginal Cost (MR = MC).',
    keywords: ['marginal cost', 'mc formula', 'cost of production', 'incremental cost'],
    tags: ['Production', 'Cost Theory']
  },
  {
    id: 'mr',
    name: 'Marginal Revenue (MR)',
    category: 'micro',
    shortDesc: 'Finds the additional revenue earned from selling one extra unit of goods or services.',
    formulaDisplay: 'MR = \Delta TR / \Delta Q',
    aeoQuestion: 'What is Marginal Revenue?',
    aeoAnswer: 'Marginal Revenue (MR) is the change in total revenue divided by the change in quantity sold. A firm maximizes economic profit when MR = MC.',
    keywords: ['marginal revenue', 'mr formula', 'incremental revenue', 'profit maximization'],
    tags: ['Revenue', 'Profit Maximization']
  },
  {
    id: 'ac',
    name: 'Average Cost & Unit Cost (AC / ATC)',
    category: 'micro',
    shortDesc: 'Computes Average Total Cost (ATC), Average Fixed Cost (AFC), and Average Variable Cost (AVC).',
    formulaDisplay: 'AC = Total Cost / Quantity = AFC + AVC',
    aeoQuestion: 'What is Average Cost?',
    aeoAnswer: 'Average Cost (or Unit Cost) is total production cost divided by the total number of units produced. It represents per-unit manufacturing cost at a given scale.',
    keywords: ['average cost', 'unit cost', 'atc', 'afc', 'avc', 'fixed cost per unit'],
    tags: ['Cost Analysis', 'Unit Economics']
  },
  {
    id: 'ar',
    name: 'Average Revenue (AR)',
    category: 'micro',
    shortDesc: 'Computes revenue generated per unit sold, which equals market price in competitive markets.',
    formulaDisplay: 'AR = Total Revenue / Quantity = Price',
    aeoQuestion: 'What is Average Revenue?',
    aeoAnswer: 'Average Revenue (AR) is the average amount of money earned per unit of output sold. In all market structures, Average Revenue equals the unit Selling Price (AR = P).',
    keywords: ['average revenue', 'revenue per unit', 'price ar', 'unit revenue'],
    tags: ['Revenue', 'Pricing']
  },
  {
    id: 'profit',
    name: 'Profit & Profit Margin Calculator',
    category: 'micro',
    isPopular: true,
    shortDesc: 'Calculates Total Revenue, Total Cost, Net Economic Profit, and Profit Margin percentage.',
    formulaDisplay: 'Profit = TR - TC | Margin = (Profit / TR) * 100',
    aeoQuestion: 'How is Economic Profit calculated?',
    aeoAnswer: 'Economic Profit is calculated by subtracting Total Costs (both explicit accounting expenses and implicit opportunity costs) from Total Revenue. Profit Margin is the percentage of revenue retained as profit.',
    keywords: ['profit calculator', 'profit margin', 'economic profit', 'net revenue', 'ebitda'],
    tags: ['Profitability', 'Business Finance']
  },
  {
    id: 'breakeven',
    name: 'Break-Even Point (BEP) & Margin of Safety',
    category: 'micro',
    isPopular: true,
    shortDesc: 'Determines the exact unit sales and revenue required to cover all fixed and variable operating costs.',
    formulaDisplay: 'BEP (Units) = Fixed Costs / (Price - Variable Cost)',
    aeoQuestion: 'What is the Break-Even Point?',
    aeoAnswer: 'The Break-Even Point is the sales volume at which total revenue exactly equals total costs, resulting in zero profit and zero loss. Sales above BEP generate operating profit.',
    keywords: ['break even calculator', 'bep units', 'break even revenue', 'contribution margin', 'margin of safety'],
    tags: ['Cost-Volume-Profit', 'Financial Planning']
  },
  {
    id: 'oppcost',
    name: 'Opportunity Cost Calculator',
    category: 'micro',
    shortDesc: 'Compares the economic return of a chosen investment option against the best forgone alternative.',
    formulaDisplay: 'Opportunity Cost = Return(Forgone Option) - Return(Chosen Option)',
    aeoQuestion: 'What is Opportunity Cost in Economics?',
    aeoAnswer: 'Opportunity Cost is the potential benefit an individual, investor, or business misses out on when choosing one alternative over another. It represents the value of the next best choice.',
    keywords: ['opportunity cost', 'forgone benefit', 'tradeoff calculator', 'economic decision'],
    tags: ['Decision Theory', 'Capital Allocation']
  },
  {
    id: 'cs',
    name: 'Consumer Surplus (CS)',
    category: 'micro',
    shortDesc: 'Calculates the net economic benefit consumers gain from buying at market price below their willingness to pay.',
    formulaDisplay: 'CS = 0.5 * (Max Price - Equilibrium Price) * Quantity',
    aeoQuestion: 'What is Consumer Surplus?',
    aeoAnswer: 'Consumer Surplus is the monetary difference between the highest price consumers are willing to pay for a good and the actual market equilibrium price they pay.',
    keywords: ['consumer surplus', 'willingness to pay', 'welfare economics', 'social surplus'],
    tags: ['Welfare Economics', 'Market Surplus']
  },
  {
    id: 'ps',
    name: 'Producer Surplus (PS)',
    category: 'micro',
    shortDesc: 'Computes producer benefit: the difference between market price received and minimum supply cost.',
    formulaDisplay: 'PS = 0.5 * (Equilibrium Price - Min Price) * Quantity',
    aeoQuestion: 'What is Producer Surplus?',
    aeoAnswer: 'Producer Surplus is the difference between the total amount producers receive from selling a good and the minimum amount they would have accepted to produce it.',
    keywords: ['producer surplus', 'producer welfare', 'social surplus', 'supply benefit'],
    tags: ['Welfare Economics', 'Producer Theory']
  },
  {
    id: 'equilibrium',
    name: 'Supply and Demand Market Equilibrium',
    category: 'micro',
    isPopular: true,
    shortDesc: 'Solves linear supply and demand equations for market clearing Equilibrium Price (P*) and Quantity (Q*).',
    formulaDisplay: 'Qd = a - bP | Qs = c + dP => P* = (a - c) / (b + d)',
    aeoQuestion: 'How is Market Equilibrium calculated?',
    aeoAnswer: 'Market equilibrium occurs at the price where Quantity Demanded equals Quantity Supplied (Qd = Qs). At this point, there is neither a market surplus nor a shortage.',
    keywords: ['market equilibrium', 'supply demand solver', 'equilibrium price', 'equilibrium quantity', 'market clearing'],
    tags: ['Market Equilibrium', 'Core Microeconomics']
  },

  // Macroeconomics (11)
  {
    id: 'gdp_growth',
    name: 'GDP Growth Rate Calculator',
    category: 'macro',
    isPopular: true,
    shortDesc: 'Calculates national economic expansion or contraction percentage between two time periods.',
    formulaDisplay: 'GDP Growth = ((Current GDP - Prior GDP) / Prior GDP) * 100',
    aeoQuestion: 'What is the GDP Growth Rate?',
    aeoAnswer: 'The GDP Growth Rate measures the percentage change in the gross domestic product of a country from one year or quarter to the next, serving as the premier indicator of economic health.',
    keywords: ['gdp growth', 'economic growth rate', 'gdp change', 'recession indicator'],
    tags: ['National Accounts', 'Economic Growth']
  },
  {
    id: 'real_gdp',
    name: 'Real GDP Calculator (Inflation-Adjusted)',
    category: 'macro',
    shortDesc: 'Adjusts nominal economic output for inflation to reveal true physical volume of national production.',
    formulaDisplay: 'Real GDP = (Nominal GDP / GDP Deflator) * 100',
    aeoQuestion: 'What is Real GDP?',
    aeoAnswer: 'Real GDP is an inflation-adjusted measure that reflects the total value of all goods and services produced by an economy in a given year, expressed in base-year constant prices.',
    keywords: ['real gdp', 'constant price gdp', 'inflation adjusted gdp', 'nominal to real gdp'],
    tags: ['Macro Indicators', 'National Output']
  },
  {
    id: 'nominal_gdp',
    name: 'Nominal GDP Calculator',
    category: 'macro',
    shortDesc: 'Computes current-price gross domestic product using real production output and price deflator.',
    formulaDisplay: 'Nominal GDP = Real GDP * (GDP Deflator / 100)',
    aeoQuestion: 'What is Nominal GDP?',
    aeoAnswer: 'Nominal GDP is the total monetary market value of all finished goods and services produced within a country evaluated at current unadjusted market prices.',
    keywords: ['nominal gdp', 'current price gdp', 'gdp current values'],
    tags: ['National Accounts', 'Macroeconomics']
  },
  {
    id: 'gdp_deflator',
    name: 'GDP Deflator (Implicit Price Index)',
    category: 'macro',
    shortDesc: 'Measures the aggregate level of price changes for all domestically produced goods and services.',
    formulaDisplay: 'GDP Deflator = (Nominal GDP / Real GDP) * 100',
    aeoQuestion: 'What is the GDP Deflator?',
    aeoAnswer: 'The GDP Deflator is a comprehensive price index that measures inflation across an entire economy by comparing Nominal GDP to Real GDP.',
    keywords: ['gdp deflator', 'implicit price index', 'economy wide inflation', 'deflator formula'],
    tags: ['Inflation Indices', 'Price Level']
  },
  {
    id: 'per_capita_gdp',
    name: 'Per Capita GDP Calculator',
    category: 'macro',
    shortDesc: 'Breaks down national economic output per resident to estimate average economic standard of living.',
    formulaDisplay: 'Per Capita GDP = Total GDP / Total Population',
    aeoQuestion: 'What does Per Capita GDP measure?',
    aeoAnswer: 'Per Capita GDP divides a countrys gross domestic product by its total population, providing an approximation of the average economic output and standard of living per citizen.',
    keywords: ['per capita gdp', 'gdp per person', 'standard of living', 'economic development'],
    tags: ['Development Economics', 'Living Standards']
  },
  {
    id: 'inflation_rate',
    name: 'Inflation Rate Calculator (CPI Based)',
    category: 'macro',
    isPopular: true,
    shortDesc: 'Calculates the rate of consumer price escalation using baseline and current Consumer Price Index numbers.',
    formulaDisplay: 'Inflation Rate = ((Current CPI - Base CPI) / Base CPI) * 100',
    aeoQuestion: 'How is the Inflation Rate calculated?',
    aeoAnswer: 'The annual inflation rate is calculated as the percentage increase in the Consumer Price Index (CPI) over a specific time period, representing the rate at which purchasing power is declining.',
    keywords: ['inflation rate', 'cpi inflation', 'cost of living change', 'price rise rate'],
    tags: ['Inflation', 'Consumer Prices']
  },
  {
    id: 'purchasing_power',
    name: 'Purchasing Power & Inflation Loss Calculator',
    category: 'macro',
    isPopular: true,
    shortDesc: 'Models how sustained inflation erodes future purchasing power of cash savings over 1 to 50 years.',
    formulaDisplay: 'Future Purchasing Power = Present Value / (1 + r)^t',
    aeoQuestion: 'How does inflation affect Purchasing Power?',
    aeoAnswer: 'Inflation continuously reduces the quantity of goods and services a fixed sum of money can purchase. Over time, compounded inflation significantly erodes the real purchasing power of uninvested cash.',
    keywords: ['purchasing power', 'inflation loss', 'real value of money', 'future buying power'],
    tags: ['Inflation', 'Money Value']
  },
  {
    id: 'cpi',
    name: 'Consumer Price Index (CPI) Calculator',
    category: 'macro',
    shortDesc: 'Measures the cost of a standardized consumer market basket in current year compared to base year.',
    formulaDisplay: 'CPI = (Current Basket Cost / Base Basket Cost) * 100',
    aeoQuestion: 'What is the Consumer Price Index (CPI)?',
    aeoAnswer: 'The Consumer Price Index (CPI) measures the average change over time in prices paid by urban consumers for a representative market basket of consumer goods and services.',
    keywords: ['cpi calculator', 'consumer price index', 'market basket cost', 'headline inflation'],
    tags: ['Price Indices', 'Living Costs']
  },
  {
    id: 'unemployment',
    name: 'Unemployment Rate & Labor Force Metrics',
    category: 'macro',
    shortDesc: 'Calculates official unemployment rate and labor force participation rate from census labor data.',
    formulaDisplay: 'Unemployment Rate = (Unemployed / Labor Force) * 100',
    aeoQuestion: 'How is the Unemployment Rate determined?',
    aeoAnswer: 'The Unemployment Rate is the percentage of the civilian labor force that is jobless, actively seeking work, and available to take a job. It excludes discouraged workers who have exited the labor pool.',
    keywords: ['unemployment rate', 'labor force participation', 'jobless rate', 'employment metrics'],
    tags: ['Labor Economics', 'Employment']
  },
  {
    id: 'economic_growth',
    name: 'Economic Growth & Rule of 70 (Doubling Time)',
    category: 'macro',
    shortDesc: 'Calculates Compound Annual Growth Rate (CAGR) and estimates exact years needed for an economy to double in size.',
    formulaDisplay: 'CAGR = ((Y_t / Y_0)^(1/t) - 1) * 100 | Doubling Time = 70 / Rate',
    aeoQuestion: 'What is the Rule of 70 in Economics?',
    aeoAnswer: 'The Rule of 70 is a mathematical shortcut to estimate the number of years required for a variable (such as GDP, population, or investment capital) to double at a constant annual growth rate: Years to Double ≈ 70 / Annual Growth Rate.',
    keywords: ['rule of 70', 'doubling time', 'economic growth cagr', 'compound economic growth'],
    tags: ['Economic Growth', 'Forecasting']
  },
  {
    id: 'national_income',
    name: 'National Income / GDP (Expenditure Method)',
    category: 'macro',
    shortDesc: 'Aggregates Consumption (C), Investment (I), Government Spending (G), and Net Exports (X - M).',
    formulaDisplay: 'Y = C + I + G + (X - M)',
    aeoQuestion: 'What is the Keynesian Expenditure Formula for GDP?',
    aeoAnswer: 'The expenditure approach calculates Gross Domestic Product as the sum of Consumption (C), Gross Investment (I), Government Purchases (G), and Net Exports (Exports minus Imports, X - M).',
    keywords: ['national income', 'gdp expenditure method', 'keynesian equation', 'c + i + g + nx'],
    tags: ['National Accounts', 'Keynesian Economics']
  }
];

export default function EconomicsCalculator() {
  const [selectedCalcId, setSelectedCalcId] = useState<string>('ped');
  const [activeCategory, setActiveCategory] = useState<CalcCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [recentCalcs, setRecentCalcs] = useState<string[]>(['ped', 'gdp_growth', 'breakeven', 'inflation_rate']);

  // Update recent list in localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('toolique_recent_econ_calcs');
      if (stored) {
        setRecentCalcs(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSelectCalc = (id: string) => {
    setSelectedCalcId(id);
    setRecentCalcs((prev) => {
      const updated = [id, ...prev.filter((item) => item !== id)].slice(0, 6);
      try {
        localStorage.setItem('toolique_recent_econ_calcs', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // -------------------------------------------------------------
  // Input State Variables for All Calculators
  // -------------------------------------------------------------
  // PED
  const [pedQ1, setPedQ1] = useState<number>(100);
  const [pedQ2, setPedQ2] = useState<number>(80);
  const [pedP1, setPedP1] = useState<number>(50);
  const [pedP2, setPedP2] = useState<number>(60);
  const [pedUseMidpoint, setPedUseMidpoint] = useState<boolean>(false);

  // YED
  const [yedQ1, setYedQ1] = useState<number>(100);
  const [yedQ2, setYedQ2] = useState<number>(125);
  const [yedY1, setYedY1] = useState<number>(50000);
  const [yedY2, setYedY2] = useState<number>(60000);

  // XED
  const [xedQA1, setXedQA1] = useState<number>(1000);
  const [xedQA2, setXedQA2] = useState<number>(1200);
  const [xedPB1, setXedPB1] = useState<number>(40);
  const [xedPB2, setXedPB2] = useState<number>(50);

  // PES
  const [pesQS1, setPesQS1] = useState<number>(500);
  const [pesQS2, setPesQS2] = useState<number>(650);
  const [pesP1, setPesP1] = useState<number>(100);
  const [pesP2, setPesP2] = useState<number>(120);

  // MC
  const [mcTC1, setMcTC1] = useState<number>(10000);
  const [mcTC2, setMcTC2] = useState<number>(12500);
  const [mcQ1, setMcQ1] = useState<number>(100);
  const [mcQ2, setMcQ2] = useState<number>(150);

  // MR
  const [mrTR1, setMrTR1] = useState<number>(15000);
  const [mrTR2, setMrTR2] = useState<number>(21000);
  const [mrQ1, setMrQ1] = useState<number>(100);
  const [mrQ2, setMrQ2] = useState<number>(130);

  // AC
  const [acTC, setAcTC] = useState<number>(50000);
  const [acFC, setAcFC] = useState<number>(20000);
  const [acQ, setAcQ] = useState<number>(500);

  // AR
  const [arTR, setArTR] = useState<number>(75000);
  const [arQ, setArQ] = useState<number>(500);

  // Profit
  const [profitTR, setProfitTR] = useState<number>(120000);
  const [profitTC, setProfitTC] = useState<number>(85000);

  // Break-Even
  const [beFC, setBeFC] = useState<number>(150000);
  const [bePrice, setBePrice] = useState<number>(250);
  const [beVC, setBeVC] = useState<number>(150);
  const [beExpectedUnits, setBeExpectedUnits] = useState<number>(2000);

  // Opportunity Cost
  const [oppOptAName, setOppOptAName] = useState<string>('Option A (Stocks Index Fund)');
  const [oppOptAReturn, setOppOptAReturn] = useState<number>(140000);
  const [oppOptBName, setOppOptBName] = useState<string>('Option B (Real Estate Rental)');
  const [oppOptBReturn, setOppOptBReturn] = useState<number>(175000);

  // Consumer Surplus
  const [csMaxP, setCsMaxP] = useState<number>(100);
  const [csEqP, setCsEqP] = useState<number>(60);
  const [csEqQ, setCsEqQ] = useState<number>(500);

  // Producer Surplus
  const [psEqP, setPsEqP] = useState<number>(60);
  const [psMinP, setPsMinP] = useState<number>(20);
  const [psEqQ, setPsEqQ] = useState<number>(500);

  // Market Equilibrium
  const [eqDemandA, setEqDemandA] = useState<number>(1000); // Qd = a - bP
  const [eqDemandB, setEqDemandB] = useState<number>(5);
  const [eqSupplyC, setEqSupplyC] = useState<number>(200); // Qs = c + dP
  const [eqSupplyD, setEqSupplyD] = useState<number>(3);

  // Macro - GDP Growth
  const [gdpPrior, setGdpPrior] = useState<number>(3.2); // trillion or INR
  const [gdpCurrent, setGdpCurrent] = useState<number>(3.5);

  // Macro - Real GDP
  const [realNominalGdp, setRealNominalGdp] = useState<number>(3500);
  const [realDeflator, setRealDeflator] = useState<number>(112);

  // Macro - Nominal GDP
  const [nomRealGdp, setNomRealGdp] = useState<number>(3125);
  const [nomDeflator, setNomDeflator] = useState<number>(112);

  // Macro - GDP Deflator
  const [deflatorNominal, setDeflatorNominal] = useState<number>(3500);
  const [deflatorReal, setDeflatorReal] = useState<number>(3125);

  // Macro - Per Capita GDP
  const [perCapGdp, setPerCapGdp] = useState<number>(3750000000000);
  const [perCapPop, setPerCapPop] = useState<number>(1420000000);

  // Macro - Inflation Rate
  const [infBaseCpi, setInfBaseCpi] = useState<number>(150);
  const [infCurrCpi, setInfCurrCpi] = useState<number>(159);

  // Macro - Purchasing Power
  const [ppInitialAmt, setPpInitialAmt] = useState<number>(100000);
  const [ppInfRate, setPpInfRate] = useState<number>(6.0); // %
  const [ppYears, setPpYears] = useState<number>(10);

  // Macro - CPI
  const [cpiCurrBasket, setCpiCurrBasket] = useState<number>(1850);
  const [cpiBaseBasket, setCpiBaseBasket] = useState<number>(1500);

  // Macro - Unemployment
  const [unempUnemployed, setUnempUnemployed] = useState<number>(35); // millions or thousands
  const [unempLaborForce, setUnempLaborForce] = useState<number>(500);
  const [unempWorkingAgePop, setUnempWorkingAgePop] = useState<number>(950);

  // Macro - Economic Growth (Rule of 70)
  const [egY0, setEgY0] = useState<number>(2000);
  const [egYt, setEgYt] = useState<number>(3800);
  const [egYears, setEgYears] = useState<number>(10);

  // Macro - National Income (C + I + G + NX)
  const [niC, setNiC] = useState<number>(2200);
  const [niI, setNiI] = useState<number>(850);
  const [niG, setNiG] = useState<number>(650);
  const [niX, setNiX] = useState<number>(450);
  const [niM, setNiM] = useState<number>(550);

  // Active Calculator Meta Object
  const activeCalcMeta = useMemo(() => {
    return CALCULATORS_LIST.find((c) => c.id === selectedCalcId) || CALCULATORS_LIST[0];
  }, [selectedCalcId]);

  // Filtered List
  const filteredCalculators = useMemo(() => {
    return CALCULATORS_LIST.filter((calc) => {
      // Category check
      if (activeCategory === 'micro' && calc.category !== 'micro') return false;
      if (activeCategory === 'macro' && calc.category !== 'macro') return false;
      if (activeCategory === 'popular' && !calc.isPopular) return false;
      if (activeCategory === 'recent' && !recentCalcs.includes(calc.id)) return false;

      // Search check
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = calc.name.toLowerCase().includes(q);
        const matchDesc = calc.shortDesc.toLowerCase().includes(q);
        const matchKeywords = calc.keywords.some((kw) => kw.toLowerCase().includes(q));
        const matchTags = calc.tags.some((tag) => tag.toLowerCase().includes(q));
        return matchTitle || matchDesc || matchKeywords || matchTags;
      }
      return true;
    });
  }, [activeCategory, searchQuery, recentCalcs]);

  // -------------------------------------------------------------
  // Math Computation Engine
  // -------------------------------------------------------------
  const resultData = useMemo(() => {
    switch (selectedCalcId) {
      // 1. PED
      case 'ped': {
        const deltaQ = pedQ2 - pedQ1;
        const deltaP = pedP2 - pedP1;
        let pctQ = 0;
        let pctP = 0;
        let pedValue = 0;

        if (pedUseMidpoint) {
          const avgQ = (pedQ1 + pedQ2) / 2;
          const avgP = (pedP1 + pedP2) / 2;
          pctQ = avgQ !== 0 ? (deltaQ / avgQ) * 100 : 0;
          pctP = avgP !== 0 ? (deltaP / avgP) * 100 : 0;
        } else {
          pctQ = pedQ1 !== 0 ? (deltaQ / pedQ1) * 100 : 0;
          pctP = pedP1 !== 0 ? (deltaP / pedP1) * 100 : 0;
        }

        pedValue = pctP !== 0 ? pctQ / pctP : 0;
        const absPed = Math.abs(pedValue);

        let classification = 'Inelastic Demand';
        let badgeColor = 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200';
        let interpretation = 'Consumers are relatively unresponsive to price changes. A price increase will increase Total Revenue.';

        if (absPed === 0) {
          classification = 'Perfectly Inelastic Demand (|PED| = 0)';
          badgeColor = 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200';
          interpretation = 'Quantity demanded does not change at all when price changes (e.g. life-saving medicine).';
        } else if (absPed > 1) {
          classification = 'Elastic Demand (|PED| > 1)';
          badgeColor = 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200';
          interpretation = 'Consumers are highly responsive to price changes. A price increase will cause Total Revenue to drop.';
        } else if (Math.abs(absPed - 1) < 0.001) {
          classification = 'Unitary Elastic Demand (|PED| = 1)';
          badgeColor = 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200';
          interpretation = 'Percentage change in quantity demanded exactly matches percentage change in price. Total Revenue remains unchanged.';
        }

        const tr1 = pedP1 * pedQ1;
        const tr2 = pedP2 * pedQ2;
        const deltaTR = tr2 - tr1;

        return {
          primaryValue: `${pedValue.toFixed(2)}`,
          primaryLabel: 'Price Elasticity of Demand (PED)',
          classification,
          badgeColor,
          interpretation,
          steps: [
            `1. Change in Quantity (ΔQ) = ${pedQ2} - ${pedQ1} = ${deltaQ > 0 ? '+' : ''}${deltaQ}`,
            `2. Change in Price (ΔP) = ₹${pedP2} - ₹${pedP1} = ${deltaP > 0 ? '+' : ''}₹${deltaP}`,
            pedUseMidpoint
              ? `3. Midpoint %ΔQ = (${deltaQ} / ${((pedQ1 + pedQ2)/2).toFixed(1)}) × 100 = ${pctQ.toFixed(2)}%`
              : `3. Standard %ΔQ = (${deltaQ} / ${pedQ1}) × 100 = ${pctQ.toFixed(2)}%`,
            pedUseMidpoint
              ? `4. Midpoint %ΔP = (${deltaP} / ${((pedP1 + pedP2)/2).toFixed(1)}) × 100 = ${pctP.toFixed(2)}%`
              : `4. Standard %ΔP = (${deltaP} / ${pedP1}) × 100 = ${pctP.toFixed(2)}%`,
            `5. PED = %ΔQ ÷ %ΔP = (${pctQ.toFixed(2)}%) ÷ (${pctP.toFixed(2)}%) = ${pedValue.toFixed(2)}`,
            `6. Absolute Elasticity |PED| = ${absPed.toFixed(2)} → ${classification}`,
            `7. Total Revenue Impact: TR changed from ₹${tr1.toLocaleString('en-IN')} to ₹${tr2.toLocaleString('en-IN')} (${deltaTR >= 0 ? '+' : ''}₹${deltaTR.toLocaleString('en-IN')})`
          ]
        };
      }

      // 2. YED
      case 'yed': {
        const deltaQ = yedQ2 - yedQ1;
        const deltaY = yedY2 - yedY1;
        const pctQ = yedQ1 !== 0 ? (deltaQ / yedQ1) * 100 : 0;
        const pctY = yedY1 !== 0 ? (deltaY / yedY1) * 100 : 0;
        const yedValue = pctY !== 0 ? pctQ / pctY : 0;

        let classification = 'Normal Good (Necessity)';
        let badgeColor = 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200';
        let interpretation = 'Demand increases moderately as income rises (0 < YED ≤ 1). Standard staple good.';

        if (yedValue > 1) {
          classification = 'Normal Good (Luxury / Superior)';
          badgeColor = 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200';
          interpretation = 'Demand increases at a faster rate than income growth (YED > 1). High-end branded goods, luxury travel, etc.';
        } else if (yedValue < 0) {
          classification = 'Inferior Good';
          badgeColor = 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200';
          interpretation = 'Demand decreases as consumer income increases (YED < 0). Consumers switch to higher quality substitutes.';
        }

        return {
          primaryValue: `${yedValue.toFixed(2)}`,
          primaryLabel: 'Income Elasticity of Demand (YED)',
          classification,
          badgeColor,
          interpretation,
          steps: [
            `1. Change in Demand (ΔQ) = ${yedQ2} - ${yedQ1} = ${deltaQ > 0 ? '+' : ''}${deltaQ} units`,
            `2. Change in Income (ΔY) = ₹${yedY2.toLocaleString('en-IN')} - ₹${yedY1.toLocaleString('en-IN')} = +₹${deltaY.toLocaleString('en-IN')}`,
            `3. % Change in Demand (%ΔQ) = (${deltaQ} / ${yedQ1}) × 100 = ${pctQ.toFixed(2)}%`,
            `4. % Change in Income (%ΔY) = (${deltaY} / ${yedY1}) × 100 = ${pctY.toFixed(2)}%`,
            `5. YED = %ΔQ ÷ %ΔY = ${pctQ.toFixed(2)}% ÷ ${pctY.toFixed(2)}% = ${yedValue.toFixed(2)}`,
            `6. Result Interpretation: ${classification}`
          ]
        };
      }

      // 3. XED
      case 'xed': {
        const deltaQA = xedQA2 - xedQA1;
        const deltaPB = xedPB2 - xedPB1;
        const pctQA = xedQA1 !== 0 ? (deltaQA / xedQA1) * 100 : 0;
        const pctPB = xedPB1 !== 0 ? (deltaPB / xedPB1) * 100 : 0;
        const xedValue = pctPB !== 0 ? pctQA / pctPB : 0;

        let classification = 'Unrelated Goods (XED ≈ 0)';
        let badgeColor = 'text-zinc-600 bg-zinc-50 dark:bg-zinc-800 border-zinc-200';
        let interpretation = 'Price changes in Product B have no measurable effect on the demand for Product A.';

        if (xedValue > 0.05) {
          classification = 'Substitute Goods (XED > 0)';
          badgeColor = 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200';
          interpretation = 'When Price of B rises, consumers switch and buy more of Product A (e.g. Tea & Coffee).';
        } else if (xedValue < -0.05) {
          classification = 'Complementary Goods (XED < 0)';
          badgeColor = 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200';
          interpretation = 'When Price of B rises, demand for Product A falls because they are consumed jointly (e.g. Cars & Fuel).';
        }

        return {
          primaryValue: `${xedValue.toFixed(2)}`,
          primaryLabel: 'Cross Elasticity of Demand (XED)',
          classification,
          badgeColor,
          interpretation,
          steps: [
            `1. % Change in Demand for Good A (%ΔQ_A) = ((${xedQA2} - ${xedQA1}) / ${xedQA1}) × 100 = ${pctQA.toFixed(2)}%`,
            `2. % Change in Price of Good B (%ΔP_B) = ((₹${xedPB2} - ₹${xedPB1}) / ₹${xedPB1}) × 100 = ${pctPB.toFixed(2)}%`,
            `3. XED = %ΔQ_A ÷ %ΔP_B = ${pctQA.toFixed(2)}% ÷ ${pctPB.toFixed(2)}% = ${xedValue.toFixed(2)}`,
            `4. Relationship: ${classification}`
          ]
        };
      }

      // 4. PES
      case 'pes': {
        const deltaQ = pesQS2 - pesQS1;
        const deltaP = pesP2 - pesP1;
        const pctQ = pesQS1 !== 0 ? (deltaQ / pesQS1) * 100 : 0;
        const pctP = pesP1 !== 0 ? (deltaP / pesP1) * 100 : 0;
        const pesValue = pctP !== 0 ? pctQ / pctP : 0;

        let classification = 'Inelastic Supply (PES < 1)';
        let badgeColor = 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200';
        let interpretation = 'Suppliers cannot quickly adjust output to price shifts (e.g., agricultural crops, heavy industrial machinery).';

        if (pesValue > 1) {
          classification = 'Elastic Supply (PES > 1)';
          badgeColor = 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200';
          interpretation = 'Suppliers can easily ramp up production when market price increases.';
        } else if (Math.abs(pesValue - 1) < 0.01) {
          classification = 'Unitary Elastic Supply (PES = 1)';
          badgeColor = 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200';
          interpretation = 'Quantity supplied changes by the exact same percentage as market price.';
        }

        return {
          primaryValue: `${pesValue.toFixed(2)}`,
          primaryLabel: 'Price Elasticity of Supply (PES)',
          classification,
          badgeColor,
          interpretation,
          steps: [
            `1. %ΔQ_s = ((${pesQS2} - ${pesQS1}) / ${pesQS1}) × 100 = ${pctQ.toFixed(2)}%`,
            `2. %ΔP = ((${pesP2} - ${pesP1}) / ${pesP1}) × 100 = ${pctP.toFixed(2)}%`,
            `3. PES = %ΔQ_s ÷ %ΔP = ${pctQ.toFixed(2)}% ÷ ${pctP.toFixed(2)}% = ${pesValue.toFixed(2)}`,
            `4. Supply Behavior: ${classification}`
          ]
        };
      }

      // 5. MC
      case 'mc': {
        const deltaTC = mcTC2 - mcTC1;
        const deltaQ = mcQ2 - mcQ1;
        const mcValue = deltaQ !== 0 ? deltaTC / deltaQ : 0;

        return {
          primaryValue: `₹${mcValue.toFixed(2)} / unit`,
          primaryLabel: 'Marginal Cost (MC)',
          classification: `Incremental Cost: ₹${mcValue.toFixed(2)} per additional unit`,
          badgeColor: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200',
          interpretation: `Every extra unit produced in this range adds approximately ₹${mcValue.toFixed(2)} to total operating expenditure.`,
          steps: [
            `1. Change in Total Cost (ΔTC) = ₹${mcTC2.toLocaleString('en-IN')} - ₹${mcTC1.toLocaleString('en-IN')} = ₹${deltaTC.toLocaleString('en-IN')}`,
            `2. Change in Output Quantity (ΔQ) = ${mcQ2} - ${mcQ1} = ${deltaQ} units`,
            `3. Marginal Cost (MC) = ΔTC ÷ ΔQ = ₹${deltaTC.toLocaleString('en-IN')} ÷ ${deltaQ} = ₹${mcValue.toFixed(2)} per unit`
          ]
        };
      }

      // 6. MR
      case 'mr': {
        const deltaTR = mrTR2 - mrTR1;
        const deltaQ = mrQ2 - mrQ1;
        const mrValue = deltaQ !== 0 ? deltaTR / deltaQ : 0;

        return {
          primaryValue: `₹${mrValue.toFixed(2)} / unit`,
          primaryLabel: 'Marginal Revenue (MR)',
          classification: `Incremental Revenue: ₹${mrValue.toFixed(2)} per additional unit`,
          badgeColor: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200',
          interpretation: `Selling an extra unit in this range generates ₹${mrValue.toFixed(2)} of additional gross revenue.`,
          steps: [
            `1. Change in Total Revenue (ΔTR) = ₹${mrTR2.toLocaleString('en-IN')} - ₹${mrTR1.toLocaleString('en-IN')} = ₹${deltaTR.toLocaleString('en-IN')}`,
            `2. Change in Quantity (ΔQ) = ${mrQ2} - ${mrQ1} = ${deltaQ} units`,
            `3. Marginal Revenue (MR) = ΔTR ÷ ΔQ = ₹${deltaTR.toLocaleString('en-IN')} ÷ ${deltaQ} = ₹${mrValue.toFixed(2)} per unit`
          ]
        };
      }

      // 7. AC
      case 'ac': {
        const q = Math.max(1, acQ);
        const atc = acTC / q;
        const afc = acFC / q;
        const vc = Math.max(0, acTC - acFC);
        const avc = vc / q;

        return {
          primaryValue: `₹${atc.toFixed(2)} / unit`,
          primaryLabel: 'Average Total Cost (ATC)',
          classification: `Unit Cost: ₹${atc.toFixed(2)} (AFC: ₹${afc.toFixed(2)} + AVC: ₹${avc.toFixed(2)})`,
          badgeColor: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200',
          interpretation: `At ${q} units of output, fixed overhead accounts for ₹${afc.toFixed(2)} and variable expenses account for ₹${avc.toFixed(2)} per unit.`,
          steps: [
            `1. Total Cost (TC) = ₹${acTC.toLocaleString('en-IN')} | Quantity (Q) = ${q} units`,
            `2. Average Total Cost (ATC) = TC ÷ Q = ₹${acTC.toLocaleString('en-IN')} ÷ ${q} = ₹${atc.toFixed(2)} per unit`,
            `3. Fixed Cost (FC) = ₹${acFC.toLocaleString('en-IN')} → Average Fixed Cost (AFC) = ₹${afc.toFixed(2)} per unit`,
            `4. Variable Cost (VC) = TC - FC = ₹${vc.toLocaleString('en-IN')} → Average Variable Cost (AVC) = ₹${avc.toFixed(2)} per unit`
          ]
        };
      }

      // 8. AR
      case 'ar': {
        const q = Math.max(1, arQ);
        const arValue = arTR / q;

        return {
          primaryValue: `₹${arValue.toFixed(2)} / unit`,
          primaryLabel: 'Average Revenue (AR)',
          classification: `Realized Price per Unit = ₹${arValue.toFixed(2)}`,
          badgeColor: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200',
          interpretation: `In competitive markets, Average Revenue exactly equals the unit selling price (AR = Price = ₹${arValue.toFixed(2)}).`,
          steps: [
            `1. Total Revenue (TR) = ₹${arTR.toLocaleString('en-IN')}`,
            `2. Quantity Sold (Q) = ${q} units`,
            `3. Average Revenue (AR) = TR ÷ Q = ₹${arTR.toLocaleString('en-IN')} ÷ ${q} = ₹${arValue.toFixed(2)} / unit`
          ]
        };
      }

      // 9. Profit
      case 'profit': {
        const profitVal = profitTR - profitTC;
        const profitMargin = profitTR !== 0 ? (profitVal / profitTR) * 100 : 0;
        const returnOnCost = profitTC !== 0 ? (profitVal / profitTC) * 100 : 0;

        let classification = 'Operating Profit';
        let badgeColor = 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200';
        if (profitVal < 0) {
          classification = 'Operating Loss';
          badgeColor = 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200';
        } else if (profitVal === 0) {
          classification = 'Normal Profit (Break-Even)';
          badgeColor = 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200';
        }

        return {
          primaryValue: `₹${profitVal.toLocaleString('en-IN')}`,
          primaryLabel: 'Net Economic Profit',
          classification: `${classification} (Margin: ${profitMargin.toFixed(2)}%)`,
          badgeColor,
          interpretation: profitVal >= 0
            ? `The enterprise retains ${profitMargin.toFixed(2)}% of every rupee of revenue after all costs, yielding a ${returnOnCost.toFixed(2)}% return on total costs.`
            : `Expenses exceed revenues by ₹${Math.abs(profitVal).toLocaleString('en-IN')}. Cost reduction or price adjustments are needed.`,
          steps: [
            `1. Total Revenue (TR) = ₹${profitTR.toLocaleString('en-IN')}`,
            `2. Total Cost (TC) = ₹${profitTC.toLocaleString('en-IN')}`,
            `3. Net Profit = TR - TC = ₹${profitTR.toLocaleString('en-IN')} - ₹${profitTC.toLocaleString('en-IN')} = ₹${profitVal.toLocaleString('en-IN')}`,
            `4. Profit Margin = (Profit ÷ TR) × 100 = (${profitVal} ÷ ${profitTR}) × 100 = ${profitMargin.toFixed(2)}%`,
            `5. Return on Cost (Markup) = (Profit ÷ TC) × 100 = ${returnOnCost.toFixed(2)}%`
          ]
        };
      }

      // 10. Break-Even
      case 'breakeven': {
        const unitContrib = Math.max(0.01, bePrice - beVC);
        const contribMarginRatio = bePrice > 0 ? (unitContrib / bePrice) * 100 : 0;
        const beUnits = unitContrib > 0 ? Math.ceil(beFC / unitContrib) : 0;
        const beRevenue = beUnits * bePrice;

        const marginOfSafetyUnits = beExpectedUnits - beUnits;
        const marginOfSafetyPct = beExpectedUnits > 0 ? (marginOfSafetyUnits / beExpectedUnits) * 100 : 0;

        return {
          primaryValue: `${beUnits.toLocaleString('en-IN')} Units`,
          primaryLabel: 'Break-Even Sales Volume',
          classification: `Break-Even Revenue: ₹${beRevenue.toLocaleString('en-IN')}`,
          badgeColor: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200',
          interpretation: `Selling at least ${beUnits} units covers all ₹${beFC.toLocaleString('en-IN')} fixed overhead. At your expected volume of ${beExpectedUnits} units, the Margin of Safety is ${marginOfSafetyPct.toFixed(1)}%.`,
          steps: [
            `1. Unit Selling Price (P) = ₹${bePrice} | Unit Variable Cost (VC) = ₹${beVC}`,
            `2. Unit Contribution Margin = P - VC = ₹${bePrice} - ₹${beVC} = ₹${unitContrib} / unit`,
            `3. Contribution Margin Ratio = (₹${unitContrib} ÷ ₹${bePrice}) × 100 = ${contribMarginRatio.toFixed(2)}%`,
            `4. Break-Even Units = Fixed Costs ÷ Unit Contribution = ₹${beFC.toLocaleString('en-IN')} ÷ ₹${unitContrib} = ${beUnits.toLocaleString('en-IN')} units`,
            `5. Break-Even Revenue = ${beUnits} units × ₹${bePrice} = ₹${beRevenue.toLocaleString('en-IN')}`,
            `6. Margin of Safety = ${beExpectedUnits} - ${beUnits} = ${marginOfSafetyUnits > 0 ? '+' : ''}${marginOfSafetyUnits.toLocaleString('en-IN')} units (${marginOfSafetyPct.toFixed(1)}%)`
          ],
          chartData: { beUnits, bePrice, beVC, beFC, expectedUnits: beExpectedUnits }
        };
      }

      // 11. Opportunity Cost
      case 'oppcost': {
        const diff = oppOptBReturn - oppOptAReturn;
        const higherOption = diff >= 0 ? oppOptBName : oppOptAName;
        const oppCostOfChoosingA = Math.max(0, diff);

        return {
          primaryValue: `₹${oppCostOfChoosingA.toLocaleString('en-IN')}`,
          primaryLabel: `Opportunity Cost of Choosing ${oppOptAName}`,
          classification: `Optimal Choice: ${higherOption}`,
          badgeColor: diff >= 0
            ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200'
            : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200',
          interpretation: diff > 0
            ? `Choosing ${oppOptAName} means forgoing ₹${diff.toLocaleString('en-IN')} in superior financial return offered by ${oppOptBName}.`
            : `${oppOptAName} generates ₹${Math.abs(diff).toLocaleString('en-IN')} more return than ${oppOptBName}. The opportunity cost is zero.`,
          steps: [
            `1. Return of ${oppOptAName} = ₹${oppOptAReturn.toLocaleString('en-IN')}`,
            `2. Return of ${oppOptBName} = ₹${oppOptBReturn.toLocaleString('en-IN')}`,
            `3. Opportunity Cost (Choosing ${oppOptAName} over ${oppOptBName}) = ₹${oppOptBReturn.toLocaleString('en-IN')} - ₹${oppOptAReturn.toLocaleString('en-IN')} = ₹${oppCostOfChoosingA.toLocaleString('en-IN')}`,
            `4. Economic Decision: ${higherOption} provides the highest total payoff.`
          ]
        };
      }

      // 12. CS
      case 'cs': {
        const priceDiff = Math.max(0, csMaxP - csEqP);
        const csValue = 0.5 * priceDiff * csEqQ;

        return {
          primaryValue: `₹${csValue.toLocaleString('en-IN')}`,
          primaryLabel: 'Consumer Surplus (CS)',
          classification: `Welfare Benefit: ₹${csValue.toLocaleString('en-IN')}`,
          badgeColor: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200',
          interpretation: `Consumers collectively save ₹${csValue.toLocaleString('en-IN')} by purchasing at the equilibrium price of ₹${csEqP} rather than their maximum reservation price of ₹${csMaxP}.`,
          steps: [
            `1. Max Willingness to Pay (P_max) = ₹${csMaxP}`,
            `2. Market Equilibrium Price (P_eq) = ₹${csEqP}`,
            `3. Market Equilibrium Quantity (Q_eq) = ${csEqQ} units`,
            `4. Price Differential = P_max - P_eq = ₹${csMaxP} - ₹${csEqP} = ₹${priceDiff}`,
            `5. Consumer Surplus = 0.5 × (P_max - P_eq) × Q_eq = 0.5 × ₹${priceDiff} × ${csEqQ} = ₹${csValue.toLocaleString('en-IN')}`
          ]
        };
      }

      // 13. PS
      case 'ps': {
        const priceDiff = Math.max(0, psEqP - psMinP);
        const psValue = 0.5 * priceDiff * psEqQ;

        return {
          primaryValue: `₹${psValue.toLocaleString('en-IN')}`,
          primaryLabel: 'Producer Surplus (PS)',
          classification: `Producer Benefit: ₹${psValue.toLocaleString('en-IN')}`,
          badgeColor: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200',
          interpretation: `Producers earn ₹${psValue.toLocaleString('en-IN')} in excess revenue above their minimum reservation cost.`,
          steps: [
            `1. Market Equilibrium Price (P_eq) = ₹${psEqP}`,
            `2. Minimum Supply Price (P_min) = ₹${psMinP}`,
            `3. Market Equilibrium Quantity (Q_eq) = ${psEqQ} units`,
            `4. Producer Surplus = 0.5 × (P_eq - P_min) × Q_eq = 0.5 × (₹${psEqP} - ₹${psMinP}) × ${psEqQ} = ₹${psValue.toLocaleString('en-IN')}`
          ]
        };
      }

      // 14. Supply and Demand Equilibrium
      case 'equilibrium': {
        const denom = eqDemandB + eqSupplyD;
        const pEq = denom !== 0 ? (eqDemandA - eqSupplyC) / denom : 0;
        const qEq = eqDemandA - eqDemandB * pEq;

        const maxDemandP = eqDemandB > 0 ? eqDemandA / eqDemandB : 0;
        const cs = 0.5 * Math.max(0, maxDemandP - pEq) * Math.max(0, qEq);
        const ps = 0.5 * Math.max(0, pEq) * Math.max(0, qEq);
        const totalSurplus = cs + ps;

        return {
          primaryValue: `P* = ₹${pEq.toFixed(2)} | Q* = ${qEq.toFixed(0)} units`,
          primaryLabel: 'Market Equilibrium Point (P*, Q*)',
          classification: `Total Social Welfare: ₹${Math.round(totalSurplus).toLocaleString('en-IN')}`,
          badgeColor: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200',
          interpretation: `At P* = ₹${pEq.toFixed(2)}, market demand exactly equals market supply at ${qEq.toFixed(0)} units. Market clears with zero shortage and zero surplus.`,
          steps: [
            `1. Demand Equation: Qd = ${eqDemandA} - ${eqDemandB}P`,
            `2. Supply Equation: Qs = ${eqSupplyC} + ${eqSupplyD}P`,
            `3. Set Qd = Qs: ${eqDemandA} - ${eqDemandB}P = ${eqSupplyC} + ${eqSupplyD}P`,
            `4. Rearrange: (${eqDemandB} + ${eqSupplyD})P = ${eqDemandA} - ${eqSupplyC} => ${denom}P = ${eqDemandA - eqSupplyC}`,
            `5. Equilibrium Price P* = ${eqDemandA - eqSupplyC} ÷ ${denom} = ₹${pEq.toFixed(2)}`,
            `6. Equilibrium Quantity Q* = ${eqDemandA} - (${eqDemandB} × ${pEq.toFixed(2)}) = ${qEq.toFixed(2)} units`,
            `7. Consumer Surplus = ₹${Math.round(cs).toLocaleString('en-IN')} | Producer Surplus = ₹${Math.round(ps).toLocaleString('en-IN')}`
          ],
          chartData: { a: eqDemandA, b: eqDemandB, c: eqSupplyC, d: eqSupplyD, pEq, qEq, maxP: maxDemandP }
        };
      }

      // 15. GDP Growth Rate
      case 'gdp_growth': {
        const delta = gdpCurrent - gdpPrior;
        const growthRate = gdpPrior !== 0 ? (delta / gdpPrior) * 100 : 0;

        let classification = 'Economic Expansion';
        let badgeColor = 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200';
        let interpretation = 'The national economy expanded over the measured period, indicating rising economic output.';

        if (growthRate < 0) {
          classification = 'Economic Contraction / Recession Risk';
          badgeColor = 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200';
          interpretation = 'Gross domestic product shrank. Two consecutive quarters of negative growth constitute a technical recession.';
        } else if (growthRate === 0) {
          classification = 'Stagnant Growth';
          badgeColor = 'text-zinc-600 bg-zinc-50 dark:bg-zinc-800 border-zinc-200';
          interpretation = 'Zero economic output change between comparison periods.';
        }

        return {
          primaryValue: `${growthRate.toFixed(2)}%`,
          primaryLabel: 'Annual GDP Growth Rate',
          classification,
          badgeColor,
          interpretation,
          steps: [
            `1. Prior Period GDP = ${gdpPrior.toLocaleString('en-IN')}`,
            `2. Current Period GDP = ${gdpCurrent.toLocaleString('en-IN')}`,
            `3. Absolute Change (ΔGDP) = ${gdpCurrent} - ${gdpPrior} = ${delta > 0 ? '+' : ''}${delta.toFixed(2)}`,
            `4. GDP Growth Rate = (ΔGDP ÷ Prior GDP) × 100 = (${delta.toFixed(2)} ÷ ${gdpPrior}) × 100 = ${growthRate.toFixed(2)}%`
          ]
        };
      }

      // 16. Real GDP
      case 'real_gdp': {
        const deflator = Math.max(1, realDeflator);
        const realGdp = (realNominalGdp / deflator) * 100;
        const inflationImpact = realNominalGdp - realGdp;

        return {
          primaryValue: `${realGdp.toFixed(2)}`,
          primaryLabel: 'Real GDP (Base-Year Constant Prices)',
          classification: `Price Level Deflator: ${deflator}`,
          badgeColor: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200',
          interpretation: `Inflation inflated nominal output by ${((deflator - 100)).toFixed(1)}%. Real economic production without price distortion is ${realGdp.toFixed(2)}.`,
          steps: [
            `1. Nominal GDP = ${realNominalGdp.toLocaleString('en-IN')}`,
            `2. GDP Deflator Index = ${deflator}`,
            `3. Real GDP = (Nominal GDP ÷ GDP Deflator) × 100 = (${realNominalGdp} ÷ ${deflator}) × 100 = ${realGdp.toFixed(2)}`,
            `4. Pure Inflation Component = Nominal - Real = ${inflationImpact.toFixed(2)}`
          ]
        };
      }

      // 17. Nominal GDP
      case 'nominal_gdp': {
        const nomGdp = nomRealGdp * (nomDeflator / 100);

        return {
          primaryValue: `${nomGdp.toFixed(2)}`,
          primaryLabel: 'Nominal GDP (Current Market Prices)',
          classification: `Real Output: ${nomRealGdp} @ Index ${nomDeflator}`,
          badgeColor: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200',
          interpretation: `Evaluating base-year production of ${nomRealGdp} at today's price index of ${nomDeflator} yields a nominal GDP of ${nomGdp.toFixed(2)}.`,
          steps: [
            `1. Real GDP = ${nomRealGdp.toLocaleString('en-IN')}`,
            `2. GDP Deflator = ${nomDeflator}`,
            `3. Nominal GDP = Real GDP × (GDP Deflator ÷ 100) = ${nomRealGdp} × (${nomDeflator} ÷ 100) = ${nomGdp.toFixed(2)}`
          ]
        };
      }

      // 18. GDP Deflator
      case 'gdp_deflator': {
        const real = Math.max(0.01, deflatorReal);
        const deflator = (deflatorNominal / real) * 100;
        const cumulativeInflation = deflator - 100;

        return {
          primaryValue: `${deflator.toFixed(2)}`,
          primaryLabel: 'GDP Deflator Price Index',
          classification: `Cumulative Inflation: ${cumulativeInflation >= 0 ? '+' : ''}${cumulativeInflation.toFixed(2)}%`,
          badgeColor: 'text-sky-600 bg-sky-50 dark:bg-sky-950/40 border-sky-200',
          interpretation: `The general price level for all domestically produced goods and services is ${deflator.toFixed(2)}% of base-year prices (${cumulativeInflation.toFixed(2)}% aggregate price increase).`,
          steps: [
            `1. Nominal GDP = ${deflatorNominal.toLocaleString('en-IN')}`,
            `2. Real GDP = ${deflatorReal.toLocaleString('en-IN')}`,
            `3. GDP Deflator = (Nominal GDP ÷ Real GDP) × 100 = (${deflatorNominal} ÷ ${deflatorReal}) × 100 = ${deflator.toFixed(2)}`,
            `4. Aggregate Price Rise Since Base Year = ${deflator.toFixed(2)} - 100 = ${cumulativeInflation.toFixed(2)}%`
          ]
        };
      }

      // 19. Per Capita GDP
      case 'per_capita_gdp': {
        const pop = Math.max(1, perCapPop);
        const perCap = perCapGdp / pop;

        return {
          primaryValue: `₹${Math.round(perCap).toLocaleString('en-IN')} / person`,
          primaryLabel: 'Per Capita GDP',
          classification: `Average Output per Resident`,
          badgeColor: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200',
          interpretation: `Divides total national economic output across all ${pop.toLocaleString('en-IN')} citizens to gauge average economic productivity.`,
          steps: [
            `1. Total National GDP = ₹${perCapGdp.toLocaleString('en-IN')}`,
            `2. Total Population = ${pop.toLocaleString('en-IN')} residents`,
            `3. Per Capita GDP = Total GDP ÷ Population = ₹${perCapGdp.toLocaleString('en-IN')} ÷ ${pop.toLocaleString('en-IN')} = ₹${perCap.toFixed(2)} / person`
          ]
        };
      }

      // 20. Inflation Rate
      case 'inflation_rate': {
        const delta = infCurrCpi - infBaseCpi;
        const infRate = infBaseCpi !== 0 ? (delta / infBaseCpi) * 100 : 0;

        let classification = 'Moderate Inflation';
        let badgeColor = 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200';

        if (infRate < 0) {
          classification = 'Deflation (Falling Price Level)';
          badgeColor = 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200';
        } else if (infRate > 10) {
          classification = 'High / Double-Digit Inflation';
          badgeColor = 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200';
        } else if (infRate <= 3) {
          classification = 'Low / Target Inflation (Ideal Stability)';
          badgeColor = 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200';
        }

        return {
          primaryValue: `${infRate.toFixed(2)}%`,
          primaryLabel: 'Annual Inflation Rate',
          classification,
          badgeColor,
          interpretation: infRate >= 0
            ? `Consumer prices rose by ${infRate.toFixed(2)}% over the period, decreasing purchasing power by the same proportion.`
            : `Consumer prices fell by ${Math.abs(infRate).toFixed(2)}% (deflation).`,
          steps: [
            `1. Baseline CPI Index = ${infBaseCpi}`,
            `2. Current CPI Index = ${infCurrCpi}`,
            `3. CPI Point Increase = ${infCurrCpi} - ${infBaseCpi} = ${delta > 0 ? '+' : ''}${delta.toFixed(2)} points`,
            `4. Inflation Rate = (ΔCPI ÷ Base CPI) × 100 = (${delta.toFixed(2)} ÷ ${infBaseCpi}) × 100 = ${infRate.toFixed(2)}%`
          ]
        };
      }

      // 21. Purchasing Power
      case 'purchasing_power': {
        const r = ppInfRate / 100;
        const t = Math.max(1, ppYears);
        const factor = Math.pow(1 + r, t);
        const futureRealValue = factor !== 0 ? ppInitialAmt / factor : 0;
        const lossPct = factor !== 0 ? (1 - (1 / factor)) * 100 : 0;
        const futureCostOfSameBasket = ppInitialAmt * factor;

        return {
          primaryValue: `₹${Math.round(futureRealValue).toLocaleString('en-IN')}`,
          primaryLabel: `Purchasing Power After ${t} Years`,
          classification: `Cumulative Purchasing Power Loss: -${lossPct.toFixed(1)}%`,
          badgeColor: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200',
          interpretation: `At an average ${ppInfRate}% annual inflation, ₹${ppInitialAmt.toLocaleString('en-IN')} today will only buy goods worth ₹${Math.round(futureRealValue).toLocaleString('en-IN')} in ${t} years. To buy the same basket will require ₹${Math.round(futureCostOfSameBasket).toLocaleString('en-IN')}.`,
          steps: [
            `1. Initial Capital = ₹${ppInitialAmt.toLocaleString('en-IN')} | Inflation Rate = ${ppInfRate}% per year | Horizon = ${t} years`,
            `2. Compound Inflation Factor = (1 + ${ppInfRate}/100)^${t} = (1 + ${r})^${t} = ${factor.toFixed(4)}`,
            `3. Future Real Purchasing Power = Present Value ÷ Factor = ₹${ppInitialAmt.toLocaleString('en-IN')} ÷ ${factor.toFixed(4)} = ₹${futureRealValue.toFixed(2)}`,
            `4. Purchasing Power Erosion = ${lossPct.toFixed(2)}% lost to inflation`,
            `5. Cost of same basket in ${t} years = ₹${ppInitialAmt.toLocaleString('en-IN')} × ${factor.toFixed(4)} = ₹${futureCostOfSameBasket.toFixed(2)}`
          ],
          chartData: { initial: ppInitialAmt, rate: ppInfRate, years: t }
        };
      }

      // 22. CPI
      case 'cpi': {
        const baseCost = Math.max(1, cpiBaseBasket);
        const cpiValue = (cpiCurrBasket / baseCost) * 100;
        const priceIncrease = cpiValue - 100;

        return {
          primaryValue: `${cpiValue.toFixed(2)}`,
          primaryLabel: 'Consumer Price Index (CPI)',
          classification: `Basket Price Inflation: ${priceIncrease >= 0 ? '+' : ''}${priceIncrease.toFixed(2)}%`,
          badgeColor: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200',
          interpretation: `The market basket of consumer goods that cost ₹${cpiBaseBasket.toLocaleString('en-IN')} in the base year now costs ₹${cpiCurrBasket.toLocaleString('en-IN')} today.`,
          steps: [
            `1. Current Period Market Basket Cost = ₹${cpiCurrBasket.toLocaleString('en-IN')}`,
            `2. Base Period Market Basket Cost = ₹${cpiBaseBasket.toLocaleString('en-IN')}`,
            `3. CPI Index = (Current Cost ÷ Base Cost) × 100 = (₹${cpiCurrBasket} ÷ ₹${cpiBaseBasket}) × 100 = ${cpiValue.toFixed(2)}`,
            `4. Price Inflation Since Base Period = ${priceIncrease.toFixed(2)}%`
          ]
        };
      }

      // 23. Unemployment
      case 'unemployment': {
        const lf = Math.max(1, unempLaborForce);
        const unempRate = (unempUnemployed / lf) * 100;
        const employed = Math.max(0, lf - unempUnemployed);
        const pop = Math.max(lf, unempWorkingAgePop);
        const lfpr = (lf / pop) * 100;

        return {
          primaryValue: `${unempRate.toFixed(2)}%`,
          primaryLabel: 'Official Unemployment Rate',
          classification: `Labor Force Participation: ${lfpr.toFixed(1)}%`,
          badgeColor: unempRate <= 5
            ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200'
            : 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200',
          interpretation: `Out of a labor pool of ${lf.toLocaleString('en-IN')}, ${employed.toLocaleString('en-IN')} are employed and ${unempUnemployed.toLocaleString('en-IN')} are actively looking for work.`,
          steps: [
            `1. Total Labor Force = ${lf.toLocaleString('en-IN')} persons`,
            `2. Unemployed Jobseekers = ${unempUnemployed.toLocaleString('en-IN')} persons`,
            `3. Employed Persons = Labor Force - Unemployed = ${employed.toLocaleString('en-IN')}`,
            `4. Unemployment Rate = (Unemployed ÷ Labor Force) × 100 = (${unempUnemployed} ÷ ${lf}) × 100 = ${unempRate.toFixed(2)}%`,
            `5. Labor Force Participation Rate (LFPR) = (Labor Force ÷ Working Age Pop) × 100 = (${lf} ÷ ${pop}) × 100 = ${lfpr.toFixed(2)}%`
          ]
        };
      }

      // 24. Economic Growth / Rule of 70
      case 'economic_growth': {
        const t = Math.max(1, egYears);
        const y0 = Math.max(1, egY0);
        const cagr = (Math.pow(egYt / y0, 1 / t) - 1) * 100;
        const doublingYears = cagr > 0 ? 70 / cagr : Infinity;

        return {
          primaryValue: `${cagr.toFixed(2)}% / year`,
          primaryLabel: 'Compound Annual Growth Rate (CAGR)',
          classification: cagr > 0 ? `Doubling Time (Rule of 70): ≈ ${doublingYears.toFixed(1)} Years` : 'Negative Growth',
          badgeColor: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200',
          interpretation: `At a sustained CAGR of ${cagr.toFixed(2)}%, the total size of this economy or investment will double every ${doublingYears.toFixed(1)} years.`,
          steps: [
            `1. Baseline GDP (Y_0) = ${y0.toLocaleString('en-IN')} | Ending GDP (Y_t) = ${egYt.toLocaleString('en-IN')} | Horizon (t) = ${t} years`,
            `2. CAGR = ((Y_t ÷ Y_0)^(1/t) - 1) × 100 = ((${egYt} ÷ ${y0})^(1/${t}) - 1) × 100 = ${cagr.toFixed(2)}%`,
            `3. Rule of 70 Doubling Formula: Years to Double ≈ 70 ÷ Annual Growth Rate`,
            `4. Doubling Period = 70 ÷ ${cagr.toFixed(2)}% ≈ ${doublingYears.toFixed(1)} years`
          ]
        };
      }

      // 25. National Income
      case 'national_income': {
        const nx = niX - niM;
        const gdpTotal = niC + niI + niG + nx;
        const cShare = gdpTotal > 0 ? (niC / gdpTotal) * 100 : 0;
        const iShare = gdpTotal > 0 ? (niI / gdpTotal) * 100 : 0;
        const gShare = gdpTotal > 0 ? (niG / gdpTotal) * 100 : 0;
        const nxShare = gdpTotal > 0 ? (nx / gdpTotal) * 100 : 0;

        return {
          primaryValue: `₹${gdpTotal.toLocaleString('en-IN')}`,
          primaryLabel: 'Gross Domestic Product / National Income (Y)',
          classification: `Net Exports (NX): ${nx >= 0 ? '+' : ''}₹${nx.toLocaleString('en-IN')}`,
          badgeColor: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200',
          interpretation: `Consumption represents ${cShare.toFixed(1)}%, Investment is ${iShare.toFixed(1)}%, Government is ${gShare.toFixed(1)}%, and Net Exports is ${nxShare.toFixed(1)}% of total economic expenditure.`,
          steps: [
            `1. Consumption (C) = ₹${niC.toLocaleString('en-IN')}`,
            `2. Investment (I) = ₹${niI.toLocaleString('en-IN')}`,
            `3. Government Spending (G) = ₹${niG.toLocaleString('en-IN')}`,
            `4. Net Exports (NX) = Exports (X: ₹${niX}) - Imports (M: ₹${niM}) = ₹${nx.toLocaleString('en-IN')}`,
            `5. National Income (Y) = C + I + G + (X - M) = ₹${niC} + ₹${niI} + ₹${niG} + (₹${nx}) = ₹${gdpTotal.toLocaleString('en-IN')}`
          ]
        };
      }

      default:
        return {
          primaryValue: '0',
          primaryLabel: 'Result',
          classification: '',
          badgeColor: '',
          interpretation: '',
          steps: []
        };
    }
  }, [
    selectedCalcId, pedQ1, pedQ2, pedP1, pedP2, pedUseMidpoint,
    yedQ1, yedQ2, yedY1, yedY2, xedQA1, xedQA2, xedPB1, xedPB2,
    pesQS1, pesQS2, pesP1, pesP2, mcTC1, mcTC2, mcQ1, mcQ2,
    mrTR1, mrTR2, mrQ1, mrQ2, acTC, acFC, acQ, arTR, arQ,
    profitTR, profitTC, beFC, bePrice, beVC, beExpectedUnits,
    oppOptAName, oppOptAReturn, oppOptBName, oppOptBReturn,
    csMaxP, csEqP, csEqQ, psEqP, psMinP, psEqQ,
    eqDemandA, eqDemandB, eqSupplyC, eqSupplyD,
    gdpPrior, gdpCurrent, realNominalGdp, realDeflator,
    nomRealGdp, nomDeflator, deflatorNominal, deflatorReal,
    perCapGdp, perCapPop, infBaseCpi, infCurrCpi,
    ppInitialAmt, ppInfRate, ppYears, cpiCurrBasket, cpiBaseBasket,
    unempUnemployed, unempLaborForce, unempWorkingAgePop,
    egY0, egYt, egYears, niC, niI, niG, niX, niM
  ]);

  // Copy Result text
  const copyReport = () => {
    const text = `📊 TOOLIQUE ECONOMICS CALCULATOR
---------------------------------------------
Calculator: ${activeCalcMeta.name}
Category: ${activeCalcMeta.category === 'micro' ? 'Microeconomics' : 'Macroeconomics'}
Formula: ${activeCalcMeta.formulaDisplay}

RESULT:
${resultData.primaryLabel}: ${resultData.primaryValue}
Classification: ${resultData.classification}
Summary: ${resultData.interpretation}

STEP-BY-STEP CALCULATION:
${resultData.steps.join('\n')}

Calculated online at Toolique India (https://www.toolique.in/calculators/economics-calculator)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // WhatsApp Share
  const shareWhatsApp = () => {
    const text = `*📊 Toolique Economics Calculator: ${activeCalcMeta.name}*
*Result:* ${resultData.primaryLabel} = ${resultData.primaryValue}
*Outcome:* ${resultData.classification}
*Formula:* ${activeCalcMeta.formulaDisplay}

*Step-by-Step Breakdown:*
${resultData.steps.slice(0, 4).join('\n')}

_Calculate all micro & macro formulas at:_ https://www.toolique.in/calculators/economics-calculator`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Export Excel
  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    const data = [
      ['TOOLIQUE ECONOMICS FORMULA REPORT'],
      ['Calculator Name', activeCalcMeta.name],
      ['Formula', activeCalcMeta.formulaDisplay],
      ['Primary Result', resultData.primaryValue],
      ['Classification', resultData.classification],
      ['Economic Interpretation', resultData.interpretation],
      [''],
      ['STEP-BY-STEP CALCULATION'],
      ...resultData.steps.map((s, idx) => [`Step ${idx + 1}`, s])
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Economic Calculation');
    XLSX.writeFile(wb, `Toolique_${selectedCalcId}_Calculation.xlsx`);
  };

  // Export PDF
  const exportPdf = () => {
    const doc = new jsPDF();

    // Header
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 32, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('ECONOMICS FORMULA CALCULATION REPORT', 14, 15);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(`Toolique India • ${activeCalcMeta.name} (${activeCalcMeta.category.toUpperCase()})`, 14, 23);
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, 14, 28);

    let y = 44;

    // Result Card
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, y, 182, 28, 3, 3, 'F');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(resultData.primaryLabel.toUpperCase(), 20, y + 8);

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(resultData.primaryValue, 20, y + 17);

    doc.setFontSize(9);
    doc.setTextColor(99, 102, 241);
    doc.text(`Classification: ${resultData.classification}`, 20, y + 24);

    y += 38;

    // Formula definition
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('1. Economic Concept & Formula', 14, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Formula: ${activeCalcMeta.formulaDisplay}`, 16, y);
    y += 5.5;

    const splitDef = doc.splitTextToSize(activeCalcMeta.aeoAnswer, 175);
    doc.text(splitDef, 16, y);
    y += splitDef.length * 5 + 4;

    // Steps
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('2. Step-by-Step Mathematical Solution', 14, y);
    y += 6;

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    resultData.steps.forEach((step) => {
      doc.setTextColor(15, 23, 42);
      const splitStep = doc.splitTextToSize(step, 175);
      doc.text(splitStep, 16, y);
      y += splitStep.length * 5;
    });

    y += 4;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('3. Economic Interpretation', 14, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const splitInterp = doc.splitTextToSize(resultData.interpretation, 175);
    doc.text(splitInterp, 16, y);

    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Generated via Toolique Economics Calculator Hub • https://www.toolique.in', 14, 285);

    doc.save(`Toolique_Economics_${selectedCalcId}.pdf`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-left">
      <SEO
        title="Economics Calculator – Solve Economic Formulas Online"
        description="Calculate economics formulas instantly, including elasticity, GDP growth, inflation, opportunity cost, marginal cost, marginal revenue, equilibrium price, and more. Free Economics Calculator with formulas and step-by-step explanations."
        keywords={[
          'Economics Calculator',
          'Economic Calculator',
          'Economics Formula Calculator',
          'Economics Problem Solver',
          'Microeconomics Calculator',
          'Macroeconomics Calculator',
          'Elasticity Calculator',
          'GDP Calculator',
          'Inflation Calculator',
          'Marginal Cost Calculator',
          'Opportunity Cost Calculator',
          'Break-Even Calculator'
        ]}
      />

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-zinc-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>25 Micro & Macro Formula Engines • Interactive Visualizers • Step-by-Step Math</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Economics Calculator Hub
            </h1>
            <p className="text-zinc-300 text-sm max-w-3xl leading-relaxed">
              Solve complex economics problems instantly. Compute Price Elasticity (PED/YED/XED/PES), Market Equilibrium, 
              Marginal Cost & Revenue, Break-Even volume, Real GDP, Inflation erosion, and Keynesian national accounts with step-by-step mathematical proofs.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={copyReport}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/10 shadow-sm"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Result'}</span>
            </button>
            <button
              onClick={shareWhatsApp}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
            >
              <Share2 className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={exportExcel}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel</span>
            </button>
            <button
              onClick={exportPdf}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm"
            >
              <FileText className="w-4 h-4" />
              <span>PDF Report</span>
            </button>
          </div>
        </div>

        {/* Search Bar within Hero */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="relative max-w-2xl">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search economics formulas (e.g. elasticity, GDP, inflation, marginal cost, break-even, equilibrium)..."
              className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/15 focus:border-indigo-400 rounded-2xl text-white placeholder-zinc-400 text-xs md:text-sm outline-none transition backdrop-blur-sm shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white bg-white/10 px-2 py-0.5 rounded-full"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all' as CalcCategory, label: 'All Formulas (25)', icon: Layers },
          { id: 'popular' as CalcCategory, label: '🔥 Popular (6)', icon: Award },
          { id: 'micro' as CalcCategory, label: '📈 Microeconomics (14)', icon: TrendingUp },
          { id: 'macro' as CalcCategory, label: '🌍 Macroeconomics (11)', icon: Globe },
          { id: 'recent' as CalcCategory, label: '⭐ Recently Used', icon: Activity }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs md:text-sm font-bold border-b-2 whitespace-nowrap transition ${
                activeCategory === tab.id
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-t-xl'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search Results / Formula Selector Carousel */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
          <span>Select Formula ({filteredCalculators.length} available):</span>
          {searchQuery && <span>Filter applied: "{searchQuery}"</span>}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
          {filteredCalculators.map((calc) => {
            const isSelected = selectedCalcId === calc.id;
            return (
              <button
                key={calc.id}
                onClick={() => handleSelectCalc(calc.id)}
                className={`p-3 rounded-xl border text-left transition relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 shadow-sm ring-1 ring-indigo-500'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {calc.category}
                    </span>
                    {calc.isPopular && (
                      <span className="text-[9px] bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold px-1.5 py-0.2 rounded">
                        Popular
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold line-clamp-2 leading-snug">
                    {calc.name}
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                  <span className="truncate max-w-[120px]">{calc.formulaDisplay}</span>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400'}`} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* --------------------------------------------------------- */}
      {/* ACTIVE CALCULATOR WORKSPACE */}
      {/* --------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-5 space-y-6">
          <div className="saas-card p-6 space-y-4">
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
                <Calculator className="w-3.5 h-3.5" />
                <span>{activeCalcMeta.category === 'micro' ? 'Microeconomics Calculation' : 'Macroeconomics Calculation'}</span>
              </div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                {activeCalcMeta.name}
              </h2>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                {activeCalcMeta.shortDesc}
              </p>
            </div>

            {/* Dynamic Inputs Based on Selected Calculator */}
            <div className="space-y-4 text-xs">
              {/* 1. PED */}
              {selectedCalcId === 'ped' && (
                <>
                  <div className="flex items-center justify-between p-2 bg-zinc-50 dark:bg-zinc-850 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300 text-xs">Use Midpoint (Arc) Formula</span>
                    <button
                      onClick={() => setPedUseMidpoint(!pedUseMidpoint)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        pedUseMidpoint ? 'bg-indigo-600 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200'
                      }`}
                    >
                      {pedUseMidpoint ? 'Midpoint ON' : 'Standard ON'}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-zinc-500 mb-1 font-semibold">Initial Quantity (Q₁)</label>
                      <input type="number" value={pedQ1} onChange={(e) => setPedQ1(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                    </div>
                    <div>
                      <label className="block text-zinc-500 mb-1 font-semibold">New Quantity (Q₂)</label>
                      <input type="number" value={pedQ2} onChange={(e) => setPedQ2(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                    </div>
                    <div>
                      <label className="block text-zinc-500 mb-1 font-semibold">Initial Price (P₁)</label>
                      <input type="number" value={pedP1} onChange={(e) => setPedP1(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                    </div>
                    <div>
                      <label className="block text-zinc-500 mb-1 font-semibold">New Price (P₂)</label>
                      <input type="number" value={pedP2} onChange={(e) => setPedP2(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                    </div>
                  </div>
                </>
              )}

              {/* 2. YED */}
              {selectedCalcId === 'yed' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold">Initial Quantity (Q₁)</label>
                    <input type="number" value={yedQ1} onChange={(e) => setYedQ1(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold">New Quantity (Q₂)</label>
                    <input type="number" value={yedQ2} onChange={(e) => setYedQ2(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold">Initial Income (Y₁)</label>
                    <input type="number" value={yedY1} onChange={(e) => setYedY1(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold">New Income (Y₂)</label>
                    <input type="number" value={yedY2} onChange={(e) => setYedY2(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                </div>
              )}

              {/* 3. XED */}
              {selectedCalcId === 'xed' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold">Initial Demand Good A (Q_A1)</label>
                    <input type="number" value={xedQA1} onChange={(e) => setXedQA1(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold">New Demand Good A (Q_A2)</label>
                    <input type="number" value={xedQA2} onChange={(e) => setXedQA2(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold">Initial Price Good B (P_B1)</label>
                    <input type="number" value={xedPB1} onChange={(e) => setXedPB1(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold">New Price Good B (P_B2)</label>
                    <input type="number" value={xedPB2} onChange={(e) => setXedPB2(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                </div>
              )}

              {/* 4. PES */}
              {selectedCalcId === 'pes' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold">Initial Supply (Q_s1)</label>
                    <input type="number" value={pesQS1} onChange={(e) => setPesQS1(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold">New Supply (Q_s2)</label>
                    <input type="number" value={pesQS2} onChange={(e) => setPesQS2(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold">Initial Price (P₁)</label>
                    <input type="number" value={pesP1} onChange={(e) => setPesP1(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold">New Price (P₂)</label>
                    <input type="number" value={pesP2} onChange={(e) => setPesP2(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                </div>
              )}

              {/* 5. MC */}
              {selectedCalcId === 'mc' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold">Initial Total Cost (TC₁)</label>
                    <input type="number" value={mcTC1} onChange={(e) => setMcTC1(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold">New Total Cost (TC₂)</label>
                    <input type="number" value={mcTC2} onChange={(e) => setMcTC2(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold">Initial Quantity (Q₁)</label>
                    <input type="number" value={mcQ1} onChange={(e) => setMcQ1(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold">New Quantity (Q₂)</label>
                    <input type="number" value={mcQ2} onChange={(e) => setMcQ2(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                </div>
              )}

              {/* 6. MR */}
              {selectedCalcId === 'mr' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold">Initial Revenue (TR₁)</label>
                    <input type="number" value={mrTR1} onChange={(e) => setMrTR1(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold">New Revenue (TR₂)</label>
                    <input type="number" value={mrTR2} onChange={(e) => setMrTR2(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold">Initial Output (Q₁)</label>
                    <input type="number" value={mrQ1} onChange={(e) => setMrQ1(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold">New Output (Q₂)</label>
                    <input type="number" value={mrQ2} onChange={(e) => setMrQ2(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                </div>
              )}

              {/* 7. AC */}
              {selectedCalcId === 'ac' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-zinc-500 mb-1 font-semibold">Total Production Cost (TC)</label>
                    <input type="number" value={acTC} onChange={(e) => setAcTC(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold">Fixed Overhead (FC)</label>
                    <input type="number" value={acFC} onChange={(e) => setAcFC(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold">Units Produced (Q)</label>
                    <input type="number" value={acQ} onChange={(e) => setAcQ(parseFloat(e.target.value) || 1)} className="saas-input font-mono font-bold" />
                  </div>
                </div>
              )}

              {/* 8. AR */}
              {selectedCalcId === 'ar' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold">Total Revenue (TR)</label>
                    <input type="number" value={arTR} onChange={(e) => setArTR(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold">Quantity Sold (Q)</label>
                    <input type="number" value={arQ} onChange={(e) => setArQ(parseFloat(e.target.value) || 1)} className="saas-input font-mono font-bold" />
                  </div>
                </div>
              )}

              {/* 9. Profit */}
              {selectedCalcId === 'profit' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold">Total Revenue (TR)</label>
                    <input type="number" value={profitTR} onChange={(e) => setProfitTR(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold">Total Cost (TC)</label>
                    <input type="number" value={profitTC} onChange={(e) => setProfitTC(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                </div>
              )}

              {/* 10. Break-Even */}
              {selectedCalcId === 'breakeven' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold">Total Fixed Costs (FC)</label>
                    <input type="number" value={beFC} onChange={(e) => setBeFC(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold">Unit Selling Price (P)</label>
                    <input type="number" value={bePrice} onChange={(e) => setBePrice(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold">Unit Variable Cost (VC)</label>
                    <input type="number" value={beVC} onChange={(e) => setBeVC(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold">Expected Sales Volume</label>
                    <input type="number" value={beExpectedUnits} onChange={(e) => setBeExpectedUnits(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                </div>
              )}

              {/* 11. Opportunity Cost */}
              {selectedCalcId === 'oppcost' && (
                <div className="space-y-3">
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-850 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <span className="font-bold text-zinc-700 dark:text-zinc-200 block text-xs">Selected Alternative</span>
                    <input type="text" value={oppOptAName} onChange={(e) => setOppOptAName(e.target.value)} className="saas-input text-xs font-semibold mb-1" />
                    <label className="block text-zinc-500 text-[11px]">Financial Return (₹)</label>
                    <input type="number" value={oppOptAReturn} onChange={(e) => setOppOptAReturn(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-850 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <span className="font-bold text-zinc-700 dark:text-zinc-200 block text-xs">Forgone Alternative Option</span>
                    <input type="text" value={oppOptBName} onChange={(e) => setOppOptBName(e.target.value)} className="saas-input text-xs font-semibold mb-1" />
                    <label className="block text-zinc-500 text-[11px]">Financial Return (₹)</label>
                    <input type="number" value={oppOptBReturn} onChange={(e) => setOppOptBReturn(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                </div>
              )}

              {/* 12. CS */}
              {selectedCalcId === 'cs' && (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold text-[11px]">Max Price (P_max)</label>
                    <input type="number" value={csMaxP} onChange={(e) => setCsMaxP(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold text-[11px]">Market Price (P_eq)</label>
                    <input type="number" value={csEqP} onChange={(e) => setCsEqP(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold text-[11px]">Quantity (Q_eq)</label>
                    <input type="number" value={csEqQ} onChange={(e) => setCsEqQ(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                </div>
              )}

              {/* 13. PS */}
              {selectedCalcId === 'ps' && (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold text-[11px]">Market Price (P_eq)</label>
                    <input type="number" value={psEqP} onChange={(e) => setPsEqP(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold text-[11px]">Min Supply Price</label>
                    <input type="number" value={psMinP} onChange={(e) => setPsMinP(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold text-[11px]">Quantity (Q_eq)</label>
                    <input type="number" value={psEqQ} onChange={(e) => setPsEqQ(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                </div>
              )}

              {/* 14. Equilibrium */}
              {selectedCalcId === 'equilibrium' && (
                <div className="space-y-3">
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-850 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <span className="font-bold text-zinc-700 dark:text-zinc-200 block mb-2 text-xs">Demand Equation: Q_d = a - bP</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-zinc-400 text-[10px]">Intercept (a)</label>
                        <input type="number" value={eqDemandA} onChange={(e) => setEqDemandA(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                      </div>
                      <div>
                        <label className="block text-zinc-400 text-[10px]">Slope (b)</label>
                        <input type="number" value={eqDemandB} onChange={(e) => setEqDemandB(parseFloat(e.target.value) || 1)} className="saas-input font-mono font-bold" />
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-850 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <span className="font-bold text-zinc-700 dark:text-zinc-200 block mb-2 text-xs">Supply Equation: Q_s = c + dP</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-zinc-400 text-[10px]">Intercept (c)</label>
                        <input type="number" value={eqSupplyC} onChange={(e) => setEqSupplyC(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                      </div>
                      <div>
                        <label className="block text-zinc-400 text-[10px]">Slope (d)</label>
                        <input type="number" value={eqSupplyD} onChange={(e) => setEqSupplyD(parseFloat(e.target.value) || 1)} className="saas-input font-mono font-bold" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 15. GDP Growth */}
              {selectedCalcId === 'gdp_growth' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold">Previous Period GDP</label>
                    <input type="number" step="0.1" value={gdpPrior} onChange={(e) => setGdpPrior(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold">Current Period GDP</label>
                    <input type="number" step="0.1" value={gdpCurrent} onChange={(e) => setGdpCurrent(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                </div>
              )}

              {/* 16. Real GDP */}
              {selectedCalcId === 'real_gdp' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold">Nominal GDP</label>
                    <input type="number" value={realNominalGdp} onChange={(e) => setRealNominalGdp(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold">GDP Deflator Index</label>
                    <input type="number" value={realDeflator} onChange={(e) => setRealDeflator(parseFloat(e.target.value) || 100)} className="saas-input font-mono font-bold" />
                  </div>
                </div>
              )}

              {/* 17. Nominal GDP */}
              {selectedCalcId === 'nominal_gdp' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold">Real GDP</label>
                    <input type="number" value={nomRealGdp} onChange={(e) => setNomRealGdp(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold">GDP Deflator Index</label>
                    <input type="number" value={nomDeflator} onChange={(e) => setNomDeflator(parseFloat(e.target.value) || 100)} className="saas-input font-mono font-bold" />
                  </div>
                </div>
              )}

              {/* 18. GDP Deflator */}
              {selectedCalcId === 'gdp_deflator' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold">Nominal GDP</label>
                    <input type="number" value={deflatorNominal} onChange={(e) => setDeflatorNominal(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold">Real GDP</label>
                    <input type="number" value={deflatorReal} onChange={(e) => setDeflatorReal(parseFloat(e.target.value) || 1)} className="saas-input font-mono font-bold" />
                  </div>
                </div>
              )}

              {/* 19. Per Capita GDP */}
              {selectedCalcId === 'per_capita_gdp' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold">Total National GDP (₹)</label>
                    <input type="number" value={perCapGdp} onChange={(e) => setPerCapGdp(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold">Total Population</label>
                    <input type="number" value={perCapPop} onChange={(e) => setPerCapPop(parseFloat(e.target.value) || 1)} className="saas-input font-mono font-bold" />
                  </div>
                </div>
              )}

              {/* 20. Inflation Rate */}
              {selectedCalcId === 'inflation_rate' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold">Base CPI Index</label>
                    <input type="number" value={infBaseCpi} onChange={(e) => setInfBaseCpi(parseFloat(e.target.value) || 1)} className="saas-input font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold">Current CPI Index</label>
                    <input type="number" value={infCurrCpi} onChange={(e) => setInfCurrCpi(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                </div>
              )}

              {/* 21. Purchasing Power */}
              {selectedCalcId === 'purchasing_power' && (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold text-[11px]">Initial Sum (₹)</label>
                    <input type="number" value={ppInitialAmt} onChange={(e) => setPpInitialAmt(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold text-[11px]">Inflation Rate (%)</label>
                    <input type="number" step="0.5" value={ppInfRate} onChange={(e) => setPpInfRate(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold text-[11px]">Horizon (Years)</label>
                    <input type="number" value={ppYears} onChange={(e) => setPpYears(parseFloat(e.target.value) || 1)} className="saas-input font-mono font-bold" />
                  </div>
                </div>
              )}

              {/* 22. CPI */}
              {selectedCalcId === 'cpi' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold">Current Basket Cost (₹)</label>
                    <input type="number" value={cpiCurrBasket} onChange={(e) => setCpiCurrBasket(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold">Base Basket Cost (₹)</label>
                    <input type="number" value={cpiBaseBasket} onChange={(e) => setCpiBaseBasket(parseFloat(e.target.value) || 1)} className="saas-input font-mono font-bold" />
                  </div>
                </div>
              )}

              {/* 23. Unemployment */}
              {selectedCalcId === 'unemployment' && (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold text-[11px]">Unemployed</label>
                    <input type="number" value={unempUnemployed} onChange={(e) => setUnempUnemployed(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold text-[11px]">Labor Force</label>
                    <input type="number" value={unempLaborForce} onChange={(e) => setUnempLaborForce(parseFloat(e.target.value) || 1)} className="saas-input font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold text-[11px]">Working Age Pop</label>
                    <input type="number" value={unempWorkingAgePop} onChange={(e) => setUnempWorkingAgePop(parseFloat(e.target.value) || 1)} className="saas-input font-mono font-bold" />
                  </div>
                </div>
              )}

              {/* 24. Economic Growth (Rule of 70) */}
              {selectedCalcId === 'economic_growth' && (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold text-[11px]">Initial GDP (Y₀)</label>
                    <input type="number" value={egY0} onChange={(e) => setEgY0(parseFloat(e.target.value) || 1)} className="saas-input font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold text-[11px]">Ending GDP (Y_t)</label>
                    <input type="number" value={egYt} onChange={(e) => setEgYt(parseFloat(e.target.value) || 1)} className="saas-input font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-zinc-500 mb-1 font-semibold text-[11px]">Years (t)</label>
                    <input type="number" value={egYears} onChange={(e) => setEgYears(parseFloat(e.target.value) || 1)} className="saas-input font-mono font-bold" />
                  </div>
                </div>
              )}

              {/* 25. National Income */}
              {selectedCalcId === 'national_income' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-zinc-500 text-[11px] font-semibold">Consumption (C)</label>
                    <input type="number" value={niC} onChange={(e) => setNiC(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-zinc-500 text-[11px] font-semibold">Gross Investment (I)</label>
                    <input type="number" value={niI} onChange={(e) => setNiI(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-zinc-500 text-[11px] font-semibold">Govt Spending (G)</label>
                    <input type="number" value={niG} onChange={(e) => setNiG(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-zinc-500 text-[11px] font-semibold">Exports (X)</label>
                    <input type="number" value={niX} onChange={(e) => setNiX(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-zinc-500 text-[11px] font-semibold">Imports (M)</label>
                    <input type="number" value={niM} onChange={(e) => setNiM(parseFloat(e.target.value) || 0)} className="saas-input font-mono font-bold" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Results, Charts & Step-by-Step */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Result Card */}
          <div className="saas-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                Primary Calculation Result
              </span>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${resultData.badgeColor}`}>
                {resultData.classification}
              </span>
            </div>

            <div>
              <span className="text-xs text-zinc-500 block">{resultData.primaryLabel}</span>
              <div className="text-3xl md:text-4xl font-black font-mono mt-1 text-zinc-900 dark:text-white">
                {resultData.primaryValue}
              </div>
            </div>

            {/* Formula badge */}
            <div className="p-3 bg-zinc-50 dark:bg-zinc-850 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
              <span className="text-zinc-500">Core Equation:</span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {activeCalcMeta.formulaDisplay}
              </span>
            </div>

            {/* Interpretation */}
            <div className="p-3.5 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-100 dark:border-indigo-900/40 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed flex gap-2.5">
              <BookOpen className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <p>{resultData.interpretation}</p>
            </div>
          </div>

          {/* Interactive Chart Visualizer where applicable */}
          {/* Chart 1: Supply and Demand Equilibrium Curve */}
          {selectedCalcId === 'equilibrium' && (
            <div className="saas-card p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm">Interactive Supply & Demand Equilibrium Curves</h3>
                <span className="text-xs font-mono font-bold text-indigo-500">
                  (P* = ₹{(eqDemandA - eqSupplyC) / (eqDemandB + eqSupplyD)}, Q* = {eqDemandA - eqDemandB * ((eqDemandA - eqSupplyC) / (eqDemandB + eqSupplyD))})
                </span>
              </div>
              <div className="relative w-full aspect-[2/1] bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center p-4 overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 500 220" preserveAspectRatio="xMidYMid meet">
                  {/* Grid lines */}
                  <line x1="50" y1="20" x2="50" y2="180" stroke="#475569" strokeWidth="2" />
                  <line x1="50" y1="180" x2="460" y2="180" stroke="#475569" strokeWidth="2" />
                  <text x="20" y="25" fill="#94a3b8" fontSize="10" fontFamily="monospace">Price (P)</text>
                  <text x="400" y="200" fill="#94a3b8" fontSize="10" fontFamily="monospace">Quantity (Q)</text>

                  {/* Demand Curve (Downward sloping) */}
                  <line x1="70" y1="35" x2="430" y2="165" stroke="#ef4444" strokeWidth="3" />
                  <text x="435" y="165" fill="#ef4444" fontSize="10" fontFamily="monospace" fontWeight="bold">Demand (Qd)</text>

                  {/* Supply Curve (Upward sloping) */}
                  <line x1="70" y1="165" x2="430" y2="35" stroke="#10b981" strokeWidth="3" />
                  <text x="435" y="35" fill="#10b981" fontSize="10" fontFamily="monospace" fontWeight="bold">Supply (Qs)</text>

                  {/* Equilibrium Point (250, 100) */}
                  <circle cx="250" cy="100" r="5" fill="#6366f1" />
                  <line x1="50" y1="100" x2="250" y2="100" stroke="#818cf8" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="250" y1="100" x2="250" y2="180" stroke="#818cf8" strokeWidth="1" strokeDasharray="3 3" />

                  {/* Labels on axis */}
                  <text x="20" y="104" fill="#818cf8" fontSize="9" fontFamily="monospace" fontWeight="bold">P*</text>
                  <text x="245" y="195" fill="#818cf8" fontSize="9" fontFamily="monospace" fontWeight="bold">Q*</text>

                  {/* Shaded Consumer & Producer Surplus Triangles */}
                  <polygon points="50,35 250,100 50,100" fill="#ef4444" opacity="0.15" />
                  <text x="80" y="80" fill="#f87171" fontSize="9" fontFamily="monospace">Consumer Surplus</text>

                  <polygon points="50,100 250,100 50,165" fill="#10b981" opacity="0.15" />
                  <text x="80" y="130" fill="#34d399" fontSize="9" fontFamily="monospace">Producer Surplus</text>
                </svg>
              </div>
            </div>
          )}

          {/* Chart 2: Break-Even Analysis Chart */}
          {selectedCalcId === 'breakeven' && (
            <div className="saas-card p-6 space-y-3">
              <h3 className="font-bold text-sm">Break-Even Point CVP Curve</h3>
              <div className="relative w-full aspect-[2/1] bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center p-4 overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 500 220" preserveAspectRatio="xMidYMid meet">
                  <line x1="50" y1="20" x2="50" y2="180" stroke="#475569" strokeWidth="2" />
                  <line x1="50" y1="180" x2="460" y2="180" stroke="#475569" strokeWidth="2" />
                  <text x="15" y="25" fill="#94a3b8" fontSize="10" fontFamily="monospace">Cost/Rev (₹)</text>
                  <text x="400" y="200" fill="#94a3b8" fontSize="10" fontFamily="monospace">Units (Q)</text>

                  {/* Fixed Cost Line (horizontal) */}
                  <line x1="50" y1="130" x2="450" y2="130" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 2" />
                  <text x="360" y="125" fill="#f59e0b" fontSize="9" fontFamily="monospace">Fixed Costs</text>

                  {/* Total Cost Line (starts at FC, slopes up) */}
                  <line x1="50" y1="130" x2="450" y2="40" stroke="#ef4444" strokeWidth="2.5" />
                  <text x="400" y="35" fill="#ef4444" fontSize="9" fontFamily="monospace" fontWeight="bold">Total Cost</text>

                  {/* Total Revenue Line (starts at origin, steeper slope) */}
                  <line x1="50" y1="180" x2="420" y2="20" stroke="#10b981" strokeWidth="2.5" />
                  <text x="425" y="20" fill="#10b981" fontSize="9" fontFamily="monospace" fontWeight="bold">Revenue</text>

                  {/* Break Even Intersection Point */}
                  <circle cx="230" cy="89" r="5" fill="#6366f1" />
                  <line x1="230" y1="89" x2="230" y2="180" stroke="#818cf8" strokeWidth="1" strokeDasharray="3 3" />
                  <text x="210" y="80" fill="#818cf8" fontSize="9" fontFamily="monospace" fontWeight="bold">BEP</text>
                </svg>
              </div>
            </div>
          )}

          {/* Chart 3: Purchasing Power Erosion Curve */}
          {selectedCalcId === 'purchasing_power' && (
            <div className="saas-card p-6 space-y-3">
              <h3 className="font-bold text-sm">Real Value Depreciation Curve Over Time</h3>
              <div className="relative w-full aspect-[2/1] bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center p-4 overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 500 220" preserveAspectRatio="xMidYMid meet">
                  <line x1="50" y1="20" x2="50" y2="180" stroke="#475569" strokeWidth="2" />
                  <line x1="50" y1="180" x2="460" y2="180" stroke="#475569" strokeWidth="2" />
                  <text x="15" y="25" fill="#94a3b8" fontSize="10" fontFamily="monospace">Real Value (₹)</text>
                  <text x="410" y="200" fill="#94a3b8" fontSize="10" fontFamily="monospace">Years</text>

                  {/* Exponential decay curve simulation */}
                  <path
                    d="M 50 40 Q 150 90 250 120 T 450 155"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="3"
                  />
                  <text x="320" y="145" fill="#ef4444" fontSize="9" fontFamily="monospace" fontWeight="bold">Inflation Erosion Curve</text>
                  <circle cx="50" cy="40" r="4" fill="#10b981" />
                  <text x="60" y="45" fill="#10b981" fontSize="9" fontFamily="monospace">Year 0: 100%</text>

                  <circle cx="450" cy="155" r="4" fill="#ef4444" />
                  <text x="390" y="170" fill="#ef4444" fontSize="8" fontFamily="monospace">Year {ppYears}</text>
                </svg>
              </div>
            </div>
          )}

          {/* Step-by-Step Dynamic Math Breakdown */}
          <div className="saas-card p-6 space-y-4">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" />
              <span>Step-by-Step Mathematical Solution</span>
            </h3>

            <div className="space-y-2 text-xs font-mono bg-zinc-50 dark:bg-zinc-850 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
              {resultData.steps.map((step, idx) => (
                <div key={idx} className="text-zinc-800 dark:text-zinc-200 leading-relaxed">
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------- */}
      {/* AEO / EDUCATIONAL DEEP DIVE & FAQS */}
      {/* --------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <div className="saas-card p-6 space-y-4">
            <h3 className="font-bold text-base flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-500" />
              <span>{activeCalcMeta.aeoQuestion}</span>
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {activeCalcMeta.aeoAnswer}
            </p>

            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-2 text-xs">
              <span className="font-bold text-zinc-900 dark:text-zinc-100 block">How to Calculate Manually:</span>
              <p className="text-zinc-500 leading-relaxed">
                1. Identify your initial and final input metrics from your dataset.<br />
                2. Compute percentage changes or absolute incremental margins.<br />
                3. Apply the standard formula <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-indigo-600 dark:text-indigo-400 font-mono">{activeCalcMeta.formulaDisplay}</code>.<br />
                4. Classify the resulting coefficient against economic benchmark thresholds.
              </p>
            </div>
          </div>
        </div>

        {/* Related Toolique Tools */}
        <div className="lg:col-span-5 space-y-6">
          <div className="saas-card p-6 space-y-4">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              <span>Related Toolique Calculators</span>
            </h3>

            <div className="grid grid-cols-1 gap-2 text-xs">
              {[
                { name: 'GST Calculator', slug: '/calculators/gst-calculator', desc: 'Indian CGST, SGST, IGST & reverse tax splits' },
                { name: 'Compound Interest Calculator', slug: '/calculators/compound-interest-calculator', desc: 'CAGR, wealth compounding & future value' },
                { name: 'In-Hand Salary Calculator', slug: '/calculators/in-hand-salary-calculator', desc: 'CTC to take-home salary with PF & TDS deductions' },
                { name: 'Construction Cost Calculator', slug: '/calculators/construction-cost-calculator', desc: 'Civil engineering building cost & BOQ takeoff' }
              ].map((link, idx) => (
                <a
                  key={idx}
                  href={link.slug}
                  className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-indigo-400 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition flex items-center justify-between group"
                >
                  <div>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 block">
                      {link.name}
                    </span>
                    <span className="text-[11px] text-zinc-400">{link.desc}</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-indigo-600 transition shrink-0" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

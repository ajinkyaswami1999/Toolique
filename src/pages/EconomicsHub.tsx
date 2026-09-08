import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, Search, ArrowRight, BookOpen, HelpCircle,
  Layers, Globe, Sparkles, DollarSign, BarChart2,
  Coins, PiggyBank, Target, Scale, Factory, Activity,
  LineChart, Flame, Users, Building2, Zap, RefreshCw,
  Percent, Wallet, ArrowLeftRight, Heart, Bookmark,
  GraduationCap, Briefcase, ShieldCheck, Copy, Check,
  ChevronDown, ChevronUp, SlidersHorizontal
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import SEO from '../components/SEO';

interface EconToolItem {
  id: string;
  name: string;
  shortName: string;
  desc: string;
  slug: string;
  category: 'micro' | 'macro';
  formula: string;
  tags: string[];
  icon: LucideIcon;
  gradientClass: string;
  badgeClass: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

export default function EconomicsHub() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'micro' | 'macro' | 'favorites'>('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [copiedFormulaIndex, setCopiedFormulaIndex] = useState<number | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('toolique_favorites');
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load favorites', e);
    }
  }, []);

  // Toggle favorite status
  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      let updated: string[];
      if (favorites.includes(id)) {
        updated = favorites.filter(favId => favId !== id);
      } else {
        updated = [...favorites, id];
      }
      setFavorites(updated);
      localStorage.setItem('toolique_favorites', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save favorite', e);
    }
  };

  // Copy formula helper
  const handleCopyFormula = (formulaText: string, index: number) => {
    navigator.clipboard.writeText(formulaText);
    setCopiedFormulaIndex(index);
    setTimeout(() => setCopiedFormulaIndex(null), 2000);
  };

  // 12 Microeconomics Tools
  const microTools: EconToolItem[] = [
    {
      id: 'PriceElasticityDemandCalculator',
      name: 'Price Elasticity of Demand (PED)',
      shortName: 'Price Elasticity of Demand',
      desc: 'Measures quantity responsiveness to price shifts using standard percentage and midpoint arc formulas.',
      slug: 'price-elasticity-demand-calculator',
      category: 'micro',
      formula: 'PED = %ΔQd / %ΔP',
      tags: ['Midpoint Method', 'Elastic vs Inelastic', 'Revenue Test'],
      icon: TrendingDown,
      gradientClass: 'from-indigo-500/10 to-violet-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/60',
      badgeClass: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
    },
    {
      id: 'IncomeElasticityDemandCalculator',
      name: 'Income Elasticity of Demand (YED)',
      shortName: 'Income Elasticity',
      desc: 'Classifies goods as normal necessities, luxury items, or inferior goods based on consumer income shifts.',
      slug: 'income-elasticity-demand-calculator',
      category: 'micro',
      formula: 'YED = %ΔQd / %ΔY',
      tags: ['Normal Goods', 'Luxury Goods', 'Inferior Goods'],
      icon: Wallet,
      gradientClass: 'from-violet-500/10 to-purple-500/10 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800/60',
      badgeClass: 'bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border-violet-200 dark:border-violet-800'
    },
    {
      id: 'CrossElasticityDemandCalculator',
      name: 'Cross Elasticity of Demand (XED)',
      shortName: 'Cross Elasticity',
      desc: 'Determines substitute vs complementary product relationships and cross-market price elasticity.',
      slug: 'cross-elasticity-demand-calculator',
      category: 'micro',
      formula: 'XED = %ΔQd(A) / %ΔP(B)',
      tags: ['Substitutes (XED>0)', 'Complements (XED<0)', 'Cross-Price'],
      icon: ArrowLeftRight,
      gradientClass: 'from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/60',
      badgeClass: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800'
    },
    {
      id: 'PriceElasticitySupplyCalculator',
      name: 'Price Elasticity of Supply (PES)',
      shortName: 'Price Elasticity of Supply',
      desc: 'Evaluates supplier responsiveness to market price fluctuations across immediate, short, and long-run horizons.',
      slug: 'price-elasticity-supply-calculator',
      category: 'micro',
      formula: 'PES = %ΔQs / %ΔP',
      tags: ['Supply Elasticity', 'Time Horizon', 'Capacity Limits'],
      icon: TrendingUp,
      gradientClass: 'from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60',
      badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
    },
    {
      id: 'MarginalCostCalculator',
      name: 'Marginal Cost Calculator (MC)',
      shortName: 'Marginal Cost',
      desc: 'Calculates incremental production cost per additional unit (MC) along with ATC, AVC, and AFC cost curves.',
      slug: 'marginal-cost-calculator',
      category: 'micro',
      formula: 'MC = ΔTC / ΔQ',
      tags: ['Average Total Cost', 'Average Variable Cost', 'Cost Curves'],
      icon: BarChart2,
      gradientClass: 'from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60',
      badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800'
    },
    {
      id: 'MarginalRevenueCalculator',
      name: 'Marginal Revenue & Average Revenue',
      shortName: 'Marginal Revenue',
      desc: 'Computes additional revenue generated per extra unit sold and optimal profit-maximizing output (MR = MC).',
      slug: 'marginal-revenue-calculator',
      category: 'micro',
      formula: 'MR = ΔTR / ΔQ',
      tags: ['Profit Max (MR=MC)', 'Revenue Curves', 'Average Revenue'],
      icon: Coins,
      gradientClass: 'from-cyan-500/10 to-blue-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800/60',
      badgeClass: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800'
    },
    {
      id: 'EconomicProfitCalculator',
      name: 'Economic Profit vs Accounting Profit',
      shortName: 'Economic Profit',
      desc: 'Calculates true economic profit by factoring in implicit opportunity costs versus explicit book accounting costs.',
      slug: 'economic-profit-calculator',
      category: 'micro',
      formula: 'Profit = TR - Explicit - Implicit',
      tags: ['Implicit Costs', 'Normal Profit', 'Supernormal Return'],
      icon: PiggyBank,
      gradientClass: 'from-rose-500/10 to-pink-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/60',
      badgeClass: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800'
    },
    {
      id: 'BreakEvenPointCalculator',
      name: 'Break-Even Point (BEP) & CVP Analysis',
      shortName: 'Break-Even Point',
      desc: 'Calculates unit volume and revenue required to cover fixed and variable costs with zero financial loss.',
      slug: 'break-even-point-calculator',
      category: 'micro',
      formula: 'BEP = FC / (P - VC)',
      tags: ['Contribution Margin', 'CVP Curves', 'Margin of Safety'],
      icon: Target,
      gradientClass: 'from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/60',
      badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800'
    },
    {
      id: 'OpportunityCostCalculator',
      name: 'Opportunity Cost Analysis Solver',
      shortName: 'Opportunity Cost',
      desc: 'Compares financial and qualitative returns of chosen investments against the highest-value forgone alternative.',
      slug: 'opportunity-cost-calculator',
      category: 'micro',
      formula: 'Opp Cost = Return(Forgone) - Return(Chosen)',
      tags: ['Trade-Offs', 'Capital Allocation', 'Decision Matrix'],
      icon: Scale,
      gradientClass: 'from-teal-500/10 to-emerald-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800/60',
      badgeClass: 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800'
    },
    {
      id: 'ProductionFunctionCalculator',
      name: 'Production Function (MPL & APL)',
      shortName: 'Production Function',
      desc: 'Calculates marginal product of labor (MPL), average product (APL), and stages of diminishing returns.',
      slug: 'production-function-calculator',
      category: 'micro',
      formula: 'MPL = ΔQ / ΔL',
      tags: ['Diminishing Returns', 'Marginal Product', 'Labor Efficiency'],
      icon: Factory,
      gradientClass: 'from-amber-500/10 to-yellow-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60',
      badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800'
    },
    {
      id: 'MarketEquilibriumCalculator',
      name: 'Supply & Demand Equilibrium Solver',
      shortName: 'Market Equilibrium',
      desc: 'Solves linear supply and demand equations for market clearing price, quantity, consumer surplus, and producer surplus.',
      slug: 'market-equilibrium-calculator',
      category: 'micro',
      formula: 'Qd = Qs ⇒ P*, Q*',
      tags: ['Market Clearing', 'Consumer Surplus', 'Producer Surplus'],
      icon: Activity,
      gradientClass: 'from-indigo-500/10 to-blue-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/60',
      badgeClass: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
    },
    {
      id: 'TotalRevenueCalculator',
      name: 'Total Revenue & Elasticity Test',
      shortName: 'Total Revenue Test',
      desc: 'Computes total sales revenue and applies total revenue test for price elasticity pricing decisions.',
      slug: 'total-revenue-calculator',
      category: 'micro',
      formula: 'TR = P × Q',
      tags: ['Total Revenue Test', 'Pricing Strategy', 'Elasticity Shift'],
      icon: DollarSign,
      gradientClass: 'from-emerald-500/10 to-green-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60',
      badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
    }
  ];

  // 11 Macroeconomics Tools
  const macroTools: EconToolItem[] = [
    {
      id: 'GdpGrowthRateCalculator',
      name: 'GDP Growth Rate Calculator',
      shortName: 'GDP Growth Rate',
      desc: 'Calculates period-over-period national output expansion or contraction percentages with recession indicators.',
      slug: 'gdp-growth-rate-calculator',
      category: 'macro',
      formula: 'Growth = [(GDP₂ - GDP₁) / GDP₁] × 100',
      tags: ['Quarterly & Annual', 'Recession Index', 'Economic Expansion'],
      icon: LineChart,
      gradientClass: 'from-blue-500/10 to-cyan-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/60',
      badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800'
    },
    {
      id: 'RealGdpCalculator',
      name: 'Real GDP & GDP Deflator Solver',
      shortName: 'Real GDP & Deflator',
      desc: 'Calculates inflation-adjusted constant price output and implicit price deflator indices.',
      slug: 'real-gdp-calculator',
      category: 'macro',
      formula: 'Real GDP = (Nominal GDP / Deflator) × 100',
      tags: ['Base Year Prices', 'Price Deflator', 'Inflation Adjustment'],
      icon: Layers,
      gradientClass: 'from-sky-500/10 to-indigo-500/10 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800/60',
      badgeClass: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800'
    },
    {
      id: 'InflationRateCalculator',
      name: 'Inflation Rate (CPI Based) Solver',
      shortName: 'Inflation Rate (CPI)',
      desc: 'Computes consumer price index escalation and cost-of-living purchasing power loss percentages.',
      slug: 'inflation-rate-calculator',
      category: 'macro',
      formula: 'Inflation = [(CPI₂ - CPI₁) / CPI₁] × 100',
      tags: ['CPI Index', 'Cost of Living', 'Headline Inflation'],
      icon: Flame,
      gradientClass: 'from-orange-500/10 to-rose-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800/60',
      badgeClass: 'bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-800'
    },
    {
      id: 'PurchasingPowerCalculator',
      name: 'Purchasing Power Erosion Calculator',
      shortName: 'Purchasing Power Erosion',
      desc: 'Simulates compound inflation decay of cash savings, salary values, and purchasing power over 1 to 50 years.',
      slug: 'purchasing-power-calculator',
      category: 'macro',
      formula: 'Future Value = PV / (1 + r)^t',
      tags: ['Compound Decay', 'Real Wealth', 'Inflation Drag'],
      icon: TrendingDown,
      gradientClass: 'from-rose-500/10 to-red-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/60',
      badgeClass: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800'
    },
    {
      id: 'UnemploymentRateCalculator',
      name: 'Unemployment Rate & Labor Force (LFPR)',
      shortName: 'Unemployment Rate & LFPR',
      desc: 'Computes official jobless percentages, total labor force, and labor force participation rates (LFPR).',
      slug: 'unemployment-rate-calculator',
      category: 'macro',
      formula: 'Unemployment = (Unemployed / LF) × 100',
      tags: ['LFPR Rate', 'Labor Force', 'Jobless Ratio'],
      icon: Users,
      gradientClass: 'from-purple-500/10 to-indigo-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/60',
      badgeClass: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800'
    },
    {
      id: 'EconomicGrowthRuleOf70Calculator',
      name: 'Economic Growth & Rule of 70 Solver',
      shortName: 'Rule of 70 & Doubling',
      desc: 'Estimates compound annual growth rates (CAGR) and years required to double national GDP or personal wealth.',
      slug: 'economic-growth-rule-of-70-calculator',
      category: 'macro',
      formula: 'Doubling Time ≈ 70 / r%',
      tags: ['Rule of 70', 'Compound CAGR', 'Doubling Time'],
      icon: Sparkles,
      gradientClass: 'from-amber-500/10 to-yellow-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60',
      badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800'
    },
    {
      id: 'KeynesianNationalIncomeCalculator',
      name: 'Keynesian National Income (Y = C+I+G+NX)',
      shortName: 'Keynesian National Income',
      desc: 'Calculates aggregate GDP using the expenditure approach: Consumption, Investment, Government & Net Exports.',
      slug: 'keynesian-national-income-calculator',
      category: 'macro',
      formula: 'Y = C + I + G + (X - M)',
      tags: ['Expenditure Approach', 'Trade Balance (NX)', 'Aggregate Demand'],
      icon: Building2,
      gradientClass: 'from-indigo-500/10 to-violet-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/60',
      badgeClass: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
    },
    {
      id: 'KeynesianMultiplierCalculator',
      name: 'Keynesian Spending Multiplier Solver',
      shortName: 'Spending Multiplier (k)',
      desc: 'Calculates fiscal stimulus spending and tax multipliers from marginal propensity to consume (MPC / MPS).',
      slug: 'keynesian-multiplier-calculator',
      category: 'macro',
      formula: 'k = 1 / (1 - MPC) = 1 / MPS',
      tags: ['Fiscal Stimulus', 'MPC & MPS', 'Tax Multiplier'],
      icon: Zap,
      gradientClass: 'from-yellow-500/10 to-amber-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/60',
      badgeClass: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/60 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
    },
    {
      id: 'ComparativeAdvantageCalculator',
      name: 'Comparative Advantage & Trade Solver',
      shortName: 'Comparative Advantage',
      desc: 'Determines country production specializations, opportunity cost ratios, and mutually beneficial trade terms.',
      slug: 'comparative-advantage-calculator',
      category: 'macro',
      formula: 'Opp Cost = Output(B) / Output(A)',
      tags: ['Ricardian Trade', 'Specialization', 'Terms of Trade'],
      icon: Globe,
      gradientClass: 'from-emerald-500/10 to-cyan-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60',
      badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
    },
    {
      id: 'VelocityOfMoneyCalculator',
      name: 'Velocity of Money (MV = PY) Calculator',
      shortName: 'Velocity of Money',
      desc: 'Calculates turnover speed of money supply based on the classical Quantity Theory of Money equation.',
      slug: 'velocity-of-money-calculator',
      category: 'macro',
      formula: 'V = (P × Y) / M',
      tags: ['Quantity Theory', 'Money Supply M1/M2', 'Monetary Velocity'],
      icon: RefreshCw,
      gradientClass: 'from-teal-500/10 to-blue-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800/60',
      badgeClass: 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800'
    },
    {
      id: 'RealInterestRateCalculator',
      name: 'Fisher Equation & Real Interest Rate',
      shortName: 'Real Interest Rate',
      desc: 'Calculates inflation-adjusted real yields on savings deposits, treasury bonds, and borrowing loans.',
      slug: 'real-interest-rate-calculator',
      category: 'macro',
      formula: 'r ≈ i - π  (Exact: 1+r = (1+i)/(1+π))',
      tags: ['Fisher Effect', 'Nominal vs Real', 'Inflation Expectation'],
      icon: Percent,
      gradientClass: 'from-blue-500/10 to-teal-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/60',
      badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800'
    }
  ];

  const allTools = useMemo(() => [...microTools, ...macroTools], [microTools, macroTools]);

  // Quick Filter Suggestion Tags
  const quickTags = [
    'Elasticity', 'Break-Even', 'Equilibrium', 'Inflation',
    'Real GDP', 'Marginal Cost', 'Multiplier', 'Rule of 70'
  ];

  // Filtering Logic
  const filteredTools = useMemo(() => {
    let result = allTools;

    if (activeTab === 'micro') {
      result = microTools;
    } else if (activeTab === 'macro') {
      result = macroTools;
    } else if (activeTab === 'favorites') {
      result = allTools.filter(tool => favorites.includes(tool.id));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(tool =>
        tool.name.toLowerCase().includes(q) ||
        tool.shortName.toLowerCase().includes(q) ||
        tool.desc.toLowerCase().includes(q) ||
        tool.formula.toLowerCase().includes(q) ||
        tool.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [allTools, microTools, macroTools, activeTab, favorites, searchQuery]);

  // Curated Learning & Industry Workflows
  const workflowsList = [
    {
      icon: GraduationCap,
      title: 'Academic & Exam Solver',
      desc: 'Step-by-step mathematical proofs for Midpoint Elasticity, Market Equilibrium, and Keynesian Multiplier.',
      color: 'from-indigo-500/10 to-violet-500/10 border-indigo-200 dark:border-indigo-800/50',
      tools: [
        { name: 'Price Elasticity of Demand', slug: 'price-elasticity-demand-calculator' },
        { name: 'Market Equilibrium Solver', slug: 'market-equilibrium-calculator' },
        { name: 'Keynesian Multiplier', slug: 'keynesian-multiplier-calculator' }
      ]
    },
    {
      icon: Briefcase,
      title: 'Pricing & Business Strategy',
      desc: 'Optimize unit pricing, evaluate fixed cost recovery, and conduct Total Revenue elasticity tests.',
      color: 'from-emerald-500/10 to-teal-500/10 border-emerald-200 dark:border-emerald-800/50',
      tools: [
        { name: 'Break-Even Point (BEP)', slug: 'break-even-point-calculator' },
        { name: 'Marginal Cost & Revenue', slug: 'marginal-cost-calculator' },
        { name: 'Total Revenue Test', slug: 'total-revenue-calculator' }
      ]
    },
    {
      icon: Globe,
      title: 'Macro & Policy Analysis',
      desc: 'Model national growth rates, forecast long-term inflation decay, and calculate the velocity of money.',
      color: 'from-blue-500/10 to-cyan-500/10 border-blue-200 dark:border-blue-800/50',
      tools: [
        { name: 'Real GDP & Deflator', slug: 'real-gdp-calculator' },
        { name: 'Inflation Rate (CPI)', slug: 'inflation-rate-calculator' },
        { name: 'Rule of 70 Doubling', slug: 'economic-growth-rule-of-70-calculator' }
      ]
    },
    {
      icon: Factory,
      title: 'Labor & Production Economics',
      desc: 'Assess marginal product of labor, stage of diminishing returns, and labor force participation metrics.',
      color: 'from-amber-500/10 to-yellow-500/10 border-amber-200 dark:border-amber-800/50',
      tools: [
        { name: 'Production Function (MPL)', slug: 'production-function-calculator' },
        { name: 'Unemployment & LFPR', slug: 'unemployment-rate-calculator' },
        { name: 'Comparative Advantage', slug: 'comparative-advantage-calculator' }
      ]
    }
  ];

  // Cheat Sheet Quick Reference
  const cheatSheet = [
    { title: 'Price Elasticity of Demand (PED)', formula: 'PED = (%ΔQd) / (%ΔP) = [(Q₂ - Q₁)/Q_avg] / [(P₂ - P₁)/P_avg]', toolSlug: 'price-elasticity-demand-calculator' },
    { title: 'Break-Even Quantity (BEP)', formula: 'BEP (Units) = Total Fixed Costs / (Price - Variable Cost)', toolSlug: 'break-even-point-calculator' },
    { title: 'Market Clearing Equilibrium', formula: 'Set Qd(P) = Qs(P) → Solve for P* & Q*', toolSlug: 'market-equilibrium-calculator' },
    { title: 'Real GDP from Nominal GDP', formula: 'Real GDP = (Nominal GDP / GDP Deflator) × 100', toolSlug: 'real-gdp-calculator' },
    { title: 'Keynesian Spending Multiplier', formula: 'Multiplier (k) = 1 / (1 - MPC) = 1 / MPS', toolSlug: 'keynesian-multiplier-calculator' },
    { title: 'Fisher Real Interest Rate', formula: 'Real Rate (r) = Nominal Rate (i) - Inflation (π)', toolSlug: 'real-interest-rate-calculator' },
    { title: 'Rule of 70 (Doubling Time)', formula: 'Years to Double ≈ 70 / Annual Growth Rate (%)', toolSlug: 'economic-growth-rule-of-70-calculator' },
    { title: 'Quantity Theory of Money', formula: 'M × V = P × Y  →  V = (P × Y) / M', toolSlug: 'velocity-of-money-calculator' }
  ];

  // FAQs
  const localFaqs: FAQItem[] = [
    {
      question: 'What is the Economics Calculator Hub on Toolique?',
      answer: 'The Toolique Economics Calculator Hub is a free, 100% privacy-first online suite featuring 24 specialized calculation engines across Microeconomics and Macroeconomics. It provides instant formula solving, dynamic step-by-step mathematical proofs, and interactive graphical visualizers for students, educators, financial analysts, and corporate researchers.'
    },
    {
      question: 'How does the Price Elasticity of Demand (PED) calculator work?',
      answer: 'The PED calculator computes the responsiveness of quantity demanded to price shifts using both standard percentage change and midpoint (arc) formulas. It automatically classifies demand as elastic (|PED| > 1), unitary elastic (|PED| = 1), or inelastic (|PED| < 1), and illustrates the resulting impact on Total Revenue.'
    },
    {
      question: 'How do you calculate Market Equilibrium Price and Quantity?',
      answer: 'The market equilibrium engine solves linear demand (Qd = a - bP) and supply (Qs = c + dP) systems simultaneously by setting Qd = Qs. It finds the market clearing equilibrium price P* and quantity Q*, while computing Consumer Surplus and Producer Surplus with an interactive graphical chart.'
    },
    {
      question: 'What is the difference between Real GDP and Nominal GDP?',
      answer: 'Nominal GDP measures output at current market prices without adjusting for inflation, whereas Real GDP deflates nominal values using the GDP Deflator index to represent actual physical production changes in base-year constant prices.'
    },
    {
      question: 'How is the Break-Even Point (BEP) determined?',
      answer: 'Break-Even Units = Total Fixed Costs ÷ (Selling Price per Unit - Variable Cost per Unit). At this exact sales volume, Total Revenue equals Total Cost, yielding zero profit and zero loss.'
    },
    {
      question: 'Are my economic numbers and formulas tracked or stored?',
      answer: 'Never. All calculations execute 100% locally in your web browser sandbox. No input variables, price figures, or scenario models are ever transmitted to or stored on external servers.'
    }
  ];

  const PILLARS = [
    { id: 'calculators', name: 'General Calculators Hub', description: 'Calculators for finance, unit conversions, and math.', path: '/calculators' },
    { id: 'finance', name: 'Finance & Tax Suite', description: 'Income Tax, SIP, Salary & Loan optimization.', path: '/finance' },
    { id: 'architecture', name: 'Architecture & Civil Hub', description: 'FSI calculations, setback plans, and materials.', path: '/architecture' },
    { id: 'developer', name: 'Developer Utilities', description: 'SQL formatting, JSON validation, and web tag generators.', path: '/developer' }
  ];

  const schemaMarkup = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': 'https://www.toolique.in/economics#collection',
        'url': 'https://www.toolique.in/economics',
        'name': 'Economics Calculator Hub | Microeconomics & Macroeconomics Formulas',
        'description': 'Free online Economics Calculator Suite. Solve 24+ micro and macro economics formulas, including Price Elasticity, Market Equilibrium, Break-Even, GDP, and Inflation with step-by-step proofs.',
        'isPartOf': { '@id': 'https://www.toolique.in/#website' }
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://www.toolique.in/economics#faq',
        'mainEntity': localFaqs.map(faq => ({
          '@type': 'Question',
          'name': faq.question,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': faq.answer
          }
        }))
      }
    ]
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 text-left py-2 animate-fadeIn">
      <SEO
        title="Economics Calculator Hub | Micro & Macroeconomics Formulas Suite"
        description="Calculate 24+ microeconomics and macroeconomics formulas online. Solve Price Elasticity (PED/YED/XED), Market Equilibrium, Break-Even, Real GDP, Inflation rate, and Keynesian national accounts with step-by-step mathematical proofs."
        keywords={[
          'Economics Calculator',
          'Economics Hub',
          'Microeconomics Calculator',
          'Macroeconomics Calculator',
          'Elasticity Calculator',
          'Price Elasticity of Demand',
          'GDP Growth Rate Calculator',
          'Inflation Rate Calculator',
          'Break-Even Calculator',
          'Market Equilibrium Solver',
          'Economics Problem Solver'
        ]}
        schemaMarkup={schemaMarkup}
      />

      {/* 1. Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 border border-indigo-500/20 shadow-2xl p-6 sm:p-10 text-white">
        {/* Background glow accents */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6 max-w-4xl">
          {/* Top Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-300 text-xs font-semibold backdrop-blur-md shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>Dedicated Economic Modeling & Calculation Suite</span>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight bg-gradient-to-r from-white via-zinc-100 to-indigo-200 bg-clip-text text-transparent">
              Economics Calculator Hub
            </h1>
            <p className="text-zinc-300 text-xs sm:text-sm md:text-base leading-relaxed max-w-3xl">
              Solve 24 specialized Micro and Macro economics formulas instantly. Compute midpoint price elasticity,
              solve linear market equilibrium systems, analyze CVP break-even curves, forecast inflation drag, and
              verify Keynesian national accounts with 100% dynamic mathematical proofs.
            </p>
          </div>

          {/* Search Box & Quick Tags */}
          <div className="space-y-3 pt-2">
            <div className="relative max-w-2xl">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search formulas, concepts, or equations (e.g. elasticity, break-even, GDP, multiplier)..."
                className="w-full pl-12 pr-12 py-3.5 bg-white/10 dark:bg-black/30 border border-white/20 focus:border-indigo-400 rounded-2xl text-white placeholder-zinc-400 text-xs sm:text-sm outline-none transition backdrop-blur-md shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white bg-white/15 px-2.5 py-1 rounded-xl transition"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick search tags */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-400 pt-1">
              <span className="font-semibold text-zinc-500 text-[11px]">Popular:</span>
              {quickTags.map((tag, idx) => (
                <button
                  key={idx}
                  onClick={() => setSearchQuery(tag)}
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition cursor-pointer ${
                    searchQuery.toLowerCase() === tag.toLowerCase()
                      ? 'bg-indigo-500 text-white border-indigo-400'
                      : 'bg-white/5 border-white/10 hover:bg-white/15 hover:text-zinc-200 text-zinc-300'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10 text-xs">
            <div className="bg-white/5 p-3 rounded-2xl border border-white/5 backdrop-blur-xs">
              <span className="text-zinc-400 block text-[11px]">Dedicated Solvers</span>
              <span className="font-mono text-base sm:text-lg font-black text-white">24 Calculators</span>
            </div>
            <div className="bg-white/5 p-3 rounded-2xl border border-white/5 backdrop-blur-xs">
              <span className="text-zinc-400 block text-[11px]">Core Disciplines</span>
              <span className="font-mono text-base sm:text-lg font-black text-indigo-300">Micro & Macro</span>
            </div>
            <div className="bg-white/5 p-3 rounded-2xl border border-white/5 backdrop-blur-xs">
              <span className="text-zinc-400 block text-[11px]">Math Proofs</span>
              <span className="font-mono text-base sm:text-lg font-black text-emerald-300">100% Dynamic</span>
            </div>
            <div className="bg-white/5 p-3 rounded-2xl border border-white/5 backdrop-blur-xs">
              <span className="text-zinc-400 block text-[11px]">Privacy Guarantee</span>
              <span className="font-mono text-base sm:text-lg font-black text-amber-300">100% Private</span>
            </div>
          </div>
        </div>
      </div>


      {/* 3. Category Filter Tabs */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Browse Categories
            </span>
          </div>

          {/* Navigation Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-zinc-100 dark:bg-zinc-850 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-xl transition ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              All Tools ({allTools.length})
            </button>
            <button
              onClick={() => setActiveTab('micro')}
              className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                activeTab === 'micro'
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Microeconomics ({microTools.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('macro')}
              className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                activeTab === 'macro'
                  ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Macroeconomics ({macroTools.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                activeTab === 'favorites'
                  ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${favorites.length > 0 ? 'fill-current text-rose-500' : ''}`} />
              <span>Favorites ({favorites.length})</span>
            </button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>
            Showing <strong className="text-zinc-900 dark:text-zinc-100">{filteredTools.length}</strong> {filteredTools.length === 1 ? 'calculator' : 'calculators'}
            {searchQuery && ` matching "${searchQuery}"`}
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
            >
              Reset Search
            </button>
          )}
        </div>

        {/* 4. Enhanced Tools Grid */}
        {filteredTools.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 space-y-3">
            <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full w-12 h-12 mx-auto flex items-center justify-center text-zinc-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              No matching calculators found
            </h3>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              We couldn't find any economics calculator matching &quot;{searchQuery}&quot;. Try searching for &quot;elasticity&quot;, &quot;cost&quot;, &quot;GDP&quot;, or &quot;inflation&quot;.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setActiveTab('all'); }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition"
            >
              View All Calculators
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTools.map((tool) => {
              const IconComp = tool.icon;
              const isFav = favorites.includes(tool.id);

              return (
                <Link
                  key={tool.id}
                  to={`/economics/${tool.slug}`}
                  className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800/90 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-xl dark:hover:shadow-indigo-950/20 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div>
                    {/* Top Row: Icon + Badge + Favorite */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className={`p-2.5 rounded-xl border ${tool.gradientClass} shadow-2xs group-hover:scale-105 transition-transform duration-300`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9.5px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${tool.badgeClass}`}>
                          {tool.category === 'micro' ? 'Micro' : 'Macro'}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => toggleFavorite(e, tool.id)}
                          className={`p-1.5 rounded-lg border transition duration-200 cursor-pointer ${
                            isFav
                              ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400'
                              : 'bg-zinc-50 dark:bg-zinc-850 border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-rose-500'
                          }`}
                          title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current text-rose-500' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Tool Name */}
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200 mb-1 leading-snug">
                      {tool.name}
                    </h3>

                    {/* Description */}
                    <p className="text-[11.5px] text-zinc-500 dark:text-zinc-400 leading-relaxed mb-3 line-clamp-2">
                      {tool.desc}
                    </p>

                    {/* Mathematical Formula Snippet Badge */}
                    <div className="mb-3 px-2.5 py-1.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60 font-mono text-[10.5px] text-zinc-700 dark:text-zinc-300 flex items-center justify-between gap-1 overflow-hidden">
                      <span className="truncate">{tool.formula}</span>
                      <Bookmark className="w-3 h-3 text-zinc-400 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {tool.tags.slice(0, 2).map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-850 px-2 py-0.5 rounded-md border border-zinc-200/60 dark:border-zinc-800/80"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300">
                    <span>Solve Equation</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Curated Learning Journeys & Practical Workflows */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          <div>
            <h2 className="text-lg font-black text-zinc-900 dark:text-white">
              Curated Economic Workflows & Problem Sets
            </h2>
            <p className="text-xs text-zinc-500">
              Accelerate your analysis with structured calculation workflows tailored for exams, business decisions, and policy models.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {workflowsList.map((wf, idx) => {
            const Icon = wf.icon;
            return (
              <div
                key={idx}
                className={`p-5 rounded-2xl border bg-gradient-to-br ${wf.color} bg-white dark:bg-zinc-900/60 flex flex-col justify-between space-y-4`}
              >
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 w-fit text-indigo-600 dark:text-indigo-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {wf.title}
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {wf.desc}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-zinc-200/60 dark:border-zinc-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Included Tools:
                  </span>
                  {wf.tools.map((t, tIdx) => (
                    <Link
                      key={tIdx}
                      to={`/economics/${t.slug}`}
                      className="block text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline truncate"
                    >
                      • {t.name}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Interactive Economic Formula Cheat Sheet */}
      <div className="p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-500" />
              <span>Core Economic Formulas Cheat Sheet</span>
            </h2>
            <p className="text-xs text-zinc-500">
              Quick reference equations for rapid revision, coursework, or business financial modeling.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {cheatSheet.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-850/70 border border-zinc-200/80 dark:border-zinc-800 flex flex-col justify-between space-y-2 hover:border-indigo-300 dark:hover:border-indigo-700 transition"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                  {item.title}
                </span>
                <button
                  onClick={() => handleCopyFormula(item.formula, idx)}
                  className="p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition cursor-pointer shrink-0"
                  title="Copy formula"
                >
                  {copiedFormulaIndex === idx ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-750 font-mono text-[11px] text-indigo-700 dark:text-indigo-300 overflow-x-auto">
                {item.formula}
              </div>
              <div className="flex justify-end">
                <Link
                  to={`/economics/${item.toolSlug}`}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <span>Launch Solver</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Frequently Asked Questions (Accordion) */}
      <div className="p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-6">
        <h2 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-500" />
          <span>Frequently Asked Questions</span>
        </h2>
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {localFaqs.map((faq, idx) => {
            const isOpen = expandedFaq === idx;
            return (
              <div key={idx} className="py-4">
                <button
                  type="button"
                  onClick={() => setExpandedFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left gap-4 group cursor-pointer"
                >
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {faq.question}
                  </h3>
                  <div className="p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 shrink-0">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>
                {isOpen && (
                  <p className="mt-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed animate-fadeIn">
                    {faq.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 8. Cross Pillar Suite Exploration */}
      <div className="space-y-4 pt-2">
        <h2 className="text-base font-black text-zinc-900 dark:text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-500" />
          <span>Explore Other Toolique Suites & Calculation Hubs</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {PILLARS.map((pillar) => (
            <Link
              key={pillar.id}
              to={pillar.path}
              className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-400 hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 block mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {pillar.name}
                </span>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
              <div className="mt-3 flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 gap-1">
                <span>View Suite</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

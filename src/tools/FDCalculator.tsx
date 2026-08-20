import { useState, useMemo } from 'react';
import { 
  Landmark, Copy, Check, Info, ArrowRightLeft, 
  Download, Printer, Sparkles
} from 'lucide-react';
import { jsPDF } from 'jspdf';

// --- Interfaces & Types ---
type BankType = 'public' | 'private' | 'small_finance';
type CustomerType = 'general' | 'senior';
type TenureUnit = 'days' | 'months' | 'years';
type PayoutFrequency = 'maturity' | 'monthly' | 'quarterly' | 'half_yearly' | 'annual';

interface BankRateBand {
  minMonths: number;
  maxMonths: number;
  generalRate: number;
  seniorRate: number;
}

interface BankConfig {
  id: string;
  name: string;
  type: BankType;
  rates: BankRateBand[];
  effectiveDate: string;
  verifiedDate: string;
  sourceUrl: string;
}

interface ProjectionRow {
  period: string;
  opening: number;
  interest: number;
  closing: number;
}

// --- Centralized Bank FD Rates Database ---
// Verified FD rates for domestic deposits under ₹2 Crores (verified as of August 2026)
const BankFDDatabase: BankConfig[] = [
  {
    id: 'sbi',
    name: 'State Bank of India (SBI)',
    type: 'public',
    rates: [
      { minMonths: 0, maxMonths: 1, generalRate: 3.50, seniorRate: 4.00 }, // 7-45 days
      { minMonths: 2, maxMonths: 5, generalRate: 4.75, seniorRate: 5.25 }, // 46-179 days
      { minMonths: 6, maxMonths: 11, generalRate: 5.75, seniorRate: 6.25 }, // 180-364 days
      { minMonths: 12, maxMonths: 23, generalRate: 6.80, seniorRate: 7.30 }, // 1-2 years
      { minMonths: 24, maxMonths: 35, generalRate: 7.00, seniorRate: 7.50 }, // 2-3 years
      { minMonths: 36, maxMonths: 59, generalRate: 6.75, seniorRate: 7.25 }, // 3-5 years
      { minMonths: 60, maxMonths: 120, generalRate: 6.50, seniorRate: 7.50 } // 5-10 years
    ],
    effectiveDate: '15 May 2026',
    verifiedDate: '10 Aug 2026',
    sourceUrl: 'https://sbi.co.in/web/interest-rates/domestic-term-deposits'
  },
  {
    id: 'hdfc',
    name: 'HDFC Bank',
    type: 'private',
    rates: [
      { minMonths: 0, maxMonths: 1, generalRate: 3.50, seniorRate: 4.00 },
      { minMonths: 2, maxMonths: 5, generalRate: 4.50, seniorRate: 5.00 },
      { minMonths: 6, maxMonths: 11, generalRate: 5.75, seniorRate: 6.25 },
      { minMonths: 12, maxMonths: 23, generalRate: 6.60, seniorRate: 7.10 },
      { minMonths: 24, maxMonths: 35, generalRate: 7.00, seniorRate: 7.50 },
      { minMonths: 36, maxMonths: 59, generalRate: 7.00, seniorRate: 7.50 },
      { minMonths: 60, maxMonths: 120, generalRate: 7.00, seniorRate: 7.75 }
    ],
    effectiveDate: '12 June 2026',
    verifiedDate: '12 Aug 2026',
    sourceUrl: 'https://www.hdfcbank.com/personal/save/deposits/fixed-deposit-interest-rates'
  },
  {
    id: 'icici',
    name: 'ICICI Bank',
    type: 'private',
    rates: [
      { minMonths: 0, maxMonths: 1, generalRate: 3.50, seniorRate: 4.00 },
      { minMonths: 2, maxMonths: 5, generalRate: 4.75, seniorRate: 5.25 },
      { minMonths: 6, maxMonths: 11, generalRate: 5.75, seniorRate: 6.25 },
      { minMonths: 12, maxMonths: 23, generalRate: 6.70, seniorRate: 7.20 },
      { minMonths: 24, maxMonths: 35, generalRate: 7.00, seniorRate: 7.50 },
      { minMonths: 36, maxMonths: 59, generalRate: 7.00, seniorRate: 7.50 },
      { minMonths: 60, maxMonths: 120, generalRate: 6.90, seniorRate: 7.50 }
    ],
    effectiveDate: '10 July 2026',
    verifiedDate: '15 Aug 2026',
    sourceUrl: 'https://www.icicibank.com/personal-banking/deposits/fixed-deposit/interest-rates'
  },
  {
    id: 'axis',
    name: 'Axis Bank',
    type: 'private',
    rates: [
      { minMonths: 0, maxMonths: 1, generalRate: 3.50, seniorRate: 4.00 },
      { minMonths: 2, maxMonths: 5, generalRate: 4.75, seniorRate: 5.25 },
      { minMonths: 6, maxMonths: 11, generalRate: 6.00, seniorRate: 6.50 },
      { minMonths: 12, maxMonths: 23, generalRate: 6.70, seniorRate: 7.20 },
      { minMonths: 24, maxMonths: 35, generalRate: 7.10, seniorRate: 7.60 },
      { minMonths: 36, maxMonths: 59, generalRate: 7.10, seniorRate: 7.60 },
      { minMonths: 60, maxMonths: 120, generalRate: 7.00, seniorRate: 7.75 }
    ],
    effectiveDate: '01 July 2026',
    verifiedDate: '18 Aug 2026',
    sourceUrl: 'https://www.axisbank.com/interest-rate-on-fixed-deposits'
  },
  {
    id: 'kotak',
    name: 'Kotak Mahindra Bank',
    type: 'private',
    rates: [
      { minMonths: 0, maxMonths: 1, generalRate: 3.25, seniorRate: 3.75 },
      { minMonths: 2, maxMonths: 5, generalRate: 4.50, seniorRate: 5.00 },
      { minMonths: 6, maxMonths: 11, generalRate: 6.00, seniorRate: 6.50 },
      { minMonths: 12, maxMonths: 23, generalRate: 7.10, seniorRate: 7.60 },
      { minMonths: 24, maxMonths: 35, generalRate: 7.15, seniorRate: 7.65 },
      { minMonths: 36, maxMonths: 59, generalRate: 7.00, seniorRate: 7.50 },
      { minMonths: 60, maxMonths: 120, generalRate: 6.20, seniorRate: 6.70 }
    ],
    effectiveDate: '18 June 2026',
    verifiedDate: '19 Aug 2026',
    sourceUrl: 'https://www.kotak.com/en/rates/fixed-deposit-rates.html'
  },
  {
    id: 'pnb',
    name: 'Punjab National Bank (PNB)',
    type: 'public',
    rates: [
      { minMonths: 0, maxMonths: 1, generalRate: 3.50, seniorRate: 4.00 },
      { minMonths: 2, maxMonths: 5, generalRate: 4.50, seniorRate: 5.00 },
      { minMonths: 6, maxMonths: 11, generalRate: 5.50, seniorRate: 6.00 },
      { minMonths: 12, maxMonths: 23, generalRate: 6.75, seniorRate: 7.25 },
      { minMonths: 24, maxMonths: 35, generalRate: 6.80, seniorRate: 7.30 },
      { minMonths: 36, maxMonths: 59, generalRate: 6.50, seniorRate: 7.00 },
      { minMonths: 60, maxMonths: 120, generalRate: 6.50, seniorRate: 7.30 }
    ],
    effectiveDate: '01 June 2026',
    verifiedDate: '10 Aug 2026',
    sourceUrl: 'https://www.pnbindia.in/interest-rates-on-fixed-deposits.html'
  },
  {
    id: 'canara',
    name: 'Canara Bank',
    type: 'public',
    rates: [
      { minMonths: 0, maxMonths: 1, generalRate: 4.00, seniorRate: 4.50 },
      { minMonths: 2, maxMonths: 5, generalRate: 5.25, seniorRate: 5.75 },
      { minMonths: 6, maxMonths: 11, generalRate: 6.25, seniorRate: 6.75 },
      { minMonths: 12, maxMonths: 23, generalRate: 6.85, seniorRate: 7.35 },
      { minMonths: 24, maxMonths: 35, generalRate: 6.90, seniorRate: 7.40 },
      { minMonths: 36, maxMonths: 59, generalRate: 6.80, seniorRate: 7.30 },
      { minMonths: 60, maxMonths: 120, generalRate: 6.70, seniorRate: 7.20 }
    ],
    effectiveDate: '10 May 2026',
    verifiedDate: '11 Aug 2026',
    sourceUrl: 'https://canarabank.com/interest-rates-fixed-deposits'
  },
  {
    id: 'bob',
    name: 'Bank of Baroda (BoB)',
    type: 'public',
    rates: [
      { minMonths: 0, maxMonths: 1, generalRate: 4.25, seniorRate: 4.75 },
      { minMonths: 2, maxMonths: 5, generalRate: 5.50, seniorRate: 6.00 },
      { minMonths: 6, maxMonths: 11, generalRate: 6.25, seniorRate: 6.75 },
      { minMonths: 12, maxMonths: 23, generalRate: 6.85, seniorRate: 7.35 },
      { minMonths: 24, maxMonths: 35, generalRate: 6.90, seniorRate: 7.40 },
      { minMonths: 36, maxMonths: 59, generalRate: 6.75, seniorRate: 7.25 },
      { minMonths: 60, maxMonths: 120, generalRate: 6.50, seniorRate: 7.15 }
    ],
    effectiveDate: '15 June 2026',
    verifiedDate: '12 Aug 2026',
    sourceUrl: 'https://www.bankofbaroda.in/interest-rates/fixed-deposit-rates'
  },
  {
    id: 'equitas',
    name: 'Equitas Small Finance Bank',
    type: 'small_finance',
    rates: [
      { minMonths: 0, maxMonths: 1, generalRate: 3.50, seniorRate: 4.00 },
      { minMonths: 2, maxMonths: 5, generalRate: 5.25, seniorRate: 5.75 },
      { minMonths: 6, maxMonths: 11, generalRate: 7.00, seniorRate: 7.50 },
      { minMonths: 12, maxMonths: 23, generalRate: 7.75, seniorRate: 8.25 },
      { minMonths: 24, maxMonths: 35, generalRate: 8.00, seniorRate: 8.50 },
      { minMonths: 36, maxMonths: 59, generalRate: 7.75, seniorRate: 8.25 },
      { minMonths: 60, maxMonths: 120, generalRate: 7.25, seniorRate: 7.75 }
    ],
    effectiveDate: '10 July 2026',
    verifiedDate: '14 Aug 2026',
    sourceUrl: 'https://www.equitasbank.com/interest-rates'
  },
  {
    id: 'ausfb',
    name: 'AU Small Finance Bank',
    type: 'small_finance',
    rates: [
      { minMonths: 0, maxMonths: 1, generalRate: 3.75, seniorRate: 4.25 },
      { minMonths: 2, maxMonths: 5, generalRate: 5.50, seniorRate: 6.00 },
      { minMonths: 6, maxMonths: 11, generalRate: 6.75, seniorRate: 7.25 },
      { minMonths: 12, maxMonths: 23, generalRate: 7.50, seniorRate: 8.00 },
      { minMonths: 24, maxMonths: 35, generalRate: 7.75, seniorRate: 8.25 },
      { minMonths: 36, maxMonths: 59, generalRate: 7.50, seniorRate: 8.00 },
      { minMonths: 60, maxMonths: 120, generalRate: 7.00, seniorRate: 7.55 }
    ],
    effectiveDate: '12 May 2026',
    verifiedDate: '12 Aug 2026',
    sourceUrl: 'https://www.aubank.in/interest-rates'
  }
];

export default function FDCalculator() {
  // 1. Workspace settings & modes
  const [calcMode, setCalcMode] = useState<'forward' | 'reverse' | 'monthly_income' | 'fd_ladder' | 'compare_rates'>('forward');
  const [bankId, setBankId] = useState<string>('hdfc');
  const [isCustomRate, setIsCustomRate] = useState<boolean>(false);
  const [customRate, setCustomRate] = useState<number>(7.0);
  const [customerType, setCustomerType] = useState<CustomerType>('general');
  const [payoutFreq, setPayoutFreq] = useState<PayoutFrequency>('maturity');
  const [startDate, setStartDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // 2. Primary Inputs
  const [principal, setPrincipal] = useState<number>(500000);
  const [tenure, setTenure] = useState<number>(5);
  const [tenureUnit, setTenureUnit] = useState<TenureUnit>('years');

  // 3. Goal Planner & Reverse Solver Inputs
  const [targetAmount, setTargetAmount] = useState<number>(1000000);
  const [desiredMonthlyIncome, setDesiredMonthlyIncome] = useState<number>(20000);

  // 4. Rate Difference Comparison inputs
  const [rateDiffCompareVal, setRateDiffCompareVal] = useState<number>(6.5);

  // 5. Tax calculator inputs
  const [taxSlabPct, setTaxSlabPct] = useState<number>(30); // 30% slab rate

  // UI state
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<'all' | 'public' | 'private' | 'small_finance'>('all');

  // Retrieve current active bank configuration
  const activeBank = useMemo(() => {
    return BankFDDatabase.find(b => b.id === bankId) || BankFDDatabase[1];
  }, [bankId]);

  // Lookup interest rate based on bank database and tenure inputs
  const lookupRate = (bId: string, tenureMonths: number, type: CustomerType): number => {
    const targetBank = BankFDDatabase.find(b => b.id === bId) || BankFDDatabase[1];
    const band = targetBank.rates.find(r => tenureMonths >= r.minMonths && tenureMonths <= r.maxMonths);
    if (band) {
      return type === 'senior' ? band.seniorRate : band.generalRate;
    }
    return 7.0; // default fallback
  };

  const currentTenureMonths = useMemo(() => {
    if (tenureUnit === 'days') {
      return Math.max(1, Math.round(tenure / 30));
    }
    return tenureUnit === 'years' ? tenure * 12 : tenure;
  }, [tenure, tenureUnit]);

  // Resolve current active interest rate
  const resolvedRate = useMemo(() => {
    if (isCustomRate) return customRate;
    return lookupRate(bankId, currentTenureMonths, customerType);
  }, [isCustomRate, customRate, bankId, currentTenureMonths, customerType]);

  // --- Core FD Compounding Calculations ---
  const calculations = useMemo(() => {
    const P = principal;
    const r = resolvedRate / 100;
    const totalMonths = currentTenureMonths;
    const t = totalMonths / 12;

    // Convert tenure for compounding
    // In India, FD compounding is quarterly: n = 4
    const n = 4;

    let maturityValue = 0;
    let interest = 0;

    if (payoutFreq === 'maturity') {
      // Cumulative FD: compounding quarterly
      maturityValue = P * Math.pow(1 + r / n, n * t);
      interest = maturityValue - P;
    } else {
      // Non-Cumulative: Interest paid periodically, principal returned intact at maturity
      let periodicPayoutAmount = 0;
      if (payoutFreq === 'monthly') {
        // Monthly payout: P * r / 12
        periodicPayoutAmount = P * (resolvedRate / 100 / 12);
        interest = periodicPayoutAmount * totalMonths;
      } else if (payoutFreq === 'quarterly') {
        periodicPayoutAmount = P * (resolvedRate / 100 / 4);
        interest = periodicPayoutAmount * (totalMonths / 3);
      } else if (payoutFreq === 'half_yearly') {
        periodicPayoutAmount = P * (resolvedRate / 100 / 2);
        interest = periodicPayoutAmount * (totalMonths / 6);
      } else {
        // Annual
        periodicPayoutAmount = P * (resolvedRate / 100);
        interest = periodicPayoutAmount * (totalMonths / 12);
      }
      maturityValue = P + interest;
    }

    const simpleYield = (interest / P) * 100;

    // Calculate expected maturity date
    const start = new Date(startDate);
    start.setMonth(start.getMonth() + totalMonths);
    const maturityDateStr = start.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    // Build year-by-year projections ledger
    const yearByYear: ProjectionRow[] = [];
    const totalYears = Math.max(1, Math.ceil(totalMonths / 12));
    let opening = P;
    for (let yr = 1; yr <= totalYears; yr++) {
      let yrInterest = 0;
      if (payoutFreq === 'maturity') {
        const yrMaturity = P * Math.pow(1 + r / n, n * (yr));
        const prevMaturity = P * Math.pow(1 + r / n, n * (yr - 1));
        yrInterest = yrMaturity - prevMaturity;
      } else {
        yrInterest = P * (resolvedRate / 100);
      }
      yearByYear.push({
        period: `Year ${yr}`,
        opening: Math.round(opening),
        interest: Math.round(yrInterest),
        closing: Math.round(payoutFreq === 'maturity' ? opening + yrInterest : P)
      });
      opening = payoutFreq === 'maturity' ? opening + yrInterest : P;
    }

    // TDS Estimator checks (Section 194A: TDS at 10% if interest exceeds ₹40k or ₹50k for seniors)
    const threshold = customerType === 'senior' ? 50000 : 40000;
    const annualInterestVal = interest / t;
    const tdsDeducted = annualInterestVal > threshold ? annualInterestVal * 0.10 : 0;
    const netTaxLiability = annualInterestVal * (taxSlabPct / 100);

    return {
      interest: Math.round(interest),
      maturityValue: Math.round(payoutFreq === 'maturity' ? maturityValue : P),
      simpleYield: parseFloat(simpleYield.toFixed(2)),
      maturityDate: maturityDateStr,
      yearByYear,
      tdsDeducted: Math.round(tdsDeducted),
      netTaxLiability: Math.round(netTaxLiability),
      annualInterestVal: Math.round(annualInterestVal)
    };
  }, [principal, resolvedRate, currentTenureMonths, payoutFreq, startDate, customerType, taxSlabPct]);

  // --- REVERSE SOLVER: Solve for Target Maturity ---
  const reverseSolverResults = useMemo(() => {
    if (calcMode !== 'reverse') return null;

    const r = resolvedRate / 100;
    const totalMonths = currentTenureMonths;
    const t = totalMonths / 12;
    const n = 4;

    // P = Maturity / (1 + r/n)^(n*t)
    let requiredPrincipal = 0;
    if (payoutFreq === 'maturity') {
      requiredPrincipal = targetAmount / Math.pow(1 + r / n, n * t);
    } else {
      // In non-cumulative, maturity is principal + periodic payouts, but we assume
      // the user wants the principal returned intact. Let's solve for the principal P
      // that yields targetAmount at maturity (i.e. P + total interest = targetAmount).
      // A = P * (1 + r * t)
      requiredPrincipal = targetAmount / (1 + r * t);
    }

    const estInterest = targetAmount - requiredPrincipal;

    return {
      requiredPrincipal: Math.round(requiredPrincipal),
      estInterest: Math.round(estInterest)
    };
  }, [calcMode, targetAmount, resolvedRate, currentTenureMonths, payoutFreq]);

  // --- MONTHLY INCOME PLANNER SOLVER ---
  const monthlyIncomeResults = useMemo(() => {
    if (calcMode !== 'monthly_income') return null;

    // Monthly income = P * r / 12
    // P = Monthly income * 12 / r
    const r = resolvedRate / 100;
    const requiredPrincipal = desiredMonthlyIncome * 12 / r;
    const annualPayout = desiredMonthlyIncome * 12;

    return {
      requiredPrincipal: Math.round(requiredPrincipal),
      annualPayout: Math.round(annualPayout)
    };
  }, [calcMode, desiredMonthlyIncome, resolvedRate]);

  // --- FD LADDER PLANNER SIMULATOR ---
  const fdLadderResults = useMemo(() => {
    if (calcMode !== 'fd_ladder') return null;

    // Splits principal across 5 FDs with staggered tenures: 1, 2, 3, 4, 5 years
    const stepPrincipal = principal / 5;
    const n = 4; // quarterly compounded
    let totalMaturity = 0;
    let totalInterest = 0;

    const steps = [1, 2, 3, 4, 5].map((yr) => {
      const stepMonths = yr * 12;
      const rateVal = lookupRate(bankId, stepMonths, customerType);
      const r = rateVal / 100;
      const maturity = stepPrincipal * Math.pow(1 + r / n, n * yr);
      const interestVal = maturity - stepPrincipal;

      totalMaturity += maturity;
      totalInterest += interestVal;

      const matDate = new Date(startDate);
      matDate.setFullYear(matDate.getFullYear() + yr);

      return {
        tenureYears: yr,
        principal: Math.round(stepPrincipal),
        rate: rateVal,
        interest: Math.round(interestVal),
        maturity: Math.round(maturity),
        maturityDate: matDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      };
    });

    return {
      steps,
      totalMaturity: Math.round(totalMaturity),
      totalInterest: Math.round(totalInterest)
    };
  }, [calcMode, principal, bankId, customerType, startDate]);

  // --- COMPARATIVE BANK MATRIX ---
  const comparedBanks = useMemo(() => {
    return BankFDDatabase.map((b) => {
      const rateVal = lookupRate(b.id, currentTenureMonths, customerType);
      const P = principal;
      const t = currentTenureMonths / 12;
      const n = 4;

      let maturity = 0;
      if (payoutFreq === 'maturity') {
        maturity = P * Math.pow(1 + (rateVal / 100) / n, n * t);
      } else {
        // Non-cumulative payout
        const totalInterest = P * (rateVal / 100) * t;
        maturity = P + totalInterest;
      }

      return {
        ...b,
        rate: rateVal,
        interest: Math.round(payoutFreq === 'maturity' ? maturity - P : maturity - P),
        maturity: Math.round(payoutFreq === 'maturity' ? maturity : P)
      };
    })
    .filter(b => filterType === 'all' || b.type === filterType)
    .sort((a, b) => b.rate - a.rate);
  }, [currentTenureMonths, customerType, principal, filterType, payoutFreq]);

  // --- Rate Difference Gap Estimator ---
  const rateDifferenceMetrics = useMemo(() => {
    const P = principal;
    const totalMonths = currentTenureMonths;
    const t = totalMonths / 12;
    const n = 4;

    // Bank Maturity
    const rBank = resolvedRate / 100;
    const maturityBank = payoutFreq === 'maturity' ? P * Math.pow(1 + rBank / n, n * t) : P + (P * rBank * t);

    // Compared Maturity
    const rComp = rateDiffCompareVal / 100;
    const maturityComp = payoutFreq === 'maturity' ? P * Math.pow(1 + rComp / n, n * t) : P + (P * rComp * t);

    const diff = Math.abs(maturityBank - maturityComp);

    return {
      bankMaturity: Math.round(maturityBank),
      compMaturity: Math.round(maturityComp),
      difference: Math.round(diff)
    };
  }, [principal, currentTenureMonths, resolvedRate, rateDiffCompareVal, payoutFreq]);

  // --- Popular deposit levels comparison table ---
  const popularLevelComparisons = useMemo(() => {
    const levels = [100000, 200000, 500000, 1000000, 2000000, 5000000, 10000000];
    const totalMonths = currentTenureMonths;
    const t = totalMonths / 12;
    const n = 4;
    const r = resolvedRate / 100;

    return levels.map((lvl) => {
      let maturity = 0;
      if (payoutFreq === 'maturity') {
        maturity = lvl * Math.pow(1 + r / n, n * t);
      } else {
        maturity = lvl + (lvl * r * t);
      }
      return {
        deposit: lvl,
        interest: Math.round(payoutFreq === 'maturity' ? maturity - lvl : maturity - lvl),
        maturity: Math.round(payoutFreq === 'maturity' ? maturity : lvl)
      };
    });
  }, [currentTenureMonths, resolvedRate, payoutFreq]);

  // --- Export Actions Handlers ---
  const copyFormattedReport = () => {
    const text = `Fixed Deposit (FD) Planning Audit (Toolique)
----------------------------------------------
Selected Bank       : ${activeBank.name}
Customer Type       : ${customerType === 'senior' ? 'Senior Citizen (+0.50% benefit)' : 'General Citizen'}
Deposit Type        : ${payoutFreq === 'maturity' ? 'Cumulative (compounded quarterly)' : `Non-Cumulative (${payoutFreq} payout)`}
Tenure Period       : ${tenure} ${tenureUnit} (${currentTenureMonths} Months)
FD Interest Rate    : ${resolvedRate}% p.a.
Maturity Date       : ${calculations.maturityDate}
----------------------------------------------
Deposit principal   : ₹${principal.toLocaleString('en-IN')}
Estimated Interest  : ₹${calculations.interest.toLocaleString('en-IN')}
FINAL MATURITY VALUE: ₹${calculations.maturityValue.toLocaleString('en-IN')}
Effective yield     : ${calculations.simpleYield}%
----------------------------------------------
Potential TDS (10%) : ₹${calculations.tdsDeducted.toLocaleString('en-IN')} (if applicable)`;

    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const exportCSV = () => {
    const headers = ['Period', 'Opening Principal (₹)', 'Interest Accrued (₹)', 'Closing Balance (₹)'];
    const rows = calculations.yearByYear.map(r => [r.period, r.opening, r.interest, r.closing]);
    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `FD_Maturity_Ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Fixed Deposit Summary - Toolique</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; }
            h2 { border-bottom: 2px solid #555; padding-bottom: 10px; }
            .row { display: flex; justify-content: space-between; margin: 12px 0; font-size: 14px; }
            .total { font-weight: bold; font-size: 1.1em; border-top: 1px solid #333; padding-top: 10px; }
          </style>
        </head>
        <body>
          <h2>FD MATURITY CLEARANCE</h2>
          <div class="row"><span>Selected Bank</span><span>${activeBank.name}</span></div>
          <div class="row"><span>Deposit Principal</span><span>₹${principal.toLocaleString('en-IN')}</span></div>
          <div class="row"><span>Tenure</span><span>${tenure} ${tenureUnit}</span></div>
          <div class="row"><span>Interest rate</span><span>${resolvedRate}%</span></div>
          <div class="row total"><span>Maturity Value</span><span>₹${calculations.maturityValue.toLocaleString('en-IN')}</span></div>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(15, 23, 42); // slate-900 theme color
    doc.rect(0, 0, 210, 38, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('FIXED DEPOSIT RETIREMENT PLAN', 15, 22);
    doc.setFontSize(10);
    doc.text('Quarterly Compounding Maturity Report — Toolique.in', 15, 30);

    doc.setTextColor(60, 60, 60);
    doc.setFontSize(12);
    doc.text('FD Investment Parameters', 15, 52);

    doc.setFontSize(10);
    doc.text(`Selected Bank: ${activeBank.name}`, 15, 60);
    doc.text(`Tenure duration: ${tenure} ${tenureUnit} (${currentTenureMonths} Months)`, 15, 66);
    doc.text(`Interest rate: ${resolvedRate}% p.a.`, 15, 72);
    doc.text(`Maturity Date: ${calculations.maturityDate}`, 15, 78);

    doc.line(15, 84, 195, 84);

    doc.setFontSize(12);
    doc.text('Maturity Splits', 15, 94);

    doc.setFontSize(10);
    doc.text(`Deposit Principal: Rs. ${principal.toLocaleString('en-IN')}`, 15, 102);
    doc.text(`Estimated Interest Earned: Rs. ${calculations.interest.toLocaleString('en-IN')}`, 15, 108);
    doc.text(`Final Maturity Value: Rs. ${calculations.maturityValue.toLocaleString('en-IN')}`, 15, 114);

    doc.save(`FD_Maturity_Report_${Date.now()}.pdf`);
  };

  const getShareLink = () => {
    const params = new URLSearchParams();
    params.set('mode', calcMode);
    params.set('bank', bankId);
    params.set('deposit', principal.toString());
    params.set('tenure', tenure.toString());
    params.set('unit', tenureUnit);
    params.set('payout', payoutFreq);
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto text-left animate-fadeIn">
      
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-zinc-900 dark:text-white text-sm">Fixed Deposit Workspace</h3>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">Verify banking interest rates, maturity yields, and Indian TDS caps</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick presets */}
          <div className="flex flex-wrap gap-1">
            {[100000, 500000, 1000000].map((presetVal) => (
              <button
                key={presetVal}
                onClick={() => setPrincipal(presetVal)}
                className="text-[9px] font-black text-teal-700 dark:text-teal-400 bg-teal-500/5 hover:bg-teal-500/10 border border-teal-500/10 px-2.5 py-1 rounded"
              >
                ₹{(presetVal / 100000).toFixed(0)} Lakh
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              navigator.clipboard.writeText(getShareLink());
              setCopiedLink(true);
              setTimeout(() => setCopiedLink(false), 2000);
            }}
            className="text-[9px] font-bold text-slate-700 dark:text-slate-400 bg-slate-500/10 border border-slate-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm"
          >
            {copiedLink ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            <span>{copiedLink ? 'Link Copied' : 'Share Scenario'}</span>
          </button>
        </div>
      </div>

      {/* CORE WORKSPACE TABS */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
        <button
          onClick={() => setCalcMode('forward')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            calcMode === 'forward' ? 'bg-teal-600 text-white shadow-md' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-650 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
          }`}
        >
          Maturity Planner
        </button>
        <button
          onClick={() => setCalcMode('reverse')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            calcMode === 'reverse' ? 'bg-teal-600 text-white shadow-md' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-650 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
          }`}
        >
          Required Principal Solver
        </button>
        <button
          onClick={() => setCalcMode('monthly_income')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            calcMode === 'monthly_income' ? 'bg-teal-600 text-white shadow-md' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-650 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
          }`}
        >
          Monthly Payout Planner
        </button>
        <button
          onClick={() => setCalcMode('fd_ladder')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            calcMode === 'fd_ladder' ? 'bg-teal-600 text-white shadow-md' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-650 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
          }`}
        >
          FD Laddering Desk
        </button>
      </div>

      {/* TWO COLUMN COMPILATION LAYER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: PRIMARY INPUTS */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-5">
            <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-150 dark:border-zinc-850 pb-3">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Investment parameters</span>
            </h3>

            {/* General/Senior Citizen Toggle */}
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-zinc-650 dark:text-zinc-300">Customer Category</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setCustomerType('general')}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition ${customerType === 'general' ? 'bg-teal-600 text-white shadow-sm' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}
                >
                  General Citizen
                </button>
                <button
                  onClick={() => setCustomerType('senior')}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition ${customerType === 'senior' ? 'bg-teal-600 text-white shadow-sm' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}
                >
                  Senior Citizen (+0.50% rate)
                </button>
              </div>
            </div>

            {/* Bank Selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase block">Select Bank</label>
              <select
                value={bankId}
                onChange={(e) => setBankId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold bg-transparent text-zinc-700 dark:text-zinc-350 focus:outline-none"
              >
                {BankFDDatabase.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* Custom rate selection checkbox */}
            <div className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={isCustomRate}
                onChange={(e) => setIsCustomRate(e.target.checked)}
                className="rounded border-zinc-355 text-teal-600 focus:ring-teal-500"
              />
              <span className="font-medium text-zinc-500">I have a custom interest rate</span>
            </div>

            {/* Interest Rate inputs */}
            {isCustomRate ? (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase block">Custom Interest Rate (%)</label>
                <input
                  type="number"
                  step="0.05"
                  value={customRate}
                  onChange={(e) => setCustomRate(Math.max(1, parseFloat(e.target.value) || 0))}
                  className="w-full p-2.5 border rounded-xl font-mono text-xs focus:outline-none"
                />
              </div>
            ) : (
              <div className="p-3 bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-850 rounded-xl text-xs flex justify-between items-center">
                <span className="font-semibold text-zinc-500">Bank Interest Rate:</span>
                <span className="font-bold text-teal-600 font-mono text-sm">{resolvedRate}% p.a.</span>
              </div>
            )}

            {/* Deposit Type & Payout Options */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase block">Payout Frequency</label>
                <select
                  value={payoutFreq}
                  onChange={(e) => setPayoutFreq(e.target.value as PayoutFrequency)}
                  className="w-full p-2 rounded border border-zinc-200 dark:border-zinc-800 bg-transparent text-xs font-bold focus:outline-none"
                >
                  <option value="maturity">At Maturity (Cumulative)</option>
                  <option value="monthly">Monthly Payout</option>
                  <option value="quarterly">Quarterly Payout</option>
                  <option value="half_yearly">Half-Yearly</option>
                  <option value="annual">Annual Payout</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase block">Compounding</label>
                <div className="p-2 border rounded text-xs font-bold text-zinc-500 bg-transparent select-none">
                  {payoutFreq === 'maturity' ? 'Quarterly' : 'Simple Interest'}
                </div>
              </div>
            </div>

            {/* Principal deposit inputs */}
            {calcMode !== 'reverse' && calcMode !== 'monthly_income' && (
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-zinc-450 uppercase">
                  <span>FD Principal Deposit (₹)</span>
                  <span className="font-mono text-teal-600 font-black">₹{principal.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="10000000"
                  step="5000"
                  value={principal}
                  onChange={(e) => setPrincipal(parseInt(e.target.value))}
                  className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
              </div>
            )}

            {/* Reverse solver target amounts */}
            {calcMode === 'reverse' && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase block">Target maturity amount (₹)</label>
                <input
                  type="number"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(Math.max(1000, parseInt(e.target.value) || 0))}
                  className="w-full p-2.5 border rounded-xl font-mono text-xs focus:outline-none"
                />
              </div>
            )}

            {/* Monthly Income Solver inputs */}
            {calcMode === 'monthly_income' && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase block">Desired Monthly Payout (₹)</label>
                <input
                  type="number"
                  value={desiredMonthlyIncome}
                  onChange={(e) => setDesiredMonthlyIncome(Math.max(100, parseInt(e.target.value) || 0))}
                  className="w-full p-2.5 border rounded-xl font-mono text-xs focus:outline-none"
                />
              </div>
            )}

            {/* Tenure inputs */}
            {calcMode !== 'fd_ladder' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-455 block uppercase">Tenure Duration</label>
                  <input
                    type="number"
                    value={tenure}
                    onChange={(e) => setTenure(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full px-2.5 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded text-xs font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-455 block uppercase">Unit</label>
                  <select
                    value={tenureUnit}
                    onChange={(e) => setTenureUnit(e.target.value as TenureUnit)}
                    className="w-full px-2.5 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded text-xs font-bold bg-transparent text-zinc-700 focus:outline-none"
                  >
                    <option value="years">Years</option>
                    <option value="months">Months</option>
                    <option value="days">Days</option>
                  </select>
                </div>
              </div>
            )}

            {/* Start Date selection */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase block">Deposit Booking Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2.5 border rounded-xl font-mono text-xs focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CORE SUMMARY VISUALIZATIONS */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl bg-zinc-950 text-white shadow-xl space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-850 pb-4">
              <div>
                <span className="text-[9px] font-black uppercase text-zinc-450 tracking-wider block">Estimated maturity payout value</span>
                <h3 className="text-sm font-black text-teal-400 mt-0.5">Fixed deposit returns</h3>
              </div>
              <button
                onClick={copyFormattedReport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-350 hover:bg-zinc-855 hover:text-white transition"
              >
                {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedReport ? 'Copied' : 'Copy Breakup'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[9px] font-bold text-teal-300 uppercase block tracking-wider">Maturity Payout</span>
                <div className="text-2xl md:text-3xl font-black text-white mt-1 font-mono tracking-tight">
                  ₹{calculations.maturityValue.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-zinc-400 font-extrabold uppercase block">Maturity Date</span>
                <div className="text-lg font-bold font-mono text-zinc-300 mt-1">{calculations.maturityDate}</div>
              </div>
            </div>

            {/* Calculations splits grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left pt-2 border-t border-zinc-850">
              <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-850/40">
                <span className="text-[8px] text-zinc-400 font-extrabold uppercase block">Invested Principal</span>
                <span className="text-xs font-black font-mono text-white mt-1 block">₹{principal.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-850/40">
                <span className="text-[8px] text-zinc-400 font-extrabold uppercase block">Interest Yielded</span>
                <span className="text-xs font-black font-mono text-teal-400 mt-1 block">+₹{calculations.interest.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-850/40">
                <span className="text-[8px] text-zinc-400 font-extrabold uppercase block">Nominal Rate</span>
                <span className="text-xs font-black font-mono text-white mt-1 block">{resolvedRate}%</span>
              </div>
              <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-850/40">
                <span className="text-[8px] text-zinc-400 font-extrabold uppercase block">Compounding</span>
                <span className="text-xs font-black font-mono text-indigo-400 mt-1 block">{payoutFreq === 'maturity' ? 'Quarterly' : 'Simple'}</span>
              </div>
            </div>

            {/* TDS Tax alerts warning */}
            <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-850/40 text-xs text-zinc-400 space-y-2">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-1.5 mb-1.5">
                <div className="font-bold text-white uppercase tracking-wider text-[9px]">Tax & TDS Estimation (FY 2026-27)</div>
                <select
                  value={taxSlabPct}
                  onChange={(e) => setTaxSlabPct(parseInt(e.target.value))}
                  className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-300 font-bold border border-zinc-700 outline-none"
                >
                  <option value="5">5% Slab</option>
                  <option value="10">10% Slab</option>
                  <option value="15">15% Slab</option>
                  <option value="20">20% Slab</option>
                  <option value="30">30% Slab</option>
                </select>
              </div>
              <div className="flex justify-between">
                <span>Annual interest accrual rate:</span>
                <span className="font-mono text-zinc-300 font-bold">₹{calculations.annualInterestVal.toLocaleString('en-IN')}/yr</span>
              </div>
              <div className="flex justify-between">
                <span>Potential TDS (10% standard rate):</span>
                <span className="font-mono text-rose-450 font-bold">₹{calculations.tdsDeducted.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated slab tax liability ({taxSlabPct}%):</span>
                <span className="font-mono text-zinc-300 font-bold">₹{calculations.netTaxLiability.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Reverse Solver principal output */}
          {calcMode === 'reverse' && reverseSolverResults && (
            <div className="p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60 shadow-sm space-y-3">
              <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block">Solved FD principal for desired goal</h4>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-white dark:bg-zinc-950/40 border rounded-xl">
                  <span className="text-[8px] text-zinc-400 uppercase font-black block">Required Principal</span>
                  <span className="text-xs font-bold font-mono mt-1 block text-teal-600">₹{reverseSolverResults.requiredPrincipal.toLocaleString('en-IN')}</span>
                </div>
                <div className="p-3 bg-white dark:bg-zinc-950/40 border rounded-xl">
                  <span className="text-[8px] text-zinc-400 uppercase font-black block">Interest Earned</span>
                  <span className="text-xs font-bold font-mono mt-1 block">₹{reverseSolverResults.estInterest.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Monthly Income Solver output */}
          {calcMode === 'monthly_income' && monthlyIncomeResults && (
            <div className="p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60 shadow-sm space-y-3">
              <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block">Solved FD parameters for desired Payout</h4>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-white dark:bg-zinc-950/40 border rounded-xl">
                  <span className="text-[8px] text-zinc-400 uppercase font-black block">Required Principal Deposit</span>
                  <span className="text-xs font-bold font-mono mt-1 block text-teal-600">₹{monthlyIncomeResults.requiredPrincipal.toLocaleString('en-IN')}</span>
                </div>
                <div className="p-3 bg-white dark:bg-zinc-950/40 border rounded-xl">
                  <span className="text-[8px] text-zinc-400 uppercase font-black block">Annual Total Payout</span>
                  <span className="text-xs font-bold font-mono mt-1 block">₹{monthlyIncomeResults.annualPayout.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* INDIAN BANK FD COMPARISON INDEX */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-150 dark:border-zinc-850 pb-3">
          <div>
            <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block">Compare Fixed Deposit Rates</h3>
            <p className="text-[10px] text-zinc-450 mt-0.5">Calculated dynamically for your selected deposit amount and tenure</p>
          </div>
          <div className="flex bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <button onClick={() => setFilterType('all')} className={`px-2 py-1 text-[9px] font-bold rounded-md transition ${filterType === 'all' ? 'bg-teal-600 text-white' : 'text-zinc-500'}`}>All Banks</button>
            <button onClick={() => setFilterType('public')} className={`px-2 py-1 text-[9px] font-bold rounded-md transition ${filterType === 'public' ? 'bg-teal-600 text-white' : 'text-zinc-500'}`}>Public</button>
            <button onClick={() => setFilterType('private')} className={`px-2 py-1 text-[9px] font-bold rounded-md transition ${filterType === 'private' ? 'bg-teal-600 text-white' : 'text-zinc-500'}`}>Private</button>
            <button onClick={() => setFilterType('small_finance')} className={`px-2 py-1 text-[9px] font-bold rounded-md transition ${filterType === 'small_finance' ? 'bg-teal-600 text-white' : 'text-zinc-500'}`}>SFB</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold">
                <th className="py-2.5 pl-2">Bank Name</th>
                <th className="py-2.5 text-right">Applicable Rate (%)</th>
                <th className="py-2.5 text-right">Total Principal (₹)</th>
                <th className="py-2.5 text-right">Est. Interest (₹)</th>
                <th className="py-2.5 text-right">Maturity Value (₹)</th>
                <th className="py-2.5 text-right pr-2">Official Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-semibold font-mono text-zinc-700 dark:text-zinc-350">
              {comparedBanks.map((b) => (
                <tr key={b.id} className={`hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 ${b.id === bankId ? 'bg-teal-500/5' : ''}`}>
                  <td className="py-2.5 pl-2 text-zinc-800 dark:text-zinc-200 font-sans font-bold flex items-center gap-1.5">
                    {b.id === bankId && <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block"></span>}
                    <span>{b.name}</span>
                  </td>
                  <td className="py-2.5 text-right text-teal-600">{b.rate}%</td>
                  <td className="py-2.5 text-right">₹{principal.toLocaleString('en-IN')}</td>
                  <td className="py-2.5 text-right">₹{b.interest.toLocaleString('en-IN')}</td>
                  <td className="py-2.5 text-right font-bold text-zinc-800 dark:text-white">₹{b.maturity.toLocaleString('en-IN')}</td>
                  <td className="py-2.5 text-right pr-2 font-sans text-[10px]">
                    <a href={b.sourceUrl} target="_blank" rel="noreferrer" className="text-teal-600 hover:underline">Official Rates</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* LADDERING PLATFORM */}
      {calcMode === 'fd_ladder' && fdLadderResults && (
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block border-b border-zinc-150 dark:border-zinc-850 pb-2">FD Laddering Dashboard</h3>
          <p className="text-xs text-zinc-500">Splitting principal amount <strong>₹{principal.toLocaleString('en-IN')}</strong> across 5 FDs of staggered tenures to optimize returns and liquidity.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {fdLadderResults.steps.map((row) => (
              <div key={row.tenureYears} className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-850 space-y-3 bg-zinc-50/50 dark:bg-zinc-950/20 font-mono text-center">
                <div className="text-[10px] font-black uppercase text-zinc-400 block">{row.tenureYears} Year FD</div>
                <div className="text-xs font-bold text-teal-600 mt-1 block">Rate: {row.rate}%</div>
                <div className="text-[9px] text-zinc-550 block mt-0.5">Principal: ₹{row.principal.toLocaleString('en-IN')}</div>
                <div className="text-[9px] text-zinc-550 block">Interest: ₹{row.interest.toLocaleString('en-IN')}</div>
                <div className="text-[9px] text-zinc-550 block">Matures: {row.maturityDate}</div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-zinc-900 text-white rounded-2xl grid grid-cols-2 gap-4 text-center font-mono">
            <div>
              <span className="text-[8px] text-zinc-450 uppercase block">Total Ladder Maturity</span>
              <span className="text-sm font-black text-teal-400 block mt-1">₹{fdLadderResults.totalMaturity.toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-[8px] text-zinc-450 uppercase block">Total Ladder Interest</span>
              <span className="text-sm font-black text-white block mt-1">₹{fdLadderResults.totalInterest.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      )}

      {/* RATE DIFFERENCE GAP COMPARATIVE MODULE */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block border-b border-zinc-150 dark:border-zinc-850 pb-2">Rate Difference Yield Gap</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase block">Compare with Interest Rate (%)</label>
            <input
              type="number"
              step="0.05"
              value={rateDiffCompareVal}
              onChange={(e) => setRateDiffCompareVal(Math.max(1, parseFloat(e.target.value) || 0))}
              className="w-full p-2.5 border rounded-xl font-mono text-xs focus:outline-none"
            />
          </div>

          <div className="md:col-span-2 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-150 dark:border-zinc-850 grid grid-cols-3 gap-4 text-xs font-mono">
            <div>
              <span className="text-[8px] text-zinc-400 uppercase font-black block">Your Selected FD</span>
              <span className="text-xs font-bold mt-1 block">₹{rateDifferenceMetrics.bankMaturity.toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-[8px] text-zinc-400 uppercase font-black block">Compared Rate Yield</span>
              <span className="text-xs font-bold mt-1 block">₹{rateDifferenceMetrics.compMaturity.toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-[8px] text-zinc-400 uppercase font-black block">Net Yield Difference</span>
              <span className="text-xs font-bold text-teal-600 mt-1 block">₹{rateDifferenceMetrics.difference.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* POPULAR MONTHLY FD DEPOSIT COMPARISON */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block border-b border-zinc-150 dark:border-zinc-850 pb-2">Maturity Returns at Popular Principal Levels</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold">
                <th className="py-2 pl-2">FD Principal Amount (₹)</th>
                <th className="py-2 text-right">Estimated Interest (₹)</th>
                <th className="py-2 text-right pr-2">Projected Maturity (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-semibold font-mono text-zinc-700 dark:text-zinc-350">
              {popularLevelComparisons.map((row) => (
                <tr key={row.deposit} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                  <td className="py-2.5 pl-2 font-sans font-bold">₹{row.deposit.toLocaleString('en-IN')}</td>
                  <td className="py-2.5 text-right">₹{row.interest.toLocaleString('en-IN')}</td>
                  <td className="py-2.5 text-right pr-2 text-slate-800 dark:text-white font-bold">₹{row.maturity.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ACCUMULATION LEDGER */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block border-b border-zinc-150 dark:border-zinc-850 pb-2">Yearly Growth Projections</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {calculations.yearByYear.map((row, idx) => (
            <div key={idx} className="p-3 bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-150 dark:border-zinc-850 rounded-xl text-center font-mono">
              <span className="text-[8px] text-zinc-400 uppercase font-black block">{row.period} closing</span>
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 mt-1 block">₹{row.closing.toLocaleString('en-IN')}</span>
              <span className="text-[9px] text-teal-600 block mt-0.5">+₹{row.interest.toLocaleString('en-IN')} int</span>
            </div>
          ))}
        </div>
      </div>

      {/* EXPORTS DOCK ACTIONS */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block border-b border-zinc-150 dark:border-zinc-850 pb-2">Export Maturity Audit</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={copyFormattedReport}
            className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedReport ? 'Report Copied' : 'Copy Maturity Breakup'}</span>
          </button>
          <button
            onClick={exportCSV}
            className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Download CSV Ledger</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF Report</span>
          </button>
        </div>
      </div>

      {/* Disclaimers & Bylaws notice */}
      <div className="p-5 rounded-3xl bg-zinc-50/40 dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-800/80 space-y-4">
        <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-250 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-150 dark:border-zinc-850 pb-2">
          <Info className="w-4 h-4 text-teal-605" />
          <span>Statutory FD Calculation Disclaimers</span>
        </h4>
        <p className="text-xs leading-relaxed text-zinc-550 dark:text-zinc-400">
          ⚠️ <strong>Disclaimers & Conditions:</strong> Fixed Deposit domestic interest rates, premature closure penalties (usually 0.50% - 1% rate deduction), and loan eligibility are determined independently by respective Indian banks and are subject to change. Calculations are illustrative estimates based on RBI compounding guidelines. Users are advised to confirm final rates with their bank before booking accounts.
        </p>
      </div>
    </div>
  );
}

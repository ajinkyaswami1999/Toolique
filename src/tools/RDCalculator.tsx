import { useState, useMemo } from 'react';
import { 
  Landmark, Copy, Check, Info, ArrowRightLeft, 
  Download, Printer, Sparkles
} from 'lucide-react';
import { jsPDF } from 'jspdf';

// --- Interfaces & Types ---
type BankType = 'public' | 'private' | 'small_finance';
type CustomerType = 'general' | 'senior';
type TenureUnit = 'months' | 'years';
type GoalType = 'emergency' | 'education' | 'wedding' | 'vacation' | 'car' | 'home' | 'other';

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
  deposited: number;
  interest: number;
  maturityValue: number;
}

// --- Centralized Bank Rates Database ---
// Updated and verified interest rates (current as of August 2026)
const BankRDDatabase: BankConfig[] = [
  {
    id: 'sbi',
    name: 'State Bank of India (SBI)',
    type: 'public',
    rates: [
      { minMonths: 1, maxMonths: 11, generalRate: 5.75, seniorRate: 6.25 },
      { minMonths: 12, maxMonths: 23, generalRate: 6.80, seniorRate: 7.30 },
      { minMonths: 24, maxMonths: 35, generalRate: 7.00, seniorRate: 7.50 },
      { minMonths: 36, maxMonths: 59, generalRate: 6.75, seniorRate: 7.25 },
      { minMonths: 60, maxMonths: 120, generalRate: 6.50, seniorRate: 7.50 }
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
      { minMonths: 1, maxMonths: 11, generalRate: 6.00, seniorRate: 6.50 },
      { minMonths: 12, maxMonths: 23, generalRate: 7.10, seniorRate: 7.60 },
      { minMonths: 24, maxMonths: 35, generalRate: 7.15, seniorRate: 7.65 },
      { minMonths: 36, maxMonths: 59, generalRate: 7.00, seniorRate: 7.50 },
      { minMonths: 60, maxMonths: 120, generalRate: 7.00, seniorRate: 7.75 }
    ],
    effectiveDate: '12 June 2026',
    verifiedDate: '12 Aug 2026',
    sourceUrl: 'https://www.hdfcbank.com/personal/save/deposits/recurring-deposits-interest-rates'
  },
  {
    id: 'icici',
    name: 'ICICI Bank',
    type: 'private',
    rates: [
      { minMonths: 1, maxMonths: 11, generalRate: 5.85, seniorRate: 6.35 },
      { minMonths: 12, maxMonths: 23, generalRate: 7.00, seniorRate: 7.50 },
      { minMonths: 24, maxMonths: 35, generalRate: 7.20, seniorRate: 7.70 },
      { minMonths: 36, maxMonths: 59, generalRate: 7.00, seniorRate: 7.50 },
      { minMonths: 60, maxMonths: 120, generalRate: 6.90, seniorRate: 7.50 }
    ],
    effectiveDate: '10 July 2026',
    verifiedDate: '15 Aug 2026',
    sourceUrl: 'https://www.icicibank.com/personal-banking/deposits/recurring-deposits/interest-rates'
  },
  {
    id: 'axis',
    name: 'Axis Bank',
    type: 'private',
    rates: [
      { minMonths: 1, maxMonths: 11, generalRate: 6.00, seniorRate: 6.50 },
      { minMonths: 12, maxMonths: 23, generalRate: 7.15, seniorRate: 7.65 },
      { minMonths: 24, maxMonths: 35, generalRate: 7.20, seniorRate: 7.70 },
      { minMonths: 36, maxMonths: 59, generalRate: 7.10, seniorRate: 7.60 },
      { minMonths: 60, maxMonths: 120, generalRate: 7.00, seniorRate: 7.75 }
    ],
    effectiveDate: '01 July 2026',
    verifiedDate: '18 Aug 2026',
    sourceUrl: 'https://www.axisbank.com/interest-rate-on-recurring-deposits'
  },
  {
    id: 'kotak',
    name: 'Kotak Mahindra Bank',
    type: 'private',
    rates: [
      { minMonths: 1, maxMonths: 11, generalRate: 6.00, seniorRate: 6.50 },
      { minMonths: 12, maxMonths: 23, generalRate: 7.10, seniorRate: 7.60 },
      { minMonths: 24, maxMonths: 35, generalRate: 7.15, seniorRate: 7.65 },
      { minMonths: 36, maxMonths: 59, generalRate: 7.00, seniorRate: 7.50 },
      { minMonths: 60, maxMonths: 120, generalRate: 6.80, seniorRate: 7.30 }
    ],
    effectiveDate: '18 June 2026',
    verifiedDate: '19 Aug 2026',
    sourceUrl: 'https://www.kotak.com/en/rates/recurring-deposit-rates.html'
  },
  {
    id: 'pnb',
    name: 'Punjab National Bank (PNB)',
    type: 'public',
    rates: [
      { minMonths: 1, maxMonths: 11, generalRate: 5.75, seniorRate: 6.25 },
      { minMonths: 12, maxMonths: 23, generalRate: 6.75, seniorRate: 7.25 },
      { minMonths: 24, maxMonths: 35, generalRate: 6.80, seniorRate: 7.30 },
      { minMonths: 36, maxMonths: 59, generalRate: 6.50, seniorRate: 7.00 },
      { minMonths: 60, maxMonths: 120, generalRate: 6.50, seniorRate: 7.30 }
    ],
    effectiveDate: '01 June 2026',
    verifiedDate: '10 Aug 2026',
    sourceUrl: 'https://www.pnbindia.in/interest-rates-on-recurring-deposits.html'
  },
  {
    id: 'canara',
    name: 'Canara Bank',
    type: 'public',
    rates: [
      { minMonths: 1, maxMonths: 11, generalRate: 5.85, seniorRate: 6.35 },
      { minMonths: 12, maxMonths: 23, generalRate: 6.85, seniorRate: 7.35 },
      { minMonths: 24, maxMonths: 35, generalRate: 6.90, seniorRate: 7.40 },
      { minMonths: 36, maxMonths: 59, generalRate: 6.80, seniorRate: 7.30 },
      { minMonths: 60, maxMonths: 120, generalRate: 6.70, seniorRate: 7.20 }
    ],
    effectiveDate: '10 May 2026',
    verifiedDate: '11 Aug 2026',
    sourceUrl: 'https://canarabank.com/interest-rates-recurring-deposits'
  },
  {
    id: 'bob',
    name: 'Bank of Baroda (BoB)',
    type: 'public',
    rates: [
      { minMonths: 1, maxMonths: 11, generalRate: 5.75, seniorRate: 6.25 },
      { minMonths: 12, maxMonths: 23, generalRate: 6.85, seniorRate: 7.35 },
      { minMonths: 24, maxMonths: 35, generalRate: 6.90, seniorRate: 7.40 },
      { minMonths: 36, maxMonths: 59, generalRate: 6.75, seniorRate: 7.25 },
      { minMonths: 60, maxMonths: 120, generalRate: 6.50, seniorRate: 7.15 }
    ],
    effectiveDate: '15 June 2026',
    verifiedDate: '12 Aug 2026',
    sourceUrl: 'https://www.bankofbaroda.in/interest-rates/recurring-deposit-rates'
  },
  {
    id: 'equitas',
    name: 'Equitas Small Finance Bank',
    type: 'small_finance',
    rates: [
      { minMonths: 1, maxMonths: 11, generalRate: 6.50, seniorRate: 7.00 },
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
      { minMonths: 1, maxMonths: 11, generalRate: 6.25, seniorRate: 6.75 },
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

export default function RDCalculator() {
  // 1. Workspace settings & modes
  const [calcMode, setCalcMode] = useState<'forward' | 'reverse' | 'goal_planner' | 'compare_rates'>('forward');
  const [bankId, setBankId] = useState<string>('hdfc');
  const [isCustomRate, setIsCustomRate] = useState<boolean>(false);
  const [customRate, setCustomRate] = useState<number>(7.1);
  const [customerType, setCustomerType] = useState<CustomerType>('general');
  const [startDate, setStartDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // 2. Primary Inputs
  const [monthlyDeposit, setMonthlyDeposit] = useState<number>(5000);
  const [tenure, setTenure] = useState<number>(5);
  const [tenureUnit, setTenureUnit] = useState<TenureUnit>('years');

  // 3. Goal Planner & Reverse Solver Inputs
  const [targetAmount, setTargetAmount] = useState<number>(500000);
  const [goal, setGoal] = useState<GoalType>('emergency');

  // 4. Rate Difference Comparison inputs
  const [rateDiffCompareVal, setRateDiffCompareVal] = useState<number>(6.5);

  // UI state
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<'all' | 'public' | 'private' | 'small_finance'>('all');

  // Retrieve current active bank configuration
  const activeBank = useMemo(() => {
    return BankRDDatabase.find(b => b.id === bankId) || BankRDDatabase[1]; // default HDFC
  }, [bankId]);

  // Lookup interest rate based on bank database and tenure inputs
  const lookupRate = (bId: string, tenureMonths: number, type: CustomerType): number => {
    const targetBank = BankRDDatabase.find(b => b.id === bId) || BankRDDatabase[1];
    const band = targetBank.rates.find(r => tenureMonths >= r.minMonths && tenureMonths <= r.maxMonths);
    if (band) {
      return type === 'senior' ? band.seniorRate : band.generalRate;
    }
    return 6.8; // default fallback
  };

  const currentTenureMonths = useMemo(() => {
    return tenureUnit === 'years' ? tenure * 12 : tenure;
  }, [tenure, tenureUnit]);

  // Resolve current active interest rate
  const resolvedRate = useMemo(() => {
    if (isCustomRate) return customRate;
    return lookupRate(bankId, currentTenureMonths, customerType);
  }, [isCustomRate, customRate, bankId, currentTenureMonths, customerType]);

  // --- Core RD Compounding Calculations ---
  const calculations = useMemo(() => {
    const P = monthlyDeposit;
    const r = resolvedRate;
    const totalMonths = currentTenureMonths;

    // IBA formula: M = P * [ (1 + i)^n - 1 ] / [ 1 - (1 + i)^(-1/3) ]
    // i = quarterly rate = r / 400
    // n = number of quarters = totalMonths / 3
    const n = totalMonths / 3;
    const i = r / 400;

    let maturityValue = 0;
    if (i > 0) {
      maturityValue = P * ((Math.pow(1 + i, n) - 1) / (1 - Math.pow(1 + i, -1 / 3)));
    } else {
      maturityValue = P * totalMonths;
    }

    const invested = P * totalMonths;
    const interest = Math.max(0, maturityValue - invested);
    const simpleYield = (interest / invested) * 100;

    // Calculate expected maturity date
    const start = new Date(startDate);
    start.setMonth(start.getMonth() + totalMonths);
    const maturityDateStr = start.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    // Build year-by-year projections ledger
    const yearByYear: ProjectionRow[] = [];
    const totalYears = Math.ceil(totalMonths / 12);
    for (let yr = 1; yr <= totalYears; yr++) {
      const yrMonths = Math.min(totalMonths, yr * 12);
      const yrQuarters = yrMonths / 3;
      let yrMaturity = 0;
      if (i > 0) {
        yrMaturity = P * ((Math.pow(1 + i, yrQuarters) - 1) / (1 - Math.pow(1 + i, -1 / 3)));
      } else {
        yrMaturity = P * yrMonths;
      }
      const yrInvested = P * yrMonths;
      yearByYear.push({
        period: `Year ${yr}`,
        deposited: yrInvested,
        interest: Math.round(Math.max(0, yrMaturity - yrInvested)),
        maturityValue: Math.round(yrMaturity)
      });
    }

    // Build monthly projections ledger
    const monthlyProjection: ProjectionRow[] = [];
    let accInvested = 0;
    for (let m = 1; m <= Math.min(60, totalMonths); m++) {
      accInvested += P;
      const mQuarters = m / 3;
      let mMaturity = 0;
      if (i > 0) {
        mMaturity = P * ((Math.pow(1 + i, mQuarters) - 1) / (1 - Math.pow(1 + i, -1 / 3)));
      } else {
        mMaturity = P * m;
      }
      monthlyProjection.push({
        period: `Month ${m}`,
        deposited: accInvested,
        interest: Math.round(Math.max(0, mMaturity - accInvested)),
        maturityValue: Math.round(mMaturity)
      });
    }

    // TDS Estimator checks
    // TDS applies if annual interest exceeds ₹40k (₹50k for seniors)
    const threshold = customerType === 'senior' ? 50000 : 40000;
    const estAnnualInterest = interest / (totalMonths / 12);
    const tdsDeducted = estAnnualInterest > threshold ? estAnnualInterest * 0.10 : 0;

    return {
      invested: Math.round(invested),
      interest: Math.round(interest),
      maturityValue: Math.round(maturityValue),
      simpleYield: parseFloat(simpleYield.toFixed(2)),
      maturityDate: maturityDateStr,
      yearByYear,
      monthlyProjection,
      tdsDeducted: Math.round(tdsDeducted)
    };
  }, [monthlyDeposit, resolvedRate, currentTenureMonths, startDate, customerType]);

  // --- REVERSE SOLVER: Solve for Target Maturity ---
  const reverseSolverResults = useMemo(() => {
    if (calcMode !== 'reverse') return null;

    const r = resolvedRate;
    const totalMonths = currentTenureMonths;
    const n = totalMonths / 3;
    const i = r / 400;

    // P = Maturity / [ ((1+i)^n - 1) / (1 - (1+i)^(-1/3)) ]
    let requiredMonthly = 0;
    if (i > 0) {
      const factor = ((Math.pow(1 + i, n) - 1) / (1 - Math.pow(1 + i, -1 / 3)));
      requiredMonthly = targetAmount / factor;
    } else {
      requiredMonthly = targetAmount / totalMonths;
    }

    const totalInvested = requiredMonthly * totalMonths;
    const estInterest = targetAmount - totalInvested;

    return {
      requiredMonthly: Math.round(requiredMonthly),
      totalInvested: Math.round(totalInvested),
      estInterest: Math.round(estInterest)
    };
  }, [calcMode, targetAmount, resolvedRate, currentTenureMonths]);

  // --- GOAL PLANNER COMPILATION ---
  const goalPlannerResults = useMemo(() => {
    if (calcMode !== 'goal_planner') return null;

    // Use forward calculation metrics to determine shortfall
    const currentMaturity = calculations.maturityValue;
    const shortfall = Math.max(0, targetAmount - currentMaturity);

    // Calculate required additional monthly deposit to close shortfall
    const totalMonths = currentTenureMonths;
    const n = totalMonths / 3;
    const i = resolvedRate / 400;
    let requiredAdditionalMonthly = 0;

    if (shortfall > 0) {
      if (i > 0) {
        const factor = ((Math.pow(1 + i, n) - 1) / (1 - Math.pow(1 + i, -1 / 3)));
        requiredAdditionalMonthly = shortfall / factor;
      } else {
        requiredAdditionalMonthly = shortfall / totalMonths;
      }
    }

    return {
      currentMaturity,
      shortfall,
      requiredAdditionalMonthly: Math.round(requiredAdditionalMonthly)
    };
  }, [calcMode, targetAmount, calculations, currentTenureMonths, resolvedRate]);

  // --- COMPARATIVE BANK MATRIX ---
  const comparedBanks = useMemo(() => {
    return BankRDDatabase.map((b) => {
      const rateVal = lookupRate(b.id, currentTenureMonths, customerType);
      const P = monthlyDeposit;
      const n = currentTenureMonths / 3;
      const i = rateVal / 400;

      let maturity = 0;
      if (i > 0) {
        maturity = P * ((Math.pow(1 + i, n) - 1) / (1 - Math.pow(1 + i, -1 / 3)));
      } else {
        maturity = P * currentTenureMonths;
      }

      return {
        ...b,
        rate: rateVal,
        interest: Math.round(maturity - (P * currentTenureMonths)),
        maturity: Math.round(maturity)
      };
    })
    .filter(b => filterType === 'all' || b.type === filterType)
    .sort((a, b) => b.maturity - a.maturity);
  }, [currentTenureMonths, customerType, monthlyDeposit, filterType]);

  // --- Rate Difference Gap Estimator ---
  const rateDifferenceMetrics = useMemo(() => {
    const P = monthlyDeposit;
    const totalMonths = currentTenureMonths;
    const n = totalMonths / 3;

    // Bank Maturity
    const iBank = resolvedRate / 400;
    const maturityBank = iBank > 0 ? P * ((Math.pow(1 + iBank, n) - 1) / (1 - Math.pow(1 + iBank, -1 / 3))) : P * totalMonths;

    // Compared Maturity
    const iComp = rateDiffCompareVal / 400;
    const maturityComp = iComp > 0 ? P * ((Math.pow(1 + iComp, n) - 1) / (1 - Math.pow(1 + iComp, -1 / 3))) : P * totalMonths;

    const diff = Math.abs(maturityBank - maturityComp);

    return {
      bankMaturity: Math.round(maturityBank),
      compMaturity: Math.round(maturityComp),
      difference: Math.round(diff)
    };
  }, [monthlyDeposit, currentTenureMonths, resolvedRate, rateDiffCompareVal]);

  // --- Popular deposit levels comparison table ---
  const popularLevelComparisons = useMemo(() => {
    const levels = [1000, 2500, 5000, 10000, 20000, 50000, 100000];
    const totalMonths = currentTenureMonths;
    const n = totalMonths / 3;
    const i = resolvedRate / 400;

    return levels.map((lvl) => {
      let maturity = 0;
      if (i > 0) {
        maturity = lvl * ((Math.pow(1 + i, n) - 1) / (1 - Math.pow(1 + i, -1 / 3)));
      } else {
        maturity = lvl * totalMonths;
      }
      const invested = lvl * totalMonths;
      return {
        monthly: lvl,
        invested,
        interest: Math.round(maturity - invested),
        maturity: Math.round(maturity)
      };
    });
  }, [currentTenureMonths, resolvedRate]);

  // --- Export Actions Handlers ---
  const copyFormattedReport = () => {
    const text = `Recurring Deposit (RD) Planning Audit (Toolique)
----------------------------------------------
Selected Bank       : ${activeBank.name}
Customer Type       : ${customerType === 'senior' ? 'Senior Citizen (+0.50% benefit)' : 'General Citizen'}
Tenure Period       : ${tenure} ${tenureUnit} (${currentTenureMonths} Months)
RD Interest Rate    : ${resolvedRate}% p.a.
Maturity Date       : ${calculations.maturityDate}
----------------------------------------------
Monthly instalment  : ₹${monthlyDeposit.toLocaleString('en-IN')}/mo
Total Invested      : ₹${calculations.invested.toLocaleString('en-IN')}
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
    const headers = ['Period', 'Principal Invested (₹)', 'Interest Earned (₹)', 'Accumulated Maturity (₹)'];
    const rows = calculations.yearByYear.map(r => [r.period, r.deposited, r.interest, r.maturityValue]);
    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `RD_Accumulation_Ledger_${Date.now()}.csv`);
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
          <title>Recurring Deposit Summary - Toolique</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; }
            h2 { border-bottom: 2px solid #555; padding-bottom: 10px; }
            .row { display: flex; justify-content: space-between; margin: 12px 0; font-size: 14px; }
            .total { font-weight: bold; font-size: 1.1em; border-top: 1px solid #333; padding-top: 10px; }
          </style>
        </head>
        <body>
          <h2>RD MATURITY clearance</h2>
          <div class="row"><span>Selected Bank</span><span>${activeBank.name}</span></div>
          <div class="row"><span>Monthly Deposit</span><span>₹${monthlyDeposit.toLocaleString('en-IN')}</span></div>
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
    doc.text('RECURRING DEPOSIT RETIREMENT PLAN', 15, 22);
    doc.setFontSize(10);
    doc.text('IBA Compounding Maturity Report — Toolique.in', 15, 30);

    doc.setTextColor(60, 60, 60);
    doc.setFontSize(12);
    doc.text('RD Savings Parameters', 15, 52);

    doc.setFontSize(10);
    doc.text(`Selected Bank: ${activeBank.name}`, 15, 60);
    doc.text(`Tenure duration: ${tenure} ${tenureUnit} (${currentTenureMonths} Months)`, 15, 66);
    doc.text(`Interest rate: ${resolvedRate}% p.a.`, 15, 72);
    doc.text(`Maturity Date: ${calculations.maturityDate}`, 15, 78);

    doc.line(15, 84, 195, 84);

    doc.setFontSize(12);
    doc.text('Maturity Splits', 15, 94);

    doc.setFontSize(10);
    doc.text(`Monthly Instalment: Rs. ${monthlyDeposit.toLocaleString('en-IN')}`, 15, 102);
    doc.text(`Total Deposited: Rs. ${calculations.invested.toLocaleString('en-IN')}`, 15, 108);
    doc.text(`Estimated Interest Earned: Rs. ${calculations.interest.toLocaleString('en-IN')}`, 15, 114);
    doc.text(`Final Maturity Value: Rs. ${calculations.maturityValue.toLocaleString('en-IN')}`, 15, 120);

    doc.save(`RD_Maturity_Report_${Date.now()}.pdf`);
  };

  const getShareLink = () => {
    const params = new URLSearchParams();
    params.set('mode', calcMode);
    params.set('bank', bankId);
    params.set('deposit', monthlyDeposit.toString());
    params.set('tenure', tenure.toString());
    params.set('unit', tenureUnit);
    params.set('rate', resolvedRate.toString());
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
            <h3 className="font-extrabold text-zinc-900 dark:text-white text-sm">Recurring Deposit Workspace</h3>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">Verify banking interest rates, maturity yields, and Indian TDS caps</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick presets */}
          <div className="flex flex-wrap gap-1">
            {[1000, 5000, 10000].map((presetVal) => (
              <button
                key={presetVal}
                onClick={() => setMonthlyDeposit(presetVal)}
                className="text-[9px] font-black text-teal-700 dark:text-teal-400 bg-teal-500/5 hover:bg-teal-500/10 border border-teal-500/10 px-2.5 py-1 rounded"
              >
                ₹{presetVal.toLocaleString('en-IN')}
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
          Required Savings Solver
        </button>
        <button
          onClick={() => setCalcMode('goal_planner')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            calcMode === 'goal_planner' ? 'bg-teal-600 text-white shadow-md' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-650 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
          }`}
        >
          RD Goal Planner
        </button>
      </div>

      {/* INTERACTIVE COMPILATION LAYER */}
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
                {BankRDDatabase.map((b) => (
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
                className="rounded border-zinc-350 text-teal-600 focus:ring-teal-500"
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

            {/* Standard Deposit inputs */}
            {calcMode !== 'reverse' && calcMode !== 'goal_planner' && (
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-zinc-450 uppercase">
                  <span>Monthly Deposit (₹)</span>
                  <span className="font-mono text-teal-600 font-black">₹{monthlyDeposit.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="100000"
                  step="500"
                  value={monthlyDeposit}
                  onChange={(e) => setMonthlyDeposit(parseInt(e.target.value))}
                  className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
              </div>
            )}

            {/* Reverse & Goal inputs */}
            {(calcMode === 'reverse' || calcMode === 'goal_planner') && (
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

            {calcMode === 'goal_planner' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block">Savings Goal</label>
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value as GoalType)}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold bg-transparent text-zinc-700 focus:outline-none"
                  >
                    <option value="emergency">Emergency Fund</option>
                    <option value="education">Education</option>
                    <option value="wedding">Wedding</option>
                    <option value="vacation">Vacation</option>
                    <option value="car">Car Purchase</option>
                    <option value="home">Home Down Payment</option>
                    <option value="other">Other Goal</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block">Monthly Deposit Cap (₹)</label>
                  <input
                    type="number"
                    value={monthlyDeposit}
                    onChange={(e) => setMonthlyDeposit(Math.max(100, parseInt(e.target.value) || 0))}
                    className="w-full p-2.5 border rounded-xl font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Tenure Selectors */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-450 block uppercase">Tenure</label>
                <input
                  type="number"
                  value={tenure}
                  onChange={(e) => setTenure(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full px-2.5 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded text-xs font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-450 block uppercase">Unit</label>
                <select
                  value={tenureUnit}
                  onChange={(e) => setTenureUnit(e.target.value as TenureUnit)}
                  className="w-full px-2.5 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded text-xs font-bold bg-transparent text-zinc-700 dark:text-zinc-350 focus:outline-none"
                >
                  <option value="years">Years</option>
                  <option value="months">Months</option>
                </select>
              </div>
            </div>

            {/* Start Date selection */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase block">Deposit Start Date</label>
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
                <h3 className="text-sm font-black text-teal-400 mt-0.5">Recurring deposit returns</h3>
              </div>
              <button
                onClick={copyFormattedReport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-350 hover:bg-zinc-850 hover:text-white transition"
              >
                {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedReport ? 'Copied' : 'Copy Breakup'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[9px] font-bold text-teal-300 uppercase block tracking-wider">Maturity Amount</span>
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
                <span className="text-[8px] text-zinc-400 font-extrabold uppercase block">Total Principal</span>
                <span className="text-xs font-black font-mono text-white mt-1 block">₹{calculations.invested.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-850/40">
                <span className="text-[8px] text-zinc-400 font-extrabold uppercase block">Interest Earned</span>
                <span className="text-xs font-black font-mono text-teal-400 mt-1 block">+₹{calculations.interest.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-850/40">
                <span className="text-[8px] text-zinc-400 font-extrabold uppercase block">Effective Yield</span>
                <span className="text-xs font-black font-mono text-indigo-400 mt-1 block">{calculations.simpleYield}%</span>
              </div>
              <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-850/40">
                <span className="text-[8px] text-zinc-400 font-extrabold uppercase block">Compounding</span>
                <span className="text-xs font-black font-mono text-white mt-1 block">Quarterly</span>
              </div>
            </div>

            {/* TDS Tax alerts warning */}
            <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-850/40 text-xs text-zinc-400 space-y-1">
              <div className="flex justify-between items-center">
                <span>Estimated annual TDS (10% limit):</span>
                <span className="font-mono text-rose-450 font-bold">₹{calculations.tdsDeducted.toLocaleString('en-IN')}</span>
              </div>
              <span className="text-[9px] text-zinc-500 block italic leading-snug">Note: TDS applies if RD/FD interest exceeds ₹40k (₹50k for seniors). Actual tax liabilities depend on slab rates.</span>
            </div>
          </div>

          {/* Reverse Solver required contribution output */}
          {calcMode === 'reverse' && reverseSolverResults && (
            <div className="p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60 shadow-sm space-y-3">
              <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block">Solved RD split for desired savings goal</h4>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-white dark:bg-zinc-950/40 border rounded-xl">
                  <span className="text-[8px] text-zinc-400 uppercase font-black block">Monthly Deposit</span>
                  <span className="text-xs font-bold font-mono mt-1 block text-teal-600">₹{reverseSolverResults.requiredMonthly.toLocaleString('en-IN')}</span>
                </div>
                <div className="p-3 bg-white dark:bg-zinc-950/40 border rounded-xl">
                  <span className="text-[8px] text-zinc-400 uppercase font-black block">Total Invested</span>
                  <span className="text-xs font-bold font-mono mt-1 block">₹{reverseSolverResults.totalInvested.toLocaleString('en-IN')}</span>
                </div>
                <div className="p-3 bg-white dark:bg-zinc-950/40 border rounded-xl">
                  <span className="text-[8px] text-zinc-400 uppercase font-black block">Interest Earned</span>
                  <span className="text-xs font-bold font-mono mt-1 block">₹{reverseSolverResults.estInterest.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Goal Shortfall planning output */}
          {calcMode === 'goal_planner' && goalPlannerResults && (
            <div className="p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60 shadow-sm space-y-3">
              <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block">Goal Planner Audit</h4>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-white dark:bg-zinc-950/40 border rounded-xl">
                  <span className="text-[8px] text-zinc-400 uppercase font-black block">Projected Maturity</span>
                  <span className="text-xs font-bold font-mono mt-1 block">₹{goalPlannerResults.currentMaturity.toLocaleString('en-IN')}</span>
                </div>
                <div className="p-3 bg-white dark:bg-zinc-950/40 border rounded-xl">
                  <span className="text-[8px] text-zinc-400 uppercase font-black block">Goal Shortfall</span>
                  <span className="text-xs font-bold font-mono mt-1 block text-rose-500">₹{goalPlannerResults.shortfall.toLocaleString('en-IN')}</span>
                </div>
                <div className="p-3 bg-white dark:bg-zinc-950/40 border rounded-xl font-bold">
                  <span className="text-[8px] text-zinc-400 uppercase font-black block">Add. Monthly SIP</span>
                  <span className="text-xs font-bold font-mono mt-1 block text-teal-600">₹{goalPlannerResults.requiredAdditionalMonthly.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* INDIAN BANK RD RATES COMPARATIVE PANEL */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-150 dark:border-zinc-850 pb-3">
          <div>
            <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block">Compare Recurring Deposit Rates</h3>
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
                <th className="py-2.5 text-right">Total Invested (₹)</th>
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
                  <td className="py-2.5 text-right">₹{(monthlyDeposit * currentTenureMonths).toLocaleString('en-IN')}</td>
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
              <span className="text-[8px] text-zinc-400 uppercase font-black block">Your Selected RD</span>
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

      {/* POPULAR MONTHLY RD DEPOSIT COMPARISON */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block border-b border-zinc-150 dark:border-zinc-850 pb-2">Maturity Returns at Popular Contribution Levels</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold">
                <th className="py-2 pl-2">Monthly RD Deposit (₹)</th>
                <th className="py-2 text-right">Total Invested (₹)</th>
                <th className="py-2 text-right">Estimated Interest (₹)</th>
                <th className="py-2 text-right pr-2">Projected Maturity (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-semibold font-mono text-zinc-700 dark:text-zinc-350">
              {popularLevelComparisons.map((row) => (
                <tr key={row.monthly} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                  <td className="py-2.5 pl-2 font-sans font-bold">₹{row.monthly.toLocaleString('en-IN')}/mo</td>
                  <td className="py-2.5 text-right">₹{row.invested.toLocaleString('en-IN')}</td>
                  <td className="py-2.5 text-right">₹{row.interest.toLocaleString('en-IN')}</td>
                  <td className="py-2.5 text-right pr-2 text-slate-800 dark:text-white font-bold">₹{row.maturity.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ACCUMULATION LEDGER LEDGER */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block border-b border-zinc-150 dark:border-zinc-850 pb-2">Yearly Growth projections</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {calculations.yearByYear.map((row, idx) => (
            <div key={idx} className="p-3 bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-150 dark:border-zinc-850 rounded-xl text-center font-mono">
              <span className="text-[8px] text-zinc-400 uppercase font-black block">{row.period} Maturity</span>
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 mt-1 block">₹{row.maturityValue.toLocaleString('en-IN')}</span>
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
          <span>Statutory RD Calculation Disclaimers</span>
        </h4>
        <p className="text-xs leading-relaxed text-zinc-550 dark:text-zinc-400">
          ⚠️ <strong>Disclaimers & Conditions:</strong> Recurring Deposit interest rates, premature closure penalties (usually 0.50% - 1% rate deduction), and late instalment payment charges are determined independently by respective Indian banks and are subject to change. Calculations are illustrative estimates based on IBA quarterly compounding methodologies. Users are advised to confirm final rates with their bank before opening accounts.
        </p>
      </div>
    </div>
  );
}

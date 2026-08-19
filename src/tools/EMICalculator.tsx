import { useState, useEffect, useMemo } from 'react';
import { CreditCard, Copy, Check, Info, FileText, Download, Printer, ArrowRightLeft, Sparkles, ChevronDown, Plus } from 'lucide-react';
import { jsPDF } from 'jspdf';

// --- Interfaces ---
type LoanType = 'home' | 'car' | 'personal' | 'education' | 'custom';
type PrepaymentStrategy = 'reduce_tenure' | 'reduce_emi';
type ReverseMode = 'loan_from_emi' | 'tenure_from_emi' | 'emi_from_loan' | 'emi_from_tenure';

interface PrepaymentItem {
  id: string;
  month: number;
  amount: number;
}

export default function EMICalculator() {
  // 1. Core Calculator State
  const [loanType, setLoanType] = useState<LoanType>('home');
  const [loanAmount, setLoanAmount] = useState<number>(3000000); // Default ₹30 Lakh
  const [interestRate, setInterestRate] = useState<number>(8.5); // Default 8.5%
  const [tenure, setTenure] = useState<number>(20); // Default 20 Years
  const [tenureType, setTenureType] = useState<'years' | 'months'>('years');

  // Advanced Options
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [processingFeePercent, setProcessingFeePercent] = useState<number>(1);
  const [processingFeeFlat, setProcessingFeeFlat] = useState<number>(0);
  const [otherCharges, setOtherCharges] = useState<number>(0);
  const [insurance, setInsurance] = useState<number>(0);
  const [applyGstOnFees, setApplyGstOnFees] = useState<boolean>(true); // 18% GST

  // 2. Prepayment / Part-Payment State
  const [enablePrepayment, setEnablePrepayment] = useState<boolean>(false);
  const [prepayAmount, setPrepayAmount] = useState<string>('50000');
  const [prepayMonth, setPrepayMonth] = useState<string>('12');
  const [prepaymentsList, setPrepaymentsList] = useState<PrepaymentItem[]>([]);
  const [prepayStrategy, setPrepayStrategy] = useState<PrepaymentStrategy>('reduce_tenure');

  // 3. EMI Incrementor simulator
  const [enableTopUp, setEnableTopUp] = useState<boolean>(false);
  const [topUpAmount, setTopUpAmount] = useState<string>('5000');

  // 4. Reverse Loan Planner State
  const [reverseMode, setReverseMode] = useState<ReverseMode>('loan_from_emi');
  const [revAffordableEmi, setRevAffordableEmi] = useState<string>('30000');
  const [revRate, setRevRate] = useState<string>('8.5');
  const [revTenure, setRevTenure] = useState<string>('20');
  const [revLoanAmount, setRevLoanAmount] = useState<string>('5000000');

  // 5. Loan Affordability State
  const [affNetIncome, setAffNetIncome] = useState<string>('100000');
  const [affExistingEmi, setAffExistingEmi] = useState<string>('15000');
  const [affRate, setAffRate] = useState<string>('8.5');
  const [affTenure, setAffTenure] = useState<string>('20');

  // 6. Loan Comparison State
  const [compPrincipal, setCompPrincipal] = useState<string>('5000000');
  const [compRateA, setCompRateA] = useState<string>('8.5');
  const [compTenureA, setCompTenureA] = useState<string>('20');
  const [compRateB, setCompRateB] = useState<string>('9.0');
  const [compTenureB, setCompTenureB] = useState<string>('20');
  const [compRateC, setCompRateC] = useState<string>('8.5');
  const [compTenureC, setCompTenureC] = useState<string>('15');

  // 7. Interactive Amortization Table pagination/filters
  const [amortViewMode, setAmortViewMode] = useState<'monthly' | 'yearly'>('yearly');
  const [amortPage, setAmortPage] = useState<number>(0);
  const [amortSearch, setAmortSearch] = useState<string>('');
  
  // URL Share & Utility states
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [timelineHoverIndex, setTimelineHoverIndex] = useState<number | null>(null);

  // Setup presets on loan type toggle
  useEffect(() => {
    if (loanType === 'home') {
      setLoanAmount(3000000);
      setInterestRate(8.5);
      setTenure(20);
      setTenureType('years');
    } else if (loanType === 'car') {
      setLoanAmount(700000);
      setInterestRate(9.5);
      setTenure(5);
      setTenureType('years');
    } else if (loanType === 'personal') {
      setLoanAmount(500000);
      setInterestRate(12);
      setTenure(3);
      setTenureType('years');
    } else if (loanType === 'education') {
      setLoanAmount(1000000);
      setInterestRate(10);
      setTenure(7);
      setTenureType('years');
    }
  }, [loanType]);

  // Read query params on mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const amt = params.get('amount');
      const rate = params.get('rate');
      const yrs = params.get('tenure');
      if (amt) setLoanAmount(parseInt(amt, 10) || 3000000);
      if (rate) setInterestRate(parseFloat(rate) || 8.5);
      if (yrs) setTenure(parseInt(yrs, 10) || 20);
    } catch (e) {}
  }, []);

  // --- Calculations Engine ---
  const calculations = useMemo(() => {
    const P = loanAmount;
    const annualR = interestRate;
    const r = annualR / 12 / 100;
    const totalMonths = tenureType === 'years' ? tenure * 12 : tenure;

    // 1. Standard EMI Math
    let standardEmi = 0;
    if (r > 0) {
      standardEmi = (P * r * Math.pow(1 + r, totalMonths)) / (Math.pow(1 + r, totalMonths) - 1);
    } else {
      standardEmi = P / totalMonths;
    }

    // 2. Additional Fee Calculations
    const resolvedProcessingFee = (P * (processingFeePercent / 100)) + processingFeeFlat;
    const taxableFees = resolvedProcessingFee + otherCharges;
    const gstOnCharges = applyGstOnFees ? (taxableFees * 0.18) : 0;
    const totalAdditionalCharges = resolvedProcessingFee + otherCharges + insurance + gstOnCharges;

    // 3. Part-payment Map
    const prepaymentMap: Record<number, number> = {};
    prepaymentsList.forEach(p => {
      prepaymentMap[p.month] = (prepaymentMap[p.month] || 0) + p.amount;
    });

    // 4. Monthly Amortization Scheduler (Standard vs Prepayment vs Top Up)
    let balanceStandard = P;
    let balancePrepay = P;
    let totalInterestStandard = 0;
    let totalInterestPrepay = 0;
    let prepayActiveMonths = 0;

    const monthlyAmortStandard: {
      month: number;
      emi: number;
      principal: number;
      interest: number;
      opening: number;
      closing: number;
    }[] = [];

    const monthlyAmortPrepay: {
      month: number;
      emi: number;
      principal: number;
      interest: number;
      opening: number;
      closing: number;
      prepayment: number;
    }[] = [];

    let currentPrepayEmi = standardEmi;
    const regularTopUpVal = enableTopUp ? (parseFloat(topUpAmount) || 0) : 0;

    for (let m = 1; m <= totalMonths; m++) {
      // Standard progression
      const intStd = balanceStandard * r;
      const prinStd = Math.min(balanceStandard, standardEmi - intStd);
      const openingStd = balanceStandard;
      balanceStandard -= prinStd;
      totalInterestStandard += intStd;

      monthlyAmortStandard.push({
        month: m,
        emi: Math.round(prinStd + intStd),
        principal: Number(prinStd.toFixed(2)),
        interest: Number(intStd.toFixed(2)),
        opening: Number(openingStd.toFixed(2)),
        closing: Number(Math.max(0, balanceStandard).toFixed(2))
      });

      // Prepayment + topup progression
      if (balancePrepay > 0) {
        const intPre = balancePrepay * r;
        
        // Dynamic Strategy recalculations
        if (prepayStrategy === 'reduce_emi' && m > 1) {
          const prevMonthPrepay = prepaymentMap[m - 1] || 0;
          if (prevMonthPrepay > 0) {
            const monthsRemaining = totalMonths - m + 1;
            if (monthsRemaining > 0 && r > 0) {
              currentPrepayEmi = (balancePrepay * r * Math.pow(1 + r, monthsRemaining)) / (Math.pow(1 + r, monthsRemaining) - 1);
            } else {
              currentPrepayEmi = balancePrepay / monthsRemaining;
            }
          }
        }

        const scheduledPrincipal = Math.min(balancePrepay, currentPrepayEmi - intPre);
        const extraLumpSum = enablePrepayment ? (prepaymentMap[m] || 0) : 0;
        const totalPrincipalPaid = Math.min(balancePrepay, scheduledPrincipal + extraLumpSum + regularTopUpVal);

        const openingPre = balancePrepay;
        balancePrepay -= totalPrincipalPaid;
        totalInterestPrepay += intPre;
        prepayActiveMonths = m;

        monthlyAmortPrepay.push({
          month: m,
          emi: Math.round(scheduledPrincipal + intPre),
          principal: Number(totalPrincipalPaid.toFixed(2)),
          interest: Number(intPre.toFixed(2)),
          opening: Number(openingPre.toFixed(2)),
          closing: Number(Math.max(0, balancePrepay).toFixed(2)),
          prepayment: extraLumpSum + regularTopUpVal
        });
      }
    }

    // Compute Yearly Aggregation
    const getYearlySummary = (monthlyData: any[]) => {
      const yearly: {
        year: number;
        emiPaid: number;
        principalPaid: number;
        interestPaid: number;
        balanceRemaining: number;
      }[] = [];

      for (let i = 0; i < monthlyData.length; i += 12) {
        const slice = monthlyData.slice(i, i + 12);
        const yr = Math.floor(i / 12) + 1;
        const emiSum = slice.reduce((sum, current) => sum + current.emi, 0);
        const prinSum = slice.reduce((sum, current) => sum + current.principal, 0);
        const intSum = slice.reduce((sum, current) => sum + current.interest, 0);
        const closingBal = slice[slice.length - 1].closing;

        yearly.push({
          year: yr,
          emiPaid: Math.round(emiSum),
          principalPaid: Math.round(prinSum),
          interestPaid: Math.round(intSum),
          balanceRemaining: Math.round(closingBal)
        });
      }
      return yearly;
    };

    const yearlyAmortStandard = getYearlySummary(monthlyAmortStandard);
    const yearlyAmortPrepay = getYearlySummary(monthlyAmortPrepay);

    // Savings indicators
    const tenureMonthsSaved = totalMonths - prepayActiveMonths;
    const interestSaved = Math.max(0, totalInterestStandard - totalInterestPrepay);

    return {
      monthlyEmi: Math.round(standardEmi),
      totalPrincipal: P,
      totalInterest: Math.round(totalInterestStandard),
      totalPayable: Math.round(P + totalInterestStandard),
      totalAdditionalCharges: Math.round(totalAdditionalCharges),
      effectiveTotalCost: Math.round(P + totalInterestStandard + totalAdditionalCharges),
      
      monthlyAmortStandard,
      yearlyAmortStandard,
      
      // Prepayment/TopUp splits
      prepayActiveMonths,
      totalInterestPrepay: Math.round(totalInterestPrepay),
      totalPayablePrepay: Math.round(P + totalInterestPrepay),
      interestSaved: Math.round(interestSaved),
      tenureMonthsSaved,
      monthlyAmortPrepay,
      yearlyAmortPrepay
    };
  }, [
    loanAmount,
    interestRate,
    tenure,
    tenureType,
    processingFeePercent,
    processingFeeFlat,
    otherCharges,
    insurance,
    applyGstOnFees,
    enablePrepayment,
    prepaymentsList,
    prepayStrategy,
    enableTopUp,
    topUpAmount
  ]);

  // --- Sub-Planners Modules math ---

  // Reverse planners modes calculations
  const reverseResults = useMemo(() => {
    const emi = parseFloat(revAffordableEmi) || 30000;
    const annualRate = parseFloat(revRate) || 8.5;
    const r = annualRate / 12 / 100;
    const tMonths = (parseFloat(revTenure) || 20) * 12;
    const loanAmt = parseFloat(revLoanAmount) || 5000000;

    let maxLoanAmount = 0;
    let estimatedTenureMonths = 0;
    let estimatedEmiFromLoan = 0;
    let requiredEmiFromDesiredTenure = 0;

    // Mode 1: Max Loan Amount = EMI / [ r * (1+r)^n / ((1+r)^n - 1) ]
    if (r > 0) {
      const factor = (r * Math.pow(1 + r, tMonths)) / (Math.pow(1 + r, tMonths) - 1);
      maxLoanAmount = emi / factor;
    } else {
      maxLoanAmount = emi * tMonths;
    }

    // Mode 2: Tenure from EMI (n = log(EMI / (EMI - P * r)) / log(1 + r))
    if (r > 0 && emi > loanAmt * r) {
      estimatedTenureMonths = Math.log(emi / (emi - loanAmt * r)) / Math.log(1 + r);
    } else if (r === 0) {
      estimatedTenureMonths = loanAmt / emi;
    }

    // Mode 3: EMI from Loan
    if (r > 0) {
      estimatedEmiFromLoan = (loanAmt * r * Math.pow(1 + r, tMonths)) / (Math.pow(1 + r, tMonths) - 1);
    } else {
      estimatedEmiFromLoan = loanAmt / tMonths;
    }

    // Mode 4: Required EMI from Desired Tenure
    const desiredTenureMonths = (parseFloat(revTenure) || 20) * 12;
    if (r > 0) {
      requiredEmiFromDesiredTenure = (loanAmt * r * Math.pow(1 + r, desiredTenureMonths)) / (Math.pow(1 + r, desiredTenureMonths) - 1);
    } else {
      requiredEmiFromDesiredTenure = loanAmt / desiredTenureMonths;
    }

    return {
      maxLoanAmount: Math.round(maxLoanAmount),
      estimatedTenureYears: Number((estimatedTenureMonths / 12).toFixed(1)),
      estimatedEmiFromLoan: Math.round(estimatedEmiFromLoan),
      requiredEmiFromDesiredTenure: Math.round(requiredEmiFromDesiredTenure)
    };
  }, [revAffordableEmi, revRate, revTenure, revLoanAmount, reverseMode]);

  // Affordability metrics
  const affordabilityResults = useMemo(() => {
    const netIncome = parseFloat(affNetIncome) || 100000;
    const existingDebt = parseFloat(affExistingEmi) || 0;
    const rate = parseFloat(affRate) || 8.5;
    const yrs = parseFloat(affTenure) || 20;
    
    // Standard bank FOIR cap at 50% of income
    const totalAffordableEmiCap = netIncome * 0.5;
    const maximumNewEmiBurden = Math.max(0, totalAffordableEmiCap - existingDebt);
    
    // Back-calculate Loan Principal from this new EMI cap
    const r = rate / 12 / 100;
    const n = yrs * 12;
    let maxLoanFromEmi = 0;
    if (r > 0) {
      const factor = (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      maxLoanFromEmi = maximumNewEmiBurden / factor;
    } else {
      maxLoanFromEmi = maximumNewEmiBurden * n;
    }

    const currentEmi = calculations.monthlyEmi;
    const totalNewBurden = currentEmi + existingDebt;
    const emiToIncomeRatio = (totalNewBurden / netIncome) * 100;

    return {
      affordableEmiCap: Math.round(maximumNewEmiBurden),
      maxLoanPrincipal: Math.round(maxLoanFromEmi),
      emiToIncomeRatio: Number(emiToIncomeRatio.toFixed(1)),
      burdenStatus: emiToIncomeRatio > 50 ? 'High Debt Risk' : emiToIncomeRatio > 40 ? 'Moderate Burden' : 'Healthy Range'
    };
  }, [affNetIncome, affExistingEmi, affRate, affTenure, calculations.monthlyEmi]);

  // Multi Loan Comparison calculations
  const comparativeResults = useMemo(() => {
    const P = parseFloat(compPrincipal) || 5000000;
    
    const calculateEmiAndInterest = (rateStr: string, tenureStr: string) => {
      const r = (parseFloat(rateStr) || 8.5) / 12 / 100;
      const n = (parseFloat(tenureStr) || 20) * 12;
      let emi = 0;
      if (r > 0) {
        emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      } else {
        emi = P / n;
      }
      const totalRepay = emi * n;
      return {
        emi: Math.round(emi),
        interest: Math.round(totalRepay - P),
        repay: Math.round(totalRepay)
      };
    };

    const schemeA = calculateEmiAndInterest(compRateA, compTenureA);
    const schemeB = calculateEmiAndInterest(compRateB, compTenureB);
    const schemeC = calculateEmiAndInterest(compRateC, compTenureC);

    return { schemeA, schemeB, schemeC };
  }, [compPrincipal, compRateA, compTenureA, compRateB, compTenureB, compRateC, compTenureC]);

  // Rate Simulator calculations
  const simulatedRateSteps = useMemo(() => {
    const P = loanAmount;
    const n = tenureType === 'years' ? tenure * 12 : tenure;
    
    const steps = [interestRate - 1.0, interestRate - 0.5, interestRate, interestRate + 0.5, interestRate + 1.0];
    
    return steps.map(rVal => {
      if (rVal <= 0) return { rate: 0, emi: 0, interest: 0 };
      const rMonthly = rVal / 12 / 100;
      let emi = 0;
      if (rMonthly > 0) {
        emi = (P * rMonthly * Math.pow(1 + rMonthly, n)) / (Math.pow(1 + rMonthly, n) - 1);
      } else {
        emi = P / n;
      }
      const totalRepay = emi * n;
      return {
        rate: Number(rVal.toFixed(2)),
        emi: Math.round(emi),
        interest: Math.round(totalRepay - P)
      };
    });
  }, [loanAmount, interestRate, tenure, tenureType]);

  // Amortization filtration hook
  const filteredAmortization = useMemo(() => {
    const dataset = amortViewMode === 'monthly' ? calculations.monthlyAmortStandard : calculations.yearlyAmortStandard;
    if (!amortSearch.trim()) return dataset;
    return dataset.filter((row: any) => {
      const term = amortSearch.toLowerCase();
      if (amortViewMode === 'monthly') {
        return row.month.toString() === term || `month ${row.month}`.includes(term);
      }
      return row.year.toString() === term || `year ${row.year}`.includes(term);
    });
  }, [amortViewMode, calculations, amortSearch]);

  // --- Handlers & Actions ---

  const addPrepayment = () => {
    const amt = parseFloat(prepayAmount);
    const mo = parseInt(prepayMonth, 10);
    if (isNaN(amt) || amt <= 0 || isNaN(mo) || mo <= 0) return;

    const newItem: PrepaymentItem = {
      id: Date.now().toString(),
      month: mo,
      amount: amt
    };
    setPrepaymentsList([...prepaymentsList, newItem].sort((a, b) => a.month - b.month));
    setPrepayAmount('');
  };

  const removePrepayment = (id: string) => {
    setPrepaymentsList(prepaymentsList.filter(p => p.id !== id));
  };

  const formatINR = (val: number) => {
    return '₹' + val.toLocaleString('en-IN');
  };

  const copyReportText = () => {
    const text = `Loan Repayment Amortization Summary (Toolique.in)
---------------------------------------------
Loan Category        : ${loanType.toUpperCase()} Loan
Principal Borrowed   : ${formatINR(calculations.totalPrincipal)}
Interest Rate        : ${interestRate}% p.a.
Loan Duration        : ${tenure} ${tenureType === 'years' ? 'Years' : 'Months'}
---------------------------------------------
Monthly Loan EMI     : ${formatINR(calculations.monthlyEmi)}/month
Accumulated Interest : ${formatINR(calculations.totalInterest)}
Additional Fees/Taxes: ${formatINR(calculations.totalAdditionalCharges)}
---------------------------------------------
Effective Total Cost : ${formatINR(calculations.effectiveTotalCost)}
---------------------------------------------`;

    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const exportCSV = () => {
    const headers = ['Month', 'EMI Paid (INR)', 'Principal Paid (INR)', 'Interest Paid (INR)', 'Opening Balance (INR)', 'Closing Balance (INR)'];
    const rows = calculations.monthlyAmortStandard.map(row => [
      row.month,
      row.emi,
      row.principal,
      row.interest,
      row.opening,
      row.closing
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Loan_Amortization_Schedule_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printAmortPage = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Loan Repayment Schedule - Toolique</title>
          <style>
            body { font-family: sans-serif; padding: 30px; color: #333; line-height: 1.5; }
            h2 { border-bottom: 2px solid #555; padding-bottom: 8px; }
            table { w-full; width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { bg-color: #f5f5f5; background: #eee; font-weight: bold; }
            .row-summary { font-weight: bold; background: #fafafa; }
          </style>
        </head>
        <body>
          <h2>LOAN REPAYMENT SCHEDULE</h2>
          <p><strong>Principal borrowed:</strong> ${formatINR(calculations.totalPrincipal)}</p>
          <p><strong>Interest Rate:</strong> ${interestRate}% p.a.</p>
          <p><strong>Tenure:</strong> ${tenure} ${tenureType === 'years' ? 'Years' : 'Months'}</p>
          <p><strong>Monthly EMI:</strong> ${formatINR(calculations.monthlyEmi)}</p>
          <p><strong>Total Lifetime Interest:</strong> ${formatINR(calculations.totalInterest)}</p>
          
          <table>
            <thead>
              <tr>
                <th>Year</th>
                <th>EMI Paid</th>
                <th>Principal Repaid</th>
                <th>Interest Repaid</th>
                <th>Balance Outstanding</th>
              </tr>
            </thead>
            <tbody>
              ${calculations.yearlyAmortStandard.map(row => `
                <tr>
                  <td>Year ${row.year}</td>
                  <td>${formatINR(row.emiPaid)}</td>
                  <td>${formatINR(row.principalPaid)}</td>
                  <td>${formatINR(row.interestPaid)}</td>
                  <td>${formatINR(row.balanceRemaining)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(79, 70, 229); // Indigo header
    doc.rect(0, 0, 210, 38, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('LOAN REPAYMENT PLANNER', 15, 22);
    doc.setFontSize(10);
    doc.text('Detailed Amortization Analysis — Toolique.in', 15, 30);

    doc.setTextColor(60, 60, 60);
    doc.setFontSize(12);
    doc.text('Loan Parameters Summary', 15, 50);

    doc.setFontSize(10);
    doc.text(`Principal Loan Amount: ${formatINR(calculations.totalPrincipal)}`, 15, 58);
    doc.text(`Annual Interest Rate: ${interestRate}% p.a.`, 15, 64);
    doc.text(`Loan Duration: ${tenure} ${tenureType === 'years' ? 'Years' : 'Months'}`, 15, 70);
    doc.text(`Monthly Base EMI: ${formatINR(calculations.monthlyEmi)}`, 15, 76);
    doc.text(`Effective Additional Fees/Charges: ${formatINR(calculations.totalAdditionalCharges)}`, 15, 82);

    doc.setDrawColor(200, 200, 200);
    doc.line(15, 90, 195, 90);

    // Repayment table headers
    doc.setFont('helvetica', 'bold');
    doc.text('Year', 15, 98);
    doc.text('EMI Repaid', 50, 98);
    doc.text('Principal Paid', 85, 98);
    doc.text('Interest Paid', 120, 98);
    doc.text('Balance Remaining', 155, 98);

    doc.setFont('helvetica', 'normal');
    doc.line(15, 102, 195, 102);

    let currentY = 110;
    calculations.yearlyAmortStandard.forEach(row => {
      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }
      doc.text(`Year ${row.year}`, 15, currentY);
      doc.text(formatINR(row.emiPaid), 50, currentY);
      doc.text(formatINR(row.principalPaid), 85, currentY);
      doc.text(formatINR(row.interestPaid), 120, currentY);
      doc.text(formatINR(row.balanceRemaining), 155, currentY);
      currentY += 8;
    });

    doc.save(`EMI_Loan_Repayment_Schedule_${Date.now()}.pdf`);
  };

  const getShareLink = () => {
    const params = new URLSearchParams();
    params.set('amount', loanAmount.toString());
    params.set('rate', interestRate.toString());
    params.set('tenure', tenure.toString());
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto text-left">
      
      {/* Top Banner Widget */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-650 dark:text-indigo-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-zinc-900 dark:text-white text-sm">Loan Repayment Intelligence</h3>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">Configure compounding rates, topups, and prepayments</p>
          </div>
        </div>

        {/* Copy Share link */}
        <button
          onClick={() => {
            navigator.clipboard.writeText(getShareLink());
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2000);
          }}
          className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm"
        >
          {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedLink ? 'Link Copied' : 'Share Scenario'}</span>
        </button>
      </div>

      {/* LOAN TYPE PRESETS TABS */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
        {(['home', 'car', 'personal', 'education', 'custom'] as LoanType[]).map((type) => (
          <button
            key={type}
            onClick={() => setLoanType(type)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition ${
              loanType === type
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-650 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100'
            }`}
          >
            {type} Loan
          </button>
        ))}
      </div>

      {/* TWO COLUMN INPUT & HIGHLIGHT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: CALCULATOR INPUTS */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-5">
            <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-150 dark:border-zinc-850 pb-3">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Loan Parameters</span>
            </h3>

            {/* Loan Amount Slider + Numerical field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Loan Principal</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Math.max(0, Number(e.target.value)))}
                    className="w-32 px-2 py-1 text-right text-xs font-bold border border-zinc-200 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-950 focus:outline-none rounded-lg"
                  />
                  <span className="text-[10px] font-bold text-zinc-400">₹</span>
                </div>
              </div>
              <input
                type="range"
                min="50000"
                max="30000000"
                step="50000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[8px] text-zinc-400 font-bold uppercase">
                <span>₹50K</span>
                <span>₹3 Crore</span>
              </div>
              {/* Quick Preset buttons */}
              <div className="flex flex-wrap gap-1">
                {[500000, 1000000, 2500000, 5000000, 7500000, 10000000].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setLoanAmount(preset)}
                    className="px-2 py-0.5 text-[9px] font-bold border border-zinc-200 dark:border-zinc-800 rounded-md bg-zinc-50/30 dark:bg-zinc-950/20 text-zinc-600 hover:text-indigo-650 hover:bg-indigo-500/5 transition"
                  >
                    {preset >= 10000000 ? `₹${(preset / 10000000)} Cr` : `₹${(preset / 100000)} L`}
                  </button>
                ))}
              </div>
            </div>

            {/* Interest Rate slider + field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Interest Rate (% p.a.)</label>
                <input
                  type="number"
                  step="0.05"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Math.max(0.1, Math.min(30, Number(e.target.value))))}
                  className="w-16 px-2 py-1 text-right text-xs font-bold border border-zinc-200 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-950 focus:outline-none rounded-lg"
                />
              </div>
              <input
                type="range"
                min="5"
                max="20"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[8px] text-zinc-400 font-bold uppercase">
                <span>5%</span>
                <span>20%</span>
              </div>
              {/* Quick presets */}
              <div className="flex flex-wrap gap-1">
                {[7, 8, 8.5, 9, 10, 12].map((pRate) => (
                  <button
                    key={pRate}
                    onClick={() => setInterestRate(pRate)}
                    className="px-2 py-0.5 text-[9px] font-bold border border-zinc-200 dark:border-zinc-800 rounded-md bg-zinc-50/30 dark:bg-zinc-950/20 text-zinc-650 hover:text-indigo-650 transition"
                  >
                    {pRate}%
                  </button>
                ))}
              </div>
            </div>

            {/* Tenure toggle + slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Loan Duration</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={tenure}
                    onChange={(e) => setTenure(Math.max(1, Number(e.target.value)))}
                    className="w-14 px-2 py-1 text-right text-xs font-bold border border-zinc-200 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-950 focus:outline-none rounded-lg font-mono"
                  />
                  <select
                    value={tenureType}
                    onChange={(e) => {
                      const val = e.target.value as 'years' | 'months';
                      setTenureType(val);
                      setTenure(val === 'years' ? Math.max(1, Math.round(tenure / 12)) : tenure * 12);
                    }}
                    className="p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[10px] font-bold text-zinc-500"
                  >
                    <option value="years">Years</option>
                    <option value="months">Months</option>
                  </select>
                </div>
              </div>
              <input
                type="range"
                min={tenureType === 'years' ? 1 : 12}
                max={tenureType === 'years' ? 30 : 360}
                step="1"
                value={tenure}
                onChange={(e) => setTenure(Number(e.target.value))}
                className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[8px] text-zinc-400 font-bold uppercase">
                <span>{tenureType === 'years' ? '1 Year' : '12 Months'}</span>
                <span>{tenureType === 'years' ? '30 Years' : '360 Months'}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {[5, 10, 15, 20, 25, 30].map((tPreset) => (
                  <button
                    key={tPreset}
                    onClick={() => {
                      setTenureType('years');
                      setTenure(tPreset);
                    }}
                    className="px-2 py-0.5 text-[9px] font-bold border border-zinc-200 dark:border-zinc-800 rounded-md bg-zinc-50/30 dark:bg-zinc-950/20 text-zinc-650 hover:text-indigo-650 transition"
                  >
                    {tPreset} Yrs
                  </button>
                ))}
              </div>
            </div>

            {/* EXPANDABLE ADVANCED OPTIONS (Optional charges) */}
            <div className="border-t border-zinc-100 dark:border-zinc-850 pt-3">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex justify-between items-center text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 transition"
              >
                <span>Advanced Fees & Charges</span>
                <ChevronDown className={`w-4 h-4 transition ${showAdvanced ? 'rotate-180' : ''}`} />
              </button>

              {showAdvanced && (
                <div className="mt-3 p-4 rounded-2xl bg-zinc-50/40 dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-850 space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-zinc-400">Processing Fee (%)</label>
                      <input
                        type="number"
                        value={processingFeePercent}
                        onChange={(e) => setProcessingFeePercent(Math.max(0, Number(e.target.value)))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-xs font-bold focus:outline-none font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-zinc-400">Processing Fee (₹)</label>
                      <input
                        type="number"
                        value={processingFeeFlat}
                        onChange={(e) => setProcessingFeeFlat(Math.max(0, Number(e.target.value)))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-xs font-bold focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-zinc-400">Other Charges (₹)</label>
                      <input
                        type="number"
                        value={otherCharges}
                        onChange={(e) => setOtherCharges(Math.max(0, Number(e.target.value)))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-xs font-bold focus:outline-none font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-zinc-400">Insurance (₹)</label>
                      <input
                        type="number"
                        value={insurance}
                        onChange={(e) => setInsurance(Math.max(0, Number(e.target.value)))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-xs font-bold focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs font-bold text-zinc-650 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={applyGstOnFees}
                      onChange={(e) => setApplyGstOnFees(e.target.checked)}
                      className="rounded border-zinc-300 text-indigo-650 focus:ring-indigo-500"
                    />
                    <span>Apply 18% GST on processing & other charges</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PRIMARY RESULTS HIGHLIGHT */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl bg-zinc-950 text-white shadow-xl flex flex-col justify-between space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-850 pb-4">
              <div>
                <span className="text-[9px] font-black uppercase text-zinc-450 tracking-wider">MONTHLY REPAYMENT LIABILITY</span>
                <h3 className="text-sm font-black text-indigo-400 mt-0.5">Loan Plan Overview</h3>
              </div>
              <button
                onClick={copyReportText}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-350 hover:bg-zinc-850 hover:text-white transition"
              >
                {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedReport ? 'Copied' : 'Copy splits'}</span>
              </button>
            </div>

            {/* Monthly EMI Large Badge */}
            <div className="bg-gradient-to-r from-indigo-650 to-indigo-500 p-6 rounded-2xl flex justify-between items-center shadow-lg shadow-indigo-650/10">
              <div>
                <span className="text-[10px] font-black text-indigo-150 uppercase tracking-wider block">Monthly Loan EMI</span>
                <div className="text-3xl font-black font-mono text-white mt-0.5">
                  {formatINR(calculations.monthlyEmi)}/mo
                </div>
              </div>
              <div className="p-3 bg-white/10 rounded-xl">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Principal vs Interest Splits */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 pt-2 text-left">
              <div className="bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-850/40">
                <span className="text-[9px] text-zinc-400 font-extrabold uppercase block">Borrowed Sum</span>
                <span className="text-sm font-black font-mono text-white mt-1 block">{formatINR(calculations.totalPrincipal)}</span>
              </div>
              <div className="bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-850/40">
                <span className="text-[9px] text-zinc-400 font-extrabold uppercase block">Interest Payable</span>
                <span className="text-sm font-black font-mono text-indigo-400 mt-1 block">{formatINR(calculations.totalInterest)}</span>
              </div>
              <div className="bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-850/40">
                <span className="text-[9px] text-zinc-400 font-extrabold uppercase block">Charges & Fees</span>
                <span className="text-sm font-black font-mono text-zinc-300 mt-1 block">{formatINR(calculations.totalAdditionalCharges)}</span>
              </div>
              <div className="bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-850/40">
                <span className="text-[9px] text-zinc-400 font-extrabold uppercase block">Effective Cost</span>
                <span className="text-sm font-black font-mono text-emerald-400 mt-1 block">{formatINR(calculations.effectiveTotalCost)}</span>
              </div>
            </div>

            {/* Custom SVG Repayment composition donut chart */}
            <div className="flex flex-col sm:flex-row items-center justify-around gap-4 pt-4 border-t border-zinc-900">
              <div className="relative w-36 h-36">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background */}
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#222" strokeWidth="3" />
                  {/* Segment A (Principal) */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="3.2"
                    strokeDasharray={`${(calculations.totalPrincipal / calculations.effectiveTotalCost) * 100} ${100 - (calculations.totalPrincipal / calculations.effectiveTotalCost) * 100}`}
                    strokeDashoffset="0"
                  />
                  {/* Segment B (Interest) */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="none"
                    stroke="#818cf8"
                    strokeWidth="3.2"
                    strokeDasharray={`${(calculations.totalInterest / calculations.effectiveTotalCost) * 100} ${100 - (calculations.totalInterest / calculations.effectiveTotalCost) * 100}`}
                    strokeDashoffset={`-${(calculations.totalPrincipal / calculations.effectiveTotalCost) * 100}`}
                  />
                  {/* Segment C (Charges) */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="none"
                    stroke="#a1a1aa"
                    strokeWidth="3.2"
                    strokeDasharray={`${(calculations.totalAdditionalCharges / calculations.effectiveTotalCost) * 100} ${100 - (calculations.totalAdditionalCharges / calculations.effectiveTotalCost) * 100}`}
                    strokeDashoffset={`-${((calculations.totalPrincipal + calculations.totalInterest) / calculations.effectiveTotalCost) * 100}`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col justify-center items-center">
                  <span className="text-[8px] uppercase tracking-wider text-zinc-400 font-extrabold">Repayment</span>
                  <span className="text-xs font-black">100%</span>
                </div>
              </div>

              {/* Legends details */}
              <div className="text-xs space-y-2 w-full sm:w-auto">
                <div className="flex justify-between items-center gap-6">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded bg-indigo-600" />
                    <span className="text-zinc-400 font-bold">Principal Contribution</span>
                  </div>
                  <span className="font-mono font-bold text-white">{((calculations.totalPrincipal / calculations.effectiveTotalCost) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center gap-6">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded bg-indigo-400" />
                    <span className="text-zinc-400 font-bold">Interest Contribution</span>
                  </div>
                  <span className="font-mono font-bold text-indigo-455">{((calculations.totalInterest / calculations.effectiveTotalCost) * 100).toFixed(1)}%</span>
                </div>
                {calculations.totalAdditionalCharges > 0 && (
                  <div className="flex justify-between items-center gap-6">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded bg-zinc-500" />
                      <span className="text-zinc-400 font-bold">Additional Charges</span>
                    </div>
                    <span className="font-mono font-bold text-zinc-300">{((calculations.totalAdditionalCharges / calculations.effectiveTotalCost) * 100).toFixed(1)}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LOAN BALANCE TIMELINE GRAPH (Interactive Area Plot) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span>Outstanding Balance Amortization Timeline</span>
        </h3>
        
        {/* SVG Area Chart */}
        <div className="relative w-full h-48 bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-200/40 dark:border-zinc-850 rounded-2xl p-4">
          <svg className="w-full h-full" viewBox="0 0 500 100" preserveAspectRatio="none">
            {/* SVG Path drawing standard progression */}
            <path
              d={`M 0 100 ${calculations.yearlyAmortStandard.map((row, idx) => {
                const x = (idx / (calculations.yearlyAmortStandard.length - 1)) * 500;
                const y = 100 - (row.balanceRemaining / calculations.totalPrincipal) * 100;
                return `L ${x} ${y}`;
              }).join(' ')} L 500 100 Z`}
              fill="url(#timelineGrad)"
              stroke="#4f46e5"
              strokeWidth="1.5"
            />
            {/* Hover guideline */}
            {timelineHoverIndex !== null && (
              <line
                x1={(timelineHoverIndex / (calculations.yearlyAmortStandard.length - 1)) * 500}
                y1="0"
                x2={(timelineHoverIndex / (calculations.yearlyAmortStandard.length - 1)) * 500}
                y2="100"
                stroke="#6366f1"
                strokeDasharray="2 2"
                strokeWidth="1"
              />
            )}
            <defs>
              <linearGradient id="timelineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
              </linearGradient>
            </defs>
          </svg>

          {/* Mouse tracking overlay */}
          <div 
            className="absolute inset-0 cursor-crosshair"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const percentage = (e.clientX - rect.left) / rect.width;
              const idx = Math.min(
                calculations.yearlyAmortStandard.length - 1,
                Math.max(0, Math.round(percentage * (calculations.yearlyAmortStandard.length - 1)))
              );
              setTimelineHoverIndex(idx);
            }}
            onMouseLeave={() => setTimelineHoverIndex(null)}
          />

          {/* Floating Tooltip coordinates */}
          {timelineHoverIndex !== null && calculations.yearlyAmortStandard[timelineHoverIndex] && (
            <div className="absolute top-2 left-2 bg-zinc-950 text-white text-[9px] font-mono p-2 rounded-lg border border-zinc-800 space-y-0.5 shadow-xl pointer-events-none">
              <div className="font-extrabold uppercase text-indigo-400">Year {calculations.yearlyAmortStandard[timelineHoverIndex].year}</div>
              <div>Outstanding Principal: {formatINR(calculations.yearlyAmortStandard[timelineHoverIndex].balanceRemaining)}</div>
              <div>Cumulative Interest Paid: {formatINR(calculations.yearlyAmortStandard[timelineHoverIndex].interestPaid)}</div>
            </div>
          )}
        </div>
      </div>

      {/* AMORTIZATION TABLE MODULE */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-150 dark:border-zinc-850 pb-3">
          <div className="space-y-1">
            <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-500" />
              <span>Amortization Repayment ledger</span>
            </h3>
            <p className="text-[10px] text-zinc-450 dark:text-zinc-500 font-medium">Monthly and yearly principal-interest splitting records</p>
          </div>

          {/* Table Controls (Monthly/Yearly toggle, CSV, PDF, Print) */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-800 p-0.5">
              <button
                onClick={() => { setAmortViewMode('yearly'); setAmortPage(0); }}
                className={`px-3 py-1 rounded-md text-[10px] font-bold ${amortViewMode === 'yearly' ? 'bg-indigo-500/15 text-indigo-650 dark:text-indigo-455' : 'text-zinc-500'}`}
              >
                Yearly View
              </button>
              <button
                onClick={() => { setAmortViewMode('monthly'); setAmortPage(0); }}
                className={`px-3 py-1 rounded-md text-[10px] font-bold ${amortViewMode === 'monthly' ? 'bg-indigo-500/15 text-indigo-650 dark:text-indigo-455' : 'text-zinc-500'}`}
              >
                Monthly View
              </button>
            </div>
            
            <button
              onClick={exportCSV}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-550 transition-colors"
              title="Export CSV"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={printAmortPage}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-550 transition-colors"
              title="Print"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDownloadPDF}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-550 transition-colors"
              title="Download PDF"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Search filter input */}
        <div className="relative max-w-xs">
          <input
            type="text"
            placeholder="Search e.g. 'Year 5' or 'Month 12'..."
            value={amortSearch}
            onChange={(e) => { setAmortSearch(e.target.value); setAmortPage(0); }}
            className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-xs focus:outline-none"
          />
        </div>

        {/* Ledger Grid */}
        <div className="overflow-x-auto border border-zinc-200/50 dark:border-zinc-800/80 rounded-2xl">
          <table className="w-full text-xs text-left font-mono">
            <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-4 text-zinc-500 font-extrabold uppercase">Period</th>
                <th className="py-3 px-4 text-zinc-500 font-extrabold uppercase">EMI Installment</th>
                <th className="py-3 px-4 text-zinc-500 font-extrabold uppercase">Principal Component</th>
                <th className="py-3 px-4 text-zinc-500 font-extrabold uppercase text-indigo-500">Interest Component</th>
                <th className="py-3 px-4 text-zinc-500 font-extrabold uppercase text-right">Outstanding Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/60">
              {filteredAmortization.slice(amortPage * 12, (amortPage + 1) * 12).map((row: any) => {
                const label = amortViewMode === 'yearly' ? `Year ${row.year}` : `Month ${row.month}`;
                const emi = amortViewMode === 'yearly' ? row.emiPaid : row.emi;
                const principal = amortViewMode === 'yearly' ? row.principalPaid : row.principal;
                const interest = amortViewMode === 'yearly' ? row.interestPaid : row.interest;
                const balance = amortViewMode === 'yearly' ? row.balanceRemaining : row.closing;

                return (
                  <tr key={label} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                    <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-200">{label}</td>
                    <td className="py-3 px-4 text-zinc-700 dark:text-zinc-300">{formatINR(emi)}</td>
                    <td className="py-3 px-4 text-zinc-750 dark:text-zinc-300">{formatINR(principal)}</td>
                    <td className="py-3 px-4 text-indigo-650 dark:text-indigo-400 font-bold">{formatINR(interest)}</td>
                    <td className="py-3 px-4 text-right font-black text-zinc-900 dark:text-white">{formatINR(balance)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {filteredAmortization.length > 12 && (
          <div className="flex justify-between items-center pt-2">
            <span className="text-[10px] font-bold text-zinc-450">Showing {amortPage * 12 + 1} - {Math.min(filteredAmortization.length, (amortPage + 1) * 12)} of {filteredAmortization.length}</span>
            <div className="flex gap-2">
              <button
                disabled={amortPage === 0}
                onClick={() => setAmortPage(amortPage - 1)}
                className="px-2.5 py-1 text-xs border border-zinc-200 dark:border-zinc-850 rounded-lg disabled:opacity-40"
              >
                Prev
              </button>
              <button
                disabled={(amortPage + 1) * 12 >= filteredAmortization.length}
                onClick={() => setAmortPage(amortPage + 1)}
                className="px-2.5 py-1 text-xs border border-zinc-200 dark:border-zinc-850 rounded-lg disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PREPAYMENT & TOP-UP SIMULATOR MODULE */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-6">
        <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-150 dark:border-zinc-850 pb-2">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span>Part-Payments & Top-Up Optimizer</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Prepayment Adders panel */}
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-xs font-extrabold text-zinc-650 cursor-pointer">
              <input
                type="checkbox"
                checked={enablePrepayment}
                onChange={(e) => setEnablePrepayment(e.target.checked)}
                className="rounded border-zinc-300 text-indigo-650"
              />
              <span>Activate Part-Payments simulation</span>
            </label>

            {enablePrepayment && (
              <div className="p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-850 space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-zinc-400">Prepay Amount (₹)</label>
                    <input
                      type="number"
                      value={prepayAmount}
                      onChange={(e) => setPrepayAmount(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-xs font-bold focus:outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-zinc-400">Month Number</label>
                    <input
                      type="number"
                      value={prepayMonth}
                      onChange={(e) => setPrepayMonth(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-xs font-bold focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center gap-4">
                  <div className="space-y-1 w-1/2">
                    <label className="text-[9px] font-black uppercase text-zinc-400 block">Prepayment Strategy</label>
                    <select
                      value={prepayStrategy}
                      onChange={(e) => setPrepayStrategy(e.target.value as PrepaymentStrategy)}
                      className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[10px] font-bold"
                    >
                      <option value="reduce_tenure">Reduce Tenure (Months)</option>
                      <option value="reduce_emi">Reduce Monthly EMI</option>
                    </select>
                  </div>
                  <button
                    onClick={addPrepayment}
                    className="self-end px-4 py-2 bg-indigo-650 text-white text-xs font-extrabold rounded-lg flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Prepayment
                  </button>
                </div>

                {/* Prepayments list */}
                {prepaymentsList.length > 0 && (
                  <div className="pt-2.5 border-t border-zinc-200 dark:border-zinc-800 space-y-1.5 max-h-36 overflow-y-auto">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase">Simulated Prepayments List:</span>
                    {prepaymentsList.map(p => (
                      <div key={p.id} className="flex justify-between items-center p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-850 text-[10px] font-mono">
                        <span>Month {p.month}: {formatINR(p.amount)}</span>
                        <button onClick={() => removePrepayment(p.id)} className="text-rose-500 hover:underline">Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Top Up Simulator */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
              <label className="flex items-center gap-2 text-xs font-extrabold text-zinc-650 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableTopUp}
                  onChange={(e) => setEnableTopUp(e.target.checked)}
                  className="rounded border-zinc-300 text-indigo-650"
                />
                <span>Increase my Monthly EMI (Top-up simulation)</span>
              </label>

              {enableTopUp && (
                <div className="p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-850 space-y-2.5">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-zinc-400 block">Additional Top-up/month (₹)</label>
                    <input
                      type="number"
                      value={topUpAmount}
                      onChange={(e) => setTopUpAmount(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-xs font-bold focus:outline-none font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results comparisons */}
          <div className="bg-zinc-50 dark:bg-zinc-950/30 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-850 space-y-4">
            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Interest Savings Report</span>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-xl">
                <span className="text-[9px] text-zinc-400 font-extrabold uppercase">Interest Saved</span>
                <div className="text-lg font-black font-mono text-emerald-500 mt-1">{formatINR(calculations.interestSaved)}</div>
              </div>
              <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-xl">
                <span className="text-[9px] text-zinc-400 font-extrabold uppercase">Duration Saved</span>
                <div className="text-lg font-black font-mono text-indigo-650 dark:text-indigo-400 mt-1">{calculations.tenureMonthsSaved} Months</div>
              </div>
            </div>
            
            <div className="space-y-2 text-xs border-t border-zinc-200 dark:border-zinc-800 pt-3 text-zinc-600">
              <div className="flex justify-between">
                <span>Total Interest (No prepayment):</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">{formatINR(calculations.totalInterest)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Interest (With prepayment):</span>
                <span className="font-bold text-emerald-500">{formatINR(calculations.totalInterestPrepay)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PLAN YOUR LOAN: REVERSE EMI CALCULATORS */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-6">
        <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-150 dark:border-zinc-850 pb-2">
          <ArrowRightLeft className="w-4 h-4 text-indigo-500" />
          <span>Plan Your Loan (Reverse Planners)</span>
        </h3>

        {/* Reverse Planners Modes Toggles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-zinc-150 dark:border-zinc-850 pb-3">
          {(['loan_from_emi', 'tenure_from_emi', 'emi_from_loan', 'emi_from_tenure'] as ReverseMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setReverseMode(mode)}
              className={`py-2 rounded-xl text-[10px] font-bold border transition ${
                reverseMode === mode
                  ? 'border-indigo-600 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400'
                  : 'border-zinc-200 dark:border-zinc-800/60 text-zinc-550 dark:text-zinc-400 hover:bg-zinc-50'
              }`}
            >
              {mode === 'loan_from_emi' ? 'Loan from EMI' :
               mode === 'tenure_from_emi' ? 'Tenure from EMI' :
               mode === 'emi_from_loan' ? 'EMI from Loan' : 'EMI from Tenure'}
            </button>
          ))}
        </div>

        {/* Input variables */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            {(reverseMode === 'loan_from_emi' || reverseMode === 'tenure_from_emi') && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-450 uppercase">Affordable Monthly EMI (₹)</label>
                <input
                  type="number"
                  value={revAffordableEmi}
                  onChange={(e) => setRevAffordableEmi(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 font-mono text-xs font-bold focus:outline-none"
                />
              </div>
            )}
            
            {(reverseMode === 'emi_from_loan' || reverseMode === 'tenure_from_emi' || reverseMode === 'emi_from_tenure') && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-450 uppercase">Loan Principal Amount (₹)</label>
                <input
                  type="number"
                  value={revLoanAmount}
                  onChange={(e) => setRevLoanAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 font-mono text-xs font-bold focus:outline-none"
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-450 uppercase">Expected Rate (% p.a.)</label>
              <input
                type="number"
                value={revRate}
                onChange={(e) => setRevRate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 font-mono text-xs font-bold focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            {(reverseMode === 'loan_from_emi' || reverseMode === 'emi_from_loan' || reverseMode === 'emi_from_tenure') && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-450 uppercase">Tenure Duration (Years)</label>
                <input
                  type="number"
                  value={revTenure}
                  onChange={(e) => setRevTenure(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 font-mono text-xs font-bold focus:outline-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* Results layout */}
        <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-850 flex justify-between items-center">
          <div>
            <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Estimated Outcome</span>
            <div className="text-xl font-black text-indigo-650 dark:text-indigo-400 mt-1 font-mono">
              {reverseMode === 'loan_from_emi' && `Max Affordable Loan: ${formatINR(reverseResults.maxLoanAmount)}`}
              {reverseMode === 'tenure_from_emi' && `Required Tenure: ${reverseResults.estimatedTenureYears} Years`}
              {reverseMode === 'emi_from_loan' && `Estimated Monthly EMI: ${formatINR(reverseResults.estimatedEmiFromLoan)}`}
              {reverseMode === 'emi_from_tenure' && `Required Monthly EMI: ${formatINR(reverseResults.requiredEmiFromDesiredTenure)}`}
            </div>
          </div>
          <CreditCard className="w-6 h-6 text-zinc-400" />
        </div>
      </div>

      {/* LOAN AFFORDABILITY CALCULATOR */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-6">
        <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-150 dark:border-zinc-850 pb-2">
          <CreditCard className="w-4 h-4 text-indigo-500" />
          <span>Loan Affordability Analysis</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-zinc-400">Monthly Net Income (₹)</label>
            <input
              type="number"
              value={affNetIncome}
              onChange={(e) => setAffNetIncome(e.target.value)}
              className="w-full p-2 rounded-lg border border-zinc-250 dark:border-zinc-800 bg-transparent text-xs font-bold focus:outline-none font-mono"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-zinc-400">Existing Monthly EMIs (₹)</label>
            <input
              type="number"
              value={affExistingEmi}
              onChange={(e) => setAffExistingEmi(e.target.value)}
              className="w-full p-2 rounded-lg border border-zinc-250 dark:border-zinc-800 bg-transparent text-xs font-bold focus:outline-none font-mono"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-zinc-400">Expected Rate (% p.a.)</label>
            <input
              type="number"
              value={affRate}
              onChange={(e) => setAffRate(e.target.value)}
              className="w-full p-2 rounded-lg border border-zinc-250 dark:border-zinc-800 bg-transparent text-xs font-bold focus:outline-none font-mono"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-zinc-400">Tenure (Years)</label>
            <input
              type="number"
              value={affTenure}
              onChange={(e) => setAffTenure(e.target.value)}
              className="w-full p-2 rounded-lg border border-zinc-250 dark:border-zinc-800 bg-transparent text-xs font-bold focus:outline-none font-mono"
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-850 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div>
            <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Estimated Max Borrowing</span>
            <div className="text-xl font-black text-emerald-500 mt-1 font-mono">{formatINR(affordabilityResults.maxLoanPrincipal)}</div>
          </div>
          <div>
            <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Total Monthly EMI burden</span>
            <div className="text-base font-black text-zinc-800 dark:text-white mt-1 font-mono">{affordabilityResults.emiToIncomeRatio}% of Income</div>
          </div>
          <div className="text-right">
            <span className={`px-3 py-1 rounded-full text-[9px] font-bold text-white ${affordabilityResults.burdenStatus === 'Healthy Range' ? 'bg-emerald-500' : affordabilityResults.burdenStatus === 'Moderate Burden' ? 'bg-amber-500' : 'bg-rose-500'}`}>
              {affordabilityResults.burdenStatus}
            </span>
          </div>
        </div>
      </div>

      {/* LOAN COMPARISON TOOL */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-6">
        <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-150 dark:border-zinc-850 pb-2">
          <ArrowRightLeft className="w-4 h-4 text-indigo-500" />
          <span>Compare Loan Scenarios</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Inputs groups */}
          <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-850 space-y-3 bg-zinc-50/50 dark:bg-zinc-950/20">
            <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Scenario A</div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] text-zinc-400 font-bold uppercase block">Rate (% p.a.)</label>
                <input type="number" value={compRateA} onChange={(e) => setCompRateA(e.target.value)} className="w-full p-2 border border-zinc-200 dark:border-zinc-800 rounded bg-transparent text-xs font-mono font-bold focus:outline-none" />
              </div>
              <div>
                <label className="text-[9px] text-zinc-400 font-bold uppercase block">Tenure (Years)</label>
                <input type="number" value={compTenureA} onChange={(e) => setCompTenureA(e.target.value)} className="w-full p-2 border border-zinc-200 dark:border-zinc-800 rounded bg-transparent text-xs font-mono font-bold focus:outline-none" />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-850 space-y-3 bg-zinc-50/50 dark:bg-zinc-950/20">
            <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Scenario B</div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] text-zinc-400 font-bold uppercase block">Rate (% p.a.)</label>
                <input type="number" value={compRateB} onChange={(e) => setCompRateB(e.target.value)} className="w-full p-2 border border-zinc-200 dark:border-zinc-800 rounded bg-transparent text-xs font-mono font-bold focus:outline-none" />
              </div>
              <div>
                <label className="text-[9px] text-zinc-400 font-bold uppercase block">Tenure (Years)</label>
                <input type="number" value={compTenureB} onChange={(e) => setCompTenureB(e.target.value)} className="w-full p-2 border border-zinc-200 dark:border-zinc-800 rounded bg-transparent text-xs font-mono font-bold focus:outline-none" />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-850 space-y-3 bg-zinc-50/50 dark:bg-zinc-950/20">
            <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Scenario C</div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] text-zinc-400 font-bold uppercase block">Rate (% p.a.)</label>
                <input type="number" value={compRateC} onChange={(e) => setCompRateC(e.target.value)} className="w-full p-2 border border-zinc-200 dark:border-zinc-800 rounded bg-transparent text-xs font-mono font-bold focus:outline-none" />
              </div>
              <div>
                <label className="text-[9px] text-zinc-400 font-bold uppercase block">Tenure (Years)</label>
                <input type="number" value={compTenureC} onChange={(e) => setCompTenureC(e.target.value)} className="w-full p-2 border border-zinc-200 dark:border-zinc-800 rounded bg-transparent text-xs font-mono font-bold focus:outline-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Global principal configuration */}
        <div className="space-y-1 max-w-xs">
          <label className="text-[9px] font-black uppercase text-zinc-400">Principal comparison amount (₹)</label>
          <input
            type="number"
            value={compPrincipal}
            onChange={(e) => setCompPrincipal(e.target.value)}
            className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-xs font-bold focus:outline-none font-mono"
          />
        </div>

        {/* side by side comparative layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-3 text-xs font-mono">
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 space-y-2">
            <div className="font-extrabold uppercase text-zinc-400">Scenario A Repayment</div>
            <div>Monthly EMI: {formatINR(comparativeResults.schemeA.emi)}</div>
            <div>Total Interest: {formatINR(comparativeResults.schemeA.interest)}</div>
            <div>Total Payable: {formatINR(comparativeResults.schemeA.repay)}</div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 space-y-2">
            <div className="font-extrabold uppercase text-zinc-400">Scenario B Repayment</div>
            <div>Monthly EMI: {formatINR(comparativeResults.schemeB.emi)}</div>
            <div>Total Interest: {formatINR(comparativeResults.schemeB.interest)}</div>
            <div>Total Payable: {formatINR(comparativeResults.schemeB.repay)}</div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 space-y-2">
            <div className="font-extrabold uppercase text-zinc-400">Scenario C Repayment</div>
            <div>Monthly EMI: {formatINR(comparativeResults.schemeC.emi)}</div>
            <div>Total Interest: {formatINR(comparativeResults.schemeC.interest)}</div>
            <div>Total Payable: {formatINR(comparativeResults.schemeC.repay)}</div>
          </div>
        </div>
      </div>

      {/* FLOATING INTEREST RATE SCENARIO SIMULATOR */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-150 dark:border-zinc-850 pb-2">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span>Floating Interest Rate Scenario Simulator</span>
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 pt-2 text-xs font-mono">
          {simulatedRateSteps.map((step) => (
            <div key={step.rate} className={`p-3.5 rounded-2xl border ${step.rate === interestRate ? 'border-indigo-650 bg-indigo-500/5' : 'border-zinc-200 dark:border-zinc-850'}`}>
              <div className="font-bold text-zinc-900 dark:text-zinc-100">{step.rate}% rate</div>
              <div className="mt-1.5 text-zinc-600 dark:text-zinc-400">EMI: {formatINR(step.emi)}</div>
              <div className="text-[10px] text-zinc-450 dark:text-zinc-500 mt-1">Interest: {formatINR(step.interest)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* YEAR-WISE REPAYMENT SUMMARY CARDS */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span>Loan Milestones Repayment Journey</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
          {calculations.yearlyAmortStandard.length > 0 && (
            <div className="p-4 rounded-2xl bg-zinc-50/40 dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-850 space-y-2">
              <span className="font-black text-indigo-650 dark:text-indigo-400 uppercase tracking-wider text-[9px] block">Year 1 Milestone</span>
              <div>Principal Paid: {formatINR(calculations.yearlyAmortStandard[0].principalPaid)}</div>
              <div>Interest Paid: {formatINR(calculations.yearlyAmortStandard[0].interestPaid)}</div>
              <div className="font-bold text-zinc-800 dark:text-zinc-200">Balance: {formatINR(calculations.yearlyAmortStandard[0].balanceRemaining)}</div>
            </div>
          )}

          {calculations.yearlyAmortStandard.length > 4 && (
            <div className="p-4 rounded-2xl bg-zinc-50/40 dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-850 space-y-2">
              <span className="font-black text-indigo-650 dark:text-indigo-400 uppercase tracking-wider text-[9px] block">Year 5 Milestone</span>
              <div>Principal Paid: {formatINR(calculations.yearlyAmortStandard[4].principalPaid)}</div>
              <div>Interest Paid: {formatINR(calculations.yearlyAmortStandard[4].interestPaid)}</div>
              <div className="font-bold text-zinc-800 dark:text-zinc-200">Balance: {formatINR(calculations.yearlyAmortStandard[4].balanceRemaining)}</div>
            </div>
          )}

          {calculations.yearlyAmortStandard.length > 0 && (
            <div className="p-4 rounded-2xl bg-zinc-50/40 dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-850 space-y-2">
              <span className="font-black text-indigo-650 dark:text-indigo-400 uppercase tracking-wider text-[9px] block">Final Milestone</span>
              <div>Total Payment: {formatINR(calculations.totalPayable)}</div>
              <div>Final Balance: ₹0.00</div>
              <div className="font-bold text-emerald-500">Fully Repaid!</div>
            </div>
          )}
        </div>
      </div>

      {/* SMART INSIGHTS */}
      <div className="p-6 rounded-3xl bg-zinc-50/40 dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-800/80 space-y-3 text-xs leading-relaxed text-zinc-650 dark:text-zinc-400">
        <h4 className="font-black text-zinc-900 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
          <Info className="w-4 h-4 text-indigo-500" />
          <span>Smart Insights & Debt Analytics</span>
        </h4>
        
        <div className="space-y-2 pt-1 font-medium">
          <p>
            💡 Your total interest payment is approximately <strong>{formatINR(calculations.totalInterest)}</strong>, which constitutes <strong>{((calculations.totalInterest / calculations.totalPrincipal) * 100).toFixed(0)}%</strong> of your original borrowed sum.
          </p>
          {calculations.interestSaved > 0 && (
            <p className="text-emerald-600 dark:text-emerald-400">
              🎉 By implementing the simulated part-payments strategy, you could save approximately <strong>{formatINR(calculations.interestSaved)}</strong> in interest fees and finish the loan <strong>{calculations.tenureMonthsSaved} Months</strong> earlier.
            </p>
          )}
          {tenureType === 'years' && tenure > 15 && (
            <p className="text-amber-600 dark:text-amber-400">
              ⚠️ Your loan term is relatively long ({tenure} years). This leads to a low EMI burden, but dramatically inflates the total interest payout over the lifetime of the loan.
            </p>
          )}
        </div>
      </div>

      {/* FORMULA EXPLAIENR SECTION */}
      <details className="group p-5 rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/10 border border-zinc-200/60 dark:border-zinc-800/80 cursor-pointer">
        <summary className="flex justify-between items-center text-xs font-black text-zinc-900 dark:text-zinc-200 uppercase tracking-wider select-none list-none">
          <span>Understanding EMI Compounding Formulas</span>
          <span className="transition group-open:rotate-180">▼</span>
        </summary>
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 mt-3 text-xs leading-relaxed text-zinc-550 dark:text-zinc-400 space-y-3">
          <div>
            <p>
              Equated Monthly Installment (EMI) calculations utilize reducing-balance methodology, computed as:
            </p>
            <p className="font-mono mt-1 text-[11px] bg-zinc-100 dark:bg-zinc-950 p-3 rounded-lg border border-zinc-200/50 dark:border-zinc-900">
              EMI = P × r × (1 + r)ⁿ / [ (1 + r)ⁿ − 1 ]
            </p>
            <p className="mt-2">
              Where:
              <br />
              - <strong>P</strong> = Principal borrowed loan amount
              <br />
              - <strong>r</strong> = Monthly Interest Rate (Annual Rate / 12 / 100)
              <br />
              - <strong>n</strong> = Total number of monthly installments (Tenure in Years × 12)
            </p>
          </div>
        </div>
      </details>

      {/* Trust disclaimer */}
      <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-450 dark:text-zinc-500 leading-relaxed font-medium">
        ⚠️ <strong>Calculation Estimate Notice:</strong> Repayment figures, amortizations, and savings analytics are estimates compiled for informational guidance. Actual interest payouts, fees, taxes, and bank approvals depend on specific lender guidelines and credit checks.
      </div>
    </div>
  );
}

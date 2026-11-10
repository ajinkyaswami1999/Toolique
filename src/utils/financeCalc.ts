/**
 * Standardized Indian Financial Calculation Engine
 * Compliant with GST Act 2017, Income Tax Act (TDS rules), and RBI Banking Guidelines.
 */

export interface GstCalculationResult {
  baseAmount: number;
  gstRate: number;
  totalGst: number;
  cgst: number;
  sgst: number;
  igst: number;
  grandTotal: number;
  isInterState: boolean;
  isInclusive: boolean;
}

/**
 * Calculates GST additions and reverse GST extractions with interstate splits.
 */
export function calculateGst(
  amount: number,
  rate: number,
  isInclusive: boolean = false,
  isInterState: boolean = false
): GstCalculationResult {
  const safeAmount = Math.max(0, amount);
  const safeRate = Math.max(0, rate);

  let baseAmount = 0;
  let totalGst = 0;
  let grandTotal = 0;

  if (isInclusive) {
    // Reverse GST Formula: Base = Total * 100 / (100 + Rate)
    baseAmount = (safeAmount * 100) / (100 + safeRate);
    totalGst = safeAmount - baseAmount;
    grandTotal = safeAmount;
  } else {
    // Standard Forward GST: GST = Base * Rate / 100
    baseAmount = safeAmount;
    totalGst = (baseAmount * safeRate) / 100;
    grandTotal = baseAmount + totalGst;
  }

  const cgst = isInterState ? 0 : totalGst / 2;
  const sgst = isInterState ? 0 : totalGst / 2;
  const igst = isInterState ? totalGst : 0;

  return {
    baseAmount: Number(baseAmount.toFixed(2)),
    gstRate: safeRate,
    totalGst: Number(totalGst.toFixed(2)),
    cgst: Number(cgst.toFixed(2)),
    sgst: Number(sgst.toFixed(2)),
    igst: Number(igst.toFixed(2)),
    grandTotal: Number(grandTotal.toFixed(2)),
    isInterState,
    isInclusive,
  };
}

export interface EmiCalculationResult {
  monthlyEmi: number;
  principal: number;
  totalInterest: number;
  totalPayment: number;
  tenureMonths: number;
  annualRate: number;
}

/**
 * Calculates Reducing Balance Loan EMI as per standard banking amortization formula:
 * EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
 */
export function calculateEmi(
  principal: number,
  annualInterestRate: number,
  tenureMonths: number
): EmiCalculationResult {
  if (principal <= 0 || tenureMonths <= 0) {
    return {
      monthlyEmi: 0,
      principal: 0,
      totalInterest: 0,
      totalPayment: 0,
      tenureMonths: 0,
      annualRate: 0,
    };
  }

  const monthlyRate = annualInterestRate / (12 * 100);

  let monthlyEmi = 0;
  if (monthlyRate === 0) {
    monthlyEmi = principal / tenureMonths;
  } else {
    const factor = Math.pow(1 + monthlyRate, tenureMonths);
    monthlyEmi = (principal * monthlyRate * factor) / (factor - 1);
  }

  const roundedEmi = Math.round(monthlyEmi);
  const totalPayment = roundedEmi * tenureMonths;
  const totalInterest = totalPayment - Math.round(principal);

  return {
    monthlyEmi: roundedEmi,
    principal: Math.round(principal),
    totalInterest: Math.round(totalInterest),
    totalPayment: Math.round(totalPayment),
    tenureMonths,
    annualRate: annualInterestRate,
  };
}

export interface SipCalculationResult {
  monthlyInvestment: number;
  totalInvested: number;
  estimatedReturns: number;
  maturityValue: number;
  tenureYears: number;
  annualExpectedReturn: number;
}

/**
 * Calculates Mutual Fund SIP Future Value:
 * FV = P * [((1 + i)^n - 1) / i] * (1 + i)
 */
export function calculateSip(
  monthlyInvestment: number,
  annualExpectedReturn: number,
  tenureYears: number
): SipCalculationResult {
  if (monthlyInvestment <= 0 || tenureYears <= 0) {
    return {
      monthlyInvestment: 0,
      totalInvested: 0,
      estimatedReturns: 0,
      maturityValue: 0,
      tenureYears: 0,
      annualExpectedReturn: 0,
    };
  }

  const months = tenureYears * 12;
  const monthlyRate = annualExpectedReturn / (12 * 100);
  const totalInvested = monthlyInvestment * months;

  let maturityValue = 0;
  if (monthlyRate === 0) {
    maturityValue = totalInvested;
  } else {
    maturityValue =
      monthlyInvestment *
      ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
      (1 + monthlyRate);
  }

  const estimatedReturns = maturityValue - totalInvested;

  return {
    monthlyInvestment: Math.round(monthlyInvestment),
    totalInvested: Math.round(totalInvested),
    estimatedReturns: Math.round(estimatedReturns),
    maturityValue: Math.round(maturityValue),
    tenureYears,
    annualExpectedReturn,
  };
}

export interface CagrCalculationResult {
  initialValue: number;
  finalValue: number;
  periodYears: number;
  cagrPercentage: number;
  absoluteReturnPercentage: number;
}

/**
 * Calculates Compound Annual Growth Rate (CAGR):
 * CAGR = (Final Value / Initial Value) ^ (1 / Years) - 1
 */
export function calculateCagr(
  initialValue: number,
  finalValue: number,
  periodYears: number
): CagrCalculationResult {
  if (initialValue <= 0 || periodYears <= 0 || finalValue < 0) {
    return {
      initialValue,
      finalValue,
      periodYears,
      cagrPercentage: 0,
      absoluteReturnPercentage: 0,
    };
  }

  const cagr = Math.pow(finalValue / initialValue, 1 / periodYears) - 1;
  const absoluteReturn = ((finalValue - initialValue) / initialValue) * 100;

  return {
    initialValue,
    finalValue,
    periodYears,
    cagrPercentage: Number((cagr * 100).toFixed(2)),
    absoluteReturnPercentage: Number(absoluteReturn.toFixed(2)),
  };
}

export interface TdsCalculationResult {
  grossAmount: number;
  section: string;
  tdsRate: number;
  tdsAmount: number;
  netPayable: number;
  isBelowThreshold: boolean;
  threshold: number;
}

/**
 * Indian Income Tax TDS Calculation Engine.
 */
export function calculateTds(
  grossAmount: number,
  section: '194C' | '194J-Prof' | '194J-Tech' | '194I-Rent' | '194I-Mach' | '194H',
  payeeType: 'individual' | 'company' = 'individual',
  panAvailable: boolean = true
): TdsCalculationResult {
  const rules = {
    '194C': { rates: { individual: 1, company: 2 }, threshold: 30000 },
    '194J-Prof': { rates: { individual: 10, company: 10 }, threshold: 30000 },
    '194J-Tech': { rates: { individual: 2, company: 2 }, threshold: 30000 },
    '194I-Rent': { rates: { individual: 10, company: 10 }, threshold: 240000 },
    '194I-Mach': { rates: { individual: 2, company: 2 }, threshold: 240000 },
    '194H': { rates: { individual: 5, company: 5 }, threshold: 15000 },
  };

  const selectedRule = rules[section];
  const isBelowThreshold = grossAmount < selectedRule.threshold;

  let effectiveRate = isBelowThreshold
    ? 0
    : payeeType === 'individual'
    ? selectedRule.rates.individual
    : selectedRule.rates.company;

  // Section 206AA: Higher rate of 20% if PAN not furnished and above threshold
  if (!panAvailable && !isBelowThreshold) {
    effectiveRate = Math.max(20, effectiveRate);
  }

  const tdsAmount = (grossAmount * effectiveRate) / 100;
  const netPayable = grossAmount - tdsAmount;

  return {
    grossAmount,
    section,
    tdsRate: effectiveRate,
    tdsAmount: Math.round(tdsAmount),
    netPayable: Math.round(netPayable),
    isBelowThreshold,
    threshold: selectedRule.threshold,
  };
}

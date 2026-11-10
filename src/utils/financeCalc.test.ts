import { describe, it, expect } from 'vitest';
import {
  calculateGst,
  calculateEmi,
  calculateSip,
  calculateCagr,
  calculateTds,
} from './financeCalc';

describe('Financial & Taxation Benchmark Suite (GST Act, IT Act, RBI Amortization)', () => {
  describe('GST Engine (Forward & Reverse GST)', () => {
    it('calculates forward GST at 18% slab for intra-state supply', () => {
      const res = calculateGst(10000, 18, false, false);

      expect(res.baseAmount).toBe(10000);
      expect(res.totalGst).toBe(1800);
      expect(res.cgst).toBe(900); // 9% Central GST
      expect(res.sgst).toBe(900); // 9% State GST
      expect(res.igst).toBe(0);
      expect(res.grandTotal).toBe(11800);
    });

    it('calculates forward GST at 28% slab for inter-state supply (IGST)', () => {
      const res = calculateGst(50000, 28, false, true);

      expect(res.baseAmount).toBe(50000);
      expect(res.totalGst).toBe(14000);
      expect(res.cgst).toBe(0);
      expect(res.sgst).toBe(0);
      expect(res.igst).toBe(14000); // 100% IGST to Central
      expect(res.grandTotal).toBe(64000);
    });

    it('calculates Reverse GST (extract tax from inclusive amount)', () => {
      // If customer paid ₹11,800 inclusive of 18% GST:
      // Base = 11,800 * 100 / 118 = 10,000
      // Tax = 1,800
      const res = calculateGst(11800, 18, true, false);

      expect(res.baseAmount).toBe(10000);
      expect(res.totalGst).toBe(1800);
      expect(res.cgst).toBe(900);
      expect(res.sgst).toBe(900);
      expect(res.grandTotal).toBe(11800);
    });

    it('handles 0% GST and edge case 0 amounts', () => {
      const res = calculateGst(0, 18);
      expect(res.totalGst).toBe(0);
      expect(res.grandTotal).toBe(0);

      const zeroRate = calculateGst(1000, 0);
      expect(zeroRate.totalGst).toBe(0);
      expect(zeroRate.grandTotal).toBe(1000);
    });
  });

  describe('Loan EMI Engine (Reducing Balance Amortization)', () => {
    it('calculates Home Loan EMI against standard banking benchmark: ₹50 Lakh @ 8.5% for 20 years', () => {
      // 5,000,000 principal, 8.5% p.a., 240 months
      const res = calculateEmi(5000000, 8.5, 240);

      // Standard banking EMI ≈ ₹43,391/month
      expect(res.monthlyEmi).toBeCloseTo(43391, -1);
      expect(res.totalPayment).toBe(res.monthlyEmi * 240);
      expect(res.totalInterest).toBe(res.totalPayment - 5000000);
    });

    it('calculates Car Loan EMI: ₹10 Lakh @ 9% for 5 years (60 months)', () => {
      const res = calculateEmi(1000000, 9, 60);

      // Standard banking EMI ≈ ₹20,758/month
      expect(res.monthlyEmi).toBeCloseTo(20758, -1);
      expect(res.totalPayment).toBeGreaterThan(1000000);
    });

    it('handles zero interest loan (0% interest installment)', () => {
      const res = calculateEmi(120000, 0, 12);

      expect(res.monthlyEmi).toBe(10000);
      expect(res.totalInterest).toBe(0);
      expect(res.totalPayment).toBe(120000);
    });
  });

  describe('Mutual Fund SIP Wealth Accumulation Engine', () => {
    it('calculates SIP of ₹10,000/month @ 12% expected annual return for 10 years', () => {
      const res = calculateSip(10000, 12, 10);

      // Total invested = 10,000 * 120 = ₹12,00,000
      expect(res.totalInvested).toBe(1200000);
      // FV formula ≈ ₹23,23,391
      expect(res.maturityValue).toBeCloseTo(2323391, -2);
      expect(res.estimatedReturns).toBe(res.maturityValue - res.totalInvested);
    });

    it('calculates 1-year short-term SIP with compound interest', () => {
      const res = calculateSip(5000, 10, 1);
      expect(res.totalInvested).toBe(60000);
      expect(res.maturityValue).toBeGreaterThan(60000);
    });
  });

  describe('CAGR Calculation Engine', () => {
    it('calculates CAGR for investment doubling in 5 years (100k -> 200k)', () => {
      // Doubling in 5 years: (2)^(1/5) - 1 ≈ 14.87%
      const res = calculateCagr(100000, 200000, 5);

      expect(res.cagrPercentage).toBeCloseTo(14.87, 1);
      expect(res.absoluteReturnPercentage).toBe(100);
    });

    it('calculates negative CAGR for loss-making asset', () => {
      const res = calculateCagr(100000, 50000, 3);
      expect(res.cagrPercentage).toBeLessThan(0);
      expect(res.absoluteReturnPercentage).toBe(-50);
    });
  });

  describe('Indian Income Tax TDS Engine', () => {
    it('calculates Section 194C (Contractor) TDS: 1% individual, threshold ₹30,000', () => {
      // Below threshold: ₹25,000 -> 0 TDS
      const below = calculateTds(25000, '194C', 'individual', true);
      expect(below.isBelowThreshold).toBe(true);
      expect(below.tdsAmount).toBe(0);
      expect(below.netPayable).toBe(25000);

      // Above threshold: ₹50,000 -> 1% = ₹500
      const above = calculateTds(50000, '194C', 'individual', true);
      expect(above.isBelowThreshold).toBe(false);
      expect(above.tdsRate).toBe(1);
      expect(above.tdsAmount).toBe(500);
      expect(above.netPayable).toBe(49500);

      // Company contractor: 2%
      const company = calculateTds(50000, '194C', 'company', true);
      expect(company.tdsRate).toBe(2);
      expect(company.tdsAmount).toBe(1000);
    });

    it('calculates Section 194J (Professional fees) TDS: 10%', () => {
      const res = calculateTds(100000, '194J-Prof', 'individual', true);
      expect(res.tdsRate).toBe(10);
      expect(res.tdsAmount).toBe(10000);
      expect(res.netPayable).toBe(90000);
    });

    it('enforces Section 206AA penal rate of 20% when PAN is not provided', () => {
      // Normal 194C is 1%, but without PAN it must be flat 20%
      const noPan = calculateTds(50000, '194C', 'individual', false);
      expect(noPan.tdsRate).toBe(20);
      expect(noPan.tdsAmount).toBe(10000);
      expect(noPan.netPayable).toBe(40000);
    });
  });
});

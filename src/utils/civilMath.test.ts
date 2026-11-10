import { describe, it, expect } from 'vitest';
import {
  DRY_VOLUME_FACTOR_CONCRETE,
  DRY_VOLUME_FACTOR_MORTAR,
  DRY_VOLUME_FACTOR_PLASTER,
  CFT_PER_CUM,
  CUM_PER_CFT,
  CFT_PER_BRASS,
  CUM_PER_BRASS,
  SQFT_PER_SQM,
  SQM_PER_SQFT,
  CEMENT_BAG_WEIGHT_KG,
  CEMENT_BAG_VOLUME_M3,
  STEEL_DENSITY_KG_M3,
  STEEL_REBAR_FACTOR,
  STEEL_REBAR_DIVISOR,
  cumToCft,
  cftToCum,
  cftToBrass,
  brassToCft,
  brassToCum,
  cumToBrass,
  sqmToSqft,
  sqftToSqm,
  wetToDryVolumeConcrete,
  wetToDryVolumeMortar,
  calculateCementBags,
  calculateRebarUnitWeight,
  calculateRebarWeight,
  CIVIL_CONCRETE_MIXES,
} from './civilMath';

describe('Civil & Structural Math Engine (IS 456, IS 1786, IS 1200)', () => {
  describe('Indian Standard Constants Verification', () => {
    it('verifies IS 456 dry volume factors', () => {
      expect(DRY_VOLUME_FACTOR_CONCRETE).toBe(1.54);
      expect(DRY_VOLUME_FACTOR_MORTAR).toBe(1.33);
      expect(DRY_VOLUME_FACTOR_PLASTER).toBe(1.60);
    });

    it('verifies Brass, CFT, and CUM volume conversions', () => {
      expect(CFT_PER_BRASS).toBe(100);
      expect(CFT_PER_CUM).toBeCloseTo(35.3147, 4);
      expect(CUM_PER_CFT).toBeCloseTo(0.0283168, 6);
      expect(CUM_PER_BRASS).toBeCloseTo(2.83168, 4);
    });

    it('verifies Area conversion constants (sqm <-> sqft)', () => {
      expect(SQFT_PER_SQM).toBeCloseTo(10.7639, 4);
      expect(SQM_PER_SQFT).toBeCloseTo(0.092903, 5);
      expect(SQFT_PER_SQM * SQM_PER_SQFT).toBeCloseTo(1, 4);
    });

    it('verifies Cement physical properties', () => {
      expect(CEMENT_BAG_WEIGHT_KG).toBe(50);
      // Volume = 50kg / 1440 kg/m3 ≈ 0.03472 m3
      expect(CEMENT_BAG_VOLUME_M3).toBeCloseTo(50 / 1440, 4);
    });

    it('verifies Steel rebar physical constants (IS 1786)', () => {
      expect(STEEL_DENSITY_KG_M3).toBe(7850);
      expect(STEEL_REBAR_FACTOR).toBeCloseTo(162.28, 2);
      expect(STEEL_REBAR_DIVISOR).toBe(162);
    });
  });

  describe('Volumetric Conversion Utility Functions', () => {
    it('accurately converts CUM to CFT and Brass', () => {
      const volCum = 10;
      expect(cumToCft(volCum)).toBeCloseTo(353.147, 2);
      expect(cumToBrass(volCum)).toBeCloseTo(3.53147, 3);
      expect(cftToBrass(cumToCft(volCum))).toBeCloseTo(cumToBrass(volCum), 4);
    });

    it('accurately converts Brass to CFT and CUM', () => {
      const brass = 5; // 500 cft
      expect(brassToCft(brass)).toBe(500);
      expect(brassToCum(brass)).toBeCloseTo(5 * 2.83168, 3);
      expect(cftToCum(brassToCft(brass))).toBeCloseTo(brassToCum(brass), 3);
    });

    it('accurately converts area between sqm and sqft', () => {
      const sqm = 100;
      expect(sqmToSqft(sqm)).toBeCloseTo(1076.39, 2);
      expect(sqftToSqm(sqmToSqft(sqm))).toBeCloseTo(100, 3);
    });
  });

  describe('Concrete & Mortar Material Estimations', () => {
    it('computes dry volume from wet volume with 1.54 multiplier', () => {
      expect(wetToDryVolumeConcrete(10)).toBe(15.4);
      expect(wetToDryVolumeMortar(10)).toBe(13.3);
    });

    it('calculates cement bags with ceiling rounding for 50kg packing', () => {
      // 0.385 m3 cement / 0.03472 ≈ 11.08 -> ceil to 12 bags
      expect(calculateCementBags(0.385)).toBe(12);
      // 0 m3 returns 0 bags
      expect(calculateCementBags(0)).toBe(0);
    });
  });

  describe('Steel Rebar Theoretical Unit Weight (IS 1786)', () => {
    it('calculates theoretical unit weight per meter (D^2 / 162.28)', () => {
      // Standard rebar diameters: 8, 10, 12, 16, 20, 25, 32 mm
      expect(calculateRebarUnitWeight(8)).toBeCloseTo(0.394, 2);
      expect(calculateRebarUnitWeight(10)).toBeCloseTo(0.616, 2);
      expect(calculateRebarUnitWeight(12)).toBeCloseTo(0.887, 2);
      expect(calculateRebarUnitWeight(16)).toBeCloseTo(1.578, 2);
      expect(calculateRebarUnitWeight(20)).toBeCloseTo(2.465, 2);
      expect(calculateRebarUnitWeight(25)).toBeCloseTo(3.851, 2);
      expect(calculateRebarUnitWeight(32)).toBeCloseTo(6.310, 2);
    });

    it('calculates total weight for steel reinforcement schedules', () => {
      // 100 pieces of 12mm bar each 12m length (standard commercial length)
      const res = calculateRebarWeight(12, 12, 100);
      // Total length = 1200 m, unit weight ≈ 0.8874 kg/m -> Total ≈ 1064.9 kg
      expect(res.weightKg).toBeCloseTo(1064.83, 0);
      expect(res.weightTonnes).toBeCloseTo(1.0648, 2);
    });

    it('supports D^2 / 162 rule of thumb divisor override', () => {
      const weight162 = calculateRebarUnitWeight(10, 162);
      expect(weight162).toBeCloseTo(100 / 162, 3);
    });
  });

  describe('Standard Concrete Mix Grades (IS 456)', () => {
    it('verifies standard M20 nominal mix proportions (1:1.5:3)', () => {
      const m20 = CIVIL_CONCRETE_MIXES.M20;
      expect(m20.cement).toBe(1);
      expect(m20.sand).toBe(1.5);
      expect(m20.aggregate).toBe(3);
      expect(m20.characteristicStrengthMpa).toBe(20);
    });

    it('verifies standard M25 structural mix proportions (1:1:2)', () => {
      const m25 = CIVIL_CONCRETE_MIXES.M25;
      expect(m25.cement).toBe(1);
      expect(m25.sand).toBe(1);
      expect(m25.aggregate).toBe(2);
      expect(m25.characteristicStrengthMpa).toBe(25);
    });
  });
});

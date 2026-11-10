import { describe, it, expect } from 'vitest';
import {
  estimateConcreteMaterials,
  estimateBrickworkMaterials,
  estimatePlasterMaterials,
  estimateSteelWeight,
  estimateFlooringMaterials,
  estimatePaintingMaterials,
} from './boqMaterialEstimation';

describe('Civil & Structural Estimation Engine (IS 456:2000 & IS 1786:2008)', () => {
  describe('Concrete Material Estimation (IS 456:2000)', () => {
    it('calculates M20 grade (1:1.5:3) nominal mix for 10 cum wet concrete', () => {
      const result = estimateConcreteMaterials(10, 'cum', 'm20', true, 80);

      // Dry volume factor = 1.54 -> Dry volume = 15.4 m3
      // Mix ratio = 1 + 1.5 + 3 = 5.5 parts
      // Cement volume = 15.4 * (1 / 5.5) = 2.8 m3
      // Cement bags = 2.8 / 0.03472 ≈ 80.64 -> ceil to 81 bags
      expect(result.cementBags).toBe(81);
      expect(result.cementKg).toBe(81 * 50);

      // Sand volume = 15.4 * (1.5 / 5.5) = 4.2 m3 -> * 35.3147 ≈ 148.32 cft
      expect(result.sandCft).toBeCloseTo(148.32, 1);
      expect(result.sandBrass).toBeCloseTo(1.483, 2);

      // Coarse Aggregate volume = 15.4 * (3 / 5.5) = 8.4 m3 -> * 35.3147 ≈ 296.64 cft
      expect(result.aggregateCft).toBeCloseTo(296.64, 1);
      // Grading: 60% 20mm + 40% 10mm
      expect(result.aggregate20mmCft).toBeCloseTo(296.64 * 0.6, 1);
      expect(result.aggregate10mmCft).toBeCloseTo(296.64 * 0.4, 1);

      // Steel: 10 cum * 80 kg/cum = 800 kg = 0.8 tonnes
      expect(result.steelKg).toBe(800);
      expect(result.steelTonnes).toBe(0.8);
    });

    it('calculates M25 grade (1:1:2) structural mix for 1 cum wet concrete', () => {
      const result = estimateConcreteMaterials(1, 'cum', 'm25', false);

      // Dry volume = 1.54 m3, sumParts = 4
      // Cement volume = 1.54 / 4 = 0.385 m3 -> bags = 0.385 / 0.03472 ≈ 11.08 -> 12 bags
      expect(result.cementBags).toBe(12);
      expect(result.sandM3).toBeCloseTo(0.385, 3);
      expect(result.steelKg).toBe(0);
    });

    it('correctly handles volume given in CFT units', () => {
      // 353.147 cft ≈ 10 cum
      const result = estimateConcreteMaterials(353.147, 'cft', 'm20');
      expect(result.cementBags).toBe(81);
    });
  });

  describe('Brickwork Estimation (IS 2212 & CPWD Specifications)', () => {
    it('estimates standard clay bricks (230x110x75 mm) in 10 cum masonry with 1:6 mortar', () => {
      const result = estimateBrickworkMaterials(10, 'cum', 'standard', '1_6');

      // Standard bricks: 412 bricks/cum -> 10 * 412 = 4120 bricks
      expect(result.brickCount).toBe(4120);
      // Mortar volume = 25% of 10 cum = 2.5 cum
      expect(result.mortarVolumeCum).toBe(2.5);
      expect(result.cementBags).toBeGreaterThan(0);
      expect(result.sandCft).toBeGreaterThan(0);
    });

    it('estimates modular bricks (190x90x90 mm) with 500 bricks per cum benchmark', () => {
      const result = estimateBrickworkMaterials(5, 'cum', 'modular', '1_4');

      expect(result.brickCount).toBe(2500); // 500 * 5
      expect(result.mortarVolumeCum).toBe(1.5); // 30% of 5 cum
    });

    it('estimates AAC block masonry with reduced joint thickness', () => {
      const result = estimateBrickworkMaterials(10, 'cum', 'aac_block');
      // AAC blocks (600x200x150 mm) are approx 56 blocks per m3
      expect(result.brickCount).toBe(560);
    });
  });

  describe('Plaster Material Estimation', () => {
    it('estimates 12mm internal wall plaster (1:4 mortar) for 100 sqm surface', () => {
      const result = estimatePlasterMaterials(100, 'sqm', 12, '1_4');

      // Wet volume = 100 * 0.012 = 1.2 cum
      // Dry volume with 1.33 factor + 20% filling uneven joints = 1.2 * 1.33 * 1.20 ≈ 1.915 cum
      expect(result.cementBags).toBeGreaterThan(10);
      expect(result.sandCft).toBeGreaterThan(40);
    });
  });

  describe('Steel Rebar Unit Weight (IS 1786:2008)', () => {
    it('calculates theoretical unit weight per meter: d^2 / 162.28', () => {
      // 8mm bar: 8^2 / 162.28 ≈ 0.394 kg/m
      const steel8 = estimateSteelWeight(8, 100);
      expect(steel8.weightKg).toBeCloseTo(39.4, 0);

      // 10mm bar: 10^2 / 162.28 ≈ 0.616 kg/m
      const steel10 = estimateSteelWeight(10, 100);
      expect(steel10.weightKg).toBeCloseTo(61.6, 0);

      // 12mm bar: 12^2 / 162.28 ≈ 0.888 kg/m
      const steel12 = estimateSteelWeight(12, 100);
      expect(steel12.weightKg).toBeCloseTo(88.8, 0);

      // 16mm bar: 16^2 / 162.28 ≈ 1.578 kg/m
      const steel16 = estimateSteelWeight(16, 100);
      expect(steel16.weightKg).toBeCloseTo(157.8, 0);

      // 20mm bar: 20^2 / 162.28 ≈ 2.466 kg/m
      const steel20 = estimateSteelWeight(20, 100);
      expect(steel20.weightKg).toBeCloseTo(246.6, 0);

      // 25mm bar: 25^2 / 162.28 ≈ 3.854 kg/m
      const steel25 = estimateSteelWeight(25, 100);
      expect(steel25.weightKg).toBeCloseTo(385.4, 0);
    });
  });

  describe('Flooring & Painting Estimations', () => {
    it('estimates vitrified tiles (600x600 mm) with 5% cutting wastage', () => {
      const result = estimateFlooringMaterials(1000, 'sqft', '600x600_vitrified', 5);
      expect(result.tileCount).toBeGreaterThan(0);
      expect(result.totalTileAreaSqft).toBeCloseTo(1050, 0); // 1000 sqft + 5% wastage
    });

    it('estimates interior plastic emulsion paint coverage with 2 coats', () => {
      const result = estimatePaintingMaterials(1000, 'sqft', 'interior_emulsion', 2);
      expect(result.paintLitres).toBeGreaterThan(0);
      expect(result.primerLitres).toBeGreaterThan(0);
    });
  });
});

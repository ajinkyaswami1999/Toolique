import { describe, it, expect } from 'vitest';
import {
  solveLinear,
  solveQuadratic,
  solveSimultaneous,
  calculateTrig,
} from './mathCalc';

describe('Algebraic & Mathematical Benchmark Suite', () => {
  describe('Linear Equation Solver (ax + b = 0)', () => {
    it('solves simple linear equation: 2x - 10 = 0 -> x = 5', () => {
      const res = solveLinear(2, -10);
      expect(res.root).toBe(5);
    });

    it('solves linear equation with fractional root: 3x + 1 = 0 -> x = -0.3333', () => {
      const res = solveLinear(3, 1);
      expect(res.root).toBeCloseTo(-1 / 3, 4);
    });

    it('identifies infinite solutions when a = 0 and b = 0', () => {
      const res = solveLinear(0, 0);
      expect(res.root).toBeNull();
      expect(res.equationText).toContain('infinite solutions');
    });

    it('identifies no solution when a = 0 and b != 0', () => {
      const res = solveLinear(0, 5);
      expect(res.root).toBeNull();
      expect(res.equationText).toContain('no solution');
    });
  });

  describe('Quadratic Equation Solver (ax² + bx + c = 0)', () => {
    it('solves two distinct real roots (D > 0): x² - 5x + 6 = 0 -> x = 3, 2', () => {
      const res = solveQuadratic(1, -5, 6);

      expect(res.discriminant).toBe(1);
      expect(res.roots.length).toBe(2);
      expect(res.roots[0].real).toBe(3);
      expect(res.roots[0].imag).toBe(0);
      expect(res.roots[1].real).toBe(2);
      expect(res.roots[1].imag).toBe(0);
    });

    it('solves double root (D = 0): x² - 4x + 4 = 0 -> x = 2 (repeated)', () => {
      const res = solveQuadratic(1, -4, 4);

      expect(res.discriminant).toBe(0);
      expect(res.roots.length).toBe(1);
      expect(res.roots[0].real).toBe(2);
      expect(res.roots[0].imag).toBe(0);
    });

    it('solves complex conjugate roots (D < 0): x² + 1 = 0 -> x = ± i', () => {
      const res = solveQuadratic(1, 0, 1);

      expect(res.discriminant).toBe(-4);
      expect(res.roots.length).toBe(2);
      expect(res.roots[0].real).toBe(0);
      expect(res.roots[0].imag).toBe(1); // +1i
      expect(res.roots[1].real).toBe(0);
      expect(res.roots[1].imag).toBe(-1); // -1i
    });

    it('gracefully degrades to linear solver when a = 0', () => {
      const res = solveQuadratic(0, 2, -8);
      expect(res.roots[0].real).toBe(4);
    });
  });

  describe('Simultaneous 2-Variable Linear Systems (Cramer\'s Rule)', () => {
    it('solves 2x + y = 7 and x - y = 2 -> x = 3, y = 1', () => {
      // Equation 1: 2x + 1y = 7
      // Equation 2: 1x - 1y = 2
      const res = solveSimultaneous(2, 1, 7, 1, -1, 2);

      expect(res.determinant).toBe(-3);
      expect(res.x).toBeCloseTo(3, 4);
      expect(res.y).toBeCloseTo(1, 4);
    });

    it('identifies parallel or coincident lines when determinant = 0', () => {
      // 2x + 4y = 8 and 1x + 2y = 4 -> parallel / coincident (D = 0)
      const res = solveSimultaneous(2, 4, 8, 1, 2, 4);
      expect(res.determinant).toBe(0);
      expect(res.x).toBeNull();
      expect(res.y).toBeNull();
    });
  });

  describe('Trigonometric Evaluation Engine', () => {
    it('evaluates sin, cos, tan accurately for standard angles in degrees', () => {
      const deg30 = calculateTrig(30, 'deg');
      expect(deg30.sin).toBeCloseTo(0.5, 4);
      expect(deg30.cos).toBeCloseTo(Math.sqrt(3) / 2, 4);
      expect(deg30.tan).toBeCloseTo(1 / Math.sqrt(3), 4);

      const deg90 = calculateTrig(90, 'deg');
      expect(deg90.sin).toBeCloseTo(1, 4);
      expect(deg90.cos).toBeCloseTo(0, 4);
      expect(deg90.tan).toBeNull(); // undefined at 90 deg
    });

    it('evaluates angles in radians', () => {
      const piOver2 = calculateTrig(Math.PI / 2, 'rad');
      expect(piOver2.sin).toBeCloseTo(1, 4);
      expect(piOver2.cos).toBeCloseTo(0, 4);
    });
  });
});

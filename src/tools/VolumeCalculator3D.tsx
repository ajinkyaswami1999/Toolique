/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from 'react';
import {
  RotateCcw,
  Copy,
  Check,
  Box,
  Layers,
  Sparkles,
  Info,
  Download,
  Scale,
  Droplets,
  Ruler,
  Compass
} from 'lucide-react';

// Shape Types
export type ShapeCategory = 'curved' | 'prisms' | 'pyramids' | 'tanks';

export type ShapeId =
  | 'cylinder'
  | 'pipe'
  | 'cone'
  | 'frustum_cone'
  | 'sphere'
  | 'spherical_shell'
  | 'hemisphere'
  | 'spherical_cap'
  | 'torus'
  | 'ellipsoid'
  | 'cube'
  | 'cuboid'
  | 'triangular_prism'
  | 'hexagonal_prism'
  | 'tetrahedron'
  | 'pyramid_rect'
  | 'square_frustum'
  | 'tank_horizontal'
  | 'silo';

// Length Units
export type LengthUnit = 'm' | 'cm' | 'mm' | 'in' | 'ft' | 'yd';

// Material Densities (kg / m³)
export interface MaterialOption {
  id: string;
  name: string;
  density: number; // kg/m³
  category: string;
}

const MATERIALS: MaterialOption[] = [
  { id: 'water', name: 'Water (Fresh, 20°C)', density: 998.2, category: 'Liquids' },
  { id: 'seawater', name: 'Sea Water', density: 1025, category: 'Liquids' },
  { id: 'gasoline', name: 'Gasoline / Petrol', density: 740, category: 'Liquids' },
  { id: 'diesel', name: 'Diesel Fuel', density: 830, category: 'Liquids' },
  { id: 'concrete', name: 'Reinforced Concrete', density: 2400, category: 'Construction' },
  { id: 'steel', name: 'Structural Steel', density: 7850, category: 'Metals' },
  { id: 'aluminum', name: 'Aluminum (6061)', density: 2700, category: 'Metals' },
  { id: 'copper', name: 'Pure Copper', density: 8960, category: 'Metals' },
  { id: 'brass', name: 'Brass (Cartridge)', density: 8500, category: 'Metals' },
  { id: 'cast_iron', name: 'Cast Iron', density: 7200, category: 'Metals' },
  { id: 'gold', name: 'Pure Gold (24k)', density: 19320, category: 'Precious' },
  { id: 'oak', name: 'Oak Wood (Dry)', density: 750, category: 'Timber' },
  { id: 'pine', name: 'Pine Wood (Dry)', density: 500, category: 'Timber' },
  { id: 'pla', name: 'PLA 3D Filament', density: 1240, category: 'Polymers' },
  { id: 'petg', name: 'PETG Filament', density: 1270, category: 'Polymers' },
  { id: 'sand', name: 'Dry Silica Sand', density: 1600, category: 'Earth' },
  { id: 'gravel', name: 'Loose Gravel', density: 1680, category: 'Earth' }
];

// Unit Conversion factors to METERS (m)
const TO_METERS: Record<LengthUnit, number> = {
  m: 1,
  cm: 0.01,
  mm: 0.001,
  in: 0.0254,
  ft: 0.3048,
  yd: 0.9144
};

export default function VolumeCalculator3D() {
  const [category, setCategory] = useState<ShapeCategory>('curved');
  const [shape, setShape] = useState<ShapeId>('cylinder');
  const [unit, setUnit] = useState<LengthUnit>('m');

  // Dimensional Inputs (in selected `unit`)
  const [dimR, setDimR] = useState<number>(1.5); // Primary Radius / Half width
  const [dimR2, setDimR2] = useState<number>(0.9); // Secondary Radius / Inner radius / Top radius
  const [dimH, setDimH] = useState<number>(4.0); // Height / Length
  const [dimL, setDimL] = useState<number>(5.0); // Length / Base length
  const [dimW, setDimW] = useState<number>(3.0); // Width / Base width
  const [dimC, setDimC] = useState<number>(1.2); // Z-axis semi-axis (Ellipsoid)
  const [dimH2, setDimH2] = useState<number>(1.5); // Secondary height (Silo hopper)
  const [fillLevel, setFillLevel] = useState<number>(2.0); // Liquid depth in tank

  // Selected Material for Mass Calculation
  const [selectedMaterial, setSelectedMaterial] = useState<string>('water');

  // Copy Feedback
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  // Preset Loaders
  const loadShapePreset = (s: ShapeId, cat: ShapeCategory) => {
    setCategory(cat);
    setShape(s);
    setUnit('m');
    switch (s) {
      case 'cylinder':
        setDimR(1.0);
        setDimH(3.0);
        break;
      case 'pipe':
        setDimR(1.0);
        setDimR2(0.8);
        setDimH(5.0);
        break;
      case 'cone':
        setDimR(1.5);
        setDimH(3.5);
        break;
      case 'frustum_cone':
        setDimR(2.0);
        setDimR2(1.0);
        setDimH(3.0);
        break;
      case 'sphere':
        setDimR(1.5);
        break;
      case 'spherical_shell':
        setDimR(1.5);
        setDimR2(1.2);
        break;
      case 'hemisphere':
        setDimR(2.0);
        break;
      case 'spherical_cap':
        setDimR(2.5); // Sphere radius R
        setDimH(1.0); // Cap height h
        break;
      case 'torus':
        setDimR(3.0); // Major R
        setDimR2(0.8); // Minor r
        break;
      case 'ellipsoid':
        setDimR(2.5); // a
        setDimW(1.8); // b
        setDimC(1.2); // c
        break;
      case 'cube':
        setDimL(2.0);
        break;
      case 'cuboid':
        setDimL(4.0);
        setDimW(2.5);
        setDimH(1.8);
        break;
      case 'triangular_prism':
        setDimW(2.0); // base width
        setDimH(1.5); // triangle height
        setDimL(4.0); // prism length
        break;
      case 'hexagonal_prism':
        setDimR(1.5); // side length a
        setDimH(4.0);
        break;
      case 'tetrahedron':
        setDimL(3.0); // edge length
        break;
      case 'pyramid_rect':
        setDimL(4.0);
        setDimW(3.0);
        setDimH(3.5);
        break;
      case 'square_frustum':
        setDimL(4.0); // bottom edge a
        setDimW(2.0); // top edge b
        setDimH(3.0); // height
        break;
      case 'tank_horizontal':
        setDimR(1.2); // Tank radius
        setDimH(4.0); // Tank length
        setFillLevel(1.5); // Dipstick depth
        break;
      case 'silo':
        setDimR(2.0); // Silo radius
        setDimH(6.0); // Cylinder height
        setDimH2(2.5); // Cone hopper height
        break;
    }
  };

  // Convert input value from selected `unit` to standard SI `meters (m)`
  const toMeters = (val: number) => Math.max(0, val * (TO_METERS[unit] || 1));

  // Main Volumetric & Geometric Calculations (SI Base: Meters)
  const calc = useMemo(() => {
    const PI = Math.PI;
    const r_m = toMeters(dimR);
    const r2_m = toMeters(dimR2);
    const h_m = toMeters(dimH);
    const l_m = toMeters(dimL);
    const w_m = toMeters(dimW);
    const c_m = toMeters(dimC);
    const h2_m = toMeters(dimH2);
    const fill_m = Math.min(2 * r_m, toMeters(fillLevel));

    let volume_m3 = 0;
    let surfaceArea_m2 = 0;
    let lateralArea_m2 = 0;
    let baseArea_m2 = 0;
    let slantHeight_m = 0;
    let spaceDiagonal_m = 0;
    let liquidVolume_m3 = 0;
    let liquidFillPercent = 0;
    let formulaLaTeX = '';
    const derivationSteps: string[] = [];

    switch (shape) {
      case 'cylinder': {
        volume_m3 = PI * r_m * r_m * h_m;
        baseArea_m2 = PI * r_m * r_m;
        lateralArea_m2 = 2 * PI * r_m * h_m;
        surfaceArea_m2 = 2 * baseArea_m2 + lateralArea_m2;
        formulaLaTeX = `V = \\pi r^2 h = \\pi \\cdot (${dimR})^2 \\cdot (${dimH})`;
        derivationSteps.push(`Base Area A_b = π · r² = π · (${dimR} ${unit})² = ${((baseArea_m2) / (TO_METERS[unit] ** 2)).toFixed(4)} ${unit}²`);
        derivationSteps.push(`Lateral Area A_L = 2π · r · h = 2π · (${dimR}) · (${dimH}) = ${(lateralArea_m2 / (TO_METERS[unit] ** 2)).toFixed(4)} ${unit}²`);
        derivationSteps.push(`Total Surface Area A = 2·A_b + A_L = ${(surfaceArea_m2 / (TO_METERS[unit] ** 2)).toFixed(4)} ${unit}²`);
        derivationSteps.push(`Volume V = A_b · h = ${(volume_m3 / (TO_METERS[unit] ** 3)).toFixed(4)} ${unit}³`);
        break;
      }
      case 'pipe': {
        const outerR = Math.max(r_m, r2_m);
        const innerR = Math.min(r_m, r2_m);
        volume_m3 = PI * (outerR * outerR - innerR * innerR) * h_m;
        const innerVol = PI * innerR * innerR * h_m;
        baseArea_m2 = PI * (outerR * outerR - innerR * innerR);
        lateralArea_m2 = 2 * PI * outerR * h_m + 2 * PI * innerR * h_m;
        surfaceArea_m2 = 2 * baseArea_m2 + lateralArea_m2;
        formulaLaTeX = `V = \\pi (R^2 - r^2) h`;
        derivationSteps.push(`Outer Radius R = ${dimR} ${unit}, Inner Radius r = ${dimR2} ${unit}`);
        derivationSteps.push(`Solid Annulus Base Area A_b = π(R² - r²) = ${(baseArea_m2 / (TO_METERS[unit] ** 2)).toFixed(4)} ${unit}²`);
        derivationSteps.push(`Internal Core Volume = ${(innerVol / (TO_METERS[unit] ** 3)).toFixed(4)} ${unit}³ (${(innerVol * 1000).toFixed(2)} Litres)`);
        derivationSteps.push(`Pipe Wall Volume = ${(volume_m3 / (TO_METERS[unit] ** 3)).toFixed(4)} ${unit}³`);
        break;
      }
      case 'cone': {
        volume_m3 = (1 / 3) * PI * r_m * r_m * h_m;
        slantHeight_m = Math.sqrt(r_m * r_m + h_m * h_m);
        baseArea_m2 = PI * r_m * r_m;
        lateralArea_m2 = PI * r_m * slantHeight_m;
        surfaceArea_m2 = baseArea_m2 + lateralArea_m2;
        formulaLaTeX = `V = \\frac{1}{3}\\pi r^2 h, \\quad s = \\sqrt{r^2 + h^2}`;
        derivationSteps.push(`Slant Height s = √(r² + h²) = √(${dimR}² + ${dimH}²) = ${(slantHeight_m / TO_METERS[unit]).toFixed(4)} ${unit}`);
        derivationSteps.push(`Base Area A_b = π · r² = ${(baseArea_m2 / (TO_METERS[unit] ** 2)).toFixed(4)} ${unit}²`);
        derivationSteps.push(`Lateral Surface Area A_L = π · r · s = ${(lateralArea_m2 / (TO_METERS[unit] ** 2)).toFixed(4)} ${unit}²`);
        derivationSteps.push(`Total Area A = A_b + A_L = ${(surfaceArea_m2 / (TO_METERS[unit] ** 2)).toFixed(4)} ${unit}²`);
        derivationSteps.push(`Volume V = (1/3) · π · r² · h = ${(volume_m3 / (TO_METERS[unit] ** 3)).toFixed(4)} ${unit}³`);
        break;
      }
      case 'frustum_cone': {
        const R = Math.max(r_m, r2_m);
        const r = Math.min(r_m, r2_m);
        volume_m3 = (1 / 3) * PI * h_m * (R * R + r * r + R * r);
        slantHeight_m = Math.sqrt((R - r) ** 2 + h_m * h_m);
        const topArea = PI * r * r;
        const botArea = PI * R * R;
        baseArea_m2 = topArea + botArea;
        lateralArea_m2 = PI * (R + r) * slantHeight_m;
        surfaceArea_m2 = baseArea_m2 + lateralArea_m2;
        formulaLaTeX = `V = \\frac{1}{3}\\pi h (R^2 + r^2 + Rr), \\quad s = \\sqrt{(R-r)^2 + h^2}`;
        derivationSteps.push(`Slant Height s = √((R - r)² + h²) = ${(slantHeight_m / TO_METERS[unit]).toFixed(4)} ${unit}`);
        derivationSteps.push(`Top Base Area = ${(topArea / (TO_METERS[unit] ** 2)).toFixed(4)} ${unit}², Bottom Base Area = ${(botArea / (TO_METERS[unit] ** 2)).toFixed(4)} ${unit}²`);
        derivationSteps.push(`Lateral Conical Area A_L = π(R + r)s = ${(lateralArea_m2 / (TO_METERS[unit] ** 2)).toFixed(4)} ${unit}²`);
        derivationSteps.push(`Volume V = (1/3)π·h·(R² + r² + R·r) = ${(volume_m3 / (TO_METERS[unit] ** 3)).toFixed(4)} ${unit}³`);
        break;
      }
      case 'sphere': {
        volume_m3 = (4 / 3) * PI * (r_m ** 3);
        surfaceArea_m2 = 4 * PI * (r_m ** 2);
        lateralArea_m2 = surfaceArea_m2;
        formulaLaTeX = `V = \\frac{4}{3}\\pi r^3, \\quad A = 4\\pi r^2`;
        derivationSteps.push(`Radius r = ${dimR} ${unit}, Diameter D = ${(2 * dimR).toFixed(2)} ${unit}`);
        derivationSteps.push(`Total Surface Area A = 4π · r² = 4π · (${dimR})² = ${(surfaceArea_m2 / (TO_METERS[unit] ** 2)).toFixed(4)} ${unit}²`);
        derivationSteps.push(`Volume V = (4/3)π · r³ = (4/3)π · (${dimR})³ = ${(volume_m3 / (TO_METERS[unit] ** 3)).toFixed(4)} ${unit}³`);
        break;
      }
      case 'spherical_shell': {
        const R = Math.max(r_m, r2_m);
        const r = Math.min(r_m, r2_m);
        volume_m3 = (4 / 3) * PI * (R ** 3 - r ** 3);
        const outerA = 4 * PI * (R ** 2);
        const innerA = 4 * PI * (r ** 2);
        surfaceArea_m2 = outerA + innerA;
        formulaLaTeX = `V = \\frac{4}{3}\\pi (R^3 - r^3), \\quad A = 4\\pi(R^2 + r^2)`;
        derivationSteps.push(`Outer Radius R = ${(R / TO_METERS[unit]).toFixed(2)} ${unit}, Inner Radius r = ${(r / TO_METERS[unit]).toFixed(2)} ${unit}`);
        derivationSteps.push(`Shell Wall Thickness t = R - r = ${((R - r) / TO_METERS[unit]).toFixed(4)} ${unit}`);
        derivationSteps.push(`Outer Surface = ${(outerA / (TO_METERS[unit] ** 2)).toFixed(4)} ${unit}², Inner Surface = ${(innerA / (TO_METERS[unit] ** 2)).toFixed(4)} ${unit}²`);
        derivationSteps.push(`Material Shell Volume = ${(volume_m3 / (TO_METERS[unit] ** 3)).toFixed(4)} ${unit}³`);
        break;
      }
      case 'hemisphere': {
        volume_m3 = (2 / 3) * PI * (r_m ** 3);
        baseArea_m2 = PI * (r_m ** 2);
        lateralArea_m2 = 2 * PI * (r_m ** 2);
        surfaceArea_m2 = 3 * PI * (r_m ** 2);
        formulaLaTeX = `V = \\frac{2}{3}\\pi r^3, \\quad A = 3\\pi r^2`;
        derivationSteps.push(`Curved Dome Area = 2π · r² = ${(lateralArea_m2 / (TO_METERS[unit] ** 2)).toFixed(4)} ${unit}²`);
        derivationSteps.push(`Flat Base Circle Area = π · r² = ${(baseArea_m2 / (TO_METERS[unit] ** 2)).toFixed(4)} ${unit}²`);
        derivationSteps.push(`Total Surface Area A = 3π · r² = ${(surfaceArea_m2 / (TO_METERS[unit] ** 2)).toFixed(4)} ${unit}²`);
        derivationSteps.push(`Volume V = (2/3)π · r³ = ${(volume_m3 / (TO_METERS[unit] ** 3)).toFixed(4)} ${unit}³`);
        break;
      }
      case 'spherical_cap': {
        // Sphere of radius R (dimR), cap height h (dimH <= 2R)
        const R = Math.max(r_m, h_m / 2);
        const h = Math.min(2 * R, h_m);
        volume_m3 = (1 / 3) * PI * (h ** 2) * (3 * R - h);
        const baseRadius = Math.sqrt(Math.max(0, h * (2 * R - h)));
        baseArea_m2 = PI * (baseRadius ** 2);
        lateralArea_m2 = 2 * PI * R * h;
        surfaceArea_m2 = baseArea_m2 + lateralArea_m2;
        formulaLaTeX = `V = \\frac{1}{3}\\pi h^2 (3R - h), \\quad A_{curved} = 2\\pi R h`;
        derivationSteps.push(`Base Disc Radius a = √(h(2R - h)) = ${(baseRadius / TO_METERS[unit]).toFixed(4)} ${unit}`);
        derivationSteps.push(`Curved Dome Surface Area = 2π·R·h = ${(lateralArea_m2 / (TO_METERS[unit] ** 2)).toFixed(4)} ${unit}²`);
        derivationSteps.push(`Base Disc Area = π·a² = ${(baseArea_m2 / (TO_METERS[unit] ** 2)).toFixed(4)} ${unit}²`);
        derivationSteps.push(`Spherical Cap Volume V = ${(volume_m3 / (TO_METERS[unit] ** 3)).toFixed(4)} ${unit}³`);
        break;
      }
      case 'torus': {
        // Major radius R (dimR), Tube radius r (dimR2 <= dimR)
        const R = Math.max(r_m, r2_m);
        const r = Math.min(r_m, r2_m);
        volume_m3 = 2 * (PI ** 2) * R * (r ** 2);
        surfaceArea_m2 = 4 * (PI ** 2) * R * r;
        lateralArea_m2 = surfaceArea_m2;
        formulaLaTeX = `V = 2\\pi^2 R r^2, \\quad A = 4\\pi^2 R r`;
        derivationSteps.push(`Major Centerline Radius R = ${(R / TO_METERS[unit]).toFixed(2)} ${unit}, Tube Radius r = ${(r / TO_METERS[unit]).toFixed(2)} ${unit}`);
        derivationSteps.push(`Total Torus Surface Area A = 4π² · R · r = ${(surfaceArea_m2 / (TO_METERS[unit] ** 2)).toFixed(4)} ${unit}²`);
        derivationSteps.push(`Torus Volume V = 2π² · R · r² = ${(volume_m3 / (TO_METERS[unit] ** 3)).toFixed(4)} ${unit}³`);
        break;
      }
      case 'ellipsoid': {
        const a = r_m;
        const b = w_m;
        const c = c_m;
        volume_m3 = (4 / 3) * PI * a * b * c;
        // Knud Thomsen formula with p = 1.6075
        const p = 1.6075;
        const term = ((a * b) ** p + (a * c) ** p + (b * c) ** p) / 3;
        surfaceArea_m2 = 4 * PI * (term ** (1 / p));
        lateralArea_m2 = surfaceArea_m2;
        formulaLaTeX = `V = \\frac{4}{3}\\pi a b c, \\quad A \\approx 4\\pi \\left(\\frac{(ab)^p + (ac)^p + (bc)^p}{3}\\right)^{1/p}`;
        derivationSteps.push(`Semi-axes: a = ${dimR} ${unit}, b = ${dimW} ${unit}, c = ${dimC} ${unit}`);
        derivationSteps.push(`Volume V = (4/3)π · a · b · c = ${(volume_m3 / (TO_METERS[unit] ** 3)).toFixed(4)} ${unit}³`);
        derivationSteps.push(`Surface Area (Thomsen approx, p=1.6075) = ${(surfaceArea_m2 / (TO_METERS[unit] ** 2)).toFixed(4)} ${unit}²`);
        break;
      }
      case 'cube': {
        const a = l_m;
        volume_m3 = a ** 3;
        surfaceArea_m2 = 6 * (a ** 2);
        baseArea_m2 = a ** 2;
        spaceDiagonal_m = a * Math.sqrt(3);
        formulaLaTeX = `V = a^3, \\quad A = 6a^2, \\quad d = a\\sqrt{3}`;
        derivationSteps.push(`Face Area A_face = a² = (${dimL} ${unit})² = ${(baseArea_m2 / (TO_METERS[unit] ** 2)).toFixed(4)} ${unit}²`);
        derivationSteps.push(`Space Diagonal d = a√3 = ${(spaceDiagonal_m / TO_METERS[unit]).toFixed(4)} ${unit}`);
        derivationSteps.push(`Total Surface Area A = 6a² = ${(surfaceArea_m2 / (TO_METERS[unit] ** 2)).toFixed(4)} ${unit}²`);
        derivationSteps.push(`Volume V = a³ = ${(volume_m3 / (TO_METERS[unit] ** 3)).toFixed(4)} ${unit}³`);
        break;
      }
      case 'cuboid': {
        const l = l_m;
        const w = w_m;
        const h = h_m;
        volume_m3 = l * w * h;
        baseArea_m2 = l * w;
        surfaceArea_m2 = 2 * (l * w + l * h + w * h);
        spaceDiagonal_m = Math.sqrt(l * l + w * w + h * h);
        formulaLaTeX = `V = l \\cdot w \\cdot h, \\quad A = 2(lw + lh + wh)`;
        derivationSteps.push(`Base Area A_b = l · w = (${dimL}) · (${dimW}) = ${(baseArea_m2 / (TO_METERS[unit] ** 2)).toFixed(4)} ${unit}²`);
        derivationSteps.push(`Space Diagonal d = √(l² + w² + h²) = ${(spaceDiagonal_m / TO_METERS[unit]).toFixed(4)} ${unit}`);
        derivationSteps.push(`Total Surface Area A = 2(lw + lh + wh) = ${(surfaceArea_m2 / (TO_METERS[unit] ** 2)).toFixed(4)} ${unit}²`);
        derivationSteps.push(`Volume V = l · w · h = ${(volume_m3 / (TO_METERS[unit] ** 3)).toFixed(4)} ${unit}³`);
        break;
      }
      case 'triangular_prism': {
        const b = w_m; // base width of triangle
        const h_tri = h_m; // height of triangle
        const L = l_m; // length of prism
        const triArea = 0.5 * b * h_tri;
        volume_m3 = triArea * L;
        baseArea_m2 = 2 * triArea;
        // Isosceles sides
        const s = Math.sqrt((b / 2) ** 2 + h_tri ** 2);
        lateralArea_m2 = (b + 2 * s) * L;
        surfaceArea_m2 = baseArea_m2 + lateralArea_m2;
        formulaLaTeX = `V = \\frac{1}{2} b h_{tri} L, \\quad A = b h_{tri} + (b + 2s)L`;
        derivationSteps.push(`Triangular End Face Area = (1/2) · b · h_tri = ${(triArea / (TO_METERS[unit] ** 2)).toFixed(4)} ${unit}²`);
        derivationSteps.push(`Slant Edge of Triangle s = √((b/2)² + h_tri²) = ${(s / TO_METERS[unit]).toFixed(4)} ${unit}`);
        derivationSteps.push(`Lateral Rectangle Faces Area = (b + 2s)·L = ${(lateralArea_m2 / (TO_METERS[unit] ** 2)).toFixed(4)} ${unit}²`);
        derivationSteps.push(`Volume V = A_tri · L = ${(volume_m3 / (TO_METERS[unit] ** 3)).toFixed(4)} ${unit}³`);
        break;
      }
      case 'hexagonal_prism': {
        const a = r_m; // hexagon side
        const h = h_m;
        const hexArea = (3 * Math.sqrt(3) / 2) * (a ** 2);
        volume_m3 = hexArea * h;
        baseArea_m2 = 2 * hexArea;
        lateralArea_m2 = 6 * a * h;
        surfaceArea_m2 = baseArea_m2 + lateralArea_m2;
        formulaLaTeX = `V = \\frac{3\\sqrt{3}}{2} a^2 h, \\quad A = 3\\sqrt{3}a^2 + 6ah`;
        derivationSteps.push(`Hexagonal End Face Area A_b = (3√3 / 2) · a² = ${(hexArea / (TO_METERS[unit] ** 2)).toFixed(4)} ${unit}²`);
        derivationSteps.push(`Lateral Rectangular Faces Area = 6 · a · h = ${(lateralArea_m2 / (TO_METERS[unit] ** 2)).toFixed(4)} ${unit}²`);
        derivationSteps.push(`Total Surface Area A = 2·A_b + 6ah = ${(surfaceArea_m2 / (TO_METERS[unit] ** 2)).toFixed(4)} ${unit}²`);
        derivationSteps.push(`Volume V = A_b · h = ${(volume_m3 / (TO_METERS[unit] ** 3)).toFixed(4)} ${unit}³`);
        break;
      }
      case 'tetrahedron': {
        const a = l_m;
        volume_m3 = (a ** 3) / (6 * Math.sqrt(2));
        surfaceArea_m2 = Math.sqrt(3) * (a ** 2);
        const vertHeight = a * Math.sqrt(2 / 3);
        formulaLaTeX = `V = \\frac{a^3}{6\\sqrt{2}}, \\quad A = \\sqrt{3}a^2, \\quad h = a\\sqrt{\\frac{2}{3}}`;
        derivationSteps.push(`Equilateral Face Area = (√3 / 4) · a² = ${((surfaceArea_m2 / 4) / (TO_METERS[unit] ** 2)).toFixed(4)} ${unit}²`);
        derivationSteps.push(`Vertical Height h = a · √(2/3) = ${(vertHeight / TO_METERS[unit]).toFixed(4)} ${unit}`);
        derivationSteps.push(`Total Surface Area A = 4 · A_face = ${(surfaceArea_m2 / (TO_METERS[unit] ** 2)).toFixed(4)} ${unit}²`);
        derivationSteps.push(`Volume V = a³ / (6√2) = ${(volume_m3 / (TO_METERS[unit] ** 3)).toFixed(4)} ${unit}³`);
        break;
      }
      case 'pyramid_rect': {
        const l = l_m;
        const w = w_m;
        const h = h_m;
        volume_m3 = (1 / 3) * l * w * h;
        baseArea_m2 = l * w;
        const sh_l = Math.sqrt((w / 2) ** 2 + h * h);
        const sh_w = Math.sqrt((l / 2) ** 2 + h * h);
        lateralArea_m2 = l * sh_l + w * sh_w;
        surfaceArea_m2 = baseArea_m2 + lateralArea_m2;
        formulaLaTeX = `V = \\frac{1}{3} l w h, \\quad A = lw + l s_l + w s_w`;
        derivationSteps.push(`Slant Height s_l = √((w/2)² + h²) = ${(sh_l / TO_METERS[unit]).toFixed(4)} ${unit}`);
        derivationSteps.push(`Slant Height s_w = √((l/2)² + h²) = ${(sh_w / TO_METERS[unit]).toFixed(4)} ${unit}`);
        derivationSteps.push(`Base Area A_b = l · w = ${(baseArea_m2 / (TO_METERS[unit] ** 2)).toFixed(4)} ${unit}²`);
        derivationSteps.push(`Lateral Triangular Faces = ${(lateralArea_m2 / (TO_METERS[unit] ** 2)).toFixed(4)} ${unit}²`);
        derivationSteps.push(`Volume V = (1/3) · l · w · h = ${(volume_m3 / (TO_METERS[unit] ** 3)).toFixed(4)} ${unit}³`);
        break;
      }
      case 'square_frustum': {
        const a = l_m; // bottom side
        const b = w_m; // top side
        const h = h_m;
        volume_m3 = (1 / 3) * h * (a * a + b * b + a * b);
        const topA = b * b;
        const botA = a * a;
        baseArea_m2 = topA + botA;
        slantHeight_m = Math.sqrt(h * h + ((a - b) / 2) ** 2);
        lateralArea_m2 = 2 * (a + b) * slantHeight_m;
        surfaceArea_m2 = baseArea_m2 + lateralArea_m2;
        formulaLaTeX = `V = \\frac{1}{3} h (a^2 + b^2 + ab), \\quad s = \\sqrt{h^2 + \\left(\\frac{a-b}{2}\\right)^2}`;
        derivationSteps.push(`Trapezoid Slant Height s = √(h² + ((a - b)/2)²) = ${(slantHeight_m / TO_METERS[unit]).toFixed(4)} ${unit}`);
        derivationSteps.push(`Bottom Base = ${(botA / (TO_METERS[unit] ** 2)).toFixed(4)} ${unit}², Top Base = ${(topA / (TO_METERS[unit] ** 2)).toFixed(4)} ${unit}²`);
        derivationSteps.push(`Lateral Slanted Faces = 2(a + b)s = ${(lateralArea_m2 / (TO_METERS[unit] ** 2)).toFixed(4)} ${unit}²`);
        derivationSteps.push(`Volume V = (1/3)·h·(a² + b² + a·b) = ${(volume_m3 / (TO_METERS[unit] ** 3)).toFixed(4)} ${unit}³`);
        break;
      }
      case 'tank_horizontal': {
        const R = r_m;
        const L = h_m;
        volume_m3 = PI * R * R * L;
        baseArea_m2 = 2 * PI * R * R;
        lateralArea_m2 = 2 * PI * R * L;
        surfaceArea_m2 = baseArea_m2 + lateralArea_m2;

        // Partial liquid dipstick calculation
        const h_liquid = Math.min(2 * R, Math.max(0, fill_m));
        if (h_liquid <= 0) {
          liquidVolume_m3 = 0;
        } else if (h_liquid >= 2 * R) {
          liquidVolume_m3 = volume_m3;
        } else {
          // Circular segment area formula: A_seg = R² * acos((R-h)/R) - (R-h)*sqrt(2Rh - h²)
          const theta = 2 * Math.acos((R - h_liquid) / R);
          const segArea = 0.5 * (R ** 2) * (theta - Math.sin(theta));
          liquidVolume_m3 = segArea * L;
        }
        liquidFillPercent = (liquidVolume_m3 / Math.max(1e-9, volume_m3)) * 100;

        formulaLaTeX = `V_{total} = \\pi R^2 L, \\quad V_{liq} = L \\cdot \\left(R^2 \\arccos\\left(\\frac{R-h}{R}\\right) - (R-h)\\sqrt{2Rh - h^2}\\right)`;
        derivationSteps.push(`Total Tank Capacity = ${(volume_m3 * 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })} Litres (${volume_m3.toFixed(3)} m³)`);
        derivationSteps.push(`Liquid Depth h = ${(h_liquid / TO_METERS[unit]).toFixed(3)} ${unit} out of diameter ${(2 * dimR).toFixed(3)} ${unit}`);
        derivationSteps.push(`Liquid Volume = ${(liquidVolume_m3 * 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })} Litres (${liquidFillPercent.toFixed(1)}% Full)`);
        derivationSteps.push(`Ullage (Empty headroom volume) = ${((volume_m3 - liquidVolume_m3) * 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })} Litres`);
        break;
      }
      case 'silo': {
        const r = r_m;
        const h_cyl = h_m;
        const h_cone = h2_m;
        const volCyl = PI * r * r * h_cyl;
        const volCone = (1 / 3) * PI * r * r * h_cone;
        volume_m3 = volCyl + volCone;
        const slantCone = Math.sqrt(r * r + h_cone * h_cone);
        const areaCylLateral = 2 * PI * r * h_cyl;
        const areaConeLateral = PI * r * slantCone;
        const topArea = PI * r * r;
        surfaceArea_m2 = topArea + areaCylLateral + areaConeLateral;
        formulaLaTeX = `V_{silo} = \\pi r^2 h_{cyl} + \\frac{1}{3}\\pi r^2 h_{cone}`;
        derivationSteps.push(`Cylinder Upper Section Volume = ${(volCyl * 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })} L (${volCyl.toFixed(3)} m³)`);
        derivationSteps.push(`Conical Hopper Bottom Volume = ${(volCone * 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })} L (${volCone.toFixed(3)} m³)`);
        derivationSteps.push(`Total Silo Storage Volume = ${(volume_m3 * 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })} Litres (${volume_m3.toFixed(3)} m³)`);
        break;
      }
    }

    // Material Mass Calculations
    const activeMat = MATERIALS.find(m => m.id === selectedMaterial) || MATERIALS[0];
    const massKg = volume_m3 * activeMat.density;
    const massTonnes = massKg / 1000;
    const massLbs = massKg * 2.20462;
    const massUSShortTons = massKg / 907.185;

    // Unit Output Conversions
    const capacityLitres = volume_m3 * 1000;
    const capacityMillilitres = volume_m3 * 1e6;
    const capacityCubicFeet = volume_m3 * 35.3147;
    const capacityCubicInches = volume_m3 * 61023.7;
    const capacityCubicYards = volume_m3 * 1.30795;
    const capacityUSGallons = volume_m3 * 264.172;
    const capacityUKGallons = volume_m3 * 219.969;
    const capacityOilBarrels = volume_m3 * 6.28981; // bbl (42 US gallons)

    return {
      volume_m3,
      surfaceArea_m2,
      lateralArea_m2,
      baseArea_m2,
      slantHeight_m,
      spaceDiagonal_m,
      liquidVolume_m3,
      liquidFillPercent,
      capacityLitres,
      capacityMillilitres,
      capacityCubicFeet,
      capacityCubicInches,
      capacityCubicYards,
      capacityUSGallons,
      capacityUKGallons,
      capacityOilBarrels,
      massKg,
      massTonnes,
      massLbs,
      massUSShortTons,
      materialName: activeMat.name,
      materialDensity: activeMat.density,
      formulaLaTeX,
      derivationSteps
    };
  }, [shape, unit, dimR, dimR2, dimH, dimL, dimW, dimC, dimH2, fillLevel, selectedMaterial]);

  // Copy Result Handlers
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setCopiedFormat(label);
    setTimeout(() => {
      setCopied(false);
      setCopiedFormat(null);
    }, 2000);
  };

  // Export CSV
  const handleExportCSV = () => {
    const rows = [
      ['Metric / Property', 'Calculated Value', 'Unit'],
      ['Shape Geometry', shape.toUpperCase(), ''],
      ['Volume (SI)', calc.volume_m3.toFixed(6), 'm³'],
      ['Capacity (Litres)', calc.capacityLitres.toFixed(2), 'L'],
      ['Capacity (US Gallons)', calc.capacityUSGallons.toFixed(2), 'US gal'],
      ['Capacity (Cubic Feet)', calc.capacityCubicFeet.toFixed(4), 'ft³'],
      ['Total Surface Area', calc.surfaceArea_m2.toFixed(6), 'm²'],
      ['Material Selected', calc.materialName, ''],
      ['Material Density', calc.materialDensity.toString(), 'kg/m³'],
      ['Net Weight (kg)', calc.massKg.toFixed(2), 'kg'],
      ['Net Weight (Metric Tonnes)', calc.massTonnes.toFixed(4), 't'],
      ['Net Weight (lbs)', calc.massLbs.toFixed(2), 'lbs']
    ];
    const csvContent = rows.map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `geometry_volume_${shape}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // SVG 3D Isometric / Orthogonal Vector Drawings
  const render3DSVG = () => {
    const svgW = 340;
    const svgH = 260;
    const cx = svgW / 2;
    const cy = svgH / 2;

    switch (shape) {
      case 'cylinder':
        return (
          <>
            <defs>
              <linearGradient id="cylGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                <stop offset="40%" stopColor="#818cf8" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#4338ca" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            {/* Cylinder body */}
            <path
              d={`M ${cx - 55} 70 L ${cx - 55} 170 A 55 18 0 0 0 ${cx + 55} 170 L ${cx + 55} 70 Z`}
              fill="url(#cylGrad)"
              stroke="#6366f1"
              strokeWidth={2}
            />
            {/* Bottom hidden ellipse arc */}
            <path
              d={`M ${cx - 55} 170 A 55 18 0 0 1 ${cx + 55} 170`}
              fill="none"
              stroke="#6366f1"
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />
            {/* Top ellipse */}
            <ellipse cx={cx} cy={70} rx={55} ry={18} fill="#818cf8" fillOpacity={0.3} stroke="#6366f1" strokeWidth={2} />
            {/* Dimensions */}
            <line x1={cx} y1={70} x2={cx + 55} y2={70} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="3 3" />
            <line x1={cx + 70} y1={70} x2={cx + 70} y2={170} stroke="#10b981" strokeWidth={1.5} strokeDasharray="3 3" />
            <text x={cx + 22} y={63} fill="#ef4444" fontSize={10} fontWeight="bold" fontFamily="monospace">r = {dimR}</text>
            <text x={cx + 76} y={125} fill="#10b981" fontSize={10} fontWeight="bold" fontFamily="monospace">h = {dimH}</text>
          </>
        );
      case 'pipe':
        return (
          <>
            {/* Outer Wall */}
            <path
              d={`M ${cx - 60} 70 L ${cx - 60} 170 A 60 18 0 0 0 ${cx + 60} 170 L ${cx + 60} 70 Z`}
              fill="rgba(99, 102, 241, 0.15)"
              stroke="#6366f1"
              strokeWidth={2}
            />
            {/* Top Outer Ellipse */}
            <ellipse cx={cx} cy={70} rx={60} ry={18} fill="rgba(99, 102, 241, 0.25)" stroke="#6366f1" strokeWidth={2} />
            {/* Top Inner Ellipse Hole */}
            <ellipse cx={cx} cy={70} rx={38} ry={11} fill="#09090b" stroke="#a855f7" strokeWidth={2} />
            {/* Dimensions */}
            <line x1={cx} y1={70} x2={cx + 38} y2={70} stroke="#a855f7" strokeWidth={1.5} strokeDasharray="3 3" />
            <line x1={cx} y1={70} x2={cx + 60} y2={70} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="3 3" />
            <text x={cx + 12} y={64} fill="#a855f7" fontSize={9} fontWeight="bold" fontFamily="monospace">r = {dimR2}</text>
            <text x={cx + 44} y={64} fill="#ef4444" fontSize={9} fontWeight="bold" fontFamily="monospace">R = {dimR}</text>
          </>
        );
      case 'cone':
        return (
          <>
            <path
              d={`M ${cx - 55} 170 L ${cx} 60 L ${cx + 55} 170 A 55 18 0 0 1 ${cx - 55} 170`}
              fill="rgba(99, 102, 241, 0.15)"
              stroke="#6366f1"
              strokeWidth={2}
            />
            <path
              d={`M ${cx - 55} 170 A 55 18 0 0 1 ${cx + 55} 170`}
              fill="none"
              stroke="#6366f1"
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />
            {/* Slant & Height */}
            <line x1={cx} y1={60} x2={cx} y2={170} stroke="#10b981" strokeWidth={1.5} strokeDasharray="3 3" />
            <line x1={cx} y1={170} x2={cx + 55} y2={170} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="3 3" />
            <text x={cx + 20} y={164} fill="#ef4444" fontSize={10} fontWeight="bold" fontFamily="monospace">r = {dimR}</text>
            <text x={cx - 18} y={120} fill="#10b981" fontSize={10} fontWeight="bold" fontFamily="monospace">h = {dimH}</text>
          </>
        );
      case 'frustum_cone':
        return (
          <>
            <path
              d={`M ${cx - 32} 75 L ${cx - 65} 170 A 65 18 0 0 0 ${cx + 65} 170 L ${cx + 32} 75 Z`}
              fill="rgba(99, 102, 241, 0.18)"
              stroke="#6366f1"
              strokeWidth={2}
            />
            <path
              d={`M ${cx - 65} 170 A 65 18 0 0 1 ${cx + 65} 170`}
              fill="none"
              stroke="#6366f1"
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />
            <ellipse cx={cx} cy={75} rx={32} ry={10} fill="rgba(99, 102, 241, 0.3)" stroke="#6366f1" strokeWidth={2} />
            <text x={cx + 12} y={70} fill="#a855f7" fontSize={9} fontWeight="bold" fontFamily="monospace">r = {dimR2}</text>
            <text x={cx + 30} y={164} fill="#ef4444" fontSize={9} fontWeight="bold" fontFamily="monospace">R = {dimR}</text>
          </>
        );
      case 'sphere':
        return (
          <>
            <circle cx={cx} cy={cy} r={65} fill="rgba(99, 102, 241, 0.18)" stroke="#6366f1" strokeWidth={2} />
            <ellipse cx={cx} cy={cy} rx={65} ry={20} fill="none" stroke="#6366f1" strokeWidth={1.5} strokeDasharray="4 4" />
            <line x1={cx} y1={cy} x2={cx + 65} y2={cy} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="3 3" />
            <circle cx={cx} cy={cy} r={3} fill="#ef4444" />
            <text x={cx + 25} y={cy - 6} fill="#ef4444" fontSize={10} fontWeight="bold" fontFamily="monospace">r = {dimR}</text>
          </>
        );
      case 'tank_horizontal':
        return (
          <>
            {/* Horizontal Cylinder outline */}
            <path
              d={`M ${cx - 80} 80 L ${cx + 50} 80 A 24 55 0 0 1 ${cx + 50} 180 L ${cx - 80} 180 A 24 55 0 0 1 ${cx - 80} 80 Z`}
              fill="rgba(99, 102, 241, 0.12)"
              stroke="#6366f1"
              strokeWidth={2}
            />
            {/* Water liquid level shading */}
            {calc.liquidFillPercent > 0 && (
              <path
                d={`M ${cx - 80} ${180 - (calc.liquidFillPercent / 100) * 100} L ${cx + 50} ${180 - (calc.liquidFillPercent / 100) * 100} A 24 55 0 0 1 ${cx + 50} 180 L ${cx - 80} 180 A 24 55 0 0 1 ${cx - 80} ${180 - (calc.liquidFillPercent / 100) * 100} Z`}
                fill="rgba(14, 165, 233, 0.35)"
                stroke="#0284c7"
                strokeWidth={1.5}
              />
            )}
            <ellipse cx={cx - 80} cy={130} rx={24} ry={50} fill="none" stroke="#6366f1" strokeWidth={1.5} strokeDasharray="3 3" />
            <ellipse cx={cx + 50} cy={130} rx={24} ry={50} fill="rgba(99, 102, 241, 0.2)" stroke="#6366f1" strokeWidth={2} />
            <text x={cx - 20} y={196} fill="#10b981" fontSize={10} fontWeight="bold" fontFamily="monospace">L = {dimH} {unit}</text>
          </>
        );
      case 'cuboid':
      case 'cube':
        return (
          <>
            {/* Front face */}
            <rect x={cx - 60} y={cy - 30} width={90} height={70} fill="rgba(99, 102, 241, 0.2)" stroke="#6366f1" strokeWidth={2} />
            {/* Top face */}
            <polygon
              points={`${cx - 60},${cy - 30} ${cx - 25},${cy - 65} ${cx + 65},${cy - 65} ${cx + 30},${cy - 30}`}
              fill="rgba(99, 102, 241, 0.3)"
              stroke="#6366f1"
              strokeWidth={2}
            />
            {/* Right side face */}
            <polygon
              points={`${cx + 30},${cy - 30} ${cx + 65},${cy - 65} ${cx + 65},${cy + 5} ${cx + 30},${cy + 40}`}
              fill="rgba(99, 102, 241, 0.15)"
              stroke="#6366f1"
              strokeWidth={2}
            />
            <text x={cx - 25} y={cy + 55} fill="#ef4444" fontSize={10} fontWeight="bold" fontFamily="monospace">L = {dimL}</text>
            <text x={cx + 45} y={cy - 40} fill="#a855f7" fontSize={10} fontWeight="bold" fontFamily="monospace">W = {dimW}</text>
            <text x={cx - 75} y={cy + 10} fill="#10b981" fontSize={10} fontWeight="bold" fontFamily="monospace">H = {dimH}</text>
          </>
        );
      default:
        return (
          <>
            <circle cx={cx} cy={cy} r={55} fill="rgba(99, 102, 241, 0.2)" stroke="#6366f1" strokeWidth={2} />
            <text x={cx} y={cy + 4} fill="#818cf8" fontSize={12} fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              {shape.toUpperCase()}
            </text>
          </>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-left">
      {/* Answer Engine Optimization (AEO) Quick Definition Card */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 flex items-start gap-3.5 shadow-xs">
        <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div className="text-xs text-zinc-700 dark:text-zinc-300 space-y-1">
          <p className="font-bold text-zinc-900 dark:text-white text-sm">
            What is 3D Volumetric and Surface Area Geometry?
          </p>
          <p className="leading-relaxed">
            <strong>3D Geometry</strong> calculates the spatial capacity (Volume $V$), boundary enclosing area (Total Surface Area $A$), and fluid holding capacity (Litres / Gallons) of three-dimensional solids. Core geometric figures include cylinders ($V = \pi r^2 h$), cones ($V = \frac{1}{3}\pi r^2 h$), spheres ($V = \frac{4}{3}\pi r^3$), frustums, prisms, ellipsoids, and industrial storage tanks.
          </p>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Shape Selectors & Dimension Inputs (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="saas-card p-5 space-y-4">
            {/* Category Navigation Tabs */}
            <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5 mb-2.5">
                <Box className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Select 3D Solid Category
              </span>

              <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 text-xs">
                {[
                  { id: 'curved', label: 'Curved Solids' },
                  { id: 'prisms', label: 'Prisms & Cubes' },
                  { id: 'pyramids', label: 'Pyramids' },
                  { id: 'tanks', label: 'Tanks & Silos' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setCategory(tab.id as ShapeCategory);
                      if (tab.id === 'curved') setShape('cylinder');
                      if (tab.id === 'prisms') setShape('cuboid');
                      if (tab.id === 'pyramids') setShape('pyramid_rect');
                      if (tab.id === 'tanks') setShape('tank_horizontal');
                    }}
                    className={`py-1.5 px-1 text-[11px] font-bold rounded-lg transition whitespace-nowrap cursor-pointer ${
                      category === tab.id
                        ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Shape Sub-buttons */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {category === 'curved' && (
                <>
                  {[
                    { id: 'cylinder', label: 'Cylinder' },
                    { id: 'pipe', label: 'Hollow Pipe' },
                    { id: 'cone', label: 'Cone' },
                    { id: 'frustum_cone', label: 'Frustum Cone' },
                    { id: 'sphere', label: 'Sphere' },
                    { id: 'spherical_shell', label: 'Spherical Shell' },
                    { id: 'hemisphere', label: 'Hemisphere' },
                    { id: 'spherical_cap', label: 'Spherical Cap' },
                    { id: 'torus', label: 'Torus (Donut)' },
                    { id: 'ellipsoid', label: 'Ellipsoid' }
                  ].map(s => (
                    <button
                      key={s.id}
                      onClick={() => loadShapePreset(s.id as ShapeId, 'curved')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                        shape === s.id
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </>
              )}

              {category === 'prisms' && (
                <>
                  {[
                    { id: 'cube', label: 'Cube' },
                    { id: 'cuboid', label: 'Cuboid / Box' },
                    { id: 'triangular_prism', label: 'Triangular Prism' },
                    { id: 'hexagonal_prism', label: 'Hexagonal Prism' },
                    { id: 'tetrahedron', label: 'Tetrahedron' }
                  ].map(s => (
                    <button
                      key={s.id}
                      onClick={() => loadShapePreset(s.id as ShapeId, 'prisms')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                        shape === s.id
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </>
              )}

              {category === 'pyramids' && (
                <>
                  {[
                    { id: 'pyramid_rect', label: 'Rectangular Pyramid' },
                    { id: 'square_frustum', label: 'Square Frustum Hopper' }
                  ].map(s => (
                    <button
                      key={s.id}
                      onClick={() => loadShapePreset(s.id as ShapeId, 'pyramids')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                        shape === s.id
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </>
              )}

              {category === 'tanks' && (
                <>
                  {[
                    { id: 'tank_horizontal', label: 'Horizontal Tank (Dipstick Level)' },
                    { id: 'silo', label: 'Vertical Silo & Conical Hopper' }
                  ].map(s => (
                    <button
                      key={s.id}
                      onClick={() => loadShapePreset(s.id as ShapeId, 'tanks')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                        shape === s.id
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </>
              )}
            </div>

            {/* Unit Selector Bar */}
            <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 pt-3 text-xs">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-indigo-500" />
                Measurement Unit:
              </span>
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[11px] font-bold">
                {(['m', 'cm', 'mm', 'ft', 'in', 'yd'] as const).map(u => (
                  <button
                    key={u}
                    onClick={() => setUnit(u)}
                    className={`px-2 py-0.5 rounded transition cursor-pointer ${unit === u ? 'bg-white dark:bg-zinc-900 text-indigo-600 shadow-xs' : 'text-zinc-500'}`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dynamic Dimension Inputs Card */}
          <div className="saas-card p-5 space-y-4">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              Solid Dimensions ({unit})
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
              {/* Radius / Primary Dimension */}
              {(['cylinder', 'pipe', 'cone', 'frustum_cone', 'sphere', 'spherical_shell', 'hemisphere', 'spherical_cap', 'torus', 'ellipsoid', 'hexagonal_prism', 'tank_horizontal', 'silo'].includes(shape)) && (
                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">
                    {shape === 'pipe' || shape === 'frustum_cone' || shape === 'spherical_shell' ? `Outer Radius R (${unit})` : shape === 'torus' ? `Major Radius R (${unit})` : shape === 'ellipsoid' ? `Semi-Axis a (${unit})` : shape === 'hexagonal_prism' ? `Hex Side a (${unit})` : `Radius r (${unit})`}
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={dimR}
                    onChange={(e) => setDimR(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-mono text-xs font-bold"
                  />
                </div>
              )}

              {/* Secondary Radius */}
              {(['pipe', 'frustum_cone', 'spherical_shell', 'torus'].includes(shape)) && (
                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">
                    {shape === 'pipe' || shape === 'frustum_cone' || shape === 'spherical_shell' ? `Inner Radius r (${unit})` : `Tube Radius r (${unit})`}
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={dimR2}
                    onChange={(e) => setDimR2(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-mono text-xs font-bold"
                  />
                </div>
              )}

              {/* Height / Length */}
              {(['cylinder', 'pipe', 'cone', 'frustum_cone', 'spherical_cap', 'cuboid', 'hexagonal_prism', 'pyramid_rect', 'square_frustum', 'tank_horizontal', 'silo'].includes(shape)) && (
                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">
                    {shape === 'tank_horizontal' ? `Tank Length L (${unit})` : shape === 'silo' ? `Cylinder Height (${unit})` : `Height h (${unit})`}
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={dimH}
                    onChange={(e) => setDimH(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-mono text-xs font-bold"
                  />
                </div>
              )}

              {/* Secondary Height for Silo */}
              {shape === 'silo' && (
                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">
                    Cone Hopper Height ({unit})
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={dimH2}
                    onChange={(e) => setDimH2(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-mono text-xs font-bold"
                  />
                </div>
              )}

              {/* Length for Cuboid, Prism, Pyramid, Tetrahedron */}
              {(['cube', 'cuboid', 'triangular_prism', 'tetrahedron', 'pyramid_rect', 'square_frustum'].includes(shape)) && (
                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">
                    {shape === 'cube' || shape === 'tetrahedron' ? `Edge Length a (${unit})` : shape === 'square_frustum' ? `Bottom Base Edge a (${unit})` : `Length L (${unit})`}
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={dimL}
                    onChange={(e) => setDimL(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-mono text-xs font-bold"
                  />
                </div>
              )}

              {/* Width for Cuboid, Triangular Prism, Pyramid, Ellipsoid */}
              {(['cuboid', 'triangular_prism', 'pyramid_rect', 'square_frustum', 'ellipsoid'].includes(shape)) && (
                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">
                    {shape === 'triangular_prism' ? `Triangle Base b (${unit})` : shape === 'square_frustum' ? `Top Base Edge b (${unit})` : shape === 'ellipsoid' ? `Semi-Axis b (${unit})` : `Width W (${unit})`}
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={dimW}
                    onChange={(e) => setDimW(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-mono text-xs font-bold"
                  />
                </div>
              )}

              {/* Ellipsoid Semi-Axis c */}
              {shape === 'ellipsoid' && (
                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">
                    Semi-Axis c ({unit})
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={dimC}
                    onChange={(e) => setDimC(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-mono text-xs font-bold"
                  />
                </div>
              )}

              {/* Horizontal Tank Liquid Depth Slider */}
              {shape === 'tank_horizontal' && (
                <div className="sm:col-span-2">
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1 flex items-center justify-between">
                    <span>Liquid Fill Depth ({unit})</span>
                    <span className="text-sky-500 font-bold">{calc.liquidFillPercent.toFixed(1)}% Full</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max={(2 * dimR).toString()}
                      step="0.01"
                      value={fillLevel}
                      onChange={(e) => setFillLevel(parseFloat(e.target.value))}
                      className="flex-1 accent-sky-500 cursor-pointer"
                    />
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950 text-sky-600">
                      {fillLevel.toFixed(2)} {unit}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Material & Mass Density Selector Card */}
          <div className="saas-card p-5 space-y-3">
            <span className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-indigo-500" />
              Material Weight & Density Calculator
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Choose Solid/Liquid Material</label>
                <select
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold"
                >
                  {MATERIALS.map(mat => (
                    <option key={mat.id} value={mat.id}>
                      {mat.name} ({mat.density} kg/m³)
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-center text-xs">
                <span className="text-[10px] text-zinc-400 font-bold uppercase">Estimated Solid Net Mass</span>
                <p className="font-mono font-bold text-zinc-900 dark:text-white text-sm">
                  {calc.massKg < 1000 ? `${calc.massKg.toFixed(2)} kg` : `${calc.massTonnes.toFixed(3)} Tonnes`} &bull; ({calc.massLbs.toFixed(1)} lbs)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Computed Matrix, Liquid Capacity & Visualizer (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* 3D Isometric SVG Canvas */}
          <div className="saas-card p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2.5">
              <span className="text-xs font-bold text-zinc-900 dark:text-white uppercase flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                3D Parametric Geometry Preview
              </span>
              <span className="text-[10px] font-mono text-zinc-400 font-bold">
                {unit.toUpperCase()} Scale
              </span>
            </div>

            <div className="relative w-full rounded-2xl bg-zinc-950 p-2 border border-zinc-800 flex items-center justify-center select-none overflow-hidden">
              <svg width="100%" height={260} viewBox="0 0 340 260" className="overflow-visible">
                {render3DSVG()}
              </svg>
            </div>
          </div>

          {/* Primary Computed Volumetric Outputs */}
          <div className="saas-card p-5 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2.5">
              <span className="text-xs font-bold text-zinc-900 dark:text-white uppercase font-sans flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-emerald-500" />
                Volumetric Capacity Results
              </span>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 flex items-center gap-1 cursor-pointer font-bold font-sans"
                >
                  <Download className="w-3.5 h-3.5" /> CSV
                </button>
                <button
                  onClick={() => handleCopy(`${calc.volume_m3.toFixed(4)} m³ (${calc.capacityLitres.toFixed(1)} L)`, 'summary')}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer font-bold font-sans"
                >
                  {copied && copiedFormat === 'summary' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy
                </button>
              </div>
            </div>

            {/* Primary Volume & Litres Highlight Card */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                <span className="text-[10px] text-zinc-400 font-bold uppercase block font-sans">Volume (Cubic Meters)</span>
                <p className="text-base font-black text-emerald-600 dark:text-emerald-400">
                  {calc.volume_m3.toFixed(4)} m³
                </p>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800">
                <span className="text-[10px] text-zinc-400 font-bold uppercase block font-sans">Capacity (Litres)</span>
                <p className="text-base font-black text-indigo-600 dark:text-indigo-400">
                  {calc.capacityLitres.toLocaleString(undefined, { maximumFractionDigits: 1 })} L
                </p>
              </div>
            </div>

            {/* Total Surface Area & US Gallons */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <span className="text-[10px] text-zinc-400 font-bold uppercase block font-sans">Total Surface Area</span>
                <p className="font-bold text-zinc-900 dark:text-white">
                  {calc.surfaceArea_m2.toFixed(4)} m²
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <span className="text-[10px] text-zinc-400 font-bold uppercase block font-sans">US Liquid Gallons</span>
                <p className="font-bold text-zinc-900 dark:text-white">
                  {calc.capacityUSGallons.toLocaleString(undefined, { maximumFractionDigits: 1 })} gal
                </p>
              </div>
            </div>

            {/* Multi-Unit Conversion Schedule Table */}
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden font-sans">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="bg-zinc-100 dark:bg-zinc-800/60 text-zinc-500 font-bold uppercase text-[10px] border-b border-zinc-200 dark:border-zinc-800">
                    <th className="p-2">Unit Standard</th>
                    <th className="p-2">Equivalent Volume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-[11px]">
                  <tr>
                    <td className="p-2 text-zinc-500 font-sans">Cubic Feet (ft³)</td>
                    <td className="p-2 font-bold text-zinc-900 dark:text-white">{calc.capacityCubicFeet.toFixed(4)} ft³</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-zinc-500 font-sans">Cubic Yards (yd³)</td>
                    <td className="p-2 font-bold text-zinc-900 dark:text-white">{calc.capacityCubicYards.toFixed(4)} yd³</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-zinc-500 font-sans">UK Imperial Gallons</td>
                    <td className="p-2 font-bold text-zinc-900 dark:text-white">{calc.capacityUKGallons.toFixed(2)} imp gal</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-zinc-500 font-sans">Oil Barrels (bbl)</td>
                    <td className="p-2 font-bold text-zinc-900 dark:text-white">{calc.capacityOilBarrels.toFixed(3)} bbl</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Step by Step Mathematical Derivation */}
            {calc.derivationSteps.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800 font-mono text-xs">
                <span className="text-[10px] font-bold text-zinc-400 uppercase font-sans flex items-center gap-1">
                  <RotateCcw className="w-3 h-3 text-indigo-500" />
                  Geometric Derivation Steps
                </span>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1 text-[11px] text-zinc-600 dark:text-zinc-400 max-h-40 overflow-y-auto">
                  {calc.derivationSteps.map((step, idx) => (
                    <div key={idx} className="pl-2 border-l-2 border-indigo-400 dark:border-indigo-600">
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fundamental 3D Solid Geometry Guide Card */}
      <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-3">
        <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          Fundamental Volumetric Formulas & Spatial Theorems
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <div className="p-3 rounded-xl bg-white dark:bg-zinc-850/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <p className="font-bold text-zinc-900 dark:text-white">Cavalieri's Principle</p>
            <p className="text-[11px]">
              If two 3D solids of equal height have equal cross-sectional areas at every level parallel to their bases, then their total volumes are identical. This applies to oblique and right prisms alike.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-zinc-850/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <p className="font-bold text-zinc-900 dark:text-white">Archimedes Sphere-Cylinder Ratio</p>
            <p className="text-[11px]">
              Archimedes proved that a sphere inscribed inside a cylinder of matching diameter and height occupies exactly <em>2/3</em> of the cylinder's volume and surface area: <em>V_sphere = (2/3)·V_cylinder</em>.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-zinc-850/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <p className="font-bold text-zinc-900 dark:text-white">Guldinus-Pappus Centroid Theorem</p>
            <p className="text-[11px]">
              The volume of a solid of revolution (such as a Torus or spherical dome) equals the generating plane area multiplied by the distance traveled by its geometric centroid during revolution: <em>V = 2π·R·A</em>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

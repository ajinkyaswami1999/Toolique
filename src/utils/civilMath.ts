/**
 * Centralized Civil & Structural Engineering Mathematical Engine
 * Single Source of Truth for Indian Standard (IS) Codes:
 * - IS 456:2000 (Plain and Reinforced Concrete - Code of Practice)
 * - IS 1786:2008 (High Strength Deformed Steel Bars and Wires)
 * - IS 1200 (Method of Measurement of Building and Civil Engineering Works)
 * - IS 2212:1991 (Code of Practice for Brickwork)
 * - IS 383:2016 (Coarse and Fine Aggregates Specification)
 * - CPWD DSR (Delhi Schedule of Rates) Engineering Benchmarks
 */

// -------------------------------------------------------------
// 1. Engineering Constants (IS 456 / IS 1786 / CPWD)
// -------------------------------------------------------------

/** Dry Volume void and shrinkage allowance factor for Concrete (IS 456) */
export const DRY_VOLUME_FACTOR_CONCRETE = 1.54;

/** Dry Volume shrinkage factor for Cement-Sand Mortar (IS 2212) */
export const DRY_VOLUME_FACTOR_MORTAR = 1.33;

/** Dry Volume factor for Wall/Ceiling Plaster (1.33 dry shrinkage + 20% joint filling) */
export const DRY_VOLUME_FACTOR_PLASTER = 1.60;

/** Volume Conversion: 1 Cubic Meter (m³) = 35.3147 Cubic Feet (cu.ft / cft) */
export const CFT_PER_CUM = 35.3147;

/** Volume Conversion: 1 Cubic Foot (cu.ft) = 0.0283168 Cubic Meters (m³) */
export const CUM_PER_CFT = 0.0283168;

/** Traditional Indian Trade Volume: 1 Brass = 100 Cubic Feet (cu.ft) */
export const CFT_PER_BRASS = 100;

/** Volume Conversion: 1 Brass = 2.83168 Cubic Meters (m³) */
export const CUM_PER_BRASS = 2.83168;

/** Area Conversion: 1 Square Meter (m²) = 10.7639 Square Feet (sq.ft) */
export const SQFT_PER_SQM = 10.7639;

/** Area Conversion: 1 Square Foot (sq.ft) = 0.092903 Square Meters (m²) */
export const SQM_PER_SQFT = 0.092903;

/** Length Conversion: 1 Meter = 3.28084 Feet */
export const FEET_PER_METER = 3.28084;

/** Length Conversion: 1 Foot = 0.3048 Meters */
export const METERS_PER_FOOT = 0.3048;

/** Length Conversion: 1 Inch = 25.4 Millimeters */
export const MM_PER_INCH = 25.4;

// -------------------------------------------------------------
// 2. Material Physical Densities & Unit Weights
// -------------------------------------------------------------

/** Standard Weight of 1 Commercial Cement Bag in India = 50 kg */
export const CEMENT_BAG_WEIGHT_KG = 50;

/** Bulk Density of Ordinary Portland Cement (OPC / PPC) = 1440 kg/m³ */
export const CEMENT_DENSITY_KG_M3 = 1440;

/** Volume of 1 Standard 50kg Cement Bag = 50 / 1440 ≈ 0.03472 m³ (1.226 cu.ft) */
export const CEMENT_BAG_VOLUME_M3 = 0.03472;

/** Volume of 1 Standard 50kg Cement Bag in CFT = 1.226 cu.ft */
export const CEMENT_BAG_VOLUME_CFT = 1.226;

/** Density of Structural Reinforcement Steel (IS 1786) = 7850 kg/m³ */
export const STEEL_DENSITY_KG_M3 = 7850;

/**
 * Standard Rebar Weight Factor: D² / 162.28 kg/m
 * Derived from: (π / 4) * (D / 1000)² * 7850 kg/m³ = D² / 162.28
 * Commonly rounded in trade as D² / 162
 */
export const STEEL_REBAR_FACTOR = 162.28;
export const STEEL_REBAR_DIVISOR = 162;

/** Typical Bulk Density of River Sand / M-Sand = 1600 kg/m³ */
export const SAND_DENSITY_KG_M3 = 1600;

/** Bulk Density of Sand in kg per cu.ft (approx 45.3 kg/cft) */
export const SAND_DENSITY_KG_CFT = 45.3;

/** Typical Bulk Density of Crushed Stone Coarse Aggregate = 1500 kg/m³ */
export const AGGREGATE_DENSITY_KG_M3 = 1500;

/** Standard Indian Coarse Aggregate Grading Distribution: 60% 20mm + 40% 10mm */
export const AGGREGATE_20MM_SPLIT = 0.60;
export const AGGREGATE_10MM_SPLIT = 0.40;

// -------------------------------------------------------------
// 3. Volumetric and Geometric Conversion Functions
// -------------------------------------------------------------

/**
 * Converts volume in Cubic Meters (m³) to Cubic Feet (cu.ft / cft)
 */
export function cumToCft(cum: number): number {
  return cum * CFT_PER_CUM;
}

/**
 * Converts volume in Cubic Feet (cu.ft) to Cubic Meters (m³)
 */
export function cftToCum(cft: number): number {
  return cft * CUM_PER_CFT;
}

/**
 * Converts volume in Cubic Feet (cu.ft) to Brass (1 Brass = 100 cu.ft)
 */
export function cftToBrass(cft: number): number {
  return cft / CFT_PER_BRASS;
}

/**
 * Converts volume in Brass to Cubic Feet (cu.ft)
 */
export function brassToCft(brass: number): number {
  return brass * CFT_PER_BRASS;
}

/**
 * Converts volume in Brass to Cubic Meters (m³)
 */
export function brassToCum(brass: number): number {
  return brass * CUM_PER_BRASS;
}

/**
 * Converts volume in Cubic Meters (m³) to Brass
 */
export function cumToBrass(cum: number): number {
  return (cum * CFT_PER_CUM) / CFT_PER_BRASS;
}

/**
 * Converts Area in Square Meters (m²) to Square Feet (sq.ft)
 */
export function sqmToSqft(sqm: number): number {
  return sqm * SQFT_PER_SQM;
}

/**
 * Converts Area in Square Feet (sq.ft) to Square Meters (m²)
 */
export function sqftToSqm(sqft: number): number {
  return sqft * SQM_PER_SQFT;
}

// -------------------------------------------------------------
// 4. Engineering Material Calculations
// -------------------------------------------------------------

/**
 * Applies IS 456 dry volume void expansion factor (1.54) to wet concrete volume
 */
export function wetToDryVolumeConcrete(wetVolumeM3: number): number {
  return wetVolumeM3 * DRY_VOLUME_FACTOR_CONCRETE;
}

/**
 * Applies mortar shrinkage factor (1.33) to wet mortar volume
 */
export function wetToDryVolumeMortar(wetVolumeM3: number): number {
  return wetVolumeM3 * DRY_VOLUME_FACTOR_MORTAR;
}

/**
 * Calculates number of 50kg cement bags required from cement volume in m³
 * Automatically applies ceiling to ensure complete commercial bag purchase
 */
export function calculateCementBags(cementVolumeM3: number): number {
  if (cementVolumeM3 <= 0) return 0;
  return Math.ceil(cementVolumeM3 / CEMENT_BAG_VOLUME_M3);
}

/**
 * Calculates theoretical unit weight of TMT reinforcement steel bar in kg/m (IS 1786)
 * Formula: D² / 162.28
 * @param diameterMm Diameter of rebar in millimeters (e.g. 8, 10, 12, 16, 20, 25, 32)
 * @param divisor Optional divisor override (defaults to 162.28, or 162 for rule-of-thumb)
 */
export function calculateRebarUnitWeight(diameterMm: number, divisor: number = STEEL_REBAR_FACTOR): number {
  if (diameterMm <= 0) return 0;
  return Number(((diameterMm * diameterMm) / divisor).toFixed(3));
}

/**
 * Calculates total weight of reinforcement steel in kg and tonnes
 */
export function calculateRebarWeight(
  diameterMm: number,
  lengthMeters: number,
  count: number = 1,
  divisor: number = STEEL_REBAR_FACTOR
): { unitWeightKgPerM: number; weightKg: number; weightTonnes: number } {
  if (diameterMm <= 0 || lengthMeters <= 0 || count <= 0) {
    return { unitWeightKgPerM: 0, weightKg: 0, weightTonnes: 0 };
  }
  const unitWeight = (diameterMm * diameterMm) / divisor;
  const weightKg = unitWeight * lengthMeters * count;
  return {
    unitWeightKgPerM: Number(unitWeight.toFixed(3)),
    weightKg: Number(weightKg.toFixed(2)),
    weightTonnes: Number((weightKg / 1000).toFixed(4)),
  };
}

/**
 * Standard Concrete Nominal and Design Mixes (IS 456:2000)
 */
export interface CivilMixRatio {
  grade: string;
  name: string;
  cement: number;
  sand: number;
  aggregate: number;
  characteristicStrengthMpa: number;
  waterCementRatio: number;
  recommendedUse: string;
}

export const CIVIL_CONCRETE_MIXES: Record<string, CivilMixRatio> = {
  M5: {
    grade: 'M5',
    name: 'M5 (1:5:10)',
    cement: 1,
    sand: 5,
    aggregate: 10,
    characteristicStrengthMpa: 5,
    waterCementRatio: 0.60,
    recommendedUse: 'Levelling course, sub-base blinding'
  },
  M75: {
    grade: 'M7.5',
    name: 'M7.5 (1:4:8)',
    cement: 1,
    sand: 4,
    aggregate: 8,
    characteristicStrengthMpa: 7.5,
    waterCementRatio: 0.58,
    recommendedUse: 'Mass foundation bed, non-structural paving'
  },
  M10: {
    grade: 'M10',
    name: 'M10 (1:3:6)',
    cement: 1,
    sand: 3,
    aggregate: 6,
    characteristicStrengthMpa: 10,
    waterCementRatio: 0.55,
    recommendedUse: 'PCC foundations, bed concrete under masonry'
  },
  M15: {
    grade: 'M15',
    name: 'M15 (1:2:4)',
    cement: 1,
    sand: 2,
    aggregate: 4,
    characteristicStrengthMpa: 15,
    waterCementRatio: 0.52,
    recommendedUse: 'Plain flooring, pathways, light slabs'
  },
  M20: {
    grade: 'M20',
    name: 'M20 (1:1.5:3)',
    cement: 1,
    sand: 1.5,
    aggregate: 3,
    characteristicStrengthMpa: 20,
    waterCementRatio: 0.50,
    recommendedUse: 'Standard RCC (Roof slabs, beams, columns, stairs) - IS 456 minimum for RCC'
  },
  M25: {
    grade: 'M25',
    name: 'M25 (1:1:2)',
    cement: 1,
    sand: 1,
    aggregate: 2,
    characteristicStrengthMpa: 25,
    waterCementRatio: 0.45,
    recommendedUse: 'Heavy load columns, raft foundations, water retaining tanks'
  },
  M30: {
    grade: 'M30',
    name: 'M30 (1:0.75:1.5)',
    cement: 1,
    sand: 0.75,
    aggregate: 1.5,
    characteristicStrengthMpa: 30,
    waterCementRatio: 0.42,
    recommendedUse: 'Commercial multi-storey framing, cantilever slabs'
  }
};

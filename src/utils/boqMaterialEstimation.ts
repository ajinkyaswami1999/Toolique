// Indian Construction Material Estimation Engine for BOQ Line Items

// -------------------------------------------------------------
// 1. Concrete / PCC / RCC Material Estimator
// -------------------------------------------------------------
export interface ConcreteMaterialResult {
  cementBags: number;
  sandCft: number;
  aggregateCft: number;
  waterLitres: number;
  steelKg: number;
}

export function estimateConcreteMaterials(
  volume: number, // volume of wet concrete
  unit: 'cum' | 'cft',
  mixGrade: 'pcc_1_4_8' | 'pcc_1_3_6' | 'pcc_1_2_4' | 'm20' | 'm25' | 'custom',
  includeSteel: boolean,
  steelRatioKgPerCum: number = 80 // typical standard density: 80 kg/m3 for slabs/beams
): ConcreteMaterialResult {
  // Convert to cubic meters (CUM) for calculations
  const volCum = unit === 'cft' ? volume / 35.3147 : volume;

  // Dry volume of concrete is taken as 1.54 times the wet volume
  const dryVol = volCum * 1.54;

  let cementPart = 1;
  let sandPart = 2;
  let aggregatePart = 4;

  switch (mixGrade) {
    case 'pcc_1_4_8':
      cementPart = 1; sandPart = 4; aggregatePart = 8;
      break;
    case 'pcc_1_3_6':
      cementPart = 1; sandPart = 3; aggregatePart = 6;
      break;
    case 'pcc_1_2_4':
      cementPart = 1; sandPart = 2; aggregatePart = 4;
      break;
    case 'm20':
      // M20 nominal mix ratio is 1 : 1.5 : 3
      cementPart = 1; sandPart = 1.5; aggregatePart = 3;
      break;
    case 'm25':
      // M25 nominal mix ratio is 1 : 1 : 2
      cementPart = 1; sandPart = 1; aggregatePart = 2;
      break;
    case 'custom':
      // Default fallback
      cementPart = 1; sandPart = 1.5; aggregatePart = 3;
      break;
  }

  const sumParts = cementPart + sandPart + aggregatePart;

  const cementM3 = dryVol * (cementPart / sumParts);
  const sandM3 = dryVol * (sandPart / sumParts);
  const aggregateM3 = dryVol * (aggregatePart / sumParts);

  // 1 bag of cement = 50kg = 0.0347 m3
  const cementBags = cementM3 / 0.0347;

  // Convert sand and aggregate to CFT (1 m3 = 35.3147 cft)
  const sandCft = sandM3 * 35.3147;
  const aggregateCft = aggregateM3 * 35.3147;

  // Water estimate (approx 28-30 litres per cement bag for standard w/c ratio)
  const waterLitres = cementBags * 28;

  // Steel estimation
  const steelKg = includeSteel ? volCum * steelRatioKgPerCum : 0;

  return {
    cementBags: Math.ceil(cementBags),
    sandCft: Number(sandCft.toFixed(2)),
    aggregateCft: Number(aggregateCft.toFixed(2)),
    waterLitres: Math.round(waterLitres),
    steelKg: Math.round(steelKg)
  };
}

// -------------------------------------------------------------
// 2. Brickwork Material Estimator
// -------------------------------------------------------------
export interface BrickworkMaterialResult {
  brickCount: number;
  cementBags: number;
  sandCft: number;
  mortarVolumeCum: number;
}

export function estimateBrickworkMaterials(
  volume: number,
  unit: 'cum' | 'cft',
  brickType: 'modular' | 'standard' | 'aac_block' | 'fly_ash',
  mortarRatio: '1_3' | '1_4' | '1_5' | '1_6' = '1_6'
): BrickworkMaterialResult {
  const volCum = unit === 'cft' ? volume / 35.3147 : volume;

  let bricksPerCum = 500; // default for modular 190x90x90 with mortar
  let mortarPercent = 0.3; // 30% mortar volume

  switch (brickType) {
    case 'modular':
      bricksPerCum = 500;
      mortarPercent = 0.3;
      break;
    case 'standard':
      // traditional bricks 230x110x75 mm
      bricksPerCum = 412;
      mortarPercent = 0.25;
      break;
    case 'aac_block':
      // AAC Blocks 600x200x150 mm
      bricksPerCum = 56;
      mortarPercent = 0.12; // AAC blocks require thin jointing mortar/adhesives
      break;
    case 'fly_ash':
      // standard bricks size
      bricksPerCum = 412;
      mortarPercent = 0.25;
      break;
  }

  const brickCount = Math.ceil(volCum * bricksPerCum);
  const mortarVolWet = volCum * mortarPercent;

  // Dry volume of mortar has a shrinkage factor of 1.33
  const mortarVolDry = mortarVolWet * 1.33;

  let cementPart = 1;
  let sandPart = 6;

  if (mortarRatio === '1_3') {
    cementPart = 1; sandPart = 3;
  } else if (mortarRatio === '1_4') {
    cementPart = 1; sandPart = 4;
  } else if (mortarRatio === '1_5') {
    cementPart = 1; sandPart = 5;
  } else {
    cementPart = 1; sandPart = 6;
  }

  const totalParts = cementPart + sandPart;
  const cementM3 = mortarVolDry * (cementPart / totalParts);
  const sandM3 = mortarVolDry * (sandPart / totalParts);

  const cementBags = cementM3 / 0.0347;
  const sandCft = sandM3 * 35.3147;

  return {
    brickCount,
    cementBags: Math.ceil(cementBags),
    sandCft: Number(sandCft.toFixed(2)),
    mortarVolumeCum: Number(mortarVolWet.toFixed(3))
  };
}

// -------------------------------------------------------------
// 3. Plaster Material Estimator
// -------------------------------------------------------------
export interface PlasterMaterialResult {
  cementBags: number;
  sandCft: number;
  mortarVolumeCum: number;
}

export function estimatePlasterMaterials(
  area: number,
  unit: 'sqm' | 'sqft',
  thicknessMm: 12 | 15 | 20,
  mortarRatio: '1_3' | '1_4' | '1_5' | '1_6' = '1_4'
): PlasterMaterialResult {
  const areaSqm = unit === 'sqft' ? area / 10.7639 : area;
  const thicknessM = thicknessMm / 1000;

  const wetMortarVol = areaSqm * thicknessM;
  // Plaster has wastage + shrinkage dry factor of 1.33 + 0.15 (filling joints) = 1.35
  const dryMortarVol = wetMortarVol * 1.35;

  let cementPart = 1;
  let sandPart = 4;

  if (mortarRatio === '1_3') {
    cementPart = 1; sandPart = 3;
  } else if (mortarRatio === '1_4') {
    cementPart = 1; sandPart = 4;
  } else if (mortarRatio === '1_5') {
    cementPart = 1; sandPart = 5;
  } else {
    cementPart = 1; sandPart = 6;
  }

  const totalParts = cementPart + sandPart;
  const cementM3 = dryMortarVol * (cementPart / totalParts);
  const sandM3 = dryMortarVol * (sandPart / totalParts);

  const cementBags = cementM3 / 0.0347;
  const sandCft = sandM3 * 35.3147;

  return {
    cementBags: Math.ceil(cementBags),
    sandCft: Number(sandCft.toFixed(2)),
    mortarVolumeCum: Number(wetMortarVol.toFixed(3))
  };
}

// -------------------------------------------------------------
// 4. Flooring / Tiles Material Estimator
// -------------------------------------------------------------
export interface FlooringMaterialResult {
  tileCount: number;
  tileBoxes: number;
  adhesiveBags20kg: number;
  groutKg: number;
}

export function estimateFlooringMaterials(
  area: number,
  unit: 'sqm' | 'sqft',
  tileLengthFeet: number = 2,
  tileWidthFeet: number = 2,
  wastagePercent: number = 8,
  tilesPerBox: number = 4
): FlooringMaterialResult {
  const areaSqft = unit === 'sqm' ? area * 10.7639 : area;
  const areaSqm = unit === 'sqft' ? area / 10.7639 : area;

  const singleTileAreaSqft = tileLengthFeet * tileWidthFeet;
  const rawTileCount = areaSqft / singleTileAreaSqft;
  const tileCountWithWastage = rawTileCount * (1 + wastagePercent / 100);

  const tileBoxes = tileCountWithWastage / tilesPerBox;

  // Thin-bed tile adhesive coverage is approx 3.5 kg/sqm
  const totalAdhesiveKg = areaSqm * 3.5;
  const adhesiveBags = totalAdhesiveKg / 20; // 20 kg standard bag packing

  // Joint grouting consumption is approx 0.6 kg/sqm for standard joint dimensions
  const totalGroutKg = areaSqm * 0.6;

  return {
    tileCount: Math.ceil(tileCountWithWastage),
    tileBoxes: Math.ceil(tileBoxes),
    adhesiveBags20kg: Math.ceil(adhesiveBags),
    groutKg: Number(totalGroutKg.toFixed(1))
  };
}

// -------------------------------------------------------------
// 5. Painting Material Estimator
// -------------------------------------------------------------
export interface PaintingMaterialResult {
  paintLitres: number;
  primerLitres: number;
  puttyKg: number;
}

export function estimatePaintingMaterials(
  area: number,
  unit: 'sqm' | 'sqft',
  numCoats: number = 2
): PaintingMaterialResult {
  const areaSqft = unit === 'sqm' ? area * 10.7639 : area;

  // Wall putty coverage: approx 16 sqft/kg for 2 coats
  const puttyKg = areaSqft / 16;

  // Primer coverage: approx 100 sqft/litre for 1 coat
  const primerLitres = areaSqft / 100;

  // Paint coverage: approx 65 sqft/litre for 2 coats (depending on surface finish)
  const coveragePerCoat = 120; // sqft/litre per coat
  const paintLitres = (areaSqft / coveragePerCoat) * numCoats;

  return {
    paintLitres: Number(paintLitres.toFixed(1)),
    primerLitres: Number(primerLitres.toFixed(1)),
    puttyKg: Math.ceil(puttyKg)
  };
}

// -------------------------------------------------------------
// 6. Reinforcement Steel Weight Estimator
// -------------------------------------------------------------
export function estimateSteelWeightKg(
  diameterMm: number,
  lengthMetres: number,
  count: number
): number {
  if (diameterMm <= 0 || lengthMetres <= 0 || count <= 0) return 0;
  // Standard unit weight formula: D^2 / 162 kg/m
  const unitWeight = (diameterMm * diameterMm) / 162;
  const totalWeight = unitWeight * lengthMetres * count;
  return Number(totalWeight.toFixed(2));
}

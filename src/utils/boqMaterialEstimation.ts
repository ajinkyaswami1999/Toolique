// Indian Construction Material Estimation Engine for BOQ Line Items
// Compliant with IS 456:2000, IS 1786:2008, IS 1200, and CPWD DSR Specifications

// -------------------------------------------------------------
// 1. Concrete / PCC / RCC Material Estimator
// -------------------------------------------------------------
export interface ConcreteMaterialResult {
  cementBags: number;
  cementKg: number;
  sandCft: number;
  sandBrass: number;
  sandM3: number;
  aggregateCft: number;
  aggregateBrass: number;
  aggregate20mmCft: number;
  aggregate10mmCft: number;
  waterLitres: number;
  steelKg: number;
  steelTonnes: number;
}

export function estimateConcreteMaterials(
  volume: number, // volume of wet concrete
  unit: 'cum' | 'cft',
  mixGrade: 'pcc_1_5_10' | 'pcc_1_4_8' | 'pcc_1_3_6' | 'pcc_1_2_4' | 'm20' | 'm25' | 'm30' | 'custom' = 'm20',
  includeSteel: boolean = false,
  steelRatioKgPerCum: number = 80 // typical standard density: 80 kg/m3 for slabs/beams, 130 kg/m3 for columns/footings
): ConcreteMaterialResult {
  // Convert to cubic meters (CUM) for calculations
  const volCum = unit === 'cft' ? volume / 35.3147 : volume;

  // Dry volume of concrete is taken as 1.54 times the wet volume (IS 456 standard)
  const dryVol = volCum * 1.54;

  let cementPart = 1;
  let sandPart = 1.5;
  let aggregatePart = 3;

  switch (mixGrade) {
    case 'pcc_1_5_10': // M7.5
      cementPart = 1; sandPart = 5; aggregatePart = 10;
      break;
    case 'pcc_1_4_8': // M10 PCC
      cementPart = 1; sandPart = 4; aggregatePart = 8;
      break;
    case 'pcc_1_3_6': // M15 PCC
      cementPart = 1; sandPart = 3; aggregatePart = 6;
      break;
    case 'pcc_1_2_4': // M20 Nominal Mix (old standard)
      cementPart = 1; sandPart = 2; aggregatePart = 4;
      break;
    case 'm20': // M20 Standard (1:1.5:3)
      cementPart = 1; sandPart = 1.5; aggregatePart = 3;
      break;
    case 'm25': // M25 Standard (1:1:2)
      cementPart = 1; sandPart = 1; aggregatePart = 2;
      break;
    case 'm30': // M30 Design Mix (approx 1:0.75:1.5)
      cementPart = 1; sandPart = 0.75; aggregatePart = 1.5;
      break;
    case 'custom':
    default:
      cementPart = 1; sandPart = 1.5; aggregatePart = 3;
      break;
  }

  const sumParts = cementPart + sandPart + aggregatePart;

  const cementM3 = dryVol * (cementPart / sumParts);
  const sandM3 = dryVol * (sandPart / sumParts);
  const aggregateM3 = dryVol * (aggregatePart / sumParts);

  // 1 bag of cement = 50kg = 0.03472 m3 (Density: 1440 kg/m3)
  const cementBags = cementM3 / 0.03472;
  const cementKg = cementBags * 50;

  // Convert sand and aggregate to CFT (1 m3 = 35.3147 cft) & Brass (1 Brass = 100 cft)
  const sandCft = sandM3 * 35.3147;
  const sandBrass = sandCft / 100;
  const aggregateCft = aggregateM3 * 35.3147;
  const aggregateBrass = aggregateCft / 100;

  // Standard Indian coarse aggregate grading: 60% 20mm + 40% 10mm
  const aggregate20mmCft = aggregateCft * 0.60;
  const aggregate10mmCft = aggregateCft * 0.40;

  // Water estimate (approx 28-30 litres per cement bag for standard w/c ratio ~0.45-0.50)
  const waterLitres = cementBags * 28;

  // Steel estimation
  const steelKg = includeSteel ? volCum * steelRatioKgPerCum : 0;
  const steelTonnes = steelKg / 1000;

  return {
    cementBags: Math.ceil(cementBags),
    cementKg: Math.round(cementKg),
    sandCft: Number(sandCft.toFixed(2)),
    sandBrass: Number(sandBrass.toFixed(3)),
    sandM3: Number(sandM3.toFixed(3)),
    aggregateCft: Number(aggregateCft.toFixed(2)),
    aggregateBrass: Number(aggregateBrass.toFixed(3)),
    aggregate20mmCft: Number(aggregate20mmCft.toFixed(2)),
    aggregate10mmCft: Number(aggregate10mmCft.toFixed(2)),
    waterLitres: Math.round(waterLitres),
    steelKg: Math.round(steelKg),
    steelTonnes: Number(steelTonnes.toFixed(3))
  };
}

// -------------------------------------------------------------
// 2. Brickwork & Blockwork Material Estimator
// -------------------------------------------------------------
export interface BrickworkMaterialResult {
  brickCount: number;
  cementBags: number;
  sandCft: number;
  sandBrass: number;
  mortarVolumeCum: number;
}

export function estimateBrickworkMaterials(
  volume: number,
  unit: 'cum' | 'cft',
  brickType: 'modular' | 'standard' | 'aac_block' | 'fly_ash' | 'concrete_block' = 'standard',
  mortarRatio: '1_3' | '1_4' | '1_5' | '1_6' = '1_6'
): BrickworkMaterialResult {
  const volCum = unit === 'cft' ? volume / 35.3147 : volume;

  let bricksPerCum = 500; // modular 190x90x90 with mortar
  let mortarPercent = 0.30; // 30% mortar volume

  switch (brickType) {
    case 'modular':
      // Modular bricks 190x90x90 mm
      bricksPerCum = 500;
      mortarPercent = 0.30;
      break;
    case 'standard':
      // Traditional clay bricks 230x110x75 mm
      bricksPerCum = 412;
      mortarPercent = 0.25;
      break;
    case 'fly_ash':
      // Fly ash bricks 230x110x70 mm
      bricksPerCum = 440;
      mortarPercent = 0.25;
      break;
    case 'aac_block':
      // AAC Blocks 600x200x150 mm (Thin bed jointing adhesive)
      bricksPerCum = 56;
      mortarPercent = 0.10;
      break;
    case 'concrete_block':
      // Solid concrete blocks 400x200x150 mm
      bricksPerCum = 83;
      mortarPercent = 0.18;
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

  const cementBags = cementM3 / 0.03472;
  const sandCft = sandM3 * 35.3147;
  const sandBrass = sandCft / 100;

  return {
    brickCount,
    cementBags: Math.ceil(cementBags),
    sandCft: Number(sandCft.toFixed(2)),
    sandBrass: Number(sandBrass.toFixed(3)),
    mortarVolumeCum: Number(mortarVolWet.toFixed(3))
  };
}

// -------------------------------------------------------------
// 3. Plaster Material Estimator
// -------------------------------------------------------------
export interface PlasterMaterialResult {
  cementBags: number;
  sandCft: number;
  sandBrass: number;
  mortarVolumeCum: number;
}

export function estimatePlasterMaterials(
  area: number,
  unit: 'sqm' | 'sqft',
  thicknessMm: 6 | 12 | 15 | 20 = 12,
  mortarRatio: '1_3' | '1_4' | '1_5' | '1_6' = '1_4'
): PlasterMaterialResult {
  const areaSqm = unit === 'sqft' ? area / 10.7639 : area;
  const thicknessM = thicknessMm / 1000;

  const wetMortarVol = areaSqm * thicknessM;
  // Plaster has wastage + shrinkage dry factor of 1.33 + 0.02 (filling uneven joints) = 1.35
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

  const cementBags = cementM3 / 0.03472;
  const sandCft = sandM3 * 35.3147;
  const sandBrass = sandCft / 100;

  return {
    cementBags: Math.ceil(cementBags),
    sandCft: Number(sandCft.toFixed(2)),
    sandBrass: Number(sandBrass.toFixed(3)),
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
  beddingCementBags: number;
  beddingSandCft: number;
}

export function estimateFlooringMaterials(
  area: number,
  unit: 'sqm' | 'sqft',
  tileLengthFeet: number = 2,
  tileWidthFeet: number = 2,
  wastagePercent: number = 8,
  tilesPerBox: number = 4,
  beddingType: 'adhesive' | 'cement_mortar' = 'adhesive'
): FlooringMaterialResult {
  const areaSqft = unit === 'sqm' ? area * 10.7639 : area;
  const areaSqm = unit === 'sqft' ? area / 10.7639 : area;

  const singleTileAreaSqft = (tileLengthFeet || 2) * (tileWidthFeet || 2);
  const rawTileCount = areaSqft / (singleTileAreaSqft > 0 ? singleTileAreaSqft : 4);
  const tileCountWithWastage = rawTileCount * (1 + wastagePercent / 100);

  const tileBoxes = tileCountWithWastage / (tilesPerBox > 0 ? tilesPerBox : 4);

  // Thin-bed tile adhesive coverage is approx 3.5 kg/sqm (for 3-4mm notch trowel)
  const totalAdhesiveKg = beddingType === 'adhesive' ? areaSqm * 3.5 : 0;
  const adhesiveBags = totalAdhesiveKg / 20; // 20 kg standard bag packing

  // Joint grouting consumption is approx 0.6 kg/sqm for standard joint dimensions (2-3mm)
  const totalGroutKg = areaSqm * 0.6;

  // Traditional mortar bedding (25mm 1:4 mortar bed) if not using adhesive
  let beddingCementBags = 0;
  let beddingSandCft = 0;
  if (beddingType === 'cement_mortar') {
    const bedMortarWet = areaSqm * 0.025; // 25mm thick
    const bedMortarDry = bedMortarWet * 1.33;
    const cementM3 = bedMortarDry * (1 / 5);
    const sandM3 = bedMortarDry * (4 / 5);
    beddingCementBags = cementM3 / 0.03472;
    beddingSandCft = sandM3 * 35.3147;
  }

  return {
    tileCount: Math.ceil(tileCountWithWastage),
    tileBoxes: Math.ceil(tileBoxes),
    adhesiveBags20kg: Math.ceil(adhesiveBags),
    groutKg: Number(totalGroutKg.toFixed(1)),
    beddingCementBags: Math.ceil(beddingCementBags),
    beddingSandCft: Number(beddingSandCft.toFixed(2))
  };
}

// -------------------------------------------------------------
// 5. Painting & Finishing Material Estimator
// -------------------------------------------------------------
export interface PaintingMaterialResult {
  paintLitres: number;
  primerLitres: number;
  puttyKg: number;
  puttyBags40kg: number;
}

export function estimatePaintingMaterials(
  area: number,
  unit: 'sqm' | 'sqft',
  numCoats: number = 2
): PaintingMaterialResult {
  const areaSqft = unit === 'sqm' ? area * 10.7639 : area;

  // Wall putty coverage: approx 16 sqft/kg for 2 coats
  const puttyKg = areaSqft / 16;
  const puttyBags40kg = puttyKg / 40;

  // Primer coverage: approx 100 sqft/litre for 1 coat
  const primerLitres = areaSqft / 100;

  // Paint coverage: approx 65 sqft/litre for 2 coats (130 sqft/L per coat)
  const coveragePerCoat = 130;
  const paintLitres = (areaSqft / coveragePerCoat) * numCoats;

  return {
    paintLitres: Number(paintLitres.toFixed(1)),
    primerLitres: Number(primerLitres.toFixed(1)),
    puttyKg: Math.ceil(puttyKg),
    puttyBags40kg: Math.ceil(puttyBags40kg)
  };
}

// -------------------------------------------------------------
// 6. Reinforcement Steel Weight Estimator (IS 1786 Standard)
// -------------------------------------------------------------
export function estimateSteelWeightKg(
  diameterMm: number,
  lengthMetres: number,
  count: number = 1
): number {
  if (diameterMm <= 0 || lengthMetres <= 0 || count <= 0) return 0;
  // IS 1786 formula: D^2 / 162.2 kg/m
  const unitWeight = (diameterMm * diameterMm) / 162.2;
  const totalWeight = unitWeight * lengthMetres * count;
  return Number(totalWeight.toFixed(2));
}

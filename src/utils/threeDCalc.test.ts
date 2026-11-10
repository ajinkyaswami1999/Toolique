import { describe, it, expect } from 'vitest';
import { calculate3DPrintCosts, type CostCalculatorInputs } from './threeDCalc';

describe('3D Printing & Physical Manufacturing Cost Engine', () => {
  const baseFdmInput: CostCalculatorInputs = {
    printTechnology: 'fdm',
    name: 'Mechanical Gear Enclosure',
    category: 'Engineering Prototypes',
    filamentSlots: [
      {
        id: 'slot-1',
        name: 'PLA Standard Black',
        materialType: 'PLA',
        pricePerKg: 1000, // ₹1,000 / kg -> ₹1 / gram
        weightGrams: 200,
        isSupport: false,
      },
    ],
    filamentPrice: 1000,
    filamentUsed: 200,
    filamentWastage: 5, // 5%
    supportUsed: 30, // 30g
    failedWastage: 10, // 10g
    amsPurgeMultiplier: 0,
    resinType: 'Standard Resin',
    resinPricePerLiter: 1800,
    resinVolumeMl: 50,
    resinDensity: 1.1,
    washCostPerBatch: 20,
    cureTimeMinutes: 10,
    fepWearCostPerJob: 15,
    ppeCostPerJob: 12,
    printDuration: 10, // 10 hours
    electricityUnitCost: 8, // ₹8 / kWh
    printerWattage: 150, // 150 Watts -> 0.15 kW
    machineWearCost: 10, // ₹10 / hour
    maintenanceCost: 5, // ₹5 / hour
    printerPurchasePrice: 45000,
    designTime: 1, // 1 hour fixed
    slicingTime: 0.5, // 0.5 hours fixed
    postProcessingTime: 0.5, // 0.5 hours
    paintingTime: 0,
    packingTime: 0.25,
    labourRate: 200, // ₹200 / hr
    packingMaterialsCost: 30,
    shippingCost: 70,
    transactionFeePercentage: 2,
    gstPercentage: 18,
    profitMarginPercentage: 30,
    riskBufferPercentage: 5,
    orderQuantity: 1,
    customCosts: [],
  };

  it('accurately calculates FDM material, energy, and labour costs', () => {
    const res = calculate3DPrintCosts(baseFdmInput);

    // 1. Filament: 200g @ ₹1/g + 30g support @ ₹1/g + 5% wastage + 10g failure
    // Net grams = 200 + 30 + 10 = 240g + 5% on 200g (10g) = 250g -> ₹250
    expect(res.materialCost).toBeGreaterThanOrEqual(240);

    // 2. Power cost: 150W * 10 hrs = 1.5 kWh * ₹8 = ₹12
    expect(res.powerCost).toBeCloseTo(12, 1);

    // 3. Machine wear & maintenance: (10 + 5) * 10 hrs = ₹150
    expect(res.machineWearCost + res.maintenanceCost).toBeCloseTo(150, 1);

    // 4. Labour cost must be positive and computed from hourly rate
    expect(res.labourCost).toBeGreaterThan(0);

    // 5. Total cost and suggested retail price with profit margin
    expect(res.totalCost).toBeGreaterThan(res.materialCost);
    expect(res.sellingPrice).toBeGreaterThan(res.totalCost);
    expect(res.profitAmount).toBeGreaterThan(0);
  });

  it('accurately calculates SLA Resin material costs and chemical consumables', () => {
    const resinInput: CostCalculatorInputs = {
      ...baseFdmInput,
      printTechnology: 'resin',
      resinPricePerLiter: 2000, // ₹2 / ml
      resinVolumeMl: 100, // 100 ml -> ₹200 base resin
    };

    const res = calculate3DPrintCosts(resinInput);

    expect(res.materialCost).toBeGreaterThanOrEqual(200);
    // Wash, FEP wear, and PPE consumable additions
    expect(res.resinConsumablesCost).toBeGreaterThanOrEqual(
      resinInput.washCostPerBatch + resinInput.fepWearCostPerJob + resinInput.ppeCostPerJob
    );
  });

  it('scales cost per unit across batch orders (fixed labour amortized)', () => {
    const singleUnit = calculate3DPrintCosts({ ...baseFdmInput, orderQuantity: 1 });
    const batchOf10 = calculate3DPrintCosts({ ...baseFdmInput, orderQuantity: 10 });

    // Fixed design and slicing labour is amortized over 10 units, so per-unit cost must decrease!
    expect(batchOf10.costPerUnit).toBeLessThan(singleUnit.costPerUnit);
  });
});

export const DEFAULT_CIVIL_RATES = {
  cement: 420,       // ₹ per bag
  steel: 68,         // ₹ per kg
  sand: 65,          // ₹ per cu ft
  aggregate: 70,     // ₹ per cu ft
  bricks: 9,         // ₹ per brick
  shuttering: 35,    // ₹ per sq ft
  concreteMix: 4500, // ₹ per cubic meter
};

export const DEFAULT_ARCH_RATES = {
  tiles: 60,            // ₹ per sq ft
  tileLabor: 25,        // ₹ per sq ft
  paint: 350,           // ₹ per liter
  paintLabor: 12,       // ₹ per sq ft
  wallpaper: 1500,      // ₹ per roll
  wallpaperLabor: 350,  // ₹ per roll
  fitoutCost: 1200,     // ₹ per sq ft
};

export type CivilRateKey = keyof typeof DEFAULT_CIVIL_RATES;
export type ArchRateKey = keyof typeof DEFAULT_ARCH_RATES;

export interface HistoricalTrendPoint {
  year: number;
  price: number;
}

export interface MaterialTrend {
  unit: string;
  description: string;
  points: HistoricalTrendPoint[];
}

export const CIVIL_TREND_DATA: Record<string, MaterialTrend> = {
  cement: {
    unit: "₹/bag",
    description: "Cement prices rose due to higher raw material and coal costs in 2023-2024, stabilizing in 2025-2026.",
    points: [
      { year: 2021, price: 360 },
      { year: 2022, price: 390 },
      { year: 2023, price: 410 },
      { year: 2024, price: 425 },
      { year: 2025, price: 415 },
      { year: 2026, price: 420 }
    ]
  },
  steel: {
    unit: "₹/kg",
    description: "Steel experienced a major global supply-chain peak in 2023. Prices stabilized as domestic production ramped up.",
    points: [
      { year: 2021, price: 52 },
      { year: 2022, price: 65 },
      { year: 2023, price: 72 },
      { year: 2024, price: 69 },
      { year: 2025, price: 66 },
      { year: 2026, price: 68 }
    ]
  },
  sand: {
    unit: "₹/cu ft",
    description: "Sand costs are highly localized and have steadily increased due to regulatory mining restrictions.",
    points: [
      { year: 2021, price: 50 },
      { year: 2022, price: 55 },
      { year: 2023, price: 60 },
      { year: 2024, price: 63 },
      { year: 2025, price: 64 },
      { year: 2026, price: 65 }
    ]
  },
  aggregate: {
    unit: "₹/cu ft",
    description: "Coarse aggregate costs have risen in tandem with crushing, fuel, and transport expenses.",
    points: [
      { year: 2021, price: 55 },
      { year: 2022, price: 62 },
      { year: 2023, price: 68 },
      { year: 2024, price: 72 },
      { year: 2025, price: 71 },
      { year: 2026, price: 70 }
    ]
  },
  bricks: {
    unit: "₹/pcs",
    description: "Clay brick costs have trended upward due to environmental constraints on topsoil excavation and labor costs.",
    points: [
      { year: 2021, price: 6.5 },
      { year: 2022, price: 7.5 },
      { year: 2023, price: 8.2 },
      { year: 2024, price: 8.8 },
      { year: 2025, price: 9.0 },
      { year: 2026, price: 9.0 }
    ]
  },
  shuttering: {
    unit: "₹/sq ft",
    description: "Formwork and shuttering materials prices fluctuated with timber and metal sheet sourcing parameters.",
    points: [
      { year: 2021, price: 28 },
      { year: 2022, price: 32 },
      { year: 2023, price: 34 },
      { year: 2024, price: 36 },
      { year: 2025, price: 35 },
      { year: 2026, price: 35 }
    ]
  },
  concreteMix: {
    unit: "₹/m³",
    description: "Ready-mix concrete (RMC) prices reflect raw material cement aggregate compounding ratios.",
    points: [
      { year: 2021, price: 3800 },
      { year: 2022, price: 4100 },
      { year: 2023, price: 4400 },
      { year: 2024, price: 4600 },
      { year: 2025, price: 4450 },
      { year: 2026, price: 4500 }
    ]
  },
  constructionCost: {
    unit: "₹/sq ft",
    description: "Average standard residential construction cost per sq ft in India (Tier 1/2 Cities index).",
    points: [
      { year: 2021, price: 1400 },
      { year: 2022, price: 1520 },
      { year: 2023, price: 1610 },
      { year: 2024, price: 1680 },
      { year: 2025, price: 1630 },
      { year: 2026, price: 1650 }
    ]
  },
  // Architecture Trend Items
  tiles: {
    unit: "₹/sq ft",
    description: "Flooring tiles (vitrified & ceramic) pricing index reflecting clay, fuel, and kiln baking parameters.",
    points: [
      { year: 2021, price: 45 },
      { year: 2022, price: 50 },
      { year: 2023, price: 55 },
      { year: 2024, price: 58 },
      { year: 2025, price: 58 },
      { year: 2026, price: 60 }
    ]
  },
  paint: {
    unit: "₹/liter",
    description: "Premium grade interior emulsion paint costs index, highly influenced by crude chemical prices.",
    points: [
      { year: 2021, price: 280 },
      { year: 2022, price: 310 },
      { year: 2023, price: 340 },
      { year: 2024, price: 360 },
      { year: 2025, price: 345 },
      { year: 2026, price: 350 }
    ]
  },
  wallpaper: {
    unit: "₹/roll",
    description: "Designer wallpaper rolls standard index showing import duty and design printing spikes.",
    points: [
      { year: 2021, price: 1200 },
      { year: 2022, price: 1350 },
      { year: 2023, price: 1450 },
      { year: 2024, price: 1550 },
      { year: 2025, price: 1500 },
      { year: 2026, price: 1500 }
    ]
  },
  fitoutCost: {
    unit: "₹/sq ft",
    description: "Average comprehensive interior fit-out/carpentry labor and finishing index per square foot.",
    points: [
      { year: 2021, price: 950 },
      { year: 2022, price: 1085 },
      { year: 2023, price: 1150 },
      { year: 2024, price: 1220 },
      { year: 2025, price: 1180 },
      { year: 2026, price: 1200 }
    ]
  }
};

export const getStoredRates = (): typeof DEFAULT_CIVIL_RATES => {
  try {
    const stored = localStorage.getItem('civil_material_rates');
    if (stored) {
      return { ...DEFAULT_CIVIL_RATES, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('Error reading civil material rates:', e);
  }
  return DEFAULT_CIVIL_RATES;
};

export const saveStoredRates = (rates: Partial<typeof DEFAULT_CIVIL_RATES>) => {
  try {
    const current = getStoredRates();
    const updated = { ...current, ...rates };
    localStorage.setItem('civil_material_rates', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.error('Error saving civil material rates:', e);
  }
};

export const getStoredArchRates = (): typeof DEFAULT_ARCH_RATES => {
  try {
    const stored = localStorage.getItem('arch_finishing_rates');
    if (stored) {
      return { ...DEFAULT_ARCH_RATES, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('Error reading architecture finishing rates:', e);
  }
  return DEFAULT_ARCH_RATES;
};

export const saveStoredArchRates = (rates: Partial<typeof DEFAULT_ARCH_RATES>) => {
  try {
    const current = getStoredArchRates();
    const updated = { ...current, ...rates };
    localStorage.setItem('arch_finishing_rates', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.error('Error saving architecture finishing rates:', e);
  }
};

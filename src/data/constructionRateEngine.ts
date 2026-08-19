// Centralized Construction Cost Rate Engine for Architecture Tools website

export interface CityData {
  name: string;
  multiplier: number;
}

export interface StateData {
  name: string;
  cities: CityData[];
}

export interface CountryData {
  name: string;
  states: StateData[];
}

// 1. Configurable Locations and Multipliers
export const LOCATION_DATABASE: CountryData[] = [
  {
    name: "India",
    states: [
      {
        name: "Andhra Pradesh",
        cities: [
          { name: "Visakhapatnam", multiplier: 1.02 },
          { name: "Vijayawada", multiplier: 0.96 },
          { name: "Guntur", multiplier: 0.92 },
          { name: "Tirupati", multiplier: 0.94 },
          { name: "Nellore", multiplier: 0.88 }
        ]
      },
      {
        name: "Arunachal Pradesh",
        cities: [
          { name: "Itanagar", multiplier: 0.94 },
          { name: "Pasighat", multiplier: 0.85 },
          { name: "Naharlagun", multiplier: 0.90 }
        ]
      },
      {
        name: "Assam",
        cities: [
          { name: "Guwahati", multiplier: 0.96 },
          { name: "Dibrugarh", multiplier: 0.88 },
          { name: "Silchar", multiplier: 0.85 },
          { name: "Jorhat", multiplier: 0.86 }
        ]
      },
      {
        name: "Bihar",
        cities: [
          { name: "Patna", multiplier: 0.96 },
          { name: "Gaya", multiplier: 0.88 },
          { name: "Bhagalpur", multiplier: 0.85 },
          { name: "Muzaffarpur", multiplier: 0.86 }
        ]
      },
      {
        name: "Chhattisgarh",
        cities: [
          { name: "Raipur", multiplier: 0.92 },
          { name: "Bhilai", multiplier: 0.88 },
          { name: "Bilaspur", multiplier: 0.86 },
          { name: "Durg", multiplier: 0.84 }
        ]
      },
      {
        name: "Delhi NCR",
        cities: [
          { name: "New Delhi", multiplier: 1.20 },
          { name: "Noida", multiplier: 1.02 },
          { name: "Gurugram", multiplier: 1.08 },
          { name: "Ghaziabad", multiplier: 0.96 },
          { name: "Faridabad", multiplier: 0.95 }
        ]
      },
      {
        name: "Goa",
        cities: [
          { name: "Panaji", multiplier: 1.05 },
          { name: "Margao", multiplier: 0.98 },
          { name: "Vasco da Gama", multiplier: 0.96 },
          { name: "Mapusa", multiplier: 0.92 }
        ]
      },
      {
        name: "Gujarat",
        cities: [
          { name: "Ahmedabad", multiplier: 1.02 },
          { name: "Surat", multiplier: 1.00 },
          { name: "Vadodara", multiplier: 0.92 },
          { name: "Rajkot", multiplier: 0.88 },
          { name: "Bhavnagar", multiplier: 0.85 }
        ]
      },
      {
        name: "Haryana",
        cities: [
          { name: "Gurugram", multiplier: 1.08 },
          { name: "Faridabad", multiplier: 0.98 },
          { name: "Panipat", multiplier: 0.90 },
          { name: "Ambala", multiplier: 0.88 },
          { name: "Rohtak", multiplier: 0.86 }
        ]
      },
      {
        name: "Himachal Pradesh",
        cities: [
          { name: "Shimla", multiplier: 0.98 },
          { name: "Dharamshala", multiplier: 0.92 },
          { name: "Solan", multiplier: 0.88 },
          { name: "Mandi", multiplier: 0.85 }
        ]
      },
      {
        name: "Jharkhand",
        cities: [
          { name: "Ranchi", multiplier: 0.92 },
          { name: "Jamshedpur", multiplier: 0.95 },
          { name: "Dhanbad", multiplier: 0.88 },
          { name: "Bokaro", multiplier: 0.86 }
        ]
      },
      {
        name: "Karnataka",
        cities: [
          { name: "Bengaluru", multiplier: 1.15 },
          { name: "Mysuru", multiplier: 0.92 },
          { name: "Hubballi-Dharwad", multiplier: 0.88 },
          { name: "Mangaluru", multiplier: 0.95 },
          { name: "Belagavi", multiplier: 0.86 }
        ]
      },
      {
        name: "Kerala",
        cities: [
          { name: "Thiruvananthapuram", multiplier: 1.00 },
          { name: "Kochi", multiplier: 1.05 },
          { name: "Kozhikode", multiplier: 0.94 },
          { name: "Thrissur", multiplier: 0.92 },
          { name: "Kannur", multiplier: 0.90 }
        ]
      },
      {
        name: "Madhya Pradesh",
        cities: [
          { name: "Indore", multiplier: 0.98 },
          { name: "Bhopal", multiplier: 0.94 },
          { name: "Jabalpur", multiplier: 0.90 },
          { name: "Gwalior", multiplier: 0.88 },
          { name: "Ujjain", multiplier: 0.86 }
        ]
      },
      {
        name: "Maharashtra",
        cities: [
          { name: "Mumbai", multiplier: 1.25 },
          { name: "Pune", multiplier: 1.05 },
          { name: "Thane", multiplier: 1.15 },
          { name: "Nagpur", multiplier: 0.95 },
          { name: "Nashik", multiplier: 0.92 },
          { name: "Aurangabad", multiplier: 0.90 },
          { name: "Solapur", multiplier: 0.88 }
        ]
      },
      {
        name: "Manipur",
        cities: [
          { name: "Imphal", multiplier: 0.90 },
          { name: "Thoubal", multiplier: 0.82 }
        ]
      },
      {
        name: "Meghalaya",
        cities: [
          { name: "Shillong", multiplier: 0.95 },
          { name: "Tura", multiplier: 0.86 }
        ]
      },
      {
        name: "Mizoram",
        cities: [
          { name: "Aizawl", multiplier: 0.92 },
          { name: "Lunglei", multiplier: 0.84 }
        ]
      },
      {
        name: "Nagaland",
        cities: [
          { name: "Kohima", multiplier: 0.92 },
          { name: "Dimapur", multiplier: 0.88 }
        ]
      },
      {
        name: "Odisha",
        cities: [
          { name: "Bhubaneswar", multiplier: 0.94 },
          { name: "Cuttack", multiplier: 0.90 },
          { name: "Rourkela", multiplier: 0.88 },
          { name: "Sambalpur", multiplier: 0.85 }
        ]
      },
      {
        name: "Punjab",
        cities: [
          { name: "Ludhiana", multiplier: 0.98 },
          { name: "Amritsar", multiplier: 0.92 },
          { name: "Jalandhar", multiplier: 0.90 },
          { name: "Patiala", multiplier: 0.88 },
          { name: "Bathinda", multiplier: 0.85 }
        ]
      },
      {
        name: "Rajasthan",
        cities: [
          { name: "Jaipur", multiplier: 0.98 },
          { name: "Jodhpur", multiplier: 0.92 },
          { name: "Udaipur", multiplier: 0.90 },
          { name: "Kota", multiplier: 0.88 },
          { name: "Bikaner", multiplier: 0.85 }
        ]
      },
      {
        name: "Sikkim",
        cities: [
          { name: "Gangtok", multiplier: 0.96 },
          { name: "Namchi", multiplier: 0.88 }
        ]
      },
      {
        name: "Tamil Nadu",
        cities: [
          { name: "Chennai", multiplier: 1.12 },
          { name: "Coimbatore", multiplier: 1.00 },
          { name: "Madurai", multiplier: 0.90 },
          { name: "Tiruchirappalli", multiplier: 0.88 },
          { name: "Salem", multiplier: 0.86 }
        ]
      },
      {
        name: "Telangana",
        cities: [
          { name: "Hyderabad", multiplier: 1.10 },
          { name: "Warangal", multiplier: 0.90 },
          { name: "Nizamabad", multiplier: 0.86 },
          { name: "Karimnagar", multiplier: 0.88 }
        ]
      },
      {
        name: "Tripura",
        cities: [
          { name: "Agartala", multiplier: 0.88 },
          { name: "Dharmanagar", multiplier: 0.82 }
        ]
      },
      {
        name: "Uttar Pradesh",
        cities: [
          { name: "Lucknow", multiplier: 0.95 },
          { name: "Kanpur", multiplier: 0.92 },
          { name: "Noida", multiplier: 1.02 },
          { name: "Ghaziabad", multiplier: 0.96 },
          { name: "Agra", multiplier: 0.90 },
          { name: "Varanasi", multiplier: 0.88 },
          { name: "Prayagraj", multiplier: 0.86 },
          { name: "Meerut", multiplier: 0.90 }
        ]
      },
      {
        name: "Uttarakhand",
        cities: [
          { name: "Dehradun", multiplier: 0.94 },
          { name: "Haridwar", multiplier: 0.88 },
          { name: "Haldwani", multiplier: 0.86 },
          { name: "Roorkee", multiplier: 0.85 }
        ]
      },
      {
        name: "West Bengal",
        cities: [
          { name: "Kolkata", multiplier: 1.08 },
          { name: "Howrah", multiplier: 0.98 },
          { name: "Siliguri", multiplier: 0.90 },
          { name: "Durgapur", multiplier: 0.88 },
          { name: "Asansol", multiplier: 0.86 }
        ]
      },
      {
        name: "UT - Jammu & Kashmir",
        cities: [
          { name: "Srinagar", multiplier: 0.95 },
          { name: "Jammu", multiplier: 0.92 },
          { name: "Anantnag", multiplier: 0.85 }
        ]
      },
      {
        name: "UT - Ladakh",
        cities: [
          { name: "Leh", multiplier: 1.08 },
          { name: "Kargil", multiplier: 0.98 }
        ]
      },
      {
        name: "UT - Chandigarh",
        cities: [
          { name: "Chandigarh", multiplier: 1.04 }
        ]
      },
      {
        name: "UT - Puducherry",
        cities: [
          { name: "Puducherry", multiplier: 0.92 }
        ]
      },
      {
        name: "UT - Andaman & Nicobar",
        cities: [
          { name: "Port Blair", multiplier: 1.15 }
        ]
      }
    ]
  },
  {
    name: "United States",
    states: [
      {
        name: "California",
        cities: [
          { name: "Los Angeles", multiplier: 1.35 },
          { name: "San Francisco", multiplier: 1.55 },
          { name: "San Diego", multiplier: 1.28 },
          { name: "Sacramento", multiplier: 1.15 }
        ]
      },
      {
        name: "New York",
        cities: [
          { name: "New York City", multiplier: 1.50 },
          { name: "Buffalo", multiplier: 1.05 },
          { name: "Rochester", multiplier: 1.02 },
          { name: "Albany", multiplier: 1.08 }
        ]
      },
      {
        name: "Texas",
        cities: [
          { name: "Houston", multiplier: 0.98 },
          { name: "Austin", multiplier: 1.12 },
          { name: "Dallas", multiplier: 1.02 },
          { name: "San Antonio", multiplier: 0.95 }
        ]
      },
      {
        name: "Florida",
        cities: [
          { name: "Miami", multiplier: 1.18 },
          { name: "Orlando", multiplier: 1.05 },
          { name: "Tampa", multiplier: 1.02 },
          { name: "Jacksonville", multiplier: 0.98 }
        ]
      }
    ]
  }
];

// 2. Project Type Multipliers
export const PROJECT_TYPE_MULTIPLIERS: Record<string, number> = {
  residential: 1.00,
  commercial: 1.18,
  office: 1.12,
  retail: 1.22,
  other: 1.05
};

// 3. Construction Type Multipliers
export const CONSTRUCTION_TYPE_MULTIPLIERS: Record<string, number> = {
  rcc: 1.00,        // RCC Frame Structure
  load_bearing: 0.86, // Load Bearing
  steel: 1.15,      // Steel Structure
  composite: 1.08   // Composite
};

// 4. Quality Grade Multipliers
export const QUALITY_MULTIPLIERS: Record<string, number> = {
  basic: 0.82,
  standard: 1.00,
  premium: 1.30,
  luxury: 1.75
};

// Quality component rate allocations (₹ / sq.ft of built-up area under Bangalore/Pune Standard RCC Residential)
export interface QualityRates {
  structure: number;
  brickwork: number;
  flooring: number;
  doorsWindows: number;
  electrical: number;
  plumbing: number;
  painting: number;
  fixtures: number;
  finishing: number;
}

export const QUALITY_RATE_DATABASE: Record<string, QualityRates> = {
  basic: {
    structure: 600,
    brickwork: 150,
    flooring: 100,
    doorsWindows: 90,
    electrical: 80,
    plumbing: 70,
    painting: 60,
    fixtures: 40,
    finishing: 60
  },
  standard: {
    structure: 780,
    brickwork: 200,
    flooring: 150,
    doorsWindows: 140,
    electrical: 110,
    plumbing: 95,
    painting: 90,
    fixtures: 75,
    finishing: 100
  },
  premium: {
    structure: 1050,
    brickwork: 260,
    flooring: 220,
    doorsWindows: 200,
    electrical: 160,
    plumbing: 145,
    painting: 130,
    fixtures: 125,
    finishing: 160
  },
  luxury: {
    structure: 1480,
    brickwork: 380,
    flooring: 350,
    doorsWindows: 320,
    electrical: 240,
    plumbing: 220,
    painting: 200,
    fixtures: 210,
    finishing: 250
  }
};

// 5. Design Complexity Multipliers
export const COMPLEXITY_MULTIPLIERS: Record<string, { cost: number; duration: number }> = {
  simple: { cost: 0.90, duration: 0.85 },
  moderate: { cost: 1.00, duration: 1.00 },
  complex: { cost: 1.15, duration: 1.25 },
  highly_complex: { cost: 1.35, duration: 1.50 }
};

// 6. Site Condition Adjustments
export const SOIL_CONDITION_FACTORS: Record<string, { costMultiplier: number; durationMultiplier: number }> = {
  good: { costMultiplier: 0.95, durationMultiplier: 0.92 },
  normal: { costMultiplier: 1.00, durationMultiplier: 1.00 },
  poor: { costMultiplier: 1.20, durationMultiplier: 1.25 }, // Needs heavy foundation/piling
  unknown: { costMultiplier: 1.00, durationMultiplier: 1.00 }
};

export const ACCESSIBILITY_FACTORS: Record<string, { costMultiplier: number; durationMultiplier: number }> = {
  easy: { costMultiplier: 1.00, durationMultiplier: 1.00 },
  moderate: { costMultiplier: 1.05, durationMultiplier: 1.08 },
  difficult: { costMultiplier: 1.15, durationMultiplier: 1.20 }
};

export const SLOPE_FACTORS: Record<string, { costMultiplier: number; durationMultiplier: number }> = {
  flat: { costMultiplier: 1.00, durationMultiplier: 1.00 },
  slight: { costMultiplier: 1.06, durationMultiplier: 1.10 },
  steep: { costMultiplier: 1.22, durationMultiplier: 1.30 }
};

export const EXISTING_STRUCTURE_DEMOLITION: Record<string, number> = {
  none: 0,
  partial: 65000,  // ₹ flat addition
  major: 180000   // ₹ flat addition
};

// 7. Construction Method Adjustments
export const METHOD_FACTORS: Record<string, { costMultiplier: number; durationMultiplier: number }> = {
  conventional: { costMultiplier: 1.00, durationMultiplier: 1.00 },
  fast_track: { costMultiplier: 1.12, durationMultiplier: 0.78 },
  prefab: { costMultiplier: 1.15, durationMultiplier: 0.60 }, // Prefabricated/modular structural parts
  mixed: { costMultiplier: 1.05, durationMultiplier: 0.85 }
};

// 8. Base Component Estimates (unit, base rates before multipliers, basis of calculation)
export interface ComponentEstimateConfig {
  id: string;
  name: string;
  basis: "total_built_up_area" | "plot_area" | "ground_footprint" | "basement_area" | "kitchens" | "bathrooms" | "special_features" | "custom_rate";
  unit: string;
  baseRate: number; // In ₹ per basis unit
}

export const COMPONENT_CONFIG_LIST: ComponentEstimateConfig[] = [
  { id: "site_prep", name: "Site preparation", basis: "plot_area", unit: "sq.ft", baseRate: 15 },
  { id: "excavation", name: "Excavation & Earthwork", basis: "ground_footprint", unit: "sq.ft", baseRate: 40 },
  { id: "foundation", name: "Foundation work", basis: "ground_footprint", unit: "sq.ft", baseRate: 210 },
  { id: "plinth", name: "Plinth protection & beams", basis: "ground_footprint", unit: "sq.ft", baseRate: 110 },
  { id: "rcc_structural", name: "RCC structural frames (Columns/Beams)", basis: "total_built_up_area", unit: "sq.ft", baseRate: 520 },
  { id: "slab_roof", name: "Slab & Roofing work", basis: "total_built_up_area", unit: "sq.ft", baseRate: 140 },
  { id: "brickwork", name: "Brick/block work (Walls)", basis: "total_built_up_area", unit: "sq.ft", baseRate: 180 },
  { id: "plastering", name: "Internal & External plastering", basis: "total_built_up_area", unit: "sq.ft", baseRate: 110 },
  { id: "flooring", name: "Flooring & Skirting", basis: "total_built_up_area", unit: "sq.ft", baseRate: 160 },
  { id: "doors_windows", name: "Doors and Windows frames/shutters", basis: "total_built_up_area", unit: "sq.ft", baseRate: 130 },
  { id: "electrical", name: "Electrical wiring & conduits", basis: "total_built_up_area", unit: "sq.ft", baseRate: 105 },
  { id: "plumbing", name: "Plumbing pipes & sanitary rough-ins", basis: "total_built_up_area", unit: "sq.ft", baseRate: 90 },
  { id: "painting", name: "Painting (Primer + Putty + Coat)", basis: "total_built_up_area", unit: "sq.ft", baseRate: 85 },
  { id: "kitchen", name: "Kitchen counters & fitouts", basis: "kitchens", unit: "unit", baseRate: 85000 },
  { id: "bathrooms", name: "Bathrooms finishing & tiling", basis: "bathrooms", unit: "unit", baseRate: 48000 },
  { id: "false_ceiling", name: "False ceiling installation", basis: "total_built_up_area", unit: "sq.ft", baseRate: 45 }, // Default false ceiling is optional/partial
  { id: "external_dev", name: "External development (boundary, paving)", basis: "plot_area", unit: "sq.ft", baseRate: 25 },
  { id: "special_features", name: "Special items (Elevators, Smart features)", basis: "special_features", unit: "lump sum", baseRate: 0 },
  { id: "labour", name: "Labour & Supervision", basis: "custom_rate", unit: "man-days", baseRate: 0 },
  { id: "professional_fee", name: "Professional & Approval expenses", basis: "custom_rate", unit: "lump sum", baseRate: 0 },
  { id: "miscellaneous", name: "Miscellaneous / Unforeseen", basis: "custom_rate", unit: "lump sum", baseRate: 0 },
  { id: "contingency", name: "Project Contingency", basis: "custom_rate", unit: "percentage", baseRate: 0 }
];

// 9. Additional Features Costs (default rates in ₹)
export const ADDITIONAL_FEATURES_DATABASE: Record<string, { name: string; rate: number; isAreaBased?: boolean }> = {
  lift: { name: "Elevator / Lift", rate: 450000 },
  solar: { name: "Solar PV System (3kW-5kW)", rate: 160000 },
  hvac: { name: "Central HVAC / VRF System", rate: 250000 },
  false_ceiling_full: { name: "Full False Ceiling (Premium)", rate: 95, isAreaBased: true },
  modular_kitchen: { name: "Premium Modular Kitchen", rate: 120000 },
  wardrobes: { name: "Built-in Wardrobes (Per unit)", rate: 75000 },
  boundary_wall: { name: "Boundary Wall (Per running ft)", rate: 1400 },
  gate: { name: "Main Decorative Gate", rate: 45000 },
  landscaping: { name: "Garden / Landscaping (sq.ft)", rate: 120, isAreaBased: true },
  borewell: { name: "Borewell with pump", rate: 110000 },
  water_tank: { name: "Underground Sump + Overhead Tank", rate: 75000 },
  rainwater: { name: "Rainwater Harvesting system", rate: 28000 },
  fire_safety: { name: "Fire Hydrant / Smoke Detectors", rate: 45000 },
  parking: { name: "Paved Covered Parking Garage", rate: 90000 }
};

// 10. Default Material Costs
export const DEFAULT_MATERIAL_RATES = {
  cement: 430,       // ₹ per bag
  steel: 70,         // ₹ per kg
  sand: 72,          // ₹ per cu.ft
  aggregate: 75,     // ₹ per cu.ft
  bricks: 10,        // ₹ per piece
  tiles: 65,         // ₹ per sq.ft
  paint: 380,        // ₹ per liter
  electrical: 60,    // ₹ per sq.ft
  plumbing: 50       // ₹ per sq.ft
};

// Material coefficients: Quantity per square foot of Built-up Area
export const MATERIAL_COEFFICIENTS: Record<string, { coeff: number; unit: string; name: string }> = {
  cement: { coeff: 0.42, unit: "bags", name: "Cement" },
  steel: { coeff: 4.10, unit: "kg", name: "Steel" },
  sand: { coeff: 1.85, unit: "cu.ft", name: "Sand" },
  aggregate: { coeff: 1.40, unit: "cu.ft", name: "Coarse Aggregate" },
  bricks: { coeff: 21.0, unit: "pcs", name: "Bricks / Blocks" },
  tiles: { coeff: 0.85, unit: "sq.ft", name: "Flooring Tiles" },
  paint: { coeff: 0.18, unit: "liters", name: "Wall Paint" },
  electrical: { coeff: 1.00, unit: "sq.ft", name: "Electrical Conduits/Wiring" },
  plumbing: { coeff: 1.00, unit: "sq.ft", name: "Plumbing pipes/fittings" }
};

// 11. Construction Timeline Phases & Dependencies
export interface ConstructionPhase {
  id: string;
  name: string;
  baseDurationDays: number; // default duration for a 1000 sq ft standard building
  dependencies: string[];   // Phase IDs that must finish before this starts
  costPercentage: number;  // Approx phase cost allocation for visual table
}

export const TIMELINE_PHASES: ConstructionPhase[] = [
  { id: "planning", name: "Planning & Design", baseDurationDays: 20, dependencies: [], costPercentage: 2 },
  { id: "approvals", name: "Municipal Approvals", baseDurationDays: 30, dependencies: ["planning"], costPercentage: 2 },
  { id: "site_prep", name: "Site Preparation & Mobilization", baseDurationDays: 7, dependencies: ["approvals"], costPercentage: 1 },
  { id: "excavation", name: "Excavation", baseDurationDays: 10, dependencies: ["site_prep"], costPercentage: 2 },
  { id: "foundation", name: "Foundation Concrete", baseDurationDays: 25, dependencies: ["excavation"], costPercentage: 12 },
  { id: "plinth", name: "Plinth Beams & Backfilling", baseDurationDays: 15, dependencies: ["foundation"], costPercentage: 5 },
  { id: "rcc_structure", name: "RCC Columns, Beams & Slabs", baseDurationDays: 50, dependencies: ["plinth"], costPercentage: 22 },
  { id: "brickwork", name: "Brick & Block Work", baseDurationDays: 25, dependencies: ["rcc_structure"], costPercentage: 9 },
  { id: "plumbing_rough", name: "Plumbing Rough-in", baseDurationDays: 12, dependencies: ["brickwork"], costPercentage: 3 },
  { id: "electrical_rough", name: "Electrical Rough-in", baseDurationDays: 12, dependencies: ["brickwork"], costPercentage: 4 },
  { id: "plastering", name: "Plastering (Internal & External)", baseDurationDays: 20, dependencies: ["plumbing_rough", "electrical_rough"], costPercentage: 8 },
  { id: "flooring", name: "Flooring Tiling", baseDurationDays: 18, dependencies: ["plastering"], costPercentage: 7 },
  { id: "doors_windows", name: "Doors & Windows installation", baseDurationDays: 12, dependencies: ["plastering"], costPercentage: 5 },
  { id: "painting", name: "Painting & Wall Finishes", baseDurationDays: 15, dependencies: ["flooring", "doors_windows"], costPercentage: 5 },
  { id: "kitchen_finishing", name: "Kitchen Counter & Woodwork", baseDurationDays: 10, dependencies: ["plastering", "flooring"], costPercentage: 4 },
  { id: "bathroom_finishing", name: "Bathroom Tiles & Fixtures", baseDurationDays: 12, dependencies: ["plumbing_rough", "flooring"], costPercentage: 3 },
  { id: "false_ceiling", name: "False Ceiling & Lighting", baseDurationDays: 8, dependencies: ["electrical_rough", "plastering"], costPercentage: 2 },
  { id: "external_works", name: "External Paving & boundary", baseDurationDays: 15, dependencies: ["rcc_structure"], costPercentage: 3 },
  { id: "fixtures", name: "Electrical & Sanitary Fixtures", baseDurationDays: 10, dependencies: ["painting", "bathroom_finishing"], costPercentage: 2 },
  { id: "inspection", name: "Final Inspection & Testing", baseDurationDays: 7, dependencies: ["fixtures", "kitchen_finishing", "false_ceiling"], costPercentage: 1 },
  { id: "handover", name: "Finishing Cleans & Handover", baseDurationDays: 5, dependencies: ["inspection", "external_works"], costPercentage: 1 }
];

// Helper to calculate CPM timeline ranges (Critical Path Method)
// Returns start day and end day for each phase relative to day 0
export function calculateCPM(
  builtUpArea: number,
  numFloors: number,
  constructionType: string,
  quality: string,
  complexity: string,
  soil: string,
  accessibility: string,
  laborStrengthRatio: number,
  method: string
): Record<string, { startDay: number; endDay: number; durationDays: number }> {
  
  // 1. Compute global duration scaling factor based on area
  // Area duration scaling is non-linear (e.g. 2000 sq ft takes about 1.4x duration of 1000 sq ft, not 2x)
  const areaFactor = Math.pow(builtUpArea / 1000, 0.42);
  
  // Floor factor: +15% duration for each additional floor above 1
  const floorFactor = 1 + (numFloors - 1) * 0.15;
  
  // Quality factor: luxury takes longer
  let qualityFactor = 1.0;
  if (quality === "premium") qualityFactor = 1.10;
  else if (quality === "luxury") qualityFactor = 1.25;
  else if (quality === "basic") qualityFactor = 0.90;

  // Complexity duration factor
  const complexityFactor = COMPLEXITY_MULTIPLIERS[complexity]?.duration || 1.0;

  // Method factor
  const methodFactor = METHOD_FACTORS[method]?.durationMultiplier || 1.0;

  // Labor strength factor: less labor slows down, more labor speeds up slightly (diminishing returns)
  // laborStrengthRatio = actual labor strength / auto-estimated labor strength
  let laborFactor = 1.0;
  if (laborStrengthRatio < 1) {
    // If labor is 50%, duration multiplier is 1.6
    laborFactor = 1 + (1 - laborStrengthRatio) * 1.2; 
  } else if (laborStrengthRatio > 1) {
    // If labor is 150%, duration multiplier is 0.85
    laborFactor = Math.max(0.75, 1 - (laborStrengthRatio - 1) * 0.3);
  }
  laborFactor = Math.min(2.0, Math.max(0.75, laborFactor)); // bound it

  // Site accessibility factor (applies globally as site ingress/egress limits material logistics speed)
  const accessFactor = ACCESSIBILITY_FACTORS[accessibility]?.durationMultiplier || 1.0;
  
  // Soil factor (affects foundation phase only, so handled inside phase loop)
  const soilFactor = SOIL_CONDITION_FACTORS[soil]?.durationMultiplier || 1.0;

  // Structure type duration factor
  let structureFactor = 1.0;
  if (constructionType === "load_bearing") structureFactor = 0.85;
  else if (constructionType === "steel") structureFactor = 0.65; // Steel structure is much faster
  else if (constructionType === "composite") structureFactor = 0.80;

  const results: Record<string, { startDay: number; endDay: number; durationDays: number }> = {};
  
  // Topological sort order processing
  // Since TIMELINE_PHASES is defined in proper topological order, we can solve start/end days sequentially
  for (const phase of TIMELINE_PHASES) {
    // Determine base duration for this phase
    let duration = phase.baseDurationDays;
    
    // Scale duration based on project variables
    duration = duration * areaFactor * floorFactor * qualityFactor * complexityFactor * methodFactor * laborFactor * accessFactor;
    
    // Phase-specific adjustments
    if (phase.id === "foundation") {
      duration = duration * soilFactor;
    }
    if (phase.id === "rcc_structure" || phase.id === "brickwork") {
      duration = duration * structureFactor;
    }
    
    // Round to whole days
    const durationDays = Math.max(2, Math.round(duration));
    
    // Determine start day based on maximum end day of all dependencies
    let startDay = 0;
    if (phase.dependencies.length > 0) {
      for (const depId of phase.dependencies) {
        if (results[depId]) {
          startDay = Math.max(startDay, results[depId].endDay);
        }
      }
    }
    
    results[phase.id] = {
      startDay,
      endDay: startDay + durationDays,
      durationDays
    };
  }
  
  return results;
}

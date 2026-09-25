/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from 'react';
import {
  Zap,
  Sparkles,
  Copy,
  Check,
  Plus,
  Trash2,
  Sun,
  Leaf,
  Home,
  Building2,
  Activity,
  TrendingDown,
  Download
} from 'lucide-react';

// --- Type Definitions ---
export type CalculatorMode = 'inventory' | 'single_compare' | 'tariff_slabs' | 'solar_offset' | 'carbon';
export type RoomType = 'Living Room' | 'Bedrooms' | 'Kitchen' | 'Bathrooms' | 'Home Office' | 'Utility / Outdoor';
export type ApplianceCategory = 'Cooling & Heating' | 'Lighting' | 'Kitchen' | 'Computing & Entertainment' | 'Motors & Water' | 'Heavy Loads';

export interface ApplianceItem {
  id: string;
  name: string;
  category: ApplianceCategory;
  room: RoomType;
  wattage: number; // Watts
  qty: number;
  hoursPerDay: number; // 0.1 to 24
  daysPerMonth: number; // 1 to 30
  dutyCycle: number; // Percentage (e.g. 50% for inverter AC/fridge compressor)
}

export interface TariffSlab {
  minUnits: number;
  maxUnits: number | null; // null = infinity
  ratePerUnit: number; // in active currency
}

export interface PresetHome {
  id: string;
  name: string;
  subtitle: string;
  icon: any;
  items: Omit<ApplianceItem, 'id'>[];
}

// --- Pre-configured Appliances Database (30+ Devices) ---
const APPLIANCE_DATABASE: { name: string; category: ApplianceCategory; defaultWatts: number; defaultHours: number; defaultDuty: number; defaultRoom: RoomType }[] = [
  // Cooling & Heating
  { name: '1.5 Ton 5-Star Inverter AC', category: 'Cooling & Heating', defaultWatts: 1400, defaultHours: 8, defaultDuty: 60, defaultRoom: 'Bedrooms' },
  { name: '1.5 Ton 3-Star Non-Inverter AC', category: 'Cooling & Heating', defaultWatts: 1850, defaultHours: 8, defaultDuty: 75, defaultRoom: 'Bedrooms' },
  { name: '1.0 Ton Split AC', category: 'Cooling & Heating', defaultWatts: 1100, defaultHours: 8, defaultDuty: 60, defaultRoom: 'Bedrooms' },
  { name: 'BLDC Ceiling Fan (Energy Saving)', category: 'Cooling & Heating', defaultWatts: 28, defaultHours: 12, defaultDuty: 100, defaultRoom: 'Living Room' },
  { name: 'Standard Induction Ceiling Fan', category: 'Cooling & Heating', defaultWatts: 75, defaultHours: 12, defaultDuty: 100, defaultRoom: 'Living Room' },
  { name: 'Desert Air Cooler', category: 'Cooling & Heating', defaultWatts: 200, defaultHours: 10, defaultDuty: 100, defaultRoom: 'Living Room' },
  { name: 'Room Heater / Oil Radiator', category: 'Cooling & Heating', defaultWatts: 2000, defaultHours: 4, defaultDuty: 70, defaultRoom: 'Bedrooms' },

  // Kitchen Appliances
  { name: 'Double Door Refrigerator (300L)', category: 'Kitchen', defaultWatts: 180, defaultHours: 24, defaultDuty: 40, defaultRoom: 'Kitchen' },
  { name: 'Single Door Refrigerator (190L)', category: 'Kitchen', defaultWatts: 120, defaultHours: 24, defaultDuty: 45, defaultRoom: 'Kitchen' },
  { name: 'Microwave Oven (Grill/Convection)', category: 'Kitchen', defaultWatts: 1200, defaultHours: 0.5, defaultDuty: 100, defaultRoom: 'Kitchen' },
  { name: 'Electric Kettle', category: 'Kitchen', defaultWatts: 1500, defaultHours: 0.3, defaultDuty: 100, defaultRoom: 'Kitchen' },
  { name: 'Induction Cooktop', category: 'Kitchen', defaultWatts: 1800, defaultHours: 1.5, defaultDuty: 80, defaultRoom: 'Kitchen' },
  { name: 'Mixer Grinder / Blender', category: 'Kitchen', defaultWatts: 750, defaultHours: 0.3, defaultDuty: 100, defaultRoom: 'Kitchen' },
  { name: 'Dishwasher', category: 'Kitchen', defaultWatts: 1400, defaultHours: 1.2, defaultDuty: 80, defaultRoom: 'Kitchen' },
  { name: 'RO Water Purifier', category: 'Kitchen', defaultWatts: 60, defaultHours: 4, defaultDuty: 100, defaultRoom: 'Kitchen' },
  { name: 'Air Fryer', category: 'Kitchen', defaultWatts: 1500, defaultHours: 0.5, defaultDuty: 80, defaultRoom: 'Kitchen' },

  // Water & Bath
  { name: 'Storage Geyser / Water Heater (25L)', category: 'Motors & Water', defaultWatts: 2000, defaultHours: 1.5, defaultDuty: 80, defaultRoom: 'Bathrooms' },
  { name: 'Instant Geyser (3L)', category: 'Motors & Water', defaultWatts: 3000, defaultHours: 0.5, defaultDuty: 100, defaultRoom: 'Bathrooms' },
  { name: 'Water Pump / Submersible Motor (1 HP)', category: 'Motors & Water', defaultWatts: 750, defaultHours: 1.0, defaultDuty: 100, defaultRoom: 'Utility / Outdoor' },
  { name: 'Washing Machine (Front Load 7kg)', category: 'Motors & Water', defaultWatts: 1200, defaultHours: 1.0, defaultDuty: 60, defaultRoom: 'Utility / Outdoor' },
  { name: 'Washing Machine (Top Load 6.5kg)', category: 'Motors & Water', defaultWatts: 450, defaultHours: 1.0, defaultDuty: 80, defaultRoom: 'Utility / Outdoor' },

  // Lighting
  { name: 'LED Tube Light (20W)', category: 'Lighting', defaultWatts: 20, defaultHours: 6, defaultDuty: 100, defaultRoom: 'Living Room' },
  { name: 'LED Bulb (9W)', category: 'Lighting', defaultWatts: 9, defaultHours: 6, defaultDuty: 100, defaultRoom: 'Bedrooms' },
  { name: 'LED Downlight / Spotlight (12W)', category: 'Lighting', defaultWatts: 12, defaultHours: 5, defaultDuty: 100, defaultRoom: 'Living Room' },
  { name: 'Legacy Incandescent Bulb (60W)', category: 'Lighting', defaultWatts: 60, defaultHours: 6, defaultDuty: 100, defaultRoom: 'Living Room' },

  // Computing & Entertainment
  { name: 'Smart LED TV 55-inch', category: 'Computing & Entertainment', defaultWatts: 110, defaultHours: 5, defaultDuty: 100, defaultRoom: 'Living Room' },
  { name: 'Home Theatre Soundbar & Subwoofer', category: 'Computing & Entertainment', defaultWatts: 120, defaultHours: 3, defaultDuty: 100, defaultRoom: 'Living Room' },
  { name: 'Laptop Computer (Workstation)', category: 'Computing & Entertainment', defaultWatts: 65, defaultHours: 8, defaultDuty: 80, defaultRoom: 'Home Office' },
  { name: 'Gaming Desktop PC with Dedicated GPU', category: 'Computing & Entertainment', defaultWatts: 450, defaultHours: 5, defaultDuty: 80, defaultRoom: 'Home Office' },
  { name: 'Dual Monitor (27-inch LED)', category: 'Computing & Entertainment', defaultWatts: 50, defaultHours: 8, defaultDuty: 100, defaultRoom: 'Home Office' },
  { name: 'Wi-Fi Router & Fiber ONT', category: 'Computing & Entertainment', defaultWatts: 15, defaultHours: 24, defaultDuty: 100, defaultRoom: 'Living Room' },
  { name: 'Set Top Box / Streaming Device', category: 'Computing & Entertainment', defaultWatts: 20, defaultHours: 6, defaultDuty: 100, defaultRoom: 'Living Room' },
  { name: 'Electric Iron', category: 'Heavy Loads', defaultWatts: 1200, defaultHours: 0.5, defaultDuty: 70, defaultRoom: 'Utility / Outdoor' },
  { name: 'EV 2-Wheeler Charger (Slow AC)', category: 'Heavy Loads', defaultWatts: 750, defaultHours: 4, defaultDuty: 100, defaultRoom: 'Utility / Outdoor' },
  { name: 'EV 4-Wheeler Level 2 Home Wallbox (7.4 kW)', category: 'Heavy Loads', defaultWatts: 7400, defaultHours: 4, defaultDuty: 100, defaultRoom: 'Utility / Outdoor' }
];

// --- Household Presets ---
const PRESET_HOMES: PresetHome[] = [
  {
    id: '2bhk_urban',
    name: 'Typical 2BHK Urban Apartment',
    subtitle: '1 AC, 1 Refrigerator, 3 Fans, 6 LEDs, TV & Wi-Fi',
    icon: Home,
    items: [
      { name: '1.5 Ton 5-Star Inverter AC', category: 'Cooling & Heating', room: 'Bedrooms', wattage: 1400, qty: 1, hoursPerDay: 8, daysPerMonth: 30, dutyCycle: 60 },
      { name: 'Double Door Refrigerator (300L)', category: 'Kitchen', room: 'Kitchen', wattage: 180, qty: 1, hoursPerDay: 24, daysPerMonth: 30, dutyCycle: 40 },
      { name: 'BLDC Ceiling Fan (Energy Saving)', category: 'Cooling & Heating', room: 'Living Room', wattage: 28, qty: 3, hoursPerDay: 12, daysPerMonth: 30, dutyCycle: 100 },
      { name: 'LED Tube Light (20W)', category: 'Lighting', room: 'Living Room', wattage: 20, qty: 4, hoursPerDay: 6, daysPerMonth: 30, dutyCycle: 100 },
      { name: 'LED Bulb (9W)', category: 'Lighting', room: 'Bedrooms', wattage: 9, qty: 4, hoursPerDay: 5, daysPerMonth: 30, dutyCycle: 100 },
      { name: 'Smart LED TV 55-inch', category: 'Computing & Entertainment', room: 'Living Room', wattage: 110, qty: 1, hoursPerDay: 5, daysPerMonth: 30, dutyCycle: 100 },
      { name: 'Wi-Fi Router & Fiber ONT', category: 'Computing & Entertainment', room: 'Living Room', wattage: 15, qty: 1, hoursPerDay: 24, daysPerMonth: 30, dutyCycle: 100 },
      { name: 'Storage Geyser (25L)', category: 'Motors & Water', room: 'Bathrooms', wattage: 2000, qty: 1, hoursPerDay: 1, daysPerMonth: 30, dutyCycle: 80 },
      { name: 'Washing Machine (Front Load 7kg)', category: 'Motors & Water', room: 'Utility / Outdoor', wattage: 1200, qty: 1, hoursPerDay: 1, daysPerMonth: 15, dutyCycle: 60 }
    ]
  },
  {
    id: '3bhk_family',
    name: '3BHK Executive Home (High Usage)',
    subtitle: '3 ACs, Microwave, Dishwasher, EV 2W Charger, Gaming PC',
    icon: Building2,
    items: [
      { name: '1.5 Ton 5-Star Inverter AC', category: 'Cooling & Heating', room: 'Bedrooms', wattage: 1400, qty: 3, hoursPerDay: 8, daysPerMonth: 30, dutyCycle: 60 },
      { name: 'Double Door Refrigerator (300L)', category: 'Kitchen', room: 'Kitchen', wattage: 200, qty: 1, hoursPerDay: 24, daysPerMonth: 30, dutyCycle: 45 },
      { name: 'BLDC Ceiling Fan', category: 'Cooling & Heating', room: 'Living Room', wattage: 28, qty: 5, hoursPerDay: 14, daysPerMonth: 30, dutyCycle: 100 },
      { name: 'LED Downlight / Spotlight (12W)', category: 'Lighting', room: 'Living Room', wattage: 12, qty: 10, hoursPerDay: 6, daysPerMonth: 30, dutyCycle: 100 },
      { name: 'Storage Geyser (25L)', category: 'Motors & Water', room: 'Bathrooms', wattage: 2000, qty: 2, hoursPerDay: 1.5, daysPerMonth: 30, dutyCycle: 80 },
      { name: 'Water Pump / Submersible Motor (1 HP)', category: 'Motors & Water', room: 'Utility / Outdoor', wattage: 750, qty: 1, hoursPerDay: 1.5, daysPerMonth: 30, dutyCycle: 100 },
      { name: 'Microwave Oven', category: 'Kitchen', room: 'Kitchen', wattage: 1200, qty: 1, hoursPerDay: 0.5, daysPerMonth: 30, dutyCycle: 100 },
      { name: 'Induction Cooktop', category: 'Kitchen', room: 'Kitchen', wattage: 1800, qty: 1, hoursPerDay: 1.5, daysPerMonth: 30, dutyCycle: 80 },
      { name: 'Gaming Desktop PC', category: 'Computing & Entertainment', room: 'Home Office', wattage: 450, qty: 1, hoursPerDay: 6, daysPerMonth: 30, dutyCycle: 80 },
      { name: 'EV 2-Wheeler Charger', category: 'Heavy Loads', room: 'Utility / Outdoor', wattage: 750, qty: 1, hoursPerDay: 4, daysPerMonth: 20, dutyCycle: 100 }
    ]
  },
  {
    id: 'wfh_studio',
    name: 'Home Office / WFH Studio',
    subtitle: 'Dual Monitors, Laptops, Studio Lighting, 1 Ton AC, Router',
    icon: Activity,
    items: [
      { name: '1.0 Ton Split AC', category: 'Cooling & Heating', room: 'Home Office', wattage: 1100, qty: 1, hoursPerDay: 9, daysPerMonth: 22, dutyCycle: 55 },
      { name: 'Laptop Computer (Workstation)', category: 'Computing & Entertainment', room: 'Home Office', wattage: 65, qty: 2, hoursPerDay: 9, daysPerMonth: 22, dutyCycle: 80 },
      { name: 'Dual Monitor (27-inch LED)', category: 'Computing & Entertainment', room: 'Home Office', wattage: 50, qty: 2, hoursPerDay: 9, daysPerMonth: 22, dutyCycle: 100 },
      { name: 'Wi-Fi Router & Mesh Pods', category: 'Computing & Entertainment', room: 'Home Office', wattage: 25, qty: 1, hoursPerDay: 24, daysPerMonth: 30, dutyCycle: 100 },
      { name: 'LED Tube Light (20W)', category: 'Lighting', room: 'Home Office', wattage: 20, qty: 2, hoursPerDay: 10, daysPerMonth: 22, dutyCycle: 100 },
      { name: 'BLDC Ceiling Fan', category: 'Cooling & Heating', room: 'Home Office', wattage: 28, qty: 1, hoursPerDay: 10, daysPerMonth: 22, dutyCycle: 100 }
    ]
  }
];

// Standard Indian Tiered Slab Tariff Default
const DEFAULT_SLABS: TariffSlab[] = [
  { minUnits: 0, maxUnits: 100, ratePerUnit: 4.5 },
  { minUnits: 101, maxUnits: 300, ratePerUnit: 7.2 },
  { minUnits: 301, maxUnits: 500, ratePerUnit: 9.8 },
  { minUnits: 501, maxUnits: null, ratePerUnit: 12.5 }
];

export default function PowerConsumptionCalculator() {
  // Navigation & Mode
  const [activeMode, setActiveMode] = useState<CalculatorMode>('inventory');
  const [currency, setCurrency] = useState<string>('₹');
  const [flatRate, setFlatRate] = useState<number>(7.5);
  const [useTieredTariff, setUseTieredTariff] = useState<boolean>(true);
  const [fixedCharges, setFixedCharges] = useState<number>(120); // Monthly fixed meter charge
  const [taxRatePercent, setTaxRatePercent] = useState<number>(9); // 9% electricity duty
  const [solarSunHours, setSolarSunHours] = useState<number>(4.5); // Peak Sun Hours (PSH)

  // Live Appliance Inventory State
  const [inventory, setInventory] = useState<ApplianceItem[]>(() => {
    return PRESET_HOMES[0].items.map((it, idx) => ({
      ...it,
      id: `init-${idx}-${Date.now()}`
    }));
  });

  // New Custom Appliance Modal/Input State
  const [selectedDbIndex, setSelectedDbIndex] = useState<number>(0);

  // Single Device Compare State (Mode 2)
  const [compAppA, setCompAppA] = useState({ name: 'Old Induction Ceiling Fan', watts: 75, hours: 12, costPerWatt: 0 });
  const [compAppB, setCompAppB] = useState({ name: 'New 5-Star BLDC Fan', watts: 28, hours: 12, purchaseCost: 3200 });

  // Copy Feedback
  const [copied, setCopied] = useState<boolean>(false);

  // --- Compute Inventory Totals ---
  const inventoryMetrics = useMemo(() => {
    let totalConnectedWatts = 0;
    let dailyKwh = 0;
    let monthlyKwh = 0;

    const categoryBreakdown: Record<ApplianceCategory, { kwh: number; watts: number; cost: number }> = {
      'Cooling & Heating': { kwh: 0, watts: 0, cost: 0 },
      'Lighting': { kwh: 0, watts: 0, cost: 0 },
      'Kitchen': { kwh: 0, watts: 0, cost: 0 },
      'Computing & Entertainment': { kwh: 0, watts: 0, cost: 0 },
      'Motors & Water': { kwh: 0, watts: 0, cost: 0 },
      'Heavy Loads': { kwh: 0, watts: 0, cost: 0 }
    };

    const roomBreakdown: Record<RoomType, { kwh: number; watts: number; cost: number }> = {
      'Living Room': { kwh: 0, watts: 0, cost: 0 },
      'Bedrooms': { kwh: 0, watts: 0, cost: 0 },
      'Kitchen': { kwh: 0, watts: 0, cost: 0 },
      'Bathrooms': { kwh: 0, watts: 0, cost: 0 },
      'Home Office': { kwh: 0, watts: 0, cost: 0 },
      'Utility / Outdoor': { kwh: 0, watts: 0, cost: 0 }
    };

    inventory.forEach(item => {
      const activeWatts = item.wattage * item.qty;
      totalConnectedWatts += activeWatts;

      // Effective daily kWh = Watts * Hours * (Duty% / 100) / 1000
      const effectiveHours = item.hoursPerDay * (item.dutyCycle / 100);
      const itemDailyKwh = (activeWatts * effectiveHours) / 1000;
      const itemMonthlyKwh = (itemDailyKwh * (item.daysPerMonth / 30)) * 30; // normalized to 30 days

      dailyKwh += itemDailyKwh;
      monthlyKwh += itemMonthlyKwh;

      if (categoryBreakdown[item.category]) {
        categoryBreakdown[item.category].kwh += itemMonthlyKwh;
        categoryBreakdown[item.category].watts += activeWatts;
      }
      if (roomBreakdown[item.room]) {
        roomBreakdown[item.room].kwh += itemMonthlyKwh;
        roomBreakdown[item.room].watts += activeWatts;
      }
    });

    const yearlyKwh = monthlyKwh * 12;

    return {
      totalConnectedWatts,
      dailyKwh,
      monthlyKwh,
      yearlyKwh,
      categoryBreakdown,
      roomBreakdown
    };
  }, [inventory]);

  // --- Compute Electricity Bill with Tiered Slabs & Taxes ---
  const billMetrics = useMemo(() => {
    const units = inventoryMetrics.monthlyKwh;
    let baseEnergyCost = 0;
    const slabBreakdown: { label: string; unitsInSlab: number; rate: number; cost: number }[] = [];

    if (useTieredTariff) {
      let remainingUnits = units;

      for (const slab of DEFAULT_SLABS) {
        if (remainingUnits <= 0) break;

        const slabCapacity = slab.maxUnits !== null ? slab.maxUnits - slab.minUnits + (slab.minUnits === 0 ? 0 : 1) : Infinity;
        const unitsCharged = Math.min(remainingUnits, slabCapacity);
        const cost = unitsCharged * slab.ratePerUnit;

        baseEnergyCost += cost;
        remainingUnits -= unitsCharged;

        slabBreakdown.push({
          label: slab.maxUnits !== null ? `${slab.minUnits} - ${slab.maxUnits} units` : `> ${slab.minUnits} units`,
          unitsInSlab: unitsCharged,
          rate: slab.ratePerUnit,
          cost
        });
      }
    } else {
      baseEnergyCost = units * flatRate;
      slabBreakdown.push({
        label: `Flat Tariff (${units.toFixed(1)} units)`,
        unitsInSlab: units,
        rate: flatRate,
        cost: baseEnergyCost
      });
    }

    const electricityDuty = (baseEnergyCost + fixedCharges) * (taxRatePercent / 100);
    const totalMonthlyBill = baseEnergyCost + fixedCharges + electricityDuty;
    const totalYearlyBill = totalMonthlyBill * 12;
    const effectiveCostPerKwh = units > 0 ? totalMonthlyBill / units : flatRate;

    return {
      baseEnergyCost,
      fixedCharges,
      electricityDuty,
      totalMonthlyBill,
      totalYearlyBill,
      effectiveCostPerKwh,
      slabBreakdown
    };
  }, [inventoryMetrics.monthlyKwh, useTieredTariff, flatRate, fixedCharges, taxRatePercent]);

  // --- Solar Offset Projections ---
  const solarProjections = useMemo(() => {
    const monthlyUnits = inventoryMetrics.monthlyKwh;
    // Monthly units generated per 1 kWp system = 1 kWp * Peak Sun Hours (4.5) * 30 days * 0.78 (performance ratio)
    const unitsPerKwMonth = 1.0 * solarSunHours * 30 * 0.78;
    const requiredKw100 = unitsPerKwMonth > 0 ? monthlyUnits / unitsPerKwMonth : 0;
    const requiredKw80 = requiredKw100 * 0.8;

    const roundKw = Math.ceil(requiredKw100 * 2) / 2; // round to nearest 0.5 kW
    const estimatedCostInr = roundKw * 55000; // ~₹55,000 per kWp rooftop turnkey cost
    const annualSavings = billMetrics.totalYearlyBill * 0.9;
    const paybackYears = annualSavings > 0 ? estimatedCostInr / annualSavings : 0;

    return {
      unitsPerKwMonth,
      requiredKw100,
      requiredKw80,
      roundKw,
      estimatedCostInr,
      annualSavings,
      paybackYears
    };
  }, [inventoryMetrics.monthlyKwh, solarSunHours, billMetrics.totalYearlyBill]);

  // --- Carbon Footprint Projections ---
  const carbonMetrics = useMemo(() => {
    // 0.82 kg CO2e per kWh grid emission factor (India Central Electricity Authority average)
    const annualCo2Kg = inventoryMetrics.yearlyKwh * 0.82;
    const annualCo2Tonnes = annualCo2Kg / 1000;
    // 1 mature tree absorbs ~22 kg CO2 per year
    const treesNeeded = Math.ceil(annualCo2Kg / 22);
    // 1 liter petrol = 2.31 kg CO2
    const equivalentPetrolLiters = Math.round(annualCo2Kg / 2.31);

    return {
      annualCo2Kg,
      annualCo2Tonnes,
      treesNeeded,
      equivalentPetrolLiters
    };
  }, [inventoryMetrics.yearlyKwh]);

  // --- Single Device Comparative Analytics (Mode 2) ---
  const singleAppCompareMetrics = useMemo(() => {
    const effRate = billMetrics.effectiveCostPerKwh;
    const kwhA = (compAppA.watts * compAppA.hours * 365) / 1000;
    const kwhB = (compAppB.watts * compAppB.hours * 365) / 1000;

    const costA = kwhA * effRate;
    const costB = kwhB * effRate;

    const annualSavingsKwh = kwhA - kwhB;
    const annualSavingsCost = costA - costB;
    const paybackMonths = annualSavingsCost > 0 ? (compAppB.purchaseCost / annualSavingsCost) * 12 : 0;

    return {
      kwhA,
      kwhB,
      costA,
      costB,
      annualSavingsKwh,
      annualSavingsCost,
      paybackMonths
    };
  }, [compAppA, compAppB, billMetrics.effectiveCostPerKwh]);

  // Add Item from Database
  const handleAddFromDb = () => {
    const itemData = APPLIANCE_DATABASE[selectedDbIndex];
    const newItem: ApplianceItem = {
      id: `app-${Date.now()}-${Math.random()}`,
      name: itemData.name,
      category: itemData.category,
      room: itemData.defaultRoom,
      wattage: itemData.defaultWatts,
      qty: 1,
      hoursPerDay: itemData.defaultHours,
      daysPerMonth: 30,
      dutyCycle: itemData.defaultDuty
    };
    setInventory(prev => [newItem, ...prev]);
  };

  // Remove Item
  const handleRemoveItem = (id: string) => {
    setInventory(prev => prev.filter(it => it.id !== id));
  };

  // Update Item Field
  const handleUpdateItem = (id: string, field: keyof ApplianceItem, value: any) => {
    setInventory(prev =>
      prev.map(it => (it.id === id ? { ...it, [field]: value } : it))
    );
  };

  // Load Preset Home
  const handleLoadPreset = (presetId: string) => {
    const preset = PRESET_HOMES.find(p => p.id === presetId);
    if (!preset) return;
    setInventory(
      preset.items.map((it, idx) => ({
        ...it,
        id: `preset-${presetId}-${idx}-${Date.now()}`
      }))
    );
  };

  // Copy Full Energy Report
  const handleCopyReport = () => {
    const text = `⚡ Toolique Energy Audit & Power Consumption Report
===================================================
Generated: ${new Date().toLocaleDateString()}
Total Connected Load: ${(inventoryMetrics.totalConnectedWatts / 1000).toFixed(2)} kW
Daily Energy Usage: ${inventoryMetrics.dailyKwh.toFixed(2)} kWh / day
Monthly Energy Usage: ${inventoryMetrics.monthlyKwh.toFixed(1)} Units (kWh/month)
Annual Energy Usage: ${inventoryMetrics.yearlyKwh.toFixed(0)} kWh/year

💰 Electricity Bill Estimation:
- Base Energy Charges: ${currency} ${billMetrics.baseEnergyCost.toFixed(2)}
- Fixed Meter Rent: ${currency} ${billMetrics.fixedCharges.toFixed(2)}
- Electricity Duty & Taxes (${taxRatePercent}%): ${currency} ${billMetrics.electricityDuty.toFixed(2)}
- ESTIMATED MONTHLY BILL: ${currency} ${billMetrics.totalMonthlyBill.toFixed(2)}
- ESTIMATED ANNUAL BILL: ${currency} ${billMetrics.totalYearlyBill.toFixed(2)}

🌱 Environmental Carbon Impact:
- Annual Grid Carbon Footprint: ${carbonMetrics.annualCo2Tonnes.toFixed(2)} Tonnes CO2e
- Equivalent Trees Needed to Offset: ${carbonMetrics.treesNeeded} Trees

☀️ Recommended Solar Rooftop Sizing:
- Recommended Solar Plant: ${solarProjections.roundKw.toFixed(1)} kWp
- Projected 25-Year Bill Offset: ~90%
===================================================`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Appliance Name', 'Room', 'Category', 'Wattage (W)', 'Quantity', 'Hours/Day', 'Days/Month', 'Duty Cycle (%)', 'Monthly kWh'];
    const rows = inventory.map(item => {
      const activeWatts = item.wattage * item.qty;
      const effectiveHours = item.hoursPerDay * (item.dutyCycle / 100);
      const monthlyKwh = ((activeWatts * effectiveHours) / 1000) * (item.daysPerMonth / 30) * 30;
      return [
        `"${item.name}"`,
        item.room,
        item.category,
        item.wattage,
        item.qty,
        item.hoursPerDay,
        item.daysPerMonth,
        item.dutyCycle,
        monthlyKwh.toFixed(2)
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `toolique_power_consumption_inventory.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* AEO Instant Energy Summary Card (Zero Double Heading) */}
      <div className="bg-gradient-to-br from-amber-50/90 via-white to-indigo-50/70 dark:from-amber-950/30 dark:via-zinc-900/60 dark:to-indigo-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-white uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3 h-3 fill-current" /> AEO Energy Audit
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                {inventory.length} devices configured
              </span>
            </div>
            <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 flex-wrap">
              <span>Monthly Units: <strong className="text-amber-600 dark:text-amber-400 font-mono">{inventoryMetrics.monthlyKwh.toFixed(1)} kWh</strong></span>
              <span className="text-zinc-300 dark:text-zinc-700">|</span>
              <span>Estimated Bill: <strong className="text-indigo-600 dark:text-indigo-400 font-mono">{currency} {billMetrics.totalMonthlyBill.toFixed(0)}/mo</strong></span>
              <span className="text-zinc-300 dark:text-zinc-700">|</span>
              <span>Peak Load: <strong className="font-mono">{(inventoryMetrics.totalConnectedWatts / 1000).toFixed(2)} kW</strong></span>
            </div>
          </div>

          {/* Quick Actions & Currency Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white/80 dark:bg-zinc-800/80 px-2.5 py-1 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs">
              <span className="text-[11px] font-medium text-zinc-500">Currency:</span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-transparent font-bold text-amber-600 dark:text-amber-400 text-xs focus:outline-none cursor-pointer"
              >
                <option value="₹">₹ INR</option>
                <option value="$">$ USD</option>
                <option value="€">€ EUR</option>
                <option value="£">£ GBP</option>
                <option value="AED">AED</option>
              </select>
            </div>

            <button
              onClick={handleCopyReport}
              className="px-3 py-1.5 bg-white dark:bg-zinc-800 hover:bg-zinc-50 text-zinc-700 dark:text-zinc-200 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-amber-500" />}
              <span>{copied ? 'Copied Report!' : 'Copy Summary'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* 1-Click Home Archetype Presets */}
        <div className="mt-3 pt-3 border-t border-amber-100/70 dark:border-amber-900/30 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Room Presets:
          </span>
          {PRESET_HOMES.map(preset => (
            <button
              key={preset.id}
              onClick={() => handleLoadPreset(preset.id)}
              className="px-2.5 py-1 rounded-lg bg-white/90 dark:bg-zinc-800/90 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-zinc-700 dark:text-zinc-300 hover:text-amber-600 text-xs font-medium border border-zinc-200/80 dark:border-zinc-700/60 transition cursor-pointer"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto no-scrollbar gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/70 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/60">
        {[
          { id: 'inventory', label: '🏠 Whole-Home Appliance Audit', icon: Home },
          { id: 'tariff_slabs', label: '📊 Tariff Slabs & Bill Breakdown', icon: Zap },
          { id: 'single_compare', label: '⚡ 5-Star vs Old Device ROI', icon: TrendingDown },
          { id: 'solar_offset', label: '☀️ Solar Rooftop Sizing', icon: Sun },
          { id: 'carbon', label: '🌱 Carbon Footprint & ESG', icon: Leaf }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeMode === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveMode(tab.id as CalculatorMode)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-xs border border-zinc-200/50 dark:border-zinc-700/50'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Primary Workspace Views */}
      {/* MODE 1: WHOLE-HOME INVENTORY AUDIT */}
      {activeMode === 'inventory' && (
        <div className="space-y-6">
          {/* Top Quick Add Appliance Bar */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[280px]">
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider shrink-0">
                Add Appliance:
              </span>
              <select
                value={selectedDbIndex}
                onChange={(e) => setSelectedDbIndex(Number(e.target.value))}
                className="w-full text-xs font-medium bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 cursor-pointer"
              >
                {APPLIANCE_DATABASE.map((app, idx) => (
                  <option key={`db-${idx}`} value={idx}>
                    {app.name} ({app.defaultWatts}W) — {app.category}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAddFromDb}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add to Inventory</span>
              </button>

              <button
                onClick={() => setInventory([])}
                className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-50 text-zinc-600 hover:text-rose-600 text-xs font-bold rounded-xl transition cursor-pointer"
                title="Clear All Items"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Device Inventory Table / Cards */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Active Appliances Inventory ({inventory.length} devices)</span>
              </h4>
              <span className="text-xs text-zinc-500">
                Duty Cycle accounts for thermostat & inverter compressor on/off modulation
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 uppercase text-[10px] font-bold">
                    <th className="pb-2.5 pl-2">Appliance Name</th>
                    <th className="pb-2.5">Room</th>
                    <th className="pb-2.5 text-center">Watts</th>
                    <th className="pb-2.5 text-center">Qty</th>
                    <th className="pb-2.5 text-center">Hrs / Day</th>
                    <th className="pb-2.5 text-center">Duty %</th>
                    <th className="pb-2.5 text-right">Monthly kWh</th>
                    <th className="pb-2.5 text-right">Monthly Cost</th>
                    <th className="pb-2.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-medium">
                  {inventory.map((item) => {
                    const activeWatts = item.wattage * item.qty;
                    const effectiveHours = item.hoursPerDay * (item.dutyCycle / 100);
                    const itemMonthlyKwh = ((activeWatts * effectiveHours) / 1000) * (item.daysPerMonth / 30) * 30;
                    const itemCost = itemMonthlyKwh * billMetrics.effectiveCostPerKwh;

                    return (
                      <tr key={item.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition">
                        <td className="py-3 pl-2 font-bold text-zinc-900 dark:text-zinc-100">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                            className="bg-transparent border-b border-transparent hover:border-zinc-300 focus:border-amber-500 focus:outline-none w-full"
                          />
                        </td>
                        <td className="py-3 text-zinc-500">
                          <select
                            value={item.room}
                            onChange={(e) => handleUpdateItem(item.id, 'room', e.target.value as RoomType)}
                            className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1 text-[11px] focus:outline-none"
                          >
                            <option value="Living Room">Living Room</option>
                            <option value="Bedrooms">Bedrooms</option>
                            <option value="Kitchen">Kitchen</option>
                            <option value="Bathrooms">Bathrooms</option>
                            <option value="Home Office">Home Office</option>
                            <option value="Utility / Outdoor">Utility</option>
                          </select>
                        </td>
                        <td className="py-3 text-center">
                          <input
                            type="number"
                            value={item.wattage}
                            onChange={(e) => handleUpdateItem(item.id, 'wattage', Math.max(1, Number(e.target.value)))}
                            className="w-16 p-1 text-center font-mono font-bold bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none"
                          />
                        </td>
                        <td className="py-3 text-center">
                          <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={(e) => handleUpdateItem(item.id, 'qty', Math.max(1, Number(e.target.value)))}
                            className="w-12 p-1 text-center font-mono font-bold bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none"
                          />
                        </td>
                        <td className="py-3 text-center">
                          <input
                            type="number"
                            step="0.5"
                            min="0.1"
                            max="24"
                            value={item.hoursPerDay}
                            onChange={(e) => handleUpdateItem(item.id, 'hoursPerDay', Math.min(24, Math.max(0.1, Number(e.target.value))))}
                            className="w-14 p-1 text-center font-mono font-bold bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none"
                          />
                        </td>
                        <td className="py-3 text-center">
                          <input
                            type="number"
                            min="10"
                            max="100"
                            step="5"
                            value={item.dutyCycle}
                            onChange={(e) => handleUpdateItem(item.id, 'dutyCycle', Math.min(100, Math.max(10, Number(e.target.value))))}
                            className="w-14 p-1 text-center font-mono text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none"
                          />
                        </td>
                        <td className="py-3 text-right font-mono font-bold text-amber-600 dark:text-amber-400">
                          {itemMonthlyKwh.toFixed(1)} kWh
                        </td>
                        <td className="py-3 text-right font-mono font-bold text-zinc-900 dark:text-zinc-100">
                          {currency} {itemCost.toFixed(0)}
                        </td>
                        <td className="py-3 text-center">
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-zinc-400 hover:text-rose-500 transition cursor-pointer p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Category & Room Distribution Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                <span>Consumption by Category</span>
              </h4>
              <div className="space-y-2">
                {Object.entries(inventoryMetrics.categoryBreakdown)
                  .filter(([_, data]) => data.kwh > 0)
                  .map(([cat, data]) => {
                    const pct = inventoryMetrics.monthlyKwh > 0 ? (data.kwh / inventoryMetrics.monthlyKwh) * 100 : 0;
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-zinc-700 dark:text-zinc-300">{cat}</span>
                          <span className="font-mono text-zinc-500 font-bold">{data.kwh.toFixed(1)} kWh ({pct.toFixed(0)}%)</span>
                        </div>
                        <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                <span>Consumption by Room</span>
              </h4>
              <div className="space-y-2">
                {Object.entries(inventoryMetrics.roomBreakdown)
                  .filter(([_, data]) => data.kwh > 0)
                  .map(([room, data]) => {
                    const pct = inventoryMetrics.monthlyKwh > 0 ? (data.kwh / inventoryMetrics.monthlyKwh) * 100 : 0;
                    return (
                      <div key={room} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-zinc-700 dark:text-zinc-300">{room}</span>
                          <span className="font-mono text-zinc-500 font-bold">{data.kwh.toFixed(1)} kWh ({pct.toFixed(0)}%)</span>
                        </div>
                        <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: TARIFF SLABS & BILL BREAKDOWN */}
      {activeMode === 'tariff_slabs' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Electricity Tariff Structure & Utility Bill Modeling
                </h4>
                <p className="text-xs text-zinc-500">
                  Supports progressive telescopic consumption slabs, fixed meter rentals, and electricity duty.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-zinc-500">Tariff Type:</span>
                <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setUseTieredTariff(true)}
                    className={`px-3 py-1 rounded-lg transition cursor-pointer ${useTieredTariff ? 'bg-white dark:bg-zinc-900 text-amber-600 shadow-xs' : 'text-zinc-500'}`}
                  >
                    Telescopic Slabs
                  </button>
                  <button
                    onClick={() => setUseTieredTariff(false)}
                    className={`px-3 py-1 rounded-lg transition cursor-pointer ${!useTieredTariff ? 'bg-white dark:bg-zinc-900 text-amber-600 shadow-xs' : 'text-zinc-500'}`}
                  >
                    Flat Rate
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                  FLAT RATE ({currency} / kWh)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={flatRate}
                  onChange={(e) => setFlatRate(Math.max(0.1, Number(e.target.value)))}
                  className="w-full text-xs font-mono font-bold bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                  FIXED MONTHLY CHARGES ({currency})
                </label>
                <input
                  type="number"
                  value={fixedCharges}
                  onChange={(e) => setFixedCharges(Math.max(0, Number(e.target.value)))}
                  className="w-full text-xs font-mono font-bold bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                  ELECTRICITY DUTY / TAX (%)
                </label>
                <input
                  type="number"
                  value={taxRatePercent}
                  onChange={(e) => setTaxRatePercent(Math.max(0, Number(e.target.value)))}
                  className="w-full text-xs font-mono font-bold bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 focus:outline-none"
                />
              </div>
            </div>

            {/* Slab Calculation Breakdown */}
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden mt-4">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-zinc-50 dark:bg-zinc-800/80 text-zinc-500 uppercase text-[10px] font-bold font-sans">
                  <tr>
                    <th className="p-3">Slab Tier</th>
                    <th className="p-3 text-right">Units in Slab</th>
                    <th className="p-3 text-right">Tariff Rate</th>
                    <th className="p-3 text-right">Charge ({currency})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {billMetrics.slabBreakdown.map((slab, idx) => (
                    <tr key={`slab-${idx}`}>
                      <td className="p-3 font-sans font-bold text-zinc-800 dark:text-zinc-200">{slab.label}</td>
                      <td className="p-3 text-right">{slab.unitsInSlab.toFixed(1)} units</td>
                      <td className="p-3 text-right">{currency} {slab.rate.toFixed(2)}</td>
                      <td className="p-3 text-right font-bold text-amber-600">{currency} {slab.cost.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="bg-zinc-50/50 dark:bg-zinc-950/30">
                    <td colSpan={3} className="p-3 font-sans text-zinc-600 dark:text-zinc-400 font-semibold">Fixed Meter / Standing Charge</td>
                    <td className="p-3 text-right font-bold">{currency} {fixedCharges.toFixed(2)}</td>
                  </tr>
                  <tr className="bg-zinc-50/50 dark:bg-zinc-950/30">
                    <td colSpan={3} className="p-3 font-sans text-zinc-600 dark:text-zinc-400 font-semibold">Electricity Duty & Surcharges ({taxRatePercent}%)</td>
                    <td className="p-3 text-right font-bold">{currency} {billMetrics.electricityDuty.toFixed(2)}</td>
                  </tr>
                  <tr className="bg-amber-50/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold">
                    <td colSpan={3} className="p-3 font-sans text-sm">TOTAL ESTIMATED MONTHLY BILL</td>
                    <td className="p-3 text-right text-base font-bold text-amber-700 dark:text-amber-300">
                      {currency} {billMetrics.totalMonthlyBill.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: 5-STAR VS OLD DEVICE ROI COMPARISON */}
      {activeMode === 'single_compare' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-5">
            <div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-emerald-500" />
                <span>Energy Efficiency Upgrade & Payback Period (ROI)</span>
              </h4>
              <p className="text-xs text-zinc-500">
                Calculate the exact annual electricity cost savings and payback timeline when replacing an older inefficient appliance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Existing Device */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-rose-600 uppercase">
                  <span>Current Inefficient Device</span>
                  <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">Old / Non-Star</span>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 mb-1">Appliance Name</label>
                  <input
                    type="text"
                    value={compAppA.name}
                    onChange={(e) => setCompAppA({ ...compAppA, name: e.target.value })}
                    className="w-full text-xs font-semibold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-500 mb-1">Power Rating (Watts)</label>
                    <input
                      type="number"
                      value={compAppA.watts}
                      onChange={(e) => setCompAppA({ ...compAppA, watts: Math.max(1, Number(e.target.value)) })}
                      className="w-full text-xs font-mono font-bold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-500 mb-1">Hours / Day</label>
                    <input
                      type="number"
                      value={compAppA.hours}
                      onChange={(e) => setCompAppA({ ...compAppA, hours: Math.max(0.1, Number(e.target.value)) })}
                      className="w-full text-xs font-mono font-bold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 font-mono text-xs">
                  <div className="text-zinc-500">Annual Consumption: <strong>{singleAppCompareMetrics.kwhA.toFixed(0)} kWh</strong></div>
                  <div className="text-rose-600 font-bold mt-0.5">Annual Cost: {currency} {singleAppCompareMetrics.costA.toFixed(0)}</div>
                </div>
              </div>

              {/* Upgraded 5-Star Device */}
              <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-600 uppercase">
                  <span>Upgraded Energy Efficient Device</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">5-Star / BLDC</span>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 mb-1">Appliance Name</label>
                  <input
                    type="text"
                    value={compAppB.name}
                    onChange={(e) => setCompAppB({ ...compAppB, name: e.target.value })}
                    className="w-full text-xs font-semibold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-500 mb-1">Power Rating (Watts)</label>
                    <input
                      type="number"
                      value={compAppB.watts}
                      onChange={(e) => setCompAppB({ ...compAppB, watts: Math.max(1, Number(e.target.value)) })}
                      className="w-full text-xs font-mono font-bold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-500 mb-1">Upgrade Cost ({currency})</label>
                    <input
                      type="number"
                      value={compAppB.purchaseCost}
                      onChange={(e) => setCompAppB({ ...compAppB, purchaseCost: Math.max(0, Number(e.target.value)) })}
                      className="w-full text-xs font-mono font-bold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-emerald-200 dark:border-emerald-800 font-mono text-xs">
                  <div className="text-zinc-500">Annual Consumption: <strong>{singleAppCompareMetrics.kwhB.toFixed(0)} kWh</strong></div>
                  <div className="text-emerald-600 font-bold mt-0.5">Annual Cost: {currency} {singleAppCompareMetrics.costB.toFixed(0)}</div>
                </div>
              </div>
            </div>

            {/* ROI & Payback Result Banner */}
            <div className="p-4 bg-zinc-900 text-white rounded-2xl border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <div className="text-xs text-zinc-400 font-bold uppercase">Upgrade ROI Summary</div>
                <div className="text-lg font-bold text-emerald-400 font-mono">
                  Saves {currency} {singleAppCompareMetrics.annualSavingsCost.toFixed(0)} / year ({singleAppCompareMetrics.annualSavingsKwh.toFixed(0)} kWh)
                </div>
              </div>
              <div className="text-center sm:text-right">
                <div className="text-xs text-zinc-400">Payback Period</div>
                <div className="text-xl font-bold font-mono text-white">
                  {singleAppCompareMetrics.paybackMonths > 0
                    ? `${singleAppCompareMetrics.paybackMonths.toFixed(1)} Months (${(singleAppCompareMetrics.paybackMonths / 12).toFixed(1)} yrs)`
                    : 'Instant / Nil'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 4: SOLAR ROOFTOP SIZING */}
      {activeMode === 'solar_offset' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Rooftop Solar PV Plant Capacity Simulator</span>
                </h4>
                <p className="text-xs text-zinc-500">
                  Determines required solar panel rating to offset your monthly load of <strong>{inventoryMetrics.monthlyKwh.toFixed(1)} units</strong>.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-500">Daily Peak Sun Hours (PSH):</span>
                <input
                  type="number"
                  step="0.1"
                  min="2"
                  max="8"
                  value={solarSunHours}
                  onChange={(e) => setSolarSunHours(Math.max(1, Math.min(10, Number(e.target.value))))}
                  className="w-16 text-xs font-mono font-bold bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1.5 text-center focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-150 dark:border-zinc-850">
                <div className="text-[10px] text-zinc-400 uppercase font-bold">Recommended Plant Size</div>
                <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
                  {solarProjections.roundKw.toFixed(1)} kWp
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">Approx 6–8 Solar Panels (540W)</div>
              </div>

              <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-150 dark:border-zinc-850">
                <div className="text-[10px] text-zinc-400 uppercase font-bold">Estimated Turnkey Cost</div>
                <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-white mt-1">
                  {currency} {(solarProjections.roundKw * 55000).toLocaleString()}
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">Before government subsidies (PM Surya Ghar)</div>
              </div>

              <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-150 dark:border-zinc-850">
                <div className="text-[10px] text-zinc-400 uppercase font-bold">Estimated Annual Savings</div>
                <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                  {currency} {solarProjections.annualSavings.toFixed(0)} / yr
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">
                  Payback: <strong>{solarProjections.paybackYears.toFixed(1)} Years</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 5: CARBON FOOTPRINT & ESG */}
      {activeMode === 'carbon' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-5">
            <div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Leaf className="w-4 h-4 text-emerald-500" />
                <span>Environmental Footprint & Greenhouse Gas Emissions</span>
              </h4>
              <p className="text-xs text-zinc-500">
                Calculates total indirect Scope-2 greenhouse gas emissions caused by electrical utility generation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-1">
                <span className="text-[10px] font-bold text-emerald-600 uppercase">Annual Carbon Emissions</span>
                <div className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-300">
                  {carbonMetrics.annualCo2Tonnes.toFixed(2)} Tonnes CO₂e
                </div>
                <div className="text-xs text-zinc-500">Based on 0.82 kg CO₂/kWh grid average</div>
              </div>

              <div className="p-4 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-1">
                <span className="text-[10px] font-bold text-emerald-600 uppercase">Trees Needed for Offset</span>
                <div className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-300">
                  {carbonMetrics.treesNeeded} Mature Trees
                </div>
                <div className="text-xs text-zinc-500">Required annual absorption capacity</div>
              </div>

              <div className="p-4 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-1">
                <span className="text-[10px] font-bold text-emerald-600 uppercase">Equivalent Fuel Burn</span>
                <div className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-300">
                  {carbonMetrics.equivalentPetrolLiters.toLocaleString()} Litres Petrol
                </div>
                <div className="text-xs text-zinc-500">Equivalent fossil fuel emissions</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

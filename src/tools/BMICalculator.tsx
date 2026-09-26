/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from 'react';
import {
  Heart,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Download,
  Flame,
  Activity,
  User,
  Scale,
  Ruler,
  Info,
  AlertTriangle,
  Target,
  Calculator,
  Compass,
  FileSpreadsheet
} from 'lucide-react';

// --- Types & Guidelines ---
export type GuidelineStandard = 'who' | 'asian';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type BmiMode = 'calculator' | 'target_planner' | 'waist_ratio' | 'matrix';

export interface BmiArchetype {
  id: string;
  name: string;
  desc: string;
  unit: 'metric' | 'imperial';
  sex: 'male' | 'female';
  age: number;
  weightKg: number;
  heightCm: number;
  waistCm: number;
  activity: ActivityLevel;
  standard: GuidelineStandard;
}

const ARCHETYPES: BmiArchetype[] = [
  {
    id: 'active_male',
    name: '🏃‍♂️ Active Male',
    desc: '25y, 178cm, 74kg - Optimal athletic build',
    unit: 'metric',
    sex: 'male',
    age: 25,
    weightKg: 74,
    heightCm: 178,
    waistCm: 80,
    activity: 'moderate',
    standard: 'who'
  },
  {
    id: 'health_female',
    name: '🧘‍♀️ Wellness Female',
    desc: '30y, 165cm, 62kg - Healthy balanced profile',
    unit: 'metric',
    sex: 'female',
    age: 30,
    weightKg: 62,
    heightCm: 165,
    waistCm: 72,
    activity: 'light',
    standard: 'who'
  },
  {
    id: 'desk_worker',
    name: '👔 Desk Professional',
    desc: '38y, 172cm, 84kg - Overweight desk profile',
    unit: 'metric',
    sex: 'male',
    age: 38,
    weightKg: 84,
    heightCm: 172,
    waistCm: 92,
    activity: 'sedentary',
    standard: 'asian'
  },
  {
    id: 'senior_wellness',
    name: '👴 Senior Fitness',
    desc: '62y, 168cm, 68kg - Healthy senior maintenance',
    unit: 'metric',
    sex: 'male',
    age: 62,
    weightKg: 68,
    heightCm: 168,
    waistCm: 84,
    activity: 'light',
    standard: 'who'
  },
  {
    id: 'muscular_athlete',
    name: '🏋️ Muscular Bodybuilder',
    desc: '28y, 180cm, 92kg - Heavy muscle mass caveat',
    unit: 'metric',
    sex: 'male',
    age: 28,
    weightKg: 92,
    heightCm: 180,
    waistCm: 82,
    activity: 'very_active',
    standard: 'who'
  }
];

export default function BMICalculator() {
  // Navigation Mode
  const [activeMode, setActiveMode] = useState<BmiMode>('calculator');

  // Input states
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [standard, setStandard] = useState<GuidelineStandard>('who');
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState<number>(30);
  const [weightKg, setWeightKg] = useState<number>(72);
  const [heightCm, setHeightCm] = useState<number>(172);

  // Imperial helper states
  const [weightLbs, setWeightLbs] = useState<number>(158.7);
  const [heightFt, setHeightFt] = useState<number>(5);
  const [heightIn, setHeightIn] = useState<number>(8);

  // Waist circumference state (for Central Adiposity Mode)
  const [waistCm, setWaistCm] = useState<number>(82);
  const [waistIn, setWaistIn] = useState<number>(32.3);

  // Activity level for BMR/TDEE
  const [activity, setActivity] = useState<ActivityLevel>('moderate');

  // Target Planner Mode states
  const [targetGoal, setTargetGoal] = useState<'bmi' | 'weight'>('bmi');
  const [targetBmiValue, setTargetBmiValue] = useState<number>(22.5);
  const [targetWeightKg, setTargetWeightKg] = useState<number>(66);
  const [weeklyPaceKg, setWeeklyPaceKg] = useState<number>(0.5); // kg per week

  const [copied, setCopied] = useState(false);

  // Unit sync handlers
  const handleMetricWeightChange = (val: number) => {
    setWeightKg(val);
    setWeightLbs(Number((val * 2.20462).toFixed(1)));
  };

  const handleImperialWeightChange = (val: number) => {
    setWeightLbs(val);
    setWeightKg(Number((val / 2.20462).toFixed(1)));
  };

  const handleMetricHeightChange = (val: number) => {
    setHeightCm(val);
    const totalInches = val / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    setHeightFt(feet);
    setHeightIn(inches);
  };

  const handleImperialHeightChange = (feet: number, inches: number) => {
    setHeightFt(feet);
    setHeightIn(inches);
    const totalInches = feet * 12 + inches;
    setHeightCm(Math.round(totalInches * 2.54));
  };

  const handleMetricWaistChange = (val: number) => {
    setWaistCm(val);
    setWaistIn(Number((val / 2.54).toFixed(1)));
  };

  const handleImperialWaistChange = (val: number) => {
    setWaistIn(val);
    setWaistCm(Math.round(val * 2.54));
  };

  // --- Core Calculations ---
  const calculations = useMemo(() => {
    const effectiveHeightM = heightCm / 100;
    const effectiveWeightKg = weightKg;

    if (effectiveHeightM <= 0 || effectiveWeightKg <= 0) {
      return {
        bmi: 0,
        category: 'N/A',
        categoryColor: 'text-zinc-400 bg-zinc-100 dark:bg-zinc-800',
        categoryDesc: '',
        bmiPrime: 0,
        ponderalIndex: 0,
        minHealthyWeightKg: 0,
        maxHealthyWeightKg: 0,
        weightDeltaKg: 0,
        ibwDevineKg: 0,
        ibwRobinsonKg: 0,
        ibwMillerKg: 0,
        ibwHamwiKg: 0,
        bodyFatPct: 0,
        bmrKcal: 0,
        tdeeKcal: 0,
        whtrRatio: 0,
        whtrCategory: 'N/A',
        whtrColor: 'text-zinc-400'
      };
    }

    // 1. Quetelet Body Mass Index (BMI = kg / m^2)
    const bmiVal = effectiveWeightKg / (effectiveHeightM * effectiveHeightM);

    // 2. BMI Classification (WHO vs Asian-Pacific)
    let category = '';
    let categoryColor = '';
    let categoryDesc = '';

    if (standard === 'who') {
      if (bmiVal < 16.0) {
        category = 'Severe Underweight';
        categoryColor = 'text-blue-600 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800';
        categoryDesc = 'Significant nutritional deficit. Clinical evaluation recommended.';
      } else if (bmiVal < 17.0) {
        category = 'Moderate Underweight';
        categoryColor = 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800';
        categoryDesc = 'Body weight is below healthy threshold. Caloric surplus advised.';
      } else if (bmiVal < 18.5) {
        category = 'Mild Underweight';
        categoryColor = 'text-sky-600 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800';
        categoryDesc = 'Slightly lower body weight. Focus on balanced macronutrients and resistance training.';
      } else if (bmiVal < 25.0) {
        category = 'Normal Weight';
        categoryColor = 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800';
        categoryDesc = 'Optimal healthy weight associated with the lowest risk of chronic lifestyle diseases.';
      } else if (bmiVal < 30.0) {
        category = 'Overweight (Pre-Obese)';
        categoryColor = 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800';
        categoryDesc = 'Elevated body mass. Increased risk of cardiovascular disease and hypertension.';
      } else if (bmiVal < 35.0) {
        category = 'Obesity Class I';
        categoryColor = 'text-orange-600 bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-800';
        categoryDesc = 'Moderate obesity. Structured calorie management and lifestyle adjustments recommended.';
      } else if (bmiVal < 40.0) {
        category = 'Obesity Class II';
        categoryColor = 'text-rose-600 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800';
        categoryDesc = 'High risk obesity. Structured nutritional and medical guidance strongly advised.';
      } else {
        category = 'Obesity Class III (Morbid)';
        categoryColor = 'text-red-700 bg-red-50 dark:bg-red-950/50 border-red-300 dark:border-red-800';
        categoryDesc = 'Severe health risk requiring comprehensive multidisciplinary intervention.';
      }
    } else {
      // Asian-Pacific Standard (WHO Western Pacific & Indian Council of Medical Research)
      if (bmiVal < 18.5) {
        category = 'Underweight';
        categoryColor = 'text-sky-600 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800';
        categoryDesc = 'Lower body mass. Nutrition enhancement advised.';
      } else if (bmiVal < 23.0) {
        category = 'Normal Weight (Asian Standard)';
        categoryColor = 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800';
        categoryDesc = 'Optimal Asian metabolic zone with lowest cardiovascular and Type 2 diabetes risk.';
      } else if (bmiVal < 25.0) {
        category = 'Overweight / Pre-Obese (Asian)';
        categoryColor = 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800';
        categoryDesc = 'Higher visceral fat accumulation typical in South Asian populations. Moderate deficit advised.';
      } else if (bmiVal < 30.0) {
        category = 'Obese Class I (Asian)';
        categoryColor = 'text-orange-600 bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-800';
        categoryDesc = 'Substantial metabolic risk. Lifestyle & dietary adjustments recommended.';
      } else {
        category = 'Obese Class II (Asian)';
        categoryColor = 'text-red-700 bg-red-50 dark:bg-red-950/50 border-red-300 dark:border-red-800';
        categoryDesc = 'Severe metabolic syndrome and cardiovascular risk profile.';
      }
    }

    // 3. BMI Prime (Ratio of actual BMI to upper normal limit)
    const upperLimit = standard === 'who' ? 25.0 : 23.0;
    const bmiPrime = bmiVal / upperLimit;

    // 4. Ponderal / Corpulence Index (PI = kg / m^3)
    const ponderalIndex = effectiveWeightKg / (effectiveHeightM * effectiveHeightM * effectiveHeightM);

    // 5. Healthy Weight Range for given Height
    const normalMinBmi = 18.5;
    const normalMaxBmi = standard === 'who' ? 24.9 : 22.9;
    const minHealthyWeightKg = normalMinBmi * effectiveHeightM * effectiveHeightM;
    const maxHealthyWeightKg = normalMaxBmi * effectiveHeightM * effectiveHeightM;

    // Weight delta to normal range
    let weightDeltaKg = 0;
    if (effectiveWeightKg < minHealthyWeightKg) {
      weightDeltaKg = minHealthyWeightKg - effectiveWeightKg; // Need to gain
    } else if (effectiveWeightKg > maxHealthyWeightKg) {
      weightDeltaKg = -(effectiveWeightKg - maxHealthyWeightKg); // Need to lose
    }

    // 6. Ideal Body Weight (IBW) Formulas for Height >= 152.4 cm (5 feet)
    const heightInches = heightCm / 2.54;
    const inchesOver5Ft = Math.max(0, heightInches - 60);

    let ibwDevineKg = 0;
    let ibwRobinsonKg = 0;
    let ibwMillerKg = 0;
    let ibwHamwiKg = 0;

    if (sex === 'male') {
      ibwDevineKg = 50.0 + 2.3 * inchesOver5Ft;
      ibwRobinsonKg = 52.0 + 1.9 * inchesOver5Ft;
      ibwMillerKg = 56.2 + 1.41 * inchesOver5Ft;
      ibwHamwiKg = 48.0 + 2.7 * inchesOver5Ft;
    } else {
      ibwDevineKg = 45.5 + 2.3 * inchesOver5Ft;
      ibwRobinsonKg = 49.0 + 1.7 * inchesOver5Ft;
      ibwMillerKg = 53.1 + 1.36 * inchesOver5Ft;
      ibwHamwiKg = 45.5 + 2.2 * inchesOver5Ft;
    }

    // 7. Body Fat Percentage Estimation (Deurenberg Adult Formula)
    const sexFactor = sex === 'male' ? 1 : 0;
    const bodyFatPct = 1.20 * bmiVal + 0.23 * age - 10.8 * sexFactor - 5.4;

    // 8. Basal Metabolic Rate (BMR) - Mifflin-St Jeor Equation
    let bmrKcal = 0;
    if (sex === 'male') {
      bmrKcal = 10 * effectiveWeightKg + 6.25 * heightCm - 5 * age + 5;
    } else {
      bmrKcal = 10 * effectiveWeightKg + 6.25 * heightCm - 5 * age - 161;
    }

    // 9. Total Daily Energy Expenditure (TDEE)
    const activityMultipliers: Record<ActivityLevel, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };
    const tdeeKcal = bmrKcal * activityMultipliers[activity];

    // 10. Waist-to-Height Ratio (WHtR) & Central Adiposity Risk
    const whtrRatio = waistCm / heightCm;
    let whtrCategory = '';
    let whtrColor = '';
    if (whtrRatio < 0.40) {
      whtrCategory = 'Extremely Slim (Underweight Risk)';
      whtrColor = 'text-sky-600 bg-sky-50 dark:bg-sky-950/40';
    } else if (whtrRatio <= 0.49) {
      whtrCategory = 'Healthy Waist (Low Visceral Fat)';
      whtrColor = 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50';
    } else if (whtrRatio <= 0.59) {
      whtrCategory = 'Increased Risk (Abdominal Adiposity)';
      whtrColor = 'text-amber-600 bg-amber-50 dark:bg-amber-950/50';
    } else {
      whtrCategory = 'High Risk (Severe Central Obesity)';
      whtrColor = 'text-red-600 bg-red-50 dark:bg-red-950/50';
    }

    return {
      bmi: Number(bmiVal.toFixed(1)),
      category,
      categoryColor,
      categoryDesc,
      bmiPrime: Number(bmiPrime.toFixed(2)),
      ponderalIndex: Number(ponderalIndex.toFixed(2)),
      minHealthyWeightKg: Number(minHealthyWeightKg.toFixed(1)),
      maxHealthyWeightKg: Number(maxHealthyWeightKg.toFixed(1)),
      weightDeltaKg: Number(weightDeltaKg.toFixed(1)),
      ibwDevineKg: Number(ibwDevineKg.toFixed(1)),
      ibwRobinsonKg: Number(ibwRobinsonKg.toFixed(1)),
      ibwMillerKg: Number(ibwMillerKg.toFixed(1)),
      ibwHamwiKg: Number(ibwHamwiKg.toFixed(1)),
      bodyFatPct: Math.max(3, Number(bodyFatPct.toFixed(1))),
      bmrKcal: Math.round(bmrKcal),
      tdeeKcal: Math.round(tdeeKcal),
      whtrRatio: Number(whtrRatio.toFixed(2)),
      whtrCategory,
      whtrColor
    };
  }, [heightCm, weightKg, standard, sex, age, activity, waistCm]);

  // Target Planner Calculation
  const targetPlan = useMemo(() => {
    const effectiveHeightM = heightCm / 100;
    let targetKg = 0;

    if (targetGoal === 'bmi') {
      targetKg = targetBmiValue * effectiveHeightM * effectiveHeightM;
    } else {
      targetKg = targetWeightKg;
    }

    const currentKg = weightKg;
    const deltaKg = targetKg - currentKg;
    const isLosing = deltaKg < 0;
    const absDeltaKg = Math.abs(deltaKg);

    const safeWeeklyPace = Math.max(0.1, weeklyPaceKg);
    const weeksRequired = Math.ceil(absDeltaKg / safeWeeklyPace);
    const daysRequired = weeksRequired * 7;

    // 1 kg of body fat contains ~7700 kcal
    const dailyCalorieOffset = Math.round((safeWeeklyPace * 7700) / 7);
    const targetDailyCalories = isLosing
      ? Math.max(1200, calculations.tdeeKcal - dailyCalorieOffset)
      : calculations.tdeeKcal + dailyCalorieOffset;

    return {
      targetKg: Number(targetKg.toFixed(1)),
      deltaKg: Number(deltaKg.toFixed(1)),
      isLosing,
      absDeltaKg: Number(absDeltaKg.toFixed(1)),
      weeksRequired,
      daysRequired,
      dailyCalorieOffset,
      targetDailyCalories
    };
  }, [heightCm, weightKg, targetGoal, targetBmiValue, targetWeightKg, weeklyPaceKg, calculations.tdeeKcal]);

  // Archetype Handler
  const handleApplyArchetype = (preset: BmiArchetype) => {
    setUnit(preset.unit);
    setSex(preset.sex);
    setAge(preset.age);
    setWeightKg(preset.weightKg);
    setHeightCm(preset.heightCm);
    setWaistCm(preset.waistCm);
    setActivity(preset.activity);
    setStandard(preset.standard);

    // Sync imperial
    setWeightLbs(Number((preset.weightKg * 2.20462).toFixed(1)));
    const totalInches = preset.heightCm / 2.54;
    setHeightFt(Math.floor(totalInches / 12));
    setHeightIn(Math.round(totalInches % 12));
    setWaistIn(Number((preset.waistCm / 2.54).toFixed(1)));
  };

  const handleReset = () => {
    setUnit('metric');
    setStandard('who');
    setSex('male');
    setAge(30);
    setWeightKg(72);
    setHeightCm(172);
    setWeightLbs(158.7);
    setHeightFt(5);
    setHeightIn(8);
    setWaistCm(82);
    setWaistIn(32.3);
    setActivity('moderate');
  };

  // Copy Comprehensive Report
  const handleCopyReport = () => {
    const reportText = `=========================================
TOOLIQUE BODY COMPOSITION & BMI HEALTH REPORT
=========================================
Standard: ${standard === 'who' ? 'WHO Global Guidelines' : 'WHO Asian-Pacific Guidelines'}
Profile: ${age} years old | ${sex === 'male' ? 'Male' : 'Female'} | Activity: ${activity}
Height: ${heightCm} cm (${heightFt} ft ${heightIn} in)
Weight: ${weightKg} kg (${weightLbs} lbs)
Waist Circumference: ${waistCm} cm (${waistIn} in)

-----------------------------------------
PRIMARY ANTHROPOMETRIC METRICS:
-----------------------------------------
• Body Mass Index (BMI): ${calculations.bmi} kg/m²
• Classification: ${calculations.category}
• BMI Prime: ${calculations.bmiPrime} (Upper Normal = ${standard === 'who' ? '25.0' : '23.0'})
• Ponderal (Corpulence) Index: ${calculations.ponderalIndex} kg/m³
• Healthy Weight Range: ${calculations.minHealthyWeightKg} kg - ${calculations.maxHealthyWeightKg} kg
• Target Weight Delta: ${calculations.weightDeltaKg === 0 ? 'Optimal (0 kg delta)' : calculations.weightDeltaKg > 0 ? `Gain ${calculations.weightDeltaKg} kg` : `Lose ${Math.abs(calculations.weightDeltaKg)} kg`}

-----------------------------------------
METABOLIC & BODY COMPOSITION:
-----------------------------------------
• Estimated Body Fat: ${calculations.bodyFatPct}%
• Basal Metabolic Rate (BMR): ${calculations.bmrKcal} kcal/day
• Total Daily Energy Expenditure (TDEE): ${calculations.tdeeKcal} kcal/day
• Waist-to-Height Ratio (WHtR): ${calculations.whtrRatio} (${calculations.whtrCategory})
• Ideal Body Weight (Devine Clinical): ${calculations.ibwDevineKg} kg

Generated via Toolique India (https://toolique.com/health/bmi-calculator)`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export CSV
  const handleExportCsv = () => {
    const csvRows = [
      ['Metric', 'Value', 'Unit', 'Notes'],
      ['Height', heightCm, 'cm', `${heightFt} ft ${heightIn} in`],
      ['Weight', weightKg, 'kg', `${weightLbs} lbs`],
      ['BMI', calculations.bmi, 'kg/m2', calculations.category],
      ['Standard', standard.toUpperCase(), 'guideline', standard === 'who' ? 'Global' : 'Asian-Pacific'],
      ['BMI Prime', calculations.bmiPrime, 'ratio', 'Upper normal 1.0'],
      ['Healthy Weight Min', calculations.minHealthyWeightKg, 'kg', '18.5 BMI threshold'],
      ['Healthy Weight Max', calculations.maxHealthyWeightKg, 'kg', `${standard === 'who' ? '24.9' : '22.9'} BMI threshold`],
      ['Body Fat %', calculations.bodyFatPct, '%', 'Deurenberg Equation'],
      ['BMR', calculations.bmrKcal, 'kcal/day', 'Mifflin-St Jeor Equation'],
      ['TDEE', calculations.tdeeKcal, 'kcal/day', `Activity: ${activity}`],
      ['Waist Circumference', waistCm, 'cm', 'Central adiposity marker'],
      ['Waist-to-Height Ratio', calculations.whtrRatio, 'ratio', calculations.whtrCategory],
      ['Ideal Body Weight (Devine)', calculations.ibwDevineKg, 'kg', 'Clinical standard']
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bmi_health_report_${weightKg}kg_${heightCm}cm.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-left">
      {/* AEO Body Composition & Metabolic Health Insights Card (Zero Double Heading) */}
      <div className="bg-gradient-to-br from-rose-50/90 via-white to-indigo-50/70 dark:from-rose-950/30 dark:via-zinc-900/60 dark:to-indigo-950/20 border border-rose-200/80 dark:border-rose-900/40 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-600 text-white uppercase tracking-wider flex items-center gap-1">
                <Heart className="w-3 h-3 fill-current" /> AEO Body Composition Studio
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                WHO & Asian-Pacific Multi-Standard Sizer
              </span>
            </div>
            <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 flex-wrap">
              <span>BMI: <strong className="font-mono text-base text-zinc-900 dark:text-white">{calculations.bmi} kg/m²</strong></span>
              <span className="text-zinc-300 dark:text-zinc-700">|</span>
              <span>Status: <strong className={`font-mono px-2 py-0.5 rounded-md border text-xs ${calculations.categoryColor}`}>{calculations.category}</strong></span>
              <span className="text-zinc-300 dark:text-zinc-700">|</span>
              <span>Healthy Range: <strong className="font-mono text-emerald-600 dark:text-emerald-400">{calculations.minHealthyWeightKg}–{calculations.maxHealthyWeightKg} kg</strong></span>
              <span className="text-zinc-300 dark:text-zinc-700">|</span>
              <span>BMR: <strong className="font-mono text-indigo-600 dark:text-indigo-400">{calculations.bmrKcal} kcal</strong></span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyReport}
              className="px-3 py-1.5 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-200 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-rose-500" />}
              <span>{copied ? 'Copied Report!' : 'Copy Health Report'}</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* 1-Click Archetype Presets */}
        <div className="mt-3 pt-3 border-t border-rose-100/70 dark:border-rose-900/30 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-rose-500" /> Archetypes:
          </span>
          {ARCHETYPES.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleApplyArchetype(preset)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white/80 dark:bg-zinc-800/80 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/80 transition cursor-pointer"
              title={preset.desc}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-zinc-200 dark:border-zinc-800">
        {[
          { id: 'calculator', name: '⚡ Full BMI & Body Composition', icon: Calculator },
          { id: 'target_planner', name: '🎯 Target Weight & Calorie Deficit', icon: Target },
          { id: 'waist_ratio', name: '📐 Waist-to-Height Ratio (WHtR)', icon: Compass },
          { id: 'matrix', name: '📊 Height-Weight Reference Matrix', icon: FileSpreadsheet }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeMode === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveMode(tab.id as BmiMode)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Anthropometric Inputs */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-rose-500" />
                <span>Physical Measurements</span>
              </h3>

              <div className="flex items-center gap-2">
                {/* Unit Switcher */}
                <div className="flex bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg text-xs font-semibold">
                  <button
                    onClick={() => setUnit('metric')}
                    className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                      unit === 'metric' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-2xs' : 'text-zinc-500'
                    }`}
                  >
                    Metric (kg/cm)
                  </button>
                  <button
                    onClick={() => setUnit('imperial')}
                    className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                      unit === 'imperial' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-2xs' : 'text-zinc-500'
                    }`}
                  >
                    Imperial (lbs/in)
                  </button>
                </div>

                <button
                  onClick={handleReset}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 p-1 transition cursor-pointer"
                  title="Reset to defaults"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Classification Guideline Toggle */}
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Classification Standard
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setStandard('who')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border text-left transition cursor-pointer ${
                    standard === 'who'
                      ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300'
                      : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <div className="font-extrabold">WHO Global</div>
                  <div className="text-[10px] font-normal text-zinc-500">Normal: 18.5 – 24.9</div>
                </button>

                <button
                  onClick={() => setStandard('asian')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border text-left transition cursor-pointer ${
                    standard === 'asian'
                      ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300'
                      : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <div className="font-extrabold">WHO Asian-Pacific</div>
                  <div className="text-[10px] font-normal text-zinc-500">Normal: 18.5 – 22.9</div>
                </button>
              </div>
            </div>

            {/* Biological Sex & Age */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Biological Sex
                </label>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setSex('male')}
                    className={`py-1.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
                      sex === 'male' ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-2xs' : 'text-zinc-500'
                    }`}
                  >
                    <User className="w-3 h-3" /> Male
                  </button>
                  <button
                    onClick={() => setSex('female')}
                    className={`py-1.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1 ${
                      sex === 'female' ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-2xs' : 'text-zinc-500'
                    }`}
                  >
                    <User className="w-3 h-3" /> Female
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Age (Years)
                </label>
                <input
                  type="number"
                  min={2}
                  max={120}
                  value={age}
                  onChange={(e) => setAge(Math.max(2, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white"
                />
              </div>
            </div>

            {/* Height & Weight Inputs */}
            <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              {unit === 'metric' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1 flex items-center gap-1">
                      <Scale className="w-3.5 h-3.5 text-zinc-400" /> Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min={10}
                      max={400}
                      value={weightKg}
                      onChange={(e) => handleMetricWeightChange(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1 flex items-center gap-1">
                      <Ruler className="w-3.5 h-3.5 text-zinc-400" /> Height (cm)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min={50}
                      max={260}
                      value={heightCm}
                      onChange={(e) => handleMetricHeightChange(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-white"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                      Weight (lbs)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={weightLbs}
                      onChange={(e) => handleImperialWeightChange(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                        Height (Feet)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={8}
                        value={heightFt}
                        onChange={(e) => handleImperialHeightChange(Number(e.target.value), heightIn)}
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                        Height (Inches)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={11}
                        value={heightIn}
                        onChange={(e) => handleImperialHeightChange(heightFt, Number(e.target.value))}
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Waist Circumference input */}
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Waist Circumference ({unit === 'metric' ? 'cm' : 'inches'})
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={unit === 'metric' ? waistCm : waistIn}
                  onChange={(e) => (unit === 'metric' ? handleMetricWaistChange(Number(e.target.value)) : handleImperialWaistChange(Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white"
                />
              </div>

              {/* Activity Level Selector */}
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Physical Activity Level (for BMR / TDEE)
                </label>
                <select
                  value={activity}
                  onChange={(e) => setActivity(e.target.value as ActivityLevel)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white"
                >
                  <option value="sedentary">Sedentary (Little to no exercise, desk job)</option>
                  <option value="light">Lightly Active (Light exercise 1-3 days/week)</option>
                  <option value="moderate">Moderately Active (Moderate exercise 3-5 days/week)</option>
                  <option value="active">Very Active (Hard training 6-7 days/week)</option>
                  <option value="very_active">Extremely Active (Athletic / physical job)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Calculations & Mode Displays */}
        <div className="lg:col-span-7 space-y-5">
          {/* MODE 1: Full BMI & Body Composition */}
          {activeMode === 'calculator' && (
            <div className="space-y-5">
              {/* Primary BMI Dial Card */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      Calculated Body Mass Index
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-4xl font-black font-mono text-zinc-900 dark:text-white">
                        {calculations.bmi}
                      </span>
                      <span className="text-sm font-semibold text-zinc-400">kg/m²</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`px-3 py-1 text-xs font-extrabold rounded-lg border ${calculations.categoryColor}`}>
                      {calculations.category}
                    </span>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      BMI Prime: <strong className="font-mono text-zinc-700 dark:text-zinc-300">{calculations.bmiPrime}</strong>
                    </p>
                  </div>
                </div>

                {/* Visual BMI Gauge Gradient */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    <span>Underweight (&lt;18.5)</span>
                    <span>Normal (18.5–{standard === 'who' ? '24.9' : '22.9'})</span>
                    <span>Overweight ({standard === 'who' ? '25–29.9' : '23–24.9'})</span>
                    <span>Obese (≥{standard === 'who' ? '30' : '25'})</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex shadow-inner">
                    <div className="h-full bg-sky-400" style={{ width: '25%' }} title="Underweight" />
                    <div className="h-full bg-emerald-500" style={{ width: '25%' }} title="Normal" />
                    <div className="h-full bg-amber-400" style={{ width: '25%' }} title="Overweight" />
                    <div className="h-full bg-rose-500" style={{ width: '25%' }} title="Obese" />
                  </div>
                  <div className="relative w-full text-xs">
                    <div
                      className="absolute -top-4 -translate-x-1/2 flex flex-col items-center transition-all duration-300"
                      style={{
                        left: `${Math.min(98, Math.max(2, ((calculations.bmi - 12) / 28) * 100))}%`
                      }}
                    >
                      <div className="w-3 h-3 rounded-full bg-zinc-900 dark:bg-white border-2 border-rose-500 shadow-md" />
                    </div>
                  </div>
                </div>

                {/* Insight Narrative */}
                <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {calculations.categoryDesc}
                  </p>
                </div>
              </div>

              {/* Comprehensive Body Composition Metric Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 space-y-1 shadow-2xs">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <Scale className="w-3 h-3 text-emerald-500" /> Healthy Weight
                  </span>
                  <div className="text-base font-extrabold text-zinc-900 dark:text-white font-mono">
                    {calculations.minHealthyWeightKg}–{calculations.maxHealthyWeightKg} <span className="text-xs font-normal">kg</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-medium">
                    {calculations.weightDeltaKg === 0 ? 'Currently in healthy range' : calculations.weightDeltaKg > 0 ? `+${calculations.weightDeltaKg} kg needed` : `${calculations.weightDeltaKg} kg to normal`}
                  </p>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 space-y-1 shadow-2xs">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-500" /> Basal Metabolic (BMR)
                  </span>
                  <div className="text-base font-extrabold text-zinc-900 dark:text-white font-mono">
                    {calculations.bmrKcal} <span className="text-xs font-normal">kcal/day</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-medium">Base calories burned at rest</p>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 space-y-1 shadow-2xs">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <Activity className="w-3 h-3 text-indigo-500" /> Daily Burn (TDEE)
                  </span>
                  <div className="text-base font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                    {calculations.tdeeKcal} <span className="text-xs font-normal">kcal/day</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-medium">Maintenance intake for activity</p>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 space-y-1 shadow-2xs">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <Heart className="w-3 h-3 text-rose-500" /> Body Fat % (Est.)
                  </span>
                  <div className="text-base font-extrabold text-zinc-900 dark:text-white font-mono">
                    {calculations.bodyFatPct}%
                  </div>
                  <p className="text-[10px] text-zinc-500 font-medium">Deurenberg Adult Formula</p>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 space-y-1 shadow-2xs">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <Compass className="w-3 h-3 text-purple-500" /> Ponderal Index
                  </span>
                  <div className="text-base font-extrabold text-zinc-900 dark:text-white font-mono">
                    {calculations.ponderalIndex} <span className="text-xs font-normal">kg/m³</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-medium">Height-cubed corpulence index</p>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 space-y-1 shadow-2xs">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <Target className="w-3 h-3 text-sky-500" /> Ideal Weight (Devine)
                  </span>
                  <div className="text-base font-extrabold text-zinc-900 dark:text-white font-mono">
                    {calculations.ibwDevineKg} <span className="text-xs font-normal">kg</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-medium">Clinical pharmacy IBW benchmark</p>
                </div>
              </div>
            </div>
          )}

          {/* MODE 2: Target Weight & Calorie Deficit Planner */}
          {activeMode === 'target_planner' && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-rose-500" />
                  <span>Target Weight & Calorie Deficit Engine</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Goal Setting Method
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setTargetGoal('bmi')}
                      className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        targetGoal === 'bmi'
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
                          : 'border-zinc-200 dark:border-zinc-700 text-zinc-500'
                      }`}
                    >
                      Target BMI
                    </button>
                    <button
                      onClick={() => setTargetGoal('weight')}
                      className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        targetGoal === 'weight'
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
                          : 'border-zinc-200 dark:border-zinc-700 text-zinc-500'
                      }`}
                    >
                      Target Weight (kg)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    {targetGoal === 'bmi' ? 'Target BMI Value' : 'Target Weight (kg)'}
                  </label>
                  {targetGoal === 'bmi' ? (
                    <input
                      type="number"
                      step="0.5"
                      min={18.5}
                      max={35}
                      value={targetBmiValue}
                      onChange={(e) => setTargetBmiValue(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-900 dark:text-white"
                    />
                  ) : (
                    <input
                      type="number"
                      step="0.5"
                      min={30}
                      max={250}
                      value={targetWeightKg}
                      onChange={(e) => setTargetWeightKg(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-900 dark:text-white"
                    />
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                    Weekly Safe Pace: <strong className="text-rose-600 dark:text-rose-400">{weeklyPaceKg} kg / week</strong> (Recommended 0.5 kg/week)
                  </label>
                </div>
                <input
                  type="range"
                  min={0.25}
                  max={1.0}
                  step={0.05}
                  value={weeklyPaceKg}
                  onChange={(e) => setWeeklyPaceKg(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-rose-600"
                />
              </div>

              {/* Target Planning Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60 text-center">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Target Weight</span>
                  <p className="text-xl font-black text-zinc-900 dark:text-white font-mono mt-0.5">
                    {targetPlan.targetKg} kg
                  </p>
                  <p className="text-[10px] text-zinc-500 font-medium">
                    {targetPlan.deltaKg === 0 ? 'Current Weight' : targetPlan.isLosing ? `Lose ${targetPlan.absDeltaKg} kg` : `Gain ${targetPlan.absDeltaKg} kg`}
                  </p>
                </div>

                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60 text-center">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Estimated Duration</span>
                  <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                    {targetPlan.weeksRequired} Weeks
                  </p>
                  <p className="text-[10px] text-zinc-500 font-medium">~{(targetPlan.weeksRequired / 4.3).toFixed(1)} Months</p>
                </div>

                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60 text-center">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Daily Calorie Target</span>
                  <p className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono mt-0.5">
                    {targetPlan.targetDailyCalories} kcal
                  </p>
                  <p className="text-[10px] text-zinc-500 font-medium">
                    {targetPlan.isLosing ? `-${targetPlan.dailyCalorieOffset} kcal deficit` : `+${targetPlan.dailyCalorieOffset} kcal surplus`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* MODE 3: Waist-to-Height Ratio (WHtR) */}
          {activeMode === 'waist_ratio' && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-rose-500" />
                  <span>Waist-to-Height Ratio (Ashwell Shape Chart)</span>
                </h3>
              </div>

              <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">WHtR Ratio</span>
                  <div className="text-3xl font-black text-zinc-900 dark:text-white font-mono mt-0.5">
                    {calculations.whtrRatio}
                  </div>
                </div>

                <div className="text-right">
                  <span className={`px-3 py-1 text-xs font-bold rounded-lg ${calculations.whtrColor}`}>
                    {calculations.whtrCategory}
                  </span>
                  <p className="text-[11px] text-zinc-400 mt-1">Rule of Thumb: WHtR &lt; 0.50</p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
                <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                  Why Waist-to-Height Ratio matters over BMI alone:
                </p>
                <p className="leading-relaxed">
                  BMI cannot differentiate between subcutaneous fat and dangerous visceral fat stored around internal organs. The Ashwell Shape Chart guideline states: <em>&ldquo;Keep your waist circumference to less than half your height.&rdquo;</em> A ratio above 0.50 increases the risk of cardiovascular events, hypertension, and Type 2 diabetes regardless of overall body weight.
                </p>
              </div>
            </div>
          )}

          {/* MODE 4: Reference Height-Weight Matrix */}
          {activeMode === 'matrix' && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-rose-500" />
                  <span>Standard BMI Height-Weight Matrix ({standard.toUpperCase()})</span>
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-bold uppercase text-[10px]">
                      <th className="p-2.5 rounded-l-lg">Height</th>
                      <th className="p-2.5">Underweight</th>
                      <th className="p-2.5">Normal Weight</th>
                      <th className="p-2.5">Overweight</th>
                      <th className="p-2.5 rounded-r-lg">Obese (Class I+)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {[155, 160, 165, 170, 175, 180, 185, 190].map((h) => {
                      const hM = h / 100;
                      const maxNorm = standard === 'who' ? 24.9 : 22.9;
                      const minKg = (18.5 * hM * hM).toFixed(0);
                      const maxKg = (maxNorm * hM * hM).toFixed(0);
                      const overKg = (29.9 * hM * hM).toFixed(0);
                      const isCurrentH = Math.abs(heightCm - h) <= 2;

                      return (
                        <tr key={h} className={isCurrentH ? 'bg-rose-50/50 dark:bg-rose-950/30 font-bold text-rose-700 dark:text-rose-300' : 'text-zinc-700 dark:text-zinc-300'}>
                          <td className="p-2.5 font-mono">{h} cm</td>
                          <td className="p-2.5 text-sky-600 font-mono">&lt; {minKg} kg</td>
                          <td className="p-2.5 text-emerald-600 font-mono">{minKg} – {maxKg} kg</td>
                          <td className="p-2.5 text-amber-600 font-mono">{maxKg} – {overKg} kg</td>
                          <td className="p-2.5 text-rose-600 font-mono">&gt; {overKg} kg</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Clinical Disclaimer Alert */}
          <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/30 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-amber-900 dark:text-amber-200">
              <p className="font-bold">Clinical Nutrition & Sports Medicine Note</p>
              <p className="leading-relaxed opacity-90">
                BMI is a statistical screening index that does not distinguish muscle mass, bone density, or fluid retention from adipose tissue. High-performance athletes and bodybuilders may register an &quot;overweight&quot; score despite minimal body fat. For comprehensive clinical diagnosis, combine BMI with DEXA scans, waist circumference, and lipid blood panels.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

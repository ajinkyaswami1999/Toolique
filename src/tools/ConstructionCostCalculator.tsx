import { useState, useEffect } from 'react';
import { 
  Check, RotateCcw, MapPin, Building2, Layers, 
  Settings, Users, Download, Share2, 
  ArrowLeft, ArrowRight, Calendar, 
  ChevronRight, Sliders, AlertCircle, CheckSquare, Square
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import MaterialTrendGraph from '../components/MaterialTrendGraph';
import {
  LOCATION_DATABASE,
  PROJECT_TYPE_MULTIPLIERS,
  CONSTRUCTION_TYPE_MULTIPLIERS,
  QUALITY_MULTIPLIERS,
  QUALITY_RATE_DATABASE,
  COMPLEXITY_MULTIPLIERS,
  SOIL_CONDITION_FACTORS,
  ACCESSIBILITY_FACTORS,
  SLOPE_FACTORS,
  EXISTING_STRUCTURE_DEMOLITION,
  METHOD_FACTORS,
  COMPONENT_CONFIG_LIST,
  ADDITIONAL_FEATURES_DATABASE,
  DEFAULT_MATERIAL_RATES,
  MATERIAL_COEFFICIENTS,
  TIMELINE_PHASES,
  calculateCPM
} from '../data/constructionRateEngine';

export default function ConstructionCostCalculator() {
  // Step navigation: 1-7
  const [step, setStep] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeGanttTab, setActiveGanttTab] = useState<'chart' | 'table'>('chart');
  const [hoveredPhase, setHoveredPhase] = useState<string | null>(null);

  // ----------------------------------------------------
  // STEP 1: PROJECT LOCATION STATE
  // ----------------------------------------------------
  const [country, setCountry] = useState<string>("India");
  const [stateName, setStateName] = useState<string>("Karnataka");
  const [cityName, setCityName] = useState<string>("Bengaluru");

  // ----------------------------------------------------
  // STEP 2: PROJECT DETAILS STATE
  // ----------------------------------------------------
  const [projectType, setProjectType] = useState<string>("residential");
  const [plotArea, setPlotArea] = useState<number>(1200);
  const [areaPerFloor, setAreaPerFloor] = useState<number>(1000);
  const [floors, setFloors] = useState<number>(2);
  const [hasBasement, setHasBasement] = useState<boolean>(false);
  const [basementArea, setBasementArea] = useState<number>(800);
  const [groundFloorIncluded, setGroundFloorIncluded] = useState<boolean>(true);
  const [numUnits, setNumUnits] = useState<number>(1);
  const [rooms, setRooms] = useState<number>(4);
  const [bathrooms, setBathrooms] = useState<number>(3);

  // ----------------------------------------------------
  // STEP 3: CONSTRUCTION TYPE STATE
  // ----------------------------------------------------
  const [constructionType, setConstructionType] = useState<string>("rcc");

  // ----------------------------------------------------
  // STEP 4: QUALITY & FINISHING STATE
  // ----------------------------------------------------
  const [quality, setQuality] = useState<string>("standard");
  const [flooringType, setFlooringType] = useState<string>("tiles"); 
  const [paintQuality, setPaintQuality] = useState<string>("standard"); 
  const [doorQuality, setDoorQuality] = useState<string>("standard");
  const [kitchenQuality, setKitchenQuality] = useState<string>("standard");
  const [bathroomQuality, setBathroomQuality] = useState<string>("standard");
  const [electricalFixtureQuality, setElectricalFixtureQuality] = useState<string>("standard");
  const [plumbingFixtureQuality, setPlumbingFixtureQuality] = useState<string>("standard");

  // ----------------------------------------------------
  // STEP 5: SITE CONDITIONS & METHOD
  // ----------------------------------------------------
  const [complexity, setComplexity] = useState<string>("moderate");
  const [soil, setSoil] = useState<string>("normal");
  const [accessibility, setAccessibility] = useState<string>("easy");
  const [groundSlope, setGroundSlope] = useState<string>("flat");
  const [existingStructure, setExistingStructure] = useState<string>("none");
  const [constructionMethod, setConstructionMethod] = useState<string>("conventional");

  // ----------------------------------------------------
  // STEP 6: LABOUR STATE
  // ----------------------------------------------------
  const [skilledCount, setSkilledCount] = useState<number>(4);
  const [unskilledCount, setUnskilledCount] = useState<number>(6);
  const [supervisorsCount, setSupervisorsCount] = useState<number>(1);
  const [contractorsCount, setContractorsCount] = useState<number>(1);
  const [autoEstimateLabour, setAutoEstimateLabour] = useState<boolean>(true);

  // ----------------------------------------------------
  // STEP 7: ADDITIONAL FEATURES STATE
  // ----------------------------------------------------
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    "water_tank", "boundary_wall", "gate", "parking"
  ]);

  // ----------------------------------------------------
  // ADVANCED OVERRIDES & CALCULATOR CONFIG
  // ----------------------------------------------------
  const [customCostPerSqFt, setCustomCostPerSqFt] = useState<string>("");
  const [customContingency, setCustomContingency] = useState<number>(8); // 8% default
  const [customGST, setCustomGST] = useState<boolean>(true); // default true (18% tax)
  const [customOverhead, setCustomOverhead] = useState<number>(10); // 10% default
  const [customInflation, setCustomInflation] = useState<number>(5); // 5% default
  const [customProfessionalFee, setCustomProfessionalFee] = useState<number>(4); // 4% default
  const [customLocationMultiplier, setCustomLocationMultiplier] = useState<string>("");

  // Material rates state
  const [materialRates, setMaterialRates] = useState<Record<string, number>>(DEFAULT_MATERIAL_RATES);
  // Labor rates state (₹ / man-day)
  const [laborRates, setLaborRates] = useState({
    skilled: 750,
    unskilled: 450,
    supervisor: 1100,
    contractor: 1500
  });

  // Derived state calculations
  const totalBuiltUpArea = (areaPerFloor * floors) + (hasBasement ? basementArea : 0);
  const groundFootprint = groundFloorIncluded ? areaPerFloor : 0;

  // Sync automatic labour strength estimates
  useEffect(() => {
    if (autoEstimateLabour) {
      // Auto-estimate counts based on built-up area and number of floors
      const estSkilled = Math.max(2, Math.round(totalBuiltUpArea / 400));
      const estUnskilled = Math.max(4, Math.round(totalBuiltUpArea / 250));
      const estSupervisors = Math.max(1, Math.round(totalBuiltUpArea / 1500));
      
      setSkilledCount(estSkilled);
      setUnskilledCount(estUnskilled);
      setSupervisorsCount(estSupervisors);
      setContractorsCount(1);
    }
  }, [totalBuiltUpArea, autoEstimateLabour, floors]);

  // Helper to retrieve current location multiplier
  const getLocationMultiplier = () => {
    if (customLocationMultiplier && !isNaN(parseFloat(customLocationMultiplier))) {
      return parseFloat(customLocationMultiplier);
    }
    const countryData = LOCATION_DATABASE.find(c => c.name === country);
    if (!countryData) return 1.0;
    const stateData = countryData.states.find(s => s.name === stateName);
    if (!stateData) return 1.0;
    const cityData = stateData.cities.find(ci => ci.name === cityName);
    return cityData ? cityData.multiplier : 1.0;
  };

  // Compile final calculations
  const calculateCosts = () => {
    const locMult = getLocationMultiplier();
    const typeMult = PROJECT_TYPE_MULTIPLIERS[projectType] || 1.0;
    const constTypeMult = CONSTRUCTION_TYPE_MULTIPLIERS[constructionType] || 1.0;
    const qualMult = QUALITY_MULTIPLIERS[quality] || 1.0;
    const compCostMult = COMPLEXITY_MULTIPLIERS[complexity]?.cost || 1.0;
    const methodCostMult = METHOD_FACTORS[constructionMethod]?.costMultiplier || 1.0;

    // Component-level calculations
    const componentsBreakdown = COMPONENT_CONFIG_LIST.map(comp => {
      let qty = 0;
      let basisText = "";
      let rate = comp.baseRate;

      switch (comp.basis) {
        case "plot_area":
          qty = plotArea;
          basisText = `${plotArea.toLocaleString()} sq.ft Plot`;
          rate = rate * locMult;
          if (comp.id === "site_prep") {
            rate = rate * (ACCESSIBILITY_FACTORS[accessibility]?.costMultiplier || 1.0);
          }
          break;
        case "ground_footprint":
          qty = groundFootprint;
          basisText = `${groundFootprint.toLocaleString()} sq.ft Footprint`;
          rate = rate * locMult * constTypeMult;
          if (comp.id === "excavation") {
            rate = rate * (ACCESSIBILITY_FACTORS[accessibility]?.costMultiplier || 1.0) * (SLOPE_FACTORS[groundSlope]?.costMultiplier || 1.0);
            if (hasBasement) {
              // Deeper excavation addition
              qty = groundFootprint + (basementArea * 1.5);
              basisText = `${groundFootprint.toLocaleString()} sq.ft + Basement Excavation`;
            }
          } else if (comp.id === "foundation") {
            rate = rate * (SOIL_CONDITION_FACTORS[soil]?.costMultiplier || 1.0) * (SLOPE_FACTORS[groundSlope]?.costMultiplier || 1.0);
          }
          break;
        case "total_built_up_area":
          qty = totalBuiltUpArea;
          basisText = `${totalBuiltUpArea.toLocaleString()} sq.ft Built-up`;
          
          // Map to quality database rate allocations if applicable
          if (comp.id === "rcc_structural") {
            rate = QUALITY_RATE_DATABASE[quality].structure * constTypeMult * typeMult * compCostMult;
          } else if (comp.id === "brickwork") {
            rate = QUALITY_RATE_DATABASE[quality].brickwork * compCostMult;
          } else if (comp.id === "flooring") {
            // Apply flooring quality adjustments
            let floorAdjust = 1.0;
            if (flooringType === "marble") floorAdjust = 1.6;
            else if (flooringType === "granite") floorAdjust = 1.35;
            else if (flooringType === "wooden") floorAdjust = 1.45;
            rate = QUALITY_RATE_DATABASE[quality].flooring * floorAdjust;
          } else if (comp.id === "doors_windows") {
            let doorAdjust = 1.0;
            if (doorQuality === "premium") doorAdjust = 1.25;
            else if (doorQuality === "luxury") doorAdjust = 1.65;
            else if (doorQuality === "basic") doorAdjust = 0.8;
            rate = QUALITY_RATE_DATABASE[quality].doorsWindows * doorAdjust;
          } else if (comp.id === "electrical") {
            let electAdjust = 1.0;
            if (electricalFixtureQuality === "premium") electAdjust = 1.3;
            else if (electricalFixtureQuality === "luxury") electAdjust = 1.7;
            rate = QUALITY_RATE_DATABASE[quality].electrical * electAdjust;
          } else if (comp.id === "plumbing") {
            let plumbAdjust = 1.0;
            if (plumbingFixtureQuality === "premium") plumbAdjust = 1.3;
            else if (plumbingFixtureQuality === "luxury") plumbAdjust = 1.7;
            rate = QUALITY_RATE_DATABASE[quality].plumbing * plumbAdjust;
          } else if (comp.id === "painting") {
            let paintAdjust = 1.0;
            if (paintQuality === "premium") paintAdjust = 1.3;
            else if (paintQuality === "luxury") paintAdjust = 1.8;
            rate = QUALITY_RATE_DATABASE[quality].painting * paintAdjust;
          } else if (comp.id === "false_ceiling") {
            // False ceiling rate is based on whether it is fully selected
            const hasFalseCeiling = selectedFeatures.includes("false_ceiling_full");
            rate = hasFalseCeiling ? 95 : 15; // standard minor plaster ceiling if not selected
          } else {
            rate = rate * qualMult * compCostMult;
          }
          rate = rate * locMult * methodCostMult;
          break;
        case "kitchens":
          qty = numUnits; // 1 kitchen per unit default
          basisText = `${numUnits} Kitchens`;
          let kAdjust = 1.0;
          if (kitchenQuality === "premium") kAdjust = 1.35;
          else if (kitchenQuality === "luxury") kAdjust = 2.0;
          else if (kitchenQuality === "basic") kAdjust = 0.7;
          rate = rate * qualMult * kAdjust * locMult;
          break;
        case "bathrooms":
          qty = bathrooms;
          basisText = `${bathrooms} Bathrooms`;
          let bAdjust = 1.0;
          if (bathroomQuality === "premium") bAdjust = 1.3;
          else if (bathroomQuality === "luxury") bAdjust = 1.95;
          else if (bathroomQuality === "basic") bAdjust = 0.75;
          rate = rate * qualMult * bAdjust * locMult;
          break;
        case "special_features":
          // Special features sum
          let featCost = 0;
          selectedFeatures.forEach(featId => {
            const feat = ADDITIONAL_FEATURES_DATABASE[featId];
            if (feat) {
              if (feat.isAreaBased) {
                featCost += feat.rate * totalBuiltUpArea;
              } else {
                featCost += feat.rate;
              }
            }
          });
          qty = 1;
          basisText = `${selectedFeatures.length} Add-on Features`;
          rate = featCost;
          break;
        default:
          qty = 1;
          basisText = "Formula basis";
          rate = 0;
      }

      // Handle custom flat sq.ft override
      if (customCostPerSqFt && !isNaN(parseFloat(customCostPerSqFt))) {
        // Override components related to building core construction (5 to 13)
        const overriddenIds = ["rcc_structural", "slab_roof", "brickwork", "plastering", "flooring", "doors_windows", "electrical", "plumbing", "painting"];
        if (overriddenIds.includes(comp.id)) {
          if (comp.id === "rcc_structural") {
            qty = totalBuiltUpArea;
            basisText = `${totalBuiltUpArea.toLocaleString()} sq.ft Built-up (Custom Override)`;
            rate = parseFloat(customCostPerSqFt);
          } else {
            qty = 0;
            rate = 0;
          }
        }
      }

      return {
        ...comp,
        qty,
        basisText,
        rate: Math.round(rate),
        amount: Math.round(qty * rate)
      };
    });

    // Site preparation demo flat cost additions
    const demoCost = EXISTING_STRUCTURE_DEMOLITION[existingStructure] || 0;
    if (demoCost > 0) {
      const prepIdx = componentsBreakdown.findIndex(c => c.id === "site_prep");
      if (prepIdx !== -1) {
        componentsBreakdown[prepIdx].amount += demoCost;
        componentsBreakdown[prepIdx].basisText += ` + Demolition (₹${demoCost.toLocaleString()})`;
      }
    }

    // Estimate Labour (custom component 19)
    // Assume typical man-days required scales with built-up area and complexity
    // standard: 0.72 man-days per sq.ft of built-up area
    const totalManDays = Math.round(totalBuiltUpArea * 0.72 * qualMult * compCostMult);
    
    // Distribute man-days among categories: Skilled (40%), Unskilled (50%), Supervisor (8%), Contractor (2%)
    const skilledManDays = Math.round(totalManDays * 0.40);
    const unskilledManDays = Math.round(totalManDays * 0.50);
    const supervisorManDays = Math.round(totalManDays * 0.08);
    const contractorManDays = Math.round(totalManDays * 0.02);

    const skilledCost = skilledManDays * laborRates.skilled;
    const unskilledCost = unskilledManDays * laborRates.unskilled;
    const supervisorCost = supervisorManDays * laborRates.supervisor;
    const contractorCost = contractorManDays * laborRates.contractor;
    const totalLabourCost = skilledCost + unskilledCost + supervisorCost + contractorCost;

    const labourIdx = componentsBreakdown.findIndex(c => c.id === "labour");
    if (labourIdx !== -1) {
      componentsBreakdown[labourIdx].qty = totalManDays;
      componentsBreakdown[labourIdx].basisText = `${totalManDays.toLocaleString()} Man-days distributed`;
      componentsBreakdown[labourIdx].rate = Math.round(totalLabourCost / (totalManDays || 1));
      componentsBreakdown[labourIdx].amount = totalLabourCost;
    }

    // Subtotal of structural & finishing works (excluding professional fees, misc, contingency)
    const baseSubtotal = componentsBreakdown
      .filter(c => !["professional_fee", "miscellaneous", "contingency"].includes(c.id))
      .reduce((sum, c) => sum + c.amount, 0);

    // Apply Professional fees (component 20)
    const profFeeAmount = Math.round(baseSubtotal * (customProfessionalFee / 100));
    const profIdx = componentsBreakdown.findIndex(c => c.id === "professional_fee");
    if (profIdx !== -1) {
      componentsBreakdown[profIdx].qty = 1;
      componentsBreakdown[profIdx].basisText = `${customProfessionalFee}% of base works`;
      componentsBreakdown[profIdx].rate = profFeeAmount;
      componentsBreakdown[profIdx].amount = profFeeAmount;
    }

    // Apply Miscellaneous / Inflation escalation (component 21)
    const miscAmount = Math.round(baseSubtotal * (customInflation / 100));
    const miscIdx = componentsBreakdown.findIndex(c => c.id === "miscellaneous");
    if (miscIdx !== -1) {
      componentsBreakdown[miscIdx].qty = 1;
      componentsBreakdown[miscIdx].basisText = `${customInflation}% Escalation buffer`;
      componentsBreakdown[miscIdx].rate = miscAmount;
      componentsBreakdown[miscIdx].amount = miscAmount;
    }

    // Apply Contingency (component 22)
    const contingencyAmount = Math.round(baseSubtotal * (customContingency / 100));
    const contIdx = componentsBreakdown.findIndex(c => c.id === "contingency");
    if (contIdx !== -1) {
      componentsBreakdown[contIdx].qty = 1;
      componentsBreakdown[contIdx].basisText = `${customContingency}% Contingency`;
      componentsBreakdown[contIdx].rate = contingencyAmount;
      componentsBreakdown[contIdx].amount = contingencyAmount;
    }

    // Calculate subtotal before GST & overheads
    const subtotalWithFees = componentsBreakdown.reduce((sum, c) => sum + c.amount, 0);
    
    // Contractor Overhead
    const contractorOverheadAmount = Math.round(subtotalWithFees * (customOverhead / 100));
    
    // Tax (GST)
    const gstRate = customGST ? 0.18 : 0.0;
    const gstAmount = Math.round((subtotalWithFees + contractorOverheadAmount) * gstRate);

    // Final Total Construction Cost
    const finalTotalCost = subtotalWithFees + contractorOverheadAmount + gstAmount;

    // Material Cost splits (based on raw materials index)
    // Dynamic material estimates calculation
    const materialsSummary = Object.keys(MATERIAL_COEFFICIENTS).map(matId => {
      const coeffData = MATERIAL_COEFFICIENTS[matId];
      // Quantities scale with Built-up Area & Quality Multiplier
      let quantity = totalBuiltUpArea * coeffData.coeff * qualMult;
      
      // Fine-tunes
      if (matId === "tiles") {
        let tileAdjust = 1.0;
        if (flooringType === "marble") tileAdjust = 1.2;
        quantity = quantity * tileAdjust;
      }
      
      const rate = materialRates[matId] || DEFAULT_MATERIAL_RATES[matId as keyof typeof DEFAULT_MATERIAL_RATES] || 0;
      const amount = Math.round(quantity * rate);

      return {
        id: matId,
        name: coeffData.name,
        qty: Math.round(quantity),
        unit: coeffData.unit,
        rate,
        amount
      };
    });

    const totalMaterialsCost = materialsSummary.reduce((sum, m) => sum + m.amount, 0);
    
    // Calculate split averages
    // Material is typically ~55-60% of base construction, Labor is ~30-35%, Overheads/Taxes/Fees is remaining
    const actualMaterialCostSplit = Math.min(finalTotalCost * 0.65, Math.round(totalMaterialsCost));
    const actualLaborCostSplit = Math.round(totalLabourCost);
    const professionalAndOtherSplit = finalTotalCost - actualMaterialCostSplit - actualLaborCostSplit;

    return {
      components: componentsBreakdown,
      materials: materialsSummary,
      subtotal: subtotalWithFees,
      overhead: contractorOverheadAmount,
      gst: gstAmount,
      total: finalTotalCost,
      materialCostSplit: actualMaterialCostSplit,
      laborCostSplit: actualLaborCostSplit,
      otherCostSplit: professionalAndOtherSplit,
      totalManDays,
      skilledManDays,
      unskilledManDays,
      supervisorManDays,
      contractorManDays
    };
  };

  const costResults = calculateCosts();

  // ----------------------------------------------------
  // TIMELINE SCHEDULING (CPM ENGINE)
  // ----------------------------------------------------
  // Calculate labor strength ratio
  const getLaborStrengthRatio = () => {
    // Standard estimated labour strength
    const estSkilled = Math.max(2, Math.round(totalBuiltUpArea / 400));
    const estUnskilled = Math.max(4, Math.round(totalBuiltUpArea / 250));
    const totalEst = estSkilled + estUnskilled;
    
    const actualTotal = skilledCount + unskilledCount;
    return totalEst > 0 ? actualTotal / totalEst : 1.0;
  };

  const cpmResults = calculateCPM(
    totalBuiltUpArea,
    floors,
    constructionType,
    quality,
    complexity,
    soil,
    accessibility,
    getLaborStrengthRatio(),
    constructionMethod
  );

  // Calculate project durations
  const totalProjectDays = Math.max(...Object.values(cpmResults).map(p => p.endDay), 0);
  const minProjectDays = Math.round(totalProjectDays * 0.88);
  const maxProjectDays = Math.round(totalProjectDays * 1.15);

  const minMonths = Math.round(minProjectDays / 30);
  const maxMonths = Math.round(maxProjectDays / 30);

  // Calculate Critical Path
  const getCriticalPath = () => {
    const latestTimes: Record<string, { latestStart: number; latestFinish: number }> = {};
    const reversedPhases = [...TIMELINE_PHASES].reverse();
    
    for (const phase of reversedPhases) {
      const successors = TIMELINE_PHASES.filter(p => p.dependencies.includes(phase.id));
      let lf = totalProjectDays;
      if (successors.length > 0) {
        lf = Math.min(...successors.map(s => latestTimes[s.id]?.latestStart ?? totalProjectDays));
      }
      const duration = cpmResults[phase.id]?.durationDays ?? 0;
      latestTimes[phase.id] = {
        latestStart: lf - duration,
        latestFinish: lf
      };
    }
    
    return TIMELINE_PHASES.filter(phase => {
      const earlyStart = cpmResults[phase.id]?.startDay ?? 0;
      const latestStart = latestTimes[phase.id]?.latestStart ?? 0;
      return Math.abs(earlyStart - latestStart) <= 1.5; // slight tolerance
    }).map(p => p.id);
  };

  const criticalPathIds = getCriticalPath();

  // Reset all states
  const handleResetAll = () => {
    setStep(1);
    setCountry("India");
    setStateName("Karnataka");
    setCityName("Bengaluru");
    setProjectType("residential");
    setPlotArea(1200);
    setAreaPerFloor(1000);
    setFloors(2);
    setHasBasement(false);
    setBasementArea(800);
    setGroundFloorIncluded(true);
    setNumUnits(1);
    setRooms(4);
    setBathrooms(3);
    setConstructionType("rcc");
    setQuality("standard");
    setFlooringType("tiles");
    setPaintQuality("standard");
    setDoorQuality("standard");
    setKitchenQuality("standard");
    setBathroomQuality("standard");
    setElectricalFixtureQuality("standard");
    setPlumbingFixtureQuality("standard");
    setComplexity("moderate");
    setSoil("normal");
    setAccessibility("easy");
    setGroundSlope("flat");
    setExistingStructure("none");
    setConstructionMethod("conventional");
    setAutoEstimateLabour(true);
    setSelectedFeatures(["water_tank", "boundary_wall", "gate", "parking"]);
    setCustomCostPerSqFt("");
    setCustomContingency(8);
    setCustomGST(true);
    setCustomOverhead(10);
    setCustomInflation(5);
    setCustomProfessionalFee(4);
    setCustomLocationMultiplier("");
    setMaterialRates(DEFAULT_MATERIAL_RATES);
    setLaborRates({
      skilled: 750,
      unskilled: 450,
      supervisor: 1100,
      contractor: 1500
    });
  };

  // Copy brief estimate to clipboard
  const copyEstimateToClipboard = () => {
    const text = `Construction Estimate & Timeline Report
------------------------------------------------
Project details:
- Location        : ${cityName}, ${stateName}, ${country}
- Plot Area       : ${plotArea.toLocaleString()} sq.ft
- Built-up Area   : ${totalBuiltUpArea.toLocaleString()} sq.ft (${floors} Floors)
- Building Type   : ${projectType.toUpperCase()} (${constructionType.toUpperCase()} structure)
- Quality Grade   : ${quality.toUpperCase()}

Estimated Budget:
- Total Cost      : ₹${costResults.total.toLocaleString('en-IN')} (incl. GST & Contingency)
- Cost / Sq.Ft    : ₹${Math.round(costResults.total / totalBuiltUpArea).toLocaleString('en-IN')} / sq.ft
- Material Cost   : ₹${costResults.materialCostSplit.toLocaleString('en-IN')}
- Labor Cost      : ₹${costResults.laborCostSplit.toLocaleString('en-IN')}
- Fees & Buffer   : ₹${costResults.otherCostSplit.toLocaleString('en-IN')}

Estimated Schedule:
- Overall Duration: ${minMonths} to ${maxMonths} Months (${totalProjectDays} days expected)
- Earliest Finished: ${minProjectDays} Days
- Conservative Finished: ${maxProjectDays} Days

Generated on ToolStack India Construction Calculator.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // ----------------------------------------------------
  // PDF EXPORT COMPILER VIA JSPDF
  // ----------------------------------------------------
  const downloadEstimatePDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const margin = 15;
    let y = 15;

    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > 280) {
        doc.addPage();
        y = 15;
      }
    };

    // Header Title
    doc.setFillColor(30, 41, 59); // Dark slate
    doc.rect(0, 0, 210, 38, 'F');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("CONSTRUCTION ESTIMATE REPORT", margin, 15);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(200, 220, 240);
    doc.text(`Professional quantity estimate generated on ${new Date().toLocaleDateString()} | Toolique Architecture Tools`, margin, 21);

    // Grid details
    y = 48;
    doc.setTextColor(15, 23, 42); // slate-900

    // General info card
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.roundedRect(margin, y, 180, 52, 2, 2, 'FD');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(79, 70, 229); // indigo-600
    doc.text("PROJECT OVERVIEW & INPUTS", margin + 5, y + 6);

    doc.setTextColor(71, 85, 105); // slate-600
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    
    // Left column
    doc.text(`Location: ${cityName}, ${stateName}, ${country} (factor: ${getLocationMultiplier()})`, margin + 5, y + 14);
    doc.text(`Project Type: ${projectType.charAt(0).toUpperCase() + projectType.slice(1)}`, margin + 5, y + 21);
    doc.text(`Plot Area: ${plotArea} sq.ft | Ground Footprint: ${groundFootprint} sq.ft`, margin + 5, y + 28);
    doc.text(`Built-up Area: ${totalBuiltUpArea} sq.ft (${floors} Floors + ${hasBasement ? 'Basement' : 'No Basement'})`, margin + 5, y + 35);
    doc.text(`Quality Grade: ${quality.toUpperCase()} | Structure Type: ${constructionType.toUpperCase()}`, margin + 5, y + 42);

    // Right column
    doc.text(`Design Complexity: ${complexity.toUpperCase()}`, margin + 95, y + 14);
    doc.text(`Site Slope / Soil: ${groundSlope.toUpperCase()} / ${soil.toUpperCase()}`, margin + 95, y + 21);
    doc.text(`Accessibility: ${accessibility.toUpperCase()}`, margin + 95, y + 28);
    doc.text(`Construction Method: ${constructionMethod.toUpperCase()}`, margin + 95, y + 35);
    doc.text(`Rooms / Baths: ${rooms} Rooms | ${bathrooms} Bathrooms`, margin + 95, y + 42);

    y += 60;

    // Highlights boxes
    doc.setFillColor(238, 242, 255); // Indigo-50
    doc.roundedRect(margin, y, 85, 28, 2, 2, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(79, 70, 229);
    doc.text("ESTIMATED CONSTRUCTION COST", margin + 4, y + 6);
    doc.setFontSize(16);
    doc.setTextColor(30, 27, 75); // Dark Indigo
    doc.text(`₹${costResults.total.toLocaleString('en-IN')}`, margin + 4, y + 16);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(79, 70, 229);
    doc.text(`Avg. ₹${Math.round(costResults.total / totalBuiltUpArea).toLocaleString('en-IN')} per sq.ft`, margin + 4, y + 23);

    doc.setFillColor(240, 253, 250); // Emerald-50
    doc.roundedRect(margin + 95, y, 85, 28, 2, 2, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(13, 148, 136); // Teal-600
    doc.text("ESTIMATED SCHEDULE TIMELINE", margin + 99, y + 6);
    doc.setFontSize(15);
    doc.setTextColor(19, 78, 74);
    doc.text(`${minMonths} to ${maxMonths} Months`, margin + 99, y + 16);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(13, 148, 136);
    doc.text(`Expected Completion: ${totalProjectDays} Days`, margin + 99, y + 23);

    y += 38;

    // Budget Allocation table
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("COST BREAKDOWN MATRIX", margin, y);
    y += 4;

    doc.setFillColor(30, 41, 59);
    doc.rect(margin, y, 180, 7, 'F');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text("Category", margin + 3, y + 5);
    doc.text("Allocation Ratio", margin + 80, y + 5);
    doc.text("Amount (INR)", margin + 145, y + 5);

    y += 7;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);

    // Row 1
    doc.text("Core Construction Materials (Cement, Steel, Sand, etc.)", margin + 3, y + 5);
    doc.text(`${Math.round((costResults.materialCostSplit / costResults.total) * 100)}%`, margin + 80, y + 5);
    doc.text(`₹${costResults.materialCostSplit.toLocaleString('en-IN')}`, margin + 145, y + 5);
    doc.line(margin, y + 7, margin + 180, y + 7);
    
    // Row 2
    y += 7;
    doc.text("Labour & Contractor Execution Charges", margin + 3, y + 5);
    doc.text(`${Math.round((costResults.laborCostSplit / costResults.total) * 100)}%`, margin + 80, y + 5);
    doc.text(`₹${costResults.laborCostSplit.toLocaleString('en-IN')}`, margin + 145, y + 5);
    doc.line(margin, y + 7, margin + 180, y + 7);

    // Row 3
    y += 7;
    doc.text("Professional Fees, Approvals & Buffer Escalations", margin + 3, y + 5);
    doc.text(`${Math.round((costResults.otherCostSplit / costResults.total) * 100)}%`, margin + 80, y + 5);
    doc.text(`₹${costResults.otherCostSplit.toLocaleString('en-IN')}`, margin + 145, y + 5);
    doc.line(margin, y + 7, margin + 180, y + 7);

    // Row 4 (GST & Overhead)
    y += 7;
    doc.text("Contractor Overhead & GST/Taxes", margin + 3, y + 5);
    doc.text(`${Math.round(((costResults.overhead + costResults.gst) / costResults.total) * 100)}%`, margin + 80, y + 5);
    doc.text(`₹${(costResults.overhead + costResults.gst).toLocaleString('en-IN')}`, margin + 145, y + 5);
    doc.line(margin, y + 7, margin + 180, y + 7);

    // Subtotal Row
    y += 12;
    doc.setFont("helvetica", "bold");
    doc.text("Final Total Budget (Indicative BOQ)", margin + 3, y);
    doc.text(`₹${costResults.total.toLocaleString('en-IN')}`, margin + 145, y);

    // Page 2 - Components BOQ list
    doc.addPage();
    y = 15;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text("DETAILED COMPONENT ESTIMATION (BOQ)", margin, y);
    y += 6;

    doc.setFillColor(71, 85, 105); // Gray header
    doc.rect(margin, y, 180, 8, 'F');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text("Component", margin + 2, y + 5.5);
    doc.text("Calculation Basis", margin + 65, y + 5.5);
    doc.text("Rate (INR)", margin + 128, y + 5.5);
    doc.text("Amount (INR)", margin + 155, y + 5.5);

    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(8);

    costResults.components.forEach(comp => {
      checkPageBreak(7);
      if (comp.amount > 0) {
        doc.text(comp.name, margin + 2, y + 5);
        doc.text(comp.basisText, margin + 65, y + 5);
        doc.text(`₹${comp.rate.toLocaleString('en-IN')}`, margin + 128, y + 5);
        doc.text(`₹${comp.amount.toLocaleString('en-IN')}`, margin + 155, y + 5);
        doc.line(margin, y + 7, margin + 180, y + 7);
        y += 7;
      }
    });

    // Add GST & Overheads to page 2 end
    checkPageBreak(25);
    y += 5;
    doc.setFont("helvetica", "bold");
    doc.text("Subtotal Works:", margin + 65, y);
    doc.text(`₹${costResults.subtotal.toLocaleString('en-IN')}`, margin + 155, y);
    y += 5;
    doc.text(`Contractor Overhead (${customOverhead}%):`, margin + 65, y);
    doc.text(`₹${costResults.overhead.toLocaleString('en-IN')}`, margin + 155, y);
    y += 5;
    doc.text(`GST/Taxes (${customGST ? '18%' : '0%'}):`, margin + 65, y);
    doc.text(`₹${costResults.gst.toLocaleString('en-IN')}`, margin + 155, y);
    y += 6;
    doc.line(margin + 65, y - 1, margin + 180, y - 1);
    doc.text("Grand Final Construction Cost:", margin + 65, y + 3);
    doc.text(`₹${costResults.total.toLocaleString('en-IN')}`, margin + 155, y + 3);

    // Page 3 - Material & Scheduling
    doc.addPage();
    y = 15;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text("MATERIAL QUANTITIES & TIMELINE SCHEDULING", margin, y);
    y += 6;

    // Materials Table
    doc.setFontSize(10);
    doc.text("Approximate Material Quantities", margin, y + 2);
    y += 5;
    doc.setFillColor(13, 148, 136); // Teal header
    doc.rect(margin, y, 180, 7, 'F');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text("Material Description", margin + 2, y + 5);
    doc.text("Est. Quantity", margin + 70, y + 5);
    doc.text("Unit", margin + 105, y + 5);
    doc.text("Average Rate", margin + 130, y + 5);
    doc.text("Total Cost (INR)", margin + 155, y + 5);

    y += 7;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(8);

    costResults.materials.forEach(mat => {
      doc.text(mat.name, margin + 2, y + 5);
      doc.text(mat.qty.toLocaleString(), margin + 70, y + 5);
      doc.text(mat.unit, margin + 105, y + 5);
      doc.text(`₹${mat.rate.toLocaleString()}`, margin + 130, y + 5);
      doc.text(`₹${mat.amount.toLocaleString('en-IN')}`, margin + 155, y + 5);
      doc.line(margin, y + 7, margin + 180, y + 7);
      y += 7;
    });

    // Schedule phases
    y += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text("Scheduled Phases & Durations (CPM)", margin, y);
    y += 5;

    doc.setFillColor(30, 41, 59);
    doc.rect(margin, y, 180, 7, 'F');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text("Phase Name", margin + 2, y + 5);
    doc.text("Start Day", margin + 80, y + 5);
    doc.text("End Day", margin + 105, y + 5);
    doc.text("Duration (Days)", margin + 130, y + 5);
    doc.text("Critical Path", margin + 158, y + 5);

    y += 7;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(7.5);

    TIMELINE_PHASES.forEach(phase => {
      const cpm = cpmResults[phase.id];
      if (cpm) {
        const isCritical = criticalPathIds.includes(phase.id);
        doc.text(phase.name, margin + 2, y + 4);
        doc.text(`Day ${cpm.startDay}`, margin + 80, y + 4);
        doc.text(`Day ${cpm.endDay}`, margin + 105, y + 4);
        doc.text(`${cpm.durationDays} days`, margin + 130, y + 4);
        doc.setFont("helvetica", isCritical ? "bold" : "normal");
        if (isCritical) {
          doc.setTextColor(194, 65, 12);
        } else {
          doc.setTextColor(100, 100, 100);
        }
        doc.text(isCritical ? "YES" : "NO", margin + 158, y + 4);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(51, 65, 85);
        doc.line(margin, y + 6, margin + 180, y + 6);
        y += 6;
      }
    });

    // Disclaimer & Notes page 3 bottom
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(194, 65, 12);
    doc.text("ASSUMPTIONS & GENERAL DISCLAIMER", margin, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    y += 4;
    doc.text("1. Estimates provided are indicative calculations only. Material rates, site complications and local parameters influence actual costs.", margin, y);
    y += 3.5;
    doc.text("2. Construction timeline is calculated based on standard sequencing dependencies and assuming standard weather conditions.", margin, y);
    y += 3.5;
    doc.text("3. Final architectural and structural drawings with proper detailed Bills of Quantities (BOQ) must be drawn up by an engineer.", margin, y);

    // Save
    doc.save(`Construction_Estimate_${cityName.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-left py-4 px-2 select-none">
      
      {/* MULTI STEP PROGRESS BAR & RESET BUTTON */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/85 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="grid grid-cols-4 md:grid-cols-7 gap-2 flex-1 w-full">
          {[
            { id: 1, name: "Location" },
            { id: 2, name: "Project Details" },
            { id: 3, name: "Structure" },
            { id: 4, name: "Quality & Finish" },
            { id: 5, name: "Site & Method" },
            { id: 6, name: "Add-ons" },
            { id: 7, name: "Estimate Results" }
          ].map((s) => {
            const isCompleted = s.id < step;
            const isActive = s.id === step;
            return (
              <button
                key={s.id}
                onClick={() => {
                  if (s.id < step || step === 7) setStep(s.id);
                }}
                disabled={s.id > step && step !== 7}
                className="flex flex-col items-start gap-1 p-2 rounded-xl text-left transition duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
              >
                <div className="flex items-center gap-1.5 w-full">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition ${
                    isCompleted 
                      ? 'bg-indigo-500 border-indigo-500 text-white' 
                      : isActive 
                      ? 'bg-indigo-500/10 border-indigo-500 text-indigo-500' 
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500'
                  }`}>
                    {isCompleted ? '✓' : s.id}
                  </div>
                  <div className="h-0.5 flex-1 bg-zinc-100 dark:bg-zinc-800 hidden md:block">
                    <div className={`h-full bg-indigo-500 transition-all ${isCompleted ? 'w-full' : 'w-0'}`} />
                  </div>
                </div>
                <span className={`text-[10px] font-bold truncate w-full ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-500 dark:text-zinc-400'}`}>
                  {s.name}
                </span>
              </button>
            );
          })}
        </div>
        
        <button
          onClick={handleResetAll}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl transition duration-200 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        
        {/* WIZARD CARD WRAPPER */}
        {step < 7 && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/80 p-6 md:p-8 rounded-2xl shadow-sm space-y-6">
            
            {/* STEP 1: PROJECT LOCATION */}
            {step === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <h2 className="text-lg font-bold text-zinc-800 dark:text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-indigo-500" />
                    Step 1 — Project Location
                  </h2>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                    Select country, state and city to load regional construction material indices and labor multipliers.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2">Country</label>
                    <select
                      value={country}
                      onChange={(e) => {
                        setCountry(e.target.value);
                        const firstState = LOCATION_DATABASE.find(c => c.name === e.target.value)?.states[0];
                        if (firstState) {
                          setStateName(firstState.name);
                          setCityName(firstState.cities[0].name);
                        }
                      }}
                      className="saas-input py-2.5 font-semibold text-sm"
                    >
                      {LOCATION_DATABASE.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2">State / Region</label>
                    <select
                      value={stateName}
                      onChange={(e) => {
                        setStateName(e.target.value);
                        const state = LOCATION_DATABASE.find(c => c.name === country)?.states.find(s => s.name === e.target.value);
                        if (state) {
                          setCityName(state.cities[0].name);
                        }
                      }}
                      className="saas-input py-2.5 font-semibold text-sm"
                    >
                      {LOCATION_DATABASE.find(c => c.name === country)?.states.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2">City</label>
                    <select
                      value={cityName}
                      onChange={(e) => setCityName(e.target.value)}
                      className="saas-input py-2.5 font-semibold text-sm"
                    >
                      {LOCATION_DATABASE.find(c => c.name === country)?.states.find(s => s.name === stateName)?.cities.map(ci => <option key={ci.name} value={ci.name}>{ci.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 p-4 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Location Config Indicator</h4>
                  <div className="flex flex-col md:flex-row gap-4 justify-between text-xs">
                    <div>
                      <span className="text-zinc-450 dark:text-zinc-500">Selected City Factor:</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200 ml-1.5 font-mono">{getLocationMultiplier()}x</span>
                    </div>
                    <div>
                      <span className="text-zinc-450 dark:text-zinc-500">Estimated Cost Zone:</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200 ml-1.5 capitalize">{cityName === "Mumbai" || cityName === "New Delhi" || cityName === "Bengaluru" || cityName === "San Francisco" || cityName === "New York City" ? 'Metro Standard' : 'Tier 1/2 Standard'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: PROJECT DETAILS */}
            {step === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <h2 className="text-lg font-bold text-zinc-800 dark:text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-500" />
                    Step 2 — Project Details
                  </h2>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                    Provide building size parameters. Total Built-up Area is calculated automatically from base variables.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2">Project Type</label>
                    <select
                      value={projectType}
                      onChange={(e) => setProjectType(e.target.value)}
                      className="saas-input py-2.5 font-semibold text-sm"
                    >
                      <option value="residential">Residential House / Villa</option>
                      <option value="commercial">Commercial Building</option>
                      <option value="office">Office Space</option>
                      <option value="retail">Retail Showroom</option>
                      <option value="other">Other / Mixed development</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2">Plot Area (sq.ft)</label>
                    <input
                      type="number"
                      min="100"
                      value={plotArea || ''}
                      onChange={(e) => setPlotArea(Math.max(0, parseInt(e.target.value) || 0))}
                      className="saas-input py-2 font-mono font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2">Built-up Area per floor (sq.ft)</label>
                    <input
                      type="number"
                      min="100"
                      value={areaPerFloor || ''}
                      onChange={(e) => setAreaPerFloor(Math.min(plotArea, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="saas-input py-2 font-mono font-semibold"
                    />
                    <p className="text-[10px] text-zinc-450 dark:text-zinc-500 mt-1">Cannot exceed plot area.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2">Number of floors</label>
                    <input
                      type="number"
                      min="1"
                      max="15"
                      value={floors || ''}
                      onChange={(e) => setFloors(Math.min(15, Math.max(1, parseInt(e.target.value) || 1)))}
                      className="saas-input py-2 font-mono font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2">Include Ground Floor?</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setGroundFloorIncluded(true)}
                        className={`py-2 px-3 rounded-lg text-xs font-bold border ${groundFloorIncluded ? 'bg-indigo-500/10 border-indigo-500 text-indigo-500' : 'border-zinc-200 dark:border-zinc-800 text-zinc-400'}`}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setGroundFloorIncluded(false)}
                        className={`py-2 px-3 rounded-lg text-xs font-bold border ${!groundFloorIncluded ? 'bg-indigo-500/10 border-indigo-500 text-indigo-500' : 'border-zinc-200 dark:border-zinc-800 text-zinc-400'}`}
                      >
                        No (Stilt/Void)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2">Basement Slab?</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setHasBasement(true)}
                        className={`py-2 px-3 rounded-lg text-xs font-bold border ${hasBasement ? 'bg-indigo-500/10 border-indigo-500 text-indigo-500' : 'border-zinc-200 dark:border-zinc-800 text-zinc-400'}`}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setHasBasement(false)}
                        className={`py-2 px-3 rounded-lg text-xs font-bold border ${!hasBasement ? 'bg-indigo-500/10 border-indigo-500 text-indigo-500' : 'border-zinc-200 dark:border-zinc-800 text-zinc-400'}`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  {hasBasement && (
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2">Basement Area (sq.ft)</label>
                      <input
                        type="number"
                        min="50"
                        value={basementArea || ''}
                        onChange={(e) => setBasementArea(Math.max(0, parseInt(e.target.value) || 0))}
                        className="saas-input py-2 font-mono font-semibold"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2">Number of units / flats</label>
                    <input
                      type="number"
                      min="1"
                      value={numUnits || ''}
                      onChange={(e) => setNumUnits(Math.max(1, parseInt(e.target.value) || 1))}
                      className="saas-input py-2 font-mono font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2">Total Rooms count</label>
                    <input
                      type="number"
                      min="1"
                      value={rooms || ''}
                      onChange={(e) => setRooms(Math.max(1, parseInt(e.target.value) || 1))}
                      className="saas-input py-2 font-mono font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2">Bathrooms count</label>
                    <input
                      type="number"
                      min="1"
                      value={bathrooms || ''}
                      onChange={(e) => setBathrooms(Math.max(1, parseInt(e.target.value) || 1))}
                      className="saas-input py-2 font-mono font-semibold"
                    />
                  </div>
                </div>

                <div className="bg-indigo-50/60 dark:bg-indigo-950/20 p-4 border border-indigo-100 dark:border-indigo-900/35 rounded-xl flex items-center justify-between">
                  <div className="text-xs">
                    <span className="font-semibold text-zinc-450 dark:text-zinc-500">Calculated Built-up Area:</span>
                    <p className="text-[10px] text-zinc-400 mt-0.5">({areaPerFloor} × {floors}) + {hasBasement ? `${basementArea} (Basement)` : '0'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                      {totalBuiltUpArea.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-zinc-500 ml-1">sq.ft</span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: CONSTRUCTION STRUCTURAL TYPE */}
            {step === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <h2 className="text-lg font-bold text-zinc-800 dark:text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-500" />
                    Step 3 — Structural Frame Type
                  </h2>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                    Select the foundational skeleton model of your building structure.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: "rcc", name: "RCC Frame Structure", desc: "Reinforced cement concrete pillars, beams & slabs. Strong, versatile, standard model.", multiplier: 1.0 },
                    { id: "load_bearing", name: "Load Bearing Structure", desc: "Walls bear slab weight. Cheaper, but limited floors and structural modification capability.", multiplier: 0.86 },
                    { id: "steel", name: "Steel Skeleton Structure", desc: "Hot-rolled structural steel. Faster, modular assembly, high tensile strength, costlier.", multiplier: 1.15 },
                    { id: "composite", name: "Composite Model", desc: "Combines structural steel framing with RCC casting. Used in commercial designs.", multiplier: 1.08 }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setConstructionType(item.id)}
                      className={`p-5 rounded-xl border text-left flex flex-col justify-between transition h-32 duration-200 cursor-pointer ${
                        constructionType === item.id 
                          ? 'bg-indigo-500/10 border-indigo-500 text-indigo-500 dark:text-indigo-400' 
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                      }`}
                    >
                      <div>
                        <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">{item.name}</h4>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1.5 line-clamp-2">{item.desc}</p>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-bold text-zinc-450 dark:text-zinc-500 pt-2 border-t border-zinc-100 dark:border-zinc-800/60 w-full mt-2">
                        <span>Cost Factor</span>
                        <span>{item.multiplier}x</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: QUALITY & FINISHING */}
            {step === 4 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <h2 className="text-lg font-bold text-zinc-800 dark:text-white flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-indigo-500" />
                    Step 4 — Material Quality & Finishing
                  </h2>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                    Define components grade level. Rates adjust according to selected finishes.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2">Overall Quality Grade</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { id: "basic", name: "Basic", rates: "M15 conc, local bricks, basic ceramic tiles" },
                      { id: "standard", name: "Standard", rates: "M20 conc, high kiln bricks, vitrified tiles" },
                      { id: "premium", name: "Premium", rates: "Branded finishes, teakwood elements, modular setup" },
                      { id: "luxury", name: "Luxury", rates: "Italian marble, automation, custom specifications" }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setQuality(item.id)}
                        className={`p-4 rounded-xl border text-left transition duration-200 cursor-pointer ${
                          quality === item.id 
                            ? 'bg-indigo-500/10 border-indigo-500 text-indigo-500 dark:text-indigo-400' 
                            : 'border-zinc-200 dark:border-zinc-800 text-zinc-550 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                        }`}
                      >
                        <h4 className="font-bold text-xs capitalize">{item.id}</h4>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 line-clamp-2">{item.rates}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2">Flooring Selection</label>
                    <select
                      value={flooringType}
                      onChange={(e) => setFlooringType(e.target.value)}
                      className="saas-input py-2 text-xs font-semibold"
                    >
                      <option value="tiles">Standard Vitrified Tiles (1.0x)</option>
                      <option value="marble">Italian Marble (+60% cost)</option>
                      <option value="granite">Granite slabs (+35% cost)</option>
                      <option value="wooden">Engineered Hardwood (+45% cost)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2">Paint Quality</label>
                    <select
                      value={paintQuality}
                      onChange={(e) => setPaintQuality(e.target.value)}
                      className="saas-input py-2 text-xs font-semibold"
                    >
                      <option value="basic">Distemper / Basic acrylic (0.8x)</option>
                      <option value="standard">Standard Acrylic Emulsion (1.0x)</option>
                      <option value="premium">Premium Washable Emulsion (1.3x)</option>
                      <option value="luxury">Luxury Texture / PU coating (1.8x)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2">Doors Frame/Shutter Quality</label>
                    <select
                      value={doorQuality}
                      onChange={(e) => setDoorQuality(e.target.value)}
                      className="saas-input py-2 text-xs font-semibold"
                    >
                      <option value="basic">Flush / Hardwood core (0.8x)</option>
                      <option value="standard">Teak Wood veneer veneer standard (1.0x)</option>
                      <option value="premium">Solid Teak Wood premium (1.25x)</option>
                      <option value="luxury">Custom designer panel / brass fittings (1.65x)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2">Kitchen Finishing</label>
                    <select
                      value={kitchenQuality}
                      onChange={(e) => setKitchenQuality(e.target.value)}
                      className="saas-input py-2 text-xs font-semibold"
                    >
                      <option value="basic">Granite slab + Basic cabinets</option>
                      <option value="standard">Standard Semi-modular cabinets</option>
                      <option value="premium">Premium Soft-close Modular Acrylic</option>
                      <option value="luxury">Imported Luxury Laminates & Quartz</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2">Electrical Fittings</label>
                    <select
                      value={electricalFixtureQuality}
                      onChange={(e) => setElectricalFixtureQuality(e.target.value)}
                      className="saas-input py-2 text-xs font-semibold"
                    >
                      <option value="basic">Standard wires, basic modular switches</option>
                      <option value="standard">Branded switches, copper multi strand</option>
                      <option value="premium">Premium switches, fire retardant wires</option>
                      <option value="luxury">Custom IoT touch switches, automation ready</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2">Plumbing Fixtures</label>
                    <select
                      value={plumbingFixtureQuality}
                      onChange={(e) => setPlumbingFixtureQuality(e.target.value)}
                      className="saas-input py-2 text-xs font-semibold"
                    >
                      <option value="basic">Local brass taps & fittings</option>
                      <option value="standard">Branded PVC / Chrome fittings</option>
                      <option value="premium">Premium Diverters & wall mount basins</option>
                      <option value="luxury">Thermostatic mixers, rain showers, imported sanitary</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: SITE CONDITIONS & METHOD */}
            {step === 5 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <h2 className="text-lg font-bold text-zinc-800 dark:text-white flex items-center gap-2">
                    <Settings className="w-5 h-5 text-indigo-500" />
                    Step 5 — Site Conditions & Construction Method
                  </h2>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                    Foundation design is heavily influenced by soil and slope parameters. Timeline depends on access logistics.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2">Soil Condition</label>
                    <select
                      value={soil}
                      onChange={(e) => setSoil(e.target.value)}
                      className="saas-input py-2 text-xs font-semibold"
                    >
                      <option value="good">Hard Rock / High SBC Soil (0.95x cost)</option>
                      <option value="normal">Standard Clay / Sandy Loam (1.0x)</option>
                      <option value="poor">Loose Sand / Black Cotton / Marshy (+20% foundation cost)</option>
                      <option value="unknown">Unknown soil / Default (1.0x)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2">Site Accessibility</label>
                    <select
                      value={accessibility}
                      onChange={(e) => setAccessibility(e.target.value)}
                      className="saas-input py-2 text-xs font-semibold"
                    >
                      <option value="easy">Wide roads, easy concrete mixer transit (1.0x)</option>
                      <option value="moderate">Narrow road, restricted transit timing (+5% excavation cost)</option>
                      <option value="difficult">Congested alleyways, manual carrying needed (+15% cost)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2">Ground Slope</label>
                    <select
                      value={groundSlope}
                      onChange={(e) => setGroundSlope(e.target.value)}
                      className="saas-input py-2 text-xs font-semibold"
                    >
                      <option value="flat">Flat terrain (1.0x)</option>
                      <option value="slight">Slight slope, minor leveling required (+6% foundation cost)</option>
                      <option value="steep">Steep step slope, retaining wall needed (+22% cost)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2">Design Complexity</label>
                    <select
                      value={complexity}
                      onChange={(e) => setComplexity(e.target.value)}
                      className="saas-input py-2 text-xs font-semibold"
                    >
                      <option value="simple">Simple / Rectangular grid (-10% cost & timeline)</option>
                      <option value="moderate">Moderate / Standard residential layout (1.0x)</option>
                      <option value="complex">Complex / Multi cantilever structures (+15% cost, +25% timeline)</option>
                      <option value="highly_complex">Highly Complex / Curvilinear design (+35% cost, +50% timeline)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2">Existing Structure Demo</label>
                    <select
                      value={existingStructure}
                      onChange={(e) => setExistingStructure(e.target.value)}
                      className="saas-input py-2 text-xs font-semibold"
                    >
                      <option value="none">No structure (Clear site)</option>
                      <option value="partial">Partial demolition (₹65,000 demo fee)</option>
                      <option value="major">Major concrete structure removal (₹1,80,000 demo fee)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2">Construction Method</label>
                    <select
                      value={constructionMethod}
                      onChange={(e) => setConstructionMethod(e.target.value)}
                      className="saas-input py-2 text-xs font-semibold"
                    >
                      <option value="conventional">Conventional casting (1.0x duration)</option>
                      <option value="fast_track">Fast-Track (Quick curing mixes, night shifts) (-22% duration, +12% cost)</option>
                      <option value="prefab">Prefabricated Columns / Wall panels (-40% duration, +15% cost)</option>
                      <option value="mixed">Mixed hybrid approach (-15% duration, +5% cost)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: LABOUR STRENGTH */}
            {step === 6 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <h2 className="text-lg font-bold text-zinc-800 dark:text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-500" />
                    Step 6 — Labour Strength & Deployment
                  </h2>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                    Labour count directly affects the duration scaling engine. Fewer workers increase timeline, while overstaffing has diminishing returns.
                  </p>
                </div>

                <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-850 p-4 rounded-xl border border-zinc-150 dark:border-zinc-800/80">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-zinc-800 dark:text-white">Auto Estimate Labour strength</h4>
                    <p className="text-[10px] text-zinc-400">Calculate worker counts automatically based on built-up area.</p>
                  </div>
                  <button
                    onClick={() => setAutoEstimateLabour(!autoEstimateLabour)}
                    className={`p-1.5 rounded-lg border transition ${
                      autoEstimateLabour 
                        ? 'bg-indigo-500/10 border-indigo-500 text-indigo-500' 
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-400'
                    }`}
                  >
                    {autoEstimateLabour ? '✓ Enabled' : 'Disabled (Custom)'}
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2">Skilled Workers (Masons/Carpenters)</label>
                    <input
                      type="number"
                      min="1"
                      disabled={autoEstimateLabour}
                      value={skilledCount || ''}
                      onChange={(e) => setSkilledCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="saas-input py-2 font-mono font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2">Unskilled Helpers (Loaders)</label>
                    <input
                      type="number"
                      min="2"
                      disabled={autoEstimateLabour}
                      value={unskilledCount || ''}
                      onChange={(e) => setUnskilledCount(Math.max(2, parseInt(e.target.value) || 2))}
                      className="saas-input py-2 font-mono font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2">Site Supervisors</label>
                    <input
                      type="number"
                      min="1"
                      disabled={autoEstimateLabour}
                      value={supervisorsCount || ''}
                      onChange={(e) => setSupervisorsCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="saas-input py-2 font-mono font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2">Contractors</label>
                    <input
                      type="number"
                      min="1"
                      disabled={autoEstimateLabour}
                      value={contractorsCount || ''}
                      onChange={(e) => setContractorsCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="saas-input py-2 font-mono font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 p-4 rounded-xl text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Estimated Total Crew size:</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">{skilledCount + unskilledCount + supervisorsCount + contractorsCount} Workers</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Labour Strength Modifier:</span>
                    <span className="font-bold text-indigo-500 font-mono">{getLaborStrengthRatio().toFixed(2)}x (impacts timeline speed)</span>
                  </div>
                </div>
              </div>
            )}

            {/* BUTTON NAVIGATION STEPPER */}
            <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-5 flex justify-between items-center">
              <button
                onClick={() => setStep(prev => Math.max(1, prev - 1))}
                disabled={step === 1}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850 rounded-xl transition duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              
              <button
                onClick={() => setStep(prev => Math.min(7, prev + 1))}
                className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-sm hover:shadow-indigo-500/20 rounded-xl transition duration-200 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* STEP 7: ADDITIONAL FEATURES STEP */}
        {step === 7 && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* INPUT PANEL SUMMARY / QUICK TOGGLES CARD */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/80 p-6 rounded-2xl shadow-sm">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Sliders className="w-4.5 h-4.5 text-indigo-500" />
                  Additional Features Checklist
                </h3>
                <span className="text-[10px] font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                  {selectedFeatures.length} selected
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
                {Object.keys(ADDITIONAL_FEATURES_DATABASE).map(featId => {
                  const feat = ADDITIONAL_FEATURES_DATABASE[featId];
                  const isChecked = selectedFeatures.includes(featId);
                  return (
                    <button
                      key={featId}
                      onClick={() => {
                        if (isChecked) {
                          setSelectedFeatures(selectedFeatures.filter(f => f !== featId));
                        } else {
                          setSelectedFeatures([...selectedFeatures, featId]);
                        }
                      }}
                      className={`flex items-center gap-2 p-3 border rounded-xl transition text-left cursor-pointer ${
                        isChecked 
                          ? 'border-indigo-500 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400' 
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-450 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {isChecked ? (
                          <CheckSquare className="w-4.5 h-4.5 text-indigo-500 fill-indigo-500/10" />
                        ) : (
                          <Square className="w-4.5 h-4.5 text-zinc-300 dark:text-zinc-700" />
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-bold block">{feat.name}</span>
                        <span className="text-[9px] text-zinc-400 font-mono font-bold">
                          {feat.isAreaBased ? `₹${feat.rate}/sq.ft` : `₹${feat.rate.toLocaleString('en-IN')}`}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* RESULTS DASHBOARD SUMMARY CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-indigo-500/5 to-indigo-500/10 dark:from-indigo-500/10 dark:to-indigo-500/20 border border-indigo-500/25 p-5 rounded-2xl shadow-sm space-y-1">
                <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest block">
                  Total Project Cost
                </span>
                <div className="text-2xl md:text-3xl font-black text-indigo-600 dark:text-indigo-400 font-mono tracking-tight leading-tight">
                  ₹{costResults.total.toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-zinc-450 dark:text-zinc-500 block">
                  Incl. GST & contingencies
                </span>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/80 p-5 rounded-2xl shadow-sm space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
                  Cost Per Sq.Ft
                </span>
                <div className="text-2xl md:text-3xl font-black text-zinc-800 dark:text-zinc-200 font-mono tracking-tight leading-tight">
                  ₹{Math.round(costResults.total / totalBuiltUpArea).toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-zinc-450 dark:text-zinc-500 block">
                  For {totalBuiltUpArea.toLocaleString()} sq.ft
                </span>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/80 p-5 rounded-2xl shadow-sm space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
                  Estimated Duration
                </span>
                <div className="text-2xl md:text-3xl font-black text-zinc-800 dark:text-zinc-200 font-mono tracking-tight leading-tight">
                  {minMonths}–{maxMonths} Mo
                </div>
                <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold block">
                  Expected: {totalProjectDays} Days
                </span>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/80 p-5 rounded-2xl shadow-sm space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
                  Total Built-up Area
                </span>
                <div className="text-2xl md:text-3xl font-black text-zinc-800 dark:text-zinc-200 font-mono tracking-tight leading-tight">
                  {totalBuiltUpArea.toLocaleString()}
                </div>
                <span className="text-[10px] text-zinc-450 dark:text-zinc-500 block">
                  {floors} Floors {hasBasement ? '+ Basement' : ''}
                </span>
              </div>
            </div>

            {/* ACTION PANEL */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-150 dark:border-zinc-800/80 shadow-sm">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStep(6)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-800 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850 rounded-lg transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Modify Parameters</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copyEstimateToClipboard}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 text-zinc-650 dark:text-zinc-300 transition duration-200 cursor-pointer active:scale-95"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                  <span>{copied ? 'Estimate Copied!' : 'Share Estimate'}</span>
                </button>

                <button
                  onClick={downloadEstimatePDF}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow-indigo-500/10 transition duration-200 cursor-pointer active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Report (PDF)</span>
                </button>
              </div>
            </div>

            {/* MAIN TWO-COLUMN DASHBOARD */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* LEFT COLUMN: BUDGET MATRIX */}
              <div className="lg:col-span-6 space-y-6">
                
                {/* DYNAMIC PROGRESS SPLIT BAR */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/80 p-6 rounded-2xl shadow-sm space-y-4">
                  <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
                    Estimate Allocation Map
                  </h3>
                  
                  {/* SEGMENTED PROGRESS BAR */}
                  <div className="w-full h-4 rounded-full bg-zinc-100 dark:bg-zinc-850 overflow-hidden flex">
                    <div 
                      className="bg-indigo-500 h-full transition-all duration-300" 
                      style={{ width: `${(costResults.materialCostSplit / costResults.total) * 100}%` }}
                      title={`Materials: ₹${costResults.materialCostSplit.toLocaleString()}`}
                    />
                    <div 
                      className="bg-teal-500 h-full transition-all duration-300" 
                      style={{ width: `${(costResults.laborCostSplit / costResults.total) * 100}%` }}
                      title={`Labour: ₹${costResults.laborCostSplit.toLocaleString()}`}
                    />
                    <div 
                      className="bg-purple-500 h-full transition-all duration-300" 
                      style={{ width: `${(costResults.otherCostSplit / costResults.total) * 100}%` }}
                      title={`Overhead & GST: ₹${costResults.otherCostSplit.toLocaleString()}`}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 block" />
                        <span className="text-[10px] font-bold text-zinc-500">Materials (Cement, Steel)</span>
                      </div>
                      <span className="text-xs font-black font-mono block pl-4">
                        ₹{costResults.materialCostSplit.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-teal-500 block" />
                        <span className="text-[10px] font-bold text-zinc-500">Labour Strength</span>
                      </div>
                      <span className="text-xs font-black font-mono block pl-4">
                        ₹{costResults.laborCostSplit.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500 block" />
                        <span className="text-[10px] font-bold text-zinc-500">Taxes & Buffer</span>
                      </div>
                      <span className="text-xs font-black font-mono block pl-4">
                        ₹{costResults.otherCostSplit.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* COMPONENT BOQ LIST */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/80 p-6 rounded-2xl shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2">
                    <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
                      Detailed component BOQ Matrix
                    </h3>
                  </div>

                  <div className="overflow-x-auto max-h-[460px] overflow-y-auto pr-1">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-zinc-150 dark:border-zinc-800 text-zinc-400 font-bold">
                          <th className="py-2.5">Component Description</th>
                          <th className="py-2.5">Basis</th>
                          <th className="py-2.5 text-right">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-semibold text-zinc-650 dark:text-zinc-300">
                        {costResults.components.map(comp => comp.amount > 0 && (
                          <tr key={comp.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-850/40">
                            <td className="py-3 font-bold">{comp.name}</td>
                            <td className="py-3 text-zinc-400 text-[10px]">{comp.basisText}</td>
                            <td className="py-3 text-right font-mono font-bold text-zinc-700 dark:text-zinc-200">
                              ₹{comp.amount.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-4 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-550">Subtotal Works</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-250 font-mono">₹{costResults.subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-550">Contractor Overhead ({customOverhead}%)</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-250 font-mono">₹{costResults.overhead.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-550">GST/Taxes ({customGST ? '18%' : '0%'})</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-250 font-mono">₹{costResults.gst.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* RAW MATERIAL ESTIMATES */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/80 p-6 rounded-2xl shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2">
                    <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
                      Approximate Material Quantities
                    </h3>
                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      Editable Rates
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-zinc-150 dark:border-zinc-800 text-zinc-400 font-bold">
                          <th className="py-2">Material</th>
                          <th className="py-2">Quantity</th>
                          <th className="py-2">Rate (₹)</th>
                          <th className="py-2 text-right">Cost (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-semibold text-zinc-650 dark:text-zinc-300">
                        {costResults.materials.map(mat => (
                          <tr key={mat.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-850/40">
                            <td className="py-3 font-bold text-zinc-700 dark:text-zinc-200">{mat.name}</td>
                            <td className="py-3 font-mono">{mat.qty.toLocaleString()} <span className="text-[10px] text-zinc-400">{mat.unit}</span></td>
                            <td className="py-2">
                              <input
                                type="number"
                                value={mat.rate}
                                onChange={(e) => {
                                  const updated = { ...materialRates, [mat.id]: Math.max(0, parseInt(e.target.value) || 0) };
                                  setMaterialRates(updated);
                                }}
                                className="w-18 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-transparent font-mono text-center font-bold"
                              />
                            </td>
                            <td className="py-3 text-right font-mono font-bold text-zinc-700 dark:text-zinc-200">
                              ₹{mat.amount.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: GANTT CHART & CPM SCHEDULER */}
              <div className="lg:col-span-6 space-y-6">
                
                {/* TIMELINE SCHEDULER VIEW / GANTT TAB */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/80 p-6 rounded-2xl shadow-sm space-y-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <div className="space-y-0.5">
                      <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                        <Calendar className="w-4.5 h-4.5 text-indigo-500" />
                        Gantt Schedule (CPM Network)
                      </h3>
                      <p className="text-[10px] text-zinc-400">Critical path dependencies highlighted in red/orange.</p>
                    </div>

                    <div className="flex bg-zinc-100 dark:bg-zinc-850 p-0.5 rounded-lg border border-zinc-200/40">
                      <button
                        onClick={() => setActiveGanttTab('chart')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition ${activeGanttTab === 'chart' ? 'bg-white dark:bg-zinc-900 text-indigo-500 shadow-sm' : 'text-zinc-450 dark:text-zinc-400'}`}
                      >
                        Gantt Chart
                      </button>
                      <button
                        onClick={() => setActiveGanttTab('table')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition ${activeGanttTab === 'table' ? 'bg-white dark:bg-zinc-900 text-indigo-500 shadow-sm' : 'text-zinc-450 dark:text-zinc-400'}`}
                      >
                        Phases Table
                      </button>
                    </div>
                  </div>

                  {activeGanttTab === 'chart' ? (
                    /* SVG GANTT CHART RENDERING */
                    <div className="relative pt-2">
                      <div className="overflow-x-auto pr-1">
                        <svg 
                          width="100%" 
                          height={TIMELINE_PHASES.length * 28 + 40}
                          viewBox={`0 0 600 ${TIMELINE_PHASES.length * 28 + 40}`} 
                          className="min-w-[500px]"
                        >
                          {/* Grid Columns representing months */}
                          {Array.from({ length: 6 }).map((_, idx) => {
                            const monthX = 140 + idx * 85;
                            return (
                              <g key={idx}>
                                <line 
                                  x1={monthX} 
                                  y1="25" 
                                  x2={monthX} 
                                  y2={TIMELINE_PHASES.length * 28 + 25} 
                                  stroke="rgba(226, 232, 240, 0.4)" 
                                  strokeDasharray="2,2" 
                                />
                                <text 
                                  x={monthX + 4} 
                                  y="15" 
                                  fill="#94a3b8" 
                                  fontSize="9" 
                                  fontWeight="bold" 
                                  className="font-mono"
                                >
                                  M{idx + 1}
                                </text>
                              </g>
                            );
                          })}

                          {/* Phase row render */}
                          {TIMELINE_PHASES.map((phase, idx) => {
                            const cpm = cpmResults[phase.id];
                            if (!cpm) return null;

                            const isCritical = criticalPathIds.includes(phase.id);
                            
                            // Scale days to fit inside width 440px
                            // Assume maximum day size of ~300 days maps to 440px width (factor = 440 / totalProjectDays)
                            const scaleFactor = totalProjectDays > 0 ? 440 / totalProjectDays : 1.5;
                            const x1 = 140 + cpm.startDay * scaleFactor;
                            const w = Math.max(8, cpm.durationDays * scaleFactor);
                            const yPos = 25 + idx * 28;

                            const isHovered = hoveredPhase === phase.id;

                            return (
                              <g 
                                key={phase.id}
                                onMouseEnter={() => setHoveredPhase(phase.id)}
                                onMouseLeave={() => setHoveredPhase(null)}
                                className="cursor-help transition"
                              >
                                {/* Row Hover Background */}
                                <rect 
                                  x="0" 
                                  y={yPos - 4} 
                                  width="600" 
                                  height="26" 
                                  fill={isHovered ? "rgba(79, 70, 229, 0.04)" : "transparent"} 
                                  rx="4" 
                                />

                                {/* Label */}
                                <text 
                                  x="5" 
                                  y={yPos + 12} 
                                  fill={isHovered ? "#4f46e5" : "#475569"} 
                                  fontSize="9" 
                                  fontWeight={isHovered || isCritical ? "bold" : "normal"}
                                >
                                  {phase.name}
                                </text>

                                {/* Duration Bar */}
                                <rect 
                                  x={x1} 
                                  y={yPos} 
                                  width={w} 
                                  height="14" 
                                  rx="4" 
                                  fill={isCritical ? "url(#criticalGrad)" : "url(#standardGrad)"} 
                                  stroke={isCritical ? "#ea580c" : "#6366f1"}
                                  strokeWidth="0.5"
                                  className="transition-all duration-300"
                                />

                                {/* Floating info indicator */}
                                {isHovered && (
                                  <g>
                                    <rect 
                                      x={x1 + w/2 - 40} 
                                      y={yPos - 22} 
                                      width="88" 
                                      height="18" 
                                      rx="3" 
                                      fill="#1e293b" 
                                      opacity="0.95"
                                    />
                                    <text 
                                      x={x1 + w/2} 
                                      y={yPos - 10} 
                                      fill="#ffffff" 
                                      fontSize="8" 
                                      fontWeight="bold" 
                                      textAnchor="middle"
                                      className="font-mono"
                                    >
                                      Day {cpm.startDay}-{cpm.endDay} ({cpm.durationDays}d)
                                    </text>
                                  </g>
                                )}
                              </g>
                            );
                          })}

                          {/* SVG Gradients definitions */}
                          <defs>
                            <linearGradient id="criticalGrad" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#f97316" />
                              <stop offset="100%" stopColor="#ea580c" />
                            </linearGradient>
                            <linearGradient id="standardGrad" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#818cf8" />
                              <stop offset="100%" stopColor="#4f46e5" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                    </div>
                  ) : (
                    /* PHASE TABLE VIEW */
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-zinc-150 dark:border-zinc-800 text-zinc-400 font-bold">
                            <th className="py-2">Phase Name</th>
                            <th className="py-2">Timeline Days</th>
                            <th className="py-2 text-center">Duration</th>
                            <th className="py-2 text-right">Critical Path</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-semibold text-zinc-650 dark:text-zinc-300">
                          {TIMELINE_PHASES.map(phase => {
                            const cpm = cpmResults[phase.id];
                            if (!cpm) return null;
                            const isCritical = criticalPathIds.includes(phase.id);
                            return (
                              <tr key={phase.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-850/40">
                                <td className="py-2.5 font-bold text-zinc-700 dark:text-zinc-250">{phase.name}</td>
                                <td className="py-2.5 font-mono text-[11px]">Day {cpm.startDay} - {cpm.endDay}</td>
                                <td className="py-2.5 text-center font-mono">{cpm.durationDays} Days</td>
                                <td className="py-2.5 text-right font-bold">
                                  {isCritical ? (
                                    <span className="text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full text-[9px]">Critical</span>
                                  ) : (
                                    <span className="text-zinc-400">Flexible</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* ADVANCED OVERRIDES PANEL (ACCORDION) */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/80 p-5 rounded-2xl shadow-sm">
                  <details className="group space-y-4">
                    <summary className="flex justify-between items-center font-bold text-sm text-zinc-800 dark:text-zinc-250 cursor-pointer list-none select-none">
                      <div className="flex items-center gap-1.5">
                        <Settings className="w-4.5 h-4.5 text-indigo-500 group-open:rotate-90 transition-transform" />
                        <span>Advanced Estimator Controls & Multipliers</span>
                      </div>
                      <span className="text-xs text-indigo-500 font-bold group-open:hidden">Show Options</span>
                      <span className="text-xs text-indigo-500 font-bold hidden group-open:inline">Hide</span>
                    </summary>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-850">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 mb-1">
                          Custom Cost Base Override (₹ / sq.ft)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 1850"
                          value={customCostPerSqFt}
                          onChange={(e) => setCustomCostPerSqFt(e.target.value)}
                          className="saas-input py-1.5 px-2 text-xs font-mono font-semibold"
                        />
                        <p className="text-[9px] text-zinc-400 mt-1">If set, overrides standard components 5-13.</p>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 mb-1">
                          Custom Location Multiplier Override
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="e.g. 1.15"
                          value={customLocationMultiplier}
                          onChange={(e) => setCustomLocationMultiplier(e.target.value)}
                          className="saas-input py-1.5 px-2 text-xs font-mono font-semibold"
                        />
                        <p className="text-[9px] text-zinc-400 mt-1">Overrides default database multipliers.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[9px] font-bold text-zinc-400 dark:text-zinc-500 mb-1">Contingency %</label>
                        <input
                          type="number"
                          value={customContingency}
                          onChange={(e) => setCustomContingency(Math.max(0, parseInt(e.target.value) || 0))}
                          className="saas-input py-1.5 text-xs text-center font-mono font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-zinc-400 dark:text-zinc-500 mb-1">Contractor Overhead %</label>
                        <input
                          type="number"
                          value={customOverhead}
                          onChange={(e) => setCustomOverhead(Math.max(0, parseInt(e.target.value) || 0))}
                          className="saas-input py-1.5 text-xs text-center font-mono font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-zinc-400 dark:text-zinc-500 mb-1">Inflation/Escalation %</label>
                        <input
                          type="number"
                          value={customInflation}
                          onChange={(e) => setCustomInflation(Math.max(0, parseInt(e.target.value) || 0))}
                          className="saas-input py-1.5 text-xs text-center font-mono font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-zinc-400 dark:text-zinc-500 mb-1">Professional Fee %</label>
                        <input
                          type="number"
                          value={customProfessionalFee}
                          onChange={(e) => setCustomProfessionalFee(Math.max(0, parseInt(e.target.value) || 0))}
                          className="saas-input py-1.5 text-xs text-center font-mono font-semibold"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 bg-zinc-50 dark:bg-zinc-850/50 p-3 rounded-xl border border-zinc-150 dark:border-zinc-800">
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">Include GST Taxes (18%)?</span>
                        <p className="text-[9px] text-zinc-400">Toggles GST addition to construction materials and contracting works.</p>
                      </div>
                      <button
                        onClick={() => setCustomGST(!customGST)}
                        className={`p-1 px-3 rounded-lg text-xs font-bold border transition ${
                          customGST 
                            ? 'bg-indigo-500/10 border-indigo-500 text-indigo-500' 
                            : 'border-zinc-250 dark:border-zinc-800 text-zinc-400'
                        }`}
                      >
                        {customGST ? 'Yes (18%)' : 'No Tax'}
                      </button>
                    </div>

                    {/* Labor rates settings */}
                    <div className="space-y-2.5 border-t border-zinc-100 dark:border-zinc-850 pt-3">
                      <span className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                        Daily Labour wages (₹ / day)
                      </span>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.keys(laborRates).map(role => (
                          <div key={role}>
                            <label className="block text-[9px] text-zinc-500 capitalize font-bold mb-1">{role} wage</label>
                            <input
                              type="number"
                              value={laborRates[role as keyof typeof laborRates]}
                              onChange={(e) => {
                                setLaborRates({
                                  ...laborRates,
                                  [role]: Math.max(0, parseInt(e.target.value) || 0)
                                });
                              }}
                              className="saas-input py-1 text-center font-mono text-xs font-bold"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </details>
                </div>

                {/* ASSUMPTIONS & DISCLAIMER CARD */}
                <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/80 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 border-b border-zinc-200/50 dark:border-zinc-800 pb-2">
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                    <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-250 uppercase tracking-wider">
                      Assumptions & Cost Disclaimers
                    </h4>
                  </div>
                  <ul className="list-disc pl-4 space-y-2 text-[10px] text-zinc-500 dark:text-zinc-450 leading-relaxed font-semibold">
                    <li><strong>Estimates are Indicative:</strong> Actual construction parameters fluctuate based on ground site challenges, specific materials supply lines and local vendor quotation margins.</li>
                    <li><strong>Timeline Variables:</strong> Heavy monsoon seasons, regulatory approval bottlenecks, structural plan tweaks or logistics constraints can significantly delay final handover schedules.</li>
                    <li><strong>Materials Quantities:</strong> Quantities calculated above represent statistical thumb rules for typical RCC layouts in India and may differ from standard structural designs.</li>
                    <li><strong>BOQ Drafting:</strong> Use this tool to set initial feasibility plans. Final construction estimates should be prepared by a registered civil surveyor or architect.</li>
                  </ul>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>

      {/* TREND GRAPH */}
      <MaterialTrendGraph 
        allowedMaterials={['constructionCost']} 
        defaultMaterial="constructionCost" 
        title="Residential Construction Cost Index Trends (India Tier-1/2)" 
      />

      {/* ================================================== */}
      {/* SEO & FAQ ACCORDION SECTION */}
      {/* ================================================== */}
      <section className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/80 p-6 md:p-8 rounded-2xl shadow-sm space-y-6">
        <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <h2 className="text-xl font-bold text-zinc-800 dark:text-white">
            Understanding Construction Costs & Planning Timelines
          </h2>
          <p className="text-xs text-zinc-450 mt-1">
            Learn how quantities, materials, location factors, and Critical Path sequencing determine structural budgets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-zinc-650 dark:text-zinc-350 leading-relaxed">
          <div className="space-y-4">
            <h3 className="font-bold text-zinc-800 dark:text-zinc-250 text-sm">How is Construction Cost calculated?</h3>
            <p>
              Professional estimators use a component-based model. Instead of multiplying total square footage by a generic flat rate, they divide works into categories such as site excavation, structural concrete, masonry, doors/windows, electrical rough-ins, plastering, and finishes. This allows for location multipliers, quality grade variables, and design complexity multipliers.
            </p>
            <p>
              For instance, foundations on black cotton clay soil or sloped terrains require concrete retaining walls, significantly increasing excavation costs relative to flat rocky sites.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-zinc-800 dark:text-zinc-250 text-sm">What is the Critical Path in scheduling?</h3>
            <p>
              In project scheduling, the Critical Path is the sequence of dependent activities that determines the shortest possible duration to complete a building project. Delaying any task on the critical path (such as structural frame casting, curing, or waterproofing) directly pushes back the final handover date.
            </p>
            <p>
              Parallel tasks (like plumbing rough-ins and electrical conduits running simultaneously) do not affect the path unless one of them exceeds its calculated float time and stalls plastering.
            </p>
          </div>
        </div>

        {/* FAQs Accordion */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-850 space-y-3">
          <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-250 mb-3">Frequently Asked Questions (FAQ)</h3>
          
          {[
            {
              q: "How does building quality level affect component rates?",
              a: "Rates are grouped into Basic, Standard, Premium, and Luxury tiers. A Basic tier uses localized bricks, standard plaster, and economic ceramics. A Luxury tier incorporates premium grade aggregate concrete, solid teak wood veneered doors, Italian marble or hardwood flooring, smart automation, and designer sanitary fixtures, raising base rates by up to 2x."
            },
            {
              q: "How does the labor strength factor influence duration?",
              a: "The duration calculation utilizes a non-linear scaling algorithm. Lower crew sizes (less than estimated minimums) directly slow down active construction phases. Conversely, hiring excessive workers provides diminishing scheduling returns due to workspace crowding constraints."
            },
            {
              q: "Why is there a contingency budget included?",
              a: "Contingency budgets (typically 5% to 10%) act as a vital financial buffer against unpredicted site complications, material price escalations, regulatory approval additions, or plans modifications midway through building work."
            },
            {
              q: "How accurate is the material quantity estimator?",
              a: "The estimator uses architectural thumb rules (e.g., 0.42 bags of cement and 4.1 kg of steel per built-up square foot). While highly accurate for initial feasibility planning, actual quantities vary depending on specific structural layout designs and soil bearing capacity."
            }
          ].map((faq, index) => (
            <details key={index} className="group border border-zinc-150 dark:border-zinc-800 rounded-xl p-4 transition-all duration-200">
              <summary className="font-bold text-xs text-zinc-700 dark:text-zinc-300 hover:text-indigo-500 cursor-pointer list-none flex justify-between items-center select-none">
                <span>{faq.q}</span>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2.5 pl-1.5 border-l-2 border-indigo-500/40">
                {faq.a}
              </p>
            </details>
          ))}
        </div>

        {/* JSON-LD Schema markup for Google search optimization */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "How does building quality level affect component rates?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Rates are grouped into Basic, Standard, Premium, and Luxury tiers. Higher tiers incorporate premium materials, designer fittings, and custom architectural work, raising structural cost parameters proportionally."
                }
              },
              {
                "@type": "Question",
                "name": "How does the labor strength factor influence duration?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Crew sizes scale the duration of scheduling phases non-linearly. Lower counts delay milestones, while overstaffing has diminishing scheduling returns."
                }
              },
              {
                "@type": "Question",
                "name": "Why is there a contingency budget included?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "A contingency buffer (default 5% to 10%) mitigates risks from material price spikes, design changes, and unexpected excavation/foundation challenges."
                }
              }
            ]
          })}
        </script>
      </section>

    </div>
  );
}

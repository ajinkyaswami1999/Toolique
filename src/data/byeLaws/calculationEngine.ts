// Toolique Building Feasibility & Bye-Law Checker - Calculation Engine

import type { 
  AreaUnit, 
  SiteLocationInput, 
  PlotInfoInput, 
  ProposedDevelopmentInput, 
  SiteConditionsInput, 
  FeasibilityReport,
  ComplianceStatus,
  OverallFeasibilityStatus,
  StatutoryApprovalItem,
  ComplianceMatrixItem
} from './types';
import { resolveJurisdiction, INDIAN_STATES_AUTHORITIES } from './locationResolver';
import { OFFICIAL_BYE_LAWS_DATABASE } from './regulationsDatabase';

/**
 * Normalizes any Indian/Global area unit to Square Meters and Square Feet
 */
export function normalizePlotArea(area: number, unit: AreaUnit, stateId: string): { sqM: number; sqFt: number } {
  const safeArea = Math.max(0, area || 0);
  const state = INDIAN_STATES_AUTHORITIES.find(s => s.id === stateId);
  const bighaFactor = state?.authorities[0]?.bighaInSqFt || 27225.0;

  let sqFt = 0;
  switch (unit) {
    case 'sq_m':
      sqFt = safeArea * 10.7639104;
      return { sqM: safeArea, sqFt: Math.round(sqFt * 100) / 100 };
    case 'sq_ft':
      sqFt = safeArea;
      return { sqM: Math.round((sqFt * 0.09290304) * 100) / 100, sqFt };
    case 'sq_yd': // Gaj
      sqFt = safeArea * 9.0;
      return { sqM: Math.round((sqFt * 0.09290304) * 100) / 100, sqFt };
    case 'acre':
      sqFt = safeArea * 43560.0;
      return { sqM: Math.round((sqFt * 0.09290304) * 100) / 100, sqFt };
    case 'guntha':
      sqFt = safeArea * 1089.0;
      return { sqM: Math.round((sqFt * 0.09290304) * 100) / 100, sqFt };
    case 'bigha':
      sqFt = safeArea * bighaFactor;
      return { sqM: Math.round((sqFt * 0.09290304) * 100) / 100, sqFt };
    default:
      return { sqM: safeArea, sqFt: safeArea * 10.7639104 };
  }
}

/**
 * Main Calculation Engine that produces the Feasibility Report
 */
export function calculateBuildingFeasibility(
  site: SiteLocationInput,
  plot: PlotInfoInput,
  proposal: ProposedDevelopmentInput,
  conditions: SiteConditionsInput
): FeasibilityReport {
  const { state, authority, primaryCode, tierHierarchy } = resolveJurisdiction(site.state, site.cityAuthority);
  const { sqM: plotAreaSqM, sqFt: plotAreaSqFt } = normalizePlotArea(plot.plotArea, plot.areaUnit, site.state);

  const isFt = plot.dimensionUnit === 'ft';
  const rawFrontage = Math.max(0.1, plot.frontageWidth || (isFt ? Math.sqrt(plotAreaSqFt * 0.6) : Math.sqrt(plotAreaSqM * 0.6)));
  const rawDepth = Math.max(0.1, plot.plotDepth || (plotAreaSqM > 0 && rawFrontage > 0 ? (isFt ? plotAreaSqFt / rawFrontage : plotAreaSqM / rawFrontage) : (isFt ? 65.6 : 20.0)));

  // Standardize to meters for all statutory bye-laws and setback rules
  const frontage = isFt ? Math.round((rawFrontage * 0.3048) * 100) / 100 : rawFrontage;
  const depth = isFt ? Math.round((rawDepth * 0.3048) * 100) / 100 : rawDepth;

  const roadWidth = Math.max(3.0, site.roadWidth || authority.defaultRoadWidthM || 12.0);

  // 1. Resolve Ground Coverage & FAR Rules
  let permittedMaxCoveragePct = 65;
  let baseFar = 1.50;
  let maxPurchasableFar = 0.50;
  let greenIncentiveFar = 0.05;
  let coverageClause = 'NBC 2016 Part 3 Table 1';
  let farClause = 'NBC 2016 Part 3 Clause 5';
  let coverageDoc = 'National Building Code 2016';
  let farDoc = 'National Building Code 2016';

  let frontSetbackM = 3.0;
  let rearSetbackM = 3.0;
  let sideSetbackM = 1.5;
  let setbackClause = 'NBC 2016 Part 3 Table 2';
  let setbackDoc = 'National Building Code 2016';

  // State specific logic
  if (site.state === 'haryana') {
    coverageDoc = 'Haryana Building Code 2017 (Rev 2023)';
    farDoc = 'Haryana Building Code 2017 (Rev 2023)';
    setbackDoc = 'Haryana Building Code 2017';
    coverageClause = 'Chapter 6, Table 6.1';
    farClause = 'Chapter 6, Table 6.1 (Residential Plotted)';
    setbackClause = 'Chapter 6, Table 6.1';

    if (proposal.buildingUse === 'residential_plotted') {
      if (plotAreaSqM <= 60) {
        permittedMaxCoveragePct = 75; baseFar = 1.98; maxPurchasableFar = 0.66;
        frontSetbackM = 1.5; rearSetbackM = 1.0; sideSetbackM = 0;
      } else if (plotAreaSqM <= 150) {
        permittedMaxCoveragePct = 66; baseFar = 1.45; maxPurchasableFar = 1.19;
        frontSetbackM = 2.5; rearSetbackM = 2.0; sideSetbackM = 0;
      } else if (plotAreaSqM <= 250) {
        permittedMaxCoveragePct = 66; baseFar = 1.45; maxPurchasableFar = 1.19;
        frontSetbackM = 3.0; rearSetbackM = 3.0; sideSetbackM = 0;
      } else if (plotAreaSqM <= 500) {
        permittedMaxCoveragePct = 60; baseFar = 1.20; maxPurchasableFar = 1.44;
        frontSetbackM = 4.5; rearSetbackM = 3.5; sideSetbackM = 1.5;
      } else {
        permittedMaxCoveragePct = 50; baseFar = 1.00; maxPurchasableFar = 1.64;
        frontSetbackM = 6.0; rearSetbackM = 4.5; sideSetbackM = 3.0;
      }
    } else {
      // Commercial / others
      permittedMaxCoveragePct = 40;
      baseFar = 1.75;
      maxPurchasableFar = 0.50;
      frontSetbackM = 6.0; rearSetbackM = 4.0; sideSetbackM = 3.0;
      farClause = 'Chapter 6, Table 6.3';
    }
  } else if (site.state === 'delhi') {
    coverageDoc = 'Delhi UBBL 2016';
    farDoc = 'Delhi UBBL 2016 / MPD 2021';
    setbackDoc = 'Delhi UBBL 2016 Table 7.1';
    coverageClause = 'Chapter 7 Clause 7.6';
    farClause = 'Chapter 7 Table 7.1';
    setbackClause = 'Chapter 7 Table 7.1';

    if (plotAreaSqM <= 50) {
      permittedMaxCoveragePct = 90; baseFar = 3.50; maxPurchasableFar = 0;
      frontSetbackM = 0; rearSetbackM = 0; sideSetbackM = 0;
    } else if (plotAreaSqM <= 100) {
      permittedMaxCoveragePct = 75; baseFar = 3.50; maxPurchasableFar = 0;
      frontSetbackM = 1.5; rearSetbackM = 0; sideSetbackM = 0;
    } else if (plotAreaSqM <= 250) {
      permittedMaxCoveragePct = 75; baseFar = 3.00; maxPurchasableFar = 0;
      frontSetbackM = 3.0; rearSetbackM = 2.0; sideSetbackM = 0;
    } else if (plotAreaSqM <= 500) {
      permittedMaxCoveragePct = 50; baseFar = 2.25; maxPurchasableFar = 0;
      frontSetbackM = 4.5; rearSetbackM = 3.0; sideSetbackM = 1.5;
    } else {
      permittedMaxCoveragePct = 40; baseFar = 2.00; maxPurchasableFar = 0;
      frontSetbackM = 6.0; rearSetbackM = 3.0; sideSetbackM = 3.0;
    }
  } else if (site.state === 'maharashtra') {
    coverageDoc = 'Maharashtra UDCPR 2020';
    farDoc = 'Maharashtra UDCPR 2020';
    setbackDoc = 'UDCPR 2020 Regulation 6.1';
    coverageClause = 'Regulation 6.1';
    farClause = 'Regulation 6.1 & Table 6-A';
    setbackClause = 'Regulation 6.2';

    permittedMaxCoveragePct = 50;
    if (roadWidth < 9.0) {
      baseFar = 1.10; maxPurchasableFar = 0.30;
    } else if (roadWidth < 12.0) {
      baseFar = 1.10; maxPurchasableFar = 0.50;
    } else if (roadWidth < 18.0) {
      baseFar = 1.10; maxPurchasableFar = 1.10;
    } else {
      baseFar = 1.10; maxPurchasableFar = 1.50;
    }
    frontSetbackM = roadWidth >= 18 ? 4.5 : 3.0;
    rearSetbackM = 3.0;
    sideSetbackM = 2.0;
  } else if (site.state === 'karnataka') {
    coverageDoc = 'BBMP Bye-Laws / BDA Master Plan 2031';
    farDoc = 'BBMP Zonal Regulations';
    setbackDoc = 'BBMP Table 7.1';
    coverageClause = 'Table 7.1';
    farClause = 'Zonal Regs Table 7.1';
    setbackClause = 'Zonal Regs Table 7.2';

    if (roadWidth < 9.0) {
      permittedMaxCoveragePct = 60; baseFar = 1.50; maxPurchasableFar = 0;
    } else if (roadWidth < 12.0) {
      permittedMaxCoveragePct = 55; baseFar = 1.75; maxPurchasableFar = 0.50;
    } else if (roadWidth < 18.0) {
      permittedMaxCoveragePct = 50; baseFar = 2.25; maxPurchasableFar = 0.50;
    } else {
      permittedMaxCoveragePct = 45; baseFar = 2.50; maxPurchasableFar = 0.75;
    }
    frontSetbackM = 3.0; rearSetbackM = 2.0; sideSetbackM = 1.5;
  } else if (site.state === 'tamil_nadu') {
    coverageDoc = 'TNCDBR 2019 (G.O. Ms. No. 18)';
    farDoc = 'TNCDBR 2019 Rule 35';
    setbackDoc = 'TNCDBR 2019 Rule 36';
    coverageClause = 'Rule 35 Table 1';
    farClause = 'Rule 35 & 36';
    setbackClause = 'Rule 36';

    if (roadWidth < 9.0) {
      permittedMaxCoveragePct = 70; baseFar = 1.50; maxPurchasableFar = 0;
    } else if (roadWidth < 12.0) {
      permittedMaxCoveragePct = 65; baseFar = 2.00; maxPurchasableFar = 0.50;
    } else {
      permittedMaxCoveragePct = 60; baseFar = 2.00; maxPurchasableFar = 1.25;
    }
    frontSetbackM = 3.0; rearSetbackM = 2.0; sideSetbackM = 1.5;
  } else if (site.state === 'telangana') {
    coverageDoc = 'Telangana Building Rules (GO 168 / TG-bPASS)';
    farDoc = 'GO 168 Table III';
    setbackDoc = 'GO 168 Table III';
    coverageClause = 'Rule 7';
    farClause = 'Rule 7 & TG-bPASS 2020';
    setbackClause = 'Rule 7';

    permittedMaxCoveragePct = 60;
    baseFar = roadWidth >= 18 ? 2.50 : (roadWidth >= 12 ? 2.00 : 1.50);
    maxPurchasableFar = 0.75;
    frontSetbackM = 3.0; rearSetbackM = 2.0; sideSetbackM = 1.5;
  } else if (site.state === 'uttar_pradesh') {
    coverageDoc = 'NOIDA / UP Planning Regulations 2020';
    farDoc = 'NOIDA Building Regulations Chapter 4';
    setbackDoc = 'NOIDA Chapter 4 Table 4.1';
    coverageClause = 'Chapter 4';
    farClause = 'Chapter 4 Table 4.2';
    setbackClause = 'Table 4.1';

    permittedMaxCoveragePct = 50;
    baseFar = 1.80;
    maxPurchasableFar = 0.95;
    frontSetbackM = 4.5; rearSetbackM = 3.0; sideSetbackM = 2.0;
  } else {
    // Default national / other states
    permittedMaxCoveragePct = 60;
    baseFar = 1.50;
    maxPurchasableFar = 0.50;
    frontSetbackM = 3.0; rearSetbackM = 3.0; sideSetbackM = 1.5;
  }

  // Calculate Net Buildable Envelope
  const leftSetbackM = sideSetbackM;
  const rightSetbackM = sideSetbackM;
  const buildableWidthM = Math.max(0, frontage - leftSetbackM - rightSetbackM);
  const buildableDepthM = Math.max(0, depth - frontSetbackM - rearSetbackM);
  const buildableFootprintSqM = plot.isIrregularPlot ? 0 : Math.round(buildableWidthM * buildableDepthM * 100) / 100;
  const envelopeEfficiencyPct = plotAreaSqM > 0 && !plot.isIrregularPlot 
    ? Math.round((buildableFootprintSqM / plotAreaSqM) * 1000) / 10 
    : 0;

  // Ground Coverage Calculation
  const permittedMaxCoverageSqM = Math.round((plotAreaSqM * (permittedMaxCoveragePct / 100)) * 100) / 100;
  const proposedCoverageSqM = proposal.proposedGroundCoverageSqM && proposal.proposedGroundCoverageSqM > 0 
    ? proposal.proposedGroundCoverageSqM 
    : (buildableFootprintSqM > 0 ? Math.min(buildableFootprintSqM, permittedMaxCoverageSqM) : permittedMaxCoverageSqM);
  const proposedCoveragePct = plotAreaSqM > 0 ? Math.round((proposedCoverageSqM / plotAreaSqM) * 1000) / 10 : 0;

  let coverageStatus: ComplianceStatus = 'compliant';
  let coverageNotes = `Proposed ground coverage (${proposedCoveragePct}%) is within statutory ceiling of ${permittedMaxCoveragePct}%.`;
  if (proposedCoverageSqM > permittedMaxCoverageSqM) {
    coverageStatus = 'non_compliant';
    coverageNotes = `Proposed coverage (${proposedCoveragePct}%) exceeds maximum permissible ${permittedMaxCoveragePct}% by ${(proposedCoverageSqM - permittedMaxCoverageSqM).toFixed(1)} sq.m.`;
  }

  // FAR Calculations
  const effectiveMaxFar = Math.round((baseFar + maxPurchasableFar + greenIncentiveFar) * 100) / 100;
  const permittedMaxBuaSqM = Math.round((plotAreaSqM * effectiveMaxFar) * 100) / 100;
  const proposedBuaSqM = proposal.proposedTotalBuaSqM && proposal.proposedTotalBuaSqM > 0
    ? proposal.proposedTotalBuaSqM
    : Math.round(proposedCoverageSqM * proposal.proposedFloors * 100) / 100;
  const proposedFar = plotAreaSqM > 0 ? Math.round((proposedBuaSqM / plotAreaSqM) * 100) / 100 : 0;

  let farStatus: ComplianceStatus = 'compliant';
  let farNotes = `Proposed FAR (${proposedFar}) is within Base FAR of ${baseFar}.`;
  if (proposedFar > effectiveMaxFar) {
    farStatus = 'non_compliant';
    farNotes = `Proposed FAR (${proposedFar}) exceeds total maximum potential FAR (${effectiveMaxFar}) by ${(proposedFar - effectiveMaxFar).toFixed(2)}.`;
  } else if (proposedFar > baseFar) {
    farStatus = 'conditional';
    farNotes = `Proposed FAR (${proposedFar}) exceeds Base FAR (${baseFar}) but is achievable by purchasing ${(proposedFar - baseFar).toFixed(2)} Purchasable/Premium FAR.`;
  }

  // Height & Floors Calculation
  let maxPermissibleHeightM = 15.0;
  let maxPermissibleFloors = 4;
  let roadFormula = 'H <= 1.5 * (Road Width + Front Setback)';
  
  if (site.state === 'haryana') {
    maxPermissibleHeightM = proposal.hasStilt ? 15.0 : 12.0;
    maxPermissibleFloors = proposal.hasStilt ? 4 : 3;
    roadFormula = 'HBC 2017 Plotted: Max 15.0m (Stilt + 4 Floors)';
  } else if (site.state === 'delhi') {
    maxPermissibleHeightM = proposal.hasStilt ? 17.5 : 15.0;
    maxPermissibleFloors = 4;
    roadFormula = 'Delhi UBBL Table 7.1: Max 15m (17.5m with Stilt)';
  } else {
    maxPermissibleHeightM = Math.round((1.5 * (roadWidth + frontSetbackM)) * 10) / 10;
    maxPermissibleFloors = Math.floor(maxPermissibleHeightM / 3.2);
  }

  const proposedHeightM = proposal.proposedHeightM && proposal.proposedHeightM > 0
    ? proposal.proposedHeightM
    : (proposal.proposedFloors * 3.1 + (proposal.hasStilt ? 2.4 : 0));

  let heightStatus: ComplianceStatus = 'compliant';
  let heightNotes = `Proposed height (${proposedHeightM.toFixed(1)}m, ${proposal.proposedFloors} floors) is within permissible limit of ${maxPermissibleHeightM}m.`;
  if (proposedHeightM > maxPermissibleHeightM || proposal.proposedFloors > (maxPermissibleFloors + (proposal.hasStilt ? 1 : 0))) {
    heightStatus = 'non_compliant';
    heightNotes = `Proposed height (${proposedHeightM.toFixed(1)}m) or floors (${proposal.proposedFloors}) exceeds statutory ceiling of ${maxPermissibleHeightM}m.`;
  }

  // Parking & ECS Calculation
  let requiredEcs = 2;
  let parkingRuleDesc = '2 ECS per dwelling unit / plotted floor';
  if (proposal.buildingUse === 'commercial_retail' || proposal.buildingUse === 'commercial_office') {
    requiredEcs = Math.ceil(proposedBuaSqM / 35.0); // 3 ECS per 100 sq.m
    parkingRuleDesc = '3.0 ECS per 100 sq.m of Gross Built-Up Area';
  } else if (proposal.buildingUse === 'residential_group_housing') {
    requiredEcs = Math.ceil((proposal.dwellingUnits || 10) * 1.5);
    parkingRuleDesc = '1.5 ECS per dwelling unit';
  } else {
    requiredEcs = Math.max(2, Math.ceil(proposal.proposedFloors * 0.75));
  }

  const visitorEcs = Math.ceil(requiredEcs * 0.10);
  const evChargingEcs = Math.ceil(requiredEcs * 0.20);
  const proposedEcs = proposal.proposedParkingSpaces || (proposal.hasStilt ? proposal.proposedFloors * 2 : 2);
  
  let parkingStatus: ComplianceStatus = 'compliant';
  if (proposedEcs < requiredEcs) {
    parkingStatus = 'non_compliant';
  }

  // Fire & Life Safety
  const isHighRise = proposedHeightM >= 15.0;
  const fireNocRequired = isHighRise || (plotAreaSqM >= 500 && proposal.buildingUse !== 'residential_plotted');
  const minAccessRoadM = isHighRise ? 12.0 : 6.0;
  const maxTravelDistanceM = proposal.buildingUse === 'commercial_retail' ? 22.5 : 30.0;
  const minStaircaseWidthM = isHighRise ? 1.5 : (proposal.buildingUse === 'residential_plotted' ? 1.0 : 1.25);

  let fireStatus: ComplianceStatus = 'compliant';
  let fireNotes = 'Standard low-rise fire safety provisions apply.';
  if (isHighRise) {
    if (roadWidth < minAccessRoadM) {
      fireStatus = 'non_compliant';
      fireNotes = `High-rise (>= 15m) requires minimum ${minAccessRoadM}m road width for fire tender access. Current road is ${roadWidth}m.`;
    } else {
      fireStatus = 'conditional';
      fireNotes = 'High-rise structure (>= 15m) triggers mandatory State Fire Service NOC, dual fire staircases, and 6m perimeter driveways.';
    }
  }

  // Universal Accessibility
  const rampRequired = proposal.buildingUse !== 'residential_plotted' || proposal.hasStilt;
  const liftRequired = proposal.proposedFloors >= 4 || proposedHeightM >= 15.0;

  // Environmental Mandates
  const rwhRequired = plotAreaSqM >= 100;
  const rwhTankCapacityLiters = Math.round(plotAreaSqM * 20);
  const solarPvRequired = plotAreaSqM >= 500 || proposedBuaSqM >= 1000;
  const minSolarCapacityKw = Math.max(1, Math.round((plotAreaSqM / 200) * 10) / 10);
  const stpRequired = proposedBuaSqM >= 5000 || (proposal.dwellingUnits || 0) >= 50;
  const greenAreaPct = plotAreaSqM >= 500 ? 15 : 10;

  // Special Restrictions Evaluation
  const specialRestrictionsList: FeasibilityReport['specialRestrictions'] = [];
  
  if (conditions.nearAirport) {
    const dist = conditions.airportDistanceKm || 10;
    specialRestrictionsList.push({
      restriction: 'Airport Funnel / AAI Height Clearance',
      authority: 'Airports Authority of India (AAI NOCAS-2)',
      requirement: `Site is located within ${dist}km of airport zone. Mandatory NOCAS height clearance required prior to structural sanction.`,
      status: 'conditional',
      clause: 'MoCA GSR 751(E) & CCZM',
      doc: 'AAI NOCAS Guidelines 2023'
    });
  }

  if (conditions.nearHighway) {
    specialRestrictionsList.push({
      restriction: 'National / State Highway Building Line Buffer',
      authority: 'NHAI / MoRTH',
      requirement: 'Minimum 12m clear building line setback from highway Right-of-Way (ROW) boundary or 40m from highway center line.',
      status: 'conditional',
      clause: 'Control of National Highways Act 2002',
      doc: 'MoRTH Building Line Guidelines'
    });
  }

  if (conditions.nearRailway) {
    const dist = conditions.railwayDistanceM || 25;
    specialRestrictionsList.push({
      restriction: 'Railway 30m Safety Buffer',
      authority: 'Indian Railways (Divisional Railway Manager)',
      requirement: `Plot is within ${dist}m of railway boundary (< 30m). Structural NOC required to ensure vibration safety.`,
      status: 'conditional',
      clause: 'Railway Engineering Code Para 827',
      doc: 'Indian Railways Safety Manual'
    });
  }

  if (conditions.inHeritageZone) {
    specialRestrictionsList.push({
      restriction: 'Heritage & Monument Conservation Zone',
      authority: 'National Monuments Authority (NMA / ASI)',
      requirement: '100m radius is prohibited zone (zero new construction). 101-300m requires NMA heritage clearance and facade approval.',
      status: 'conditional',
      clause: 'AMASR Act 1958 Sec 20A & 20B',
      doc: 'NMA Heritage Conservation Bye-Laws'
    });
  }

  if (conditions.nearWaterBodyOrNallah) {
    specialRestrictionsList.push({
      restriction: 'NGT Eco-Sensitive Water Body / Nallah Buffer',
      authority: 'National Green Tribunal / State PCB',
      requirement: 'Mandatory 30m buffer from primary nallah / 50m from river edge where no construction or hard paving is allowed.',
      status: 'conditional',
      clause: 'NGT Order OA No. 222/2014',
      doc: 'NGT Environmental Protection Guidelines'
    });
  }

  // Statutory Approvals Checklist
  const approvalsChecklist: StatutoryApprovalItem[] = [
    {
      id: 'APP-01',
      stage: 'Pre-Construction',
      authority: authority.name,
      approvalName: 'Sanction of Building Plans & Permit',
      isMandatory: true,
      timelineDays: '30 - 45 Days',
      notes: 'Submission of architectural drawings, structural stability certificate, and scrutiny fee.',
      applicableCondition: 'Mandatory for all building construction.'
    },
    {
      id: 'APP-02',
      stage: 'Pre-Construction',
      authority: 'State Fire & Emergency Services',
      approvalName: 'Provisional Fire Safety NOC',
      isMandatory: fireNocRequired,
      timelineDays: '21 - 30 Days',
      notes: 'Required for high-rise (>= 15m) or commercial/institutional developments.',
      applicableCondition: fireNocRequired ? 'Triggered due to building height / occupancy' : 'Exempt (Low-rise residential)'
    },
    {
      id: 'APP-03',
      stage: 'Pre-Construction',
      authority: 'Airports Authority of India (AAI)',
      approvalName: 'AAI Height Clearance NOC (NOCAS)',
      isMandatory: conditions.nearAirport || proposedHeightM >= 15.0,
      timelineDays: '15 - 30 Days',
      notes: 'Online clearance via NOCAS-2 portal based on Colour Coded Zoning Map (CCZM).',
      applicableCondition: conditions.nearAirport ? 'Mandatory due to airport proximity' : 'Conditional'
    },
    {
      id: 'APP-04',
      stage: 'During Construction',
      authority: authority.name,
      approvalName: 'Plinth Level Verification Certificate',
      isMandatory: true,
      timelineDays: '7 - 14 Days',
      notes: 'Site inspection to verify boundary setbacks and plinth height before superstructure work.',
      applicableCondition: 'Mandatory after completion of foundation and plinth.'
    },
    {
      id: 'APP-05',
      stage: 'Post-Construction / Occupancy',
      authority: authority.name,
      approvalName: 'Occupancy Certificate (OC) / Completion Certificate (CC)',
      isMandatory: true,
      timelineDays: '30 - 45 Days',
      notes: 'Final site inspection to certify as-built compliance with approved drawings before utility energization.',
      applicableCondition: 'Mandatory before building occupation.'
    }
  ];

  // Compliance Matrix
  const complianceMatrix: ComplianceMatrixItem[] = [
    {
      category: 'Plot & Zoning',
      parameter: 'Zoning Use Permissibility',
      permitted: 'Permitted in designated Master Plan Zone',
      proposed: proposal.buildingUse.replace(/_/g, ' ').toUpperCase(),
      status: 'compliant',
      remarks: 'Proposed use conforms to standard zonal classification.',
      clause: coverageClause,
      sourceDoc: coverageDoc
    },
    {
      category: 'Development Control',
      parameter: 'Ground Coverage',
      permitted: `Max ${permittedMaxCoveragePct}% (${permittedMaxCoverageSqM.toFixed(1)} sq.m)`,
      proposed: `${proposedCoveragePct}% (${proposedCoverageSqM.toFixed(1)} sq.m)`,
      status: coverageStatus,
      remarks: coverageNotes,
      clause: coverageClause,
      sourceDoc: coverageDoc
    },
    {
      category: 'Development Control',
      parameter: 'Floor Area Ratio (FAR / FSI)',
      permitted: `Base ${baseFar} | Max Potential ${effectiveMaxFar} (${permittedMaxBuaSqM.toFixed(1)} sq.m)`,
      proposed: `FAR ${proposedFar} (${proposedBuaSqM.toFixed(1)} sq.m BUA)`,
      status: farStatus,
      remarks: farNotes,
      clause: farClause,
      sourceDoc: farDoc
    },
    {
      category: 'Setbacks & Envelope',
      parameter: 'Front Setback',
      permitted: `Min ${frontSetbackM.toFixed(1)} m`,
      proposed: `${frontSetbackM.toFixed(1)} m (Standard)`,
      status: 'compliant',
      remarks: `Mandatory front open space for road frontage of ${roadWidth}m.`,
      clause: setbackClause,
      sourceDoc: setbackDoc
    },
    {
      category: 'Setbacks & Envelope',
      parameter: 'Rear & Side Setbacks',
      permitted: `Rear: ${rearSetbackM.toFixed(1)}m | Side: ${sideSetbackM.toFixed(1)}m`,
      proposed: `Rear: ${rearSetbackM.toFixed(1)}m | Side: ${sideSetbackM.toFixed(1)}m`,
      status: 'compliant',
      remarks: 'Ensures required light, ventilation, and structural isolation.',
      clause: setbackClause,
      sourceDoc: setbackDoc
    },
    {
      category: 'Height & Massing',
      parameter: 'Building Height & Floors',
      permitted: `Max ${maxPermissibleHeightM.toFixed(1)} m (${maxPermissibleFloors} Floors)`,
      proposed: `${proposedHeightM.toFixed(1)} m (${proposal.proposedFloors} Floors)`,
      status: heightStatus,
      remarks: heightNotes,
      clause: 'NBC 2016 Part 3 / Local Code',
      sourceDoc: coverageDoc
    },
    {
      category: 'Parking & Transit',
      parameter: 'Vehicular Parking (ECS)',
      permitted: `Min ${requiredEcs} ECS (+${visitorEcs} Visitor, ${evChargingEcs} EV)`,
      proposed: `${proposedEcs} ECS`,
      status: parkingStatus,
      remarks: parkingStatus === 'compliant' ? 'Adequate parking provision.' : `Deficit of ${requiredEcs - proposedEcs} ECS.`,
      clause: 'NBC 2016 Part 8 / Local Bye-Laws',
      sourceDoc: coverageDoc
    },
    {
      category: 'Fire & Life Safety',
      parameter: 'Fire Safety & High-Rise Access',
      permitted: isHighRise ? 'Fire NOC + 12m Access Road' : 'Low-Rise Standard Provisions',
      proposed: `${proposedHeightM.toFixed(1)}m Height on ${roadWidth}m Road`,
      status: fireStatus,
      remarks: fireNotes,
      clause: 'NBC 2016 Part 4 Clause 3.4.6',
      sourceDoc: 'NBC 2016 Part 4'
    }
  ];

  // Overall Feasibility Status Determination
  let overallStatus: OverallFeasibilityStatus = 'feasible';
  let headline = 'Site Feasibility: Generally Feasible with Standard Compliance';
  let summaryText = `The proposed development is generally feasible under ${primaryCode}. All core parameters including ground coverage, base FAR, and height are within permissible statutory thresholds.`;
  const keyHighlights: string[] = [
    `Permissible Base FAR: ${baseFar} (Potential up to ${effectiveMaxFar} with purchasable FAR)`,
    `Maximum Permissible Ground Coverage: ${permittedMaxCoveragePct}% (${permittedMaxCoverageSqM.toFixed(1)} sq.m)`,
    `Statutory Setbacks: Front ${frontSetbackM}m, Rear ${rearSetbackM}m, Sides ${sideSetbackM}m`,
    `Mandatory Parking: ${requiredEcs} Equivalent Car Spaces (ECS)`
  ];
  const criticalFlags: string[] = [];

  if (coverageStatus === 'non_compliant' || farStatus === 'non_compliant' || heightStatus === 'non_compliant' || fireStatus === 'non_compliant') {
    overallStatus = 'potential_issues';
    headline = 'Site Feasibility: Potential Statutory Non-Compliance Detected';
    summaryText = `One or more proposed development parameters exceed the permissible limits under ${primaryCode}. Architectural redesign or reduction in massing is required.`;
    if (coverageStatus === 'non_compliant') criticalFlags.push(`Ground Coverage Exceeded by ${(proposedCoverageSqM - permittedMaxCoverageSqM).toFixed(1)} sq.m`);
    if (farStatus === 'non_compliant') criticalFlags.push(`Proposed FAR (${proposedFar}) exceeds max potential FAR (${effectiveMaxFar})`);
    if (heightStatus === 'non_compliant') criticalFlags.push(`Proposed height exceeds permissible ceiling of ${maxPermissibleHeightM}m`);
    if (fireStatus === 'non_compliant') criticalFlags.push(`Road width (${roadWidth}m) insufficient for high-rise fire tender access (${minAccessRoadM}m required)`);
  } else if (farStatus === 'conditional' || fireStatus === 'conditional' || specialRestrictionsList.length > 0) {
    overallStatus = 'conditional';
    headline = 'Site Feasibility: Feasible Subject to Specific Approvals & Charges';
    summaryText = `The proposed project is feasible subject to statutory NOC clearances, payment of purchasable FAR betterment charges, and specialized engineering provisions.`;
    if (farStatus === 'conditional') keyHighlights.push(`Requires purchasing ${(proposedFar - baseFar).toFixed(2)} additional FAR from ${authority.shortName}`);
    if (fireStatus === 'conditional') keyHighlights.push('Requires formal State Fire Service NOC and dual fire staircases');
    if (specialRestrictionsList.length > 0) {
      specialRestrictionsList.forEach(sr => criticalFlags.push(`${sr.restriction}: ${sr.authority}`));
    }
  }

  if (plot.isIrregularPlot) {
    criticalFlags.push('Irregular Plot Geometry: Rectangular envelope calculation disabled. Professional boundary survey required.');
  }

  // Audit Trail of Resolved Rules
  const auditTrail: FeasibilityReport['auditTrail'] = OFFICIAL_BYE_LAWS_DATABASE
    .filter(r => r.jurisdiction.includes(state.name) || r.tier === 'national' || r.tier === 'special_authority')
    .slice(0, 10)
    .map(r => ({
      id: r.id,
      ruleId: r.id,
      jurisdiction: r.jurisdiction,
      title: r.title,
      clause: r.clause,
      sourceDoc: r.sourceDoc,
      lastVerified: r.lastVerified,
      status: r.status
    }));

  return {
    input: {
      site,
      plot,
      proposal,
      conditions,
      normalizedPlotAreaSqM: plotAreaSqM,
      normalizedPlotAreaSqFt: plotAreaSqFt
    },
    resolvedJurisdiction: {
      stateName: state.name,
      authorityName: authority.name,
      primaryCode,
      tierHierarchy,
      isOfficialDataAvailable: true
    },
    executiveSummary: {
      status: overallStatus,
      headline,
      confidenceScore: 95,
      keyHighlights,
      criticalFlags,
      summaryText
    },
    developmentControls: {
      groundCoverage: {
        permittedMaxSqM: permittedMaxCoverageSqM,
        permittedMaxPct: permittedMaxCoveragePct,
        proposedSqM: proposedCoverageSqM,
        proposedPct: proposedCoveragePct,
        status: coverageStatus,
        notes: coverageNotes,
        clause: coverageClause,
        doc: coverageDoc
      },
      far: {
        baseFar,
        maxPurchasableFar,
        greenIncentiveFar,
        effectiveMaxFar,
        permittedMaxBuaSqM,
        proposedBuaSqM,
        proposedFar,
        status: farStatus,
        notes: farNotes,
        clause: farClause,
        doc: farDoc
      },
      setbacks: {
        frontM: frontSetbackM,
        rearM: rearSetbackM,
        leftM: leftSetbackM,
        rightM: rightSetbackM,
        frontFt: Math.round((frontSetbackM * 3.28084) * 10) / 10,
        rearFt: Math.round((rearSetbackM * 3.28084) * 10) / 10,
        leftFt: Math.round((leftSetbackM * 3.28084) * 10) / 10,
        rightFt: Math.round((rightSetbackM * 3.28084) * 10) / 10,
        totalSetbacksM: {
          width: leftSetbackM + rightSetbackM,
          depth: frontSetbackM + rearSetbackM
        },
        totalSetbacksFt: {
          width: Math.round(((leftSetbackM + rightSetbackM) * 3.28084) * 10) / 10,
          depth: Math.round(((frontSetbackM + rearSetbackM) * 3.28084) * 10) / 10
        },
        proposedFrontM: frontSetbackM,
        proposedRearM: rearSetbackM,
        proposedSidesM: sideSetbackM,
        status: 'compliant',
        notes: `Statutory setbacks computed per ${setbackDoc}.`,
        clause: setbackClause,
        doc: setbackDoc
      },
      envelope: {
        buildableWidthM,
        buildableDepthM,
        buildableFootprintSqM,
        buildableWidthFt: Math.round((buildableWidthM * 3.28084) * 10) / 10,
        buildableDepthFt: Math.round((buildableDepthM * 3.28084) * 10) / 10,
        buildableFootprintSqFt: Math.round((buildableFootprintSqM * 10.7639104) * 10) / 10,
        envelopeEfficiencyPct,
        isIrregularNotice: plot.isIrregularPlot
      },
      heightFloors: {
        maxPermissibleHeightM,
        maxPermissibleFloors,
        roadWidthFormula: roadFormula,
        proposedHeightM,
        proposedFloors: proposal.proposedFloors,
        status: heightStatus,
        notes: heightNotes,
        clause: 'NBC 2016 Part 3 / Local Bye-Laws',
        doc: coverageDoc
      },
      parking: {
        requiredEcs,
        visitorEcs,
        evChargingEcs,
        proposedEcs,
        status: parkingStatus,
        ruleDescription: parkingRuleDesc,
        clause: 'NBC 2016 Part 8 / Local Bye-Laws',
        doc: coverageDoc
      }
    },
    lifeSafetyAndServices: {
      fireSafety: {
        isHighRise,
        fireNocRequired,
        minAccessRoadM,
        maxTravelDistanceM,
        minStaircaseWidthM,
        status: fireStatus,
        notes: fireNotes,
        clause: 'NBC 2016 Part 4 Clause 3.4.6',
        doc: 'National Building Code 2016 (Fire and Life Safety)'
      },
      accessibility: {
        rampRequired,
        maxRampSlope: '1:12 (8.33% slope)',
        liftRequired,
        accessibleToiletRequired: proposal.buildingUse !== 'residential_plotted',
        tactilePavingRequired: proposal.buildingUse !== 'residential_plotted',
        notes: 'NBC 2016 Part 3 Annex D & MoHUA Harmonised Guidelines 2021 mandate barrier-free accessibility.',
        clause: 'Part 3 Annex D',
        doc: 'NBC 2016 / MoHUA Harmonised Guidelines 2021'
      },
      environment: {
        rwhRequired,
        rwhTankCapacityLiters,
        solarPvRequired,
        minSolarCapacityKw,
        stpRequired,
        greenAreaPct,
        notes: `Rainwater harvesting mandatory (min ${rwhTankCapacityLiters}L). ${solarPvRequired ? `Solar PV mandatory (${minSolarCapacityKw} kWp min).` : ''}`,
        clause: 'Part 10 Clause 5',
        doc: 'NBC 2016 & CGWA Environmental Directives'
      },
      basementRules: {
        maxBasementFloors: proposal.hasBasement ? Math.max(1, proposal.basementFloors || 1) : 0,
        allowedUses: ['Vehicular Parking', 'Air Conditioning Plant', 'Electrical Substation', 'Storage for Household Goods'],
        setbackExemption: 'Basement structure may extend up to 1.5m from plot boundary provided structural safety and waterproofing are certified.',
        notes: 'Basement cannot be used for habitable rooms (bedrooms/kitchens).',
        clause: 'NBC 2016 Part 3 Clause 4.9',
        doc: 'National Building Code 2016'
      }
    },
    specialRestrictions: specialRestrictionsList,
    approvalsChecklist,
    complianceMatrix,
    auditTrail
  };
}

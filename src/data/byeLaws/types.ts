
export type JurisdictionTier = 'national' | 'state' | 'city_authority' | 'special_authority';

export type RuleCategory = 
  | 'far_fsi'
  | 'ground_coverage'
  | 'setbacks'
  | 'height_floors'
  | 'number_of_floors'
  | 'parking'
  | 'fire_safety'
  | 'accessibility'
  | 'structural_safety'
  | 'land_use'
  | 'zoning'
  | 'open_spaces'
  | 'amenity_space'
  | 'basement'
  | 'stilt_parking'
  | 'staircases'
  | 'lifts'
  | 'corridors'
  | 'means_of_egress'
  | 'refuge_areas'
  | 'rainwater_harvesting'
  | 'environmental_regulations'
  | 'green_building'
  | 'solar_requirements'
  | 'water_supply'
  | 'sewage_drainage'
  | 'plumbing'
  | 'electrical'
  | 'building_services'
  | 'approvals_sanctions'
  | 'completion_occupancy_certificate'
  | 'special_restriction'
  | 'approval'
  | 'environment';

export type RuleStatus = 'draft' | 'review' | 'verified' | 'partially_verified' | 'needs_review' | 'outdated' | 'archived' | 'coming_soon' | 'superseded';

export type RegulationStatus = 'verified' | 'partially_verified' | 'needs_review' | 'outdated' | 'archived' | 'coming_soon';

export type DocumentPriority = 'primary' | 'secondary' | 'reference';

export type DocumentType = 
  | 'building_code' 
  | 'development_control_regulations' 
  | 'unified_dcr' 
  | 'master_plan' 
  | 'zonal_plan' 
  | 'model_bye_laws' 
  | 'statutory_act' 
  | 'government_order' 
  | 'special_overlay' 
  | 'guideline' 
  | 'standard';

export type ComplianceStatus = 'compliant' | 'conditional' | 'non_compliant' | 'not_determined';

export type OverallFeasibilityStatus = 'feasible' | 'conditional' | 'potential_issues' | 'insufficient_data';

export type RelevanceBadge = 'direct_local' | 'location_relevant' | 'reference_standard' | 'general_info';

export type BuildingUse = 
  | 'residential_plotted'
  | 'residential_group_housing'
  | 'commercial_retail'
  | 'commercial_office'
  | 'mixed_use'
  | 'industrial'
  | 'institutional'
  | 'educational'
  | 'hospitality'
  | 'healthcare';

export type AreaUnit = 'sq_m' | 'sq_ft' | 'sq_yd' | 'acre' | 'guntha' | 'bigha';

export type DimensionUnit = 'm' | 'ft';

export interface JurisdictionScope {
  country: string;
  state?: string;
  stateId?: string;
  city?: string;
  cityId?: string;
  authority?: string;
  authorityId?: string;
}

export interface SiteLocationInput {
  country: string;
  state: string;
  cityAuthority: string;
  zone: string;
  roadWidth: number; // in meters
  pinCode?: string;
  locality?: string;
}

export interface PlotInfoInput {
  plotArea: number; // in areaUnit
  areaUnit: AreaUnit;
  frontageWidth: number; // in meters
  plotDepth: number; // in meters
  isCornerPlot: boolean;
  isIrregularPlot: boolean;
  hasExistingStructure: boolean;
  northOrientation: number; // 0-360 degrees
}

export interface ProposedDevelopmentInput {
  buildingUse: BuildingUse;
  projectType: 'new_construction' | 'redevelopment' | 'extension';
  proposedFloors: number;
  hasStilt: boolean;
  hasBasement: boolean;
  basementFloors: number;
  proposedGroundCoverageSqM?: number;
  proposedTotalBuaSqM?: number;
  proposedHeightM?: number;
  dwellingUnits?: number;
  proposedParkingSpaces?: number;
}

export interface SiteConditionsInput {
  nearAirport: boolean;
  airportDistanceKm?: number;
  nearHighway: boolean;
  highwayType?: 'national' | 'state' | 'none';
  nearRailway: boolean;
  railwayDistanceM?: number;
  inHeritageZone: boolean;
  nearWaterBodyOrNallah: boolean;
  waterBodyDistanceM?: number;
  isEcoSensitiveOrForest: boolean;
}

export interface DocumentSource {
  authority: string;
  officialUrl: string;
  documentUrl?: string;
  documentType?: 'PDF' | 'Gazette' | 'Portal' | 'Standard';
  publishedDate?: string;
  lastVerified: string;
}

export interface AmendmentRecord {
  year: string;
  title: string;
  officialUrl?: string;
  gazetteNotification?: string;
  summary: string;
  status: 'in_force' | 'superseded' | 'proposed';
}

export interface DocumentRelationship {
  relatedDocuments?: string[];
  supersedes?: string[];
  supersededBy?: string[];
  references?: string[];
}

export interface RegulationDocument {
  id: string;
  title: string;
  shortTitle: string;
  level: 1 | 2 | 3 | 4;
  jurisdiction: JurisdictionScope;
  documentType: DocumentType;
  documentPriority: DocumentPriority;
  year: string;
  version: string;
  status: RegulationStatus;
  categories: RuleCategory[];
  source: DocumentSource;
  amendments?: AmendmentRecord[];
  relationships?: DocumentRelationship;
  metadata?: {
    language: string;
    pages?: number;
    amendmentsAvailable: boolean;
    gazetteNumber?: string;
  };
  summary: string;
  keyProvisions: string[];
}

export interface RegulationClause {
  id: string;
  documentId: string;
  title: string;
  category: RuleCategory;
  subCategory?: string;
  jurisdiction: JurisdictionScope;
  level: 1 | 2 | 3 | 4;
  applicability: {
    buildingUse?: BuildingUse[];
    plotType?: string[];
    zone?: string[];
    minPlotAreaSqM?: number;
    maxPlotAreaSqM?: number;
    minRoadWidthM?: number;
    maxRoadWidthM?: number;
    conditions?: string[];
  };
  rule: {
    type: string;
    value?: any;
    formula?: string;
  };
  sourceReference: {
    chapter?: string;
    section?: string;
    clause: string;
    page?: string;
    table?: string;
  };
  status: RegulationStatus;
  lastVerified: string;
  summary: string;
  detailedRequirements?: string[];
  parameters?: Record<string, any>;
}

// Backward-compatible interface for rule evaluation
export interface ByeLawRule {
  id: string;
  tier: JurisdictionTier;
  level: 1 | 2 | 3 | 4;
  levelName: string;
  jurisdiction: string;
  jurisdictionScope?: JurisdictionScope;
  category: RuleCategory;
  categoryName: string;
  title: string;
  clause: string;
  sourceDoc: string;
  sourceUrl?: string;
  documentYear?: string;
  version: string;
  lastVerified: string;
  status: RuleStatus;
  documentPriority?: DocumentPriority;
  summary: string;
  appliesTo?: {
    uses?: BuildingUse[];
    minPlotArea?: number; // sq.m
    maxPlotArea?: number; // sq.m
    minRoadWidth?: number; // m
    maxRoadWidth?: number; // m
  };
  parameters: Record<string, any>;
  detailedRequirements?: string[];
  amendments?: AmendmentRecord[];
  relationships?: DocumentRelationship;
}

export interface ComplianceMatrixItem {
  category: string;
  parameter: string;
  permitted: string;
  proposed: string;
  status: ComplianceStatus;
  remarks: string;
  clause: string;
  sourceDoc?: string;
}

export interface StatutoryApprovalItem {
  id: string;
  stage: 'Pre-Construction' | 'During Construction' | 'Post-Construction / Occupancy';
  authority: string;
  approvalName: string;
  isMandatory: boolean;
  timelineDays: string;
  notes: string;
  applicableCondition: string;
}

export interface FeasibilityReport {
  input: {
    site: SiteLocationInput;
    plot: PlotInfoInput;
    proposal: ProposedDevelopmentInput;
    conditions: SiteConditionsInput;
    normalizedPlotAreaSqM: number;
    normalizedPlotAreaSqFt: number;
  };
  resolvedJurisdiction: {
    stateName: string;
    authorityName: string;
    primaryCode: string;
    tierHierarchy: string[];
    isOfficialDataAvailable: boolean;
  };
  executiveSummary: {
    status: OverallFeasibilityStatus;
    headline: string;
    confidenceScore: number;
    keyHighlights: string[];
    criticalFlags: string[];
    summaryText: string;
  };
  developmentControls: {
    groundCoverage: {
      permittedMaxSqM: number;
      permittedMaxPct: number;
      proposedSqM: number;
      proposedPct: number;
      status: ComplianceStatus;
      notes: string;
      clause: string;
      doc: string;
    };
    far: {
      baseFar: number;
      maxPurchasableFar: number;
      greenIncentiveFar: number;
      effectiveMaxFar: number;
      permittedMaxBuaSqM: number;
      proposedBuaSqM: number;
      proposedFar: number;
      status: ComplianceStatus;
      notes: string;
      clause: string;
      doc: string;
    };
    setbacks: {
      frontM: number;
      rearM: number;
      leftM: number;
      rightM: number;
      totalSetbacksM: { width: number; depth: number };
      proposedFrontM: number;
      proposedRearM: number;
      proposedSidesM: number;
      status: ComplianceStatus;
      notes: string;
      clause: string;
      doc: string;
    };
    envelope: {
      buildableWidthM: number;
      buildableDepthM: number;
      buildableFootprintSqM: number;
      envelopeEfficiencyPct: number;
      isIrregularNotice: boolean;
    };
    heightFloors: {
      maxPermissibleHeightM: number;
      maxPermissibleFloors: number;
      roadWidthFormula: string;
      proposedHeightM: number;
      proposedFloors: number;
      status: ComplianceStatus;
      notes: string;
      clause: string;
      doc: string;
    };
    parking: {
      requiredEcs: number;
      visitorEcs: number;
      evChargingEcs: number;
      proposedEcs: number;
      status: ComplianceStatus;
      ruleDescription: string;
      clause: string;
      doc: string;
    };
  };
  lifeSafetyAndServices: {
    fireSafety: {
      isHighRise: boolean;
      fireNocRequired: boolean;
      minAccessRoadM: number;
      maxTravelDistanceM: number;
      minStaircaseWidthM: number;
      status: ComplianceStatus;
      notes: string;
      clause: string;
      doc: string;
    };
    accessibility: {
      rampRequired: boolean;
      maxRampSlope: string;
      liftRequired: boolean;
      accessibleToiletRequired: boolean;
      tactilePavingRequired: boolean;
      notes: string;
      clause: string;
      doc: string;
    };
    environment: {
      rwhRequired: boolean;
      rwhTankCapacityLiters: number;
      solarPvRequired: boolean;
      minSolarCapacityKw: number;
      stpRequired: boolean;
      greenAreaPct: number;
      notes: string;
      clause: string;
      doc: string;
    };
    basementRules: {
      maxBasementFloors: number;
      allowedUses: string[];
      setbackExemption: string;
      notes: string;
      clause: string;
      doc: string;
    };
  };
  specialRestrictions: Array<{
    restriction: string;
    authority: string;
    requirement: string;
    status: ComplianceStatus;
    clause: string;
    doc: string;
  }>;
  approvalsChecklist: StatutoryApprovalItem[];
  complianceMatrix: ComplianceMatrixItem[];
  auditTrail: Array<{
    id: string;
    ruleId: string;
    jurisdiction: string;
    title: string;
    clause: string;
    sourceDoc: string;
    lastVerified: string;
    status: RuleStatus;
  }>;
}

export interface SearchIndexItem {
  id: string;
  documentId: string;
  keyword: string;
  title: string;
  jurisdiction: string;
  category: RuleCategory;
  level: 1 | 2 | 3 | 4;
  authority?: string;
  clause?: string;
  summary?: string;
}

export interface JurisdictionCoverageMetrics {
  totalRegulations: number;
  totalVerified: number;
  totalPartiallyVerified: number;
  totalComingSoon: number;
  nationalCount: number;
  stateCount: number;
  cityCount: number;
  authorityCount: number;
  categoriesCovered: Record<string, number>;
  categoryCoveragePct: number;
  levelCoverage: {
    level1National: { available: boolean; count: number };
    level2State: { available: boolean; count: number };
    level3MasterPlan: { available: boolean; count: number };
    level4LocalAuthority: { available: boolean; count: number };
  };
}

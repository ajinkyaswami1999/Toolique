// Toolique Building Feasibility & Bye-Law Checker - Unified Authoritative Database Aggregator

import type { ByeLawRule, RegulationDocument } from './types';
import { NATIONAL_REGULATION_DOCUMENTS, NATIONAL_BYE_LAW_RULES } from './nationalRegulations';
import { STATE_REGULATION_DOCUMENTS, STATE_BYE_LAW_RULES } from './stateRegulations';
import { CITY_MASTER_PLAN_DOCUMENTS, CITY_MASTER_PLAN_RULES } from './cityMasterPlans';
import { AUTHORITY_REGULATION_DOCUMENTS, AUTHORITY_BYE_LAW_RULES } from './authorityRegulations';
import { calculateJurisdictionCoverage, getGlobalPlatformStats, MAJOR_RULE_CATEGORIES } from './coverageEngine';
import { buildSearchIndex, searchRegulations } from './searchIndex';
import { validateByeLawsDatabase } from './dataValidator';

// All Registered Official Regulation Documents
export const ALL_REGULATION_DOCUMENTS: RegulationDocument[] = [
  ...NATIONAL_REGULATION_DOCUMENTS,
  ...STATE_REGULATION_DOCUMENTS,
  ...CITY_MASTER_PLAN_DOCUMENTS,
  ...AUTHORITY_REGULATION_DOCUMENTS
];

// All Registered Authoritative Bye-Law Rules (Evaluated by Feasibility Engine & Matrix)
export const OFFICIAL_BYE_LAWS_DATABASE: ByeLawRule[] = [
  ...NATIONAL_BYE_LAW_RULES,
  ...STATE_BYE_LAW_RULES,
  ...CITY_MASTER_PLAN_RULES,
  ...AUTHORITY_BYE_LAW_RULES
];

// Pre-built searchable index
export const GLOBAL_SEARCH_INDEX = buildSearchIndex(OFFICIAL_BYE_LAWS_DATABASE, ALL_REGULATION_DOCUMENTS);

// Global platform summary statistics
export const GLOBAL_PLATFORM_STATS = getGlobalPlatformStats(ALL_REGULATION_DOCUMENTS, OFFICIAL_BYE_LAWS_DATABASE);

// Re-exports
export {
  calculateJurisdictionCoverage,
  getGlobalPlatformStats,
  buildSearchIndex,
  searchRegulations,
  validateByeLawsDatabase,
  MAJOR_RULE_CATEGORIES
};

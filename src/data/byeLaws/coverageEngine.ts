// Toolique Building Feasibility & Bye-Law Checker - Real-Time Database Coverage Engine

import type { ByeLawRule, RegulationDocument, JurisdictionCoverageMetrics, RuleCategory } from './types';
import { JURISDICTION_INDEX } from './jurisdictionIndex';

export const MAJOR_RULE_CATEGORIES: { id: RuleCategory; label: string; icon: string }[] = [
  { id: 'far_fsi', label: 'FAR / FSI', icon: '🏗️' },
  { id: 'ground_coverage', label: 'Ground Coverage', icon: '🏠' },
  { id: 'setbacks', label: 'Setbacks & Open Spaces', icon: '📐' },
  { id: 'height_floors', label: 'Building Height & Floors', icon: '🏢' },
  { id: 'parking', label: 'Parking & ECS', icon: '🚗' },
  { id: 'fire_safety', label: 'Fire & Life Safety', icon: '🔥' },
  { id: 'accessibility', label: 'Universal Accessibility', icon: '♿' },
  { id: 'environmental_regulations', label: 'Environment & RWH', icon: '🌱' },
  { id: 'special_restriction', label: 'Overlays & Buffers', icon: '🛡️' },
  { id: 'approvals_sanctions', label: 'Approvals & Sanctions', icon: '📜' }
];

export function calculateJurisdictionCoverage(
  stateId?: string,
  cityId?: string,
  authorityId?: string,
  rulesList: ByeLawRule[] = []
): JurisdictionCoverageMetrics {
  const normStateId = stateId?.toLowerCase();
  const normCityId = cityId?.toLowerCase();
  const normAuthId = authorityId?.toLowerCase();

  const matchedRules = rulesList.filter(rule => {
    // Level 1 National applies everywhere
    if (rule.level === 1) return true;
    
    // Level 2 State matching
    if (rule.level === 2) {
      if (!normStateId) return false;
      const rStateId = rule.jurisdictionScope?.stateId?.toLowerCase();
      const rState = rule.jurisdictionScope?.state?.toLowerCase();
      return (rStateId && rStateId === normStateId) || (rState && (rState === normStateId || normStateId.includes(rState))) || rule.jurisdiction.toLowerCase().includes(normStateId);
    }

    // Level 3 City matching
    if (rule.level === 3) {
      if (!normCityId && !normStateId) return false;
      const rCityId = rule.jurisdictionScope?.cityId?.toLowerCase();
      const rCity = rule.jurisdictionScope?.city?.toLowerCase();
      if (normCityId) {
        return (rCityId && rCityId === normCityId) || (rCity && (rCity === normCityId || normCityId.includes(rCity) || rCity.includes(normCityId))) || rule.jurisdiction.toLowerCase().includes(normCityId);
      }
      const rStateId = rule.jurisdictionScope?.stateId?.toLowerCase();
      const rState = rule.jurisdictionScope?.state?.toLowerCase();
      return Boolean((rStateId && rStateId === normStateId) || (rState && rState === normStateId));
    }

    // Level 4 Local Authority / Special Overlays
    if (rule.level === 4) {
      const rStateId = rule.jurisdictionScope?.stateId?.toLowerCase();
      const rCityId = rule.jurisdictionScope?.cityId?.toLowerCase();
      const rAuthId = rule.jurisdictionScope?.authorityId?.toLowerCase();
      const rState = rule.jurisdictionScope?.state?.toLowerCase();
      const rCity = rule.jurisdictionScope?.city?.toLowerCase();
      const rAuth = rule.jurisdictionScope?.authority?.toLowerCase();
      const hasSpecificLocation = Boolean(rStateId || rCityId || rAuthId || rState || rCity || rAuth);

      if (!hasSpecificLocation) {
        // True Pan-India Statutory Overlay (AAI, NHAI, Railways, ASI, NGT, CEA, Fire, CGWA, Tree)
        return true;
      }

      // Local Authority Specific Rule (Must match selected authority, city or state)
      if (normAuthId && rAuthId && (rAuthId === normAuthId || normAuthId.includes(rAuthId) || rAuthId.includes(normAuthId))) {
        return true;
      }
      if (normCityId && ((rCityId && rCityId === normCityId) || (rCity && (rCity === normCityId || normCityId.includes(rCity))))) {
        return true;
      }
      if (normStateId && ((rStateId && rStateId === normStateId) || (rState && rState === normStateId)) && !rCityId && !rCity) {
        return true;
      }

      return false;
    }

    return false;
  });

  const categoriesCovered: Record<string, number> = {};
  let nationalCount = 0;
  let stateCount = 0;
  let cityCount = 0;
  let authorityCount = 0;
  let totalVerified = 0;
  let totalPartiallyVerified = 0;
  let totalComingSoon = 0;

  for (const rule of matchedRules) {
    if (rule.level === 1) nationalCount++;
    if (rule.level === 2) stateCount++;
    if (rule.level === 3) cityCount++;
    if (rule.level === 4) authorityCount++;

    if (rule.status === 'verified') totalVerified++;
    else if (rule.status === 'partially_verified' || rule.status === 'review') totalPartiallyVerified++;
    else if (rule.status === 'coming_soon') totalComingSoon++;

    categoriesCovered[rule.category] = (categoriesCovered[rule.category] || 0) + 1;
  }

  // Calculate distinct category coverage among major categories
  const coveredMajorCount = MAJOR_RULE_CATEGORIES.filter(cat => {
    if (cat.id === 'environmental_regulations') {
      return (categoriesCovered['environmental_regulations'] || 0) > 0 || (categoriesCovered['environment'] || 0) > 0 || (categoriesCovered['rainwater_harvesting'] || 0) > 0;
    }
    if (cat.id === 'approvals_sanctions') {
      return (categoriesCovered['approvals_sanctions'] || 0) > 0 || (categoriesCovered['approval'] || 0) > 0;
    }
    return (categoriesCovered[cat.id] || 0) > 0;
  }).length;

  const categoryCoveragePct = Math.round((coveredMajorCount / MAJOR_RULE_CATEGORIES.length) * 100);

  return {
    totalRegulations: matchedRules.length,
    totalVerified,
    totalPartiallyVerified,
    totalComingSoon,
    nationalCount,
    stateCount,
    cityCount,
    authorityCount,
    categoriesCovered,
    categoryCoveragePct,
    levelCoverage: {
      level1National: { available: nationalCount > 0, count: nationalCount },
      level2State: { available: stateCount > 0, count: stateCount },
      level3MasterPlan: { available: cityCount > 0, count: cityCount },
      level4LocalAuthority: { available: authorityCount > 0, count: authorityCount }
    }
  };
}

export function getGlobalPlatformStats(allDocs: RegulationDocument[], allRules: ByeLawRule[]) {
  const verifiedDocs = allDocs.filter(d => d.status === 'verified').length;
  const verifiedRules = allRules.filter(r => r.status === 'verified').length;
  
  let totalStatesSupported = 0;
  let totalCitiesSupported = 0;
  let totalAuthoritiesSupported = 0;

  for (const s of JURISDICTION_INDEX) {
    if (s.citiesSupported > 0 || s.regulationsAvailable > 0) totalStatesSupported++;
    totalCitiesSupported += s.cities.length;
    for (const c of s.cities) {
      totalAuthoritiesSupported += c.authorities.length;
    }
  }

  return {
    totalRegulationDocuments: allDocs.length,
    verifiedRegulationDocuments: verifiedDocs,
    totalRegulationRules: allRules.length,
    verifiedRegulationRules: verifiedRules,
    totalStates: JURISDICTION_INDEX.length,
    totalStatesSupported,
    totalCitiesSupported,
    totalAuthoritiesSupported
  };
}

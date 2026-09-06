// Toolique Building Feasibility & Bye-Law Checker - High-Performance Search Index

import type { ByeLawRule, RegulationDocument, SearchIndexItem } from './types';

export function buildSearchIndex(rules: ByeLawRule[], _documents: RegulationDocument[]): SearchIndexItem[] {
  const items: SearchIndexItem[] = [];

  for (const rule of rules) {
    const rawTokens = [
      rule.title,
      rule.jurisdiction,
      rule.category,
      rule.categoryName,
      rule.clause,
      rule.sourceDoc,
      rule.summary,
      rule.jurisdictionScope?.city || '',
      rule.jurisdictionScope?.state || '',
      rule.jurisdictionScope?.authority || ''
    ].join(' ').toLowerCase();

    items.push({
      id: rule.id,
      documentId: rule.sourceDoc,
      keyword: rawTokens,
      title: rule.title,
      jurisdiction: rule.jurisdiction,
      category: rule.category,
      level: rule.level,
      authority: rule.jurisdictionScope?.authority,
      clause: rule.clause,
      summary: rule.summary
    });
  }

  return items;
}

export function searchRegulations(
  query: string,
  rules: ByeLawRule[],
  categoryFilter: string = 'all',
  levelFilter: number | 'all' = 'all'
): ByeLawRule[] {
  if (!query && categoryFilter === 'all' && levelFilter === 'all') {
    return rules;
  }

  const normalizedQuery = query.toLowerCase().trim();
  const searchTokens = normalizedQuery ? normalizedQuery.split(/\s+/).filter(Boolean) : [];

  return rules.filter(rule => {
    // Level match
    if (levelFilter !== 'all' && rule.level !== levelFilter) {
      return false;
    }

    // Category match
    if (categoryFilter !== 'all') {
      if (categoryFilter === 'environmental_regulations' || categoryFilter === 'environment') {
        const isEnv = rule.category === 'environment' || rule.category === 'environmental_regulations' || rule.category === 'rainwater_harvesting';
        if (!isEnv) return false;
      } else if (categoryFilter === 'approvals_sanctions' || categoryFilter === 'approval') {
        const isApp = rule.category === 'approval' || rule.category === 'approvals_sanctions';
        if (!isApp) return false;
      } else if (rule.category !== categoryFilter) {
        return false;
      }
    }

    // If no search text, pass
    if (searchTokens.length === 0) {
      return true;
    }

    const searchableBlob = [
      rule.title,
      rule.jurisdiction,
      rule.category,
      rule.categoryName,
      rule.clause,
      rule.sourceDoc,
      rule.summary,
      rule.jurisdictionScope?.city || '',
      rule.jurisdictionScope?.state || '',
      rule.jurisdictionScope?.authority || '',
      ...(rule.detailedRequirements || [])
    ].join(' ').toLowerCase();

    return searchTokens.every(token => searchableBlob.includes(token));
  });
}

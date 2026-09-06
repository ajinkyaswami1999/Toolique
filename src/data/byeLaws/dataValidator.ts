// Toolique Building Feasibility & Bye-Law Checker - Data Integrity & Schema Auditor

import type { ByeLawRule, RegulationDocument } from './types';

export interface ValidationReport {
  isValid: boolean;
  totalDocumentsValidated: number;
  totalRulesValidated: number;
  sourcesVerifiedCount: number;
  duplicateIdErrors: string[];
  missingSourceErrors: string[];
  missingVerificationDateWarnings: string[];
  brokenRelationshipWarnings: string[];
}

export function validateByeLawsDatabase(
  documents: RegulationDocument[],
  rules: ByeLawRule[]
): ValidationReport {
  const seenDocIds = new Set<string>();
  const duplicateIdErrors: string[] = [];
  const missingSourceErrors: string[] = [];
  const missingVerificationDateWarnings: string[] = [];
  const brokenRelationshipWarnings: string[] = [];
  let sourcesVerifiedCount = 0;

  for (const doc of documents) {
    if (seenDocIds.has(doc.id)) {
      duplicateIdErrors.push(`Duplicate Document ID: ${doc.id}`);
    }
    seenDocIds.add(doc.id);

    if (!doc.source?.officialUrl || doc.source.officialUrl.trim() === '') {
      missingSourceErrors.push(`Document ${doc.id} (${doc.title}) missing official source URL`);
    } else {
      sourcesVerifiedCount++;
    }

    if (!doc.source?.lastVerified) {
      missingVerificationDateWarnings.push(`Document ${doc.id} missing lastVerified date`);
    }

    if (doc.relationships?.relatedDocuments) {
      for (const relId of doc.relationships.relatedDocuments) {
        if (!documents.some(d => d.id === relId)) {
          brokenRelationshipWarnings.push(`Document ${doc.id} references non-existent related document: ${relId}`);
        }
      }
    }
  }

  const seenRuleIds = new Set<string>();
  for (const rule of rules) {
    if (seenRuleIds.has(rule.id)) {
      duplicateIdErrors.push(`Duplicate Rule ID: ${rule.id}`);
    }
    seenRuleIds.add(rule.id);

    if (!rule.sourceUrl) {
      missingSourceErrors.push(`Rule ${rule.id} (${rule.title}) missing sourceUrl`);
    }

    if (!rule.lastVerified) {
      missingVerificationDateWarnings.push(`Rule ${rule.id} missing lastVerified date`);
    }
  }

  return {
    isValid: duplicateIdErrors.length === 0 && missingSourceErrors.length === 0,
    totalDocumentsValidated: documents.length,
    totalRulesValidated: rules.length,
    sourcesVerifiedCount,
    duplicateIdErrors,
    missingSourceErrors,
    missingVerificationDateWarnings,
    brokenRelationshipWarnings
  };
}

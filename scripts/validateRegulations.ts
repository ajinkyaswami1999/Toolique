// Toolique Building Feasibility & Bye-Law Checker - CLI Regulation Database Auditor

import { ALL_REGULATION_DOCUMENTS, OFFICIAL_BYE_LAWS_DATABASE, validateByeLawsDatabase, GLOBAL_PLATFORM_STATS } from '../src/data/byeLaws/regulationsDatabase';

console.log('====================================================');
console.log('  TOOLIQUE BYE-LAWS & REGULATIONS DATABASE AUDIT  ');
console.log('====================================================');

const report = validateByeLawsDatabase(ALL_REGULATION_DOCUMENTS, OFFICIAL_BYE_LAWS_DATABASE);

console.log(`✓ Total Registered Regulation Documents: ${report.totalDocumentsValidated}`);
console.log(`✓ Total Evaluated Bye-Law Rules: ${report.totalRulesValidated}`);
console.log(`✓ Official Sources Verified: ${report.sourcesVerifiedCount}`);
console.log(`✓ States & UTs Indexed: ${GLOBAL_PLATFORM_STATS.totalStates}`);
console.log(`✓ Supported Jurisdictions: ${GLOBAL_PLATFORM_STATS.totalStatesSupported} States, ${GLOBAL_PLATFORM_STATS.totalCitiesSupported} Cities, ${GLOBAL_PLATFORM_STATS.totalAuthoritiesSupported} Authorities`);

if (report.duplicateIdErrors.length > 0) {
  console.error('\n❌ Duplicate IDs detected:');
  report.duplicateIdErrors.forEach(err => console.error(`  - ${err}`));
}

if (report.missingSourceErrors.length > 0) {
  console.error('\n❌ Missing Source URLs:');
  report.missingSourceErrors.forEach(err => console.error(`  - ${err}`));
}

if (report.missingVerificationDateWarnings.length > 0) {
  console.warn('\n⚠️ Missing Verification Dates:');
  report.missingVerificationDateWarnings.forEach(w => console.warn(`  - ${w}`));
}

if (report.brokenRelationshipWarnings.length > 0) {
  console.warn('\n⚠️ Broken Relationships:');
  report.brokenRelationshipWarnings.forEach(w => console.warn(`  - ${w}`));
}

if (report.isValid) {
  console.log('\n====================================================');
  console.log('  ✅ ALL REGULATION INTEGRITY AUDITS PASSED 100%     ');
  console.log('====================================================\n');
  process.exit(0);
} else {
  console.error('\n====================================================');
  console.error('  ❌ DATA INTEGRITY AUDIT FAILED                     ');
  console.error('====================================================\n');
  process.exit(1);
}

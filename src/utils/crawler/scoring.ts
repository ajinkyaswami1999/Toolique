/* eslint-disable @typescript-eslint/no-explicit-any */
import type { PageRecord } from './storage';
import type { IssueRecord } from './analyzers';

export interface CategoryScore {
  score: number;
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  warnings: number;
  calculationRules: string[];
}

export interface CrawlScoreProfile {
  scoringVersion: string;
  globalScore: number;
  categories: {
    technical: CategoryScore;
    seo: CategoryScore;
    links: CategoryScore;
    content: CategoryScore;
    resources: CategoryScore;
    security: CategoryScore;
    performance: CategoryScore;
    indexability: CategoryScore;
  };
}

export const SCORING_VERSION = '1.0.0';

/**
 * Calculates deterministic category and global scores based on actual crawl data and issues.
 */
export function calculateCrawlScores(
  pages: PageRecord[],
  issues: IssueRecord[],
  links: any[],
  resources: any[],
  errorsCount: number = 0
): CrawlScoreProfile {
  
  // 1. SEO Category Score
  const seoIssues = issues.filter(i => i.category === 'SEO');
  let seoPenalties = 0;
  seoIssues.forEach(issue => {
    switch (issue.rule) {
      case 'SEO_TITLE_MISSING': seoPenalties += 15; break;
      case 'SEO_TITLE_SHORT': seoPenalties += 2; break;
      case 'SEO_TITLE_LONG': seoPenalties += 3; break;
      case 'SEO_TITLE_DUPLICATE': seoPenalties += 5; break;
      case 'SEO_DESC_MISSING': seoPenalties += 10; break;
      case 'SEO_DESC_SHORT': seoPenalties += 1; break;
      case 'SEO_DESC_LONG': seoPenalties += 3; break;
      case 'SEO_H1_MISSING': seoPenalties += 8; break;
      case 'SEO_H1_MULTIPLE': seoPenalties += 4; break;
      case 'SEO_CANONICAL_MISSING': seoPenalties += 8; break;
      case 'SEO_CANONICAL_MISMATCH': seoPenalties += 8; break;
      case 'SEO_LANG_MISSING': seoPenalties += 2; break;
    }
  });
  const seoTotalChecks = Math.max(1, pages.length * 10);
  const seoFailed = seoIssues.filter(i => i.severity === 'CRITICAL' || i.severity === 'WARNING').length;
  const seoWarns = seoIssues.filter(i => i.severity === 'WARNING' || i.severity === 'NOTICE').length;
  const seoScore = Math.max(0, 100 - seoPenalties);

  // 2. Links Category Score
  const linkIssues = issues.filter(i => i.category === 'LINKS');
  let linkPenalties = 0;
  linkIssues.forEach(issue => {
    switch (issue.rule) {
      case 'LINK_BROKEN': linkPenalties += 15; break;
      case 'LINK_REDIRECT': linkPenalties += 3; break;
      case 'LINK_NO_INBOUND': linkPenalties += 5; break;
    }
  });
  const linksTotalChecks = Math.max(1, links.length + pages.length);
  const linksFailed = linkIssues.filter(i => i.severity === 'CRITICAL' || i.severity === 'WARNING').length;
  const linksWarns = linkIssues.filter(i => i.severity === 'WARNING' || i.severity === 'NOTICE').length;
  const linksScore = Math.max(0, 100 - linkPenalties);

  // 3. Content Category Score
  const contentIssues = issues.filter(i => i.category === 'CONTENT');
  let contentPenalties = 0;
  contentIssues.forEach(issue => {
    switch (issue.rule) {
      case 'CONTENT_LOW_VOLUME': contentPenalties += 5; break;
      case 'CONTENT_DUPLICATE': contentPenalties += 20; break;
    }
  });
  const contentTotalChecks = Math.max(1, pages.length * 2);
  const contentFailed = contentIssues.filter(i => i.severity === 'CRITICAL' || i.severity === 'WARNING').length;
  const contentWarns = contentIssues.filter(i => i.severity === 'WARNING' || i.severity === 'NOTICE').length;
  const contentScore = Math.max(0, 100 - contentPenalties);

  // 4. Resources Category Score
  const resIssues = issues.filter(i => i.category === 'RESOURCES');
  let resPenalties = 0;
  resIssues.forEach(issue => {
    switch (issue.rule) {
      case 'RESOURCE_BROKEN': resPenalties += 15; break;
    }
  });
  const resourcesTotalChecks = Math.max(1, resources.length);
  const resourcesFailed = resIssues.filter(i => i.severity === 'CRITICAL' || i.severity === 'WARNING').length;
  const resourcesWarns = resIssues.filter(i => i.severity === 'WARNING' || i.severity === 'NOTICE').length;
  const resourcesScore = Math.max(0, 100 - resPenalties);

  // 5. Security Category Score
  const secIssues = issues.filter(i => i.category === 'SECURITY');
  let secPenalties = 0;
  secIssues.forEach(issue => {
    switch (issue.rule) {
      case 'SECURITY_HSTS_MISSING': secPenalties += 10; break;
      case 'SECURITY_CSP_MISSING': secPenalties += 10; break;
      case 'SECURITY_XFRAME_MISSING': secPenalties += 8; break;
      case 'SECURITY_XCONTENT_MISSING': secPenalties += 8; break;
    }
  });
  const securityTotalChecks = Math.max(1, pages.length * 4);
  const securityFailed = secIssues.filter(i => i.severity === 'CRITICAL' || i.severity === 'WARNING').length;
  const securityWarns = secIssues.filter(i => i.severity === 'WARNING' || i.severity === 'NOTICE').length;
  const securityScore = Math.max(0, 100 - secPenalties);

  // 6. Performance Category Score
  const perfIssues = issues.filter(i => i.category === 'PERFORMANCE');
  let perfPenalties = 0;
  perfIssues.forEach(issue => {
    switch (issue.rule) {
      case 'PERF_SLOW_RESPONSE': perfPenalties += 10; break;
      case 'PERF_LARGE_PAGE': perfPenalties += 5; break;
    }
  });
  const performanceTotalChecks = Math.max(1, pages.length * 2);
  const performanceFailed = perfIssues.filter(i => i.severity === 'CRITICAL' || i.severity === 'WARNING').length;
  const performanceWarns = perfIssues.filter(i => i.severity === 'WARNING' || i.severity === 'NOTICE').length;
  const performanceScore = Math.max(0, 100 - perfPenalties);

  // 7. Indexability Category Score
  let indexabilityPenalties = 0;
  pages.forEach(p => {
    const noindex = /noindex/i.test(p.metaRobots) || p.status !== 200;
    if (noindex) {
      indexabilityPenalties += 20;
    }
  });
  const indexabilityTotalChecks = Math.max(1, pages.length);
  const indexabilityFailed = pages.filter(p => p.status !== 200 || /noindex/i.test(p.metaRobots)).length;
  const indexabilityScore = Math.max(0, 100 - indexabilityPenalties);

  // 8. Technical Category Score
  const techPenalties = errorsCount * 20;
  const technicalTotalChecks = Math.max(1, pages.length + errorsCount);
  const technicalScore = Math.max(0, 100 - techPenalties);

  // Compile global Score
  const globalScore = Math.round(
    (seoScore + linksScore + contentScore + resourcesScore + securityScore + performanceScore + indexabilityScore + technicalScore) / 8
  );

  return {
    scoringVersion: SCORING_VERSION,
    globalScore,
    categories: {
      technical: {
        score: technicalScore,
        totalChecks: technicalTotalChecks,
        passedChecks: Math.max(0, technicalTotalChecks - errorsCount),
        failedChecks: errorsCount,
        warnings: 0,
        calculationRules: ['Penalize crawl connection errors (-20)']
      },
      seo: {
        score: seoScore,
        totalChecks: seoTotalChecks,
        passedChecks: Math.max(0, seoTotalChecks - seoFailed),
        failedChecks: seoFailed,
        warnings: seoWarns,
        calculationRules: ['Penalize missing titles (-15)', 'duplicate titles (-5)', 'missing descriptions (-10)']
      },
      links: {
        score: linksScore,
        totalChecks: linksTotalChecks,
        passedChecks: Math.max(0, linksTotalChecks - linksFailed),
        failedChecks: linksFailed,
        warnings: linksWarns,
        calculationRules: ['Penalize broken links (-15)', 'redirect chains (-3)', 'orphan targets (-5)']
      },
      content: {
        score: contentScore,
        totalChecks: contentTotalChecks,
        passedChecks: Math.max(0, contentTotalChecks - contentFailed),
        failedChecks: contentFailed,
        warnings: contentWarns,
        calculationRules: ['Penalize low content volume (-5)', 'duplicate text fingerprints (-20)']
      },
      resources: {
        score: resourcesScore,
        totalChecks: resourcesTotalChecks,
        passedChecks: Math.max(0, resourcesTotalChecks - resourcesFailed),
        failedChecks: resourcesFailed,
        warnings: resourcesWarns,
        calculationRules: ['Penalize broken style and script files (-15)']
      },
      security: {
        score: securityScore,
        totalChecks: securityTotalChecks,
        passedChecks: Math.max(0, securityTotalChecks - securityFailed),
        failedChecks: securityFailed,
        warnings: securityWarns,
        calculationRules: ['Penalize missing HSTS (-10)', 'missing CSP (-10)', 'missing Frame Options (-8)']
      },
      performance: {
        score: performanceScore,
        totalChecks: performanceTotalChecks,
        passedChecks: Math.max(0, performanceTotalChecks - performanceFailed),
        failedChecks: performanceFailed,
        warnings: performanceWarns,
        calculationRules: ['Penalize page latencies > 1s (-10)', 'oversized HTML sizes (-5)']
      },
      indexability: {
        score: indexabilityScore,
        totalChecks: indexabilityTotalChecks,
        passedChecks: Math.max(0, indexabilityTotalChecks - indexabilityFailed),
        failedChecks: indexabilityFailed,
        warnings: 0,
        calculationRules: ['Penalize non-indexable status or meta noindex tags (-20)']
      }
    }
  };
}

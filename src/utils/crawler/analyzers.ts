/* eslint-disable @typescript-eslint/no-explicit-any */
import type { PageRecord } from './storage';

export interface IssueRecord {
  crawlId: string;
  rule: string;      // e.g. "SEO_TITLE_MISSING"
  category: 'SEO' | 'LINKS' | 'CONTENT' | 'RESOURCES' | 'SECURITY' | 'PERFORMANCE';
  severity: 'CRITICAL' | 'WARNING' | 'NOTICE';
  url: string;       // affected page URL
  evidence: Record<string, any>;
  description: string;
}

/**
 * Runs SEO rules validations on a page record.
 */
export function analyzeSeo(page: PageRecord, allPages: PageRecord[]): IssueRecord[] {
  const issues: IssueRecord[] = [];
  const crawlId = page.crawlId;
  const url = page.url;

  // Title checks
  if (!page.title) {
    issues.push({
      crawlId,
      rule: 'SEO_TITLE_MISSING',
      category: 'SEO',
      severity: 'CRITICAL',
      url,
      evidence: { title: null },
      description: 'The page is missing a title tag (<title>).'
    });
  } else {
    if (page.title.length < 30) {
      issues.push({
        crawlId,
        rule: 'SEO_TITLE_SHORT',
        category: 'SEO',
        severity: 'NOTICE',
        url,
        evidence: { length: page.title.length, title: page.title },
        description: 'The title tag is shorter than the recommended 30 characters.'
      });
    } else if (page.title.length > 60) {
      issues.push({
        crawlId,
        rule: 'SEO_TITLE_LONG',
        category: 'SEO',
        severity: 'WARNING',
        url,
        evidence: { length: page.title.length, title: page.title },
        description: 'The title tag is longer than the recommended 60 characters.'
      });
    }

    // Duplicate titles check
    const duplicateTitles = allPages.filter(p => p.url !== url && p.title === page.title);
    if (duplicateTitles.length > 0) {
      issues.push({
        crawlId,
        rule: 'SEO_TITLE_DUPLICATE',
        category: 'SEO',
        severity: 'WARNING',
        url,
        evidence: { duplicateCount: duplicateTitles.length, title: page.title },
        description: 'Multiple pages share identical title tags.'
      });
    }
  }

  // Description checks
  if (!page.description) {
    issues.push({
      crawlId,
      rule: 'SEO_DESC_MISSING',
      category: 'SEO',
      severity: 'WARNING',
      url,
      evidence: { description: null },
      description: 'The page is missing a meta description tag.'
    });
  } else {
    if (page.description.length < 50) {
      issues.push({
        crawlId,
        rule: 'SEO_DESC_SHORT',
        category: 'SEO',
        severity: 'NOTICE',
        url,
        evidence: { length: page.description.length, description: page.description },
        description: 'The meta description is shorter than the recommended 50 characters.'
      });
    } else if (page.description.length > 160) {
      issues.push({
        crawlId,
        rule: 'SEO_DESC_LONG',
        category: 'SEO',
        severity: 'WARNING',
        url,
        evidence: { length: page.description.length, description: page.description },
        description: 'The meta description is longer than the recommended 160 characters.'
      });
    }
  }

  // Heading check
  const h1s = page.headings.filter(h => h.tag === 'h1');
  if (h1s.length === 0) {
    issues.push({
      crawlId,
      rule: 'SEO_H1_MISSING',
      category: 'SEO',
      severity: 'WARNING',
      url,
      evidence: { h1Count: 0 },
      description: 'The page does not contain any H1 heading elements.'
    });
  } else if (h1s.length > 1) {
    issues.push({
      crawlId,
      rule: 'SEO_H1_MULTIPLE',
      category: 'SEO',
      severity: 'WARNING',
      url,
      evidence: { h1Count: h1s.length, headings: h1s.map(h => h.text) },
      description: 'The page contains multiple H1 headings.'
    });
  }

  // Canonical tag check
  if (!page.canonical) {
    issues.push({
      crawlId,
      rule: 'SEO_CANONICAL_MISSING',
      category: 'SEO',
      severity: 'WARNING',
      url,
      evidence: { canonical: null },
      description: 'The page is missing a canonical URL meta declaration.'
    });
  } else if (page.canonical !== url) {
    issues.push({
      crawlId,
      rule: 'SEO_CANONICAL_MISMATCH',
      category: 'SEO',
      severity: 'WARNING',
      url,
      evidence: { canonical: page.canonical, actual: url },
      description: 'The canonical declaration URL does not match the actual page address.'
    });
  }

  // Language check
  if (!page.language || page.language === 'en' && !htmlContainsLang(page.language)) {
    // Basic notice if lang attribute is missing
    issues.push({
      crawlId,
      rule: 'SEO_LANG_MISSING',
      category: 'SEO',
      severity: 'NOTICE',
      url,
      evidence: { language: page.language },
      description: 'The HTML element is missing a lang code attribute.'
    });
  }

  return issues;
}

function htmlContainsLang(lang: string): boolean {
  return !!lang;
}

/**
 * Runs Link validations on a page record.
 */
export function analyzeLinks(page: PageRecord, links: any[], allPages: PageRecord[]): IssueRecord[] {
  const issues: IssueRecord[] = [];
  const crawlId = page.crawlId;
  const url = page.url;

  // Filter links belonging to this page
  const pageLinks = links.filter(l => l.source === url);

  // Check for broken links
  const brokenLinks = pageLinks.filter(l => l.status >= 400);
  brokenLinks.forEach(link => {
    issues.push({
      crawlId,
      rule: 'LINK_BROKEN',
      category: 'LINKS',
      severity: 'CRITICAL',
      url,
      evidence: { destination: link.destination, status: link.status },
      description: `The page contains a broken hyperlink pointing to ${link.destination}.`
    });
  });

  // Check for redirect links
  const redirectLinks = pageLinks.filter(l => l.status >= 300 && l.status < 400);
  redirectLinks.forEach(link => {
    issues.push({
      crawlId,
      rule: 'LINK_REDIRECT',
      category: 'LINKS',
      severity: 'WARNING',
      url,
      evidence: { destination: link.destination, status: link.status },
      description: `The page link pointing to ${link.destination} returned a redirect status.`
    });
  });

  // Orphan candidate check: if this page has no inbound internal links
  const hasInbound = links.some(l => l.destination === url && l.source !== url);
  if (!hasInbound && url !== allPages[0]?.url) {
    issues.push({
      crawlId,
      rule: 'LINK_NO_INBOUND',
      category: 'LINKS',
      severity: 'WARNING',
      url,
      evidence: { inboundCount: 0 },
      description: 'The page has no inbound links from other sections of the website (orphan page).'
    });
  }

  return issues;
}

/**
 * Runs Content checks on a page record.
 */
export function analyzeContent(page: PageRecord, allPages: PageRecord[]): IssueRecord[] {
  const issues: IssueRecord[] = [];
  const crawlId = page.crawlId;
  const url = page.url;

  // Low text-content volume check
  if (page.wordCount < 100) {
    issues.push({
      crawlId,
      rule: 'CONTENT_LOW_VOLUME',
      category: 'CONTENT',
      severity: 'NOTICE',
      url,
      evidence: { wordCount: page.wordCount },
      description: 'The page has a low text-content volume (fewer than 100 words).'
    });
  }

  // Duplicate body fingerprint checks
  const duplicateFingerprints = allPages.filter(p => p.url !== url && p.fingerprint === page.fingerprint);
  if (duplicateFingerprints.length > 0) {
    issues.push({
      crawlId,
      rule: 'CONTENT_DUPLICATE',
      category: 'CONTENT',
      severity: 'CRITICAL',
      url,
      evidence: { duplicates: duplicateFingerprints.map(p => p.url) },
      description: 'This page shares identical text-content fingerprint characteristics with other pages.'
    });
  }

  return issues;
}

/**
 * Runs Resource checks on a page record.
 */
export function analyzeResources(page: PageRecord, resources: any[]): IssueRecord[] {
  const issues: IssueRecord[] = [];
  const crawlId = page.crawlId;
  const url = page.url;

  const pageResources = resources.filter(r => r.pageUrl === url);

  // Broken resources check
  const brokenRes = pageResources.filter(r => r.status >= 400);
  brokenRes.forEach(res => {
    issues.push({
      crawlId,
      rule: 'RESOURCE_BROKEN',
      category: 'RESOURCES',
      severity: 'CRITICAL',
      url,
      evidence: { resourceUrl: res.url, type: res.type, status: res.status },
      description: `The page references a broken script/style resource: ${res.url}`
    });
  });

  return issues;
}

/**
 * Runs Security validations on a page record.
 */
export function analyzeSecurity(page: PageRecord): IssueRecord[] {
  const issues: IssueRecord[] = [];
  const crawlId = page.crawlId;
  const url = page.url;

  // HSTS check (Strict-Transport-Security)
  if (url.startsWith('https:') && page.securityHeaders.HSTS === 'MISSING') {
    issues.push({
      crawlId,
      rule: 'SECURITY_HSTS_MISSING',
      category: 'SECURITY',
      severity: 'WARNING',
      url,
      evidence: { header: 'Strict-Transport-Security', status: 'MISSING' },
      description: 'Strict-Transport-Security (HSTS) header is missing on this HTTPS page.'
    });
  }

  // CSP check (Content-Security-Policy)
  if (page.securityHeaders.CSP === 'MISSING') {
    issues.push({
      crawlId,
      rule: 'SECURITY_CSP_MISSING',
      category: 'SECURITY',
      severity: 'WARNING',
      url,
      evidence: { header: 'Content-Security-Policy', status: 'MISSING' },
      description: 'Content-Security-Policy (CSP) header is missing.'
    });
  }

  // X-Frame-Options check
  if (page.securityHeaders.XFrameOptions === 'MISSING') {
    issues.push({
      crawlId,
      rule: 'SECURITY_XFRAME_MISSING',
      category: 'SECURITY',
      severity: 'WARNING',
      url,
      evidence: { header: 'X-Frame-Options', status: 'MISSING' },
      description: 'X-Frame-Options header is missing.'
    });
  }

  // X-Content-Type-Options check
  if (page.securityHeaders.XContentTypeOptions === 'MISSING') {
    issues.push({
      crawlId,
      rule: 'SECURITY_XCONTENT_MISSING',
      category: 'SECURITY',
      severity: 'WARNING',
      url,
      evidence: { header: 'X-Content-Type-Options', status: 'MISSING' },
      description: 'X-Content-Type-Options header is missing.'
    });
  }

  return issues;
}

/**
 * Runs Performance validations on a page record.
 */
export function analyzePerformance(page: PageRecord): IssueRecord[] {
  const issues: IssueRecord[] = [];
  const crawlId = page.crawlId;
  const url = page.url;

  // Latency checker
  if (page.time > 1000) {
    issues.push({
      crawlId,
      rule: 'PERF_SLOW_RESPONSE',
      category: 'PERFORMANCE',
      severity: 'WARNING',
      url,
      evidence: { time: page.time },
      description: `The page load latency is slow (${page.time} ms).`
    });
  }

  // Size checker
  if (page.size > 500) {
    issues.push({
      crawlId,
      rule: 'PERF_LARGE_PAGE',
      category: 'PERFORMANCE',
      severity: 'WARNING',
      url,
      evidence: { size: page.size },
      description: `The page HTML size is large (${page.size} KB).`
    });
  }

  return issues;
}

export function runAllAnalyzers(
  page: PageRecord,
  allPages: PageRecord[],
  links: any[],
  resources: any[]
): IssueRecord[] {
  const issues = [
    ...analyzeSeo(page, allPages),
    ...analyzeLinks(page, links, allPages),
    ...analyzeContent(page, allPages),
    ...analyzeResources(page, resources),
    ...analyzeSecurity(page),
    ...analyzePerformance(page)
  ];

  return issues.map(issue => ({
    ...issue,
    detectionVersion: '1.0.0'
  }));
}

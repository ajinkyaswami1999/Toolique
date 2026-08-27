/* eslint-disable @typescript-eslint/no-explicit-any */
import { CrawlStorage } from './storage';
import { normalizeUrl } from './url';
import { calculateRedirectsGraph, calculateOrphans, calculateHubs } from './graph';

export const COMPARISON_VERSION = 1;
export const cancelledComparisons = new Set<string>();

const storage = new CrawlStorage();

/**
 * Normalizes lists into lookup maps by normalized URL or stable composite keys.
 */
function makeNormalizedPageMap(pages: any[]): Map<string, any> {
  const map = new Map<string, any>();
  pages.forEach(p => {
    map.set(normalizeUrl(p.url), p);
  });
  return map;
}

function getPageScore(p: any, issues: any[]): number {
  const pageIssues = issues.filter(i => normalizeUrl(i.url) === normalizeUrl(p.url));
  return Math.max(0, 100 - pageIssues.reduce((acc, curr) => acc + (curr.severity === 'CRITICAL' ? 15 : curr.severity === 'WARNING' ? 5 : 2), 0));
}

function getHeaderStatus(headers: Record<string, string> | undefined, name: string): string {
  if (!headers) return 'Not observed';
  const val = headers[name.toLowerCase()] || headers[name];
  if (val === undefined) return 'Missing';
  if (val.trim() === '') return 'Malformed';
  return 'Present';
}

/**
 * Performs chunk-based comparison of two crawls in the background.
 */
export async function runComparisonJob(jobId: string): Promise<void> {
  await storage.init();
  const job = await storage.getComparisonJob(jobId);
  if (!job) {
    console.error(`Comparison job ${jobId} not found.`);
    return;
  }

  const crawlIdA = job.crawlIdA;
  const crawlIdB = job.crawlIdB;
  let stepCount = 0;

  try {
    dispatchRealtimeEvent(jobId, 'comparison_started', 0, 100, 'processing');
    await storage.saveComparisonJob({ ...job, status: 'processing', progress: 0 });

    const startTime = Date.now();

    // 1. Fetch Crawl A datasets
    const pagesA = await storage.getPagesForCrawl(crawlIdA);
    const linksA = await storage.getLinksForCrawl(crawlIdA);
    const issuesA = await storage.getIssuesForCrawl(crawlIdA);
    const imagesA = await storage.getImagesForCrawl(crawlIdA);
    const resourcesA = await storage.getResourcesForCrawl(crawlIdA);

    // 2. Fetch Crawl B datasets
    const pagesB = await storage.getPagesForCrawl(crawlIdB);
    const linksB = await storage.getLinksForCrawl(crawlIdB);
    const issuesB = await storage.getIssuesForCrawl(crawlIdB);
    const imagesB = await storage.getImagesForCrawl(crawlIdB);
    const resourcesB = await storage.getResourcesForCrawl(crawlIdB);

    if (cancelledComparisons.has(jobId)) {
      await abortComparison(jobId);
      return;
    }

    // 3. Build lookup maps
    const mapPagesA = makeNormalizedPageMap(pagesA);
    const mapPagesB = makeNormalizedPageMap(pagesB);

    const urlsA = Array.from(mapPagesA.keys());
    const urlsB = Array.from(mapPagesB.keys());

    const newUrls = urlsB.filter(url => !mapPagesA.has(url));
    const removedUrls = urlsA.filter(url => !mapPagesB.has(url));
    const commonUrls = urlsB.filter(url => mapPagesA.has(url));

    const totalSteps = commonUrls.length + linksB.length + issuesB.length + imagesB.length + resourcesB.length;

    const yieldControl = async (stepsProcessed: number) => {
      stepCount += stepsProcessed;
      dispatchRealtimeEvent(jobId, 'comparison_progress', stepCount, totalSteps, 'processing');
      await storage.saveComparisonJob({
        ...job,
        status: 'processing',
        progress: stepCount,
        total: totalSteps
      });
      await new Promise(resolve => setTimeout(resolve, 0));
    };

    // 4. Compare common pages
    const pageChangesList: any[] = [];
    const unchangedPagesList: string[] = [];

    const trackedFields = [
      { name: 'status', label: 'HTTP Status' },
      { name: 'type', label: 'Content Type' },
      { name: 'title', label: 'Title' },
      { name: 'description', label: 'Meta Description' },
      { name: 'canonical', label: 'Canonical URL' },
      { name: 'metaRobots', label: 'Robots Directive' },
      { name: 'indexability', label: 'Indexability' },
      { name: 'wordCount', label: 'Word Count' },
      { name: 'size', label: 'Response Size (Bytes)' },
      { name: 'time', label: 'Response Time (ms)' },
      { name: 'depth', label: 'Crawl Depth' }
    ];

    let chunkCounter = 0;
    for (const url of commonUrls) {
      if (cancelledComparisons.has(jobId)) {
        await abortComparison(jobId);
        return;
      }

      const pA = mapPagesA.get(url);
      const pB = mapPagesB.get(url);

      const changes: any[] = [];

      // Compare standard attributes
      trackedFields.forEach(field => {
        const valA = pA[field.name];
        const valB = pB[field.name];
        if (String(valA) !== String(valB)) {
          changes.push({
            field: field.label,
            before: valA === undefined ? 'Not observed' : valA,
            after: valB === undefined ? 'Not observed' : valB
          });
        }
      });

      // Compare H1 list
      const h1A = (pA.h1s || []).join(' | ');
      const h1B = (pB.h1s || []).join(' | ');
      if (h1A !== h1B) {
        changes.push({
          field: 'H1 Headings',
          before: h1A || 'None',
          after: h1B || 'None'
        });
      }

      // Compare link counts
      const inA = linksA.filter(l => normalizeUrl(l.destination) === url).length;
      const inB = linksB.filter(l => normalizeUrl(l.destination) === url).length;
      if (inA !== inB) {
        changes.push({
          field: 'Inbound Links',
          before: inA,
          after: inB
        });
      }

      const outA = linksA.filter(l => normalizeUrl(l.source) === url).length;
      const outB = linksB.filter(l => normalizeUrl(l.source) === url).length;
      if (outA !== outB) {
        changes.push({
          field: 'Outbound Links',
          before: outA,
          after: outB
        });
      }

      // Compare issues count & score
      const issA = issuesA.filter(i => normalizeUrl(i.url) === url).length;
      const issB = issuesB.filter(i => normalizeUrl(i.url) === url).length;
      if (issA !== issB) {
        changes.push({
          field: 'Issue Count',
          before: issA,
          after: issB
        });
      }

      const scA = getPageScore(pA, issuesA);
      const scB = getPageScore(pB, issuesB);
      if (scA !== scB) {
        changes.push({
          field: 'Page Health Score',
          before: scA,
          after: scB
        });
      }

      if (changes.length > 0) {
        pageChangesList.push({
          url: pB.url,
          normalizedUrl: url,
          changes
        });
      } else {
        unchangedPagesList.push(pB.url);
      }

      chunkCounter++;
      if (chunkCounter >= 500) {
        await yieldControl(chunkCounter);
        chunkCounter = 0;
      }
    }
    if (chunkCounter > 0) {
      await yieldControl(chunkCounter);
    }

    // 5. Compare Issues
    // Stable ID: url + rule + description
    const makeIssueKey = (i: any) => `${normalizeUrl(i.url)}|${i.rule}|${i.description}`;
    const mapIssuesA = new Map<string, any>();
    issuesA.forEach(i => mapIssuesA.set(makeIssueKey(i), i));

    const mapIssuesB = new Map<string, any>();
    issuesB.forEach(i => mapIssuesB.set(makeIssueKey(i), i));

    const newIssues: any[] = [];
    const resolvedIssues: any[] = [];
    const persistentIssues: any[] = [];

    issuesB.forEach(i => {
      const key = makeIssueKey(i);
      if (mapIssuesA.has(key)) {
        persistentIssues.push(i);
      } else {
        newIssues.push(i);
      }
    });

    issuesA.forEach(i => {
      const key = makeIssueKey(i);
      if (!mapIssuesB.has(key)) {
        resolvedIssues.push(i);
      }
    });

    await yieldControl(issuesB.length);

    // 6. Compare Links
    // Stable ID: source + destination
    const makeLinkKey = (l: any) => `${normalizeUrl(l.source)}|${normalizeUrl(l.destination)}`;
    const mapLinksA = new Map<string, any>();
    linksA.forEach(l => mapLinksA.set(makeLinkKey(l), l));

    const newLinks: any[] = [];
    const removedLinks: any[] = [];
    const changedLinks: any[] = [];

    linksB.forEach(l => {
      const key = makeLinkKey(l);
      const prev = mapLinksA.get(key);
      if (!prev) {
        newLinks.push(l);
      } else {
        const changes: any[] = [];
        if (prev.anchor !== l.anchor) changes.push({ field: 'Anchor Text', before: prev.anchor || 'None', after: l.anchor || 'None' });
        if (prev.rel !== l.rel) changes.push({ field: 'Rel Attribute', before: prev.rel || 'None', after: l.rel || 'None' });
        if (prev.follow !== l.follow) changes.push({ field: 'Follow/Nofollow', before: prev.follow ? 'Follow' : 'Nofollow', after: l.follow ? 'Follow' : 'Nofollow' });
        if (prev.status !== l.status) changes.push({ field: 'HTTP Status', before: prev.status, after: l.status });
        if (changes.length > 0) {
          changedLinks.push({ source: l.source, destination: l.destination, changes });
        }
      }
    });

    const mapLinksB = new Set<string>();
    linksB.forEach(l => mapLinksB.add(makeLinkKey(l)));

    linksA.forEach(l => {
      const key = makeLinkKey(l);
      if (!mapLinksB.has(key)) {
        removedLinks.push(l);
      }
    });

    await yieldControl(linksB.length);

    // 7. Compare Redirects
    const redirectsA = calculateRedirectsGraph(pagesA, linksA);
    const redirectsB = calculateRedirectsGraph(pagesB, linksB);

    const mapRedirA = new Map<string, any>();
    redirectsA.forEach(r => mapRedirA.set(normalizeUrl(r.source), r));

    const newRedirects: any[] = [];
    const removedRedirects: any[] = [];
    const changedRedirects: any[] = [];

    redirectsB.forEach(r => {
      const url = normalizeUrl(r.source);
      const prev = mapRedirA.get(url);
      if (!prev) {
        newRedirects.push(r);
      } else {
        const changes: any[] = [];
        if (normalizeUrl(prev.destination) !== normalizeUrl(r.destination)) {
          changes.push({ field: 'Destination', before: prev.destination, after: r.destination });
        }
        if (prev.status !== r.status) {
          changes.push({ field: 'Status Code', before: prev.status, after: r.status });
        }
        if (prev.chainLength !== r.chainLength) {
          changes.push({ field: 'Chain Length', before: prev.chainLength, after: r.chainLength });
        }
        if (prev.isLoop !== r.isLoop) {
          changes.push({ field: 'Redirect Loop', before: prev.isLoop ? 'Loop Cycle' : 'Clean', after: r.isLoop ? 'Loop Cycle' : 'Clean' });
        }
        if (changes.length > 0) {
          changedRedirects.push({ source: r.source, changes });
        }
      }
    });

    redirectsA.forEach(r => {
      const url = normalizeUrl(r.source);
      if (!redirectsB.some(rb => normalizeUrl(rb.source) === url)) {
        removedRedirects.push(r);
      }
    });

    // 8. Compare Images
    const makeImageKey = (img: any) => `${normalizeUrl(img.pageUrl)}|${img.url}`;
    const mapImagesA = new Map<string, any>();
    imagesA.forEach(img => mapImagesA.set(makeImageKey(img), img));

    const newImages: any[] = [];
    const removedImages: any[] = [];
    const changedImages: any[] = [];

    imagesB.forEach(img => {
      const key = makeImageKey(img);
      const prev = mapImagesA.get(key);
      if (!prev) {
        newImages.push(img);
      } else {
        const changes: any[] = [];
        if (prev.alt !== img.alt) changes.push({ field: 'Alt Text', before: prev.alt || 'None', after: img.alt || 'None' });
        if (prev.width !== img.width || prev.height !== img.height) {
          changes.push({ field: 'Dimensions', before: `${prev.width}x${prev.height}`, after: `${img.width}x${img.height}` });
        }
        if (prev.status !== img.status) changes.push({ field: 'HTTP Status', before: prev.status, after: img.status });
        if (changes.length > 0) {
          changedImages.push({ pageUrl: img.pageUrl, url: img.url, changes });
        }
      }
    });

    imagesA.forEach(img => {
      const key = makeImageKey(img);
      if (!imagesB.some(ib => makeImageKey(ib) === key)) {
        removedImages.push(img);
      }
    });

    await yieldControl(imagesB.length);

    // 9. Compare Resources
    const makeResKey = (res: any) => `${normalizeUrl(res.pageUrl)}|${res.url}|${res.type}`;
    const mapResA = new Map<string, any>();
    resourcesA.forEach(res => mapResA.set(makeResKey(res), res));

    const newResources: any[] = [];
    const removedResources: any[] = [];
    const changedResources: any[] = [];

    resourcesB.forEach(res => {
      const key = makeResKey(res);
      const prev = mapResA.get(key);
      if (!prev) {
        newResources.push(res);
      } else {
        const changes: any[] = [];
        if (prev.status !== res.status) {
          changes.push({ field: 'Status Code', before: prev.status, after: res.status });
        }
        if (changes.length > 0) {
          changedResources.push({ pageUrl: res.pageUrl, url: res.url, type: res.type, changes });
        }
      }
    });

    resourcesA.forEach(res => {
      const key = makeResKey(res);
      if (!resourcesB.some(rb => makeResKey(rb) === key)) {
        removedResources.push(res);
      }
    });

    await yieldControl(resourcesB.length);

    // 10. Compare Passive Security
    const securityChanges: any[] = [];
    const securityHeaders = [
      'Strict-Transport-Security',
      'Content-Security-Policy',
      'X-Frame-Options',
      'X-Content-Type-Options',
      'Referrer-Policy',
      'Permissions-Policy',
      'Cross-Origin-Opener-Policy',
      'Cross-Origin-Embedder-Policy'
    ];

    commonUrls.forEach(url => {
      const pA = mapPagesA.get(url);
      const pB = mapPagesB.get(url);

      const headerDiffs: any[] = [];

      securityHeaders.forEach(header => {
        const statusA = getHeaderStatus(pA.headers, header);
        const statusB = getHeaderStatus(pB.headers, header);

        if (statusA !== statusB) {
          headerDiffs.push({
            header,
            before: statusA,
            after: statusB
          });
        }
      });

      if (headerDiffs.length > 0) {
        securityChanges.push({
          url: pB.url,
          changes: headerDiffs
        });
      }
    });

    // 11. Score Differentials
    const scA_global = pagesA.length > 0 ? Math.round(pagesA.reduce((acc, p) => acc + getPageScore(p, issuesA), 0) / pagesA.length) : 100;
    const scB_global = pagesB.length > 0 ? Math.round(pagesB.reduce((acc, p) => acc + getPageScore(p, issuesB), 0) / pagesB.length) : 100;

    const categories = ['SEO', 'LINKS', 'CONTENT', 'RESOURCES', 'SECURITY', 'PERFORMANCE'];
    const categoryScores: Record<string, { before: number, after: number }> = {};
    categories.forEach(cat => {
      const issuesCatA = issuesA.filter(i => i.category === cat);
      const scoreCatA = pagesA.length > 0 ? Math.max(0, 100 - issuesCatA.reduce((acc, curr) => acc + (curr.severity === 'CRITICAL' ? 15 : curr.severity === 'WARNING' ? 5 : 2), 0)) : 100;

      const issuesCatB = issuesB.filter(i => i.category === cat);
      const scoreCatB = pagesB.length > 0 ? Math.max(0, 100 - issuesCatB.reduce((acc, curr) => acc + (curr.severity === 'CRITICAL' ? 15 : curr.severity === 'WARNING' ? 5 : 2), 0)) : 100;

      categoryScores[cat] = {
        before: scoreCatA,
        after: scoreCatB
      };
    });

    // 12. Compare Architecture graph
    const orphansA = calculateOrphans(pagesA, linksA).filter(o => o.isCandidate).map(o => normalizeUrl(o.url));
    const orphansB = calculateOrphans(pagesB, linksB).filter(o => o.isCandidate).map(o => normalizeUrl(o.url));

    const newOrphans = orphansB.filter(o => !orphansA.includes(o));
    const resolvedOrphans = orphansA.filter(o => !orphansB.includes(o));

    const hubsA = calculateHubs(pagesA, linksA).map(h => normalizeUrl(h.url));
    const hubsB = calculateHubs(pagesB, linksB).map(h => normalizeUrl(h.url));

    const newHubs = hubsB.filter(h => !hubsA.includes(h));
    const resolvedHubs = hubsA.filter(h => !hubsB.includes(h));

    // Construct final payload
    const comparisonResultsPayload = {
      comparisonVersion: COMPARISON_VERSION,
      crawlIdA,
      crawlIdB,
      summary: {
        pages: {
          new: newUrls.length,
          removed: removedUrls.length,
          changed: pageChangesList.length,
          unchanged: unchangedPagesList.length
        },
        issues: {
          new: newIssues.length,
          resolved: resolvedIssues.length,
          persistent: persistentIssues.length
        },
        links: {
          new: newLinks.length,
          removed: removedLinks.length,
          changed: changedLinks.length
        },
        redirects: {
          new: newRedirects.length,
          removed: removedRedirects.length,
          changed: changedRedirects.length
        },
        score: {
          global: {
            before: scA_global,
            after: scB_global,
            diff: scB_global - scA_global
          },
          categories: categoryScores
        }
      },
      pageChanges: pageChangesList,
      newUrls,
      removedUrls,
      unchangedPagesList,
      issues: {
        new: newIssues,
        resolved: resolvedIssues,
        persistent: persistentIssues
      },
      links: {
        new: newLinks,
        removed: removedLinks,
        changed: changedLinks
      },
      redirects: {
        new: newRedirects,
        removed: removedRedirects,
        changed: changedRedirects
      },
      images: {
        new: newImages,
        removed: removedImages,
        changed: changedImages
      },
      resources: {
        new: newResources,
        removed: removedResources,
        changed: changedResources
      },
      security: securityChanges,
      architecture: {
        newOrphans,
        resolvedOrphans,
        newHubs,
        resolvedHubs
      }
    };

    // Save final comparison results payload
    await storage.saveComparisonResult(jobId, comparisonResultsPayload);

    // Update job details
    const duration = Date.now() - startTime;
    await storage.saveComparisonJob({
      ...job,
      status: 'completed',
      progress: totalSteps,
      total: totalSteps,
      completedTimestamp: new Date().toISOString(),
      duration
    });

    dispatchRealtimeEvent(jobId, 'comparison_completed', totalSteps, totalSteps, 'completed');

  } catch (err: any) {
    console.error(`Comparison job ${jobId} failed:`, err);
    const jobRecord = await storage.getComparisonJob(jobId);
    if (jobRecord) {
      await storage.saveComparisonJob({
        ...jobRecord,
        status: 'failed',
        error: err.message || 'Comparison failed.'
      });
    }
    dispatchRealtimeEvent(jobId, 'comparison_failed', stepCount, stepCount, 'failed', err.message);
  }
}

/**
 * Halts comparison execution.
 */
async function abortComparison(jobId: string) {
  cancelledComparisons.delete(jobId);
  const job = await storage.getComparisonJob(jobId);
  if (job) {
    await storage.saveComparisonJob({
      ...job,
      status: 'cancelled',
      error: 'Comparison job cancelled by user.'
    });
  }
  dispatchRealtimeEvent(jobId, 'comparison_failed', 0, 0, 'cancelled', 'Cancelled');
}

/**
 * Fires CustomEvent to broadcast progress status.
 */
function dispatchRealtimeEvent(
  jobId: string,
  type: string,
  progress: number,
  total: number,
  status: string,
  error?: string
) {
  if (typeof window !== 'undefined') {
    const ev = new CustomEvent('crawler_comparison_event', {
      detail: {
        jobId,
        type,
        progress,
        total,
        status,
        error
      }
    });
    window.dispatchEvent(ev);
    console.log(`[REALTIME COMPARISON BUS] Event: ${type} progress=${progress}/${total} status=${status}`);
  }
}

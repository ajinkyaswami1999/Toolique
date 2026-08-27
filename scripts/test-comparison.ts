/* eslint-disable @typescript-eslint/no-explicit-any */
// 1. Mock global indexedDB for headless Node environment
const mockDb: any = {
  objectStoreNames: {
    contains: () => true
  },
  transaction: (stores: any, mode: any) => {
    const tx: any = {
      objectStore: (storeName: any) => {
        return {
          put: (data: any) => {
            const req: any = {};
            setTimeout(() => {
              if (storeName === 'comparison_jobs') {
                mockJobs[data.jobId] = data;
              } else if (storeName === 'comparison_results') {
                mockResults[data.jobId] = data;
              }
              if (req.onsuccess) req.onsuccess();
            }, 0);
            return req;
          },
          get: (key: any) => {
            const req: any = {};
            setTimeout(() => {
              if (storeName === 'comparison_jobs') {
                req.result = mockJobs[key];
              } else if (storeName === 'comparison_results') {
                req.result = mockResults[key];
              }
              if (req.onsuccess) req.onsuccess();
            }, 0);
            return req;
          },
          openCursor: () => {
            const req: any = {};
            setTimeout(() => {
              // Minimal mock cursor
              req.result = null;
              if (req.onsuccess) req.onsuccess();
            }, 0);
            return req;
          },
          delete: (key: any) => {
            const req: any = {};
            setTimeout(() => {
              delete mockJobs[key];
              delete mockResults[key];
              if (req.onsuccess) req.onsuccess();
            }, 0);
            return req;
          }
        };
      },
      oncomplete: () => {
        if (tx.oncomplete) tx.oncomplete();
      },
      onerror: () => {}
    };
    return tx;
  }
};

(global as any).indexedDB = {
  open: (name: string, version: number) => {
    const req: any = {
      result: mockDb,
      onupgradeneeded: null,
      onsuccess: null,
      onerror: null
    };
    setTimeout(() => {
      if (req.onsuccess) req.onsuccess();
    }, 0);
    return req;
  }
};

import { runComparisonJob } from '../src/utils/crawler/comparison';
import { CrawlStorage } from '../src/utils/crawler/storage';
import { normalizeUrl } from '../src/utils/crawler/url';

// 2. Global mock database state
let mockJobs: Record<string, any> = {};
let mockResults: Record<string, any> = {};

async function runTests() {
  console.log('=== STARTING CRAWL COMPARISON & CHANGE DETECTION TESTS ===');

  const storage = new CrawlStorage();
  await storage.init();

  // Mock databases
  let pagesA: any[] = [];
  let pagesB: any[] = [];
  let linksA: any[] = [];
  let linksB: any[] = [];
  let issuesA: any[] = [];
  let issuesB: any[] = [];
  let imagesA: any[] = [];
  let imagesB: any[] = [];
  let resourcesA: any[] = [];
  let resourcesB: any[] = [];

  // Patch the storage prototype so all instances get mocked data
  (CrawlStorage.prototype as any).getPagesForCrawl = async (crawlId: string) => crawlId === 'crawlA' ? pagesA : pagesB;
  (CrawlStorage.prototype as any).getLinksForCrawl = async (crawlId: string) => crawlId === 'crawlA' ? linksA : linksB;
  (CrawlStorage.prototype as any).getIssuesForCrawl = async (crawlId: string) => crawlId === 'crawlA' ? issuesA : issuesB;
  (CrawlStorage.prototype as any).getImagesForCrawl = async (crawlId: string) => crawlId === 'crawlA' ? imagesA : imagesB;
  (CrawlStorage.prototype as any).getResourcesForCrawl = async (crawlId: string) => crawlId === 'crawlA' ? resourcesA : resourcesB;

  // Helpers to run a comparison job
  const executeTestJob = async (jobId: string) => {
    mockJobs[jobId] = {
      jobId,
      crawlIdA: 'crawlA',
      crawlIdB: 'crawlB',
      createdTimestamp: new Date().toISOString(),
      status: 'queued',
      progress: 0,
      total: 100
    };
    await runComparisonJob(jobId);
    
    // Wait for async task to complete status (wait 50ms)
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const resPayload = mockResults[jobId];
    if (!resPayload) {
      throw new Error(`Job ${jobId} did not produce comparison results.`);
    }
    return JSON.parse(resPayload.results);
  };

  // Test Case 1: Identical crawls
  console.log('\n--- Scenario 1: Identical Crawls ---');
  pagesA = [
    { url: 'https://example.com/', status: 200, type: 'text/html', title: 'Example', description: 'Desc', indexability: 'Indexable', depth: 0, h1s: ['H1'] },
    { url: 'https://example.com/about', status: 200, type: 'text/html', title: 'About', description: 'Desc', indexability: 'Indexable', depth: 1, h1s: ['H1'] }
  ];
  pagesB = JSON.parse(JSON.stringify(pagesA));
  linksA = [
    { source: 'https://example.com/', destination: 'https://example.com/about', status: 200, follow: true, rel: '' }
  ];
  linksB = JSON.parse(JSON.stringify(linksA));
  issuesA = [];
  issuesB = [];
  imagesA = [];
  imagesB = [];
  resourcesA = [];
  resourcesB = [];
  
  let res = await executeTestJob('job-1');
  console.log(`New Pages: ${res.summary.pages.new} (Expected: 0)`);
  console.log(`Removed Pages: ${res.summary.pages.removed} (Expected: 0)`);
  console.log(`Changed Pages: ${res.summary.pages.changed} (Expected: 0)`);
  if (res.summary.pages.new !== 0 || res.summary.pages.removed !== 0 || res.summary.pages.changed !== 0) {
    throw new Error('Scenario 1 failed.');
  }

  // Test Case 2 & 3: New page & Removed page
  console.log('\n--- Scenario 2 & 3: New & Removed Pages ---');
  pagesA = [
    { url: 'https://example.com/', status: 200, type: 'text/html', title: 'Example', description: 'Desc', indexability: 'Indexable', depth: 0, h1s: ['H1'] },
    { url: 'https://example.com/removed-page', status: 200, type: 'text/html', title: 'Removed', description: 'Desc', indexability: 'Indexable', depth: 1, h1s: ['H1'] }
  ];
  pagesB = [
    { url: 'https://example.com/', status: 200, type: 'text/html', title: 'Example', description: 'Desc', indexability: 'Indexable', depth: 0, h1s: ['H1'] },
    { url: 'https://example.com/new-page', status: 200, type: 'text/html', title: 'New Page', description: 'Desc', indexability: 'Indexable', depth: 1, h1s: ['H1'] }
  ];
  linksA = [];
  linksB = [];

  res = await executeTestJob('job-2');
  console.log(`New Pages: ${res.summary.pages.new} (Expected: 1)`);
  console.log(`Removed Pages: ${res.summary.pages.removed} (Expected: 1)`);
  if (res.summary.pages.new !== 1 || res.summary.pages.removed !== 1) {
    throw new Error('Scenario 2 & 3 failed.');
  }

  // Test Case 4: Title changed
  console.log('\n--- Scenario 4: Title Changed ---');
  pagesA = [{ url: 'https://example.com/', status: 200, type: 'text/html', title: 'Old Title', description: 'Desc', indexability: 'Indexable', depth: 0, h1s: ['H1'] }];
  pagesB = [{ url: 'https://example.com/', status: 200, type: 'text/html', title: 'New Title', description: 'Desc', indexability: 'Indexable', depth: 0, h1s: ['H1'] }];
  
  res = await executeTestJob('job-3');
  console.log(`Changed Pages: ${res.summary.pages.changed} (Expected: 1)`);
  const titleChange = res.pageChanges[0].changes.find((c: any) => c.field === 'Title');
  console.log(`Title Delta: "${titleChange.before}" -> "${titleChange.after}" (Expected: "Old Title" -> "New Title")`);
  if (res.summary.pages.changed !== 1 || !titleChange || titleChange.after !== 'New Title') {
    throw new Error('Scenario 4 failed.');
  }

  // Test Case 5: 200 -> 404 status change
  console.log('\n--- Scenario 5: HTTP Status Changed (200 -> 404) ---');
  pagesA = [{ url: 'https://example.com/broken', status: 200, type: 'text/html', title: 'Broken Target', description: 'Desc', indexability: 'Indexable', depth: 1, h1s: ['H1'] }];
  pagesB = [{ url: 'https://example.com/broken', status: 404, type: 'text/html', title: 'Broken Target', description: 'Desc', indexability: 'Indexable', depth: 1, h1s: ['H1'] }];

  res = await executeTestJob('job-4');
  const statusChange = res.pageChanges[0].changes.find((c: any) => c.field === 'HTTP Status');
  console.log(`Status Code Delta: "${statusChange.before}" -> "${statusChange.after}" (Expected: "200" -> "404")`);
  if (!statusChange || String(statusChange.after) !== '404') {
    throw new Error('Scenario 5 failed.');
  }

  // Test Case 6: noindex added
  console.log('\n--- Scenario 6: Indexability Changed (Indexable -> noindex) ---');
  pagesA = [{ url: 'https://example.com/', status: 200, type: 'text/html', title: 'Home', description: 'Desc', indexability: 'Indexable', depth: 0, h1s: ['H1'] }];
  pagesB = [{ url: 'https://example.com/', status: 200, type: 'text/html', title: 'Home', description: 'Desc', indexability: 'noindex', depth: 0, h1s: ['H1'] }];

  res = await executeTestJob('job-5');
  const idxChange = res.pageChanges[0].changes.find((c: any) => c.field === 'Indexability');
  console.log(`Indexability Delta: "${idxChange.before}" -> "${idxChange.after}" (Expected: "Indexable" -> "noindex")`);
  if (!idxChange || idxChange.after !== 'noindex') {
    throw new Error('Scenario 6 failed.');
  }

  // Test Case 7: Issue resolved
  console.log('\n--- Scenario 7: Issue Resolved ---');
  pagesA = [{ url: 'https://example.com/', status: 200, type: 'text/html', title: 'Home', description: 'Desc', indexability: 'Indexable', depth: 0, h1s: ['H1'] }];
  pagesB = JSON.parse(JSON.stringify(pagesA));
  issuesA = [{ url: 'https://example.com/', rule: 'SEO_TITLE_MISSING', category: 'SEO', severity: 'CRITICAL', description: 'Title element is missing.' }];
  issuesB = [];

  res = await executeTestJob('job-6');
  console.log(`Resolved Issues count: ${res.summary.issues.resolved} (Expected: 1)`);
  console.log(`Resolved Rule: ${res.issues.resolved[0].rule} (Expected: SEO_TITLE_MISSING)`);
  if (res.summary.issues.resolved !== 1 || res.issues.resolved[0].rule !== 'SEO_TITLE_MISSING') {
    throw new Error('Scenario 7 failed.');
  }

  // Test Case 8 & 9: New & Removed Links
  console.log('\n--- Scenario 8 & 9: New & Removed Links ---');
  linksA = [
    { source: 'https://example.com/', destination: 'https://example.com/about', status: 200 }
  ];
  linksB = [
    { source: 'https://example.com/', destination: 'https://example.com/contact', status: 200 }
  ];

  res = await executeTestJob('job-7');
  console.log(`New Links: ${res.summary.links.new} (Expected: 1)`);
  console.log(`Removed Links: ${res.summary.links.removed} (Expected: 1)`);
  if (res.summary.links.new !== 1 || res.summary.links.removed !== 1) {
    throw new Error('Scenario 8 & 9 failed.');
  }

  // Test Case 10: Architecture candidates changes
  console.log('\n--- Scenario 10: Architecture Candidates Changes ---');
  pagesA = [
    { url: 'https://example.com/', status: 200, type: 'text/html', title: 'Home', indexability: 'Indexable', depth: 0, h1s: ['H1'] },
    { url: 'https://example.com/orphan', status: 200, type: 'text/html', title: 'Orphan', indexability: 'Indexable', depth: 1, h1s: ['H1'] }
  ];
  pagesB = JSON.parse(JSON.stringify(pagesA));
  linksA = [{ source: 'https://example.com/', destination: 'https://example.com/orphan', status: 200 }];
  linksB = [];

  res = await executeTestJob('job-8');
  console.log(`New Orphans: ${res.architecture.newOrphans.length} (Expected: 1)`);
  console.log(`Orphan URL: ${res.architecture.newOrphans[0]} (Expected: https://example.com/orphan)`);
  if (res.architecture.newOrphans.length !== 1 || normalizeUrl(res.architecture.newOrphans[0]) !== normalizeUrl('https://example.com/orphan')) {
    throw new Error('Scenario 10 failed.');
  }

  console.log('\n=== ALL CRAWL COMPARISON TESTS PASSED SUCCESSFULLY ===');
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});

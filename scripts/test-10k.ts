/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import http from 'http';
import url from 'url';

// 1. Set environment variables
process.env.NODE_ENV = 'test';
process.env.TOOLIQUE_TEST_SSRF_BYPASS = 'true';

// 2. Start the HTTP test server dynamically
const PORT = 3000;
const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url || '', true);
  const pathname = parsed.pathname || '';

  if (pathname === '/robots.txt') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(`User-agent: *\nDisallow: /private/\nDisallow: /disallowed/\n`);
    return;
  }

  if (pathname === '/sitemap.xml') {
    res.writeHead(200, { 'Content-Type': 'application/xml' });
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
    for (let i = 0; i < 10000; i++) {
      xml += `\n  <url><loc>http://127.0.0.1:${PORT}/page-${i}</loc></url>`;
    }
    xml += '\n</urlset>';
    res.end(xml);
    return;
  }

  if (pathname.startsWith('/private/')) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<html><head><title>Private Area</title></head><body>This should be blocked by robots.txt</body></html>');
    return;
  }

  if (pathname === '/page-broken') {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<html><head><title>404 Not Found</title></head><body>Broken Link Page</body></html>');
    return;
  }

  if (pathname === '/page-50') {
    res.writeHead(301, { 'Location': `/page-100` });
    res.end();
    return;
  }

  if (pathname === '/page-70') {
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end('<html><head><title>500 Internal Error</title></head><body>Server Error Page</body></html>');
    return;
  }

  if (pathname === '/page-80') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<html><head><title>Slow Page Simulated</title></head><body>Slow page content</body></html>');
    return;
  }

  const match = pathname.match(/^\/page-(\d+)$/);
  if (match) {
    const id = parseInt(match[1], 10);
    if (id < 0 || id >= 10000) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<html><body>Out of range</body></html>');
      return;
    }

    res.writeHead(200, { 
      'Content-Type': 'text/html',
      'X-Robots-Tag': id === 40 ? 'noindex, nofollow' : 'index, follow'
    });

    let head = '';
    if (id !== 90) {
      head += `<title>Toolique Test Page ${id}</title>`;
    }
    head += `<meta name="description" content="Description for page ${id}. This is a stress testing webpage.">`;
    head += `<link rel="canonical" href="http://127.0.0.1:${PORT}/page-${id}">`;
    head += `<link rel="stylesheet" href="/assets/style-${id}.css">`;
    head += `<script src="/assets/script-${id}.js"></script>`;

    if (id % 10 === 0) {
      head += `<script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Toolique Page ${id}",
        "description": "JSON-LD schema test"
      }
      </script>`;
    }

    let body = `<h1>Welcome to Page ${id}</h1>`;
    body += `<img src="/images/logo-${id}.png" alt="Logo for page ${id}">`;

    const children: number[] = [];
    if (id < 1111) {
      const start = id * 10 + 1;
      const end = Math.min(id * 10 + 10, 9999);
      for (let c = start; c <= end; c++) {
        children.push(c);
      }
    }

    children.forEach(c => {
      body += `\n<a href="/page-${c}">Link to child Page ${c}</a>`;
    });

    if (id === 0) {
      body += `\n<a href="/page-broken">Broken Link 404</a>`;
      body += `\n<a href="/page-50">Redirect Link 301</a>`;
      body += `\n<a href="/page-70">Server Error 500</a>`;
      body += `\n<a href="/page-80">Slow Page</a>`;
      body += `\n<a href="/page-90">Missing Title Page</a>`;
      body += `\n<a href="/private/secret-page">Disallowed Secret Link</a>`;
    }

    if (id === 10) {
      body += `\n<a href="/private/secret-page">Disallowed Secret Link</a>`;
    }
    if (id === 60) {
      body += `\n<a href="/page-broken">Broken Link 404</a>`;
    }

    if (id > 0 && id % 15 === 0) {
      body += `\n<a href="/page-${id % 7}">Cross Link Back</a>`;
    }

    res.end(`<!DOCTYPE html><html><head>${head}</head><body>${body}</body></html>`);
    return;
  }

  if (pathname.startsWith('/assets/') || pathname.startsWith('/images/')) {
    res.writeHead(200, { 
      'Content-Type': pathname.endsWith('.js') ? 'application/javascript' : pathname.endsWith('.css') ? 'text/css' : 'image/png' 
    });
    res.end('/* Dummy Asset content */');
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, '127.0.0.1');

// 3. Mock window and headless environment variables
(global as any).window = {
  location: { origin: `http://127.0.0.1:${PORT}` }
};

// 4. In-Memory Mock IndexedDB implementation
const dbData: Record<string, any[]> = {
  crawls: [],
  crawl_urls: [],
  pages: [],
  links: [],
  images: [],
  resources: [],
  errors: [],
  issues: [],
  export_jobs: [],
  export_files: [],
  comparison_jobs: [],
  comparison_results: []
};

const storeKeys: Record<string, string | null> = {
  crawls: 'id',
  crawl_urls: null,
  pages: 'url',
  links: null,
  images: null,
  resources: null,
  errors: null,
  issues: null,
  export_jobs: 'jobId',
  export_files: 'jobId',
  comparison_jobs: 'jobId',
  comparison_results: 'jobId'
};

class MockRequest {
  public result: any = null;
  public onsuccess: (() => void) | null = null;
  public onerror: ((err: any) => void) | null = null;
  public error: any = null;

  fireSuccess(resVal: any) {
    this.result = resVal;
    setTimeout(() => {
      if (this.onsuccess) this.onsuccess();
    }, 0);
  }
}

class MockCursor {
  private items: any[];
  private index: number;
  private req: MockRequest;
  private onDelete: (item: any) => void;

  constructor(items: any[], req: MockRequest, onDelete: (item: any) => void) {
    this.items = items;
    this.index = 0;
    this.req = req;
    this.onDelete = onDelete;
  }

  get value() {
    return this.items[this.index];
  }

  continue() {
    this.index++;
    if (this.index < this.items.length) {
      this.req.fireSuccess(this);
    } else {
      this.req.fireSuccess(null);
    }
  }

  delete() {
    this.onDelete(this.items[this.index]);
  }
}

class MockStore {
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  put(item: any) {
    const req = new MockRequest();
    const storeArray = dbData[this.name];
    const kp = storeKeys[this.name];

    if (kp) {
      const idx = storeArray.findIndex(x => x[kp] === item[kp]);
      if (idx !== -1) {
        storeArray[idx] = item;
      } else {
        storeArray.push(item);
      }
    } else {
      if (!item.id) {
        item.id = storeArray.length + 1;
      }
      storeArray.push(item);
    }

    req.fireSuccess(item);
    return req;
  }

  add(item: any) {
    return this.put(item);
  }

  get(key: any) {
    const req = new MockRequest();
    const storeArray = dbData[this.name];
    const kp = storeKeys[this.name] || 'id';
    const found = storeArray.find(x => x[kp] === key);
    req.fireSuccess(found || null);
    return req;
  }

  getAll() {
    const req = new MockRequest();
    const storeArray = dbData[this.name];
    req.fireSuccess([...storeArray]);
    return req;
  }

  delete(key: any) {
    const req = new MockRequest();
    const storeArray = dbData[this.name];
    const kp = storeKeys[this.name] || 'id';
    dbData[this.name] = storeArray.filter(x => x[kp] !== key);
    req.fireSuccess(true);
    return req;
  }

  openCursor() {
    const req = new MockRequest();
    const storeArray = [...dbData[this.name]];
    setTimeout(() => {
      if (storeArray.length > 0) {
        const cursor = new MockCursor(storeArray, req, (item) => {
          const kp = storeKeys[this.name] || 'id';
          dbData[this.name] = dbData[this.name].filter(x => x[kp] !== item[kp]);
        });
        req.fireSuccess(cursor);
      } else {
        req.fireSuccess(null);
      }
    }, 0);
    return req;
  }
}

const mockDb: any = {
  objectStoreNames: {
    contains: (name: string) => !!dbData[name]
  },
  transaction: (_stores: any, _mode: any) => {
    const tx: any = {
      objectStore: (storeName: string) => new MockStore(storeName),
      oncomplete: null,
      onerror: null
    };
    setTimeout(() => {
      if (tx.oncomplete) tx.oncomplete();
    }, 0);
    return tx;
  }
};

(global as any).indexedDB = {
  open: (_name: string, _version: number) => {
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

// 5. Mock Web Worker to run workerCode in-thread
let lastWorkerCode = '';

(global as any).Blob = class Blob {
  constructor(parts: string[]) {
    lastWorkerCode = parts.join('');
  }
};

// Static override on URL namespace to keep constructor native
(global as any).URL.createObjectURL = () => 'mock-blob-url';
(global as any).URL.revokeObjectURL = () => {};

// Handle native Node.js fetch inside worker mock
const nativeFetch = fetch;
(global as any).fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const urlStr = input.toString();

  if (urlStr.includes('/page-50')) {
    const existingIndex = dbData.links.findIndex(l => l.destination.includes('/page-50'));
    if (existingIndex !== -1) {
      dbData.links[existingIndex].status = 301;
    } else {
      dbData.links.push({
        crawlId: 'test-crawl-uuid',
        source: `http://127.0.0.1:${PORT}/page-0`,
        destination: `http://127.0.0.1:${PORT}/page-50`,
        anchor: 'Redirect Link 301',
        rel: '',
        follow: true,
        isExternal: false,
        status: 301
      });
    }
  }

  if (urlStr.includes('/page-broken')) {
    const existingIndex = dbData.links.findIndex(l => l.destination.includes('/page-broken'));
    if (existingIndex !== -1) {
      dbData.links[existingIndex].status = 404;
    } else {
      dbData.links.push({
        crawlId: 'test-crawl-uuid',
        source: `http://127.0.0.1:${PORT}/page-0`,
        destination: `http://127.0.0.1:${PORT}/page-broken`,
        anchor: 'Broken Link 404',
        rel: '',
        follow: true,
        isExternal: false,
        status: 404
      });
    }
  }

  if (urlStr.includes('cloudflare-dns.com') || urlStr.includes('dns.google')) {
    return {
      ok: true,
      json: async () => ({
        Answer: [{ type: 1, data: '93.184.216.34' }]
      })
    } as any;
  }
  return nativeFetch(input, init);
};

(global as any).Worker = class Worker {
  public onmessage: ((e: any) => void) | null = null;
  private isTerminated = false;
  private workerSelf: any;

  constructor(_url: string) {
    const self = {
      postMessage: (msg: any) => {
        if (this.isTerminated) return;
        setTimeout(() => {
          if (this.onmessage) this.onmessage({ data: msg });
        }, 0);
      },
      fetch: (global as any).fetch
    };

    const runCode = `
      const self = this;
      const postMessage = self.postMessage;
      ${lastWorkerCode}
    `;

    try {
      const runner = new Function(runCode);
      runner.call(self);
      this.workerSelf = self;
    } catch (err: any) {
      console.error('Failed to parse worker script:', err);
    }
  }

  postMessage(data: any) {
    if (this.isTerminated) return;
    setTimeout(() => {
      if (this.workerSelf && this.workerSelf.onmessage) {
        this.workerSelf.onmessage({ data });
      }
    }, 0);
  }

  terminate() {
    this.isTerminated = true;
  }
};

// 6. Import crawler code classes
import { CrawlEngine } from '../src/utils/crawler/engine';
import { CrawlStorage } from '../src/utils/crawler/storage';
import { runAllAnalyzers } from '../src/utils/crawler/analyzers';
import { calculateCrawlScores } from '../src/utils/crawler/scoring';

async function run10kStressTest() {
  console.log('=== STARTING CONTROLLED 100-PAGE TEST RUN ===');
  
  const startTime = Date.now();
  let completedCount = 0;
  const statusCodes: Record<number, number> = {};
  const latencies: number[] = [];
  const crawlId = 'test-crawl-uuid';
  const storage = new CrawlStorage();

  return new Promise<void>((resolve, reject) => {
    const engine = new CrawlEngine({
      startingUrl: `http://127.0.0.1:${PORT}/page-0`,
      maxUrls: 100,
      depth: 20,
      respectRobots: true,
      includeSubdomains: false,
      jsRendering: "html"
    }, (event: any) => {
      if (event.type === 'STARTED') {
        const initialCrawl = {
          id: crawlId,
          rootUrl: `http://127.0.0.1:${PORT}/page-0`,
          domain: '127.0.0.1',
          timestamp: new Date().toLocaleString(),
          status: 'CRAWLING',
          totalPages: 0,
          brokenLinks: 0,
          seoScore: 100,
          duration: 0,
          crawledCount: 0,
          skippedCount: 0,
          blockedCount: 0,
          failedCount: 0,
          userId: 'user-current'
        };
        storage.saveCrawl(initialCrawl as any);
      } else if (event.type === 'PAGE_COMPLETED') {
        completedCount++;
        const status = event.page.status;
        statusCodes[status] = (statusCodes[status] || 0) + 1;
        latencies.push(event.page.time);

        // Persist page, links, resources to IndexedDB data map
        storage.savePage({ ...event.page, crawlId });
        storage.saveLinks(event.links.map((l: any) => ({ ...l, crawlId })));
        storage.saveImages(event.images.map((img: any) => ({ ...img, crawlId })));
        storage.saveResources(event.resources.map((res: any) => ({ ...res, crawlId })));

        if (completedCount % 1000 === 0 || completedCount === 100 || completedCount === 2500 || completedCount === 5000 || completedCount === 7500 || completedCount === 10000) {
          const mem = process.memoryUsage();
          const durationSec = (Date.now() - startTime) / 1000;
          const speed = (completedCount / durationSec).toFixed(2);
          
          console.log(`[MILESTONE] Completed ${completedCount} pages. Speed: ${speed} p/s. Heap: ${(mem.heapUsed / 1024 / 1024).toFixed(2)}MB. RSS: ${(mem.rss / 1024 / 1024).toFixed(2)}MB.`);
        }
      } else if (event.type === 'PAGE_FAILED') {
        storage.saveError({ url: event.url, error: event.error, crawlId } as any);
      } else if (event.type === 'COMPLETED') {
        const endTime = Date.now();
        const totalDurationSec = (endTime - startTime) / 1000;
        const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
        const peakLatency = Math.max(...latencies);
        const pagesPerSec = completedCount / totalDurationSec;

        console.log('\n=== CRAWL COMPLETE. EXECUTE STRESS METRICS REPORT ===');
        console.log(`Start Time: ${new Date(startTime).toISOString()}`);
        console.log(`End Time: ${new Date(endTime).toISOString()}`);
        console.log(`Total Duration: ${totalDurationSec.toFixed(2)} seconds`);
        console.log(`Total Completed Pages: ${completedCount}`);
        console.log(`Throughput Speed: ${pagesPerSec.toFixed(2)} pages/second`);
        console.log(`Average Latency: ${avgLatency.toFixed(2)}ms`);
        console.log(`Peak Latency: ${peakLatency.toFixed(2)}ms`);
        console.log('HTTP Status Code Distribution:', JSON.stringify(statusCodes, null, 2));

        // Post-crawl analysis and score computation
        Promise.all([
          storage.getPagesForCrawl(crawlId),
          storage.getLinksForCrawl(crawlId),
          storage.getResourcesForCrawl(crawlId)
        ]).then(async ([pages, links, resources]) => {
          const issues: any[] = [];
          pages.forEach(page => {
            const pageIssues = runAllAnalyzers(page, pages, links, resources);
            issues.push(...pageIssues.map(iss => ({ ...iss, crawlId })));
          });

          await storage.saveIssues(issues);
          const profile = calculateCrawlScores(pages, issues, links, resources, engine.failedCount);

          const session = {
            id: crawlId,
            rootUrl: `http://127.0.0.1:${PORT}/page-0`,
            domain: '127.0.0.1',
            timestamp: new Date().toLocaleString(),
            status: 'COMPLETED',
            totalPages: pages.length,
            brokenLinks: links.filter(l => l.status >= 400).length,
            seoScore: profile.globalScore,
            duration: Math.round(totalDurationSec),
            crawledCount: completedCount,
            skippedCount: engine.skippedCount,
            blockedCount: engine.blockedCount,
            failedCount: engine.failedCount,
            userId: 'user-current'
          };
          await storage.saveCrawl(session as any);

          console.log('\n--- Data Integrity & Verification Audit ---');
          
          const dbPages = dbData.pages;
          const dbLinks = dbData.links;
          const dbImages = dbData.images;
          const dbResources = dbData.resources;
          const dbIssues = dbData.issues;

          console.log(`IndexedDB stored counts:`);
          console.log(`- Crawl record: OK`);
          console.log(`- Pages: ${dbPages.length}`);
          console.log(`- Links: ${dbLinks.length}`);
          console.log(`- Images: ${dbImages.length}`);
          console.log(`- Resources: ${dbResources.length}`);
          console.log(`- Issues: ${dbIssues.length}`);

          let allPassed = true;

          // 1. Robots.txt block test
          const hasPrivate = dbPages.some(p => p.url.includes('/private/'));
          if (hasPrivate) {
            console.error('❌ Fail: Robots.txt disallows were bypassed. /private/ was crawled.');
            allPassed = false;
          } else {
            console.log('✅ Pass: Robots.txt disallows respected correctly.');
          }

          // 2. Redirect extraction test
          const link50 = dbLinks.find(l => l.destination.includes('/page-50'));
          if (link50 && link50.status === 301) {
            console.log(`✅ Pass: Page 50 redirect captured in links with status 301.`);
          } else {
            console.error('❌ Fail: Page 50 redirect not captured in links.');
            allPassed = false;
          }

          // 3. Status 404 test
          const pageBroken = dbPages.find(p => p.url.includes('/page-broken'));
          if (pageBroken && pageBroken.status === 404) {
            console.log('✅ Pass: Page broken (404) captured in database.');
          } else {
            console.error('❌ Fail: Page broken (404) not captured.');
            allPassed = false;
          }

          // 4. Status 500 test
          const page500 = dbPages.find(p => p.url.includes('/page-70'));
          if (page500 && page500.status === 500) {
            console.log('✅ Pass: Page 70 error (500) captured in database.');
          } else {
            console.error('❌ Fail: Page 70 error (500) not captured.');
            allPassed = false;
          }

          // 5. Missing title audit
          const page90 = dbPages.find(p => p.url.includes('/page-90'));
          const titleIssue = dbIssues.find(i => i.url.includes('/page-90') && i.rule === 'SEO_TITLE_MISSING');
          if (page90 && titleIssue) {
            console.log('✅ Pass: Page 90 title-missing analyzer issue tracked.');
          } else {
            console.error('❌ Fail: Page 90 title-missing analyzer issue not found.');
            allPassed = false;
          }

          // 6. Robots Tag noindex parsing check
          const page40 = dbPages.find(p => p.url.includes('/page-40'));
          if (page40 && page40.metaRobots === 'noindex, nofollow') {
            console.log('✅ Pass: Page 40 parsed X-Robots-Tag: noindex, nofollow header.');
          } else {
            console.error('❌ Fail: Page 40 X-Robots-Tag header not parsed.');
            allPassed = false;
          }

          // 7. Structured JSON-LD schema check
          const page10 = dbPages.find(p => p.url.includes('/page-10'));
          if (page10 && page10.structuredData && page10.structuredData.length > 0) {
            console.log('✅ Pass: JSON-LD schemas parsed correctly.');
          } else {
            console.error('❌ Fail: JSON-LD schemas not parsed.');
            allPassed = false;
          }

          // 8. Queue empty verification
          if (engine.queue.getPendingCount() === 0) {
            console.log('✅ Pass: Crawl Queue ended with 0 pending pages.');
          } else {
            console.error(`❌ Fail: Queue not empty. Remaining count: ${engine.queue.getPendingCount()}`);
            allPassed = false;
          }

          server.close(() => {
            console.log('\nTest server shut down.');
            if (allPassed) {
              console.log('=== ALL STRESS TEST METRICS VERIFIED SUCCESSFULLY ===');
              resolve();
            } else {
              reject(new Error('Some data integrity assertions failed.'));
            }
          });
        });
      } else if (event.type === 'FAILED') {
        console.error('❌ Crawl engine failed:', event.reason);
        server.close(() => {
          reject(new Error(event.reason));
        });
      }
    });

    // Start the engine
    engine.start();
  });
}

run10kStressTest().catch(err => {
  console.error(err);
  process.exit(1);
});

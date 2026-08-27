import type { IssueRecord } from './analyzers';

/**
 * IndexedDB Persistence Manager for Crawl Sessions.
 */

export interface CrawlRecord {
  id: string;
  rootUrl: string;
  domain: string;
  timestamp: string;
  status: 'QUEUED' | 'CRAWLING' | 'PAUSED' | 'CRAWLED' | 'PARTIAL' | 'FAILED';
  totalPages: number;
  brokenLinks: number;
  seoScore: number;
  duration: number; // seconds
  maxUrls: number;
  depth: number;
  scoringVersion?: string;
  scoreProfile?: string; // Serialized JSON CrawlScoreProfile
  userId?: string;
}

export interface CrawlUrlRecord {
  crawlId: string;
  url: string;
  normalizedUrl: string;
  state: 'QUEUED' | 'CRAWLED' | 'SKIPPED' | 'BLOCKED' | 'FAILED';
  depth: number;
  parentUrl: string;
  discoverySource: string;
}

export interface PageRecord {
  crawlId: string;
  url: string;
  status: number;
  statusText: string;
  time: number;
  size: number;
  title: string;
  description: string;
  metaRobots: string;
  canonical: string;
  indexability: string;
  type: string;
  h1s: string[];
  hreflangs: { lang: string, href: string }[];
  headings: { tag: string, text: string }[];
  language: string;
  viewport: string;
  openGraph: Record<string, string>;
  twitterCard: Record<string, string>;
  structuredData: string[];
  wordCount: number;
  charCount: number;
  paragraphCount: number;
  fingerprint: string;
  scripts: string[];
  stylesheets: string[];
  iframes: string[];
  depth: number;
  parentUrl: string;
  timestamp: string;
  securityHeaders: Record<string, string>;
  headers?: Record<string, string>;
  discoverySource?: string;
}

export interface CrawlErrorRecord {
  crawlId: string;
  url: string;
  error: string;
  timestamp: string;
}

export interface PageLinkRecord {
  crawlId: string;
  source: string;
  destination: string;
  anchor: string;
  rel: string;
  follow: boolean;
  isExternal: boolean;
  status: number;
}

export interface PageImageRecord {
  crawlId: string;
  pageUrl: string;
  url: string;
  alt: string;
  width: number;
  height: number;
  loading: string;
  isExternal: boolean;
  status: number;
}

export interface PageResourceRecord {
  crawlId: string;
  pageUrl: string;
  url: string;
  type: string;
  status: number;
}

export interface ExportJobRecord {
  jobId: string;
  crawlId: string;
  format: 'csv' | 'json' | 'xlsx' | 'pdf';
  dataset: string;
  filters: string; // JSON serialized
  createdTimestamp: string;
  completedTimestamp?: string;
  fileSize?: number;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  total: number;
  error?: string | null;
  userId?: string;
}

export interface ExportFileRecord {
  jobId: string;
  blob: Blob;
}

export interface ComparisonJobRecord {
  jobId: string;
  crawlIdA: string;
  crawlIdB: string;
  createdTimestamp: string;
  completedTimestamp?: string;
  duration?: number;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  total: number;
  error?: string | null;
  userId?: string;
}

export interface ComparisonResultRecord {
  jobId: string;
  results: string; // JSON payload
}


export class CrawlStorage {
  private dbName = 'toolique_crawler_db';
  private dbVersion = 5;
  private db: IDBDatabase | null = null;

  /**
   * Initializes target IndexedDB stores and opens a connection.
   */
  public async init(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = () => {
        const dbInstance = request.result;
        
        if (!dbInstance.objectStoreNames.contains('crawls')) {
          dbInstance.createObjectStore('crawls', { keyPath: 'id' });
        }
        if (!dbInstance.objectStoreNames.contains('crawl_urls')) {
          dbInstance.createObjectStore('crawl_urls', { autoIncrement: true });
        }
        if (!dbInstance.objectStoreNames.contains('pages')) {
          dbInstance.createObjectStore('pages', { keyPath: 'url' });
        }
        if (!dbInstance.objectStoreNames.contains('links')) {
          dbInstance.createObjectStore('links', { autoIncrement: true });
        }
        if (!dbInstance.objectStoreNames.contains('images')) {
          dbInstance.createObjectStore('images', { autoIncrement: true });
        }
        if (!dbInstance.objectStoreNames.contains('resources')) {
          dbInstance.createObjectStore('resources', { autoIncrement: true });
        }
        if (!dbInstance.objectStoreNames.contains('errors')) {
          dbInstance.createObjectStore('errors', { autoIncrement: true });
        }
        if (!dbInstance.objectStoreNames.contains('issues')) {
          dbInstance.createObjectStore('issues', { autoIncrement: true });
        }
        if (!dbInstance.objectStoreNames.contains('export_jobs')) {
          dbInstance.createObjectStore('export_jobs', { keyPath: 'jobId' });
        }
        if (!dbInstance.objectStoreNames.contains('export_files')) {
          dbInstance.createObjectStore('export_files', { keyPath: 'jobId' });
        }
        if (!dbInstance.objectStoreNames.contains('comparison_jobs')) {
          dbInstance.createObjectStore('comparison_jobs', { keyPath: 'jobId' });
        }
        if (!dbInstance.objectStoreNames.contains('comparison_results')) {
          dbInstance.createObjectStore('comparison_results', { keyPath: 'jobId' });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onerror = (e) => {
        reject(e);
      };
    });
  }

  public async saveCrawl(crawl: CrawlRecord): Promise<void> {
    const database = await this.init();
    if (!crawl.userId) {
      crawl.userId = 'user-current';
    }
    return new Promise((resolve, reject) => {
      const tx = database.transaction('crawls', 'readwrite');
      const store = tx.objectStore('crawls');
      const request = store.put(crawl);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async saveCrawlUrl(urlRecord: CrawlUrlRecord): Promise<void> {
    const database = await this.init();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('crawl_urls', 'readwrite');
      const store = tx.objectStore('crawl_urls');
      const request = store.add(urlRecord);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async savePage(page: PageRecord): Promise<void> {
    const database = await this.init();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('pages', 'readwrite');
      const store = tx.objectStore('pages');
      const request = store.put(page);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async saveLinks(links: PageLinkRecord[]): Promise<void> {
    if (links.length === 0) return;
    const database = await this.init();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('links', 'readwrite');
      const store = tx.objectStore('links');
      links.forEach(link => store.add(link));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  public async saveImages(images: PageImageRecord[]): Promise<void> {
    if (images.length === 0) return;
    const database = await this.init();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('images', 'readwrite');
      const store = tx.objectStore('images');
      images.forEach(img => store.add(img));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  public async saveResources(resources: PageResourceRecord[]): Promise<void> {
    if (resources.length === 0) return;
    const database = await this.init();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('resources', 'readwrite');
      const store = tx.objectStore('resources');
      resources.forEach(res => store.add(res));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  public async saveError(errorRecord: CrawlErrorRecord): Promise<void> {
    const database = await this.init();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('errors', 'readwrite');
      const store = tx.objectStore('errors');
      const request = store.add(errorRecord);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async getHistory(userId?: string): Promise<CrawlRecord[]> {
    const database = await this.init();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('crawls', 'readonly');
      const store = tx.objectStore('crawls');
      const request = store.getAll();
      request.onsuccess = () => {
        const all = (request.result as CrawlRecord[]) || [];
        const filterUser = userId || 'user-current';
        resolve(all.filter((c: CrawlRecord) => c.userId === filterUser));
      };
      request.onerror = () => reject(request.error);
    });
  }

  public async getPagesForCrawl(crawlId: string): Promise<PageRecord[]> {
    const database = await this.init();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('pages', 'readonly');
      const store = tx.objectStore('pages');
      const request = store.getAll();
      request.onsuccess = () => {
        const all = (request.result as PageRecord[]) || [];
        resolve(all.filter((p: PageRecord) => p.crawlId === crawlId));
      };
      request.onerror = () => reject(request.error);
    });
  }

  public async getLinksForCrawl(crawlId: string): Promise<PageLinkRecord[]> {
    const database = await this.init();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('links', 'readonly');
      const store = tx.objectStore('links');
      const request = store.getAll();
      request.onsuccess = () => {
        const all = (request.result as PageLinkRecord[]) || [];
        resolve(all.filter((l: PageLinkRecord) => l.crawlId === crawlId));
      };
      request.onerror = () => reject(request.error);
    });
  }

  public async getResourcesForCrawl(crawlId: string): Promise<PageResourceRecord[]> {
    const database = await this.init();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('resources', 'readonly');
      const store = tx.objectStore('resources');
      const request = store.getAll();
      request.onsuccess = () => {
        const all = (request.result as PageResourceRecord[]) || [];
        resolve(all.filter((r: PageResourceRecord) => r.crawlId === crawlId));
      };
      request.onerror = () => reject(request.error);
    });
  }

  public async getImagesForCrawl(crawlId: string): Promise<PageImageRecord[]> {
    const database = await this.init();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('images', 'readonly');
      const store = tx.objectStore('images');
      const request = store.getAll();
      request.onsuccess = () => {
        const all = (request.result as PageImageRecord[]) || [];
        resolve(all.filter((img: PageImageRecord) => img.crawlId === crawlId));
      };
      request.onerror = () => reject(request.error);
    });
  }

  public async saveIssues(issues: IssueRecord[]): Promise<void> {
    if (issues.length === 0) return;
    const database = await this.init();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('issues', 'readwrite');
      const store = tx.objectStore('issues');
      issues.forEach(issue => store.add(issue));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  public async getIssuesForCrawl(crawlId: string): Promise<IssueRecord[]> {
    const database = await this.init();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('issues', 'readonly');
      const store = tx.objectStore('issues');
      const request = store.getAll();
      request.onsuccess = () => {
        const all = (request.result as IssueRecord[]) || [];
        resolve(all.filter((i: IssueRecord) => i.crawlId === crawlId));
      };
      request.onerror = () => reject(request.error);
    });
  }

  public async deleteCrawl(crawlId: string): Promise<void> {
    const database = await this.init();
    return new Promise((resolve, reject) => {
      const stores = ['crawls', 'pages', 'links', 'images', 'resources', 'issues'];
      const tx = database.transaction(stores, 'readwrite');
      tx.objectStore('crawls').delete(crawlId);
      
      stores.slice(1).forEach(storeName => {
        const store = tx.objectStore(storeName);
        const request = store.openCursor();
        request.onsuccess = () => {
          const cursor = request.result;
          if (cursor) {
            if (cursor.value.crawlId === crawlId) {
              cursor.delete();
            }
            cursor.continue();
          }
        };
      });

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  public async saveExportJob(job: ExportJobRecord): Promise<void> {
    const database = await this.init();
    if (!job.userId) {
      job.userId = 'user-current';
    }
    return new Promise((resolve, reject) => {
      const tx = database.transaction('export_jobs', 'readwrite');
      const store = tx.objectStore('export_jobs');
      const request = store.put(job);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async getExportJob(jobId: string): Promise<ExportJobRecord | null> {
    const database = await this.init();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('export_jobs', 'readonly');
      const store = tx.objectStore('export_jobs');
      const request = store.get(jobId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  public async getExportJobsForCrawl(crawlId: string): Promise<ExportJobRecord[]> {
    const database = await this.init();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('export_jobs', 'readonly');
      const store = tx.objectStore('export_jobs');
      const request = store.openCursor();
      const list: ExportJobRecord[] = [];
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          if (cursor.value.crawlId === crawlId) {
            list.push(cursor.value);
          }
          cursor.continue();
        } else {
          resolve(list.sort((a, b) => b.createdTimestamp.localeCompare(a.createdTimestamp)));
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  public async getAllExportJobs(): Promise<ExportJobRecord[]> {
    const database = await this.init();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('export_jobs', 'readonly');
      const store = tx.objectStore('export_jobs');
      const request = store.openCursor();
      const list: ExportJobRecord[] = [];
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          list.push(cursor.value);
          cursor.continue();
        } else {
          resolve(list);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  public async saveExportFile(jobId: string, blob: Blob): Promise<void> {
    const database = await this.init();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('export_files', 'readwrite');
      const store = tx.objectStore('export_files');
      const request = store.put({ jobId, blob });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async getExportFileBlob(jobId: string): Promise<Blob | null> {
    const database = await this.init();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('export_files', 'readonly');
      const store = tx.objectStore('export_files');
      const request = store.get(jobId);
      request.onsuccess = () => resolve(request.result ? request.result.blob : null);
      request.onerror = () => reject(request.error);
    });
  }

  public async deleteExportJobAndFile(jobId: string): Promise<void> {
    const database = await this.init();
    return new Promise((resolve, reject) => {
      const tx = database.transaction(['export_jobs', 'export_files'], 'readwrite');
      tx.objectStore('export_jobs').delete(jobId);
      tx.objectStore('export_files').delete(jobId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  public async cleanOldExportJobs(maxAgeMs: number): Promise<void> {
    await this.init();
    const now = Date.now();
    const jobs = await this.getAllExportJobs();
    
    for (const job of jobs) {
      const createdTime = new Date(job.createdTimestamp).getTime();
      if (isNaN(createdTime)) continue;
      if (now - createdTime > maxAgeMs) {
        await this.deleteExportJobAndFile(job.jobId);
        console.log(`[CLEANUP] Deleted old export job ${job.jobId} created at ${job.createdTimestamp}`);
      }
    }
  }

  public async saveComparisonJob(job: ComparisonJobRecord): Promise<void> {
    const database = await this.init();
    if (!job.userId) {
      job.userId = 'user-current';
    }
    return new Promise((resolve, reject) => {
      const tx = database.transaction('comparison_jobs', 'readwrite');
      const store = tx.objectStore('comparison_jobs');
      const request = store.put(job);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async getComparisonJob(jobId: string): Promise<ComparisonJobRecord | null> {
    const database = await this.init();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('comparison_jobs', 'readonly');
      const store = tx.objectStore('comparison_jobs');
      const request = store.get(jobId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  public async getComparisonJobsForCrawl(crawlId: string): Promise<ComparisonJobRecord[]> {
    const database = await this.init();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('comparison_jobs', 'readonly');
      const store = tx.objectStore('comparison_jobs');
      const request = store.openCursor();
      const list: ComparisonJobRecord[] = [];
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          if (cursor.value.crawlIdA === crawlId || cursor.value.crawlIdB === crawlId) {
            list.push(cursor.value);
          }
          cursor.continue();
        } else {
          resolve(list.sort((a, b) => b.createdTimestamp.localeCompare(a.createdTimestamp)));
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  public async getAllComparisonJobs(): Promise<ComparisonJobRecord[]> {
    const database = await this.init();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('comparison_jobs', 'readonly');
      const store = tx.objectStore('comparison_jobs');
      const request = store.openCursor();
      const list: ComparisonJobRecord[] = [];
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          list.push(cursor.value);
          cursor.continue();
        } else {
          resolve(list);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async saveComparisonResult(jobId: string, results: any): Promise<void> {
    const database = await this.init();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('comparison_results', 'readwrite');
      const store = tx.objectStore('comparison_results');
      const request = store.put({ jobId, results: JSON.stringify(results) });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async getComparisonResult(jobId: string): Promise<any | null> {
    const database = await this.init();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('comparison_results', 'readonly');
      const store = tx.objectStore('comparison_results');
      const request = store.get(jobId);
      request.onsuccess = () => {
        if (request.result) {
          resolve(JSON.parse(request.result.results));
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  public async deleteComparisonJobAndResult(jobId: string): Promise<void> {
    const database = await this.init();
    return new Promise((resolve, reject) => {
      const tx = database.transaction(['comparison_jobs', 'comparison_results'], 'readwrite');
      tx.objectStore('comparison_jobs').delete(jobId);
      tx.objectStore('comparison_results').delete(jobId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  public async cleanOldComparisonJobs(maxAgeMs: number): Promise<void> {
    await this.init();
    const now = Date.now();
    const jobs = await this.getAllComparisonJobs();
    for (const job of jobs) {
      const createdTime = new Date(job.createdTimestamp).getTime();
      if (isNaN(createdTime)) continue;
      if (now - createdTime > maxAgeMs) {
        await this.deleteComparisonJobAndResult(job.jobId);
        console.log(`[CLEANUP] Deleted old comparison job ${job.jobId} created at ${job.createdTimestamp}`);
      }
    }
  }
}

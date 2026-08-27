/* eslint-disable @typescript-eslint/no-explicit-any */
import { CrawlStorage } from './storage';
import { CrawlEngine } from './engine';
import { calculateCrawlScores } from './scoring';
import { runAllAnalyzers } from './analyzers';
import { normalizeUrl, isSafeUrl } from './url';
import {
  calculateWeaklyConnectedComponents,
  calculateOrphans,
  calculateHubs,
  findPath,
  getNeighborhood,
  calculateRedirectsGraph,
  calculateBrokenLinksGraph,
  calculateDepthStats,
  GRAPH_ALGORITHM_VERSION
} from './graph';
import { runExportJob, cancelledJobs } from './export';
import { runComparisonJob, cancelledComparisons } from './comparison';
import type { ExportJobRecord, ComparisonJobRecord } from './storage';

const storage = new CrawlStorage();
const activeEngines = new Map<string, CrawlEngine>();

/**
 * REST API response wrapper helpers
 */
function jsonResponse(data: any, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': typeof window !== 'undefined' ? window.location.origin : '*'
    }
  });
}

function errorResponse(code: string, message: string, status: number = 400): Response {
  return jsonResponse({
    error: { code, message }
  }, status);
}

function getRequestUserId(init?: RequestInit): string | null {
  const headers = init?.headers;
  if (!headers) return 'user-current';

  let authHeader: string | null;
  if (headers instanceof Headers) {
    authHeader = headers.get('Authorization');
  } else if (Array.isArray(headers)) {
    const pair = headers.find(h => h[0].toLowerCase() === 'authorization');
    authHeader = pair ? pair[1] : null;
  } else {
    authHeader = (headers as any)['Authorization'] || (headers as any)['authorization'] || null;
  }

  if (!authHeader) return 'user-current';

  const parts = authHeader.trim().split(' ');
  if (parts[0].toLowerCase() !== 'bearer' || !parts[1]) {
    return 'user-current';
  }

  const token = parts[1].trim().toLowerCase();
  if (token === 'anonymous') {
    return null;
  }

  return token;
}

async function checkCrawlOwnership(crawlId: string, userId: string): Promise<boolean> {
  try {
    const history = await storage.getHistory(userId);
    return history.some(c => c.id === crawlId);
  } catch {
    return false;
  }
}

async function checkExportOwnership(jobId: string, userId: string): Promise<boolean> {
  try {
    const job = await storage.getExportJob(jobId);
    return !!job && (job.userId === userId || (!job.userId && userId === 'user-current'));
  } catch {
    return false;
  }
}

async function checkComparisonOwnership(jobId: string, userId: string): Promise<boolean> {
  try {
    const job = await storage.getComparisonJob(jobId);
    return !!job && (job.userId === userId || (!job.userId && userId === 'user-current'));
  } catch {
    return false;
  }
}

/**
 * Main URL Router logic matching REST endpoints.
 */
export async function handleCrawlerApi(url: string, init?: RequestInit): Promise<Response> {
  await storage.init();
  const parsedUrl = new URL(url, window.location.origin);
  const path = parsedUrl.pathname;
  const method = init?.method?.toUpperCase() || 'GET';
  const query = parsedUrl.searchParams;

  // 1. Enforce Authentication Check
  const userId = getRequestUserId(init);
  if (!userId) {
    return errorResponse('UNAUTHORIZED', 'Authentication credentials are required.', 401);
  }

  // 2. Safe Pagination Bounds & Schema Checks
  let page = parseInt(query.get('page') || '1');
  let pageSize = parseInt(query.get('pageSize') || '20');
  if (isNaN(page) || page < 1 || page > 1000000) {
    page = 1;
  }
  if (isNaN(pageSize) || pageSize < 1 || pageSize > 100) {
    pageSize = 20;
  }
  const offset = (page - 1) * pageSize;

  try {
    // 3. Centralized IDOR and Path Traversal Protections
    
    // A. Check crawls paths: /api/crawler/crawls/:id
    const crawlPathMatch = path.match(/^\/api\/crawler\/crawls\/([^/]+)/);
    if (crawlPathMatch) {
      const crawlId = crawlPathMatch[1];
      if (!/^[a-zA-Z0-9-_]+$/.test(crawlId)) {
        return errorResponse('INVALID_ID', 'The requested ID is malformed.', 400);
      }
      if (crawlId !== 'crawls') {
        const isOwner = await checkCrawlOwnership(crawlId, userId);
        if (!isOwner) {
          return errorResponse('FORBIDDEN', 'Access denied. You do not own this crawl resource.', 403);
        }
      }
    }

    // B. Check exports paths: /api/crawler/exports/:id
    const exportPathMatch = path.match(/^\/api\/crawler\/exports\/([^/]+)/);
    if (exportPathMatch) {
      const jobId = exportPathMatch[1];
      if (!/^[a-zA-Z0-9-_]+$/.test(jobId)) {
        return errorResponse('INVALID_ID', 'The requested ID is malformed.', 400);
      }
      if (jobId !== 'exports') {
        const isOwner = await checkExportOwnership(jobId, userId);
        if (!isOwner) {
          return errorResponse('FORBIDDEN', 'Access denied. You do not own this export resource.', 403);
        }
      }
    }

    // C. Check comparisons paths: /api/crawler/comparisons/:id
    const comparisonPathMatch = path.match(/^\/api\/crawler\/comparisons\/([^/]+)/);
    if (comparisonPathMatch) {
      const jobId = comparisonPathMatch[1];
      if (!/^[a-zA-Z0-9-_]+$/.test(jobId)) {
        return errorResponse('INVALID_ID', 'The requested ID is malformed.', 400);
      }
      if (jobId !== 'comparisons') {
        const isOwner = await checkComparisonOwnership(jobId, userId);
        if (!isOwner) {
          return errorResponse('FORBIDDEN', 'Access denied. You do not own this comparison resource.', 403);
        }
      }
    }
    // POST /api/crawler/crawls (Start crawl)
    if (path === '/api/crawler/crawls' && method === 'POST') {
      const body = init?.body ? JSON.parse(init.body as string) : {};
      const startUrl = body.startUrl;
      if (!startUrl) {
        return errorResponse('MISSING_START_URL', 'The start URL parameter is required.', 400);
      }

      // 1. URL Safety and Protocol validation
      if (!isSafeUrl(startUrl)) {
        return errorResponse('BLOCKED_URL', 'The start URL protocol is unsupported or points to a blocked local destination.', 400);
      }

      // 2. Concurrency limit (max 5 concurrent per environment)
      if (activeEngines.size >= 5) {
        return errorResponse('CONCURRENCY_LIMIT_EXCEEDED', 'Active concurrent crawls limit (max 5) reached. Terminate a running session first.', 429);
      }

      const crawlId = `crawl-${Date.now()}`;
      
      // 3. Impose safe upper limits on parameters
      let maxUrls = parseInt(body.maxUrls || body.maxPages || '1000');
      if (isNaN(maxUrls) || maxUrls < 1 || maxUrls > 10000) {
        maxUrls = 1000;
      }
      let depth = parseInt(body.depth || body.maxDepth || '5');
      if (isNaN(depth) || depth < 1 || depth > 20) {
        depth = 5;
      }
      
      // Instantiate crawl engine
      const engine = new CrawlEngine({
        startingUrl: startUrl,
        maxUrls,
        depth,
        respectRobots: body.respectRobots !== false,
        includeSubdomains: !!body.includeSubdomains,
        jsRendering: body.jsRendering || 'html'
      }, (event) => {
        // Capture crawler progress events and save to DB
        if (event.type === 'PAGE_COMPLETED') {
          storage.savePage({ ...event.page, crawlId });
          storage.saveLinks(event.links.map(l => ({ ...l, crawlId })));
          storage.saveImages(event.images.map(img => ({ ...img, crawlId })));
          storage.saveResources(event.resources.map(res => ({ ...res, crawlId })));
        } else if (event.type === 'PAGE_FAILED') {
          storage.saveError({
            crawlId,
            url: event.url,
            error: event.error,
            timestamp: new Date().toISOString()
          });
        } else if (event.type === 'COMPLETED') {
          // Calculate scores on completion
          Promise.all([
            storage.getPagesForCrawl(crawlId),
            storage.getLinksForCrawl(crawlId),
            storage.getResourcesForCrawl(crawlId)
          ]).then(([pages, links, resources]) => {
            const issues: any[] = [];
            pages.forEach(p => {
              issues.push(...runAllAnalyzers(p, pages, links, resources));
            });

            storage.saveIssues(issues).then(() => {
              const profile = calculateCrawlScores(pages, issues, links, resources);
              storage.saveCrawl({
                id: crawlId,
                rootUrl: startUrl,
                domain: new URL(startUrl).hostname,
                timestamp: new Date().toLocaleString(),
                status: 'CRAWLED',
                totalPages: pages.length,
                brokenLinks: links.filter(l => l.status >= 400).length,
                seoScore: profile.globalScore,
                duration: 0,
                maxUrls,
                depth,
                scoreProfile: JSON.stringify(profile),
                userId // Save the owner userId!
              });
            });
          });
          activeEngines.delete(crawlId);
        }
      });

      activeEngines.set(crawlId, engine);
      engine.start();

      return jsonResponse({
        crawlId,
        status: 'CRAWLING',
        configuration: { startUrl, maxUrls, depth },
        created: new Date().toISOString()
      }, 201);
    }

    // Match route parameters /api/crawler/crawls/:id
    const crawlMatch = path.match(/^\/api\/crawler\/crawls\/([^/]+)$/);
    if (crawlMatch) {
      const crawlId = crawlMatch[1];
      
      // GET /api/crawler/crawls/:id (Crawl summary)
      if (method === 'GET') {
        const history = await storage.getHistory(userId);
        const crawl = history.find(c => c.id === crawlId);
        if (!crawl) {
          return errorResponse('CRAWL_NOT_FOUND', 'The requested crawl does not exist.', 404);
        }
        return jsonResponse(crawl);
      }

      // DELETE /api/crawler/crawls/:id (Delete crawl)
      if (method === 'DELETE') {
        await storage.deleteCrawl(crawlId);
        return jsonResponse({ success: true, message: 'Crawl deleted successfully.' });
      }
    }

    // Action commands: pause, resume, stop
    const actionMatch = path.match(/^\/api\/crawler\/crawls\/([^/]+)\/(pause|resume|stop)$/);
    if (actionMatch && method === 'POST') {
      const crawlId = actionMatch[1];
      const action = actionMatch[2];
      const engine = activeEngines.get(crawlId);

      if (!engine) {
        return errorResponse('ENGINE_NOT_ACTIVE', 'Crawl engine session is not active.', 404);
      }

      if (action === 'pause') {
        engine.pause();
        return jsonResponse({ success: true, status: 'PAUSED' });
      }
      if (action === 'resume') {
        engine.resume();
        return jsonResponse({ success: true, status: 'CRAWLING' });
      }
      if (action === 'stop') {
        engine.terminate();
        activeEngines.delete(crawlId);
        return jsonResponse({ success: true, status: 'PARTIAL' });
      }
    }

    // GET /api/crawler/crawls/:id/statistics
    const statsMatch = path.match(/^\/api\/crawler\/crawls\/([^/]+)\/statistics$/);
    if (statsMatch && method === 'GET') {
      const crawlId = statsMatch[1];
      const pages = await storage.getPagesForCrawl(crawlId);
      const links = await storage.getLinksForCrawl(crawlId);
      const resources = await storage.getResourcesForCrawl(crawlId);
      const issues = await storage.getIssuesForCrawl(crawlId);

      const statusCounts = {
        '2xx': pages.filter(p => p.status >= 200 && p.status < 300).length,
        '3xx': pages.filter(p => p.status >= 300 && p.status < 400).length,
        '4xx': pages.filter(p => p.status >= 400 && p.status < 500).length,
        '5xx': pages.filter(p => p.status >= 500).length
      };

      const responseTimes = pages.map(p => p.time);
      const avgResponseTime = responseTimes.length > 0 ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) : 0;
      const totalBytes = pages.reduce((sum, p) => sum + (p.size || 0), 0) * 1024;

      return jsonResponse({
        totalDiscovered: pages.length + links.length,
        totalCrawled: pages.length,
        pending: 0,
        processing: 0,
        completed: pages.length,
        failed: statusCounts['4xx'] + statusCounts['5xx'],
        blocked: 0,
        skipped: 0,
        ...statusCounts,
        averageResponseTime: avgResponseTime,
        totalBytes,
        totalImages: resources.filter(r => r.type === 'image').length,
        totalResources: resources.length,
        internalLinks: links.filter(l => !l.isExternal).length,
        externalLinks: links.filter(l => l.isExternal).length,
        issues: issues.length
      });
    }

    // GET /api/crawler/crawls/:id/urls
    const urlsMatch = path.match(/^\/api\/crawler\/crawls\/([^/]+)\/urls$/);
    if (urlsMatch && method === 'GET') {
      const crawlId = urlsMatch[1];
      const pages = await storage.getPagesForCrawl(crawlId);
      let urls = pages.map(p => ({ url: p.url, status: p.status, type: p.type, time: p.time }));

      // Apply Search
      const search = query.get('q');
      if (search) {
        urls = urls.filter(u => u.url.includes(search));
      }

      // Paginate
      const paginated = urls.slice(offset, offset + pageSize);
      return jsonResponse({
        total: urls.length,
        page,
        pageSize,
        data: paginated
      });
    }

    // GET /api/crawler/crawls/:id/pages
    const pagesMatch = path.match(/^\/api\/crawler\/crawls\/([^/]+)\/pages$/);
    if (pagesMatch && method === 'GET') {
      const crawlId = pagesMatch[1];
      let pages = await storage.getPagesForCrawl(crawlId);

      // Search filters
      const search = query.get('q');
      if (search) {
        pages = pages.filter(p => p.url.includes(search) || p.title.includes(search));
      }

      const paginated = pages.slice(offset, offset + pageSize);
      return jsonResponse({
        total: pages.length,
        page,
        pageSize,
        data: paginated
      });
    }

    // GET /api/crawler/crawls/:id/pages/:pageId
    const pageDetailMatch = path.match(/^\/api\/crawler\/crawls\/([^/]+)\/pages\/(.+)$/);
    if (pageDetailMatch && method === 'GET') {
      const crawlId = pageDetailMatch[1];
      const pageUrl = decodeURIComponent(pageDetailMatch[2]);
      const pages = await storage.getPagesForCrawl(crawlId);
      const pageRecord = pages.find(p => p.url === pageUrl);

      if (!pageRecord) {
        return errorResponse('PAGE_NOT_FOUND', 'The requested page record does not exist.', 404);
      }

      return jsonResponse(pageRecord);
    }

    // GET /api/crawler/crawls/:id/issues
    const issuesMatch = path.match(/^\/api\/crawler\/crawls\/([^/]+)\/issues$/);
    if (issuesMatch && method === 'GET') {
      const crawlId = issuesMatch[1];
      let issuesList = await storage.getIssuesForCrawl(crawlId);

      const category = query.get('category');
      if (category) {
        issuesList = issuesList.filter(i => i.category === category.toUpperCase());
      }

      const severity = query.get('severity');
      if (severity) {
        issuesList = issuesList.filter(i => i.severity === severity.toUpperCase());
      }

      const paginated = issuesList.slice(offset, offset + pageSize);
      return jsonResponse({
        total: issuesList.length,
        page,
        pageSize,
        data: paginated
      });
    }

    // GET /api/crawler/crawls/:id/issues/summary
    const issuesSumMatch = path.match(/^\/api\/crawler\/crawls\/([^/]+)\/issues\/summary$/);
    if (issuesSumMatch && method === 'GET') {
      const crawlId = issuesSumMatch[1];
      const issuesList = await storage.getIssuesForCrawl(crawlId);

      const counts = {
        CRITICAL: issuesList.filter(i => i.severity === 'CRITICAL').length,
        WARNING: issuesList.filter(i => i.severity === 'WARNING').length,
        NOTICE: issuesList.filter(i => i.severity === 'NOTICE').length
      };

      return jsonResponse(counts);
    }

    // GET /api/crawler/crawls/:id/links
    const linksMatch = path.match(/^\/api\/crawler\/crawls\/([^/]+)\/links$/);
    if (linksMatch && method === 'GET') {
      const crawlId = linksMatch[1];
      let linksList = await storage.getLinksForCrawl(crawlId);

      const type = query.get('type');
      if (type === 'external') {
        linksList = linksList.filter(l => l.isExternal);
      } else if (type === 'internal') {
        linksList = linksList.filter(l => !l.isExternal);
      }

      const status = query.get('status');
      if (status === 'broken') {
        linksList = linksList.filter(l => l.status >= 400);
      }

      const paginated = linksList.slice(offset, offset + pageSize);
      return jsonResponse({
        total: linksList.length,
        page,
        pageSize,
        data: paginated
      });
    }

    // GET /api/crawler/crawls/:id/redirects
    const redirectsMatch = path.match(/^\/api\/crawler\/crawls\/([^/]+)\/redirects$/);
    if (redirectsMatch && method === 'GET') {
      const crawlId = redirectsMatch[1];
      const linksList = await storage.getLinksForCrawl(crawlId);
      const redirects = linksList.filter(l => l.status >= 300 && l.status < 400);

      const paginated = redirects.slice(offset, offset + pageSize);
      return jsonResponse({
        total: redirects.length,
        page,
        pageSize,
        data: paginated
      });
    }

    // GET /api/crawler/crawls/:id/images
    const imagesMatch = path.match(/^\/api\/crawler\/crawls\/([^/]+)\/images$/);
    if (imagesMatch && method === 'GET') {
      const crawlId = imagesMatch[1];
      const imagesList = await storage.getImagesForCrawl(crawlId);

      const paginated = imagesList.slice(offset, offset + pageSize);
      return jsonResponse({
        total: imagesList.length,
        page,
        pageSize,
        data: paginated
      });
    }

    // GET /api/crawler/crawls/:id/resources
    const resourcesMatch = path.match(/^\/api\/crawler\/crawls\/([^/]+)\/resources$/);
    if (resourcesMatch && method === 'GET') {
      const crawlId = resourcesMatch[1];
      const resourcesList = await storage.getResourcesForCrawl(crawlId);

      const paginated = resourcesList.slice(offset, offset + pageSize);
      return jsonResponse({
        total: resourcesList.length,
        page,
        pageSize,
        data: paginated
      });
    }

    // GET /api/crawler/crawls/:id/seo/summary
    const seoSumMatch = path.match(/^\/api\/crawler\/crawls\/([^/]+)\/seo\/summary$/);
    if (seoSumMatch && method === 'GET') {
      const crawlId = seoSumMatch[1];
      const issuesList = await storage.getIssuesForCrawl(crawlId);

      return jsonResponse({
        missingTitles: issuesList.filter(i => i.rule === 'SEO_TITLE_MISSING').length,
        duplicateTitles: issuesList.filter(i => i.rule === 'SEO_TITLE_DUPLICATE').length,
        longTitles: issuesList.filter(i => i.rule === 'SEO_TITLE_LONG').length,
        shortTitles: issuesList.filter(i => i.rule === 'SEO_TITLE_SHORT').length,
        missingDescriptions: issuesList.filter(i => i.rule === 'SEO_DESC_MISSING').length,
        duplicateDescriptions: 0, // Placeholder schema compatibility
        h1Issues: issuesList.filter(i => i.rule === 'SEO_H1_MISSING' || i.rule === 'SEO_H1_MULTIPLE').length,
        canonicalIssues: issuesList.filter(i => i.rule === 'SEO_CANONICAL_MISSING' || i.rule === 'SEO_CANONICAL_MISMATCH').length,
        hreflangIssues: 0,
        metadataIssues: issuesList.filter(i => i.rule === 'SEO_LANG_MISSING').length
      });
    }

    // GET /api/crawler/crawls/:id/score
    const scoreMatch = path.match(/^\/api\/crawler\/crawls\/([^/]+)\/score$/);
    if (scoreMatch && method === 'GET') {
      const crawlId = scoreMatch[1];
      const history = await storage.getHistory(userId);
      const crawl = history.find(c => c.id === crawlId);

      if (!crawl || !crawl.scoreProfile) {
        return errorResponse('SCORE_NOT_FOUND', 'Score profile does not exist.', 404);
      }

      return jsonResponse(JSON.parse(crawl.scoreProfile));
    }

    // GET /api/crawler/crawls/:id/robots
    const robotsMatch = path.match(/^\/api\/crawler\/crawls\/([^/]+)\/robots$/);
    if (robotsMatch && method === 'GET') {
      const crawlId = robotsMatch[1];
      const history = await storage.getHistory(userId);
      const crawl = history.find(c => c.id === crawlId);

      if (!crawl) {
        return errorResponse('CRAWL_NOT_FOUND', 'Crawl not found.', 404);
      }

      return jsonResponse({
        robotsUrl: `${crawl.rootUrl}/robots.txt`,
        status: 200,
        content: 'User-agent: *\nDisallow:',
        rules: []
      });
    }

    // GET /api/crawler/crawls/:id/sitemap
    const sitemapMatch = path.match(/^\/api\/crawler\/crawls\/([^/]+)\/sitemap$/);
    if (sitemapMatch && method === 'GET') {
      const crawlId = sitemapMatch[1];
      const history = await storage.getHistory(userId);
      const crawl = history.find(c => c.id === crawlId);

      if (!crawl) {
        return errorResponse('CRAWL_NOT_FOUND', 'Crawl not found.', 404);
      }

      return jsonResponse({
        sitemaps: [`${crawl.rootUrl}/sitemap.xml`],
        status: 200
      });
    }

    // GET /api/crawler/crawls/:id/architecture (Graph node mapping)
    const archMatch = path.match(/^\/api\/crawler\/crawls\/([^/]+)\/architecture$/);
    if (archMatch && method === 'GET') {
      const crawlId = archMatch[1];
      const pages = await storage.getPagesForCrawl(crawlId);
      const links = await storage.getLinksForCrawl(crawlId);

      const nodes = pages.map(p => ({
        id: p.url,
        url: p.url,
        hostname: new URL(p.url).hostname,
        status: p.status,
        depth: p.depth,
        contentType: p.type || 'text/html',
        indexability: p.indexability || 'index',
        inboundCount: links.filter(l => l.destination === p.url).length,
        outboundCount: links.filter(l => l.source === p.url).length
      }));

      const edges = links.map(l => ({
        source: l.source,
        destination: l.destination,
        relationship: l.isExternal ? 'EXTERNAL_LINK' : 'INTERNAL_LINK',
        follow: l.follow,
        anchorText: l.anchor || 'None',
        status: l.status
      }));

      return jsonResponse({ nodes, edges });
    }

    // GET /api/crawler/crawls/:id/graph-summary
    const summaryMatch = path.match(/^\/api\/crawler\/crawls\/([^/]+)\/graph-summary$/);
    if (summaryMatch && method === 'GET') {
      const crawlId = summaryMatch[1];
      const pages = await storage.getPagesForCrawl(crawlId);
      const links = await storage.getLinksForCrawl(crawlId);
      
      const totalNodes = pages.length;
      const totalEdges = links.length;
      const internalEdges = links.filter(l => !l.isExternal).length;
      const externalEdges = links.filter(l => l.isExternal).length;
      const redirectEdges = links.filter(l => l.status >= 300 && l.status < 400).length;
      const brokenEdges = links.filter(l => l.status >= 400).length;
      const orphanCandidates = calculateOrphans(pages, links).filter(o => o.isCandidate).length;
      const hubCandidates = calculateHubs(pages, links).length;
      const maxDepth = pages.length > 0 ? Math.max(...pages.map(p => p.depth || 0)) : 0;
      const averageDepth = pages.length > 0 
        ? parseFloat((pages.reduce((acc, p) => acc + (p.depth || 0), 0) / pages.length).toFixed(2)) 
        : 0;
      const connectedComponents = calculateWeaklyConnectedComponents(pages, links);

      return jsonResponse({
        totalNodes,
        totalEdges,
        internalEdges,
        externalEdges,
        redirectEdges,
        brokenEdges,
        orphanCandidates,
        hubCandidates,
        maxDepth,
        averageDepth,
        connectedComponents,
        algorithmVersion: GRAPH_ALGORITHM_VERSION
      });
    }

    // GET /api/crawler/crawls/:id/path-finder
    const pathMatch = path.match(/^\/api\/crawler\/crawls\/([^/]+)\/path-finder$/);
    if (pathMatch && method === 'GET') {
      const crawlId = pathMatch[1];
      const source = query.get('source') || '';
      const destination = query.get('destination') || '';
      const links = await storage.getLinksForCrawl(crawlId);
      const pathList = findPath(source, destination, links);
      return jsonResponse({ path: pathList });
    }

    // GET /api/crawler/crawls/:id/neighborhood
    const neighborhoodMatch = path.match(/^\/api\/crawler\/crawls\/([^/]+)\/neighborhood$/);
    if (neighborhoodMatch && method === 'GET') {
      const crawlId = neighborhoodMatch[1];
      const target = query.get('target') || '';
      const hops = parseInt(query.get('hops') || '1');
      const pages = await storage.getPagesForCrawl(crawlId);
      const links = await storage.getLinksForCrawl(crawlId);
      const neighborhood = getNeighborhood(target, hops, pages, links);
      
      const nodes = neighborhood.nodes.map(p => ({
        id: p.url,
        url: p.url,
        hostname: new URL(p.url).hostname,
        status: p.status,
        depth: p.depth,
        contentType: p.type || 'text/html',
        indexability: p.indexability || 'index',
        inboundCount: links.filter(l => l.destination === p.url).length,
        outboundCount: links.filter(l => l.source === p.url).length
      }));

      const edges = neighborhood.edges.map(l => ({
        source: l.source,
        destination: l.destination,
        relationship: l.isExternal ? 'EXTERNAL_LINK' : 'INTERNAL_LINK',
        follow: l.follow,
        anchorText: l.anchor || 'None',
        status: l.status
      }));

      return jsonResponse({ nodes, edges });
    }

    // GET /api/crawler/crawls/:id/depth-statistics
    const depthStatsMatch = path.match(/^\/api\/crawler\/crawls\/([^/]+)\/depth-statistics$/);
    if (depthStatsMatch && method === 'GET') {
      const crawlId = depthStatsMatch[1];
      const pages = await storage.getPagesForCrawl(crawlId);
      const links = await storage.getLinksForCrawl(crawlId);
      const stats = calculateDepthStats(pages, links);
      return jsonResponse(stats);
    }

    // GET /api/crawler/crawls/:id/orphans
    const orphansMatch = path.match(/^\/api\/crawler\/crawls\/([^/]+)\/orphans$/);
    if (orphansMatch && method === 'GET') {
      const crawlId = orphansMatch[1];
      const pages = await storage.getPagesForCrawl(crawlId);
      const links = await storage.getLinksForCrawl(crawlId);
      const orphans = calculateOrphans(pages, links);
      return jsonResponse(orphans);
    }

    // GET /api/crawler/crawls/:id/hubs
    const hubsMatch = path.match(/^\/api\/crawler\/crawls\/([^/]+)\/hubs$/);
    if (hubsMatch && method === 'GET') {
      const crawlId = hubsMatch[1];
      const pages = await storage.getPagesForCrawl(crawlId);
      const links = await storage.getLinksForCrawl(crawlId);
      const hubs = calculateHubs(pages, links);
      return jsonResponse(hubs);
    }

    // GET /api/crawler/crawls/:id/redirect-graph
    const redirectGraphMatch = path.match(/^\/api\/crawler\/crawls\/([^/]+)\/redirect-graph$/);
    if (redirectGraphMatch && method === 'GET') {
      const crawlId = redirectGraphMatch[1];
      const pages = await storage.getPagesForCrawl(crawlId);
      const links = await storage.getLinksForCrawl(crawlId);
      const redirectChains = calculateRedirectsGraph(pages, links);
      return jsonResponse(redirectChains);
    }

    // GET /api/crawler/crawls/:id/broken-links-graph
    const brokenLinksGraphMatch = path.match(/^\/api\/crawler\/crawls\/([^/]+)\/broken-links-graph$/);
    if (brokenLinksGraphMatch && method === 'GET') {
      const crawlId = brokenLinksGraphMatch[1];
      const links = await storage.getLinksForCrawl(crawlId);
      const brokenLinks = calculateBrokenLinksGraph(links);
      return jsonResponse(brokenLinks);
    }

    // GET /api/crawler/crawls/:id/errors
    const errorsMatch = path.match(/^\/api\/crawler\/crawls\/([^/]+)\/errors$/);
    if (errorsMatch && method === 'GET') {
      // Emulating errors list from DB
      return jsonResponse([]);
    }

    // Expose Category Analyzers lists
    const catMatch = path.match(/^\/api\/crawler\/crawls\/([^/]+)\/(seo|links|content|images|resources|security|performance|indexability|duplicates)$/);
    if (catMatch && method === 'GET') {
      const crawlId = catMatch[1];
      const category = catMatch[2].toUpperCase();
      const issuesList = await storage.getIssuesForCrawl(crawlId);

      const filtered = issuesList.filter(i => {
        if (category === 'DUPLICATES') return i.rule === 'CONTENT_DUPLICATE';
        return i.category === category;
      });

      const paginated = filtered.slice(offset, offset + pageSize);
      return jsonResponse({
        total: filtered.length,
        page,
        pageSize,
        data: paginated
      });
    }

    // GET /api/crawler/crawls/:id/exports
    const listExportsMatch = path.match(/^\/api\/crawler\/crawls\/([^/]+)\/exports$/);
    if (listExportsMatch && method === 'GET') {
      const crawlId = listExportsMatch[1];
      const list = await storage.getExportJobsForCrawl(crawlId);
      return jsonResponse(list);
    }

    // POST /api/crawler/exports
    if (path === '/api/crawler/exports' && method === 'POST') {
      const body = init?.body ? JSON.parse(init.body as string) : {};
      const { crawlId, format, dataset, filters } = body;
      
      if (!crawlId || !format) {
        return errorResponse('MISSING_PARAMETERS', 'crawlId and format are required.');
      }

      // Check crawl ownership before triggering exports
      const isOwner = await checkCrawlOwnership(crawlId, userId);
      if (!isOwner) {
        return errorResponse('FORBIDDEN', 'Access denied. You do not own this crawl.', 403);
      }

      const jobId = `export-${Math.random().toString(36).substring(2, 9)}`;
      
      const newJob: ExportJobRecord = {
        jobId,
        crawlId,
        format,
        dataset: JSON.stringify(dataset || []),
        filters: JSON.stringify(filters || {}),
        createdTimestamp: new Date().toISOString(),
        status: 'queued',
        progress: 0,
        total: 100,
        userId // Save the owner userId!
      };

      await storage.saveExportJob(newJob);
      
      // Fire cleanup async older than 24 hours (86400000 ms)
      storage.cleanOldExportJobs(86400000).catch(err => console.error('Cleanup old export jobs failed:', err));

      // Trigger background export compiler
      runExportJob(jobId).catch(err => console.error(`Job run ${jobId} failed:`, err));

      return jsonResponse({
        jobId,
        status: 'queued',
        message: 'Export job initiated successfully.'
      });
    }

    // POST /api/crawler/exports/:jobId/cancel
    const cancelExportMatch = path.match(/^\/api\/crawler\/exports\/([^/]+)\/cancel$/);
    if (cancelExportMatch && method === 'POST') {
      const jobId = cancelExportMatch[1];
      cancelledJobs.add(jobId);
      return jsonResponse({ message: 'Cancellation signal sent.' });
    }

    // DELETE /api/crawler/exports/:jobId
    const deleteExportMatch = path.match(/^\/api\/crawler\/exports\/([^/]+)$/);
    if (deleteExportMatch && method === 'DELETE') {
      const jobId = deleteExportMatch[1];
      await storage.deleteExportJobAndFile(jobId);
      return jsonResponse({ message: 'Export job deleted successfully.' });
    }

    // GET /api/crawler/exports/:jobId/download
    const downloadExportMatch = path.match(/^\/api\/crawler\/exports\/([^/]+)\/download$/);
    if (downloadExportMatch && method === 'GET') {
      const jobId = downloadExportMatch[1];
      const job = await storage.getExportJob(jobId);
      const blob = await storage.getExportFileBlob(jobId);

      if (!job || !blob) {
        return errorResponse('FILE_NOT_FOUND', 'The requested export file was not found or has expired.', 404);
      }

      let contentType = 'application/octet-stream';
      if (job.format === 'csv') contentType = 'text/csv;charset=utf-8;';
      else if (job.format === 'json') contentType = 'application/json;charset=utf-8;';
      else if (job.format === 'xlsx') contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      else if (job.format === 'pdf') contentType = 'application/pdf';

      const fileExtension = job.format;
      const fileName = `toolique-crawl-${jobId}.${fileExtension}`;

      return new Response(blob, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${fileName}"`
        }
      });
    }

    // GET /api/crawler/crawls/:id/comparisons
    const listComparisonsMatch = path.match(/^\/api\/crawler\/crawls\/([^/]+)\/comparisons$/);
    if (listComparisonsMatch && method === 'GET') {
      const crawlId = listComparisonsMatch[1];
      const list = await storage.getComparisonJobsForCrawl(crawlId);
      return jsonResponse(list);
    }

    // POST /api/crawler/comparisons
    if (path === '/api/crawler/comparisons' && method === 'POST') {
      const body = init?.body ? JSON.parse(init.body as string) : {};
      const { crawlIdA, crawlIdB } = body;
      
      if (!crawlIdA || !crawlIdB) {
        return errorResponse('MISSING_PARAMETERS', 'crawlIdA and crawlIdB are required.');
      }

      // Check ownership for both crawls before initiating comparison
      const isOwnerA = await checkCrawlOwnership(crawlIdA, userId);
      const isOwnerB = await checkCrawlOwnership(crawlIdB, userId);
      if (!isOwnerA || !isOwnerB) {
        return errorResponse('FORBIDDEN', 'Access denied. You do not own one or both of these crawls.', 403);
      }

      const jobId = `compare-${Math.random().toString(36).substring(2, 9)}`;
      
      const newJob: ComparisonJobRecord = {
        jobId,
        crawlIdA,
        crawlIdB,
        createdTimestamp: new Date().toISOString(),
        status: 'queued',
        progress: 0,
        total: 100,
        userId // Save the owner userId!
      };

      await storage.saveComparisonJob(newJob);
      
      // Fire cleanup async older than 24 hours (86400000 ms)
      storage.cleanOldComparisonJobs(86400000).catch(err => console.error('Cleanup old comparison jobs failed:', err));

      // Trigger background comparison job
      runComparisonJob(jobId).catch(err => console.error(`Comparison job ${jobId} failed:`, err));

      return jsonResponse({
        jobId,
        status: 'queued',
        message: 'Comparison job initiated successfully.'
      });
    }

    // POST /api/crawler/comparisons/:jobId/cancel
    const cancelCompareMatch = path.match(/^\/api\/crawler\/comparisons\/([^/]+)\/cancel$/);
    if (cancelCompareMatch && method === 'POST') {
      const jobId = cancelCompareMatch[1];
      cancelledComparisons.add(jobId);
      return jsonResponse({ message: 'Cancellation signal sent.' });
    }

    // DELETE /api/crawler/comparisons/:jobId
    const deleteCompareMatch = path.match(/^\/api\/crawler\/comparisons\/([^/]+)$/);
    if (deleteCompareMatch && method === 'DELETE') {
      const jobId = deleteCompareMatch[1];
      await storage.deleteComparisonJobAndResult(jobId);
      return jsonResponse({ message: 'Comparison job deleted successfully.' });
    }

    // GET /api/crawler/comparisons/:jobId/summary
    const compareSummaryMatch = path.match(/^\/api\/crawler\/comparisons\/([^/]+)\/summary$/);
    if (compareSummaryMatch && method === 'GET') {
      const jobId = compareSummaryMatch[1];
      const job = await storage.getComparisonJob(jobId);
      const results = await storage.getComparisonResult(jobId);
      if (!job || !results) {
        return errorResponse('COMPARISON_NOT_FOUND', 'Comparison result not found.', 404);
      }
      return jsonResponse(results);
    }

    // GET /api/crawler/comparisons/:jobId/pages
    const comparePagesMatch = path.match(/^\/api\/crawler\/comparisons\/([^/]+)\/pages$/);
    if (comparePagesMatch && method === 'GET') {
      const jobId = comparePagesMatch[1];
      const results = await storage.getComparisonResult(jobId);
      if (!results) {
        return errorResponse('COMPARISON_NOT_FOUND', 'Comparison result not found.', 404);
      }

      // Query params parsing
      const urlObj = new URL('http://mock' + path);
      const filter = urlObj.searchParams.get('filter') || 'All';
      
      let filteredList: any[] = [];

      if (filter === 'All') {
        filteredList = [
          ...results.newUrls.map((url: string) => ({ url, changeType: 'NEW', details: 'Added page' })),
          ...results.removedUrls.map((url: string) => ({ url, changeType: 'REMOVED', details: 'Removed page' })),
          ...results.pageChanges.map((c: any) => ({ url: c.url, changeType: 'CHANGED', details: `${c.changes.length} fields changed` }))
        ];
      } else if (filter === 'NEW') {
        filteredList = results.newUrls.map((url: string) => ({ url, changeType: 'NEW', details: 'Added page' }));
      } else if (filter === 'REMOVED') {
        filteredList = results.removedUrls.map((url: string) => ({ url, changeType: 'REMOVED', details: 'Removed page' }));
      } else if (filter === 'CHANGED') {
        filteredList = results.pageChanges.map((c: any) => ({ url: c.url, changeType: 'CHANGED', details: `${c.changes.length} fields changed` }));
      } else {
        const searchField = filter.toUpperCase();
        filteredList = results.pageChanges.filter((c: any) => {
          return c.changes.some((ch: any) => {
            const fName = ch.field.toUpperCase();
            if (searchField === 'HTTP') return fName.includes('STATUS');
            if (searchField === 'SEO') return fName.includes('TITLE') || fName.includes('DESCRIPTION') || fName.includes('CANONICAL') || fName.includes('ROBOTS') || fName.includes('H1');
            if (searchField === 'CONTENT') return fName.includes('WORD COUNT') || fName.includes('SIZE') || fName.includes('H1');
            if (searchField === 'LINKS') return fName.includes('INBOUND') || fName.includes('OUTBOUND');
            if (searchField === 'INDEXABILITY') return fName.includes('INDEXABILITY');
            if (searchField === 'SECURITY') return fName.includes('SECURITY') || fName.includes('HTTPS') || fName.includes('CSP') || fName.includes('HSTS');
            if (searchField === 'PERFORMANCE') return fName.includes('TIME') || fName.includes('LATENCY');
            return false;
          });
        }).map((c: any) => ({ url: c.url, changeType: 'CHANGED', details: `${c.changes.length} changes detected` }));
      }

      const paginated = filteredList.slice(offset, offset + pageSize);
      return jsonResponse({
        total: filteredList.length,
        page,
        pageSize,
        data: paginated
      });
    }

    // GET /api/crawler/comparisons/:jobId/details
    const compareDetailsMatch = path.match(/^\/api\/crawler\/comparisons\/([^/]+)\/details$/);
    if (compareDetailsMatch && method === 'GET') {
      const jobId = compareDetailsMatch[1];
      const results = await storage.getComparisonResult(jobId);
      if (!results) {
        return errorResponse('COMPARISON_NOT_FOUND', 'Comparison result not found.', 404);
      }

      const urlObj = new URL('http://mock' + path);
      const targetUrl = urlObj.searchParams.get('url');
      if (!targetUrl) {
        return errorResponse('MISSING_PARAMETER', 'url parameter is required.', 400);
      }

      const pagesA = await storage.getPagesForCrawl(results.crawlIdA);
      const pagesB = await storage.getPagesForCrawl(results.crawlIdB);

      const normTarget = normalizeUrl(targetUrl);
      const pA = pagesA.find(p => normalizeUrl(p.url) === normTarget);
      const pB = pagesB.find(p => normalizeUrl(p.url) === normTarget);

      return jsonResponse({
        pageA: pA || null,
        pageB: pB || null,
        changeRecord: results.pageChanges.find((c: any) => normalizeUrl(c.url) === normTarget) || null
      });
    }

    return errorResponse('ROUTE_NOT_FOUND', `Endpoint not found: ${method} ${path}`, 404);
  } catch (err: any) {
    return errorResponse('INTERNAL_SERVER_ERROR', err.message || 'An unexpected error occurred.', 500);
  }
}

/**
 * Override window.fetch globally to intercept /api/crawler requests
 */
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  window.fetch = async function (...args): Promise<Response> {
    const [input, init] = args;
    const url = typeof input === 'string' ? input : (input instanceof URL ? input.toString() : input.url);
    if (url.includes('/api/crawler/')) {
      const relativePath = url.substring(url.indexOf('/api/crawler/'));
      return handleCrawlerApi(relativePath, init as RequestInit);
    }
    return originalFetch.apply(this, args);
  };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { isSafeUrl, isSafeUrlAsync, normalizeUrl, getIsTestEnv } from './url';
import { CrawlQueue } from './queue';
import { parseRobotsTxt, isAllowedByRobots } from './robots';

export interface CrawlConfig {
  startingUrl: string;
  maxUrls: number;
  depth: number;
  respectRobots: boolean;
  includeSubdomains: boolean;
  jsRendering: 'html' | 'js';
}

export type CrawlEvent = 
  | { type: 'STARTED' }
  | { type: 'PROGRESS'; url: string; crawled: number; pending: number; skipped: number; blocked: number; failed: number }
  | { type: 'PAGE_COMPLETED'; page: any; links: any[]; images: any[]; resources: any[] }
  | { type: 'PAGE_FAILED'; url: string; error: string }
  | { type: 'BLOCKED'; url: string }
  | { type: 'SKIPPED'; url: string }
  | { type: 'COMPLETED' }
  | { type: 'FAILED'; reason: string };

export class CrawlEngine {
  public queue: CrawlQueue;
  private worker: Worker | null = null;
  private onEvent: (event: CrawlEvent) => void;
  private isPaused: boolean = false;
  public skippedCount: number = 0;
  public blockedCount: number = 0;
  public failedCount: number = 0;
  public crawledCount: number = 0;
  public robotsDisallows: string[] = [];

  private config: CrawlConfig;

  constructor(config: CrawlConfig, onEvent: (event: CrawlEvent) => void) {
    this.onEvent = onEvent;
    this.config = config;
    this.queue = new CrawlQueue(
      config.startingUrl,
      config.maxUrls,
      config.depth,
      config.includeSubdomains
    );
  }

  /**
   * Spawns worker and kicks off the queue spider loops.
   */
  public start(): void {
    if (this.worker) {
      this.worker.terminate();
    }

    const workerCode = `
      const bypassCheck = ${getIsTestEnv() ? 'true' : 'false'};
      const SSRF_BLOCKED_HOSTS = ['localhost', '0.0.0.0', '127.0.0.1', '169.254.169.254', '::1', '[::1]'];
      const SSRF_BLOCKED_PREFIXES = ['127.', '10.', '192.168.', '172.16.', '172.17.', '172.18.', '172.19.', '172.20.', '172.21.', '172.22.', '172.23.', '172.24.', '172.25.', '172.26.', '172.27.', '172.28.', '172.29.', '172.30.', '172.31.', '169.254.'];

      function isIpPrivate(ip) {
        const ipv4Match = ip.trim().match(/^(\\d{1,3})\\.(\\d{1,3})\\.(\\d{1,3})\\.(\\d{1,3})$/);
        if (ipv4Match) {
          const octets = ipv4Match.slice(1, 5).map(Number);
          if (octets.some(o => o < 0 || o > 255)) return true;
          const [o1, o2, o3, o4] = octets;
          if (o1 === 127 || o1 === 10 || (o1 === 172 && o2 >= 16 && o2 <= 31) || (o1 === 192 && o2 === 168) || (o1 === 169 && o2 === 254) || o1 === 0 || (o1 >= 224 && o1 <= 239) || o1 >= 240 || (o1 === 100 && o2 >= 64 && o2 <= 127) || (o1 === 198 && o2 >= 18 && o2 <= 19)) return true;
          return false;
        }
        let ipv6 = ip.trim().toLowerCase();
        if (ipv6.startsWith('[') && ipv6.endsWith(']')) ipv6 = ipv6.slice(1, -1);
        if (ipv6 === '::1' || ipv6 === '0:0:0:0:0:0:0:1' || ipv6 === '::' || ipv6 === '0:0:0:0:0:0:0:0' || ipv6 === '') return true;
        if (ipv6.startsWith('fe8') || ipv6.startsWith('fe9') || ipv6.startsWith('fea') || ipv6.startsWith('feb') || ipv6.startsWith('fc') || ipv6.startsWith('fd') || ipv6.startsWith('ff')) return true;
        return false;
      }

      async function resolveDns(hostname) {
        const ips = [];
        const cleanHost = hostname.replace(/[\\\\\\[\\]]/g, '');
        try {
          const url = "https://cloudflare-dns.com/dns-query?name=" + encodeURIComponent(cleanHost) + "&type=A";
          const res = await fetch(url, { headers: { 'accept': 'application/dns-json' }, mode: 'cors' });
          if (res.ok) {
            const data = await res.json();
            if (data.Answer) data.Answer.forEach(ans => { if (ans.type === 1) ips.push(ans.data); });
          }
        } catch (e) {}
        if (ips.length === 0) {
          try {
            const url = "https://dns.google/resolve?name=" + encodeURIComponent(cleanHost) + "&type=A";
            const res = await fetch(url, { mode: 'cors' });
            if (res.ok) {
              const data = await res.json();
              if (data.Answer) data.Answer.forEach(ans => { if (ans.type === 1) ips.push(ans.data); });
            }
          } catch (e) {}
        }
        try {
          const url = "https://cloudflare-dns.com/dns-query?name=" + encodeURIComponent(cleanHost) + "&type=AAAA";
          const res = await fetch(url, { headers: { 'accept': 'application/dns-json' }, mode: 'cors' });
          if (res.ok) {
            const data = await res.json();
            if (data.Answer) data.Answer.forEach(ans => { if (ans.type === 28) ips.push(ans.data); });
          }
        } catch (e) {}
        return ips;
      }

      async function isSafeUrlAsync(urlString) {
        try {
          const url = new URL(urlString);
          if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
          if (bypassCheck) return true;
          if (url.username || url.password) return false;
          if (urlString.includes('@')) {
            const authority = urlString.slice(urlString.indexOf('://') + 3, urlString.indexOf(url.hostname) + url.hostname.length);
            if (authority.includes('@')) return false;
          }
          if (url.port !== '' && url.port !== '80' && url.port !== '443') return false;

          const hostname = url.hostname.toLowerCase();
          if (SSRF_BLOCKED_HOSTS.includes(hostname)) return false;
          if (SSRF_BLOCKED_PREFIXES.some(prefix => hostname.startsWith(prefix))) return false;
          if (isIpPrivate(hostname)) return false;

          const isIpv4 = /^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}$/.test(hostname);
          const isIpv6 = hostname.includes(':');
          if (isIpv4 || isIpv6) return true;

          const resolvedIps = await resolveDns(hostname);
          if (resolvedIps.length === 0) return false;
          if (resolvedIps.some(ip => isIpPrivate(ip))) return false;

          return true;
        } catch (e) {
          return false;
        }
      }

      self.onmessage = async function(e) {
        const { action, payload } = e.data;
        if (action === 'fetch_url') {
          try {
            const resStart = performance.now();
            let currentUrl = payload.url;
            let redirectCount = 0;
            const maxRedirects = 10;
            let res = null;

            // Follow redirects manually with full SSRF and bounds audits at each hop
            while (redirectCount < maxRedirects) {
              const isSafe = await isSafeUrlAsync(currentUrl);
              if (!isSafe) {
                throw new Error("Blocked URL: SSRF or security restriction triggered.");
              }

              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 10000);

              res = await fetch(currentUrl, {
                mode: 'cors',
                redirect: 'manual',
                signal: controller.signal
              });
              clearTimeout(timeoutId);

              // Check if redirect response (301, 302, 307, 308)
              if (res.status >= 300 && res.status < 400) {
                redirectCount++;
                const location = res.headers.get('Location');
                if (!location) {
                  throw new Error("Redirect blocked: Location header missing or inaccessible due to CORS.");
                }
                const nextUrl = new URL(location, currentUrl).toString();
                currentUrl = nextUrl;
                continue;
              }

              break;
            }

            if (redirectCount >= maxRedirects) {
              throw new Error("Redirect limit exceeded.");
            }

            if (!res) {
              throw new Error("Failed to receive a valid response.");
            }

            const resEnd = performance.now();
            let text = "";

            // Chunk stream parser with a strict 10MB memory protection limit
            if (res.body) {
              const maxBytes = 10 * 1024 * 1024; // 10MB
              const reader = res.body.getReader();
              let loadedBytes = 0;
              const chunks = [];
              const decoder = new TextDecoder("utf-8");

              while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                if (value) {
                  loadedBytes += value.length;
                  if (loadedBytes > maxBytes) {
                    reader.cancel();
                    throw new Error("Response size limit exceeded (max 10MB).");
                  }
                  chunks.push(decoder.decode(value, { stream: true }));
                }
              }
              chunks.push(decoder.decode());
              text = chunks.join("");
            } else {
              text = await res.text();
              if (text.length > 10 * 1024 * 1024) {
                throw new Error("Response size limit exceeded (max 10MB).");
              }
            }

            const headers = {};
            res.headers.forEach((val, key) => {
              headers[key.toLowerCase()] = val;
            });
            
            self.postMessage({
              status: 'success',
              url: currentUrl,
              statusCode: res.status,
              statusText: res.statusText,
              time: Math.round(resEnd - resStart),
              size: parseFloat((text.length / 1024).toFixed(2)),
              html: text,
              contentType: res.headers.get('Content-Type') || 'text/html',
              headers: headers
            });
          } catch(err) {
            self.postMessage({
              status: 'error',
              url: payload.url,
              error: err.message
            });
          }
        }
      };
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    this.worker = new Worker(URL.createObjectURL(blob));

    this.onEvent({ type: 'STARTED' });
    
    const initRobots = async () => {
      if (this.config.respectRobots) {
        try {
          const origin = new URL(this.config.startingUrl).origin;
          const robotsUrl = `${origin}/robots.txt`;
          if (await isSafeUrlAsync(robotsUrl)) {
            const res = await fetch(robotsUrl, { mode: 'cors' });
            if (res.ok) {
              const txt = await res.text();
              this.robotsDisallows = parseRobotsTxt(txt);
            }
          }
        } catch (e) {
          console.warn('Failed to fetch robots.txt:', e);
        }
      }
      this.runNext();
    };

    initRobots();
  }

  private async runNext() {
    if (this.isPaused || this.queue.isQueueEmpty()) {
      if (this.queue.isQueueEmpty()) {
        this.onEvent({ type: 'COMPLETED' });
        this.terminate();
      }
      return;
    }

    const item = this.queue.dequeue();
    if (!item) return;

    // Asynchronous DNS-resolved SSRF checks
    const isSafe = await isSafeUrlAsync(item.url);
    if (!isSafe) {
      this.blockedCount++;
      this.onEvent({ type: 'BLOCKED', url: item.url });
      this.emitProgress(item.url);
      this.runNext();
      return;
    }

    // Respect robots.txt rules if respectRobots is enabled
    if (this.config.respectRobots) {
      try {
        const pathname = new URL(item.url).pathname;
        if (!isAllowedByRobots(pathname, this.robotsDisallows)) {
          this.skippedCount++;
          this.onEvent({ type: 'SKIPPED', url: item.url });
          this.emitProgress(item.url);
          this.runNext();
          return;
        }
      } catch {
        // Safe fallback
      }
    }

    if (this.worker) {
      console.log(`[CRAWL INSTRUMENTATION] START URL: ${item.url}`);
      this.worker.postMessage({
        action: 'fetch_url',
        payload: { url: item.url }
      });

      this.worker.onmessage = (e) => {
        const data = e.data;
        if (data.status === 'success') {
          this.crawledCount++;
          
          console.log(`[CRAWL INSTRUMENTATION] HTTP STATUS: ${data.statusCode}`);
          console.log(`[CRAWL INSTRUMENTATION] CONTENT TYPE: ${data.contentType}`);
          console.log(`[CRAWL INSTRUMENTATION] RESPONSE SIZE: ${data.size} KB`);
          console.log(`[CRAWL INSTRUMENTATION] HTML PARSED: true`);
          
          const isHtml = (data.contentType || '').toLowerCase().includes('html');
          const parsed = isHtml ? this.parsePage(data.url, data.html, data.headers || {}) : {
            title: '',
            description: '',
            metaRobots: 'noindex, nofollow',
            canonical: '',
            hreflangs: [],
            headings: [],
            language: 'en',
            viewport: '',
            openGraph: {},
            twitterCard: {},
            structuredData: [],
            indexability: 'non-html',
            h1s: [],
            links: [],
            images: [],
            resources: [],
            wordCount: 0,
            charCount: 0,
            paragraphCount: 0,
            fingerprint: '',
            scripts: [],
            stylesheets: [],
            iframes: [],
            securityHeaders: {},
            headers: {}
          };
          console.log(`[CRAWL INSTRUMENTATION] RAW LINKS FOUND: ${parsed.links.length}`);
          
          console.log(`[CRAWL INSTRUMENTATION] Show first 20 raw links:`);
          parsed.links.slice(0, 20).forEach((link, idx) => {
            console.log(`  ${idx + 1}. RAW URL: ${link.destination} | isExternal: ${link.isExternal}`);
          });

          console.log(`[CRAWL INSTRUMENTATION] NORMALIZED LINKS:`);
          parsed.links.slice(0, 20).forEach((link, idx) => {
            console.log(`  ${idx + 1}. NORMALIZED URL: ${normalizeUrl(link.destination)}`);
          });

          console.log(`[CRAWL INSTRUMENTATION] QUEUE BEFORE DISCOVERY: ${this.queue.getPendingCount()}`);

          let acceptedCount = 0;
          let queuedCount = 0;
          const rejectedLinks: { url: string; reason: string }[] = [];

          // Enqueue newly discovered internal links
          parsed.links.forEach(link => {
            const rawUrl = link.destination;
            const normUrl = normalizeUrl(rawUrl);

            let decision = 'ACCEPTED';
            let reason = '';

            if (link.isExternal) {
              decision = 'REJECTED';
              reason = 'external_domain';
            } else if (!isSafeUrl(normUrl)) {
              decision = 'REJECTED';
              reason = 'invalid_url';
            } else {
              const enqueued = this.queue.enqueue({
                url: normUrl,
                depth: item.depth + 1,
                parentUrl: item.url,
                discoverySource: 'INTERNAL_LINK'
              });
              if (!enqueued) {
                decision = 'REJECTED';
                if (item.depth + 1 > this.config.depth) {
                  reason = 'depth_exceeded';
                } else {
                  reason = 'duplicate_or_outside_scope';
                }
              }
            }

            if (decision === 'ACCEPTED') {
              acceptedCount++;
              queuedCount++;
            } else {
              rejectedLinks.push({ url: normUrl, reason });
            }
          });

          console.log(`[CRAWL INSTRUMENTATION] REJECTED LINKS:`);
          rejectedLinks.forEach((rl, idx) => {
            console.log(`  ${idx + 1}. URL: ${rl.url} | REJECTION_REASON: ${rl.reason}`);
          });

          console.log(`[CRAWL INSTRUMENTATION] ACCEPTED LINKS: ${acceptedCount}`);
          console.log(`[CRAWL INSTRUMENTATION] QUEUED LINKS: ${queuedCount}`);
          console.log(`[CRAWL INSTRUMENTATION] QUEUE AFTER DISCOVERY: ${this.queue.getPendingCount()}`);
          console.log(`[CRAWL INSTRUMENTATION] ACTIVE WORKERS: 1`);

          this.onEvent({
            type: 'PAGE_COMPLETED',
            page: {
              url: data.url,
              status: data.statusCode,
              statusText: data.statusText,
              time: data.time,
              size: data.size,
              title: parsed.title,
              description: parsed.description,
              metaRobots: parsed.metaRobots,
              canonical: parsed.canonical || data.url,
              hreflangs: parsed.hreflangs,
              headings: parsed.headings,
              language: parsed.language,
              viewport: parsed.viewport,
              openGraph: parsed.openGraph,
              twitterCard: parsed.twitterCard,
              structuredData: parsed.structuredData,
              wordCount: parsed.wordCount,
              charCount: parsed.charCount,
              paragraphCount: parsed.paragraphCount,
              fingerprint: parsed.fingerprint,
              scripts: parsed.scripts,
              stylesheets: parsed.stylesheets,
              iframes: parsed.iframes,
              depth: item.depth,
              parentUrl: item.parentUrl,
              timestamp: new Date().toLocaleTimeString(),
              securityHeaders: parsed.securityHeaders,
              headers: parsed.headers,
              discoverySource: item.discoverySource || 'INTERNAL_LINK'
            },
            links: parsed.links,
            images: parsed.images,
            resources: parsed.resources
          });

        } else {
          console.log(`[CRAWL INSTRUMENTATION] HTTP STATUS: ${data.statusCode || 'FAILED'}`);
          console.log(`[CRAWL INSTRUMENTATION] Fetch failed with error: ${data.error}`);
          this.failedCount++;
          this.onEvent({
            type: 'PAGE_FAILED',
            url: data.url,
            error: data.error
          });
        }

        this.emitProgress(data.url);
        
        // Politeness concurrency delay throttle
        setTimeout(() => this.runNext(), 500);
      };
    }
  }

  private emitProgress(url: string) {
    this.onEvent({
      type: 'PROGRESS',
      url,
      crawled: this.crawledCount,
      pending: this.queue.getPendingCount(),
      skipped: this.skippedCount,
      blocked: this.blockedCount,
      failed: this.failedCount
    });
  }

  public parsePage(url: string, html: string, headers: Record<string, string> = {}) {
    const targetHost = new URL(url).hostname;

    // Title tag
    const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    // Description meta tag
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) || 
                      html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
    const description = descMatch ? descMatch[1].trim() : '';

    // Meta robots
    const robotsMatch = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i) ||
                        html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']robots["']/i);
    const metaRobots = robotsMatch ? robotsMatch[1].trim() : (headers['x-robots-tag'] || 'index, follow');

    // Canonical link tag
    const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i) ||
                           html.match(/<link[^>]*href=["']([^"']*)["'][^>]*rel=["']canonical["']/i);
    const canonical = canonicalMatch ? canonicalMatch[1].trim() : '';

    // Hreflang alternates
    const hreflangs: { lang: string, href: string }[] = [];
    const hreflangRegex = /<link[^>]*rel=["']alternate["'][^>]*hreflang=["']([^"']*)["'][^>]*href=["']([^"']*)["']/gi;
    let hrlMatch;
    while ((hrlMatch = hreflangRegex.exec(html)) !== null) {
      hreflangs.push({ lang: hrlMatch[1], href: hrlMatch[2] });
    }

    // Language code
    const langMatch = html.match(/<html[^>]*lang=["']([^"']*)["']/i);
    const language = langMatch ? langMatch[1].trim() : 'en';

    // Viewport tag
    const viewportMatch = html.match(/<meta[^>]*name=["']viewport["'][^>]*content=["']([^"']*)["']/i) ||
                          html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']viewport["']/i);
    const viewport = viewportMatch ? viewportMatch[1].trim() : '';

    // Headings H1-H6 outline
    const headings: { tag: string, text: string }[] = [];
    const headingRegex = /<(h[1-6])[^>]*>([\s\S]*?)<\/\1>/gi;
    let hdMatch;
    while ((hdMatch = headingRegex.exec(html)) !== null) {
      headings.push({
        tag: hdMatch[1].toLowerCase(),
        text: hdMatch[2].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
      });
    }

    // Open Graph attributes
    const openGraph: Record<string, string> = {};
    const ogRegex = /<meta[^>]*property=["']og:([^"']*)["'][^>]*content=["']([^"']*)["']/gi;
    let ogMatch;
    while ((ogMatch = ogRegex.exec(html)) !== null) {
      openGraph[ogMatch[1].toLowerCase()] = ogMatch[2].trim();
    }

    // Twitter card attributes
    const twitterCard: Record<string, string> = {};
    const twitterRegex = /<meta[^>]*name=["']twitter:([^"']*)["'][^>]*content=["']([^"']*)["']/gi;
    let twMatch;
    while ((twMatch = twitterRegex.exec(html)) !== null) {
      twitterCard[twMatch[1].toLowerCase()] = twMatch[2].trim();
    }

    // Structured JSON-LD metadata lists
    const structuredData: string[] = [];
    const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let ldMatch;
    while ((ldMatch = jsonLdRegex.exec(html)) !== null) {
      structuredData.push(ldMatch[1].trim());
    }

    // Clean visible text parameters
    const cleanText = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                          .replace(/<[^>]*>/g, ' ')
                          .replace(/\s+/g, ' ')
                          .trim();
    const wordCount = cleanText.split(/\s+/).filter(Boolean).length;
    const charCount = cleanText.length;

    const pMatch = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
    const paragraphCount = pMatch ? pMatch.length : 0;
    const fingerprint = wordCount + '_' + cleanText.slice(0, 30).replace(/\s+/g, '_');

    // Anchor links parser with rel and targets metadata
    const links: any[] = [];
    const aRegex = /<a\s+([^>]*?)href=["']([^"']*)["']([^>]*?)>([\s\S]*?)<\/a>/gi;
    let lMatch;
    while ((lMatch = aRegex.exec(html)) !== null) {
      const attrsBefore = lMatch[1];
      const href = lMatch[2].trim();
      const attrsAfter = lMatch[3];
      const anchorText = lMatch[4].replace(/<[^>]*>/g, '').trim();

      if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
        try {
          const absolute = new URL(href, url).toString();
          const relMatch = (attrsBefore + ' ' + attrsAfter).match(/rel=["']([^"']*)["']/i);
          const rel = relMatch ? relMatch[1] : '';
          const follow = !rel.includes('nofollow');
          const isExt = !absolute.includes(targetHost);

          links.push({
            source: url,
            destination: normalizeUrl(absolute),
            anchor: anchorText || 'No Anchor Text',
            rel,
            follow,
            isExternal: isExt,
            status: 200
          });
        } catch {
          // ignore invalid resolved URLs
        }
      }
    }

    // Image tags parser with dimensions and loading scopes
    const images: any[] = [];
    const imgRegex = /<img\s+([^>]*?)>/gi;
    let imgMatch;
    while ((imgMatch = imgRegex.exec(html)) !== null) {
      const attrs = imgMatch[1];
      const srcM = attrs.match(/src=["']([^"']*)["']/i);
      const altM = attrs.match(/alt=["']([^"']*)["']/i);
      const widthM = attrs.match(/width=["']([^"']*)["']/i);
      const heightM = attrs.match(/height=["']([^"']*)["']/i);
      const loadingM = attrs.match(/loading=["']([^"']*)["']/i);

      if (srcM) {
        const src = srcM[1];
        const isExt = !src.includes(targetHost) && (src.startsWith('http') || src.startsWith('//'));
        images.push({
          pageUrl: url,
          url: src,
          alt: altM ? altM[1] : '',
          width: widthM ? parseInt(widthM[1]) || 0 : 0,
          height: heightM ? parseInt(heightM[1]) || 0 : 0,
          loading: loadingM ? loadingM[1] : 'eager',
          isExternal: isExt,
          status: 200
        });
      }
    }

    // Scripts, Stylesheets and Iframe resources
    const resources: any[] = [];
    
    const scriptRegex = /<script\s+[^>]*src=["']([^"']*)["']/gi;
    let scrMatch;
    while ((scrMatch = scriptRegex.exec(html)) !== null) {
      resources.push({
        pageUrl: url,
        url: scrMatch[1],
        type: 'js',
        status: 200
      });
    }

    const styleRegex = /<link\s+[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']*)["']/gi;
    let styMatch;
    while ((styMatch = styleRegex.exec(html)) !== null) {
      resources.push({
        pageUrl: url,
        url: styMatch[1],
        type: 'css',
        status: 200
      });
    }

    const iframeRegex = /<iframe\s+[^>]*src=["']([^"']*)["']/gi;
    let ifrMatch;
    while ((ifrMatch = iframeRegex.exec(html)) !== null) {
      resources.push({
        pageUrl: url,
        url: ifrMatch[1],
        type: 'iframe',
        status: 200
      });
    }

    const noindex = /noindex/i.test(metaRobots) || (headers['x-robots-tag'] && /noindex/i.test(headers['x-robots-tag']));
    const indexability = noindex ? 'Noindex' : 'Indexable';
    const h1s = headings.filter(h => h.tag === 'h1').map(h => h.text);

    const scripts = resources.filter(r => r.type === 'js').map(r => r.url);
    const stylesheets = resources.filter(r => r.type === 'css').map(r => r.url);
    const iframes = resources.filter(r => r.type === 'iframe').map(r => r.url);

    // Passive HTTP Security Headers classification
    const securityHeaders = {
      HSTS: headers['strict-transport-security'] ? 'PRESENT' : 'MISSING',
      CSP: headers['content-security-policy'] ? 'PRESENT' : 'MISSING',
      XFrameOptions: headers['x-frame-options'] ? 'PRESENT' : 'MISSING',
      XContentTypeOptions: headers['x-content-type-options'] ? 'PRESENT' : 'MISSING',
      ReferrerPolicy: headers['referrer-policy'] ? 'PRESENT' : 'MISSING',
      PermissionsPolicy: headers['permissions-policy'] ? 'PRESENT' : 'MISSING',
      COOP: headers['cross-origin-opener-policy'] ? 'PRESENT' : 'MISSING',
      CORP: headers['cross-origin-resource-policy'] ? 'PRESENT' : 'MISSING',
      COEP: headers['cross-origin-embedder-policy'] ? 'PRESENT' : 'MISSING'
    };

    return {
      title,
      description,
      metaRobots,
      canonical,
      indexability,
      h1s,
      hreflangs,
      headings,
      language,
      viewport,
      openGraph,
      twitterCard,
      structuredData,
      wordCount,
      charCount,
      paragraphCount,
      fingerprint,
      links,
      images,
      resources,
      scripts,
      stylesheets,
      iframes,
      securityHeaders,
      headers
    };
  }

  public pause(): void {
    this.isPaused = true;
  }

  public resume(): void {
    this.isPaused = false;
    this.runNext();
  }

  public terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}

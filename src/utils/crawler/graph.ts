/* eslint-disable @typescript-eslint/no-explicit-any */
import type { PageRecord, PageLinkRecord } from './storage';

export interface OrphanRecord {
  url: string;
  title: string;
  discoverySource: string;
  parentUrl: string;
  isCandidate: boolean;
  reason: string;
}

export interface HubRecord {
  url: string;
  title: string;
  inboundDegree: number;
  outboundDegree: number;
  totalDegree: number;
}

export interface RedirectChainRecord {
  source: string;
  destination: string;
  chain: string[];
  chainLength: number;
  isLoop: boolean;
  loopTarget?: string;
  status: number;
}

export interface BrokenLinkGraphRecord {
  source: string;
  destination: string;
  status: number;
  anchorText: string;
}

export const GRAPH_ALGORITHM_VERSION = 'connectivity-stddev-v1.0.0';

/**
 * Calculates connected components count on the undirected representation of the crawler internal links.
 */
export function calculateWeaklyConnectedComponents(pages: PageRecord[], links: PageLinkRecord[]): number {
  if (pages.length === 0) return 0;

  const adj = new Map<string, string[]>();
  pages.forEach(p => adj.set(p.url, []));

  links.forEach(l => {
    if (l.isExternal) return;
    if (adj.has(l.source) && adj.has(l.destination)) {
      adj.get(l.source)!.push(l.destination);
      adj.get(l.destination)!.push(l.source);
    }
  });

  const visited = new Set<string>();
  let componentsCount = 0;

  pages.forEach(p => {
    if (!visited.has(p.url)) {
      componentsCount++;
      const queue = [p.url];
      visited.add(p.url);
      while (queue.length > 0) {
        const curr = queue.shift()!;
        const neighbors = adj.get(curr) || [];
        neighbors.forEach(n => {
          if (!visited.has(n)) {
            visited.add(n);
            queue.push(n);
          }
        });
      }
    }
  });

  return componentsCount;
}

/**
 * Classifies orphan pages and candidate orphans.
 */
export function calculateOrphans(pages: PageRecord[], links: PageLinkRecord[]): OrphanRecord[] {
  if (pages.length === 0) return [];

  const inboundCounts = new Map<string, number>();
  pages.forEach(p => inboundCounts.set(p.url, 0));

  links.forEach(l => {
    if (l.isExternal) return;
    if (inboundCounts.has(l.destination)) {
      inboundCounts.set(l.destination, inboundCounts.get(l.destination)! + 1);
    }
  });

  const orphans: OrphanRecord[] = [];
  pages.forEach(page => {
    // Starting node (depth === 0) cannot be considered an orphan
    if (page.depth === 0) return;

    const count = inboundCounts.get(page.url) || 0;
    if (count === 0) {
      const source = page.discoverySource || 'INTERNAL_LINK';
      let isCandidate = true;
      let reason = `0 internal HTML inbound links. Discovered via parent URL: ${page.parentUrl || 'None'}`;

      if (source === 'SITEMAP') {
        isCandidate = true;
        reason = '0 internal HTML inbound links. Discovered in sitemap.xml';
      } else if (source === 'CANONICAL') {
        isCandidate = true;
        reason = '0 internal HTML inbound links. Discovered via canonical reference';
      } else if (source === 'HREFLANG') {
        isCandidate = true;
        reason = '0 internal HTML inbound links. Discovered via hreflang reference';
      } else if (source === 'USER_INPUT') {
        isCandidate = false;
        reason = 'Seed URL configuration with no internal references';
      }

      orphans.push({
        url: page.url,
        title: page.title || 'Untitled Page',
        discoverySource: source,
        parentUrl: page.parentUrl,
        isCandidate,
        reason
      });
    }
  });

  return orphans;
}

/**
 * Identifies high-connectivity hub pages using standard deviation thresholding.
 */
export function calculateHubs(pages: PageRecord[], links: PageLinkRecord[]): HubRecord[] {
  if (pages.length === 0) return [];

  const inbound = new Map<string, number>();
  const outbound = new Map<string, number>();

  pages.forEach(p => {
    inbound.set(p.url, 0);
    outbound.set(p.url, 0);
  });

  links.forEach(l => {
    if (l.isExternal) return;
    if (inbound.has(l.destination)) {
      inbound.set(l.destination, inbound.get(l.destination)! + 1);
    }
    if (outbound.has(l.source)) {
      outbound.set(l.source, outbound.get(l.source)! + 1);
    }
  });

  const degreeMap = pages.map(p => {
    const inDeg = inbound.get(p.url) || 0;
    const outDeg = outbound.get(p.url) || 0;
    return {
      url: p.url,
      title: p.title || 'Untitled Page',
      inboundDegree: inDeg,
      outboundDegree: outDeg,
      totalDegree: inDeg + outDeg
    };
  });

  const totalSum = degreeMap.reduce((acc, d) => acc + d.totalDegree, 0);
  const avgDegree = totalSum / pages.length;

  const variance = degreeMap.reduce((acc, d) => acc + Math.pow(d.totalDegree - avgDegree, 2), 0) / pages.length;
  const stddev = Math.sqrt(variance);

  // We set a minimum threshold of 5 to protect small crawls from naming everything a hub
  const threshold = Math.max(5, avgDegree + 2 * stddev);

  return degreeMap
    .filter(d => d.totalDegree > threshold)
    .sort((a, b) => b.totalDegree - a.totalDegree);
}

/**
 * Calculates a path from sourceUrl to destinationUrl using BFS shortest path traversal.
 */
export function findPath(sourceUrl: string, destinationUrl: string, links: PageLinkRecord[]): string[] | null {
  if (sourceUrl === destinationUrl) return [sourceUrl];

  const adj = new Map<string, string[]>();
  links.forEach(l => {
    if (l.isExternal) return;
    if (!adj.has(l.source)) adj.set(l.source, []);
    adj.get(l.source)!.push(l.destination);
  });

  const visited = new Set<string>();
  const parent = new Map<string, string>();
  const queue = [sourceUrl];
  visited.add(sourceUrl);

  let found = false;
  while (queue.length > 0) {
    const curr = queue.shift()!;
    if (curr === destinationUrl) {
      found = true;
      break;
    }

    const neighbors = adj.get(curr) || [];
    for (const n of neighbors) {
      if (!visited.has(n)) {
        visited.add(n);
        parent.set(n, curr);
        queue.push(n);
      }
    }
  }

  if (!found) return null;

  const path: string[] = [];
  let curr: string | undefined = destinationUrl;
  while (curr) {
    path.unshift(curr);
    curr = parent.get(curr);
  }

  return path;
}

/**
 * Fetches nodes and edges within K-hops from a target URL.
 */
export function getNeighborhood(
  targetUrl: string,
  hops: number,
  pages: PageRecord[],
  links: PageLinkRecord[]
): { nodes: PageRecord[]; edges: PageLinkRecord[] } {
  const pageMap = new Map<string, PageRecord>();
  pages.forEach(p => pageMap.set(p.url, p));

  let visited = new Set<string>([targetUrl]);

  for (let h = 0; h < hops; h++) {
    const nextVisited = new Set<string>(visited);
    links.forEach(l => {
      if (l.isExternal) return;
      if (visited.has(l.source)) {
        nextVisited.add(l.destination);
      }
      if (visited.has(l.destination)) {
        nextVisited.add(l.source);
      }
    });
    visited = nextVisited;
  }

  const nodes = pages.filter(p => visited.has(p.url));
  const edges = links.filter(l => visited.has(l.source) && visited.has(l.destination));

  return { nodes, edges };
}

/**
 * Traces redirect chains and loops in the crawled links.
 */
export function calculateRedirectsGraph(pages: PageRecord[], links: PageLinkRecord[]): RedirectChainRecord[] {
  const pageMap = new Map<string, PageRecord>();
  pages.forEach(p => pageMap.set(p.url, p));

  // Build redirect map for internal nodes
  const redirectMap = new Map<string, PageLinkRecord>();
  links.forEach(l => {
    if (l.isExternal) return;
    if (l.status >= 300 && l.status < 400) {
      redirectMap.set(l.source, l);
    }
  });

  const chains: RedirectChainRecord[] = [];

  redirectMap.forEach((firstRedirect, startUrl) => {
    const chain: string[] = [startUrl];
    const visited = new Set<string>([startUrl]);

    let currLink: PageLinkRecord | undefined = firstRedirect;
    let isLoop = false;
    let loopTarget: string | undefined;

    while (currLink) {
      const dest = currLink.destination;
      chain.push(dest);

      if (visited.has(dest)) {
        isLoop = true;
        loopTarget = dest;
        break;
      }

      visited.add(dest);
      currLink = redirectMap.get(dest);

      // Protect against overly long redirect chains
      if (chain.length > 15) break;
    }

    const lastUrl = chain[chain.length - 1];
    const lastPage = pageMap.get(lastUrl);

    chains.push({
      source: startUrl,
      destination: lastUrl,
      chain,
      chainLength: chain.length - 1,
      isLoop,
      loopTarget,
      status: lastPage ? lastPage.status : (isLoop ? 310 : 0)
    });
  });

  return chains;
}

/**
 * Extracts broken outbound links pointing to status codes >= 400.
 */
export function calculateBrokenLinksGraph(links: PageLinkRecord[]): BrokenLinkGraphRecord[] {
  const brokenLinks = links.filter(l => l.status >= 400 || l.status === 0);
  return brokenLinks.map(l => ({
    source: l.source,
    destination: l.destination,
    status: l.status,
    anchorText: l.anchor || 'None'
  }));
}

/**
 * Computes crawl depth statistics dynamically.
 */
export function calculateDepthStats(
  pages: PageRecord[],
  links: PageLinkRecord[]
): { depth: number; pageCount: number; issueCount: number; avgInbound: number; avgOutbound: number }[] {
  const depthGroups = new Map<number, PageRecord[]>();
  pages.forEach(p => {
    const d = p.depth || 0;
    if (!depthGroups.has(d)) depthGroups.set(d, []);
    depthGroups.get(d)!.push(p);
  });

  const inbound = new Map<string, number>();
  const outbound = new Map<string, number>();
  pages.forEach(p => {
    inbound.set(p.url, 0);
    outbound.set(p.url, 0);
  });

  links.forEach(l => {
    if (l.isExternal) return;
    if (inbound.has(l.destination)) {
      inbound.set(l.destination, inbound.get(l.destination)! + 1);
    }
    if (outbound.has(l.source)) {
      outbound.set(l.source, outbound.get(l.source)! + 1);
    }
  });

  const statsList: any[] = [];
  depthGroups.forEach((pagesInDepth, d) => {
    let totalInbound = 0;
    let totalOutbound = 0;
    pagesInDepth.forEach(p => {
      totalInbound += inbound.get(p.url) || 0;
      totalOutbound += outbound.get(p.url) || 0;
    });

    statsList.push({
      depth: d,
      pageCount: pagesInDepth.length,
      issueCount: 0, // Will be incremented reactively when rendering
      avgInbound: pagesInDepth.length > 0 ? parseFloat((totalInbound / pagesInDepth.length).toFixed(2)) : 0,
      avgOutbound: pagesInDepth.length > 0 ? parseFloat((totalOutbound / pagesInDepth.length).toFixed(2)) : 0
    });
  });

  return statsList.sort((a, b) => a.depth - b.depth);
}

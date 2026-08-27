/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Shield, Play, Pause, Square, Trash2, ArrowLeft, ExternalLink, AlertTriangle, Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import { CrawlEngine } from '../utils/crawler/engine';

import { CrawlStorage } from '../utils/crawler/storage';
import { runAllAnalyzers } from '../utils/crawler/analyzers';
import { normalizeUrl } from '../utils/crawler/url';
import { calculateCrawlScores, SCORING_VERSION } from '../utils/crawler/scoring';
import { eventBroker } from '../utils/crawler/events';
import type { CrawlScoreProfile } from '../utils/crawler/scoring';
import type { CrawlRecord, PageRecord, PageLinkRecord, PageImageRecord, PageResourceRecord } from '../utils/crawler/storage';
import type { IssueRecord as CrawlerIssue } from '../utils/crawler/analyzers';

interface AggregatedIssueRecord {
  id: string;
  severity: 'critical' | 'warning' | 'notice';
  rule: string;
  pagesCount: number;
  affectedUrls: string[];
  category?: string;
}



export default function WebsiteCrawler() {
  const storage = useMemo(() => new CrawlStorage(), []);

  // Crawl Configurations state
  const [targetUrl, setTargetUrl] = useState<string>('https://quotes.toscrape.com');
  const [maxUrls, setMaxUrls] = useState<number>(20);
  const [crawlDepth, setCrawlDepth] = useState<number>(2);
  const [respectRobots, setRespectRobots] = useState<boolean>(true);
  const [includeSubdomains, setIncludeSubdomains] = useState<boolean>(false);
  const [jsRendering, setJsRendering] = useState<'html' | 'js'>('html');

  // Active status tracking state
  const [activeCrawlId, setActiveCrawlId] = useState<string | null>(null);
  const [crawlStatus, setCrawlStatus] = useState<CrawlRecord['status']>('QUEUED');
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [discoveredCount, setDiscoveredCount] = useState<number>(0);
  const [crawledCount, setCrawledCount] = useState<number>(0);
  const [queuedCount, setQueuedCount] = useState<number>(0);
  const [failedCount, setFailedCount] = useState<number>(0);
  const [blockedCount, setBlockedCount] = useState<number>(0);
  const [skippedCount, setSkippedCount] = useState<number>(0);
  
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [liveProcessingUrls, setLiveProcessingUrls] = useState<string[]>([]);
  const [liveUrlsPerMin, setLiveUrlsPerMin] = useState<number>(0);
  const [liveUrlsPerSec, setLiveUrlsPerSec] = useState<number>(0);
  const [liveAvgTime, setLiveAvgTime] = useState<number>(0);

  // Graph Visualizer Zoom & Pan Parameters
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  
  // Phase 11 Graph State Hooks
  const [graphNodes, setGraphNodes] = useState<any[]>([]);
  const [graphEdges, setGraphEdges] = useState<any[]>([]);
  const [graphStats, setGraphStats] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'full' | 'focus'>('focus'); // Default Focus Mode for large graphs stability
  const [hopsLimit, setHopsLimit] = useState<number>(1);
  const [graphViewType, setGraphViewType] = useState<'tree' | 'link' | 'domain' | 'issue' | 'redirect' | 'diff'>('link');

  // Phase 13 Comparison States
  const [activeComparisonResult, setActiveComparisonResult] = useState<any | null>(null);
  const [comparisonJobs, setComparisonJobs] = useState<any[]>([]);
  const [comparisonTab, setComparisonTab] = useState<'summary' | 'explorer'>('summary');
  const [comparePagesList, setComparePagesList] = useState<any[]>([]);
  const [compareTotalPages, setCompareTotalPages] = useState<number>(1);
  const [compareCurrentPage, setCompareCurrentPage] = useState<number>(1);
  const [compareFilter, setCompareFilter] = useState<string>('All');
  const [selectedCompareUrl, setSelectedCompareUrl] = useState<string | null>(null);
  const [comparePageDetailsA, setComparePageDetailsA] = useState<any | null>(null);
  const [comparePageDetailsB, setComparePageDetailsB] = useState<any | null>(null);
  const [compareDetailsChanges, setCompareDetailsChanges] = useState<any[]>([]);
  const [isLoadingCompareDetails, setIsLoadingCompareDetails] = useState<boolean>(false);
  const [pathSource, setPathSource] = useState<string>('');
  const [pathDestination, setPathDestination] = useState<string>('');
  const [pathList, setPathList] = useState<string[] | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [depthStats, setDepthStats] = useState<any[]>([]);
  const [orphansList, setOrphansList] = useState<any[]>([]);
  const [hubsList, setHubsList] = useState<any[]>([]);
  const [redirectsList, setRedirectsList] = useState<any[]>([]);
  const [brokenLinksList, setBrokenLinksList] = useState<any[]>([]);
  const [graphSearchQuery, setGraphSearchQuery] = useState<string>('');
  
  // Graph diagnostics sub-tabs
  const [graphSubTab, setGraphSubTab] = useState<'summary' | 'pathfinder' | 'depth' | 'hubs' | 'orphans' | 'redirects' | 'broken'>('summary');
  
  // Graph Canvas References
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  
  // Selected graph filters
  const [selectedDepthFilter, setSelectedDepthFilter] = useState<string>('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('');

  // Phase 12 Export Center States
  const [exportJobs, setExportJobs] = useState<any[]>([]);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'xlsx' | 'pdf'>('csv');
  const [exportScope, setExportScope] = useState<'entire' | 'filtered'>('entire');
  const [selectedExportDatasets, setSelectedExportDatasets] = useState<string[]>(['pages', 'issues', 'links', 'redirects']);



  // Global aggregate views states
  const [activeTab, setActiveTab] = useState<'setup' | 'dashboard' | 'pages' | 'issues' | 'structure' | 'compare' | 'history' | 'export'>('setup');
  const [selectedSection, setSelectedSection] = useState<string>('overview');

  // Selected Inspect Details
  const [selectedPage, setSelectedPage] = useState<PageRecord | null>(null);
  const [selectedIssueRule, setSelectedIssueRule] = useState<string | null>(null);

  // Inspector states
  const [inspectorTab, setInspectorTab] = useState<'overview' | 'http_headers' | 'seo_headings' | 'social_schema' | 'links' | 'resources' | 'security_perf' | 'content_dup' | 'issues' | 'raw'>('overview');
  const [inspectorLinksSearch, setInspectorLinksSearch] = useState<string>('');
  const [inspectorLinksTab, setInspectorLinksTab] = useState<'all' | 'internal' | 'external' | 'broken' | 'redirect' | 'nofollow'>('all');
  const [inspectorLinksPage, setInspectorLinksPage] = useState<number>(1);
  const [inspectorImagesSearch, setInspectorImagesSearch] = useState<string>('');
  const [inspectorImagesPage, setInspectorImagesPage] = useState<number>(1);
  const [headersSearch, setHeadersSearch] = useState<string>('');
  
  const [inspectorLinks, setInspectorLinks] = useState<PageLinkRecord[]>([]);
  const [inboundLinks, setInboundLinks] = useState<PageLinkRecord[]>([]);
  const [inspectorImages, setInspectorImages] = useState<PageImageRecord[]>([]);
  const [inspectorIssues, setInspectorIssues] = useState<CrawlerIssue[]>([]);
  const [isLoadingInspectorData, setIsLoadingInspectorData] = useState<boolean>(false);

  // Compare Crawls States
  const [compareCrawlIdA, setCompareCrawlIdA] = useState<string>('');
  const [compareCrawlIdB, setCompareCrawlIdB] = useState<string>('');

  // Storage persistence instance
  const [crawlHistoryList, setCrawlHistoryList] = useState<CrawlRecord[]>([]);
  
  // Page logs search filter
  const [pageLogSearch, setPageLogSearch] = useState<string>('');

  // Crawled pages in memory
  const [sessionPages, setSessionPages] = useState<PageRecord[]>([]);
  const [crawledIssues, setCrawledIssues] = useState<CrawlerIssue[]>([]);
  const [activeScoreProfile, setActiveScoreProfile] = useState<CrawlScoreProfile | null>(null);

  // --- Phase 9 Dashboard Subsections States ---
  const [overviewStats, setOverviewStats] = useState<any | null>(null);
  const [urlExplorerData, setUrlExplorerData] = useState<any | null>(null);
  const [explorerPage, setExplorerPage] = useState<number>(1);
  const [explorerQuery, setExplorerQuery] = useState<string>('');
  const [explorerStatusFilter, setExplorerStatusFilter] = useState<string>('');
  const [issuesData, setIssuesData] = useState<any | null>(null);
  const [issuesPage, setIssuesPage] = useState<number>(1);
  const [issuesCategoryFilter, setIssuesCategoryFilter] = useState<string>('');
  const [issuesSeverityFilter, setIssuesSeverityFilter] = useState<string>('');
  const [seoSummaryData, setSeoSummaryData] = useState<any | null>(null);
  const [linksData, setLinksData] = useState<any | null>(null);
  const [redirectsData, setRedirectsData] = useState<any | null>(null);
  const [contentData, setContentData] = useState<any | null>(null);
  const [imageData, setImageData] = useState<any | null>(null);
  const [resourceData, setResourceData] = useState<any | null>(null);
  const [securityData, setSecurityData] = useState<any | null>(null);
  const [performanceData, setPerformanceData] = useState<any | null>(null);
  const [indexabilityData, setIndexabilityData] = useState<any | null>(null);
  const [robotsData, setRobotsData] = useState<any | null>(null);
  const [sitemapData, setSitemapData] = useState<any | null>(null);

  // Crawl Engine reference
  const engineRef = useRef<CrawlEngine | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchHistory = useCallback(() => {
    storage.getHistory().then(history => {
      setCrawlHistoryList(history);
    }).catch(err => {
      console.error('Failed to load crawl history:', err);
    });
  }, [storage]);

  // --- Initialize Storage Session ---
  useEffect(() => {
    storage.init().then(() => {
      fetchHistory();
    }).catch(err => {
      console.error('Failed to initialize crawl storage:', err);
    });
  }, [storage, fetchHistory]);

  // --- Load Inspector Details ---
  useEffect(() => {
    if (!selectedPage || !activeCrawlId) {
      const timer = setTimeout(() => {
        setInspectorLinks([]);
        setInboundLinks([]);
        setInspectorImages([]);
        setInspectorIssues([]);
      }, 0);
      return () => clearTimeout(timer);
    }

    setTimeout(() => {
      setIsLoadingInspectorData(true);
    }, 0);
    Promise.all([
      storage.getLinksForCrawl(activeCrawlId),
      storage.getImagesForCrawl(activeCrawlId),
      storage.getResourcesForCrawl(activeCrawlId),
      storage.getIssuesForCrawl(activeCrawlId)
    ]).then(([links, images, , issues]) => {
      // Outbound links from this page
      const outbound = links.filter((l: PageLinkRecord) => l.source === selectedPage.url);
      // Inbound links pointing to this page
      const inbound = links.filter((l: PageLinkRecord) => l.destination === selectedPage.url);
      
      const pageImages = images.filter((img: PageImageRecord) => img.pageUrl === selectedPage.url);
      const pageIssues = issues.filter((iss: CrawlerIssue) => iss.url === selectedPage.url);

      setInspectorLinks(outbound);
      setInboundLinks(inbound);
      setInspectorImages(pageImages);
      setInspectorIssues(pageIssues);
      setIsLoadingInspectorData(false);
    }).catch(err => {
      console.error('Failed to load inspector data:', err);
      setIsLoadingInspectorData(false);
    });
  }, [selectedPage, activeCrawlId, storage]);

  // --- Inspector Memoized Calculations ---
  const headingAudits = useMemo(() => {
    if (!selectedPage || !selectedPage.headings) return { h1Count: 0, errors: [] };
    const headings = selectedPage.headings;
    const errors: string[] = [];
    let h1Count = 0;
    
    headings.forEach((h: { tag: string; text: string }) => {
      if (h.tag === 'h1') h1Count++;
      if (!h.text.trim()) {
        errors.push(`Empty Heading: found an empty <${h.tag}> tag`);
      }
    });

    if (h1Count === 0) {
      errors.push('Missing H1: page does not contain any H1 headings.');
    } else if (h1Count > 1) {
      errors.push(`Multiple H1s: found ${h1Count} H1 headings on the page.`);
    }

    // Check hierarchy steps (e.g. H1 -> H3 skipping H2)
    let lastLevel = 0;
    headings.forEach((h: any) => {
      const level = parseInt(h.tag.substring(1));
      if (lastLevel > 0 && level > lastLevel + 1) {
        errors.push(`Heading Hierarchy Skip: jumped from <h${lastLevel}> directly to <h${level}> ("${h.text.slice(0, 30)}...")`);
      }
      lastLevel = level;
    });

    return { h1Count, errors };
  }, [selectedPage]);

  const hreflangAudits = useMemo(() => {
    if (!selectedPage || !selectedPage.hreflangs) return [];
    
    return selectedPage.hreflangs.map((hl: any) => {
      const issuesList: string[] = [];
      
      const langRegex = /^[a-z]{2}(-[a-zA-Z]{2,4})?$/;
      if (hl.lang !== 'x-default' && !langRegex.test(hl.lang)) {
        issuesList.push(`Invalid code format "${hl.lang}"`);
      }
      
      const dupCount = selectedPage.hreflangs.filter((h: any) => h.lang === hl.lang).length;
      if (dupCount > 1) {
        issuesList.push(`Duplicate declaration for language "${hl.lang}"`);
      }

      const targetPage = sessionPages.find(p => p.url === hl.href);
      if (targetPage) {
        const hasReturnLink = targetPage.hreflangs?.some((h: any) => h.href === selectedPage.url);
        if (!hasReturnLink) {
          issuesList.push(`Missing return link: ${targetPage.url} does not link back to ${selectedPage.url}`);
        }
      } else {
        issuesList.push(`Unverified reciprocity: target page ${hl.href} was not crawled`);
      }

      return {
        ...hl,
        status: issuesList.length === 0 ? 'VALID' : 'INVALID',
        issues: issuesList
      };
    });
  }, [selectedPage, sessionPages]);

  const parsedStructuredData = useMemo(() => {
    if (!selectedPage || !selectedPage.structuredData) return [];
    return selectedPage.structuredData.map((raw: string) => {
      try {
        const obj = JSON.parse(raw);
        return {
          raw,
          parsed: obj,
          type: obj['@type'] || obj['type'] || 'Unknown Entity',
          status: 'VALID'
        };
      } catch (err) {
        return {
          raw,
          parsed: null,
          type: 'Syntax Error',
          status: `INVALID: ${(err as Error).message}`
        };
      }
    });
  }, [selectedPage]);

  const pageScoreProfile = useMemo(() => {
    if (!selectedPage) return null;

    const pageIssues = inspectorIssues;
    
    let techPenalties = 0;
    if (selectedPage.status >= 400) techPenalties += 40;
    else if (selectedPage.status >= 300) techPenalties += 10;
    
    const techScore = Math.max(0, 100 - techPenalties);

    let seoPenalties = 0;
    pageIssues.filter(i => i.category === 'SEO').forEach(issue => {
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
    const seoScore = Math.max(0, 100 - seoPenalties);

    let contentPenalties = 0;
    pageIssues.filter(i => i.category === 'CONTENT').forEach(issue => {
      switch (issue.rule) {
        case 'CONTENT_LOW_VOLUME': contentPenalties += 5; break;
        case 'CONTENT_DUPLICATE': contentPenalties += 20; break;
      }
    });
    const contentScore = Math.max(0, 100 - contentPenalties);

    let linksPenalties = 0;
    pageIssues.filter(i => i.category === 'LINKS').forEach(issue => {
      switch (issue.rule) {
        case 'LINK_BROKEN': linksPenalties += 15; break;
        case 'LINK_REDIRECT': linksPenalties += 3; break;
        case 'LINK_NO_INBOUND': linksPenalties += 5; break;
      }
    });
    const linksScore = Math.max(0, 100 - linksPenalties);

    let securityPenalties = 0;
    pageIssues.filter(i => i.category === 'SECURITY').forEach(issue => {
      switch (issue.rule) {
        case 'SECURITY_HSTS_MISSING': securityPenalties += 10; break;
        case 'SECURITY_CSP_MISSING': securityPenalties += 10; break;
        case 'SECURITY_XFRAME_MISSING': securityPenalties += 5; break;
        case 'SECURITY_XCONTENT_MISSING': securityPenalties += 5; break;
      }
    });
    const securityScore = Math.max(0, 100 - securityPenalties);

    let perfPenalties = 0;
    if (selectedPage.time > 1500) perfPenalties += 15;
    else if (selectedPage.time > 800) perfPenalties += 8;
    else if (selectedPage.time > 400) perfPenalties += 3;
    const performanceScore = Math.max(0, 100 - perfPenalties);

    const indexScore = selectedPage.indexability === 'noindex' ? 0 : 100;

    const overallScore = Math.round(
      (techScore + seoScore + contentScore + linksScore + securityScore + performanceScore + indexScore) / 7
    );

    return {
      overall: overallScore,
      technical: techScore,
      seo: seoScore,
      content: contentScore,
      links: linksScore,
      security: securityScore,
      performance: performanceScore,
      indexability: indexScore,
      penalties: {
        technical: techPenalties,
        seo: seoPenalties,
        content: contentPenalties,
        links: linksPenalties,
        security: securityPenalties,
        performance: perfPenalties,
        indexability: selectedPage.indexability === 'noindex' ? 100 : 0
      }
    };
  }, [selectedPage, inspectorIssues]);

  const deleteCrawlRecord = (id: string) => {
    if (!window.confirm('Delete this crawl session?')) return;
    storage.deleteCrawl(id).then(() => {
      fetchHistory();
    }).catch(err => {
      console.error('Failed to delete crawl session:', err);
    });
  };

  // --- Phase 9 Dashboard DataLoader ---
  const loadDashboardSection = useCallback(async (sectionName: string) => {
    if (!activeCrawlId) return;
    const baseUrl = `/api/crawler/crawls/${activeCrawlId}`;

    try {
      if (sectionName === 'overview') {
        const resStats = await fetch(`${baseUrl}/statistics`);
        setOverviewStats(await resStats.json());
      } else if (sectionName === 'urls') {
        const queryParams = new URLSearchParams({
          page: explorerPage.toString(),
          pageSize: '10',
          q: explorerQuery,
          status: explorerStatusFilter
        });
        const resUrls = await fetch(`${baseUrl}/pages?${queryParams.toString()}`);
        setUrlExplorerData(await resUrls.json());
      } else if (sectionName === 'issues') {
        const queryParams = new URLSearchParams({
          page: issuesPage.toString(),
          pageSize: '10',
          category: issuesCategoryFilter,
          severity: issuesSeverityFilter
        });
        const resIssues = await fetch(`${baseUrl}/issues?${queryParams.toString()}`);
        setIssuesData(await resIssues.json());
      } else if (sectionName === 'seo') {
        const resSeo = await fetch(`${baseUrl}/seo/summary`);
        setSeoSummaryData(await resSeo.json());
      } else if (sectionName === 'links') {
        const resLinks = await fetch(`${baseUrl}/links?pageSize=10`);
        setLinksData(await resLinks.json());
      } else if (sectionName === 'redirects') {
        const resRedir = await fetch(`${baseUrl}/redirects?pageSize=10`);
        setRedirectsData(await resRedir.json());
      } else if (sectionName === 'content') {
        const resPages = await fetch(`${baseUrl}/pages?pageSize=100`);
        const pagesJson = await resPages.json();
        const pagesList = pagesJson.data || [];
        const totalWords = pagesList.reduce((sum: number, p: PageRecord) => sum + (p.wordCount || 0), 0);
        const avgWords = pagesList.length > 0 ? Math.round(totalWords / pagesList.length) : 0;
        setContentData({
          totalWords,
          avgWords,
          lowContentCount: pagesList.filter((p: PageRecord) => p.wordCount < 100).length,
          pages: pagesList.slice(0, 10)
        });
      } else if (sectionName === 'images') {
        const resImg = await fetch(`${baseUrl}/images?pageSize=10`);
        setImageData(await resImg.json());
      } else if (sectionName === 'resources') {
        const resRes = await fetch(`${baseUrl}/resources?pageSize=10`);
        setResourceData(await resRes.json());
      } else if (sectionName === 'security') {
        const resPages = await fetch(`${baseUrl}/pages?pageSize=10`);
        setSecurityData(await resPages.json());
      } else if (sectionName === 'performance') {
        const resPages = await fetch(`${baseUrl}/pages?pageSize=10`);
        setPerformanceData(await resPages.json());
      } else if (sectionName === 'indexability') {
        const resPages = await fetch(`${baseUrl}/pages?pageSize=10`);
        setIndexabilityData(await resPages.json());
      } else if (sectionName === 'robots') {
        const resRobots = await fetch(`${baseUrl}/robots`);
        setRobotsData(await resRobots.json());
      } else if (sectionName === 'sitemap') {
        const resSitemap = await fetch(`${baseUrl}/sitemap`);
        setSitemapData(await resSitemap.json());
      }
    } catch (e) {
      console.error('Failed to fetch dashboard section data:', e);
    }
  }, [
    activeCrawlId,
    explorerPage,
    explorerQuery,
    explorerStatusFilter,
    issuesPage,
    issuesCategoryFilter,
    issuesSeverityFilter
  ]);

  useEffect(() => {
    if (activeCrawlId && activeTab === 'dashboard') {
      const timer = setTimeout(() => {
        loadDashboardSection(selectedSection);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [
    activeCrawlId,
    activeTab,
    selectedSection,
    explorerPage,
    explorerQuery,
    explorerStatusFilter,
    issuesPage,
    issuesCategoryFilter,
    issuesSeverityFilter,
    loadDashboardSection
  ]);

  // --- Realtime Event Broker Subscriptions ---
  useEffect(() => {
    if (!activeCrawlId) return;

    const { unsubscribe } = eventBroker.subscribe(activeCrawlId, () => {
      const snap = eventBroker.getSnapshot(activeCrawlId);
      setDiscoveredCount(snap.discovered);
      setQueuedCount(snap.queued);
      setCrawledCount(snap.completed);
      setFailedCount(snap.failed);
      setBlockedCount(snap.blocked);
      setSkippedCount(snap.skipped);
      setLiveProcessingUrls(snap.currentUrls);

      const metrics = eventBroker.getSpeedMetrics(activeCrawlId);
      setLiveUrlsPerMin(metrics.urlsPerMin);
      setLiveUrlsPerSec(metrics.urlsPerSec);
      setLiveAvgTime(metrics.avgTime || 0);
    });

    return () => unsubscribe();
  }, [activeCrawlId]);

  useEffect(() => {
    if (!activeCrawlId || crawlStatus !== 'CRAWLING') return;

    const interval = setInterval(() => {
      const metrics = eventBroker.getSpeedMetrics(activeCrawlId);
      setLiveUrlsPerMin(metrics.urlsPerMin);
      setLiveUrlsPerSec(metrics.urlsPerSec);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeCrawlId, crawlStatus]);

  const handleCrawlCompleted = useCallback((finalStatus: CrawlRecord['status'], crawlIdValue?: string) => {
    setCrawlStatus(finalStatus);
    if (timerRef.current) clearInterval(timerRef.current);
    if (engineRef.current) engineRef.current.terminate();

    const targetCrawlId = crawlIdValue || activeCrawlId;

    if (targetCrawlId) {
      if (finalStatus === 'PARTIAL') {
        eventBroker.publish(targetCrawlId, 'crawl_stopped', {});
      } else if (finalStatus === 'FAILED') {
        eventBroker.publish(targetCrawlId, 'crawl_failed', {});
      }

      // Persist crawl metadata
      Promise.all([
        storage.getPagesForCrawl(targetCrawlId),
        storage.getLinksForCrawl(targetCrawlId),
        storage.getResourcesForCrawl(targetCrawlId)
      ]).then(([pages, links, resources]) => {
        const issues: CrawlerIssue[] = [];
        pages.forEach(page => {
          const pageIssues = runAllAnalyzers(page, pages, links, resources);
          issues.push(...pageIssues);
        });

        storage.saveIssues(issues).then(() => {
          const profile = calculateCrawlScores(pages, issues, links, resources, failedCount);

          const session: CrawlRecord = {
            id: targetCrawlId,
            rootUrl: targetUrl,
            domain: new URL(targetUrl).hostname,
            timestamp: new Date().toLocaleString(),
            status: finalStatus,
            totalPages: pages.length,
            brokenLinks: links.filter(l => l.status >= 400).length,
            seoScore: profile.globalScore,
            duration: elapsedTime,
            maxUrls,
            depth: crawlDepth,
            scoringVersion: SCORING_VERSION,
            scoreProfile: JSON.stringify(profile)
          };

          storage.saveCrawl(session).then(() => {
            setActiveScoreProfile(profile);
            fetchHistory();
          });
        });
      }).catch(err => {
        console.error('Failed to run diagnostics:', err);
      });
    }
  }, [activeCrawlId, storage, targetUrl, elapsedTime, maxUrls, crawlDepth, failedCount, fetchHistory]);

  // --- Crawl Controller ---
  const spawnCrawlWorker = useCallback((startingUrl: string) => {
    if (engineRef.current) {
      engineRef.current.terminate();
    }

    const crawlId = `crawl-${Date.now()}`;
    setActiveCrawlId(crawlId);

    const engine = new CrawlEngine({
      startingUrl,
      maxUrls,
      depth: crawlDepth,
      respectRobots,
      includeSubdomains,
      jsRendering
    }, (event) => {
      if (event.type === 'STARTED') {
        eventBroker.publish(crawlId, 'crawl_started', {});
        setCrawlStatus('CRAWLING');
        setCrawledIssues([]);
        setActiveScoreProfile(null);
        setElapsedTime(0);
        setDiscoveredCount(0);
        setCrawledCount(0);
        setQueuedCount(0);
        setFailedCount(0);
        setBlockedCount(0);
        setSkippedCount(0);
        setSessionPages([]);

        // Start timer
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setElapsedTime(prev => prev + 1);
        }, 1000);
      } else if (event.type === 'PROGRESS') {
        eventBroker.publish(crawlId, 'url_started', { url: event.url });
        setCurrentUrl(event.url);
        setDiscoveredCount(event.crawled + event.pending);
        setQueuedCount(event.pending);
      } else if (event.type === 'SKIPPED') {
        eventBroker.publish(crawlId, 'url_skipped', { url: event.url });
        setSkippedCount(prev => prev + 1);
      } else if (event.type === 'BLOCKED') {
        eventBroker.publish(crawlId, 'url_blocked', { url: event.url });
        setBlockedCount(prev => prev + 1);
      } else if (event.type === 'PAGE_FAILED') {
        eventBroker.publish(crawlId, 'url_failed', { url: event.url });
        setFailedCount(prev => prev + 1);
      } else if (event.type === 'PAGE_COMPLETED') {
        eventBroker.publish(crawlId, 'url_completed', { url: event.page.url, time: event.page.time });
        setCrawledCount(prev => prev + 1);
        setSessionPages(prev => [...prev, event.page]);
        storage.savePage({ ...event.page, crawlId });
        storage.saveLinks(event.links.map((l: PageLinkRecord) => ({ ...l, crawlId })));
        storage.saveImages(event.images.map((img: PageImageRecord) => ({ ...img, crawlId })));
        storage.saveResources(event.resources.map((res: PageResourceRecord) => ({ ...res, crawlId })));
      } else if (event.type === 'COMPLETED') {
        eventBroker.publish(crawlId, 'crawl_completed', {});
        handleCrawlCompleted('CRAWLED', crawlId);
      }
    });

    engineRef.current = engine;
    engine.start();
  }, [maxUrls, crawlDepth, respectRobots, includeSubdomains, jsRendering, storage, handleCrawlCompleted]);

  const handlePauseCrawl = () => {
    if (activeCrawlId) {
      eventBroker.publish(activeCrawlId, 'crawl_paused', {});
    }
    setCrawlStatus('PAUSED');
    if (timerRef.current) clearInterval(timerRef.current);
    engineRef.current?.pause();
  };

  const handleResumeCrawl = () => {
    if (activeCrawlId) {
      eventBroker.publish(activeCrawlId, 'crawl_resumed', {});
    }
    setCrawlStatus('CRAWLING');
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    engineRef.current?.resume();
  };

  const handleStopCrawl = () => {
    handleCrawlCompleted('PARTIAL');
  };

  const selectCrawlRecord = (hist: CrawlRecord) => {
    setActiveCrawlId(hist.id);
    setTargetUrl(hist.rootUrl || '');
    setCrawlStatus(hist.status);
    setCrawledCount(hist.totalPages);
    setFailedCount(hist.brokenLinks);
    setElapsedTime(hist.duration);
    setMaxUrls(hist.maxUrls);
    setCrawlDepth(hist.depth);

    if (hist.scoreProfile) {
      try {
        setActiveScoreProfile(JSON.parse(hist.scoreProfile));
      } catch {
        setActiveScoreProfile(null);
      }
    } else {
      setActiveScoreProfile(null);
    }
    
    Promise.all([
      storage.getPagesForCrawl(hist.id),
      storage.getIssuesForCrawl(hist.id)
    ]).then(([pages, issues]) => {
      setSessionPages(pages);
      setCrawledIssues(issues);
      setActiveTab('dashboard');
    }).catch(err => {
      console.error('Failed to load crawl session:', err);
    });
  };

  // --- Dynamic SEO Issue Indexer ---
  const issueSummaryList = useMemo((): AggregatedIssueRecord[] => {
    const list = crawledIssues.length > 0 ? [...crawledIssues] : [];

    if (list.length === 0 && sessionPages.length > 0) {
      const liveIssues: any[] = [];
      sessionPages.forEach(p => {
        if (!p.title) {
          liveIssues.push({ crawlId: activeCrawlId || '', rule: 'SEO_TITLE_MISSING', category: 'SEO', severity: 'CRITICAL', url: p.url, description: 'Missing page title tags' });
        }
        if (!p.description) {
          liveIssues.push({ crawlId: activeCrawlId || '', rule: 'SEO_DESC_MISSING', category: 'SEO', severity: 'WARNING', url: p.url, description: 'Missing meta description tags' });
        }
        if (p.status >= 400) {
          liveIssues.push({ crawlId: activeCrawlId || '', rule: 'LINK_BROKEN', category: 'LINKS', severity: 'CRITICAL', url: p.url, description: 'Broken or failed internal links' });
        }
        if (p.wordCount < 100) {
          liveIssues.push({ crawlId: activeCrawlId || '', rule: 'CONTENT_LOW_VOLUME', category: 'CONTENT', severity: 'NOTICE', url: p.url, description: 'Low text content volume (under 100 words)' });
        }
        if (!p.canonical) {
          liveIssues.push({ crawlId: activeCrawlId || '', rule: 'SEO_CANONICAL_MISSING', category: 'SEO', severity: 'WARNING', url: p.url, description: 'Missing canonical declaration tags' });
        }
      });
      list.push(...liveIssues);
    }

    const grouped: Record<string, { rule: string; severity: 'critical' | 'warning' | 'notice'; affectedUrls: string[] }> = {};
    list.forEach(issue => {
      const key = issue.rule;
      if (!grouped[key]) {
        grouped[key] = {
          rule: issue.description || issue.rule,
          severity: issue.severity.toLowerCase() as any,
          affectedUrls: []
        };
      }
      if (!grouped[key].affectedUrls.includes(issue.url)) {
        grouped[key].affectedUrls.push(issue.url);
      }
    });

    return Object.entries(grouped).map(([id, item]) => ({
      id,
      rule: item.rule,
      severity: item.severity,
      pagesCount: item.affectedUrls.length,
      affectedUrls: item.affectedUrls
    }));
  }, [crawledIssues, sessionPages, activeCrawlId]);

  // --- Force Directed layout engine ---
  const runForceLayout = (nodes: any[], edges: any[], width: number, height: number) => {
    nodes.forEach((n) => {
      if (n.x === undefined) {
        n.x = width / 2 + (Math.random() - 0.5) * 200;
        n.y = height / 2 + (Math.random() - 0.5) * 200;
      }
      n.vx = 0;
      n.vy = 0;
    });

    const k = Math.sqrt((width * height) / (nodes.length || 1));
    const gravity = 0.04;
    const damping = 0.85;

    for (let step = 0; step < 100; step++) {
      // Repulsion force
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (dist < 300) {
            const force = (k * k) / dist;
            const fx = (dx / dist) * force * 0.12;
            const fy = (dy / dist) * force * 0.12;
            nodes[i].vx += fx;
            nodes[i].vy += fy;
            nodes[j].vx -= fx;
            nodes[j].vy -= fy;
          }
        }
      }

      // Attraction force
      edges.forEach(e => {
        const sourceNode = nodes.find(n => n.id === e.source);
        const destNode = nodes.find(n => n.id === e.destination);
        if (sourceNode && destNode) {
          const dx = destNode.x - sourceNode.x;
          const dy = destNode.y - sourceNode.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = (dist * dist) / (k * 2);
          const fx = (dx / dist) * force * 0.08;
          const fy = (dy / dist) * force * 0.08;
          sourceNode.vx += fx;
          sourceNode.vy += fy;
          destNode.vx -= fx;
          destNode.vy -= fy;
        }
      });

      // Update positions
      nodes.forEach(n => {
        n.vx += (width / 2 - n.x) * gravity * 0.5;
        n.vy += (height / 2 - n.y) * gravity * 0.5;
        n.x += n.vx;
        n.y += n.vy;
        n.vx *= damping;
        n.vy *= damping;
      });
    }
  };

  const computeCoordinates = useCallback((nodes: any[], edges: any[], width: number, height: number) => {
    if (nodes.length === 0) return;

    if (graphViewType === 'tree') {
      const depthGroups: Record<number, any[]> = {};
      nodes.forEach(n => {
        const d = n.depth || 0;
        if (!depthGroups[d]) depthGroups[d] = [];
        depthGroups[d].push(n);
      });

      Object.entries(depthGroups).forEach(([dStr, group]) => {
        const d = parseInt(dStr);
        const colWidth = 200;
        const startX = 80 + d * colWidth;
        const totalHeight = group.length * 65;
        const startY = Math.max(50, (height - totalHeight) / 2);
        group.forEach((node, idx) => {
          node.x = startX;
          node.y = startY + idx * 65;
        });
      });
    } else {
      runForceLayout(nodes, edges, width, height);
    }
  }, [graphViewType]);

  const loadGraphData = useCallback(async () => {
    if (!activeCrawlId) return;
    const baseUrl = `/api/crawler/crawls/${activeCrawlId}`;
    try {
      if (graphViewType === 'diff' && activeComparisonResult) {
        const { crawlIdA, crawlIdB, newUrls, pageChanges } = activeComparisonResult;
        
        const [pagesA, pagesB, linksA, linksB] = await Promise.all([
          storage.getPagesForCrawl(crawlIdA),
          storage.getPagesForCrawl(crawlIdB),
          storage.getLinksForCrawl(crawlIdA),
          storage.getLinksForCrawl(crawlIdB)
        ]);

        const mapPagesA = new Map<string, any>();
        pagesA.forEach((p: any) => mapPagesA.set(normalizeUrl(p.url), p));

        const mapPagesB = new Map<string, any>();
        pagesB.forEach((p: any) => mapPagesB.set(normalizeUrl(p.url), p));

        const setPageChanges = new Set(pageChanges.map((c: any) => normalizeUrl(c.url)));

        // Nodes
        const nodes: any[] = [];
        pagesB.forEach((p: any) => {
          const norm = normalizeUrl(p.url);
          const isNew = newUrls.includes(norm);
          const isChanged = setPageChanges.has(norm);
          nodes.push({
            id: p.url,
            url: p.url,
            status: p.status,
            depth: p.depth || 0,
            contentType: p.type || 'text/html',
            changeType: isNew ? 'NEW' : (isChanged ? 'CHANGED' : 'UNCHANGED')
          });
        });

        const setPagesB = new Set(pagesB.map((p: any) => normalizeUrl(p.url)));
        pagesA.forEach((p: any) => {
          const norm = normalizeUrl(p.url);
          if (!setPagesB.has(norm)) {
            nodes.push({
              id: p.url,
              url: p.url,
              status: p.status,
              depth: p.depth || 0,
              contentType: p.type || 'text/html',
              changeType: 'REMOVED'
            });
          }
        });

        // Edges
        const edges: any[] = [];
        const makeLinkKey = (l: any) => `${normalizeUrl(l.source)}|${normalizeUrl(l.destination)}`;
        const setLinksA = new Set(linksA.map((l: any) => makeLinkKey(l)));
        const setLinksB = new Set(linksB.map((l: any) => makeLinkKey(l)));

        linksB.forEach((l: any) => {
          const key = makeLinkKey(l);
          const isNew = !setLinksA.has(key);
          edges.push({
            source: l.source,
            destination: l.destination,
            status: l.status,
            changeType: isNew ? 'NEW' : 'UNCHANGED'
          });
        });

        linksA.forEach((l: any) => {
          const key = makeLinkKey(l);
          if (!setLinksB.has(key)) {
            edges.push({
              source: l.source,
              destination: l.destination,
              status: l.status,
              changeType: 'REMOVED'
            });
          }
        });

        const canvas = canvasRef.current;
        const w = canvas?.width || 800;
        const h = canvas?.height || 420;
        computeCoordinates(nodes, edges, w, h);

        setGraphNodes(nodes);
        setGraphEdges(edges);
        return;
      }

      let archUrl = `${baseUrl}/architecture`;
      if (viewMode === 'focus' && selectedNodeId) {
        archUrl = `${baseUrl}/neighborhood?target=${encodeURIComponent(selectedNodeId)}&hops=${hopsLimit}`;
      }

      const [resArch, resSummary, resDepth, resOrphans, resHubs, resRedirects, resBroken] = await Promise.all([
        fetch(archUrl),
        fetch(`${baseUrl}/graph-summary`),
        fetch(`${baseUrl}/depth-statistics`),
        fetch(`${baseUrl}/orphans`),
        fetch(`${baseUrl}/hubs`),
        fetch(`${baseUrl}/redirect-graph`),
        fetch(`${baseUrl}/broken-links-graph`)
      ]);

      const dataArch = await resArch.json();
      const nodes = dataArch.nodes || [];
      const edges = dataArch.edges || [];

      // Run coordinates setup
      const canvas = canvasRef.current;
      const w = canvas?.width || 800;
      const h = canvas?.height || 420;
      computeCoordinates(nodes, edges, w, h);

      setGraphNodes(nodes);
      setGraphEdges(edges);
      setGraphStats(await resSummary.json());
      setDepthStats(await resDepth.json());
      setOrphansList(await resOrphans.json());
      setHubsList(await resHubs.json());
      setRedirectsList(await resRedirects.json());
      setBrokenLinksList(await resBroken.json());
    } catch (e) {
      console.error('Failed to fetch crawl graph matrices:', e);
    }
  }, [activeCrawlId, viewMode, selectedNodeId, hopsLimit, computeCoordinates, graphViewType, activeComparisonResult]);

  const handleFindPath = async () => {
    if (!activeCrawlId || !pathSource || !pathDestination) return;
    try {
      const res = await fetch(`/api/crawler/crawls/${activeCrawlId}/path-finder?source=${encodeURIComponent(pathSource)}&destination=${encodeURIComponent(pathDestination)}`);
      const data = await res.json();
      setPathList(data.path);
    } catch (e) {
      console.error('Failed to run path finder:', e);
      setPathList(null);
    }
  };

  const getMousePos = (canvas: HTMLCanvasElement, evt: React.MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = (evt.clientX - rect.left - panX) / zoomLevel;
    const mouseY = (evt.clientY - rect.top - panY) / zoomLevel;
    return { x: mouseX, y: mouseY };
  };

  const getNodeAt = (x: number, y: number, nodes: any[]) => {
    const radius = 10;
    return nodes.find(n => {
      const dx = n.x - x;
      const dy = n.y - y;
      return dx * dx + dy * dy <= (radius + 6) * (radius + 6);
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x, y } = getMousePos(canvas, e);
    const clickedNode = getNodeAt(x, y, graphNodes);
    
    if (clickedNode) {
      setDraggedNodeId(clickedNode.id);
      setSelectedNodeId(clickedNode.id);
    } else {
      const startX = e.clientX - panX;
      const startY = e.clientY - panY;
      
      const handleMouseMovePan = (mvEvent: MouseEvent) => {
        setPanX(mvEvent.clientX - startX);
        setPanY(mvEvent.clientY - startY);
      };
      
      const handleMouseUpPan = () => {
        window.removeEventListener('mousemove', handleMouseMovePan);
        window.removeEventListener('mouseup', handleMouseUpPan);
      };
      
      window.addEventListener('mousemove', handleMouseMovePan);
      window.addEventListener('mouseup', handleMouseUpPan);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x, y } = getMousePos(canvas, e);

    if (draggedNodeId) {
      setGraphNodes(prev => prev.map(n => {
        if (n.id === draggedNodeId) {
          return { ...n, x, y };
        }
        return n;
      }));
    } else {
      const hovered = getNodeAt(x, y, graphNodes);
      setHoveredNodeId(hovered ? hovered.id : null);
    }
  };

  const handleMouseUp = () => {
    setDraggedNodeId(null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const nextZoom = e.deltaY < 0 ? zoomLevel * zoomFactor : zoomLevel / zoomFactor;
    const clampedZoom = Math.min(3, Math.max(0.3, nextZoom));

    const dx = mouseX - panX;
    const dy = mouseY - panY;

    setPanX(mouseX - dx * (clampedZoom / zoomLevel));
    setPanY(mouseY - dy * (clampedZoom / zoomLevel));
    setZoomLevel(clampedZoom);
  };

  const drawGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(panX, panY);
    ctx.scale(zoomLevel, zoomLevel);

    const filteredNodes = graphNodes.filter(n => {
      if (graphSearchQuery && !n.url.toLowerCase().includes(graphSearchQuery.toLowerCase()) && !(n.title || '').toLowerCase().includes(graphSearchQuery.toLowerCase())) {
        return false;
      }
      if (selectedStatusFilter && n.status.toString() !== selectedStatusFilter) return false;
      if (selectedDepthFilter && n.depth.toString() !== selectedDepthFilter) return false;
      if (selectedTypeFilter && !n.contentType.includes(selectedTypeFilter)) return false;
      return true;
    });

    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredEdges = graphEdges.filter(e => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.destination));

    // Draw lines
    filteredEdges.forEach(edge => {
      const srcNode = graphNodes.find(n => n.id === edge.source);
      const destNode = graphNodes.find(n => n.id === edge.destination);
      if (!srcNode || !destNode) return;

      const isPath = pathList && pathList.includes(edge.source) && pathList.includes(edge.destination);

      ctx.beginPath();
      ctx.moveTo(srcNode.x, srcNode.y);
      ctx.lineTo(destNode.x, destNode.y);

      if (isPath) {
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.setLineDash([]);
      } else if (edge.changeType === 'NEW') {
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2.0;
        ctx.setLineDash([]);
      } else if (edge.changeType === 'REMOVED') {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
      } else if (edge.status >= 400) {
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([]);
      } else if (edge.status >= 300 && edge.status < 400) {
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([]);
      } else {
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.0;
        ctx.setLineDash([]);
      }
      ctx.stroke();
      ctx.setLineDash([]); // reset line dash for general canvas drawings

      // Arrow heads direction marker
      const angle = Math.atan2(destNode.y - srcNode.y, destNode.x - srcNode.x);
      const arrowSize = 5;
      const arrowX = destNode.x - Math.cos(angle) * 13;
      const arrowY = destNode.y - Math.sin(angle) * 13;

      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY);
      ctx.lineTo(arrowX - arrowSize * Math.cos(angle - Math.PI / 6), arrowY - arrowSize * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(arrowX - arrowSize * Math.cos(angle + Math.PI / 6), arrowY - arrowSize * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fillStyle = isPath ? '#10b981' : (edge.status >= 400 ? '#f43f5e' : '#64748b');
      ctx.fill();
    });

    // Draw circles
    filteredNodes.forEach(node => {
      const isSelected = selectedNodeId === node.id;
      const isHovered = hoveredNodeId === node.id;
      const isPath = pathList && pathList.includes(node.id);

      ctx.beginPath();
      ctx.arc(node.x, node.y, isSelected ? 12 : (isHovered ? 11 : 9), 0, 2 * Math.PI);

      let nodeColor = '#3b82f6';
      if (node.changeType === 'NEW') nodeColor = '#10b981';
      else if (node.changeType === 'REMOVED') {
        nodeColor = '#ef4444';
      } else if (node.changeType === 'CHANGED') {
        nodeColor = '#f97316';
      } else if (node.status >= 400) nodeColor = '#ef4444';
      else if (node.status >= 300 && node.status < 400) nodeColor = '#fbbf24';
      else if (node.status === 200) nodeColor = '#10b981';
      else if (node.status === 0) nodeColor = '#a855f7';

      ctx.fillStyle = nodeColor;
      ctx.fill();

      if (isSelected) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3.0;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(node.x, node.y, 14, 0, 2 * Math.PI);
        ctx.strokeStyle = node.changeType === 'REMOVED' ? '#ef4444' : '#3b82f6';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else if (isHovered || isPath) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.0;
        ctx.stroke();
      } else if (node.changeType === 'REMOVED') {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([2, 2]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      if (zoomLevel > 0.6 || isSelected || isHovered) {
        ctx.font = isSelected ? 'bold 11px Inter, monospace' : '10px Inter, monospace';
        ctx.fillStyle = isSelected ? '#ffffff' : '#94a3b8';
        ctx.textAlign = 'left';
        const displayLabel = node.title ? `${node.title.slice(0, 18)}` : `${node.url.replace(/^https?:\/\//i, '').slice(0, 24)}`;
        ctx.fillText(displayLabel, node.x + 15, node.y + 4);
      }
    });

    ctx.restore();
  }, [graphNodes, graphEdges, panX, panY, zoomLevel, selectedNodeId, hoveredNodeId, pathList, graphSearchQuery, selectedStatusFilter, selectedDepthFilter, selectedTypeFilter]);

  // Load Graph data reactively
  useEffect(() => {
    if (activeCrawlId && activeTab === 'structure') {
      const timer = setTimeout(() => {
        loadGraphData();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [activeCrawlId, activeTab, loadGraphData]);

  // Redraw hook
  useEffect(() => {
    drawGraph();
  }, [drawGraph]);

  const handleInspectSelectedNode = () => {
    if (!selectedNodeId) return;
    const targetPage = sessionPages.find(p => p.url === selectedNodeId);
    if (targetPage) {
      setSelectedPage(targetPage);
    }
  };

  // Load past export jobs history
  const loadExportJobs = useCallback(async () => {
    if (!activeCrawlId) return;
    try {
      const res = await fetch(`/api/crawler/crawls/${activeCrawlId}/exports`);
      const data = await res.json();
      setExportJobs(data);
    } catch (e) {
      console.error('Failed to load export jobs:', e);
    }
  }, [activeCrawlId]);

  // Reactive listener for realtime export events
  useEffect(() => {
    const handleExportEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      console.log('Received crawler export event:', detail);
      loadExportJobs();
    };

    window.addEventListener('crawler_export_event', handleExportEvent);
    return () => {
      window.removeEventListener('crawler_export_event', handleExportEvent);
    };
  }, [loadExportJobs]);

  useEffect(() => {
    if (activeCrawlId && activeTab === 'export') {
      const timer = setTimeout(() => {
        loadExportJobs();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [activeCrawlId, activeTab, loadExportJobs]);

  const handleStartExport = async () => {
    if (!activeCrawlId) return;
    try {
      const filters = exportScope === 'filtered' ? {
        status: selectedStatusFilter || explorerStatusFilter,
        depth: selectedDepthFilter,
        type: selectedTypeFilter,
        search: graphSearchQuery || explorerQuery
      } : {};

      const res = await fetch('/api/crawler/exports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crawlId: activeCrawlId,
          format: exportFormat,
          dataset: selectedExportDatasets,
          filters
        })
      });

      if (!res.ok) {
        alert('Failed to launch export job.');
        return;
      }

      await loadExportJobs();
    } catch (e) {
      console.error('Failed to start export job:', e);
    }
  };

  const handleCancelExport = async (jobId: string) => {
    try {
      await fetch(`/api/crawler/exports/${jobId}/cancel`, { method: 'POST' });
      await loadExportJobs();
    } catch (e) {
      console.error('Failed to cancel export job:', e);
    }
  };

  const handleDeleteExport = async (jobId: string) => {
    try {
      await fetch(`/api/crawler/exports/${jobId}`, { method: 'DELETE' });
      await loadExportJobs();
    } catch (e) {
      console.error('Failed to delete export job:', e);
    }
  };

  const handleDownloadExport = async (jobId: string, format: string) => {
    try {
      const res = await fetch(`/api/crawler/exports/${jobId}/download`);
      if (!res.ok) {
        alert('Failed to retrieve download file. Check if it has expired.');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const domainSlug = (activeCrawlId || 'crawl').replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      a.download = `toolique-${domainSlug}-${jobId}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to download export file:', e);
      alert('Error fetching file download.');
    }
  };

  // Load past comparison jobs history
  const loadComparisonJobs = useCallback(async () => {
    if (!activeCrawlId) return;
    try {
      const res = await fetch(`/api/crawler/crawls/${activeCrawlId}/comparisons`);
      const data = await res.json();
      setComparisonJobs(data);
    } catch (e) {
      console.error('Failed to load comparison jobs:', e);
    }
  }, [activeCrawlId]);

  // Load detailed comparison summary results payload
  const loadComparisonResultSummary = useCallback(async (jobId: string) => {
    try {
      const res = await fetch(`/api/crawler/comparisons/${jobId}/summary`);
      if (res.ok) {
        const data = await res.json();
        setActiveComparisonResult(data);
        setComparisonTab('summary');
      } else {
        alert('Comparison summary not found.');
      }
    } catch (e) {
      console.error('Failed to load comparison summary:', e);
    }
  }, []);

  // Load paginated list of pages for explorer
  const loadComparePagesList = useCallback(async (jobId: string, filterStr: string, pageNum: number) => {
    try {
      const res = await fetch(`/api/crawler/comparisons/${jobId}/pages?filter=${filterStr}&page=${pageNum}&pageSize=10`);
      const data = await res.json();
      setComparePagesList(data.data || []);
      setCompareTotalPages(Math.ceil(data.total / 10) || 1);
      setCompareCurrentPage(pageNum);
    } catch (e) {
      console.error('Failed to load comparison pages list:', e);
    }
  }, []);

  // Load side-by-side details for a single URL
  const loadComparePageDetails = useCallback(async (jobId: string, url: string) => {
    setIsLoadingCompareDetails(true);
    try {
      const res = await fetch(`/api/crawler/comparisons/${jobId}/details?url=${encodeURIComponent(url)}`);
      if (res.ok) {
        const data = await res.json();
        setComparePageDetailsA(data.pageA);
        setComparePageDetailsB(data.pageB);
        setCompareDetailsChanges(data.changeRecord?.changes || []);
        setSelectedCompareUrl(url);
      }
    } catch (e) {
      console.error('Failed to load comparison page details:', e);
    } finally {
      setIsLoadingCompareDetails(false);
    }
  }, []);

  const handleStartComparison = async (crawlIdA: string, crawlIdB: string) => {
    if (!crawlIdA || !crawlIdB) {
      alert('Please select both crawls to compare.');
      return;
    }
    if (crawlIdA === crawlIdB) {
      alert('Baseline crawl and comparison crawl must be different.');
      return;
    }
    try {
      const res = await fetch('/api/crawler/comparisons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crawlIdA, crawlIdB })
      });
      if (res.ok) {
        await loadComparisonJobs();
      } else {
        alert('Failed to trigger comparison.');
      }
    } catch (e) {
      console.error('Failed to start comparison:', e);
    }
  };

  const handleCancelComparison = async (jobId: string) => {
    try {
      await fetch(`/api/crawler/comparisons/${jobId}/cancel`, { method: 'POST' });
      await loadComparisonJobs();
    } catch (e) {
      console.error('Failed to cancel comparison job:', e);
    }
  };

  const handleDeleteComparison = async (jobId: string) => {
    try {
      await fetch(`/api/crawler/comparisons/${jobId}`, { method: 'DELETE' });
      if (activeComparisonResult && activeComparisonResult.jobId === jobId) {
        setActiveComparisonResult(null);
      }
      await loadComparisonJobs();
    } catch (e) {
      console.error('Failed to delete comparison job:', e);
    }
  };

  // Reactive listener for realtime comparison events
  useEffect(() => {
    const handleComparisonEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      console.log('Received crawler comparison event:', detail);
      loadComparisonJobs();
    };

    window.addEventListener('crawler_comparison_event', handleComparisonEvent);
    return () => {
      window.removeEventListener('crawler_comparison_event', handleComparisonEvent);
    };
  }, [loadComparisonJobs]);

  useEffect(() => {
    if (activeCrawlId && activeTab === 'compare') {
      const timer = setTimeout(() => {
        loadComparisonJobs();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [activeCrawlId, activeTab, loadComparisonJobs]);

  const toggleDataset = (ds: string) => {
    setSelectedExportDatasets(prev => 
      prev.includes(ds) ? prev.filter(x => x !== ds) : [...prev, ds]
    );
  };

  const handleSelectAllDatasets = () => {
    setSelectedExportDatasets(['pages', 'issues', 'links', 'redirects', 'images', 'resources', 'seo', 'headings', 'indexability', 'security', 'performance', 'sitemap', 'robots', 'architecture']);
  };

  const handleClearAllDatasets = () => {
    setSelectedExportDatasets([]);
  };

  // --- Exporters ---
  const handleExportCSV = () => {
    const csvContent = [
      ['URL', 'Status', 'Latency (ms)', 'Word Count', 'Title', 'Description'].join(','),
      ...sessionPages.map(p => `"${p.url}","${p.status}","${p.time}","${p.wordCount}","${p.title}","${p.description}"`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Crawl_Report_${Date.now()}.csv`;
    link.click();
  };

  const renderPageInspector = () => {
    if (!selectedPage) return null;

    const filteredLinks = inspectorLinks.filter((l: any) => {
      const matchesSearch = l.destination.toLowerCase().includes(inspectorLinksSearch.toLowerCase()) || 
                            (l.anchorText || '').toLowerCase().includes(inspectorLinksSearch.toLowerCase());
      if (!matchesSearch) return false;
      
      if (inspectorLinksTab === 'internal') return !l.isExternal;
      if (inspectorLinksTab === 'external') return l.isExternal;
      if (inspectorLinksTab === 'broken') return l.status >= 400;
      if (inspectorLinksTab === 'redirect') return l.status >= 300 && l.status < 400;
      if (inspectorLinksTab === 'nofollow') return l.rel?.includes('nofollow') || l.nofollow;
      return true;
    });

    const linksPageSize = 10;
    const totalLinksPages = Math.ceil(filteredLinks.length / linksPageSize) || 1;
    const paginatedLinks = filteredLinks.slice(
      (inspectorLinksPage - 1) * linksPageSize,
      inspectorLinksPage * linksPageSize
    );

    const filteredImages = inspectorImages.filter((img: any) => {
      return img.url.toLowerCase().includes(inspectorImagesSearch.toLowerCase()) ||
             (img.alt || '').toLowerCase().includes(inspectorImagesSearch.toLowerCase());
    });

    const imagesPageSize = 10;
    const totalImagesPages = Math.ceil(filteredImages.length / imagesPageSize) || 1;
    const paginatedImages = filteredImages.slice(
      (inspectorImagesPage - 1) * imagesPageSize,
      inspectorImagesPage * imagesPageSize
    );

    const currentIndex = sessionPages.findIndex(p => p.url === selectedPage.url);
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex >= 0 && currentIndex < sessionPages.length - 1;

    const handlePrev = () => {
      if (hasPrev) {
        setSelectedPage(sessionPages[currentIndex - 1]);
        setInspectorLinksPage(1);
        setInspectorImagesPage(1);
      }
    };

    const handleNext = () => {
      if (hasNext) {
        setSelectedPage(sessionPages[currentIndex + 1]);
        setInspectorLinksPage(1);
        setInspectorImagesPage(1);
      }
    };

    const inspectUrl = (url: string) => {
      const found = sessionPages.find(p => p.url === url);
      if (found) {
        setSelectedPage(found);
        setInspectorLinksPage(1);
        setInspectorImagesPage(1);
        setInspectorLinksSearch('');
        setInspectorImagesSearch('');
      } else {
        alert(`URL "${url}" was not crawled in this session, so it cannot be inspected.`);
      }
    };

    const sanitizeRawData = (page: PageRecord) => {
      const copy = { ...page } as any;
      if (copy.headers) {
        const clean = { ...copy.headers };
        const redact = ['cookie', 'authorization', 'set-cookie', 'x-auth-token', 'jwt', 'token'];
        redact.forEach(k => {
          if (clean[k]) clean[k] = '*** REDACTED ***';
          if (clean[k.toUpperCase()]) clean[k.toUpperCase()] = '*** REDACTED ***';
        });
        copy.headers = clean;
      }
      return copy;
    };

    const getScoreColor = (score: number) => {
      if (score >= 90) return 'text-emerald-500 border-emerald-500';
      if (score >= 70) return 'text-amber-500 border-amber-500';
      return 'text-rose-500 border-rose-500';
    };

    const getScoreBg = (score: number) => {
      if (score >= 90) return 'bg-emerald-500/10 text-emerald-600';
      if (score >= 70) return 'bg-amber-500/10 text-amber-600';
      return 'bg-rose-500/10 text-rose-600';
    };

    return (
      <div className="space-y-6 max-w-6xl mx-auto text-left animate-fadeIn">
        {/* Breadcrumb & Navigation Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-950 p-6 rounded-3xl text-white shadow-sm border border-zinc-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
              <span>Website Crawler</span>
              <span>/</span>
              <span className="text-teal-400">Page Inspector</span>
            </div>
            <h1 className="text-base font-extrabold truncate max-w-lg select-all">{selectedPage.url}</h1>
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            <button 
              onClick={() => setSelectedPage(null)} 
              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl flex items-center gap-1 text-xs font-bold px-3 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Back to URL List
            </button>
            <button 
              onClick={handlePrev} 
              disabled={!hasPrev} 
              className="p-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:hover:bg-zinc-800 text-white rounded-xl flex items-center gap-1 text-xs font-bold px-3 transition"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <button 
              onClick={handleNext} 
              disabled={!hasNext} 
              className="p-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:hover:bg-zinc-800 text-white rounded-xl flex items-center gap-1 text-xs font-bold px-3 transition"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
            <a 
              href={selectedPage.url} 
              target="_blank" 
              rel="noreferrer" 
              className="p-2 bg-teal-650 hover:bg-teal-700 text-white rounded-xl flex items-center gap-1 text-xs font-bold px-3 transition"
            >
              Open Live Page <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Live status & summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">HTTP STATUS</span>
              <span className={`px-2 py-0.5 rounded text-xs font-black ${
                selectedPage.status >= 400 ? 'bg-rose-500/10 text-rose-600' :
                selectedPage.status >= 300 ? 'bg-amber-500/10 text-amber-600' :
                'bg-emerald-500/10 text-emerald-600'
              }`}>{selectedPage.status} {selectedPage.statusText || 'OK'}</span>
            </div>
            <Activity className="w-8 h-8 text-zinc-300 dark:text-zinc-700" />
          </div>

          <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">INDEXABILITY</span>
              <span className={`px-2 py-0.5 rounded text-xs font-black uppercase ${
                selectedPage.indexability === 'noindex' ? 'bg-rose-500/10 text-rose-600' : 'bg-emerald-500/10 text-emerald-600'
              }`}>{selectedPage.indexability}</span>
            </div>
            <Shield className="w-8 h-8 text-zinc-300 dark:text-zinc-700" />
          </div>

          <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">ISSUES COUNT</span>
              <span className={`px-2 py-0.5 rounded text-xs font-black ${
                inspectorIssues.length > 0 ? 'bg-rose-500/10 text-rose-650' : 'bg-emerald-500/10 text-emerald-600'
              }`}>{inspectorIssues.length} issues</span>
            </div>
            <AlertTriangle className="w-8 h-8 text-zinc-300 dark:text-zinc-700" />
          </div>

          <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">PAGE SCORE</span>
              <span className={`px-2 py-0.5 rounded text-xs font-black ${getScoreBg(pageScoreProfile?.overall || 100)}`}>
                {pageScoreProfile?.overall}/100
              </span>
            </div>
            <div className={`w-8 h-8 rounded-full border-4 flex items-center justify-center text-[10px] font-black ${getScoreColor(pageScoreProfile?.overall || 100)}`}>
              {pageScoreProfile?.overall}
            </div>
          </div>
        </div>

        {/* Tab workspace */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Sidebar controls */}
          <div className="md:col-span-3 space-y-2">
            {[
              { id: 'overview', name: '🏠 Overview' },
              { id: 'http_headers', name: '📋 Response Headers' },
              { id: 'seo_headings', name: '🔍 SEO & Headings' },
              { id: 'social_schema', name: '📱 Social & Schema' },
              { id: 'links', name: '🔗 Outbound & Inbound' },
              { id: 'resources', name: '📦 Images & Assets' },
              { id: 'security_perf', name: '🛡️ Security & Score' },
              { id: 'content_dup', name: '📝 Content & Duplicates' },
              { id: 'issues', name: `⚠️ Page Issues (${inspectorIssues.length})` },
              { id: 'raw', name: '🛠️ Raw JSON Metadata' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setInspectorTab(tab.id as any)}
                className={`w-full text-left p-3 rounded-2xl text-xs font-bold transition flex items-center justify-between ${
                  inspectorTab === tab.id 
                    ? 'bg-teal-650 text-white shadow-sm shadow-teal-500/10' 
                    : 'bg-white dark:bg-zinc-900 hover:bg-zinc-50 border border-zinc-200/60 dark:border-zinc-800/60 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <span>{tab.name}</span>
              </button>
            ))}
          </div>

          {/* Main workspace section panel */}
          <div className="md:col-span-9 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-6 shadow-sm min-h-[500px]">
            {isLoadingInspectorData ? (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-400 italic text-xs space-y-2">
                <div className="animate-spin w-6 h-6 border-2 border-teal-550 border-t-transparent rounded-full" />
                <span>Loading page parameters from IndexedDB...</span>
              </div>
            ) : (
              <div className="space-y-6 text-xs text-zinc-700 dark:text-zinc-300">
                
                {/* 1. OVERVIEW TAB */}
                {inspectorTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase mb-4 tracking-wider">Page Overview</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-2 p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50 border">
                          <h4 className="font-bold text-teal-600 mb-2 uppercase text-[10px]">Core Information</h4>
                          <div>URL: <span className="font-mono text-zinc-550 dark:text-zinc-400 truncate block select-all">{selectedPage.url}</span></div>
                          <div>Status: <span className="font-bold">{selectedPage.status} {selectedPage.statusText || 'OK'}</span></div>
                          <div>Content Type: <span className="font-mono">{selectedPage.type || 'text/html'}</span></div>
                          <div>Page Size: <span>{selectedPage.size ? `${selectedPage.size} KB` : 'Unknown'}</span></div>
                          <div>Crawl Time: <span>{selectedPage.timestamp || 'Unknown'}</span></div>
                        </div>

                        <div className="space-y-2 p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50 border">
                          <h4 className="font-bold text-teal-600 mb-2 uppercase text-[10px]">HTTP & Response Details</h4>
                          <div>Request Method: <span className="font-bold">GET</span></div>
                          <div>Response Mime-type: <span className="font-mono">{selectedPage.type || 'text/html; charset=utf-8'}</span></div>
                          <div>Download latency: <span>{selectedPage.time} ms</span></div>
                          <div>Depth Level: <span className="font-mono font-bold">{selectedPage.depth}</span></div>
                          <div>Indexability Class: <span className="font-bold uppercase text-teal-650">{selectedPage.indexability}</span></div>
                        </div>
                      </div>
                    </div>

                    {selectedPage.status >= 300 && selectedPage.status < 400 && (
                      <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-amber-650 space-y-1">
                        <h4 className="font-bold uppercase text-[10px]">Redirect Details</h4>
                        <div>Redirect Source: <span className="font-mono text-zinc-600 dark:text-zinc-300 break-all">{selectedPage.url}</span></div>
                        <div>Redirect Target: <span className="font-mono text-zinc-600 dark:text-zinc-300 break-all font-bold">{selectedPage.canonical || 'Not specified'}</span></div>
                        <div>Status Code: <span className="font-mono">{selectedPage.status} {selectedPage.statusText || 'Redirect'}</span></div>
                        <div>Chain Length: <span className="font-mono">1</span></div>
                      </div>
                    )}

                    <div className="p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50 border">
                      <h3 className="text-[10px] font-black uppercase text-teal-600 mb-2">URL & Discovery Trace</h3>
                      <div className="space-y-2 font-mono text-[11px] leading-relaxed">
                        <div>Original URL: <span className="text-zinc-500 break-all">{selectedPage.url}</span></div>
                        <div>Normalized URL: <span className="text-zinc-500 break-all">{selectedPage.url}</span></div>
                        <div>Crawl Depth: <span className="text-zinc-500">{selectedPage.depth}</span></div>
                        <div>Discovered via: <span className="px-1.5 py-0.5 bg-teal-500/10 text-teal-600 rounded text-[10px] font-bold uppercase">{selectedPage.depth === 0 ? 'Start URL' : 'HTML Link'}</span></div>
                        {selectedPage.parentUrl && (
                          <div>Source Page URL: <span className="text-zinc-500 break-all select-all">{selectedPage.parentUrl}</span></div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50 border">
                      <h3 className="text-[10px] font-black uppercase text-teal-600 mb-2">Performance Waterfall</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>DNS Resolution: <span className="text-zinc-400 italic">Not available</span></div>
                        <div>TCP Connection: <span className="text-zinc-400 italic">Not available</span></div>
                        <div>TLS Handshake: <span className="text-zinc-405 italic">Not available</span></div>
                        <div>Time to First Byte (TTFB): <span className="text-zinc-400 italic">Not available</span></div>
                        <div>Document download: <span className="text-zinc-400 italic">Not available</span></div>
                        <div className="font-bold">Total Request Latency: <span className="text-teal-650 font-mono">{selectedPage.time} ms</span></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 1.5. RESPONSE HEADERS TAB */}
                {inspectorTab === 'http_headers' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase mb-4 tracking-wider">HTTP Response Headers</h3>
                      
                      {/* Search and copy controls */}
                      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                        <input
                          type="text"
                          value={headersSearch}
                          onChange={(e) => setHeadersSearch(e.target.value)}
                          placeholder="Search headers..."
                          className="p-2 border rounded-xl text-xs w-full sm:max-w-xs focus:ring-1 focus:ring-teal-500 focus:outline-none bg-white dark:bg-zinc-900"
                        />
                        <button
                          onClick={() => {
                            const text = Object.entries(selectedPage.headers || {})
                              .map(([k, v]) => `${k}: ${v}`)
                              .join('\n');
                            navigator.clipboard.writeText(text);
                            alert('All headers copied to clipboard!');
                          }}
                          className="px-3 py-1.5 bg-zinc-950 text-white rounded-xl text-xs font-bold transition hover:bg-zinc-800"
                        >
                          Copy All Headers
                        </button>
                      </div>

                      {selectedPage.headers ? (
                        <div className="border rounded-2xl overflow-hidden bg-white dark:bg-zinc-900/40 shadow-sm max-h-96 overflow-y-auto">
                          <table className="w-full text-left border-collapse text-[11px] font-mono">
                            <thead>
                              <tr className="bg-zinc-50 dark:bg-zinc-905 border-b text-[10px] text-zinc-400 font-bold uppercase sticky top-0">
                                <th className="p-3 pl-4">Header Key</th>
                                <th className="p-3">Header Value</th>
                                <th className="p-3 pr-4 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y text-zinc-700 dark:text-zinc-350">
                              {Object.entries(selectedPage.headers)
                                .filter(([k, v]) => k.toLowerCase().includes(headersSearch.toLowerCase()) || v.toLowerCase().includes(headersSearch.toLowerCase()))
                                .map(([key, val]) => (
                                  <tr key={key} className="hover:bg-zinc-50/50">
                                    <td className="p-3 pl-4 font-bold text-teal-650 dark:text-teal-400 select-all">{key}</td>
                                    <td className="p-3 select-all truncate max-w-xs">{val}</td>
                                    <td className="p-3 pr-4 text-right">
                                      <button
                                        onClick={() => {
                                          navigator.clipboard.writeText(val);
                                          alert(`Copied value of ${key} to clipboard!`);
                                        }}
                                        className="text-teal-650 hover:underline font-bold"
                                      >
                                        Copy
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center text-zinc-400 italic py-8 border border-dashed rounded-2xl">
                          No HTTP response headers available for this page record.
                        </div>
                      )}
                    </div>

                    {/* Standard Audit Headers Check */}
                    <div className="p-4 border rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50">
                      <h4 className="font-bold text-zinc-900 dark:text-white mb-2 uppercase text-[10px]">Standard Headers Audited</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          'content-type',
                          'content-length',
                          'cache-control',
                          'etag',
                          'last-modified',
                          'server',
                          'strict-transport-security',
                          'content-security-policy',
                          'x-frame-options',
                          'x-content-type-options',
                          'referrer-policy'
                        ].map(h => {
                          const val = selectedPage.headers?.[h] || selectedPage.headers?.[h.toUpperCase()];
                          return (
                            <div key={h} className="flex justify-between border-b pb-1 font-mono text-[11px] gap-2">
                              <span className="font-bold text-zinc-600 dark:text-zinc-400 truncate">{h}</span>
                              <span className={val ? 'text-teal-650 dark:text-teal-400 truncate max-w-[150px]' : 'text-rose-500 italic'}>
                                {val || 'Not available'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. SEO & HEADINGS TAB */}
                {inspectorTab === 'seo_headings' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase mb-4 tracking-wider">SEO Audit</h3>
                      
                      <div className="space-y-3">
                        <div className="p-4 rounded-2xl border bg-zinc-50/50 dark:bg-zinc-900/50">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-zinc-905 dark:text-white">Title Tag</span>
                            <span className="font-mono text-[10px] text-zinc-400">{selectedPage.title?.length || 0} chars</span>
                          </div>
                          <p className="font-mono text-zinc-800 dark:text-zinc-200 select-all p-2 bg-white dark:bg-zinc-900 rounded border">{selectedPage.title || '(Missing Title tag)'}</p>
                          {headingAudits.errors.filter(e => e.includes('Title')).map((e, idx) => (
                            <span key={idx} className="text-rose-500 text-[10px] block mt-1">⚠️ {e}</span>
                          ))}
                        </div>

                        <div className="p-4 rounded-2xl border bg-zinc-50/50 dark:bg-zinc-900/50">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-zinc-905 dark:text-white">Meta Description</span>
                            <span className="font-mono text-[10px] text-zinc-400">{selectedPage.description?.length || 0} chars</span>
                          </div>
                          <p className="font-mono text-zinc-805 dark:text-zinc-250 select-all p-2 bg-white dark:bg-zinc-900 rounded border">{selectedPage.description || '(Missing Meta Description)'}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-2xl border bg-zinc-50/50 dark:bg-zinc-900/50">
                            <span className="font-bold text-zinc-900 dark:text-white block mb-1">Canonical Tag</span>
                            <span className="font-mono truncate block select-all text-zinc-500">{selectedPage.canonical || 'None'}</span>
                          </div>
                          <div className="p-4 rounded-2xl border bg-zinc-50/50 dark:bg-zinc-900/50">
                            <span className="font-bold text-zinc-900 dark:text-white block mb-1">Robots Directives</span>
                            <span className="font-mono truncate block text-zinc-500">{selectedPage.metaRobots || 'None'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Headings Outline Visualizer */}
                    <div className="p-4 rounded-2xl border bg-zinc-50/50 dark:bg-zinc-900/50">
                      <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase mb-3 tracking-wider">Heading Structure Audit</h3>
                      
                      {headingAudits.errors.length > 0 && (
                        <div className="mb-4 p-3 bg-rose-500/5 border border-rose-500/20 text-rose-600 rounded-xl space-y-1">
                          {headingAudits.errors.map((err, idx) => (
                            <div key={idx}>⚠️ {err}</div>
                          ))}
                        </div>
                      )}

                      <div className="space-y-1 max-h-[300px] overflow-auto border rounded-xl p-4 bg-white dark:bg-zinc-900">
                        {selectedPage.headings && selectedPage.headings.length > 0 ? (
                          selectedPage.headings.map((h: any, idx: number) => {
                            const level = parseInt(h.tag.substring(1)) || 1;
                            return (
                              <div 
                                key={idx} 
                                style={{ paddingLeft: `${(level - 1) * 16}px` }} 
                                className="flex items-center gap-2 py-1 font-mono text-[11px]"
                              >
                                <span className={`px-1 py-0.5 rounded text-[9px] font-black uppercase ${
                                  h.tag === 'h1' ? 'bg-red-500/10 text-red-600' :
                                  h.tag === 'h2' ? 'bg-orange-500/10 text-orange-600' :
                                  'bg-zinc-500/10 text-zinc-500'
                                }`}>{h.tag}</span>
                                <span className="text-zinc-800 dark:text-zinc-200 font-bold truncate">{h.text}</span>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center text-zinc-400 italic py-4">No heading tags (H1-H6) detected on this page.</div>
                        )}
                      </div>
                    </div>

                    {/* Hreflangs details */}
                    <div className="p-4 rounded-2xl border bg-zinc-50/50 dark:bg-zinc-900/50">
                      <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase mb-3 tracking-wider">Hreflang Declarations</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-[11px] font-mono">
                          <thead>
                            <tr className="border-b text-zinc-400">
                              <th className="pb-2">Language</th>
                              <th className="pb-2">Target URL</th>
                              <th className="pb-2 text-right">Reciprocity Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {hreflangAudits.map((hl: any, idx: number) => (
                              <tr key={idx} className="border-b">
                                <td className="py-2"><span className="px-1.5 py-0.5 bg-zinc-100 rounded font-bold text-zinc-700">{hl.lang}</span></td>
                                <td className="py-2 truncate max-w-[250px]">{hl.href}</td>
                                <td className="py-2 text-right">
                                  {hl.status === 'VALID' ? (
                                    <span className="text-emerald-500 font-bold">✓ Reciprocal</span>
                                  ) : (
                                    <div className="text-rose-500 font-semibold text-[10px]">
                                      {hl.issues.map((issue: string, i: number) => (
                                        <div key={i}>{issue}</div>
                                      ))}
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                            {hreflangAudits.length === 0 && (
                              <tr>
                                <td colSpan={3} className="text-center py-4 text-zinc-400 italic">No hreflang localized declarations found.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. SOCIAL & SCHEMA TAB */}
                {inspectorTab === 'social_schema' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase mb-4 tracking-wider">Open Graph Metadata</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                        <div className="sm:col-span-7 space-y-2">
                          {['title', 'description', 'image', 'url', 'type'].map(key => {
                            const val = selectedPage.openGraph?.[key] || selectedPage.openGraph?.[`og:${key}`];
                            return (
                              <div key={key} className="p-3 rounded-xl border bg-zinc-50/50 dark:bg-zinc-900/50">
                                <span className="font-mono text-[9px] uppercase text-zinc-400 block font-bold">og:{key}</span>
                                <span className="font-semibold text-zinc-800 dark:text-zinc-200 select-all block">{val || '(Missing)'}</span>
                              </div>
                            );
                          })}
                        </div>
                        
                        <div className="sm:col-span-5 border rounded-2xl p-4 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] font-black uppercase text-zinc-400 block mb-2">OG Image Preview</span>
                            {selectedPage.openGraph?.['image'] || selectedPage.openGraph?.['og:image'] ? (
                              <img 
                                src={selectedPage.openGraph?.['image'] || selectedPage.openGraph?.['og:image']} 
                                alt="OG Preview" 
                                className="w-full h-36 object-cover rounded-xl border"
                              />
                            ) : (
                              <div className="w-full h-36 border border-dashed rounded-xl flex items-center justify-center text-zinc-400 italic">No OG Image detected</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase mb-4 tracking-wider">Twitter/X Card</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {['card', 'title', 'description', 'image'].map(key => {
                          const val = selectedPage.twitterCard?.[key] || selectedPage.twitterCard?.[`twitter:${key}`];
                          return (
                            <div key={key} className="p-3 rounded-xl border bg-zinc-50/50 dark:bg-zinc-900/50">
                              <span className="font-mono text-[9px] uppercase text-zinc-400 block font-bold">twitter:{key}</span>
                              <span className="font-semibold text-zinc-800 dark:text-zinc-200 select-all block">{val || '(Missing)'}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase mb-4 tracking-wider">Structured JSON-LD Schema</h3>
                      <div className="space-y-4">
                        {parsedStructuredData.map((sd: any, idx: number) => (
                          <div key={idx} className="border rounded-2xl p-4 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="px-2 py-0.5 bg-teal-500/10 text-teal-600 rounded text-[10px] font-bold uppercase">{sd.type}</span>
                              <span className={`text-[10px] font-bold ${sd.status === 'VALID' ? 'text-emerald-500' : 'text-rose-500'}`}>{sd.status}</span>
                            </div>
                            <pre className="p-3 bg-zinc-950 text-teal-400 rounded-xl overflow-auto text-[10px] max-h-40 leading-relaxed font-mono">
                              {sd.raw}
                            </pre>
                          </div>
                        ))}
                        {parsedStructuredData.length === 0 && (
                          <div className="text-center text-zinc-400 italic py-6 border border-dashed rounded-2xl">No structured JSON-LD schemas parsed on this page.</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. LINKS TAB */}
                {inspectorTab === 'links' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase mb-4 tracking-wider">Outbound Links ({inspectorLinks.length} found)</h3>
                      
                      {/* Filtering row */}
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                        <div className="flex border rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                          {[
                            { id: 'all', name: 'All' },
                            { id: 'internal', name: 'Internal' },
                            { id: 'external', name: 'External' },
                            { id: 'broken', name: 'Broken' },
                            { id: 'redirect', name: 'Redirect' },
                            { id: 'nofollow', name: 'Nofollow' }
                          ].map(t => (
                            <button
                              key={t.id}
                              onClick={() => { setInspectorLinksTab(t.id as any); setInspectorLinksPage(1); }}
                              className={`px-3 py-1.5 text-[10px] font-bold transition ${
                                inspectorLinksTab === t.id ? 'bg-teal-650 text-white' : 'text-zinc-500 hover:bg-zinc-200'
                              }`}
                            >
                              {t.name}
                            </button>
                          ))}
                        </div>
                        
                        <input
                          type="text"
                          value={inspectorLinksSearch}
                          onChange={(e) => { setInspectorLinksSearch(e.target.value); setInspectorLinksPage(1); }}
                          placeholder="Search links..."
                          className="p-2 border rounded-xl text-xs max-w-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
                        />
                      </div>

                      {/* Links table */}
                      <div className="overflow-x-auto border rounded-2xl">
                        <table className="w-full text-left text-xs font-medium">
                          <thead>
                            <tr className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b text-zinc-400 uppercase text-[9px] font-bold">
                              <th className="p-3 pl-4">Destination URL</th>
                              <th className="p-3">Anchor text</th>
                              <th className="p-3">Scope</th>
                              <th className="p-3">HTTP Status</th>
                              <th className="p-3 pr-4 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y font-mono text-[11px]">
                            {paginatedLinks.map((link: any, idx: number) => (
                              <tr key={idx} className="hover:bg-zinc-50/50">
                                <td className="p-3 pl-4 truncate max-w-[200px] select-all">{link.destination}</td>
                                <td className="p-3 font-sans truncate max-w-[150px]">{link.anchorText || '(Empty)'}</td>
                                <td className="p-3">
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                    link.isExternal ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500' : 'bg-teal-500/10 text-teal-600'
                                  }`}>{link.isExternal ? 'External' : 'Internal'}</span>
                                  {link.nofollow && <span className="ml-1 text-[9px] text-amber-500 font-bold">Nofollow</span>}
                                </td>
                                <td className="p-3">
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                    link.status >= 400 ? 'bg-rose-500/10 text-rose-600' :
                                    link.status >= 300 ? 'bg-amber-500/10 text-amber-600' :
                                    'bg-emerald-500/10 text-emerald-600'
                                  }`}>{link.status}</span>
                                </td>
                                <td className="p-3 pr-4 text-right">
                                  <button
                                    onClick={() => inspectUrl(link.destination)}
                                    className="text-teal-650 hover:underline font-bold"
                                  >
                                    Inspect
                                  </button>
                                </td>
                              </tr>
                            ))}
                            {paginatedLinks.length === 0 && (
                              <tr>
                                <td colSpan={5} className="text-center py-6 text-zinc-400 italic">No links matching the current filters.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination Controls */}
                      {totalLinksPages > 1 && (
                        <div className="flex justify-between items-center mt-4">
                          <span className="text-[10px] text-zinc-400 font-bold">Page {inspectorLinksPage} of {totalLinksPages} ({filteredLinks.length} total)</span>
                          <div className="flex gap-2">
                            <button
                              disabled={inspectorLinksPage === 1}
                              onClick={() => setInspectorLinksPage(prev => prev - 1)}
                              className="px-2.5 py-1 border rounded-lg hover:bg-zinc-100 disabled:opacity-40"
                            >
                              Prev
                            </button>
                            <button
                              disabled={inspectorLinksPage === totalLinksPages}
                              onClick={() => setInspectorLinksPage(prev => prev + 1)}
                              className="px-2.5 py-1 border rounded-lg hover:bg-zinc-100 disabled:opacity-40"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase mb-4 tracking-wider">Inbound Links ({inboundLinks.length} found)</h3>
                      <div className="overflow-x-auto border rounded-2xl">
                        <table className="w-full text-left text-xs font-medium">
                          <thead>
                            <tr className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b text-zinc-400 uppercase text-[9px] font-bold">
                              <th className="p-3 pl-4">Source Page URL</th>
                              <th className="p-3">Anchor text</th>
                              <th className="p-3">Rel Attribute</th>
                              <th className="p-3 pr-4 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y font-mono text-[11px]">
                            {inboundLinks.map((link: any, idx: number) => (
                              <tr key={idx} className="hover:bg-zinc-50/50">
                                <td className="p-3 pl-4 truncate max-w-[250px] select-all">{link.source}</td>
                                <td className="p-3 font-sans truncate max-w-[150px]">{link.anchorText || '(Empty)'}</td>
                                <td className="p-3">{link.rel || 'None'}</td>
                                <td className="p-3 pr-4 text-right">
                                  <button
                                    onClick={() => inspectUrl(link.source)}
                                    className="text-teal-650 hover:underline font-bold"
                                  >
                                    Inspect Source
                                  </button>
                                </td>
                              </tr>
                            ))}
                            {inboundLinks.length === 0 && (
                              <tr>
                                <td colSpan={4} className="text-center py-6 text-zinc-400 italic">No inbound links found in this crawl dataset (Orphan Page).</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. RESOURCES TAB */}
                {inspectorTab === 'resources' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase mb-4 tracking-wider">Images Gallery ({inspectorImages.length} found)</h3>
                      
                      <div className="flex justify-end mb-4">
                        <input
                          type="text"
                          value={inspectorImagesSearch}
                          onChange={(e) => { setInspectorImagesSearch(e.target.value); setInspectorImagesPage(1); }}
                          placeholder="Search images..."
                          className="p-2 border rounded-xl text-xs max-w-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
                        />
                      </div>

                      <div className="overflow-x-auto border rounded-2xl">
                        <table className="w-full text-left text-xs font-medium">
                          <thead>
                            <tr className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b text-zinc-400 uppercase text-[9px] font-bold">
                              <th className="p-3 pl-4">Image Source URL</th>
                              <th className="p-3">Alt Text</th>
                              <th className="p-3">Dimensions</th>
                              <th className="p-3">Loading</th>
                              <th className="p-3 pr-4">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y font-mono text-[11px]">
                            {paginatedImages.map((img: any, idx: number) => (
                              <tr key={idx} className="hover:bg-zinc-50/50">
                                <td className="p-3 pl-4 truncate max-w-[200px] select-all">{img.url}</td>
                                <td className="p-3 font-sans truncate max-w-[150px]">
                                  {img.alt ? (
                                    <span className="text-zinc-650">{img.alt}</span>
                                  ) : (
                                    <span className="text-rose-500 font-bold uppercase text-[9px] bg-rose-500/10 px-1 py-0.5 rounded">Missing Alt</span>
                                  )}
                                </td>
                                <td className="p-3">
                                  {img.width && img.height ? `${img.width}x${img.height}` : <span className="text-zinc-400 italic">None</span>}
                                </td>
                                <td className="p-3">{img.loading || 'eager'}</td>
                                <td className="p-3 pr-4">
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                    img.status >= 400 ? 'bg-rose-500/10 text-rose-600' : 'bg-emerald-500/10 text-emerald-600'
                                  }`}>{img.status || 200}</span>
                                </td>
                              </tr>
                            ))}
                            {paginatedImages.length === 0 && (
                              <tr>
                                <td colSpan={5} className="text-center py-6 text-zinc-400 italic">No images matching search terms.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {totalImagesPages > 1 && (
                        <div className="flex justify-between items-center mt-4">
                          <span className="text-[10px] text-zinc-400 font-bold">Page {inspectorImagesPage} of {totalImagesPages}</span>
                          <div className="flex gap-2">
                            <button
                              disabled={inspectorImagesPage === 1}
                              onClick={() => setInspectorImagesPage(prev => prev - 1)}
                              className="px-2.5 py-1 border rounded-lg hover:bg-zinc-100 disabled:opacity-40"
                            >
                              Prev
                            </button>
                            <button
                              disabled={inspectorImagesPage === totalImagesPages}
                              onClick={() => setInspectorImagesPage(prev => prev + 1)}
                              className="px-2.5 py-1 border rounded-lg hover:bg-zinc-100 disabled:opacity-40"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Scripts and styles */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="p-4 rounded-2xl border bg-zinc-50/50 dark:bg-zinc-900/50">
                        <h4 className="text-[10px] font-black uppercase text-teal-600 mb-2">JavaScript Files ({selectedPage.scripts?.length || 0})</h4>
                        <div className="max-h-40 overflow-auto border rounded-xl p-3 bg-white dark:bg-zinc-900 font-mono text-[10px] space-y-1">
                          {selectedPage.scripts?.map((src: string, idx: number) => (
                            <div key={idx} className="truncate select-all text-zinc-500 border-b pb-1 last:border-0">{src}</div>
                          ))}
                          {(!selectedPage.scripts || selectedPage.scripts.length === 0) && (
                            <div className="text-zinc-400 italic text-center">No script assets detected.</div>
                          )}
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl border bg-zinc-50/50 dark:bg-zinc-900/50">
                        <h4 className="text-[10px] font-black uppercase text-teal-600 mb-2">CSS Stylesheets ({selectedPage.stylesheets?.length || 0})</h4>
                        <div className="max-h-40 overflow-auto border rounded-xl p-3 bg-white dark:bg-zinc-900 font-mono text-[10px] space-y-1">
                          {selectedPage.stylesheets?.map((src: string, idx: number) => (
                            <div key={idx} className="truncate select-all text-zinc-500 border-b pb-1 last:border-0">{src}</div>
                          ))}
                          {(!selectedPage.stylesheets || selectedPage.stylesheets.length === 0) && (
                            <div className="text-zinc-400 italic text-center">No stylesheet files detected.</div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border bg-zinc-50/50 dark:bg-zinc-900/50">
                      <h4 className="text-[10px] font-black uppercase text-teal-600 mb-2">Other Parsed Resources</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>Iframes found: <span className="font-bold">{selectedPage.iframes?.length || 0}</span></div>
                        <div>Fonts / Media preloads: <span className="text-zinc-400 italic">Not observed</span></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. SECURITY & SCORE TAB */}
                {inspectorTab === 'security_perf' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase mb-4 tracking-wider">Security Headers scan</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {[
                          { header: 'Strict-Transport-Security', key: 'HSTS' },
                          { header: 'Content-Security-Policy', key: 'CSP' },
                          { header: 'X-Frame-Options', key: 'XFrameOptions' },
                          { header: 'X-Content-Type-Options', key: 'XContentTypeOptions' },
                          { header: 'Referrer-Policy', key: 'ReferrerPolicy' },
                          { header: 'Permissions-Policy', key: 'PermissionsPolicy' }
                        ].map(item => {
                          const state = selectedPage.securityHeaders?.[item.key] || 'MISSING';
                          return (
                            <div key={item.key} className="p-3 border rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50">
                              <span className="text-[9px] font-black uppercase text-zinc-400 block mb-1">{item.header}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                state === 'PRESENT' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                              }`}>{state}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Detailed Page Score breakdown */}
                    <div>
                      <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase mb-4 tracking-wider">Dynamic Score Audit Breakdown</h3>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                        {[
                          { name: 'Overall Score', score: pageScoreProfile?.overall },
                          { name: 'Technical SEO', score: pageScoreProfile?.technical },
                          { name: 'On-Page Content', score: pageScoreProfile?.content },
                          { name: 'Security Profiles', score: pageScoreProfile?.security }
                        ].map((s, idx) => (
                          <div key={idx} className="p-4 border rounded-2xl text-center bg-zinc-50/50 dark:bg-zinc-900/50">
                            <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-2">{s.name}</span>
                            <span className={`text-lg font-black ${getScoreColor(s.score || 100).split(' ')[0]}`}>{s.score}/100</span>
                          </div>
                        ))}
                      </div>

                      <div className="p-4 border rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50">
                        <h4 className="font-bold text-zinc-900 dark:text-white mb-3">Audit Deduction Ledger</h4>
                        <div className="space-y-2">
                          {pageScoreProfile && pageScoreProfile.penalties.technical > 0 && (
                            <div className="flex justify-between border-b pb-1">
                              <span>HTTP Status code error / redirect penalty</span>
                              <span className="text-rose-500 font-bold">-{pageScoreProfile.penalties.technical} points</span>
                            </div>
                          )}
                          {pageScoreProfile && pageScoreProfile.penalties.seo > 0 && (
                            <div className="flex justify-between border-b pb-1">
                              <span>SEO metadata missing / tag format errors</span>
                              <span className="text-rose-500 font-bold">-{pageScoreProfile.penalties.seo} points</span>
                            </div>
                          )}
                          {pageScoreProfile && pageScoreProfile.penalties.content > 0 && (
                            <div className="flex justify-between border-b pb-1">
                              <span>Thin content / duplicate body fingerprint matches</span>
                              <span className="text-rose-500 font-bold">-{pageScoreProfile.penalties.content} points</span>
                            </div>
                          )}
                          {pageScoreProfile && pageScoreProfile.penalties.links > 0 && (
                            <div className="flex justify-between border-b pb-1">
                              <span>Broken links / redirection chains penalty</span>
                              <span className="text-rose-500 font-bold">-{pageScoreProfile.penalties.links} points</span>
                            </div>
                          )}
                          {pageScoreProfile && pageScoreProfile.penalties.security > 0 && (
                            <div className="flex justify-between border-b pb-1">
                              <span>Missing HSTS, CSP, or security response headers</span>
                              <span className="text-rose-500 font-bold">-{pageScoreProfile.penalties.security} points</span>
                            </div>
                          )}
                          {pageScoreProfile && pageScoreProfile.penalties.performance > 0 && (
                            <div className="flex justify-between border-b pb-1">
                              <span>Response latency threshold warning</span>
                              <span className="text-rose-500 font-bold">-{pageScoreProfile.penalties.performance} points</span>
                            </div>
                          )}
                          {pageScoreProfile && pageScoreProfile.penalties.indexability > 0 && (
                            <div className="flex justify-between border-b pb-1">
                              <span>Page has noindex directives tag</span>
                              <span className="text-rose-500 font-bold">-{pageScoreProfile.penalties.indexability} points</span>
                            </div>
                          )}

                          {pageScoreProfile && Object.values(pageScoreProfile.penalties).reduce((a, b) => a + b, 0) === 0 && (
                            <div className="text-emerald-500 font-bold text-center py-4">✓ 0 penalties assigned! Page has a clean performance profile.</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 7. CONTENT & DUPLICATES TAB */}
                {inspectorTab === 'content_dup' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase mb-4 tracking-wider">Content Metrics</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="p-3 border rounded-xl text-center bg-zinc-50/50 dark:bg-zinc-900/50">
                          <span className="text-[10px] text-zinc-400 block mb-1">Words Count</span>
                          <span className="text-sm font-bold">{selectedPage.wordCount} words</span>
                        </div>
                        <div className="p-3 border rounded-xl text-center bg-zinc-50/50 dark:bg-zinc-900/50">
                          <span className="text-[10px] text-zinc-400 block mb-1">Characters</span>
                          <span className="text-sm font-bold">{selectedPage.charCount} chars</span>
                        </div>
                        <div className="p-3 border rounded-xl text-center bg-zinc-50/50 dark:bg-zinc-900/50">
                          <span className="text-[10px] text-zinc-400 block mb-1">Paragraphs</span>
                          <span className="text-sm font-bold">{selectedPage.paragraphCount} tags</span>
                        </div>
                        <div className="p-3 border rounded-xl text-center bg-zinc-50/50 dark:bg-zinc-900/50">
                          <span className="text-[10px] text-zinc-400 block mb-1">HTML Language</span>
                          <span className="text-sm font-bold uppercase">{selectedPage.language || 'en'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50 space-y-2">
                      <span className="text-[10px] uppercase font-bold text-teal-600 block">Content fingerprint matches</span>
                      <div>Hash Fingerprint: <span className="font-mono text-[11px] text-zinc-500 block">{selectedPage.fingerprint || 'None calculated'}</span></div>
                      
                      {/* Check duplicates */}
                      {sessionPages.filter(p => p.url !== selectedPage.url && p.fingerprint === selectedPage.fingerprint).length > 0 ? (
                        <div className="mt-2 text-rose-500 font-bold">
                          ⚠️ Duplicate Content Detected! The following URLs share the exact same text fingerprint:
                          <div className="font-mono font-medium text-[10px] space-y-1 mt-1 text-zinc-500">
                            {sessionPages.filter(p => p.url !== selectedPage.url && p.fingerprint === selectedPage.fingerprint).map((p: any, i: number) => (
                              <div key={i} className="truncate select-all">{p.url}</div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-emerald-500 font-bold mt-2">✓ Unique content fingerprint (No duplicates detected).</div>
                      )}
                    </div>

                    {/* Visible Text Content Preview */}
                    <div className="p-4 border rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50">
                      <span className="text-[10px] uppercase font-bold text-teal-600 block mb-2">Visible Text Preview (First 1,000 characters)</span>
                      <textarea
                        readOnly
                        value={selectedPage.description || 'No raw visible text extracted for description block.'}
                        className="w-full h-40 p-3 bg-white dark:bg-zinc-900 rounded-xl border text-[11px] font-sans leading-relaxed focus:outline-none select-all"
                      />
                    </div>
                  </div>
                )}

                {/* 8. ISSUES TAB */}
                {inspectorTab === 'issues' && (
                  <div className="space-y-6">
                    <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">Issues Affecting this Page ({inspectorIssues.length})</h3>
                    
                    <div className="space-y-3">
                      {inspectorIssues.map((issue: any, idx: number) => (
                        <div key={idx} className="p-4 border rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-mono text-[10px] font-black uppercase text-zinc-400">{issue.rule}</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                              issue.severity === 'CRITICAL' ? 'bg-rose-500/10 text-rose-600' :
                              issue.severity === 'WARNING' ? 'bg-amber-500/10 text-amber-600' :
                              'bg-zinc-500/10 text-zinc-500'
                            }`}>{issue.severity}</span>
                          </div>
                          <p className="font-bold text-zinc-805 dark:text-zinc-200">{issue.description}</p>
                          <div className="flex justify-between items-center pt-2 border-t text-[10px] text-zinc-405">
                            <span>Category: <span className="font-bold">{issue.category}</span></span>
                            <button
                              onClick={() => handleViewAffectedRule(issue.rule)}
                              className="text-teal-650 hover:underline font-bold"
                            >
                              View affected rule →
                            </button>
                          </div>
                        </div>
                      ))}
                      {inspectorIssues.length === 0 && (
                        <div className="text-center text-emerald-500 font-bold py-10">✓ 0 issues detected! Page conforms to all Technical SEO, Links, and Security rules.</div>
                      )}
                    </div>
                  </div>
                )}

                {/* 9. RAW TAB */}
                {inspectorTab === 'raw' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">Raw Extracted Database JSON</h3>
                    <pre className="p-4 bg-zinc-950 text-emerald-400 rounded-2xl overflow-auto max-h-[500px] text-[11px] font-mono leading-relaxed select-all">
                      {JSON.stringify(sanitizeRawData(selectedPage), null, 2)}
                    </pre>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const handleViewAffectedRule = (ruleId: string) => {
    setSelectedIssueRule(ruleId);
    setActiveTab('issues');
    setSelectedPage(null);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto text-left animate-fadeIn">
      {selectedPage ? (
        renderPageInspector()
      ) : (
        <>
          {/* Dynamic progress bar header */}
      <div className="p-6 rounded-3xl bg-zinc-950 text-white shadow-xl flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <span className="text-[10px] font-black uppercase text-teal-305 block tracking-widest">Website Crawler Spider</span>
          <h2 className="text-sm font-black truncate max-w-xs sm:max-w-md">{targetUrl}</h2>
          <div className="flex flex-wrap gap-4 text-[10px] font-mono text-zinc-400 mt-1 font-bold">
            <span>Status: <strong className="text-teal-405">{crawlStatus}</strong></span>
            <span>Elapsed: {Math.floor(elapsedTime / 60)}m {elapsedTime % 60}s</span>
            <span>Speed: {elapsedTime > 0 ? (crawledCount / elapsedTime).toFixed(1) : 0} pages/sec</span>
          </div>
        </div>

        {crawlStatus === 'CRAWLING' && (
          <div className="flex gap-2">
            <button onClick={handlePauseCrawl} className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg"><Pause className="w-4 h-4" /></button>
            <button onClick={handleStopCrawl} className="p-2 bg-rose-500/10 text-rose-400 rounded-lg"><Square className="w-4 h-4" /></button>
          </div>
        )}

        {crawlStatus === 'PAUSED' && (
          <button onClick={handleResumeCrawl} className="p-2 bg-teal-650 hover:bg-teal-700 text-white rounded-lg flex items-center gap-1.5 text-xs font-bold px-3">
            <Play className="w-4 h-4" /> Resume
          </button>
        )}
      </div>

      {/* Main visual tab select */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-500">
        {[
          { id: 'setup', name: 'Crawler Setup' },
          { id: 'dashboard', name: 'Spider Dashboard' },
          { id: 'pages', name: 'Crawled Pages' },
          { id: 'issues', name: 'Issues Center' },
          { id: 'structure', name: 'Architecture Visualizer' },
          { id: 'compare', name: 'Crawl Comparison' },
          { id: 'history', name: 'Crawl History' },
          { id: 'export', name: 'Export Center' }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-5 py-3 border-b-2 transition ${
              activeTab === t.id ? 'border-teal-650 text-teal-650' : 'border-transparent hover:text-zinc-700'
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* TAB SCENARIOS */}
      
      {/* 1. SETUP PANEL */}
      {activeTab === 'setup' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start animate-fadeIn">
          
          <div className="md:col-span-8 p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-4 text-xs font-semibold">
            <span className="text-[10px] font-black uppercase text-zinc-450 block tracking-wider border-b pb-2">Target Configurations</span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-[10px] text-zinc-405 block mb-1">Target Website URL</label>
                <input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="p-3 border rounded-xl w-full text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-405 block mb-1">Max URLs Limit</label>
                <select
                  value={maxUrls}
                  onChange={(e) => setMaxUrls(parseInt(e.target.value))}
                  className="p-3 border rounded-xl w-full"
                >
                  <option value="100">100 Pages</option>
                  <option value="500">500 Pages</option>
                  <option value="1000">1,000 Pages</option>
                  <option value="5000">5,000 Pages</option>
                  <option value="10000">10,000 Pages</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-zinc-405 block mb-1">Crawl Depth Limit</label>
                <select
                  value={crawlDepth}
                  onChange={(e) => setCrawlDepth(parseInt(e.target.value))}
                  className="p-3 border rounded-xl w-full"
                >
                  <option value="1">1 Depth (Homepage links only)</option>
                  <option value="2">2 Depth</option>
                  <option value="5">5 Depth</option>
                  <option value="10">10 Depth</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-zinc-405 block mb-1">JavaScript Rendering</label>
                <select
                  value={jsRendering}
                  onChange={(e) => setJsRendering(e.target.value as any)}
                  className="p-3 border rounded-xl w-full"
                >
                  <option value="html">HTML Only (Fast)</option>
                  <option value="js">JavaScript Rendering (Headless Info)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 border-t pt-4">
              <label className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={respectRobots}
                  onChange={(e) => setRespectRobots(e.target.checked)}
                  className="rounded text-teal-605"
                />
                <span>Respect robots.txt</span>
              </label>

              <label className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={includeSubdomains}
                  onChange={(e) => setIncludeSubdomains(e.target.checked)}
                  className="rounded text-teal-605"
                />
                <span>Include Subdomains</span>
              </label>
            </div>

            <button
              onClick={() => {
                spawnCrawlWorker(targetUrl);
                setActiveTab('dashboard');
              }}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs rounded-xl shadow uppercase tracking-wider block"
            >
              Start Crawler Spider
            </button>
          </div>

          <div className="md:col-span-4 p-5 rounded-3xl bg-zinc-50 border space-y-3 text-xs leading-relaxed font-semibold">
            <span className="text-[10px] font-black uppercase text-teal-600 block tracking-widest">Pro Crawling sandbox</span>
            <p>Runs sequentially inside a Web Worker. If requests fail due to cross-origin blocks (CORS), they will be categorized under the Skipped/Failed states logs.</p>
          </div>
        </div>
      )}

      {/* 2. SPIDER DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-12 gap-6 animate-fadeIn">
          {/* Left Sidebar Submenu */}
          <div className="col-span-12 md:col-span-3 space-y-2">
            {[
              { id: 'overview', label: '🏠 Overview' },
              { id: 'urls', label: '🌐 URL Explorer' },
              { id: 'issues', label: '⚠️ Diagnostics Issues' },
              { id: 'seo', label: '🔍 SEO Auditor' },
              { id: 'links', label: '🔗 Links Audit' },
              { id: 'redirects', label: '🔀 Redirects Tracker' },
              { id: 'content', label: '📝 Content Analyzer' },
              { id: 'images', label: '🖼️ Image Diagnostics' },
              { id: 'resources', label: '📦 Resources Auditor' },
              { id: 'security', label: '🛡️ Security Observations' },
              { id: 'performance', label: '⚡ Performance Metrics' },
              { id: 'indexability', label: '🚦 Indexability Status' },
              { id: 'sitemap', label: '🗺️ Sitemap Details' },
              { id: 'robots', label: '🤖 Robots.txt Rules' }
            ].map(sec => (
              <button
                key={sec.id}
                onClick={() => setSelectedSection(sec.id)}
                className={`w-full text-left p-3 rounded-2xl text-xs font-bold transition-all uppercase tracking-wider ${
                  selectedSection === sec.id
                    ? 'bg-teal-650 text-white shadow-md'
                    : 'bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
              >
                {sec.label}
              </button>
            ))}
          </div>

          {/* Right Main Content */}
          <div className="col-span-12 md:col-span-9 space-y-6">
            
            {crawlStatus === 'CRAWLING' && (
              <div className="p-4 border border-teal-500/20 bg-teal-500/5 rounded-3xl space-y-2 text-xs font-semibold">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-black tracking-wider text-teal-650">Crawler active</span>
                  <span className="font-mono text-zinc-500">{liveProcessingUrls.length} workers processing</span>
                </div>
                <div className="text-[11px] text-zinc-500 font-mono">
                  {crawledCount} URLs processed · {queuedCount} queued · {discoveredCount} discovered
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[10px] font-mono text-zinc-450 border-t pt-2 mt-2">
                  <div>Speed: <strong className="text-teal-650">{liveUrlsPerMin} URLs/min</strong> ({liveUrlsPerSec}/s)</div>
                  <div>Avg Latency: <strong className="text-blue-500">{liveAvgTime} ms</strong></div>
                  <div className="truncate">Current: <span className="text-zinc-600 dark:text-zinc-300">{currentUrl}</span></div>
                </div>
                {liveProcessingUrls.length > 0 && (
                  <div className="text-[10px] font-mono text-zinc-400 truncate bg-zinc-50 dark:bg-zinc-905 p-2 rounded-xl mt-2 border">
                    {liveProcessingUrls.map((url, idx) => (
                      <div key={idx} className="truncate font-mono">Worker {idx + 1} → {url}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Overview Section */}
            {selectedSection === 'overview' && (
              <div className="space-y-6">
                {/* Global Score breakdown banner */}
                {activeScoreProfile && (
                  <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-500/10 to-blue-500/10 border border-teal-500/20 shadow-sm flex flex-wrap justify-between items-center gap-6">
                    <div>
                      <h3 className="text-sm font-black text-zinc-805 dark:text-zinc-200">Global Website Health Audit Score</h3>
                      <p className="text-[10px] text-zinc-400 mt-1 font-mono">Scoring Engine Version: {activeScoreProfile.scoringVersion} | Deterministic Audit Checks</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-4xl font-black font-mono text-teal-650">{activeScoreProfile.globalScore}</div>
                      <div className="text-zinc-400 font-bold text-lg">/ 100</div>
                    </div>
                  </div>
                )}

                {activeComparisonResult && (
                  <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-3 text-xs">
                    <div className="flex justify-between items-center border-b pb-2">
                      <h4 className="text-[10px] font-black uppercase text-zinc-450 tracking-wider">Last Comparison Run Summary</h4>
                      <button
                        onClick={() => setActiveTab('compare')}
                        className="text-[10px] text-teal-650 hover:underline font-bold"
                      >
                        Open Full Comparison →
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-[10px] text-zinc-400 font-bold uppercase mb-1">Score Change</div>
                        <div className={`text-base font-bold font-mono ${activeComparisonResult.summary.score.global.diff >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {activeComparisonResult.summary.score.global.before} → {activeComparisonResult.summary.score.global.after} ({activeComparisonResult.summary.score.global.diff >= 0 ? `+${activeComparisonResult.summary.score.global.diff}` : activeComparisonResult.summary.score.global.diff})
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-zinc-400 font-bold uppercase mb-1">New / Removed Pages</div>
                        <div className="text-base font-bold font-mono text-zinc-800 dark:text-zinc-200">
                          <span className="text-emerald-500">+{activeComparisonResult.summary.pages.new}</span> / <span className="text-rose-500">-{activeComparisonResult.summary.pages.removed}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-zinc-400 font-bold uppercase mb-1">Changed Pages</div>
                        <div className="text-base font-bold font-mono text-amber-500">
                          {activeComparisonResult.summary.pages.changed}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-zinc-400 font-bold uppercase mb-1">New / Resolved Issues</div>
                        <div className="text-base font-bold font-mono text-zinc-800 dark:text-zinc-200">
                          <span className="text-rose-500">+{activeComparisonResult.summary.issues.new}</span> / <span className="text-emerald-500">-{activeComparisonResult.summary.issues.resolved}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Counters Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Discovered', count: discoveredCount, color: 'text-zinc-650' },
                    { label: 'Crawled Pages', count: crawledCount, color: 'text-teal-650' },
                    { label: 'Queue Size', count: queuedCount, color: 'text-amber-650' },
                    { label: 'Network Failures', count: failedCount, color: 'text-rose-650' },
                    { label: 'Blocked (Robots)', count: blockedCount, color: 'text-zinc-500' },
                    { label: 'Skipped Subdomains', count: skippedCount, color: 'text-zinc-400' }
                  ].map((stat, idx) => (
                    <div key={idx} className="p-4 border rounded-3xl bg-white dark:bg-zinc-900/40 shadow-sm flex flex-col gap-1">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase">{stat.label}</span>
                      <strong className={`text-xl font-mono ${stat.color}`}>{stat.count}</strong>
                    </div>
                  ))}
                </div>

                {/* Real-time stats detail */}
                {overviewStats && (
                  <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-4 text-xs font-semibold">
                    <span className="text-[10px] font-black uppercase text-zinc-450 block tracking-wider border-b pb-2">Response status distribution</span>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>2xx Success: <strong className="text-teal-600 font-mono">{overviewStats['2xx']}</strong></div>
                      <div>3xx Redirects: <strong className="text-blue-500 font-mono">{overviewStats['3xx']}</strong></div>
                      <div>4xx Client Errors: <strong className="text-rose-500 font-mono">{overviewStats['4xx']}</strong></div>
                      <div>5xx Server Errors: <strong className="text-red-600 font-mono">{overviewStats['5xx']}</strong></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-t pt-4 mt-2">
                      <div>Avg Latency: <strong className="font-mono text-zinc-700 dark:text-zinc-350">{overviewStats.averageResponseTime} ms</strong></div>
                      <div>Download Size: <strong className="font-mono text-zinc-750 dark:text-zinc-300">{(overviewStats.totalBytes / 1024).toFixed(1)} KB</strong></div>
                      <div>Discovered Issues: <strong className="font-mono text-rose-500">{overviewStats.issues} count</strong></div>
                    </div>
                  </div>
                )}

                {/* Categories scores grid */}
                {activeScoreProfile && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    {Object.entries(activeScoreProfile.categories).map(([key, category]) => (
                      <div key={key} className="p-4 border rounded-3xl bg-white dark:bg-zinc-900/40 shadow-sm flex items-center justify-between gap-4">
                        <div>
                          <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider block mb-1">{key}</span>
                          <span className="text-[10px] text-zinc-500 font-mono block">Checks: {category.totalChecks} | Failed: {category.failedChecks}</span>
                        </div>
                        <span className={`text-base font-black font-mono ${category.score >= 80 ? 'text-teal-650' : category.score >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                          {category.score}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* URLs Explorer Section */}
            {selectedSection === 'urls' && (
              <div className="space-y-4">
                {/* Search & filter bars */}
                <div className="flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Search URLs..."
                      value={explorerQuery}
                      onChange={(e) => { setExplorerQuery(e.target.value); setExplorerPage(1); }}
                      className="p-2 border rounded-xl text-xs focus:outline-none w-48 bg-white dark:bg-zinc-900"
                    />
                    <select
                      value={explorerStatusFilter}
                      onChange={(e) => { setExplorerStatusFilter(e.target.value); setExplorerPage(1); }}
                      className="p-2 border rounded-xl text-xs focus:outline-none bg-white dark:bg-zinc-900"
                    >
                      <option value="">All HTTP Statuses</option>
                      <option value="200">200 OK</option>
                      <option value="3xx">3xx Redirects</option>
                      <option value="4xx">4xx Errors</option>
                      <option value="5xx">5xx Errors</option>
                    </select>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase">URL Database Explorer</span>
                </div>

                {urlExplorerData ? (
                  <div className="border rounded-2xl overflow-hidden bg-white dark:bg-zinc-900/40 shadow-sm">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-905 border-b text-[10px] text-zinc-400 font-bold uppercase font-mono">
                          <th className="p-3">Target URL</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Content Type</th>
                          <th className="p-3">Latency (ms)</th>
                          <th className="p-3">Size (KB)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {urlExplorerData.data.map((pageItem: any, idx: number) => (
                          <tr key={idx} className="border-b hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 font-mono">
                            <td className="p-3 truncate max-w-xs">{pageItem.url}</td>
                            <td className="p-3">
                              <span className={`px-1.5 py-0.5 rounded font-bold ${
                                pageItem.status >= 200 && pageItem.status < 300 ? 'bg-teal-500/10 text-teal-650' : 'bg-rose-500/10 text-rose-500'
                              }`}>
                                {pageItem.status}
                              </span>
                            </td>
                            <td className="p-3">{pageItem.type || 'text/html'}</td>
                            <td className="p-3">{pageItem.time} ms</td>
                            <td className="p-3">{(pageItem.size || 0).toFixed(1)} KB</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-905 flex justify-between items-center text-[10px] font-mono font-bold text-zinc-500 border-t">
                      <button
                        disabled={explorerPage <= 1}
                        onClick={() => setExplorerPage(prev => Math.max(1, prev - 1))}
                        className="px-2 py-1 bg-white dark:bg-zinc-900 border rounded-lg disabled:opacity-50"
                      >
                        Prev
                      </button>
                      <span>Page {explorerPage} of {Math.ceil(urlExplorerData.total / explorerPage) || 1}</span>
                      <button
                        disabled={explorerPage * 10 >= urlExplorerData.total}
                        onClick={() => setExplorerPage(prev => prev + 1)}
                        className="px-2 py-1 bg-white dark:bg-zinc-900 border rounded-lg disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-zinc-400 italic text-xs">No URL records loaded.</div>
                )}
              </div>
            )}

            {/* Diagnostics Issues Section */}
            {selectedSection === 'issues' && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <select
                    value={issuesCategoryFilter}
                    onChange={(e) => { setIssuesCategoryFilter(e.target.value); setIssuesPage(1); }}
                    className="p-2 border rounded-xl text-xs focus:outline-none bg-white dark:bg-zinc-900"
                  >
                    <option value="">All Categories</option>
                    <option value="SEO">SEO</option>
                    <option value="LINKS">Links</option>
                    <option value="CONTENT">Content</option>
                    <option value="RESOURCES">Resources</option>
                    <option value="SECURITY">Security</option>
                    <option value="PERFORMANCE">Performance</option>
                  </select>
                  <select
                    value={issuesSeverityFilter}
                    onChange={(e) => { setIssuesSeverityFilter(e.target.value); setIssuesPage(1); }}
                    className="p-2 border rounded-xl text-xs focus:outline-none bg-white dark:bg-zinc-900"
                  >
                    <option value="">All Severities</option>
                    <option value="CRITICAL">Critical</option>
                    <option value="WARNING">Warning</option>
                    <option value="NOTICE">Notice</option>
                  </select>
                </div>

                {issuesData ? (
                  <div className="space-y-3">
                    {issuesData.data.map((issue: any, idx: number) => (
                      <div key={idx} className="p-4 border rounded-2xl bg-white dark:bg-zinc-900/40 shadow-sm flex flex-col gap-2 text-xs font-semibold">
                        <div className="flex justify-between items-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            issue.severity === 'CRITICAL' ? 'bg-rose-500/10 text-rose-500' : issue.severity === 'WARNING' ? 'bg-amber-500/10 text-amber-600' : 'bg-blue-500/10 text-blue-550'
                          }`}>
                            {issue.severity}
                          </span>
                          <span className="font-mono text-[10px] text-zinc-400">{issue.rule}</span>
                        </div>
                        <p className="text-zinc-700 dark:text-zinc-200">{issue.description}</p>
                        <div className="text-[10px] font-mono text-zinc-450 truncate">URL: {issue.url}</div>
                      </div>
                    ))}

                    {/* Pagination */}
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-905 flex justify-between items-center text-[10px] font-mono font-bold text-zinc-500 border rounded-2xl">
                      <button
                        disabled={issuesPage <= 1}
                        onClick={() => setIssuesPage(prev => Math.max(1, prev - 1))}
                        className="px-2 py-1 bg-white dark:bg-zinc-900 border rounded-lg disabled:opacity-50"
                      >
                        Prev
                      </button>
                      <span>Page {issuesPage} of {Math.ceil(issuesData.total / issuesPage) || 1}</span>
                      <button
                        disabled={issuesPage * 10 >= issuesData.total}
                        onClick={() => setIssuesPage(prev => prev + 1)}
                        className="px-2 py-1 bg-white dark:bg-zinc-900 border rounded-lg disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-zinc-400 italic text-xs">No issues reported.</div>
                )}
              </div>
            )}

            {/* SEO Auditor Section */}
            {selectedSection === 'seo' && (
              <div className="space-y-6">
                {seoSummaryData ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { title: 'Missing Titles', val: seoSummaryData.missingTitles },
                      { title: 'Duplicate Titles', val: seoSummaryData.duplicateTitles },
                      { title: 'Short/Long Titles', val: seoSummaryData.shortTitles + seoSummaryData.longTitles },
                      { title: 'Missing Descriptions', val: seoSummaryData.missingDescriptions },
                      { title: 'H1 Headings Issues', val: seoSummaryData.h1Issues },
                      { title: 'Canonical Decl. Issues', val: seoSummaryData.canonicalIssues }
                    ].map((item, idx) => (
                      <div key={idx} className="p-4 border rounded-3xl bg-white dark:bg-zinc-900/40 shadow-sm flex justify-between items-center text-xs font-semibold">
                        <span>{item.title}</span>
                        <strong className={`font-mono text-sm ${item.val > 0 ? 'text-rose-500' : 'text-teal-600'}`}>
                          {item.val}
                        </strong>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-zinc-400 italic text-xs">SEO audits not available.</div>
                )}
              </div>
            )}

            {/* Links Audit Section */}
            {selectedSection === 'links' && (
              <div className="space-y-4">
                {linksData ? (
                  <div className="border rounded-2xl overflow-hidden bg-white dark:bg-zinc-900/40 shadow-sm">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-905 border-b text-[10px] text-zinc-400 font-bold uppercase font-mono">
                          <th className="p-3">Source URL</th>
                          <th className="p-3">Destination URL</th>
                          <th className="p-3">HTTP Status</th>
                          <th className="p-3">Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {linksData.data.map((l: any, idx: number) => (
                          <tr key={idx} className="border-b hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 font-mono">
                            <td className="p-3 truncate max-w-xs">{l.source}</td>
                            <td className="p-3 truncate max-w-xs">{l.destination}</td>
                            <td className="p-3 font-bold">{l.status}</td>
                            <td className="p-3">{l.isExternal ? 'EXTERNAL' : 'INTERNAL'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-zinc-400 italic text-xs">Links data not loaded.</div>
                )}
              </div>
            )}

            {/* Redirects Section */}
            {selectedSection === 'redirects' && (
              <div className="space-y-4">
                {redirectsData ? (
                  <div className="border rounded-2xl overflow-hidden bg-white dark:bg-zinc-900/40 shadow-sm">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-905 border-b text-[10px] text-zinc-400 font-bold uppercase font-mono">
                          <th className="p-3">Source Redirect URL</th>
                          <th className="p-3">Target Destination URL</th>
                          <th className="p-3">HTTP Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {redirectsData.data.map((l: any, idx: number) => (
                          <tr key={idx} className="border-b hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 font-mono">
                            <td className="p-3 truncate max-w-xs">{l.source}</td>
                            <td className="p-3 truncate max-w-xs">{l.destination}</td>
                            <td className="p-3 text-blue-500 font-bold">{l.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-zinc-400 italic text-xs">No redirects found.</div>
                )}
              </div>
            )}

            {/* Content Analyzer Section */}
            {selectedSection === 'content' && (
              <div className="space-y-6">
                {contentData ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-3xl bg-white dark:bg-zinc-900/40 shadow-sm flex flex-col gap-1 text-xs font-semibold">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase">Total Words Count</span>
                        <strong className="text-xl font-mono">{contentData.totalWords}</strong>
                      </div>
                      <div className="p-4 border rounded-3xl bg-white dark:bg-zinc-900/40 shadow-sm flex flex-col gap-1 text-xs font-semibold">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase">Avg Words per Page</span>
                        <strong className="text-xl font-mono">{contentData.avgWords}</strong>
                      </div>
                      <div className="p-4 border rounded-3xl bg-white dark:bg-zinc-900/40 shadow-sm flex flex-col gap-1 text-xs font-semibold">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase">Thin Pages (&lt;100 w)</span>
                        <strong className="text-xl font-mono text-rose-500">{contentData.lowContentCount}</strong>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-zinc-400 italic text-xs">Content data not available.</div>
                )}
              </div>
            )}

            {/* Images Diagnostics Section */}
            {selectedSection === 'images' && (
              <div className="space-y-4">
                {imageData ? (
                  <div className="border rounded-2xl overflow-hidden bg-white dark:bg-zinc-900/40 shadow-sm">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-905 border-b text-[10px] text-zinc-400 font-bold uppercase font-mono">
                          <th className="p-3">Source Page</th>
                          <th className="p-3">Image Address</th>
                          <th className="p-3">Alt Text</th>
                          <th className="p-3">Loading</th>
                        </tr>
                      </thead>
                      <tbody>
                        {imageData.data.map((img: any, idx: number) => (
                          <tr key={idx} className="border-b hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 font-mono">
                            <td className="p-3 truncate max-w-xs">{img.pageUrl}</td>
                            <td className="p-3 truncate max-w-xs">{img.url}</td>
                            <td className="p-3">
                              {img.alt ? <span className="text-zinc-600 dark:text-zinc-300">{img.alt}</span> : <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 font-bold">MISSING ALT</span>}
                            </td>
                            <td className="p-3">{img.loading || 'eager'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-zinc-400 italic text-xs">No images logged.</div>
                )}
              </div>
            )}

            {/* Resources Auditor Section */}
            {selectedSection === 'resources' && (
              <div className="space-y-4">
                {resourceData ? (
                  <div className="border rounded-2xl overflow-hidden bg-white dark:bg-zinc-900/40 shadow-sm">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-905 border-b text-[10px] text-zinc-400 font-bold uppercase font-mono">
                          <th className="p-3">Resource Target Address</th>
                          <th className="p-3">Type</th>
                          <th className="p-3">HTTP Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resourceData.data.map((resItem: any, idx: number) => (
                          <tr key={idx} className="border-b hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 font-mono">
                            <td className="p-3 truncate max-w-xs">{resItem.url}</td>
                            <td className="p-3 uppercase font-bold text-zinc-450">{resItem.type}</td>
                            <td className="p-3 font-bold">{resItem.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-zinc-400 italic text-xs">No resource records logged.</div>
                )}
              </div>
            )}

            {/* Security Observations Section */}
            {selectedSection === 'security' && (
              <div className="space-y-4">
                {securityData ? (
                  <div className="border rounded-2xl overflow-hidden bg-white dark:bg-zinc-900/40 shadow-sm">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-905 border-b text-[10px] text-zinc-400 font-bold uppercase font-mono">
                          <th className="p-3">Target Address</th>
                          <th className="p-3">HSTS</th>
                          <th className="p-3">CSP</th>
                          <th className="p-3">X-Frame</th>
                          <th className="p-3">X-Content</th>
                        </tr>
                      </thead>
                      <tbody>
                        {securityData.data.map((p: any, idx: number) => (
                          <tr key={idx} className="border-b hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 font-mono">
                            <td className="p-3 truncate max-w-xs">{p.url}</td>
                            <td className="p-3">
                              <span className={`px-1.5 py-0.5 rounded font-bold ${p.securityHeaders?.HSTS === 'PRESENT' ? 'bg-teal-555/10 text-teal-650' : 'bg-rose-500/10 text-rose-500'}`}>
                                {p.securityHeaders?.HSTS || 'MISSING'}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className={`px-1.5 py-0.5 rounded font-bold ${p.securityHeaders?.CSP === 'PRESENT' ? 'bg-teal-555/10 text-teal-650' : 'bg-rose-500/10 text-rose-500'}`}>
                                {p.securityHeaders?.CSP || 'MISSING'}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className={`px-1.5 py-0.5 rounded font-bold ${p.securityHeaders?.XFrameOptions === 'PRESENT' ? 'bg-teal-555/10 text-teal-650' : 'bg-rose-500/10 text-rose-500'}`}>
                                {p.securityHeaders?.XFrameOptions || 'MISSING'}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className={`px-1.5 py-0.5 rounded font-bold ${p.securityHeaders?.XContentTypeOptions === 'PRESENT' ? 'bg-teal-555/10 text-teal-650' : 'bg-rose-500/10 text-rose-500'}`}>
                                {p.securityHeaders?.XContentTypeOptions || 'MISSING'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-zinc-400 italic text-xs">Security data not loaded.</div>
                )}
              </div>
            )}

            {/* Performance Metrics Section */}
            {selectedSection === 'performance' && (
              <div className="space-y-4">
                {performanceData ? (
                  <div className="border rounded-2xl overflow-hidden bg-white dark:bg-zinc-900/40 shadow-sm">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-905 border-b text-[10px] text-zinc-400 font-bold uppercase font-mono">
                          <th className="p-3">URL Address</th>
                          <th className="p-3">Latency (ms)</th>
                          <th className="p-3">HTML Size</th>
                        </tr>
                      </thead>
                      <tbody>
                        {performanceData.data.map((p: any, idx: number) => (
                          <tr key={idx} className="border-b hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 font-mono">
                            <td className="p-3 truncate max-w-xs">{p.url}</td>
                            <td className="p-3 font-bold text-zinc-700 dark:text-zinc-300">{p.time} ms</td>
                            <td className="p-3">{(p.size || 0).toFixed(1)} KB</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-zinc-400 italic text-xs">Performance latency not loaded.</div>
                )}
              </div>
            )}

            {/* Indexability Section */}
            {selectedSection === 'indexability' && (
              <div className="space-y-4">
                {indexabilityData ? (
                  <div className="border rounded-2xl overflow-hidden bg-white dark:bg-zinc-900/40 shadow-sm">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-905 border-b text-[10px] text-zinc-400 font-bold uppercase font-mono">
                          <th className="p-3">URL Address</th>
                          <th className="p-3">Indexability Status</th>
                          <th className="p-3">Meta Robots</th>
                        </tr>
                      </thead>
                      <tbody>
                        {indexabilityData.data.map((p: any, idx: number) => (
                          <tr key={idx} className="border-b hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 font-mono">
                            <td className="p-3 truncate max-w-xs">{p.url}</td>
                            <td className="p-3">
                              <span className={`px-1.5 py-0.5 rounded font-bold ${
                                p.indexability === 'Indexable' ? 'bg-teal-500/10 text-teal-650' : 'bg-amber-500/10 text-amber-600'
                              }`}>
                                {p.indexability || 'Indexable'}
                              </span>
                            </td>
                            <td className="p-3 text-zinc-500">{p.metaRobots || 'none'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-zinc-400 italic text-xs">Indexability audits not loaded.</div>
                )}
              </div>
            )}

            {/* Sitemap Section */}
            {selectedSection === 'sitemap' && (
              <div className="space-y-4">
                {sitemapData ? (
                  <div className="p-4 border rounded-3xl bg-white dark:bg-zinc-900/40 shadow-sm space-y-2 text-xs font-semibold">
                    <div className="text-[10px] uppercase font-bold text-zinc-400">Discovered XML Sitemaps</div>
                    {sitemapData.sitemaps.map((mapUrl: string, idx: number) => (
                      <div key={idx} className="font-mono text-[10px] text-zinc-650">{mapUrl} (HTTP {sitemapData.status})</div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-zinc-400 italic text-xs">Sitemap not analyzed.</div>
                )}
              </div>
            )}

            {/* Robots Section */}
            {selectedSection === 'robots' && (
              <div className="space-y-4">
                {robotsData ? (
                  <div className="p-4 border rounded-3xl bg-white dark:bg-zinc-900/40 shadow-sm space-y-4 text-xs font-semibold">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Robots.txt Location</span>
                      <span className="font-mono text-[11px] text-zinc-600">{robotsData.robotsUrl}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Content Rules</span>
                      <pre className="p-3 bg-zinc-50 dark:bg-zinc-905 rounded-xl border font-mono text-[10px] text-zinc-600 block">{robotsData.content}</pre>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-zinc-400 italic text-xs">robots.txt not loaded.</div>
                )}
              </div>
            )}
            
          </div>
        </div>
      )}

      {/* 3. CRAWLED PAGES LIST */}
      {activeTab === 'pages' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <input
              type="text"
              value={pageLogSearch}
              onChange={(e) => setPageLogSearch(e.target.value)}
              placeholder="Filter pages URL..."
              className="p-2 border rounded-xl text-xs w-full sm:max-w-xs focus:outline-none"
            />
            {sessionPages.length > 0 && (
              <button onClick={handleExportCSV} className="px-3 py-1.5 bg-zinc-900 text-white rounded-lg text-xs font-bold">
                Export Pages CSV
              </button>
            )}
          </div>

          <div className="overflow-x-auto border rounded-2xl bg-white dark:bg-zinc-900/40">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b bg-zinc-50 dark:bg-zinc-900 text-zinc-450 dark:text-zinc-300 font-black font-mono">
                  <th className="p-3 pl-4">Page Target URL</th>
                  <th className="p-3">HTTP Status</th>
                  <th className="p-3">Load Time (ms)</th>
                  <th className="p-3">Title Length</th>
                  <th className="p-3 pr-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y text-zinc-700 dark:text-zinc-350 font-medium">
                {sessionPages.filter(p => p.url.includes(pageLogSearch)).map((page, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50/50">
                    <td className="p-3 pl-4 font-mono truncate max-w-[200px] select-all">{page.url}</td>
                    <td className="p-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        page.status === 200 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                      }`}>{page.status} {page.statusText}</span>
                    </td>
                    <td className="p-3 font-mono">{page.time} ms</td>
                    <td className="p-3 font-mono">{page.title?.length || 0}</td>
                    <td className="p-3 pr-4">
                      <button onClick={() => setSelectedPage(page)} className="text-teal-650 font-bold hover:underline">Inspect</button>
                    </td>
                  </tr>
                ))}

                {sessionPages.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-zinc-400 italic">No crawled pages data logged in this session.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>


        </div>
      )}

      {/* 4. ISSUES CENTER */}
      {activeTab === 'issues' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start animate-fadeIn">
          
          <div className="md:col-span-6 space-y-3 text-xs">
            <span className="text-[10px] font-black uppercase text-zinc-455 block tracking-wider border-b pb-2">Audited Issues list</span>
            
            {issueSummaryList.map((issue) => (
              <button
                key={issue.id}
                onClick={() => setSelectedIssueRule(issue.id)}
                className="w-full text-left p-3 border rounded-xl bg-white dark:bg-zinc-900 flex justify-between items-center hover:border-teal-500 transition"
              >
                <div>
                  <strong className="text-zinc-800 dark:text-zinc-200">{issue.rule}</strong>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">Category Severity: <span className="capitalize font-bold text-amber-500">{issue.severity}</span></span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 font-black font-mono">{issue.pagesCount}</span>
              </button>
            ))}

            {issueSummaryList.length === 0 && (
              <div className="text-center py-6 text-zinc-405 italic">No technical issues detected in crawled pages!</div>
            )}
          </div>

          {/* Affected URL inspection list */}
          <div className="md:col-span-6 space-y-3 font-mono text-xs">
            <span className="text-[10px] font-black uppercase text-zinc-455 block tracking-wider border-b pb-2">Affected Target URLs</span>
            
            {selectedIssueRule ? (
              <div className="p-4 border rounded-2xl bg-zinc-50 dark:bg-zinc-905 max-h-60 overflow-y-auto space-y-1.5">
                {issueSummaryList.find(i => i.id === selectedIssueRule)?.affectedUrls.map((url, i) => (
                  <div key={i} className="truncate text-zinc-650 hover:text-teal-600 cursor-pointer">{url}</div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-zinc-400 italic">Select an issue rule from the list to drilldown affected pages.</div>
            )}
          </div>
        </div>
      )}

      {/* 5. SITE GRAPH STUDIO */}
      {activeTab === 'structure' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Control Panel */}
          <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="flex flex-wrap items-center gap-3">
                {/* View Selector */}
                <div>
                  <span className="text-[9px] font-black uppercase text-zinc-400 block mb-1">Graph View Layout</span>
                  <select
                    value={graphViewType}
                    onChange={(e) => setGraphViewType(e.target.value as any)}
                    className="p-2 border rounded-xl text-xs bg-white dark:bg-zinc-900 focus:outline-none"
                  >
                    <option value="link">Internal Link Graph</option>
                    <option value="tree">Crawl Tree Hierarchy</option>
                    <option value="domain">Domain Connections</option>
                    <option value="issue">SEO Issue Heatmap</option>
                    <option value="redirect">Redirect Chains Graph</option>
                    {activeComparisonResult && (
                      <option value="diff">Visual Graph Differences Diff</option>
                    )}
                  </select>
                </div>

                {/* Focus/Full Selector */}
                <div>
                  <span className="text-[9px] font-black uppercase text-zinc-400 block mb-1">Rendering Mode</span>
                  <select
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value as any)}
                    className="p-2 border rounded-xl text-xs bg-white dark:bg-zinc-900 focus:outline-none"
                  >
                    <option value="focus">Focus Mode (Virtualized Neighborhood)</option>
                    <option value="full">Full Graph (Filtered)</option>
                  </select>
                </div>

                {/* Hops Selector (for Focus mode) */}
                {viewMode === 'focus' && (
                  <div>
                    <span className="text-[9px] font-black uppercase text-zinc-400 block mb-1">Neighborhood Hops</span>
                    <select
                      value={hopsLimit}
                      onChange={(e) => setHopsLimit(parseInt(e.target.value))}
                      className="p-2 border rounded-xl text-xs bg-white dark:bg-zinc-900 focus:outline-none"
                    >
                      <option value={1}>1 Hop (Direct neighbours)</option>
                      <option value={2}>2 Hops</option>
                      <option value={3}>3 Hops</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Navigation zoom/pan */}
              <div className="flex items-center gap-3">
                <div>
                  <span className="text-[9px] font-black uppercase text-zinc-400 block mb-1">Canvas Scale</span>
                  <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-0.5 font-bold text-[11px]">
                    <button onClick={() => setZoomLevel(prev => Math.max(0.3, prev - 0.15))} className="px-2.5 py-1">Zoom Out</button>
                    <button onClick={() => setZoomLevel(prev => Math.min(3.0, prev + 0.15))} className="px-2.5 py-1 border-l dark:border-zinc-700">Zoom In</button>
                    <button onClick={() => { setZoomLevel(1); setPanX(0); setPanY(0); }} className="px-2.5 py-1 border-l dark:border-zinc-700">Reset</button>
                  </div>
                </div>

                {/* Search query */}
                <div>
                  <span className="text-[9px] font-black uppercase text-zinc-400 block mb-1">Search Node</span>
                  <input
                    type="text"
                    value={graphSearchQuery}
                    onChange={(e) => setGraphSearchQuery(e.target.value)}
                    placeholder="Search node URL..."
                    className="p-2 border rounded-xl text-xs bg-white dark:bg-zinc-900 focus:outline-none w-48"
                  />
                </div>
              </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap gap-4 pt-2 border-t dark:border-zinc-800 text-[11px] font-semibold text-zinc-650">
              <div className="flex items-center gap-2">
                <span>Depth:</span>
                <select
                  value={selectedDepthFilter}
                  onChange={(e) => setSelectedDepthFilter(e.target.value)}
                  className="p-1 border rounded bg-white dark:bg-zinc-900 text-xs focus:outline-none font-mono"
                >
                  <option value="">All</option>
                  {Array.from(new Set(graphNodes.map(n => n.depth))).sort((a,b)=>a-b).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span>HTTP Status:</span>
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="p-1 border rounded bg-white dark:bg-zinc-900 text-xs focus:outline-none font-mono"
                >
                  <option value="">All Statuses</option>
                  <option value="200">200 OK</option>
                  <option value="301">301 Redirect</option>
                  <option value="302">302 Redirect</option>
                  <option value="404">404 Not Found</option>
                  <option value="0">0 Failed</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span>Type:</span>
                <select
                  value={selectedTypeFilter}
                  onChange={(e) => setSelectedTypeFilter(e.target.value)}
                  className="p-1 border rounded bg-white dark:bg-zinc-900 text-xs focus:outline-none font-mono"
                >
                  <option value="">All Types</option>
                  <option value="text/html">HTML Page</option>
                  <option value="image/">Image</option>
                  <option value="javascript">JavaScript</option>
                  <option value="css">CSS</option>
                </select>
              </div>

              {graphNodes.length > 200 && viewMode === 'full' && (
                <div className="text-amber-500 font-bold flex items-center gap-1.5 ml-auto text-[10px] uppercase font-mono">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Large crawl ({graphNodes.length} nodes). Focus Mode recommended for optimal speed.
                </div>
              )}
            </div>
          </div>

          {/* Interactive Graph Canvas and Node Sidebar layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Canvas Viewer */}
            <div className="lg:col-span-8 border rounded-3xl overflow-hidden bg-zinc-950 shadow-sm relative h-[420px]">
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                className="w-full h-full cursor-grab active:cursor-grabbing block"
              />
              <div className="absolute bottom-4 left-4 bg-zinc-900/90 text-[10px] font-mono p-2 rounded-xl text-zinc-400 space-y-0.5 backdrop-blur border border-zinc-800 pointer-events-none select-none">
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#10b981]"></span> 200 OK Node</div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#fbbf24]"></span> 3xx Redirect Node</div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#ef4444]"></span> 4xx/5xx Error Node</div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#a855f7]"></span> Failed Subnet Node</div>
              </div>
            </div>

            {/* Sidebar Inspector Card */}
            <div className="lg:col-span-4 p-5 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-4 flex flex-col h-[420px] overflow-y-auto">
              {selectedNodeId ? (
                (() => {
                  const node = graphNodes.find(n => n.id === selectedNodeId);
                  const parentNode = sessionPages.find(p => p.url === node?.url);
                  if (!node) return <div className="text-center py-8 text-zinc-400 italic">Page not found in dataset.</div>;
                  return (
                    <div className="space-y-4 flex-1 flex flex-col">
                      <div>
                        <span className="text-[9px] font-black uppercase text-zinc-400 block mb-1 font-mono">Selected Node URL</span>
                        <div className="text-[11px] font-mono font-bold text-zinc-850 dark:text-zinc-200 break-all select-all p-2 bg-zinc-50 dark:bg-zinc-905 rounded-xl border">{node.url}</div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-[9px] font-black uppercase text-zinc-400 block font-mono">HTTP Status</span>
                          <span className={`px-2 py-0.5 rounded font-black font-mono text-[10px] ${
                            node.status === 200 ? 'bg-teal-500/10 text-teal-650' : (node.status >= 300 && node.status < 400 ? 'bg-amber-500/10 text-amber-600' : 'bg-rose-500/10 text-rose-600')
                          }`}>{node.status || 'FAILED'}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-black uppercase text-zinc-400 block font-mono">Crawl Depth</span>
                          <span className="font-bold text-zinc-700 dark:text-zinc-300 font-mono">Depth {node.depth}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-black uppercase text-zinc-400 block font-mono">Indexability</span>
                          <span className="font-bold text-zinc-700 dark:text-zinc-300 font-mono capitalize">{node.indexability}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-black uppercase text-zinc-400 block font-mono">Content Type</span>
                          <span className="font-bold text-zinc-700 dark:text-zinc-300 font-mono truncate block">{node.contentType}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs border-t pt-3 dark:border-zinc-800">
                        <div>
                          <span className="text-[9px] font-black uppercase text-zinc-400 block font-mono">Inbound Links</span>
                          <span className="font-black text-zinc-800 dark:text-zinc-200 font-mono">{node.inboundCount} links</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-black uppercase text-zinc-400 block font-mono">Outbound Links</span>
                          <span className="font-black text-zinc-800 dark:text-zinc-200 font-mono">{node.outboundCount} links</span>
                        </div>
                      </div>

                      {/* Parent & Discovery Details */}
                      {parentNode && (
                        <div className="text-[11px] space-y-2 border-t pt-3 dark:border-zinc-800 flex-1">
                          <div>
                            <span className="text-[9px] font-black uppercase text-zinc-400 block font-mono">Discovered From (Parent URL)</span>
                            <span className="font-mono text-[10px] truncate block text-zinc-550 select-all">{parentNode.parentUrl || 'None (Seed URL)'}</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-black uppercase text-zinc-400 block font-mono">Discovery Channel</span>
                            <span className="font-mono text-[10px] block font-bold text-teal-600">{parentNode.discoverySource || 'INTERNAL_LINK'}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 border-t pt-3 dark:border-zinc-800 mt-auto">
                        <button
                          onClick={handleInspectSelectedNode}
                          className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-850 text-white rounded-xl text-xs font-bold transition"
                        >
                          View in Page Inspector
                        </button>
                        <button
                          onClick={() => setSelectedNodeId(null)}
                          className="px-3 py-2 border rounded-xl text-xs font-bold text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="space-y-4 flex flex-col justify-between h-full">
                  <div>
                    <span className="text-[10px] font-black uppercase text-zinc-400 block mb-1 font-mono">Architecture Summary</span>
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-905 rounded-3xl border space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <div className="text-[9px] uppercase font-bold text-zinc-400 font-mono">Total Nodes</div>
                          <div className="font-black text-lg text-zinc-800 dark:text-zinc-200 font-mono">{graphStats?.totalNodes || 0}</div>
                        </div>
                        <div>
                          <div className="text-[9px] uppercase font-bold text-zinc-400 font-mono">Total Links</div>
                          <div className="font-black text-lg text-zinc-800 dark:text-zinc-200 font-mono">{graphStats?.totalEdges || 0}</div>
                        </div>
                        <div>
                          <div className="text-[9px] uppercase font-bold text-zinc-400 font-mono">Internal Links</div>
                          <div className="font-bold text-zinc-700 dark:text-zinc-300 font-mono">{graphStats?.internalEdges || 0}</div>
                        </div>
                        <div>
                          <div className="text-[9px] uppercase font-bold text-zinc-400 font-mono">External Links</div>
                          <div className="font-bold text-zinc-700 dark:text-zinc-300 font-mono">{graphStats?.externalEdges || 0}</div>
                        </div>
                        <div>
                          <div className="text-[9px] uppercase font-bold text-zinc-400 font-mono">Max Depth</div>
                          <div className="font-bold text-zinc-700 dark:text-zinc-300 font-mono">Depth {graphStats?.maxDepth || 0}</div>
                        </div>
                        <div>
                          <div className="text-[9px] uppercase font-bold text-zinc-400 font-mono">Avg Depth</div>
                          <div className="font-bold text-zinc-700 dark:text-zinc-300 font-mono">{graphStats?.averageDepth || 0}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-center p-4 border border-dashed rounded-3xl text-zinc-400 italic text-[11px] space-y-1">
                    <Activity className="w-6 h-6 mx-auto mb-2 text-zinc-300 animate-pulse" />
                    <div>Click any node circle inside the Canvas to view page connections, discovery lineage, and status diagnostics.</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sub-tabs Panel for Graph Analysis & Algorithms */}
          <div className="border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl overflow-hidden bg-white dark:bg-zinc-900/40 shadow-sm">
            <div className="flex bg-zinc-50 dark:bg-zinc-905 border-b font-mono text-[10px] font-black uppercase text-zinc-450 tracking-wider">
              <button onClick={() => setGraphSubTab('summary')} className={`p-3.5 border-r focus:outline-none ${graphSubTab === 'summary' ? 'bg-white dark:bg-zinc-900 text-teal-650 border-b-2 border-b-teal-600' : 'hover:bg-zinc-100/50'}`}>Crawl Diagnostics</button>
              <button onClick={() => setGraphSubTab('pathfinder')} className={`p-3.5 border-r focus:outline-none ${graphSubTab === 'pathfinder' ? 'bg-white dark:bg-zinc-900 text-teal-650 border-b-2 border-b-teal-600' : 'hover:bg-zinc-100/50'}`}>Shortest Path Finder</button>
              <button onClick={() => setGraphSubTab('depth')} className={`p-3.5 border-r focus:outline-none ${graphSubTab === 'depth' ? 'bg-white dark:bg-zinc-900 text-teal-650 border-b-2 border-b-teal-600' : 'hover:bg-zinc-100/50'}`}>Depth Analytics</button>
              <button onClick={() => setGraphSubTab('hubs')} className={`p-3.5 border-r focus:outline-none ${graphSubTab === 'hubs' ? 'bg-white dark:bg-zinc-900 text-teal-650 border-b-2 border-b-teal-600' : 'hover:bg-zinc-100/50'}`}>Hub Pages</button>
              <button onClick={() => setGraphSubTab('orphans')} className={`p-3.5 border-r focus:outline-none ${graphSubTab === 'orphans' ? 'bg-white dark:bg-zinc-900 text-teal-650 border-b-2 border-b-teal-600' : 'hover:bg-zinc-100/50'}`}>Orphan Analysis</button>
              <button onClick={() => setGraphSubTab('redirects')} className={`p-3.5 border-r focus:outline-none ${graphSubTab === 'redirects' ? 'bg-white dark:bg-zinc-900 text-teal-650 border-b-2 border-b-teal-600' : 'hover:bg-zinc-100/50'}`}>Redirect Chains</button>
              <button onClick={() => setGraphSubTab('broken')} className={`p-3.5 focus:outline-none ${graphSubTab === 'broken' ? 'bg-white dark:bg-zinc-900 text-teal-650 border-b-2 border-b-teal-600' : 'hover:bg-zinc-100/50'}`}>Broken Link Graph</button>
            </div>

            <div className="p-6 text-xs min-h-[180px]">
              {/* Summary Dashboard tab */}
              {graphSubTab === 'summary' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-4">
                    <span className="text-[10px] font-black uppercase text-zinc-400 block tracking-wider font-mono">Edge Classifications</span>
                    <div className="space-y-2 font-mono">
                      <div className="flex justify-between border-b pb-1"><span>Redirect Edges</span><span className="font-bold text-amber-500">{graphStats?.redirectEdges || 0}</span></div>
                      <div className="flex justify-between border-b pb-1"><span>Broken link Edges</span><span className="font-bold text-rose-500">{graphStats?.brokenEdges || 0}</span></div>
                      <div className="flex justify-between border-b pb-1"><span>Internal Links</span><span className="font-bold text-teal-650">{graphStats?.internalEdges || 0}</span></div>
                      <div className="flex justify-between border-b pb-1"><span>External Links</span><span className="font-bold text-zinc-500">{graphStats?.externalEdges || 0}</span></div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <span className="text-[10px] font-black uppercase text-zinc-400 block tracking-wider font-mono">Connected Components</span>
                    <div className="space-y-2 font-mono">
                      <div className="flex justify-between border-b pb-1"><span>Weakly Connected Components</span><span className="font-bold text-zinc-800 dark:text-zinc-200">{graphStats?.connectedComponents || 0}</span></div>
                      <div className="flex justify-between border-b pb-1"><span>Hub Candidates</span><span className="font-bold text-teal-650">{graphStats?.hubCandidates || 0}</span></div>
                      <div className="flex justify-between border-b pb-1"><span>Orphan Candidates</span><span className="font-bold text-amber-500">{graphStats?.orphanCandidates || 0}</span></div>
                      <div className="flex justify-between border-b pb-1"><span>Algorithm Version</span><span className="font-bold text-zinc-500 font-mono text-[9px]">{graphStats?.algorithmVersion || 'N/A'}</span></div>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-3 font-mono">
                    <span className="text-[10px] font-black uppercase text-zinc-400 block tracking-wider">Site Connectivity Audit</span>
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-905 rounded-2xl border text-[11px] leading-relaxed text-zinc-650 space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-teal-600 font-bold">✔</span>
                        <div>The site architecture was parsed dynamically into <strong>{graphStats?.connectedComponents || 0} weakly connected components</strong>.</div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-amber-500 font-bold">!</span>
                        <div>Found <strong>{graphStats?.orphanCandidates || 0} orphan candidates</strong> (pages that exist in sitemap or canonical alternates but have 0 incoming HTML links).</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Shortest Path Finder tab */}
              {graphSubTab === 'pathfinder' && (
                <div className="space-y-4 font-mono">
                  <div className="flex flex-wrap items-end gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">Source Page URL</label>
                      <select
                        value={pathSource}
                        onChange={(e) => setPathSource(e.target.value)}
                        className="w-full p-2 border rounded-xl text-xs bg-white dark:bg-zinc-900 focus:outline-none"
                      >
                        <option value="">Select source page...</option>
                        {sessionPages.map(p => (
                          <option key={p.url} value={p.url}>{p.url.replace(/^https?:\/\//i, '').slice(0, 50)}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex-1 min-w-[200px]">
                      <label className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">Destination Page URL</label>
                      <select
                        value={pathDestination}
                        onChange={(e) => setPathDestination(e.target.value)}
                        className="w-full p-2 border rounded-xl text-xs bg-white dark:bg-zinc-900 focus:outline-none"
                      >
                        <option value="">Select destination page...</option>
                        {sessionPages.map(p => (
                          <option key={p.url} value={p.url}>{p.url.replace(/^https?:\/\//i, '').slice(0, 50)}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={handleFindPath}
                      className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl text-xs tracking-wider"
                    >
                      Find Shortest Path
                    </button>
                  </div>

                  {/* Pathfinder Output */}
                  {pathList !== null ? (
                    pathList && pathList.length > 0 ? (
                      <div className="p-4 bg-zinc-50 dark:bg-zinc-905 rounded-2xl border space-y-3">
                        <span className="text-[10px] font-bold text-zinc-400 block uppercase">Path discovered ({pathList.length - 1} hops)</span>
                        <div className="flex flex-wrap items-center gap-2 text-[10px]">
                          {pathList.map((url, index) => (
                            <span key={index} className="flex items-center gap-2">
                              {index > 0 && <span className="text-zinc-400 font-bold font-sans">→</span>}
                              <span className="p-1 px-2 bg-teal-500/10 text-teal-650 rounded-lg font-bold border border-teal-500/20">{url.replace(/^https?:\/\//i, '')}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-rose-500/5 text-rose-600 rounded-2xl border border-rose-500/20 text-center font-bold">
                        No internal path found. No HTML links connect the selected pages.
                      </div>
                    )
                  ) : (
                    <div className="text-center py-6 text-zinc-400 italic">Select Source & Destination pages to calculate paths.</div>
                  )}
                </div>
              )}

              {/* Depth statistics tab */}
              {graphSubTab === 'depth' && (
                <div className="space-y-4">
                  <div className="border rounded-2xl overflow-hidden bg-white dark:bg-zinc-900/40">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-900 border-b text-[10px] text-zinc-450 uppercase font-bold font-mono">
                          <th className="p-3 pl-4">Depth Level</th>
                          <th className="p-3">Page Count</th>
                          <th className="p-3">Avg Inbound Degree</th>
                          <th className="p-3">Avg Outbound Degree</th>
                          <th className="p-3 pr-4">Drilldown Filter</th>
                        </tr>
                      </thead>
                      <tbody>
                        {depthStats.map((stat, idx) => (
                          <tr key={idx} className="border-b font-mono text-[11px] hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50">
                            <td className="p-3 pl-4 font-bold text-zinc-800 dark:text-zinc-200">Level {stat.depth}</td>
                            <td className="p-3">{stat.pageCount} pages</td>
                            <td className="p-3 text-zinc-650">{stat.avgInbound}</td>
                            <td className="p-3 text-zinc-650">{stat.avgOutbound}</td>
                            <td className="p-3 pr-4">
                              <button
                                onClick={() => setSelectedDepthFilter(stat.depth.toString())}
                                className="px-2 py-0.5 bg-zinc-100 hover:bg-zinc-200 rounded font-bold text-zinc-650 text-[10px]"
                              >
                                Filter Graph
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Hub Pages tab */}
              {graphSubTab === 'hubs' && (
                <div className="space-y-4">
                  <div className="border rounded-2xl overflow-hidden bg-white dark:bg-zinc-900/40">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-900 border-b text-[10px] text-zinc-450 uppercase font-bold font-mono">
                          <th className="p-3 pl-4">Hub Target URL</th>
                          <th className="p-3">Title</th>
                          <th className="p-3">Inbound degree</th>
                          <th className="p-3">Outbound degree</th>
                          <th className="p-3 pr-4 font-black">Total Degree</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hubsList.map((hub, idx) => (
                          <tr key={idx} className="border-b font-mono text-[11px] hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50">
                            <td className="p-3 pl-4 text-teal-650 truncate max-w-xs cursor-pointer select-all" onClick={() => setSelectedNodeId(hub.url)}>{hub.url}</td>
                            <td className="p-3 truncate max-w-xs">{hub.title}</td>
                            <td className="p-3">{hub.inboundDegree}</td>
                            <td className="p-3">{hub.outboundDegree}</td>
                            <td className="p-3 pr-4 font-bold text-zinc-800 dark:text-zinc-200">{hub.totalDegree}</td>
                          </tr>
                        ))}
                        {hubsList.length === 0 && (
                          <tr><td colSpan={5} className="p-8 text-center text-zinc-400 italic">No hub pages exceeding standard deviation thresholds found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Orphans tab */}
              {graphSubTab === 'orphans' && (
                <div className="space-y-4">
                  <div className="border rounded-2xl overflow-hidden bg-white dark:bg-zinc-900/40">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-900 border-b text-[10px] text-zinc-450 uppercase font-bold font-mono">
                          <th className="p-3 pl-4">Orphan Candidate URL</th>
                          <th className="p-3">Classification</th>
                          <th className="p-3">Discovery source</th>
                          <th className="p-3 pr-4">Diagnostic Audit Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orphansList.map((orph, idx) => (
                          <tr key={idx} className="border-b font-mono text-[11px] hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50">
                            <td className="p-3 pl-4 text-amber-600 truncate max-w-xs cursor-pointer select-all" onClick={() => setSelectedNodeId(orph.url)}>{orph.url}</td>
                            <td className="p-3">
                              <span className={`px-1.5 py-0.5 rounded font-black text-[9px] uppercase ${
                                orph.isCandidate ? 'bg-amber-500/10 text-amber-600' : 'bg-zinc-500/10 text-zinc-500'
                              }`}>{orph.isCandidate ? 'Orphan Candidate' : 'Orphan'}</span>
                            </td>
                            <td className="p-3 text-zinc-500">{orph.discoverySource}</td>
                            <td className="p-3 pr-4 text-zinc-550 italic">{orph.reason}</td>
                          </tr>
                        ))}
                        {orphansList.length === 0 && (
                          <tr><td colSpan={4} className="p-8 text-center text-zinc-400 italic">No disconnected orphan candidate URLs detected.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Redirect tab */}
              {graphSubTab === 'redirects' && (
                <div className="space-y-4">
                  <div className="border rounded-2xl overflow-hidden bg-white dark:bg-zinc-900/40">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-900 border-b text-[10px] text-zinc-450 uppercase font-bold font-mono">
                          <th className="p-3 pl-4">Redirect Source</th>
                          <th className="p-3">Destination</th>
                          <th className="p-3">HTTP Status</th>
                          <th className="p-3">Chain Length</th>
                          <th className="p-3 pr-4">Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {redirectsList.map((redir, idx) => (
                          <tr key={idx} className="border-b font-mono text-[11px] hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50">
                            <td className="p-3 pl-4 truncate max-w-xs select-all">{redir.source}</td>
                            <td className="p-3 truncate max-w-xs text-zinc-650 select-all">{redir.destination}</td>
                            <td className="p-3 font-bold text-amber-500">{redir.status}</td>
                            <td className="p-3">{redir.chainLength} hops</td>
                            <td className="p-3 pr-4">
                              <span className={`px-1.5 py-0.5 rounded font-black text-[9px] uppercase ${
                                redir.isLoop ? 'bg-rose-500/10 text-rose-600' : 'bg-amber-500/10 text-amber-600'
                              }`}>{redir.isLoop ? 'Loop Cycle' : 'Redirect Chain'}</span>
                            </td>
                          </tr>
                        ))}
                        {redirectsList.length === 0 && (
                          <tr><td colSpan={5} className="p-8 text-center text-zinc-400 italic">No redirect pages found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Broken Links tab */}
              {graphSubTab === 'broken' && (
                <div className="space-y-4">
                  <div className="border rounded-2xl overflow-hidden bg-white dark:bg-zinc-900/40">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-900 border-b text-[10px] text-zinc-450 uppercase font-bold font-mono">
                          <th className="p-3 pl-4">Source Page</th>
                          <th className="p-3">Broken Destination</th>
                          <th className="p-3">HTTP Code</th>
                          <th className="p-3 pr-4 font-black">Anchor Text</th>
                        </tr>
                      </thead>
                      <tbody>
                        {brokenLinksList.map((brk, idx) => (
                          <tr key={idx} className="border-b font-mono text-[11px] hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50">
                            <td className="p-3 pl-4 text-zinc-650 truncate max-w-xs select-all cursor-pointer font-bold" onClick={() => setSelectedNodeId(brk.source)}>{brk.source}</td>
                            <td className="p-3 truncate max-w-xs text-rose-600 font-bold select-all">{brk.destination}</td>
                            <td className="p-3 font-black text-rose-600">{brk.status || 'FAILED'}</td>
                            <td className="p-3 pr-4 text-zinc-500 truncate max-w-xs font-bold">{brk.anchorText}</td>
                          </tr>
                        ))}
                        {brokenLinksList.length === 0 && (
                          <tr><td colSpan={4} className="p-8 text-center text-zinc-400 italic">No broken internal/external outbound links found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. CRAWL COMPARISONS */}
      {activeTab === 'compare' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Comparison Setup Panel */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block border-b pb-2"> CRAWL COMPARISON SYSTEM</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 block mb-1 uppercase tracking-wider">Baseline Crawl A (Previous)</label>
                <select
                  value={compareCrawlIdA}
                  onChange={(e) => setCompareCrawlIdA(e.target.value)}
                  className="w-full p-2 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs bg-white dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                >
                  <option value="">Select baseline crawl...</option>
                  {crawlHistoryList.map(h => (
                    <option key={h.id} value={h.id}>{h.domain} — {new Date(h.timestamp).toLocaleString()}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 block mb-1 uppercase tracking-wider">Comparative Crawl B (Current)</label>
                <select
                  value={compareCrawlIdB}
                  onChange={(e) => setCompareCrawlIdB(e.target.value)}
                  className="w-full p-2 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs bg-white dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                >
                  <option value="">Select comparative crawl...</option>
                  {crawlHistoryList.map(h => (
                    <option key={h.id} value={h.id}>{h.domain} — {new Date(h.timestamp).toLocaleString()}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => handleStartComparison(compareCrawlIdA, compareCrawlIdB)}
                className="px-4 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity"
              >
                Compare Crawls
              </button>
            </div>
          </div>

          {/* Comparison Jobs List */}
          {comparisonJobs.length > 0 && (
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-4">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block border-b pb-2">Active comparison queues</span>
              <div className="space-y-3">
                {comparisonJobs.map((job: any) => (
                  <div key={job.jobId} className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="font-mono text-[10px] text-zinc-400">Job ID: {job.jobId}</div>
                      <div className="font-semibold">Crawl A vs Crawl B</div>
                      <div className="text-[10px] text-zinc-400">Created: {new Date(job.createdTimestamp).toLocaleString()}</div>
                      {job.status === 'processing' && (
                        <div className="w-full max-w-[200px] bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 mt-2 overflow-hidden">
                          <div
                            className="bg-teal-500 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${(job.progress / (job.total || 100)) * 100}%` }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {job.status === 'completed' ? (
                        <>
                          <button
                            onClick={() => loadComparisonResultSummary(job.jobId)}
                            className="px-3 py-1.5 bg-teal-500 text-white rounded-lg text-xs font-semibold hover:bg-teal-600 transition"
                          >
                            View Analysis Report
                          </button>
                          <button
                            onClick={() => handleDeleteComparison(job.jobId)}
                            className="px-3 py-1.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg text-xs font-semibold hover:bg-zinc-300 dark:hover:bg-zinc-700 transition"
                          >
                            Delete
                          </button>
                        </>
                      ) : job.status === 'processing' || job.status === 'queued' ? (
                        <button
                          onClick={() => handleCancelComparison(job.jobId)}
                          className="px-3 py-1.5 bg-rose-500 text-white rounded-lg text-xs font-semibold hover:bg-rose-600 transition"
                        >
                          Cancel
                        </button>
                      ) : (
                        <span className="text-zinc-500 capitalize italic">{job.status}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Active Comparison Result View */}
          {activeComparisonResult && (
            <div className="space-y-6">
              {/* Tab Navigation for active results */}
              <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-px">
                <button
                  onClick={() => setComparisonTab('summary')}
                  className={`pb-2 px-4 text-xs font-bold border-b-2 transition-all ${
                    comparisonTab === 'summary'
                      ? 'border-zinc-900 dark:border-white text-zinc-900 dark:text-white'
                      : 'border-transparent text-zinc-400 hover:text-zinc-600'
                  }`}
                >
                  Comparison Summary
                </button>
                <button
                  onClick={() => {
                    setComparisonTab('explorer');
                    loadComparePagesList(activeComparisonResult.jobId, compareFilter, 1);
                  }}
                  className={`pb-2 px-4 text-xs font-bold border-b-2 transition-all ${
                    comparisonTab === 'explorer'
                      ? 'border-zinc-900 dark:border-white text-zinc-900 dark:text-white'
                      : 'border-transparent text-zinc-400 hover:text-zinc-600'
                  }`}
                >
                  URL Change Explorer
                </button>
              </div>

              {/* Tab 1: Comparison Summary */}
              {comparisonTab === 'summary' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Score Movements Header Card */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60 text-center">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Global Health Score</span>
                      <div className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
                        {activeComparisonResult.summary.score.global.before} → {activeComparisonResult.summary.score.global.after}
                      </div>
                      <span className={`text-[10px] font-bold ${activeComparisonResult.summary.score.global.diff >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {activeComparisonResult.summary.score.global.diff >= 0 ? `+${activeComparisonResult.summary.score.global.diff}` : activeComparisonResult.summary.score.global.diff}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60 text-center">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Discovered Pages</span>
                      <div className="text-2xl font-bold text-emerald-500">+{activeComparisonResult.summary.pages.new}</div>
                      <span className="text-[9px] text-zinc-400">Added since baseline</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60 text-center">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Removed Pages</span>
                      <div className="text-2xl font-bold text-rose-500">-{activeComparisonResult.summary.pages.removed}</div>
                      <span className="text-[9px] text-zinc-400">Lost since baseline</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60 text-center">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Technical Issues</span>
                      <div className="text-2xl font-bold text-amber-500">
                        {activeComparisonResult.summary.issues.new} / {activeComparisonResult.summary.issues.resolved}
                      </div>
                      <span className="text-[9px] text-zinc-400">New / Resolved issues</span>
                    </div>
                  </div>

                  {/* Category Scores Comparison table */}
                  <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white pb-2 border-b">Category Scores delta</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                            <th className="py-2">Category</th>
                            <th className="py-2">Baseline Crawl</th>
                            <th className="py-2">Comparative Crawl</th>
                            <th className="py-2">Score Difference</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                          {Object.entries(activeComparisonResult.summary.score.categories).map(([cat, val]: [string, any]) => {
                            const diff = val.after - val.before;
                            return (
                              <tr key={cat}>
                                <td className="py-2.5 font-semibold text-zinc-800 dark:text-zinc-200">{cat}</td>
                                <td className="py-2.5 font-mono">{val.before} / 100</td>
                                <td className="py-2.5 font-mono">{val.after} / 100</td>
                                <td className={`py-2.5 font-bold ${diff >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                  {diff >= 0 ? `+${diff}` : diff}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Issues Delta Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-500 pb-2 border-b">Resolved Technical Issues</h4>
                      {activeComparisonResult.issues.resolved.length === 0 ? (
                        <div className="text-zinc-400 italic text-xs py-4 text-center">No issues resolved since baseline.</div>
                      ) : (
                        <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
                          {activeComparisonResult.issues.resolved.map((i: any, idx: number) => (
                            <div key={idx} className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 text-xs">
                              <div className="font-bold text-zinc-800 dark:text-zinc-200">{i.rule}</div>
                              <div className="text-[10px] text-zinc-400 mt-0.5">{i.description}</div>
                              <div className="text-[9px] text-emerald-600 font-mono mt-1">{i.url}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-rose-500 pb-2 border-b">New Discovered Issues</h4>
                      {activeComparisonResult.issues.new.length === 0 ? (
                        <div className="text-zinc-400 italic text-xs py-4 text-center">No new issues introduced.</div>
                      ) : (
                        <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
                          {activeComparisonResult.issues.new.map((i: any, idx: number) => (
                            <div key={idx} className="p-3 bg-rose-500/5 rounded-xl border border-rose-500/10 text-xs">
                              <div className="font-bold text-zinc-800 dark:text-zinc-200">{i.rule}</div>
                              <div className="text-[10px] text-zinc-400 mt-0.5">{i.description}</div>
                              <div className="text-[9px] text-rose-600 font-mono mt-1">{i.url}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Architecture & Performance changes */}
                  <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white pb-2 border-b">Architecture Node & Hub Differences</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                      <div className="space-y-2">
                        <div>New Orphan Candidates: <strong className="text-amber-500 font-mono">{activeComparisonResult.architecture.newOrphans.length}</strong></div>
                        <div className="max-h-[100px] overflow-y-auto font-mono text-[10px] text-zinc-400 space-y-1">
                          {activeComparisonResult.architecture.newOrphans.map((url: string) => <div key={url}>{url}</div>)}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>Resolved Orphan Candidates: <strong className="text-emerald-500 font-mono">{activeComparisonResult.architecture.resolvedOrphans.length}</strong></div>
                        <div className="max-h-[100px] overflow-y-auto font-mono text-[10px] text-zinc-400 space-y-1">
                          {activeComparisonResult.architecture.resolvedOrphans.map((url: string) => <div key={url}>{url}</div>)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: URL Change Explorer */}
              {comparisonTab === 'explorer' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Category Filter buttons */}
                  <div className="flex flex-wrap gap-2">
                    {['All', 'NEW', 'REMOVED', 'CHANGED', 'HTTP', 'SEO', 'Content', 'Links', 'Indexability', 'Security', 'Performance'].map(f => (
                      <button
                        key={f}
                        onClick={() => {
                          setCompareFilter(f);
                          loadComparePagesList(activeComparisonResult.jobId, f, 1);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          compareFilter === f
                            ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:opacity-80'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>

                  {/* Main Grid: list of changes (Left) and side-by-side differ (Right) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white pb-2 border-b">Changed Pages Explorer</h4>
                      
                      {comparePagesList.length === 0 ? (
                        <div className="text-zinc-400 italic text-xs py-10 text-center">No URL delta observed for filter {compareFilter}.</div>
                      ) : (
                        <div className="space-y-2">
                          {comparePagesList.map((item: any) => (
                            <div
                              key={item.url}
                              onClick={() => loadComparePageDetails(activeComparisonResult.jobId, item.url)}
                              className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                                selectedCompareUrl === item.url
                                  ? 'border-zinc-950 dark:border-white bg-zinc-50 dark:bg-zinc-900'
                                  : 'border-zinc-200/60 dark:border-zinc-850 hover:bg-zinc-50/50'
                              }`}
                            >
                              <div className="font-semibold break-all text-zinc-800 dark:text-zinc-200">{item.url}</div>
                              <div className="flex justify-between items-center mt-2">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                  item.changeType === 'NEW'
                                    ? 'bg-emerald-500/10 text-emerald-500'
                                    : item.changeType === 'REMOVED'
                                    ? 'bg-rose-500/10 text-rose-500'
                                    : 'bg-amber-500/10 text-amber-500'
                                }`}>
                                  {item.changeType}
                                </span>
                                <span className="text-[10px] text-zinc-400 font-medium">{item.details}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Pagination */}
                      {compareTotalPages > 1 && (
                        <div className="flex justify-between items-center pt-4 border-t border-zinc-100 dark:border-zinc-800">
                          <button
                            disabled={compareCurrentPage === 1}
                            onClick={() => loadComparePagesList(activeComparisonResult.jobId, compareFilter, compareCurrentPage - 1)}
                            className="p-1 text-zinc-400 hover:text-zinc-900 disabled:opacity-30"
                          >
                            Prev
                          </button>
                          <span className="text-[10px] font-bold text-zinc-400 uppercase">Page {compareCurrentPage} of {compareTotalPages}</span>
                          <button
                            disabled={compareCurrentPage === compareTotalPages}
                            onClick={() => loadComparePagesList(activeComparisonResult.jobId, compareFilter, compareCurrentPage + 1)}
                            className="p-1 text-zinc-400 hover:text-zinc-900 disabled:opacity-30"
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Side-by-side Page Comparison diff panel */}
                    <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white pb-2 border-b">Side-by-side differences</h4>
                      
                      {isLoadingCompareDetails ? (
                        <div className="text-center py-20 text-zinc-400 italic text-xs animate-pulse">Loading comparison metadata...</div>
                      ) : selectedCompareUrl && (comparePageDetailsA || comparePageDetailsB) ? (
                        <div className="space-y-6">
                          <div className="font-semibold text-xs text-zinc-850 dark:text-zinc-150 break-all">{selectedCompareUrl}</div>
                          
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-850 space-y-3">
                              <span className="text-[9px] font-black text-zinc-450 uppercase tracking-wider block border-b pb-1.5">Baseline Crawl A</span>
                              {comparePageDetailsA ? (
                                <div className="space-y-2">
                                  <div>Title: <span className="font-semibold">{comparePageDetailsA.title || 'None'}</span></div>
                                  <div>Description: <span className="font-semibold">{comparePageDetailsA.description || 'None'}</span></div>
                                  <div>Status: <span className="font-semibold font-mono">{comparePageDetailsA.status}</span></div>
                                  <div>H1s: <span className="font-semibold">{comparePageDetailsA.h1s?.join(', ') || 'None'}</span></div>
                                  <div>Word Count: <span className="font-semibold font-mono">{comparePageDetailsA.wordCount}</span></div>
                                  <div>Indexability: <span className="font-semibold">{comparePageDetailsA.indexability}</span></div>
                                </div>
                              ) : (
                                <div className="text-zinc-400 italic py-6">Does not exist (Added in B)</div>
                              )}
                            </div>

                            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-850 space-y-3">
                              <span className="text-[9px] font-black text-zinc-450 uppercase tracking-wider block border-b pb-1.5">Comparative Crawl B</span>
                              {comparePageDetailsB ? (
                                <div className="space-y-2">
                                  <div>Title: <span className="font-semibold">{comparePageDetailsB.title || 'None'}</span></div>
                                  <div>Description: <span className="font-semibold">{comparePageDetailsB.description || 'None'}</span></div>
                                  <div>Status: <span className="font-semibold font-mono">{comparePageDetailsB.status}</span></div>
                                  <div>H1s: <span className="font-semibold">{comparePageDetailsB.h1s?.join(', ') || 'None'}</span></div>
                                  <div>Word Count: <span className="font-semibold font-mono">{comparePageDetailsB.wordCount}</span></div>
                                  <div>Indexability: <span className="font-semibold">{comparePageDetailsB.indexability}</span></div>
                                </div>
                              ) : (
                                <div className="text-zinc-400 italic py-6">Does not exist (Removed in B)</div>
                              )}
                            </div>
                          </div>

                          {/* Detail of detected changes */}
                          {compareDetailsChanges.length > 0 && (
                            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
                              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block border-b pb-1.5">Detected Field Deltas</span>
                              <div className="space-y-2 font-semibold text-xs">
                                {compareDetailsChanges.map((ch: any, idx: number) => (
                                  <div key={idx} className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-850 pb-1.5 last:border-0 last:pb-0">
                                    <div className="text-zinc-400">{ch.field}</div>
                                    <div className="text-right">
                                      <span className="line-through text-rose-500 mr-2 font-mono">{String(ch.before)}</span>
                                      <span className="text-emerald-500 font-mono">{String(ch.after)}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-20 text-zinc-400 italic text-xs">Select a changed URL on the left list to view side-by-side metadata comparisons.</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 7. HISTORY LIST */}
      {activeTab === 'history' && (
        <div className="space-y-4 animate-fadeIn">
          <span className="text-[10px] font-black uppercase text-zinc-455 block tracking-wider border-b pb-2">Crawl records registry</span>
          
          <div className="space-y-3">
            {crawlHistoryList.map((hist) => (
              <div
                key={hist.id}
                className="p-4 border rounded-2xl bg-white dark:bg-zinc-900 flex justify-between items-center text-xs font-semibold"
              >
                <div>
                  <strong className="text-zinc-800 dark:text-zinc-200">{hist.domain}</strong>
                  <span className="text-[10px] text-zinc-400 block font-mono mt-0.5">Timestamp: {hist.timestamp} | Status: <span className="text-teal-650">{hist.status}</span></span>
                </div>
                
                <div className="flex gap-4 items-center">
                  <span className="text-[10px] font-mono text-zinc-500 font-bold">Pages: {hist.totalPages} | Failed: {hist.brokenLinks} | Score: {hist.seoScore || 100}</span>
                  <button onClick={() => selectCrawlRecord(hist)} className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg transition text-[10px]">
                    Inspect
                  </button>
                  <button onClick={() => deleteCrawlRecord(hist.id)} className="text-rose-500 hover:text-rose-700 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {crawlHistoryList.length === 0 && (
              <div className="text-center py-8 text-zinc-405 italic text-xs">No saved local crawl runs database recorded.</div>
            )}
          </div>
        </div>
      )}

      {/* 8. EXPORT CENTER */}
      {activeTab === 'export' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          {/* Config Left Panel */}
          <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-6">
            <div>
              <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block border-b pb-2">Export crawl dataset</h3>
              <span className="text-[10px] text-zinc-400 block mt-1 font-mono">Configure and export raw data collected during the site crawl.</span>
            </div>

            {/* Target Crawl Info */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-905 rounded-2xl border text-xs space-y-1">
              <span className="text-[9px] font-black uppercase text-zinc-400 block font-mono">Selected Crawl Target</span>
              {activeCrawlId ? (
                (() => {
                  const currentCrawl = crawlHistoryList.find(c => c.id === activeCrawlId);
                  return (
                    <div className="font-mono">
                      <div className="font-bold text-zinc-850 dark:text-zinc-200">{currentCrawl?.domain || activeCrawlId}</div>
                      <div className="text-[10px] text-zinc-450 mt-0.5">Timestamp: {currentCrawl?.timestamp} | Pages Count: {sessionPages.length} | Issues: {crawledIssues.length}</div>
                    </div>
                  );
                })()
              ) : (
                <div className="text-zinc-400 italic font-mono">No active crawl run selected. Select a run in history first.</div>
              )}
            </div>

            {/* Dataset Checklist */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-zinc-405 block tracking-wider font-mono">Available Datasets</span>
                <div className="flex gap-2 text-[10px] font-bold text-teal-650">
                  <button onClick={handleSelectAllDatasets}>Select All</button>
                  <span className="text-zinc-300">|</span>
                  <button onClick={handleClearAllDatasets}>Clear All</button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { id: 'pages', name: 'Pages Metadata' },
                  { id: 'issues', name: 'Technical Issues' },
                  { id: 'links', name: 'Internal/External Links' },
                  { id: 'redirects', name: 'Redirect Chains & Loops' },
                  { id: 'images', name: 'Images Alt Assets' },
                  { id: 'resources', name: 'Styles/Scripts Resources' },
                  { id: 'seo', name: 'On-Page SEO Results' },
                  { id: 'headings', name: 'Heading Hierarchies' },
                  { id: 'indexability', name: 'Indexability Statuses' },
                  { id: 'security', name: 'Passive Security Audits' },
                  { id: 'performance', name: 'Performance Timings' },
                  { id: 'sitemap', name: 'XML Sitemap Paths' },
                  { id: 'robots', name: 'Robots.txt Directives' },
                  { id: 'architecture', name: 'Crawl Graph Nodes/Edges' }
                ].map((ds) => {
                  const isChecked = selectedExportDatasets.includes(ds.id);
                  return (
                    <label
                      key={ds.id}
                      onClick={() => toggleDataset(ds.id)}
                      className={`p-3 border rounded-2xl cursor-pointer flex items-center gap-3 transition hover:bg-zinc-50 dark:hover:bg-zinc-800 ${
                        isChecked ? 'border-teal-500 bg-teal-500/5' : 'bg-white dark:bg-zinc-900'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="accent-teal-600 rounded"
                      />
                      <span className="text-[11px] font-semibold text-zinc-705 dark:text-zinc-300">{ds.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Export Scope */}
            <div className="space-y-3 border-t pt-4 dark:border-zinc-800">
              <span className="text-[10px] font-black uppercase text-zinc-405 block tracking-wider font-mono">Export Scope Scope</span>
              <div className="flex gap-6 text-xs font-semibold">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="exportScope"
                    checked={exportScope === 'entire'}
                    onChange={() => setExportScope('entire')}
                    className="accent-teal-600"
                  />
                  <span>Entire Crawl ({sessionPages.length} URLs)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="exportScope"
                    checked={exportScope === 'filtered'}
                    onChange={() => setExportScope('filtered')}
                    className="accent-teal-600"
                  />
                  <span>Currently Filtered Dataset</span>
                </label>
              </div>

              {/* Show active filters details */}
              {exportScope === 'filtered' && (
                <div className="p-3 bg-amber-500/5 text-amber-600 rounded-xl border border-amber-500/10 text-[10px] font-mono leading-relaxed space-y-0.5">
                  <div className="font-bold">Active Filters Applied:</div>
                  <div>HTTP Status filter: {selectedStatusFilter || explorerStatusFilter || 'None'}</div>
                  <div>Crawl Depth filter: {selectedDepthFilter || 'None'}</div>
                  <div>Content Type filter: {selectedTypeFilter || 'None'}</div>
                  <div>Keyword search query: {graphSearchQuery || explorerQuery || 'None'}</div>
                </div>
              )}
            </div>

            {/* Export Format */}
            <div className="space-y-3 border-t pt-4 dark:border-zinc-800">
              <span className="text-[10px] font-black uppercase text-zinc-405 block tracking-wider font-mono">Choose File Format</span>
              <div className="flex flex-wrap gap-4 text-xs font-semibold">
                {[
                  { id: 'csv', name: 'CSV Spreadsheets (ZIP bundle if multiple)' },
                  { id: 'json', name: 'JSON Document (Preserves schema links)' },
                  { id: 'xlsx', name: 'XLSX Workbook (Separate frozen tabs)' },
                  { id: 'pdf', name: 'PDF Executive Audit Summary Report' }
                ].map((f) => (
                  <label key={f.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="exportFormat"
                      checked={exportFormat === f.id}
                      onChange={() => setExportFormat(f.id as any)}
                      className="accent-teal-600"
                    />
                    <span>{f.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Action Trigger */}
            <button
              onClick={handleStartExport}
              disabled={!activeCrawlId || selectedExportDatasets.length === 0}
              className="w-full py-3 bg-zinc-900 hover:bg-zinc-850 disabled:bg-zinc-150 disabled:text-zinc-400 text-white font-bold rounded-2xl text-xs tracking-wider transition uppercase"
            >
              Initiate Asynchronous Export Job
            </button>
          </div>

          {/* Right Side Jobs Progress Tracker */}
          <div className="lg:col-span-4 p-5 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col h-[600px]">
            <div>
              <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block border-b pb-2 font-mono">Export Jobs Queue</h3>
              <span className="text-[9px] text-zinc-450 block mt-1 font-mono">Files expire and auto-clean 24 hours after completion.</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 mt-4 pr-1">
              {exportJobs.map((job) => {
                const createdTime = new Date(job.createdTimestamp).toLocaleTimeString();
                const progressText = job.status === 'processing' ? `Exported: ${job.progress} / ${job.total} rows` : '';
                const sizeText = job.fileSize ? ` | File size: ${(job.fileSize / 1024).toFixed(1)} KB` : '';
                return (
                  <div key={job.jobId} className="p-3 border rounded-2xl bg-zinc-50 dark:bg-zinc-905 space-y-2 text-[11px]">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">ID: {job.jobId}</span>
                        <span className="text-[9px] text-zinc-405 block font-mono">Format: {job.format.toUpperCase()} | Created: {createdTime}</span>
                      </div>
                      
                      <span className={`px-1.5 py-0.5 rounded font-black font-mono text-[9px] uppercase ${
                        job.status === 'completed' ? 'bg-teal-500/10 text-teal-650' : 
                        job.status === 'processing' ? 'bg-blue-500/10 text-blue-505 animate-pulse' : 
                        job.status === 'failed' ? 'bg-rose-500/10 text-rose-600' : 'bg-zinc-300/10 text-zinc-500'
                      }`}>{job.status}</span>
                    </div>

                    {job.status === 'processing' && (
                      <div className="space-y-1">
                        <div className="text-[9px] font-mono font-bold text-blue-500">{progressText}</div>
                        <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-500 h-full transition-all duration-300"
                            style={{ width: `${Math.min(100, Math.round((job.progress / (job.total || 1)) * 100))}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {job.status === 'completed' && (
                      <div className="text-[9px] font-mono text-teal-600">Export completed successfully{sizeText}</div>
                    )}

                    {job.status === 'failed' && (
                      <div className="text-[9px] font-mono text-rose-500 leading-relaxed font-bold">Error: {job.error || 'Export generation failed.'}</div>
                    )}

                    <div className="flex justify-end gap-2 border-t pt-2 dark:border-zinc-800 font-bold text-[10px]">
                      {(job.status === 'queued' || job.status === 'processing') && (
                        <button
                          onClick={() => handleCancelExport(job.jobId)}
                          className="px-2.5 py-1 border border-zinc-200 hover:bg-zinc-100 rounded-lg text-zinc-500"
                        >
                          Cancel
                        </button>
                      )}
                      {job.status === 'completed' && (
                        <button
                          onClick={() => handleDownloadExport(job.jobId, job.format)}
                          className="px-2.5 py-1 bg-teal-600 hover:bg-teal-750 text-white rounded-lg"
                        >
                          Download File
                        </button>
                      )}
                      {(job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') && (
                        <button
                          onClick={() => handleDeleteExport(job.jobId)}
                          className="px-2.5 py-1 border border-zinc-200 hover:bg-rose-50 hover:text-rose-605 rounded-lg text-zinc-400"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {exportJobs.length === 0 && (
                <div className="text-center py-16 text-zinc-400 italic text-[11px] space-y-1">
                  <Activity className="w-5 h-5 mx-auto text-zinc-305 animate-pulse" />
                  <div>No export jobs initiated for this crawl target.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Security sandbox policies disclaimers */}
      <div className="p-5 rounded-3xl bg-zinc-50/40 dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-800/85 space-y-4">
        <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-250 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2 border-zinc-200 dark:border-zinc-800/85">
          <Shield className="w-4 h-4 text-teal-605" />
          <span>Local Security Sandbox Controls</span>
        </h4>
        <p className="text-xs leading-relaxed text-zinc-550 dark:text-zinc-405">
          🔒 <strong>SSRF Prevention Shield:</strong> Requests pointing to local networks or cloud metadata directories (e.g. `localhost`, `127.0.0.1`, or `169.254.169.254`) are blocked before leaving the browser environment. No credentials or payload parameters are stored on third-party servers. All request history checkpoints reside locally inside your browser's private storage registry.
        </p>
      </div>

      {/* FAQs guide segment */}
      <div className="pt-6 border-t space-y-6">
        <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">Website Crawling Guide</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-zinc-550 dark:text-zinc-450 leading-relaxed font-medium">
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-zinc-805 dark:text-white mb-1">What is a Website Crawler?</h4>
              <p>A website crawler is an automated bot that discovers links across pages sequentially to parse metadata, index status parameters, broken resources, headings outlines, and construct a visual layout representation of a site's depth hierarchy.</p>
            </div>
            <div>
              <h4 className="font-bold text-zinc-805 dark:text-white mb-1">Why does CORS block browser-side crawling?</h4>
              <p>Modern browser sandboxes enforce Cross-Origin Resource Sharing (CORS) rules. If a destination website does not return wildcard headers (`Access-Control-Allow-Origin: *`), the browser blocks direct fetching requests for security reasons.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-zinc-805 dark:text-white mb-1">How does robots.txt respect disallow rules?</h4>
              <p>The robots.txt file defines crawl directives for different search engines. Directives like `Disallow: /admin/` inform the crawler which sections are private, preventing requests to restricted folders.</p>
            </div>
            <div>
              <h4 className="font-bold text-zinc-805 dark:text-white mb-1">Is my crawl session private?</h4>
              <p>Yes. All parsed details, links, images, and sitemaps are written to your local browser IndexedDB. No page data leaves your local device.</p>
            </div>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}

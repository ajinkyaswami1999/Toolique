import { useState, useMemo, useEffect } from 'react';
import { 
  Shield, Copy, Check, Download, Play, RefreshCw
} from 'lucide-react';
import { jsPDF } from 'jspdf';

// --- Interfaces & Types ---
interface AuditRuleResult {
  id: string;
  category: 'technical' | 'onpage' | 'performance' | 'security' | 'accessibility' | 'schema' | 'social' | 'images';
  severity: 'error' | 'warning' | 'info' | 'pass';
  status: 'Passed' | 'Warning' | 'Error' | 'Informational' | 'Not Available';
  title: string;
  description: string;
  detectedValue: string;
  expectedValue: string;
  recommendation: string;
  documentation: string;
  confidence: 'High' | 'Medium' | 'Low';
  impact: number; // 1-10
  difficulty: number; // 1-10 (1 = Easy, 10 = Hard)
  fixCode?: string;
}

interface SavedAudit {
  url: string;
  timestamp: string;
  score: number;
  errors: number;
  warnings: number;
  passed: number;
}

interface AuditState {
  status: 'idle' | 'scanning' | 'success' | 'failed' | 'unavailable';
  errorReason: 'CORS_BLOCKED' | 'ACCESS_DENIED' | 'NOT_FOUND' | 'RATE_LIMITED' | 'SERVER_ERROR' | 'INVALID_URL' | 'NON_HTML_RESPONSE' | 'GENERIC_FETCH_ERROR' | null;
  errorMessage: string | null;
  scanReport: {
    url: string;
    finalUrl: string;
    statusCode: number;
    contentType: string;
    htmlSize: number;
    responseTime: number;
    titleText: string;
    descText: string;
    h1Count: number;
    h2Count: number;
    imageCount: number;
    linkCount: number;
    canonical: string | null;
    robots: string | null;
    schemaCount: number;
    rules: AuditRuleResult[];
    score: number;
    subscores: Record<string, number>;
    headingsOutline: { tag: string; text: string }[];
    linksList: { text: string; href: string; isExternal: boolean }[];
    schemas: any[];
    robotsTxt: string | null;
    headers: Record<string, string>;
    html: string;
  } | null;
}

export default function WebsiteSeoAudit() {
  const [activeTab, setActiveTab] = useState<'url' | 'paste'>('url');
  const [scanUrl, setScanUrl] = useState<string>('https://toolique.in');
  
  // Advanced options
  const [deepAudit, setDeepAudit] = useState<boolean>(false);
  const [maxPages, setMaxPages] = useState<number>(25);
  const [requestTimeout, setRequestTimeout] = useState<number>(5000);
  
  // Custom inputs
  const [pasteHtml, setPasteHtml] = useState<string>('');
  const [pasteHeaders, setPasteHeaders] = useState<string>('');
  const [pasteRobots, setPasteRobots] = useState<string>('');

  // Audit state manager
  const [auditState, setAuditState] = useState<AuditState>({
    status: 'idle',
    errorReason: null,
    errorMessage: null,
    scanReport: null
  });
  
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<number>(0);

  // Robots Tester states
  const [testPath, setTestPath] = useState<string>('/admin/settings');
  const [testUserAgent, setTestUserAgent] = useState<string>('Googlebot');
  const [testPathResult, setTestPathResult] = useState<string>('');

  // Pre-audit validation details
  const [preAuditInfo, setPreAuditInfo] = useState<any | null>(null);

  // Layout parameters
  const [activeReportTab, setActiveReportTab] = useState<'overview' | 'issues' | 'headings' | 'performance' | 'robots' | 'schema' | 'actionplan' | 'compare'>('overview');
  const [issueFilter, setIssueFilter] = useState<'all' | 'error' | 'warning' | 'pass'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'technical' | 'onpage' | 'performance' | 'security' | 'accessibility' | 'schema' | 'social' | 'images'>('all');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [scoreDrawerOpen, setScoreDrawerOpen] = useState<boolean>(false);

  // History states
  const [checkpoints, setCheckpoints] = useState<SavedAudit[]>([]);
  const [comparisonResult, setComparisonResult] = useState<any | null>(null);

  // Copier state variables
  const [copiedFixId, setCopiedFixId] = useState<string | null>(null);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [testFixtureResult, setTestFixtureResult] = useState<string | null>(null);

  const scanStepsLabels = [
    'Validating URL hostnames and target protocol safety...',
    'Normalizing parameters and trailing slash formats...',
    'Performing browser-based fetch operation...',
    'Parsing target HTML document structure...',
    'Evaluating page titles and meta description characters...',
    'Building outline hierarchy heading maps...',
    'Auditing image tags and alternative text labels...',
    'Testing structured JSON-LD data configurations...',
    'Inspecting HSTS, CSP, and XFO headers if accessible...',
    'Compiling diagnostic audit scorecards...'
  ];

  // Load benchmarks
  useEffect(() => {
    try {
      const stored = localStorage.getItem('toolique_seo_checkpoints');
      if (stored) {
        setCheckpoints(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load local checkpoints:', e);
    }
  }, []);

  const saveAuditCheckpoint = (url: string, score: number, errors: number, warnings: number, passed: number) => {
    try {
      const currentList: SavedAudit[] = JSON.parse(localStorage.getItem('toolique_seo_checkpoints') || '[]');
      const newAudit: SavedAudit = {
        url,
        timestamp: new Date().toLocaleString('en-IN'),
        score,
        errors,
        warnings,
        passed
      };
      const updated = [newAudit, ...currentList].slice(0, 10);
      localStorage.setItem('toolique_seo_checkpoints', JSON.stringify(updated));
      setCheckpoints(updated);
    } catch (e) {
      console.error('Failed to save checkpoint:', e);
    }
  };

  const handleCopyFix = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedFixId(id);
    setTimeout(() => setCopiedFixId(null), 2000);
  };

  // URL normalization & SSRF validator
  const validateAndNormalizeURL = (rawUrl: string) => {
    let cleanUrl = rawUrl.trim();
    if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = 'https://' + cleanUrl;
    }

    try {
      const parsed = new URL(cleanUrl);
      const blockHostnames = ['localhost', '127.0.0.1', '169.254.169.254', '0.0.0.0'];
      const isBlocked = blockHostnames.includes(parsed.hostname.toLowerCase());

      return {
        isValid: !isBlocked,
        normalizedUrl: parsed.origin + parsed.pathname,
        hostname: parsed.hostname,
        protocol: parsed.protocol,
        isBlocked
      };
    } catch {
      return {
        isValid: false,
        normalizedUrl: '',
        hostname: '',
        protocol: '',
        isBlocked: false
      };
    }
  };

  // Automated test fixture (Section 16 requirement)
  const runAutomatedTests = () => {
    const docA = `<!DOCTYPE html>
    <html>
      <head>
        <title>Site A</title>
        <meta name="description" content="Description A">
      </head>
      <body>
        <h1>Heading A</h1>
      </body>
    </html>`;

    const docB = `<!DOCTYPE html>
    <html>
      <head>
        <title>Site B</title>
      </head>
      <body>
        <h1>Heading B1</h1>
        <h1>Heading B2</h1>
      </body>
    </html>`;

    const reportA = runSeoAudit(docA, 'https://site-a.local', {}, null, 200, 'https://site-a.local', 'text/html', 15);
    const reportB = runSeoAudit(docB, 'https://site-b.local', {}, null, 200, 'https://site-b.local', 'text/html', 15);

    const checkA = reportA.titleText === 'Site A' && reportA.descText === 'Description A' && reportA.h1Count === 1;
    const checkB = reportB.titleText === 'Site B' && reportB.descText === '' && reportB.h1Count === 2;

    if (checkA && checkB) {
      setTestFixtureResult('PASSED ✔: Document A (Title="Site A", Description="Description A", H1=1) and Document B (Title="Site B", Description=Missing, H1=2) parsed dynamically and verified successfully.');
    } else {
      setTestFixtureResult(`FAILED ✕: Doc A matches: ${checkA}. Doc B matches: ${checkB}`);
    }
  };

  // --- DYNAMIC AUDIT ENGINE ---
  const runSeoAudit = (
    html: string,
    url: string,
    headers: Record<string, string>,
    robotsTxt: string | null,
    statusCode: number,
    finalUrl: string,
    contentType: string,
    responseTime: number
  ) => {
    const rules: AuditRuleResult[] = [];
    const parser = new DOMParser();
    const targetDocument = parser.parseFromString(html, 'text/html');

    // 1. Title Checks
    const titleTag = targetDocument.querySelector('title');
    const titleVal = titleTag?.textContent?.trim() || '';
    if (!titleTag || !titleVal) {
      rules.push({
        id: 'title_missing',
        category: 'onpage',
        severity: 'error',
        status: 'Error',
        title: 'Missing Page Title Tag',
        description: 'No `<title>` element was detected in the target document.',
        detectedValue: 'No element found',
        expectedValue: 'A unique title tag between 30 and 65 characters.',
        recommendation: 'Add a descriptive page title inside the head section.',
        documentation: 'https://developers.google.com/search/docs/appearance/title-link',
        confidence: 'High',
        impact: 9,
        difficulty: 1,
        fixCode: '<title>Suggested Page Title | Toolique</title>'
      });
    } else {
      const len = titleVal.length;
      rules.push({
        id: 'title_length',
        category: 'onpage',
        severity: len < 30 || len > 65 ? 'warning' : 'pass',
        status: len < 30 || len > 65 ? 'Warning' : 'Passed',
        title: 'Page Title Length Evaluation',
        description: 'Checks if the page title meets standard length limits.',
        detectedValue: `${len} characters found ("${titleVal}")`,
        expectedValue: '30 to 65 characters',
        recommendation: len < 30 ? 'Title is too short. Expand the title to make it descriptive.' : len > 65 ? 'Title is too long. Truncate it to fit within 65 characters.' : 'Title length is optimal.',
        documentation: 'https://developers.google.com/search/docs/appearance/title-link',
        confidence: 'High',
        impact: 7,
        difficulty: 2
      });
    }

    // 2. Meta Description Checks
    const metaDesc = targetDocument.querySelector('meta[name="description"]');
    const descVal = metaDesc?.getAttribute('content')?.trim() || '';
    if (!metaDesc || !descVal) {
      rules.push({
        id: 'desc_missing',
        category: 'onpage',
        severity: 'error',
        status: 'Error',
        title: 'Missing Meta Description Tag',
        description: 'No meta[name="description"] element was detected on the page.',
        detectedValue: "No meta[name='description'] found",
        expectedValue: 'A descriptive summary between 110 and 165 characters.',
        recommendation: 'Add a meta description to explain the page topic in search snippets.',
        documentation: 'https://developers.google.com/search/docs/appearance/snippets',
        confidence: 'High',
        impact: 8,
        difficulty: 1,
        fixCode: '<meta name="description" content="Add a concise, unique summary of your page here." />'
      });
    } else {
      const len = descVal.length;
      rules.push({
        id: 'desc_length',
        category: 'onpage',
        severity: len < 110 || len > 165 ? 'warning' : 'pass',
        status: len < 110 || len > 165 ? 'Warning' : 'Passed',
        title: 'Meta Description Length',
        description: 'Evaluates if the description fits search result previews without truncation.',
        detectedValue: `${len} characters`,
        expectedValue: '110 to 165 characters',
        recommendation: len < 110 ? 'Description is too short. Expand it.' : len > 165 ? 'Description is too long. Truncate it.' : 'Meta description length is optimal.',
        documentation: 'https://developers.google.com/search/docs/appearance/snippets',
        confidence: 'High',
        impact: 6,
        difficulty: 2
      });
    }

    // 3. Viewport Mobile check
    const viewport = targetDocument.querySelector('meta[name="viewport"]');
    if (!viewport) {
      rules.push({
        id: 'viewport_missing',
        category: 'technical',
        severity: 'error',
        status: 'Error',
        title: 'Missing Viewport Configuration',
        description: 'No viewport meta tag was detected, critical for mobile usability scales.',
        detectedValue: 'Not Found',
        expectedValue: 'width=device-width, initial-scale=1.0',
        recommendation: 'Add the mobile viewport element to the page head.',
        documentation: 'https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-sites-baseline',
        confidence: 'High',
        impact: 9,
        difficulty: 1,
        fixCode: '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
      });
    } else {
      rules.push({
        id: 'viewport_present',
        category: 'technical',
        severity: 'pass',
        status: 'Passed',
        title: 'Mobile Viewport Configured',
        description: 'Verified presence of standard mobile viewport meta configuration.',
        detectedValue: viewport.getAttribute('content') || 'Found viewport tag',
        expectedValue: 'width=device-width, initial-scale=1.0',
        recommendation: '',
        documentation: '',
        confidence: 'High',
        impact: 9,
        difficulty: 1
      });
    }

    // 4. Canonical Checks
    const canonical = targetDocument.querySelector('link[rel="canonical"]');
    const canonicalHref = canonical?.getAttribute('href') || '';
    if (!canonical || !canonicalHref) {
      rules.push({
        id: 'canonical_missing',
        category: 'technical',
        severity: 'error',
        status: 'Error',
        title: 'Missing Canonical URL Tag',
        description: 'No canonical link relation was found on the page.',
        detectedValue: 'No element found',
        expectedValue: `A canonical href matching target origin`,
        recommendation: 'Insert a self-referencing canonical tag in the head.',
        documentation: 'https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls',
        confidence: 'High',
        impact: 9,
        difficulty: 1,
        fixCode: `<link rel="canonical" href="${url}" />`
      });
    } else {
      rules.push({
        id: 'canonical_present',
        category: 'technical',
        severity: 'pass',
        status: 'Passed',
        title: 'Canonical URL Configured',
        description: 'Verified presence of canonical link tags.',
        detectedValue: `Canonical href: "${canonicalHref}"`,
        expectedValue: 'A valid canonical url target',
        recommendation: '',
        documentation: '',
        confidence: 'High',
        impact: 8,
        difficulty: 1
      });
    }

    // 5. Headings Checks
    const h1s = targetDocument.querySelectorAll('h1');
    if (h1s.length === 0) {
      rules.push({
        id: 'h1_missing',
        category: 'onpage',
        severity: 'error',
        status: 'Error',
        title: 'Missing H1 Primary Heading',
        description: 'Every indexable page must contain a single main <h1> header tag.',
        detectedValue: '0 elements found',
        expectedValue: 'Exactly 1 H1 tag',
        recommendation: 'Add a H1 tag to represent the page main topic.',
        documentation: 'https://developers.google.com/search/docs/appearance/title-link',
        confidence: 'High',
        impact: 8,
        difficulty: 1,
        fixCode: '<h1>My Main Headline</h1>'
      });
    } else if (h1s.length > 1) {
      rules.push({
        id: 'h1_multiple',
        category: 'onpage',
        severity: 'warning',
        status: 'Warning',
        title: 'Multiple H1 Headings Detected',
        description: 'Found multiple H1 elements, which scatters semantic topic focus.',
        detectedValue: `${h1s.length} elements found`,
        expectedValue: 'Exactly 1 H1 tag',
        recommendation: 'Demote secondary H1 tags to H2 or H3 structures.',
        documentation: 'https://developers.google.com/search/docs/appearance/title-link',
        confidence: 'High',
        impact: 5,
        difficulty: 2
      });
    } else {
      rules.push({
        id: 'h1_passed',
        category: 'onpage',
        severity: 'pass',
        status: 'Passed',
        title: 'Primary Heading Configured',
        description: 'Verified presence of a single <h1> heading.',
        detectedValue: `H1: "${h1s[0].textContent?.trim()}"`,
        expectedValue: 'Exactly 1 H1 heading tag',
        recommendation: '',
        documentation: '',
        confidence: 'High',
        impact: 7,
        difficulty: 1
      });
    }

    // 6. Security Headers (No fabrication if headers are missing)
    const hasHeaders = Object.keys(headers).length > 0;
    
    // CSP check
    const csp = headers['Content-Security-Policy'] || headers['content-security-policy'];
    if (!hasHeaders) {
      rules.push({
        id: 'csp_unavailable',
        category: 'security',
        severity: 'info',
        status: 'Not Available',
        title: 'CSP Security Header Analysis Not Available',
        description: 'Response headers could not be retrieved due to CORS restrictions or local input settings.',
        detectedValue: 'Headers missing',
        expectedValue: 'HTTP Headers available',
        recommendation: 'Check headers via direct server log analysis or paste response headers.',
        documentation: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP',
        confidence: 'High',
        impact: 1,
        difficulty: 1
      });
    } else if (!csp) {
      rules.push({
        id: 'csp_missing',
        category: 'security',
        severity: 'warning',
        status: 'Warning',
        title: 'Content Security Policy (CSP) Missing',
        description: 'Missing CSP header, exposing users to CSS/JS injections.',
        detectedValue: 'Header not returned',
        expectedValue: "Content-Security-Policy: default-src 'self'",
        recommendation: 'Add CSP rules to control valid resource loading hosts.',
        documentation: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP',
        confidence: 'High',
        impact: 6,
        difficulty: 5,
        fixCode: "Content-Security-Policy: default-src 'self';"
      });
    } else {
      rules.push({
        id: 'csp_passed',
        category: 'security',
        severity: 'pass',
        status: 'Passed',
        title: 'CSP Security Active',
        description: 'Verified content security policy configurations.',
        detectedValue: `CSP rule: "${csp.slice(0, 30)}..."`,
        expectedValue: 'A valid CSP header string',
        recommendation: '',
        documentation: '',
        confidence: 'High',
        impact: 6,
        difficulty: 4
      });
    }

    // HSTS check
    const hsts = headers['Strict-Transport-Security'] || headers['strict-transport-security'];
    if (!hasHeaders) {
      rules.push({
        id: 'hsts_unavailable',
        category: 'security',
        severity: 'info',
        status: 'Not Available',
        title: 'HSTS Analysis Not Available',
        description: 'Response headers could not be retrieved.',
        detectedValue: 'Headers missing',
        expectedValue: 'HTTP Headers available',
        recommendation: '',
        documentation: '',
        confidence: 'High',
        impact: 1,
        difficulty: 1
      });
    } else if (!hsts) {
      rules.push({
        id: 'hsts_missing',
        category: 'security',
        severity: 'error',
        status: 'Error',
        title: 'HSTS Protocol Encryption Missing',
        description: 'Strict-Transport-Security is not configured, leaving connections vulnerable.',
        detectedValue: 'Header not returned',
        expectedValue: 'Strict-Transport-Security: max-age=63072000; includeSubDomains; preload',
        recommendation: 'Enable HSTS rules inside your server redirects.',
        documentation: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security',
        confidence: 'High',
        impact: 8,
        difficulty: 2,
        fixCode: 'Strict-Transport-Security: max-age=63072000; includeSubDomains; preload'
      });
    } else {
      rules.push({
        id: 'hsts_passed',
        category: 'security',
        severity: 'pass',
        status: 'Passed',
        title: 'HSTS Enforced Securely',
        description: 'Verified transport layer encryption configurations.',
        detectedValue: hsts,
        expectedValue: 'HSTS header configured',
        recommendation: '',
        documentation: '',
        confidence: 'High',
        impact: 8,
        difficulty: 1
      });
    }

    // 7. Image Alts checks
    const imgs = targetDocument.querySelectorAll('img');
    let missingAltCount = 0;
    imgs.forEach((img) => {
      const alt = img.getAttribute('alt');
      if (alt === null || alt === undefined) missingAltCount++;
    });

    if (imgs.length === 0) {
      rules.push({
        id: 'images_not_found',
        category: 'images',
        severity: 'info',
        status: 'Not Available',
        title: 'No Image Elements Discovered',
        description: 'No `<img>` elements were found in the parsed HTML document.',
        detectedValue: '0 images',
        expectedValue: 'At least 1 image to check',
        recommendation: '',
        documentation: '',
        confidence: 'High',
        impact: 1,
        difficulty: 1
      });
    } else if (missingAltCount > 0) {
      rules.push({
        id: 'images_alt_missing',
        category: 'images',
        severity: 'warning',
        status: 'Warning',
        title: 'Images Missing Alt Descriptions',
        description: 'Renders image elements that do not contain an alternate text description.',
        detectedValue: `${missingAltCount} out of ${imgs.length} images are missing alt tags`,
        expectedValue: '100% of images contain alt descriptions',
        recommendation: 'Add alt attributes to all image elements for accessibility and indexing.',
        documentation: 'https://developers.google.com/search/docs/appearance/google-images',
        confidence: 'High',
        impact: 7,
        difficulty: 1,
        fixCode: '<img src="hero.jpg" alt="Descriptive brand logo banner">'
      });
    } else {
      rules.push({
        id: 'images_alt_passed',
        category: 'images',
        severity: 'pass',
        status: 'Passed',
        title: 'Alt Alt Tags Verified',
        description: 'Verified alt attributes on all images.',
        detectedValue: `All ${imgs.length} images contain alternative text tags.`,
        expectedValue: 'All images contain alt text',
        recommendation: '',
        documentation: '',
        confidence: 'High',
        impact: 7,
        difficulty: 1
      });
    }

    // 8. JSON-LD Schemas validation
    const schemasTags = targetDocument.querySelectorAll('script[type="application/ld+json"]');
    const parsedSchemas: any[] = [];
    let isSyntaxValid = true;

    schemasTags.forEach((sc) => {
      try {
        parsedSchemas.push(JSON.parse(sc.textContent || ''));
      } catch {
        isSyntaxValid = false;
      }
    });

    if (schemasTags.length === 0) {
      rules.push({
        id: 'schema_missing',
        category: 'schema',
        severity: 'warning',
        status: 'Warning',
        title: 'No JSON-LD Schema Found',
        description: 'Structured data provides explicit contextual hints to search engine algorithms.',
        detectedValue: '0 JSON-LD schema blocks',
        expectedValue: 'At least 1 structured JSON-LD block',
        recommendation: 'Integrate WebPage or Article schema markups.',
        documentation: 'https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data',
        confidence: 'High',
        impact: 6,
        difficulty: 3,
        fixCode: `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "WebPage",\n  "name": "Toolique"\n}\n</script>`
      });
    } else if (!isSyntaxValid) {
      rules.push({
        id: 'schema_invalid',
        category: 'schema',
        severity: 'error',
        status: 'Error',
        title: 'Malformed JSON-LD Schema syntax',
        description: 'Failed to parse JSON-LD structured data blocks due to json syntax problems.',
        detectedValue: 'Syntax Errors present',
        expectedValue: 'Clean, parseable JSON structures',
        recommendation: 'Ensure quotes, braces, and commas comply with strict JSON rules.',
        documentation: 'https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data',
        confidence: 'High',
        impact: 8,
        difficulty: 2
      });
    } else {
      rules.push({
        id: 'schema_passed',
        category: 'schema',
        severity: 'pass',
        status: 'Passed',
        title: 'JSON-LD Schema Markup Configured',
        description: 'Verified structured schema content.',
        detectedValue: `Discovered ${schemasTags.length} valid structured data blocks.`,
        expectedValue: 'Valid JSON-LD markup',
        recommendation: '',
        documentation: '',
        confidence: 'High',
        impact: 6,
        difficulty: 2
      });
    }

    // 9. Page HTML payload Size Check
    const docSize = (html.length / 1024).toFixed(1);
    const sizeVal = parseFloat(docSize);
    if (sizeVal > 100) {
      rules.push({
        id: 'size_large',
        category: 'performance',
        severity: 'warning',
        status: 'Warning',
        title: 'HTML Page Size is Excessive',
        description: 'The raw HTML file exceeds 100 KB, which can slow down download speeds.',
        detectedValue: `${docSize} KB`,
        expectedValue: 'Under 100 KB',
        recommendation: 'Optimize code by minifying scripts, compressing assets, and strip duplicate comments.',
        documentation: 'https://web.dev/articles/optimizing-content-efficiency-compress-assets-and-images',
        confidence: 'High',
        impact: 5,
        difficulty: 3
      });
    } else {
      rules.push({
        id: 'size_passed',
        category: 'performance',
        severity: 'pass',
        status: 'Passed',
        title: 'HTML Document Size Optimal',
        description: 'Verified optimal HTML transfer payload size.',
        detectedValue: `${docSize} KB`,
        expectedValue: 'Under 100 KB',
        recommendation: '',
        documentation: '',
        confidence: 'High',
        impact: 5,
        difficulty: 1
      });
    }

    // 10. Core Web Vitals lab metrics are marked strictly as Not Available (No Fabrication)
    rules.push({
      id: 'performance_lab_vitals',
      category: 'performance',
      severity: 'info',
      status: 'Not Available',
      title: 'Lab Core Web Vitals Metrics (LCP/CLS) Not Available',
      description: 'LCP, CLS, and FID metrics cannot be accurately measured from static client-side parsing alone.',
      detectedValue: 'Browser metrics unavailable',
      expectedValue: 'Lab measurements active',
      recommendation: 'Analyze performance using Google PageSpeed Insights.',
      documentation: 'https://web.dev/articles/vitals',
      confidence: 'High',
      impact: 1,
      difficulty: 1
    });

    // --- WEIGHTED SCORE CALCULATION (Section 11 requirement) ---
    const categories: Record<string, { weight: number; rules: AuditRuleResult[] }> = {
      technical: { weight: 20, rules: [] },
      onpage: { weight: 20, rules: [] },
      performance: { weight: 15, rules: [] },
      security: { weight: 5, rules: [] },
      accessibility: { weight: 10, rules: [] },
      schema: { weight: 5, rules: [] },
      social: { weight: 5, rules: [] },
      images: { weight: 5, rules: [] }
    };

    rules.forEach((r) => {
      if (categories[r.category]) {
        categories[r.category].rules.push(r);
      }
    });

    let totalWeight = 0;
    let totalScore = 0;
    const subscores: Record<string, number> = {};

    Object.keys(categories).forEach((cat) => {
      const group = categories[cat];
      const rulesInGroup = group.rules.filter(r => r.severity !== 'info' && r.status !== 'Not Available');
      if (rulesInGroup.length === 0) {
        subscores[cat] = 100;
        return;
      }

      let passedPoints = 0;
      rulesInGroup.forEach((r) => {
        if (r.severity === 'pass') passedPoints += 10;
        else if (r.severity === 'warning') passedPoints += 5;
      });

      const catScore = Math.round((passedPoints / (rulesInGroup.length * 10)) * 100);
      subscores[cat] = catScore;

      totalScore += catScore * group.weight;
      totalWeight += group.weight;
    });

    const score = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 100;

    // Heading hierarchy lists
    const headingsOutline = Array.from(targetDocument.querySelectorAll('h1, h2, h3, h4')).map(h => ({
      tag: h.tagName.toLowerCase(),
      text: h.textContent?.trim() || ''
    }));

    // Links map list
    const linksList = Array.from(targetDocument.querySelectorAll('a[href]')).map(a => ({
      text: a.textContent?.trim() || '(Empty Anchor Text)',
      href: a.getAttribute('href') || '#',
      isExternal: (a.getAttribute('href') || '').startsWith('http')
    }));

    return {
      url,
      finalUrl,
      statusCode,
      contentType,
      htmlSize: html.length,
      responseTime,
      titleText: titleVal,
      descText: descVal,
      h1Count: h1s.length,
      h2Count: targetDocument.querySelectorAll('h2').length,
      imageCount: imgs.length,
      linkCount: linksList.length,
      canonical: canonicalHref || null,
      robots: targetDocument.querySelector('meta[name="robots"]')?.getAttribute('content') || null,
      schemaCount: schemasTags.length,
      rules,
      score,
      subscores,
      headingsOutline,
      linksList,
      schemas: parsedSchemas,
      robotsTxt,
      headers,
      html
    };
  };

  // --- TRIGGER SCAN FLOWS (No Caching, Always Clears Previous) ---
  const triggerScan = async () => {
    // 14. State Management (Reset previous states completely)
    setAuditState({
      status: 'idle',
      errorReason: null,
      errorMessage: null,
      scanReport: null
    });
    setPreAuditInfo(null);
    setComparisonResult(null);

    const val = validateAndNormalizeURL(scanUrl);
    setPreAuditInfo(val);

    if (!val.isValid) {
      setAuditState({
        status: 'failed',
        errorReason: 'INVALID_URL',
        errorMessage: 'The entered URL is invalid or points to an insecure loopback host address (SSRF Protection block).',
        scanReport: null
      });
      return;
    }

    setIsScanning(true);
    setScanStep(0);

    // Timeline steps simulator
    const stepInterval = setInterval(() => {
      setScanStep((prev) => (prev < scanStepsLabels.length - 1 ? prev + 1 : prev));
    }, 200);

    const startTime = performance.now();
    try {
      // Direct browser-based fetch to verify actual CORS constraints (Section 5 requirement)
      const response = await fetch(val.normalizedUrl, {
        method: 'GET',
        headers: { 'Accept': 'text/html' }
      });
      
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      clearInterval(stepInterval);

      // Verify HTTP Response code (Section 7 requirement)
      if (!response.ok) {
        let reason: any = 'GENERIC_FETCH_ERROR';
        let msg = `HTTP response returned status code ${response.status}.`;
        if (response.status === 403) {
          reason = 'ACCESS_DENIED';
          msg = 'Access Denied (HTTP 403). The website is blocking client crawler requests.';
        } else if (response.status === 404) {
          reason = 'NOT_FOUND';
          msg = 'Page Not Found (HTTP 404). Verify the URL structure.';
        } else if (response.status === 429) {
          reason = 'RATE_LIMITED';
          msg = 'Too Many Requests (HTTP 429). Rate-limiting active on target site.';
        } else if (response.status >= 500) {
          reason = 'SERVER_ERROR';
          msg = `Internal Server Error (HTTP ${response.status}).`;
        }

        setAuditState({
          status: 'failed',
          errorReason: reason,
          errorMessage: msg,
          scanReport: null
        });
        setIsScanning(false);
        return;
      }

      // Verify Content Type compatibility (Section 8 requirement)
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
        setAuditState({
          status: 'failed',
          errorReason: 'NON_HTML_RESPONSE',
          errorMessage: `Invalid Content-Type "${contentType}". This tool only audits HTML documents.`,
          scanReport: null
        });
        setIsScanning(false);
        return;
      }

      const htmlText = await response.text();
      
      const headerMap: Record<string, string> = {};
      response.headers.forEach((val, key) => {
        headerMap[key] = val;
      });

      // Fetch RobotsTxt
      let robotsTxtContent: string | null = null;
      try {
        const originUrl = new URL(val.normalizedUrl).origin + '/robots.txt';
        const robotsRes = await fetch(originUrl);
        if (robotsRes.ok) {
          robotsTxtContent = await robotsRes.text();
        }
      } catch {
        // Silently mark as null
      }

      const report = runSeoAudit(htmlText, val.normalizedUrl, headerMap, robotsTxtContent, response.status, response.url, contentType, responseTime);

      setAuditState({
        status: 'success',
        errorReason: null,
        errorMessage: null,
        scanReport: report
      });
      setIsScanning(false);
      saveAuditCheckpoint(val.normalizedUrl, report.score, report.rules.filter(r => r.severity === 'error').length, report.rules.filter(r => r.severity === 'warning').length, report.rules.filter(r => r.severity === 'pass').length);

    } catch (err) {
      clearInterval(stepInterval);
      // Browser blocked by CORS - Never Silently Fall Back to mock data (Section 5 requirement)
      setAuditState({
        status: 'unavailable',
        errorReason: 'CORS_BLOCKED',
        errorMessage: 'This website does not allow browser-based analysis from Toolique due to browser security policy (CORS).',
        scanReport: null
      });
      setIsScanning(false);
    }
  };

  // Paste HTML input scanner trigger
  const triggerPasteScan = () => {
    setAuditState({
      status: 'idle',
      errorReason: null,
      errorMessage: null,
      scanReport: null
    });
    setComparisonResult(null);

    setIsScanning(true);
    setScanStep(0);

    const stepInterval = setInterval(() => {
      setScanStep((prev) => (prev < scanStepsLabels.length - 1 ? prev + 1 : prev));
    }, 200);

    setTimeout(() => {
      clearInterval(stepInterval);
      const headerMap: Record<string, string> = {};
      pasteHeaders.split('\n').forEach((line) => {
        const idx = line.indexOf(':');
        if (idx !== -1) {
          headerMap[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
        }
      });

      const report = runSeoAudit(pasteHtml || '<html></html>', 'https://pasted-content.local', headerMap, pasteRobots || null, 200, 'https://pasted-content.local', 'text/html', 10);

      setAuditState({
        status: 'success',
        errorReason: null,
        errorMessage: null,
        scanReport: report
      });
      setIsScanning(false);
      saveAuditCheckpoint('Pasted Content', report.score, report.rules.filter(r => r.severity === 'error').length, report.rules.filter(r => r.severity === 'warning').length, report.rules.filter(r => r.severity === 'pass').length);
    }, 1200);
  };

  // Robots block tester logic
  useEffect(() => {
    if (!auditState.scanReport) return;
    const rules = auditState.scanReport.robotsTxt;
    if (!rules) {
      setTestPathResult('Allowed ✔ (No robots.txt file exists)');
      return;
    }

    const lines = rules.split('\n');
    let isBlocked = false;

    for (let line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('Disallow:')) {
        const pathBlock = trimmed.replace('Disallow:', '').trim();
        if (pathBlock && testPath.startsWith(pathBlock)) {
          isBlocked = true;
          break;
        }
      }
    }

    setTestPathResult(isBlocked ? `Blocked ❌ (Crawlers matching ${testUserAgent} will ignore this path)` : 'Allowed ✔ (Crawlers can index this path)');
  }, [testPath, testUserAgent, auditState.scanReport]);

  const prioritizedFixes = useMemo(() => {
    if (!auditState.scanReport) return [];
    return auditState.scanReport.rules
      .filter((r: AuditRuleResult) => r.severity === 'error' || r.severity === 'warning')
      .map((r: AuditRuleResult) => {
        const priorityScore = (r.impact * (11 - r.difficulty)).toFixed(1);
        return {
          ...r,
          priorityScore
        };
      })
      .sort((a: any, b: any) => parseFloat(b.priorityScore) - parseFloat(a.priorityScore))
      .slice(0, 5);
  }, [auditState.scanReport]);

  const aiGeneratedTitle = useMemo(() => {
    if (!auditState.scanReport || !auditState.scanReport.headingsOutline.length) return 'SEO Optimized Page Title | Toolique';
    return `${auditState.scanReport.headingsOutline[0].text} | Developer Diagnostic Tool`;
  }, [auditState.scanReport]);

  const customSevenDayPlan = useMemo(() => {
    if (!auditState.scanReport) return [];
    const fixes = auditState.scanReport.rules.filter((r: any) => r.severity === 'error' || r.severity === 'warning');
    
    return [
      { day: 1, title: 'Fix Core Technical Setup', description: 'Address critical canonical or mobile viewport issues.', items: fixes.filter((f: any) => f.category === 'technical') },
      { day: 2, title: 'Optimize Heading Hierarchy', description: 'Resolve skipped H1-H3 structures or double headers.', items: fixes.filter((f: any) => f.category === 'onpage' && f.id.includes('h1')) },
      { day: 3, title: 'Improve Meta Content Tags', description: 'Add missing title tags or descriptions.', items: fixes.filter((f: any) => f.id.includes('title') || f.id.includes('desc')) },
      { day: 4, title: 'Optimise Images & Visual layout', description: 'Address missing alternative alt labels.', items: fixes.filter((f: any) => f.category === 'images') },
      { day: 5, title: 'Structured data audits', description: 'Correct validation syntax errors in JSON-LD schema blocks.', items: fixes.filter((f: any) => f.category === 'schema') },
      { day: 6, title: 'HTTP Headers & Security updates', description: 'Configure secure HSTS or CSP flags.', items: fixes.filter((f: any) => f.category === 'security') },
      { day: 7, title: 'Page weights & performance audit', description: 'Minimize HTML file payloads or scripts loading.', items: fixes.filter((f: any) => f.category === 'performance') }
    ];
  }, [auditState.scanReport]);

  const runCheckpointComparison = (item: SavedAudit) => {
    if (!auditState.scanReport) return;
    const scoreDiff = auditState.scanReport.score - item.score;
    setComparisonResult({
      prevUrl: item.url,
      prevTimestamp: item.timestamp,
      prevScore: item.score,
      currScore: auditState.scanReport.score,
      delta: scoreDiff,
      passedDiff: auditState.scanReport.rules.filter(r => r.severity === 'pass').length - item.passed,
      errorsDiff: auditState.scanReport.rules.filter(r => r.severity === 'error').length - item.errors
    });
  };

  const handleDownloadPDF = () => {
    if (!auditState.scanReport) return;
    const doc = new jsPDF();
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 42, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('SEO INTELLIGENCE AUDIT SHEET', 15, 25);
    doc.setFontSize(10);
    doc.text(`Audited URL: ${auditState.scanReport.url} — Generated locally via Toolique.in`, 15, 34);

    doc.setTextColor(60, 60, 60);
    doc.setFontSize(14);
    doc.text(`Overall SEO Health Rating: ${auditState.scanReport.score} / 100`, 15, 60);

    doc.text('Category Performance Index:', 15, 85);
    doc.text(`- Technical SEO : ${auditState.scanReport.subscores.technical}%`, 15, 93);
    doc.text(`- On-Page SEO   : ${auditState.scanReport.subscores.onpage}%`, 15, 101);
    doc.text(`- Performance   : ${auditState.scanReport.subscores.performance}%`, 15, 109);
    doc.text(`- Security      : ${auditState.scanReport.subscores.security}%`, 15, 117);

    doc.text('Top Prioritized Fix Actions:', 15, 135);
    let y = 143;
    prioritizedFixes.forEach((fix: any) => {
      doc.text(`- [Priority ${fix.priorityScore}] ${fix.title}`, 15, y);
      y += 8;
    });

    doc.save(`SEO_Intelligence_Sheet_${Date.now()}.pdf`);
  };

  const copySummaryReport = () => {
    if (!auditState.scanReport) return;
    const text = `SEO Intelligence Audit Summary
----------------------------------------------
Overall Score   : ${auditState.scanReport.score}/100
Scan Target     : ${auditState.scanReport.url}
----------------------------------------------
Top Priority Fixes:
${prioritizedFixes.map((f: any) => `- [Priority ${f.priorityScore}] ${f.title}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const filteredRules = useMemo(() => {
    if (!auditState.scanReport) return [];
    return auditState.scanReport.rules.filter((r: AuditRuleResult) => {
      const matchSeverity = issueFilter === 'all' ? true : r.severity === issueFilter;
      const matchCategory = categoryFilter === 'all' ? true : r.category === categoryFilter;
      return matchSeverity && matchCategory;
    });
  }, [auditState.scanReport, issueFilter, categoryFilter]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto text-left animate-fadeIn">
      
      {/* Tab select mode */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => { setActiveTab('url'); }}
          className={`px-6 py-3 text-xs font-bold border-b-2 transition ${
            activeTab === 'url' ? 'border-teal-650 text-teal-650 dark:text-teal-400' : 'border-transparent text-zinc-450 hover:text-zinc-750'
          }`}
        >
          Crawling Domain Scan
        </button>
        <button
          onClick={() => { setActiveTab('paste'); }}
          className={`px-6 py-3 text-xs font-bold border-b-2 transition ${
            activeTab === 'paste' ? 'border-teal-650 text-teal-650 dark:text-teal-400' : 'border-transparent text-zinc-450 hover:text-zinc-750'
          }`}
        >
          Pasted HTML Source Analyzer
        </button>
      </div>

      {/* Hero input forms */}
      {activeTab === 'url' ? (
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <label className="text-xs font-black text-zinc-850 dark:text-zinc-200 uppercase tracking-wider block">Website URL Audit Target</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={scanUrl}
              onChange={(e) => setScanUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-grow p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-xs font-semibold focus:outline-none focus:border-teal-500"
            />
            <button
              onClick={triggerScan}
              disabled={isScanning}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition"
            >
              {isScanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              <span>{isScanning ? 'Auditing Page...' : 'Analyze Website'}</span>
            </button>
          </div>

          {/* Crawler options config */}
          <div className="pt-4 border-t flex flex-wrap gap-6 items-center text-xs">
            <label className="flex items-center gap-2 font-semibold">
              <input type="checkbox" checked={deepAudit} onChange={(e) => setDeepAudit(e.target.checked)} className="rounded text-teal-605" />
              <span>Deep Crawler Audit</span>
            </label>

            {deepAudit && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase">Max Pages:</span>
                <select
                  value={maxPages}
                  onChange={(e) => setMaxPages(parseInt(e.target.value))}
                  className="p-1 border rounded bg-transparent text-[11px]"
                >
                  <option value={10}>10 pages</option>
                  <option value={25}>25 pages</option>
                  <option value={50}>50 pages</option>
                  <option value={100}>100 pages</option>
                </select>
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Request Timeout:</span>
              <select
                value={requestTimeout}
                onChange={(e) => setRequestTimeout(parseInt(e.target.value))}
                className="p-1 border rounded bg-transparent text-[11px]"
              >
                <option value={3000}>3 seconds</option>
                <option value={5000}>5 seconds</option>
                <option value={10000}>10 seconds</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 text-[10px] font-bold text-zinc-400">
            <span>Client-side analysis • No account required • Try preset targets:</span>
            <button onClick={() => setScanUrl('https://toolique.in')} className="text-teal-650 hover:underline">https://toolique.in</button>
            <span className="text-zinc-300">|</span>
            <button onClick={() => setScanUrl('https://example.com')} className="text-teal-650 hover:underline">https://example.com</button>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4 animate-fadeIn">
          <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block">HTML Source & Headers Code Audit</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 block uppercase">Pasted HTML Source code</label>
              <textarea
                value={pasteHtml}
                onChange={(e) => setPasteHtml(e.target.value)}
                placeholder="<html>..."
                className="w-full h-44 p-3 border rounded text-xs font-mono focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 block uppercase">Pasted Response Headers (Optional)</label>
              <textarea
                value={pasteHeaders}
                onChange={(e) => setPasteHeaders(e.target.value)}
                placeholder="Strict-Transport-Security: max-age=63072000"
                className="w-full h-44 p-3 border rounded text-xs font-mono focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 block uppercase">Pasted Robots.txt (Optional)</label>
              <textarea
                value={pasteRobots}
                onChange={(e) => setPasteRobots(e.target.value)}
                placeholder="User-agent: *\nDisallow: /admin/"
                className="w-full h-44 p-3 border rounded text-xs font-mono focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={triggerPasteScan}
            disabled={isScanning || !pasteHtml}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition shadow"
          >
            Audit Custom HTML
          </button>
        </div>
      )}

      {/* SCANNING TIMELINE PROGRESS */}
      {isScanning && (
        <div className="p-6 rounded-3xl bg-zinc-950 text-white shadow-xl space-y-4 animate-pulse font-mono">
          <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
            <span className="text-[10px] font-bold text-teal-300 uppercase block">Auditing Engine Scan Milestones</span>
            <span className="text-[10px] font-bold text-zinc-400">Step {scanStep + 1} of {scanStepsLabels.length}</span>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-zinc-200">{scanStepsLabels[scanStep]}</p>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-500 transition-all duration-300"
                style={{ width: `${((scanStep + 1) / scanStepsLabels.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* PRE-AUDIT INFO SUMMARY BAR */}
      {preAuditInfo && (
        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border text-xs flex flex-wrap gap-6 font-semibold">
          <span>Target URL: <strong className="text-teal-600">{preAuditInfo.normalizedUrl}</strong></span>
          <span>Hostname: <strong className="text-zinc-750 dark:text-zinc-350">{preAuditInfo.hostname}</strong></span>
          <span>Protocol: <strong className="text-zinc-750 dark:text-zinc-350">{preAuditInfo.protocol.toUpperCase()}</strong></span>
        </div>
      )}

      {/* CORS / FAILURE WARNING INTERFACES (Section 5 requirement) */}
      {(auditState.status === 'failed' || auditState.status === 'unavailable') && (
        <div className="p-6 rounded-3xl border border-rose-500/20 bg-rose-500/[0.02] space-y-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[9px] font-black bg-rose-500/10 text-rose-600 uppercase font-mono">⚠ Website could not be analyzed</span>
            <span className="text-zinc-400 font-bold">Reason: {auditState.errorReason === 'CORS_BLOCKED' ? 'Browser security policy (CORS)' : 'Fetch failure code'}</span>
          </div>
          <p className="text-zinc-650 leading-relaxed font-semibold">
            {auditState.errorMessage}
          </p>
          {auditState.errorReason === 'CORS_BLOCKED' && (
            <div className="pt-2 flex flex-col gap-2">
              <span className="font-black text-[10px] text-zinc-400 uppercase">Alternative audit methods:</span>
              <div className="flex gap-2">
                <button onClick={() => { setActiveTab('paste'); }} className="px-3 py-1.5 bg-zinc-900 text-white rounded-lg font-bold">
                  [ Paste HTML ]
                </button>
                <button onClick={() => { setActiveTab('paste'); }} className="px-3 py-1.5 bg-zinc-100 border text-zinc-700 rounded-lg font-bold">
                  [ Upload HTML ]
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* COMPREHENSIVE SEO AUDIT REPORT PANEL */}
      {auditState.status === 'success' && auditState.scanReport && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Sub Tab Selection bar */}
          <div className="flex flex-wrap gap-2 border-b pb-3 text-xs">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'issues', name: 'Issues List' },
              { id: 'headings', name: 'Headings Tree' },
              { id: 'performance', name: 'Performance Timings' },
              { id: 'robots', name: 'Robots.txt Simulator' },
              { id: 'schema', name: 'Structured Schema' },
              { id: 'actionplan', name: '7-Day Action Plan' },
              { id: 'compare', name: 'Compare & History' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveReportTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  activeReportTab === tab.id ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900' : 'bg-zinc-50 dark:bg-zinc-900 border text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* REPORT SUB-TAB: OVERVIEW */}
          {activeReportTab === 'overview' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Score breakdown metrics dashboard */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* Dial score card */}
                <div className="lg:col-span-4 p-6 rounded-3xl bg-zinc-950 text-white shadow-xl flex flex-col justify-between items-center text-center">
                  <span className="text-[10px] font-bold text-zinc-450 uppercase block">SEO Health Score</span>
                  <div className="my-6">
                    <span className="text-7xl font-black text-teal-405 font-mono">{auditState.scanReport.score}</span>
                    <span className="text-2xl text-zinc-550 font-bold">/100</span>
                  </div>
                  <button
                    onClick={() => setScoreDrawerOpen(!scoreDrawerOpen)}
                    className="text-[10px] text-teal-300 hover:underline font-bold font-sans"
                  >
                    Why did I get this score?
                  </button>
                </div>

                {/* Weighted Category breakdowns */}
                <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block border-b pb-2">Diagnostic Categories Breakdowns</span>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 my-4 font-mono font-bold text-zinc-805 dark:text-zinc-300">
                    <div>
                      <span className="text-[10px] text-zinc-400 block font-sans font-bold">Technical SEO (20%)</span>
                      <span className="text-lg text-teal-600">{auditState.scanReport.subscores.technical}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 block font-sans font-bold">On-Page Content (20%)</span>
                      <span className="text-lg text-teal-600">{auditState.scanReport.subscores.onpage}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 block font-sans font-bold">Performance (15%)</span>
                      <span className="text-lg text-teal-600">{auditState.scanReport.subscores.performance}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 block font-sans font-bold">Security (5%)</span>
                      <span className="text-lg text-teal-600">{auditState.scanReport.subscores.security}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 block font-sans font-bold">Accessibility (10%)</span>
                      <span className="text-lg text-teal-600">{auditState.scanReport.subscores.accessibility}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 block font-sans font-bold">Schemas Markup (5%)</span>
                      <span className="text-lg text-teal-600">{auditState.scanReport.subscores.schema}%</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-zinc-405 italic">Scores are weighted according to actual parsed rules and exclude unavailable checks.</div>
                </div>
              </div>

              {/* Explanatory Overlay drawer (Why did I get this score?) */}
              {scoreDrawerOpen && (
                <div className="p-6 rounded-3xl bg-zinc-50 border space-y-3 text-xs leading-relaxed animate-fadeIn">
                  <h4 className="font-extrabold text-zinc-850">Category Weights & Points System</h4>
                  <p>Our audit score uses weighted points calculated directly from dynamic test results. Checks evaluated as <strong>Not Available</strong> (e.g. response security headers when CORS blocks raw access, or lab Web Vitals) are excluded from the points denominator so that target domains are not penalized for browser sandbox limits.</p>
                  <table className="w-full text-left font-mono">
                    <thead>
                      <tr className="text-zinc-400">
                        <th>Category</th>
                        <th>Weighting</th>
                        <th>Points Ratio</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td>Technical SEO</td><td>20%</td><td>{auditState.scanReport.subscores.technical}/100</td></tr>
                      <tr><td>On-Page Content</td><td>20%</td><td>{auditState.scanReport.subscores.onpage}/100</td></tr>
                      <tr><td>Performance</td><td>15%</td><td>{auditState.scanReport.subscores.performance}/100</td></tr>
                      <tr><td>Security Headers</td><td>5%</td><td>{auditState.scanReport.subscores.security}/100</td></tr>
                      <tr><td>Accessibility</td><td>10%</td><td>{auditState.scanReport.subscores.accessibility}/100</td></tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* FIX FIRST (Top 5 Priority Issues) */}
              <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-4">
                <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block border-b pb-2">Fix First – Top 5 Prioritized Actions</h3>
                
                <div className="space-y-3">
                  {prioritizedFixes.map((fix: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded text-[8px] font-black bg-rose-500/10 text-rose-600 uppercase font-mono">Priority {fix.priorityScore}</span>
                          <span className="text-[10px] text-zinc-400 uppercase font-bold">{fix.category}</span>
                        </div>
                        <h4 className="text-xs font-bold text-zinc-850 dark:text-zinc-200">{fix.title}</h4>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">{fix.recommendation}</p>
                      </div>

                      {fix.fixCode && (
                        <button
                          onClick={() => handleCopyFix(fix.fixCode!, `priority-${idx}`)}
                          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-[10px] font-bold transition shrink-0"
                        >
                          {copiedFixId === `priority-${idx}` ? 'Copied' : 'Copy Fix'}
                        </button>
                      )}
                    </div>
                  ))}

                  {prioritizedFixes.length === 0 && (
                    <div className="text-center py-6 text-xs text-zinc-400 font-semibold">
                      ✔ Great job! Zero errors or warnings detected.
                    </div>
                  )}
                </div>
              </div>

              {/* GOOGLE PREVIEWS & SUGGESTIONS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Search Result preview mockup */}
                <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">Search Snippet Preview</h3>
                    <div className="flex bg-zinc-50 rounded-lg p-0.5 text-[10px] font-bold">
                      <button onClick={() => setPreviewDevice('desktop')} className={`px-2.5 py-1 rounded ${previewDevice === 'desktop' ? 'bg-white shadow' : 'text-zinc-400'}`}>Desktop</button>
                      <button onClick={() => setPreviewDevice('mobile')} className={`px-2.5 py-1 rounded ${previewDevice === 'mobile' ? 'bg-white shadow' : 'text-zinc-400'}`}>Mobile</button>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border ${previewDevice === 'mobile' ? 'max-w-xs mx-auto' : ''} bg-white space-y-1.5`}>
                    <span className="text-[11px] text-zinc-500 block truncate">{auditState.scanReport.url}</span>
                    <h4 className="text-lg text-blue-805 hover:underline font-medium block truncate leading-tight">{auditState.scanReport.titleText || 'Untitled Page'}</h4>
                    <p className="text-xs text-zinc-650 leading-relaxed break-words">{auditState.scanReport.descText || 'No meta description configured for this page.'}</p>
                  </div>
                </div>

                {/* AI suggestion panel */}
                <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-4">
                  <h3 className="text-xs font-black text-teal-605 uppercase tracking-wider block border-b pb-2">AI-Generated SEO Suggestions</h3>
                  
                  <div className="space-y-3 text-xs leading-relaxed">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block">Suggested Page Title</span>
                      <pre className="p-2.5 border rounded-xl bg-zinc-50 text-[11px] font-semibold break-all text-zinc-700 whitespace-pre-wrap">{aiGeneratedTitle}</pre>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block">Suggested Description</span>
                      <pre className="p-2.5 border rounded-xl bg-zinc-50 text-[11px] font-semibold break-all text-zinc-700 whitespace-pre-wrap">Calculate tool metrics with {aiGeneratedTitle} — instant local browser-based auditing engine.</pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* REPORT SUB-TAB: ISSUES */}
          {activeReportTab === 'issues' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-2">
                <div className="flex gap-2">
                  {['all', 'error', 'warning', 'pass'].map((sev) => (
                    <button
                      key={sev}
                      onClick={() => setIssueFilter(sev as any)}
                      className={`px-3 py-1 bg-zinc-50 dark:bg-zinc-900 border rounded-lg text-xs font-bold capitalize transition ${
                        issueFilter === sev ? 'bg-teal-600 text-white' : 'text-zinc-600'
                      }`}
                    >
                      {sev === 'all' ? 'All' : `${sev}s`}
                    </button>
                  ))}
                </div>

                {/* Category filters */}
                <div className="flex flex-wrap gap-1 text-[10px] font-bold">
                  {['all', 'technical', 'onpage', 'performance', 'security', 'schema', 'images'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat as any)}
                      className={`px-2 py-1 rounded transition ${
                        categoryFilter === cat ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'text-zinc-400 hover:text-zinc-750'
                      }`}
                    >
                      {cat.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {filteredRules.map((rule: AuditRuleResult, idx: number) => (
                  <div
                    key={idx}
                    className={`p-6 rounded-3xl border flex flex-col sm:flex-row justify-between gap-4 items-start bg-white dark:bg-zinc-900/40 ${
                      rule.severity === 'error' ? 'border-rose-500/20 bg-rose-500/[0.01]' :
                      rule.severity === 'warning' ? 'border-amber-500/20 bg-amber-500/[0.01]' :
                      rule.severity === 'pass' ? 'border-emerald-500/20 bg-emerald-500/[0.01]' :
                      'border-zinc-200'
                    }`}
                  >
                    <div className="space-y-2 flex-grow max-w-3xl">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase font-mono ${
                          rule.severity === 'error' ? 'bg-rose-500/10 text-rose-600' :
                          rule.severity === 'warning' ? 'bg-amber-500/10 text-amber-600' :
                          rule.severity === 'pass' ? 'bg-emerald-500/10 text-emerald-600' :
                          'bg-zinc-100 text-zinc-505'
                        }`}>
                          {rule.status}
                        </span>
                        <span className="text-[10px] text-zinc-400 uppercase font-bold">{rule.category}</span>
                      </div>

                      <h4 className="text-sm font-extrabold text-zinc-900 dark:text-white">{rule.title}</h4>
                      <p className="text-xs text-zinc-550 dark:text-zinc-400 leading-relaxed font-medium">{rule.description}</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-550 border-t pt-2 mt-2">
                        <div><strong>Detected:</strong> {rule.detectedValue}</div>
                        <div><strong>Expected:</strong> {rule.expectedValue}</div>
                      </div>

                      {rule.recommendation && (
                        <p className="text-xs text-zinc-650 dark:text-zinc-455 font-semibold">💡 <strong>Fix Action:</strong> {rule.recommendation}</p>
                      )}
                    </div>

                    {rule.fixCode && (
                      <div className="shrink-0 flex flex-col items-end gap-2 w-full sm:w-auto font-mono">
                        <pre className="text-[9px] text-zinc-700 bg-zinc-50 border p-2 rounded-xl w-full sm:max-w-xs overflow-x-auto whitespace-pre-wrap select-all">
                          {rule.fixCode}
                        </pre>
                        <button
                          onClick={() => handleCopyFix(rule.fixCode!, `${rule.id}-${idx}`)}
                          className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-[9px] font-bold rounded-lg flex items-center gap-1.5 transition text-zinc-650"
                        >
                          {copiedFixId === `${rule.id}-${idx}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedFixId === `${rule.id}-${idx}` ? 'Copied' : 'Copy Snippet'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REPORT SUB-TAB: HEADINGS TREE */}
          {activeReportTab === 'headings' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">Heading Hierarchy outline</h3>
                <button
                  onClick={() => {
                    const text = auditState.scanReport!.headingsOutline.map((h: any) => `${h.tag.toUpperCase()}: ${h.text}`).join('\n');
                    navigator.clipboard.writeText(text);
                  }}
                  className="text-xs text-teal-605 font-bold"
                >
                  Copy Heading Structure
                </button>
              </div>

              <div className="space-y-1.5 font-mono text-xs text-zinc-650">
                {auditState.scanReport.headingsOutline.map((h: any, idx: number) => (
                  <div key={idx} style={{ paddingLeft: `${(parseInt(h.tag.replace('h', '')) - 1) * 16}px` }} className="flex gap-2 items-center">
                    <span className="text-[9px] bg-zinc-150 px-1 py-0.5 rounded uppercase font-bold text-zinc-400">{h.tag}</span>
                    <span className="text-zinc-800 dark:text-zinc-300 font-semibold">{h.text}</span>
                  </div>
                ))}
                {auditState.scanReport.headingsOutline.length === 0 && (
                  <div className="text-zinc-405 text-xs italic">No heading elements detected in the body.</div>
                )}
              </div>
            </div>
          )}

          {/* REPORT SUB-TAB: PERFORMANCE WATERFALL */}
          {activeReportTab === 'performance' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-6 animate-fadeIn">
              <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block border-b pb-2">Resource Size & Payload Statistics</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold">
                      <th className="py-2 pl-2">Resource</th>
                      <th className="py-2 text-center">Type</th>
                      <th className="py-2 text-center">Size</th>
                      <th className="py-2 text-right pr-2">Crawl response time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-semibold font-mono text-zinc-700 dark:text-zinc-350">
                    <tr>
                      <td className="py-2.5 pl-2 font-sans font-bold text-teal-650">Parsed Document</td>
                      <td className="py-2.5 text-center">Document (HTML)</td>
                      <td className="py-2.5 text-center">{(auditState.scanReport.htmlSize / 1024).toFixed(1)} KB</td>
                      <td className="py-2.5 text-right pr-2">{auditState.scanReport.responseTime}ms</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REPORT SUB-TAB: ROBOTS TESTER */}
          {activeReportTab === 'robots' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-4 animate-fadeIn">
              <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block border-b pb-2">Robots.txt Rule Indexability Tester</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 block uppercase">Test URL Path</label>
                    <input
                      type="text"
                      value={testPath}
                      onChange={(e) => setTestPath(e.target.value)}
                      placeholder="/admin/settings"
                      className="w-full p-2 border rounded text-xs font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 block uppercase">User Agent</label>
                    <select
                      value={testUserAgent}
                      onChange={(e) => setTestUserAgent(e.target.value)}
                      className="w-full p-2 border rounded text-xs"
                    >
                      <option value="Googlebot">Googlebot</option>
                      <option value="Bingbot">Bingbot</option>
                      <option value="Generic Bot">Generic Bot</option>
                    </select>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-50 border text-xs font-mono">
                    Result: <strong className="text-zinc-850">{testPathResult}</strong>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-zinc-400 block uppercase font-mono">robots.txt Source</span>
                  <pre className="text-xs bg-zinc-50 border p-3 rounded-xl overflow-x-auto max-h-40 font-mono text-zinc-650">
                    {auditState.scanReport.robotsTxt || 'No robots.txt source loaded.'}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* REPORT SUB-TAB: STRUCTURED DATA */}
          {activeReportTab === 'schema' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">JSON-LD Structured Markup</h3>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(auditState.scanReport!.schemas, null, 2));
                  }}
                  className="text-xs text-teal-605 font-bold"
                >
                  Copy JSON-LD Schema
                </button>
              </div>

              {auditState.scanReport.schemas && auditState.scanReport.schemas.length > 0 ? (
                <pre className="text-xs bg-zinc-50 p-4 rounded-xl font-mono text-zinc-750 overflow-x-auto select-all">
                  {JSON.stringify(auditState.scanReport.schemas, null, 2)}
                </pre>
              ) : (
                <div className="text-center py-6 text-xs text-zinc-400 font-semibold italic">No JSON-LD structured data detected.</div>
              )}
            </div>
          )}

          {/* REPORT SUB-TAB: ACTION PLAN */}
          {activeReportTab === 'actionplan' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-6 animate-fadeIn">
              <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block border-b pb-2">Custom 7-Day SEO Fix Plan</h3>
              
              <div className="space-y-4">
                {customSevenDayPlan.map((dayPlan) => (
                  <div key={dayPlan.day} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex items-center gap-3">
                      <span className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black text-sm shrink-0">D{dayPlan.day}</span>
                      <div>
                        <h4 className="text-xs font-extrabold text-zinc-800 dark:text-white">{dayPlan.title}</h4>
                        <p className="text-[11px] text-zinc-400 mt-0.5">{dayPlan.description}</p>
                      </div>
                    </div>

                    <div className="text-xs">
                      {dayPlan.items.length > 0 ? (
                        <div className="text-amber-600 font-bold">{dayPlan.items.length} tasks scheduled</div>
                      ) : (
                        <div className="text-emerald-600 font-bold">✓ 0 tasks remaining</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REPORT SUB-TAB: HISTORY COMPARE */}
          {activeReportTab === 'compare' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm space-y-6 animate-fadeIn">
              <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block border-b pb-2">SEO Scan Checkpoints History</h3>
              
              <div className="divide-y text-xs">
                {checkpoints.map((item, idx) => (
                  <div key={idx} className="py-3 flex justify-between items-center gap-4">
                    <div>
                      <strong className="text-zinc-800 dark:text-zinc-250 block">{item.url}</strong>
                      <span className="text-[10px] text-zinc-400 block">{item.timestamp} — Health Score: {item.score}%</span>
                    </div>
                    <button
                      onClick={() => runCheckpointComparison(item)}
                      className="px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold font-mono text-[10px] hover:opacity-85"
                    >
                      Compare
                    </button>
                  </div>
                ))}

                {checkpoints.length === 0 && (
                  <div className="text-center py-6 text-zinc-400 italic">No previous checkpoints saved locally. Submit scans to record benchmarks.</div>
                )}
              </div>

              {comparisonResult && (
                <div className="p-5 rounded-2xl bg-teal-500/5 border border-teal-500/20 text-xs space-y-2">
                  <h4 className="font-extrabold text-teal-700 dark:text-teal-400">Checkpoint Comparison Metrics</h4>
                  <p>Comparing Current scan against benchmark from <strong>{comparisonResult.prevTimestamp}</strong>:</p>
                  <ul className="list-disc pl-5 font-mono text-zinc-650">
                    <li>Score Delta: <strong className={comparisonResult.delta >= 0 ? 'text-emerald-600' : 'text-rose-600'}>{comparisonResult.delta >= 0 ? '+' : ''}{comparisonResult.delta} points</strong></li>
                    <li>Passed Checks change: <strong className="text-zinc-805">{comparisonResult.passedDiff >= 0 ? '+' : ''}{comparisonResult.passedDiff}</strong></li>
                    <li>Errors change: <strong className="text-zinc-805">{comparisonResult.errorsDiff}</strong></li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* EXPORTS DOCK ACTIONS */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
            <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block border-b pb-2">Export SEO Audit Report</h3>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={copySummaryReport}
                className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-zinc-50"
              >
                {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedReport ? 'Report Copied' : 'Copy Summary Checklist'}</span>
              </button>
              <button
                onClick={handleDownloadPDF}
                className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-zinc-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF Report</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEVELOPMENT ONLY DEBUG CONSOLE & TEST FIXTURE (Section 15 & 16 requirements) */}
      <div className="p-6 rounded-3xl bg-zinc-900 text-teal-300 font-mono text-xs border border-teal-500/20 shadow-xl space-y-4">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
          <span className="text-[10px] font-black uppercase text-teal-400">🔧 Development Diagnostic Console</span>
          <button
            onClick={runAutomatedTests}
            className="px-3 py-1 bg-teal-605 text-zinc-900 rounded-lg font-black hover:opacity-85 text-[10px]"
          >
            [ Run Parser Test Fixtures ]
          </button>
        </div>

        {testFixtureResult && (
          <div className="p-3 bg-zinc-950 border border-teal-900/60 rounded-xl leading-relaxed text-zinc-200 font-bold">
            {testFixtureResult}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-zinc-350 leading-relaxed">
          <div className="space-y-1">
            <div><strong className="text-teal-400">Target URL:</strong> {preAuditInfo?.normalizedUrl || '—'}</div>
            <div><strong className="text-teal-400">Fetch Status:</strong> {auditState.scanReport?.statusCode || '—'}</div>
            <div><strong className="text-teal-400">Final URL:</strong> {auditState.scanReport?.finalUrl || '—'}</div>
            <div><strong className="text-teal-400">Content Type:</strong> {auditState.scanReport?.contentType || '—'}</div>
            <div><strong className="text-teal-400">HTML size:</strong> {auditState.scanReport?.htmlSize || 0} bytes</div>
            <div><strong className="text-teal-400">Response Time:</strong> {auditState.scanReport?.responseTime || 0} ms</div>
          </div>
          <div className="space-y-1">
            <div><strong className="text-teal-400">Parsed Title:</strong> {auditState.scanReport?.titleText || '—'}</div>
            <div><strong className="text-teal-400">H1 count:</strong> {auditState.scanReport?.h1Count || 0}</div>
            <div><strong className="text-teal-400">H2 count:</strong> {auditState.scanReport?.h2Count || 0}</div>
            <div><strong className="text-teal-400">Images count:</strong> {auditState.scanReport?.imageCount || 0}</div>
            <div><strong className="text-teal-400">Links count:</strong> {auditState.scanReport?.linkCount || 0}</div>
            <div><strong className="text-teal-400">Canonical tag:</strong> {auditState.scanReport?.canonical || '—'}</div>
            <div><strong className="text-teal-400">Meta Robots:</strong> {auditState.scanReport?.robots || '—'}</div>
          </div>
        </div>
      </div>

      {/* Disclaimers & Security sandbox banner */}
      <div className="p-5 rounded-3xl bg-zinc-50/40 dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-800/80 space-y-4">
        <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-250 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2 border-zinc-200 dark:border-zinc-800/80">
          <Shield className="w-4 h-4 text-teal-605" />
          <span>Local Security Sandbox Controls</span>
        </h4>
        <p className="text-xs leading-relaxed text-zinc-550 dark:text-zinc-400">
          🔒 <strong>CORS & SSRF Protected Policy:</strong> To keep audits private and secure from Server-Side Request Forgery (SSRF) or open proxy vulnerabilities, no custom URL requests are routed through unrestricted proxy tunnels. Custom targets are fetched directly inside your browser. If a target site blocks cross-origin requests, switch to the Paste HTML tab to complete the audit.
        </p>
      </div>
    </div>
  );
}

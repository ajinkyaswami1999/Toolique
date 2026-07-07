import fs from 'fs';
import path from 'path';

const DIST_DIR = path.resolve('dist');
const REPORT_PATH = path.resolve('C:/Users/payworld/.gemini/antigravity/brain/17962094-82c2-4379-9365-90dae24f6bdf/seo_audit_results.md');

interface AuditIssue {
  file: string;
  type: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
}

const issuesList: AuditIssue[] = [];
let totalFilesChecked = 0;

function walkDir(dir: string, callback: (filePath: string) => void) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath, callback);
    } else if (file.endsWith('.html')) {
      callback(filePath);
    }
  });
}

function runAudit() {
  console.log('Starting Toolique automated SEO & Schema Audit...');
  
  if (!fs.existsSync(DIST_DIR)) {
    console.error('Error: Build directory "dist/" does not exist. Run "npm run build" first.');
    process.exit(1);
  }

  // 1. Audit robots.txt
  const robotsPath = path.join(DIST_DIR, 'robots.txt');
  const publicRobots = path.resolve('public/robots.txt');
  const targetRobots = fs.existsSync(robotsPath) ? robotsPath : (fs.existsSync(publicRobots) ? publicRobots : null);
  if (!targetRobots) {
    issuesList.push({
      file: 'robots.txt',
      type: 'Robots',
      severity: 'high',
      message: 'Robots.txt is missing from public and build folders.'
    });
  } else {
    const robotsText = fs.readFileSync(targetRobots, 'utf8');
    if (!robotsText.includes('Sitemap:')) {
      issuesList.push({
        file: 'robots.txt',
        type: 'Robots',
        severity: 'medium',
        message: 'Robots.txt does not declare Sitemap path.'
      });
    }
  }

  // 2. Audit sitemap.xml
  const sitemapPath = path.join(DIST_DIR, 'sitemap.xml');
  const publicSitemap = path.resolve('public/sitemap.xml');
  const targetSitemap = fs.existsSync(sitemapPath) ? sitemapPath : (fs.existsSync(publicSitemap) ? publicSitemap : null);
  let sitemapUrls: string[] = [];
  if (!targetSitemap) {
    issuesList.push({
      file: 'sitemap.xml',
      type: 'Sitemap',
      severity: 'high',
      message: 'Sitemap.xml is missing from public and build folders.'
    });
  } else {
    const sitemapText = fs.readFileSync(targetSitemap, 'utf8');
    const locRegex = /<loc>([^<]+)<\/loc>/g;
    let match;
    while ((match = locRegex.exec(sitemapText)) !== null) {
      sitemapUrls.push(match[1]);
    }
  }

  // 3. Scan HTML files
  walkDir(DIST_DIR, (filePath) => {
    totalFilesChecked++;
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(DIST_DIR, filePath);

    // Verify Title
    const titleMatch = content.match(/<title>([^<]*)<\/title>/i);
    if (!titleMatch || !titleMatch[1].trim()) {
      issuesList.push({
        file: relativePath,
        type: 'Title',
        severity: 'high',
        message: 'Missing or empty <title> tag.'
      });
    }

    // Verify Description
    const descMatch = content.match(/<meta\s+name="description"\s+content="([^"]*)"/i) || 
                      content.match(/<meta\s+content="([^"]*)"\s+name="description"/i);
    if (!descMatch || !descMatch[1].trim()) {
      issuesList.push({
        file: relativePath,
        type: 'Description',
        severity: 'high',
        message: 'Missing or empty <meta name="description"> tag.'
      });
    }

    // Verify Canonical
    const canonicalMatch = content.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i);
    if (!canonicalMatch || !canonicalMatch[1].trim()) {
      issuesList.push({
        file: relativePath,
        type: 'Canonical',
        severity: 'high',
        message: 'Missing canonical URL link tag.'
      });
    } else {
      const canonicalUrl = canonicalMatch[1];
      if (!canonicalUrl.startsWith('https://www.toolique.in/')) {
        issuesList.push({
          file: relativePath,
          type: 'Canonical',
          severity: 'medium',
          message: `Non-canonical base URL detected: "${canonicalUrl}". Expected start with "https://www.toolique.in/".`
        });
      }
      
      // Verify Sitemap alignment
      if (sitemapUrls.length > 0 && !sitemapUrls.includes(canonicalUrl)) {
        issuesList.push({
          file: relativePath,
          type: 'Sitemap Coverage',
          severity: 'medium',
          message: `Page URL "${canonicalUrl}" is not registered in sitemap.xml.`
        });
      }
    }

    // Verify H1 headers count
    const h1Count = (content.match(/<h1[\s>]/gi) || []).length;
    if (h1Count === 0) {
      issuesList.push({
        file: relativePath,
        type: 'H1 Header',
        severity: 'medium',
        message: 'No H1 headers found. Every page requires exactly one H1 header.'
      });
    } else if (h1Count > 1) {
      issuesList.push({
        file: relativePath,
        type: 'H1 Header',
        severity: 'medium',
        message: `Multiple H1 headers detected (${h1Count} found). Expected exactly one H1 header.`
      });
    }

    // Verify JSON-LD Schema
    const scriptRegex = /<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
    let scriptMatch;
    let schemaCount = 0;
    while ((scriptMatch = scriptRegex.exec(content)) !== null) {
      schemaCount++;
      const jsonText = scriptMatch[1].trim();
      try {
        const parsed = JSON.parse(jsonText);
        
        // Verify entity graph keys
        if (parsed['@graph']) {
          const graph = parsed['@graph'];
          const hasOrg = graph.some((e: any) => e['@type'] === 'Organization');
          const hasPerson = graph.some((e: any) => e['@type'] === 'Person');
          const hasWebSite = graph.some((e: any) => e['@type'] === 'WebSite');

          if (!hasOrg || !hasPerson || !hasWebSite) {
            issuesList.push({
              file: relativePath,
              type: 'JSON-LD Graph',
              severity: 'medium',
              message: `Incomplete graph nodes: hasOrg=${hasOrg}, hasPerson=${hasPerson}, hasWebSite=${hasWebSite}.`
            });
          }
        }
      } catch (err: any) {
        issuesList.push({
          file: relativePath,
          type: 'JSON-LD Syntax',
          severity: 'high',
          message: `Malformed JSON-LD structure: ${err.message}`
        });
      }
    }

    if (schemaCount === 0) {
      issuesList.push({
        file: relativePath,
        type: 'Schema.org',
        severity: 'medium',
        message: 'No JSON-LD structured schemas found on this page.'
      });
    }

    // Open Graph verify
    const ogTitle = content.includes('property="og:title"');
    const ogDesc = content.includes('property="og:description"');
    const ogUrl = content.includes('property="og:url"');
    if (!ogTitle || !ogDesc || !ogUrl) {
      issuesList.push({
        file: relativePath,
        type: 'Open Graph',
        severity: 'medium',
        message: `Missing Open Graph meta keys. Detected og:title=${ogTitle}, og:description=${ogDesc}, og:url=${ogUrl}`
      });
    }

    // Twitter Card verify
    const twCard = content.includes('name="twitter:card"');
    const twTitle = content.includes('name="twitter:title"');
    if (!twCard || !twTitle) {
      issuesList.push({
        file: relativePath,
        type: 'Twitter Card',
        severity: 'medium',
        message: `Missing Twitter Card metadata keys. Detected card=${twCard}, title=${twTitle}`
      });
    }
  });

  // Generate Report Markdown
  const highs = issuesList.filter(i => i.severity === 'high');
  const mediums = issuesList.filter(i => i.severity === 'medium');
  const lows = issuesList.filter(i => i.severity === 'low');

  const reportContent = `# Toolique: Technical SEO & Schema Audit Report

This report presents dynamic results from the automated audit of the pre-rendered \`dist/\` build folder.

---

## 1. Audit Summary Metrics

- **Total HTML files scanned:** ${totalFilesChecked}
- **High Severity Errors:** ${highs.length}
- **Medium Severity Warnings:** ${mediums.length}
- **Low Severity Notifications:** ${lows.length}
- **Site Sitemap URL Count:** ${sitemapUrls.length}

---

## 2. Issues Log

${issuesList.length > 0 ? (
  issuesList.map(issue => `- **[${issue.severity.toUpperCase()}]** [${issue.type}] in \`${issue.file}\`: ${issue.message}`).join('\n')
) : (
  '✅ Complete Pass! Zero technical SEO errors, missing headers, or malformed schemas found.'
)}

---

*Report generated automatically by \`npm run seo:audit\`.*
`;

  fs.writeFileSync(REPORT_PATH, reportContent, 'utf8');
  console.log(`\nAudit completed successfully!`);
  console.log(`Files scanned: ${totalFilesChecked}`);
  console.log(`Total issues identified: ${issuesList.length} (High: ${highs.length}, Medium: ${mediums.length})`);
  console.log(`Detailed audit report written to: ${REPORT_PATH}\n`);
}

runAudit();

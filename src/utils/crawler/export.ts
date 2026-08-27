/* eslint-disable @typescript-eslint/no-explicit-any */
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';
import { CrawlStorage } from './storage';
import { calculateOrphans, calculateRedirectsGraph } from './graph';

export const cancelledJobs = new Set<string>();

const storage = new CrawlStorage();

/**
 * Escapes values for CSV compliance and sanitizes for formula injection (CSV Injection).
 */
export function sanitizeCsvValue(val: any): string {
  if (val === null || val === undefined) return '';
  let str = String(val);
  
  // Protect against Spreadsheet Formula Injection
  if (str.startsWith('=') || str.startsWith('+') || str.startsWith('-') || str.startsWith('@')) {
    // Only prefix if it's not a valid numeric representation
    if (isNaN(Number(str))) {
      str = "'" + str;
    }
  }
  
  // Standard CSV double quoting
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

/**
 * Builds rows for CSV compilation.
 */
function compileCsvString(headers: string[], rows: any[][]): string {
  const headerLine = headers.map(sanitizeCsvValue).join(',');
  const rowLines = rows.map(r => r.map(sanitizeCsvValue).join(','));
  return [headerLine, ...rowLines].join('\n');
}

/**
 * Helper to check header presence.
 */
function getHeaderStatus(headers: Record<string, string> | undefined, name: string): string {
  if (!headers) return 'Not observed';
  const val = headers[name.toLowerCase()] || headers[name];
  if (val === undefined) return 'Missing';
  if (val.trim() === '') return 'Malformed';
  return 'Present';
}

/**
 * Background Export Job Assembler running in chunks to maintain UI responsiveness.
 */
export async function runExportJob(jobId: string): Promise<void> {
  await storage.init();
  const job = await storage.getExportJob(jobId);
  if (!job) {
    console.error(`Export job ${jobId} not found in database.`);
    return;
  }

  let progressCount = 0;

  try {
    // Broadcast started state
    dispatchRealtimeEvent(jobId, 'export_started', 0, 100, 'processing');
    await storage.saveExportJob({ ...job, status: 'processing', progress: 0 });

    const crawlId = job.crawlId;
    const isComparisonExport = crawlId.startsWith('compare-');
    if (isComparisonExport) {
      const compResults = await storage.getComparisonResult(crawlId);
      if (!compResults) {
        throw new Error('Comparison results not found. Perform the comparison first.');
      }

      let finalBlob: Blob;

      if (job.format === 'json') {
        finalBlob = new Blob([JSON.stringify(compResults, null, 2)], { type: 'application/json;charset=utf-8;' });
      } else if (job.format === 'csv' || job.format === 'xlsx') {
        const dataMap: Record<string, { headers: string[]; rows: any[][] }> = {};
        
        // 1. Summary
        dataMap['Summary'] = {
          headers: ['Metric', 'Baseline Value', 'Comparison Value', 'Difference'],
          rows: [
            ['Global Score', compResults.summary.score.global.before, compResults.summary.score.global.after, compResults.summary.score.global.diff],
            ['New Pages', 0, compResults.summary.pages.new, compResults.summary.pages.new],
            ['Removed Pages', compResults.summary.pages.removed, 0, -compResults.summary.pages.removed],
            ['Changed Pages', 0, compResults.summary.pages.changed, compResults.summary.pages.changed],
            ['New Issues', 0, compResults.summary.issues.new, compResults.summary.issues.new],
            ['Resolved Issues', compResults.summary.issues.resolved, 0, -compResults.summary.issues.resolved],
            ['Persistent Issues', compResults.summary.issues.persistent, compResults.summary.issues.persistent, 0]
          ]
        };

        // 2. Page Changes
        const pageChangesRows = [
          ...compResults.newUrls.map((u: string) => [u, 'NEW', 'Added page']),
          ...compResults.removedUrls.map((u: string) => [u, 'REMOVED', 'Removed page']),
          ...compResults.pageChanges.map((c: any) => [c.url, 'CHANGED', `${c.changes.length} fields changed`])
        ];
        dataMap['Page Changes'] = {
          headers: ['URL', 'Change Type', 'Details'],
          rows: pageChangesRows
        };

        // 3. Field Changes
        const fieldChangesRows: any[][] = [];
        compResults.pageChanges.forEach((c: any) => {
          c.changes.forEach((ch: any) => {
            fieldChangesRows.push([c.url, ch.field, ch.before, ch.after]);
          });
        });
        dataMap['Field Changes'] = {
          headers: ['URL', 'Field', 'Value Before', 'Value After'],
          rows: fieldChangesRows
        };

        // 4. Issue Changes
        const issueChangesRows = [
          ...compResults.issues.new.map((i: any) => [i.url, i.rule, i.category, i.severity, i.description, 'NEW']),
          ...compResults.issues.resolved.map((i: any) => [i.url, i.rule, i.category, i.severity, i.description, 'RESOLVED']),
          ...compResults.issues.persistent.map((i: any) => [i.url, i.rule, i.category, i.severity, i.description, 'PERSISTENT'])
        ];
        dataMap['Issue Changes'] = {
          headers: ['URL', 'Rule ID', 'Category', 'Severity', 'Description', 'Change Status'],
          rows: issueChangesRows
        };

        // 5. Link Changes
        const linkChangesRows = [
          ...compResults.links.new.map((l: any) => [l.source, l.destination, 'Link Added', 'None', 'Present', 'NEW']),
          ...compResults.links.removed.map((l: any) => [l.source, l.destination, 'Link Removed', 'Present', 'None', 'REMOVED']),
          ...compResults.links.changed.flatMap((c: any) => c.changes.map((ch: any) => [c.source, c.destination, ch.field, ch.before, ch.after, 'CHANGED']))
        ];
        dataMap['Link Changes'] = {
          headers: ['Source URL', 'Destination URL', 'Field/Attribute', 'Value Before', 'Value After', 'Change Status'],
          rows: linkChangesRows
        };

        // 6. Architecture Graph Changes
        const archRows = [
          ...compResults.architecture.newOrphans.map((u: string) => ['Orphan Candidate', u, 'Orphan candidate introduced']),
          ...compResults.architecture.resolvedOrphans.map((u: string) => ['Orphan Candidate', u, 'Orphan candidate resolved']),
          ...compResults.architecture.newHubs.map((u: string) => ['Hub Candidate', u, 'Hub page introduced']),
          ...compResults.architecture.resolvedHubs.map((u: string) => ['Hub Candidate', u, 'Hub page resolved'])
        ];
        dataMap['Architecture Changes'] = {
          headers: ['Type', 'Node URL', 'Details'],
          rows: archRows
        };

        if (job.format === 'csv') {
          const keys = Object.keys(dataMap);
          if (keys.length === 1) {
            const ds = dataMap[keys[0]];
            finalBlob = new Blob(['\uFEFF' + compileCsvString(ds.headers, ds.rows)], { type: 'text/csv;charset=utf-8;' });
          } else {
            const zip = new JSZip();
            for (const k of keys) {
              const ds = dataMap[k];
              const csvName = `${k.toLowerCase().replace(/ /g, '_')}.csv`;
              zip.file(csvName, '\uFEFF' + compileCsvString(ds.headers, ds.rows));
            }
            finalBlob = await zip.generateAsync({ type: 'blob' });
          }
        } else {
          // XLSX
          const wb = XLSX.utils.book_new();
          for (const k of Object.keys(dataMap)) {
            const ds = dataMap[k];
            const ws = XLSX.utils.aoa_to_sheet([ds.headers, ...ds.rows]);
            ws['!views'] = [{ state: 'frozen', ySplit: 1 }];
            const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1');
            const endCol = XLSX.utils.encode_col(range.e.c);
            ws['!autofilter'] = { ref: `A1:${endCol}${range.e.r + 1}` };
            XLSX.utils.book_append_sheet(wb, ws, k.slice(0, 30));
          }
          const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
          finalBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        }
      } else if (job.format === 'pdf') {
        const doc = new jsPDF();
        let y = 20;

        // Cover page
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, 210, 297, 'F');

        doc.setTextColor(20, 184, 166);
        doc.setFontSize(26);
        doc.setFont('Helvetica', 'bold');
        doc.text('CRAWL COMPARISON REPORT', 20, 80);

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.text('Crawl Delta & Change Detection Audit', 20, 95);

        doc.setTextColor(148, 163, 184);
        doc.setFontSize(10);
        doc.setFont('Courier', 'normal');
        doc.text(`Baseline ID: ${compResults.crawlIdA}`, 20, 150);
        doc.text(`Comparison ID: ${compResults.crawlIdB}`, 20, 158);
        doc.text(`Comparison Version: v${compResults.comparisonVersion}`, 20, 166);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 174);

        // Page 2: Summary
        doc.addPage();
        y = 20;
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(18);
        doc.setFont('Helvetica', 'bold');
        doc.text('Crawl Comparison Summary', 20, y);
        y += 15;

        const scoreDiff = compResults.summary.score.global.diff;
        doc.setFillColor(248, 250, 252);
        doc.rect(20, y, 170, 32, 'F');
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(11);
        doc.text('Overall Health Score Movement', 26, y + 10);
        
        doc.setFontSize(20);
        doc.text(`${compResults.summary.score.global.before} -> ${compResults.summary.score.global.after}`, 26, y + 22);
        
        doc.setFontSize(14);
        doc.setTextColor(scoreDiff >= 0 ? 16 : 220, scoreDiff >= 0 ? 185 : 38, scoreDiff >= 0 ? 129 : 38);
        doc.text(scoreDiff >= 0 ? `+${scoreDiff} Improvement` : `${scoreDiff} Regression`, 110, y + 21);
        y += 45;

        doc.setTextColor(15, 23, 42);
        doc.setFontSize(13);
        doc.setFont('Helvetica', 'bold');
        doc.text('Page Differences Count', 20, y);
        y += 8;

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105);
        
        doc.text(`New Pages Added: ${compResults.summary.pages.new}`, 25, y); y += 6;
        doc.text(`Pages Removed: ${compResults.summary.pages.removed}`, 25, y); y += 6;
        doc.text(`Pages Modified: ${compResults.summary.pages.changed}`, 25, y); y += 6;
        doc.text(`Unchanged Pages: ${compResults.summary.pages.unchanged}`, 25, y); y += 12;

        doc.setTextColor(15, 23, 42);
        doc.setFontSize(13);
        doc.setFont('Helvetica', 'bold');
        doc.text('Technical Issues Trend', 20, y);
        y += 8;

        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text(`New Issues Detected: ${compResults.summary.issues.new}`, 25, y); y += 6;
        doc.text(`Issues Resolved: ${compResults.summary.issues.resolved}`, 25, y); y += 6;
        doc.text(`Persistent Issues: ${compResults.summary.issues.persistent}`, 25, y); y += 12;

        // Page 3: Top Page Changes
        doc.addPage();
        y = 20;
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(14);
        doc.setFont('Helvetica', 'bold');
        doc.text('Modified Pages Detail Sample', 20, y);
        y += 10;

        compResults.pageChanges.slice(0, 10).forEach((c: any) => {
          if (y + 25 > 280) {
            doc.addPage();
            y = 20;
          }
          doc.setFillColor(250, 250, 250);
          doc.rect(20, y, 170, 20, 'F');
          doc.setTextColor(15, 23, 42);
          doc.setFontSize(9);
          doc.setFont('Helvetica', 'bold');
          doc.text(c.url, 23, y + 6);
          
          doc.setTextColor(71, 85, 105);
          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(8);
          const changesText = c.changes.slice(0, 2).map((ch: any) => `${ch.field}: "${ch.before}" -> "${ch.after}"`).join(' | ');
          doc.text(changesText || 'Metadata changes', 23, y + 14);
          y += 24;
        });

        finalBlob = doc.output('blob');
      } else {
        throw new Error(`Unsupported export format ${job.format}`);
      }

      await storage.saveExportFile(jobId, finalBlob);
      await storage.saveExportJob({
        ...job,
        status: 'completed',
        progress: 100,
        total: 100,
        fileSize: finalBlob.size,
        completedTimestamp: new Date().toISOString()
      });

      dispatchRealtimeEvent(jobId, 'export_completed', 100, 100, 'completed', finalBlob.size);
      return;
    }

    const pages = await storage.getPagesForCrawl(crawlId);
    const links = await storage.getLinksForCrawl(crawlId);
    const images = await storage.getImagesForCrawl(crawlId);
    const resources = await storage.getResourcesForCrawl(crawlId);
    const issues = await storage.getIssuesForCrawl(crawlId);

    // Apply Filter Consistency
    let filteredPages = pages;
    const filterObj = JSON.parse(job.filters || '{}');
    if (filterObj.status) {
      filteredPages = filteredPages.filter(p => p.status.toString() === filterObj.status);
    }
    if (filterObj.depth) {
      filteredPages = filteredPages.filter(p => p.depth.toString() === filterObj.depth);
    }
    if (filterObj.type) {
      filteredPages = filteredPages.filter(p => p.type?.toLowerCase().includes(filterObj.type.toLowerCase()));
    }
    if (filterObj.search) {
      const q = filterObj.search.toLowerCase();
      filteredPages = filteredPages.filter(p => p.url.toLowerCase().includes(q) || (p.title || '').toLowerCase().includes(q));
    }

    const filteredUrls = new Set(filteredPages.map(p => p.url));

    // Filter secondary datasets to preserve relationship consistency
    const filteredLinks = links.filter(l => filteredUrls.has(l.source));
    const filteredImages = images.filter(img => filteredUrls.has(img.pageUrl));
    const filteredResources = resources.filter(res => filteredUrls.has(res.pageUrl));
    const filteredIssues = issues.filter(i => filteredUrls.has(i.url));

    if (cancelledJobs.has(jobId)) {
      await abortJob(jobId);
      return;
    }

    // Determine target datasets requested
    const selectedDatasets = JSON.parse(job.dataset || '[]');
    const exportAll = selectedDatasets.includes('all') || selectedDatasets.length === 0;

    const dataMap: Record<string, { headers: string[]; rows: any[][] }> = {};

    let totalRows = 0;

    // Helper to add dataset and calculate progress heights
    const addDataset = (name: string, headers: string[], rows: any[][]) => {
      dataMap[name] = { headers, rows };
      totalRows += rows.length;
    };

    // 1. Pages
    if (exportAll || selectedDatasets.includes('pages')) {
      const rows = filteredPages.map(p => {
        const pageScore = Math.max(0, 100 - issues.filter(i => i.url === p.url).reduce((acc, curr) => acc + (curr.severity === 'CRITICAL' ? 15 : curr.severity === 'WARNING' ? 5 : 2), 0));
        return [
          p.url,
          p.url,
          p.status,
          p.type || 'text/html',
          p.depth || 0,
          p.title || '',
          (p.title || '').length,
          p.description || '',
          (p.description || '').length,
          p.canonical || '',
          p.indexability || 'Indexable',
          p.h1s?.[0] || '',
          p.wordCount || 0,
          p.size || 0,
          p.time || 0,
          links.filter(l => l.destination === p.url).length,
          links.filter(l => l.source === p.url).length,
          issues.filter(i => i.url === p.url).length,
          pageScore,
          p.timestamp || ''
        ];
      });
      addDataset('Pages', [
        'URL', 'Normalized URL', 'HTTP Status', 'Content Type', 'Crawl Depth',
        'Title', 'Title Length', 'Meta Description', 'Meta Description Length',
        'Canonical', 'Indexability', 'H1', 'Word Count', 'Response Size (Bytes)',
        'Response Time (ms)', 'Inbound Links', 'Outbound Links', 'Issue Count',
        'Score', 'Crawl Timestamp'
      ], rows);
    }

    // 2. Issues
    if (exportAll || selectedDatasets.includes('issues')) {
      const rows = filteredIssues.map(i => {
        const pageOfIssue = pages.find(p => p.url === i.url);
        return [
          `${i.rule}_${i.url.replace(/[^a-zA-Z0-9]/g, '_')}`, // Issue ID
          i.rule, // Rule ID
          i.category,
          i.severity,
          i.rule, // Title
          i.description,
          i.url,
          JSON.stringify(i.evidence || {}),
          pageOfIssue?.timestamp || '' // Detected Timestamp
        ];
      });
      addDataset('Issues', [
        'Issue ID', 'Rule ID', 'Category', 'Severity', 'Title', 'Description',
        'URL', 'Evidence', 'Detected Timestamp'
      ], rows);
    }

    // 3. Links
    if (exportAll || selectedDatasets.includes('links')) {
      const rows = filteredLinks.map(l => {
        const destPage = pages.find(p => p.url === l.destination);
        return [
          l.source,
          l.destination,
          l.anchor || 'None',
          l.isExternal ? 'External' : 'Internal',
          l.status,
          l.follow ? 'Follow' : 'Nofollow',
          l.follow ? 'false' : 'true',
          destPage?.discoverySource || 'INTERNAL_LINK'
        ];
      });
      addDataset('Links', [
        'Source URL', 'Destination URL', 'Anchor Text', 'Internal/External',
        'HTTP Status', 'Follow/Nofollow', 'Nofollow Bool', 'Discovery Source'
      ], rows);
    }

    // 4. Redirects
    if (exportAll || selectedDatasets.includes('redirects')) {
      const redirectChains = calculateRedirectsGraph(pages, links).filter(c => filteredUrls.has(c.source));
      const rows = redirectChains.map(r => [
        r.source,
        r.destination,
        r.status,
        r.chainLength,
        r.chain?.[r.chain.length - 1] || r.destination,
        r.isLoop ? 'Loop Cycle' : 'Clean Chain'
      ]);
      addDataset('Redirects', [
        'Source URL', 'Destination URL', 'HTTP Status', 'Chain Length',
        'Final Destination', 'Loop Status'
      ], rows);
    }

    // 5. Images
    if (exportAll || selectedDatasets.includes('images')) {
      const rows = filteredImages.map(img => [
        img.pageUrl,
        img.url,
        img.alt || 'None',
        img.width || 0,
        img.height || 0,
        img.loading || 'unset',
        img.status || 0,
        'Not observed', // size is not observed/tracked for image records
        img.isExternal ? 'External' : 'Internal'
      ]);
      addDataset('Images', [
        'Page URL', 'Image URL', 'Alt Text', 'Width', 'Height',
        'Loading Attribute', 'Link Status', 'Size (Bytes)', 'Internal/External'
      ], rows);
    }

    // 6. Resources
    if (exportAll || selectedDatasets.includes('resources')) {
      const rows = filteredResources.map(res => [
        res.pageUrl,
        res.url,
        res.type || 'unknown',
        res.status || 0,
        'Not observed', // size is not observed/tracked for resource records
        res.url.startsWith('//') || (res.url.startsWith('http') && !res.url.includes(crawlId)) ? 'External' : 'Internal',
        res.url.endsWith('.js') ? 'application/javascript' : (res.url.endsWith('.css') ? 'text/css' : 'unknown')
      ]);
      addDataset('Resources', [
        'Page URL', 'Resource URL', 'Resource Type', 'Status Code',
        'Size (Bytes)', 'Relation Type', 'Content Type'
      ], rows);
    }

    // 7. SEO
    if (exportAll || selectedDatasets.includes('seo')) {
      const rows = filteredPages.map(p => [
        p.url,
        p.title || '',
        (p.title || '').length,
        p.description || '',
        (p.description || '').length,
        p.h1s?.[0] || '',
        p.canonical || '',
        p.metaRobots || '',
        p.hreflangs?.length || 0,
        p.openGraph?.['og:title'] || '',
        p.twitterCard?.['twitter:card'] || '',
        p.structuredData?.length || 0
      ]);
      addDataset('SEO', [
        'URL', 'Title', 'Title Length', 'Description', 'Description Length',
        'H1', 'Canonical', 'Robots Meta', 'Hreflang Count', 'Open Graph Title',
        'Twitter Card', 'Structured Data Count'
      ], rows);
    }

    // 8. Security
    if (exportAll || selectedDatasets.includes('security')) {
      const rows = filteredPages.map(p => [
        p.url,
        p.url.startsWith('https:') ? 'Present' : 'Missing',
        getHeaderStatus(p.headers, 'Strict-Transport-Security'),
        getHeaderStatus(p.headers, 'Content-Security-Policy'),
        getHeaderStatus(p.headers, 'X-Frame-Options'),
        getHeaderStatus(p.headers, 'X-Content-Type-Options'),
        getHeaderStatus(p.headers, 'Referrer-Policy'),
        getHeaderStatus(p.headers, 'Permissions-Policy'),
        getHeaderStatus(p.headers, 'Cross-Origin-Opener-Policy'),
        getHeaderStatus(p.headers, 'Cross-Origin-Embedder-Policy')
      ]);
      addDataset('Security', [
        'URL', 'HTTPS', 'HSTS Header', 'CSP Header', 'X-Frame-Options',
        'X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy',
        'COOP Header', 'COEP Header'
      ], rows);
    }

    // 9. Performance
    if (exportAll || selectedDatasets.includes('performance')) {
      const rows = filteredPages.map(p => [
        p.url,
        'Not observed',
        'Not observed',
        'Not observed',
        'Not observed',
        'Not observed',
        p.time || 0,
        p.size || 0
      ]);
      addDataset('Performance', [
        'URL', 'DNS Time', 'Connection Time', 'TLS Time', 'TTFB',
        'Download Time', 'Total Response Time (ms)', 'Response Size (Bytes)'
      ], rows);
    }

    // 10. Architecture Nodes & Edges
    if (exportAll || selectedDatasets.includes('architecture')) {
      const nodesRows = filteredPages.map(p => [
        p.url,
        p.url,
        p.status,
        p.depth || 0,
        filteredIssues.filter(i => i.url === p.url).length,
        filteredLinks.filter(l => l.destination === p.url).length,
        filteredLinks.filter(l => l.source === p.url).length
      ]);
      addDataset('Architecture Nodes', [
        'Node ID', 'URL', 'HTTP Status', 'Crawl Depth', 'Issue Count',
        'Inbound Links', 'Outbound Links'
      ], nodesRows);

      const edgesRows = filteredLinks.map(l => [
        l.source,
        l.destination,
        l.isExternal ? 'EXTERNAL_LINK' : 'INTERNAL_LINK',
        l.anchor || 'None',
        l.status
      ]);
      addDataset('Architecture Edges', [
        'Source', 'Destination', 'Relationship', 'Anchor Text', 'Status'
      ], edgesRows);
    }

    // Simulate export generator yields to prevent browser freeze
    const yieldControl = async (rowsAdded: number) => {
      progressCount += rowsAdded;
      dispatchRealtimeEvent(jobId, 'export_progress', progressCount, totalRows, 'processing');
      await storage.saveExportJob({ ...job, status: 'processing', progress: progressCount, total: totalRows });
      
      // Control yielding
      await new Promise(resolve => setTimeout(resolve, 0));
    };

    let finalBlob: Blob;

    // Compile targets based on requested formats
    if (job.format === 'json') {
      const cleanPages = filteredPages.map(p => {
        const { ...clean } = p;
        return clean;
      });

      const cleanIssues = filteredIssues.map(i => {
        const { ...clean } = i;
        return clean;
      });

      const exportObj = {
        crawl: {
          crawlId,
          timestamp: new Date().toISOString(),
          totalURLs: pages.length,
          exportedURLs: filteredPages.length
        },
        pages: cleanPages,
        issues: cleanIssues,
        links: filteredLinks,
        redirects: calculateRedirectsGraph(pages, links).filter(c => filteredUrls.has(c.source)),
        images: filteredImages,
        resources: filteredResources,
        architecture: {
          nodes: dataMap['Architecture Nodes']?.rows || [],
          edges: dataMap['Architecture Edges']?.rows || []
        }
      };

      const jsonStr = JSON.stringify(exportObj, null, 2);
      finalBlob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
      await yieldControl(totalRows);

    } else if (job.format === 'csv') {
      const keys = Object.keys(dataMap);
      if (keys.length === 1) {
        // Single CSV File
        const ds = dataMap[keys[0]];
        const csvContent = '\uFEFF' + compileCsvString(ds.headers, ds.rows);
        finalBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        await yieldControl(totalRows);
      } else {
        // Multiple CSV datasets zipped
        const zip = new JSZip();
        for (const k of keys) {
          if (cancelledJobs.has(jobId)) {
            await abortJob(jobId);
            return;
          }
          const ds = dataMap[k];
          const csvName = `${k.toLowerCase().replace(/ /g, '_')}.csv`;
          zip.file(csvName, '\uFEFF' + compileCsvString(ds.headers, ds.rows));
          await yieldControl(ds.rows.length);
        }
        finalBlob = await zip.generateAsync({ type: 'blob' });
      }

    } else if (job.format === 'xlsx') {
      const wb = XLSX.utils.book_new();

      // Summary Metadata sheet
      const summaryRows = [
        ['Crawl ID', crawlId],
        ['Export Timestamp', new Date().toLocaleString()],
        ['Total Crawled URLs', pages.length],
        ['Filtered URLs Exported', filteredPages.length],
        ['Total Technical Issues', issues.length],
        ['ZIP CSV Bundled', Object.keys(dataMap).join(', ')]
      ];
      const summaryWs = XLSX.utils.aoa_to_sheet(summaryRows);
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

      for (const k of Object.keys(dataMap)) {
        if (cancelledJobs.has(jobId)) {
          await abortJob(jobId);
          return;
        }

        const ds = dataMap[k];
        const wsRows = [ds.headers, ...ds.rows];
        const ws = XLSX.utils.aoa_to_sheet(wsRows);

        // Freeze headers row
        ws['!views'] = [{ state: 'frozen', ySplit: 1, xSplit: 0, activePane: 'bottomLeft', topLeftCell: 'A2' }];

        // Enable Autofilters
        const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1');
        const endCol = XLSX.utils.encode_col(range.e.c);
        ws['!autofilter'] = { ref: `A1:${endCol}${range.e.r + 1}` };

        XLSX.utils.book_append_sheet(wb, ws, k.slice(0, 30));
        await yieldControl(ds.rows.length);
      }

      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      finalBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    } else if (job.format === 'pdf') {
      const doc = new jsPDF();
      let y = 20;

      const checkPage = (heightNeeded: number) => {
        if (y + heightNeeded > 280) {
          doc.addPage();
          y = 20;
        }
      };

      // 1. Cover Page
      doc.setFillColor(15, 23, 42); // Dark background Slate-900
      doc.rect(0, 0, 210, 297, 'F');

      doc.setTextColor(20, 184, 166); // Teal-500
      doc.setFontSize(28);
      doc.setFont('Helvetica', 'bold');
      doc.text('CRAWL DIAGNOSTICS', 20, 80);
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.text('Executive Technical Audit Report', 20, 95);

      doc.setFillColor(20, 184, 166);
      doc.rect(20, 105, 60, 3, 'F'); // Teal underline strip

      doc.setTextColor(148, 163, 184); // Slate-400
      doc.setFontSize(10);
      doc.setFont('Courier', 'normal');
      doc.text(`Crawl ID: ${crawlId}`, 20, 150);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 158);

      const rootUrl = pages.find(p => p.depth === 0)?.url || 'N/A';
      doc.text(`Target Host: ${rootUrl}`, 20, 166);

      // 2. Executive summary
      doc.addPage();
      doc.setFillColor(255, 255, 255);
      doc.setTextColor(15, 23, 42);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('Executive Summary', 20, y);
      y += 15;

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.text([
        `This audit represents client-side crawler observed metrics collected for the crawl run of ${rootUrl}.`,
        `The crawl was initialized with maximum constraints filters. A total of ${pages.length} URLs were crawled,`,
        `containing ${links.length} total outbound links and resolving ${issues.length} detected technical SEO issues.`,
      ], 20, y);
      y += 20;

      // Score Meter Card
      const pageScores = pages.map(p => Math.max(0, 100 - issues.filter(i => i.url === p.url).reduce((acc, curr) => acc + (curr.severity === 'CRITICAL' ? 15 : curr.severity === 'WARNING' ? 5 : 2), 0)));
      const avgScore = pageScores.length > 0 ? Math.round(pageScores.reduce((acc, s) => acc + s, 0) / pageScores.length) : 100;
      doc.setFillColor(248, 250, 252);
      doc.rect(20, y, 170, 30, 'F');
      
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(12);
      doc.setFont('Helvetica', 'bold');
      doc.text('Overall Site Health Score', 30, y + 12);
      
      doc.setFontSize(24);
      doc.setTextColor(avgScore >= 90 ? 16 : 220, avgScore >= 90 ? 185 : 38, avgScore >= 90 ? 129 : 38);
      doc.text(`${avgScore}/100`, 30, y + 23);
      y += 40;

      // 3. HTTP status distribution
      checkPage(50);
      doc.setTextColor(15, 23, 42);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('HTTP Response Status Code Distribution', 20, y);
      y += 8;

      const codeCounts = {
        '2xx OK': pages.filter(p => p.status >= 200 && p.status < 300).length,
        '3xx Redirects': pages.filter(p => p.status >= 300 && p.status < 400).length,
        '4xx Errors': pages.filter(p => p.status >= 400 && p.status < 500).length,
        '5xx Server Errors': pages.filter(p => p.status >= 500).length,
        'Failed Connection': pages.filter(p => p.status === 0).length
      };

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      Object.entries(codeCounts).forEach(([k, count]) => {
        doc.text(`${k}:`, 25, y);
        doc.setFont('Helvetica', 'bold');
        doc.text(`${count} pages`, 80, y);
        doc.setFont('Helvetica', 'normal');
        y += 6;
      });
      y += 10;

      // 4. Indexability summary
      checkPage(40);
      doc.setTextColor(15, 23, 42);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Indexability & Crawl Depth Summary', 20, y);
      y += 8;

      const indexable = pages.filter(p => p.indexability === 'index' || p.indexability === 'Indexable').length;
      const noindex = pages.filter(p => p.indexability !== 'index' && p.indexability !== 'Indexable').length;
      const maxDepth = pages.length > 0 ? Math.max(...pages.map(p => p.depth || 0)) : 0;

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Indexable URLs: ${indexable} pages`, 25, y);
      y += 6;
      doc.text(`Blocked (Noindex) URLs: ${noindex} pages`, 25, y);
      y += 6;
      doc.text(`Maximum Crawled Depth: Depth ${maxDepth}`, 25, y);
      y += 15;

      // 5. Links & Redirects
      checkPage(50);
      doc.setTextColor(15, 23, 42);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Internal Linkages & Redirect Audits', 20, y);
      y += 8;

      const internalLinks = links.filter(l => !l.isExternal).length;
      const externalLinks = links.filter(l => l.isExternal).length;
      const brokenLinks = links.filter(l => l.status >= 400 || l.status === 0).length;
      const redirects = links.filter(l => l.status >= 300 && l.status < 400).length;
      const orphans = calculateOrphans(pages, links).filter(o => o.isCandidate).length;

      doc.setFont('Helvetica', 'normal');
      doc.text(`Internal Outbound Links: ${internalLinks}`, 25, y);
      y += 6;
      doc.text(`External Outbound Links: ${externalLinks}`, 25, y);
      y += 6;
      doc.text(`Broken Link Outlets: ${brokenLinks} links`, 25, y);
      y += 6;
      doc.text(`Redirect Links: ${redirects}`, 25, y);
      y += 6;
      doc.text(`Orphan Candidate Pages: ${orphans} pages`, 25, y);
      y += 15;

      // 6. Top Issues Section
      doc.addPage();
      y = 20;
      doc.setTextColor(15, 23, 42);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('Prioritized Technical SEO Issues (Top 10)', 20, y);
      y += 15;

      const uniqueIssues = Array.from(new Set(issues.map(i => i.rule)));
      const topIssues = uniqueIssues.slice(0, 10).map(rule => {
        const aff = issues.filter(i => i.rule === rule);
        return {
          rule,
          category: aff[0].category,
          severity: aff[0].severity,
          desc: aff[0].description || rule,
          count: aff.length,
          urls: aff.slice(0, 2).map(i => i.url)
        };
      });

      topIssues.forEach((issue) => {
        checkPage(30);
        doc.setFillColor(254, 242, 242);
        doc.rect(20, y, 170, 22, 'F');
        
        doc.setTextColor(220, 38, 38);
        doc.setFontSize(9);
        doc.setFont('Helvetica', 'bold');
        doc.text(`[${issue.severity}] ${issue.rule} (${issue.count} affected URLs)`, 24, y + 6);
        
        doc.setTextColor(71, 85, 105);
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(issue.desc, 24, y + 11);
        doc.text(`Sample URL: ${issue.urls[0]}`, 24, y + 16);
        y += 26;
      });

      finalBlob = doc.output('blob');
      await yieldControl(totalRows);
    } else {
      throw new Error(`Unsupported export format ${job.format}`);
    }

    if (cancelledJobs.has(jobId)) {
      await abortJob(jobId);
      return;
    }

    // Save Export file Blob
    await storage.saveExportFile(jobId, finalBlob);
    
    // Complete Job details
    await storage.saveExportJob({
      ...job,
      status: 'completed',
      progress: totalRows,
      total: totalRows,
      fileSize: finalBlob.size,
      completedTimestamp: new Date().toISOString()
    });

    dispatchRealtimeEvent(jobId, 'export_completed', totalRows, totalRows, 'completed', finalBlob.size);

  } catch (err: any) {
    console.error(`Export Job ${jobId} failed:`, err);
    
    const jobRecord = await storage.getExportJob(jobId);
    if (jobRecord) {
      await storage.saveExportJob({
        ...jobRecord,
        status: 'failed',
        error: err.message || 'Export compilation aborted.'
      });
    }

    dispatchRealtimeEvent(jobId, 'export_failed', progressCount, progressCount, 'failed', undefined, err.message);
  }
}

/**
 * Halts export execution.
 */
async function abortJob(jobId: string) {
  cancelledJobs.delete(jobId);
  const job = await storage.getExportJob(jobId);
  if (job) {
    await storage.saveExportJob({
      ...job,
      status: 'cancelled',
      error: 'Export job was cancelled by user request.'
    });
  }
  dispatchRealtimeEvent(jobId, 'export_failed', 0, 0, 'cancelled', undefined, 'Cancelled');
}

/**
 * Fires custom DOM events representing progress changes.
 */
function dispatchRealtimeEvent(
  jobId: string,
  type: string,
  progress: number,
  total: number,
  status: string,
  fileSize?: number,
  error?: string
) {
  if (typeof window !== 'undefined') {
    const ev = new CustomEvent('crawler_export_event', {
      detail: {
        jobId,
        type,
        progress,
        total,
        status,
        fileSize,
        error
      }
    });
    window.dispatchEvent(ev);
    console.log(`[REALTIME EXPORT BUS] Event: ${type} progress=${progress}/${total} status=${status}`);
  }
}

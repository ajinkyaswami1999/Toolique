import { jsPDF } from 'jspdf';
import { PDF_THEMES, type PdfTableTheme } from './tableTheme';

export const PAGE_WIDTH = 210; // A4 width in mm
export const PAGE_HEIGHT = 297; // A4 height in mm
export const MARGIN = 14; // Standard margin in mm
export const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN; // 182 mm
export const MAX_Y = 270; // Printable boundary before page break
export const FOOTER_Y = 286; // Running footer position

export type ProjectDetails =
  | string
  | {
      projectName?: string;
      name?: string;
      clientName?: string;
      client?: string;
      contractor?: string;
      location?: string;
      engineer?: string;
      date?: string;
      notes?: string;
      [key: string]: any;
    };

export interface KpiMetric {
  label: string;
  value: string | number;
  subtext?: string;
  highlight?: boolean;
}

export interface BrandedHeaderOptions {
  title: string;
  subtitle?: string;
  category?: string;
  complianceBadge?: string;
  referenceId?: string;
  theme?: PdfTableTheme;
}

/**
 * Draws the top branded banner with Toolique wordmark, category pill,
 * document title, subtitle, reference code, and generation timestamp.
 */
export function drawBrandedHeader(
  doc: jsPDF,
  options: BrandedHeaderOptions
): number {
  const {
    title,
    subtitle,
    category,
    complianceBadge,
    referenceId,
    theme = 'brand',
  } = options;

  const palette = PDF_THEMES[theme] || PDF_THEMES.brand;
  const bannerHeight = 24;

  // Header Banner Fill
  doc.setFillColor(palette.headerBg[0], palette.headerBg[1], palette.headerBg[2]);
  doc.rect(0, 0, PAGE_WIDTH, bannerHeight, 'F');

  // Brand Name & Category
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('TOOLIQUE INDIA', MARGIN, 11);

  // Category & Compliance Pill on top right
  const badgeText = complianceBadge || (category ? `${category.toUpperCase()} SUITE` : 'ENGINEERING SPEC');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  const badgeWidth = doc.getTextWidth(badgeText) + 6;
  const badgeX = PAGE_WIDTH - MARGIN - badgeWidth;

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(badgeX, 6, badgeWidth, 5.5, 1.5, 1.5, 'F');
  doc.setTextColor(palette.headerBg[0], palette.headerBg[1], palette.headerBg[2]);
  doc.text(badgeText, badgeX + 3, 10);

  // Subtitle / Document Purpose in banner
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(240, 240, 250);
  const subText = subtitle || 'Standard Calculation, Schedule & Material Requisition Report';
  doc.text(subText, MARGIN, 19);

  let currentY = bannerHeight + 8;

  // Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(palette.textDark[0], palette.textDark[1], palette.textDark[2]);
  doc.text(title, MARGIN, currentY);
  currentY += 5.5;

  // Meta row: Ref ID & Date
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const refCode = referenceId || `TLQ-${Date.now().toString().slice(-6)}`;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(palette.textMuted[0], palette.textMuted[1], palette.textMuted[2]);
  doc.text(`Reference: ${refCode}`, MARGIN, currentY);
  doc.text(`Date: ${dateStr}`, MARGIN + 60, currentY);
  doc.text('Security: Client-Side Verified (Zero Server Storage)', PAGE_WIDTH - MARGIN, currentY, { align: 'right' });
  currentY += 4;

  // Subtle separator line
  doc.setDrawColor(palette.borderColor[0], palette.borderColor[1], palette.borderColor[2]);
  doc.setLineWidth(0.2);
  doc.line(MARGIN, currentY, PAGE_WIDTH - MARGIN, currentY);
  currentY += 5;

  return currentY;
}

/**
 * Draws structured project metadata in a clean 2-column or 4-cell card.
 */
export function drawProjectMetaCard(
  doc: jsPDF,
  project: ProjectDetails,
  startY: number,
  theme: PdfTableTheme = 'brand'
): number {
  const palette = PDF_THEMES[theme] || PDF_THEMES.brand;
  const cardHeight = 22;

  // Background Box
  doc.setFillColor(palette.zebraBg[0], palette.zebraBg[1], palette.zebraBg[2]);
  doc.setDrawColor(palette.borderColor[0], palette.borderColor[1], palette.borderColor[2]);
  doc.setLineWidth(0.25);
  doc.roundedRect(MARGIN, startY, CONTENT_WIDTH, cardHeight, 2, 2, 'FD');

  const col1X = MARGIN + 4;
  const col2X = MARGIN + CONTENT_WIDTH / 2 + 4;

  const pObj = typeof project === 'string' ? { projectName: project } : project;

  const renderField = (label: string, val: string | undefined, x: number, y: number) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(palette.textMuted[0], palette.textMuted[1], palette.textMuted[2]);
    doc.text(label.toUpperCase(), x, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(palette.textDark[0], palette.textDark[1], palette.textDark[2]);
    doc.text(val || 'Not Specified', x, y + 4.2);
  };

  renderField('Project Name', pObj.projectName || (pObj as any).name, col1X, startY + 5.5);
  renderField('Site Location', pObj.location, col2X, startY + 5.5);
  renderField('Client / Owner', pObj.clientName || (pObj as any).client, col1X, startY + 14.5);
  renderField('Engineer / Architect', pObj.engineer, col2X, startY + 14.5);

  return startY + cardHeight + 6;
}

/**
 * Draws 2 to 4 responsive KPI cards for high-level summary metrics.
 */
export function drawKpiCards(
  doc: jsPDF,
  metrics: KpiMetric[],
  startY: number,
  theme: PdfTableTheme = 'brand'
): number {
  if (metrics.length === 0) return startY;

  const palette = PDF_THEMES[theme] || PDF_THEMES.brand;
  const cardHeight = 22;
  const gap = 3;
  const cardWidth = (CONTENT_WIDTH - gap * (metrics.length - 1)) / metrics.length;

  metrics.forEach((metric, idx) => {
    const cardX = MARGIN + idx * (cardWidth + gap);

    // Card Background
    if (metric.highlight) {
      doc.setFillColor(palette.totalsBg[0], palette.totalsBg[1], palette.totalsBg[2]);
      doc.setDrawColor(palette.headerBg[0], palette.headerBg[1], palette.headerBg[2]);
      doc.setLineWidth(0.4);
    } else {
      doc.setFillColor(palette.zebraBg[0], palette.zebraBg[1], palette.zebraBg[2]);
      doc.setDrawColor(palette.borderColor[0], palette.borderColor[1], palette.borderColor[2]);
      doc.setLineWidth(0.2);
    }
    doc.roundedRect(cardX, startY, cardWidth, cardHeight, 2, 2, 'FD');

    // Label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(palette.textMuted[0], palette.textMuted[1], palette.textMuted[2]);
    doc.text(metric.label.toUpperCase(), cardX + 3.5, startY + 5.5);

    // Value
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(
      metric.highlight ? palette.headerBg[0] : palette.textDark[0],
      metric.highlight ? palette.headerBg[1] : palette.textDark[1],
      metric.highlight ? palette.headerBg[2] : palette.textDark[2]
    );
    const valueStr = String(metric.value);
    doc.text(valueStr, cardX + 3.5, startY + 12.5);

    // Subtext
    if (metric.subtext) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(palette.textMuted[0], palette.textMuted[1], palette.textMuted[2]);
      doc.text(metric.subtext, cardX + 3.5, startY + 18);
    }
  });

  return startY + cardHeight + 6;
}

/**
 * Draws a section header with an optional pill badge and divider line.
 */
export function drawSectionHeader(
  doc: jsPDF,
  title: string,
  startY: number,
  theme: PdfTableTheme = 'brand',
  badge?: string
): number {
  const palette = PDF_THEMES[theme] || PDF_THEMES.brand;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(palette.textDark[0], palette.textDark[1], palette.textDark[2]);
  doc.text(title.toUpperCase(), MARGIN, startY);

  if (badge) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    const titleWidth = doc.getTextWidth(title.toUpperCase());
    const badgeW = doc.getTextWidth(badge) + 4;
    const badgeX = MARGIN + titleWidth + 4;
    doc.setFillColor(palette.totalsBg[0], palette.totalsBg[1], palette.totalsBg[2]);
    doc.roundedRect(badgeX, startY - 3.2, badgeW, 4.5, 1, 1, 'F');
    doc.setTextColor(palette.headerBg[0], palette.headerBg[1], palette.headerBg[2]);
    doc.text(badge, badgeX + 2, startY);
  }

  doc.setDrawColor(palette.borderColor[0], palette.borderColor[1], palette.borderColor[2]);
  doc.setLineWidth(0.2);
  doc.line(MARGIN, startY + 2.5, PAGE_WIDTH - MARGIN, startY + 2.5);

  return startY + 6;
}

/**
 * Draws key-value parameter specifications in a compact 2 or 3 column grid.
 */
export function drawKeyValueSection(
  doc: jsPDF,
  title: string,
  items: Array<{ label: string; value: string }>,
  startY: number,
  theme: PdfTableTheme = 'brand',
  columns: 2 | 3 = 2
): number {
  if (items.length === 0) return startY;

  let currentY = drawSectionHeader(doc, title, startY, theme);
  const palette = PDF_THEMES[theme] || PDF_THEMES.brand;
  const colWidth = CONTENT_WIDTH / columns;
  const rowHeight = 6.5;

  items.forEach((item, idx) => {
    const colIdx = idx % columns;
    const rowIdx = Math.floor(idx / columns);
    const itemX = MARGIN + colIdx * colWidth;
    const itemY = currentY + rowIdx * rowHeight;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(palette.textMuted[0], palette.textMuted[1], palette.textMuted[2]);
    doc.text(`${item.label}:`, itemX, itemY);

    const labelWidth = doc.getTextWidth(`${item.label}: `);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(palette.textDark[0], palette.textDark[1], palette.textDark[2]);
    doc.text(item.value, itemX + labelWidth, itemY);
  });

  const totalRows = Math.ceil(items.length / columns);
  return currentY + totalRows * rowHeight + 4;
}

/**
 * Draws technical / statutory disclaimers in a styled alert box.
 */
export function drawDisclaimers(
  doc: jsPDF,
  disclaimers: string[],
  startY: number,
  theme: PdfTableTheme = 'brand'
): number {
  if (disclaimers.length === 0) return startY;

  const palette = PDF_THEMES[theme] || PDF_THEMES.brand;
  const boxPadding = 3.5;
  const contentWidth = CONTENT_WIDTH - boxPadding * 2;

  // Measure wrapped disclaimer lines
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  const allLines: string[] = [];
  disclaimers.forEach((d) => {
    const lines = doc.splitTextToSize(`• ${d}`, contentWidth);
    allLines.push(...lines);
  });

  const lineHeight = 3.2;
  const boxHeight = boxPadding * 2 + 4 + allLines.length * lineHeight;

  // Box background & border
  doc.setFillColor(palette.zebraBg[0], palette.zebraBg[1], palette.zebraBg[2]);
  doc.setDrawColor(palette.borderColor[0], palette.borderColor[1], palette.borderColor[2]);
  doc.setLineWidth(0.2);
  doc.roundedRect(MARGIN, startY, CONTENT_WIDTH, boxHeight, 1.5, 1.5, 'FD');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(palette.textDark[0], palette.textDark[1], palette.textDark[2]);
  doc.text('STATUTORY DISCLAIMER & TECHNICAL COMPLIANCE NOTICE', MARGIN + boxPadding, startY + 4.5);

  // Bullets
  let textY = startY + 8.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(palette.textMuted[0], palette.textMuted[1], palette.textMuted[2]);
  allLines.forEach((line) => {
    doc.text(line, MARGIN + boxPadding, textY);
    textY += lineHeight;
  });

  return startY + boxHeight + 6;
}

/**
 * Draws 3 signoff boxes for approvals, verification, and site receiving.
 */
export function drawSignoffBlock(
  doc: jsPDF,
  startY: number,
  theme: PdfTableTheme = 'brand'
): number {
  const blockHeight = 26;
  const requiredY = startY + blockHeight;

  let currentY = startY;
  if (requiredY > MAX_Y) {
    doc.addPage();
    currentY = MARGIN + 12;
  }

  const palette = PDF_THEMES[theme] || PDF_THEMES.brand;
  const gap = 4;
  const boxWidth = (CONTENT_WIDTH - gap * 2) / 3;
  const titles = [
    'PREPARED BY (SITE ENG)',
    'CHECKED & VERIFIED BY',
    'AUTHORIZED APPROVER / CLIENT',
  ];

  titles.forEach((title, idx) => {
    const boxX = MARGIN + idx * (boxWidth + gap);

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(palette.borderColor[0], palette.borderColor[1], palette.borderColor[2]);
    doc.setLineWidth(0.2);
    doc.roundedRect(boxX, currentY, boxWidth, blockHeight, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(palette.textMuted[0], palette.textMuted[1], palette.textMuted[2]);
    doc.text(title, boxX + 3, currentY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text('Signature: __________________', boxX + 3, currentY + 16.5);
    doc.text('Date / Stamp: _______________', boxX + 3, currentY + 22.5);
  });

  return currentY + blockHeight + 6;
}

/**
 * Two-pass runner: stamps running headers (page 2+) and running footers
 * with accurate total page count across all pages in the document.
 */
export function applyRunningHeaderAndFooter(
  doc: jsPDF,
  options: {
    title: string;
    theme?: PdfTableTheme;
    generatedBy?: string;
  }
): void {
  const { title, theme = 'brand', generatedBy = 'Toolique India (toolique.com)' } = options;
  const palette = PDF_THEMES[theme] || PDF_THEMES.brand;
  const totalPages = doc.getNumberOfPages();

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    doc.setPage(pageNum);

    // Running Header (Pages 2+)
    if (pageNum > 1) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(palette.textMuted[0], palette.textMuted[1], palette.textMuted[2]);
      doc.text(title, MARGIN, 9);
      doc.text('TOOLIQUE TECHNICAL SPECIFICATION', PAGE_WIDTH - MARGIN, 9, { align: 'right' });

      doc.setDrawColor(palette.borderColor[0], palette.borderColor[1], palette.borderColor[2]);
      doc.setLineWidth(0.2);
      doc.line(MARGIN, 11, PAGE_WIDTH - MARGIN, 11);
    }

    // Running Footer (All Pages)
    doc.setDrawColor(palette.borderColor[0], palette.borderColor[1], palette.borderColor[2]);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, FOOTER_Y - 3.5, PAGE_WIDTH - MARGIN, FOOTER_Y - 3.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(palette.textMuted[0], palette.textMuted[1], palette.textMuted[2]);
    doc.text(
      `Generated securely via ${generatedBy} • Client-Side Privacy Guaranteed`,
      MARGIN,
      FOOTER_Y
    );
    doc.text(
      `Page ${pageNum} of ${totalPages}`,
      PAGE_WIDTH - MARGIN,
      FOOTER_Y,
      { align: 'right' }
    );
  }
}

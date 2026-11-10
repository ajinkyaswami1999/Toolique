import { jsPDF } from 'jspdf';
import {
  type PdfTableTheme,
  type PdfTableColumn,
  drawTable,
} from './tableTheme';
import {
  MARGIN,
  MAX_Y,
  type ProjectDetails,
  type KpiMetric,
  drawBrandedHeader,
  drawProjectMetaCard,
  drawKpiCards,
  drawSectionHeader,
  drawKeyValueSection,
  drawDisclaimers,
  drawSignoffBlock,
  applyRunningHeaderAndFooter,
} from './brandLayout';

export interface ReportTableConfig<T = any> {
  title?: string;
  badge?: string;
  columns?: PdfTableColumn<T>[];
  headers?: string[];
  rows: T[];
  totalsRow?: Array<{ dataKey: string; value: string | number; label?: string }>;
  zebra?: boolean;
}

export interface ReportSectionConfig {
  title: string;
  badge?: string;
  content?: string;
  items?: Array<{ label: string; value: string }>;
  bullets?: string[];
}

export interface PdfReportOptions {
  title: string;
  subtitle?: string;
  category?: string;
  complianceBadge?: string;
  referenceId?: string;
  theme?: PdfTableTheme;
  project?: ProjectDetails;
  kpis?: KpiMetric[];
  summaryCards?: KpiMetric[];
  parametersTitle?: string;
  parameters?: Array<{ label: string; value: string }>;
  tables?: ReportTableConfig[];
  sections?: ReportSectionConfig[];
  disclaimers?: string[];
  includeSignoff?: boolean;
  fileName?: string;
}

/**
 * Creates a slug-friendly filename from report title and today's date.
 */
export function createReportFilename(title: string, suffix?: string): string {
  const cleanTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `${cleanTitle}_${dateStr}${suffix ? `_${suffix}` : ''}.pdf`;
}

/**
 * Master PDF report generator.
 * Coordinates branded header, project metadata, KPI cards, tables,
 * key-value specifications, disclaimers, and 2-pass running headers/footers.
 */
export function generatePdfReport(options: PdfReportOptions): jsPDF {
  const {
    title,
    subtitle,
    category,
    complianceBadge,
    referenceId,
    theme = 'brand',
    project,
    kpis,
    parametersTitle = 'Technical Specifications & Design Assumptions',
    parameters,
    tables,
    sections,
    disclaimers,
    includeSignoff = true,
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // 1. Branded Header
  let currentY = drawBrandedHeader(doc, {
    title,
    subtitle,
    category,
    complianceBadge,
    referenceId,
    theme,
  });

  // Helper for page overflow check
  const ensureSpace = (requiredMm: number): void => {
    if (currentY + requiredMm > MAX_Y) {
      doc.addPage();
      currentY = MARGIN + 12;
    }
  };

  // 2. Project Metadata Card (Optional)
  const hasProjectMeta =
    typeof project === 'string'
      ? Boolean(project.trim())
      : Boolean(project && (project.projectName || project.name || project.clientName || project.location || project.engineer));

  if (project && hasProjectMeta) {
    ensureSpace(28);
    currentY = drawProjectMetaCard(doc, project, currentY, theme);
  }

  // 3. KPI Metric Cards (Optional)
  const activeKpis = kpis || options.summaryCards;
  if (activeKpis && activeKpis.length > 0) {
    ensureSpace(28);
    currentY = drawKpiCards(doc, activeKpis, currentY, theme);
  }

  // 4. Key-Value Parameters / Specifications (Optional)
  if (parameters && parameters.length > 0) {
    ensureSpace(24);
    currentY = drawKeyValueSection(doc, parametersTitle, parameters, currentY, theme);
  }

  // 5. Data Tables (Optional)
  if (tables && tables.length > 0) {
    tables.forEach((tbl) => {
      if (tbl.title) {
        ensureSpace(16);
        currentY = drawSectionHeader(doc, tbl.title, currentY, theme, tbl.badge);
      }

      let tableCols: PdfTableColumn[] = tbl.columns || [];
      let tableRows = tbl.rows;

      if ((!tableCols || tableCols.length === 0) && tbl.headers && tbl.headers.length > 0) {
        tableCols = tbl.headers.map((h, i) => ({
          header: h,
          dataKey: `col_${i}`,
        }));
        if (Array.isArray(tbl.rows) && tbl.rows.length > 0 && Array.isArray(tbl.rows[0])) {
          tableRows = (tbl.rows as any[][]).map((rowArr) => {
            const obj: Record<string, any> = {};
            rowArr.forEach((val, i) => {
              obj[`col_${i}`] = val;
            });
            return obj;
          });
        }
      }

      currentY = drawTable(doc, {
        columns: tableCols,
        rows: tableRows,
        startY: currentY,
        theme,
        zebra: tbl.zebra !== false,
        totalsRow: tbl.totalsRow,
        onPageBreak: () => MARGIN + 12,
      });

      currentY += 6;
    });
  }

  // 6. Custom Content Sections (Optional)
  if (sections && sections.length > 0) {
    sections.forEach((sec) => {
      ensureSpace(18);
      currentY = drawSectionHeader(doc, sec.title, currentY, theme, sec.badge);

      if (sec.content) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(50, 50, 50);
        const lines = doc.splitTextToSize(sec.content, 182);
        lines.forEach((line: string) => {
          ensureSpace(5);
          doc.text(line, MARGIN, currentY);
          currentY += 4.2;
        });
        currentY += 2;
      }

      if (sec.items && sec.items.length > 0) {
        currentY = drawKeyValueSection(doc, '', sec.items, currentY, theme);
      }

      if (sec.bullets && sec.bullets.length > 0) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(50, 50, 50);
        sec.bullets.forEach((bullet) => {
          ensureSpace(5);
          const lines = doc.splitTextToSize(`• ${bullet}`, 182);
          lines.forEach((l: string) => {
            doc.text(l, MARGIN, currentY);
            currentY += 4;
          });
        });
        currentY += 2;
      }
    });
  }

  // 7. Statutory Disclaimers
  if (disclaimers && disclaimers.length > 0) {
    ensureSpace(24);
    currentY = drawDisclaimers(doc, disclaimers, currentY, theme);
  }

  // 8. Sign-off Approval Blocks
  if (includeSignoff) {
    currentY = drawSignoffBlock(doc, currentY, theme);
  }

  // 9. Running Header & Running Footer (Two-Pass Pagination)
  applyRunningHeaderAndFooter(doc, {
    title,
    theme,
  });

  return doc;
}

/**
 * Generates and immediately downloads the standardized branded PDF.
 */
export function downloadPdfReport(options: PdfReportOptions): void {
  const doc = generatePdfReport(options);
  const fileName = options.fileName || createReportFilename(options.title);
  doc.save(fileName);
}

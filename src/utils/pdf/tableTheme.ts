import { jsPDF } from 'jspdf';

export type PdfTableTheme = 'brand' | 'clean' | 'emerald' | 'amber' | 'indigo' | 'rose';
export type TableAlignment = 'left' | 'center' | 'right';

export interface ThemeColors {
  headerBg: [number, number, number];
  headerText: [number, number, number];
  textDark: [number, number, number];
  textMuted: [number, number, number];
  zebraBg: [number, number, number];
  borderColor: [number, number, number];
  totalsBg: [number, number, number];
}

export const PDF_THEMES: Record<PdfTableTheme, ThemeColors> = {
  brand: {
    headerBg: [79, 70, 229], // Indigo 600
    headerText: [255, 255, 255],
    textDark: [15, 23, 42], // Slate 900
    textMuted: [100, 116, 139], // Slate 500
    zebraBg: [248, 250, 252], // Slate 50
    borderColor: [226, 232, 240], // Slate 200
    totalsBg: [241, 245, 249], // Slate 100
  },
  clean: {
    headerBg: [51, 65, 85], // Slate 700
    headerText: [255, 255, 255],
    textDark: [15, 23, 42],
    textMuted: [100, 116, 139],
    zebraBg: [248, 250, 252],
    borderColor: [226, 232, 240],
    totalsBg: [241, 245, 249],
  },
  emerald: {
    headerBg: [5, 150, 105], // Emerald 600
    headerText: [255, 255, 255],
    textDark: [15, 23, 42],
    textMuted: [100, 116, 139],
    zebraBg: [240, 253, 244], // Emerald 50
    borderColor: [209, 250, 229], // Emerald 100
    totalsBg: [236, 253, 245],
  },
  amber: {
    headerBg: [217, 119, 6], // Amber 600
    headerText: [255, 255, 255],
    textDark: [15, 23, 42],
    textMuted: [100, 116, 139],
    zebraBg: [254, 252, 232], // Amber 50
    borderColor: [254, 243, 199], // Amber 100
    totalsBg: [254, 249, 195],
  },
  indigo: {
    headerBg: [79, 70, 229], // Indigo 600
    headerText: [255, 255, 255],
    textDark: [15, 23, 42],
    textMuted: [100, 116, 139],
    zebraBg: [238, 242, 255], // Indigo 50
    borderColor: [199, 210, 254], // Indigo 200
    totalsBg: [224, 231, 255],
  },
  rose: {
    headerBg: [225, 29, 72], // Rose 600
    headerText: [255, 255, 255],
    textDark: [15, 23, 42],
    textMuted: [100, 116, 139],
    zebraBg: [255, 241, 242], // Rose 50
    borderColor: [254, 205, 211], // Rose 200
    totalsBg: [255, 228, 230],
  },
};

export interface PdfTableColumn<T = any> {
  header: string;
  dataKey: string;
  width?: number; // width in mm; if omitted, remaining width is divided equally
  align?: TableAlignment;
  format?: (value: any, row: T, index: number) => string;
}

export interface DrawTableOptions<T = any> {
  columns: PdfTableColumn<T>[];
  rows: T[];
  startY: number;
  theme?: PdfTableTheme;
  showHeader?: boolean;
  zebra?: boolean;
  rowHeight?: number;
  headerHeight?: number;
  fontSize?: number;
  headerFontSize?: number;
  totalsRow?: Array<{ dataKey: string; value: string | number; label?: string }>;
  margin?: number;
  contentWidth?: number;
  maxY?: number;
  onPageBreak?: (doc: jsPDF, newPageNum: number) => number;
}

/**
 * Calculates absolute widths for all columns based on available contentWidth.
 */
export function resolveColumnWidths<T>(
  columns: PdfTableColumn<T>[],
  contentWidth: number
): number[] {
  let specifiedTotal = 0;
  let unspecifiedCount = 0;

  for (const col of columns) {
    if (typeof col.width === 'number' && col.width > 0) {
      specifiedTotal += col.width;
    } else {
      unspecifiedCount += 1;
    }
  }

  const remainingWidth = Math.max(0, contentWidth - specifiedTotal);
  const autoWidth = unspecifiedCount > 0 ? remainingWidth / unspecifiedCount : 0;

  return columns.map((col) => {
    if (typeof col.width === 'number' && col.width > 0) {
      return col.width;
    }
    return autoWidth;
  });
}

/**
 * Native jsPDF table renderer with multi-line auto-wrapping,
 * automatic multi-page breaks, zebra striping, and totals summary row.
 */
export function drawTable<T = any>(
  doc: jsPDF,
  options: DrawTableOptions<T>
): number {
  const {
    columns,
    rows,
    startY,
    theme = 'brand',
    showHeader = true,
    zebra = true,
    rowHeight = 7.5,
    headerHeight = 8,
    fontSize = 8,
    headerFontSize = 8,
    totalsRow,
    margin = 14,
    contentWidth = 182,
    maxY = 275,
    onPageBreak,
  } = options;

  if (columns.length === 0) return startY;

  const palette = PDF_THEMES[theme] || PDF_THEMES.brand;
  const colWidths = resolveColumnWidths(columns, contentWidth);
  const cellPadding = 2.5;

  let currentY = startY;

  // Helper: Draw header row
  const renderHeader = (y: number): number => {
    doc.setFillColor(palette.headerBg[0], palette.headerBg[1], palette.headerBg[2]);
    doc.rect(margin, y, contentWidth, headerHeight, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(headerFontSize);
    doc.setTextColor(palette.headerText[0], palette.headerText[1], palette.headerText[2]);

    let colX = margin;
    const textBaselineY = y + headerHeight / 2 + 1.2;

    columns.forEach((col, idx) => {
      const w = colWidths[idx];
      const align = col.align || 'left';
      let textX = colX + cellPadding;

      if (align === 'right') {
        textX = colX + w - cellPadding;
      } else if (align === 'center') {
        textX = colX + w / 2;
      }

      doc.text(col.header, textX, textBaselineY, { align });
      colX += w;
    });

    return y + headerHeight;
  };

  if (showHeader) {
    currentY = renderHeader(currentY);
  }

  // Draw rows
  rows.forEach((row, rowIdx) => {
    // Format cell values and calculate required wrapped text lines
    const cellLines: string[][] = [];
    let maxLines = 1;

    columns.forEach((col, colIdx) => {
      const rawVal = (row as any)[col.dataKey];
      const strVal = col.format ? col.format(rawVal, row, rowIdx) : rawVal != null ? String(rawVal) : '-';
      const availableW = Math.max(10, colWidths[colIdx] - cellPadding * 2);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(strVal, availableW);
      cellLines.push(lines);
      if (lines.length > maxLines) {
        maxLines = lines.length;
      }
    });

    const lineHeightMm = fontSize * 0.42;
    const actualRowHeight = Math.max(rowHeight, maxLines * lineHeightMm + 4);

    // Page break check
    if (currentY + actualRowHeight > maxY) {
      doc.addPage();
      const pageNum = doc.getNumberOfPages();
      currentY = onPageBreak ? onPageBreak(doc, pageNum) : margin + 10;
      if (showHeader) {
        currentY = renderHeader(currentY);
      }
    }

    // Row Background (Zebra Striping)
    if (zebra && rowIdx % 2 === 1) {
      doc.setFillColor(palette.zebraBg[0], palette.zebraBg[1], palette.zebraBg[2]);
      doc.rect(margin, currentY, contentWidth, actualRowHeight, 'F');
    }

    // Cell content rendering
    let cellX = margin;
    columns.forEach((col, colIdx) => {
      const w = colWidths[colIdx];
      const lines = cellLines[colIdx];
      const align = col.align || 'left';
      let textX = cellX + cellPadding;

      if (align === 'right') {
        textX = cellX + w - cellPadding;
      } else if (align === 'center') {
        textX = cellX + w / 2;
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(fontSize);
      doc.setTextColor(palette.textDark[0], palette.textDark[1], palette.textDark[2]);

      let lineY = currentY + 3.2;
      lines.forEach((line) => {
        doc.text(line, textX, lineY, { align });
        lineY += lineHeightMm;
      });

      cellX += w;
    });

    // Row divider line
    doc.setDrawColor(palette.borderColor[0], palette.borderColor[1], palette.borderColor[2]);
    doc.setLineWidth(0.15);
    doc.line(margin, currentY + actualRowHeight, margin + contentWidth, currentY + actualRowHeight);

    currentY += actualRowHeight;
  });

  // Totals Row
  if (totalsRow && totalsRow.length > 0) {
    const totalRowHeight = rowHeight + 1;
    if (currentY + totalRowHeight > maxY) {
      doc.addPage();
      const pageNum = doc.getNumberOfPages();
      currentY = onPageBreak ? onPageBreak(doc, pageNum) : margin + 10;
      if (showHeader) {
        currentY = renderHeader(currentY);
      }
    }

    // Totals Background
    doc.setFillColor(palette.totalsBg[0], palette.totalsBg[1], palette.totalsBg[2]);
    doc.rect(margin, currentY, contentWidth, totalRowHeight, 'F');

    // Double top line
    doc.setDrawColor(palette.headerBg[0], palette.headerBg[1], palette.headerBg[2]);
    doc.setLineWidth(0.3);
    doc.line(margin, currentY, margin + contentWidth, currentY);

    const totalsMap = new Map<string, string | number>();
    totalsRow.forEach((t) => totalsMap.set(t.dataKey, t.value));

    let colX = margin;
    columns.forEach((col, colIdx) => {
      const w = colWidths[colIdx];
      const totalVal = totalsMap.get(col.dataKey);

      if (totalVal != null) {
        const align = col.align || 'left';
        let textX = colX + cellPadding;

        if (align === 'right') {
          textX = colX + w - cellPadding;
        } else if (align === 'center') {
          textX = colX + w / 2;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(fontSize);
        doc.setTextColor(palette.textDark[0], palette.textDark[1], palette.textDark[2]);
        doc.text(String(totalVal), textX, currentY + totalRowHeight / 2 + 1.2, { align });
      }

      colX += w;
    });

    // Bottom border
    doc.setDrawColor(palette.borderColor[0], palette.borderColor[1], palette.borderColor[2]);
    doc.setLineWidth(0.2);
    doc.line(margin, currentY + totalRowHeight, margin + contentWidth, currentY + totalRowHeight);

    currentY += totalRowHeight;
  }

  return currentY;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useMemo } from 'react';
import {
  Table,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ShieldCheck,
  Check,
  FileSpreadsheet,
  Copy,
  RefreshCw,
  Eye,
  Sliders,
  Palette,
  FileCheck,
  Layers,
  Search,
  Trash2,
  Printer,
  FileDown
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import * as xlsx from 'xlsx';

export type PaperSize = 'a4' | 'letter' | 'legal' | 'a3' | 'tabloid';
export type PageOrientation = 'landscape' | 'portrait' | 'auto';
export type GridlineStyle = 'all' | 'horizontal' | 'zebra' | 'minimal';
export type FontDensity = 'compact' | 'standard' | 'large';
export type ThemePreset = 'corporate' | 'emerald' | 'indigo' | 'monochrome' | 'amber';
export type ConversionScope = 'all' | 'active' | 'custom';

export interface SheetData {
  name: string;
  rows: string[][];
  rowCount: number;
  colCount: number;
  cellCount: number;
  selected: boolean;
}

interface ThemeConfig {
  name: string;
  headerBg: [number, number, number];
  headerText: [number, number, number];
  alternateRowBg: [number, number, number];
  defaultRowBg: [number, number, number];
  borderColor: [number, number, number];
  textColor: [number, number, number];
  accentColor: [number, number, number];
  badgeBg: string;
  badgeBorder: string;
  dotColor: string;
}

const THEMES: Record<ThemePreset, ThemeConfig> = {
  corporate: {
    name: 'Executive Navy',
    headerBg: [30, 41, 59], // Slate 800
    headerText: [255, 255, 255],
    alternateRowBg: [248, 250, 252], // Slate 50
    defaultRowBg: [255, 255, 255],
    borderColor: [203, 213, 225], // Slate 300
    textColor: [15, 23, 42], // Slate 900
    accentColor: [37, 99, 235], // Blue 600
    badgeBg: 'bg-slate-900 text-white',
    badgeBorder: 'border-slate-800',
    dotColor: 'bg-slate-800'
  },
  emerald: {
    name: 'Financial Emerald',
    headerBg: [6, 95, 70], // Emerald 800
    headerText: [255, 255, 255],
    alternateRowBg: [240, 253, 244], // Emerald 50
    defaultRowBg: [255, 255, 255],
    borderColor: [167, 243, 208], // Emerald 200
    textColor: [6, 78, 59], // Emerald 900
    accentColor: [16, 185, 129], // Emerald 500
    badgeBg: 'bg-emerald-800 text-white',
    badgeBorder: 'border-emerald-700',
    dotColor: 'bg-emerald-600'
  },
  indigo: {
    name: 'Modern Tech Indigo',
    headerBg: [67, 56, 202], // Indigo 700
    headerText: [255, 255, 255],
    alternateRowBg: [245, 243, 255], // Indigo 50
    defaultRowBg: [255, 255, 255],
    borderColor: [224, 231, 255], // Indigo 200
    textColor: [30, 27, 75], // Indigo 950
    accentColor: [99, 102, 241], // Indigo 500
    badgeBg: 'bg-indigo-700 text-white',
    badgeBorder: 'border-indigo-600',
    dotColor: 'bg-indigo-600'
  },
  monochrome: {
    name: 'Minimal Monochrome',
    headerBg: [17, 24, 39], // Gray 900
    headerText: [255, 255, 255],
    alternateRowBg: [249, 250, 251], // Gray 50
    defaultRowBg: [255, 255, 255],
    borderColor: [209, 213, 219], // Gray 300
    textColor: [17, 24, 39], // Gray 900
    accentColor: [75, 85, 99], // Gray 600
    badgeBg: 'bg-zinc-900 text-white',
    badgeBorder: 'border-zinc-800',
    dotColor: 'bg-zinc-700'
  },
  amber: {
    name: 'Warm Amber Ledger',
    headerBg: [180, 83, 9], // Amber 700
    headerText: [255, 255, 255],
    alternateRowBg: [254, 243, 199], // Amber 50
    defaultRowBg: [255, 255, 255],
    borderColor: [253, 230, 138], // Amber 200
    textColor: [120, 53, 15], // Amber 900
    accentColor: [217, 119, 6], // Amber 600
    badgeBg: 'bg-amber-700 text-white',
    badgeBorder: 'border-amber-600',
    dotColor: 'bg-amber-600'
  }
};

export default function ExcelToPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [activeSheetIndex, setActiveSheetIndex] = useState<number>(0);
  const [conversionScope, setConversionScope] = useState<ConversionScope>('all');
  
  // Customization & Formatting Options
  const [paperSize, setPaperSize] = useState<PaperSize>('a4');
  const [orientation, setOrientation] = useState<PageOrientation>('landscape');
  const [theme, setTheme] = useState<ThemePreset>('corporate');
  const [fontDensity, setFontDensity] = useState<FontDensity>('standard');
  const [gridlines, setGridlines] = useState<GridlineStyle>('all');
  const [firstRowIsHeader, setFirstRowIsHeader] = useState<boolean>(true);
  const [showRowNumbers, setShowRowNumbers] = useState<boolean>(false);
  const [repeatHeaderOnEveryPage, setRepeatHeaderOnEveryPage] = useState<boolean>(true);
  const [includeDocHeader, setIncludeDocHeader] = useState<boolean>(true);
  const [customTitle, setCustomTitle] = useState<string>('');
  const [includeTimestamp, setIncludeTimestamp] = useState<boolean>(true);
  const [includePageNumbers, setIncludePageNumbers] = useState<boolean>(true);
  const [customFooter, setCustomFooter] = useState<string>('');

  // Search & Preview Filter in Grid
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewPage, setPreviewPage] = useState<number>(1);
  const rowsPerPage = 50;

  // Processing & Output
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [showPdfModal, setShowPdfModal] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load workbook from File or Blob
  const loadWorkbook = async (uploadedFile: File) => {
    setIsProcessing(true);
    setProgressStatus(`Parsing spreadsheet "${uploadedFile.name}"...`);
    setError(null);
    setOutputBlob(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    try {
      const arrayBuffer = await uploadedFile.arrayBuffer();
      const workbook = xlsx.read(arrayBuffer, { type: 'array' });

      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new Error('This Excel file does not contain any readable worksheets.');
      }

      const parsedSheets: SheetData[] = workbook.SheetNames.map((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        // Parse with raw: false to get formatted strings for dates, currency, percentages
        const rawRows: any[][] = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: '', raw: false });
        
        // Clean empty rows from end
        let lastNonEmptyRow = rawRows.length - 1;
        while (lastNonEmptyRow >= 0 && rawRows[lastNonEmptyRow].every((c: any) => String(c ?? '').trim() === '')) {
          lastNonEmptyRow--;
        }
        const trimmedRows = rawRows.slice(0, lastNonEmptyRow + 1);

        // Normalize rows to 2D string matrix
        const maxCols = Math.max(0, ...trimmedRows.map(r => r.length));
        const normalizedRows: string[][] = trimmedRows.map(r => {
          const rowArr: string[] = [];
          for (let c = 0; c < maxCols; c++) {
            rowArr.push(r[c] !== undefined && r[c] !== null ? String(r[c]).trim() : '');
          }
          return rowArr;
        });

        const cellCount = normalizedRows.reduce((acc, r) => acc + r.filter(c => c !== '').length, 0);

        return {
          name: sheetName,
          rows: normalizedRows,
          rowCount: normalizedRows.length,
          colCount: maxCols,
          cellCount,
          selected: true
        };
      });

      setFile(uploadedFile);
      setSheets(parsedSheets);
      setActiveSheetIndex(0);
      setPreviewPage(1);
      if (!customTitle) {
        setCustomTitle(uploadedFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to read spreadsheet. Ensure the file is not corrupted or password protected.');
      setFile(null);
      setSheets([]);
    } finally {
      setIsProcessing(false);
      setProgressStatus('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      const name = uploadedFile.name.toLowerCase();
      if (!name.endsWith('.xlsx') && !name.endsWith('.xls') && !name.endsWith('.csv') && !name.endsWith('.tsv') && !name.endsWith('.ods')) {
        setError('Please upload a valid spreadsheet file (.xlsx, .xls, .csv, .tsv, .ods).');
        return;
      }
      loadWorkbook(uploadedFile);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Instant Sample Financial Model Generator
  const handleLoadSample = () => {
    const wb = xlsx.utils.book_new();

    // Sheet 1: Income Statement
    const incomeStatement = [
      ['Metric / Account', 'Q1 2026 ($)', 'Q2 2026 ($)', 'Q3 2026 ($)', 'Q4 2026 ($)', 'Full Year ($)', 'YoY Growth (%)'],
      ['Gross Revenue', '1,245,000', '1,420,000', '1,680,000', '1,950,000', '6,295,000', '+28.4%'],
      ['Cost of Goods Sold (COGS)', '435,000', '495,000', '585,000', '680,000', '2,195,000', '+18.2%'],
      ['Gross Profit', '810,000', '925,000', '1,095,000', '1,270,000', '4,100,000', '+34.5%'],
      ['Research & Development', '180,000', '195,000', '210,000', '230,000', '815,000', '+12.0%'],
      ['Sales & Marketing', '240,000', '265,000', '290,000', '320,000', '1,115,000', '+22.5%'],
      ['General & Administrative', '95,000', '98,000', '102,000', '105,000', '400,000', '+4.2%'],
      ['Total Operating Expenses', '515,000', '558,000', '602,000', '655,000', '2,330,000', '+15.8%'],
      ['Operating Income (EBIT)', '295,000', '367,000', '493,000', '615,000', '1,770,000', '+71.8%'],
      ['Interest & Tax Expense', '45,000', '55,000', '74,000', '92,000', '266,000', '+68.0%'],
      ['Net Profit After Tax', '250,000', '312,000', '419,000', '523,000', '1,504,000', '+72.5%'],
      ['Net Profit Margin (%)', '20.08%', '21.97%', '24.94%', '26.82%', '23.89%', '+6.1% pts']
    ];
    const ws1 = xlsx.utils.aoa_to_sheet(incomeStatement);
    xlsx.utils.book_append_sheet(wb, ws1, 'Income Statement');

    // Sheet 2: Regional Sales
    const regionalSales = [
      ['Region', 'Territory Lead', 'Units Sold', 'Avg Price ($)', 'Target Revenue ($)', 'Actual Revenue ($)', 'Quota Attained (%)', 'Status'],
      ['North America East', 'Elena Rostova', '14,250', '85.00', '1,100,000', '1,211,250', '110.1%', 'Exceeded'],
      ['North America West', 'Marcus Vance', '18,900', '85.00', '1,500,000', '1,606,500', '107.1%', 'Exceeded'],
      ['Europe Central', 'Sophia Mueller', '11,400', '92.00', '1,000,000', '1,048,800', '104.9%', 'On Track'],
      ['United Kingdom & IE', 'Oliver Davies', '8,750', '95.00', '800,000', '831,250', '103.9%', 'On Track'],
      ['Asia Pacific (APAC)', 'Kenji Takahashi', '16,300', '78.00', '1,200,000', '1,271,400', '105.9%', 'Exceeded'],
      ['Latin America (LATAM)', 'Carlos Mendoza', '6,200', '70.00', '500,000', '434,000', '86.8%', 'Needs Focus'],
      ['Middle East & Africa', 'Amira Al-Mansoor', '4,800', '88.00', '450,000', '422,400', '93.9%', 'On Track']
    ];
    const ws2 = xlsx.utils.aoa_to_sheet(regionalSales);
    xlsx.utils.book_append_sheet(wb, ws2, 'Regional Sales');

    // Sheet 3: Staff Roster
    const staffRoster = [
      ['Emp ID', 'Full Name', 'Department', 'Role Title', 'Location', 'Tenure (Yrs)', 'Status'],
      ['EMP-1001', 'Sarah Jenkins', 'Executive', 'Chief Executive Officer', 'New York, US', '5.2', 'Active'],
      ['EMP-1002', 'David Chen', 'Engineering', 'VP of Engineering', 'San Francisco, US', '4.1', 'Active'],
      ['EMP-1003', 'Priya Sharma', 'Product', 'Head of Product Design', 'Bengaluru, IN', '3.5', 'Active'],
      ['EMP-1004', 'Liam O\'Connor', 'Sales', 'Global Sales Director', 'London, UK', '2.8', 'Active'],
      ['EMP-1005', 'Hannah Schmidt', 'Finance', 'Financial Controller', 'Berlin, DE', '3.9', 'Active'],
      ['EMP-1006', 'Alexandre Dubois', 'Marketing', 'Brand Strategist', 'Paris, FR', '1.6', 'Active'],
      ['EMP-1007', 'Mei-Ling Zhou', 'Engineering', 'Staff Cloud Architect', 'Singapore, SG', '2.2', 'Active']
    ];
    const ws3 = xlsx.utils.aoa_to_sheet(staffRoster);
    xlsx.utils.book_append_sheet(wb, ws3, 'Team Roster');

    const wbout = xlsx.write(wb, { bookType: 'xlsx', type: 'array' });
    const sampleFile = new File([wbout], 'Corporate_Financial_Model_2026.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    loadWorkbook(sampleFile);
  };

  // Toggle sheet selection for custom conversion scope
  const toggleSheetSelected = (index: number) => {
    setSheets(prev => prev.map((s, i) => i === index ? { ...s, selected: !s.selected } : s));
  };

  // Active Sheet
  const activeSheet = sheets[activeSheetIndex] || null;

  // Filtered rows in active sheet preview
  const filteredRows = useMemo(() => {
    if (!activeSheet) return [];
    if (!searchQuery.trim()) return activeSheet.rows;
    const query = searchQuery.toLowerCase();
    return activeSheet.rows.filter(row =>
      row.some(cell => cell.toLowerCase().includes(query))
    );
  }, [activeSheet, searchQuery]);

  // Paginated rows for preview
  const totalPreviewPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const currentPreviewRows = useMemo(() => {
    const start = (previewPage - 1) * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, previewPage]);

  // Execute High-Fidelity PDF Generation
  const handleGeneratePdf = async () => {
    if (sheets.length === 0) return;
    setIsProcessing(true);
    setProgressStatus('Initializing PDF document layout & themes...');
    setError(null);

    try {
      // Determine which sheets to convert
      let sheetsToConvert: SheetData[] = [];
      if (conversionScope === 'all') {
        sheetsToConvert = sheets.filter(s => s.rowCount > 0);
      } else if (conversionScope === 'active') {
        if (activeSheet && activeSheet.rowCount > 0) {
          sheetsToConvert = [activeSheet];
        }
      } else {
        sheetsToConvert = sheets.filter(s => s.selected && s.rowCount > 0);
      }

      if (sheetsToConvert.length === 0) {
        throw new Error('No valid sheets selected for conversion. Please select at least one worksheet with data.');
      }

      // Paper Dimensions & Orientation
      const currentTheme = THEMES[theme];
      const fontSettings = {
        compact: { fontSize: 7, lineHeight: 9.5, padding: 3, headerFontSize: 8, minRowHeight: 14 },
        standard: { fontSize: 8.5, lineHeight: 11.5, padding: 4, headerFontSize: 9.5, minRowHeight: 18 },
        large: { fontSize: 10, lineHeight: 13.5, padding: 5, headerFontSize: 11, minRowHeight: 22 }
      }[fontDensity];

      // Auto orientation logic: if max cols > 7, default landscape, else portrait
      let resolvedOrientation: 'p' | 'l' = 'l';
      if (orientation === 'landscape') resolvedOrientation = 'l';
      else if (orientation === 'portrait') resolvedOrientation = 'p';
      else {
        const maxColsOverall = Math.max(...sheetsToConvert.map(s => s.colCount));
        resolvedOrientation = maxColsOverall > 6 ? 'l' : 'p';
      }

      const doc = new jsPDF({
        orientation: resolvedOrientation,
        unit: 'pt',
        format: paperSize
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 28;
      const docHeaderHeight = includeDocHeader ? 32 : 0;
      const footerHeight = (includePageNumbers || customFooter) ? 26 : 10;
      const maxCursorY = pageHeight - margin - footerHeight;

      let isFirstPage = true;

      sheetsToConvert.forEach((sheet, sheetIdx) => {
        if (!isFirstPage) {
          doc.addPage();
        }
        isFirstPage = false;

        const rows = sheet.rows;
        if (rows.length === 0) return;

        const maxCols = sheet.colCount;
        const availableWidth = pageWidth - (margin * 2);
        
        // Determine column widths based on content density
        const rowNumColWidth = showRowNumbers ? 28 : 0;
        const widthForCols = availableWidth - rowNumColWidth;

        // Sample up to 100 rows to calculate weight per column
        const colWeights: number[] = new Array(maxCols).fill(10);
        const sampleRows = rows.slice(0, 100);
        for (let c = 0; c < maxCols; c++) {
          let maxLen = 4;
          sampleRows.forEach(r => {
            const val = r[c] ?? '';
            if (val.length > maxLen) maxLen = val.length;
          });
          // clamp weight between 8 and 50
          colWeights[c] = Math.max(8, Math.min(50, maxLen));
        }

        const totalWeight = colWeights.reduce((a, b) => a + b, 0) || 1;
        const colWidths = colWeights.map(w => (w / totalWeight) * widthForCols);

        let cursorY = margin + docHeaderHeight;

        // Draw Sheet Section Title Header
        doc.setFillColor(currentTheme.alternateRowBg[0], currentTheme.alternateRowBg[1], currentTheme.alternateRowBg[2]);
        doc.setDrawColor(currentTheme.borderColor[0], currentTheme.borderColor[1], currentTheme.borderColor[2]);
        doc.roundedRect(margin, cursorY, availableWidth, 22, 3, 3, 'FD');

        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(currentTheme.headerBg[0], currentTheme.headerBg[1], currentTheme.headerBg[2]);
        doc.text(`Sheet ${sheetIdx + 1}: ${sheet.name}`, margin + 8, cursorY + 15);

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.text(`${sheet.rowCount} rows x ${sheet.colCount} columns`, margin + availableWidth - 8, cursorY + 15, { align: 'right' });

        cursorY += 28;

        // Helper to render table header row
        const renderHeaderRow = (headerData: string[]) => {
          doc.setFont('Helvetica', 'bold');
          doc.setFontSize(fontSettings.headerFontSize);
          doc.setFillColor(currentTheme.headerBg[0], currentTheme.headerBg[1], currentTheme.headerBg[2]);
          doc.setTextColor(currentTheme.headerText[0], currentTheme.headerText[1], currentTheme.headerText[2]);

          let startX = margin;

          if (showRowNumbers) {
            doc.rect(startX, cursorY, rowNumColWidth, fontSettings.minRowHeight, 'F');
            doc.setDrawColor(currentTheme.borderColor[0], currentTheme.borderColor[1], currentTheme.borderColor[2]);
            if (gridlines === 'all') doc.rect(startX, cursorY, rowNumColWidth, fontSettings.minRowHeight, 'S');
            doc.text('#', startX + rowNumColWidth / 2, cursorY + fontSettings.minRowHeight - fontSettings.padding - 1, { align: 'center' });
            startX += rowNumColWidth;
          }

          for (let c = 0; c < maxCols; c++) {
            const colW = colWidths[c];
            doc.rect(startX, cursorY, colW, fontSettings.minRowHeight, 'F');
            if (gridlines === 'all') {
              doc.setDrawColor(currentTheme.borderColor[0], currentTheme.borderColor[1], currentTheme.borderColor[2]);
              doc.rect(startX, cursorY, colW, fontSettings.minRowHeight, 'S');
            }
            const cellTitle = firstRowIsHeader && headerData[c] !== undefined ? headerData[c] : String.fromCharCode(65 + (c % 26));
            const clipped = doc.splitTextToSize(cellTitle, colW - (fontSettings.padding * 2))[0] || '';
            doc.text(clipped, startX + fontSettings.padding, cursorY + fontSettings.minRowHeight - fontSettings.padding - 1);
            startX += colW;
          }

          cursorY += fontSettings.minRowHeight;
        };

        const headerData = firstRowIsHeader ? rows[0] : [];
        renderHeaderRow(headerData);

        const dataRows = firstRowIsHeader ? rows.slice(1) : rows;

        dataRows.forEach((row, rIdx) => {
          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(fontSettings.fontSize);

          // Calculate wrapped lines per cell to find dynamic row height
          const cellWrappedLines: string[][] = [];
          let maxLinesInRow = 1;

          for (let c = 0; c < maxCols; c++) {
            const cellVal = row[c] ?? '';
            const colW = colWidths[c];
            const lines = doc.splitTextToSize(cellVal, colW - (fontSettings.padding * 2));
            const safeLines = lines.length > 0 ? lines : [''];
            cellWrappedLines.push(safeLines);
            if (safeLines.length > maxLinesInRow) {
              maxLinesInRow = safeLines.length;
            }
          }

          // Cap max lines to prevent absurd overflow on a single giant cell
          const cappedLines = Math.min(6, maxLinesInRow);
          const computedRowHeight = Math.max(fontSettings.minRowHeight, cappedLines * fontSettings.lineHeight + (fontSettings.padding * 2));

          // Check for Page Overflow
          if (cursorY + computedRowHeight > maxCursorY) {
            doc.addPage();
            cursorY = margin + (includeDocHeader ? 24 : 10);
            
            // Re-render sheet header or repeating table header
            if (repeatHeaderOnEveryPage) {
              doc.setFont('Helvetica', 'bold');
              doc.setFontSize(8.5);
              doc.setTextColor(currentTheme.headerBg[0], currentTheme.headerBg[1], currentTheme.headerBg[2]);
              doc.text(`${sheet.name} (Continued)`, margin, cursorY - 6);

              renderHeaderRow(headerData);
            }
          }

          const isAlternate = rIdx % 2 === 1;
          const rowBg = isAlternate ? currentTheme.alternateRowBg : currentTheme.defaultRowBg;

          let startX = margin;

          // Draw Row Number Index if enabled
          if (showRowNumbers) {
            doc.setFillColor(rowBg[0], rowBg[1], rowBg[2]);
            doc.rect(startX, cursorY, rowNumColWidth, computedRowHeight, 'F');
            doc.setDrawColor(currentTheme.borderColor[0], currentTheme.borderColor[1], currentTheme.borderColor[2]);
            if (gridlines === 'all') doc.rect(startX, cursorY, rowNumColWidth, computedRowHeight, 'S');

            doc.setTextColor(140, 140, 140);
            doc.text(String(rIdx + 1), startX + rowNumColWidth / 2, cursorY + fontSettings.padding + fontSettings.lineHeight - 2, { align: 'center' });
            startX += rowNumColWidth;
          }

          // Draw Data Cells
          for (let c = 0; c < maxCols; c++) {
            const colW = colWidths[c];
            const lines = cellWrappedLines[c] || [''];

            // Fill background
            doc.setFillColor(rowBg[0], rowBg[1], rowBg[2]);
            doc.rect(startX, cursorY, colW, computedRowHeight, 'F');

            // Draw Borders
            doc.setDrawColor(currentTheme.borderColor[0], currentTheme.borderColor[1], currentTheme.borderColor[2]);
            if (gridlines === 'all') {
              doc.rect(startX, cursorY, colW, computedRowHeight, 'S');
            } else if (gridlines === 'horizontal') {
              doc.line(startX, cursorY + computedRowHeight, startX + colW, cursorY + computedRowHeight);
            }

            // Draw Text Lines
            doc.setTextColor(currentTheme.textColor[0], currentTheme.textColor[1], currentTheme.textColor[2]);
            lines.slice(0, cappedLines).forEach((line, lIdx) => {
              doc.text(line, startX + fontSettings.padding, cursorY + fontSettings.padding + (lIdx + 0.8) * fontSettings.lineHeight);
            });

            startX += colW;
          }

          cursorY += computedRowHeight;
        });
      });

      // Two-pass Header & Footer Decoration
      const totalPages = doc.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);

        // Document Running Header
        if (includeDocHeader) {
          doc.setFont('Helvetica', 'bold');
          doc.setFontSize(9.5);
          doc.setTextColor(currentTheme.headerBg[0], currentTheme.headerBg[1], currentTheme.headerBg[2]);
          const docTitle = customTitle.trim() || (file ? file.name.replace(/\.[^/.]+$/, '') : 'Spreadsheet Document');
          doc.text(docTitle, margin, margin - 10);

          if (includeTimestamp) {
            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(7.5);
            doc.setTextColor(130, 130, 130);
            const dateStr = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
            doc.text(`Generated: ${dateStr}`, pageWidth - margin, margin - 10, { align: 'right' });
          }

          doc.setDrawColor(220, 225, 230);
          doc.line(margin, margin - 4, pageWidth - margin, margin - 4);
        }

        // Running Footer & Page Number
        if (includePageNumbers || customFooter.trim()) {
          doc.setDrawColor(220, 225, 230);
          doc.line(margin, pageHeight - margin + 8, pageWidth - margin, pageHeight - margin + 8);

          if (customFooter.trim()) {
            doc.setFont('Helvetica', 'italic');
            doc.setFontSize(7.5);
            doc.setTextColor(130, 130, 130);
            doc.text(customFooter.trim(), margin, pageHeight - margin + 18);
          }

          if (includePageNumbers) {
            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(7.5);
            doc.setTextColor(120, 120, 120);
            doc.text(`Page ${p} of ${totalPages}`, pageWidth - margin, pageHeight - margin + 18, { align: 'right' });
          }
        }
      }

      const pdfBlob = doc.output('blob');
      setOutputBlob(pdfBlob);
      const url = URL.createObjectURL(pdfBlob);
      setPreviewUrl(url);
      setShowPdfModal(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during PDF conversion. Please check your data formatting.');
    } finally {
      setIsProcessing(false);
      setProgressStatus('');
    }
  };

  const handleDownloadPdf = () => {
    if (!outputBlob || !file) return;
    const url = URL.createObjectURL(outputBlob);
    const link = document.createElement('a');
    link.href = url;
    const baseName = customTitle ? customTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase() : file.name.replace(/\.[^/.]+$/, '');
    link.download = `${baseName}_converted.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    if (!activeSheet) return;
    const csvContent = activeSheet.rows
      .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeSheet.name.replace(/[^a-z0-9]/gi, '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyManifest = () => {
    if (!file) return;
    const manifest = [
      `=== EXCEL TO PDF CONVERSION REPORT ===`,
      `File Name: ${file.name}`,
      `File Size: ${(file.size / 1024).toFixed(1)} KB`,
      `Total Worksheets: ${sheets.length}`,
      `Sheets:`,
      ...sheets.map((s, idx) => `  [${idx + 1}] ${s.name} (${s.rowCount} rows x ${s.colCount} cols, ${s.cellCount} cells)`),
      `Selected Theme: ${THEMES[theme].name}`,
      `Paper Size: ${paperSize.toUpperCase()}`,
      `Orientation: ${orientation.toUpperCase()}`,
      `Gridlines: ${gridlines.toUpperCase()}`,
      `Font Density: ${fontDensity.toUpperCase()}`,
      `Generated: ${new Date().toLocaleString()}`,
      `Engine: 100% In-Memory Client-Side SheetJS + jsPDF`
    ].join('\n');

    navigator.clipboard.writeText(manifest);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  const handleReset = () => {
    setFile(null);
    setSheets([]);
    setActiveSheetIndex(0);
    setOutputBlob(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setError(null);
    setShowPdfModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-left">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-indigo-500/10 border border-emerald-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-sm">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-zinc-900 dark:text-white">Excel & Spreadsheet to PDF Studio</span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                100% Client-Side
              </span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Convert XLSX, XLS, CSV & ODS workbooks to formatted PDF tables with custom themes & pagination.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!file && (
            <button
              onClick={handleLoadSample}
              className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-50 dark:hover:bg-zinc-700 transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Try Financial Model Sample</span>
            </button>
          )}

          {file && (
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold hover:bg-zinc-300 dark:hover:bg-zinc-700 transition flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>New File</span>
            </button>
          )}
        </div>
      </div>

      {/* Upload Dropzone if no file loaded */}
      {!file && (
        <div className="saas-card p-8 text-center border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-emerald-500 dark:hover:border-emerald-400 transition-colors rounded-2xl relative">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls, .csv, .tsv, .ods, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/csv"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="max-w-md mx-auto space-y-3 pointer-events-none">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Upload className="w-8 h-8" />
            </div>
            <div>
              <p className="text-base font-bold text-zinc-900 dark:text-white">
                Drag and drop your spreadsheet here, or browse
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Supports Microsoft Excel (.xlsx, .xls), CSV (.csv), TSV (.tsv), and OpenDocument (.ods)
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
              <span className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                Multi-Sheet Support
              </span>
              <span className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                Zero Cloud Uploads
              </span>
              <span className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                Custom Styling & Auto-Wrap
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Studio Workspace if file loaded */}
      {file && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Sheet Preview & Inspection (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* File Info Bar */}
            <div className="saas-card p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{file.name}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {(file.size / 1024).toFixed(1)} KB &bull; {sheets.length} Worksheet{sheets.length > 1 ? 's' : ''} &bull; {sheets.reduce((a, s) => a + s.rowCount, 0)} Total Rows
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleExportCsv}
                  title="Export active sheet as CSV"
                  className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <FileDown className="w-4 h-4" />
                  <span className="hidden sm:inline">CSV</span>
                </button>
                <button
                  onClick={handleCopyManifest}
                  title="Copy Workbook Manifest"
                  className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copiedReport ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleReset}
                  title="Remove File"
                  className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sheet Tabs */}
            <div className="saas-card p-3">
              <div className="flex items-center justify-between gap-2 mb-2 px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  Worksheets ({sheets.length})
                </span>
                {conversionScope === 'custom' && (
                  <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                    {sheets.filter(s => s.selected).length} sheets selected for PDF
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {sheets.map((s, idx) => (
                  <div
                    key={s.name + idx}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer border ${
                      activeSheetIndex === idx
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-emerald-500/50'
                    }`}
                    onClick={() => {
                      setActiveSheetIndex(idx);
                      setPreviewPage(1);
                    }}
                  >
                    {conversionScope === 'custom' && (
                      <input
                        type="checkbox"
                        checked={s.selected}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleSheetSelected(idx);
                        }}
                        className="rounded accent-emerald-500 cursor-pointer"
                      />
                    )}
                    <span>{s.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      activeSheetIndex === idx
                        ? 'bg-emerald-700/50 text-emerald-100'
                        : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400'
                    }`}>
                      {s.rowCount}r
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Spreadsheet Grid Preview */}
            <div className="saas-card p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Table className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold text-zinc-900 dark:text-white">
                    Sheet Preview: {activeSheet?.name}
                  </span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    ({activeSheet?.rowCount || 0} rows &bull; {activeSheet?.colCount || 0} cols)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Filter rows..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setPreviewPage(1);
                      }}
                      className="pl-8 pr-3 py-1 text-xs rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:border-emerald-500 w-36 sm:w-44"
                    />
                  </div>
                </div>
              </div>

              {/* Data Grid Table */}
              {activeSheet && activeSheet.rows.length > 0 ? (
                <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden max-h-96 overflow-y-auto">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-zinc-100 dark:bg-zinc-800/90 text-zinc-700 dark:text-zinc-300 font-bold sticky top-0 z-10 border-b border-zinc-200 dark:border-zinc-700">
                        <tr>
                          <th className="p-2 w-10 text-center text-zinc-400 border-r border-zinc-200 dark:border-zinc-700">#</th>
                          {Array.from({ length: activeSheet.colCount }).map((_, cIdx) => (
                            <th key={cIdx} className="p-2 min-w-[120px] max-w-[220px] truncate border-r border-zinc-200 dark:border-zinc-700">
                              {firstRowIsHeader && activeSheet.rows[0] && activeSheet.rows[0][cIdx] !== undefined
                                ? activeSheet.rows[0][cIdx]
                                : String.fromCharCode(65 + (cIdx % 26))}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900/50">
                        {currentPreviewRows.map((row, rIdx) => {
                          const displayIndex = (previewPage - 1) * rowsPerPage + rIdx + 1;
                          const isHeaderRow = firstRowIsHeader && displayIndex === 1 && previewPage === 1;
                          if (isHeaderRow) return null; // Already shown in thead

                          return (
                            <tr key={rIdx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition">
                              <td className="p-2 text-center text-[10px] text-zinc-400 bg-zinc-50/50 dark:bg-zinc-800/20 font-mono border-r border-zinc-200 dark:border-zinc-800">
                                {displayIndex}
                              </td>
                              {Array.from({ length: activeSheet.colCount }).map((_, cIdx) => (
                                <td key={cIdx} className="p-2 truncate max-w-[220px] text-zinc-800 dark:text-zinc-200 border-r border-zinc-200 dark:border-zinc-800">
                                  {row[cIdx] || <span className="text-zinc-400 dark:text-zinc-600 italic">-</span>}
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-zinc-50 dark:bg-zinc-900/40 rounded-xl text-zinc-500 text-xs">
                  This worksheet does not contain any data rows.
                </div>
              )}

              {/* Grid Pagination */}
              {totalPreviewPages > 1 && (
                <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
                  <span>
                    Showing {Math.min(filteredRows.length, (previewPage - 1) * rowsPerPage + 1)} - {Math.min(filteredRows.length, previewPage * rowsPerPage)} of {filteredRows.length} rows
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPreviewPage(p => Math.max(1, p - 1))}
                      disabled={previewPage === 1}
                      className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Prev
                    </button>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300 px-2">
                      {previewPage} / {totalPreviewPages}
                    </span>
                    <button
                      onClick={() => setPreviewPage(p => Math.min(totalPreviewPages, p + 1))}
                      disabled={previewPage === totalPreviewPages}
                      className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Layout & Styling Studio Controls (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Action Bar Card */}
            <div className="saas-card p-5 space-y-4 bg-gradient-to-b from-zinc-50/50 to-white dark:from-zinc-900/80 dark:to-zinc-900">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Printer className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  PDF Export Actions
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {conversionScope === 'all' ? 'All Sheets' : conversionScope === 'active' ? 'Active Sheet' : 'Selected Sheets'}
                </span>
              </div>

              <button
                onClick={handleGeneratePdf}
                disabled={isProcessing}
                className="w-full saas-button-primary py-3.5 flex items-center justify-center gap-2 text-sm font-bold shadow-md cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    <span>{progressStatus || 'Building PDF...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4.5 h-4.5" />
                    <span>Generate & Preview PDF</span>
                  </>
                )}
              </button>

              {outputBlob && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      PDF Ready for Download
                    </span>
                    <span>{(outputBlob.size / 1024).toFixed(1)} KB</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDownloadPdf}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download PDF</span>
                    </button>
                    <button
                      onClick={() => setShowPdfModal(true)}
                      className="px-3.5 py-2.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Design Themes & Color Schemes */}
            <div className="saas-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Palette className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  PDF Design Theme
                </label>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {THEMES[theme].name}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(Object.keys(THEMES) as ThemePreset[]).map((tKey) => {
                  const t = THEMES[tKey];
                  const isSelected = theme === tKey;
                  return (
                    <button
                      key={tKey}
                      onClick={() => setTheme(tKey)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs'
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900/60'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full shrink-0 ${t.dotColor}`} />
                      <div className="min-w-0">
                        <p className={`text-xs font-bold truncate ${isSelected ? 'text-emerald-900 dark:text-emerald-300' : 'text-zinc-800 dark:text-zinc-200'}`}>
                          {t.name}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Page Layout & Geometry */}
            <div className="saas-card p-5 space-y-4">
              <label className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Page Layout & Sizing
              </label>

              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Scope */}
                <div className="space-y-1.5">
                  <span className="font-semibold text-zinc-600 dark:text-zinc-400">Conversion Scope</span>
                  <select
                    value={conversionScope}
                    onChange={(e) => setConversionScope(e.target.value as ConversionScope)}
                    className="w-full p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    <option value="all">All Worksheets</option>
                    <option value="active">Active Sheet Only</option>
                    <option value="custom">Custom Selection</option>
                  </select>
                </div>

                {/* Paper Size */}
                <div className="space-y-1.5">
                  <span className="font-semibold text-zinc-600 dark:text-zinc-400">Paper Format</span>
                  <select
                    value={paperSize}
                    onChange={(e) => setPaperSize(e.target.value as PaperSize)}
                    className="w-full p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    <option value="a4">A4 (Standard)</option>
                    <option value="letter">US Letter</option>
                    <option value="legal">US Legal</option>
                    <option value="a3">A3 (Wide Tables)</option>
                    <option value="tabloid">Tabloid (11 x 17)</option>
                  </select>
                </div>

                {/* Orientation */}
                <div className="space-y-1.5">
                  <span className="font-semibold text-zinc-600 dark:text-zinc-400">Orientation</span>
                  <select
                    value={orientation}
                    onChange={(e) => setOrientation(e.target.value as PageOrientation)}
                    className="w-full p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    <option value="landscape">Landscape (Recommended)</option>
                    <option value="portrait">Portrait</option>
                    <option value="auto">Auto-Detect</option>
                  </select>
                </div>

                {/* Density */}
                <div className="space-y-1.5">
                  <span className="font-semibold text-zinc-600 dark:text-zinc-400">Font Density</span>
                  <select
                    value={fontDensity}
                    onChange={(e) => setFontDensity(e.target.value as FontDensity)}
                    className="w-full p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    <option value="compact">Compact (7pt - Dense)</option>
                    <option value="standard">Standard (8.5pt)</option>
                    <option value="large">Large (10pt - Readable)</option>
                  </select>
                </div>
              </div>

              {/* Gridlines */}
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Table Borders & Grid</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'all', label: 'Full Grid' },
                    { id: 'horizontal', label: 'Rows Only' },
                    { id: 'zebra', label: 'Zebra Clean' }
                  ].map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setGridlines(g.id as GridlineStyle)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                        gridlines === g.id
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle Switches */}
              <div className="space-y-2.5 pt-2 border-t border-zinc-200 dark:border-zinc-800 text-xs">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-zinc-700 dark:text-zinc-300 font-medium">First row is table header</span>
                  <input
                    type="checkbox"
                    checked={firstRowIsHeader}
                    onChange={(e) => setFirstRowIsHeader(e.target.checked)}
                    className="w-4 h-4 rounded accent-emerald-600 cursor-pointer"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-zinc-700 dark:text-zinc-300 font-medium">Repeat header on every overflow page</span>
                  <input
                    type="checkbox"
                    checked={repeatHeaderOnEveryPage}
                    onChange={(e) => setRepeatHeaderOnEveryPage(e.target.checked)}
                    className="w-4 h-4 rounded accent-emerald-600 cursor-pointer"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-zinc-700 dark:text-zinc-300 font-medium">Show row numbers (# 1, 2, 3...)</span>
                  <input
                    type="checkbox"
                    checked={showRowNumbers}
                    onChange={(e) => setShowRowNumbers(e.target.checked)}
                    className="w-4 h-4 rounded accent-emerald-600 cursor-pointer"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-zinc-700 dark:text-zinc-300 font-medium">Include document header bar</span>
                  <input
                    type="checkbox"
                    checked={includeDocHeader}
                    onChange={(e) => setIncludeDocHeader(e.target.checked)}
                    className="w-4 h-4 rounded accent-emerald-600 cursor-pointer"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-zinc-700 dark:text-zinc-300 font-medium">Include generation timestamp</span>
                  <input
                    type="checkbox"
                    checked={includeTimestamp}
                    onChange={(e) => setIncludeTimestamp(e.target.checked)}
                    className="w-4 h-4 rounded accent-emerald-600 cursor-pointer"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-zinc-700 dark:text-zinc-300 font-medium">Include page numbering ("Page X of Y")</span>
                  <input
                    type="checkbox"
                    checked={includePageNumbers}
                    onChange={(e) => setIncludePageNumbers(e.target.checked)}
                    className="w-4 h-4 rounded accent-emerald-600 cursor-pointer"
                  />
                </label>
              </div>

              {/* Document Header & Footer Inputs */}
              <div className="space-y-3 pt-2 border-t border-zinc-200 dark:border-zinc-800 text-xs">
                <div className="space-y-1">
                  <span className="font-semibold text-zinc-600 dark:text-zinc-400">Custom Document Title</span>
                  <input
                    type="text"
                    placeholder="e.g. Q4 Financial Executive Summary"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <span className="font-semibold text-zinc-600 dark:text-zinc-400">Custom Footer Note</span>
                  <input
                    type="text"
                    placeholder="e.g. Confidential &bull; For Internal Management Use Only"
                    value={customFooter}
                    onChange={(e) => setCustomFooter(e.target.value)}
                    className="w-full p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Privacy & Security Guarantee Badge */}
            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-zinc-600 dark:text-zinc-400">
                <p className="font-bold text-zinc-900 dark:text-white mb-0.5">100% In-Browser Privacy</p>
                Your spreadsheets are compiled directly inside your browser memory using WebAssembly & JS. Sensitive financial numbers and payroll records never leave your device.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen PDF Preview Modal */}
      {showPdfModal && previewUrl && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4 bg-zinc-50 dark:bg-zinc-850">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-600 text-white rounded-lg">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Generated PDF Document Preview</h3>
                  <p className="text-[11px] text-zinc-500">
                    {paperSize.toUpperCase()} &bull; {orientation.toUpperCase()} &bull; {THEMES[theme].name} &bull; {outputBlob ? (outputBlob.size / 1024).toFixed(1) + ' KB' : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadPdf}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => setShowPdfModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Modal PDF Iframe */}
            <div className="flex-1 bg-zinc-100 dark:bg-zinc-950 p-2">
              <iframe
                src={previewUrl}
                title="PDF Output Preview"
                className="w-full h-full rounded-xl border border-zinc-300 dark:border-zinc-800 shadow-inner"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

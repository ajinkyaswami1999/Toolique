/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect, useCallback } from 'react';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import {
  Barcode as BarcodeIcon,
  Download,
  Copy,
  Check,
  Printer,
  Sparkles,
  Layers,
  FileSpreadsheet,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Type,
  FileText,
  Upload,
  Eye,
  Info
} from 'lucide-react';

export type BarcodeFormat =
  | 'CODE128'
  | 'CODE39'
  | 'EAN13'
  | 'EAN8'
  | 'UPC'
  | 'UPCE'
  | 'ITF14'
  | 'ITF'
  | 'MSI'
  | 'pharmacode'
  | 'codabar'
  | 'QR';

interface FormatOption {
  id: BarcodeFormat;
  name: string;
  category: 'Universal' | 'Retail' | 'Logistics' | 'Specialized' | '2D';
  description: string;
  charSet: string;
  defaultVal: string;
  samplePlaceholder: string;
}

const BARCODE_FORMATS: FormatOption[] = [
  {
    id: 'CODE128',
    name: 'Code 128 (Auto)',
    category: 'Universal',
    description: 'High-density universal standard. Encodes all 128 ASCII characters. Ideal for logistics, shipping & inventory.',
    charSet: 'All 128 ASCII characters (Letters, numbers, symbols)',
    defaultVal: 'TOOLIQUE-2026',
    samplePlaceholder: 'e.g. SHIP-IND-984210'
  },
  {
    id: 'CODE39',
    name: 'Code 39',
    category: 'Universal',
    description: 'Standard industrial & military barcode. Widely supported across legacy barcode scanners.',
    charSet: 'A-Z (uppercase), 0-9, spaces, and symbols (- . $ / + % *)',
    defaultVal: 'TOOLIQUE123',
    samplePlaceholder: 'e.g. SKU-89421-IN'
  },
  {
    id: 'EAN13',
    name: 'EAN-13 (GS1 International)',
    category: 'Retail',
    description: 'Standard 13-digit retail product barcode used across India (890 prefix), Europe, and worldwide.',
    charSet: 'Exactly 13 numeric digits (or 12 digits + auto checksum)',
    defaultVal: '8901030987654',
    samplePlaceholder: 'e.g. 8901234567897'
  },
  {
    id: 'EAN8',
    name: 'EAN-8',
    category: 'Retail',
    description: 'Compact 8-digit retail barcode for small packaging, cosmetics, and confectionery.',
    charSet: 'Exactly 8 numeric digits (or 7 digits + auto checksum)',
    defaultVal: '89012343',
    samplePlaceholder: 'e.g. 89012343'
  },
  {
    id: 'UPC',
    name: 'UPC-A',
    category: 'Retail',
    description: '12-digit standard retail barcode for North America (US & Canada).',
    charSet: 'Exactly 12 numeric digits (or 11 digits + auto checksum)',
    defaultVal: '012345678905',
    samplePlaceholder: 'e.g. 012345678905'
  },
  {
    id: 'UPCE',
    name: 'UPC-E (Zero-Suppressed)',
    category: 'Retail',
    description: '6-digit compact variation of UPC-A for small retail items in North America.',
    charSet: '6 or 8 numeric digits with specific zero-compression rules',
    defaultVal: '01234565',
    samplePlaceholder: 'e.g. 01234565'
  },
  {
    id: 'ITF14',
    name: 'ITF-14 (Shipping Container)',
    category: 'Logistics',
    description: '14-digit Interleaved 2 of 5 standard printed on corrugated master shipping cartons.',
    charSet: 'Exactly 14 numeric digits (or 13 digits + auto checksum)',
    defaultVal: '18901030987651',
    samplePlaceholder: 'e.g. 18901030987651'
  },
  {
    id: 'ITF',
    name: 'ITF (Interleaved 2 of 5)',
    category: 'Logistics',
    description: 'High-density numeric-only barcode for warehouse storage and ticket tracking.',
    charSet: 'Even number of numeric digits (0-9)',
    defaultVal: '12345678',
    samplePlaceholder: 'e.g. 98765432'
  },
  {
    id: 'MSI',
    name: 'MSI Plessey',
    category: 'Specialized',
    description: 'Continuous barcode symbology used primarily for retail shelf tagging and warehouse racks.',
    charSet: 'Numeric digits (0-9)',
    defaultVal: '1234567',
    samplePlaceholder: 'e.g. 984512'
  },
  {
    id: 'pharmacode',
    name: 'Pharmacode',
    category: 'Specialized',
    description: 'Single-track binary packaging control standard used in pharmaceutical production lines.',
    charSet: 'Single integer between 3 and 131070',
    defaultVal: '12345',
    samplePlaceholder: 'e.g. 34567'
  },
  {
    id: 'codabar',
    name: 'Codabar (USD-4)',
    category: 'Specialized',
    description: 'Self-checking barcode used in blood banks, libraries, photo labs, and air waybills.',
    charSet: 'Numbers 0-9, symbols (- $ : / . +), with start/stop chars A, B, C, or D',
    defaultVal: 'A12345678B',
    samplePlaceholder: 'e.g. A987654B'
  },
  {
    id: 'QR',
    name: 'QR Code (2D Matrix)',
    category: '2D',
    description: 'High-capacity 2D matrix barcode for URLs, text, UPI payments, and rich inventory data.',
    charSet: 'Alphanumeric, URLs, UTF-8 text, binary',
    defaultVal: 'https://toolique.in',
    samplePlaceholder: 'e.g. https://yourbrand.com/sku/123'
  }
];

const PRESETS = [
  { label: 'Retail Product SKU', format: 'CODE128', val: 'SKU-IND-98421' },
  { label: 'India GS1 EAN-13', format: 'EAN13', val: '8901030987654' },
  { label: 'USA Retail UPC-A', format: 'UPC', val: '012345678905' },
  { label: 'Outer Master Carton (ITF-14)', format: 'ITF14', val: '18901030987651' },
  { label: 'Amazon FNSKU', format: 'CODE128', val: 'X0019A87BK' },
  { label: 'Warehouse Bin Location', format: 'CODE39', val: 'LOC-A4-R09' },
  { label: 'ISBN Book Code', format: 'EAN13', val: '9789388144278' },
  { label: 'Pharma Packaging ID', format: 'pharmacode', val: '45892' }
];

const COLOR_PRESETS = [
  { name: 'Onyx Black', hex: '#000000', bg: '#ffffff' },
  { name: 'Midnight Navy', hex: '#0f172a', bg: '#ffffff' },
  { name: 'Forest Emerald', hex: '#064e3b', bg: '#ffffff' },
  { name: 'Crimson Wine', hex: '#881337', bg: '#ffffff' },
  { name: 'Royal Indigo', hex: '#312e81', bg: '#ffffff' },
  { name: 'Warm Charcoal', hex: '#27272a', bg: '#fafafa' }
];

export default function BarcodeGenerator() {
  const [activeTab, setActiveTab] = useState<'single' | 'batch' | 'sheets' | 'guide'>('single');

  // Single Mode State
  const [format, setFormat] = useState<BarcodeFormat>('CODE128');
  const [value, setValue] = useState<string>('TOOLIQUE-2026');
  const [headerText, setHeaderText] = useState<string>('TOOLIQUE INDIA');
  const [footerText, setFooterText] = useState<string>('MRP: ₹ 999.00 (Incl. Taxes)');
  const [showHeader, setShowHeader] = useState<boolean>(true);
  const [showFooter, setShowFooter] = useState<boolean>(true);

  // Customization Settings
  const [barWidth, setBarWidth] = useState<number>(2);
  const [barHeight, setBarHeight] = useState<number>(75);
  const [quietZone, setQuietZone] = useState<number>(12);
  const [lineColor, setLineColor] = useState<string>('#000000');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [displayValue, setDisplayValue] = useState<boolean>(true);
  const [fontSize, setFontSize] = useState<number>(14);
  const [fontFamily, setFontFamily] = useState<string>('monospace');
  const [textPosition, setTextPosition] = useState<'bottom' | 'top'>('bottom');
  const [textAlign, setTextAlign] = useState<'center' | 'left' | 'right'>('center');
  const [scaleDpi, setScaleDpi] = useState<number>(2); // 1 = 1x, 2 = 2x Retina, 3 = 300 DPI Print

  // Error & Status State
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  // Canvas & SVG Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Batch Mode State
  const [batchInput, setBatchInput] = useState<string>(
    'SKU-IND-1001\nSKU-IND-1002\nSKU-IND-1003\n8901030987654\nTOOLIQUE-PRO'
  );
  const [batchFormat, setBatchFormat] = useState<BarcodeFormat>('CODE128');
  const [isGeneratingBatch, setIsGeneratingBatch] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<number>(0);

  // Sheet Studio State
  const [sheetLayout, setSheetLayout] = useState<'a4-24' | 'a4-14' | 'a4-65' | 'thermal-4x6' | 'thermal-2x1'>('a4-24');
  const [sheetCopies, setSheetCopies] = useState<number>(24);
  const [sheetProductName, setSheetProductName] = useState<string>('Premium Cotton T-Shirt (M)');
  const [sheetPrice, setSheetPrice] = useState<string>('MRP: ₹ 799.00');
  const [sheetSubtext, setSheetSubtext] = useState<string>('Pkg: Oct 2026 • Made in India');

  // Checksum Calculator helper for EAN-13, EAN-8, UPC-A, ITF-14
  const calculateChecksum = (digits: string, type: 'EAN13' | 'EAN8' | 'UPC' | 'ITF14'): string => {
    const clean = digits.replace(/\D/g, '');
    if (type === 'EAN13') {
      const d12 = clean.slice(0, 12);
      if (d12.length < 12) return clean;
      let sum = 0;
      for (let i = 0; i < 12; i++) {
        const n = parseInt(d12[i], 10);
        sum += i % 2 === 0 ? n * 1 : n * 3;
      }
      const checkDigit = (10 - (sum % 10)) % 10;
      return `${d12}${checkDigit}`;
    } else if (type === 'EAN8') {
      const d7 = clean.slice(0, 7);
      if (d7.length < 7) return clean;
      let sum = 0;
      for (let i = 0; i < 7; i++) {
        const n = parseInt(d7[i], 10);
        sum += i % 2 === 0 ? n * 3 : n * 1;
      }
      const checkDigit = (10 - (sum % 10)) % 10;
      return `${d7}${checkDigit}`;
    } else if (type === 'UPC') {
      const d11 = clean.slice(0, 11);
      if (d11.length < 11) return clean;
      let sum = 0;
      for (let i = 0; i < 11; i++) {
        const n = parseInt(d11[i], 10);
        sum += i % 2 === 0 ? n * 3 : n * 1;
      }
      const checkDigit = (10 - (sum % 10)) % 10;
      return `${d11}${checkDigit}`;
    } else if (type === 'ITF14') {
      const d13 = clean.slice(0, 13);
      if (d13.length < 13) return clean;
      let sum = 0;
      for (let i = 0; i < 13; i++) {
        const n = parseInt(d13[i], 10);
        sum += i % 2 === 0 ? n * 3 : n * 1;
      }
      const checkDigit = (10 - (sum % 10)) % 10;
      return `${d13}${checkDigit}`;
    }
    return clean;
  };

  // Render Barcode Effect
  const renderBarcode = useCallback(() => {
    setErrorMsg(null);
    setIsValid(true);

    if (!value || value.trim().length === 0) {
      setErrorMsg('Please enter text or numeric data to generate barcode.');
      setIsValid(false);
      return;
    }

    if (format === 'QR') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      QRCode.toCanvas(
        canvas,
        value,
        {
          width: barHeight * 2.5,
          margin: Math.round(quietZone / 4),
          color: {
            dark: lineColor,
            light: bgColor
          },
          errorCorrectionLevel: 'M'
        },
        (err) => {
          if (err) {
            setErrorMsg(`QR Code generation error: ${err.message}`);
            setIsValid(false);
          } else {
            setIsValid(true);
          }
        }
      );
      return;
    }

    try {
      const svg = svgRef.current;
      const canvas = canvasRef.current;

      const jsOptions: JsBarcode.BaseOptions = {
        format: format === 'UPCE' ? 'UPC' : (format as any),
        width: barWidth,
        height: barHeight,
        displayValue: displayValue,
        font: fontFamily,
        textAlign: textAlign,
        textPosition: textPosition,
        fontSize: fontSize,
        lineColor: lineColor,
        background: bgColor,
        margin: quietZone,
        valid: (valid) => {
          if (!valid) {
            setIsValid(false);
            const fmtObj = BARCODE_FORMATS.find((f) => f.id === format);
            setErrorMsg(
              `Invalid format for ${fmtObj?.name || format}. Requires: ${fmtObj?.charSet || 'specific format rules'}.`
            );
          } else {
            setIsValid(true);
            setErrorMsg(null);
          }
        }
      };

      if (svg) {
        JsBarcode(svg, value, jsOptions);
      }
      if (canvas) {
        JsBarcode(canvas, value, jsOptions);
      }
    } catch (e: any) {
      setIsValid(false);
      setErrorMsg(e.message || 'Error generating barcode. Check data length & character set.');
    }
  }, [
    format,
    value,
    barWidth,
    barHeight,
    quietZone,
    lineColor,
    bgColor,
    displayValue,
    fontSize,
    fontFamily,
    textPosition,
    textAlign
  ]);

  useEffect(() => {
    renderBarcode();
  }, [renderBarcode]);

  // Generate Composite Canvas with Optional Header & Footer Label
  const getCompositeCanvas = (): HTMLCanvasElement | null => {
    const rawCanvas = canvasRef.current;
    if (!rawCanvas) return null;

    if (!showHeader && !showFooter) {
      return rawCanvas;
    }

    const compCanvas = document.createElement('canvas');
    const ctx = compCanvas.getContext('2d');
    if (!ctx) return null;

    const padY = 16;
    let extraTop = 0;
    let extraBottom = 0;

    if (showHeader && headerText.trim().length > 0) extraTop = 28;
    if (showFooter && footerText.trim().length > 0) extraBottom = 26;

    compCanvas.width = rawCanvas.width;
    compCanvas.height = rawCanvas.height + extraTop + extraBottom;

    // Background fill
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, compCanvas.width, compCanvas.height);

    // Draw Header
    if (showHeader && headerText.trim().length > 0) {
      ctx.fillStyle = lineColor;
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(headerText.toUpperCase(), compCanvas.width / 2, padY + 4);
    }

    // Draw Main Barcode
    ctx.drawImage(rawCanvas, 0, extraTop);

    // Draw Footer
    if (showFooter && footerText.trim().length > 0) {
      ctx.fillStyle = lineColor;
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(footerText, compCanvas.width / 2, compCanvas.height - 10);
    }

    return compCanvas;
  };

  // Download High-Res PNG
  const handleDownloadPNG = () => {
    const comp = getCompositeCanvas();
    if (!comp) return;

    // Scale up for high-DPI export if requested
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = comp.width * scaleDpi;
    exportCanvas.height = comp.height * scaleDpi;
    const ctx = exportCanvas.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = false;
      ctx.scale(scaleDpi, scaleDpi);
      ctx.drawImage(comp, 0, 0);
    }

    const link = document.createElement('a');
    link.download = `barcode-${format.toLowerCase()}-${value.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
  };

  // Download SVG
  const handleDownloadSVG = () => {
    const svg = svgRef.current;
    if (!svg) return;
    const serializer = new XMLSerializer();
    let svgStr = serializer.serializeToString(svg);

    // If header/footer are enabled, inject text nodes into SVG
    if ((showHeader && headerText) || (showFooter && footerText)) {
      const bbox = svg.getBBox();
      const topOffset = showHeader && headerText ? 24 : 0;
      const botOffset = showFooter && footerText ? 24 : 0;
      const newHeight = bbox.height + topOffset + botOffset;
      const width = bbox.width;

      let injectedHeader = '';
      if (showHeader && headerText) {
        injectedHeader = `<text x="${width / 2}" y="16" fill="${lineColor}" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">${headerText.toUpperCase()}</text>`;
      }
      let injectedFooter = '';
      if (showFooter && footerText) {
        injectedFooter = `<text x="${width / 2}" y="${newHeight - 8}" fill="${lineColor}" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">${footerText}</text>`;
      }

      svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${newHeight}" viewBox="0 0 ${width} ${newHeight}">
        <rect width="100%" height="100%" fill="${bgColor}"/>
        ${injectedHeader}
        <g transform="translate(0, ${topOffset})">
          ${svg.innerHTML}
        </g>
        ${injectedFooter}
      </svg>`;
    }

    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `barcode-${format.toLowerCase()}-${value.replace(/[^a-zA-Z0-9]/g, '_')}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Download JPEG
  const handleDownloadJPEG = () => {
    const comp = getCompositeCanvas();
    if (!comp) return;
    const link = document.createElement('a');
    link.download = `barcode-${format.toLowerCase()}-${value.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
    link.href = comp.toDataURL('image/jpeg', 0.95);
    link.click();
  };

  // Copy Image to Clipboard
  const handleCopyImage = async () => {
    const comp = getCompositeCanvas();
    if (!comp) return;

    comp.toBlob(async (blob) => {
      if (!blob) return;
      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob
          })
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Clipboard copy failed:', err);
      }
    });
  };

  // Print Single Barcode
  const handlePrintSingle = () => {
    const comp = getCompositeCanvas();
    if (!comp) return;
    const imgData = comp.toDataURL('image/png');
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Barcode - ${value}</title>
          <style>
            @page { margin: 10mm; }
            body {
              font-family: system-ui, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 90vh;
              margin: 0;
            }
            .label-card {
              border: 1px dashed #ccc;
              padding: 20px;
              border-radius: 8px;
              text-align: center;
              display: inline-block;
            }
            img { max-width: 100%; height: auto; }
            .info { margin-top: 8px; font-size: 11px; color: #666; font-family: monospace; }
          </style>
        </head>
        <body>
          <div class="label-card">
            <img src="${imgData}" alt="Barcode ${value}" />
            <div class="info">Format: ${format} • ${new Date().toLocaleDateString()}</div>
          </div>
          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Batch Generation Handlers
  const handleBatchDownloadZip = async () => {
    const lines = batchInput
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) return;
    setIsGeneratingBatch(true);
    setBatchProgress(0);

    const zip = new JSZip();
    const tempCanvas = document.createElement('canvas');

    for (let i = 0; i < lines.length; i++) {
      const lineVal = lines[i];
      try {
        if (batchFormat === 'QR') {
          await QRCode.toCanvas(tempCanvas, lineVal, { width: 300, margin: 2 });
        } else {
          JsBarcode(tempCanvas, lineVal, {
            format: batchFormat as any,
            width: 2,
            height: 70,
            displayValue: true,
            fontSize: 14,
            margin: 10
          });
        }
        const dataUrl = tempCanvas.toDataURL('image/png');
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
        const filename = `barcode_${i + 1}_${lineVal.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
        zip.file(filename, base64Data, { base64: true });
      } catch (err) {
        console.warn(`Failed rendering batch line: ${lineVal}`, err);
      }
      setBatchProgress(Math.round(((i + 1) / lines.length) * 100));
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `toolique-barcodes-batch-${lines.length}-items.zip`;
    link.click();
    setIsGeneratingBatch(false);
  };

  const handleBatchExportPDF = async () => {
    const lines = batchInput
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) return;
    setIsGeneratingBatch(true);

    const pdf = new jsPDF('p', 'mm', 'a4');
    const tempCanvas = document.createElement('canvas');

    let x = 15;
    let y = 15;
    const itemW = 55;
    const itemH = 35;
    const cols = 3;

    for (let i = 0; i < lines.length; i++) {
      const lineVal = lines[i];
      try {
        if (batchFormat === 'QR') {
          await QRCode.toCanvas(tempCanvas, lineVal, { width: 200, margin: 2 });
        } else {
          JsBarcode(tempCanvas, lineVal, {
            format: batchFormat as any,
            width: 2,
            height: 60,
            displayValue: true,
            fontSize: 12,
            margin: 8
          });
        }

        const imgData = tempCanvas.toDataURL('image/png');
        pdf.setDrawColor(220, 220, 220);
        pdf.roundedRect(x, y, itemW, itemH, 2, 2, 'S');
        pdf.addImage(imgData, 'PNG', x + 2.5, y + 2.5, itemW - 5, itemH - 5);

        const colIdx = i % cols;
        if (colIdx === cols - 1) {
          x = 15;
          y += itemH + 6;
          if (y > 250 && i < lines.length - 1) {
            pdf.addPage();
            y = 15;
          }
        } else {
          x += itemW + 8;
        }
      } catch (err) {
        console.warn(`Error generating PDF item ${lineVal}`, err);
      }
    }

    pdf.save(`barcodes-sheet-${lines.length}-items.pdf`);
    setIsGeneratingBatch(false);
  };

  // Sheet Studio Print Handler
  const handlePrintSheet = () => {
    const rawCanvas = canvasRef.current;
    if (!rawCanvas) return;
    const imgData = rawCanvas.toDataURL('image/png');

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let gridCss = '';
    let labelWidth = '70mm';
    let labelHeight = '37mm';

    if (sheetLayout === 'a4-24') {
      gridCss = 'display: grid; grid-template-columns: repeat(3, 1fr); gap: 2mm;';
      labelWidth = '66mm';
      labelHeight = '35mm';
    } else if (sheetLayout === 'a4-14') {
      gridCss = 'display: grid; grid-template-columns: repeat(2, 1fr); gap: 3mm;';
      labelWidth = '98mm';
      labelHeight = '38mm';
    } else if (sheetLayout === 'a4-65') {
      gridCss = 'display: grid; grid-template-columns: repeat(5, 1fr); gap: 1.5mm;';
      labelWidth = '38mm';
      labelHeight = '21mm';
    } else if (sheetLayout === 'thermal-4x6') {
      gridCss = 'display: flex; flex-direction: column; align-items: center; justify-content: center;';
      labelWidth = '98mm';
      labelHeight = '145mm';
    } else if (sheetLayout === 'thermal-2x1') {
      gridCss = 'display: flex; flex-direction: column; align-items: center; justify-content: center;';
      labelWidth = '48mm';
      labelHeight = '24mm';
    }

    const items = Array.from({ length: sheetCopies });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Label Sheet - Toolique</title>
          <style>
            @page { margin: 8mm; size: ${sheetLayout.startsWith('thermal') ? 'auto' : 'A4 portrait'}; }
            * { box-sizing: border-box; }
            body {
              font-family: system-ui, -apple-system, sans-serif;
              margin: 0;
              padding: 0;
              background: #fff;
              color: #000;
            }
            .sheet-container {
              ${gridCss}
              width: 100%;
            }
            .label-item {
              width: ${labelWidth};
              height: ${labelHeight};
              border: 1px dashed #ccc;
              border-radius: 4px;
              padding: 4px 6px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: space-between;
              text-align: center;
              page-break-inside: avoid;
            }
            .prod-title {
              font-size: 9px;
              font-weight: 800;
              text-transform: uppercase;
              line-height: 1.1;
              max-height: 20px;
              overflow: hidden;
            }
            .barcode-img {
              max-width: 95%;
              max-height: 55%;
              object-fit: contain;
            }
            .price-row {
              font-size: 8.5px;
              font-weight: bold;
              display: flex;
              justify-content: space-between;
              width: 100%;
              border-top: 1px dotted #ccc;
              padding-top: 2px;
            }
            .subtext {
              font-size: 7px;
              color: #555;
            }
          </style>
        </head>
        <body>
          <div class="sheet-container">
            ${items
              .map(
                () => `
              <div class="label-item">
                <div class="prod-title">${sheetProductName}</div>
                <img class="barcode-img" src="${imgData}" alt="barcode" />
                <div class="price-row">
                  <span>${sheetPrice}</span>
                  <span class="subtext">${sheetSubtext}</span>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const currentFormatMeta = BARCODE_FORMATS.find((f) => f.id === format) || BARCODE_FORMATS[0];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 text-left">
      {/* Privacy & Quality Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-indigo-50/60 dark:bg-indigo-950/25 border border-indigo-200/70 dark:border-indigo-800/40 rounded-2xl text-xs">
        <div className="flex items-center gap-2.5 text-indigo-950 dark:text-indigo-200">
          <BarcodeIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span>
            <strong className="font-semibold text-indigo-900 dark:text-indigo-100">Client-Side High Resolution Engine:</strong> 100% private in-browser generation supporting Code 128, Code 39, GS1 EAN-13, UPC-A, ITF-14 & QR Codes.
          </span>
        </div>
        <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-medium shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Vector SVG, High-Res PNG & Label Sheets</span>
        </div>
      </div>

      {/* Main Tab Navigation Bar */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        {[
          { id: 'single', label: 'Single Barcode Studio', icon: BarcodeIcon },
          { id: 'batch', label: 'Bulk / Batch Generator', icon: Layers },
          { id: 'sheets', label: 'Printable Label Sheets (A4 & Thermal)', icon: Printer },
          { id: 'guide', label: 'Barcode Symbology Guide', icon: BookOpen }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-850 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: SINGLE BARCODE STUDIO */}
      {activeTab === 'single' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Formats & Inputs (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Format Selection Card */}
            <div className="saas-card p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-3">
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <BarcodeIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  1. Select Barcode Symbology Format
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                  {currentFormatMeta.category}
                </span>
              </div>

              {/* Format Buttons Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
                {BARCODE_FORMATS.map((fmt) => {
                  const isSelected = format === fmt.id;
                  return (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => {
                        setFormat(fmt.id);
                        if (value === currentFormatMeta.defaultVal || value === 'TOOLIQUE-2026') {
                          setValue(fmt.defaultVal);
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-600 text-indigo-900 dark:text-indigo-100 font-bold shadow-xs'
                          : 'bg-white dark:bg-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-750 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <span className="truncate block font-bold text-[11px]">{fmt.name}</span>
                      <span className="text-[10px] text-zinc-400 font-normal mt-0.5">{fmt.category}</span>
                    </button>
                  );
                })}
              </div>

              {/* Format Description & Character Requirement Box */}
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1 text-xs">
                <p className="text-zinc-700 dark:text-zinc-300 font-medium">
                  {currentFormatMeta.description}
                </p>
                <p className="text-[11px] text-zinc-500 font-mono">
                  <strong>Supported Chars:</strong> {currentFormatMeta.charSet}
                </p>
              </div>
            </div>

            {/* Input Data & Presets Card */}
            <div className="saas-card p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-3">
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Type className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  2. Barcode Value & Data
                </h3>
                {['EAN13', 'EAN8', 'UPC', 'ITF14'].includes(format) && (
                  <button
                    type="button"
                    onClick={() => {
                      const calculated = calculateChecksum(value, format as any);
                      setValue(calculated);
                    }}
                    className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Auto-Calculate Checksum</span>
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">Barcode Text / Encoded Value</label>
                  <span className="text-zinc-400 text-[11px] font-mono">{value.length} Chars</span>
                </div>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={currentFormatMeta.samplePlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-850 text-sm font-mono text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Quick Presets */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Popular Presets</span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        setFormat(p.format as any);
                        setValue(p.val);
                      }}
                      className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-750 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium transition cursor-pointer"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Validation Warning Alert */}
              {errorMsg && (
                <div className="p-3.5 rounded-xl border bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800/40 text-rose-800 dark:text-rose-300 flex items-start gap-2.5 text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <strong className="font-bold block">Validation Warning</strong>
                    <p className="text-[11px]">{errorMsg}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Label Customization & Styling */}
            <div className="saas-card p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-3">
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  3. Visual Sizing, Colors & Label Text
                </h3>
              </div>

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                {/* Bar Width Scale */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400 font-semibold">
                    <span>Bar Width (Density)</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{barWidth}px</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={4}
                    step={1}
                    value={barWidth}
                    onChange={(e) => setBarWidth(parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                {/* Barcode Height */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400 font-semibold">
                    <span>Barcode Height</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{barHeight}px</span>
                  </div>
                  <input
                    type="range"
                    min={30}
                    max={140}
                    step={5}
                    value={barHeight}
                    onChange={(e) => setBarHeight(parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                {/* Quiet Zone Margin */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400 font-semibold">
                    <span>Quiet Zone (Margin)</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{quietZone}px</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={30}
                    step={2}
                    value={quietZone}
                    onChange={(e) => setQuietZone(parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Color Presets & Custom Pickers */}
              <div className="pt-2 border-t border-zinc-150 dark:border-zinc-800 space-y-2">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Color Themes</span>
                <div className="flex flex-wrap items-center gap-2">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => {
                        setLineColor(c.hex);
                        setBgColor(c.bg);
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-750 bg-white dark:bg-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-[11px] font-medium transition cursor-pointer"
                    >
                      <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: c.hex }} />
                      <span>{c.name}</span>
                    </button>
                  ))}
                  <div className="flex items-center gap-1.5 ml-auto text-xs">
                    <label className="text-[11px] text-zinc-500 font-medium">Custom Bar Color:</label>
                    <input
                      type="color"
                      value={lineColor}
                      onChange={(e) => setLineColor(e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Optional Header & Footer Label Text */}
              <div className="pt-2 border-t border-zinc-150 dark:border-zinc-800 space-y-3">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                  Product Label Headers & Footers (Optional)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-zinc-600 dark:text-zinc-400 font-medium">Top Header Title</label>
                      <label className="flex items-center gap-1 cursor-pointer text-[11px] text-zinc-400">
                        <input
                          type="checkbox"
                          checked={showHeader}
                          onChange={(e) => setShowHeader(e.target.checked)}
                          className="accent-indigo-600 rounded"
                        />
                        <span>Enable</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      disabled={!showHeader}
                      value={headerText}
                      onChange={(e) => setHeaderText(e.target.value)}
                      placeholder="e.g. ACME ORGANIC FARMS"
                      className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-850 disabled:opacity-50 text-xs text-zinc-900 dark:text-zinc-100"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-zinc-600 dark:text-zinc-400 font-medium">Bottom Footer / Price</label>
                      <label className="flex items-center gap-1 cursor-pointer text-[11px] text-zinc-400">
                        <input
                          type="checkbox"
                          checked={showFooter}
                          onChange={(e) => setShowFooter(e.target.checked)}
                          className="accent-indigo-600 rounded"
                        />
                        <span>Enable</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      disabled={!showFooter}
                      value={footerText}
                      onChange={(e) => setFooterText(e.target.value)}
                      placeholder="e.g. MRP: ₹ 499.00 (Incl. Taxes)"
                      className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-850 disabled:opacity-50 text-xs text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>
              </div>

              {/* Typography Details */}
              {format !== 'QR' && (
                <div className="pt-2 border-t border-zinc-150 dark:border-zinc-800 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Human Text</label>
                    <select
                      value={displayValue ? 'true' : 'false'}
                      onChange={(e) => setDisplayValue(e.target.value === 'true')}
                      className="w-full px-2 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-850 text-xs text-zinc-900 dark:text-zinc-100"
                    >
                      <option value="true">Show Text</option>
                      <option value="false">Hide Text</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Font Size</label>
                    <select
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                      className="w-full px-2 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-850 text-xs text-zinc-900 dark:text-zinc-100"
                    >
                      <option value="12">12 px</option>
                      <option value="14">14 px (Std)</option>
                      <option value="16">16 px</option>
                      <option value="18">18 px</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Font Type</label>
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-850 text-xs text-zinc-900 dark:text-zinc-100"
                    >
                      <option value="monospace">Monospace</option>
                      <option value="sans-serif">Sans-Serif</option>
                      <option value="serif">Serif</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Position</label>
                    <select
                      value={textPosition}
                      onChange={(e) => setTextPosition(e.target.value as any)}
                      className="w-full px-2 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-850 text-xs text-zinc-900 dark:text-zinc-100"
                    >
                      <option value="bottom">Below Bar</option>
                      <option value="top">Above Bar</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Align</label>
                    <select
                      value={textAlign}
                      onChange={(e) => setTextAlign(e.target.value as any)}
                      className="w-full px-2 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-850 text-xs text-zinc-900 dark:text-zinc-100"
                    >
                      <option value="center">Center</option>
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Preview & Export Hub (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Live Barcode Render Card */}
            <div className="saas-card p-6 space-y-5 bg-gradient-to-br from-zinc-900 via-zinc-950 to-indigo-950 text-white shadow-xl border border-indigo-800/40">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  Live Barcode Preview
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    isValid
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {isValid ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                  <span>{isValid ? 'Scan Ready (100%)' : 'Invalid'}</span>
                </span>
              </div>

              {/* Barcode Canvas & SVG Display Container */}
              <div
                className="p-5 rounded-2xl flex flex-col items-center justify-center min-h-[170px] overflow-x-auto shadow-inner transition-colors"
                style={{ backgroundColor: bgColor }}
              >
                {showHeader && headerText && (
                  <div
                    className="text-xs font-bold uppercase tracking-wider mb-2 font-sans"
                    style={{ color: lineColor }}
                  >
                    {headerText}
                  </div>
                )}

                {/* SVG for lossless vector rendering & Canvas for pixel extraction */}
                {format === 'QR' ? (
                  <canvas ref={canvasRef} className="max-w-full rounded" />
                ) : (
                  <>
                    <svg ref={svgRef} className="max-w-full h-auto" />
                    {/* Hidden canvas for PNG/JPEG image generation */}
                    <canvas ref={canvasRef} className="hidden" />
                  </>
                )}

                {showFooter && footerText && (
                  <div className="text-xs font-bold mt-2 font-sans" style={{ color: lineColor }}>
                    {footerText}
                  </div>
                )}
              </div>

              {/* Barcode Specs Bar */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs text-zinc-400 font-mono">
                <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-zinc-500 block">Symbology</span>
                  <span className="font-bold text-zinc-200 text-[11px] truncate block">{format}</span>
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-zinc-500 block">Bar Width</span>
                  <span className="font-bold text-zinc-200 text-[11px]">{barWidth} px</span>
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-zinc-500 block">Height</span>
                  <span className="font-bold text-zinc-200 text-[11px]">{barHeight} px</span>
                </div>
              </div>

              {/* Export DPI Multiplier Setting */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-800">
                <span className="text-zinc-400">PNG Export Quality:</span>
                <div className="flex items-center gap-1">
                  {[
                    { label: '1x (Standard)', val: 1 },
                    { label: '2x (Retina HD)', val: 2 },
                    { label: '3x (300 DPI Print)', val: 3 }
                  ].map((res) => (
                    <button
                      key={res.val}
                      type="button"
                      onClick={() => setScaleDpi(res.val)}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold cursor-pointer transition ${
                        scaleDpi === res.val
                          ? 'bg-indigo-600 text-white'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {res.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary Action Buttons */}
              <div className="space-y-2.5 pt-1">
                <button
                  onClick={handleDownloadPNG}
                  disabled={!isValid || !value}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download High-Resolution PNG</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleDownloadSVG}
                    disabled={!isValid || !value || format === 'QR'}
                    className="py-2.5 px-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 border border-zinc-700 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Download SVG</span>
                  </button>

                  <button
                    onClick={handleDownloadJPEG}
                    disabled={!isValid || !value}
                    className="py-2.5 px-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 border border-zinc-700 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Download JPEG</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleCopyImage}
                    disabled={!isValid || !value}
                    className="py-2.5 px-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 border border-zinc-700 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied PNG!' : 'Copy to Clipboard'}</span>
                  </button>

                  <button
                    onClick={handlePrintSingle}
                    disabled={!isValid || !value}
                    className="py-2.5 px-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 border border-zinc-700 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Print Label</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Scanner Verification Tips */}
            <div className="saas-card p-4 space-y-2 text-xs">
              <span className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                Barcode Scanner Best Practices
              </span>
              <ul className="text-zinc-600 dark:text-zinc-400 space-y-1 text-[11px] list-disc list-inside">
                <li>Maintain a minimum <strong>10x quiet zone margin</strong> on left and right for 100% laser scan success.</li>
                <li>Avoid red or yellow background colors as red laser scanners cannot detect contrast on warm hues.</li>
                <li>For thermal label printers (Zebra, TSC), use <strong>203 DPI (2px bar width)</strong> or <strong>300 DPI (3px bar width)</strong>.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BULK / BATCH GENERATOR */}
      {activeTab === 'batch' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Batch Input Form (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="saas-card p-6 space-y-4">
                <div className="border-b border-zinc-150 dark:border-zinc-800 pb-3">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Batch Barcode Generator
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Paste a list of SKUs or barcodes (one per line) or upload a CSV file.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Select Symbology Format</label>
                  <select
                    value={batchFormat}
                    onChange={(e) => setBatchFormat(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-850 text-xs font-semibold text-zinc-900 dark:text-zinc-100"
                  >
                    {BARCODE_FORMATS.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-zinc-700 dark:text-zinc-300">
                      SKU / Barcode List (One per line)
                    </label>
                    <span className="text-[11px] text-zinc-400 font-mono">
                      {batchInput.split('\n').filter((l) => l.trim().length > 0).length} Items
                    </span>
                  </div>
                  <textarea
                    rows={8}
                    value={batchInput}
                    onChange={(e) => setBatchInput(e.target.value)}
                    placeholder="Enter one barcode per line&#10;SKU-1001&#10;SKU-1002&#10;8901030987654"
                    className="w-full p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-850 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                {/* CSV Upload */}
                <div className="flex items-center gap-2">
                  <label className="flex-1 py-2 px-3 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition cursor-pointer text-xs font-semibold text-center text-zinc-600 dark:text-zinc-300 flex items-center justify-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Upload CSV / TXT File</span>
                    <input
                      type="file"
                      accept=".csv,.txt"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const content = event.target?.result as string;
                          if (content) {
                            setBatchInput(content.trim());
                          }
                        };
                        reader.readAsText(file);
                      }}
                    />
                  </label>
                </div>

                {/* Batch Export Actions */}
                <div className="space-y-2 pt-2 border-t border-zinc-150 dark:border-zinc-800">
                  <button
                    onClick={handleBatchDownloadZip}
                    disabled={isGeneratingBatch || batchInput.trim().length === 0}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isGeneratingBatch ? `Generating (${batchProgress}%)...` : 'Download All as ZIP (.png)'}</span>
                  </button>

                  <button
                    onClick={handleBatchExportPDF}
                    disabled={isGeneratingBatch || batchInput.trim().length === 0}
                    className="w-full py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-750 disabled:opacity-50 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border border-zinc-300 dark:border-zinc-700 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-indigo-500" />
                    <span>Export Multi-Page PDF Sheet</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Batch Preview Grid (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="saas-card p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-3">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Eye className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Batch Live Preview Grid
                  </h3>
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    Format: {batchFormat}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[520px] overflow-y-auto p-1">
                  {batchInput
                    .split('\n')
                    .map((l) => l.trim())
                    .filter((l) => l.length > 0)
                    .map((item, idx) => (
                      <div
                        key={`${item}-${idx}`}
                        className="p-3 rounded-xl bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750 flex flex-col items-center justify-between gap-2 shadow-xs"
                      >
                        <span className="text-[10px] font-mono font-bold text-zinc-500 truncate w-full text-center">
                          #{idx + 1}: {item}
                        </span>
                        <div className="p-2 bg-white rounded border border-zinc-100 dark:border-zinc-800 flex items-center justify-center min-h-[70px] w-full overflow-hidden">
                          <BatchBarcodeItem value={item} format={batchFormat} />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PRINTABLE LABEL SHEET STUDIO */}
      {activeTab === 'sheets' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sheet Configurations (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="saas-card p-6 space-y-4">
                <div className="border-b border-zinc-150 dark:border-zinc-800 pb-3">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Printer className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Label Sheet Configurator
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Format your barcodes for standard A4 sticker paper or thermal label rolls.
                  </p>
                </div>

                {/* Layout Type Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Sticker Sheet Layout</label>
                  <select
                    value={sheetLayout}
                    onChange={(e) => {
                      const lay = e.target.value as any;
                      setSheetLayout(lay);
                      if (lay === 'a4-24') setSheetCopies(24);
                      else if (lay === 'a4-14') setSheetCopies(14);
                      else if (lay === 'a4-65') setSheetCopies(65);
                      else if (lay === 'thermal-4x6') setSheetCopies(1);
                      else if (lay === 'thermal-2x1') setSheetCopies(10);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-850 text-xs font-semibold text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="a4-24">A4 Sheet • 24 Labels (3 cols × 8 rows • 70 × 37 mm)</option>
                    <option value="a4-14">A4 Sheet • 14 Labels (2 cols × 7 rows • 105 × 42 mm)</option>
                    <option value="a4-65">A4 Sheet • 65 Small Stickers (5 cols × 13 rows • 38 × 21 mm)</option>
                    <option value="thermal-4x6">Thermal Shipping Label (4" × 6" / 100 × 150 mm)</option>
                    <option value="thermal-2x1">Thermal Product Roll (2" × 1" / 50 × 25 mm)</option>
                  </select>
                </div>

                {/* Copies Counter */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400 font-semibold">
                    <span>Number of Label Copies</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{sheetCopies} Labels</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={sheetLayout === 'a4-65' ? 130 : 96}
                    value={sheetCopies}
                    onChange={(e) => setSheetCopies(parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                {/* Label Metadata Fields */}
                <div className="space-y-3 pt-2 border-t border-zinc-150 dark:border-zinc-800 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-600 dark:text-zinc-400">Product Title / Header</label>
                    <input
                      type="text"
                      value={sheetProductName}
                      onChange={(e) => setSheetProductName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-850 text-xs font-medium text-zinc-900 dark:text-zinc-100"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-600 dark:text-zinc-400">Barcode Value / SKU</label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-850 text-xs font-mono text-zinc-900 dark:text-zinc-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-600 dark:text-zinc-400">Price / MRP</label>
                      <input
                        type="text"
                        value={sheetPrice}
                        onChange={(e) => setSheetPrice(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-850 text-xs text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-zinc-600 dark:text-zinc-400">Batch / Subtext</label>
                      <input
                        type="text"
                        value={sheetSubtext}
                        onChange={(e) => setSheetSubtext(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-850 text-xs text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Print Sheet Action */}
                <button
                  onClick={handlePrintSheet}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Label Sheet ({sheetCopies} Copies)</span>
                </button>
              </div>
            </div>

            {/* Sheet Preview (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="saas-card p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-3">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Eye className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Sheet Layout Sample Preview
                  </h3>
                  <span className="text-xs font-mono font-bold text-zinc-500">
                    Showing 6 of {sheetCopies} labels
                  </span>
                </div>

                <div className="p-4 bg-zinc-100 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Array.from({ length: Math.min(6, sheetCopies) }).map((_, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750 text-center space-y-1.5 shadow-xs"
                      >
                        <p className="text-[10px] font-bold text-zinc-800 dark:text-zinc-200 uppercase truncate">
                          {sheetProductName}
                        </p>
                        <div className="p-1 bg-white rounded border border-zinc-100 flex items-center justify-center">
                          <BatchBarcodeItem value={value} format={format} />
                        </div>
                        <div className="flex items-center justify-between text-[9px] font-bold text-zinc-600 dark:text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                          <span>{sheetPrice}</span>
                          <span className="font-normal text-zinc-400">{sheetSubtext}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BARCODE STANDARDS & GS1 GUIDE */}
      {activeTab === 'guide' && (
        <div className="space-y-6">
          <div className="saas-card p-6 space-y-6">
            <div className="border-b border-zinc-150 dark:border-zinc-800 pb-4">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Barcode Symbologies, GS1 India & Retail Specifications</span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Comprehensive engineering guide comparing 1D and 2D barcode formats for manufacturing, warehousing, and POS retail checkouts.
              </p>
            </div>

            {/* Symbology Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                <thead className="bg-zinc-50 dark:bg-zinc-850 text-zinc-700 dark:text-zinc-300 font-bold border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="p-3">Barcode Standard</th>
                    <th className="p-3">Character Capacity</th>
                    <th className="p-3">Primary Industry</th>
                    <th className="p-3">Check Digit</th>
                    <th className="p-3">Scanner Compatibility</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-600 dark:text-zinc-400">
                  <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-850/40">
                    <td className="p-3 font-bold text-zinc-900 dark:text-white">Code 128</td>
                    <td className="p-3">All 128 ASCII Chars</td>
                    <td className="p-3">Logistics, Shipping, B2B</td>
                    <td className="p-3">Automatic Modulo-103</td>
                    <td className="p-3 text-emerald-600 dark:text-emerald-400 font-semibold">100% Universal</td>
                  </tr>
                  <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-850/40">
                    <td className="p-3 font-bold text-zinc-900 dark:text-white">Code 39</td>
                    <td className="p-3">Alphanumeric (43 Chars)</td>
                    <td className="p-3">Automotive, Defense, Industrial</td>
                    <td className="p-3">Optional Modulo-43</td>
                    <td className="p-3 text-emerald-600 dark:text-emerald-400 font-semibold">100% Universal</td>
                  </tr>
                  <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-850/40">
                    <td className="p-3 font-bold text-zinc-900 dark:text-white">EAN-13 (GS1)</td>
                    <td className="p-3">13 Numeric Digits</td>
                    <td className="p-3">Retail POS (India & Worldwide)</td>
                    <td className="p-3">Mandatory Modulo-10</td>
                    <td className="p-3 text-emerald-600 dark:text-emerald-400 font-semibold">All Retail POS Scanners</td>
                  </tr>
                  <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-850/40">
                    <td className="p-3 font-bold text-zinc-900 dark:text-white">UPC-A</td>
                    <td className="p-3">12 Numeric Digits</td>
                    <td className="p-3">Retail POS (USA & Canada)</td>
                    <td className="p-3">Mandatory Modulo-10</td>
                    <td className="p-3 text-emerald-600 dark:text-emerald-400 font-semibold">All Retail POS Scanners</td>
                  </tr>
                  <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-850/40">
                    <td className="p-3 font-bold text-zinc-900 dark:text-white">ITF-14</td>
                    <td className="p-3">14 Numeric Digits</td>
                    <td className="p-3">Outer Master Corrugated Boxes</td>
                    <td className="p-3">Mandatory Modulo-10</td>
                    <td className="p-3 text-emerald-600 dark:text-emerald-400 font-semibold">Warehouse Scanners</td>
                  </tr>
                  <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-850/40">
                    <td className="p-3 font-bold text-zinc-900 dark:text-white">QR Code (2D)</td>
                    <td className="p-3">Up to 7,089 Characters</td>
                    <td className="p-3">Mobile Scanning, UPI, URLs</td>
                    <td className="p-3">Reed-Solomon Error Correction</td>
                    <td className="p-3 text-indigo-600 dark:text-indigo-400 font-semibold">2D Camera Scanners & Smartphones</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* GS1 India & Country Prefixes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <span className="font-bold text-zinc-900 dark:text-white block">
                  🇮🇳 GS1 Country Code Prefixes (EAN-13)
                </span>
                <ul className="text-zinc-600 dark:text-zinc-400 space-y-1">
                  <li><strong>890:</strong> India (GS1 India allocated country prefix)</li>
                  <li><strong>000 - 139:</strong> United States & Canada (UPC compatible)</li>
                  <li><strong>400 - 440:</strong> Germany</li>
                  <li><strong>450 - 459 & 490 - 499:</strong> Japan (JAN)</li>
                  <li><strong>500 - 509:</strong> United Kingdom</li>
                  <li><strong>690 - 699:</strong> China</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <span className="font-bold text-zinc-900 dark:text-white block">
                  🧮 EAN-13 Modulo-10 Check Digit Formula
                </span>
                <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">
                  The 13th digit is a checksum calculated across the first 12 digits:
                </p>
                <code className="block p-2 rounded bg-white dark:bg-zinc-800 text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
                  Sum = (d1×1 + d2×3 + d3×1 + d4×3 + ... + d12×3)<br />
                  CheckDigit = (10 - (Sum mod 10)) mod 10
                </code>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Subcomponent for rendering individual mini barcodes in batch / preview grids
function BatchBarcodeItem({ value, format }: { value: string; format: BarcodeFormat }) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!value) return;
    if (format === 'QR') {
      const canvas = canvasRef.current;
      if (canvas) {
        QRCode.toCanvas(canvas, value, { width: 65, margin: 1 });
      }
      return;
    }

    const svg = svgRef.current;
    if (svg) {
      try {
        JsBarcode(svg, value, {
          format: format === 'UPCE' ? 'UPC' : (format as any),
          width: 1.2,
          height: 35,
          displayValue: true,
          fontSize: 9,
          margin: 2
        });
      } catch {
        // Suppress invalid batch errors silently in preview
      }
    }
  }, [value, format]);

  if (format === 'QR') {
    return <canvas ref={canvasRef} className="max-w-full" />;
  }

  return <svg ref={svgRef} className="max-w-full h-auto" />;
}

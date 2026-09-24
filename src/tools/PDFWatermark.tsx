/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Type,
  Image as ImageIcon,
  Sparkles,
  ShieldCheck,
  Check,
  Sliders,
  Eye,
  RefreshCw,
  Copy,
  Trash2,
  Grid,
  FileCheck,
  FileText,
  ChevronLeft,
  ChevronRight,
  Stamp
} from 'lucide-react';
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';

// Configure pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export type WatermarkMode = 'text' | 'image' | 'tiled';
export type PositionPreset = 'center' | 'top-left' | 'top-center' | 'top-right' | 'middle-left' | 'middle-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
export type PageTargetRule = 'all' | 'skip-first' | 'skip-last' | 'odd' | 'even' | 'custom';
export type FontChoice = 'HelveticaBold' | 'Helvetica' | 'TimesRomanBold' | 'TimesRoman' | 'CourierBold' | 'Courier';

const TEXT_PRESETS = [
  'CONFIDENTIAL',
  'DRAFT',
  'DO NOT COPY',
  'SAMPLE ONLY',
  'FOR REVIEW ONLY',
  'APPROVED',
  'TOP SECRET',
  'INTERNAL ONLY',
  'COPYRIGHT © 2026'
];

const COLOR_PRESETS = [
  { name: 'Danger Crimson', hex: '#dc2626' },
  { name: 'Security Indigo', hex: '#4f46e5' },
  { name: 'Slate Gray', hex: '#475569' },
  { name: 'Emerald Green', hex: '#059669' },
  { name: 'Warm Amber', hex: '#d97706' },
  { name: 'Pitch Black', hex: '#09090b' }
];

export default function PDFWatermark() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [previewPageIndex, setPreviewPageIndex] = useState<number>(0);
  const [pdfPageDimensions, setPdfPageDimensions] = useState<{ width: number; height: number }>({ width: 595, height: 842 });
  
  // Watermark Mode
  const [mode, setMode] = useState<WatermarkMode>('text');

  // Text Watermark Options
  const [text, setText] = useState<string>('CONFIDENTIAL');
  const [textColor, setTextColor] = useState<string>('#4f46e5');
  const [fontChoice, setFontChoice] = useState<FontChoice>('HelveticaBold');
  const [fontSize, setFontSize] = useState<number>(54);
  const [rotation, setRotation] = useState<number>(45);

  // Image / Logo Options
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [logoScale, setLogoScale] = useState<number>(35); // % of page width
  const [logoRotation, setLogoRotation] = useState<number>(0);

  // Common Placement & Appearance
  const [position, setPosition] = useState<PositionPreset>('center');
  const [opacity, setOpacity] = useState<number>(0.28);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);

  // Tiled Grid Options
  const [tileDensity, setTileDensity] = useState<'normal' | 'dense' | 'sparse'>('normal');

  // Page Target Rules
  const [pageTarget, setPageTarget] = useState<PageTargetRule>('all');
  const [customRange, setCustomRange] = useState<string>('');

  // Live Canvas Preview Rendering
  const [pageThumbnail, setPageThumbnail] = useState<string | null>(null);
  const [isLoadingThumbnail, setIsLoadingThumbnail] = useState<boolean>(false);

  // Processing & Results
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [showPdfModal, setShowPdfModal] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Helper to convert HEX color to RGB (0-1 range)
  const hexToRgb01 = (hex: string): { r: number; g: number; b: number } => {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.substring(0, 2), 16) / 255;
    const g = parseInt(clean.substring(2, 4), 16) / 255;
    const b = parseInt(clean.substring(4, 6), 16) / 255;
    return {
      r: isNaN(r) ? 0.3 : r,
      g: isNaN(g) ? 0.3 : g,
      b: isNaN(b) ? 0.9 : b
    };
  };

  // Render Page Thumbnail with pdfjs
  const renderPdfPageThumbnail = useCallback(async (pdfFile: File, pageIndex: number) => {
    setIsLoadingThumbnail(true);
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const total = pdf.numPages;
      setTotalPages(total);

      const targetPageNum = Math.min(total, Math.max(1, pageIndex + 1));
      const page = await pdf.getPage(targetPageNum);
      const viewport = page.getViewport({ scale: 1.2 });
      
      setPdfPageDimensions({ width: viewport.width / 1.2, height: viewport.height / 1.2 });

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        await (page.render as any)({ canvasContext: ctx, viewport, canvas }).promise;
        const dataUrl = canvas.toDataURL('image/png');
        setPageThumbnail(dataUrl);
      }
    } catch (err) {
      console.error('Failed to render page preview thumbnail:', err);
    } finally {
      setIsLoadingThumbnail(false);
    }
  }, []);

  // Load and inspect PDF
  const loadPdf = async (uploadedFile: File) => {
    setIsProcessing(true);
    setProgressStatus(`Loading "${uploadedFile.name}"...`);
    setError(null);
    setOutputBlob(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    try {
      const arrayBuffer = await uploadedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const count = pdfDoc.getPageCount();

      if (count === 0) {
        throw new Error('This PDF contains 0 pages.');
      }

      setFile(uploadedFile);
      setTotalPages(count);
      setPreviewPageIndex(0);
      await renderPdfPageThumbnail(uploadedFile, 0);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Could not parse PDF. Ensure the file is not password-protected.');
      setFile(null);
      setTotalPages(0);
      setPageThumbnail(null);
    } finally {
      setIsProcessing(false);
      setProgressStatus('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      if (uploadedFile.type !== 'application/pdf' && !uploadedFile.name.toLowerCase().endsWith('.pdf')) {
        setError('Please select a valid .pdf file.');
        return;
      }
      loadPdf(uploadedFile);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      if (!uploadedFile.type.startsWith('image/')) {
        setError('Please select an image file (PNG, JPG, WebP).');
        return;
      }
      setLogoFile(uploadedFile);
      if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
      const url = URL.createObjectURL(uploadedFile);
      setLogoPreviewUrl(url);
      setOutputBlob(null);
    }
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  // Generate Sample Badge Logo
  const handleLoadSampleLogo = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 400, 400);

    // Outer circle
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(200, 200, 180, 0, Math.PI * 2);
    ctx.stroke();

    // Inner dashed circle
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.arc(200, 200, 155, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Shield/Star icon
    ctx.fillStyle = '#4f46e5';
    ctx.font = 'bold 70px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★', 200, 140);

    // Text Badge
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('VERIFIED & SEALED', 200, 215);
    ctx.font = 'bold 15px sans-serif';
    ctx.fillStyle = '#6366f1';
    ctx.fillText('OFFICIAL DOCUMENT 2026', 200, 250);

    canvas.toBlob((blob) => {
      if (blob) {
        const sampleLogo = new File([blob], 'Official_Security_Seal.png', { type: 'image/png' });
        setLogoFile(sampleLogo);
        if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
        setLogoPreviewUrl(URL.createObjectURL(blob));
        setMode('image');
        setOutputBlob(null);
      }
    }, 'image/png');
  };

  // Generate Sample 3-Page NDA Document
  const handleLoadSamplePdf = async () => {
    setIsProcessing(true);
    setProgressStatus('Synthesizing sample NDA document in browser memory...');
    setError(null);

    try {
      const pdfDoc = await PDFDocument.create();
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // Page 1: Cover / Header
      const page1 = pdfDoc.addPage([595.28, 841.89]);
      page1.drawRectangle({
        x: 36,
        y: 841.89 - 140,
        width: 595.28 - 72,
        height: 100,
        color: rgb(0.08, 0.12, 0.2)
      });
      page1.drawText('MUTUAL NON-DISCLOSURE AGREEMENT', {
        x: 54,
        y: 841.89 - 85,
        size: 18,
        font: fontBold,
        color: rgb(1, 1, 1)
      });
      page1.drawText('CONFIDENTIAL LEGAL INSTRUMENT • DRAFT VERSION', {
        x: 54,
        y: 841.89 - 115,
        size: 10,
        font: fontRegular,
        color: rgb(0.7, 0.8, 0.95)
      });
      page1.drawText('This Agreement is entered into on this 24th day of September, 2026, by and between:', {
        x: 54,
        y: 841.89 - 180,
        size: 11,
        font: fontRegular,
        color: rgb(0.2, 0.2, 0.2)
      });
      page1.drawText('1. Disclosing Party: Global Corporate Dynamics LLC', {
        x: 54,
        y: 841.89 - 210,
        size: 11,
        font: fontBold,
        color: rgb(0.1, 0.1, 0.1)
      });
      page1.drawText('2. Receiving Party: Strategic Solutions International Inc.', {
        x: 54,
        y: 841.89 - 235,
        size: 11,
        font: fontBold,
        color: rgb(0.1, 0.1, 0.1)
      });
      page1.drawText('Recitals & Purpose:\nThe parties intend to explore business opportunities concerning algorithmic artificial intelligence\nand proprietary intellectual properties requiring the exchange of sensitive information.', {
        x: 54,
        y: 841.89 - 280,
        size: 10.5,
        font: fontRegular,
        color: rgb(0.3, 0.3, 0.3),
        lineHeight: 18
      });

      // Page 2: Terms & Financial Schedule
      const page2 = pdfDoc.addPage([595.28, 841.89]);
      page2.drawText('Section 1. Definition of Confidential Information', {
        x: 54,
        y: 841.89 - 70,
        size: 14,
        font: fontBold,
        color: rgb(0.1, 0.1, 0.1)
      });
      page2.drawText('For the purpose of this Agreement, "Confidential Information" shall include all financial\nforecasts, customer lists, source codes, proprietary architectures, and business roadmaps\nconveyed orally, electronically, or in writing marked with security classifications.', {
        x: 54,
        y: 841.89 - 105,
        size: 10.5,
        font: fontRegular,
        color: rgb(0.3, 0.3, 0.3),
        lineHeight: 18
      });
      page2.drawText('Section 2. Non-Use and Non-Disclosure Obligations', {
        x: 54,
        y: 841.89 - 180,
        size: 14,
        font: fontBold,
        color: rgb(0.1, 0.1, 0.1)
      });
      page2.drawText('The Receiving Party agrees to hold all Confidential Information in strict confidence\nand protect such information with at least the same degree of care it uses to protect\nits own proprietary assets of like importance, but in no event less than reasonable care.', {
        x: 54,
        y: 841.89 - 215,
        size: 10.5,
        font: fontRegular,
        color: rgb(0.3, 0.3, 0.3),
        lineHeight: 18
      });

      // Page 3: Execution Signatures
      const page3 = pdfDoc.addPage([595.28, 841.89]);
      page3.drawText('Section 5. Term & Execution', {
        x: 54,
        y: 841.89 - 70,
        size: 14,
        font: fontBold,
        color: rgb(0.1, 0.1, 0.1)
      });
      page3.drawText('IN WITNESS WHEREOF, the parties hereto have executed this Mutual Non-Disclosure Agreement\nas of the date first written above by their duly authorized representatives.', {
        x: 54,
        y: 841.89 - 105,
        size: 10.5,
        font: fontRegular,
        color: rgb(0.3, 0.3, 0.3),
        lineHeight: 18
      });
      page3.drawLine({
        start: { x: 54, y: 841.89 - 220 },
        end: { x: 250, y: 841.89 - 220 },
        color: rgb(0.5, 0.5, 0.5),
        thickness: 1
      });
      page3.drawText('Authorized Signature (Disclosing Party)', {
        x: 54,
        y: 841.89 - 238,
        size: 9.5,
        font: fontRegular,
        color: rgb(0.4, 0.4, 0.4)
      });
      page3.drawLine({
        start: { x: 320, y: 841.89 - 220 },
        end: { x: 520, y: 841.89 - 220 },
        color: rgb(0.5, 0.5, 0.5),
        thickness: 1
      });
      page3.drawText('Authorized Signature (Receiving Party)', {
        x: 320,
        y: 841.89 - 238,
        size: 9.5,
        font: fontRegular,
        color: rgb(0.4, 0.4, 0.4)
      });

      const pdfBytes = await pdfDoc.save();
      const sampleFile = new File([pdfBytes as any], 'NDA_Corporate_Strategy_2026.pdf', {
        type: 'application/pdf'
      });
      await loadPdf(sampleFile);
    } catch (err: any) {
      console.error(err);
      setError('Failed to generate sample PDF.');
    } finally {
      setIsProcessing(false);
      setProgressStatus('');
    }
  };

  // Compute Target Page Indices
  const targetedPageIndices = useMemo(() => {
    if (totalPages === 0) return [];
    if (pageTarget === 'all') {
      return Array.from({ length: totalPages }, (_, i) => i);
    }
    if (pageTarget === 'skip-first') {
      return Array.from({ length: totalPages - 1 }, (_, i) => i + 1);
    }
    if (pageTarget === 'skip-last') {
      return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => i);
    }
    if (pageTarget === 'odd') {
      return Array.from({ length: totalPages }, (_, i) => i).filter(i => (i + 1) % 2 === 1);
    }
    if (pageTarget === 'even') {
      return Array.from({ length: totalPages }, (_, i) => i).filter(i => (i + 1) % 2 === 0);
    }
    if (pageTarget === 'custom') {
      const clean = customRange.trim();
      if (!clean) return Array.from({ length: totalPages }, (_, i) => i);
      const set = new Set<number>();
      const parts = clean.split(',');
      for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed.includes('-')) {
          const [startStr, endStr] = trimmed.split('-');
          const start = parseInt(startStr, 10);
          const end = parseInt(endStr, 10);
          if (!isNaN(start) && !isNaN(end)) {
            const min = Math.max(1, Math.min(start, end));
            const max = Math.min(totalPages, Math.max(start, end));
            for (let i = min; i <= max; i++) set.add(i - 1);
          }
        } else {
          const num = parseInt(trimmed, 10);
          if (!isNaN(num) && num >= 1 && num <= totalPages) {
            set.add(num - 1);
          }
        }
      }
      return Array.from(set).sort((a, b) => a - b);
    }
    return Array.from({ length: totalPages }, (_, i) => i);
  }, [totalPages, pageTarget, customRange]);

  // Is current preview page targeted?
  const isCurrentPageWatermarked = targetedPageIndices.includes(previewPageIndex);

  // Switch page thumbnail when index changes
  useEffect(() => {
    if (file && totalPages > 0) {
      renderPdfPageThumbnail(file, previewPageIndex);
    }
  }, [file, totalPages, previewPageIndex, renderPdfPageThumbnail]);

  // Dynamic token replacer
  const resolveWatermarkText = (rawText: string, pageIdx: number, totalP: number) => {
    return rawText
      .replace(/{{PAGE}}/gi, String(pageIdx + 1))
      .replace(/{{TOTAL_PAGES}}/gi, String(totalP))
      .replace(/{{DATE}}/gi, new Date().toLocaleDateString())
      .replace(/{{TIME}}/gi, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
      .replace(/{{FILENAME}}/gi, file?.name.replace(/\.[^/.]+$/, '') || 'Document')
      .replace(/{{YEAR}}/gi, String(new Date().getFullYear()));
  };

  // Draw Live Watermark Overlay onto Canvas Preview
  useEffect(() => {
    if (!pageThumbnail || !previewCanvasRef.current) return;

    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = pageThumbnail;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw PDF page base
      ctx.drawImage(img, 0, 0);

      // If page is not selected for watermarking, show notice badge
      if (!isCurrentPageWatermarked) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, canvas.width, 36);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Watermark Excluded for This Page (per page rules)', canvas.width / 2, 23);
        return;
      }

      // Draw Watermark Overlay
      const scaleFactor = canvas.width / pdfPageDimensions.width;
      const W = canvas.width;
      const H = canvas.height;
      const margin = 40 * scaleFactor;

      ctx.save();
      ctx.globalAlpha = opacity;

      // Calculate anchor center coordinates (in canvas space)
      let cx = W / 2 + offsetX * scaleFactor;
      let cy = H / 2 + offsetY * scaleFactor;

      if (position === 'top-left') {
        cx = margin + offsetX * scaleFactor;
        cy = margin + offsetY * scaleFactor;
      } else if (position === 'top-center') {
        cx = W / 2 + offsetX * scaleFactor;
        cy = margin + offsetY * scaleFactor;
      } else if (position === 'top-right') {
        cx = W - margin + offsetX * scaleFactor;
        cy = margin + offsetY * scaleFactor;
      } else if (position === 'middle-left') {
        cx = margin + offsetX * scaleFactor;
        cy = H / 2 + offsetY * scaleFactor;
      } else if (position === 'middle-right') {
        cx = W - margin + offsetX * scaleFactor;
        cy = H / 2 + offsetY * scaleFactor;
      } else if (position === 'bottom-left') {
        cx = margin + offsetX * scaleFactor;
        cy = H - margin + offsetY * scaleFactor;
      } else if (position === 'bottom-center') {
        cx = W / 2 + offsetX * scaleFactor;
        cy = H - margin + offsetY * scaleFactor;
      } else if (position === 'bottom-right') {
        cx = W - margin + offsetX * scaleFactor;
        cy = H - margin + offsetY * scaleFactor;
      }

      if (mode === 'text') {
        const activeText = resolveWatermarkText(text, previewPageIndex, totalPages);
        const scaledFontSize = fontSize * scaleFactor;
        ctx.fillStyle = textColor;
        ctx.font = `bold ${scaledFontSize}px ${fontChoice.includes('Times') ? 'serif' : fontChoice.includes('Courier') ? 'monospace' : 'sans-serif'}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.translate(cx, cy);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.fillText(activeText, 0, 0);
      } else if (mode === 'image' && logoPreviewUrl) {
        const logoImg = new Image();
        logoImg.src = logoPreviewUrl;
        logoImg.onload = () => {
          const targetW = (W * (logoScale / 100));
          const aspect = logoImg.height / logoImg.width;
          const targetH = targetW * aspect;

          ctx.translate(cx, cy);
          ctx.rotate((logoRotation * Math.PI) / 180);
          ctx.drawImage(logoImg, -targetW / 2, -targetH / 2, targetW, targetH);
          ctx.restore();
        };
        return;
      } else if (mode === 'tiled') {
        const activeText = resolveWatermarkText(text, previewPageIndex, totalPages);
        const scaledFontSize = (fontSize * 0.55) * scaleFactor;
        ctx.fillStyle = textColor;
        ctx.font = `bold ${scaledFontSize}px ${fontChoice.includes('Times') ? 'serif' : fontChoice.includes('Courier') ? 'monospace' : 'sans-serif'}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const gridStep = tileDensity === 'dense' ? 120 * scaleFactor : tileDensity === 'sparse' ? 240 * scaleFactor : 170 * scaleFactor;

        for (let x = -gridStep; x < W + gridStep * 2; x += gridStep) {
          for (let y = -gridStep; y < H + gridStep * 2; y += gridStep) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate((rotation * Math.PI) / 180);
            ctx.fillText(activeText, 0, 0);
            ctx.restore();
          }
        }
      }

      ctx.restore();
    };
  }, [pageThumbnail, text, textColor, fontSize, rotation, mode, position, opacity, offsetX, offsetY, logoPreviewUrl, logoScale, logoRotation, tileDensity, fontChoice, previewPageIndex, totalPages, isCurrentPageWatermarked, pdfPageDimensions]);

  // Apply Watermark to PDF with pdf-lib
  const handleApplyWatermark = async () => {
    if (!file) return;
    if ((mode === 'text' || mode === 'tiled') && !text.trim()) {
      setError('Please provide watermark text.');
      return;
    }
    if (mode === 'image' && !logoFile) {
      setError('Please upload or load a logo badge image.');
      return;
    }
    if (targetedPageIndices.length === 0) {
      setError('No pages selected for watermarking under current page rules.');
      return;
    }

    setIsProcessing(true);
    setProgressStatus('Stamping watermark across targeted PDF pages...');
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();

      // Embed Font
      let font: any;
      switch (fontChoice) {
        case 'Helvetica': font = await pdfDoc.embedFont(StandardFonts.Helvetica); break;
        case 'TimesRoman': font = await pdfDoc.embedFont(StandardFonts.TimesRoman); break;
        case 'TimesRomanBold': font = await pdfDoc.embedFont(StandardFonts.TimesRomanBold); break;
        case 'Courier': font = await pdfDoc.embedFont(StandardFonts.Courier); break;
        case 'CourierBold': font = await pdfDoc.embedFont(StandardFonts.CourierBold); break;
        default: font = await pdfDoc.embedFont(StandardFonts.HelveticaBold); break;
      }

      // Embed Logo Image if image mode
      let embeddedImage: any = null;
      let imgDims = { width: 0, height: 0 };
      if (mode === 'image' && logoFile) {
        const imgBuffer = await logoFile.arrayBuffer();
        if (logoFile.type === 'image/png' || logoFile.name.toLowerCase().endsWith('.png')) {
          embeddedImage = await pdfDoc.embedPng(imgBuffer);
        } else {
          embeddedImage = await pdfDoc.embedJpg(imgBuffer);
        }
        imgDims = embeddedImage.scale(1.0);
      }

      const rgbColor = hexToRgb01(textColor);

      targetedPageIndices.forEach((pIndex) => {
        if (pIndex >= pages.length) return;
        const page = pages[pIndex];
        const { width: pWidth, height: pHeight } = page.getSize();
        const margin = 40;

        // Position coordinates in PDF space (0,0 is bottom-left)
        let cx = pWidth / 2 + offsetX;
        let cy = pHeight / 2 + offsetY;

        if (position === 'top-left') {
          cx = margin + offsetX;
          cy = pHeight - margin + offsetY;
        } else if (position === 'top-center') {
          cx = pWidth / 2 + offsetX;
          cy = pHeight - margin + offsetY;
        } else if (position === 'top-right') {
          cx = pWidth - margin + offsetX;
          cy = pHeight - margin + offsetY;
        } else if (position === 'middle-left') {
          cx = margin + offsetX;
          cy = pHeight / 2 + offsetY;
        } else if (position === 'middle-right') {
          cx = pWidth - margin + offsetX;
          cy = pHeight / 2 + offsetY;
        } else if (position === 'bottom-left') {
          cx = margin + offsetX;
          cy = margin + offsetY;
        } else if (position === 'bottom-center') {
          cx = pWidth / 2 + offsetX;
          cy = margin + offsetY;
        } else if (position === 'bottom-right') {
          cx = pWidth - margin + offsetX;
          cy = margin + offsetY;
        }

        if (mode === 'text') {
          const resolvedStr = resolveWatermarkText(text, pIndex, pages.length);
          const textWidth = font.widthOfTextAtSize(resolvedStr, fontSize);
          const textHeight = font.heightAtSize(fontSize) * 0.75;

          // Rotation around center logic
          const rad = (rotation * Math.PI) / 180;
          const originX = cx - (textWidth / 2) * Math.cos(rad) + (textHeight / 2) * Math.sin(rad);
          const originY = cy - (textWidth / 2) * Math.sin(rad) - (textHeight / 2) * Math.cos(rad);

          page.drawText(resolvedStr, {
            x: originX,
            y: originY,
            size: fontSize,
            font: font,
            color: rgb(rgbColor.r, rgbColor.g, rgbColor.b),
            opacity: opacity,
            rotate: degrees(rotation)
          });
        } else if (mode === 'image' && embeddedImage) {
          const targetW = pWidth * (logoScale / 100);
          const aspect = imgDims.height / imgDims.width;
          const targetH = targetW * aspect;

          const rad = (logoRotation * Math.PI) / 180;
          const originX = cx - (targetW / 2) * Math.cos(rad) + (targetH / 2) * Math.sin(rad);
          const originY = cy - (targetW / 2) * Math.sin(rad) - (targetH / 2) * Math.cos(rad);

          page.drawImage(embeddedImage, {
            x: originX,
            y: originY,
            width: targetW,
            height: targetH,
            opacity: opacity,
            rotate: degrees(logoRotation)
          });
        } else if (mode === 'tiled') {
          const resolvedStr = resolveWatermarkText(text, pIndex, pages.length);
          const tiledSize = fontSize * 0.55;
          const textWidth = font.widthOfTextAtSize(resolvedStr, tiledSize);
          const textHeight = font.heightAtSize(tiledSize) * 0.75;
          const rad = (rotation * Math.PI) / 180;

          const gridStep = tileDensity === 'dense' ? 120 : tileDensity === 'sparse' ? 240 : 170;

          for (let gx = -gridStep; gx < pWidth + gridStep * 2; gx += gridStep) {
            for (let gy = -gridStep; gy < pHeight + gridStep * 2; gy += gridStep) {
              const originX = gx - (textWidth / 2) * Math.cos(rad) + (textHeight / 2) * Math.sin(rad);
              const originY = gy - (textWidth / 2) * Math.sin(rad) - (textHeight / 2) * Math.cos(rad);

              page.drawText(resolvedStr, {
                x: originX,
                y: originY,
                size: tiledSize,
                font: font,
                color: rgb(rgbColor.r, rgbColor.g, rgbColor.b),
                opacity: opacity,
                rotate: degrees(rotation)
              });
            }
          }
        }
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      setOutputBlob(blob);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setShowPdfModal(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while stamping watermark. Verify file is not corrupt.');
    } finally {
      setIsProcessing(false);
      setProgressStatus('');
    }
  };

  const handleDownload = () => {
    if (!outputBlob || !file) return;
    const url = URL.createObjectURL(outputBlob);
    const link = document.createElement('a');
    link.href = url;
    const base = file.name.replace(/\.[^/.]+$/, '');
    link.download = `${base}_watermarked.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyManifest = () => {
    if (!file) return;
    const manifest = [
      `=== PDF WATERMARK STAMP MANIFEST ===`,
      `Document Name: ${file.name}`,
      `Total Document Pages: ${totalPages}`,
      `Pages Watermarked: ${targetedPageIndices.length} of ${totalPages} (${((targetedPageIndices.length / totalPages) * 100).toFixed(0)}%)`,
      `Page Selection Rule: ${pageTarget.toUpperCase()}`,
      `Watermark Mode: ${mode.toUpperCase()}`,
      mode === 'text' || mode === 'tiled' ? `Watermark Text: "${text}"` : `Logo Image: ${logoFile?.name || 'Custom Seal'}`,
      `Opacity: ${(opacity * 100).toFixed(0)}%`,
      `Position Anchor: ${position.toUpperCase()}`,
      `Rotation Angle: ${mode === 'image' ? logoRotation : rotation}°`,
      `Timestamp: ${new Date().toLocaleString()}`,
      `Security Engine: 100% Client-Side In-Memory PDF-Lib`
    ].join('\n');

    navigator.clipboard.writeText(manifest);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  const handleReset = () => {
    setFile(null);
    setTotalPages(0);
    setPageThumbnail(null);
    setOutputBlob(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setError(null);
    setShowPdfModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-left">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-emerald-500/10 border border-indigo-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-sm">
            <Stamp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-zinc-900 dark:text-white">PDF Watermark & Security Stamping Studio</span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                100% Client-Side
              </span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Stamp text, logos, or tiled security matrices onto your PDF pages with real-time visual WYSIWYG preview.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!file && (
            <button
              onClick={handleLoadSamplePdf}
              className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 text-xs font-bold hover:bg-indigo-50 dark:hover:bg-zinc-700 transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Try Sample NDA Document</span>
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
        <div className="saas-card p-8 text-center border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors rounded-2xl relative">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf, application/pdf"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="max-w-md mx-auto space-y-3 pointer-events-none">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Upload className="w-8 h-8" />
            </div>
            <div>
              <p className="text-base font-bold text-zinc-900 dark:text-white">
                Drag and drop your PDF document here, or browse
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Single PDF file selection (.pdf) &bull; Up to 500+ pages supported
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
              <span className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                Text & Logo Stamps
              </span>
              <span className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                Tiled Security Matrices
              </span>
              <span className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                Live Canvas WYSIWYG
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Studio Workspace if file loaded */}
      {file && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Watermark Controls & Settings (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* File Info Bar */}
            <div className="saas-card p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{file.name}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {(file.size / 1024).toFixed(1)} KB &bull; {totalPages} Page{totalPages > 1 ? 's' : ''} &bull; {targetedPageIndices.length} Stamped
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleCopyManifest}
                  title="Copy Watermark Manifest"
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

            {/* Mode Switcher Tabs */}
            <div className="saas-card p-3">
              <div className="flex p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80">
                <button
                  onClick={() => { setMode('text'); setOutputBlob(null); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    mode === 'text'
                      ? 'bg-white text-zinc-900 dark:bg-zinc-800 dark:text-white shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
                  }`}
                >
                  <Type className="w-4 h-4" />
                  <span>Text Watermark</span>
                </button>
                <button
                  onClick={() => { setMode('image'); setOutputBlob(null); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    mode === 'image'
                      ? 'bg-white text-zinc-900 dark:bg-zinc-800 dark:text-white shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Image / Logo Stamp</span>
                </button>
                <button
                  onClick={() => { setMode('tiled'); setOutputBlob(null); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    mode === 'tiled'
                      ? 'bg-white text-zinc-900 dark:bg-zinc-800 dark:text-white shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                  <span>Tiled Matrix</span>
                </button>
              </div>
            </div>

            {/* Mode-Specific Configuration Card */}
            <div className="saas-card p-5 space-y-4">
              {mode === 'text' || mode === 'tiled' ? (
                <>
                  {/* Preset Chips */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                      <span>Quick Security Presets</span>
                      <span className="text-[10px] text-zinc-400 font-normal">Click to apply preset</span>
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {TEXT_PRESETS.map((pText) => (
                        <button
                          key={pText}
                          onClick={() => { setText(pText); setOutputBlob(null); }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                            text === pText
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-indigo-400'
                          }`}
                        >
                          {pText}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Watermark Text Input & Dynamic Tokens */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Watermark Text</label>
                      <span className="text-[10px] text-zinc-400">Supports tokens: {'{{DATE}}, {{PAGE}}, {{TOTAL_PAGES}}, {{FILENAME}}'}</span>
                    </div>
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => { setText(e.target.value); setOutputBlob(null); }}
                      placeholder="e.g. CONFIDENTIAL • DO NOT SHARE"
                      className="w-full p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-bold text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Font, Color & Styling Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Font Choice */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Font</label>
                      <select
                        value={fontChoice}
                        onChange={(e) => { setFontChoice(e.target.value as FontChoice); setOutputBlob(null); }}
                        className="w-full p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs font-medium focus:outline-none focus:border-indigo-500"
                      >
                        <option value="HelveticaBold">Helvetica (Bold)</option>
                        <option value="Helvetica">Helvetica (Regular)</option>
                        <option value="TimesRomanBold">Times Roman (Bold)</option>
                        <option value="TimesRoman">Times Roman (Regular)</option>
                        <option value="CourierBold">Courier (Monospace Bold)</option>
                        <option value="Courier">Courier (Monospace)</option>
                      </select>
                    </div>

                    {/* Color Swatch & Picker */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Stamp Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={textColor}
                          onChange={(e) => { setTextColor(e.target.value); setOutputBlob(null); }}
                          className="w-9 h-9 rounded-xl border border-zinc-200 dark:border-zinc-700 cursor-pointer bg-transparent shrink-0"
                        />
                        <div className="flex flex-wrap gap-1">
                          {COLOR_PRESETS.map((c) => (
                            <button
                              key={c.hex}
                              title={c.name}
                              onClick={() => { setTextColor(c.hex); setOutputBlob(null); }}
                              className={`w-5 h-5 rounded-full border transition cursor-pointer ${
                                textColor.toLowerCase() === c.hex.toLowerCase() ? 'ring-2 ring-indigo-500 scale-110' : 'border-zinc-300 dark:border-zinc-600'
                              }`}
                              style={{ backgroundColor: c.hex }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Font Size */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-zinc-600 dark:text-zinc-400">Size</span>
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">{fontSize} pt</span>
                      </div>
                      <input
                        type="range"
                        min="16"
                        max="120"
                        value={fontSize}
                        onChange={(e) => { setFontSize(parseInt(e.target.value, 10)); setOutputBlob(null); }}
                        className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 mt-2"
                      />
                    </div>
                  </div>

                  {/* Rotation Angle */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-600 dark:text-zinc-400">Rotation Angle</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">{rotation}&deg;</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={rotation}
                        onChange={(e) => { setRotation(parseInt(e.target.value, 10)); setOutputBlob(null); }}
                        className="flex-1 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                      <div className="flex gap-1">
                        {[
                          { label: '0°', val: 0 },
                          { label: '45°', val: 45 },
                          { label: '-45°', val: -45 },
                          { label: '90°', val: 90 }
                        ].map((deg) => (
                          <button
                            key={deg.val}
                            onClick={() => { setRotation(deg.val); setOutputBlob(null); }}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer ${
                              rotation === deg.val
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                            }`}
                          >
                            {deg.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Tiled Matrix Density if in tiled mode */}
                  {mode === 'tiled' && (
                    <div className="space-y-1.5 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                      <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Grid Pattern Density</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'sparse', label: 'Sparse (2x2)' },
                          { id: 'normal', label: 'Balanced (3x3)' },
                          { id: 'dense', label: 'Dense (4x4)' }
                        ].map((d) => (
                          <button
                            key={d.id}
                            onClick={() => { setTileDensity(d.id as any); setOutputBlob(null); }}
                            className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                              tileDensity === d.id
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                            }`}
                          >
                            {d.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Image / Logo Mode */
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Logo Image (PNG with transparency recommended)</label>
                    {!logoFile ? (
                      <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-5 text-center space-y-2 hover:border-indigo-500 transition relative">
                        <input
                          ref={logoInputRef}
                          type="file"
                          accept="image/png, image/jpeg, image/webp"
                          onChange={handleLogoUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <ImageIcon className="w-8 h-8 mx-auto text-zinc-400" />
                        <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Click to upload image logo (PNG / JPG)</p>
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLoadSampleLogo();
                            }}
                            className="px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-700 text-xs font-bold hover:bg-indigo-100 transition cursor-pointer"
                          >
                            ⚡ Load Sample Security Seal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                        <div className="flex items-center gap-3 min-w-0">
                          {logoPreviewUrl && (
                            <img src={logoPreviewUrl} alt="Logo" className="w-10 h-10 object-contain rounded-lg border border-zinc-200 dark:border-zinc-700 p-0.5 bg-white" />
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">{logoFile.name}</p>
                            <p className="text-[10px] text-zinc-400">{(logoFile.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                        <button
                          onClick={() => { setLogoFile(null); setLogoPreviewUrl(null); setOutputBlob(null); }}
                          className="text-xs font-semibold text-red-500 hover:text-red-600 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-zinc-600 dark:text-zinc-400">Logo Scale</span>
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">{logoScale}%</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="90"
                        value={logoScale}
                        onChange={(e) => { setLogoScale(parseInt(e.target.value, 10)); setOutputBlob(null); }}
                        className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 mt-2"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-zinc-600 dark:text-zinc-400">Rotation</span>
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">{logoRotation}&deg;</span>
                      </div>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={logoRotation}
                        onChange={(e) => { setLogoRotation(parseInt(e.target.value, 10)); setOutputBlob(null); }}
                        className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 mt-2"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Placement, Opacity & Target Pages */}
            <div className="saas-card p-5 space-y-4">
              <label className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Placement, Opacity & Page Rules
              </label>

              {/* Opacity Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-600 dark:text-zinc-400">Watermark Opacity</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{Math.round(opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="1.0"
                  step="0.01"
                  value={opacity}
                  onChange={(e) => { setOpacity(parseFloat(e.target.value)); setOutputBlob(null); }}
                  className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* 9-Point Positioning Matrix (if not tiled) */}
              {mode !== 'tiled' && (
                <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Position Anchor</span>
                  <div className="grid grid-cols-3 gap-1.5 max-w-xs mx-auto">
                    {[
                      { id: 'top-left', label: '↖ Top L' },
                      { id: 'top-center', label: '↑ Top' },
                      { id: 'top-right', label: '↗ Top R' },
                      { id: 'middle-left', label: '← Mid L' },
                      { id: 'center', label: '• Center' },
                      { id: 'middle-right', label: 'Mid R →' },
                      { id: 'bottom-left', label: '↙ Btm L' },
                      { id: 'bottom-center', label: '↓ Btm' },
                      { id: 'bottom-right', label: '↘ Btm R' }
                    ].map((pos) => (
                      <button
                        key={pos.id}
                        onClick={() => { setPosition(pos.id as PositionPreset); setOutputBlob(null); }}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition cursor-pointer ${
                          position === pos.id
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'
                        }`}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>

                  {/* Offset fine tuning */}
                  <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="space-y-1">
                      <span className="text-zinc-500">Fine X-Offset: {offsetX} pt</span>
                      <input
                        type="range"
                        min="-150"
                        max="150"
                        value={offsetX}
                        onChange={(e) => { setOffsetX(parseInt(e.target.value, 10)); setOutputBlob(null); }}
                        className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-zinc-500">Fine Y-Offset: {offsetY} pt</span>
                      <input
                        type="range"
                        min="-150"
                        max="150"
                        value={offsetY}
                        onChange={(e) => { setOffsetY(parseInt(e.target.value, 10)); setOutputBlob(null); }}
                        className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Page Target Rules */}
              <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800 text-xs">
                <span className="font-semibold text-zinc-600 dark:text-zinc-400">Target Pages</span>
                <select
                  value={pageTarget}
                  onChange={(e) => { setPageTarget(e.target.value as PageTargetRule); setOutputBlob(null); }}
                  className="w-full p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">All Pages ({totalPages} total)</option>
                  <option value="skip-first">Skip First Page (Cover Page)</option>
                  <option value="skip-last">Skip Last Page (Back Page)</option>
                  <option value="odd">Odd Pages Only (1, 3, 5...)</option>
                  <option value="even">Even Pages Only (2, 4, 6...)</option>
                  <option value="custom">Custom Page Range...</option>
                </select>

                {pageTarget === 'custom' && (
                  <input
                    type="text"
                    placeholder="e.g. 1-3, 5, 8-10"
                    value={customRange}
                    onChange={(e) => { setCustomRange(e.target.value); setOutputBlob(null); }}
                    className="w-full p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 mt-1"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Live WYSIWYG Page Preview & Actions (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Actions Card */}
            <div className="saas-card p-5 space-y-4 bg-gradient-to-b from-zinc-50/50 to-white dark:from-zinc-900/80 dark:to-zinc-900">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Stamp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Stamping Actions
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {targetedPageIndices.length} of {totalPages} Pages
                </span>
              </div>

              <button
                onClick={handleApplyWatermark}
                disabled={isProcessing || (mode === 'image' && !logoFile)}
                className="w-full saas-button-primary py-3.5 flex items-center justify-center gap-2 text-sm font-bold shadow-md cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    <span>{progressStatus || 'Applying Watermark...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4.5 h-4.5" />
                    <span>Stamp & Apply Watermark</span>
                  </>
                )}
              </button>

              {outputBlob && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Watermarked PDF Ready!
                    </span>
                    <span>{(outputBlob.size / 1024).toFixed(1)} KB</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDownload}
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

            {/* Live Interactive WYSIWYG Page Preview */}
            <div className="saas-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-bold text-zinc-900 dark:text-white">
                    Live Canvas WYSIWYG Preview
                  </span>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <button
                      onClick={() => setPreviewPageIndex(p => Math.max(0, p - 1))}
                      disabled={previewPageIndex === 0}
                      className="p-1 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                      Page {previewPageIndex + 1} / {totalPages}
                    </span>
                    <button
                      onClick={() => setPreviewPageIndex(p => Math.min(totalPages - 1, p + 1))}
                      disabled={previewPageIndex === totalPages - 1}
                      className="p-1 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Canvas Container */}
              <div className="relative bg-zinc-100 dark:bg-zinc-950 rounded-xl p-3 flex items-center justify-center min-h-[340px] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-inner">
                {isLoadingThumbnail ? (
                  <div className="flex flex-col items-center gap-2 text-zinc-400 text-xs">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                    <span>Rendering page preview...</span>
                  </div>
                ) : (
                  <canvas
                    ref={previewCanvasRef}
                    className="max-w-full max-h-[460px] object-contain rounded-lg shadow-md border border-zinc-300 dark:border-zinc-700"
                  />
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
                <span>
                  Status: {isCurrentPageWatermarked ? '✅ Stamped' : '❌ Excluded on this page'}
                </span>
                <span>Real-time dynamic overlay</span>
              </div>
            </div>

            {/* Privacy Guarantee Banner */}
            <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/15 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div className="text-xs text-zinc-600 dark:text-zinc-400">
                <p className="font-bold text-zinc-900 dark:text-white mb-0.5">100% In-Browser Privacy</p>
                Watermarks are rendered directly onto PDF vector content streams inside your device's memory. Confidential contracts and proprietary drafts never touch the cloud.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen PDF Output Preview Modal */}
      {showPdfModal && previewUrl && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4 bg-zinc-50 dark:bg-zinc-850">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-600 text-white rounded-lg">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Watermarked PDF Preview</h3>
                  <p className="text-[11px] text-zinc-500">
                    {targetedPageIndices.length} pages stamped &bull; {outputBlob ? (outputBlob.size / 1024).toFixed(1) + ' KB' : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
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
                title="Watermarked PDF Preview"
                className="w-full h-full rounded-xl border border-zinc-300 dark:border-zinc-800 shadow-inner"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

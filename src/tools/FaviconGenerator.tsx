/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import JSZip from 'jszip';
import {
  Globe,
  Upload,
  Download,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Eye,
  Type,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Code
} from 'lucide-react';

// --- Preset Brand Archetypes ---
interface FaviconPreset {
  id: string;
  name: string;
  type: 'emoji' | 'text' | 'svg';
  text?: string;
  emoji?: string;
  bgColor: string;
  bgGradientEnd?: string;
  textColor: string;
  fontFamily: string;
  shape: 'rounded' | 'circle' | 'square';
  svgContent?: string;
}

const PRESETS: FaviconPreset[] = [
  {
    id: 'saas_bolt',
    name: '⚡ SaaS Bolt',
    type: 'emoji',
    emoji: '⚡',
    bgColor: '#4f46e5',
    bgGradientEnd: '#7c3aed',
    textColor: '#ffffff',
    fontFamily: 'sans-serif',
    shape: 'rounded'
  },
  {
    id: 'startup_rocket',
    name: '🚀 Startup Rocket',
    type: 'emoji',
    emoji: '🚀',
    bgColor: '#0f172a',
    bgGradientEnd: '#1e293b',
    textColor: '#ffffff',
    fontFamily: 'sans-serif',
    shape: 'circle'
  },
  {
    id: 'minimal_monogram',
    name: '🔤 Tech Monogram',
    type: 'text',
    text: 'TQ',
    bgColor: '#0284c7',
    bgGradientEnd: '#0369a1',
    textColor: '#ffffff',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    shape: 'rounded'
  },
  {
    id: 'emerald_diamond',
    name: '💎 Luxury Diamond',
    type: 'emoji',
    emoji: '💎',
    bgColor: '#059669',
    bgGradientEnd: '#047857',
    textColor: '#ffffff',
    fontFamily: 'sans-serif',
    shape: 'rounded'
  },
  {
    id: 'modern_store',
    name: '🛍️ Modern Shop',
    type: 'emoji',
    emoji: '🛍️',
    bgColor: '#e11d48',
    bgGradientEnd: '#be123c',
    textColor: '#ffffff',
    fontFamily: 'sans-serif',
    shape: 'rounded'
  },
  {
    id: 'adaptive_svg',
    name: '🌓 Adaptive Vector',
    type: 'svg',
    bgColor: 'transparent',
    textColor: '#ffffff',
    fontFamily: 'sans-serif',
    shape: 'square',
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1" />
      <stop offset="100%" stop-color="#a855f7" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="24" fill="url(#grad)" />
  <circle cx="50" cy="50" r="28" fill="#ffffff" fill-opacity="0.9" />
  <polygon points="50,30 65,65 35,65" fill="#4f46e5" />
</svg>`
  }
];

export default function FaviconGenerator() {
  // Source modes: upload, text, svg
  const [sourceMode, setSourceMode] = useState<'upload' | 'text' | 'svg'>('text');

  // Image Upload state
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<{ width: number; height: number; fileName: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Text & Emoji Generator state
  const [customText, setCustomText] = useState('TQ');
  const [textColor, setTextColor] = useState('#ffffff');
  const [bgColor, setBgColor] = useState('#4f46e5');
  const [bgGradientEnd, setBgGradientEnd] = useState('#7c3aed');
  const [useGradient, setUseGradient] = useState(true);
  const [fontFamily, setFontFamily] = useState('system-ui, -apple-system, sans-serif');
  const [fontSize, setFontSize] = useState(55); // percentage of canvas
  const [shape, setShape] = useState<'rounded' | 'circle' | 'square'>('rounded');

  // SVG State
  const [svgSource, setSvgSource] = useState(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="22" fill="#4f46e5" />
  <path d="M50 20 L80 80 L20 80 Z" fill="#ffffff" />
</svg>`
  );

  // Image Adjustment sliders
  const [paddingPercent, setPaddingPercent] = useState(0); // 0 to 40%
  const [cornerRadius, setCornerRadius] = useState(24); // px on 512px canvas (0 - 256)
  const [transparentBg, setTransparentBg] = useState(false);
  const [siteTitle, setSiteTitle] = useState('Toolique | Developer Suite');
  const [appDomain, setAppDomain] = useState('toolique.com');
  const [themeColor, setThemeColor] = useState('#4f46e5');

  // Tabbed view state
  const [previewTab, setPreviewTab] = useState<'browser' | 'mobile' | 'sizes' | 'grid'>('browser');
  const [codeTab, setCodeTab] = useState<'html' | 'nextjs' | 'manifest' | 'browserconfig'>('html');
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  // Master Canvas Ref for high-res 512x512 master rendering
  const masterCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [masterDataUrl, setMasterDataUrl] = useState<string>('');

  // Renders the master high-res 512x512 canvas
  const renderMasterCanvas = useCallback(() => {
    const canvas = masterCanvasRef.current || document.createElement('canvas');
    masterCanvasRef.current = canvas;
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 512, 512);

    // If source mode is UPLOAD and we have an image
    if (sourceMode === 'upload' && uploadedImageSrc) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Draw background if not transparent
        if (!transparentBg) {
          if (useGradient) {
            const grad = ctx.createLinearGradient(0, 0, 512, 512);
            grad.addColorStop(0, bgColor);
            grad.addColorStop(1, bgGradientEnd);
            ctx.fillStyle = grad;
          } else {
            ctx.fillStyle = bgColor;
          }
          if (cornerRadius > 0) {
            ctx.beginPath();
            ctx.roundRect(0, 0, 512, 512, cornerRadius);
            ctx.fill();
            ctx.clip();
          } else {
            ctx.fillRect(0, 0, 512, 512);
          }
        }

        // Draw image with padding
        const pad = (512 * paddingPercent) / 100;
        const targetW = 512 - pad * 2;
        const targetH = 512 - pad * 2;
        ctx.drawImage(img, pad, pad, targetW, targetH);
        setMasterDataUrl(canvas.toDataURL('image/png'));
      };
      img.src = uploadedImageSrc;
      return;
    }

    // If source mode is SVG
    if (sourceMode === 'svg') {
      const blob = new Blob([svgSource], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, 512, 512);
        URL.revokeObjectURL(url);
        setMasterDataUrl(canvas.toDataURL('image/png'));
      };
      img.src = url;
      return;
    }

    // Source mode is TEXT / EMOJI
    // 1. Draw shape & background
    if (!transparentBg) {
      ctx.save();
      if (shape === 'circle') {
        ctx.beginPath();
        ctx.arc(256, 256, 256, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
      } else if (shape === 'rounded') {
        const rad = cornerRadius > 0 ? cornerRadius : 120;
        ctx.beginPath();
        ctx.roundRect(0, 0, 512, 512, rad);
        ctx.closePath();
        ctx.clip();
      }

      if (useGradient) {
        const grad = ctx.createLinearGradient(0, 0, 512, 512);
        grad.addColorStop(0, bgColor);
        grad.addColorStop(1, bgGradientEnd);
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = bgColor;
      }
      ctx.fillRect(0, 0, 512, 512);
      ctx.restore();
    }

    // 2. Draw text / emoji
    if (customText.trim()) {
      ctx.save();
      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const calculatedFontSize = Math.round((512 * fontSize) / 100);
      ctx.font = `bold ${calculatedFontSize}px ${fontFamily}`;

      // Calculate vertical centering
      ctx.fillText(customText, 256, 266);
      ctx.restore();
    }

    setMasterDataUrl(canvas.toDataURL('image/png'));
  }, [
    sourceMode,
    uploadedImageSrc,
    transparentBg,
    useGradient,
    bgColor,
    bgGradientEnd,
    cornerRadius,
    paddingPercent,
    svgSource,
    shape,
    customText,
    textColor,
    fontSize,
    fontFamily
  ]);

  useEffect(() => {
    renderMasterCanvas();
  }, [renderMasterCanvas]);

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const resultStr = event.target.result as string;
          const img = new Image();
          img.onload = () => {
            setImageMeta({
              width: img.naturalWidth,
              height: img.naturalHeight,
              fileName: file.name
            });
            setUploadedImageSrc(resultStr);
            setSourceMode('upload');
          };
          img.src = resultStr;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Preset Apply Handler
  const handleApplyPreset = (preset: FaviconPreset) => {
    if (preset.type === 'svg' && preset.svgContent) {
      setSourceMode('svg');
      setSvgSource(preset.svgContent);
      setBgColor(preset.bgColor);
      return;
    }

    setSourceMode('text');
    setCustomText(preset.text || preset.emoji || '⚡');
    setBgColor(preset.bgColor);
    if (preset.bgGradientEnd) {
      setBgGradientEnd(preset.bgGradientEnd);
      setUseGradient(true);
    } else {
      setUseGradient(false);
    }
    setTextColor(preset.textColor);
    setFontFamily(preset.fontFamily);
    setShape(preset.shape);
    setTransparentBg(false);
  };

  // Helper to generate PNG data blob of arbitrary dimensions from master canvas
  const generatePngBlob = async (size: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const offscreen = document.createElement('canvas');
      offscreen.width = size;
      offscreen.height = size;
      const ctx = offscreen.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context failure'));
        return;
      }
      const img = new Image();
      img.onload = () => {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, size, size);
        offscreen.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Blob creation failure'));
        }, 'image/png');
      };
      img.onerror = () => reject(new Error('Image load error'));
      img.src = masterDataUrl;
    });
  };

  // Download individual PNG size
  const handleDownloadSize = async (size: number, fileName?: string) => {
    try {
      const blob = await generatePngBlob(size);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || `favicon-${size}x${size}.png`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  // Generate Multi-resolution Binary ICO file (16x16, 32x32, 48x48)
  const generateIcoBlob = async (): Promise<Blob> => {
    const sizes = [16, 32, 48];
    const pngBlobs = await Promise.all(sizes.map((s) => generatePngBlob(s)));
    const pngBuffers = await Promise.all(pngBlobs.map((b) => b.arrayBuffer()));

    const count = sizes.length;
    const headerSize = 6;
    const dirEntrySize = 16;
    let currentOffset = headerSize + dirEntrySize * count;

    // Total byte length calculation
    let totalLength = currentOffset;
    for (const buf of pngBuffers) {
      totalLength += buf.byteLength;
    }

    const icoArray = new Uint8Array(totalLength);
    const view = new DataView(icoArray.buffer);

    // 1. ICONDIR Header
    view.setUint16(0, 0, true); // Reserved (0)
    view.setUint16(2, 1, true); // Type 1 = ICO
    view.setUint16(4, count, true); // Number of images

    // 2. ICONDIRENTRY list
    for (let i = 0; i < count; i++) {
      const s = sizes[i];
      const buf = pngBuffers[i];
      const entryOffset = headerSize + i * dirEntrySize;

      view.setUint8(entryOffset + 0, s === 256 ? 0 : s); // Width
      view.setUint8(entryOffset + 1, s === 256 ? 0 : s); // Height
      view.setUint8(entryOffset + 2, 0); // Palette color count (0 = no palette)
      view.setUint8(entryOffset + 3, 0); // Reserved
      view.setUint16(entryOffset + 4, 1, true); // Color planes (1)
      view.setUint16(entryOffset + 6, 32, true); // Bits per pixel (32)
      view.setUint32(entryOffset + 8, buf.byteLength, true); // Image byte size
      view.setUint32(entryOffset + 12, currentOffset, true); // Data offset

      // Copy PNG buffer to data section
      icoArray.set(new Uint8Array(buf), currentOffset);
      currentOffset += buf.byteLength;
    }

    return new Blob([icoArray], { type: 'image/x-icon' });
  };

  // Download binary .ico file
  const handleDownloadIco = async () => {
    try {
      const blob = await generateIcoBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'favicon.ico';
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
  };

  // Code Strings for Exporters
  const htmlHeadSnippet = useMemo(() => {
    return `<!-- Recommended Modern Favicon Standard -->
<link rel="icon" type="image/x-icon" href="/favicon.ico" sizes="any" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />

<!-- Apple Touch Icon (iOS & iPadOS Home Screen) -->
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

<!-- Progressive Web App (PWA) Manifest -->
<link rel="manifest" href="/site.webmanifest" />

<!-- Windows & Microsoft Tile Metadata -->
<meta name="msapplication-TileColor" content="${themeColor}" />
<meta name="msapplication-config" content="/browserconfig.xml" />
<meta name="theme-color" content="${themeColor}" />`;
  }, [themeColor]);

  const nextJsSnippet = useMemo(() => {
    return `// In Next.js 13+ / 14+ App Router (src/app/layout.tsx)
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '${siteTitle}',
  description: 'Instant Developer Tools and Engineering Utilities',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
};`;
  }, [siteTitle]);

  const webManifestJson = useMemo(() => {
    return JSON.stringify(
      {
        name: siteTitle,
        short_name: siteTitle.split('|')[0].trim() || 'Toolique',
        icons: [
          {
            src: '/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        theme_color: themeColor,
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/'
      },
      null,
      2
    );
  }, [siteTitle, themeColor]);

  const browserConfigXml = useMemo(() => {
    return `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      <square150x150logo src="/mstile-150x150.png"/>
      <TileColor>${themeColor}</TileColor>
    </tile>
  </msapplication>
</browserconfig>`;
  }, [themeColor]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Full ZIP Bundle Exporter using JSZip
  const handleDownloadZipPackage = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      // 1. Generate ICO binary
      const icoBlob = await generateIcoBlob();
      zip.file('favicon.ico', icoBlob);

      // 2. Generate standard PNGs
      const pngSizes = [
        { size: 16, name: 'favicon-16x16.png' },
        { size: 32, name: 'favicon-32x32.png' },
        { size: 48, name: 'favicon-48x48.png' },
        { size: 180, name: 'apple-touch-icon.png' },
        { size: 192, name: 'android-chrome-192x192.png' },
        { size: 512, name: 'android-chrome-512x512.png' },
        { size: 150, name: 'mstile-150x150.png' }
      ];

      for (const item of pngSizes) {
        const b = await generatePngBlob(item.size);
        zip.file(item.name, b);
      }

      // 3. Add Config and Meta Files
      zip.file('site.webmanifest', webManifestJson);
      zip.file('browserconfig.xml', browserConfigXml);
      zip.file('html_head_tags.html', htmlHeadSnippet);

      const readmeContent = `Favicon Package Generated via Toolique India
Website: https://${appDomain}
Date: ${new Date().toISOString()}

========================================
DEPLOYMENT INSTRUCTIONS:
========================================
1. Extract all image files and site.webmanifest to the root directory (public/ or static/) of your web application.
2. Paste the HTML tags from "html_head_tags.html" inside your index.html or base template <head>...</head> tag.
3. For Next.js App Router, see the Next.js guide generated on Toolique Favicon Generator.`;
      zip.file('README.txt', readmeContent);

      // 4. Download compiled ZIP
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `favicon_package_${appDomain.replace(/[^a-z0-9]/gi, '_')}.zip`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to create ZIP package:', err);
    } finally {
      setIsZipping(false);
    }
  };

  // Health Audit Score Calculation
  const healthAnalysis = useMemo(() => {
    let score = 100;
    const issues: string[] = [];

    if (sourceMode === 'upload' && imageMeta) {
      if (imageMeta.width < 512 || imageMeta.height < 512) {
        score -= 20;
        issues.push(`Source image is ${imageMeta.width}×${imageMeta.height}px (512×512px or higher recommended for sharp Retina/PWA scaling).`);
      }
      if (imageMeta.width !== imageMeta.height) {
        score -= 15;
        issues.push('Source image is not a 1:1 square aspect ratio; automatic centering applied.');
      }
    }

    if (sourceMode === 'text' && customText.length > 3) {
      score -= 10;
      issues.push('Favicon text exceeds 3 characters; may look cluttered at 16×16px tab scale.');
    }

    return {
      score: Math.max(0, score),
      issues
    };
  }, [sourceMode, imageMeta, customText]);

  const handleReset = () => {
    setSourceMode('text');
    setCustomText('TQ');
    setBgColor('#4f46e5');
    setBgGradientEnd('#7c3aed');
    setUseGradient(true);
    setTextColor('#ffffff');
    setShape('rounded');
    setTransparentBg(false);
    setPaddingPercent(0);
    setCornerRadius(24);
    setFontSize(55);
    setSiteTitle('Toolique | Developer Suite');
    setAppDomain('toolique.com');
  };

  return (
    <div className="space-y-6 text-left">
      {/* Hidden Master Canvas for High-Res 512x512 exports */}
      <canvas ref={masterCanvasRef} className="hidden" />

      {/* AEO Instant Status Overview Card (Strict Zero Double Heading) */}
      <div className="bg-gradient-to-br from-indigo-50/90 via-white to-sky-50/70 dark:from-indigo-950/30 dark:via-zinc-900/60 dark:to-sky-950/20 border border-indigo-200/80 dark:border-indigo-900/40 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-600 text-white uppercase tracking-wider flex items-center gap-1">
                <Globe className="w-3 h-3" /> Favicon & App Icon Studio
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Multi-Res ICO, Apple Touch, PWA Manifest & SVG
              </span>
            </div>
            <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 flex-wrap">
              <span>Readiness Score: <strong className={`font-mono text-base ${healthAnalysis.score >= 90 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>{healthAnalysis.score}/100</strong></span>
              <span className="text-zinc-300 dark:text-zinc-700">|</span>
              <span>Mode: <strong className="capitalize text-indigo-600 dark:text-indigo-400">{sourceMode}</strong></span>
              <span className="text-zinc-300 dark:text-zinc-700">|</span>
              <span>Formats: <strong className="font-mono text-zinc-600 dark:text-zinc-400">ICO, PNG (16-512px), SVG, XML</strong></span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleCopyCode(htmlHeadSnippet)}
              className="px-3 py-1.5 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-200 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-indigo-500" />}
              <span>{copied ? 'Copied HTML!' : 'Copy Tags'}</span>
            </button>

            <button
              onClick={handleDownloadZipPackage}
              disabled={isZipping || !masterDataUrl}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isZipping ? 'Packaging ZIP...' : 'Download Favicon Package (.ZIP)'}</span>
            </button>
          </div>
        </div>

        {/* 1-Click Brand Archetypes */}
        <div className="mt-3 pt-3 border-t border-indigo-100/70 dark:border-indigo-900/30 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-indigo-500" /> Archetypes:
          </span>
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleApplyPreset(preset)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white/80 dark:bg-zinc-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/80 transition cursor-pointer"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Creator & Customizer Controls */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              {/* Mode Switcher Tabs */}
              <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                <button
                  onClick={() => setSourceMode('text')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    sourceMode === 'text'
                      ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <Type className="w-3.5 h-3.5" />
                  <span>Text / Emoji</span>
                </button>

                <button
                  onClick={() => setSourceMode('upload')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    sourceMode === 'upload'
                      ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Image</span>
                </button>

                <button
                  onClick={() => setSourceMode('svg')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    sourceMode === 'svg'
                      ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>SVG Vector</span>
                </button>
              </div>

              <button
                onClick={handleReset}
                className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 flex items-center gap-1 transition cursor-pointer"
                title="Reset to default settings"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {/* Mode 1: Text / Emoji Creator */}
            {sourceMode === 'text' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                      Text or Emoji (1–3 Chars)
                    </label>
                    <input
                      type="text"
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      maxLength={4}
                      placeholder="e.g. ⚡ or TQ"
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-base font-bold text-zinc-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                      Background Shape
                    </label>
                    <select
                      value={shape}
                      onChange={(e) => setShape(e.target.value as any)}
                      className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white"
                    >
                      <option value="rounded">Rounded Squircle</option>
                      <option value="circle">Perfect Circle</option>
                      <option value="square">Sharp Square</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                      Font Family
                    </label>
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white"
                    >
                      <option value="system-ui, -apple-system, sans-serif">Modern Sans-Serif</option>
                      <option value="Georgia, serif">Classic Serif (Georgia)</option>
                      <option value="Courier New, monospace">Developer Monospace</option>
                      <option value="Impact, fantasy">Heavy Bold (Impact)</option>
                      <option value="cursive">Handwritten / Script</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                        Font Scale ({fontSize}%)
                      </label>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={85}
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                </div>

                {/* Color Pickers */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 mb-1">Text Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-full px-2 py-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 mb-1">Background Start</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-full px-2 py-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 mb-1">Gradient End</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={bgGradientEnd}
                        onChange={(e) => setBgGradientEnd(e.target.value)}
                        className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={bgGradientEnd}
                        onChange={(e) => setBgGradientEnd(e.target.value)}
                        className="w-full px-2 py-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono font-semibold"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useGradient}
                      onChange={(e) => setUseGradient(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Enable Linear Gradient</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={transparentBg}
                      onChange={(e) => setTransparentBg(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Transparent Background</span>
                  </label>
                </div>
              </div>
            )}

            {/* Mode 2: Image Upload Dropzone */}
            {sourceMode === 'upload' && (
              <div className="space-y-4">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/svg+xml, image/gif"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-zinc-200 dark:border-zinc-700 hover:border-indigo-500/60 rounded-2xl p-8 text-center cursor-pointer hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 transition flex flex-col items-center justify-center gap-2.5"
                >
                  <Upload className="w-8 h-8 text-zinc-400 group-hover:text-indigo-500" />
                  <div>
                    <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      {uploadedImageSrc ? 'Click to select another image' : 'Click or Drag & Drop source image'}
                    </p>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                      Supports PNG, JPG, WebP, SVG, GIF (512×512px square recommended)
                    </p>
                  </div>
                  {imageMeta && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                      {imageMeta.fileName} ({imageMeta.width}×{imageMeta.height}px)
                    </span>
                  )}
                </div>

                {/* Adjustments for uploaded image */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                        Padding Margin ({paddingPercent}%)
                      </label>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={35}
                      value={paddingPercent}
                      onChange={(e) => setPaddingPercent(Number(e.target.value))}
                      className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                        Corner Rounding ({cornerRadius}px)
                      </label>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={256}
                      value={cornerRadius}
                      onChange={(e) => setCornerRadius(Number(e.target.value))}
                      className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={transparentBg}
                      onChange={(e) => setTransparentBg(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Preserve Transparent Background</span>
                  </label>
                </div>
              </div>
            )}

            {/* Mode 3: SVG Code Editor */}
            {sourceMode === 'svg' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                    SVG Code (`&lt;svg viewBox=&quot;0 0 100 100&quot;&gt;...&lt;/svg&gt;`)
                  </label>
                  <span className="text-[10px] text-zinc-400">Supports standard vector paths & gradients</span>
                </div>
                <textarea
                  value={svgSource}
                  onChange={(e) => setSvgSource(e.target.value)}
                  rows={7}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl font-mono text-xs text-indigo-300 leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  spellCheck={false}
                />
              </div>
            )}

            {/* Metadata Settings (Site Title & Domain) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <div>
                <label className="block text-[11px] font-medium text-zinc-500 mb-1">Website Title</label>
                <input
                  type="text"
                  value={siteTitle}
                  onChange={(e) => setSiteTitle(e.target.value)}
                  placeholder="My SaaS App"
                  className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-500 mb-1">Domain Hostname</label>
                <input
                  type="text"
                  value={appDomain}
                  onChange={(e) => setAppDomain(e.target.value)}
                  placeholder="yourdomain.com"
                  className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-500 mb-1">Theme Color</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="w-full px-2 py-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Social Card & Health Readiness Audit Card */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Favicon Readiness & Asset Health
              </span>
              <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full ${healthAnalysis.score >= 90 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                {healthAnalysis.score} / 100
              </span>
            </div>

            {healthAnalysis.issues.length === 0 ? (
              <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>All dimensions and scaling criteria meet modern multi-device standards!</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                {healthAnalysis.issues.map((issue, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{issue}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Multi-Device Previews & Exporters */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
            {/* Tab Selector */}
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 flex-wrap gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-indigo-500" /> Live Simulation
              </span>

              <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setPreviewTab('browser')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    previewTab === 'browser' ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-2xs' : 'text-zinc-500'
                  }`}
                >
                  Browser Tab
                </button>
                <button
                  onClick={() => setPreviewTab('mobile')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    previewTab === 'mobile' ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-2xs' : 'text-zinc-500'
                  }`}
                >
                  iOS & Android
                </button>
                <button
                  onClick={() => setPreviewTab('sizes')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    previewTab === 'sizes' ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-2xs' : 'text-zinc-500'
                  }`}
                >
                  All Dimensions
                </button>
              </div>
            </div>

            {/* TAB 1: Real Browser Tabs Mockup (Dark & Light) */}
            {previewTab === 'browser' && (
              <div className="space-y-4">
                {/* Dark Mode Browser Chrome Mockup */}
                <div className="rounded-xl border border-zinc-800 bg-[#1e1e24] overflow-hidden shadow-md">
                  {/* Browser Window Bar */}
                  <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#18181b] border-b border-zinc-800">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                    </div>

                    {/* Active Browser Tab */}
                    <div className="flex items-center gap-2 px-3 py-1 bg-[#27272a] rounded-t-lg text-xs font-medium text-zinc-200 max-w-[200px] truncate shadow-inner">
                      {masterDataUrl ? (
                        <img src={masterDataUrl} alt="tab-fav" className="w-3.5 h-3.5 object-contain rounded-xs shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 bg-indigo-500 rounded-xs" />
                      )}
                      <span className="truncate">{siteTitle}</span>
                      <span className="text-zinc-500 ml-auto hover:text-zinc-300">×</span>
                    </div>

                    <div className="w-8" />
                  </div>

                  {/* Browser Address Bar */}
                  <div className="p-2.5 bg-[#1f1f23] flex items-center gap-2">
                    <div className="w-full bg-[#2a2a30] px-3 py-1 rounded-md text-[11px] text-zinc-300 flex items-center gap-2 font-mono">
                      <span className="text-emerald-400">🔒 https://</span>
                      <span>{appDomain}/</span>
                    </div>
                  </div>

                  {/* Page Preview Container */}
                  <div className="p-6 text-center space-y-2 bg-[#121214] text-zinc-400">
                    <div className="w-16 h-16 mx-auto rounded-2xl overflow-hidden border border-zinc-800 shadow-lg p-2 bg-zinc-900/50 flex items-center justify-center">
                      {masterDataUrl ? (
                        <img src={masterDataUrl} alt="preview-large" className="w-full h-full object-contain" />
                      ) : (
                        <Globe className="w-8 h-8 text-indigo-500" />
                      )}
                    </div>
                    <p className="text-xs font-bold text-zinc-200">{siteTitle}</p>
                    <p className="text-[11px] text-zinc-500">Rendered in Dark Mode Browser Tab (16×16px Icon Resolution)</p>
                  </div>
                </div>

                {/* Light Mode Tab Preview */}
                <div className="rounded-xl border border-zinc-200 bg-zinc-100 overflow-hidden shadow-xs">
                  <div className="flex items-center justify-between px-3.5 py-2 bg-zinc-200/80 border-b border-zinc-200">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-400" />
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-t-lg text-xs font-medium text-zinc-800 max-w-[200px] truncate shadow-xs">
                      {masterDataUrl && (
                        <img src={masterDataUrl} alt="tab-fav-light" className="w-3.5 h-3.5 object-contain rounded-xs shrink-0" />
                      )}
                      <span className="truncate">{siteTitle}</span>
                      <span className="text-zinc-400 ml-auto">×</span>
                    </div>

                    <div className="w-8" />
                  </div>
                  <div className="p-2 bg-white flex items-center gap-2">
                    <div className="w-full bg-zinc-50 px-3 py-1 rounded-md text-[11px] text-zinc-700 font-mono border border-zinc-200">
                      <span className="text-zinc-400">https://</span>
                      <span>{appDomain}/</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: iOS & Android Home Screen Simulation */}
            {previewTab === 'mobile' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* iOS 180x180 Home Screen Mockup */}
                <div className="p-5 bg-gradient-to-b from-sky-400 via-indigo-500 to-purple-600 rounded-2xl text-center space-y-3 text-white shadow-md">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded-full">
                    iOS Home Screen (180×180)
                  </span>
                  <div className="pt-2">
                    <div className="w-16 h-16 mx-auto rounded-[14px] overflow-hidden shadow-2xl ring-1 ring-white/20 bg-white flex items-center justify-center">
                      {masterDataUrl && <img src={masterDataUrl} alt="ios-app" className="w-full h-full object-cover" />}
                    </div>
                    <span className="text-xs font-semibold mt-2 block drop-shadow-md truncate">
                      {siteTitle.split('|')[0].trim()}
                    </span>
                  </div>
                </div>

                {/* Android / Chrome PWA (192x192) */}
                <div className="p-5 bg-gradient-to-b from-zinc-800 to-zinc-950 rounded-2xl text-center space-y-3 text-white shadow-md">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">
                    Android PWA (192×192)
                  </span>
                  <div className="pt-2">
                    <div className="w-16 h-16 mx-auto rounded-full overflow-hidden shadow-2xl ring-2 ring-emerald-400/50 bg-white flex items-center justify-center">
                      {masterDataUrl && <img src={masterDataUrl} alt="android-app" className="w-full h-full object-cover" />}
                    </div>
                    <span className="text-xs font-semibold mt-2 block drop-shadow-md truncate">
                      {siteTitle.split('|')[0].trim()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: All Dimensions & Quick Downloads */}
            {previewTab === 'sizes' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { size: 16, label: '16 × 16 px', desc: 'Browser tab favicon', name: 'favicon-16x16.png' },
                    { size: 32, label: '32 × 32 px', desc: 'Standard desktop icon', name: 'favicon-32x32.png' },
                    { size: 48, label: '48 × 48 px', desc: 'Windows site icon', name: 'favicon-48x48.png' },
                    { size: 180, label: '180 × 180 px', desc: 'Apple Touch icon (iOS)', name: 'apple-touch-icon.png' },
                    { size: 192, label: '192 × 192 px', desc: 'Android / PWA standard', name: 'android-chrome-192x192.png' },
                    { size: 512, label: '512 × 512 px', desc: 'PWA splash & Retina', name: 'android-chrome-512x512.png' }
                  ].map((item) => (
                    <div
                      key={item.size}
                      className="p-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl flex flex-col justify-between gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-white dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-700 flex items-center justify-center p-0.5 overflow-hidden shrink-0">
                          {masterDataUrl && <img src={masterDataUrl} alt={item.label} className="w-full h-full object-contain" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-zinc-900 dark:text-white leading-tight">{item.label}</p>
                          <p className="text-[10px] text-zinc-500 truncate">{item.desc}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDownloadSize(item.size, item.name)}
                        className="w-full py-1 text-[11px] font-semibold bg-white dark:bg-zinc-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-zinc-200 dark:border-zinc-700 rounded-lg flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        <span>PNG</span>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleDownloadIco}
                    className="w-full py-2 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Standard Multi-Resolution `favicon.ico` (16, 32, 48px)</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Code Exporter Box */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
              {/* Exporter Tab buttons */}
              <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setCodeTab('html')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    codeTab === 'html' ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-2xs' : 'text-zinc-500'
                  }`}
                >
                  HTML &lt;head&gt;
                </button>
                <button
                  onClick={() => setCodeTab('nextjs')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    codeTab === 'nextjs' ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-2xs' : 'text-zinc-500'
                  }`}
                >
                  Next.js Metadata
                </button>
                <button
                  onClick={() => setCodeTab('manifest')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    codeTab === 'manifest' ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-2xs' : 'text-zinc-500'
                  }`}
                >
                  site.webmanifest
                </button>
                <button
                  onClick={() => setCodeTab('browserconfig')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    codeTab === 'browserconfig' ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-2xs' : 'text-zinc-500'
                  }`}
                >
                  browserconfig.xml
                </button>
              </div>

              <button
                onClick={() =>
                  handleCopyCode(
                    codeTab === 'html'
                      ? htmlHeadSnippet
                      : codeTab === 'nextjs'
                      ? nextJsSnippet
                      : codeTab === 'manifest'
                      ? webManifestJson
                      : browserConfigXml
                  )
                }
                className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            <pre className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-3.5 text-indigo-300 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-56">
              {codeTab === 'html'
                ? htmlHeadSnippet
                : codeTab === 'nextjs'
                ? nextJsSnippet
                : codeTab === 'manifest'
                ? webManifestJson
                : browserConfigXml}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

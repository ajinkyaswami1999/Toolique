import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload, Download, RotateCw, RotateCcw, Image as ImageIcon,
  Sparkles, Copy, Check, Eye, Layers, Type,
  Maximize2, Grid, Monitor, Smartphone,
  Palette, Sun, Contrast, Flame, Zap, Award,
  ZoomIn, Move, Link as LinkIcon,
  ShieldCheck, RefreshCw, AlertTriangle
} from 'lucide-react';

// Custom YouTube Icon SVG
const YouTubeIcon = ({ className = "w-4 h-4 text-red-600" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

// Preset dimension configurations
interface DimensionPreset {
  id: string;
  name: string;
  width: number;
  height: number;
  aspectRatio: string;
  category: string;
  badge?: string;
  description: string;
}

const DIMENSION_PRESETS: DimensionPreset[] = [
  {
    id: 'yt-std',
    name: 'YouTube Standard (HD)',
    width: 1280,
    height: 720,
    aspectRatio: '16:9',
    category: 'YouTube',
    badge: 'Recommended',
    description: 'Official YouTube standard resolution. Perfect 16:9 balance and fast load times.'
  },
  {
    id: 'yt-fhd',
    name: 'YouTube Full HD (1080p)',
    width: 1920,
    height: 1080,
    aspectRatio: '16:9',
    category: 'YouTube',
    badge: 'High DPI',
    description: 'Ultra-crisp 1080p thumbnail for Retina displays, 4K TVs, and large desktop screens.'
  },
  {
    id: 'yt-4k',
    name: 'YouTube 4K Ultra HD',
    width: 3840,
    height: 2160,
    aspectRatio: '16:9',
    category: 'YouTube',
    badge: 'Ultra Crisp',
    description: 'Master studio 4K resolution. Scaled down by YouTube without any pixelation.'
  },
  {
    id: 'yt-shorts',
    name: 'YouTube Shorts / Cover',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    category: 'YouTube',
    badge: 'Vertical',
    description: 'Vertical 9:16 cover for YouTube Shorts, Instagram Reels, and TikTok clips.'
  },
  {
    id: 'yt-community',
    name: 'Community Post / Square',
    width: 1080,
    height: 1080,
    aspectRatio: '1:1',
    category: 'YouTube',
    badge: 'Square',
    description: 'Square 1:1 format for YouTube Community tab updates, polls, and Instagram feeds.'
  },
  {
    id: 'yt-banner',
    name: 'YouTube Channel Banner',
    width: 2560,
    height: 1440,
    aspectRatio: '16:9',
    category: 'YouTube',
    badge: 'Header',
    description: 'Full channel header banner with safe desktop/mobile TV framing.'
  }
];

// High CTR Sample Templates
interface SampleTemplate {
  name: string;
  category: string;
  url: string;
  title: string;
  presetFilter: string;
  badgeText: string;
}

const SAMPLE_TEMPLATES: SampleTemplate[] = [
  {
    name: 'Cyberpunk Tech / AI',
    category: 'Tech',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1280&q=80',
    title: 'THE NEW AI UPDATE IS INSANE!',
    presetFilter: 'punch',
    badgeText: 'NEW 2026'
  },
  {
    name: 'Gaming Battle Royale',
    category: 'Gaming',
    url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1280&q=80',
    title: '100 PLAYERS vs PRO SQUAD!',
    presetFilter: 'vibrant',
    badgeText: 'MUST WATCH'
  },
  {
    name: 'Finance & Wealth Mastery',
    category: 'Finance',
    url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1280&q=80',
    title: 'HOW TO MAKE $10,000 / MONTH',
    presetFilter: 'cinematic',
    badgeText: '100% PROVEN'
  },
  {
    name: 'Epic Travel & Adventure',
    category: 'Vlog',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1280&q=80',
    title: 'WE VISITED THE SECRET ISLAND',
    presetFilter: 'vibrant',
    badgeText: 'DAY 14'
  }
];

// Color Grading Filter Presets
interface ColorFilterPreset {
  id: string;
  name: string;
  icon: any;
  brightness: number;
  contrast: number;
  saturation: number;
  warmth: number;
  vignette: number;
  description: string;
}

const COLOR_PRESETS: ColorFilterPreset[] = [
  {
    id: 'original',
    name: 'Original',
    icon: ImageIcon,
    brightness: 0,
    contrast: 0,
    saturation: 0,
    warmth: 0,
    vignette: 0,
    description: 'Natural colors without any grading applied.'
  },
  {
    id: 'punch',
    name: '🔥 High CTR Punch',
    icon: Flame,
    brightness: 8,
    contrast: 22,
    saturation: 35,
    warmth: 5,
    vignette: 20,
    description: 'High contrast and boosted saturation proven to increase YouTube click-through rate.'
  },
  {
    id: 'vibrant',
    name: '⚡ Vibrant Pop',
    icon: Zap,
    brightness: 12,
    contrast: 18,
    saturation: 45,
    warmth: 12,
    vignette: 10,
    description: 'Bright, glowing, rich tones ideal for gaming, tech, and lifestyle videos.'
  },
  {
    id: 'cinematic',
    name: '🎬 Cinematic Moody',
    icon: Sun,
    brightness: -5,
    contrast: 30,
    saturation: 15,
    warmth: -10,
    vignette: 40,
    description: 'Dramatic shadows, deep blacks, and stylized contrast for cinema/documentaries.'
  },
  {
    id: 'bright',
    name: '✨ High-Key Studio',
    icon: Sparkles,
    brightness: 20,
    contrast: 10,
    saturation: 10,
    warmth: 4,
    vignette: 0,
    description: 'Clean, radiant studio lighting for tutorials, makeup, and education.'
  },
  {
    id: 'bw',
    name: '🖤 High-Contrast B&W',
    icon: Contrast,
    brightness: 5,
    contrast: 35,
    saturation: -100,
    warmth: 0,
    vignette: 30,
    description: 'Timeless monochrome with bold punchy shadows for mystery and drama.'
  }
];

// Badge Presets
const BADGE_PRESETS = ['NEW', 'LIVE', '4K', 'MUST WATCH', 'EPISODE 01', 'VIRAL', '100% FREE', 'SECRET', 'TOP 10', 'HOW TO'];

type CropMode = 'fill' | 'fit' | 'stretch';
type BackgroundType = 'blur' | 'solid' | 'gradient' | 'black' | 'transparent';
type OutputFormat = 'jpeg' | 'png' | 'webp';
type InputMode = 'upload' | 'youtube' | 'url' | 'samples';
type ActiveControlTab = 'framing' | 'color' | 'text' | 'borders';
type PreviewMockup = 'none' | 'desktop' | 'mobile';

interface HistoryItem {
  id: string;
  dataUrl: string;
  width: number;
  height: number;
  format: string;
  sizeKb: number;
  timestamp: number;
}

export default function YouTubeThumbnailResizer() {
  // Input & Source State
  const [inputMode, setInputMode] = useState<InputMode>('upload');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [ytUrlInput, setYtUrlInput] = useState<string>('');
  const [imageUrlInput, setImageUrlInput] = useState<string>('');
  const [isLoadingImage, setIsLoadingImage] = useState<boolean>(false);
  const [inputError, setInputError] = useState<string | null>(null);

  // Preset Dimensions
  const [selectedPresetId, setSelectedPresetId] = useState<string>('yt-std');
  const [customWidth, setCustomWidth] = useState<number>(1280);
  const [customHeight, setCustomHeight] = useState<number>(720);
  const [isCustomResolution, setIsCustomResolution] = useState<boolean>(false);

  // Active Dimensions calculation
  const targetWidth = isCustomResolution
    ? customWidth
    : DIMENSION_PRESETS.find(p => p.id === selectedPresetId)?.width || 1280;
  const targetHeight = isCustomResolution
    ? customHeight
    : DIMENSION_PRESETS.find(p => p.id === selectedPresetId)?.height || 720;

  // Active tab in controls
  const [activeTab, setActiveTab] = useState<ActiveControlTab>('framing');

  // Framing & Transform Controls
  const [cropMode, setCropMode] = useState<CropMode>('fill');
  const [bgType, setBgType] = useState<BackgroundType>('blur');
  const [bgColor, setBgColor] = useState<string>('#0f172a');
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  // Color Grading & Filters
  const [activeColorPreset, setActiveColorPreset] = useState<string>('original');
  const [brightness, setBrightness] = useState<number>(0);
  const [contrast, setContrast] = useState<number>(0);
  const [saturation, setSaturation] = useState<number>(0);
  const [warmth, setWarmth] = useState<number>(0);
  const [vignette, setVignette] = useState<number>(0);

  // Text & Attention Badges Overlay
  const [enableText, setEnableText] = useState<boolean>(false);
  const [overlayText, setOverlayText] = useState<string>('HOW I SCALED TO 100K');
  const [textPosition, setTextPosition] = useState<'top' | 'middle' | 'bottom'>('top');
  const [textColor, setTextColor] = useState<string>('#ffffff');
  const [textBgColor, setTextBgColor] = useState<string>('#dc2626'); // Red accent banner
  const [textOutlineWidth, setTextOutlineWidth] = useState<number>(6);
  const [fontSize, setFontSize] = useState<number>(64);
  const [fontFamily, setFontFamily] = useState<string>('Impact, sans-serif');

  // Attention Badge
  const [enableBadge, setEnableBadge] = useState<boolean>(false);
  const [badgeText, setBadgeText] = useState<string>('MUST WATCH');
  const [badgePosition, setBadgePosition] = useState<'topLeft' | 'topRight' | 'bottomLeft'>('topLeft');
  const [badgeBgColor, setBadgeBgColor] = useState<string>('#e11d48'); // Rose red

  // Borders & Framing
  const [enableBorder, setEnableBorder] = useState<boolean>(false);
  const [borderWidth, setBorderWidth] = useState<number>(12);
  const [borderColor, setBorderColor] = useState<string>('#6366f1'); // Indigo
  const [borderGlow, setBorderGlow] = useState<boolean>(false);

  // Guides & Preview Overlays
  const [showSafeZones, setShowSafeZones] = useState<boolean>(true);
  const [showRuleOfThirds, setShowRuleOfThirds] = useState<boolean>(false);
  const [previewMockup, setPreviewMockup] = useState<PreviewMockup>('none');

  // Export Settings
  const [exportFormat, setExportFormat] = useState<OutputFormat>('jpeg');
  const [exportQuality, setExportQuality] = useState<number>(0.92);
  const [estimatedSizeKb, setEstimatedSizeKb] = useState<number>(0);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  // Canvas Drag & Pan State
  const [isDraggingCanvas, setIsDraggingCanvas] = useState<boolean>(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Session History
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ----------------------------------------------------
  // CLIPBOARD PASTE LISTENER
  // ----------------------------------------------------
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            loadImageFromFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // ----------------------------------------------------
  // IMAGE LOADERS
  // ----------------------------------------------------
  const loadImageFromFile = (file: File) => {
    setIsLoadingImage(true);
    setInputError(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageSrc(event.target.result as string);
        setIsLoadingImage(false);
      }
    };
    reader.onerror = () => {
      setInputError('Failed to read selected image file.');
      setIsLoadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    loadImageFromFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      loadImageFromFile(file);
    }
  };

  // Extract Thumbnail from YouTube URL or Video ID
  const fetchYouTubeThumbnail = async (inputStr: string) => {
    if (!inputStr.trim()) return;
    setIsLoadingImage(true);
    setInputError(null);

    // Extract YouTube Video ID regex
    const ytRegex = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/;
    const match = inputStr.trim().match(ytRegex);
    const videoId = match ? match[1] : inputStr.trim().length === 11 ? inputStr.trim() : null;

    if (!videoId) {
      setInputError('Please enter a valid YouTube video URL or 11-character Video ID.');
      setIsLoadingImage(false);
      return;
    }

    // Try Maxres (1280x720) first, fallback to hqdefault (480x360)
    const maxResUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
    const hqUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    try {
      const testImg = new Image();
      testImg.crossOrigin = 'anonymous';
      testImg.onload = () => {
        if (testImg.naturalWidth === 120) {
          loadImageFromUrl(hqUrl, `youtube-${videoId}-thumbnail.jpg`);
        } else {
          loadImageFromUrl(maxResUrl, `youtube-${videoId}-thumbnail.jpg`);
        }
      };
      testImg.onerror = () => {
        loadImageFromUrl(hqUrl, `youtube-${videoId}-thumbnail.jpg`);
      };
      testImg.src = maxResUrl;
    } catch {
      loadImageFromUrl(hqUrl, `youtube-${videoId}-thumbnail.jpg`);
    }
  };

  const loadImageFromUrl = async (url: string, defaultName = 'remote-image.jpg') => {
    setIsLoadingImage(true);
    setInputError(null);

    try {
      const response = await fetch(url, { mode: 'cors' });
      if (!response.ok) throw new Error('Network response not ok');
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImageSrc(e.target.result as string);
          setFileName(defaultName);
          setIsLoadingImage(false);
        }
      };
      reader.readAsDataURL(blob);
    } catch {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        const ctx = c.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          try {
            setImageSrc(c.toDataURL('image/jpeg', 0.95));
            setFileName(defaultName);
          } catch {
            setInputError('CORS security blocked this remote image. Please download it and upload directly.');
          }
        }
        setIsLoadingImage(false);
      };
      img.onerror = () => {
        setInputError('Could not load image from the provided URL. Please check the link or upload directly.');
        setIsLoadingImage(false);
      };
      img.src = url;
    }
  };

  const loadPresetTemplate = (template: SampleTemplate) => {
    loadImageFromUrl(template.url, `${template.name.toLowerCase().replace(/\s+/g, '-')}.jpg`);
    setOverlayText(template.title);
    setEnableText(true);
    setEnableBadge(true);
    setBadgeText(template.badgeText);
    applyColorPreset(template.presetFilter);
  };

  // ----------------------------------------------------
  // COLOR PRESET APPLIER
  // ----------------------------------------------------
  const applyColorPreset = (presetId: string) => {
    setActiveColorPreset(presetId);
    const p = COLOR_PRESETS.find(cp => cp.id === presetId);
    if (!p) return;
    setBrightness(p.brightness);
    setContrast(p.contrast);
    setSaturation(p.saturation);
    setWarmth(p.warmth);
    setVignette(p.vignette);
  };

  // ----------------------------------------------------
  // LIVE FILE SIZE ESTIMATOR
  // ----------------------------------------------------
  const calculateFileSize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const mime = exportFormat === 'png' ? 'image/png' : exportFormat === 'webp' ? 'image/webp' : 'image/jpeg';
    const dataUrl = canvas.toDataURL(mime, exportQuality);
    const head = `data:${mime};base64,`;
    const byteSize = Math.round((dataUrl.length - head.length) * 3 / 4);
    setEstimatedSizeKb(Math.round(byteSize / 1024));
  };

  // ----------------------------------------------------
  // CANVAS RENDERING ENGINE
  // ----------------------------------------------------
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // 1. Set Canvas Buffer Dimensions
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    ctx.clearRect(0, 0, targetWidth, targetHeight);

    // 2. Render Canvas Background
    if (bgType === 'solid') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    } else if (bgType === 'gradient') {
      const grad = ctx.createLinearGradient(0, 0, targetWidth, targetHeight);
      grad.addColorStop(0, '#1e1b4b');
      grad.addColorStop(1, '#312e81');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    } else if (bgType === 'black') {
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    } else if (bgType === 'blur' && cropMode === 'fit') {
      ctx.save();
      ctx.filter = 'blur(35px) brightness(0.7) saturate(1.4)';
      ctx.drawImage(img, -40, -40, targetWidth + 80, targetHeight + 80);
      ctx.restore();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    } else {
      ctx.fillStyle = exportFormat === 'jpeg' ? '#09090b' : 'rgba(0,0,0,0)';
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    }

    // 3. Render Main Image with Transforms & Color Filters
    ctx.save();
    ctx.translate(targetWidth / 2, targetHeight / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

    let drawWidth = 0;
    let drawHeight = 0;

    if (cropMode === 'stretch') {
      drawWidth = targetWidth * zoom;
      drawHeight = targetHeight * zoom;
    } else {
      const scaleX = targetWidth / img.width;
      const scaleY = targetHeight / img.height;
      const baseScale = cropMode === 'fill' ? Math.max(scaleX, scaleY) : Math.min(scaleX, scaleY);
      const finalScale = baseScale * zoom;
      drawWidth = img.width * finalScale;
      drawHeight = img.height * finalScale;
    }

    const bVal = 100 + brightness;
    const cVal = 100 + contrast;
    const sVal = 100 + saturation;
    const hVal = warmth * 1.5;

    ctx.filter = `brightness(${bVal}%) contrast(${cVal}%) saturate(${sVal}%) hue-rotate(${hVal}deg)`;

    ctx.drawImage(
      img,
      -drawWidth / 2 + offsetX,
      -drawHeight / 2 + offsetY,
      drawWidth,
      drawHeight
    );

    ctx.restore();

    // 4. Render Radial Vignette
    if (vignette > 0) {
      ctx.save();
      const radius = Math.max(targetWidth, targetHeight) / 1.1;
      const radGrad = ctx.createRadialGradient(
        targetWidth / 2,
        targetHeight / 2,
        radius * 0.4,
        targetWidth / 2,
        targetHeight / 2,
        radius
      );
      radGrad.addColorStop(0, 'rgba(0,0,0,0)');
      radGrad.addColorStop(1, `rgba(0,0,0,${(vignette / 100) * 0.85})`);
      ctx.fillStyle = radGrad;
      ctx.fillRect(0, 0, targetWidth, targetHeight);
      ctx.restore();
    }

    // 5. Render Outer Border
    if (enableBorder && borderWidth > 0) {
      ctx.save();
      ctx.lineWidth = borderWidth;
      ctx.strokeStyle = borderColor;

      if (borderGlow) {
        ctx.shadowColor = borderColor;
        ctx.shadowBlur = borderWidth * 2;
      }

      ctx.strokeRect(borderWidth / 2, borderWidth / 2, targetWidth - borderWidth, targetHeight - borderWidth);
      ctx.restore();
    }

    // 6. Render Headline Text Overlay
    if (enableText && overlayText.trim()) {
      ctx.save();
      ctx.font = `900 ${fontSize}px ${fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const paddingX = 24;
      const paddingY = 16;
      const textMetrics = ctx.measureText(overlayText.toUpperCase());
      const textWidth = textMetrics.width;
      const textHeight = fontSize * 1.15;

      let textY = targetHeight * 0.2;
      if (textPosition === 'middle') textY = targetHeight * 0.5;
      if (textPosition === 'bottom') textY = targetHeight * 0.78;

      const textX = targetWidth / 2;

      // Draw Background Banner Box
      ctx.fillStyle = textBgColor;
      ctx.globalAlpha = 0.95;
      const boxX = textX - textWidth / 2 - paddingX;
      const boxY = textY - textHeight / 2 - paddingY / 2;
      const boxW = textWidth + paddingX * 2;
      const boxH = textHeight + paddingY;

      ctx.beginPath();
      const r = 12;
      ctx.roundRect ? ctx.roundRect(boxX, boxY, boxW, boxH, r) : ctx.rect(boxX, boxY, boxW, boxH);
      ctx.fill();
      ctx.globalAlpha = 1.0;

      // Draw Bold Text Stroke / Outline
      if (textOutlineWidth > 0) {
        ctx.lineWidth = textOutlineWidth;
        ctx.strokeStyle = '#000000';
        ctx.lineJoin = 'miter';
        ctx.miterLimit = 2;
        ctx.strokeText(overlayText.toUpperCase(), textX, textY);
      }

      // Draw Text Fill
      ctx.fillStyle = textColor;
      ctx.fillText(overlayText.toUpperCase(), textX, textY);

      ctx.restore();
    }

    // 7. Render Attention Badge
    if (enableBadge && badgeText.trim()) {
      ctx.save();
      const badgeFontSize = Math.max(18, Math.round(fontSize * 0.45));
      ctx.font = `900 ${badgeFontSize}px ${fontFamily}`;
      ctx.textBaseline = 'middle';

      const bPaddingX = 20;
      const bMetrics = ctx.measureText(badgeText.toUpperCase());
      const bWidth = bMetrics.width + bPaddingX * 2;
      const bHeight = badgeFontSize * 1.8;

      let bX = 36;
      let bY = 36;
      if (badgePosition === 'topRight') bX = targetWidth - bWidth - 36;
      if (badgePosition === 'bottomLeft') bY = targetHeight - bHeight - 36;

      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 12;
      ctx.fillStyle = badgeBgColor;

      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(bX, bY, bWidth, bHeight, 10) : ctx.rect(bX, bY, bWidth, bHeight);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(badgeText.toUpperCase(), bX + bWidth / 2, bY + bHeight / 2);

      ctx.restore();
    }

    calculateFileSize();
  }, [
    targetWidth, targetHeight, cropMode, bgType, bgColor, zoom, rotation,
    offsetX, offsetY, flipH, flipV, brightness, contrast, saturation,
    warmth, vignette, enableBorder, borderWidth, borderColor, borderGlow,
    enableText, overlayText, textPosition, textColor, textBgColor,
    textOutlineWidth, fontSize, fontFamily, enableBadge, badgeText,
    badgePosition, badgeBgColor, exportFormat
  ]);

  // Load Image Object onto ref
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      imageRef.current = img;
      draw();
    };
  }, [imageSrc, draw]);

  // Trigger draw on updates
  useEffect(() => {
    draw();
  }, [draw]);

  // ----------------------------------------------------
  // DIRECT CANVAS DRAGGING / PANNING
  // ----------------------------------------------------
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDraggingCanvas(true);
    setDragStartPos({ x: e.clientX - offsetX, y: e.clientY - offsetY });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingCanvas) return;
    const newX = e.clientX - dragStartPos.x;
    const newY = e.clientY - dragStartPos.y;
    setOffsetX(Math.max(-targetWidth, Math.min(targetWidth, newX)));
    setOffsetY(Math.max(-targetHeight, Math.min(targetHeight, newY)));
  };

  const handleCanvasMouseUp = () => {
    setIsDraggingCanvas(false);
  };

  const handleCanvasWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.08 : -0.08;
    setZoom(prev => Math.max(0.2, Math.min(4.0, parseFloat((prev + delta).toFixed(2)))));
  };

  // ----------------------------------------------------
  // EXPORT & DOWNLOAD ACTIONS
  // ----------------------------------------------------
  const downloadThumbnail = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const mimeType = exportFormat === 'png' ? 'image/png' : exportFormat === 'webp' ? 'image/webp' : 'image/jpeg';
    const ext = exportFormat === 'jpeg' ? 'jpg' : exportFormat;
    const dataUrl = canvas.toDataURL(mimeType, exportQuality);

    const item: HistoryItem = {
      id: `thumb-${Date.now()}`,
      dataUrl,
      width: targetWidth,
      height: targetHeight,
      format: ext.toUpperCase(),
      sizeKb: estimatedSizeKb,
      timestamp: Date.now()
    };
    setHistory(prev => [item, ...prev.slice(0, 7)]);

    const link = document.createElement('a');
    link.download = `youtube-thumbnail-${targetWidth}x${targetHeight}-${Date.now()}.${ext}`;
    link.href = dataUrl;
    link.click();
  };

  const copyImageToClipboard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopiedNotification(true);
        setTimeout(() => setCopiedNotification(false), 2500);
      }, 'image/png');
    } catch {
      alert('Direct image clipboard copy is not supported on this browser. Use Download instead.');
    }
  };

  const autoOptimizeForYouTube = () => {
    setExportFormat('jpeg');
    setExportQuality(0.85);
    if (targetWidth > 1920) {
      setSelectedPresetId('yt-std');
      setIsCustomResolution(false);
    }
  };

  const resetFraming = () => {
    setZoom(1);
    setRotation(0);
    setOffsetX(0);
    setOffsetY(0);
    setFlipH(false);
    setFlipV(false);
    setCropMode('fill');
    setBgType('blur');
  };

  const resetColors = () => {
    applyColorPreset('original');
  };

  return (
    <div className="w-full space-y-6 text-left">
      {/* ---------------------------------------------------- */}
      {/* TOP BAR: Presets, Resolution Selector & Quick Actions */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        {/* Preset Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider mr-1 flex items-center gap-1.5">
            <YouTubeIcon className="w-4 h-4 text-red-600" />
            <span>Preset:</span>
          </span>
          {DIMENSION_PRESETS.map((preset) => {
            const isSelected = !isCustomResolution && selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => {
                  setSelectedPresetId(preset.id);
                  setIsCustomResolution(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-750'
                }`}
              >
                <span>{preset.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                  isSelected ? 'bg-indigo-700/80 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'
                }`}>
                  {preset.width}x{preset.height}
                </span>
              </button>
            );
          })}
          <button
            onClick={() => setIsCustomResolution(true)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              isCustomResolution
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-750'
            }`}
          >
            <span>Custom Size</span>
          </button>
        </div>

        {/* Custom Resolution Inputs if active */}
        {isCustomResolution && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-xl">
              <input
                type="number"
                value={customWidth}
                onChange={(e) => setCustomWidth(Math.max(100, parseInt(e.target.value) || 100))}
                className="w-16 bg-transparent text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none text-center"
              />
              <span className="text-zinc-400 text-xs">×</span>
              <input
                type="number"
                value={customHeight}
                onChange={(e) => setCustomHeight(Math.max(100, parseInt(e.target.value) || 100))}
                className="w-16 bg-transparent text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none text-center"
              />
              <span className="text-[10px] font-bold text-zinc-400">PX</span>
            </div>
          </div>
        )}

        {/* Reset / New Image */}
        {imageSrc && (
          <div className="flex items-center gap-3">
            {fileName && (
              <span className="text-xs text-zinc-500 truncate max-w-[140px] font-mono hidden sm:inline" title={fileName}>
                {fileName}
              </span>
            )}
            <button
              onClick={() => {
                setImageSrc(null);
                setFileName('');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-red-500 hover:border-red-400/40 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Upload New Image</span>
            </button>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* MAIN TWO-COLUMN WORKSPACE */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ==================================================== */}
        {/* LEFT COLUMN: Controls & Studio Tools */}
        {/* ==================================================== */}
        <div className="lg:col-span-5 saas-card p-6 space-y-6">
          {!imageSrc ? (
            <div className="space-y-5">
              {/* Input Mode Tabs */}
              <div className="grid grid-cols-4 gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl">
                <button
                  onClick={() => setInputMode('upload')}
                  className={`py-2 rounded-lg text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                    inputMode === 'upload' ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload</span>
                </button>
                <button
                  onClick={() => setInputMode('youtube')}
                  className={`py-2 rounded-lg text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                    inputMode === 'youtube' ? 'bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <YouTubeIcon className="w-4 h-4 text-red-600" />
                  <span>YouTube</span>
                </button>
                <button
                  onClick={() => setInputMode('url')}
                  className={`py-2 rounded-lg text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                    inputMode === 'url' ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <LinkIcon className="w-4 h-4" />
                  <span>Image URL</span>
                </button>
                <button
                  onClick={() => setInputMode('samples')}
                  className={`py-2 rounded-lg text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                    inputMode === 'samples' ? 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Templates</span>
                </button>
              </div>

              {/* Tab 1: File Upload / Drag & Drop */}
              {inputMode === 'upload' && (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center hover:border-indigo-500/60 transition cursor-pointer group bg-zinc-50/50 dark:bg-zinc-950/20"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition">
                    <Upload className="w-7 h-7" />
                  </div>
                  <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                    Drag & Drop Thumbnail Image
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    or click to browse local files (PNG, JPG, WEBP)
                  </p>
                  <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-200/60 dark:bg-zinc-800 text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">
                    <span>Pro-tip: Hit</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 text-[10px] font-mono shadow-xs">Ctrl+V</kbd>
                    <span>to paste screenshot</span>
                  </div>
                </div>
              )}

              {/* Tab 2: YouTube Video Thumbnail Fetcher */}
              {inputMode === 'youtube' && (
                <div className="space-y-4 p-4 rounded-xl bg-red-50/50 dark:bg-red-950/10 border border-red-200/50 dark:border-red-900/30">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <YouTubeIcon className="w-5 h-5 text-red-600" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">Extract from YouTube Video</h4>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Paste any YouTube video link or 11-digit video ID to import its existing HD/Max-Res thumbnail.
                  </p>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                      value={ytUrlInput}
                      onChange={(e) => setYtUrlInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium focus:border-red-500 focus:outline-none"
                    />
                    <button
                      onClick={() => fetchYouTubeThumbnail(ytUrlInput)}
                      disabled={isLoadingImage || !ytUrlInput.trim()}
                      className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isLoadingImage ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Fetching High-Res Thumbnail...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>Fetch & Load Thumbnail</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 3: Remote Image URL */}
              {inputMode === 'url' && (
                <div className="space-y-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                    <LinkIcon className="w-4 h-4" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">Fetch Remote Image</h4>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium focus:border-indigo-500 focus:outline-none"
                    />
                    <button
                      onClick={() => loadImageFromUrl(imageUrlInput)}
                      disabled={isLoadingImage || !imageUrlInput.trim()}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isLoadingImage ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Downloading Image...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>Load from URL</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 4: 1-Click Sample Templates */}
              {inputMode === 'samples' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-500 uppercase">High CTR Templates</span>
                    <span className="text-[10px] text-zinc-400 font-semibold">1-Click Load</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {SAMPLE_TEMPLATES.map((sample, idx) => (
                      <button
                        key={idx}
                        onClick={() => loadPresetTemplate(sample)}
                        className="group p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-500/50 transition text-left cursor-pointer"
                      >
                        <div className="aspect-video rounded-lg overflow-hidden mb-2 bg-zinc-800">
                          <img
                            src={sample.url}
                            alt={sample.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                        </div>
                        <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">{sample.name}</p>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{sample.category}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Error Message */}
              {inputError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{inputError}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              {/* Studio Control Navigation Tabs */}
              <div className="grid grid-cols-4 gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl">
                <button
                  onClick={() => setActiveTab('framing')}
                  className={`py-2 rounded-lg text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                    activeTab === 'framing'
                      ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <Maximize2 className="w-4 h-4" />
                  <span>Framing</span>
                </button>
                <button
                  onClick={() => setActiveTab('color')}
                  className={`py-2 rounded-lg text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                    activeTab === 'color'
                      ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <Palette className="w-4 h-4" />
                  <span>Grade</span>
                </button>
                <button
                  onClick={() => setActiveTab('text')}
                  className={`py-2 rounded-lg text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                    activeTab === 'text'
                      ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <Type className="w-4 h-4" />
                  <span>Text & Badge</span>
                </button>
                <button
                  onClick={() => setActiveTab('borders')}
                  className={`py-2 rounded-lg text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                    activeTab === 'borders'
                      ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Borders</span>
                </button>
              </div>

              {/* ==================================================== */}
              {/* TAB 1: FRAMING & TRANSFORM */}
              {/* ==================================================== */}
              {activeTab === 'framing' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold text-zinc-500 uppercase">
                      <span>Crop / Scale Mode</span>
                      <button
                        onClick={resetFraming}
                        className="text-indigo-500 hover:text-indigo-600 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset Framing</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setCropMode('fill')}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                          cropMode === 'fill'
                            ? 'bg-indigo-600 text-white border-transparent shadow-sm'
                            : 'bg-zinc-50/50 dark:bg-zinc-900/30 text-zinc-700 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800'
                        }`}
                      >
                        Fill Frame (Cover)
                      </button>
                      <button
                        onClick={() => setCropMode('fit')}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                          cropMode === 'fit'
                            ? 'bg-indigo-600 text-white border-transparent shadow-sm'
                            : 'bg-zinc-50/50 dark:bg-zinc-900/30 text-zinc-700 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800'
                        }`}
                      >
                        Fit Frame (Letterbox)
                      </button>
                      <button
                        onClick={() => setCropMode('stretch')}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                          cropMode === 'stretch'
                            ? 'bg-indigo-600 text-white border-transparent shadow-sm'
                            : 'bg-zinc-50/50 dark:bg-zinc-900/30 text-zinc-700 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800'
                        }`}
                      >
                        Stretch Fit
                      </button>
                    </div>
                  </div>

                  {/* Letterbox Background Options */}
                  {cropMode === 'fit' && (
                    <div className="space-y-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800">
                      <label className="text-[11px] font-bold text-zinc-500 uppercase">Letterbox Background</label>
                      <div className="grid grid-cols-4 gap-1.5">
                        <button
                          onClick={() => setBgType('blur')}
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition cursor-pointer ${
                            bgType === 'blur'
                              ? 'bg-indigo-600 text-white border-transparent'
                              : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800'
                          }`}
                        >
                          Blurred Glass
                        </button>
                        <button
                          onClick={() => setBgType('black')}
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition cursor-pointer ${
                            bgType === 'black'
                              ? 'bg-indigo-600 text-white border-transparent'
                              : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800'
                          }`}
                        >
                          Pitch Black
                        </button>
                        <button
                          onClick={() => setBgType('gradient')}
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition cursor-pointer ${
                            bgType === 'gradient'
                              ? 'bg-indigo-600 text-white border-transparent'
                              : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800'
                          }`}
                        >
                          Gradient
                        </button>
                        <button
                          onClick={() => setBgType('solid')}
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition cursor-pointer ${
                            bgType === 'solid'
                              ? 'bg-indigo-600 text-white border-transparent'
                              : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800'
                          }`}
                        >
                          Solid Color
                        </button>
                      </div>
                      {bgType === 'solid' && (
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="color"
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            className="w-8 h-8 rounded-lg border border-zinc-300 dark:border-zinc-700 cursor-pointer p-0.5 bg-transparent"
                          />
                          <span className="text-xs font-mono text-zinc-500">{bgColor}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Zoom Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      <span className="flex items-center gap-1.5">
                        <ZoomIn className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Scale / Zoom</span>
                      </span>
                      <span>{Math.round(zoom * 100)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={0.2}
                        max={3.5}
                        step={0.02}
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                      <button
                        onClick={() => setZoom(1)}
                        className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 cursor-pointer"
                      >
                        100%
                      </button>
                    </div>
                  </div>

                  {/* Pan Offsets X & Y */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-zinc-500">
                        <span>Position X</span>
                        <span>{offsetX}px</span>
                      </div>
                      <input
                        type="range"
                        min={-Math.round(targetWidth * 0.8)}
                        max={Math.round(targetWidth * 0.8)}
                        value={offsetX}
                        onChange={(e) => setOffsetX(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-zinc-500">
                        <span>Position Y</span>
                        <span>{offsetY}px</span>
                      </div>
                      <input
                        type="range"
                        min={-Math.round(targetHeight * 0.8)}
                        max={Math.round(targetHeight * 0.8)}
                        value={offsetY}
                        onChange={(e) => setOffsetY(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Rotation Slider & Quick 90 deg Rotations */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      <span className="flex items-center gap-1.5">
                        <RotateCw className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Rotation</span>
                      </span>
                      <span>{rotation}°</span>
                    </div>
                    <input
                      type="range"
                      min={-180}
                      max={180}
                      value={rotation}
                      onChange={(e) => setRotation(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setRotation((prev) => (prev - 90 < -180 ? 270 + (prev - 90) : prev - 90))}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 cursor-pointer flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>-90°</span>
                        </button>
                        <button
                          onClick={() => setRotation((prev) => (prev + 90 > 180 ? -270 + (prev + 90) : prev + 90))}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 cursor-pointer flex items-center gap-1"
                        >
                          <RotateCw className="w-3 h-3" />
                          <span>+90°</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setFlipH(!flipH)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                            flipH
                              ? 'bg-indigo-600 text-white border-transparent'
                              : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
                          }`}
                        >
                          Flip H
                        </button>
                        <button
                          onClick={() => setFlipV(!flipV)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                            flipV
                              ? 'bg-indigo-600 text-white border-transparent'
                              : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
                          }`}
                        >
                          Flip V
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* TAB 2: COLOR GRADE & FILTERS */}
              {/* ==================================================== */}
              {activeTab === 'color' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-zinc-500 uppercase">
                      <span>Creator Color Grades</span>
                      <button
                        onClick={resetColors}
                        className="text-indigo-500 hover:text-indigo-600 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset Colors</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {COLOR_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => applyColorPreset(preset.id)}
                          className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                            activeColorPreset === preset.id
                              ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-xs'
                              : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300'
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${
                            activeColorPreset === preset.id
                              ? 'bg-indigo-600 text-white'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                          }`}>
                            <preset.icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold">{preset.name}</p>
                            <p className="text-[10px] text-zinc-400 line-clamp-1">{preset.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        <span>Brightness</span>
                        <span>{brightness > 0 ? `+${brightness}` : brightness}%</span>
                      </div>
                      <input
                        type="range"
                        min={-50}
                        max={50}
                        value={brightness}
                        onChange={(e) => {
                          setBrightness(parseInt(e.target.value));
                          setActiveColorPreset('custom');
                        }}
                        className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        <span>Contrast</span>
                        <span>{contrast > 0 ? `+${contrast}` : contrast}%</span>
                      </div>
                      <input
                        type="range"
                        min={-50}
                        max={70}
                        value={contrast}
                        onChange={(e) => {
                          setContrast(parseInt(e.target.value));
                          setActiveColorPreset('custom');
                        }}
                        className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        <span>Saturation</span>
                        <span>{saturation > 0 ? `+${saturation}` : saturation}%</span>
                      </div>
                      <input
                        type="range"
                        min={-100}
                        max={100}
                        value={saturation}
                        onChange={(e) => {
                          setSaturation(parseInt(e.target.value));
                          setActiveColorPreset('custom');
                        }}
                        className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        <span>Warmth / Hue Tint</span>
                        <span>{warmth > 0 ? `+${warmth}` : warmth}°</span>
                      </div>
                      <input
                        type="range"
                        min={-40}
                        max={40}
                        value={warmth}
                        onChange={(e) => {
                          setWarmth(parseInt(e.target.value));
                          setActiveColorPreset('custom');
                        }}
                        className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        <span>Edge Vignette</span>
                        <span>{vignette}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={vignette}
                        onChange={(e) => {
                          setVignette(parseInt(e.target.value));
                          setActiveColorPreset('custom');
                        }}
                        className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* TAB 3: TEXT & ATTENTION BADGES */}
              {/* ==================================================== */}
              {activeTab === 'text' && (
                <div className="space-y-5">
                  <div className="space-y-3 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                        <Type className="w-4 h-4 text-indigo-500" />
                        <span>Headline Text Overlay</span>
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={enableText}
                          onChange={(e) => setEnableText(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    {enableText && (
                      <div className="space-y-3 pt-1">
                        <input
                          type="text"
                          value={overlayText}
                          onChange={(e) => setOverlayText(e.target.value)}
                          placeholder="ENTER BOLD HOOK TEXT..."
                          className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-black uppercase tracking-wide focus:border-indigo-500 focus:outline-none"
                        />

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Vertical Position</label>
                            <select
                              value={textPosition}
                              onChange={(e) => setTextPosition(e.target.value as any)}
                              className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold"
                            >
                              <option value="top">Top Third</option>
                              <option value="middle">Center</option>
                              <option value="bottom">Lower Third</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Font Size ({fontSize}px)</label>
                            <input
                              type="range"
                              min={32}
                              max={120}
                              value={fontSize}
                              onChange={(e) => setFontSize(parseInt(e.target.value))}
                              className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 mt-2"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Font Style</label>
                            <select
                              value={fontFamily}
                              onChange={(e) => setFontFamily(e.target.value)}
                              className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold"
                            >
                              <option value="Impact, sans-serif">Impact Bold</option>
                              <option value="Arial Black, sans-serif">Arial Black</option>
                              <option value="Montserrat, sans-serif">Montserrat Black</option>
                              <option value="system-ui, sans-serif">System Sans Bold</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Outline ({textOutlineWidth}px)</label>
                            <input
                              type="range"
                              min={0}
                              max={16}
                              value={textOutlineWidth}
                              onChange={(e) => setTextOutlineWidth(parseInt(e.target.value))}
                              className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 mt-2"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Text Color</label>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="color"
                                value={textColor}
                                onChange={(e) => setTextColor(e.target.value)}
                                className="w-7 h-7 rounded border border-zinc-300 dark:border-zinc-700 cursor-pointer p-0 bg-transparent"
                              />
                              <span className="text-[10px] font-mono text-zinc-500">{textColor}</span>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Banner BG</label>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="color"
                                value={textBgColor}
                                onChange={(e) => setTextBgColor(e.target.value)}
                                className="w-7 h-7 rounded border border-zinc-300 dark:border-zinc-700 cursor-pointer p-0 bg-transparent"
                              />
                              <span className="text-[10px] font-mono text-zinc-500">{textBgColor}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Attention Badges Section */}
                  <div className="space-y-3 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span>Attention Corner Badge</span>
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={enableBadge}
                          onChange={(e) => setEnableBadge(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                      </label>
                    </div>

                    {enableBadge && (
                      <div className="space-y-3 pt-1">
                        <div className="flex flex-wrap gap-1">
                          {BADGE_PRESETS.map((bp) => (
                            <button
                              key={bp}
                              onClick={() => setBadgeText(bp)}
                              className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition ${
                                badgeText === bp
                                  ? 'bg-amber-500 text-white'
                                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300'
                              }`}
                            >
                              {bp}
                            </button>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Badge Position</label>
                            <select
                              value={badgePosition}
                              onChange={(e) => setBadgePosition(e.target.value as any)}
                              className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold"
                            >
                              <option value="topLeft">Top Left (Best)</option>
                              <option value="topRight">Top Right</option>
                              <option value="bottomLeft">Bottom Left</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Badge Color</label>
                            <div className="flex items-center gap-1.5 mt-1">
                              <input
                                type="color"
                                value={badgeBgColor}
                                onChange={(e) => setBadgeBgColor(e.target.value)}
                                className="w-7 h-7 rounded border border-zinc-300 dark:border-zinc-700 cursor-pointer p-0 bg-transparent"
                              />
                              <span className="text-[10px] font-mono text-zinc-500">{badgeBgColor}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* TAB 4: BORDERS & BRANDING */}
              {/* ==================================================== */}
              {activeTab === 'borders' && (
                <div className="space-y-4">
                  <div className="space-y-3 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-indigo-500" />
                        <span>Outer Border / Frame</span>
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={enableBorder}
                          onChange={(e) => setEnableBorder(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    {enableBorder && (
                      <div className="space-y-3 pt-1">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
                            <span>Border Width</span>
                            <span>{borderWidth}px</span>
                          </div>
                          <input
                            type="range"
                            min={4}
                            max={40}
                            value={borderWidth}
                            onChange={(e) => setBorderWidth(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                          />
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Border Color</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={borderColor}
                                onChange={(e) => setBorderColor(e.target.value)}
                                className="w-8 h-8 rounded-lg border border-zinc-300 dark:border-zinc-700 cursor-pointer p-0.5 bg-transparent"
                              />
                              <span className="text-xs font-mono text-zinc-500">{borderColor}</span>
                            </div>
                          </div>

                          <label className="flex items-center gap-2 cursor-pointer mt-3">
                            <input
                              type="checkbox"
                              checked={borderGlow}
                              onChange={(e) => setBorderGlow(e.target.checked)}
                              className="rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Neon Glow Effect</span>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* EXPORT OPTIONS & DOWNLOAD BAR */}
              {/* ==================================================== */}
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Export Format</label>
                    <select
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold text-zinc-800 dark:text-zinc-200"
                    >
                      <option value="jpeg">JPEG (Fast, Small Size)</option>
                      <option value="png">PNG (Lossless Quality)</option>
                      <option value="webp">WEBP (Modern Web)</option>
                    </select>
                  </div>

                  {exportFormat !== 'png' && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase">
                        <span>Quality</span>
                        <span>{Math.round(exportQuality * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min={0.3}
                        max={1.0}
                        step={0.02}
                        value={exportQuality}
                        onChange={(e) => setExportQuality(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 mt-2"
                      />
                    </div>
                  )}
                </div>

                {/* Live Size & YouTube 2MB Compliance Badge */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-500">Est. Size:</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">{estimatedSizeKb} KB</span>
                    {estimatedSizeKb <= 2048 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                        <ShieldCheck className="w-3 h-3" />
                        <span>&lt;2MB YouTube Safe</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 text-[10px] font-bold">
                        <AlertTriangle className="w-3 h-3" />
                        <span>&gt;2MB (Exceeds Limit)</span>
                      </span>
                    )}
                  </div>
                  {estimatedSizeKb > 2048 && (
                    <button
                      onClick={autoOptimizeForYouTube}
                      className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      Auto-Fix
                    </button>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={copyImageToClipboard}
                    className="px-3.5 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-indigo-400 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                    title="Copy image to clipboard"
                  >
                    {copiedNotification ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedNotification ? 'Copied!' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={downloadThumbnail}
                    className="saas-button-primary flex-grow py-3 flex items-center justify-center gap-2 cursor-pointer font-bold text-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Thumbnail ({targetWidth}×{targetHeight})</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ==================================================== */}
        {/* RIGHT COLUMN: Interactive Live Canvas & YouTube UI Sim */}
        {/* ==================================================== */}
        <div className="lg:col-span-7 saas-card p-6 space-y-4 flex flex-col justify-between">
          <div>
            {/* Top Toolbar over Canvas */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <Monitor className="w-4 h-4 text-indigo-500" />
                  <span>Canvas Preview</span>
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono font-bold">
                  {targetWidth} × {targetHeight}
                </span>
              </div>

              {/* View & Guide Toggles */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowSafeZones(!showSafeZones)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer flex items-center gap-1 ${
                    showSafeZones
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-700'
                  }`}
                  title="Toggle YouTube Safe Zones & Danger Overlays"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Safe Zones</span>
                </button>

                <button
                  onClick={() => setShowRuleOfThirds(!showRuleOfThirds)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer flex items-center gap-1 ${
                    showRuleOfThirds
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-700'
                  }`}
                  title="Toggle Rule of Thirds Composition Grid"
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>Grid 3×3</span>
                </button>

                <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-800 p-0.5 bg-zinc-50 dark:bg-zinc-900">
                  <button
                    onClick={() => setPreviewMockup('none')}
                    className={`px-2 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                      previewMockup === 'none' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs' : 'text-zinc-500'
                    }`}
                  >
                    Clean
                  </button>
                  <button
                    onClick={() => setPreviewMockup('desktop')}
                    className={`px-2 py-1 rounded text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                      previewMockup === 'desktop' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs' : 'text-zinc-500'
                    }`}
                  >
                    <Monitor className="w-3 h-3" />
                    <span>Desktop</span>
                  </button>
                  <button
                    onClick={() => setPreviewMockup('mobile')}
                    className={`px-2 py-1 rounded text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                      previewMockup === 'mobile' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs' : 'text-zinc-500'
                    }`}
                  >
                    <Smartphone className="w-3 h-3" />
                    <span>Mobile</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Canvas Interactive Container */}
            <div className="relative w-full rounded-2xl bg-zinc-950 p-2 border border-zinc-800 shadow-inner flex items-center justify-center overflow-hidden">
              {imageSrc ? (
                <div className="relative max-w-full max-h-full flex items-center justify-center">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    onMouseLeave={handleCanvasMouseUp}
                    onWheel={handleCanvasWheel}
                    className="max-w-full max-h-[480px] object-contain shadow-2xl rounded-xl border border-zinc-800 cursor-grab active:cursor-grabbing"
                    style={{ aspectRatio: `${targetWidth} / ${targetHeight}` }}
                  />

                  {/* OVERLAY 1: Rule of Thirds Grid */}
                  {showRuleOfThirds && (
                    <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/20">
                      <div className="border-r border-b border-white/30"></div>
                      <div className="border-r border-b border-white/30"></div>
                      <div className="border-b border-white/30"></div>
                      <div className="border-r border-b border-white/30"></div>
                      <div className="border-r border-b border-white/30"></div>
                      <div className="border-b border-white/30"></div>
                      <div className="border-r border-white/30"></div>
                      <div className="border-r border-white/30"></div>
                      <div></div>
                    </div>
                  )}

                  {/* OVERLAY 2: YouTube Safe & Danger Zones */}
                  {showSafeZones && (
                    <div className="absolute inset-0 pointer-events-none">
                      {/* Danger: YouTube Bottom-Right Timestamp Badge */}
                      <div className="absolute bottom-3 right-3 bg-red-600/85 text-white font-mono text-[10px] font-black px-2 py-1 rounded shadow-md border border-red-400/60 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>14:25 (YT Timestamp Box)</span>
                      </div>

                      {/* Danger: Watched Red Progress Bar on Bottom */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600/90 shadow-sm"></div>

                      {/* Mobile Safe Zone (Center 80%) */}
                      <div className="absolute inset-[10%] border-2 border-dashed border-amber-400/40 rounded pointer-events-none flex items-start justify-end p-1">
                        <span className="text-[9px] font-bold text-amber-300 bg-black/60 px-1.5 py-0.5 rounded">
                          Mobile Safe Frame
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-20 text-center text-zinc-600 space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center mx-auto text-zinc-600 border border-zinc-800">
                    <ImageIcon className="w-8 h-8 opacity-40" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-400">Ready for High-Res Master Image</p>
                    <p className="text-xs text-zinc-600 max-w-xs mx-auto mt-1">
                      Upload a photo, paste a screenshot, or enter a YouTube link on the left to activate the studio workspace.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {imageSrc && (
              <div className="flex items-center justify-between text-[11px] font-medium text-zinc-500 pt-2">
                <span className="flex items-center gap-1.5">
                  <Move className="w-3.5 h-3.5" />
                  <span>Click & drag on canvas to pan position • Scroll mouse wheel to zoom</span>
                </span>
                <span className="font-mono text-zinc-400">Aspect Ratio: {(targetWidth / targetHeight).toFixed(2)}:1</span>
              </div>
            )}
          </div>

          {/* ==================================================== */}
          {/* YOUTUBE LIVE FEED MOCKUP SIMULATOR */}
          {/* ==================================================== */}
          {imageSrc && previewMockup !== 'none' && (
            <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <YouTubeIcon className="w-4 h-4 text-red-600" />
                  <span className="text-xs font-bold text-zinc-900 dark:text-white">
                    {previewMockup === 'desktop' ? 'YouTube Desktop Search / Feed Mockup' : 'YouTube Mobile Feed Card Mockup'}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-400 font-semibold">Live Simulation</span>
              </div>

              {previewMockup === 'desktop' ? (
                <div className="flex gap-4 p-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 shadow-sm max-w-xl">
                  <div className="relative w-48 aspect-video rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                    <canvas
                      ref={(el) => {
                        if (el && canvasRef.current) {
                          el.width = 320;
                          el.height = 180;
                          const ctx = el.getContext('2d');
                          if (ctx) ctx.drawImage(canvasRef.current, 0, 0, 320, 180);
                        }
                      }}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1.5 right-1.5 bg-black/85 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded">
                      14:25
                    </span>
                  </div>

                  <div className="flex-1 space-y-1.5 text-left">
                    <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug">
                      {overlayText || 'I Rebuilt My Entire YouTube Channel in 24 Hours (Full Breakdown)'}
                    </h5>
                    <p className="text-[11px] text-zinc-500 font-medium">Toolique Studio • 428K views • 2 days ago</p>
                    <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed">
                      In this video we reveal the high-CTR thumbnail formula and step-by-step strategies to maximize video impressions...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="max-w-xs mx-auto p-3 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 shadow-md space-y-2">
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-zinc-800">
                    <canvas
                      ref={(el) => {
                        if (el && canvasRef.current) {
                          el.width = 320;
                          el.height = 180;
                          const ctx = el.getContext('2d');
                          if (ctx) ctx.drawImage(canvasRef.current, 0, 0, 320, 180);
                        }
                      }}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1.5 right-1.5 bg-black/85 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded">
                      14:25
                    </span>
                  </div>

                  <div className="flex gap-2.5 items-start text-left pt-1">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      TS
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug">
                        {overlayText || '10 INSANE Mistakes YouTubers Make with Thumbnails!'}
                      </h5>
                      <p className="text-[10px] text-zinc-400">Toolique Studio • 840K views • 3 days ago</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* RECENT SESSION HISTORY */}
          {/* ==================================================== */}
          {history.length > 0 && (
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-500 uppercase">
                <span>Recent Session Exports</span>
                <span className="text-[10px] font-normal text-zinc-400">{history.length} saved</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {history.map((h) => (
                  <div
                    key={h.id}
                    className="relative w-24 aspect-video rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700/60 shrink-0 group cursor-pointer"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.download = `re-export-${h.width}x${h.height}.jpg`;
                      link.href = h.dataUrl;
                      link.click();
                    }}
                  >
                    <img src={h.dataUrl} alt="Thumbnail history" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                      <Download className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

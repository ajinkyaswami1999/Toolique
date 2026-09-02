import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Upload, 
  Download, 
  RotateCw, 
  FlipHorizontal, 
  FlipVertical, 
  Layers, 
  Sparkles, 
  Sliders, 
  Box, 
  FileText, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Eye, 
  Info, 
  Save, 
  RefreshCw, 
  Palette, 
  Play, 
  Pause, 
  Split, 
  Cpu 
} from 'lucide-react';

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface FilamentItem {
  id: string;
  name: string;
  brand: string;
  material: string;
  colorHex: string;
  td: number; // Transmission distance in mm (e.g. 0.8 for Black, 5.0 for Jade White)
  minThickness: number; // mm
  maxThickness: number; // mm
}

export interface FilamentProfile {
  id: string;
  name: string;
  filaments: FilamentItem[];
}

export interface LayerSwapStep {
  layerIndex: number; // 1-based
  heightMm: number;
  filament: FilamentItem;
  nextFilament?: FilamentItem;
}

// Preset Filaments
const DEFAULT_PALETTES: { name: string; filaments: FilamentItem[] }[] = [
  {
    name: 'Standard 4-Color (Black/Blue/Red/White)',
    filaments: [
      { id: 'f1', name: 'Charcoal Black', brand: 'Bambu Lab', material: 'PLA Basic', colorHex: '#151515', td: 0.6, minThickness: 0.8, maxThickness: 1.2 },
      { id: 'f2', name: 'Cobalt Blue', brand: 'PolyLite', material: 'PLA Pro', colorHex: '#1e3a8a', td: 1.8, minThickness: 1.2, maxThickness: 1.8 },
      { id: 'f3', name: 'Crimson Red', brand: 'eSUN', material: 'PLA+', colorHex: '#dc2626', td: 2.5, minThickness: 1.8, maxThickness: 2.4 },
      { id: 'f4', name: 'Jade White', brand: 'Bambu Lab', material: 'PLA Basic', colorHex: '#f8fafc', td: 5.2, minThickness: 2.4, maxThickness: 3.2 }
    ]
  },
  {
    name: 'Earth & Gold 4-Color',
    filaments: [
      { id: 'f1', name: 'Matte Black', brand: 'Polymaker', material: 'PLA Matte', colorHex: '#111827', td: 0.5, minThickness: 0.8, maxThickness: 1.2 },
      { id: 'f2', name: 'Forest Green', brand: 'Bambu Lab', material: 'PLA Basic', colorHex: '#166534', td: 1.6, minThickness: 1.2, maxThickness: 1.8 },
      { id: 'f3', name: 'Sunset Orange', brand: 'Sunlu', material: 'PLA+', colorHex: '#ea580c', td: 3.2, minThickness: 1.8, maxThickness: 2.5 },
      { id: 'f4', name: 'Warm White', brand: 'PolyLite', material: 'PLA', colorHex: '#fef3c7', td: 4.8, minThickness: 2.5, maxThickness: 3.2 }
    ]
  },
  {
    name: 'Monochrome Grayscale Litho (4-Step)',
    filaments: [
      { id: 'f1', name: 'Deep Black', brand: 'Generic', material: 'PLA', colorHex: '#09090b', td: 0.4, minThickness: 0.8, maxThickness: 1.2 },
      { id: 'f2', name: 'Slate Gray', brand: 'Generic', material: 'PLA', colorHex: '#475569', td: 1.8, minThickness: 1.2, maxThickness: 2.0 },
      { id: 'f3', name: 'Silver Gray', brand: 'Generic', material: 'PLA', colorHex: '#94a3b8', td: 3.4, minThickness: 2.0, maxThickness: 2.6 },
      { id: 'f4', name: 'Pure White', brand: 'Generic', material: 'PLA', colorHex: '#ffffff', td: 6.0, minThickness: 2.6, maxThickness: 3.4 }
    ]
  }
];

// Sample artwork presets for instant 1-click testing
const SAMPLE_ARTWORKS = [
  { id: 'sunset', name: 'Sunset Waves', type: 'gradient' },
  { id: 'mandala', name: 'Sacred Mandala', type: 'mandala' },
  { id: 'portrait', name: 'Cosmic Nebula', type: 'nebula' }
];

// Convert Hex to RGB
function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace('#', '');
  const bigint = parseInt(cleanHex.length === 3 ? cleanHex.split('').map(c => c + c).join('') : cleanHex, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

// Convert RGB to CIE LAB
function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  let r1 = r / 255, g1 = g / 255, b1 = b / 255;
  r1 = r1 > 0.04045 ? Math.pow((r1 + 0.055) / 1.055, 2.4) : r1 / 12.92;
  g1 = g1 > 0.04045 ? Math.pow((g1 + 0.055) / 1.055, 2.4) : g1 / 12.92;
  b1 = b1 > 0.04045 ? Math.pow((b1 + 0.055) / 1.055, 2.4) : b1 / 12.92;

  const x = (r1 * 0.4124 + g1 * 0.3576 + b1 * 0.1805) * 100;
  const y = (r1 * 0.2126 + g1 * 0.7152 + b1 * 0.0722) * 100;
  const z = (r1 * 0.0193 + g1 * 0.1192 + b1 * 0.9505) * 100;

  let x1 = x / 95.047, y1 = y / 100.000, z1 = z / 108.883;
  x1 = x1 > 0.008856 ? Math.pow(x1, 1/3) : (7.787 * x1) + (16 / 116);
  y1 = y1 > 0.008856 ? Math.pow(y1, 1/3) : (7.787 * y1) + (16 / 116);
  z1 = z1 > 0.008856 ? Math.pow(z1, 1/3) : (7.787 * z1) + (16 / 116);

  return [(116 * y1) - 16, 500 * (x1 - y1), 200 * (y1 - z1)];
}

// Delta E 1976 distance
function deltaE(lab1: [number, number, number], lab2: [number, number, number]): number {
  return Math.sqrt(
    Math.pow(lab1[0] - lab2[0], 2) +
    Math.pow(lab1[1] - lab2[1], 2) +
    Math.pow(lab1[2] - lab2[2], 2)
  );
}

export default function ImageToFilamentArtMaker() {
  // Navigation & Control Panel Sections
  const [leftTab, setLeftTab] = useState<'image' | 'palette' | 'adjust' | 'slicer'>('image');
  const [activeTab, setActiveTab] = useState<'simulation' | '3d' | 'split' | 'processed' | 'original'>('simulation');

  // Image Source & Upload State
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string>('sample-art');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingProgress, setProcessingProgress] = useState<string>('Ready');

  // Physical Dimensions (mm)
  const [aspectPreset, setAspectPreset] = useState<'square' | 'portrait' | 'landscape' | 'custom'>('square');
  const [modelWidthMm, setModelWidthMm] = useState<number>(120);
  const [modelHeightMm, setModelHeightMm] = useState<number>(120);
  const [baseThicknessMm, setBaseThicknessMm] = useState<number>(0.8);
  const [maxThicknessMm, setMaxThicknessMm] = useState<number>(3.2);
  const [layerHeightMm, setLayerHeightMm] = useState<number>(0.08);

  // Image Adjustments
  const [brightness, setBrightness] = useState<number>(0);
  const [contrast, setContrast] = useState<number>(15);
  const [gamma, setGamma] = useState<number>(1.1);
  const [saturation, setSaturation] = useState<number>(110);
  const [isGrayscale, setIsGrayscale] = useState<boolean>(false);
  const [invertHeight, setInvertHeight] = useState<boolean>(false);
  const [rotateDeg, setRotateDeg] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  // Filament Palette & Profiles
  const [paletteName, setPaletteName] = useState<string>('Standard 4-Color (Black/Blue/Red/White)');
  const [filaments, setFilaments] = useState<FilamentItem[]>(DEFAULT_PALETTES[0].filaments);
  const [savedProfiles, setSavedProfiles] = useState<FilamentProfile[]>([]);
  const [isSavedInDb, setIsSavedInDb] = useState<boolean>(false);

  // Printing & Slicer Parameters
  const [printSpeedMmS, setPrintSpeedMmS] = useState<number>(120);
  const [materialDensityGcm3] = useState<number>(1.24);
  const [nozzleTemp, setNozzleTemp] = useState<number>(215);
  const [bedTemp, setBedTemp] = useState<number>(60);
  const [firstLayerHeight] = useState<number>(0.2);

  // Layer Scrubber & Animation
  const [scrubberLayer, setScrubberLayer] = useState<number>(40);
  const [isPlayingAnimation, setIsPlayingAnimation] = useState<boolean>(false);

  // Split-Screen Slider position (0 - 100%)
  const [splitPos, setSplitPos] = useState<number>(50);

  // STL Export Quality Preset
  const [stlResolution, setStlResolution] = useState<'preview' | 'medium' | 'high'>('medium');

  // Canvas Refs
  const processedCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const simulationCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const threeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 3D View Controls
  const [view3dMode, setView3dMode] = useState<'shaded' | 'wireframe' | 'heatmap'>('shaded');
  const [rotX, setRotX] = useState<number>(45);
  const [rotY, setRotY] = useState<number>(-25);
  const [zoom3d, setZoom3d] = useState<number>(1.2);
  const [isDragging3d, setIsDragging3d] = useState<boolean>(false);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Calculated Heightmap Data
  const [heightmapGrid, setHeightmapGrid] = useState<Float32Array | null>(null);
  const [gridWidth, setGridWidth] = useState<number>(150);
  const [gridHeight, setGridHeight] = useState<number>(150);
  const [isCopiedGuide, setIsCopiedGuide] = useState<boolean>(false);

  // Generate Sample Artworks
  const generateSample = useCallback((type: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (type === 'gradient' || type === 'sunset') {
      const grad = ctx.createLinearGradient(0, 0, 0, 400);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.35, '#1e3a8a');
      grad.addColorStop(0.65, '#dc2626');
      grad.addColorStop(0.85, '#f59e0b');
      grad.addColorStop(1, '#fef08a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 400, 400);

      // Sun
      ctx.beginPath();
      ctx.arc(200, 180, 70, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 40;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Mountain 1
      ctx.beginPath();
      ctx.moveTo(0, 400);
      ctx.lineTo(140, 220);
      ctx.lineTo(260, 400);
      ctx.fillStyle = '#1e1b4b';
      ctx.fill();

      // Mountain 2
      ctx.beginPath();
      ctx.moveTo(120, 400);
      ctx.lineTo(290, 190);
      ctx.lineTo(400, 400);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
    } else if (type === 'mandala') {
      ctx.fillStyle = '#050816';
      ctx.fillRect(0, 0, 400, 400);

      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 2;
      ctx.translate(200, 200);
      for (let i = 0; i < 16; i++) {
        ctx.rotate((Math.PI * 2) / 16);
        ctx.beginPath();
        ctx.arc(0, 50, 40, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 100, 30, 0, Math.PI * 2);
        ctx.strokeStyle = '#f59e0b';
        ctx.stroke();

        ctx.beginPath();
        ctx.rect(-20, -20, 40, 40);
        ctx.strokeStyle = '#38bdf8';
        ctx.stroke();
      }
    } else {
      // Cosmic Nebula
      const grad = ctx.createRadialGradient(200, 200, 20, 200, 200, 200);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.2, '#ec4899');
      grad.addColorStop(0.5, '#6366f1');
      grad.addColorStop(0.8, '#1e1b4b');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 400, 400);
    }

    setImageSrc(canvas.toDataURL('image/png'));
    setImageFileName(`sample-${type}`);
  }, []);

  // Initial mount: load sample artwork & saved palettes
  useEffect(() => {
    generateSample('sunset');
    try {
      const stored = localStorage.getItem('toolique_custom_filament_palettes');
      if (stored) {
        setSavedProfiles(JSON.parse(stored));
      }
    } catch {}
  }, [generateSample]);

  // Update mm dimensions when aspect preset changes
  const handleAspectPresetChange = (preset: 'square' | 'portrait' | 'landscape' | 'custom') => {
    setAspectPreset(preset);
    if (preset === 'square') {
      setModelWidthMm(120);
      setModelHeightMm(120);
    } else if (preset === 'portrait') {
      setModelWidthMm(100);
      setModelHeightMm(150);
    } else if (preset === 'landscape') {
      setModelWidthMm(150);
      setModelHeightMm(100);
    }
  };

  // Image File Upload Handler
  const handleFileUpload = (file: File) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
      alert('Please upload a valid JPG, PNG, or WebP image.');
      return;
    }

    setImageFileName(file.name.replace(/\.[^/.]+$/, ''));
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImageSrc(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag & Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Total Number of Discrete Layers
  const totalLayers = useMemo(() => {
    if (layerHeightMm <= 0) return 40;
    return Math.max(1, Math.round((maxThicknessMm - baseThicknessMm) / layerHeightMm) + Math.round(baseThicknessMm / layerHeightMm));
  }, [maxThicknessMm, baseThicknessMm, layerHeightMm]);

  // Sync Scrubber Layer max value
  useEffect(() => {
    setScrubberLayer(totalLayers);
  }, [totalLayers]);

  // Layer Swap Schedule
  const layerSwapSchedule = useMemo<LayerSwapStep[]>(() => {
    if (filaments.length === 0) return [];
    
    const steps: LayerSwapStep[] = [];
    const count = filaments.length;

    filaments.forEach((f, idx) => {
      const startLayer = idx === 0 ? 1 : Math.max(1, Math.round((idx / count) * totalLayers));
      const height = startLayer * layerHeightMm;

      steps.push({
        layerIndex: startLayer,
        heightMm: Math.min(maxThicknessMm, height),
        filament: f,
        nextFilament: filaments[idx + 1]
      });
    });

    return steps;
  }, [filaments, totalLayers, layerHeightMm, maxThicknessMm]);

  // Layer-by-layer playback animation
  useEffect(() => {
    let interval: any;
    if (isPlayingAnimation) {
      interval = setInterval(() => {
        setScrubberLayer((prev) => (prev >= totalLayers ? 1 : prev + 1));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlayingAnimation, totalLayers]);

  // --------------------------------------------------------------------------
  // CORE IMAGE PROCESSING & OPTICAL TRANSMISSION SIMULATION ENGINE
  // --------------------------------------------------------------------------
  const processImagePipeline = useCallback(() => {
    if (!imageSrc) return;
    setIsProcessing(true);
    setProcessingProgress('Processing filters...');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      // 1. Processed Canvas Setup
      const pCanvas = processedCanvasRef.current || document.createElement('canvas');
      const targetW = 320;
      const targetH = Math.round(targetW * (modelHeightMm / modelWidthMm));
      pCanvas.width = targetW;
      pCanvas.height = targetH;
      const pCtx = pCanvas.getContext('2d', { willReadFrequently: true });
      if (!pCtx) return;

      // Draw original with transformations (rotate/flip)
      pCtx.save();
      pCtx.translate(targetW / 2, targetH / 2);
      pCtx.rotate((rotateDeg * Math.PI) / 180);
      pCtx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      pCtx.drawImage(img, -targetW / 2, -targetH / 2, targetW, targetH);
      pCtx.restore();

      const imgData = pCtx.getImageData(0, 0, targetW, targetH);
      const data = imgData.data;

      // Pre-compute Filament RGB and LAB colors
      const filamentColors = filaments.map(f => {
        const rgb = hexToRgb(f.colorHex);
        const lab = rgbToLab(rgb[0], rgb[1], rgb[2]);
        return { ...f, rgb, lab };
      });

      // Heightmap array buffer
      const hGrid = new Float32Array(targetW * targetH);

      // Simulation canvas
      const sCanvas = simulationCanvasRef.current;
      const sCtx = sCanvas?.getContext('2d');
      const simData = sCtx ? sCtx.createImageData(targetW, targetH) : null;

      const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
      const brightVal = brightness * 1.5;
      const satVal = saturation / 100;
      const maxScrubberHeight = (scrubberLayer / totalLayers) * maxThicknessMm;

      // 2. Pixel Pass: Contrast, Brightness, Gamma, Saturation & LAB Color Distance
      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // Brightness & Contrast
        r = Math.min(255, Math.max(0, contrastFactor * (r - 128) + 128 + brightVal));
        g = Math.min(255, Math.max(0, contrastFactor * (g - 128) + 128 + brightVal));
        b = Math.min(255, Math.max(0, contrastFactor * (b - 128) + 128 + brightVal));

        // Gamma correction
        if (gamma !== 1) {
          r = Math.pow(r / 255, gamma) * 255;
          g = Math.pow(g / 255, gamma) * 255;
          b = Math.pow(b / 255, gamma) * 255;
        }

        // Saturation / Grayscale
        let gray = 0.299 * r + 0.587 * g + 0.114 * b;
        if (invertHeight) {
          gray = 255 - gray;
        }

        if (isGrayscale) {
          r = gray;
          g = gray;
          b = gray;
        } else if (satVal !== 1) {
          r = Math.min(255, Math.max(0, gray + satVal * (r - gray)));
          g = Math.min(255, Math.max(0, gray + satVal * (g - gray)));
          b = Math.min(255, Math.max(0, gray + satVal * (b - gray)));
        }

        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;

        // Height mapping from normalized luminance
        const normalizedLum = Math.min(1, Math.max(0, gray / 255));
        const heightMm = baseThicknessMm + (maxThicknessMm - baseThicknessMm) * normalizedLum;
        const pixelIdx = i / 4;
        hGrid[pixelIdx] = heightMm;

        // Optical Filament Color Blending Simulation
        if (simData && filamentColors.length > 0) {
          // If pixel height exceeds current scrubber layer, show base layer or darkness
          if (heightMm > maxScrubberHeight) {
            simData.data[i] = 20;
            simData.data[i + 1] = 24;
            simData.data[i + 2] = 33;
            simData.data[i + 3] = 255;
          } else {
            const pixelLab = rgbToLab(r, g, b);
            let closestFil = filamentColors[0];
            let minDelta = Infinity;
            for (const fil of filamentColors) {
              const d = deltaE(pixelLab, fil.lab);
              if (d < minDelta) {
                minDelta = d;
                closestFil = fil;
              }
            }

            const baseRgb = filamentColors[0].rgb;
            const topRgb = closestFil.rgb;
            const blendAlpha = Math.min(1, Math.max(0.2, (heightMm - baseThicknessMm) / (maxThicknessMm - baseThicknessMm || 1)));

            const simR = Math.round(baseRgb[0] * (1 - blendAlpha) + topRgb[0] * blendAlpha);
            const simG = Math.round(baseRgb[1] * (1 - blendAlpha) + topRgb[1] * blendAlpha);
            const simB = Math.round(baseRgb[2] * (1 - blendAlpha) + topRgb[2] * blendAlpha);

            simData.data[i] = simR;
            simData.data[i + 1] = simG;
            simData.data[i + 2] = simB;
            simData.data[i + 3] = 255;
          }
        }
      }

      // Draw Processed Result
      pCtx.putImageData(imgData, 0, 0);

      // Draw Simulation Result
      if (sCtx && simData && sCanvas) {
        sCanvas.width = targetW;
        sCanvas.height = targetH;
        sCtx.putImageData(simData, 0, 0);
      }

      setHeightmapGrid(hGrid);
      setGridWidth(targetW);
      setGridHeight(targetH);
      setIsProcessing(false);
    };
  }, [
    imageSrc,
    modelWidthMm,
    modelHeightMm,
    rotateDeg,
    flipH,
    flipV,
    brightness,
    contrast,
    gamma,
    saturation,
    isGrayscale,
    invertHeight,
    baseThicknessMm,
    maxThicknessMm,
    filaments,
    scrubberLayer,
    totalLayers
  ]);

  // Trigger processing on settings change
  useEffect(() => {
    const timer = setTimeout(() => {
      processImagePipeline();
    }, 120);
    return () => clearTimeout(timer);
  }, [processImagePipeline]);

  // --------------------------------------------------------------------------
  // 3D RELIEF RENDERER (Interactive WebGL / Canvas Mesh Viewer)
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (activeTab !== '3d' || !heightmapGrid) return;
    const canvas = threeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Background Gradient for 3D Viewport
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#090d16');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Bed Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 40; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 40; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Isometric 3D Projection parameters
    const radX = (rotX * Math.PI) / 180;
    const radY = (rotY * Math.PI) / 180;
    const cosX = Math.cos(radX), sinX = Math.sin(radX);
    const cosY = Math.cos(radY), sinY = Math.sin(radY);

    const step = 4;
    const halfW = gridWidth / 2;
    const halfH = gridHeight / 2;
    const scale = (width / (gridWidth * 1.6)) * zoom3d;

    // Render Relief Mesh Quads
    for (let y = 0; y < gridHeight - step; y += step) {
      for (let x = 0; x < gridWidth - step; x += step) {
        const idx0 = y * gridWidth + x;
        const idx1 = y * gridWidth + (x + step);
        const idx2 = (y + step) * gridWidth + (x + step);
        const idx3 = (y + step) * gridWidth + x;

        const z0 = (heightmapGrid[idx0] || baseThicknessMm) * 8;
        const z1 = (heightmapGrid[idx1] || baseThicknessMm) * 8;
        const z2 = (heightmapGrid[idx2] || baseThicknessMm) * 8;
        const z3 = (heightmapGrid[idx3] || baseThicknessMm) * 8;

        // Project 4 vertices
        const pts = [
          { x: (x - halfW), y: (y - halfH), z: z0 },
          { x: (x + step - halfW), y: (y - halfH), z: z1 },
          { x: (x + step - halfW), y: (y + step - halfH), z: z2 },
          { x: (x - halfW), y: (y + step - halfH), z: z3 }
        ].map(p => {
          const x1 = p.x * cosY + p.z * sinY;
          const z1 = -p.x * sinY + p.z * cosY;
          const y2 = p.y * cosX - z1 * sinX;
          const z2 = p.y * sinX + z1 * cosX;

          return {
            px: width / 2 + x1 * scale,
            py: height / 2 + y2 * scale,
            depth: z2
          };
        });

        const avgZ = (z0 + z1 + z2 + z3) / 32;
        const normZ = Math.min(1, Math.max(0, (avgZ - baseThicknessMm) / (maxThicknessMm - baseThicknessMm || 1)));

        ctx.beginPath();
        ctx.moveTo(pts[0].px, pts[0].py);
        ctx.lineTo(pts[1].px, pts[1].py);
        ctx.lineTo(pts[2].px, pts[2].py);
        ctx.lineTo(pts[3].px, pts[3].py);
        ctx.closePath();

        if (view3dMode === 'wireframe') {
          ctx.strokeStyle = '#6366f1';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        } else if (view3dMode === 'heatmap') {
          const hue = Math.round((1 - normZ) * 240);
          ctx.fillStyle = `hsl(${hue}, 85%, 50%)`;
          ctx.fill();
        } else {
          const filIdx = Math.min(filaments.length - 1, Math.floor(normZ * filaments.length));
          const filHex = filaments[filIdx]?.colorHex || '#ffffff';
          ctx.fillStyle = filHex;
          ctx.fill();
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 0.2;
          ctx.stroke();
        }
      }
    }

    // Display Scale & Orientation HUD
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(`Dimensions: ${modelWidthMm} × ${modelHeightMm} × ${maxThicknessMm.toFixed(2)} mm`, 16, height - 16);
    ctx.fillText(`Layers: ${totalLayers} (${layerHeightMm}mm) | Pitch: ${rotX}° Yaw: ${rotY}°`, 16, height - 30);
  }, [activeTab, heightmapGrid, rotX, rotY, zoom3d, view3dMode, gridWidth, gridHeight, modelWidthMm, modelHeightMm, baseThicknessMm, maxThicknessMm, totalLayers, layerHeightMm, filaments]);

  // --------------------------------------------------------------------------
  // GENUINE BINARY STL EXPORTER (Manifold 3D Relief Mesh)
  // --------------------------------------------------------------------------
  const handleExportSTL = () => {
    if (!heightmapGrid) {
      alert('Please wait for the image to finish processing before exporting.');
      return;
    }

    setIsProcessing(true);
    setProcessingProgress('Generating watertight Binary STL mesh...');

    setTimeout(() => {
      try {
        const step = stlResolution === 'high' ? 1 : stlResolution === 'medium' ? 2 : 3;
        const resW = Math.floor(gridWidth / step);
        const resH = Math.floor(gridHeight / step);

        const topTriangles = (resW - 1) * (resH - 1) * 2;
        const sideTriangles = ((resW - 1) * 2 + (resH - 1) * 2) * 2;
        const bottomTriangles = (resW - 1) * (resH - 1) * 2;
        const totalTriangleCount = topTriangles + sideTriangles + bottomTriangles;

        const bufferSize = 84 + totalTriangleCount * 50;
        const buffer = new ArrayBuffer(bufferSize);
        const view = new DataView(buffer);

        const headerStr = 'Toolique Image to Filament Art Maker - Binary STL 3D Mesh';
        for (let i = 0; i < 80; i++) {
          view.setUint8(i, i < headerStr.length ? headerStr.charCodeAt(i) : 0);
        }

        view.setUint32(80, totalTriangleCount, true);
        let offset = 84;

        const scaleX = modelWidthMm / (gridWidth - 1);
        const scaleY = modelHeightMm / (gridHeight - 1);

        const writeTriangle = (
          v1: [number, number, number],
          v2: [number, number, number],
          v3: [number, number, number]
        ) => {
          const ax = v2[0] - v1[0], ay = v2[1] - v1[1], az = v2[2] - v1[2];
          const bx = v3[0] - v1[0], by = v3[1] - v1[1], bz = v3[2] - v1[2];
          let nx = ay * bz - az * by;
          let ny = az * bx - ax * bz;
          let nz = ax * by - ay * bx;
          const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
          nx /= len; ny /= len; nz /= len;

          view.setFloat32(offset, nx, true);
          view.setFloat32(offset + 4, ny, true);
          view.setFloat32(offset + 8, nz, true);
          offset += 12;

          view.setFloat32(offset, v1[0], true);
          view.setFloat32(offset + 4, v1[1], true);
          view.setFloat32(offset + 8, v1[2], true);
          offset += 12;

          view.setFloat32(offset, v2[0], true);
          view.setFloat32(offset + 4, v2[1], true);
          view.setFloat32(offset + 8, v2[2], true);
          offset += 12;

          view.setFloat32(offset, v3[0], true);
          view.setFloat32(offset + 4, v3[1], true);
          view.setFloat32(offset + 8, v3[2], true);
          offset += 12;

          view.setUint16(offset, 0, true);
          offset += 2;
        };

        const getZ = (gx: number, gy: number) => {
          const clampedX = Math.min(gridWidth - 1, Math.max(0, gx));
          const clampedY = Math.min(gridHeight - 1, Math.max(0, gy));
          const val = heightmapGrid[clampedY * gridWidth + clampedX];
          return isNaN(val) ? baseThicknessMm : val;
        };

        // Top surface
        for (let j = 0; j < resH - 1; j++) {
          for (let i = 0; i < resW - 1; i++) {
            const x0 = i * step;
            const x1 = Math.min(gridWidth - 1, (i + 1) * step);
            const y0 = j * step;
            const y1 = Math.min(gridHeight - 1, (j + 1) * step);

            const p0: [number, number, number] = [x0 * scaleX, (gridHeight - 1 - y0) * scaleY, getZ(x0, y0)];
            const p1: [number, number, number] = [x1 * scaleX, (gridHeight - 1 - y0) * scaleY, getZ(x1, y0)];
            const p2: [number, number, number] = [x1 * scaleX, (gridHeight - 1 - y1) * scaleY, getZ(x1, y1)];
            const p3: [number, number, number] = [x0 * scaleX, (gridHeight - 1 - y1) * scaleY, getZ(x0, y1)];

            writeTriangle(p0, p1, p2);
            writeTriangle(p0, p2, p3);
          }
        }

        // Bottom plane
        for (let j = 0; j < resH - 1; j++) {
          for (let i = 0; i < resW - 1; i++) {
            const x0 = i * step * scaleX;
            const x1 = Math.min(gridWidth - 1, (i + 1) * step) * scaleX;
            const y0 = (gridHeight - 1 - j * step) * scaleY;
            const y1 = (gridHeight - 1 - Math.min(gridHeight - 1, (j + 1) * step)) * scaleY;

            const b0: [number, number, number] = [x0, y0, 0];
            const b1: [number, number, number] = [x1, y0, 0];
            const b2: [number, number, number] = [x1, y1, 0];
            const b3: [number, number, number] = [x0, y1, 0];

            writeTriangle(b0, b2, b1);
            writeTriangle(b0, b3, b2);
          }
        }

        // Side Skirts
        for (let i = 0; i < resW - 1; i++) {
          const x0 = i * step;
          const x1 = Math.min(gridWidth - 1, (i + 1) * step);
          const pyS = (gridHeight - 1) * scaleY;
          const pyN = 0;

          // South
          writeTriangle([x0 * scaleX, pyS, getZ(x0, 0)], [x0 * scaleX, pyS, 0], [x1 * scaleX, pyS, getZ(x1, 0)]);
          writeTriangle([x1 * scaleX, pyS, getZ(x1, 0)], [x0 * scaleX, pyS, 0], [x1 * scaleX, pyS, 0]);

          // North
          writeTriangle([x0 * scaleX, pyN, getZ(x0, gridHeight - 1)], [x1 * scaleX, pyN, getZ(x1, gridHeight - 1)], [x0 * scaleX, pyN, 0]);
          writeTriangle([x1 * scaleX, pyN, getZ(x1, gridHeight - 1)], [x1 * scaleX, pyN, 0], [x0 * scaleX, pyN, 0]);
        }

        for (let j = 0; j < resH - 1; j++) {
          const y0 = j * step;
          const y1 = Math.min(gridHeight - 1, (j + 1) * step);
          const py0 = (gridHeight - 1 - y0) * scaleY;
          const py1 = (gridHeight - 1 - y1) * scaleY;

          // West
          writeTriangle([0, py0, getZ(0, y0)], [0, py1, getZ(0, y1)], [0, py0, 0]);
          writeTriangle([0, py1, getZ(0, y1)], [0, py1, 0], [0, py0, 0]);

          // East
          writeTriangle([modelWidthMm, py0, getZ(gridWidth - 1, y0)], [modelWidthMm, py0, 0], [modelWidthMm, py1, getZ(gridWidth - 1, y1)]);
          writeTriangle([modelWidthMm, py1, getZ(gridWidth - 1, y1)], [modelWidthMm, py0, 0], [modelWidthMm, py1, 0]);
        }

        const blob = new Blob([buffer], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${imageFileName}-filament-art-${modelWidthMm}x${modelHeightMm}mm.stl`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error('STL generation error:', err);
        alert('Failed to generate STL file. Please try a lower resolution.');
      } finally {
        setIsProcessing(false);
      }
    }, 100);
  };

  // Print Statistics
  const printStats = useMemo(() => {
    const avgThickness = (baseThicknessMm + maxThicknessMm) / 2;
    const volumeMm3 = modelWidthMm * modelHeightMm * avgThickness;
    const volumeCm3 = volumeMm3 / 1000;
    const weightGrams = volumeCm3 * materialDensityGcm3;

    const totalPathMm = (modelWidthMm * modelHeightMm / 0.4) * (totalLayers * 0.4);
    const printTimeSeconds = (totalPathMm / printSpeedMmS) + (totalLayers * 3);
    const printTimeHours = printTimeSeconds / 3600;
    const hours = Math.floor(printTimeHours);
    const minutes = Math.round((printTimeHours - hours) * 60);

    return {
      volumeCm3: volumeCm3.toFixed(2),
      weightGrams: weightGrams.toFixed(1),
      estimatedTime: `${hours}h ${minutes}m`,
      totalLayers,
      swapsCount: Math.max(0, filaments.length - 1)
    };
  }, [modelWidthMm, modelHeightMm, baseThicknessMm, maxThicknessMm, materialDensityGcm3, totalLayers, printSpeedMmS, filaments.length]);

  // Filament Palette Handlers
  const handleAddFilament = () => {
    if (filaments.length >= 8) {
      alert('Maximum of 8 filaments supported.');
      return;
    }
    const newFilament: FilamentItem = {
      id: `f_${Date.now()}`,
      name: `Filament ${filaments.length + 1}`,
      brand: 'Custom',
      material: 'PLA',
      colorHex: '#3b82f6',
      td: 2.0,
      minThickness: 1.0,
      maxThickness: 2.5
    };
    setFilaments([...filaments, newFilament]);
  };

  const handleUpdateFilament = (id: string, field: keyof FilamentItem, value: any) => {
    setFilaments(filaments.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const handleRemoveFilament = (id: string) => {
    if (filaments.length <= 2) {
      alert('At least 2 filament colors are required for layered relief printing.');
      return;
    }
    setFilaments(filaments.filter(f => f.id !== id));
  };

  const handleApplyPresetPalette = (presetName: string) => {
    const found = DEFAULT_PALETTES.find(p => p.name === presetName);
    if (found) {
      setPaletteName(found.name);
      setFilaments(found.filaments);
    }
  };

  // Save Custom Palette to IndexedDB/LocalStorage
  const handleSavePalette = () => {
    const newProfile: FilamentProfile = {
      id: `pal_${Date.now()}`,
      name: paletteName || `My Palette ${savedProfiles.length + 1}`,
      filaments
    };
    const updated = [newProfile, ...savedProfiles.filter(p => p.name !== newProfile.name)];
    setSavedProfiles(updated);
    try {
      localStorage.setItem('toolique_custom_filament_palettes', JSON.stringify(updated));
      setIsSavedInDb(true);
      setTimeout(() => setIsSavedInDb(false), 2000);
    } catch {}
  };

  // Copy Layer Swap Guide
  const handleCopyGuide = () => {
    let guide = `=== TOOLIQUE FILAMENT ART PRINTING GUIDE ===\n`;
    guide += `Model: ${imageFileName} (${modelWidthMm}x${modelHeightMm}mm)\n`;
    guide += `Base Thickness: ${baseThicknessMm}mm | Max Height: ${maxThicknessMm}mm | Layer Height: ${layerHeightMm}mm\n`;
    guide += `Total Layers: ${totalLayers} | Est. Weight: ${printStats.weightGrams}g | Est. Time: ${printStats.estimatedTime}\n\n`;
    guide += `--- FILAMENT SWAP SCHEDULE ---\n`;
    layerSwapSchedule.forEach(s => {
      guide += `Layer ${s.layerIndex} (${s.heightMm.toFixed(2)}mm): ${s.filament.name} (${s.filament.brand} ${s.filament.material} - ${s.filament.colorHex})\n`;
    });
    guide += `\n--- SLICER SETTINGS ---\n`;
    guide += `Nozzle Temp: ${nozzleTemp}°C | Bed Temp: ${bedTemp}°C\nLayer Height: ${layerHeightMm}mm\nFirst Layer Height: ${baseThicknessMm}mm\nInfill: 100% (Solid Rectilinear)\nSpeed: ${printSpeedMmS} mm/s\n`;
    navigator.clipboard.writeText(guide);
    setIsCopiedGuide(true);
    setTimeout(() => setIsCopiedGuide(false), 2000);
  };

  const handleDownloadSettingsTxt = () => {
    let guide = `=== TOOLIQUE FILAMENT ART PRINTING GUIDE ===\n`;
    guide += `Model: ${imageFileName} (${modelWidthMm}x${modelHeightMm}mm)\n`;
    guide += `Base Thickness: ${baseThicknessMm}mm | Max Height: ${maxThicknessMm}mm | Layer Height: ${layerHeightMm}mm\n`;
    guide += `Total Layers: ${totalLayers} | Est. Weight: ${printStats.weightGrams}g | Est. Time: ${printStats.estimatedTime}\n\n`;
    guide += `--- FILAMENT SWAP SCHEDULE ---\n`;
    layerSwapSchedule.forEach(s => {
      guide += `Layer ${s.layerIndex} (${s.heightMm.toFixed(2)}mm): ${s.filament.name} (${s.filament.brand} ${s.filament.material} - ${s.filament.colorHex})\n`;
    });
    guide += `\n--- SLICER SETTINGS ---\n`;
    guide += `Nozzle Temp: ${nozzleTemp}°C | Bed Temp: ${bedTemp}°C\nLayer Height: ${layerHeightMm}mm\nFirst Layer Height: ${baseThicknessMm}mm\nInfill: 100% (Solid Rectilinear)\nSpeed: ${printSpeedMmS} mm/s\n`;
    
    const blob = new Blob([guide], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${imageFileName}-print-settings.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto px-2 sm:px-4">
      
      {/* Tool Hero Header */}
      <div className="saas-card p-6 md:p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between items-start gap-5 relative overflow-hidden shadow-xl">
        <div className="space-y-2 relative z-10 w-full">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Palette className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              Free Filament Art Maker
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 text-[10px] font-black uppercase tracking-wider">
              Free HueForge Alternative
            </span>
          </div>

          <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 leading-snug">
            Turn any image into layered 3D printable filament art — free, private, and directly in your browser.
          </p>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium max-w-3xl leading-relaxed">
            Upload an image, choose your filament colors, adjust the artwork, preview the result, and generate a printable 3D model.
          </p>

          {/* Trust Badges */}
          <div className="flex items-center gap-2 flex-wrap pt-2">
            <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>Free to use</span>
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-[11px] font-bold flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-indigo-500" />
              <span>No signup required</span>
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-700 dark:text-sky-400 text-[11px] font-bold flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-sky-500" />
              <span>Browser-based</span>
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-400 text-[11px] font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
              <span>Privacy-focused</span>
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-[11px] font-bold flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-amber-500" />
              <span>STL export</span>
            </span>
          </div>

          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 pt-1 italic">
            Toolique is an independent tool and is not affiliated with or endorsed by HueForge.
          </p>
        </div>
      </div>

      {/* Quick Specs Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
        <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 space-y-0.5">
          <span className="text-[10px] font-bold text-zinc-400 uppercase">Size</span>
          <div className="font-black text-zinc-900 dark:text-white text-sm">{modelWidthMm} × {modelHeightMm} mm</div>
        </div>
        <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 space-y-0.5">
          <span className="text-[10px] font-bold text-zinc-400 uppercase">Max Relief Z</span>
          <div className="font-black text-indigo-600 dark:text-indigo-400 text-sm">{maxThicknessMm.toFixed(2)} mm</div>
        </div>
        <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 space-y-0.5">
          <span className="text-[10px] font-bold text-zinc-400 uppercase">Layer Height</span>
          <div className="font-black text-zinc-900 dark:text-white text-sm">{layerHeightMm} mm</div>
        </div>
        <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 space-y-0.5">
          <span className="text-[10px] font-bold text-zinc-400 uppercase">Total Layers</span>
          <div className="font-black text-zinc-900 dark:text-white text-sm">{totalLayers} Layers</div>
        </div>
        <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 space-y-0.5">
          <span className="text-[10px] font-bold text-zinc-400 uppercase">Filament Colors</span>
          <div className="font-black text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-1">
            <span>{filaments.length} Colors</span>
            <span className="text-[10px] text-zinc-400">({printStats.swapsCount} Swaps)</span>
          </div>
        </div>
        <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 space-y-0.5">
          <span className="text-[10px] font-bold text-zinc-400 uppercase">Est. Print Time</span>
          <div className="font-black text-amber-600 dark:text-amber-400 text-sm">{printStats.estimatedTime}</div>
        </div>
      </div>

      {/* 3-COLUMN DESKTOP WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN: Controls, Palette & Image Settings (4 Cols) */}
        {/* ========================================================= */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Section Navigation Tabs */}
          <div className="flex items-center p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setLeftTab('image')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
                leftTab === 'image' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              🖼️ Frame
            </button>
            <button
              type="button"
              onClick={() => setLeftTab('palette')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
                leftTab === 'palette' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              🎨 Palette
            </button>
            <button
              type="button"
              onClick={() => setLeftTab('adjust')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
                leftTab === 'adjust' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              🎛️ Tuning
            </button>
            <button
              type="button"
              onClick={() => setLeftTab('slicer')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
                leftTab === 'slicer' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              ⚙️ Slicer
            </button>
          </div>

          {/* TAB 1: Image Upload, Presets & Transformations */}
          {leftTab === 'image' && (
            <div className="space-y-4">
              <div className="saas-card p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-850">
                  <span className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image / Art</span>
                  </span>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase">Local File</span>
                </div>

                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                  className="p-6 border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 rounded-2xl text-center cursor-pointer transition bg-zinc-50/50 dark:bg-zinc-900/30 group"
                >
                  <Upload className="w-8 h-8 text-zinc-400 group-hover:text-indigo-500 mx-auto mb-2 transition-transform group-hover:scale-110" />
                  <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Drop photo here or <span className="text-indigo-600 dark:text-indigo-400">browse files</span>
                  </p>
                  <p className="text-[10px] text-zinc-400 mt-1">Supports JPG, PNG, and WebP format</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    className="hidden"
                  />
                </div>

                {/* Sample Artworks Quick Selector */}
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">Or Try Sample Artwork:</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {SAMPLE_ARTWORKS.map(art => (
                      <button
                        key={art.id}
                        type="button"
                        onClick={() => generateSample(art.type)}
                        className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 text-[11px] font-bold text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer bg-zinc-50/50 dark:bg-zinc-900/40 text-center truncate"
                      >
                        {art.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Transformations Row */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-850">
                  <button
                    type="button"
                    onClick={() => setRotateDeg((prev) => (prev + 90) % 360)}
                    className="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1 cursor-pointer transition"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>90°</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFlipH(!flipH)}
                    className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                      flipH ? 'bg-indigo-600 text-white border-transparent' : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <FlipHorizontal className="w-3.5 h-3.5" />
                    <span>Flip H</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFlipV(!flipV)}
                    className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                      flipV ? 'bg-indigo-600 text-white border-transparent' : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <FlipVertical className="w-3.5 h-3.5" />
                    <span>Flip V</span>
                  </button>
                </div>
              </div>

              {/* Physical Dimensions */}
              <div className="saas-card p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-4">
                <span className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5" />
                  <span>Physical Dimensions</span>
                </span>

                <div className="grid grid-cols-4 gap-1.5">
                  {(['square', 'portrait', 'landscape', 'custom'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleAspectPresetChange(p)}
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-bold capitalize transition cursor-pointer ${
                        aspectPreset === p 
                          ? 'bg-indigo-600 text-white shadow-xs' 
                          : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Width (mm)</label>
                    <input
                      type="number"
                      min="30"
                      max="300"
                      value={modelWidthMm}
                      onChange={(e) => setModelWidthMm(Math.max(20, parseFloat(e.target.value) || 20))}
                      className="saas-input w-full font-mono font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Height (mm)</label>
                    <input
                      type="number"
                      min="30"
                      max="300"
                      value={modelHeightMm}
                      onChange={(e) => setModelHeightMm(Math.max(20, parseFloat(e.target.value) || 20))}
                      className="saas-input w-full font-mono font-bold text-center"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Filament Palette Manager */}
          {leftTab === 'palette' && (
            <div className="saas-card p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-850">
                <span className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5" />
                  <span>Filament Palette ({filaments.length})</span>
                </span>
                <button
                  type="button"
                  onClick={handleSavePalette}
                  className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Save className="w-3 h-3" />
                  <span>{isSavedInDb ? 'Saved!' : 'Save Palette'}</span>
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Preset Palettes</label>
                <select
                  value={paletteName}
                  onChange={(e) => handleApplyPresetPalette(e.target.value)}
                  className="saas-select w-full text-xs"
                >
                  {DEFAULT_PALETTES.map(p => (
                    <option key={p.name} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {filaments.map((f, idx) => (
                  <div 
                    key={f.id}
                    className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800/80 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full border border-zinc-300 dark:border-zinc-700 shadow-xs" style={{ backgroundColor: f.colorHex }} />
                        <span className="font-extrabold text-zinc-900 dark:text-white">#{idx + 1} {f.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFilament(f.id)}
                        className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 p-1 rounded-lg transition cursor-pointer"
                        title="Remove filament"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-5">
                        <input
                          type="text"
                          value={f.name}
                          onChange={(e) => handleUpdateFilament(f.id, 'name', e.target.value)}
                          className="saas-input w-full text-[11px] py-1"
                          placeholder="Filament Name"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="color"
                          value={f.colorHex}
                          onChange={(e) => handleUpdateFilament(f.id, 'colorHex', e.target.value)}
                          className="w-full h-7 rounded-lg border border-zinc-200 dark:border-zinc-800 cursor-pointer p-0.5"
                        />
                      </div>
                      <div className="col-span-4 flex items-center gap-1">
                        <span className="text-[9px] text-zinc-400 font-bold uppercase">TD:</span>
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          max="15"
                          value={f.td}
                          onChange={(e) => handleUpdateFilament(f.id, 'td', parseFloat(e.target.value) || 1.0)}
                          className="saas-input w-full text-[11px] py-1 text-center font-mono"
                          title="Transmission Distance (mm)"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddFilament}
                disabled={filaments.length >= 8}
                className="w-full py-2 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Color ({filaments.length}/8)</span>
              </button>
            </div>
          )}

          {/* TAB 3: Image Tuning & Filter Sliders */}
          {leftTab === 'adjust' && (
            <div className="saas-card p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-3.5 text-xs">
              <span className="text-xs font-black uppercase text-zinc-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                <span>Image Tuning & Optical Curves</span>
              </span>

              {/* Brightness */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-zinc-500">Brightness</span>
                  <span className="font-mono">{brightness > 0 ? `+${brightness}` : brightness}</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={brightness}
                  onChange={(e) => setBrightness(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Contrast */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-zinc-500">Contrast</span>
                  <span className="font-mono">{contrast > 0 ? `+${contrast}` : contrast}</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={contrast}
                  onChange={(e) => setContrast(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Gamma */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-zinc-500">Gamma Curve</span>
                  <span className="font-mono">{gamma.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.3"
                  max="2.5"
                  step="0.05"
                  value={gamma}
                  onChange={(e) => setGamma(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Color Saturation */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-zinc-500">Color Saturation</span>
                  <span className="font-mono">{saturation}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={saturation}
                  onChange={(e) => setSaturation(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Invert & Grayscale */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-850">
                <button
                  type="button"
                  onClick={() => setIsGrayscale(!isGrayscale)}
                  className={`p-2 rounded-xl text-[11px] font-bold transition cursor-pointer text-center ${
                    isGrayscale ? 'bg-indigo-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  Grayscale: {isGrayscale ? 'ON' : 'OFF'}
                </button>
                <button
                  type="button"
                  onClick={() => setInvertHeight(!invertHeight)}
                  className={`p-2 rounded-xl text-[11px] font-bold transition cursor-pointer text-center ${
                    invertHeight ? 'bg-indigo-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  Invert Z: {invertHeight ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: Slicer Parameters */}
          {leftTab === 'slicer' && (
            <div className="saas-card p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-4 text-xs">
              <span className="text-xs font-black uppercase text-zinc-400 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                <span>Slicer & Print Head Parameters</span>
              </span>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Layer Height</label>
                  <select
                    value={layerHeightMm}
                    onChange={(e) => setLayerHeightMm(parseFloat(e.target.value))}
                    className="saas-select w-full text-xs font-mono font-bold"
                  >
                    <option value={0.04}>0.04mm (Ultra)</option>
                    <option value={0.08}>0.08mm (Best)</option>
                    <option value={0.12}>0.12mm (Fast)</option>
                    <option value={0.16}>0.16mm (Draft)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Base (mm)</label>
                  <input
                    type="number"
                    step="0.08"
                    min="0.4"
                    max="2.0"
                    value={baseThicknessMm}
                    onChange={(e) => setBaseThicknessMm(parseFloat(e.target.value) || 0.8)}
                    className="saas-input w-full text-center font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Max (mm)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="8.0"
                    value={maxThicknessMm}
                    onChange={(e) => setMaxThicknessMm(parseFloat(e.target.value) || 3.2)}
                    className="saas-input w-full text-center font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">Print Speed</label>
                  <input
                    type="number"
                    value={printSpeedMmS}
                    onChange={(e) => setPrintSpeedMmS(parseInt(e.target.value, 10) || 100)}
                    className="saas-input w-full text-center font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">Nozzle Temp</label>
                  <input
                    type="number"
                    value={nozzleTemp}
                    onChange={(e) => setNozzleTemp(parseInt(e.target.value, 10) || 215)}
                    className="saas-input w-full text-center font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">Bed Temp</label>
                  <input
                    type="number"
                    value={bedTemp}
                    onChange={(e) => setBedTemp(parseInt(e.target.value, 10) || 60)}
                    className="saas-input w-full text-center font-mono text-xs"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/60 space-y-1 text-[11px] text-indigo-900 dark:text-indigo-300">
                <div className="font-extrabold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Slicer Preset: Solid Infill</span>
                </div>
                <p className="text-[10px] leading-relaxed text-indigo-700 dark:text-indigo-400">
                  Always use 100% rectilinear infill in your slicer to ensure proper optical transmission across layers.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* ========================================================= */}
        {/* CENTER COLUMN: Live Multi-Tab Image Previews (5 Cols)     */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Main Preview Container with Tabs */}
          <div className="saas-card p-5 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-4 shadow-lg">
            
            {/* Tab Navigation */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('simulation')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'simulation'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simulation</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('3d')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === '3d'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>3D Mesh</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('split')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'split'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <Split className="w-3.5 h-3.5" />
                <span>Compare</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('processed')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'processed'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Tuned</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('original')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === 'original'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Original</span>
              </button>
            </div>

            {/* Viewport Canvas Display */}
            <div className="relative aspect-square w-full rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden flex items-center justify-center p-2 shadow-inner">
              
              {/* TAB 1: Filament Optical Simulation */}
              <canvas
                ref={simulationCanvasRef}
                className={`max-w-full max-h-full object-contain rounded-xl shadow-2xl ${activeTab === 'simulation' ? 'block' : 'hidden'}`}
              />

              {/* TAB 2: 3D Relief Interactive Canvas */}
              {activeTab === '3d' && (
                <div 
                  className="w-full h-full relative cursor-grab active:cursor-grabbing select-none"
                  onMouseDown={(e) => {
                    setIsDragging3d(true);
                    lastMousePos.current = { x: e.clientX, y: e.clientY };
                  }}
                  onMouseMove={(e) => {
                    if (!isDragging3d) return;
                    const dx = e.clientX - lastMousePos.current.x;
                    const dy = e.clientY - lastMousePos.current.y;
                    setRotY((prev) => prev + dx * 0.7);
                    setRotX((prev) => Math.min(85, Math.max(5, prev + dy * 0.7)));
                    lastMousePos.current = { x: e.clientX, y: e.clientY };
                  }}
                  onMouseUp={() => setIsDragging3d(false)}
                  onMouseLeave={() => setIsDragging3d(false)}
                >
                  <canvas
                    ref={threeCanvasRef}
                    width={500}
                    height={500}
                    className="w-full h-full object-contain"
                  />

                  {/* 3D Mode Controls Overlay */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-zinc-900/85 backdrop-blur-md p-1.5 rounded-xl border border-zinc-700">
                    <button
                      type="button"
                      onClick={() => setView3dMode('shaded')}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                        view3dMode === 'shaded' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Solid
                    </button>
                    <button
                      type="button"
                      onClick={() => setView3dMode('heatmap')}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                        view3dMode === 'heatmap' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Heatmap
                    </button>
                    <button
                      type="button"
                      onClick={() => setView3dMode('wireframe')}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                        view3dMode === 'wireframe' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Wire
                    </button>
                    <button
                      type="button"
                      onClick={() => { setRotX(45); setRotY(-25); setZoom3d(1.2); }}
                      className="p-1 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
                      title="Reset View"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: Split Compare Slider */}
              {activeTab === 'split' && imageSrc && (
                <div 
                  className="w-full h-full relative overflow-hidden rounded-xl select-none cursor-ew-resize"
                  onMouseMove={(e) => {
                    if (e.buttons === 1) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
                      setSplitPos(Math.round((x / rect.width) * 100));
                    }
                  }}
                  onTouchMove={(e) => {
                    const touch = e.touches[0];
                    if (touch) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = Math.max(0, Math.min(rect.width, touch.clientX - rect.left));
                      setSplitPos(Math.round((x / rect.width) * 100));
                    }
                  }}
                >
                  <img
                    src={imageSrc}
                    alt="Original"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                  />
                  <div
                    className="absolute inset-y-0 left-0 overflow-hidden pointer-events-none"
                    style={{ width: `${splitPos}%` }}
                  >
                    <canvas
                      ref={simulationCanvasRef}
                      className="w-full h-full object-contain pointer-events-none"
                    />
                  </div>
                  {/* Split Divider Handle */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl flex items-center justify-center pointer-events-none"
                    style={{ left: `${splitPos}%` }}
                  >
                    <div className="w-6 h-6 rounded-full bg-white text-zinc-900 flex items-center justify-center text-[9px] font-black shadow-md border border-zinc-300">
                      ↔
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg bg-black/70 text-white text-[10px] font-bold">
                    ← Filament Sim ({splitPos}%) | Original →
                  </div>
                </div>
              )}

              {/* TAB 4: Processed Intermediate Image */}
              <canvas
                ref={processedCanvasRef}
                className={`max-w-full max-h-full object-contain rounded-xl shadow-2xl ${activeTab === 'processed' ? 'block' : 'hidden'}`}
              />

              {/* TAB 5: Original Image */}
              {activeTab === 'original' && imageSrc && (
                <img
                  src={imageSrc}
                  alt="Original Artwork"
                  className="max-w-full max-h-full object-contain rounded-xl"
                />
              )}

              {/* Loading Indicator */}
              {isProcessing && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center space-y-2 z-20">
                  <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-bold text-white">{processingProgress}</p>
                </div>
              )}
            </div>

            {/* Interactive Layer Slicing Scrubber */}
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPlayingAnimation(!isPlayingAnimation)}
                    className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition cursor-pointer"
                    title={isPlayingAnimation ? 'Pause Slicing Animation' : 'Play Slicing Animation'}
                  >
                    {isPlayingAnimation ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                  <span className="font-extrabold text-zinc-900 dark:text-white">
                    Layer Scrubber: #{scrubberLayer} / {totalLayers}
                  </span>
                </div>
                <span className="font-mono text-zinc-400 font-bold">
                  {(scrubberLayer * layerHeightMm).toFixed(2)} mm
                </span>
              </div>
              <input
                type="range"
                min="1"
                max={totalLayers}
                value={scrubberLayer}
                onChange={(e) => setScrubberLayer(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Simulation Disclaimer */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-[11px] font-medium leading-relaxed flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
              <span>
                <strong>Simulation Preview:</strong> Actual print appearance will vary based on filament opacity, transmission distance, slicer settings, lighting, and material properties.
              </span>
            </div>
          </div>

        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Layer Swap Guide & STL Export (3 Cols)      */}
        {/* ========================================================= */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* STL Generation & Export Actions */}
          <div className="saas-card p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-3.5 shadow-md">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-850">
              <span className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" />
                <span>Export 3D STL</span>
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Watertight</span>
            </div>

            <div className="space-y-2 text-xs">
              <label className="text-[10px] font-bold text-zinc-400 uppercase">Mesh Detail</label>
              <div className="grid grid-cols-3 gap-1">
                {(['preview', 'medium', 'high'] as const).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setStlResolution(r)}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-bold capitalize transition cursor-pointer ${
                      stlResolution === r ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleExportSTL}
              disabled={isProcessing || !heightmapGrid}
              className="saas-button-primary w-full py-3 text-xs font-black flex items-center justify-center gap-2 shadow-lg hover:scale-102 transition"
            >
              <Download className="w-4 h-4" />
              <span>Download Watertight STL</span>
            </button>
            <p className="text-[10px] text-zinc-400 text-center">Compatible with Bambu Studio, OrcaSlicer, PrusaSlicer & Cura.</p>
          </div>

          {/* Layer Swap Instructions */}
          <div className="saas-card p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-850">
              <span className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Filament Swap Guide</span>
              </span>
              <button
                type="button"
                onClick={handleCopyGuide}
                className="text-[10px] font-bold text-zinc-500 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
              >
                {isCopiedGuide ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{isCopiedGuide ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-500 text-[10px] font-bold">
                Start Print with: <strong className="text-zinc-900 dark:text-white">{filaments[0]?.name}</strong>
              </div>

              {/* Vertical Connected Swap Steps */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {layerSwapSchedule.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full border border-zinc-300" style={{ backgroundColor: step.filament.colorHex }} />
                      <div>
                        <div className="font-extrabold text-zinc-900 dark:text-white text-[11px]">{step.filament.name}</div>
                        <div className="text-[9px] text-zinc-400">Swap at Layer #{step.layerIndex} ({step.heightMm.toFixed(2)}mm)</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleDownloadSettingsTxt}
                className="w-full py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-[11px] font-bold text-zinc-700 dark:text-zinc-300 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                <span>Download Slicer Settings (.TXT)</span>
              </button>
            </div>
          </div>

          {/* Slicer Quick Setup Card */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 space-y-2 text-xs">
            <span className="text-[10px] font-black uppercase text-zinc-400 block">Slicer Setup Cheatsheet</span>
            <div className="space-y-1 text-[11px] text-zinc-600 dark:text-zinc-300">
              <div>• <strong>Layer Height:</strong> {layerHeightMm} mm</div>
              <div>• <strong>First Layer:</strong> {firstLayerHeight} mm</div>
              <div>• <strong>Infill:</strong> 100% Solid Rectilinear</div>
              <div>• <strong>Top Pattern:</strong> Monotonic Line</div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

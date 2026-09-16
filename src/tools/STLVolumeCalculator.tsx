import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Box, 
  Upload, 
  Download, 
  Copy, 
  Check, 
  Info, 
  RefreshCw, 
  Maximize2, 
  Layers, 
  Scale, 
  DollarSign, 
  AlertTriangle, 
  Rotate3d, 
  Trash2, 
  Sliders, 
  Package, 
  Sparkles
} from 'lucide-react';
import jsPDF from 'jspdf';

// --- Types & Interfaces ---

interface MaterialPreset {
  id: string;
  name: string;
  category: 'FDM' | 'Resin' | 'Metal & Casting' | 'Custom';
  density: number; // g/cm³
  defaultCostPerKg: number; // in USD approx default
  color: string;
  description: string;
}

interface StlMeshStats {
  fileName: string;
  fileSizeBytes: number;
  format: 'Binary STL' | 'ASCII STL';
  triangleCount: number;
  parseTimeMs: number;
  volumeCm3: number;
  surfaceAreaCm2: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
  dimX: number;
  dimY: number;
  dimZ: number;
  boundingBoxVolumeCm3: number;
  packingDensityPct: number;
  centroid: { x: number; y: number; z: number };
  isWatertightEstimate: boolean;
  degenerateTriangles: number;
  trianglesPreview?: Float32Array; // Subsampled (x1,y1,z1, x2,y2,z2, x3,y3,z3)
}

interface BatchItem {
  id: string;
  fileName: string;
  triangleCount: number;
  dimX: number;
  dimY: number;
  dimZ: number;
  solidVolumeCm3: number;
  effectiveWeightGrams: number;
  cost: number;
}

const MATERIAL_PRESETS: MaterialPreset[] = [
  // FDM Filaments
  { id: 'pla', name: 'PLA (Standard)', category: 'FDM', density: 1.24, defaultCostPerKg: 20, color: '#3b82f6', description: 'Most popular 3D printing filament. Biodegradable, rigid, easy to print.' },
  { id: 'pla_plus', name: 'PLA+ / Pro / Tough', category: 'FDM', density: 1.25, defaultCostPerKg: 24, color: '#2563eb', description: 'Impact-modified PLA with superior layer adhesion and ductility.' },
  { id: 'petg', name: 'PETG (Tough)', category: 'FDM', density: 1.27, defaultCostPerKg: 22, color: '#06b6d4', description: 'Durable, heat and chemical resistant, ideal for functional parts.' },
  { id: 'abs', name: 'ABS (Engineering)', category: 'FDM', density: 1.04, defaultCostPerKg: 22, color: '#f59e0b', description: 'High impact and heat resistance (up to 95°C), requires enclosure.' },
  { id: 'asa', name: 'ASA (UV Weatherproof)', category: 'FDM', density: 1.07, defaultCostPerKg: 28, color: '#d97706', description: 'UV-stabilized outdoor equivalent of ABS. Zero yellowing.' },
  { id: 'tpu_95a', name: 'TPU 95A (Flexible)', category: 'FDM', density: 1.21, defaultCostPerKg: 32, color: '#10b981', description: 'Rubber-like elastomer for gaskets, grips, dampeners, and wheels.' },
  { id: 'nylon_pa12', name: 'Nylon / PA12', category: 'FDM', density: 1.14, defaultCostPerKg: 50, color: '#8b5cf6', description: 'Ultra-tough, fatigue resistant, ideal for gears and living hinges.' },
  { id: 'pc', name: 'Polycarbonate (PC)', category: 'FDM', density: 1.20, defaultCostPerKg: 45, color: '#6366f1', description: 'Extreme impact resistance and heat deflection (up to 110°C).' },
  { id: 'pla_cf', name: 'Carbon Fiber PLA (PLA-CF)', category: 'FDM', density: 1.29, defaultCostPerKg: 35, color: '#475569', description: 'Carbon fiber reinforced for high stiffness and matte texture.' },
  { id: 'pa_cf', name: 'Carbon Fiber Nylon (PA-CF)', category: 'FDM', density: 1.18, defaultCostPerKg: 75, color: '#1e293b', description: 'Industrial structural composite for automotive and drone frames.' },
  { id: 'peek', name: 'PEEK (Aerospace High-Temp)', category: 'FDM', density: 1.30, defaultCostPerKg: 380, color: '#e11d48', description: 'Ultra-performance thermoplastic with 250°C continuous service.' },
  { id: 'hips', name: 'HIPS Support Material', category: 'FDM', density: 1.04, defaultCostPerKg: 25, color: '#a855f7', description: 'Limonene-soluble support filament and lightweight structure.' },
  { id: 'pva', name: 'PVA Water-Soluble Support', category: 'FDM', density: 1.19, defaultCostPerKg: 65, color: '#0ea5e9', description: 'Water-soluble dual extrusion support material.' },
  
  // Resin / SLA Materials
  { id: 'resin_standard', name: 'Standard UV Resin', category: 'Resin', density: 1.15, defaultCostPerKg: 30, color: '#84cc16', description: 'Fast curing photopolymer for miniatures, figurines, and visual prototypes.' },
  { id: 'resin_tough', name: 'Tough / ABS-Like Resin', category: 'Resin', density: 1.12, defaultCostPerKg: 42, color: '#14b8a6', description: 'Enhanced elongation and shatter resistance for functional resin prints.' },
  { id: 'resin_water_wash', name: 'Water-Washable Resin', category: 'Resin', density: 1.16, defaultCostPerKg: 34, color: '#38bdf8', description: 'Easy cleanup with tap water without isopropyl alcohol.' },
  { id: 'resin_high_temp', name: 'High-Temp Ceramic Resin', category: 'Resin', density: 1.45, defaultCostPerKg: 85, color: '#fb923c', description: 'Resin filled with ceramic particles for heat deflection up to 200°C.' },
  { id: 'resin_castable', name: 'Castable Jewelry Resin', category: 'Resin', density: 1.10, defaultCostPerKg: 95, color: '#eab308', description: 'Zero-ash burnout resin for lost-wax gold and silver casting.' },

  // Metals & Casting
  { id: 'metal_alu', name: 'Aluminium 6061', category: 'Metal & Casting', density: 2.70, defaultCostPerKg: 15, color: '#94a3b8', description: 'Lightweight structural metal for casting or CNC machining.' },
  { id: 'metal_brass', name: 'Brass / Bronze', category: 'Metal & Casting', density: 8.50, defaultCostPerKg: 25, color: '#d97706', description: 'Heavy decorative and low-friction bronze casting metal.' },
  { id: 'metal_steel', name: 'Stainless Steel 316L', category: 'Metal & Casting', density: 8.00, defaultCostPerKg: 35, color: '#64748b', description: 'Marine-grade corrosion resistant stainless steel.' },
  { id: 'metal_titanium', name: 'Titanium Grade 5 (Ti-6Al-4V)', category: 'Metal & Casting', density: 4.43, defaultCostPerKg: 120, color: '#a1a1aa', description: 'Aerospace medical biocompatible high strength-to-weight metal.' },
  { id: 'metal_silver', name: 'Sterling Silver 925', category: 'Metal & Casting', density: 10.40, defaultCostPerKg: 900, color: '#e2e8f0', description: 'Precious metal for lost-wax cast jewelry and luxury ornaments.' },
  { id: 'metal_gold_14k', name: '14K Yellow Gold', category: 'Metal & Casting', density: 13.10, defaultCostPerKg: 42000, color: '#facc15', description: 'Fine jewelry casting alloy.' },

  // Custom
  { id: 'custom', name: 'Custom Density', category: 'Custom', density: 1.24, defaultCostPerKg: 25, color: '#ec4899', description: 'User-specified mass density in g/cm³.' }
];

const CURRENCIES = [
  { code: 'INR', symbol: '₹', label: 'INR (₹)', rate: 86.5 },
  { code: 'USD', symbol: '$', label: 'USD ($)', rate: 1.0 },
  { code: 'EUR', symbol: '€', label: 'EUR (€)', rate: 0.95 },
  { code: 'GBP', symbol: '£', label: 'GBP (£)', rate: 0.79 },
  { code: 'CAD', symbol: 'C$', label: 'CAD (C$)', rate: 1.42 },
  { code: 'AUD', symbol: 'A$', label: 'AUD (A$)', rate: 1.58 }
];

const COLOR_THEMES = [
  { id: 'indigo', name: 'Neon Indigo', hex: '#6366f1', lightHex: '#818cf8', wire: '#4338ca' },
  { id: 'emerald', name: 'Cyber Emerald', hex: '#10b981', lightHex: '#34d399', wire: '#065f46' },
  { id: 'amber', name: 'Slicer Orange', hex: '#f97316', lightHex: '#fb923c', wire: '#c2410c' },
  { id: 'cyan', name: 'Electric Cyan', hex: '#06b6d4', lightHex: '#22d3ee', wire: '#0e7490' },
  { id: 'rose', name: 'Crimson Flame', hex: '#f43f5e', lightHex: '#fb7185', wire: '#be123c' },
  { id: 'slate', name: 'Titanium Grey', hex: '#64748b', lightHex: '#94a3b8', wire: '#334155' }
];

export default function STLVolumeCalculator() {
  // Currency
  const [currency, setCurrency] = useState<string>('INR');

  // Active Material
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('pla');
  const [customDensity, setCustomDensity] = useState<number>(1.24);
  const [spoolCost, setSpoolCost] = useState<number>(1500); // in selected currency
  const [spoolWeightGrams, setSpoolWeightGrams] = useState<number>(1000);

  // Slicing & Infill Mode
  const [isInfillMode, setIsInfillMode] = useState<boolean>(true);
  const [infillPct, setInfillPct] = useState<number>(20);
  const [wallCount, setWallCount] = useState<number>(3); // 3 perimeters = 1.2mm shell
  const [nozzleDiameterMm] = useState<number>(0.4);
  const [wasteFactorPct, setWasteFactorPct] = useState<number>(5); // 5% support + purge

  // Scale Multiplier
  const [scaleMultiplierPct, setScaleMultiplierPct] = useState<number>(100);
  const [uniformScaleInput, setUniformScaleInput] = useState<number>(100);

  // Batch Production
  const [batchQuantity, setBatchQuantity] = useState<number>(1);

  // Parsed Mesh State
  const [meshStats, setMeshStats] = useState<StlMeshStats | null>(null);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);

  // Multi-File Comparison Batch List
  const [batchList, setBatchList] = useState<BatchItem[]>([]);

  // 3D Canvas View Controls
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [renderMode, setRenderMode] = useState<'solid' | 'wireframe' | 'both'>('both');
  const [showBoundingBox, setShowBoundingBox] = useState<boolean>(true);
  const [showBedGrid, setShowBedGrid] = useState<boolean>(true);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [selectedTheme, setSelectedTheme] = useState<string>('indigo');

  // Camera State
  const [cameraRot, setCameraRot] = useState<{ pitch: number; yaw: number }>({ pitch: 0.45, yaw: -0.65 });
  const [cameraZoom, setCameraZoom] = useState<number>(1.0);
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Clipboard Copy State
  const [copied, setCopied] = useState<boolean>(false);

  // Currency Object
  const curObj = useMemo(() => CURRENCIES.find(c => c.code === currency) || CURRENCIES[0], [currency]);

  // Current Density
  const activeMaterial = useMemo(() => {
    return MATERIAL_PRESETS.find(m => m.id === selectedMaterialId) || MATERIAL_PRESETS[0];
  }, [selectedMaterialId]);

  const effectiveDensity = useMemo(() => {
    if (selectedMaterialId === 'custom') {
      return customDensity > 0 ? customDensity : 1.24;
    }
    return activeMaterial.density;
  }, [selectedMaterialId, customDensity, activeMaterial]);

  // Auto set default spool cost on currency change or material change
  useEffect(() => {
    if (selectedMaterialId !== 'custom') {
      const defaultUsd = activeMaterial.defaultCostPerKg * (spoolWeightGrams / 1000);
      const convertedCost = Math.round(defaultUsd * curObj.rate);
      setSpoolCost(convertedCost);
    }
  }, [selectedMaterialId, currency, spoolWeightGrams, curObj.rate, activeMaterial]);

  // Scale factor decimal
  const scaleFactor = useMemo(() => scaleMultiplierPct / 100.0, [scaleMultiplierPct]);
  const volumeScaleFactor = useMemo(() => Math.pow(scaleFactor, 3), [scaleFactor]);
  const areaScaleFactor = useMemo(() => Math.pow(scaleFactor, 2), [scaleFactor]);

  // Scaled Geometry Computations
  const scaledStats = useMemo(() => {
    if (!meshStats) return null;

    const baseSolidVolCm3 = meshStats.volumeCm3 * volumeScaleFactor;
    const baseSurfaceAreaCm2 = meshStats.surfaceAreaCm2 * areaScaleFactor;
    const baseDimX = meshStats.dimX * scaleFactor;
    const baseDimY = meshStats.dimY * scaleFactor;
    const baseDimZ = meshStats.dimZ * scaleFactor;
    const baseBbVolCm3 = (baseDimX * baseDimY * baseDimZ) / 1000.0;

    // Shell & Infill Volume Calculation
    // Shell thickness = nozzleDiameter * wallCount
    const shellThicknessMm = nozzleDiameterMm * wallCount;
    const shellThicknessCm = shellThicknessMm / 10.0;
    
    // Approximate shell volume from surface area * shell thickness
    const rawShellVolCm3 = (baseSurfaceAreaCm2 * shellThicknessCm);
    const estimatedShellVolCm3 = Math.min(baseSolidVolCm3, rawShellVolCm3 * 0.85); // 0.85 geometry overlap correction
    const estimatedCoreVolCm3 = Math.max(0, baseSolidVolCm3 - estimatedShellVolCm3);

    // Effective printed volume based on infill mode
    let effectiveVolumeCm3 = baseSolidVolCm3;
    if (isInfillMode) {
      const infillFraction = infillPct / 100.0;
      effectiveVolumeCm3 = estimatedShellVolCm3 + (estimatedCoreVolCm3 * infillFraction);
    }

    // Weight in grams
    const solidWeightGrams = baseSolidVolCm3 * effectiveDensity;
    const effectiveWeightGrams = effectiveVolumeCm3 * effectiveDensity;
    const totalWeightWithWasteGrams = effectiveWeightGrams * (1 + wasteFactorPct / 100.0);

    // Costs
    const costPerGram = spoolCost / (spoolWeightGrams > 0 ? spoolWeightGrams : 1000);
    const partMaterialCost = totalWeightWithWasteGrams * costPerGram;
    const batchMaterialCost = partMaterialCost * batchQuantity;
    const partsPerSpool = totalWeightWithWasteGrams > 0 ? Math.floor(spoolWeightGrams / totalWeightWithWasteGrams) : 0;
    const totalBatchWeightKg = (totalWeightWithWasteGrams * batchQuantity) / 1000.0;
    const spoolsRequired = partsPerSpool > 0 ? Math.ceil(batchQuantity / partsPerSpool) : 0;

    // Volume in other units
    const volumeMm3 = effectiveVolumeCm3 * 1000.0;
    const volumeIn3 = effectiveVolumeCm3 * 0.0610237;
    const volumeLiters = effectiveVolumeCm3 / 1000.0;
    const volumeFlOz = effectiveVolumeCm3 * 0.033814;

    // Weight in other units
    const weightKg = effectiveWeightGrams / 1000.0;
    const weightOz = effectiveWeightGrams * 0.035274;
    const weightLbs = effectiveWeightGrams * 0.00220462;

    return {
      solidVolumeCm3: baseSolidVolCm3,
      surfaceAreaCm2: baseSurfaceAreaCm2,
      dimX: baseDimX,
      dimY: baseDimY,
      dimZ: baseDimZ,
      bbVolCm3: baseBbVolCm3,
      packingDensityPct: baseBbVolCm3 > 0 ? (baseSolidVolCm3 / baseBbVolCm3) * 100 : 0,
      shellVolumeCm3: estimatedShellVolCm3,
      coreVolumeCm3: estimatedCoreVolCm3,
      effectiveVolumeCm3,
      solidWeightGrams,
      effectiveWeightGrams,
      totalWeightWithWasteGrams,
      partMaterialCost,
      batchMaterialCost,
      partsPerSpool,
      totalBatchWeightKg,
      spoolsRequired,
      volumeMm3,
      volumeIn3,
      volumeLiters,
      volumeFlOz,
      weightKg,
      weightOz,
      weightLbs
    };
  }, [
    meshStats, 
    volumeScaleFactor, 
    areaScaleFactor, 
    scaleFactor, 
    nozzleDiameterMm, 
    wallCount, 
    isInfillMode, 
    infillPct, 
    effectiveDensity, 
    wasteFactorPct, 
    spoolCost, 
    spoolWeightGrams, 
    batchQuantity
  ]);

  // --- STL Parser Engine (Binary + ASCII) ---
  const parseSTLArrayBuffer = useCallback((buffer: ArrayBuffer, fileName: string, fileSizeBytes: number) => {
    const startTime = performance.now();
    try {
      if (buffer.byteLength < 84) {
        throw new Error('File is too small to be a valid STL file.');
      }

      // Check if ASCII or Binary
      const headerText = new TextDecoder('ascii').decode(new Uint8Array(buffer, 0, Math.min(buffer.byteLength, 512)));
      const isAsciiCandidate = headerText.trim().startsWith('solid') && headerText.includes('facet normal');

      let triangleCount = 0;
      let totalVolume = 0;
      let totalSurfaceArea = 0;
      let minX = Infinity, maxX = -Infinity;
      let minY = Infinity, maxY = -Infinity;
      let minZ = Infinity, maxZ = -Infinity;
      let sumCx = 0, sumCy = 0, sumCz = 0;
      let degenerateCount = 0;
      let format: 'Binary STL' | 'ASCII STL' = 'Binary STL';

      // Array for 3D viewport preview (subsampled up to 8,000 triangles)
      const previewTrianglesList: number[] = [];
      const MAX_PREVIEW_TRIANGLES = 8000;

      if (isAsciiCandidate) {
        // --- ASCII STL Parser ---
        format = 'ASCII STL';
        const fullText = new TextDecoder('utf-8').decode(new Uint8Array(buffer));
        const vertexRegex = /vertex\s+([-\d.eE+]+)\s+([-\d.eE+]+)\s+([-\d.eE+]+)/g;
        
        let match;
        const vertices: { x: number; y: number; z: number }[] = [];
        while ((match = vertexRegex.exec(fullText)) !== null) {
          vertices.push({
            x: parseFloat(match[1]),
            y: parseFloat(match[2]),
            z: parseFloat(match[3])
          });
        }

        triangleCount = Math.floor(vertices.length / 3);
        const step = Math.max(1, Math.floor(triangleCount / MAX_PREVIEW_TRIANGLES));

        for (let i = 0; i < triangleCount; i++) {
          const v1 = vertices[i * 3];
          const v2 = vertices[i * 3 + 1];
          const v3 = vertices[i * 3 + 2];

          minX = Math.min(minX, v1.x, v2.x, v3.x);
          maxX = Math.max(maxX, v1.x, v2.x, v3.x);
          minY = Math.min(minY, v1.y, v2.y, v3.y);
          maxY = Math.max(maxY, v1.y, v2.y, v3.y);
          minZ = Math.min(minZ, v1.z, v2.z, v3.z);
          maxZ = Math.max(maxZ, v1.z, v2.z, v3.z);

          // Signed tetrahedral volume
          const vol = (v3.x * v2.y * v1.z - v2.x * v3.y * v1.z - v3.x * v1.y * v2.z + v1.x * v3.y * v2.z + v2.x * v1.y * v3.z - v1.x * v2.y * v3.z) / 6.0;
          totalVolume += vol;

          // Surface Area
          const ax = v2.x - v1.x, ay = v2.y - v1.y, az = v2.z - v1.z;
          const bx = v3.x - v1.x, by = v3.y - v1.y, bz = v3.z - v1.z;
          const cx = ay * bz - az * by;
          const cy = az * bx - ax * bz;
          const cz = ax * by - ay * bx;
          const area = 0.5 * Math.sqrt(cx * cx + cy * cy + cz * cz);
          totalSurfaceArea += area;

          if (area < 1e-7) degenerateCount++;

          // Centroid contribution
          sumCx += (v1.x + v2.x + v3.x) / 3.0;
          sumCy += (v1.y + v2.y + v3.y) / 3.0;
          sumCz += (v1.z + v2.z + v3.z) / 3.0;

          // Preview buffer
          if (i % step === 0 && previewTrianglesList.length < MAX_PREVIEW_TRIANGLES * 9) {
            previewTrianglesList.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z, v3.x, v3.y, v3.z);
          }
        }
      } else {
        // --- Binary STL Parser ---
        format = 'Binary STL';
        const dv = new DataView(buffer);
        triangleCount = dv.getUint32(80, true);

        if (triangleCount === 0 || triangleCount > 10000000) {
          throw new Error('Invalid triangle count in binary STL header.');
        }

        const step = Math.max(1, Math.floor(triangleCount / MAX_PREVIEW_TRIANGLES));
        let offset = 84;

        for (let i = 0; i < triangleCount; i++) {
          if (offset + 50 > dv.byteLength) break;

          const x1 = dv.getFloat32(offset + 12, true);
          const y1 = dv.getFloat32(offset + 16, true);
          const z1 = dv.getFloat32(offset + 20, true);
          const x2 = dv.getFloat32(offset + 24, true);
          const y2 = dv.getFloat32(offset + 28, true);
          const z2 = dv.getFloat32(offset + 32, true);
          const x3 = dv.getFloat32(offset + 36, true);
          const y3 = dv.getFloat32(offset + 40, true);
          const z3 = dv.getFloat32(offset + 44, true);

          minX = Math.min(minX, x1, x2, x3);
          maxX = Math.max(maxX, x1, x2, x3);
          minY = Math.min(minY, y1, y2, y3);
          maxY = Math.max(maxY, y1, y2, y3);
          minZ = Math.min(minZ, z1, z2, z3);
          maxZ = Math.max(maxZ, z1, z2, z3);

          // Signed tetrahedral volume
          const vol = (x3 * y2 * z1 - x2 * y3 * z1 - x3 * y1 * z2 + x1 * y3 * z2 + x2 * y1 * z3 - x1 * y2 * z3) / 6.0;
          totalVolume += vol;

          // Surface Area
          const ax = x2 - x1, ay = y2 - y1, az = z2 - z1;
          const bx = x3 - x1, by = y3 - y1, bz = z3 - z1;
          const cx = ay * bz - az * by;
          const cy = az * bx - ax * bz;
          const cz = ax * by - ay * bx;
          const area = 0.5 * Math.sqrt(cx * cx + cy * cy + cz * cz);
          totalSurfaceArea += area;

          if (area < 1e-7) degenerateCount++;

          // Centroid
          sumCx += (x1 + x2 + x3) / 3.0;
          sumCy += (y1 + y2 + y3) / 3.0;
          sumCz += (z1 + z2 + z3) / 3.0;

          // Subsampled preview
          if (i % step === 0 && previewTrianglesList.length < MAX_PREVIEW_TRIANGLES * 9) {
            previewTrianglesList.push(x1, y1, z1, x2, y2, z2, x3, y3, z3);
          }

          offset += 50;
        }
      }

      const volumeCm3 = Math.abs(totalVolume) / 1000.0; // mm³ to cm³
      const surfaceAreaCm2 = totalSurfaceArea / 100.0; // mm² to cm²
      const dimX = isFinite(maxX - minX) ? Math.max(0, maxX - minX) : 0;
      const dimY = isFinite(maxY - minY) ? Math.max(0, maxY - minY) : 0;
      const dimZ = isFinite(maxZ - minZ) ? Math.max(0, maxZ - minZ) : 0;
      const boundingBoxVolumeCm3 = (dimX * dimY * dimZ) / 1000.0;
      const packingDensityPct = boundingBoxVolumeCm3 > 0 ? (volumeCm3 / boundingBoxVolumeCm3) * 100 : 0;

      const centroid = {
        x: triangleCount > 0 ? sumCx / triangleCount : 0,
        y: triangleCount > 0 ? sumCy / triangleCount : 0,
        z: triangleCount > 0 ? sumCz / triangleCount : 0
      };

      const isWatertightEstimate = volumeCm3 > 0.001 && degenerateCount < (triangleCount * 0.05);
      const parseTimeMs = Math.round(performance.now() - startTime);

      const parsed: StlMeshStats = {
        fileName,
        fileSizeBytes,
        format,
        triangleCount,
        parseTimeMs,
        volumeCm3,
        surfaceAreaCm2,
        minX,
        maxX,
        minY,
        maxY,
        minZ,
        maxZ,
        dimX,
        dimY,
        dimZ,
        boundingBoxVolumeCm3,
        packingDensityPct,
        centroid,
        isWatertightEstimate,
        degenerateTriangles: degenerateCount,
        trianglesPreview: new Float32Array(previewTrianglesList)
      };

      setMeshStats(parsed);
      setParseError(null);
    } catch (err: any) {
      setParseError(err?.message || 'Failed to parse STL file. Ensure valid binary or ASCII STL.');
      setMeshStats(null);
    } finally {
      setIsParsing(false);
    }
  }, []);

  // File Upload Handler
  const handleFileUpload = (file: File) => {
    if (!file) return;
    setIsParsing(true);
    setParseError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      if (buffer) {
        parseSTLArrayBuffer(buffer, file.name, file.size);
      } else {
        setIsParsing(false);
        setParseError('Failed to read file content.');
      }
    };
    reader.onerror = () => {
      setIsParsing(false);
      setParseError('Error reading STL file from disk.');
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // --- Sample Models Generator ---
  const loadSampleModel = (type: 'cube' | 'cylinder' | 'polyhedron') => {
    setIsParsing(true);
    setTimeout(() => {
      let buffer: ArrayBuffer;
      let name = '';

      if (type === 'cube') {
        name = '20mm_Calibration_Cube.stl';
        const numTri = 12;
        buffer = new ArrayBuffer(84 + numTri * 50);
        const dv = new DataView(buffer);
        dv.setUint32(80, numTri, true);

        const faces = [
          // Bottom (Z = 0)
          [0,0,0, 20,0,0, 20,20,0], [0,0,0, 20,20,0, 0,20,0],
          // Top (Z = 20)
          [0,0,20, 20,20,20, 20,0,20], [0,0,20, 0,20,20, 20,20,20],
          // Front (Y = 0)
          [0,0,0, 20,0,20, 20,0,0], [0,0,0, 0,0,20, 20,0,20],
          // Back (Y = 20)
          [0,20,0, 20,20,0, 20,20,20], [0,20,0, 20,20,20, 0,20,20],
          // Left (X = 0)
          [0,0,0, 0,20,0, 0,20,20], [0,0,0, 0,20,20, 0,0,20],
          // Right (X = 20)
          [20,0,0, 20,20,20, 20,20,0], [20,0,0, 20,0,20, 20,20,20]
        ];

        let offset = 84;
        faces.forEach(f => {
          dv.setFloat32(offset + 12, f[0], true);
          dv.setFloat32(offset + 16, f[1], true);
          dv.setFloat32(offset + 20, f[2], true);
          dv.setFloat32(offset + 24, f[3], true);
          dv.setFloat32(offset + 28, f[4], true);
          dv.setFloat32(offset + 32, f[5], true);
          dv.setFloat32(offset + 36, f[6], true);
          dv.setFloat32(offset + 40, f[7], true);
          dv.setFloat32(offset + 44, f[8], true);
          offset += 50;
        });
      } else if (type === 'cylinder') {
        name = 'Precision_Cylinder_D20_H50.stl';
        const segments = 36;
        const numTri = segments * 4;
        buffer = new ArrayBuffer(84 + numTri * 50);
        const dv = new DataView(buffer);
        dv.setUint32(80, numTri, true);

        const r = 10;
        const h = 50;
        let offset = 84;

        for (let i = 0; i < segments; i++) {
          const theta1 = (i / segments) * 2 * Math.PI;
          const theta2 = ((i + 1) / segments) * 2 * Math.PI;
          const x1 = r * Math.cos(theta1), y1 = r * Math.sin(theta1);
          const x2 = r * Math.cos(theta2), y2 = r * Math.sin(theta2);

          // Top Fan
          dv.setFloat32(offset + 12, 0, true); dv.setFloat32(offset + 16, 0, true); dv.setFloat32(offset + 20, h, true);
          dv.setFloat32(offset + 24, x1, true); dv.setFloat32(offset + 28, y1, true); dv.setFloat32(offset + 32, h, true);
          dv.setFloat32(offset + 36, x2, true); dv.setFloat32(offset + 40, y2, true); dv.setFloat32(offset + 44, h, true);
          offset += 50;

          // Bottom Fan
          dv.setFloat32(offset + 12, 0, true); dv.setFloat32(offset + 16, 0, true); dv.setFloat32(offset + 20, 0, true);
          dv.setFloat32(offset + 24, x2, true); dv.setFloat32(offset + 28, y2, true); dv.setFloat32(offset + 32, 0, true);
          dv.setFloat32(offset + 36, x1, true); dv.setFloat32(offset + 40, y1, true); dv.setFloat32(offset + 44, 0, true);
          offset += 50;

          // Side Quad 1
          dv.setFloat32(offset + 12, x1, true); dv.setFloat32(offset + 16, y1, true); dv.setFloat32(offset + 20, 0, true);
          dv.setFloat32(offset + 24, x2, true); dv.setFloat32(offset + 28, y2, true); dv.setFloat32(offset + 32, 0, true);
          dv.setFloat32(offset + 36, x2, true); dv.setFloat32(offset + 40, y2, true); dv.setFloat32(offset + 44, h, true);
          offset += 50;

          // Side Quad 2
          dv.setFloat32(offset + 12, x1, true); dv.setFloat32(offset + 16, y1, true); dv.setFloat32(offset + 20, 0, true);
          dv.setFloat32(offset + 24, x2, true); dv.setFloat32(offset + 28, y2, true); dv.setFloat32(offset + 32, 0, true);
          dv.setFloat32(offset + 36, x1, true); dv.setFloat32(offset + 40, y1, true); dv.setFloat32(offset + 44, h, true);
          offset += 50;
        }
      } else {
        name = 'Diamond_Polyhedron_Gem.stl';
        const numTri = 24;
        buffer = new ArrayBuffer(84 + numTri * 50);
        const dv = new DataView(buffer);
        dv.setUint32(80, numTri, true);

        const rTop = 15, rMid = 25, zTop = 30, zMid = 18, zBot = 0;
        const segs = 8;
        let offset = 84;

        for (let i = 0; i < segs; i++) {
          const a1 = (i / segs) * 2 * Math.PI;
          const a2 = ((i + 1) / segs) * 2 * Math.PI;
          const xt1 = rTop * Math.cos(a1), yt1 = rTop * Math.sin(a1);
          const xt2 = rTop * Math.cos(a2), yt2 = rTop * Math.sin(a2);
          const xm1 = rMid * Math.cos(a1), ym1 = rMid * Math.sin(a1);
          const xm2 = rMid * Math.cos(a2), ym2 = rMid * Math.sin(a2);

          // Top crown
          dv.setFloat32(offset + 12, xt1, true); dv.setFloat32(offset + 16, yt1, true); dv.setFloat32(offset + 20, zTop, true);
          dv.setFloat32(offset + 24, xm1, true); dv.setFloat32(offset + 28, ym1, true); dv.setFloat32(offset + 32, zMid, true);
          dv.setFloat32(offset + 36, xm2, true); dv.setFloat32(offset + 40, ym2, true); dv.setFloat32(offset + 44, zMid, true);
          offset += 50;

          // Top quad
          dv.setFloat32(offset + 12, xt1, true); dv.setFloat32(offset + 16, yt1, true); dv.setFloat32(offset + 20, zTop, true);
          dv.setFloat32(offset + 24, xm2, true); dv.setFloat32(offset + 28, ym2, true); dv.setFloat32(offset + 32, zMid, true);
          dv.setFloat32(offset + 36, xt2, true); dv.setFloat32(offset + 40, yt2, true); dv.setFloat32(offset + 44, zTop, true);
          offset += 50;

          // Bottom Pavilion
          dv.setFloat32(offset + 12, 0, true); dv.setFloat32(offset + 16, 0, true); dv.setFloat32(offset + 20, zBot, true);
          dv.setFloat32(offset + 24, xm2, true); dv.setFloat32(offset + 28, ym2, true); dv.setFloat32(offset + 32, zMid, true);
          dv.setFloat32(offset + 36, xm1, true); dv.setFloat32(offset + 40, ym1, true); dv.setFloat32(offset + 44, zMid, true);
          offset += 50;
        }
      }

      parseSTLArrayBuffer(buffer, name, buffer.byteLength);
    }, 150);
  };

  // Load default cube on mount if none loaded
  useEffect(() => {
    if (!meshStats) {
      loadSampleModel('cube');
    }
  }, []);

  // --- Add to Multi-File Comparison List ---
  const handleAddToBatch = () => {
    if (!meshStats || !scaledStats) return;
    const newItem: BatchItem = {
      id: `${meshStats.fileName}-${Date.now()}`,
      fileName: meshStats.fileName,
      triangleCount: meshStats.triangleCount,
      dimX: scaledStats.dimX,
      dimY: scaledStats.dimY,
      dimZ: scaledStats.dimZ,
      solidVolumeCm3: scaledStats.solidVolumeCm3,
      effectiveWeightGrams: scaledStats.effectiveWeightGrams,
      cost: scaledStats.partMaterialCost
    };
    setBatchList(prev => [...prev, newItem]);
  };

  const handleRemoveFromBatch = (id: string) => {
    setBatchList(prev => prev.filter(item => item.id !== id));
  };

  const handleClearBatch = () => {
    setBatchList([]);
  };

  // --- 3D Canvas Rendering Engine ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Background subtle gradient
      const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, width * 0.7);
      bgGrad.addColorStop(0, 'rgba(30, 41, 59, 0.4)');
      bgGrad.addColorStop(1, 'rgba(15, 23, 42, 0.9)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      if (!meshStats || !meshStats.trianglesPreview || meshStats.trianglesPreview.length === 0) {
        ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No 3D Model Loaded', width / 2, height / 2);
        return;
      }

      // Model dimensions & centering
      const cx = meshStats.centroid.x;
      const cy = meshStats.centroid.y;
      const cz = meshStats.centroid.z;
      const maxDim = Math.max(meshStats.dimX, meshStats.dimY, meshStats.dimZ, 10);
      const viewScale = (Math.min(width, height) * 0.45 * cameraZoom) / maxDim;

      const pitch = cameraRot.pitch;
      const yaw = cameraRot.yaw;

      const cosP = Math.cos(pitch), sinP = Math.sin(pitch);
      const cosY = Math.cos(yaw), sinY = Math.sin(yaw);

      // 3D Transform Helper
      const projectPoint = (x: number, y: number, z: number) => {
        const dx = (x - cx);
        const dy = (y - cy);
        const dz = (z - cz);

        const x1 = dx * cosY - dy * sinY;
        const y1 = dx * sinY + dy * cosY;
        const z1 = dz;

        const x2 = x1;
        const y2 = y1 * cosP - z1 * sinP;
        const z2 = y1 * sinP + z1 * cosP;

        const sx = width / 2 + x2 * viewScale;
        const sy = height / 2 - z2 * viewScale - y2 * viewScale * 0.3;
        return { x: sx, y: sy, depth: y2 };
      };

      // --- Draw Build Plate Grid ---
      if (showBedGrid) {
        const bedZ = meshStats.minZ;
        const gridSize = Math.max(100, Math.ceil(maxDim / 20) * 20 + 40);
        const step = 20;

        ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
        ctx.lineWidth = 1;

        for (let gx = -gridSize / 2; gx <= gridSize / 2; gx += step) {
          const pStart = projectPoint(cx + gx, cy - gridSize / 2, bedZ);
          const pEnd = projectPoint(cx + gx, cy + gridSize / 2, bedZ);
          ctx.beginPath();
          ctx.moveTo(pStart.x, pStart.y);
          ctx.lineTo(pEnd.x, pEnd.y);
          ctx.stroke();
        }
        for (let gy = -gridSize / 2; gy <= gridSize / 2; gy += step) {
          const pStart = projectPoint(cx - gridSize / 2, cy + gy, bedZ);
          const pEnd = projectPoint(cx + gridSize / 2, cy + gy, bedZ);
          ctx.beginPath();
          ctx.moveTo(pStart.x, pStart.y);
          ctx.lineTo(pEnd.x, pEnd.y);
          ctx.stroke();
        }

        const pOrig = projectPoint(cx, cy, bedZ);
        ctx.fillStyle = 'rgba(99, 102, 241, 0.6)';
        ctx.beginPath();
        ctx.arc(pOrig.x, pOrig.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- Draw 3D Triangles ---
      const tris = meshStats.trianglesPreview;
      const triCount = Math.floor(tris.length / 9);

      interface RenderableTri {
        p1: { x: number; y: number; depth: number };
        p2: { x: number; y: number; depth: number };
        p3: { x: number; y: number; depth: number };
        avgDepth: number;
        lightIntensity: number;
      }

      const renderList: RenderableTri[] = [];
      const lightDir = { x: 0.577, y: -0.577, z: 0.577 };

      for (let i = 0; i < triCount; i++) {
        const idx = i * 9;
        const x1 = tris[idx], y1 = tris[idx + 1], z1 = tris[idx + 2];
        const x2 = tris[idx + 3], y2 = tris[idx + 4], z2 = tris[idx + 5];
        const x3 = tris[idx + 6], y3 = tris[idx + 7], z3 = tris[idx + 8];

        const ax = x2 - x1, ay = y2 - y1, az = z2 - z1;
        const bx = x3 - x1, by = y3 - y1, bz = z3 - z1;
        let nx = ay * bz - az * by;
        let ny = az * bx - ax * bz;
        let nz = ax * by - ay * bx;
        const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
        if (len > 0) {
          nx /= len; ny /= len; nz /= len;
        }

        const dot = nx * lightDir.x + ny * lightDir.y + nz * lightDir.z;
        const light = Math.max(0.2, Math.min(1.0, 0.4 + 0.6 * dot));

        const p1 = projectPoint(x1, y1, z1);
        const p2 = projectPoint(x2, y2, z2);
        const p3 = projectPoint(x3, y3, z3);
        const avgDepth = (p1.depth + p2.depth + p3.depth) / 3.0;

        renderList.push({ p1, p2, p3, avgDepth, lightIntensity: light });
      }

      renderList.sort((a, b) => b.avgDepth - a.avgDepth);

      const theme = COLOR_THEMES.find(t => t.id === selectedTheme) || COLOR_THEMES[0];

      renderList.forEach(tri => {
        ctx.beginPath();
        ctx.moveTo(tri.p1.x, tri.p1.y);
        ctx.lineTo(tri.p2.x, tri.p2.y);
        ctx.lineTo(tri.p3.x, tri.p3.y);
        ctx.closePath();

        if (renderMode === 'solid' || renderMode === 'both') {
          const alpha = 0.9;
          const brightness = tri.lightIntensity;
          ctx.fillStyle = `rgba(${Math.round(99 * brightness)}, ${Math.round(102 * brightness + 100 * (1 - brightness))}, ${Math.round(241 * brightness)}, ${alpha})`;
          if (selectedTheme === 'emerald') {
            ctx.fillStyle = `rgba(${Math.round(16 * brightness)}, ${Math.round(185 * brightness)}, ${Math.round(129 * brightness)}, ${alpha})`;
          } else if (selectedTheme === 'amber') {
            ctx.fillStyle = `rgba(${Math.round(249 * brightness)}, ${Math.round(115 * brightness)}, ${Math.round(22 * brightness)}, ${alpha})`;
          } else if (selectedTheme === 'cyan') {
            ctx.fillStyle = `rgba(${Math.round(6 * brightness)}, ${Math.round(182 * brightness)}, ${Math.round(212 * brightness)}, ${alpha})`;
          } else if (selectedTheme === 'rose') {
            ctx.fillStyle = `rgba(${Math.round(244 * brightness)}, ${Math.round(63 * brightness)}, ${Math.round(94 * brightness)}, ${alpha})`;
          } else if (selectedTheme === 'slate') {
            ctx.fillStyle = `rgba(${Math.round(148 * brightness)}, ${Math.round(163 * brightness)}, ${Math.round(184 * brightness)}, ${alpha})`;
          }
          ctx.fill();
        }

        if (renderMode === 'wireframe' || renderMode === 'both') {
          ctx.strokeStyle = renderMode === 'both' ? 'rgba(255, 255, 255, 0.12)' : theme.lightHex;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      });

      // --- Draw 3D Bounding Box Outline ---
      if (showBoundingBox) {
        const { minX, maxX, minY, maxY, minZ, maxZ } = meshStats;
        const bPts = [
          projectPoint(minX, minY, minZ), // 0
          projectPoint(maxX, minY, minZ), // 1
          projectPoint(maxX, maxY, minZ), // 2
          projectPoint(minX, maxY, minZ), // 3
          projectPoint(minX, minY, maxZ), // 4
          projectPoint(maxX, minY, maxZ), // 5
          projectPoint(maxX, maxY, maxZ), // 6
          projectPoint(minX, maxY, maxZ), // 7
        ];

        ctx.strokeStyle = 'rgba(234, 179, 8, 0.7)'; // Amber
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 4]);

        const edges = [
          [0,1], [1,2], [2,3], [3,0], // Bottom
          [4,5], [5,6], [6,7], [7,4], // Top
          [0,4], [1,5], [2,6], [3,7]  // Verticals
        ];

        edges.forEach(([u, v]) => {
          ctx.beginPath();
          ctx.moveTo(bPts[u].x, bPts[u].y);
          ctx.lineTo(bPts[v].x, bPts[v].y);
          ctx.stroke();
        });

        ctx.setLineDash([]);
      }

      if (autoRotate) {
        setCameraRot(prev => ({
          ...prev,
          yaw: prev.yaw + 0.008
        }));
      }
    };

    render();

    if (autoRotate) {
      animFrameId = requestAnimationFrame(render);
    }

    return () => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
  }, [meshStats, cameraRot, cameraZoom, renderMode, showBoundingBox, showBedGrid, autoRotate, selectedTheme]);

  // Mouse / Touch Interaction for 3D Viewport
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    setCameraRot(prev => ({
      yaw: prev.yaw + dx * 0.01,
      pitch: Math.max(-1.5, Math.min(1.5, prev.pitch - dy * 0.01))
    }));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
    setCameraZoom(prev => Math.max(0.3, Math.min(4.0, prev * zoomDelta)));
  };

  const resetCamera = () => {
    setCameraRot({ pitch: 0.45, yaw: -0.65 });
    setCameraZoom(1.0);
  };

  // --- Copy Formatted Results ---
  const handleCopyResults = () => {
    if (!meshStats || !scaledStats) return;
    const lines = [
      `=== Toolique STL Volume & Mass Summary ===`,
      `File Name: ${meshStats.fileName}`,
      `Triangles: ${meshStats.triangleCount.toLocaleString()}`,
      `Format: ${meshStats.format}`,
      `Scale: ${scaleMultiplierPct}%`,
      `Bounding Box: ${scaledStats.dimX.toFixed(1)} × ${scaledStats.dimY.toFixed(1)} × ${scaledStats.dimZ.toFixed(1)} mm`,
      `Solid Volume: ${scaledStats.solidVolumeCm3.toFixed(2)} cm³ (${scaledStats.volumeMm3.toFixed(0)} mm³ / ${scaledStats.volumeIn3.toFixed(2)} in³)`,
      `Surface Area: ${scaledStats.surfaceAreaCm2.toFixed(1)} cm²`,
      `Material: ${activeMaterial.name} (${effectiveDensity} g/cm³)`,
      `Infill Mode: ${isInfillMode ? `${infillPct}% Infill (${wallCount} walls)` : '100% Solid'}`,
      `Effective Printed Volume: ${scaledStats.effectiveVolumeCm3.toFixed(2)} cm³`,
      `Effective Weight: ${scaledStats.effectiveWeightGrams.toFixed(1)} g (${scaledStats.weightOz.toFixed(2)} oz)`,
      `Weight with Waste (${wasteFactorPct}%): ${scaledStats.totalWeightWithWasteGrams.toFixed(1)} g`,
      `Unit Material Cost: ${curObj.symbol}${scaledStats.partMaterialCost.toFixed(2)}`,
      `Parts per ${spoolWeightGrams}g Spool: ${scaledStats.partsPerSpool} units`,
      `Batch (${batchQuantity} pcs) Total: ${curObj.symbol}${scaledStats.batchMaterialCost.toFixed(2)} (${scaledStats.totalBatchWeightKg.toFixed(2)} kg / ${scaledStats.spoolsRequired} spools)`
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- Export Technical PDF Report ---
  const handleExportPDF = () => {
    if (!meshStats || !scaledStats) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header Banner
    doc.setFillColor(79, 70, 229); // Indigo 600
    doc.rect(0, 0, pageWidth, 24, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('STL VOLUME & 3D PRINT SPECIFICATION REPORT', 14, 15);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString()} | Toolique 3D Engine`, pageWidth - 14, 15, { align: 'right' });

    // Section 1: File & Mesh Metadata
    let y = 34;
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('1. 3D Model & Mesh Integrity', 14, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`File Name: ${meshStats.fileName}`, 14, y);
    doc.text(`Format: ${meshStats.format}`, 110, y);
    y += 5;
    doc.text(`Triangle Count: ${meshStats.triangleCount.toLocaleString()}`, 14, y);
    doc.text(`Watertight Estimate: ${meshStats.isWatertightEstimate ? 'Valid Manifold' : 'Potential Non-Manifold'}`, 110, y);
    y += 5;
    doc.text(`Parse Benchmark: ${meshStats.parseTimeMs} ms`, 14, y);
    doc.text(`Degenerate Facets: ${meshStats.degenerateTriangles}`, 110, y);
    y += 8;

    // Section 2: Dimensions & Geometry
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('2. Geometric Dimensions & Volume', 14, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Bounding Box (X × Y × Z): ${scaledStats.dimX.toFixed(1)} × ${scaledStats.dimY.toFixed(1)} × ${scaledStats.dimZ.toFixed(1)} mm`, 14, y);
    doc.text(`Bounding Box Volume: ${scaledStats.bbVolCm3.toFixed(2)} cm³`, 110, y);
    y += 5;
    doc.text(`Solid Mesh Volume: ${scaledStats.solidVolumeCm3.toFixed(2)} cm³ (${scaledStats.volumeMm3.toFixed(0)} mm³)`, 14, y);
    doc.text(`Packing Density: ${scaledStats.packingDensityPct.toFixed(1)}% of bounding box`, 110, y);
    y += 5;
    doc.text(`Total Surface Area: ${scaledStats.surfaceAreaCm2.toFixed(1)} cm²`, 14, y);
    doc.text(`Scale Multiplier: ${scaleMultiplierPct}%`, 110, y);
    y += 8;

    // Section 3: Material & Slicing Infill Breakdown
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('3. Material & Slicing Infill Breakdown', 14, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Material: ${activeMaterial.name}`, 14, y);
    doc.text(`Density: ${effectiveDensity} g/cm³`, 110, y);
    y += 5;
    doc.text(`Slicing Mode: ${isInfillMode ? `Sparse Infill (${infillPct}%)` : '100% Solid Mass'}`, 14, y);
    doc.text(`Wall Perimeters: ${wallCount} walls (${(nozzleDiameterMm * wallCount).toFixed(1)} mm)`, 110, y);
    y += 5;
    doc.text(`Effective Printed Volume: ${scaledStats.effectiveVolumeCm3.toFixed(2)} cm³`, 14, y);
    doc.text(`Net Part Mass: ${scaledStats.effectiveWeightGrams.toFixed(1)} grams (${scaledStats.weightOz.toFixed(2)} oz)`, 110, y);
    y += 5;
    doc.text(`Gross Mass (+${wasteFactorPct}% waste/purge): ${scaledStats.totalWeightWithWasteGrams.toFixed(1)} grams`, 14, y);
    doc.text(`Yield per ${spoolWeightGrams}g Spool: ${scaledStats.partsPerSpool} parts`, 110, y);
    y += 8;

    // Section 4: Commercial Production & Cost Summary
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('4. Production & Filament Costing', 14, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Spool Price: ${curObj.symbol}${spoolCost.toFixed(2)} / ${spoolWeightGrams}g spool`, 14, y);
    doc.text(`Unit Material Cost: ${curObj.symbol}${scaledStats.partMaterialCost.toFixed(2)}`, 110, y);
    y += 5;
    doc.text(`Batch Quantity: ${batchQuantity} units`, 14, y);
    doc.text(`Total Batch Filament Mass: ${scaledStats.totalBatchWeightKg.toFixed(2)} kg`, 110, y);
    y += 5;
    doc.text(`Spools Required: ${scaledStats.spoolsRequired} roll(s)`, 14, y);
    doc.text(`Total Batch Raw Material Cost: ${curObj.symbol}${scaledStats.batchMaterialCost.toFixed(2)}`, 110, y);
    y += 12;

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Processed 100% client-side in Toolique 3D Engine. No files uploaded to external servers.', 14, 285);

    doc.save(`${meshStats.fileName.replace('.stl', '')}_Volume_Report.pdf`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-left">
      
      {/* Top Bar: Currency & Quick Sample Models */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 mr-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Quick Samples:
          </span>
          <button
            onClick={() => loadSampleModel('cube')}
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700 hover:border-indigo-500 transition-colors cursor-pointer"
          >
            20mm Cube
          </button>
          <button
            onClick={() => loadSampleModel('cylinder')}
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700 hover:border-indigo-500 transition-colors cursor-pointer"
          >
            Cylinder (D20×H50)
          </button>
          <button
            onClick={() => loadSampleModel('polyhedron')}
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700 hover:border-indigo-500 transition-colors cursor-pointer"
          >
            Polyhedral Gem
          </button>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Currency:</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            aria-label="Currency"
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Upload & 3D Viewport on Left, Parameters & Outputs on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: File Dropzone & 3D Interactive Canvas (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`p-6 rounded-2xl border-2 border-dashed transition-all text-center ${
              dragActive 
                ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20' 
                : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:border-indigo-400'
            }`}
          >
            <input
              type="file"
              accept=".stl"
              id="stl-file-input"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
              className="hidden"
            />
            <label htmlFor="stl-file-input" className="cursor-pointer block space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Drop your STL file here or <span className="text-indigo-600 dark:text-indigo-400 underline">browse</span>
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Supports Binary STL & ASCII STL • 100% Client-Side In-Browser Processing
                </p>
              </div>
            </label>

            {isParsing && (
              <div className="mt-3 flex items-center justify-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Parsing 3D Mesh & Calculating Tetrahedrons...
              </div>
            )}

            {parseError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{parseError}</span>
              </div>
            )}
          </div>

          {/* Interactive 3D Canvas Viewport */}
          <div className="saas-card p-4 space-y-3 relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-200/60 dark:border-zinc-800/60">
              <div className="flex items-center gap-2">
                <Rotate3d className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                  Interactive 3D Viewport
                </h3>
              </div>

              {/* Viewport Action Badges */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setRenderMode(prev => prev === 'solid' ? 'wireframe' : prev === 'wireframe' ? 'both' : 'solid')}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  title="Toggle Mesh Render Mode"
                >
                  {renderMode === 'solid' ? 'Solid' : renderMode === 'wireframe' ? 'Wireframe' : 'Solid + Wire'}
                </button>
                <button
                  onClick={() => setShowBoundingBox(!showBoundingBox)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                    showBoundingBox 
                      ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30' 
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                  }`}
                  title="Toggle Bounding Box"
                >
                  Bounds
                </button>
                <button
                  onClick={() => setShowBedGrid(!showBedGrid)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                    showBedGrid 
                      ? 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30' 
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                  }`}
                  title="Toggle Build Plate Grid"
                >
                  Bed Grid
                </button>
                <button
                  onClick={() => setAutoRotate(!autoRotate)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                    autoRotate 
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' 
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                  }`}
                  title="Toggle Orbit Auto-Rotation"
                >
                  Auto-Rotate
                </button>
                <button
                  onClick={resetCamera}
                  className="p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  title="Reset Camera View"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Canvas Container */}
            <div className="relative rounded-xl overflow-hidden border border-zinc-200/60 dark:border-zinc-800/80">
              <canvas
                ref={canvasRef}
                width={640}
                height={380}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                className="w-full h-[320px] md:h-[380px] cursor-grab active:cursor-grabbing block"
              />

              {/* Viewport Overlay Controls / Theme Selector */}
              <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/10">
                <span className="text-[10px] text-zinc-400 font-bold mr-1">Theme:</span>
                {COLOR_THEMES.map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`w-3.5 h-3.5 rounded-full border transition-transform ${
                      selectedTheme === theme.id ? 'scale-125 border-white' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: theme.hex }}
                    title={theme.name}
                  />
                ))}
              </div>

              {/* Viewport Info Overlay */}
              {meshStats && (
                <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-white text-[10px] space-y-0.5 pointer-events-none">
                  <div className="font-bold text-zinc-200">{meshStats.fileName}</div>
                  <div className="text-zinc-400">{meshStats.triangleCount.toLocaleString()} Triangles • {meshStats.format}</div>
                </div>
              )}
            </div>

            {/* Mesh Integrity Bar */}
            {meshStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 text-center">
                <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50">
                  <span className="text-[10px] text-zinc-400 font-bold block uppercase">Triangles</span>
                  <span className="text-xs font-extrabold text-zinc-900 dark:text-white">
                    {meshStats.triangleCount.toLocaleString()}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50">
                  <span className="text-[10px] text-zinc-400 font-bold block uppercase">Surface Area</span>
                  <span className="text-xs font-extrabold text-zinc-900 dark:text-white">
                    {scaledStats ? scaledStats.surfaceAreaCm2.toFixed(1) : 0} cm²
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50">
                  <span className="text-[10px] text-zinc-400 font-bold block uppercase">Mesh Health</span>
                  <span className={`text-xs font-extrabold ${meshStats.isWatertightEstimate ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {meshStats.isWatertightEstimate ? 'Watertight' : 'Check Manifold'}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50">
                  <span className="text-[10px] text-zinc-400 font-bold block uppercase">Parse Time</span>
                  <span className="text-xs font-extrabold text-zinc-900 dark:text-white">
                    {meshStats.parseTimeMs} ms
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Material, Infill, Scale & Comprehensive Calculations (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Material & Density Selector */}
          <div className="saas-card p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
              <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                1. Material & Density
              </h3>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Material Preset</label>
                <select
                  value={selectedMaterialId}
                  onChange={(e) => setSelectedMaterialId(e.target.value)}
                  className="saas-input text-xs font-bold cursor-pointer"
                >
                  <optgroup label="FDM Thermoplastics">
                    {MATERIAL_PRESETS.filter(m => m.category === 'FDM').map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.density} g/cm³)</option>
                    ))}
                  </optgroup>
                  <optgroup label="Resin / SLA Photopolymers">
                    {MATERIAL_PRESETS.filter(m => m.category === 'Resin').map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.density} g/cm³)</option>
                    ))}
                  </optgroup>
                  <optgroup label="Metals & Casting Alloys">
                    {MATERIAL_PRESETS.filter(m => m.category === 'Metal & Casting').map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.density} g/cm³)</option>
                    ))}
                  </optgroup>
                  <optgroup label="Custom">
                    <option value="custom">Custom Density (User Defined)</option>
                  </optgroup>
                </select>
              </div>

              {selectedMaterialId === 'custom' && (
                <div className="space-y-1.5 p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-900/40">
                  <label className="text-xs font-bold text-indigo-900 dark:text-indigo-300">Custom Density (g/cm³)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    max="30"
                    value={customDensity}
                    onChange={(e) => setCustomDensity(Number(e.target.value))}
                    className="saas-input text-xs font-bold"
                  />
                </div>
              )}

              {/* Material Info Banner */}
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/50 text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {activeMaterial.description}
              </div>
            </div>
          </div>

          {/* Slicing Infill & Shell Parameters */}
          <div className="saas-card p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  2. Slicing & Infill Model
                </h3>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsInfillMode(false)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                    !isInfillMode 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  100% Solid
                </button>
                <button
                  onClick={() => setIsInfillMode(true)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                    isInfillMode 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  Sparse Infill
                </button>
              </div>
            </div>

            {isInfillMode && (
              <div className="space-y-3.5">
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    <span>Internal Infill Density:</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{infillPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={infillPct}
                    onChange={(e) => setInfillPct(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400 font-semibold px-0.5">
                    <span>0% (Hollow)</span>
                    <span>15%</span>
                    <span>30%</span>
                    <span>50%</span>
                    <span>100% (Solid)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400">Wall Shells</label>
                    <select
                      value={wallCount}
                      onChange={(e) => setWallCount(Number(e.target.value))}
                      className="saas-input text-xs font-bold cursor-pointer"
                    >
                      <option value={1}>1 Wall (0.4mm)</option>
                      <option value={2}>2 Walls (0.8mm)</option>
                      <option value={3}>3 Walls (1.2mm)</option>
                      <option value={4}>4 Walls (1.6mm)</option>
                      <option value={5}>5 Walls (2.0mm)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400">Purge / Waste Margin</label>
                    <select
                      value={wasteFactorPct}
                      onChange={(e) => setWasteFactorPct(Number(e.target.value))}
                      className="saas-input text-xs font-bold cursor-pointer"
                    >
                      <option value={0}>0% (Exact)</option>
                      <option value={5}>+5% (Standard)</option>
                      <option value={10}>+10% (Brim / Supports)</option>
                      <option value={15}>+15% (Heavy Purge)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Model Scaling Tool */}
          <div className="saas-card p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  3. Uniform Model Scaling
                </h3>
              </div>
              <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                {scaleMultiplierPct}%
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="1000"
                  step="1"
                  value={uniformScaleInput}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setUniformScaleInput(val);
                    setScaleMultiplierPct(val > 0 ? val : 100);
                  }}
                  className="saas-input text-xs font-bold"
                />
                <span className="text-xs font-bold text-zinc-500">%</span>
                <button
                  onClick={() => { setUniformScaleInput(100); setScaleMultiplierPct(100); }}
                  className="px-3 py-2 text-xs font-bold rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 transition-colors cursor-pointer"
                >
                  Reset
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[50, 75, 100, 125, 150, 200].map(s => (
                  <button
                    key={s}
                    onClick={() => { setUniformScaleInput(s); setScaleMultiplierPct(s); }}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                      scaleMultiplierPct === s
                        ? 'bg-indigo-600 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                    }`}
                  >
                    {s}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Filament Spool Cost & Batch Production */}
          <div className="saas-card p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
              <DollarSign className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                4. Spool Cost & Batch Run
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400">Spool Price ({curObj.symbol})</label>
                <input
                  type="number"
                  min="0"
                  value={spoolCost}
                  onChange={(e) => setSpoolCost(Number(e.target.value))}
                  className="saas-input text-xs font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400">Spool Net Weight</label>
                <select
                  value={spoolWeightGrams}
                  onChange={(e) => setSpoolWeightGrams(Number(e.target.value))}
                  className="saas-input text-xs font-bold cursor-pointer"
                >
                  <option value={250}>250g (Sample)</option>
                  <option value={500}>500g (Mini Roll)</option>
                  <option value={1000}>1,000g (1 kg Standard)</option>
                  <option value={2500}>2,500g (2.5 kg Farm)</option>
                  <option value={5000}>5,000g (5 kg Bulk)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400">Batch Quantity (Parts to produce)</label>
              <input
                type="number"
                min="1"
                max="10000"
                value={batchQuantity}
                onChange={(e) => setBatchQuantity(Math.max(1, Number(e.target.value)))}
                className="saas-input text-xs font-bold"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Primary Results Section: 4 High-Impact KPI Cards */}
      {scaledStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Volume */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 saas-card">
            <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Cubic Volume</span>
              <Box className="w-5 h-5" />
            </div>
            <div className="text-2xl font-black text-zinc-900 dark:text-white">
              {scaledStats.effectiveVolumeCm3.toFixed(2)} <span className="text-sm font-semibold text-zinc-500">cm³</span>
            </div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
              {scaledStats.volumeMm3.toFixed(0)} mm³ • {scaledStats.volumeIn3.toFixed(2)} in³
            </div>
            {isInfillMode && (
              <div className="mt-2 text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                Solid Mesh: {scaledStats.solidVolumeCm3.toFixed(2)} cm³
              </div>
            )}
          </div>

          {/* Card 2: Net Mass Weight */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 saas-card">
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Net Part Mass</span>
              <Scale className="w-5 h-5" />
            </div>
            <div className="text-2xl font-black text-zinc-900 dark:text-white">
              {scaledStats.effectiveWeightGrams.toFixed(1)} <span className="text-sm font-semibold text-zinc-500">grams</span>
            </div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
              {scaledStats.weightOz.toFixed(2)} oz • {scaledStats.weightLbs.toFixed(3)} lbs
            </div>
            <div className="mt-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              Gross (+{wasteFactorPct}%): {scaledStats.totalWeightWithWasteGrams.toFixed(1)} g
            </div>
          </div>

          {/* Card 3: Unit Filament Cost */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 saas-card">
            <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Unit Material Cost</span>
              <DollarSign className="w-5 h-5" />
            </div>
            <div className="text-2xl font-black text-zinc-900 dark:text-white">
              {curObj.symbol}{scaledStats.partMaterialCost.toFixed(2)}
            </div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
              Yield: <strong className="text-zinc-800 dark:text-zinc-200">{scaledStats.partsPerSpool}</strong> parts / {spoolWeightGrams}g spool
            </div>
            <div className="mt-2 text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
              Raw plastic cost only
            </div>
          </div>

          {/* Card 4: Bounding Box Dimensions */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 saas-card">
            <div className="flex items-center justify-between text-purple-600 dark:text-purple-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Slicer Envelope</span>
              <Maximize2 className="w-5 h-5" />
            </div>
            <div className="text-lg font-black text-zinc-900 dark:text-white leading-tight">
              {scaledStats.dimX.toFixed(1)} × {scaledStats.dimY.toFixed(1)} × {scaledStats.dimZ.toFixed(1)}
              <span className="text-xs font-semibold text-zinc-500 ml-1">mm</span>
            </div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
              {(scaledStats.dimX / 25.4).toFixed(2)}″ × {(scaledStats.dimY / 25.4).toFixed(2)}″ × {(scaledStats.dimZ / 25.4).toFixed(2)}″
            </div>
            <div className="mt-2 text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
              Bounding Vol: {scaledStats.bbVolCm3.toFixed(1)} cm³ ({scaledStats.packingDensityPct.toFixed(0)}% fill)
            </div>
          </div>
        </div>
      )}

      {/* Batch Run & Multi-Item Actions */}
      {scaledStats && (
        <div className="p-5 rounded-2xl saas-card bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Batch Production Forecast ({batchQuantity} units)
            </h4>
            <div className="text-sm font-extrabold text-zinc-900 dark:text-white flex flex-wrap items-center gap-3">
              <span>Total Cost: <span className="text-indigo-600 dark:text-indigo-400">{curObj.symbol}{scaledStats.batchMaterialCost.toFixed(2)}</span></span>
              <span>•</span>
              <span>Filament Needed: <span className="text-emerald-600 dark:text-emerald-400">{scaledStats.totalBatchWeightKg.toFixed(2)} kg</span></span>
              <span>•</span>
              <span>Spools: <span className="text-amber-600 dark:text-amber-400">{scaledStats.spoolsRequired} roll(s)</span></span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleAddToBatch}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-500 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Package className="w-3.5 h-3.5 text-indigo-500" />
              Add to Batch List
            </button>
            <button
              onClick={handleCopyResults}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-500 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-indigo-500" />}
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download Spec Sheet (PDF)
            </button>
          </div>
        </div>
      )}

      {/* Multi-File Comparison Table (if items added) */}
      {batchList.length > 0 && (
        <div className="saas-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                Multi-Model Comparison Queue ({batchList.length} Items)
              </h3>
            </div>
            <button
              onClick={handleClearBatch}
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              Clear All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold uppercase text-[10px]">
                  <th className="pb-2">Model Name</th>
                  <th className="pb-2">Triangles</th>
                  <th className="pb-2">Dimensions (mm)</th>
                  <th className="pb-2">Solid Vol (cm³)</th>
                  <th className="pb-2">Print Mass (g)</th>
                  <th className="pb-2">Est. Cost</th>
                  <th className="pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {batchList.map(item => (
                  <tr key={item.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                    <td className="py-2.5 font-bold text-zinc-900 dark:text-white max-w-[160px] truncate">{item.fileName}</td>
                    <td className="py-2.5 text-zinc-500">{item.triangleCount.toLocaleString()}</td>
                    <td className="py-2.5 text-zinc-600 dark:text-zinc-300 font-mono text-[11px]">{item.dimX.toFixed(1)}×{item.dimY.toFixed(1)}×{item.dimZ.toFixed(1)}</td>
                    <td className="py-2.5 font-bold text-zinc-800 dark:text-zinc-200">{item.solidVolumeCm3.toFixed(2)}</td>
                    <td className="py-2.5 font-bold text-emerald-600 dark:text-emerald-400">{item.effectiveWeightGrams.toFixed(1)}g</td>
                    <td className="py-2.5 font-bold text-indigo-600 dark:text-indigo-400">{curObj.symbol}{item.cost.toFixed(2)}</td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => handleRemoveFromBatch(item.id)}
                        className="text-zinc-400 hover:text-rose-500 p-1"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Privacy Notice Banner */}
      <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200/50 dark:border-zinc-800/50 flex items-start gap-3">
        <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
        <span className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          <strong>100% Client-Side Private Processing:</strong> Your STL 3D models and geometry coordinates are parsed strictly inside your local browser memory using JavaScript ArrayBuffers. No CAD files or designs are ever transmitted to any external server.
        </span>
      </div>
    </div>
  );
}

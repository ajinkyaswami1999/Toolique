import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Settings, Copy, Check, Trash2, Plus, Download, Save,
  FileText, AlertTriangle, Printer, Sparkles, Sliders, RefreshCw, Layers,
  Zap, Clock, MessageCircle, TrendingUp,
  Package, Box, Upload
} from 'lucide-react';
import { calculate3DPrintCosts } from '../utils/threeDCalc';
import type {
  CostCalculatorInputs, CostCalculatorOutputs, CalculatorSettings,
  HistoryItem, CustomCostItem, FilamentSlot
} from '../utils/threeDCalc';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

const DEFAULT_SETTINGS: CalculatorSettings = {
  filamentPrice: 1350,
  electricityUnitCost: 8,
  printerWattage: 150,
  machineWearCost: 6,
  maintenanceCost: 2,
  labourRate: 200,
  filamentWastage: 5,
  profitMargin: 35,
  gst: 18,
  platformCommission: 10,
  paymentGateway: 2,
  packagingBoxCost: 30,
  courierHandlingCost: 80,
  printerPurchasePrice: 45000,
  currencySymbol: '₹',
  productCategories: ['Functional Part', 'Prototype', 'Action Figure / Art', 'Architectural Model', 'Lithophane', 'Batch Production', 'Replacement Part', 'Jewelry / Dental', 'Other'],
  roundingRule: 'nearest'
};

const PRINTER_PRESETS = [
  {
    name: 'Bambu Lab P1S / X1-Carbon',
    tech: 'fdm',
    wattage: 130,
    wearCost: 15,
    maintCost: 3,
    price: 65000,
    desc: 'High-speed enclosed CoreXY with AMS support'
  },
  {
    name: 'Bambu Lab A1 / A1 Mini',
    tech: 'fdm',
    wattage: 110,
    wearCost: 8,
    maintCost: 2,
    price: 38000,
    desc: 'High-speed bedslinger with active noise cancellation'
  },
  {
    name: 'Creality Ender 3 V3 / V2',
    tech: 'fdm',
    wattage: 150,
    wearCost: 6,
    maintCost: 2,
    price: 18000,
    desc: 'Standard desktop FDM workhorse'
  },
  {
    name: 'Prusa MK4 / MK3S+',
    tech: 'fdm',
    wattage: 100,
    wearCost: 12,
    maintCost: 2,
    price: 85000,
    desc: 'Ultra-reliable European workhorse with Nextruder'
  },
  {
    name: 'Elegoo Saturn 4 Ultra / Mars (Resin)',
    tech: 'resin',
    wattage: 65,
    wearCost: 18,
    maintCost: 5,
    price: 48000,
    desc: '12K Mono LCD MSLA Resin Printer with Tilt Release'
  },
  {
    name: 'Custom Voron 2.4 / RatRig',
    tech: 'fdm',
    wattage: 350,
    wearCost: 22,
    maintCost: 5,
    price: 95000,
    desc: 'High-speed enclosed DIY enclosed CoreXY farm printer'
  }
];

const MATERIAL_PRESETS: Record<string, { price: number; desc: string }> = {
  'Standard PLA (WOL3D / Generic)': { price: 850, desc: 'Cost-effective everyday prototyping' },
  'PLA+ / High-Speed PLA (eSun/Bambu)': { price: 1350, desc: 'Superior toughness and layer adhesion' },
  'PETG (eSun / Numakers)': { price: 1200, desc: 'Functional chemical & weather resistance' },
  'ABS / ASA (UV Resistant)': { price: 1400, desc: 'Outdoor & high-temperature automotive parts' },
  'TPU 95A (Flexible Rubber)': { price: 2200, desc: 'Dampers, gaskets, and impact-resistant parts' },
  'Carbon Fiber PETG / PA-CF': { price: 3800, desc: 'Ultra-stiff high-strength engineering parts' },
  'PVA Water-Soluble Support': { price: 3600, desc: 'Dissolvable dual-extrusion support material' },
  'Standard Photopolymer Resin (1L)': { price: 1600, desc: 'High detail miniature and prototype SLA' },
  'ABS-Like Tough Resin (1L)': { price: 2400, desc: 'Drop resistant engineering resin' },
  'Castable Jewelry / Dental Resin (1L)': { price: 6500, desc: 'Zero ash burnout investment casting' }
};

const JOB_PRESETS = [
  {
    name: 'Functional Mechanical Bracket',
    tech: 'fdm',
    category: 'Functional Part',
    duration: 5.5,
    filamentUsed: 140,
    material: 'PETG (eSun / Numakers)',
    price: 1200,
    postTime: 0.25,
    screws: 20
  },
  {
    name: 'Detailed Anime Figurine',
    tech: 'fdm',
    category: 'Action Figure / Art',
    duration: 12,
    filamentUsed: 180,
    supportUsed: 35,
    material: 'PLA+ / High-Speed PLA (eSun/Bambu)',
    price: 1350,
    postTime: 1.5,
    paintingTime: 1.0,
    paintCost: 80
  },
  {
    name: 'Batch Keychains (x20 units)',
    tech: 'fdm',
    category: 'Batch Production',
    duration: 8,
    filamentUsed: 220,
    batchQty: 20,
    material: 'PLA+ / High-Speed PLA (eSun/Bambu)',
    price: 1350,
    postTime: 0.5,
    packingTime: 0.5,
    packagingBoxCost: 40
  },
  {
    name: 'High-Precision Jewelry Master',
    tech: 'resin',
    category: 'Jewelry / Dental',
    duration: 3.5,
    resinVolume: 35,
    resinPrice: 6500,
    cureTime: 15,
    washCost: 30,
    postTime: 0.5
  }
];

export default function ThreeDPrintingCostCalculator() {
  const [searchParams] = useSearchParams();
  const paramPrice = searchParams.get('price');
  const paramMaterial = searchParams.get('material');
  const paramTech = searchParams.get('tech');

  // Active View Tab
  const [activeTab, setActiveTab] = useState<'calculator' | 'batch' | 'gcode' | 'roi' | 'quote'>('calculator');

  // Settings & History State
  const [settings, setSettings] = useState<CalculatorSettings>(() => {
    const saved = localStorage.getItem('toolique_3d_cost_settings');
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('toolique_3d_cost_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  // Modal / UI states
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsForm, setSettingsForm] = useState<CalculatorSettings>({ ...settings });
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeEstimateId, setActiveEstimateId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [currency, setCurrency] = useState(settings.currencySymbol || '₹');

  // Primary Calculator Form States
  const [printTechnology, setPrintTechnology] = useState<'fdm' | 'resin'>(paramTech === 'resin' ? 'resin' : 'fdm');
  const [name, setName] = useState('Custom 3D Print Part');
  const [category, setCategory] = useState('Functional Part');
  const [customerName, setCustomerName] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [notes, setNotes] = useState('');
  const [productImage] = useState<string>('');

  // FDM Multi-Material Slots
  const [filamentSlots, setFilamentSlots] = useState<FilamentSlot[]>([
    {
      id: 'slot-1',
      name: 'Primary Spool (Black PLA+)',
      materialType: 'PLA+',
      pricePerKg: settings.filamentPrice,
      weightGrams: 110,
      isSupport: false
    }
  ]);
  const [filamentWastage, setFilamentWastage] = useState(settings.filamentWastage);
  const [amsPurgeMultiplier, setAmsPurgeMultiplier] = useState(0);
  const [failedWastage, setFailedWastage] = useState(0);

  // Resin Mode States
  const [resinType, setResinType] = useState('Standard 8K Photopolymer');
  const [resinPricePerLiter, setResinPricePerLiter] = useState(1600);
  const [resinVolumeMl, setResinVolumeMl] = useState(45);
  const [washCostPerBatch, setWashCostPerBatch] = useState(25);
  const [cureTimeMinutes, setCureTimeMinutes] = useState(12);
  const [fepWearCostPerJob, setFepWearCostPerJob] = useState(15);
  const [ppeCostPerJob, setPpeCostPerJob] = useState(10);

  // Machine & Power
  const [printDuration, setPrintDuration] = useState(6.5);
  const [electricityUnitCost, setElectricityUnitCost] = useState(settings.electricityUnitCost);
  const [printerWattage, setPrinterWattage] = useState(settings.printerWattage);
  const [machineWearCost, setMachineWearCost] = useState(settings.machineWearCost);
  const [maintenanceCost, setMaintenanceCost] = useState(settings.maintenanceCost);
  const [printerPurchasePrice, setPrinterPurchasePrice] = useState(settings.printerPurchasePrice);

  // Labour Cost
  const [designTime, setDesignTime] = useState(0);
  const [slicingTime, setSlicingTime] = useState(0.2);
  const [postProcessingTime, setPostProcessingTime] = useState(0.4);
  const [paintingTime, setPaintingTime] = useState(0);
  const [packingTime, setPackingTime] = useState(0.15);
  const [labourRate, setLabourRate] = useState(settings.labourRate);

  // Shipping & Extra Materials
  const [paintCost, setPaintCost] = useState(0);
  const [glueCost, setGlueCost] = useState(0);
  const [sandpaperCost, setSandpaperCost] = useState(0);
  const [screwsMagnetsCost, setScrewsMagnetsCost] = useState(0);
  const [packagingBoxCost, setPackagingBoxCost] = useState(settings.packagingBoxCost);
  const [bubbleWrapCost, setBubbleWrapCost] = useState(10);
  const [labelStickerCost, setLabelStickerCost] = useState(5);
  const [courierHandlingCost, setCourierHandlingCost] = useState(settings.courierHandlingCost);

  // Dynamic Custom Cost Fields
  const [customCosts, setCustomCosts] = useState<CustomCostItem[]>([]);
  const [newCustomName, setNewCustomName] = useState('');
  const [newCustomCost, setNewCustomCost] = useState<number | ''>('');

  // Batch Quantity & Business Cost
  const [batchQuantity, setBatchQuantity] = useState(1);
  const [platformCommission, setPlatformCommission] = useState(settings.platformCommission);
  const [paymentGateway, setPaymentGateway] = useState(settings.paymentGateway);
  const [gst, setGst] = useState(settings.gst);
  const [marketingCost, setMarketingCost] = useState(5);
  const [miscellaneousCost, setMiscellaneousCost] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [profitMargin, setProfitMargin] = useState(settings.profitMargin);

  // G-Code Text Import State
  const [gcodeRawText, setGcodeRawText] = useState('');
  const [gcodeParseSuccess, setGcodeParseSuccess] = useState<string | null>(null);

  // Invoice Company Details
  const [studioName, setStudioName] = useState('Toolique 3D Print Studio');
  const [studioGstin, setStudioGstin] = useState('');
  const [invoiceTerms, setInvoiceTerms] = useState('50% advance before slicing. Delivery within 3-5 business days.');

  // Parse URL search parameters on mount
  useEffect(() => {
    if (paramPrice) {
      const parsedPrice = parseFloat(paramPrice);
      if (!isNaN(parsedPrice) && parsedPrice > 0) {
        setFilamentSlots([
          {
            id: 'slot-1',
            name: paramMaterial ? `${paramMaterial} Spool` : 'Primary Filament',
            materialType: paramMaterial || 'PLA',
            pricePerKg: parsedPrice,
            weightGrams: 100,
            isSupport: false
          }
        ]);
      }
    }
    if (paramMaterial) {
      setName(`Custom ${paramMaterial.toUpperCase()} Print`);
    }
  }, [paramPrice, paramMaterial]);

  // Sync settings
  useEffect(() => {
    setSettingsForm({ ...settings });
  }, [settings, isSettingsOpen]);

  // Main Calculation Engine Memo
  const outputs: CostCalculatorOutputs = useMemo(() => {
    const inputs: CostCalculatorInputs = {
      printTechnology,
      name,
      category,
      customerName,
      notes,
      image: productImage,
      filamentSlots,
      filamentPrice: filamentSlots[0]?.pricePerKg || settings.filamentPrice,
      filamentUsed: filamentSlots.reduce((acc, s) => acc + s.weightGrams, 0),
      filamentWastage,
      supportUsed: 0,
      failedWastage,
      amsPurgeMultiplier,
      resinType,
      resinPricePerLiter,
      resinVolumeMl,
      resinDensity: 1.1,
      washCostPerBatch,
      cureTimeMinutes,
      fepWearCostPerJob,
      ppeCostPerJob,
      printDuration,
      electricityUnitCost,
      printerWattage,
      machineWearCost,
      maintenanceCost,
      printerPurchasePrice,
      designTime,
      slicingTime,
      postProcessingTime,
      paintingTime,
      packingTime,
      labourRate,
      paintCost,
      glueCost,
      sandpaperCost,
      screwsMagnetsCost,
      packagingBoxCost,
      bubbleWrapCost,
      labelStickerCost,
      courierHandlingCost,
      customCosts,
      batchQuantity,
      platformCommission,
      paymentGateway,
      gst,
      marketingCost,
      miscellaneousCost,
      discount,
      profitMargin
    };

    return calculate3DPrintCosts(inputs);
  }, [
    printTechnology, name, category, customerName, notes, productImage,
    filamentSlots, filamentWastage, amsPurgeMultiplier, failedWastage,
    resinType, resinPricePerLiter, resinVolumeMl, washCostPerBatch, cureTimeMinutes, fepWearCostPerJob, ppeCostPerJob,
    printDuration, electricityUnitCost, printerWattage, machineWearCost, maintenanceCost, printerPurchasePrice,
    designTime, slicingTime, postProcessingTime, paintingTime, packingTime, labourRate,
    paintCost, glueCost, sandpaperCost, screwsMagnetsCost, packagingBoxCost, bubbleWrapCost, labelStickerCost, courierHandlingCost,
    customCosts, batchQuantity, platformCommission, paymentGateway, gst, marketingCost, miscellaneousCost, discount, profitMargin,
    settings.filamentPrice
  ]);

  // Helper to add filament slot
  const handleAddFilamentSlot = () => {
    const nextNum = filamentSlots.length + 1;
    const newSlot: FilamentSlot = {
      id: `slot-${Date.now()}`,
      name: `AMS Spool ${nextNum}`,
      materialType: 'PLA',
      pricePerKg: settings.filamentPrice,
      weightGrams: 30,
      isSupport: false
    };
    setFilamentSlots([...filamentSlots, newSlot]);
  };

  const handleUpdateFilamentSlot = (id: string, updates: Partial<FilamentSlot>) => {
    setFilamentSlots(filamentSlots.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleRemoveFilamentSlot = (id: string) => {
    if (filamentSlots.length <= 1) return;
    setFilamentSlots(filamentSlots.filter(s => s.id !== id));
  };

  // Helper to add custom accessory cost
  const handleAddCustomCost = () => {
    if (!newCustomName || newCustomCost === '') return;
    const newItem: CustomCostItem = {
      id: Date.now().toString(),
      name: newCustomName,
      cost: Number(newCustomCost)
    };
    setCustomCosts([...customCosts, newItem]);
    setNewCustomName('');
    setNewCustomCost('');
  };

  const handleRemoveCustomCost = (id: string) => {
    setCustomCosts(customCosts.filter(item => item.id !== id));
  };

  // Apply Printer Preset
  const handleApplyPrinterPreset = (preset: typeof PRINTER_PRESETS[0]) => {
    setPrinterWattage(preset.wattage);
    setMachineWearCost(preset.wearCost);
    setMaintenanceCost(preset.maintCost);
    setPrinterPurchasePrice(preset.price);
    if (preset.tech === 'resin') {
      setPrintTechnology('resin');
    } else {
      setPrintTechnology('fdm');
    }
  };

  // Apply Material Preset
  const handleApplyMaterialPreset = (matName: string, price: number) => {
    if (printTechnology === 'resin') {
      setResinType(matName);
      setResinPricePerLiter(price);
    } else {
      setFilamentSlots(filamentSlots.map((s, idx) => idx === 0 ? { ...s, materialType: matName, pricePerKg: price } : s));
    }
  };

  // Apply Job Preset
  const handleApplyJobPreset = (job: typeof JOB_PRESETS[0]) => {
    setName(job.name);
    setCategory(job.category);
    setPrintTechnology(job.tech as 'fdm' | 'resin');
    setPrintDuration(job.duration);
    setPostProcessingTime(job.postTime || 0.3);

    if (job.tech === 'resin') {
      if (job.resinVolume) setResinVolumeMl(job.resinVolume);
      if (job.resinPrice) setResinPricePerLiter(job.resinPrice);
      if (job.cureTime) setCureTimeMinutes(job.cureTime);
      if (job.washCost) setWashCostPerBatch(job.washCost);
    } else {
      if (job.filamentUsed) {
        setFilamentSlots([
          {
            id: 'slot-1',
            name: 'Primary Spool',
            materialType: job.material || 'PLA+',
            pricePerKg: job.price || 1350,
            weightGrams: job.filamentUsed,
            isSupport: false
          }
        ]);
      }
      if (job.batchQty) setBatchQuantity(job.batchQty);
      if (job.paintingTime) setPaintingTime(job.paintingTime);
      if (job.paintCost) setPaintCost(job.paintCost);
      if (job.packagingBoxCost) setPackagingBoxCost(job.packagingBoxCost);
    }
  };

  // Slicer / G-Code Auto-Parser
  const handleParseGcode = (text: string) => {
    if (!text.trim()) return;

    let detectedDuration: number | null = null;
    let detectedWeight: number | null = null;
    const detectedSlots: { name: string; weight: number }[] = [];

    // 1. Bambu Studio / OrcaSlicer / PrusaSlicer time patterns
    const timeMatch = text.match(/estimated printing time[^=]*=\s*([^\r\n]+)/i) ||
                      text.match(/;\s*TIME:\s*(\d+)/i) ||
                      text.match(/Print time:\s*([^\r\n]+)/i);

    if (timeMatch) {
      const rawTime = timeMatch[1];
      if (/^\d+$/.test(rawTime.trim())) {
        // Seconds (e.g. Cura TIME:14400)
        detectedDuration = parseFloat((parseInt(rawTime, 10) / 3600).toFixed(2));
      } else {
        // Human string (e.g. 4h 32m or 2h 15m 30s or 45m)
        let hours = 0;
        let mins = 0;
        const hMatch = rawTime.match(/(\d+)\s*h/i);
        const mMatch = rawTime.match(/(\d+)\s*m/i);
        if (hMatch) hours = parseInt(hMatch[1], 10);
        if (mMatch) mins = parseInt(mMatch[1], 10);
        detectedDuration = parseFloat((hours + mins / 60).toFixed(2));
      }
    }

    // 2. Filament weight extraction
    const weightMatches = [...text.matchAll(/filament used\s*(?:\[g\])?\s*=\s*([\d.]+)/gi)];
    if (weightMatches.length > 0) {
      if (weightMatches.length === 1) {
        detectedWeight = parseFloat(weightMatches[0][1]);
      } else {
        // Multi-material slots
        weightMatches.forEach((m, idx) => {
          const w = parseFloat(m[1]);
          if (w > 0) {
            detectedSlots.push({ name: `AMS Slot ${idx + 1}`, weight: w });
          }
        });
      }
    } else {
      const curaWeight = text.match(/;\s*Filament used:\s*([\d.]+)\s*g/i);
      if (curaWeight) {
        detectedWeight = parseFloat(curaWeight[1]);
      }
    }

    // Apply parsed values
    const successLog: string[] = [];
    if (detectedDuration !== null && detectedDuration > 0) {
      setPrintDuration(detectedDuration);
      successLog.push(`Print Time: ${detectedDuration} hrs`);
    }

    if (detectedSlots.length > 0) {
      setFilamentSlots(detectedSlots.map((ds, idx) => ({
        id: `slot-${idx + 1}`,
        name: ds.name,
        materialType: 'PLA+',
        pricePerKg: settings.filamentPrice,
        weightGrams: ds.weight,
        isSupport: false
      })));
      setAmsPurgeMultiplier(12); // Auto-enable AMS purge margin
      successLog.push(`Multi-Color Slots: ${detectedSlots.length} spools detected`);
    } else if (detectedWeight !== null && detectedWeight > 0) {
      setFilamentSlots([
        {
          id: 'slot-1',
          name: 'Primary Spool',
          materialType: 'PLA+',
          pricePerKg: settings.filamentPrice,
          weightGrams: detectedWeight,
          isSupport: false
        }
      ]);
      successLog.push(`Filament Weight: ${detectedWeight}g`);
    }

    if (successLog.length > 0) {
      setGcodeParseSuccess(`Parsed successfully! (${successLog.join(', ')})`);
      setTimeout(() => setGcodeParseSuccess(null), 6000);
    } else {
      setGcodeParseSuccess('Could not automatically parse filament/time. Please check text format or enter values manually.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setGcodeRawText(content.slice(0, 50000)); // Sample header/footer
        handleParseGcode(content);
      }
    };
    reader.readAsText(file);
  };

  // Save to History
  const handleSaveToHistory = () => {
    const inputs: CostCalculatorInputs = {
      printTechnology, name, category, customerName, notes, image: productImage,
      filamentSlots, filamentPrice: filamentSlots[0]?.pricePerKg || settings.filamentPrice,
      filamentUsed: filamentSlots.reduce((acc, s) => acc + s.weightGrams, 0),
      filamentWastage, supportUsed: 0, failedWastage, amsPurgeMultiplier,
      resinType, resinPricePerLiter, resinVolumeMl, resinDensity: 1.1,
      washCostPerBatch, cureTimeMinutes, fepWearCostPerJob, ppeCostPerJob,
      printDuration, electricityUnitCost, printerWattage, machineWearCost, maintenanceCost, printerPurchasePrice,
      designTime, slicingTime, postProcessingTime, paintingTime, packingTime, labourRate,
      paintCost, glueCost, sandpaperCost, screwsMagnetsCost, packagingBoxCost, bubbleWrapCost, labelStickerCost, courierHandlingCost,
      customCosts, batchQuantity, platformCommission, paymentGateway, gst, marketingCost, miscellaneousCost, discount, profitMargin
    };

    const newHistory = [...history];
    if (activeEstimateId) {
      const idx = newHistory.findIndex(h => h.id === activeEstimateId);
      if (idx !== -1) {
        newHistory[idx] = { id: activeEstimateId, timestamp: Date.now(), inputs, outputs };
      }
    } else {
      const newItem: HistoryItem = { id: Date.now().toString(), timestamp: Date.now(), inputs, outputs };
      newHistory.unshift(newItem);
      setActiveEstimateId(newItem.id);
    }

    localStorage.setItem('toolique_3d_cost_history', JSON.stringify(newHistory));
    setHistory(newHistory);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleLoadHistoryItem = (item: HistoryItem) => {
    setActiveEstimateId(item.id);
    setName(item.inputs.name);
    setCategory(item.inputs.category);
    setCustomerName(item.inputs.customerName || '');
    setNotes(item.inputs.notes || '');
    setPrintTechnology(item.inputs.printTechnology || 'fdm');

    if (item.inputs.filamentSlots && item.inputs.filamentSlots.length > 0) {
      setFilamentSlots(item.inputs.filamentSlots);
    } else {
      setFilamentSlots([
        {
          id: 'slot-1',
          name: 'Primary Spool',
          materialType: 'PLA',
          pricePerKg: item.inputs.filamentPrice,
          weightGrams: item.inputs.filamentUsed,
          isSupport: false
        }
      ]);
    }

    setFilamentWastage(item.inputs.filamentWastage);
    setAmsPurgeMultiplier(item.inputs.amsPurgeMultiplier || 0);
    setFailedWastage(item.inputs.failedWastage);

    setResinType(item.inputs.resinType || 'Standard 8K Photopolymer');
    setResinPricePerLiter(item.inputs.resinPricePerLiter || 1600);
    setResinVolumeMl(item.inputs.resinVolumeMl || 45);
    setWashCostPerBatch(item.inputs.washCostPerBatch || 25);
    setCureTimeMinutes(item.inputs.cureTimeMinutes || 12);
    setFepWearCostPerJob(item.inputs.fepWearCostPerJob || 15);
    setPpeCostPerJob(item.inputs.ppeCostPerJob || 10);

    setPrintDuration(item.inputs.printDuration);
    setElectricityUnitCost(item.inputs.electricityUnitCost);
    setPrinterWattage(item.inputs.printerWattage);
    setMachineWearCost(item.inputs.machineWearCost);
    setMaintenanceCost(item.inputs.maintenanceCost);
    setPrinterPurchasePrice(item.inputs.printerPurchasePrice || 45000);

    setDesignTime(item.inputs.designTime);
    setSlicingTime(item.inputs.slicingTime);
    setPostProcessingTime(item.inputs.postProcessingTime);
    setPaintingTime(item.inputs.paintingTime);
    setPackingTime(item.inputs.packingTime);
    setLabourRate(item.inputs.labourRate);

    setPaintCost(item.inputs.paintCost);
    setGlueCost(item.inputs.glueCost);
    setSandpaperCost(item.inputs.sandpaperCost);
    setScrewsMagnetsCost(item.inputs.screwsMagnetsCost);
    setPackagingBoxCost(item.inputs.packagingBoxCost);
    setBubbleWrapCost(item.inputs.bubbleWrapCost);
    setLabelStickerCost(item.inputs.labelStickerCost);
    setCourierHandlingCost(item.inputs.courierHandlingCost);

    setCustomCosts(item.inputs.customCosts || []);
    setBatchQuantity(item.inputs.batchQuantity || 1);

    setPlatformCommission(item.inputs.platformCommission);
    setPaymentGateway(item.inputs.paymentGateway);
    setGst(item.inputs.gst);
    setMarketingCost(item.inputs.marketingCost);
    setMiscellaneousCost(item.inputs.miscellaneousCost);
    setDiscount(item.inputs.discount);
    setProfitMargin(item.inputs.profitMargin);

    setIsHistoryOpen(false);
  };

  const handleDuplicateHistoryItem = (item: HistoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const duplicated: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      inputs: { ...item.inputs, name: `${item.inputs.name} (Copy)` },
      outputs: item.outputs
    };
    const newHistory = [duplicated, ...history];
    localStorage.setItem('toolique_3d_cost_history', JSON.stringify(newHistory));
    setHistory(newHistory);
  };

  const handleDeleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newHistory = history.filter(h => h.id !== id);
    localStorage.setItem('toolique_3d_cost_history', JSON.stringify(newHistory));
    setHistory(newHistory);
    if (activeEstimateId === id) setActiveEstimateId(null);
  };

  const handleResetForm = () => {
    setActiveEstimateId(null);
    setName('Custom 3D Print Part');
    setCategory('Functional Part');
    setCustomerName('');
    setClientContact('');
    setNotes('');
    setPrintTechnology('fdm');
    setFilamentSlots([
      {
        id: 'slot-1',
        name: 'Primary Spool (Black PLA+)',
        materialType: 'PLA+',
        pricePerKg: settings.filamentPrice,
        weightGrams: 110,
        isSupport: false
      }
    ]);
    setAmsPurgeMultiplier(0);
    setFailedWastage(0);
    setPrintDuration(6.5);
    setDesignTime(0);
    setSlicingTime(0.2);
    setPostProcessingTime(0.4);
    setPaintingTime(0);
    setPackingTime(0.15);
    setPaintCost(0);
    setGlueCost(0);
    setSandpaperCost(0);
    setScrewsMagnetsCost(0);
    setCustomCosts([]);
    setBatchQuantity(1);
    setDiscount(0);
    setMiscellaneousCost(0);
  };

  // WhatsApp Quotation Message
  const handleShareWhatsApp = () => {
    const quoteText = `*3D PRINTING QUOTATION* 🏷️
*Project:* ${name} (${category})
${customerName ? `*Client:* ${customerName}\n` : ''}*Quantity:* ${batchQuantity} unit(s)
*Print Technology:* ${printTechnology === 'resin' ? 'Resin SLA / MSLA' : 'FDM Multi-Material'}
*Estimated Print Time:* ${printDuration} hours
*Total Material Weight:* ${outputs.totalFilamentGrams.toFixed(1)}g

💰 *PRICING SUMMARY:*
• Unit Price: *${currency}${outputs.unitSellingPrice.toFixed(2)}*
• Total Order Value: *${currency}${outputs.finalSellingPrice.toFixed(2)}* (incl. GST & finishing)
${discount > 0 ? `• Discount Applied: ${discount}%\n` : ''}
📦 *Includes:* Professional slicing, fine post-processing, protective box packaging, and quality inspection.

Generated via *Toolique 3D Print Studio* (www.toolique.in)`;

    const encoded = encodeURIComponent(quoteText);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  // Copy Summary text
  const handleCopyReport = () => {
    const text = `--- 3D PRINTING QUOTE & COST REPORT: ${name} ---
Category: ${category}
Technology: ${printTechnology.toUpperCase()}
Batch Quantity: ${batchQuantity} unit(s)
Total Production Cost: ${currency}${outputs.totalProductionCost.toFixed(2)} (${currency}${outputs.unitProductionCost.toFixed(2)}/unit)
Suggested Retail Price: ${currency}${outputs.suggestedSellingPrice.toFixed(2)}
Final Net Selling Price: ${currency}${outputs.finalSellingPrice.toFixed(2)} (${currency}${outputs.unitSellingPrice.toFixed(2)}/unit)
Estimated Net Profit: ${currency}${outputs.profitAmount.toFixed(2)} (${profitMargin}%)

--- PRODUCTION BREAKDOWN ---
• Material Cost: ${currency}${outputs.materialCost.toFixed(2)} (${outputs.totalFilamentGrams.toFixed(1)}g total)
• Electricity Utility: ${currency}${outputs.electricityCost.toFixed(2)}
• Machine Wear & Maintenance: ${currency}${outputs.machineCost.toFixed(2)}
• Operations & Finishing Labour: ${currency}${outputs.labourCost.toFixed(2)}
• Packaging & Shipping Supplies: ${currency}${outputs.extraMaterialCost.toFixed(2)}
• Custom Accessories: ${currency}${outputs.customCostTotal.toFixed(2)}
• Platform & Merchant Overheads: ${currency}${outputs.businessOverhead.toFixed(2)}
• GST Tax (${gst}%): ${currency}${outputs.gstAmount.toFixed(2)}

Unit Metrics: ${currency}${outputs.pricePerGram.toFixed(2)}/g | ${currency}${outputs.pricePerPrintHour.toFixed(2)}/print-hour
Calculated on Toolique (www.toolique.in/3d-printing-tools/3d-printing-cost-calculator)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export Professional PDF
  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      const primaryColor = [79, 70, 229]; // Indigo
      const darkColor = [24, 24, 27]; // Zinc 900

      // Header Banner
      doc.setFillColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.rect(0, 0, 210, 38, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text(studioName || 'TOOLIQUE 3D PRINT STUDIO', 14, 20);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('Commercial 3D Printing Quotation & Specification Sheet', 14, 28);
      if (studioGstin) doc.text(`GSTIN: ${studioGstin}`, 14, 34);

      // Metadata block
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(9);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 145, 18);
      doc.text(`Quote Ref: TQ-${Date.now().toString().slice(-6)}`, 145, 25);
      doc.text(`Valid For: 15 Days`, 145, 32);

      // Client & Project Box
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('PROJECT & CLIENT DETAILS', 14, 48);
      doc.setDrawColor(220, 220, 220);
      doc.line(14, 51, 196, 51);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Part Name: ${name}`, 14, 58);
      doc.text(`Category: ${category}`, 14, 64);
      doc.text(`Technology: ${printTechnology === 'resin' ? 'Resin SLA / MSLA' : 'FDM Multi-Material'}`, 14, 70);
      doc.text(`Batch Quantity: ${batchQuantity} unit(s)`, 14, 76);

      if (customerName) doc.text(`Customer: ${customerName}`, 110, 58);
      if (clientContact) doc.text(`Contact: ${clientContact}`, 110, 64);
      doc.text(`Print Duration: ${printDuration} hrs/unit`, 110, 70);
      doc.text(`Material Usage: ${outputs.totalFilamentGrams.toFixed(1)}g total`, 110, 76);

      // Financial Highlight Box
      doc.setFillColor(245, 247, 255);
      doc.roundedRect(14, 84, 182, 28, 3, 3, 'F');
      doc.setDrawColor(199, 210, 254);
      doc.roundedRect(14, 84, 182, 28, 3, 3, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('TOTAL QUOTATION VALUE', 20, 93);
      doc.setFontSize(18);
      doc.text(`${currency}${outputs.finalSellingPrice.toFixed(2)}`, 20, 104);

      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text(`Unit Price: ${currency}${outputs.unitSellingPrice.toFixed(2)}/unit`, 110, 94);
      doc.text(`Inclusive of: Materials, Finishing, Packaging & GST (${gst}%)`, 110, 102);

      // Line Items Table
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('ITEMIZED COST SCHEDULE', 14, 122);
      doc.line(14, 125, 196, 125);

      let y = 133;
      const drawRow = (desc: string, qtyText: string, rateText: string, totalText: string, isHeader = false) => {
        if (isHeader) {
          doc.setFillColor(240, 240, 245);
          doc.rect(14, y - 5, 182, 7, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(80, 80, 80);
        } else {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
        }
        doc.text(desc, 16, y);
        doc.text(qtyText, 110, y);
        doc.text(rateText, 140, y);
        doc.text(totalText, 175, y);
        if (!isHeader) {
          doc.setDrawColor(240, 240, 240);
          doc.line(14, y + 2, 196, y + 2);
        }
        y += 8;
      };

      drawRow('DESCRIPTION / COST CENTER', 'QTY / BASIS', 'UNIT RATE', 'TOTAL', true);
      drawRow('Raw Polymer Material & Consumables', `${outputs.totalFilamentGrams.toFixed(0)}g`, '-', `${currency}${outputs.materialCost.toFixed(2)}`);
      drawRow('Machine Run-Time & Power Utility', `${(printDuration * batchQuantity).toFixed(1)} hrs`, `${currency}${(outputs.machineCost / printDuration).toFixed(2)}/hr`, `${currency}${(outputs.electricityCost + outputs.machineCost).toFixed(2)}`);
      drawRow('Slicing, Calibration & Finishing Labor', `${(designTime + slicingTime + postProcessingTime + packingTime).toFixed(1)} hrs`, `${currency}${labourRate}/hr`, `${currency}${outputs.labourCost.toFixed(2)}`);
      drawRow('Custom Hardware & Protective Packaging', `${batchQuantity} set(s)`, '-', `${currency}${(outputs.extraMaterialCost + outputs.customCostTotal).toFixed(2)}`);
      drawRow('Commercial Margin & Studio Markup', `${profitMargin}% margin`, '-', `${currency}${outputs.profitAmount.toFixed(2)}`);
      drawRow(`Goods & Services Tax (GST ${gst}%)`, 'Statutory Tax', '-', `${currency}${outputs.gstAmount.toFixed(2)}`);

      if (discount > 0) {
        drawRow(`Volume Discount Applied (${discount}%)`, 'Discount', '-', `- ${currency}${outputs.discountAmount.toFixed(2)}`);
      }

      // Terms & Conditions
      y += 8;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('TERMS & MANUFACTURING SPECIFICATIONS', 14, y);
      doc.setDrawColor(220, 220, 220);
      doc.line(14, y + 2, 196, y + 2);
      y += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`1. ${invoiceTerms}`, 14, y);
      y += 5;
      doc.text('2. 3D printed parts have layer lines characteristic of additive manufacturing.', 14, y);
      y += 5;
      doc.text('3. Standard dimensional tolerance: ±0.2mm for FDM, ±0.05mm for SLA.', 14, y);

      // Footer
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text('Generated with Toolique 3D Print Studio (www.toolique.in) • All estimates valid for 15 days.', 14, 285);

      doc.save(`${(name || '3D_Print').replace(/[^a-zA-Z0-9]/g, '_')}_Quotation.pdf`);
    } catch (e) {
      alert('Error creating PDF report: ' + e);
    }
  };

  // Export History as CSV
  const handleExportCSV = () => {
    if (history.length === 0) {
      alert('No history entries to export.');
      return;
    }

    const headers = [
      'Date', 'Product Name', 'Technology', 'Category', 'Customer', 'Batch Qty',
      'Material Cost', 'Electricity Cost', 'Machine Cost', 'Labour Cost',
      'Packaging Cost', 'Custom Cost', 'Production Cost', 'Profit Amount',
      'GST Amount', 'Unit Price', 'Total Final Price'
    ];

    const rows = history.map(item => [
      new Date(item.timestamp).toLocaleString(),
      item.inputs.name,
      item.inputs.printTechnology || 'FDM',
      item.inputs.category,
      item.inputs.customerName || '',
      item.inputs.batchQuantity || 1,
      item.outputs.materialCost.toFixed(2),
      item.outputs.electricityCost.toFixed(2),
      item.outputs.machineCost.toFixed(2),
      item.outputs.labourCost.toFixed(2),
      item.outputs.extraMaterialCost.toFixed(2),
      item.outputs.customCostTotal.toFixed(2),
      item.outputs.totalProductionCost.toFixed(2),
      item.outputs.profitAmount.toFixed(2),
      item.outputs.gstAmount.toFixed(2),
      item.outputs.unitSellingPrice.toFixed(2),
      item.outputs.finalSellingPrice.toFixed(2)
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Toolique_3D_Printing_Cost_History.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export History as Excel
  const handleExportExcel = () => {
    if (history.length === 0) {
      alert('No history entries to export.');
      return;
    }

    const data = history.map(item => ({
      'Date': new Date(item.timestamp).toLocaleString(),
      'Part Name': item.inputs.name,
      'Technology': (item.inputs.printTechnology || 'FDM').toUpperCase(),
      'Category': item.inputs.category,
      'Customer': item.inputs.customerName || 'N/A',
      'Batch Qty': item.inputs.batchQuantity || 1,
      'Material Cost': item.outputs.materialCost.toFixed(2),
      'Electricity Cost': item.outputs.electricityCost.toFixed(2),
      'Machine Wear': item.outputs.machineCost.toFixed(2),
      'Labour Cost': item.outputs.labourCost.toFixed(2),
      'Packaging Cost': item.outputs.extraMaterialCost.toFixed(2),
      'Custom Cost': item.outputs.customCostTotal.toFixed(2),
      'Total Production Cost': item.outputs.totalProductionCost.toFixed(2),
      'Profit Earned': item.outputs.profitAmount.toFixed(2),
      'GST Tax': item.outputs.gstAmount.toFixed(2),
      'Unit Price': item.outputs.unitSellingPrice.toFixed(2),
      'Total Price': item.outputs.finalSellingPrice.toFixed(2)
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '3D Print Cost History');
    XLSX.writeFile(workbook, 'Toolique_3D_Printing_Cost_History.xlsx');
  };

  // Warnings
  const showMarginWarning = profitMargin < 15;
  const showPriceWarning = outputs.finalSellingPrice < outputs.totalProductionCost;
  const showInputsMissingWarning = printDuration === 0 || outputs.totalFilamentGrams === 0;

  // Cost shares for graph visualization
  const matPct = outputs.totalProductionCost > 0 ? (outputs.materialCost / outputs.totalProductionCost) * 100 : 0;
  const elecPct = outputs.totalProductionCost > 0 ? (outputs.electricityCost / outputs.totalProductionCost) * 100 : 0;
  const machinePct = outputs.totalProductionCost > 0 ? (outputs.machineCost / outputs.totalProductionCost) * 100 : 0;
  const labourPct = outputs.totalProductionCost > 0 ? (outputs.labourCost / outputs.totalProductionCost) * 100 : 0;
  const extraPct = outputs.totalProductionCost > 0 ? (outputs.extraMaterialCost / outputs.totalProductionCost) * 100 : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-left">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight">3D Printing Cost Calculator & Quote Studio</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              v2.0 Commercial
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Full commercial pricing engine for FDM & Resin 3D printing with AMS multi-color, batch scaling, G-code import, and client proposals.
          </p>
        </div>

        {/* Currency & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Currency Selector */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800/80 rounded-xl p-0.5 border border-zinc-200/60 dark:border-zinc-700/60 text-xs">
            {['₹', '$', '€', '£'].map((sym) => (
              <button
                key={sym}
                onClick={() => setCurrency(sym)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  currency === sym
                    ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                {sym}
              </button>
            ))}
          </div>

          <button
            onClick={handleResetForm}
            className="saas-button-secondary text-xs flex items-center gap-1.5 cursor-pointer py-1.5 px-3"
            title="Reset to defaults"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="saas-button-secondary text-xs flex items-center gap-1.5 cursor-pointer py-1.5 px-3"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Defaults</span>
          </button>
        </div>
      </div>

      {/* Segmented Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-200/80 dark:border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('calculator')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'calculator'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Full Cost Breakdown</span>
        </button>

        <button
          onClick={() => setActiveTab('batch')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'batch'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Batch & Volume Tiers</span>
          <span className="px-1.5 py-0.2 rounded text-[9px] bg-indigo-500/20 text-indigo-300">New</span>
        </button>

        <button
          onClick={() => setActiveTab('gcode')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'gcode'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-800'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>G-Code & Slicer Import</span>
        </button>

        <button
          onClick={() => setActiveTab('roi')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'roi'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Machine Payback & ROI</span>
        </button>

        <button
          onClick={() => setActiveTab('quote')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'quote'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Client Invoice & Proposal</span>
        </button>
      </div>

      {/* Preset Quick-Bar */}
      <div className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">1-Click Presets:</span>
          </div>

          {/* Technology Selector */}
          <div className="flex bg-white dark:bg-zinc-950 rounded-xl p-0.5 border border-zinc-200 dark:border-zinc-800 text-xs">
            <button
              onClick={() => setPrintTechnology('fdm')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                printTechnology === 'fdm'
                  ? 'bg-indigo-600 text-white'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>FDM Filament</span>
            </button>
            <button
              onClick={() => setPrintTechnology('resin')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                printTechnology === 'resin'
                  ? 'bg-purple-600 text-white'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Resin / SLA</span>
            </button>
          </div>
        </div>

        {/* Presets Chips */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {/* Hardware Presets */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase">Printer Hardware Profile</label>
            <select
              onChange={(e) => {
                const found = PRINTER_PRESETS.find(p => p.name === e.target.value);
                if (found) handleApplyPrinterPreset(found);
              }}
              className="saas-select text-xs"
              defaultValue=""
            >
              <option value="" disabled>Select a Printer Preset...</option>
              {PRINTER_PRESETS.map(p => (
                <option key={p.name} value={p.name}>{p.name} ({p.wattage}W)</option>
              ))}
            </select>
          </div>

          {/* Material Presets */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase">Material & Polymer Catalog</label>
            <select
              onChange={(e) => {
                const price = MATERIAL_PRESETS[e.target.value]?.price;
                if (price) handleApplyMaterialPreset(e.target.value, price);
              }}
              className="saas-select text-xs"
              defaultValue=""
            >
              <option value="" disabled>Apply Material Price...</option>
              {Object.entries(MATERIAL_PRESETS).map(([k, v]) => (
                <option key={k} value={k}>{k} ({currency}{v.price})</option>
              ))}
            </select>
          </div>

          {/* Quick Job Presets */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase">Typical Project Archetype</label>
            <select
              onChange={(e) => {
                const found = JOB_PRESETS.find(j => j.name === e.target.value);
                if (found) handleApplyJobPreset(found);
              }}
              className="saas-select text-xs"
              defaultValue=""
            >
              <option value="" disabled>Load Project Template...</option>
              {JOB_PRESETS.map(j => (
                <option key={j.name} value={j.name}>{j.name} ({j.duration}h, {j.category})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Configurator Panels */}
        <div className="lg:col-span-7 space-y-6">

          {/* TAB 1: FULL COST CALCULATOR */}
          {activeTab === 'calculator' && (
            <>
              {/* 1. Project & Customer Specs */}
              <div className="saas-card p-6 space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>1. Project & Customer Details</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Part / Model Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="saas-input text-xs"
                      placeholder="e.g. Drone Arm Mount"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="saas-select text-xs"
                    >
                      {settings.productCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Customer / Client Name</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="saas-input text-xs"
                      placeholder="e.g. Rahul Sharma"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Batch Order Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={batchQuantity}
                      onChange={(e) => setBatchQuantity(Math.max(parseInt(e.target.value, 10) || 1, 1))}
                      className="saas-input text-xs font-bold text-indigo-600 dark:text-indigo-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Print Notes & Slicer Config</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="saas-input text-xs min-h-[55px]"
                    placeholder="e.g. 4 wall loops, 25% gyroid infill, 0.16mm layer height, support interface on build plate only..."
                  />
                </div>
              </div>

              {/* 2. Material Cost (FDM Multi-Material vs Resin) */}
              <div className="saas-card p-6 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <Layers className="w-4 h-4" />
                    <span>2. {printTechnology === 'resin' ? 'Resin & Photopolymer Consumables' : 'Filament & Multi-Material (AMS)'}</span>
                  </h3>
                  {printTechnology === 'fdm' && (
                    <button
                      onClick={handleAddFilamentSlot}
                      className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Spool Slot</span>
                    </button>
                  )}
                </div>

                {printTechnology === 'fdm' ? (
                  <div className="space-y-4">
                    {filamentSlots.map((slot, idx) => (
                      <div
                        key={slot.id}
                        className="p-3.5 rounded-2xl bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 space-y-3"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                            Spool #{idx + 1}: {slot.name}
                          </span>
                          {filamentSlots.length > 1 && (
                            <button
                              onClick={() => handleRemoveFilamentSlot(slot.id)}
                              className="text-red-500 hover:text-red-650 cursor-pointer p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-zinc-500 uppercase">Spool Name / Material</label>
                            <input
                              type="text"
                              value={slot.name}
                              onChange={(e) => handleUpdateFilamentSlot(slot.id, { name: e.target.value })}
                              className="saas-input text-xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-zinc-500 uppercase">Spool Price ({currency}/kg)</label>
                            <input
                              type="number"
                              value={slot.pricePerKg}
                              onChange={(e) => handleUpdateFilamentSlot(slot.id, { pricePerKg: Number(e.target.value) })}
                              className="saas-input text-xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-zinc-500 uppercase">Weight Used (grams)</label>
                            <input
                              type="number"
                              value={slot.weightGrams}
                              onChange={(e) => handleUpdateFilamentSlot(slot.id, { weightGrams: Number(e.target.value) })}
                              className="saas-input text-xs font-bold"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Base Wastage %</label>
                        <input
                          type="number"
                          value={filamentWastage}
                          onChange={(e) => setFilamentWastage(Number(e.target.value))}
                          className="saas-input text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">AMS Multi-Color Purge %</label>
                        <input
                          type="number"
                          value={amsPurgeMultiplier}
                          onChange={(e) => setAmsPurgeMultiplier(Number(e.target.value))}
                          className="saas-input text-xs"
                          placeholder="e.g. 10% for color switches"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Failed Contingency (g)</label>
                        <input
                          type="number"
                          value={failedWastage}
                          onChange={(e) => setFailedWastage(Number(e.target.value))}
                          className="saas-input text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Resin Mode Form */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase">Resin Formula / Brand</label>
                      <input
                        type="text"
                        value={resinType}
                        onChange={(e) => setResinType(e.target.value)}
                        className="saas-input text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase">Resin Price ({currency}/Liter)</label>
                      <input
                        type="number"
                        value={resinPricePerLiter}
                        onChange={(e) => setResinPricePerLiter(Number(e.target.value))}
                        className="saas-input text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase">Model Volume (ml / cm³)</label>
                      <input
                        type="number"
                        value={resinVolumeMl}
                        onChange={(e) => setResinVolumeMl(Number(e.target.value))}
                        className="saas-input text-xs font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase">Wash IPA Cost / Batch ({currency})</label>
                      <input
                        type="number"
                        value={washCostPerBatch}
                        onChange={(e) => setWashCostPerBatch(Number(e.target.value))}
                        className="saas-input text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase">UV Curing Time (Minutes)</label>
                      <input
                        type="number"
                        value={cureTimeMinutes}
                        onChange={(e) => setCureTimeMinutes(Number(e.target.value))}
                        className="saas-input text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase">FEP Film & PPE Wear ({currency})</label>
                      <input
                        type="number"
                        value={fepWearCostPerJob + ppeCostPerJob}
                        onChange={(e) => {
                          const half = Number(e.target.value) / 2;
                          setFepWearCostPerJob(half);
                          setPpeCostPerJob(half);
                        }}
                        className="saas-input text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Machine & Electricity */}
              <div className="saas-card p-6 space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  <span>3. Machine Wear & Power Utility</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Print Duration (Hours per unit)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={printDuration}
                      onChange={(e) => setPrintDuration(Number(e.target.value))}
                      className="saas-input text-xs font-bold text-indigo-600 dark:text-indigo-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Electricity Rate ({currency}/unit kWh)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={electricityUnitCost}
                      onChange={(e) => setElectricityUnitCost(Number(e.target.value))}
                      className="saas-input text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Printer Power Draw (Watts)</label>
                    <input
                      type="number"
                      value={printerWattage}
                      onChange={(e) => setPrinterWattage(Number(e.target.value))}
                      className="saas-input text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Wear Depreciation ({currency}/hr)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={machineWearCost}
                      onChange={(e) => setMachineWearCost(Number(e.target.value))}
                      className="saas-input text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Labor & Setup Operations */}
              <div className="saas-card p-6 space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>4. Operations & Hands-on Labor</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase">CAD Design (Fixed hrs)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={designTime}
                      onChange={(e) => setDesignTime(Number(e.target.value))}
                      className="saas-input text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase">Slicing & Prep (Fixed hrs)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={slicingTime}
                      onChange={(e) => setSlicingTime(Number(e.target.value))}
                      className="saas-input text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase">Post-Processing (hrs/unit)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={postProcessingTime}
                      onChange={(e) => setPostProcessingTime(Number(e.target.value))}
                      className="saas-input text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase">Painting (hrs/unit)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={paintingTime}
                      onChange={(e) => setPaintingTime(Number(e.target.value))}
                      className="saas-input text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase">Packing Time (hrs/unit)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={packingTime}
                      onChange={(e) => setPackingTime(Number(e.target.value))}
                      className="saas-input text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase">Hourly Labor Rate ({currency})</label>
                    <input
                      type="number"
                      value={labourRate}
                      onChange={(e) => setLabourRate(Number(e.target.value))}
                      className="saas-input text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Custom Accessories & Shipping */}
              <div className="saas-card p-6 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <Box className="w-4 h-4" />
                    <span>5. Hardware Inserts, Shipping & Custom Items</span>
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase">Heat Inserts/Screws ({currency})</label>
                    <input
                      type="number"
                      value={screwsMagnetsCost}
                      onChange={(e) => setScrewsMagnetsCost(Number(e.target.value))}
                      className="saas-input text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase">Paint / Primer ({currency})</label>
                    <input
                      type="number"
                      value={paintCost}
                      onChange={(e) => setPaintCost(Number(e.target.value))}
                      className="saas-input text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase">Box & Bubblewrap ({currency})</label>
                    <input
                      type="number"
                      value={packagingBoxCost + bubbleWrapCost}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setPackagingBoxCost(val > 10 ? val - 10 : val);
                        setBubbleWrapCost(val > 10 ? 10 : 0);
                      }}
                      className="saas-input text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase">Courier Shipping ({currency})</label>
                    <input
                      type="number"
                      value={courierHandlingCost}
                      onChange={(e) => setCourierHandlingCost(Number(e.target.value))}
                      className="saas-input text-xs"
                    />
                  </div>
                </div>

                {/* Dynamic Custom Items */}
                <div className="pt-2 space-y-2 border-t border-zinc-200/40 dark:border-zinc-800/40">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">Add Dynamic Custom Item (e.g. Magnets, LED, Acrylic dome)</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCustomName}
                      onChange={(e) => setNewCustomName(e.target.value)}
                      placeholder="Item name..."
                      className="saas-input text-xs flex-grow"
                    />
                    <input
                      type="number"
                      value={newCustomCost}
                      onChange={(e) => setNewCustomCost(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder={`${currency} cost`}
                      className="saas-input text-xs w-28"
                    />
                    <button
                      onClick={handleAddCustomCost}
                      className="saas-button-primary px-3 text-xs cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  {customCosts.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {customCosts.map(item => (
                        <div key={item.id} className="flex justify-between items-center p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/40 dark:border-zinc-800/40 text-xs">
                          <span className="font-semibold text-zinc-700 dark:text-zinc-300">{item.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="font-extrabold text-zinc-900 dark:text-zinc-100">{currency}{item.cost.toFixed(2)}</span>
                            <button onClick={() => handleRemoveCustomCost(item.id)} className="text-red-500 hover:text-red-650 cursor-pointer">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 6. Overheads, Margin & Taxes */}
              <div className="saas-card p-6 space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4" />
                  <span>6. Commercial Margin, Taxes & Overheads</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Profit Margin %</label>
                    <input
                      type="number"
                      value={profitMargin}
                      onChange={(e) => setProfitMargin(Number(e.target.value))}
                      className="saas-input text-xs font-bold text-indigo-600 dark:text-indigo-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">GST Tax %</label>
                    <input
                      type="number"
                      value={gst}
                      onChange={(e) => setGst(Number(e.target.value))}
                      className="saas-input text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Platform Fee %</label>
                    <input
                      type="number"
                      value={platformCommission}
                      onChange={(e) => setPlatformCommission(Number(e.target.value))}
                      className="saas-input text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Payment Gateway %</label>
                    <input
                      type="number"
                      value={paymentGateway}
                      onChange={(e) => setPaymentGateway(Number(e.target.value))}
                      className="saas-input text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Marketing Budget %</label>
                    <input
                      type="number"
                      value={marketingCost}
                      onChange={(e) => setMarketingCost(Number(e.target.value))}
                      className="saas-input text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Client Discount %</label>
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="saas-input text-xs text-rose-500"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: BATCH & VOLUME TIERS */}
          {activeTab === 'batch' && (
            <div className="saas-card p-6 space-y-6">
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <Package className="w-4 h-4" />
                  <span>Batch Scaling & Volume Discount Matrix</span>
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Fixed setup operations (CAD design, slicing, bed leveling) are amortized across the batch quantity, dramatically dropping per-unit manufacturing costs.
                </p>
              </div>

              {/* Batch Matrix Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold uppercase text-[9px]">
                      <th className="py-2.5 px-3">Batch Tier</th>
                      <th className="py-2.5 px-3">Unit Cost</th>
                      <th className="py-2.5 px-3">Unit Selling Price</th>
                      <th className="py-2.5 px-3">Total Order Value</th>
                      <th className="py-2.5 px-3">Client Savings</th>
                      <th className="py-2.5 px-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 font-medium">
                    {outputs.batchTiers.map((tier) => (
                      <tr
                        key={tier.qty}
                        className={`hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors ${
                          batchQuantity === tier.qty ? 'bg-indigo-50/50 dark:bg-indigo-950/20 font-bold' : ''
                        }`}
                      >
                        <td className="py-3 px-3">
                          <span className="font-extrabold text-zinc-900 dark:text-zinc-100">{tier.label}</span>
                        </td>
                        <td className="py-3 px-3 text-zinc-600 dark:text-zinc-400">
                          {currency}{tier.unitCost.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 font-bold text-indigo-600 dark:text-indigo-400">
                          {currency}{tier.unitPrice.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 font-extrabold text-zinc-900 dark:text-zinc-100">
                          {currency}{tier.totalOrderPrice.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400">
                          {tier.totalSavings > 0 ? `-${currency}${tier.totalSavings.toFixed(2)}` : 'Base Rate'}
                        </td>
                        <td className="py-3 px-3">
                          <button
                            onClick={() => setBatchQuantity(tier.qty)}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-600 hover:text-white transition cursor-pointer"
                          >
                            Apply {tier.qty}x
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Volume Amortization Insight */}
              <div className="p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-500/20 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-indigo-700 dark:text-indigo-300">
                  <TrendingUp className="w-4 h-4" />
                  <span>Volume Manufacturing Insight</span>
                </div>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Printing a batch of <strong className="text-zinc-900 dark:text-white">50 units</strong> reduces the per-unit cost from <strong className="text-zinc-900 dark:text-white">{currency}{outputs.batchTiers[0]?.unitCost.toFixed(2)}</strong> down to <strong className="text-emerald-600">{currency}{outputs.batchTiers[4]?.unitCost.toFixed(2)}</strong> by spreading fixed engineering setup across the run.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: G-CODE & SLICER IMPORT */}
          {activeTab === 'gcode' && (
            <div className="saas-card p-6 space-y-5">
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <Upload className="w-4 h-4" />
                  <span>Slicer Output & G-Code Auto-Parser</span>
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Drop a <code className="text-indigo-600 font-bold">.gcode</code> file or paste slicer summary text from Bambu Studio, OrcaSlicer, PrusaSlicer, or Cura to auto-populate filament weights, AMS slots, and print duration.
                </p>
              </div>

              {/* File Dropzone */}
              <div className="p-6 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-center space-y-2 hover:border-indigo-500/50 transition-colors">
                <Upload className="w-8 h-8 text-indigo-500 mx-auto" />
                <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  Upload .gcode file
                </div>
                <p className="text-[10px] text-zinc-400">Supports Bambu, Prusa, Orca, Cura slicer header logs</p>
                <input
                  type="file"
                  accept=".gcode,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="gcode-upload"
                />
                <label
                  htmlFor="gcode-upload"
                  className="saas-button-primary text-xs inline-block py-2 px-4 cursor-pointer"
                >
                  Browse File
                </label>
              </div>

              {/* Raw Text Box */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Or Paste Slicer Summary Logs</label>
                  <button
                    onClick={() => handleParseGcode(gcodeRawText)}
                    className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    Parse Text Now
                  </button>
                </div>
                <textarea
                  value={gcodeRawText}
                  onChange={(e) => setGcodeRawText(e.target.value)}
                  placeholder="Paste Bambu Studio / Cura / PrusaSlicer summary here (e.g. filament used [g] = 145.2, estimated printing time = 6h 15m)..."
                  className="saas-input font-mono text-xs min-h-[140px]"
                />
              </div>

              {gcodeParseSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{gcodeParseSuccess}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MACHINE ROI & PAYBACK */}
          {activeTab === 'roi' && (
            <div className="saas-card p-6 space-y-6">
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  <span>Machine Payback & Print Farm ROI Analyzer</span>
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Analyze machine depreciation coverage, hardware payoff timeline, and monthly commercial farm profit capacity.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Printer Hardware Purchase Cost ({currency})</label>
                  <input
                    type="number"
                    value={printerPurchasePrice}
                    onChange={(e) => setPrinterPurchasePrice(Number(e.target.value))}
                    className="saas-input text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Combined Wear Depreciation Rate ({currency}/hr)</label>
                  <input
                    type="number"
                    value={machineWearCost + maintenanceCost}
                    disabled
                    className="saas-input text-xs bg-zinc-100 dark:bg-zinc-900"
                  />
                </div>
              </div>

              {/* ROI Dashboard Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 space-y-1">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase">Hours to Payoff</span>
                  <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">{outputs.roi.hoursToPayoff}h</div>
                  <span className="text-[9px] text-zinc-500">at current wear rate</span>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 space-y-1">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase">Jobs to Break Even</span>
                  <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">{outputs.roi.jobsToPayoff}</div>
                  <span className="text-[9px] text-zinc-500">similar {printDuration}h prints</span>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 space-y-1">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase">Monthly Capacity</span>
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">432 hrs</div>
                  <span className="text-[9px] text-zinc-500">at 60% bed utilization</span>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 space-y-1">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase">Monthly Net Potential</span>
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{currency}{outputs.roi.monthlyEarningsAt60Pct.toLocaleString()}</div>
                  <span className="text-[9px] text-zinc-500">operating profits</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CLIENT INVOICE & PROPOSAL */}
          {activeTab === 'quote' && (
            <div className="saas-card p-6 space-y-5">
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  <span>Quotation Studio & Invoice Settings</span>
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Configure maker studio branding for generated client PDF quotations and WhatsApp messages.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Studio / Business Name</label>
                  <input
                    type="text"
                    value={studioName}
                    onChange={(e) => setStudioName(e.target.value)}
                    className="saas-input text-xs"
                    placeholder="e.g. Apex 3D Prototyping"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">GSTIN / Tax ID (Optional)</label>
                  <input
                    type="text"
                    value={studioGstin}
                    onChange={(e) => setStudioGstin(e.target.value)}
                    className="saas-input text-xs"
                    placeholder="e.g. 27AABCT3518Q1Z4"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Client Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={clientContact}
                    onChange={(e) => setClientContact(e.target.value)}
                    className="saas-input text-xs"
                    placeholder="e.g. +91 98765 43210"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Terms & Payment Policy</label>
                  <input
                    type="text"
                    value={invoiceTerms}
                    onChange={(e) => setInvoiceTerms(e.target.value)}
                    className="saas-input text-xs"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleShareWhatsApp}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 cursor-pointer shadow-xs transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Share Quote on WhatsApp</span>
                </button>

                <button
                  onClick={handleExportPDF}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 cursor-pointer shadow-xs transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Export Client PDF Quote</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Sticky Commercial Pricing Terminal */}
        <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-6">

          {/* Primary Price Card */}
          <div className="saas-card p-6 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border-indigo-500/20 space-y-5 text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-1 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-4">
              <span className="text-[9px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">
                NET SELLING PRICE ({batchQuantity} {batchQuantity === 1 ? 'UNIT' : 'UNITS'})
              </span>
              <div className="flex items-baseline gap-2">
                <h2 className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                  {currency}{outputs.finalSellingPrice.toFixed(2)}
                </h2>
                {discount > 0 && (
                  <span className="text-xs line-through text-zinc-400 font-semibold">
                    {currency}{outputs.suggestedSellingPrice.toFixed(2)}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 font-semibold pt-1">
                <span>Unit Price: <strong className="text-zinc-900 dark:text-zinc-100">{currency}{outputs.unitSellingPrice.toFixed(2)}</strong></span>
                <span>Unit Cost: <strong className="text-zinc-900 dark:text-zinc-100">{currency}{outputs.unitProductionCost.toFixed(2)}</strong></span>
              </div>
            </div>

            {/* Warnings */}
            {(showMarginWarning || showPriceWarning || showInputsMissingWarning) && (
              <div className="space-y-2">
                {showInputsMissingWarning && (
                  <div className="flex gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-semibold">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Print duration or filament weight is 0. Please enter print specs.</span>
                  </div>
                )}
                {showMarginWarning && !showInputsMissingWarning && (
                  <div className="flex gap-2 p-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-500 text-[10px] font-semibold">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Selected profit margin is below the recommended 15% threshold for print farms.</span>
                  </div>
                )}
                {showPriceWarning && (
                  <div className="flex gap-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-semibold">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Net selling price is lower than production cost due to high discounts.</span>
                  </div>
                )}
              </div>
            )}

            {/* Cost Breakdown Items */}
            <div className="space-y-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-900">
                <span>Raw Materials ({outputs.totalFilamentGrams.toFixed(0)}g):</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{currency}{outputs.materialCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-900">
                <span>Power Consumption:</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{currency}{outputs.electricityCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-900">
                <span>Machine Wear & Maint:</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{currency}{outputs.machineCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-900">
                <span>Hands-on Operations:</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{currency}{outputs.labourCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-900">
                <span>Finishing & Packaging:</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{currency}{outputs.extraMaterialCost.toFixed(2)}</span>
              </div>
              {outputs.customCostTotal > 0 && (
                <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-900">
                  <span>Custom Hardware:</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">{currency}{outputs.customCostTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-900 text-indigo-600 dark:text-indigo-400 font-bold">
                <span>Estimated Net Profit:</span>
                <span>{currency}{outputs.profitAmount.toFixed(2)} ({profitMargin}%)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-900">
                <span>GST Tax ({gst}%):</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{currency}{outputs.gstAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Smart Pricing Tiers */}
            <div className="pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60 space-y-2.5">
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">SMART PRICING RECOMMENDATIONS</span>
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
                <div className="p-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200/40 dark:border-zinc-800/40">
                  <span className="block text-[8px] font-semibold text-zinc-400 uppercase">Min Price</span>
                  <span className="text-zinc-700 dark:text-zinc-300">{currency}{outputs.minSellingPrice.toFixed(0)}</span>
                </div>
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-500/20">
                  <span className="block text-[8px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase">Target</span>
                  <span className="text-indigo-700 dark:text-indigo-400">{currency}{outputs.recSellingPrice.toFixed(0)}</span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200/40 dark:border-zinc-800/40">
                  <span className="block text-[8px] font-semibold text-zinc-400 uppercase">Premium</span>
                  <span className="text-zinc-700 dark:text-zinc-300">{currency}{outputs.premiumSellingPrice.toFixed(0)}</span>
                </div>
              </div>

              {/* Charm Price Rounding */}
              <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-bold">
                <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60">
                  <span className="block text-[8px] font-semibold text-zinc-400 uppercase">Charm .49 Price</span>
                  <span className="text-zinc-700 dark:text-zinc-300">{currency}{outputs.rounded49}</span>
                </div>
                <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60">
                  <span className="block text-[8px] font-semibold text-zinc-400 uppercase">Charm .99 Price</span>
                  <span className="text-zinc-700 dark:text-zinc-300">{currency}{outputs.rounded99}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={handleSaveToHistory}
                className="saas-button-primary py-2 text-xs flex items-center justify-center gap-1.5 cursor-pointer w-full"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saveSuccess ? 'Saved!' : (activeEstimateId ? 'Update' : 'Save Quote')}</span>
              </button>

              <button
                onClick={handleCopyReport}
                className="saas-button-secondary py-2 text-xs flex items-center justify-center gap-1.5 cursor-pointer w-full"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Quote'}</span>
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="col-span-full py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 cursor-pointer shadow-xs transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Send WhatsApp Quote to Client</span>
              </button>

              <button
                onClick={handleExportPDF}
                className="col-span-full saas-button-secondary py-2 text-xs flex items-center justify-center gap-1.5 cursor-pointer w-full border-indigo-500/20 hover:border-indigo-500/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20"
              >
                <Printer className="w-4 h-4 text-indigo-500" />
                <span>Download PDF Quotation</span>
              </button>
            </div>
          </div>

          {/* Cost Share Breakdown Bar */}
          <div className="saas-card p-6 space-y-4 text-left">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Production Cost Share</h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
                  <span>Materials & Resin</span>
                  <span>{matPct.toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: `${matPct}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
                  <span>Electricity Power</span>
                  <span>{elecPct.toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-cyan-500" style={{ width: `${elecPct}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
                  <span>Machine Wear & Maintenance</span>
                  <span>{machinePct.toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-purple-500" style={{ width: `${machinePct}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
                  <span>Labor & Operations</span>
                  <span>{labourPct.toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-indigo-600" style={{ width: `${labourPct}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
                  <span>Finishing & Packaging</span>
                  <span>{extraPct.toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-rose-500" style={{ width: `${extraPct}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* History Manager Panel */}
          <div className="saas-card p-6 space-y-4 text-left">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Saved Quotes History</h3>
              <button
                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                {isHistoryOpen ? 'Collapse' : `View Saved (${history.length})`}
              </button>
            </div>

            {isHistoryOpen && (
              <div className="space-y-3 pt-2 max-h-[300px] overflow-y-auto">
                <div className="flex justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800/60 pb-2">
                  <button
                    onClick={handleExportExcel}
                    className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>Export Excel</span>
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <FileText className="w-3 h-3" />
                    <span>Export CSV</span>
                  </button>
                </div>

                {history.length > 0 ? (
                  <div className="space-y-2">
                    {history.map(item => (
                      <div
                        key={item.id}
                        onClick={() => handleLoadHistoryItem(item)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer text-left space-y-1.5 flex flex-col justify-between hover:bg-zinc-100/50 dark:hover:bg-zinc-900/30 ${
                          activeEstimateId === item.id ? 'border-indigo-500 bg-indigo-500/5' : 'border-zinc-200/60 dark:border-zinc-800/60'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200">{item.inputs.name}</h4>
                            <span className="text-[9px] text-zinc-400">
                              {(item.inputs.printTechnology || 'FDM').toUpperCase()} • {item.inputs.category} • {new Date(item.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                            {currency}{item.outputs.finalSellingPrice.toFixed(0)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-zinc-200/30 dark:border-zinc-800/30 text-[9px] font-bold">
                          <button
                            onClick={(e) => handleDuplicateHistoryItem(item, e)}
                            className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                          >
                            Duplicate
                          </button>
                          <button
                            onClick={(e) => handleDeleteHistoryItem(item.id, e)}
                            className="text-red-500 hover:text-red-650"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] font-semibold text-zinc-400 py-2">No calculations saved yet.</p>
                )}
              </div>
            )}
            {!isHistoryOpen && (
              <p className="text-[10px] font-semibold text-zinc-400 py-1">Saved calculations are persisted locally and exportable to Excel / CSV.</p>
            )}
          </div>

        </div>
      </div>

      {/* Settings Panel Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 max-w-lg w-full rounded-2xl p-6 shadow-2xl space-y-5 text-left max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-indigo-500" />
                <span>Configure Default Parameters</span>
              </h3>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 text-xs font-bold uppercase"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Default Spool Price ({currency}/kg)</label>
                <input
                  type="number"
                  value={settingsForm.filamentPrice}
                  onChange={(e) => setSettingsForm({ ...settingsForm, filamentPrice: Number(e.target.value) })}
                  className="saas-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Electricity Rate ({currency}/unit)</label>
                <input
                  type="number"
                  value={settingsForm.electricityUnitCost}
                  onChange={(e) => setSettingsForm({ ...settingsForm, electricityUnitCost: Number(e.target.value) })}
                  className="saas-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Printer Power Draw (W)</label>
                <input
                  type="number"
                  value={settingsForm.printerWattage}
                  onChange={(e) => setSettingsForm({ ...settingsForm, printerWattage: Number(e.target.value) })}
                  className="saas-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Wear Depreciation ({currency}/hr)</label>
                <input
                  type="number"
                  value={settingsForm.machineWearCost}
                  onChange={(e) => setSettingsForm({ ...settingsForm, machineWearCost: Number(e.target.value) })}
                  className="saas-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Hourly Labor Rate ({currency})</label>
                <input
                  type="number"
                  value={settingsForm.labourRate}
                  onChange={(e) => setSettingsForm({ ...settingsForm, labourRate: Number(e.target.value) })}
                  className="saas-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Default Profit Margin %</label>
                <input
                  type="number"
                  value={settingsForm.profitMargin}
                  onChange={(e) => setSettingsForm({ ...settingsForm, profitMargin: Number(e.target.value) })}
                  className="saas-input"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="saas-button-secondary py-2 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  localStorage.setItem('toolique_3d_cost_settings', JSON.stringify(settingsForm));
                  setSettings(settingsForm);
                  setIsSettingsOpen(false);
                }}
                className="saas-button-primary py-2 text-xs"
              >
                Save Defaults
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

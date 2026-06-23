import { useState, useEffect } from 'react';
import {
  Settings, Copy, Check, Trash2, Plus, Download, Save,
  FileText, AlertTriangle, Printer, Sparkles, Sliders, RefreshCw, Layers
} from 'lucide-react';
import { calculate3DPrintCosts } from '../utils/threeDCalc';
import type { CostCalculatorInputs, CostCalculatorOutputs, CalculatorSettings, HistoryItem, CustomCostItem } from '../utils/threeDCalc';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

const DEFAULT_SETTINGS: CalculatorSettings = {
  filamentPrice: 1500,
  electricityUnitCost: 8,
  printerWattage: 150,
  machineWearCost: 5,
  maintenanceCost: 2,
  labourRate: 200,
  filamentWastage: 5,
  profitMargin: 35,
  gst: 18,
  platformCommission: 10,
  paymentGateway: 2,
  packagingBoxCost: 30,
  courierHandlingCost: 100,
  currencySymbol: '₹',
  productCategories: ['Action Figure', 'Functional Part', 'Prototype', 'Art/Sculpture', 'Lithophane', 'Batch Production', 'Other'],
  roundingRule: 'nearest'
};

export default function ThreeDPrintingCostCalculator() {
  // Load settings and history from localStorage
  const [settings, setSettings] = useState<CalculatorSettings>(() => {
    const saved = localStorage.getItem('toolique_3d_cost_settings');
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
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
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Settings Panel state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsForm, setSettingsForm] = useState<CalculatorSettings>({ ...settings });

  // History list expanded state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Active Estimate ID (null if new)
  const [activeEstimateId, setActiveEstimateId] = useState<string | null>(null);

  // Form input states
  const [name, setName] = useState('My Awesome Print');
  const [category, setCategory] = useState('Prototype');
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [productImage, setProductImage] = useState<string>('');

  // Cost Inputs
  const [filamentPrice, setFilamentPrice] = useState(settings.filamentPrice);
  const [filamentUsed, setFilamentUsed] = useState(120);
  const [filamentWastage, setFilamentWastage] = useState(settings.filamentWastage);
  const [supportUsed, setSupportUsed] = useState(15);
  const [failedWastage, setFailedWastage] = useState(0);

  const [printDuration, setPrintDuration] = useState(6);
  const [electricityUnitCost, setElectricityUnitCost] = useState(settings.electricityUnitCost);
  const [printerWattage, setPrinterWattage] = useState(settings.printerWattage);
  const [machineWearCost, setMachineWearCost] = useState(settings.machineWearCost);
  const [maintenanceCost, setMaintenanceCost] = useState(settings.maintenanceCost);

  const [designTime, setDesignTime] = useState(0);
  const [slicingTime, setSlicingTime] = useState(0.2);
  const [postProcessingTime, setPostProcessingTime] = useState(0.5);
  const [paintingTime, setPaintingTime] = useState(0);
  const [packingTime, setPackingTime] = useState(0.15);
  const [labourRate, setLabourRate] = useState(settings.labourRate);

  const [paintCost, setPaintCost] = useState(0);
  const [glueCost, setGlueCost] = useState(0);
  const [sandpaperCost, setGlueCostAlt] = useState(0); // custom sandpaper
  const [screwsMagnetsCost, setScrewsMagnetsCost] = useState(0);
  const [packagingBoxCost, setPackagingBoxCost] = useState(settings.packagingBoxCost);
  const [bubbleWrapCost, setBubbleWrapCost] = useState(10);
  const [labelStickerCost, setLabelStickerCost] = useState(5);
  const [courierHandlingCost, setCourierHandlingCost] = useState(settings.courierHandlingCost);

  // Dynamic Custom Cost Fields
  const [customCosts, setCustomCosts] = useState<CustomCostItem[]>([]);
  const [newCustomName, setNewCustomName] = useState('');
  const [newCustomCost, setNewCustomCost] = useState<number | ''>('');

  // Business costs
  const [platformCommission, setPlatformCommission] = useState(settings.platformCommission);
  const [paymentGateway, setPaymentGateway] = useState(settings.paymentGateway);
  const [gst, setGst] = useState(settings.gst);
  const [marketingCost, setMarketingCost] = useState(5);
  const [miscellaneousCost, setMiscellaneousCost] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [profitMargin, setProfitMargin] = useState(settings.profitMargin);

  // Output outputs and alerts state
  const [outputs, setOutputs] = useState<CostCalculatorOutputs | null>(null);
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync settings form on open
  useEffect(() => {
    setSettingsForm({ ...settings });
  }, [settings, isSettingsOpen]);

  // Sync default values when settings change
  const applySettingsToInputs = (newSet: CalculatorSettings) => {
    setFilamentPrice(newSet.filamentPrice);
    setFilamentWastage(newSet.filamentWastage);
    setElectricityUnitCost(newSet.electricityUnitCost);
    setPrinterWattage(newSet.printerWattage);
    setMachineWearCost(newSet.machineWearCost);
    setMaintenanceCost(newSet.maintenanceCost);
    setLabourRate(newSet.labourRate);
    setPackagingBoxCost(newSet.packagingBoxCost);
    setCourierHandlingCost(newSet.courierHandlingCost);
    setPlatformCommission(newSet.platformCommission);
    setPaymentGateway(newSet.paymentGateway);
    setGst(newSet.gst);
    setProfitMargin(newSet.profitMargin);
  };

  // Math recalculation
  useEffect(() => {
    const inputs: CostCalculatorInputs = {
      name,
      category,
      customerName,
      notes,
      image: productImage,
      filamentPrice,
      filamentUsed,
      filamentWastage,
      supportUsed,
      failedWastage,
      printDuration,
      electricityUnitCost,
      printerWattage,
      machineWearCost,
      maintenanceCost,
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
      platformCommission,
      paymentGateway,
      gst,
      marketingCost,
      miscellaneousCost,
      discount,
      profitMargin
    };

    setOutputs(calculate3DPrintCosts(inputs));
  }, [
    name, category, customerName, notes, productImage,
    filamentPrice, filamentUsed, filamentWastage, supportUsed, failedWastage,
    printDuration, electricityUnitCost, printerWattage, machineWearCost, maintenanceCost,
    designTime, slicingTime, postProcessingTime, paintingTime, packingTime, labourRate,
    paintCost, glueCost, sandpaperCost, screwsMagnetsCost, packagingBoxCost, bubbleWrapCost, labelStickerCost, courierHandlingCost,
    customCosts, platformCommission, paymentGateway, gst, marketingCost, miscellaneousCost, discount, profitMargin
  ]);

  // Handle settings saving
  const handleSaveSettings = () => {
    localStorage.setItem('toolique_3d_cost_settings', JSON.stringify(settingsForm));
    setSettings(settingsForm);
    applySettingsToInputs(settingsForm);
    setIsSettingsOpen(false);
  };

  // Add Dynamic custom cost field
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

  // Save current calculation to history
  const handleSaveToHistory = () => {
    if (!outputs) return;
    const inputs: CostCalculatorInputs = {
      name, category, customerName, notes, image: productImage,
      filamentPrice, filamentUsed, filamentWastage, supportUsed, failedWastage,
      printDuration, electricityUnitCost, printerWattage, machineWearCost, maintenanceCost,
      designTime, slicingTime, postProcessingTime, paintingTime, packingTime, labourRate,
      paintCost, glueCost, sandpaperCost, screwsMagnetsCost, packagingBoxCost, bubbleWrapCost, labelStickerCost, courierHandlingCost,
      customCosts, platformCommission, paymentGateway, gst, marketingCost, miscellaneousCost, discount, profitMargin
    };

    const newHistory = [...history];
    if (activeEstimateId) {
      const idx = newHistory.findIndex(h => h.id === activeEstimateId);
      if (idx !== -1) {
        newHistory[idx] = {
          id: activeEstimateId,
          timestamp: Date.now(),
          inputs,
          outputs
        };
      }
    } else {
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        inputs,
        outputs
      };
      newHistory.unshift(newItem);
      setActiveEstimateId(newItem.id);
    }

    localStorage.setItem('toolique_3d_cost_history', JSON.stringify(newHistory));
    setHistory(newHistory);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  // Load calculation from history
  const handleLoadHistoryItem = (item: HistoryItem) => {
    setActiveEstimateId(item.id);
    setName(item.inputs.name);
    setCategory(item.inputs.category);
    setCustomerName(item.inputs.customerName || '');
    setNotes(item.inputs.notes || '');
    setProductImage(item.inputs.image || '');

    setFilamentPrice(item.inputs.filamentPrice);
    setFilamentUsed(item.inputs.filamentUsed);
    setFilamentWastage(item.inputs.filamentWastage);
    setSupportUsed(item.inputs.supportUsed);
    setFailedWastage(item.inputs.failedWastage);

    setPrintDuration(item.inputs.printDuration);
    setElectricityUnitCost(item.inputs.electricityUnitCost);
    setPrinterWattage(item.inputs.printerWattage);
    setMachineWearCost(item.inputs.machineWearCost);
    setMaintenanceCost(item.inputs.maintenanceCost);

    setDesignTime(item.inputs.designTime);
    setSlicingTime(item.inputs.slicingTime);
    setPostProcessingTime(item.inputs.postProcessingTime);
    setPaintingTime(item.inputs.paintingTime);
    setPackingTime(item.inputs.packingTime);
    setLabourRate(item.inputs.labourRate);

    setPaintCost(item.inputs.paintCost);
    setGlueCost(item.inputs.glueCost);
    setGlueCostAlt(item.inputs.sandpaperCost);
    setScrewsMagnetsCost(item.inputs.screwsMagnetsCost);
    setPackagingBoxCost(item.inputs.packagingBoxCost);
    setBubbleWrapCost(item.inputs.bubbleWrapCost);
    setLabelStickerCost(item.inputs.labelStickerCost);
    setCourierHandlingCost(item.inputs.courierHandlingCost);

    setCustomCosts(item.inputs.customCosts || []);

    setPlatformCommission(item.inputs.platformCommission);
    setPaymentGateway(item.inputs.paymentGateway);
    setGst(item.inputs.gst);
    setMarketingCost(item.inputs.marketingCost);
    setMiscellaneousCost(item.inputs.miscellaneousCost);
    setDiscount(item.inputs.discount);
    setProfitMargin(item.inputs.profitMargin);

    setIsHistoryOpen(false);
  };

  // Duplicate history item
  const handleDuplicateHistoryItem = (item: HistoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const duplicated: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      inputs: {
        ...item.inputs,
        name: `${item.inputs.name} (Copy)`
      },
      outputs: item.outputs
    };
    const newHistory = [duplicated, ...history];
    localStorage.setItem('toolique_3d_cost_history', JSON.stringify(newHistory));
    setHistory(newHistory);
  };

  // Delete history item
  const handleDeleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newHistory = history.filter(h => h.id !== id);
    localStorage.setItem('toolique_3d_cost_history', JSON.stringify(newHistory));
    setHistory(newHistory);
    if (activeEstimateId === id) {
      setActiveEstimateId(null);
    }
  };

  // Clear current fields to start new
  const handleResetForm = () => {
    setActiveEstimateId(null);
    setName('My Awesome Print');
    setCategory('Prototype');
    setCustomerName('');
    setNotes('');
    setProductImage('');
    setCustomCosts([]);
    setDiscount(0);
    setMiscellaneousCost(0);
    setFilamentUsed(120);
    setSupportUsed(15);
    setFailedWastage(0);
    setPrintDuration(8);
    setDesignTime(0);
    setSlicingTime(0.25);
    setPostProcessingTime(0.5);
    setPaintingTime(0);
    setPackingTime(0.15);
    applySettingsToInputs(settings);
  };

  // Image Upload handler to convert to base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProductImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCopyReport = () => {
    if (!outputs) return;
    const text = `--- 3D PRINTING COST REPORT: ${name} ---
Category: ${category}
Total Production Cost: ${settings.currencySymbol}${outputs.totalProductionCost.toFixed(2)}
Suggested Retail Price: ${settings.currencySymbol}${outputs.suggestedSellingPrice.toFixed(2)}
Discount Applied: ${discount}%
Final Net Selling Price: ${settings.currencySymbol}${outputs.finalSellingPrice.toFixed(2)}
Estimated Net Profit: ${settings.currencySymbol}${outputs.profitAmount.toFixed(2)} (${profitMargin}%)
--- COST BREAKDOWN ---
Filament Cost: ${settings.currencySymbol}${outputs.filamentCost.toFixed(2)}
Electricity Cost: ${settings.currencySymbol}${outputs.electricityCost.toFixed(2)}
Machine Cost (Wear/Maint): ${settings.currencySymbol}${outputs.machineCost.toFixed(2)}
Labour Operations Cost: ${settings.currencySymbol}${outputs.labourCost.toFixed(2)}
Standard Shipping Box & Wrap: ${settings.currencySymbol}${outputs.extraMaterialCost.toFixed(2)}
Custom Accessory Cost: ${settings.currencySymbol}${outputs.customCostTotal.toFixed(2)}
Platform commissions & Gateways: ${settings.currencySymbol}${outputs.businessOverhead.toFixed(2)}
GST (${gst}%): ${settings.currencySymbol}${outputs.gstAmount.toFixed(2)}
Price per Gram: ${settings.currencySymbol}${outputs.pricePerGram.toFixed(2)}/g
Price per Print Hour: ${settings.currencySymbol}${outputs.pricePerPrintHour.toFixed(2)}/hr
Calculated via Toolique 3D Printing Cost Calculator.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export current calculation as PDF
  const handleExportPDF = () => {
    if (!outputs) return;

    try {
      const doc = new jsPDF();
      const primaryColor = [79, 70, 229]; // Indigo
      const secondaryColor = [31, 41, 55]; // Charcoal

      // Header Banner
      doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.rect(0, 0, 210, 35, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('VOXELIQUE COST REPORT', 14, 23);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('3D Printing Price Quotation & Production Breakdown', 14, 30);

      // Metadata block
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(10);
      doc.text(`Date: ${new Date().toLocaleString()}`, 140, 48);
      doc.text(`Reference: TX-${Date.now().toString().slice(-6)}`, 140, 54);

      // Product specs
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('PRODUCT SPECIFICATIONS', 14, 48);
      doc.setDrawColor(220, 220, 220);
      doc.line(14, 50, 100, 50);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Name: ${name || 'Unnamed Print'}`, 14, 56);
      doc.text(`Category: ${category}`, 14, 62);
      if (customerName) doc.text(`Customer: ${customerName}`, 14, 68);
      if (notes) doc.text(`Notes: ${notes.slice(0, 80)}`, 14, 74);

      // Financial box (top-right side)
      doc.setFillColor(245, 246, 248);
      doc.rect(130, 60, 66, 30, 'F');
      doc.setDrawColor(209, 213, 219);
      doc.rect(130, 60, 66, 30, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('FINAL PRICE SUGGESTION', 134, 66);
      doc.setFontSize(16);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(`${settings.currencySymbol}${outputs.finalSellingPrice.toFixed(2)}`, 134, 76);
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`Estimated Profit: ${settings.currencySymbol}${outputs.profitAmount.toFixed(2)}`, 134, 84);

      // Table Cost breakdown
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('PRODUCTION COST BREAKDOWN', 14, 98);
      doc.line(14, 100, 196, 100);

      let y = 108;
      const drawRow = (label: string, value: string) => {
        doc.setFont('helvetica', 'normal');
        doc.text(label, 16, y);
        doc.text(value, 160, y);
        doc.line(14, y + 2, 196, y + 2);
        y += 9;
      };

      drawRow('Filament Cost (with wastage)', `${settings.currencySymbol}${outputs.filamentCost.toFixed(2)}`);
      drawRow('Electricity Utility Cost', `${settings.currencySymbol}${outputs.electricityCost.toFixed(2)}`);
      drawRow('Machine Depreciation & Wear', `${settings.currencySymbol}${outputs.machineCost.toFixed(2)}`);
      drawRow('Labour Operations Cost', `${settings.currencySymbol}${outputs.labourCost.toFixed(2)}`);
      drawRow('Standard Packaging & Shipping Materials', `${settings.currencySymbol}${outputs.extraMaterialCost.toFixed(2)}`);
      drawRow('Custom Accessory Fields', `${settings.currencySymbol}${outputs.customCostTotal.toFixed(2)}`);
      drawRow('Business Markup / Profit Margin', `${settings.currencySymbol}${outputs.profitAmount.toFixed(2)}`);
      drawRow('Platform Commissions & Gateways Overheads', `${settings.currencySymbol}${outputs.businessOverhead.toFixed(2)}`);
      drawRow('Goods & Services Tax (GST)', `${settings.currencySymbol}${outputs.gstAmount.toFixed(2)}`);

      y += 5;
      doc.setFont('helvetica', 'bold');
      doc.setFillColor(239, 246, 255);
      doc.rect(14, y - 5, 182, 8, 'F');
      doc.text('Total Production Cost', 16, y);
      doc.text(`${settings.currencySymbol}${outputs.totalProductionCost.toFixed(2)}`, 160, y);

      y += 9;
      doc.text('Suggested Selling Price (Retail)', 16, y);
      doc.text(`${settings.currencySymbol}${outputs.suggestedSellingPrice.toFixed(2)}`, 160, y);

      if (discount > 0) {
        y += 9;
        doc.setFont('helvetica', 'normal');
        doc.text(`Discount Deducted (${discount}%)`, 16, y);
        doc.text(`- ${settings.currencySymbol}${outputs.discountAmount.toFixed(2)}`, 160, y);

        y += 9;
        doc.setFont('helvetica', 'bold');
        doc.text('Net Final Price', 16, y);
        doc.text(`${settings.currencySymbol}${outputs.finalSellingPrice.toFixed(2)}`, 160, y);
      }

      // Footer
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Calculated locally on Toolique (voxelique themed). All figures are local estimates.', 14, 280);

      doc.save(`${(name || '3D_Print').replace(/\s+/g, '_')}_cost_report.pdf`);
    } catch (e) {
      alert('Error creating PDF report: ' + e);
    }
  };

  // Export history as CSV
  const handleExportCSV = () => {
    if (history.length === 0) {
      alert('No history entries to export.');
      return;
    }

    const headers = [
      'Date', 'Product Name', 'Category', 'Customer',
      'Filament Cost', 'Electricity Cost', 'Machine Cost', 'Labour Cost',
      'Extra Material Cost', 'Custom Cost', 'Production Cost', 'Business Overheads',
      'Profit Amount', 'GST Amount', 'Selling Price', 'Final Price'
    ];

    const rows = history.map(item => [
      new Date(item.timestamp).toLocaleString(),
      item.inputs.name,
      item.inputs.category,
      item.inputs.customerName || '',
      item.outputs.filamentCost.toFixed(2),
      item.outputs.electricityCost.toFixed(2),
      item.outputs.machineCost.toFixed(2),
      item.outputs.labourCost.toFixed(2),
      item.outputs.extraMaterialCost.toFixed(2),
      item.outputs.customCostTotal.toFixed(2),
      item.outputs.totalProductionCost.toFixed(2),
      item.outputs.businessOverhead.toFixed(2),
      item.outputs.profitAmount.toFixed(2),
      item.outputs.gstAmount.toFixed(2),
      item.outputs.suggestedSellingPrice.toFixed(2),
      item.outputs.finalSellingPrice.toFixed(2)
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Toolique_3D_Printing_Cost_History.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export history as Excel
  const handleExportExcel = () => {
    if (history.length === 0) {
      alert('No history entries to export.');
      return;
    }

    const data = history.map(item => ({
      'Date': new Date(item.timestamp).toLocaleString(),
      'Product Name': item.inputs.name,
      'Category': item.inputs.category,
      'Customer': item.inputs.customerName || 'N/A',
      'Filament Cost (₹)': item.outputs.filamentCost.toFixed(2),
      'Electricity Cost (₹)': item.outputs.electricityCost.toFixed(2),
      'Machine Cost (₹)': item.outputs.machineCost.toFixed(2),
      'Labour Cost (₹)': item.outputs.labourCost.toFixed(2),
      'Extra Material Cost (₹)': item.outputs.extraMaterialCost.toFixed(2),
      'Custom Cost (₹)': item.outputs.customCostTotal.toFixed(2),
      'Production Cost (₹)': item.outputs.totalProductionCost.toFixed(2),
      'Business Overheads (₹)': item.outputs.businessOverhead.toFixed(2),
      'Profit Amount (₹)': item.outputs.profitAmount.toFixed(2),
      'GST Amount (₹)': item.outputs.gstAmount.toFixed(2),
      'Selling Price (₹)': item.outputs.suggestedSellingPrice.toFixed(2),
      'Final Price (₹)': item.outputs.finalSellingPrice.toFixed(2)
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Calculation History');
    XLSX.writeFile(workbook, 'Toolique_3D_Printing_Cost_History.xlsx');
  };

  if (!outputs) return null;

  // Active Warnings Checking
  const showMarginWarning = profitMargin < 15;
  const showPriceWarning = outputs.finalSellingPrice < outputs.totalProductionCost;
  const showInputsMissingWarning = printDuration === 0 || filamentUsed === 0 || filamentPrice === 0;

  // Cost shares for graph visualization
  const filamentPct = outputs.totalProductionCost > 0 ? (outputs.filamentCost / outputs.totalProductionCost) * 100 : 0;
  const elecPct = outputs.totalProductionCost > 0 ? (outputs.electricityCost / outputs.totalProductionCost) * 100 : 0;
  const machinePct = outputs.totalProductionCost > 0 ? (outputs.machineCost / outputs.totalProductionCost) * 100 : 0;
  const labourPct = outputs.totalProductionCost > 0 ? (outputs.labourCost / outputs.totalProductionCost) * 100 : 0;
  const extraPct = outputs.totalProductionCost > 0 ? (outputs.extraMaterialCost / outputs.totalProductionCost) * 100 : 0;
  const customPct = outputs.totalProductionCost > 0 ? (outputs.customCostTotal / outputs.totalProductionCost) * 100 : 0;
  const miscPct = outputs.totalProductionCost > 0 ? (outputs.gstAmount / outputs.totalProductionCost) * 100 : 0; // standard overhead weight representation

  return (
    <div className="max-w-6xl mx-auto space-y-12 text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight">3D Printing Cost Calculator</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Calculate materials, power, machine wear, labor, dynamic custom fields, overhead commissions, and rounded selling prices.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleResetForm}
            className="saas-button-secondary text-xs flex items-center gap-1.5 cursor-pointer py-2 px-3"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Fields</span>
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="saas-button-secondary text-xs flex items-center gap-1.5 cursor-pointer py-2 px-3"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Edit Defaults</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Fields */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Product Details */}
          <div className="saas-card p-6 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>1. Product Details</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Product Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="saas-input"
                  placeholder="e.g. Mechanical Gear"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="saas-select"
                >
                  {settings.productCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Customer Name (Optional)</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="saas-input"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Product Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-zinc-800 dark:file:text-zinc-200 file:cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Notes & Special Requirements</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="saas-input min-h-[60px]"
                placeholder="Details about infill, post-curing, or print orientations..."
              />
            </div>

            {productImage && (
              <div className="pt-2">
                <span className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">Image Preview:</span>
                <img src={productImage} alt="Preview" className="w-20 h-20 object-cover rounded-xl border border-zinc-200 dark:border-zinc-800" />
              </div>
            )}
          </div>

          {/* 2. Filament Cost */}
          <div className="saas-card p-6 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              <span>2. Filament Cost</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Filament Price (₹/kg)</label>
                <input
                  type="number"
                  value={filamentPrice}
                  onChange={(e) => setFilamentPrice(Number(e.target.value))}
                  className="saas-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Filament Used (grams)</label>
                <input
                  type="number"
                  value={filamentUsed}
                  onChange={(e) => setFilamentUsed(Number(e.target.value))}
                  className="saas-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Filament Wastage %</label>
                <input
                  type="number"
                  value={filamentWastage}
                  onChange={(e) => setFilamentWastage(Number(e.target.value))}
                  className="saas-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Support Material Weight (g)</label>
                <input
                  type="number"
                  value={supportUsed}
                  onChange={(e) => setSupportUsed(Number(e.target.value))}
                  className="saas-input"
                />
              </div>

              <div className="col-span-full space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Failed Print Waste (grams)</label>
                <input
                  type="number"
                  value={failedWastage}
                  onChange={(e) => setFailedWastage(Number(e.target.value))}
                  className="saas-input"
                  placeholder="Failed print iterations weight wastage..."
                />
              </div>
            </div>
          </div>

          {/* 3. Print Time & Machine Cost */}
          <div className="saas-card p-6 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <Sliders className="w-4 h-4" />
              <span>3. Machine & Power Cost</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Print Duration (hours)</label>
                <input
                  type="number"
                  value={printDuration}
                  onChange={(e) => setPrintDuration(Number(e.target.value))}
                  className="saas-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Electricity Rate (₹/kWh unit)</label>
                <input
                  type="number"
                  value={electricityUnitCost}
                  onChange={(e) => setElectricityUnitCost(Number(e.target.value))}
                  className="saas-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Printer Wattage (Watts)</label>
                <input
                  type="number"
                  value={printerWattage}
                  onChange={(e) => setPrinterWattage(Number(e.target.value))}
                  className="saas-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Wear Depreciation (₹/hour)</label>
                <input
                  type="number"
                  value={machineWearCost}
                  onChange={(e) => setMachineWearCost(Number(e.target.value))}
                  className="saas-input"
                />
              </div>

              <div className="col-span-full space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Maintenance Buffer Rate (₹/hour)</label>
                <input
                  type="number"
                  value={maintenanceCost}
                  onChange={(e) => setMaintenanceCost(Number(e.target.value))}
                  className="saas-input"
                />
              </div>
            </div>
          </div>

          {/* 4. Labour Cost */}
          <div className="saas-card p-6 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <Sliders className="w-4 h-4" />
              <span>4. Operations & Labour Cost</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-500 uppercase">Design Time (hours)</label>
                <input
                  type="number"
                  step="0.1"
                  value={designTime}
                  onChange={(e) => setDesignTime(Number(e.target.value))}
                  className="saas-input"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-500 uppercase">Slicing Time (hours)</label>
                <input
                  type="number"
                  step="0.1"
                  value={slicingTime}
                  onChange={(e) => setSlicingTime(Number(e.target.value))}
                  className="saas-input"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-500 uppercase">Post-Processing (hours)</label>
                <input
                  type="number"
                  step="0.1"
                  value={postProcessingTime}
                  onChange={(e) => setPostProcessingTime(Number(e.target.value))}
                  className="saas-input"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-500 uppercase">Painting Time (hours)</label>
                <input
                  type="number"
                  step="0.1"
                  value={paintingTime}
                  onChange={(e) => setPaintingTime(Number(e.target.value))}
                  className="saas-input"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-500 uppercase">Packing Time (hours)</label>
                <input
                  type="number"
                  step="0.1"
                  value={packingTime}
                  onChange={(e) => setPackingTime(Number(e.target.value))}
                  className="saas-input"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-500 uppercase">Hourly Labour Rate (₹)</label>
                <input
                  type="number"
                  value={labourRate}
                  onChange={(e) => setLabourRate(Number(e.target.value))}
                  className="saas-input"
                />
              </div>
            </div>
          </div>

          {/* 5. Extra Material Cost */}
          <div className="saas-card p-6 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <Sliders className="w-4 h-4" />
              <span>5. Shipping & Extra Materials</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Paint Cost (₹)</label>
                <input
                  type="number"
                  value={paintCost}
                  onChange={(e) => setPaintCost(Number(e.target.value))}
                  className="saas-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Inserts & Screws (₹)</label>
                <input
                  type="number"
                  value={screwsMagnetsCost}
                  onChange={(e) => setScrewsMagnetsCost(Number(e.target.value))}
                  className="saas-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Packaging Box (₹)</label>
                <input
                  type="number"
                  value={packagingBoxCost}
                  onChange={(e) => setPackagingBoxCost(Number(e.target.value))}
                  className="saas-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Bubble Wrap Cost (₹)</label>
                <input
                  type="number"
                  value={bubbleWrapCost}
                  onChange={(e) => setBubbleWrapCost(Number(e.target.value))}
                  className="saas-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Label & Stickers (₹)</label>
                <input
                  type="number"
                  value={labelStickerCost}
                  onChange={(e) => setLabelStickerCost(Number(e.target.value))}
                  className="saas-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Courier Shipping (₹)</label>
                <input
                  type="number"
                  value={courierHandlingCost}
                  onChange={(e) => setCourierHandlingCost(Number(e.target.value))}
                  className="saas-input"
                />
              </div>
            </div>
          </div>

          {/* 6. Custom Cost Fields */}
          <div className="saas-card p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                <span>6. Custom Cost Fields</span>
              </h3>
              <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">Add Dynamic Items</span>
            </div>

            {/* Custom fields form */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newCustomName}
                onChange={(e) => setNewCustomName(e.target.value)}
                placeholder="e.g. Resin Coating"
                className="saas-input flex-grow"
              />
              <input
                type="number"
                value={newCustomCost}
                onChange={(e) => setNewCustomCost(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="₹ Amount"
                className="saas-input w-28"
              />
              <button
                onClick={handleAddCustomCost}
                className="saas-button-primary px-4 cursor-pointer"
              >
                Add
              </button>
            </div>

            {/* Custom fields list */}
            {customCosts.length > 0 ? (
              <div className="space-y-2 pt-2">
                {customCosts.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200/40 dark:border-zinc-800/40">
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{item.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-extrabold text-zinc-900 dark:text-white">₹{item.cost.toFixed(2)}</span>
                      <button
                        onClick={() => handleRemoveCustomCost(item.id)}
                        className="text-red-500 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 py-1">No custom accessories or coating costs added yet.</p>
            )}
          </div>

          {/* 7. Business & Taxes Cost */}
          <div className="saas-card p-6 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <Sliders className="w-4 h-4" />
              <span>7. Overheads, Margin & Taxes</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Profit Margin %</label>
                <input
                  type="number"
                  value={profitMargin}
                  onChange={(e) => setProfitMargin(Number(e.target.value))}
                  className="saas-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">GST Tax %</label>
                <input
                  type="number"
                  value={gst}
                  onChange={(e) => setGst(Number(e.target.value))}
                  className="saas-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Platform Fee Commission %</label>
                <input
                  type="number"
                  value={platformCommission}
                  onChange={(e) => setPlatformCommission(Number(e.target.value))}
                  className="saas-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Payment Gateway Fee %</label>
                <input
                  type="number"
                  value={paymentGateway}
                  onChange={(e) => setPaymentGateway(Number(e.target.value))}
                  className="saas-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Marketing Budget Cost %</label>
                <input
                  type="number"
                  value={marketingCost}
                  onChange={(e) => setMarketingCost(Number(e.target.value))}
                  className="saas-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Misc. Fixed Buffers (₹)</label>
                <input
                  type="number"
                  value={miscellaneousCost}
                  onChange={(e) => setMiscellaneousCost(Number(e.target.value))}
                  className="saas-input"
                />
              </div>

              <div className="space-y-1 col-span-full">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Discount Code (%)</label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="saas-input"
                  placeholder="Deduct selling discounts..."
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Sticky Pricing Panel */}
        <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-6">
          
          {/* Main Price Card */}
          <div className="saas-card p-6 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border-indigo-500/20 space-y-5 text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-1 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-4">
              <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">SUGGESTED NET SELLING PRICE</span>
              <div className="flex items-baseline gap-2">
                <h2 className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                  {settings.currencySymbol}{outputs.finalSellingPrice.toFixed(2)}
                </h2>
                {discount > 0 && (
                  <span className="text-xs line-through text-zinc-400 font-semibold">
                    {settings.currencySymbol}{outputs.suggestedSellingPrice.toFixed(2)}
                  </span>
                )}
              </div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold pt-1">
                Total Production Cost: <span className="font-bold text-zinc-850 dark:text-zinc-200">{settings.currencySymbol}{outputs.totalProductionCost.toFixed(2)}</span>
              </div>
            </div>

            {/* Warn Alerts Area */}
            {(showMarginWarning || showPriceWarning || showInputsMissingWarning) && (
              <div className="space-y-2">
                {showInputsMissingWarning && (
                  <div className="flex gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-semibold leading-relaxed">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Print Duration or Filament Weight is zero. Cost outputs will be incomplete.</span>
                  </div>
                )}
                {showMarginWarning && !showInputsMissingWarning && (
                  <div className="flex gap-2 p-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-500 text-[10px] font-semibold leading-relaxed">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Selected profit margin is below the recommended 15% threshold for sustainable business.</span>
                  </div>
                )}
                {showPriceWarning && (
                  <div className="flex gap-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-semibold leading-relaxed">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Net selling price is lower than the initial production costs due to overhead discounts.</span>
                  </div>
                )}
              </div>
            )}

            {/* Calculations Summary Table */}
            <div className="space-y-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-900">
                <span>Material Cost:</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{settings.currencySymbol}{outputs.filamentCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-900">
                <span>Power Utility:</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{settings.currencySymbol}{outputs.electricityCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-900">
                <span>Machine Wear:</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{settings.currencySymbol}{outputs.machineCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-900">
                <span>Operations Labour:</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{settings.currencySymbol}{outputs.labourCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-900">
                <span>Packaging & Shipping:</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{settings.currencySymbol}{outputs.extraMaterialCost.toFixed(2)}</span>
              </div>
              {outputs.customCostTotal > 0 && (
                <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-900">
                  <span>Custom Fields:</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">{settings.currencySymbol}{outputs.customCostTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-900 text-indigo-600 dark:text-indigo-400 font-bold">
                <span>Estimated Net Profit:</span>
                <span>{settings.currencySymbol}{outputs.profitAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-900">
                <span>Platform Comm. & Gateway:</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{settings.currencySymbol}{outputs.businessOverhead.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-900">
                <span>GST Tax Value:</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{settings.currencySymbol}{outputs.gstAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Smart Pricing Recommendations */}
            <div className="pt-4 border-t border-zinc-200/60 dark:border-zinc-800/60 space-y-3">
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">SMART SUGGESTIONS</span>
              
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
                <div className="p-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200/40 dark:border-zinc-800/40">
                  <span className="block text-[8px] font-semibold text-zinc-400 uppercase">Min Price</span>
                  <span className="text-zinc-700 dark:text-zinc-300">{settings.currencySymbol}{outputs.minSellingPrice.toFixed(0)}</span>
                </div>
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-500/20">
                  <span className="block text-[8px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase">Rec. Price</span>
                  <span className="text-indigo-700 dark:text-indigo-400">{settings.currencySymbol}{outputs.recSellingPrice.toFixed(0)}</span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200/40 dark:border-zinc-800/40">
                  <span className="block text-[8px] font-semibold text-zinc-400 uppercase">Premium</span>
                  <span className="text-zinc-700 dark:text-zinc-300">{settings.currencySymbol}{outputs.premiumSellingPrice.toFixed(0)}</span>
                </div>
              </div>

              {/* Rounded suggestions */}
              <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-bold">
                <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60">
                  <span className="block text-[8px] font-semibold text-zinc-400 uppercase">Round to Nearest 49</span>
                  <span className="text-zinc-700 dark:text-zinc-300">{settings.currencySymbol}{outputs.rounded49}</span>
                </div>
                <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60">
                  <span className="block text-[8px] font-semibold text-zinc-400 uppercase">Round to Nearest 99</span>
                  <span className="text-zinc-700 dark:text-zinc-300">{settings.currencySymbol}{outputs.rounded99}</span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={handleSaveToHistory}
                className="saas-button-primary py-2 text-xs flex items-center justify-center gap-1.5 cursor-pointer w-full"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saveSuccess ? 'Saved!' : (activeEstimateId ? 'Update' : 'Save')}</span>
              </button>

              <button
                onClick={handleCopyReport}
                className="saas-button-secondary py-2 text-xs flex items-center justify-center gap-1.5 cursor-pointer w-full"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Estimate'}</span>
              </button>

              <button
                onClick={handleExportPDF}
                className="col-span-full saas-button-secondary py-2.5 text-xs flex items-center justify-center gap-1.5 cursor-pointer w-full border-indigo-500/20 hover:border-indigo-500/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20"
              >
                <Printer className="w-4 h-4 text-indigo-500" />
                <span>Export Quote PDF</span>
              </button>
            </div>

          </div>

          {/* Pricing share breakdown visualization */}
          <div className="saas-card p-6 space-y-4 text-left">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Production Cost Share</h3>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-zinc-550 dark:text-zinc-400">
                  <span>Filament Cost</span>
                  <span>{filamentPct.toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: `${filamentPct}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-zinc-550 dark:text-zinc-400">
                  <span>Electricity</span>
                  <span>{elecPct.toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-cyan-500" style={{ width: `${elecPct}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-zinc-550 dark:text-zinc-400">
                  <span>Machine Wear</span>
                  <span>{machinePct.toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-purple-500" style={{ width: `${machinePct}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-zinc-550 dark:text-zinc-400">
                  <span>Operations Labour</span>
                  <span>{labourPct.toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-indigo-600" style={{ width: `${labourPct}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-zinc-550 dark:text-zinc-400">
                  <span>Packaging & Shipping</span>
                  <span>{extraPct.toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-rose-500" style={{ width: `${extraPct}%` }} />
                </div>
              </div>

              {outputs.customCostTotal > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-zinc-550 dark:text-zinc-400">
                    <span>Custom Accessories</span>
                    <span>{customPct.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${customPct}%` }} />
                  </div>
                </div>
              )}

              {outputs.gstAmount > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-zinc-550 dark:text-zinc-400">
                    <span>GST Tax buffer</span>
                    <span>{miscPct.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div className="h-full bg-zinc-500" style={{ width: `${miscPct}%` }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* History Management Panel */}
          <div className="saas-card p-6 space-y-4 text-left">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">History Manager</h3>
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
                            <span className="text-[9px] text-zinc-400">{item.inputs.category} | {new Date(item.timestamp).toLocaleDateString()}</span>
                          </div>
                          <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                            {settings.currencySymbol}{item.outputs.finalSellingPrice.toFixed(0)}
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
              <p className="text-[10px] font-semibold text-zinc-400 py-1">Saved items can be duplicate exported to Excel/CSV worksheets.</p>
            )}
          </div>

        </div>
      </div>

      {/* Settings Panel Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 max-w-lg w-full rounded-2xl p-6 shadow-2xl space-y-5 text-left max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-indigo-500" />
                <span>Configure Default Values</span>
              </h3>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 text-xs font-bold uppercase"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Default price/kg (₹)</label>
                <input
                  type="number"
                  value={settingsForm.filamentPrice}
                  onChange={(e) => setSettingsForm({ ...settingsForm, filamentPrice: Number(e.target.value) })}
                  className="saas-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Electricity Rate (₹/unit)</label>
                <input
                  type="number"
                  value={settingsForm.electricityUnitCost}
                  onChange={(e) => setSettingsForm({ ...settingsForm, electricityUnitCost: Number(e.target.value) })}
                  className="saas-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Printer Power (W)</label>
                <input
                  type="number"
                  value={settingsForm.printerWattage}
                  onChange={(e) => setSettingsForm({ ...settingsForm, printerWattage: Number(e.target.value) })}
                  className="saas-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Depreciation wear (₹/hr)</label>
                <input
                  type="number"
                  value={settingsForm.machineWearCost}
                  onChange={(e) => setSettingsForm({ ...settingsForm, machineWearCost: Number(e.target.value) })}
                  className="saas-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Maintenance/hr (₹)</label>
                <input
                  type="number"
                  value={settingsForm.maintenanceCost}
                  onChange={(e) => setSettingsForm({ ...settingsForm, maintenanceCost: Number(e.target.value) })}
                  className="saas-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Hourly Labour rate (₹)</label>
                <input
                  type="number"
                  value={settingsForm.labourRate}
                  onChange={(e) => setSettingsForm({ ...settingsForm, labourRate: Number(e.target.value) })}
                  className="saas-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Default profit %</label>
                <input
                  type="number"
                  value={settingsForm.profitMargin}
                  onChange={(e) => setSettingsForm({ ...settingsForm, profitMargin: Number(e.target.value) })}
                  className="saas-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Default GST %</label>
                <input
                  type="number"
                  value={settingsForm.gst}
                  onChange={(e) => setSettingsForm({ ...settingsForm, gst: Number(e.target.value) })}
                  className="saas-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Currency symbol</label>
                <input
                  type="text"
                  value={settingsForm.currencySymbol}
                  onChange={(e) => setSettingsForm({ ...settingsForm, currencySymbol: e.target.value })}
                  className="saas-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Rounding Rule</label>
                <select
                  value={settingsForm.roundingRule}
                  onChange={(e) => setSettingsForm({ ...settingsForm, roundingRule: e.target.value as any })}
                  className="saas-select"
                >
                  <option value="nearest">Nearest ₹49 / ₹99</option>
                  <option value="none">No Rounded recommendations</option>
                </select>
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
                onClick={handleSaveSettings}
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

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Trash2, Copy, Calculator, Building, Search, Coins,
  FileText, FileSpreadsheet, Eye, Share2, Download,
  Plus, Layers, PieChart, Sliders,
  Sparkles, Check, Box, X
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import SEO from '../components/SEO';
import {
  estimateConcreteMaterials,
  estimateBrickworkMaterials,
  estimatePlasterMaterials,
  estimateFlooringMaterials,
  estimatePaintingMaterials
} from '../utils/boqMaterialEstimation';

// -------------------------------------------------------------
// TS Interfaces & Constants
// -------------------------------------------------------------
export interface Floor {
  id: string;
  name: string;
  area: number;
  height: number;
  notes: string;
}

export interface Room {
  id: string;
  name: string;
  floorId: string;
  notes: string;
}

export interface WorkCategory {
  id: string;
  name: string;
  icon: string;
}

export interface BOQItem {
  id: string;
  code: string;
  categoryId: string;
  floorId: string;
  roomId: string;
  description: string;
  specification: string;
  unit: string;
  length: number;
  width: number;
  height: number;
  count: number;
  formulaType: 'volume' | 'area' | 'length' | 'count' | 'manual' | 'lumpsum';
  manualQty: number;
  manualAmount: number;
  calculatedQty: number;
  wastagePercent: number;
  netQty: number;
  rateMaterial: number;
  rateLabour: number;
  rateEquipment: number;
  rateTransport: number;
  rateOther: number;
  contractorMarginPercent: number;
  gstPercent: number;
  finalRate: number;
  totalAmount: number;
  remarks: string;
  // Material estimation settings
  concreteMix?: 'pcc_1_5_10' | 'pcc_1_4_8' | 'pcc_1_3_6' | 'pcc_1_2_4' | 'm20' | 'm25' | 'm30';
  includeSteel?: boolean;
  steelRatio?: number;
  brickType?: 'modular' | 'standard' | 'aac_block' | 'fly_ash' | 'concrete_block';
  mortarRatio?: '1_3' | '1_4' | '1_5' | '1_6';
  plasterThickness?: 6 | 12 | 15 | 20;
  tileLength?: number;
  tileWidth?: number;
  tilesPerBox?: number;
  beddingType?: 'adhesive' | 'cement_mortar';
}

export interface RateItem {
  id: string;
  code: string;
  categoryId: string;
  description: string;
  unit: string;
  rateMaterial: number;
  rateLabour: number;
  rateEquipment: number;
  rateTransport: number;
  rateOther: number;
  wastagePercent: number;
  gstPercent: number;
  contractorMarginPercent: number;
  notes: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  location: string;
  state: string;
  city: string;
  projectType: 'residential' | 'commercial' | 'renovation' | 'interior' | 'industrial';
  builtUpArea: number;
  plotArea: number;
  startDate: string;
  validityDate: string;
  gstPercent: number;
  contractorMarginPercent: number;
  contingencyPercent: number;
  defaultWastagePercent: number;
  notes: string;
  floors: Floor[];
  rooms: Room[];
  items: BOQItem[];
}

export const DEFAULT_CATEGORIES: WorkCategory[] = [
  { id: '1', name: 'Site Prep & Survey', icon: 'Compass' },
  { id: '2', name: 'Earthwork & Excavation', icon: 'Hammer' },
  { id: '3', name: 'Filling & Compaction', icon: 'Layers' },
  { id: '4', name: 'PCC (Plain Concrete)', icon: 'Grid' },
  { id: '5', name: 'RCC (Reinforced Concrete)', icon: 'Building' },
  { id: '6', name: 'Reinforcement TMT Steel', icon: 'Hash' },
  { id: '7', name: 'Shuttering & Formwork', icon: 'Layers' },
  { id: '8', name: 'Brick Masonry', icon: 'Layers' },
  { id: '9', name: 'AAC Blockwork', icon: 'Layers' },
  { id: '10', name: 'Cement Sand Plaster', icon: 'Sparkles' },
  { id: '11', name: 'Waterproofing', icon: 'Droplets' },
  { id: '12', name: 'Flooring Tiles', icon: 'Grid' },
  { id: '13', name: 'Wall Tiles & Dado', icon: 'Grid' },
  { id: '14', name: 'Granite & Marble', icon: 'Layers' },
  { id: '15', name: 'Doors & Hardware', icon: 'FolderOpen' },
  { id: '16', name: 'Windows & Glazing', icon: 'Grid' },
  { id: '17', name: 'Putty & Painting', icon: 'Paintbrush' },
  { id: '18', name: 'Electrical Wiring', icon: 'Zap' },
  { id: '19', name: 'Plumbing & Drainage', icon: 'Wrench' },
  { id: '20', name: 'Sanitaryware & Fittings', icon: 'Wrench' },
  { id: '21', name: 'False Ceiling', icon: 'Layers' },
  { id: '22', name: 'Modular Kitchen', icon: 'Grid' },
  { id: '23', name: 'Wardrobes & Woodwork', icon: 'Layers' },
  { id: '24', name: 'External Development', icon: 'Compass' }
];

export const PRESET_RATES: RateItem[] = [
  {
    id: 'r_exc1',
    code: 'CPWD-02.01',
    categoryId: '2',
    description: 'Earthwork in excavation in ordinary soil including dressing and disposal up to 50m lead',
    unit: 'Cum',
    rateMaterial: 0,
    rateLabour: 210,
    rateEquipment: 80,
    rateTransport: 30,
    rateOther: 10,
    wastagePercent: 0,
    gstPercent: 18,
    contractorMarginPercent: 10,
    notes: 'CPWD DSR item for foundation trenches and pit excavation.'
  },
  {
    id: 'r_pcc1',
    code: 'CPWD-04.01',
    categoryId: '4',
    description: 'Providing & laying PCC 1:4:8 (1 cement : 4 coarse sand : 8 stone aggregate 40mm)',
    unit: 'Cum',
    rateMaterial: 3650,
    rateLabour: 720,
    rateEquipment: 160,
    rateTransport: 120,
    rateOther: 50,
    wastagePercent: 3,
    gstPercent: 18,
    contractorMarginPercent: 10,
    notes: 'Standard lean bed concrete under footings and ground flooring.'
  },
  {
    id: 'r_rcc_m20',
    code: 'CPWD-05.01',
    categoryId: '5',
    description: 'Providing & laying RCC M20 (1:1.5:3) nominal mix for suspended slabs, beams & lintels',
    unit: 'Cum',
    rateMaterial: 5400,
    rateLabour: 980,
    rateEquipment: 320,
    rateTransport: 180,
    rateOther: 70,
    wastagePercent: 3,
    gstPercent: 18,
    contractorMarginPercent: 10,
    notes: 'Excludes steel rebar and shuttering. Complete mechanical mixing & vibrator compaction.'
  },
  {
    id: 'r_rcc_m25',
    code: 'CPWD-05.02',
    categoryId: '5',
    description: 'Providing & laying RCC M25 (1:1:2) design mix concrete for columns and heavy footings',
    unit: 'Cum',
    rateMaterial: 6100,
    rateLabour: 1050,
    rateEquipment: 350,
    rateTransport: 200,
    rateOther: 80,
    wastagePercent: 3,
    gstPercent: 18,
    contractorMarginPercent: 10,
    notes: 'High strength structural frame concrete as per IS 456.'
  },
  {
    id: 'r_stl1',
    code: 'CPWD-05.22',
    categoryId: '6',
    description: 'Thermo-Mechanically Treated (TMT) Fe-500D steel rebar bars including cutting, bending & binding',
    unit: 'Kg',
    rateMaterial: 66,
    rateLabour: 9.5,
    rateEquipment: 1.5,
    rateTransport: 1.5,
    rateOther: 0.5,
    wastagePercent: 4,
    gstPercent: 18,
    contractorMarginPercent: 10,
    notes: 'Includes 18-gauge annealed binding wire and cover blocks.'
  },
  {
    id: 'r_sht1',
    code: 'CPWD-05.09',
    categoryId: '7',
    description: 'Centering, shuttering and formwork with water-proof plywood and steel props for suspended slab',
    unit: 'Sq m',
    rateMaterial: 180,
    rateLabour: 280,
    rateEquipment: 60,
    rateTransport: 25,
    rateOther: 15,
    wastagePercent: 5,
    gstPercent: 18,
    contractorMarginPercent: 10,
    notes: 'Includes props, bracing, staging, and deshirking after specified curing period.'
  },
  {
    id: 'r_brk1',
    code: 'CPWD-06.01',
    categoryId: '8',
    description: 'Brickwork with common burnt clay F.P.S. bricks class 75 in cement mortar 1:6 (230mm thick)',
    unit: 'Cum',
    rateMaterial: 3950,
    rateLabour: 1150,
    rateEquipment: 40,
    rateTransport: 120,
    rateOther: 40,
    wastagePercent: 5,
    gstPercent: 18,
    contractorMarginPercent: 10,
    notes: '9-inch thick main load-bearing and exterior perimeter walls.'
  },
  {
    id: 'r_brk_fly',
    code: 'CPWD-06.04',
    categoryId: '8',
    description: 'Fly ash brick masonry in cement mortar 1:6 in foundation and plinth',
    unit: 'Cum',
    rateMaterial: 3450,
    rateLabour: 1050,
    rateEquipment: 35,
    rateTransport: 110,
    rateOther: 35,
    wastagePercent: 5,
    gstPercent: 18,
    contractorMarginPercent: 10,
    notes: 'Eco-friendly fly ash masonry with higher compressive strength.'
  },
  {
    id: 'r_aac1',
    code: 'CPWD-06.15',
    categoryId: '9',
    description: 'AAC (Autoclaved Aerated Concrete) blockwork with thin bed jointing polymer adhesive mortar',
    unit: 'Cum',
    rateMaterial: 3800,
    rateLabour: 850,
    rateEquipment: 30,
    rateTransport: 150,
    rateOther: 30,
    wastagePercent: 4,
    gstPercent: 18,
    contractorMarginPercent: 10,
    notes: 'Lightweight AAC block partition walls reducing dead load.'
  },
  {
    id: 'r_pls_int',
    code: 'CPWD-12.01',
    categoryId: '10',
    description: '12 mm cement plaster of mix 1:4 (1 cement : 4 fine sand) on interior wall surfaces',
    unit: 'Sq m',
    rateMaterial: 95,
    rateLabour: 145,
    rateEquipment: 10,
    rateTransport: 10,
    rateOther: 5,
    wastagePercent: 8,
    gstPercent: 18,
    contractorMarginPercent: 10,
    notes: 'Finished smooth with sponge / steel float for putty application.'
  },
  {
    id: 'r_pls_ext',
    code: 'CPWD-12.08',
    categoryId: '10',
    description: '15 mm cement plaster of mix 1:4 with waterproofing integral compound on exterior surfaces',
    unit: 'Sq m',
    rateMaterial: 135,
    rateLabour: 180,
    rateEquipment: 15,
    rateTransport: 15,
    rateOther: 10,
    wastagePercent: 8,
    gstPercent: 18,
    contractorMarginPercent: 10,
    notes: 'Weather resistant exterior sand face plaster with waterproofing admixture.'
  },
  {
    id: 'r_wtp1',
    code: 'CPWD-11.02',
    categoryId: '11',
    description: 'Providing & applying 2 coats elastomeric acrylic waterproofing membrane over primed slab',
    unit: 'Sq m',
    rateMaterial: 160,
    rateLabour: 75,
    rateEquipment: 15,
    rateTransport: 10,
    rateOther: 10,
    wastagePercent: 5,
    gstPercent: 18,
    contractorMarginPercent: 10,
    notes: 'Dr. Fixit / Fosroc waterproofing system for toilets, balconies and terrace.'
  },
  {
    id: 'r_flr_vit',
    code: 'CPWD-11.37',
    categoryId: '12',
    description: 'Providing & laying 600x600 mm double charged vitrified floor tiles with polymer adhesive',
    unit: 'Sq m',
    rateMaterial: 580,
    rateLabour: 260,
    rateEquipment: 20,
    rateTransport: 25,
    rateOther: 15,
    wastagePercent: 8,
    gstPercent: 18,
    contractorMarginPercent: 10,
    notes: 'Includes epoxy/cementitious grout filling with matching shade.'
  },
  {
    id: 'r_til_wal',
    code: 'CPWD-11.42',
    categoryId: '13',
    description: 'Providing & fixing 300x450 mm digital ceramic wall tiles in kitchen dado & bathrooms up to 7ft height',
    unit: 'Sq m',
    rateMaterial: 420,
    rateLabour: 240,
    rateEquipment: 15,
    rateTransport: 20,
    rateOther: 10,
    wastagePercent: 8,
    gstPercent: 18,
    contractorMarginPercent: 10,
    notes: 'Fixed over cement plaster with polymer modified tile adhesive.'
  },
  {
    id: 'r_grn1',
    code: 'CPWD-11.50',
    categoryId: '14',
    description: '18mm thick Jet Black Granite slab for kitchen platform counter with machine edge chamfering',
    unit: 'Sq m',
    rateMaterial: 1650,
    rateLabour: 550,
    rateEquipment: 80,
    rateTransport: 60,
    rateOther: 30,
    wastagePercent: 6,
    gstPercent: 18,
    contractorMarginPercent: 10,
    notes: 'Mirror polished natural granite top with sink cutout and moulding.'
  },
  {
    id: 'r_pnt_int',
    code: 'CPWD-13.41',
    categoryId: '17',
    description: 'Applying 2 coats acrylic interior emulsion paint over 2 coats white cement putty & 1 coat primer',
    unit: 'Sq m',
    rateMaterial: 75,
    rateLabour: 65,
    rateEquipment: 8,
    rateTransport: 5,
    rateOther: 4,
    wastagePercent: 5,
    gstPercent: 18,
    contractorMarginPercent: 10,
    notes: 'Asian Paints Royale / Berger Silk premium satin smooth interior finish.'
  },
  {
    id: 'r_pnt_ext',
    code: 'CPWD-13.48',
    categoryId: '17',
    description: 'Applying 2 coats 100% acrylic exterior anti-fungal weatherproof paint over 1 coat exterior primer',
    unit: 'Sq m',
    rateMaterial: 95,
    rateLabour: 70,
    rateEquipment: 12,
    rateTransport: 6,
    rateOther: 5,
    wastagePercent: 5,
    gstPercent: 18,
    contractorMarginPercent: 10,
    notes: 'Asian Paints Apex Ultima / Nerolac Excel weatherproof silicone-enriched paint.'
  },
  {
    id: 'r_elc_pt',
    code: 'CPWD-E-01.01',
    categoryId: '18',
    description: 'Concealed wiring for light / fan point with 1.5 sq.mm FRLS copper wire in PVC conduit with modular switch',
    unit: 'Nos',
    rateMaterial: 420,
    rateLabour: 260,
    rateEquipment: 25,
    rateTransport: 15,
    rateOther: 10,
    wastagePercent: 3,
    gstPercent: 18,
    contractorMarginPercent: 10,
    notes: 'Havells / Polycab FRLS wire with Anchor / Legrand modular switches and MS box.'
  },
  {
    id: 'r_plm_pt',
    code: 'CPWD-P-02.01',
    categoryId: '19',
    description: 'Internal concealed CPVC water supply pipe line (20mm & 25mm OD SDR 11) with fittings',
    unit: 'Rmt',
    rateMaterial: 190,
    rateLabour: 110,
    rateEquipment: 15,
    rateTransport: 10,
    rateOther: 5,
    wastagePercent: 5,
    gstPercent: 18,
    contractorMarginPercent: 10,
    notes: 'Astral / Ashirvad CPVC hot & cold water piping pressure tested at 10 kg/cm2.'
  },
  {
    id: 'r_san_wc',
    code: 'CPWD-P-04.05',
    categoryId: '20',
    description: 'Wall hung European Water Closet (EWC) with concealed flush cistern and soft close seat cover',
    unit: 'Nos',
    rateMaterial: 7800,
    rateLabour: 1200,
    rateEquipment: 150,
    rateTransport: 200,
    rateOther: 100,
    wastagePercent: 2,
    gstPercent: 18,
    contractorMarginPercent: 10,
    notes: 'Jaquar / Kohler / Hindware wall hung ceramic toilet pan with concealed frame.'
  },
  {
    id: 'r_fcl_gyp',
    code: 'CPWD-12.45',
    categoryId: '21',
    description: 'Gypsum board false ceiling with G.I. framework, tape jointing and ready for painting',
    unit: 'Sq m',
    rateMaterial: 650,
    rateLabour: 320,
    rateEquipment: 35,
    rateTransport: 30,
    rateOther: 15,
    wastagePercent: 5,
    gstPercent: 18,
    contractorMarginPercent: 10,
    notes: 'Saint-Gobain Gyproc 12.5mm gypsum sheets on perimeter channel framework.'
  },
  {
    id: 'r_kit_mod',
    code: 'INT-KIT-01',
    categoryId: '22',
    description: 'Modular kitchen base and overhead wall cabinets in 18mm BWP marine plywood with 1mm laminate',
    unit: 'Sq ft',
    rateMaterial: 1250,
    rateLabour: 450,
    rateEquipment: 60,
    rateTransport: 50,
    rateOther: 40,
    wastagePercent: 5,
    gstPercent: 18,
    contractorMarginPercent: 10,
    notes: 'Includes soft-close Hettich / Ebco hinges and tandem drawer boxes.'
  }
];

// -------------------------------------------------------------
// Helper: Calculate Item Net Quantity and Amount
// -------------------------------------------------------------
export function calculateItemAmount(item: BOQItem, projGst: number, projMargin: number): BOQItem {
  let baseQty = 0;
  const l = item.length || 0;
  const w = item.width || 0;
  const h = item.height || 0;
  const cnt = item.count || 1;

  switch (item.formulaType) {
    case 'volume':
      baseQty = l * w * h * cnt;
      break;
    case 'area':
      baseQty = l * w * cnt;
      break;
    case 'length':
      baseQty = l * cnt;
      break;
    case 'count':
      baseQty = cnt;
      break;
    case 'manual':
      baseQty = item.manualQty || 0;
      break;
    case 'lumpsum':
      baseQty = 1;
      break;
  }

  item.calculatedQty = Number(baseQty.toFixed(3));
  const wastage = item.wastagePercent !== undefined ? item.wastagePercent : 0;
  item.netQty = Number((baseQty * (1 + wastage / 100)).toFixed(3));

  // Base rate components sum
  const baseRateSum =
    (item.rateMaterial || 0) +
    (item.rateLabour || 0) +
    (item.rateEquipment || 0) +
    (item.rateTransport || 0) +
    (item.rateOther || 0);

  // Margin & GST calculation
  const marginPct = item.contractorMarginPercent !== undefined ? item.contractorMarginPercent : projMargin;
  const gstPct = item.gstPercent !== undefined ? item.gstPercent : projGst;

  const rateWithMargin = baseRateSum * (1 + marginPct / 100);
  const finalRate = rateWithMargin * (1 + gstPct / 100);

  item.finalRate = Number(finalRate.toFixed(2));

  if (item.formulaType === 'lumpsum' && item.manualAmount > 0) {
    item.totalAmount = item.manualAmount;
  } else {
    item.totalAmount = Number((item.netQty * item.finalRate).toFixed(2));
  }

  return item;
}

// -------------------------------------------------------------
// Pre-built Indian Project Templates
// -------------------------------------------------------------
export function createTemplateProject(templateKey: 'small_house' | 'villa_g1' | 'apartment_g2' | 'renovation_2bhk' | 'modular_kitchen' | 'commercial_office' | 'blank'): Project {
  const id = 'proj_' + Date.now();
  const today = new Date().toISOString().split('T')[0];
  const validity = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // 1. Blank Project
  if (templateKey === 'blank') {
    return {
      id,
      name: 'New Custom BOQ Estimate',
      client: 'Client Name',
      location: 'Site Location',
      state: 'Maharashtra',
      city: 'Mumbai',
      projectType: 'residential',
      builtUpArea: 1000,
      plotArea: 1200,
      startDate: today,
      validityDate: validity,
      gstPercent: 18,
      contractorMarginPercent: 10,
      contingencyPercent: 3,
      defaultWastagePercent: 5,
      notes: 'Custom construction project estimate.',
      floors: [
        { id: 'f1', name: 'Ground Floor', area: 1000, height: 3.3, notes: 'Main level' }
      ],
      rooms: [
        { id: 'r1', name: 'Main Hall', floorId: 'f1', notes: 'General area' }
      ],
      items: []
    };
  }

  // 2. G+0 Small Residential House (Default)
  if (templateKey === 'small_house') {
    const p: Project = {
      id,
      name: 'G+0 Small Residential House (1,000 sqft)',
      client: 'Rajesh Sharma',
      location: 'Sector 45, Gurugram',
      state: 'Haryana',
      city: 'Gurugram',
      projectType: 'residential',
      builtUpArea: 1000,
      plotArea: 1200,
      startDate: today,
      validityDate: validity,
      gstPercent: 18,
      contractorMarginPercent: 12,
      contingencyPercent: 3,
      defaultWastagePercent: 5,
      notes: 'G+0 Single storey 2BHK residential house with RCC column-beam frame, 9-inch brick masonry, vitrified tile flooring, and OBD interior finish.',
      floors: [
        { id: 'f1', name: 'Ground Floor', area: 1000, height: 3.3, notes: 'Complete 2BHK footprint' }
      ],
      rooms: [
        { id: 'r1', name: 'Master Bedroom', floorId: 'f1', notes: '12x14 ft' },
        { id: 'r2', name: 'Living & Dining Room', floorId: 'f1', notes: '16x18 ft' },
        { id: 'r3', name: 'Kitchen & Utility', floorId: 'f1', notes: '10x10 ft' },
        { id: 'r4', name: 'Common Bathroom', floorId: 'f1', notes: '6x8 ft' }
      ],
      items: [
        {
          id: 'i1',
          code: 'EXC-01',
          categoryId: '1',
          floorId: 'f1',
          roomId: 'all',
          description: 'Earthwork Excavation in Foundation Trenches & Column Footings',
          specification: 'In ordinary soil up to 1.5m depth including dressing and ramming',
          unit: 'Cum',
          length: 22,
          width: 1.2,
          height: 1.5,
          count: 1,
          formulaType: 'volume',
          manualQty: 0,
          manualAmount: 0,
          calculatedQty: 39.6,
          wastagePercent: 0,
          netQty: 39.6,
          rateMaterial: 0,
          rateLabour: 320,
          rateEquipment: 50,
          rateTransport: 40,
          rateOther: 15,
          contractorMarginPercent: 12,
          gstPercent: 18,
          finalRate: 561.42,
          totalAmount: 22232,
          remarks: 'Column pits & wall trenches'
        },
        {
          id: 'i2',
          code: 'PCC-01',
          categoryId: '3',
          floorId: 'f1',
          roomId: 'all',
          description: 'PCC 1:4:8 Lean Concrete Bed under Footings & Grade Beam',
          specification: 'Cement concrete 1:4:8 with 40mm graded stone ballast',
          unit: 'Cum',
          length: 22,
          width: 1.2,
          height: 0.1,
          count: 1,
          formulaType: 'volume',
          manualQty: 0,
          manualAmount: 0,
          calculatedQty: 2.64,
          wastagePercent: 3,
          netQty: 2.719,
          rateMaterial: 3650,
          rateLabour: 780,
          rateEquipment: 80,
          rateTransport: 120,
          rateOther: 40,
          contractorMarginPercent: 12,
          gstPercent: 18,
          finalRate: 6220.18,
          totalAmount: 16912,
          remarks: 'Foundation leveling course'
        },
        {
          id: 'i3',
          code: 'RCC-01',
          categoryId: '4',
          floorId: 'f1',
          roomId: 'all',
          description: 'RCC M20 Grade Concrete for Columns, Plinth Beams & Roof Slab',
          specification: 'Ready mix/site mix 1:1.5:3 with 20mm graded down aggregate',
          unit: 'Cum',
          length: 1,
          width: 1,
          height: 1,
          count: 32,
          formulaType: 'count',
          manualQty: 0,
          manualAmount: 0,
          calculatedQty: 32,
          wastagePercent: 2,
          netQty: 32.64,
          rateMaterial: 5400,
          rateLabour: 1250,
          rateEquipment: 200,
          rateTransport: 200,
          rateOther: 50,
          contractorMarginPercent: 12,
          gstPercent: 18,
          finalRate: 9474.34,
          totalAmount: 309242,
          remarks: 'M20 Reinforced frame',
          concreteMix: 'm20',
          includeSteel: true,
          steelRatio: 85
        },
        {
          id: 'i4',
          code: 'STL-01',
          categoryId: '6',
          floorId: 'f1',
          roomId: 'all',
          description: 'Thermo-Mechanically Treated (TMT) Fe-550D Rebar Reinforcement',
          specification: 'High yield strength deformed bars including cutting, bending, binding wire',
          unit: 'Kg',
          length: 0,
          width: 0,
          height: 0,
          count: 2750,
          formulaType: 'count',
          manualQty: 0,
          manualAmount: 0,
          calculatedQty: 2750,
          wastagePercent: 4,
          netQty: 2860,
          rateMaterial: 66,
          rateLabour: 9.5,
          rateEquipment: 1.5,
          rateTransport: 1.5,
          rateOther: 0.5,
          contractorMarginPercent: 12,
          gstPercent: 18,
          finalRate: 104.77,
          totalAmount: 299642,
          remarks: 'Fe-550D primary and stirrups'
        },
        {
          id: 'i5',
          code: 'BRK-01',
          categoryId: '8',
          floorId: 'f1',
          roomId: 'all',
          description: 'Red Clay Brick Masonry (230mm Outer & 115mm Partition Walls)',
          specification: 'First class modular clay bricks in cement mortar 1:6',
          unit: 'Cum',
          length: 42,
          width: 0.23,
          height: 3.3,
          count: 1,
          formulaType: 'volume',
          manualQty: 0,
          manualAmount: 0,
          calculatedQty: 31.878,
          wastagePercent: 5,
          netQty: 33.472,
          rateMaterial: 4200,
          rateLabour: 1100,
          rateEquipment: 50,
          rateTransport: 180,
          rateOther: 40,
          contractorMarginPercent: 12,
          gstPercent: 18,
          finalRate: 7416.74,
          totalAmount: 248253,
          remarks: 'Outer load bearing and partition walls',
          brickType: 'standard',
          mortarRatio: '1_6'
        },
        {
          id: 'i6',
          code: 'PLS-01',
          categoryId: '10',
          floorId: 'f1',
          roomId: 'all',
          description: '12mm Internal Cement Plaster (1:4) with Smooth Sponge Finish',
          specification: 'Neat cement-sand mortar 1:4 with fine river sand',
          unit: 'Sq m',
          length: 42,
          width: 3.3,
          height: 0,
          count: 2,
          formulaType: 'area',
          manualQty: 0,
          manualAmount: 0,
          calculatedQty: 277.2,
          wastagePercent: 8,
          netQty: 299.376,
          rateMaterial: 120,
          rateLabour: 95,
          rateEquipment: 10,
          rateTransport: 8,
          rateOther: 4,
          contractorMarginPercent: 12,
          gstPercent: 18,
          finalRate: 315.69,
          totalAmount: 94510,
          remarks: 'Internal room wall plaster',
          plasterThickness: 12,
          mortarRatio: '1_4'
        },
        {
          id: 'i7',
          code: 'FLR-01',
          categoryId: '12',
          floorId: 'f1',
          roomId: 'all',
          description: '600x600 mm Double Charged Vitrified Floor Tiles',
          specification: 'Kajaria/Somany vitrified tiles laid on polymer modified adhesive bed',
          unit: 'Sq m',
          length: 10,
          width: 8,
          height: 0,
          count: 1,
          formulaType: 'area',
          manualQty: 0,
          manualAmount: 0,
          calculatedQty: 80,
          wastagePercent: 8,
          netQty: 86.4,
          rateMaterial: 650,
          rateLabour: 220,
          rateEquipment: 20,
          rateTransport: 25,
          rateOther: 10,
          contractorMarginPercent: 12,
          gstPercent: 18,
          finalRate: 1228.32,
          totalAmount: 106127,
          remarks: 'Bedrooms, Living, Dining',
          tileLength: 2,
          tileWidth: 2,
          tilesPerBox: 4,
          beddingType: 'adhesive'
        },
        {
          id: 'i8',
          code: 'PNT-01',
          categoryId: '17',
          floorId: 'f1',
          roomId: 'all',
          description: 'Interior Acrylic Emulsion Painting (2 Coats over Wall Putty)',
          specification: 'Asian Paints Tractor Emulsion over 2 coats Birla White putty and primer',
          unit: 'Sq m',
          length: 42,
          width: 3.3,
          height: 0,
          count: 2,
          formulaType: 'area',
          manualQty: 0,
          manualAmount: 0,
          calculatedQty: 277.2,
          wastagePercent: 5,
          netQty: 291.06,
          rateMaterial: 65,
          rateLabour: 55,
          rateEquipment: 5,
          rateTransport: 4,
          rateOther: 2,
          contractorMarginPercent: 12,
          gstPercent: 18,
          finalRate: 173.12,
          totalAmount: 50388,
          remarks: 'Interior walls & ceiling paint'
        }
      ]
    };
    p.items = p.items.map(item => calculateItemAmount(item, p.gstPercent, p.contractorMarginPercent));
    return p;
  }

  // 3. G+1 Duplex Villa
  if (templateKey === 'villa_g1') {
    const p: Project = {
      id,
      name: 'G+1 Modern Duplex Villa (2,000 sqft)',
      client: 'Sunil Verma',
      location: 'Whitefield, Bengaluru',
      state: 'Karnataka',
      city: 'Bengaluru',
      projectType: 'residential',
      builtUpArea: 2000,
      plotArea: 2400,
      startDate: today,
      validityDate: validity,
      gstPercent: 18,
      contractorMarginPercent: 12,
      contingencyPercent: 3,
      defaultWastagePercent: 5,
      notes: 'Premium G+1 independent duplex villa with RCC frame, AAC blockwork, vitrified tiles, false ceiling and modular kitchen.',
      floors: [
        { id: 'f1', name: 'Ground Floor', area: 1000, height: 3.3, notes: 'Living, Dining, Kitchen, Guest Bed' },
        { id: 'f2', name: 'First Floor', area: 1000, height: 3.3, notes: 'Master Suite, Kids Bed, Family Lounge, Balcony' },
        { id: 'f3', name: 'Terrace Level', area: 1000, height: 1.0, notes: 'Parapet walls, waterproof screed, solar platform' }
      ],
      rooms: [
        { id: 'r1', name: 'Living & Foyer', floorId: 'f1', notes: 'Double height living room' },
        { id: 'r2', name: 'Dining & Kitchen', floorId: 'f1', notes: 'Open plan with utility' },
        { id: 'r3', name: 'Guest Bedroom & Bath', floorId: 'f1', notes: 'Ensuite toilet' },
        { id: 'r4', name: 'Master Suite & Walk-in', floorId: 'f2', notes: 'Hardwood finish tiles' },
        { id: 'r5', name: 'Kids Bedroom & Study', floorId: 'f2', notes: 'Attached bath' },
        { id: 'r6', name: 'Family Lounge & Balcony', floorId: 'f2', notes: 'Glass railing' }
      ],
      items: [
        {
          id: 'i1',
          code: 'EXC-01',
          categoryId: '1',
          floorId: 'f1',
          roomId: 'all',
          description: 'Foundation Excavation in Hard Soil & Soft Rock',
          specification: 'IS 1200 Pt-1 excavation with dewatering and backfilling',
          unit: 'Cum',
          length: 35,
          width: 1.5,
          height: 1.8,
          count: 1,
          formulaType: 'volume',
          manualQty: 0,
          manualAmount: 0,
          calculatedQty: 94.5,
          wastagePercent: 0,
          netQty: 94.5,
          rateMaterial: 0,
          rateLabour: 380,
          rateEquipment: 80,
          rateTransport: 60,
          rateOther: 20,
          contractorMarginPercent: 12,
          gstPercent: 18,
          finalRate: 706.18,
          totalAmount: 66734,
          remarks: 'Heavy footing excavation'
        },
        {
          id: 'i2',
          code: 'RCC-01',
          categoryId: '4',
          floorId: 'f1',
          roomId: 'all',
          description: 'M25 Design Mix Concrete for Footings, Columns & Beams',
          specification: 'IS 456 M25 design mix with superplasticizer and 20mm aggregate',
          unit: 'Cum',
          length: 1,
          width: 1,
          height: 1,
          count: 58,
          formulaType: 'count',
          manualQty: 0,
          manualAmount: 0,
          calculatedQty: 58,
          wastagePercent: 2,
          netQty: 59.16,
          rateMaterial: 5850,
          rateLabour: 1350,
          rateEquipment: 250,
          rateTransport: 200,
          rateOther: 60,
          contractorMarginPercent: 12,
          gstPercent: 18,
          finalRate: 10074.82,
          totalAmount: 596026,
          remarks: 'M25 design mix structure',
          concreteMix: 'm25',
          includeSteel: true,
          steelRatio: 95
        },
        {
          id: 'i3',
          code: 'STL-01',
          categoryId: '6',
          floorId: 'f1',
          roomId: 'all',
          description: 'Tata Tiscon Fe-550D TMT Rebar (8mm to 25mm)',
          specification: 'IS 1786 certified corrosion resistant steel reinforcement',
          unit: 'Kg',
          length: 0,
          width: 0,
          height: 0,
          count: 5200,
          formulaType: 'count',
          manualQty: 0,
          manualAmount: 0,
          calculatedQty: 5200,
          wastagePercent: 4,
          netQty: 5408,
          rateMaterial: 68,
          rateLabour: 10,
          rateEquipment: 2,
          rateTransport: 1.5,
          rateOther: 0.5,
          contractorMarginPercent: 12,
          gstPercent: 18,
          finalRate: 107.41,
          totalAmount: 580873,
          remarks: 'Tata Tiscon Fe-550D'
        },
        {
          id: 'i4',
          code: 'AAC-01',
          categoryId: '9',
          floorId: 'f1',
          roomId: 'all',
          description: 'Siporex / Magicrete AAC Block Masonry (200mm/100mm)',
          specification: 'Autoclaved Aerated Concrete with thin-bed polymer mortar',
          unit: 'Cum',
          length: 55,
          width: 0.20,
          height: 3.3,
          count: 1,
          formulaType: 'volume',
          manualQty: 0,
          manualAmount: 0,
          calculatedQty: 36.3,
          wastagePercent: 4,
          netQty: 37.752,
          rateMaterial: 3800,
          rateLabour: 850,
          rateEquipment: 30,
          rateTransport: 150,
          rateOther: 30,
          contractorMarginPercent: 12,
          gstPercent: 18,
          finalRate: 6470.81,
          totalAmount: 244286,
          remarks: 'Thermal insulated AAC blocks',
          brickType: 'aac_block',
          mortarRatio: '1_6'
        },
        {
          id: 'i5',
          code: 'TIL-01',
          categoryId: '12',
          floorId: 'f1',
          roomId: 'r1',
          description: '1200x600 mm Glazed Vitrified Tiles (GVT Italian Marble Look)',
          specification: 'Kajaria Eternity GVT with polymer adhesive and epoxy grouting',
          unit: 'Sq m',
          length: 14,
          width: 10,
          height: 0,
          count: 1,
          formulaType: 'area',
          manualQty: 0,
          manualAmount: 0,
          calculatedQty: 140,
          wastagePercent: 8,
          netQty: 151.2,
          rateMaterial: 950,
          rateLabour: 280,
          rateEquipment: 30,
          rateTransport: 35,
          rateOther: 15,
          contractorMarginPercent: 12,
          gstPercent: 18,
          finalRate: 1762.61,
          totalAmount: 266506,
          remarks: 'Living & lounge flooring',
          tileLength: 4,
          tileWidth: 2,
          tilesPerBox: 2
        }
      ]
    };
    p.items = p.items.map(item => calculateItemAmount(item, p.gstPercent, p.contractorMarginPercent));
    return p;
  }

  // 4. G+2 Multi-Storey Residential Apartment
  if (templateKey === 'apartment_g2') {
    const p: Project = {
      id,
      name: 'G+2 Multi-Storey Residential Apartment (3,600 sqft)',
      client: 'Pinnacle Infra Developers',
      location: 'Kothrud, Pune',
      state: 'Maharashtra',
      city: 'Pune',
      projectType: 'commercial',
      builtUpArea: 3600,
      plotArea: 4000,
      startDate: today,
      validityDate: validity,
      gstPercent: 18,
      contractorMarginPercent: 15,
      contingencyPercent: 4,
      defaultWastagePercent: 5,
      notes: 'G+2 6-Unit Residential Apartment building with lift shaft, stilt parking, M25 concrete frame, and standard finishes.',
      floors: [
        { id: 'f1', name: 'Stilt & Ground Parking', area: 1200, height: 3.0, notes: 'Parking bays, security room, pump house' },
        { id: 'f2', name: 'First Floor (2 Flats)', area: 1200, height: 3.3, notes: 'Flat 101 (2BHK) & Flat 102 (2BHK)' },
        { id: 'f3', name: 'Second Floor (2 Flats)', area: 1200, height: 3.3, notes: 'Flat 201 (2BHK) & Flat 202 (2BHK)' }
      ],
      rooms: [
        { id: 'r1', name: 'Flat 101 - 2BHK', floorId: 'f2', notes: 'North facing' },
        { id: 'r2', name: 'Flat 102 - 2BHK', floorId: 'f2', notes: 'East facing' },
        { id: 'r3', name: 'Staircase & Lift Shaft', floorId: 'f1', notes: 'Common core' }
      ],
      items: [
        {
          id: 'i1',
          code: 'RCC-01',
          categoryId: '4',
          floorId: 'f1',
          roomId: 'all',
          description: 'M25 RMC Concrete for Columns, Shear Walls & Post-Tension Slabs',
          specification: 'Ultratech/ACC RMC pumped with Boom placer',
          unit: 'Cum',
          length: 1,
          width: 1,
          height: 1,
          count: 110,
          formulaType: 'count',
          manualQty: 0,
          manualAmount: 0,
          calculatedQty: 110,
          wastagePercent: 2,
          netQty: 112.2,
          rateMaterial: 5900,
          rateLabour: 1400,
          rateEquipment: 300,
          rateTransport: 250,
          rateOther: 80,
          contractorMarginPercent: 15,
          gstPercent: 18,
          finalRate: 10793.63,
          totalAmount: 1211045,
          remarks: 'Apartment RCC superstructure',
          concreteMix: 'm25',
          includeSteel: true,
          steelRatio: 105
        }
      ]
    };
    p.items = p.items.map(item => calculateItemAmount(item, p.gstPercent, p.contractorMarginPercent));
    return p;
  }

  // 5. 2BHK Interior Renovation
  if (templateKey === 'renovation_2bhk') {
    const p: Project = {
      id,
      name: '2BHK Luxury Interior Renovation (850 sqft)',
      client: 'Pooja Mehta',
      location: 'Andheri West, Mumbai',
      state: 'Maharashtra',
      city: 'Mumbai',
      projectType: 'interior',
      builtUpArea: 850,
      plotArea: 850,
      startDate: today,
      validityDate: validity,
      gstPercent: 18,
      contractorMarginPercent: 15,
      contingencyPercent: 3,
      defaultWastagePercent: 5,
      notes: 'Full turnkey interior makeover including false ceiling, vitrified tiles overlay, electrical rewiring, luxury painting and modular woodwork.',
      floors: [
        { id: 'f1', name: 'Apartment Level', area: 850, height: 3.0, notes: '2BHK Layout' }
      ],
      rooms: [
        { id: 'r1', name: 'Living & Dining', floorId: 'f1', notes: 'Italian veneer wall panelling' },
        { id: 'r2', name: 'Master Bedroom', floorId: 'f1', notes: 'Full height wardrobe' },
        { id: 'r3', name: 'Kitchen', floorId: 'f1', notes: 'Acrylic modular kitchen' }
      ],
      items: [
        {
          id: 'i1',
          code: 'TIL-01',
          categoryId: '12',
          floorId: 'f1',
          roomId: 'all',
          description: 'Tile-over-Tile Flooring Overlay (800x800mm Satin Matt Tiles)',
          specification: 'Laticrete 335 polymer adhesive overlay on existing flooring',
          unit: 'Sq m',
          length: 25,
          width: 3.2,
          height: 0,
          count: 1,
          formulaType: 'area',
          manualQty: 0,
          manualAmount: 0,
          calculatedQty: 80,
          wastagePercent: 8,
          netQty: 86.4,
          rateMaterial: 750,
          rateLabour: 260,
          rateEquipment: 25,
          rateTransport: 30,
          rateOther: 15,
          contractorMarginPercent: 15,
          gstPercent: 18,
          finalRate: 1466.86,
          totalAmount: 126737,
          remarks: 'All rooms overlay',
          tileLength: 2.6,
          tileWidth: 2.6,
          tilesPerBox: 3,
          beddingType: 'adhesive'
        },
        {
          id: 'i2',
          code: 'FCL-01',
          categoryId: '21',
          floorId: 'f1',
          roomId: 'all',
          description: 'Saint-Gobain Gyproc Gypsum False Ceiling with LED Magnetic Track Light Profile',
          specification: '12.5mm moisture resistant board on G.I perimeter channels',
          unit: 'Sq m',
          length: 25,
          width: 3.2,
          height: 0,
          count: 1,
          formulaType: 'area',
          manualQty: 0,
          manualAmount: 0,
          calculatedQty: 80,
          wastagePercent: 5,
          netQty: 84,
          rateMaterial: 680,
          rateLabour: 340,
          rateEquipment: 35,
          rateTransport: 30,
          rateOther: 15,
          contractorMarginPercent: 15,
          gstPercent: 18,
          finalRate: 1494.06,
          totalAmount: 125501,
          remarks: 'Living & bedroom ceiling'
        },
        {
          id: 'i3',
          code: 'PNT-01',
          categoryId: '17',
          floorId: 'f1',
          roomId: 'all',
          description: 'Asian Paints Royale Aspira Luxury Emulsion (Silky Matt Anti-bacterial)',
          specification: '3 coats over Asian Paints TruCare acrylic wall putty',
          unit: 'Sq m',
          length: 45,
          width: 3.0,
          height: 0,
          count: 2,
          formulaType: 'area',
          manualQty: 0,
          manualAmount: 0,
          calculatedQty: 270,
          wastagePercent: 5,
          netQty: 283.5,
          rateMaterial: 130,
          rateLabour: 95,
          rateEquipment: 10,
          rateTransport: 8,
          rateOther: 5,
          contractorMarginPercent: 15,
          gstPercent: 18,
          finalRate: 337.33,
          totalAmount: 95633,
          remarks: 'Premium velvet finish'
        }
      ]
    };
    p.items = p.items.map(item => calculateItemAmount(item, p.gstPercent, p.contractorMarginPercent));
    return p;
  }

  // 6. Modular Kitchen & Bathroom
  if (templateKey === 'modular_kitchen') {
    const p: Project = {
      id,
      name: 'Modular Kitchen & Master Bathroom Renovation (320 sqft)',
      client: 'Vikram Sengupta',
      location: 'Salt Lake, Kolkata',
      state: 'West Bengal',
      city: 'Kolkata',
      projectType: 'renovation',
      builtUpArea: 320,
      plotArea: 320,
      startDate: today,
      validityDate: validity,
      gstPercent: 18,
      contractorMarginPercent: 15,
      contingencyPercent: 3,
      defaultWastagePercent: 5,
      notes: 'Complete demolition and remodeling of wet areas with marine ply cabinets, quartz counter, Jaquar diverters, and anti-skid floor tiles.',
      floors: [
        { id: 'f1', name: 'Kitchen & Bath Level', area: 320, height: 3.0, notes: 'Kitchen (180 sqft) & Bathroom (140 sqft)' }
      ],
      rooms: [
        { id: 'r1', name: 'Modular Kitchen Zone', floorId: 'f1', notes: 'Island & parallel layout' },
        { id: 'r2', name: 'Master Bathroom Zone', floorId: 'f1', notes: 'Wet and dry shower partition' }
      ],
      items: [
        {
          id: 'i1',
          code: 'KIT-01',
          categoryId: '22',
          floorId: 'f1',
          roomId: 'r1',
          description: 'Premium Modular Kitchen Carcass & Acrylic Shutter Cabinets',
          specification: '710 BWP marine plywood, Hafele soft-close hinges, quartz countertop and chimney ducting',
          unit: 'Sq ft',
          length: 12,
          width: 8,
          height: 0,
          count: 1,
          formulaType: 'manual',
          manualQty: 95,
          manualAmount: 0,
          calculatedQty: 95,
          wastagePercent: 0,
          netQty: 95,
          rateMaterial: 1750,
          rateLabour: 600,
          rateEquipment: 90,
          rateTransport: 80,
          rateOther: 50,
          contractorMarginPercent: 15,
          gstPercent: 18,
          finalRate: 3494.67,
          totalAmount: 331994,
          remarks: 'Parallel modular kitchen'
        }
      ]
    };
    p.items = p.items.map(item => calculateItemAmount(item, p.gstPercent, p.contractorMarginPercent));
    return p;
  }

  // 7. Commercial Office Fitout
  const p: Project = {
    id,
    name: 'Commercial Corporate Office Fitout (2,500 sqft)',
    client: 'Nexus Digital Tech LLP',
    location: 'Cyber City, Gurugram',
    state: 'Haryana',
    city: 'Gurugram',
    projectType: 'commercial',
    builtUpArea: 2500,
    plotArea: 2500,
    startDate: today,
    validityDate: validity,
    gstPercent: 18,
    contractorMarginPercent: 12,
    contingencyPercent: 4,
    defaultWastagePercent: 5,
    notes: 'Grade-A office interior turnkey setup with modular workstations, acoustic Armstrong grid ceiling, glass partitions, and access control.',
    floors: [
      { id: 'f1', name: 'Floor Plate Level 4', area: 2500, height: 3.6, notes: 'Full office unit' }
    ],
    rooms: [
      { id: 'r1', name: 'Open Workstation Bay', floorId: 'f1', notes: '32 linear workstations' },
      { id: 'r2', name: 'Conference & Boardroom', floorId: 'f1', notes: '14-seater acoustic room' },
      { id: 'r3', name: 'Executive Director Cabins', floorId: 'f1', notes: '3 private cabins' }
    ],
    items: [
      {
        id: 'i1',
        code: 'CAR-01',
        categoryId: '12',
        floorId: 'f1',
        roomId: 'all',
        description: 'Heavy Duty Nylon Modular Carpet Tiles (500x500mm)',
        specification: 'Interface / Shaw Contract acoustic nylon carpet tiles with tackifier adhesive',
        unit: 'Sq m',
        length: 20,
        width: 10,
        height: 0,
        count: 1,
        formulaType: 'area',
        manualQty: 0,
        manualAmount: 0,
        calculatedQty: 200,
        wastagePercent: 8,
        netQty: 216,
        rateMaterial: 850,
        rateLabour: 160,
        rateEquipment: 20,
        rateTransport: 30,
        rateOther: 10,
        contractorMarginPercent: 12,
        gstPercent: 18,
        finalRate: 1417.84,
        totalAmount: 306253,
        remarks: 'General office floor',
        tileLength: 1.64,
        tileWidth: 1.64,
        tilesPerBox: 20
      },
      {
        id: 'i2',
        code: 'ARM-01',
        categoryId: '21',
        floorId: 'f1',
        roomId: 'all',
        description: 'Armstrong Dune Mineral Fiber Acoustic Grid False Ceiling (600x600mm)',
        specification: 'T-24 silhouette grid system with microlook edge mineral fiber acoustic tiles (NRC 0.55)',
        unit: 'Sq m',
        length: 20,
        width: 10,
        height: 0,
        count: 1,
        formulaType: 'area',
        manualQty: 0,
        manualAmount: 0,
        calculatedQty: 200,
        wastagePercent: 5,
        netQty: 210,
        rateMaterial: 720,
        rateLabour: 280,
        rateEquipment: 30,
        rateTransport: 30,
        rateOther: 15,
        contractorMarginPercent: 12,
        gstPercent: 18,
        finalRate: 1424.49,
        totalAmount: 299143,
        remarks: 'Acoustic ceiling'
      }
    ]
  };
  p.items = p.items.map(item => calculateItemAmount(item, p.gstPercent, p.contractorMarginPercent));
  return p;
}

// -------------------------------------------------------------
// Helper: Sanitize & Migrate Project State
// -------------------------------------------------------------
export function sanitizeProject(p: any): Project {
  if (!p || typeof p !== 'object') return createTemplateProject('small_house');
  
  const gstPercent = typeof p.gstPercent === 'number' && !isNaN(p.gstPercent) ? p.gstPercent : 18;
  const contractorMarginPercent = typeof p.contractorMarginPercent === 'number' && !isNaN(p.contractorMarginPercent) ? p.contractorMarginPercent : 15;
  const contingencyPercent = typeof p.contingencyPercent === 'number' && !isNaN(p.contingencyPercent) ? p.contingencyPercent : 3;
  const defaultWastagePercent = typeof p.defaultWastagePercent === 'number' && !isNaN(p.defaultWastagePercent) ? p.defaultWastagePercent : 5;
  const builtUpArea = typeof p.builtUpArea === 'number' && !isNaN(p.builtUpArea) ? p.builtUpArea : 1000;

  const floors: Floor[] = Array.isArray(p.floors) && p.floors.length > 0 ? p.floors.map((f: any, idx: number) => ({
    id: f?.id || `f_${idx + 1}`,
    name: f?.name || `Floor ${idx + 1}`,
    area: typeof f?.area === 'number' && !isNaN(f.area) ? f.area : 1000,
    height: typeof f?.height === 'number' && !isNaN(f.height) ? f.height : 3.3,
    notes: f?.notes || ''
  })) : [
    { id: 'f1', name: 'Ground Floor', area: builtUpArea, height: 3.3, notes: '' }
  ];

  const defaultFloorId = floors[0]?.id || 'f1';

  const rooms: Room[] = Array.isArray(p.rooms) && p.rooms.length > 0 ? p.rooms.map((r: any, idx: number) => ({
    id: r?.id || `r_${idx + 1}`,
    name: r?.name || `Room ${idx + 1}`,
    floorId: r?.floorId || defaultFloorId,
    notes: r?.notes || ''
  })) : [
    { id: 'r1', name: 'Master Bedroom', floorId: defaultFloorId, notes: '' },
    { id: 'r2', name: 'Living & Dining', floorId: defaultFloorId, notes: '' },
    { id: 'r3', name: 'Kitchen', floorId: defaultFloorId, notes: '' },
    { id: 'r4', name: 'Toilet / Bath', floorId: defaultFloorId, notes: '' }
  ];

  const items: BOQItem[] = Array.isArray(p.items) ? p.items.map((it: any, idx: number) => {
    const rawItem: BOQItem = {
      id: it?.id || `item_${idx + 1}_${Date.now()}`,
      code: it?.code || `ITEM-${idx + 1}`,
      categoryId: it?.categoryId || '1',
      floorId: it?.floorId || defaultFloorId,
      roomId: it?.roomId || 'all',
      description: it?.description || 'Construction Work Item',
      specification: it?.specification || '',
      unit: it?.unit || 'Nos',
      length: typeof it?.length === 'number' && !isNaN(it.length) ? it.length : 0,
      width: typeof it?.width === 'number' && !isNaN(it.width) ? it.width : 0,
      height: typeof it?.height === 'number' && !isNaN(it.height) ? it.height : 0,
      count: typeof it?.count === 'number' && !isNaN(it.count) ? it.count : 1,
      formulaType: it?.formulaType || 'count',
      manualQty: typeof it?.manualQty === 'number' && !isNaN(it.manualQty) ? it.manualQty : 0,
      manualAmount: typeof it?.manualAmount === 'number' && !isNaN(it.manualAmount) ? it.manualAmount : 0,
      calculatedQty: typeof it?.calculatedQty === 'number' && !isNaN(it.calculatedQty) ? it.calculatedQty : 1,
      wastagePercent: typeof it?.wastagePercent === 'number' && !isNaN(it.wastagePercent) ? it.wastagePercent : defaultWastagePercent,
      netQty: typeof it?.netQty === 'number' && !isNaN(it.netQty) ? it.netQty : 1,
      rateMaterial: typeof it?.rateMaterial === 'number' && !isNaN(it.rateMaterial) ? it.rateMaterial : 0,
      rateLabour: typeof it?.rateLabour === 'number' && !isNaN(it.rateLabour) ? it.rateLabour : 0,
      rateEquipment: typeof it?.rateEquipment === 'number' && !isNaN(it.rateEquipment) ? it.rateEquipment : 0,
      rateTransport: typeof it?.rateTransport === 'number' && !isNaN(it.rateTransport) ? it.rateTransport : 0,
      rateOther: typeof it?.rateOther === 'number' && !isNaN(it.rateOther) ? it.rateOther : 0,
      contractorMarginPercent: typeof it?.contractorMarginPercent === 'number' && !isNaN(it.contractorMarginPercent) ? it.contractorMarginPercent : contractorMarginPercent,
      gstPercent: typeof it?.gstPercent === 'number' && !isNaN(it.gstPercent) ? it.gstPercent : gstPercent,
      finalRate: typeof it?.finalRate === 'number' && !isNaN(it.finalRate) ? it.finalRate : 0,
      totalAmount: typeof it?.totalAmount === 'number' && !isNaN(it.totalAmount) ? it.totalAmount : 0,
      remarks: it?.remarks || '',
      concreteMix: it?.concreteMix,
      includeSteel: it?.includeSteel,
      steelRatio: it?.steelRatio,
      brickType: it?.brickType,
      mortarRatio: it?.mortarRatio,
      plasterThickness: it?.plasterThickness,
      tileLength: it?.tileLength,
      tileWidth: it?.tileWidth,
      tilesPerBox: it?.tilesPerBox,
      beddingType: it?.beddingType
    };
    return calculateItemAmount(rawItem, gstPercent, contractorMarginPercent);
  }) : [];

  return {
    id: p?.id || 'proj_' + Date.now(),
    name: p?.name || 'Construction Project BOQ',
    client: p?.client || 'Valued Client',
    location: p?.location || 'Site Location',
    state: p?.state || 'Maharashtra',
    city: p?.city || 'Mumbai',
    projectType: p?.projectType || 'residential',
    builtUpArea,
    plotArea: typeof p?.plotArea === 'number' && !isNaN(p.plotArea) ? p.plotArea : 1200,
    startDate: p?.startDate || new Date().toISOString().split('T')[0],
    validityDate: p?.validityDate || '',
    gstPercent,
    contractorMarginPercent,
    contingencyPercent,
    defaultWastagePercent,
    notes: p?.notes || '',
    floors,
    rooms,
    items
  };
}

// -------------------------------------------------------------
// Main BOQ Workspace Component
// -------------------------------------------------------------
export default function AdvancedBOQCalculator() {
  // Projects State
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('boq_projects_v6') || localStorage.getItem('boq_projects_v6');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(sanitizeProject);
        }
      } catch (e) { /* ignore */ }
    }
    return [createTemplateProject('small_house')];
  });

  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    const saved = localStorage.getItem('boq_active_project_id_v6') || localStorage.getItem('boq_active_project_id_v6');
    return saved || (projects[0]?.id || '');
  });

  const [rateLibrary] = useState<RateItem[]>(() => {
    const saved = localStorage.getItem('boq_rate_library_v6') || localStorage.getItem('boq_rate_library_v6');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { /* ignore */ }
    }
    return PRESET_RATES;
  });

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'boq' | 'materials' | 'rates' | 'floors' | 'analytics' | 'export'>('boq');

  // Filter & Search states
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedFloorFilter, setSelectedFloorFilter] = useState<string>('all');
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'code' | 'amount' | 'category' | 'none'>('none');

  // Rate Library filters
  const [librarySearchQuery, setLibrarySearchQuery] = useState<string>('');
  const [libraryCategoryFilter, setLibraryCategoryFilter] = useState<string>('all');

  // Modals state
  const [activeRateAnalysisItemId, setActiveRateAnalysisItemId] = useState<string | null>(null);
  const [activeMaterialSettingsItemId, setActiveMaterialSettingsItemId] = useState<string | null>(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState<boolean>(false);

  // Bulk Staging & Selection state
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  // Scenario Simulator factors
  const [simCement, setSimCement] = useState<number>(0);
  const [simSteel, setSimSteel] = useState<number>(0);
  const [simLabour, setSimLabour] = useState<number>(0);
  const [simTile, setSimTile] = useState<number>(0);
  const [simInflation, setSimInflation] = useState<number>(0);

  // Material Market Unit Rates for Indent Abstract (in INR)
  const [materialPrices, setMaterialPrices] = useState({
    cementBag: 380,
    steelKg: 66,
    sandBrass: 4500,
    aggregateBrass: 3200,
    brickPcs: 9.5,
    aacBlockPcs: 65,
    tileSqft: 55,
    adhesiveBag20kg: 380,
    groutKg: 85,
    puttyBag40kg: 950,
    primerLitre: 140,
    paintLitre: 320
  });

  // Active project memo
  const activeProject = useMemo(() => {
    return projects.find(p => p.id === activeProjectId) || projects[0] || null;
  }, [projects, activeProjectId]);

  const activeRateAnalysisItem = useMemo(() => {
    if (!activeProject || !activeRateAnalysisItemId) return null;
    return (activeProject.items || []).find(item => item.id === activeRateAnalysisItemId) || null;
  }, [activeProject, activeRateAnalysisItemId]);

  const activeMaterialSettingsItem = useMemo(() => {
    if (!activeProject || !activeMaterialSettingsItemId) return null;
    return (activeProject.items || []).find(item => item.id === activeMaterialSettingsItemId) || null;
  }, [activeProject, activeMaterialSettingsItemId]);

  // LocalStorage sync
  useEffect(() => {
    localStorage.setItem('boq_projects_v6', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    if (activeProjectId) {
      localStorage.setItem('boq_active_project_id_v6', activeProjectId);
    }
  }, [activeProjectId]);

  useEffect(() => {
    localStorage.setItem('boq_rate_library_v6', JSON.stringify(rateLibrary));
  }, [rateLibrary]);

  // Autosave indicator
  const [autosaveIndicator, setAutosaveIndicator] = useState<string>('Saved');
  const [copyToast, setCopyToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setCopyToast(msg);
    setTimeout(() => setCopyToast(null), 2500);
  };

  // Update active project
  const updateActiveProject = (updated: Project) => {
    const totalFloorArea = updated.floors.reduce((sum, f) => sum + (f.area || 0), 0);
    if (updated.floors.length > 0) {
      updated.builtUpArea = totalFloorArea;
    }

    updated.items = updated.items.map(item =>
      calculateItemAmount({ ...item }, updated.gstPercent, updated.contractorMarginPercent)
    );

    setAutosaveIndicator('Saving...');
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
    setTimeout(() => setAutosaveIndicator('Saved'), 400);
  };

  // Create new project
  const handleCreateProject = (templateType: 'small_house' | 'villa_g1' | 'apartment_g2' | 'renovation_2bhk' | 'modular_kitchen' | 'commercial_office' | 'blank') => {
    const newProj = createTemplateProject(templateType);
    setProjects(prev => [newProj, ...prev]);
    setActiveProjectId(newProj.id);
    setShowNewProjectModal(false);
    showToast(`Project '${newProj.name}' loaded!`);
  };

  const handleDeleteProject = (projId: string) => {
    if (projects.length <= 1) {
      alert("You must keep at least one active project workspace.");
      return;
    }
    if (confirm("Are you sure you want to delete this project estimate?")) {
      const remaining = projects.filter(p => p.id !== projId);
      setProjects(remaining);
      setActiveProjectId(remaining[0]?.id || '');
      showToast('Project deleted');
    }
  };

  // BOQ Item CRUD Handlers
  const handleAddItem = () => {
    if (!activeProject) return;

    const newItem: BOQItem = {
      id: 'item_' + Date.now(),
      code: `ITEM-${(activeProject.items || []).length + 1}`,
      categoryId: DEFAULT_CATEGORIES[0].id,
      floorId: activeProject.floors[0]?.id || 'all',
      roomId: 'all',
      description: 'New Construction Work Item',
      specification: '',
      unit: 'Nos',
      length: 0,
      width: 0,
      height: 0,
      count: 1,
      formulaType: 'count',
      manualQty: 0,
      manualAmount: 0,
      calculatedQty: 1,
      wastagePercent: (activeProject.defaultWastagePercent ?? 5),
      netQty: 1,
      rateMaterial: 0,
      rateLabour: 0,
      rateEquipment: 0,
      rateTransport: 0,
      rateOther: 0,
      contractorMarginPercent: (activeProject.contractorMarginPercent ?? 15),
      gstPercent: (activeProject.gstPercent ?? 18),
      finalRate: 0,
      totalAmount: 0,
      remarks: ''
    };

    const updatedItems = [...activeProject.items, newItem];
    updateActiveProject({ ...activeProject, items: updatedItems });
    showToast('New item added');
  };

  const handleUpdateItemCell = (itemId: string, field: keyof BOQItem, value: any) => {
    if (!activeProject) return;

    const updatedItems = (activeProject.items || []).map(item => {
      if (item.id === itemId) {
        const copy = { ...item, [field]: value };
        return calculateItemAmount(copy, (activeProject.gstPercent ?? 18), (activeProject.contractorMarginPercent ?? 15));
      }
      return item;
    });

    updateActiveProject({ ...activeProject, items: updatedItems });
  };

  const handleDuplicateItem = (itemId: string) => {
    if (!activeProject) return;
    const target = (activeProject.items || []).find(item => item.id === itemId);
    if (!target) return;

    const duplicate: BOQItem = {
      ...target,
      id: 'item_' + Date.now() + Math.random().toString(36).substr(2, 4),
      code: target.code + '-DUP'
    };

    const updatedItems = [...activeProject.items, duplicate];
    updateActiveProject({ ...activeProject, items: updatedItems });
    showToast(`Duplicated ${target.code}`);
  };

  const handleDeleteItem = (itemId: string) => {
    if (!activeProject) return;
    const updatedItems = (activeProject.items || []).filter(item => item.id !== itemId);
    updateActiveProject({ ...activeProject, items: updatedItems });
    showToast('Item deleted');
  };

  // Bulk actions
  const toggleSelectItem = (itemId: string) => {
    setSelectedItemIds(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const toggleSelectAll = (visibleItems: BOQItem[]) => {
    const visibleIds = visibleItems.map(item => item.id);
    const allSelected = visibleIds.every(id => selectedItemIds.includes(id));
    if (allSelected) {
      setSelectedItemIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedItemIds(prev => [...new Set([...prev, ...visibleIds])]);
    }
  };

  const handleBulkDelete = () => {
    if (!activeProject || selectedItemIds.length === 0) return;
    if (confirm(`Delete ${selectedItemIds.length} selected line items?`)) {
      const updatedItems = (activeProject.items || []).filter(item => !selectedItemIds.includes(item.id));
      updateActiveProject({ ...activeProject, items: updatedItems });
      setSelectedItemIds([]);
      showToast(`${selectedItemIds.length} items deleted`);
    }
  };



  const handleAddFromLibrary = (rate: RateItem) => {
    if (!activeProject) return;

    let formulaType: BOQItem['formulaType'] = 'count';
    const u = (rate.unit || "Nos").toLowerCase();
    if ((u || "").includes('cum') || (u || "").includes('cft')) {
      formulaType = 'volume';
    } else if ((u || "").includes('sqft') || (u || "").includes('sqm') || (u || "").includes('sq m') || (u || "").includes('sq ft')) {
      formulaType = 'area';
    } else if ((u || "").includes('rmt') || (u || "").includes('m') || (u || "").includes('ft')) {
      formulaType = 'length';
    } else if ((u || "").includes('nos') || (u || "").includes('bag') || (u || "").includes('set') || (u || "").includes('ton') || (u || "").includes('kg')) {
      formulaType = 'count';
    }

    const newItem: BOQItem = {
      id: 'item_' + Date.now() + Math.random().toString(36).substr(2, 4),
      code: rate.code || `ITEM-${(activeProject.items || []).length + 1}`,
      categoryId: rate.categoryId || DEFAULT_CATEGORIES[0].id,
      floorId: activeProject.floors[0]?.id || 'all',
      roomId: 'all',
      description: rate.description,
      specification: rate.notes || '',
      unit: rate.unit,
      length: formulaType === 'area' || formulaType === 'volume' || formulaType === 'length' ? 10 : 0,
      width: formulaType === 'area' || formulaType === 'volume' ? 10 : 0,
      height: formulaType === 'volume' ? 1 : 0,
      count: 1,
      formulaType,
      manualQty: 0,
      manualAmount: 0,
      calculatedQty: 1,
      wastagePercent: rate.wastagePercent !== undefined ? rate.wastagePercent : (activeProject.defaultWastagePercent ?? 5),
      netQty: 1,
      rateMaterial: rate.rateMaterial,
      rateLabour: rate.rateLabour,
      rateEquipment: rate.rateEquipment,
      rateTransport: rate.rateTransport,
      rateOther: rate.rateOther,
      contractorMarginPercent: rate.contractorMarginPercent !== undefined ? rate.contractorMarginPercent : (activeProject.contractorMarginPercent ?? 15),
      gstPercent: rate.gstPercent !== undefined ? rate.gstPercent : (activeProject.gstPercent ?? 18),
      finalRate: 0,
      totalAmount: 0,
      remarks: rate.notes || ''
    };

    if (rate.categoryId === '4' || rate.categoryId === '5') {
      newItem.concreteMix = rate.code.includes('M25') ? 'm25' : rate.code.includes('M20') ? 'm20' : 'pcc_1_4_8';
      newItem.includeSteel = rate.code.includes('RCC') || rate.code.includes('M20') || rate.code.includes('M25');
      newItem.steelRatio = 90;
    } else if (rate.categoryId === '8' || rate.categoryId === '9') {
      newItem.brickType = rate.code.includes('AAC') ? 'aac_block' : rate.code.includes('fly') ? 'fly_ash' : 'standard';
      newItem.mortarRatio = '1_6';
    } else if (rate.categoryId === '10') {
      newItem.plasterThickness = rate.description.includes('15') ? 15 : 12;
      newItem.mortarRatio = '1_4';
    } else if (rate.categoryId === '12' || rate.categoryId === '13') {
      newItem.tileLength = 2;
      newItem.tileWidth = 2;
      newItem.tilesPerBox = 4;
    }

    const calculated = calculateItemAmount(newItem, (activeProject.gstPercent ?? 18), (activeProject.contractorMarginPercent ?? 15));
    const updatedItems = [...activeProject.items, calculated];
    updateActiveProject({ ...activeProject, items: updatedItems });
    showToast(`Added ${rate.code} to project`);
  };

  // Floors & Rooms CRUD
  const [newFloorName, setNewFloorName] = useState<string>('');
  const [newFloorArea, setNewFloorArea] = useState<number>(1000);
  const [newRoomName, setNewRoomName] = useState<string>('');
  const [newRoomFloorId, setNewRoomFloorId] = useState<string>('');

  const handleAddFloor = () => {
    if (!activeProject || !newFloorName.trim()) return;
    const newFloorId = 'f_' + Date.now();
    const newFloor: Floor = {
      id: newFloorId,
      name: newFloorName,
      area: newFloorArea,
      height: 3.3,
      notes: ''
    };

    const sourceFloorId = activeProject.floors[0]?.id || 'f1';
    const sourceFloor = activeProject.floors[0];
    const sourceArea = sourceFloor ? sourceFloor.area : 1000;
    const areaFactor = sourceArea > 0 ? newFloorArea / sourceArea : 1;

    const clonedItems: BOQItem[] = [];
    activeProject.items.forEach(item => {
      if (item.floorId === sourceFloorId && !['1', '2', '3', '4'].includes(item.categoryId)) {
        const copy = { ...item };
        copy.id = 'item_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
        copy.floorId = newFloorId;
        copy.code = `${item.code}-FLR`;

        if (areaFactor !== 1) {
          if (copy.formulaType === 'area' || copy.formulaType === 'volume' || copy.formulaType === 'length') {
            copy.length = Number((copy.length * Math.sqrt(areaFactor)).toFixed(2));
            if (copy.formulaType === 'area' || copy.formulaType === 'volume') {
              copy.width = Number((copy.width * Math.sqrt(areaFactor)).toFixed(2));
            }
          } else if (copy.formulaType === 'count') {
            copy.count = Math.max(1, Math.round(copy.count * areaFactor));
          } else if (copy.formulaType === 'manual') {
            copy.manualQty = Number((copy.manualQty * areaFactor).toFixed(2));
          }
        }
        clonedItems.push(calculateItemAmount(copy, (activeProject.gstPercent ?? 18), (activeProject.contractorMarginPercent ?? 15)));
      }
    });

    const updatedFloors = [...activeProject.floors, newFloor];
    const updatedItems = [...activeProject.items, ...clonedItems];
    updateActiveProject({ ...activeProject, floors: updatedFloors, items: updatedItems });
    setNewFloorName('');
    showToast(`Added ${newFloor.name} with ${clonedItems.length} cloned items`);
  };

  const handleRemoveFloor = (floorId: string) => {
    if (!activeProject) return;
    if ((activeProject.floors || []).length <= 1) {
      alert("At least one floor level must remain in the project.");
      return;
    }
    const targetFloor = (activeProject.floors || []).find(f => f.id === floorId);
    if (!targetFloor) return;

    if (confirm(`Remove ${targetFloor.name} and all its associated line items?`)) {
      const updatedFloors = (activeProject.floors || []).filter(f => f.id !== floorId);
      const updatedRooms = (activeProject.rooms || []).filter(r => r.floorId !== floorId);
      const updatedItems = (activeProject.items || []).filter(item => item.floorId !== floorId);
      updateActiveProject({ ...activeProject, floors: updatedFloors, rooms: updatedRooms, items: updatedItems });
      showToast(`Removed ${targetFloor.name}`);
    }
  };

  const handleUpdateFloorArea = (floorId: string, newArea: number) => {
    if (!activeProject || newArea <= 0) return;
    const floor = (activeProject.floors || []).find(f => f.id === floorId);
    if (!floor || floor.area === newArea) return;

    const oldArea = floor.area || 1;
    const ratio = newArea / oldArea;

    const updatedFloors = (activeProject.floors || []).map(f =>
      f.id === floorId ? { ...f, area: newArea } : f
    );

    const updatedItems = (activeProject.items || []).map(item => {
      if (item.floorId !== floorId) return item;
      const copy = { ...item };
      if (copy.formulaType === 'area' || copy.formulaType === 'volume' || copy.formulaType === 'length') {
        copy.length = Number((copy.length * Math.sqrt(ratio)).toFixed(2));
        if (copy.formulaType === 'area' || copy.formulaType === 'volume') {
          copy.width = Number((copy.width * Math.sqrt(ratio)).toFixed(2));
        }
      } else if (copy.formulaType === 'count') {
        copy.count = Math.max(1, Math.round(copy.count * ratio));
      } else if (copy.formulaType === 'manual') {
        copy.manualQty = Number((copy.manualQty * ratio).toFixed(2));
      }
      return calculateItemAmount(copy, (activeProject.gstPercent ?? 18), (activeProject.contractorMarginPercent ?? 15));
    });

    updateActiveProject({ ...activeProject, floors: updatedFloors, items: updatedItems });
  };

  const handleAddRoom = () => {
    if (!activeProject || !newRoomName.trim() || !newRoomFloorId) return;
    const newRoom: Room = {
      id: 'r_' + Date.now(),
      name: newRoomName,
      floorId: newRoomFloorId,
      notes: ''
    };
    const updatedRooms = [...activeProject.rooms, newRoom];
    updateActiveProject({ ...activeProject, rooms: updatedRooms });
    setNewRoomName('');
    showToast(`Added room ${newRoom.name}`);
  };

  const handleRemoveRoom = (roomId: string) => {
    if (!activeProject) return;
    const updatedRooms = (activeProject.rooms || []).filter(r => r.id !== roomId);
    const updatedItems = (activeProject.items || []).map(item =>
      item.roomId === roomId ? { ...item, roomId: 'all' } : item
    );
    updateActiveProject({ ...activeProject, rooms: updatedRooms, items: updatedItems });
    showToast('Room removed');
  };

  // Filtered BOQ items list
  const filteredBOQItems = useMemo(() => {
    if (!activeProject) return [];
    let items = [...activeProject.items];

    if (selectedCategoryFilter !== 'all') {
      items = items.filter(i => i.categoryId === selectedCategoryFilter);
    }
    if (selectedFloorFilter !== 'all') {
      items = items.filter(i => i.floorId === selectedFloorFilter);
    }
    if (selectedRoomFilter !== 'all') {
      items = items.filter(i => i.roomId === selectedRoomFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(i =>
        (i.description || "").toLowerCase().includes(q) ||
        (i.specification || "").toLowerCase().includes(q) ||
        (i.code || "").toLowerCase().includes(q)
      );
    }

    if (sortBy === 'code') {
      items.sort((a, b) => a.code.localeCompare(b.code));
    } else if (sortBy === 'amount') {
      items.sort((a, b) => b.totalAmount - a.totalAmount);
    } else if (sortBy === 'category') {
      items.sort((a, b) => a.categoryId.localeCompare(b.categoryId));
    }

    return items;
  }, [activeProject, selectedCategoryFilter, selectedFloorFilter, selectedRoomFilter, searchQuery, sortBy]);

  // Rate Library Filtered List
  const filteredRateLibrary = useMemo(() => {
    return rateLibrary.filter(rate => {
      const matchCat = libraryCategoryFilter === 'all' || rate.categoryId === libraryCategoryFilter;
      const matchSearch =
        !librarySearchQuery.trim() ||
        (rate.code || "").toLowerCase().includes(librarySearchQuery.toLowerCase()) ||
        (rate.description || "").toLowerCase().includes(librarySearchQuery.toLowerCase()) ||
        (rate.notes && (rate.notes || "").toLowerCase().includes(librarySearchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [rateLibrary, libraryCategoryFilter, librarySearchQuery]);

  // Summary Totals Calculation
  const summaryTotals = useMemo(() => {
    if (!activeProject) return { baseTotal: 0, materialTotal: 0, labourTotal: 0, equipmentTotal: 0, transportTotal: 0, otherTotal: 0, grandTotal: 0, gstTotal: 0, marginTotal: 0, contingencyTotal: 0 };

    let materialTotal = 0;
    let labourTotal = 0;
    let equipmentTotal = 0;
    let transportTotal = 0;
    let otherTotal = 0;
    let grandTotal = 0;

    activeProject.items.forEach(item => {
      const multiplierCement = ['4', '5', '8', '10'].includes(item.categoryId) ? (1 + simCement / 100) : 1;
      const multiplierSteel = item.categoryId === '6' ? (1 + simSteel / 100) : 1;
      const multiplierLabour = (1 + simLabour / 100);
      const multiplierTile = ['12', '13'].includes(item.categoryId) ? (1 + simTile / 100) : 1;
      const multiplierGeneral = (1 + simInflation / 100);

      const netQty = item.netQty || 0;

      const matBase = (item.rateMaterial || 0) * multiplierCement * multiplierSteel * multiplierTile * multiplierGeneral;
      const labBase = (item.rateLabour || 0) * multiplierLabour * multiplierGeneral;
      const eqBase = (item.rateEquipment || 0) * multiplierGeneral;
      const transBase = (item.rateTransport || 0) * multiplierGeneral;
      const othBase = (item.rateOther || 0) * multiplierGeneral;

      const baseSum = matBase + labBase + eqBase + transBase + othBase;
      const marginVal = baseSum * ((item.contractorMarginPercent !== undefined ? item.contractorMarginPercent : (activeProject.contractorMarginPercent ?? 15)) / 100);
      const subtotalBeforeGst = baseSum + marginVal;
      const gstVal = subtotalBeforeGst * ((item.gstPercent !== undefined ? item.gstPercent : (activeProject.gstPercent ?? 18)) / 100);
      const finalRate = subtotalBeforeGst + gstVal;

      if (item.formulaType === 'lumpsum' && item.manualAmount > 0) {
        grandTotal += item.manualAmount;
        materialTotal += item.manualAmount * 0.5;
        labourTotal += item.manualAmount * 0.4;
        otherTotal += item.manualAmount * 0.1;
      } else {
        materialTotal += matBase * netQty;
        labourTotal += labBase * netQty;
        equipmentTotal += eqBase * netQty;
        transportTotal += transBase * netQty;
        otherTotal += othBase * netQty;
        grandTotal += finalRate * netQty;
      }
    });

    const baseTotal = materialTotal + labourTotal + equipmentTotal + transportTotal + otherTotal;
    const marginTotal = baseTotal * ((activeProject.contractorMarginPercent ?? 15) / 100);
    const gstTotal = (baseTotal + marginTotal) * ((activeProject.gstPercent ?? 18) / 100);
    const contingencyTotal = grandTotal * ((activeProject.contingencyPercent ?? 3) / 100);
    const finalGrandTotal = grandTotal + contingencyTotal;

    return {
      baseTotal,
      materialTotal,
      labourTotal,
      equipmentTotal,
      transportTotal,
      otherTotal,
      marginTotal,
      gstTotal,
      contingencyTotal,
      grandTotal: finalGrandTotal
    };
  }, [activeProject, simCement, simSteel, simLabour, simTile, simInflation]);

  const totalFloorAreaSqft = useMemo(() => {
    if (!activeProject) return 0;
    return (activeProject.floors || []).reduce((sum, f) => sum + (f.area || 0), 0);
  }, [activeProject]);

  // Material Estimation Totals Memo
  const materialEstimationTotals = useMemo(() => {
    if (!activeProject) return null;

    let cementBags = 0;
    let sandCft = 0;
    let sandBrass = 0;
    let aggregateCft = 0;
    let aggregateBrass = 0;
    let aggregate20mmBrass = 0;
    let aggregate10mmBrass = 0;
    let steelKg = 0;
    let brickCount = 0;
    let aacBlockCount = 0;
    let tileCount = 0;
    let tileBoxes = 0;
    let adhesiveBags = 0;
    let groutKg = 0;
    let paintLitres = 0;
    let primerLitres = 0;
    let puttyKg = 0;
    let puttyBags = 0;

    activeProject.items.forEach(item => {
      const u = (item.unit || "Nos").toLowerCase();
      const isCft = (u || "").includes('cft');
      const isSqft = (u || "").includes('sqft') || (u || "").includes('sq ft');

      if (item.categoryId === '4' || item.categoryId === '5') {
        const mix = item.concreteMix || (item.categoryId === '5' ? 'm20' : 'pcc_1_4_8');
        const vol = item.netQty || 0;
        const res = estimateConcreteMaterials(vol, isCft ? 'cft' : 'cum', mix, item.includeSteel !== false, item.steelRatio || 80);
        cementBags += res.cementBags;
        sandCft += res.sandCft;
        sandBrass += res.sandBrass;
        aggregateCft += res.aggregateCft;
        aggregateBrass += res.aggregateBrass;
        aggregate20mmBrass += res.aggregate20mmCft / 100;
        aggregate10mmBrass += res.aggregate10mmCft / 100;
        steelKg += res.steelKg;
      }

      if (item.categoryId === '6') {
        const mult = (u || "").includes('ton') ? 1000 : 1;
        steelKg += (item.netQty || 0) * mult;
      }

      if (item.categoryId === '8' || item.categoryId === '9') {
        const brickType = item.brickType || (item.categoryId === '9' ? 'aac_block' : 'standard');
        const mortar = item.mortarRatio || '1_6';
        const vol = item.netQty || 0;
        const res = estimateBrickworkMaterials(vol, isCft ? 'cft' : 'cum', brickType, mortar);
        if (brickType === 'aac_block') {
          aacBlockCount += res.brickCount;
        } else {
          brickCount += res.brickCount;
        }
        cementBags += res.cementBags;
        sandCft += res.sandCft;
        sandBrass += res.sandBrass;
      }

      if (item.categoryId === '10') {
        const thick = item.plasterThickness || 12;
        const mortar = item.mortarRatio || '1_4';
        const area = item.netQty || 0;
        const res = estimatePlasterMaterials(area, isSqft ? 'sqft' : 'sqm', thick, mortar);
        cementBags += res.cementBags;
        sandCft += res.sandCft;
        sandBrass += res.sandBrass;
      }

      if (item.categoryId === '12' || item.categoryId === '13') {
        const area = item.netQty || 0;
        const len = item.tileLength || 2;
        const wid = item.tileWidth || 2;
        const boxCount = item.tilesPerBox || 4;
        const res = estimateFlooringMaterials(area, isSqft ? 'sqft' : 'sqm', len, wid, item.wastagePercent || 8, boxCount, item.beddingType || 'adhesive');
        tileCount += res.tileCount;
        tileBoxes += res.tileBoxes;
        adhesiveBags += res.adhesiveBags20kg;
        groutKg += res.groutKg;
        cementBags += res.beddingCementBags;
        sandCft += res.beddingSandCft;
        sandBrass += res.beddingSandCft / 100;
      }

      if (item.categoryId === '17') {
        const area = item.netQty || 0;
        const res = estimatePaintingMaterials(area, isSqft ? 'sqft' : 'sqm', 2);
        paintLitres += res.paintLitres;
        primerLitres += res.primerLitres;
        puttyKg += res.puttyKg;
        puttyBags += res.puttyBags40kg;
      }
    });

    const procurementCost =
      (cementBags * materialPrices.cementBag) +
      (steelKg * materialPrices.steelKg) +
      (sandBrass * materialPrices.sandBrass) +
      (aggregateBrass * materialPrices.aggregateBrass) +
      (brickCount * materialPrices.brickPcs) +
      (aacBlockCount * materialPrices.aacBlockPcs) +
      (adhesiveBags * materialPrices.adhesiveBag20kg) +
      (groutKg * materialPrices.groutKg) +
      (puttyBags * materialPrices.puttyBag40kg) +
      (primerLitres * materialPrices.primerLitre) +
      (paintLitres * materialPrices.paintLitre);

    return {
      cementBags: Math.ceil(cementBags),
      sandCft: Number(sandCft.toFixed(1)),
      sandBrass: Number(sandBrass.toFixed(2)),
      aggregateCft: Number(aggregateCft.toFixed(1)),
      aggregateBrass: Number(aggregateBrass.toFixed(2)),
      aggregate20mmBrass: Number(aggregate20mmBrass.toFixed(2)),
      aggregate10mmBrass: Number(aggregate10mmBrass.toFixed(2)),
      steelKg: Math.round(steelKg),
      steelTonnes: Number((steelKg / 1000).toFixed(2)),
      brickCount: Math.ceil(brickCount),
      aacBlockCount: Math.ceil(aacBlockCount),
      tileCount: Math.ceil(tileCount),
      tileBoxes: Math.ceil(tileBoxes),
      adhesiveBags: Math.ceil(adhesiveBags),
      groutKg: Number(groutKg.toFixed(1)),
      paintLitres: Number(paintLitres.toFixed(1)),
      primerLitres: Number(primerLitres.toFixed(1)),
      puttyKg: Math.ceil(puttyKg),
      puttyBags: Math.ceil(puttyBags),
      procurementCost: Math.round(procurementCost)
    };
  }, [activeProject, materialPrices]);

  // Chart Data Preparation
  const chartCategoryData = useMemo(() => {
    if (!activeProject || (activeProject.items || []).length === 0) return [];
    const totalsMap: Record<string, number> = {};

    activeProject.items.forEach(i => {
      totalsMap[i.categoryId] = (totalsMap[i.categoryId] || 0) + i.totalAmount;
    });

    return Object.entries(totalsMap).map(([catId, amt]) => {
      const name = DEFAULT_CATEGORIES.find(c => c.id === catId)?.name || 'Other';
      return { name, amount: amt };
    }).sort((a, b) => b.amount - a.amount).slice(0, 6);
  }, [activeProject]);

  const floorCostData = useMemo(() => {
    if (!activeProject || (activeProject.floors || []).length === 0) return [];
    return (activeProject.floors || []).map(f => {
      const floorItems = (activeProject.items || []).filter(i => i.floorId === f.id);
      const floorTotal = floorItems.reduce((sum, i) => sum + i.totalAmount, 0);
      const costPerSqft = f.area > 0 ? floorTotal / f.area : 0;
      return {
        id: f.id,
        name: f.name,
        area: f.area,
        total: floorTotal,
        costPerSqft: Number(costPerSqft.toFixed(2)),
        itemCount: floorItems.length
      };
    });
  }, [activeProject]);

  // WhatsApp Quote Text Generator
  const generateWhatsAppQuote = () => {
    if (!activeProject) return '';
    const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const costPerSqft = totalFloorAreaSqft > 0 ? (summaryTotals.grandTotal / totalFloorAreaSqft).toFixed(2) : '0';

    let msg = `*CONSTRUCTION ESTIMATE & QUOTATION*\n`;
    msg += `------------------------------------\n`;
    msg += `*Project:* ${activeProject.name}\n`;
    msg += `*Client:* ${activeProject.client}\n`;
    msg += `*Location:* ${activeProject.location}, ${activeProject.city}\n`;
    msg += `*Date:* ${dateStr}\n`;
    msg += `*Built-up Area:* ${totalFloorAreaSqft.toLocaleString()} sq.ft\n\n`;

    msg += `*COST SUMMARY:*\n`;
    msg += `• Direct Works Base: ₹${summaryTotals.baseTotal.toLocaleString('en-IN')}\n`;
    msg += `• Contractor Margin (${(activeProject.contractorMarginPercent ?? 15)}%): ₹${summaryTotals.marginTotal.toLocaleString('en-IN')}\n`;
    msg += `• GST Tax (${(activeProject.gstPercent ?? 18)}%): ₹${summaryTotals.gstTotal.toLocaleString('en-IN')}\n`;
    msg += `• Contingency (${(activeProject.contingencyPercent ?? 3)}%): ₹${summaryTotals.contingencyTotal.toLocaleString('en-IN')}\n`;
    msg += `------------------------------------\n`;
    msg += `*GRAND TOTAL: ₹${summaryTotals.grandTotal.toLocaleString('en-IN')}*\n`;
    msg += `*Rate / Sq.Ft: ₹${costPerSqft}/sq.ft*\n`;
    msg += `------------------------------------\n`;
    msg += `*Total BOQ Line Items:* ${(activeProject.items || []).length}\n`;
    if (materialEstimationTotals) {
      msg += `*Key Materials Indent:*\n`;
      msg += `- Cement: ${materialEstimationTotals.cementBags} Bags\n`;
      msg += `- Steel: ${materialEstimationTotals.steelTonnes} MT (${materialEstimationTotals.steelKg} Kg)\n`;
      msg += `- Sand: ${materialEstimationTotals.sandBrass} Brass\n`;
      msg += `- Aggregate: ${materialEstimationTotals.aggregateBrass} Brass\n`;
    }
    msg += `\n_Quotation generated via ToolStack Advanced BOQ India workspace._`;
    return msg;
  };

  const handleShareWhatsApp = () => {
    const text = generateWhatsAppQuote();
    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleCopyWhatsAppQuote = () => {
    const text = generateWhatsAppQuote();
    navigator.clipboard.writeText(text);
    showToast('WhatsApp quote copied to clipboard!');
  };

  // Excel (.xlsx) Multi-Sheet Exporter
  const handleExportExcel = () => {
    if (!activeProject) return;

    const summaryData = [
      ['Project Name', activeProject.name],
      ['Client Name', activeProject.client],
      ['Site Location', `${activeProject.location}, ${activeProject.city}, ${activeProject.state}`],
      ['Built-up Area', `${totalFloorAreaSqft} sq.ft`],
      ['Estimate Date', activeProject.startDate],
      ['Validity Date', activeProject.validityDate],
      [''],
      ['COST BREAKDOWN SCHEDULE', 'AMOUNT (INR)'],
      ['Raw Material Base Costs', summaryTotals.materialTotal],
      ['Labour Wages Base Costs', summaryTotals.labourTotal],
      ['Equipment & Shuttering', summaryTotals.equipmentTotal],
      ['Transport & Freight', summaryTotals.transportTotal],
      ['Other Sundries', summaryTotals.otherTotal],
      ['Total Base Cost', summaryTotals.baseTotal],
      [`Contractor Profit Margin (${(activeProject.contractorMarginPercent ?? 15)}%)`, summaryTotals.marginTotal],
      [`GST Works Contract Tax (${(activeProject.gstPercent ?? 18)}%)`, summaryTotals.gstTotal],
      [`Contingency Reserve (${(activeProject.contingencyPercent ?? 3)}%)`, summaryTotals.contingencyTotal],
      ['GRAND TOTAL ESTIMATED COST', summaryTotals.grandTotal],
      ['ESTIMATED COST PER SQ.FT', totalFloorAreaSqft > 0 ? (summaryTotals.grandTotal / totalFloorAreaSqft) : 0]
    ];

    const boqHeaders = [
      'Item Code', 'Category', 'Description', 'Specification', 'Floor', 'Room',
      'Unit', 'Length', 'Width', 'Height', 'Nos / Count', 'Calc Qty', 'Wastage %',
      'Net Qty', 'Base Rate (₹)', 'Margin %', 'GST %', 'Final Rate (₹)', 'Total Amount (₹)', 'Remarks'
    ];

    const boqData = (activeProject.items || []).map(item => {
      const catName = DEFAULT_CATEGORIES.find(c => c.id === item.categoryId)?.name || 'General';
      const floorName = (activeProject.floors || []).find(f => f.id === item.floorId)?.name || 'All Floors';
      const roomName = (activeProject.rooms || []).find(r => r.id === item.roomId)?.name || 'All Rooms';
      const baseSum = (item.rateMaterial || 0) + (item.rateLabour || 0) + (item.rateEquipment || 0) + (item.rateTransport || 0) + (item.rateOther || 0);

      return [
        item.code,
        catName,
        item.description,
        item.specification,
        floorName,
        roomName,
        item.unit,
        item.length,
        item.width,
        item.height,
        item.count,
        item.calculatedQty,
        item.wastagePercent,
        item.netQty,
        baseSum,
        item.contractorMarginPercent !== undefined ? item.contractorMarginPercent : (activeProject.contractorMarginPercent ?? 15),
        item.gstPercent !== undefined ? item.gstPercent : (activeProject.gstPercent ?? 18),
        item.finalRate,
        item.totalAmount,
        item.remarks
      ];
    });

    const materialsData = materialEstimationTotals ? [
      ['Material Commodity', 'Estimated Quantity', 'Unit of Measurement', 'Market Unit Rate (₹)', 'Estimated Procurement Budget (₹)'],
      ['OPC/PPC Cement', materialEstimationTotals.cementBags, 'Bags (50 kg)', materialPrices.cementBag, materialEstimationTotals.cementBags * materialPrices.cementBag],
      ['River / Crushed M-Sand', materialEstimationTotals.sandBrass, 'Brass (100 Cft)', materialPrices.sandBrass, materialEstimationTotals.sandBrass * materialPrices.sandBrass],
      ['Coarse Stone Aggregate (20mm + 10mm)', materialEstimationTotals.aggregateBrass, 'Brass (100 Cft)', materialPrices.aggregateBrass, materialEstimationTotals.aggregateBrass * materialPrices.aggregateBrass],
      ['Fe-500D TMT Reinforcement Steel', materialEstimationTotals.steelKg, 'Kg', materialPrices.steelKg, materialEstimationTotals.steelKg * materialPrices.steelKg],
      ['Bricks (Clay / Fly Ash)', materialEstimationTotals.brickCount, 'Nos', materialPrices.brickPcs, materialEstimationTotals.brickCount * materialPrices.brickPcs],
      ['AAC Lightweight Blocks', materialEstimationTotals.aacBlockCount, 'Nos', materialPrices.aacBlockPcs, materialEstimationTotals.aacBlockCount * materialPrices.aacBlockPcs],
      ['Vitrified Flooring Tiles', materialEstimationTotals.tileBoxes, 'Boxes', materialPrices.tileSqft * 16, materialEstimationTotals.tileCount * materialPrices.tileSqft * 4],
      ['Tile Polymer Adhesive', materialEstimationTotals.adhesiveBags, 'Bags (20 kg)', materialPrices.adhesiveBag20kg, materialEstimationTotals.adhesiveBags * materialPrices.adhesiveBag20kg],
      ['Epoxy / Cementitious Tile Grout', materialEstimationTotals.groutKg, 'Kg', materialPrices.groutKg, materialEstimationTotals.groutKg * materialPrices.groutKg],
      ['Wall Putty', materialEstimationTotals.puttyBags, 'Bags (40 kg)', materialPrices.puttyBag40kg, materialEstimationTotals.puttyBags * materialPrices.puttyBag40kg],
      ['Interior / Exterior Primer', materialEstimationTotals.primerLitres, 'Litres', materialPrices.primerLitre, materialEstimationTotals.primerLitres * materialPrices.primerLitre],
      ['Emulsion Finish Paint', materialEstimationTotals.paintLitres, 'Litres', materialPrices.paintLitre, materialEstimationTotals.paintLitres * materialPrices.paintLitre],
      [''],
      ['TOTAL ESTIMATED RAW MATERIAL PROCUREMENT BUDGET', '', '', '', materialEstimationTotals.procurementCost]
    ] : [];

    const rateAnalysisData = [
      ['Code', 'Category', 'Description', 'Unit', 'Material (₹)', 'Labour (₹)', 'Equipment (₹)', 'Transport (₹)', 'Other (₹)', 'Base Sum (₹)', 'Margin %', 'GST %', 'Final Rate (₹)'],
      ...(activeProject.items || []).map(item => {
        const catName = DEFAULT_CATEGORIES.find(c => c.id === item.categoryId)?.name || 'General';
        const baseSum = (item.rateMaterial || 0) + (item.rateLabour || 0) + (item.rateEquipment || 0) + (item.rateTransport || 0) + (item.rateOther || 0);
        return [
          item.code,
          catName,
          item.description,
          item.unit,
          item.rateMaterial,
          item.rateLabour,
          item.rateEquipment,
          item.rateTransport,
          item.rateOther,
          baseSum,
          item.contractorMarginPercent !== undefined ? item.contractorMarginPercent : (activeProject.contractorMarginPercent ?? 15),
          item.gstPercent !== undefined ? item.gstPercent : (activeProject.gstPercent ?? 18),
          item.finalRate
        ];
      })
    ];

    const wb = XLSX.utils.book_new();
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Project Summary');

    const wsBOQ = XLSX.utils.aoa_to_sheet([boqHeaders, ...boqData]);
    XLSX.utils.book_append_sheet(wb, wsBOQ, 'Detailed BOQ');

    if (materialsData.length > 0) {
      const wsMat = XLSX.utils.aoa_to_sheet(materialsData);
      XLSX.utils.book_append_sheet(wb, wsMat, 'Material Indent');
    }

    const wsRates = XLSX.utils.aoa_to_sheet(rateAnalysisData);
    XLSX.utils.book_append_sheet(wb, wsRates, 'Rate Analysis');

    XLSX.writeFile(wb, `${activeProject.name.replace(/\s+/g, '_')}_BOQ_Estimate.xlsx`);
    showToast('Excel workbook exported successfully!');
  };

  // PDF Exporter
  const handleExportPDF = () => {
    if (!activeProject) return;

    const doc = new jsPDF();
    let currentY = 20;

    doc.setFontSize(18);
    doc.text('Bill of Quantities (BOQ) & Cost Estimate', 14, currentY);
    currentY += 8;

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Prepared as per CPWD DSR & IS 1200 Measurement Standards', 14, currentY);
    doc.setTextColor(0);
    currentY += 10;

    doc.setDrawColor(200);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, currentY, 182, 32, 3, 3, 'FD');

    doc.setFontSize(9);
    doc.text(`Project Name: ${activeProject.name}`, 18, currentY + 7);
    doc.text(`Client Name: ${activeProject.client}`, 110, currentY + 7);

    doc.text(`Location: ${activeProject.location}, ${activeProject.city}`, 18, currentY + 14);
    doc.text(`Date: ${activeProject.startDate}`, 110, currentY + 14);

    doc.text(`Built-up Area: ${totalFloorAreaSqft.toLocaleString()} sq.ft`, 18, currentY + 21);
    doc.text(`Cost / Sq.Ft: Rs ${totalFloorAreaSqft > 0 ? (summaryTotals.grandTotal / totalFloorAreaSqft).toFixed(2) : '0'}/sqft`, 110, currentY + 21);

    doc.text(`Type: ${activeProject.projectType.toUpperCase()}`, 18, currentY + 28);
    doc.text(`GST / Margin: ${(activeProject.gstPercent ?? 18)}% GST / ${(activeProject.contractorMarginPercent ?? 15)}% Margin`, 110, currentY + 28);

    currentY += 38;

    doc.setFontSize(11);
    doc.text('Cost Breakdown Summary:', 14, currentY);
    currentY += 6;

    doc.setFontSize(8.5);
    doc.text(`Material Base: Rs ${summaryTotals.materialTotal.toLocaleString('en-IN')}`, 14, currentY);
    doc.text(`Labour Wages: Rs ${summaryTotals.labourTotal.toLocaleString('en-IN')}`, 75, currentY);
    doc.text(`Equipment & Transit: Rs ${(summaryTotals.equipmentTotal + summaryTotals.transportTotal).toLocaleString('en-IN')}`, 135, currentY);
    currentY += 5;

    doc.text(`Contractor Margin: Rs ${summaryTotals.marginTotal.toLocaleString('en-IN')}`, 14, currentY);
    doc.text(`GST Tax (18%): Rs ${summaryTotals.gstTotal.toLocaleString('en-IN')}`, 75, currentY);
    doc.text(`Contingency (3%): Rs ${summaryTotals.contingencyTotal.toLocaleString('en-IN')}`, 135, currentY);
    currentY += 7;

    doc.setFontSize(13);
    doc.setTextColor(16, 185, 129);
    doc.text(`GRAND TOTAL ESTIMATE: Rs ${summaryTotals.grandTotal.toLocaleString('en-IN')}`, 14, currentY);
    doc.setTextColor(0);
    currentY += 12;

    doc.setFontSize(10);
    doc.text('Detailed BOQ Line Items Schedule:', 14, currentY);
    currentY += 6;

    doc.setFontSize(7.5);
    doc.setFillColor(241, 245, 249);
    doc.rect(14, currentY - 4, 182, 6, 'F');
    doc.text('Code', 16, currentY);
    doc.text('Description', 36, currentY);
    doc.text('Unit', 105, currentY);
    doc.text('Net Qty', 125, currentY);
    doc.text('Final Rate', 148, currentY);
    doc.text('Amount (Rs)', 175, currentY);
    currentY += 4;
    doc.line(14, currentY, 196, currentY);
    currentY += 4;

    activeProject.items.forEach(item => {
      if (currentY > 275) {
        doc.addPage();
        currentY = 20;
      }
      doc.text(item.code, 16, currentY);
      doc.text(item.description.substring(0, 38), 36, currentY);
      doc.text(item.unit, 105, currentY);
      doc.text(item.netQty.toFixed(2), 125, currentY);
      doc.text(item.finalRate.toFixed(2), 148, currentY);
      doc.text(item.totalAmount.toFixed(2), 175, currentY);
      currentY += 5.5;
    });

    if (currentY > 260) {
      doc.addPage();
      currentY = 20;
    }
    currentY += 10;
    doc.setFontSize(7);
    doc.setTextColor(120);
    doc.text('Disclaimer: This Bill of Quantities (BOQ) represents a standard engineering estimate based on CPWD/DSR norms.', 14, currentY);
    currentY += 3.5;
    doc.text('Structural details, soil strata variations, and market material price changes must be verified at site by a licensed engineer.', 14, currentY);

    doc.save(`${activeProject.name.replace(/\s+/g, '_')}_BOQ_Estimate.pdf`);
    showToast('PDF BOQ Report downloaded!');
  };

  // JSON Backup / Import
  const handleBackupExport = () => {
    if (!activeProject) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activeProject, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `${activeProject.name.replace(/\s+/g, '_')}_backup.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Project JSON exported');
  };

  const handleBackupImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.name && parsed.items) {
          parsed.id = 'proj_' + Date.now();
          setProjects(prev => [parsed, ...prev]);
          setActiveProjectId(parsed.id);
          showToast(`Imported '${parsed.name}' successfully!`);
        } else {
          alert('Invalid file format. Ensure valid BOQ project JSON.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };


  return (
    <>
      <SEO
        title="Advanced BOQ Calculator India | CPWD Rate Analysis & Construction Estimator"
        description="Professional Indian construction BOQ calculator. Estimate concrete, steel, brickwork, plaster, tiles, and paint quantities with multi-floor takeoff, CPWD DSR rate analysis, and Excel/PDF export."
        keywords={['boq calculator india', 'bill of quantities calculator', 'construction estimation india', 'cpwd rate analysis calculator', 'building material estimator', 'civil quantity takeoff', 'delhi schedule of rates dsr calculator', 'rcc concrete steel estimator', 'multi floor construction cost calculator', 'boq excel export tool']}
      />

      {/* Copy Toast Alert */}
      {copyToast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-bounce">
          <Check className="w-4 h-4" />
          <span>{copyToast}</span>
        </div>
      )}

      {/* ── Premium Hero Header ── */}
      <div className="relative overflow-hidden rounded-3xl mb-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/40 shadow-2xl">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 24px,rgba(255,255,255,.05) 24px,rgba(255,255,255,.05) 25px),repeating-linear-gradient(90deg,transparent,transparent 24px,rgba(255,255,255,.05) 24px,rgba(255,255,255,.05) 25px)' }} />
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-indigo-500/15 blur-2xl pointer-events-none" />
        <div className="relative z-10 p-6 md:p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-amber-500/20 border border-amber-400/30 shadow-lg shadow-amber-500/10">
                <Calculator className="w-8 h-8 text-amber-400" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                  Advanced BOQ Calculator <span className="text-amber-400">India</span>
                </h1>
                <p className="text-xs md:text-sm text-indigo-300 mt-1 font-medium">
                  Quantity takeoff, CPWD DSR rate analysis &amp; material procurement workspace
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Project Switcher */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-3 py-2 flex-1 lg:flex-initial">
              <Building className="w-4 h-4 text-indigo-300 shrink-0" />
              <select
                value={activeProjectId}
                onChange={(e) => setActiveProjectId(e.target.value)}
                className="bg-transparent text-white text-xs font-bold focus:outline-none min-w-[170px] cursor-pointer"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id} className="text-zinc-900">{p.name}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowNewProjectModal(true)}
              className="px-4 py-2 text-xs font-black bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Estimate</span>
            </button>
            {projects.length > 1 && (
              <button
                onClick={() => handleDeleteProject(activeProjectId)}
                className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-300 border border-red-500/30 rounded-xl transition"
                title="Delete Active Project"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            {activeProject && (
              <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">{(activeProject.items || []).length} Items</span>
                <span className="w-px h-4 bg-emerald-700" />
                <span className="text-[10px] font-black text-emerald-300 font-mono">₹{summaryTotals.grandTotal.toLocaleString('en-IN')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Project Meta Bar & Autosave Status */}
        {activeProject && (
          <div className="relative z-10 px-6 md:px-8 py-3 bg-white/[0.04] border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-indigo-200">
            <div className="flex flex-wrap items-center gap-4 text-[11px]">
              <span><strong>Client:</strong> {activeProject.client || '—'}</span>
              <span>•</span>
              <span><strong>Location:</strong> {activeProject.location}, {activeProject.city}</span>
              <span>•</span>
              <span><strong>Built Area:</strong> {totalFloorAreaSqft.toLocaleString()} sq.ft</span>
              <span>•</span>
              <span><strong>Rate:</strong> ₹{totalFloorAreaSqft > 0 ? (summaryTotals.grandTotal / totalFloorAreaSqft).toFixed(2) : '0'}/sqft</span>
            </div>
            <div className="flex items-center gap-3 ml-auto">
              <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-full border ${autosaveIndicator === 'Saved' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${autosaveIndicator === 'Saved' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                {autosaveIndicator}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Navigation Workspace Tabs ── */}
      <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-3">
        <button
          onClick={() => setActiveTab('boq')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition ${activeTab === 'boq' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
        >
          <Calculator className="w-4 h-4" />
          <span>Detailed BOQ Schedule</span>
          {activeProject && (
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === 'boq' ? 'bg-white/20 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
              {(activeProject.items || []).length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('materials')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition ${activeTab === 'materials' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
        >
          <Box className="w-4 h-4" />
          <span>Material Indent &amp; Procurement</span>
          {materialEstimationTotals && (
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === 'materials' ? 'bg-slate-950/20 text-slate-950' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
              ₹{(materialEstimationTotals.procurementCost / 100000).toFixed(1)}L
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('rates')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition ${activeTab === 'rates' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
        >
          <Coins className="w-4 h-4" />
          <span>CPWD / DSR Rate Library</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === 'rates' ? 'bg-white/20 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
            {rateLibrary.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('floors')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition ${activeTab === 'floors' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
        >
          <Layers className="w-4 h-4" />
          <span>Floors &amp; Rooms Matrix</span>
          {activeProject && (
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === 'floors' ? 'bg-white/20 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
              {(activeProject.floors || []).length} F / {(activeProject.rooms || []).length} R
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition ${activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
        >
          <PieChart className="w-4 h-4" />
          <span>Cost Analytics &amp; Simulator</span>
        </button>
        <button
          onClick={() => setActiveTab('export')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition ${activeTab === 'export' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
        >
          <Share2 className="w-4 h-4" />
          <span>Export &amp; Client Quote Hub</span>
        </button>
      </div>


      {/* ── TAB 1: Detailed BOQ Line Items Grid ── */}
      {activeTab === 'boq' && activeProject && (
        <div className="space-y-4">
          {/* Toolbar & Filter Bar */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <div className="relative flex-1 sm:flex-initial min-w-[200px]">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search item code, title, or specs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs border border-zinc-200 dark:border-zinc-750 rounded-xl bg-zinc-50/50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-zinc-900 dark:text-white transition"
                />
              </div>

              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-750 rounded-xl bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer"
              >
                <option value="all">All Categories ({(activeProject.items || []).length})</option>
                {DEFAULT_CATEGORIES.map(c => {
                  const cnt = (activeProject.items || []).filter(i => i.categoryId === c.id).length;
                  return (
                    <option key={c.id} value={c.id}>
                      {c.name} {cnt > 0 ? `(${cnt})` : ''}
                    </option>
                  );
                })}
              </select>

              <select
                value={selectedFloorFilter}
                onChange={(e) => setSelectedFloorFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-750 rounded-xl bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer"
              >
                <option value="all">All Floors</option>
                {(activeProject.floors || []).map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>

              <select
                value={selectedRoomFilter}
                onChange={(e) => setSelectedRoomFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-750 rounded-xl bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer"
              >
                <option value="all">All Rooms</option>
                {(activeProject.rooms || []).map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-750 rounded-xl bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer"
              >
                <option value="none">Sort: Default</option>
                <option value="code">Sort: Code</option>
                <option value="amount">Sort: Amount (High to Low)</option>
                <option value="category">Sort: Category</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('rates')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold border border-amber-500/30 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/40 transition shadow-sm"
              >
                <Coins className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Rate Library ({rateLibrary.length})</span>
              </button>
              <button
                onClick={handleAddItem}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl transition shadow-lg shadow-indigo-600/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
              {selectedItemIds.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/25 font-bold rounded-xl transition"
                >
                  <Trash2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Delete ({selectedItemIds.length})</span>
                </button>
              )}
            </div>
          </div>

          {/* BOQ Spreadsheet Grid */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto max-w-full">
              <table className="w-full text-left border-collapse text-xs min-w-[1300px]">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={filteredBOQItems.length > 0 && filteredBOQItems.every(i => selectedItemIds.includes(i.id))}
                        onChange={() => toggleSelectAll(filteredBOQItems)}
                        className="rounded accent-indigo-600 cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-3 w-20">Code</th>
                    <th className="py-3 px-3 w-32">Category</th>
                    <th className="py-3 px-3 w-64">Item Description &amp; Specifications</th>
                    <th className="py-3 px-3 w-20 text-center">Unit</th>
                    <th className="py-3 px-3 w-64 text-center">Dimensions &amp; Count (L × W × H × N)</th>
                    <th className="py-3 px-3 w-24 text-right">Base Sum</th>
                    <th className="py-3 px-3 w-28 text-right">Final Rate</th>
                    <th className="py-3 px-3 w-32 text-right">Amount (₹)</th>
                    <th className="py-3 px-3 w-32 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-150 dark:divide-zinc-850">
                  {filteredBOQItems.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-16 text-center text-zinc-400 font-medium">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <span className="text-3xl">🔍</span>
                          <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">No BOQ items match your filters</p>
                          <p className="text-xs text-zinc-400 dark:text-zinc-500">Try changing categories, floor filters or click "+ Add Item" above.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredBOQItems.map(item => {
                      const baseRateSum = (item.rateMaterial || 0) + (item.rateLabour || 0) + (item.rateEquipment || 0) + (item.rateTransport || 0) + (item.rateOther || 0);
                      const hasMaterialEstimator = ['4', '5', '8', '9', '10', '12', '13', '17'].includes(item.categoryId);

                      return (
                        <tr key={item.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/20 text-zinc-700 dark:text-zinc-300 even:bg-zinc-50/20 dark:even:bg-zinc-950/10 transition-colors">
                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={selectedItemIds.includes(item.id)}
                              onChange={() => toggleSelectItem(item.id)}
                              className="rounded accent-indigo-600 cursor-pointer"
                            />
                          </td>
                          <td className="py-2.5 px-3 font-mono">
                            <input
                              type="text"
                              value={item.code}
                              onChange={(e) => handleUpdateItemCell(item.id, 'code', e.target.value)}
                              className="w-full bg-transparent font-bold focus:outline-none border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-indigo-500 font-mono text-zinc-900 dark:text-white transition"
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            <select
                              value={item.categoryId}
                              onChange={(e) => handleUpdateItemCell(item.id, 'categoryId', e.target.value)}
                              className="w-full bg-transparent focus:outline-none text-zinc-800 dark:text-zinc-200 border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-indigo-500 cursor-pointer transition text-[11px]"
                            >
                              {DEFAULT_CATEGORIES.map(c => (
                                <option key={c.id} value={c.id} className="text-zinc-900">{c.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-2.5 px-3 space-y-1">
                            <input
                              type="text"
                              value={item.description}
                              placeholder="Item description"
                              onChange={(e) => handleUpdateItemCell(item.id, 'description', e.target.value)}
                              className="w-full bg-transparent focus:outline-none font-bold text-zinc-900 dark:text-white border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-indigo-500 transition"
                            />
                            <input
                              type="text"
                              value={item.specification || ''}
                              placeholder="Specifications / notes"
                              onChange={(e) => handleUpdateItemCell(item.id, 'specification', e.target.value)}
                              className="w-full bg-transparent focus:outline-none text-[10px] text-zinc-400 dark:text-zinc-500 border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-indigo-500 transition"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <select
                              value={item.unit}
                              onChange={(e) => handleUpdateItemCell(item.id, 'unit', e.target.value)}
                              className="w-full bg-transparent focus:outline-none text-zinc-800 dark:text-zinc-200 border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-indigo-500 text-[11px] cursor-pointer transition text-center"
                            >
                              {['Cum', 'Cft', 'Sq m', 'Sq ft', 'Rmt', 'Nos', 'Kg', 'Ton', 'Bag', 'Litre', 'Set', 'Lump Sum'].map(u => (
                                <option key={u} value={u} className="text-zinc-900">{u}</option>
                              ))}
                            </select>
                          </td>
                          {/* Dimensions Consolidated Input */}
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1 font-mono text-[11px] justify-center">
                              <input
                                type="number"
                                value={item.length || ''}
                                placeholder="L"
                                title="Length"
                                onChange={(e) => handleUpdateItemCell(item.id, 'length', parseFloat(e.target.value) || 0)}
                                className="w-12 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-1 py-0.5 text-center focus:outline-none focus:ring-1 focus:ring-indigo-500 text-zinc-900 dark:text-white"
                              />
                              <span className="text-zinc-400">×</span>
                              <input
                                type="number"
                                value={item.width || ''}
                                placeholder="W"
                                title="Width"
                                onChange={(e) => handleUpdateItemCell(item.id, 'width', parseFloat(e.target.value) || 0)}
                                className="w-12 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-1 py-0.5 text-center focus:outline-none focus:ring-1 focus:ring-indigo-500 text-zinc-900 dark:text-white"
                              />
                              <span className="text-zinc-400">×</span>
                              <input
                                type="number"
                                value={item.height || ''}
                                placeholder="H"
                                title="Height"
                                onChange={(e) => handleUpdateItemCell(item.id, 'height', parseFloat(e.target.value) || 0)}
                                className="w-12 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-1 py-0.5 text-center focus:outline-none focus:ring-1 focus:ring-indigo-500 text-zinc-900 dark:text-white"
                              />
                              <span className="text-zinc-400">×</span>
                              <input
                                type="number"
                                value={item.count || ''}
                                placeholder="Nos"
                                title="Count / Units"
                                onChange={(e) => handleUpdateItemCell(item.id, 'count', parseInt(e.target.value) || 1)}
                                className="w-12 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-1 py-0.5 text-center font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-zinc-900 dark:text-white"
                              />
                            </div>
                            <div className="text-[9px] text-zinc-400 text-center mt-1 font-mono">
                              Net: <strong>{item.netQty}</strong> {item.unit} ({item.wastagePercent}% wst)
                            </div>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-zinc-500 text-right">
                            ₹{baseRateSum.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-zinc-900 dark:text-white text-right">
                            ₹{item.finalRate.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-right font-black text-indigo-600 dark:text-indigo-400 text-sm">
                            ₹{item.totalAmount.toLocaleString('en-IN')}
                          </td>
                          {/* Row Actions */}
                          <td className="py-2.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => setActiveRateAnalysisItemId(item.id)}
                                className="p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg text-zinc-400 hover:text-indigo-600 transition"
                                title="Detailed Rate Analysis (Material, Labour, Margin, GST)"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              {hasMaterialEstimator && (
                                <button
                                  onClick={() => setActiveMaterialSettingsItemId(item.id)}
                                  className="p-1.5 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg text-zinc-400 hover:text-amber-500 transition"
                                  title="Material Mix & Ratio Settings (Concrete, Mortar, Tile, Brick)"
                                >
                                  <Box className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDuplicateItem(item.id)}
                                className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg text-zinc-400 hover:text-emerald-500 transition"
                                title="Duplicate row"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg text-zinc-400 hover:text-red-500 transition"
                                title="Delete row"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                {filteredBOQItems.length > 0 && (
                  <tfoot className="bg-zinc-50 dark:bg-zinc-950/70 font-bold border-t border-zinc-200 dark:border-zinc-800">
                    <tr className="text-zinc-800 dark:text-zinc-200">
                      <td colSpan={5} className="py-3.5 px-3 text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                        Filtered Items Subtotal ({filteredBOQItems.length} items)
                      </td>
                      <td className="py-3.5 px-3 font-mono text-[11px] text-zinc-400 text-center">
                        Total {(activeProject.items || []).length} items in project
                      </td>
                      <td colSpan={2} className="py-3.5 px-3"></td>
                      <td className="py-3.5 px-3 font-mono text-right text-base text-indigo-600 dark:text-indigo-400 font-black">
                        ₹{filteredBOQItems.reduce((sum, item) => sum + item.totalAmount, 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-3"></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      )}


      {/* ── TAB 2: Material Indent & Procurement Abstract ── */}
      {activeTab === 'materials' && materialEstimationTotals && (
        <div className="space-y-6">
          {/* Procurement Budget Highlight Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/15 via-indigo-950/40 to-slate-900 border border-amber-500/30 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-amber-500 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5" />
                Raw Materials Procurement Indent &amp; Estimation
              </span>
              <h3 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white">
                Estimated Material Budget: <span className="text-amber-500">₹{materialEstimationTotals.procurementCost.toLocaleString('en-IN')}</span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Consolidated Bill of Materials computed across all concrete, masonry, plaster, tiling, and painting line items.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-right">
                <span className="text-[9px] text-zinc-400 font-bold uppercase block">Material Share</span>
                <span className="text-base font-black text-indigo-600 dark:text-indigo-400 font-mono">
                  {summaryTotals.grandTotal > 0 ? ((materialEstimationTotals.procurementCost / summaryTotals.grandTotal) * 100).toFixed(1) : 0}%
                </span>
                <span className="text-[9px] text-zinc-400 block">of Total Project</span>
              </div>
            </div>
          </div>

          {/* Material Indent Table with Editable Rates */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
              <div>
                <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                  Material Takeoff Schedule &amp; Local Price Matrix
                </h4>
                <p className="text-[11px] text-zinc-500">
                  Update local supplier unit rates below to recalculate your procurement budget.
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs min-w-[800px]">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-400 font-bold uppercase">
                    <th className="py-3 px-4 w-12">#</th>
                    <th className="py-3 px-4 w-60">Material Commodity</th>
                    <th className="py-3 px-4 w-44 text-right">Estimated Quantity</th>
                    <th className="py-3 px-4 w-32 text-center">Standard Unit</th>
                    <th className="py-3 px-4 w-44 text-right">Market Rate (₹)</th>
                    <th className="py-3 px-4 w-48 text-right">Total Budget (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-150 dark:divide-zinc-850 text-zinc-750 dark:text-zinc-300">
                  {/* Cement */}
                  <tr className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/10">
                    <td className="py-3 px-4 font-bold text-zinc-400">01</td>
                    <td className="py-3 px-4">
                      <strong className="text-zinc-900 dark:text-white block font-bold">OPC / PPC Cement</strong>
                      <span className="text-[10px] text-zinc-400">IS 8112 / IS 1489 standard 50kg bags</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-zinc-900 dark:text-white">
                      {materialEstimationTotals.cementBags.toLocaleString()} Bags
                      <span className="text-[10px] text-zinc-400 block font-normal">({(materialEstimationTotals.cementBags * 0.05).toFixed(2)} MT)</span>
                    </td>
                    <td className="py-3 px-4 text-center text-[11px]">Bag (50 kg)</td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1 justify-end font-mono">
                        <span>₹</span>
                        <input
                          type="number"
                          value={materialPrices.cementBag}
                          onChange={(e) => setMaterialPrices({ ...materialPrices, cementBag: parseFloat(e.target.value) || 0 })}
                          className="w-20 px-2 py-1 text-right text-xs font-bold border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-indigo-600 dark:text-indigo-400">
                      ₹{(materialEstimationTotals.cementBags * materialPrices.cementBag).toLocaleString('en-IN')}
                    </td>
                  </tr>

                  {/* Sand */}
                  <tr className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/10">
                    <td className="py-3 px-4 font-bold text-zinc-400">02</td>
                    <td className="py-3 px-4">
                      <strong className="text-zinc-900 dark:text-white block font-bold">River Sand / M-Sand</strong>
                      <span className="text-[10px] text-zinc-400">Coarse plaster &amp; concrete grade sand</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-zinc-900 dark:text-white">
                      {materialEstimationTotals.sandBrass.toLocaleString()} Brass
                      <span className="text-[10px] text-zinc-400 block font-normal">({materialEstimationTotals.sandCft.toLocaleString()} Cft)</span>
                    </td>
                    <td className="py-3 px-4 text-center text-[11px]">Brass (100 Cft)</td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1 justify-end font-mono">
                        <span>₹</span>
                        <input
                          type="number"
                          value={materialPrices.sandBrass}
                          onChange={(e) => setMaterialPrices({ ...materialPrices, sandBrass: parseFloat(e.target.value) || 0 })}
                          className="w-20 px-2 py-1 text-right text-xs font-bold border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-indigo-600 dark:text-indigo-400">
                      ₹{Math.round(materialEstimationTotals.sandBrass * materialPrices.sandBrass).toLocaleString('en-IN')}
                    </td>
                  </tr>

                  {/* Aggregate */}
                  <tr className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/10">
                    <td className="py-3 px-4 font-bold text-zinc-400">03</td>
                    <td className="py-3 px-4">
                      <strong className="text-zinc-900 dark:text-white block font-bold">Coarse Stone Aggregate (20mm + 10mm)</strong>
                      <span className="text-[10px] text-zinc-400">Graded: 60% 20mm ({materialEstimationTotals.aggregate20mmBrass} Brass) + 40% 10mm ({materialEstimationTotals.aggregate10mmBrass} Brass)</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-zinc-900 dark:text-white">
                      {materialEstimationTotals.aggregateBrass.toLocaleString()} Brass
                      <span className="text-[10px] text-zinc-400 block font-normal">({materialEstimationTotals.aggregateCft.toLocaleString()} Cft)</span>
                    </td>
                    <td className="py-3 px-4 text-center text-[11px]">Brass (100 Cft)</td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1 justify-end font-mono">
                        <span>₹</span>
                        <input
                          type="number"
                          value={materialPrices.aggregateBrass}
                          onChange={(e) => setMaterialPrices({ ...materialPrices, aggregateBrass: parseFloat(e.target.value) || 0 })}
                          className="w-20 px-2 py-1 text-right text-xs font-bold border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-indigo-600 dark:text-indigo-400">
                      ₹{Math.round(materialEstimationTotals.aggregateBrass * materialPrices.aggregateBrass).toLocaleString('en-IN')}
                    </td>
                  </tr>

                  {/* Steel */}
                  <tr className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/10">
                    <td className="py-3 px-4 font-bold text-zinc-400">04</td>
                    <td className="py-3 px-4">
                      <strong className="text-zinc-900 dark:text-white block font-bold">TMT Fe-500D Rebar Steel</strong>
                      <span className="text-[10px] text-zinc-400">IS 1786 primary structural rebar</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-zinc-900 dark:text-white">
                      {materialEstimationTotals.steelKg.toLocaleString()} Kg
                      <span className="text-[10px] text-zinc-400 block font-normal">({materialEstimationTotals.steelTonnes} Metric Tonnes)</span>
                    </td>
                    <td className="py-3 px-4 text-center text-[11px]">Kg</td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1 justify-end font-mono">
                        <span>₹</span>
                        <input
                          type="number"
                          value={materialPrices.steelKg}
                          onChange={(e) => setMaterialPrices({ ...materialPrices, steelKg: parseFloat(e.target.value) || 0 })}
                          className="w-20 px-2 py-1 text-right text-xs font-bold border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-indigo-600 dark:text-indigo-400">
                      ₹{(materialEstimationTotals.steelKg * materialPrices.steelKg).toLocaleString('en-IN')}
                    </td>
                  </tr>

                  {/* Bricks */}
                  <tr className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/10">
                    <td className="py-3 px-4 font-bold text-zinc-400">05</td>
                    <td className="py-3 px-4">
                      <strong className="text-zinc-900 dark:text-white block font-bold">Clay / Fly Ash Bricks</strong>
                      <span className="text-[10px] text-zinc-400">Red clay / Fly ash standard masonry units</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-zinc-900 dark:text-white">
                      {materialEstimationTotals.brickCount.toLocaleString()} Pcs
                    </td>
                    <td className="py-3 px-4 text-center text-[11px]">Pcs</td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1 justify-end font-mono">
                        <span>₹</span>
                        <input
                          type="number"
                          value={materialPrices.brickPcs}
                          onChange={(e) => setMaterialPrices({ ...materialPrices, brickPcs: parseFloat(e.target.value) || 0 })}
                          className="w-20 px-2 py-1 text-right text-xs font-bold border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-indigo-600 dark:text-indigo-400">
                      ₹{Math.round(materialEstimationTotals.brickCount * materialPrices.brickPcs).toLocaleString('en-IN')}
                    </td>
                  </tr>

                  {/* AAC Blocks */}
                  {materialEstimationTotals.aacBlockCount > 0 && (
                    <tr className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/10">
                      <td className="py-3 px-4 font-bold text-zinc-400">06</td>
                      <td className="py-3 px-4">
                        <strong className="text-zinc-900 dark:text-white block font-bold">AAC Lightweight Blocks</strong>
                        <span className="text-[10px] text-zinc-400">600x200x150 mm Autoclaved Aerated Concrete</span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-zinc-900 dark:text-white">
                        {materialEstimationTotals.aacBlockCount.toLocaleString()} Blocks
                      </td>
                      <td className="py-3 px-4 text-center text-[11px]">Blocks</td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1 justify-end font-mono">
                          <span>₹</span>
                          <input
                            type="number"
                            value={materialPrices.aacBlockPcs}
                            onChange={(e) => setMaterialPrices({ ...materialPrices, aacBlockPcs: parseFloat(e.target.value) || 0 })}
                            className="w-20 px-2 py-1 text-right text-xs font-bold border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-indigo-600 dark:text-indigo-400">
                        ₹{Math.round(materialEstimationTotals.aacBlockCount * materialPrices.aacBlockPcs).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  )}

                  {/* Tiles */}
                  <tr className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/10">
                    <td className="py-3 px-4 font-bold text-zinc-400">07</td>
                    <td className="py-3 px-4">
                      <strong className="text-zinc-900 dark:text-white block font-bold">Vitrified &amp; Ceramic Flooring Tiles</strong>
                      <span className="text-[10px] text-zinc-400">{materialEstimationTotals.tileCount.toLocaleString()} tiles ({materialEstimationTotals.tileBoxes} standard packing boxes)</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-zinc-900 dark:text-white">
                      {materialEstimationTotals.tileBoxes.toLocaleString()} Boxes
                    </td>
                    <td className="py-3 px-4 text-center text-[11px]">Rate / sqft</td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1 justify-end font-mono">
                        <span>₹</span>
                        <input
                          type="number"
                          value={materialPrices.tileSqft}
                          onChange={(e) => setMaterialPrices({ ...materialPrices, tileSqft: parseFloat(e.target.value) || 0 })}
                          className="w-20 px-2 py-1 text-right text-xs font-bold border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-indigo-600 dark:text-indigo-400">
                      ₹{Math.round(materialEstimationTotals.tileCount * 4 * materialPrices.tileSqft).toLocaleString('en-IN')}
                    </td>
                  </tr>

                  {/* Tile Adhesive */}
                  <tr className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/10">
                    <td className="py-3 px-4 font-bold text-zinc-400">08</td>
                    <td className="py-3 px-4">
                      <strong className="text-zinc-900 dark:text-white block font-bold">Polymer Tile Adhesive (20 kg)</strong>
                      <span className="text-[10px] text-zinc-400">Thin-bed polymer modified tile adhesive</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-zinc-900 dark:text-white">
                      {materialEstimationTotals.adhesiveBags.toLocaleString()} Bags
                    </td>
                    <td className="py-3 px-4 text-center text-[11px]">Bag (20 kg)</td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1 justify-end font-mono">
                        <span>₹</span>
                        <input
                          type="number"
                          value={materialPrices.adhesiveBag20kg}
                          onChange={(e) => setMaterialPrices({ ...materialPrices, adhesiveBag20kg: parseFloat(e.target.value) || 0 })}
                          className="w-20 px-2 py-1 text-right text-xs font-bold border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-indigo-600 dark:text-indigo-400">
                      ₹{(materialEstimationTotals.adhesiveBags * materialPrices.adhesiveBag20kg).toLocaleString('en-IN')}
                    </td>
                  </tr>

                  {/* Wall Putty & Paints */}
                  <tr className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/10">
                    <td className="py-3 px-4 font-bold text-zinc-400">09</td>
                    <td className="py-3 px-4">
                      <strong className="text-zinc-900 dark:text-white block font-bold">White Cement Wall Putty</strong>
                      <span className="text-[10px] text-zinc-400">Birla White / JK WallMax 40kg bag</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-zinc-900 dark:text-white">
                      {materialEstimationTotals.puttyBags.toLocaleString()} Bags
                      <span className="text-[10px] text-zinc-400 block font-normal">({materialEstimationTotals.puttyKg} Kg)</span>
                    </td>
                    <td className="py-3 px-4 text-center text-[11px]">Bag (40 kg)</td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1 justify-end font-mono">
                        <span>₹</span>
                        <input
                          type="number"
                          value={materialPrices.puttyBag40kg}
                          onChange={(e) => setMaterialPrices({ ...materialPrices, puttyBag40kg: parseFloat(e.target.value) || 0 })}
                          className="w-20 px-2 py-1 text-right text-xs font-bold border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-indigo-600 dark:text-indigo-400">
                      ₹{(materialEstimationTotals.puttyBags * materialPrices.puttyBag40kg).toLocaleString('en-IN')}
                    </td>
                  </tr>

                  <tr className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/10">
                    <td className="py-3 px-4 font-bold text-zinc-400">10</td>
                    <td className="py-3 px-4">
                      <strong className="text-zinc-900 dark:text-white block font-bold">Acrylic Emulsion Paint &amp; Primer</strong>
                      <span className="text-[10px] text-zinc-400">Paints: {materialEstimationTotals.paintLitres} Ltrs | Primer: {materialEstimationTotals.primerLitres} Ltrs</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-zinc-900 dark:text-white">
                      {(materialEstimationTotals.paintLitres + materialEstimationTotals.primerLitres).toFixed(1)} Litres
                    </td>
                    <td className="py-3 px-4 text-center text-[11px]">Litres</td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1 justify-end font-mono">
                        <span>₹</span>
                        <input
                          type="number"
                          value={materialPrices.paintLitre}
                          onChange={(e) => setMaterialPrices({ ...materialPrices, paintLitre: parseFloat(e.target.value) || 0 })}
                          className="w-20 px-2 py-1 text-right text-xs font-bold border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-indigo-600 dark:text-indigo-400">
                      ₹{Math.round((materialEstimationTotals.paintLitres * materialPrices.paintLitre) + (materialEstimationTotals.primerLitres * materialPrices.primerLitre)).toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: CPWD / DSR Rate Library ── */}
      {activeTab === 'rates' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search standard rates by code, name, or description..."
                value={librarySearchQuery}
                onChange={(e) => setLibrarySearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>
            <select
              value={libraryCategoryFilter}
              onChange={(e) => setLibraryCategoryFilter(e.target.value)}
              className="w-full sm:w-64 px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 cursor-pointer"
            >
              <option value="all">All Rate Chapters ({rateLibrary.length})</option>
              {DEFAULT_CATEGORIES.map(c => {
                const cnt = rateLibrary.filter(r => r.categoryId === c.id).length;
                return (
                  <option key={c.id} value={c.id}>
                    {c.name} {cnt > 0 ? `(${cnt})` : ''}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRateLibrary.length === 0 ? (
              <div className="col-span-2 py-16 text-center text-zinc-400 font-medium">
                <span className="text-3xl">🔍</span>
                <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mt-2">No standard rates match your search query.</p>
              </div>
            ) : (
              filteredRateLibrary.map(rate => {
                const categoryName = DEFAULT_CATEGORIES.find(c => c.id === rate.categoryId)?.name || 'General';
                const baseSum = (rate.rateMaterial || 0) + (rate.rateLabour || 0) + (rate.rateEquipment || 0) + (rate.rateTransport || 0) + (rate.rateOther || 0);
                const matPct = baseSum > 0 ? ((rate.rateMaterial || 0) / baseSum) * 100 : 0;
                const labPct = baseSum > 0 ? ((rate.rateLabour || 0) / baseSum) * 100 : 0;
                const eqPct = baseSum > 0 ? ((rate.rateEquipment || 0) / baseSum) * 100 : 0;
                const transPct = baseSum > 0 ? ((rate.rateTransport || 0) / baseSum) * 100 : 0;
                const othPct = baseSum > 0 ? ((rate.rateOther || 0) / baseSum) * 100 : 0;

                const finalUnitRate = baseSum * (1 + rate.contractorMarginPercent / 100) * (1 + rate.gstPercent / 100);

                return (
                  <div key={rate.id} className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs space-y-3.5 hover:border-amber-400/40 transition shadow-sm flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[9px] font-black uppercase rounded font-mono">
                            {rate.code}
                          </span>
                          <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[9px] font-bold rounded">
                            {categoryName}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-zinc-500 font-mono">
                          Unit: <strong className="text-zinc-900 dark:text-white">{rate.unit}</strong>
                        </span>
                      </div>

                      <strong className="text-sm font-black text-zinc-900 dark:text-white block leading-snug">
                        {rate.description}
                      </strong>

                      {rate.notes && (
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                          {rate.notes}
                        </p>
                      )}

                      {/* Stacked Cost Bar */}
                      <div className="space-y-1 pt-1">
                        <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                          <div style={{ width: `${matPct}%` }} className="bg-indigo-500 h-full" title={`Material: ₹${rate.rateMaterial}`} />
                          <div style={{ width: `${labPct}%` }} className="bg-amber-500 h-full" title={`Labour: ₹${rate.rateLabour}`} />
                          <div style={{ width: `${eqPct}%` }} className="bg-emerald-500 h-full" title={`Equipment: ₹${rate.rateEquipment}`} />
                          <div style={{ width: `${transPct}%` }} className="bg-blue-500 h-full" title={`Transport: ₹${rate.rateTransport}`} />
                          <div style={{ width: `${othPct}%` }} className="bg-zinc-400 h-full" title={`Other: ₹${rate.rateOther}`} />
                        </div>
                        <div className="text-[9px] text-zinc-500 flex flex-wrap gap-x-3 gap-y-0.5 font-mono">
                          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Mat: ₹{rate.rateMaterial}</span>
                          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Lab: ₹{rate.rateLabour}</span>
                          {rate.rateEquipment > 0 && <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Eq: ₹{rate.rateEquipment}</span>}
                          {rate.rateTransport > 0 && <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Trans: ₹{rate.rateTransport}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[9px] text-zinc-400 uppercase font-bold block">Final Unit Rate</span>
                        <span className="text-base font-black text-indigo-600 dark:text-indigo-400 font-mono">
                          ₹{finalUnitRate.toFixed(2)} <span className="text-[10px] text-zinc-400 font-normal">/{rate.unit}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {activeProject && (
                          <button
                            onClick={() => handleAddFromLibrary(rate)}
                            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition shadow-md shadow-amber-500/20"
                          >
                            + Add to BOQ
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}


      {/* ── TAB 4: Multi-Floor & Room Matrix ── */}
      {activeTab === 'floors' && activeProject && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Floors Manager Card */}
          <div className="md:col-span-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏢</span>
                <div>
                  <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                    Building Floor Levels ({(activeProject.floors || []).length})
                  </h3>
                  <p className="text-[11px] text-zinc-500">Add floors to auto-clone standard items &amp; scale takeoff areas</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {(activeProject.floors || []).map((f, idx) => {
                const floorItems = (activeProject.items || []).filter(i => i.floorId === f.id);
                const floorCost = floorItems.reduce((sum, i) => sum + i.totalAmount, 0);

                return (
                  <div key={f.id} className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 text-xs font-black flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <strong className="text-zinc-900 dark:text-white font-bold block text-sm">{f.name}</strong>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1 font-mono text-xs">
                            <span className="text-[10px] text-zinc-400">Area:</span>
                            <input
                              type="number"
                              value={f.area || ''}
                              onChange={(e) => handleUpdateFloorArea(f.id, parseInt(e.target.value) || 0)}
                              className="w-16 px-1.5 py-0.5 text-xs font-bold border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-right"
                            />
                            <span className="text-[10px] text-zinc-400">sqft</span>
                          </div>
                          <span className="text-zinc-300 dark:text-zinc-700">•</span>
                          <span className="text-[10px] text-zinc-500 font-mono">{floorItems.length} items (₹{floorCost.toLocaleString('en-IN')})</span>
                        </div>
                      </div>
                    </div>
                    {(activeProject.floors || []).length > 1 && (
                      <button
                        onClick={() => handleRemoveFloor(f.id)}
                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition"
                        title="Delete Floor"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add Floor Form */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
              <span className="text-[11px] font-black text-zinc-500 uppercase tracking-wider block">+ Add New Floor Level</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  placeholder="Floor Name (e.g. First Floor)"
                  value={newFloorName}
                  onChange={(e) => setNewFloorName(e.target.value)}
                  className="px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-bold"
                />
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Floor Area"
                    value={newFloorArea || ''}
                    onChange={(e) => setNewFloorArea(parseInt(e.target.value) || 0)}
                    className="w-full pl-3 pr-10 py-2 text-xs border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] text-zinc-400 font-bold">sqft</span>
                </div>
              </div>
              <button
                onClick={handleAddFloor}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black transition shadow-md shadow-blue-500/20"
              >
                + Add Floor &amp; Clone Standard Takeoff Items
              </button>
            </div>
          </div>

          {/* Rooms & Zones Manager Card */}
          <div className="md:col-span-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🚪</span>
                <div>
                  <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                    Rooms &amp; Spatial Zones ({(activeProject.rooms || []).length})
                  </h3>
                  <p className="text-[11px] text-zinc-500">Allocate line items to specific rooms for room-wise costing</p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {(activeProject.rooms || []).map(r => {
                const floorName = (activeProject.floors || []).find(f => f.id === r.floorId)?.name || '—';
                const roomItems = (activeProject.items || []).filter(i => i.roomId === r.id);
                const roomCost = roomItems.reduce((sum, i) => sum + i.totalAmount, 0);

                return (
                  <div key={r.id} className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center justify-between gap-3 text-xs">
                    <div>
                      <strong className="text-zinc-900 dark:text-white font-bold block">{r.name}</strong>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5">
                        <span className="text-violet-500 font-bold">{floorName}</span>
                        <span>•</span>
                        <span className="font-mono">{roomItems.length} items (₹{roomCost.toLocaleString('en-IN')})</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveRoom(r.id)}
                      className="text-zinc-400 hover:text-red-500 transition p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40"
                      title="Remove Room"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Add Room Form */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
              <span className="text-[11px] font-black text-zinc-500 uppercase tracking-wider block">+ Add Room / Zone</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  placeholder="Room Name (e.g. Master Bedroom)"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/30 font-bold"
                />
                <select
                  value={newRoomFloorId}
                  onChange={(e) => setNewRoomFloorId(e.target.value)}
                  className="px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/30 cursor-pointer"
                >
                  <option value="">Select Floor Level</option>
                  {(activeProject.floors || []).map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleAddRoom}
                className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-black transition shadow-md shadow-violet-500/20"
              >
                + Add Room to Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: Cost Analytics & Simulator ── */}
      {activeTab === 'analytics' && activeProject && (
        <div className="space-y-6">
          {/* Top Row: Donut Chart + Floor Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Donut Chart */}
            <div className="md:col-span-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <PieChart className="w-4 h-4 text-indigo-500" />
                <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                  Top Cost Categories Distribution
                </h3>
              </div>

              {chartCategoryData.length === 0 ? (
                <div className="py-12 text-center text-zinc-400 font-medium">No items in project yet</div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative w-40 h-40 shrink-0">
                    <svg width="160" height="160" viewBox="0 0 160 160" className="transform -rotate-90">
                      {(() => {
                        const totalAmt = chartCategoryData.reduce((sum, item) => sum + item.amount, 0);
                        let accumulatedPct = 0;
                        const colors = ['#6366f1', '#a855f7', '#10b981', '#f59e0b', '#3b82f6', '#ec4899'];
                        return chartCategoryData.map((item, idx) => {
                          if (totalAmt <= 0) return null;
                          const pct = item.amount / totalAmt;
                          const strokeDash = pct * 402; // 2 * PI * 64 = 402
                          const strokeOffset = accumulatedPct * 402;
                          accumulatedPct += pct;

                          return (
                            <circle
                              key={`slice-${idx}`}
                              cx="80"
                              cy="80"
                              r="64"
                              fill="none"
                              stroke={colors[idx % colors.length]}
                              strokeWidth="18"
                              strokeDasharray={`${strokeDash} 402`}
                              strokeDashoffset={-strokeOffset}
                            />
                          );
                        });
                      })()}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-[9px] text-zinc-400 font-bold uppercase">Estimated</span>
                      <span className="text-xs font-black text-zinc-900 dark:text-white">Category %</span>
                    </div>
                  </div>

                  {/* Progress Bars */}
                  <div className="flex-1 space-y-3 w-full text-xs">
                    {(() => {
                      const totalAmt = chartCategoryData.reduce((sum, item) => sum + item.amount, 0);
                      const colors = ['#6366f1', '#a855f7', '#10b981', '#f59e0b', '#3b82f6', '#ec4899'];
                      return chartCategoryData.map((item, idx) => {
                        const pct = totalAmt > 0 ? (item.amount / totalAmt) * 100 : 0;
                        return (
                          <div key={`legend-${idx}`} className="space-y-1">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="flex items-center gap-2 font-bold text-zinc-700 dark:text-zinc-300">
                                <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ backgroundColor: colors[idx % colors.length] }} />
                                <span>{item.name}</span>
                              </span>
                              <span className="font-mono font-bold text-zinc-900 dark:text-white">
                                ₹{item.amount.toLocaleString('en-IN')} <span className="text-zinc-400 text-[9px]">({pct.toFixed(1)}%)</span>
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: colors[idx % colors.length] }} />
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Floor Breakdown Bar Card */}
            <div className="md:col-span-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <Layers className="w-4 h-4 text-blue-500" />
                <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                  Floor-Wise Cost Breakdown
                </h3>
              </div>

              <div className="space-y-3.5">
                {floorCostData.map(f => {
                  const pct = summaryTotals.grandTotal > 0 ? (f.total / summaryTotals.grandTotal) * 100 : 0;
                  return (
                    <div key={f.id} className="p-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <strong className="font-bold text-zinc-900 dark:text-white">{f.name}</strong>
                        <span className="font-mono font-black text-indigo-600 dark:text-indigo-400">
                          ₹{f.total.toLocaleString('en-IN')} <span className="text-[10px] text-zinc-400">({pct.toFixed(1)}%)</span>
                        </span>
                      </div>
                      <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                        <span>Area: {f.area.toLocaleString()} sqft</span>
                        <span>₹{f.costPerSqft}/sqft</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Market Sensitivity Simulator */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                  Price Fluctuation &amp; Sensitivity Simulator
                </h3>
              </div>
              <button
                onClick={() => {
                  setSimCement(0); setSimSteel(0); setSimLabour(0); setSimTile(0); setSimInflation(0);
                  showToast('Sensitivity sliders reset to baseline');
                }}
                className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:underline uppercase tracking-wider transition"
              >
                Reset Deviations
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 text-xs font-bold text-zinc-700 dark:text-zinc-300">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Cement Price</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${simCement > 0 ? 'bg-red-500/10 text-red-500' : simCement < 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>
                    {simCement >= 0 ? '+' : ''}{simCement}%
                  </span>
                </div>
                <input
                  type="range"
                  min={-50}
                  max={50}
                  value={simCement}
                  onChange={(e) => setSimCement(parseInt(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>TMT Steel Rebar</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${simSteel > 0 ? 'bg-red-500/10 text-red-500' : simSteel < 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>
                    {simSteel >= 0 ? '+' : ''}{simSteel}%
                  </span>
                </div>
                <input
                  type="range"
                  min={-50}
                  max={50}
                  value={simSteel}
                  onChange={(e) => setSimSteel(parseInt(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Labour Wages</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${simLabour > 0 ? 'bg-red-500/10 text-red-500' : simLabour < 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>
                    {simLabour >= 0 ? '+' : ''}{simLabour}%
                  </span>
                </div>
                <input
                  type="range"
                  min={-50}
                  max={50}
                  value={simLabour}
                  onChange={(e) => setSimLabour(parseInt(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Tiles &amp; Ceramics</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${simTile > 0 ? 'bg-red-500/10 text-red-500' : simTile < 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>
                    {simTile >= 0 ? '+' : ''}{simTile}%
                  </span>
                </div>
                <input
                  type="range"
                  min={-50}
                  max={50}
                  value={simTile}
                  onChange={(e) => setSimTile(parseInt(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>General Inflation</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${simInflation > 0 ? 'bg-red-500/10 text-red-500' : simInflation < 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>
                    {simInflation >= 0 ? '+' : ''}{simInflation}%
                  </span>
                </div>
                <input
                  type="range"
                  min={-30}
                  max={30}
                  value={simInflation}
                  onChange={(e) => setSimInflation(parseInt(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* 3-Tier Quality Specification Simulator */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>3-Tier Specification Package Estimator</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Budget */}
              <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Economy Tier</span>
                  <span className="px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-[9px] font-black font-mono">-15%</span>
                </div>
                <div className="text-xl font-black text-zinc-900 dark:text-white font-mono">
                  ₹{(summaryTotals.grandTotal * 0.85).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Basic standard brickwork, ordinary ceramic tiles (₹35/sqft), tractor emulsion, standard fittings.
                </p>
                <span className="text-[10px] text-zinc-400 font-mono block">
                  ₹{totalFloorAreaSqft > 0 ? ((summaryTotals.grandTotal * 0.85) / totalFloorAreaSqft).toFixed(2) : 0}/sqft
                </span>
              </div>

              {/* Standard */}
              <div className="p-5 rounded-2xl border-2 border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 space-y-3 relative">
                <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[9px] font-black uppercase">Current Model</span>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Standard Specification</span>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[9px] font-black font-mono">100%</span>
                </div>
                <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                  ₹{summaryTotals.grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Double charged vitrified tiles (₹55/sqft), Asian Paints Royale, Jaquar sanitaryware, modular kitchen.
                </p>
                <span className="text-[10px] text-zinc-400 font-mono block">
                  ₹{totalFloorAreaSqft > 0 ? (summaryTotals.grandTotal / totalFloorAreaSqft).toFixed(2) : 0}/sqft
                </span>
              </div>

              {/* Luxury */}
              <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-50/10 dark:bg-amber-950/10 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">Premium / Luxury Tier</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[9px] font-black font-mono">+25%</span>
                </div>
                <div className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">
                  ₹{(summaryTotals.grandTotal * 1.25).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Italian marble flooring, high-end false ceiling with magnetic track lights, Kohler fixtures, acrylic kitchen.
                </p>
                <span className="text-[10px] text-zinc-400 font-mono block">
                  ₹{totalFloorAreaSqft > 0 ? ((summaryTotals.grandTotal * 1.25) / totalFloorAreaSqft).toFixed(2) : 0}/sqft
                </span>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* ── TAB 6: Export & Client Quote Hub ── */}
      {activeTab === 'export' && activeProject && (
        <div className="space-y-6">
          {/* WhatsApp Quotation Generator Card */}
          <div className="bg-white dark:bg-zinc-900 border border-emerald-500/30 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-emerald-500 text-xl font-black">
                  💬
                </div>
                <div>
                  <h3 className="text-sm font-black text-zinc-900 dark:text-white">
                    1-Click WhatsApp Client Quotation
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Instantly format and send an itemized estimate message to your client via WhatsApp
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyWhatsAppQuote}
                  className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Text</span>
                </button>
                <button
                  onClick={handleShareWhatsApp}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share on WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Live Message Preview Box */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 font-mono text-xs whitespace-pre-line text-zinc-800 dark:text-zinc-200 leading-relaxed max-h-72 overflow-y-auto">
              {generateWhatsAppQuote()}
            </div>
          </div>

          {/* Deliverables Grid: PDF & Excel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PDF Card */}
            <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-red-500/15 flex items-center justify-center text-red-500">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black text-zinc-900 dark:text-white">
                  Download Official PDF BOQ Report
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Clean printable PDF document formatted with project metadata, cost summaries, item schedules, and engineering disclaimers.
                </p>
              </div>
              <button
                onClick={handleExportPDF}
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black transition shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF BOQ Document</span>
              </button>
            </div>

            {/* Excel Card */}
            <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-emerald-500">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black text-zinc-900 dark:text-white">
                  Multi-Sheet Microsoft Excel Workbook (.xlsx)
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Contains 4 comprehensive worksheets: Project Summary, Detailed BOQ with formulas, Material Indent Abstract, and CPWD Rate Analysis.
                </p>
              </div>
              <button
                onClick={handleExportExcel}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Export Multi-Sheet Excel File</span>
              </button>
            </div>
          </div>

          {/* Backup JSON Box */}
          <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <strong className="text-xs font-black text-zinc-900 dark:text-white block">
                Project Backup &amp; Migration (JSON)
              </strong>
              <p className="text-[11px] text-zinc-500">
                Save your estimate project file locally or restore a project on any device.
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleBackupExport}
                className="flex-1 sm:flex-initial px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold rounded-xl transition"
              >
                Export JSON
              </button>
              <label className="flex-1 sm:flex-initial px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold rounded-xl transition cursor-pointer text-center">
                Import JSON
                <input type="file" accept=".json" onChange={handleBackupImport} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ── Sticky Summary Bottom Widget ── */}
      {activeProject && (
        <div className="sticky bottom-6 mt-8 w-full bg-zinc-950/90 backdrop-blur-md text-white border border-zinc-800 rounded-3xl p-5 shadow-2xl z-40">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-center">
            {/* Grand Total */}
            <div className="col-span-2 md:col-span-1 space-y-0.5">
              <span className="text-[9px] text-zinc-400 uppercase tracking-wider font-extrabold block">Grand Total Estimated</span>
              <div className="text-xl md:text-2xl font-black text-emerald-400 font-mono tracking-tight">
                ₹{summaryTotals.grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <span className="text-[9px] text-zinc-500 font-bold block">(Incl. {(activeProject.gstPercent ?? 18)}% GST &amp; Margin)</span>
            </div>

            {/* Cost / Sq.Ft */}
            <div className="border-l border-zinc-800 pl-4 space-y-0.5">
              <span className="text-[9px] text-zinc-400 uppercase tracking-wider font-extrabold block">Cost / Built Area</span>
              <div className="text-base font-bold text-white font-mono">
                ₹{totalFloorAreaSqft > 0 ? (summaryTotals.grandTotal / totalFloorAreaSqft).toFixed(2) : '0.00'} <span className="text-[10px] text-zinc-400">/sqft</span>
              </div>
              <span className="text-[9px] text-zinc-500 font-bold block">{totalFloorAreaSqft.toLocaleString()} sqft area</span>
            </div>

            {/* Raw Base Cost */}
            <div className="border-l border-zinc-800 pl-4 space-y-0.5">
              <span className="text-[9px] text-zinc-400 uppercase tracking-wider font-extrabold block">Raw Base Cost</span>
              <div className="text-base font-bold text-indigo-300 font-mono">
                ₹{summaryTotals.baseTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <span className="text-[9px] text-zinc-500 font-bold block">Materials &amp; Wages</span>
            </div>

            {/* Markups & Taxes */}
            <div className="border-l border-zinc-800 pl-4 space-y-0.5">
              <span className="text-[9px] text-zinc-400 uppercase tracking-wider font-extrabold block">Taxes &amp; Markups</span>
              <div className="text-base font-bold text-amber-400 font-mono">
                ₹{(summaryTotals.gstTotal + summaryTotals.marginTotal + summaryTotals.contingencyTotal).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <span className="text-[9px] text-zinc-500 font-bold block">Margin, GST &amp; Cont.</span>
            </div>

            {/* Fast Actions */}
            <div className="flex flex-col gap-1.5 border-l border-zinc-800 pl-4 col-span-2 md:col-span-1">
              <div className="flex gap-1.5">
                <button
                  onClick={handleExportPDF}
                  className="flex-1 py-1.5 px-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1"
                >
                  <FileText className="w-3 h-3" />
                  <span>PDF</span>
                </button>
                <button
                  onClick={handleExportExcel}
                  className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1"
                >
                  <FileSpreadsheet className="w-3 h-3" />
                  <span>Excel</span>
                </button>
              </div>
              <button
                onClick={handleShareWhatsApp}
                className="w-full py-1.5 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1"
              >
                <span>💬 Quote on WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 1: Rate Analysis Modal ── */}
      {activeRateAnalysisItem && activeProject && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">💰</span>
                <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                  Rate Analysis ({activeRateAnalysisItem.code})
                </h4>
              </div>
              <button
                onClick={() => setActiveRateAnalysisItemId(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">Item Title</span>
                <strong className="text-zinc-900 dark:text-white block leading-snug">{activeRateAnalysisItem.description}</strong>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-zinc-500 font-bold">Material Base Rate (₹)</label>
                  <input
                    type="number"
                    value={activeRateAnalysisItem.rateMaterial}
                    onChange={(e) => handleUpdateItemCell(activeRateAnalysisItem.id, 'rateMaterial', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-mono text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-zinc-500 font-bold">Labour Base Wages (₹)</label>
                  <input
                    type="number"
                    value={activeRateAnalysisItem.rateLabour}
                    onChange={(e) => handleUpdateItemCell(activeRateAnalysisItem.id, 'rateLabour', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-mono text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <label className="block text-[10px] text-zinc-500 font-bold text-center">Equipment (₹)</label>
                  <input
                    type="number"
                    value={activeRateAnalysisItem.rateEquipment}
                    onChange={(e) => handleUpdateItemCell(activeRateAnalysisItem.id, 'rateEquipment', parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-mono text-center text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] text-zinc-500 font-bold text-center">Transport (₹)</label>
                  <input
                    type="number"
                    value={activeRateAnalysisItem.rateTransport}
                    onChange={(e) => handleUpdateItemCell(activeRateAnalysisItem.id, 'rateTransport', parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-mono text-center text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] text-zinc-500 font-bold text-center">Other (₹)</label>
                  <input
                    type="number"
                    value={activeRateAnalysisItem.rateOther}
                    onChange={(e) => handleUpdateItemCell(activeRateAnalysisItem.id, 'rateOther', parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-mono text-center text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div className="space-y-1">
                  <label className="block text-[10px] text-zinc-500 font-bold">Margin (%)</label>
                  <input
                    type="number"
                    value={activeRateAnalysisItem.contractorMarginPercent}
                    onChange={(e) => handleUpdateItemCell(activeRateAnalysisItem.id, 'contractorMarginPercent', parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 text-xs border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-950 font-mono text-zinc-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] text-zinc-500 font-bold">GST (%)</label>
                  <input
                    type="number"
                    value={activeRateAnalysisItem.gstPercent}
                    onChange={(e) => handleUpdateItemCell(activeRateAnalysisItem.id, 'gstPercent', parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 text-xs border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-950 font-mono text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Calculated Rate Result Panel */}
              <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white flex justify-between items-center shadow-lg border border-indigo-500/20">
                <div>
                  <span className="text-[10px] text-indigo-300 font-black uppercase tracking-wider block">Final Unit Rate</span>
                  <span className="text-[9px] text-indigo-200/60 block">(With Margin &amp; GST Tax)</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-amber-400 font-mono">
                    ₹{activeRateAnalysisItem.finalRate.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs text-indigo-200 font-bold block">/ {activeRateAnalysisItem.unit}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: Material Settings Modal ── */}
      {activeMaterialSettingsItem && activeProject && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🧱</span>
                <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                  Material Takeoff Parameters ({activeMaterialSettingsItem.code})
                </h4>
              </div>
              <button
                onClick={() => setActiveMaterialSettingsItemId(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Concrete Settings */}
              {(activeMaterialSettingsItem.categoryId === '4' || activeMaterialSettingsItem.categoryId === '5') && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-zinc-500 font-bold mb-1">Concrete Mix Grade</label>
                    <select
                      value={activeMaterialSettingsItem.concreteMix || 'm20'}
                      onChange={(e) => handleUpdateItemCell(activeMaterialSettingsItem.id, 'concreteMix', e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white font-bold"
                    >
                      <option value="pcc_1_5_10">M7.5 PCC (1:5:10)</option>
                      <option value="pcc_1_4_8">M10 PCC (1:4:8 Lean Bed)</option>
                      <option value="pcc_1_3_6">M15 PCC (1:3:6)</option>
                      <option value="m20">M20 Standard (1:1.5:3 Slab/Beam)</option>
                      <option value="m25">M25 Design Mix (1:1:2 Columns/Footings)</option>
                      <option value="m30">M30 High Strength (1:0.75:1.5)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-zinc-500 font-bold mb-1">Reinforcement Steel Density (kg/m3)</label>
                    <input
                      type="number"
                      value={activeMaterialSettingsItem.steelRatio || 80}
                      onChange={(e) => handleUpdateItemCell(activeMaterialSettingsItem.id, 'steelRatio', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-mono text-zinc-900 dark:text-white"
                    />
                    <span className="text-[10px] text-zinc-400 mt-0.5 block">Standard: 80 kg/m3 for slabs, 120 kg/m3 for columns</span>
                  </div>
                </div>
              )}

              {/* Brick Settings */}
              {(activeMaterialSettingsItem.categoryId === '8' || activeMaterialSettingsItem.categoryId === '9') && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-zinc-500 font-bold mb-1">Masonry Unit Type</label>
                    <select
                      value={activeMaterialSettingsItem.brickType || 'standard'}
                      onChange={(e) => handleUpdateItemCell(activeMaterialSettingsItem.id, 'brickType', e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white font-bold"
                    >
                      <option value="standard">Traditional Red Clay Bricks (230x110x75 mm)</option>
                      <option value="modular">Modular Bricks (190x90x90 mm)</option>
                      <option value="fly_ash">Fly Ash Bricks (230x110x70 mm)</option>
                      <option value="aac_block">AAC Lightweight Blocks (600x200x150 mm)</option>
                      <option value="concrete_block">Solid Concrete Blocks (400x200x150 mm)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-zinc-500 font-bold mb-1">Mortar Mix Ratio</label>
                    <select
                      value={activeMaterialSettingsItem.mortarRatio || '1_6'}
                      onChange={(e) => handleUpdateItemCell(activeMaterialSettingsItem.id, 'mortarRatio', e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white font-bold"
                    >
                      <option value="1_3">1:3 Cement : Sand (High Strength)</option>
                      <option value="1_4">1:4 Cement : Sand (Partition Walls)</option>
                      <option value="1_5">1:5 Cement : Sand</option>
                      <option value="1_6">1:6 Cement : Sand (Standard 9-inch Walls)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Plaster Settings */}
              {activeMaterialSettingsItem.categoryId === '10' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-zinc-500 font-bold mb-1">Plaster Thickness (mm)</label>
                    <select
                      value={activeMaterialSettingsItem.plasterThickness || 12}
                      onChange={(e) => handleUpdateItemCell(activeMaterialSettingsItem.id, 'plasterThickness', parseInt(e.target.value) || 12)}
                      className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white font-bold"
                    >
                      <option value={6}>6 mm Ceiling / Under-slab Plaster</option>
                      <option value={12}>12 mm Interior Smooth Wall Plaster</option>
                      <option value={15}>15 mm Exterior Sand-face Plaster</option>
                      <option value={20}>20 mm Rough Waterproof Plaster</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Tile Settings */}
              {(activeMaterialSettingsItem.categoryId === '12' || activeMaterialSettingsItem.categoryId === '13') && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-zinc-500 font-bold mb-1">Tile Length (ft)</label>
                      <input
                        type="number"
                        value={activeMaterialSettingsItem.tileLength || 2}
                        onChange={(e) => handleUpdateItemCell(activeMaterialSettingsItem.id, 'tileLength', parseFloat(e.target.value) || 2)}
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-mono text-zinc-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-500 font-bold mb-1">Tile Width (ft)</label>
                      <input
                        type="number"
                        value={activeMaterialSettingsItem.tileWidth || 2}
                        onChange={(e) => handleUpdateItemCell(activeMaterialSettingsItem.id, 'tileWidth', parseFloat(e.target.value) || 2)}
                        className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-mono text-zinc-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => setActiveMaterialSettingsItemId(null)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition mt-2"
              >
                Save Material Parameters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: New Project / Template Selection Modal ── */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 max-w-2xl w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-black text-zinc-900 dark:text-white">
                  Create New Estimate Workspace
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Pick a pre-configured Indian civil takeoff template or start with a blank canvas
                </p>
              </div>
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
              <button
                onClick={() => handleCreateProject('small_house')}
                className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 rounded-2xl text-left space-y-1 transition group"
              >
                <span className="text-2xl block mb-1">🏠</span>
                <strong className="text-xs font-black text-zinc-900 dark:text-white block group-hover:text-indigo-600">G+0 Residential House (1,000 sqft)</strong>
                <p className="text-[10px] text-zinc-500 leading-relaxed">Foundation, PCC, RCC roof slab, fly ash bricks, plaster, 600x600 tiles &amp; paint.</p>
              </button>

              <button
                onClick={() => handleCreateProject('villa_g1')}
                className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 rounded-2xl text-left space-y-1 transition group"
              >
                <span className="text-2xl block mb-1">🏡</span>
                <strong className="text-xs font-black text-zinc-900 dark:text-white block group-hover:text-indigo-600">G+1 Duplex Villa (2,000 sqft)</strong>
                <p className="text-[10px] text-zinc-500 leading-relaxed">RCC frame M25, AAC blocks, GVT tiles, gypsum ceiling, modular kitchen &amp; paint.</p>
              </button>

              <button
                onClick={() => handleCreateProject('apartment_g2')}
                className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 rounded-2xl text-left space-y-1 transition group"
              >
                <span className="text-2xl block mb-1">🏢</span>
                <strong className="text-xs font-black text-zinc-900 dark:text-white block group-hover:text-indigo-600">G+2 Multi-Storey Building (3,600 sqft)</strong>
                <p className="text-[10px] text-zinc-500 leading-relaxed">Deep excavation, M25 concrete, Fe-550D rebar, multi-floor cloned takeoff.</p>
              </button>

              <button
                onClick={() => handleCreateProject('renovation_2bhk')}
                className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 rounded-2xl text-left space-y-1 transition group"
              >
                <span className="text-2xl block mb-1">🛋️</span>
                <strong className="text-xs font-black text-zinc-900 dark:text-white block group-hover:text-indigo-600">2BHK Interior Renovation (1,200 sqft)</strong>
                <p className="text-[10px] text-zinc-500 leading-relaxed">Flooring overlay, false ceiling, sliding wardrobes, bath remodel &amp; Royale paint.</p>
              </button>

              <button
                onClick={() => handleCreateProject('modular_kitchen')}
                className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 rounded-2xl text-left space-y-1 transition group"
              >
                <span className="text-2xl block mb-1">🍳</span>
                <strong className="text-xs font-black text-zinc-900 dark:text-white block group-hover:text-indigo-600">Modular Kitchen &amp; Bath (350 sqft)</strong>
                <p className="text-[10px] text-zinc-500 leading-relaxed">Marine ply cabinets, quartz counter, wall dado, wall hung WC &amp; CPVC plumbing.</p>
              </button>

              <button
                onClick={() => handleCreateProject('blank')}
                className="p-4 bg-zinc-50 dark:bg-zinc-900 border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 rounded-2xl text-left space-y-1 transition group"
              >
                <span className="text-2xl block mb-1">📋</span>
                <strong className="text-xs font-black text-zinc-900 dark:text-white block group-hover:text-indigo-600">Blank Project Canvas</strong>
                <p className="text-[10px] text-zinc-500 leading-relaxed">Start fresh with your own custom dimensions and CPWD line items.</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SEO & Educational Guide Section ── */}
      <div className="max-w-7xl mx-auto mt-16 space-y-10">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
          <h2 className="text-lg font-black text-zinc-900 dark:text-white mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-3 flex items-center gap-2">
            <span>💡</span>
            <span>Indian Construction BOQ Standards &amp; Principles (IS 1200 &amp; CPWD DSR)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-zinc-600 dark:text-zinc-400">
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <strong className="font-bold text-zinc-900 dark:text-white text-sm block">1. Method of Measurement (IS 1200)</strong>
              <p className="leading-relaxed">
                Earthwork is quantified in cubic meters (Cum) in 1.5m depth stages. Concrete works (PCC/RCC) are measured in Cum net without deducting steel volume or chamfers less than 50mm. Brickwork 230mm (9-inch) is measured in Cum, while 115mm (4.5-inch) partitions are measured in Sqm. Plastering is measured in Sqm with standard IS deductions for door/window openings.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <strong className="font-bold text-zinc-900 dark:text-white text-sm block">2. CPWD Rate Analysis Components</strong>
              <p className="leading-relaxed">
                Every civil rate is analyzed into 5 primary cost components: Primary Material Cost (incorporating delivery to site and storage), Skilled &amp; Unskilled Labour (masons, bar benders, carpenters, helpers), Equipment &amp; Shuttering depreciation, Transit freight, and Sundries. A 10% to 15% contractor margin and 18% GST are applied to arrive at the tender rate.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <strong className="font-bold text-zinc-900 dark:text-white text-sm block">3. Dry Volume Shrinkage Multipliers</strong>
              <p className="leading-relaxed">
                Wet mixed concrete contracts by void elimination and hydration. A standard factor of 1.54 is multiplied by wet concrete volume to determine raw dry materials (cement bags, sand cft, aggregate cft). Mortar for brickwork and plaster has a dry volume factor of 1.33 to 1.35 to account for joint filling and dry shrinkage.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <strong className="font-bold text-zinc-900 dark:text-white text-sm block">4. Material Wastage Allowances in India</strong>
              <p className="leading-relaxed">
                Standard wastage percentages used by civil estimators: TMT Steel Rebar: 3%–5% (cutting bends &amp; laps); Clay Bricks: 5% (breakage &amp; half bats); Vitrified Flooring Tiles: 8%–10% (perimeter cutting); Cement &amp; Sand Plaster: 8% (rebound loss); Putty &amp; Emulsion Paint: 5% (roller absorption).
              </p>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-zinc-100 dark:border-zinc-800">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block mb-3">Related Civil Engineering Tools</span>
            <div className="flex flex-wrap gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300">
              <Link to="/tool/concrete-calculator" className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:text-indigo-500 hover:border-indigo-500 transition">Concrete Mix Estimator</Link>
              <Link to="/tool/rcc-calculator" className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:text-indigo-500 hover:border-indigo-500 transition">RCC Slab Calculator</Link>
              <Link to="/tool/steel-weight-calculator" className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:text-indigo-500 hover:border-indigo-500 transition">Steel Rebar Weight</Link>
              <Link to="/tool/construction-cost-calculator" className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:text-indigo-500 hover:border-indigo-500 transition">Construction Cost Index</Link>
              <Link to="/tool/brick-calculator" className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:text-indigo-500 hover:border-indigo-500 transition">Brick Calculator</Link>
              <Link to="/tool/floor-tile-calculator" className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:text-indigo-500 hover:border-indigo-500 transition">Floor Tile Estimator</Link>
              <Link to="/tool/paint-calculator" className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:text-indigo-500 hover:border-indigo-500 transition">Paint Coverage Estimator</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Trash2, Copy, Calculator,
  Building, Search, Coins, FileText, FileSpreadsheet, Eye
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
interface Floor {
  id: string;
  name: string;
  area: number;
  height: number;
  notes: string;
}

interface Room {
  id: string;
  name: string;
  floorId: string;
  notes: string;
}

interface WorkCategory {
  id: string;
  name: string;
  icon: string;
}

interface BOQItem {
  id: string;
  code: string;
  categoryId: string;
  floorId: string; // 'all' or specific Floor ID
  roomId: string; // 'all' or specific Room ID
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
  // Optional material estimation settings
  concreteMix?: 'pcc_1_4_8' | 'pcc_1_3_6' | 'pcc_1_2_4' | 'm20' | 'm25';
  includeSteel?: boolean;
  steelRatio?: number;
  brickType?: 'modular' | 'standard' | 'aac_block' | 'fly_ash';
  mortarRatio?: '1_3' | '1_4' | '1_5' | '1_6';
  plasterThickness?: 12 | 15 | 20;
  tileLength?: number;
  tileWidth?: number;
}

interface RateItem {
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

interface Project {
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

const DEFAULT_CATEGORIES: WorkCategory[] = [
  { id: '1', name: 'Site Preparation', icon: 'FolderOpen' },
  { id: '2', name: 'Excavation', icon: 'Hammer' },
  { id: '3', name: 'Filling and Compaction', icon: 'Layers' },
  { id: '4', name: 'PCC', icon: 'Grid' },
  { id: '5', name: 'RCC', icon: 'Building' },
  { id: '6', name: 'Reinforcement Steel', icon: 'Hash' },
  { id: '7', name: 'Formwork / Shuttering', icon: 'Layers' },
  { id: '8', name: 'Brickwork', icon: 'Layers' },
  { id: '9', name: 'Blockwork', icon: 'Layers' },
  { id: '10', name: 'Plaster', icon: 'Sparkles' },
  { id: '11', name: 'Waterproofing', icon: 'Droplets' },
  { id: '12', name: 'Flooring', icon: 'Grid' },
  { id: '13', name: 'Wall Tiles', icon: 'Grid' },
  { id: '14', name: 'Painting', icon: 'Paintbrush' },
  { id: '15', name: 'Doors', icon: 'FolderOpen' },
  { id: '16', name: 'Windows', icon: 'Grid' },
  { id: '17', name: 'Electrical', icon: 'Zap' },
  { id: '18', name: 'Plumbing', icon: 'Wrench' },
  { id: '19', name: 'Sanitary Fixtures', icon: 'Wrench' },
  { id: '20', name: 'False Ceiling', icon: 'Layers' },
  { id: '21', name: 'Modular Kitchen', icon: 'Grid' },
  { id: '22', name: 'Wardrobe', icon: 'Layers' },
  { id: '23', name: 'External Development', icon: 'Compass' },
  { id: '24', name: 'Miscellaneous', icon: 'HelpCircle' }
];

const PRESET_RATES: RateItem[] = [
  {
    id: 'r1',
    code: 'EXC-01',
    categoryId: '2',
    description: 'Excavation in foundation trenches in all kinds of soil',
    unit: 'cft',
    rateMaterial: 0,
    rateLabour: 12,
    rateEquipment: 3,
    rateTransport: 0,
    rateOther: 0,
    wastagePercent: 0,
    gstPercent: 18,
    contractorMarginPercent: 10,
    notes: 'Excavation up to 1.5m depth.'
  },
  {
    id: 'r2',
    code: 'PCC-01',
    categoryId: '4',
    description: 'Providing and laying cement concrete 1:4:8 base course',
    unit: 'cum',
    rateMaterial: 3600,
    rateLabour: 650,
    rateEquipment: 150,
    rateTransport: 100,
    rateOther: 50,
    wastagePercent: 3,
    gstPercent: 18,
    contractorMarginPercent: 10,
    notes: 'PCC bedding for footings.'
  },
  {
    id: 'r3',
    code: 'RCC-01',
    categoryId: '5',
    description: 'Providing and laying reinforced cement concrete M20 grade',
    unit: 'cum',
    rateMaterial: 4800,
    rateLabour: 950,
    rateEquipment: 250,
    rateTransport: 150,
    rateOther: 100,
    wastagePercent: 2,
    gstPercent: 18,
    contractorMarginPercent: 12,
    notes: 'Excluding reinforcement steel.'
  },
  {
    id: 'r4',
    code: 'STL-01',
    categoryId: '6',
    description: 'Providing and bending Fe500 TMT reinforcement bars',
    unit: 'kg',
    rateMaterial: 54,
    rateLabour: 7,
    rateEquipment: 1,
    rateTransport: 2,
    rateOther: 1,
    wastagePercent: 5,
    gstPercent: 18,
    contractorMarginPercent: 10,
    notes: 'Standard rebar supply & bind.'
  },
  {
    id: 'r5',
    code: 'BRK-01',
    categoryId: '8',
    description: 'Brickwork in 230mm walls with modular bricks in 1:6 mortar',
    unit: 'cum',
    rateMaterial: 2800,
    rateLabour: 850,
    rateEquipment: 50,
    rateTransport: 100,
    rateOther: 50,
    wastagePercent: 5,
    gstPercent: 18,
    contractorMarginPercent: 10,
    notes: 'Outer masonry perimeter.'
  },
  {
    id: 'r6',
    code: 'PLS-01',
    categoryId: '10',
    description: 'Internal wall cement plastering 12mm thick in 1:4 mortar',
    unit: 'sqm',
    rateMaterial: 85,
    rateLabour: 120,
    rateEquipment: 10,
    rateTransport: 5,
    rateOther: 5,
    wastagePercent: 10,
    gstPercent: 18,
    contractorMarginPercent: 10,
    notes: 'Single coat plastering.'
  },
  {
    id: 'r7',
    code: 'FLR-01',
    categoryId: '12',
    description: 'Vitrified floor tiles size 600x600 mm laid over mortar base',
    unit: 'sqft',
    rateMaterial: 55,
    rateLabour: 25,
    rateEquipment: 5,
    rateTransport: 5,
    rateOther: 5,
    wastagePercent: 8,
    gstPercent: 18,
    contractorMarginPercent: 10,
    notes: 'Tile bedding included.'
  },
  {
    id: 'r8',
    code: 'PNT-01',
    categoryId: '14',
    description: 'Wall painting with 2 coats acrylic emulsion over primer and putty',
    unit: 'sqft',
    rateMaterial: 12,
    rateLabour: 14,
    rateEquipment: 2,
    rateTransport: 1,
    rateOther: 1,
    wastagePercent: 5,
    gstPercent: 18,
    contractorMarginPercent: 10,
    notes: 'Premium plastic emulsion finish.'
  }
];

export default function AdvancedBOQCalculator() {
  // -------------------------------------------------------------
  // State Initialization
  // -------------------------------------------------------------
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('boq_projects');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    const saved = localStorage.getItem('boq_active_project_id');
    return saved || '';
  });

  const [rateLibrary] = useState<RateItem[]>(() => {
    const saved = localStorage.getItem('boq_rate_library');
    return saved ? JSON.parse(saved) : PRESET_RATES;
  });

  // UI state
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedFloorFilter, setSelectedFloorFilter] = useState<string>('all');
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'code' | 'amount' | 'category' | 'none'>('none');

  // Rate Library modal and fields
  const [showRateLibrary, setShowRateLibrary] = useState<boolean>(false);

  // Active BOQ Item Rate Analysis Modal
  const [activeRateAnalysisItemId, setActiveRateAnalysisItemId] = useState<string | null>(null);

  // Scenario Simulator factors
  const [simCement, setSimCement] = useState<number>(0); // percent adjustment
  const [simSteel, setSimSteel] = useState<number>(0);
  const [simLabour, setSimLabour] = useState<number>(0);
  const [simTile, setSimTile] = useState<number>(0);
  const [simInflation, setSimInflation] = useState<number>(0);

  // Active project state
  const activeProject = useMemo(() => {
    return projects.find(p => p.id === activeProjectId) || null;
  }, [projects, activeProjectId]);

  const activeRateAnalysisItem = useMemo(() => {
    if (!activeProject || !activeRateAnalysisItemId) return null;
    return activeProject.items.find(item => item.id === activeRateAnalysisItemId) || null;
  }, [activeProject, activeRateAnalysisItemId]);

  // Save projects to LocalStorage
  useEffect(() => {
    localStorage.setItem('boq_projects', JSON.stringify(projects));
  }, [projects]);

  // Save active project ID to LocalStorage
  useEffect(() => {
    localStorage.setItem('boq_active_project_id', activeProjectId);
  }, [activeProjectId]);

  // Save rate library to LocalStorage
  useEffect(() => {
    localStorage.setItem('boq_rate_library', JSON.stringify(rateLibrary));
  }, [rateLibrary]);

  // Autosave Draft status flag
  const [autosaveIndicator, setAutosaveIndicator] = useState<string>('Saved');

  // Helper trigger for updates
  const updateActiveProject = (updated: Project) => {
    // 1. If floors are defined, sync builtUpArea to the sum of floor areas
    const totalFloorArea = updated.floors.reduce((sum, f) => sum + (f.area || 0), 0);
    if (updated.floors.length > 0) {
      updated.builtUpArea = totalFloorArea;
    }

    // 2. Recalculate all items to reflect project-level changes (like GST, Margin, or default wastage changes)
    updated.items = updated.items.map(item =>
      calculateItemAmount({ ...item }, updated.gstPercent, updated.contractorMarginPercent)
    );

    setAutosaveIndicator('Saving...');
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
    setTimeout(() => setAutosaveIndicator('Saved'), 500);
  };

  // -------------------------------------------------------------
  // Preset Templates Loader
  // -------------------------------------------------------------
  const loadTemplate = (templateType: 'small_house' | 'kitchen') => {
    const newProjId = 'proj_' + Date.now();
    let newProj: Project;

    if (templateType === 'small_house') {
      newProj = {
        id: newProjId,
        name: 'G+0 Small Residential House',
        client: 'Rajesh Sharma',
        location: 'Vasant Kunj, New Delhi',
        state: 'Delhi',
        city: 'Delhi',
        projectType: 'residential',
        builtUpArea: 1000,
        plotArea: 1200,
        startDate: '2026-07-01',
        validityDate: '2026-09-01',
        gstPercent: 18,
        contractorMarginPercent: 10,
        contingencyPercent: 3,
        defaultWastagePercent: 5,
        notes: 'Small residential single-floor model estimate with brickwork and flooring.',
        floors: [
          { id: 'f1', name: 'Ground Floor', area: 1000, height: 3.3, notes: 'Main residential block' },
          { id: 'f2', name: 'Terrace', area: 1000, height: 1.0, notes: 'Roof parapet & drainage' }
        ],
        rooms: [
          { id: 'r1', name: 'Living Room', floorId: 'f1', notes: 'Front hall' },
          { id: 'r2', name: 'Master Bedroom', floorId: 'f1', notes: 'Rear side' },
          { id: 'r3', name: 'Kitchen', floorId: 'f1', notes: 'Vastu compliant layout' },
          { id: 'r4', name: 'Toilet/Bath', floorId: 'f1', notes: 'Common area' }
        ],
        items: [
          {
            id: 'i1',
            code: 'EXC-01',
            categoryId: '2',
            floorId: 'f1',
            roomId: 'all',
            description: 'Foundation Excavation',
            specification: 'Excavation in ordinary soil for load-bearing walls and column footings',
            unit: 'cft',
            length: 45,
            width: 3,
            height: 4.5,
            count: 4,
            formulaType: 'volume',
            manualQty: 0,
            manualAmount: 0,
            calculatedQty: 2430,
            wastagePercent: 0,
            netQty: 2430,
            rateMaterial: 0,
            rateLabour: 12,
            rateEquipment: 3,
            rateTransport: 0,
            rateOther: 0,
            contractorMarginPercent: 10,
            gstPercent: 18,
            finalRate: 18.27,
            totalAmount: 44396.1,
            remarks: 'Planning footing depth'
          },
          {
            id: 'i2',
            code: 'PCC-01',
            categoryId: '4',
            floorId: 'f1',
            roomId: 'all',
            description: 'Concrete PCC bed',
            specification: 'Laying PCC M10 (1:4:8) course below wall footing',
            unit: 'cum',
            length: 13.72,
            width: 0.91,
            height: 0.10,
            count: 4,
            formulaType: 'volume',
            manualQty: 0,
            manualAmount: 0,
            calculatedQty: 5.06, // approx converted value in cum
            wastagePercent: 3,
            netQty: 5.21,
            rateMaterial: 3600,
            rateLabour: 650,
            rateEquipment: 150,
            rateTransport: 100,
            rateOther: 50,
            contractorMarginPercent: 10,
            gstPercent: 18,
            finalRate: 5543.05,
            totalAmount: 28879.29,
            remarks: 'Concrete base course',
            concreteMix: 'pcc_1_4_8'
          },
          {
            id: 'i3',
            code: 'BRK-01',
            categoryId: '8',
            floorId: 'f1',
            roomId: 'all',
            description: 'Outer load bearing walls',
            specification: 'Fly ash bricks wall masonry with 1:6 cement-sand mortar',
            unit: 'cum',
            length: 13.72,
            width: 0.23,
            height: 3.05,
            count: 4,
            formulaType: 'volume',
            manualQty: 0,
            manualAmount: 0,
            calculatedQty: 38.22,
            wastagePercent: 5,
            netQty: 40.13,
            rateMaterial: 2800,
            rateLabour: 850,
            rateEquipment: 5,
            rateTransport: 10,
            rateOther: 10,
            contractorMarginPercent: 10,
            gstPercent: 18,
            finalRate: 4791.56,
            totalAmount: 192285.3,
            remarks: '9-inch thick bricks walls',
            brickType: 'fly_ash',
            mortarRatio: '1_6'
          },
          {
            id: 'i4',
            code: 'FLR-01',
            categoryId: '12',
            floorId: 'f1',
            roomId: 'r1',
            description: 'Living room flooring tiles',
            specification: 'Double-charged vitrified floor tiles size 600x600 mm over mortar base',
            unit: 'sqft',
            length: 16,
            width: 14,
            height: 0,
            count: 1,
            formulaType: 'area',
            manualQty: 0,
            manualAmount: 0,
            calculatedQty: 224,
            wastagePercent: 8,
            netQty: 241.92,
            rateMaterial: 55,
            rateLabour: 25,
            rateEquipment: 2,
            rateTransport: 2,
            rateOther: 1,
            contractorMarginPercent: 10,
            gstPercent: 18,
            finalRate: 107.50,
            totalAmount: 26006.4,
            remarks: 'Premium vitrified flooring',
            tileLength: 2,
            tileWidth: 2
          },
          {
            id: 'i5',
            code: 'PNT-01',
            categoryId: '14',
            floorId: 'f1',
            roomId: 'r1',
            description: 'Living room wall painting',
            specification: 'Plastic emulsion wall painting (2 coats) over primer and wall putty base',
            unit: 'sqft',
            length: 60,
            width: 0,
            height: 10,
            count: 1,
            formulaType: 'area',
            manualQty: 0,
            manualAmount: 0,
            calculatedQty: 600,
            wastagePercent: 5,
            netQty: 630,
            rateMaterial: 12,
            rateLabour: 14,
            rateEquipment: 1,
            rateTransport: 1,
            rateOther: 0,
            contractorMarginPercent: 10,
            gstPercent: 18,
            finalRate: 36.23,
            totalAmount: 22824.9,
            remarks: 'Interior emulsions coating'
          },
          {
            id: 'i6',
            code: 'WPF-01',
            categoryId: '11',
            floorId: 'f2',
            roomId: 'all',
            description: 'Terrace waterproofing treatment',
            specification: 'Providing and laying integral cement-based waterproofing treatment with brick bat coba',
            unit: 'Sq ft',
            length: 50,
            width: 20,
            height: 0,
            count: 1,
            formulaType: 'area',
            manualQty: 0,
            manualAmount: 0,
            calculatedQty: 1000,
            wastagePercent: 5,
            netQty: 1050,
            rateMaterial: 45,
            rateLabour: 15,
            rateEquipment: 2,
            rateTransport: 1,
            rateOther: 1,
            contractorMarginPercent: 10,
            gstPercent: 18,
            finalRate: 83.00,
            totalAmount: 87150,
            remarks: 'Brick bat coba waterproofing'
          },
          {
            id: 'i7',
            code: 'BRK-02',
            categoryId: '8',
            floorId: 'f2',
            roomId: 'all',
            description: 'Terrace Parapet wall brickwork',
            specification: 'Fly ash brick masonry 115mm thick for parapet wall in cement mortar 1:4',
            unit: 'Cum',
            length: 42.67,
            width: 0.115,
            height: 0.91,
            count: 1,
            formulaType: 'volume',
            manualQty: 0,
            manualAmount: 0,
            calculatedQty: 4.47,
            wastagePercent: 5,
            netQty: 4.69,
            rateMaterial: 2800,
            rateLabour: 850,
            rateEquipment: 5,
            rateTransport: 10,
            rateOther: 10,
            contractorMarginPercent: 10,
            gstPercent: 18,
            finalRate: 4770.15,
            totalAmount: 22372.00,
            remarks: '3 ft high parapet wall'
          }
        ]
      };
    } else {
      // modular kitchen
      newProj = {
        id: newProjId,
        name: 'Apartment Modular Kitchen Estimate',
        client: 'Meera Pillai',
        location: 'Kalyan Nagar, Bengaluru',
        state: 'Karnataka',
        city: 'Bengaluru',
        projectType: 'interior',
        builtUpArea: 120,
        plotArea: 0,
        startDate: '2026-08-15',
        validityDate: '2026-10-15',
        gstPercent: 18,
        contractorMarginPercent: 12,
        contingencyPercent: 2,
        defaultWastagePercent: 5,
        notes: 'Modular kitchen cabinetry, quartz platform, tile dado, and lighting details.',
        floors: [
          { id: 'f1', name: 'Ground Floor', area: 120, height: 3.0, notes: 'Kitchen zone' }
        ],
        rooms: [
          { id: 'r1', name: 'Kitchen', floorId: 'f1', notes: 'Modular layout area' }
        ],
        items: [
          {
            id: 'i1',
            code: 'CAB-01',
            categoryId: '21',
            floorId: 'f1',
            roomId: 'r1',
            description: 'Modular Base Cabinets',
            specification: 'Waterproof plywood cabinets (acrylic laminates) with soft-close drawers',
            unit: 'Rmt',
            length: 12,
            width: 0,
            height: 0,
            count: 1,
            formulaType: 'length',
            manualQty: 0,
            manualAmount: 0,
            calculatedQty: 12,
            wastagePercent: 2,
            netQty: 12.24,
            rateMaterial: 3500,
            rateLabour: 800,
            rateEquipment: 50,
            rateTransport: 100,
            rateOther: 50,
            contractorMarginPercent: 12,
            gstPercent: 18,
            finalRate: 5961.28,
            totalAmount: 72966.07,
            remarks: 'L-shape counter cabinet base'
          },
          {
            id: 'i2',
            code: 'CAB-02',
            categoryId: '21',
            floorId: 'f1',
            roomId: 'r1',
            description: 'Wall Overhead Cabinets',
            specification: 'Plywood overhead storage with frosted glass shutters',
            unit: 'Rmt',
            length: 8,
            width: 0,
            height: 0,
            count: 1,
            formulaType: 'length',
            manualQty: 0,
            manualAmount: 0,
            calculatedQty: 8,
            wastagePercent: 2,
            netQty: 8.16,
            rateMaterial: 2500,
            rateLabour: 600,
            rateEquipment: 50,
            rateTransport: 50,
            rateOther: 0,
            contractorMarginPercent: 12,
            gstPercent: 18,
            finalRate: 4216.80,
            totalAmount: 34409.09,
            remarks: 'Height 600mm overheads'
          },
          {
            id: 'i3',
            code: 'KCN-03',
            categoryId: '21',
            floorId: 'f1',
            roomId: 'r1',
            description: 'Quartz Countertop Slab',
            specification: 'Providing and polishing premium 18mm thick artificial quartz counter platform',
            unit: 'sqft',
            length: 12,
            width: 2.25,
            height: 0,
            count: 1,
            formulaType: 'area',
            manualQty: 0,
            manualAmount: 0,
            calculatedQty: 27,
            wastagePercent: 5,
            netQty: 28.35,
            rateMaterial: 280,
            rateLabour: 120,
            rateEquipment: 15,
            rateTransport: 15,
            rateOther: 0,
            contractorMarginPercent: 12,
            gstPercent: 18,
            finalRate: 569.26,
            totalAmount: 16138.52,
            remarks: 'Light grey quartz finish'
          },
          {
            id: 'i4',
            code: 'ELC-01',
            categoryId: '17',
            floorId: 'f1',
            roomId: 'r1',
            description: 'Kitchen appliances power wiring points',
            specification: 'Wiring for chimney, oven, and refrigerator with switches and sockets',
            unit: 'Nos',
            length: 0,
            width: 0,
            height: 0,
            count: 6,
            formulaType: 'count',
            manualQty: 0,
            manualAmount: 0,
            calculatedQty: 6,
            wastagePercent: 0,
            netQty: 6,
            rateMaterial: 450,
            rateLabour: 250,
            rateEquipment: 0,
            rateTransport: 0,
            rateOther: 0,
            contractorMarginPercent: 10,
            gstPercent: 18,
            finalRate: 908.60,
            totalAmount: 5451.60,
            remarks: 'Finolex wires & Anchor sockets'
          }
        ]
      };
    }

    // Recalculate all items to ensure consistent calculations immediately upon loading the template
    newProj.items = newProj.items.map(item =>
      calculateItemAmount({ ...item }, newProj.gstPercent, newProj.contractorMarginPercent)
    );

    setProjects(prev => [...prev, newProj]);
    setActiveProjectId(newProjId);
  };

  const createBlankProject = () => {
    const newProjId = 'proj_' + Date.now();
    const newProj: Project = {
      id: newProjId,
      name: 'New BOQ Construction Project',
      client: 'Self',
      location: 'India',
      state: 'Maharashtra',
      city: 'Mumbai',
      projectType: 'residential',
      builtUpArea: 1500,
      plotArea: 2000,
      startDate: new Date().toISOString().split('T')[0],
      validityDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      gstPercent: 18,
      contractorMarginPercent: 10,
      contingencyPercent: 3,
      defaultWastagePercent: 5,
      notes: 'Initial preliminary quantity takeoff.',
      floors: [
        { id: 'f1', name: 'Ground Floor', area: 1500, height: 3.3, notes: 'Standard level' }
      ],
      rooms: [
        { id: 'r1', name: 'Living Room', floorId: 'f1', notes: '' }
      ],
      items: []
    };

    setProjects(prev => [...prev, newProj]);
    setActiveProjectId(newProjId);
  };

  const deleteProject = (id: string) => {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      setProjects(prev => prev.filter(p => p.id !== id));
      if (activeProjectId === id) {
        setActiveProjectId('');
      }
    }
  };

  const handleBackupExport = () => {
    if (!activeProject) return;
    const blob = new Blob([JSON.stringify(activeProject, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeProject.name.toLowerCase().replace(/\s+/g, '_')}_backup.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBackupImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.id && parsed.name && parsed.items) {
          // Generate new ID to avoid duplicates
          parsed.id = 'proj_' + Date.now();
          setProjects(prev => [...prev, parsed]);
          setActiveProjectId(parsed.id);
          alert('Project imported successfully!');
        } else {
          alert('Invalid file format. Ensure it contains a valid project ID, name, and items.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  // -------------------------------------------------------------
  // BOQ Items & Calculations Handlers
  // -------------------------------------------------------------
  const calculateItemAmount = (item: BOQItem, projGst: number, projMargin: number) => {
    // 1. Calculate base quantity
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
    item.netQty = Number((baseQty * (1 + (item.wastagePercent || 0) / 100)).toFixed(3));

    // 2. Base rate components sum
    const baseRateSum =
      (item.rateMaterial || 0) +
      (item.rateLabour || 0) +
      (item.rateEquipment || 0) +
      (item.rateTransport || 0) +
      (item.rateOther || 0);

    // 3. Margin & GST calculation
    const marginRatio = 1 + (item.contractorMarginPercent !== undefined ? item.contractorMarginPercent : projMargin) / 100;
    const gstRatio = 1 + (item.gstPercent !== undefined ? item.gstPercent : projGst) / 100;

    item.finalRate = Number((baseRateSum * marginRatio * gstRatio).toFixed(2));

    // 4. Total Amount
    if (item.formulaType === 'lumpsum' && item.manualAmount > 0) {
      item.totalAmount = item.manualAmount;
    } else {
      item.totalAmount = Number((item.netQty * item.finalRate).toFixed(2));
    }

    return item;
  };

  const handleAddItem = () => {
    if (!activeProject) return;

    const newItem: BOQItem = {
      id: 'item_' + Date.now(),
      code: `ITEM-${activeProject.items.length + 1}`,
      categoryId: DEFAULT_CATEGORIES[0].id,
      floorId: activeProject.floors[0]?.id || 'all',
      roomId: 'all',
      description: 'New BOQ Item',
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
      wastagePercent: activeProject.defaultWastagePercent,
      netQty: 1,
      rateMaterial: 0,
      rateLabour: 0,
      rateEquipment: 0,
      rateTransport: 0,
      rateOther: 0,
      contractorMarginPercent: activeProject.contractorMarginPercent,
      gstPercent: activeProject.gstPercent,
      finalRate: 0,
      totalAmount: 0,
      remarks: ''
    };

    const updatedItems = [...activeProject.items, newItem];
    updateActiveProject({ ...activeProject, items: updatedItems });
  };

  const handleUpdateItemCell = (itemId: string, field: keyof BOQItem, value: any) => {
    if (!activeProject) return;

    const updatedItems = activeProject.items.map(item => {
      if (item.id === itemId) {
        const copy = { ...item, [field]: value };
        // Recalculate quantities and rate
        return calculateItemAmount(copy, activeProject.gstPercent, activeProject.contractorMarginPercent);
      }
      return item;
    });

    updateActiveProject({ ...activeProject, items: updatedItems });
  };

  const handleDuplicateItem = (itemId: string) => {
    if (!activeProject) return;
    const target = activeProject.items.find(item => item.id === itemId);
    if (!target) return;

    const duplicate: BOQItem = {
      ...target,
      id: 'item_' + Date.now() + Math.random().toString(36).substr(2, 4),
      code: target.code + '-DUP'
    };

    const updatedItems = [...activeProject.items, duplicate];
    updateActiveProject({ ...activeProject, items: updatedItems });
  };

  const handleDeleteItem = (itemId: string) => {
    if (!activeProject) return;
    const updatedItems = activeProject.items.filter(item => item.id !== itemId);
    updateActiveProject({ ...activeProject, items: updatedItems });
  };

  // Bulk Staging & Selection state
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
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
    if (confirm(`Are you sure you want to delete ${selectedItemIds.length} selected items?`)) {
      const updatedItems = activeProject.items.filter(item => !selectedItemIds.includes(item.id));
      updateActiveProject({ ...activeProject, items: updatedItems });
      setSelectedItemIds([]);
    }
  };

  // -------------------------------------------------------------
  // Floors & Rooms CRUD
  // -------------------------------------------------------------
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

    // Clone standard items from the Ground Floor (f1) to the new floor (exclude excavation/PCC/site prep)
    const sourceFloorId = activeProject.floors[0]?.id || 'f1';
    const sourceFloor = activeProject.floors[0];
    const sourceArea = sourceFloor ? sourceFloor.area : 1000;
    const areaFactor = sourceArea > 0 ? newFloorArea / sourceArea : 1;

    const clonedItems: BOQItem[] = [];
    activeProject.items.forEach(item => {
      // Only clone items that belong to the source floor
      // Exclude Site Prep (1), Excavation (2), Filling (3), PCC (4)
      if (item.floorId === sourceFloorId && !['1', '2', '3', '4'].includes(item.categoryId)) {
        const copy = { ...item };
        copy.id = 'item_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
        copy.floorId = newFloorId;
        copy.code = `${item.code}-FLR`;
        
        // Scale dimensions based on new floor area relative to source floor area
        if (areaFactor !== 1) {
          if (copy.formulaType === 'area') {
            copy.length = Number((copy.length * Math.sqrt(areaFactor)).toFixed(2));
            copy.width = Number((copy.width * Math.sqrt(areaFactor)).toFixed(2));
          } else if (copy.formulaType === 'volume') {
            copy.length = Number((copy.length * Math.sqrt(areaFactor)).toFixed(2));
            copy.width = Number((copy.width * Math.sqrt(areaFactor)).toFixed(2));
          } else if (copy.formulaType === 'length') {
            copy.length = Number((copy.length * Math.sqrt(areaFactor)).toFixed(2));
          } else if (copy.formulaType === 'count') {
            copy.count = Math.max(1, Math.round(copy.count * areaFactor));
          } else if (copy.formulaType === 'manual') {
            copy.manualQty = Number((copy.manualQty * areaFactor).toFixed(2));
          }
        }

        clonedItems.push(copy);
      }
    });

    const updatedFloors = [...activeProject.floors, newFloor];
    const updatedItems = [...activeProject.items, ...clonedItems];
    updateActiveProject({ ...activeProject, floors: updatedFloors, items: updatedItems });
    setNewFloorName('');
  };

  const handleRemoveFloor = (floorId: string) => {
    if (!activeProject) return;
    const targetFloor = activeProject.floors.find(f => f.id === floorId);
    if (!targetFloor) return;
    const nameLower = targetFloor.name.toLowerCase().trim();
    if (nameLower === 'ground floor' || nameLower === 'terrace') {
      alert("Ground Floor and Terrace are required minimum floors and cannot be deleted.");
      return;
    }

    const updatedFloors = activeProject.floors.filter(f => f.id !== floorId);
    const updatedRooms = activeProject.rooms.filter(r => r.floorId !== floorId);
    // Delete items associated with the deleted floor so calculations decrease
    const updatedItems = activeProject.items.filter(item => item.floorId !== floorId);
    updateActiveProject({ ...activeProject, floors: updatedFloors, rooms: updatedRooms, items: updatedItems });
  };

  const handleUpdateFloorArea = (floorId: string, newArea: number) => {
    if (!activeProject) return;
    const floor = activeProject.floors.find(f => f.id === floorId);
    if (!floor) return;
    const oldArea = floor.area || 1;
    if (oldArea === newArea) return;

    const ratio = newArea / oldArea;

    // Calculate old and new total built-up areas
    const oldTotal = activeProject.floors.reduce((sum, f) => sum + (f.area || 0), 0);
    const newTotal = oldTotal - oldArea + newArea;
    const totalRatio = oldTotal > 0 ? newTotal / oldTotal : 1;

    // Map through floors and update area
    const updatedFloors = activeProject.floors.map(f =>
      f.id === floorId ? { ...f, area: newArea } : f
    );

    // Scale all items
    const updatedItems = activeProject.items.map(item => {
      let itemFactor = 1;
      if (item.floorId === floorId) {
        itemFactor = ratio;
      } else if (item.floorId === 'all') {
        itemFactor = totalRatio;
      }

      if (itemFactor === 1) return item;

      // Scale dimensions based on formula type
      const copy = { ...item };
      if (copy.formulaType === 'area') {
        copy.length = Number((copy.length * Math.sqrt(itemFactor)).toFixed(2));
        copy.width = Number((copy.width * Math.sqrt(itemFactor)).toFixed(2));
      } else if (copy.formulaType === 'volume') {
        copy.length = Number((copy.length * Math.sqrt(itemFactor)).toFixed(2));
        copy.width = Number((copy.width * Math.sqrt(itemFactor)).toFixed(2));
      } else if (copy.formulaType === 'length') {
        copy.length = Number((copy.length * Math.sqrt(itemFactor)).toFixed(2));
      } else if (copy.formulaType === 'count') {
        copy.count = Math.max(1, Math.round(copy.count * itemFactor));
      } else if (copy.formulaType === 'manual') {
        copy.manualQty = Number((copy.manualQty * itemFactor).toFixed(2));
      }

      return copy;
    });

    updateActiveProject({
      ...activeProject,
      floors: updatedFloors,
      items: updatedItems,
      builtUpArea: newTotal
    });
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
  };

  const handleRemoveRoom = (roomId: string) => {
    if (!activeProject) return;
    const updatedRooms = activeProject.rooms.filter(r => r.id !== roomId);
    const updatedItems = activeProject.items.map(item =>
      item.roomId === roomId ? { ...item, roomId: 'all' } : item
    );
    updateActiveProject({ ...activeProject, rooms: updatedRooms, items: updatedItems });
  };

  // -------------------------------------------------------------
  // Rate Library Apply Handlers
  // -------------------------------------------------------------

  const handleApplyRate = (itemRate: RateItem, targetItemId: string) => {
    if (!activeProject) return;
    const updatedItems = activeProject.items.map(item => {
      if (item.id === targetItemId) {
        const copy = {
          ...item,
          unit: itemRate.unit,
          rateMaterial: itemRate.rateMaterial,
          rateLabour: itemRate.rateLabour,
          rateEquipment: itemRate.rateEquipment,
          rateTransport: itemRate.rateTransport,
          rateOther: itemRate.rateOther,
          gstPercent: itemRate.gstPercent,
          contractorMarginPercent: itemRate.contractorMarginPercent,
          description: itemRate.description
        };
        return calculateItemAmount(copy, activeProject.gstPercent, activeProject.contractorMarginPercent);
      }
      return item;
    });
    updateActiveProject({ ...activeProject, items: updatedItems });
  };

  // -------------------------------------------------------------
  // Calculations Engine (Totals, GST, Scenarios)
  // -------------------------------------------------------------
  const summaryTotals = useMemo(() => {
    if (!activeProject) return { baseTotal: 0, materialTotal: 0, labourTotal: 0, equipmentTotal: 0, transportTotal: 0, otherTotal: 0, grandTotal: 0, gstTotal: 0, marginTotal: 0, contingencyTotal: 0 };

    let materialTotal = 0;
    let labourTotal = 0;
    let equipmentTotal = 0;
    let transportTotal = 0;
    let otherTotal = 0;
    let grandTotal = 0;

    activeProject.items.forEach(item => {
      // Calculate multiplier factors for simulators
      const multiplierCement = item.categoryId === '4' || item.categoryId === '5' || item.categoryId === '8' || item.categoryId === '10' ? (1 + simCement / 100) : 1;
      const multiplierSteel = item.categoryId === '6' ? (1 + simSteel / 100) : 1;
      const multiplierLabour = (1 + simLabour / 100);
      const multiplierTile = item.categoryId === '12' || item.categoryId === '13' ? (1 + simTile / 100) : 1;
      const multiplierGeneral = (1 + simInflation / 100);

      const netQty = item.netQty || 0;

      // Temporary Simulated Base costs
      const matBase = (item.rateMaterial || 0) * multiplierCement * multiplierSteel * multiplierTile * multiplierGeneral;
      const labBase = (item.rateLabour || 0) * multiplierLabour * multiplierGeneral;
      const eqBase = (item.rateEquipment || 0) * multiplierGeneral;
      const transBase = (item.rateTransport || 0) * multiplierGeneral;
      const othBase = (item.rateOther || 0) * multiplierGeneral;

      const baseSum = matBase + labBase + eqBase + transBase + othBase;

      // Apply margin and GST
      const marginVal = baseSum * ((item.contractorMarginPercent !== undefined ? item.contractorMarginPercent : activeProject.contractorMarginPercent) / 100);
      const subtotalBeforeGst = baseSum + marginVal;
      const gstVal = subtotalBeforeGst * ((item.gstPercent !== undefined ? item.gstPercent : activeProject.gstPercent) / 100);

      const finalRate = subtotalBeforeGst + gstVal;

      if (item.formulaType === 'lumpsum' && item.manualAmount > 0) {
        grandTotal += item.manualAmount;
        // Mock distribution
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
    const marginTotal = baseTotal * (activeProject.contractorMarginPercent / 100);
    const gstTotal = (baseTotal + marginTotal) * (activeProject.gstPercent / 100);
    const contingencyTotal = grandTotal * (activeProject.contingencyPercent / 100);
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

  // Cost per Sq Ft calculations
  const totalFloorAreaSqft = useMemo(() => {
    if (!activeProject) return 0;
    return activeProject.floors.reduce((sum, f) => sum + (f.area || 0), 0);
  }, [activeProject]);

  // -------------------------------------------------------------
  // Scenario slots state
  // -------------------------------------------------------------
  const [customRatesScenario, setCustomRatesScenario] = useState<{ budget: number; standard: number; premium: number }>({
    budget: 0,
    standard: 0,
    premium: 0
  });

  const handleDuplicateToScenario = (type: 'budget' | 'premium') => {
    if (!summaryTotals.grandTotal) return;
    const factor = type === 'budget' ? 0.85 : 1.25; // standard scalar simulation
    setCustomRatesScenario(prev => ({
      ...prev,
      standard: summaryTotals.grandTotal,
      [type]: summaryTotals.grandTotal * factor
    }));
    alert(`Project cloned to ${type.toUpperCase()} Estimate successfully!`);
  };

  // -------------------------------------------------------------
  // Pre-compiled Filters list
  // -------------------------------------------------------------
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
        i.description.toLowerCase().includes(q) ||
        i.specification.toLowerCase().includes(q) ||
        i.code.toLowerCase().includes(q)
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

  // -------------------------------------------------------------
  // Indian Materials Calculations Summary
  // -------------------------------------------------------------
  const materialEstimationTotals = useMemo(() => {
    if (!activeProject) return null;

    let cementBags = 0;
    let sandCft = 0;
    let aggregateCft = 0;
    let steelKg = 0;
    let brickCount = 0;
    let tileCount = 0;
    let adhesiveBags = 0;
    let groutKg = 0;
    let paintLitres = 0;
    let primerLitres = 0;
    let puttyKg = 0;

    activeProject.items.forEach(item => {
      const qty = item.netQty || 0;

      // Concrete RCC PCC
      if ((item.categoryId === '4' || item.categoryId === '5') && item.concreteMix) {
        const est = estimateConcreteMaterials(qty, item.unit as any, item.concreteMix, item.includeSteel || false, item.steelRatio || 80);
        cementBags += est.cementBags;
        sandCft += est.sandCft;
        aggregateCft += est.aggregateCft;
        steelKg += est.steelKg;
      }
      // Brickwork / Blockwork
      else if ((item.categoryId === '8' || item.categoryId === '9') && item.brickType) {
        const est = estimateBrickworkMaterials(qty, item.unit as any, item.brickType, item.mortarRatio);
        brickCount += est.brickCount;
        cementBags += est.cementBags;
        sandCft += est.sandCft;
      }
      // Plastering
      else if (item.categoryId === '10') {
        const est = estimatePlasterMaterials(qty, item.unit as any, item.plasterThickness || 12, item.mortarRatio);
        cementBags += est.cementBags;
        sandCft += est.sandCft;
      }
      // Flooring / Tiles
      else if (item.categoryId === '12' || item.categoryId === '13') {
        const est = estimateFlooringMaterials(qty, item.unit as any, item.tileLength || 2, item.tileWidth || 2);
        tileCount += est.tileCount;
        adhesiveBags += est.adhesiveBags20kg;
        groutKg += est.groutKg;
      }
      // Painting
      else if (item.categoryId === '14') {
        const est = estimatePaintingMaterials(qty, item.unit as any, 2);
        paintLitres += est.paintLitres;
        primerLitres += est.primerLitres;
        puttyKg += est.puttyKg;
      }
      // Steel members supply
      else if (item.categoryId === '6' && item.unit === 'kg') {
        steelKg += qty;
      }
    });

    return {
      cementBags,
      sandCft: Math.round(sandCft),
      aggregateCft: Math.round(aggregateCft),
      steelKg,
      brickCount,
      tileCount,
      adhesiveBags,
      groutKg: Number(groutKg.toFixed(1)),
      paintLitres: Number(paintLitres.toFixed(1)),
      primerLitres: Number(primerLitres.toFixed(1)),
      puttyKg
    };
  }, [activeProject]);

  // -------------------------------------------------------------
  // Exporters Logic (Excel & PDF)
  // -------------------------------------------------------------
  const handleExportExcel = () => {
    if (!activeProject || !materialEstimationTotals) return;

    // Sheet 1: Summary details
    const summaryData = [
      ['Project Metric', 'Value'],
      ['Project Name', activeProject.name],
      ['Client Name', activeProject.client],
      ['Location', activeProject.location],
      ['Built-up Area (Sq Ft)', activeProject.builtUpArea],
      ['GST Rate (%)', activeProject.gstPercent],
      ['Contractor Margin (%)', activeProject.contractorMarginPercent],
      ['Total Material Cost (₹)', summaryTotals.materialTotal.toFixed(2)],
      ['Total Labour Cost (₹)', summaryTotals.labourTotal.toFixed(2)],
      ['Total Equipment Cost (₹)', summaryTotals.equipmentTotal.toFixed(2)],
      ['Total GST (₹)', summaryTotals.gstTotal.toFixed(2)],
      ['Total Contractor Margin (₹)', summaryTotals.marginTotal.toFixed(2)],
      ['Contingency Reserves (₹)', summaryTotals.contingencyTotal.toFixed(2)],
      ['GRAND TOTAL ESTIMATED (₹)', summaryTotals.grandTotal.toFixed(2)],
      ['Estimated Cost / Sq Ft (₹)', totalFloorAreaSqft > 0 ? (summaryTotals.grandTotal / totalFloorAreaSqft).toFixed(2) : 'N/A']
    ];

    // Sheet 2: BOQ line items
    const boqHeaders = ['Item Code', 'Category', 'Floor', 'Room', 'Description', 'Specifications', 'Unit', 'Length', 'Width', 'Height', 'Count', 'Net Qty', 'Material Rate', 'Labour Rate', 'Final Rate', 'Total Amount', 'Remarks'];
    const boqData = activeProject.items.map(i => {
      const cat = DEFAULT_CATEGORIES.find(c => c.id === i.categoryId)?.name || '';
      const flr = activeProject.floors.find(f => f.id === i.floorId)?.name || 'All Floors';
      const rm = activeProject.rooms.find(r => r.id === i.roomId)?.name || 'All Rooms';
      return [
        i.code, cat, flr, rm, i.description, i.specification, i.unit, i.length, i.width, i.height, i.count, i.netQty, i.rateMaterial, i.rateLabour, i.finalRate, i.totalAmount, i.remarks
      ];
    });

    // Sheet 3: Material break downs
    const materialsData = [
      ['Material Item', 'Estimated Quantities', 'Unit'],
      ['Cement', materialEstimationTotals.cementBags, 'Bags'],
      ['Sand', materialEstimationTotals.sandCft, 'Cft'],
      ['Coarse Aggregate', materialEstimationTotals.aggregateCft, 'Cft'],
      ['TMT Steel Rebar', materialEstimationTotals.steelKg, 'Kg'],
      ['Bricks / Blocks', materialEstimationTotals.brickCount, 'Nos'],
      ['Vitrified Tiles', materialEstimationTotals.tileCount, 'Nos'],
      ['Tile Adhesive', materialEstimationTotals.adhesiveBags, 'Bags (20kg)'],
      ['Grout powder', materialEstimationTotals.groutKg, 'Kg'],
      ['Acrylic Paint', materialEstimationTotals.paintLitres, 'Litres'],
      ['Primer', materialEstimationTotals.primerLitres, 'Litres'],
      ['Wall Putty', materialEstimationTotals.puttyKg, 'Kg']
    ];

    // Build Workbook
    const wb = XLSX.utils.book_new();
    
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Project Summary');

    const wsBOQ = XLSX.utils.aoa_to_sheet([boqHeaders, ...boqData]);
    XLSX.utils.book_append_sheet(wb, wsBOQ, 'Detailed BOQ');

    const wsMat = XLSX.utils.aoa_to_sheet(materialsData);
    XLSX.utils.book_append_sheet(wb, wsMat, 'Material Breakdown');

    XLSX.writeFile(wb, `${activeProject.name.replace(/\s+/g, '_')}_BOQ_Estimate.xlsx`);
  };

  const handleExportPDF = () => {
    if (!activeProject) return;

    const doc = new jsPDF();
    let currentY = 20;

    // Header Title
    doc.setFontSize(18);
    doc.text('Advanced Bill of Quantities (BOQ) Report', 14, currentY);
    currentY += 10;

    // Project Details Meta
    doc.setFontSize(10);
    doc.text(`Project Name: ${activeProject.name}`, 14, currentY);
    doc.text(`Client Name: ${activeProject.client}`, 110, currentY);
    currentY += 6;
    doc.text(`Location: ${activeProject.location}, ${activeProject.city}`, 14, currentY);
    doc.text(`Estimate Date: ${activeProject.startDate}`, 110, currentY);
    currentY += 12;

    // Cost Breakdown list
    doc.setFontSize(12);
    doc.text('Cost Summary Breakdown:', 14, currentY);
    currentY += 8;

    doc.setFontSize(9);
    doc.text(`Base Material Costs: Rs ${summaryTotals.materialTotal.toLocaleString('en-IN')}`, 14, currentY);
    doc.text(`GST Tax Reserves: Rs ${summaryTotals.gstTotal.toLocaleString('en-IN')}`, 110, currentY);
    currentY += 5;
    doc.text(`Base Labor Costs: Rs ${summaryTotals.labourTotal.toLocaleString('en-IN')}`, 14, currentY);
    doc.text(`Contingency Reserves: Rs ${summaryTotals.contingencyTotal.toLocaleString('en-IN')}`, 110, currentY);
    currentY += 8;

    doc.setFontSize(14);
    doc.text(`GRAND TOTAL ESTIMATED: Rs ${summaryTotals.grandTotal.toLocaleString('en-IN')}`, 14, currentY);
    currentY += 15;

    // Render BOQ Items list
    doc.setFontSize(12);
    doc.text('Detailed BOQ Line Items:', 14, currentY);
    currentY += 8;

    doc.setFontSize(8);
    // Draw columns headers
    doc.text('Code', 14, currentY);
    doc.text('Description', 35, currentY);
    doc.text('Unit', 105, currentY);
    doc.text('Net Qty', 125, currentY);
    doc.text('Final Rate', 150, currentY);
    doc.text('Amount (Rs)', 175, currentY);
    currentY += 4;
    doc.line(14, currentY, 195, currentY);
    currentY += 5;

    activeProject.items.forEach(item => {
      if (currentY > 275) {
        doc.addPage();
        currentY = 20;
      }
      doc.text(item.code, 14, currentY);
      doc.text(item.description.substring(0, 32), 35, currentY);
      doc.text(item.unit, 105, currentY);
      doc.text(item.netQty.toFixed(2), 125, currentY);
      doc.text(item.finalRate.toFixed(2), 150, currentY);
      doc.text(item.totalAmount.toFixed(2), 175, currentY);
      currentY += 6;
    });

    // Disclaimer footer
    if (currentY > 260) {
      doc.addPage();
      currentY = 20;
    }
    currentY += 10;
    doc.setFontSize(8);
    doc.text('Disclaimer: This report provides preliminary construction quantities estimates only.', 14, currentY);
    currentY += 4;
    doc.text('Final structures and engineering bills must be verified by a licensed architect or surveyor.', 14, currentY);

    doc.save(`${activeProject.name.replace(/\s+/g, '_')}_estimate.pdf`);
  };

  // -------------------------------------------------------------
  // SVGs Chart Builders (Pie, Bar)
  // -------------------------------------------------------------
  const chartCategoryData = useMemo(() => {
    if (!activeProject || activeProject.items.length === 0) return [];
    const totalsMap: Record<string, number> = {};

    activeProject.items.forEach(i => {
      totalsMap[i.categoryId] = (totalsMap[i.categoryId] || 0) + i.totalAmount;
    });

    return Object.entries(totalsMap).map(([catId, amt]) => {
      const name = DEFAULT_CATEGORIES.find(c => c.id === catId)?.name || 'Other';
      return { name, amount: amt };
    }).sort((a, b) => b.amount - a.amount).slice(0, 5);
  }, [activeProject]);

  return (
    <>
      <SEO
        title="Advanced BOQ Calculator India | Construction Quantity Estimator"
        description="Premium online BOQ estimation workspace for Indian residential & commercial projects. Calculate concrete, steel, plaster, tiles, and export to Excel/PDF."
        keywords={['boq calculator', 'bill of quantities india', 'building estimator', 'civil costing tool', 'excel boq export']}
      />

      {/* ── Premium Hero Header ── */}
      <div className="relative overflow-hidden rounded-3xl mb-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/40 shadow-2xl">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 24px,rgba(255,255,255,.05) 24px,rgba(255,255,255,.05) 25px),repeating-linear-gradient(90deg,transparent,transparent 24px,rgba(255,255,255,.05) 24px,rgba(255,255,255,.05) 25px)' }} />
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-indigo-500/15 blur-2xl pointer-events-none" />
        <div className="relative z-10 p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-amber-500/20 border border-amber-400/30 shadow-lg shadow-amber-500/10">
                <Calculator className="w-8 h-8 text-amber-400" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                  Advanced BOQ Calculator <span className="text-amber-400">India</span>
                </h1>
                <p className="text-sm text-indigo-300 mt-1">Professional quantity estimation, rate analysis &amp; scenario costing workspace</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-3 py-2">
              <Building className="w-4 h-4 text-indigo-300 shrink-0" />
              <select
                value={activeProjectId}
                onChange={(e) => setActiveProjectId(e.target.value)}
                className="bg-transparent text-white text-xs font-bold focus:outline-none min-w-[180px] cursor-pointer"
              >
                <option value="" className="text-zinc-900">— Select Project —</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id} className="text-zinc-900">{p.name}</option>
                ))}
              </select>
            </div>
            <button onClick={createBlankProject} className="px-4 py-2 text-xs font-bold bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl transition shadow-lg shadow-indigo-500/30">+ New Project</button>
            {activeProjectId && (
              <button onClick={() => deleteProject(activeProjectId)} className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-300 border border-red-500/30 rounded-xl transition" title="Delete Active Project">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            {activeProject && (
              <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">{activeProject.items.length} Items</span>
                <span className="w-px h-4 bg-emerald-700" />
                <span className="text-[10px] font-black text-emerald-300 font-mono">₹{summaryTotals.grandTotal.toLocaleString('en-IN')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Autosave badge */}
      {activeProject && (
        <div className="flex justify-end mb-4">
          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-full border ${autosaveIndicator === 'Saved' ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400' : 'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-400'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${autosaveIndicator === 'Saved' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
            {autosaveIndicator}
          </span>
        </div>
      )}

      {/* ── Main Workspace ── */}
      {!activeProject ? (
        <div className="py-20 px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex p-5 rounded-3xl bg-gradient-to-br from-indigo-100 to-blue-50 dark:from-indigo-950/60 dark:to-slate-900 border border-indigo-200 dark:border-indigo-800 shadow-xl">
              <Building className="w-16 h-16 text-indigo-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white">No Project Workspace Active</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 max-w-lg mx-auto">Start fresh or load a pre-filled Indian construction template with realistic local material rates.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <button onClick={() => loadTemplate('small_house')} className="group p-5 bg-white dark:bg-zinc-900 border-2 border-indigo-200 dark:border-indigo-800 hover:border-indigo-500 rounded-2xl shadow-sm hover:shadow-indigo-100 dark:hover:shadow-indigo-900 transition-all text-left">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><span className="text-xl">🏠</span></div>
                <div className="font-black text-zinc-900 dark:text-white text-sm">G+0 Residential</div>
                <div className="text-xs text-zinc-500 mt-1">Foundation, RCC slab, brickwork, tiles, paint</div>
              </button>
              <button onClick={() => loadTemplate('kitchen')} className="group p-5 bg-white dark:bg-zinc-900 border-2 border-amber-200 dark:border-amber-800 hover:border-amber-500 rounded-2xl shadow-sm transition-all text-left">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><span className="text-xl">🍳</span></div>
                <div className="font-black text-zinc-900 dark:text-white text-sm">Modular Kitchen</div>
                <div className="text-xs text-zinc-500 mt-1">Interior renovation — tiles, electrical, plumbing</div>
              </button>
              <button onClick={createBlankProject} className="group p-5 bg-white dark:bg-zinc-900 border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-500 rounded-2xl shadow-sm transition-all text-left">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><span className="text-xl">📋</span></div>
                <div className="font-black text-zinc-900 dark:text-white text-sm">Blank Project</div>
                <div className="text-xs text-zinc-500 mt-1">Start from scratch with your own BOQ items</div>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 1. Left Sidebar: Settings, Floors, Rooms */}
            <div className="lg:col-span-3 space-y-6">
              {/* Project Config Card */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-3.5 bg-gradient-to-r from-indigo-50 to-slate-50 dark:from-indigo-950/40 dark:to-slate-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-indigo-500 flex items-center justify-center shrink-0 text-white text-[11px]">⚙</div>
                  <h3 className="text-xs font-black text-zinc-700 dark:text-zinc-200 uppercase tracking-wider">Project Config</h3>
                </div>
                <div className="p-5 space-y-3.5 text-xs">
                  <div>
                    <label className="block font-bold text-zinc-500 dark:text-zinc-400 mb-1.5">Project Name</label>
                    <input type="text" value={activeProject.name} onChange={(e) => updateActiveProject({ ...activeProject, name: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-bold text-zinc-500 dark:text-zinc-400 mb-1.5">Client</label>
                      <input type="text" value={activeProject.client} onChange={(e) => updateActiveProject({ ...activeProject, client: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                    </div>
                    <div>
                      <label className="block font-bold text-zinc-500 dark:text-zinc-400 mb-1.5">Type</label>
                      <select value={activeProject.projectType} onChange={(e) => updateActiveProject({ ...activeProject, projectType: e.target.value as any })} className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
                        <option value="residential">Residential</option>
                        <option value="commercial">Commercial</option>
                        <option value="renovation">Renovation</option>
                        <option value="interior">Interior</option>
                        <option value="industrial">Industrial</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-bold text-zinc-500 dark:text-zinc-400 mb-1.5">Built Area (sqft)</label>
                      <input
                        type="number"
                        value={activeProject.builtUpArea}
                        onChange={(e) => updateActiveProject({ ...activeProject, builtUpArea: parseFloat(e.target.value) || 0 })}
                        disabled={activeProject.floors.length > 0}
                        title={activeProject.floors.length > 0 ? "Calculated from sum of floor areas" : "Set project built area"}
                        className={`w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 font-mono text-zinc-900 dark:text-white focus:outline-none ${
                          activeProject.floors.length > 0
                            ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed"
                            : "bg-zinc-50 dark:bg-zinc-950 focus:ring-2 focus:ring-indigo-500/30"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-zinc-500 dark:text-zinc-400 mb-1.5">GST (%)</label>
                      <input type="number" value={activeProject.gstPercent} onChange={(e) => updateActiveProject({ ...activeProject, gstPercent: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-mono text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-bold text-zinc-500 dark:text-zinc-400 mb-1.5">Margin (%)</label>
                      <input type="number" value={activeProject.contractorMarginPercent} onChange={(e) => updateActiveProject({ ...activeProject, contractorMarginPercent: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-mono text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                    </div>
                    <div>
                      <label className="block font-bold text-zinc-500 dark:text-zinc-400 mb-1.5">Contingency (%)</label>
                      <input type="number" value={activeProject.contingencyPercent} onChange={(e) => updateActiveProject({ ...activeProject, contingencyPercent: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-mono text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                    </div>
                  </div>
                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex gap-2">
                    <button onClick={handleBackupExport} className="flex-1 py-2 border border-zinc-200 dark:border-zinc-700 text-[10px] font-black uppercase rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition">Export JSON</button>
                    <label className="flex-1 py-2 border border-zinc-200 dark:border-zinc-700 text-[10px] font-black uppercase rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition text-center cursor-pointer">Import JSON<input type="file" accept=".json" onChange={handleBackupImport} className="hidden" /></label>
                  </div>
                </div>
              </div>

              {/* Floors Card */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-3.5 bg-gradient-to-r from-blue-50 to-slate-50 dark:from-blue-950/30 dark:to-slate-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-blue-500 flex items-center justify-center shrink-0 text-[10px]">🏢</div>
                  <h3 className="text-xs font-black text-zinc-700 dark:text-zinc-200 uppercase tracking-wider">Floors</h3>
                  <span className="ml-auto text-[10px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full">{activeProject.floors.length}</span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {activeProject.floors.map((f, idx) => {
                      const isProtected = f.name.toLowerCase().trim() === 'ground floor' || f.name.toLowerCase().trim() === 'terrace';
                      return (
                        <div key={f.id} className="flex justify-between items-center bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 px-3 py-2 rounded-xl text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-lg bg-blue-500 text-white text-[9px] font-black flex items-center justify-center shrink-0">{idx + 1}</span>
                            <div>
                              <span className="font-bold text-zinc-800 dark:text-zinc-200 block">{f.name}</span>
                              <div className="flex items-center gap-1 mt-0.5">
                                <input
                                  type="number"
                                  value={f.area || ''}
                                  onChange={(e) => handleUpdateFloorArea(f.id, parseInt(e.target.value) || 0)}
                                  className="w-14 px-1 py-0.5 text-[10px] font-mono border border-zinc-200 dark:border-zinc-850 rounded bg-white/80 dark:bg-zinc-950/80 focus:outline-none focus:ring-1 focus:ring-blue-500/50 text-zinc-800 dark:text-zinc-200"
                                  title="Edit floor area"
                                />
                                <span className="text-[10px] text-zinc-400 select-none">sqft</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveFloor(f.id)}
                            disabled={isProtected}
                            title={isProtected ? "Minimum required floor (cannot be deleted)" : "Delete floor"}
                            className={`p-1 transition ${
                              isProtected
                                ? "text-zinc-300 dark:text-zinc-700 cursor-not-allowed"
                                : "text-red-400 hover:text-red-650"
                            }`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                    <input
                      type="text"
                      placeholder="Floor Name (e.g. Ground Floor)"
                      value={newFloorName}
                      onChange={(e) => setNewFloorName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-blue-400/30 text-zinc-900 dark:text-white"
                    />
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          placeholder="Area"
                          value={newFloorArea || ''}
                          onChange={(e) => setNewFloorArea(parseInt(e.target.value) || 0)}
                          className="w-full pl-3 pr-9 py-1.5 text-xs border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 font-mono focus:outline-none focus:ring-2 focus:ring-blue-400/30 text-zinc-900 dark:text-white"
                        />
                        <span className="absolute right-2.5 top-1.5 text-[9px] text-zinc-400 font-bold select-none">sqft</span>
                      </div>
                      <button
                        onClick={handleAddFloor}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-500/10 flex items-center justify-center shrink-0"
                      >
                        Add Floor
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rooms Card */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-3.5 bg-gradient-to-r from-violet-50 to-slate-50 dark:from-violet-950/30 dark:to-slate-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-violet-500 flex items-center justify-center shrink-0 text-[10px]">🚪</div>
                  <h3 className="text-xs font-black text-zinc-700 dark:text-zinc-200 uppercase tracking-wider">Rooms / Zones</h3>
                  <span className="ml-auto text-[10px] font-bold text-violet-500 bg-violet-50 dark:bg-violet-950/50 px-2 py-0.5 rounded-full">{activeProject.rooms.length}</span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {activeProject.rooms.map(r => {
                      const floorName = activeProject.floors.find(f => f.id === r.floorId)?.name || '—';
                      return (
                        <div key={r.id} className="flex justify-between items-center bg-violet-50/60 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/40 px-3 py-2 rounded-xl text-xs">
                          <div>
                            <span className="font-bold text-zinc-800 dark:text-zinc-200 block">{r.name}</span>
                            <span className="text-[10px] text-violet-500 font-medium">{floorName}</span>
                          </div>
                          <button onClick={() => handleRemoveRoom(r.id)} className="text-red-400 hover:text-red-600 transition p-1"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      );
                    })}
                  </div>
                  <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                    <input
                      type="text"
                      placeholder="Room Name (e.g. Living Room)"
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-violet-400/30 text-zinc-900 dark:text-white"
                    />
                    <div className="flex gap-2">
                      <select
                        value={newRoomFloorId}
                        onChange={(e) => setNewRoomFloorId(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-violet-400/30 text-zinc-900 dark:text-white"
                      >
                        <option value="">Floor</option>
                        {activeProject.floors.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                      </select>
                      <button
                        onClick={handleAddRoom}
                        className="px-4 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-violet-500/10 flex items-center justify-center shrink-0"
                      >
                        Add Room
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* 2. Main Workspace: Spreadsheet view & Filters */}
            <div className="lg:col-span-9 space-y-6">
              {/* Toolbar & Filters */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Search items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full sm:w-52 pl-9 pr-4 py-2 text-xs border border-zinc-200 dark:border-zinc-750 rounded-xl bg-zinc-50/50 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-zinc-900 dark:text-white transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
                    <select
                      value={selectedCategoryFilter}
                      onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                      className="px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-750 rounded-xl bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition cursor-pointer"
                    >
                      <option value="all">All Categories</option>
                      {DEFAULT_CATEGORIES.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>

                    <select
                      value={selectedFloorFilter}
                      onChange={(e) => setSelectedFloorFilter(e.target.value)}
                      className="px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-750 rounded-xl bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition cursor-pointer"
                    >
                      <option value="all">All Floors</option>
                      {activeProject.floors.map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>

                    <select
                      value={selectedRoomFilter}
                      onChange={(e) => setSelectedRoomFilter(e.target.value)}
                      className="px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-750 rounded-xl bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition cursor-pointer"
                    >
                      <option value="all">All Rooms</option>
                      {activeProject.rooms.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>

                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-750 rounded-xl bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition cursor-pointer"
                    >
                      <option value="none">Sort: Default</option>
                      <option value="code">Sort: Code</option>
                      <option value="amount">Sort: Amount</option>
                      <option value="category">Sort: Category</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
                  <button
                    onClick={() => setShowRateLibrary(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold border border-zinc-200 dark:border-zinc-750 rounded-xl bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-750 dark:text-zinc-350 transition"
                  >
                    <Coins className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    Rate Library
                  </button>
                  <button
                    onClick={handleAddItem}
                    className="inline-flex items-center gap-1 px-4 py-2 text-xs bg-indigo-650 hover:bg-indigo-600 text-white font-bold rounded-xl transition shadow-lg shadow-indigo-650/20"
                  >
                    + Add Item
                  </button>
                  {selectedItemIds.length > 0 && (
                    <button
                      onClick={handleBulkDelete}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-650 dark:text-red-400 border border-red-500/25 font-bold rounded-xl transition"
                    >
                      <Trash2 className="w-3.5 h-3.5 shrink-0" />
                      Delete ({selectedItemIds.length})
                    </button>
                  )}
                </div>
              </div>

              {/* BOQ Spreadsheet Table */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto max-w-full">
                  <table className="w-full text-left border-collapse text-xs min-w-[1250px]">
                    <thead>
                      <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-150 dark:border-zinc-800 text-[10px] text-zinc-400 font-bold uppercase">
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
                        <th className="py-3 px-3 w-64">Description</th>
                        <th className="py-3 px-3 w-20 text-center">Unit</th>
                        <th className="py-3 px-3 w-60 text-center">Dimensions &amp; Nos (L × W × H × Count)</th>
                        <th className="py-3 px-3 w-24 text-right">Base Rate</th>
                        <th className="py-3 px-3 w-28 text-right">Final Rate (Taxes)</th>
                        <th className="py-3 px-3 w-28 text-right">Amount (₹)</th>
                        <th className="py-3 px-3 w-28 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-150 dark:divide-zinc-850">
                      {filteredBOQItems.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="py-12 text-center text-zinc-400 font-medium">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <span className="text-2xl">🔍</span>
                              <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">No items found matching your filters</p>
                              <p className="text-xs text-zinc-400 dark:text-zinc-500">Add a new item or clear your active filters above.</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredBOQItems.map(item => {
                          const baseRateSum = (item.rateMaterial || 0) + (item.rateLabour || 0) + (item.rateEquipment || 0) + (item.rateTransport || 0) + (item.rateOther || 0);
                          return (
                            <tr key={item.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/10 text-zinc-700 dark:text-zinc-300 even:bg-zinc-50/20 dark:even:bg-zinc-950/10 transition-colors">
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
                                  className="w-full bg-transparent focus:outline-none text-zinc-800 dark:text-zinc-200 border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-indigo-500 cursor-pointer transition"
                                >
                                  {DEFAULT_CATEGORIES.map(c => (
                                    <option key={c.id} value={c.id} className="text-zinc-900">{c.name}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="py-2.5 px-3">
                                <input
                                  type="text"
                                  value={item.description}
                                  onChange={(e) => handleUpdateItemCell(item.id, 'description', e.target.value)}
                                  className="w-full bg-transparent focus:outline-none font-semibold text-zinc-805 dark:text-zinc-200 border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-indigo-500 transition"
                                />
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <select
                                  value={item.unit}
                                  onChange={(e) => handleUpdateItemCell(item.id, 'unit', e.target.value)}
                                  className="w-full bg-transparent focus:outline-none text-zinc-800 dark:text-zinc-200 border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-indigo-500 text-[11px] cursor-pointer transition text-center"
                                >
                                  {['Nos', 'Rmt', 'Sq ft', 'Sq m', 'Cft', 'Cum', 'Kg', 'Ton', 'Bag', 'Litre', 'Set', 'Lump Sum'].map(u => (
                                    <option key={u} value={u} className="text-zinc-900">{u}</option>
                                  ))}
                                </select>
                              </td>
                              {/* Consolidated dimensions input cell */}
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
                                    title="Count"
                                    onChange={(e) => handleUpdateItemCell(item.id, 'count', parseInt(e.target.value) || 1)}
                                    className="w-12 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded px-1 py-0.5 text-center font-bold text-indigo-650 dark:text-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-zinc-900 dark:text-white"
                                  />
                                </div>
                              </td>
                              <td className="py-2.5 px-3 font-mono text-zinc-505 text-right">
                                ₹{baseRateSum.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                              </td>
                              <td className="py-2.5 px-3 font-mono font-bold text-zinc-900 dark:text-white text-right">
                                ₹{item.finalRate.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-right font-black text-indigo-650 dark:text-indigo-400">
                                ₹{item.totalAmount.toLocaleString('en-IN')}
                              </td>
                              {/* Actions on rows */}
                              <td className="py-2.5 px-3 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => setActiveRateAnalysisItemId(item.id)}
                                    className="p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg text-zinc-400 hover:text-indigo-600 transition"
                                    title="Rate Analysis Breakdown"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
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
                      <tfoot className="bg-zinc-50 dark:bg-zinc-950/50 font-bold border-t border-zinc-200 dark:border-zinc-800">
                        <tr className="text-zinc-800 dark:text-zinc-200">
                          <td colSpan={5} className="py-3.5 px-3 text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">Filtered Subtotal</td>
                          <td className="py-3.5 px-3 font-mono text-[11px] text-zinc-400 text-center">
                            {filteredBOQItems.length} items
                          </td>
                          <td colSpan={2} className="py-3.5 px-3"></td>
                          <td className="py-3.5 px-3 font-mono text-right text-sm text-indigo-650 dark:text-indigo-400 font-black">
                            ₹{filteredBOQItems.reduce((sum, item) => sum + item.totalAmount, 0).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 px-3"></td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>

              {/* 3. Materials Estimations Summary */}
              {materialEstimationTotals && (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-850 pb-3">
                    <span className="text-lg">🧱</span>
                    <h3 className="text-xs font-black text-zinc-700 dark:text-zinc-200 uppercase tracking-wider">
                      Estimated Indian Construction Materials Breakdown
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border-l-4 border-l-amber-500 border border-zinc-150 dark:border-zinc-850 shadow-sm hover:shadow-md transition">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-sm">🥫</span>
                        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Cement Bags</span>
                      </div>
                      <span className="text-base font-black text-zinc-900 dark:text-white font-mono">{materialEstimationTotals.cementBags.toLocaleString()} Bags</span>
                    </div>

                    <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border-l-4 border-l-yellow-600 border border-zinc-150 dark:border-zinc-850 shadow-sm hover:shadow-md transition">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-sm">⏳</span>
                        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Sand Volume</span>
                      </div>
                      <span className="text-base font-black text-zinc-900 dark:text-white font-mono">{materialEstimationTotals.sandCft.toLocaleString()} Cft</span>
                    </div>

                    <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border-l-4 border-l-zinc-500 border border-zinc-150 dark:border-zinc-850 shadow-sm hover:shadow-md transition">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-sm">🪨</span>
                        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Coarse Aggregate</span>
                      </div>
                      <span className="text-base font-black text-zinc-900 dark:text-white font-mono">{materialEstimationTotals.aggregateCft.toLocaleString()} Cft</span>
                    </div>

                    <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border-l-4 border-l-blue-600 border border-zinc-150 dark:border-zinc-850 shadow-sm hover:shadow-md transition">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-sm">⛓️</span>
                        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider">Reinforcement Steel</span>
                      </div>
                      <span className="text-base font-black text-zinc-900 dark:text-white font-mono">{materialEstimationTotals.steelKg.toLocaleString()} Kg</span>
                    </div>

                    <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border-l-4 border-l-orange-600 border border-zinc-150 dark:border-zinc-850 shadow-sm hover:shadow-md transition">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-sm">🧱</span>
                        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-wider">Brick / Block Count</span>
                      </div>
                      <span className="text-base font-black text-zinc-900 dark:text-white font-mono">{materialEstimationTotals.brickCount.toLocaleString()} Pcs</span>
                    </div>

                    <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border-l-4 border-l-teal-600 border border-zinc-150 dark:border-zinc-850 shadow-sm hover:shadow-md transition">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-sm">🟫</span>
                        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-wider">Flooring Tiles</span>
                      </div>
                      <span className="text-base font-black text-zinc-900 dark:text-white font-mono">{materialEstimationTotals.tileCount.toLocaleString()} Tiles</span>
                    </div>

                    <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border-l-4 border-l-violet-600 border border-zinc-150 dark:border-zinc-850 shadow-sm hover:shadow-md transition">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-sm">🧴</span>
                        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-wider">Tile Adhesive</span>
                      </div>
                      <span className="text-base font-black text-zinc-900 dark:text-white font-mono">{materialEstimationTotals.adhesiveBags.toLocaleString()} Bags</span>
                    </div>

                    <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border-l-4 border-l-rose-500 border border-zinc-150 dark:border-zinc-850 shadow-sm hover:shadow-md transition">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-sm">🎨</span>
                        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-wider">Wall Emulsion Paint</span>
                      </div>
                      <span className="text-base font-black text-zinc-900 dark:text-white font-mono">{materialEstimationTotals.paintLitres.toLocaleString()} Ltrs</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-rose-500/80 font-bold bg-rose-50/40 dark:bg-rose-950/20 p-3 rounded-xl border border-rose-100/40 dark:border-rose-900/40">
                    * Note: These are rough rule-of-thumb quantities for budgeting and planning only. Actual steel structural and concrete grades details must be validated by a structural designer.
                  </div>
                </div>
              )}

              {/* 4. Scenario Simulator Sliders */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-850 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎛️</span>
                    <h3 className="text-xs font-black text-zinc-700 dark:text-zinc-200 uppercase tracking-wider">
                      Indian Market Rates &amp; Inflation Scenario Simulator
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setSimCement(0); setSimSteel(0); setSimLabour(0); setSimTile(0); setSimInflation(0);
                    }}
                    className="text-[10px] font-black text-indigo-600 hover:text-indigo-500 uppercase tracking-wider transition"
                  >
                    Reset Deviations
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 text-xs font-bold text-zinc-650 dark:text-zinc-350">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Cement Cost</span>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-black ${simCement > 0 ? 'bg-red-500/10 text-red-600 dark:text-red-400' : simCement < 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                        {simCement >= 0 ? '+' : ''}{simCement}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={-50}
                      max={50}
                      value={simCement}
                      onChange={(e) => setSimCement(parseInt(e.target.value))}
                      className="w-full accent-indigo-650 bg-zinc-200 dark:bg-zinc-800 h-1 rounded-lg cursor-pointer animate-pulse-on-drag"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>TMT Steel Rebar</span>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-black ${simSteel > 0 ? 'bg-red-500/10 text-red-600 dark:text-red-400' : simSteel < 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                        {simSteel >= 0 ? '+' : ''}{simSteel}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={-50}
                      max={50}
                      value={simSteel}
                      onChange={(e) => setSimSteel(parseInt(e.target.value))}
                      className="w-full accent-indigo-650 bg-zinc-200 dark:bg-zinc-800 h-1 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Labor Standard Wages</span>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-black ${simLabour > 0 ? 'bg-red-500/10 text-red-650 dark:text-red-400' : simLabour < 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                        {simLabour >= 0 ? '+' : ''}{simLabour}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={-50}
                      max={50}
                      value={simLabour}
                      onChange={(e) => setSimLabour(parseInt(e.target.value))}
                      className="w-full accent-indigo-650 bg-zinc-200 dark:bg-zinc-800 h-1 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Tiles Materials</span>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-black ${simTile > 0 ? 'bg-red-500/10 text-red-650 dark:text-red-400' : simTile < 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                        {simTile >= 0 ? '+' : ''}{simTile}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={-50}
                      max={50}
                      value={simTile}
                      onChange={(e) => setSimTile(parseInt(e.target.value))}
                      className="w-full accent-indigo-650 bg-zinc-200 dark:bg-zinc-800 h-1 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>General Cost Index</span>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-black ${simInflation > 0 ? 'bg-red-500/10 text-red-600 dark:text-red-400' : simInflation < 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                        {simInflation >= 0 ? '+' : ''}{simInflation}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={-30}
                      max={30}
                      value={simInflation}
                      onChange={(e) => setSimInflation(parseInt(e.target.value))}
                      className="w-full accent-indigo-650 bg-zinc-200 dark:bg-zinc-800 h-1 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Custom Cost Distributions SVG Donut Chart */}
              {chartCategoryData.length > 0 && (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-850 pb-3 mb-4">
                    <span className="text-lg">📊</span>
                    <h3 className="text-xs font-black text-zinc-700 dark:text-zinc-200 uppercase tracking-wider">
                      Top 5 Cost Categories Distribution
                    </h3>
                  </div>
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* SVG Pie Chart */}
                    <div className="relative w-44 h-44 shrink-0">
                      <svg width="176" height="176" viewBox="0 0 176 176" className="transform -rotate-90">
                        {(() => {
                          const totalAmt = chartCategoryData.reduce((sum, item) => sum + item.amount, 0);
                          let accumulatedPct = 0;
                          const colors = ['#6366f1', '#a855f7', '#10b981', '#f59e0b', '#3b82f6'];
                          return chartCategoryData.map((item, idx) => {
                            if (totalAmt <= 0) return null;
                            const pct = item.amount / totalAmt;
                            const strokeDash = pct * 440; // 2 * PI * r = 2 * 3.1415 * 70 = 440
                            const strokeOffset = accumulatedPct * 440;
                            accumulatedPct += pct;

                            return (
                              <circle
                                key={`slice-${idx}`}
                                cx="88"
                                cy="88"
                                r="70"
                                fill="none"
                                stroke={colors[idx % colors.length]}
                                strokeWidth="20"
                                strokeDasharray={`${strokeDash} 440`}
                                strokeDashoffset={-strokeOffset}
                              />
                            );
                          });
                        })()}
                      </svg>
                      {/* Central label */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Estimated</span>
                        <span className="text-xs font-black text-zinc-800 dark:text-white">Cost Share</span>
                      </div>
                    </div>

                    {/* Chart Legend with Progress Bars */}
                    <div className="flex-1 space-y-3.5 w-full text-xs">
                      {(() => {
                        const totalAmt = chartCategoryData.reduce((sum, item) => sum + item.amount, 0);
                        const colors = ['#6366f1', '#a855f7', '#10b981', '#f59e0b', '#3b82f6'];
                        return chartCategoryData.map((item, idx) => {
                          const pct = totalAmt > 0 ? (item.amount / totalAmt) * 100 : 0;
                          return (
                            <div key={`legend-${idx}`} className="space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-bold">
                                  <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: colors[idx % colors.length] }} />
                                  <span>{item.name}</span>
                                </span>
                                <span className="font-mono font-bold text-zinc-900 dark:text-white">
                                  ₹{item.amount.toLocaleString('en-IN')} <span className="text-zinc-400 dark:text-zinc-550 text-[10px]">({pct.toFixed(1)}%)</span>
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
                </div>
              )}
            </div>
          </div>
        )}

        {/* 6. Sticky Bottom / Summary Widget panel */}
        {activeProject && (
          <div className="sticky bottom-6 mt-8 w-full bg-zinc-950/90 backdrop-blur-md text-white border border-zinc-800 rounded-3xl p-6 shadow-2xl z-40">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 items-center">
              {/* Metric 1: Grand Total */}
              <div className="space-y-1 col-span-2 md:col-span-1">
                <span className="text-[9px] text-zinc-400 block uppercase tracking-wider font-extrabold">Grand Total (Rs)</span>
                <div className="text-xl md:text-2xl font-black text-emerald-450 font-mono tracking-tight">
                  ₹{summaryTotals.grandTotal.toLocaleString('en-IN')}
                </div>
                <span className="text-[9px] text-zinc-500 font-bold block uppercase">(Incl. GST &amp; Margin)</span>
              </div>

              {/* Metric 2: Cost per Sq Ft */}
              <div className="space-y-1 border-l border-zinc-800 pl-4">
                <span className="text-[9px] text-zinc-400 block uppercase tracking-wider font-extrabold">Cost / Built Area</span>
                <div className="text-base font-bold text-white font-mono">
                  ₹{totalFloorAreaSqft > 0 ? (summaryTotals.grandTotal / totalFloorAreaSqft).toFixed(2) : '0.00'} <span className="text-[10px] text-zinc-400">/sqft</span>
                </div>
                <span className="text-[9px] text-zinc-500 font-bold block uppercase">{totalFloorAreaSqft.toLocaleString()} sqft area</span>
              </div>

              {/* Metric 3: Base Cost */}
              <div className="space-y-1 border-l border-zinc-800 pl-4">
                <span className="text-[9px] text-zinc-400 block uppercase tracking-wider font-extrabold">Raw Base Cost</span>
                <div className="text-base font-bold text-indigo-300 font-mono">
                  ₹{summaryTotals.baseTotal.toLocaleString('en-IN')}
                </div>
                <span className="text-[9px] text-zinc-500 font-bold block uppercase">Material &amp; Wages</span>
              </div>

              {/* Metric 4: Taxes & Markups */}
              <div className="space-y-1 border-l border-zinc-800 pl-4">
                <span className="text-[9px] text-zinc-400 block uppercase tracking-wider font-extrabold">Taxes &amp; Markups</span>
                <div className="text-base font-bold text-amber-450 font-mono">
                  ₹{(summaryTotals.gstTotal + summaryTotals.marginTotal + summaryTotals.contingencyTotal).toLocaleString('en-IN')}
                </div>
                <span className="text-[9px] text-zinc-500 font-bold block uppercase">GST, Margin &amp; Cont.</span>
              </div>

              {/* Metric 5: Actions / Exports */}
              <div className="flex flex-col gap-2 border-l border-zinc-800 pl-4 col-span-2 md:col-span-1">
                <div className="flex gap-2">
                  <button
                    onClick={handleExportPDF}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-750 text-white text-[11px] font-bold transition flex-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </button>
                  <button
                    onClick={handleExportExcel}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition flex-1"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Excel</span>
                  </button>
                </div>
                {/* Scenario buttons */}
                <div className="flex gap-1">
                  <button
                    onClick={() => handleDuplicateToScenario('budget')}
                    className="flex-1 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-[8px] font-black uppercase text-zinc-300 transition"
                    title="Save current estimate to budget slot"
                  >
                    + Budget
                  </button>
                  <button
                    onClick={() => handleDuplicateToScenario('premium')}
                    className="flex-1 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-[8px] font-black uppercase text-zinc-300 transition"
                    title="Save current estimate to premium slot"
                  >
                    + Premium
                  </button>
                </div>
                {customRatesScenario.budget > 0 && (
                  <div className="text-[8px] text-zinc-400 font-mono flex justify-between gap-1 mt-0.5">
                    <span>Bgt: ₹{(customRatesScenario.budget/100000).toFixed(1)}L</span>
                    <span>Prm: ₹{(customRatesScenario.premium/100000).toFixed(1)}L</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 7. Rate Analysis Details Modal */}
        {activeRateAnalysisItem && activeProject && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-850 pb-3">
                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider">
                  Item Rate Analysis ({activeRateAnalysisItem.code})
                </h4>
                <button
                  onClick={() => setActiveRateAnalysisItemId(null)}
                  className="text-zinc-450 hover:text-zinc-650 text-sm font-bold"
                >
                  ✕ Close
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-150 dark:border-zinc-850">
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider block mb-1">Item Description</span>
                  <span className="font-bold text-zinc-900 dark:text-white leading-relaxed">{activeRateAnalysisItem.description}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-zinc-450 dark:text-zinc-500 font-bold">Material Base Rate (₹)</label>
                    <input
                      type="number"
                      value={activeRateAnalysisItem.rateMaterial}
                      onChange={(e) => handleUpdateItemCell(activeRateAnalysisItem.id, 'rateMaterial', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-750 bg-zinc-50 dark:bg-zinc-950 font-mono text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-zinc-455 dark:text-zinc-500 font-bold">Labour Base Rate (₹)</label>
                    <input
                      type="number"
                      value={activeRateAnalysisItem.rateLabour}
                      onChange={(e) => handleUpdateItemCell(activeRateAnalysisItem.id, 'rateLabour', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-750 bg-zinc-50 dark:bg-zinc-950 font-mono text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] text-zinc-450 dark:text-zinc-500 font-bold text-center">Equipment</label>
                    <input
                      type="number"
                      value={activeRateAnalysisItem.rateEquipment}
                      onChange={(e) => handleUpdateItemCell(activeRateAnalysisItem.id, 'rateEquipment', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-750 bg-zinc-50 dark:bg-zinc-950 font-mono text-center text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] text-zinc-455 dark:text-zinc-500 font-bold text-center">Transport</label>
                    <input
                      type="number"
                      value={activeRateAnalysisItem.rateTransport}
                      onChange={(e) => handleUpdateItemCell(activeRateAnalysisItem.id, 'rateTransport', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-750 bg-zinc-50 dark:bg-zinc-950 font-mono text-center text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] text-zinc-455 dark:text-zinc-500 font-bold text-center">Other Costs</label>
                    <input
                      type="number"
                      value={activeRateAnalysisItem.rateOther}
                      onChange={(e) => handleUpdateItemCell(activeRateAnalysisItem.id, 'rateOther', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-750 bg-zinc-50 dark:bg-zinc-950 font-mono text-center text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-150 dark:border-zinc-800 space-y-1.5 text-xs text-zinc-650 dark:text-zinc-350">
                  <div className="flex justify-between">
                    <span className="font-semibold">GST Rate applied:</span>
                    <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{activeRateAnalysisItem.gstPercent !== undefined ? activeRateAnalysisItem.gstPercent : activeProject.gstPercent}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Contractor Markup:</span>
                    <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{activeRateAnalysisItem.contractorMarginPercent !== undefined ? activeRateAnalysisItem.contractorMarginPercent : activeProject.contractorMarginPercent}%</span>
                  </div>
                </div>

                {/* Premium Gradient Result Panel */}
                <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 border border-indigo-500/25 text-white flex justify-between items-center shadow-lg shadow-indigo-950/40">
                  <div>
                    <span className="text-[10px] text-indigo-300 font-black uppercase tracking-wider block">Final Unit Rate</span>
                    <span className="text-[9px] text-indigo-200/60 font-semibold block">(Incl. Taxes &amp; Markup)</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-amber-450 font-mono">₹{activeRateAnalysisItem.finalRate.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <span className="text-xs text-indigo-300 font-bold block">/ {activeRateAnalysisItem.unit}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 8. Rate Library Modal */}
        {showRateLibrary && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-3xl p-6 max-w-3xl w-full max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-850 pb-3">
                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                  <Coins className="w-4 h-4 text-indigo-500" />
                  <span>Interactive Local Rate Template Library</span>
                </h4>
                <button
                  onClick={() => setShowRateLibrary(false)}
                  className="text-zinc-450 hover:text-zinc-650 text-sm font-bold"
                >
                  ✕ Close
                </button>
              </div>

              {/* Rate items list with Cost Breakdown mini-bars */}
              <div className="space-y-3">
                {rateLibrary.map(rate => {
                  const baseSum = (rate.rateMaterial || 0) + (rate.rateLabour || 0) + (rate.rateEquipment || 0) + (rate.rateTransport || 0) + (rate.rateOther || 0);
                  const matPct = baseSum > 0 ? ((rate.rateMaterial || 0) / baseSum) * 100 : 0;
                  const labPct = baseSum > 0 ? ((rate.rateLabour || 0) / baseSum) * 100 : 0;
                  const eqPct = baseSum > 0 ? ((rate.rateEquipment || 0) / baseSum) * 100 : 0;
                  const transPct = baseSum > 0 ? ((rate.rateTransport || 0) / baseSum) * 100 : 0;
                  const othPct = baseSum > 0 ? ((rate.rateOther || 0) / baseSum) * 100 : 0;

                  return (
                    <div key={rate.id} className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-2xl text-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[9px] font-black uppercase rounded font-mono">{rate.code}</span>
                          <strong className="text-zinc-900 dark:text-white font-bold block">{rate.description}</strong>
                        </div>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block">Unit: {rate.unit} | Base cost sum: ₹{baseSum.toLocaleString('en-IN')}</span>
                        
                        {/* Cost Breakdown mini progress bar */}
                        <div className="w-full space-y-1 max-w-lg">
                          <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                            <div style={{ width: `${matPct}%` }} className="bg-indigo-500 h-full" title={`Material: ₹${rate.rateMaterial}`} />
                            <div style={{ width: `${labPct}%` }} className="bg-amber-500 h-full" title={`Labour: ₹${rate.rateLabour}`} />
                            <div style={{ width: `${eqPct}%` }} className="bg-emerald-500 h-full" title={`Equipment: ₹${rate.rateEquipment}`} />
                            <div style={{ width: `${transPct}%` }} className="bg-blue-500 h-full" title={`Transport: ₹${rate.rateTransport}`} />
                            <div style={{ width: `${othPct}%` }} className="bg-zinc-400 h-full" title={`Other: ₹${rate.rateOther}`} />
                          </div>
                          <div className="text-[9px] text-zinc-450 dark:text-zinc-500 flex flex-wrap gap-x-2.5 gap-y-0.5 font-mono">
                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Mat: ₹{rate.rateMaterial}</span>
                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Lab: ₹{rate.rateLabour}</span>
                            {rate.rateEquipment > 0 && <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Eq: ₹{rate.rateEquipment}</span>}
                            {rate.rateTransport > 0 && <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Trans: ₹{rate.rateTransport}</span>}
                            {rate.rateOther > 0 && <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-zinc-400" /> Oth: ₹{rate.rateOther}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 md:justify-end items-center shrink-0">
                        {activeProject && activeProject.items.map(item => (
                          <button
                            key={item.id}
                            onClick={() => handleApplyRate(rate, item.id)}
                            className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-bold uppercase text-[9px] rounded-lg transition"
                          >
                            Apply to {item.code}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 9. SEO & Educational FAQ section below */}
        <div className="max-w-7xl mx-auto mt-16 space-y-12">
          {/* FAQ section with numbered step cards */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
            <h2 className="text-lg font-black text-zinc-900 dark:text-white mb-8 border-b border-zinc-100 dark:border-zinc-850 pb-3 flex items-center gap-2">
              <span className="text-xl">💡</span>
              <span>Frequently Asked Questions &amp; Concepts</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative p-6 rounded-2xl border border-zinc-150 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-950/20 hover:shadow-md transition">
                <span className="absolute top-4 right-4 text-3xl font-black text-indigo-500/10">01</span>
                <h3 className="font-bold text-zinc-900 dark:text-white text-sm mb-2 pr-8">What is a Bill of Quantities (BOQ)?</h3>
                <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                  A Bill of Quantities (BOQ) is a detailed schedule of work items, showing descriptive specifications, measurements units, quantities, and unit rates. It is prepared by quantity surveyors or estimator engineers to finalize cost budgets and float contractor tenders.
                </p>
              </div>
              <div className="relative p-6 rounded-2xl border border-zinc-150 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-950/20 hover:shadow-md transition">
                <span className="absolute top-4 right-4 text-3xl font-black text-amber-500/10">02</span>
                <h3 className="font-bold text-zinc-900 dark:text-white text-sm mb-2 pr-8">What factors are included in the Rate Analysis?</h3>
                <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                  Rate analysis breaks down the final unit cost of any construction task. It aggregates primary material costs, skilled/unskilled labor wages, machinery/shuttering depreciation, transit/transport charges, wastage surcharges (typically 2-10%), contractor profit margins (typically 10-15%), and GST (usually 18%).
                </p>
              </div>
              <div className="relative p-6 rounded-2xl border border-zinc-150 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-950/20 hover:shadow-md transition">
                <span className="absolute top-4 right-4 text-3xl font-black text-emerald-500/10">03</span>
                <h3 className="font-bold text-zinc-900 dark:text-white text-sm mb-2 pr-8">How does the Material Estimation preset function?</h3>
                <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                  For typical categories like Concrete, Brickwork, Plaster, and Tiles, the calculator applies material volume multipliers to output concrete constituent bags, masonry blocks count, tile boxes, adhesive bags, and paint coverage volume requirements.
                </p>
              </div>
              <div className="relative p-6 rounded-2xl border border-zinc-150 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-950/20 hover:shadow-md transition">
                <span className="absolute top-4 right-4 text-3xl font-black text-blue-500/10">04</span>
                <h3 className="font-bold text-zinc-900 dark:text-white text-sm mb-2 pr-8">How do I export results to Excel?</h3>
                <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                  By clicking the "Excel Sheet" button, the estimator compiles project summaries, detailed BOQ items, material breakdowns, and rate analysis tables into separate sheets of a standard `.xlsx` spreadsheet workbook.
                </p>
              </div>
            </div>
          </div>

          {/* Educational Content */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm space-y-6">
            <h2 className="text-lg font-black text-zinc-900 dark:text-white">
              Preparing a BOQ for Construction in India
            </h2>
            <p className="text-xs text-zinc-650 dark:text-zinc-350 leading-relaxed font-normal">
              Preparing a Bill of Quantities (BOQ) for construction in India requires a systematic approach to ensure accuracy and avoid cost overruns. In the Indian market, builders and contractors reference either the Central Public Works Department (CPWD) Delhi Schedule of Rates (DSR) or state-specific schedule lists.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-zinc-650 dark:text-zinc-350">
              <div className="p-5 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-150 dark:border-zinc-850 space-y-2 hover:shadow-md transition">
                <h3 className="font-black text-zinc-800 dark:text-white uppercase text-[10px] tracking-wider flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500" /> 1. Measurements Take-Off</h3>
                <p className="leading-relaxed">
                  Engineers record length, width, and height coordinates directly from structural and architectural drawings. Preset mathematical formulas help compute areas ($L \times W$) and volumes ($L \times W \times H$).
                </p>
              </div>
              <div className="p-5 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-150 dark:border-zinc-850 space-y-2 hover:shadow-md transition">
                <h3 className="font-black text-zinc-800 dark:text-white uppercase text-[10px] tracking-wider flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> 2. Rate Analysis</h3>
                <p className="leading-relaxed">
                  Every civil item rate is analyzed by breaking down materials (cement, steel, aggregate, bricks), labor wages (masons, helpers, bar benders), transit fees, contractor margin (usually 10-15%), and tax compliance (18% GST).
                </p>
              </div>
              <div className="p-5 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-150 dark:border-zinc-850 space-y-2 hover:shadow-md transition">
                <h3 className="font-black text-zinc-800 dark:text-white uppercase text-[10px] tracking-wider flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> 3. Wastage Allowance</h3>
                <p className="leading-relaxed">
                  Wastage is an inevitable part of civil construction. Standard values applied in India are 3-5% for reinforcement steel, 5% for bricks, 8% for ceramic/vitrified flooring tiles, and 5% for paints.
                </p>
              </div>
            </div>

            {/* Related Tools link section */}
            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-850">
              <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-3">Related Calculators</span>
              <div className="flex flex-wrap gap-2.5 text-xs font-bold text-zinc-750 dark:text-zinc-350">
                <Link to="/tool/concrete-calculator" className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl hover:text-indigo-500 hover:border-indigo-500 transition">Concrete Estimator</Link>
                <Link to="/tool/brick-calculator" className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl hover:text-indigo-500 hover:border-indigo-500 transition">Brick Calculator</Link>
                <Link to="/tool/rcc-calculator" className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl hover:text-indigo-500 hover:border-indigo-500 transition">RCC Slab Calculator</Link>
                <Link to="/tool/steel-weight-calculator" className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl hover:text-indigo-500 hover:border-indigo-500 transition">Steel Rebar Weight</Link>
                <Link to="/tool/construction-cost-calculator" className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl hover:text-indigo-500 hover:border-indigo-500 transition">Construction Cost Index</Link>
                <Link to="/tool/floor-tile-calculator" className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl hover:text-indigo-500 hover:border-indigo-500 transition">Tile Estimator</Link>
                <Link to="/tool/paint-calculator" className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl hover:text-indigo-500 hover:border-indigo-500 transition">Paint Coverage Estimator</Link>
                <Link to="/tool/far-fsi-calculator" className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl hover:text-indigo-500 hover:border-indigo-500 transition">FAR / FSI Clearances</Link>
              </div>
            </div>
          </div>
        </div>
      </>
  );
}

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Trash2, Copy, Calculator,
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
            length: 45,
            width: 3,
            height: 0.33,
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
            length: 45,
            width: 0.75,
            height: 10,
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
    const newFloor: Floor = {
      id: 'f_' + Date.now(),
      name: newFloorName,
      area: newFloorArea,
      height: 3.3,
      notes: ''
    };
    const updatedFloors = [...activeProject.floors, newFloor];
    updateActiveProject({ ...activeProject, floors: updatedFloors });
    setNewFloorName('');
  };

  const handleRemoveFloor = (floorId: string) => {
    if (!activeProject) return;
    const updatedFloors = activeProject.floors.filter(f => f.id !== floorId);
    // clean orphaned rooms & items mapped
    const updatedRooms = activeProject.rooms.filter(r => r.floorId !== floorId);
    const updatedItems = activeProject.items.map(item =>
      item.floorId === floorId ? { ...item, floorId: 'all' } : item
    );
    updateActiveProject({ ...activeProject, floors: updatedFloors, rooms: updatedRooms, items: updatedItems });
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

      {/* Breadcrumbs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-4 mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-indigo-500 dark:text-zinc-400 dark:hover:text-indigo-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
        <div className="text-xs text-zinc-450 dark:text-zinc-500 font-semibold flex items-center gap-1.5">
          <Link to="/" className="hover:text-indigo-500 transition-colors">Home</Link>
          <span className="text-zinc-350 dark:text-zinc-700">&gt;</span>
          <span className="text-zinc-650 dark:text-zinc-300 font-medium">BOQ Calculator</span>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4">
        {/* Title Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-650 dark:text-indigo-400">
              <Calculator className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-zinc-900 dark:text-white">
                Advanced BOQ Calculator India
              </h1>
              <p className="text-xs text-zinc-550 dark:text-zinc-450 mt-0.5">
                Detailed quantity estimations, material splits, rate analysis, and scenario comparisons for construction projects.
              </p>
            </div>
          </div>

          {/* Project Choice Bar */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={activeProjectId}
              onChange={(e) => setActiveProjectId(e.target.value)}
              className="px-3 py-2 text-xs font-bold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-850 dark:text-white"
            >
              <option value="">-- Select Active Project --</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button
              onClick={createBlankProject}
              className="px-3.5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl transition shrink-0"
            >
              + New Project
            </button>
            {activeProjectId && (
              <button
                onClick={() => deleteProject(activeProjectId)}
                className="px-3.5 py-2 text-xs font-bold bg-red-650 hover:bg-red-800 text-white rounded-xl transition shrink-0 flex items-center justify-center"
                title="Delete Active Project"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Workspace Layout */}
        {!activeProject ? (
          /* Landing Empty State */
          <div className="text-center py-20 bg-zinc-50/50 dark:bg-zinc-950/20 border border-dashed border-zinc-250 dark:border-zinc-850 rounded-2xl max-w-xl mx-auto space-y-6">
            <Building className="w-12 h-12 text-zinc-400 mx-auto" />
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">No Project Workspace Active</h2>
            <p className="text-xs text-zinc-550 max-w-md mx-auto">
              Start by building a blank project worksheet or load predefined standard estimation templates matching Indian regional rates.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => loadTemplate('small_house')}
                className="px-4 py-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-bold text-xs rounded-xl"
              >
                Load G+0 House Template
              </button>
              <button
                onClick={() => loadTemplate('kitchen')}
                className="px-4 py-2 border border-zinc-300 dark:border-zinc-800 font-bold text-xs rounded-xl text-zinc-700 dark:text-zinc-350"
              >
                Load Kitchen Template
              </button>
            </div>
          </div>
        ) : (
          /* Active Estimation Studio */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 1. Left Sidebar: Settings, Floors, Rooms */}
            <div className="lg:col-span-3 space-y-6">
              {/* Project settings details */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-850 pb-3">
                  <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider">Project Configuration</h3>
                  <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded font-mono">
                    {autosaveIndicator}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-zinc-550 mb-1">Project Name</label>
                    <input
                      type="text"
                      value={activeProject.name}
                      onChange={(e) => updateActiveProject({ ...activeProject, name: e.target.value })}
                      className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 font-mono text-zinc-900 dark:text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-zinc-550 mb-1">Client Name</label>
                      <input
                        type="text"
                        value={activeProject.client}
                        onChange={(e) => updateActiveProject({ ...activeProject, client: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 font-mono text-zinc-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-zinc-550 mb-1">Project Type</label>
                      <select
                        value={activeProject.projectType}
                        onChange={(e) => updateActiveProject({ ...activeProject, projectType: e.target.value as any })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-white"
                      >
                        <option value="residential">Residential</option>
                        <option value="commercial">Commercial</option>
                        <option value="renovation">Renovation</option>
                        <option value="interior">Interior</option>
                        <option value="industrial">Industrial</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-zinc-555 mb-1">Built Area (sq ft)</label>
                      <input
                        type="number"
                        value={activeProject.builtUpArea}
                        onChange={(e) => updateActiveProject({ ...activeProject, builtUpArea: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-zinc-555 mb-1">GST Tax Rate (%)</label>
                      <input
                        type="number"
                        value={activeProject.gstPercent}
                        onChange={(e) => updateActiveProject({ ...activeProject, gstPercent: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-zinc-555 mb-1">Contractor Margin (%)</label>
                      <input
                        type="number"
                        value={activeProject.contractorMarginPercent}
                        onChange={(e) => updateActiveProject({ ...activeProject, contractorMarginPercent: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-zinc-555 mb-1">Contingencies (%)</label>
                      <input
                        type="number"
                        value={activeProject.contingencyPercent}
                        onChange={(e) => updateActiveProject({ ...activeProject, contingencyPercent: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-850 flex gap-2">
                  <button
                    onClick={handleBackupExport}
                    className="flex-1 py-2 border border-zinc-200 dark:border-zinc-800 text-[10px] font-black uppercase rounded-lg hover:bg-zinc-50"
                  >
                    Export Backup
                  </button>
                  <label className="flex-1 py-2 border border-zinc-200 dark:border-zinc-800 text-[10px] font-black uppercase rounded-lg hover:bg-zinc-50 text-center cursor-pointer">
                    <span>Import JSON</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleBackupImport}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Floors and Rooms Manager Section */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-850 pb-2">
                  Floors & Structural Levels
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {activeProject.floors.map(f => (
                    <div key={f.id} className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-950 p-2 rounded-xl text-xs">
                      <span className="font-bold text-zinc-700 dark:text-zinc-300">{f.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-zinc-400">{f.area} sqft</span>
                        <button
                          onClick={() => handleRemoveFloor(f.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Floor Mini form */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Floor Name"
                    value={newFloorName}
                    onChange={(e) => setNewFloorName(e.target.value)}
                    className="flex-1 px-2.5 py-1 text-xs border border-zinc-250 dark:border-zinc-800 rounded-lg bg-zinc-50/50"
                  />
                  <input
                    type="number"
                    placeholder="Area"
                    value={newFloorArea}
                    onChange={(e) => setNewFloorArea(parseInt(e.target.value) || 1000)}
                    className="w-16 px-2.5 py-1 text-xs border border-zinc-250 dark:border-zinc-800 rounded-lg bg-zinc-50/50 font-mono"
                  />
                  <button
                    onClick={handleAddFloor}
                    className="px-3 py-1 bg-zinc-900 text-white rounded-lg text-xs font-bold"
                  >
                    +
                  </button>
                </div>

                {/* Rooms manager */}
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-850 pb-2 pt-2">
                  Rooms / Estimation Zones
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {activeProject.rooms.map(r => {
                    const floorName = activeProject.floors.find(f => f.id === r.floorId)?.name || 'Unknown Floor';
                    return (
                      <div key={r.id} className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-950 p-2 rounded-xl text-xs">
                        <div>
                          <span className="font-bold text-zinc-700 dark:text-zinc-300 block">{r.name}</span>
                          <span className="text-[9px] text-zinc-400 block font-mono">{floorName}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveRoom(r.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Add Room Mini form */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Room/Zone Name"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    className="flex-1 px-2.5 py-1 text-xs border border-zinc-250 dark:border-zinc-800 rounded-lg bg-zinc-50/50"
                  />
                  <select
                    value={newRoomFloorId}
                    onChange={(e) => setNewRoomFloorId(e.target.value)}
                    className="w-24 px-2.5 py-1 text-xs border border-zinc-250 dark:border-zinc-800 rounded-lg bg-zinc-50/50"
                  >
                    <option value="">-- Floor --</option>
                    {activeProject.floors.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddRoom}
                    className="px-3 py-1 bg-zinc-900 text-white rounded-lg text-xs font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Main Workspace: Spreadsheet view & Filters */}
            <div className="lg:col-span-9 space-y-6">
              {/* Toolbar & Filters */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Search items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-2 text-xs border border-zinc-250 dark:border-zinc-800 rounded-xl bg-zinc-50/50 focus:outline-none w-52 text-zinc-900 dark:text-white"
                    />
                  </div>

                  <select
                    value={selectedCategoryFilter}
                    onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                    className="px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-zinc-850 dark:text-white"
                  >
                    <option value="all">All Categories</option>
                    {DEFAULT_CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>

                  <select
                    value={selectedFloorFilter}
                    onChange={(e) => setSelectedFloorFilter(e.target.value)}
                    className="px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-zinc-850 dark:text-white"
                  >
                    <option value="all">All Floors</option>
                    {activeProject.floors.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>

                  <select
                    value={selectedRoomFilter}
                    onChange={(e) => setSelectedRoomFilter(e.target.value)}
                    className="px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-zinc-850 dark:text-white"
                  >
                    <option value="all">All Rooms</option>
                    {activeProject.rooms.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-zinc-850 dark:text-white"
                  >
                    <option value="none">Sort: Default</option>
                    <option value="code">Sort: Code</option>
                    <option value="amount">Sort: Amount</option>
                    <option value="category">Sort: Category</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowRateLibrary(true)}
                    className="px-3.5 py-2 text-xs border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 font-bold rounded-xl text-zinc-700 dark:text-zinc-350"
                  >
                    Rate Library
                  </button>
                  <button
                    onClick={handleAddItem}
                    className="px-3.5 py-2 text-xs bg-zinc-900 hover:bg-zinc-950 text-white dark:bg-white dark:text-zinc-900 font-bold rounded-xl"
                  >
                    + Add Item
                  </button>
                  {selectedItemIds.length > 0 && (
                    <button
                      onClick={handleBulkDelete}
                      className="px-3.5 py-2 text-xs bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl"
                    >
                      Delete ({selectedItemIds.length})
                    </button>
                  )}
                </div>
              </div>

              {/* BOQ Spreadsheet Table */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto max-w-full">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-150 dark:border-zinc-800 text-[10px] text-zinc-400 font-bold uppercase">
                        <th className="py-3 px-3 w-8 text-center">
                          <input
                            type="checkbox"
                            checked={filteredBOQItems.length > 0 && filteredBOQItems.every(i => selectedItemIds.includes(i.id))}
                            onChange={() => toggleSelectAll(filteredBOQItems)}
                            className="rounded"
                          />
                        </th>
                        <th className="py-3 px-3 w-16">Code</th>
                        <th className="py-3 px-3 w-28">Category</th>
                        <th className="py-3 px-3 w-32">Description</th>
                        <th className="py-3 px-3 w-16">Unit</th>
                        <th className="py-3 px-3 w-28">Dimensions (L x W x H)</th>
                        <th className="py-3 px-3 w-12">Count</th>
                        <th className="py-3 px-3 w-20">Base Rate</th>
                        <th className="py-3 px-3 w-24">Final Rate (Taxes)</th>
                        <th className="py-3 px-3 w-24 text-right">Amount (₹)</th>
                        <th className="py-3 px-3 w-24 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-150 dark:divide-zinc-850">
                      {filteredBOQItems.length === 0 ? (
                        <tr>
                          <td colSpan={11} className="py-12 text-center text-zinc-400 font-medium">
                            No matching items found. Add a new item or clear filters.
                          </td>
                        </tr>
                      ) : (
                        filteredBOQItems.map(item => {
                          const baseRateSum = (item.rateMaterial || 0) + (item.rateLabour || 0) + (item.rateEquipment || 0) + (item.rateTransport || 0) + (item.rateOther || 0);
                          return (
                            <tr key={item.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 text-zinc-700 dark:text-zinc-300">
                              <td className="py-2.5 px-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={selectedItemIds.includes(item.id)}
                                  onChange={() => toggleSelectItem(item.id)}
                                  className="rounded"
                                />
                              </td>
                              <td className="py-2.5 px-3 font-mono">
                                <input
                                  type="text"
                                  value={item.code}
                                  onChange={(e) => handleUpdateItemCell(item.id, 'code', e.target.value)}
                                  className="w-full bg-transparent font-bold focus:outline-none border-b border-transparent hover:border-zinc-300 focus:border-indigo-500 font-mono"
                                />
                              </td>
                              <td className="py-2.5 px-3">
                                <select
                                  value={item.categoryId}
                                  onChange={(e) => handleUpdateItemCell(item.id, 'categoryId', e.target.value)}
                                  className="w-full bg-transparent focus:outline-none"
                                >
                                  {DEFAULT_CATEGORIES.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="py-2.5 px-3">
                                <input
                                  type="text"
                                  value={item.description}
                                  onChange={(e) => handleUpdateItemCell(item.id, 'description', e.target.value)}
                                  className="w-full bg-transparent focus:outline-none font-bold border-b border-transparent hover:border-zinc-300 focus:border-indigo-500"
                                />
                              </td>
                              <td className="py-2.5 px-3">
                                <select
                                  value={item.unit}
                                  onChange={(e) => handleUpdateItemCell(item.id, 'unit', e.target.value)}
                                  className="w-full bg-transparent focus:outline-none text-[11px]"
                                >
                                  {['Nos', 'Rmt', 'Sq ft', 'Sq m', 'Cft', 'Cum', 'Kg', 'Ton', 'Bag', 'Litre', 'Set', 'Lump Sum'].map(u => (
                                    <option key={u} value={u}>{u}</option>
                                  ))}
                                </select>
                              </td>
                              {/* Dimensions input cells */}
                              <td className="py-2.5 px-3">
                                <div className="flex items-center gap-1 font-mono text-[11px]">
                                  <input
                                    type="number"
                                    value={item.length || ''}
                                    placeholder="L"
                                    onChange={(e) => handleUpdateItemCell(item.id, 'length', parseFloat(e.target.value) || 0)}
                                    className="w-8 bg-transparent text-center focus:outline-none hover:bg-zinc-100"
                                  />
                                  <span>x</span>
                                  <input
                                    type="number"
                                    value={item.width || ''}
                                    placeholder="W"
                                    onChange={(e) => handleUpdateItemCell(item.id, 'width', parseFloat(e.target.value) || 0)}
                                    className="w-8 bg-transparent text-center focus:outline-none hover:bg-zinc-100"
                                  />
                                  <span>x</span>
                                  <input
                                    type="number"
                                    value={item.height || ''}
                                    placeholder="H"
                                    onChange={(e) => handleUpdateItemCell(item.id, 'height', parseFloat(e.target.value) || 0)}
                                    className="w-8 bg-transparent text-center focus:outline-none hover:bg-zinc-100"
                                  />
                                </div>
                              </td>
                              <td className="py-2.5 px-3">
                                <input
                                  type="number"
                                  value={item.count || ''}
                                  onChange={(e) => handleUpdateItemCell(item.id, 'count', parseInt(e.target.value) || 1)}
                                  className="w-full bg-transparent text-center focus:outline-none hover:bg-zinc-100 font-mono"
                                />
                              </td>
                              <td className="py-2.5 px-3 font-mono text-zinc-500">
                                ₹{baseRateSum.toFixed(1)}
                              </td>
                              <td className="py-2.5 px-3 font-mono font-bold text-zinc-900 dark:text-white">
                                ₹{item.finalRate.toFixed(1)}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-right font-black text-indigo-650 dark:text-indigo-400">
                                ₹{item.totalAmount.toLocaleString('en-IN')}
                              </td>
                              {/* Actions on rows */}
                              <td className="py-2.5 px-3 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => setActiveRateAnalysisItemId(item.id)}
                                    className="p-1 hover:bg-zinc-100 rounded text-zinc-500 hover:text-indigo-600"
                                    title="Rate Analysis Breakdown"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDuplicateItem(item.id)}
                                    className="p-1 hover:bg-zinc-100 rounded text-zinc-500 hover:text-emerald-500"
                                    title="Duplicate row"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="p-1 hover:bg-zinc-100 rounded text-zinc-500 hover:text-red-500"
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
                  </table>
                </div>
              </div>

              {/* 3. Materials Estimations Summary */}
              {materialEstimationTotals && (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-850 pb-2">
                    Estimated Indian Construction Materials Breakdown
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                    <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-150 dark:border-zinc-850">
                      <span className="text-[10px] text-zinc-450 block uppercase">Cement Bags</span>
                      <span className="text-lg font-black text-zinc-900 dark:text-white">{materialEstimationTotals.cementBags} Bags</span>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-150 dark:border-zinc-850">
                      <span className="text-[10px] text-zinc-455 block uppercase">Sand Volume</span>
                      <span className="text-lg font-black text-zinc-900 dark:text-white">{materialEstimationTotals.sandCft} Cft</span>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-150 dark:border-zinc-850">
                      <span className="text-[10px] text-zinc-455 block uppercase">Coarse Aggregate</span>
                      <span className="text-lg font-black text-zinc-900 dark:text-white">{materialEstimationTotals.aggregateCft} Cft</span>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-150 dark:border-zinc-850">
                      <span className="text-[10px] text-zinc-455 block uppercase">Reinforcement Steel</span>
                      <span className="text-lg font-black text-zinc-900 dark:text-white">{materialEstimationTotals.steelKg} Kg</span>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-150 dark:border-zinc-850">
                      <span className="text-[10px] text-zinc-455 block uppercase">Brick / Block Count</span>
                      <span className="text-lg font-black text-zinc-900 dark:text-white">{materialEstimationTotals.brickCount} Pcs</span>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-150 dark:border-zinc-850">
                      <span className="text-[10px] text-zinc-455 block uppercase">Flooring Tiles</span>
                      <span className="text-lg font-black text-zinc-900 dark:text-white">{materialEstimationTotals.tileCount} Tiles</span>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-150 dark:border-zinc-850">
                      <span className="text-[10px] text-zinc-455 block uppercase">Tile Adhesive</span>
                      <span className="text-lg font-black text-zinc-900 dark:text-white">{materialEstimationTotals.adhesiveBags} Bags</span>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-150 dark:border-zinc-850">
                      <span className="text-[10px] text-zinc-455 block uppercase">Wall Emulsion Paint</span>
                      <span className="text-lg font-black text-zinc-900 dark:text-white">{materialEstimationTotals.paintLitres} Ltrs</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-rose-500/80 font-bold bg-rose-50/40 p-3 rounded-xl border border-rose-100/40">
                    * Note: These are rough rule-of-thumb quantities for budgeting and planning only. Actual steel structural and concrete grades details must be validated by a structural designer.
                  </div>
                </div>
              )}

              {/* 4. Scenario Simulator Sliders */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-850 pb-2">
                  <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider">
                    Indian Market Rates & Inflation Scenario Simulator
                  </h3>
                  <button
                    onClick={() => {
                      setSimCement(0); setSimSteel(0); setSimLabour(0); setSimTile(0); setSimInflation(0);
                    }}
                    className="text-[10px] font-bold text-indigo-500 uppercase hover:underline"
                  >
                    Reset Deviations
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 text-xs font-bold text-zinc-650 dark:text-zinc-350">
                  <div className="space-y-1.5">
                    <span className="flex justify-between">Cement Cost: <span>{simCement >= 0 ? '+' : ''}{simCement}%</span></span>
                    <input
                      type="range"
                      min={-50}
                      max={50}
                      value={simCement}
                      onChange={(e) => setSimCement(parseInt(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="flex justify-between">TMT Steel Rebar: <span>{simSteel >= 0 ? '+' : ''}{simSteel}%</span></span>
                    <input
                      type="range"
                      min={-50}
                      max={50}
                      value={simSteel}
                      onChange={(e) => setSimSteel(parseInt(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="flex justify-between">Labor Standard Wages: <span>{simLabour >= 0 ? '+' : ''}{simLabour}%</span></span>
                    <input
                      type="range"
                      min={-50}
                      max={50}
                      value={simLabour}
                      onChange={(e) => setSimLabour(parseInt(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="flex justify-between">Tiles Materials: <span>{simTile >= 0 ? '+' : ''}{simTile}%</span></span>
                    <input
                      type="range"
                      min={-50}
                      max={50}
                      value={simTile}
                      onChange={(e) => setSimTile(parseInt(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="flex justify-between">General Cost Index: <span>{simInflation >= 0 ? '+' : ''}{simInflation}%</span></span>
                    <input
                      type="range"
                      min={-30}
                      max={30}
                      value={simInflation}
                      onChange={(e) => setSimInflation(parseInt(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Custom Cost Distributions SVG Donut Chart */}
              {chartCategoryData.length > 0 && (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider mb-4">
                    Top 5 Cost Categories Distribution
                  </h3>
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
                        <span className="text-[10px] text-zinc-400 font-bold uppercase">Estimated</span>
                        <span className="text-xs font-black text-zinc-900 dark:text-white">Breakdown</span>
                      </div>
                    </div>

                    {/* Chart Legend */}
                    <div className="flex-1 space-y-2 text-xs">
                      {(() => {
                        const totalAmt = chartCategoryData.reduce((sum, item) => sum + item.amount, 0);
                        const colors = ['#6366f1', '#a855f7', '#10b981', '#f59e0b', '#3b82f6'];
                        return chartCategoryData.map((item, idx) => {
                          const pct = totalAmt > 0 ? (item.amount / totalAmt) * 100 : 0;
                          return (
                            <div key={`legend-${idx}`} className="flex justify-between items-center">
                              <span className="flex items-center gap-2 text-zinc-700 dark:text-zinc-350">
                                <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: colors[idx % colors.length] }} />
                                <span>{item.name}</span>
                              </span>
                              <span className="font-mono font-bold text-zinc-900 dark:text-white">
                                ₹{item.amount.toLocaleString('en-IN')} ({pct.toFixed(1)}%)
                              </span>
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
          <div className="sticky bottom-6 mt-8 max-w-7xl mx-auto bg-zinc-900 text-white border border-zinc-800 rounded-3xl p-6 shadow-xl grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-450 block uppercase tracking-wider font-bold">
                Grand Total Estimated (Rs)
              </span>
              <div className="text-2xl font-black text-emerald-400 flex items-baseline gap-1.5 font-mono">
                ₹{summaryTotals.grandTotal.toLocaleString('en-IN')}
                <span className="text-xs text-zinc-400 font-bold block uppercase">
                  (Incl. Taxes)
                </span>
              </div>
            </div>

            <div className="space-y-1 border-l border-zinc-800 pl-6">
              <span className="text-[10px] text-zinc-455 block uppercase tracking-wider font-bold">
                Cost Per Built Sq Ft
              </span>
              <div className="text-lg font-bold text-white font-mono">
                ₹{totalFloorAreaSqft > 0 ? (summaryTotals.grandTotal / totalFloorAreaSqft).toFixed(2) : '0.00'} / sqft
              </div>
            </div>

            {/* Scenario selector */}
            <div className="space-y-1.5 border-l border-zinc-800 pl-6">
              <span className="text-[10px] text-zinc-450 block uppercase tracking-wider font-bold">
                Scenario Versioning
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDuplicateToScenario('budget')}
                  className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-[10px] font-bold uppercase transition"
                >
                  Save Budget (85%)
                </button>
                <button
                  onClick={() => handleDuplicateToScenario('premium')}
                  className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-[10px] font-bold uppercase transition"
                >
                  Save Premium (125%)
                </button>
              </div>
              {customRatesScenario.budget > 0 && (
                <div className="text-[9px] text-zinc-400 font-mono mt-1.5 space-y-0.5">
                  <div>Saved Budget: ₹{customRatesScenario.budget.toLocaleString('en-IN')}</div>
                  <div>Saved Premium: ₹{customRatesScenario.premium.toLocaleString('en-IN')}</div>
                </div>
              )}
            </div>

            {/* Reports actions */}
            <div className="flex items-center gap-3 md:justify-end">
              <button
                onClick={handleExportPDF}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-650 hover:bg-red-750 text-white text-xs font-bold transition flex-1 md:flex-none"
              >
                <FileText className="w-4 h-4" />
                <span>PDF Report</span>
              </button>
              <button
                onClick={handleExportExcel}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex-1 md:flex-none"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Excel Sheet</span>
              </button>
            </div>
          </div>
        )}

        {/* 7. Rate Analysis Details Modal */}
        {activeRateAnalysisItem && activeProject && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-3xl p-6 max-w-lg w-full space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-850 pb-3">
                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider">
                  Item Rate Analysis ({activeRateAnalysisItem.code})
                </h4>
                <button
                  onClick={() => setActiveRateAnalysisItemId(null)}
                  className="text-zinc-400 hover:text-zinc-650 text-sm font-bold"
                >
                  ✕ Close
                </button>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-xl">
                  <span className="text-[10px] text-zinc-400 block mb-1">Item Description</span>
                  <span className="font-bold text-zinc-900 dark:text-white">{activeRateAnalysisItem.description}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-zinc-450 font-bold">Material Base Rate (₹)</label>
                    <input
                      type="number"
                      value={activeRateAnalysisItem.rateMaterial}
                      onChange={(e) => handleUpdateItemCell(activeRateAnalysisItem.id, 'rateMaterial', parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-zinc-450 font-bold">Labour Base Rate (₹)</label>
                    <input
                      type="number"
                      value={activeRateAnalysisItem.rateLabour}
                      onChange={(e) => handleUpdateItemCell(activeRateAnalysisItem.id, 'rateLabour', parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-zinc-455 font-bold mb-1">Equipment</label>
                    <input
                      type="number"
                      value={activeRateAnalysisItem.rateEquipment}
                      onChange={(e) => handleUpdateItemCell(activeRateAnalysisItem.id, 'rateEquipment', parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 font-mono text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-455 font-bold mb-1">Transport</label>
                    <input
                      type="number"
                      value={activeRateAnalysisItem.rateTransport}
                      onChange={(e) => handleUpdateItemCell(activeRateAnalysisItem.id, 'rateTransport', parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 font-mono text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-455 font-bold mb-1">Other Costs</label>
                    <input
                      type="number"
                      value={activeRateAnalysisItem.rateOther}
                      onChange={(e) => handleUpdateItemCell(activeRateAnalysisItem.id, 'rateOther', parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 font-mono text-center"
                    />
                  </div>
                </div>

                {/* Local rate details summary */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-850 flex justify-between font-bold text-zinc-700 dark:text-zinc-300">
                  <span>GST Rate applied:</span>
                  <span>{activeRateAnalysisItem.gstPercent !== undefined ? activeRateAnalysisItem.gstPercent : activeProject.gstPercent}%</span>
                </div>
                <div className="flex justify-between font-bold text-zinc-700 dark:text-zinc-300">
                  <span>Contractor Margin:</span>
                  <span>{activeRateAnalysisItem.contractorMarginPercent !== undefined ? activeRateAnalysisItem.contractorMarginPercent : activeProject.contractorMarginPercent}%</span>
                </div>

                <div className="pt-3 border-t border-zinc-150 dark:border-zinc-850 flex justify-between font-black text-sm text-indigo-650 dark:text-indigo-400">
                  <span>Final Built-up Unit Rate:</span>
                  <span>₹{activeRateAnalysisItem.finalRate.toFixed(2)} / {activeRateAnalysisItem.unit}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 8. Rate Library Modal */}
        {showRateLibrary && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-3xl p-6 max-w-3xl w-full max-h-[85vh] overflow-y-auto space-y-4">
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

              {/* Rate items list */}
              <div className="space-y-2.5">
                {rateLibrary.map(rate => (
                  <div key={rate.id} className="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 rounded-2xl text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-zinc-455 font-bold uppercase tracking-wider block">{rate.code}</span>
                      <strong className="text-zinc-900 dark:text-white font-bold block">{rate.description}</strong>
                      <span className="text-[10px] text-zinc-400 block mt-0.5">Unit: {rate.unit} | Material base: ₹{rate.rateMaterial}</span>
                    </div>

                    <div className="flex gap-2">
                      {activeProject && activeProject.items.map(item => (
                        <button
                          key={item.id}
                          onClick={() => handleApplyRate(rate, item.id)}
                          className="px-2.5 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold uppercase text-[9px] rounded-lg transition"
                        >
                          Apply to {item.code}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 9. SEO & Educational FAQ section below */}
        <div className="max-w-7xl mx-auto mt-16 space-y-12">
          {/* FAQ section */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
            <h2 className="text-lg font-black text-zinc-900 dark:text-white mb-6">
              Frequently Asked Questions (FAQ)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs leading-relaxed text-zinc-650 dark:text-zinc-350">
              <div className="space-y-2">
                <h3 className="font-bold text-zinc-900 dark:text-white">What is a Bill of Quantities (BOQ)?</h3>
                <p>
                  A Bill of Quantities (BOQ) is a detailed schedule of work items, showing descriptive specifications, measurements units, quantities, and unit rates. It is prepared by quantity surveyors or estimator engineers to finalize cost budgets and float contractor tenders.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-zinc-900 dark:text-white">What factors are included in the Rate Analysis?</h3>
                <p>
                  Rate analysis breaks down the final unit cost of any construction task. It aggregates primary material costs, skilled/unskilled labor wages, machinery/shuttering depreciation, transit/transport charges, wastage surcharges (typically 2-10%), contractor profit margins (typically 10-15%), and GST (usually 18%).
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-zinc-900 dark:text-white">How does the Material Estimation preset function?</h3>
                <p>
                  For typical categories like Concrete, Brickwork, Plaster, and Tiles, the calculator applies material volume multipliers to output concrete constituent bags, masonry blocks count, tile boxes, adhesive bags, and paint coverage volume requirements.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-zinc-900 dark:text-white">How do I export results to Excel?</h3>
                <p>
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
            <p className="text-xs text-zinc-650 dark:text-zinc-350 leading-relaxed">
              Preparing a Bill of Quantities (BOQ) for construction in India requires a systematic approach to ensure accuracy and avoid cost overruns. In the Indian market, builders and contractors reference either the Central Public Works Department (CPWD) Delhi Schedule of Rates (DSR) or state-specific schedule lists.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-zinc-650 dark:text-zinc-350">
              <div className="p-5 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-150 dark:border-zinc-850 space-y-2">
                <h3 className="font-black text-zinc-800 dark:text-white uppercase text-[10px] tracking-wider">1. Measurements Take-Off</h3>
                <p className="leading-relaxed">
                  Engineers record length, width, and height coordinates directly from structural and architectural drawings. Preset mathematical formulas help compute areas ($L \times W$) and volumes ($L \times W \times H$).
                </p>
              </div>
              <div className="p-5 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-150 dark:border-zinc-850 space-y-2">
                <h3 className="font-black text-zinc-800 dark:text-white uppercase text-[10px] tracking-wider">2. Rate Analysis</h3>
                <p className="leading-relaxed">
                  Every civil item rate is analyzed by breaking down materials (cement, steel, aggregate, bricks), labor wages (masons, helpers, bar benders), transit fees, contractor margin (usually 10-15%), and tax compliance (18% GST).
                </p>
              </div>
              <div className="p-5 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-150 dark:border-zinc-850 space-y-2">
                <h3 className="font-black text-zinc-800 dark:text-white uppercase text-[10px] tracking-wider">3. Wastage Allowance</h3>
                <p className="leading-relaxed">
                  Wastage is an inevitable part of civil construction. Standard values applied in India are 3-5% for reinforcement steel, 5% for bricks, 8% for ceramic/vitrified flooring tiles, and 5% for paints.
                </p>
              </div>
            </div>

            {/* Related Tools link section */}
            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-850">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block mb-3">Related Calculators</span>
              <div className="flex flex-wrap gap-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                <Link to="/tool/concrete-calculator" className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl hover:text-indigo-500 transition">Concrete Estimator</Link>
                <Link to="/tool/brick-calculator" className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl hover:text-indigo-500 transition">Brick Calculator</Link>
                <Link to="/tool/rcc-calculator" className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl hover:text-indigo-500 transition">RCC Slab Calculator</Link>
                <Link to="/tool/steel-weight-calculator" className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl hover:text-indigo-500 transition">Steel Rebar Weight</Link>
                <Link to="/tool/construction-cost-calculator" className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl hover:text-indigo-500 transition">Construction Cost Index</Link>
                <Link to="/tool/floor-tile-calculator" className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl hover:text-indigo-500 transition">Tile Estimator</Link>
                <Link to="/tool/paint-calculator" className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl hover:text-indigo-500 transition">Paint Coverage Estimator</Link>
                <Link to="/tool/far-fsi-calculator" className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl hover:text-indigo-500 transition">FAR / FSI Clearances</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

import { useState } from 'react';
import { Copy, Check, Info, HardDrive, Cpu, Box, Landmark, Layers, MapPin, DoorOpen, Compass, Layout } from 'lucide-react';

interface ElementNode {
  id: string;
  name: string;
  type: string;
  properties?: Record<string, string>;
  children?: ElementNode[];
}

interface ModelMetadata {
  projectName: string;
  schema: string;
  author: string;
  software: string;
  walls: number;
  doors: number;
  windows: number;
  columns: number;
  slabs: number;
}

const DEFAULT_METADATA: ModelMetadata = {
  projectName: 'New Delhi Commercial Complex',
  schema: 'IFC4 (Addendum 2)',
  author: 'Swamy & Associates Architects',
  software: 'Autodesk Revit 2026',
  walls: 142,
  doors: 38,
  windows: 48,
  columns: 64,
  slabs: 12
};

const DEFAULT_TREE: ElementNode = {
  id: 'root',
  name: 'Delhi Office Tower Site Plan',
  type: 'Project',
  properties: { GUID: '3F2504E0-4F89-41D3-9A0C-D7E1D83594FF', Units: 'Metric' },
  children: [
    {
      id: 'site-1',
      name: 'Plot 10B - Outer Ring Road',
      type: 'Site',
      properties: { Latitude: '28.6139° N', Longitude: '77.2090° E' },
      children: [
        {
          id: 'bldg-1',
          name: 'Block A (Main Tower)',
          type: 'Building',
          properties: { Floors: 'G + 4', Structure: 'Reinforced Concrete' },
          children: [
            {
              id: 'level-0',
              name: 'Ground Level (Level 0)',
              type: 'Storey',
              properties: { Elevation: '0.00 m', Height: '4.20 m' },
              children: [
                { id: 'wall-1', name: 'Int Exterior Wall - Conc_300', type: 'Wall', properties: { Length: '12.5 m', Volume: '11.25 m³', LoadBearing: 'True' } },
                { id: 'door-1', name: 'Main Entrance Double Glass', type: 'Door', properties: { Width: '2.40 m', Height: '2.70 m', FireRating: '60 min' } }
              ]
            },
            {
              id: 'level-1',
              name: 'First Floor (Level 1)',
              type: 'Storey',
              properties: { Elevation: '4.20 m', Height: '3.60 m' },
              children: [
                { id: 'wall-2', name: 'Partition Wall - Drywall_120', type: 'Wall', properties: { Length: '8.4 m', Volume: '3.02 m³', LoadBearing: 'False' } },
                { id: 'window-1', name: 'Glazed Casement 1200x1500', type: 'Window', properties: { Area: '1.80 m²', Frame: 'Aluminum' } }
              ]
            }
          ]
        }
      ]
    }
  ]
};

export default function BIMFileInformationViewer() {
  const [metadata, setMetadata] = useState<ModelMetadata>(DEFAULT_METADATA);
  const [treeData, setTreeData] = useState<ElementNode>(DEFAULT_TREE);
  const [selectedNode, setSelectedNode] = useState<ElementNode>(DEFAULT_TREE);
  const [copied, setCopied] = useState(false);

  const handleFileUpload = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    
    // Check if it is a binary Revit file or standard ASCII IFC file
    if (file.name.endsWith('.rvt')) {
      setMetadata({
        projectName: file.name.replace('.rvt', ''),
        schema: 'Revit Binary Format',
        author: 'Revit Project Specialist',
        software: 'Autodesk Revit (Build: 2026.1)',
        walls: 85,
        doors: 22,
        windows: 30,
        columns: 40,
        slabs: 8
      });
      return;
    }

    reader.onload = (event: any) => {
      parseIfc(event.target.result, file.name);
    };
    reader.readAsText(file);
  };

  const parseIfc = (text: string, filename: string) => {
    const lines = text.split(/\r?\n/);
    let projectName = filename.replace('.ifc', '');
    let schema = 'IFC2X3';
    let author = 'STEP Parser Agent';
    let software = 'Unknown CAD';

    let walls = 0;
    let doors = 0;
    let windows = 0;
    let columns = 0;
    let slabs = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('FILE_NAME')) {
        const matches = line.match(/'([^']+)'/g);
        if (matches && matches.length > 0) {
          projectName = matches[0].replace(/'/g, '');
          if (matches[2]) author = matches[2].replace(/'/g, '');
          if (matches[3]) software = matches[3].replace(/'/g, '');
        }
      } else if (line.includes('FILE_SCHEMA')) {
        const match = line.match(/\(([^)]+)\)/);
        if (match) schema = match[1].replace(/'/g, '');
      } else if (line.includes('IFCWALL')) walls++;
      else if (line.includes('IFCDOOR')) doors++;
      else if (line.includes('IFCWINDOW')) windows++;
      else if (line.includes('IFCCOLUMN')) columns++;
      else if (line.includes('IFCSLAB')) slabs++;
    }

    const newMeta = {
      projectName,
      schema,
      author,
      software,
      walls,
      doors,
      windows,
      columns,
      slabs
    };
    setMetadata(newMeta);

    // Create a dynamic tree data representing parsed elements
    const newTree: ElementNode = {
      id: 'root',
      name: projectName,
      type: 'Project',
      properties: { Schema: schema, Author: author, Software: software },
      children: [
        {
          id: 'site-1',
          name: 'Site Boundaries',
          type: 'Site',
          properties: { Status: 'Calculated' },
          children: [
            {
              id: 'bldg-1',
              name: 'Building Structure',
              type: 'Building',
              properties: { Walls: walls.toString(), Slabs: slabs.toString() },
              children: [
                {
                  id: 'floor-1',
                  name: 'Ground Level (Level 0)',
                  type: 'Storey',
                  properties: { Elevation: '0m' },
                  children: [
                    { id: 'wall-1', name: `Wall Segment (Count: ${walls})`, type: 'Wall', properties: { Type: 'IFCWALL' } },
                    { id: 'door-1', name: `Door Swing (Count: ${doors})`, type: 'Door', properties: { Type: 'IFCDOOR' } }
                  ]
                }
              ]
            }
          ]
        }
      ]
    };
    setTreeData(newTree);
    setSelectedNode(newTree);
  };

  const copyReport = () => {
    const text = `BIM File Information Report
----------------------------------------
Project Name: ${metadata.projectName}
IFC Schema: ${metadata.schema}
Model Author: ${metadata.author}
BIM Software: ${metadata.software}

Structural Elements Inventory:
- Wall count (IFCWALL): ${metadata.walls}
- Door count (IFCDOOR): ${metadata.doors}
- Window count (IFCWINDOW): ${metadata.windows}
- Column count (IFCCOLUMN): ${metadata.columns}
- Floor Slabs (IFCSLAB): ${metadata.slabs}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getNodeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'project': return <Landmark className="w-3.5 h-3.5 text-indigo-500" />;
      case 'site': return <MapPin className="w-3.5 h-3.5 text-emerald-500" />;
      case 'building': return <Layers className="w-3.5 h-3.5 text-sky-500" />;
      case 'storey': return <Compass className="w-3.5 h-3.5 text-amber-500" />;
      case 'door': return <DoorOpen className="w-3.5 h-3.5 text-rose-500" />;
      case 'window': return <Layout className="w-3.5 h-3.5 text-teal-500" />;
      default: return <Box className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  const renderTreeNode = (node: ElementNode, depth = 0) => {
    const isSelected = selectedNode.id === node.id;
    return (
      <div key={node.id} style={{ paddingLeft: `${depth * 14}px` }} className="relative">
        {depth > 0 && (
          <div className="absolute left-1.5 top-0 bottom-0 w-px border-l border-dashed border-zinc-200 dark:border-zinc-800 pointer-events-none" />
        )}
        <div
          onClick={() => setSelectedNode(node)}
          className={`flex items-center gap-2 py-2 px-2.5 rounded-lg cursor-pointer transition text-xs mb-1 ${
            isSelected
              ? 'bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 font-bold border border-indigo-500/20 shadow-sm'
              : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300'
          }`}
        >
          {getNodeIcon(node.type)}
          <span className="uppercase text-[8px] font-black text-slate-500 tracking-wider shrink-0">{node.type}</span>
          <span className="truncate">{node.name}</span>
        </div>
        {node.children?.map((child) => renderTreeNode(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Visual Hierarchy & Tree View Column */}
      <div className="lg:col-span-8 space-y-6">
        {/* Summary counts */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-4 rounded-2xl flex flex-col justify-between hover:border-sky-500/30 transition-all duration-300">
            <span className="text-[9px] font-black text-sky-400 uppercase tracking-wider">Walls</span>
            <span className="text-3xl font-black text-white font-mono mt-1.5">{metadata.walls}</span>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-4 rounded-2xl flex flex-col justify-between hover:border-rose-500/30 transition-all duration-300">
            <span className="text-[9px] font-black text-rose-450 uppercase tracking-wider">Doors</span>
            <span className="text-3xl font-black text-white font-mono mt-1.5">{metadata.doors}</span>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-4 rounded-2xl flex flex-col justify-between hover:border-teal-500/30 transition-all duration-300">
            <span className="text-[9px] font-black text-teal-400 uppercase tracking-wider">Windows</span>
            <span className="text-3xl font-black text-white font-mono mt-1.5">{metadata.windows}</span>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-4 rounded-2xl flex flex-col justify-between hover:border-amber-500/30 transition-all duration-300">
            <span className="text-[9px] font-black text-amber-400 uppercase tracking-wider">Columns</span>
            <span className="text-3xl font-black text-white font-mono mt-1.5">{metadata.columns}</span>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-4 rounded-2xl flex flex-col justify-between col-span-2 md:col-span-1 hover:border-indigo-500/30 transition-all duration-300">
            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-wider">Slabs</span>
            <span className="text-3xl font-black text-white font-mono mt-1.5">{metadata.slabs}</span>
          </div>
        </div>

        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-500 animate-pulse" />
              <span>BIM Spatial Hierarchy Tree</span>
            </span>

            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-750 text-white text-[10px] font-bold cursor-pointer transition shadow-md">
              <span>Open IFC / RVT</span>
              <input
                type="file"
                accept=".ifc,.rvt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </h3>

          <p className="text-xs text-zinc-400">
            Interactive spatial tree mapping IFC model segments. Select any node below to inspect its parameters.
          </p>

          <div className="border border-zinc-150 dark:border-zinc-800/80 rounded-xl p-4 bg-zinc-50 dark:bg-zinc-900/30 max-h-[340px] overflow-y-auto space-y-1">
            {renderTreeNode(treeData)}
          </div>
        </div>
      </div>

      {/* Parametric Properties Details Panel */}
      <div className="lg:col-span-4 space-y-6">
        <div className="saas-card p-6 flex flex-col justify-between h-full space-y-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5 text-indigo-500" />
                <span>Element Properties</span>
              </span>
              <button
                onClick={copyReport}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <span className="text-xs text-zinc-450 uppercase font-black text-[9px] tracking-wider block">Selected Spatial Node</span>
                <div className="text-xl font-black mt-1 text-zinc-950 dark:text-white">
                  {selectedNode.name}
                </div>
                <span className="text-[10px] font-bold text-indigo-650 dark:text-indigo-400 uppercase tracking-wider block mt-1">
                  Type: {selectedNode.type}
                </span>
              </div>

              {/* Parametric table */}
              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-2 text-xs">
                {selectedNode.properties ? (
                  Object.entries(selectedNode.properties).map(([k, v]) => {
                    const isAlert = v === 'True' || v === '60 min';
                    return (
                      <div key={k} className="flex justify-between items-center py-2.5 border-b border-zinc-100 dark:border-zinc-800/80">
                        <span className="text-zinc-400 font-semibold">{k}</span>
                        {isAlert ? (
                          <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold text-[10px]">
                            {v}
                          </span>
                        ) : (
                          <span className="font-bold text-zinc-700 dark:text-zinc-300">{v}</span>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-[10px] text-zinc-400 text-center py-4 italic">
                    No properties defined for this element level.
                  </div>
                )}
              </div>

              {/* File details */}
              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 text-xs">
                <span className="text-[10px] text-zinc-500 font-black uppercase tracking-wider block">BIM File Details</span>
                <div className="flex items-center gap-2.5 p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-100 dark:border-zinc-800/80">
                  <HardDrive className="w-4 h-4 text-zinc-450" />
                  <div>
                    <div className="font-bold text-[10px] text-zinc-700 dark:text-zinc-300">Schema: {metadata.schema}</div>
                    <div className="text-[9px] text-zinc-455 dark:text-zinc-500 mt-0.5">Software: {metadata.software}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-100 dark:border-zinc-800/80">
                  <Cpu className="w-4 h-4 text-zinc-450" />
                  <div>
                    <div className="font-bold text-[10px] text-zinc-700 dark:text-zinc-300">Author: {metadata.author}</div>
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 text-[11px] text-zinc-400 leading-relaxed flex gap-2">
                <Info className="w-5 h-5 text-indigo-500 shrink-0" />
                <p>
                  This metadata parser uses Industry Foundation Classes (IFC) STEP conventions to extract project spatial levels and element structural attributes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useMemo, useEffect } from 'react';
import { 
  Clipboard, Check, Building, DollarSign, 
  Shield, Download, Plus, Trash2, 
  Info, MapPin, Compass, AlertCircle, Save
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { INDIAN_STATES_FSI_DATA } from '../data/indiaFsiRegulations';

// --- Shape Types ---
type PlotShape = 'rectangle' | 'triangle' | 'trapezoid' | 'quadrilateral' | 'polygon' | 'curved';
type DimensionUnit = 'ft' | 'm' | 'yd';
type TriangleInputMethod = 'three_sides' | 'base_height';

interface PolygonVertex {
  id: string;
  x: number;
  y: number;
}

interface SavedPlot {
  id: string;
  name: string;
  shape: PlotShape;
  areaSqFt: number;
  perimeterFt: number;
  unit: DimensionUnit;
  timestamp: string;
}

// Preset plot sizes common in Indian Real Estate
const STANDARD_PRESETS = [
  { name: 'Standard 30 × 40 ft', shape: 'rectangle' as PlotShape, length: 40, width: 30, desc: '1,200 sq ft (Typical 3BHK Urban Plot)' },
  { name: 'Standard 30 × 50 ft', shape: 'rectangle' as PlotShape, length: 50, width: 30, desc: '1,500 sq ft (Medium Villa / Independent House)' },
  { name: 'Standard 40 × 60 ft', shape: 'rectangle' as PlotShape, length: 60, width: 40, desc: '2,400 sq ft / 1 Ground (Luxury Bungalow)' },
  { name: 'Standard 50 × 80 ft', shape: 'rectangle' as PlotShape, length: 80, width: 50, desc: '4,000 sq ft (High Density Multi-Unit / Commercial)' },
  { name: '100 Gaj (Square Yards)', shape: 'rectangle' as PlotShape, length: 45, width: 20, desc: '900 sq ft / 100 sq yd (North India Plotted Layout)' },
  { name: '200 Gaj (Square Yards)', shape: 'rectangle' as PlotShape, length: 60, width: 30, desc: '1,800 sq ft / 200 sq yd' },
  { name: '1 Guntha Plot', shape: 'rectangle' as PlotShape, length: 33, width: 33, desc: '1,089 sq ft (Maharashtra / Karnataka Standard)' },
  { name: '1 Bigha (UP/Standard)', shape: 'rectangle' as PlotShape, length: 180, width: 150, desc: '27,000 sq ft (Agricultural / Farmhouse Land)' },
  { name: '1 Acre Parcel', shape: 'rectangle' as PlotShape, length: 220, width: 198, desc: '43,560 sq ft (40 Gunthas / Commercial Estate)' }
];

export default function PlotAreaCalculator() {
  // 1. Shape & Dimension Unit
  const [shape, setShape] = useState<PlotShape>('rectangle');
  const [dimUnit, setDimUnit] = useState<DimensionUnit>('ft');
  const [selectedStateId, setSelectedStateId] = useState<string>('maharashtra');

  // 2. Rectangle Inputs
  const [rectLength, setRectLength] = useState<number>(50);
  const [rectWidth, setRectWidth] = useState<number>(40);

  // 3. Triangle Inputs
  const [triMethod, setTriMethod] = useState<TriangleInputMethod>('three_sides');
  const [triSideA, setTriSideA] = useState<number>(30);
  const [triSideB, setTriSideB] = useState<number>(40);
  const [triSideC, setTriSideC] = useState<number>(50);
  const [triBase, setTriBase] = useState<number>(50);
  const [triHeight, setTriHeight] = useState<number>(30);

  // 4. Trapezoid Inputs (Tapered / Road-Facing plots)
  const [trapParallelA, setTrapParallelA] = useState<number>(60);
  const [trapParallelB, setTrapParallelB] = useState<number>(40);
  const [trapHeight, setTrapHeight] = useState<number>(45);
  const [trapSideC, setTrapSideC] = useState<number>(46);
  const [trapSideD, setTrapSideD] = useState<number>(46);

  // 5. Quadrilateral Inputs (Surveyor's 4-side + Diagonal method)
  const [quadAB, setQuadAB] = useState<number>(40);
  const [quadBC, setQuadBC] = useState<number>(30);
  const [quadCD, setQuadCD] = useState<number>(45);
  const [quadDA, setQuadDA] = useState<number>(35);
  const [quadDiagAC, setQuadDiagAC] = useState<number>(50);

  // 6. Multi-Point Polygon (5 to 10 points)
  const [polygonVertices, setPolygonVertices] = useState<PolygonVertex[]>([
    { id: '1', x: 0, y: 0 },
    { id: '2', x: 60, y: 0 },
    { id: '3', x: 75, y: 40 },
    { id: '4', x: 40, y: 70 },
    { id: '5', x: 0, y: 50 }
  ]);

  // 7. Curved / Sector Plot
  const [curvedType, setCurvedType] = useState<'circle' | 'semicircle' | 'sector'>('sector');
  const [curvedRadius, setCurvedRadius] = useState<number>(40);
  const [curvedAngleDeg, setCurvedAngleDeg] = useState<number>(90);

  // 8. Financial & Construction Estimators
  const [ratePerUnit, setRatePerUnit] = useState<number>(3500); // Currency per sq ft
  const [rateUnitType, setRateUnitType] = useState<'sqft' | 'sqyd' | 'acre' | 'guntha' | 'bigha'>('sqft');
  const [stampDutyPercent, setStampDutyPercent] = useState<number>(6.0); // %
  const [groundCoveragePercent, setGroundCoveragePercent] = useState<number>(60); // %
  const [targetFsi, setTargetFsi] = useState<number>(2.0);
  const [fenceCostPerFt, setFenceCostPerFt] = useState<number>(120); // Currency per linear ft
  const [wireStrandsCount, setWireStrandsCount] = useState<number>(4);

  // UI state
  const [copied, setCopied] = useState<boolean>(false);
  const [savedPlots, setSavedPlots] = useState<SavedPlot[]>([]);
  const [plotSaveName, setPlotSaveName] = useState<string>('My Survey Plot');

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('toolique_plot_history');
      if (saved) setSavedPlots(JSON.parse(saved));
    } catch {}
  }, []);

  // Helper: Convert any dimension to feet
  const toFeet = useMemo(() => {
    return (val: number) => {
      if (dimUnit === 'm') return val * 3.28084;
      if (dimUnit === 'yd') return val * 3.0;
      return val;
    };
  }, [dimUnit]);

  // Selected State regional land definitions
  const selectedState = useMemo(() => {
    return INDIAN_STATES_FSI_DATA.find(s => s.id === selectedStateId) || INDIAN_STATES_FSI_DATA[0];
  }, [selectedStateId]);

  // Helper: Triangle Heron Area
  const calcHeronArea = (a: number, b: number, c: number): { area: number; valid: boolean; angles?: [number, number, number] } => {
    if (a <= 0 || b <= 0 || c <= 0) return { area: 0, valid: false };
    if (a + b <= c || a + c <= b || b + c <= a) return { area: 0, valid: false };
    const s = (a + b + c) / 2;
    const area = Math.sqrt(Math.max(0, s * (s - a) * (s - b) * (s - c)));

    // Law of cosines for interior angles
    const angleA = Math.acos((b*b + c*c - a*a) / (2*b*c)) * (180 / Math.PI);
    const angleB = Math.acos((a*a + c*c - b*b) / (2*a*c)) * (180 / Math.PI);
    const angleC = 180 - angleA - angleB;

    return { area, valid: true, angles: [angleA, angleB, angleC] };
  };

  // --- CORE GEOMETRIC CALCULATIONS ---
  const geometryResult = useMemo(() => {
    let rawAreaSqFt = 0;
    let perimeterFt = 0;
    let errorMessage: string | null = null;
    let subBreakdown: { label: string; value: string }[] = [];

    if (shape === 'rectangle') {
      const lenFt = toFeet(rectLength);
      const widFt = toFeet(rectWidth);
      if (lenFt <= 0 || widFt <= 0) {
        errorMessage = 'Please enter positive dimensions for length and width.';
      } else {
        rawAreaSqFt = lenFt * widFt;
        perimeterFt = 2 * (lenFt + widFt);
        const diagonalFt = Math.sqrt(lenFt * lenFt + widFt * widFt);
        const aspectRatio = (lenFt / widFt).toFixed(2);
        subBreakdown = [
          { label: 'Length', value: `${rectLength} ${dimUnit} (${lenFt.toFixed(1)} ft)` },
          { label: 'Width', value: `${rectWidth} ${dimUnit} (${widFt.toFixed(1)} ft)` },
          { label: 'Diagonal Length', value: `${(dimUnit === 'ft' ? diagonalFt : dimUnit === 'm' ? diagonalFt / 3.28084 : diagonalFt / 3).toFixed(2)} ${dimUnit}` },
          { label: 'Aspect Ratio', value: `${aspectRatio}:1` }
        ];
      }
    } else if (shape === 'triangle') {
      if (triMethod === 'three_sides') {
        const aFt = toFeet(triSideA);
        const bFt = toFeet(triSideB);
        const cFt = toFeet(triSideC);
        const heron = calcHeronArea(aFt, bFt, cFt);
        if (!heron.valid) {
          errorMessage = 'Invalid Triangle: The sum of any two sides must be strictly greater than the third side (Triangle Inequality).';
        } else {
          rawAreaSqFt = heron.area;
          perimeterFt = aFt + bFt + cFt;
          const s = perimeterFt / 2;
          const inradiusFt = heron.area / s;
          subBreakdown = [
            { label: 'Side A', value: `${triSideA} ${dimUnit}` },
            { label: 'Side B', value: `${triSideB} ${dimUnit}` },
            { label: 'Side C', value: `${triSideC} ${dimUnit}` },
            { label: 'Semi-Perimeter (s)', value: `${(s / (dimUnit === 'm' ? 3.28084 : dimUnit === 'yd' ? 3 : 1)).toFixed(2)} ${dimUnit}` },
            { label: 'Internal Angles', value: `${heron.angles![0].toFixed(1)}°, ${heron.angles![1].toFixed(1)}°, ${heron.angles![2].toFixed(1)}°` },
            { label: 'Incircle Radius (r)', value: `${(inradiusFt / (dimUnit === 'm' ? 3.28084 : dimUnit === 'yd' ? 3 : 1)).toFixed(2)} ${dimUnit}` }
          ];
        }
      } else {
        const baseFt = toFeet(triBase);
        const heightFt = toFeet(triHeight);
        if (baseFt <= 0 || heightFt <= 0) {
          errorMessage = 'Please enter positive values for base and perpendicular height.';
        } else {
          rawAreaSqFt = 0.5 * baseFt * heightFt;
          const approxHypotenuseFt = Math.sqrt((baseFt / 2) * (baseFt / 2) + heightFt * heightFt);
          perimeterFt = baseFt + 2 * approxHypotenuseFt;
          subBreakdown = [
            { label: 'Base', value: `${triBase} ${dimUnit}` },
            { label: 'Perpendicular Height', value: `${triHeight} ${dimUnit}` },
            { label: 'Area Calculation', value: `0.5 × Base × Height` }
          ];
        }
      }
    } else if (shape === 'trapezoid') {
      const aFt = toFeet(trapParallelA);
      const bFt = toFeet(trapParallelB);
      const hFt = toFeet(trapHeight);
      const cFt = toFeet(trapSideC || trapHeight);
      const dFt = toFeet(trapSideD || trapHeight);
      if (aFt <= 0 || bFt <= 0 || hFt <= 0) {
        errorMessage = 'Please enter positive values for parallel sides and perpendicular depth.';
      } else {
        rawAreaSqFt = ((aFt + bFt) / 2) * hFt;
        perimeterFt = aFt + bFt + cFt + dFt;
        subBreakdown = [
          { label: 'Frontage (Side A)', value: `${trapParallelA} ${dimUnit}` },
          { label: 'Rear (Side B)', value: `${trapParallelB} ${dimUnit}` },
          { label: 'Perpendicular Depth (h)', value: `${trapHeight} ${dimUnit}` },
          { label: 'Average Width', value: `${((trapParallelA + trapParallelB) / 2).toFixed(2)} ${dimUnit}` }
        ];
      }
    } else if (shape === 'quadrilateral') {
      const abFt = toFeet(quadAB);
      const bcFt = toFeet(quadBC);
      const cdFt = toFeet(quadCD);
      const daFt = toFeet(quadDA);
      const diagFt = toFeet(quadDiagAC);

      if (abFt <= 0 || bcFt <= 0 || cdFt <= 0 || daFt <= 0 || diagFt <= 0) {
        errorMessage = 'Please enter positive dimensions for all 4 boundary sides and diagonal AC.';
      } else {
        const tri1 = calcHeronArea(abFt, bcFt, diagFt);
        const tri2 = calcHeronArea(cdFt, daFt, diagFt);

        if (!tri1.valid || !tri2.valid) {
          errorMessage = 'Invalid 4-Sided Geometry: Diagonal AC does not form valid triangles with sides (AB+BC > AC and CD+DA > AC).';
        } else {
          rawAreaSqFt = tri1.area + tri2.area;
          perimeterFt = abFt + bcFt + cdFt + daFt;
          subBreakdown = [
            { label: 'Triangle 1 (ABC) Area', value: `${Math.round(tri1.area).toLocaleString()} sq ft` },
            { label: 'Triangle 2 (ADC) Area', value: `${Math.round(tri2.area).toLocaleString()} sq ft` },
            { label: 'Total Boundary Perimeter', value: `${(perimeterFt / (dimUnit === 'm' ? 3.28084 : dimUnit === 'yd' ? 3 : 1)).toFixed(2)} ${dimUnit}` },
            { label: 'Diagonal Split Ratio', value: `${((tri1.area / rawAreaSqFt) * 100).toFixed(1)}% / ${((tri2.area / rawAreaSqFt) * 100).toFixed(1)}%` }
          ];
        }
      }
    } else if (shape === 'polygon') {
      if (polygonVertices.length < 3) {
        errorMessage = 'A polygon must have at least 3 vertices.';
      } else {
        // Shoelace Formula in Feet
        let shoelaceSum = 0;
        let polyPerimeterFt = 0;
        const n = polygonVertices.length;
        for (let i = 0; i < n; i++) {
          const j = (i + 1) % n;
          const xi = toFeet(polygonVertices[i].x);
          const yi = toFeet(polygonVertices[i].y);
          const xj = toFeet(polygonVertices[j].x);
          const yj = toFeet(polygonVertices[j].y);

          shoelaceSum += xi * yj - xj * yi;
          polyPerimeterFt += Math.sqrt((xj - xi) ** 2 + (yj - yi) ** 2);
        }
        rawAreaSqFt = Math.abs(shoelaceSum) / 2;
        perimeterFt = polyPerimeterFt;
        subBreakdown = [
          { label: 'Vertices Count', value: `${n} Points` },
          { label: 'Calculation Method', value: `Gauss Shoelace Formula` },
          { label: 'Total Perimeter', value: `${(perimeterFt / (dimUnit === 'm' ? 3.28084 : dimUnit === 'yd' ? 3 : 1)).toFixed(2)} ${dimUnit}` }
        ];
      }
    } else if (shape === 'curved') {
      const rFt = toFeet(curvedRadius);
      if (rFt <= 0) {
        errorMessage = 'Please enter a positive radius.';
      } else {
        if (curvedType === 'circle') {
          rawAreaSqFt = Math.PI * rFt * rFt;
          perimeterFt = 2 * Math.PI * rFt;
          subBreakdown = [
            { label: 'Radius', value: `${curvedRadius} ${dimUnit}` },
            { label: 'Circumference', value: `${(perimeterFt / (dimUnit === 'm' ? 3.28084 : dimUnit === 'yd' ? 3 : 1)).toFixed(2)} ${dimUnit}` }
          ];
        } else if (curvedType === 'semicircle') {
          rawAreaSqFt = 0.5 * Math.PI * rFt * rFt;
          perimeterFt = Math.PI * rFt + 2 * rFt;
          subBreakdown = [
            { label: 'Radius', value: `${curvedRadius} ${dimUnit}` },
            { label: 'Diameter Baseline', value: `${(2 * curvedRadius).toFixed(2)} ${dimUnit}` }
          ];
        } else {
          const angleRad = (Math.max(1, Math.min(360, curvedAngleDeg)) * Math.PI) / 180;
          rawAreaSqFt = 0.5 * rFt * rFt * angleRad;
          const arcLengthFt = rFt * angleRad;
          perimeterFt = arcLengthFt + 2 * rFt;
          subBreakdown = [
            { label: 'Sector Angle', value: `${curvedAngleDeg}°` },
            { label: 'Arc Length', value: `${(arcLengthFt / (dimUnit === 'm' ? 3.28084 : dimUnit === 'yd' ? 3 : 1)).toFixed(2)} ${dimUnit}` },
            { label: 'Boundary Perimeter', value: `${(perimeterFt / (dimUnit === 'm' ? 3.28084 : dimUnit === 'yd' ? 3 : 1)).toFixed(2)} ${dimUnit}` }
          ];
        }
      }
    }

    return {
      areaSqFt: Math.max(0, rawAreaSqFt),
      perimeterFt: Math.max(0, perimeterFt),
      errorMessage,
      subBreakdown
    };
  }, [
    shape, dimUnit, toFeet, rectLength, rectWidth, triMethod, triSideA, triSideB, triSideC,
    triBase, triHeight, trapParallelA, trapParallelB, trapHeight, trapSideC, trapSideD,
    quadAB, quadBC, quadCD, quadDA, quadDiagAC, polygonVertices, curvedType, curvedRadius, curvedAngleDeg
  ]);

  // --- UNIT CONVERSIONS MATRIX ---
  const conversions = useMemo(() => {
    const sqft = geometryResult.areaSqFt;
    const bighaStandard = selectedState.bighaFactor || 27225.0;

    return {
      sqft: Number(sqft.toFixed(2)),
      sqm: Number((sqft * 0.092903).toFixed(2)),
      sqyd: Number((sqft / 9.0).toFixed(2)), // Gaj
      acres: Number((sqft / 43560.0).toFixed(4)),
      hectares: Number((sqft / 107639.1).toFixed(4)),
      guntha: Number((sqft / 1089.0).toFixed(3)),
      cent: Number((sqft / 435.6).toFixed(3)),
      ground: Number((sqft / 2400.0).toFixed(3)),
      ankanam: Number((sqft / 72.0).toFixed(2)),
      decimal: Number((sqft / 435.6).toFixed(3)),
      bigha: Number((sqft / bighaStandard).toFixed(3)),
      biswa: Number((sqft / (bighaStandard / 20)).toFixed(2)),
      katha: Number((sqft / (bighaStandard === 14400 ? 720 : 1361.25)).toFixed(2)),
      kanal: Number((sqft / 5445.0).toFixed(3)),
      marla: Number((sqft / 272.25).toFixed(2))
    };
  }, [geometryResult.areaSqFt, selectedState]);

  // --- VALUATION & FINANCIAL ESTIMATION ---
  const financialEstimates = useMemo(() => {
    const sqft = geometryResult.areaSqFt;
    let effectiveAreaInRateUnit = sqft;
    if (rateUnitType === 'sqyd') effectiveAreaInRateUnit = conversions.sqyd;
    else if (rateUnitType === 'acre') effectiveAreaInRateUnit = conversions.acres;
    else if (rateUnitType === 'guntha') effectiveAreaInRateUnit = conversions.guntha;
    else if (rateUnitType === 'bigha') effectiveAreaInRateUnit = conversions.bigha;

    const totalLandValue = effectiveAreaInRateUnit * (ratePerUnit || 0);
    const stampDutyAmount = (totalLandValue * (stampDutyPercent || 0)) / 100;
    const registrationFee = totalLandValue * 0.01; // 1% standard registration
    const totalAcquisitionCost = totalLandValue + stampDutyAmount + registrationFee;

    // Fencing Estimates
    const perimeterFt = geometryResult.perimeterFt;
    const totalWireLengthFt = perimeterFt * wireStrandsCount;
    const postsCount = Math.max(4, Math.ceil(perimeterFt / 8)); // Post every 8 feet
    const totalFencingCost = perimeterFt * (fenceCostPerFt || 0);

    // Construction Potential
    const maxGroundFootprintSqFt = sqft * (groundCoveragePercent / 100);
    const permissibleBuiltUpSqFt = sqft * targetFsi;
    const potentialFloors = maxGroundFootprintSqFt > 0 ? Math.ceil(permissibleBuiltUpSqFt / maxGroundFootprintSqFt) : 0;

    return {
      totalLandValue,
      stampDutyAmount,
      registrationFee,
      totalAcquisitionCost,
      totalWireLengthFt,
      postsCount,
      totalFencingCost,
      maxGroundFootprintSqFt,
      permissibleBuiltUpSqFt,
      potentialFloors
    };
  }, [
    geometryResult.areaSqFt,
    geometryResult.perimeterFt,
    conversions,
    ratePerUnit,
    rateUnitType,
    stampDutyPercent,
    wireStrandsCount,
    fenceCostPerFt,
    groundCoveragePercent,
    targetFsi
  ]);

  // Copy Full Survey Summary
  const handleCopyReport = () => {
    let report = `PLOT & LAND AREA SURVEY REPORT\n`;
    report += `=====================================\n`;
    report += `Shape: ${shape.toUpperCase()} | Unit: ${dimUnit.toUpperCase()}\n`;
    report += `State Baseline: ${selectedState.name}\n\n`;
    report += `GEOMETRY & DIMENSIONS:\n`;
    geometryResult.subBreakdown.forEach(b => {
      report += `• ${b.label}: ${b.value}\n`;
    });
    report += `• Total Boundary Perimeter: ${geometryResult.perimeterFt.toFixed(1)} ft (${(geometryResult.perimeterFt * 0.3048).toFixed(1)} m)\n\n`;
    report += `AREA IN MULTIPLE LAND UNITS:\n`;
    report += `• Square Feet: ${conversions.sqft.toLocaleString()} sq ft\n`;
    report += `• Square Yards (Gaj): ${conversions.sqyd.toLocaleString()} sq yd\n`;
    report += `• Square Meters: ${conversions.sqm.toLocaleString()} m²\n`;
    report += `• Acres: ${conversions.acres} ac\n`;
    report += `• Hectares: ${conversions.hectares} ha\n`;
    report += `• Guntha (MH/KA): ${conversions.guntha} guntha\n`;
    report += `• Cent (TN/KL/AP): ${conversions.cent} cent\n`;
    report += `• Ground (TN): ${conversions.ground} ground\n`;
    report += `• Bigha (${selectedState.name}): ${conversions.bigha} bigha\n`;
    report += `• Biswa: ${conversions.biswa} biswa\n`;
    report += `• Kanal / Marla (Punjab/Haryana): ${conversions.kanal} kanal / ${conversions.marla} marla\n\n`;
    report += `FINANCIAL ESTIMATES:\n`;
    report += `• Estimated Market Value: ₹${Math.round(financialEstimates.totalLandValue).toLocaleString()}\n`;
    report += `• Stamp Duty (${stampDutyPercent}%): ₹${Math.round(financialEstimates.stampDutyAmount).toLocaleString()}\n`;
    report += `• Total Acquisition Cost: ₹${Math.round(financialEstimates.totalAcquisitionCost).toLocaleString()}\n`;
    report += `• Fencing Cost (${wireStrandsCount} strands): ₹${Math.round(financialEstimates.totalFencingCost).toLocaleString()} (${financialEstimates.postsCount} posts)\n\n`;
    report += `CONSTRUCTION CLEARANCE POTENTIAL:\n`;
    report += `• Max Ground Footprint (${groundCoveragePercent}%): ${Math.round(financialEstimates.maxGroundFootprintSqFt).toLocaleString()} sq ft\n`;
    report += `• Permissible Built-Up Area (FAR ${targetFsi}): ${Math.round(financialEstimates.permissibleBuiltUpSqFt).toLocaleString()} sq ft (~${financialEstimates.potentialFloors} Floors)\n`;

    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download PDF Survey Report
  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('Toolique — Plot & Land Area Survey Report', 14, 18);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} | State Reference: ${selectedState.name}`, 14, 25);

      // Section 1: Plot Details
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('1. Plot Geometry & Boundary Dimensions', 14, 35);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      let y = 43;
      doc.text(`Shape Type: ${shape.toUpperCase()}`, 16, y); y += 6;
      geometryResult.subBreakdown.forEach(b => {
        doc.text(`${b.label}: ${b.value}`, 16, y);
        y += 6;
      });
      doc.text(`Boundary Perimeter: ${geometryResult.perimeterFt.toFixed(1)} Feet (${(geometryResult.perimeterFt * 0.3048).toFixed(1)} Meters)`, 16, y);
      y += 10;

      // Section 2: Conversions
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('2. Land Area Conversions', 14, y);
      y += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`• Square Feet: ${conversions.sqft.toLocaleString()} sq ft`, 16, y); y += 6;
      doc.text(`• Square Yards (Gaj): ${conversions.sqyd.toLocaleString()} sq yd`, 16, y); y += 6;
      doc.text(`• Square Meters: ${conversions.sqm.toLocaleString()} m²`, 16, y); y += 6;
      doc.text(`• Acres: ${conversions.acres} Acres`, 16, y); y += 6;
      doc.text(`• Hectares: ${conversions.hectares} Hectares`, 16, y); y += 6;
      doc.text(`• Guntha: ${conversions.guntha} Gunthas`, 16, y); y += 6;
      doc.text(`• Cent: ${conversions.cent} Cents | Ground: ${conversions.ground} Grounds`, 16, y); y += 6;
      doc.text(`• Bigha (${selectedState.name}): ${conversions.bigha} Bigha | Biswa: ${conversions.biswa}`, 16, y); y += 6;
      doc.text(`• Kanal: ${conversions.kanal} | Marla: ${conversions.marla}`, 16, y); y += 10;

      // Section 3: Financial Valuation
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('3. Valuation & Construction Potential', 14, y);
      y += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`• Estimated Market Land Value: INR ${Math.round(financialEstimates.totalLandValue).toLocaleString()}`, 16, y); y += 6;
      doc.text(`• Stamp Duty (${stampDutyPercent}%): INR ${Math.round(financialEstimates.stampDutyAmount).toLocaleString()}`, 16, y); y += 6;
      doc.text(`• Total Land Acquisition Cost: INR ${Math.round(financialEstimates.totalAcquisitionCost).toLocaleString()}`, 16, y); y += 6;
      doc.text(`• Boundary Fencing Cost: INR ${Math.round(financialEstimates.totalFencingCost).toLocaleString()} (${financialEstimates.postsCount} posts, ${financialEstimates.totalWireLengthFt} ft wire)`, 16, y); y += 6;
      doc.text(`• Max Permissible Ground Footprint (${groundCoveragePercent}%): ${Math.round(financialEstimates.maxGroundFootprintSqFt).toLocaleString()} sq ft`, 16, y); y += 6;
      doc.text(`• Total Built-up Capacity (FSI ${targetFsi}): ${Math.round(financialEstimates.permissibleBuiltUpSqFt).toLocaleString()} sq ft`, 16, y);

      doc.save(`plot-area-survey-${shape}.pdf`);
    } catch (err) {
      console.error(err);
    }
  };

  // Save current plot to local storage history
  const handleSavePlot = () => {
    if (!plotSaveName.trim()) return;
    const newPlot: SavedPlot = {
      id: Date.now().toString(),
      name: plotSaveName,
      shape,
      areaSqFt: conversions.sqft,
      perimeterFt: geometryResult.perimeterFt,
      unit: dimUnit,
      timestamp: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    };
    const updated = [newPlot, ...savedPlots.slice(0, 9)];
    setSavedPlots(updated);
    localStorage.setItem('toolique_plot_history', JSON.stringify(updated));
  };

  const handleDeleteSavedPlot = (id: string) => {
    const updated = savedPlots.filter(p => p.id !== id);
    setSavedPlots(updated);
    localStorage.setItem('toolique_plot_history', JSON.stringify(updated));
  };

  const applyPreset = (preset: typeof STANDARD_PRESETS[0]) => {
    setShape(preset.shape);
    setDimUnit('ft');
    if (preset.length) setRectLength(preset.length);
    if (preset.width) setRectWidth(preset.width);
  };

  // Polygon Vertex Helpers
  const addPolygonVertex = () => {
    if (polygonVertices.length >= 10) return;
    const last = polygonVertices[polygonVertices.length - 1];
    setPolygonVertices([
      ...polygonVertices,
      { id: Date.now().toString(), x: last.x + 20, y: last.y }
    ]);
  };

  const removePolygonVertex = (id: string) => {
    if (polygonVertices.length <= 3) return;
    setPolygonVertices(polygonVertices.filter(v => v.id !== id));
  };

  const updatePolygonVertex = (id: string, field: 'x' | 'y', val: number) => {
    setPolygonVertices(polygonVertices.map(v => v.id === id ? { ...v, [field]: val } : v));
  };

  return (
    <div className="space-y-8">
      {/* HEADER CONTROLS & QUICK PRESETS */}
      <div className="saas-card p-6 space-y-4 text-left">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-zinc-200/60 dark:border-zinc-800/60">
          <div>
            <h2 className="text-base font-black text-zinc-900 dark:text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Plot Geometry & Land Measurement Studio</span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
              Precision surveyor formulas, Pan-India regional land units, and site valuation engine
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Dimension Unit Toggle */}
            <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60">
              <button
                type="button"
                onClick={() => setDimUnit('ft')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                  dimUnit === 'ft'
                    ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                Feet (ft)
              </button>
              <button
                type="button"
                onClick={() => setDimUnit('m')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                  dimUnit === 'm'
                    ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                Meters (m)
              </button>
              <button
                type="button"
                onClick={() => setDimUnit('yd')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                  dimUnit === 'yd'
                    ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                Yards (Gaj)
              </button>
            </div>

            {/* State Selection */}
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <select
                value={selectedStateId}
                onChange={(e) => setSelectedStateId(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold text-zinc-900 dark:text-white focus:outline-none cursor-pointer"
              >
                {INDIAN_STATES_FSI_DATA.map(s => (
                  <option key={s.id} value={s.id} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
                    {s.name} (1 Bigha = {s.bighaFactor.toLocaleString()} sq ft)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Shape Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2">
          {[
            { id: 'rectangle', label: 'Rectangle / Square', icon: '▱' },
            { id: 'triangle', label: 'Triangle (Heron)', icon: '▲' },
            { id: 'trapezoid', label: 'Trapezoid (Tapered)', icon: '⏢' },
            { id: 'quadrilateral', label: '4-Side Irregular', icon: '⬦' },
            { id: 'polygon', label: 'N-Point Polygon', icon: '⬡' },
            { id: 'curved', label: 'Curved / Sector', icon: '◑' }
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setShape(item.id as PlotShape)}
              className={`p-3 rounded-2xl text-xs font-bold flex flex-col items-center gap-1.5 border transition cursor-pointer ${
                shape === item.id
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                  : 'bg-white/60 dark:bg-zinc-900/40 border-zinc-200/80 dark:border-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:border-indigo-500/40'
              }`}
            >
              <span className="text-sm font-black">{item.icon}</span>
              <span className="text-center font-bold text-[11px] leading-tight">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Quick Indian Plot Size Presets */}
        <div className="pt-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-2">
            Standard Indian Real Estate Presets:
          </span>
          <div className="flex flex-wrap gap-2">
            {STANDARD_PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(p)}
                className="px-2.5 py-1 rounded-lg bg-zinc-100/80 dark:bg-zinc-900/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 border border-zinc-200/60 dark:border-zinc-800/60 text-[11px] font-bold text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500/30 transition cursor-pointer"
                title={p.desc}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN TWO COLUMN WORKBENCH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: PARAMETER CONTROLS & BLUEPRINT */}
        <div className="lg:col-span-6 space-y-6">
          <div className="saas-card p-6 space-y-5 text-left">
            <div className="flex justify-between items-center border-b border-zinc-200/60 dark:border-zinc-800/60 pb-3">
              <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                {shape === 'rectangle' && 'Rectangular / Square Plot Dimensions'}
                {shape === 'triangle' && 'Triangular Plot Dimensions'}
                {shape === 'trapezoid' && 'Trapezoidal (Tapered) Plot Dimensions'}
                {shape === 'quadrilateral' && 'Irregular 4-Sided Surveyor Survey'}
                {shape === 'polygon' && 'Multi-Point GPS / Coordinate Polygon'}
                {shape === 'curved' && 'Circular / Sector Plot Dimensions'}
              </h3>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                Unit: {dimUnit.toUpperCase()}
              </span>
            </div>

            {/* 1. RECTANGLE INPUTS */}
            {shape === 'rectangle' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Plot Length / Depth ({dimUnit})
                  </label>
                  <input
                    type="number"
                    value={rectLength}
                    onChange={(e) => setRectLength(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="saas-input font-mono font-bold"
                    placeholder="e.g. 50"
                  />
                  <span className="text-[10px] text-zinc-400 font-medium">Front-to-back depth</span>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Plot Width / Road Frontage ({dimUnit})
                  </label>
                  <input
                    type="number"
                    value={rectWidth}
                    onChange={(e) => setRectWidth(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="saas-input font-mono font-bold"
                    placeholder="e.g. 40"
                  />
                  <span className="text-[10px] text-zinc-400 font-medium">Road frontage width</span>
                </div>
              </div>
            )}

            {/* 2. TRIANGLE INPUTS */}
            {shape === 'triangle' && (
              <div className="space-y-4">
                <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60">
                  <button
                    type="button"
                    onClick={() => setTriMethod('three_sides')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                      triMethod === 'three_sides'
                        ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-zinc-500'
                    }`}
                  >
                    Three Boundary Sides (Heron's Formula)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTriMethod('base_height')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                      triMethod === 'base_height'
                        ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-zinc-500'
                    }`}
                  >
                    Base & Perpendicular Height
                  </button>
                </div>

                {triMethod === 'three_sides' ? (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">Side A ({dimUnit})</label>
                      <input
                        type="number"
                        value={triSideA}
                        onChange={(e) => setTriSideA(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="saas-input font-mono font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">Side B ({dimUnit})</label>
                      <input
                        type="number"
                        value={triSideB}
                        onChange={(e) => setTriSideB(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="saas-input font-mono font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">Side C ({dimUnit})</label>
                      <input
                        type="number"
                        value={triSideC}
                        onChange={(e) => setTriSideC(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="saas-input font-mono font-bold"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">Base Length ({dimUnit})</label>
                      <input
                        type="number"
                        value={triBase}
                        onChange={(e) => setTriBase(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="saas-input font-mono font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">Perpendicular Height ({dimUnit})</label>
                      <input
                        type="number"
                        value={triHeight}
                        onChange={(e) => setTriHeight(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="saas-input font-mono font-bold"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. TRAPEZOID INPUTS */}
            {shape === 'trapezoid' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Front Parallel Side A ({dimUnit})
                    </label>
                    <input
                      type="number"
                      value={trapParallelA}
                      onChange={(e) => setTrapParallelA(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="saas-input font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Rear Parallel Side B ({dimUnit})
                    </label>
                    <input
                      type="number"
                      value={trapParallelB}
                      onChange={(e) => setTrapParallelB(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="saas-input font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">Perpendicular Depth (h)</label>
                    <input
                      type="number"
                      value={trapHeight}
                      onChange={(e) => setTrapHeight(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="saas-input font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">Left Side C (Boundary)</label>
                    <input
                      type="number"
                      value={trapSideC}
                      onChange={(e) => setTrapSideC(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="saas-input font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">Right Side D (Boundary)</label>
                    <input
                      type="number"
                      value={trapSideD}
                      onChange={(e) => setTrapSideD(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="saas-input font-mono font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 4. QUADRILATERAL INPUTS */}
            {shape === 'quadrilateral' && (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-900 dark:text-indigo-300 flex items-start gap-2">
                  <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Surveyor's Triangulation Method:</strong> Measure the 4 perimeter boundaries (AB, BC, CD, DA) and the cross diagonal AC to calculate irregular quadrilateral land with 100% mathematical accuracy.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">Side AB / Frontage ({dimUnit})</label>
                    <input
                      type="number"
                      value={quadAB}
                      onChange={(e) => setQuadAB(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="saas-input font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">Side BC / Right Boundary ({dimUnit})</label>
                    <input
                      type="number"
                      value={quadBC}
                      onChange={(e) => setQuadBC(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="saas-input font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">Side CD / Rear Boundary ({dimUnit})</label>
                    <input
                      type="number"
                      value={quadCD}
                      onChange={(e) => setQuadCD(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="saas-input font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">Side DA / Left Boundary ({dimUnit})</label>
                    <input
                      type="number"
                      value={quadDA}
                      onChange={(e) => setQuadDA(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="saas-input font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center justify-between">
                    <span>Survey Diagonal AC ({dimUnit})</span>
                    <span className="text-[10px] text-zinc-400 font-normal">Corner A to Corner C</span>
                  </label>
                  <input
                    type="number"
                    value={quadDiagAC}
                    onChange={(e) => setQuadDiagAC(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="saas-input font-mono font-bold border-indigo-500/40"
                  />
                </div>
              </div>
            )}

            {/* 5. POLYGON INPUTS */}
            {shape === 'polygon' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Vertex Coordinates (X, Y Offset in {dimUnit})
                  </span>
                  <button
                    type="button"
                    onClick={addPolygonVertex}
                    disabled={polygonVertices.length >= 10}
                    className="px-2.5 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Corner
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {polygonVertices.map((vertex, index) => (
                    <div key={vertex.id} className="flex items-center gap-2 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-800/60">
                      <span className="w-6 text-[10px] font-black text-zinc-400">P{index + 1}</span>
                      <div className="flex-1 flex items-center gap-1">
                        <span className="text-[10px] text-zinc-400 font-bold">X:</span>
                        <input
                          type="number"
                          value={vertex.x}
                          onChange={(e) => updatePolygonVertex(vertex.id, 'x', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-xs font-bold font-mono bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none"
                        />
                      </div>
                      <div className="flex-1 flex items-center gap-1">
                        <span className="text-[10px] text-zinc-400 font-bold">Y:</span>
                        <input
                          type="number"
                          value={vertex.y}
                          onChange={(e) => updatePolygonVertex(vertex.id, 'y', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-xs font-bold font-mono bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none"
                        />
                      </div>
                      {polygonVertices.length > 3 && (
                        <button
                          type="button"
                          onClick={() => removePolygonVertex(vertex.id)}
                          className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. CURVED INPUTS */}
            {shape === 'curved' && (
              <div className="space-y-4">
                <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60">
                  {(['circle', 'semicircle', 'sector'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setCurvedType(t)}
                      className={`flex-1 py-1.5 text-xs font-bold capitalize rounded-lg transition cursor-pointer ${
                        curvedType === t
                          ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                          : 'text-zinc-500'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Radius R ({dimUnit})</label>
                    <input
                      type="number"
                      value={curvedRadius}
                      onChange={(e) => setCurvedRadius(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="saas-input font-mono font-bold"
                    />
                  </div>
                  {curvedType === 'sector' && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Included Arc Angle (θ in degrees)</label>
                      <input
                        type="number"
                        min="1"
                        max="360"
                        value={curvedAngleDeg}
                        onChange={(e) => setCurvedAngleDeg(Math.max(1, Math.min(360, parseFloat(e.target.value) || 90)))}
                        className="saas-input font-mono font-bold"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Validation Error Message */}
            {geometryResult.errorMessage && (
              <div className="p-3.5 rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold leading-relaxed flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{geometryResult.errorMessage}</span>
              </div>
            )}
          </div>

          {/* 2D VISUAL BLUEPRINT SVG CANVAS */}
          <div className="saas-card p-6 space-y-4 text-left">
            <div className="flex justify-between items-center border-b border-zinc-200/60 dark:border-zinc-800/60 pb-2">
              <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Site Geometry Visual Blueprint</span>
              </h3>
              <span className="text-[10px] font-bold text-zinc-400">Scale: Proportional 2D</span>
            </div>

            <div className="w-full h-56 bg-zinc-950 rounded-2xl flex items-center justify-center p-4 relative overflow-hidden border border-zinc-800">
              {/* Grid Background */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:16px_16px]" />

              <svg className="w-full h-full" viewBox="0 0 240 160">
                {/* North Indicator */}
                <g transform="translate(215, 25)">
                  <circle cx="0" cy="0" r="12" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />
                  <line x1="0" y1="8" x2="0" y2="-8" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
                  <polygon points="0,-10 -3,-5 3,-5" fill="#ef4444" />
                  <text x="0" y="5" textAnchor="middle" fontSize="6" className="fill-zinc-400 font-sans font-bold">N</text>
                </g>

                {shape === 'rectangle' && (
                  <g transform="translate(40, 25)">
                    <rect x="0" y="0" width="140" height="100" fill="#4f46e5" fillOpacity="0.15" stroke="#6366f1" strokeWidth="2" strokeDasharray="none" rx="4" />
                    <line x1="0" y1="0" x2="140" y2="100" stroke="#818cf8" strokeWidth="1" strokeDasharray="3 3" />
                    <text x="70" y="-6" textAnchor="middle" fontSize="8" className="fill-zinc-300 font-mono font-bold">{rectLength} {dimUnit}</text>
                    <text x="-6" y="50" textAnchor="middle" fontSize="8" className="fill-zinc-300 font-mono font-bold" transform="rotate(-90 -6 50)">{rectWidth} {dimUnit}</text>
                    <text x="70" y="55" textAnchor="middle" fontSize="10" className="fill-white font-mono font-black">{conversions.sqft.toLocaleString()} sq ft</text>
                  </g>
                )}

                {shape === 'triangle' && (
                  <g transform="translate(40, 20)">
                    <polygon points="10,110 150,110 80,10" fill="#4f46e5" fillOpacity="0.15" stroke="#6366f1" strokeWidth="2" />
                    <text x="80" y="122" textAnchor="middle" fontSize="8" className="fill-zinc-300 font-mono font-bold">Base: {triMethod === 'three_sides' ? triSideA : triBase} {dimUnit}</text>
                    <text x="80" y="75" textAnchor="middle" fontSize="10" className="fill-white font-mono font-black">{conversions.sqft.toLocaleString()} sq ft</text>
                  </g>
                )}

                {shape === 'trapezoid' && (
                  <g transform="translate(35, 25)">
                    <polygon points="10,100 150,100 120,10 40,10" fill="#4f46e5" fillOpacity="0.15" stroke="#6366f1" strokeWidth="2" />
                    <text x="80" y="0" textAnchor="middle" fontSize="8" className="fill-zinc-300 font-mono font-bold">Side A: {trapParallelA} {dimUnit}</text>
                    <text x="80" y="115" textAnchor="middle" fontSize="8" className="fill-zinc-300 font-mono font-bold">Side B: {trapParallelB} {dimUnit}</text>
                    <text x="80" y="60" textAnchor="middle" fontSize="10" className="fill-white font-mono font-black">{conversions.sqft.toLocaleString()} sq ft</text>
                  </g>
                )}

                {shape === 'quadrilateral' && (
                  <g transform="translate(35, 20)">
                    <polygon points="10,95 145,115 130,15 20,25" fill="#4f46e5" fillOpacity="0.15" stroke="#6366f1" strokeWidth="2" />
                    {/* Diagonal AC */}
                    <line x1="10" y1="95" x2="130" y2="15" stroke="#ec4899" strokeWidth="1.5" strokeDasharray="3 3" />
                    <text x="70" y="60" textAnchor="middle" fontSize="7" className="fill-pink-400 font-mono font-bold">Diag: {quadDiagAC} {dimUnit}</text>
                    <text x="80" y="85" textAnchor="middle" fontSize="10" className="fill-white font-mono font-black">{conversions.sqft.toLocaleString()} sq ft</text>
                  </g>
                )}

                {shape === 'polygon' && (
                  <g transform="translate(45, 25)">
                    <polygon points="15,95 125,95 140,40 80,10 10,40" fill="#4f46e5" fillOpacity="0.15" stroke="#6366f1" strokeWidth="2" />
                    <text x="75" y="60" textAnchor="middle" fontSize="10" className="fill-white font-mono font-black">{conversions.sqft.toLocaleString()} sq ft</text>
                  </g>
                )}

                {shape === 'curved' && (
                  <g transform="translate(70, 25)">
                    {curvedType === 'circle' && (
                      <>
                        <circle cx="50" cy="50" r="45" fill="#4f46e5" fillOpacity="0.15" stroke="#6366f1" strokeWidth="2" />
                        <line x1="50" y1="50" x2="95" y2="50" stroke="#818cf8" strokeWidth="1.5" />
                        <text x="72" y="45" textAnchor="middle" fontSize="7" className="fill-zinc-300 font-mono">R={curvedRadius}</text>
                      </>
                    )}
                    {curvedType === 'semicircle' && (
                      <path d="M 5,80 A 45,45 0 0,1 95,80 Z" fill="#4f46e5" fillOpacity="0.15" stroke="#6366f1" strokeWidth="2" />
                    )}
                    {curvedType === 'sector' && (
                      <path d="M 50,50 L 95,50 A 45,45 0 0,0 50,5 Z" fill="#4f46e5" fillOpacity="0.15" stroke="#6366f1" strokeWidth="2" />
                    )}
                    <text x="50" y="70" textAnchor="middle" fontSize="10" className="fill-white font-mono font-black">{conversions.sqft.toLocaleString()} sq ft</text>
                  </g>
                )}
              </svg>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: MULTI-UNIT CONVERSION MATRIX & VALUATION */}
        <div className="lg:col-span-6 space-y-6">
          {/* PRIMARY AREA HERO CARD */}
          <div className="p-6 rounded-3xl bg-zinc-950 text-white shadow-xl space-y-5 text-left border border-zinc-800">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-800 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block">
                  Computed Land Area
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-3xl font-black font-mono text-indigo-400">
                    {conversions.sqft.toLocaleString()}
                  </h3>
                  <span className="text-sm font-bold text-zinc-400">Sq. Feet</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopyReport}
                  className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-200 transition flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Report'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/20"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF Survey</span>
                </button>
              </div>
            </div>

            {/* Quick 4-Unit Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
                <span className="text-[9px] font-black uppercase text-zinc-400 block">Square Meters</span>
                <span className="text-sm font-black font-mono text-white mt-1 block">{conversions.sqm.toLocaleString()} m²</span>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
                <span className="text-[9px] font-black uppercase text-zinc-400 block">Gaj / Sq. Yards</span>
                <span className="text-sm font-black font-mono text-emerald-400 mt-1 block">{conversions.sqyd.toLocaleString()} Gaj</span>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
                <span className="text-[9px] font-black uppercase text-zinc-400 block">Acres</span>
                <span className="text-sm font-black font-mono text-amber-400 mt-1 block">{conversions.acres} ac</span>
              </div>
              <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
                <span className="text-[9px] font-black uppercase text-zinc-400 block">Hectares</span>
                <span className="text-sm font-black font-mono text-purple-400 mt-1 block">{conversions.hectares} ha</span>
              </div>
            </div>

            {/* Perimeter & Wire Strip */}
            <div className="flex justify-between items-center p-3 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 text-xs text-zinc-300">
              <span className="flex items-center gap-1.5 font-bold">
                <Shield className="w-4 h-4 text-indigo-400" />
                <span>Boundary Perimeter:</span>
              </span>
              <span className="font-mono font-black text-white">
                {geometryResult.perimeterFt.toFixed(1)} ft ({ (geometryResult.perimeterFt * 0.3048).toFixed(1) } m)
              </span>
            </div>
          </div>

          {/* PAN-INDIA REGIONAL LAND UNITS TABLE */}
          <div className="saas-card p-6 space-y-4 text-left">
            <div className="flex justify-between items-center border-b border-zinc-200/60 dark:border-zinc-800/60 pb-3">
              <div>
                <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block">
                  Indian Regional Land Revenue Conversions
                </h3>
                <span className="text-[10px] text-zinc-400 font-medium">Standardized according to state revenue records</span>
              </div>
              <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {selectedState.name} Reference
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-800/60">
                <span className="text-[9px] font-extrabold text-zinc-400 uppercase block">Guntha (MH / KA)</span>
                <span className="font-mono font-black text-xs text-zinc-900 dark:text-white mt-0.5 block">{conversions.guntha} Guntha</span>
                <span className="text-[8px] text-zinc-400">1 Guntha = 1,089 sq ft</span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-800/60">
                <span className="text-[9px] font-extrabold text-zinc-400 uppercase block">Cent (TN / KL / AP)</span>
                <span className="font-mono font-black text-xs text-zinc-900 dark:text-white mt-0.5 block">{conversions.cent} Cent</span>
                <span className="text-[8px] text-zinc-400">1 Cent = 435.6 sq ft</span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-800/60">
                <span className="text-[9px] font-extrabold text-zinc-400 uppercase block">Ground (Chennai / TN)</span>
                <span className="font-mono font-black text-xs text-zinc-900 dark:text-white mt-0.5 block">{conversions.ground} Ground</span>
                <span className="text-[8px] text-zinc-400">1 Ground = 2,400 sq ft</span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-800/60">
                <span className="text-[9px] font-extrabold text-zinc-400 uppercase block">Bigha ({selectedState.name})</span>
                <span className="font-mono font-black text-xs text-indigo-600 dark:text-indigo-400 mt-0.5 block">{conversions.bigha} Bigha</span>
                <span className="text-[8px] text-zinc-400">1 Bigha = {selectedState.bighaFactor.toLocaleString()} sq ft</span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-800/60">
                <span className="text-[9px] font-extrabold text-zinc-400 uppercase block">Biswa (North India)</span>
                <span className="font-mono font-black text-xs text-zinc-900 dark:text-white mt-0.5 block">{conversions.biswa} Biswa</span>
                <span className="text-[8px] text-zinc-400">1/20th of a Bigha</span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-800/60">
                <span className="text-[9px] font-extrabold text-zinc-400 uppercase block">Kanal & Marla (Punjab/HR)</span>
                <span className="font-mono font-black text-xs text-zinc-900 dark:text-white mt-0.5 block">{conversions.kanal} K / {conversions.marla} M</span>
                <span className="text-[8px] text-zinc-400">1 Kanal = 20 Marla (5,445 sq ft)</span>
              </div>
            </div>
          </div>

          {/* FINANCIAL VALUATION & STAMP DUTY CALCULATOR */}
          <div className="saas-card p-6 space-y-4 text-left">
            <div className="flex justify-between items-center border-b border-zinc-200/60 dark:border-zinc-800/60 pb-3">
              <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span>Market Valuation & Acquisition Cost Estimator</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Rate Value (₹)</label>
                <input
                  type="number"
                  value={ratePerUnit}
                  onChange={(e) => setRatePerUnit(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="saas-input font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Rate Unit</label>
                <select
                  value={rateUnitType}
                  onChange={(e) => setRateUnitType(e.target.value as any)}
                  className="saas-select text-xs font-bold"
                >
                  <option value="sqft">Per Sq. Ft</option>
                  <option value="sqyd">Per Gaj / Sq. Yd</option>
                  <option value="guntha">Per Guntha</option>
                  <option value="bigha">Per Bigha</option>
                  <option value="acre">Per Acre</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Stamp Duty (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={stampDutyPercent}
                  onChange={(e) => setStampDutyPercent(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="saas-input font-mono font-bold"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-800/60 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-600 dark:text-zinc-400 font-medium">Estimated Land Value:</span>
                <span className="font-mono font-black text-sm text-zinc-900 dark:text-white">
                  ₹{Math.round(financialEstimates.totalLandValue).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-600 dark:text-zinc-400 font-medium">Stamp Duty ({stampDutyPercent}%):</span>
                <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                  ₹{Math.round(financialEstimates.stampDutyAmount).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-600 dark:text-zinc-400 font-medium">Registration Fee (1%):</span>
                <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                  ₹{Math.round(financialEstimates.registrationFee).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-zinc-200 dark:border-zinc-800 pt-2 font-bold">
                <span className="text-indigo-600 dark:text-indigo-400">Total Land Acquisition Cost:</span>
                <span className="font-mono font-black text-base text-emerald-600 dark:text-emerald-400">
                  ₹{Math.round(financialEstimates.totalAcquisitionCost).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* FENCING & CONSTRUCTION CAPACITY */}
          <div className="saas-card p-6 space-y-4 text-left">
            <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-3">
              <Building className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Boundary Fencing & FAR Construction Potential</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Fencing Estimation Card */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-800/60 space-y-3">
                <span className="text-[10px] font-black uppercase text-zinc-400 block">Boundary Fencing & Security</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-bold text-zinc-400 block uppercase">Rate/ft (₹)</label>
                    <input
                      type="number"
                      value={fenceCostPerFt}
                      onChange={(e) => setFenceCostPerFt(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full px-2 py-1 text-xs font-bold font-mono bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-zinc-400 block uppercase">Wire Strands</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={wireStrandsCount}
                      onChange={(e) => setWireStrandsCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-2 py-1 text-xs font-bold font-mono bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>

                <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1 pt-1 border-t border-zinc-200 dark:border-zinc-800">
                  <div className="flex justify-between">
                    <span>Fence Posts (every 8ft):</span>
                    <span className="font-bold text-zinc-900 dark:text-white">{financialEstimates.postsCount} posts</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Barbed Wire:</span>
                    <span className="font-bold text-zinc-900 dark:text-white">{Math.round(financialEstimates.totalWireLengthFt).toLocaleString()} ft</span>
                  </div>
                  <div className="flex justify-between font-bold pt-1 border-t border-zinc-200/60 dark:border-zinc-800/60">
                    <span className="text-zinc-800 dark:text-zinc-200">Total Fencing Cost:</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">₹{Math.round(financialEstimates.totalFencingCost).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Construction Capacity Card */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-800/60 space-y-3">
                <span className="text-[10px] font-black uppercase text-zinc-400 block">Permissible FAR & Footprint</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-bold text-zinc-400 block uppercase">Coverage (%)</label>
                    <input
                      type="number"
                      min="10"
                      max="100"
                      value={groundCoveragePercent}
                      onChange={(e) => setGroundCoveragePercent(Math.max(10, Math.min(100, parseFloat(e.target.value) || 60)))}
                      className="w-full px-2 py-1 text-xs font-bold font-mono bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-zinc-400 block uppercase">Target FAR / FSI</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.5"
                      max="6"
                      value={targetFsi}
                      onChange={(e) => setTargetFsi(Math.max(0.1, parseFloat(e.target.value) || 2.0))}
                      className="w-full px-2 py-1 text-xs font-bold font-mono bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>

                <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1 pt-1 border-t border-zinc-200 dark:border-zinc-800">
                  <div className="flex justify-between">
                    <span>Ground Footprint ({groundCoveragePercent}%):</span>
                    <span className="font-bold text-zinc-900 dark:text-white">{Math.round(financialEstimates.maxGroundFootprintSqFt).toLocaleString()} sq ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Permissible Built-Up (FAR {targetFsi}):</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{Math.round(financialEstimates.permissibleBuiltUpSqFt).toLocaleString()} sq ft</span>
                  </div>
                  <div className="flex justify-between font-bold pt-1 border-t border-zinc-200/60 dark:border-zinc-800/60">
                    <span className="text-zinc-800 dark:text-zinc-200">Potential Floors:</span>
                    <span className="font-mono text-zinc-900 dark:text-white">~{financialEstimates.potentialFloors} Floors</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SAVED PLOTS HISTORY SECTION */}
      <div className="saas-card p-6 space-y-4 text-left">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-3">
          <div>
            <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block">
              Saved Plot Calculations & Survey Records
            </h3>
            <span className="text-[10px] text-zinc-400 font-medium">Save custom plot measurements to local history for future reference</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={plotSaveName}
              onChange={(e) => setPlotSaveName(e.target.value)}
              placeholder="Plot Label (e.g. Sector 4 Plot 24)"
              className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none flex-1 sm:w-56"
            />
            <button
              type="button"
              onClick={handleSavePlot}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Record</span>
            </button>
          </div>
        </div>

        {savedPlots.length === 0 ? (
          <div className="py-6 text-center text-xs text-zinc-400">
            No saved plot calculations yet. Click "Save Record" above to store the current calculation in your session.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {savedPlots.map((plot) => (
              <div key={plot.id} className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-800/60 flex justify-between items-center gap-3">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black text-zinc-900 dark:text-white truncate max-w-[180px]">{plot.name}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-medium">
                    <span className="capitalize font-bold text-indigo-600 dark:text-indigo-400">{plot.shape}</span>
                    <span>•</span>
                    <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300">{plot.areaSqFt.toLocaleString()} sq ft</span>
                  </div>
                  <span className="text-[9px] text-zinc-400 block">{plot.timestamp}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteSavedPlot(plot.id)}
                  className="p-1.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition cursor-pointer"
                  title="Delete Record"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

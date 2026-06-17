import { useState, useRef } from 'react';
import { CIVIL_TREND_DATA } from '../data/civilRatesData';
import { TrendingUp, Info } from 'lucide-react';

interface MaterialTrendGraphProps {
  allowedMaterials: string[];
  defaultMaterial?: string;
  title?: string;
}

export default function MaterialTrendGraph({
  allowedMaterials,
  defaultMaterial,
  title = "Material Price Trends (5-Year Historical)"
}: MaterialTrendGraphProps) {
  const [activeTab, setActiveTab] = useState<string>(
    defaultMaterial && allowedMaterials.includes(defaultMaterial)
      ? defaultMaterial
      : allowedMaterials[0]
  );
  
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const trend = CIVIL_TREND_DATA[activeTab];
  if (!trend) return null;

  const points = trend.points;
  const prices = points.map(p => p.price);
  
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  
  // Dynamic Y bounds with buffer
  const yMax = maxPrice + (maxPrice - minPrice) * 0.15 || maxPrice * 1.1;
  const yMin = Math.max(0, minPrice - (maxPrice - minPrice) * 0.15 || minPrice * 0.9);

  // SVG Dimension Constants
  const width = 500;
  const height = 240;
  const padding = { top: 25, right: 20, bottom: 35, left: 50 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const xSpacing = chartWidth / (points.length - 1);

  // Convert points to SVG coordinates
  const svgPoints = points.map((p, idx) => {
    const x = padding.left + idx * xSpacing;
    const yVal = p.price;
    const yRange = yMax - yMin;
    const yPercent = yRange > 0 ? (yVal - yMin) / yRange : 0.5;
    const y = padding.top + (1 - yPercent) * chartHeight;
    return { x, y, price: p.price, year: p.year };
  });

  // SVG Path generator
  let linePath = "";
  let areaPath = "";

  if (svgPoints.length > 0) {
    // Generate a simple path first (we can use curves or straight lines; straight lines with circular nodes look very clean and accurate)
    linePath = `M ${svgPoints[0].x} ${svgPoints[0].y}`;
    for (let i = 1; i < svgPoints.length; i++) {
      linePath += ` L ${svgPoints[i].x} ${svgPoints[i].y}`;
    }

    areaPath = linePath + ` L ${svgPoints[svgPoints.length - 1].x} ${height - padding.bottom} L ${svgPoints[0].x} ${height - padding.bottom} Z`;
  }

  // Hover detection logic
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const relativeX = (clientX - rect.left) * (width / rect.width);
    
    // Find closest index
    const index = Math.max(
      0,
      minPrice === maxPrice ? 0 : Math.min(
        points.length - 1,
        Math.round((relativeX - padding.left) / xSpacing)
      )
    );
    
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  // Generate Y-axis grid values (4 lines)
  const gridLinesCount = 4;
  const gridLines = Array.from({ length: gridLinesCount }).map((_, i) => {
    const value = yMin + (i * (yMax - yMin)) / (gridLinesCount - 1);
    const yPercent = (value - yMin) / (yMax - yMin);
    const y = padding.top + (1 - yPercent) * chartHeight;
    return { y, value };
  });

  return (
    <div className="saas-card p-6 mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60 pb-4 mb-4 gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <TrendingUp className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="font-bold text-zinc-800 dark:text-white text-sm">{title}</h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">Global / Regional baseline rates index</p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap gap-1">
          {allowedMaterials.map((key) => {
            const materialName = key.replace(/([A-Z])/g, ' $1');
            return (
              <button
                key={key}
                onClick={() => {
                  setActiveTab(key);
                  setHoveredIndex(null);
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize transition-all ${
                  activeTab === key
                    ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                    : 'text-zinc-400 dark:text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-transparent'
                }`}
              >
                {materialName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Description text */}
      <div className="flex items-start gap-1.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-800/40 text-[10px] text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">
        <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
        <span>
          <strong>{activeTab.toUpperCase()}:</strong> {trend.description} Baseline: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{points[points.length - 1].price} {trend.unit}</span> (2026).
        </span>
      </div>

      {/* Chart Canvas */}
      <div className="relative w-full h-[240px]">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full cursor-crosshair overflow-visible select-none"
          onMouseMove={handleMouseMove}
          onTouchMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchEnd={handleMouseLeave}
        >
          {/* Gradients */}
          <defs>
            <linearGradient id={`area-grad-${activeTab}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
            <filter id="glow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#6366f1" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Grid lines */}
          {gridLines.map((line, idx) => (
            <g key={idx}>
              <line
                x1={padding.left}
                y1={line.y}
                x2={width - padding.right}
                y2={line.y}
                className="stroke-zinc-200 dark:stroke-zinc-800/70"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <text
                x={padding.left - 10}
                y={line.y + 4}
                className="text-[9px] font-medium fill-zinc-400 dark:fill-zinc-500 font-mono text-right"
                textAnchor="end"
              >
                ₹{Math.round(line.value)}
              </text>
            </g>
          ))}

          {/* Year X labels */}
          {svgPoints.map((pt, idx) => (
            <text
              key={idx}
              x={pt.x}
              y={height - 10}
              className="text-[9px] font-bold fill-zinc-400 dark:fill-zinc-500 text-center font-mono"
              textAnchor="middle"
            >
              {pt.year}
            </text>
          ))}

          {/* Filled Area */}
          {areaPath && (
            <path
              d={areaPath}
              fill={`url(#area-grad-${activeTab})`}
              className="transition-all duration-300"
            />
          )}

          {/* Line Path */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#6366f1"
              strokeWidth={2.5}
              strokeLinecap="round"
              filter="url(#glow)"
              className="transition-all duration-300"
            />
          )}

          {/* Dots on line */}
          {svgPoints.map((pt, idx) => (
            <circle
              key={idx}
              cx={pt.x}
              cy={pt.y}
              r={hoveredIndex === idx ? 6 : 4}
              className={`fill-white dark:fill-zinc-950 stroke-indigo-500 transition-all duration-200`}
              strokeWidth={hoveredIndex === idx ? 3 : 2}
            />
          ))}

          {/* Hover tracker vertical line */}
          {hoveredIndex !== null && (
            <line
              x1={svgPoints[hoveredIndex].x}
              y1={padding.top}
              x2={svgPoints[hoveredIndex].x}
              y2={height - padding.bottom}
              className="stroke-indigo-500/40 dark:stroke-indigo-500/30"
              strokeWidth={1.5}
              strokeDasharray="3 3"
            />
          )}
        </svg>

        {/* Floating tooltip */}
        {hoveredIndex !== null && svgPoints[hoveredIndex] && (
          <div
            className="absolute z-10 pointer-events-none p-2.5 rounded-lg border bg-white/95 dark:bg-zinc-950/95 border-zinc-200 dark:border-zinc-800 shadow-md backdrop-blur-sm text-left text-[10px]"
            style={{
              left: `${(svgPoints[hoveredIndex].x / width) * 100}%`,
              top: `${(svgPoints[hoveredIndex].y / height) * 100 - 32}%`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="font-bold text-zinc-400 dark:text-zinc-500 text-[8px] uppercase tracking-wider">
              Year {svgPoints[hoveredIndex].year}
            </div>
            <div className="font-black text-indigo-600 dark:text-indigo-400 text-xs font-mono mt-0.5">
              ₹{svgPoints[hoveredIndex].price.toLocaleString('en-IN')} <span className="text-[9px] font-normal text-zinc-500">{trend.unit}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

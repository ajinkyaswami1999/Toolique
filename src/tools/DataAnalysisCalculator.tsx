import { useState, useMemo, useRef } from 'react';
import { calculateLinearRegression, detectOutliers } from '../utils/mathCalc';

export default function DataAnalysisCalculator() {
  const [csvText, setCsvText] = useState<string>(
    "X, Y\n1, 2.1\n2, 3.9\n3, 6.1\n4, 8.0\n5, 10.2\n6, 11.8\n7, 14.2\n8, 16.5"
  );
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse CSV text into arrays of columns
  const parsedData = useMemo(() => {
    const lines = csvText.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) return null;

    // Detect separator (comma, semicolon, or tab)
    const headerLine = lines[0];
    let sep = ',';
    if (headerLine.includes('\t')) sep = '\t';
    else if (headerLine.includes(';')) sep = ';';

    const headers = headerLine.split(sep).map(h => h.trim());
    const rows: Record<string, number>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(sep);
      const row: Record<string, number> = {};
      let hasValidNum = false;
      headers.forEach((h, idx) => {
        const val = parseFloat(parts[idx]);
        row[h] = isNaN(val) ? 0 : val;
        if (!isNaN(val)) hasValidNum = true;
      });
      if (hasValidNum) rows.push(row);
    }

    return { headers, rows };
  }, [csvText]);

  // Select X and Y column keys
  const [colX, setColX] = useState<string>('');
  const [colY, setColY] = useState<string>('');

  // Auto select default columns on load/change
  useMemo(() => {
    if (parsedData && parsedData.headers.length >= 2) {
      if (!parsedData.headers.includes(colX)) setColX(parsedData.headers[0]);
      if (!parsedData.headers.includes(colY)) setColY(parsedData.headers[1]);
    }
  }, [parsedData]);

  // Extract numeric arrays for calculation
  const dataSeries = useMemo(() => {
    if (!parsedData || !colX || !colY) return null;
    const x: number[] = [];
    const y: number[] = [];
    parsedData.rows.forEach(row => {
      x.push(row[colX]);
      y.push(row[colY]);
    });
    return { x, y };
  }, [parsedData, colX, colY]);

  // Regression & Outlier calculations
  const analysisResult = useMemo(() => {
    if (!dataSeries || dataSeries.x.length < 2) return null;
    const reg = calculateLinearRegression(dataSeries.x, dataSeries.y);
    const outliersX = detectOutliers(dataSeries.x);
    const outliersY = detectOutliers(dataSeries.y);

    return {
      regression: reg,
      outliersX,
      outliersY
    };
  }, [dataSeries]);

  // Handle local CSV file uploads
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) setCsvText(text);
    };
    reader.readAsText(file);
  };

  // SVG Scatter plot details
  const svgWidth = 400;
  const svgHeight = 250;
  const padding = 35;

  const scatterSVG = useMemo(() => {
    if (!dataSeries || dataSeries.x.length === 0 || !analysisResult) return null;

    const xs = dataSeries.x;
    const ys = dataSeries.y;

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const rangeX = maxX - minX === 0 ? 1 : maxX - minX;
    const rangeY = maxY - minY === 0 ? 1 : maxY - minY;

    const mapX = (xVal: number) => {
      const pct = (xVal - minX) / rangeX;
      return padding + pct * (svgWidth - 2 * padding);
    };

    const mapY = (yVal: number) => {
      const pct = (yVal - minY) / rangeY;
      return svgHeight - padding - pct * (svgHeight - 2 * padding);
    };

    // Regression Line endpoints
    const reg = analysisResult.regression;
    const startX = minX;
    const startY = reg.slope * startX + reg.intercept;
    const endX = maxX;
    const endY = reg.slope * endX + reg.intercept;

    return (
      <svg
        width="100%"
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="border border-zinc-150 dark:border-zinc-850 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20"
      >
        {/* Axes lines */}
        <line
          x1={padding}
          y1={svgHeight - padding}
          x2={svgWidth - padding}
          y2={svgHeight - padding}
          stroke="currentColor"
          className="text-zinc-300 dark:text-zinc-700"
          strokeWidth="1.5"
        />
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={svgHeight - padding}
          stroke="currentColor"
          className="text-zinc-300 dark:text-zinc-700"
          strokeWidth="1.5"
        />

        {/* Labels */}
        <text x={svgWidth / 2} y={svgHeight - 6} textAnchor="middle" className="text-[9px] fill-zinc-400 font-mono">
          {colX}
        </text>
        <text
          x={12}
          y={svgHeight / 2}
          textAnchor="middle"
          className="text-[9px] fill-zinc-400 font-mono"
          transform={`rotate(-90, 12, ${svgHeight / 2})`}
        >
          {colY}
        </text>

        {/* Regression Line */}
        <line
          x1={mapX(startX)}
          y1={mapY(startY)}
          x2={mapX(endX)}
          y2={mapY(endY)}
          stroke="#6366f1"
          strokeWidth="2.5"
          strokeDasharray="4 4"
        />

        {/* Plot scatter points */}
        {xs.map((xVal, idx) => {
          const yVal = ys[idx];
          const isOutlier =
            analysisResult.outliersX.includes(xVal) ||
            analysisResult.outliersY.includes(yVal);

          return (
            <circle
              key={`pt-${idx}`}
              cx={mapX(xVal)}
              cy={mapY(yVal)}
              r={isOutlier ? "5" : "4.5"}
              className={`${
                isOutlier 
                  ? "fill-rose-500 stroke-white dark:stroke-zinc-950" 
                  : "fill-indigo-500 stroke-white dark:stroke-zinc-950"
              }`}
              strokeWidth="1.5"
            />
          );
        })}
      </svg>
    );
  }, [dataSeries, analysisResult, colX, colY]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Inputs Form */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
              Spreadsheet CSV Source
            </h3>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-indigo-650 hover:underline font-bold"
            >
              Upload CSV File
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv"
              className="hidden"
            />
          </div>
          <textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            rows={8}
            placeholder="HeaderX, HeaderY\n1, 2.5..."
            className="w-full p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 font-mono text-xs text-zinc-950 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 mb-3"
          />

          {parsedData && parsedData.headers.length >= 2 && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  X Column
                </label>
                <select
                  value={colX}
                  onChange={(e) => setColX(e.target.value)}
                  className="w-full text-xs bg-zinc-50 border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-850 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100"
                >
                  {parsedData.headers.map(h => (
                    <option key={`optX-${h}`} value={h}>{h}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Y Column
                </label>
                <select
                  value={colY}
                  onChange={(e) => setColY(e.target.value)}
                  className="w-full text-xs bg-zinc-50 border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-850 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100"
                >
                  {parsedData.headers.map(h => (
                    <option key={`optY-${h}`} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {analysisResult && (
          <div className="bg-zinc-900 dark:bg-zinc-950 text-white rounded-2xl p-6 shadow-md border border-zinc-800 space-y-3">
            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Regression Analytics
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between border-b border-zinc-850 pb-1 text-xs">
                <span className="text-zinc-400">Formula:</span>
                <span className="font-bold text-emerald-450 font-mono">
                  y = {analysisResult.regression.slope.toFixed(3)}x + {analysisResult.regression.intercept.toFixed(3)}
                </span>
              </div>
              <div className="flex justify-between border-b border-zinc-850 pb-1 text-xs">
                <span className="text-zinc-400">Correlation (R):</span>
                <span className="font-bold font-mono">{analysisResult.regression.r.toFixed(4)}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-850 pb-1 text-xs">
                <span className="text-zinc-400">Determinant R²:</span>
                <span className="font-bold font-mono">{analysisResult.regression.r2.toFixed(4)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Visual Analytics Column */}
      <div className="lg:col-span-7 space-y-6">
        {analysisResult ? (
          <>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Correlation Scatter Plot & Trendline
              </h4>
              {scatterSVG}
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Detected Outliers (IQR Method)
              </h4>
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 rounded-xl">
                  <div className="text-[10px] text-zinc-450 uppercase mb-1 font-bold">X Outliers</div>
                  <div className="text-zinc-700 dark:text-zinc-300">
                    {analysisResult.outliersX.length > 0 
                      ? analysisResult.outliersX.join(', ') 
                      : 'No Outliers Detected'}
                  </div>
                </div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 rounded-xl">
                  <div className="text-[10px] text-zinc-450 uppercase mb-1 font-bold">Y Outliers</div>
                  <div className="text-zinc-700 dark:text-zinc-300">
                    {analysisResult.outliersY.length > 0 
                      ? analysisResult.outliersY.join(', ') 
                      : 'No Outliers Detected'}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 shadow-sm text-center text-zinc-400 dark:text-zinc-500 text-sm">
            Please paste valid rows of spreadsheet data to view scatter plots and correlation parameters.
          </div>
        )}
      </div>
    </div>
  );
}

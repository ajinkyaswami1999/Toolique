import { useState, useMemo } from 'react';
import { ArrowLeft, RotateCcw, Copy, Compass } from 'lucide-react';
import SEO from '../components/SEO';

export default function VectorCalculator() {
  const [dimensions, setDimensions] = useState<2 | 3>(2);
  
  // Vector U inputs
  const [u1, setU1] = useState<string>('4');
  const [u2, setU2] = useState<string>('3');
  const [u3, setU3] = useState<string>('0');

  // Vector V inputs
  const [v1, setV1] = useState<string>('2');
  const [v2, setV2] = useState<string>('-1');
  const [v3, setV3] = useState<string>('5');

  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = () => {
    setDimensions(2);
    setU1('4');
    setU2('3');
    setU3('0');
    setV1('2');
    setV2('-1');
    setV3('5');
    setError(null);
  };

  const results = useMemo(() => {
    setError(null);
    try {
      const ux = parseFloat(u1) || 0;
      const uy = parseFloat(u2) || 0;
      const uz = dimensions === 3 ? (parseFloat(u3) || 0) : 0;

      const vx = parseFloat(v1) || 0;
      const vy = parseFloat(v2) || 0;
      const vz = dimensions === 3 ? (parseFloat(v3) || 0) : 0;

      const u = [ux, uy, uz];
      const v = [vx, vy, vz];

      // Magnitudes
      const magU = Math.sqrt(ux*ux + uy*uy + uz*uz);
      const magV = Math.sqrt(vx*vx + vy*vy + vz*vz);

      // Dot Product
      const dot = ux*vx + uy*vy + uz*vz;

      // Angle
      let angleRad = 0;
      let angleDeg = 0;
      if (magU > 0 && magV > 0) {
        const cosTheta = Math.max(-1, Math.min(1, dot / (magU * magV)));
        angleRad = Math.acos(cosTheta);
        angleDeg = (angleRad * 180) / Math.PI;
      }

      // Projection of U onto V: ((u.v) / |v|^2) * v
      let projUonV = [0, 0, 0];
      if (magV > 0) {
        const factor = dot / (magV * magV);
        projUonV = [vx * factor, vy * factor, vz * factor];
      }

      // Cross Product (Only 3D mathematically meaningful)
      const cross = [
        uy * vz - uz * vy,
        uz * vx - ux * vz,
        ux * vy - uy * vx
      ];

      // Sum and Difference
      const sum = [ux + vx, uy + vy, uz + vz];
      const diff = [ux - vx, uy - vy, uz - vz];

      return {
        u,
        v,
        magU,
        magV,
        dot,
        angleRad,
        angleDeg,
        projUonV,
        cross,
        sum,
        diff
      };
    } catch (e: any) {
      setError('Invalid coordinates inputted.');
      return null;
    }
  }, [dimensions, u1, u2, u3, v1, v2, v3]);

  const handleCopy = () => {
    if (!results) return;
    const text = `Vector U: [${results.u.slice(0, dimensions).join(', ')}]
Vector V: [${results.v.slice(0, dimensions).join(', ')}]
Dot Product: ${results.dot.toFixed(4)}
Angle: ${results.angleDeg.toFixed(1)}°
U + V: [${results.sum.slice(0, dimensions).join(', ')}]
U - V: [${results.diff.slice(0, dimensions).join(', ')}]`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // SVGs layout (Only for 2D vectors)
  const svgWidth = 350;
  const svgHeight = 250;
  const originX = svgWidth / 2;
  const originY = svgHeight / 2;

  const scale = useMemo(() => {
    if (!results) return 20;
    const vals = [
      Math.abs(results.u[0]), Math.abs(results.u[1]),
      Math.abs(results.v[0]), Math.abs(results.v[1]),
      Math.abs(results.projUonV[0]), Math.abs(results.projUonV[1]),
      Math.abs(results.sum[0]), Math.abs(results.sum[1])
    ];
    const maxVal = Math.max(...vals, 1);
    return Math.min(80, (svgHeight / 2 - 30) / maxVal);
  }, [results]);

  const mapX = (val: number) => originX + val * scale;
  const mapY = (val: number) => originY - val * scale;

  return (
    <>
      <SEO
        title="2D & 3D Vector Calculator | Vector Angle & Projection Solver"
        description="Solve 2D and 3D vector algebra. Calculates magnitude, dot product, cross product, projections, and angles with visual plane representations."
        keywords={['vector calculator', 'dot product solver', 'cross product calculator', 'vector projection', 'angle between vectors']}
      />

      {/* Breadcrumbs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-4 mb-6">
        <a
          href="/math-studio"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-indigo-500 dark:text-zinc-400 dark:hover:text-indigo-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Math Studio</span>
        </a>
        <div className="text-xs text-zinc-450 dark:text-zinc-500 font-semibold flex items-center gap-1.5">
          <a href="/" className="hover:text-indigo-500 transition-colors">Home</a>
          <span className="text-zinc-350 dark:text-zinc-700">&gt;</span>
          <a href="/math-studio" className="hover:text-indigo-500 transition-colors">Math Studio</a>
          <span className="text-zinc-350 dark:text-zinc-700">&gt;</span>
          <span className="text-zinc-650 dark:text-zinc-300 font-medium">Vector Calculator</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-650 dark:text-indigo-400">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white">
              Vector Calculator (2D / 3D)
            </h1>
            <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-0.5">
              Solve vector magnitudes, inner dot products, outer cross products, orthogonal projections, and angles.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          {/* Inputs Section */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
              {/* Dimensions choice */}
              <div>
                <label className="block text-xs font-bold text-zinc-450 uppercase tracking-wider mb-2">
                  System Dimension
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDimensions(2)}
                    className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl border transition ${
                      dimensions === 2
                        ? 'border-indigo-650 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-450 hover:bg-zinc-50'
                    }`}
                  >
                    2D Vectors (x, y)
                  </button>
                  <button
                    onClick={() => setDimensions(3)}
                    className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl border transition ${
                      dimensions === 3
                        ? 'border-indigo-650 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-450 hover:bg-zinc-50'
                    }`}
                  >
                    3D Vectors (x, y, z)
                  </button>
                </div>
              </div>

              {/* Vector U Coordinate Inputs */}
              <div>
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block mb-2">
                  Vector U Coordinates
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">Ux</label>
                    <input
                      type="number"
                      step="any"
                      value={u1}
                      onChange={(e) => setU1(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-xs font-mono text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">Uy</label>
                    <input
                      type="number"
                      step="any"
                      value={u2}
                      onChange={(e) => setU2(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-xs font-mono text-center"
                    />
                  </div>
                  {dimensions === 3 && (
                    <div>
                      <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">Uz</label>
                      <input
                        type="number"
                        step="any"
                        value={u3}
                        onChange={(e) => setU3(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-xs font-mono text-center"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Vector V Coordinate Inputs */}
              <div>
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block mb-2">
                  Vector V Coordinates
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">Vx</label>
                    <input
                      type="number"
                      step="any"
                      value={v1}
                      onChange={(e) => setV1(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-xs font-mono text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">Vy</label>
                    <input
                      type="number"
                      step="any"
                      value={v2}
                      onChange={(e) => setV2(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-xs font-mono text-center"
                    />
                  </div>
                  {dimensions === 3 && (
                    <div>
                      <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">Vz</label>
                      <input
                        type="number"
                        step="any"
                        value={v3}
                        onChange={(e) => setV3(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-xs font-mono text-center"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleReset}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 text-xs font-bold text-zinc-600 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/20 text-rose-600 dark:text-rose-455 text-xs font-semibold">
                {error}
              </div>
            )}
          </div>

          {/* Right Column: Graphs & Algebraic results details */}
          <div className="lg:col-span-7 space-y-6">
            {/* Visual Vector Map (2D systems only) */}
            {dimensions === 2 && results && (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                <h4 className="text-xs font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider mb-4 flex items-center justify-between">
                  <span>Vector Coordinate Map</span>
                  <span className="flex gap-4 text-[9px] font-bold">
                    <span className="flex items-center gap-1 text-indigo-500">
                      <span className="w-2.5 h-0.5 bg-indigo-500 inline-block" /> U
                    </span>
                    <span className="flex items-center gap-1 text-purple-400">
                      <span className="w-2.5 h-0.5 bg-purple-400 inline-block" /> V
                    </span>
                    <span className="flex items-center gap-1 text-emerald-500">
                      <span className="w-2.5 h-0.5 bg-emerald-500 inline-block" /> Proj_V(U)
                    </span>
                  </span>
                </h4>
                <div className="flex items-center justify-center">
                  <svg
                    width="100%"
                    height={svgHeight}
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    className="border border-zinc-100 dark:border-zinc-850 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20"
                  >
                    {/* Grid axes */}
                    <line x1={0} y1={originY} x2={svgWidth} y2={originY} stroke="currentColor" className="text-zinc-300 dark:text-zinc-850" strokeWidth={1} />
                    <line x1={originX} y1={0} x2={originX} y2={svgHeight} stroke="currentColor" className="text-zinc-300 dark:text-zinc-850" strokeWidth={1} />

                    {/* Vector U */}
                    <line
                      x1={originX}
                      y1={originY}
                      x2={mapX(results.u[0])}
                      y2={mapY(results.u[1])}
                      stroke="#6366f1"
                      strokeWidth={2}
                      markerEnd="url(#arrow-indigo)"
                    />
                    <circle cx={mapX(results.u[0])} cy={mapY(results.u[1])} r={2.5} className="fill-indigo-650" />
                    <text x={mapX(results.u[0]) + 5} y={mapY(results.u[1]) - 5} className="text-[9px] font-mono font-bold fill-indigo-600 dark:fill-indigo-400">U</text>

                    {/* Vector V */}
                    <line
                      x1={originX}
                      y1={originY}
                      x2={mapX(results.v[0])}
                      y2={mapY(results.v[1])}
                      stroke="#c084fc"
                      strokeWidth={2}
                      markerEnd="url(#arrow-purple)"
                    />
                    <circle cx={mapX(results.v[0])} cy={mapY(results.v[1])} r={2.5} className="fill-purple-500" />
                    <text x={mapX(results.v[0]) + 5} y={mapY(results.v[1]) - 5} className="text-[9px] font-mono font-bold fill-purple-600 dark:fill-purple-400">V</text>

                    {/* Projection Vector */}
                    <line
                      x1={originX}
                      y1={originY}
                      x2={mapX(results.projUonV[0])}
                      y2={mapY(results.projUonV[1])}
                      stroke="#10b981"
                      strokeWidth={2}
                      markerEnd="url(#arrow-emerald)"
                    />
                    {/* Dashed projection line from U endpoint to Projection endpoint */}
                    <line
                      x1={mapX(results.u[0])}
                      y1={mapY(results.u[1])}
                      x2={mapX(results.projUonV[0])}
                      y2={mapY(results.projUonV[1])}
                      stroke="currentColor"
                      className="text-zinc-400 dark:text-zinc-650"
                      strokeWidth={1}
                      strokeDasharray="4,4"
                    />

                    {/* Marker definitions */}
                    <defs>
                      <marker id="arrow-indigo" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#6366f1" />
                      </marker>
                      <marker id="arrow-purple" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#c084fc" />
                      </marker>
                      <marker id="arrow-emerald" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
                      </marker>
                    </defs>
                  </svg>
                </div>
              </div>
            )}

            {/* Results Panel */}
            {results && !error && (
              <div className="bg-zinc-900 dark:bg-zinc-950 text-white rounded-2xl p-6 shadow-md border border-zinc-800 space-y-4 font-mono text-xs">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Vector Solver Calculations
                  </h4>
                  <button
                    onClick={handleCopy}
                    className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-bold"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div>
                      <span className="text-[9px] text-zinc-400 block uppercase mb-0.5">Magnitude |U|</span>
                      <span className="text-sm font-bold text-indigo-400">{results.magU.toFixed(4)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-400 block uppercase mb-0.5">Magnitude |V|</span>
                      <span className="text-sm font-bold text-purple-400">{results.magV.toFixed(4)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-400 block uppercase mb-0.5">Dot Product (U · V)</span>
                      <span className="text-sm font-black text-emerald-400">{results.dot.toFixed(4)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-[9px] text-zinc-400 block uppercase mb-0.5">Angle Between Vectors</span>
                      <span className="text-sm font-bold text-white">
                        {results.angleDeg.toFixed(2)}° ({results.angleRad.toFixed(4)} rad)
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-400 block uppercase mb-0.5">Orthogonal Projection Proj_V(U)</span>
                      <span className="text-xs text-zinc-350 block">
                        [{results.projUonV.slice(0, dimensions).map(v => v.toFixed(3)).join(', ')}]
                      </span>
                    </div>
                    {dimensions === 3 && (
                      <div>
                        <span className="text-[9px] text-zinc-400 block uppercase mb-0.5">Cross Product (U × V)</span>
                        <span className="text-xs text-emerald-400 block font-bold">
                          [{results.cross.map(v => v.toFixed(3)).join(', ')}]
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-850 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] text-zinc-400 block uppercase mb-1">Vector Sum U + V</span>
                    <span className="text-xs block text-white">
                      [{results.sum.slice(0, dimensions).map(v => v.toFixed(2)).join(', ')}]
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-400 block uppercase mb-1">Vector Difference U - V</span>
                    <span className="text-xs block text-white">
                      [{results.diff.slice(0, dimensions).map(v => v.toFixed(2)).join(', ')}]
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Vector Reference */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-zinc-455 dark:text-zinc-500 uppercase tracking-wider">
                Vector Algebra Reference
              </h4>
              <div className="text-xs text-zinc-650 dark:text-zinc-350 space-y-3 leading-relaxed">
                <p>
                  Vectors represent mathematical objects carrying both magnitude (length) and spatial direction.
                </p>
                <ul className="list-disc pl-4 space-y-1 font-mono text-[10px] text-zinc-550 dark:text-zinc-400">
                  <li>Dot Product: u · v = |u| |v| cos θ (scalar representation)</li>
                  <li>Cross Product: u × v returns a vector orthogonal (perpendicular) to both input vectors.</li>
                  <li>Projection: Projects vector u orthogonally down onto vector v.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

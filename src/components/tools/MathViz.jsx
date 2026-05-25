import { useState, useRef, useEffect, useCallback } from 'react';

const PRESETS = [
  { label: 'y = x²', fn: 'x^2', xMin: -5, xMax: 5 },
  { label: 'y = sin(x)', fn: 'sin(x)', xMin: -2 * Math.PI, xMax: 2 * Math.PI },
  { label: 'y = cos(x)', fn: 'cos(x)', xMin: -2 * Math.PI, xMax: 2 * Math.PI },
  { label: 'y = 1/x', fn: '1/x', xMin: -5, xMax: 5 },
  { label: 'y = ln(x)', fn: 'ln(x)', xMin: 0.1, xMax: 10 },
  { label: 'y = e^x', fn: 'exp(x)', xMin: -3, xMax: 3 },
  { label: 'y = √x', fn: 'sqrt(x)', xMin: 0, xMax: 10 },
  { label: 'y = x³-3x', fn: 'x^3-3*x', xMin: -3, xMax: 3 },
];

function compileExpr(expr) {
  let sanitized = expr
    .replace(/\^/g, '**')
    .replace(/sin/g, 'Math.sin')
    .replace(/cos/g, 'Math.cos')
    .replace(/tan/g, 'Math.tan')
    .replace(/log/g, 'Math.log10')
    .replace(/ln/g, 'Math.log')
    .replace(/sqrt/g, 'Math.sqrt')
    .replace(/exp/g, 'Math.exp')
    .replace(/abs/g, 'Math.abs')
    .replace(/pi/gi, 'Math.PI');
  try {
    const fn = new Function('x', 'return (' + sanitized + ')');
    fn(0); // test
    return fn;
  } catch {
    return null;
  }
}

export default function MathViz() {
  const [expr, setExpr] = useState('sin(x)');
  const [xMin, setXMin] = useState(-7);
  const [xMax, setXMax] = useState(7);
  const [yMin, setYMin] = useState(-2);
  const [yMax, setYMax] = useState(2);
  const canvasRef = useRef(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    // Clear
    ctx.fillStyle = '#f8f8f6';
    ctx.fillRect(0, 0, W, H);

    const toScreenX = (x) => ((x - xMin) / (xMax - xMin)) * W;
    const toScreenY = (y) => H - ((y - yMin) / (yMax - yMin)) * H;

    // Grid
    ctx.strokeStyle = '#dfddd0';
    ctx.lineWidth = 0.5;
    // Vertical grid lines
    const xStep = Math.pow(10, Math.floor(Math.log10((xMax - xMin) / 5)));
    for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax; x += xStep) {
      const sx = toScreenX(x);
      ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, H); ctx.stroke();
    }
    // Horizontal grid lines
    const yStep = Math.pow(10, Math.floor(Math.log10((yMax - yMin) / 5)));
    for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) {
      const sy = toScreenY(y);
      ctx.beginPath(); ctx.moveTo(0, sy); ctx.lineTo(W, sy); ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#713f12';
    ctx.lineWidth = 1;
    // X axis
    if (yMin <= 0 && yMax >= 0) {
      const sy = toScreenY(0);
      ctx.beginPath(); ctx.moveTo(0, sy); ctx.lineTo(W, sy); ctx.stroke();
    }
    // Y axis
    if (xMin <= 0 && xMax >= 0) {
      const sx = toScreenX(0);
      ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, H); ctx.stroke();
    }

    // Axis labels
    ctx.fillStyle = '#713f12';
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax; x += xStep) {
      if (Math.abs(x) < 1e-10) continue;
      const sx = toScreenX(x);
      const sy = yMin <= 0 && yMax >= 0 ? Math.min(Math.max(toScreenY(0) + 14, 14), H - 4) : H - 4;
      ctx.fillText(Number(x.toFixed(4)).toString(), sx, sy);
    }
    ctx.textAlign = 'right';
    for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) {
      if (Math.abs(y) < 1e-10) continue;
      const sx = xMin <= 0 && xMax >= 0 ? Math.max(toScreenX(0) - 6, 30) : 30;
      const sy = toScreenY(y);
      ctx.fillText(Number(y.toFixed(4)).toString(), sx, sy + 4);
    }

    // Draw function
    const fn = compileExpr(expr);
    if (!fn) return;

    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    let started = false;
    const steps = W * 2;
    for (let i = 0; i <= steps; i++) {
      const x = xMin + (i / steps) * (xMax - xMin);
      let y;
      try { y = fn(x); } catch { y = NaN; }
      if (!isFinite(y) || Math.abs(y) > 1e6) {
        started = false;
        continue;
      }
      const sx = toScreenX(x);
      const sy = toScreenY(y);
      if (!started) { ctx.moveTo(sx, sy); started = true; }
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
  }, [expr, xMin, xMax, yMin, yMax]);

  useEffect(() => { draw(); }, [draw]);

  // Resize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    const resize = () => {
      canvas.width = parent.clientWidth;
      canvas.height = Math.min(400, parent.clientWidth * 0.6);
      draw();
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [draw]);

  const applyPreset = (p) => {
    setExpr(p.fn);
    setXMin(p.xMin);
    setXMax(p.xMax);
    const range = p.xMax - p.xMin;
    setYMin(-range * 0.4);
    setYMax(range * 0.4);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Expression input */}
      <div className="mb-3">
        <label className="text-sm text-ink-500 mb-1 block">
          函数表达式（变量为 x，支持 sin/cos/tan/log/ln/sqrt/exp/abs）
        </label>
        <input
          type="text"
          value={expr}
          onChange={(e) => setExpr(e.target.value)}
          className="yi-input font-mono text-lg"
          placeholder="sin(x)"
        />
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-xs text-ink-400 self-center">预设：</span>
        {PRESETS.map((p, i) => (
          <button
            key={i}
            onClick={() => applyPreset(p)}
            className="px-2 py-1 rounded bg-ink-50 hover:bg-ink-100 text-xs text-ink-600 font-mono transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div className="yi-card p-2 mb-4">
        <canvas ref={canvasRef} className="w-full" />
      </div>

      {/* Range controls */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'X min', value: xMin, setter: setXMin },
          { label: 'X max', value: xMax, setter: setXMax },
          { label: 'Y min', value: yMin, setter: setYMin },
          { label: 'Y max', value: yMax, setter: setYMax },
        ].map(({ label, value, setter }) => (
          <div key={label}>
            <label className="text-xs text-ink-400 mb-1 block">{label}</label>
            <input
              type="number"
              value={value}
              onChange={(e) => setter(parseFloat(e.target.value) || 0)}
              className="yi-input text-sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

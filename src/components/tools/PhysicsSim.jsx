import { useState, useRef, useEffect, useCallback } from 'react';

const SIMS = {
  projectile: { name: '抛体运动', icon: '🎯' },
  spring: { name: '弹簧振子', icon: '🔧' },
};

function ProjectileSim() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const [v0, setV0] = useState(20);
  const [angle, setAngle] = useState(45);
  const [g, setG] = useState(9.8);
  const [running, setRunning] = useState(false);
  const [data, setData] = useState(null);
  const stateRef = useRef({ t: 0, points: [] });

  const start = useCallback(() => {
    const rad = (angle * Math.PI) / 180;
    const vx = v0 * Math.cos(rad);
    const vy = v0 * Math.sin(rad);
    const totalTime = (2 * vy) / g;
    const maxHeight = (vy * vy) / (2 * g);
    const maxDist = vx * totalTime;

    setData({ maxDist: maxDist.toFixed(2), maxHeight: maxHeight.toFixed(2), totalTime: totalTime.toFixed(2) });
    stateRef.current = { t: 0, vx, vy, points: [], totalTime };
    setRunning(true);
  }, [v0, angle, g]);

  useEffect(() => {
    if (!running) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.parentElement.clientWidth;
    const H = canvas.height = 300;

    const { vx, vy, totalTime } = stateRef.current;
    const maxDist = vx * totalTime;
    const maxHeight = (vy * vy) / (2 * g);
    const scaleX = (W - 40) / Math.max(maxDist, 1);
    const scaleY = (H - 40) / Math.max(maxHeight, 1);
    const scale = Math.min(scaleX, scaleY);
    const offsetX = 20;
    const offsetY = H - 20;

    let lastTime = performance.now();

    const frame = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const s = stateRef.current;
      s.t += dt;

      const x = vx * s.t;
      const y = vy * s.t - 0.5 * g * s.t * s.t;

      if (y < 0 && s.t > 0.01) {
        setRunning(false);
        return;
      }

      s.points.push({ x, y });

      // Draw
      ctx.fillStyle = '#f8f8f6';
      ctx.fillRect(0, 0, W, H);

      // Ground
      ctx.strokeStyle = '#713f12';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, offsetY);
      ctx.lineTo(W, offsetY);
      ctx.stroke();

      // Trajectory (predicted)
      ctx.strokeStyle = '#dfddd0';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      for (let t = 0; t <= totalTime; t += totalTime / 100) {
        const px = vx * t;
        const py = vy * t - 0.5 * g * t * t;
        const sx = offsetX + px * scale;
        const sy = offsetY - py * scale;
        if (t === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Actual path
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      s.points.forEach((p, i) => {
        const sx = offsetX + p.x * scale;
        const sy = offsetY - p.y * scale;
        if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
      });
      ctx.stroke();

      // Ball
      const bx = offsetX + x * scale;
      const by = offsetY - y * scale;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(bx, by, 5, 0, Math.PI * 2);
      ctx.fill();

      // Info
      ctx.fillStyle = '#713f12';
      ctx.font = '12px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`t = ${s.t.toFixed(2)}s`, 10, 20);
      ctx.fillText(`x = ${x.toFixed(2)}m`, 10, 36);
      ctx.fillText(`y = ${y.toFixed(2)}m`, 10, 52);

      animRef.current = requestAnimationFrame(frame);
    };

    animRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animRef.current);
  }, [running, g]);

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <label className="text-xs text-ink-400 dark:text-ink-300 mb-1 block">初速度 (m/s)</label>
          <input type="number" value={v0} onChange={e => setV0(+e.target.value)} className="yi-input text-sm" />
        </div>
        <div>
          <label className="text-xs text-ink-400 dark:text-ink-300 mb-1 block">角度 (°)</label>
          <input type="number" value={angle} onChange={e => setAngle(+e.target.value)} className="yi-input text-sm" />
        </div>
        <div>
          <label className="text-xs text-ink-400 dark:text-ink-300 mb-1 block">重力加速度</label>
          <input type="number" value={g} onChange={e => setG(+e.target.value)} className="yi-input text-sm" />
        </div>
      </div>
      <button onClick={start} disabled={running} className="yi-btn-primary mb-4 disabled:opacity-50">
        {running ? '运行中...' : '发射'}
      </button>
      <div className="yi-card p-2 mb-4">
        <canvas ref={canvasRef} className="w-full" />
      </div>
      {data && (
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="yi-card p-3">
            <div className="text-lg font-bold font-mono text-ink-950">{data.maxDist}m</div>
            <div className="text-xs text-ink-400 dark:text-ink-300">水平距离</div>
          </div>
          <div className="yi-card p-3">
            <div className="text-lg font-bold font-mono text-ink-950">{data.maxHeight}m</div>
            <div className="text-xs text-ink-400 dark:text-ink-300">最大高度</div>
          </div>
          <div className="yi-card p-3">
            <div className="text-lg font-bold font-mono text-ink-950">{data.totalTime}s</div>
            <div className="text-xs text-ink-400 dark:text-ink-300">滞空时间</div>
          </div>
        </div>
      )}
    </div>
  );
}

function SpringSim() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const [k, setK] = useState(10);
  const [mass, setMass] = useState(1);
  const [damp, setDamp] = useState(0.1);
  const [x0, setX0] = useState(100);
  const [running, setRunning] = useState(false);
  const stateRef = useRef({ x: 0, v: 0, points: [] });

  const start = useCallback(() => {
    stateRef.current = { x: x0, v: 0, points: [], t: 0 };
    setRunning(true);
  }, [x0]);

  useEffect(() => {
    if (!running) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.parentElement.clientWidth;
    const H = canvas.height = 300;
    const centerY = H / 2;
    const eqX = W / 2;

    let lastTime = performance.now();
    const maxPoints = 300;

    const frame = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.03);
      lastTime = now;
      const s = stateRef.current;

      // Physics: F = -kx - c*v
      const a = (-k * s.x - damp * s.v) / mass;
      s.v += a * dt;
      s.x += s.v * dt;
      s.t += dt;
      s.points.push({ t: s.t, x: s.x });
      if (s.points.length > maxPoints) s.points.shift();

      // Check if stopped
      if (s.t > 2 && Math.abs(s.x) < 0.5 && Math.abs(s.v) < 0.5) {
        setRunning(false);
      }

      // Draw
      ctx.fillStyle = '#f8f8f6';
      ctx.fillRect(0, 0, W, H);

      // Equilibrium line
      ctx.strokeStyle = '#dfddd0';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(eqX, 0); ctx.lineTo(eqX, H);
      ctx.stroke();
      ctx.setLineDash([]);

      // Spring (zigzag)
      const springEnd = eqX + s.x;
      ctx.strokeStyle = '#713f12';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(40, centerY);
      const coils = 8;
      const coilLen = (springEnd - 40) / (coils * 2);
      for (let i = 0; i < coils * 2; i++) {
        const cx = 40 + coilLen * (i + 1);
        const cy = centerY + (i % 2 === 0 ? -15 : 15);
        ctx.lineTo(cx, cy);
      }
      ctx.lineTo(springEnd, centerY);
      ctx.stroke();

      // Mass block
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(springEnd - 15, centerY - 15, 30, 30);
      ctx.fillStyle = '#fff';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('m', springEnd, centerY + 4);

      // Graph
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      s.points.forEach((p, i) => {
        const px = 40 + (i / maxPoints) * (W - 80);
        const py = centerY - p.x * 0.8;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.stroke();

      // Info
      ctx.fillStyle = '#713f12';
      ctx.font = '12px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`t = ${s.t.toFixed(2)}s`, 10, 20);
      ctx.fillText(`x = ${s.x.toFixed(1)}`, 10, 36);
      ctx.fillText(`v = ${s.v.toFixed(1)}`, 10, 52);

      animRef.current = requestAnimationFrame(frame);
    };

    animRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animRef.current);
  }, [running, k, mass, damp]);

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div>
          <label className="text-xs text-ink-400 dark:text-ink-300 mb-1 block">弹簧常数 k</label>
          <input type="number" value={k} onChange={e => setK(+e.target.value)} className="yi-input text-sm" />
        </div>
        <div>
          <label className="text-xs text-ink-400 dark:text-ink-300 mb-1 block">质量 m</label>
          <input type="number" value={mass} onChange={e => setMass(+e.target.value)} className="yi-input text-sm" />
        </div>
        <div>
          <label className="text-xs text-ink-400 dark:text-ink-300 mb-1 block">阻尼 c</label>
          <input type="number" value={damp} step="0.1" onChange={e => setDamp(+e.target.value)} className="yi-input text-sm" />
        </div>
        <div>
          <label className="text-xs text-ink-400 dark:text-ink-300 mb-1 block">初始位移</label>
          <input type="number" value={x0} onChange={e => setX0(+e.target.value)} className="yi-input text-sm" />
        </div>
      </div>
      <button onClick={start} disabled={running} className="yi-btn-primary mb-4 disabled:opacity-50">
        {running ? '运行中...' : '释放'}
      </button>
      <div className="yi-card p-2">
        <canvas ref={canvasRef} className="w-full" />
      </div>
    </div>
  );
}

export default function PhysicsSim() {
  const [sim, setSim] = useState('projectile');

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex gap-2 mb-4">
        {Object.entries(SIMS).map(([key, s]) => (
          <button
            key={key}
            onClick={() => setSim(key)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${sim === key ? 'bg-ink-950 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'}`}
          >
            {s.icon} {s.name}
          </button>
        ))}
      </div>
      {sim === 'projectile' ? <ProjectileSim /> : <SpringSim />}
    </div>
  );
}

import { useState, useMemo } from 'react';

const CATEGORIES = {
  length: {
    name: '长度',
    icon: '📏',
    units: {
      m: { name: '米', factor: 1 },
      km: { name: '千米', factor: 1000 },
      cm: { name: '厘米', factor: 0.01 },
      mm: { name: '毫米', factor: 0.001 },
      μm: { name: '微米', factor: 1e-6 },
      nm: { name: '纳米', factor: 1e-9 },
      mi: { name: '英里', factor: 1609.344 },
      ft: { name: '英尺', factor: 0.3048 },
      in: { name: '英寸', factor: 0.0254 },
      yd: { name: '码', factor: 0.9144 },
      li: { name: '里', factor: 500 },
      zhang: { name: '丈', factor: 3.333 },
      chi: { name: '尺', factor: 0.3333 },
      cun: { name: '寸', factor: 0.03333 },
    },
  },
  mass: {
    name: '质量',
    icon: '⚖',
    units: {
      kg: { name: '千克', factor: 1 },
      g: { name: '克', factor: 0.001 },
      mg: { name: '毫克', factor: 1e-6 },
      t: { name: '吨', factor: 1000 },
      lb: { name: '磅', factor: 0.453592 },
      oz: { name: '盎司', factor: 0.0283495 },
      liang: { name: '两', factor: 0.05 },
      jin: { name: '斤', factor: 0.5 },
    },
  },
  temperature: {
    name: '温度',
    icon: '🌡',
    units: {
      C: { name: '摄氏度', factor: null },
      F: { name: '华氏度', factor: null },
      K: { name: '开尔文', factor: null },
    },
  },
  area: {
    name: '面积',
    icon: '📐',
    units: {
      m2: { name: '平方米', factor: 1 },
      km2: { name: '平方千米', factor: 1e6 },
      ha: { name: '公顷', factor: 1e4 },
      mu: { name: '亩', factor: 666.667 },
      ft2: { name: '平方英尺', factor: 0.0929 },
      acre: { name: '英亩', factor: 4046.86 },
    },
  },
  volume: {
    name: '体积',
    icon: '🧪',
    units: {
      L: { name: '升', factor: 1 },
      mL: { name: '毫升', factor: 0.001 },
      m3: { name: '立方米', factor: 1000 },
      gal: { name: '加仑', factor: 3.78541 },
      qt: { name: '夸脱', factor: 0.946353 },
      cup: { name: '杯', factor: 0.236588 },
    },
  },
  time: {
    name: '时间',
    icon: '⏱',
    units: {
      s: { name: '秒', factor: 1 },
      min: { name: '分钟', factor: 60 },
      h: { name: '小时', factor: 3600 },
      d: { name: '天', factor: 86400 },
      wk: { name: '周', factor: 604800 },
      yr: { name: '年', factor: 31557600 },
    },
  },
};

function convertTemp(value, from, to) {
  let celsius;
  if (from === 'C') celsius = value;
  else if (from === 'F') celsius = (value - 32) * 5 / 9;
  else celsius = value - 273.15;

  if (to === 'C') return celsius;
  if (to === 'F') return celsius * 9 / 5 + 32;
  return celsius + 273.15;
}

export default function UnitConverter() {
  const [category, setCategory] = useState('length');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('km');
  const [inputVal, setInputVal] = useState('1');

  const cat = CATEGORIES[category];
  const units = Object.entries(cat.units);

  const result = useMemo(() => {
    const val = parseFloat(inputVal);
    if (isNaN(val)) return '—';
    if (category === 'temperature') {
      return convertTemp(val, fromUnit, toUnit).toPrecision(8).replace(/\.?0+$/, '');
    }
    const fromFactor = cat.units[fromUnit].factor;
    const toFactor = cat.units[toUnit].factor;
    return (val * fromFactor / toFactor).toPrecision(8).replace(/\.?0+$/, '');
  }, [inputVal, fromUnit, toUnit, category, cat]);

  return (
    <div className="max-w-md mx-auto">
      {/* Category selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(CATEGORIES).map(([key, c]) => (
          <button
            key={key}
            onClick={() => {
              setCategory(key);
              const u = Object.keys(c.units);
              setFromUnit(u[0]);
              setToUnit(u[1] || u[0]);
            }}
            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
              category === key
                ? 'bg-ink-950 text-white'
                : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
            }`}
          >
            {c.icon} {c.name}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="mb-4">
        <label className="text-xs text-ink-400 dark:text-ink-300 mb-1 block">输入值</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="yi-input flex-1"
            placeholder="输入数值"
          />
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="yi-input w-32"
          >
            {units.map(([key, u]) => (
              <option key={key} value={key}>{u.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Swap button */}
      <div className="flex justify-center my-3">
        <button
          onClick={() => { setFromUnit(toUnit); setToUnit(fromUnit); }}
          className="p-2 rounded-full bg-ink-100 hover:bg-ink-200 transition-colors text-ink-600"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 4v12M6 16l-3-3M6 16l3-3M14 16V4M14 4l-3 3M14 4l3 3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Result */}
      <div className="mb-4">
        <label className="text-xs text-ink-400 dark:text-ink-300 mb-1 block">结果</label>
        <div className="flex gap-2">
          <div className="yi-input flex-1 bg-ink-50 font-bold text-ink-950">
            {result}
          </div>
          <select
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            className="yi-input w-32"
          >
            {units.map(([key, u]) => (
              <option key={key} value={key}>{u.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Formula */}
      <div className="yi-card p-4 text-center">
        <p className="text-sm text-ink-500 dark:text-ink-200">
          {inputVal || '0'} {cat.units[fromUnit].name} = {result} {cat.units[toUnit].name}
        </p>
      </div>
    </div>
  );
}

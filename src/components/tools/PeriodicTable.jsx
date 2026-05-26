import { useState } from 'react';

// Simplified periodic table data - first 36 elements + key ones
const ELEMENTS = [
  { z: 1, sym: 'H', name: '氢', mass: 1.008, group: 1, period: 1, category: 'nonmetal', electron: '1s¹' },
  { z: 2, sym: 'He', name: '氦', mass: 4.003, group: 18, period: 1, category: 'noble', electron: '1s²' },
  { z: 3, sym: 'Li', name: '锂', mass: 6.941, group: 1, period: 2, category: 'alkali', electron: '[He]2s¹' },
  { z: 4, sym: 'Be', name: '铍', mass: 9.012, group: 2, period: 2, category: 'alkaline', electron: '[He]2s²' },
  { z: 5, sym: 'B', name: '硼', mass: 10.81, group: 13, period: 2, category: 'metalloid', electron: '[He]2s²2p¹' },
  { z: 6, sym: 'C', name: '碳', mass: 12.01, group: 14, period: 2, category: 'nonmetal', electron: '[He]2s²2p²' },
  { z: 7, sym: 'N', name: '氮', mass: 14.01, group: 15, period: 2, category: 'nonmetal', electron: '[He]2s²2p³' },
  { z: 8, sym: 'O', name: '氧', mass: 16.00, group: 16, period: 2, category: 'nonmetal', electron: '[He]2s²2p⁴' },
  { z: 9, sym: 'F', name: '氟', mass: 19.00, group: 17, period: 2, category: 'halogen', electron: '[He]2s²2p⁵' },
  { z: 10, sym: 'Ne', name: '氖', mass: 20.18, group: 18, period: 2, category: 'noble', electron: '[He]2s²2p⁶' },
  { z: 11, sym: 'Na', name: '钠', mass: 22.99, group: 1, period: 3, category: 'alkali', electron: '[Ne]3s¹' },
  { z: 12, sym: 'Mg', name: '镁', mass: 24.31, group: 2, period: 3, category: 'alkaline', electron: '[Ne]3s²' },
  { z: 13, sym: 'Al', name: '铝', mass: 26.98, group: 13, period: 3, category: 'metal', electron: '[Ne]3s²3p¹' },
  { z: 14, sym: 'Si', name: '硅', mass: 28.09, group: 14, period: 3, category: 'metalloid', electron: '[Ne]3s²3p²' },
  { z: 15, sym: 'P', name: '磷', mass: 30.97, group: 15, period: 3, category: 'nonmetal', electron: '[Ne]3s²3p³' },
  { z: 16, sym: 'S', name: '硫', mass: 32.07, group: 16, period: 3, category: 'nonmetal', electron: '[Ne]3s²3p⁴' },
  { z: 17, sym: 'Cl', name: '氯', mass: 35.45, group: 17, period: 3, category: 'halogen', electron: '[Ne]3s²3p⁵' },
  { z: 18, sym: 'Ar', name: '氩', mass: 39.95, group: 18, period: 3, category: 'noble', electron: '[Ne]3s²3p⁶' },
  { z: 19, sym: 'K', name: '钾', mass: 39.10, group: 1, period: 4, category: 'alkali', electron: '[Ar]4s¹' },
  { z: 20, sym: 'Ca', name: '钙', mass: 40.08, group: 2, period: 4, category: 'alkaline', electron: '[Ar]4s²' },
  { z: 26, sym: 'Fe', name: '铁', mass: 55.85, group: 8, period: 4, category: 'transition', electron: '[Ar]3d⁶4s²' },
  { z: 29, sym: 'Cu', name: '铜', mass: 63.55, group: 11, period: 4, category: 'transition', electron: '[Ar]3d¹⁰4s¹' },
  { z: 30, sym: 'Zn', name: '锌', mass: 65.38, group: 12, period: 4, category: 'transition', electron: '[Ar]3d¹⁰4s²' },
  { z: 35, sym: 'Br', name: '溴', mass: 79.90, group: 17, period: 4, category: 'halogen', electron: '[Ar]3d¹⁰4s²4p⁵' },
  { z: 36, sym: 'Kr', name: '氪', mass: 83.80, group: 18, period: 4, category: 'noble', electron: '[Ar]3d¹⁰4s²4p⁶' },
  { z: 47, sym: 'Ag', name: '银', mass: 107.87, group: 11, period: 5, category: 'transition', electron: '[Kr]4d¹⁰5s¹' },
  { z: 79, sym: 'Au', name: '金', mass: 196.97, group: 11, period: 6, category: 'transition', electron: '[Xe]4f¹⁴5d¹⁰6s¹' },
  { z: 78, sym: 'Pt', name: '铂', mass: 195.08, group: 10, period: 6, category: 'transition', electron: '[Xe]4f¹⁴5d⁹6s¹' },
  { z: 92, sym: 'U', name: '铀', mass: 238.03, group: 3, period: 7, category: 'actinide', electron: '[Rn]5f³6d¹7s²' },
];

const CATEGORIES = {
  nonmetal: { name: '非金属', color: '#22c55e' },
  noble: { name: '稀有气体', color: '#8b5cf6' },
  alkali: { name: '碱金属', color: '#ef4444' },
  alkaline: { name: '碱土金属', color: '#f97316' },
  metal: { name: '金属', color: '#3b82f6' },
  metalloid: { name: '准金属', color: '#14b8a6' },
  halogen: { name: '卤素', color: '#ec4899' },
  transition: { name: '过渡金属', color: '#eab308' },
  actinide: { name: '锕系', color: '#a855f7' },
};

export default function PeriodicTable() {
  const [selected, setSelected] = useState(null);
  const [filterCat, setFilterCat] = useState(null);

  const displayed = filterCat
    ? ELEMENTS.filter(e => e.category === filterCat)
    : ELEMENTS;

  return (
    <div>
      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setFilterCat(null)}
          className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
            !filterCat ? 'bg-ink-950 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
          }`}
        >
          全部
        </button>
        {Object.entries(CATEGORIES).map(([key, cat]) => (
          <button
            key={key}
            onClick={() => setFilterCat(filterCat === key ? null : key)}
            className={`px-2.5 py-1 rounded-lg text-xs transition-colors flex items-center gap-1 ${
              filterCat === key ? 'text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
            }`}
            style={filterCat === key ? { background: cat.color } : {}}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-10 gap-1.5 mb-4">
        {displayed.map((el) => {
          const cat = CATEGORIES[el.category];
          return (
            <button
              key={el.z}
              onClick={() => setSelected(selected?.z === el.z ? null : el)}
              className={`relative p-2 rounded-lg text-center transition-all hover:scale-105 ${
                selected?.z === el.z ? 'ring-2 ring-ink-950 shadow-lg scale-105' : 'hover:shadow-md'
              }`}
              style={{ background: cat.color + '15', border: `1px solid ${cat.color}40` }}
            >
              <div className="text-[10px] text-ink-400 dark:text-ink-300 font-mono">{el.z}</div>
              <div className="text-lg font-bold" style={{ color: cat.color }}>{el.sym}</div>
              <div className="text-[10px] text-ink-500 dark:text-ink-200">{el.name}</div>
            </button>
          );
        })}
      </div>

      {/* Selected element detail */}
      {selected && (
        <div className="yi-card p-5 animate-fadeIn">
          <div className="flex items-start gap-4">
            <div
              className="w-20 h-20 rounded-xl flex flex-col items-center justify-center shrink-0"
              style={{ background: CATEGORIES[selected.category].color + '20', border: `2px solid ${CATEGORIES[selected.category].color}` }}
            >
              <div className="text-xs text-ink-400 dark:text-ink-300">{selected.z}</div>
              <div className="text-3xl font-bold" style={{ color: CATEGORIES[selected.category].color }}>{selected.sym}</div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-ink-950">{selected.name}</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm">
                <div><span className="text-ink-400 dark:text-ink-300">原子序数：</span><span className="text-ink-700">{selected.z}</span></div>
                <div><span className="text-ink-400 dark:text-ink-300">相对原子质量：</span><span className="text-ink-700">{selected.mass}</span></div>
                <div><span className="text-ink-400 dark:text-ink-300">族：</span><span className="text-ink-700">第 {selected.group} 族</span></div>
                <div><span className="text-ink-400 dark:text-ink-300">周期：</span><span className="text-ink-700">第 {selected.period} 周期</span></div>
                <div className="col-span-2">
                  <span className="text-ink-400 dark:text-ink-300">电子排布：</span>
                  <span className="text-ink-700 font-mono">{selected.electron}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-ink-400 dark:text-ink-300">分类：</span>
                  <span
                    className="yi-badge"
                    style={{ background: CATEGORIES[selected.category].color + '20', color: CATEGORIES[selected.category].color }}
                  >
                    {CATEGORIES[selected.category].name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

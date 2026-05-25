const SHORTCUTS = [
  { keys: ['⌘', 'K'], desc: '聚焦搜索框' },
  { keys: ['Esc'], desc: '关闭面板 / 清除搜索' },
  { keys: ['←'], desc: '上一个同级专题' },
  { keys: ['→'], desc: '下一个同级专题' },
  { keys: ['?'], desc: '显示此帮助' },
];

export default function ShortcutHelp({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative yi-card p-6 w-80 shadow-2xl animate-scaleIn">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-ink-950">键盘快捷键</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-ink-100 text-ink-400">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="space-y-2.5">
          {SHORTCUTS.map((s, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-sm text-ink-600">{s.desc}</span>
              <div className="flex gap-1">
                {s.keys.map((k, j) => (
                  <kbd
                    key={j}
                    className="px-2 py-0.5 text-xs font-mono bg-ink-100 text-ink-700 rounded border border-ink-200"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-ink-300 mt-4 text-center">按 Esc 或点击外部关闭</p>
      </div>
    </div>
  );
}

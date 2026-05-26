import { useState } from 'react';

export default function CollapsibleSection({ id, title, icon, defaultOpen, children }) {
  const [open, setOpen] = useState(() => {
    try {
      const saved = localStorage.getItem('yi-welcome-sections');
      if (saved) {
        const map = JSON.parse(saved);
        if (id in map) return map[id];
      }
    } catch {}
    return defaultOpen !== false;
  });

  const toggle = () => {
    setOpen(prev => {
      const next = !prev;
      try {
        const saved = localStorage.getItem('yi-welcome-sections');
        const map = saved ? JSON.parse(saved) : {};
        map[id] = next;
        localStorage.setItem('yi-welcome-sections', JSON.stringify(map));
      } catch {}
      return next;
    });
  };

  return (
    <div className="mb-6">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between text-left mb-3 group"
      >
        <h2 className="text-lg font-bold text-ink-950 dark:text-ink-50 flex items-center gap-2">
          <span>{icon}</span> {title}
        </h2>
        <svg
          width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
          className={`text-ink-300 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && <div className="animate-fadeIn">{children}</div>}
    </div>
  );
}

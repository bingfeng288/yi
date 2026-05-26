import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'yi-theme';

function getInitial() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {}
  return 'system';
}

function apply(theme) {
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', isDark);
}

export default function useTheme() {
  const [theme, setTheme] = useState(getInitial);

  useEffect(() => {
    apply(theme);
    if (theme !== 'system') {
      try { localStorage.setItem(STORAGE_KEY, theme); } catch {}
    } else {
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
    }
  }, [theme]);

  // Listen for OS theme changes when in system mode
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => apply('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const cycle = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : prev === 'dark' ? 'system' : 'light');
  }, []);

  return { theme, cycle };
}

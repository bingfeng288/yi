import { useEffect, useRef } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function useFocusTrap(isOpen) {
  const ref = useRef(null);

  useEffect(() => {
    if (!isOpen || !ref.current) return;
    const container = ref.current;

    // Focus first focusable element on open
    const first = container.querySelector(FOCUSABLE);
    if (first) first.focus();

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      const focusable = container.querySelectorAll(FOCUSABLE);
      if (focusable.length === 0) return;
      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return ref;
}

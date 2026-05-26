import { useState, useCallback, useEffect } from 'react';

export default function Calculator() {
  const [display, setDisplay] = useState('0');
  const [expr, setExpr] = useState('');
  const [history, setHistory] = useState([]);
  const [isRad, setIsRad] = useState(true);

  // Keyboard input
  useEffect(() => {
    const handler = (e) => {
      const key = e.key;
      if (/[0-9.]/.test(key)) handleBtn(key);
      else if (key === '+') handleBtn('+');
      else if (key === '-') handleBtn('−');
      else if (key === '*') handleBtn('×');
      else if (key === '/') { e.preventDefault(); handleBtn('÷'); }
      else if (key === '(') handleBtn('(');
      else if (key === ')') handleBtn(')');
      else if (key === '^') handleBtn('^');
      else if (key === 'Enter' || key === '=') handleBtn('=');
      else if (key === 'Backspace') handleBtn('⌫');
      else if (key === 'Escape' || key === 'c' || key === 'C') handleBtn('C');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  const safeEval = useCallback((expression) => {
    try {
      if (!expression.trim()) return 'Error';
      const anglePrefix = isRad ? '' : 'Math.PI/180*';
      let sanitized = expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-')
        .replace(/π/g, '(' + Math.PI + ')')
        .replace(/e(?![xp])/g, '(' + Math.E + ')')
        .replace(/sin\(/g, 'Math.sin(' + anglePrefix)
        .replace(/cos\(/g, 'Math.cos(' + anglePrefix)
        .replace(/tan\(/g, 'Math.tan(' + anglePrefix)
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/\^/g, '**');
      // Strict whitelist: only digits, operators, parens, dots, Math functions, and e/E/P/I
      const stripped = sanitized.replace(/Math\.(sin|cos|tan|log10|log|sqrt|PI|E)\b/g, '');
      if (/[^0-9+\-*/().eE\s]/.test(stripped)) {
        return 'Error';
      }
      // Prevent empty parens injection and ensure balanced parens
      let depth = 0;
      for (const ch of sanitized) {
        if (ch === '(') depth++;
        if (ch === ')') depth--;
        if (depth < 0) return 'Error';
      }
      if (depth !== 0) return 'Error';
      const result = new Function('return (' + sanitized + ')')();
      if (!isFinite(result)) return 'Error';
      return Number(result.toPrecision(12)).toString();
    } catch {
      return 'Error';
    }
  }, [isRad]);

  const handleBtn = useCallback((val) => {
    if (val === 'C') {
      setDisplay('0');
      setExpr('');
      return;
    }
    if (val === '⌫') {
      setExpr(prev => prev.slice(0, -1));
      return;
    }
    if (val === '=') {
      const result = safeEval(expr);
      setHistory(prev => [`${expr} = ${result}`, ...prev].slice(0, 10));
      setDisplay(result);
      setExpr(result === 'Error' ? '' : result);
      return;
    }
    setExpr(prev => {
      const next = prev + val;
      const preview = safeEval(next);
      if (preview !== 'Error') setDisplay(preview);
      return next;
    });
  }, [expr, safeEval]);

  const buttons = [
    ['sin(', 'cos(', 'tan(', 'C'],
    ['π', 'e', '^', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '−'],
    ['1', '2', '3', '+'],
    ['log(', '0', '.', '='],
    ['ln(', 'sqrt(', '(', ')'],
  ];

  const getBtnStyle = (val) => {
    if (val === '=') return 'bg-ink-950 text-white hover:bg-ink-900';
    if (['C', '⌫'].includes(val)) return 'bg-red-50 text-red-700 hover:bg-red-100';
    if (['+', '−', '×', '÷', '^'].includes(val)) return 'bg-ink-100 text-ink-700 hover:bg-ink-200';
    if (['sin(', 'cos(', 'tan(', 'log(', 'ln(', 'sqrt('].includes(val)) return 'bg-blue-50 text-blue-700 hover:bg-blue-100';
    return 'bg-white text-ink-950 hover:bg-ink-50 border border-ink-100';
  };

  return (
    <div className="max-w-sm mx-auto">
      {/* Display */}
      <div className="bg-ink-950 rounded-xl p-4 mb-4">
        <div className="text-xs text-ink-400 dark:text-ink-300 font-mono mb-1 h-5 overflow-hidden text-right">
          {expr || ' '}
        </div>
        <div className="text-3xl text-white font-mono text-right truncate">
          {display}
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setIsRad(true)}
          className={`flex-1 py-1 rounded-lg text-xs font-medium transition-colors ${isRad ? 'bg-ink-950 text-white' : 'bg-ink-100 text-ink-600'}`}
        >
          弧度
        </button>
        <button
          onClick={() => setIsRad(false)}
          className={`flex-1 py-1 rounded-lg text-xs font-medium transition-colors ${!isRad ? 'bg-ink-950 text-white' : 'bg-ink-100 text-ink-600'}`}
        >
          角度
        </button>
        <button
          onClick={() => handleBtn('⌫')}
          className="px-4 py-1 rounded-lg text-xs font-medium bg-ink-100 text-ink-600 hover:bg-ink-200 transition-colors"
        >
          ⌫
        </button>
      </div>

      {/* Buttons */}
      <div className="space-y-2">
        {buttons.map((row, ri) => (
          <div key={ri} className="grid grid-cols-4 gap-2">
            {row.map((btn) => (
              <button
                key={btn}
                onClick={() => handleBtn(btn)}
                className={`py-3 rounded-lg text-sm font-medium transition-all active:scale-95 ${getBtnStyle(btn)}`}
              >
                {btn.replace('sqrt(', '√').replace('log(', 'log').replace('ln(', 'ln').replace('sin(', 'sin').replace('cos(', 'cos').replace('tan(', 'tan')}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="mt-4 pt-3 border-t border-ink-100">
          <div className="text-xs text-ink-400 dark:text-ink-300 mb-2">历史记录</div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {history.map((h, i) => (
              <div key={i} className="text-xs text-ink-500 dark:text-ink-200 font-mono">{h}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

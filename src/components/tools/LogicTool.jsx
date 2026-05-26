import { useState, useMemo } from 'react';

const OPS = {
  '¬': { prec: 4, fn: (a) => !a, name: '非', arity: 1 },
  '∧': { prec: 3, fn: (a, b) => a && b, name: '与', arity: 2 },
  '∨': { prec: 2, fn: (a, b) => a || b, name: '或', arity: 2 },
  '→': { prec: 1, fn: (a, b) => !a || b, name: '蕴含', arity: 2 },
  '↔': { prec: 0, fn: (a, b) => a === b, name: '等价', arity: 2 },
};

const PRESETS = [
  { label: 'p ∧ q', expr: 'p ∧ q' },
  { label: 'p ∨ q', expr: 'p ∨ q' },
  { label: '¬p → q', expr: '¬p → q' },
  { label: '(p → q) ↔ (¬q → ¬p)', expr: '(p → q) ↔ (¬q → ¬p)' },
  { label: 'p ∧ (q ∨ ¬r)', expr: 'p ∧ (q ∨ ¬r)' },
  { label: '德摩根定律', expr: '¬(p ∧ q) ↔ (¬p ∨ ¬q)' },
];

function tokenize(expr) {
  const tokens = [];
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i];
    if (ch === ' ') { i++; continue; }
    if ('()'.includes(ch)) { tokens.push({ type: 'paren', value: ch }); i++; continue; }
    if (Object.keys(OPS).includes(ch)) { tokens.push({ type: 'op', value: ch }); i++; continue; }
    // Variable: letter(s)
    let name = '';
    while (i < expr.length && /[a-zA-Z0-9]/.test(expr[i])) {
      name += expr[i]; i++;
    }
    if (name) tokens.push({ type: 'var', value: name });
  }
  return tokens;
}

function toRPN(tokens) {
  const output = [];
  const stack = [];
  for (const token of tokens) {
    if (token.type === 'var') {
      output.push(token);
    } else if (token.type === 'op') {
      if (token.value === '(') {
        stack.push(token);
      } else if (token.value === ')') {
        while (stack.length && stack[stack.length - 1].value !== '(') {
          output.push(stack.pop());
        }
        stack.pop(); // remove '('
      } else {
        const op = OPS[token.value];
        while (stack.length && stack[stack.length - 1].type === 'op' &&
               stack[stack.length - 1].value !== '(' &&
               OPS[stack[stack.length - 1].value].prec >= op.prec) {
          output.push(stack.pop());
        }
        stack.push(token);
      }
    }
  }
  while (stack.length) output.push(stack.pop());
  return output;
}

function evalRPN(rpn, vars) {
  const stack = [];
  for (const token of rpn) {
    if (token.type === 'var') {
      stack.push(vars[token.value] ?? false);
    } else if (token.type === 'op') {
      const op = OPS[token.value];
      if (op.arity === 1) {
        const a = stack.pop();
        stack.push(op.fn(a));
      } else {
        const b = stack.pop();
        const a = stack.pop();
        stack.push(op.fn(a, b));
      }
    }
  }
  return stack[0];
}

function extractVars(tokens) {
  const seen = new Set();
  return tokens.filter(t => t.type === 'var' && !seen.has(t.value) && seen.add(t.value)).map(t => t.value);
}

function getSubExpressions(tokens) {
  // Extract meaningful sub-expressions for display
  const subs = [];
  const rpn = toRPN(tokens);
  // Just return the full expression result
  return subs;
}

export default function LogicTool() {
  const [expr, setExpr] = useState('p → q');

  const result = useMemo(() => {
    try {
      const tokens = tokenize(expr);
      if (tokens.length === 0) return null;
      const vars = extractVars(tokens);
      if (vars.length === 0 || vars.length > 5) return null;
      const rpn = toRPN(tokens);

      // Generate all combinations
      const rows = [];
      const n = vars.length;
      for (let i = 0; i < (1 << n); i++) {
        const vals = {};
        vars.forEach((v, j) => { vals[v] = Boolean(i & (1 << (n - 1 - j))); });
        const result = evalRPN(rpn, vals);
        rows.push({ vals, result });
      }

      const trueCount = rows.filter(r => r.result).length;
      const isTautology = trueCount === rows.length;
      const isContradiction = trueCount === 0;
      const isContingency = !isTautology && !isContradiction;

      return { vars, rows, trueCount, isTautology, isContradiction, isContingency };
    } catch {
      return null;
    }
  }, [expr]);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input */}
      <div className="mb-4">
        <label className="text-sm text-ink-500 dark:text-ink-200 mb-1 block">
          输入逻辑表达式（变量用字母，运算符用按钮或直接输入）
        </label>
        <input
          type="text"
          value={expr}
          onChange={(e) => setExpr(e.target.value)}
          className="yi-input font-mono text-lg"
          placeholder="p → q"
        />
      </div>

      {/* Operator buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(OPS).map(([sym, op]) => (
          <button
            key={sym}
            onClick={() => setExpr(prev => prev + sym)}
            className="px-3 py-1.5 rounded-lg bg-ink-100 hover:bg-ink-200 text-ink-700 text-sm font-mono transition-colors"
          >
            {sym} {op.name}
          </button>
        ))}
        <button
          onClick={() => setExpr(prev => prev + '(')}
          className="px-3 py-1.5 rounded-lg bg-ink-100 hover:bg-ink-200 text-ink-700 text-sm font-mono transition-colors"
        >
          (
        </button>
        <button
          onClick={() => setExpr(prev => prev + ')')}
          className="px-3 py-1.5 rounded-lg bg-ink-100 hover:bg-ink-200 text-ink-700 text-sm font-mono transition-colors"
        >
          )
        </button>
        <button
          onClick={() => setExpr('')}
          className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-sm transition-colors"
        >
          清除
        </button>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2 mb-6">
        <span className="text-xs text-ink-400 dark:text-ink-300 self-center">预设：</span>
        {PRESETS.map((p, i) => (
          <button
            key={i}
            onClick={() => setExpr(p.expr)}
            className="px-2 py-1 rounded bg-ink-50 hover:bg-ink-100 text-xs text-ink-600 font-mono transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Truth table */}
      {result && (
        <div className="animate-fadeIn">
          {/* Summary */}
          <div className="flex gap-3 mb-4">
            {result.isTautology && (
              <span className="yi-badge bg-green-100 text-green-700">重言式（永真）</span>
            )}
            {result.isContradiction && (
              <span className="yi-badge bg-red-100 text-red-700">矛盾式（永假）</span>
            )}
            {result.isContingency && (
              <span className="yi-badge bg-blue-100 text-blue-700">可满足式（{result.trueCount}/{result.rows.length} 为真）</span>
            )}
          </div>

          {/* Table */}
          <div className="yi-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-mono">
                <thead>
                  <tr className="bg-ink-50">
                    {result.vars.map(v => (
                      <th key={v} className="px-4 py-2 text-center font-bold text-ink-700 border-b border-ink-100">
                        {v}
                      </th>
                    ))}
                    <th className="px-4 py-2 text-center font-bold text-ink-950 border-b border-ink-200 bg-ink-100">
                      {expr}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row, i) => (
                    <tr key={i} className={`${row.result ? 'bg-green-50/50' : 'bg-red-50/30'} hover:bg-ink-50 transition-colors`}>
                      {result.vars.map(v => (
                        <td key={v} className="px-4 py-1.5 text-center border-b border-ink-50">
                          <span className={row.vals[v] ? 'text-green-700' : 'text-red-500'}>
                            {row.vals[v] ? 'T' : 'F'}
                          </span>
                        </td>
                      ))}
                      <td className="px-4 py-1.5 text-center font-bold border-b border-ink-100">
                        <span className={row.result ? 'text-green-700' : 'text-red-500'}>
                          {row.result ? 'T' : 'F'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {!result && expr.trim() && (
        <div className="yi-card p-4 text-center text-sm text-ink-400 dark:text-ink-300">
          无法解析表达式。请检查语法。
        </div>
      )}
    </div>
  );
}

import { useState, useMemo } from 'react';

export default function StatsTool() {
  const [input, setInput] = useState('1, 2, 3, 4, 5, 6, 7, 8, 9, 10');

  const stats = useMemo(() => {
    const numbers = input
      .split(/[,;\s\n]+/)
      .map(s => parseFloat(s.trim()))
      .filter(n => !isNaN(n));

    if (numbers.length === 0) return null;

    const sorted = [...numbers].sort((a, b) => a - b);
    const n = numbers.length;
    const sum = numbers.reduce((a, b) => a + b, 0);
    const mean = sum / n;
    const variance = numbers.reduce((s, x) => s + (x - mean) ** 2, 0) / n;
    const stdDev = Math.sqrt(variance);
    const median = n % 2 === 0
      ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
      : sorted[Math.floor(n / 2)];
    const min = sorted[0];
    const max = sorted[n - 1];
    const range = max - min;
    const q1 = sorted[Math.floor(n * 0.25)];
    const q3 = sorted[Math.floor(n * 0.75)];
    const iqr = q3 - q1;
    const sumSq = numbers.reduce((s, x) => s + x * x, 0);

    return { n, sum, mean, variance, stdDev, median, min, max, range, q1, q3, iqr, sumSq, sorted };
  }, [input]);

  // Simple histogram
  const histogram = useMemo(() => {
    if (!stats) return [];
    const bins = 8;
    const binWidth = (stats.max - stats.min) / bins || 1;
    const buckets = Array(bins).fill(0);
    stats.sorted.forEach(v => {
      const idx = Math.min(Math.floor((v - stats.min) / binWidth), bins - 1);
      buckets[idx]++;
    });
    const maxCount = Math.max(...buckets);
    return buckets.map((count, i) => ({
      label: (stats.min + i * binWidth).toFixed(1),
      count,
      height: maxCount > 0 ? (count / maxCount) * 100 : 0,
    }));
  }, [stats]);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Input */}
      <div className="mb-4">
        <label className="text-sm text-ink-500 mb-1 block">
          输入数据（用逗号、空格或换行分隔）
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="yi-input h-24 resize-none font-mono"
          placeholder="1, 2, 3, 4, 5"
        />
      </div>

      {stats && (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {[
              { label: '样本数 n', value: stats.n },
              { label: '均值 x̄', value: stats.mean.toFixed(4) },
              { label: '中位数', value: stats.median.toFixed(4) },
              { label: '标准差 σ', value: stats.stdDev.toFixed(4) },
              { label: '方差 σ²', value: stats.variance.toFixed(4) },
              { label: '最小值', value: stats.min },
              { label: '最大值', value: stats.max },
              { label: '极差 R', value: stats.range },
            ].map((s, i) => (
              <div key={i} className="yi-card p-3">
                <div className="text-xs text-ink-400">{s.label}</div>
                <div className="text-lg font-bold font-mono text-ink-950">{s.value}</div>
              </div>
            ))}
          </div>

          {/* Box plot info */}
          <div className="yi-card p-4 mb-4">
            <h3 className="text-sm font-bold text-ink-500 mb-3">五数概括</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-ink-400 w-16">{stats.min}</span>
              <div className="flex-1 relative h-8 bg-ink-50 rounded-lg overflow-hidden">
                {/* IQR box */}
                <div
                  className="absolute top-1 bottom-1 bg-ink-200 rounded"
                  style={{
                    left: `${((stats.q1 - stats.min) / stats.range) * 100}%`,
                    width: `${(stats.iqr / stats.range) * 100}%`,
                  }}
                />
                {/* Median line */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-ink-950"
                  style={{ left: `${((stats.median - stats.min) / stats.range) * 100}%` }}
                />
              </div>
              <span className="text-xs text-ink-400 w-16 text-right">{stats.max}</span>
            </div>
            <div className="flex justify-between text-[10px] text-ink-400 mt-1 px-[4.5rem]">
              <span>Q1={stats.q1.toFixed(2)}</span>
              <span>Median={stats.median.toFixed(2)}</span>
              <span>Q3={stats.q3.toFixed(2)}</span>
            </div>
          </div>

          {/* Histogram */}
          <div className="yi-card p-4">
            <h3 className="text-sm font-bold text-ink-500 mb-3">频率分布</h3>
            <div className="flex items-end gap-1 h-32">
              {histogram.map((bin, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div className="text-[10px] text-ink-400 mb-0.5">{bin.count}</div>
                  <div
                    className="w-full rounded-t bg-ink-300 hover:bg-ink-400 transition-colors"
                    style={{ height: `${bin.height}%`, minHeight: bin.count > 0 ? '4px' : '0' }}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-1 mt-1">
              {histogram.map((bin, i) => (
                <div key={i} className="flex-1 text-center text-[9px] text-ink-300 truncate">
                  {bin.label}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

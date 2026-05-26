import { useMemo, useEffect, useRef } from 'react';
import { LEVELS, DOMAIN_COLORS } from '../data/knowledgeTree';

function highlightMatch(text, query) {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  if (parts.length === 1) return text;
  const lowerQuery = query.toLowerCase();
  return parts.map((part, i) =>
    part.toLowerCase() === lowerQuery
      ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 dark:text-yellow-100 text-ink-950 rounded px-0.5">{part}</mark>
      : part
  );
}

function getContentPreview(content, query, maxLen = 120) {
  if (!content) return '';
  if (!query.trim()) return content.slice(0, maxLen) + (content.length > maxLen ? '...' : '');
  const idx = content.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return content.slice(0, maxLen) + (content.length > maxLen ? '...' : '');
  const start = Math.max(0, idx - 40);
  const end = Math.min(content.length, idx + query.length + 80);
  const preview = (start > 0 ? '...' : '') + content.slice(start, end) + (end < content.length ? '...' : '');
  return preview;
}

export default function SearchResults({ results, query, selectedIndex, onSelect, notes }) {
  const containerRef = useRef(null);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex < 0 || !containerRef.current) return;
    const selected = containerRef.current.querySelector('[data-selected="true"]');
    if (selected) selected.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selectedIndex]);

  // Group results by domain
  const grouped = useMemo(() => {
    const map = {};
    for (const node of results) {
      const domainId = node.domain.id;
      if (!map[domainId]) {
        map[domainId] = { domain: node.domain, items: [] };
      }
      map[domainId].items.push(node);
    }
    return Object.values(map);
  }, [results]);

  return (
    <div ref={containerRef} className="max-w-3xl mx-auto animate-fadeIn">
      <h2 className="text-xl font-bold text-ink-950 dark:text-ink-50 mb-1">
        搜索 "{query}"
      </h2>
      <p className="text-sm text-ink-400 dark:text-ink-300 mb-6">找到 {results.length} 个结果</p>

      {results.length === 0 ? (
        <div className="yi-card p-8 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-ink-500 dark:text-ink-200">没有找到相关内容</p>
          <p className="text-sm text-ink-400 dark:text-ink-300 mt-1">试试其他关键词</p>
        </div>
      ) : (
        <div className="space-y-6">
          {(() => {
            let globalIdx = 0;
            return grouped.map(({ domain, items }) => {
              const color = DOMAIN_COLORS[domain.id] || {};
              return (
                <div key={domain.id}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{domain.icon}</span>
                    <span className="text-sm font-bold text-ink-700 dark:text-ink-200">{domain.name}</span>
                    <span className="text-xs text-ink-300 dark:text-ink-400">{items.length} 个结果</span>
                  </div>
                  <div className="space-y-2">
                    {items.map((node) => {
                      const level = LEVELS[node.level];
                      const idx = globalIdx++;
                      const isSelected = idx === selectedIndex;
                      return (
                        <button
                          key={node.id}
                          onClick={() => onSelect(node)}
                          data-selected={isSelected || undefined}
                          className={`yi-card p-4 w-full text-left transition-all group ${isSelected ? 'ring-2 ring-ink-950 dark:ring-ink-100 shadow-md' : 'hover:shadow-md'}`}
                          style={{ borderLeft: `3px solid ${color.accent || '#333'}` }}
                        >
                        <div className="flex items-start gap-3">
                          <span
                            className="w-2 h-2 rounded-full mt-2 shrink-0"
                            style={{ background: level.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-bold text-ink-950 dark:text-ink-50 group-hover:text-ink-700 dark:group-hover:text-ink-200">
                                {highlightMatch(node.name, query)}
                              </span>
                              <span
                                className="yi-badge text-[10px]"
                                style={{ background: level.color + '20', color: level.color }}
                              >
                                {level.name}
                              </span>
                              <span className="text-[10px] text-ink-300 dark:text-ink-400">
                                ⏱ {Math.max(1, Math.ceil(((node.content?.length || 0) + ((node.exercises || []).join('').length)) / 350))}分钟
                              </span>
                              {node.matchedNote && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                                  📝 笔记
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-ink-500 dark:text-ink-400 leading-relaxed line-clamp-2">
                              {highlightMatch(getContentPreview(node.content, query), query)}
                            </p>
                            {node.matchedNote && notes?.[node.id]?.text && (
                              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1.5 line-clamp-2 leading-relaxed">
                                📝 {highlightMatch(getContentPreview(notes[node.id].text, query, 100), query)}
                              </p>
                            )}
                            {node.keywords && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {node.keywords.filter(k => k.toLowerCase().includes(query.toLowerCase())).slice(0, 3).map((kw, i) => (
                                  <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200">
                                    {kw}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          });
        })()}
        </div>
      )}
    </div>
  );
}

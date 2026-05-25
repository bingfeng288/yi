import { useState, useMemo } from 'react';
import { LEVELS } from '../data/knowledgeTree';

export default function Sidebar({ tree, expanded, onToggle, onSelect, selectedId, visited, bookmarks, isOpen, onClose }) {
  const [filter, setFilter] = useState('');
  const totalTopics = tree.reduce((s, d) => s + d.children.length, 0);

  const normalizedFilter = filter.trim().toLowerCase();

  // Filter domains and topics
  const filteredDomains = useMemo(() => {
    if (!normalizedFilter) return tree;
    return tree
      .map(domain => {
        const matchingChildren = domain.children.filter(node =>
          node.name.toLowerCase().includes(normalizedFilter) ||
          node.keywords?.some(k => k.toLowerCase().includes(normalizedFilter))
        );
        if (matchingChildren.length === 0) return null;
        return { ...domain, filteredChildren: matchingChildren };
      })
      .filter(Boolean);
  }, [tree, normalizedFilter]);

  const matchCount = useMemo(() => {
    if (!normalizedFilter) return 0;
    return filteredDomains.reduce((s, d) => s + d.filteredChildren.length, 0);
  }, [filteredDomains, normalizedFilter]);

  // Domains to show: either all (no filter) or filtered
  const domainsToShow = normalizedFilter ? filteredDomains : tree;

  // Auto-expand domains when filtering
  const isExpanded = (domainId) => {
    if (normalizedFilter) return true; // always expand when filtering
    return expanded.has(domainId);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/20 z-30"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:relative fixed top-14 left-0 bottom-0 z-40
          w-72 bg-white border-r border-ink-200 flex flex-col
          transition-transform duration-200 shrink-0
        `}
      >
        {/* Filter input */}
        <div className="px-3 pt-3 pb-2 shrink-0">
          <div className="relative">
            <svg
              width="14" height="14" viewBox="0 0 14 14" fill="none"
              stroke="currentColor" strokeWidth="1.5"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-300"
            >
              <circle cx="6" cy="6" r="4.5" />
              <path d="M9.5 9.5L13 13" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="搜索专题..."
              className="yi-input w-full pl-8 pr-8 py-1.5 text-xs"
            />
            {filter && (
              <button
                onClick={() => setFilter('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-500 text-xs"
              >
                ✕
              </button>
            )}
          </div>
          {normalizedFilter && (
            <p className="text-[10px] text-ink-300 mt-1.5 px-0.5">
              找到 {matchCount} 个专题
            </p>
          )}
        </div>

        {/* Scrollable tree */}
        <div className="flex-1 overflow-y-auto p-3 pt-1">
          {/* Mobile close button */}
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden w-full flex items-center justify-end px-3 py-1 mb-1 text-ink-400 hover:text-ink-600"
              aria-label="关闭侧栏"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
              </svg>
            </button>
          )}

          {domainsToShow.length === 0 && normalizedFilter && (
            <div className="text-center py-8">
              <p className="text-ink-400 text-sm">没有匹配的专题</p>
              <button
                onClick={() => setFilter('')}
                className="text-xs text-ink-300 hover:text-ink-500 mt-2"
              >
                清除筛选
              </button>
            </div>
          )}

          {domainsToShow.map((domain) => {
            const { filteredChildren, ...cleanDomain } = domain;
            const children = filteredChildren || domain.children;
            return (
              <div key={domain.id} className="mb-1">
                {/* Domain header */}
                <button
                  onClick={() => onToggle(domain.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg
                             hover:bg-ink-50 transition-colors text-left group"
                >
                  <span className="text-lg">{domain.icon}</span>
                  <span className="flex-1 font-bold text-sm text-ink-950">{domain.name}</span>
                  <span className="text-[10px] text-ink-300 mr-1">
                    {normalizedFilter ? `${children.length}/${domain.children.length}` : domain.children.length}
                  </span>
                  <svg
                    width="14" height="14" viewBox="0 0 14 14" fill="none"
                    stroke="currentColor" strokeWidth="1.5"
                    className={`text-ink-400 transition-transform ${isExpanded(domain.id) ? 'rotate-90' : ''}`}
                  >
                    <path d="M5 3l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {/* Children */}
                {isExpanded(domain.id) && (
                  <div className="ml-2 pl-3 border-l border-ink-100 animate-fadeIn">
                    {children.map((node) => {
                      const level = LEVELS[node.level];
                      const isSelected = selectedId === node.id;
                      const isVisited = visited.has(node.id);

                      return (
                        <button
                          key={node.id}
                          onClick={() => onSelect(node, cleanDomain)}
                          className={`
                            w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all mb-0.5
                            flex items-center gap-2 group
                            ${isSelected
                              ? 'bg-ink-950 text-white'
                              : 'hover:bg-ink-50 text-ink-700'}
                          `}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ background: isSelected ? '#fff' : level.color }}
                          />
                          <span className="flex-1 truncate">{node.name}</span>
                          {bookmarks?.has(node.id) && !isSelected && (
                            <span className="text-yellow-500 text-xs">★</span>
                          )}
                          {isVisited && !isSelected && !bookmarks?.has(node.id) && (
                            <span className="text-ink-300 text-xs">✓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sticky footer */}
        <div className="shrink-0 px-3 py-2.5 border-t border-ink-100 bg-white">
          <div className="flex justify-between text-[11px] text-ink-400">
            <span>{tree.length} 学科</span>
            <span>{totalTopics} 专题</span>
            {visited.size > 0 && (
              <span className="text-ink-600">已学 {visited.size}</span>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

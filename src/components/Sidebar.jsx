import { useState, useMemo } from 'react';
import { LEVELS } from '../data/knowledgeTree';

export default function Sidebar({ tree, expanded, onToggle, onSelect, selectedId, visited, mastered, bookmarks, isOpen, onClose }) {
  const [filter, setFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState(null); // null = all, 0-4 = specific level
  const totalTopics = tree.reduce((s, d) => s + d.children.length, 0);

  const normalizedFilter = filter.trim().toLowerCase();
  const isFiltering = normalizedFilter || levelFilter !== null;

  // Filter domains and topics (text + level)
  const filteredDomains = useMemo(() => {
    if (!isFiltering) return tree;
    return tree
      .map(domain => {
        // Text filter: domain name matches → show all children (then apply level filter)
        const textMatchDomain = normalizedFilter && domain.name.toLowerCase().includes(normalizedFilter);
        const children = domain.children.filter(node => {
          // Level filter
          if (levelFilter !== null && node.level !== levelFilter) return false;
          // Text filter
          if (!normalizedFilter) return true;
          if (textMatchDomain) return true;
          return node.name.toLowerCase().includes(normalizedFilter) ||
            node.keywords?.some(k => k.toLowerCase().includes(normalizedFilter));
        });
        if (children.length === 0) return null;
        if (children.length === domain.children.length) return domain; // no filtering happened
        return { ...domain, filteredChildren: children };
      })
      .filter(Boolean);
  }, [tree, normalizedFilter, levelFilter]);

  const matchCount = useMemo(() => {
    if (!isFiltering) return 0;
    return filteredDomains.reduce((s, d) => s + (d.filteredChildren || d.children).length, 0);
  }, [filteredDomains, isFiltering]);

  // Domains to show: either all (no filter) or filtered
  const domainsToShow = isFiltering ? filteredDomains : tree;

  // Auto-expand domains when filtering
  const isExpanded = (domainId) => {
    if (isFiltering) return true; // always expand when filtering
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
          w-72 bg-white dark:bg-ink-950 border-r border-ink-200 dark:border-ink-800 flex flex-col
          transition-transform duration-200 shrink-0
        `}
      >
        {/* Filter input */}
        <div className="px-3 pt-3 pb-2 shrink-0">
          <div className="relative">
            <svg
              width="14" height="14" viewBox="0 0 14 14" fill="none"
              stroke="currentColor" strokeWidth="1.5"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-300 dark:text-ink-500"
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
            <p className="text-[10px] text-ink-300 dark:text-ink-400 mt-1.5 px-0.5">
              找到 {matchCount} 个专题
            </p>
          )}
          {/* Level filter */}
          <div className="flex gap-1 mt-2 flex-wrap">
            <button
              onClick={() => setLevelFilter(null)}
              className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                levelFilter === null
                  ? 'bg-ink-950 dark:bg-ink-100 text-white dark:text-ink-950 font-medium'
                  : 'text-ink-400 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800'
              }`}
            >
              全部
            </button>
            {Object.entries(LEVELS).map(([key, lv]) => (
              <button
                key={key}
                onClick={() => setLevelFilter(levelFilter === Number(key) ? null : Number(key))}
                className={`px-2 py-0.5 rounded text-[10px] transition-colors flex items-center gap-1 ${
                  levelFilter === Number(key)
                    ? 'font-medium'
                    : 'text-ink-400 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800'
                }`}
                style={levelFilter === Number(key) ? { background: lv.color + '20', color: lv.color } : {}}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: lv.color }} />
                {lv.name}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable tree */}
        <div className="flex-1 overflow-y-auto p-3 pt-1">
          {/* Mobile close button */}
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden w-full flex items-center justify-end px-3 py-1 mb-1 text-ink-400 dark:text-ink-300 hover:text-ink-600 dark:hover:text-ink-200"
              aria-label="关闭侧栏"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
              </svg>
            </button>
          )}

          {domainsToShow.length === 0 && isFiltering && (
            <div className="text-center py-8">
              <p className="text-ink-400 dark:text-ink-300 text-sm">没有匹配的专题</p>
              <button
                onClick={() => { setFilter(''); setLevelFilter(null); }}
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
                             hover:bg-ink-50 dark:hover:bg-ink-900 transition-colors text-left group"
                >
                  <span className="text-lg">{domain.icon}</span>
                  <span className="flex-1 font-bold text-sm text-ink-950 dark:text-ink-50">{domain.name}</span>
                  <span className="text-[10px] text-ink-300 dark:text-ink-400 mr-1">
                    {isFiltering ? `${(domain.filteredChildren || domain.children).length}/${domain.children.length}` : domain.children.length}
                  </span>
                  <svg
                    width="14" height="14" viewBox="0 0 14 14" fill="none"
                    stroke="currentColor" strokeWidth="1.5"
                    className={`text-ink-400 dark:text-ink-300 transition-transform ${isExpanded(domain.id) ? 'rotate-90' : ''}`}
                  >
                    <path d="M5 3l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {/* Children */}
                {isExpanded(domain.id) && (
                  <div className="ml-2 pl-3 border-l border-ink-100 dark:border-ink-800 animate-fadeIn">
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
                              ? 'bg-ink-950 dark:bg-ink-100 text-white dark:text-ink-950'
                              : 'hover:bg-ink-50 dark:hover:bg-ink-900 text-ink-700 dark:text-ink-300'}
                          `}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ background: isSelected ? (document.documentElement.classList.contains('dark') ? '#2c261f' : '#fff') : level.color }}
                          />
                          <span className="flex-1 truncate">{node.name}</span>
                          {bookmarks?.has(node.id) && !isSelected && (
                            <span className="text-yellow-500 text-xs">★</span>
                          )}
                          {mastered?.has(node.id) && !isSelected && !bookmarks?.has(node.id) && (
                            <span className="text-green-500 text-xs">✓</span>
                          )}
                          {isVisited && !mastered?.has(node.id) && !isSelected && !bookmarks?.has(node.id) && (
                            <span className="text-ink-400 dark:text-ink-300 text-xs">○</span>
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
        <div className="shrink-0 px-3 py-2.5 border-t border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-950">
          <div className="flex justify-between text-[11px] text-ink-400 dark:text-ink-300">
            <span>{tree.length} 学科</span>
            <span>{isFiltering ? `${matchCount}/${totalTopics}` : totalTopics} 专题</span>
            {visited.size > 0 && (
              <span className="text-ink-600 dark:text-ink-300">已学 {visited.size}</span>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

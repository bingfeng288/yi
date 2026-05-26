import { useMemo } from 'react';
import { prerequisites } from '../data/learningPath';
import { LEVELS } from '../data/knowledgeTree';

// Get all ancestors (prerequisites chain) for a topic
function getAncestors(topicId, visited = new Set()) {
  if (visited.has(topicId)) return [];
  visited.add(topicId);
  const prereqs = prerequisites[topicId] || [];
  const result = [];
  for (const pid of prereqs) {
    result.push(...getAncestors(pid, visited), pid);
  }
  return [...new Set(result)];
}

// Get direct children (topics that have this topic as prerequisite)
function getChildren(topicId) {
  const children = [];
  for (const [id, prereqs] of Object.entries(prerequisites)) {
    if (prereqs.includes(topicId)) {
      children.push(id);
    }
  }
  return children;
}

// Get all descendants
function getDescendants(topicId, visited = new Set()) {
  if (visited.has(topicId)) return [];
  visited.add(topicId);
  const children = getChildren(topicId);
  const result = [...children];
  for (const cid of children) {
    result.push(...getDescendants(cid, visited));
  }
  return [...new Set(result)];
}

// Build a path chain from entry to current
function buildPathChain(topicId) {
  const prereqs = prerequisites[topicId] || [];
  if (prereqs.length === 0) return [[topicId]];

  // Find the longest path from an entry point to this topic
  const ancestors = getAncestors(topicId);
  // Build a simple linear chain via BFS from topicId backwards
  const chain = [];
  let current = topicId;
  const visited = new Set([topicId]);

  // Walk backwards through prerequisites
  while (current) {
    chain.unshift(current);
    const prereqList = prerequisites[current] || [];
    if (prereqList.length === 0) break;
    // Pick the first unvisited prerequisite
    const next = prereqList.find(p => !visited.has(p));
    if (!next) break;
    visited.add(next);
    current = next;
  }

  return chain;
}

export default function LearningPath({ topicId, topicMap, visited, onSelect }) {
  const pathData = useMemo(() => {
    if (!topicId || !topicMap[topicId]) return null;

    const chain = buildPathChain(topicId);
    const unlocks = getChildren(topicId);
    const allDescendants = getDescendants(topicId);

    // Determine status of each node in chain
    const chainNodes = chain.map(id => ({
      id,
      topic: topicMap[id],
      isVisited: visited.has(id),
      isCurrent: id === topicId,
    }));

    // Unlocks with status
    const unlockNodes = unlocks.map(id => ({
      id,
      topic: topicMap[id],
      isVisited: visited.has(id),
      prerequisitesMet: (prerequisites[id] || []).every(p => visited.has(p)),
    }));

    // Stats
    const ancestors = getAncestors(topicId);
    const ancestorsVisited = ancestors.filter(id => visited.has(id)).length;
    const descendantsVisited = allDescendants.filter(id => visited.has(id)).length;

    return {
      chain: chainNodes,
      unlocks: unlockNodes,
      stats: {
        ancestorsTotal: ancestors.length,
        ancestorsVisited,
        descendantsTotal: allDescendants.length,
        descendantsVisited,
      },
    };
  }, [topicId, topicMap, visited]);

  if (!pathData) return null;

  return (
    <div className="yi-card p-5 mb-6">
      <h3 className="text-sm font-bold text-ink-500 dark:text-ink-200 mb-4 flex items-center gap-2">
        <span className="text-ink-300">🗺</span> 学习路径
      </h3>

      {/* Prerequisite chain */}
      <div className="mb-4">
        <p className="text-[11px] text-ink-400 dark:text-ink-300 mb-2">前置知识链</p>
        <div className="flex items-center gap-1 flex-wrap">
          {pathData.chain.map((node, i) => {
            const level = LEVELS[node.topic?.level] || LEVELS[0];
            return (
              <span key={node.id} className="flex items-center gap-1">
                {i > 0 && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink-300 shrink-0">
                    <path d="M3 6h6M7 3l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {node.isCurrent ? (
                  <span className="px-2 py-1 rounded-lg bg-ink-950 dark:bg-ink-100 text-white dark:text-ink-950 text-xs font-bold">
                    {node.topic?.name}
                  </span>
                ) : node.isVisited ? (
                  <button
                    onClick={() => node.topic && onSelect(node.topic, node.topic.domain)}
                    className="px-2 py-1 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                  >
                    ✓ {node.topic?.name}
                  </button>
                ) : (
                  <button
                    onClick={() => node.topic && onSelect(node.topic, node.topic.domain)}
                    className="px-2 py-1 rounded-lg bg-ink-50 dark:bg-ink-800 text-ink-500 dark:text-ink-200 text-xs border border-ink-200 dark:border-ink-700 hover:bg-ink-100 dark:hover:bg-ink-700 transition-colors"
                  >
                    {node.topic?.name}
                  </button>
                )}
              </span>
            );
          })}
        </div>
      </div>

      {/* Unlocks */}
      {pathData.unlocks.length > 0 && (
        <div className="mb-4">
          <p className="text-[11px] text-ink-400 dark:text-ink-300 mb-2">解锁后续专题</p>
          <div className="flex flex-wrap gap-1.5">
            {pathData.unlocks.map((node) => {
              const level = LEVELS[node.topic?.level] || LEVELS[0];
              return (
                <button
                  key={node.id}
                  onClick={() => node.topic && onSelect(node.topic, node.topic.domain)}
                  className={`px-2 py-1 rounded-lg text-xs transition-all flex items-center gap-1
                    ${node.isVisited
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                      : node.prerequisitesMet
                        ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/40'
                        : 'bg-ink-50 dark:bg-ink-800 text-ink-400 dark:text-ink-300 border border-ink-200 dark:border-ink-700'}`}
                >
                  {node.isVisited ? '✓' : node.prerequisitesMet ? '🔓' : '🔒'}
                  {node.topic?.name}
                  <span className="text-[9px] opacity-60" style={{ color: level.color }}>{level.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Path stats */}
      <div className="flex gap-4 text-[11px] text-ink-400 dark:text-ink-300 pt-2 border-t border-ink-100 dark:border-ink-800">
        {pathData.stats.ancestorsTotal > 0 && (
          <span>前置 {pathData.stats.ancestorsVisited}/{pathData.stats.ancestorsTotal} 已学</span>
        )}
        {pathData.stats.descendantsTotal > 0 && (
          <span>后续 {pathData.stats.descendantsVisited}/{pathData.stats.descendantsTotal} 已学</span>
        )}
      </div>
    </div>
  );
}

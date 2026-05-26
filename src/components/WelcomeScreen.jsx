import { LEVELS, DOMAIN_COLORS } from '../data/knowledgeTree';
import CollapsibleSection from './CollapsibleSection';
import StreakDisplay from './StreakDisplay';

export default function WelcomeScreen({ tree, quote, onSelect, visited, mastered, recommendations, bookmarks, recent, topicMap, onRandom, dailyVisits, dailyGoal, onSetDailyGoal, reviewDue, reviewStats }) {
  const handleRandom = () => {
    if (onRandom) onRandom();
    const domains = tree;
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const topic = domain.children[Math.floor(Math.random() * domain.children.length)];
    onSelect(topic, domain);
  };

  const totalTopics = tree.reduce((s, d) => s + d.children.length, 0);
  const progressPct = totalTopics > 0 ? Math.round((visited.size / totalTopics) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      {/* Title */}
      <div className="text-center mb-10">
        <div className="text-6xl mb-4">☰</div>
        <h1 className="text-4xl font-bold text-ink-950 dark:text-ink-50 mb-2">易</h1>
        <p className="text-lg text-ink-500 dark:text-ink-200">全学科知识体系</p>
        <p className="text-sm text-ink-400 dark:text-ink-300 mt-1">简易 · 变易 · 不易</p>
        <button
          onClick={handleRandom}
          className="mt-4 px-5 py-2 rounded-full bg-ink-950 text-white text-sm hover:bg-ink-900 transition-colors"
        >
          🎲 随机探索
        </button>
      </div>

      {/* Quote */}
      <div className="yi-card p-6 mb-8 text-center">
        <p className="text-lg text-ink-700 dark:text-ink-300 font-serif italic">"{quote.text}"</p>
        <p className="text-sm text-ink-400 dark:text-ink-300 mt-2">—— {quote.source}</p>
      </div>

      {/* Streak & Daily Goal */}
      <StreakDisplay dailyVisits={dailyVisits} dailyGoal={dailyGoal} onSetDailyGoal={onSetDailyGoal} />

      {/* Continue Learning */}
      {recent && recent.length > 0 && (() => {
        const lastTopic = topicMap[recent[0]];
        if (!lastTopic) return null;
        return (
          <button
            onClick={() => onSelect(lastTopic, lastTopic.domain)}
            className="yi-card p-5 mb-8 w-full text-left hover:shadow-md transition-all group flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-ink-950 dark:bg-ink-100 text-white dark:text-ink-950 flex items-center justify-center text-2xl shrink-0">
              {lastTopic.domain.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-ink-400 dark:text-ink-300 mb-0.5">继续学习</p>
              <p className="text-lg font-bold text-ink-950 dark:text-ink-50 group-hover:text-ink-700 dark:group-hover:text-ink-200 truncate">{lastTopic.name}</p>
              <p className="text-xs text-ink-400 dark:text-ink-300">{lastTopic.domain.name}</p>
            </div>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-300 group-hover:text-ink-600 shrink-0 transition-colors">
              <path d="M7 4l8 6-8 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        );
      })()}

      {/* Review queue */}
      {reviewDue && reviewDue.length > 0 && (
        <div className="yi-card p-5 mb-8 border-l-4 border-amber-400">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-ink-950 dark:text-ink-50 flex items-center gap-2">
              <span className="text-lg">🔄</span> 待复习
            </h3>
            <span className="text-xs text-ink-400 dark:text-ink-300">{reviewDue.length} 个专题</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {reviewDue.slice(0, 8).map((item) => {
              const topic = topicMap[item.topicId];
              if (!topic) return null;
              return (
                <button
                  key={item.topicId}
                  onClick={() => onSelect(topic, topic.domain)}
                  className="yi-card px-3 py-2 text-sm hover:shadow-md transition-all flex items-center gap-2 group"
                >
                  <span>{topic.domain.icon}</span>
                  <span className="text-ink-950 dark:text-ink-50 group-hover:text-ink-700 dark:group-hover:text-ink-200">{topic.name}</span>
                  {item.overdueDays > 0 && (
                    <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                      超{item.overdueDays}天
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {reviewDue.length > 8 && (
            <p className="text-xs text-ink-300 mt-2">还有 {reviewDue.length - 8} 个待复习专题</p>
          )}
        </div>
      )}

      {/* Design Philosophy (collapsible) */}
      <CollapsibleSection id="philosophy" title="设计哲学" icon="☯" defaultOpen={true}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { principle: '简易', icon: '☯', desc: '大道至简——复杂现象背后的简洁规律', example: '数学用简单公式描述世界' },
            { principle: '变易', icon: '☰', desc: '万物皆变——变化是永恒的主题', example: '物理学研究变化的规律' },
            { principle: '不易', icon: '☷', desc: '变中有常——变化背后有不变的法则', example: '生物学揭示生命的恒常法则' },
            { principle: '第一性原理', icon: '🔬', desc: '从最基本的事实出发推理', example: '不依赖类比，追问不可再分的真理' },
          ].map((p, i) => (
            <div key={i} className="yi-card p-5">
              <div className="text-2xl mb-2">{p.icon}</div>
              <h3 className="font-bold text-ink-950 dark:text-ink-50 mb-1">{p.principle}</h3>
              <p className="text-sm text-ink-600 dark:text-ink-400 mb-2">{p.desc}</p>
              <p className="text-xs text-ink-400 dark:text-ink-300">{p.example}</p>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Domain grid with level distribution */}
      <CollapsibleSection id="domains" title="学科导航" icon="📚" defaultOpen={true}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 gap-3">
          {tree.map((domain) => {
            const done = domain.children.filter(c => visited.has(c.id)).length;
            const masteredCount = domain.children.filter(c => mastered?.has(c.id)).length;
            const total = domain.children.length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            // Level distribution for this domain
            const levelCounts = [0, 0, 0, 0, 0];
            for (const child of domain.children) {
              levelCounts[child.level] = (levelCounts[child.level] || 0) + 1;
            }
            return (
              <button
                key={domain.id}
                onClick={() => onSelect(domain.children[0], domain)}
                className="yi-card p-4 text-center hover:scale-[1.02] transition-transform cursor-pointer"
              >
                <div className="text-3xl mb-2">{domain.icon}</div>
                <div className="font-bold text-sm text-ink-950 dark:text-ink-50">{domain.name}</div>
                <div className="text-xs text-ink-400 dark:text-ink-300 mt-1">{total} 个专题</div>
                {/* Level distribution mini-bar */}
                <div className="flex h-1.5 rounded-full overflow-hidden mt-1.5 mx-auto max-w-[80%]">
                  {levelCounts.map((count, lv) =>
                    count > 0 ? (
                      <div
                        key={lv}
                        className="h-full"
                        style={{
                          width: `${(count / total) * 100}%`,
                          background: LEVELS[lv].color,
                        }}
                      />
                    ) : null
                  )}
                </div>
                {done > 0 && (
                  <div className="mt-2">
                    <div className="h-1.5 bg-ink-100 dark:bg-ink-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: DOMAIN_COLORS[domain.id]?.accent || '#333' }}
                      />
                    </div>
                    <div className="text-[10px] text-ink-300 mt-0.5">
                      {done}/{total}{masteredCount > 0 && <span className="text-green-600 ml-1">✓{masteredCount}</span>}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {/* Level legend */}
        <div className="flex items-center justify-center gap-3 mt-3 flex-wrap">
          {Object.entries(LEVELS).map(([key, lv]) => (
            <div key={key} className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: lv.color }} />
              <span className="text-[10px] text-ink-400 dark:text-ink-300">{lv.name}</span>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Learning recommendations */}
      {recommendations && recommendations.length > 0 && (
        <CollapsibleSection id="recommendations" title="推荐学习路径" icon="🗺" defaultOpen={true}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {recommendations.map((rec) => {
              const domain = tree.find(d => d.children?.some(c => c.id === rec.id));
              return (
                <button
                  key={rec.id}
                  onClick={() => onSelect(rec, domain)}
                  className="yi-card p-4 text-left hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{domain?.icon}</span>
                    <span className="text-xs text-ink-400 dark:text-ink-300">{domain?.name}</span>
                  </div>
                  <h3 className="font-bold text-sm text-ink-950 dark:text-ink-50 group-hover:text-ink-700 dark:group-hover:text-ink-200 mb-1">{rec.name}</h3>
                  <p className="text-xs text-ink-400 dark:text-ink-300 leading-relaxed">{rec.reason}</p>
                </button>
              );
            })}
          </div>
        </CollapsibleSection>
      )}

      {/* Recent topics (collapsible, default closed) */}
      {recent && recent.length > 0 && (
        <CollapsibleSection id="recent" title="最近浏览" icon="⏱" defaultOpen={false}>
          <div className="flex flex-wrap gap-2">
            {recent.map((id) => {
              const topic = topicMap[id];
              if (!topic) return null;
              return (
                <button
                  key={id}
                  onClick={() => onSelect(topic, topic.domain)}
                  className="yi-card px-3 py-2 text-sm hover:shadow-md transition-all flex items-center gap-2"
                >
                  <span>{topic.domain.icon}</span>
                  <span className="text-ink-950 dark:text-ink-50">{topic.name}</span>
                </button>
              );
            })}
          </div>
        </CollapsibleSection>
      )}

      {/* Bookmarks (collapsible, default closed) */}
      {bookmarks && bookmarks.size > 0 && (
        <CollapsibleSection id="bookmarks" title="收藏专题" icon="★" defaultOpen={false}>
          <div className="flex flex-wrap gap-2">
            {[...bookmarks].map((id) => {
              const topic = topicMap[id];
              if (!topic) return null;
              return (
                <button
                  key={id}
                  onClick={() => onSelect(topic, topic.domain)}
                  className="yi-card px-3 py-2 text-sm hover:shadow-md transition-all flex items-center gap-2"
                >
                  <span>{topic.domain.icon}</span>
                  <span className="text-ink-950 dark:text-ink-50">{topic.name}</span>
                </button>
              );
            })}
          </div>
        </CollapsibleSection>
      )}

      {/* Stats & progress (collapsible, default closed for returning users) */}
      {visited.size > 0 && (
        <CollapsibleSection id="stats" title="学习统计" icon="📊" defaultOpen={visited.size <= 5}>
          <div className="flex justify-center gap-6 text-sm text-ink-400 dark:text-ink-300 mb-3">
            <span>{totalTopics} 专题</span>
            <span>·</span>
            <span>{tree.length} 学科</span>
            <span>·</span>
            <span>入门→专家</span>
          </div>
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-xs text-ink-400 dark:text-ink-300 mb-1">
              <span>学习进度</span>
              <span>{visited.size}/{totalTopics} ({progressPct}%)</span>
            </div>
            <div className="h-2 bg-ink-100 dark:bg-ink-800 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-ink-950 dark:bg-ink-100 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            {/* Per-domain progress */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {tree.map((domain) => {
                const domainVisited = domain.children.filter(c => visited.has(c.id)).length;
                const domainTotal = domain.children.length;
                const pct = domainTotal > 0 ? Math.round((domainVisited / domainTotal) * 100) : 0;
                if (domainVisited === 0) return null;
                return (
                  <div key={domain.id} className="text-center">
                    <div className="text-xs text-ink-500 dark:text-ink-200 mb-1">{domain.icon} {domain.name}</div>
                    <div className="h-1.5 bg-ink-100 dark:bg-ink-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: DOMAIN_COLORS[domain.id]?.accent || '#333' }}
                      />
                    </div>
                    <div className="text-[10px] text-ink-300 mt-0.5">{domainVisited}/{domainTotal}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
}

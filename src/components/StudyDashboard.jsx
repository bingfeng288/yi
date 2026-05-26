import { useState, useRef, useEffect } from 'react';
import { LEVELS, DOMAIN_COLORS } from '../data/knowledgeTree';
import KnowledgeGraph from './KnowledgeGraph';
import { ACHIEVEMENTS } from '../data/achievements';
import { calcStreak, getTodayCount, getLast7Days, serializeDailyVisits } from '../data/streak';
import useFocusTrap from '../hooks/useFocusTrap';

export default function StudyDashboard({ isOpen, onClose, defaultTab, tree, visited, mastered, bookmarks, notes, recent, unlocked, dailyVisits, dailyGoal, onSetDailyGoal, exerciseProgress, reviewStats, reviewData, onSelect, onImport }) {
  const [activeTab, setActiveTab] = useState(defaultTab || 'overview');
  const [importMsg, setImportMsg] = useState('');
  const fileRef = useRef(null);
  const trapRef = useFocusTrap(isOpen);

  // Sync tab when opened with a specific defaultTab
  useEffect(() => {
    if (isOpen && defaultTab) setActiveTab(defaultTab);
  }, [isOpen, defaultTab]);

  if (!isOpen) return null;

  const totalTopics = tree.reduce((s, d) => s + d.children.length, 0);
  const progressPct = totalTopics > 0 ? Math.round((visited.size / totalTopics) * 100) : 0;

  // Build flat topic list with domain info
  const allTopics = tree.flatMap(d => d.children.map(c => ({ ...c, domain: d })));
  const bookmarkedTopics = allTopics.filter(t => bookmarks.has(t.id));
  const notedTopics = allTopics.filter(t => notes[t.id]);
  const recentTopics = (recent || []).map(id => allTopics.find(t => t.id === id)).filter(Boolean);

  // Per-domain stats
  const domainStats = tree.map(d => {
    const total = d.children.length;
    const done = d.children.filter(c => visited.has(c.id)).length;
    return { ...d, total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  }).filter(d => d.done > 0);

  // Level distribution
  const levelDist = {};
  for (const t of allTopics) {
    if (visited.has(t.id)) {
      levelDist[t.level] = (levelDist[t.level] || 0) + 1;
    }
  }

  const handleExport = () => {
    const data = {
      version: 6,
      exportedAt: new Date().toISOString(),
      visited: [...visited],
      mastered: mastered ? [...mastered] : [],
      bookmarks: [...bookmarks],
      notes,
      recent: recent || [],
      exercises: exerciseProgress || {},
      review: reviewData || {},
      dailyVisits: dailyVisits ? serializeDailyVisits(dailyVisits) : {},
      dailyGoal: dailyGoal || 3,
      unlocked: unlocked ? [...unlocked] : [],
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yi-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.visited && !data.notes && !data.bookmarks) {
          setImportMsg('无效的备份文件');
          return;
        }
        if (onImport) onImport(data);
        setImportMsg('导入成功！');
        setTimeout(() => setImportMsg(''), 2000);
      } catch {
        setImportMsg('文件解析失败');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const tabs = [
    { id: 'overview', label: '总览', icon: '📊' },
    { id: 'graph', label: '图谱', icon: '🕸' },
    { id: 'achievements', label: '成就', icon: '🏆' },
    { id: 'bookmarks', label: '收藏', icon: '★' },
    { id: 'notes', label: '笔记', icon: '📝' },
    { id: 'recent', label: '最近', icon: '⏱' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div ref={trapRef} className="relative ml-auto w-full max-w-lg bg-white dark:bg-ink-950 h-full shadow-2xl flex flex-col animate-slideInLeft" role="dialog" aria-modal="true" aria-label="学习中心">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100 dark:border-ink-800">
          <h2 className="text-lg font-bold text-ink-950 dark:text-ink-50">学习中心</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-400 dark:text-ink-300">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 4l10 10M14 4l-10 10" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-ink-100 dark:border-ink-800">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-1.5
                ${activeTab === t.id ? 'text-ink-950 dark:text-ink-50 border-b-2 border-ink-950 dark:border-ink-100' : 'text-ink-400 dark:text-ink-300 hover:text-ink-600 dark:hover:text-ink-200'}`}
            >
              <span>{t.icon}</span>
              <span className="hidden sm:inline">{t.label}</span>
              {t.id === 'bookmarks' && bookmarks.size > 0 && (
                <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">{bookmarks.size}</span>
              )}
              {t.id === 'notes' && notedTopics.length > 0 && (
                <span className="text-[10px] bg-ink-100 text-ink-600 px-1.5 py-0.5 rounded-full">{notedTopics.length}</span>
              )}
              {t.id === 'achievements' && unlocked && unlocked.size > 0 && (
                <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">{unlocked.size}</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Overall progress */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-ink-950 dark:text-ink-50">总体进度</span>
                  <span className="text-ink-400 dark:text-ink-300">{visited.size}/{totalTopics} ({progressPct}%)</span>
                </div>
                <div className="h-3 bg-ink-100 dark:bg-ink-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-ink-950 dark:bg-ink-100 rounded-full transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              {/* Quick stats */}
              {(() => {
                let exDone = 0;
                let exTotal = 0;
                for (const d of tree) {
                  for (const t of d.children) {
                    const count = t.exercises?.length || 0;
                    exTotal += count;
                    const prog = exerciseProgress?.[t.id];
                    if (prog) exDone += prog.completed.filter(i => i < count).length;
                  }
                }
                return (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {[
                      { label: '已学专题', value: visited.size, color: 'text-ink-950 dark:text-ink-50' },
                      { label: '已掌握', value: mastered?.size || 0, color: 'text-green-600' },
                      { label: '待复习', value: reviewStats?.dueCount || 0, color: 'text-amber-600' },
                      { label: '收藏专题', value: bookmarks.size, color: 'text-yellow-600' },
                      { label: '学习笔记', value: notedTopics.length, color: 'text-blue-600' },
                      { label: '练习完成', value: exDone, color: 'text-purple-600' },
                    ].map(s => (
                  <div key={s.label} className="yi-card p-3 text-center">
                    <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                    <div className="text-[11px] text-ink-400 dark:text-ink-300 mt-0.5">{s.label}</div>
                  </div>
                ))}
                  </div>
                );
              })()}

              {/* Streak info */}
              {dailyVisits && (
                <div className="yi-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{calcStreak(dailyVisits) > 0 ? '🔥' : '🕐'}</span>
                      <div>
                        <span className="text-lg font-bold text-ink-950 dark:text-ink-50">{calcStreak(dailyVisits)}</span>
                        <span className="text-xs text-ink-400 dark:text-ink-300 ml-1">天连续</span>
                      </div>
                    </div>
                    <div className="text-xs text-ink-400 dark:text-ink-300">
                      今日 {getTodayCount(dailyVisits)}/{dailyGoal} 篇
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {getLast7Days(dailyVisits).map((day) => {
                      const intensity = day.count === 0 ? 0 : day.count >= dailyGoal ? 2 : 1;
                      const colors = ['bg-ink-100 dark:bg-ink-800', 'bg-ink-400', 'bg-ink-950 dark:bg-ink-100'];
                      return (
                        <div key={day.date} className="flex-1 flex flex-col items-center gap-0.5">
                          <div
                            className={`w-full h-5 rounded-sm flex items-center justify-center text-[9px]
                              ${colors[intensity]} ${intensity === 0 ? 'text-ink-300' : 'text-white'}
                              ${day.isToday ? 'ring-1 ring-ink-950 dark:ring-ink-100' : ''}`}
                          >
                            {day.count > 0 ? day.count : ''}
                          </div>
                          <span className="text-[9px] text-ink-300">{day.dayName}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Per-domain progress */}
              {domainStats.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-ink-950 dark:text-ink-50 mb-3">学科进度</h3>
                  <div className="space-y-2.5">
                    {domainStats.sort((a, b) => b.pct - a.pct).map(d => (
                      <div key={d.id}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-ink-600 dark:text-ink-300">{d.icon} {d.name}</span>
                          <span className="text-ink-400 dark:text-ink-300">
                            {d.done}/{d.total}
                            {mastered && (() => {
                              const m = tree.find(dom => dom.id === d.id)?.children.filter(c => mastered.has(c.id)).length || 0;
                              return m > 0 ? <span className="text-green-500 ml-1.5">✓{m}</span> : null;
                            })()}
                          </span>
                        </div>
                        <div className="h-1.5 bg-ink-100 dark:bg-ink-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${d.pct}%`, background: DOMAIN_COLORS[d.id]?.accent || '#333' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Level distribution */}
              {Object.keys(levelDist).length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-ink-950 dark:text-ink-50 mb-3">难度分布</h3>
                  <div className="flex gap-2">
                    {Object.entries(LEVELS).map(([key, lv]) => {
                      const count = levelDist[key] || 0;
                      if (count === 0) return null;
                      return (
                        <div key={key} className="flex-1 yi-card p-2 text-center">
                          <div className="text-lg font-bold" style={{ color: lv.color }}>{count}</div>
                          <div className="text-[10px] text-ink-400 dark:text-ink-300">{lv.name}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Export / Import */}
              <div>
                <h3 className="text-sm font-bold text-ink-950 dark:text-ink-50 mb-3">数据管理</h3>
                <div className="flex gap-2">
                  <button onClick={handleExport} className="yi-btn flex-1 px-3 py-2 rounded-lg border border-ink-200 dark:border-ink-700 text-sm text-ink-600 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-800">
                    导出备份
                  </button>
                  <button onClick={() => fileRef.current?.click()} className="yi-btn flex-1 px-3 py-2 rounded-lg border border-ink-200 dark:border-ink-700 text-sm text-ink-600 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-800">
                    导入恢复
                  </button>
                  <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
                </div>
                {importMsg && <p className="text-xs text-green-600 mt-2">{importMsg}</p>}
                <p className="text-[10px] text-ink-300 dark:text-ink-400 mt-2">导出为 JSON 文件，可在其他设备导入恢复</p>
              </div>
            </div>
          )}

          {activeTab === 'graph' && (
            <div>
              <p className="text-xs text-ink-400 dark:text-ink-300 mb-3">学科之间的跨领域关联网络，圆环进度表示已学比例</p>
              <KnowledgeGraph tree={tree} visited={visited} onSelect={onSelect} />
            </div>
          )}

          {activeTab === 'achievements' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-ink-600 dark:text-ink-300">
                  已解锁 <span className="font-bold text-ink-950 dark:text-ink-50">{unlocked ? unlocked.size : 0}</span> / {ACHIEVEMENTS.length}
                </p>
                <div className="h-1.5 flex-1 max-w-[120px] bg-ink-100 dark:bg-ink-800 rounded-full overflow-hidden ml-3">
                  <div
                    className="h-full bg-yellow-500 rounded-full transition-all"
                    style={{ width: `${unlocked ? (unlocked.size / ACHIEVEMENTS.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {ACHIEVEMENTS.map(a => {
                  const isUnlocked = unlocked?.has(a.id);
                  return (
                    <div
                      key={a.id}
                      className={`yi-card p-3 transition-all ${isUnlocked ? '' : 'opacity-40 grayscale'}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{a.icon}</span>
                        <span className="text-sm font-bold text-ink-950 dark:text-ink-50">{a.name}</span>
                      </div>
                      <p className="text-[11px] text-ink-400 dark:text-ink-300 leading-relaxed">{a.desc}</p>
                      {isUnlocked && <span className="text-[10px] text-yellow-600 mt-1 block">✓ 已解锁</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'bookmarks' && (
            <TopicList
              topics={bookmarkedTopics}
              emptyIcon="☆"
              emptyText="还没有收藏任何专题"
              emptyHint="在专题详情页点击星标即可收藏"
              onSelect={onSelect}
              renderExtra={(t) => {
                const level = LEVELS[t.level];
                return (
                  <span className="yi-badge text-[10px] ml-auto" style={{ background: level.color + '20', color: level.color }}>
                    {level.name}
                  </span>
                );
              }}
              prefix={<span className="text-yellow-500">★</span>}
            />
          )}

          {activeTab === 'notes' && (
            <div>
              {notedTopics.length === 0 ? (
                <EmptyState icon="📝" text="还没有写过笔记" hint="在专题详情页展开笔记区域即可记录" />
              ) : (
                <div className="space-y-3">
                  {notedTopics.map(t => {
                    const note = notes[t.id];
                    return (
                      <button
                        key={t.id}
                        onClick={() => onSelect(t, t.domain)}
                        className="w-full text-left yi-card p-4 hover:shadow-md transition-all group"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{t.domain.icon}</span>
                          <span className="font-medium text-sm text-ink-950 dark:text-ink-50 group-hover:text-ink-700 dark:group-hover:text-ink-200">{t.name}</span>
                          <span className="text-[10px] text-ink-300 dark:text-ink-400 ml-auto">
                            {note.updatedAt ? new Date(note.updatedAt).toLocaleDateString('zh-CN') : ''}
                          </span>
                        </div>
                        <p className="text-xs text-ink-500 dark:text-ink-200 line-clamp-2 leading-relaxed">{note.text}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'recent' && (
            <TopicList
              topics={recentTopics}
              emptyIcon="⏱"
              emptyText="还没有浏览记录"
              emptyHint="浏览专题后会自动记录在这里"
              onSelect={onSelect}
              prefix={<span className="text-ink-300">⏱</span>}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function TopicList({ topics, emptyIcon, emptyText, emptyHint, onSelect, renderExtra, prefix }) {
  if (topics.length === 0) {
    return <EmptyState icon={emptyIcon} text={emptyText} hint={emptyHint} />;
  }
  return (
    <div className="space-y-2">
      {topics.map(t => (
        <button
          key={t.id}
          onClick={() => onSelect(t, t.domain)}
          className="w-full text-left yi-card p-3 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-2">
            {prefix}
            <span className="text-lg">{t.domain.icon}</span>
            <span className="font-medium text-sm text-ink-950 dark:text-ink-50 group-hover:text-ink-700 dark:group-hover:text-ink-200">{t.name}</span>
            {renderExtra && renderExtra(t)}
          </div>
        </button>
      ))}
    </div>
  );
}

function EmptyState({ icon, text, hint }) {
  return (
    <div className="text-center py-12">
      <div className="text-4xl mb-3">{icon}</div>
      <p className="text-ink-400 dark:text-ink-300">{text}</p>
      <p className="text-xs text-ink-300 dark:text-ink-400 mt-1">{hint}</p>
    </div>
  );
}

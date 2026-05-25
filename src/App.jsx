import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { knowledgeTree, tools, quotes, DOMAIN_COLORS, LEVELS } from './data/knowledgeTree';
import { getRecommendations } from './data/learningPath';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import KnowledgeView from './components/KnowledgeView';
import ToolPanel from './components/ToolPanel';
import SearchResults from './components/SearchResults';
import StudyDashboard from './components/StudyDashboard';
import ShortcutHelp from './components/ShortcutHelp';
import { ACHIEVEMENTS, checkAchievements, loadUnlocked } from './data/achievements';
import { loadDailyVisits, saveDailyVisits, recordVisit, calcStreak, calcBestStreak, getTodayCount, loadDailyGoal, saveDailyGoal, getLast7Days, deserializeDailyVisits } from './data/streak';
import { loadExerciseProgress, saveExerciseProgress, toggleExercise, saveThought } from './data/exercises';
import { loadReviewData, saveReviewData, recordReviewVisit, getReviewDue, getReviewStats, migrateReviewData } from './data/review';

function loadVisited() {
  try {
    const saved = localStorage.getItem('yi-visited');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  } catch { return new Set(); }
}

function loadNotes() {
  try {
    const saved = localStorage.getItem('yi-notes');
    return saved ? JSON.parse(saved) : {};
  } catch { return {}; }
}

function loadBookmarks() {
  try {
    const saved = localStorage.getItem('yi-bookmarks');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  } catch { return new Set(); }
}

function loadRecent() {
  try {
    const saved = localStorage.getItem('yi-recent');
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
}

export default function App() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [expandedDomains, setExpandedDomains] = useState(new Set(['math']));
  const [toolPanelOpen, setToolPanelOpen] = useState(false);
  const [activeTool, setActiveTool] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [visited, setVisited] = useState(loadVisited);
  const [notes, setNotes] = useState(loadNotes);
  const [bookmarks, setBookmarks] = useState(loadBookmarks);
  const [recent, setRecent] = useState(loadRecent);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [unlocked, setUnlocked] = useState(loadUnlocked);
  const [toasts, setToasts] = useState([]);
  const toastTimers = useRef({});
  const toastIdCounter = useRef(0);
  const [usedRandom, setUsedRandom] = useState(false);
  const [sessionVisited, setSessionVisited] = useState(0);
  const [shortcutHelpOpen, setShortcutHelpOpen] = useState(false);
  const [dailyVisits, setDailyVisits] = useState(loadDailyVisits);
  const [dailyGoal, setDailyGoal] = useState(loadDailyGoal);
  const [exerciseProgress, setExerciseProgress] = useState(loadExerciseProgress);
  const [reviewData, setReviewData] = useState(loadReviewData);
  const mainRef = useRef(null);
  const searchInputRef = useRef(null);

  // Build topic lookup map
  const topicMap = useMemo(() => {
    const map = {};
    for (const domain of knowledgeTree) {
      for (const topic of domain.children) {
        map[topic.id] = { ...topic, domain };
      }
    }
    return map;
  }, []);

  const quote = useMemo(() => quotes[Math.floor(Math.random() * quotes.length)], []);

  // Learning recommendations
  const recommendations = useMemo(() => getRecommendations(visited, topicMap), [visited, topicMap]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        if (shortcutHelpOpen) {
          setShortcutHelpOpen(false);
        } else if (dashboardOpen) {
          setDashboardOpen(false);
        } else if (toolPanelOpen) {
          setToolPanelOpen(false);
          setActiveTool(null);
        } else if (searchQuery) {
          setSearchQuery('');
        }
      }
      if (e.key === '?' && !e.metaKey && !e.ctrlKey && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        setShortcutHelpOpen(prev => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toolPanelOpen, searchQuery, dashboardOpen, shortcutHelpOpen]);

  // Persist visited to localStorage
  useEffect(() => {
    localStorage.setItem('yi-visited', JSON.stringify([...visited]));
  }, [visited]);

  // Persist notes to localStorage
  useEffect(() => {
    localStorage.setItem('yi-notes', JSON.stringify(notes));
  }, [notes]);

  // Persist bookmarks to localStorage
  useEffect(() => {
    localStorage.setItem('yi-bookmarks', JSON.stringify([...bookmarks]));
  }, [bookmarks]);

  // Persist recent to localStorage
  useEffect(() => {
    localStorage.setItem('yi-recent', JSON.stringify(recent));
  }, [recent]);

  // Persist achievements to localStorage
  useEffect(() => {
    localStorage.setItem('yi-achievements', JSON.stringify([...unlocked]));
  }, [unlocked]);

  // Persist daily visits
  useEffect(() => {
    saveDailyVisits(dailyVisits);
  }, [dailyVisits]);

  // Persist daily goal
  useEffect(() => {
    saveDailyGoal(dailyGoal);
  }, [dailyGoal]);

  // Persist exercise progress
  useEffect(() => {
    saveExerciseProgress(exerciseProgress);
  }, [exerciseProgress]);

  // Persist review data
  useEffect(() => {
    saveReviewData(reviewData);
  }, [reviewData]);

  // Migrate: seed review data for previously visited topics (runs once)
  const migrationDone = useRef(false);
  useEffect(() => {
    if (migrationDone.current) return;
    migrationDone.current = true;
    setReviewData(prev => migrateReviewData(prev, visited));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Check achievements when state changes
  useEffect(() => {
    const domainCount = new Set();
    const domainVisits = {};
    let hasExpert = false;

    for (const domain of knowledgeTree) {
      let count = 0;
      for (const topic of domain.children) {
        if (visited.has(topic.id)) {
          domainCount.add(domain.id);
          count++;
          if (topic.level === 4) hasExpert = true;
        }
      }
      domainVisits[domain.id] = { count, total: domain.children.length };
    }

    const fullDomains = Object.values(domainVisits).filter(d => d.count === d.total && d.total > 0).length;
    const domainMastery = fullDomains >= 1;
    const currentStreak = calcStreak(dailyVisits);
    const todayGoalMet = getTodayCount(dailyVisits) >= dailyGoal;
    let exercisesCompleted = 0;
    for (const [, data] of Object.entries(exerciseProgress)) {
      exercisesCompleted += (data.completed?.length || 0);
    }

    const state = {
      visited,
      bookmarks,
      domainCount: domainCount.size,
      totalDomains: knowledgeTree.length,
      domainMastery,
      fullDomains,
      hasExpert,
      noteCount: Object.keys(notes).length,
      usedRandom,
      sessionVisited,
      currentStreak,
      todayGoalMet,
      exercisesCompleted,
    };

    const newlyUnlocked = checkAchievements(state, unlocked);
    if (newlyUnlocked.length > 0) {
      setUnlocked(prev => {
        const next = new Set(prev);
        for (const a of newlyUnlocked) next.add(a.id);
        return next;
      });
      // Show toast notifications with individual dismiss timers
      const newToasts = newlyUnlocked.map(a => ({
        uid: ++toastIdCounter.current,
        id: a.id, icon: a.icon, name: a.name, desc: a.desc,
      }));
      setToasts(prev => [...prev, ...newToasts]);
      for (const t of newToasts) {
        toastTimers.current[t.uid] = setTimeout(() => {
          setToasts(prev => prev.filter(x => x.uid !== t.uid));
          delete toastTimers.current[t.uid];
        }, 4000);
      }
    }
  }, [visited, bookmarks, notes, usedRandom, sessionVisited, dailyVisits, dailyGoal, exerciseProgress]);

  // Clean up toast timers on unmount
  useEffect(() => {
    return () => {
      for (const timer of Object.values(toastTimers.current)) clearTimeout(timer);
    };
  }, []);

  // Track scroll position for scroll-to-top button and reading progress
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const handler = () => {
      setShowScrollTop(el.scrollTop > 300);
      const scrollHeight = el.scrollHeight - el.clientHeight;
      setScrollProgress(scrollHeight > 0 ? Math.min(1, el.scrollTop / scrollHeight) : 0);
    };
    el.addEventListener('scroll', handler, { passive: true });
    return () => el.removeEventListener('scroll', handler);
  }, []);

  // Scroll main area to top when node changes
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedNode?.id]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results = [];
    for (const domain of knowledgeTree) {
      for (const node of domain.children) {
        const matchName = node.name.toLowerCase().includes(q);
        const matchKeywords = node.keywords?.some(k => k.toLowerCase().includes(q));
        const matchContent = node.content?.toLowerCase().includes(q);
        const matchConcepts = node.keyConcepts?.some(c => {
          if (typeof c === 'string') return c.toLowerCase().includes(q);
          return c.title?.toLowerCase().includes(q) || c.desc?.toLowerCase().includes(q);
        });
        if (matchName || matchKeywords || matchContent || matchConcepts) {
          results.push({ ...node, domain });
        }
      }
    }
    return results;
  }, [searchQuery]);

  const handleSelectNode = useCallback((node, domain) => {
    setSelectedNode({ ...node, domain });
    setVisited(prev => new Set([...prev, node.id]));
    setSearchQuery('');
    if (domain?.id) {
      setExpandedDomains(prev => new Set([...prev, domain.id]));
    }
    // Track recent topics (keep last 8, deduplicate)
    setRecent(prev => {
      const filtered = prev.filter(id => id !== node.id);
      return [node.id, ...filtered].slice(0, 8);
    });
    setSessionVisited(prev => prev + 1);
    // Record daily visit for streak tracking
    setDailyVisits(prev => recordVisit(prev, node.id));
    // Record review visit for spaced repetition
    setReviewData(prev => recordReviewVisit(prev, node.id));
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, []);

  const handleUpdateNote = useCallback((topicId, text) => {
    setNotes(prev => {
      if (!text.trim()) {
        const next = { ...prev };
        delete next[topicId];
        return next;
      }
      return { ...prev, [topicId]: { text, updatedAt: Date.now() } };
    });
  }, []);

  const handleToggleBookmark = useCallback((topicId) => {
    setBookmarks(prev => {
      const next = new Set(prev);
      if (next.has(topicId)) next.delete(topicId); else next.add(topicId);
      return next;
    });
  }, []);

  const toggleDomain = useCallback((id) => {
    setExpandedDomains(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const openTool = useCallback((toolId) => {
    setActiveTool(toolId);
    setToolPanelOpen(true);
  }, []);

  const handleCloseTool = useCallback(() => {
    setToolPanelOpen(false);
    setActiveTool(null);
  }, []);

  const handleBackToTools = useCallback(() => {
    setActiveTool(null);
  }, []);

  const handleToggleExercise = useCallback((topicId, exerciseIndex) => {
    setExerciseProgress(prev => toggleExercise(prev, topicId, exerciseIndex));
  }, []);

  const handleSaveThought = useCallback((topicId, exerciseIndex, text) => {
    setExerciseProgress(prev => saveThought(prev, topicId, exerciseIndex, text));
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="hex-bg" />

      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onToolClick={() => setToolPanelOpen(true)}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onLogoClick={() => { setSelectedNode(null); setSearchQuery(''); }}
        onDashboardClick={() => setDashboardOpen(true)}
        onHelpClick={() => setShortcutHelpOpen(true)}
        toolCount={tools.length}
        searchInputRef={searchInputRef}
      />

      <div className="flex flex-1 overflow-hidden relative z-10">
        <Sidebar
          tree={knowledgeTree}
          expanded={expandedDomains}
          onToggle={toggleDomain}
          onSelect={handleSelectNode}
          selectedId={selectedNode?.id}
          visited={visited}
          bookmarks={bookmarks}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main ref={mainRef} className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          {/* Reading progress bar */}
          {selectedNode && (
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-ink-100 z-10">
              <div
                className="h-full bg-ink-950 transition-all duration-150 ease-out"
                style={{ width: `${scrollProgress * 100}%` }}
              />
            </div>
          )}
          {searchQuery.trim() ? (
            <SearchResults
              results={searchResults}
              query={searchQuery}
              onSelect={(node) => handleSelectNode(node, node.domain)}
            />
          ) : selectedNode ? (
            <KnowledgeView
              node={selectedNode}
              onNavigate={handleSelectNode}
              note={notes[selectedNode.id]}
              onUpdateNote={handleUpdateNote}
              isBookmarked={bookmarks.has(selectedNode.id)}
              onToggleBookmark={() => handleToggleBookmark(selectedNode.id)}
              exerciseProgress={exerciseProgress[selectedNode.id] || { completed: [], thoughts: {} }}
              onToggleExercise={handleToggleExercise}
              onSaveThought={handleSaveThought}
              scrollRef={mainRef}
            />
          ) : (
            <WelcomeScreen
              tree={knowledgeTree}
              quote={quote}
              onSelect={handleSelectNode}
              visited={visited}
              recommendations={recommendations}
              bookmarks={bookmarks}
              recent={recent}
              topicMap={topicMap}
              onRandom={() => setUsedRandom(true)}
              dailyVisits={dailyVisits}
              dailyGoal={dailyGoal}
              onSetDailyGoal={setDailyGoal}
              reviewDue={getReviewDue(reviewData, visited)}
              reviewStats={getReviewStats(reviewData, visited)}
            />
          )}
          {/* Scroll to top button */}
          {showScrollTop && (
            <button
              onClick={() => mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
              className="fixed bottom-6 right-6 w-10 h-10 rounded-full bg-ink-950 text-white shadow-lg
                         hover:bg-ink-900 transition-all flex items-center justify-center z-20"
              aria-label="回到顶部"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 14V4M4 8l5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </main>
      </div>

      <ToolPanel
        isOpen={toolPanelOpen}
        onClose={handleCloseTool}
        onBack={handleBackToTools}
        tools={tools}
        activeTool={activeTool}
        onSelectTool={openTool}
      />

      <StudyDashboard
        isOpen={dashboardOpen}
        onClose={() => setDashboardOpen(false)}
        tree={knowledgeTree}
        visited={visited}
        bookmarks={bookmarks}
        notes={notes}
        recent={recent}
        unlocked={unlocked}
        dailyVisits={dailyVisits}
        dailyGoal={dailyGoal}
        onSetDailyGoal={setDailyGoal}
        onSelect={(node, domain) => {
          handleSelectNode(node, domain);
          setDashboardOpen(false);
        }}
        exerciseProgress={exerciseProgress}
        reviewStats={getReviewStats(reviewData, visited)}
        reviewData={reviewData}
        onImport={(data) => {
          if (data.visited) setVisited(new Set(data.visited));
          if (data.notes) setNotes(data.notes);
          if (data.bookmarks) setBookmarks(new Set(data.bookmarks));
          if (data.recent) setRecent(data.recent);
          if (data.exercises) setExerciseProgress(data.exercises);
          if (data.review) setReviewData(data.review);
          if (data.dailyVisits) setDailyVisits(deserializeDailyVisits(data.dailyVisits));
          if (data.dailyGoal) setDailyGoal(data.dailyGoal);
          if (data.unlocked) setUnlocked(new Set(data.unlocked));
        }}
      />

      {/* Achievement toasts */}
      <div className="fixed top-20 right-4 z-50 space-y-2">
        {toasts.slice(-3).map((toast, i) => (
          <div
            key={toast.uid}
            className="yi-card p-3 pr-8 shadow-lg animate-slideInLeft flex items-center gap-3 relative min-w-[220px]"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <span className="text-2xl">{toast.icon}</span>
            <div>
              <div className="text-xs text-ink-400">成就解锁</div>
              <div className="text-sm font-bold text-ink-950">{toast.name}</div>
            </div>
            <button
              onClick={() => {
                clearTimeout(toastTimers.current[toast.uid]);
                delete toastTimers.current[toast.uid];
                setToasts(prev => prev.filter(t => t.uid !== toast.uid));
              }}
              className="absolute top-2 right-2 text-ink-300 hover:text-ink-500 text-xs"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <ShortcutHelp isOpen={shortcutHelpOpen} onClose={() => setShortcutHelpOpen(false)} />
    </div>
  );
}

// Collapsible section wrapper for WelcomeScreen
function CollapsibleSection({ id, title, icon, defaultOpen, children }) {
  const [open, setOpen] = useState(() => {
    try {
      const saved = localStorage.getItem('yi-welcome-sections');
      if (saved) {
        const map = JSON.parse(saved);
        if (id in map) return map[id];
      }
    } catch {}
    return defaultOpen !== false;
  });

  const toggle = () => {
    setOpen(prev => {
      const next = !prev;
      try {
        const saved = localStorage.getItem('yi-welcome-sections');
        const map = saved ? JSON.parse(saved) : {};
        map[id] = next;
        localStorage.setItem('yi-welcome-sections', JSON.stringify(map));
      } catch {}
      return next;
    });
  };

  return (
    <div className="mb-6">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between text-left mb-3 group"
      >
        <h2 className="text-lg font-bold text-ink-950 flex items-center gap-2">
          <span>{icon}</span> {title}
        </h2>
        <svg
          width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
          className={`text-ink-300 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && <div className="animate-fadeIn">{children}</div>}
    </div>
  );
}

function WelcomeScreen({ tree, quote, onSelect, visited, recommendations, bookmarks, recent, topicMap, onRandom, dailyVisits, dailyGoal, onSetDailyGoal, reviewDue, reviewStats }) {
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
        <h1 className="text-4xl font-bold text-ink-950 mb-2">易</h1>
        <p className="text-lg text-ink-500">全学科知识体系</p>
        <p className="text-sm text-ink-400 mt-1">简易 · 变易 · 不易</p>
        <button
          onClick={handleRandom}
          className="mt-4 px-5 py-2 rounded-full bg-ink-950 text-white text-sm hover:bg-ink-900 transition-colors"
        >
          🎲 随机探索
        </button>
      </div>

      {/* Quote */}
      <div className="yi-card p-6 mb-8 text-center">
        <p className="text-lg text-ink-700 font-serif italic">"{quote.text}"</p>
        <p className="text-sm text-ink-400 mt-2">—— {quote.source}</p>
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
            <div className="w-12 h-12 rounded-xl bg-ink-950 text-white flex items-center justify-center text-2xl shrink-0">
              {lastTopic.domain.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-ink-400 mb-0.5">继续学习</p>
              <p className="text-lg font-bold text-ink-950 group-hover:text-ink-700 truncate">{lastTopic.name}</p>
              <p className="text-xs text-ink-400">{lastTopic.domain.name}</p>
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
            <h3 className="text-sm font-bold text-ink-950 flex items-center gap-2">
              <span className="text-lg">🔄</span> 待复习
            </h3>
            <span className="text-xs text-ink-400">{reviewDue.length} 个专题</span>
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
                  <span className="text-ink-950 group-hover:text-ink-700">{topic.name}</span>
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
              <h3 className="font-bold text-ink-950 mb-1">{p.principle}</h3>
              <p className="text-sm text-ink-600 mb-2">{p.desc}</p>
              <p className="text-xs text-ink-400">{p.example}</p>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Domain grid with level distribution */}
      <CollapsibleSection id="domains" title="学科导航" icon="📚" defaultOpen={true}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 gap-3">
          {tree.map((domain) => {
            const done = domain.children.filter(c => visited.has(c.id)).length;
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
                <div className="font-bold text-sm text-ink-950">{domain.name}</div>
                <div className="text-xs text-ink-400 mt-1">{total} 个专题</div>
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
                    <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: DOMAIN_COLORS[domain.id]?.accent || '#333' }}
                      />
                    </div>
                    <div className="text-[10px] text-ink-300 mt-0.5">{done}/{total}</div>
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
              <span className="text-[10px] text-ink-400">{lv.name}</span>
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
                    <span className="text-xs text-ink-400">{domain?.name}</span>
                  </div>
                  <h3 className="font-bold text-sm text-ink-950 group-hover:text-ink-700 mb-1">{rec.name}</h3>
                  <p className="text-xs text-ink-400 leading-relaxed">{rec.reason}</p>
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
                  <span className="text-ink-950">{topic.name}</span>
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
                  <span className="text-ink-950">{topic.name}</span>
                </button>
              );
            })}
          </div>
        </CollapsibleSection>
      )}

      {/* Stats & progress (collapsible, default closed for returning users) */}
      {visited.size > 0 && (
        <CollapsibleSection id="stats" title="学习统计" icon="📊" defaultOpen={visited.size <= 5}>
          <div className="flex justify-center gap-6 text-sm text-ink-400 mb-3">
            <span>{totalTopics} 专题</span>
            <span>·</span>
            <span>{tree.length} 学科</span>
            <span>·</span>
            <span>入门→专家</span>
          </div>
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-xs text-ink-400 mb-1">
              <span>学习进度</span>
              <span>{visited.size}/{totalTopics} ({progressPct}%)</span>
            </div>
            <div className="h-2 bg-ink-100 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-ink-950 rounded-full transition-all duration-500"
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
                    <div className="text-xs text-ink-500 mb-1">{domain.icon} {domain.name}</div>
                    <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden">
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

function StreakDisplay({ dailyVisits, dailyGoal, onSetDailyGoal }) {
  const streak = calcStreak(dailyVisits);
  const bestStreak = calcBestStreak(dailyVisits);
  const todayCount = getTodayCount(dailyVisits);
  const last7 = getLast7Days(dailyVisits);
  const goalPct = dailyGoal > 0 ? Math.min(100, Math.round((todayCount / dailyGoal) * 100)) : 0;
  const goalMet = todayCount >= dailyGoal;

  return (
    <div className="yi-card p-5 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{streak > 0 ? '🔥' : '🕐'}</span>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-ink-950">{streak}</span>
              <span className="text-sm text-ink-400">天连续学习</span>
            </div>
            {bestStreak > 0 && (
              <p className="text-[11px] text-ink-300">最佳纪录 {bestStreak} 天</p>
            )}
          </div>
        </div>

        {/* 7-day heatmap */}
        <div className="flex gap-1.5">
          {last7.map((day) => {
            const intensity = day.count === 0 ? 0 : day.count >= dailyGoal ? 2 : 1;
            const colors = ['bg-ink-100', 'bg-ink-400', 'bg-ink-950'];
            return (
              <div key={day.date} className="flex flex-col items-center gap-0.5">
                <div
                  className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-medium transition-colors
                    ${colors[intensity]}
                    ${day.isToday ? 'ring-2 ring-ink-950 ring-offset-1' : ''}
                    ${intensity === 0 ? 'text-ink-300' : 'text-white'}`}
                >
                  {day.dayNum}
                </div>
                <span className="text-[9px] text-ink-300">{day.dayName}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily goal progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-ink-500">
              今日目标 {goalMet ? '✓' : ''}
            </span>
            <span className={goalMet ? 'text-green-600 font-medium' : 'text-ink-400'}>
              {todayCount}/{dailyGoal}
            </span>
          </div>
          <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${goalMet ? 'bg-green-500' : 'bg-ink-950'}`}
              style={{ width: `${goalPct}%` }}
            />
          </div>
        </div>
        <select
          value={dailyGoal}
          onChange={(e) => onSetDailyGoal(Number(e.target.value))}
          className="text-xs border border-ink-200 rounded-lg px-2 py-1 bg-white text-ink-600 focus:outline-none focus:ring-1 focus:ring-ink-400"
        >
          {[1, 2, 3, 5, 8, 10].map(n => (
            <option key={n} value={n}>{n}篇/天</option>
          ))}
        </select>
      </div>
    </div>
  );
}

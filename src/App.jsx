import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { knowledgeTree, tools, quotes } from './data/knowledgeTree';
import { getRecommendations } from './data/learningPath';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import KnowledgeView from './components/KnowledgeView';
import ToolPanel from './components/ToolPanel';
import SearchResults from './components/SearchResults';
import StudyDashboard from './components/StudyDashboard';
import ShortcutHelp from './components/ShortcutHelp';
import WelcomeScreen from './components/WelcomeScreen';
import { ACHIEVEMENTS, checkAchievements, loadUnlocked } from './data/achievements';
import { loadDailyVisits, saveDailyVisits, recordVisit, calcStreak, getTodayCount, loadDailyGoal, saveDailyGoal, deserializeDailyVisits } from './data/streak';
import { loadExerciseProgress, saveExerciseProgress, toggleExercise, saveThought } from './data/exercises';
import { loadReviewData, saveReviewData, recordReviewVisit, getReviewDue, getReviewStats, migrateReviewData } from './data/review';
import useTheme from './hooks/useTheme';
import { loadMastered, saveMastered, toggleMastered } from './data/mastery';
import { buildTopicMap } from './utils/topicMap';

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
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);
  const [visited, setVisited] = useState(loadVisited);
  const [notes, setNotes] = useState(loadNotes);
  const [bookmarks, setBookmarks] = useState(loadBookmarks);
  const [recent, setRecent] = useState(loadRecent);
  const [mastered, setMastered] = useState(loadMastered);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [dashboardTab, setDashboardTab] = useState('overview');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [unlocked, setUnlocked] = useState(loadUnlocked);
  const [toasts, setToasts] = useState([]);
  const toastTimers = useRef({});
  const toastIdCounter = useRef(0);
  const [usedRandom, setUsedRandom] = useState(false);
  const [sessionVisited, setSessionVisited] = useState(0);
  const [shortcutHelpOpen, setShortcutHelpOpen] = useState(false);
  const [searchSelectedIndex, setSearchSelectedIndex] = useState(-1);
  const [dailyVisits, setDailyVisits] = useState(loadDailyVisits);
  const [dailyGoal, setDailyGoal] = useState(loadDailyGoal);
  const [exerciseProgress, setExerciseProgress] = useState(loadExerciseProgress);
  const [reviewData, setReviewData] = useState(loadReviewData);
  const mainRef = useRef(null);
  const searchInputRef = useRef(null);
  const { theme, cycle: cycleTheme } = useTheme();
  // Refs for keyboard handler (avoids re-registration on every state change)
  const stateRef = useRef({});

  // Build topic lookup map
  const topicMap = useMemo(() => buildTopicMap(), []);

  const quote = useMemo(() => quotes[Math.floor(Math.random() * quotes.length)], []);

  // Learning recommendations
  const recommendations = useMemo(() => getRecommendations(visited, topicMap), [visited, topicMap]);

  // Review stats (only computed when dashboard is open)
  const reviewStats = useMemo(() => dashboardOpen ? getReviewStats(reviewData, visited) : null, [dashboardOpen, reviewData, visited]);

  // Review due topics (memoized)
  const reviewDue = useMemo(() => getReviewDue(reviewData, visited), [reviewData, visited]);

  // Keyboard shortcuts (stable handler — reads state via refs)
  useEffect(() => {
    const handler = (e) => {
      const { toolPanelOpen, searchQuery, dashboardOpen, shortcutHelpOpen, searchSelectedIndex, searchResults } = stateRef.current;

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
          setSearchSelectedIndex(-1);
        }
        return;
      }
      if (e.key === '?' && !e.metaKey && !e.ctrlKey && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        setShortcutHelpOpen(prev => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 't' && e.shiftKey && !e.metaKey && !e.ctrlKey && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        cycleTheme();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []); // no deps — reads from ref

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

  // Persist mastered to localStorage
  useEffect(() => {
    saveMastered(mastered);
  }, [mastered]);

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
      mastered,
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
      domainVisits,
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
  }, [visited, mastered, bookmarks, notes, usedRandom, sessionVisited, dailyVisits, dailyGoal, exerciseProgress]);

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
        const matchNote = notes[node.id]?.text?.toLowerCase().includes(q);
        if (matchName || matchKeywords || matchContent || matchConcepts || matchNote) {
          results.push({ ...node, domain, matchedNote: matchNote });
        }
      }
    }
    return results;
  }, [searchQuery, notes]);

  // Update ref for keyboard handler
  stateRef.current = { toolPanelOpen, searchQuery, dashboardOpen, shortcutHelpOpen, searchSelectedIndex, searchResults };

  const handleSelectNode = useCallback((node, domain) => {
    setSelectedNode({ ...node, domain });
    setVisited(prev => new Set([...prev, node.id]));
    setSearchQuery('');
    setSearchSelectedIndex(-1);
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

  const handleToggleMastered = useCallback((topicId) => {
    setMastered(prev => toggleMastered(prev, topicId));
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
        onSearchChange={(q) => { setSearchQuery(q); setSearchSelectedIndex(-1); }}
        onSearchKeyDown={(e) => {
          const results = stateRef.current.searchResults;
          if (!results.length) return;
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSearchSelectedIndex(prev => (prev + 1) % results.length);
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSearchSelectedIndex(prev => prev <= 0 ? results.length - 1 : prev - 1);
          } else if (e.key === 'Enter') {
            const idx = stateRef.current.searchSelectedIndex;
            if (idx >= 0 && idx < results.length) {
              const node = results[idx];
              handleSelectNode(node, node.domain);
            }
          }
        }}
        onToolClick={() => setToolPanelOpen(true)}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onLogoClick={() => { setSelectedNode(null); setSearchQuery(''); setSearchSelectedIndex(-1); }}
        onDashboardClick={() => setDashboardOpen(true)}
        onHelpClick={() => setShortcutHelpOpen(true)}
        toolCount={tools.length}
        reviewDueCount={reviewDue?.length || 0}
        unlockedCount={unlocked.size}
        onAchievementsClick={() => { setDashboardTab('achievements'); setDashboardOpen(true); }}
        searchInputRef={searchInputRef}
        theme={theme}
        onThemeCycle={cycleTheme}
      />

      <div className="flex flex-1 overflow-hidden relative z-10">
        <Sidebar
          tree={knowledgeTree}
          expanded={expandedDomains}
          onToggle={toggleDomain}
          onSelect={handleSelectNode}
          selectedId={selectedNode?.id}
          visited={visited}
          mastered={mastered}
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
              selectedIndex={searchSelectedIndex}
              onSelect={(node) => handleSelectNode(node, node.domain)}
              notes={notes}
            />
          ) : selectedNode ? (
            <KnowledgeView
              node={selectedNode}
              onNavigate={handleSelectNode}
              note={notes[selectedNode.id]}
              onUpdateNote={handleUpdateNote}
              isBookmarked={bookmarks.has(selectedNode.id)}
              onToggleBookmark={() => handleToggleBookmark(selectedNode.id)}
              isMastered={mastered.has(selectedNode.id)}
              onToggleMastered={() => handleToggleMastered(selectedNode.id)}
              exerciseProgress={exerciseProgress[selectedNode.id] || { completed: [], thoughts: {} }}
              onToggleExercise={handleToggleExercise}
              onSaveThought={handleSaveThought}
              scrollRef={mainRef}
              visited={visited}
            />
          ) : (
            <WelcomeScreen
              tree={knowledgeTree}
              quote={quote}
              onSelect={handleSelectNode}
              visited={visited}
              mastered={mastered}
              recommendations={recommendations}
              bookmarks={bookmarks}
              recent={recent}
              topicMap={topicMap}
              onRandom={() => setUsedRandom(true)}
              dailyVisits={dailyVisits}
              dailyGoal={dailyGoal}
              onSetDailyGoal={setDailyGoal}
              reviewDue={reviewDue}
              reviewStats={reviewStats}
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

      {dashboardOpen && <StudyDashboard
        isOpen={true}
        onClose={() => setDashboardOpen(false)}
        defaultTab={dashboardTab}
        tree={knowledgeTree}
        visited={visited}
        mastered={mastered}
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
        reviewStats={reviewStats}
        reviewData={reviewData}
        onImport={(data) => {
          if (data.visited) setVisited(new Set(data.visited));
          if (data.mastered) setMastered(new Set(data.mastered));
          if (data.notes) setNotes(data.notes);
          if (data.bookmarks) setBookmarks(new Set(data.bookmarks));
          if (data.recent) setRecent(data.recent);
          if (data.exercises) setExerciseProgress(data.exercises);
          if (data.review) setReviewData(data.review);
          if (data.dailyVisits) setDailyVisits(deserializeDailyVisits(data.dailyVisits));
          if (data.dailyGoal) setDailyGoal(data.dailyGoal);
          if (data.unlocked) setUnlocked(new Set(data.unlocked));
        }}
      />}

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
              <div className="text-sm font-bold text-ink-950 dark:text-ink-50">{toast.name}</div>
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


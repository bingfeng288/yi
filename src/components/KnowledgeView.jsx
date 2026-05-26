import { useState, useEffect, useRef, useCallback } from 'react';
import { LEVELS, DOMAIN_COLORS, FIRST_PRINCIPLES } from '../data/knowledgeTree';
import { getRelatedTopics } from '../data/crossReferences';
import { buildTopicMap } from '../utils/topicMap';
import { renderMarkdown } from '../utils/markdown';
import LearningPath from './LearningPath';

// Lazy singleton — built once on first access
let _topicMap = null;
function getTopicMap() {
  if (!_topicMap) _topicMap = buildTopicMap();
  return _topicMap;
}

// TOC section definitions
const TOC_SECTIONS = [
  { id: 'kv-content', label: '概述', icon: '📖' },
  { id: 'kv-concepts', label: '核心概念', icon: '💡' },
  { id: 'kv-yi', label: '周易之道', icon: '☯' },
  { id: 'kv-principle', label: '第一性原理', icon: '🔬' },
  { id: 'kv-refs', label: '跨学科关联', icon: '🔗' },
  { id: 'kv-exercises', label: '思考与练习', icon: '✏️' },
  { id: 'kv-notes', label: '学习笔记', icon: '📝' },
];

function TableOfContents({ activeSection, visibleSections, onJump }) {
  return (
    <nav className="hidden xl:block fixed right-6 top-1/2 -translate-y-1/2 z-10">
      <div className="yi-card p-2.5 w-36">
        <div className="text-[10px] text-ink-300 font-medium mb-2 px-2">目录</div>
        {TOC_SECTIONS.filter(s => visibleSections.has(s.id)).map((section) => (
          <button
            key={section.id}
            onClick={() => onJump(section.id)}
            className={`w-full text-left px-2 py-1 rounded text-xs transition-colors flex items-center gap-1.5 mb-0.5
              ${activeSection === section.id
                ? 'bg-ink-950 dark:bg-ink-100 text-white dark:text-ink-950 font-medium'
                : 'text-ink-500 hover:text-ink-950 dark:hover:text-ink-50 hover:bg-ink-50 dark:hover:bg-ink-800'}`}
          >
            <span className="text-[10px]">{section.icon}</span>
            {section.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

function ExerciseItem({ ex, index, isCompleted, thought, onToggle, onSaveThought }) {
  const [expanded, setExpanded] = useState(false);
  const [thoughtText, setThoughtText] = useState(thought || '');

  const handleSave = () => {
    onSaveThought(index, thoughtText);
    setExpanded(false);
  };

  return (
    <div className={`rounded-lg transition-all ${isCompleted ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-ink-50 dark:bg-ink-800'}`}>
      <div className="flex gap-3 p-3">
        <button
          onClick={() => onToggle(index)}
          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 transition-all
            ${isCompleted
              ? 'bg-green-500 text-white'
              : 'bg-ink-300 text-white hover:bg-ink-400'}`}
        >
          {isCompleted ? '✓' : index + 1}
        </button>
        <div className="flex-1 min-w-0">
          <p className={`text-sm leading-relaxed ${isCompleted ? 'text-ink-500 line-through' : 'text-ink-700 dark:text-ink-300'}`}>
            {ex}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-[11px] text-ink-400 dark:text-ink-300 hover:text-ink-600 dark:hover:text-ink-200 transition-colors"
            >
              {expanded ? '收起' : thought ? '查看思考' : '写下思考'}
            </button>
            {isCompleted && (
              <span className="text-[10px] text-green-600">已完成</span>
            )}
          </div>
        </div>
      </div>
      {expanded && (
        <div className="px-3 pb-3 animate-fadeIn">
          <textarea
            value={thoughtText}
            onChange={(e) => setThoughtText(e.target.value)}
            placeholder="写下你的解题思路或答案..."
            className="yi-input w-full h-20 resize-none text-xs"
          />
          <div className="flex justify-end gap-2 mt-1.5">
            {thoughtText && (
              <button
                onClick={() => { setThoughtText(''); onSaveThought(index, ''); }}
                className="text-[11px] text-ink-400 dark:text-ink-300 hover:text-red-500"
              >
                清除
              </button>
            )}
            <button
              onClick={handleSave}
              className="text-[11px] bg-ink-950 text-white px-2.5 py-1 rounded-lg"
            >
              保存
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function KnowledgeView({ node, onNavigate, note, onUpdateNote, isBookmarked, onToggleBookmark, isMastered, onToggleMastered, exerciseProgress, onToggleExercise, onSaveThought, scrollRef, visited }) {
  const [noteOpen, setNoteOpen] = useState(true);
  const [notePreview, setNotePreview] = useState(false);
  const [noteText, setNoteText] = useState(note?.text || '');
  const [activeSection, setActiveSection] = useState('kv-content');
  const [visibleSections, setVisibleSections] = useState(new Set(['kv-content']));
  const observerRef = useRef(null);
  const sectionRefs = useRef({});

  const level = node ? (LEVELS[node.level] || LEVELS[0]) : LEVELS[0];
  const color = node ? (DOMAIN_COLORS[node.domain?.id] || DOMAIN_COLORS.math) : DOMAIN_COLORS.math;
  const siblings = node?.domain?.children || [];
  const currentIndex = node ? siblings.findIndex(s => s.id === node.id) : -1;
  const related = node ? getRelatedTopics(node.id) : [];

  // Reading time estimate (~350 chars/min for Chinese)
  const readingTime = node ? Math.max(1, Math.ceil(
    ((node.content?.length || 0) +
     (node.keyConcepts?.reduce((s, kc) => s + (typeof kc === 'string' ? kc.length : (kc.title?.length || 0) + (kc.desc?.length || 0)), 0) || 0) +
     (node.exercises?.join('').length || 0)) / 350
  )) : 1;

  // Exercise stats
  const exProgress = exerciseProgress || { completed: [], thoughts: {} };
  const exCompleted = new Set(exProgress.completed);
  const exDone = node?.exercises ? exProgress.completed.filter(i => i < node.exercises.length).length : 0;
  const exTotal = node?.exercises?.length || 0;

  // Sync noteText when node or note changes
  useEffect(() => {
    setNoteText(note?.text || '');
    setNoteOpen(false);
    setNotePreview(false);
  }, [node?.id, note?.text]);

  // IntersectionObserver for TOC active section tracking
  useEffect(() => {
    if (!node) return;

    // Build visible sections set based on what the node has
    const visible = new Set(['kv-content']);
    if (node.keyConcepts?.length > 0) visible.add('kv-concepts');
    if (node.domain?.yi) visible.add('kv-yi');
    if (node.domain?.firstPrinciple) visible.add('kv-principle');
    if (related.length > 0) visible.add('kv-refs');
    if (node.exercises?.length > 0) visible.add('kv-exercises');
    visible.add('kv-notes');
    setVisibleSections(visible);

    // Set up IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );
    observerRef.current = observer;

    // Observe all visible sections after DOM paint
    const timer = requestAnimationFrame(() => {
      for (const id of visible) {
        const el = sectionRefs.current[id];
        if (el) observer.observe(el);
      }
    });

    return () => {
      cancelAnimationFrame(timer);
      observer.disconnect();
    };
  }, [node?.id, related.length]);

  // Keyboard navigation between siblings (hooks must be before any early return)
  useEffect(() => {
    if (!node) return;
    const handler = (e) => {
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
      // Don't navigate when a modal/overlay is open
      if (document.querySelector('.fixed.inset-0.z-50')) return;
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        onNavigate(siblings[currentIndex - 1], node.domain);
      } else if (e.key === 'ArrowRight' && currentIndex < siblings.length - 1) {
        onNavigate(siblings[currentIndex + 1], node.domain);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentIndex, siblings, onNavigate, node]);

  // Early return after all hooks
  if (!node) return null;

  const goTo = (sibling) => {
    if (onNavigate) onNavigate(sibling, node.domain);
  };

  const goToRelated = (relatedId) => {
    const target = getTopicMap()[relatedId];
    if (target && onNavigate) {
      onNavigate(target, target.domain);
    }
  };

  const handleSaveNote = () => {
    if (onUpdateNote) onUpdateNote(node.id, noteText);
    setNoteOpen(false);
  };

  const jumpToSection = (id) => {
    const el = sectionRefs.current[id];
    if (!el) return;
    const container = scrollRef?.current;
    if (container) {
      const elRect = el.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const offset = elRect.top - containerRect.top + container.scrollTop - 80;
      container.scrollTo({ top: Math.max(0, offset), behavior: 'smooth' });
    } else {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const registerRef = useCallback((id) => (el) => {
    if (el) sectionRefs.current[id] = el;
  }, []);

  return (
    <div className="max-w-3xl mx-auto animate-fadeIn">
      {/* Floating Table of Contents */}
      <TableOfContents
        activeSection={activeSection}
        visibleSections={visibleSections}
        onJump={jumpToSection}
      />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-ink-400 dark:text-ink-300 mb-4">
        <span>{node.domain?.icon}</span>
        <span>{node.domain?.name}</span>
        <span>/</span>
        <span className="text-ink-700 dark:text-ink-200">{node.name}</span>
      </div>

      {/* Title section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <h1 className="text-3xl font-bold text-ink-950 dark:text-ink-50">{node.name}</h1>
          <span
            className="yi-badge"
            style={{ background: level.color + '20', color: level.color }}
          >
            {level.name} · {level.label}
          </span>
          <span className="yi-badge text-ink-400 dark:text-ink-300">⏱ {readingTime} 分钟</span>
          {onToggleBookmark && (
            <button
              onClick={onToggleBookmark}
              className={`text-xl transition-colors ${isBookmarked ? 'text-yellow-500' : 'text-ink-200 hover:text-yellow-400'}`}
              title={isBookmarked ? '取消收藏' : '收藏'}
            >
              {isBookmarked ? '★' : '☆'}
            </button>
          )}
          {onToggleMastered && (
            <button
              onClick={onToggleMastered}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                isMastered
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-700'
                  : 'bg-ink-50 dark:bg-ink-800 text-ink-400 border border-ink-200 dark:border-ink-700 hover:text-green-600 hover:border-green-300'
              }`}
              title={isMastered ? '取消掌握' : '已理解核心概念？点击标记为已掌握，用于追踪学习进度'}
            >
              {isMastered ? '✓ 已掌握' : '掌握'}
            </button>
          )}
        </div>

        {/* Keywords */}
        {node.keywords && (
          <div className="flex flex-wrap gap-2">
            {node.keywords.map((kw, i) => (
              <span
                key={i}
                className="yi-badge text-ink-600"
                style={{ background: color.bg, borderColor: color.border, borderWidth: 1 }}
              >
                {kw}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div id="kv-content" ref={registerRef('kv-content')} className="yi-card p-6 mb-6 scroll-mt-20">
        <h2 className="text-lg font-bold text-ink-950 dark:text-ink-50 mb-4 flex items-center gap-2">
          <span className="text-ink-300">📖</span> 概述
        </h2>
        <div className="text-ink-700 dark:text-ink-300 leading-relaxed text-base whitespace-pre-line space-y-3">
          {(node.content || '').split('\n\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </div>

      {/* Key concepts */}
      {node.keyConcepts && node.keyConcepts.length > 0 && (
        <div id="kv-concepts" ref={registerRef('kv-concepts')} className="yi-card p-6 mb-6 scroll-mt-20">
          <h2 className="text-lg font-bold text-ink-950 dark:text-ink-50 mb-4 flex items-center gap-2">
            <span className="text-ink-300">💡</span> 核心概念
          </h2>
          <div className="space-y-3">
            {node.keyConcepts.map((kc, i) => (
              <div
                key={i}
                className="flex gap-3 p-3 rounded-lg"
                style={{ background: color.bg, borderLeft: `3px solid ${color.accent}` }}
              >
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                  style={{ background: color.accent, color: '#fff' }}
                >
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  {typeof kc === 'string' ? (
                    <p className="text-ink-700 dark:text-ink-300 text-sm leading-relaxed">{kc}</p>
                  ) : (
                    <>
                      <p className="text-ink-950 dark:text-ink-50 text-sm font-bold">{kc.title}</p>
                      <p className="text-ink-600 dark:text-ink-400 text-sm leading-relaxed mt-0.5">{kc.desc}</p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Yi principle connection */}
      {node.domain?.yi && (
        <div id="kv-yi" ref={registerRef('kv-yi')} className="yi-card p-5 mb-6 scroll-mt-20" style={{ borderLeft: `3px solid ${color.accent}` }}>
          <h3 className="text-sm font-bold text-ink-500 dark:text-ink-200 mb-1">
            周易之道 · {node.domain.yi}
          </h3>
          <p className="text-sm text-ink-600 dark:text-ink-400">
            {node.domain.yi === '简易' && '大道至简——这个学科的美在于用简洁的规律解释复杂的现象。'}
            {node.domain.yi === '变易' && '万物皆变——这个学科研究的核心就是变化的规律。'}
            {node.domain.yi === '不易' && '变中有常——在千变万化的现象背后，有不变的法则在支配。'}
          </p>
        </div>
      )}

      {/* First Principle */}
      {node.domain?.firstPrinciple && (
        <div id="kv-principle" ref={registerRef('kv-principle')} className="yi-card p-5 mb-6 scroll-mt-20" style={{ borderLeft: `3px solid ${color.accent}` }}>
          <h3 className="text-sm font-bold text-ink-500 dark:text-ink-200 mb-1 flex items-center gap-1.5">
            <span>{FIRST_PRINCIPLES.icon}</span>
            第一性原理 · {node.domain.name}
          </h3>
          <p className="text-sm text-ink-600 dark:text-ink-400 mb-2">{node.domain.firstPrinciple}</p>
          <div className="mt-2 pt-2 border-t border-ink-100 space-y-1">
            {FIRST_PRINCIPLES.method.map((step, i) => (
              <p key={i} className="text-[11px] text-ink-400 dark:text-ink-300 leading-relaxed flex items-start gap-1.5">
                <span className="text-ink-300 dark:text-ink-400 shrink-0">{i + 1}.</span>
                <span>{step}</span>
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Cross-references */}
      {related.length > 0 && (
        <div id="kv-refs" ref={registerRef('kv-refs')} className="yi-card p-5 mb-6 scroll-mt-20">
          <h3 className="text-sm font-bold text-ink-500 dark:text-ink-200 mb-3 flex items-center gap-2">
            <span className="text-ink-300">🔗</span> 跨学科关联
          </h3>
          <div className="space-y-2">
            {related.map((rel) => {
              const target = getTopicMap()[rel.id];
              if (!target) return null;
              return (
                <button
                  key={rel.id}
                  onClick={() => goToRelated(rel.id)}
                  className="w-full text-left flex items-start gap-3 p-2.5 rounded-lg hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors group"
                >
                  <span className="text-lg shrink-0">{target.domain.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-ink-950 dark:text-ink-50 group-hover:text-ink-700 dark:group-hover:text-ink-200">{target.name}</span>
                      <span className="text-[10px] text-ink-300">{target.domain.name}</span>
                    </div>
                    <p className="text-xs text-ink-400 dark:text-ink-300 mt-0.5">{rel.label}</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink-300 shrink-0 mt-1">
                    <path d="M5 3l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Exercises — Interactive */}
      {node.exercises && node.exercises.length > 0 && (
        <div id="kv-exercises" ref={registerRef('kv-exercises')} className="yi-card p-6 mb-6 scroll-mt-20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-ink-950 dark:text-ink-50 flex items-center gap-2">
              <span className="text-ink-300">✏️</span> 思考与练习
            </h2>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-16 bg-ink-100 dark:bg-ink-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-300"
                  style={{ width: exTotal > 0 ? `${(exDone / exTotal) * 100}%` : '0%' }}
                />
              </div>
              <span className="text-xs text-ink-400 dark:text-ink-300">{exDone}/{exTotal}</span>
            </div>
          </div>
          <div className="space-y-2">
            {node.exercises.map((ex, i) => (
              <ExerciseItem
                key={i}
                ex={ex}
                index={i}
                isCompleted={exCompleted.has(i)}
                thought={exProgress.thoughts?.[i] || ''}
                onToggle={() => onToggleExercise(node.id, i)}
                onSaveThought={(idx, text) => onSaveThought(node.id, idx, text)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Difficulty meter */}
      <div className="yi-card p-5 mb-6">
        <h3 className="text-sm font-bold text-ink-500 dark:text-ink-200 mb-3">难度层级</h3>
        <div className="flex gap-1.5">
          {Object.entries(LEVELS).map(([key, lv]) => (
            <div key={key} className="flex-1">
              <div
                className={`h-2 rounded-full transition-all ${Number(key) <= node.level ? 'opacity-100' : 'opacity-20'}`}
                style={{ background: Number(key) <= node.level ? lv.color : '#dfddd0' }}
              />
              <div className={`text-[10px] text-center mt-1 ${Number(key) === node.level ? 'font-bold text-ink-950 dark:text-ink-50' : 'text-ink-300'}`}>
                {lv.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Path */}
      <LearningPath
        topicId={node.id}
        topicMap={getTopicMap()}
        visited={visited || new Set()}
        onSelect={onNavigate}
      />

      {/* Notes */}
      <div id="kv-notes" ref={registerRef('kv-notes')} className="yi-card p-5 mb-6 scroll-mt-20">
        <button
          onClick={() => setNoteOpen(!noteOpen)}
          className="w-full flex items-center justify-between text-left"
        >
          <h3 className="text-sm font-bold text-ink-500 dark:text-ink-200 flex items-center gap-2">
            <span className="text-ink-300">📝</span> 学习笔记
            {note && <span className="w-2 h-2 rounded-full bg-yi-400" />}
          </h3>
          <svg
            width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"
            className={`text-ink-300 transition-transform ${noteOpen ? 'rotate-180' : ''}`}
          >
            <path d="M3 5l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {noteOpen && (
          <div className="mt-3 animate-fadeIn">
            {/* Edit/Preview toggle */}
            <div className="flex items-center gap-1 mb-2">
              <button
                onClick={() => setNotePreview(false)}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                  !notePreview ? 'bg-ink-950 dark:bg-ink-100 text-white dark:text-ink-950' : 'text-ink-400 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800'
                }`}
              >
                编辑
              </button>
              <button
                onClick={() => setNotePreview(true)}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                  notePreview ? 'bg-ink-950 dark:bg-ink-100 text-white dark:text-ink-950' : 'text-ink-400 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800'
                }`}
              >
                预览
              </button>
              <span className="text-[10px] text-ink-300 dark:text-ink-400 ml-1">支持 Markdown</span>
            </div>

            {notePreview ? (
              /* Preview mode */
              <div className="yi-input w-full min-h-[7rem] p-3 overflow-auto">
                {noteText.trim() ? (
                  renderMarkdown(noteText)
                ) : (
                  <p className="text-sm text-ink-300 dark:text-ink-500 italic">暂无笔记内容</p>
                )}
              </div>
            ) : (
              /* Edit mode */
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="写下你的学习心得、疑问或总结... 支持 Markdown 格式"
                className="yi-input w-full h-28 resize-none text-sm"
              />
            )}

            <div className="flex justify-end gap-2 mt-2">
              {note && (
                <button
                  onClick={() => {
                    setNoteText('');
                    if (onUpdateNote) onUpdateNote(node.id, '');
                    setNoteOpen(false);
                    setNotePreview(false);
                  }}
                  className="yi-btn text-xs text-ink-400 dark:text-ink-300 hover:text-red-500"
                >
                  删除
                </button>
              )}
              <button onClick={handleSaveNote} className="yi-btn text-xs bg-ink-950 text-white px-3 py-1.5 rounded-lg">
                保存
              </button>
            </div>
            {note?.updatedAt && (
              <p className="text-[10px] text-ink-300 mt-1">
                上次编辑：{new Date(note.updatedAt).toLocaleString('zh-CN')}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Navigation between siblings */}
      {siblings.length > 1 && (
        <div className="flex justify-between items-center pt-4 border-t border-ink-100 dark:border-ink-800">
          {currentIndex > 0 ? (
            <button
              onClick={() => goTo(siblings[currentIndex - 1])}
              className="text-sm text-ink-500 hover:text-ink-950 dark:hover:text-ink-50 transition-colors flex items-center gap-1"
            >
              ← {siblings[currentIndex - 1].name}
            </button>
          ) : <div />}
          <span className="text-xs text-ink-300">
            {currentIndex + 1} / {siblings.length}
            <span className="hidden md:inline ml-2 text-ink-200">← → 键切换</span>
          </span>
          {currentIndex < siblings.length - 1 ? (
            <button
              onClick={() => goTo(siblings[currentIndex + 1])}
              className="text-sm text-ink-500 hover:text-ink-950 dark:hover:text-ink-50 transition-colors flex items-center gap-1"
            >
              {siblings[currentIndex + 1].name} →
            </button>
          ) : <div />}
        </div>
      )}
    </div>
  );
}

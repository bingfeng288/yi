import { useState, useMemo, useCallback } from 'react';

// Default cards from knowledge tree
const DEFAULT_CARDS = [
  { id: 'd1', front: '什么是"巴纳姆效应"？', back: '人们倾向于认为模糊的、普遍适用的人格描述是专门为自己量身定做的——这是算命"准"的心理学解释。', category: '思维方法' },
  { id: 'd2', front: '热力学第二定律的核心是什么？', back: '孤立系统的熵（无序度）永远不会减少。这解释了为什么时间有方向、为什么热量不能自发从冷处传到热处。', category: '物理' },
  { id: 'd3', front: '什么是"比较优势"？', back: '即使一个国家在所有商品的生产上都不如另一个国家，两国仍然可以通过贸易互利——只要各自专注于相对效率更高的商品。', category: '经济学' },
  { id: 'd4', front: 'DNA的中心法则是什么？', back: '遗传信息从DNA流向RNA，再流向蛋白质。这是分子生物学的基础框架（后来发现RNA也可以反向转录为DNA）。', category: '生物' },
  { id: 'd5', front: '什么是"可证伪性"？', back: '一个理论要成为科学理论，必须能够被实验或观测所否定。不能被证伪的理论（如占星术）不是科学。——波普尔', category: '哲学' },
  { id: 'd6', front: '勾股定理的公式是什么？', back: 'a² + b² = c²，其中c是直角三角形的斜边长度。', category: '数学' },
  { id: 'd7', front: '什么是"安全困境"？', back: '一国增强军备以求安全，反而使其他国家感到威胁而也增强军备，结果双方都更不安全。——国际关系核心概念', category: '政治学' },
  { id: 'd8', front: '光合作用的简化方程式？', back: '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂（光能驱动）', category: '生物' },
  { id: 'd9', front: '什么是"罪刑法定"原则？', back: '法无明文规定不为罪，法无明文规定不处罚。这是刑法的核心原则，保护公民免受国家权力的任意侵犯。', category: '法学' },
  { id: 'd10', front: 'TCP三次握手的过程？', back: '①客户端→服务器：SYN ②服务器→客户端：SYN+ACK ③客户端→服务器：ACK。之后连接建立。', category: '计算机' },
  { id: 'd11', front: '克劳塞维茨说"战争是什么的延续"？', back: '"战争是政治的另一种手段的延续"——战争不是独立行为，而是政治目标的工具。', category: '军事学' },
  { id: 'd12', front: '什么是"格里姆定律"？', back: '日耳曼语辅音发生了系统性的音变（如拉丁语p→英语f），这证明了语言之间存在历史亲缘关系。', category: '语言学' },
];

const CATEGORIES = ['全部', ...new Set(DEFAULT_CARDS.map(c => c.category))];

export default function FlashcardTool() {
  const [cards] = useState(DEFAULT_CARDS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [filter, setFilter] = useState('全部');
  const [scores, setScores] = useState({}); // id -> { interval, easeFactor, repetitions }
  const [mode, setMode] = useState('browse'); // browse | quiz
  const [quizCards, setQuizCards] = useState([]);
  const [quizIndex, setQuizIndex] = useState(0);

  const filtered = useMemo(() =>
    filter === '全部' ? cards : cards.filter(c => c.category === filter),
    [cards, filter]
  );

  // SM-2 spaced repetition algorithm
  const sm2 = useCallback((cardId, quality) => {
    // quality: 0-5 (0=complete blackout, 5=perfect)
    setScores(prev => {
      const current = prev[cardId] || { interval: 1, easeFactor: 2.5, repetitions: 0 };
      let { interval, easeFactor, repetitions } = current;

      if (quality >= 3) {
        if (repetitions === 0) interval = 1;
        else if (repetitions === 1) interval = 6;
        else interval = Math.round(interval * easeFactor);
        repetitions++;
      } else {
        repetitions = 0;
        interval = 1;
      }

      easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
      if (easeFactor < 1.3) easeFactor = 1.3;

      return { ...prev, [cardId]: { interval, easeFactor, repetitions } };
    });
  }, []);

  const startQuiz = useCallback(() => {
    const now = Date.now();
    // Prioritize cards due for review
    const sorted = [...filtered].sort((a, b) => {
      const sa = scores[a.id];
      const sb = scores[b.id];
      const da = sa ? sa.interval : 0;
      const db = sb ? sb.interval : 0;
      return da - db;
    });
    setQuizCards(sorted.slice(0, Math.min(10, sorted.length)));
    setQuizIndex(0);
    setFlipped(false);
    setMode('quiz');
  }, [filtered, scores]);

  const currentCard = mode === 'quiz' ? quizCards[quizIndex] : filtered[currentIndex];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Mode & filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setMode('browse')}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${mode === 'browse' ? 'bg-ink-950 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'}`}
        >
          浏览
        </button>
        <button
          onClick={startQuiz}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${mode === 'quiz' ? 'bg-ink-950 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'}`}
        >
          间隔复习
        </button>
        <div className="flex-1" />
        <select
          value={filter}
          onChange={(e) => { setFilter(e.target.value); setCurrentIndex(0); }}
          className="px-3 py-1.5 rounded-lg text-sm border border-ink-200 bg-white"
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Card */}
      {currentCard ? (
        <div className="animate-fadeIn">
          <div
            onClick={() => setFlipped(!flipped)}
            className="yi-card p-8 min-h-[200px] flex flex-col items-center justify-center cursor-pointer
                       hover:shadow-md transition-all select-none mb-4"
          >
            {!flipped ? (
              <div className="text-center">
                <div className="text-xs text-ink-400 dark:text-ink-300 mb-2">{currentCard.category}</div>
                <div className="text-lg text-ink-950 font-medium">{currentCard.front}</div>
                <div className="text-sm text-ink-300 dark:text-ink-400 mt-4">点击翻转查看答案</div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-sm text-ink-500 dark:text-ink-200 leading-relaxed">{currentCard.back}</div>
                <div className="text-sm text-ink-300 dark:text-ink-400 mt-4">点击翻回问题</div>
              </div>
            )}
          </div>

          {/* Navigation (browse mode) */}
          {mode === 'browse' && (
            <div className="flex justify-between items-center">
              <button
                onClick={() => { setCurrentIndex(Math.max(0, currentIndex - 1)); setFlipped(false); }}
                disabled={currentIndex === 0}
                className="text-sm text-ink-500 dark:text-ink-200 hover:text-ink-950 disabled:opacity-30 transition-colors"
              >
                ← 上一张
              </button>
              <span className="text-sm text-ink-400 dark:text-ink-300">{currentIndex + 1} / {filtered.length}</span>
              <button
                onClick={() => { setCurrentIndex(Math.min(filtered.length - 1, currentIndex + 1)); setFlipped(false); }}
                disabled={currentIndex === filtered.length - 1}
                className="text-sm text-ink-500 dark:text-ink-200 hover:text-ink-950 disabled:opacity-30 transition-colors"
              >
                下一张 →
              </button>
            </div>
          )}

          {/* SM-2 rating (quiz mode, after flip) */}
          {mode === 'quiz' && flipped && (
            <div className="space-y-3">
              <div className="text-sm text-ink-500 dark:text-ink-200 text-center mb-2">你记住了吗？</div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { q: 1, label: '忘了', color: 'bg-red-100 text-red-700 hover:bg-red-200' },
                  { q: 3, label: '模糊', color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' },
                  { q: 4, label: '记得', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
                  { q: 5, label: '熟练', color: 'bg-green-100 text-green-700 hover:bg-green-200' },
                ].map(({ q, label, color }) => (
                  <button
                    key={q}
                    onClick={() => {
                      sm2(currentCard.id, q);
                      if (quizIndex < quizCards.length - 1) {
                        setQuizIndex(quizIndex + 1);
                        setFlipped(false);
                      } else {
                        setMode('browse');
                      }
                    }}
                    className={`py-2 rounded-lg text-sm font-medium transition-colors ${color}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="text-xs text-ink-300 dark:text-ink-400 text-center">
                {quizIndex + 1} / {quizCards.length}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="yi-card p-8 text-center text-ink-400 dark:text-ink-300">
          没有卡片
        </div>
      )}

      {/* Stats */}
      <div className="mt-6 yi-card p-4">
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="text-2xl font-bold text-ink-950">{filtered.length}</div>
            <div className="text-xs text-ink-400 dark:text-ink-300">总卡片</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-ink-950">{Object.keys(scores).length}</div>
            <div className="text-xs text-ink-400 dark:text-ink-300">已复习</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-ink-950">
              {Object.values(scores).filter(s => s.repetitions >= 3).length}
            </div>
            <div className="text-xs text-ink-400 dark:text-ink-300">已掌握</div>
          </div>
        </div>
      </div>
    </div>
  );
}

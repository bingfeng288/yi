import Calculator from './tools/Calculator';
import UnitConverter from './tools/UnitConverter';
import PeriodicTable from './tools/PeriodicTable';
import StatsTool from './tools/StatsTool';
import LogicTool from './tools/LogicTool';
import FlashcardTool from './tools/FlashcardTool';
import MathViz from './tools/MathViz';
import PhysicsSim from './tools/PhysicsSim';

const TOOL_COMPONENTS = {
  calculator: Calculator,
  converter: UnitConverter,
  periodic: PeriodicTable,
  stats: StatsTool,
  logic: LogicTool,
  flashcard: FlashcardTool,
  'math-viz': MathViz,
  'physics-sim': PhysicsSim,
};

export default function ToolPanel({ isOpen, onClose, onBack, tools, activeTool, onSelectTool }) {
  const ActiveComponent = activeTool ? TOOL_COMPONENTS[activeTool] : null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden animate-scaleIn flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
          <div className="flex items-center gap-2">
            {ActiveComponent && (
              <button
                onClick={onBack}
                className="p-1.5 rounded-lg hover:bg-ink-100 transition-colors text-ink-500"
                aria-label="返回工具列表"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M11 4L6 9l5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
            <h2 className="text-lg font-bold text-ink-950">
              {ActiveComponent ? tools.find(t => t.id === activeTool)?.name : '实用工具'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-ink-100 transition-colors text-ink-400"
            aria-label="关闭"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 5l10 10M15 5l-10 10" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {ActiveComponent ? (
            <div className="animate-fadeIn">
              <ActiveComponent />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {tools.map((tool) => {
                const hasComponent = TOOL_COMPONENTS[tool.id];
                return (
                  <button
                    key={tool.id}
                    onClick={() => hasComponent ? onSelectTool(tool.id) : null}
                    className={`yi-card p-4 text-center transition-transform ${
                      hasComponent ? 'hover:scale-[1.02] cursor-pointer' : 'opacity-50 cursor-not-allowed'
                    }`}
                    disabled={!hasComponent}
                  >
                    <div className="text-3xl mb-2">{tool.icon}</div>
                    <div className="font-bold text-sm text-ink-950">{tool.name}</div>
                    <div className="text-xs text-ink-400 mt-1">{tool.description}</div>
                    {!hasComponent && (
                      <div className="text-[10px] text-ink-300 mt-1">即将上线</div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Keyboard hint */}
        <div className="px-6 py-2 border-t border-ink-50 text-[11px] text-ink-300 text-center">
          按 Esc 关闭
        </div>
      </div>
    </div>
  );
}

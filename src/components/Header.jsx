export default function Header({ searchQuery, onSearchChange, onToolClick, onMenuClick, onLogoClick, onDashboardClick, onHelpClick, toolCount, searchInputRef }) {
  return (
    <header className="h-14 border-b border-ink-200 bg-white/80 backdrop-blur-sm flex items-center px-4 gap-3 shrink-0 relative z-20">
      {/* Menu button (mobile) */}
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 rounded-lg hover:bg-ink-100 transition-colors text-ink-600"
        aria-label="Toggle menu"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 5h14M3 10h14M3 15h14" strokeLinecap="round" />
        </svg>
      </button>

      {/* Logo */}
      <button
        onClick={onLogoClick}
        className="flex items-center gap-2 shrink-0 hover:opacity-70 transition-opacity"
        aria-label="回到首页"
      >
        <span className="text-xl font-bold text-ink-950 font-serif">易</span>
        <span className="hidden sm:inline text-sm text-ink-400 border-l border-ink-200 pl-2">知识体系</span>
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md mx-auto relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="6.5" cy="6.5" r="5" />
            <path d="M10 10l4.5 4.5" strokeLinecap="round" />
          </svg>
        </div>
        <input
          ref={searchInputRef}
          type="text"
          placeholder="搜索知识... (⌘K)"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-ink-200 bg-ink-50
                     text-sm focus:outline-none focus:ring-2 focus:ring-ink-950/10 focus:border-ink-400
                     transition-all placeholder:text-ink-300"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-ink-100 text-ink-400"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 3l8 8M11 3l-8 8" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Dashboard button */}
      <button
        onClick={onDashboardClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ink-200 text-ink-600 text-sm
                   hover:bg-ink-50 transition-colors active:scale-95 shrink-0"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="2" width="5" height="5" rx="1" />
          <rect x="9" y="2" width="5" height="5" rx="1" />
          <rect x="2" y="9" width="5" height="5" rx="1" />
          <rect x="9" y="9" width="5" height="5" rx="1" />
        </svg>
        <span className="hidden sm:inline">学习</span>
      </button>

      {/* Tools button */}
      <button
        onClick={onToolClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ink-950 text-white text-sm
                   hover:bg-ink-900 transition-colors active:scale-95 shrink-0"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6 2l4 0M2 6l12 0M4 10l8 0M6 14l4 0" strokeLinecap="round" />
        </svg>
        <span className="hidden sm:inline">工具</span>
        <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">{toolCount}</span>
      </button>

      {/* Help button */}
      <button
        onClick={onHelpClick}
        className="w-8 h-8 rounded-full border border-ink-200 text-ink-400 text-sm font-bold
                   hover:bg-ink-50 hover:text-ink-600 transition-colors shrink-0 flex items-center justify-center"
        title="键盘快捷键 (?)"
      >
        ?
      </button>
    </header>
  );
}

<p align="center">
  <h1 align="center">易 Yi</h1>
  <p align="center">A Multi-Discipline Knowledge System · Inspired by I Ching Philosophy & First Principles</p>
  <p align="center">
    <a href="https://github.com/bingfeng288/yi/blob/master/README.md">中文</a> ·
    <a href="https://github.com/bingfeng288/yi/blob/master/README_EN.md">English</a>
  </p>
</p>

---

## Introduction

**Yi (易)** is a multi-discipline knowledge learning system spanning 19 academic domains and 117 topics. Its design philosophy draws from the [Three Meanings of I Ching (周易三义)](https://en.wikipedia.org/wiki/I_Ching), grounded in first principles thinking.

> **Simplicity (简易)** — The great way is simple — minimize steps in learning interaction
> **Change (变易)** — All things change — progress evolves dynamically, knowledge flows and connects
> **Constancy (不易)** — There is permanence in change — each discipline rests on immutable first principles

## Domains Covered

| Category | Disciplines |
|----------|-------------|
| Natural Sciences | Mathematics, Physics, Chemistry, Biology, Earth Science |
| Engineering & Tech | Computer Science, Engineering |
| Social Sciences | Economics, Finance, Political Science, Military Science, Law |
| Humanities & Arts | Philosophy, Linguistics, Arts, History |
| Applied Sciences | Medicine, Agriculture |
| Methodology | Thinking Methods |

## Key Features

- **Knowledge Tree** — 19 domains × 117 topics, each with first principles explanation and I Ching mapping
- **Learning Paths** — Prerequisite graph with smart recommendations for what to study next
- **Spaced Repetition** — SM-2 inspired review reminders at 1/3/7/14/30 day intervals
- **Cross-Domain Links** — Bidirectional references revealing hidden connections between disciplines
- **Interactive Exercises** — Thought-provoking questions per topic with personal reflection recording
- **Progress Tracking** — Daily streaks, daily goals, and a 19-badge achievement system
- **Knowledge Graph** — Canvas-rendered network of domain relationships with progress rings
- **Built-in Tools** — Scientific calculator, unit converter, periodic table, function plotter, and more
- **Data Backup** — JSON export/import for cross-device sync

## Tech Stack

- **React 18** + **Vite 5** + **Tailwind CSS 3.4**
- Pure frontend, localStorage persistence, no backend required
- Canvas knowledge graph, IntersectionObserver-based table of contents
- Build output ~182KB gzip

## Quick Start

```bash
# Clone the repository
git clone https://github.com/bingfeng288/yi.git
cd yi

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── App.jsx                    # Main app, central state management
├── components/
│   ├── Header.jsx             # Top navigation bar
│   ├── Sidebar.jsx            # Sidebar (domain tree + quick filter)
│   ├── KnowledgeView.jsx      # Topic detail page (with floating TOC)
│   ├── KnowledgeGraph.jsx     # Canvas-based knowledge graph
│   ├── StudyDashboard.jsx     # Study center (stats/achievements/bookmarks/notes)
│   ├── SearchResults.jsx      # Search results grouped by domain
│   ├── ShortcutHelp.jsx       # Keyboard shortcut help
│   ├── ToolPanel.jsx          # Tool panel
│   └── tools/                 # 8 built-in tool components
├── data/
│   ├── knowledgeTree.js       # 19 domains, 117 topics with content
│   ├── crossReferences.js     # Cross-domain connections
│   ├── learningPath.js        # Learning paths & recommendations
│   ├── achievements.js        # 19 achievement badges
│   ├── streak.js              # Daily streak & goal tracking
│   ├── review.js              # Spaced repetition system
│   └── exercises.js           # Exercise progress tracking
└── index.css                  # Global styles
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘ K` | Focus search bar |
| `Esc` | Close panel / clear search |
| `←` `→` | Navigate between sibling topics |
| `?` | Show keyboard shortcuts |

## Design Philosophy

Every discipline has a `firstPrinciple` — an irreducible foundational assumption from which all knowledge grows upward. The system also maps each topic to I Ching hexagram themes (Simplicity / Change / Constancy), fusing ancient Eastern wisdom with modern academic knowledge.

## License

[MIT License](LICENSE)

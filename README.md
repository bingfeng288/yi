<p align="center">
  <h1 align="center">易 Yi</h1>
  <p align="center">跨学科知识体系 · 融合周易哲学与第一性原理</p>
  <p align="center">
    <a href="https://github.com/bingfeng288/yi/blob/master/README.md">中文</a> ·
    <a href="https://github.com/bingfeng288/yi/blob/master/README_EN.md">English</a>
  </p>
</p>

---

## 简介

**易** 是一个跨学科知识学习系统，涵盖 19 个学科领域、117 个专题，以 [周易三义](https://zh.wikipedia.org/wiki/%E5%91%A8%E6%98%93) 为设计哲学，以第一性原理为知识根基。

> **简易** · 大道至简 — 追求最少步骤的学习交互
> **变易** · 万物皆变 — 学习进度动态演化，知识之间流动关联
> **不易** · 变中有常 — 学科背后有不变的第一性原理

## 学科覆盖

| 领域 | 学科 |
|------|------|
| 自然科学 | 数学、物理学、化学、生物学、地球科学 |
| 工程技术 | 计算机科学、工程学 |
| 社会科学 | 经济学、金融学、政治学、军事学、法学 |
| 人文艺术 | 哲学、语言学、艺术、历史 |
| 应用科学 | 医学、农学 |
| 方法论 | 思维方法 |

## 核心功能

- **知识树** — 19 个学科 × 117 个专题，每个专题配有第一性原理阐释与周易映射
- **学习路径** — 前置知识图谱，智能推荐下一步学习内容
- **间隔复习** — 基于 SM-2 的遗忘曲线复习提醒（1/3/7/14/30 天）
- **跨学科关联** — 双向学科交叉引用，揭示知识之间的隐藏联系
- **交互练习** — 每个专题配有思考题，支持记录思考过程
- **学习追踪** — 连续打卡、每日目标、成就徽章系统
- **知识图谱** — Canvas 绘制的学科关联网络，可视化学习进度
- **实用工具** — 科学计算器、单位换算、元素周期表、函数可视化等 8 个工具
- **数据备份** — JSON 导出/导入，跨设备同步

## 技术栈

- **React 18** + **Vite 5** + **Tailwind CSS 3.4**
- 纯前端，localStorage 持久化，无需后端
- Canvas 知识图谱，IntersectionObserver 目录导航
- 构建产物 ~182KB gzip

## 快速开始

```bash
# 克隆仓库
git clone https://github.com/bingfeng288/yi.git
cd yi

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 项目结构

```
src/
├── App.jsx                    # 主应用，状态管理
├── components/
│   ├── Header.jsx             # 顶部导航栏
│   ├── Sidebar.jsx            # 侧边栏（学科树 + 快速筛选）
│   ├── KnowledgeView.jsx      # 专题详情页（含浮动目录）
│   ├── KnowledgeGraph.jsx     # Canvas 知识图谱
│   ├── StudyDashboard.jsx     # 学习中心（统计/成就/收藏/笔记）
│   ├── SearchResults.jsx      # 搜索结果
│   ├── ShortcutHelp.jsx       # 快捷键帮助
│   ├── ToolPanel.jsx          # 工具面板
│   └── tools/                 # 8 个实用工具组件
├── data/
│   ├── knowledgeTree.js       # 19 学科 117 专题数据
│   ├── crossReferences.js     # 跨学科关联
│   ├── learningPath.js        # 学习路径与推荐
│   ├── achievements.js        # 19 个成就徽章
│   ├── streak.js              # 打卡与连续学习
│   ├── review.js              # 间隔复习系统
│   └── exercises.js           # 练习进度追踪
└── index.css                  # 全局样式
```

## 键盘快捷键

| 快捷键 | 功能 |
|--------|------|
| `⌘ K` | 聚焦搜索框 |
| `Esc` | 关闭面板 / 清除搜索 |
| `←` `→` | 切换同级专题 |
| `?` | 显示快捷键帮助 |

## 设计理念

每个学科都有一个 `firstPrinciple`（第一性原理）——不可再分的基本假设，所有知识从这些根基向上生长。系统同时提供周易卦象映射（简易/变易/不易），将古代东方智慧与现代知识体系相融合。

## 开源协议

[MIT License](LICENSE)

// Achievement definitions
// Each achievement has: id, name, desc, icon, check function

export const ACHIEVEMENTS = [
  // Visit milestones
  {
    id: 'first-step',
    name: '初窥门径',
    desc: '阅读第一个专题',
    icon: '🌱',
    check: ({ visited }) => visited.size >= 1,
  },
  {
    id: 'curious-mind',
    name: '求知若渴',
    desc: '阅读 10 个专题',
    icon: '📚',
    check: ({ visited }) => visited.size >= 10,
  },
  {
    id: 'erudite',
    name: '学富五车',
    desc: '阅读 30 个专题',
    icon: '🎓',
    check: ({ visited }) => visited.size >= 30,
  },
  {
    id: 'polymath',
    name: '百科全书',
    desc: '阅读 60 个专题',
    icon: '🏛',
    check: ({ visited }) => visited.size >= 60,
  },

  // Domain coverage
  {
    id: 'multi-learner',
    name: '融会贯通',
    desc: '涉猎 5 个不同学科',
    icon: '🔗',
    check: ({ domainCount }) => domainCount >= 5,
  },
  {
    id: 'renaissance',
    name: '博古通今',
    desc: '涉猎 10 个不同学科',
    icon: '🌌',
    check: ({ domainCount }) => domainCount >= 10,
  },
  {
    id: 'universal',
    name: '全才',
    desc: '涉猎全部 19 个学科',
    icon: '☯',
    check: ({ domainCount, totalDomains }) => domainCount >= totalDomains,
  },

  // Domain mastery
  {
    id: 'domain-master',
    name: '术业专攻',
    desc: '完成任意一个学科的全部专题',
    icon: '👑',
    check: ({ domainMastery }) => domainMastery,
  },
  {
    id: 'triple-master',
    name: '三位一体',
    desc: '完成 3 个学科的全部专题',
    icon: '⭐',
    check: ({ fullDomains }) => fullDomains >= 3,
  },

  // Difficulty
  {
    id: 'challenge-seeker',
    name: '知难而进',
    desc: '阅读一个专家级（Lv.4）专题',
    icon: '🔥',
    check: ({ hasExpert }) => hasExpert,
  },

  // Features
  {
    id: 'collector',
    name: '收藏家',
    desc: '收藏 5 个专题',
    icon: '⭐',
    check: ({ bookmarks }) => bookmarks.size >= 5,
  },
  {
    id: 'note-taker',
    name: '笔记达人',
    desc: '写 5 条学习笔记',
    icon: '✍',
    check: ({ noteCount }) => noteCount >= 5,
  },
  {
    id: 'explorer',
    name: '随机探索者',
    desc: '使用随机探索功能',
    icon: '🎲',
    check: ({ usedRandom }) => usedRandom,
  },

  // Speed
  {
    id: 'speed-reader',
    name: '一目十行',
    desc: '单次会话阅读 5 个专题',
    icon: '⚡',
    check: ({ sessionVisited }) => sessionVisited >= 5,
  },

  // Streak
  {
    id: 'streak-3',
    name: '三日不辍',
    desc: '连续学习 3 天',
    icon: '🔥',
    check: ({ currentStreak }) => currentStreak >= 3,
  },
  {
    id: 'streak-7',
    name: '周周不怠',
    desc: '连续学习 7 天',
    icon: '🔥',
    check: ({ currentStreak }) => currentStreak >= 7,
  },
  {
    id: 'streak-30',
    name: '月月精进',
    desc: '连续学习 30 天',
    icon: '💎',
    check: ({ currentStreak }) => currentStreak >= 30,
  },
  {
    id: 'daily-goal',
    name: '今日达标',
    desc: '完成每日学习目标',
    icon: '🎯',
    check: ({ todayGoalMet }) => todayGoalMet,
  },

  // Exercises
  {
    id: 'first-exercise',
    name: '学以致用',
    desc: '完成第一个练习题',
    icon: '✏️',
    check: ({ exercisesCompleted }) => exercisesCompleted >= 1,
  },
  {
    id: 'exercise-10',
    name: '勤学苦练',
    desc: '累计完成 10 道练习题',
    icon: '📝',
    check: ({ exercisesCompleted }) => exercisesCompleted >= 10,
  },
];

// Check all achievements and return newly unlocked ones
export function checkAchievements(state, unlockedIds) {
  const newlyUnlocked = [];
  for (const achievement of ACHIEVEMENTS) {
    if (unlockedIds.has(achievement.id)) continue;
    if (achievement.check(state)) {
      newlyUnlocked.push(achievement);
    }
  }
  return newlyUnlocked;
}

// Load unlocked achievements from localStorage
export function loadUnlocked() {
  try {
    const saved = localStorage.getItem('yi-achievements');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  } catch { return new Set(); }
}

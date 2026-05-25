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

  // Domain mastery — complete all topics in a specific domain
  {
    id: 'master-math',
    name: '数理之基',
    desc: '完成数学全部专题',
    icon: '🧮',
    check: ({ domainVisits }) => domainVisits?.math?.count === domainVisits?.math?.total && domainVisits?.math?.total > 0,
  },
  {
    id: 'master-physics',
    name: '万物之理',
    desc: '完成物理学全部专题',
    icon: '⚛',
    check: ({ domainVisits }) => domainVisits?.physics?.count === domainVisits?.physics?.total && domainVisits?.physics?.total > 0,
  },
  {
    id: 'master-chemistry',
    name: '元素之秘',
    desc: '完成化学全部专题',
    icon: '🧪',
    check: ({ domainVisits }) => domainVisits?.chemistry?.count === domainVisits?.chemistry?.total && domainVisits?.chemistry?.total > 0,
  },
  {
    id: 'master-biology',
    name: '生命之谜',
    desc: '完成生物学全部专题',
    icon: '🧬',
    check: ({ domainVisits }) => domainVisits?.biology?.count === domainVisits?.biology?.total && domainVisits?.biology?.total > 0,
  },
  {
    id: 'master-medicine',
    name: '悬壶济世',
    desc: '完成医学全部专题',
    icon: '🏥',
    check: ({ domainVisits }) => domainVisits?.medicine?.count === domainVisits?.medicine?.total && domainVisits?.medicine?.total > 0,
  },
  {
    id: 'master-cs',
    name: '代码人生',
    desc: '完成计算机科学全部专题',
    icon: '💻',
    check: ({ domainVisits }) => domainVisits?.cs?.count === domainVisits?.cs?.total && domainVisits?.cs?.total > 0,
  },
  {
    id: 'master-earth',
    name: '地学之眼',
    desc: '完成地球科学全部专题',
    icon: '🌍',
    check: ({ domainVisits }) => domainVisits?.earth?.count === domainVisits?.earth?.total && domainVisits?.earth?.total > 0,
  },
  {
    id: 'master-engineering',
    name: '匠心独运',
    desc: '完成工程学全部专题',
    icon: '⚙',
    check: ({ domainVisits }) => domainVisits?.engineering?.count === domainVisits?.engineering?.total && domainVisits?.engineering?.total > 0,
  },
  {
    id: 'master-philosophy',
    name: '思辨之道',
    desc: '完成哲学全部专题',
    icon: '🤔',
    check: ({ domainVisits }) => domainVisits?.philosophy?.count === domainVisits?.philosophy?.total && domainVisits?.philosophy?.total > 0,
  },
  {
    id: 'master-methods',
    name: '方法之钥',
    desc: '完成思维方法全部专题',
    icon: '🔑',
    check: ({ domainVisits }) => domainVisits?.methods?.count === domainVisits?.methods?.total && domainVisits?.methods?.total > 0,
  },
  {
    id: 'master-linguistics',
    name: '语言之桥',
    desc: '完成语言学全部专题',
    icon: '💬',
    check: ({ domainVisits }) => domainVisits?.linguistics?.count === domainVisits?.linguistics?.total && domainVisits?.linguistics?.total > 0,
  },
  {
    id: 'master-arts',
    name: '美的历程',
    desc: '完成艺术学全部专题',
    icon: '🎨',
    check: ({ domainVisits }) => domainVisits?.arts?.count === domainVisits?.arts?.total && domainVisits?.arts?.total > 0,
  },
  {
    id: 'master-history',
    name: '以史为鉴',
    desc: '完成历史学全部专题',
    icon: '📜',
    check: ({ domainVisits }) => domainVisits?.history?.count === domainVisits?.history?.total && domainVisits?.history?.total > 0,
  },
  {
    id: 'master-economics',
    name: '经世济民',
    desc: '完成经济学全部专题',
    icon: '📊',
    check: ({ domainVisits }) => domainVisits?.economics?.count === domainVisits?.economics?.total && domainVisits?.economics?.total > 0,
  },
  {
    id: 'master-finance',
    name: '金融之道',
    desc: '完成金融学全部专题',
    icon: '💰',
    check: ({ domainVisits }) => domainVisits?.finance?.count === domainVisits?.finance?.total && domainVisits?.finance?.total > 0,
  },
  {
    id: 'master-agriculture',
    name: '稼穑之道',
    desc: '完成农学全部专题',
    icon: '🌾',
    check: ({ domainVisits }) => domainVisits?.agriculture?.count === domainVisits?.agriculture?.total && domainVisits?.agriculture?.total > 0,
  },
  {
    id: 'master-political',
    name: '治国之道',
    desc: '完成政治学全部专题',
    icon: '🏛',
    check: ({ domainVisits }) => domainVisits?.political?.count === domainVisits?.political?.total && domainVisits?.political?.total > 0,
  },
  {
    id: 'master-military',
    name: '兵法之道',
    desc: '完成军事学全部专题',
    icon: '⚔',
    check: ({ domainVisits }) => domainVisits?.military?.count === domainVisits?.military?.total && domainVisits?.military?.total > 0,
  },
  {
    id: 'master-law',
    name: '正义之道',
    desc: '完成法学全部专题',
    icon: '⚖',
    check: ({ domainVisits }) => domainVisits?.law?.count === domainVisits?.law?.total && domainVisits?.law?.total > 0,
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

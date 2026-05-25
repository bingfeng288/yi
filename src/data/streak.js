// Streak & daily goal tracking utilities

const STORAGE_KEY = 'yi-daily-visits';
const GOAL_KEY = 'yi-daily-goal';

function dateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function today() {
  return dateStr(new Date());
}

// Load daily visit map: { "2026-05-25": Set(["topic1", "topic2"]) }
export function loadDailyVisits() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return {};
    const raw = JSON.parse(saved);
    const result = {};
    for (const [k, v] of Object.entries(raw)) {
      result[k] = new Set(v);
    }
    return result;
  } catch {
    return {};
  }
}

// Save daily visit map
export function saveDailyVisits(visits) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeDailyVisits(visits)));
}

// Serialize dailyVisits for JSON export (Sets → arrays)
export function serializeDailyVisits(visits) {
  const raw = {};
  for (const [k, v] of Object.entries(visits)) {
    raw[k] = v instanceof Set ? [...v] : Array.isArray(v) ? v : [];
  }
  return raw;
}

// Deserialize dailyVisits from JSON import (arrays → Sets)
export function deserializeDailyVisits(raw) {
  if (!raw || typeof raw !== 'object') return {};
  const result = {};
  for (const [k, v] of Object.entries(raw)) {
    result[k] = new Set(Array.isArray(v) ? v : []);
  }
  return result;
}

// Record a visit for today (immutable — never mutates previous state)
export function recordVisit(visits, topicId) {
  const d = today();
  const prev = visits[d] || new Set();
  const next = new Set(prev);
  next.add(topicId);
  return { ...visits, [d]: next };
}

// Calculate current streak (consecutive days ending today or yesterday)
export function calcStreak(visits) {
  let streak = 0;
  const d = new Date();

  // Check if today has visits; if not, start from yesterday
  if (!visits[today()] || visits[today()].size === 0) {
    d.setDate(d.getDate() - 1);
  }

  while (true) {
    const key = dateStr(d);
    if (visits[key] && visits[key].size > 0) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

// Calculate best streak ever
export function calcBestStreak(visits) {
  const days = Object.keys(visits)
    .filter(d => visits[d] && visits[d].size > 0)
    .sort();

  if (days.length === 0) return 0;

  let best = 1;
  let current = 1;

  for (let i = 1; i < days.length; i++) {
    // Compare date strings to avoid DST issues with millisecond math
    const prev = new Date(days[i - 1] + 'T00:00:00');
    const curr = new Date(days[i] + 'T00:00:00');
    const diffDays = Math.round((curr - prev) / 86400000);
    if (diffDays === 1) {
      current++;
      best = Math.max(best, current);
    } else {
      current = 1;
    }
  }
  return best;
}

// Get today's visit count
export function getTodayCount(visits) {
  return (visits[today()] || new Set()).size;
}

// Load daily goal (default 3)
export function loadDailyGoal() {
  try {
    const saved = localStorage.getItem(GOAL_KEY);
    return saved ? parseInt(saved, 10) : 3;
  } catch {
    return 3;
  }
}

// Save daily goal
export function saveDailyGoal(goal) {
  localStorage.setItem(GOAL_KEY, String(goal));
}

// Get last 7 days data for heatmap
export function getLast7Days(visits) {
  const result = [];
  const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = dateStr(d);
    const count = (visits[key] || new Set()).size;
    result.push({
      date: key,
      dayName: dayNames[d.getDay()],
      dayNum: d.getDate(),
      count,
      isToday: i === 0,
    });
  }
  return result;
}

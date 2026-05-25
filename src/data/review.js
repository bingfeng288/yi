// Spaced repetition review tracking
// Data: { "topicId": { firstVisit: timestamp, lastVisit: timestamp, visitCount: number } }

const STORAGE_KEY = 'yi-review';

// Review intervals in days based on visit count
const INTERVALS = [1, 3, 7, 14, 30];

// Minimum gap (4 hours) between visits for visitCount to increment
// Prevents casual browsing from inflating spaced repetition intervals
const REVIEW_GAP_MS = 4 * 60 * 60 * 1000;

function getInterval(visitCount) {
  const idx = Math.min(visitCount - 1, INTERVALS.length - 1);
  return INTERVALS[Math.max(0, idx)];
}

export function loadReviewData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

export function saveReviewData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Migrate: seed review data for topics visited before the review system existed.
// Returns updated reviewData if any topics were seeded, or the original data unchanged.
export function migrateReviewData(reviewData, visited) {
  let changed = false;
  const now = Date.now();
  const updated = { ...reviewData };
  for (const topicId of visited) {
    if (!updated[topicId]) {
      updated[topicId] = { firstVisit: now, lastVisit: now, visitCount: 1 };
      changed = true;
    }
  }
  return changed ? updated : reviewData;
}

// Record a visit to a topic (called on handleSelectNode)
// Only increments visitCount if enough time has passed since the last visit,
// preventing casual browsing from inflating spaced repetition intervals.
export function recordReviewVisit(data, topicId) {
  const now = Date.now();
  const existing = data[topicId];
  if (!existing) {
    return { ...data, [topicId]: { firstVisit: now, lastVisit: now, visitCount: 1 } };
  }
  const timeSinceLastVisit = now - existing.lastVisit;
  const shouldCount = timeSinceLastVisit >= REVIEW_GAP_MS;
  return {
    ...data,
    [topicId]: {
      ...existing,
      lastVisit: now,
      visitCount: shouldCount ? existing.visitCount + 1 : existing.visitCount,
    },
  };
}

// Get topics that are due for review
export function getReviewDue(reviewData, visited) {
  const now = Date.now();
  const due = [];
  for (const topicId of visited) {
    const entry = reviewData[topicId];
    if (!entry) continue;
    const interval = getInterval(entry.visitCount);
    const dueDate = entry.lastVisit + interval * 86400000;
    if (now >= dueDate) {
      const overdueDays = Math.floor((now - dueDate) / 86400000);
      due.push({ topicId, overdueDays, visitCount: entry.visitCount, lastVisit: entry.lastVisit });
    }
  }
  due.sort((a, b) => b.overdueDays - a.overdueDays);
  return due;
}

// Get review stats
export function getReviewStats(reviewData, visited) {
  const now = Date.now();
  let dueCount = 0;
  let reviewed = 0;
  for (const topicId of visited) {
    const entry = reviewData[topicId];
    if (!entry) continue;
    reviewed++;
    const interval = getInterval(entry.visitCount);
    const dueDate = entry.lastVisit + interval * 86400000;
    if (now >= dueDate) dueCount++;
  }
  return { dueCount, reviewed, total: visited.size };
}

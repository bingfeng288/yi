// Mastery tracking — distinguishes "visited" from "truly understood"
const STORAGE_KEY = 'yi-mastered';

export function loadMastered() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? new Set(JSON.parse(saved)) : new Set();
  } catch { return new Set(); }
}

export function saveMastered(mastered) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...mastered]));
  } catch {}
}

export function toggleMastered(mastered, topicId) {
  const next = new Set(mastered);
  if (next.has(topicId)) {
    next.delete(topicId);
  } else {
    next.add(topicId);
  }
  return next;
}

// Stats helpers
export function getMasteryStats(tree, mastered) {
  let total = 0;
  let masteredCount = 0;
  const domainStats = {};

  for (const domain of tree) {
    let dTotal = 0;
    let dMastered = 0;
    for (const topic of domain.children) {
      total++;
      dTotal++;
      if (mastered.has(topic.id)) {
        masteredCount++;
        dMastered++;
      }
    }
    domainStats[domain.id] = { total: dTotal, mastered: dMastered };
  }

  return { total, mastered: masteredCount, domainStats };
}

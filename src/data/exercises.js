// Exercise progress tracking
// Data structure: { "topicId": { completed: [0, 2], thoughts: { "0": "my answer...", "2": "..." } } }

const STORAGE_KEY = 'yi-exercises';

export function loadExerciseProgress() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

export function saveExerciseProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

// Toggle exercise completion
export function toggleExercise(progress, topicId, exerciseIndex) {
  const topic = progress[topicId] || { completed: [], thoughts: {} };
  const completed = new Set(topic.completed);
  if (completed.has(exerciseIndex)) {
    completed.delete(exerciseIndex);
  } else {
    completed.add(exerciseIndex);
  }
  return {
    ...progress,
    [topicId]: { ...topic, completed: [...completed].sort() },
  };
}

// Save thought for an exercise
export function saveThought(progress, topicId, exerciseIndex, text) {
  const topic = progress[topicId] || { completed: [], thoughts: {} };
  return {
    ...progress,
    [topicId]: {
      ...topic,
      thoughts: { ...topic.thoughts, [exerciseIndex]: text },
    },
  };
}

// Get completion stats for a topic
export function getTopicExerciseStats(progress, topicId, totalExercises) {
  const topic = progress[topicId];
  if (!topic) return { done: 0, total: totalExercises, pct: 0 };
  const done = topic.completed.length;
  return {
    done,
    total: totalExercises,
    pct: totalExercises > 0 ? Math.round((done / totalExercises) * 100) : 0,
  };
}

// Get total exercise completion across all topics
export function getTotalExerciseStats(progress, topicMap) {
  let totalDone = 0;
  let totalExercises = 0;
  let topicsWithProgress = 0;

  for (const [topicId, data] of Object.entries(progress)) {
    const topic = topicMap[topicId];
    if (!topic) continue;
    const count = topic.exercises?.length || 0;
    if (count === 0) continue;
    totalExercises += count;
    totalDone += data.completed.length;
    if (data.completed.length > 0) topicsWithProgress++;
  }

  return { totalDone, totalExercises, topicsWithProgress };
}

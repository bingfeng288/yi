import { knowledgeTree } from '../data/knowledgeTree';

// Build a lookup map: topicId -> { ...topic, domain }
export function buildTopicMap() {
  const map = {};
  for (const domain of knowledgeTree) {
    for (const topic of domain.children) {
      map[topic.id] = { ...topic, domain };
    }
  }
  return map;
}

// Learning path recommendations based on completed topics
// Each entry defines prerequisites and suggested next topics

export const prerequisites = {
  // Math paths
  'math-algebra': ['math-arithmetic'],
  'math-geometry': ['math-arithmetic'],
  'math-calculus': ['math-algebra'],
  'math-linalg': ['math-algebra'],
  'math-probability': ['math-algebra'],
  'math-discrete': ['math-algebra'],
  'math-topology': ['math-geometry', 'math-calculus'],

  // Physics paths
  'physics-mechanics': ['math-calculus'],
  'physics-thermo': ['physics-mechanics'],
  'physics-em': ['math-calculus'],
  'physics-optics': ['physics-em'],
  'physics-quantum': ['physics-mechanics', 'math-linalg'],
  'physics-relativity': ['physics-mechanics', 'math-calculus'],
  'physics-particle': ['physics-quantum'],

  // Chemistry paths
  'chem-atomic': ['math-arithmetic'],
  'chem-reaction': ['chem-atomic'],
  'chem-organic': ['chem-reaction'],
  'chem-thermo': ['chem-reaction', 'physics-thermo'],

  // Biology paths
  'bio-cell': ['chem-organic'],
  'bio-genetics': ['bio-cell'],
  'bio-evolution': ['bio-cell'],
  'bio-ecology': ['bio-evolution'],
  'bio-neuro': ['bio-cell'],

  // CS paths
  'cs-programming': ['math-arithmetic'],
  'cs-algorithm': ['cs-programming', 'math-discrete'],
  'cs-os': ['cs-programming'],
  'cs-network': ['cs-programming'],
  'cs-db': ['cs-programming'],
  'cs-ai': ['cs-algorithm', 'math-linalg', 'math-probability'],

  // Economics paths
  'econ-micro': ['math-algebra'],
  'econ-macro': ['econ-micro'],
  'econ-behavioral': ['econ-micro'],
  'econ-development': ['econ-macro'],
  'econ-international': ['econ-macro'],
  'econ-history': ['econ-micro'],
  'econ-econometrics': ['econ-macro', 'math-probability'],

  // Finance paths
  'fin-money': ['econ-macro'],
  'fin-invest': ['fin-money', 'math-probability'],
  'fin-corporate': ['fin-money'],
  'fin-risk': ['fin-invest', 'math-probability'],
  'fin-market': ['fin-money'],
  'fin-behavioral': ['fin-invest', 'econ-behavioral'],
  'fin-fintech': ['fin-money', 'cs-network'],

  // Medicine paths
  'med-anatomy': ['bio-cell'],
  'med-physiology': ['med-anatomy'],
  'med-pathology': ['med-physiology'],
  'med-pharmacology': ['med-pathology', 'chem-organic'],
  'med-preventive': ['med-physiology'],

  // Law paths
  'law-jurisprudence': ['phil-ethics'],
  'law-constitutional': ['law-jurisprudence'],
  'law-criminal': ['law-jurisprudence'],
  'law-civil': ['law-jurisprudence'],
  'law-international': ['law-jurisprudence', 'pol-ir'],
  'law-history': ['law-jurisprudence'],
  'law-society': ['law-jurisprudence'],

  // Military paths
  'mil-strategy': ['pol-ir', 'hist-modern'],
  'mil-tactics': ['mil-strategy'],
  'mil-technology': ['mil-strategy'],
  'mil-history': ['hist-modern'],
  'mil-security': ['mil-strategy'],
  'mil-thought': ['mil-strategy'],

  // Political paths
  'pol-theory': ['phil-ethics'],
  'pol-comparative': ['pol-theory'],
  'pol-ir': ['pol-theory'],
  'pol-policy': ['pol-comparative'],
  'pol-chinese': ['pol-comparative'],
  'pol-philosophy': ['pol-theory', 'phil-ethics'],

  // Agriculture paths
  'agri-crop': ['bio-genetics'],
  'agri-soil': ['chem-atomic'],
  'agri-ecology': ['agri-crop', 'bio-ecology'],
  'agri-horticulture': ['agri-crop'],
  'agri-animal': ['bio-cell'],
  'agri-engineering': ['agri-crop'],
  'agri-food': ['agri-crop', 'chem-organic'],

  // Philosophy paths
  'phil-epistemology': ['phil-logic'],
  'phil-ethics': ['phil-logic'],
  'phil-applied-ethics': ['phil-ethics'],
  'phil-science': ['phil-epistemology'],

  // Linguistics paths
  'ling-grammar': ['ling-phonetics'],
  'ling-semantics': ['ling-grammar'],
  'ling-historical': ['ling-grammar'],
  'ling-typology': ['ling-grammar'],
  'ling-socioling': ['ling-grammar'],
  'ling-formal': ['ling-grammar', 'math-discrete'],
  'ling-cognitive': ['ling-semantics'],
  'ling-computational': ['ling-formal', 'cs-ai'],
  'ling-philosophy': ['ling-semantics', 'phil-epistemology'],

  // Arts paths
  'arts-visual': [],
  'arts-music': [],
  'arts-dance': [],
  'arts-calligraphy': [],
  'arts-literature': ['ling-semantics'],
  'arts-aesthetics': ['phil-ethics'],
  'arts-drama': ['arts-literature'],
  'arts-art-history': ['arts-visual'],
  'arts-creative': [],

  // History paths
  'hist-chinese': [],
  'hist-ancient': [],
  'hist-modern': ['hist-ancient'],
  'hist-world': ['hist-ancient'],
  'hist-methods': ['hist-ancient'],
  'hist-philosophy': ['hist-methods', 'phil-epistemology'],

  // Methods paths
  'method-critical': [],
  'method-scientific': ['method-critical'],
  'method-systems': ['method-scientific'],
  'method-learning': ['method-critical'],
};

// Get recommended next topics based on visited set
export function getRecommendations(visited, topicMap) {
  const visitedIds = new Set(visited);
  const candidates = [];
  const includeEntryLevel = visitedIds.size < 3; // show entry points for new users

  for (const [topicId, prereqs] of Object.entries(prerequisites)) {
    if (visitedIds.has(topicId)) continue;
    // For new users, include entry-level topics; for experienced users, skip them
    if (prereqs.length === 0 && !includeEntryLevel) continue;
    // Check if all prerequisites are met
    const allMet = prereqs.every(p => visitedIds.has(p));
    if (allMet) {
      const topic = topicMap[topicId];
      if (topic) {
        candidates.push({
          ...topic,
          reason: prereqs.length > 0
            ? `已学完前置知识：${prereqs.map(p => topicMap[p]?.name || p).join('、')}`
            : '推荐入门',
        });
      }
    }
  }

  // Sort by level (lower first)
  candidates.sort((a, b) => (a.level || 0) - (b.level || 0));
  return candidates.slice(0, 6);
}

// Get entry points (topics with no prerequisites)
export function getEntryPoints() {
  return Object.entries(prerequisites)
    .filter(([, prereqs]) => prereqs.length === 0)
    .map(([id]) => id);
}

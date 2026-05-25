// Cross-references between topics across domains
// Key: topic ID, Value: array of related topic IDs with connection description

export const crossReferences = {
  // Math → Physics/CS/Economics
  'math-calculus': [
    { id: 'physics-mechanics', label: '微积分是经典力学的数学语言' },
    { id: 'physics-thermo', label: '热力学用微分方程描述状态变化' },
    { id: 'cs-algorithm', label: '算法复杂度分析用到极限概念' },
  ],
  'math-probability': [
    { id: 'physics-quantum', label: '量子力学本质上是概率理论' },
    { id: 'econ-econometrics', label: '计量经济学建立在概率统计之上' },
    { id: 'fin-risk', label: '金融风险管理依赖概率模型' },
  ],
  'math-linalg': [
    { id: 'cs-ai', label: '神经网络的核心运算是矩阵乘法' },
    { id: 'physics-quantum', label: '量子态用向量表示，算符用矩阵表示' },
  ],
  'math-discrete': [
    { id: 'cs-algorithm', label: '图论和组合数学是算法的数学基础' },
    { id: 'cs-network', label: '网络拓扑是图论的应用' },
  ],

  // Physics → Engineering/Chemistry
  'physics-mechanics': [
    { id: 'eng-mechanical', label: '机械工程直接应用经典力学' },
    { id: 'arts-dance', label: '舞蹈动作遵循力学规律' },
  ],
  'physics-em': [
    { id: 'eng-electrical', label: '电气工程建立在电磁学之上' },
    { id: 'cs-network', label: '通信网络依赖电磁波传播' },
  ],
  'physics-quantum': [
    { id: 'chem-atomic', label: '量子力学解释原子结构和化学键' },
    { id: 'cs-ai', label: '量子计算是AI的潜在加速器' },
  ],
  'physics-thermo': [
    { id: 'chem-thermo', label: '物理化学直接应用热力学定律' },
    { id: 'eng-mechanical', label: '热机效率受热力学第二定律限制' },
  ],

  // Chemistry → Biology/Medicine
  'chem-organic': [
    { id: 'bio-cell', label: '生物大分子都是有机化合物' },
    { id: 'med-pharmacology', label: '药物设计基于有机化学' },
    { id: 'agri-food', label: '食品中的营养成分是有机分子' },
  ],
  'chem-atomic': [
    { id: 'physics-quantum', label: '原子结构由量子力学描述' },
  ],

  // Biology → Medicine/Agriculture
  'bio-genetics': [
    { id: 'med-pathology', label: '遗传病的分子机制' },
    { id: 'agri-crop', label: '作物育种的遗传学基础' },
    { id: 'phil-applied-ethics', label: '基因编辑引发伦理争议' },
  ],
  'bio-evolution': [
    { id: 'cs-ai', label: '遗传算法模仿自然选择' },
    { id: 'bio-ecology', label: '进化塑造了生态系统的结构' },
  ],
  'bio-neuro': [
    { id: 'cs-ai', label: '神经网络受大脑结构启发' },
    { id: 'arts-music', label: '音乐如何影响大脑和情感' },
  ],

  // Computer Science
  'cs-algorithm': [
    { id: 'math-discrete', label: '算法的数学基础' },
    { id: 'cs-ai', label: '机器学习算法是算法学的前沿' },
  ],
  'cs-ai': [
    { id: 'math-linalg', label: '深度学习依赖线性代数' },
    { id: 'bio-neuro', label: '神经网络模仿大脑结构' },
    { id: 'phil-applied-ethics', label: 'AI伦理：偏见、隐私、自主武器' },
    { id: 'ling-computational', label: 'NLP是AI的核心应用领域' },
  ],

  // Philosophy connections
  'phil-logic': [
    { id: 'cs-programming', label: '布尔逻辑是编程的基础' },
    { id: 'math-discrete', label: '数理逻辑是数学和哲学的交叉' },
  ],
  'phil-ethics': [
    { id: 'med-preventive', label: '公共卫生决策涉及伦理权衡' },
    { id: 'pol-theory', label: '政治哲学与伦理学紧密相关' },
    { id: 'law-jurisprudence', label: '法理学的根基在伦理学' },
  ],
  'phil-applied-ethics': [
    { id: 'cs-ai', label: 'AI伦理是最紧迫的应用伦理问题' },
    { id: 'bio-genetics', label: '基因编辑的伦理边界' },
    { id: 'mil-technology', label: '自主武器的伦理争议' },
  ],

  // Economics/Finance connections
  'econ-micro': [
    { id: 'math-probability', label: '不确定性下的决策用概率论建模' },
    { id: 'fin-invest', label: '资产定价理论建立在微观经济学之上' },
  ],
  'econ-macro': [
    { id: 'fin-money', label: '货币政策是宏观经济学的核心工具' },
    { id: 'pol-policy', label: '财政政策是政治和经济的交汇点' },
  ],
  'econ-behavioral': [
    { id: 'fin-behavioral', label: '行为金融学是行为经济学的分支' },
    { id: 'bio-neuro', label: '决策的神经科学基础' },
  ],

  // Finance connections
  'fin-money': [
    { id: 'econ-macro', label: '货币银行学是宏观经济学的支柱' },
    { id: 'law-civil', label: '金融活动受民法和商法约束' },
  ],
  'fin-risk': [
    { id: 'math-probability', label: '风险定价建立在概率论之上' },
    { id: 'econ-micro', label: '风险偏好是微观经济学的核心概念' },
  ],
  'fin-fintech': [
    { id: 'cs-network', label: '区块链依赖分布式网络' },
    { id: 'law-society', label: '金融科技带来法律监管挑战' },
  ],

  // Language connections
  'ling-formal': [
    { id: 'cs-programming', label: '形式语言理论催生了编译原理' },
    { id: 'math-discrete', label: '自动机理论是离散数学的分支' },
  ],
  'ling-computational': [
    { id: 'cs-ai', label: 'NLP是人工智能的核心应用' },
    { id: 'ling-cognitive', label: '计算模型验证认知语言学假说' },
  ],

  // History connections
  'hist-modern': [
    { id: 'econ-history', label: '工业革命同时改变了历史和经济' },
    { id: 'pol-ir', label: '现代国际关系格局在两次大战后形成' },
    { id: 'mil-history', label: '战争是近现代史的核心驱动力' },
  ],

  // Law connections
  'law-constitutional': [
    { id: 'pol-theory', label: '宪法学的根基在政治哲学' },
    { id: 'pol-comparative', label: '不同国家的宪法反映不同的政治理念' },
  ],
  'law-society': [
    { id: 'cs-ai', label: 'AI带来数据隐私和算法监管的法律挑战' },
    { id: 'econ-micro', label: '法律经济学用效率分析法律规则' },
  ],

  // Military connections
  'mil-strategy': [
    { id: 'pol-ir', label: '军事战略服从于国际关系格局' },
    { id: 'hist-modern', label: '战略思想在战争历史中形成' },
  ],
  'mil-technology': [
    { id: 'cs-network', label: '信息化战争依赖网络技术' },
    { id: 'phil-applied-ethics', label: '自主武器的伦理问题' },
  ],

  // Arts connections
  'arts-music': [
    { id: 'math-arithmetic', label: '音程的频率比是数学关系' },
    { id: 'bio-neuro', label: '音乐如何影响大脑和情感' },
  ],
  'arts-visual': [
    { id: 'physics-optics', label: '色彩理论建立在光学之上' },
    { id: 'math-geometry', label: '透视法建立在几何学之上' },
  ],

  // Agriculture connections
  'agri-crop': [
    { id: 'bio-genetics', label: '作物育种的遗传学基础' },
    { id: 'bio-ecology', label: '农业生态系统的平衡' },
  ],
  'agri-food': [
    { id: 'chem-organic', label: '食品中的有机化学' },
    { id: 'med-preventive', label: '营养与公共卫生' },
  ],
};

// Build reverse index once
const reverseIndex = {};
for (const [from, refs] of Object.entries(crossReferences)) {
  for (const ref of refs) {
    if (!reverseIndex[ref.id]) reverseIndex[ref.id] = [];
    reverseIndex[ref.id].push({ id: from, label: ref.label });
  }
}

// Get cross-references for a topic (bidirectional)
export function getRelatedTopics(topicId) {
  const outgoing = crossReferences[topicId] || [];
  const incoming = reverseIndex[topicId] || [];
  // Deduplicate by id, prefer outgoing label
  const seen = new Set();
  const result = [];
  for (const ref of [...outgoing, ...incoming]) {
    if (!seen.has(ref.id)) {
      seen.add(ref.id);
      result.push(ref);
    }
  }
  return result;
}

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

  // === 新增：补齐 56 个无关联专题 ===

  // Math
  'math-algebra': [
    { id: 'physics-mechanics', label: '方程是力学建模的语言' },
    { id: 'cs-algorithm', label: '抽象代数是密码学的基础' },
    { id: 'econ-micro', label: '优化问题依赖代数方法' },
  ],
  'math-topology': [
    { id: 'physics-relativity', label: '时空拓扑是广义相对论的核心' },
    { id: 'cs-ai', label: '拓扑数据分析用于机器学习' },
  ],

  // Physics
  'physics-relativity': [
    { id: 'physics-quantum', label: '量子引力统一两大理论' },
    { id: 'earth-astronomy', label: '相对论修正GPS卫星时钟' },
    { id: 'phil-epistemology', label: '相对论颠覆了绝对时空观' },
  ],
  'physics-particle': [
    { id: 'chem-atomic', label: '粒子物理解释原子核结构' },
    { id: 'physics-quantum', label: '标准模型建立在量子场论之上' },
  ],

  // Chemistry
  'chem-reaction': [
    { id: 'bio-cell', label: '酶催化是生化反应的核心' },
    { id: 'med-pharmacology', label: '药物代谢依赖化学反应' },
    { id: 'eng-materials', label: '材料合成依赖化学反应' },
  ],

  // Medicine
  'med-anatomy': [
    { id: 'bio-cell', label: '组织由细胞构成' },
    { id: 'arts-visual', label: '解剖学推动了写实绘画' },
    { id: 'eng-mechanical', label: '生物力学借鉴骨骼结构' },
  ],
  'med-physiology': [
    { id: 'physics-mechanics', label: '血流动力学遵循流体力学' },
    { id: 'physics-thermo', label: '体温调节受热力学约束' },
    { id: 'bio-neuro', label: '神经调节是生理学核心' },
  ],

  // Earth science (entire domain)
  'earth-geology': [
    { id: 'chem-atomic', label: '矿物学建立在原子结构之上' },
    { id: 'physics-mechanics', label: '板块构造是力学过程' },
    { id: 'agri-soil', label: '地质是土壤形成的母岩基础' },
  ],
  'earth-atmosphere': [
    { id: 'physics-thermo', label: '大气热力学驱动天气系统' },
    { id: 'earth-ocean', label: '海气相互作用驱动气候' },
    { id: 'agri-crop', label: '气候决定农业种植制度' },
  ],
  'earth-ocean': [
    { id: 'physics-mechanics', label: '洋流遵循流体力学方程' },
    { id: 'earth-atmosphere', label: '海洋是气候系统的热量库' },
    { id: 'bio-ecology', label: '海洋是最大的生态系统' },
  ],
  'earth-astronomy': [
    { id: 'physics-relativity', label: '宇宙学建立在广义相对论之上' },
    { id: 'math-calculus', label: '轨道力学用微分方程描述' },
    { id: 'phil-epistemology', label: '天文观测改变了宇宙观' },
  ],

  // Engineering (entire domain)
  'eng-materials': [
    { id: 'chem-atomic', label: '材料性能由原子键决定' },
    { id: 'physics-mechanics', label: '材料强度受力学规律约束' },
    { id: 'eng-civil', label: '建筑材料决定结构设计' },
  ],
  'eng-electrical': [
    { id: 'physics-em', label: '电路理论建立在电磁学之上' },
    { id: 'cs-programming', label: '嵌入式系统需要编程' },
    { id: 'cs-network', label: '通信网络依赖电气工程' },
  ],
  'eng-mechanical': [
    { id: 'physics-mechanics', label: '机械设计直接应用经典力学' },
    { id: 'physics-thermo', label: '热机效率受热力学限制' },
    { id: 'agri-engineering', label: '农业机械化依赖机械工程' },
  ],
  'eng-civil': [
    { id: 'physics-mechanics', label: '结构力学是土木工程基础' },
    { id: 'math-geometry', label: '建筑设计依赖几何学' },
    { id: 'earth-geology', label: '地基设计需要地质知识' },
  ],

  // CS
  'cs-os': [
    { id: 'cs-programming', label: '操作系统是系统编程的巅峰' },
    { id: 'cs-network', label: '网络协议栈实现在OS中' },
    { id: 'cs-algorithm', label: '调度算法是OS核心' },
  ],
  'cs-db': [
    { id: 'cs-programming', label: '数据库需要编程接口' },
    { id: 'math-discrete', label: '关系代数是SQL的理论基础' },
    { id: 'cs-ai', label: '知识图谱存储在图数据库中' },
  ],

  // Philosophy
  'phil-epistemology': [
    { id: 'phil-logic', label: '认识论依赖逻辑推理' },
    { id: 'cs-ai', label: '知识表示是AI的核心问题' },
    { id: 'method-scientific', label: '科学方法论建立在认识论之上' },
  ],
  'phil-science': [
    { id: 'method-scientific', label: '科学哲学为科学方法奠基' },
    { id: 'physics-quantum', label: '量子诠释是科学哲学的前沿' },
    { id: 'phil-epistemology', label: '科学知识的可靠性问题' },
  ],

  // Methods (entire domain)
  'method-critical': [
    { id: 'phil-logic', label: '批判性思维以逻辑为工具' },
    { id: 'method-scientific', label: '批判思维是科学方法的前提' },
  ],
  'method-scientific': [
    { id: 'physics-mechanics', label: '经典力学是科学方法的典范' },
    { id: 'phil-epistemology', label: '科学方法论建立在认识论之上' },
  ],
  'method-systems': [
    { id: 'bio-ecology', label: '生态系统是系统思维的经典案例' },
    { id: 'cs-ai', label: '复杂系统与涌现行为' },
    { id: 'econ-macro', label: '经济系统是非线性复杂系统' },
  ],
  'method-learning': [
    { id: 'ling-cognitive', label: '学习理论借鉴认知科学' },
    { id: 'bio-neuro', label: '学习的神经科学基础' },
  ],

  // Linguistics
  'ling-phonetics': [
    { id: 'bio-neuro', label: '语音感知的神经机制' },
    { id: 'physics-em', label: '语音是声波，遵循波动方程' },
  ],
  'ling-grammar': [
    { id: 'math-discrete', label: '形式语法是离散数学分支' },
    { id: 'phil-logic', label: '语法结构映射逻辑结构' },
  ],
  'ling-semantics': [
    { id: 'phil-epistemology', label: '意义理论与知识的关系' },
    { id: 'cs-ai', label: '语义理解是NLP的核心' },
  ],
  'ling-historical': [
    { id: 'hist-ancient', label: '语言演变记录文明变迁' },
    { id: 'ling-typology', label: '历时比较与类型学互补' },
  ],
  'ling-typology': [
    { id: 'ling-grammar', label: '类型学分类基于语法特征' },
    { id: 'ling-historical', label: '类型分布反映语言演化' },
  ],
  'ling-socioling': [
    { id: 'pol-theory', label: '语言政策是政治决策' },
    { id: 'econ-development', label: '语言能力影响经济发展' },
  ],
  'ling-philosophy': [
    { id: 'phil-epistemology', label: '语言哲学的核心是意义与真理' },
    { id: 'ling-semantics', label: '哲学语义学与语言学交叉' },
  ],

  // Arts
  'arts-calligraphy': [
    { id: 'arts-visual', label: '书法是线条的视觉艺术' },
    { id: 'math-geometry', label: '书法结构讲究空间比例' },
    { id: 'phil-ethics', label: '书如其人，书法与修身' },
  ],
  'arts-literature': [
    { id: 'ling-semantics', label: '文学是语言艺术的巅峰' },
    { id: 'hist-modern', label: '文学反映时代精神' },
    { id: 'phil-ethics', label: '文学探索人性与道德' },
  ],
  'arts-aesthetics': [
    { id: 'phil-ethics', label: '美学判断与价值判断相关' },
    { id: 'arts-visual', label: '美学理论指导艺术创作' },
    { id: 'bio-neuro', label: '审美体验的神经基础' },
  ],
  'arts-drama': [
    { id: 'arts-literature', label: '戏剧是文学的表演形式' },
    { id: 'arts-music', label: '歌剧融合音乐与戏剧' },
    { id: 'ling-semantics', label: '台词是语言的艺术表达' },
  ],
  'arts-art-history': [
    { id: 'arts-visual', label: '艺术史以视觉作品为载体' },
    { id: 'hist-ancient', label: '古代艺术是历史的视觉记录' },
    { id: 'phil-ethics', label: '艺术反映时代价值观' },
  ],
  'arts-creative': [
    { id: 'arts-visual', label: '创造力在视觉艺术中展现' },
    { id: 'bio-neuro', label: '创造力的神经机制' },
    { id: 'cs-ai', label: 'AI能否真正创造？' },
  ],

  // History
  'hist-ancient': [
    { id: 'phil-logic', label: '古希腊哲学奠定了逻辑学' },
    { id: 'econ-history', label: '古代经济制度影响至今' },
    { id: 'law-history', label: '古代法典是法律史源头' },
  ],
  'hist-chinese': [
    { id: 'pol-chinese', label: '中国政治制度的历史演变' },
    { id: 'phil-ethics', label: '儒家伦理塑造中国社会' },
    { id: 'arts-calligraphy', label: '书法是中华文明的标志' },
  ],
  'hist-world': [
    { id: 'hist-ancient', label: '世界史以古代文明为起点' },
    { id: 'econ-development', label: '全球发展格局的历史根源' },
    { id: 'pol-ir', label: '国际秩序在历史中形成' },
  ],
  'hist-methods': [
    { id: 'method-scientific', label: '历史学方法借鉴科学方法' },
    { id: 'phil-epistemology', label: '历史知识的可靠性问题' },
  ],
  'hist-philosophy': [
    { id: 'phil-epistemology', label: '历史哲学探讨历史知识的本质' },
    { id: 'hist-methods', label: '方法论决定历史解释' },
  ],

  // Economics
  'econ-development': [
    { id: 'econ-macro', label: '发展经济学是宏观经济学分支' },
    { id: 'pol-policy', label: '发展政策需要政治支持' },
    { id: 'agri-crop', label: '农业发展是经济发展的基础' },
  ],
  'econ-international': [
    { id: 'econ-macro', label: '国际贸易影响宏观经济' },
    { id: 'fin-market', label: '国际资本流动通过金融市场' },
    { id: 'pol-ir', label: '经济全球化重塑国际关系' },
  ],

  // Finance
  'fin-corporate': [
    { id: 'fin-money', label: '公司金融依赖银行体系' },
    { id: 'econ-micro', label: '企业理论是微观经济学的应用' },
    { id: 'law-civil', label: '公司治理受商法约束' },
  ],
  'fin-market': [
    { id: 'fin-money', label: '金融市场是货币流通的场所' },
    { id: 'econ-macro', label: '市场波动反映宏观经济' },
    { id: 'math-probability', label: '市场风险用概率模型度量' },
  ],

  // Agriculture
  'agri-soil': [
    { id: 'chem-atomic', label: '土壤肥力由化学元素决定' },
    { id: 'earth-geology', label: '土壤由岩石风化形成' },
    { id: 'bio-ecology', label: '土壤微生物是生态系统的分解者' },
  ],
  'agri-ecology': [
    { id: 'bio-ecology', label: '农业生态学是生态学的应用' },
    { id: 'agri-crop', label: '生态农业需要作物知识' },
    { id: 'earth-atmosphere', label: '气候变化影响农业生态' },
  ],
  'agri-horticulture': [
    { id: 'agri-crop', label: '园艺是作物栽培的精细化' },
    { id: 'bio-genetics', label: '花卉育种依赖遗传学' },
    { id: 'arts-visual', label: '园林设计是空间艺术' },
  ],
  'agri-animal': [
    { id: 'bio-cell', label: '动物生理以细胞生物学为基础' },
    { id: 'med-physiology', label: '动物生理与人体生理相通' },
    { id: 'bio-genetics', label: '动物育种依赖遗传学' },
  ],
  'agri-engineering': [
    { id: 'eng-mechanical', label: '农业机械化是机械工程应用' },
    { id: 'eng-civil', label: '农田水利是土木工程应用' },
    { id: 'cs-ai', label: '精准农业依赖人工智能' },
  ],

  // Political
  'pol-chinese': [
    { id: 'pol-comparative', label: '中国政治是比较政治学的重要案例' },
    { id: 'hist-chinese', label: '中国政治制度的历史根源' },
    { id: 'econ-development', label: '中国模式与经济发展' },
  ],
  'pol-philosophy': [
    { id: 'phil-ethics', label: '政治哲学的根基在伦理学' },
    { id: 'pol-theory', label: '政治理论以哲学为基础' },
    { id: 'law-jurisprudence', label: '法理学与政治哲学交叉' },
  ],

  // Military
  'mil-tactics': [
    { id: 'mil-strategy', label: '战术服从于战略' },
    { id: 'physics-mechanics', label: '弹道学和工事设计' },
    { id: 'cs-ai', label: 'AI辅助战术决策' },
  ],
  'mil-security': [
    { id: 'mil-strategy', label: '安全战略是军事战略的核心' },
    { id: 'pol-ir', label: '国家安全是国际关系的焦点' },
    { id: 'cs-network', label: '网络安全是现代安全的关键' },
  ],
  'mil-thought': [
    { id: 'mil-strategy', label: '军事思想指导战略制定' },
    { id: 'phil-ethics', label: '正义战争理论的伦理基础' },
    { id: 'hist-modern', label: '军事思想在近代战争中成型' },
  ],

  // Law
  'law-criminal': [
    { id: 'phil-ethics', label: '刑罚的伦理正当性' },
    { id: 'bio-neuro', label: '神经犯罪学：大脑与犯罪' },
    { id: 'med-psychology', label: '犯罪心理学' },
  ],
  'law-international': [
    { id: 'pol-ir', label: '国际法是国际关系的规则' },
    { id: 'law-constitutional', label: '国际法与宪法的互动' },
    { id: 'econ-international', label: '国际贸易法规范全球经济' },
  ],
  'law-history': [
    { id: 'hist-ancient', label: '古代法典是法律史的源头' },
    { id: 'law-jurisprudence', label: '法理学在历史中发展' },
    { id: 'pol-theory', label: '法律思想与政治哲学交织' },
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

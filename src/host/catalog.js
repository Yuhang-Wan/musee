/**
 * Curated journal and conference catalogue for Musee.
 * Source ids are OpenAlex `S...` identifiers resolved from each venue's ISSN or name.
 * Descriptions are original Musee scope notes, not publisher copy.
 */
export const VERSION = '0.4.0';

export const DISCIPLINES = [
  {
    id: 'urban',
    name: { en: 'Urban studies', zh: '城市研究', fr: 'Études urbaines' },
    blurb: {
      en: 'Cities, transport, built environment, sustainability',
      zh: '城市、交通、建成环境与可持续性',
      fr: 'Villes, transports, cadre bâti, durabilité',
    },
    arxiv: ['physics.soc-ph', 'econ.GN', 'cs.CY'],
  },
  {
    id: 'physics',
    name: { en: 'Physics', zh: '物理', fr: 'Physique' },
    blurb: {
      en: 'Condensed matter, high energy, quantum, astrophysics',
      zh: '凝聚态、高能、量子与天体物理',
      fr: 'Matière condensée, hautes énergies, quantique, astrophysique',
    },
    arxiv: ['hep-th', 'quant-ph', 'cond-mat.mtrl-sci', 'astro-ph.GA'],
  },
  {
    id: 'ai',
    name: { en: 'AI & robotics', zh: '人工智能与机器人', fr: 'IA et robotique' },
    blurb: {
      en: 'Machine learning, vision, robotics, embodied AI',
      zh: '机器学习、计算机视觉、机器人与具身智能',
      fr: 'Apprentissage, vision, robotique, IA incarnée',
    },
    arxiv: ['cs.AI', 'cs.RO', 'cs.LG', 'cs.CV', 'cs.CL'],
  },
];

export const JOURNALS = [
  {
    id: 'urban-studies', discipline: 'urban', name: 'Urban Studies', short: 'US', issn: '0042-0980', openalex: 'S50366009',
    nameZh: '城市研究', nameFr: 'Études urbaines',
    about: 'International journal for urban and regional research, covering housing, planning, governance, and urban inequality.',
    aboutZh: '国际城市与区域研究期刊，关注住房、规划、治理与城市不平等。',
    aboutFr: 'Revue internationale de recherche urbaine et régionale : logement, planification, gouvernance et inégalités urbaines.',
  },
  {
    id: 'cities', discipline: 'urban', name: 'Cities', short: 'CIT', issn: '0264-2751', openalex: 'S137445289',
    nameZh: '城市', nameFr: 'Cities',
    about: 'Applied research on urban policy, planning, and the governance of cities worldwide.',
    aboutZh: '面向全球城市政策、规划与治理的应用研究期刊。',
    aboutFr: 'Recherche appliquée sur les politiques urbaines, la planification et la gouvernance des villes.',
  },
  {
    id: 'landscape-urban-planning', discipline: 'urban', name: 'Landscape and Urban Planning', short: 'LUP', issn: '0169-2046', openalex: 'S104597489',
    nameZh: '景观与城市规划', nameFr: 'Paysage et planification urbaine',
    about: 'Landscape ecology, green infrastructure, and design-led planning of urban regions.',
    aboutZh: '景观生态、绿色基础设施与城市区域的设计驱动规划。',
    aboutFr: 'Écologie du paysage, infrastructures vertes et planification des territoires urbains.',
  },
  {
    id: 'ceus', discipline: 'urban', name: 'Computers, Environment and Urban Systems', short: 'CEUS', issn: '0198-9715', openalex: 'S60115552',
    nameZh: '计算机、环境与城市系统', nameFr: 'Informatique, environnement et systèmes urbains',
    about: 'Computational and quantitative methods for understanding urban systems and their dynamics.',
    aboutZh: '用计算与定量方法理解城市系统及其动态。',
    aboutFr: 'Méthodes informatiques et quantitatives pour comprendre les systèmes urbains.',
  },
  {
    id: 'sustainable-cities', discipline: 'urban', name: 'Sustainable Cities and Society', short: 'SCS', issn: '2210-6707', openalex: 'S163634330',
    nameZh: '可持续城市与社会', nameFr: 'Villes et sociétés durables',
    about: 'Urban sustainability, energy, climate adaptation, and resilient city systems.',
    aboutZh: '城市可持续性、能源、气候适应与韧性城市系统。',
    aboutFr: 'Durabilité urbaine, énergie, adaptation climatique et résilience des villes.',
  },
  {
    id: 'transport-geography', discipline: 'urban', name: 'Journal of Transport Geography', short: 'JTG', issn: '0966-6923', openalex: 'S80150607',
    nameZh: '交通地理杂志', nameFr: 'Revue de géographie des transports',
    about: 'Transport, mobility, accessibility, and the spatial organization of travel.',
    aboutZh: '交通、出行、可达性与旅行空间组织。',
    aboutFr: 'Transports, mobilité, accessibilité et organisation spatiale des déplacements.',
  },
  {
    id: 'epa', discipline: 'urban', name: 'Environment and Planning A: Economy and Space', short: 'EPA', issn: '0308-518X', openalex: 'S87933477',
    nameZh: '环境与规划 A：经济与空间', nameFr: 'Environnement et planification A : économie et espace',
    about: 'Urban and regional political economy, geography, and spatial analysis.',
    aboutZh: '城市与区域政治经济学、地理学与空间分析。',
    aboutFr: 'Économie politique urbaine et régionale, géographie et analyse spatiale.',
  },
  {
    id: 'habitat-international', discipline: 'urban', name: 'Habitat International', short: 'HAB', issn: '0197-3975', openalex: 'S4210229294',
    nameZh: '国际人居', nameFr: 'Habitat international',
    about: 'Housing, human settlements, and urban development, with a focus on the Global South.',
    aboutZh: '住房、人类住区与城市发展，重点关注全球南方。',
    aboutFr: 'Logement, établissements humains et développement urbain, avec un accent sur les pays du Sud.',
  },
  {
    id: 'ufug', discipline: 'urban', name: 'Urban Forestry & Urban Greening', short: 'UFUG', issn: '1618-8667', openalex: 'S99909709',
    nameZh: '城市林业与城市绿化', nameFr: 'Foresterie urbaine et verdissement urbain',
    about: 'Urban forestry, green space, and the ecosystem services of urban vegetation.',
    aboutZh: '城市林业、绿地与城市植被的生态系统服务。',
    aboutFr: 'Forêt urbaine, espaces verts et services écosystémiques de la végétation urbaine.',
  },
  {
    id: 'travel-behaviour', discipline: 'urban', name: 'Travel Behaviour and Society', short: 'TBS', issn: '2214-367X', openalex: 'S2764874763',
    nameZh: '出行行为与社会', nameFr: 'Comportements de déplacement et société',
    about: 'Travel behaviour, everyday mobility, and the social dimensions of transport.',
    aboutZh: '出行行为、日常流动与交通的社会维度。',
    aboutFr: 'Comportements de déplacement, mobilité quotidienne et dimensions sociales des transports.',
  },

  {
    id: 'prl', discipline: 'physics', name: 'Physical Review Letters', short: 'PRL', issn: '0031-9007', openalex: 'S24807848',
    nameZh: '物理评论快报', nameFr: 'Physical Review Letters',
    about: 'Broad, high-impact letters across all areas of physics.',
    aboutZh: '覆盖物理学各领域的高影响力快报。',
    aboutFr: 'Lettres à fort impact couvrant tous les domaines de la physique.',
  },
  {
    id: 'prb', discipline: 'physics', name: 'Physical Review B', short: 'PRB', issn: '2469-9950', openalex: 'S4210237713',
    nameZh: '物理评论 B', nameFr: 'Physical Review B',
    about: 'Condensed matter and materials physics, from theory to experiment.',
    aboutZh: '凝聚态与材料物理，涵盖理论与实验。',
    aboutFr: 'Physique de la matière condensée et des matériaux, de la théorie à l’expérience.',
  },
  {
    id: 'prd', discipline: 'physics', name: 'Physical Review D', short: 'PRD', issn: '2470-0010', openalex: 'S4210238307',
    nameZh: '物理评论 D', nameFr: 'Physical Review D',
    about: 'Particles, fields, gravitation, and cosmology.',
    aboutZh: '粒子、场、引力与宇宙学。',
    aboutFr: 'Particules, champs, gravitation et cosmologie.',
  },
  {
    id: 'nature-physics', discipline: 'physics', name: 'Nature Physics', short: 'NP', issn: '1745-2473', openalex: 'S156274416',
    nameZh: '自然·物理', nameFr: 'Nature Physics',
    about: 'Physics across disciplines, with an emphasis on fundamental advances.',
    aboutZh: '跨学科物理学，侧重基础性进展。',
    aboutFr: 'Physique interdisciplinaire, centrée sur les avancées fondamentales.',
  },
  {
    id: 'rmp', discipline: 'physics', name: 'Reviews of Modern Physics', short: 'RMP', issn: '0034-6861', openalex: 'S73260565',
    nameZh: '现代物理评论', nameFr: 'Reviews of Modern Physics',
    about: 'Authoritative review articles that map the state of a physics field.',
    aboutZh: '系统梳理物理学各领域现状的权威综述。',
    aboutFr: 'Articles de synthèse de référence qui cartographient l’état d’un domaine.',
  },
  {
    id: 'jhep', discipline: 'physics', name: 'Journal of High Energy Physics', short: 'JHEP', issn: '1029-8479', openalex: 'S187585107',
    nameZh: '高能物理杂志', nameFr: 'Journal of High Energy Physics',
    about: 'High energy physics, including theory, phenomenology, and experiment.',
    aboutZh: '高能物理，包括理论、现象学与实验。',
    aboutFr: 'Physique des hautes énergies : théorie, phénoménologie et expérience.',
  },
  {
    id: 'cqg', discipline: 'physics', name: 'Classical and Quantum Gravity', short: 'CQG', issn: '0264-9381', openalex: 'S171172751',
    nameZh: '经典与量子引力', nameFr: 'Gravitation classique et quantique',
    about: 'Gravitation, cosmology, and quantum gravity.',
    aboutZh: '引力、宇宙学与量子引力。',
    aboutFr: 'Gravitation, cosmologie et gravité quantique.',
  },
  {
    id: 'apj', discipline: 'physics', name: 'The Astrophysical Journal', short: 'ApJ', issn: '0004-637X', openalex: 'S1980519',
    nameZh: '天体物理杂志', nameFr: 'The Astrophysical Journal',
    about: 'Astronomy and astrophysics, from stars and planets to galaxies.',
    aboutZh: '天文学与天体物理，从恒星、行星到星系。',
    aboutFr: 'Astronomie et astrophysique, des étoiles et planètes aux galaxies.',
  },
  {
    id: 'mnras', discipline: 'physics', name: 'Monthly Notices of the Royal Astronomical Society', short: 'MNRAS', issn: '0035-8711', openalex: 'S195663288',
    nameZh: '皇家天文学会月报', nameFr: 'Monthly Notices of the Royal Astronomical Society',
    about: 'Astronomy, astrophysics, and cosmology, including observations and theory.',
    aboutZh: '天文学、天体物理与宇宙学，涵盖观测与理论。',
    aboutFr: 'Astronomie, astrophysique et cosmologie, observations et théorie.',
  },
  {
    id: 'quantum', discipline: 'physics', name: 'Quantum', short: 'Q', issn: '2521-327X', openalex: 'S4210226432',
    nameZh: '量子', nameFr: 'Quantum',
    about: 'Open-access research on quantum science, information, and technology.',
    aboutZh: '量子科学、信息与技术的开放获取研究。',
    aboutFr: 'Recherche en libre accès sur les sciences et technologies quantiques.',
  },
  {
    id: 'npj-quantum', discipline: 'physics', name: 'npj Quantum Information', short: 'npjQI', issn: '2056-6387', openalex: 'S2738600312',
    nameZh: 'npj 量子信息', nameFr: 'npj Quantum Information',
    about: 'Quantum information science, computation, and communication.',
    aboutZh: '量子信息科学、计算与通信。',
    aboutFr: 'Sciences de l’information quantique, calcul et communication.',
  },

  {
    id: 'nature-mi', discipline: 'ai', name: 'Nature Machine Intelligence', short: 'NMI', issn: '2522-5839', openalex: 'S2912241403',
    nameZh: '自然·机器智能', nameFr: 'Nature Machine Intelligence',
    about: 'Artificial intelligence, machine learning, and robotics across disciplines.',
    aboutZh: '跨学科的人工智能、机器学习与机器人研究。',
    aboutFr: 'Intelligence artificielle, apprentissage automatique et robotique, à travers les disciplines.',
  },
  {
    id: 'jmlr', discipline: 'ai', name: 'Journal of Machine Learning Research', short: 'JMLR', issn: '1532-4435', openalex: 'S118988714',
    nameZh: '机器学习研究杂志', nameFr: 'Journal of Machine Learning Research',
    about: 'Machine learning research, theory, and open-source software.',
    aboutZh: '机器学习研究、理论与开源软件。',
    aboutFr: 'Recherche en apprentissage automatique, théorie et logiciels libres.',
  },
  {
    id: 'artificial-intelligence', discipline: 'ai', name: 'Artificial Intelligence', short: 'AIJ', issn: '0004-3702', openalex: 'S196139623',
    nameZh: '人工智能', nameFr: 'Artificial Intelligence',
    about: 'Foundations of AI: representation, reasoning, learning, and agents.',
    aboutZh: '人工智能基础：表示、推理、学习与智能体。',
    aboutFr: 'Fondements de l’IA : représentation, raisonnement, apprentissage et agents.',
  },
  {
    id: 'tpami', discipline: 'ai', name: 'IEEE Transactions on Pattern Analysis and Machine Intelligence', short: 'TPAMI', issn: '0162-8828', openalex: 'S199944782',
    nameZh: 'IEEE 模式分析与机器智能汇刊', nameFr: 'IEEE Transactions on Pattern Analysis and Machine Intelligence',
    about: 'Pattern analysis, computer vision, and machine intelligence.',
    aboutZh: '模式分析、计算机视觉与机器智能。',
    aboutFr: 'Analyse de formes, vision par ordinateur et intelligence artificielle.',
  },
  {
    id: 't-ro', discipline: 'ai', name: 'IEEE Transactions on Robotics', short: 'T-RO', issn: '1941-0468', openalex: 'S144620930',
    nameZh: 'IEEE 机器人学汇刊', nameFr: 'IEEE Transactions on Robotics',
    about: 'Robotics theory, systems, control, and applications.',
    aboutZh: '机器人理论、系统、控制与应用。',
    aboutFr: 'Théorie, systèmes, commande et applications en robotique.',
  },
  {
    id: 'science-robotics', discipline: 'ai', name: 'Science Robotics', short: 'SR', issn: '2470-9476', openalex: 'S4210213233',
    nameZh: '科学·机器人学', nameFr: 'Science Robotics',
    about: 'Robotics science and its translation into real-world systems.',
    aboutZh: '机器人科学及其在真实系统中的转化。',
    aboutFr: 'Science robotique et transfert vers des systèmes réels.',
  },
  {
    id: 'ijrr', discipline: 'ai', name: 'The International Journal of Robotics Research', short: 'IJRR', issn: '0278-3649', openalex: 'S73484101',
    nameZh: '国际机器人研究杂志', nameFr: 'The International Journal of Robotics Research',
    about: 'Fundamental and applied robotics research.',
    aboutZh: '机器人基础与应用研究。',
    aboutFr: 'Recherche fondamentale et appliquée en robotique.',
  },
  {
    id: 'pattern-recognition', discipline: 'ai', name: 'Pattern Recognition', short: 'PR', issn: '0031-3203', openalex: 'S414566',
    nameZh: '模式识别', nameFr: 'Pattern Recognition',
    about: 'Pattern recognition, image analysis, and machine learning.',
    aboutZh: '模式识别、图像分析与机器学习。',
    aboutFr: 'Reconnaissance de formes, analyse d’images et apprentissage automatique.',
  },
  {
    id: 'neural-networks', discipline: 'ai', name: 'Neural Networks', short: 'NN', issn: '0893-6080', openalex: 'S123019304',
    nameZh: '神经网络', nameFr: 'Neural Networks',
    about: 'Neural computation, deep learning, and cognitive models.',
    aboutZh: '神经计算、深度学习与认知模型。',
    aboutFr: 'Calcul neuronal, apprentissage profond et modèles cognitifs.',
  },
  {
    id: 'machine-learning', discipline: 'ai', name: 'Machine Learning', short: 'ML', issn: '0885-6125', openalex: 'S62148650',
    nameZh: '机器学习', nameFr: 'Machine Learning',
    about: 'Machine learning theory, methods, and applications.',
    aboutZh: '机器学习理论、方法与应用。',
    aboutFr: 'Théorie, méthodes et applications de l’apprentissage automatique.',
  },
  {
    id: 'autonomous-robots', discipline: 'ai', name: 'Autonomous Robots', short: 'AR', issn: '0929-5593', openalex: 'S144091109',
    nameZh: '自主机器人', nameFr: 'Autonomous Robots',
    about: 'Autonomous systems, perception, planning, and control.',
    aboutZh: '自主系统、感知、规划与控制。',
    aboutFr: 'Systèmes autonomes, perception, planification et commande.',
  },
];

export const CONFERENCES = [
  {
    id: 'neurips', group: 'ai', name: 'NeurIPS', short: 'NIPS', openalex: 'S4363606243',
    nameZh: '神经信息处理系统大会', nameFr: 'NeurIPS',
    about: 'Advances in neural information processing systems.',
    aboutZh: '神经信息处理系统进展，机器学习领域最具影响力的会议之一。',
    aboutFr: 'Avancées en systèmes de traitement de l’information neuronale.',
  },
  {
    id: 'cvpr', group: 'ai', name: 'CVPR', short: 'CVPR', openalex: 'S4210176548',
    nameZh: '计算机视觉与模式识别会议', nameFr: 'CVPR',
    about: 'IEEE/CVF Conference on Computer Vision and Pattern Recognition.',
    aboutZh: 'IEEE/CVF 计算机视觉与模式识别会议。',
    aboutFr: 'Conférence IEEE/CVF sur la vision par ordinateur et la reconnaissance de formes.',
  },
  {
    id: 'iccv', group: 'ai', name: 'ICCV', short: 'ICCV', openalex: 'S4363607764',
    nameZh: '国际计算机视觉大会', nameFr: 'ICCV',
    about: 'IEEE/CVF International Conference on Computer Vision.',
    aboutZh: 'IEEE/CVF 国际计算机视觉大会，每两年举办一次。',
    aboutFr: 'Conférence internationale IEEE/CVF sur la vision par ordinateur.',
  },
  {
    id: 'aaai', group: 'ai', name: 'AAAI', short: 'AAAI', openalex: 'S4210191458',
    nameZh: 'AAAI 人工智能大会', nameFr: 'AAAI',
    about: 'AAAI Conference on Artificial Intelligence.',
    aboutZh: 'AAAI 人工智能大会，覆盖 AI 各分支。',
    aboutFr: 'Conférence AAAI sur l’intelligence artificielle.',
  },
  {
    id: 'ijcai', group: 'ai', name: 'IJCAI', short: 'IJCAI', openalex: 'S4306419999',
    nameZh: '国际人工智能联合会议', nameFr: 'IJCAI',
    about: 'International Joint Conference on Artificial Intelligence.',
    aboutZh: '国际人工智能联合会议，历史悠久的综合性 AI 顶会。',
    aboutFr: 'Conférence internationale conjointe sur l’intelligence artificielle.',
  },
  {
    id: 'acl', group: 'ai', name: 'ACL', short: 'ACL', openalex: 'S4393915740',
    nameZh: '计算语言学协会年会', nameFr: 'ACL',
    about: 'Annual Meeting of the Association for Computational Linguistics.',
    aboutZh: '计算语言学协会年会，自然语言处理领域顶级会议。',
    aboutFr: 'Conférence annuelle de l’Association for Computational Linguistics.',
  },
  {
    id: 'emnlp', group: 'ai', name: 'EMNLP', short: 'EMNLP', openalex: 'S4363608991',
    nameZh: '自然语言处理实证方法会议', nameFr: 'EMNLP',
    about: 'Conference on Empirical Methods in Natural Language Processing.',
    aboutZh: '自然语言处理实证方法会议。',
    aboutFr: 'Conférence sur les méthodes empiriques en traitement du langage naturel.',
  },
  {
    id: 'kdd', group: 'ai', name: 'KDD', short: 'KDD', openalex: 'S4363608767',
    nameZh: '知识发现与数据挖掘会议', nameFr: 'KDD',
    about: 'ACM SIGKDD Conference on Knowledge Discovery and Data Mining.',
    aboutZh: 'ACM SIGKDD 知识发现与数据挖掘会议。',
    aboutFr: 'Conférence ACM SIGKDD sur la découverte de connaissances et l’exploration de données.',
  },
  {
    id: 'icra', group: 'robotics', name: 'ICRA', short: 'ICRA', openalex: 'S4210217939',
    nameZh: 'IEEE 国际机器人与自动化会议', nameFr: 'ICRA',
    about: 'IEEE International Conference on Robotics and Automation.',
    aboutZh: 'IEEE 国际机器人与自动化会议，机器人领域规模最大的旗舰会议。',
    aboutFr: 'Conférence internationale IEEE sur la robotique et l’automatisation.',
  },
  {
    id: 'iros', group: 'robotics', name: 'IROS', short: 'IROS', openalex: 'S4393918188',
    nameZh: 'IEEE/RSJ 国际智能机器人与系统会议', nameFr: 'IROS',
    about: 'IEEE/RSJ International Conference on Intelligent Robots and Systems.',
    aboutZh: 'IEEE/RSJ 国际智能机器人与系统会议。',
    aboutFr: 'Conférence internationale IEEE/RSJ sur les robots et systèmes intelligents.',
  },
  {
    id: 'rss', group: 'robotics', name: 'RSS', short: 'RSS', openalex: 'S4306420803',
    nameZh: '机器人：科学与系统', nameFr: 'RSS',
    about: 'Robotics: Science and Systems.',
    aboutZh: '机器人：科学与系统，注重机器人基础科学。',
    aboutFr: 'Robotique : science et systèmes.',
  },
];

export const JOURNALS_BY_ID = new Map(JOURNALS.map((journal) => [journal.id, journal]));
export const CONFERENCES_BY_ID = new Map(CONFERENCES.map((conference) => [conference.id, conference]));

export function journalsFor(disciplineId) {
  return JOURNALS.filter((journal) => journal.discipline === disciplineId);
}

export function conferencesFor(group) {
  return CONFERENCES.filter((conference) => conference.group === group);
}

/**
 * Curated journal and conference catalogue for Musee.
 * Source ids are OpenAlex `S...` identifiers resolved from each venue's ISSN or name.
 * Descriptions are original Musee scope notes, not publisher copy.
 */
export const VERSION = '0.6.3';

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
  {
    id: 'flagship',
    name: { en: 'Flagship series', zh: '旗舰系列', fr: 'Séries phares' },
    blurb: {
      en: 'Nature, Science and Cell families',
      zh: 'Nature / Science / Cell 及其子刊',
      fr: 'Les familles Nature, Science et Cell',
    },
    arxiv: [],
  },
];

export const SERIES = [
  { id: 'nature', name: { en: 'Nature', zh: 'Nature 系', fr: 'Nature' } },
  { id: 'science', name: { en: 'Science', zh: 'Science 系', fr: 'Science' } },
  { id: 'cell', name: { en: 'Cell', zh: 'Cell 系', fr: 'Cell' } },
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

  // Flagship and multidisciplinary journals, surfaced as recommendations on the home page.
  {
    id: 'nature', discipline: 'flagship', recommended: true, series: 'nature', name: 'Nature', short: 'NAT', issn: '0028-0836', openalex: 'S137773608',
    nameZh: '自然', nameFr: 'Nature',
    about: 'Multidisciplinary flagship journal covering all areas of natural science.',
    aboutZh: '跨学科旗舰期刊，覆盖自然科学各领域。',
    aboutFr: 'Revue phare multidisciplinaire couvrant toutes les sciences de la nature.',
  },
  {
    id: 'science', discipline: 'flagship', recommended: true, series: 'science', name: 'Science', short: 'SCI', issn: '0036-8075', openalex: 'S3880285',
    nameZh: '科学', nameFr: 'Science',
    about: 'AAAS flagship for peer-reviewed research across scientific disciplines.',
    aboutZh: '美国科学促进会旗舰期刊，覆盖多学科同行评议研究。',
    aboutFr: 'Revue phare de l’AAAS pour la recherche évaluée par les pairs dans toutes les disciplines.',
  },
  {
    id: 'cell', discipline: 'flagship', recommended: true, series: 'cell', name: 'Cell', short: 'CELL', issn: '0092-8674', openalex: 'S110447773',
    nameZh: '细胞', nameFr: 'Cell',
    about: 'Molecular and cellular biology, including translational and disease research.',
    aboutZh: '分子与细胞生物学，涵盖转化医学与疾病研究。',
    aboutFr: 'Biologie moléculaire et cellulaire, y compris la recherche translationnelle et sur les maladies.',
  },
  {
    id: 'nature-communications', discipline: 'flagship', recommended: true, series: 'nature', name: 'Nature Communications', short: 'NC', issn: '2041-1723', openalex: 'S64187185',
    nameZh: '自然·通讯', nameFr: 'Nature Communications',
    about: 'Open-access multidisciplinary research across the natural sciences.',
    aboutZh: '开放获取的跨学科自然科学研究。',
    aboutFr: 'Recherche multidisciplinaire en libre accès dans les sciences de la nature.',
  },
  {
    id: 'science-advances', discipline: 'flagship', recommended: true, series: 'science', name: 'Science Advances', short: 'SA', issn: '2375-2548', openalex: 'S2737427234',
    nameZh: '科学·进展', nameFr: 'Science Advances',
    about: 'Open-access multidisciplinary research published by AAAS.',
    aboutZh: 'AAAS 出版的开放获取跨学科研究。',
    aboutFr: 'Recherche multidisciplinaire en libre accès publiée par l’AAAS.',
  },
  {
    id: 'cell-reports', discipline: 'flagship', recommended: true, series: 'cell', name: 'Cell Reports', short: 'CR', issn: '2211-1247', openalex: 'S169236886',
    nameZh: '细胞报告', nameFr: 'Cell Reports',
    about: 'Open-access life-science research spanning cell biology and disease.',
    aboutZh: '开放获取的生命科学研究，覆盖细胞生物学与疾病。',
    aboutFr: 'Recherche en sciences de la vie en libre accès, de la biologie cellulaire aux maladies.',
  },
  {
    id: 'nature-cities', discipline: 'flagship', recommended: true, series: 'nature', name: 'Nature Cities', short: 'NCITY', issn: '2731-9997', openalex: 'S4390297069',
    nameZh: '自然·城市', nameFr: 'Nature Cities',
    about: 'Interdisciplinary urban research, from planning and governance to climate.',
    aboutZh: '跨学科城市研究，从规划治理到气候适应。',
    aboutFr: 'Recherche urbaine interdisciplinaire, de la planification au climat.',
  },
  {
    id: 'nature-chemistry', discipline: 'flagship', series: 'nature', name: 'Nature Chemistry', short: 'NCHEM', issn: '1755-4330', openalex: 'S202193212',
    nameZh: '自然·化学', nameFr: 'Nature Chemistry',
    about: 'Chemistry across synthesis, catalysis, materials, and analysis.',
    aboutZh: '化学合成、催化、材料与分析。',
    aboutFr: 'Chimie : synthèse, catalyse, matériaux et analyse.',
  },
  {
    id: 'nature-materials', discipline: 'flagship', series: 'nature', name: 'Nature Materials', short: 'NMAT', issn: '1476-1122', openalex: 'S103895331',
    nameZh: '自然·材料', nameFr: 'Nature Materials',
    about: 'Materials science from fundamental physics to applications.',
    aboutZh: '材料科学，从基础物理到应用。',
    aboutFr: 'Science des matériaux, de la physique fondamentale aux applications.',
  },
  {
    id: 'nature-medicine', discipline: 'flagship', series: 'nature', name: 'Nature Medicine', short: 'NMED', issn: '1078-8956', openalex: 'S203256638',
    nameZh: '自然·医学', nameFr: 'Nature Medicine',
    about: 'Translational medicine and clinical research.',
    aboutZh: '转化医学与临床研究。',
    aboutFr: 'Médecine translationnelle et recherche clinique.',
  },
  {
    id: 'nature-biotechnology', discipline: 'flagship', series: 'nature', name: 'Nature Biotechnology', short: 'NBT', issn: '1087-0156', openalex: 'S106963461',
    nameZh: '自然·生物技术', nameFr: 'Nature Biotechnology',
    about: 'Biotechnology research, methods, and applications.',
    aboutZh: '生物技术研究、方法与应用。',
    aboutFr: 'Recherche, méthodes et applications en biotechnologie.',
  },
  {
    id: 'nature-methods', discipline: 'flagship', series: 'nature', name: 'Nature Methods', short: 'NMETH', issn: '1548-7091', openalex: 'S127827428',
    nameZh: '自然·方法', nameFr: 'Nature Methods',
    about: 'New methods and tools for life-science research.',
    aboutZh: '生命科学研究的新方法与工具。',
    aboutFr: 'Nouvelles méthodes et outils pour la recherche en sciences de la vie.',
  },
  {
    id: 'nature-climate-change', discipline: 'flagship', series: 'nature', name: 'Nature Climate Change', short: 'NCC', issn: '1758-678X', openalex: 'S183584863',
    nameZh: '自然·气候变化', nameFr: 'Nature Climate Change',
    about: 'Climate science, impacts, adaptation, and policy.',
    aboutZh: '气候科学、影响、适应与政策。',
    aboutFr: 'Science du climat, impacts, adaptation et politiques.',
  },
  {
    id: 'nature-sustainability', discipline: 'flagship', series: 'nature', name: 'Nature Sustainability', short: 'NSUST', issn: '2398-9629', openalex: 'S4210188283',
    nameZh: '自然·可持续性', nameFr: 'Nature Sustainability',
    about: 'Sustainability research across natural and social sciences.',
    aboutZh: '跨自然科学与社会科学的可持续性研究。',
    aboutFr: 'Recherche sur la durabilité, des sciences naturelles aux sciences sociales.',
  },
  {
    id: 'nature-energy', discipline: 'flagship', series: 'nature', name: 'Nature Energy', short: 'NENERGY', issn: '2058-7546', openalex: 'S2764528046',
    nameZh: '自然·能源', nameFr: 'Nature Energy',
    about: 'Energy research, technology, and policy.',
    aboutZh: '能源研究、技术与政策。',
    aboutFr: 'Recherche, technologies et politiques de l’énergie.',
  },
  {
    id: 'science-signaling', discipline: 'flagship', series: 'science', name: 'Science Signaling', short: 'SIG', issn: '1937-9145', openalex: 'S155937366',
    nameZh: '科学·信号', nameFr: 'Science Signaling',
    about: 'Cell signaling, regulatory networks, and systems biology.',
    aboutZh: '细胞信号、调控网络与系统生物学。',
    aboutFr: 'Signalisation cellulaire, réseaux de régulation et biologie des systèmes.',
  },
  {
    id: 'science-immunology', discipline: 'flagship', series: 'science', name: 'Science Immunology', short: 'SI', issn: '2470-9468', openalex: 'S2764653179',
    nameZh: '科学·免疫学', nameFr: 'Science Immunology',
    about: 'Immunology across basic mechanisms and clinical research.',
    aboutZh: '免疫学基础机制与临床研究。',
    aboutFr: 'Immunologie, des mécanismes fondamentaux à la recherche clinique.',
  },
  {
    id: 'science-translational-medicine', discipline: 'flagship', series: 'science', name: 'Science Translational Medicine', short: 'STM', issn: '1946-6234', openalex: 'S24207032',
    nameZh: '科学·转化医学', nameFr: 'Science Translational Medicine',
    about: 'Translating biomedical research into clinical practice.',
    aboutZh: '把生物医学研究转化为临床实践。',
    aboutFr: 'Transposer la recherche biomédicale en pratique clinique.',
  },
  {
    id: 'molecular-cell', discipline: 'flagship', series: 'cell', name: 'Molecular Cell', short: 'MC', issn: '1097-2765', openalex: 'S156208185',
    nameZh: '分子细胞', nameFr: 'Molecular Cell',
    about: 'Molecular mechanisms of cellular processes.',
    aboutZh: '细胞过程的分子机制。',
    aboutFr: 'Mécanismes moléculaires des processus cellulaires.',
  },
  {
    id: 'neuron', discipline: 'flagship', series: 'cell', name: 'Neuron', short: 'NEURON', issn: '0896-6273', openalex: 'S45757444',
    nameZh: '神经元', nameFr: 'Neuron',
    about: 'Neuroscience at the cellular, circuit, and systems level.',
    aboutZh: '细胞、环路与系统层面的神经科学。',
    aboutFr: 'Neurosciences aux niveaux cellulaire, des circuits et des systèmes.',
  },
  {
    id: 'immunity', discipline: 'flagship', series: 'cell', name: 'Immunity', short: 'IMM', issn: '1074-7613', openalex: 'S199671312',
    nameZh: '免疫', nameFr: 'Immunity',
    about: 'Immunology and host defense mechanisms.',
    aboutZh: '免疫学与宿主防御机制。',
    aboutFr: 'Immunologie et mécanismes de défense de l’hôte.',
  },
  {
    id: 'cancer-cell', discipline: 'flagship', series: 'cell', name: 'Cancer Cell', short: 'CC', issn: '1535-6108', openalex: 'S25671836',
    nameZh: '癌细胞', nameFr: 'Cancer Cell',
    about: 'Cancer biology and translational oncology.',
    aboutZh: '肿瘤生物学与转化肿瘤学。',
    aboutFr: 'Biologie du cancer et oncologie translationnelle.',
  },
  {
    id: 'cell-stem-cell', discipline: 'flagship', series: 'cell', name: 'Cell Stem Cell', short: 'CSC', issn: '1934-5909', openalex: 'S128124174',
    nameZh: '细胞·干细胞', nameFr: 'Cell Stem Cell',
    about: 'Stem cell biology and regenerative medicine.',
    aboutZh: '干细胞生物学与再生医学。',
    aboutFr: 'Biologie des cellules souches et médecine régénérative.',
  },
  {
    id: 'cell-metabolism', discipline: 'flagship', series: 'cell', name: 'Cell Metabolism', short: 'CMET', issn: '1550-4131', openalex: 'S177533077',
    nameZh: '细胞·代谢', nameFr: 'Cell Metabolism',
    about: 'Metabolic regulation and metabolic disease.',
    aboutZh: '代谢调控与代谢疾病。',
    aboutFr: 'Régulation métabolique et maladies métaboliques.',
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

export const RECOMMENDED_IDS = [
  'nature',
  'science',
  'cell',
  'nature-communications',
  'science-advances',
  'cell-reports',
  'nature-cities',
  'nature-physics',
  'nature-mi',
  'science-robotics',
];

export const RECOMMENDED_JOURNALS = RECOMMENDED_IDS.map((id) => JOURNALS_BY_ID.get(id)).filter(Boolean);

export function journalsFor(disciplineId) {
  return JOURNALS.filter((journal) => journal.discipline === disciplineId);
}

export function conferencesFor(group) {
  return CONFERENCES.filter((conference) => conference.group === group);
}

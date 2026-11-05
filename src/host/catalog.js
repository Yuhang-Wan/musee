/**
 * Curated journal catalogue and discipline metadata for Musee.
 * Source ids are OpenAlex `S...` identifiers resolved from each journal's ISSN.
 */
export const VERSION = '0.1.3';

export const DISCIPLINES = [
  {
    id: 'urban',
    name: { zh: '城市研究', en: 'Urban studies' },
    blurb: {
      zh: '城市、交通、建成环境与可持续性',
      en: 'Cities, transport, built environment, sustainability',
    },
    arxiv: ['physics.soc-ph', 'econ.GN', 'cs.CY'],
  },
  {
    id: 'physics',
    name: { zh: '物理', en: 'Physics' },
    blurb: { zh: '凝聚态、高能、量子与天体物理', en: 'Condensed matter, high energy, quantum, astrophysics' },
    arxiv: ['hep-th', 'quant-ph', 'cond-mat.mtrl-sci', 'astro-ph.GA'],
  },
  {
    id: 'ai',
    name: { zh: '人工智能与机器人', en: 'AI & robotics' },
    blurb: { zh: '机器学习、计算机视觉、机器人与具身智能', en: 'Machine learning, vision, robotics, embodied AI' },
    arxiv: ['cs.AI', 'cs.RO', 'cs.LG', 'cs.CV', 'cs.CL'],
  },
];

/** `openalex` is the source id without the `https://openalex.org/` prefix. */
export const JOURNALS = [
  // Urban studies
  { id: 'urban-studies', discipline: 'urban', name: 'Urban Studies', issn: '0042-0980', openalex: 'S50366009' },
  { id: 'cities', discipline: 'urban', name: 'Cities', issn: '0264-2751', openalex: 'S137445289' },
  { id: 'landscape-urban-planning', discipline: 'urban', name: 'Landscape and Urban Planning', issn: '0169-2046', openalex: 'S104597489' },
  { id: 'ceus', discipline: 'urban', name: 'Computers, Environment and Urban Systems', issn: '0198-9715', openalex: 'S60115552' },
  { id: 'sustainable-cities', discipline: 'urban', name: 'Sustainable Cities and Society', issn: '2210-6707', openalex: 'S163634330' },
  { id: 'transport-geography', discipline: 'urban', name: 'Journal of Transport Geography', issn: '0966-6923', openalex: 'S80150607' },
  { id: 'epa', discipline: 'urban', name: 'Environment and Planning A: Economy and Space', issn: '0308-518X', openalex: 'S87933477' },
  { id: 'habitat-international', discipline: 'urban', name: 'Habitat International', issn: '0197-3975', openalex: 'S4210229294' },
  { id: 'ufug', discipline: 'urban', name: 'Urban Forestry & Urban Greening', issn: '1618-8667', openalex: 'S99909709' },
  { id: 'travel-behaviour', discipline: 'urban', name: 'Travel Behaviour and Society', issn: '2214-367X', openalex: 'S2764874763' },

  // Physics
  { id: 'prl', discipline: 'physics', name: 'Physical Review Letters', issn: '0031-9007', openalex: 'S24807848' },
  { id: 'prb', discipline: 'physics', name: 'Physical Review B', issn: '2469-9950', openalex: 'S4210237713' },
  { id: 'prd', discipline: 'physics', name: 'Physical Review D', issn: '2470-0010', openalex: 'S4210238307' },
  { id: 'nature-physics', discipline: 'physics', name: 'Nature Physics', issn: '1745-2473', openalex: 'S156274416' },
  { id: 'rmp', discipline: 'physics', name: 'Reviews of Modern Physics', issn: '0034-6861', openalex: 'S73260565' },
  { id: 'jhep', discipline: 'physics', name: 'Journal of High Energy Physics', issn: '1029-8479', openalex: 'S187585107' },
  { id: 'cqg', discipline: 'physics', name: 'Classical and Quantum Gravity', issn: '0264-9381', openalex: 'S171172751' },
  { id: 'apj', discipline: 'physics', name: 'The Astrophysical Journal', issn: '0004-637X', openalex: 'S1980519' },
  { id: 'mnras', discipline: 'physics', name: 'Monthly Notices of the Royal Astronomical Society', issn: '0035-8711', openalex: 'S195663288' },
  { id: 'quantum', discipline: 'physics', name: 'Quantum', issn: '2521-327X', openalex: 'S4210226432' },
  { id: 'npj-quantum', discipline: 'physics', name: 'npj Quantum Information', issn: '2056-6387', openalex: 'S2738600312' },

  // AI & robotics
  { id: 'nature-mi', discipline: 'ai', name: 'Nature Machine Intelligence', issn: '2522-5839', openalex: 'S2912241403' },
  { id: 'jmlr', discipline: 'ai', name: 'Journal of Machine Learning Research', issn: '1532-4435', openalex: 'S118988714' },
  { id: 'artificial-intelligence', discipline: 'ai', name: 'Artificial Intelligence', issn: '0004-3702', openalex: 'S196139623' },
  { id: 'tpami', discipline: 'ai', name: 'IEEE Transactions on Pattern Analysis and Machine Intelligence', issn: '0162-8828', openalex: 'S199944782' },
  { id: 't-ro', discipline: 'ai', name: 'IEEE Transactions on Robotics', issn: '1941-0468', openalex: 'S144620930' },
  { id: 'science-robotics', discipline: 'ai', name: 'Science Robotics', issn: '2470-9476', openalex: 'S4210213233' },
  { id: 'ijrr', discipline: 'ai', name: 'The International Journal of Robotics Research', issn: '0278-3649', openalex: 'S73484101' },
  { id: 'pattern-recognition', discipline: 'ai', name: 'Pattern Recognition', issn: '0031-3203', openalex: 'S414566' },
  { id: 'neural-networks', discipline: 'ai', name: 'Neural Networks', issn: '0893-6080', openalex: 'S123019304' },
  { id: 'machine-learning', discipline: 'ai', name: 'Machine Learning', issn: '0885-6125', openalex: 'S62148650' },
  { id: 'autonomous-robots', discipline: 'ai', name: 'Autonomous Robots', issn: '0929-5593', openalex: 'S144091109' },
];

export const JOURNALS_BY_ID = new Map(JOURNALS.map((journal) => [journal.id, journal]));

export function journalsFor(disciplineId) {
  return JOURNALS.filter((journal) => journal.discipline === disciplineId);
}

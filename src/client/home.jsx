import { h } from './react.js';
import { Button, Empty, ErrorBanner, IconStar, Loading } from './ui.jsx';
import { JournalCover } from './cover.jsx';

function localizedName(venue, lang) {
  if (!venue || lang === 'en') return '';
  return (lang === 'zh' ? venue.nameZh : venue.nameFr) || '';
}

function localizedAbout(venue, lang) {
  if (!venue) return '';
  if (lang === 'zh') return venue.aboutZh || venue.about || '';
  if (lang === 'fr') return venue.aboutFr || venue.about || '';
  return venue.about || '';
}

function shortAuthors(authors = []) {
  if (authors.length <= 3) return authors.join(', ');
  return `${authors.slice(0, 3).join(', ')}, et al.`;
}

function HeroArt() {
  return h(
    'svg',
    { viewBox: '0 0 720 520', preserveAspectRatio: 'xMidYMid slice', className: 'musee-hero-art', 'aria-hidden': 'true' },
    h(
      'defs',
      null,
      h('linearGradient', { id: 'musee-ink', x1: '0', y1: '0', x2: '1', y2: '1' }, h('stop', { offset: '0', stopColor: '#081018' }), h('stop', { offset: '1', stopColor: '#16324a' })),
      h('linearGradient', { id: 'musee-gold', x1: '0', y1: '0', x2: '1', y2: '1' }, h('stop', { offset: '0', stopColor: '#f0d49b' }), h('stop', { offset: '1', stopColor: '#b7791f' })),
    ),
    h('rect', { width: '720', height: '520', fill: 'url(#musee-ink)' }),
    h('g', { opacity: '0.22', stroke: '#f0d49b', fill: 'none', strokeWidth: '1.2' },
      h('circle', { cx: '560', cy: '150', r: '120' }),
      h('circle', { cx: '560', cy: '150', r: '190' }),
      h('circle', { cx: '560', cy: '150', r: '260' }),
      h('path', { d: 'M40 420 C 180 340, 300 470, 450 360 S 640 300, 720 340' }),
      h('path', { d: 'M40 455 C 190 380, 320 500, 470 390 S 650 330, 720 370' }),
    ),
    h('g', { transform: 'translate(86 118) rotate(-7)' },
      h('path', { d: 'M0 0 L250 24 L232 330 L0 300 Z', fill: '#f7f0df', opacity: '0.94' }),
      h('path', { d: 'M18 34 L220 54', stroke: '#0b1220', strokeWidth: '2', opacity: '0.28' }),
      h('path', { d: 'M18 58 L190 76', stroke: '#0b1220', strokeWidth: '2', opacity: '0.18' }),
      h('path', { d: 'M18 82 L210 98', stroke: '#0b1220', strokeWidth: '2', opacity: '0.18' }),
    ),
    h('g', { transform: 'translate(300 96) rotate(5)' },
      h('path', { d: 'M0 0 L245 18 L260 318 L12 330 Z', fill: '#10324a', opacity: '0.96', stroke: '#f0d49b', strokeWidth: '1.5' }),
      h('circle', { cx: '120', cy: '120', r: '54', fill: 'none', stroke: 'url(#musee-gold)', strokeWidth: '1.4' }),
      h('path', { d: 'M40 212 L215 196 M40 236 L200 222 M40 260 L180 248', stroke: '#f0d49b', strokeWidth: '1.2', opacity: '0.55' }),
    ),
    h('text', { x: '40', y: '470', fill: '#f7f0df', opacity: '0.08', fontFamily: 'Georgia, serif', fontSize: '190', fontWeight: '700' }, 'M'),
    h('text', { x: '92', y: '88', fill: '#f0d49b', opacity: '0.85', fontFamily: 'Georgia, serif', fontSize: '13', letterSpacing: '6' }, 'MUSEE'),
  );
}

export function Home({ t, lang, feed, recommended, loading, error, followed, onOpenJournal, onOpenPaper, onDiscover, onToggleFollow, titleTranslations }) {
  const leadEntry = feed.find((entry) => entry.papers.length > 0);
  const leadPaper = leadEntry?.papers[0];
  const leadJournal = leadEntry?.journal;

  const hero = h(
    'section',
    { className: 'musee-editorial-hero' },
    h('div', { className: 'musee-hero-visual' }, h(HeroArt)),
    h(
      'div',
      { className: 'musee-hero-copy' },
      h('div', { className: 'musee-kicker' }, t('home.kicker')),
      leadPaper
        ? h(
            'div',
            null,
            h(
              'button',
              { type: 'button', className: 'musee-lead-venue', onClick: () => onOpenJournal(leadJournal) },
              `${leadJournal.name}${leadPaper.date ? ` · ${leadPaper.date}` : ''}`,
            ),
            h(
              'h1',
              { className: 'musee-display' },
              h('button', { type: 'button', className: 'musee-display-link', onClick: () => onOpenPaper(leadPaper) }, titleTranslations[leadPaper.id] || leadPaper.title),
            ),
            leadPaper.authors?.length ? h('p', { className: 'musee-lead-authors' }, shortAuthors(leadPaper.authors)) : null,
            h(
              'div',
              { className: 'musee-hero-actions' },
              h(Button, { variant: 'primary', onClick: () => onOpenPaper(leadPaper) }, t('home.read')),
              h(Button, { onClick: () => onOpenJournal(leadJournal) }, t('home.openJournal')),
            ),
          )
        : h(
            'div',
            null,
            h('h1', { className: 'musee-display' }, t('home.headline')),
            h('p', { className: 'musee-lead-summary' }, t('home.empty')),
            h(Button, { variant: 'primary', onClick: onDiscover }, t('home.browse')),
          ),
    ),
  );

  const followedSection = feed.length
    ? h(
        'section',
        { className: 'musee-editorial-section' },
        h(
          'div',
          { className: 'musee-section-rule' },
          h('h2', null, t('home.followedSection')),
          h('span', null, `${feed.length}`),
        ),
        h(
          'div',
          { className: 'musee-feed-grid' },
          feed.map(({ journal, papers }) =>
            h(
              'article',
              { className: 'musee-feed-card', key: journal.id },
              h(
                'div',
                { className: 'musee-feed-head' },
                h(
                  'button',
                  { type: 'button', className: 'musee-feed-venue', onClick: () => onOpenJournal(journal) },
                  journal.name,
                ),
                h(
                  'button',
                  {
                    type: 'button',
                    className: `musee-follow-btn ${followed.has(journal.id) ? 'active' : ''}`,
                    title: followed.has(journal.id) ? t('home.following') : t('home.follow'),
                    'aria-label': followed.has(journal.id) ? t('home.following') : t('home.follow'),
                    onClick: () => onToggleFollow(journal),
                  },
                  h(IconStar, { filled: followed.has(journal.id) }),
                ),
              ),
              papers.length
                ? h(
                    'div',
                    { className: 'musee-feed-papers' },
                    papers.map((paper, index) =>
                      h(
                        'button',
                        { key: paper.id, type: 'button', className: `musee-feed-paper ${index === 0 ? 'lead' : ''}`, onClick: () => onOpenPaper(paper) },
                        h('span', { className: 'musee-feed-title' }, titleTranslations[paper.id] || paper.title),
                        h('span', { className: 'musee-feed-date' }, paper.date || ''),
                      ),
                    ),
                  )
                : h('div', { className: 'musee-home-nopapers' }, t('home.noPapers')),
              h('button', { type: 'button', className: 'musee-feed-more', onClick: () => onOpenJournal(journal) }, `${t('home.viewAll')} →`),
            ),
          ),
        ),
      )
    : null;

  const recommendedSection = recommended.length
    ? h(
        'section',
        { className: 'musee-editorial-section' },
        h(
          'div',
          { className: 'musee-section-rule' },
          h('h2', null, t('home.recommended')),
          h('span', null, t('home.recommendedHint')),
        ),
        h(
          'div',
          { className: 'musee-rec-grid' },
          recommended.map((journal) =>
            h(
              'article',
              { key: journal.id, className: 'musee-rec-card' },
              h(
                'button',
                { type: 'button', className: 'musee-rec-main', onClick: () => onOpenJournal(journal) },
                h(JournalCover, { venue: journal, kind: journal.discipline, size: 'sm' }),
                h(
                  'span',
                  { className: 'musee-rec-info' },
                  h('span', { className: 'musee-rec-name' }, journal.name),
                  localizedName(journal, lang) ? h('span', { className: 'musee-rec-local' }, localizedName(journal, lang)) : null,
                  h('span', { className: 'musee-rec-about' }, localizedAbout(journal, lang)),
                ),
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: `musee-follow-btn ${followed.has(journal.id) ? 'active' : ''}`,
                  title: followed.has(journal.id) ? t('home.following') : t('home.follow'),
                  'aria-label': followed.has(journal.id) ? t('home.following') : t('home.follow'),
                  onClick: () => onToggleFollow(journal),
                },
                h(IconStar, { filled: followed.has(journal.id) }),
              ),
            ),
          ),
        ),
      )
    : null;

  if (loading && !feed.length) {
    return h('div', { className: 'musee-page musee-editorial' }, hero, h(Loading, { label: t('home.loading') }));
  }

  return h(
    'div',
    { className: 'musee-page musee-editorial' },
    hero,
    error ? h(ErrorBanner, { message: error }) : null,
    followedSection,
    !feed.length && !recommended.length ? h(Empty, { title: t('home.empty') }) : null,
    recommendedSection,
  );
}

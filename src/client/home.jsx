import { h } from './react.js';
import { Button, Empty, ErrorBanner, IconStar, Loading } from './ui.jsx';
import { JournalCover } from './cover.jsx';

function localizedName(venue, lang) {
  if (!venue || lang === 'en') return '';
  return (lang === 'zh' ? venue.nameZh : venue.nameFr) || '';
}

export function Home({ t, lang, feed, loading, error, followed, onOpenJournal, onOpenPaper, onDiscover, onToggleFollow, titleTranslations }) {
  const header = h(
    'div',
    { className: 'musee-hero' },
    h('h1', null, t('home.title')),
    h('p', null, t('home.subtitle')),
  );

  if (loading && !feed.length) {
    return h('div', { className: 'musee-page' }, header, h(Loading, { label: t('home.loading') }));
  }

  if (error) {
    return h('div', { className: 'musee-page' }, header, h(ErrorBanner, { message: error }));
  }

  if (!feed.length) {
    return h(
      'div',
      { className: 'musee-page' },
      header,
      h(
        'div',
        { className: 'musee-home-empty' },
        h(Empty, { title: t('home.empty') }),
        h(Button, { variant: 'primary', onClick: onDiscover }, t('home.browse')),
      ),
    );
  }

  return h(
    'div',
    { className: 'musee-page' },
    header,
    h(
      'div',
      { className: 'musee-home-grid' },
      feed.map(({ journal, papers }) =>
        h(
          'div',
          { className: 'musee-home-card', key: journal.id },
          h(
            'div',
            {
              className: 'musee-home-head',
              role: 'button',
              tabIndex: 0,
              onClick: () => onOpenJournal(journal),
              onKeyDown: (event) => {
                if (event.key === 'Enter') onOpenJournal(journal);
              },
            },
            h(JournalCover, { venue: journal, kind: journal.discipline, size: 'sm', issue: papers[0]?.year ? String(papers[0].year) : '' }),
            h(
              'div',
              { className: 'musee-home-info' },
              h('div', { className: 'musee-home-name' }, journal.name),
              localizedName(journal, lang) ? h('div', { className: 'musee-home-local' }, localizedName(journal, lang)) : null,
              h(
                'div',
                { className: 'musee-home-meta' },
                h('span', null, journal.issn),
                journal.userIf ? h('span', null, `${t('metrics.if')} ${journal.userIf}`) : null,
              ),
            ),
            h(
              'button',
              {
                type: 'button',
                className: `musee-follow-btn ${followed.has(journal.id) ? 'active' : ''}`,
                title: followed.has(journal.id) ? t('home.following') : t('home.follow'),
                'aria-label': followed.has(journal.id) ? t('home.following') : t('home.follow'),
                onClick: (event) => {
                  event.stopPropagation();
                  onToggleFollow(journal);
                },
              },
              h(IconStar, { filled: followed.has(journal.id) }),
            ),
          ),
          h(
            'div',
            { className: 'musee-home-papers' },
            papers.length
              ? papers.map((paper) =>
                  h(
                    'button',
                    { key: paper.id, type: 'button', className: 'musee-home-paper', onClick: () => onOpenPaper(paper) },
                    h('span', { className: 'musee-home-paper-title' }, titleTranslations[paper.id] || paper.title),
                    h('span', { className: 'musee-home-paper-date' }, paper.date || ''),
                  ),
                )
              : h('div', { className: 'musee-home-nopapers' }, t('home.noPapers')),
          ),
          h('button', { type: 'button', className: 'musee-home-more', onClick: () => onOpenJournal(journal) }, `${t('home.viewAll')} →`),
        ),
      ),
    ),
  );
}

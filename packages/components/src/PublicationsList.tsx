import type { Authorship, Locale, Publication } from '@cv/core';
import type { ComponentRenderProps } from '@cv/layout-engine';
import type { ReactNode } from 'react';
import { Fragment } from 'react';
import { EntryUrl } from './EntryUrl.js';
import { formatIsoDate } from './format.js';
import { getLabel } from './labels.js';
import { optStr } from './optionUtils.js';
import { toHtml } from './renderHtml.js';

const AUTHORSHIP_MARKERS: Partial<Record<Authorship, string>> = {
  first: '*',
  shared_first: '†',
  second: '‡',
  last: '§',
};

function authorshipLabel(locale: Locale, authorship: Authorship): string {
  return getLabel(locale, `authorship_${authorship}` as const);
}

function presentParts(parts: ReactNode[]): ReactNode[] {
  return parts.filter((part) => part !== undefined && part !== null && part !== '');
}

function separated(parts: ReactNode[]): ReactNode {
  return presentParts(parts).map((part, i) => (
    <Fragment key={i}>
      {i > 0 && ' · '}
      {part}
    </Fragment>
  ));
}

function AuthorshipMarker({ authorship }: { authorship: Authorship | undefined }) {
  const marker = authorship && AUTHORSHIP_MARKERS[authorship];
  if (!marker) return null;
  return <sup className="cv-authorship-marker">{marker}</sup>;
}

function AuthorshipLegend({
  publications,
  locale,
}: {
  publications: readonly Publication[];
  locale: Locale;
}) {
  const used = new Set(publications.map((p) => p.authorship));
  const entries = (Object.entries(AUTHORSHIP_MARKERS) as [Authorship, string][]).filter(
    ([authorship]) => used.has(authorship),
  );
  if (entries.length === 0) return null;
  return (
    <p className="cv-authorship-legend">
      {separated(
        entries.map(([authorship, marker]) => (
          <span key={authorship}>
            <span className="cv-authorship-marker">{marker}</span>{' '}
            {authorshipLabel(locale, authorship)}
          </span>
        )),
      )}
    </p>
  );
}

/**
 *
 * @param root0
 * @returns React element displaying the publications list, or null if empty
 */
export function PublicationsList({ resume, locale, tokens, slot, options }: ComponentRenderProps) {
  if (resume.publications.length === 0) return null;

  const isMain = slot === 'main';
  const sectionCls = isMain ? 'cv-section cv-main-section' : 'cv-section';
  const showMarkers = optStr(options, 'authorshipDisplay', 'inline') === 'marker';

  const titleOf = (p: Publication) => (
    <>
      {p.name}
      {showMarkers && <AuthorshipMarker authorship={p.authorship} />}
    </>
  );
  const inlineAuthorship = (p: Publication) =>
    !showMarkers && p.authorship ? authorshipLabel(locale, p.authorship) : undefined;

  return (
    <section className={sectionCls}>
      <h2
        className={`cv-section-title cv-section-title--${optStr(tokens.options, 'sectionTitleStyle', 'uppercase-spaced')}`}
      >
        {getLabel(locale, 'publications')}
      </h2>
      {showMarkers && <AuthorshipLegend publications={resume.publications} locale={locale} />}
      {isMain ? (
        resume.publications.map((p) => {
          const org = presentParts([
            p.publisher,
            p.url && <EntryUrl url={p.url} />,
            inlineAuthorship(p),
          ]);
          return (
            <article key={p.id} className="cv-entry">
              <div className="cv-entry-date">{formatIsoDate(p.releaseDate, locale)}</div>
              <div className="cv-entry-head">
                <div className="cv-entry-title">{titleOf(p)}</div>
                {org.length > 0 && <div className="cv-entry-org">{separated(org)}</div>}
              </div>
              {p.summary && (
                <div
                  className="cv-entry-summary"
                  dangerouslySetInnerHTML={{ __html: toHtml(p.summary) }}
                />
              )}
            </article>
          );
        })
      ) : (
        <div className="cv-cert-sidebar">
          {resume.publications.map((p) => {
            const meta = presentParts([
              p.publisher,
              p.url && <EntryUrl url={p.url} />,
              p.releaseDate && formatIsoDate(p.releaseDate, locale),
              inlineAuthorship(p),
            ]);
            return (
              <div key={p.id} className="cv-cert-sidebar-item">
                <div className="cv-cert-sidebar-name">{titleOf(p)}</div>
                {meta.length > 0 && <div className="cv-cert-sidebar-meta">{separated(meta)}</div>}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

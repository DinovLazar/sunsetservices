import * as React from 'react';

type Locale = 'en' | 'es';

type ContentMetaProps = {
  /** Resolved label "By X" (the consumer adds the locale-specific "By"
   *  prefix from the `content.meta.by` translation, then passes the full
   *  string here — keeps this component locale-free). */
  bylineLabel?: string;
  /** ISO 8601 publish date. Renders the localized date if present. */
  publishedAt?: string;
  /** Already-formatted date string per locale (callers resolve once). */
  formattedDate?: string;
  /** Already-formatted reading-time label, e.g. "8 min read" / "8 min de lectura". */
  readingLabel: string;
  /** Optional category label — only rendered on the detail-page hero
   *  (`compact={false}`). */
  categoryLabel?: string;
  /** Compact variant — used inside `<ContentCard>`. Drops "By" and
   *  category, uses a tighter font size. */
  compact?: boolean;
  /** Locale — kept on the prop signature for future per-locale tweaks
   *  (e.g., RTL alignment). Currently the component is locale-free
   *  because callers resolve the formatted date themselves. */
  locale?: Locale;
};

/**
 * `ContentMeta` — Phase 1.18 §13.2.
 *
 * Inline meta-strip used in two layouts: in the detail-page hero
 * (`compact={false}`, full strip) and inside `<ContentCard>`
 * (`compact={true}`). Below 480px the strip stacks vertically and the
 * dot separators hide via `aria-hidden`.
 *
 * Accessible-name strategy: each datum is a normal `<span>`/`<time>` so
 * screen readers read them in document order. Dot separators carry
 * `aria-hidden="true"` so they don't read as text.
 */
export default function ContentMeta({
  bylineLabel,
  publishedAt,
  formattedDate,
  readingLabel,
  categoryLabel,
  compact = false,
}: ContentMetaProps) {
  const fontSize = compact ? '13px' : 'var(--text-body-sm)';
  return (
    <div
      className="content-meta"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 'var(--spacing-2)',
        fontSize,
        color: 'var(--color-text-muted)',
        lineHeight: 1.4,
      }}
    >
      {bylineLabel ? (
        <span className="content-meta__byline">{bylineLabel}</span>
      ) : null}
      {bylineLabel && (publishedAt || readingLabel || categoryLabel) ? (
        <span aria-hidden="true" className="content-meta__sep">·</span>
      ) : null}
      {publishedAt && formattedDate ? (
        <>
          <time
            dateTime={publishedAt}
            className="content-meta__date"
          >
            {formattedDate}
          </time>
          <span aria-hidden="true" className="content-meta__sep">·</span>
        </>
      ) : null}
      <span className="content-meta__reading">{readingLabel}</span>
      {!compact && categoryLabel ? (
        <>
          <span aria-hidden="true" className="content-meta__sep">·</span>
          <span className="content-meta__category">{categoryLabel}</span>
        </>
      ) : null}
    </div>
  );
}

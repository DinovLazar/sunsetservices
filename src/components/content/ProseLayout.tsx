import * as React from 'react';
import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {renderProse} from '@/lib/proseRenderer';
import ServiceAreaStrip from '@/components/sections/ServiceAreaStrip';
import TOC from './TOC.client';

type Locale = 'en' | 'es';

type ProseLayoutProps = {
  bodyMarkdown: string;
  locale: Locale;
  /** Optional inline cross-link to a service detail page. Renders one
   *  card between the second and third H2 (or after the first if there
   *  are ≤2 H2s). */
  inlineServiceCrossLink?: {
    audience: 'residential' | 'commercial' | 'hardscape';
    serviceSlug: string;
    /** Already-localized title for the linked service. */
    serviceTitle: string;
    /** Already-localized one-line description. */
    serviceTagline: string;
  };
  /** Blog only — renders `<ServiceAreaStrip excludeSlug={…} inline />`
   *  near the bottom of the body. */
  inlineLocationCity?: string;
};

/**
 * `<ProseLayout>` — Phase 1.18 §13.3.
 *
 * Renders the body of a Resource detail or Blog post:
 * - Centered max-width 720 prose column.
 * - Sticky right-rail TOC at `xl` (built from H2s in the body).
 * - Inline collapsed `<details>` TOC below `xl`.
 * - Inline cross-link card spliced between H2s where `inlineServiceCrossLink` is set.
 * - Inline `<ServiceAreaStrip inline />` near the body bottom where
 *   `inlineLocationCity` is set.
 *
 * Server component — the prose body is SSR HTML for SEO. Only the
 * `<TOC>` leaf is `"use client"`.
 */
export default async function ProseLayout({
  bodyMarkdown,
  locale,
  inlineServiceCrossLink,
  inlineLocationCity,
}: ProseLayoutProps) {
  const t = await getTranslations({locale, namespace: 'content'});
  const {html, toc} = renderProse(bodyMarkdown);

  // Locate splice points for the inline cross-link + location strip.
  const splitPattern = /<!-- prose-split-h2-(\d+) -->/g;
  const allMatches: Array<{index: number; n: number; full: string}> = [];
  let match: RegExpExecArray | null;
  while ((match = splitPattern.exec(html)) !== null) {
    allMatches.push({
      index: match.index,
      n: Number(match[1]),
      full: match[0],
    });
  }
  const endMarker = '<!-- prose-split-h2-end -->';
  const endIdx = html.lastIndexOf(endMarker);

  // Cross-link splice: between the second and third H2 if there are 3+
  // H2s (target = the boundary at index 1 in `allMatches`); after the
  // first if there are 2 H2s (boundary at index 0); fall through if 0
  // or 1.
  let crossLinkIdx: number | null = null;
  if (inlineServiceCrossLink && allMatches.length > 0) {
    const target = allMatches[Math.min(1, allMatches.length - 1)];
    crossLinkIdx = target.index + target.full.length;
  }

  const crossLinkPath =
    inlineServiceCrossLink &&
    `/${inlineServiceCrossLink.audience}/${inlineServiceCrossLink.serviceSlug}/`;

  // Build the assembled body in segments so we can intersperse JSX.
  const segments: React.ReactNode[] = [];
  let cursor = 0;

  if (crossLinkIdx !== null && inlineServiceCrossLink && crossLinkPath) {
    segments.push(
      <div
        key="prose-pre-cross"
        dangerouslySetInnerHTML={{__html: html.slice(cursor, crossLinkIdx)}}
      />,
    );
    cursor = crossLinkIdx;
    segments.push(
      <Link
        key="prose-cross-link"
        href={crossLinkPath}
        prefetch={false}
        className="prose__cross-link"
      >
        <p className="prose__cross-link__eyebrow m-0">{t('cross.eyebrow')}</p>
        <p className="prose__cross-link__title m-0">
          {inlineServiceCrossLink.serviceTitle}
        </p>
        <p className="prose__p m-0">
          {inlineServiceCrossLink.serviceTagline}
        </p>
        <span className="prose__cross-link__cta">{t('cross.linkLabel')}</span>
      </Link>,
    );
  }

  if (inlineLocationCity && endIdx > -1 && endIdx >= cursor) {
    segments.push(
      <div
        key="prose-pre-location"
        dangerouslySetInnerHTML={{__html: html.slice(cursor, endIdx)}}
      />,
    );
    cursor = endIdx + endMarker.length;
    segments.push(
      <ServiceAreaStrip
        key="prose-location-strip"
        excludeSlug={inlineLocationCity}
        inline
      />,
    );
  }

  // Push remainder.
  segments.push(
    <div
      key="prose-tail"
      dangerouslySetInnerHTML={{__html: html.slice(cursor)}}
    />,
  );

  return (
    <div
      className="prose-layout grid xl:grid-cols-[minmax(0,var(--container-prose))_240px] gap-x-12"
      style={{alignItems: 'start'}}
    >
      <article className="prose">
        <TOC
          items={toc}
          labelOnThisPage={t('toc.onThisPage')}
          labelTableOfContents={t('toc.label')}
          mode="inline"
        />
        {segments}
      </article>
      <TOC
        items={toc}
        labelOnThisPage={t('toc.onThisPage')}
        labelTableOfContents={t('toc.label')}
        mode="sticky"
      />
    </div>
  );
}

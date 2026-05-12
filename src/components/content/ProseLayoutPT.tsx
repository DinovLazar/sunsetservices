import * as React from 'react';
import {getTranslations} from 'next-intl/server';
import type {PortableTextBlock} from '@portabletext/react';
import {Link} from '@/i18n/navigation';
import ServiceAreaStrip from '@/components/sections/ServiceAreaStrip';
import TOC from './TOC.client';
import {
  PortableText,
  portableTextComponents,
} from './portableTextComponents';
import {extractHeadingsFromBlocks} from './portableTextHelpers';

type Locale = 'en' | 'es';

type ProseLayoutPTProps = {
  blocks: PortableTextBlock[];
  locale: Locale;
  /** Optional inline cross-link to a service detail page. */
  inlineServiceCrossLink?: {
    audience: 'residential' | 'commercial' | 'hardscape';
    serviceSlug: string;
    serviceTitle: string;
    serviceTagline: string;
  };
  /** Blog only — renders ServiceAreaStrip inline near the body bottom. */
  inlineLocationCity?: string;
};

/**
 * Phase 2.05 PortableText counterpart to Phase 1.18's `ProseLayout`.
 *
 * Splits the body blocks at H2 boundaries, inserting the inline cross-link
 * card between the second and third H2 (or after the first if there are
 * ≤2 H2s), and the inline `<ServiceAreaStrip>` after the last block when
 * `inlineLocationCity` is set. TOC is derived from H2 blocks at render
 * time; sticky + inline TOCs share the same data.
 */
export default async function ProseLayoutPT({
  blocks,
  locale,
  inlineServiceCrossLink,
  inlineLocationCity,
}: ProseLayoutPTProps) {
  const t = await getTranslations({locale, namespace: 'content'});
  const toc = extractHeadingsFromBlocks(blocks);

  // Compute the splice index in `blocks` (the index AFTER which we splice
  // the cross-link card). Mirror the Phase 1.18 rule: between 2nd and 3rd
  // H2 if there are 3+ H2s, after the first H2 if there are 2.
  const h2Indexes: number[] = [];
  blocks.forEach((b, i) => {
    if ((b as {style?: string}).style === 'h2') h2Indexes.push(i);
  });

  let crossLinkAfterIndex: number | null = null;
  if (inlineServiceCrossLink && h2Indexes.length > 0) {
    const targetH2 = h2Indexes[Math.min(1, h2Indexes.length - 1)];
    // Splice right before the NEXT block after the target H2 (or after
    // the H2 itself if it's the last block).
    crossLinkAfterIndex = targetH2;
  }

  const crossLinkPath =
    inlineServiceCrossLink &&
    `/${inlineServiceCrossLink.audience}/${inlineServiceCrossLink.serviceSlug}/`;

  // Build segments. We render the blocks via PortableText but break into
  // pre/post arrays at the splice point.
  const segments: React.ReactNode[] = [];

  if (crossLinkAfterIndex !== null && inlineServiceCrossLink && crossLinkPath) {
    const pre = blocks.slice(0, crossLinkAfterIndex + 1);
    const post = blocks.slice(crossLinkAfterIndex + 1);
    segments.push(
      <PortableText
        key="pre-cross"
        value={pre}
        components={portableTextComponents}
      />,
    );
    segments.push(
      <Link
        key="cross-link"
        href={crossLinkPath}
        prefetch={false}
        className="prose__cross-link"
      >
        <p className="prose__cross-link__eyebrow m-0">{t('cross.eyebrow')}</p>
        <p className="prose__cross-link__title m-0">
          {inlineServiceCrossLink.serviceTitle}
        </p>
        <p className="prose__p m-0">{inlineServiceCrossLink.serviceTagline}</p>
        <span className="prose__cross-link__cta">{t('cross.linkLabel')}</span>
      </Link>,
    );
    segments.push(
      <PortableText
        key="post-cross"
        value={post}
        components={portableTextComponents}
      />,
    );
  } else {
    segments.push(
      <PortableText
        key="prose-all"
        value={blocks}
        components={portableTextComponents}
      />,
    );
  }

  if (inlineLocationCity) {
    segments.push(
      <ServiceAreaStrip
        key="prose-location-strip"
        excludeSlug={inlineLocationCity}
        inline
      />,
    );
  }

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

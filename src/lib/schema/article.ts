/**
 * Article + BlogPosting + HowTo + ItemList JSON-LD payload builders —
 * Phase 1.18 §7.4.
 *
 * - `buildArticleSchema` / `buildBlogPostingSchema` share the same shape;
 *   the `@type` differs.
 * - `buildHowToSchema` adds `step: HowToStep[]` from
 *   {@link import('@/lib/howToSteps').extractHowToSteps}.
 * - `buildContentItemList` powers both the Resources index and Blog index
 *   schema using the same array that drives the visible card grid
 *   (handover §7.3 same-source rule).
 *
 * `BreadcrumbList` and `FAQPage` are reused from the existing
 * `@/lib/schema/breadcrumb` and `@/lib/schema/service` (Phase 1.08/1.09).
 */

import {BUSINESS_URL} from '@/lib/constants/business';
import {resolveAuthor} from './author';
import type {HowToStep} from '@/lib/howToSteps';

type Locale = 'en' | 'es';

function toAbsolute(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const safe = path.startsWith('/') ? path : `/${path}`;
  return `${BUSINESS_URL}${safe}`;
}

const LOCALE_TAG: Record<Locale, string> = {
  en: 'en-US',
  es: 'es-US',
};

export type ArticleSchemaInput = {
  type: 'Article' | 'BlogPosting';
  headline: string;
  description: string;
  imageUrl?: string;
  datePublished: string;
  dateModified?: string;
  byline: string;
  articleSection: string;
  wordCount: number;
  canonical: string;
  locale: Locale;
};

export function buildArticleSchema(input: ArticleSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': input.type,
    headline: input.headline,
    description: input.description,
    ...(input.imageUrl ? {image: toAbsolute(input.imageUrl)} : {}),
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    author: resolveAuthor(input.byline, input.locale),
    publisher: {'@id': `${BUSINESS_URL}/#organization`},
    mainEntityOfPage: toAbsolute(input.canonical),
    inLanguage: LOCALE_TAG[input.locale],
    articleSection: input.articleSection,
    wordCount: input.wordCount,
  };
}

export type HowToSchemaInput = Omit<ArticleSchemaInput, 'type'> & {
  steps: HowToStep[];
};

export function buildHowToSchema(input: HowToSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: input.headline,
    description: input.description,
    ...(input.imageUrl ? {image: toAbsolute(input.imageUrl)} : {}),
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    author: resolveAuthor(input.byline, input.locale),
    publisher: {'@id': `${BUSINESS_URL}/#organization`},
    mainEntityOfPage: toAbsolute(input.canonical),
    inLanguage: LOCALE_TAG[input.locale],
    step: input.steps.map((s, idx) => ({
      '@type': 'HowToStep',
      position: idx + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

export type ItemListEntry = {
  url: string;
  name: string;
};

export function buildContentItemList(
  entries: ItemListEntry[],
  listName: string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    itemListElement: entries.map((e, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      url: toAbsolute(e.url),
      name: e.name,
    })),
  };
}

/**
 * `FAQPage` schema built from already-localized `{q, a}` pairs. The
 * existing `buildFaqPageSchema` (Phase 1.08, in `./service`) is generic
 * over the services-data `FaqItem` shape; the content routes build their
 * own `{q, a}` arrays from the resource/blog seed shape, so we expose a
 * shape-agnostic helper here. Both helpers emit the same payload.
 */
export function buildContentFaqSchema(faq: Array<{q: string; a: string}>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((row) => ({
      '@type': 'Question',
      name: row.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: row.a,
      },
    })),
  };
}

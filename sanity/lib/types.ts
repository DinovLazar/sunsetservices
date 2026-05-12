/**
 * TypeScript return types for the GROQ query helpers in `./queries.ts`.
 *
 * All bilingual fields come back as `{en, es}` objects (with EN-coalesced
 * ES fallback baked in at the GROQ layer) so page-level consumers can use
 * the Phase 1.x `data.title[locale]` access pattern unchanged. Body fields
 * on blog + resource come back as `{en: PortableTextBlock[], es: …}`.
 *
 * Image fields are kept as the raw Sanity asset shape so `urlFor()` from
 * `./image.ts` can transform them. When the asset is absent (pre-Phase-2.04
 * state) the field is `null`.
 */

import type {PortableTextBlock} from '@portabletext/react';

/** Bilingual string/text (matches `localizedString` / `localizedText` shapes). */
export type Localized = {en: string; es: string};

/** Bilingual Portable Text body (matches `localizedBody`). */
export type LocalizedBody = {en: PortableTextBlock[]; es: PortableTextBlock[]};

/** Sanity asset reference for image fields. */
export type SanityImageAsset = {
  _type: 'image';
  asset: {_ref: string; _type: 'reference'};
  hotspot?: {x: number; y: number; height: number; width: number};
  crop?: {top: number; bottom: number; left: number; right: number};
} | null;

export type Locale = 'en' | 'es';
export type Audience = 'residential' | 'commercial' | 'hardscape';

// ---------- Project ----------

export type ProjectSummary = {
  _id: string;
  slug: string;
  title: Localized;
  shortDek: Localized;
  audience: Audience;
  citySlug: string | null;
  cityName: string | null;
  year: number | null;
  leadImage: SanityImageAsset;
  leadAlt: Localized;
};

export type ProjectDetail = ProjectSummary & {
  durationWeeks: number | null;
  narrativeHeading: Localized;
  narrative: Localized;
  materials: Localized[];
  hasBeforeAfter: boolean;
  beforeImage: SanityImageAsset;
  beforeAlt: Localized;
  afterImage: SanityImageAsset;
  afterAlt: Localized;
  gallery: {image: SanityImageAsset; alt: Localized}[];
  serviceSlugs: string[];
  serviceAudiences: Audience[];
};

// ---------- Blog ----------

export type BlogPostSummary = {
  _id: string;
  slug: string;
  title: Localized;
  dek: Localized;
  eyebrow: Localized;
  category: string;
  publishedAt: string;
  author: string;
  featuredImage: SanityImageAsset;
  featuredImageAlt: Localized;
};

export type BlogPostDetail = BlogPostSummary & {
  body: LocalizedBody;
  citySlug: string | null;
  crossLinkAudience: Audience | null;
  crossLinkServiceSlug: string | null;
  seo: {title: Localized; description: Localized} | null;
};

// ---------- Resource ----------

export type ResourceSummary = {
  _id: string;
  slug: string;
  title: Localized;
  dek: Localized;
  eyebrow: Localized;
  category: string;
  schemaType: 'Article' | 'HowTo';
  featuredImage: SanityImageAsset;
  featuredImageAlt: Localized;
};

export type ResourceDetail = ResourceSummary & {
  body: LocalizedBody;
  crossLinkAudience: Audience | null;
  crossLinkServiceSlug: string | null;
  seo: {title: Localized; description: Localized} | null;
};

// ---------- FAQ ----------

export type FaqEntry = {
  _id: string;
  question: Localized;
  answer: Localized;
  order: number;
};

// ---------- Review ----------

export type ReviewEntry = {
  _id: string;
  quote: Localized;
  attribution: Localized;
  rating: number;
  placeholder: boolean;
};

/**
 * TypeScript return types for the GROQ query helpers in `./queries.ts`.
 *
 * All fields that are bilingual in the Studio (`localizedString`,
 * `localizedText`, `localizedBody`) come back already projected to a
 * single string for the requested locale via `coalesce(field[$locale], field.en)`,
 * so the page-level consumers see plain `string` (or PortableText block
 * arrays for body fields) instead of `{en, es}` objects.
 *
 * Image fields are kept as the raw Sanity image asset shape so the
 * `urlFor()` helper from `./image.ts` can transform them. When the asset
 * is absent (pre-Phase-2.04 state) the field is `null`.
 */

import type {PortableTextBlock} from '@portabletext/react';

/** Sanity asset reference. */
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
  title: string;
  shortDek: string;
  audience: Audience;
  citySlug: string | null;
  cityName: string | null;
  year: number | null;
  leadImage: SanityImageAsset;
  leadAlt: string;
};

export type ProjectDetail = ProjectSummary & {
  narrativeHeading: string;
  narrative: string;
  materials: string[];
  hasBeforeAfter: boolean;
  beforeImage: SanityImageAsset;
  beforeAlt: string;
  afterImage: SanityImageAsset;
  afterAlt: string;
  gallery: {image: SanityImageAsset; alt: string}[];
  serviceSlugs: string[];
  serviceAudiences: Audience[];
};

// ---------- Blog ----------

export type BlogPostSummary = {
  _id: string;
  slug: string;
  title: string;
  dek: string;
  eyebrow: string;
  category: string;
  publishedAt: string;
  author: string;
  featuredImage: SanityImageAsset;
  featuredImageAlt: string;
};

export type BlogPostDetail = BlogPostSummary & {
  body: PortableTextBlock[];
  citySlug: string | null;
  crossLinkAudience: Audience | null;
  crossLinkServiceSlug: string | null;
  seo: {title: string; description: string} | null;
};

// ---------- Resource ----------

export type ResourceSummary = {
  _id: string;
  slug: string;
  title: string;
  dek: string;
  eyebrow: string;
  category: string;
  schemaType: 'Article' | 'HowTo';
  featuredImage: SanityImageAsset;
  featuredImageAlt: string;
};

export type ResourceDetail = ResourceSummary & {
  body: PortableTextBlock[];
  crossLinkAudience: Audience | null;
  crossLinkServiceSlug: string | null;
  seo: {title: string; description: string} | null;
};

// ---------- FAQ ----------

export type FaqEntry = {
  _id: string;
  question: string;
  answer: string;
  order: number;
};

// ---------- Review ----------

export type ReviewEntry = {
  _id: string;
  quote: string;
  attribution: string;
  rating: number;
  placeholder: boolean;
};

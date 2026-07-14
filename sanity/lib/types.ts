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
  /**
   * Phase M.10c addendum (2026-05-27) — added to the summary projection so
   * the projects index page can compute each project's division via
   * `getProjectDivision()` (which needs the first service slug to look up
   * the corresponding service's `division`).
   */
  serviceSlugs: string[];
};

/** Phase M.18 — one photo of a project photo set. */
export type ProjectPhoto = {image: SanityImageAsset; alt: Localized};

/** Phase M.18 — one row of the at-a-glance strip. */
export type ProjectFact = {label: Localized; value: Localized};

/** Phase M.18 — one FAQ entry (also emitted as FAQPage JSON-LD). */
export type ProjectFaqEntry = {question: Localized; answer: Localized};

/** Phase M.18 — one internal link out of a project page. */
export type ProjectLink = {label: Localized; href: string};

export type ProjectDetail = ProjectSummary & {
  durationWeeks: number | null;
  narrativeHeading: Localized;
  narrative: Localized;
  materials: Localized[];
  materialsNote: Localized;
  hasBeforeAfter: boolean;
  beforeImage: SanityImageAsset;
  beforeAlt: Localized;
  afterImage: SanityImageAsset;
  afterAlt: Localized;
  gallery: ProjectPhoto[];
  serviceAudiences: Audience[];

  // ───────────────── Phase M.18 — the PSS-002 project feature ─────────────────
  // Every one of these is optional in Sanity; the projection coalesces them to
  // empty strings / empty arrays, and the page renders only what is filled in.
  atAGlance: ProjectFact[];
  overview: Localized;
  siteHeading: Localized;
  site: Localized;
  sitePhotos: ProjectPhoto[];
  approachHeading: Localized;
  approach: Localized;
  approachPhotos: ProjectPhoto[];
  workHeading: Localized;
  work: Localized;
  workPhotos: ProjectPhoto[];
  featureHeading: Localized;
  feature: Localized;
  featurePhotos: ProjectPhoto[];
  resultHeading: Localized;
  result: Localized;
  resultPhotos: ProjectPhoto[];
  durabilityHeading: Localized;
  durability: Localized;
  testimonialStatement: Localized;
  testimonialQuote: Localized;
  testimonialAttribution: string;
  faq: ProjectFaqEntry[];
  internalLinks: ProjectLink[];
  keywords: string[];
  seo: {title: Localized; description: Localized};
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

/**
 * Phase B.04 — shape returned by `getPublishedReviewsForCity`. Same fields
 * as `ReviewEntry` minus `placeholder` (always false by filter) plus the
 * `source` + `publishedAt` fields the `Review` JSON-LD builder needs.
 */
export type PublishedReviewEntry = {
  _id: string;
  quote: Localized;
  attribution: Localized;
  rating: number;
  source: 'google' | 'manual';
  publishedAt: string;
};

/**
 * Phase M.16 — shape returned by `getPublishedReviews` for the homepage trust
 * band's real-Google-reviews slot. Extends the published-review shape with the
 * optional source URL so a card can link out to the original review.
 */
export type HomeReviewEntry = PublishedReviewEntry & {
  sourceUrl: string | null;
};

/**
 * GROQ query helpers for Phase 2.05 page wiring.
 *
 * Conventions:
 * - Bilingual fields (`localizedString`, `localizedText`, `localizedBody`)
 *   come back as `{en, es}` objects with EN-coalesced ES fallback baked
 *   in at the GROQ layer: `"title": {"en": coalesce(title.en, ""),
 *   "es": coalesce(title.es, title.en, "")}`. Page-level consumers can
 *   continue to use the Phase 1.x `data.title[locale]` access pattern.
 * - Every fetch sets `next: { revalidate: 1800 }` so per-route ISR
 *   (30 min) aligns with `export const revalidate = 1800` on every page.
 *   Phase 2.05+ will swap this for webhook-driven revalidation.
 * - Functions return plain serializable objects suitable for passing
 *   across the Server Component → Client Component boundary.
 */

import {sanityClient} from './client';
import {writeClient} from './write-client';
import type {
  Audience,
  BlogPostDetail,
  BlogPostSummary,
  FaqEntry,
  Localized,
  LocalizedBody,
  ProjectDetail,
  ProjectSummary,
  PublishedReviewEntry,
  ResourceDetail,
  ResourceSummary,
  ReviewEntry,
} from './types';

const REVALIDATE = 1800; // 30 minutes
const FETCH_OPTS = {next: {revalidate: REVALIDATE}} as const;

// GROQ snippet — produces `{en, es}` for a string/text field with ES falling
// back to EN. Wrapped in a string-template helper so each field reads
// uniformly:  ${biling('title')}, ${biling('dek')}, etc.
const biling = (field: string): string =>
  `"${field}": {"en": coalesce(${field}.en, ""), "es": coalesce(${field}.es, ${field}.en, "")}`;

const bilingBody = (field: string): string =>
  `"${field}": {"en": coalesce(${field}.en, []), "es": coalesce(${field}.es, ${field}.en, [])}`;

// ---------- Projects ----------

const PROJECT_SUMMARY_PROJECTION = `{
  _id,
  "slug": slug.current,
  ${biling('title')},
  ${biling('shortDek')},
  audience,
  "citySlug": city->slug.current,
  "cityName": city->name,
  year,
  leadImage,
  ${biling('leadAlt')}
}`;

const PROJECT_DETAIL_PROJECTION = `{
  _id,
  "slug": slug.current,
  ${biling('title')},
  ${biling('shortDek')},
  audience,
  "citySlug": city->slug.current,
  "cityName": city->name,
  year,
  durationWeeks,
  leadImage,
  ${biling('leadAlt')},
  ${biling('narrativeHeading')},
  ${biling('narrative')},
  "materials": coalesce(materials[]{ "en": coalesce(en, ""), "es": coalesce(es, en, "") }, []),
  hasBeforeAfter,
  beforeImage,
  ${biling('beforeAlt')},
  afterImage,
  ${biling('afterAlt')},
  "gallery": coalesce(gallery[]{ image, "alt": {"en": coalesce(alt.en, ""), "es": coalesce(alt.es, alt.en, "")} }, []),
  "serviceSlugs": services[]->slug.current,
  "serviceAudiences": services[]->audience
}`;

export async function getAllProjects(): Promise<ProjectSummary[]> {
  return sanityClient.fetch(
    `*[_type == "project"] | order(year desc, slug asc) ${PROJECT_SUMMARY_PROJECTION}`,
    {},
    FETCH_OPTS,
  );
}

export async function getAllProjectSlugs(): Promise<string[]> {
  return sanityClient.fetch(
    `*[_type == "project" && defined(slug.current)].slug.current`,
    {},
    FETCH_OPTS,
  );
}

/**
 * Phase B.05 sitemap helper — returns `{slug, _updatedAt}` so the sitemap
 * can stamp per-entry `lastModified`. Kept separate from the slug-only
 * helper above so the `generateStaticParams` call sites that just want
 * strings stay unchanged.
 */
export async function getAllProjectSlugsForSitemap(): Promise<
  Array<{slug: string; updatedAt: string}>
> {
  return sanityClient.fetch(
    `*[_type == "project" && defined(slug.current)]{
      "slug": slug.current,
      "updatedAt": _updatedAt
    }`,
    {},
    FETCH_OPTS,
  );
}

export async function getProjectBySlug(slug: string): Promise<ProjectDetail | null> {
  return sanityClient.fetch(
    `*[_type == "project" && slug.current == $slug][0] ${PROJECT_DETAIL_PROJECTION}`,
    {slug},
    FETCH_OPTS,
  );
}

// ---------- Blog posts ----------

const BLOG_SUMMARY_PROJECTION = `{
  _id,
  "slug": slug.current,
  ${biling('title')},
  ${biling('dek')},
  ${biling('eyebrow')},
  category,
  publishedAt,
  "author": coalesce(author, "Sunset Services Team"),
  featuredImage,
  ${biling('featuredImageAlt')}
}`;

const BLOG_DETAIL_PROJECTION = `{
  _id,
  "slug": slug.current,
  ${biling('title')},
  ${biling('dek')},
  ${biling('eyebrow')},
  category,
  publishedAt,
  "author": coalesce(author, "Sunset Services Team"),
  featuredImage,
  ${biling('featuredImageAlt')},
  ${bilingBody('body')},
  "citySlug": citySlug,
  crossLinkAudience,
  crossLinkServiceSlug,
  "seo": select(
    defined(seo) => {
      "title": {"en": coalesce(seo.title.en, ""), "es": coalesce(seo.title.es, seo.title.en, "")},
      "description": {"en": coalesce(seo.description.en, ""), "es": coalesce(seo.description.es, seo.description.en, "")}
    },
    null
  )
}`;

export async function getAllBlogPosts(): Promise<BlogPostSummary[]> {
  return sanityClient.fetch(
    `*[_type == "blogPost"] | order(publishedAt desc) ${BLOG_SUMMARY_PROJECTION}`,
    {},
    FETCH_OPTS,
  );
}

export async function getAllBlogPostSlugs(): Promise<string[]> {
  return sanityClient.fetch(
    `*[_type == "blogPost" && defined(slug.current)].slug.current`,
    {},
    FETCH_OPTS,
  );
}

export async function getAllBlogPostSlugsForSitemap(): Promise<
  Array<{slug: string; updatedAt: string}>
> {
  return sanityClient.fetch(
    `*[_type == "blogPost" && defined(slug.current)]{
      "slug": slug.current,
      "updatedAt": coalesce(_updatedAt, publishedAt)
    }`,
    {},
    FETCH_OPTS,
  );
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPostDetail | null> {
  return sanityClient.fetch(
    `*[_type == "blogPost" && slug.current == $slug][0] ${BLOG_DETAIL_PROJECTION}`,
    {slug},
    FETCH_OPTS,
  );
}

// ---------- Resource articles ----------

const RESOURCE_SUMMARY_PROJECTION = `{
  _id,
  "slug": slug.current,
  ${biling('title')},
  ${biling('dek')},
  ${biling('eyebrow')},
  category,
  schemaType,
  featuredImage,
  ${biling('featuredImageAlt')}
}`;

const RESOURCE_DETAIL_PROJECTION = `{
  _id,
  "slug": slug.current,
  ${biling('title')},
  ${biling('dek')},
  ${biling('eyebrow')},
  category,
  schemaType,
  featuredImage,
  ${biling('featuredImageAlt')},
  ${bilingBody('body')},
  crossLinkAudience,
  crossLinkServiceSlug,
  "seo": select(
    defined(seo) => {
      "title": {"en": coalesce(seo.title.en, ""), "es": coalesce(seo.title.es, seo.title.en, "")},
      "description": {"en": coalesce(seo.description.en, ""), "es": coalesce(seo.description.es, seo.description.en, "")}
    },
    null
  )
}`;

export async function getAllResources(): Promise<ResourceSummary[]> {
  return sanityClient.fetch(
    `*[_type == "resourceArticle"] | order(category asc, slug asc) ${RESOURCE_SUMMARY_PROJECTION}`,
    {},
    FETCH_OPTS,
  );
}

export async function getAllResourceSlugs(): Promise<string[]> {
  return sanityClient.fetch(
    `*[_type == "resourceArticle" && defined(slug.current)].slug.current`,
    {},
    FETCH_OPTS,
  );
}

export async function getAllResourceSlugsForSitemap(): Promise<
  Array<{slug: string; updatedAt: string}>
> {
  return sanityClient.fetch(
    `*[_type == "resourceArticle" && defined(slug.current)]{
      "slug": slug.current,
      "updatedAt": _updatedAt
    }`,
    {},
    FETCH_OPTS,
  );
}

export async function getResourceBySlug(slug: string): Promise<ResourceDetail | null> {
  return sanityClient.fetch(
    `*[_type == "resourceArticle" && slug.current == $slug][0] ${RESOURCE_DETAIL_PROJECTION}`,
    {slug},
    FETCH_OPTS,
  );
}

// ---------- FAQs ----------

const FAQ_PROJECTION = `{
  _id,
  ${biling('question')},
  ${biling('answer')},
  order
}`;

export async function getFaqsForService(audience: Audience, slug: string): Promise<FaqEntry[]> {
  return sanityClient.fetch(
    `*[_type == "faq" && scope == $scope] | order(order asc) ${FAQ_PROJECTION}`,
    {scope: `service:${audience}:${slug}`},
    FETCH_OPTS,
  );
}

export async function getFaqsForCity(citySlug: string): Promise<FaqEntry[]> {
  return sanityClient.fetch(
    `*[_type == "faq" && scope == $scope] | order(order asc) ${FAQ_PROJECTION}`,
    {scope: `city:${citySlug}`},
    FETCH_OPTS,
  );
}

export async function getFaqsForAudience(audience: Audience): Promise<FaqEntry[]> {
  return sanityClient.fetch(
    `*[_type == "faq" && scope == $scope] | order(order asc) ${FAQ_PROJECTION}`,
    {scope: `audience:${audience}`},
    FETCH_OPTS,
  );
}

export async function getFaqsForBlog(slug: string): Promise<FaqEntry[]> {
  return sanityClient.fetch(
    `*[_type == "faq" && scope == $scope] | order(order asc) ${FAQ_PROJECTION}`,
    {scope: `blog:${slug}`},
    FETCH_OPTS,
  );
}

export async function getFaqsForResource(slug: string): Promise<FaqEntry[]> {
  return sanityClient.fetch(
    `*[_type == "faq" && scope == $scope] | order(order asc) ${FAQ_PROJECTION}`,
    {scope: `resource:${slug}`},
    FETCH_OPTS,
  );
}

// ---------- Chat-specific projections (Phase 2.09) ----------
//
// These helpers narrow the index projections to just what the chat
// knowledge-base digest needs. The full service/location/FAQ helpers above
// over-fetch (they're designed for full-page rendering); these slimmer
// projections keep the digest assembly cheap. Returns strings already
// resolved for the target locale with EN fallback.

export type ChatServiceEntry = {
  audience: Audience;
  slug: string;
  title: string;
  dek: string;
  pricingMode: 'explainer' | 'price';
  priceIncludes: string[];
};

export type ChatLocationEntry = {
  slug: string;
  name: string;
  tagline: string;
  featuredServiceSlugs: string[];
};

export type ChatFaqEntry = {
  scope: string;
  q: string;
  a: string;
};

export async function getAllServicesForChat(locale: 'en' | 'es'): Promise<ChatServiceEntry[]> {
  return sanityClient.fetch(
    `*[_type == "service"] | order(audience asc, order asc, slug asc) {
      audience,
      "slug": slug.current,
      "title": coalesce(title.${locale}, title.en, ""),
      "dek": coalesce(dek.${locale}, dek.en, ""),
      "pricingMode": coalesce(pricingMode, "explainer"),
      "priceIncludes": coalesce(priceIncludes[]{ "v": coalesce(${locale}, en, "") }.v, [])
    }`,
    {},
    FETCH_OPTS,
  );
}

export async function getAllLocationsForChat(locale: 'en' | 'es'): Promise<ChatLocationEntry[]> {
  return sanityClient.fetch(
    `*[_type == "location"] | order(name asc) {
      "slug": slug.current,
      name,
      "tagline": coalesce(tagline.${locale}, tagline.en, ""),
      "featuredServiceSlugs": coalesce(featuredServices[]->slug.current, [])
    }`,
    {},
    FETCH_OPTS,
  );
}

/**
 * Fetch a small, well-mixed FAQ set for the chat digest.
 *
 * Strategy: 3 FAQs each from the 3 audience scopes (residential / commercial /
 * hardscape) = 9, plus the first service-scoped FAQ to round out to 10.
 * The order-by-scope keeps the result deterministic across requests.
 */
export async function getTopFaqsForChat(locale: 'en' | 'es', limit: number = 10): Promise<ChatFaqEntry[]> {
  const PER_AUDIENCE = 3;
  const audienceScopes = ['audience:residential', 'audience:commercial', 'audience:hardscape'];

  const audienceResults: ChatFaqEntry[][] = await Promise.all(
    audienceScopes.map((scope) =>
      sanityClient.fetch(
        `*[_type == "faq" && scope == $scope] | order(order asc, _id asc)[0...$n] {
          scope,
          "q": coalesce(question.${locale}, question.en, ""),
          "a": coalesce(answer.${locale}, answer.en, "")
        }`,
        {scope, n: PER_AUDIENCE},
        FETCH_OPTS,
      ),
    ),
  );

  let merged = audienceResults.flat();

  // Top up from service-scoped FAQs if we're under the limit.
  if (merged.length < limit) {
    const topUp: ChatFaqEntry[] = await sanityClient.fetch(
      `*[_type == "faq" && scope match "service:*"] | order(scope asc, order asc, _id asc)[0...$n] {
        scope,
        "q": coalesce(question.${locale}, question.en, ""),
        "a": coalesce(answer.${locale}, answer.en, "")
      }`,
      {n: limit - merged.length},
      FETCH_OPTS,
    );
    merged = merged.concat(topUp);
  }

  return merged.slice(0, limit);
}

// ---------- Reviews ----------

export async function getReviewsForCity(citySlug: string): Promise<ReviewEntry[]> {
  return sanityClient.fetch(
    `*[_type == "review" && city._ref == $cityId] | order(_createdAt asc) {
      _id,
      ${biling('quote')},
      ${biling('attribution')},
      rating,
      "placeholder": coalesce(placeholder, false)
    }`,
    {cityId: `location-${citySlug}`},
    FETCH_OPTS,
  );
}

/**
 * Phase B.04 — `Review` + `AggregateRating` schema source.
 *
 * Same shape as `getReviewsForCity` but with two additional fields the JSON-LD
 * builder needs (`source`, `publishedAt`) and a hard filter on placeholders.
 * Phase 2.05's seed testimonials carry `placeholder: true`; only real reviews
 * published via the Phase 2.14 + 2.16 daily cron qualify for structured data.
 *
 * Today this returns `[]` for every city — no real reviews exist yet. The
 * cron lands when Google's GBP API approval clears, and at that point this
 * helper naturally starts returning real entries with no further code change.
 *
 * The `locale` argument is accepted but the underlying GROQ projection
 * already returns bilingual `{en, es}` strings; the consumer picks the
 * matching locale at the schema-build step.
 */
export async function getPublishedReviewsForCity(
  citySlug: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _locale: 'en' | 'es',
): Promise<PublishedReviewEntry[]> {
  return sanityClient.fetch(
    `*[_type == "review" && city._ref == $cityId && coalesce(placeholder, false) == false] | order(coalesce(publishedAt, _createdAt) desc) {
      _id,
      ${biling('quote')},
      ${biling('attribution')},
      rating,
      "source": coalesce(source, "manual"),
      "publishedAt": coalesce(publishedAt, _createdAt)
    }`,
    {cityId: `location-${citySlug}`},
    FETCH_OPTS,
  );
}

// ---------- Newsletter subscriber lookup (Phase B.07) ----------
//
// Used by the unsubscribe page + API route to resolve a token-bearing URL to
// its subscriber. Bypasses the CDN (writeClient, useCdn:false) so a freshly-
// created subscriber's welcome-email link works inside the 60-second CDN
// window, and so a freshly-flipped `unsubscribed` value reflects immediately
// on the same-URL refresh.
//
// Pre-flight length check rejects obviously-malformed tokens (real UUIDs are
// 36 chars) before issuing the GROQ query — saves quota on bot traffic.

export type NewsletterSubscriberLookup = {
  _id: string;
  email: string;
  locale: 'en' | 'es';
  unsubscribed: boolean;
};

export async function getSubscriberByToken(
  token: string,
): Promise<NewsletterSubscriberLookup | null> {
  if (!token || typeof token !== 'string' || token.length < 20 || token.length > 100) {
    return null;
  }
  // GROQ param name is `tk` (NOT `token`) — `@sanity/client`'s `QueryParams`
  // type marks `token` as `never` (deprecated reserved key, flagged to catch
  // a common mistake of passing a Sanity-client option as a GROQ param).
  const raw = await writeClient.fetch<{
    _id: string;
    email: string;
    locale: 'en' | 'es';
    unsubscribed?: boolean;
  } | null>(
    `*[_type == "newsletterSubscriber" && unsubscribeToken == $tk][0]{_id, email, locale, unsubscribed}`,
    {tk: token},
  );
  if (!raw) return null;
  return {
    _id: raw._id,
    email: raw.email,
    locale: raw.locale,
    unsubscribed: raw.unsubscribed === true,
  };
}

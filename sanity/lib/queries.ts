/**
 * GROQ query helpers for Phase 2.05 page wiring.
 *
 * Conventions:
 * - Every helper takes a `locale: 'en' | 'es'` argument and projects bilingual
 *   fields to a single string via `coalesce(field[$locale], field.en)` so the
 *   consumer sees a flat `string` instead of a `{en, es}` object. The same
 *   pattern applies to `localizedBody` body fields, which come back as plain
 *   PortableText block arrays.
 * - All fetches set `next: { revalidate: 1800 }` so per-route ISR (30 min)
 *   aligns with the `export const revalidate = 1800` on every Sanity-reading
 *   page. Once Phase 2.05+ wires Sanity webhooks, this is the surface the
 *   webhook revalidates against.
 * - Functions return plain serializable objects suitable for passing across
 *   the Server Component → Client Component boundary.
 */

import {sanityClient} from './client';
import type {
  Audience,
  BlogPostDetail,
  BlogPostSummary,
  FaqEntry,
  Locale,
  ProjectDetail,
  ProjectSummary,
  ResourceDetail,
  ResourceSummary,
  ReviewEntry,
} from './types';

const REVALIDATE = 1800; // 30 minutes
const FETCH_OPTS = {next: {revalidate: REVALIDATE}} as const;

// ---------- Projects ----------

const PROJECT_SUMMARY_PROJECTION = `{
  _id,
  "slug": slug.current,
  "title": coalesce(title[$locale], title.en),
  "shortDek": coalesce(shortDek[$locale], shortDek.en, ""),
  audience,
  "citySlug": city->slug.current,
  "cityName": city->name,
  year,
  leadImage,
  "leadAlt": coalesce(leadAlt[$locale], leadAlt.en, "")
}`;

const PROJECT_DETAIL_PROJECTION = `{
  _id,
  "slug": slug.current,
  "title": coalesce(title[$locale], title.en),
  "shortDek": coalesce(shortDek[$locale], shortDek.en, ""),
  audience,
  "citySlug": city->slug.current,
  "cityName": city->name,
  year,
  leadImage,
  "leadAlt": coalesce(leadAlt[$locale], leadAlt.en, ""),
  "narrativeHeading": coalesce(narrativeHeading[$locale], narrativeHeading.en, ""),
  "narrative": coalesce(narrative[$locale], narrative.en, ""),
  "materials": coalesce(materials[].en, []),
  hasBeforeAfter,
  beforeImage,
  "beforeAlt": coalesce(beforeAlt[$locale], beforeAlt.en, ""),
  afterImage,
  "afterAlt": coalesce(afterAlt[$locale], afterAlt.en, ""),
  "gallery": coalesce(gallery[]{ image, "alt": coalesce(alt[$locale], alt.en, "") }, []),
  "serviceSlugs": services[]->slug.current,
  "serviceAudiences": services[]->audience
}`;

export async function getAllProjects(locale: Locale): Promise<ProjectSummary[]> {
  return sanityClient.fetch(
    `*[_type == "project"] | order(year desc, slug asc) ${PROJECT_SUMMARY_PROJECTION}`,
    {locale},
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

export async function getProjectBySlug(
  slug: string,
  locale: Locale,
): Promise<ProjectDetail | null> {
  return sanityClient.fetch(
    `*[_type == "project" && slug.current == $slug][0] ${PROJECT_DETAIL_PROJECTION}`,
    {slug, locale},
    FETCH_OPTS,
  );
}

// ---------- Blog posts ----------

const BLOG_SUMMARY_PROJECTION = `{
  _id,
  "slug": slug.current,
  "title": coalesce(title[$locale], title.en),
  "dek": coalesce(dek[$locale], dek.en, ""),
  "eyebrow": coalesce(eyebrow[$locale], eyebrow.en, ""),
  category,
  publishedAt,
  "author": coalesce(author, "Sunset Services Team"),
  featuredImage,
  "featuredImageAlt": coalesce(featuredImageAlt[$locale], featuredImageAlt.en, "")
}`;

const BLOG_DETAIL_PROJECTION = `{
  _id,
  "slug": slug.current,
  "title": coalesce(title[$locale], title.en),
  "dek": coalesce(dek[$locale], dek.en, ""),
  "eyebrow": coalesce(eyebrow[$locale], eyebrow.en, ""),
  category,
  publishedAt,
  "author": coalesce(author, "Sunset Services Team"),
  featuredImage,
  "featuredImageAlt": coalesce(featuredImageAlt[$locale], featuredImageAlt.en, ""),
  "body": coalesce(body[$locale], body.en, []),
  "citySlug": citySlug,
  crossLinkAudience,
  crossLinkServiceSlug,
  "seo": select(
    defined(seo) => {
      "title": coalesce(seo.title[$locale], seo.title.en, ""),
      "description": coalesce(seo.description[$locale], seo.description.en, "")
    },
    null
  )
}`;

export async function getAllBlogPosts(locale: Locale): Promise<BlogPostSummary[]> {
  return sanityClient.fetch(
    `*[_type == "blogPost"] | order(publishedAt desc) ${BLOG_SUMMARY_PROJECTION}`,
    {locale},
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

export async function getBlogPostBySlug(
  slug: string,
  locale: Locale,
): Promise<BlogPostDetail | null> {
  return sanityClient.fetch(
    `*[_type == "blogPost" && slug.current == $slug][0] ${BLOG_DETAIL_PROJECTION}`,
    {slug, locale},
    FETCH_OPTS,
  );
}

// ---------- Resource articles ----------

const RESOURCE_SUMMARY_PROJECTION = `{
  _id,
  "slug": slug.current,
  "title": coalesce(title[$locale], title.en),
  "dek": coalesce(dek[$locale], dek.en, ""),
  "eyebrow": coalesce(eyebrow[$locale], eyebrow.en, ""),
  category,
  schemaType,
  featuredImage,
  "featuredImageAlt": coalesce(featuredImageAlt[$locale], featuredImageAlt.en, "")
}`;

const RESOURCE_DETAIL_PROJECTION = `{
  _id,
  "slug": slug.current,
  "title": coalesce(title[$locale], title.en),
  "dek": coalesce(dek[$locale], dek.en, ""),
  "eyebrow": coalesce(eyebrow[$locale], eyebrow.en, ""),
  category,
  schemaType,
  featuredImage,
  "featuredImageAlt": coalesce(featuredImageAlt[$locale], featuredImageAlt.en, ""),
  "body": coalesce(body[$locale], body.en, []),
  crossLinkAudience,
  crossLinkServiceSlug,
  "seo": select(
    defined(seo) => {
      "title": coalesce(seo.title[$locale], seo.title.en, ""),
      "description": coalesce(seo.description[$locale], seo.description.en, "")
    },
    null
  )
}`;

export async function getAllResources(locale: Locale): Promise<ResourceSummary[]> {
  return sanityClient.fetch(
    `*[_type == "resourceArticle"] | order(category asc, slug asc) ${RESOURCE_SUMMARY_PROJECTION}`,
    {locale},
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

export async function getResourceBySlug(
  slug: string,
  locale: Locale,
): Promise<ResourceDetail | null> {
  return sanityClient.fetch(
    `*[_type == "resourceArticle" && slug.current == $slug][0] ${RESOURCE_DETAIL_PROJECTION}`,
    {slug, locale},
    FETCH_OPTS,
  );
}

// ---------- FAQs ----------

const FAQ_PROJECTION = `{
  _id,
  "question": coalesce(question[$locale], question.en, ""),
  "answer": coalesce(answer[$locale], answer.en, ""),
  order
}`;

export async function getFaqsForService(
  audience: Audience,
  slug: string,
  locale: Locale,
): Promise<FaqEntry[]> {
  return sanityClient.fetch(
    `*[_type == "faq" && scope == $scope] | order(order asc) ${FAQ_PROJECTION}`,
    {scope: `service:${audience}:${slug}`, locale},
    FETCH_OPTS,
  );
}

export async function getFaqsForCity(
  citySlug: string,
  locale: Locale,
): Promise<FaqEntry[]> {
  return sanityClient.fetch(
    `*[_type == "faq" && scope == $scope] | order(order asc) ${FAQ_PROJECTION}`,
    {scope: `city:${citySlug}`, locale},
    FETCH_OPTS,
  );
}

export async function getFaqsForAudience(
  audience: Audience,
  locale: Locale,
): Promise<FaqEntry[]> {
  return sanityClient.fetch(
    `*[_type == "faq" && scope == $scope] | order(order asc) ${FAQ_PROJECTION}`,
    {scope: `audience:${audience}`, locale},
    FETCH_OPTS,
  );
}

// ---------- Reviews ----------

export async function getReviewsForCity(
  citySlug: string,
  locale: Locale,
): Promise<ReviewEntry[]> {
  return sanityClient.fetch(
    `*[_type == "review" && city._ref == $cityId] | order(_createdAt asc) {
      _id,
      "quote": coalesce(quote[$locale], quote.en, ""),
      "attribution": coalesce(attribution[$locale], attribution.en, ""),
      rating,
      "placeholder": coalesce(placeholder, false)
    }`,
    {cityId: `location-${citySlug}`, locale},
    FETCH_OPTS,
  );
}

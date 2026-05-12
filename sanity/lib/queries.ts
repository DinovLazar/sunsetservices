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
import type {
  Audience,
  BlogPostDetail,
  BlogPostSummary,
  FaqEntry,
  Localized,
  LocalizedBody,
  ProjectDetail,
  ProjectSummary,
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

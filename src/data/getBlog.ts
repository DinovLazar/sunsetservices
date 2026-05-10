/**
 * Blog loaders — Phase 1.18 §4.3.
 *
 * Stamps `wordCount` + `readingMinutes` onto every post (computed from the
 * EN body; same rationale as `getResources.ts`). Posts are returned newest
 * first by default.
 */

import {BLOG_POSTS, type BlogPostEntry} from './blog';
import {estimateReadingTime} from '@/lib/readingTime';

function stamp(entry: BlogPostEntry): BlogPostEntry {
  if (entry.wordCount && entry.readingMinutes) return entry;
  const {wordCount, readingMinutes} = estimateReadingTime(entry.body.en);
  return {...entry, wordCount, readingMinutes};
}

export function getAllBlogPosts(): BlogPostEntry[] {
  return BLOG_POSTS.map(stamp).sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );
}

export function getBlogPostBySlug(slug: string): BlogPostEntry | undefined {
  const entry = BLOG_POSTS.find((p) => p.slug === slug);
  return entry ? stamp(entry) : undefined;
}

/**
 * Related posts — same category preferred, fallback to most-recent other
 * posts excluding self (handover §6.6 / D11).
 */
export function getRelatedBlogPosts(
  self: BlogPostEntry,
  count: number = 3,
): BlogPostEntry[] {
  const sameCategory = BLOG_POSTS.filter(
    (p) => p.category === self.category && p.slug !== self.slug,
  );
  const others = BLOG_POSTS.filter(
    (p) => p.category !== self.category && p.slug !== self.slug,
  ).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  return [...sameCategory, ...others].slice(0, count).map(stamp);
}

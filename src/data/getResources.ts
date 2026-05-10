/**
 * Resources loaders — Phase 1.18 §4.3.
 *
 * Stamps `wordCount` + `readingMinutes` onto every entry at build/request
 * time using the EN body (the canonical word count for SEO / `wordCount`
 * schema; ES body is a translation of the same content). Reading time is
 * shown per locale; we compute once from EN to keep the displayed minute
 * count consistent across language switches.
 */

import {RESOURCES, type ResourceEntry} from './resources';
import {estimateReadingTime} from '@/lib/readingTime';

function stamp(entry: ResourceEntry): ResourceEntry {
  if (entry.wordCount && entry.readingMinutes) return entry;
  const {wordCount, readingMinutes} = estimateReadingTime(entry.body.en);
  return {...entry, wordCount, readingMinutes};
}

export function getAllResources(): ResourceEntry[] {
  return RESOURCES.map(stamp).sort((a, b) =>
    a.title.en.localeCompare(b.title.en, 'en'),
  );
}

export function getResourceBySlug(slug: string): ResourceEntry | undefined {
  const entry = RESOURCES.find((r) => r.slug === slug);
  return entry ? stamp(entry) : undefined;
}

/**
 * Related resources — same category preferred, fallback to most-recently
 * updated other resources (handover §4.5 / D11). `self.slug` is excluded.
 */
export function getRelatedResources(
  self: ResourceEntry,
  count: number = 3,
): ResourceEntry[] {
  const sameCategory = RESOURCES.filter(
    (r) => r.category === self.category && r.slug !== self.slug,
  );
  const others = RESOURCES.filter(
    (r) => r.category !== self.category && r.slug !== self.slug,
  ).sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated));
  return [...sameCategory, ...others].slice(0, count).map(stamp);
}

import {writeClient} from '@sanity-lib/write-client';
import {BLOG_TOPICS, type BlogTopic} from '@/data/blogTopics';

/**
 * Topic picker for the monthly blog draft cron (Phase 2.16).
 *
 * Walks BLOG_TOPICS in declared order, returns the first entry whose `id` is
 * NOT present in the "used" set. The used set is the union of:
 *   - all `blogPost.automatedTopicId` values
 *   - all `blogDraftPending.meta.automatedTopicId` values where status != 'rejected'
 *
 * Rejected drafts don't count — the topic returns to the rotation so a future
 * cron cycle generates a fresh draft from scratch.
 *
 * When every topic is consumed, wraps to BLOG_TOPICS[0] with a log line.
 * Returns null only if BLOG_TOPICS is empty (defensive — should never trigger).
 *
 * The Sanity query is two GROQ projections combined client-side. Module-scope
 * cache holds the used set for 1 minute — generous because the cron only
 * runs monthly, but a no-op if the cron retries within a minute (idempotency
 * is handled at the cron-route layer too).
 */

type CachedSet = {
  set: Set<string>;
  cachedAt: number;
};

const CACHE_TTL_MS = 60_000;
let cache: CachedSet | null = null;

async function fetchUsedTopicIds(): Promise<Set<string>> {
  if (cache && Date.now() - cache.cachedAt < CACHE_TTL_MS) {
    return cache.set;
  }

  type Row = {automatedTopicId?: string | null};

  // Two projections — combined GROQ would have to union two _type filters and
  // the result shape gets messy. Two parallel reads are cheaper than the
  // mental cost of debugging a union projection.
  const [postRows, draftRows] = await Promise.all([
    writeClient.fetch<Row[]>(
      '*[_type == "blogPost" && defined(automatedTopicId)]{automatedTopicId}',
    ),
    writeClient.fetch<Row[]>(
      '*[_type == "blogDraftPending" && status != "rejected" && defined(automatedTopicId)]{automatedTopicId}',
    ),
  ]);

  const used = new Set<string>();
  for (const row of postRows) {
    if (row.automatedTopicId) used.add(row.automatedTopicId);
  }
  for (const row of draftRows) {
    if (row.automatedTopicId) used.add(row.automatedTopicId);
  }

  cache = {set: used, cachedAt: Date.now()};
  return used;
}

export async function pickNextTopic(): Promise<BlogTopic | null> {
  if (BLOG_TOPICS.length === 0) {
    console.warn('[topicPicker] BLOG_TOPICS is empty — nothing to pick');
    return null;
  }

  const used = await fetchUsedTopicIds();
  const next = BLOG_TOPICS.find((t) => !used.has(t.id));
  if (next) return next;

  console.info(
    `[topicPicker] all ${BLOG_TOPICS.length} topics consumed; wrapping rotation to '${BLOG_TOPICS[0].id}'`,
  );
  return BLOG_TOPICS[0];
}

/**
 * Test seam — lets the verification harness invalidate the in-memory cache
 * between test runs so consecutive harness invocations see fresh Sanity state.
 * Not exported as a stable production API.
 */
export function _resetTopicPickerCacheForTests(): void {
  cache = null;
}

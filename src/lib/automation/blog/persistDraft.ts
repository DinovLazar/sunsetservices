import {randomUUID} from 'node:crypto';
import {writeClient} from '@sanity-lib/write-client';
import type {BlogTopic} from '@/data/blogTopics';
import {
  makeKey,
  toPortableTextBlocks,
} from '@/lib/automation/shared/toPortableTextBlocks';
import type {BlogDraft} from './draft';

/**
 * Sanity persist helper for blogDraftPending (Phase 2.16; shared converter
 * extracted to `src/lib/automation/shared/toPortableTextBlocks.ts` in
 * Phase 2.17).
 *
 * Writes one new `blogDraftPending` document. The cron route hands the
 * returned docId to requestApproval as `targetId`; the Telegram webhook's
 * 'blog_draft' branch reads the doc by ID, then publishes or rejects.
 *
 * `_id` is deterministic-prefix + random suffix (`blogDraftPending-<uuid>`)
 * so the verification harness can sweep its test docs by ID-prefix filter.
 * Production drafts use the same prefix — there's no collision risk because
 * the cron's pre-generation idempotency check (see route.ts) prevents two
 * pending drafts for the same topicId.
 *
 * Block conversion is deterministic and reuses the Phase 2.17-factored
 * shared helper so both blog and portfolio drafts produce identically
 * shaped PortableText.
 */

// Re-export for backwards compatibility with any code path that imported
// these from the blog module before the Phase 2.17 extraction.
export {toPortableTextBlocks};

export async function persistBlogDraftPending(
  draft: BlogDraft,
  topic: BlogTopic,
  modelUsed: string,
): Promise<{docId: string}> {
  const docId = `blogDraftPending-${randomUUID()}`;
  const now = new Date().toISOString();

  await writeClient.create({
    _id: docId,
    _type: 'blogDraftPending',
    title: draft.title,
    dek: draft.dek,
    body: {
      en: toPortableTextBlocks(draft.body.en),
      es: toPortableTextBlocks(draft.body.es),
    },
    metaTitle: draft.metaTitle,
    metaDescription: draft.metaDescription,
    faqsInline: draft.faqsInline.map((faq) => ({
      _key: makeKey(),
      _type: 'faqInline',
      q: faq.q,
      a: faq.a,
    })),
    categorySlug: topic.category,
    slug: {_type: 'slug', current: draft.proposedSlug},
    automatedTopicId: topic.id,
    topicKeyword: topic.keyword,
    modelUsed,
    generatedAt: now,
    status: 'pending',
  });

  return {docId};
}

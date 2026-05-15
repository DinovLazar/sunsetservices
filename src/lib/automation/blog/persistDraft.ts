import {randomUUID} from 'node:crypto';
import {writeClient} from '@sanity-lib/write-client';
import type {BlogTopic} from '@/data/blogTopics';
import type {BlogDraft, BlogDraftBlock} from './draft';

/**
 * Sanity persist helper for blogDraftPending (Phase 2.16).
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
 * Block conversion is small + deterministic. The model returns structured
 * blocks {type, text|items}; we wrap each into a Sanity Portable Text block
 * with a fresh `_key` (Sanity Studio expects per-block + per-child keys for
 * its array-renderer). No Markdown parser required.
 */

type SanityBlock = {
  _type: 'block';
  _key: string;
  style?: string;
  listItem?: 'bullet' | 'number';
  level?: number;
  children: Array<{_type: 'span'; _key: string; text: string; marks: string[]}>;
  markDefs: never[];
};

function makeKey(): string {
  // Sanity requires array-member keys to be reasonably unique. UUID-without-dashes
  // is overkill but easy to read in the Studio.
  return randomUUID().replace(/-/g, '').slice(0, 12);
}

function textBlock(style: string, text: string): SanityBlock {
  return {
    _type: 'block',
    _key: makeKey(),
    style,
    children: [{_type: 'span', _key: makeKey(), text, marks: []}],
    markDefs: [],
  };
}

function listBlock(listItem: 'bullet' | 'number', text: string): SanityBlock {
  return {
    _type: 'block',
    _key: makeKey(),
    style: 'normal',
    listItem,
    level: 1,
    children: [{_type: 'span', _key: makeKey(), text, marks: []}],
    markDefs: [],
  };
}

export function toPortableTextBlocks(blocks: BlogDraftBlock[]): SanityBlock[] {
  const result: SanityBlock[] = [];
  for (const block of blocks) {
    if (block.type === 'h2') {
      result.push(textBlock('h2', block.text));
    } else if (block.type === 'p') {
      result.push(textBlock('normal', block.text));
    } else if (block.type === 'ul') {
      for (const item of block.items) result.push(listBlock('bullet', item));
    } else {
      // type === 'ol'
      for (const item of block.items) result.push(listBlock('number', item));
    }
  }
  return result;
}

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

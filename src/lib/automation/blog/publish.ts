import {writeClient} from '@sanity-lib/write-client';
import {ensurePlaceholderAsset} from './placeholderAsset';
import type {BlogTopicCategory} from '@/data/blogTopics';

/**
 * Publish + reject handlers for blogDraftPending (Phase 2.16).
 *
 * Called by the Telegram webhook's 'blog_draft' branch when the operator
 * taps Approve & publish / Reject. Both functions are idempotent at the
 * webhook level — the webhook's pre-tap idempotency check (`logRow.decision
 * !== 'pending'`) prevents repeated execution, so these handlers don't need
 * to dedupe themselves.
 *
 * Approve flow:
 *   1. Read the pending doc by ID; throw if missing or already processed.
 *   2. Resolve the shared placeholder featured-image asset (uploaded on
 *      first run, reused thereafter).
 *   3. For each inline FAQ, createOrReplace a scoped `faq` document with a
 *      deterministic _id and scope tag `blog:<slug>`.
 *   4. Create the live blogPost with full content, faqs[] references, the
 *      placeholder featuredImage, publishedAt=now, and the three automation
 *      meta fields.
 *   5. Patch the pending doc: status='approved', processedAt=now,
 *      publishedBlogPostId set.
 *
 * Reject flow:
 *   1. Read the pending doc; throw if missing or already processed.
 *   2. Patch: status='rejected', processedAt=now. Doc kept (audit trail).
 *
 * Off-spec note on category mapping: blogPost.category is an enum
 * (how-to | cost-guide | seasonal | industry-news | audience), distinct
 * from the BlogTopic taxonomy (residential | commercial | hardscape |
 * location | seasonal). Auto-published posts use the mapping below; the
 * operator can edit category from Sanity Studio post-publish.
 */

type PortableTextBlock = {
  _type: 'block';
  _key: string;
  style?: string;
  listItem?: 'bullet' | 'number';
  level?: number;
  children: Array<{_type: 'span'; _key: string; text: string; marks: string[]}>;
  markDefs: never[];
};

type LocalizedString = {en: string; es: string};
type LocalizedText = {en: string; es: string};
type LocalizedBody = {en: PortableTextBlock[]; es: PortableTextBlock[]};

type PendingDoc = {
  _id: string;
  title: LocalizedString;
  dek?: LocalizedText;
  body: LocalizedBody;
  metaTitle?: LocalizedString;
  metaDescription?: LocalizedString;
  faqsInline?: Array<{q: LocalizedString; a: LocalizedText}>;
  categorySlug?: BlogTopicCategory;
  slug?: {current: string};
  automatedTopicId: string;
  topicKeyword?: string;
  modelUsed?: string;
  generatedAt: string;
  status: 'pending' | 'approved' | 'rejected';
};

const PENDING_PROJECTION = `{
  _id, title, dek, body, metaTitle, metaDescription, faqsInline, categorySlug,
  slug, automatedTopicId, topicKeyword, modelUsed, generatedAt, status
}`;

// BlogTopic category → blogPost.category enum mapping.
function mapCategory(topicCategory: BlogTopicCategory | undefined): string {
  if (topicCategory === 'seasonal') return 'seasonal';
  // residential / commercial / hardscape / location all read as audience-targeted.
  return 'audience';
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

export async function publishBlogDraft(
  pendingDocId: string,
): Promise<{blogPostId: string}> {
  const pending = await writeClient.fetch<PendingDoc | null>(
    `*[_type == "blogDraftPending" && _id == $id][0]${PENDING_PROJECTION}`,
    {id: pendingDocId},
  );
  if (!pending) {
    throw new Error(`blogDraftPending not found: ${pendingDocId}`);
  }
  if (pending.status !== 'pending') {
    throw new Error(
      `blogDraftPending ${pendingDocId} already processed (status=${pending.status})`,
    );
  }

  const {assetId} = await ensurePlaceholderAsset();
  const slug = pending.slug?.current ?? slugify(pending.title.en);
  const now = new Date().toISOString();

  // Create scoped faq documents (one per inline FAQ).
  const faqRefs: Array<{_type: 'reference'; _ref: string; _key: string}> = [];
  if (pending.faqsInline && pending.faqsInline.length > 0) {
    for (let i = 0; i < pending.faqsInline.length; i++) {
      const faq = pending.faqsInline[i];
      const faqId = `faq-blog-${slug}-${i + 1}`;
      await writeClient.createOrReplace({
        _id: faqId,
        _type: 'faq',
        question: faq.q,
        // Sanity faq.answer is localizedString (single-line) per the existing
        // schema; the model returns localizedText. Use the text content directly.
        answer: {en: faq.a.en, es: faq.a.es},
        scope: `blog:${slug}`,
        order: i,
      });
      faqRefs.push({_type: 'reference', _ref: faqId, _key: `faq-${i + 1}`});
    }
  }

  const blogPost = await writeClient.create({
    _type: 'blogPost',
    title: pending.title,
    dek: pending.dek
      ? {en: pending.dek.en, es: pending.dek.es}
      : undefined,
    body: pending.body,
    metaTitle: pending.metaTitle,
    metaDescription: pending.metaDescription,
    slug: {_type: 'slug', current: slug},
    publishedAt: now,
    author: 'Sunset Services Team',
    category: mapCategory(pending.categorySlug),
    featuredImage: {
      _type: 'image',
      asset: {_type: 'reference', _ref: assetId},
    },
    faqs: faqRefs.length > 0 ? faqRefs : undefined,
    automatedTopicId: pending.automatedTopicId,
    automatedGeneratedAt: pending.generatedAt,
    automatedModelUsed: pending.modelUsed,
  });

  // Patch the pending doc to mark approved.
  await writeClient
    .patch(pendingDocId)
    .set({
      status: 'approved',
      processedAt: now,
      publishedBlogPostId: blogPost._id,
    })
    .commit();

  return {blogPostId: blogPost._id};
}

export async function rejectBlogDraft(pendingDocId: string): Promise<{ok: true}> {
  const pending = await writeClient.fetch<{_id: string; status: string} | null>(
    `*[_type == "blogDraftPending" && _id == $id][0]{_id, status}`,
    {id: pendingDocId},
  );
  if (!pending) {
    throw new Error(`blogDraftPending not found: ${pendingDocId}`);
  }
  if (pending.status !== 'pending') {
    throw new Error(
      `blogDraftPending ${pendingDocId} already processed (status=${pending.status})`,
    );
  }

  await writeClient
    .patch(pendingDocId)
    .set({
      status: 'rejected',
      processedAt: new Date().toISOString(),
    })
    .commit();

  return {ok: true};
}

import {defineArrayMember, defineField, defineType} from 'sanity';

/**
 * Blog Draft (Pending) — auto-generated drafts awaiting operator approval (Phase 2.16).
 *
 * Written by /api/cron/blog-draft-monthly when the Anthropic-generated draft
 * lands. Status starts as 'pending'; the Telegram webhook flips it to
 * 'approved' (after publishBlogDraft creates the real blogPost) or 'rejected'
 * (kept for audit trail, not deleted — topic returns to the rotation).
 *
 * `content.faqsInline` are FREE-FORM at the draft stage — they're flattened
 * into real scoped `faq` documents (one per inline entry) only when Approve
 * fires. This keeps the draft a single Sanity doc the operator can read in
 * one place without chasing references.
 *
 * `meta.automatedTopicId` matches the `id` field of an entry in
 * src/data/blogTopics.ts. The cron's topic-picker walks BLOG_TOPICS in
 * declared order and skips any id already present on a `blogPost` OR on a
 * non-rejected `blogDraftPending` — that drives rotation and idempotency.
 */
export const blogDraftPending = defineType({
  name: 'blogDraftPending',
  title: 'Blog Draft (Pending)',
  type: 'document',
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'meta', title: 'Meta'},
  ],
  fields: [
    // ─────────────────────── Content ───────────────────────
    defineField({
      name: 'title',
      type: 'localizedString',
      title: 'Title',
      group: 'content',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'dek',
      type: 'localizedText',
      title: 'Dek (sub-headline)',
      group: 'content',
    }),
    defineField({
      name: 'body',
      type: 'localizedBody',
      title: 'Body (Portable Text)',
      group: 'content',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'metaTitle',
      type: 'localizedString',
      title: 'Meta title (SEO)',
      group: 'content',
    }),
    defineField({
      name: 'metaDescription',
      type: 'localizedString',
      title: 'Meta description (SEO)',
      group: 'content',
    }),
    defineField({
      name: 'faqsInline',
      type: 'array',
      title: 'FAQs (inline at draft stage)',
      group: 'content',
      description:
        'Free-form FAQ Q&A pairs the model proposed. These are flattened into real scoped `faq` documents on Approve — not at draft creation time.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'faqInline',
          fields: [
            defineField({
              name: 'q',
              type: 'localizedString',
              title: 'Question',
              validation: (r) => r.required(),
            }),
            defineField({
              name: 'a',
              type: 'localizedText',
              title: 'Answer',
              validation: (r) => r.required(),
            }),
          ],
          preview: {
            select: {q: 'q.en'},
            prepare: ({q}) => ({title: q ?? '(no question)'}),
          },
        }),
      ],
    }),
    defineField({
      name: 'categorySlug',
      type: 'string',
      title: 'Category slug',
      group: 'content',
      description:
        'Maps the BLOG_TOPICS category to a blogPost.category value when the draft is approved.',
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Proposed slug',
      group: 'content',
      options: {
        source: (doc) => (doc as {title?: {en?: string}}).title?.en ?? '',
        maxLength: 96,
      },
      description: 'Proposed at draft time; locked in on Approve when blogPost is created.',
    }),

    // ─────────────────────── Meta ───────────────────────
    defineField({
      name: 'automatedTopicId',
      type: 'string',
      title: 'Automated topic ID',
      group: 'meta',
      validation: (r) => r.required(),
      description:
        'The `id` from src/data/blogTopics.ts that drove this draft. Topic picker dedups against this field across both blogPost and non-rejected blogDraftPending docs.',
    }),
    defineField({
      name: 'topicKeyword',
      type: 'string',
      title: 'Topic keyword',
      group: 'meta',
      description: 'Snapshot of the BLOG_TOPICS keyword at generation time.',
    }),
    defineField({
      name: 'modelUsed',
      type: 'string',
      title: 'Anthropic model used',
      group: 'meta',
      description: 'e.g. "claude-sonnet-4-6". Captured from ANTHROPIC_MODEL at generation time.',
    }),
    defineField({
      name: 'generatedAt',
      type: 'datetime',
      title: 'Generated at',
      group: 'meta',
      validation: (r) => r.required(),
      readOnly: true,
    }),
    defineField({
      name: 'status',
      type: 'string',
      title: 'Status',
      group: 'meta',
      validation: (r) => r.required(),
      initialValue: 'pending',
      options: {
        list: [
          {title: 'Pending', value: 'pending'},
          {title: 'Approved', value: 'approved'},
          {title: 'Rejected', value: 'rejected'},
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'processedAt',
      type: 'datetime',
      title: 'Processed at',
      group: 'meta',
      description: 'Set when the Telegram approval webhook flips the status.',
    }),
    defineField({
      name: 'publishedBlogPostId',
      type: 'string',
      title: 'Published blogPost _id',
      group: 'meta',
      description: 'Set on Approve. Points to the resulting `blogPost` document.',
    }),
    defineField({
      name: 'telegramMessageId',
      type: 'number',
      title: 'Telegram message ID',
      group: 'meta',
      description:
        'Snapshot of the message_id Telegram returned when the approval request was sent. Audit cross-reference; not used at decision time (the webhook joins on telegramApprovalLog.sentMessageId).',
    }),
    defineField({
      name: 'telegramApprovalLogId',
      type: 'string',
      title: 'Telegram approval log _id',
      group: 'meta',
      description: 'Points to the matching telegramApprovalLog row for fast audit joins.',
    }),
  ],
  preview: {
    select: {
      title: 'title.en',
      status: 'status',
      generatedAt: 'generatedAt',
    },
    prepare({title, status, generatedAt}) {
      const subtitleParts = [status ?? 'pending', generatedAt ?? '—'].filter(Boolean);
      return {
        title: title ?? '(no title)',
        subtitle: subtitleParts.join(' · '),
      };
    },
  },
  orderings: [
    {
      name: 'generatedDesc',
      title: 'Generated (newest first)',
      by: [{field: 'generatedAt', direction: 'desc'}],
    },
  ],
});

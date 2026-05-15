import {defineArrayMember, defineField, defineType} from 'sanity';

/**
 * Portfolio Draft (Pending) — auto-generated drafts awaiting operator approval (Phase 2.17).
 *
 * Written by the ServiceM8 webhook post-response pipeline
 * (`src/lib/automation/portfolio/runPipeline.ts`) when an inbound
 * `job.completed` event triggers Anthropic generation of a bilingual
 * portfolio entry. Status starts as 'pending'; the Telegram webhook flips
 * it to 'approved' (after publishPortfolioDraft creates the real `project`
 * doc) or 'rejected' (kept for audit trail; source `servicem8Event` is
 * marked terminal — no auto-retry).
 *
 * Mirrors `blogDraftPending`'s shape (Phase 2.16) with portfolio-specific
 * adaptations:
 *   - `audience` enum (residential / commercial / hardscape) drives taxonomy.
 *   - `serviceSlug` / `locationSlug` are stored as strings (not references)
 *     at the draft stage — the publish handler can resolve them to live
 *     references against `src/data/services.ts` + `src/data/locations.ts`
 *     when creating the live `project` doc.
 *   - `featuredImage` + `gallery` are image references uploaded from the
 *     ServiceM8 webhook payload's `attachments[].url` list. Zero photos →
 *     featuredImage falls back to the shared Phase 2.16 placeholder asset.
 *   - `meta.sourceEventId` is the `servicem8Event.eventId` field (the
 *     ServiceM8-supplied event identifier), NOT the Sanity `_id`. The
 *     `_id` of the source event doc is captured separately in
 *     `meta.sourceEventDocId` for back-reference.
 *   - `meta.gbpUploadResult` is a string snapshot of the GBP write-leg
 *     outcome captured on Approve (`'skipped:gbp-deferred'` while
 *     `GBP_PORTFOLIO_PUBLISH_ENABLED=false` — Phase 2.17a will flip this
 *     to `'ok'` / `'error:<message>'` when the real client lands).
 */
export const portfolioDraftPending = defineType({
  name: 'portfolioDraftPending',
  title: 'Portfolio Draft (Pending)',
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
      title: 'Dek (~30 words)',
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
      name: 'audience',
      type: 'string',
      title: 'Audience',
      group: 'content',
      validation: (r) => r.required(),
      options: {
        list: [
          {title: 'Residential', value: 'residential'},
          {title: 'Commercial', value: 'commercial'},
          {title: 'Hardscape', value: 'hardscape'},
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'serviceSlug',
      type: 'string',
      title: 'Service slug',
      group: 'content',
      description:
        'Matches a slug in src/data/services.ts (e.g. patios-walkways, lawn-care, snow-removal). The publish handler can resolve to a live service reference when creating the project doc.',
    }),
    defineField({
      name: 'locationSlug',
      type: 'string',
      title: 'Location slug',
      group: 'content',
      description:
        'One of: aurora / naperville / batavia / wheaton / lisle / bolingbrook. The publish handler resolves this to a city reference on the project doc.',
    }),
    defineField({
      name: 'featuredImage',
      type: 'image',
      title: 'Featured image',
      group: 'content',
      options: {hotspot: true},
      description:
        'First uploaded photo from the ServiceM8 attachments list. Falls back to the shared Phase 2.16 placeholder asset when zero photos download successfully.',
    }),
    defineField({
      name: 'gallery',
      type: 'array',
      title: 'Gallery',
      group: 'content',
      of: [
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
        }),
      ],
      description: 'All successfully uploaded photos from the ServiceM8 attachments list.',
    }),
    defineField({
      name: 'proposedSlug',
      type: 'slug',
      title: 'Proposed slug',
      group: 'content',
      options: {
        source: (doc) => (doc as {title?: {en?: string}}).title?.en ?? '',
        maxLength: 96,
      },
      description: 'Auto-derived from title.en at draft time; locked in on Approve as the project slug.',
    }),

    // ─────────────────────── Meta ───────────────────────
    defineField({
      name: 'sourceEventId',
      type: 'string',
      title: 'Source eventId (ServiceM8)',
      group: 'meta',
      validation: (r) => r.required(),
      description:
        'The `servicem8Event.eventId` value (ServiceM8-supplied). Used by the time-based idempotency check.',
    }),
    defineField({
      name: 'sourceEventDocId',
      type: 'string',
      title: 'Source servicem8Event _id',
      group: 'meta',
      validation: (r) => r.required(),
      description:
        'Sanity `_id` of the originating servicem8Event document. Used for back-reference; the orchestrator patches that doc on Approve/Reject.',
    }),
    defineField({
      name: 'modelUsed',
      type: 'string',
      title: 'Anthropic model used',
      group: 'meta',
      description: 'e.g. "claude-sonnet-4-6". Captured from ANTHROPIC_MODEL (or override) at generation time.',
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
      name: 'publishedProjectId',
      type: 'string',
      title: 'Published project _id',
      group: 'meta',
      description: 'Set on Approve. Points to the resulting `project` document.',
    }),
    defineField({
      name: 'gbpUploadResult',
      type: 'string',
      title: 'GBP upload result',
      group: 'meta',
      description:
        "Snapshot of the GBP write-leg outcome captured on Approve. Phase 2.17 default: 'skipped:gbp-deferred'. Phase 2.17a swaps this for 'ok' / 'error:<message>' when the real GBP client lands.",
    }),
    defineField({
      name: 'photoStats',
      type: 'object',
      title: 'Photo download stats',
      group: 'meta',
      description:
        'Off-spec addition (Phase 2.17). Captures uploaded/failed counts from the photo-download pass — useful for diagnosing flaky ServiceM8 attachment URLs.',
      fields: [
        defineField({name: 'uploaded', type: 'number', title: 'Uploaded count'}),
        defineField({name: 'failed', type: 'number', title: 'Failed count'}),
      ],
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

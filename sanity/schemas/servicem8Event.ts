import {defineField, defineType} from 'sanity';

/**
 * ServiceM8 Event — webhook ingestion queue (Phase 2.13).
 *
 * Written by /api/webhooks/servicem8 when SERVICEM8_ENABLED=true and the
 * request carries a valid HMAC signature. Phase 2.13 only ingests + persists;
 * Phase 2.17 reads pending events to draft EN+ES project descriptions, send
 * to Telegram for approval, and on Approve publish to portfolio + GBP.
 *
 * Document `_id` is deterministic — `servicem8Event-<slugified eventId>` —
 * so replay attempts are idempotent (the persist helper fetches by ID and
 * short-circuits on duplicate).
 *
 * `payload` stores the original webhook body as a stringified JSON blob so
 * Phase 2.17 can project any field it needs without forcing a schema
 * migration in this phase. The Phase 2.13 schema captures only the
 * minimum-needed projection (`eventId`, `eventType`, `jobId`) for indexing
 * + preview.
 */
export const servicem8Event = defineType({
  name: 'servicem8Event',
  title: 'ServiceM8 Event',
  type: 'document',
  groups: [
    {name: 'event', title: 'Event', default: true},
    {name: 'processing', title: 'Processing'},
    {name: 'meta', title: 'Meta'},
  ],
  fields: [
    // ─────────────────────── Event ───────────────────────
    defineField({
      name: 'eventId',
      type: 'string',
      title: 'Event ID',
      group: 'event',
      validation: (r) => r.required().min(1),
      description:
        'The eventId field from the ServiceM8 webhook body. Used as the dedup key (deterministic _id).',
    }),
    defineField({
      name: 'eventType',
      type: 'string',
      title: 'Event type',
      group: 'event',
      validation: (r) => r.required().min(1),
      description:
        "At Phase 2.13 launch the only expected value is 'job.completed'. Not constrained — ServiceM8 may send other types later that should still persist.",
    }),
    defineField({
      name: 'jobId',
      type: 'string',
      title: 'Job ID',
      group: 'event',
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: 'payload',
      type: 'text',
      title: 'Payload (raw JSON)',
      group: 'event',
      rows: 12,
      description:
        'The original webhook body as a stringified JSON blob. Preserved verbatim so Phase 2.17 can project any field without a schema migration.',
    }),
    defineField({
      name: 'signatureValid',
      type: 'boolean',
      title: 'Signature valid?',
      group: 'event',
      validation: (r) => r.required(),
      description:
        'Always true at write time — the route never persists on signature failure. The field exists so future phases can record signature-bypass admin writes if ever needed.',
    }),
    defineField({
      name: 'receivedAt',
      type: 'datetime',
      title: 'Received at',
      group: 'event',
      validation: (r) => r.required(),
      readOnly: true,
      description: 'Server-side new Date().toISOString() at write time.',
    }),

    // ─────────────────────── Processing ───────────────────────
    defineField({
      name: 'status',
      type: 'string',
      title: 'Status',
      group: 'processing',
      options: {
        list: [
          {title: 'Pending', value: 'pending'},
          {title: 'Processing', value: 'processing'},
          {title: 'Completed', value: 'completed'},
          {title: 'Failed', value: 'failed'},
          {title: 'Skipped', value: 'skipped'},
        ],
        layout: 'radio',
      },
      initialValue: 'pending',
    }),
    defineField({
      name: 'processedAt',
      type: 'datetime',
      title: 'Processed at',
      group: 'processing',
    }),
    defineField({
      name: 'processingError',
      type: 'text',
      title: 'Processing error',
      group: 'processing',
      rows: 4,
    }),
    defineField({
      name: 'relatedProjectId',
      type: 'reference',
      title: 'Related project',
      group: 'processing',
      to: [{type: 'project'}],
      description: 'Set by Phase 2.17 when the portfolio entry lands.',
    }),
    defineField({
      name: 'telegramApprovalState',
      type: 'string',
      title: 'Telegram approval state',
      group: 'processing',
      options: {
        list: [
          {title: 'Not sent', value: 'not_sent'},
          {title: 'Pending', value: 'pending'},
          {title: 'Approved', value: 'approved'},
          {title: 'Rejected', value: 'rejected'},
        ],
        layout: 'radio',
      },
      initialValue: 'not_sent',
    }),

    // ─────────────────────── Meta ───────────────────────
    defineField({
      name: 'createdAt',
      type: 'datetime',
      title: 'Created at',
      group: 'meta',
      validation: (r) => r.required(),
      readOnly: true,
    }),
    defineField({
      name: 'lastUpdatedAt',
      type: 'datetime',
      title: 'Last updated at',
      group: 'meta',
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: {
      eventType: 'eventType',
      jobId: 'jobId',
      status: 'status',
      receivedAt: 'receivedAt',
    },
    prepare({eventType, jobId, status, receivedAt}) {
      const title = `${eventType ?? '—'} — ${jobId ?? '—'}`;
      const subtitle = [status ?? 'pending', receivedAt ?? '—']
        .filter(Boolean)
        .join(' · ');
      return {title, subtitle};
    },
  },
  orderings: [
    {
      name: 'receivedDesc',
      title: 'Received (newest first)',
      by: [{field: 'receivedAt', direction: 'desc'}],
    },
    {
      name: 'receivedAsc',
      title: 'Received (oldest first)',
      by: [{field: 'receivedAt', direction: 'asc'}],
    },
  ],
});

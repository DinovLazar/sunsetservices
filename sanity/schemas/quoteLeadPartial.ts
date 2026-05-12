import {defineField, defineType} from 'sanity';

/**
 * Quote Lead — Abandoned (Phase 2.06).
 *
 * Best-effort breadcrumb written by /api/quote/partial when a visitor advances
 * past Steps 1, 2, or 3 of the wizard. NEVER contains PII — Step 4 is the PII
 * boundary; Step 4→5 transitions DO NOT push partials.
 *
 * The document `_id` is deterministically `quoteLeadPartial-<sessionId>` so
 * subsequent pushes for the same session upsert into the same record
 * (preserving `firstSeenAt` while advancing `lastUpdatedAt` + `lastStepReached`).
 *
 * When a matching full quoteLead lands (same sessionId), the route handler
 * flips `converted: true` here.
 */
export const quoteLeadPartial = defineType({
  name: 'quoteLeadPartial',
  title: 'Quote Lead — Abandoned',
  type: 'document',
  fields: [
    defineField({
      name: 'sessionId',
      type: 'string',
      title: 'Session ID',
      validation: (r) => r.required(),
      description:
        'Client-generated UUID. The /api/quote/partial endpoint upserts on this.',
    }),
    defineField({
      name: 'firstSeenAt',
      type: 'datetime',
      title: 'First seen at',
      validation: (r) => r.required(),
      readOnly: true,
    }),
    defineField({
      name: 'lastUpdatedAt',
      type: 'datetime',
      title: 'Last updated at',
      validation: (r) => r.required(),
      readOnly: true,
    }),
    defineField({
      name: 'lastStepReached',
      type: 'number',
      title: 'Last step reached',
      validation: (r) => r.required().integer().min(1).max(3),
    }),
    defineField({
      name: 'audience',
      type: 'string',
      title: 'Audience',
      options: {
        list: [
          {title: 'Residential', value: 'residential'},
          {title: 'Commercial', value: 'commercial'},
          {title: 'Hardscape', value: 'hardscape'},
        ],
      },
    }),
    defineField({
      name: 'services',
      type: 'array',
      title: 'Services',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'primaryService',
      type: 'string',
      title: 'Primary service',
    }),
    defineField({
      name: 'otherText',
      type: 'string',
      title: '"Other service" free-text',
    }),
    defineField({
      name: 'details',
      type: 'object',
      title: 'Step 3 details (audience-conditional)',
      fields: [
        {name: 'propertySize', type: 'string', title: 'Property size (sq ft)'},
        {name: 'bedrooms', type: 'string', title: 'Bedrooms'},
        {name: 'projectType', type: 'string', title: 'Project type'},
        {name: 'timeline', type: 'string', title: 'Timeline'},
        {name: 'budget', type: 'string', title: 'Budget'},
        {name: 'numProperties', type: 'string', title: 'Number of properties'},
        {name: 'numBuildings', type: 'string', title: 'Number of buildings'},
        {name: 'contract', type: 'string', title: 'Contract type'},
        {name: 'frequency', type: 'string', title: 'Frequency'},
        {name: 'spaceType', type: 'array', title: 'Space type', of: [{type: 'string'}]},
        {name: 'dimensions', type: 'string', title: 'Dimensions'},
        {name: 'surface', type: 'string', title: 'Surface'},
        {name: 'features', type: 'array', title: 'Features', of: [{type: 'string'}]},
        {name: 'notes', type: 'text', title: 'Notes', rows: 3},
      ],
    }),
    defineField({
      name: 'converted',
      type: 'boolean',
      title: 'Converted to full lead?',
      initialValue: false,
      description:
        'Flips true when a full quoteLead document with the same sessionId lands.',
    }),
    defineField({
      name: 'userAgent',
      type: 'string',
      title: 'User agent',
      description: 'For abandoner debugging — bot vs. real user.',
    }),
    defineField({
      name: 'referrer',
      type: 'string',
      title: 'Referrer',
      description: 'document.referrer at wizard mount, if any.',
    }),
  ],
  preview: {
    select: {
      audience: 'audience',
      step: 'lastStepReached',
      updated: 'lastUpdatedAt',
      sessionId: 'sessionId',
      converted: 'converted',
    },
    prepare({audience, step, updated, sessionId, converted}) {
      const title = `${audience ?? '(no audience yet)'} · Step ${step ?? '?'}${converted ? ' · CONVERTED' : ''}`;
      const subtitle = `${updated ?? '—'} · session ${(sessionId ?? '').slice(0, 8)}`;
      return {title, subtitle};
    },
  },
  orderings: [
    {
      name: 'updatedDesc',
      title: 'Last updated (newest first)',
      by: [{field: 'lastUpdatedAt', direction: 'desc'}],
    },
    {
      name: 'updatedAsc',
      title: 'Last updated (oldest first)',
      by: [{field: 'lastUpdatedAt', direction: 'asc'}],
    },
  ],
});

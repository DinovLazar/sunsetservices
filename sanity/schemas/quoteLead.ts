import {defineField, defineType} from 'sanity';

/**
 * Quote Lead — full wizard submissions (Phase 2.06).
 *
 * Written by /api/quote when WIZARD_SUBMIT_ENABLED=true. The sessionId links
 * back to any quoteLeadPartial document the same visitor created during
 * Steps 1–3 (the partial gets `converted: true` set when the full lead lands).
 *
 * `internalNotes` is Erick's private follow-up scratchpad — never shown back
 * to the lead. `mauticSynced` flips true once the Phase 2.x Mautic sync
 * confirms the record landed in the CRM.
 */
export const quoteLead = defineType({
  name: 'quoteLead',
  title: 'Quote Lead',
  type: 'document',
  groups: [
    {name: 'contact', title: 'Contact', default: true},
    {name: 'project', title: 'Project'},
    {name: 'meta', title: 'Meta'},
  ],
  fields: [
    // ─────────────────────── Meta ───────────────────────
    defineField({
      name: 'submittedAt',
      type: 'datetime',
      title: 'Submitted at',
      group: 'meta',
      validation: (r) => r.required(),
      readOnly: true,
    }),
    defineField({
      name: 'sessionId',
      type: 'string',
      title: 'Session ID',
      group: 'meta',
      description:
        'Matches quoteLeadPartial.sessionId so partials and full submits link up.',
    }),
    defineField({
      name: 'source',
      type: 'string',
      title: 'Source',
      group: 'meta',
      initialValue: 'wizard',
      readOnly: true,
    }),
    defineField({
      name: 'status',
      type: 'string',
      title: 'Status',
      group: 'meta',
      options: {
        list: [
          {title: 'New', value: 'new'},
          {title: 'Contacted', value: 'contacted'},
          {title: 'Quoted', value: 'quoted'},
          {title: 'Won', value: 'won'},
          {title: 'Lost', value: 'lost'},
        ],
        layout: 'radio',
      },
      initialValue: 'new',
    }),
    defineField({
      name: 'mauticSynced',
      type: 'boolean',
      title: 'Mautic synced?',
      group: 'meta',
      initialValue: false,
      description:
        'Flips true when Phase 2.x Mautic sync confirms the lead landed in the CRM.',
    }),
    defineField({
      name: 'internalNotes',
      type: 'text',
      title: 'Internal notes (private)',
      group: 'meta',
      rows: 4,
      description: "Erick's private notes. Never shown to the lead.",
    }),

    // ─────────────────────── Contact ───────────────────────
    defineField({
      name: 'firstName',
      type: 'string',
      title: 'First name',
      group: 'contact',
      validation: (r) => r.required().max(100),
    }),
    defineField({
      name: 'lastName',
      type: 'string',
      title: 'Last name',
      group: 'contact',
      validation: (r) => r.required().max(100),
    }),
    defineField({
      name: 'email',
      type: 'string',
      title: 'Email',
      group: 'contact',
      validation: (r) => r.required().email(),
    }),
    defineField({
      name: 'phone',
      type: 'string',
      title: 'Phone',
      group: 'contact',
      validation: (r) => r.required().max(40),
    }),
    defineField({
      name: 'address',
      type: 'object',
      title: 'Address',
      group: 'contact',
      fields: [
        {
          name: 'street',
          type: 'string',
          title: 'Street',
          validation: (r) => r.required().max(200),
        },
        {
          name: 'unit',
          type: 'string',
          title: 'Unit / Apt',
          validation: (r) => r.max(60),
        },
        {
          name: 'city',
          type: 'string',
          title: 'City',
          validation: (r) => r.required().max(100),
        },
        {
          name: 'state',
          type: 'string',
          title: 'State',
          validation: (r) => r.required().max(20),
          initialValue: 'IL',
        },
        {
          name: 'zip',
          type: 'string',
          title: 'ZIP',
          validation: (r) => r.required().max(20),
        },
      ],
    }),

    // ─────────────────────── Project ───────────────────────
    defineField({
      name: 'audience',
      type: 'string',
      title: 'Audience',
      group: 'project',
      options: {
        list: [
          {title: 'Residential', value: 'residential'},
          {title: 'Commercial', value: 'commercial'},
          {title: 'Hardscape', value: 'hardscape'},
        ],
        layout: 'radio',
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'services',
      type: 'array',
      title: 'Services',
      group: 'project',
      of: [{type: 'string'}],
      description:
        'Service slugs the visitor selected on Step 2 (e.g. "lawn-care", "patios-walkways"). Stored as plain strings rather than references so the lead survives even if a service slug changes later.',
    }),
    defineField({
      name: 'primaryService',
      type: 'string',
      title: 'Primary service',
      group: 'project',
      description:
        'Single primary-service slug if the visitor flagged one with the radio.',
    }),
    defineField({
      name: 'otherText',
      type: 'string',
      title: '"Other service" free-text',
      group: 'project',
      description:
        'Optional Step 2 free-text describing a service not in the list. Empty when not used.',
    }),
    defineField({
      name: 'details',
      type: 'object',
      title: 'Step 3 details (audience-conditional)',
      group: 'project',
      description:
        'Flexible bag of Step 3 fields. Shape depends on the audience the visitor picked.',
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
      name: 'contactPreferences',
      type: 'object',
      title: 'Contact preferences',
      group: 'contact',
      fields: [
        {name: 'bestTime', type: 'string', title: 'Best time'},
        {name: 'contactMethod', type: 'string', title: 'Preferred contact method'},
      ],
    }),
  ],
  preview: {
    select: {
      firstName: 'firstName',
      lastName: 'lastName',
      audience: 'audience',
      submittedAt: 'submittedAt',
      status: 'status',
    },
    prepare({firstName, lastName, audience, submittedAt, status}) {
      const name = `${firstName ?? ''} ${lastName ?? ''}`.trim() || '(no name)';
      const subtitle = [audience ?? '—', status ?? 'new', submittedAt ?? '—']
        .filter(Boolean)
        .join(' · ');
      return {title: name, subtitle};
    },
  },
  orderings: [
    {
      name: 'submittedDesc',
      title: 'Submitted (newest first)',
      by: [{field: 'submittedAt', direction: 'desc'}],
    },
    {
      name: 'submittedAsc',
      title: 'Submitted (oldest first)',
      by: [{field: 'submittedAt', direction: 'asc'}],
    },
  ],
});

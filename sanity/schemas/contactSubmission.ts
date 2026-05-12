import {defineField, defineType} from 'sanity';

/**
 * Contact Submission — /contact/ form submissions (Phase 2.08).
 *
 * Written by /api/contact when CONTACT_SUBMIT_ENABLED=true. Mirrors the
 * Phase 2.06 quoteLead pattern (Sanity-first durable write, then best-effort
 * Resend + Mautic).
 *
 * Field shape matches the live ContactForm component (Phase 1.11): single
 * `name` field (NOT split first/last), `category` (audience-like selector
 * with residential/commercial/hardscape/other), email + phone are optional
 * but at least one must be present (form-side D14 lock; the API mirrors).
 */
export const contactSubmission = defineType({
  name: 'contactSubmission',
  title: 'Contact Submission',
  type: 'document',
  groups: [
    {name: 'contact', title: 'Contact', default: true},
    {name: 'message', title: 'Message'},
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
      validation: (r) => r.required(),
      description: 'Client-generated UUID. One per submit (no cross-step persistence).',
    }),
    defineField({
      name: 'locale',
      type: 'string',
      title: 'Locale',
      group: 'meta',
      options: {
        list: [
          {title: 'English', value: 'en'},
          {title: 'Spanish', value: 'es'},
        ],
        layout: 'radio',
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'userAgent',
      type: 'string',
      title: 'User agent',
      group: 'meta',
      readOnly: true,
    }),
    defineField({
      name: 'referrer',
      type: 'string',
      title: 'Referrer',
      group: 'meta',
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
          {title: 'Replied', value: 'replied'},
          {title: 'Closed', value: 'closed'},
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
      description: 'Flips true when the Mautic sync confirms the submission landed in the CRM.',
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
      name: 'name',
      type: 'string',
      title: 'Name',
      group: 'contact',
      validation: (r) => r.required().max(200),
    }),
    defineField({
      name: 'email',
      type: 'string',
      title: 'Email',
      group: 'contact',
      validation: (r) =>
        r.custom((value: string | undefined, ctx) => {
          if (!value) return true;
          const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
          return ok || 'Must be a valid email address';
        }).max(200),
      description: 'Optional. The form requires at least one of email or phone.',
    }),
    defineField({
      name: 'phone',
      type: 'string',
      title: 'Phone',
      group: 'contact',
      validation: (r) => r.max(40),
      description: 'Optional. The form requires at least one of email or phone.',
    }),
    defineField({
      name: 'category',
      type: 'string',
      title: 'Category',
      group: 'contact',
      options: {
        list: [
          {title: 'Residential', value: 'residential'},
          {title: 'Commercial', value: 'commercial'},
          {title: 'Hardscape', value: 'hardscape'},
          {title: 'Other', value: 'other'},
        ],
        layout: 'radio',
      },
      description: 'Optional audience-like selector from the contact form.',
    }),

    // ─────────────────────── Message ───────────────────────
    defineField({
      name: 'message',
      type: 'text',
      title: 'Message',
      group: 'message',
      rows: 6,
      validation: (r) => r.max(5_000),
      description: 'Visitor message body. Optional on the form — may be empty.',
    }),
  ],
  preview: {
    select: {
      name: 'name',
      email: 'email',
      submittedAt: 'submittedAt',
      status: 'status',
    },
    prepare({name, email, submittedAt, status}) {
      const subtitle = [email ?? '—', status ?? 'new', submittedAt ?? '—']
        .filter(Boolean)
        .join(' · ');
      return {title: name ?? '(no name)', subtitle};
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

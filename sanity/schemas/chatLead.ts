import {defineField, defineType} from 'sanity';

/**
 * Chat Lead — visitor lead capture from the AI chat panel (Phase 2.09).
 *
 * Written by /api/chat/lead when AI_CHAT_ENABLED=true. Mirrors the Phase 2.06
 * durable-first pattern (Sanity write first, then best-effort branded email +
 * Mautic). `transcriptExcerpt` snapshots up to 20 turns of conversation so
 * Erick can read context before replying.
 */
export const chatLead = defineType({
  name: 'chatLead',
  title: 'Chat Lead',
  type: 'document',
  groups: [
    {name: 'contact', title: 'Contact', default: true},
    {name: 'transcript', title: 'Transcript'},
    {name: 'meta', title: 'Meta'},
  ],
  fields: [
    // ─────────────────────── Contact ───────────────────────
    defineField({
      name: 'name',
      type: 'string',
      title: 'Name',
      group: 'contact',
      validation: (r) => r.required().max(120),
    }),
    defineField({
      name: 'email',
      type: 'string',
      title: 'Email',
      group: 'contact',
      validation: (r) =>
        r.required().custom((value: string | undefined) => {
          if (!value) return 'Email is required';
          const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
          return ok || 'Must be a valid email address';
        }).max(200),
    }),
    defineField({
      name: 'locale',
      type: 'string',
      title: 'Locale',
      group: 'contact',
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
      name: 'pageContext',
      type: 'url',
      title: 'Page context',
      group: 'contact',
      description: 'The URL the visitor was on when they submitted the lead form.',
    }),

    // ─────────────────────── Meta ───────────────────────
    defineField({
      name: 'sessionId',
      type: 'string',
      title: 'Session ID',
      group: 'meta',
      validation: (r) => r.required(),
      description: 'Per-session UUID from the chat panel (sunset_chat_session_id).',
    }),
    defineField({
      name: 'capturedAt',
      type: 'datetime',
      title: 'Captured at',
      group: 'meta',
      validation: (r) => r.required(),
      initialValue: () => new Date().toISOString(),
      readOnly: true,
    }),
    defineField({
      name: 'triggerReason',
      type: 'string',
      title: 'Trigger reason',
      group: 'meta',
      validation: (r) => r.max(500),
      description:
        "Claude's `flag_high_intent` reason argument if the visitor was flagged ready-to-book in this session, else empty.",
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
          {title: 'Qualified', value: 'qualified'},
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
      description: 'Flips true when the Mautic sync confirms the lead landed in the CRM.',
    }),

    // ─────────────────────── Transcript ───────────────────────
    defineField({
      name: 'transcriptExcerpt',
      type: 'array',
      title: 'Transcript excerpt',
      group: 'transcript',
      description: 'Up to 20 messages from the conversation. UI typically caps at the last 10.',
      validation: (r) => r.max(20),
      of: [
        {
          type: 'object',
          name: 'message',
          fields: [
            defineField({
              name: 'role',
              type: 'string',
              title: 'Role',
              options: {
                list: [
                  {title: 'User', value: 'user'},
                  {title: 'Assistant', value: 'assistant'},
                ],
              },
              validation: (r) => r.required(),
            }),
            defineField({
              name: 'content',
              type: 'text',
              title: 'Content',
              rows: 3,
              validation: (r) => r.required().max(4000),
            }),
            defineField({
              name: 'ts',
              type: 'datetime',
              title: 'Timestamp',
              validation: (r) => r.required(),
            }),
          ],
          preview: {
            select: {role: 'role', content: 'content'},
            prepare({role, content}) {
              const c = typeof content === 'string' ? content : '';
              const truncated = c.length > 80 ? `${c.slice(0, 77)}…` : c;
              return {title: role ?? 'message', subtitle: truncated};
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      email: 'email',
      capturedAt: 'capturedAt',
      locale: 'locale',
      status: 'status',
    },
    prepare({email, capturedAt, locale, status}) {
      const subtitle = [capturedAt ?? '—', locale ?? '—', status ?? 'new']
        .filter(Boolean)
        .join(' · ');
      return {title: email ?? '(no email)', subtitle};
    },
  },
  orderings: [
    {
      name: 'capturedDesc',
      title: 'Captured (newest first)',
      by: [{field: 'capturedAt', direction: 'desc'}],
    },
    {
      name: 'capturedAsc',
      title: 'Captured (oldest first)',
      by: [{field: 'capturedAt', direction: 'asc'}],
    },
  ],
});

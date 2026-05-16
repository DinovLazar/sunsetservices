import {defineField, defineType} from 'sanity';

/**
 * Newsletter Subscriber — footer signup (Phase 2.08).
 *
 * Written by /api/newsletter when NEWSLETTER_SUBMIT_ENABLED=true. Sandbox-aware
 * email send through `sendBrandedEmail()` lands the welcome template in the
 * dev inbox until Resend domain verification flips in Phase 3.11/3.12.
 *
 * The async `email` uniqueness validation is editor-side safety only; the
 * /api/newsletter route handler enforces uniqueness at write time by querying
 * for an existing doc BEFORE creating (Sanity validation runs at publish time
 * in Studio, not on `client.create` from the server route).
 */
export const newsletterSubscriber = defineType({
  name: 'newsletterSubscriber',
  title: 'Newsletter Subscriber',
  type: 'document',
  fields: [
    defineField({
      name: 'email',
      type: 'string',
      title: 'Email',
      validation: (r) =>
        r
          .required()
          .custom<string>((value, ctx) => {
            if (!value) return 'Required';
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              return 'Must be a valid email address';
            }
            return ctx
              .getClient({apiVersion: '2024-10-01'})
              .fetch<string | null>(
                `*[_type == "newsletterSubscriber" && email == $email && _id != $id][0]._id`,
                {email: value, id: ctx.document?._id ?? ''},
              )
              .then((found) => (found ? 'A subscriber with this email already exists.' : true));
          })
          .max(200),
    }),
    defineField({
      name: 'subscribedAt',
      type: 'datetime',
      title: 'Subscribed at',
      validation: (r) => r.required(),
      readOnly: true,
    }),
    defineField({
      name: 'sourcePage',
      type: 'string',
      title: 'Source page',
      description: 'Pathname (e.g. /blog/dupage-patio-cost-2026) where the signup happened.',
    }),
    defineField({
      name: 'locale',
      type: 'string',
      title: 'Locale',
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
      name: 'unsubscribed',
      type: 'boolean',
      title: 'Unsubscribed?',
      initialValue: false,
    }),
    defineField({
      name: 'unsubscribedAt',
      type: 'datetime',
      title: 'Unsubscribed at',
      description:
        'Set by /api/newsletter/unsubscribe when the subscriber clicks the email unsubscribe link. Cleared on resubscribe.',
      readOnly: true,
      hidden: ({parent}) => !parent?.unsubscribed,
    }),
    defineField({
      name: 'unsubscribeToken',
      type: 'string',
      title: 'Unsubscribe token',
      description:
        'Server-generated UUID used in the unsubscribe link. Regenerated on create + resubscribe. Read-only.',
      readOnly: true,
    }),
    defineField({
      name: 'mauticSynced',
      type: 'boolean',
      title: 'Mautic synced?',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      email: 'email',
      subscribedAt: 'subscribedAt',
      unsubscribed: 'unsubscribed',
    },
    prepare({email, subscribedAt, unsubscribed}) {
      const subtitle = [unsubscribed ? 'unsubscribed' : 'active', subscribedAt ?? '—']
        .filter(Boolean)
        .join(' · ');
      return {title: email ?? '(no email)', subtitle};
    },
  },
  orderings: [
    {
      name: 'subscribedDesc',
      title: 'Subscribed (newest first)',
      by: [{field: 'subscribedAt', direction: 'desc'}],
    },
    {
      name: 'subscribedAsc',
      title: 'Subscribed (oldest first)',
      by: [{field: 'subscribedAt', direction: 'asc'}],
    },
  ],
});

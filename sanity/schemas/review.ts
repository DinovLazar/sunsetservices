import {defineField, defineType} from 'sanity';

export const review = defineType({
  name: 'review',
  type: 'document',
  title: 'Review',
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'meta', title: 'Source & taxonomy'},
  ],
  fields: [
    defineField({
      name: 'quote',
      type: 'localizedString',
      title: 'Quote',
      group: 'content',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'attribution',
      type: 'localizedString',
      title: 'Attribution (e.g. "Sarah K., Naperville")',
      group: 'content',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'rating',
      type: 'number',
      title: 'Rating (1–5)',
      group: 'content',
      validation: (r) => r.required().integer().min(1).max(5),
      initialValue: 5,
    }),
    defineField({
      name: 'source',
      type: 'string',
      title: 'Source',
      group: 'meta',
      options: {
        list: [
          {title: 'Google', value: 'google'},
          {title: 'Manual / collected by us', value: 'manual'},
        ],
        layout: 'radio',
      },
      initialValue: 'manual',
    }),
    defineField({
      name: 'sourceUrl',
      type: 'url',
      title: 'Source URL (optional)',
      group: 'meta',
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      title: 'Published at',
      group: 'meta',
    }),
    defineField({
      name: 'city',
      type: 'reference',
      title: 'City (optional)',
      group: 'meta',
      to: [{type: 'location'}],
    }),
    defineField({
      name: 'service',
      type: 'reference',
      title: 'Service (optional)',
      group: 'meta',
      to: [{type: 'service'}],
    }),
    defineField({
      name: 'isFeatured',
      type: 'boolean',
      title: 'Featured?',
      group: 'meta',
      initialValue: false,
    }),
    defineField({
      name: 'placeholder',
      type: 'boolean',
      title: 'Placeholder (pre-launch / pre-Google-API)?',
      group: 'meta',
      description:
        'True for seed testimonials shipped before real reviews flow in via Phase 2.16 Places API. Pages may style these differently or filter them out.',
      initialValue: false,
    }),
  ],
  preview: {
    select: {attribution: 'attribution.en', rating: 'rating', quote: 'quote.en'},
    prepare({attribution, rating, quote}) {
      const stars = typeof rating === 'number' ? '★'.repeat(rating) : '';
      return {
        title: attribution ?? '(no attribution)',
        subtitle: [stars, quote].filter(Boolean).join(' — ').slice(0, 100),
      };
    },
  },
});

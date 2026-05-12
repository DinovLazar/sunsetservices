import {defineField, defineType} from 'sanity';

export const service = defineType({
  name: 'service',
  type: 'document',
  title: 'Service',
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'media', title: 'Media'},
    {name: 'taxonomy', title: 'Taxonomy & ordering'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'title',
      type: 'localizedString',
      title: 'Title',
      group: 'content',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      group: 'taxonomy',
      options: {
        source: (doc) => (doc as {title?: {en?: string}}).title?.en ?? '',
        maxLength: 96,
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'audience',
      type: 'string',
      title: 'Audience',
      group: 'taxonomy',
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
      name: 'dek',
      type: 'localizedString',
      title: 'Dek (one-line tile/subhead)',
      group: 'content',
    }),
    defineField({
      name: 'intro',
      type: 'localizedText',
      title: 'Intro (multi-line narrative)',
      group: 'content',
    }),
    defineField({
      name: 'icon',
      type: 'string',
      title: 'Lucide icon name (PascalCase)',
      group: 'content',
      description: 'e.g. "Scissors", "Sprout", "Wind". Falls back to BadgeCheck.',
    }),
    defineField({
      name: 'heroImage',
      type: 'image',
      title: 'Hero image',
      group: 'media',
      options: {hotspot: true},
    }),
    defineField({
      name: 'imageKey',
      type: 'string',
      title: 'Image asset key (optional)',
      group: 'taxonomy',
      description:
        'Override key for cases where two services share a URL slug across audiences (e.g. "commercial-snow-removal"). Defaults to slug when blank.',
    }),
    defineField({
      name: 'pricingMode',
      type: 'string',
      title: 'Pricing mode',
      group: 'content',
      options: {
        list: [
          {title: 'Explainer (no price)', value: 'explainer'},
          {title: 'Price (starting at $X)', value: 'price'},
        ],
        layout: 'radio',
      },
      initialValue: 'explainer',
    }),
    defineField({
      name: 'priceIncludes',
      type: 'array',
      title: 'Price includes (bullets)',
      group: 'content',
      of: [{type: 'localizedString'}],
      description: 'Only used when pricingMode = "price".',
      hidden: ({parent}) => parent?.pricingMode !== 'price',
    }),
    defineField({
      name: 'faqs',
      type: 'array',
      title: 'FAQs',
      group: 'content',
      of: [{type: 'reference', to: [{type: 'faq'}]}],
    }),
    defineField({
      name: 'isFeatured',
      type: 'boolean',
      title: 'Featured?',
      group: 'taxonomy',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      type: 'number',
      title: 'Order (sort within audience)',
      group: 'taxonomy',
      validation: (r) => r.integer().min(0),
    }),
    defineField({
      name: 'seo',
      type: 'localizedSeo',
      title: 'SEO',
      group: 'seo',
    }),
  ],
  preview: {
    select: {title: 'title.en', audience: 'audience', slug: 'slug.current', media: 'heroImage'},
    prepare({title, audience, slug, media}) {
      return {
        title: title ?? '(untitled service)',
        subtitle: [audience, slug].filter(Boolean).join(' / '),
        media,
      };
    },
  },
});

import {defineField, defineType} from 'sanity';

export const blogPost = defineType({
  name: 'blogPost',
  type: 'document',
  title: 'Blog Post',
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'media', title: 'Media'},
    {name: 'taxonomy', title: 'Taxonomy'},
    {name: 'seo', title: 'SEO'},
    {name: 'meta', title: 'Meta'},
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
      name: 'eyebrow',
      type: 'localizedString',
      title: 'Eyebrow (small label above H1)',
      group: 'content',
    }),
    defineField({
      name: 'dek',
      type: 'localizedString',
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
      name: 'publishedAt',
      type: 'datetime',
      title: 'Published at',
      group: 'taxonomy',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'author',
      type: 'string',
      title: 'Author byline',
      group: 'taxonomy',
      initialValue: 'Erick Sotomayor',
    }),
    defineField({
      name: 'category',
      type: 'string',
      title: 'Category',
      group: 'taxonomy',
      options: {
        list: [
          {title: 'How-to', value: 'how-to'},
          {title: 'Cost guide', value: 'cost-guide'},
          {title: 'Seasonal', value: 'seasonal'},
          {title: 'Industry news', value: 'industry-news'},
          {title: 'Audience', value: 'audience'},
        ],
        layout: 'radio',
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'featuredImage',
      type: 'image',
      title: 'Featured image',
      group: 'media',
      options: {hotspot: true},
      description:
        'Pre-Phase-2.04: leave empty and the page falls back to /og/fallback. Phase 2.04 uploads real photos.',
    }),
    defineField({
      name: 'featuredImageAlt',
      type: 'localizedString',
      title: 'Featured-image alt',
      group: 'media',
    }),
    defineField({
      name: 'faqs',
      type: 'array',
      title: 'FAQs',
      group: 'content',
      of: [{type: 'reference', to: [{type: 'faq'}]}],
    }),
    defineField({
      name: 'citySlug',
      type: 'string',
      title: 'City slug (optional, city-targeted posts)',
      group: 'taxonomy',
      description:
        'Set to a city slug (e.g. "naperville") to render the per-city ServiceAreaStrip inline.',
    }),
    defineField({
      name: 'crossLinkAudience',
      type: 'string',
      title: 'Inline cross-link — audience',
      group: 'taxonomy',
      description: 'Optional. Together with serviceSlug, splices a ServiceCard into the body between H2s.',
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
      name: 'crossLinkServiceSlug',
      type: 'string',
      title: 'Inline cross-link — service slug',
      group: 'taxonomy',
      description: 'e.g. "lawn-care". Resolves against services.ts together with crossLinkAudience.',
    }),
    defineField({
      name: 'seo',
      type: 'localizedSeo',
      title: 'SEO',
      group: 'seo',
    }),
    // Phase 2.16 — automation-agent metadata. Optional fields populated by
    // /api/cron/blog-draft-monthly when an Anthropic-generated draft is
    // approved and published. Manual posts written directly in Studio leave
    // these empty.
    defineField({
      name: 'automatedTopicId',
      type: 'string',
      title: 'Automated topic ID',
      group: 'meta',
      readOnly: true,
      description:
        'Set when an auto-published post landed via the monthly blog cron. Matches a BLOG_TOPICS entry in src/data/blogTopics.ts. The topic picker reads this field across all blogPosts to skip topics already used.',
    }),
    defineField({
      name: 'automatedGeneratedAt',
      type: 'datetime',
      title: 'Automated draft generated at',
      group: 'meta',
      readOnly: true,
    }),
    defineField({
      name: 'automatedModelUsed',
      type: 'string',
      title: 'Anthropic model used',
      group: 'meta',
      readOnly: true,
      description: 'e.g. "claude-sonnet-4-6". Snapshot from the cron run.',
    }),
  ],
  orderings: [
    {
      title: 'Published date, newest first',
      name: 'publishedDesc',
      by: [{field: 'publishedAt', direction: 'desc'}],
    },
  ],
  preview: {
    select: {title: 'title.en', category: 'category', media: 'featuredImage'},
    prepare({title, category, media}) {
      return {
        title: title ?? '(untitled post)',
        subtitle: category ?? 'no category',
        media,
      };
    },
  },
});

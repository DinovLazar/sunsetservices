import {defineField, defineType} from 'sanity';

export const resourceArticle = defineType({
  name: 'resourceArticle',
  type: 'document',
  title: 'Resource Article',
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'media', title: 'Media'},
    {name: 'taxonomy', title: 'Taxonomy'},
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
      name: 'eyebrow',
      type: 'localizedString',
      title: 'Eyebrow',
      group: 'content',
    }),
    defineField({
      name: 'dek',
      type: 'localizedString',
      title: 'Dek',
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
      name: 'category',
      type: 'string',
      title: 'Category',
      group: 'taxonomy',
      options: {
        list: [
          {title: 'Lawn care', value: 'lawn-care'},
          {title: 'Hardscape', value: 'hardscape'},
          {title: 'Snow & winter', value: 'snow-and-winter'},
          {title: 'Buying guides', value: 'buying-guides'},
          {title: 'Local permits', value: 'local-permits'},
        ],
        layout: 'radio',
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'schemaType',
      type: 'string',
      title: 'Schema.org type',
      group: 'taxonomy',
      options: {
        list: [
          {title: 'Article', value: 'Article'},
          {title: 'HowTo', value: 'HowTo'},
        ],
        layout: 'radio',
      },
      initialValue: 'Article',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'faqs',
      type: 'array',
      title: 'FAQs',
      group: 'content',
      of: [{type: 'reference', to: [{type: 'faq'}]}],
    }),
    defineField({
      name: 'featuredImage',
      type: 'image',
      title: 'Featured image (card thumbnail)',
      group: 'media',
      options: {hotspot: true},
    }),
    defineField({
      name: 'featuredImageAlt',
      type: 'localizedString',
      title: 'Featured-image alt',
      group: 'media',
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
  ],
  preview: {
    select: {
      title: 'title.en',
      category: 'category',
      schemaType: 'schemaType',
      media: 'featuredImage',
    },
    prepare({title, category, schemaType, media}) {
      return {
        title: title ?? '(untitled article)',
        subtitle: [category, schemaType].filter(Boolean).join(' · '),
        media,
      };
    },
  },
});

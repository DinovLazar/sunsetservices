import {defineArrayMember, defineField, defineType} from 'sanity';

export const project = defineType({
  name: 'project',
  type: 'document',
  title: 'Project',
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'media', title: 'Media'},
    {name: 'beforeAfter', title: 'Before / After'},
    {name: 'taxonomy', title: 'Taxonomy'},
    {name: 'meta', title: 'Facts & SEO'},
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
      name: 'services',
      type: 'array',
      title: 'Services delivered',
      group: 'taxonomy',
      of: [{type: 'reference', to: [{type: 'service'}]}],
    }),
    defineField({
      name: 'city',
      type: 'reference',
      title: 'City',
      group: 'taxonomy',
      to: [{type: 'location'}],
    }),
    defineField({
      name: 'year',
      type: 'number',
      title: 'Year completed',
      group: 'taxonomy',
      validation: (r) => r.integer().min(2000).max(2100),
    }),
    defineField({
      name: 'shortDek',
      type: 'localizedString',
      title: 'Short dek (≤120 chars)',
      group: 'content',
    }),
    defineField({
      name: 'narrativeHeading',
      type: 'localizedString',
      title: 'Narrative H2 (falls back to title)',
      group: 'content',
    }),
    defineField({
      name: 'narrative',
      type: 'localizedText',
      title: 'Narrative body',
      group: 'content',
    }),
    defineField({
      name: 'materials',
      type: 'array',
      title: 'Materials list',
      group: 'content',
      of: [{type: 'localizedString'}],
    }),
    defineField({
      name: 'leadImage',
      type: 'image',
      title: 'Lead image (hero)',
      group: 'media',
      options: {hotspot: true},
    }),
    defineField({
      name: 'leadAlt',
      type: 'localizedString',
      title: 'Lead-image alt text',
      group: 'media',
    }),
    defineField({
      name: 'gallery',
      type: 'array',
      title: 'Gallery',
      group: 'media',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'galleryEntry',
          title: 'Gallery entry',
          fields: [
            defineField({
              name: 'image',
              type: 'image',
              title: 'Image',
              options: {hotspot: true},
              validation: (r) => r.required(),
            }),
            defineField({
              name: 'alt',
              type: 'localizedString',
              title: 'Alt text',
              validation: (r) => r.required(),
            }),
          ],
          preview: {
            select: {title: 'alt.en', media: 'image'},
            prepare({title, media}) {
              return {title: title ?? '(no alt)', media};
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'hasBeforeAfter',
      type: 'boolean',
      title: 'Has before/after pair?',
      group: 'beforeAfter',
      initialValue: false,
    }),
    defineField({
      name: 'beforeImage',
      type: 'image',
      title: 'Before image',
      group: 'beforeAfter',
      options: {hotspot: true},
      hidden: ({parent}) => !parent?.hasBeforeAfter,
    }),
    defineField({
      name: 'beforeAlt',
      type: 'localizedString',
      title: 'Before alt text',
      group: 'beforeAfter',
      hidden: ({parent}) => !parent?.hasBeforeAfter,
    }),
    defineField({
      name: 'afterImage',
      type: 'image',
      title: 'After image',
      group: 'beforeAfter',
      options: {hotspot: true},
      hidden: ({parent}) => !parent?.hasBeforeAfter,
    }),
    defineField({
      name: 'afterAlt',
      type: 'localizedString',
      title: 'After alt text',
      group: 'beforeAfter',
      hidden: ({parent}) => !parent?.hasBeforeAfter,
    }),
    defineField({
      name: 'facts',
      type: 'object',
      title: 'Project facts',
      group: 'meta',
      fields: [
        defineField({name: 'sqft', type: 'number', title: 'Square feet'}),
        defineField({name: 'durationDays', type: 'number', title: 'Duration (days)'}),
        defineField({name: 'crewSize', type: 'number', title: 'Crew size'}),
      ],
    }),
    defineField({
      name: 'seo',
      type: 'localizedSeo',
      title: 'SEO',
      group: 'meta',
    }),
  ],
  preview: {
    select: {title: 'title.en', audience: 'audience', slug: 'slug.current', media: 'leadImage'},
    prepare({title, audience, slug, media}) {
      return {
        title: title ?? '(untitled project)',
        subtitle: [audience, slug].filter(Boolean).join(' / '),
        media,
      };
    },
  },
});

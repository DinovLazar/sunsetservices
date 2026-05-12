import {defineField, defineType} from 'sanity';

export const location = defineType({
  name: 'location',
  type: 'document',
  title: 'Location (City)',
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'media', title: 'Media'},
    {name: 'trust', title: 'Trust & services'},
    {name: 'geo', title: 'Geo & address'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      title: 'City name (not localized — proper noun)',
      group: 'content',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      group: 'content',
      options: {
        source: 'name',
        maxLength: 64,
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'tagline',
      type: 'localizedString',
      title: 'Tagline / subhead',
      group: 'content',
    }),
    defineField({
      name: 'microbarLine',
      type: 'localizedString',
      title: 'Microbar one-liner (above hero)',
      group: 'content',
    }),
    defineField({
      name: 'heroImage',
      type: 'image',
      title: 'Hero image',
      group: 'media',
      options: {hotspot: true},
    }),
    defineField({
      name: 'trust',
      type: 'object',
      title: 'Trust numbers',
      group: 'trust',
      fields: [
        defineField({
          name: 'yearsServing',
          type: 'number',
          title: 'Years serving',
          validation: (r) => r.integer().min(0),
        }),
        defineField({
          name: 'projectsCount',
          type: 'number',
          title: 'Projects completed',
          validation: (r) => r.integer().min(0),
        }),
        defineField({
          name: 'responseDays',
          type: 'number',
          title: 'Response time (days)',
          validation: (r) => r.integer().min(0),
        }),
      ],
    }),
    defineField({
      name: 'featuredServices',
      type: 'array',
      title: 'Featured services (max 6)',
      group: 'trust',
      of: [{type: 'reference', to: [{type: 'service'}]}],
      validation: (r) => r.max(6),
    }),
    defineField({
      name: 'testimonials',
      type: 'array',
      title: 'Testimonials',
      group: 'trust',
      of: [{type: 'reference', to: [{type: 'review'}]}],
    }),
    defineField({
      name: 'whyLocal',
      type: 'localizedText',
      title: 'Why local (≈120 words per locale)',
      group: 'content',
    }),
    defineField({
      name: 'faqs',
      type: 'array',
      title: 'FAQs',
      group: 'content',
      of: [{type: 'reference', to: [{type: 'faq'}]}],
    }),
    defineField({
      name: 'geo',
      type: 'object',
      title: 'Lat / lng',
      group: 'geo',
      fields: [
        defineField({name: 'lat', type: 'number', title: 'Latitude'}),
        defineField({name: 'lng', type: 'number', title: 'Longitude'}),
      ],
    }),
    defineField({
      name: 'pin',
      type: 'object',
      title: 'SVG map pin (x/y inside 600×500 viewBox)',
      group: 'geo',
      fields: [
        defineField({name: 'x', type: 'number', title: 'x'}),
        defineField({name: 'y', type: 'number', title: 'y'}),
      ],
    }),
    defineField({
      name: 'postalCode',
      type: 'string',
      title: 'Postal code (optional)',
      group: 'geo',
    }),
    defineField({
      name: 'seo',
      type: 'localizedSeo',
      title: 'SEO',
      group: 'seo',
    }),
  ],
  preview: {
    select: {title: 'name', slug: 'slug.current', media: 'heroImage'},
    prepare({title, slug, media}) {
      return {
        title: title ?? '(unnamed city)',
        subtitle: slug ?? '',
        media,
      };
    },
  },
});

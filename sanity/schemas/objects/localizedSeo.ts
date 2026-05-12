import {defineField, defineType} from 'sanity';

export const localizedSeo = defineType({
  name: 'localizedSeo',
  type: 'object',
  title: 'SEO (bilingual)',
  fields: [
    defineField({
      name: 'title',
      type: 'localizedString',
      title: 'SEO title',
      description: '≤60 chars recommended; falls back to document title.',
    }),
    defineField({
      name: 'description',
      type: 'localizedText',
      title: 'SEO description',
      description: '≤160 chars recommended; falls back to dek.',
    }),
  ],
  options: {collapsible: true, collapsed: true},
});

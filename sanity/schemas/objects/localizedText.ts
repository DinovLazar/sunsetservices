import {defineField, defineType} from 'sanity';

export const localizedText = defineType({
  name: 'localizedText',
  type: 'object',
  title: 'Localized text',
  fields: [
    defineField({
      name: 'en',
      type: 'text',
      title: 'English',
      rows: 4,
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'es',
      type: 'text',
      title: 'Spanish (mark [TBR] if pending native review)',
      rows: 4,
    }),
  ],
});

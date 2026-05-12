import {defineField, defineType} from 'sanity';

export const localizedString = defineType({
  name: 'localizedString',
  type: 'object',
  title: 'Localized string',
  fields: [
    defineField({
      name: 'en',
      type: 'string',
      title: 'English',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'es',
      type: 'string',
      title: 'Spanish (mark [TBR] if pending native review)',
    }),
  ],
});

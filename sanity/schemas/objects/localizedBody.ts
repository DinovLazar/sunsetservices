import {defineArrayMember, defineField, defineType} from 'sanity';

const blockMembers = [
  defineArrayMember({type: 'block'}),
  defineArrayMember({
    type: 'image',
    options: {hotspot: true},
    fields: [
      defineField({
        name: 'alt',
        type: 'localizedString',
        title: 'Alt text',
        validation: (r) => r.required(),
      }),
      defineField({
        name: 'caption',
        type: 'localizedString',
        title: 'Caption',
      }),
    ],
  }),
];

export const localizedBody = defineType({
  name: 'localizedBody',
  type: 'object',
  title: 'Localized body (Portable Text)',
  fields: [
    defineField({
      name: 'en',
      type: 'array',
      title: 'English',
      of: blockMembers,
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'es',
      type: 'array',
      title: 'Spanish',
      of: blockMembers,
    }),
  ],
});

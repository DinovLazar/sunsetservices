import {defineField, defineType} from 'sanity';

export const team = defineType({
  name: 'team',
  type: 'document',
  title: 'Team member',
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'media', title: 'Media'},
    {name: 'meta', title: 'Ordering & credentials'},
  ],
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      title: 'Name (not localized — proper noun)',
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
      name: 'role',
      type: 'localizedString',
      title: 'Role',
      group: 'content',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'bio',
      type: 'localizedText',
      title: 'Bio',
      group: 'content',
    }),
    defineField({
      name: 'portrait',
      type: 'image',
      title: 'Portrait',
      group: 'media',
      options: {hotspot: true},
    }),
    defineField({
      name: 'portraitAlt',
      type: 'localizedString',
      title: 'Portrait alt text',
      group: 'media',
    }),
    defineField({
      name: 'order',
      type: 'number',
      title: 'Display order',
      group: 'meta',
      validation: (r) => r.integer().min(0),
    }),
    defineField({
      name: 'isFounder',
      type: 'boolean',
      title: 'Founder?',
      group: 'meta',
      initialValue: false,
    }),
    defineField({
      name: 'credentials',
      type: 'array',
      title: 'Credentials',
      group: 'meta',
      of: [{type: 'string'}],
    }),
  ],
  preview: {
    select: {title: 'name', subtitle: 'role.en', media: 'portrait'},
    prepare({title, subtitle, media}) {
      return {
        title: title ?? '(no name)',
        subtitle: subtitle ?? '',
        media,
      };
    },
  },
});

import {defineField, defineType} from 'sanity';

/**
 * One photo, with its alt text — the unit every project photo set is built from.
 *
 * Phase M.18 promoted this from an inline object inside `project.gallery` to a
 * named type, because a PSS-002 project places photos in SEVERAL sets (the site
 * shots, the in-progress shots, the finished shots, the gallery) and they must
 * all be the same shape — for the Studio, for the site, and for the client portal
 * that writes them.
 *
 * Alt text is required: a photo with no description is unusable to a screen-reader
 * user, and every one of these ends up on a public page.
 */
export const galleryEntry = defineType({
  name: 'galleryEntry',
  type: 'object',
  title: 'Photo',
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
});

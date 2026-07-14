import {defineField, defineType} from 'sanity';

/**
 * Phase M.18 — the repeatable blocks of a PSS-002 project feature page.
 *
 * A project page used to be one free-text `narrative` plus a flat gallery. The
 * PSS-002 standard writes a project as a *story*: an at-a-glance facts strip, a
 * run of named sections each with its own photos, a materials list, a homeowner
 * testimonial, an FAQ that answer engines can quote, and the internal links that
 * tie the page into the rest of the site.
 *
 * These are the repeatable parts. All of them are portal-editable (the Vertex
 * client portal writes them through its `client_content_types` config), so every
 * field name here is a plain, flat identifier — never a nested path.
 */

/** One row of the at-a-glance strip: "Walls" → "~130 lin ft, Unilock Olde Quarry". */
export const projectFact = defineType({
  name: 'projectFact',
  type: 'object',
  title: 'Fact',
  fields: [
    defineField({
      name: 'label',
      type: 'localizedString',
      title: 'Label',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'value',
      type: 'localizedString',
      title: 'Value',
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: {title: 'label.en', subtitle: 'value.en'},
  },
});

/**
 * One FAQ entry on a project page. These are the questions answer engines quote,
 * so they are emitted as FAQPage JSON-LD by the project route.
 */
export const projectFaq = defineType({
  name: 'projectFaq',
  type: 'object',
  title: 'FAQ entry',
  fields: [
    defineField({
      name: 'question',
      type: 'localizedString',
      title: 'Question',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'answer',
      type: 'localizedText',
      title: 'Answer',
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: {title: 'question.en', subtitle: 'answer.en'},
  },
});

/** One internal link out of a project page (a service, a division, a city page). */
export const projectLink = defineType({
  name: 'projectLink',
  type: 'object',
  title: 'Internal link',
  fields: [
    defineField({
      name: 'label',
      type: 'localizedString',
      title: 'Label',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'href',
      type: 'string',
      title: 'Path',
      description:
        'A path on this site, starting with "/" — e.g. /hardscape/retaining-walls. Not a full URL.',
      validation: (r) =>
        r
          .required()
          .regex(/^\/[A-Za-z0-9/_-]*$/, {name: 'site path'})
          .error('Use a path on this site, starting with "/".'),
    }),
  ],
  preview: {
    select: {title: 'label.en', subtitle: 'href'},
  },
});

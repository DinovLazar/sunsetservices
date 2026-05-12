import {defineField, defineType} from 'sanity';

export const faq = defineType({
  name: 'faq',
  type: 'document',
  title: 'FAQ',
  fields: [
    defineField({
      name: 'question',
      type: 'localizedString',
      title: 'Question',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'answer',
      type: 'localizedString',
      title: 'Answer',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'scope',
      type: 'string',
      title: 'Scope tag',
      description:
        'Flat tag identifying where this FAQ applies. Use one of: "general", or a "prefix:slug" pair — "service:<slug>", "audience:<residential|commercial|hardscape>", "city:<slug>", "blog:<slug>", "resource:<slug>".',
      initialValue: 'general',
      validation: (r) =>
        r.custom((value) => {
          if (!value) return 'Scope is required';
          if (typeof value !== 'string') return 'Scope must be a string';
          if (value === 'general') return true;
          const prefixes = ['service:', 'audience:', 'city:', 'blog:', 'resource:'];
          if (prefixes.some((p) => value.startsWith(p) && value.length > p.length)) {
            return true;
          }
          return 'Scope must be "general" or start with service:/audience:/city:/blog:/resource: followed by a slug.';
        }),
    }),
    defineField({
      name: 'order',
      type: 'number',
      title: 'Order',
      validation: (r) => r.integer().min(0),
    }),
  ],
  orderings: [
    {
      title: 'Scope, then order',
      name: 'scopeOrder',
      by: [
        {field: 'scope', direction: 'asc'},
        {field: 'order', direction: 'asc'},
      ],
    },
  ],
  preview: {
    select: {title: 'question.en', scope: 'scope'},
    prepare({title, scope}) {
      return {
        title: title ?? '(no question)',
        subtitle: scope ?? 'no scope',
      };
    },
  },
});

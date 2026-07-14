import {defineField, defineType} from 'sanity';

export const project = defineType({
  name: 'project',
  type: 'document',
  title: 'Project',
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'story', title: 'Story sections'},
    {name: 'media', title: 'Media'},
    {name: 'beforeAfter', title: 'Before / After'},
    {name: 'taxonomy', title: 'Taxonomy'},
    {name: 'meta', title: 'Facts & SEO'},
    {name: 'automation', title: 'Automation (readonly)'},
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
      name: 'featuredOnHome',
      type: 'boolean',
      title: 'Feature on homepage hero',
      group: 'taxonomy',
      description:
        "Phase M.16 — when ON, this project's lead image becomes the homepage Concept A hero (newest year wins if several are flagged). OFF by default; when nothing is flagged the homepage falls back to the placeholder hero.",
      initialValue: false,
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
      name: 'durationWeeks',
      type: 'number',
      title: 'Duration (weeks)',
      group: 'taxonomy',
      description: 'Used by the hero meta line and the Facts table.',
      validation: (r) => r.integer().min(1),
    }),
    defineField({
      name: 'shortDek',
      type: 'localizedString',
      title: 'Short dek (≤120 chars)',
      group: 'content',
    }),
    // ───────────────────── Legacy narrative (pre-M.18) ─────────────────────
    // Kept, not removed. A project written before the PSS-002 story sections
    // existed renders exactly as it always did: the detail route falls back to
    // <ProjectNarrative> whenever `overview` and the story sections are empty.
    // New projects leave these blank and write the story sections below.
    defineField({
      name: 'narrativeHeading',
      type: 'localizedString',
      title: 'Narrative H2 (legacy — falls back to title)',
      group: 'content',
    }),
    defineField({
      name: 'narrative',
      type: 'localizedText',
      title: 'Narrative body (legacy — superseded by the story sections)',
      group: 'content',
    }),

    // ═══════════════════ M.18 — the PSS-002 project feature ═══════════════════
    // A project reads as a story: an at-a-glance strip, then a run of named
    // sections, each with its own photos. Every section is OPTIONAL — an empty
    // one simply doesn't render, so a project can be as short or as complete as
    // its photos and its copy allow.

    defineField({
      name: 'atAGlance',
      type: 'array',
      title: 'At a glance',
      group: 'content',
      description:
        'The facts strip under the hero — Location, Service, Walls, Planting, Lighting, Completed…',
      of: [{type: 'projectFact'}],
    }),
    defineField({
      name: 'overview',
      type: 'localizedText',
      title: 'Overview — the story (the lead)',
      group: 'story',
      description: 'The opening paragraphs. What the project was and why it matters.',
    }),

    defineField({
      name: 'siteHeading',
      type: 'localizedString',
      title: 'Section 1 heading (default: "The site & the goal")',
      group: 'story',
    }),
    defineField({
      name: 'site',
      type: 'localizedText',
      title: 'Section 1 — the site & the goal',
      group: 'story',
    }),
    defineField({
      name: 'sitePhotos',
      type: 'array',
      title: 'Section 1 photos (the "before" shots)',
      group: 'story',
      of: [{type: 'galleryEntry'}],
    }),

    defineField({
      name: 'approachHeading',
      type: 'localizedString',
      title: 'Section 2 heading (default: "Our approach")',
      group: 'story',
    }),
    defineField({
      name: 'approach',
      type: 'localizedText',
      title: 'Section 2 — our approach',
      group: 'story',
    }),
    defineField({
      name: 'approachPhotos',
      type: 'array',
      title: 'Section 2 photos (in-progress shots)',
      group: 'story',
      of: [{type: 'galleryEntry'}],
    }),

    defineField({
      name: 'workHeading',
      type: 'localizedString',
      title: 'Section 3 heading (e.g. "The landscaping — designed planting beds")',
      group: 'story',
    }),
    defineField({
      name: 'work',
      type: 'localizedText',
      title: 'Section 3 — the work in detail',
      group: 'story',
    }),
    defineField({
      name: 'workPhotos',
      type: 'array',
      title: 'Section 3 photos',
      group: 'story',
      of: [{type: 'galleryEntry'}],
    }),

    defineField({
      name: 'featureHeading',
      type: 'localizedString',
      title: 'Section 4 heading (e.g. "The lighting — Kichler landscape lighting")',
      group: 'story',
    }),
    defineField({
      name: 'feature',
      type: 'localizedText',
      title: 'Section 4 — the standout feature',
      group: 'story',
    }),
    defineField({
      name: 'featurePhotos',
      type: 'array',
      title: 'Section 4 photos',
      group: 'story',
      of: [{type: 'galleryEntry'}],
    }),

    defineField({
      name: 'resultHeading',
      type: 'localizedString',
      title: 'Section 5 heading (default: "The result")',
      group: 'story',
    }),
    defineField({
      name: 'result',
      type: 'localizedText',
      title: 'Section 5 — the result',
      group: 'story',
    }),
    defineField({
      name: 'resultPhotos',
      type: 'array',
      title: 'Section 5 photos (the finished job)',
      group: 'story',
      of: [{type: 'galleryEntry'}],
    }),

    defineField({
      name: 'durabilityHeading',
      type: 'localizedString',
      title: 'Section 6 heading (default: "Long-term durability & value")',
      group: 'story',
    }),
    defineField({
      name: 'durability',
      type: 'localizedText',
      title: 'Section 6 — long-term durability & value',
      group: 'story',
    }),

    defineField({
      name: 'testimonialStatement',
      type: 'localizedText',
      title: 'Homeowner satisfaction — in Sunset\u2019s voice',
      group: 'story',
      description:
        'What we can say about how happy they are. Publish a direct quote only with permission.',
    }),
    defineField({
      name: 'testimonialQuote',
      type: 'localizedText',
      title: 'Pull-quote — the homeowner\u2019s own words',
      group: 'story',
    }),
    defineField({
      name: 'testimonialAttribution',
      type: 'string',
      title: 'Pull-quote attribution (e.g. "Homeowner, Sugar Grove")',
      group: 'story',
    }),

    defineField({
      name: 'materialsNote',
      type: 'localizedText',
      title: 'Materials — intro note (optional)',
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
      title: 'Gallery (photos not placed in a story section)',
      group: 'media',
      of: [{type: 'galleryEntry'}],
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
      name: 'faq',
      type: 'array',
      title: 'FAQ (emitted as FAQPage structured data)',
      group: 'meta',
      description:
        'The questions answer engines quote. Each entry becomes a Q&A on the page and in the FAQPage JSON-LD.',
      of: [{type: 'projectFaq'}],
    }),
    defineField({
      name: 'internalLinks',
      type: 'array',
      title: 'Internal links from this page',
      group: 'meta',
      of: [{type: 'projectLink'}],
    }),
    defineField({
      name: 'keywords',
      type: 'array',
      title: 'Target keywords (not rendered; used for metadata)',
      group: 'meta',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
    }),
    defineField({
      name: 'seo',
      type: 'localizedSeo',
      title: 'SEO',
      group: 'meta',
    }),
    // ─────────────────────── Automation (Phase 2.17) ───────────────────────
    // Populated only by publishPortfolioDraft() from the ServiceM8-driven
    // pipeline. Projects authored directly in Studio leave these empty.
    defineField({
      name: 'automatedSourceEventId',
      type: 'string',
      title: 'Source ServiceM8 eventId',
      group: 'automation',
      readOnly: true,
      description:
        'The ServiceM8-supplied eventId that drove this auto-published project. Empty for manually authored projects.',
    }),
    defineField({
      name: 'automatedGeneratedAt',
      type: 'datetime',
      title: 'Auto-generated at',
      group: 'automation',
      readOnly: true,
      description: 'When the originating portfolioDraftPending was generated (Anthropic call timestamp).',
    }),
    defineField({
      name: 'automatedModelUsed',
      type: 'string',
      title: 'Anthropic model used',
      group: 'automation',
      readOnly: true,
      description: 'e.g. "claude-sonnet-4-6". Captured from the originating draft.',
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

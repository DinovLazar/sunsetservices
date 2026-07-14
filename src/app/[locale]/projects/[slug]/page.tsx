import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import ProjectHero from '@/components/sections/projects/detail/ProjectHero';
import ProjectNarrative from '@/components/sections/projects/detail/ProjectNarrative';
import ProjectGallery from '@/components/sections/projects/detail/ProjectGallery';
import ProjectFacts from '@/components/sections/projects/detail/ProjectFacts';
import BeforeAfterToggle from '@/components/sections/projects/detail/BeforeAfterToggle';
import RelatedProjects from '@/components/sections/projects/detail/RelatedProjects';
// Phase M.18 — the PSS-002 project feature sections.
import ProjectAtAGlance from '@/components/sections/projects/detail/ProjectAtAGlance';
import ProjectStory, {
  hasContent,
  type StorySection,
} from '@/components/sections/projects/detail/ProjectStory';
import ProjectMaterials from '@/components/sections/projects/detail/ProjectMaterials';
import ProjectTestimonial from '@/components/sections/projects/detail/ProjectTestimonial';
import ProjectFaqSection from '@/components/sections/projects/detail/ProjectFaqSection';
import ProjectInternalLinks from '@/components/sections/projects/detail/ProjectInternalLinks';
import {buildContentFaqSchema} from '@/lib/schema/article';
import CTA from '@/components/sections/CTA';
import {selectRelatedProjects, type Project} from '@/data/projects';
import {getLocation} from '@/data/locations';
import {PROJECT_LEAD, PROJECT_GALLERY, PROJECT_BEFORE_AFTER} from '@/data/imageMap';
import {buildBreadcrumbList} from '@/lib/schema/breadcrumb';
import {buildProjectCreativeWork} from '@/lib/schema/project';
import {BUSINESS_URL} from '@/lib/constants/business';
import {routing} from '@/i18n/routing';
import {canonicalUrl, hreflangAlternates} from '@/lib/seo/urls';
import {buildSocialMetadata} from '@/lib/seo/openGraph';
import {stripStreetNumber} from '@/lib/projects/stripStreetNumber';
import {getProjectDivision} from '@/lib/projects/getProjectDivision';
import {SERVICES} from '@/data/services';
import {
  getAllProjects,
  getAllProjectSlugs,
  getProjectBySlug,
} from '@sanity-lib/queries';
import {
  sanityProjectDetailToTs,
  sanityProjectSummaryToTs,
} from '@/lib/sanity-adapters';

type Locale = 'en' | 'es';

// Phase 2.05 — ISR (30 min). Webhook-driven revalidation deferred.
export const revalidate = 1800;

// Phase M.10c (2026-05-27) — `stripStreetNumber` extracted to
// `@/lib/projects/stripStreetNumber` so the /projects index tile titles
// (addendum step A-extra) can reuse the same render-time strip.

export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs();
  return slugs.map((slug) => ({slug}));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string; slug: string}>;
}): Promise<Metadata> {
  const {locale, slug} = await params;
  const sanityProject = await getProjectBySlug(slug);
  if (!sanityProject) return {};
  const project = sanityProjectDetailToTs(sanityProject);
  const loc = (routing.locales.includes(locale as Locale) ? locale : 'en') as Locale;

  const city = getLocation(project.citySlug);
  const cityName = city?.name ?? project.citySlug;
  // Phase M.10c addendum — title label now division-derived (was audience).
  const division = getProjectDivision(project, SERVICES);
  const divisionLabel: Record<Locale, Record<typeof division, string>> = {
    en: {
      landscape: 'landscape',
      hardscape: 'hardscape',
      waterproofing: 'waterproofing',
      'snow-removal': 'snow removal',
      trenchless: 'trenchless',
    },
    es: {
      landscape: 'paisajismo',
      hardscape: 'hardscape',
      waterproofing: 'impermeabilización',
      'snow-removal': 'remoción de nieve',
      trenchless: 'perforación',
    },
  };
  const labelForTitle = divisionLabel[loc][division];

  // Phase M.01d: address-bearing title strings (when M.01c uploader lands
  // real project content) get the leading street number stripped from the
  // rendered output — Sanity keeps the full address; visitors don't see it.
  const displayTitle = stripStreetNumber(project.title[loc]);
  // Phase M.18 — a hand-written SEO title/description wins when the project has
  // one (PSS-002 §4 ships them per project); otherwise the derived pair stands.
  const seoTitle = sanityProject.seo?.title?.[loc]?.trim();
  const seoDescription = sanityProject.seo?.description?.[loc]?.trim();
  const title =
    seoTitle ||
    `${displayTitle} — ${labelForTitle} project in ${cityName} · Sunset Services`;
  const description =
    seoDescription || `${project.shortDek[loc]} ${cityName}, IL. By Sunset Services.`;
  const keywords = (sanityProject.keywords ?? []).filter(Boolean);
  const path = `/projects/${slug}`;
  // Phase M.10d §B — prefer the project's lead photo on the OG card so the
  // social preview shows the actual job. Falls back to /og/fallback when the
  // Sanity asset isn't set yet (placeholder projects pre-M.01c).
  const leadAsset = PROJECT_LEAD[project.slug];
  const ogImageUrl =
    project.leadImageUrl ??
    (leadAsset ? `${BUSINESS_URL}${leadAsset.src}` : undefined);
  const social = buildSocialMetadata({
    title,
    description,
    url: canonicalUrl(path, loc),
    locale: loc,
    type: 'article',
    images: ogImageUrl
      ? [
          {
            url: ogImageUrl,
            alt: `${displayTitle} — ${cityName}, IL`,
            width: 1200,
            height: 630,
          },
        ]
      : undefined,
  });

  return {
    title,
    description,
    ...(keywords.length > 0 ? {keywords} : {}),
    alternates: {
      canonical: canonicalUrl(path, loc),
      languages: hreflangAlternates(path),
    },
    ...social,
  };
}

/**
 * Project detail — Phase 1.16 templates, Phase 2.05 Sanity-driven content.
 *
 * Section order: Hero (with breadcrumb) → Narrative → Gallery → Facts →
 * BeforeAfterToggle (when hasBeforeAfter) → RelatedProjects → CTA.
 *
 * Image fields fall back to `imageMap.ts` placeholders until Phase 2.04
 * uploads real Sanity assets; the gallery / lead / before / after resolution
 * happens in this route via the existing maps + the resolveProjectImage
 * helper for future Sanity-asset wins.
 *
 * Schema: BreadcrumbList + CreativeWork. CreativeWork.image array is
 * same-source with the rendered gallery.
 */
export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{locale: string; slug: string}>;
}) {
  const {locale, slug} = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();
  const loc = locale as Locale;
  setRequestLocale(loc);

  const sanityProject = await getProjectBySlug(slug);
  if (!sanityProject) notFound();
  const project: Project = sanityProjectDetailToTs(sanityProject);

  const city = getLocation(project.citySlug);
  const cityName = city?.name ?? project.citySlug;

  // Same-source breadcrumb items. Phase M.01d: strip leading street number
  // from the project title before it's shown to the user (no-op for current
  // placeholder projects; activates the moment real M.01c content lands).
  const tBreadcrumb = await getTranslations({locale, namespace: 'project.breadcrumb'});
  // Breadcrumb hrefs are LOCALE-LESS — the shared <Breadcrumb> renders them via
  // next-intl <Link>, which prepends the locale. Passing `/${loc}/…` here
  // double-prefixed to `/es/es` and 404'd (Phase M.11b fix). The JSON-LD schema
  // items, which need locale-correct absolute paths, are derived separately.
  const breadcrumbItems = [
    {name: tBreadcrumb('home'), href: '/'},
    {name: tBreadcrumb('projects'), href: '/projects'},
    {name: stripStreetNumber(project.title[loc])},
  ];
  const localizeForSchema = (path: string) =>
    loc === 'en' ? path : `/${loc}${path === '/' ? '' : path}`;
  const breadcrumbSchemaItems = breadcrumbItems.map((it) => ({
    name: it.name,
    item: localizeForSchema(it.href ?? `/projects/${slug}`),
  }));

  // Phase M.01c: prefer the real Sanity photo (g.imageUrl); fall back to the
  // Phase 1.16 imageMap placeholder only when no Sanity asset exists.
  const galleryAssets = PROJECT_GALLERY[project.slug] ?? [];
  const photos = project.gallery.map((g, i) => ({
    asset: g.imageUrl ?? galleryAssets[i] ?? galleryAssets[0],
    alt: g.alt[loc],
  }));

  // Absolute URL for schema: Sanity URLs are already absolute (cdn.sanity.io);
  // local StaticImageData paths get the business origin prefixed.
  const toAbsoluteImageUrl = (a: {src: string} | string | undefined): string =>
    !a ? '' : typeof a === 'string' ? a : `${BUSINESS_URL}${a.src}`;

  // Image URL list for schema (lead first, then gallery).
  const leadAsset = PROJECT_LEAD[project.slug];
  const imageUrls = [
    toAbsoluteImageUrl(project.leadImageUrl ?? leadAsset),
    ...photos.map((p) => toAbsoluteImageUrl(p.asset)),
  ].filter(Boolean);

  const beforeAfter = project.hasBeforeAfter
    ? {
        before: project.beforeImageUrl ?? PROJECT_BEFORE_AFTER[project.slug]?.before,
        after: project.afterImageUrl ?? PROJECT_BEFORE_AFTER[project.slug]?.after,
      }
    : undefined;

  // Fetch the full project list for related-project selection.
  const allSanity = await getAllProjects();
  const ALL: Project[] = allSanity.map(sanityProjectSummaryToTs);

  const breadcrumbSchema = buildBreadcrumbList(breadcrumbSchemaItems);
  const creativeWorkSchema = buildProjectCreativeWork({
    project,
    locale: loc,
    imageUrls,
  });

  // ───────────────────── Phase M.18 — the PSS-002 story ─────────────────────
  // The six named sections, in the order the standard tells them: the site & the
  // goal → our approach → the work → the standout feature → the result → the
  // long-term value. Each carries its own photos, so the "before" shots sit with
  // the paragraph about the site and the evening shots with the one about the
  // lighting. A writer can override any heading; otherwise the localized default
  // from the message catalog is used.
  const tStory = await getTranslations({locale, namespace: 'project.story'});
  const sections: StorySection[] = [
    {
      id: 'overview',
      heading: {en: '', es: ''},
      fallbackHeading: tStory('overview'),
      body: sanityProject.overview,
      photos: [],
    },
    {
      id: 'site',
      heading: sanityProject.siteHeading,
      fallbackHeading: tStory('site'),
      body: sanityProject.site,
      photos: sanityProject.sitePhotos ?? [],
    },
    {
      id: 'approach',
      heading: sanityProject.approachHeading,
      fallbackHeading: tStory('approach'),
      body: sanityProject.approach,
      photos: sanityProject.approachPhotos ?? [],
    },
    {
      id: 'work',
      heading: sanityProject.workHeading,
      fallbackHeading: tStory('work'),
      body: sanityProject.work,
      photos: sanityProject.workPhotos ?? [],
    },
    {
      id: 'feature',
      heading: sanityProject.featureHeading,
      fallbackHeading: tStory('feature'),
      body: sanityProject.feature,
      photos: sanityProject.featurePhotos ?? [],
    },
    {
      id: 'result',
      heading: sanityProject.resultHeading,
      fallbackHeading: tStory('result'),
      body: sanityProject.result,
      photos: sanityProject.resultPhotos ?? [],
    },
    {
      id: 'durability',
      heading: sanityProject.durabilityHeading,
      fallbackHeading: tStory('durability'),
      body: sanityProject.durability,
      photos: [],
    },
  ];

  // The load-bearing compatibility switch: a project written BEFORE M.18 has no
  // story sections, so it renders exactly as it always did — the legacy
  // <ProjectNarrative>. Nothing already published moves. A project that has any
  // story content renders the feature layout instead, and its narrative (if any)
  // is left alone in Sanity, unread.
  const hasStory = sections.some((section) => hasContent(section, loc));

  // Phase M.18 — the FAQ is emitted as FAQPage JSON-LD from the SAME entries the
  // page renders, so what a reader sees and what an answer engine quotes can
  // never drift apart.
  const faqEntries = (sanityProject.faq ?? []).filter(
    (e) => e.question[loc]?.trim() && e.answer[loc]?.trim(),
  );
  const faqSchema =
    faqEntries.length > 0
      ? buildContentFaqSchema(
          faqEntries.map((e) => ({q: e.question[loc], a: e.answer[loc]})),
        )
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbSchema)}}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(creativeWorkSchema)}}
      />
      {faqSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{__html: JSON.stringify(faqSchema)}}
        />
      ) : null}

      <ProjectHero project={project} locale={loc} breadcrumbItems={breadcrumbItems} />

      {hasStory ? (
        <>
          <ProjectAtAGlance facts={sanityProject.atAGlance ?? []} locale={loc} />
          <ProjectStory sections={sections} locale={loc} />
          <ProjectMaterials
            materials={sanityProject.materials ?? []}
            note={sanityProject.materialsNote}
            heading={tStory('materials')}
            locale={loc}
          />
          {project.hasBeforeAfter &&
          beforeAfter &&
          beforeAfter.before &&
          beforeAfter.after &&
          project.beforeAlt &&
          project.afterAlt ? (
            <BeforeAfterToggle
              before={beforeAfter.before}
              after={beforeAfter.after}
              beforeAlt={project.beforeAlt[loc]}
              afterAlt={project.afterAlt[loc]}
            />
          ) : null}
          <ProjectTestimonial
            statement={sanityProject.testimonialStatement}
            quote={sanityProject.testimonialQuote}
            attribution={sanityProject.testimonialAttribution}
            heading={tStory('testimonial')}
            locale={loc}
          />
          {photos.length > 0 ? <ProjectGallery photos={photos} /> : null}
          <ProjectFacts project={project} locale={loc} />
          <ProjectFaqSection
            faq={sanityProject.faq ?? []}
            heading={tStory('faq')}
            locale={loc}
          />
          <ProjectInternalLinks
            links={sanityProject.internalLinks ?? []}
            heading={tStory('links')}
            locale={loc}
          />
        </>
      ) : (
        <>
          <ProjectNarrative project={project} locale={loc} />
          <ProjectGallery photos={photos} />
          <ProjectFacts project={project} locale={loc} />
          {project.hasBeforeAfter &&
          beforeAfter &&
          beforeAfter.before &&
          beforeAfter.after &&
          project.beforeAlt &&
          project.afterAlt ? (
            <BeforeAfterToggle
              before={beforeAfter.before}
              after={beforeAfter.after}
              beforeAlt={project.beforeAlt[loc]}
              afterAlt={project.afterAlt[loc]}
            />
          ) : null}
        </>
      )}

      <RelatedProjects current={project} locale={loc} all={ALL} />
      <CTA
        copyNamespace="project.cta"
        destination={`/request-quote/?from=project&slug=${project.slug}`}
        tokens={{city: cityName}}
        surface="bg"
        ariaId={`project-${project.slug}`}
      />
    </>
  );
}

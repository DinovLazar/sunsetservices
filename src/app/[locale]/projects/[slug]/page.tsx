import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import ProjectHero from '@/components/sections/projects/detail/ProjectHero';
import ProjectNarrative from '@/components/sections/projects/detail/ProjectNarrative';
import ProjectGallery from '@/components/sections/projects/detail/ProjectGallery';
import ProjectFacts from '@/components/sections/projects/detail/ProjectFacts';
import BeforeAfterToggle from '@/components/sections/projects/detail/BeforeAfterToggle';
import RelatedProjects from '@/components/sections/projects/detail/RelatedProjects';
import CTA from '@/components/sections/CTA';
import {selectRelatedProjects, type Project} from '@/data/projects';
import {getLocation} from '@/data/locations';
import {PROJECT_LEAD, PROJECT_GALLERY, PROJECT_BEFORE_AFTER} from '@/data/imageMap';
import {buildBreadcrumbList} from '@/lib/schema/breadcrumb';
import {buildProjectCreativeWork} from '@/lib/schema/project';
import {BUSINESS_URL} from '@/lib/constants/business';
import {routing} from '@/i18n/routing';
import {canonicalUrl, hreflangAlternates} from '@/lib/seo/urls';
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

/**
 * Phase M.01d (2026-05-26) — display-layer helper that strips a leading
 * street number from a project's address string. Sanity / `src/data/projects.ts`
 * keeps the full street address ("1227 Colchester Lane, Aurora"); the rendered
 * output reads "Colchester Lane, Aurora".
 *
 * Currently a no-op for every visible field — the 12 Phase 1.16 placeholder
 * projects don't carry street numbers in any rendered field. The helper is
 * in place defensively so it just works the moment the M.01c uploader lands
 * real project documents whose title / locality includes a leading number
 * (the M.01c photo corpus references addresses like "1227 Colchester Lane"
 * and "807/811 Edgewater"). M.01d intentionally does NOT modify
 * `src/data/projects.ts` or the Sanity project schema (per the phase plan):
 * the strip happens only at render-time output.
 */
export function stripStreetNumber(address: string): string {
  return address.replace(/^\d+(?:\/\d+)?\s+/, '');
}

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
  const audienceLabel = {
    residential: {en: 'residential', es: 'residencial'},
    commercial: {en: 'commercial', es: 'comercial'},
    hardscape: {en: 'hardscape', es: 'hardscape'},
  }[project.audience][loc];

  // Phase M.01d: address-bearing title strings (when M.01c uploader lands
  // real project content) get the leading street number stripped from the
  // rendered output — Sanity keeps the full address; visitors don't see it.
  const displayTitle = stripStreetNumber(project.title[loc]);
  const title = `${displayTitle} — ${audienceLabel} project in ${cityName} · Sunset Services`;
  const description = `${project.shortDek[loc]} ${cityName}, IL. By Sunset Services.`;
  const path = `/projects/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl(path, loc),
      languages: hreflangAlternates(path),
    },
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
  const breadcrumbItems = [
    {name: tBreadcrumb('home'), href: loc === 'en' ? '/' : `/${loc}/`},
    {name: tBreadcrumb('projects'), href: loc === 'en' ? '/projects/' : `/${loc}/projects/`},
    {name: stripStreetNumber(project.title[loc])},
  ];
  const breadcrumbSchemaItems = breadcrumbItems.map((it) => ({
    name: it.name,
    item:
      it.href ??
      (loc === 'en' ? `/projects/${slug}/` : `/${loc}/projects/${slug}/`),
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
      <ProjectHero project={project} locale={loc} breadcrumbItems={breadcrumbItems} />
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

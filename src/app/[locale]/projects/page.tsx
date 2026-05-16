import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import ProjectsHero from '@/components/sections/projects/ProjectsHero';
import FilterChipStrip from '@/components/sections/projects/FilterChipStrip';
import ProjectsGrid from '@/components/sections/projects/ProjectsGrid';
import Pagination from '@/components/sections/projects/Pagination';
import EmptyState from '@/components/sections/projects/EmptyState';
import CTA from '@/components/sections/CTA';
import {isProjectAudience, type ProjectAudience, type Project} from '@/data/projects';
import {PROJECT_LEAD} from '@/data/imageMap';
import {buildBreadcrumbList} from '@/lib/schema/breadcrumb';
import {buildProjectsItemList} from '@/lib/schema/project';
import {BUSINESS_URL} from '@/lib/constants/business';
import {routing} from '@/i18n/routing';
import {canonicalUrl, hreflangAlternates} from '@/lib/seo/urls';
import {getAllProjects} from '@sanity-lib/queries';
import {sanityProjectSummaryToTs} from '@/lib/sanity-adapters';

type Locale = 'en' | 'es';

const PAGE_SIZE = 12;

// Phase 2.05 — ISR (30 min). Webhook-driven revalidation deferred.
export const revalidate = 1800;

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'projects.meta'});
  const loc: Locale = locale === 'es' ? 'es' : 'en';
  const path = '/projects';
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: canonicalUrl(path, loc),
      languages: hreflangAlternates(path),
    },
  };
}

/**
 * Projects index — Phase 1.16 templates, Phase 2.05 Sanity-driven content.
 *
 * Sections: Hero → FilterChipStrip → ProjectsGrid|EmptyState (+ Pagination) → CTA.
 * Filter + page state read from `searchParams`; sanitization unchanged from 1.16.
 * Schema: `BreadcrumbList` + `ItemList` of `CreativeWork`, fed by the
 * Sanity-fetched (unfiltered) list so crawlers see the full portfolio
 * regardless of any filter the user applied.
 */
export default async function ProjectsIndexPage({
  params,
  searchParams,
}: {
  params: Promise<{locale: string}>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const {locale} = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();
  setRequestLocale(locale);
  const loc = locale as Locale;

  // Sanity is now the source of truth. The Project[] returned here mirrors
  // the Phase 1.16 TS shape so existing presentational components work
  // unchanged.
  const sanityProjects = await getAllProjects();
  const ALL: Project[] = sanityProjects.map(sanityProjectSummaryToTs);

  const sp = await searchParams;
  const audienceParam = typeof sp.audience === 'string' ? sp.audience : undefined;
  const audience: ProjectAudience | undefined =
    audienceParam && isProjectAudience(audienceParam) ? audienceParam : undefined;

  const filtered = audience ? ALL.filter((p) => p.audience === audience) : ALL;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const rawPage = typeof sp.page === 'string' ? Number.parseInt(sp.page, 10) : 1;
  const page =
    Number.isFinite(rawPage) && rawPage >= 1 ? Math.min(rawPage, totalPages) : 1;

  const start = (page - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);

  // Audience counts for the chip strip (stable; based on the unfiltered seed).
  const counts = [
    {audience: 'all' as const, count: ALL.length},
    {
      audience: 'residential' as const,
      count: ALL.filter((p) => p.audience === 'residential').length,
    },
    {
      audience: 'commercial' as const,
      count: ALL.filter((p) => p.audience === 'commercial').length,
    },
    {
      audience: 'hardscape' as const,
      count: ALL.filter((p) => p.audience === 'hardscape').length,
    },
  ];

  const tBreadcrumb = await getTranslations({locale, namespace: 'project.breadcrumb'});
  const breadcrumbItems = [
    {name: tBreadcrumb('home'), item: loc === 'en' ? '/' : `/${loc}/`},
    {
      name: tBreadcrumb('projects'),
      item: loc === 'en' ? '/projects/' : `/${loc}/projects/`,
    },
  ];

  const breadcrumbSchema = buildBreadcrumbList(breadcrumbItems);
  const itemListSchema = buildProjectsItemList({
    projects: ALL,
    locale: loc,
    leadUrlForSlug: (slug) => `${BUSINESS_URL}${PROJECT_LEAD[slug]?.src ?? ''}`,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbSchema)}}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(itemListSchema)}}
      />
      <ProjectsHero />
      <FilterChipStrip counts={counts} activeAudience={audience} />
      {visible.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <ProjectsGrid projects={visible} locale={loc} />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            audience={audience}
          />
        </>
      )}
      <CTA copyNamespace="projects.cta" surface="cream" ariaId="projects" />
    </>
  );
}

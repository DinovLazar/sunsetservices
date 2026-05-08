import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import ProjectsHero from '@/components/sections/projects/ProjectsHero';
import FilterChipStrip from '@/components/sections/projects/FilterChipStrip';
import ProjectsGrid from '@/components/sections/projects/ProjectsGrid';
import Pagination from '@/components/sections/projects/Pagination';
import EmptyState from '@/components/sections/projects/EmptyState';
import CTA from '@/components/sections/CTA';
import {PROJECTS, isProjectAudience, type ProjectAudience} from '@/data/projects';
import {PROJECT_LEAD} from '@/data/imageMap';
import {buildBreadcrumbList} from '@/lib/schema/breadcrumb';
import {buildProjectsItemList} from '@/lib/schema/project';
import {BUSINESS_URL} from '@/lib/constants/business';
import {routing} from '@/i18n/routing';

type Locale = 'en' | 'es';

const PAGE_SIZE = 12;

/**
 * Site origin for canonical/hreflang. Defaults to production
 * `BUSINESS_URL`; localhost test runs override via `NEXT_PUBLIC_SITE_URL`
 * so Lighthouse's canonical audit (which checks canonical-host ===
 * page-host) passes against the test server. Production deploys leave the
 * env var unset and emit production URLs.
 */
const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || BUSINESS_URL;

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'projects.meta'});
  // No trailing slash — Next 16 default `trailingSlash: false` redirects
  // `/projects/` to `/projects`, so the canonical must point to the
  // actual served URL or Lighthouse's canonical audit fails.
  const enPath = '/projects';
  const esPath = '/es/projects';
  // Self-canonical points to the unfiltered, unpaginated route per
  // handover §5.1 — filtered/paginated views are not separately rankable.
  const selfPath = locale === 'en' ? enPath : esPath;
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `${SITE_ORIGIN}${selfPath}`,
      languages: {
        en: `${SITE_ORIGIN}${enPath}`,
        es: `${SITE_ORIGIN}${esPath}`,
        'x-default': `${SITE_ORIGIN}${enPath}`,
      },
    },
  };
}

/**
 * Projects index — Phase 1.16 implementing Phase 1.15 design handover §3.
 *
 * Sections in order: Hero → FilterChipStrip → (ProjectsGrid + Pagination)
 * OR EmptyState → final CTA. Surface alternation per §2.1: cream → bg
 * (filter+grid+pagination one band by design) → cream.
 *
 * Filter + page state read from `searchParams`. Sanitization:
 *   - audience: anything not in {residential, commercial, hardscape} →
 *     undefined (=== "All").
 *   - page: parsed int clamped to [1, totalPages]; malformed → 1.
 *
 * The grid is server-rendered. Filter changes are URL changes; the page
 * re-renders server-side. No client-side filtering (handover §10.2).
 *
 * Schema: `BreadcrumbList` + `ItemList` of `CreativeWork` (handover §5.1).
 * Per §5.1 the ItemList is the unfiltered seed — crawlers see the full
 * portfolio regardless of any filter the user applied.
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

  const sp = await searchParams;
  const audienceParam = typeof sp.audience === 'string' ? sp.audience : undefined;
  const audience: ProjectAudience | undefined =
    audienceParam && isProjectAudience(audienceParam) ? audienceParam : undefined;

  // Filtered list.
  const filtered = audience
    ? PROJECTS.filter((p) => p.audience === audience)
    : PROJECTS;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  // Page sanitization.
  const rawPage = typeof sp.page === 'string' ? Number.parseInt(sp.page, 10) : 1;
  const page =
    Number.isFinite(rawPage) && rawPage >= 1 ? Math.min(rawPage, totalPages) : 1;

  const start = (page - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);

  // Audience counts for the chip strip (stable; based on the unfiltered seed).
  const counts = [
    {audience: 'all' as const, count: PROJECTS.length},
    {
      audience: 'residential' as const,
      count: PROJECTS.filter((p) => p.audience === 'residential').length,
    },
    {
      audience: 'commercial' as const,
      count: PROJECTS.filter((p) => p.audience === 'commercial').length,
    },
    {
      audience: 'hardscape' as const,
      count: PROJECTS.filter((p) => p.audience === 'hardscape').length,
    },
  ];

  // Breadcrumb same-source: feeds both schema and (if visible) the
  // breadcrumb component. Index does not render a visible breadcrumb;
  // the H1 is the page name. Schema still emits Home → Projects.
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
    projects: PROJECTS,
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

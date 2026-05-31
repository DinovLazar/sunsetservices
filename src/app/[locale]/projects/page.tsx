import type {Metadata} from 'next';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import ProjectsHero from '@/components/sections/projects/ProjectsHero';
import FilterChipStrip from '@/components/sections/projects/FilterChipStrip';
import ProjectsGrid from '@/components/sections/projects/ProjectsGrid';
import Pagination from '@/components/sections/projects/Pagination';
import EmptyState from '@/components/sections/projects/EmptyState';
import CTA from '@/components/sections/CTA';
import {type Project} from '@/data/projects';
import {SERVICES, type Division} from '@/data/services';
import {isDivision} from '@/data/divisions';
import {getProjectDivision} from '@/lib/projects/getProjectDivision';
import {resolveProjectCity} from '@/lib/projects/resolveProjectCity';
import {PROJECT_LEAD} from '@/data/imageMap';
import {buildBreadcrumbList} from '@/lib/schema/breadcrumb';
import {buildProjectsItemList} from '@/lib/schema/project';
import {BUSINESS_URL} from '@/lib/constants/business';
import {routing} from '@/i18n/routing';
import {canonicalUrl, hreflangAlternates} from '@/lib/seo/urls';
import {buildSocialMetadata} from '@/lib/seo/openGraph';
import {getAllProjects} from '@sanity-lib/queries';
import {sanityProjectSummaryToTs} from '@/lib/sanity-adapters';

type Locale = 'en' | 'es';

const PAGE_SIZE = 12;

// Phase 2.05 — ISR (30 min). Webhook-driven revalidation deferred.
export const revalidate = 1800;

/**
 * Phase M.10g portfolio order (locked decision M.10g-D4): city name A→Z,
 * projects with no assigned city last, year descending within a city, and
 * slug A→Z as a stable final tiebreak. City order is pinned to the `'en'`
 * collator so `/projects` and `/es/projects` cluster identically.
 */
function compareForPortfolio(a: Project, b: Project): number {
  const cityA = resolveProjectCity(a);
  const cityB = resolveProjectCity(b);
  // Location-less projects sort last (D5).
  if (cityA && !cityB) return -1;
  if (!cityA && cityB) return 1;
  if (cityA && cityB) {
    const byCity = cityA.localeCompare(cityB, 'en');
    if (byCity !== 0) return byCity;
  }
  // Within a city (and among the location-less tail): year desc, slug A→Z.
  if (b.year !== a.year) return b.year - a.year;
  return a.slug.localeCompare(b.slug, 'en');
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'projects.meta'});
  const loc: Locale = locale === 'es' ? 'es' : 'en';
  const path = '/projects';
  const social = buildSocialMetadata({
    title: t('title'),
    description: t('description'),
    url: canonicalUrl(path, loc),
    locale: loc,
  });
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: canonicalUrl(path, loc),
      languages: hreflangAlternates(path),
    },
    ...social,
  };
}

/**
 * Projects index — Phase 1.16 templates, Phase 2.05 Sanity-driven content,
 * Phase M.10c addendum (2026-05-27) division filter migration.
 *
 * Sections: Hero → FilterChipStrip → ProjectsGrid|EmptyState (+ Pagination) → CTA.
 * Filter + page state read from `searchParams`. The filter param is
 * `?division=<slug>` (locked decision D8 — `?audience=` is gone, pre-launch
 * site, no back-compat alias). Division resolution per project goes through
 * `getProjectDivision()` so the chip-strip counts + the visible filter set
 * agree with the homepage's division-derived labels (locked decisions
 * D10 + D11).
 *
 * Schema: `BreadcrumbList` + `ItemList` of `CreativeWork`, fed by the
 * Sanity-fetched (unfiltered) list so crawlers see the full portfolio
 * regardless of any filter the user applied (D12 — SEO unchanged).
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
  // Phase M.10c addendum D8 — searchParams key renamed `audience` → `division`.
  // Defensive sanitize: unknown values fall back to "All" (undefined).
  const divisionParam = typeof sp.division === 'string' ? sp.division : undefined;
  const division: Division | undefined =
    divisionParam && isDivision(divisionParam) ? divisionParam : undefined;

  // Per-project division derivation — single source of truth shared with
  // the homepage projects band + the index tile badges (D10).
  const projectDivision = new Map<string, Division>();
  for (const p of ALL) {
    projectDivision.set(p.slug, getProjectDivision(p, SERVICES));
  }

  const filtered = division
    ? ALL.filter((p) => projectDivision.get(p.slug) === division)
    : ALL;
  // Phase M.10g — portfolio order (D4): city A→Z, location-less last, year
  // desc within a city. Sorted on a copy of the active filtered set so the
  // unfiltered ALL (counts + ItemList schema, D12) keeps Sanity's order.
  const sorted = [...filtered].sort(compareForPortfolio);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));

  const rawPage = typeof sp.page === 'string' ? Number.parseInt(sp.page, 10) : 1;
  const page =
    Number.isFinite(rawPage) && rawPage >= 1 ? Math.min(rawPage, totalPages) : 1;

  const start = (page - 1) * PAGE_SIZE;
  const visible = sorted.slice(start, start + PAGE_SIZE);

  // Phase M.10c addendum D9 — every division chip always renders, even at
  // count 0 (e.g. Waterproofing today). The "All" chip stays leading.
  const counts = [
    {division: 'all' as const, count: ALL.length},
    {
      division: 'landscape' as const,
      count: ALL.filter((p) => projectDivision.get(p.slug) === 'landscape').length,
    },
    {
      division: 'hardscape' as const,
      count: ALL.filter((p) => projectDivision.get(p.slug) === 'hardscape').length,
    },
    {
      division: 'waterproofing' as const,
      count: ALL.filter((p) => projectDivision.get(p.slug) === 'waterproofing').length,
    },
    {
      division: 'snow-removal' as const,
      count: ALL.filter((p) => projectDivision.get(p.slug) === 'snow-removal').length,
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
      <FilterChipStrip counts={counts} activeDivision={division} />
      {visible.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <ProjectsGrid
            projects={visible}
            locale={loc}
            divisionBySlug={projectDivision}
          />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            division={division}
          />
        </>
      )}
      <CTA copyNamespace="projects.cta" surface="cream" ariaId="projects" />
    </>
  );
}

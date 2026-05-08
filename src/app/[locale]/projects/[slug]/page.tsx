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
import {PROJECTS, getProject} from '@/data/projects';
import {getLocation} from '@/data/locations';
import {PROJECT_LEAD, PROJECT_GALLERY, PROJECT_BEFORE_AFTER} from '@/data/imageMap';
import {buildBreadcrumbList} from '@/lib/schema/breadcrumb';
import {buildProjectCreativeWork} from '@/lib/schema/project';
import {BUSINESS_URL} from '@/lib/constants/business';
import {routing} from '@/i18n/routing';

type Locale = 'en' | 'es';

/** See ../page.tsx for the SITE_ORIGIN env-override rationale. */
const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || BUSINESS_URL;

export function generateStaticParams() {
  return PROJECTS.map((p) => ({slug: p.slug}));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string; slug: string}>;
}): Promise<Metadata> {
  const {locale, slug} = await params;
  const project = getProject(slug);
  if (!project) return {};
  const loc = (routing.locales.includes(locale as Locale) ? locale : 'en') as Locale;

  const city = getLocation(project.citySlug);
  const cityName = city?.name ?? project.citySlug;
  const audienceLabel = {
    residential: {en: 'residential', es: 'residencial'},
    commercial: {en: 'commercial', es: 'comercial'},
    hardscape: {en: 'hardscape', es: 'hardscape'},
  }[project.audience][loc];

  // Title template: `{title} — {audience} project in {city} · Sunset Services`.
  const title = `${project.title[loc]} — ${audienceLabel} project in ${cityName} · Sunset Services`;
  const description = `${project.shortDek[loc]} ${cityName}, IL. By Sunset Services.`;

  // No trailing slash — see ../page.tsx for the rationale.
  const enPath = `/projects/${slug}`;
  const esPath = `/es/projects/${slug}`;
  const selfPath = loc === 'en' ? enPath : esPath;

  return {
    title,
    description,
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
 * Project detail — Phase 1.16 implementing Phase 1.15 design handover §4.
 *
 * Section order: Hero (with breadcrumb) → Narrative → Gallery → Facts →
 * BeforeAfterToggle (when `hasBeforeAfter`) → RelatedProjects → CTA.
 * Surface alternation per §2.2:
 *   bg → cream → bg → cream → bg → cream → bg.
 *
 * Schema: `BreadcrumbList` + `CreativeWork` per §5.2. Same-source rules:
 *   - Breadcrumb items array drives both visible <Breadcrumb> + JSON-LD.
 *   - Gallery image array drives both rendered <img> tags + the
 *     `CreativeWork.image` field. Defined once in this route.
 */
export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{locale: string; slug: string}>;
}) {
  const {locale, slug} = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();
  const project = getProject(slug);
  if (!project) notFound();
  const loc = locale as Locale;
  setRequestLocale(loc);

  const city = getLocation(project.citySlug);
  const cityName = city?.name ?? project.citySlug;

  // Same-source breadcrumb items.
  const tBreadcrumb = await getTranslations({locale, namespace: 'project.breadcrumb'});
  const breadcrumbItems = [
    {name: tBreadcrumb('home'), href: loc === 'en' ? '/' : `/${loc}/`},
    {name: tBreadcrumb('projects'), href: loc === 'en' ? '/projects/' : `/${loc}/projects/`},
    {name: project.title[loc]},
  ];
  const breadcrumbSchemaItems = breadcrumbItems.map((it) => ({
    name: it.name,
    item:
      it.href ??
      (loc === 'en' ? `/projects/${slug}/` : `/${loc}/projects/${slug}/`),
  }));

  // Same-source gallery photos (asset + alt).
  const galleryAssets = PROJECT_GALLERY[project.slug] ?? [];
  const photos = project.gallery.map((g, i) => ({
    asset: galleryAssets[i] ?? galleryAssets[0],
    alt: g.alt[loc],
  }));

  // Image URL list for schema (lead first, then gallery).
  const leadAsset = PROJECT_LEAD[project.slug];
  const imageUrls = [
    leadAsset ? `${BUSINESS_URL}${leadAsset.src}` : '',
    ...photos.map((p) => `${BUSINESS_URL}${p.asset.src}`),
  ].filter(Boolean);

  // Before/after image source for the toggle (when applicable).
  const beforeAfter = project.hasBeforeAfter
    ? PROJECT_BEFORE_AFTER[project.slug]
    : undefined;

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
      {project.hasBeforeAfter && beforeAfter && project.beforeAlt && project.afterAlt ? (
        <BeforeAfterToggle
          before={beforeAfter.before}
          after={beforeAfter.after}
          beforeAlt={project.beforeAlt[loc]}
          afterAlt={project.afterAlt[loc]}
        />
      ) : null}
      <RelatedProjects current={project} locale={loc} />
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

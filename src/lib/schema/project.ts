/**
 * Projects portfolio JSON-LD payload builders — Phase 1.15 §5.
 *
 * Index: `BreadcrumbList` + `ItemList` of `CreativeWork`.
 * Detail: `BreadcrumbList` + `CreativeWork` (with creator @id pointing at
 *         the sitewide LocalBusiness from 1.05).
 *
 * Image array same-source rule (handover §4.4 + §5.2): the gallery
 * component and the `CreativeWork.image` array consume the same upstream
 * `photos` array. The route resolves it once and passes to both.
 */

import {BUSINESS_URL} from '@/lib/constants/business';
import {SERVICES} from '@/data/services';
import {getLocation} from '@/data/locations';
import type {Project} from '@/data/projects';

type Locale = 'en' | 'es';

function localePath(locale: Locale, path: string): string {
  // path always starts with `/` and ends with `/`
  return locale === 'en' ? path : `/${locale}${path}`;
}

function absoluteUrl(path: string): string {
  return `${BUSINESS_URL}${path}`;
}

export type ProjectImageSource = {
  /** The image's served URL relative to BUSINESS_URL (e.g. `/_next/static/media/foo.abc.jpg` or `/images/projects/<slug>/lead.avif`). */
  src: string;
};

/** Build a CreativeWork entry for the index ItemList. */
function projectListItem(p: Project, locale: Locale, leadImageUrl: string, position: number) {
  const city = getLocation(p.citySlug);
  const cityName = city?.name ?? p.citySlug;
  const path = localePath(locale, `/projects/${p.slug}/`);
  return {
    '@type': 'ListItem',
    position,
    item: {
      '@type': 'CreativeWork',
      '@id': absoluteUrl(path),
      url: absoluteUrl(path),
      name: p.title[locale],
      image: leadImageUrl,
      dateCreated: `${p.year}-01-01`,
      locationCreated: {
        '@type': 'Place',
        name: cityName,
      },
      creator: {
        '@id': `${BUSINESS_URL}/#localbusiness`,
      },
    },
  };
}

export type ProjectsItemListBuilderInput = {
  projects: Project[];
  locale: Locale;
  leadUrlForSlug: (slug: string) => string;
};

/** Build the index `ItemList` of CreativeWork. */
export function buildProjectsItemList({
  projects,
  locale,
  leadUrlForSlug,
}: ProjectsItemListBuilderInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: projects.map((p, i) =>
      projectListItem(p, locale, leadUrlForSlug(p.slug), i + 1),
    ),
  };
}

export type ProjectCreativeWorkBuilderInput = {
  project: Project;
  locale: Locale;
  /** Same-source array of image URLs (lead + gallery), in render order. */
  imageUrls: string[];
};

/** Build the detail `CreativeWork`. */
export function buildProjectCreativeWork({
  project,
  locale,
  imageUrls,
}: ProjectCreativeWorkBuilderInput) {
  const city = getLocation(project.citySlug);
  const cityName = city?.name ?? project.citySlug;
  const canonical = absoluteUrl(localePath(locale, `/projects/${project.slug}/`));

  // Resolve service slugs to localized service names. Audience-aware
  // lookup picks the matching audience entry first.
  const serviceNames = project.serviceSlugs.map((slug) => {
    const svc =
      SERVICES.find((s) => s.slug === slug && s.audience === project.audience) ??
      SERVICES.find((s) => s.slug === slug);
    return svc?.name[locale] ?? slug;
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': canonical,
    url: canonical,
    name: project.title[locale],
    description: project.shortDek[locale],
    image: imageUrls,
    dateCreated: `${project.year}-01-01`,
    creator: {
      '@id': `${BUSINESS_URL}/#localbusiness`,
    },
    locationCreated: {
      '@type': 'Place',
      name: cityName,
      address: {
        '@type': 'PostalAddress',
        addressLocality: cityName,
        addressRegion: 'IL',
        addressCountry: 'US',
      },
    },
    keywords: [project.audience, ...serviceNames],
  };
}

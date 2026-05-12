/**
 * Phase 2.05 — adapters that convert Sanity-fetched data shapes into
 * Phase 1.x `@/data/*.ts` TypeScript shapes.
 *
 * Why adapters: page-level consumers (ProjectsGrid, ProjectHero, etc.)
 * were written against the TS data file types from Phase 1.16 / 1.18.
 * Routing them through small adapters here preserves component contracts
 * while letting Sanity drive content.
 *
 * Phase 2.04 (photo curation) will let `leadImage`, `gallery[].image`,
 * etc. resolve from real Sanity assets via `urlFor()`; until then every
 * project's image fields are `null` and the page falls back to the
 * Phase 1.16 placeholder map (`imageMap.ts`) via `resolveProjectImage`.
 */

import type {Project, ProjectAudience, ProjectGalleryEntry} from '@/data/projects';
import type {ProjectDetail, ProjectSummary} from '@sanity-lib/types';

const ZERO_LOCALIZED = {en: '', es: ''} as const;

/** Build a TS-shape ProjectGalleryEntry list from a Sanity gallery list. */
function adaptGallery(
  sanity: ProjectDetail['gallery'],
): ProjectGalleryEntry[] {
  return sanity.map((g, i) => ({
    file: `${String(i + 1).padStart(2, '0')}.avif`,
    alt: g.alt ?? ZERO_LOCALIZED,
  }));
}

/** Adapter for the summary projection (used by the projects index grid). */
export function sanityProjectSummaryToTs(p: ProjectSummary): Project {
  return {
    slug: p.slug,
    audience: p.audience as ProjectAudience,
    serviceSlugs: [],
    citySlug: p.citySlug ?? '',
    year: p.year ?? 0,
    durationWeeks: 0,
    materials: ZERO_LOCALIZED,
    hasBeforeAfter: false,
    photoCount: 0,
    title: p.title,
    shortDek: p.shortDek,
    narrative: ZERO_LOCALIZED,
    leadAlt: p.leadAlt,
    gallery: [],
  };
}

/** Adapter for the detail projection (used by the project detail page). */
export function sanityProjectDetailToTs(p: ProjectDetail): Project {
  return {
    slug: p.slug,
    audience: p.audience as ProjectAudience,
    serviceSlugs: p.serviceSlugs ?? [],
    citySlug: p.citySlug ?? '',
    year: p.year ?? 0,
    durationWeeks: p.durationWeeks ?? 0,
    // TS shape collapses to a single Localized; Sanity stores per-item array
    // of Localized. Join with ", " for display.
    materials: {
      en: (p.materials ?? []).map((m) => m.en).filter(Boolean).join(', '),
      es: (p.materials ?? []).map((m) => m.es).filter(Boolean).join(', '),
    },
    hasBeforeAfter: p.hasBeforeAfter,
    photoCount: (p.gallery ?? []).length,
    title: p.title,
    shortDek: p.shortDek,
    narrativeHeading:
      p.narrativeHeading.en || p.narrativeHeading.es
        ? p.narrativeHeading
        : undefined,
    narrative: p.narrative,
    leadAlt: p.leadAlt,
    gallery: adaptGallery(p.gallery ?? []),
    beforeAlt: p.hasBeforeAfter ? p.beforeAlt : undefined,
    afterAlt: p.hasBeforeAfter ? p.afterAlt : undefined,
  };
}

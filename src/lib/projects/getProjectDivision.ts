/**
 * Phase M.10c — derive a project's Division (the 4-division IA) from its
 * legacy 3-audience tag plus its primary service slug. Accepts a partial
 * Project-like shape so it works against both the TS-typed seed
 * (`src/data/projects.ts`: `serviceSlugs: string[]`) and any Sanity-projected
 * shape that carries the older `services: [{slug, _id}]` array.
 *
 * Resolution order (locked Phase M.10c decision D3):
 *   1. `audience === 'hardscape'`              → `'hardscape'`
 *   2. First service slug resolves to a known  → that service's `division`
 *      Service with a `division` field
 *   3. Otherwise (residential/commercial      → `'landscape'` fallback
 *      audience without resolvable services,    (commercial landscape work
 *      or missing audience entirely)            dominates the photo corpus)
 *
 * Pure function. No side effects.
 */

import type {Division, Service} from '@/data/services';

export type ProjectAudienceLike = 'residential' | 'commercial' | 'hardscape';

export type ProjectLike = {
  audience?: ProjectAudienceLike | null;
  /** TS Project seed shape — `src/data/projects.ts`. */
  serviceSlugs?: readonly string[] | null;
  /** Sanity-projected shape — kept for forward compatibility. */
  services?: ReadonlyArray<{slug?: string | null; _id?: string | null}> | null;
};

export type ServiceLike = Pick<Service, 'slug' | 'division'> & {_id?: string};

export function getProjectDivision(
  project: ProjectLike,
  services: readonly ServiceLike[],
): Division {
  if (project.audience === 'hardscape') return 'hardscape';

  const firstSlug = project.serviceSlugs?.[0] ?? project.services?.[0]?.slug ?? null;
  const firstId = project.services?.[0]?._id ?? null;

  if (firstSlug || firstId) {
    const matched = services.find(
      (s) =>
        (firstSlug !== null && s.slug === firstSlug) ||
        (firstId !== null && s._id !== undefined && s._id === firstId),
    );
    if (matched?.division) return matched.division;
  }

  return 'landscape';
}

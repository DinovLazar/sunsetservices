/**
 * Phase M.10g — resolve a project's display **city** label for the portfolio
 * tiles (the `/projects` index, the homepage / About "Recent work" row, and
 * the related-projects strip — every surface that renders `ProjectCard`).
 *
 * Resolution order (locked decision M.10g-D2):
 *   1. `cityName` — the project's structured Sanity `city` reference name
 *      (`city->name`, projected by `PROJECT_SUMMARY_PROJECTION`). This is the
 *      source of truth and resolves for every job city, including those that
 *      have no dedicated city *page* in the static `locations.ts` table.
 *   2. `getLocation(citySlug)?.name` — fallback for the legacy TS seed
 *      (`src/data/projects.ts`), whose rows carry only `citySlug`.
 *   3. `undefined` — the project has no assigned city. Callers render NO
 *      location line in that case (M.10g-D5): never the raw slug, never a
 *      fabricated city. Brand-guide privacy rule (M.10g-D3): city only, never
 *      street-level detail.
 *
 * Pure function. No side effects.
 */

import type {Project} from '@/data/projects';
import {getLocation} from '@/data/locations';

export function resolveProjectCity(
  project: Pick<Project, 'cityName' | 'citySlug'>,
): string | undefined {
  const structured = project.cityName?.trim();
  if (structured) return structured;
  return getLocation(project.citySlug)?.name ?? undefined;
}

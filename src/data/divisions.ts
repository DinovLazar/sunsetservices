/**
 * Phase M.01e — site division metadata.
 *
 * Replaces the 3-audience IA (residential / commercial / hardscape) with 4
 * divisions (landscape / hardscape / waterproofing / snow-removal). Goran's
 * call (2026-05-26). The `Division` type itself lives in `services.ts` next
 * to the `Service` type so the union has one source of truth; this file is
 * the presentation layer that the dynamic `/[locale]/[division]/page.tsx`
 * landing consumes.
 *
 * Each entry carries:
 *   - `slug`       — URL segment + i18n key
 *   - `accent`     — CSS custom-property hookup; mirrors the audience tokens
 *                    so existing `var(--audience-accent)` consumers keep
 *                    rendering correctly while we transition (the
 *                    [data-division='<slug>'] selector in globals.css sets
 *                    the same `--audience-accent` + `--audience-chip-bg`
 *                    values)
 *   - `heroImage`  — placeholder asset alias from `imageMap.ts`; waterproofing
 *                    + snow-removal reuse existing photo aliases since no
 *                    real photography exists yet (M.01f swap)
 *   - `breadcrumbKey` / `metaKey` etc. — `i18n` namespace keys live under
 *                    `division.<slug>.*` (see messages/{en,es}.json)
 *
 * Heavy bilingual strings (label, hero h1/subhead, qualifier copy, services
 * grid section copy, featured projects, why-sunset, social proof,
 * faq fallback, cta) live in `messages/{en,es}.json` under
 * `division.<slug>.*` — same convention as `audience.<slug>.*`.
 */

import type {Division} from './services';

/**
 * Canonical ordering of divisions. Used for tile grids, footer link rows,
 * sitemap emission, and `generateStaticParams`. Matches Goran's call:
 * landscape first (broadest service set), then hardscape (highest-value
 * builds), then waterproofing (highest-search-volume in DuPage), then
 * snow-removal (seasonal but year-locked through Erick's commercial book).
 */
export const DIVISIONS: readonly Division[] = [
  'landscape',
  'hardscape',
  'waterproofing',
  'snow-removal',
] as const;

export function isDivision(slug: string): slug is Division {
  return (DIVISIONS as readonly string[]).includes(slug);
}

export type DivisionMeta = {
  /** URL slug + i18n key under `division.<slug>.*`. */
  slug: Division;
  /**
   * `imageMap.AUDIENCE_HERO` key for the hero photo. Landscape + Hardscape
   * use the existing audience hero assets (residential photo for Landscape;
   * hardscape photo as-is). Waterproofing + Snow Removal alias to plausible
   * existing photos; M.01f swaps for real photography.
   */
  heroImageKey: 'residential' | 'commercial' | 'hardscape';
  /**
   * `imageMap.AUDIENCE_PROJECT_TILES` key for the 3 featured-project tiles.
   * Same alias pattern as `heroImageKey`.
   */
  projectTilesKey: 'residential' | 'commercial' | 'hardscape';
};

/**
 * Per-division presentation metadata. Looked up by slug. Drives photo
 * selection on the division-landing template; the accent-token CSS variables
 * are wired through the `[data-division='<slug>']` selectors in globals.css.
 *
 * imageKey aliases (M.01e placeholders pending M.01f real photography):
 *   landscape       → existing residential hero/project assets
 *   hardscape       → existing hardscape assets (unchanged)
 *   waterproofing   → reuse residential hero (foundation/exterior context)
 *   snow-removal    → reuse commercial hero (plowing/commercial-property feel)
 */
export const DIVISION_META: Record<Division, DivisionMeta> = {
  landscape: {
    slug: 'landscape',
    heroImageKey: 'residential',
    projectTilesKey: 'residential',
  },
  hardscape: {
    slug: 'hardscape',
    heroImageKey: 'hardscape',
    projectTilesKey: 'hardscape',
  },
  waterproofing: {
    slug: 'waterproofing',
    heroImageKey: 'residential',
    projectTilesKey: 'residential',
  },
  'snow-removal': {
    slug: 'snow-removal',
    heroImageKey: 'commercial',
    projectTilesKey: 'commercial',
  },
} as const;

export function getDivisionMeta(division: Division): DivisionMeta {
  return DIVISION_META[division];
}

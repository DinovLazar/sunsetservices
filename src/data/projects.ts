/**
 * Phase 1.16 — typed bilingual seed for the projects portfolio. Source of
 * truth: Phase 1.15 design handover §11.3.
 *
 * 12 placeholder projects spanning all 3 audiences (Hardscape × 5,
 * Residential × 4, Commercial × 3) and all 6 service-area cities (2 per
 * city). 2 entries carry `hasBeforeAfter: true`. Per-project content lives
 * here; chrome strings (eyebrows, section H2s, CTA labels) live in
 * `messages/{en,es}.json` under `projects.*` (index) and `project.*`
 * (detail).
 *
 * Open mismatches resolved (handover §14):
 *   §14.2 — `fire-pits` in the seed table renamed to `fire-pits-features`
 *           to match `services.ts`. Two projects affected:
 *           naperville-hilltop-terrace, naperville-fire-court.
 *   §14.3 — All 6 city slugs (aurora · naperville · batavia · wheaton ·
 *           lisle · bolingbrook) resolve in `locations.ts`.
 *
 * Build-time assertions at the bottom of this file fail loudly during
 * `next build` and `next dev` if any service slug or city slug ever drifts.
 *
 * Spanish strings ship as `[TBR]` placeholders for native review in
 * Phase 2.13. Erick polishes English narratives in Part 2.
 */

import {SERVICES} from './services';
import {LOCATIONS} from './locations';

export type ProjectAudience = 'residential' | 'commercial' | 'hardscape';

export type ProjectGalleryEntry = {
  /** Image filename in /public/images/projects/{slug}/ — e.g. '01.avif' */
  file: string;
  alt: {en: string; es: string};
};

export type Project = {
  slug: string;
  audience: ProjectAudience;
  /** FK to services.ts entries. Build-time assertion verifies every slug resolves. */
  serviceSlugs: string[];
  /** FK to locations.ts entries. */
  citySlug: string;
  year: number;
  durationWeeks: number;
  materials: {en: string; es: string};
  hasBeforeAfter: boolean;
  photoCount: number;
  title: {en: string; es: string};
  /** ≤120 chars; drives tile dek + meta description seed. */
  shortDek: {en: string; es: string};
  /** Optional H2 for the narrative section; falls back to `title`. */
  narrativeHeading?: {en: string; es: string};
  /** ≤500 words EN budget; placeholder OK. */
  narrative: {en: string; es: string};
  leadAlt: {en: string; es: string};
  gallery: ProjectGalleryEntry[];
  beforeAlt?: {en: string; es: string};
  afterAlt?: {en: string; es: string};
};

export const PROJECTS: Project[] = [
  // ----- Naperville × 2 (Hardscape, Hardscape) -----
  {
    slug: 'naperville-hilltop-terrace',
    audience: 'hardscape',
    serviceSlugs: ['patios-walkways', 'retaining-walls', 'fire-pits-features'],
    citySlug: 'naperville',
    year: 2024,
    durationWeeks: 6,
    materials: {
      en: 'Unilock Ledgestone, natural bluestone caps, weathering-steel fire bowl',
      es: 'Unilock Ledgestone, tapas de piedra azul natural, cuenco de fuego de acero corten [TBR]',
    },
    hasBeforeAfter: true,
    photoCount: 8,
    title: {en: 'Naperville Hilltop Terrace', es: 'Terraza en la colina, Naperville [TBR]'},
    shortDek: {
      en: 'Two-level paver terrace with a fire feature, built to read like an extension of the kitchen.',
      es: 'Terraza de adoquines de dos niveles con chimenea, diseñada como una extensión de la cocina. [TBR]',
    },
    narrativeHeading: {
      en: 'A backyard nobody else would touch.',
      es: 'Un patio que nadie más quería tocar. [TBR]',
    },
    narrative: {
      en: 'The lot drops twelve feet across forty. Most contractors quoted a single retaining wall and called it a day. We built two — one functional, one for sitting on — and a paver terrace between them that runs flush with the kitchen door. The lower level steps down to a fire feature with a 4-ft hood, sized for the family to actually use it in October. The upper level is a herringbone Unilock Ledgestone, set on a six-inch crushed-stone base over woven geotextile. Six weeks, two trips by the inspector, and a good crew.',
      es: '[TBR] Placeholder — Erick polishes in Part 2.',
    },
    leadAlt: {en: 'Two-level paver terrace at golden hour, fire feature lit', es: '[TBR]'},
    gallery: Array.from({length: 8}, (_, i) => ({
      file: `${String(i + 1).padStart(2, '0')}.avif`,
      alt: {en: `Naperville Hilltop Terrace — view ${i + 1}`, es: `[TBR] vista ${i + 1}`},
    })),
    beforeAlt: {en: 'Before: bare slope, no terraces', es: '[TBR] Antes: pendiente vacía'},
    afterAlt: {en: 'After: completed two-level terrace with fire feature', es: '[TBR] Después'},
  },
  {
    slug: 'naperville-fire-court',
    audience: 'hardscape',
    serviceSlugs: ['fire-pits-features', 'patios-walkways'],
    citySlug: 'naperville',
    year: 2023,
    durationWeeks: 3,
    materials: {en: 'Belgard Mega-Arbel, gas-line fire ring', es: '[TBR]'},
    hasBeforeAfter: false,
    photoCount: 5,
    title: {en: 'Naperville Fire Court', es: 'Patio con fogata, Naperville [TBR]'},
    shortDek: {
      en: 'A 14-foot circular paver court with a low gas fire ring, sized for two adirondacks and a dog.',
      es: '[TBR] Placeholder',
    },
    narrative: {
      en: 'Three weeks. Centered on the maple. The clients wanted a place to sit at night with a dog and a glass.',
      es: '[TBR]',
    },
    leadAlt: {en: 'Circular paver court with lit fire ring at dusk', es: '[TBR]'},
    gallery: Array.from({length: 5}, (_, i) => ({
      file: `${String(i + 1).padStart(2, '0')}.avif`,
      alt: {en: `Naperville Fire Court — view ${i + 1}`, es: `[TBR] vista ${i + 1}`},
    })),
  },

  // ----- Aurora × 2 (Commercial, Hardscape) -----
  {
    slug: 'aurora-hoa-curb-refresh',
    audience: 'commercial',
    serviceSlugs: ['lawn-care', 'landscape-design'],
    citySlug: 'aurora',
    year: 2024,
    durationWeeks: 4,
    materials: {en: 'Dwarf burning bush, river-rock mulch beds', es: '[TBR]'},
    hasBeforeAfter: true,
    photoCount: 6,
    title: {en: 'Aurora HOA Curb Refresh', es: 'Refresco de jardín de HOA en Aurora [TBR]'},
    shortDek: {
      en: 'Six entrance medians and 1,200 ft of frontage replanted across one HOA section.',
      es: '[TBR]',
    },
    narrative: {
      en: 'A budget-conscious HOA that had let the entrance medians go scraggly. We replanted six of them, replaced the frontage shrubs, and set the maintenance schedule.',
      es: '[TBR]',
    },
    leadAlt: {en: 'Replanted HOA entrance median with new shrubs and mulch', es: '[TBR]'},
    gallery: Array.from({length: 6}, (_, i) => ({
      file: `${String(i + 1).padStart(2, '0')}.avif`,
      alt: {en: `Aurora HOA — view ${i + 1}`, es: `[TBR] vista ${i + 1}`},
    })),
    beforeAlt: {en: 'Before: overgrown median', es: '[TBR]'},
    afterAlt: {en: 'After: replanted median', es: '[TBR]'},
  },
  {
    slug: 'aurora-driveway-apron',
    audience: 'hardscape',
    serviceSlugs: ['patios-walkways'],
    citySlug: 'aurora',
    year: 2022,
    durationWeeks: 2,
    materials: {en: 'Unilock Brussels Block, Belgian-edge border', es: '[TBR]'},
    hasBeforeAfter: false,
    photoCount: 4,
    title: {en: 'Aurora Driveway Apron', es: 'Entrada con adoquines en Aurora [TBR]'},
    shortDek: {
      en: 'Replaced a cracked concrete apron with a paver inlay matching the front walk.',
      es: '[TBR]',
    },
    narrative: {
      en: 'Two weeks. The original concrete had heaved twice. We pulled it, set a fresh base, and laid an apron that matched the walk we did the year before.',
      es: '[TBR]',
    },
    leadAlt: {en: 'Paver driveway apron matching the front walk', es: '[TBR]'},
    gallery: Array.from({length: 4}, (_, i) => ({
      file: `${String(i + 1).padStart(2, '0')}.avif`,
      alt: {en: `Aurora Driveway — view ${i + 1}`, es: `[TBR] vista ${i + 1}`},
    })),
  },

  // ----- Wheaton × 2 (Residential, Commercial) -----
  {
    slug: 'wheaton-lawn-reset',
    audience: 'residential',
    serviceSlugs: ['lawn-care', 'sprinkler-systems'],
    citySlug: 'wheaton',
    year: 2024,
    durationWeeks: 5,
    materials: {en: 'Tall fescue blend, Hunter MP rotators', es: '[TBR]'},
    hasBeforeAfter: false,
    photoCount: 5,
    title: {en: 'Wheaton Lawn Reset', es: 'Reseteo de césped en Wheaton [TBR]'},
    shortDek: {
      en: 'Aerated, overseeded, and rebuilt the irrigation zones on a half-acre lot.',
      es: '[TBR]',
    },
    narrative: {
      en: 'A half-acre lot whose previous landscaper had set the heads to spray the road. We re-zoned, re-seeded, and now the lawn is the kind you walk barefoot.',
      es: '[TBR]',
    },
    leadAlt: {en: 'Lush green lawn after reset, sprinklers running', es: '[TBR]'},
    gallery: Array.from({length: 5}, (_, i) => ({
      file: `${String(i + 1).padStart(2, '0')}.avif`,
      alt: {en: `Wheaton Lawn — view ${i + 1}`, es: `[TBR] vista ${i + 1}`},
    })),
  },
  {
    slug: 'wheaton-bank-frontage',
    audience: 'commercial',
    serviceSlugs: ['lawn-care', 'snow-removal'],
    citySlug: 'wheaton',
    year: 2022,
    durationWeeks: 3,
    materials: {en: 'Boxwood hedging, seasonal annuals, salt-tolerant turf', es: '[TBR]'},
    hasBeforeAfter: false,
    photoCount: 4,
    title: {en: 'Wheaton Bank Frontage', es: 'Frente de banco en Wheaton [TBR]'},
    shortDek: {
      en: 'Year-round frontage program for a community bank — turf, beds, and snow.',
      es: '[TBR]',
    },
    narrative: {
      en: 'A community bank that wanted the front of the property to look like the inside. We set the year-round program — beds, hedging, salt-safe turf, and a snow contract that prioritizes the ATM.',
      es: '[TBR]',
    },
    leadAlt: {en: 'Bank entrance with hedging and seasonal flowers', es: '[TBR]'},
    gallery: Array.from({length: 4}, (_, i) => ({
      file: `${String(i + 1).padStart(2, '0')}.avif`,
      alt: {en: `Wheaton Bank — view ${i + 1}`, es: `[TBR] vista ${i + 1}`},
    })),
  },

  // ----- Lisle × 2 (Hardscape, Residential) -----
  {
    slug: 'lisle-retaining-wall',
    audience: 'hardscape',
    serviceSlugs: ['retaining-walls'],
    citySlug: 'lisle',
    year: 2023,
    durationWeeks: 4,
    materials: {en: 'Versa-Lok Standard, geo-grid reinforcement', es: '[TBR]'},
    hasBeforeAfter: false,
    photoCount: 5,
    title: {en: 'Lisle Retaining Wall', es: 'Muro de contención en Lisle [TBR]'},
    shortDek: {
      en: 'A 70-ft Versa-Lok wall with three steps that solved a chronic side-yard erosion problem.',
      es: '[TBR]',
    },
    narrative: {
      en: 'Engineered for the load. Geo-grid every two courses. The clients had been losing six inches of yard a year for a decade.',
      es: '[TBR]',
    },
    leadAlt: {en: 'Curved Versa-Lok retaining wall with stepped section', es: '[TBR]'},
    gallery: Array.from({length: 5}, (_, i) => ({
      file: `${String(i + 1).padStart(2, '0')}.avif`,
      alt: {en: `Lisle Wall — view ${i + 1}`, es: `[TBR] vista ${i + 1}`},
    })),
  },
  {
    slug: 'lisle-backyard-refresh',
    audience: 'residential',
    serviceSlugs: ['landscape-design', 'lawn-care'],
    citySlug: 'lisle',
    year: 2021,
    durationWeeks: 3,
    materials: {en: 'Native perennial palette, hardwood mulch beds', es: '[TBR]'},
    hasBeforeAfter: false,
    photoCount: 4,
    title: {en: 'Lisle Backyard Refresh', es: 'Renovación de patio en Lisle [TBR]'},
    shortDek: {
      en: 'Native plant beds, refreshed turf, and a compost loop the homeowner can run themselves.',
      es: '[TBR]',
    },
    narrative: {
      en: 'Three weeks. The homeowner wanted to do their own maintenance. We set them up with a palette they could keep alive.',
      es: '[TBR]',
    },
    leadAlt: {en: 'Native perennial bed in early summer', es: '[TBR]'},
    gallery: Array.from({length: 4}, (_, i) => ({
      file: `${String(i + 1).padStart(2, '0')}.avif`,
      alt: {en: `Lisle Refresh — view ${i + 1}`, es: `[TBR] vista ${i + 1}`},
    })),
  },

  // ----- Batavia × 2 (Residential, Residential) -----
  {
    slug: 'batavia-garden-reset',
    audience: 'residential',
    serviceSlugs: ['landscape-design'],
    citySlug: 'batavia',
    year: 2023,
    durationWeeks: 2,
    materials: {en: 'Mixed perennials, river-rock dry creek', es: '[TBR]'},
    hasBeforeAfter: false,
    photoCount: 4,
    title: {en: 'Batavia Garden Reset', es: 'Reseteo de jardín en Batavia [TBR]'},
    shortDek: {
      en: 'A side-yard rain garden plus a perennial border, to handle drainage and look the part.',
      es: '[TBR]',
    },
    narrative: {
      en: 'Drainage was the brief. The garden was the bonus. The dry creek does the work in storms; the perennial border carries the rest of the year.',
      es: '[TBR]',
    },
    leadAlt: {en: 'Dry-creek rain garden with mixed perennials', es: '[TBR]'},
    gallery: Array.from({length: 4}, (_, i) => ({
      file: `${String(i + 1).padStart(2, '0')}.avif`,
      alt: {en: `Batavia Garden — view ${i + 1}`, es: `[TBR] vista ${i + 1}`},
    })),
  },
  {
    slug: 'batavia-front-walk',
    audience: 'residential',
    serviceSlugs: ['patios-walkways'],
    citySlug: 'batavia',
    year: 2022,
    durationWeeks: 2,
    materials: {en: 'Unilock Beacon Hill Flagstone, charcoal soldier course', es: '[TBR]'},
    hasBeforeAfter: false,
    photoCount: 4,
    title: {en: 'Batavia Front Walk', es: 'Entrada delantera en Batavia [TBR]'},
    shortDek: {
      en: 'Replaced a cracked stamped-concrete walk with a paver inlay — five-foot width to suit the front porch.',
      es: '[TBR]',
    },
    narrative: {
      en: 'Two weeks. The original walk was failing in three places. We pulled it, set a base, and laid the new walk five feet wide so the porch step felt right.',
      es: '[TBR]',
    },
    leadAlt: {en: 'Paver front walk leading to a covered porch', es: '[TBR]'},
    gallery: Array.from({length: 4}, (_, i) => ({
      file: `${String(i + 1).padStart(2, '0')}.avif`,
      alt: {en: `Batavia Walk — view ${i + 1}`, es: `[TBR] vista ${i + 1}`},
    })),
  },

  // ----- Bolingbrook × 2 (Commercial, Hardscape) -----
  {
    slug: 'bolingbrook-office-court',
    audience: 'commercial',
    serviceSlugs: ['lawn-care', 'snow-removal', 'landscape-design'],
    citySlug: 'bolingbrook',
    year: 2023,
    durationWeeks: 3,
    materials: {en: 'Boxwood, salt-tolerant turf, decomposed-granite paths', es: '[TBR]'},
    hasBeforeAfter: false,
    photoCount: 5,
    title: {en: 'Bolingbrook Office Court', es: 'Patio de oficinas en Bolingbrook [TBR]'},
    shortDek: {
      en: 'Reset the courtyard for a 40-employee office: lawn, paths, planters, year-round maintenance.',
      es: '[TBR]',
    },
    narrative: {
      en: 'A small office where the courtyard had been an afterthought. We rebuilt the lawn, set decomposed-granite paths, planted four big planters, and run it year-round now.',
      es: '[TBR]',
    },
    leadAlt: {en: 'Office courtyard with central lawn and planters', es: '[TBR]'},
    gallery: Array.from({length: 5}, (_, i) => ({
      file: `${String(i + 1).padStart(2, '0')}.avif`,
      alt: {en: `Bolingbrook Office — view ${i + 1}`, es: `[TBR] vista ${i + 1}`},
    })),
  },
  {
    slug: 'bolingbrook-paver-plaza',
    audience: 'hardscape',
    serviceSlugs: ['patios-walkways', 'retaining-walls'],
    citySlug: 'bolingbrook',
    year: 2021,
    durationWeeks: 5,
    materials: {en: 'Belgard Mega-Lafitt, charcoal banding, low seat-wall', es: '[TBR]'},
    hasBeforeAfter: false,
    photoCount: 6,
    title: {en: 'Bolingbrook Paver Plaza', es: 'Plaza de adoquines en Bolingbrook [TBR]'},
    shortDek: {
      en: 'A 600-sqft paver plaza with a low seat-wall border, framing the back of a townhome.',
      es: '[TBR]',
    },
    narrative: {
      en: 'Five weeks. The seat-wall doubles as the deck rail when the family hosts. The plaza picks up the brick of the house.',
      es: '[TBR]',
    },
    leadAlt: {en: 'Paver plaza with low seat-wall at twilight', es: '[TBR]'},
    gallery: Array.from({length: 6}, (_, i) => ({
      file: `${String(i + 1).padStart(2, '0')}.avif`,
      alt: {en: `Bolingbrook Plaza — view ${i + 1}`, es: `[TBR] vista ${i + 1}`},
    })),
  },
];

// ---------- Build-time slug-coverage assertions ----------
// These run at module-import time during `next build` and `next dev`.
// A bad slug fails the build loudly with the offending project surfaced.

const KNOWN_SERVICE_SLUGS: Set<string> = new Set(SERVICES.map((s) => s.slug));
const KNOWN_CITY_SLUGS: Set<string> = new Set(LOCATIONS.map((l) => l.slug));

for (const p of PROJECTS) {
  for (const slug of p.serviceSlugs) {
    if (!KNOWN_SERVICE_SLUGS.has(slug)) {
      throw new Error(
        `[projects.ts] Project '${p.slug}' references unknown service slug '${slug}'. ` +
          `Known: ${[...KNOWN_SERVICE_SLUGS].sort().join(', ')}.`,
      );
    }
  }
  if (!KNOWN_CITY_SLUGS.has(p.citySlug)) {
    throw new Error(
      `[projects.ts] Project '${p.slug}' references unknown city slug '${p.citySlug}'. ` +
        `Known: ${[...KNOWN_CITY_SLUGS].sort().join(', ')}.`,
    );
  }
}

// ---------- Helpers ----------
export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}

export function isProjectAudience(value: string): value is ProjectAudience {
  return value === 'residential' || value === 'commercial' || value === 'hardscape';
}

/**
 * Selection algorithm for the related-projects strip per handover §4.7:
 * 1. Same-audience (excluding self), `year desc, slug asc`. Take up to 3.
 * 2. If <3, top up with same-city (excluding self + already-picked).
 * 3. If still <3, top up with most-recent (excluding self + already-picked).
 */
export function selectRelatedProjects(current: Project, count = 3): Project[] {
  const exclude = new Set<string>([current.slug]);
  const pickFrom = (list: Project[]): Project[] =>
    list
      .filter((p) => !exclude.has(p.slug))
      .sort((a, b) => (b.year - a.year) || a.slug.localeCompare(b.slug));

  const out: Project[] = [];

  // Tier 1 — same audience.
  for (const p of pickFrom(PROJECTS.filter((p) => p.audience === current.audience))) {
    if (out.length >= count) break;
    out.push(p);
    exclude.add(p.slug);
  }
  // Tier 2 — same city.
  for (const p of pickFrom(PROJECTS.filter((p) => p.citySlug === current.citySlug))) {
    if (out.length >= count) break;
    out.push(p);
    exclude.add(p.slug);
  }
  // Tier 3 — most recent overall.
  for (const p of pickFrom(PROJECTS)) {
    if (out.length >= count) break;
    out.push(p);
    exclude.add(p.slug);
  }
  return out;
}

import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {LOCATIONS} from '@/data/locations';

/**
 * Phase M.01e — show all 22 surfaced cities (24 total minus the 2 retired:
 * Lisle + Bolingbrook). Coordinates were computed via Web Mercator
 * projection (see `projectGeo.ts`) and committed into `locations.ts` so the
 * SVG renders deterministically without runtime computation.
 */
const RETIRED_CITY_SLUGS = new Set(['lisle', 'bolingbrook']);

/**
 * Phase M.01e-pt2 — static label allowlist.
 *
 * 22 city labels in a 600×500 viewBox overlap in the dense Hinsdale /
 * Oak Brook / Clarendon Hills / Burr Ridge / Western Springs cluster.
 * Rather than introduce a label-de-overlap solver or staggered offsets,
 * we render static `<text>` labels for the 8 most-recognizable cities only;
 * the other 14 keep their pin dot (interactive, navigates on click, exposes
 * the city name via `aria-label`) but skip the static label.
 *
 * On mobile (no hover), the dot's link `aria-label` still announces the
 * city; touch-tap navigates. This trades a small visual restraint for a
 * cleaner read of the cluster region — refinement (e.g. a leaflet-style
 * tooltip) is on the M.01f photography pass roadmap.
 *
 * The 8 allowlisted cities were picked by (a) name recognition outside the
 * suburbs and (b) geographic distribution that doesn't trip the cluster.
 */
const STATIC_LABEL_SLUGS = new Set<string>([
  'aurora',
  'naperville',
  'wheaton',
  'batavia',
  'oak-brook',
  'hinsdale',
  'plainfield',
  'st-charles',
]);

/**
 * ServiceAreaMap — Phase 1.14 §3.2 production SVG.
 *
 * Static SVG illustration of DuPage County with pins (one per city Sunset
 * Services serves). Each pin is a real `<Link>` from `@/i18n/navigation` so
 * locale prefixing works. The accessible name for each pin comes from the
 * visible city `<text>` (for the 8 allowlisted cities) or the `aria-label`
 * on the link element (for the other 14, where no static label renders).
 *
 * Hover/focus translates the pin -2px on the y axis over `--motion-fast`
 * (150ms). Wrapped in `prefers-reduced-motion: reduce` short-circuit.
 *
 * No JS — pure server-rendered HTML. Lighthouse-cheap.
 */
export default async function ServiceAreaMap() {
  const t = await getTranslations('serviceAreas.map');

  // Map functions as a navigation surface: each pin is a real link to a
  // city page. Per WCAG SC 4.1.2, an element with `role="img"` cannot have
  // focusable descendants — so we wrap the SVG in a <nav> landmark for the
  // accessible structure and drop `role="img"` from the SVG. The <title>
  // + <desc> inside still provide an accessible name + description for AT
  // that discovers the SVG element directly.
  return (
    <nav aria-label={t('title')}>
      <svg
        viewBox="0 0 600 500"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="auto"
        aria-labelledby="sa-map-title sa-map-desc"
        style={{display: 'block', maxWidth: '100%'}}
      >
      <title id="sa-map-title">{t('title')}</title>
      <desc id="sa-map-desc">{t('desc')}</desc>

      {/* Background land fill — simplified DuPage outline */}
      <path
        d="M70,90 L520,80 L545,180 L530,300 L478,400 L320,420 L150,408 L78,330 L48,210 Z"
        fill="#F1F5EE"
        stroke="#8FB67A"
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* Subtle inner contour */}
      <path
        d="M120,150 L460,148 L478,260 L420,360 L300,374 L180,366 L120,310 L100,220 Z"
        fill="none"
        stroke="#B8D2A8"
        strokeWidth={1}
        strokeDasharray="3 4"
      />

      {/* "DuPage County, IL" overlay label */}
      <text
        x={300}
        y={60}
        fontFamily="Manrope, sans-serif"
        fontSize={14}
        fontWeight={600}
        fill="#2F5D27"
        textAnchor="middle"
        letterSpacing="0.08em"
      >
        {t('label')}
      </text>

      {/* North arrow */}
      <g transform="translate(540,30)">
        <polygon points="6,0 12,14 6,11 0,14" fill="#2F5D27" />
        <text
          x={6}
          y={32}
          fontFamily="ui-sans-serif"
          fontSize={10}
          fill="#2F5D27"
          textAnchor="middle"
          fontWeight={600}
        >
          N
        </text>
      </g>

      {/* Pins — 22 surfaced cities (24 minus the 2 retired), each a real <Link>.
          Only the 8 cities in STATIC_LABEL_SLUGS render a static <text> label;
          the other 14 have their city name on the link's aria-label so AT
          still announces it and touch-tap still navigates correctly. */}
      {LOCATIONS.filter((loc) => !RETIRED_CITY_SLUGS.has(loc.slug)).map((loc) => {
        const showStaticLabel = STATIC_LABEL_SLUGS.has(loc.slug);
        return (
          <Link
            key={loc.slug}
            href={`/service-areas/${loc.slug}/`}
            className="sa-pin"
            title={`${loc.name}, ${loc.state} — view location page`}
            aria-label={`${loc.name}, ${loc.state}`}
          >
            {/* Invisible hit area — WCAG 2.2 SC 2.5.8 (Target Size, Minimum)
                requires standalone interactive targets to be ≥ 24×24 CSS px.
                The visible pin renders ~17px wide, so we add a transparent
                circle (r=16 → 32 user-units ≈ 27px at the map's render scale)
                to enlarge the clickable/measured target without changing the
                visible dot. `fill="transparent"` is still painted, so it
                receives pointer events and counts toward the link's box. */}
            <circle
              cx={loc.pin.x}
              cy={loc.pin.y}
              r={16}
              fill="transparent"
            />
            <circle
              cx={loc.pin.x}
              cy={loc.pin.y}
              r={10}
              fill="#4D8A3F"
              stroke="#FFFFFF"
              strokeWidth={2.5}
            />
            {showStaticLabel ? (
              <text
                x={loc.pin.x}
                y={loc.pin.y + 30}
                fontFamily="Manrope, sans-serif"
                fontSize={14}
                fontWeight={600}
                fill="#1A1A1A"
                textAnchor="middle"
              >
                {loc.name}
              </text>
            ) : null}
          </Link>
        );
      })}

      <style>{`
        .sa-pin {
          cursor: pointer;
          transition: transform var(--motion-fast, 150ms) var(--easing-standard, ease);
          transform-origin: center;
          transform-box: fill-box;
        }
        .sa-pin:hover, .sa-pin:focus-visible {
          transform: translateY(-2px);
        }
        .sa-pin:focus-visible circle {
          stroke: #6FA85F;
          stroke-width: 3;
        }
        @media (prefers-reduced-motion: reduce) {
          .sa-pin, .sa-pin:hover, .sa-pin:focus-visible {
            transform: none;
          }
        }
      `}</style>
      </svg>
    </nav>
  );
}

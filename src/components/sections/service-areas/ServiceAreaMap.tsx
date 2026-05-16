import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {LOCATIONS} from '@/data/locations';

/**
 * ServiceAreaMap — Phase 1.14 §3.2 production SVG.
 *
 * Static SVG illustration of DuPage County with six pins (one per city
 * Sunset Services serves). Each pin is a real `<Link>` from
 * `@/i18n/navigation` so locale prefixing works. The accessible name for
 * each pin is the visible city `<text>` inside the link.
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

      {/* Pins — 6 cities, each a real <Link> */}
      {LOCATIONS.map((loc) => (
        <Link
          key={loc.slug}
          href={`/service-areas/${loc.slug}/`}
          className="sa-pin"
          title={`${loc.name}, ${loc.state} — view location page`}
        >
          <circle
            cx={loc.pin.x}
            cy={loc.pin.y}
            r={10}
            fill="#4D8A3F"
            stroke="#FFFFFF"
            strokeWidth={2.5}
          />
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
        </Link>
      ))}

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

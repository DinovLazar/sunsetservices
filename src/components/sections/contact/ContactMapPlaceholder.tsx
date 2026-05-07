import {getTranslations} from 'next-intl/server';
import AnimateIn from '@/components/global/motion/AnimateIn';
import {
  BUSINESS_NAME,
  BUSINESS_ADDRESS_LINE1,
  BUSINESS_ADDRESS_LINE2,
} from '@/lib/constants/business';

/**
 * Contact map block — Phase 1.11 handover §4.3 (D8 lock = static placeholder).
 *
 * Surface --color-bg. Inline SVG illustrates an abstract street grid with a
 * pin centered on the address; the wrapping `<a>` opens Google Maps in a new
 * tab. ZERO third-party load — Lighthouse Performance lever per §10.
 *
 * Part-2 swap-in plan: replace the inline SVG with `<MapEmbed>` (lazy
 * iframe + sr-only label) per Phase 1.11 §4.3 Part-2 plan.
 */
export default async function ContactMapPlaceholder() {
  const t = await getTranslations('contact.map');
  const directionsHref = `https://maps.google.com/?q=${encodeURIComponent(
    `${BUSINESS_ADDRESS_LINE1}, ${BUSINESS_ADDRESS_LINE2}`,
  )}`;

  return (
    <section
      aria-label={t('aria')}
      className="bg-[var(--color-bg)] py-14 lg:py-20 [content-visibility:auto] [contain-intrinsic-size:auto_640px]"
    >
      <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
        <AnimateIn variant="fade-up" className="block">
          <a
            href={directionsHref}
            target="_blank"
            rel="noopener"
            aria-label={`${t('open_label')} ${BUSINESS_ADDRESS_LINE1}, ${BUSINESS_ADDRESS_LINE2}`}
            className="relative block w-full overflow-hidden"
            style={{
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-soft)',
              height: 'clamp(280px, 36vw, 440px)',
              background: '#E8E0CD',
            }}
          >
            {/* Static abstract street-grid illustration. NOT a Google Maps screenshot. */}
            <svg
              aria-hidden="true"
              viewBox="0 0 1280 480"
              preserveAspectRatio="xMidYMid slice"
              className="absolute inset-0 h-full w-full"
            >
              <rect width="1280" height="480" fill="#E8E0CD" />
              {/* major roads */}
              <g stroke="#FAF7F1" strokeWidth="6">
                <line x1="0" y1="160" x2="1280" y2="160" />
                <line x1="0" y1="300" x2="1280" y2="300" />
                <line x1="320" y1="0" x2="320" y2="480" />
                <line x1="640" y1="0" x2="640" y2="480" />
                <line x1="960" y1="0" x2="960" y2="480" />
              </g>
              {/* minor roads */}
              <g stroke="#D8D2C4" strokeWidth="2">
                <line x1="0" y1="100" x2="1280" y2="100" />
                <line x1="0" y1="230" x2="1280" y2="230" />
                <line x1="0" y1="380" x2="1280" y2="380" />
                <line x1="200" y1="0" x2="200" y2="480" />
                <line x1="480" y1="0" x2="480" y2="480" />
                <line x1="800" y1="0" x2="800" y2="480" />
                <line x1="1080" y1="0" x2="1080" y2="480" />
              </g>
              {/* park */}
              <rect x="700" y="160" width="200" height="140" fill="#B8D2A8" />
              {/* pin centered */}
              <g transform="translate(640 250)">
                <path d="M0 0 C 16 -28, 16 -54, 0 -68 C -16 -54, -16 -28, 0 0 Z" fill="#2F5D27" />
                <circle cx="0" cy="-44" r="8" fill="#FAF7F1" />
              </g>
            </svg>

            {/* Address card overlay */}
            <div
              className="absolute top-5 left-5 lg:top-6 lg:left-6 p-4 lg:p-5"
              style={{
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border-soft, #E0D9C5)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-soft)',
                maxWidth: '280px',
              }}
            >
              <p
                className="font-heading font-semibold uppercase m-0 mb-2"
                style={{
                  fontSize: '11px',
                  letterSpacing: 'var(--tracking-eyebrow)',
                  color: 'var(--color-sunset-green-700)',
                }}
              >
                {BUSINESS_NAME}
              </p>
              <p
                className="m-0 font-heading"
                style={{
                  fontSize: 'var(--text-body-lg)',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  lineHeight: 'var(--leading-snug)',
                }}
              >
                {BUSINESS_ADDRESS_LINE1}
                <br />
                {BUSINESS_ADDRESS_LINE2}
              </p>
              <span
                className="inline-flex items-center mt-3"
                style={{
                  fontSize: 'var(--text-body-sm)',
                  color: 'var(--color-sunset-green-700)',
                  textDecoration: 'underline',
                }}
              >
                {t('directions')}
              </span>
            </div>
          </a>
        </AnimateIn>
      </div>
    </section>
  );
}

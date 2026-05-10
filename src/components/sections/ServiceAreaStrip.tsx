import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import AnimateIn from '@/components/global/motion/AnimateIn';

/**
 * Service-area strip — shared across `/contact/` (Phase 1.12) and the six
 * `/service-areas/<city>/` location pages (Phase 1.14, D7b).
 *
 * Surface --color-bg. Centered eyebrow + city links separated by middle
 * dots desktop / wraps to 2-row grid on mobile. City links resolve to
 * `/service-areas/<slug>/` (Plan §3 IA — Phase 1.13 D1).
 *
 * Pass `excludeSlug` (Phase 1.14 D7b) on location pages to hide the page's
 * own city — defaults to all 6 cities so existing /contact/ behavior is
 * unchanged.
 */

const CITIES = [
  {key: 'aurora', slug: 'aurora'},
  {key: 'naperville', slug: 'naperville'},
  {key: 'batavia', slug: 'batavia'},
  {key: 'wheaton', slug: 'wheaton'},
  {key: 'lisle', slug: 'lisle'},
  {key: 'bolingbrook', slug: 'bolingbrook'},
] as const;

type ServiceAreaStripProps = {
  /**
   * When set, omit the matching city from the rendered list. Used on
   * location pages so the current city is hidden and the strip shows the
   * other 5 (Phase 1.14 D7b).
   */
  excludeSlug?: string;
  /**
   * When `true`, drops the outer `<section>` wrapper, the section padding,
   * and the `<AnimateIn>` so the strip can render inline inside another
   * surface (e.g. inside a blog post's `<ProseLayout>` per Phase 1.18
   * §6.5). The visible city links + eyebrow + note still render. Default
   * `false` preserves the locked Phase 1.14 behaviour.
   */
  inline?: boolean;
};

export default async function ServiceAreaStrip({excludeSlug, inline = false}: ServiceAreaStripProps = {}) {
  const t = await getTranslations('contact.area');
  const cities = excludeSlug
    ? CITIES.filter((c) => c.slug !== excludeSlug)
    : CITIES;

  if (inline) {
    return (
      <div
        aria-labelledby="service-area-strip-eyebrow-inline"
        className="prose__location-strip"
        style={{textAlign: 'center'}}
      >
        <p
          id="service-area-strip-eyebrow-inline"
          className="font-heading font-semibold uppercase m-0 mb-3"
          style={{
            fontSize: '12px',
            letterSpacing: 'var(--tracking-eyebrow)',
            color: 'var(--color-sunset-green-700)',
          }}
        >
          {t('eyebrow')}
        </p>
        <ul className="m-0 p-0 list-none flex flex-wrap justify-center gap-x-2 gap-y-2">
          {cities.map((c, idx) => (
            <li key={c.slug} className="inline-flex items-center">
              <Link
                href={`/service-areas/${c.slug}/`}
                className="font-heading"
                style={{
                  fontSize: 'var(--text-body)',
                  color: 'var(--color-sunset-green-700)',
                  fontWeight: 500,
                  padding: '4px 6px',
                }}
              >
                {t(c.key)}
              </Link>
              {idx < cities.length - 1 ? (
                <span aria-hidden="true" className="px-1" style={{color: 'var(--color-text-muted)'}}>
                  ·
                </span>
              ) : null}
            </li>
          ))}
        </ul>
        <p
          className="m-0 mt-3 mx-auto"
          style={{
            fontSize: 'var(--text-body-sm)',
            color: 'var(--color-text-secondary)',
            maxWidth: '60ch',
          }}
        >
          {t('note.text')}{' '}
          <a
            href="tel:+16309469321"
            style={{
              color: 'var(--color-sunset-green-700)',
              textDecoration: 'underline',
            }}
          >
            {t('note.cta')}
          </a>
        </p>
      </div>
    );
  }

  return (
    <section
      aria-labelledby="service-area-strip-eyebrow"
      className="bg-[var(--color-bg)] py-12 lg:py-14"
    >
      <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12 text-center">
        <AnimateIn variant="fade-up" className="block">
          <p
            id="service-area-strip-eyebrow"
            className="font-heading font-semibold uppercase m-0 mb-4"
            style={{
              fontSize: '12px',
              letterSpacing: 'var(--tracking-eyebrow)',
              color: 'var(--color-sunset-green-700)',
            }}
          >
            {t('eyebrow')}
          </p>
          <ul className="m-0 p-0 list-none flex flex-wrap justify-center gap-x-2 gap-y-3">
            {cities.map((c, idx) => (
              <li key={c.slug} className="inline-flex items-center">
                <Link
                  href={`/service-areas/${c.slug}/`}
                  className="font-heading"
                  style={{
                    fontSize: 'var(--text-body-lg)',
                    color: 'var(--color-sunset-green-700)',
                    fontWeight: 500,
                    padding: '6px 8px',
                  }}
                >
                  {t(c.key)}
                </Link>
                {idx < cities.length - 1 ? (
                  <span aria-hidden="true" className="px-2" style={{color: 'var(--color-text-muted)'}}>
                    ·
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
          <p
            className="m-0 mt-4 mx-auto"
            style={{
              fontSize: 'var(--text-body-sm)',
              color: 'var(--color-text-secondary)',
              maxWidth: '60ch',
            }}
          >
            {t('note.text')}{' '}
            <a
              href="tel:+16309469321"
              style={{
                color: 'var(--color-sunset-green-700)',
                textDecoration: 'underline',
              }}
            >
              {t('note.cta')}
            </a>
          </p>
        </AnimateIn>
      </div>
    </section>
  );
}

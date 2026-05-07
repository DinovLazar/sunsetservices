import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import AnimateIn from '@/components/global/motion/AnimateIn';

/**
 * Service-area strip — Phase 1.11 handover §4.5 (D10 lock = keep).
 *
 * Surface --color-bg. Centered eyebrow + 6 city links separated by middle
 * dots desktop / wraps to 2-row grid on mobile. Per Phase 1.13 routing,
 * city links resolve to `/service-areas/<slug>/`. (Handover §4.5 originally
 * specified `/locations/<slug>-il/`; reconciled to `/service-areas/<slug>/`
 * to match the Plan's IA — Phase 1.13 D1 RESOLVED (auto): `/service-areas/`.)
 */

const CITIES = [
  {key: 'aurora', slug: 'aurora'},
  {key: 'naperville', slug: 'naperville'},
  {key: 'batavia', slug: 'batavia'},
  {key: 'wheaton', slug: 'wheaton'},
  {key: 'lisle', slug: 'lisle'},
  {key: 'bolingbrook', slug: 'bolingbrook'},
] as const;

export default async function ContactServiceAreaStrip() {
  const t = await getTranslations('contact.area');

  return (
    <section
      aria-labelledby="contact-area-eyebrow"
      className="bg-[var(--color-bg)] py-12 lg:py-14"
    >
      <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12 text-center">
        <AnimateIn variant="fade-up" className="block">
          <p
            id="contact-area-eyebrow"
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
            {CITIES.map((c, idx) => (
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
                {idx < CITIES.length - 1 ? (
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

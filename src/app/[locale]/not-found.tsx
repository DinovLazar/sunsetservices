import {getTranslations} from 'next-intl/server';
import {ArrowRight, Phone} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {DIVISIONS} from '@/data/divisions';
import {BUSINESS_PHONE, BUSINESS_PHONE_TEL} from '@/lib/constants/business';

/**
 * Sitewide 404.
 *
 * WHY THIS LIVES UNDER `[locale]/` AND NOT AT `src/app/not-found.tsx`
 * ------------------------------------------------------------------
 * A root `src/app/not-found.tsx` would need a root `src/app/layout.tsx` to
 * supply `<html>`/`<body>` — and this project deliberately has no such file
 * (the root layout is `[locale]/layout.tsx` so each locale can set its own
 * `<html lang>`; see AGENTS.md). Putting the 404 inside the locale segment
 * lets it render inside the real site chrome (Navbar, Footer, chat, consent)
 * with working translations, instead of a bare unstyled document.
 *
 * The trade-off: per the Next 16 file-convention docs, only a *root*
 * `not-found` catches URLs that match no route at all. Everything under
 * `[locale]/` is reached one of two ways:
 *   1. An explicit `notFound()` call in a route segment — the `[division]`
 *      and `[division]/[service]` pages already do this for unknown slugs,
 *      and `[locale]/layout.tsx` does it for an unknown locale.
 *   2. The `[locale]/[...rest]/page.tsx` catch-all, which exists purely to
 *      funnel otherwise-unmatched deep paths (3+ segments) into this file.
 *
 * `not-found.tsx` takes no props, so it cannot call `setRequestLocale()`
 * itself. It doesn't need to: `[locale]/layout.tsx` sets the request locale
 * and renders above this component in the RSC tree, so `getTranslations()`
 * resolves against the right locale on both `/` and `/es/`.
 *
 * No `metadata` export — Next only honours that on `global-not-found`, so the
 * tab title falls back to the layout default. Next injects `noindex` on 404
 * responses automatically; nothing to add here.
 */
export default async function NotFound() {
  const t = await getTranslations('notFound');
  const tDivision = await getTranslations('division');
  const tNav = await getTranslations('chrome.nav');

  // The five division landings, then the rest of the top-level IA. Labels are
  // pulled from the namespaces that already own them (`division.<slug>.label`
  // and `chrome.nav.*`) rather than duplicated under `notFound.*` — one source
  // of truth per string, and no extra EN/ES parity surface to keep in lockstep.
  const links: ReadonlyArray<{href: string; label: string}> = [
    ...DIVISIONS.map((slug) => ({
      href: `/${slug}`,
      label: tDivision(`${slug}.label`),
    })),
    {href: '/projects', label: tNav('projects')},
    {href: '/service-areas', label: tNav('serviceAreas')},
    {href: '/about', label: tNav('about')},
    {href: '/resources', label: tNav('resources')},
  ];

  return (
    <>
      {/* Section 1 — the apology + the two exits (cream). */}
      <section
        aria-labelledby="notfound-h1"
        className="bg-[var(--color-bg-cream)] py-16 lg:py-24"
        style={{borderBottom: '1px solid var(--color-border)'}}
      >
        <div className="mx-auto max-w-[var(--container-narrow)] px-4 sm:px-6 lg:px-8 xl:px-12 text-center">
          <p
            className="font-heading font-semibold uppercase m-0 mb-3"
            style={{
              fontSize: '13px',
              letterSpacing: 'var(--tracking-eyebrow)',
              color: 'var(--color-sunset-green-700)',
            }}
          >
            {t('eyebrow')}
          </p>
          <h1
            id="notfound-h1"
            className="m-0 font-heading font-bold"
            style={{
              fontSize: 'var(--text-h1)',
              lineHeight: 'var(--leading-tight)',
              letterSpacing: 'var(--tracking-snug)',
            }}
          >
            {t('title')}
          </h1>
          <p
            className="m-0 mt-4 mx-auto"
            style={{
              fontSize: 'var(--text-body-lg)',
              color: 'var(--color-text-secondary)',
              maxWidth: '54ch',
            }}
          >
            {t('body')}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/" prefetch={false} className="btn btn-primary btn-lg">
              {t('primaryCta')}
            </Link>
            <Link
              href="/request-quote"
              prefetch={false}
              className="btn btn-secondary btn-lg"
            >
              {t('secondaryCta')}
            </Link>
          </div>
        </div>
      </section>

      {/* Section 2 — where to go instead (white). */}
      <section
        aria-labelledby="notfound-links-h2"
        className="bg-[var(--color-bg)] py-16 lg:py-20"
      >
        <div className="mx-auto max-w-[var(--container-narrow)] px-4 sm:px-6 lg:px-8 xl:px-12">
          <h2
            id="notfound-links-h2"
            className="m-0 font-heading font-bold text-center"
            style={{
              fontSize: 'var(--text-h2)',
              lineHeight: 'var(--leading-snug)',
            }}
          >
            {t('linksHeading')}
          </h2>
          <p
            className="m-0 mt-3 mx-auto text-center"
            style={{color: 'var(--color-text-secondary)', maxWidth: '54ch'}}
          >
            {t('linksIntro')}
          </p>
          <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 list-none p-0 m-0">
            {links.map((link) => (
              <li key={link.href} className="m-0">
                <Link
                  href={link.href}
                  prefetch={false}
                  className="group flex items-center justify-between gap-3 w-full"
                  style={{
                    padding: 'var(--spacing-4) var(--spacing-5)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-bg)',
                    color: 'var(--color-text-primary)',
                    fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'border-color var(--motion-fast) var(--easing-standard)',
                  }}
                >
                  <span>{link.label}</span>
                  <ArrowRight
                    aria-hidden="true"
                    size={18}
                    strokeWidth={1.75}
                    style={{color: 'var(--color-sunset-green-700)', flexShrink: 0}}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Section 3 — a human backstop (cream). */}
      <section
        aria-labelledby="notfound-help-h2"
        className="bg-[var(--color-bg-cream)] py-16 lg:py-20"
        style={{borderTop: '1px solid var(--color-border)'}}
      >
        <div className="mx-auto max-w-[var(--container-narrow)] px-4 sm:px-6 lg:px-8 xl:px-12 text-center">
          <h2
            id="notfound-help-h2"
            className="m-0 font-heading font-bold"
            style={{
              fontSize: 'var(--text-h2)',
              lineHeight: 'var(--leading-snug)',
            }}
          >
            {t('helpHeading')}
          </h2>
          <p
            className="m-0 mt-3 mx-auto"
            style={{color: 'var(--color-text-secondary)', maxWidth: '54ch'}}
          >
            {t('helpBody', {phone: BUSINESS_PHONE})}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/contact"
              prefetch={false}
              className="btn btn-primary btn-md"
            >
              {t('helpCta')}
            </Link>
            <a
              href={`tel:${BUSINESS_PHONE_TEL}`}
              className="btn btn-secondary btn-md inline-flex items-center gap-2"
            >
              <Phone aria-hidden="true" size={18} strokeWidth={1.75} />
              {BUSINESS_PHONE}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

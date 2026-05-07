import {getTranslations} from 'next-intl/server';
import Breadcrumb from '@/components/ui/Breadcrumb';

/**
 * Contact hero — Phase 1.11 handover §4.1.
 *
 * Text-only (D7 lock — no photo). H1 IS the LCP candidate (cheap, fast).
 * Surface --color-bg. NO entrance animation — first paint.
 */
export default async function ContactHero() {
  const t = await getTranslations('contact.hero');
  const tCrumbs = await getTranslations('contact.breadcrumb');

  return (
    <section
      aria-labelledby="contact-hero-h1"
      className="bg-[var(--color-bg)] pt-10 pb-10 lg:pt-16 lg:pb-14"
    >
      <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
        <Breadcrumb
          className="mb-4"
          items={[
            {name: tCrumbs('home'), href: '/'},
            {name: tCrumbs('contact')},
          ]}
        />
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
          id="contact-hero-h1"
          className="m-0 font-heading"
          style={{
            fontSize: 'var(--text-h1)',
            fontWeight: 600,
            lineHeight: 'var(--leading-tight)',
            letterSpacing: 'var(--tracking-snug)',
            color: 'var(--color-text-primary)',
            textWrap: 'balance',
          }}
        >
          {t('h1')}
        </h1>
        <p
          className="m-0 mt-4 max-w-[60ch]"
          style={{
            fontSize: 'var(--text-body-lg)',
            color: 'var(--color-text-secondary)',
            lineHeight: 'var(--leading-relaxed)',
          }}
        >
          {t('sub.line1')} {t('sub.line2')}
        </p>
      </div>
    </section>
  );
}

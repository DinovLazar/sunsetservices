import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import AnimateIn from '@/components/global/motion/AnimateIn';

/**
 * Empty state — Phase 1.15 §3.5 / D14.
 *
 * Cream panel inside the white grid band. Renders when the filtered
 * subset is length 0. No amber CTA in the empty state — the page's
 * amber CTA at the bottom still appears. The action is a text-link to
 * `/projects/` (no audience param) — preserves locale via next-intl Link.
 */
export default async function EmptyState() {
  const t = await getTranslations('projects.empty');

  return (
    <section
      aria-labelledby="projects-empty-h3"
      className="bg-[var(--color-bg)] pb-14 lg:pb-20"
    >
      <div className="mx-auto max-w-[var(--container-wide)] px-4 sm:px-6 lg:px-8 xl:px-12">
        <AnimateIn variant="fade-up">
          <div
            className="rounded-2xl px-6 py-12 lg:py-16 text-center"
            style={{background: 'var(--color-bg-cream)'}}
          >
            <h3
              id="projects-empty-h3"
              className="m-0 font-heading font-bold mx-auto"
              style={{
                fontSize: 'var(--text-h3)',
                lineHeight: 'var(--leading-tight)',
                letterSpacing: 'var(--tracking-snug)',
                textWrap: 'balance',
                maxWidth: '36ch',
              }}
            >
              {t('h3')}
            </h3>
            <p
              className="m-0 mt-4 mx-auto"
              style={{
                fontSize: 'var(--text-body-lg)',
                color: 'var(--color-text-secondary)',
                lineHeight: 'var(--leading-relaxed)',
                maxWidth: '52ch',
              }}
            >
              {t('body')}
            </p>
            <p className="m-0 mt-8">
              <Link
                href="/projects/"
                className="link link-inline"
                style={{
                  fontSize: 'var(--text-body-lg)',
                  color: 'var(--color-sunset-green-700)',
                  fontWeight: 600,
                  textDecoration: 'underline',
                }}
              >
                {t('reset')}
              </Link>
            </p>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}

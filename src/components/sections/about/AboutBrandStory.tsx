import Image from 'next/image';
import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import AnimateIn from '@/components/global/motion/AnimateIn';
import storySrc from '@/assets/about/brand-story.jpg';

/**
 * About brand story — Phase 1.11 handover §3.2.
 *
 * Two-column desktop (D2 lock): image (4:5) + 3-paragraph copy column.
 * Single column on mobile. Surface: --color-bg-cream. Two `<AnimateIn>`
 * triggers (fade-up on copy, fade-left on image), composed as siblings
 * inside one section so each gets its own threshold and the section gets
 * one IntersectionObserver per child element rather than one per item.
 */
export default async function AboutBrandStory() {
  const t = await getTranslations('about.story');

  return (
    <section
      aria-labelledby="about-story-h2"
      className="bg-[var(--color-bg-cream)] py-14 lg:py-20 [content-visibility:auto] [contain-intrinsic-size:auto_900px]"
    >
      <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-8 lg:gap-16 items-center">
          <AnimateIn variant="fade-left" className="block">
            <div
              className="relative w-full overflow-hidden"
              style={{
                aspectRatio: '4 / 5',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-on-cream, var(--shadow-soft))',
              }}
            >
              <Image
                src={storySrc}
                alt={t('alt')}
                fill
                placeholder="blur"
                loading="lazy"
                sizes="(max-width: 1023px) 100vw, 40vw"
                style={{objectFit: 'cover'}}
              />
            </div>
          </AnimateIn>

          <AnimateIn variant="fade-up" className="block">
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
            <h2
              id="about-story-h2"
              className="m-0 font-heading"
              style={{
                fontSize: 'var(--text-h2)',
                fontWeight: 600,
                lineHeight: 'var(--leading-tight)',
                letterSpacing: 'var(--tracking-snug)',
                color: 'var(--color-sunset-green-700)',
                textWrap: 'balance',
              }}
            >
              {t('h2.line1')}
              <br />
              {t('h2.line2')}
            </h2>
            <p
              className="m-0 mt-6"
              style={{
                fontSize: 'var(--text-body-lg)',
                color: 'var(--color-text-secondary)',
                lineHeight: 'var(--leading-relaxed)',
                maxWidth: '60ch',
              }}
            >
              {t('p1')}
            </p>
            <p
              className="m-0 mt-4"
              style={{
                fontSize: 'var(--text-body-lg)',
                color: 'var(--color-text-secondary)',
                lineHeight: 'var(--leading-relaxed)',
                maxWidth: '60ch',
              }}
            >
              {t('p2')}
            </p>
            <p
              className="m-0 mt-4"
              style={{
                fontSize: 'var(--text-body-lg)',
                color: 'var(--color-text-secondary)',
                lineHeight: 'var(--leading-relaxed)',
                maxWidth: '60ch',
              }}
            >
              {t('p3')}
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
              <Link
                href="/residential/"
                className="link link-inline inline-flex items-center font-semibold"
                style={{
                  fontSize: 'var(--text-body)',
                  color: 'var(--color-sunset-green-700)',
                }}
              >
                {t('cta.residential')}
              </Link>
              <Link
                href="/hardscape/"
                className="link link-inline inline-flex items-center font-semibold"
                style={{
                  fontSize: 'var(--text-body)',
                  color: 'var(--color-sunset-green-700)',
                }}
              >
                {t('cta.hardscape')}
              </Link>
            </div>
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}

import Image from 'next/image';
import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import AnimateIn from '@/components/global/motion/AnimateIn';
import portraitSrc from '@/assets/home/about-portrait.jpg';

export default async function HomeAbout() {
  const t = await getTranslations('home.about');

  return (
    <section
      aria-labelledby="home-about-h2"
      className="bg-[var(--color-bg-cream)] py-14 lg:py-20 [content-visibility:auto] [contain-intrinsic-size:auto_700px]"
    >
      <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-8 lg:gap-16 items-center">
          {/* Image — first in source order so it shows above copy on mobile.
              1:1 square on mobile (any easy thumb crop), 4:5 portrait on lg+
              (the family-business moment reads as a portrait). */}
          <AnimateIn variant="fade-left" className="block">
            <div
              className="relative w-full overflow-hidden aspect-square lg:aspect-[4/5]"
              style={{
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-on-cream)',
              }}
            >
              <Image
                src={portraitSrc}
                alt={t('alt')}
                fill
                placeholder="blur"
                loading="lazy"
                sizes="(max-width: 1023px) 100vw, 40vw"
                style={{objectFit: 'cover'}}
              />
            </div>
          </AnimateIn>

          {/* Copy column */}
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
            <h2 id="home-about-h2" className="m-0">
              {t('h2Line1')}
              <br />
              {t('h2Line2')}
            </h2>
            <p
              className="m-0 mt-6"
              style={{
                fontSize: 'var(--text-body-lg)',
                color: 'var(--color-text-secondary)',
                lineHeight: 'var(--leading-relaxed)',
              }}
            >
              {t('body1')}
            </p>
            <p
              className="m-0 mt-4"
              style={{
                fontSize: 'var(--text-body-lg)',
                color: 'var(--color-text-secondary)',
                lineHeight: 'var(--leading-relaxed)',
              }}
            >
              {t('body2')}
            </p>
            <Link
              href="/about/"
              className="link link-inline mt-6 inline-flex items-center font-semibold"
              style={{
                fontSize: 'var(--text-body)',
                color: 'var(--color-sunset-green-700)',
              }}
            >
              {t('cta')} →
            </Link>
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}

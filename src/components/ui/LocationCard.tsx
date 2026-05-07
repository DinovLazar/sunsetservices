import Image, {type StaticImageData} from 'next/image';
import {Link} from '@/i18n/navigation';
import {ArrowUpRight} from 'lucide-react';

/**
 * LocationCard — Phase 1.14 §3.3.
 *
 * Photo card (locked `.card-photo`, 1.03 §6.2) used in the Service Areas
 * index cities grid. Full-card `<a>` to `/service-areas/<slug>/`. The
 * visible city name is the accessible name; the "View →" affordance is
 * `aria-hidden="true"` so screen readers don't double-read.
 *
 * Hover behaviour comes from the locked `.card-photo` class: image scales
 * to 1.03, shadow promotes from `--shadow-card` to `--shadow-hover`. Reduced
 * motion holds at scale 1.0 (the global rule covers this).
 */
type LocationCardProps = {
  href: string;
  cityName: string;
  state: string;
  tagline: string;
  photo?: StaticImageData;
  /** "View →" label, locale-aware. */
  cardCtaLabel: string;
  /** Sizes attribute for responsive image. */
  sizes?: string;
};

export default function LocationCard({
  href,
  cityName,
  state,
  tagline,
  photo,
  cardCtaLabel,
  sizes = '(max-width: 1023px) 100vw, 33vw',
}: LocationCardProps) {
  return (
    <Link
      href={href}
      className="card card-photo block relative h-full"
      style={{background: 'var(--color-sunset-green-700)'}}
    >
      <div className="relative w-full" style={{aspectRatio: '4 / 3'}}>
        {photo ? (
          <Image
            src={photo}
            alt=""
            fill
            loading="lazy"
            sizes={sizes}
            placeholder="blur"
            style={{objectFit: 'cover'}}
          />
        ) : null}
        {/* Bottom-up dark gradient overlay */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.7) 100%)',
          }}
        />
        <div className="absolute inset-0 flex flex-col justify-end p-4 lg:p-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h3
                className="m-0 font-heading"
                style={{
                  fontSize: 'var(--text-h4)',
                  fontWeight: 700,
                  color: 'var(--color-text-on-dark)',
                  letterSpacing: 'var(--tracking-snug)',
                  lineHeight: 'var(--leading-snug)',
                }}
              >
                {cityName}, {state}
              </h3>
              <p
                className="m-0 mt-1"
                style={{
                  fontSize: 'var(--text-body-sm)',
                  color: 'var(--color-text-on-dark)',
                  opacity: 0.85,
                  lineHeight: 'var(--leading-snug)',
                }}
              >
                {tagline}
              </p>
            </div>
            <span
              aria-hidden="true"
              className="hidden sm:inline-flex shrink-0 items-center justify-center"
              style={{
                width: 36,
                height: 36,
                borderRadius: 9999,
                background: 'rgba(255,255,255,0.12)',
              }}
              title={cardCtaLabel}
            >
              <ArrowUpRight
                strokeWidth={1.75}
                style={{
                  width: 18,
                  height: 18,
                  color: 'var(--color-text-on-dark)',
                }}
              />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

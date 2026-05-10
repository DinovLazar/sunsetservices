import * as React from 'react';
import Image from 'next/image';
import {Link} from '@/i18n/navigation';
import ContentMeta from './ContentMeta';

type ContentCardProps = {
  /** Locale-aware path — already includes leading slash, e.g.
   *  `/resources/{slug}/`. The next-intl `<Link>` handles locale prefixing. */
  href: string;
  category: {slug: string; label: string};
  title: string;
  /** ≤80 chars on Resources, ≤100 on Blog. */
  dek?: string;
  image: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  meta: {
    bylineLabel?: string;
    publishedAt?: string;
    formattedDate?: string;
    readingLabel: string;
  };
  /** Surface this card sits on. The card flips its background to read
   *  cleanly on the parent surface. */
  surface?: 'white' | 'cream';
  /** First card in a grid above the fold can claim LCP priority. */
  priority?: boolean;
  /** Optional wider span variant — used by the Blog index featured post
   *  layout (handover §5.2 D3). The card still composes `card-photo` —
   *  it does NOT use `.card-featured`. */
  featured?: boolean;
  /** Aspect for the photo. Defaults to 16:9 desktop / 4:3 mobile via
   *  `next/image`'s `sizes`; the featured variant uses 16:10. */
  photoAspect?: '16/9' | '16/10';
};

/**
 * `ContentCard` — Phase 1.18 §13.1.
 *
 * Composes the locked `.card-photo` primitive (Phase 1.06 §8.3 / Phase
 * 1.16 ProjectCard precedent). Whole card is one `<a>`; the visible
 * title text is the accessible name. Hover scales the photo at
 * `--motion-slow` `--easing-soft` per locked card-photo CSS in globals.
 *
 * Reuses the same shape across Resources and Blog grids; consumers pass
 * `meta.publishedAt` only on Blog (Resources hides date per D8).
 */
export default function ContentCard({
  href,
  category,
  title,
  dek,
  image,
  meta,
  surface = 'cream',
  priority = false,
  featured = false,
  photoAspect = '16/9',
}: ContentCardProps) {
  const cardBackground =
    surface === 'cream' ? 'var(--color-bg)' : 'var(--color-bg-cream)';

  const sizes = featured
    ? '(max-width: 1023px) 100vw, 640px'
    : '(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw';

  return (
    <Link
      href={href}
      prefetch={false}
      className="card card-photo content-card group block relative h-full"
      style={{
        background: cardBackground,
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        textDecoration: 'none',
        color: 'var(--color-text-primary)',
        boxShadow: 'var(--shadow-soft)',
        padding: 0,
      }}
    >
      <div
        className="content-card__photo relative w-full bg-[var(--color-bg-stone)]"
        style={{aspectRatio: photoAspect}}
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          {...(priority
            ? {priority: true, fetchPriority: 'high'}
            : {loading: 'lazy'})}
          style={{objectFit: 'cover'}}
        />
        <span
          aria-hidden="false"
          className="content-card__badge absolute"
          style={{
            top: 'var(--spacing-3)',
            left: 'var(--spacing-3)',
            background: 'var(--color-bg)',
            color: 'var(--color-sunset-green-700)',
            fontFamily: 'var(--font-heading)',
            fontWeight: 600,
            fontSize: '11px',
            letterSpacing: 'var(--tracking-eyebrow)',
            textTransform: 'uppercase',
            padding: '4px 10px',
            borderRadius: '11px',
          }}
        >
          {category.label}
        </span>
      </div>
      <div
        className="content-card__body"
        style={{
          padding: 'var(--spacing-5) var(--spacing-5) var(--spacing-6)',
        }}
      >
        <h3
          className="content-card__title m-0 font-heading"
          style={{
            fontSize: featured ? 'var(--text-h3)' : 'var(--text-h4)',
            lineHeight: 'var(--leading-snug)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            letterSpacing: 'var(--tracking-snug)',
            textWrap: 'balance',
            marginBottom: 'var(--spacing-2)',
          }}
        >
          {title}
        </h3>
        {dek ? (
          <p
            className="content-card__dek m-0"
            style={{
              fontSize: 'var(--text-body-sm)',
              color: 'var(--color-text-secondary)',
              lineHeight: 'var(--leading-relaxed)',
              marginBottom: 'var(--spacing-3)',
              textWrap: 'pretty',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {dek}
          </p>
        ) : null}
        <ContentMeta {...meta} compact />
      </div>
    </Link>
  );
}

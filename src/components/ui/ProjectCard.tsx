import * as React from 'react';
import Image from 'next/image';
import type {StaticImageData} from 'next/image';
import {Link} from '@/i18n/navigation';

/**
 * ProjectCard — locked photo-card primitive for project tiles.
 *
 * Source of truth for the tile pattern: Phase 1.06 §8.3 (homepage projects
 * teaser) + Phase 1.15 handover §1, §3.3, §4.7. Extracted in Phase 1.16
 * from `HomeProjects.tsx` so the projects index, the related-projects
 * strip on the detail page, the homepage teaser, and the audience-landing
 * featured-projects band can all consume a single component without
 * spawning a second tile variant.
 *
 * Receives already-resolved display props (locale-aware strings) so the
 * primitive itself doesn't reach into `projects.ts` or i18n — callers
 * resolve and pass strings.
 *
 * The card itself does NOT include any motion wrapper. Callers wrap the
 * grid in ONE `<AnimateIn>` (Phase 1.07 P=86 lesson — never per-tile).
 */

export type ProjectCardAudience = 'residential' | 'commercial' | 'hardscape';

type ProjectCardProps = {
  /** Locale-aware path. Must already include the leading slash, e.g. `/projects/<slug>/`. */
  href: string;
  /** Imported asset OR public path. Aspect 4:3 is enforced by the wrapper. */
  photo: StaticImageData | string;
  /** Alt text for the lead photo. Empty string allowed only for placeholder tiles where the title carries the meaning. */
  alt: string;
  /** Tile title. Required. Locale-aware string. */
  title: string;
  /**
   * Optional metadata line under the title — typically `City · Year`.
   * Renders at 0.85 opacity per handover §3.3.
   */
  meta?: string;
  /**
   * Optional uppercase tag pill (upper-left). Pass the localized short
   * label, e.g. `RESIDENTIAL`. Omit for tiles that should render without
   * an audience pill (currently no consumer omits, but the API allows it
   * for future tile variants).
   */
  audienceLabel?: string;
  /**
   * Hint to the bundler. `true` is reserved for the LCP candidate; only
   * the first tile in any grid that lives above the fold should use it.
   */
  priority?: boolean;
  /**
   * Loading hint. Defaults to `lazy`. Pass `eager` for the first 6 tiles
   * on the index grid (above-fold at 1440×900) per handover §3.3.
   */
  loading?: 'eager' | 'lazy';
  /** Responsive `sizes` hint forwarded to next/image. */
  sizes?: string;
  /** Optional className passthrough on the outer <Link>. */
  className?: string;
  /** Background colour shown while the image loads. Defaults to the locked sunset green. */
  fallbackBackground?: string;
};

export default function ProjectCard({
  href,
  photo,
  alt,
  title,
  meta,
  audienceLabel,
  priority = false,
  loading = 'lazy',
  sizes = '(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw',
  className,
  fallbackBackground = 'var(--color-sunset-green-700)',
}: ProjectCardProps) {
  const isStatic = typeof photo !== 'string';
  return (
    <Link
      href={href}
      className={['card card-photo block relative h-full', className].filter(Boolean).join(' ')}
      style={{background: fallbackBackground}}
    >
      <div className="relative w-full" style={{aspectRatio: '4 / 3'}}>
        <Image
          src={photo}
          alt={alt}
          fill
          {...(priority ? {priority: true} : {loading})}
          sizes={sizes}
          {...(isStatic ? {placeholder: 'blur'} : {})}
          style={{objectFit: 'cover'}}
        />
        {/* Bottom-up dark gradient — Phase 1.06 §8.3 locked. Title + meta clear AA over the gradient band. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(26,26,26,0.65) 100%)',
          }}
        />
        {audienceLabel ? (
          <span
            className="absolute top-4 left-4 inline-flex items-center font-heading font-semibold uppercase"
            style={{
              fontSize: '11px',
              letterSpacing: '0.08em',
              height: '22px',
              padding: '0 8px',
              borderRadius: '11px',
              background: 'rgba(250,247,241,0.16)',
              border: '1px solid rgba(250,247,241,0.32)',
              color: 'var(--color-text-on-dark)',
            }}
          >
            {audienceLabel}
          </span>
        ) : null}
        <div className="absolute bottom-4 left-4 right-4">
          <h3
            className="m-0 font-heading"
            style={{
              fontSize: 'var(--text-h5)',
              fontWeight: 600,
              color: 'var(--color-text-on-dark)',
              letterSpacing: 'var(--tracking-snug)',
              lineHeight: 'var(--leading-snug)',
            }}
          >
            {title}
          </h3>
          {meta ? (
            <p
              className="m-0 mt-1"
              style={{
                fontSize: 'var(--text-body-sm)',
                color: 'var(--color-text-on-dark)',
                opacity: 0.85,
              }}
            >
              {meta}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

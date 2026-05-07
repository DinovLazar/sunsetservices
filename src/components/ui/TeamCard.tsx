import Image from 'next/image';
import type {StaticImageData} from 'next/image';

type TeamCardProps = {
  /** Member name. NOT localized (names are names). */
  name: string;
  /** Localized role label (e.g. "Owner" / "Propietario"). */
  role: string;
  /** Localized 1–2 sentence bio. */
  bio: string;
  /** 4:5 portrait photo. */
  photo: StaticImageData;
  /**
   * Image alt text. Per Phase 1.11 handover §9.2 the name IS the meaningful
   * alt — "portrait of" padding is anti-pattern.
   */
  alt: string;
  /**
   * Should the card photo `priority`-load? Default false (below the fold on
   * About). Reserved for Part 2 reuse if a team card lands above the fold.
   */
  priority?: boolean;
};

/**
 * Server-rendered team card. Per Phase 1.11 handover §3.3 + D17:
 * cream-card variant lifts off the white About-team surface; equal weight
 * (no featured), 4:5 portrait, name as H3, role as eyebrow chip.
 */
export default function TeamCard({name, role, bio, photo, alt, priority}: TeamCardProps) {
  return (
    <article
      className="card card--cream block h-full overflow-hidden"
      style={{
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      <div className="relative w-full" style={{aspectRatio: '4 / 5'}}>
        <Image
          src={photo}
          alt={alt}
          fill
          placeholder="blur"
          loading={priority ? 'eager' : 'lazy'}
          priority={priority ?? false}
          sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
          style={{objectFit: 'cover'}}
        />
      </div>
      <div className="p-6 lg:p-7">
        <span
          className="inline-flex items-center font-heading font-semibold uppercase"
          style={{
            fontSize: '11px',
            letterSpacing: 'var(--tracking-eyebrow)',
            color: 'var(--color-sunset-green-700)',
            background: 'var(--color-sunset-green-50, rgba(220,232,213,1))',
            height: '22px',
            padding: '0 10px',
            borderRadius: '11px',
          }}
        >
          {role}
        </span>
        <h3
          className="m-0 mt-4 font-heading"
          style={{
            fontSize: 'var(--text-h4)',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            letterSpacing: 'var(--tracking-snug)',
            lineHeight: 'var(--leading-snug)',
          }}
        >
          {name}
        </h3>
        <p
          className="m-0 mt-2"
          style={{
            fontSize: 'var(--text-body)',
            color: 'var(--color-text-secondary)',
            lineHeight: 'var(--leading-relaxed)',
          }}
        >
          {bio}
        </p>
      </div>
    </article>
  );
}

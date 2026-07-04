import Image, {type StaticImageData} from 'next/image';
import {Link} from '@/i18n/navigation';
import Breadcrumb from '@/components/ui/Breadcrumb';
import type {Audience, Division} from '@/data/services';

type AudienceHeroProps = {
  /**
   * Phase M.01e — accepts either an audience slug (legacy /residential/ etc.,
   * now retired) or a division slug. The prop name stays `audience` because
   * the component is shared between the surviving audience-style page chrome
   * and the new division landings; URL/query-string usage downstream is
   * audience- or division-agnostic.
   */
  audience: Audience | Division;
  audienceLabel: string;
  homeLabel: string;
  kicker: string;
  h1: string;
  subhead: string;
  alt: string;
  photo: StaticImageData;
  primaryCta: string;
  secondaryCta: string;
};

/**
 * Audience landing hero — Phase 1.08 §3.1 D1 Layout A (full-bleed photo +
 * dark gradient + text overlay). Min-heights at every breakpoint (B-16):
 * ~52svh phone / 50vh sm / 60vh lg — the hero GROWS past these when the
 * bottom-anchored content stack needs more room, so the CTA row can never
 * clip (the former fixed sm/lg heights + 720px cap cut it off on short/wide
 * desktop viewports, e.g. 1280×620).
 *
 * No entrance animation — first-paint render to keep LCP discipline
 * (handover §2.5 + §3.1). The navbar above this hero is the solid white
 * dock (the translucent over-hero state was retired site-wide post-M.16,
 * per the M.16 handover §4).
 *
 * Audience-accent token applies only to the kicker; buttons stay
 * green/amber regardless of variant (handover §3X.1). The kicker carries
 * the M.10f hero text-shadow at all breakpoints (B-16) so it stays legible
 * over bright imagery.
 */
export default function AudienceHero({
  audience,
  audienceLabel,
  homeLabel,
  kicker,
  h1,
  subhead,
  alt,
  photo,
  primaryCta,
  secondaryCta,
}: AudienceHeroProps) {
  return (
    <section
      aria-labelledby="audience-hero-h1"
      // Phase M.11c mirrored M.10f E1 on phones (min-h + svh: grows for tall
      // EN/ES copy → no clip; svh ignores the mobile URL bar). B-16 extends
      // the same min-height-grow-with-content rule to sm/lg — the former
      // fixed heights + the 720px maxHeight cap clipped the bottom-anchored
      // CTA row on short/wide desktop viewports (operator repro: 1280×620).
      className="relative isolate overflow-hidden flex flex-col min-h-[max(22rem,52svh)] sm:min-h-[max(50vh,420px)] lg:min-h-[max(60vh,480px)] text-[var(--color-text-on-dark)]"
      // bg-charcoal fallback so cream copy clears AA contrast even before
      // the hero photo decodes (Phase B.06 — Lighthouse mobile audit
      // surfaced contrast failures when the photo hadn't loaded yet).
      style={{backgroundColor: 'var(--color-bg-charcoal)'}}
    >
      {/* Photo + gradient overlay */}
      <div className="absolute inset-0">
        <Image
          src={photo}
          alt={alt}
          fill
          priority
          fetchPriority="high"
          placeholder="blur"
          sizes="100vw"
          // Phase M.02 — quality 70 on full-bleed hero photography. Default 75
          // delivers a WebP that's measurably larger than 70 with no
          // perceptible difference at hero scale; Lighthouse's image-delivery
          // insight on /landscape/ flagged 271 KiB of mobile and 832 KiB of
          // desktop savings against this exact slot. Trimming the served
          // WebP cuts LCP bytes from the critical path.
          quality={70}
          style={{objectFit: 'cover', objectPosition: 'center 60%'}}
        />
        {/* Mobile gradient — stronger top opacity so navbar reads. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none sm:hidden"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.12) 30%, rgba(0,0,0,0.60) 100%)',
          }}
        />
        {/* Desktop gradient — fully transparent at top. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none hidden sm:block"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.12) 50%, rgba(0,0,0,0.55) 100%)',
          }}
        />
      </div>

      <div className="relative flex-1 flex flex-col justify-end">
        <div className="mx-auto w-full max-w-[var(--container-default)] px-6 sm:px-8 lg:px-12 xl:px-16 pt-32 pb-10 sm:pt-36 sm:pb-12 lg:pt-40 lg:pb-16 flex flex-col gap-3 sm:gap-4 lg:gap-5">
          <Breadcrumb
            variant="on-dark"
            items={[
              {name: homeLabel, href: '/'},
              {name: audienceLabel},
            ]}
          />
          <p
            className="font-heading font-semibold uppercase m-0"
            style={{
              fontSize: '13px',
              letterSpacing: 'var(--tracking-eyebrow)',
              color: 'var(--audience-accent)',
              // B-16 — the accent-colored kicker was near-invisible over
              // bright imagery; same halo as the homepage hero's
              // .hero-text-legible (M.10f), applied at all breakpoints.
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.62), 0 2px 10px rgba(0, 0, 0, 0.45)',
            }}
          >
            {kicker}
          </p>
          <h1
            id="audience-hero-h1"
            className="font-heading font-extrabold m-0"
            style={{
              fontSize: 'var(--text-h1)',
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              color: 'var(--color-text-on-dark)',
              maxWidth: '24ch',
            }}
          >
            {h1}
          </h1>
          <p
            className="m-0"
            style={{
              fontSize: 'var(--text-body-lg)',
              lineHeight: 'var(--leading-relaxed)',
              color: 'var(--color-text-on-dark)',
              opacity: 0.92,
              maxWidth: '60ch',
            }}
          >
            {subhead}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2">
            <Link
              href={`/request-quote/?division=${audience}`}
              className="btn btn-primary btn-lg"
              data-cr-tracking={`audience-${audience}-hero-primary`}
            >
              {primaryCta}
            </Link>
            <Link
              href={`/projects/?division=${audience}`}
              className="btn btn-ghost btn-on-dark btn-lg"
              data-cr-tracking={`audience-${audience}-hero-secondary`}
            >
              {secondaryCta} →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

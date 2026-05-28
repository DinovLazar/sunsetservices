'use client';

import * as React from 'react';
import {useReducedMotion} from 'motion/react';
import Image, {type StaticImageData} from 'next/image';

const ROTATION_INTERVAL_MS = 5000;
const CROSSFADE_DURATION_MS = 800;

export type HeroImage = {
  src: StaticImageData;
  /** Localized alt text. Empty string allowed because the carousel layer
   *  is decorative (`aria-hidden` on the wrapper) — the H1 + dek above
   *  carry the meaning for AT. */
  alt: string;
};

type HomeHeroCarouselProps = {
  images: ReadonlyArray<HeroImage>;
};

/**
 * Phase M.10c — homepage hero photo carousel. 4 images crossfade at
 * 5000ms intervals over 800ms. The first image stays as the LCP element
 * — it ships with `priority` + `fetchPriority="high"` and is the only
 * image with `opacity: 1` on first paint, so Lighthouse Performance
 * stays ≥ 95.
 *
 * Phase M.10d — mid-fade glitch fix. The pre-M.10d implementation animated
 * every layer's opacity symmetrically: the outgoing image faded 1→0 while
 * the incoming image faded 0→1, both crossing through ~0.5 at the same
 * moment. With the B.06 dark-charcoal hero background sitting behind the
 * carousel, that 50/50 moment let the background bleed through and showed
 * up as a visible brightness "dip". Fix (locked in M.10d §A): two layers
 * are ever shown at once — `activeIndex` (the layer that just became
 * current, fading 0→1 on top at z-index 3) and `prevIndex` (the previous
 * active, sitting still-fully-opaque underneath at z-index 2). The
 * incoming image always fades in **on top of** an opaque backdrop, so
 * the bare background never shows through. Other layers' fade-outs still
 * happen but are covered by `prevIndex` and therefore invisible.
 *
 * The fade uses a plain CSS `transition: opacity` on the wrapper div, not
 * `motion`'s `animate` prop. The first M.10d attempt used `motion.div`
 * with `initial={false} animate={{opacity}}` but the value-change-to-
 * animation wiring did not fire reliably across the per-tick re-renders
 * (z-index updated but opacity stayed pinned to the initial value),
 * leaving the carousel visually frozen on the first frame. A plain CSS
 * transition sidesteps the issue entirely; reduced-motion users still
 * see a single static image because the interval never starts (the
 * fade-from-0 layers never get their opacity changed).
 *
 * Layers 2–4 carry `loading="eager"` + `fetchPriority="low"` (M.10d §A
 * requirement 3) so they decode in the background while the LCP layer
 * loads first — by the time the first crossfade fires at 5s they're
 * already decoded and ready, avoiding any "flash of undecoded image".
 *
 * Reduced-motion compliance (locked decision D6, WCAG 2.2 SC 2.3.3):
 * when `useReducedMotion()` returns `true`, the rotation interval is
 * never scheduled and the carousel renders as a static single image
 * (index 0 only). No animation runs.
 *
 * The carousel wrapper carries `aria-hidden="true"` because the
 * imagery is decorative — `home.hero.alt` lives on the LCP `<Image>`
 * inside this component and the H1 + dek above the carousel carry the
 * page's accessible name.
 */
export default function HomeHeroCarousel({images}: HomeHeroCarouselProps) {
  // Track both the current active layer AND the previous active layer.
  // `prevIndex` stays fully opaque underneath `activeIndex` for the
  // duration of the crossfade — the backdrop the incoming image fades in
  // on top of. On first render `prev === active === 0` so only one layer
  // is visible.
  const [indices, setIndices] = React.useState<{active: number; prev: number}>({
    active: 0,
    prev: 0,
  });
  const reducedMotion = useReducedMotion();

  React.useEffect(() => {
    if (reducedMotion) return;
    if (images.length <= 1) return;
    const id = setInterval(() => {
      setIndices(({active}) => ({
        prev: active,
        active: (active + 1) % images.length,
      }));
    }, ROTATION_INTERVAL_MS);
    return () => clearInterval(id);
  }, [reducedMotion, images.length]);

  return (
    <div className="absolute inset-0" aria-hidden="true">
      {images.map((img, i) => {
        const isFirst = i === 0;
        const isActive = i === indices.active;
        const isPrev = i === indices.prev && i !== indices.active;
        // Reduced motion: only the first image is shown; never animate.
        const opacity = reducedMotion
          ? isFirst
            ? 1
            : 0
          : isActive || isPrev
            ? 1
            : 0;
        // z-stack:
        //   active (just-fading-in) → 3 (top)
        //   prev (full-opacity backdrop) → 2
        //   other layers → 0 (any invisible fade-out happens here, covered
        //   by `prev` at z-index 2, so no visible dip)
        const zIndex = isActive ? 3 : isPrev ? 2 : 0;
        return (
          <div
            key={i}
            className="absolute inset-0"
            style={{
              zIndex,
              opacity,
              transition: reducedMotion
                ? 'none'
                : `opacity ${CROSSFADE_DURATION_MS}ms ease-in-out`,
              willChange: 'opacity',
            }}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="100vw"
              priority={isFirst}
              fetchPriority={isFirst ? 'high' : 'low'}
              loading={isFirst ? undefined : 'eager'}
              placeholder="blur"
              style={{objectFit: 'cover', objectPosition: 'center 65%'}}
            />
          </div>
        );
      })}
    </div>
  );
}

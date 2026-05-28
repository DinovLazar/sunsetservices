'use client';

import * as React from 'react';
import {motion, useReducedMotion} from 'motion/react';
import Image, {type StaticImageData} from 'next/image';

const ROTATION_INTERVAL_MS = 5000;
const CROSSFADE_DURATION_S = 0.8;

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
  const [activeIndex, setActiveIndex] = React.useState(0);
  const reducedMotion = useReducedMotion();

  React.useEffect(() => {
    if (reducedMotion) return;
    if (images.length <= 1) return;
    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % images.length);
    }, ROTATION_INTERVAL_MS);
    return () => clearInterval(id);
  }, [reducedMotion, images.length]);

  return (
    <div className="absolute inset-0" aria-hidden="true">
      {images.map((img, i) => {
        const isFirst = i === 0;
        const targetOpacity = reducedMotion ? (isFirst ? 1 : 0) : i === activeIndex ? 1 : 0;
        return (
          <motion.div
            key={i}
            className="absolute inset-0"
            initial={false}
            animate={{opacity: targetOpacity}}
            transition={{duration: CROSSFADE_DURATION_S, ease: 'easeInOut'}}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="100vw"
              priority={isFirst}
              fetchPriority={isFirst ? 'high' : 'low'}
              placeholder="blur"
              style={{objectFit: 'cover', objectPosition: 'center 65%'}}
            />
          </motion.div>
        );
      })}
    </div>
  );
}

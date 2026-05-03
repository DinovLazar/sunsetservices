'use client';

import {useEffect, useState} from 'react';

/**
 * Returns true once `window.scrollY` exceeds `threshold` px. Used by the
 * desktop navbar to flip from state A/B to state C (per Phase 1.05 §3.3).
 *
 * Throttled with rAF so we don't churn renders on a fast wheel scroll.
 */
export function useScrollState(threshold = 24): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    let frame = 0;

    const update = () => {
      ticking = false;
      setScrolled(window.scrollY > threshold);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [threshold]);

  return scrolled;
}

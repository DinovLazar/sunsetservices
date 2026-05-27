'use client';

/**
 * AnimateIn — Motion variant-host shell. Does NOT play an entrance animation on mount.
 *
 * Despite the name, `initial={false}` is intentional: the element renders at its
 * `animate` state on first paint. There is no SSR → hydration `opacity: 0` flash and
 * no scroll-triggered fade. This is the Phase M.10 walkthrough fix — Goran's
 * "once visible, stay visible" requirement (see `_project-state/Phase-M-10-Completion.md`
 * §1 and the 2026-05-26 entry in `Sunset-Services-Decisions.md`).
 *
 * The component still wires `variants` through `motion`, so the variant `animate` state
 * (opacity 1, y 0, etc. defined in `./variants.ts`) IS what renders. Variant `initial`
 * states are kept on the records so a future consumer can opt back into a real entrance
 * by passing `initial="initial"` explicitly, or so `whileHover` / `whileTap` triggers
 * can compose against the same variant graph if added later.
 *
 * Reduced-motion is handled globally by `<MotionRoot reducedMotion="user">`.
 *
 * If you need a real scroll-triggered fade (and accept the hydration flicker risk),
 * fork this into a `ScrollReveal` primitive with `whileInView="animate"` +
 * `viewport={{ once: true, margin: '-10%' }}`. Do not change this component's default
 * behavior — too many consumers depend on the no-flicker contract.
 */

import * as React from 'react';
import {motion, type Variants} from 'motion/react';
import {animateInVariants, type AnimateInVariant} from './variants';

type AnimateInProps = {
  variant?: AnimateInVariant;
  delay?: number;
  as?: keyof React.JSX.IntrinsicElements;
  children: React.ReactNode;
  className?: string;
};

function withDelay(variant: AnimateInVariant, delay: number): Variants {
  const base = animateInVariants[variant];
  if (delay === 0) return base;
  const animate = (base.animate ?? {}) as Record<string, unknown> & {
    transition?: Record<string, unknown>;
  };
  return {
    ...base,
    animate: {
      ...animate,
      transition: {
        ...(animate.transition ?? {}),
        delay,
      },
    },
  };
}

export default function AnimateIn({
  variant = 'fade-up',
  delay = 0,
  as = 'div',
  children,
  className,
}: AnimateInProps) {
  const Component = motion[as as 'div'];
  return (
    <Component
      initial={false}
      animate="animate"
      variants={withDelay(variant, delay)}
      className={className}
    >
      {children}
    </Component>
  );
}

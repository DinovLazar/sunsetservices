'use client';

/**
 * AnimateIn — pass-through shell. Does NOT play an entrance animation on mount.
 *
 * Phase M.10 made this component a no-op via `initial={false}` on the motion
 * variant graph (Goran's "once visible, stay visible" requirement, see
 * `_project-state/Phase-M-10-Completion.md` §1). Phase M.10B documented the
 * trade-off and kept the `motion` wrapper "for a future consumer to opt back
 * into a real entrance by passing `initial="initial"` explicitly". But no
 * consumer does that today, and every page that includes AnimateIn pulled the
 * `motion/react` runtime into the always-loaded chunk for zero observable
 * benefit.
 *
 * Phase M.02 collapses this to a plain element render. The API stays the same
 * (`variant`, `delay`, `as`, `className`, `children`) so consumers don't need
 * to change. `variant` and `delay` become inert. If anyone later wants the
 * scroll-triggered fade back, fork into a new `ScrollReveal` primitive that
 * imports `motion/react` itself (and accept the bundle cost there).
 *
 * Reduced-motion: no animation = no reduced-motion concern.
 */

import * as React from 'react';
import type {AnimateInVariant} from './variants';

type AnimateInProps = {
  /** Kept for API compatibility; inert since M.02 — the component renders
   *  at its previous `animate` state with no transition. */
  variant?: AnimateInVariant;
  /** Inert since M.02. */
  delay?: number;
  as?: keyof React.JSX.IntrinsicElements;
  children: React.ReactNode;
  className?: string;
};

export default function AnimateIn({
  as = 'div',
  children,
  className,
}: AnimateInProps) {
  return React.createElement(
    as as string,
    className ? {className} : null,
    children,
  );
}

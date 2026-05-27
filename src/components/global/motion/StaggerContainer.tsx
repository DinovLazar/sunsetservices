'use client';

/**
 * StaggerContainer — Motion variant-host shell for stagger groups.
 *
 * Does NOT play an entrance cascade on mount. `initial={false}` is intentional: the
 * container and its `<StaggerItem>` children render at the `animate` state on first
 * paint with no SSR → hydration `opacity: 0` flash. This is the Phase M.10 walkthrough
 * fix — Goran's "once visible, stay visible" requirement (see
 * `_project-state/Phase-M-10-Completion.md` §1).
 *
 * The component still wires `staggerContainer` variants through `motion`, so child
 * `<StaggerItem>` orchestration via the variant graph remains available for any
 * explicit `whileHover` / `whileTap` / manual `animate` toggle a consumer might add.
 *
 * Reduced-motion is handled globally by `<MotionRoot reducedMotion="user">`.
 *
 * If you need the actual scroll-triggered stagger cascade back, fork into a new
 * `ScrollStagger` primitive with `whileInView="animate"` +
 * `viewport={{ once: true, margin: '-10%' }}`. Do not change this component's default
 * behavior — 20+ consumer files depend on the no-flicker contract.
 */

import * as React from 'react';
import {motion} from 'motion/react';
import {staggerContainer} from './stagger';

type StaggerContainerProps = {
  children: React.ReactNode;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
};

export default function StaggerContainer({
  children,
  as = 'div',
  className,
}: StaggerContainerProps) {
  const Component = motion[as as 'div'];
  return (
    <Component
      initial={false}
      animate="animate"
      variants={staggerContainer}
      className={className}
    >
      {children}
    </Component>
  );
}

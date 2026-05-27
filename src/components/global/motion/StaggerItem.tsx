'use client';

/**
 * StaggerItem — child shell for `<StaggerContainer>`.
 *
 * Does NOT play an entrance animation on mount. `initial={false}` is intentional and
 * pairs with the same setting on its parent `<StaggerContainer>`: the item renders at
 * its `animate` state on first paint with no SSR → hydration `opacity: 0` flash.
 * This is the Phase M.10 walkthrough fix — Goran's "once visible, stay visible"
 * requirement (see `_project-state/Phase-M-10-Completion.md` §1).
 *
 * The component still wires `staggerItem` variants through `motion`, so the variant
 * graph remains available for any explicit `whileHover` / `whileTap` / manual
 * `animate` toggle a consumer might add. The `initial` state on the variant (opacity 0,
 * y 12) is intentionally kept for the same reason.
 *
 * Reduced-motion is handled globally by `<MotionRoot reducedMotion="user">`.
 *
 * To re-enable the scroll-triggered stagger, see the note on `StaggerContainer.tsx`.
 * Do not change this component's default behavior in isolation — it must stay in sync
 * with its parent.
 */

import * as React from 'react';
import {motion} from 'motion/react';
import {staggerItem} from './stagger';

type StaggerItemProps = {
  children: React.ReactNode;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
};

export default function StaggerItem({
  children,
  as = 'div',
  className,
}: StaggerItemProps) {
  const Component = motion[as as 'div'];
  return (
    <Component
      initial={false}
      animate="animate"
      variants={staggerItem}
      className={className}
    >
      {children}
    </Component>
  );
}

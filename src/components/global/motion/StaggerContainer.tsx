'use client';

/**
 * StaggerContainer — pass-through shell. Does NOT play an entrance cascade on mount.
 *
 * Phase M.10 made this a no-op (`initial={false}` on the motion variant graph);
 * Phase M.10B documented the kept `motion` wrapper for hypothetical future
 * `whileHover` / `whileTap` orchestration. Phase M.02 collapses to a plain
 * element render — no consumer opts back in today and the motion runtime was
 * paying a sitewide bundle cost for nothing. API preserved (`children`, `as`,
 * `className`) so the 20+ consumer files don't need to change.
 *
 * To re-enable the scroll-triggered cascade, fork into a new `ScrollStagger`
 * primitive that imports `motion/react` itself; do NOT add it back here.
 */

import * as React from 'react';

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
  return React.createElement(
    as as string,
    className ? {className} : null,
    children,
  );
}

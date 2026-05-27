import * as React from 'react';

/**
 * Wizard route layout — Phase 1.19 D2 (reverted in Phase M.10 Issue 8).
 *
 * The Phase 1.19 D2 carve-out hid the amber "Get a Quote" CTA from the
 * navbar on this route. Phase M.10 (Goran's walkthrough) reverses the
 * decision — the navbar must look identical on every page; visual
 * consistency wins over conversion-surface dedup. Clicking the CTA from
 * inside the wizard scrolls/no-ops to the same page; acceptable.
 *
 * The layout still exists as a route-segment marker for future
 * route-scoped CSS / metadata; it currently just passes children
 * through.
 */
export default function RequestQuoteLayout({children}: {children: React.ReactNode}) {
  return <>{children}</>;
}

import * as React from 'react';

/**
 * Wizard route layout — Phase 1.19 D2.
 *
 * The amber "Get a Quote" CTA in the navbar is hidden on this route. The
 * navbar CTA component (`NavbarGetQuoteCTA`) reads `usePathname()` and
 * returns `null` when the path is `/request-quote/`, so this layout itself
 * doesn't need to do anything beyond passing children through. It exists as
 * a route-segment marker for future route-scoped CSS / metadata.
 */
export default function RequestQuoteLayout({children}: {children: React.ReactNode}) {
  return <>{children}</>;
}

import type {Metadata} from 'next';
import * as React from 'react';

/**
 * Thank-you route layout — Phase 1.19 §3.10.
 *
 * `<meta name="robots" content="noindex,follow">` because the page renders
 * user-supplied data in the URL (`?firstName=…`); search engines should
 * skip it. `follow` keeps the soft-return CTAs (projects, blog, home)
 * traversable.
 */
export const metadata: Metadata = {
  robots: {index: false, follow: true},
};

export default function ThankYouLayout({children}: {children: React.ReactNode}) {
  return <>{children}</>;
}

/**
 * Author resolution for `Article`/`BlogPosting`/`HowTo` schema —
 * Phase 1.18 §4.3 + handover §7.4.
 *
 * Erick's byline maps to a `Person` whose `url` anchors the About page's
 * `#erick` section (1.11). The "Sunset Services Team" byline maps to an
 * `Organization` (no url). Any other person string maps to a `Person`
 * with no url.
 */

import {BUSINESS_URL} from '@/lib/constants/business';

type Locale = 'en' | 'es';

export type SchemaAuthor =
  | {'@type': 'Person'; name: string; url?: string}
  | {'@type': 'Organization'; name: string};

export function resolveAuthor(byline: string, locale: Locale): SchemaAuthor {
  if (byline === 'Sunset Services Team') {
    return {'@type': 'Organization', name: byline};
  }
  if (byline === 'Erick Sotomayor') {
    const path = locale === 'en' ? '/about/#erick' : `/${locale}/about/#erick`;
    return {'@type': 'Person', name: byline, url: `${BUSINESS_URL}${path}`};
  }
  return {'@type': 'Person', name: byline};
}

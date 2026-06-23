/**
 * Single source of truth for the confirmed Google rating snapshot + the three
 * real Google reviews approved for launch.
 *
 * Step 2 / Hand-off B (Erick-confirmed 2026-06-22). M.14 stripped every
 * fabricated rating/testimonial; this is the verified refill. The live Google
 * Business Profile reviews feed is still dark (GBP API approval + OAuth pending,
 * a later phase). These constants are the hard-coded snapshot the live feed will
 * later OVERRIDE with no rework:
 *   - `getPublishedReviews()` (homepage trust band) returns real Sanity reviews
 *     when they exist and falls back to `REVIEW_SNAPSHOT` only while empty.
 *   - The sitewide `LocalBusiness` JSON-LD reads `BUSINESS_RATING` for its
 *     `AggregateRating` and `REVIEW_SNAPSHOT` for its `Review[]`.
 * When the feed lands, the snapshot is bypassed automatically.
 */

import type {HomeReviewEntry} from '@sanity-lib/types';

/**
 * Confirmed real Google figure (2026-06-22). NEVER display a count higher than
 * what Google shows — 37 is the real number. `value` is rendered to one decimal.
 */
export const BUSINESS_RATING = {
  value: 4.8,
  count: 37,
  source: 'google',
} as const;

/**
 * The three real Google reviews Erick approved to quote (all 5★, ~1 year old).
 * Text is VERBATIM from the operator note (Hand-off-B §2c) — not paraphrased.
 * Two are truncated at source ("…"); kept as supplied rather than invented.
 *
 * `quote.es` intentionally repeats the original English: these are real
 * English-language reviews, and translating a customer's words would
 * misrepresent them. A native-Spanish review pass is a separate, out-of-scope
 * task. Reviewer towns were not supplied, so cards render attribution-only and
 * no `datePublished` is asserted in schema (the exact dates were not supplied).
 */
export const REVIEW_SNAPSHOT: HomeReviewEntry[] = [
  {
    _id: 'snapshot-review-mark-c',
    quote: {
      en: 'Excellent job on restoring my paver patio. They lowered a sitting wall, added capstone, strengthened stairs, power washed and added new polymeric sand. Would definitely use again…',
      es: 'Excellent job on restoring my paver patio. They lowered a sitting wall, added capstone, strengthened stairs, power washed and added new polymeric sand. Would definitely use again…',
    },
    attribution: {en: 'Mark C', es: 'Mark C'},
    rating: 5,
    source: 'google',
    sourceUrl: null,
    publishedAt: '2025-06-15',
  },
  {
    _id: 'snapshot-review-sally-dvm',
    quote: {
      en: 'We recently hired Sunset for a water feature and paver patio. The crew was great and kind. They were on time. Would highly recommend.',
      es: 'We recently hired Sunset for a water feature and paver patio. The crew was great and kind. They were on time. Would highly recommend.',
    },
    attribution: {en: 'Sally Del Vecchio McKibbon', es: 'Sally Del Vecchio McKibbon'},
    rating: 5,
    source: 'google',
    sourceUrl: null,
    publishedAt: '2025-06-15',
  },
  {
    _id: 'snapshot-review-kelli-b',
    quote: {
      en: 'Sunset exceeded our expectations! They knocked our firepit out of the park. The guys that did the work were fast and professional. Marcin, who came out to quote us, was also…',
      es: 'Sunset exceeded our expectations! They knocked our firepit out of the park. The guys that did the work were fast and professional. Marcin, who came out to quote us, was also…',
    },
    attribution: {en: 'Kelli Batitsas', es: 'Kelli Batitsas'},
    rating: 5,
    source: 'google',
    sourceUrl: null,
    publishedAt: '2025-06-15',
  },
];

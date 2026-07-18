/**
 * Single source of truth for the Sunset Services NAP (Name / Address / Phone).
 *
 * Both the human-readable footer and the machine-readable LocalBusiness JSON-LD
 * import from here so the two cannot drift. Per Plan §2 verbatim.
 */

// Conversational name — used in flowing body copy and per-page descriptive
// titles (BG-01 §2.1.1 permits the short form there).
export const BUSINESS_NAME = 'Sunset Services';

// Full DBA name — used on every formal/structured surface (schema `name`,
// OG/Twitter `siteName`, root site-name, logo `alt`, contact-page business
// name, email templates). Step 2 / Hand-off B brand lock (2026-06-22).
export const BUSINESS_NAME_FULL = 'Sunset Services U.S.';

// Registered legal entity behind the DBA — schema `legalName` + copyright line.
export const BUSINESS_LEGAL_NAME = 'E VALLE INC';

export const BUSINESS_PHONE = '(630) 946-9321';
export const BUSINESS_PHONE_TEL = '+16309469321';

export const BUSINESS_EMAIL = 'info@sunsetservices.us';

/**
 * Canonical site origin — **including the `www.` subdomain**.
 *
 * Phase B.18 correction. This was `https://sunsetservices.us` (no `www`) from
 * Phase 1 through B.17, while the production deployment has always SERVED from
 * `https://www.sunsetservices.us` — the apex 308-redirects to `www`. Verified
 * live on 2026-07-18:
 *
 *     curl -sI https://sunsetservices.us/  →  308 → https://www.sunsetservices.us/
 *
 * The mismatch meant every page served at `www.…` carried
 * `<link rel="canonical" href="https://sunsetservices.us">` — a canonical
 * pointing at a URL that immediately redirects back to the page it was on.
 * Same for every hreflang, every `<loc>` in the sitemap, the `Sitemap:` line
 * in robots.txt, and every schema.org `@id` and `url`. Google usually
 * untangles this, but "usually" costs crawl budget and leaves the host
 * ambiguous while it does.
 *
 * Goran's call (2026-07-18): `www` is canonical — match the code to the
 * serving reality rather than reconfiguring the domain.
 *
 * This constant is the single lever: `SITE_URL` derives from it (canonicals,
 * hreflang, sitemap, OG), and every `src/lib/schema/*` builder interpolates it
 * directly for `@id` and `url` values. Changing it here moves all of them
 * together, which is the only safe way to change it — the `@id`s must stay
 * consistent with each other or the entity graph fragments.
 *
 * IF THE HOST EVER CHANGES AGAIN: change it here and nowhere else, then
 * re-submit the sitemap in Google Search Console and Bing Webmaster Tools so
 * the new host is recrawled promptly.
 */
export const BUSINESS_URL = 'https://www.sunsetservices.us';

export const BUSINESS_ADDRESS_LINE1 = '1630 Mountain St';
export const BUSINESS_ADDRESS_LINE2 = 'Aurora, IL 60505';

export const BUSINESS_ADDRESS = {
  streetAddress: '1630 Mountain St',
  addressLocality: 'Aurora',
  addressRegion: 'IL',
  postalCode: '60505',
  addressCountry: 'US',
} as const;

export const BUSINESS_AREA_SERVED = [
  'Aurora',
  'Naperville',
  'Batavia',
  'Wheaton',
  'Lisle',
  'Bolingbrook',
] as const;

// ───────────────────────── Phase B.17 — entity enrichment ─────────────────────
// Added for the AI/answer-engine work (llms.txt + expanded sitewide @graph).
// TRUTH RULE: every value below is either already verified elsewhere in this
// repo, verified in Sunset-Facts.md, or resolved from an env var at runtime.
// Nothing here is invented. Where a fact is not yet confirmed by Erick, the
// constant is `null`/empty and the schema builder OMITS the property rather
// than guessing — an absent property costs nothing; a wrong one is a lie in
// machine-readable form that Google and every LLM will cache.

/**
 * Year the business was founded by Nick Valle. Verified: BG-01 + the live
 * site's "Family-run since 2000" hero copy + project instructions §3.
 * Erick Valle (Nick's son, SECOND generation) took over operations in 2018.
 */
export const BUSINESS_FOUNDING_YEAR = '2000';

/**
 * One-paragraph plain-language description of the business. This is the single
 * string most likely to be quoted verbatim by an LLM when someone asks
 * "who does hardscaping in Aurora?" — so it states only verifiable facts:
 * the divisions, the geography, the founding year, the Unilock credential.
 * No superlatives, no price claims, no "best in" (BG-01 §8.5).
 */
export const BUSINESS_DESCRIPTION =
  'Sunset Services U.S. is a family-run landscape, hardscape, waterproofing, ' +
  'snow removal, and trenchless/directional boring contractor based in Aurora, ' +
  'Illinois, serving the western Chicago suburbs since 2000. A Unilock ' +
  'Authorized Contractor, serving homeowners and commercial properties across ' +
  'DuPage, Kane, Kendall, Will, and Cook counties.';

/**
 * Business hours. Source: `src/lib/chat/knowledgeBase.ts` (the same hours the
 * chat assistant already quotes to customers), so the two cannot drift.
 *
 * NOTE the deliberate gap: Saturday is "by appointment", which is NOT an open
 * window and must NOT be emitted as `openingHoursSpecification`. Marking
 * Saturday open would send customers to a closed shop and would contradict the
 * Google Business Profile. Only Mon–Fri is expressed in schema.
 */
export const BUSINESS_HOURS_HUMAN =
  'Mon–Fri 7:00 AM – 5:00 PM · Sat by appointment · Sun closed';

export const BUSINESS_OPENING_HOURS = [
  {
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '07:00',
    closes: '17:00',
  },
] as const;

/**
 * Geo coordinates for 1630 Mountain St.
 *
 * INTENTIONALLY NULL. `src/data/locations.ts` carries a lat/lng for the CITY
 * of Aurora (41.7606, -88.3201) — that is the municipal centroid, not this
 * address, and publishing it as the business's `geo` would place the company
 * roughly two miles from where it actually is. A wrong pin is worse than no
 * pin: it degrades local-pack relevance and contradicts the Google Business
 * Profile, which is the authority Google trusts for this.
 *
 * TO FILL: take the coordinates directly from the Google Business Profile
 * listing (Google Maps → the pin → right-click → the lat/lng at the top of
 * the menu). Then set the object below; `buildSitewideGraph()` picks it up
 * with no other change.
 */
export const BUSINESS_GEO: {latitude: number; longitude: number} | null = null;

/**
 * Social + directory profile URLs → schema.org `sameAs`.
 *
 * `sameAs` is how Google and every LLM confirm that the "Sunset Services" on
 * this website is the same entity as the one on the Google Business Profile,
 * Facebook, etc. It is one of the highest-leverage entity signals available
 * and it is currently EMPTY — the biggest single gap in this site's SEO.
 *
 * Wired to the same `NEXT_PUBLIC_SOCIAL_*` env vars the footer icons already
 * use (Phase M.14 / QA B-09 B5), so filling them in Vercel lights up the
 * footer icons AND the entity graph at once, with no code change.
 *
 * PENDING ERICK: a public web search surfaces a Facebook page at
 * facebook.com/SunsetLawnService under the older "Sunset Lawn Service & Pro
 * Brick" name. That is NOT hardcoded here — an unconfirmed profile in
 * `sameAs` tells Google the wrong thing about who this company is, and the
 * old name would fight the current DBA for the brand entity. Erick confirms
 * the live URLs, then they go in the env vars.
 */
export const BUSINESS_SAME_AS: readonly string[] = [
  process.env.NEXT_PUBLIC_SOCIAL_GBP_URL,
  process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK_URL,
  process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM_URL,
  process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE_URL,
].filter((u): u is string => typeof u === 'string' && u.trim().length > 0);

/**
 * Absolute URL of the logo used in `Organization.logo` / `LocalBusiness.image`.
 * Google requires an absolute URL here (a relative path is silently dropped).
 * Reuses the existing OG logo asset — already in `public/og/`.
 */
export const BUSINESS_LOGO_PATH = '/og/logo-horizontal-white.png';

/**
 * Credential. Verified in BG-01 + project instructions §3 and stated on the
 * live site. Emitted as `hasCredential` so answer engines can cite the one
 * third-party-verifiable qualification the company holds.
 */
export const BUSINESS_CREDENTIAL = 'Unilock Authorized Contractor';

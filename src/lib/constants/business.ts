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

export const BUSINESS_URL = 'https://sunsetservices.us';

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

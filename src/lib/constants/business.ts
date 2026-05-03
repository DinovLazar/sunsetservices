/**
 * Single source of truth for the Sunset Services NAP (Name / Address / Phone).
 *
 * Both the human-readable footer and the machine-readable LocalBusiness JSON-LD
 * import from here so the two cannot drift. Per Plan §2 verbatim.
 */

export const BUSINESS_NAME = 'Sunset Services';

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

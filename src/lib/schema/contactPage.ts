/**
 * ContactPage JSON-LD payload builder per Phase 1.11 handover §5.2.
 *
 * The visible NAP block + form are not separately schema-typed. Instead the
 * page-level ContactPage references the sitewide LocalBusiness (Phase 1.05
 * root layout) by `@id` so phone/email/address come through one canonical
 * source.
 */

import {BUSINESS_URL} from '@/lib/constants/business';

export type ContactPageLocale = 'en' | 'es';

export function buildContactPageSchema(locale: ContactPageLocale) {
  const path = locale === 'en' ? '/contact/' : `/${locale}/contact/`;
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    url: `${BUSINESS_URL}${path}`,
    mainEntity: {'@id': `${BUSINESS_URL}/#localbusiness`},
    availableLanguage: ['en', 'es'],
  };
}

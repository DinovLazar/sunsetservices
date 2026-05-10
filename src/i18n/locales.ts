/**
 * Single source of truth for the `Locale` type and the runtime locale list.
 *
 * Mirrors `routing.locales` from `@/i18n/routing` but exports the type
 * separately so plain-data modules (seeds, schema builders) can import it
 * without pulling in `next-intl` runtime code.
 */

import {routing} from './routing';

export type Locale = (typeof routing.locales)[number];

export const LOCALES = routing.locales;

import {getTranslations} from 'next-intl/server';

/**
 * Locale-bound skip link — first focusable element on every page.
 * Hidden until focused (translated off-screen via the .skip-link class
 * in globals.css §6.12). Targets <main id="main">.
 */
export default async function SkipLink() {
  const t = await getTranslations('chrome');
  return (
    <a href="#main" className="skip-link">
      {t('skipLink')}
    </a>
  );
}

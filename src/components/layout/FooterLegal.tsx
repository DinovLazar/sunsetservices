import {getLocale, getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';

/**
 * Bottom-most strip — copyright + privacy/terms/accessibility/locale-switch.
 * Surface is `#0E0E0E` (1px darker than charcoal) to mark it as a separate
 * band without introducing a new token; legal microbar pattern from §5.3.6.
 */
export default async function FooterLegal() {
  const t = await getTranslations('chrome.footer');
  const locale = await getLocale();
  const year = new Date().getFullYear();

  const otherLocale = locale === 'en' ? 'es' : 'en';
  const localeSwitchKey = locale === 'en' ? 'localeSwitchToEs' : 'localeSwitchToEn';

  return (
    <div className="bg-[#0E0E0E]">
      <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12 py-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between text-[13px]">
        <p className="text-[var(--color-sunset-green-200)] m-0">
          {t('copyright', {year})}
        </p>
        {/* Each legal link wears `inline-flex items-center min-h-[24px]` so
            the tap area clears WCAG SC 2.5.8 (Target Size Minimum) — the
            17-px text alone is 17×~60 which fails the 24×24 floor even with
            the 20-px horizontal gap. Vertical padding alone is the
            minimum-blast-radius fix; the visual rhythm is unchanged. */}
        <ul className="list-none m-0 p-0 flex flex-wrap items-center gap-x-5 gap-y-2">
          <li>
            <Link
              href="/privacy/"
              className="inline-flex items-center min-h-[24px] text-[var(--color-sunset-green-300)] hover:text-[var(--color-sunset-green-100)] no-underline"
            >
              {t('privacy')}
            </Link>
          </li>
          <li>
            <Link
              href="/terms/"
              className="inline-flex items-center min-h-[24px] text-[var(--color-sunset-green-300)] hover:text-[var(--color-sunset-green-100)] no-underline"
            >
              {t('terms')}
            </Link>
          </li>
          <li>
            <Link
              href="/accessibility/"
              className="inline-flex items-center min-h-[24px] text-[var(--color-sunset-green-300)] hover:text-[var(--color-sunset-green-100)] no-underline"
            >
              {t('accessibility')}
            </Link>
          </li>
          <li>
            <Link
              href="/"
              locale={otherLocale}
              hrefLang={otherLocale}
              lang={otherLocale}
              className="inline-flex items-center min-h-[24px] text-[var(--color-sunset-green-300)] hover:text-[var(--color-sunset-green-100)] no-underline"
            >
              {t(localeSwitchKey)}
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

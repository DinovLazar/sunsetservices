import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {SERVICE_AREAS_CITIES} from '@/lib/constants/navigation';
import SocialIcons from './SocialIcons';

export default async function FooterServiceAreas() {
  const t = await getTranslations();
  return (
    <nav
      aria-label={t('chrome.footer.serviceAreasNavAriaLabel')}
      className="flex flex-col md:flex-row gap-6 md:items-end md:justify-between border-t border-[var(--color-text-on-dark)]/15 pt-10"
    >
      <div className="flex flex-col gap-3">
        <h2 className="font-heading font-semibold text-[12px] tracking-[0.08em] uppercase text-[var(--color-text-on-dark)] m-0">
          {t('chrome.footer.serviceAreasHeading')}
        </h2>
        <ul className="list-none m-0 p-0 grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-row md:flex-wrap gap-x-6 gap-y-2">
          {SERVICE_AREAS_CITIES.map((city) => (
            <li key={city.id}>
              <Link
                href={city.href}
                className="text-[14px] font-medium text-[var(--color-sunset-green-300)] hover:text-[var(--color-sunset-green-100)] no-underline"
              >
                {t(city.labelKey)}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <SocialIcons />
    </nav>
  );
}

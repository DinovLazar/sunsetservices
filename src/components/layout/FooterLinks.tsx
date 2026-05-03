import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {FOOTER_LINKS} from '@/lib/constants/navigation';

export default async function FooterLinks() {
  const t = await getTranslations();
  return (
    <nav
      aria-label={t('chrome.footer.navAriaLabel')}
      className="grid grid-cols-1 sm:grid-cols-3 gap-8"
    >
      {FOOTER_LINKS.map((column) => (
        <div key={column.id} className="flex flex-col gap-3">
          <h2 className="font-heading font-semibold text-[12px] tracking-[0.08em] uppercase text-[var(--color-text-on-dark)] m-0">
            {t(column.headingKey)}
          </h2>
          <ul className="list-none m-0 p-0 flex flex-col gap-2.5">
            {column.children.map((child) => (
              <li key={`${column.id}-${child.labelKey}-${child.href}`}>
                <Link
                  href={child.href}
                  className="text-[14px] font-medium text-[var(--color-sunset-green-300)] hover:text-[var(--color-sunset-green-100)] no-underline"
                >
                  {t(child.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

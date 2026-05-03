import {getTranslations} from 'next-intl/server';
import Logo from '@/components/global/Logo';
import {
  BUSINESS_ADDRESS_LINE1,
  BUSINESS_ADDRESS_LINE2,
  BUSINESS_EMAIL,
  BUSINESS_PHONE,
  BUSINESS_PHONE_TEL,
} from '@/lib/constants/business';

export default async function FooterBrand() {
  const t = await getTranslations('chrome.footer');

  return (
    <div className="flex flex-col gap-5 max-w-[280px]">
      <Logo skin="dark" />
      <p className="text-[var(--color-text-on-dark)] text-[15px] leading-relaxed m-0">
        {t('tagline')}
      </p>
      <address className="not-italic flex flex-col gap-1 text-[14px] text-[var(--color-sunset-green-200)]">
        <span>{BUSINESS_ADDRESS_LINE1}</span>
        <span>{BUSINESS_ADDRESS_LINE2}</span>
        <a
          href={`tel:${BUSINESS_PHONE_TEL}`}
          data-cr-tracking="footer-phone"
          className="text-[var(--color-sunset-green-300)] hover:text-[var(--color-sunset-green-100)] no-underline mt-3"
        >
          {BUSINESS_PHONE}
        </a>
        <a
          href={`mailto:${BUSINESS_EMAIL}`}
          className="text-[var(--color-sunset-green-300)] hover:text-[var(--color-sunset-green-100)] no-underline"
        >
          {BUSINESS_EMAIL}
        </a>
      </address>
      {/* Unilock Authorized Contractor — Erick supplies real logo in Part 2. */}
      <div
        className="inline-flex items-center justify-center w-[120px] h-9 rounded text-[11px] text-[var(--color-sunset-green-300)] border border-dashed border-[var(--color-sunset-green-300)]/60"
        aria-label="Unilock Authorized Contractor (placeholder)"
      >
        UNILOCK BADGE
      </div>
    </div>
  );
}

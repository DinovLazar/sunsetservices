import Image from 'next/image';
import {getTranslations} from 'next-intl/server';
import Logo from '@/components/global/Logo';
import unilockBadge from '@/assets/brand/unilock-authorized-contractor.png';
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
      {/* Unilock Authorized Contractor — real badge. Phase M.10 Issue 9 Part B
          dropped the bg-white chip wrapper Goran flagged as a "stray white box"
          in the dark footer. The badge PNG is RGBA with its own design; it
          reads cleanly on charcoal without a chip. */}
      <Image
        src={unilockBadge}
        alt="Unilock Authorized Contractor"
        width={110}
        height={70}
        style={{height: 'auto', width: '110px'}}
      />
    </div>
  );
}

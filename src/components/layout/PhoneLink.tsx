import {getTranslations} from 'next-intl/server';
import {Phone} from 'lucide-react';
import {BUSINESS_PHONE_TEL} from '@/lib/constants/business';

type PhoneLinkProps = {
  trackingId: string;
  /**
   * `auto` shows the icon at all sizes and the label only at xl+ (per
   * Spanish overflow plan §3.11). `text` always shows the label. `icon`
   * always shows just the icon (used by the mobile bar).
   */
  variant?: 'auto' | 'text' | 'icon';
  className?: string;
};

/**
 * Tap-to-call link sourced from `lib/constants/business.ts`. The
 * `data-cr-tracking` attribute is the CallRail hook the analytics phase
 * (Part 2.10) wires up — render it now so the markup is stable.
 */
export default async function PhoneLink({
  trackingId,
  variant = 'auto',
  className,
}: PhoneLinkProps) {
  const t = await getTranslations('chrome.cta.callUs');
  const label = t('linkLabel');

  const showText = variant === 'text';
  const hideText = variant === 'icon';

  return (
    <a
      href={`tel:${BUSINESS_PHONE_TEL}`}
      aria-label={label}
      data-cr-tracking={trackingId}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-md',
        'text-[15px] font-medium leading-none no-underline',
        'text-[var(--color-sunset-green-700)] hover:text-[var(--color-sunset-green-500)]',
        'min-h-[44px] min-w-[44px] px-2',
        showText
          ? ''
          : hideText
            ? ''
            : 'xl:min-h-0 xl:min-w-0 xl:px-0 xl:justify-start',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Phone className="size-4 shrink-0" aria-hidden="true" />
      {!hideText && (
        <span className={showText ? '' : 'hidden xl:inline'}>{label}</span>
      )}
    </a>
  );
}

'use client';

import * as React from 'react';
import {useTranslations} from 'next-intl';
import {Link, usePathname} from '@/i18n/navigation';

type NavbarLinkProps = {
  href: string;
  labelKey: string;
};

/**
 * Desktop navbar primary link. Active page gets weight 600 + 2px green-500
 * underline (per D1.05-C ratification); hover gets a 1px underline that
 * grows from the left edge.
 */
export default function NavbarLink({href, labelKey}: NavbarLinkProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      data-active={isActive || undefined}
      className={[
        'relative inline-flex items-center px-1 py-2 text-[15px] leading-none no-underline',
        'text-[var(--color-text-primary)] font-medium data-[active=true]:font-semibold',
        'hover:text-[var(--color-sunset-green-700)]',
        'after:content-[""] after:absolute after:left-0 after:bottom-[-6px]',
        'after:h-px after:bg-[var(--color-sunset-green-500)] after:w-0',
        'after:transition-[width] after:duration-[var(--motion-fast)] after:ease-[var(--easing-standard)]',
        'hover:after:w-[calc(100%-1rem)]',
        'data-[active=true]:after:h-[2px] data-[active=true]:after:w-[calc(100%-1rem)]',
      ].join(' ')}
    >
      {t(labelKey)}
    </Link>
  );
}

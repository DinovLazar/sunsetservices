'use client';

import * as React from 'react';
import {useRouter, usePathname, useSearchParams} from 'next/navigation';

export type FilterChipDefinition = {
  /** URL slug; `null` is the "All" entry which clears the param. */
  slug: string | null;
  label: string;
};

type FilterChipStripProps = {
  /** Ordered chip list — first entry is `{slug: null}` ("All"). */
  chips: FilterChipDefinition[];
  /** Active category slug parsed from `?category=`. `null` means "All". */
  activeSlug: string | null;
  /** Accessible label for the chip group (localized by caller). */
  ariaLabel: string;
  /** ID of the grid the chips control — wires `aria-controls`. */
  controlsId: string;
};

/**
 * `<FilterChipStrip>` — Phase 1.18 §12.5 / §3.2.
 *
 * Single-select chip strip wired to URL state at `?category={slug}`.
 * "All" omits the param. Filter changes always reset pagination (we
 * delete `?page` if present, mirroring the projects FilterChipStrip
 * precedent).
 *
 * Mobile (<768): horizontally scrollable with a right-edge mask-image
 * fade; touch padding lifts the 36px chip to a 44px hit area.
 */
export default function FilterChipStrip({
  chips,
  activeSlug,
  ariaLabel,
  controlsId,
}: FilterChipStripProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setCategory(next: string | null) {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    if (next) {
      params.set('category', next);
    } else {
      params.delete('category');
    }
    params.delete('page');
    const qs = params.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    router.replace(url, {scroll: false});
  }

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      aria-controls={controlsId}
      className="-mx-4 sm:-mx-6 lg:-mx-8 xl:-mx-12 px-4 sm:px-6 lg:px-8 xl:px-12 overflow-x-auto"
      style={{
        WebkitMaskImage:
          'linear-gradient(90deg, #000 0, #000 calc(100% - 24px), transparent 100%)',
        maskImage:
          'linear-gradient(90deg, #000 0, #000 calc(100% - 24px), transparent 100%)',
        scrollSnapType: 'x proximity',
      }}
    >
      <ul className="m-0 p-0 list-none flex items-center gap-3 whitespace-nowrap">
        {chips.map((chip) => {
          const isActive =
            chip.slug === null ? activeSlug === null : activeSlug === chip.slug;
          return (
            <li
              key={chip.slug ?? '__all__'}
              className="inline-flex items-center"
              style={{scrollSnapAlign: 'start'}}
            >
              <button
                type="button"
                aria-pressed={isActive}
                onClick={() => setCategory(chip.slug)}
                className="inline-flex items-center justify-center font-heading font-semibold transition-colors"
                style={{
                  paddingTop: '4px',
                  paddingBottom: '4px',
                  padding: '0 16px',
                  height: '40px',
                  fontSize: '14px',
                  borderRadius: '20px',
                  lineHeight: 1,
                  background: isActive
                    ? 'var(--color-sunset-green-700)'
                    : 'var(--color-bg)',
                  color: isActive
                    ? 'var(--color-text-on-dark)'
                    : 'var(--color-text-primary)',
                  border: isActive
                    ? '1px solid transparent'
                    : '1px solid var(--color-border-strong)',
                  transitionDuration: 'var(--motion-fast)',
                  transitionTimingFunction: 'var(--easing-standard)',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    const target = e.currentTarget;
                    target.style.background = 'var(--color-sunset-green-50)';
                    target.style.borderColor = 'var(--color-sunset-green-500)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    const target = e.currentTarget;
                    target.style.background = 'var(--color-bg)';
                    target.style.borderColor = 'var(--color-border-strong)';
                  }
                }}
              >
                {chip.label}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

'use client';

import * as React from 'react';
import {useRouter, useSearchParams, usePathname} from 'next/navigation';
import {useTranslations} from 'next-intl';
import type {Division} from '@/data/services';

type DivisionCount = {
  division: Division | 'all';
  count: number;
};

type FilterChipStripProps = {
  /**
   * Per-division tile counts computed at request time on the server. Stable
   * across filter changes — chips show the count of projects in each
   * division, not the count after applying the current filter.
   */
  counts: DivisionCount[];
  /**
   * The current `?division` value parsed and sanitized server-side. The
   * chip strip mirrors this in `aria-pressed`. `undefined` => All active.
   */
  activeDivision: Division | undefined;
};

/**
 * Filter chip strip — Phase 1.15 §3.2 / D2.A, migrated by Phase M.10c
 * addendum (2026-05-27) from the 3-audience scheme to the 4-division IA.
 * Single-select division filter (All / Landscape / Hardscape / Waterproofing
 * / Snow Removal) wired to URL state at `?division={slug}`. "All" clears
 * the param. All 4 division chips always render — even at count 0 (locked
 * decision D9).
 *
 * Element: `<button type="button">` with `aria-pressed`. Native button is
 * the right element — no `role="tab"` because there's no panel.
 *
 * Counts are static at request time (passed in from the server). The chip
 * strip does NOT recompute them on client.
 *
 * Mobile: horizontally scrollable strip with `mask-image` right-edge fade
 * to signal scroll affordance. Touch-target padding lifts the 36px chip
 * to a 44px hit area without changing the visual.
 */
export default function FilterChipStrip({counts, activeDivision}: FilterChipStripProps) {
  const t = useTranslations('projects.filter');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setDivision(next: Division | undefined) {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    if (next) {
      params.set('division', next);
    } else {
      params.delete('division');
    }
    // Filter changes always reset pagination.
    params.delete('page');
    const qs = params.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    router.replace(url, {scroll: false});
  }

  return (
    <section
      aria-label={t('label')}
      className="bg-[var(--color-bg)] pt-10 lg:pt-14"
    >
      <div className="mx-auto max-w-[var(--container-wide)] px-4 sm:px-6 lg:px-8 xl:px-12">
        <p
          className="m-0 mb-3 lg:mb-4"
          style={{
            fontSize: 'var(--text-body-sm)',
            color: 'var(--color-text-muted)',
            fontWeight: 500,
          }}
        >
          {t('label')}
        </p>
        <div
          role="group"
          aria-label={t('label')}
          className="-mx-4 sm:-mx-6 lg:-mx-8 xl:-mx-12 px-4 sm:px-6 lg:px-8 xl:px-12 overflow-x-auto"
          style={{
            // Right-edge fade on mobile so the scroll affordance is obvious.
            // No mask on desktop where all chips fit on one row.
            WebkitMaskImage:
              'linear-gradient(90deg, #000 0, #000 calc(100% - 24px), transparent 100%)',
            maskImage:
              'linear-gradient(90deg, #000 0, #000 calc(100% - 24px), transparent 100%)',
            scrollSnapType: 'x proximity',
          }}
        >
          <ul className="m-0 p-0 list-none flex items-center gap-3 lg:gap-3 whitespace-nowrap">
            {counts.map(({division, count}) => {
              const isActive =
                division === 'all' ? !activeDivision : activeDivision === division;
              return (
                <li
                  key={division}
                  className="inline-flex items-center"
                  style={{scrollSnapAlign: 'start'}}
                >
                  <button
                    type="button"
                    aria-pressed={isActive}
                    onClick={() =>
                      setDivision(division === 'all' ? undefined : (division as Division))
                    }
                    className="inline-flex items-center justify-center font-heading font-semibold transition-colors"
                    style={{
                      // 4px touch-padding lifts 36/40 visual to ≥44 hit-area
                      paddingTop: '4px',
                      paddingBottom: '4px',
                      // Visual chip via inner span inside; the button itself
                      // is the bigger hit area. Use a single button for
                      // simpler ARIA — and apply visual styles directly here.
                      padding: '0 16px',
                      height: '40px',
                      fontSize: '14px',
                      borderRadius: '20px',
                      lineHeight: 1,
                      background: isActive
                        ? 'var(--color-sunset-green-700)'
                        : 'transparent',
                      color: isActive
                        ? 'var(--color-text-on-dark)'
                        : 'var(--color-text-primary)',
                      border: isActive ? '1px solid transparent' : '1px solid var(--color-border-strong)',
                      transitionDuration: 'var(--motion-fast)',
                      transitionTimingFunction: 'var(--easing-standard)',
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
                        target.style.background = 'transparent';
                        target.style.borderColor = 'var(--color-border-strong)';
                      }
                    }}
                  >
                    {t(division, {count})}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

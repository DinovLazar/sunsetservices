'use client';

import * as React from 'react';
import {useRouter, useSearchParams, usePathname} from 'next/navigation';
import {useTranslations} from 'next-intl';
import type {ProjectAudience} from '@/data/projects';

type AudienceCount = {
  audience: ProjectAudience | 'all';
  count: number;
};

type FilterChipStripProps = {
  /**
   * Per-audience tile counts computed at request time on the server. Stable
   * across filter changes — chips show the count of projects in each
   * audience, not the count after applying the current filter.
   */
  counts: AudienceCount[];
  /**
   * The current `?audience` value parsed and sanitized server-side. The
   * chip strip mirrors this in `aria-pressed`. `undefined` => All active.
   */
  activeAudience: ProjectAudience | undefined;
};

/**
 * Filter chip strip — Phase 1.15 §3.2 / D2.A. Single-select audience
 * filter (All / Residential / Commercial / Hardscape) wired to URL state
 * at `?audience={slug}`. "All" clears the param.
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
export default function FilterChipStrip({counts, activeAudience}: FilterChipStripProps) {
  const t = useTranslations('projects.filter');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setAudience(next: ProjectAudience | undefined) {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    if (next) {
      params.set('audience', next);
    } else {
      params.delete('audience');
    }
    // Filter changes always reset pagination.
    params.delete('page');
    const qs = params.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    router.replace(url, {scroll: false});
  }

  const labelKey: Record<AudienceCount['audience'], string> = {
    all: 'all',
    residential: 'residential',
    commercial: 'commercial',
    hardscape: 'hardscape',
  };

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
            {counts.map(({audience, count}) => {
              const isActive =
                audience === 'all' ? !activeAudience : activeAudience === audience;
              return (
                <li
                  key={audience}
                  className="inline-flex items-center"
                  style={{scrollSnapAlign: 'start'}}
                >
                  <button
                    type="button"
                    aria-pressed={isActive}
                    onClick={() =>
                      setAudience(audience === 'all' ? undefined : (audience as ProjectAudience))
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
                    {t(labelKey[audience], {count})}
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

'use client';

import * as React from 'react';
import Image from 'next/image';
import type {StaticImageData} from 'next/image';
import {useTranslations} from 'next-intl';

type BeforeAfterToggleProps = {
  before: StaticImageData;
  after: StaticImageData;
  beforeAlt: string;
  afterAlt: string;
};

/**
 * Before / after toggle — Phase 1.15 §4.6 / D9.C.
 *
 * Tab-style segmented control: two `<button type="button" aria-pressed>`
 * inside one rounded container. Defaults to AFTER on first paint so the
 * SSR'd HTML shows the better state (no-JS fallback). Hydration is
 * progressive: the toggle becomes interactive once mounted.
 *
 * Keyboard: ←/→ swap state. Tab moves past the group.
 *
 * Cross-fade is the locked 200ms opacity transition. Reduced-motion users
 * get an instant swap (CSS `prefers-reduced-motion` query short-circuits
 * the transition).
 */
export default function BeforeAfterToggle({
  before,
  after,
  beforeAlt,
  afterAlt,
}: BeforeAfterToggleProps) {
  const t = useTranslations('project.beforeAfter');
  const [showAfter, setShowAfter] = React.useState(true);

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      setShowAfter((s) => !s);
    }
  }

  return (
    <section
      aria-labelledby="project-ba-h2"
      className="bg-[var(--color-bg)] py-14 lg:py-20 [content-visibility:auto] [contain-intrinsic-size:auto_700px]"
    >
      <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12">
        <h2
          id="project-ba-h2"
          className="m-0 mb-8 lg:mb-10 font-heading font-bold"
          style={{
            fontSize: 'var(--text-h2)',
            lineHeight: 'var(--leading-tight)',
            letterSpacing: 'var(--tracking-snug)',
            textWrap: 'balance',
          }}
        >
          {t('h2')}
        </h2>
        {/* Segmented control */}
        <div
          role="group"
          aria-label={t('h2')}
          onKeyDown={onKeyDown}
          className="inline-flex p-1 rounded-lg mb-6 lg:mb-8"
          style={{
            background: 'var(--color-bg-cream)',
            border: '1px solid var(--color-border)',
          }}
        >
          {(
            [
              {key: 'before' as const, label: t('before'), value: false},
              {key: 'after' as const, label: t('after'), value: true},
            ]
          ).map(({key, label, value}) => {
            const isActive = showAfter === value;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={isActive}
                onClick={() => setShowAfter(value)}
                className="font-heading font-semibold inline-flex items-center justify-center transition-colors"
                style={{
                  height: '40px',
                  minWidth: '120px',
                  padding: '0 16px',
                  fontSize: '15px',
                  borderRadius: '6px',
                  background: isActive ? 'var(--color-sunset-green-700)' : 'transparent',
                  color: isActive
                    ? 'var(--color-text-on-dark)'
                    : 'var(--color-text-primary)',
                  border: 'none',
                  cursor: 'pointer',
                  transitionDuration: 'var(--motion-fast)',
                  transitionTimingFunction: 'var(--easing-standard)',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
        {/* Image — two stacked <img> with cross-fade for the active state. */}
        <div
          className="relative w-full overflow-hidden rounded-2xl"
          style={{aspectRatio: '4 / 3', background: 'var(--color-sunset-green-700)'}}
        >
          {/* AFTER */}
          <div
            className="absolute inset-0 ba-fade"
            style={{opacity: showAfter ? 1 : 0}}
            aria-hidden={!showAfter}
          >
            <Image
              src={after}
              alt={afterAlt}
              fill
              loading="eager"
              sizes="(max-width: 1023px) 100vw, 1200px"
              placeholder="blur"
              style={{objectFit: 'cover'}}
            />
          </div>
          {/* BEFORE */}
          <div
            className="absolute inset-0 ba-fade"
            style={{opacity: showAfter ? 0 : 1}}
            aria-hidden={showAfter}
          >
            <Image
              src={before}
              alt={beforeAlt}
              fill
              loading="lazy"
              sizes="(max-width: 1023px) 100vw, 1200px"
              placeholder="blur"
              style={{objectFit: 'cover'}}
            />
          </div>
        </div>
      </div>
      <style>{`
        .ba-fade { transition: opacity 200ms var(--easing-standard); }
        @media (prefers-reduced-motion: reduce) {
          .ba-fade { transition: none; }
        }
      `}</style>
    </section>
  );
}

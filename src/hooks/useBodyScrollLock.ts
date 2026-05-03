'use client';

import {useEffect} from 'react';

/**
 * Locks `<html>` scroll while `active` is true. Compensates the scrollbar
 * gutter via `padding-right` so layout doesn't shift when the scrollbar
 * disappears. Used by the mobile drawer (Phase 1.05 §4.5).
 */
export function useBodyScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;

    const html = document.documentElement;
    const body = document.body;

    const scrollbarWidth = window.innerWidth - html.clientWidth;
    const previousOverflow = html.style.overflow;
    const previousPaddingRight = body.style.paddingRight;

    html.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      html.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
    };
  }, [active]);
}

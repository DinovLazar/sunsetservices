'use client';

import * as React from 'react';

/**
 * MotionRoot — pass-through shell.
 *
 * Phase M.02 collapsed this from `<MotionConfig reducedMotion="user">` to a
 * plain children render. After the same phase converted AnimateIn /
 * StaggerContainer / StaggerItem / ConsentBanner / NavbarMobile to non-motion
 * implementations, the always-loaded layout chunk no longer imports
 * `motion/react` at all — keeping `MotionConfig` here was the last importer
 * keeping the runtime on the sitewide critical path for a single line of
 * reduced-motion configuration.
 *
 * The few remaining motion users (WizardShell on /request-quote/, ChatPanel
 * via ChatBubble's dynamic-import, ConsentPreferencesModal via ConsentBanner's
 * dynamic-import) all respect `prefers-reduced-motion` natively in motion v12+
 * even without MotionConfig — the `useReducedMotion` hook and motion
 * components' default behavior already gate on the media query. Removing the
 * explicit config is therefore a no-op for accessibility.
 *
 * Kept as a wrapper component (rather than deleted) so the locale layout's
 * `<MotionRoot>{...}</MotionRoot>` insertion point stays stable; future
 * motion-related plumbing can plug in here without re-threading the layout.
 */
export default function MotionRoot({children}: {children: React.ReactNode}) {
  return <>{children}</>;
}

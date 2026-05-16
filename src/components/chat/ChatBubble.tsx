'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import {MessageCircle} from 'lucide-react';
import {usePathname} from '@/i18n/navigation';

const ChatPanel = dynamic(() => import('./ChatPanel'), {
  ssr: false,
  loading: () => null,
});

type Props = {
  /** i18n strings rendered server-side and passed in. Keeps the bubble shell
      from instantiating a `useTranslations` hook tree (which would pull
      next-intl's runtime into the entry chunk). */
  ariaLabel: string;
  tooltipLabel: string;
  tooltipGatedLabel: string;
  /** Stub default-true; Phase 2.11 wires the real consent banner. */
  initiallyConsented?: boolean;
  locale: 'en' | 'es';
};

/**
 * ChatBubble — collapsed sitewide affordance. Phase 1.19 §4.2, D17–D19, D29.
 *
 * **Bundle ceiling: ≤ 8KB gzipped** for everything imported here. The
 * expanded panel (ChatPanel) is `dynamic`-imported on first click so the
 * initial chunk stays lean. Verified with `@next/bundle-analyzer` per
 * Phase 1.19 §10.1.
 *
 * Cookie-consent gate (D29): bubble is always visible. Pre-consent click
 * opens the consent banner instead of the panel. Part-1 stub defaults to
 * consented so local development works without a banner mount.
 *
 * Route gate (D17 = B): hides on `/request-quote/` (the conversion path).
 * Visible everywhere else, including `/thank-you/`.
 */
export default function ChatBubble({
  ariaLabel,
  tooltipLabel,
  tooltipGatedLabel,
  initiallyConsented = true,
  locale,
}: Props) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const consented = initiallyConsented;

  // Route gate — hide on /request-quote/. `usePathname` from next-intl
  // navigation strips the locale prefix.
  if (pathname === '/request-quote' || pathname === '/request-quote/') {
    return null;
  }

  function handleClick() {
    if (typeof document !== 'undefined') {
      document.dispatchEvent(
        new CustomEvent('sunset:chat-event', {
          detail: {name: 'chat_bubble_clicked', locale},
        }),
      );
    }
    if (!consented) {
      document.dispatchEvent(new CustomEvent('sunset:open-consent'));
      return;
    }
    setOpen((prev) => !prev);
  }

  return (
    <>
      <button
        type="button"
        className={`chat-bubble ${consented ? '' : 'chat-bubble--gated'}`}
        aria-label={ariaLabel}
        aria-expanded={open}
        // Only reference the panel ID while the panel is mounted —
        // ChatPanel is conditionally rendered behind `open`. Setting
        // `aria-controls` to a missing ID is a WCAG SC 4.1.2 violation.
        aria-controls={open ? 'chat-panel' : undefined}
        data-analytics-event="chat_bubble_clicked"
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
      >
        <MessageCircle aria-hidden="true" size={28} strokeWidth={2} />
        <span className="chat-bubble__badge" aria-hidden="true" />
      </button>
      {hovered && !open ? (
        <span
          role="tooltip"
          className="hidden lg:block"
          style={{
            position: 'fixed',
            right: 96,
            bottom: 32,
            zIndex: 'var(--z-chat)' as unknown as number,
            background: 'var(--color-bg-charcoal)',
            color: 'var(--color-text-on-dark)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: 13,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {consented ? tooltipLabel : tooltipGatedLabel}
        </span>
      ) : null}
      {open ? <ChatPanel locale={locale} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

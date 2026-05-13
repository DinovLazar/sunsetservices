'use client';

import * as React from 'react';
import {X} from 'lucide-react';
import {useTranslations, useLocale} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {CHAT_EVENTS, fireChatEvent} from '@/lib/chat/events';

type Props = {
  /** Non-null means visible; the reason itself is informational and isn't rendered. */
  highIntent: {reason: string} | null;
  onDismiss: () => void;
};

/**
 * High-intent escalation banner — Phase 2.09 rewrite of the Phase 1.20 slot.
 *
 * Renders inside the chat panel above the composer when Claude calls
 * `flag_high_intent`. Two CTAs: primary "Book a consult" → /contact#calendly,
 * secondary ghost "Get a quote" → /request-quote. Amber inside the chat panel
 * is allowed (D11 / D24 page-level rules do not apply to the panel chrome).
 */
export default function ChatHighIntentBanner({highIntent, onDismiss}: Props) {
  const t = useTranslations('chat.banner');
  const locale = useLocale() as 'en' | 'es';

  if (!highIntent) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        background: 'var(--color-sunset-amber-50, #FDF7E8)',
        borderLeft: '3px solid var(--color-sunset-amber-700)',
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        position: 'relative',
      }}
    >
      <button
        type="button"
        onClick={onDismiss}
        aria-label={t('closeAriaLabel')}
        style={{
          position: 'absolute',
          top: 6,
          right: 6,
          background: 'transparent',
          border: 'none',
          padding: 4,
          cursor: 'pointer',
          color: 'var(--color-text-primary)',
        }}
      >
        <X size={14} aria-hidden="true" />
      </button>

      <p
        className="m-0"
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          paddingRight: 24,
          lineHeight: 1.4,
        }}
      >
        {t('intro')}
      </p>

      <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
        <Link
          href="/contact#calendly"
          className="btn btn-primary btn-sm"
          data-analytics-event="chat_banner_book_clicked"
          onClick={() =>
            fireChatEvent(CHAT_EVENTS.BANNER_BOOK_CLICKED, {locale})
          }
          style={{fontSize: 12, padding: '6px 12px'}}
        >
          {t('primaryCta')}
        </Link>
        <Link
          href="/request-quote"
          className="btn btn-ghost btn-sm"
          data-analytics-event="chat_banner_quote_clicked"
          onClick={() =>
            fireChatEvent(CHAT_EVENTS.BANNER_QUOTE_CLICKED, {locale})
          }
          style={{
            fontSize: 12,
            padding: '6px 12px',
            background: 'transparent',
            color: 'var(--color-sunset-amber-700)',
            border: '1px solid var(--color-sunset-amber-700)',
          }}
        >
          {t('secondaryCta')}
        </Link>
      </div>
    </div>
  );
}

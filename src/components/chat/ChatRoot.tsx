import {getLocale, getTranslations} from 'next-intl/server';
import {isAiChatEnabled} from '@/lib/chat/flags';
import ChatBubble from './ChatBubble';

/**
 * ChatRoot — sitewide mount point for the chat widget. Phase 1.19 §4.1.
 *
 * Server component. Reads the kill-switch flag and the i18n strings the
 * bubble needs server-side (so the bubble's client chunk doesn't pull
 * next-intl's runtime into the ≤8KB shell). The pathname-based gate (D17)
 * lives inside ChatBubble using `usePathname()` because reliable
 * server-side pathname access in Next 16 needs middleware plumbing.
 *
 * Mounted from `[locale]/layout.tsx`. Replaces the `<div id="chat-root" />`
 * placeholder Phase 1.05 left.
 */
export default async function ChatRoot() {
  if (!isAiChatEnabled()) {
    return null;
  }
  const locale = (await getLocale()) as 'en' | 'es';
  const t = await getTranslations({locale, namespace: 'chat.bubble'});

  return (
    <ChatBubble
      ariaLabel={t('aria')}
      tooltipLabel={t('tooltip')}
      tooltipGatedLabel={t('tooltipGated')}
      locale={locale}
    />
  );
}

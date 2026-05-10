'use client';

import * as React from 'react';
import {Minus, X, MoreVertical, RotateCcw} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {useReducedMotion} from 'motion/react';
import {Link} from '@/i18n/navigation';
import {
  loadHistory,
  saveHistory,
  clearHistory,
  type ChatMessage,
} from '@/lib/chat/storage';
import {CHAT_EVENTS, fireChatEvent} from '@/lib/chat/events';
import ChatMessageLog from './ChatMessageLog';
import ChatComposer from './ChatComposer';
import ChatSuggestedPrompts from './ChatSuggestedPrompts';
import ChatLeadForm from './ChatLeadForm';
import ChatHighIntentBanner from './ChatHighIntentBanner';
import ChatErrorState from './ChatErrorState';
import ChatMessageBubble from './ChatMessageBubble';

type Props = {
  locale: 'en' | 'es';
  onClose: () => void;
};

const STREAM_TOKEN_MS = 30;
const TYPING_DELAY_MS = 400;
const TYPING_DURATION_MS = 800;

/**
 * ChatPanel — desktop floating panel / mobile bottom-sheet `<dialog>`.
 * Phase 1.19 §4.3 / §4.4. Dynamic-imported by ChatBubble; everything heavy
 * lives here so the collapsed shell stays under 8KB gzipped.
 *
 * State machine: welcome (empty log + 3 chips) → user message → typing →
 * canned reply (token-stream stub). Lead form slides into the log on
 * "Get a quote in 30 sec" click. Reset clears sessionStorage + reloads
 * welcome state. Persistence is per-locale `sunset_chat_history_<locale>`.
 *
 * Mobile: full focus-trap via `<dialog>` + `showModal()`. Desktop:
 * `aria-modal="false"` so the page behind stays usable.
 */
export default function ChatPanel({locale, onClose}: Props) {
  const t = useTranslations('chat');
  const tRoot = useTranslations();
  const reducedMotion = useReducedMotion();

  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const [messages, setMessages] = React.useState<ChatMessage[]>(() => loadHistory(locale));
  const [streaming, setStreaming] = React.useState(false);
  const [showLeadForm, setShowLeadForm] = React.useState(false);
  const [bannerVisible, setBannerVisible] = React.useState(false);
  const [errorKind, setErrorKind] = React.useState<'network' | 'rate' | 'api' | null>(null);
  const [menuOpen, setMenuOpen] = React.useState(false);

  // Mount: open dialog + fire panel-opened event
  React.useEffect(() => {
    fireChatEvent(CHAT_EVENTS.PANEL_OPENED, {locale});
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (window.matchMedia('(max-width: 1023px)').matches) {
      // Mobile: modal dialog with focus trap.
      try {
        dlg.showModal();
      } catch {
        dlg.setAttribute('open', '');
      }
    } else {
      dlg.setAttribute('open', '');
    }
    return () => {
      try {
        dlg.close();
      } catch {
        dlg.removeAttribute('open');
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist whenever messages change.
  React.useEffect(() => {
    if (messages.length > 0) saveHistory(locale, messages);
  }, [messages, locale]);

  // Esc key closes panel + returns focus to bubble (browser default for
  // <dialog>, but we also dispatch onClose so React state syncs).
  React.useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    const handler = () => onClose();
    dlg.addEventListener('close', handler);
    return () => dlg.removeEventListener('close', handler);
  }, [onClose]);

  function appendMessage(m: ChatMessage) {
    setMessages((prev) => [...prev, m]);
  }

  function streamCannedReply(promptN: 1 | 2 | 3 | null, freeText: string) {
    setStreaming(true);
    setErrorKind(null);
    const reply = (() => {
      if (promptN === 1) return tRoot('chat.canned.prompt1Reply');
      if (promptN === 2) return tRoot('chat.canned.prompt2Reply');
      if (promptN === 3) return tRoot('chat.canned.prompt3Reply');
      return tRoot('chat.canned.generic');
    })();

    window.setTimeout(() => {
      // Begin streaming token-by-token.
      const tokens = reply.split(/(\s+)/);
      let acc = '';
      let i = 0;
      // First, append an empty assistant bubble we'll grow.
      setMessages((prev) => [...prev, {role: 'assistant', content: '', ts: Date.now()}]);
      const tick = () => {
        if (i >= tokens.length) {
          setStreaming(false);
          return;
        }
        acc += tokens[i++];
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = {...next[next.length - 1], content: acc};
          return next;
        });
        if (reducedMotion) {
          // Reduced motion: drop the entire reply at once.
          acc = reply;
          i = tokens.length;
          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = {...next[next.length - 1], content: acc};
            return next;
          });
          setStreaming(false);
          return;
        }
        window.setTimeout(tick, STREAM_TOKEN_MS);
      };
      tick();
    }, TYPING_DELAY_MS + TYPING_DURATION_MS);

    // Use freeText so it's referenced (no-op log; eliminated in production).
    if (process.env.NODE_ENV !== 'production' && freeText) {
      console.debug('[chat] free-text in:', freeText);
    }
  }

  function handleSendUser(text: string) {
    if (streaming) return;
    appendMessage({role: 'user', content: text, ts: Date.now()});
    fireChatEvent(CHAT_EVENTS.MESSAGE_SENT, {locale});
    streamCannedReply(null, text);
  }

  function handlePromptPick(text: string, n: 1 | 2 | 3) {
    if (streaming) return;
    appendMessage({role: 'user', content: text, ts: Date.now()});
    streamCannedReply(n, text);
  }

  function handleLeadCta() {
    if (streaming) return;
    setShowLeadForm(true);
    fireChatEvent(CHAT_EVENTS.LEAD_CTA_CLICKED, {locale});
  }

  function handleLeadSubmit(lead: {firstName: string; email: string; phone: string}) {
    setShowLeadForm(false);
    fireChatEvent(CHAT_EVENTS.LEAD_FORM_SUBMITTED, {locale});
    // Part 1 stub: log and append a confirmation assistant bubble. Phase 2.09
    // wires the real lead-capture POST endpoint.
    console.log('[chat lead]', lead);
    appendMessage({
      role: 'assistant',
      content: tRoot('chat.lead.confirmBody'),
      ts: Date.now(),
    });
  }

  function handleReset() {
    clearHistory(locale);
    setMessages([]);
    setShowLeadForm(false);
    setMenuOpen(false);
    setErrorKind(null);
    fireChatEvent(CHAT_EVENTS.RESET_CLICKED, {locale});
  }

  const welcome = (
    <>
      <ChatMessageBubble role="assistant" content={t('welcome')} />
      <ChatSuggestedPrompts onPick={handlePromptPick} />
    </>
  );

  // Lead-form trail card AND the post-submit confirmation CTA.
  const trailEls: React.ReactNode[] = [];
  if (showLeadForm) {
    trailEls.push(
      <ChatLeadForm
        key="lead-form"
        onSubmit={handleLeadSubmit}
        onCancel={() => setShowLeadForm(false)}
      />,
    );
  }
  if (errorKind) {
    trailEls.push(
      <ChatErrorState
        key="error"
        kind={errorKind}
        onRetry={errorKind === 'network' ? () => setErrorKind(null) : undefined}
      />,
    );
  }
  // Post-lead-submit: append CTA-link below last assistant bubble (only when
  // last msg is the lead-confirm content).
  const last = messages[messages.length - 1];
  if (
    last &&
    last.role === 'assistant' &&
    last.content === tRoot('chat.lead.confirmBody')
  ) {
    trailEls.push(
      <Link
        key="lead-cta"
        href="/request-quote/"
        style={{
          marginLeft: 36,
          fontSize: 13,
          color: 'var(--color-sunset-green-700)',
          fontWeight: 600,
          textDecoration: 'underline',
        }}
        onClick={onClose}
      >
        {tRoot('chat.lead.confirmCta')}
      </Link>,
    );
  }

  return (
    <dialog
      id="chat-panel"
      ref={dialogRef}
      className="chat-panel"
      aria-modal="false"
      aria-labelledby="chat-panel-header"
      style={{
        // Reset default <dialog> centering so our CSS positions take over.
        position: 'fixed',
      }}
    >
      <div className="chat-mobile-handle" />
      <header
        id="chat-panel-header"
        className="chat-panel-header"
      >
        <span
          aria-hidden="true"
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'var(--color-sunset-green-700)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: 'var(--color-sunset-amber-500)',
            }}
          />
        </span>
        <div style={{flex: 1, minWidth: 0}}>
          <p
            className="m-0 font-heading"
            style={{fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)'}}
          >
            {t('header.title')}
          </p>
          <p
            className="m-0"
            style={{fontSize: 11, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 6}}
          >
            <span
              aria-hidden="true"
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--color-sunset-green-500)',
              }}
            />
            {t('header.online')}
          </p>
        </div>
        <div style={{position: 'relative'}}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={t('header.menu')}
            aria-expanded={menuOpen}
            className="btn btn-ghost btn-icon"
            style={{width: 36, height: 36}}
          >
            <MoreVertical size={20} aria-hidden="true" />
          </button>
          {menuOpen ? (
            <div
              role="menu"
              style={{
                position: 'absolute',
                top: 40,
                right: 0,
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                boxShadow: 'var(--shadow-card)',
                minWidth: 180,
                zIndex: 1,
              }}
            >
              <button
                type="button"
                role="menuitem"
                onClick={handleReset}
                data-analytics-event="chat_reset_clicked"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '10px 14px',
                  background: 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  fontSize: 13,
                  color: 'var(--color-text-primary)',
                  cursor: 'pointer',
                }}
              >
                <RotateCcw size={14} aria-hidden="true" />
                {t('kebab.reset')}
              </button>
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('header.minimize')}
          className="btn btn-ghost btn-icon hidden lg:inline-flex"
          style={{width: 36, height: 36}}
        >
          <Minus size={20} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onClose}
          data-analytics-event="chat_panel_closed"
          aria-label={t('header.close')}
          className="btn btn-ghost btn-icon"
          style={{width: 36, height: 36}}
        >
          <X size={20} aria-hidden="true" />
        </button>
      </header>

      <ChatHighIntentBanner
        visible={bannerVisible}
        onDismiss={() => setBannerVisible(false)}
      />

      <ChatMessageLog
        messages={messages}
        isStreaming={streaming}
        afterTrail={trailEls.length > 0 ? <>{trailEls}</> : null}
        welcome={welcome}
      />

      <ChatComposer
        onSend={handleSendUser}
        onLeadCta={handleLeadCta}
        disabled={streaming}
      />
    </dialog>
  );
}

'use client';

import * as React from 'react';
import {Minus, X, MoreVertical, RotateCcw} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {
  loadHistory,
  saveHistory,
  clearHistory,
  getOrCreateChatSessionId,
  type ChatMessage,
} from '@/lib/chat/storage';
import {CHAT_EVENTS, fireChatEvent} from '@/lib/chat/events';
import {streamFromBackend, type ChatStreamErrorKind} from '@/lib/chat/streamClient';
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

type ErrorKind = 'network' | 'rate_burst' | 'rate_daily' | 'disabled' | 'generic' | null;
type LeadFormStatus = 'idle' | 'submitting' | 'error';

/**
 * ChatPanel — desktop floating panel / mobile bottom-sheet `<dialog>`.
 *
 * Phase 2.09 swap: the canned-streaming stub is replaced with a real call to
 * `/api/chat` via the SSE consumer in `src/lib/chat/streamClient.ts`. The
 * high-intent banner is now driven by `flag_high_intent` tool-use events.
 * Lead-form submit posts to `/api/chat/lead`.
 *
 * State machine: welcome (empty log + 3 chips) → user message → live SSE token
 * stream → assistant bubble grows in place. High-intent banner appears the
 * moment Claude calls the tool. Reset clears sessionStorage + reloads welcome.
 *
 * Mobile: full focus-trap via `<dialog>` + `showModal()`. Desktop:
 * `aria-modal="false"` so the page behind stays usable.
 */
export default function ChatPanel({locale, onClose}: Props) {
  const t = useTranslations('chat');
  const tRoot = useTranslations();

  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const [messages, setMessages] = React.useState<ChatMessage[]>(() => loadHistory(locale));
  const [streaming, setStreaming] = React.useState(false);
  const [showLeadForm, setShowLeadForm] = React.useState(false);
  const [highIntent, setHighIntent] = React.useState<{reason: string} | null>(null);
  const [errorKind, setErrorKind] = React.useState<ErrorKind>(null);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [leadCaptured, setLeadCaptured] = React.useState(false);
  const [leadFormStatus, setLeadFormStatus] = React.useState<LeadFormStatus>('idle');
  const sessionIdRef = React.useRef<string>('');
  // Latest high_intent reason carries to the lead form even after the banner
  // is dismissed — Erick reads it on the email + Sanity record.
  const lastHighIntentReasonRef = React.useRef<string | null>(null);

  // Mount: open dialog + fire panel-opened event + materialize session ID
  React.useEffect(() => {
    sessionIdRef.current = getOrCreateChatSessionId();
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

  function mapErrorKind(kind: ChatStreamErrorKind): ErrorKind {
    if (kind === 'rate_limited_burst') return 'rate_burst';
    if (kind === 'rate_limited_daily') return 'rate_daily';
    if (kind === 'disabled') return 'disabled';
    if (kind === 'http') return 'network';
    return 'generic';
  }

  async function runStreamingTurn(historyForApi: ChatMessage[]) {
    // Clear the banner at the START of each new outgoing turn — Claude will
    // re-flag if intent persists, otherwise it stays dismissed for this turn.
    setHighIntent(null);
    setErrorKind(null);
    setStreaming(true);

    // Seed an empty assistant bubble we'll grow.
    setMessages((prev) => [...prev, {role: 'assistant', content: '', ts: Date.now()}]);
    let accumulated = '';

    await streamFromBackend({
      messages: historyForApi.map((m) => ({role: m.role, content: m.content})),
      locale,
      sessionId: sessionIdRef.current,
      onToken: (chunk) => {
        accumulated += chunk;
        const snapshot = accumulated;
        setMessages((prev) => {
          if (prev.length === 0) return prev;
          const next = [...prev];
          next[next.length - 1] = {...next[next.length - 1], content: snapshot};
          return next;
        });
      },
      onHighIntent: (reason) => {
        lastHighIntentReasonRef.current = reason || null;
        setHighIntent({reason: reason ?? ''});
        fireChatEvent(CHAT_EVENTS.HIGH_INTENT_FIRED, {locale, reason});
      },
      onDone: () => {
        setStreaming(false);
      },
      onError: (kind) => {
        const mapped = mapErrorKind(kind);
        setErrorKind(mapped);
        setStreaming(false);
        // Drop the empty assistant bubble we seeded — the error renders inline instead.
        setMessages((prev) => {
          if (prev.length === 0) return prev;
          const last = prev[prev.length - 1];
          if (last.role === 'assistant' && last.content === '') return prev.slice(0, -1);
          return prev;
        });
      },
    });
  }

  function handleSendUser(text: string) {
    if (streaming) return;
    const updated: ChatMessage[] = [...messages, {role: 'user', content: text, ts: Date.now()}];
    setMessages(updated);
    fireChatEvent(CHAT_EVENTS.MESSAGE_SENT, {locale});
    runStreamingTurn(updated);
  }

  function handlePromptPick(text: string, n: 1 | 2 | 3) {
    if (streaming) return;
    const updated: ChatMessage[] = [...messages, {role: 'user', content: text, ts: Date.now()}];
    setMessages(updated);
    fireChatEvent(CHAT_EVENTS.PROMPT_CLICKED(n), {locale});
    runStreamingTurn(updated);
  }

  function handleLeadCta() {
    if (streaming) return;
    setShowLeadForm(true);
    fireChatEvent(CHAT_EVENTS.LEAD_CTA_CLICKED, {locale});
  }

  async function handleLeadSubmit(lead: {firstName: string; email: string; phone: string}) {
    fireChatEvent('lead_capture_submit_attempted', {locale});
    setLeadFormStatus('submitting');

    const transcriptExcerpt = messages.slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
      ts: new Date(m.ts).toISOString(),
    }));

    const body = {
      name: lead.firstName,
      email: lead.email,
      // Phone isn't part of the chatLead Sanity schema, so we stash it inside
      // the trigger reason if present, otherwise drop it.
      locale,
      sessionId: sessionIdRef.current,
      transcriptExcerpt,
      triggerReason: lastHighIntentReasonRef.current ?? undefined,
      pageContext: typeof window !== 'undefined' ? window.location.href : undefined,
      honeypot: '', // pristine — visible field is in ChatLeadForm
    };

    try {
      const res = await fetch('/api/chat/lead', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        keepalive: true,
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        setLeadFormStatus('error');
        fireChatEvent('lead_capture_submit_failed', {locale, status: res.status});
        return;
      }
      const data = await res.json().catch(() => ({}) as Record<string, unknown>);
      const status = typeof data.status === 'string' ? data.status : 'ok';
      if (status === 'ok' || status === 'simulated') {
        setLeadFormStatus('idle');
        setShowLeadForm(false);
        setLeadCaptured(true);
        fireChatEvent('lead_capture_submit_succeeded', {locale});
        setMessages((prev) => [
          ...prev,
          {role: 'assistant', content: tRoot('chat.leadCapture.confirmed'), ts: Date.now()},
        ]);
      } else {
        setLeadFormStatus('error');
        fireChatEvent('lead_capture_submit_failed', {locale, status});
      }
    } catch (err) {
      setLeadFormStatus('error');
      fireChatEvent('lead_capture_submit_failed', {locale, message: err instanceof Error ? err.message : 'network'});
    }
  }

  function handleReset() {
    clearHistory(locale);
    setMessages([]);
    setShowLeadForm(false);
    setMenuOpen(false);
    setErrorKind(null);
    setHighIntent(null);
    setLeadCaptured(false);
    setLeadFormStatus('idle');
    lastHighIntentReasonRef.current = null;
    sessionIdRef.current = getOrCreateChatSessionId();
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
        onCancel={() => {
          setShowLeadForm(false);
          setLeadFormStatus('idle');
        }}
      />,
    );
    if (leadFormStatus === 'error') {
      trailEls.push(
        <p
          key="lead-form-error"
          role="alert"
          style={{
            marginLeft: 36,
            marginTop: 4,
            fontSize: 12,
            color: 'var(--color-text-error, #B91C1C)',
          }}
        >
          {tRoot('chat.leadCapture.error')}
        </p>,
      );
    }
  }
  if (errorKind) {
    trailEls.push(<ChatErrorState key="error" kind={errorKind} />);
  }
  // Post-lead-submit: append CTA-link below confirmation bubble.
  const last = messages[messages.length - 1];
  if (
    leadCaptured &&
    last &&
    last.role === 'assistant' &&
    last.content === tRoot('chat.leadCapture.confirmed')
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

      <ChatMessageLog
        messages={messages}
        isStreaming={streaming}
        afterTrail={trailEls.length > 0 ? <>{trailEls}</> : null}
        welcome={welcome}
      />

      <ChatHighIntentBanner
        highIntent={highIntent}
        onDismiss={() => setHighIntent(null)}
      />

      <ChatComposer
        onSend={handleSendUser}
        onLeadCta={handleLeadCta}
        disabled={streaming}
      />
    </dialog>
  );
}

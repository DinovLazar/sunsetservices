'use client';

import * as React from 'react';
import {Mail, CheckCircle2, XCircle} from 'lucide-react';
import {Link} from '@/i18n/navigation';

/**
 * Phase B.07 — client island for the unsubscribe page.
 *
 * Owns the local state machine that drives every transition past the
 * server-rendered initial state. POSTs to `/api/newsletter/unsubscribe`
 * with `{token, action}`; renders an icon + heading + body + action button
 * per state. Fires `sunset:newsletter-event` CustomEvents on `document`
 * (Phase 2.10 convention — NOT `window`) for the AnalyticsBridge to relay
 * to GTM.
 *
 * States:
 *   - confirm              — initial when subscriber is active.
 *   - confirming           — POST in flight from confirm.
 *   - success              — confirm/POST landed (incl. already-unsubscribed).
 *   - resubscribing        — POST in flight from success or alreadyUnsubscribed.
 *   - welcomeBack          — resubscribe landed (incl. already-subscribed).
 *   - alreadyUnsubscribed  — initial when subscriber is already opted out.
 *   - invalid              — terminal, server-rendered when token doesn't match.
 *   - error                — POST failed; retry returns to the prior action.
 *
 * No PII (no email, no token) in event payloads — only `locale`.
 */

type InitialState = 'confirm' | 'alreadyUnsubscribed' | 'invalid';
type Status =
  | 'confirm'
  | 'confirming'
  | 'success'
  | 'resubscribing'
  | 'welcomeBack'
  | 'alreadyUnsubscribed'
  | 'invalid'
  | 'error';

export type UnsubscribeLabels = {
  confirmHeading: string;
  confirmBody: string;
  confirmCta: string;
  confirming: string;
  successHeading: string;
  successBody: string;
  resubscribeCta: string;
  resubscribing: string;
  welcomeBackHeading: string;
  welcomeBackBody: string;
  alreadyUnsubscribedHeading: string;
  alreadyUnsubscribedBody: string;
  invalidHeading: string;
  invalidBody: string;
  invalidHomeLink: string;
  errorMessage: string;
  errorRetryCta: string;
  homeLink: string;
};

function fireNewsletterEvent(name: string, locale: 'en' | 'es'): void {
  if (typeof document === 'undefined') return;
  document.dispatchEvent(
    new CustomEvent('sunset:newsletter-event', {detail: {name, locale}}),
  );
}

export default function UnsubscribeActions({
  token,
  initialState,
  locale,
  labels,
}: {
  token: string;
  initialState: InitialState;
  locale: 'en' | 'es';
  labels: UnsubscribeLabels;
}) {
  const [status, setStatus] = React.useState<Status>(initialState);
  // Track which action the last POST attempted, so the error-state Retry
  // button can re-fire the right one.
  const [lastAction, setLastAction] = React.useState<'unsubscribe' | 'resubscribe' | null>(
    null,
  );

  async function postUnsubscribe(): Promise<void> {
    setLastAction('unsubscribe');
    setStatus('confirming');
    try {
      const res = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({token, action: 'unsubscribe'}),
        keepalive: true,
      });
      const body = (await res.json().catch(() => ({}))) as {status?: string};
      if (res.ok && (body.status === 'ok' || body.status === 'already-unsubscribed')) {
        setStatus('success');
        fireNewsletterEvent('newsletter_unsubscribed', locale);
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error('[unsubscribe] POST failed', err);
      setStatus('error');
    }
  }

  async function postResubscribe(): Promise<void> {
    setLastAction('resubscribe');
    setStatus('resubscribing');
    try {
      const res = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({token, action: 'resubscribe'}),
        keepalive: true,
      });
      const body = (await res.json().catch(() => ({}))) as {status?: string};
      if (res.ok && (body.status === 'ok' || body.status === 'already-subscribed')) {
        setStatus('welcomeBack');
        fireNewsletterEvent('newsletter_resubscribed_via_link', locale);
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error('[unsubscribe] POST failed', err);
      setStatus('error');
    }
  }

  function retry(): void {
    if (lastAction === 'resubscribe') {
      void postResubscribe();
    } else {
      void postUnsubscribe();
    }
  }

  // ---- per-state render ----

  if (status === 'invalid') {
    return (
      <>
        <HeroIcon Icon={XCircle} variant="error" />
        <Heading>{labels.invalidHeading}</Heading>
        <Body>{labels.invalidBody}</Body>
        <div className="mt-8">
          <Link href="/" className="link link-inline" style={ghostLinkStyle}>
            {labels.invalidHomeLink}
          </Link>
        </div>
      </>
    );
  }

  if (status === 'error') {
    return (
      <>
        <HeroIcon Icon={XCircle} variant="error" />
        <Heading>{labels.errorMessage}</Heading>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <button
            type="button"
            onClick={retry}
            className="btn btn-primary btn-md"
            style={ctaButtonStyle}
          >
            <span className="btn__label">{labels.errorRetryCta}</span>
          </button>
        </div>
        <div className="mt-6">
          <Link href="/" className="link link-inline" style={ghostLinkStyle}>
            {labels.homeLink}
          </Link>
        </div>
      </>
    );
  }

  if (status === 'success') {
    return (
      <>
        <HeroIcon Icon={CheckCircle2} variant="success" />
        <Heading>{labels.successHeading}</Heading>
        <Body>{labels.successBody}</Body>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <button
            type="button"
            onClick={postResubscribe}
            className="btn btn-secondary btn-md"
            style={ctaButtonStyle}
          >
            <span className="btn__label">{labels.resubscribeCta}</span>
          </button>
        </div>
        <div className="mt-6">
          <Link href="/" className="link link-inline" style={ghostLinkStyle}>
            {labels.homeLink}
          </Link>
        </div>
      </>
    );
  }

  if (status === 'welcomeBack') {
    return (
      <>
        <HeroIcon Icon={CheckCircle2} variant="success" />
        <Heading>{labels.welcomeBackHeading}</Heading>
        <Body>{labels.welcomeBackBody}</Body>
        <div className="mt-8">
          <Link href="/" className="link link-inline" style={ghostLinkStyle}>
            {labels.homeLink}
          </Link>
        </div>
      </>
    );
  }

  if (status === 'alreadyUnsubscribed') {
    const loading = false; // gate kept for symmetry; actions take you out of this state
    return (
      <>
        <HeroIcon Icon={CheckCircle2} variant="success" />
        <Heading>{labels.alreadyUnsubscribedHeading}</Heading>
        <Body>{labels.alreadyUnsubscribedBody}</Body>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <button
            type="button"
            onClick={postResubscribe}
            disabled={loading}
            aria-busy={loading}
            className="btn btn-secondary btn-md"
            style={ctaButtonStyle}
          >
            <span className="btn__label">{labels.resubscribeCta}</span>
          </button>
        </div>
        <div className="mt-6">
          <Link href="/" className="link link-inline" style={ghostLinkStyle}>
            {labels.homeLink}
          </Link>
        </div>
      </>
    );
  }

  // confirm / confirming / resubscribing — all variants of "subscriber is
  // active, primary action available, may be loading".
  const isConfirming = status === 'confirming';
  const isResubscribing = status === 'resubscribing';
  const loading = isConfirming || isResubscribing;

  return (
    <>
      <HeroIcon Icon={Mail} variant="default" />
      <Heading>{labels.confirmHeading}</Heading>
      <Body>{labels.confirmBody}</Body>
      <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
        <button
          type="button"
          onClick={postUnsubscribe}
          disabled={loading}
          aria-busy={loading}
          data-loading={loading ? 'true' : undefined}
          className="btn btn-primary btn-md"
          style={ctaButtonStyle}
        >
          <span className="btn__label">
            {isConfirming
              ? labels.confirming
              : isResubscribing
                ? labels.resubscribing
                : labels.confirmCta}
          </span>
        </button>
      </div>
      <div className="mt-6">
        <Link href="/" className="link link-inline" style={ghostLinkStyle}>
          {labels.homeLink}
        </Link>
      </div>
    </>
  );
}

// ---------- presentational subcomponents ----------

function HeroIcon({
  Icon,
  variant,
}: {
  Icon: React.ComponentType<{size?: number; strokeWidth?: number; color?: string}>;
  variant: 'default' | 'success' | 'error';
}) {
  const color =
    variant === 'error'
      ? 'var(--color-feedback-error, #B3261E)'
      : 'var(--color-sunset-green-600)';
  const borderColor =
    variant === 'error'
      ? 'var(--color-feedback-error, #B3261E)'
      : 'var(--color-sunset-green-500)';
  return (
    <div
      aria-hidden="true"
      className="mx-auto mb-6"
      style={{
        width: 72,
        height: 72,
        borderRadius: '50%',
        background: 'var(--color-bg)',
        border: `2px solid ${borderColor}`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon size={40} strokeWidth={2} color={color} />
    </div>
  );
}

function Heading({children}: {children: React.ReactNode}) {
  return (
    <h1
      className="m-0 font-heading"
      style={{
        fontSize: 'var(--text-h2)',
        fontWeight: 600,
        lineHeight: 'var(--leading-tight)',
        letterSpacing: 'var(--tracking-snug)',
        textWrap: 'balance',
      }}
    >
      {children}
    </h1>
  );
}

function Body({children}: {children: React.ReactNode}) {
  return (
    <p
      className="m-0 mt-4"
      style={{
        fontSize: 'var(--text-body-lg)',
        color: 'var(--color-text-secondary)',
        lineHeight: 'var(--leading-relaxed)',
        maxWidth: '48ch',
        marginLeft: 'auto',
        marginRight: 'auto',
      }}
    >
      {children}
    </p>
  );
}

const ctaButtonStyle: React.CSSProperties = {
  minHeight: 48,
  minWidth: 200,
};

const ghostLinkStyle: React.CSSProperties = {
  fontSize: 'var(--text-body)',
  color: 'var(--color-sunset-green-700)',
  fontWeight: 600,
};

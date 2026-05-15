'use client';

import * as React from 'react';
import {Switch} from '@base-ui/react/switch';
import {motion} from 'motion/react';
import {useTranslations} from 'next-intl';
import Dialog from '@/components/ui/Dialog';
import {useConsent} from '@/hooks/useConsent';
import {
  DEFAULT_PREFERENCES,
  type ConsentSignals,
} from '@/types/consent';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Fired after a successful Save (parent typically uses this to close
   *  any companion surface — e.g. the banner closes its own modal state). */
  onSaved?: () => void;
};

/**
 * ConsentPreferencesModal — Phase B.03.
 *
 * Granular Consent Mode v2 toggle UI. Four rows:
 *   1. Strictly necessary — locked ON, dimmed, "Always on" label.
 *   2. Analytics            → analytics_storage
 *   3. Marketing            → ad_storage
 *   4. Personalization      → ad_user_data + ad_personalization (DM-1)
 *
 * Default state when opened fresh (no prior choice): DEFAULT_PREFERENCES
 * (DM-2 ratification — Necessary ON locked, Analytics ON, Marketing OFF,
 * Personalization OFF).
 *
 * If a prior `decided` state exists in `useConsent`, the modal reflects
 * those saved values so re-opening to adjust shows the right toggle state.
 *
 * Dismissal behavior:
 *   - Click-outside (backdrop) → does nothing (`outside-press` reason swallowed).
 *   - ESC → closes the modal but the banner re-appears and re-traps focus.
 *   - Save preferences → persists, fires consent_update, closes modal +
 *     banner (banner closes itself by virtue of `state.status === 'decided'`).
 *   - Cancel → closes modal; banner stays visible.
 *
 * The form body (toggle state + Save/Cancel) lives in <PreferencesForm>,
 * a child component that only mounts while the modal is open. That makes
 * the draft state re-seed naturally from the latest saved consent every
 * time the modal opens — no setState-in-effect dance.
 *
 * Animation: backdrop fades, popup scales 0.95→1.0 with opacity fade.
 * `MotionConfig reducedMotion="user"` in the root automatically swaps to
 * opacity-only when prefers-reduced-motion.
 */
export default function ConsentPreferencesModal({
  open,
  onOpenChange,
  onSaved,
}: Props) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen, eventDetails) => {
        if (!nextOpen) {
          const reason = (
            eventDetails as {reason?: string} | undefined
          )?.reason;
          // Block backdrop dismissal. Allow ESC + explicit close button.
          if (reason === 'outside-press') return;
        }
        onOpenChange(nextOpen);
      }}
      modal
    >
      <Dialog.Portal>
        <Dialog.Backdrop
          render={
            <motion.div
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              transition={{duration: 0.2}}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'var(--color-overlay-50)',
                zIndex: 'var(--z-overlay)' as unknown as number,
              }}
            />
          }
        />
        <Dialog.Popup
          className="dialog"
          render={
            <motion.div
              initial={{opacity: 0, scale: 0.95}}
              animate={{opacity: 1, scale: 1}}
              transition={{duration: 0.2}}
            />
          }
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            maxWidth: 'min(32rem, calc(100vw - 32px))',
            maxHeight: 'min(85vh, 720px)',
            overflow: 'auto',
            background: 'var(--color-bg)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-hover)',
            padding: 0,
            zIndex: 'calc(var(--z-overlay) + 1)' as unknown as number,
          }}
        >
          {open ? (
            <PreferencesForm
              onSave={() => {
                onSaved?.();
                onOpenChange(false);
              }}
              onCancel={() => onOpenChange(false)}
            />
          ) : null}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/**
 * Inner form body. Only renders while the modal is open, so the draft
 * state re-seeds from the latest saved consent every open cycle.
 */
function PreferencesForm({
  onSave,
  onCancel,
}: {
  onSave: () => void;
  onCancel: () => void;
}) {
  const t = useTranslations('chrome.consent');
  const {state, save} = useConsent();

  const initial: ConsentSignals =
    state.status === 'decided' ? state.signals : DEFAULT_PREFERENCES;
  const [draft, setDraft] = React.useState<ConsentSignals>(initial);

  function handleSave() {
    save({
      analytics: draft.analytics,
      marketing: draft.marketing,
      personalization: draft.personalization,
    });
    onSave();
  }

  return (
    <>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--spacing-3)',
          padding: 'var(--spacing-5) var(--spacing-6) var(--spacing-3)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <Dialog.Title
          className="m-0"
          render={
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: 'var(--text-h4)',
                lineHeight: 'var(--leading-snug)',
                color: 'var(--color-text-primary)',
                margin: 0,
              }}
            />
          }
        >
          {t('modal.title')}
        </Dialog.Title>
        <Dialog.Close
          className="btn btn-ghost"
          aria-label={t('modal.closeAria')}
          style={{
            height: 40,
            width: 40,
            minWidth: 40,
            padding: 0,
            borderRadius: 9999,
          }}
        >
          <CloseIcon />
        </Dialog.Close>
      </header>

      <Dialog.Description
        className="m-0"
        render={
          <p
            style={{
              fontSize: 'var(--text-body-sm)',
              lineHeight: 'var(--leading-relaxed)',
              color: 'var(--color-text-secondary)',
              margin: 0,
              padding:
                'var(--spacing-4) var(--spacing-6) var(--spacing-2)',
            }}
          />
        }
      >
        {t('modal.intro')}
      </Dialog.Description>

      <div
        role="group"
        aria-label={t('modal.rowsAriaLabel')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: 'var(--spacing-2) var(--spacing-6) var(--spacing-4)',
        }}
      >
        <ToggleRow
          label={t('modal.necessary.label')}
          description={t('modal.necessary.description')}
          alwaysOnLabel={t('modal.necessary.alwaysOn')}
          checked
          disabled
        />
        <ToggleRow
          label={t('modal.analytics.label')}
          description={t('modal.analytics.description')}
          checked={draft.analytics}
          onChange={(v) => setDraft((d) => ({...d, analytics: v}))}
        />
        <ToggleRow
          label={t('modal.marketing.label')}
          description={t('modal.marketing.description')}
          checked={draft.marketing}
          onChange={(v) => setDraft((d) => ({...d, marketing: v}))}
        />
        <ToggleRow
          label={t('modal.personalization.label')}
          description={t('modal.personalization.description')}
          checked={draft.personalization}
          onChange={(v) => setDraft((d) => ({...d, personalization: v}))}
        />
      </div>

      <footer
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
          gap: 'var(--spacing-2)',
          padding: 'var(--spacing-3) var(--spacing-6) var(--spacing-6)',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-ghost btn-md"
        >
          {t('modal.cancelCta')}
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="btn btn-primary btn-md"
        >
          {t('modal.saveCta')}
        </button>
      </footer>
    </>
  );
}

function ToggleRow(props: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (next: boolean) => void;
  alwaysOnLabel?: string;
}) {
  const rowId = React.useId();
  const descId = `${rowId}-desc`;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--spacing-4)',
        padding: 'var(--spacing-4) 0',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div style={{flex: 1, minWidth: 0}}>
        <p
          id={rowId}
          style={{
            margin: 0,
            fontFamily: 'var(--font-heading)',
            fontWeight: 600,
            fontSize: 'var(--text-body)',
            color: 'var(--color-text-primary)',
          }}
        >
          {props.label}
        </p>
        <p
          id={descId}
          style={{
            margin: '4px 0 0',
            fontSize: 'var(--text-body-sm)',
            lineHeight: 'var(--leading-normal)',
            color: 'var(--color-text-secondary)',
          }}
        >
          {props.description}
        </p>
      </div>
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 'var(--spacing-1)',
          minWidth: 48,
        }}
      >
        <Switch.Root
          checked={props.checked}
          disabled={props.disabled}
          onCheckedChange={(next) => props.onChange?.(next)}
          aria-labelledby={rowId}
          aria-describedby={descId}
          style={{
            position: 'relative',
            width: 44,
            height: 24,
            borderRadius: 9999,
            background: props.checked
              ? 'var(--color-sunset-green-500)'
              : 'var(--color-border-strong)',
            border: 'none',
            cursor: props.disabled ? 'not-allowed' : 'pointer',
            opacity: props.disabled ? 0.6 : 1,
            transition:
              'background-color var(--motion-fast) var(--easing-standard)',
            padding: 0,
            flexShrink: 0,
          }}
        >
          <Switch.Thumb
            style={{
              display: 'block',
              width: 18,
              height: 18,
              borderRadius: 9999,
              background: '#FFFFFF',
              boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
              transform: props.checked
                ? 'translateX(23px)'
                : 'translateX(3px)',
              transition:
                'transform var(--motion-fast) var(--easing-standard)',
              marginTop: 3,
            }}
          />
        </Switch.Root>
        {props.disabled && props.alwaysOnLabel ? (
          <span
            style={{
              fontSize: 'var(--text-micro)',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
            }}
          >
            {props.alwaysOnLabel}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 5l10 10M15 5L5 15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

import type {TelegramInlineKeyboardButton} from './types';

/**
 * Approval kind discriminator + callback_data codec (Phase 2.15).
 *
 * Telegram's `callback_data` field is capped at 64 bytes (UTF-8). The
 * encoding is `<kindShort>:<targetId>:<action>`:
 *   - kindShort: 'sm8' (servicem8_portfolio) or 'bd' (blog_draft)
 *   - targetId: the Sanity _id of the target document (typically
 *     `<schemaName>-<slug>` — well under 64 chars)
 *   - action: 'approve' or 'reject'
 *
 * parseCallbackData returns null for any malformed input. The webhook
 * handler treats null as "ignore-and-200" — likely a stale message from a
 * previous webhook config; ignoring is safer than 400.
 *
 * Phase 2.15 shipped the 'servicem8_portfolio' button set. Phase 2.16
 * ships the 'blog_draft' button set (Approve & publish / Reject) — the
 * same shape; the difference is in the webhook routing + Sanity-write
 * side-effect, not the keyboard.
 */

export type ApprovalKind = 'servicem8_portfolio' | 'blog_draft';
export type ApprovalAction = 'approve' | 'reject';

export type ApprovalCallbackData = {
  kind: ApprovalKind;
  targetId: string;
  action: ApprovalAction;
};

const KIND_TO_SHORT: Record<ApprovalKind, string> = {
  servicem8_portfolio: 'sm8',
  blog_draft: 'bd',
};
const SHORT_TO_KIND: Record<string, ApprovalKind> = {
  sm8: 'servicem8_portfolio',
  bd: 'blog_draft',
};

export function encodeCallbackData(data: ApprovalCallbackData): string {
  const short = KIND_TO_SHORT[data.kind];
  return `${short}:${data.targetId}:${data.action}`;
}

export function parseCallbackData(raw: string): ApprovalCallbackData | null {
  if (typeof raw !== 'string' || raw.length === 0) return null;
  const parts = raw.split(':');
  if (parts.length !== 3) return null;

  const [short, targetId, actionRaw] = parts;
  const kind = SHORT_TO_KIND[short];
  if (!kind) return null;
  if (!targetId) return null;
  if (actionRaw !== 'approve' && actionRaw !== 'reject') return null;

  return {kind, targetId, action: actionRaw};
}

export type ApprovalButtonSet = TelegramInlineKeyboardButton[][];

/**
 * Build the inline-keyboard button matrix for an approval request.
 *
 * Both kinds use the same one-row Approve/Reject layout. The label on the
 * blog_draft Approve button is more explicit ("Approve & publish") because
 * the side-effect is more consequential — Approve auto-creates the live
 * `blogPost` document (with placeholder featured image) rather than just
 * patching a draft.
 */
export function buildButtonsForKind(kind: ApprovalKind, targetId: string): ApprovalButtonSet {
  if (kind === 'servicem8_portfolio') {
    return [
      [
        {text: 'Approve', callback_data: encodeCallbackData({kind, targetId, action: 'approve'})},
        {text: 'Reject', callback_data: encodeCallbackData({kind, targetId, action: 'reject'})},
      ],
    ];
  }
  if (kind === 'blog_draft') {
    return [
      [
        {
          text: 'Approve & publish',
          callback_data: encodeCallbackData({kind, targetId, action: 'approve'}),
        },
        {text: 'Reject', callback_data: encodeCallbackData({kind, targetId, action: 'reject'})},
      ],
    ];
  }
  // Exhaustive switch — unreachable. TS narrows `kind` to `never` here.
  const _exhaustive: never = kind;
  throw new Error(`Unknown approval kind: ${String(_exhaustive)}`);
}

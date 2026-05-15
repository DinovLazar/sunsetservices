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
 * Phase 2.15 ships the 'servicem8_portfolio' button set. The 'blog_draft'
 * kind exists for the Sanity schema enum (forward-compat) but the runtime
 * button builder throws — Phase 2.16 ships the handler.
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
 * Phase 2.15 only implements 'servicem8_portfolio' (two buttons on one row:
 * Approve | Reject). 'blog_draft' throws — Phase 2.16 extension point. The
 * Sanity schema enum already includes 'blog_draft' so persisted documents
 * round-trip cleanly when Phase 2.16 wires the handler.
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
  // TODO(Phase 2.16): add the blog_draft button set here. Likely the same
  // Approve/Reject pair, but the summary message + downstream wiring differ.
  throw new Error('blog_draft kind not yet implemented — Phase 2.16 ships this');
}

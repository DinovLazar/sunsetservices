import {writeClient} from '@sanity-lib/write-client';
import type {ApprovalKind, ApprovalAction} from './approvals';

/**
 * Sanity persist helper for the telegramApprovalLog audit trail (Phase 2.15).
 *
 * Document IDs are auto-generated — these rows are append-only and don't need
 * dedup. createApprovalLog runs at send time with decision='pending';
 * recordDecision patches in the operator's tap (action + chat_id + raw
 * callback_data + decidedAt).
 *
 * Both functions return a result object — callers branch on it. Sanity
 * failures bubble as `{error}` so the route handler can return an opaque
 * 500 without leaking detail.
 */

export type CreateApprovalLogInput = {
  kind: ApprovalKind;
  targetId: string;
  sentMessageId: number;
  sentChatId: number;
  // Not set at create time — rawCallbackData lands in recordDecision when
  // Telegram echoes back the operator's tap.
};

export type CreateApprovalLogResult = {docId: string} | {error: string};

export async function createApprovalLog(
  input: CreateApprovalLogInput,
): Promise<CreateApprovalLogResult> {
  try {
    const now = new Date().toISOString();
    const doc = await writeClient.create({
      _type: 'telegramApprovalLog',
      kind: input.kind,
      targetId: input.targetId,
      sentMessageId: input.sentMessageId,
      sentChatId: input.sentChatId,
      sentAt: now,
      decision: 'pending',
    });
    return {docId: doc._id};
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown-sanity-error';
    console.error('[telegram] createApprovalLog failed:', message);
    return {error: message};
  }
}

export type RecordDecisionInput = {
  logDocId: string;
  decision: ApprovalAction;
  operatorChatId: number;
  rawCallbackData: string;
};

export type RecordDecisionResult = {ok: true} | {ok: false; error: string};

export async function recordDecision(input: RecordDecisionInput): Promise<RecordDecisionResult> {
  try {
    const now = new Date().toISOString();
    await writeClient
      .patch(input.logDocId)
      .set({
        decision: input.decision,
        decidedAt: now,
        operatorChatId: input.operatorChatId,
        rawCallbackData: input.rawCallbackData,
      })
      .commit();
    return {ok: true};
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown-sanity-error';
    console.error('[telegram] recordDecision failed:', message);
    return {ok: false, error: message};
  }
}

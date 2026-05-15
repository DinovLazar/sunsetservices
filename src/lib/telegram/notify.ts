import {sendMessage} from './client';
import {buildButtonsForKind, type ApprovalKind} from './approvals';
import {createApprovalLog} from './persistLog';

/**
 * High-level Telegram notify helpers (Phase 2.15).
 *
 * notifyOperator — one-way info message. Used by future agent error alerts
 * and the Phase 2.16 weekly SEO summary. Read TELEGRAM_OPERATOR_CHAT_ID at
 * call time so a launch-handover swap (Goran → Erick) takes effect without
 * a redeploy.
 *
 * requestApproval — two-way approval request. Prepends a MarkdownV2 kind
 * label to the summary, attaches the kind's button set, sends, and on
 * success writes a `pending` audit row in telegramApprovalLog. The
 * webhook handler patches that row when the operator taps.
 *
 * Both helpers never throw. Sanity errors land as `{sent:false}` (the
 * outbound message did go but the audit log failed — flagged in logs so
 * we can reconcile manually if it ever happens). Same durability pattern
 * as sendBrandedEmail.
 */

export type NotifyOperatorResult = {
  sent: boolean;
  messageId?: number;
  simulated?: boolean;
};

export async function notifyOperator(args: {
  text: string;
  parseMode?: 'MarkdownV2' | 'HTML';
}): Promise<NotifyOperatorResult> {
  const chatId = process.env.TELEGRAM_OPERATOR_CHAT_ID ?? '';
  if (!chatId) {
    console.error('[telegram] notifyOperator: TELEGRAM_OPERATOR_CHAT_ID is empty');
    return {sent: false};
  }

  const result = await sendMessage({
    chatId,
    text: args.text,
    parseMode: args.parseMode,
  });

  if (result.ok) {
    return {sent: true, messageId: result.messageId};
  }
  if (result.simulated) {
    return {sent: false, simulated: true};
  }
  return {sent: false};
}

export type RequestApprovalResult = {
  sent: boolean;
  messageId?: number;
  logDocId?: string;
  simulated?: boolean;
};

const KIND_LABELS: Record<ApprovalKind, string> = {
  servicem8_portfolio: '*ServiceM8 portfolio publish*',
  blog_draft: '*Monthly AI blog draft*',
};

export async function requestApproval(args: {
  kind: ApprovalKind;
  targetId: string;
  summary: string;
}): Promise<RequestApprovalResult> {
  const chatId = process.env.TELEGRAM_OPERATOR_CHAT_ID ?? '';
  if (!chatId) {
    console.error('[telegram] requestApproval: TELEGRAM_OPERATOR_CHAT_ID is empty');
    return {sent: false};
  }

  // buildButtonsForKind throws for 'blog_draft' until Phase 2.16. Catch
  // and convert to a not-sent result so callers never see a thrown error.
  let replyMarkup;
  try {
    replyMarkup = {inline_keyboard: buildButtonsForKind(args.kind, args.targetId)};
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown-buttons-error';
    console.error(`[telegram] requestApproval: ${message}`);
    return {sent: false};
  }

  const label = KIND_LABELS[args.kind];
  const text = `${label}\n\n${args.summary}`;

  const result = await sendMessage({
    chatId,
    text,
    parseMode: 'MarkdownV2',
    replyMarkup,
  });

  if (!result.ok) {
    if (result.simulated) return {sent: false, simulated: true};
    return {sent: false};
  }

  const chatIdNumber = Number(chatId);
  const logResult = await createApprovalLog({
    kind: args.kind,
    targetId: args.targetId,
    sentMessageId: result.messageId,
    sentChatId: chatIdNumber,
  });

  if ('error' in logResult) {
    // Outbound message was sent but the audit row failed. The operator can
    // still tap and the webhook will return ignored:'no-matching-log' — we
    // log here so the gap is visible in server logs for manual reconcile.
    console.error(
      `[telegram] requestApproval: message ${result.messageId} sent but log persist failed (${logResult.error})`,
    );
    return {sent: true, messageId: result.messageId};
  }

  return {sent: true, messageId: result.messageId, logDocId: logResult.docId};
}

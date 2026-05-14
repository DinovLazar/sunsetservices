import {NextResponse} from 'next/server';
import {serviceM8WebhookSchema} from '@/lib/servicem8/schema';
import {verifyServiceM8Signature} from '@/lib/servicem8/verifySignature';
import {persistServiceM8Event} from '@/lib/servicem8/persistEvent';

/**
 * POST /api/webhooks/servicem8 — ServiceM8 job-event ingestion (Phase 2.13).
 *
 * Flag-gated: when SERVICEM8_ENABLED!=='true' the route returns 200 +
 * `{status:'simulated',reason:'feature-flag'}` without parsing the body,
 * verifying the signature, or writing to Sanity. The Sunset Services team
 * has not adopted ServiceM8 yet (decision 2026-05-10) so the flag stays
 * false until Erick configures the real webhook in ServiceM8.
 *
 * Flag-on flow:
 *   1. Read the raw request body (NOT json.parse) — signature verification
 *      needs the original bytes. A JSON.parse + JSON.stringify round-trip
 *      can rewrite keys / whitespace and break HMAC verification.
 *   2. Verify the `x-servicem8-signature` header against
 *      HMAC-SHA256(rawBody, SERVICEM8_WEBHOOK_SECRET). 401 on failure with
 *      no Sanity write.
 *   3. Parse + Zod-validate the body. 400 on either failure. Zod errors are
 *      intentionally NOT echoed back (ServiceM8 doesn't need our parse tree
 *      and exposing it is needless surface).
 *   4. Persist with deterministic _id (idempotent). 200 + sanityDocId on
 *      create, 200 + sanityDocId + deduped=true on replay.
 *   5. On Sanity failure: 500 + opaque `persist-failed` reason — error
 *      details are logged server-side but NOT included in the response
 *      body (ServiceM8 retries on 5xx and leaking internals would be unsafe).
 *
 * Phase 2.17 reads the queued documents to draft EN+ES project descriptions,
 * send to Telegram for approval, and on Approve publish to portfolio + GBP.
 * This phase only ingests + persists — no Anthropic, no Telegram, no GBP.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (process.env.SERVICEM8_ENABLED !== 'true') {
    console.info('[servicem8] received call with SERVICEM8_ENABLED=false — no-op');
    return NextResponse.json(
      {status: 'simulated', reason: 'feature-flag'},
      {status: 200},
    );
  }

  // Read raw bytes — signature verification needs the exact wire body.
  const rawBody = await request.text();

  const signatureHeader = request.headers.get('x-servicem8-signature');
  const secret = process.env.SERVICEM8_WEBHOOK_SECRET ?? '';

  if (!verifyServiceM8Signature(rawBody, signatureHeader, secret)) {
    console.warn('[servicem8] invalid signature');
    return NextResponse.json(
      {status: 'error', reason: 'invalid-signature'},
      {status: 401},
    );
  }

  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      {status: 'error', reason: 'invalid-json'},
      {status: 400},
    );
  }

  const validated = serviceM8WebhookSchema.safeParse(parsedBody);
  if (!validated.success) {
    return NextResponse.json(
      {status: 'error', reason: 'invalid-payload'},
      {status: 400},
    );
  }

  try {
    const result = await persistServiceM8Event({
      eventId: validated.data.eventId,
      eventType: validated.data.eventType,
      jobId: validated.data.jobId,
      payload: rawBody,
      signatureValid: true,
      occurredAt: validated.data.occurredAt,
    });

    if (result.status === 'duplicate') {
      return NextResponse.json(
        {status: 'ok', deduped: true, sanityDocId: result.sanityDocId},
        {status: 200},
      );
    }

    return NextResponse.json(
      {status: 'ok', sanityDocId: result.sanityDocId},
      {status: 200},
    );
  } catch (err) {
    console.error('[servicem8] persist failed', err);
    return NextResponse.json(
      {status: 'error', reason: 'persist-failed'},
      {status: 500},
    );
  }
}

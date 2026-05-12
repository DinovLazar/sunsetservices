import {NextResponse} from 'next/server';
import {writeClient} from '@sanity-lib/write-client';
import {QuotePartialSchema} from '@/lib/quote/validation';
import {pushPartialLeadToMautic} from '@/lib/quote/mautic';

/**
 * POST /api/quote/partial — Step 1–3 abandoner breadcrumb (Phase 2.06).
 *
 * Called fire-and-forget by the wizard when the visitor advances past Step 1,
 * 2, or 3. NEVER called on Step 4→5 — Step 4 is the PII boundary. The Zod
 * schema rejects PII fields too as a defensive backstop.
 *
 * Document ID is deterministic (`quoteLeadPartial-<sessionId>`) so the second
 * and third pushes upsert into the same record. `firstSeenAt` is preserved by
 * fetching the document first: if it exists we patch only `lastUpdatedAt` +
 * the new step fields; if it doesn't exist we create with both timestamps set
 * to the current moment. This makes time-to-abandon analytics useful in Part 3.
 */

const ENABLED = process.env.WIZARD_SUBMIT_ENABLED === 'true';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!ENABLED) {
    return NextResponse.json({status: 'simulated'}, {status: 200});
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {status: 'error', code: 'invalid_json'},
      {status: 400},
    );
  }

  const parsed = QuotePartialSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        status: 'error',
        code: 'validation_failed',
        issues: parsed.error.flatten(),
      },
      {status: 400},
    );
  }

  const input = parsed.data;
  const now = new Date().toISOString();
  const docId = `quoteLeadPartial-${input.sessionId}`;

  // Patch if exists (preserve firstSeenAt), create if missing.
  const patchFields = {
    lastUpdatedAt: now,
    lastStepReached: input.lastStepReached,
    audience: input.audience,
    services: input.services,
    primaryService: input.primaryService,
    otherText: input.otherText,
    details: input.details,
    userAgent: input.userAgent,
    referrer: input.referrer,
  };

  try {
    const existing = await writeClient.fetch<{_id: string} | null>(
      '*[_id == $id][0]{_id}',
      {id: docId},
    );

    if (existing) {
      await writeClient.patch(docId).set(patchFields).commit();
    } else {
      await writeClient.create({
        _id: docId,
        _type: 'quoteLeadPartial',
        sessionId: input.sessionId,
        firstSeenAt: now,
        converted: false,
        ...patchFields,
      });
    }
  } catch (err) {
    console.error('[/api/quote/partial] Sanity write failed', err);
    return NextResponse.json(
      {status: 'error', code: 'sanity_write_failed'},
      {status: 500},
    );
  }

  await pushPartialLeadToMautic(input).catch((err) =>
    console.error('[/api/quote/partial] Mautic stub error', err),
  );

  return NextResponse.json({status: 'ok'}, {status: 200});
}

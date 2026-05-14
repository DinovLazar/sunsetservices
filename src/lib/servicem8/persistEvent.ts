import {writeClient} from '@sanity-lib/write-client';

/**
 * Persist a ServiceM8 event to Sanity (Phase 2.13).
 *
 * Deterministic `_id` (`servicem8Event-<slugified eventId>`) makes the write
 * idempotent — a replayed webhook lands on the same document and short-circuits
 * as a duplicate without a second write. The slugify pass is defensive: it
 * lowercases, trims whitespace, and replaces any non-`[a-z0-9_-]` character
 * with `-` so ServiceM8 event IDs that contain characters Sanity rejects in
 * `_id` (slashes, spaces, etc.) still produce a valid document ID.
 *
 * `payload` is stored as the original raw body string. Phase 2.17 reads
 * whatever's in it directly without a schema migration.
 *
 * On Sanity failure the error propagates — the route handler decides the
 * response shape. We never swallow Sanity errors and return success here.
 */

export type PersistInput = {
  eventId: string;
  eventType: string;
  jobId: string;
  payload: string;
  signatureValid: boolean;
  // Captured by the route after Zod validation; preserved inside the raw
  // payload blob rather than stored as a separate field. Phase 2.17 can
  // index it later by reading the JSON body if useful.
  occurredAt: string;
};

export type PersistResult =
  | {status: 'created'; sanityDocId: string}
  | {status: 'duplicate'; sanityDocId: string};

function slugifyEventId(eventId: string): string {
  return eventId
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function persistServiceM8Event(input: PersistInput): Promise<PersistResult> {
  const docId = `servicem8Event-${slugifyEventId(input.eventId)}`;

  const existing = await writeClient.fetch<{_id: string} | null>(
    '*[_id == $id][0]{_id}',
    {id: docId},
  );

  if (existing) {
    return {status: 'duplicate', sanityDocId: existing._id};
  }

  const now = new Date().toISOString();
  const doc = await writeClient.create({
    _id: docId,
    _type: 'servicem8Event',
    eventId: input.eventId,
    eventType: input.eventType,
    jobId: input.jobId,
    payload: input.payload,
    signatureValid: input.signatureValid,
    receivedAt: now,
    status: 'pending',
    telegramApprovalState: 'not_sent',
    createdAt: now,
    lastUpdatedAt: now,
  });

  return {status: 'created', sanityDocId: doc._id};
}

import {z} from 'zod';

/**
 * Zod validation schema for ServiceM8 webhook bodies (Phase 2.13).
 *
 * `eventType` is a literal — Phase 2.13 only handles `job.completed`. Future
 * phases (likely 2.17 or a webhook-expansion phase) widen this to an enum
 * when ServiceM8 sends other types we want to process.
 *
 * Root and `data` both use `.passthrough()` so ServiceM8 can ship extra
 * fields without rejection. Phase 2.17 reads whatever's in `payload` (the
 * stored JSON blob) directly — this schema only enforces the minimum shape
 * needed for indexing/dedup.
 *
 * The real ServiceM8 webhook shape is opaque to this phase (no live
 * integration). The fields below (`eventId`, `eventType`, `jobId`,
 * `occurredAt`, `data`) are the minimum that lets Phase 2.17 do its work;
 * whatever else ServiceM8 sends is preserved verbatim in `payload`.
 */
export const serviceM8WebhookSchema = z
  .object({
    eventId: z.string().min(1),
    eventType: z.literal('job.completed'),
    jobId: z.string().min(1),
    occurredAt: z.string().datetime({offset: true}),
    data: z.record(z.unknown()).passthrough(),
  })
  .passthrough();

export type ServiceM8WebhookPayload = z.infer<typeof serviceM8WebhookSchema>;

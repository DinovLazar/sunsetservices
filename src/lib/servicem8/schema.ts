import {z} from 'zod';

/**
 * Zod validation schema for ServiceM8 webhook bodies (Phase 2.13).
 *
 * `eventType` is a literal — Phase 2.13 only handles `job.completed`. Future
 * phases (likely 2.17 or a webhook-expansion phase) widen this to an enum
 * when ServiceM8 sends other types we want to process.
 *
 * Root is left at Zod's default mode (silent-strip extras) rather than
 * `.passthrough()`. The original plan specified passthrough so ServiceM8 can
 * ship extra fields without rejection, but Zod's default behavior already
 * does not reject extras — it silently strips them from the parsed output.
 * Since the route stores the raw request bytes verbatim in `payload` for
 * Phase 2.17 consumption, preserving extras in the parsed output adds
 * nothing. Dropping `.passthrough()` also avoids Zod 3.25's type-inference
 * regression where known keys collapse to `unknown` (the `flatten<T &
 * {[k:string]: unknown}>` mapped type loses declared property types).
 * Logged in Sunset-Services-Decisions.md.
 *
 * The real ServiceM8 webhook shape is opaque to this phase (no live
 * integration). The fields below (`eventId`, `eventType`, `jobId`,
 * `occurredAt`, `data`) are the minimum that lets Phase 2.17 do its work;
 * whatever else ServiceM8 sends is preserved verbatim in `payload`.
 */
export const serviceM8WebhookSchema = z.object({
  eventId: z.string().min(1),
  eventType: z.literal('job.completed'),
  jobId: z.string().min(1),
  occurredAt: z.string().datetime({offset: true}),
  data: z.record(z.unknown()),
});

export type ServiceM8WebhookPayload = z.infer<typeof serviceM8WebhookSchema>;

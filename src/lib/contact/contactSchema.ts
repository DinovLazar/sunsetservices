import {z} from 'zod';

/**
 * Server-side Zod schema for /api/contact (Phase 2.08).
 *
 * Mirrors the live ContactForm UI (Phase 1.11):
 *  - Single `name` field (NOT split first/last).
 *  - `email` and `phone` are independently optional, but the route handler
 *    enforces D14 "at least one of email or phone" after parsing.
 *  - `category` selector is optional (the UI also allows blank).
 *  - `message` is optional on the form (textarea may be empty).
 *
 * Honeypot is named `honeypot` over the wire (the field is rendered with
 * `name="website"` in the form — the client maps before POSTing) for
 * consistency with /api/quote.
 */
export const ContactSubmitSchema = z
  .object({
    sessionId: z.string().uuid(),
    honeypot: z.string().max(500),
    locale: z.enum(['en', 'es']).default('en'),
    name: z.string().min(1).max(200),
    email: z.string().email().max(200).optional().or(z.literal('')),
    phone: z.string().max(40).optional().or(z.literal('')),
    category: z
      .enum(['residential', 'commercial', 'hardscape', 'other'])
      .optional()
      .or(z.literal('')),
    message: z.string().max(5_000).optional().or(z.literal('')),
    referrer: z.string().max(2_000).optional(),
    userAgent: z.string().max(500).optional(),
  })
  .strict();

export type ContactSubmitInput = z.infer<typeof ContactSubmitSchema>;

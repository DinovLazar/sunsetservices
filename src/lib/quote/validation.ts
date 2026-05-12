import {z} from 'zod';

/**
 * Server-side Zod schemas for /api/quote + /api/quote/partial (Phase 2.06).
 *
 * Shape mirrors the wizard's runtime state shape from `src/data/wizard.ts`
 * (steps 1–4). Each leaf field carries a sensible `max()` to put a ceiling on
 * abuse without rejecting legitimate input. Top-level objects use `.strict()`
 * so unknown keys are rejected (catches client-side typos early).
 *
 * Step 3 `details` accepts the union of all audience-conditional fields. The
 * route handler does NOT enforce audience-vs-field consistency — that's the
 * client's job and is purely informational on the server side.
 */

const Audience = z.enum(['residential', 'commercial', 'hardscape']);

/**
 * Step 3 details — audience-conditional. Every field optional; the wizard
 * decides which subset to include based on the audience picked on Step 1.
 */
const DetailsSchema = z
  .object({
    // Residential
    propertySize: z.string().max(40).optional(),
    bedrooms: z.string().max(20).optional(),
    projectType: z.string().max(80).optional(),
    budget: z.string().max(80).optional(),

    // Commercial
    numProperties: z.string().max(40).optional(),
    numBuildings: z.string().max(40).optional(),
    contract: z.string().max(40).optional(),
    frequency: z.string().max(40).optional(),

    // Hardscape
    spaceType: z.array(z.string().min(1).max(40)).max(10).optional(),
    dimensions: z.string().max(120).optional(),
    surface: z.string().max(40).optional(),
    features: z.array(z.string().min(1).max(40)).max(20).optional(),

    // Shared
    timeline: z.string().max(80).optional(),
    notes: z.string().max(5_000).optional(),
  })
  .strict();

const AddressSchema = z
  .object({
    street: z.string().min(1).max(200),
    unit: z.string().max(60).optional().default(''),
    city: z.string().min(1).max(100),
    state: z.string().min(1).max(20),
    zip: z.string().min(1).max(20),
  })
  .strict();

const ContactPrefsSchema = z
  .object({
    bestTime: z.string().max(40).optional().default(''),
    contactMethod: z.string().max(40).optional().default(''),
  })
  .strict();

/**
 * Full Step 5 submit — POST /api/quote body.
 *
 * `honeypot` MUST be empty (max 0 chars). A populated honeypot field is the
 * server's signal that the request came from a naive bot.
 */
export const QuoteSubmitSchema = z
  .object({
    sessionId: z.string().uuid(),
    honeypot: z.string().max(0),
    audience: Audience,
    services: z.array(z.string().min(1).max(100)).min(1).max(50),
    primaryService: z.string().min(1).max(100).optional().default(''),
    otherText: z.string().max(500).optional().default(''),
    details: DetailsSchema.optional(),
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    email: z.string().email().max(200),
    phone: z.string().min(1).max(40),
    address: AddressSchema,
    contactPreferences: ContactPrefsSchema.optional(),
  })
  .strict();

/**
 * Partial push — POST /api/quote/partial body. Sent fire-and-forget when the
 * visitor advances past Steps 1, 2, or 3. NEVER contains PII (Step 4 is the
 * PII boundary; the schema deliberately omits firstName/lastName/email/phone/
 * address — extra keys here will 400).
 */
export const QuotePartialSchema = z
  .object({
    sessionId: z.string().uuid(),
    lastStepReached: z.number().int().min(1).max(3),
    audience: Audience.optional(),
    services: z.array(z.string().min(1).max(100)).max(50).optional(),
    primaryService: z.string().max(100).optional(),
    otherText: z.string().max(500).optional(),
    details: DetailsSchema.optional(),
    userAgent: z.string().max(500).optional(),
    referrer: z.string().max(2_000).optional(),
  })
  .strict();

export type QuoteSubmitInput = z.infer<typeof QuoteSubmitSchema>;
export type QuotePartialInput = z.infer<typeof QuotePartialSchema>;

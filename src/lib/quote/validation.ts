import {z} from 'zod';

/**
 * Server-side Zod schemas for /api/quote + /api/quote/partial (Phase 2.06).
 *
 * Phase M.01e-pt2 — migrated the `audience` field to `division` (4-division
 * union) and added a required `propertyType` field on the submit schema
 * (optional on partials — Step 4 is the PII boundary, and propertyType lives
 * on Step 4, so partial pushes for Steps 1–3 don't have it yet).
 *
 * Shape mirrors the wizard's runtime state shape from `src/data/wizard.ts`.
 * Each leaf field carries a sensible `max()` to put a ceiling on abuse
 * without rejecting legitimate input. Top-level objects use `.strict()`
 * so unknown keys are rejected (catches client-side typos early).
 *
 * Step 3 `details` accepts the union of all conditional fields. The route
 * handler does NOT enforce group-vs-field consistency — that's the client's
 * job and is purely informational on the server side.
 */

const Division = z.enum(['landscape', 'hardscape', 'waterproofing', 'snow-removal']);
const PropertyType = z.enum(['residential', 'commercial']);

/**
 * Step 3 details — group-conditional. Every field optional; the wizard
 * decides which subset to include based on the (division, propertyType)
 * group picked.
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
    unit: z.string().max(60).optional(),
    city: z.string().min(1).max(100),
    state: z.string().min(1).max(20),
    zip: z.string().min(1).max(20),
  })
  .strict();

const ContactPrefsSchema = z
  .object({
    bestTime: z.string().max(40).optional(),
    contactMethod: z.string().max(40).optional(),
  })
  .strict();

/**
 * Full Step 5 submit — POST /api/quote body.
 *
 * The route handler checks `honeypot` BEFORE Zod runs and silently returns
 * 200 on any non-empty value so bots don't learn which field they tripped.
 * The Zod schema still requires the key to be present (defense in depth) but
 * allows any length — the honeypot signal is consumed upstream.
 */
export const QuoteSubmitSchema = z
  .object({
    sessionId: z.string().uuid(),
    honeypot: z.string().max(500),
    locale: z.enum(['en', 'es']).default('en'),
    division: Division,
    propertyType: PropertyType,
    services: z.array(z.string().min(1).max(100)).min(1).max(50),
    primaryService: z.string().min(1).max(100).optional(),
    otherText: z.string().max(500).optional(),
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
 * address/propertyType — extra keys here will 400).
 */
export const QuotePartialSchema = z
  .object({
    sessionId: z.string().uuid(),
    lastStepReached: z.number().int().min(1).max(3),
    division: Division.optional(),
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

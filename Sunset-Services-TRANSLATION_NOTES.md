# Sunset Services — Translation Notes (Spanish)

> Canonical reference for the Spanish translation work on `sunsetservices.us`.
> Companion to `Sunset-Services-Plan.md` §10 and `Sunset-Services-Decisions.md`.

## What this file is

The single source of truth for **how** Sunset Services' Spanish copy is produced and **why** each non-obvious choice was made. Future contributors read this before adding or revising any `.es` string. Native reviewers (Phase 2.12) read this before reviewing Code's Phase 2.11 first pass.

| When | Author | What ran |
|---|---|---|
| Phase 2.11 (this pass) | Claude Code | Idiomatic first pass across every `[TBR]`-flagged source-file string and every null/placeholder Sanity `.es` field. Output carries a leading `[TBR] ` prefix per locked convention. |
| Phase 2.12 (next) | Erick Valle + Cowork | Native review. Strips `[TBR] ` prefix from each surface as approved. Logs any retranslations under "Phase 2.12 review-pass changes" below. |

## Dialect + tone — locked

### Dialect
**Neutral Latin American Spanish, Mexican-origin friendly.** Aurora's Hispanic community is largely of Mexican origin; the copy reads natural for that audience without alienating other Latin American Spanish speakers.

**Avoid (Iberian / Castilian):**
- `vosotros` / `os` → always `ustedes` / `los` / `las`
- `coger` (acquires sexual meaning in Mexican Spanish) → `tomar`, `agarrar`, `obtener` per context
- `ordenador` → `computadora` (or `equipo` / `dispositivo` when generic)
- `móvil` → `celular`
- `aparcar` / `aparcamiento` → `estacionar` / `estacionamiento`
- `piso` (for residential unit) → `apartamento`
- `vale` (filler agreement) → `está bien`, `de acuerdo`, `okay`
- `tío` / `tía` (informal "guy/gal") → don't use; name the person or rework

**Prefer (Mexican / Latin American standard):**
- `césped` for residential lawn (not `hierba`, not `pasto`)
- `jardín` for landscaped yard
- `patio` (universal loanword)
- `adoquines` for pavers
- `muro de contención` for retaining wall
- `cocina al aire libre` for outdoor kitchen
- `brasero` for fire pit (the structure); `fogata` for the activity/fire itself
- `pérgola` for pergola
- `sistema de riego` for sprinkler system
- `remoción de nieve` for snow removal (`quitanieves` is the machine)
- `estimado gratis` for free estimate (`cotización gratuita` works for written quotes)
- `cotización` for quote
- `propiedad` for property
- `propietario / propietaria` for homeowner (match grammatical gender if known)
- `temporada` for season

### Tone map — `usted` vs `tú`, locked

**`usted` (formal) — legal, forms, transactional, error/system messages, visitor-facing email:**
- Privacy + Terms pages (`/privacy/`, `/terms/`)
- Quote wizard (`/request-quote/` — every step, every validation, every UI label)
- Contact form (labels, validation, helper text, success/error states)
- All five branded email templates — visitor-facing AND Erick-facing
- Thank-you page (`/thank-you/`)
- Cookie consent banner (`chrome.consent.*`)
- 404 page
- All system error messages (`chat.errors.*`, form errors, fetch error fallbacks)
- Newsletter signup confirmation copy
- Chat inline lead-capture form (transactional sub-surface)
- Calendly booking sub-headings + iframe labels (transactional)
- `chrome.footer.newsletter.successMessage`, `alreadySubscribed`, `invalidEmail`, `errorMessage` (system feedback)

**`tú` (informal, warm) — marketing, content, conversational, persona:**
- Home page (every section)
- Audience landings (`/residential/`, `/commercial/`, `/hardscape/`) — every section
- Service detail pages (all 16) — body copy, value props, FAQs, CTAs
- Project portfolio (index + detail pages) — narratives, captions, related-project tiles
- Blog posts (5 seed posts — body PortableText, intros, FAQ blocks)
- Resource articles (5 seed articles — body PortableText)
- About page
- Service-areas index + 6 location pages (FAQs, testimonials, `whyLocal` prose)
- AI chat **persona system prompt** + every assistant-facing string (`chat.banner.*`, suggested prompts, high-intent banner)
- All testimonial quotes (preserve reviewer's apparent voice — usually `tú`, occasionally `usted` if the reviewer is formal)
- Footer newsletter signup pitch (`chrome.footer.newsletter.heading`, `helper`)

**Edge cases documented in this phase:**

- **Service page CTA linking to the wizard:** `tú` in the lead-in ("Empieza tu proyecto hoy") flips to `usted` once the wizard opens ("Cuéntenos sobre su propiedad"). Deliberate register shift at the page boundary.
- **Footer chrome with mixed legal + marketing:** the warm pitch line is `tú`; the fine-print legal sentence is `usted`. Treat each as its own translation unit.
- **AI chat — system prompt vs visitor-facing chrome:** `PERSONA_ES` instructs Claude on visitor tone — set to `tú` consistently. Chat UI chrome follows the tone map: composer placeholder `tú`, rate-limit and disabled errors `usted`.
- **Erick-facing alert emails** (`QuoteLeadAlertEmail`, `ContactAlertEmail`, `ChatLeadEmail`): EN-only, per Phase 2.08/2.09 convention. Confirmed no stray ES literals.

## `[TBR]` semantics

Every Spanish string Code produces or upgrades in Phase 2.11 carries a leading **`[TBR] `** prefix (trailing space). Phase 2.12 strips the prefix one surface at a time as Erick approves. Strings without a `[TBR]` prefix were already considered done by an earlier pass — Code does not retag them.

Position rule: `[TBR] ` is a **leading** marker. Strings that had `[TBR]` as a suffix (legacy) are normalized to leading position during this phase.

## Glossary (canonical — every recurring term)

When the same English term appears in multiple places, the Spanish answer is the same everywhere. Add a row whenever a new recurring term surfaces.

| English | Spanish | Notes |
|---|---|---|
| Sunset Services | **Sunset Services** | Brand name. Never translated. |
| Erick Valle / Nick Valle / Marcin | (proper nouns) | Never translated. |
| Unilock | **Unilock** | Brand name. Never translated. |
| Aurora / Naperville / Batavia / Wheaton / Lisle / Bolingbrook | (proper nouns) | Cities. |
| DuPage County | **Condado de DuPage** | First mention spells out; subsequent may abbreviate to "DuPage". |
| HOA (homeowners' association) | **HOA** (parenthetical "asociación de propietarios" on first mention in long copy) | Property managers use the EN acronym. |
| Property manager | **Property manager** (loanword in commercial context) / **administrador de propiedades** (formal/legal context) | The English term is widely used among DuPage PMs; keep in marketing copy. Use the Spanish form in legal/contract text. |
| Free estimate | **Estimado gratis** | Crisp. Used in CTAs. |
| Get a quote (button) | **Pide una cotización** (tú) / **Solicite una cotización** (usted) | Tone-dependent. |
| Quote (noun) | **Cotización** | Written quote with line items. |
| Estimate (noun) | **Estimado** | Shorter than cotización; used in CTAs and brief contexts. |
| Patio | **Patio** | Universal loanword. |
| Walkway | **Pasillo** / **camino** (paver: `camino de adoquines`) | |
| Driveway | **Entrada para autos** / **cochera** | "Entrada para autos" preferred for clarity. |
| Pavers | **Adoquines** | Plural; singular is `adoquín`. |
| Hardscape | **Hardscape** (parenthetically "construcción exterior" on first mention) | Industry term — kept. |
| Retaining wall | **Muro de contención** | |
| Fire pit | **Brasero** (structure) / **fogata** (the fire itself, activity) | Different terms for the object vs. the experience. |
| Pergola | **Pérgola** | |
| Outdoor kitchen | **Cocina al aire libre** | |
| Lawn care | **Cuidado del césped** | |
| Landscape design | **Diseño de jardines** (service) / **paisajismo** (discipline) | Two answers for two contexts. |
| Tree services | **Servicios para árboles** | |
| Sprinkler system | **Sistema de riego** | |
| Snow removal | **Remoción de nieve** | (`quitanieves` is the machine — never use for the service.) |
| Seasonal cleanup | **Limpieza de temporada** | |
| Landscape maintenance | **Mantenimiento de jardines** | |
| Property enhancement | **Mejora de propiedad** | |
| Turf management | **Manejo de césped deportivo** | Commercial — sports turf / large lawns. |
| Property | **Propiedad** | |
| Homeowner | **Propietario / propietaria** | Match gender if known. |
| Project | **Proyecto** | |
| Service area | **Zona de servicio** | |
| Family-owned | **Empresa familiar** | Not "de familia" alone. |
| Second-generation | **Segunda generación** | |
| Trusted | **De confianza** | "Empresa de confianza" — not "confiable" alone. |
| Premium | **De alta calidad** / **premium** | "Premium" works as a loanword in MX marketing. |
| Book a consult | **Agenda una consulta** (tú) / **Agende una consulta** (usted) | |
| Learn more | **Más información** | |
| See our work | **Ve nuestro trabajo** (tú) / **Vea nuestro trabajo** (usted) | |
| Get started | **Empieza ahora** (tú) / **Comience ahora** (usted) | |
| Read more | **Leer más** | Infinitive form — works either tone. |
| Square feet / sq ft | **pies cuadrados** / **pie²** | Imperial units stay — Aurora homeowners think in pies cuadrados, not metros. |
| Concrete | **Concreto** | (Not `hormigón` — that's Iberian / South-American technical.) |
| Natural stone | **Piedra natural** | |
| French drains | **Desagües franceses** | |
| Salt-tolerant turf | **Césped tolerante a la sal** | |
| Backyard | **Patio trasero** | |
| Front walk | **Acera delantera** / **entrada delantera** | Context-dependent. |
| Slope (yard) | **Pendiente** | |
| Curb appeal | **Apariencia de fachada** | |
| Yards (e.g. "1,200 yards") | **yardas** | US measure stays. |
| Foot (length) | **pie** (plural `pies`) | |
| Inch | **pulgada** | |
| Permit | **Permiso** | (Construction permit context.) |
| Estimate (verb) | **estimar** / **cotizar** | "Cotizar" preferred for service quotes. |
| Crew | **Equipo** | Not `cuadrilla` in customer-facing copy (regional). |
| Property managers (PM) | **Property managers** (loanword) / **administradores de propiedades** | See HOA row. |
| Slip-and-fall claim | **Reclamación de resbalón** | |
| Spring / summer / fall / winter | **primavera / verano / otoño / invierno** | |
| Mulch | **mulch** (loanword) / **acolchado** | "Mulch" is widely understood and shorter; both acceptable. |
| Sod | **tepe** | |
| Aerate / aeration | **airear / aireación** | |
| Overseed / overseeding | **resembrar / resiembra** | |
| Pre-emergent (herbicide) | **pre-emergente** | |
| Crabgrass | **pasto cangrejo** | |
| Curb (HOA entrance) | **fachada** / **frente** | Context-dependent. |
| Insured / certificate of insurance (COI) | **asegurado** / **certificado de seguro (COI)** | Keep COI abbreviation — PMs use it. |
| Trigger (snow contract) | **disparador** | The depth-threshold that activates a snow visit. |
| Salt brine (pre-treatment) | **salmuera** | |

## Per-surface inventory — what Code touched in Phase 2.11

### Source files

| File | Translation units | Tone | Notes |
|---|---|---|---|
| `src/messages/es.json` | 191 `[TBR]`-flagged keys across namespaces: `serviceAreas.*`, `location.*`, `projects.*`, `project.*`, `chrome.consent.*`, `chrome.footer.newsletter.*` (new), `contact.calendly.*`, `thanks.calendly.*`, `chat.banner.*`, `chat.leadCapture.*`, `chat.errors.*`, `resources.*`, `blog.*`, `content.*` | Mixed per tone map | Prefix normalized to leading position. |
| `src/data/locations.ts` | 24 `.es` strings across 6 cities: `hero.h1`, `hero.sub`, `whyLocal`, `testimonials[].quote`, `testimonials[].attribution`, `meta.description` | `tú` (location pages are marketing); testimonial quotes preserve reviewer voice | Per-city personality preserved (Aurora emotional weight, Naperville polish, Lisle commercial precision, Bolingbrook approachability, etc.). |
| `src/data/projects.ts` | 78 `[TBR]`-flagged strings across 12 projects: `title.es`, `shortDek.es`, `narrativeHeading.es`, `narrative.es`, `materials.es`, `leadAlt.es`, `gallery[].alt.es`, `beforeAlt.es`, `afterAlt.es` | Narrative third-person + `tú` for CTA | Alt text descriptive + location-aware ("Patio de adoquines instalado en patio trasero de Naperville, IL") for SEO. |
| `src/lib/email/templates/QuoteConfirmationEmail.tsx` | Spanish `copy.es` block (preheader, h1, body lines, CTA labels, sign-off) | `usted` end-to-end | Visitor-facing. |
| `src/lib/email/templates/ContactConfirmationEmail.tsx` | Spanish `copy.es` block | `usted` end-to-end | Visitor-facing. |
| `src/lib/email/templates/NewsletterWelcomeEmail.tsx` | Spanish `copy.es` block | `usted` end-to-end | Visitor-facing. |
| `src/lib/email/templates/QuoteLeadAlertEmail.tsx`, `ContactAlertEmail.tsx`, `ChatLeadEmail.tsx` | (none — EN-only per Phase 2.08/2.09 convention) | n/a | Confirmed no stray ES literals. |
| `src/lib/chat/systemPrompt.ts` | `PERSONA_ES` block (visitor persona system prompt) | `tú` throughout (visitor-facing tone) | Highest-stakes translation in this phase — see "Native-review priority items" below. |
| `src/lib/chat/knowledgeBase.ts` | `ES` `LocaleLabels` block (chat digest headings, role labels, bio summaries) | `tú` (strings can surface in chat responses) | Bios match each team member's voice. |
| `src/app/[locale]/blog/page.tsx` | 2 inline ES literals: `Por ${author} [TBR]` × 2 | `tú` | Byline label pattern. |
| `src/app/[locale]/blog/[slug]/page.tsx` | 4 inline ES literals: byline, "Common questions" → "Preguntas frecuentes", "Keep reading" → "Sigue leyendo", related-post byline | `tú` | |
| `src/app/[locale]/resources/[slug]/page.tsx` | 3 inline ES literals: byline, "Common questions about X", "Keep reading" | `tú` | |

### Sanity content

| Doc type | Count | Bilingual `.es` fields patched | Tone |
|---|---|---|---|
| `service` | 16 | `dek.es`, `intro.es`, `priceIncludes[].es`, `seo.title.es`, `seo.description.es` (titles were already populated from seed) | `tú` (marketing) |
| `location` | 6 | `tagline.es`, `microbarLine.es`, `whyLocal.es`, `seo.title.es`, `seo.description.es` | `tú` (marketing) |
| `project` | 12 | `shortDek.es`, `narrativeHeading.es`, `narrative.es`, `materials[].es`, `leadAlt.es`, `gallery[].alt.es`, `beforeAlt.es`, `afterAlt.es`, `seo.title.es`, `seo.description.es` (titles partially populated from seed) | Narrative third-person + `tú` for CTAs |
| `team` | 3 | `role.es`, `bio.es`, `portraitAlt.es` (all were null) | First-person where the bio is "Soy Erick…"; otherwise `tú` |
| `review` | 6 | `quote.es`, `attribution.es` (already populated with `[TBR]` prefix from seed — preserved) | Preserve reviewer voice |
| `faq` | 128 | `question.es`, `answer.es` (mostly populated with trailing `[TBR]` suffix — normalized to leading prefix where Code revised; otherwise preserved) | `tú` (marketing/content scopes) |
| `blogPost` | 5 | `body.es` PortableText (already populated from seed; Code verified structural mirror + quality); `eyebrow.es`, `dek.es`, `featuredImageAlt.es`, `seo.title.es`, `seo.description.es` where null | `tú` |
| `resourceArticle` | 5 | `body.es` PortableText (same pattern); `eyebrow.es`, `dek.es`, `featuredImageAlt.es`, `seo.title.es`, `seo.description.es` where null | `tú` |

## In-phase decisions

Decisions Code made on its own during Phase 2.11. Erick can ratify or override in 2.12.

- **"Hardscape" stays in English as the brand-facing term**, glossed as "construcción exterior" on first mention in long copy. Reason: Sunset Services is a Unilock-Authorized Contractor and "hardscape" is the industry-standard label DuPage PMs and homeowners use. The Spanish gloss helps any first-time visitor who hasn't seen the EN term.
- **"Property manager" kept as a loanword in marketing copy**, translated to "administrador de propiedades" in legal/contract context. Reason: the role is widely English-named among DuPage PMs even when they're Spanish-speaking; switching to Spanish in marketing copy would feel forced. Legal text gets the Spanish term because contracts are interpreted in Spanish.
- **HOA stays as the acronym**, with parenthetical "asociación de propietarios" on first mention in long copy. Reason: the acronym is universal across Aurora's HOA community regardless of the homeowner's primary language.
- **"Family-owned" → "empresa familiar"**, not "de familia" alone. Reason: "de familia" sounds folksy/regional in MX Spanish; "empresa familiar" reads professional and matches how a homeowner would describe a contractor they trust.
- **"Concreto" used uniformly, not "hormigón".** Reason: "hormigón" is Iberian/South-American technical; "concreto" is the universal MX-Spanish term homeowners use.
- **"Pies cuadrados" / "pie²" kept for square-footage** (vs. metric `metros²`). Reason: Aurora homeowners and contractors quote in imperial units; metric would feel foreign even though it's technically more "Spanish."
- **`[TBR]` position normalized to leading prefix** across all upgraded values, fixing legacy strings where `[TBR]` was a suffix.
- **Reviewer testimonial voices preserved** — if the EN testimonial reads folksy ("Cleaner than the day we moved in"), the ES preserves that register. Where the original `usted` pattern fits the reviewer ("Sunset es el único paisajista…"), keep it; otherwise default `tú`.
- **Chat persona `PERSONA_ES`: `tú` throughout** (visitor-facing). Erick reviews this whole block first in Phase 2.12 — it's the highest-stakes single translation in the project.
- **Pre-existing translations without `[TBR]` left untouched.** Reason: Code interprets the absence of `[TBR]` as "already considered done by an earlier pass." Code translates `[TBR]`-flagged strings and null/placeholder Sanity fields, but does not retranslate strings that previous phases marked as final. If Erick finds a non-`[TBR]` string that should be revised, he flags it in Phase 2.12 and a follow-up pass handles it.
- **Sanity blog/resource PortableText bodies already had ES content from the seed migration** (sometimes with a `[TBR]` prefix on the first block only). Code did not re-translate the bodies block-by-block — that scope would have exceeded what's useful as a first pass. Instead Code:
  1. Confirmed block structure mirrors EN (heading hierarchy, list metadata, inline cross-links).
  2. Spot-checked sample blocks per post for idiomatic quality and glossary alignment.
  3. Patched any null SEO/eyebrow/dek fields with idiomatic translations.
  4. Flagged the bodies for Phase 2.12 deep review under "Native-review priority items".
- **Source-file `src/data/blog.ts` and `src/data/resources.ts` body-content `[TBR]` markers left in place.** Reason: Post Phase 2.05, blog and resource bodies are sourced from Sanity, not from these files. The source-file content is now seed-only and not rendered to users — translating it would be effort that doesn't change the live site. The dead-code `[TBR]` markers will be cleaned up in a future i18n hygiene pass.
- **Source-file `src/data/services.ts` 1× `[TBR]` is a header-comment reference**, not a translation target. No action.

## Native-review priority items (Phase 2.12)

Code is least confident about these. Erick reviews them first.

1. **`src/lib/chat/systemPrompt.ts` → `PERSONA_ES`** — the entire block. This is the assistant's personality in Spanish. Every adjective, every verb, every example phrase shapes how thousands of future visitor conversations open. Read aloud; if any line sounds robotic or translation-y, fix it.
2. **`src/messages/es.json` → `chat.banner.*` and `chat.leadCapture.*`** — the high-intent banner ("Parece que ya estás listo para el siguiente paso") and lead-capture confirmation ("Gracias — Erick te contactará en un día hábil"). These run at the moment of conversion; tone matters more than literal accuracy.
3. **`src/data/locations.ts` → per-city `whyLocal.es`** prose — the ~120-word paragraph per city is what convinces a Spanish-speaking homeowner that we know THEIR neighborhood. Aurora, Naperville, Lisle, and Bolingbrook are the highest-volume cities; review those first.
4. **Hardscape industry terms** — "hardscape" / "muro de contención" / "cocina al aire libre" / "adoquines" — confirm with Erick that these match the language his Spanish-speaking customers actually use, not just textbook-correct MX Spanish.
5. **Testimonial quote translations (locations.ts + Sanity `review` docs)** — voice preservation is judgment-heavy. If any quote in Spanish reads more polished than the EN original, that's a tell that Code over-formalized.
6. **Sanity blog/resource PortableText bodies** — Code didn't re-translate these block-by-block (scope decision above). Read each post / article through once and flag any block that reads like translation-shaped Spanish rather than how a Mexican-American DuPage homeowner would describe the topic.
7. **The 128 FAQ answers in Sanity** — particularly the cost-guide ones (numbers + "Paga $15 una vez o $20 dos veces" register). Confirm that pricing copy reads natural in Spanish, not literal.

## Open questions for native review

- **Aurora's Spanish-speaking community uses "casa" vs "hogar" — interchangeable in marketing?** Code defaulted to `casa` for residential-audience copy ("para tu casa") because it's more grounded and conversational. Erick confirms.
- **First-name address in transactional emails** — "Hola Juan" vs "Estimado Juan". Code went with `Hola` for the visitor-facing emails because the brand voice is plainspoken; `Estimado` felt distant for what's effectively a thank-you note. Erick confirms.
- **"Llamamos al" vs "Llámenos al"** in CTAs — `usted` register would be "llámenos" but it sounds stiff. Code used "Llámenos al (630) 946-9321" only on legal/transactional surfaces and kept "Llama al" in marketing where `tú` register applies.
- **"Hispano" vs "Latino"** — Code didn't use either label anywhere; the copy speaks TO Spanish-speaking homeowners without naming them. Erick confirms this is the right call given the site's positioning.
- **"Snow event" / "weather event"** — Code translated as "evento de nieve" / "tormenta" depending on context. PMs may have their own term — Erick confirms.

## Phase 2.12 review-pass changes

(To be populated by Phase 2.12 native review. Each entry: surface, what changed, why.)

## How to add an entry

- New recurring term → add a row to **Glossary**.
- New non-obvious choice → add a bullet under **In-phase decisions**.
- Low-confidence section → add to **Native-review priority items**.
- Unresolved → add to **Open questions**.

This file lives at the project root (alongside `Sunset-Services-Plan.md` etc.) and is updated as the work progresses.

---

## Phase B.03 — Cookie banner + modal + legal page chrome (added 2026-05-15)

Phase B.03 introduces 26 new ES strings (mirroring 26 new EN strings) across three namespaces in `src/messages/es.json`. All strings are Code's **first pass** — no native review yet. Flagged for Phase M.03.

**Namespaces touched:**
- `chrome.consent.heading` + `chrome.consent.body` — **rewritten** (was the Phase 2.10 binary banner copy; B.03 banner adds Manage option, copy needed to mention granular control).
- `chrome.consent.banner.{rejectAllCta, manageCta, privacyLink}` — **new** (3 keys).
- `chrome.consent.modal.{title, intro, closeAria, rowsAriaLabel, cancelCta, saveCta, necessary.{label,description,alwaysOn}, analytics.{label,description}, marketing.{label,description}, personalization.{label,description}}` — **new** (15 keys).
- `legal.breadcrumb.{home, privacy, terms}` — **new** (3 keys).
- `legal.embed.preparingFallback` — **new** (1 key, the "Legal content is being prepared" graceful fallback shown when Termly env vars are empty).
- `legal.privacy.meta.{title, description}` + `legal.privacy.hero.{eyebrow, h1, lastUpdated}` — **new** (5 keys).
- `legal.terms.meta.{title, description}` + `legal.terms.hero.{eyebrow, h1, lastUpdated}` — **new** (5 keys).

**Register applied:** `usted` throughout (legal/transactional surface — banner asks consent, modal manages settings, legal pages render policy documents). Mirrors the Phase 2.11 register decision for transactional surfaces.

### Native-review priority items (B.03 additions)

These join the existing M.03 priority list. Code is least confident about (a) the consent-category descriptions inside the modal (technical-yet-conversational tone is judgment-heavy) and (b) the legal-page meta descriptions (SEO surface; word choice affects click-through).

1. **`chrome.consent.modal.analytics.description`** — "Nos ayuda a entender qué páginas y funciones se usan para que podamos mejorar el sitio. Nunca vendemos ni compartimos estos datos." The "nunca vendemos ni compartimos" promise has legal weight. Erick confirms.
2. **`chrome.consent.modal.marketing.description`** — "Nos permite medir el rendimiento de los anuncios en Google y otras plataformas cuando hace clic para entrar a nuestro sitio." Aurora's Spanish-speaking customers may not encounter Google Ads tracking copy in Spanish often; the phrasing should read native-Spanish-conversational, not literal.
3. **`chrome.consent.modal.personalization.description`** — "Permite que los anuncios en otros sitios se adapten a usted según su visita al nuestro." "Se adapten a usted" reads slightly formal — alternatives are "se personalicen para usted" or "se ajusten a sus intereses." Erick confirms.
4. **`legal.{privacy,terms}.hero.lastUpdated`** — "Última actualización: abril de 2026." Lowercase month is Spanish-correct; confirm the date format is the user's preference (alternatives: "abril 2026" or "April 2026" since the date is updated by Termly content not Code).
5. **`legal.embed.preparingFallback`** — "El contenido legal se está preparando. Vuelva a consultar pronto, o escríbanos a info@sunsetservices.us para solicitar una copia." Short fallback; the "escríbanos para solicitar una copia" implies the policy is available by email — which it should be once Termly is set up in B.04. If Erick prefers visitors NOT email for a copy (because Termly is the source), revise to drop the email mention.

### Open questions (B.03 additions)

- **"Política de privacidad" vs "Aviso de privacidad"** — Code defaulted to `Política de privacidad` (the more common LATAM term). Mexican government uses `Aviso de privacidad` for the GDPR-equivalent legal notice. Erick confirms based on what feels native to Aurora.
- **"Términos del servicio" vs "Términos y condiciones" vs "Condiciones del servicio"** — Code went with `Términos del servicio` (literal of English). LATAM Spanish often uses `Términos y condiciones`. Erick confirms.
- **"Cookies" vs "Galletas" vs "Cookies (galletas)"** — `Cookies` (English loanword) is now standard in LATAM Spanish digital contexts. Code did NOT translate the word. Confirm.
- **"Estrictamente necesarias" vs "Estrictamente necesarios"** — Code used the feminine plural (because `cookies` is treated as feminine in modal context: `las cookies`). Confirm gender choice.



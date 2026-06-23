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

-

---

## Phase M.01f1 — Spanish first-pass polish for M.01d/e/e-pt2 content (added 2026-05-26)

### Purpose, owner, related phases

This section is the **canonical Spanish glossary + register matrix** for the project, locked during Phase M.01f1 (Cowork). It consolidates the Spanish strings first-passed by Code while shipping the new 4-division IA (M.01d), the visible flip + 22 cities + Q&A (M.01e), and the wizard/property-type migration (M.01e-pt2). Goal: when Erick reviews the Spanish surface natively in M.03, he reads one coherent body of text with one glossary, not three independent first drafts.

- **Owner:** Cowork (this pass) -> Erick Valle (native review, M.03).
- **Scope:** the 4 division definitions, 14 new services (10 Waterproofing + 4 Snow Removal), 18 new city pages, the `qa.*` namespace (25 Q&A), the new wizard fields (division tiles + property type), the new lead-email row labels, and the 32 new Sanity FAQ docs (whose ES source lives in `scripts/migrate-faq-to-divisions.mjs`).
- **Out of scope:** all pre-M.01d content (16 existing services, 6 original cities, the Phase 2.11/B.03 glossary above). Where the pre-M.01d voice disagrees with an M.01f1 lock, the conflict is flagged below and the **existing voice is left untouched** — Erick reconciles in M.03.
- **Quality bar:** first-pass polish, good enough for Erick's review. Explicitly NOT native-quality. No `[TBR]` markers (post-B.01 convention).

### 1. Variety — locked

**LatAm Spanish, Mexico-leaning.** Rationale: Aurora's customer base is overwhelmingly Mexican-origin homeowners. No Castilian forms (no `vosotros`, no `coger` in the Iberian sense, no `ordenador`). When two valid LatAm forms exist, the Mexican one wins (e.g., `aguas residuales` over `aguas servidas`). Matches and extends the Phase 2.11 dialect lock above.

### 2. Register decision matrix — locked (surface-by-surface)

| Surface | Register | Notes |
|---|---|---|
| Homepage division block (`home.divisions.*`) | tú | Marketing |
| 4 division landings (`division.<slug>.*` + `divisions.ts` hero copy) | tú | Marketing |
| 14 new service detail pages (`services.ts` new entries) | tú | Marketing |
| Navbar mega-panel copy (`chrome.nav.servicesPanel.*`) | tú | Marketing chrome |
| Footer division links (`chrome.footer.links.*`) | tú | Marketing chrome |
| City `whyLocal` body copy (`locations.ts` 18 new cities) | tú | Marketing |
| Per-division related headline (`servicePage.related.h2.<division>`) | tú | Marketing |
| `qa.*` namespace (the `/qa/` page) | usted | Informational, not marketing |
| Wizard NEW strings (Step 4 propertyType label/options/error) | usted | Locked decision #4; matches B.10 contact-block usted |
| Extended service-area note (`serviceAreas.extendedArea.*`) | usted | Informational |
| Lead-email rows (`División` / `Tipo de propiedad` labels) | neutral nouns | No register; surrounding text usted |
| Sanity FAQ docs (14 service + 18 city) | usted | Informational surface |

**Boundary rule applied:** the established wizard UI (Step 1 title, Step 2 titles, the shared error strings like "Por favor completa este campo", "Intenta de nuevo") uses **tú** imperatives — pre-M.01d established voice. Locked decision #2 nominally puts the whole wizard in usted, but the established surface is tú except the Step 4 contact/PII block (usted, from B.10). Per the boundary rule, new wizard strings were ALIGNED to the existing surface register (Step 1/2 stay tú; Step 4 propertyType stays usted per the lock). The mid-wizard tú->usted shift at Step 4 is deliberate and matches the documented Phase 2.11 "CTA flips to usted once the wizard opens" boundary. Flagged for Erick.

### 3. Brand & proper nouns — never translated

Sunset Services, Erick Valle, Nick Valle, Marcin, Unilock, Aurora, Naperville, Wheaton, Batavia, Hinsdale, Oak Brook, Elmhurst, Clarendon Hills, Burr Ridge, Western Springs, Glen Ellyn, Downers Grove, Winfield, Lombard, St. Charles, Geneva, South Elgin, Elburn, North Aurora, Oswego, Yorkville, Plainfield, Lisle, Bolingbrook, Illinois (or IL), Google, Calendly, Resend, Sanity.

**Place name with translated wrapper:** "DuPage County" -> **"el Condado de DuPage"** (keep the proper noun, translate the wrapper).

### 4. Division name lock (sitewide, verbatim)

| English | Spanish (locked) |
|---|---|
| Landscape | **Paisajismo** |
| Hardscape | **Pavimentos y construcción exterior** |
| Waterproofing | **Impermeabilización** |
| Snow Removal | **Remoción de nieve** |
| Trenchless & Directional Boring | **Perforación Direccional y Sin Zanja** (Phase B.12; short chip form **Perforación**) |

> CONFLICT with established voice: the live site (home.divisions, nav, footer, division landings) keeps **"Hardscape"** in English (Phase 2.11 decision). M.01f1 conformed the new division surfaces to the established **"Hardscape"** to avoid mid-site inconsistency, and did NOT impose "Pavimentos y construcción exterior." Erick decides the sitewide division-name treatment in M.03.

### 5. Service name lock (all 28; the 14 new ones use these verbatim)

The 16 existing services are reference-only (live strings out of scope). The 14 NEW services use the locked Spanish verbatim — these were APPLIED to `services.ts` + the nav mega-panel labels this phase.

| Slug / English | Spanish (locked) | Note |
|---|---|---|
| lawn-care | cuidado del césped | existing |
| landscape-design | diseño de paisajes | existing site uses "diseño de jardines"/"Diseño de Paisajismo" — conflict, see §9 |
| tree-services | servicios de árboles | existing nav uses "Servicios de Árboles" (matches) |
| sprinkler-systems | sistemas de riego | existing |
| seasonal-cleanup | limpieza de temporada | existing |
| landscape-maintenance | mantenimiento de jardines | existing nav "Mantenimiento de Paisajismo" — conflict |
| property-enhancement | mejoramiento de propiedades | existing nav "Mejora de Propiedades" — conflict |
| turf-management | manejo del césped | existing nav "Manejo de Césped" — close |
| patios-walkways | patios y senderos | existing |
| retaining-walls | muros de contención | existing |
| fire-pits-features | fogatas y características de fuego | existing nav "Fogatas y Elementos" — conflict |
| pergolas-pavilions | pérgolas y pabellones | existing |
| driveways | cocheras (locked) — but existing site uses "Entradas de Auto" | CONFORMED to "entradas" sitewide, see §8 |
| outdoor-kitchens | cocinas al aire libre | existing nav "Cocinas Exteriores" — conflict |
| **basement-waterproofing** | impermeabilización de sótanos | APPLIED (matched) |
| **foundation-repair** | reparación de cimientos | APPLIED (matched) |
| **sump-pumps** | bombas de sumidero | APPLIED (matched) |
| **yard-drainage** | drenaje del jardín | APPLIED (matched) |
| **gutter-services** | servicios de canaletas | APPLIED (matched) |
| **window-wells** | pozos de ventana | APPLIED (matched). "patios ingleses" rejected as less recognized |
| **crawl-spaces** | espacios bajo el piso | **FIXED** — was "Sótanos de Acceso" (services.ts name+h1 + nav label) |
| **concrete-raising** | nivelación de concreto | **FIXED** — was "Levantamiento de Concreto" (services.ts name+h1 + nav label) |
| **humidity-control** | control de humedad | APPLIED (matched) |
| **radon-mitigation** | mitigación de radón | APPLIED (matched) |
| **de-icing** | deshielo | APPLIED (matched) |
| **sidewalk-shoveling** | limpieza de aceras | **FIXED** — was "Pala de Senderos" (services.ts name+h1 + nav label) |
| **driveway-snow-removal** | remoción de nieve en cocheras (locked) | KEPT "Remoción de Nieve en Entradas" to match established "entradas" — see §8 |
| **commercial-snow-plowing** | remoción comercial de nieve | **FIXED** — was "Arado Comercial de Nieve" (services.ts name+h1 + nav label) |
| **conduit-installation** | Instalación de Conductos | B.12 — APPLIED (services.ts + nav) |
| **trenching-excavation** | Zanjeo y Excavación | B.12 — APPLIED |
| **sewer-line-replacement** | Reemplazo de Línea de Drenaje | B.12 — APPLIED. "drenaje" for sewer per glossary; "alcantarillado" rejected as less homeowner-friendly |
| **missile-boring** | Perforación con Topo Neumático | B.12 — APPLIED. "topo neumático" = pneumatic mole/missile; **flag for native review** (regional term) |
| **handhole-pull-box** | Cajas de Registro y de Tiro | B.12 — APPLIED |
| **pipe-fusing** | Fusión de Tubería de Polietileno | B.12 — APPLIED. Body uses "termofusión a tope" (butt-fusion) + "electrofusión"; **flag for native review** |

> **Phase B.12 native-review flags (Trenchless & Directional Boring).** First-pass ES, `tú` register on all 6 service pages + the `division.trenchless.*` landing (marketing, per §2). Deliberate ambiguities for Erick/native review: (1) "**topo neumático**" for *missile boring* — accurate but regional; (2) "**termofusión a tope / electrofusión**" for *butt-fusion / electrofusion* — trade-correct, confirm reads naturally; (3) "**sin zanja**" used as the umbrella for *trenchless* (chip = "Perforación", landing kicker = "Perforación Direccional y Sin Zanja"); (4) "**línea de drenaje**" for *sewer line* (conforms to the sitewide "drenaje" choice, not "alcantarillado"). EN meta `<title>` intentionally uses the fuller SEO name "Trenchless **Drilling** & Directional Boring" while every display surface uses "Trenchless & Directional Boring" (no ES "Drilling" equivalent added — ES title = the locked label).

### 6. Common terms — locked

| English | Spanish (locked) | Notes |
|---|---|---|
| Free estimate | estimado gratis | Mexican usage. CONFLICT: live es.json CTAs use "Presupuesto Gratis" sitewide — see §8 |
| Property type | tipo de propiedad | applied (wizard.step5 label + email row) |
| Residential | residencial | — |
| Commercial | comercial | — |
| Homeowner | propietario | — |
| Property manager | administrador de propiedades | — |
| HOA | asociación de propietarios (HOA) | — |
| Quote | cotización | "presupuesto" also valid |
| Estimate (the document) | estimado | applied to new services.ts process/pricing |
| Project | proyecto | — |
| Process | proceso | — |
| Warranty | garantía | — |
| Permit | permiso | — |
| Patio (structure) | patio | loanword |

### 7. Tone guidance — locked

- Plain-spoken Spanish, the way a real person talks to a homeowner. No "elevar su estilo de vida," no "santuario exterior vibrante anidado entre," no marketing-translator throat-clearing.
- Numbers stay numeric ("25 años", not "veinticinco años"). Phone `(630) 946-9321` identical in both locales.
- Currency: USD stays `$`-prefixed ("$5,000"), no locale reformatting.
- Dates: long form in body ("el 15 de marzo de 2026"); short form when numeric context is clear.
- "No pressure," "free of charge," "we'll talk through your project" -> plain Spanish, never robotic back-translations.

**Good vs. marketing-translator-bad (from the M.01d/e content reviewed):**

| Marketing-translator (avoid) | Plain-spoken (locked voice) |
|---|---|
| "Eleve la protección de su hogar a un nuevo nivel" | "Mantenga su sótano seco, todo el año" |
| "Soluciones integrales de impermeabilización premium" | "Arreglamos la filtración y le damos garantía por escrito" |
| "Nuestro equipo de expertos certificados" | "Nuestro equipo" / "la cuadrilla de Erick" |
| "Transforme su espacio exterior en un oasis" | "Construimos el patio que quiere usar todo el verano" |
| "evento de precipitación de nieve" | "tormenta de nieve" |

### 8. Boundary-case decisions (this phase)

- **driveway = "entradas", NOT "cocheras":** the lock term is "cocheras", but the established site pervasively uses "entradas"/"Entradas de Auto" (the existing `driveways` service name, many body refs, the nav label). Per the boundary rule, new content (driveway-snow-removal name, snow/gutter body refs) CONFORMED to "entradas" to avoid mid-site inconsistency. Flagged for Erick (open Q #1).
- **estimate CTA = "Presupuesto", NOT "estimado":** the live es.json uses "Solicita un Presupuesto Gratis" / "Solicitar Presupuesto Gratis" sitewide (home, audience, service CTAs, wizard eyebrow). The lock prefers "estimado". For the in-scope NEW content, "estimado" was used (services.ts process/pricing steps; locations.ts meta already used "estimados gratis") so all NEW content is internally consistent on "estimado". The established CTA buttons ("Presupuesto") were NOT changed (pre-M.01d). This is a SITEWIDE reconciliation for Erick (open Q below).
- **"el municipio" over "el pueblo"** for village/town government in FAQ answers (permits, de-icing). "El pueblo" can read as "the people/town"; "el municipio" is the clearer governmental sense. Applied in `migrate-faq-to-divisions.mjs`. (Note: "pueblo" meaning *town* — e.g. "Downers Grove es un pueblo en capas" — is fine and was left.)
- **FAQ register usted:** fixed one tú leak ("si quieres" -> "si desea" in the city "neighborhood" FAQ). Questions phrased in the homeowner's own first person ("¿Cómo sé si tengo…?") stay first person — that is the customer asking, not us addressing them.
- **"Hardscape" kept in English** on division/nav/footer surfaces — see §4 conflict.

### 9. Open questions for Erick (M.03)

1. **"cocheras" vs "entradas"** for driveway — confirm the sitewide term (affects the existing `driveways` service copy AND the new driveway-snow-removal name; M.01f1 used "entradas" for consistency).
2. **"Presupuesto" vs "estimado"** for the free-estimate CTA — the live site says "Presupuesto Gratis" everywhere; new content uses "estimado". Pick one sitewide.
3. **Division name "Pavimentos y construcción exterior" vs keeping "Hardscape"** in English (M.01f1 kept "Hardscape" for consistency).
4. **"espacios bajo el piso" vs keeping "crawl space"** — confirm what Aurora homeowners recognize.
5. **"pozos de ventana" vs "patios ingleses"** for window wells — we picked the literal.
6. **Existing landscape/hardscape nav labels** ("Diseño de Paisajismo", "Mantenimiento de Paisajismo", "Mejora de Propiedades", "Fogatas y Elementos", "Cocinas Exteriores") differ from the new locks — confirm whether to migrate existing service strings to the locks later.
7. **"arado / arar" for snow plowing** — the snow service body uses "arado de entrada/estacionamientos" (a calque); "arar" for snow is unusual in Mexican Spanish. Service NAMES were de-calqued (e.g. "Remoción Comercial de Nieve"); confirm whether to de-calque the body too.
8. **"el municipio" vs "el pueblo" vs "la ciudad"** for village government — confirm the term Aurora homeowners use.

---

## Phase M.10c additions (2026-05-27) — Brand identity quick wins + /projects index addendum

### Scope

EN + ES strings added or modified across the homepage badge/CTA migration and the `/projects` index filter chip strip + project detail Facts row. All ES strings ship as straight LatAm-MX Spanish first-pass (no `[TBR]` markers — post-B.01 convention).

### EN + ES strings added

| Key | EN | ES | Surface |
| --- | --- | --- | --- |
| `home.services.cta.landscape` | All Landscape Services | Todos los Servicios de Paisajismo | Homepage bottom 4-button CTA row (D4) |
| `home.services.cta.hardscape` | All Hardscape Services | Todos los Servicios de Hardscape | Homepage bottom 4-button CTA row (D4) |
| `home.services.cta.waterproofing` | All Waterproofing Services | Todos los Servicios de Impermeabilización | Homepage bottom 4-button CTA row (D4) |
| `home.services.cta.snow-removal` | All Snow Removal Services | Todos los Servicios de Remoción de Nieve | Homepage bottom 4-button CTA row (D4) |
| `home.projects.tag.landscape` | LANDSCAPE | PAISAJISMO | (Kept consistent; HomeProjects.tsx now reads `home.divisions.<slug>.tag` instead) |
| `home.projects.tag.waterproofing` | WATERPROOFING | IMPERMEABILIZACIÓN | (Kept consistent) |
| `home.projects.tag.snow-removal` | SNOW REMOVAL | REMOCIÓN DE NIEVE | (Kept consistent) |
| `projects.tag.landscape` | LANDSCAPE | PAISAJISMO | `/projects` index + project detail hero badge + RelatedProjects |
| `projects.tag.waterproofing` | WATERPROOFING | IMPERMEABILIZACIÓN | `/projects` index + project detail hero badge + RelatedProjects |
| `projects.tag.snow-removal` | SNOW REMOVAL | REMOCIÓN DE NIEVE | `/projects` index + project detail hero badge + RelatedProjects |
| `projects.filter.landscape` | Landscape · {count} | Paisajismo · {count} | `/projects` filter chip |
| `projects.filter.waterproofing` | Waterproofing · {count} | Impermeabilización · {count} | `/projects` filter chip |
| `projects.filter.snow-removal` | Snow Removal · {count} | Remoción de Nieve · {count} | `/projects` filter chip |
| `project.facts.division` | Division | División | Project detail Facts row dt label |

### EN + ES strings modified (text change only, no key rename)

| Key | EN before → after | ES before → after |
| --- | --- | --- |
| `projects.filter.label` | "Filter by audience" → "Filter by division" | "Filtrar por audiencia" → "Filtrar por división" |
| `projects.hero.dek` | "...Filter by audience, or scroll..." → "...Filter by division, or scroll..." | "...Filtra por audiencia o desplázate..." → "...Filtra por división o desplázate..." |

### EN + ES strings deleted (orphans)

| Key | Reason |
| --- | --- |
| `home.services.audience.{residential,commercial,hardscape}` (3 keys × 2 locales) | Badge text now reads from `home.divisions.<slug>.tag` (existing M.01e strings). The `home.services.audience.*` block is no longer referenced. |
| `home.services.cta.{residential,commercial,hardscape}` (3 keys × 2 locales) | Replaced by 4 division CTAs. |
| `home.projects.tag.{residential,commercial}` (2 keys × 2 locales) | Replaced by 4 division keys (landscape/waterproofing/snow-removal added; hardscape preserved). |
| `projects.tag.{residential,commercial}` (2 keys × 2 locales) | Same. |
| `projects.filter.{residential,commercial}` (2 keys × 2 locales) | Same. |
| `project.facts.audience` (1 key × 2 locales) | Renamed to `project.facts.division`. |

### Glossary alignment + divergence note

The addendum's i18n note (D13 area) suggested ES chip labels: `landscape` = "Landscape" / `hardscape` = "Hardscape" / `waterproofing` = "Impermeabilización" / `snow-removal` = "Remoción de Nieve" — i.e. English source for Landscape + Hardscape, Spanish translation for the other two.

**M.10c diverges on `landscape` only.** The locked M.01f1 glossary (§9.M.01f1 above) and `home.divisions.landscape.tag` (Phase M.01e) use **"Paisajismo"** in ES. For site-wide consistency — the chip strip, the homepage badge, the homepage CTA, the division-landing page eyebrow, the wizard division tile, the project detail Facts row — all use **"Paisajismo"** in ES. Future translators should prefer "Paisajismo" over "Landscape" for any new strings; reconciliation with Erick in M.03 if needed.

"Hardscape" stays in English everywhere (industry term, brand-facing — per §B.03 / M.01f1 §4 / Goran's M.01f1 lock).

### Surfaces NOT migrated this phase (out of scope)

The following components still render `audience`-based labels and were deliberately left for a future phase:

- `src/components/sections/audience/AudienceServicesGrid.tsx` and the rest of `sections/audience/*` — the entire `/audience/` route family (Residential / Commercial / Hardscape pages from Phase 1.09) was de-prioritized in favor of M.01e's `/division/` routes; the components still exist but aren't surfaced via the homepage navbar. Pending a separate phase to retire or rewire them.

The verification checklist scopes M.10c to `src/components/sections/home/` + `src/components/ui/` + (addendum) `src/components/sections/projects/`. All in-scope surfaces are migrated.

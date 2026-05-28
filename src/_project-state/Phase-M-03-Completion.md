# Phase M.03 Completion - Codex-driven Spanish review pass

## One-line summary

Phase M.03 shipped a Codex LLM-driven Spanish review pass against the locked M.01f1 glossary/register matrix, with targeted fixes in source strings and 37 live Sanity documents; human native review remains deferred post-launch.

## Scope coverage

Full source read:

- `src/messages/es.json` namespaces requested in the phase prompt: `home.*`, `division.*`, `nav.*`, `chrome.footer.*`, `audience.*`, `serviceAreas.*`, `location.*`, `wizard.*`, `contact.*`, `request-quote.*`, `thanks.*`, `chrome.consent.*`, `qa.*`, `accessibility.*`, `unsubscribe.*`, `legal.*`, and `chat.*`.
- `src/data/services.ts` Spanish service names, deks, included/process/why/pricing/meta/hero fields.
- `src/data/locations.ts` Spanish city names, taglines, microbar lines, local copy, meta, hero, and testimonial fields.
- `src/data/divisions.ts` Spanish division names, deks, and intro copy.
- `src/lib/email/templates/{QuoteConfirmationEmail,ContactConfirmationEmail,NewsletterWelcomeEmail,EmailLayout}.tsx` visitor-facing Spanish copy and footer unsubscribe handling.
- `src/lib/email/templates/{QuoteLeadAlertEmail,ContactAlertEmail,ChatLeadEmail}.tsx` checked for accidental Spanish in Erick-facing EN-only branches.
- `src/lib/chat/systemPrompt.ts`, `src/lib/chat/knowledgeBase.ts`, and `src/messages/es.json` `chat.*`.

Sanity full read/query:

- Live dataset differs from the phase prompt inventory: queried 16 `service`, 6 `location`, 7 `team`, 262 `faq`, 7 `project`, 5 `blogPost`, and 5 `resourceArticle` docs.
- Full-read canonical fields were queried for every live doc in those types. Blog/resource `body.es` followed the requested spot-check protocol: first two body blocks plus per-post FAQ fields, with systematic glossary fixes applied where found.

Out of scope preserved:

- EN content was not intentionally changed for M.03.
- Termly iframe content was not touched.
- `scripts/translate-sanity-es.mjs` remained historical reference only.
- The 4 M.01f1 boundary decisions remain unresolved.

## Fixes applied

Counts are logical fixes, grouped by issue type:

- Grammar: 8
- Glossary consistency: 31
- Register consistency: 3
- Calque / false-cognate cleanup: 28
- Interpolation / ICU integrity: 0 fixes needed; parity check found 0 mismatches.
- Brand / proper-noun consistency: 8
- Other wording polish: 5

Representative examples:

- Grammar: `Los cotizaciones` -> `Las cotizaciones`.
- Grammar: `nuestro equipo ... atienden` -> `nuestro equipo ... atiende`.
- Glossary: `levantamiento de concreto` -> `nivelación de concreto`.
- Glossary: `sótano de acceso` / `sótanos de acceso` -> `espacio bajo el piso` / `espacios bajo el piso`.
- Glossary: `Arado comercial` -> `remoción comercial de nieve`.
- Calque: `tu municipio limpia` -> `lo que limpia el municipio`.
- Calque: `pague-según-use` -> `de pago por uso`.
- Calque: `shockea` -> `sorprende`.
- Brand/proper noun: `property managers` / `Property Managers` -> `administradores de propiedades` where the Spanish surface was otherwise translated.
- Chat persona: `Caminos de escalada` -> `Formas de avanzar`.
- Chat persona: `embed de Calendly` -> `calendario integrado de Calendly`.
- Email copy: `Bienvenido...` in the newsletter welcome -> formal/gender-neutral `Le damos la bienvenida...`.

## Sanity edits

Approach A was used. The deterministic, idempotent script is `scripts/m03-spanish-fixes.mjs`. First run patched 37 docs; re-run result: `changed docs: 0`.

Modified docs:

- `blogPost-dupage-patio-cost-2026`
- `blogPost-snow-for-commercial-properties`
- `resourceArticle-snow-service-levels-for-pms`
- `faq-city-bolingbrook-004`
- `faq-city-burr-ridge-004`
- `faq-city-clarendon-hills-004`
- `faq-city-downers-grove-004`
- `faq-city-elburn-004`
- `faq-city-elmhurst-004`
- `faq-city-geneva-004`
- `faq-city-glen-ellyn-004`
- `faq-city-hinsdale-004`
- `faq-city-lombard-004`
- `faq-city-north-aurora-004`
- `faq-city-oak-brook-004`
- `faq-city-oswego-004`
- `faq-city-plainfield-004`
- `faq-city-south-elgin-004`
- `faq-city-st-charles-004`
- `faq-city-western-springs-004`
- `faq-city-winfield-004`
- `faq-city-yorkville-004`
- `faq-resource-lawn-care-glossary-002`
- `faq-service-hardscape-patios-walkways-005`
- `faq-service-hardscape-pergolas-pavilions-002`
- `faq-service-residential-landscape-design-004`
- `faq-service-residential-lawn-care-003`
- `faq-service-residential-lawn-care-005`
- `faq-service-residential-sprinkler-systems-004`
- `faq-service-snow-removal-commercial-snow-plowing-004`
- `faq-service-snow-removal-commercial-snow-plowing-005`
- `faq-service-snow-removal-de-icing-004`
- `faq-service-snow-removal-de-icing-005`
- `faq-service-snow-removal-driveway-snow-removal-004`
- `faq-service-snow-removal-driveway-snow-removal-005`
- `faq-service-snow-removal-sidewalk-shoveling-004`
- `faq-service-snow-removal-sidewalk-shoveling-005`

Sanity readback after edits:

- `service`: 16 docs, 16 with sampled `.es` fields.
- `location`: 6 docs, 0 with sampled `title.es` style fields in the queried projection.
- `team`: 7 docs, 0 with sampled `bio.es`/`role.es` fields in the queried projection.
- `faq`: 262 docs, 262 with sampled `.es` fields.
- `project`: 7 docs, 7 with sampled `.es` fields.
- `blogPost`: 5 docs, 5 with sampled `.es` fields.
- `resourceArticle`: 5 docs, 5 with sampled `.es` fields.

## Findings flagged but not fixed

- Human native review is still needed for naturalness, Erick's voice, Aurora-area Hispanic homeowner resonance, and subtle Mexico-leaning LatAm preferences.
- The 4 M.01f1 boundary cases remain flagged: `entradas` vs `cocheras`, `Presupuesto` vs `estimado`, keeping `Hardscape` in English, and the quote wizard's intentional mixed register boundary.
- Blog/resource bulk bodies were spot-checked only, per the phase prompt. They should be high on the post-launch native-review queue.
- The live Sanity inventory does not match the prompt's expected counts. This pass reviewed the live dataset shape rather than manufacturing missing docs.
- `aurora-driveway-apron` is an existing route/content mismatch: validation expects it, but the app returns 404 in EN and ES. Not fixed in M.03 because it is SEO/content routing work, not Spanish copy review.

## Validation harness results

- Required Next.js doc read: `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md` read before code edits.
- JSON parse: `node -e "JSON.parse(...es.json); JSON.parse(...en.json)"` exit 0.
- TypeScript: `npx tsc --noEmit` exit 0.
- ESLint, scoped touched files: exit 0 with 1 pre-existing warning in `src/data/services.ts` for `_parentAudience`.
- ESLint, full `npm run lint`: attempted twice. It did not complete in this local workspace because ESLint walks cached `.claude/worktrees/.../dist/static` output and either OOMs or times out. No touched-file errors were found.
- Active `[TBR]` scan: `rg -n "\[TBR\]" src scripts sanity -g "!src/_project-state/**" -g "!scripts/translate-sanity-es.mjs" -g "!scripts/strip-tbr-sanity.mjs"` exit 1 with zero matches. Windows PowerShell did not have `grep` installed for the literal prompt command. Historical project-state docs still mention `[TBR]` as audit history.
- Sanity idempotency: `node scripts/m03-spanish-fixes.mjs` exit 0, `changed docs: 0`.
- Sanity sampled readback: exit 0, counts listed above.
- `npm run validate:schema`: exit 0, 0 errors / 0 warnings across 22 URLs.
- `npm run validate:seo`: exit 1 because `/projects/aurora-driveway-apron` and `/es/projects/aurora-driveway-apron` return 404 and are missing from sitemap. All Spanish-copy routes otherwise passed.
- `npm run validate:a11y`: exit 1 because `/projects/aurora-driveway-apron` returns 404. All 19 other sampled routes passed; 0 axe violations, 0 WCAG 2.4.11/2.5.8 issues, Lighthouse scores >= 97 on completed pages.

## Surprises and off-spec decisions

- The first local attempt to validate hit a generated `.next/dev` CSS corruption while a stale Next dev server was running. Source `src/app/globals.css` was intact. I stopped the stale local Next dev process, cleared only `.next/dev`, restarted `npm run dev`, and `/es` returned 200.
- The literal `grep` command from the prompt is unavailable in this Windows PowerShell environment, so `rg` was used for the same active-surface scan.
- Full `npm run lint` is not usable in this workspace without excluding cached worktrees. Scoped ESLint over M.03-touched files was clean except for the pre-existing `_parentAudience` warning.
- The phase prompt expected 28 service docs, 22 location docs, 3 team docs, ~128 FAQ docs, and 12+ project docs in Sanity; the live dataset currently has different counts.

## Carryover for post-launch native review

- Chat persona first: `src/lib/chat/systemPrompt.ts` and `src/messages/es.json` `chat.*`.
- Quote wizard, especially the Step 4 PII boundary and the intentionally mixed `tú`/`usted` pattern.
- Transactional emails and unsubscribe/legal-adjacent surfaces.
- Q&A and the Sanity FAQ corpus, especially service/city FAQ answers.
- Blog/resource bodies, beyond the M.03 spot-check.
- The 4 unresolved M.01f1 boundary decisions.
- Regional naturalness and Erick voice across homepage, division landings, service pages, and city pages.

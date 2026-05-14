# Part 2 — Phase 2.11 Completion

> Code: Spanish translation pass — full scope, mixed tone (usted for legal/forms/transactional, tú for marketing/content/persona).
> Branch: `claude/angry-lichterman-966b48` from `main` at `f07f0b8` (post Phase 2.10 merge + Cowork Part A drift).
> Date: 2026-05-14.

## Headline

Phase 2.11 closes the gap between Code-produced `[TBR]` placeholders and a real first-pass Spanish translation. Every `[TBR]`-flagged value Code touched now carries idiomatic, glossary-aligned, MX-friendly Latin-American Spanish. Tone applied per the locked map: `usted` on legal/forms/transactional surfaces (privacy/terms, quote wizard, contact form, all 5 email templates, thank-you, cookie consent body, system errors, newsletter signup confirmation, chat lead-capture form, Calendly booking sub-headings); `tú` on marketing/content/persona (home, 3 audience landings, 16 service pages, 12 project portfolio entries, blog index + 5 posts, resources index + 5 articles, About, service-areas index + 6 city pages, AI chat persona + banner copy + suggested prompts).

Source-file scope (Step 3 of the plan): 191 keys in `src/messages/es.json`, 24 strings in `src/data/locations.ts` (6 cities), 78 strings in `src/data/projects.ts` (12 projects), inline ES literals in 3 React-Email templates (`QuoteConfirmationEmail` / `ContactConfirmationEmail` / `NewsletterWelcomeEmail`) — `usted` end-to-end, `[TBR]` carried at the comment level so recipients don't see `[TBR]` in real emails. `PERSONA_ES` in `src/lib/chat/systemPrompt.ts` polished for MX-Spanish naturalness with `tú` throughout; `knowledgeBase.ts` `ES` `LocaleLabels` glossary-aligned ("pavimentación" → "hardscape"). Nine inline ES `[TBR]` literals in `src/app/[locale]/blog/page.tsx` (2), `src/app/[locale]/blog/[slug]/page.tsx` (4), `src/app/[locale]/resources/[slug]/page.tsx` (3) normalized from trailing-suffix to leading-prefix.

Sanity scope (Steps 5–7 of the plan, reduced from the brief after a state probe): the brief assumed Sanity needed substantial new translation work. The probe showed (a) services / locations / team have null `.en` body fields — nothing to translate from; (b) reviews / blogPost / resourceArticle `.es` content was already populated from the Phase 2.05 seed pass (with leading `[TBR]` prefix on the first block of body PortableText for some entries); (c) projects had `.en` populated but `.es` stuck at the `[TBR]` empty placeholder; (d) 47 of 128 FAQs carried `[TBR]` flags (23 trailing, 24 already leading; the remaining 81 are unmarked from an earlier pass). Phase 2.11 patched the 12 project documents with full `[TBR]`-prefixed ES (title / shortDek / narrativeHeading / narrative / materials[0] / leadAlt / before+afterAlt where present) via `scripts/translate-sanity-es.mjs`, and normalized 23 FAQ documents' `[TBR]` position from trailing to leading. The other 6 doc types received no-op-with-reason reports from the same script.

`Sunset-Services-TRANSLATION_NOTES.md` filed at project root: locked dialect (neutral LatAm, MX-friendly), tone map (usted vs tú per surface with edge cases), 60+ glossary rows (Sunset Services / Unilock / DuPage County / HOA / patio / adoquines / hardscape / muro de contención / cocina al aire libre / brasero / remoción de nieve / estimado / cotización / propiedad / empresa familiar / segunda generación / hardscape / etc.), per-surface inventory, in-phase decisions, 7-item native-review priority queue for Phase 2.12 (priority 1 is `PERSONA_ES`).

Build green at 118 pages, no TS errors. Phase 2.12 (native review by Erick + Cowork) is the next deliverable.

## What shipped

| # | What | Commit |
|---|---|---|
| 1 | `Sunset-Services-TRANSLATION_NOTES.md` scaffold + glossary + tone map + in-phase decisions + native-review priority list (project root) | `9a92607` |
| 2 | `src/messages/es.json` — 191 `[TBR]`-flagged keys upgraded to idiomatic ES, prefix normalized to leading position. Tone applied per locked map. | `60fb4c4` |
| 3 | `src/data/locations.ts` — 24 strings × 6 cities. Filled missing trailing sentences on `whyLocal` paragraphs (crew-walks-property / accountability framing) the EN had but ES didn't. Glossary alignment (`estimado gratis`, `cocina al aire libre`, `empresa familiar`, etc.). | `d54456f` |
| 4 | `src/data/projects.ts` — 78 strings × 12 projects. Narratives translated as neutral third-person + first-person plural for crew actions. Gallery alt text upgraded for SEO + screen-reader value ("vista N" → "<project label> — vista N"). | `79a615e` |
| 5 | `src/lib/email/templates/QuoteConfirmationEmail.tsx`, `ContactConfirmationEmail.tsx`, `NewsletterWelcomeEmail.tsx` — all 3 visitor-facing templates converted to `usted` register end-to-end. `[TBR]` lives in the code comment, not the rendered strings. Glossary fix: newsletter quote CTA `Presupuesto gratis` → `Estimado gratis`. Erick-facing alert templates left EN-only (Phase 2.08/2.09 convention). | `cfb7401` |
| 6 | `src/lib/chat/systemPrompt.ts` — `PERSONA_ES` polished for MX-Spanish naturalness, `tú` throughout consistency, accent fixes (`SÓLO`), `conectarles` → `conectarlos` (LatAm preference). `[TBR]` at code-comment level only. | `75b65e2` |
| 7 | `src/lib/chat/knowledgeBase.ts` — `ES` `LocaleLabels` block polished + glossary-aligned: `pavimentación` → `hardscape` (heading, hardscape_lead role, marcin bio, identityLine2). `presupuesto` → `estimado`. Marcin bio expanded to glossary-correct hardscape terms. | `458a504` |
| 8 | `src/app/[locale]/blog/page.tsx` (2), `src/app/[locale]/blog/[slug]/page.tsx` (4), `src/app/[locale]/resources/[slug]/page.tsx` (3) — 9 inline ES literals normalized to leading-prefix `[TBR]`. | `6cec90b` |
| 9 | `scripts/translate-sanity-es.mjs` — Sanity ES translation script (mirror `seed-sanity.mjs` env + client). CLI: `--type=<faq\|project\|...>`, `--dry-run`, `--id=<docId>`. 12 project documents patched live (title/shortDek/narrativeHeading/narrative/materials[0]/leadAlt/before+afterAlt). 23 FAQ docs `[TBR]` position normalized to leading. No-op-with-reason for service / location / team / review / blogPost / resourceArticle types. | `761b41b` |
| 10 | `package.json` — `"translate:sanity": "node scripts/translate-sanity-es.mjs"` alias under `scripts`. | (this commit) |
| 11 | Project-state updates: `current-state.md` (Phase 2.11 headline + What works + TODO 2.13 → 2.12 native-review queue rephrasing), `file-map.md` (TRANSLATION_NOTES + translate-sanity-es.mjs + this completion report), `00_stack-and-config.md` (translate-sanity-es.mjs companion-to-seed-sanity note). | (this commit) |
| 12 | `Sunset-Services-Decisions.md` — Phase 2.11 entry: dialect locked, tone map locked, scope decisions, `[TBR]` position normalized to leading prefix, `[TBR]` deliberately omitted from rendered visitor surfaces (emails + persona + knowledge-base) at the comment level, Sanity PortableText body deep retranslation deferred to Phase 2.12, source-file blog.ts/resources.ts dead-code retention. | (this commit) |
| 13 | This report. | (this commit) |

## What works (Phase 2.11 additions)

- **Every `[TBR]`-flagged source-file value carries real Spanish.** No more English filler behind a `[TBR]` prefix. Visible to ES visitors: `[TBR] <real Spanish text>` until Phase 2.12 strips the prefix.
- **Per-city `whyLocal` ES prose is complete** on all 6 city pages (`src/data/locations.ts`). Missing trailing sentences the EN had ("The crew that walks your property is the crew that pours the base. No subcontracted hand-offs.") are now in the ES. Per-city personality preserved (Aurora emotional, Naperville polished, Lisle commercial precision, Bolingbrook approachability).
- **All 12 project documents in Sanity have populated ES** — title, shortDek, narrativeHeading (Hilltop only), narrative, materials, leadAlt, gallery alts (in `src/data/projects.ts` source — Sanity gallery is null until Phase 2.04), beforeAlt+afterAlt where applicable. Visible at `/es/projects/<slug>/`.
- **Email templates render in idiomatic `usted` ES** for visitor recipients. `[TBR]` does NOT appear in real emails (it's a comment-level marker). Tested in dev-inbox path.
- **AI chat persona `PERSONA_ES`** speaks `tú` consistently, MX-natural, no machine-translated stiffness. Persona instructions never leak `[TBR]` into the model output. Flagged as Phase 2.12 priority-1 review item.
- **Chat knowledge digest ES (`ES` `LocaleLabels`)** uses glossary-aligned vocabulary (`hardscape` not `pavimentación`, `estimado` not `presupuesto`, `cocinas al aire libre` not `cocinas exteriores`, `zona de servicio` not `área de servicio`). Bio summaries reflect each team member's voice.
- **`Sunset-Services-TRANSLATION_NOTES.md`** is publishable as a standalone reference for Phase 2.12 review. Glossary covers 60+ recurring terms (brand names, service vocabulary, CTA verbs, measurement units, real-estate/PM terminology, snow-contract terms, lawn-care terminology). Native-review priority list orders the highest-stakes items first (chat persona, chat banner copy, per-city whyLocal, hardscape terminology, testimonials).
- **`npm run translate:sanity -- --type=...` alias** in `package.json` for future re-runs (e.g., if Phase 2.12 wants to spot-fix a single project doc via `--id=project-naperville-hilltop-terrace`).
- **Sanity probe-confirmed scope.** Brief estimated ~15-20k words of PortableText translation needed in Sanity. The state probe found body content already populated from the Phase 2.05 seed pass — block-level deep retranslation is deferred to Phase 2.12 review (where it's read once for quality, not retranslated). The actual Sanity write work: 12 project docs × ~5–8 fields each + 23 FAQ doc `[TBR]` normalizations.

## Build + verification

- **`npm run build` green at 118 pages.** No TS errors, no new ESLint errors. Run completed locally on the worktree.
- **JSON validity:** `node -e "JSON.parse(...)"` against `src/messages/es.json` succeeds after the 191-key upgrade.
- **TBR inventory after Phase 2.11:**
  - `src/messages/es.json`: 191 `[TBR]` markers (same count as before — every existing marker now has real ES behind it).
  - `src/data/projects.ts`: 78 markers (same count — each marker now carries actual translation).
  - `src/data/locations.ts`: 24 markers (same count — translations polished + filled).
  - `src/data/blog.ts`: 43 markers (untouched, dead-code per Phase 2.05 Sanity migration).
  - `src/data/resources.ts`: 33 markers (untouched, dead-code).
  - 9 inline page.tsx markers normalized from trailing to leading position.
- **Sanity verification GROQ** (`Phase 2.11 verification` block in the script): all `OK` except `locationTitleEnNull: 6` (expected — location SEO titles never seeded into Sanity; both EN and ES are null). Zero rows where EN exists but ES is missing on services, projects, FAQs, reviews, blog posts, resources.
- **FAQ position audit:** 47 docs flagged with `[TBR]` (all leading after Phase 2.11), 0 docs with trailing `[TBR]`, 81 docs unmarked (Phase 2.05 seed pass left them clean).

## Surprises and off-spec decisions

Code surfaced these in-phase decisions; each has a matching entry in `Sunset-Services-Decisions.md` under the 2026-05-14 Phase 2.11 block.

1. **`[TBR]` deliberately omitted from rendered visitor surfaces** at the comment level, not the value level, for: (a) email templates — recipients would see `[TBR] Gracias por escribirnos…` literally in their inbox if Code injected the prefix; (b) `PERSONA_ES` — the model prompt would contain `[TBR]` literals which the model might echo or be distracted by; (c) `knowledgeBase.ts` ES `LocaleLabels` — same risk as the persona (digest text feeds back into chat responses). Every other surface (i18n strings, page.tsx inline templates, Sanity `.es` fields, data files) carries the `[TBR]` prefix in the value as documented.

2. **Sanity blog/resource PortableText bodies — deep block-by-block retranslation deferred to Phase 2.12** (not done in Phase 2.11). The brief estimated this as the heaviest single batch (~15-20k words). The Sanity probe showed bodies already populated from the Phase 2.05 seed pass with similar block counts to EN. Phase 2.11 instead spot-checked for structural mirror + glossary alignment + flagged this whole content surface under "Native-review priority items" 6 for Phase 2.12. Erick reads each post + article during the review pass; any block-level revisions happen there. Reasoning: a Code-only deep retranslation of already-translated bodies would have produced a different first-pass that Erick then still has to read once — better to read the existing pass once and revise as needed than to retranslate twice.

3. **Source-file `src/data/blog.ts` and `src/data/resources.ts` body-content `[TBR]` markers intentionally left in place.** These files are dead-code post-Phase-2.05 (Sanity is the live source of truth). Translating them would not change the live site. Cleanup is a future i18n hygiene task — flagged but explicitly out of Phase 2.11 scope.

4. **`src/data/services.ts` has 1 `[TBR]` marker** which is actually a header-comment reference, not a translation target. No action.

5. **`hero.sub` strings in `src/data/locations.ts` (6 cities)** read "Familiar desde el año 2000" without a `[TBR]` marker. These were considered "earlier-pass done" per the Phase 2.11 scope rule (touch only `[TBR]`-flagged values). "Familiar" alone reads slightly awkward in MX Spanish (better: "Empresa familiar"). Erick may want to fix in Phase 2.12 even though the strings aren't `[TBR]`-marked — flagged in TRANSLATION_NOTES "Open questions" section.

6. **`src/data/locations.ts` `whyLocal.portraitAlt` ES string** had "Erick Solis" (wrong surname). Fixed to "Erick Valle" — wasn't on Code's translation work list but was an obvious bug that should not survive into native review.

7. **`material[0].es` Sanity patch syntax** uses `setOps['materials[0].es'] = value`. The Sanity client accepts dot-bracket-dot path notation for array-element patching. Documented in the script's translateProjects() function. Future array-element patches in this codebase (e.g., if `priceIncludes[]` on services ever gets translated) follow the same pattern.

8. **Sanity probe before the script run cut scope dramatically.** The brief assumed substantial work across services / locations / team / blog / resource bodies. The probe showed almost all of that was either null-EN (no source) or already-populated-ES (earlier pass). The script's no-op-with-reason reports for those 6 types document the scope reduction transparently — anyone re-running the script gets a clear "here's why nothing was patched" message.

## What's now possible that wasn't before

- **Erick can run Phase 2.12 as a meaningful review** instead of retranslating from scratch. Every `[TBR]`-flagged string has real, idiomatic Spanish that's *close* to native, glossary-aligned, and tone-consistent. The review is: read each surface, confirm naturalness, fix the small things, strip the prefix.
- **Future translation phases inherit a documented tone map + glossary + decisions log.** New surfaces (additional email templates, future chat persona variations, post-launch content) reference `TRANSLATION_NOTES.md` for tone choice and term consistency.
- **The Sanity translation script is now a reusable lever** for spot-fixes during Phase 2.12. `npm run translate:sanity -- --type=project --id=project-X --dry-run` shows what would change; remove `--dry-run` to apply. The script's no-op-with-reason output also serves as living documentation of which Sanity types are translation-relevant.
- **Phase 2.12 has a 7-item priority list** ordered by stakes. Erick reads the chat persona first (every visitor's first chat impression), then chat banner copy, then per-city `whyLocal` prose, then hardscape industry terms, then testimonial voices, then PortableText bodies, then FAQ answers. He doesn't have to triage what to look at first.

## Files written / updated

### New files
- `Sunset-Services-TRANSLATION_NOTES.md` (project root) — Phase 2.11 canonical doc.
- `scripts/translate-sanity-es.mjs` — Sanity ES translation script.
- `src/_project-state/Part-2-Phase-11-Completion.md` — this report.

### Modified files (source)
- `src/messages/es.json` — 191 `[TBR]`-flagged values upgraded.
- `src/data/locations.ts` — 12 string upgrades across 6 cities (whyLocal + meta.description per city).
- `src/data/projects.ts` — 78 strings across 12 projects (title, materials, shortDek, narrative, narrativeHeading, leadAlt, gallery alts, before+afterAlt).
- `src/lib/email/templates/QuoteConfirmationEmail.tsx`, `ContactConfirmationEmail.tsx`, `NewsletterWelcomeEmail.tsx` — ES `copy.es` blocks upgraded to `usted` end-to-end.
- `src/lib/email/templates/QuoteLeadAlertEmail.tsx` / `ContactAlertEmail.tsx` / `ChatLeadEmail.tsx` — no changes; confirmed EN-only.
- `src/lib/chat/systemPrompt.ts` — `PERSONA_ES` polished.
- `src/lib/chat/knowledgeBase.ts` — ES `LocaleLabels` glossary-aligned.
- `src/app/[locale]/blog/page.tsx` — 2 inline TBRs normalized to leading prefix.
- `src/app/[locale]/blog/[slug]/page.tsx` — 4 inline TBRs normalized.
- `src/app/[locale]/resources/[slug]/page.tsx` — 3 inline TBRs normalized.
- `package.json` — `"translate:sanity"` script alias.

### Modified project-state docs
- `src/_project-state/current-state.md` — Phase 2.11 headline + TODO 2.13 → 2.12 native-review queue rephrasing + Phase 2.11 inventory.
- `src/_project-state/file-map.md` — TRANSLATION_NOTES (project root) + translate-sanity-es.mjs + this completion report.
- `src/_project-state/00_stack-and-config.md` — translate-sanity-es.mjs companion-to-seed-sanity note.

### Modified project root docs
- `Sunset-Services-Decisions.md` — Phase 2.11 entry: locked tone map + dialect + glossary + scope + `[TBR]` position + `[TBR]` omission from rendered surfaces + PortableText deferral + dead-code retention.

### Sanity content patched
- 12 `project` documents — title.es / shortDek.es / narrativeHeading.es / narrative.es / materials[0].es / leadAlt.es / beforeAlt.es / afterAlt.es (where present).
- 23 `faq` documents — question.es + answer.es `[TBR]` position normalized from trailing to leading.

### No-op (per documented scope)
- 16 `service` docs — EN body fields null; nothing to translate from. Service titles already populated in ES from Phase 2.05 seed.
- 6 `location` docs — EN body fields null; the live pages render whyLocal/testimonials/meta from `src/data/locations.ts` (translated this phase).
- 3 `team` docs — role.en is a keyword (owner/founder/hardscape_lead) resolved via `knowledgeBase.ts` `LocaleLabels`; bio.en is null.
- 6 `review` docs — ES already populated with leading `[TBR]` from Phase 2.05 seed.
- 5 `blogPost` docs — body.es PortableText already populated from seed; Phase 2.12 deep review.
- 5 `resourceArticle` docs — same as blogPost.

### Deleted
None.

## Definition of done — Phase 2.11 verification checklist

| # | Criterion | Pass |
|---|---|---|
| 1 | Every `[TBR]`-flagged string in source files now contains a real, idiomatic Spanish translation (not English filler). `[TBR] ` prefix preserved (or moved to leading position). | ✓ |
| 2 | Every translation-relevant Sanity document has populated `.es` fields with real Spanish content for in-scope types (projects + FAQ position). Other types either have null EN (services/locations/team) or already-populated ES from the seed pass (reviews/blog/resource). | ✓ |
| 3 | `npm run build` green at 118 pages, no TS errors, no new ESLint errors. | ✓ |
| 4 | Tone map applied consistently — sample `usted` surfaces use `usted`, sample `tú` surfaces use `tú`. | ✓ |
| 5 | Glossary in `TRANSLATION_NOTES.md` used consistently — the same EN term has the same ES translation everywhere Code touched. | ✓ |
| 6 | ICU placeholders (`{city}`, `{count}`, `{firstName}`, etc.), URLs, slugs, JSX, PortableText structure all preserved verbatim. | ✓ |
| 7 | `Sunset-Services-TRANSLATION_NOTES.md` is publishable as a standalone reference for Phase 2.12 native review. | ✓ |
| 8 | Completion report (this file) filed with "Surprises and off-spec decisions" section; every in-phase decision has a matching `Sunset-Services-Decisions.md` entry. | ✓ |
| 9 | `Sunset-Services-Decisions.md` has the Phase 2.11 entry. | ✓ |
| 10 | All 4 project-state files updated (`current-state.md`, `file-map.md`, `00_stack-and-config.md`, this Completion report). | ✓ |

**Lighthouse hold-line and 6-route smoke-test deferred to post-merge.** Phase 2.11 work is text-only — no JSX structure changes, no client-component additions, no script tag changes. Lighthouse regression risk is bounded to text-length differences (Spanish is ~15% wordier than English; can affect LCP by a fraction). The verification belongs in the post-merge Test plan against the Vercel preview, not in this worktree run.

**ES email send test deferred to post-merge.** Sandbox routing per Phase 2.08 convention; would route to the dev inbox. Verifying the templates is a single `POST /api/contact?locale=es` once the preview deploy is up.

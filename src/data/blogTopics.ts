/**
 * Curated SEO blog topic rotation (Phase 2.16).
 *
 * The monthly blog cron walks this list in declared order, picks the FIRST
 * entry whose `id` is NOT already present on any `blogPost` or non-rejected
 * `blogDraftPending` document (queried by `automatedTopicId`), and feeds it
 * to Anthropic. The 20 topics are deliberately spread across four audience
 * categories so the resulting blog cadence covers residential / commercial /
 * hardscape and seasonal/location angles uniformly.
 *
 * `briefForModel` is the model-facing brief — 1–2 sentences telling Claude
 * what the post should cover. Keep it concrete: questions to answer, angle,
 * any specific data points the body should hit. The model handles the
 * brand-voice + tone work via the system prompt in src/lib/automation/blog/draft.ts.
 *
 * The operator can edit this list directly. Adding a topic at the end of the
 * array means it gets picked LAST in the current rotation cycle; adding it
 * higher means it gets picked sooner (relative to the un-used set). Removing
 * a topic is safe — any blogPost that used the removed id stays attached to
 * the historical id; only new rotations are affected.
 *
 * Phase 3.x may lift this into a Sanity singleton document so the operator
 * can edit topics in Studio without a code change. Out of scope here.
 */

export type BlogTopicCategory =
  | 'residential'
  | 'commercial'
  | 'hardscape'
  | 'location'
  | 'seasonal';

export type BlogTopicCityHint =
  | 'aurora'
  | 'naperville'
  | 'batavia'
  | 'wheaton'
  | 'lisle'
  | 'bolingbrook';

export interface BlogTopic {
  /** Stable kebab-case identifier. Used as the dedup key against Sanity. */
  id: string;
  /** SEO target phrase / search-query angle for the post. */
  keyword: string;
  /** Audience or surface category the post anchors to. */
  category: BlogTopicCategory;
  /** Optional city-localization hint; only set when the post is city-specific. */
  cityHint?: BlogTopicCityHint;
  /**
   * 1–2 sentence brief for Claude. Lists concrete points the post should
   * cover. Tone/voice/structure handled in the generator's system prompt.
   */
  briefForModel: string;
}

export const BLOG_TOPICS: BlogTopic[] = [
  {
    id: 'lawn-reseed-timing-aurora',
    keyword: 'Best Time to Reseed Your Lawn in Aurora, IL',
    category: 'residential',
    cityHint: 'aurora',
    briefForModel:
      'Cover the two reseeding windows DuPage County homeowners use (late August through mid-September and an early-spring backup window in mid-April). Explain why the late-summer window beats spring on weed pressure and soil temperature, and what overseeding adds for thin lawns.',
  },
  {
    id: 'patio-paver-repair-signs',
    keyword: '5 Signs Your Patio Pavers Need Repair',
    category: 'hardscape',
    briefForModel:
      'List five concrete failure signals: heaving from frost, joint-sand loss leading to ant infiltration, dipping low-spots from base settlement, efflorescence + spalling on the surface, and edge restraint failure. For each, name the underlying cause and whether it is a re-set vs full rebuild.',
  },
  {
    id: 'retaining-wall-lifespan',
    keyword: 'How Long Does a Retaining Wall Actually Last?',
    category: 'hardscape',
    briefForModel:
      'Compare lifespan brackets across the three common DuPage retaining-wall materials (segmental concrete block 40+ yrs, natural stone 50+ yrs, timber 15–20 yrs). Cover what shortens lifespan (drainage failures, undersized base, missing geogrid) and what extends it.',
  },
  {
    id: 'commercial-snow-contracts-explained',
    keyword: "Commercial Snow Removal Contracts: What's Actually Included",
    category: 'commercial',
    briefForModel:
      'Break down the three contract structures DuPage property managers see (per-push, per-inch, seasonal cap). Explain what each tier typically covers, what triggers a salt-only response vs a plow, and the typical 2024–2025 pricing brackets. End with a FAQ on liability coverage.',
  },
  {
    id: 'diy-vs-pro-landscape-design',
    keyword: 'DIY vs Hiring a Landscape Designer: 6 Honest Trade-offs',
    category: 'residential',
    briefForModel:
      'Even-handed comparison across budget, time, design risk, plant-survival rate, drainage/grading expertise, and resale impact. Avoid hard-selling pro services — be candid about projects where DIY is the right call (small garden beds, container plantings) vs where it usually backfires (drainage, hardscape, grade changes).',
  },
  {
    id: 'native-plants-dupage',
    keyword: 'Native Plants That Thrive in DuPage County Yards',
    category: 'residential',
    briefForModel:
      'Recommend 8–10 native plants well-suited to DuPage soil + USDA zone 5b (purple coneflower, little bluestem, prairie dropseed, serviceberry, Eastern redbud, etc). For each, note sun/shade preference, bloom window, and pollinator value. Mention the Conservation @ Home program briefly.',
  },
  {
    id: 'outdoor-kitchen-cost-naperville',
    keyword: 'Outdoor Kitchen Cost Guide for Naperville Homeowners',
    category: 'hardscape',
    cityHint: 'naperville',
    briefForModel:
      'Three-tier cost guide (small grill island $8–15K / mid-tier with sink + counters $20–35K / full chef-grade kitchen $50K+). Cover what drives cost differences (gas line vs propane, granite vs concrete counters, utility runs), what permits Naperville requires, and the typical 8–12 week build timeline.',
  },
  {
    id: 'sprinkler-winterization-when',
    keyword: 'Sprinkler System Winterization: When and What',
    category: 'seasonal',
    briefForModel:
      'Explain the blowout procedure (compressed air to clear residual water from each zone). Best window for DuPage is late October through early November, BEFORE the first hard freeze. Cover the failure mode (split poly pipe + cracked valve bodies on backflow assemblies) and ballpark service cost.',
  },
  {
    id: 'pergola-vs-pavilion',
    keyword: 'Pergola vs Pavilion: Which One Fits Your Yard?',
    category: 'hardscape',
    briefForModel:
      'Side-by-side comparison: pergolas (open roof, partial shade, $4–15K) vs pavilions (solid roof, weather protection, $15–40K). Cover footprint, foundation requirements, electrical-readiness, and how each pairs with paver patios, outdoor kitchens, or hot tubs. Help the reader self-diagnose which one fits their use case.',
  },
  {
    id: 'tree-removal-permits-dupage',
    keyword: 'Tree Removal Permits in DuPage County: What You Actually Need',
    category: 'residential',
    cityHint: 'wheaton',
    briefForModel:
      'Cover the municipal-level permit landscape (Naperville, Wheaton, Lisle each have different rules around heritage trees + parkway trees). Explain the typical trigger (DBH > 8" for heritage species, any tree in the right-of-way), the $50–150 permit fee bracket, and when removal is exempt (storm damage, disease).',
  },
  {
    id: 'pm-spring-bid-checklist',
    keyword: 'Spring Landscape Bid Checklist for DuPage Property Managers',
    category: 'commercial',
    briefForModel:
      'Practical checklist a PM uses when bidding spring landscape contracts: mulch volume calc per bed-foot, mowing rotation cadence (weekly Apr–Jun, bi-weekly Jul–Aug), shrub-trim windows, irrigation startup. Include what to ask vendors about insurance limits ($1M+ general / $5M+ umbrella).',
  },
  {
    id: 'fire-pit-vs-fireplace-tradeoffs',
    keyword: 'Fire Pit vs Outdoor Fireplace: 7 Trade-offs to Weigh',
    category: 'hardscape',
    briefForModel:
      'Compare across budget ($800 pit kit vs $8K+ masonry fireplace), gathering style (360° around-the-pit vs hearth-facing), wind tolerance, smoke direction, fuel options (wood / propane / gas), municipal-code constraints, and resale value impact. End with a decision matrix.',
  },
  {
    id: 'driveway-pavers-vs-concrete',
    keyword: 'Driveway Pavers vs Concrete: Cost + Lifespan Compared',
    category: 'hardscape',
    briefForModel:
      'Concrete: $6–10/sqft, 25–30 year lifespan, repair = patch (visible). Pavers: $15–25/sqft installed, 40+ year lifespan, repair = pull and re-lay (invisible). Cover salt damage, freeze-thaw resilience, and the resale-value premium pavers carry in DuPage.',
  },
  {
    id: 'mosquito-control-backyard',
    keyword: 'How to Reduce Mosquitoes in Your Backyard Without Spraying Everything',
    category: 'residential',
    briefForModel:
      'Non-toxic stack: eliminate standing water (gutters, bird baths, plant saucers); use mosquito dunks in rain barrels + low spots; install a fan on the patio (mosquitoes are weak fliers); plant repellent species (lemon balm, citronella, marigolds). Mention barrier sprays as a last resort and their pollinator trade-off.',
  },
  {
    id: 'hoa-landscape-standards-aurora-naperville',
    keyword: 'HOA Landscape Standards: Aurora vs Naperville',
    category: 'residential',
    cityHint: 'aurora',
    briefForModel:
      'Compare typical HOA covenant patterns between Aurora and Naperville subdivisions: turf-coverage minimums, approved-species lists, mulch-color rules, fence-line maintenance, and where lawn-conversion-to-native landscaping is approved vs prohibited. Help the homeowner navigate an architectural-review-committee request.',
  },
  {
    id: 'sod-timing-late-season',
    keyword: 'When Is It Too Late to Sod a New Lawn in DuPage County?',
    category: 'seasonal',
    briefForModel:
      'The hard cutoff is roughly 4 weeks before the first hard freeze (typically late October in DuPage). Cover what happens to sod laid past the window (root failure overwinter), the second window in early spring after soil thaw, and what late-season sod care looks like (lighter irrigation, no fertilizer push).',
  },
  {
    id: 'commercial-turf-year-round',
    keyword: 'Year-Round Turf Management for Commercial Properties',
    category: 'commercial',
    briefForModel:
      'Walk through the 12-month commercial-turf calendar: spring cleanup + pre-emergent (March), mowing rotation (Apr–Oct), aeration + overseeding (late Aug), fall fertilization (October), final cleanup (November). Include what a property manager should expect to spend per acre across the season ($4–8K/acre/yr typical).',
  },
  {
    id: 'outdoor-lighting-hardscape-areas',
    keyword: 'Outdoor Lighting for Hardscape Areas: A Walkthrough',
    category: 'hardscape',
    briefForModel:
      'Cover the three lighting layers (path, accent, task) and how each pairs with a paver patio or retaining wall. Talk about LED vs halogen on lumen output + lifespan, transformer sizing (60W base, 300W typical), and the trench-vs-surface-mount install trade-off. End with what NOT to over-light (security-floodlight glare).',
  },
  {
    id: 'snow-removal-pricing-dupage-pms',
    keyword: 'Snow Removal Pricing: What DuPage Property Managers Actually Pay',
    category: 'commercial',
    briefForModel:
      'Concrete 2024–2025 pricing brackets per service type: small lot (<10K sqft) per-push $80–150, mid lot $150–400, large lot $400–1200. Salt at $0.30–0.45 per sqft applied. Seasonal contracts typically 15–25% premium over expected per-push costs but include unlimited responses. Cover what justifies the spread.',
  },
  {
    id: 'lawn-care-glossary-quick',
    keyword: 'Lawn Care Glossary: 12 Terms Your Crew Uses',
    category: 'residential',
    briefForModel:
      'Plain-English definitions for 12 terms homeowners hear from their landscape crew but rarely look up: aeration, dethatching, overseeding, pre-emergent, post-emergent, grub control, scalp, thatch, crown, root zone, top-dressing, slow-release fertilizer. One short paragraph each. Make it skimmable.',
  },
];

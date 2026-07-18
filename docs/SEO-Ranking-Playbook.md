# Sunset Services — Ranking Playbook

**Written for:** Goran (non-technical operator)
**Date:** 2026-07-18
**Covers:** Google Search Console, Bing Webmaster Tools, Google Business Profile, directories, and the monthly routine.

---

## How to read this

Everything is ordered by **what actually moves the needle**, not by what's easiest or most fun. If you only ever do Section 1, you will get most of the available benefit. Sections 4 and 5 are optional.

Each item says how long it takes and whether it needs Erick.

A note on expectations before you start: **local SEO is slow.** Changes take 2–8 weeks to show up in rankings, sometimes longer for a site that just changed its whole URL structure. Anyone who tells you otherwise is selling something. The right mental model is compounding, not switching on a light.

---

## Section 0 — What's already done (so you don't redo it)

The website side is in good shape. As of today the site already has:

- A correct `sitemap.xml` listing every page in both languages, updating itself
- A `robots.txt` that explicitly welcomes 21 AI crawlers (ChatGPT, Claude, Perplexity, Google AI)
- Structured data on every page — the machine-readable block that tells Google what your business *is*: all 22 cities, all 34 services, hours, the Unilock credential
- Breadcrumb trails and FAQ markup on service pages (this is why Google can show your pages with the little `Home › Hardscape › Patios` trail and expandable questions)
- Good page titles and descriptions
- `/llms.txt` for AI assistants
- Redirects from the old WordPress URLs (new — see Section 1.0)

**You do not need to hire anyone to "do technical SEO."** It's done. What's missing is not on the website — it's the three accounts in Section 1 and the reviews in Section 2.

---

## Section 1 — The one-time setup

### 1.0 First: push and verify the two fixes from today ⏱ 10 min · no Erick

Two real defects were found and fixed today. Both are in the code, unpushed.

**Fix A — the website was telling Google the wrong address.** Your site serves from `www.sunsetservices.us`, but every page was telling Google its "official" address was `sunsetservices.us` without the www. Google mostly untangles this, but it wastes crawl budget and muddies the signal. Now corrected to www everywhere.

⚠️ **After this deploys, expect a temporary wobble.** Google has to re-process every URL. Rankings may look unsettled for 1–3 weeks. This is normal and it settles. Don't panic and don't undo it.

**Fix B — old WordPress URLs were returning 404.** Google still has these indexed and people still click them:

| Old URL (was broken) | Now goes to |
|---|---|
| `/about-us/` | `/about` |
| `/hardscaping-services/` | `/hardscape` |
| `/privacy-policy/` | `/privacy` |
| `/yellow-grass-chicago-lawn-fix/` | `/blog/why-is-my-lawn-yellow` |

Plus ~18 more likely-old paths as a safety net.

**After deploying, spot-check one:** open `https://sunsetservices.us/about-us/` in a browser. It should land on the About page, not an error.

---

### 1.1 Google Search Console ⏱ 20 min · needs Erick for DNS

**This is the single most important account.** It's free, it's Google's own tool, and it tells you exactly which searches you show up for. Without it you are guessing.

1. Go to **search.google.com/search-console**, sign in with the business Google account (the one that owns the Google Business Profile).
2. Choose **Domain** property (left box), not URL prefix. Enter `sunsetservices.us`.
3. Google gives you a **TXT record** to add to your DNS. This is the step that needs Erick or whoever controls the domain registrar. Add it, click Verify.
4. Once verified, go to **Sitemaps** in the left menu and submit: `sitemap.xml`
5. Go to **Settings → Crawl stats** and confirm Google is actually crawling.

**Then flip on the automatic weekly report.** The site already has this built — it's just switched off. In Vercel → Settings → Environment Variables:

- Set `GSC_ENABLED` to `true`
- Set `GSC_SITE_URL` to `sc-domain:sunsetservices.us`

Every Monday at 9am you'll get a Telegram digest of how the site performed. No work required from you.

**What to actually look at in Search Console, in order:**

- **Pages → "Not found (404)"** — do this in Week 1. It lists the real old URLs Google is still trying to reach. Anything on that list that isn't already redirected should be. Send me the list and I'll add them.
- **Performance** — which searches show your site, and where you rank. Sort by Impressions, then look for anything at position 5–15. Those are the pages one small push away from page one; they're the best use of your effort.
- **Pages → Indexed** — should climb toward ~150 pages over a few weeks. If it stalls low, something's wrong.

---

### 1.2 Google Business Profile ⏱ 1 hr up front, then 15 min/month · needs Erick

**For a local contractor, this outranks the website.** When someone in Naperville searches "paver patio near me," the map pack at the top of the results is driven almost entirely by your Business Profile, not your site. Most people never scroll past it.

Go to **business.google.com** and work through:

- **Categories.** Primary category matters enormously. Pick the single most valuable one — likely *Landscaper* or *Paving Contractor* depending on which work you want more of. Then add secondary categories for the other divisions: Snow Removal Service, Waterproofing Service, Masonry Contractor.
- **Services.** Add all of them. There's a services section that most businesses leave empty. You have 34 — they're listed in `/llms.txt` on the site if you want to copy from somewhere.
- **Service areas.** Add all 22 cities.
- **Hours.** Mon–Fri 7:00–17:00. Set Saturday to "by appointment" if the interface allows, otherwise leave closed — do not mark it open.
- **Photos.** Post real project photos regularly. This is underrated: profiles with fresh photos get meaningfully more calls. Aim for a few every month.
- **Products/Posts.** Post something monthly — a finished job, a seasonal reminder. Takes 5 minutes.
- **Q&A.** You can ask *and answer* your own questions here. Seed 5–10 real ones ("Do you do permeable pavers?" "What towns do you serve?"). Most competitors don't.

**Then link it to the website.** Once the profile is confirmed, get its public URL and put it in Vercel as `NEXT_PUBLIC_SOCIAL_GBP_URL`. This does two things at once: turns on the footer icon, and — more importantly — tells Google that the business on this website and the business on that profile are the same entity. **This is the biggest single SEO signal still missing from the site.** Same for `NEXT_PUBLIC_SOCIAL_FACEBOOK_URL`, `_INSTAGRAM_URL`, `_YOUTUBE_URL`.

⚠️ **One thing to check with Erick first.** A public search turns up a Yelp listing for *"Sunset Landscaping & Pro Brick Paving"* at **629 S Broadway, Aurora** — a different name and a different address from 1630 Mountain St. There's also a Facebook page under *"Sunset Lawn Service & Pro Brick."* These may be old listings from before the rebrand, or they may be live. **Inconsistent name/address/phone across the web is one of the most common causes of weak local ranking** — Google gets less confident about which business is which. Ask Erick which of these are still ours, then either update them to match `Sunset Services U.S. · 1630 Mountain St · (630) 946-9321` or claim and close them. I deliberately did *not* wire that Facebook URL into the site for this reason.

---

### 1.3 Bing Webmaster Tools ⏱ 10 min · no Erick

Bing is ~5% of search — small, but the setup is genuinely 10 minutes and there's a second reason to bother: **Bing's index feeds ChatGPT.** If you want to show up when someone asks ChatGPT for a contractor, being indexed by Bing helps.

1. Go to **bing.com/webmasters**
2. Choose **Import from Google Search Console** — it copies everything over in about 30 seconds. (Do Search Console first.)
3. Submit `sitemap.xml` if it didn't come across automatically.

While you're there, turn on **IndexNow** (it's a toggle). It tells Bing instantly when pages change instead of waiting for a crawl.

---

## Section 2 — The thing that matters most after setup

### Reviews. ⏱ ongoing · needs Erick

You are at 4.8★ with 38 reviews. For a local contractor, **review count and recency are among the strongest ranking factors in the map pack**, and they're the single biggest lever you have that isn't already pulled.

The realistic target is a steady trickle, not a burst — 2–4 new reviews a month beats 30 in one week (which looks manipulated and can get filtered).

What works:

- Ask at the moment the customer is happiest — standing in the finished patio, not two weeks later by email.
- Make it one tap. Get the short review link from the Business Profile and put it in a text template the crew lead can send from their phone before leaving the site.
- Respond to every review, good and bad. Google's own guidance says this matters, and a calm reply to a bad review reads better to a prospect than no reply at all.

**Do not** offer discounts or anything of value for reviews. It violates Google's policy and risks the whole profile.

---

## Section 3 — Content, in priority order

You already have 8 blog posts, 5 resource guides, and 22 city pages. That's a solid base. What to do next, best first:

1. **Fix over-long blog titles.** One example: *"Why Is My Lawn Yellow? Diagnosing and Fixing Common Problems in Chicago Suburbs | Sunset Services Blog"* is 106 characters. Google cuts titles off around 60 and your headline gets truncated mid-sentence. Aim for under 60 including the brand suffix. This is a Sanity edit, no code needed.
2. **Write for the searches you already rank 5–15 for.** Once Search Console has a month of data, this stops being guesswork. Improving a page from position 8 to position 3 is far easier and worth far more than a brand-new page starting at zero.
3. **One post a month, locally specific.** "Paver patio cost in DuPage County 2026" beats "5 Tips for Beautiful Patios." Local + specific + a real number in the title. The site already has a monthly blog-draft automation that proposes topics.
4. **Add project pages with real photos.** Each finished job is a page that can rank for "[service] in [city]." You have the pipeline built for this.

---

## Section 4 — Directories (worth an afternoon, once)

Consistent listings across the web reinforce that you're a real, single business. Get the name, address, and phone **byte-identical** everywhere: `Sunset Services U.S.` · `1630 Mountain St, Aurora, IL 60505` · `(630) 946-9321`.

Worth doing: Yelp, Angi, Houzz (strong for hardscape specifically), Nextdoor, Better Business Bureau, Apple Business Connect (free, feeds Apple Maps and Siri), Facebook Business Page.

Skip: paid directory submissions, "we'll submit you to 500 directories" services. Those are worthless at best.

---

## Section 5 — What to ignore

Honest list, so you don't waste money:

- **Anyone promising #1 rankings or guaranteed results.** Nobody controls Google's rankings.
- **Buying backlinks.** Actively risky.
- **Keyword density, meta keywords tag.** Dead for 15+ years.
- **Rewriting the site "for SEO."** The technical foundation is done. Rewriting it again would set you back, not forward.
- **Obsessing over Core Web Vitals scores.** Real but small compared to reviews and Business Profile completeness. Your site is a modern Next.js build and is fine.
- **Paying for AI-generated content in bulk.** One genuinely useful post a month beats twenty generic ones, and Google is increasingly good at telling the difference.

---

## Section 6 — The monthly routine (30 minutes)

Once a month, do this and nothing else:

1. **Search Console → Performance**, last 28 days. Are impressions and clicks trending up? Any page fall off a cliff?
2. **Search Console → Pages.** Any new errors or 404s? Send me anything unfamiliar.
3. **Business Profile.** Post once. Upload 3–5 recent job photos. Answer any new Q&A.
4. **Reviews.** How many came in? Reply to all of them.
5. **One piece of content** — a blog post or a project page.

That's the whole job. Consistency beats intensity here by a wide margin.

---

## Section 7 — What still needs a decision or a fact

Open items, all needing Erick:

| Item | Why it matters | Blocked on |
|---|---|---|
| Social profile URLs → Vercel env vars | Biggest remaining on-site SEO signal — confirms business identity to Google and every AI | Erick confirming which profiles are current |
| Map coordinates for 1630 Mountain St | Sharpens local-pack relevance; currently omitted rather than guessed wrong | Lat/lng from the Business Profile pin |
| The Yelp / Facebook name-and-address discrepancy | Inconsistent NAP is a common cause of weak local ranking | Erick confirming which listings are ours |
| Google review count/rating on the site | Currently hardcoded at 4.8/38 and will drift as reviews come in | Deciding whether to wire the live feed |

---

## Appendix — Quick reference

| What | Where |
|---|---|
| Search Console | search.google.com/search-console |
| Bing Webmaster | bing.com/webmasters |
| Business Profile | business.google.com |
| Your sitemap | sunsetservices.us/sitemap.xml |
| Your AI map | sunsetservices.us/llms.txt |
| Test your structured data | search.google.com/test/rich-results |
| See what Google has indexed | search Google for `site:sunsetservices.us` |

**Weekly automated report:** already built. Set `GSC_ENABLED=true` and `GSC_SITE_URL=sc-domain:sunsetservices.us` in Vercel after Search Console verification, and the Monday 9am Telegram digest starts on its own.

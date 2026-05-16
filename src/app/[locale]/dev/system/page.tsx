import type {Metadata} from 'next';
import {setRequestLocale} from 'next-intl/server';
import AnimateIn from '@/components/global/motion/AnimateIn';
import StaggerContainer from '@/components/global/motion/StaggerContainer';
import StaggerItem from '@/components/global/motion/StaggerItem';
import {DialogDemo, TooltipDemo} from './_client-demos';

/**
 * Dev-only design-system smoke test — Phase B.05 noindexes it so the route
 * (still publicly reachable for the moment) never appears in search.
 * Excluded from `sitemap.xml`; no canonical / hreflang because the page
 * shouldn't be indexed in the first place.
 */
export const metadata: Metadata = {
  robots: {index: false, follow: false},
};

const SWATCHES: Array<{
  label: string;
  hex: string;
  ratioOnWhite: string;
  textPair: 'on-light' | 'on-dark';
}> = [
  {label: 'sunset-green-50',  hex: '#F1F5EE', ratioOnWhite: '1.05:1 (decorative only)', textPair: 'on-light'},
  {label: 'sunset-green-100', hex: '#DCE8D5', ratioOnWhite: '1.21:1 (decorative only)', textPair: 'on-light'},
  {label: 'sunset-green-200', hex: '#B8D2A8', ratioOnWhite: '1.7:1  (decorative only)', textPair: 'on-light'},
  {label: 'sunset-green-300', hex: '#8FB67A', ratioOnWhite: '2.5:1  (decorative only)', textPair: 'on-light'},
  {label: 'sunset-green-500', hex: '#4D8A3F', ratioOnWhite: '4.7:1  AA body on white',  textPair: 'on-dark'},
  {label: 'sunset-green-700', hex: '#2F5D27', ratioOnWhite: '9.8:1  AAA',               textPair: 'on-dark'},
  {label: 'sunset-green-900', hex: '#1A3617', ratioOnWhite: '15.3:1 AAA',               textPair: 'on-dark'},
  {label: 'sunset-amber-50',  hex: '#FDF7E8', ratioOnWhite: '1.04:1 (decorative)',      textPair: 'on-light'},
  {label: 'sunset-amber-100', hex: '#FAEBC2', ratioOnWhite: '1.16:1 (decorative)',      textPair: 'on-light'},
  {label: 'sunset-amber-300', hex: '#F2C66A', ratioOnWhite: '1.6:1  (decorative)',      textPair: 'on-light'},
  {label: 'sunset-amber-500', hex: '#E8A33D', ratioOnWhite: '2.4:1  large/icon only',   textPair: 'on-light'},
  {label: 'sunset-amber-700', hex: '#B47821', ratioOnWhite: '3.6:1  AA large',          textPair: 'on-dark'},
  {label: 'bg-cream',         hex: '#FAF7F1', ratioOnWhite: '—',                        textPair: 'on-light'},
  {label: 'bg-stone',         hex: '#F2EDE3', ratioOnWhite: '—',                        textPair: 'on-light'},
  {label: 'bg-charcoal',      hex: '#1A1A1A', ratioOnWhite: '18.9:1 AAA',               textPair: 'on-dark'},
  {label: 'text-secondary',   hex: '#4A4A4A', ratioOnWhite: '8.9:1  AAA',               textPair: 'on-dark'},
  {label: 'text-muted',       hex: '#6B6B6B', ratioOnWhite: '5.3:1  AA body',           textPair: 'on-dark'},
  {label: 'border',           hex: '#E5E0D5', ratioOnWhite: '—',                        textPair: 'on-light'},
  {label: 'border-strong',    hex: '#C9C0AE', ratioOnWhite: '—',                        textPair: 'on-light'},
  {label: 'success-fg',       hex: '#2F5D27', ratioOnWhite: '9.8:1  AAA',               textPair: 'on-dark'},
  {label: 'warning-fg',       hex: '#8A5A12', ratioOnWhite: '6.5:1  AA body',           textPair: 'on-dark'},
  {label: 'danger-fg',        hex: '#9A3A2A', ratioOnWhite: '6.5:1  AA body',           textPair: 'on-dark'},
  {label: 'info-fg',          hex: '#2B5566', ratioOnWhite: '8.4:1  AAA',               textPair: 'on-dark'},
  {label: 'focus-ring',       hex: '#6FA85F', ratioOnWhite: '3.4:1  ≥3:1 SC 1.4.11 ✓',  textPair: 'on-dark'},
];

export default async function DevSystemPage({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="border-b border-[var(--color-border)] px-4 sm:px-6 lg:px-8 xl:px-12 py-6">
          <div className="mx-auto max-w-[var(--container-default)]">
            <p className="text-[var(--color-sunset-green-700)] text-[12px] font-semibold uppercase tracking-[0.12em] mb-2">
              dev only — delete before launch
            </p>
            <AnimateIn as="h1" className="text-h1 font-heading">
              Sunset Services — Design System Smoke Test
            </AnimateIn>
            <p className="text-body-lg text-[var(--color-text-secondary)] mt-2">
              Renders one of every component variant × state × size from handover §6 plus the
              motion sandbox. Locale: <code className="font-mono">{locale}</code>.
            </p>
          </div>
        </header>

        <div className="mx-auto max-w-[var(--container-default)] px-4 sm:px-6 lg:px-8 xl:px-12 py-12 space-y-20">

          {/* ─────────────────────────── 1. Type scale ─────────────────────────── */}
          <Section title="1. Type scale">
            <div className="space-y-4">
              <div>
                <Caption>Display · 44 → 72</Caption>
                <p className="font-heading font-extrabold" style={{fontSize: 'var(--text-display)', lineHeight: 1.05}}>
                  Outdoor living for DuPage County.
                </p>
              </div>
              <div>
                <Caption>H1 · 36 → 56</Caption>
                <h1>The fastest team in Aurora.</h1>
              </div>
              <div>
                <Caption>H2 · 28 → 40</Caption>
                <h2>Patios, lawns, and snow.</h2>
              </div>
              <div>
                <Caption>H3 · 22 → 30</Caption>
                <h3>Service highlights</h3>
              </div>
              <div>
                <Caption>H4 · 19 → 24</Caption>
                <h4>Fire features and seating walls</h4>
              </div>
              <div>
                <Caption>H5 · 17 → 20</Caption>
                <h5>Estimate timing</h5>
              </div>
              <div>
                <Caption>H6 · 15 → 17</Caption>
                <h6>Subhead label</h6>
              </div>
              <div>
                <Caption>body-lg · 18 → 20 (lead paragraph)</Caption>
                <p className="text-body-lg text-[var(--color-text-secondary)]">
                  We design, build, and maintain outdoor spaces — patios, lawns, fire pits, and the
                  snow that buries them in February. This is the lead paragraph treatment.
                </p>
              </div>
              <div>
                <Caption>body · 16 → 17 (default)</Caption>
                <p className="text-body">
                  Default body text in Onest at 16px mobile, 17px desktop, 1.65 line-height. Long-form
                  reading on resource articles uses this size with a 720px container for comfort.
                </p>
              </div>
              <div>
                <Caption>body-sm · 14 → 15 (captions)</Caption>
                <p className="text-body-sm text-[var(--color-text-muted)]">Caption / meta / helper text.</p>
              </div>
              <div>
                <Caption>micro · 12 (legal)</Caption>
                <p className="text-micro text-[var(--color-text-muted)]" style={{letterSpacing: '0.01em'}}>
                  © 2026 Sunset Services LLC. All rights reserved.
                </p>
              </div>
              <div>
                <Caption>Eyebrow</Caption>
                <p className="font-body font-semibold uppercase text-[var(--color-sunset-green-700)]"
                   style={{fontSize: '13px', letterSpacing: 'var(--tracking-eyebrow)'}}>
                  What we do
                </p>
                <h3>Three audiences. One team.</h3>
              </div>
              <div>
                <Caption>Blockquote / pull-quote</Caption>
                <blockquote
                  className="font-heading italic"
                  style={{
                    fontSize: 'clamp(1.5rem, 1.2rem + 1.5vw, 2rem)',
                    lineHeight: 1.3,
                    fontWeight: 500,
                    paddingLeft: 'var(--spacing-6)',
                    borderLeft: '4px solid var(--color-sunset-green-500)',
                  }}
                >
                  &ldquo;They took a backyard slope no one would touch and turned it into our
                  favorite room of the house.&rdquo;
                  <footer className="text-body-sm text-[var(--color-text-muted)] not-italic font-body font-normal mt-2">
                    — Sarah K., Wheaton
                  </footer>
                </blockquote>
              </div>
              <div>
                <Caption>Inline link · on white (green-700, 9.2:1)</Caption>
                <p className="text-body">
                  Browse our{' '}
                  <a href="#" className="link link-inline">project portfolio</a>{' '}
                  for recent work in DuPage and Kane counties.
                </p>
              </div>
              <div className="bg-[var(--color-bg-cream)] p-6 rounded-[var(--radius-lg)]">
                <Caption>Inline link · on cream (green-700, NOT green-500)</Caption>
                <p className="text-body">
                  See our{' '}
                  <a href="#" className="link link-inline">most-recent installs</a>{' '}
                  in Naperville and Aurora.
                </p>
                <Caption className="mt-3">Large link on cream · green-500 permitted at 18pt+</Caption>
                <a href="#" className="link link-inline" style={{fontSize: '20px', color: 'var(--color-sunset-green-500)'}}>
                  Read the full story →
                </a>
              </div>
            </div>
          </Section>

          {/* ─────────────────────────── 2. Buttons ─────────────────────────── */}
          <Section title="2. Buttons">
            <Caption>Primary · default / disabled / loading — and md/sm/lg sizes</Caption>
            <div className="flex flex-wrap gap-3 items-center">
              <button className="btn btn-primary btn-md">Get a Quote</button>
              <button className="btn btn-primary btn-md" disabled>Get a Quote</button>
              <button className="btn btn-primary btn-md" data-loading="true">
                <span className="btn__label">Get a Quote</span>
              </button>
              <button className="btn btn-primary btn-sm">Small</button>
              <button className="btn btn-primary btn-md">Medium</button>
              <button className="btn btn-primary btn-lg">Large</button>
              <button className="btn btn-primary btn-md btn-icon" aria-label="Confirm">
                <Check />
              </button>
            </div>

            <Caption className="mt-6">Secondary · sm / md / lg</Caption>
            <div className="flex flex-wrap gap-3 items-center">
              <button className="btn btn-secondary btn-sm">Learn more</button>
              <button className="btn btn-secondary btn-md">Learn more</button>
              <button className="btn btn-secondary btn-lg">Learn more</button>
              <button className="btn btn-secondary btn-md" disabled>Disabled</button>
            </div>

            <Caption className="mt-6">Ghost · sm / md / lg</Caption>
            <div className="flex flex-wrap gap-3 items-center">
              <button className="btn btn-ghost btn-sm">View services</button>
              <button className="btn btn-ghost btn-md">View services</button>
              <button className="btn btn-ghost btn-lg">View services</button>
            </div>

            <Caption className="mt-6">Amber · the one CTA per page · md / lg only</Caption>
            <div className="flex flex-wrap gap-3 items-center">
              <button className="btn btn-amber btn-md">Get a Free Estimate</button>
              <button className="btn btn-amber btn-lg">Get a Free Estimate</button>
              <button className="btn btn-amber btn-md" disabled>Get a Free Estimate</button>
            </div>
            <p className="text-body-sm text-[var(--color-text-muted)] mt-2">
              Label is <code className="font-mono">--color-text-primary</code> (8.0:1), not white (2.4:1, fails AA).
            </p>

            <Caption className="mt-6">Danger · rare</Caption>
            <div className="flex flex-wrap gap-3 items-center">
              <button className="btn btn-danger btn-sm">Cancel request</button>
              <button className="btn btn-danger btn-md">Cancel request</button>
              <button className="btn btn-danger btn-lg">Cancel request</button>
            </div>

            <Caption className="mt-6">Link-styled button · sm / md</Caption>
            <div className="flex flex-wrap gap-3 items-center">
              <button className="btn btn-link btn-sm">View all services</button>
              <button className="btn btn-link btn-md">View all services</button>
            </div>
          </Section>

          {/* ─────────────────────────── 3. Cards ─────────────────────────── */}
          <Section title="3. Cards">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <article className="card">
                <p className="text-body-sm text-[var(--color-text-muted)] mb-1">Default · white surface</p>
                <h3 className="text-h3 mt-0">Patios &amp; walkways</h3>
                <p className="text-body mt-2">
                  Honest copy in two short lines. Default white-on-white card on a white section
                  uses <code className="font-mono">--shadow-card</code>.
                </p>
                <span className="badge badge-md badge-subtle mt-4">Hardscape</span>
              </article>

              <article className="card card-cream">
                <p className="text-body-sm text-[var(--color-text-muted)] mb-1">Cream · on white section</p>
                <h3 className="text-h3 mt-0">Lawn maintenance</h3>
                <p className="text-body mt-2">
                  Same body, warmer surface, green-tinted shadow that keeps the card feeling rooted
                  rather than floating.
                </p>
                <span className="badge badge-md badge-outlined mt-4">2026</span>
              </article>

              <article className="card card-featured">
                <p className="text-body-sm font-semibold uppercase mb-1"
                   style={{
                     color: 'var(--color-sunset-amber-700)',
                     letterSpacing: 'var(--tracking-eyebrow)',
                     fontSize: '11px',
                   }}>
                  Featured
                </p>
                <h3 className="text-h3 mt-0">Recommended package</h3>
                <p className="text-body mt-2">
                  D2 ratified — white surface with 2px amber-500 decorative ring. Cannot live in the
                  same section as a page&apos;s amber CTA.
                </p>
              </article>
            </div>

            <Caption className="mt-6">Photo card (4:3, hover scales image to 1.03)</Caption>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <article className="card card-photo" style={{aspectRatio: '4 / 3'}}>
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background:
                      'linear-gradient(180deg, transparent 0%, transparent 50%, rgba(0,0,0,0.6) 100%), linear-gradient(135deg, #4D8A3F 0%, #2F5D27 100%)',
                    position: 'relative',
                    color: 'var(--color-text-on-dark)',
                  }}
                >
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-h3 m-0" style={{color: 'var(--color-text-on-dark)'}}>
                      Backyard patio · Naperville
                    </h3>
                    <p className="text-body-sm m-0" style={{color: 'var(--color-text-on-dark)'}}>
                      Hardscape · Unilock
                    </p>
                  </div>
                </div>
              </article>

              <article className="card card-testimonial card-cream">
                <blockquote
                  className="font-heading italic m-0"
                  style={{fontSize: '20px', lineHeight: 1.35, fontWeight: 500}}
                >
                  &ldquo;The crew was on time, every day, for three weeks. We never had to chase
                  anyone for an answer.&rdquo;
                </blockquote>
                <footer className="text-body-sm text-[var(--color-text-muted)] mt-3 not-italic">
                  — Mark T., Aurora · ★★★★★
                </footer>
              </article>
            </div>
          </Section>

          {/* ─────────────────────────── 4. Form fields ─────────────────────────── */}
          <Section title="4. Form fields">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="field">
                <label className="field-label" htmlFor="email-default">
                  Email
                  <span className="field-required" aria-label="required">*</span>
                </label>
                <input id="email-default" type="email" className="field-input" placeholder="you@example.com" />
                <p className="field-help">We&apos;ll only email about your quote.</p>
              </div>

              <div className="field">
                <label className="field-label" htmlFor="phone-focus">Phone (focus me)</label>
                <input id="phone-focus" type="tel" className="field-input" defaultValue="(630) " />
                <p className="field-help">Tab into this field to see the focus ring + focused border.</p>
              </div>

              <div className="field">
                <label className="field-label" htmlFor="email-error">
                  Email
                  <span className="field-required" aria-label="required">*</span>
                </label>
                <input
                  id="email-error"
                  type="email"
                  className="field-input"
                  defaultValue="notanemail"
                  aria-invalid="true"
                  aria-describedby="email-error-msg"
                />
                <p id="email-error-msg" className="field-error">
                  <AlertCircle />
                  <span>Please enter a valid email address.</span>
                </p>
              </div>

              <div className="field">
                <label className="field-label" htmlFor="address-disabled">Service</label>
                <input
                  id="address-disabled"
                  type="text"
                  className="field-input"
                  placeholder="— select an audience first —"
                  disabled
                />
                <p className="field-help">Disabled until upstream field is set.</p>
              </div>

              <div className="field md:col-span-2">
                <label className="field-label" htmlFor="message">Tell us about the project</label>
                <textarea
                  id="message"
                  className="field-textarea"
                  placeholder="A patio for the back of the house, replacing the old deck…"
                />
              </div>

              <div className="field">
                <label className="field-label" htmlFor="audience-select">Audience</label>
                <select id="audience-select" className="field-select" defaultValue="">
                  <option value="" disabled>Select one</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="hardscape">Hardscape</option>
                </select>
              </div>

              <div className="field">
                <label className="field-label" htmlFor="file-upload">Site photos</label>
                <input id="file-upload" type="file" className="field-input" multiple />
                <p className="field-help">JPG / PNG up to 10 MB each.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <label className="field-checkbox">
                <input type="checkbox" defaultChecked />
                <span>I&apos;d like a callback within 24 hours</span>
              </label>

              <fieldset className="contents">
                <legend className="field-label mb-2 md:col-span-2">Property type</legend>
                <label className="field-radio">
                  <input type="radio" name="property-type" defaultChecked />
                  <span>Residential</span>
                </label>
                <label className="field-radio">
                  <input type="radio" name="property-type" />
                  <span>Commercial</span>
                </label>
                <label className="field-radio">
                  <input type="radio" name="property-type" />
                  <span>Hardscape</span>
                </label>
              </fieldset>
            </div>
          </Section>

          {/* ─────────────────────────── 5. Links ─────────────────────────── */}
          <Section title="5. Links">
            <Caption>Inline link · on white</Caption>
            <p className="text-body">
              Visit our <a href="#" className="link link-inline">project portfolio</a> to see recent work.
            </p>

            <div className="bg-[var(--color-bg-cream)] p-6 rounded-[var(--radius-lg)] mt-4">
              <Caption>Inline link · on cream (must be green-700, never green-500)</Caption>
              <p className="text-body">
                We posted the <a href="#" className="link link-inline">winter prep checklist</a> last week.
              </p>
            </div>

            <Caption className="mt-6">Nav link · no underline rest, underline on hover</Caption>
            <nav className="flex gap-6">
              <a href="#" className="link link-nav">Services</a>
              <a href="#" className="link link-nav">Projects</a>
              <a href="#" className="link link-nav">About</a>
              <a href="#" className="link link-nav">Contact</a>
            </nav>

            <Caption className="mt-6">CTA-link · arrow translates +2px on hover</Caption>
            <a href="#" className="link link-cta">
              View all services <ArrowRight />
            </a>
          </Section>

          {/* ─────────────────────────── 6. Badges ─────────────────────────── */}
          <Section title="6. Badges / tags / pills">
            <Caption>Subtle / Solid / Outlined · sm / md</Caption>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="badge badge-sm badge-subtle">Lawn care</span>
              <span className="badge badge-md badge-subtle">Hardscape</span>
              <span className="badge badge-sm badge-solid">Selected</span>
              <span className="badge badge-md badge-solid">Verified</span>
              <span className="badge badge-sm badge-outlined">2026</span>
              <span className="badge badge-md badge-outlined">Aurora · IL</span>
              <span className="badge badge-md badge-subtle badge-pill">Pill chip</span>
              <span className="badge badge-md badge-solid badge-pill">Pill selected</span>
            </div>
          </Section>

          {/* ─────────────────────────── 7. Avatars ─────────────────────────── */}
          <Section title="7. Avatars">
            <Caption>Sizes 24 / 32 / 40 / 48 / 64 / 96 — initials fallback + image + square variant</Caption>
            <div className="flex flex-wrap gap-4 items-end">
              <span className="avatar avatar-24">EE</span>
              <span className="avatar avatar-32">EE</span>
              <span className="avatar avatar-40">EE</span>
              <span className="avatar avatar-48">EE</span>
              <span className="avatar avatar-64">EE</span>
              <span className="avatar avatar-96">EE</span>
              <span className="avatar avatar-square avatar-48">EE</span>
              <span className="avatar avatar-48" aria-label="Erick">
                <svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true">
                  <rect width="48" height="48" fill="#8FB67A"/>
                  <circle cx="24" cy="20" r="8" fill="#2F5D27"/>
                  <path d="M8 44 Q24 28 40 44 L40 48 L8 48 Z" fill="#2F5D27"/>
                </svg>
              </span>
            </div>
          </Section>

          {/* ─────────────────────────── 8. Tooltip ─────────────────────────── */}
          <Section title="8. Tooltip">
            <Caption>Hover or focus the trigger</Caption>
            <TooltipDemo />
          </Section>

          {/* ─────────────────────────── 9. Dialog ─────────────────────────── */}
          <Section title="9. Dialog / modal">
            <Caption>Built on @base-ui/react Dialog</Caption>
            <DialogDemo />
          </Section>

          {/* ─────────────────────────── 10. Alerts / toasts ─────────────────────────── */}
          <Section title="10. Toast / inline alert">
            <Caption>Inline alerts · info / success / warning / danger</Caption>
            <div className="space-y-3">
              <div className="alert alert-info" role="status">
                <Info />
                <div>
                  <p className="alert-title">Heads up</p>
                  <p className="alert-body">Service requests submitted after 4pm receive a callback the next business day.</p>
                </div>
              </div>
              <div className="alert alert-success" role="status">
                <CheckCircle2 />
                <div>
                  <p className="alert-title">Quote request received</p>
                  <p className="alert-body">We&apos;ll be in touch within one business day.</p>
                </div>
              </div>
              <div className="alert alert-warning" role="alert">
                <AlertTriangle />
                <div>
                  <p className="alert-title">Partially saved</p>
                  <p className="alert-body">Your address is missing — we saved the rest as a draft.</p>
                </div>
              </div>
              <div className="alert alert-danger" role="alert">
                <AlertCircle />
                <div>
                  <p className="alert-title">Network error</p>
                  <p className="alert-body">Couldn&apos;t reach the server. Check your connection and retry.</p>
                </div>
              </div>
            </div>

            <Caption className="mt-6">Toast · max-width 420px (visual position handled by toast container in real layouts)</Caption>
            <div className="alert alert-success toast" role="status">
              <CheckCircle2 />
              <div>
                <p className="alert-title">Saved</p>
                <p className="alert-body">Your draft is saved.</p>
              </div>
            </div>
          </Section>

          {/* ─────────────────────────── 11. Breadcrumb ─────────────────────────── */}
          <Section title="11. Breadcrumb">
            <Caption>Three-level example</Caption>
            <nav aria-label="Breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item"><a href="#">Home</a></li>
                <li className="breadcrumb-separator" aria-hidden="true"><ChevronRight /></li>
                <li className="breadcrumb-item"><a href="#">Services</a></li>
                <li className="breadcrumb-separator" aria-hidden="true"><ChevronRight /></li>
                <li className="breadcrumb-item" aria-current="page">Patios &amp; walkways</li>
              </ol>
            </nav>
          </Section>

          {/* ─────────────────────────── 12. Pagination ─────────────────────────── */}
          <Section title="12. Pagination">
            <Caption>Page 3 of 10</Caption>
            <nav aria-label="Pagination">
              <ul className="pagination">
                <li><button className="pagination-item pagination-edge" type="button">
                  <ChevronLeft />
                  <span className="hidden sm:inline">Previous</span>
                </button></li>
                <li><button className="pagination-item" type="button">1</button></li>
                <li><button className="pagination-item" type="button">2</button></li>
                <li><button className="pagination-item" type="button" aria-current="page">3</button></li>
                <li><button className="pagination-item" type="button">4</button></li>
                <li><button className="pagination-item" type="button">5</button></li>
                <li className="text-[var(--color-text-muted)] px-1">…</li>
                <li><button className="pagination-item" type="button">10</button></li>
                <li><button className="pagination-item pagination-edge" type="button">
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight />
                </button></li>
              </ul>
            </nav>
          </Section>

          {/* ─────────────────────────── 13. Skip link ─────────────────────────── */}
          <Section title="13. Skip link">
            <p className="text-body">
              Press <kbd className="font-mono text-body-sm bg-[var(--color-bg-stone)] px-2 py-0.5 rounded">Tab</kbd>{' '}
              from the very top of the page (or click in the URL bar and Tab) — the &ldquo;Skip to main content&rdquo; link
              appears in the top-left.
            </p>
          </Section>

          {/* ─────────────────────────── 14. Color swatches ─────────────────────────── */}
          <Section title="14. Color swatches & WCAG ratios">
            <Caption>Each swatch shows hex + measured ratio against white (or note for surfaces / borders)</Caption>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {SWATCHES.map((s) => (
                <div key={s.label} className="card" style={{padding: 0, borderRadius: 'var(--radius-md)'}}>
                  <div
                    style={{
                      background: s.hex,
                      height: 64,
                      borderTopLeftRadius: 'var(--radius-md)',
                      borderTopRightRadius: 'var(--radius-md)',
                      borderBottom: '1px solid var(--color-border)',
                    }}
                  />
                  <div style={{padding: 'var(--spacing-3)'}}>
                    <p className="text-body-sm font-semibold m-0">{s.label}</p>
                    <p className="text-micro text-[var(--color-text-muted)] font-mono m-0 mt-0.5">{s.hex}</p>
                    <p className="text-micro text-[var(--color-text-muted)] m-0 mt-0.5">{s.ratioOnWhite}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* ─────────────────────────── 15. Motion sandbox ─────────────────────────── */}
          <Section title="15. Motion sandbox">
            <Caption>
              Six AnimateIn variants. Entrances are once-per-mount — refresh the page to see them again.
              Toggle DevTools → Rendering → Emulate CSS prefers-reduced-motion: reduce to verify
              MotionConfig reducedMotion=&quot;user&quot; strips x/y/scale.
            </Caption>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {(['fade', 'fade-up', 'fade-down', 'fade-left', 'fade-right', 'scale'] as const).map((v) => (
                <AnimateIn key={v} variant={v} className="card card-cream">
                  <h4 className="text-h4 m-0">{v}</h4>
                  <p className="text-body-sm text-[var(--color-text-muted)] mt-2">
                    variant=&quot;{v}&quot;
                  </p>
                </AnimateIn>
              ))}
            </div>

            <Caption className="mt-8">StaggerContainer with five StaggerItems — 80ms between siblings</Caption>
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 mt-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <StaggerItem key={i} className="card card-cream">
                  <p className="text-body-sm m-0 font-semibold">Item {i}</p>
                </StaggerItem>
              ))}
            </StaggerContainer>

            <button type="button" className="btn btn-secondary btn-md mt-6" aria-disabled="true">
              Re-trigger (refresh page)
            </button>
            <p className="text-body-sm text-[var(--color-text-muted)] mt-2">
              The button does nothing — entrances are once. Refresh to see them play again.
            </p>
          </Section>
        </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────── *
 * Internal helpers — kept inline so this page is self-contained and deletable.
 * ──────────────────────────────────────────────────────────────────────────── */

function Section({title, children}: {title: string; children: React.ReactNode}) {
  return (
    <section className="space-y-3">
      <h2 className="text-h2 border-b border-[var(--color-border)] pb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Caption({children, className = ''}: {children: React.ReactNode; className?: string}) {
  return (
    <p className={`text-body-sm text-[var(--color-text-muted)] m-0 ${className}`}>{children}</p>
  );
}

/* Inline lucide-style icons (svg only — keeps this page free of client-component overhead). */

function Check() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function ChevronLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function AlertCircle() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{flexShrink: 0, marginTop: 2}}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function CheckCircle2() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{flexShrink: 0, marginTop: 2}}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function AlertTriangle() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{flexShrink: 0, marginTop: 2}}>
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function Info() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{flexShrink: 0, marginTop: 2}}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

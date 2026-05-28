import {ImageResponse} from 'next/og';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';

/**
 * Sitewide branded OG fallback — Phase 1.18 §7.6, polished in Phase M.10d §B.
 *
 * Used by every page that does not generate a per-content OG image. Returns
 * a 1200×630 PNG.
 *
 * Phase M.10d palette intent: match the **live site** (green primary +
 * amber accent + cream-on-charcoal), NOT the BG-01 orange brand-guide
 * palette. The card visitors see when they click through should match
 * what they get on arrival.
 *
 * Typography note: `next/og` cannot reuse `next/font`'s Google Font
 * loaders, and a runtime fetch of Manrope's `.woff2` is a build-time
 * cost we'd be paying on every OG render. Falling back to `system-ui,
 * sans-serif` keeps render fast and matches the existing `/og/[type]/[slug]`
 * routes; sharing-platform thumbnails are decorative enough that the
 * subtle typographic difference is invisible to humans. If we ever want
 * Manrope in the OG cards, the right time is when we batch-process
 * fonts for `next/og` site-wide (M.11+).
 *
 * Runtime is Node so `fs.readFileSync` works for loading the bundled
 * logo from `public/og/`.
 */

export const runtime = 'nodejs';

// Live-site palette tokens (mirrors src/app/globals.css). `next/og` does
// not load globals.css, so the values are duplicated here verbatim — keep
// in sync with the CSS file when the palette evolves.
const TOKENS = {
  bg: '#0E0E0E',              // --color-bg-deep-charcoal (live hero pairing)
  green700: '#2F5D27',        // --color-sunset-green-700 (badge fill)
  green500: '#4D8A3F',        // --color-sunset-green-500 (subtle accent)
  amber500: '#E8A33D',        // --color-sunset-amber-500 (accent rail)
  amber700: '#B47821',        // --color-sunset-amber-700 (deeper accent)
  cream: '#FAF7F1',           // --color-bg-cream / --color-text-on-dark
  cream70: 'rgba(250,247,241,0.78)',
  cream30: 'rgba(250,247,241,0.45)',
} as const;

function loadLogoDataUrl(): string | null {
  try {
    const buf = readFileSync(
      join(process.cwd(), 'public', 'og', 'logo-horizontal-white.png'),
    );
    return `data:image/png;base64,${buf.toString('base64')}`;
  } catch {
    return null;
  }
}

export async function GET() {
  const logoDataUrl = loadLogoDataUrl();

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          background: TOKENS.bg,
          color: TOKENS.cream,
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Left amber accent rail — 8px, full height. */}
        <div
          style={{
            width: 8,
            background: TOKENS.amber500,
          }}
        />

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '64px 72px',
          }}
        >
          {/* Top row — logo + locale badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {logoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoDataUrl}
                alt=""
                width={320}
                height={86}
                // Phase M.10e Fix 4 — Satori (next/og's renderer) does NOT
                // resolve `width: 'auto'` from intrinsic image dimensions
                // the way a browser does; it collapses to 0 and the image
                // renders invisibly. Use explicit numeric dimensions
                // matching the source logo's 3.75:1 aspect (720×192) at the
                // intended display height of 86px → width 320px.
                style={{width: 320, height: 86}}
              />
            ) : (
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  color: TOKENS.cream,
                }}
              >
                SUNSET SERVICES
              </div>
            )}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: TOKENS.green700,
                color: TOKENS.cream,
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: '0.14em',
                padding: '10px 18px',
                borderRadius: 999,
              }}
            >
              CHICAGO WESTERN SUBURBS
            </div>
          </div>

          {/* Headline block */}
          <div style={{display: 'flex', flexDirection: 'column', gap: 20}}>
            <div
              style={{
                fontSize: 64,
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
                maxWidth: 960,
                color: TOKENS.cream,
              }}
            >
              Landscape · Hardscape · Waterproofing · Snow management.
            </div>
            <div
              style={{
                fontSize: 26,
                color: TOKENS.cream70,
                maxWidth: 920,
                lineHeight: 1.3,
              }}
            >
              Family-run since 2000. Aurora · Naperville · Wheaton · St. Charles.
            </div>
          </div>

          {/* Bottom row — amber dot + URL */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: '0.04em',
              color: TOKENS.cream,
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: TOKENS.amber500,
              }}
            />
            <div>sunsetservices.us</div>
            <div
              style={{
                width: 1,
                height: 22,
                background: TOKENS.cream30,
                margin: '0 4px',
              }}
            />
            <div style={{color: TOKENS.cream70, fontWeight: 500}}>
              (630) 946-9321
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}

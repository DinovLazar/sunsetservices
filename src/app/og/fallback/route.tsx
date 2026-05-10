import {ImageResponse} from 'next/og';

/**
 * Sitewide branded OG fallback — Phase 1.18 §7.6.
 *
 * Used by index pages and any path that does not generate a per-content
 * OG. Pure-token render (no per-post fields).
 */

const TOKENS = {
  green900: '#1A3617',
  green700: '#2F5D27',
  cream: '#FAF7F1',
};

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: TOKENS.green900,
          color: TOKENS.cream,
          padding: 80,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{display: 'flex', flexDirection: 'column', gap: 24}}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: TOKENS.green700,
              color: TOKENS.cream,
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: '0.12em',
              padding: '8px 16px',
              borderRadius: 18,
              alignSelf: 'flex-start',
            }}
          >
            DUPAGE COUNTY
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              maxWidth: 960,
            }}
          >
            Landscaping, hardscape, and snow management.
          </div>
          <div style={{fontSize: 24, color: 'rgba(250,247,241,0.85)'}}>
            Family-run since 2000 · Aurora · Naperville · Wheaton
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: '0.06em',
          }}
        >
          SUNSET SERVICES
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}

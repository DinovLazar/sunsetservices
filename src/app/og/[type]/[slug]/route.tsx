import {ImageResponse} from 'next/og';
import {NextRequest} from 'next/server';
import {getResourceBySlug} from '@/data/getResources';
import {getBlogPostBySlug} from '@/data/getBlog';

/**
 * Open-Graph image generator for Resource detail + Blog post pages —
 * Phase 1.18 §7.6.
 *
 * Routes:
 *   /og/resource/{slug}/?locale={en|es}
 *   /og/blog/{slug}/?locale={en|es}
 *
 * Renders 1200×630 with the brand-green panel, category badge, headline,
 * byline + reading time, and the brand wordmark. Per locale.
 *
 * Uses the locked design tokens via inline styles (the next/og runtime
 * doesn't load globals.css; we duplicate the four colors used here).
 */

const TOKENS = {
  green900: '#1A3617',
  green700: '#2F5D27',
  cream: '#FAF7F1',
  cream30: 'rgba(250,247,241,0.85)',
};

type Locale = 'en' | 'es';

export async function GET(
  request: NextRequest,
  context: {params: Promise<{type: string; slug: string}>},
) {
  const {type, slug} = await context.params;
  const localeParam = request.nextUrl.searchParams.get('locale');
  const locale: Locale = localeParam === 'es' ? 'es' : 'en';

  let title = 'Sunset Services';
  let category = '';
  let meta = '';

  if (type === 'resource') {
    const r = getResourceBySlug(slug);
    if (r) {
      title = r.title[locale];
      category = r.category.replace(/-/g, ' ').toUpperCase();
      meta = `${r.byline ?? 'Sunset Services Team'} · ${r.readingMinutes ?? 1} min`;
    }
  } else if (type === 'blog') {
    const p = getBlogPostBySlug(slug);
    if (p) {
      title = p.title[locale];
      category = p.category.replace(/-/g, ' ').toUpperCase();
      meta = `${p.byline} · ${p.readingMinutes ?? 1} min`;
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          background: TOKENS.green900,
          color: TOKENS.cream,
          fontFamily: 'system-ui, sans-serif',
          padding: 64,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div style={{display: 'flex', flexDirection: 'column', gap: 28}}>
            {category ? (
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
                {category}
              </div>
            ) : null}
            <div
              style={{
                fontSize: 56,
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: '-0.01em',
                maxWidth: 960,
              }}
            >
              {title}
            </div>
            {meta ? (
              <div
                style={{
                  fontSize: 22,
                  color: TOKENS.cream30,
                }}
              >
                {meta}
              </div>
            ) : null}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: TOKENS.cream,
            }}
          >
            SUNSET SERVICES
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

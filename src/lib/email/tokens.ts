/**
 * Email design tokens (Phase 2.08).
 *
 * Email HTML can't use CSS variables — every value must be inlined. This
 * module mirrors the `globals.css` brand palette as plain hex/px values so
 * the React Email templates can compose styles inline.
 *
 * The `business` block intentionally hard-codes `info@sunsetservices.us` in
 * the email footer (the public-facing identity Sunset Services advertises),
 * even though the actual FROM during sandbox mode is `onboarding@resend.dev`.
 * Visitors see the right "from" identity in the footer regardless of
 * sandbox state.
 */
export const emailTokens = {
  color: {
    green500: '#4D8A3F',
    green700: '#2F5D27',
    green50: '#F1F5EE',
    amber500: '#E8A33D',
    amber700: '#B47821',
    amber50: '#FDF7E8',
    bg: '#FFFFFF',
    bgCream: '#FAF7F1',
    bgStone: '#F2EDE3',
    textPrimary: '#1A1A1A',
    textSecondary: '#4A4A4A',
    textMuted: '#6B6B6B',
    border: '#E5E0D5',
    sandboxBanner: '#FFF3CD',
    sandboxBannerText: '#664D03',
    sandboxBannerBorder: '#FFE69C',
  },
  font: {
    // Email-safe stack. Custom fonts (Manrope/Onest) won't load in Gmail /
    // Outlook; fall back to system stacks that approximate the brand visually.
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    heading: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  size: {
    containerMaxWidth: 600,
    bodyPadding: 32,
  },
  business: {
    name: 'Sunset Services',
    addressLine1: '1630 Mountain St',
    addressLine2: 'Aurora, IL 60505',
    phone: '(630) 946-9321',
    phoneTel: '+16309469321',
    email: 'info@sunsetservices.us',
    website: 'https://sunsetservices.us',
  },
} as const;

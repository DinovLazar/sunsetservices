import * as React from 'react';
import {Heading, Text, Section, Link, Hr} from '@react-email/components';
import {EmailLayout, EmailButton} from '../components/EmailLayout';
import {emailTokens as T} from '../tokens';

/**
 * ContactAlertEmail — to Erick when a /contact/ form lands (Phase 2.08).
 * Visitors never see this; routes to RESEND_TO_EMAIL only.
 */
export type ContactSubmissionPayload = {
  name: string;
  email?: string;
  phone?: string;
  category?: string;
  message: string;
  sessionId: string;
  referrer?: string;
};

export type ContactAlertEmailProps = {
  submission: ContactSubmissionPayload;
  /**
   * The created `contactSubmission` document ID, or `null` when the Sanity
   * write failed. When null the email self-declares the failure with a banner
   * and drops the Studio deep-link (never a half-broken link). Mirrors the
   * ChatLeadEmail / QuoteLeadAlertEmail contract.
   */
  sanityDocId: string | null;
  locale: 'en' | 'es';
  intendedRecipient?: string;
};

export function ContactAlertEmail({
  submission,
  sanityDocId,
  locale,
  intendedRecipient,
}: ContactAlertEmailProps) {
  // A single valid Structure deep-link, only when the write succeeded. The
  // hosted Studio uses the Structure tool (`/structure/...`), not the legacy
  // `/desk/...` alias — matches ChatLeadEmail / QuoteLeadAlertEmail.
  const studioUrl = sanityDocId
    ? `https://sunsetservices.sanity.studio/structure/contactSubmission;${sanityDocId}`
    : null;
  const writeFailed = sanityDocId === null;
  const contactDisplay = submission.email ?? submission.phone ?? '—';

  return (
    <EmailLayout
      locale={locale}
      preheader={`New contact form from ${submission.name} — ${contactDisplay}`}
      intendedRecipient={intendedRecipient}
    >
      <Heading as="h2" style={h1Style}>
        New contact form submission
      </Heading>
      <Text style={subheadStyle}>
        From <strong>{submission.name}</strong> · {contactDisplay}
      </Text>

      {/* Write-failure banner — self-declares that the CMS did NOT capture this
          lead, so it can never be mistaken for a saved enquiry. Every field the
          visitor submitted still renders below, so the lead can be re-entered
          by hand from this email alone. */}
      {writeFailed ? (
        <Section style={writeFailBannerStyle}>
          <Text style={writeFailTitleStyle}>⚠️ This lead was NOT saved to the CMS</Text>
          <Text style={writeFailBodyStyle}>
            The Sanity write failed, so there is no Studio record for this
            contact. Re-enter it by hand from the details below (all fields are
            included) and check the server logs / Telegram alert for the cause.
          </Text>
        </Section>
      ) : null}

      <SectionHeader>Contact</SectionHeader>
      <KeyValue label="Name" value={submission.name} />
      {submission.email ? (
        <KeyValue
          label="Email"
          value={
            <Link href={`mailto:${submission.email}`} style={inlineLinkStyle}>
              {submission.email}
            </Link>
          }
        />
      ) : null}
      {submission.phone ? (
        <KeyValue
          label="Phone"
          value={
            <Link href={`tel:${submission.phone}`} style={inlineLinkStyle}>
              {submission.phone}
            </Link>
          }
        />
      ) : null}
      {submission.category ? (
        <KeyValue label="Category" value={formatCategory(submission.category)} />
      ) : null}

      {submission.message ? (
        <>
          <SectionHeader>Message</SectionHeader>
          <Text style={quoteBlockStyle}>{submission.message}</Text>
        </>
      ) : null}

      <Section style={{paddingTop: 12}}>
        {submission.email ? (
          <EmailButton variant="primary" href={`mailto:${submission.email}`} text="Reply" />
        ) : null}
        {submission.phone ? (
          <EmailButton variant="ghost" href={`tel:${submission.phone}`} text="Call" />
        ) : null}
      </Section>

      <Hr style={{margin: '20px 0 8px', borderColor: T.color.border}} />

      <Text style={metaStyle}>
        Submitted {new Date().toISOString()} · session {submission.sessionId} · locale {locale}
        {submission.referrer ? ` · ref ${submission.referrer}` : ''}
      </Text>
      {studioUrl ? (
        <Text style={metaStyle}>
          <Link href={studioUrl} style={metaLinkStyle}>
            Open in Sanity Studio →
          </Link>
        </Text>
      ) : (
        <Text style={metaStyle}>
          Not saved to Sanity — no Studio link. Re-enter this lead from the
          fields above.
        </Text>
      )}
    </EmailLayout>
  );
}

/**
 * Maps a raw `submission.category` enum value to the human-readable
 * label rendered in the alert email. Phase M.10 Issue 7 flipped this
 * from the 3-audience model (residential / commercial / hardscape /
 * other) to the 4-division model (landscape / hardscape /
 * waterproofing / snow-removal / other). The legacy values are kept
 * as fall-through labels so historic Sanity docs render readably.
 */
function formatCategory(category: string): string {
  const labels: Record<string, string> = {
    landscape: 'Landscape',
    hardscape: 'Hardscape',
    waterproofing: 'Waterproofing',
    'snow-removal': 'Snow Removal',
    trenchless: 'Trenchless & Directional Boring',
    other: 'Other',
    residential: 'Residential (legacy)',
    commercial: 'Commercial (legacy)',
  };
  return labels[category] ?? category;
}

function SectionHeader({children}: {children: React.ReactNode}) {
  return <Text style={sectionHeaderStyle}>{children}</Text>;
}

function KeyValue({label, value}: {label: string; value: React.ReactNode}) {
  return (
    <Text style={kvRowStyle}>
      <span style={kvLabelStyle}>{label}</span>
      <span style={kvValueStyle}>{value}</span>
    </Text>
  );
}

const h1Style: React.CSSProperties = {
  margin: '0 0 8px',
  fontFamily: T.font.heading,
  fontSize: 22,
  fontWeight: 700,
  lineHeight: '1.2',
  color: T.color.textPrimary,
};

const subheadStyle: React.CSSProperties = {
  margin: '0 0 16px',
  fontSize: 14,
  color: T.color.textSecondary,
  lineHeight: '1.5',
};

const sectionHeaderStyle: React.CSSProperties = {
  margin: '20px 0 8px',
  fontFamily: T.font.heading,
  fontSize: 12,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: T.color.green700,
};

const kvRowStyle: React.CSSProperties = {
  margin: '0 0 4px',
  fontSize: 14,
  lineHeight: '1.55',
  color: T.color.textPrimary,
};

const kvLabelStyle: React.CSSProperties = {
  display: 'inline-block',
  width: 96,
  color: T.color.textMuted,
  fontSize: 13,
};

const kvValueStyle: React.CSSProperties = {color: T.color.textPrimary};

const inlineLinkStyle: React.CSSProperties = {
  color: T.color.green700,
  textDecoration: 'underline',
};

const quoteBlockStyle: React.CSSProperties = {
  margin: '8px 0 0',
  padding: '12px 16px',
  borderLeft: `3px solid ${T.color.green500}`,
  backgroundColor: T.color.bgCream,
  fontSize: 14,
  lineHeight: '1.6',
  color: T.color.textPrimary,
  whiteSpace: 'pre-wrap',
};

const metaStyle: React.CSSProperties = {
  margin: '4px 0',
  fontSize: 12,
  color: T.color.textMuted,
  lineHeight: '1.4',
};

const metaLinkStyle: React.CSSProperties = {
  color: T.color.green700,
  textDecoration: 'underline',
};

// Write-failure banner — a distinct alarm red (not the amber used for sandbox /
// high-intent callouts) so an unsaved lead reads as an error at a glance.
const writeFailBannerStyle: React.CSSProperties = {
  margin: '0 0 20px',
  padding: '12px 16px',
  backgroundColor: '#FEF3F2',
  borderLeft: '4px solid #D92D20',
  borderRadius: 4,
};

const writeFailTitleStyle: React.CSSProperties = {
  margin: 0,
  fontFamily: T.font.heading,
  fontSize: 14,
  fontWeight: 700,
  color: '#B42318',
};

const writeFailBodyStyle: React.CSSProperties = {
  margin: '6px 0 0',
  fontSize: 13,
  lineHeight: '1.5',
  color: '#7A271A',
};

export default ContactAlertEmail;

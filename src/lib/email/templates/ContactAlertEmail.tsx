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
  sanityDocId: string;
  locale: 'en' | 'es';
  intendedRecipient?: string;
};

export function ContactAlertEmail({
  submission,
  sanityDocId,
  locale,
  intendedRecipient,
}: ContactAlertEmailProps) {
  const studioUrl = `https://sunsetservices.sanity.studio/desk/contactSubmission;${sanityDocId}`;
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
      {submission.category ? <KeyValue label="Category" value={submission.category} /> : null}

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
      <Text style={metaStyle}>
        <Link href={studioUrl} style={metaLinkStyle}>
          Open in Sanity Studio →
        </Link>
      </Text>
    </EmailLayout>
  );
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

export default ContactAlertEmail;

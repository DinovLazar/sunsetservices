import * as React from 'react';
import {Heading, Text, Section, Link, Hr} from '@react-email/components';
import {EmailLayout, EmailButton} from '../components/EmailLayout';
import {emailTokens as T} from '../tokens';

/**
 * ChatLeadEmail — to Erick when an AI chat panel lead-capture form lands.
 *
 * Phase 2.09. Sandbox-aware routing applies (Phase 2.08): when
 * RESEND_DOMAIN_VERIFIED=false this lands in the dev inbox with a sandbox
 * banner and `[SANDBOX → info@sunsetservices.us]` subject prefix.
 *
 * Body sections (top → bottom):
 *   1. Header — "New chat lead"
 *   2. Contact block — Name, email mailto, locale, sessionId small text
 *   3. Page context — visitor URL when present
 *   4. Trigger reason callout — Claude's `flag_high_intent` reason, if any
 *   5. Transcript — last 10 turns, alternating bg, role-prefixed
 *   6. CTAs — Reply by email (primary) + Call now (ghost)
 *   7. Studio link — small footer line to the Sanity record
 */
export type ChatLeadTranscriptMessage = {
  role: 'user' | 'assistant';
  content: string;
  ts?: string;
};

export type ChatLeadEmailProps = {
  name: string;
  email: string;
  locale: 'en' | 'es';
  sessionId: string;
  transcriptExcerpt: ChatLeadTranscriptMessage[];
  triggerReason?: string;
  pageContext?: string;
  sanityDocId: string | null;
  intendedRecipient?: string;
};

export function ChatLeadEmail({
  name,
  email,
  locale,
  sessionId,
  transcriptExcerpt,
  triggerReason,
  pageContext,
  sanityDocId,
  intendedRecipient,
}: ChatLeadEmailProps) {
  const studioUrl = sanityDocId
    ? `https://sunsetservices.sanity.studio/structure/chatLead;${sanityDocId}`
    : null;
  const trimmedTranscript = (transcriptExcerpt ?? []).slice(-10);

  return (
    <EmailLayout
      locale={locale}
      preheader={`New chat lead — ${name} (${email})`}
      intendedRecipient={intendedRecipient}
    >
      <Heading as="h2" style={h1Style}>
        New chat lead
      </Heading>
      <Text style={subheadStyle}>
        From <strong>{name}</strong> · {email}
      </Text>

      <SectionHeader>Contact</SectionHeader>
      <KeyValue label="Name" value={name} />
      <KeyValue
        label="Email"
        value={
          <Link href={`mailto:${email}`} style={inlineLinkStyle}>
            {email}
          </Link>
        }
      />
      <KeyValue label="Locale" value={locale} />
      <KeyValue
        label="Session"
        value={<span style={{...kvValueStyle, fontSize: 11, color: T.color.textMuted}}>{sessionId}</span>}
      />

      {pageContext ? (
        <>
          <SectionHeader>Page context</SectionHeader>
          <Text style={kvRowStyle}>
            <Link href={pageContext} style={inlineLinkStyle}>
              {pageContext}
            </Link>
          </Text>
        </>
      ) : null}

      {triggerReason ? (
        <Section style={triggerCalloutStyle}>
          <Text style={triggerLabelStyle}>Why this was flagged ready to book</Text>
          <Text style={triggerReasonStyle}>{triggerReason}</Text>
        </Section>
      ) : null}

      {trimmedTranscript.length > 0 ? (
        <>
          <SectionHeader>Conversation excerpt</SectionHeader>
          {trimmedTranscript.map((m, i) => (
            <Section key={i} style={i % 2 === 0 ? transcriptRowAStyle : transcriptRowBStyle}>
              <Text style={transcriptRoleStyle}>
                <strong>{m.role === 'user' ? 'User' : 'Assistant'}</strong>
                {m.ts ? <span style={transcriptTsStyle}> · {new Date(m.ts).toISOString()}</span> : null}
              </Text>
              <Text style={transcriptContentStyle}>{m.content}</Text>
            </Section>
          ))}
        </>
      ) : null}

      <Section style={{paddingTop: 12}}>
        <EmailButton
          variant="primary"
          href={`mailto:${email}?subject=Re%3A%20your%20chat%20with%20Sunset%20Services`}
          text="Reply by email"
        />
        <EmailButton variant="ghost" href="tel:+16309469321" text="Call now" />
      </Section>

      <Hr style={{margin: '20px 0 8px', borderColor: T.color.border}} />

      <Text style={metaStyle}>
        Captured {new Date().toISOString()} · locale {locale} · session {sessionId}
      </Text>
      {studioUrl ? (
        <Text style={metaStyle}>
          <Link href={studioUrl} style={metaLinkStyle}>
            View in Sanity Studio →
          </Link>
        </Text>
      ) : null}
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

// ─────────────── styles ───────────────

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
  width: 80,
  color: T.color.textMuted,
  fontSize: 13,
};

const kvValueStyle: React.CSSProperties = {color: T.color.textPrimary};

const inlineLinkStyle: React.CSSProperties = {
  color: T.color.green700,
  textDecoration: 'underline',
};

const triggerCalloutStyle: React.CSSProperties = {
  margin: '16px 0 0',
  padding: '12px 16px',
  backgroundColor: T.color.amber50,
  borderLeft: `3px solid ${T.color.amber700}`,
  borderRadius: 4,
};

const triggerLabelStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: T.color.amber700,
};

const triggerReasonStyle: React.CSSProperties = {
  margin: '4px 0 0',
  fontSize: 14,
  lineHeight: '1.55',
  color: T.color.textPrimary,
};

const transcriptRowAStyle: React.CSSProperties = {
  margin: '0',
  padding: '10px 14px',
  backgroundColor: T.color.bg,
  borderBottom: `1px solid ${T.color.border}`,
};

const transcriptRowBStyle: React.CSSProperties = {
  margin: '0',
  padding: '10px 14px',
  backgroundColor: T.color.bgCream,
  borderBottom: `1px solid ${T.color.border}`,
};

const transcriptRoleStyle: React.CSSProperties = {
  margin: '0 0 2px',
  fontSize: 12,
  color: T.color.textMuted,
};

const transcriptTsStyle: React.CSSProperties = {
  fontSize: 11,
  color: T.color.textMuted,
};

const transcriptContentStyle: React.CSSProperties = {
  margin: '0',
  fontSize: 14,
  lineHeight: '1.55',
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

export default ChatLeadEmail;

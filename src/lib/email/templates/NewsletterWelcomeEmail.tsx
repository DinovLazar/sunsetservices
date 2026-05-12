import * as React from 'react';
import {Heading, Text, Section} from '@react-email/components';
import {EmailLayout, EmailButton} from '../components/EmailLayout';
import {emailTokens as T} from '../tokens';

/**
 * NewsletterWelcomeEmail — to new footer-signup subscribers (Phase 2.08).
 *
 * `unsubscribeUrl` is intentionally undefined at Phase 2.08 — no unsubscribe
 * endpoint exists yet, so the footer omits the link. Wire it in once the
 * small follow-up phase ships `/unsubscribe/[token]`.
 *
 * Spanish copy is first-pass; flagged [TBR] for Phase 2.13.
 */
export type NewsletterWelcomeEmailProps = {
  email: string;
  locale: 'en' | 'es';
  intendedRecipient?: string;
  unsubscribeUrl?: string;
};

const COPY = {
  en: {
    preheader: 'Welcome to the Sunset Services newsletter',
    h1: 'Welcome to Sunset Services',
    body:
      "You're on the list. Once a month or so we share seasonal tips, project spotlights, and the occasional offer. No spam, no daily blasts.",
    quickHeading: 'Worth a look',
    projects: 'Recent projects',
    blog: 'From the blog',
    quote: 'Free estimate',
    signoff: '— Erick & the Sunset Services team',
  },
  es: {
    // [TBR] Phase 2.13.
    preheader: 'Bienvenido al boletín de Sunset Services',
    h1: 'Bienvenido a Sunset Services',
    body:
      'Ya estás en la lista. Una vez al mes compartimos consejos de temporada, proyectos destacados y alguna oferta puntual. Sin spam, sin envíos diarios.',
    quickHeading: 'Vale la pena ver',
    projects: 'Proyectos recientes',
    blog: 'Del blog',
    quote: 'Presupuesto gratis',
    signoff: '— Erick y el equipo de Sunset Services',
  },
} as const;

export function NewsletterWelcomeEmail({
  email,
  locale,
  intendedRecipient,
  unsubscribeUrl,
}: NewsletterWelcomeEmailProps) {
  const c = COPY[locale];
  return (
    <EmailLayout
      locale={locale}
      preheader={c.preheader}
      intendedRecipient={intendedRecipient}
      unsubscribeUrl={unsubscribeUrl}
    >
      <Heading as="h2" style={h1Style}>
        {c.h1}
      </Heading>
      <Text style={leadStyle}>{c.body}</Text>

      <Text style={sectionHeadingStyle}>{c.quickHeading}</Text>
      <Section style={{paddingTop: 4}}>
        <EmailButton variant="ghost" href={`${T.business.website}/projects`} text={c.projects} />
        <EmailButton variant="ghost" href={`${T.business.website}/blog`} text={c.blog} />
        <EmailButton variant="primary" href={`${T.business.website}/request-quote`} text={c.quote} />
      </Section>

      <Text style={recipientLineStyle}>Sent to {email}.</Text>
      <Text style={signoffStyle}>{c.signoff}</Text>
    </EmailLayout>
  );
}

const h1Style: React.CSSProperties = {
  margin: '0 0 12px',
  fontFamily: T.font.heading,
  fontSize: 26,
  fontWeight: 700,
  lineHeight: '1.2',
  color: T.color.textPrimary,
};

const leadStyle: React.CSSProperties = {
  margin: '0 0 24px',
  fontSize: 16,
  lineHeight: '1.6',
  color: T.color.textPrimary,
};

const sectionHeadingStyle: React.CSSProperties = {
  margin: '12px 0 8px',
  fontFamily: T.font.heading,
  fontSize: 13,
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
  color: T.color.green700,
};

const recipientLineStyle: React.CSSProperties = {
  margin: '20px 0 0',
  fontSize: 12,
  color: T.color.textMuted,
  lineHeight: '1.4',
};

const signoffStyle: React.CSSProperties = {
  margin: '6px 0 0',
  fontSize: 14,
  color: T.color.textSecondary,
  fontStyle: 'italic' as const,
};

export default NewsletterWelcomeEmail;

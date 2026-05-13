/**
 * Knowledge-base digest for the AI chat backend (Phase 2.09).
 *
 * Composes a ~5K-token plain-text digest covering Sunset Services' identity,
 * service area, services, FAQs, and contact info. Built once per locale at
 * first request and memoised for 30 minutes (matches the site's ISR cadence).
 *
 * Source-of-truth:
 *  - Services + locations + FAQs come from Sanity via narrow chat-specific
 *    projections in `sanity/lib/queries.ts` (Phase 2.09 helpers).
 *  - Team bios come from `src/data/team.ts` (Phase 1.12 — TS, not Sanity).
 *  - NAP + hours come from `src/lib/constants/business.ts` and i18n messages.
 *
 * Pinned at module load — counters reset on every Vercel function cold start,
 * same caveat as the in-memory rate limiter. Acceptable given preview is
 * SSO-gated; see Sunset-Services-Decisions.md "Phase 2.09 knowledge-base
 * approach + caching".
 */

import {
  getAllServicesForChat,
  getAllLocationsForChat,
  getTopFaqsForChat,
  type ChatServiceEntry,
  type ChatFaqEntry,
} from '@sanity-lib/queries';
import {team} from '@/data/team';
import {
  BUSINESS_NAME,
  BUSINESS_PHONE,
  BUSINESS_EMAIL,
  BUSINESS_ADDRESS_LINE1,
  BUSINESS_ADDRESS_LINE2,
} from '@/lib/constants/business';

type CacheEntry = {digest: string; builtAt: number};

const cache: Record<'en' | 'es', CacheEntry | null> = {en: null, es: null};
const TTL_MS = 30 * 60 * 1000;

export async function buildKnowledgeDigest(locale: 'en' | 'es'): Promise<string> {
  const cached = cache[locale];
  const now = Date.now();
  if (cached && now - cached.builtAt < TTL_MS) return cached.digest;
  const digest = await composeDigest(locale);
  cache[locale] = {digest, builtAt: now};
  return digest;
}

/** Optional: warm both locale digests at module load. */
export async function warmKnowledgeDigest(): Promise<void> {
  await Promise.all([buildKnowledgeDigest('en'), buildKnowledgeDigest('es')]);
}

async function composeDigest(locale: 'en' | 'es'): Promise<string> {
  const [services, locations, faqs] = await Promise.all([
    getAllServicesForChat(locale),
    getAllLocationsForChat(locale),
    getTopFaqsForChat(locale, 10),
  ]);

  const residential = services.filter((s) => s.audience === 'residential');
  const commercial = services.filter((s) => s.audience === 'commercial');
  const hardscape = services.filter((s) => s.audience === 'hardscape');

  const L = LOCALE_LABELS[locale];

  const sections: string[] = [];

  // 1. Who we are
  sections.push(
    `## ${L.whoWeAre}\n${L.identityLine1}\n${L.identityLine2}\n` +
      `${L.phoneLabel}: ${BUSINESS_PHONE}\n` +
      `${L.emailLabel}: ${BUSINESS_EMAIL}\n` +
      `${L.addressLabel}: ${BUSINESS_ADDRESS_LINE1}, ${BUSINESS_ADDRESS_LINE2}\n` +
      `${L.hoursLabel}: ${L.hoursValue}`,
  );

  // 2. Where we work
  if (locations.length > 0) {
    const lines = locations.map((loc) => `${loc.name}, IL — ${loc.tagline || L.fallbackTagline}`);
    sections.push(`## ${L.whereWeWork}\n${lines.join('\n')}`);
  }

  // 3. What we do — Residential
  if (residential.length > 0) {
    sections.push(`## ${L.residentialHeading}\n${residential.map((s) => formatService(s, L)).join('\n')}`);
  }

  // 4. What we do — Commercial
  if (commercial.length > 0) {
    sections.push(`## ${L.commercialHeading}\n${commercial.map((s) => formatService(s, L)).join('\n')}`);
  }

  // 5. What we do — Hardscape (mention Unilock-Authorized at section head)
  if (hardscape.length > 0) {
    sections.push(
      `## ${L.hardscapeHeading}\n${L.unilockLine}\n${hardscape.map((s) => formatService(s, L)).join('\n')}`,
    );
  }

  // 6. Team — three one-line bios
  sections.push(
    `## ${L.teamHeading}\n` +
      team
        .map((m) => `${m.name} — ${L.roleLabels[m.roleKey]}. ${L.bios[m.bioKey]}`)
        .join('\n'),
  );

  // 7. Common questions
  if (faqs.length > 0) {
    sections.push(`## ${L.faqHeading}\n${faqs.map(formatFaq).join('\n\n')}`);
  }

  // 8. Contact (repeat + current promotions)
  sections.push(
    `## ${L.contactHeading}\n` +
      `${L.phoneLabel}: ${BUSINESS_PHONE}\n` +
      `${L.emailLabel}: ${BUSINESS_EMAIL}\n` +
      `${L.addressLabel}: ${BUSINESS_ADDRESS_LINE1}, ${BUSINESS_ADDRESS_LINE2}\n` +
      `${L.hoursLabel}: ${L.hoursValue}\n` +
      `${L.promotionsLabel}: ${L.promotionsNone}`,
  );

  return `${BUSINESS_NAME} — ${L.docTitle}\n\n${sections.join('\n\n')}`;
}

function formatService(s: ChatServiceEntry, L: LocaleLabels): string {
  const pricing =
    s.pricingMode === 'price' && s.priceIncludes.length > 0
      ? `${L.pricingPriceIncludes}: ${s.priceIncludes.join('; ')}`
      : L.pricingExplainer;
  const dek = s.dek?.trim() ? s.dek.trim() : L.dekFallback;
  return `- ${s.title} — ${dek} ${L.pricingWord}: ${pricing}`;
}

function formatFaq(f: ChatFaqEntry): string {
  return `Q: ${f.q}\nA: ${f.a}`;
}

type LocaleLabels = {
  docTitle: string;
  whoWeAre: string;
  identityLine1: string;
  identityLine2: string;
  phoneLabel: string;
  emailLabel: string;
  addressLabel: string;
  hoursLabel: string;
  hoursValue: string;
  whereWeWork: string;
  fallbackTagline: string;
  residentialHeading: string;
  commercialHeading: string;
  hardscapeHeading: string;
  unilockLine: string;
  teamHeading: string;
  faqHeading: string;
  contactHeading: string;
  promotionsLabel: string;
  promotionsNone: string;
  pricingWord: string;
  pricingExplainer: string;
  pricingPriceIncludes: string;
  dekFallback: string;
  roleLabels: Record<'owner' | 'founder' | 'hardscape_lead', string>;
  bios: Record<'erick' | 'nick' | 'marcin', string>;
};

const EN: LocaleLabels = {
  docTitle: 'Internal knowledge digest for the chat assistant',
  whoWeAre: 'Who we are',
  identityLine1:
    'Sunset Services is a family-run landscaping and outdoor-living company founded in 2001 and headquartered in Aurora, IL.',
  identityLine2:
    'We serve residential and commercial clients across DuPage County with grounds care, design-build, and hardscape installation.',
  phoneLabel: 'Phone',
  emailLabel: 'Email',
  addressLabel: 'Address',
  hoursLabel: 'Hours',
  hoursValue: 'Mon–Fri 7:00 AM – 5:00 PM · Sat by appointment · Sun closed',
  whereWeWork: 'Where we work',
  fallbackTagline: 'DuPage County service area',
  residentialHeading: 'What we do — Residential',
  commercialHeading: 'What we do — Commercial',
  hardscapeHeading: 'What we do — Hardscape',
  unilockLine: 'Sunset Services is a Unilock-Authorized Contractor.',
  teamHeading: 'Team',
  faqHeading: 'Common questions',
  contactHeading: 'Contact',
  promotionsLabel: 'Current promotions',
  promotionsNone: 'None at this time.',
  pricingWord: 'Pricing',
  pricingExplainer:
    'Custom estimate based on scope, materials, and site conditions; itemized quote returned within 48 hours of the site visit.',
  pricingPriceIncludes: 'Starts-at price includes',
  dekFallback: 'Service offered by Sunset Services.',
  roleLabels: {
    owner: 'Owner',
    founder: 'Founder',
    hardscape_lead: 'Hardscape Lead',
  },
  bios: {
    erick:
      'Took over operations from his father Nick in 2018; runs estimates, project oversight, and customer relationships.',
    nick: 'Founded Sunset Services in 2001; still consults on tree work and complex grading.',
    marcin:
      'Leads the hardscape crew; Unilock-trained, specialises in paver patios, walls, and outdoor kitchens.',
  },
};

// [TBR] Spanish — placeholder translations. Replace with native-speaker review
// in Phase 2.13 alongside the rest of the inline ES `[TBR]` strings.
const ES: LocaleLabels = {
  docTitle: 'Resumen interno para el asistente de chat',
  whoWeAre: 'Quiénes somos',
  identityLine1:
    'Sunset Services es una empresa familiar de paisajismo y espacios al aire libre, fundada en 2001 con sede en Aurora, IL.',
  identityLine2:
    'Atendemos a clientes residenciales y comerciales en el condado de DuPage con mantenimiento, diseño-construcción e instalación de pavimentación.',
  phoneLabel: 'Teléfono',
  emailLabel: 'Correo',
  addressLabel: 'Dirección',
  hoursLabel: 'Horario',
  hoursValue: 'Lun–Vie 7:00 AM – 5:00 PM · Sáb con cita · Dom cerrado',
  whereWeWork: 'Dónde trabajamos',
  fallbackTagline: 'Área de servicio del condado de DuPage',
  residentialHeading: 'Lo que hacemos — Residencial',
  commercialHeading: 'Lo que hacemos — Comercial',
  hardscapeHeading: 'Lo que hacemos — Pavimentación',
  unilockLine: 'Sunset Services es Contratista Autorizado por Unilock.',
  teamHeading: 'Equipo',
  faqHeading: 'Preguntas frecuentes',
  contactHeading: 'Contacto',
  promotionsLabel: 'Promociones actuales',
  promotionsNone: 'Ninguna por ahora.',
  pricingWord: 'Precio',
  pricingExplainer:
    'Presupuesto personalizado según el alcance, materiales y condiciones del sitio; cotización detallada en un plazo de 48 horas tras la visita.',
  pricingPriceIncludes: 'Precio desde — incluye',
  dekFallback: 'Servicio ofrecido por Sunset Services.',
  roleLabels: {
    owner: 'Propietario',
    founder: 'Fundador',
    hardscape_lead: 'Líder de pavimentación',
  },
  bios: {
    erick:
      'Asumió las operaciones de su padre Nick en 2018; lleva los presupuestos, la supervisión y la relación con los clientes.',
    nick:
      'Fundó Sunset Services en 2001; sigue asesorando en trabajos de arboricultura y nivelación compleja.',
    marcin:
      'Dirige el equipo de pavimentación; capacitado por Unilock, especializado en patios, muros y cocinas al aire libre.',
  },
};

const LOCALE_LABELS: Record<'en' | 'es', LocaleLabels> = {en: EN, es: ES};

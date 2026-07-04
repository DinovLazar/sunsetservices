/**
 * Team seed (Phase 1.12 §11.1 of the Phase 1.11 handover).
 *
 * Polish-01: the About "The Team" section (and its Person JSON-LD) was
 * removed — the cards only ever showed placeholder initial-avatars. This
 * file's sole remaining consumer is the chat knowledge base
 * (`src/lib/chat/knowledgeBase.ts`), which embeds its own bilingual role
 * labels + bios and reads only `name`/`roleKey`/`bioKey` from here.
 *
 * Three members in the order Erick → Nick → Marcin (current owner foregrounded,
 * founder bridge, hardscape lead closes the trio). Names are NOT localized —
 * names are names.
 *
 * D13 (Marcin's last name): unresolved. Shipped as `Marcin` alone.
 */

export type TeamRoleKey = 'owner' | 'founder' | 'hardscape_lead';
export type TeamSlug = 'erick' | 'nick' | 'marcin';

export type TeamMember = {
  slug: TeamSlug;
  name: string;
  roleKey: TeamRoleKey;
  bioKey: TeamSlug;
};

export const team: TeamMember[] = [
  {
    slug: 'erick',
    name: 'Erick Valle',
    roleKey: 'owner',
    bioKey: 'erick',
  },
  {
    slug: 'nick',
    name: 'Nick Valle',
    roleKey: 'founder',
    bioKey: 'nick',
  },
  {
    slug: 'marcin',
    name: 'Marcin',
    roleKey: 'hardscape_lead',
    bioKey: 'marcin',
  },
];

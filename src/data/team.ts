/**
 * Team seed for the About page (Phase 1.12 §11.1 of the Phase 1.11 handover).
 *
 * Three members in the order Erick → Nick → Marcin (current owner foregrounded,
 * founder bridge, hardscape lead closes the trio). Names are NOT localized —
 * names are names. Roles + bios are translation keys; visible text resolves
 * via `about.team.role.*` and `about.team.<slug>.bio` in `messages/{en,es}.json`.
 *
 * D13 (Marcin's last name): unresolved. Shipped as `Marcin` alone. Surfaced
 * in the Phase 1.12 completion report under Open items — Cowork populates in
 * Part 2.04 alongside team photography.
 *
 * Phase M.10 (Issue 5): `photo` is now optional. With no `photo` value,
 * `TeamCard` renders the brand-consistent `<InitialsAvatar/>` in the photo
 * slot. When real portraits arrive from Erick in M.03, add the import +
 * `photo: {src: ..., aspect: '4x5'}` per member; no consumer change needed.
 */

import type {StaticImageData} from 'next/image';

export type TeamRoleKey = 'owner' | 'founder' | 'hardscape_lead';
export type TeamSlug = 'erick' | 'nick' | 'marcin';

export type TeamMember = {
  slug: TeamSlug;
  name: string;
  roleKey: TeamRoleKey;
  bioKey: TeamSlug;
  photo?: {
    src: StaticImageData;
    aspect: '4x5';
  };
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

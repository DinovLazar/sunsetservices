/**
 * Person JSON-LD payload builder per Phase 1.11 handover §5.1.
 *
 * One Person node per team member is emitted on /about/. The sitewide
 * LocalBusiness (Phase 1.05 root layout) supplies the `worksFor` reference
 * via its `@id`.
 */

import {BUSINESS_URL} from '@/lib/constants/business';
import type {TeamMember} from '@/data/team';

const ROLE_LABEL: Record<TeamMember['roleKey'], string> = {
  owner: 'Owner',
  founder: 'Founder',
  hardscape_lead: 'Hardscape Lead',
};

export function buildPersonSchema(member: TeamMember) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: member.name,
    jobTitle: ROLE_LABEL[member.roleKey],
    worksFor: {'@id': `${BUSINESS_URL}/#localbusiness`},
    image: `${BUSINESS_URL}/images/team/${member.slug}.avif`,
  };
}

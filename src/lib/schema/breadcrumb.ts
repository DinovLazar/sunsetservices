/**
 * BreadcrumbList JSON-LD payload builder per Phase 1.08 §5.
 *
 * Both audience-landing and service-detail pages emit a BreadcrumbList
 * in the page <head>. The same items array drives the visible
 * <Breadcrumb> + the schema so they can never drift.
 */

import {BUSINESS_URL} from '@/lib/constants/business';

export type BreadcrumbItem = {
  /** Display name. */
  name: string;
  /**
   * Either a path (`/residential/`) — the helper joins to BUSINESS_URL —
   * or a fully-qualified URL.
   */
  item: string;
};

function toAbsolute(itemOrPath: string): string {
  if (/^https?:\/\//.test(itemOrPath)) return itemOrPath;
  const path = itemOrPath.startsWith('/') ? itemOrPath : `/${itemOrPath}`;
  return `${BUSINESS_URL}${path}`;
}

export function buildBreadcrumbList(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: it.name,
      item: toAbsolute(it.item),
    })),
  };
}

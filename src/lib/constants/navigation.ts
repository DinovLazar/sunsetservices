/**
 * Single source of truth for the site's navigation IA. Phase 1.05 chrome
 * (navbar, mega-panels, footer) all read from here so the IA cannot drift
 * between the desktop nav, the mobile drawer, and the footer link grid.
 *
 * Translation keys are scoped under `chrome.*` in messages/{en,es}.json.
 * Hrefs are locale-relative — the next-intl <Link> component prepends /es
 * when needed.
 */

export type TopNavItem =
  | {
      readonly id: 'services' | 'resources';
      readonly kind: 'mega-panel';
      readonly labelKey: string;
      readonly panelId: string;
    }
  | {
      readonly id: 'projects' | 'service-areas' | 'about' | 'contact';
      readonly kind: 'link';
      readonly labelKey: string;
      readonly href: string;
    };

export const NAV_TOP_LEVEL: readonly TopNavItem[] = [
  {
    id: 'services',
    kind: 'mega-panel',
    labelKey: 'chrome.nav.services',
    panelId: 'services-mega-panel',
  },
  {
    id: 'projects',
    kind: 'link',
    labelKey: 'chrome.nav.projects',
    href: '/projects/',
  },
  {
    id: 'service-areas',
    kind: 'link',
    labelKey: 'chrome.nav.serviceAreas',
    href: '/service-areas/',
  },
  {id: 'about', kind: 'link', labelKey: 'chrome.nav.about', href: '/about/'},
  {
    id: 'resources',
    kind: 'mega-panel',
    labelKey: 'chrome.nav.resources',
    panelId: 'resources-mega-panel',
  },
  {
    id: 'contact',
    kind: 'link',
    labelKey: 'chrome.nav.contact',
    href: '/contact/',
  },
] as const;

export type ServicesColumn = {
  readonly id: 'residential' | 'commercial' | 'hardscape';
  readonly headerKey: string;
  readonly headerHref: string;
  readonly children: readonly {readonly labelKey: string; readonly href: string}[];
};

export const SERVICES_PANEL: readonly ServicesColumn[] = [
  {
    id: 'residential',
    headerKey: 'chrome.nav.servicesPanel.residentialTitle',
    headerHref: '/residential/',
    children: [
      {
        labelKey: 'chrome.nav.servicesPanel.residential.lawnCare',
        href: '/residential/lawn-care/',
      },
      {
        labelKey: 'chrome.nav.servicesPanel.residential.landscapeDesign',
        href: '/residential/landscape-design/',
      },
      {
        labelKey: 'chrome.nav.servicesPanel.residential.treeServices',
        href: '/residential/tree-services/',
      },
      {
        labelKey: 'chrome.nav.servicesPanel.residential.sprinklerSystems',
        href: '/residential/sprinkler-systems/',
      },
      {
        labelKey: 'chrome.nav.servicesPanel.residential.snowRemoval',
        href: '/residential/snow-removal/',
      },
      {
        labelKey: 'chrome.nav.servicesPanel.residential.seasonalCleanup',
        href: '/residential/seasonal-cleanup/',
      },
    ],
  },
  {
    id: 'commercial',
    headerKey: 'chrome.nav.servicesPanel.commercialTitle',
    headerHref: '/commercial/',
    children: [
      {
        labelKey: 'chrome.nav.servicesPanel.commercial.maintenance',
        href: '/commercial/landscape-maintenance/',
      },
      {
        labelKey: 'chrome.nav.servicesPanel.commercial.snowRemoval',
        href: '/commercial/snow-removal/',
      },
      {
        labelKey: 'chrome.nav.servicesPanel.commercial.propertyEnhancement',
        href: '/commercial/property-enhancement/',
      },
      {
        labelKey: 'chrome.nav.servicesPanel.commercial.turfManagement',
        href: '/commercial/turf-management/',
      },
    ],
  },
  {
    id: 'hardscape',
    headerKey: 'chrome.nav.servicesPanel.hardscapeTitle',
    headerHref: '/hardscape/',
    children: [
      {
        labelKey: 'chrome.nav.servicesPanel.hardscape.patiosWalkways',
        href: '/hardscape/patios-walkways/',
      },
      {
        labelKey: 'chrome.nav.servicesPanel.hardscape.retainingWalls',
        href: '/hardscape/retaining-walls/',
      },
      {
        labelKey: 'chrome.nav.servicesPanel.hardscape.firePitsFeatures',
        href: '/hardscape/fire-pits-features/',
      },
      {
        labelKey: 'chrome.nav.servicesPanel.hardscape.pergolasPavilions',
        href: '/hardscape/pergolas-pavilions/',
      },
      {
        labelKey: 'chrome.nav.servicesPanel.hardscape.driveways',
        href: '/hardscape/driveways/',
      },
      {
        labelKey: 'chrome.nav.servicesPanel.hardscape.outdoorKitchens',
        href: '/hardscape/outdoor-kitchens/',
      },
    ],
  },
] as const;

export type ResourcesColumn = {
  readonly id: 'resources' | 'blog';
  readonly headerKey: string;
  readonly headerHref: string;
  readonly placeholderKeys: readonly string[];
};

/**
 * Resources panel children are static placeholder strings in Part 1; Phase 2.x
 * swaps to Sanity reads. Locking the structure now means the layout doesn't
 * change when Sanity wires up.
 */
export const RESOURCES_PANEL: readonly ResourcesColumn[] = [
  {
    id: 'resources',
    headerKey: 'chrome.nav.resourcesPanel.resourcesTitle',
    headerHref: '/resources/',
    placeholderKeys: [
      'chrome.nav.resourcesPanel.resourcesPlaceholders.one',
      'chrome.nav.resourcesPanel.resourcesPlaceholders.two',
      'chrome.nav.resourcesPanel.resourcesPlaceholders.three',
      'chrome.nav.resourcesPanel.resourcesPlaceholders.four',
    ],
  },
  {
    id: 'blog',
    headerKey: 'chrome.nav.resourcesPanel.blogTitle',
    headerHref: '/blog/',
    placeholderKeys: [
      'chrome.nav.resourcesPanel.blogPlaceholders.one',
      'chrome.nav.resourcesPanel.blogPlaceholders.two',
      'chrome.nav.resourcesPanel.blogPlaceholders.three',
    ],
  },
] as const;

export type FooterColumn = {
  readonly id: 'services' | 'company' | 'resources';
  readonly headingKey: string;
  readonly children: readonly {readonly labelKey: string; readonly href: string}[];
};

export const FOOTER_LINKS: readonly FooterColumn[] = [
  {
    id: 'services',
    headingKey: 'chrome.footer.servicesHeading',
    children: [
      {labelKey: 'chrome.footer.links.residential', href: '/residential/'},
      {labelKey: 'chrome.footer.links.commercial', href: '/commercial/'},
      {labelKey: 'chrome.footer.links.hardscape', href: '/hardscape/'},
      {labelKey: 'chrome.footer.links.snowRemoval', href: '/residential/snow-removal/'},
      {labelKey: 'chrome.footer.links.allServices', href: '/residential/'},
    ],
  },
  {
    id: 'company',
    headingKey: 'chrome.footer.companyHeading',
    children: [
      {labelKey: 'chrome.nav.about', href: '/about/'},
      {labelKey: 'chrome.nav.projects', href: '/projects/'},
      {labelKey: 'chrome.nav.serviceAreas', href: '/service-areas/'},
      {labelKey: 'chrome.nav.contact', href: '/contact/'},
    ],
  },
  {
    id: 'resources',
    headingKey: 'chrome.footer.resourcesHeading',
    children: [
      {labelKey: 'chrome.nav.resources', href: '/resources/'},
      {labelKey: 'chrome.footer.links.blog', href: '/blog/'},
      {labelKey: 'chrome.footer.privacy', href: '/privacy/'},
      {labelKey: 'chrome.footer.terms', href: '/terms/'},
      {labelKey: 'chrome.footer.accessibility', href: '/accessibility/'},
    ],
  },
] as const;

export type ServiceAreaCity = {
  readonly id: string;
  readonly labelKey: string;
  readonly href: string;
};

export const SERVICE_AREAS_CITIES: readonly ServiceAreaCity[] = [
  {id: 'aurora', labelKey: 'chrome.footer.cities.aurora', href: '/service-areas/aurora/'},
  {id: 'naperville', labelKey: 'chrome.footer.cities.naperville', href: '/service-areas/naperville/'},
  {id: 'batavia', labelKey: 'chrome.footer.cities.batavia', href: '/service-areas/batavia/'},
  {id: 'wheaton', labelKey: 'chrome.footer.cities.wheaton', href: '/service-areas/wheaton/'},
  {id: 'lisle', labelKey: 'chrome.footer.cities.lisle', href: '/service-areas/lisle/'},
  {id: 'bolingbrook', labelKey: 'chrome.footer.cities.bolingbrook', href: '/service-areas/bolingbrook/'},
] as const;

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

/**
 * Phase M.01e — navbar mega-panel rewired by division (was by audience).
 * Phase B.12 — added the trenchless division: 5 service columns + 1
 * service-areas column. Mobile menu mirrors the same structure as a
 * 5-section accordion under "Services" plus a "Service areas" link.
 */
export type ServicesColumn = {
  readonly id:
    | 'landscape'
    | 'hardscape'
    | 'waterproofing'
    | 'snow-removal'
    | 'trenchless'
    | 'service-areas';
  readonly headerKey: string;
  readonly headerHref: string;
  readonly children: readonly {readonly labelKey: string; readonly href: string}[];
};

export const SERVICES_PANEL: readonly ServicesColumn[] = [
  {
    id: 'landscape',
    headerKey: 'chrome.nav.servicesPanel.landscapeTitle',
    headerHref: '/landscape/',
    children: [
      {labelKey: 'chrome.nav.servicesPanel.landscape.lawnCare', href: '/landscape/lawn-care/'},
      {labelKey: 'chrome.nav.servicesPanel.landscape.landscapeDesign', href: '/landscape/landscape-design/'},
      {labelKey: 'chrome.nav.servicesPanel.landscape.treeServices', href: '/landscape/tree-services/'},
      {labelKey: 'chrome.nav.servicesPanel.landscape.sprinklerSystems', href: '/landscape/sprinkler-systems/'},
      {labelKey: 'chrome.nav.servicesPanel.landscape.seasonalCleanup', href: '/landscape/seasonal-cleanup/'},
      {labelKey: 'chrome.nav.servicesPanel.landscape.maintenance', href: '/landscape/landscape-maintenance/'},
      {labelKey: 'chrome.nav.servicesPanel.landscape.propertyEnhancement', href: '/landscape/property-enhancement/'},
      {labelKey: 'chrome.nav.servicesPanel.landscape.turfManagement', href: '/landscape/turf-management/'},
    ],
  },
  {
    id: 'hardscape',
    headerKey: 'chrome.nav.servicesPanel.hardscapeTitle',
    headerHref: '/hardscape/',
    children: [
      {labelKey: 'chrome.nav.servicesPanel.hardscape.patiosWalkways', href: '/hardscape/patios-walkways/'},
      {labelKey: 'chrome.nav.servicesPanel.hardscape.retainingWalls', href: '/hardscape/retaining-walls/'},
      {labelKey: 'chrome.nav.servicesPanel.hardscape.firePitsFeatures', href: '/hardscape/fire-pits-features/'},
      {labelKey: 'chrome.nav.servicesPanel.hardscape.pergolasPavilions', href: '/hardscape/pergolas-pavilions/'},
      {labelKey: 'chrome.nav.servicesPanel.hardscape.driveways', href: '/hardscape/driveways/'},
      {labelKey: 'chrome.nav.servicesPanel.hardscape.outdoorKitchens', href: '/hardscape/outdoor-kitchens/'},
    ],
  },
  {
    id: 'waterproofing',
    headerKey: 'chrome.nav.servicesPanel.waterproofingTitle',
    headerHref: '/waterproofing/',
    children: [
      {labelKey: 'chrome.nav.servicesPanel.waterproofing.basementWaterproofing', href: '/waterproofing/basement-waterproofing/'},
      {labelKey: 'chrome.nav.servicesPanel.waterproofing.foundationRepair', href: '/waterproofing/foundation-repair/'},
      {labelKey: 'chrome.nav.servicesPanel.waterproofing.sumpPumps', href: '/waterproofing/sump-pumps/'},
      {labelKey: 'chrome.nav.servicesPanel.waterproofing.yardDrainage', href: '/waterproofing/yard-drainage/'},
      {labelKey: 'chrome.nav.servicesPanel.waterproofing.gutterServices', href: '/waterproofing/gutter-services/'},
      {labelKey: 'chrome.nav.servicesPanel.waterproofing.windowWells', href: '/waterproofing/window-wells/'},
      {labelKey: 'chrome.nav.servicesPanel.waterproofing.crawlSpaces', href: '/waterproofing/crawl-spaces/'},
      {labelKey: 'chrome.nav.servicesPanel.waterproofing.concreteRaising', href: '/waterproofing/concrete-raising/'},
      {labelKey: 'chrome.nav.servicesPanel.waterproofing.humidityControl', href: '/waterproofing/humidity-control/'},
      {labelKey: 'chrome.nav.servicesPanel.waterproofing.radonMitigation', href: '/waterproofing/radon-mitigation/'},
    ],
  },
  {
    id: 'snow-removal',
    headerKey: 'chrome.nav.servicesPanel.snowRemovalTitle',
    headerHref: '/snow-removal/',
    children: [
      {labelKey: 'chrome.nav.servicesPanel.snowRemoval.driveway', href: '/snow-removal/driveway-snow-removal/'},
      {labelKey: 'chrome.nav.servicesPanel.snowRemoval.sidewalk', href: '/snow-removal/sidewalk-shoveling/'},
      {labelKey: 'chrome.nav.servicesPanel.snowRemoval.deIcing', href: '/snow-removal/de-icing/'},
      {labelKey: 'chrome.nav.servicesPanel.snowRemoval.commercial', href: '/snow-removal/commercial-snow-plowing/'},
    ],
  },
  {
    id: 'trenchless',
    headerKey: 'chrome.nav.servicesPanel.trenchlessTitle',
    headerHref: '/trenchless/',
    children: [
      {labelKey: 'chrome.nav.servicesPanel.trenchless.conduitInstallation', href: '/trenchless/conduit-installation/'},
      {labelKey: 'chrome.nav.servicesPanel.trenchless.trenchingExcavation', href: '/trenchless/trenching-excavation/'},
      {labelKey: 'chrome.nav.servicesPanel.trenchless.sewerLineReplacement', href: '/trenchless/sewer-line-replacement/'},
      {labelKey: 'chrome.nav.servicesPanel.trenchless.missileBoring', href: '/trenchless/missile-boring/'},
      {labelKey: 'chrome.nav.servicesPanel.trenchless.handholePullBox', href: '/trenchless/handhole-pull-box/'},
      {labelKey: 'chrome.nav.servicesPanel.trenchless.pipeFusing', href: '/trenchless/pipe-fusing/'},
    ],
  },
  {
    id: 'service-areas',
    headerKey: 'chrome.nav.servicesPanel.serviceAreasTitle',
    headerHref: '/service-areas/',
    children: [
      {labelKey: 'chrome.footer.cities.aurora', href: '/service-areas/aurora/'},
      {labelKey: 'chrome.footer.cities.naperville', href: '/service-areas/naperville/'},
      {labelKey: 'chrome.footer.cities.wheaton', href: '/service-areas/wheaton/'},
      {labelKey: 'chrome.footer.cities.batavia', href: '/service-areas/batavia/'},
      {labelKey: 'chrome.nav.servicesPanel.serviceAreas.oakBrook', href: '/service-areas/oak-brook/'},
      {labelKey: 'chrome.nav.servicesPanel.serviceAreas.hinsdale', href: '/service-areas/hinsdale/'},
      {labelKey: 'chrome.nav.servicesPanel.serviceAreas.seeAll', href: '/service-areas/'},
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
 * Resources mega-panel columns.
 *
 * Phase M.14 (Goran QA B-09 §3.11): the panel previously listed invented
 * article titles whose links ALL pointed at the hub (`/resources/`, `/blog/`)
 * rather than at real articles — misleading. Those placeholder children were
 * removed; the column headers still link to the real index pages, which list
 * the actual published articles. M.14b (or a later content phase) can wire
 * the children to real article titles + slugs from Sanity.
 */
export const RESOURCES_PANEL: readonly ResourcesColumn[] = [
  {
    id: 'resources',
    headerKey: 'chrome.nav.resourcesPanel.resourcesTitle',
    headerHref: '/resources/',
    placeholderKeys: [],
  },
  {
    id: 'blog',
    headerKey: 'chrome.nav.resourcesPanel.blogTitle',
    headerHref: '/blog/',
    placeholderKeys: [],
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
      {labelKey: 'chrome.footer.links.landscape', href: '/landscape/'},
      {labelKey: 'chrome.footer.links.hardscape', href: '/hardscape/'},
      {labelKey: 'chrome.footer.links.waterproofing', href: '/waterproofing/'},
      {labelKey: 'chrome.footer.links.snowRemoval', href: '/snow-removal/'},
      {labelKey: 'chrome.footer.links.trenchless', href: '/trenchless/'},
      {labelKey: 'chrome.footer.links.allServices', href: '/landscape/'},
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

/**
 * Footer curated cities — mirrors the navbar mega-panel's service-areas
 * column so the chrome's two service-area surfaces are visually
 * consistent. Phase M.10 Issue 9 Part A replaced the M.01d 6-city list
 * (which still carried the retired Lisle + Bolingbrook). The "See all"
 * row routes to the full /service-areas/ index that lists all 22.
 */
export const SERVICE_AREAS_CITIES: readonly ServiceAreaCity[] = [
  {id: 'aurora', labelKey: 'chrome.footer.cities.aurora', href: '/service-areas/aurora/'},
  {id: 'naperville', labelKey: 'chrome.footer.cities.naperville', href: '/service-areas/naperville/'},
  {id: 'wheaton', labelKey: 'chrome.footer.cities.wheaton', href: '/service-areas/wheaton/'},
  {id: 'batavia', labelKey: 'chrome.footer.cities.batavia', href: '/service-areas/batavia/'},
  {id: 'oak-brook', labelKey: 'chrome.footer.cities.oakBrook', href: '/service-areas/oak-brook/'},
  {id: 'hinsdale', labelKey: 'chrome.footer.cities.hinsdale', href: '/service-areas/hinsdale/'},
  {id: 'see-all', labelKey: 'chrome.footer.cities.seeAll', href: '/service-areas/'},
] as const;

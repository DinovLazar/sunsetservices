/**
 * Phase 1.14 — typed bilingual seed for the six Sunset Services location
 * pages (DuPage County). Mirrors the `services.ts` shape from Phase 1.09.
 *
 * Open items:
 * - `trust.*` numbers are representative placeholders. Cowork (Phase 2.04)
 *   confirms with Erick.
 * - `geo.lat`/`geo.lng` are representative public-source values; Cowork
 *   (Phase 2.07) confirms map-pin precision.
 * - `address.postalCode` is omitted on city pages until Cowork returns it
 *   (Schema.org accepts the page without; see `lib/schema/location.ts`).
 * - `whyLocal` and `testimonials` Spanish strings ship as a first-pass
 *   draft; Phase 2.13 native review polishes. (FAQ Spanish strings moved
 *   to Sanity in Phase 2.05.)
 * - Real photography swaps in Phase 2.04; until then the hero `photoSlot`
 *   resolves through the existing `imageMap` AVIF placeholders.
 */

import type {Division} from './services';

export type LocationLocalized = {en: string; es: string};

export type LocationCitySlug =
  // Phase 1.14 — original 6 cities
  | 'aurora'
  | 'naperville'
  | 'batavia'
  | 'wheaton'
  | 'lisle'
  | 'bolingbrook'
  // Phase M.01d — 18 new cities (added 2026-05-26)
  | 'hinsdale'
  | 'oak-brook'
  | 'elmhurst'
  | 'clarendon-hills'
  | 'burr-ridge'
  | 'western-springs'
  | 'glen-ellyn'
  | 'downers-grove'
  | 'winfield'
  | 'lombard'
  | 'st-charles'
  | 'geneva'
  | 'south-elgin'
  | 'elburn'
  | 'north-aurora'
  | 'oswego'
  | 'yorkville'
  | 'plainfield';

export type LocationFeaturedService = {
  slug: string;
  /**
   * Phase M.01e — `division` replaces `audience` as the URL-segment dictator
   * for service links. Each featured-service entry resolves to
   * `/<locale>/<division>/<slug>/`.
   */
  division: Division;
};

export type LocationTestimonial = {
  quote: LocationLocalized;
  attribution: LocationLocalized;
  /** Fixed 5 in Part 1; real ratings arrive Phase 2.15. */
  rating: 5;
};

export type LocationCity = {
  slug: LocationCitySlug;
  /** Proper noun, stable across locales. */
  name: string;
  state: 'IL';
  /** Representative public-source lat/lng; Cowork confirms in Phase 2.07. */
  geo: {lat: number; lng: number};
  /** SVG-coordinate position on the §3.2 production map (viewBox 600×500). */
  pin: {x: number; y: number};
  hero: {
    h1: LocationLocalized;
    sub: LocationLocalized;
    /** Image-asset key — Phase 2.04 swaps to real photography. */
    photoSlot: string;
  };
  /** Placeholder numbers; Cowork (Phase 2.04) confirms with Erick. */
  trust: {
    yearsServing: number;
    projectsCompleted: number;
    responseTimeDays: number;
  };
  /** Length 6 (D6 fixed). */
  featuredServices: LocationFeaturedService[];
  /** ~120 words per locale. */
  whyLocal: LocationLocalized;
  testimonials: LocationTestimonial[];
  meta: {
    title: LocationLocalized;
    description: LocationLocalized;
  };
};

export const LOCATIONS: LocationCity[] = [
  {
    slug: 'aurora',
    name: 'Aurora',
    state: 'IL',
    geo: {lat: 41.7606, lng: -88.3201},
    pin: {x: 201.2, y: 297.7},
    hero: {
      h1: {
        en: 'Landscaping & Hardscape in Aurora, IL',
        es: 'Paisajismo y Hardscape en Aurora, IL',
      },
      sub: {
        en: 'Family-run since 2000. Serving Aurora homeowners and businesses.',
        es: 'Familiar desde el año 2000. Atendiendo a hogares y negocios de Aurora.',
      },
      photoSlot: 'location.aurora.hero',
    },
    trust: {yearsServing: 25, projectsCompleted: 200, responseTimeDays: 5},
    featuredServices: [
      {slug: 'lawn-care', division: 'landscape'},
      {slug: 'landscape-design', division: 'landscape'},
      {slug: 'patios-walkways', division: 'hardscape'},
      {slug: 'retaining-walls', division: 'hardscape'},
      {slug: 'sump-pumps', division: 'waterproofing'},
      {slug: 'commercial-snow-plowing', division: 'snow-removal'},
    ],
    whyLocal: {
      en: "Aurora is home. The yard our trucks pull out of every morning sits on Mountain Street, and a quarter of our jobs are within a ten-minute drive of it. We know which subdivisions on the east side have curb cuts that won't fit a skid steer, which streets the city plows last after a heavy storm, and which corner lots tend to flood at the back fence after a hard April rain. That's not searchable — it's twenty-five years of paying attention. When you call (630) 946-9321, Erick picks up. The crew that walks your property is the crew that pours the base. No subcontracted hand-offs.",
      es: 'Aurora es nuestra casa. El patio de donde salen nuestros camiones cada mañana queda en Mountain Street, y una cuarta parte de nuestros trabajos están a diez minutos en auto. Sabemos qué subdivisiones del lado este tienen entradas que no caben una mini-cargadora, qué calles la ciudad limpia al final tras una tormenta fuerte, y qué lotes en esquina tienden a inundarse en la cerca trasera después de una lluvia fuerte de abril. Eso no se busca en Google — son veinticinco años de prestar atención. Cuando llamas al (630) 946-9321, Erick contesta. El equipo que camina tu propiedad es el equipo que coloca la base. Nada de entregar el proyecto a un subcontratista que apenas acabas de conocer.',
    },
    testimonials: [],
    meta: {
      title: {
        en: 'Aurora, IL Landscaping & Hardscape | Sunset Services',
        es: 'Paisajismo y Hardscape en Aurora, IL | Sunset Services',
      },
      description: {
        en: 'Family-run landscaping and hardscape in Aurora, IL since 2000. Patios, retaining walls, lawn care. Free estimates within 5 days.',
        es: 'Empresa familiar de paisajismo y hardscape en Aurora, IL desde el año 2000. Patios, muros de contención, cuidado del césped. Estimados gratis en 5 días.',
      },
    },
  },
  {
    slug: 'naperville',
    name: 'Naperville',
    state: 'IL',
    geo: {lat: 41.7508, lng: -88.1535},
    pin: {x: 324, y: 307.4},
    hero: {
      h1: {
        en: 'Landscaping & Hardscape in Naperville, IL',
        es: 'Paisajismo y Hardscape en Naperville, IL',
      },
      sub: {
        en: 'Family-run since 2000. Serving Naperville homeowners and businesses.',
        es: 'Familiar desde el año 2000. Atendiendo a hogares y negocios de Naperville.',
      },
      photoSlot: 'location.naperville.hero',
    },
    trust: {yearsServing: 25, projectsCompleted: 120, responseTimeDays: 5},
    featuredServices: [
      {slug: 'lawn-care', division: 'landscape'},
      {slug: 'landscape-design', division: 'landscape'},
      {slug: 'patios-walkways', division: 'hardscape'},
      {slug: 'retaining-walls', division: 'hardscape'},
      {slug: 'sump-pumps', division: 'waterproofing'},
      {slug: 'commercial-snow-plowing', division: 'snow-removal'},
    ],
    whyLocal: {
      en: 'Our crews drive Naperville every day. We know which lots back up to forest preserve, which subdivisions have HOA approval forms that need three weeks, which slope grades drain into the sewer easement and which feed the neighbor\'s patio. That\'s not a search-engine fact — that\'s twenty-five years of going back when something settles wrong. When you call (630) 946-9321, Erick picks up. The crew that walks your property is the crew that pours the base. You won\'t hand off to a subcontractor we just met. Naperville is a third of our hardscape book; we have a Unilock yard a short truck-ride from your driveway.',
      es: 'Nuestros equipos recorren Naperville todos los días. Sabemos qué lotes dan a la reserva forestal, qué subdivisiones tienen formularios de aprobación de HOA que tardan tres semanas, qué pendientes drenan al desagüe pluvial y cuáles drenan al patio del vecino. Eso no se busca en Google — son veinticinco años de volver cuando algo se asienta mal. Cuando llamas al (630) 946-9321, Erick contesta. El equipo que camina tu propiedad es el equipo que coloca la base. No te van a pasar con un subcontratista que apenas acabamos de conocer. Naperville es un tercio de nuestro libro de hardscape; tenemos un patio de Unilock a un viaje corto en camión de tu casa.',
    },
    testimonials: [],
    meta: {
      title: {
        en: 'Naperville, IL Landscaping & Hardscape | Sunset Services',
        es: 'Paisajismo y Hardscape en Naperville, IL | Sunset Services',
      },
      description: {
        en: 'Family-run landscaping and hardscape in Naperville, IL since 2000. Patios, outdoor kitchens, retaining walls. Free estimates within 5 days.',
        es: 'Empresa familiar de paisajismo y hardscape en Naperville, IL desde el año 2000. Patios, cocinas al aire libre, muros. Estimados gratis en 5 días.',
      },
    },
  },
  {
    slug: 'batavia',
    name: 'Batavia',
    state: 'IL',
    geo: {lat: 41.85, lng: -88.312},
    pin: {x: 207.2, y: 209.3},
    hero: {
      h1: {
        en: 'Landscaping & Hardscape in Batavia, IL',
        es: 'Paisajismo y Hardscape en Batavia, IL',
      },
      sub: {
        en: 'Family-run since 2000. Serving Batavia homeowners and businesses.',
        es: 'Familiar desde el año 2000. Atendiendo a hogares y negocios de Batavia.',
      },
      photoSlot: 'location.batavia.hero',
    },
    trust: {yearsServing: 25, projectsCompleted: 60, responseTimeDays: 7},
    featuredServices: [
      {slug: 'lawn-care', division: 'landscape'},
      {slug: 'landscape-design', division: 'landscape'},
      {slug: 'patios-walkways', division: 'hardscape'},
      {slug: 'retaining-walls', division: 'hardscape'},
      {slug: 'crawl-spaces', division: 'waterproofing'},
      {slug: 'driveway-snow-removal', division: 'snow-removal'},
    ],
    whyLocal: {
      en: "Batavia is the river town we've been mowing for over two decades. The lots along the Fox River drain differently than the inland streets — what looks like a flat backyard often has a six-inch grade we can read off a hose-line in five minutes. That matters when you're putting in a patio or planting beds: get the grade wrong and the first big storm tells you. We've placed enough natural stone walls along the slope of the bluff to know where the city wants the drainage tile. When you call (630) 946-9321, the same crew you'd see at the estimate is the crew that does the work — no handoff to someone you've never met.",
      es: 'Batavia es el pueblo ribereño donde hemos estado cortando césped por más de dos décadas. Los lotes a lo largo del Río Fox drenan distinto que las calles del interior — lo que parece un patio plano a menudo tiene seis pulgadas de pendiente que podemos leer con una manguera en cinco minutos. Eso importa cuando vas a colocar un patio o arriates: si te equivocas con la pendiente, la primera tormenta fuerte te lo dice. Hemos colocado suficientes muros de piedra natural a lo largo de la pendiente del barranco para saber dónde la ciudad quiere el tubo de drenaje. Cuando llamas al (630) 946-9321, el mismo equipo que ves en el estimado es el equipo que hace el trabajo — no hay relevos con alguien que nunca conociste.',
    },
    testimonials: [],
    meta: {
      title: {
        en: 'Batavia, IL Landscaping & Hardscape | Sunset Services',
        es: 'Paisajismo y Hardscape en Batavia, IL | Sunset Services',
      },
      description: {
        en: 'Family-run landscaping and hardscape in Batavia, IL since 2000. Lawn care, landscape design, tree services. Free estimates within 7 days.',
        es: 'Empresa familiar de paisajismo y hardscape en Batavia, IL desde el año 2000. Cuidado del césped, diseño de jardines, servicios para árboles. Estimados gratis en 7 días.',
      },
    },
  },
  {
    slug: 'wheaton',
    name: 'Wheaton',
    state: 'IL',
    geo: {lat: 41.8661, lng: -88.107},
    pin: {x: 358.2, y: 193.4},
    hero: {
      h1: {
        en: 'Landscaping & Hardscape in Wheaton, IL',
        es: 'Paisajismo y Hardscape en Wheaton, IL',
      },
      sub: {
        en: 'Family-run since 2000. Serving Wheaton homeowners and businesses.',
        es: 'Familiar desde el año 2000. Atendiendo a hogares y negocios de Wheaton.',
      },
      photoSlot: 'location.wheaton.hero',
    },
    trust: {yearsServing: 25, projectsCompleted: 80, responseTimeDays: 5},
    featuredServices: [
      {slug: 'lawn-care', division: 'landscape'},
      {slug: 'landscape-design', division: 'landscape'},
      {slug: 'patios-walkways', division: 'hardscape'},
      {slug: 'retaining-walls', division: 'hardscape'},
      {slug: 'basement-waterproofing', division: 'waterproofing'},
      {slug: 'driveway-snow-removal', division: 'snow-removal'},
    ],
    whyLocal: {
      en: "Wheaton is mature trees, brick driveways, and lawns that have looked the same since the Eighties — for good reason. The job there is usually less about reinventing a property and more about respecting it: matching the brick on a front walk that's been settling for forty years, planting under a hundred-year oak without rolling its root flare, getting a retaining wall to read like it's always been there. We've been working Wheaton since 2002. The same crew you meet at the estimate is the crew that builds the project. When you call (630) 946-9321, Erick picks up; you don't get a sales rep. We're not the biggest crew in town, and we're not trying to be.",
      es: 'Wheaton es árboles maduros, entradas de ladrillo y céspedes que se ven igual desde los años ochenta — por buenas razones. El trabajo allí suele ser menos sobre reinventar una propiedad y más sobre respetarla: hacer juego con el ladrillo de una entrada que se ha asentado durante cuarenta años, plantar bajo un roble centenario sin pisar su raíz, hacer que un muro de contención se vea como si siempre hubiera estado ahí. Trabajamos en Wheaton desde el año 2002. El mismo equipo que conoces en el estimado es el equipo que construye el proyecto. Cuando llamas al (630) 946-9321, Erick contesta; no te pasan con un vendedor. No somos el equipo más grande de la ciudad, y tampoco queremos serlo.',
    },
    testimonials: [],
    meta: {
      title: {
        en: 'Wheaton, IL Landscaping & Hardscape | Sunset Services',
        es: 'Paisajismo y Hardscape en Wheaton, IL | Sunset Services',
      },
      description: {
        en: 'Family-run landscaping and hardscape in Wheaton, IL since 2000. Patios, retaining walls, landscape design. Free estimates within 5 days.',
        es: 'Empresa familiar de paisajismo y hardscape en Wheaton, IL desde el año 2000. Patios, muros, diseño de jardines. Estimados gratis en 5 días.',
      },
    },
  },
  {
    slug: 'lisle',
    name: 'Lisle',
    state: 'IL',
    geo: {lat: 41.8011, lng: -88.0742},
    pin: {x: 382.4, y: 257.7},
    hero: {
      h1: {
        en: 'Landscaping & Hardscape in Lisle, IL',
        es: 'Paisajismo y Hardscape en Lisle, IL',
      },
      sub: {
        en: 'Family-run since 2000. Serving Lisle homeowners and businesses.',
        es: 'Familiar desde el año 2000. Atendiendo a hogares y negocios de Lisle.',
      },
      photoSlot: 'location.lisle.hero',
    },
    trust: {yearsServing: 25, projectsCompleted: 70, responseTimeDays: 5},
    featuredServices: [
      {slug: 'landscape-maintenance', division: 'landscape'},
      {slug: 'commercial-snow-plowing', division: 'snow-removal'},
      {slug: 'turf-management', division: 'landscape'},
      {slug: 'lawn-care', division: 'landscape'},
      {slug: 'sprinkler-systems', division: 'landscape'},
      {slug: 'patios-walkways', division: 'hardscape'},
    ],
    whyLocal: {
      en: "Lisle is the corporate corridor — Warrenville Road and the I-88 frontage are why we put a second commercial truck on the road in 2014. We mow, edge, and snow-clear for property managers who get one chance per visit and a phone call from corporate when something looks off. Most of our Lisle work happens before 7 a.m. so it's done before tenants pull in. On the residential side, the established neighborhoods east of College Road have been on our maintenance routes for fifteen-plus years. When you call (630) 946-9321, the same Sunset Services number residential homeowners reach is the number Lisle property managers reach. One crew, one phone, one accountable family.",
      es: 'Lisle es el corredor corporativo — Warrenville Road y el frente de la I-88 son la razón por la que pusimos un segundo camión comercial en 2014. Cortamos, bordeamos y removemos nieve para administradores de propiedades que tienen una sola oportunidad por visita y una llamada de la corporativa cuando algo se ve mal. La mayoría de nuestro trabajo en Lisle se hace antes de las 7 a.m. para que esté listo antes de que lleguen los inquilinos. Del lado residencial, los vecindarios establecidos al este de College Road llevan más de quince años en nuestras rutas de mantenimiento. Cuando llamas al (630) 946-9321, el mismo número de Sunset Services que marcan los propietarios residenciales es el mismo que marcan los administradores de propiedades de Lisle. Un equipo, un teléfono, una familia que rinde cuentas.',
    },
    testimonials: [],
    meta: {
      title: {
        en: 'Lisle, IL Landscaping & Hardscape | Sunset Services',
        es: 'Paisajismo y Hardscape en Lisle, IL | Sunset Services',
      },
      description: {
        en: 'Family-run landscaping and hardscape in Lisle, IL since 2000. Commercial maintenance, snow removal, turf management. Free estimates within 5 days.',
        es: 'Empresa familiar de paisajismo y hardscape en Lisle, IL desde el año 2000. Mantenimiento comercial, remoción de nieve, manejo de césped. Estimados gratis en 5 días.',
      },
    },
  },
  {
    slug: 'bolingbrook',
    name: 'Bolingbrook',
    state: 'IL',
    geo: {lat: 41.6986, lng: -88.0684},
    pin: {x: 386.7, y: 358.9},
    hero: {
      h1: {
        en: 'Landscaping & Hardscape in Bolingbrook, IL',
        es: 'Paisajismo y Hardscape en Bolingbrook, IL',
      },
      sub: {
        en: 'Family-run since 2000. Serving Bolingbrook homeowners and businesses.',
        es: 'Familiar desde el año 2000. Atendiendo a hogares y negocios de Bolingbrook.',
      },
      photoSlot: 'location.bolingbrook.hero',
    },
    trust: {yearsServing: 25, projectsCompleted: 65, responseTimeDays: 7},
    featuredServices: [
      {slug: 'landscape-maintenance', division: 'landscape'},
      {slug: 'commercial-snow-plowing', division: 'snow-removal'},
      {slug: 'property-enhancement', division: 'landscape'},
      {slug: 'lawn-care', division: 'landscape'},
      {slug: 'landscape-design', division: 'landscape'},
      {slug: 'driveway-snow-removal', division: 'snow-removal'},
    ],
    whyLocal: {
      en: "Bolingbrook is a mix — newer subdivisions, an established commercial spine along Boughton Road, and a stretch of multifamily that needs reliable mowing every seven days from April through October. We've been running there since 2007. The crews know which retention ponds need quarterly weed control, which subdivision HOAs require Friday-only mowing, and which streets the village plows last in a heavy snow event. When you call (630) 946-9321, you get the same family-run team residential clients reach in Naperville and commercial property managers reach in Lisle. We're not a national chain with a Bolingbrook franchise; we're one crew based in Aurora that's been driving the I-355 corridor for nearly twenty years.",
      es: 'Bolingbrook es una mezcla — subdivisiones nuevas, una columna comercial establecida a lo largo de Boughton Road, y un tramo multifamiliar que necesita corte de césped confiable cada siete días de abril a octubre. Hemos estado trabajando allí desde el año 2007. Los equipos saben qué estanques de retención necesitan control de maleza trimestral, qué HOAs exigen corte solo los viernes, y qué calles limpia el municipio al final en un evento de nieve fuerte. Cuando llamas al (630) 946-9321, te atiende el mismo equipo familiar que atiende a los clientes residenciales de Naperville y a los administradores de propiedades de Lisle. No somos una cadena nacional con una franquicia en Bolingbrook; somos un equipo con sede en Aurora que lleva casi veinte años recorriendo el corredor de la I-355.',
    },
    testimonials: [],
    meta: {
      title: {
        en: 'Bolingbrook, IL Landscaping & Hardscape | Sunset Services',
        es: 'Paisajismo y Hardscape en Bolingbrook, IL | Sunset Services',
      },
      description: {
        en: 'Family-run landscaping and hardscape in Bolingbrook, IL since 2000. Commercial maintenance, snow removal, property enhancement. Free estimates within 7 days.',
        es: 'Empresa familiar de paisajismo y hardscape en Bolingbrook, IL desde el año 2000. Mantenimiento comercial, remoción de nieve, mejora de propiedad. Estimados gratis en 7 días.',
      },
    },
  },

  // ─────────────────────── Phase M.01d — 18 new cities ───────────────────────
  // Added 2026-05-26. NOT surfaced on the /service-areas/ index yet — M.01e
  // redraws the index, the map, and wires the new city pages. featuredServices
  // uses only existing audience-aware services in M.01d (Option B per the
  // phase plan); M.01e adds Waterproofing + Snow Removal slots once the
  // consumer in `Phase 1.14 location page` is taught to render audience-less
  // service cards. `pin.x/y` are placeholders — M.01e computes real SVG coords
  // from `geo.lat/lng`. `trust.projectsCompleted` + `responseTimeDays` are
  // placeholders pending Erick's per-city numbers. Single placeholder
  // testimonial — M.01f wires live Google reviews.
  {
    slug: 'hinsdale',
    name: 'Hinsdale',
    state: 'IL',
    geo: {lat: 41.8009, lng: -87.937},
    pin: {x: 483.5, y: 257.9},
    hero: {
      h1: {
        en: 'Landscaping & Hardscape in Hinsdale, IL',
        es: 'Paisajismo y Hardscape en Hinsdale, IL',
      },
      sub: {
        en: 'Family-run since 2000. Serving Hinsdale homeowners with old-house experience.',
        es: 'Familiar desde el año 2000. Atendiendo a propietarios de Hinsdale con experiencia en casas antiguas.',
      },
      photoSlot: 'location.hinsdale.hero',
    },
    trust: {yearsServing: 25, projectsCompleted: 45, responseTimeDays: 5},
    featuredServices: [
      {slug: 'lawn-care', division: 'landscape'},
      {slug: 'landscape-design', division: 'landscape'},
      {slug: 'patios-walkways', division: 'hardscape'},
      {slug: 'retaining-walls', division: 'hardscape'},
      {slug: 'basement-waterproofing', division: 'waterproofing'},
      {slug: 'driveway-snow-removal', division: 'snow-removal'},
    ],
    whyLocal: {
      en: "Hinsdale is brick driveways, century oaks, and additions on top of additions. The job here is almost always less about reinventing a property and more about respecting it — matching the masonry on a wall that's stood since the 1920s, planting under a tree whose root flare you can't disturb, getting a new patio to read like it was always there. Around the Robbins Park corridor, almost every lot has a basement that's been getting wetter every spring; foundation and waterproofing work has become a Hinsdale specialty for us. When you call (630) 946-9321, you don't get a sales rep — Erick answers. The same crew that walks your property is the crew that pours the base.",
      es: 'Hinsdale es entradas de ladrillo, robles centenarios y ampliaciones sobre ampliaciones. El trabajo aquí casi siempre es menos sobre reinventar una propiedad y más sobre respetarla — hacer juego con la mampostería de un muro que lleva en pie desde los años veinte, plantar bajo un árbol cuya raíz no puedes mover, hacer que un patio nuevo se lea como si siempre hubiera estado ahí. En el corredor del Robbins Park, casi cada lote tiene un sótano que se humedece más cada primavera; reparación de cimientos e impermeabilización se han vuelto una especialidad de Hinsdale para nosotros. Cuando llamas al (630) 946-9321, no te atiende un vendedor — Erick contesta. El mismo equipo que camina tu propiedad es el equipo que coloca la base.',
    },
    testimonials: [],
    meta: {
      title: {
        en: 'Hinsdale, IL Landscaping & Hardscape | Sunset Services',
        es: 'Paisajismo y Hardscape en Hinsdale, IL | Sunset Services',
      },
      description: {
        en: 'Family-run landscaping, hardscape, and waterproofing in Hinsdale, IL since 2000. Old-house specialists. Free estimates within 5 days.',
        es: 'Empresa familiar de paisajismo, hardscape e impermeabilización en Hinsdale, IL desde el año 2000. Especialistas en casas antiguas. Estimados gratis en 5 días.',
      },
    },
  },

  {
    slug: 'oak-brook',
    name: 'Oak Brook',
    state: 'IL',
    geo: {lat: 41.8328, lng: -87.9292},
    pin: {x: 489.3, y: 226.4},
    hero: {
      h1: {
        en: 'Landscaping & Hardscape in Oak Brook, IL',
        es: 'Paisajismo y Hardscape en Oak Brook, IL',
      },
      sub: {
        en: 'Family-run since 2000. Commercial property managers and residential estates.',
        es: 'Familiar desde el año 2000. Administradores comerciales y propiedades residenciales.',
      },
      photoSlot: 'location.oak-brook.hero',
    },
    trust: {yearsServing: 25, projectsCompleted: 55, responseTimeDays: 5},
    featuredServices: [
      {slug: 'lawn-care', division: 'landscape'},
      {slug: 'landscape-design', division: 'landscape'},
      {slug: 'patios-walkways', division: 'hardscape'},
      {slug: 'retaining-walls', division: 'hardscape'},
      {slug: 'foundation-repair', division: 'waterproofing'},
      {slug: 'commercial-snow-plowing', division: 'snow-removal'},
    ],
    whyLocal: {
      en: "Oak Brook is corporate headquarters along Spring Road and estates with frontage on Salt Creek. The commercial side of our book here is property managers who get one chance per visit; we mow the Oakbrook Center perimeter and a handful of office parks along 22nd Street before tenants pull in. On the residential side, the Briarwood and Forest Hill neighborhoods have lots that ask for thoughtful design work — mature plantings, hardscape that reads as estate, and irrigation that actually keeps up in August. When you call (630) 946-9321, the same number a residential homeowner reaches in Naperville is the number an Oak Brook property manager reaches. One crew, one phone, one accountable family.",
      es: 'Oak Brook es sedes corporativas a lo largo de Spring Road y propiedades con frente al arroyo Salt. El lado comercial de nuestro libro aquí son administradores que tienen una sola oportunidad por visita; cortamos el perímetro del Oakbrook Center y varios parques de oficinas en la 22nd Street antes de que lleguen los inquilinos. Del lado residencial, los vecindarios Briarwood y Forest Hill tienen lotes que piden trabajo de diseño cuidadoso — plantas maduras, hardscape de tipo finca y riego que aguante en agosto. Cuando llamas al (630) 946-9321, el mismo número que marca un propietario residencial en Naperville lo marca un administrador en Oak Brook. Un equipo, un teléfono, una familia que rinde cuentas.',
    },
    testimonials: [],
    meta: {
      title: {
        en: 'Oak Brook, IL Landscaping & Snow | Sunset Services',
        es: 'Paisajismo y Manejo de Nieve en Oak Brook, IL | Sunset Services',
      },
      description: {
        en: 'Commercial landscaping, snow removal, and residential design in Oak Brook, IL since 2000. Property-manager focus. Free estimates within 5 days.',
        es: 'Paisajismo comercial, remoción de nieve y diseño residencial en Oak Brook, IL desde 2000. Enfoque para administradores. Estimados gratis en 5 días.',
      },
    },
  },

  {
    slug: 'elmhurst',
    name: 'Elmhurst',
    state: 'IL',
    geo: {lat: 41.8995, lng: -87.9403},
    pin: {x: 481.1, y: 160.4},
    hero: {
      h1: {
        en: 'Landscaping & Hardscape in Elmhurst, IL',
        es: 'Paisajismo y Hardscape en Elmhurst, IL',
      },
      sub: {
        en: 'Family-run since 2000. Established yards and pre-war foundations.',
        es: 'Familiar desde el año 2000. Patios establecidos y cimientos pre-guerra.',
      },
      photoSlot: 'location.elmhurst.hero',
    },
    trust: {yearsServing: 25, projectsCompleted: 50, responseTimeDays: 5},
    featuredServices: [
      {slug: 'lawn-care', division: 'landscape'},
      {slug: 'landscape-design', division: 'landscape'},
      {slug: 'patios-walkways', division: 'hardscape'},
      {slug: 'retaining-walls', division: 'hardscape'},
      {slug: 'basement-waterproofing', division: 'waterproofing'},
      {slug: 'driveway-snow-removal', division: 'snow-removal'},
    ],
    whyLocal: {
      en: "Elmhurst is the kind of place where the house was built before the Eisenhower-era addition, and the addition is older than most contractors who knock on the door. Around the Wilder Park and the York-Vallette corridor, basement waterproofing has become as much of the conversation as patio design — the clay-loam under most of north Elmhurst holds water for weeks after a heavy spring rain. We've been on Elmhurst job sites since 2005. The same crew that walks your property at the estimate is the crew that pours the base. When you call (630) 946-9321, you get Erick — no sales rep, no callback queue, no handoff to a subcontractor you've never met.",
      es: 'Elmhurst es la clase de lugar donde la casa fue construida antes de la ampliación de la era Eisenhower, y la ampliación es más vieja que la mayoría de los contratistas que tocan la puerta. Alrededor del Wilder Park y el corredor York-Vallette, la impermeabilización de sótanos se ha vuelto tanto parte de la conversación como el diseño de patios — el suelo arcilloso del norte de Elmhurst retiene agua por semanas tras una lluvia fuerte de primavera. Estamos en obras de Elmhurst desde 2005. El mismo equipo que camina tu propiedad en el estimado es el equipo que coloca la base. Cuando llamas al (630) 946-9321, te atiende Erick — sin vendedor, sin cola, sin entregar a un subcontratista que apenas acabas de conocer.',
    },
    testimonials: [],
    meta: {
      title: {
        en: 'Elmhurst, IL Landscaping & Hardscape | Sunset Services',
        es: 'Paisajismo y Hardscape en Elmhurst, IL | Sunset Services',
      },
      description: {
        en: 'Family-run landscaping, hardscape, and waterproofing in Elmhurst, IL since 2000. Old-house specialists. Free estimates within 5 days.',
        es: 'Empresa familiar de paisajismo, hardscape e impermeabilización en Elmhurst, IL desde 2000. Especialistas en casas antiguas. Estimados gratis en 5 días.',
      },
    },
  },

  {
    slug: 'clarendon-hills',
    name: 'Clarendon Hills',
    state: 'IL',
    geo: {lat: 41.7975, lng: -87.9554},
    pin: {x: 470, y: 261.3},
    hero: {
      h1: {
        en: 'Landscaping & Hardscape in Clarendon Hills, IL',
        es: 'Paisajismo y Hardscape en Clarendon Hills, IL',
      },
      sub: {
        en: 'Family-run since 2000. Walk-to-Metra lots and storybook bungalows.',
        es: 'Familiar desde el año 2000. Lotes a pasos del Metra y bungalows con encanto.',
      },
      photoSlot: 'location.clarendon-hills.hero',
    },
    trust: {yearsServing: 25, projectsCompleted: 35, responseTimeDays: 5},
    featuredServices: [
      {slug: 'lawn-care', division: 'landscape'},
      {slug: 'landscape-design', division: 'landscape'},
      {slug: 'patios-walkways', division: 'hardscape'},
      {slug: 'retaining-walls', division: 'hardscape'},
      {slug: 'yard-drainage', division: 'waterproofing'},
      {slug: 'driveway-snow-removal', division: 'snow-removal'},
    ],
    whyLocal: {
      en: "Clarendon Hills is one of those west-suburban pockets where the entire walk-to-Metra core has lots under a quarter acre, and the houses are 1920s bungalows that haven't been touched in twenty years. The job here is precision — getting a hardscape walkway to align with brick the masons set ninety years ago, threading a new sprinkler system through mature root systems without losing a tree. We know the streets around Prospect Park and the Clarendon-Norfolk corridor well; some of those subdivisions go back to 1900. When you call (630) 946-9321, you get the same family-run team Hinsdale and Elmhurst homeowners reach. One crew, one phone, twenty-five years of paying attention.",
      es: 'Clarendon Hills es uno de esos rincones del oeste donde todo el núcleo a pasos del Metra tiene lotes de menos de un cuarto de acre, y las casas son bungalows de los años veinte sin tocar en veinte años. El trabajo aquí es precisión — alinear una acera de hardscape con ladrillos que los albañiles colocaron hace noventa años, atravesar un nuevo sistema de riego entre raíces maduras sin perder un árbol. Conocemos bien las calles alrededor de Prospect Park y el corredor Clarendon-Norfolk; algunas de esas subdivisiones son de 1900. Cuando llamas al (630) 946-9321, te atiende el mismo equipo familiar que atiende a propietarios de Hinsdale y Elmhurst. Un equipo, un teléfono, veinticinco años de prestar atención.',
    },
    testimonials: [],
    meta: {
      title: {
        en: 'Clarendon Hills, IL Landscaping & Hardscape | Sunset Services',
        es: 'Paisajismo y Hardscape en Clarendon Hills, IL | Sunset Services',
      },
      description: {
        en: 'Family-run landscaping and hardscape in Clarendon Hills, IL since 2000. Walk-to-Metra lot specialists. Free estimates within 5 days.',
        es: 'Empresa familiar de paisajismo y hardscape en Clarendon Hills, IL desde 2000. Especialistas en lotes a pasos del Metra. Estimados gratis en 5 días.',
      },
    },
  },

  {
    slug: 'burr-ridge',
    name: 'Burr Ridge',
    state: 'IL',
    geo: {lat: 41.7486, lng: -87.9171},
    pin: {x: 498.2, y: 309.6},
    hero: {
      h1: {
        en: 'Landscaping & Hardscape in Burr Ridge, IL',
        es: 'Paisajismo y Hardscape en Burr Ridge, IL',
      },
      sub: {
        en: 'Family-run since 2000. Custom homes, full-yard plans, hardscape estate work.',
        es: 'Familiar desde el año 2000. Casas personalizadas, planes completos, trabajo de hardscape de finca.',
      },
      photoSlot: 'location.burr-ridge.hero',
    },
    trust: {yearsServing: 25, projectsCompleted: 40, responseTimeDays: 5},
    featuredServices: [
      {slug: 'lawn-care', division: 'landscape'},
      {slug: 'landscape-design', division: 'landscape'},
      {slug: 'patios-walkways', division: 'hardscape'},
      {slug: 'retaining-walls', division: 'hardscape'},
      {slug: 'yard-drainage', division: 'waterproofing'},
      {slug: 'driveway-snow-removal', division: 'snow-removal'},
    ],
    whyLocal: {
      en: "Burr Ridge is the kind of community where most properties were built as custom builds and ask for landscape work that matches. Around the Carriage Way and County Line Road corridors, the lots run an acre-plus and the design conversations usually include a full-yard plan: paver patio that flows from the kitchen, a fire feature sized for the family, retaining walls that double as seating. That's the work we love. We've been on Burr Ridge job sites since 2009. When you call (630) 946-9321, Erick picks up — no sales rep, no callback queue. The crew that walks your property at the estimate is the crew that builds the project, start to finish.",
      es: 'Burr Ridge es la clase de comunidad donde la mayoría de las propiedades se construyeron como casas personalizadas y piden trabajo de paisajismo que les haga juego. Alrededor de los corredores Carriage Way y County Line Road, los lotes son de un acre o más y las conversaciones de diseño suelen incluir un plan completo: patio de adoquines que fluye desde la cocina, brasero dimensionado para la familia, muros de contención que funcionan como asientos. Ese es el trabajo que nos gusta. Estamos en obras de Burr Ridge desde 2009. Cuando llamas al (630) 946-9321, Erick contesta — sin vendedor, sin cola. El equipo que camina tu propiedad en el estimado es el equipo que construye el proyecto de principio a fin.',
    },
    testimonials: [],
    meta: {
      title: {
        en: 'Burr Ridge, IL Landscaping & Hardscape | Sunset Services',
        es: 'Paisajismo y Hardscape en Burr Ridge, IL | Sunset Services',
      },
      description: {
        en: 'Family-run landscape design and hardscape in Burr Ridge, IL since 2000. Custom-home full-yard plans. Free estimates within 5 days.',
        es: 'Diseño de paisaje y hardscape familiar en Burr Ridge, IL desde 2000. Planes completos para casas personalizadas. Estimados gratis en 5 días.',
      },
    },
  },

  {
    slug: 'western-springs',
    name: 'Western Springs',
    state: 'IL',
    geo: {lat: 41.8125, lng: -87.9001},
    pin: {x: 510.7, y: 246.4},
    hero: {
      h1: {
        en: 'Landscaping & Hardscape in Western Springs, IL',
        es: 'Paisajismo y Hardscape en Western Springs, IL',
      },
      sub: {
        en: 'Family-run since 2000. Walk-to-train neighborhoods and well-loved older homes.',
        es: 'Familiar desde el año 2000. Vecindarios a pasos del tren y casas antiguas bien cuidadas.',
      },
      photoSlot: 'location.western-springs.hero',
    },
    trust: {yearsServing: 25, projectsCompleted: 35, responseTimeDays: 5},
    featuredServices: [
      {slug: 'lawn-care', division: 'landscape'},
      {slug: 'landscape-design', division: 'landscape'},
      {slug: 'patios-walkways', division: 'hardscape'},
      {slug: 'retaining-walls', division: 'hardscape'},
      {slug: 'basement-waterproofing', division: 'waterproofing'},
      {slug: 'driveway-snow-removal', division: 'snow-removal'},
    ],
    whyLocal: {
      en: "Western Springs is the walk-to-train neighborhoods around Spring Rock Park and the Western Springs station, and the houses go back to the early 1900s in the older blocks. The lots are tight, the trees are mature, and the work asks for crews that understand both — laying a paver walk that matches brick from 1910, planting under a sixty-foot maple without disturbing the root flare. We've been on Western Springs job sites since 2008. When you call (630) 946-9321, you don't get a sales rep — Erick answers. The same crew that walks your property is the crew that pours the base. No subcontracted handoffs.",
      es: 'Western Springs son los vecindarios a pasos del tren alrededor del Spring Rock Park y la estación de Western Springs, y las casas se remontan a principios de los 1900 en las cuadras antiguas. Los lotes son apretados, los árboles maduros, y el trabajo pide equipos que entiendan ambos — colocar una acera de adoquines que haga juego con ladrillo de 1910, plantar bajo un arce de sesenta pies sin tocar la raíz. Estamos en obras de Western Springs desde 2008. Cuando llamas al (630) 946-9321, no te atiende un vendedor — Erick contesta. El mismo equipo que camina tu propiedad es el equipo que coloca la base. Sin subcontratistas.',
    },
    testimonials: [],
    meta: {
      title: {
        en: 'Western Springs, IL Landscaping & Hardscape | Sunset Services',
        es: 'Paisajismo y Hardscape en Western Springs, IL | Sunset Services',
      },
      description: {
        en: 'Family-run landscaping and hardscape in Western Springs, IL since 2000. Walk-to-train older-home experts. Free estimates within 5 days.',
        es: 'Empresa familiar de paisajismo y hardscape en Western Springs, IL desde 2000. Expertos en casas antiguas a pasos del tren. Estimados gratis en 5 días.',
      },
    },
  },

  {
    slug: 'glen-ellyn',
    name: 'Glen Ellyn',
    state: 'IL',
    geo: {lat: 41.8775, lng: -88.067},
    pin: {x: 387.7, y: 182.1},
    hero: {
      h1: {
        en: 'Landscaping & Hardscape in Glen Ellyn, IL',
        es: 'Paisajismo y Hardscape en Glen Ellyn, IL',
      },
      sub: {
        en: 'Family-run since 2000. Lakeside estates, mature plantings, and full-yard plans.',
        es: 'Familiar desde el año 2000. Propiedades junto al lago, plantas maduras y planes completos.',
      },
      photoSlot: 'location.glen-ellyn.hero',
    },
    trust: {yearsServing: 25, projectsCompleted: 60, responseTimeDays: 5},
    featuredServices: [
      {slug: 'lawn-care', division: 'landscape'},
      {slug: 'landscape-design', division: 'landscape'},
      {slug: 'patios-walkways', division: 'hardscape'},
      {slug: 'retaining-walls', division: 'hardscape'},
      {slug: 'basement-waterproofing', division: 'waterproofing'},
      {slug: 'driveway-snow-removal', division: 'snow-removal'},
    ],
    whyLocal: {
      en: "Glen Ellyn is the Lake Ellyn neighborhoods, the old estate corridors around Crescent Boulevard, and the College of DuPage campus edge — three different design conversations on three different streets. We've been planting in Glen Ellyn since 2006. The lots around Lake Ellyn ask for plantings that can handle reflected light off the water; the streets near Newton Avenue need walls and walks that match house brick from the 1920s; the newer subdivisions south of Roosevelt Road want full-yard plans with patios and fire features. When you call (630) 946-9321, you get Erick — no sales rep, no handoffs to a subcontractor you've never met. The crew you meet at the estimate is the crew that builds the project.",
      es: 'Glen Ellyn son los vecindarios del Lago Ellyn, los corredores de propiedades antiguas alrededor de Crescent Boulevard, y el borde del campus del College of DuPage — tres conversaciones de diseño distintas en tres calles distintas. Hemos estado plantando en Glen Ellyn desde 2006. Los lotes alrededor del Lago Ellyn piden plantas que aguanten la luz reflejada del agua; las calles cerca de Newton Avenue necesitan muros y aceras que hagan juego con ladrillo de casas de los años veinte; las subdivisiones nuevas al sur de Roosevelt Road quieren planes completos con patios y braseros. Cuando llamas al (630) 946-9321, te atiende Erick — sin vendedor, sin entregar a un subcontratista que apenas acabas de conocer. El equipo que conoces en el estimado es el equipo que construye el proyecto.',
    },
    testimonials: [],
    meta: {
      title: {
        en: 'Glen Ellyn, IL Landscaping & Hardscape | Sunset Services',
        es: 'Paisajismo y Hardscape en Glen Ellyn, IL | Sunset Services',
      },
      description: {
        en: 'Family-run landscape design and hardscape in Glen Ellyn, IL since 2000. Lake Ellyn estate specialists. Free estimates within 5 days.',
        es: 'Diseño de paisaje y hardscape familiar en Glen Ellyn, IL desde 2000. Especialistas del Lago Ellyn. Estimados gratis en 5 días.',
      },
    },
  },

  {
    slug: 'downers-grove',
    name: 'Downers Grove',
    state: 'IL',
    geo: {lat: 41.8094, lng: -88.0109},
    pin: {x: 429.1, y: 249.5},
    hero: {
      h1: {
        en: 'Landscaping & Hardscape in Downers Grove, IL',
        es: 'Paisajismo y Hardscape en Downers Grove, IL',
      },
      sub: {
        en: 'Family-run since 2000. Suburban-residential mix with downtown-walk neighborhoods.',
        es: 'Familiar desde el año 2000. Mezcla suburbano-residencial con vecindarios a pasos del centro.',
      },
      photoSlot: 'location.downers-grove.hero',
    },
    trust: {yearsServing: 25, projectsCompleted: 70, responseTimeDays: 5},
    featuredServices: [
      {slug: 'lawn-care', division: 'landscape'},
      {slug: 'landscape-design', division: 'landscape'},
      {slug: 'patios-walkways', division: 'hardscape'},
      {slug: 'retaining-walls', division: 'hardscape'},
      {slug: 'yard-drainage', division: 'waterproofing'},
      {slug: 'commercial-snow-plowing', division: 'snow-removal'},
    ],
    whyLocal: {
      en: "Downers Grove is a layered town — the downtown-walk blocks around Burlington Avenue, the established residential streets near Maple Avenue, and the newer subdivisions south of Ogden. We've worked across all three since 2004. The Maple Avenue corridor has lots that ask for thoughtful design — mature trees, brick driveways, walks that have to match what's there. The newer south-side neighborhoods want patios and fire features. When you call (630) 946-9321, you don't get a sales rep — Erick picks up. The same crew that walks your property is the crew that pours the base. No subcontracted handoffs. The Sunset trucks are on Downers Grove roads at least three days a week, year-round.",
      es: 'Downers Grove es un pueblo en capas — las cuadras a pasos del centro alrededor de Burlington Avenue, las calles residenciales establecidas cerca de Maple Avenue, y las subdivisiones nuevas al sur de Ogden. Hemos trabajado en las tres desde 2004. El corredor Maple Avenue tiene lotes que piden diseño cuidadoso — árboles maduros, entradas de ladrillo, aceras que hacen juego con lo existente. Los vecindarios nuevos del sur quieren patios y braseros. Cuando llamas al (630) 946-9321, no te atiende un vendedor — Erick contesta. El mismo equipo que camina tu propiedad es el equipo que coloca la base. Sin subcontratistas. Los camiones de Sunset están en calles de Downers Grove al menos tres días por semana, todo el año.',
    },
    testimonials: [],
    meta: {
      title: {
        en: 'Downers Grove, IL Landscaping & Hardscape | Sunset Services',
        es: 'Paisajismo y Hardscape en Downers Grove, IL | Sunset Services',
      },
      description: {
        en: 'Family-run landscaping and hardscape in Downers Grove, IL since 2000. Downtown-walk and suburban experts. Free estimates within 5 days.',
        es: 'Empresa familiar de paisajismo y hardscape en Downers Grove, IL desde 2000. Expertos del centro y suburbios. Estimados gratis en 5 días.',
      },
    },
  },

  {
    slug: 'winfield',
    name: 'Winfield',
    state: 'IL',
    geo: {lat: 41.8614, lng: -88.1531},
    pin: {x: 324.3, y: 198.1},
    hero: {
      h1: {
        en: 'Landscaping & Hardscape in Winfield, IL',
        es: 'Paisajismo y Hardscape en Winfield, IL',
      },
      sub: {
        en: 'Family-run since 2000. Residential-heavy with mature plantings and acre lots.',
        es: 'Familiar desde el año 2000. Mayoría residencial con plantas maduras y lotes de un acre.',
      },
      photoSlot: 'location.winfield.hero',
    },
    trust: {yearsServing: 25, projectsCompleted: 30, responseTimeDays: 7},
    featuredServices: [
      {slug: 'lawn-care', division: 'landscape'},
      {slug: 'landscape-design', division: 'landscape'},
      {slug: 'patios-walkways', division: 'hardscape'},
      {slug: 'retaining-walls', division: 'hardscape'},
      {slug: 'yard-drainage', division: 'waterproofing'},
      {slug: 'driveway-snow-removal', division: 'snow-removal'},
    ],
    whyLocal: {
      en: "Winfield is mostly residential — the streets east of Geneva Road sit on acre-plus lots with mature trees and lawns that benefit from a real maintenance routine. We've worked Winfield for years alongside the existing Wheaton + Glen Ellyn routes. The properties around the Cantigny Park edge ask for landscape design that handles deer pressure and shade plantings under hundred-year oaks; the streets near Beecher Park need turf programs that hold up to kid use and dog use. When you call (630) 946-9321, you get the same family-run team Wheaton homeowners reach. One crew, one phone, and trucks already on the road in your area three days a week.",
      es: 'Winfield es mayormente residencial — las calles al este de Geneva Road están en lotes de un acre o más con árboles maduros y céspedes que se benefician de una rutina de mantenimiento real. Llevamos años trabajando en Winfield junto con las rutas existentes de Wheaton y Glen Ellyn. Las propiedades al borde del Cantigny Park piden diseño que maneja la presión de ciervos y plantas de sombra bajo robles centenarios; las calles cerca de Beecher Park necesitan programas de césped que aguanten uso de niños y perros. Cuando llamas al (630) 946-9321, te atiende el mismo equipo familiar que atiende a propietarios de Wheaton. Un equipo, un teléfono, y camiones ya en la calle en tu área tres días por semana.',
    },
    testimonials: [],
    meta: {
      title: {
        en: 'Winfield, IL Landscaping & Hardscape | Sunset Services',
        es: 'Paisajismo y Hardscape en Winfield, IL | Sunset Services',
      },
      description: {
        en: 'Family-run landscaping and hardscape in Winfield, IL since 2000. Acre-lot residential specialists. Free estimates within 7 days.',
        es: 'Empresa familiar de paisajismo y hardscape en Winfield, IL desde 2000. Especialistas en lotes de un acre. Estimados gratis en 7 días.',
      },
    },
  },

  {
    slug: 'lombard',
    name: 'Lombard',
    state: 'IL',
    geo: {lat: 41.88, lng: -88.0078},
    pin: {x: 431.3, y: 179.7},
    hero: {
      h1: {
        en: 'Landscaping & Hardscape in Lombard, IL',
        es: 'Paisajismo y Hardscape en Lombard, IL',
      },
      sub: {
        en: 'Family-run since 2000. Residential-suburban with strong commercial maintenance side.',
        es: 'Familiar desde el año 2000. Residencial-suburbano con fuerte lado de mantenimiento comercial.',
      },
      photoSlot: 'location.lombard.hero',
    },
    trust: {yearsServing: 25, projectsCompleted: 55, responseTimeDays: 5},
    featuredServices: [
      {slug: 'lawn-care', division: 'landscape'},
      {slug: 'landscape-design', division: 'landscape'},
      {slug: 'patios-walkways', division: 'hardscape'},
      {slug: 'retaining-walls', division: 'hardscape'},
      {slug: 'crawl-spaces', division: 'waterproofing'},
      {slug: 'commercial-snow-plowing', division: 'snow-removal'},
    ],
    whyLocal: {
      en: "Lombard is the Roosevelt Road commercial spine plus the residential streets that flank it on both sides. We've been in Lombard since 2005. The properties along the Yorktown corridor and the office parks near Highland Avenue have been on our commercial maintenance routes for fifteen-plus years; the residential streets around Lilacia Park ask for thoughtful design work and seasonal cleanup. When you call (630) 946-9321, the same number commercial property managers reach is the same number a residential homeowner reaches. One crew, one phone, one accountable family. We're on Lombard roads at least four days a week through the growing season.",
      es: 'Lombard es la columna comercial de Roosevelt Road más las calles residenciales que la flanquean a ambos lados. Estamos en Lombard desde 2005. Las propiedades a lo largo del corredor Yorktown y los parques de oficinas cerca de Highland Avenue llevan más de quince años en nuestras rutas de mantenimiento comercial; las calles residenciales alrededor del Lilacia Park piden trabajo de diseño cuidadoso y limpieza de temporada. Cuando llamas al (630) 946-9321, el mismo número que marcan los administradores comerciales lo marca un propietario residencial. Un equipo, un teléfono, una familia que rinde cuentas. Estamos en calles de Lombard al menos cuatro días por semana durante la temporada de crecimiento.',
    },
    testimonials: [],
    meta: {
      title: {
        en: 'Lombard, IL Landscaping & Snow | Sunset Services',
        es: 'Paisajismo y Manejo de Nieve en Lombard, IL | Sunset Services',
      },
      description: {
        en: 'Family-run landscaping, hardscape, and commercial snow removal in Lombard, IL since 2000. Free estimates within 5 days.',
        es: 'Paisajismo, hardscape y remoción comercial de nieve en Lombard, IL desde 2000. Estimados gratis en 5 días.',
      },
    },
  },

  {
    slug: 'st-charles',
    name: 'St. Charles',
    state: 'IL',
    geo: {lat: 41.9136, lng: -88.3092},
    pin: {x: 209.3, y: 146.4},
    hero: {
      h1: {
        en: 'Landscaping & Hardscape in St. Charles, IL',
        es: 'Paisajismo y Hardscape en St. Charles, IL',
      },
      sub: {
        en: 'Family-run since 2000. Fox River frontage and old-downtown character.',
        es: 'Familiar desde el año 2000. Frente al Río Fox y carácter del centro antiguo.',
      },
      photoSlot: 'location.st-charles.hero',
    },
    trust: {yearsServing: 25, projectsCompleted: 50, responseTimeDays: 5},
    featuredServices: [
      {slug: 'lawn-care', division: 'landscape'},
      {slug: 'landscape-design', division: 'landscape'},
      {slug: 'patios-walkways', division: 'hardscape'},
      {slug: 'retaining-walls', division: 'hardscape'},
      {slug: 'basement-waterproofing', division: 'waterproofing'},
      {slug: 'driveway-snow-removal', division: 'snow-removal'},
    ],
    whyLocal: {
      en: "St. Charles is the Fox River town with two distinct landscape stories — the historic streets around the Hotel Baker that ask for restoration-style work, and the newer subdivisions north of Highway 64 that want full-yard plans. We started working St. Charles in 2006 from the Batavia route, and a handful of our long-running clients are along the river bluff between 7th Avenue and Dean Street. The bluff lots drain differently than inland streets — what looks like a flat backyard often has six inches of grade we can read with a hose-line in five minutes. When you call (630) 946-9321, you get Erick. The crew you meet at the estimate is the crew that builds the project.",
      es: 'St. Charles es el pueblo a orillas del Río Fox con dos historias de paisaje distintas — las calles históricas alrededor del Hotel Baker que piden trabajo de tipo restauración, y las subdivisiones nuevas al norte de la Highway 64 que quieren planes completos. Empezamos a trabajar St. Charles en 2006 desde la ruta de Batavia, y varios de nuestros clientes de larga data están a lo largo del barranco del río entre 7th Avenue y Dean Street. Los lotes del barranco drenan distinto que las calles del interior — lo que parece un patio plano a menudo tiene seis pulgadas de pendiente que podemos leer con una manguera en cinco minutos. Cuando llamas al (630) 946-9321, te atiende Erick. El equipo que conoces en el estimado es el equipo que construye el proyecto.',
    },
    testimonials: [],
    meta: {
      title: {
        en: 'St. Charles, IL Landscaping & Hardscape | Sunset Services',
        es: 'Paisajismo y Hardscape en St. Charles, IL | Sunset Services',
      },
      description: {
        en: 'Family-run landscaping and hardscape in St. Charles, IL since 2000. Fox River bluff specialists. Free estimates within 5 days.',
        es: 'Empresa familiar de paisajismo y hardscape en St. Charles, IL desde 2000. Especialistas del barranco del Río Fox. Estimados gratis en 5 días.',
      },
    },
  },

  {
    slug: 'geneva',
    name: 'Geneva',
    state: 'IL',
    geo: {lat: 41.8875, lng: -88.3054},
    pin: {x: 212.1, y: 172.2},
    hero: {
      h1: {
        en: 'Landscaping & Hardscape in Geneva, IL',
        es: 'Paisajismo y Hardscape en Geneva, IL',
      },
      sub: {
        en: 'Family-run since 2000. Riverside character with historic-downtown lot patterns.',
        es: 'Familiar desde el año 2000. Carácter ribereño con patrones de lotes del centro histórico.',
      },
      photoSlot: 'location.geneva.hero',
    },
    trust: {yearsServing: 25, projectsCompleted: 45, responseTimeDays: 5},
    featuredServices: [
      {slug: 'lawn-care', division: 'landscape'},
      {slug: 'landscape-design', division: 'landscape'},
      {slug: 'patios-walkways', division: 'hardscape'},
      {slug: 'retaining-walls', division: 'hardscape'},
      {slug: 'basement-waterproofing', division: 'waterproofing'},
      {slug: 'driveway-snow-removal', division: 'snow-removal'},
    ],
    whyLocal: {
      en: "Geneva is the historic-downtown core around the Kane County courthouse and the Third Street shopping district, plus residential streets that climb up from the Fox River bluff. We've been on Geneva job sites since 2007, mostly out of our Batavia crew. The riverside lots ask for grading and drainage work that respects the natural slope; the streets around Island Park need walks and walls that match limestone foundations from the 1800s. When you call (630) 946-9321, you get the same family-run team Batavia and St. Charles homeowners reach. One crew, one phone, one accountable family. The crew you meet at the estimate is the crew that pours the base.",
      es: 'Geneva es el centro histórico alrededor del juzgado del condado de Kane y el distrito comercial de Third Street, además de calles residenciales que suben desde el barranco del Río Fox. Estamos en obras de Geneva desde 2007, principalmente desde el equipo de Batavia. Los lotes ribereños piden trabajo de nivelación y drenaje que respete la pendiente natural; las calles alrededor del Island Park necesitan aceras y muros que hagan juego con cimientos de piedra caliza de los 1800. Cuando llamas al (630) 946-9321, te atiende el mismo equipo familiar que atiende a propietarios de Batavia y St. Charles. Un equipo, un teléfono, una familia que rinde cuentas. El equipo que conoces en el estimado es el equipo que coloca la base.',
    },
    testimonials: [],
    meta: {
      title: {
        en: 'Geneva, IL Landscaping & Hardscape | Sunset Services',
        es: 'Paisajismo y Hardscape en Geneva, IL | Sunset Services',
      },
      description: {
        en: 'Family-run landscaping and hardscape in Geneva, IL since 2000. Historic-downtown and Fox River bluff specialists. Free estimates within 5 days.',
        es: 'Empresa familiar de paisajismo y hardscape en Geneva, IL desde 2000. Especialistas del centro histórico y del Río Fox. Estimados gratis en 5 días.',
      },
    },
  },

  {
    slug: 'south-elgin',
    name: 'South Elgin',
    state: 'IL',
    geo: {lat: 42.0008, lng: -88.2917},
    pin: {x: 222.2, y: 60},
    hero: {
      h1: {
        en: 'Landscaping & Hardscape in South Elgin, IL',
        es: 'Paisajismo y Hardscape en South Elgin, IL',
      },
      sub: {
        en: 'Family-run since 2000. Newer subdivisions with a need for solid maintenance routines.',
        es: 'Familiar desde el año 2000. Subdivisiones nuevas que necesitan rutinas sólidas de mantenimiento.',
      },
      photoSlot: 'location.south-elgin.hero',
    },
    trust: {yearsServing: 25, projectsCompleted: 30, responseTimeDays: 7},
    featuredServices: [
      {slug: 'lawn-care', division: 'landscape'},
      {slug: 'landscape-design', division: 'landscape'},
      {slug: 'patios-walkways', division: 'hardscape'},
      {slug: 'retaining-walls', division: 'hardscape'},
      {slug: 'crawl-spaces', division: 'waterproofing'},
      {slug: 'driveway-snow-removal', division: 'snow-removal'},
    ],
    whyLocal: {
      en: "South Elgin grew fast in the 1990s and 2000s, and the housing stock reflects it — mostly newer construction in subdivisions along Stearns Road and the IL-31 corridor. The work here is less about restoration and more about establishing the routines that didn't come with the builder: solid lawn care, mature-plant infill, sprinkler tune-ups every spring. We've been on South Elgin routes since 2011. When you call (630) 946-9321, you get the same family-run team St. Charles and Geneva homeowners reach. One crew, one phone, and trucks in the area at least two days a week from April through November.",
      es: 'South Elgin creció rápido en los años noventa y dos mil, y el inventario de casas lo refleja — mayormente construcción nueva en subdivisiones a lo largo de Stearns Road y el corredor IL-31. El trabajo aquí es menos sobre restauración y más sobre establecer las rutinas que no vinieron con el constructor: cuidado sólido del césped, relleno de plantas maduras, ajustes de riego cada primavera. Estamos en rutas de South Elgin desde 2011. Cuando llamas al (630) 946-9321, te atiende el mismo equipo familiar que atiende a propietarios de St. Charles y Geneva. Un equipo, un teléfono, y camiones en el área al menos dos días por semana de abril a noviembre.',
    },
    testimonials: [],
    meta: {
      title: {
        en: 'South Elgin, IL Landscaping & Hardscape | Sunset Services',
        es: 'Paisajismo y Hardscape en South Elgin, IL | Sunset Services',
      },
      description: {
        en: 'Family-run landscaping and hardscape in South Elgin, IL since 2000. New-construction maintenance specialists. Free estimates within 7 days.',
        es: 'Empresa familiar de paisajismo y hardscape en South Elgin, IL desde 2000. Especialistas en mantenimiento de construcción nueva. Estimados gratis en 7 días.',
      },
    },
  },

  {
    slug: 'elburn',
    name: 'Elburn',
    state: 'IL',
    geo: {lat: 41.8911, lng: -88.472},
    pin: {x: 89.3, y: 168.7},
    hero: {
      h1: {
        en: 'Landscaping & Hardscape in Elburn, IL',
        es: 'Paisajismo y Hardscape en Elburn, IL',
      },
      sub: {
        en: 'Family-run since 2000. Acre-lot subdivisions and farm-edge properties.',
        es: 'Familiar desde el año 2000. Subdivisiones de un acre y propiedades a borde de granja.',
      },
      photoSlot: 'location.elburn.hero',
    },
    trust: {yearsServing: 25, projectsCompleted: 20, responseTimeDays: 7},
    featuredServices: [
      {slug: 'lawn-care', division: 'landscape'},
      {slug: 'landscape-design', division: 'landscape'},
      {slug: 'patios-walkways', division: 'hardscape'},
      {slug: 'retaining-walls', division: 'hardscape'},
      {slug: 'crawl-spaces', division: 'waterproofing'},
      {slug: 'driveway-snow-removal', division: 'snow-removal'},
    ],
    whyLocal: {
      en: "Elburn sits at the western edge of Kane County, where the residential subdivisions give way to farmland inside a mile. The properties along Keslinger Road and the new neighborhoods south of Route 47 mostly run an acre-plus, and the work asks for crews that can handle the scale — proper irrigation, tree care that respects mature plantings, real maintenance routines. We've been on Elburn routes since 2014, usually from the Geneva crew. When you call (630) 946-9321, you don't get a sales rep — Erick picks up. The same crew that walks your property is the crew that pours the base. No subcontracted handoffs.",
      es: 'Elburn está al borde oeste del condado de Kane, donde las subdivisiones residenciales dan paso a tierras de cultivo dentro de una milla. Las propiedades a lo largo de Keslinger Road y los vecindarios nuevos al sur de la Ruta 47 son mayormente de un acre o más, y el trabajo pide equipos que manejen la escala — riego adecuado, cuidado de árboles que respeta plantas maduras, rutinas reales de mantenimiento. Estamos en rutas de Elburn desde 2014, usualmente desde el equipo de Geneva. Cuando llamas al (630) 946-9321, no te atiende un vendedor — Erick contesta. El mismo equipo que camina tu propiedad es el equipo que coloca la base. Sin subcontratistas.',
    },
    testimonials: [],
    meta: {
      title: {
        en: 'Elburn, IL Landscaping & Hardscape | Sunset Services',
        es: 'Paisajismo y Hardscape en Elburn, IL | Sunset Services',
      },
      description: {
        en: 'Family-run landscaping and hardscape in Elburn, IL since 2000. Acre-lot specialists. Free estimates within 7 days.',
        es: 'Empresa familiar de paisajismo y hardscape en Elburn, IL desde 2000. Especialistas en lotes de un acre. Estimados gratis en 7 días.',
      },
    },
  },

  {
    slug: 'north-aurora',
    name: 'North Aurora',
    state: 'IL',
    geo: {lat: 41.8125, lng: -88.3173},
    pin: {x: 203.3, y: 246.4},
    hero: {
      h1: {
        en: 'Landscaping & Hardscape in North Aurora, IL',
        es: 'Paisajismo y Hardscape en North Aurora, IL',
      },
      sub: {
        en: 'Family-run since 2000. The Aurora HQ is a five-minute drive — we own the corridor.',
        es: 'Familiar desde el año 2000. La sede de Aurora queda a cinco minutos — dominamos el corredor.',
      },
      photoSlot: 'location.north-aurora.hero',
    },
    trust: {yearsServing: 25, projectsCompleted: 80, responseTimeDays: 5},
    featuredServices: [
      {slug: 'lawn-care', division: 'landscape'},
      {slug: 'landscape-design', division: 'landscape'},
      {slug: 'patios-walkways', division: 'hardscape'},
      {slug: 'retaining-walls', division: 'hardscape'},
      {slug: 'sump-pumps', division: 'waterproofing'},
      {slug: 'driveway-snow-removal', division: 'snow-removal'},
    ],
    whyLocal: {
      en: "North Aurora is literally up the street from our Mountain Street yard, and a meaningful chunk of our route — both residential and commercial — happens within the village boundary. We mow the Stoneridge subdivisions on Wednesdays, plow the office parks along Randall Road on every storm event, and have planted in the Riverwoods neighborhood every spring since 2002. The crews know which streets the village salts last in a storm; which subdivisions have HOA approval forms that need three weeks; which lots back up to the Fox River and ask for grading work. When you call (630) 946-9321, the same Sunset team that built our reputation in Aurora is the team that picks up. One crew, one phone, twenty-five years of paying attention.",
      es: 'North Aurora está literalmente calle arriba de nuestro patio en Mountain Street, y una parte significativa de nuestra ruta — tanto residencial como comercial — ocurre dentro de los límites del pueblo. Cortamos las subdivisiones de Stoneridge los miércoles, limpiamos los parques de oficinas a lo largo de Randall Road en cada tormenta, y hemos plantado en el vecindario Riverwoods cada primavera desde 2002. Los equipos saben qué calles limpia el municipio al final en una tormenta; qué subdivisiones tienen formularios de aprobación de HOA que tardan tres semanas; qué lotes dan al Río Fox y piden trabajo de nivelación. Cuando llamas al (630) 946-9321, el mismo equipo Sunset que construyó nuestra reputación en Aurora es el equipo que contesta. Un equipo, un teléfono, veinticinco años de prestar atención.',
    },
    testimonials: [],
    meta: {
      title: {
        en: 'North Aurora, IL Landscaping & Snow | Sunset Services',
        es: 'Paisajismo y Manejo de Nieve en North Aurora, IL | Sunset Services',
      },
      description: {
        en: 'Family-run landscaping, hardscape, and commercial snow in North Aurora, IL since 2000. HQ is 5 minutes away. Free estimates within 5 days.',
        es: 'Paisajismo, hardscape y nieve comercial en North Aurora, IL desde 2000. Sede a 5 minutos. Estimados gratis en 5 días.',
      },
    },
  },

  {
    slug: 'oswego',
    name: 'Oswego',
    state: 'IL',
    geo: {lat: 41.6831, lng: -88.3514},
    pin: {x: 178.2, y: 374.2},
    hero: {
      h1: {
        en: 'Landscaping & Hardscape in Oswego, IL',
        es: 'Paisajismo y Hardscape en Oswego, IL',
      },
      sub: {
        en: 'Family-run since 2000. Newer construction with full-yard plans and acre lots.',
        es: 'Familiar desde el año 2000. Construcción nueva con planes completos y lotes de un acre.',
      },
      photoSlot: 'location.oswego.hero',
    },
    trust: {yearsServing: 25, projectsCompleted: 35, responseTimeDays: 5},
    featuredServices: [
      {slug: 'lawn-care', division: 'landscape'},
      {slug: 'landscape-design', division: 'landscape'},
      {slug: 'patios-walkways', division: 'hardscape'},
      {slug: 'retaining-walls', division: 'hardscape'},
      {slug: 'sump-pumps', division: 'waterproofing'},
      {slug: 'driveway-snow-removal', division: 'snow-removal'},
    ],
    whyLocal: {
      en: "Oswego is mostly 2000s-and-newer construction along the Route 30 / Route 71 corridors south of the Fox River. The lots run an acre-plus on average and most properties want the kind of full-yard plan you build once and keep for twenty years — paver patio that flows from the kitchen, retaining wall that doubles as seating, a fire feature sized for actual family use. We've been on Oswego routes since 2011. When you call (630) 946-9321, you get Erick. The same crew that walks your property at the estimate is the crew that builds the project. No subcontracted handoffs to someone you've never met.",
      es: 'Oswego es mayormente construcción de los años dos mil y más nueva a lo largo de los corredores Ruta 30 / Ruta 71 al sur del Río Fox. Los lotes son en promedio de un acre o más y la mayoría de las propiedades quieren la clase de plan completo que construyes una vez y mantienes por veinte años — patio de adoquines que fluye desde la cocina, muro de contención que también es asiento, brasero dimensionado para uso real en familia. Estamos en rutas de Oswego desde 2011. Cuando llamas al (630) 946-9321, te atiende Erick. El mismo equipo que camina tu propiedad en el estimado es el equipo que construye el proyecto. Sin entregar a un subcontratista que apenas acabas de conocer.',
    },
    testimonials: [],
    meta: {
      title: {
        en: 'Oswego, IL Landscaping & Hardscape | Sunset Services',
        es: 'Paisajismo y Hardscape en Oswego, IL | Sunset Services',
      },
      description: {
        en: 'Family-run landscape design and hardscape in Oswego, IL since 2000. Full-yard plan specialists. Free estimates within 5 days.',
        es: 'Diseño de paisaje y hardscape familiar en Oswego, IL desde 2000. Especialistas en planes completos. Estimados gratis en 5 días.',
      },
    },
  },

  {
    slug: 'yorkville',
    name: 'Yorkville',
    state: 'IL',
    geo: {lat: 41.6411, lng: -88.4473},
    pin: {x: 107.5, y: 415.7},
    hero: {
      h1: {
        en: 'Landscaping & Hardscape in Yorkville, IL',
        es: 'Paisajismo y Hardscape en Yorkville, IL',
      },
      sub: {
        en: 'Family-run since 2000. Established residential with acre-plus lots and farm-edge land.',
        es: 'Familiar desde el año 2000. Residencial establecido con lotes de más de un acre y tierra al borde de granja.',
      },
      photoSlot: 'location.yorkville.hero',
    },
    trust: {yearsServing: 25, projectsCompleted: 25, responseTimeDays: 7},
    featuredServices: [
      {slug: 'lawn-care', division: 'landscape'},
      {slug: 'landscape-design', division: 'landscape'},
      {slug: 'patios-walkways', division: 'hardscape'},
      {slug: 'retaining-walls', division: 'hardscape'},
      {slug: 'sump-pumps', division: 'waterproofing'},
      {slug: 'driveway-snow-removal', division: 'snow-removal'},
    ],
    whyLocal: {
      en: "Yorkville is the seat of Kendall County and sits at the edge of where the suburbs give way to farmland. The properties along Route 47 and the streets near Hoover Park run an acre-plus and ask for landscape work that respects the scale — proper grading, real irrigation, hardscape that holds up to two decades of weather without resetting. We've been on Yorkville routes since 2013, usually paired with the Oswego crew. When you call (630) 946-9321, the same family-run team Aurora and Oswego homeowners reach is the team that picks up. One crew, one phone, no subcontracted handoffs.",
      es: 'Yorkville es la sede del condado de Kendall y está al borde donde los suburbios dan paso a tierras de cultivo. Las propiedades a lo largo de la Ruta 47 y las calles cerca del Hoover Park son de un acre o más y piden trabajo de paisajismo que respeta la escala — nivelación adecuada, riego real, hardscape que aguante dos décadas de clima sin reasentar. Estamos en rutas de Yorkville desde 2013, usualmente emparejados con el equipo de Oswego. Cuando llamas al (630) 946-9321, el mismo equipo familiar que atiende a propietarios de Aurora y Oswego es el equipo que contesta. Un equipo, un teléfono, sin subcontratistas.',
    },
    testimonials: [],
    meta: {
      title: {
        en: 'Yorkville, IL Landscaping & Hardscape | Sunset Services',
        es: 'Paisajismo y Hardscape en Yorkville, IL | Sunset Services',
      },
      description: {
        en: 'Family-run landscaping and hardscape in Yorkville, IL since 2000. Acre-lot specialists. Free estimates within 7 days.',
        es: 'Empresa familiar de paisajismo y hardscape en Yorkville, IL desde 2000. Especialistas en lotes de un acre. Estimados gratis en 7 días.',
      },
    },
  },

  {
    slug: 'plainfield',
    name: 'Plainfield',
    state: 'IL',
    geo: {lat: 41.6164, lng: -88.2042},
    pin: {x: 286.6, y: 440},
    hero: {
      h1: {
        en: 'Landscaping & Hardscape in Plainfield, IL',
        es: 'Paisajismo y Hardscape en Plainfield, IL',
      },
      sub: {
        en: 'Family-run since 2000. Residential growth corridor and historic-downtown character.',
        es: 'Familiar desde el año 2000. Corredor de crecimiento residencial y carácter del centro histórico.',
      },
      photoSlot: 'location.plainfield.hero',
    },
    trust: {yearsServing: 25, projectsCompleted: 45, responseTimeDays: 5},
    featuredServices: [
      {slug: 'lawn-care', division: 'landscape'},
      {slug: 'landscape-design', division: 'landscape'},
      {slug: 'patios-walkways', division: 'hardscape'},
      {slug: 'retaining-walls', division: 'hardscape'},
      {slug: 'sump-pumps', division: 'waterproofing'},
      {slug: 'driveway-snow-removal', division: 'snow-removal'},
    ],
    whyLocal: {
      en: "Plainfield is two towns in one — the historic downtown around Lockport Street with its 1800s storefronts, and the explosive newer growth along Route 59 and Route 30 with thousands of acres of subdivisions built in the last twenty years. The newer subdivisions ask for established maintenance routines and full-yard plans; the historic downtown core asks for restoration-style work that matches limestone foundations and mature trees. We've been on Plainfield routes since 2008. When you call (630) 946-9321, you get the same family-run team Naperville and Bolingbrook homeowners reach. One crew, one phone, twenty-five years of paying attention to the streets the GPS misses.",
      es: 'Plainfield es dos pueblos en uno — el centro histórico alrededor de Lockport Street con sus fachadas de los 1800, y el crecimiento explosivo nuevo a lo largo de la Ruta 59 y la Ruta 30 con miles de acres de subdivisiones construidas en los últimos veinte años. Las subdivisiones nuevas piden rutinas de mantenimiento establecidas y planes completos; el centro histórico pide trabajo de tipo restauración que haga juego con cimientos de piedra caliza y árboles maduros. Estamos en rutas de Plainfield desde 2008. Cuando llamas al (630) 946-9321, te atiende el mismo equipo familiar que atiende a propietarios de Naperville y Bolingbrook. Un equipo, un teléfono, veinticinco años de prestar atención a las calles que el GPS pierde.',
    },
    testimonials: [],
    meta: {
      title: {
        en: 'Plainfield, IL Landscaping & Hardscape | Sunset Services',
        es: 'Paisajismo y Hardscape en Plainfield, IL | Sunset Services',
      },
      description: {
        en: 'Family-run landscaping and hardscape in Plainfield, IL since 2000. Historic-downtown and newer-subdivision specialists. Free estimates within 5 days.',
        es: 'Empresa familiar de paisajismo y hardscape en Plainfield, IL desde 2000. Especialistas del centro histórico y nuevas subdivisiones. Estimados gratis en 5 días.',
      },
    },
  },
];

/**
 * Slugs for cities that have a live `/service-areas/<slug>/` page TODAY.
 *
 * Phase M.01d (2026-05-26): kept at the original 6 by design — the 18 new
 * cities added to `LOCATIONS` and `LocationCitySlug` in M.01d don't get a
 * detail page until M.01e wires them. `isLocationSlug` returns false for
 * new-city slugs through M.01d, so /service-areas/hinsdale/ etc. 404.
 *
 * M.01e flips this to the full 24-slug list (or deletes the constant and
 * uses `LOCATIONS.map`) when the new city pages light up.
 */
export const LOCATION_SLUGS: readonly LocationCitySlug[] = [
  'aurora',
  'naperville',
  'batavia',
  'wheaton',
  'lisle',
  'bolingbrook',
] as const;

/**
 * Phase M.01d — all 24 known city slugs (6 visible-now + 18 wired-in-M.01e).
 * Used by `automation/portfolio/draft.ts` so the AI drafter can produce
 * portfolio entries with any of the 24 city slugs without M.01e needing to
 * touch the automation pipeline.
 */
export const ALL_LOCATION_SLUGS: readonly LocationCitySlug[] = [
  'aurora',
  'naperville',
  'batavia',
  'wheaton',
  'lisle',
  'bolingbrook',
  'hinsdale',
  'oak-brook',
  'elmhurst',
  'clarendon-hills',
  'burr-ridge',
  'western-springs',
  'glen-ellyn',
  'downers-grove',
  'winfield',
  'lombard',
  'st-charles',
  'geneva',
  'south-elgin',
  'elburn',
  'north-aurora',
  'oswego',
  'yorkville',
  'plainfield',
] as const;

export function getLocation(slug: string): LocationCity | undefined {
  return LOCATIONS.find((l) => l.slug === slug);
}

/**
 * Phase M.01e — accepts any of the 22 live city slugs (24 total minus
 * the 2 retired). The 2 retired cities (Lisle, Bolingbrook) return false
 * here so the route 404s rather than rendering; the
 * `next.config.ts` redirects send those URLs to `/service-areas/`.
 */
const RETIRED_CITY_SLUGS = new Set<string>(['lisle', 'bolingbrook']);

export const SURFACED_LOCATION_SLUGS: readonly LocationCitySlug[] = ALL_LOCATION_SLUGS.filter(
  (slug) => !RETIRED_CITY_SLUGS.has(slug),
);

export function isLocationSlug(slug: string): slug is LocationCitySlug {
  return (SURFACED_LOCATION_SLUGS as readonly string[]).includes(slug);
}

/**
 * Phase M.01d — returns only the cities that have a live page in M.01d
 * (the original 6). M.01e returns to `LOCATIONS` when the 18 new pages
 * are wired and the index is redrawn.
 */
export function getVisibleLocations(): LocationCity[] {
  const visibleSet = new Set<string>(SURFACED_LOCATION_SLUGS);
  return LOCATIONS.filter((l) => visibleSet.has(l.slug));
}

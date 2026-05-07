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
 * - `whyLocal`, `testimonials`, and `faq` Spanish strings ship as a
 *   first-pass draft; Phase 2.13 native review polishes.
 * - Real photography swaps in Phase 2.04; until then the hero `photoSlot`
 *   resolves through the existing `imageMap` AVIF placeholders.
 */

import type {Audience} from './services';

export type LocationLocalized = {en: string; es: string};

export type LocationCitySlug =
  | 'aurora'
  | 'naperville'
  | 'batavia'
  | 'wheaton'
  | 'lisle'
  | 'bolingbrook';

export type LocationFeaturedService = {
  slug: string;
  /** Required so the link target is unambiguous when slugs span audiences (e.g., snow-removal). */
  audience: Audience;
};

export type LocationTestimonial = {
  quote: LocationLocalized;
  attribution: LocationLocalized;
  /** Fixed 5 in Part 1; real ratings arrive Phase 2.15. */
  rating: 5;
};

export type LocationFaqItem = {
  q: LocationLocalized;
  a: LocationLocalized;
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
  /** Length 4 (D8.A fixed). */
  faq: LocationFaqItem[];
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
    pin: {x: 140, y: 320},
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
      {slug: 'patios-walkways', audience: 'hardscape'},
      {slug: 'retaining-walls', audience: 'hardscape'},
      {slug: 'lawn-care', audience: 'residential'},
      {slug: 'landscape-design', audience: 'residential'},
      {slug: 'landscape-maintenance', audience: 'commercial'},
      {slug: 'snow-removal', audience: 'commercial'},
    ],
    whyLocal: {
      en: "Aurora is home. The yard our trucks pull out of every morning sits on Mountain Street, and a quarter of our jobs are within a ten-minute drive of it. We know which subdivisions on the east side have curb cuts that won't fit a skid steer, which streets the city plows last after a heavy storm, and which corner lots tend to flood at the back fence after a hard April rain. That's not searchable — it's twenty-five years of paying attention. When you call (630) 946-9321, Erick or his son picks up. The crew that walks your property is the crew that pours the base. No subcontracted hand-offs.",
      es: '[TBR] Aurora es nuestra casa. El depósito de donde salen nuestros camiones cada mañana queda en Mountain Street, y una cuarta parte de nuestros trabajos están a diez minutos en coche. Sabemos qué subdivisiones del lado este tienen entradas que no aceptan una mini-cargadora, qué calles la ciudad limpia al final tras una tormenta fuerte, y qué lotes en esquina tienden a inundarse en la cerca trasera después de una lluvia fuerte de abril. Eso no se busca en Google — son veinticinco años de prestar atención. Cuando llamas al (630) 946-9321, Erick o su hijo contestan.',
    },
    testimonials: [
      {
        quote: {
          en: "Erick's crew rebuilt our front walk in two days. Cleaner than the day we moved in — and they swept the street before they left.",
          es: '[TBR] El equipo de Erick reconstruyó nuestra entrada en dos días. Más limpio que el día que nos mudamos — y barrieron la calle antes de irse.',
        },
        attribution: {
          en: 'Patricia M., Pigeon Hill · Aurora',
          es: '[TBR] Patricia M., Pigeon Hill · Aurora',
        },
        rating: 5,
      },
    ],
    faq: [
      {
        q: {
          en: 'Do you charge a travel fee to Aurora?',
          es: '[TBR] ¿Cobran una tarifa de viaje a Aurora?',
        },
        a: {
          en: "No. Aurora is home base — our yard is on Mountain Street. Estimates are free and we don't add a mileage charge anywhere in DuPage County.",
          es: '[TBR] No. Aurora es nuestra base — el depósito está en Mountain Street. Los presupuestos son gratis y no cobramos por kilometraje en ningún lugar del Condado de DuPage.',
        },
      },
      {
        q: {
          en: 'How long has Sunset Services been in Aurora?',
          es: '[TBR] ¿Cuánto tiempo lleva Sunset Services en Aurora?',
        },
        a: {
          en: 'Twenty-five years and counting. Nick started the company here in 2000; Erick took over operations in 2018. Our first Aurora maintenance contract is still active.',
          es: '[TBR] Veinticinco años y contando. Nick fundó la empresa aquí en el año 2000; Erick tomó las operaciones en 2018. Nuestro primer contrato de mantenimiento en Aurora sigue activo.',
        },
      },
      {
        q: {
          en: "Do you pull permits for hardscape and tree work in Aurora?",
          es: '[TBR] ¿Sacan permisos para hardscape y trabajo de árboles en Aurora?',
        },
        a: {
          en: "Yes. Anything that needs a permit from the City of Aurora — patio above 200 sq ft, retaining walls over 4 ft, large tree removals — we handle the paperwork as part of the job. We've been through that office enough times that they know us.",
          es: '[TBR] Sí. Todo lo que requiera permiso de la Ciudad de Aurora — patios de más de 200 pies cuadrados, muros de contención de más de 4 pies, remoción de árboles grandes — lo gestionamos como parte del trabajo. Conocemos esa oficina bien.',
        },
      },
      {
        q: {
          en: 'Do you work with Aurora-area HOAs and apartment property managers?',
          es: '[TBR] ¿Trabajan con HOAs de Aurora y administradores de propiedades de apartamentos?',
        },
        a: {
          en: "Yes. Our commercial division covers HOA common areas, multifamily landscaping, and small commercial frontages across the east and west sides. Aurora is a third of our commercial book.",
          es: '[TBR] Sí. Nuestra división comercial cubre áreas comunes de HOA, jardinería multifamiliar, y frentes comerciales pequeños en los lados este y oeste. Aurora es un tercio de nuestra cartera comercial.',
        },
      },
    ],
    meta: {
      title: {
        en: 'Aurora, IL Landscaping & Hardscape | Sunset Services',
        es: 'Paisajismo y Hardscape en Aurora, IL | Sunset Services',
      },
      description: {
        en: 'Family-run landscaping and hardscape in Aurora, IL since 2000. Patios, retaining walls, lawn care. Free estimates within 5 days.',
        es: '[TBR] Paisajismo y hardscape familiar en Aurora, IL desde el año 2000. Patios, muros de contención, cuidado de césped. Presupuestos gratuitos en 5 días.',
      },
    },
  },
  {
    slug: 'naperville',
    name: 'Naperville',
    state: 'IL',
    geo: {lat: 41.7508, lng: -88.1535},
    pin: {x: 240, y: 350},
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
      {slug: 'patios-walkways', audience: 'hardscape'},
      {slug: 'retaining-walls', audience: 'hardscape'},
      {slug: 'outdoor-kitchens', audience: 'hardscape'},
      {slug: 'fire-pits-features', audience: 'hardscape'},
      {slug: 'landscape-design', audience: 'residential'},
      {slug: 'lawn-care', audience: 'residential'},
    ],
    whyLocal: {
      en: 'Our crews drive Naperville every day. We know which lots back up to forest preserve, which subdivisions have HOA approval forms that need three weeks, which slope grades drain into the sewer easement and which feed the neighbor\'s patio. That\'s not a search-engine fact — that\'s twenty-five years of going back when something settles wrong. When you call (630) 946-9321, Erick or his son picks up. The crew that walks your property is the crew that pours the base. You won\'t hand off to a subcontractor we just met. Naperville is a third of our hardscape book; we have a Unilock yard a short truck-ride from your driveway.',
      es: '[TBR] Nuestros equipos manejan por Naperville todos los días. Sabemos qué lotes dan a la reserva forestal, qué subdivisiones tienen formularios de aprobación de HOA que tardan tres semanas, qué pendientes drenan al desagüe y cuáles drenan al patio del vecino. Eso no se busca en Google — son veinticinco años de volver cuando algo se asienta mal. Cuando llamas al (630) 946-9321, Erick o su hijo contestan. El equipo que camina tu propiedad es el equipo que vacía la base.',
    },
    testimonials: [
      {
        quote: {
          en: 'They took a backyard slope no one in Naperville would touch and turned it into our favorite room of the house.',
          es: '[TBR] Tomaron una pendiente trasera que nadie en Naperville quería tocar y la convirtieron en nuestra habitación favorita de la casa.',
        },
        attribution: {
          en: 'Sarah K., West Highlands · Naperville',
          es: '[TBR] Sarah K., West Highlands · Naperville',
        },
        rating: 5,
      },
    ],
    faq: [
      {
        q: {
          en: 'Do you charge a travel fee to Naperville?',
          es: '[TBR] ¿Cobran una tarifa de viaje a Naperville?',
        },
        a: {
          en: "No. Naperville is in our regular service area; estimates are free and we don't add a mileage charge.",
          es: '[TBR] No. Naperville está dentro de nuestra área de servicio regular; los presupuestos son gratis y no cobramos por kilometraje.',
        },
      },
      {
        q: {
          en: 'How long has Sunset Services been working in Naperville?',
          es: '[TBR] ¿Cuánto tiempo lleva Sunset Services trabajando en Naperville?',
        },
        a: {
          en: 'Since the second year of the business — the first Naperville patio went in in 2001. Naperville is the city we\'ve worked in longest after Aurora.',
          es: '[TBR] Desde el segundo año del negocio — el primer patio en Naperville se construyó en 2001. Naperville es la ciudad donde hemos trabajado más tiempo después de Aurora.',
        },
      },
      {
        q: {
          en: "Are you familiar with Naperville's permit process for hardscape?",
          es: '[TBR] ¿Conocen el proceso de permisos de Naperville para hardscape?',
        },
        a: {
          en: 'Yes. Naperville requires a permit for any patio over 200 sq ft and for retaining walls over 4 ft tall, and the building department wants a sealed drainage plan for anything that touches an easement. We submit those drawings as part of the project.',
          es: '[TBR] Sí. Naperville requiere permiso para cualquier patio de más de 200 pies cuadrados y para muros de contención de más de 4 pies, y el departamento de construcción exige un plan de drenaje sellado para cualquier cosa que toque una servidumbre. Presentamos esos planos como parte del proyecto.',
        },
      },
      {
        q: {
          en: 'Do you handle HOA approval submissions for Naperville subdivisions?',
          es: '[TBR] ¿Gestionan las aprobaciones de HOA para las subdivisiones de Naperville?',
        },
        a: {
          en: 'Yes. We prepare the drawings, materials list, and color samples that most Naperville HOAs require, and we have a working relationship with several of the boards. Plan three weeks for HOA review on top of project lead time.',
          es: '[TBR] Sí. Preparamos los planos, la lista de materiales y muestras de color que la mayoría de los HOAs de Naperville requieren, y tenemos relación con varias de las juntas. Cuenta con tres semanas de revisión del HOA además del tiempo del proyecto.',
        },
      },
    ],
    meta: {
      title: {
        en: 'Naperville, IL Landscaping & Hardscape | Sunset Services',
        es: 'Paisajismo y Hardscape en Naperville, IL | Sunset Services',
      },
      description: {
        en: 'Family-run landscaping and hardscape in Naperville, IL since 2000. Patios, outdoor kitchens, retaining walls. Free estimates within 5 days.',
        es: '[TBR] Paisajismo y hardscape familiar en Naperville, IL desde el año 2000. Patios, cocinas exteriores, muros. Presupuestos gratuitos en 5 días.',
      },
    },
  },
  {
    slug: 'batavia',
    name: 'Batavia',
    state: 'IL',
    geo: {lat: 41.85, lng: -88.312},
    pin: {x: 118, y: 190},
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
      {slug: 'lawn-care', audience: 'residential'},
      {slug: 'landscape-design', audience: 'residential'},
      {slug: 'tree-services', audience: 'residential'},
      {slug: 'patios-walkways', audience: 'hardscape'},
      {slug: 'retaining-walls', audience: 'hardscape'},
      {slug: 'landscape-maintenance', audience: 'commercial'},
    ],
    whyLocal: {
      en: "Batavia is the river town we've been mowing since 2003. The lots along the Fox River drain differently than the inland streets — what looks like a flat backyard often has a six-inch grade we can read off a hose-line in five minutes. That matters when you're putting in a patio or planting beds: get the grade wrong and the first big storm tells you. We've placed enough natural stone walls along the slope of the bluff to know where the city wants the drainage tile. When you call (630) 946-9321, the same crew you'd see at the estimate is the crew that does the work — no handoff to someone you've never met.",
      es: '[TBR] Batavia es el pueblo del río donde hemos cortado césped desde 2003. Los lotes a lo largo del Río Fox drenan distinto que las calles del interior — lo que parece un patio plano a menudo tiene seis pulgadas de pendiente que podemos leer en cinco minutos. Eso importa cuando colocas un patio o canteros: si te equivocas con la pendiente, la primera tormenta fuerte te lo dice. Hemos colocado suficientes muros de piedra natural a lo largo de la pendiente del barranco para saber dónde la ciudad quiere los desagües.',
    },
    testimonials: [
      {
        quote: {
          en: "We had a drainage problem at the back of the lot for fifteen years. Sunset re-graded the whole back third and put in French drains. Two springs in, no more standing water.",
          es: '[TBR] Tuvimos un problema de drenaje en la parte trasera del lote durante quince años. Sunset reniveló todo el tercio trasero e instaló desagües franceses. Dos primaveras después, no hay agua estancada.',
        },
        attribution: {
          en: 'Mark T., Riverside · Batavia',
          es: '[TBR] Mark T., Riverside · Batavia',
        },
        rating: 5,
      },
    ],
    faq: [
      {
        q: {
          en: 'Do you charge a travel fee to Batavia?',
          es: '[TBR] ¿Cobran una tarifa de viaje a Batavia?',
        },
        a: {
          en: "No. Batavia is on our regular routes; estimates are free and we don't add a mileage charge.",
          es: '[TBR] No. Batavia está en nuestras rutas regulares; los presupuestos son gratis y no cobramos por kilometraje.',
        },
      },
      {
        q: {
          en: 'How long has Sunset Services been in Batavia?',
          es: '[TBR] ¿Cuánto tiempo lleva Sunset Services en Batavia?',
        },
        a: {
          en: "Since 2003. We started with a maintenance route along Wilson Street and have been working the riverside neighborhoods steadily ever since.",
          es: '[TBR] Desde 2003. Empezamos con una ruta de mantenimiento por Wilson Street y hemos trabajado los barrios ribereños de forma constante desde entonces.',
        },
      },
      {
        q: {
          en: 'Do you handle riverside drainage and grade problems?',
          es: '[TBR] ¿Manejan problemas de drenaje y pendiente cerca del río?',
        },
        a: {
          en: "Yes. Bluff-side lots, sump-pump runs, French drains, and re-grading are a regular part of the work in Batavia. We pull the city's drainage plan first so we know what's tied to the storm sewer before we move dirt.",
          es: '[TBR] Sí. Lotes en la pendiente, salidas de bomba sumidero, desagües franceses y renivelación son parte regular del trabajo en Batavia. Sacamos el plano de drenaje de la ciudad primero para saber qué está conectado al alcantarillado antes de mover tierra.',
        },
      },
      {
        q: {
          en: 'Are you familiar with the Batavia tree-removal ordinance?',
          es: '[TBR] ¿Conocen la ordenanza de Batavia sobre remoción de árboles?',
        },
        a: {
          en: 'Yes. Batavia restricts removal of parkway trees and any trunk over 6 inches in protected areas — the city forester signs off before we touch them. We pull that paperwork as part of the bid.',
          es: '[TBR] Sí. Batavia restringe la remoción de árboles del parque y cualquier tronco de más de 6 pulgadas en áreas protegidas — el silvicultor de la ciudad debe aprobar antes de tocarlos. Sacamos ese papeleo como parte del presupuesto.',
        },
      },
    ],
    meta: {
      title: {
        en: 'Batavia, IL Landscaping & Hardscape | Sunset Services',
        es: 'Paisajismo y Hardscape en Batavia, IL | Sunset Services',
      },
      description: {
        en: 'Family-run landscaping and hardscape in Batavia, IL since 2000. Lawn care, landscape design, tree services. Free estimates within 7 days.',
        es: '[TBR] Paisajismo y hardscape familiar en Batavia, IL desde el año 2000. Cuidado de césped, diseño, árboles. Presupuestos gratuitos en 7 días.',
      },
    },
  },
  {
    slug: 'wheaton',
    name: 'Wheaton',
    state: 'IL',
    geo: {lat: 41.8661, lng: -88.107},
    pin: {x: 282, y: 200},
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
      {slug: 'patios-walkways', audience: 'hardscape'},
      {slug: 'retaining-walls', audience: 'hardscape'},
      {slug: 'fire-pits-features', audience: 'hardscape'},
      {slug: 'landscape-design', audience: 'residential'},
      {slug: 'lawn-care', audience: 'residential'},
      {slug: 'tree-services', audience: 'residential'},
    ],
    whyLocal: {
      en: "Wheaton is mature trees, brick driveways, and lawns that have looked the same since the Eighties — for good reason. The job there is usually less about reinventing a property and more about respecting it: matching the brick on a front walk that's been settling for forty years, planting under a hundred-year oak without rolling its root flare, getting a retaining wall to read like it's always been there. We've been working Wheaton since 2002. The same crew you meet at the estimate is the crew that builds the project. When you call (630) 946-9321, Erick or his son picks up; you don't get a sales rep. We're not the biggest crew in town, and we're not trying to be.",
      es: '[TBR] Wheaton es árboles maduros, entradas de ladrillo y céspedes que se ven igual desde los años ochenta — por buenas razones. El trabajo allí suele ser menos sobre reinventar una propiedad y más sobre respetarla: hacer juego con el ladrillo de una entrada que se ha asentado durante cuarenta años, plantar bajo un roble centenario sin alterar su raíz, hacer que un muro de contención se vea como si siempre hubiera estado ahí. Trabajamos en Wheaton desde 2002. El mismo equipo que conoces en el presupuesto es el equipo que construye el proyecto.',
    },
    testimonials: [
      {
        quote: {
          en: "They re-laid a brick walk that's been there since 1978. You can't tell where the old ends and the new begins.",
          es: '[TBR] Reasentaron una entrada de ladrillo que estaba desde 1978. No puedes notar dónde termina lo viejo y empieza lo nuevo.',
        },
        attribution: {
          en: 'James L., Briar Street · Wheaton',
          es: '[TBR] James L., Briar Street · Wheaton',
        },
        rating: 5,
      },
    ],
    faq: [
      {
        q: {
          en: 'Do you charge a travel fee to Wheaton?',
          es: '[TBR] ¿Cobran una tarifa de viaje a Wheaton?',
        },
        a: {
          en: "No. Wheaton is in our regular service area; estimates are free and we don't add a mileage charge.",
          es: '[TBR] No. Wheaton está en nuestra área de servicio regular; los presupuestos son gratis y no cobramos por kilometraje.',
        },
      },
      {
        q: {
          en: 'How long has Sunset Services been working in Wheaton?',
          es: '[TBR] ¿Cuánto tiempo lleva Sunset Services trabajando en Wheaton?',
        },
        a: {
          en: 'Since 2002. We have several Wheaton clients on continuous maintenance contracts going back fifteen-plus years.',
          es: '[TBR] Desde 2002. Tenemos varios clientes de Wheaton con contratos de mantenimiento continuos de más de quince años.',
        },
      },
      {
        q: {
          en: "Are you familiar with Wheaton's permit and historic-district rules?",
          es: '[TBR] ¿Conocen los permisos y reglas de distrito histórico de Wheaton?',
        },
        a: {
          en: "Yes. Anything in or near the historic district needs design review before construction; we prep the application and the drawings, and we've been through that office enough that we know what they ask for.",
          es: '[TBR] Sí. Todo lo que esté en o cerca del distrito histórico necesita revisión de diseño antes de la construcción; preparamos la solicitud y los planos, y conocemos esa oficina lo suficiente como para saber qué piden.',
        },
      },
      {
        q: {
          en: 'Do you work on properties with mature, protected trees?',
          es: '[TBR] ¿Trabajan en propiedades con árboles maduros protegidos?',
        },
        a: {
          en: "Yes. We hand-dig within the drip line of mature trees and we won't run heavy equipment across a root flare. If a project genuinely threatens a protected tree, we say so up-front and re-scope.",
          es: '[TBR] Sí. Excavamos a mano dentro del área de la copa de árboles maduros y no pasamos equipo pesado sobre la raíz. Si un proyecto amenaza realmente un árbol protegido, lo decimos de frente y replanteamos el alcance.',
        },
      },
    ],
    meta: {
      title: {
        en: 'Wheaton, IL Landscaping & Hardscape | Sunset Services',
        es: 'Paisajismo y Hardscape en Wheaton, IL | Sunset Services',
      },
      description: {
        en: 'Family-run landscaping and hardscape in Wheaton, IL since 2000. Patios, retaining walls, landscape design. Free estimates within 5 days.',
        es: '[TBR] Paisajismo y hardscape familiar en Wheaton, IL desde el año 2000. Patios, muros, diseño. Presupuestos gratuitos en 5 días.',
      },
    },
  },
  {
    slug: 'lisle',
    name: 'Lisle',
    state: 'IL',
    geo: {lat: 41.8011, lng: -88.0742},
    pin: {x: 370, y: 270},
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
      {slug: 'landscape-maintenance', audience: 'commercial'},
      {slug: 'snow-removal', audience: 'commercial'},
      {slug: 'turf-management', audience: 'commercial'},
      {slug: 'lawn-care', audience: 'residential'},
      {slug: 'sprinkler-systems', audience: 'residential'},
      {slug: 'patios-walkways', audience: 'hardscape'},
    ],
    whyLocal: {
      en: "Lisle is the corporate corridor — Warrenville Road and the I-88 frontage are why we put a second commercial truck on the road in 2014. We mow, edge, and snow-clear for property managers who get one chance per visit and a phone call from corporate when something looks off. Most of our Lisle work happens before 7 a.m. so it's done before tenants pull in. On the residential side, the established neighborhoods east of College Road have been on our maintenance routes for fifteen-plus years. When you call (630) 946-9321, the same Sunset Services number residential homeowners reach is the number Lisle property managers reach. One crew, one phone, one accountable family.",
      es: '[TBR] Lisle es el corredor corporativo — Warrenville Road y el frente de la I-88 son la razón por la que pusimos un segundo camión comercial en 2014. Cortamos, bordeamos y limpiamos nieve para administradores de propiedades que tienen una sola oportunidad por visita y una llamada de la corporativa cuando algo se ve mal. La mayoría de nuestro trabajo en Lisle se hace antes de las 7 a.m. para que esté listo antes de que lleguen los inquilinos.',
    },
    testimonials: [
      {
        quote: {
          en: "We manage three properties on Warrenville Road. Sunset is the only landscaper who's ever returned every email within four hours. That's the bar.",
          es: '[TBR] Administramos tres propiedades en Warrenville Road. Sunset es el único paisajista que ha respondido cada correo dentro de cuatro horas. Ese es el estándar.',
        },
        attribution: {
          en: 'Diane R., Property Manager · Lisle',
          es: '[TBR] Diane R., Administradora de Propiedades · Lisle',
        },
        rating: 5,
      },
    ],
    faq: [
      {
        q: {
          en: 'Do you charge a travel fee to Lisle?',
          es: '[TBR] ¿Cobran una tarifa de viaje a Lisle?',
        },
        a: {
          en: "No. Lisle is in our regular service area; estimates are free and we don't add a mileage charge.",
          es: '[TBR] No. Lisle está en nuestra área de servicio regular; los presupuestos son gratis y no cobramos por kilometraje.',
        },
      },
      {
        q: {
          en: 'How long has Sunset Services been working in Lisle?',
          es: '[TBR] ¿Cuánto tiempo lleva Sunset Services trabajando en Lisle?',
        },
        a: {
          en: "Since 2008 commercially; longer on the residential side. Several of the corporate-corridor accounts are still active from year one.",
          es: '[TBR] Desde 2008 en lo comercial; más tiempo en lo residencial. Varias de las cuentas del corredor corporativo siguen activas desde el primer año.',
        },
      },
      {
        q: {
          en: 'Can you schedule commercial work outside business hours in Lisle?',
          es: '[TBR] ¿Pueden programar trabajo comercial fuera de horario en Lisle?',
        },
        a: {
          en: "Yes. Our commercial crews start at 5 a.m. on the corporate corridor properties so mowing, edging, and snow-clear are done before tenants arrive. Snow events are 24/7.",
          es: '[TBR] Sí. Nuestros equipos comerciales empiezan a las 5 a.m. en las propiedades del corredor corporativo para que el corte, bordeado y limpieza de nieve estén listos antes de que lleguen los inquilinos. Los eventos de nieve son 24/7.',
        },
      },
      {
        q: {
          en: 'Do you carry the insurance limits Lisle commercial property managers require?',
          es: '[TBR] ¿Tienen los límites de seguro que exigen los administradores comerciales de Lisle?',
        },
        a: {
          en: "Yes. We carry a $2M general liability policy, workers' comp on every employee, and we list any property manager as Additional Insured on request. Certs are available within 24 hours.",
          es: '[TBR] Sí. Tenemos una póliza de responsabilidad general de $2M, compensación laboral en cada empleado, y agregamos a cualquier administrador como Asegurado Adicional bajo solicitud. Los certificados se entregan en 24 horas.',
        },
      },
    ],
    meta: {
      title: {
        en: 'Lisle, IL Landscaping & Hardscape | Sunset Services',
        es: 'Paisajismo y Hardscape en Lisle, IL | Sunset Services',
      },
      description: {
        en: 'Family-run landscaping and hardscape in Lisle, IL since 2000. Commercial maintenance, snow removal, turf management. Free estimates within 5 days.',
        es: '[TBR] Paisajismo y hardscape familiar en Lisle, IL desde el año 2000. Mantenimiento comercial, nieve, césped. Presupuestos gratuitos en 5 días.',
      },
    },
  },
  {
    slug: 'bolingbrook',
    name: 'Bolingbrook',
    state: 'IL',
    geo: {lat: 41.6986, lng: -88.0684},
    pin: {x: 402, y: 370},
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
      {slug: 'landscape-maintenance', audience: 'commercial'},
      {slug: 'snow-removal', audience: 'commercial'},
      {slug: 'property-enhancement', audience: 'commercial'},
      {slug: 'lawn-care', audience: 'residential'},
      {slug: 'landscape-design', audience: 'residential'},
      {slug: 'snow-removal', audience: 'residential'},
    ],
    whyLocal: {
      en: "Bolingbrook is a mix — newer subdivisions, an established commercial spine along Boughton Road, and a stretch of multifamily that needs reliable mowing every seven days from April through October. We've been running there since 2007. The crews know which retention ponds need quarterly weed control, which subdivision HOAs require Friday-only mowing, and which streets the village plows last in a heavy snow event. When you call (630) 946-9321, you get the same family-run team residential clients reach in Naperville and commercial property managers reach in Lisle. We're not a national chain with a Bolingbrook franchise; we're one crew based in Aurora that's been driving the I-355 corridor for nearly twenty years.",
      es: '[TBR] Bolingbrook es una mezcla — subdivisiones nuevas, una columna comercial establecida a lo largo de Boughton Road, y un tramo multifamiliar que necesita corte de césped confiable cada siete días de abril a octubre. Hemos estado trabajando allí desde 2007. Los equipos saben qué estanques de retención necesitan control de maleza trimestral, qué HOAs exigen corte solo los viernes, y qué calles el pueblo limpia al final en un evento de nieve fuerte.',
    },
    testimonials: [
      {
        quote: {
          en: "We hired three different landscapers in five years before Sunset. Two seasons in, no complaints, no missed visits, and the property looks better than the day we bought it.",
          es: '[TBR] Contratamos tres paisajistas distintos en cinco años antes de Sunset. Dos temporadas después, sin quejas, sin visitas perdidas, y la propiedad se ve mejor que el día que la compramos.',
        },
        attribution: {
          en: 'HOA Board, Hidden Lakes · Bolingbrook',
          es: '[TBR] Junta de HOA, Hidden Lakes · Bolingbrook',
        },
        rating: 5,
      },
    ],
    faq: [
      {
        q: {
          en: 'Do you charge a travel fee to Bolingbrook?',
          es: '[TBR] ¿Cobran una tarifa de viaje a Bolingbrook?',
        },
        a: {
          en: "No. Bolingbrook is in our regular service area; estimates are free and we don't add a mileage charge.",
          es: '[TBR] No. Bolingbrook está en nuestra área de servicio regular; los presupuestos son gratis y no cobramos por kilometraje.',
        },
      },
      {
        q: {
          en: 'How long has Sunset Services been in Bolingbrook?',
          es: '[TBR] ¿Cuánto tiempo lleva Sunset Services en Bolingbrook?',
        },
        a: {
          en: 'Since 2007. We picked up our first multifamily contract that year and have been on the I-355 corridor steadily ever since.',
          es: '[TBR] Desde 2007. Tomamos nuestro primer contrato multifamiliar ese año y hemos estado en el corredor de la I-355 de forma constante desde entonces.',
        },
      },
      {
        q: {
          en: 'Do you handle Bolingbrook HOA mowing schedules and reporting?',
          es: '[TBR] ¿Manejan los horarios de corte y reportes de HOA en Bolingbrook?',
        },
        a: {
          en: "Yes. We follow each HOA's required mow day, post-visit photo report, and quarterly walkthrough cadence — the back office handles the paperwork, you don't.",
          es: '[TBR] Sí. Seguimos el día de corte requerido por cada HOA, los reportes con fotos después de cada visita, y la cadencia trimestral de revisión — la oficina maneja el papeleo, tú no.',
        },
      },
      {
        q: {
          en: 'Do you cover snow removal for Bolingbrook commercial properties?',
          es: '[TBR] ¿Cubren la remoción de nieve para propiedades comerciales en Bolingbrook?',
        },
        a: {
          en: "Yes. Bolingbrook is on our snow rotation; commercial properties get plow-and-salt at every 2-inch trigger, and our 24/7 dispatch is the same number you call for an estimate.",
          es: '[TBR] Sí. Bolingbrook está en nuestra rotación de nieve; las propiedades comerciales reciben palada y sal en cada disparador de 2 pulgadas, y nuestro despacho 24/7 es el mismo número al que llamas para un presupuesto.',
        },
      },
    ],
    meta: {
      title: {
        en: 'Bolingbrook, IL Landscaping & Hardscape | Sunset Services',
        es: 'Paisajismo y Hardscape en Bolingbrook, IL | Sunset Services',
      },
      description: {
        en: 'Family-run landscaping and hardscape in Bolingbrook, IL since 2000. Commercial maintenance, snow removal, property enhancement. Free estimates within 7 days.',
        es: '[TBR] Paisajismo y hardscape familiar en Bolingbrook, IL desde el año 2000. Mantenimiento comercial, nieve, mejoras. Presupuestos gratuitos en 7 días.',
      },
    },
  },
];

export const LOCATION_SLUGS: readonly LocationCitySlug[] = [
  'aurora',
  'naperville',
  'batavia',
  'wheaton',
  'lisle',
  'bolingbrook',
] as const;

export function getLocation(slug: string): LocationCity | undefined {
  return LOCATIONS.find((l) => l.slug === slug);
}

export function isLocationSlug(slug: string): slug is LocationCitySlug {
  return (LOCATION_SLUGS as readonly string[]).includes(slug);
}

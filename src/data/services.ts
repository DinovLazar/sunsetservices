/**
 * Per-service content seed for Sunset Services audience-landing and
 * service-detail pages (Phase 1.09 + 1.10).
 *
 * Source of truth: Phase 1.08 design handover §4.10. Every per-service
 * string lives here (D8). Page-chrome strings — section eyebrows, H2s,
 * CTA copy — live in `src/messages/{locale}.json` under
 * `audience.{slug}.*` and `servicePage.*` namespaces.
 *
 * `pricing.mode` defaults to `'explainer'` for all 16 services in Part 1
 * (D5 ratified). Erick toggles to `'price'` per service in Part 2 by
 * editing this file; State A and State B occupy the same vertical
 * footprint per §4.5 to keep alternation invariant.
 *
 * Final Spanish marketing copy is Erick's pass in Part 2.
 */

export type Audience = 'residential' | 'commercial' | 'hardscape';

/**
 * Phase M.01d — site division. Replaces audience as the primary IA grouping.
 * `audience` stays as an optional secondary tag on existing services for
 * backwards-compat through M.01d; M.01e retires it when /residential/* and
 * /commercial/* landings are deleted and replaced with /landscape/* etc.
 */
export type Division =
  | 'landscape'
  | 'hardscape'
  | 'waterproofing'
  | 'snow-removal'
  | 'trenchless';

export type Localized = {en: string; es: string};

export type WhatsIncludedItem = {
  headline: Localized;
  description: Localized;
  /** lucide-react icon name (PascalCase). Rendered with stroke 1.75. */
  icon: string;
};

export type ProcessStep = {
  headline: Localized;
  description: Localized;
};

export type WhyUsItem = {
  headline: Localized;
  description: Localized;
  /** lucide-react icon name (PascalCase). Rendered with stroke 1.75. */
  icon: string;
};

export type PricingFactor = {
  name: Localized;
  body: Localized;
};

export type Pricing =
  | {mode: 'explainer'; explainerFactors: PricingFactor[]}
  | {mode: 'price'; startingAt: number; includes: Localized};

export type ServiceProject = {
  title: Localized;
  meta: Localized;
  /** Image-asset key under `src/assets/service/projects/{key}.jpg`. */
  imageKey: string;
};

export type Service = {
  slug: string;
  /**
   * Phase M.01d — division replaces audience as the primary IA grouping.
   * Required on every service.
   */
  division: Division;
  /**
   * Phase M.01d — now optional. Existing services keep their audience tag
   * through M.01d so the 6 audience landings + 16 audience-aware service
   * detail URLs (/residential/<slug>/, /commercial/<slug>/, /hardscape/<slug>/)
   * keep resolving. New Waterproofing + Snow Removal services omit it.
   * M.01e drops the field entirely when those landings are deleted.
   */
  audience?: Audience;
  /** lucide-react icon for the eyebrow / Why-us tile (PascalCase). */
  icon: string;
  name: Localized;
  /**
   * Optional asset-lookup key, used when two services share a URL slug across
   * audiences (e.g., residential + commercial both at slug `snow-removal`).
   * Defaults to `slug` when omitted. Asset files in `src/assets/service/`
   * and entries in `src/data/imageMap.ts` use this key, decoupling URL slug
   * from physical asset identity.
   */
  imageKey?: string;
  /**
   * Phase B-14 — optional descriptive alt text for the service's hero + tile
   * photo. Set only for services on a real (stock-bridge) photo whose subject
   * differs from the service name; the hero and tile grids fall back to
   * `name` when this is absent, so every other service is unchanged. EN is
   * authoritative in `docs/stock-bridge/stock-image-manifest.md`; ES is a
   * drafted translation pending native review (TRANSLATION_NOTES §B-14).
   */
  photoAlt?: Localized;
  hero: {
    h1: Localized;
    subhead: Localized;
    /** Photo slot identifier — Phase 2.04 swaps to real photography. */
    photoSlot: string;
  };
  whatsIncluded: WhatsIncludedItem[];
  process: ProcessStep[];
  whyUs: WhyUsItem[];
  pricing: Pricing;
  /** 2–3 placeholder projects for the service-detail featured-projects band. */
  projects: ServiceProject[];
  /** Slugs of related services (3–4). D7: residential + commercial within-audience; hardscape cross-sell. */
  related: string[];
  /** Tag value used by /projects/?service={tag} routes (404s in Part 1). */
  projectsTag: string;
};

/** Reusable factor block for State B (explainer) pricing — each service can override. */
const GENERIC_FACTORS: PricingFactor[] = [
  {
    name: {en: 'Property size', es: 'Tamaño de la propiedad'},
    body: {
      en: 'Square footage of turf, beds, and hardscape we touch.',
      es: 'Metros cuadrados de césped, arriates y hardscape que tocamos.',
    },
  },
  {
    name: {en: 'Service frequency', es: 'Frecuencia del servicio'},
    body: {
      en: 'One-time, weekly, every-other-week, or seasonal.',
      es: 'Una vez, semanal, cada dos semanas o de temporada.',
    },
  },
  {
    name: {en: 'Add-ons', es: 'Servicios adicionales'},
    body: {
      en: 'Aeration, overseeding, cleanup, and similar extras.',
      es: 'Aireación, resiembra, limpieza y extras similares.',
    },
  },
];

/**
 * Pricing factors for hardscape services (Phase M.14, Goran QA B-09 §3.9).
 * The hardscape service pages previously reused `GENERIC_FACTORS`, whose
 * lawn-care language (service frequency, aeration, overseeding) was wrong
 * for one-time hardscape builds. These factors describe how a hardscape
 * project is actually priced: square footage, materials/base prep, and
 * site access / structural add-ons.
 */
const HARDSCAPE_FACTORS: PricingFactor[] = [
  {
    name: {en: 'Square footage & layout', es: 'Metros cuadrados y trazado'},
    body: {
      en: 'Size of the patio, walk, or driveway and how complex the layout is.',
      es: 'Tamaño del patio, sendero o entrada y qué tan complejo es el trazado.',
    },
  },
  {
    name: {en: 'Materials & base prep', es: 'Materiales y preparación de base'},
    body: {
      en: 'Paver line, stone, and the engineered base built for freeze/thaw.',
      es: 'Línea de adoquín, piedra y la base de ingeniería para congelamiento/deshielo.',
    },
  },
  {
    name: {en: 'Site access & structures', es: 'Acceso al sitio y estructuras'},
    body: {
      en: 'Machine access, grading, and any walls, steps, or drainage in scope.',
      es: 'Acceso de maquinaria, nivelación y muros, escalones o drenaje incluidos.',
    },
  },
];

/**
 * Pricing factors for trenchless / directional-boring services (Phase B.12).
 * Trenchless work is NOT priced like lawn care — `GENERIC_FACTORS`' service
 * frequency / aeration / overseeding language is wrong for a bore or utility
 * run (the same B-09 §3.9 defect `HARDSCAPE_FACTORS` was created to fix).
 * These factors describe how a bore/utility job is actually priced: run
 * length + depth + ground conditions, pipe diameter & material, and site
 * access + utility locating + surface restoration. Kept to three so the
 * shared `servicePage.pricing.explainer.lead` ("depends on three things")
 * copy stays accurate.
 */
const TRENCHLESS_FACTORS: PricingFactor[] = [
  {
    name: {en: 'Run length, depth & ground', es: 'Longitud, profundidad y terreno'},
    body: {
      en: 'Linear feet of the bore or trench, the required depth, and the soil, rock, and water-table conditions that decide which method fits.',
      es: 'Metros lineales del bore o la zanja, la profundidad requerida y las condiciones de suelo, roca y nivel freático que deciden qué método aplica.',
    },
  },
  {
    name: {en: 'Pipe diameter & material', es: 'Diámetro y material de tubería'},
    body: {
      en: 'Conduit or pipe size, the material (PVC, HDPE, clay), how many runs go in, and whether joints are fused or coupled.',
      es: 'Tamaño del conducto o tubería, el material (PVC, HDPE, arcilla), cuántos tramos se instalan y si las uniones son fusionadas o acopladas.',
    },
  },
  {
    name: {en: 'Site access, locating & restoration', es: 'Acceso, localización y restauración'},
    body: {
      en: 'Entry and exit pit access around driveways and landscaping, utility locating (811) and potholing before we dig, and surface restoration after.',
      es: 'Acceso para los pozos de entrada y salida entre entradas y jardinería, localización de servicios (811) y sondeo antes de excavar, y restauración de la superficie al terminar.',
    },
  },
];

export const SERVICES: Service[] = [
  // -------------------- RESIDENTIAL (6) --------------------
  {
    slug: 'lawn-care',
    division: 'landscape',
    audience: 'residential',
    icon: 'Scissors',
    name: {en: 'Lawn Care', es: 'Cuidado de Césped'},
    hero: {
      h1: {
        en: 'Lawn Care in Aurora & DuPage County.',
        es: 'Cuidado de Césped en Aurora y DuPage.',
      },
      subhead: {
        en: 'Mowing, edging, fertilization, and weed control on a weekly schedule. Same crew, same day, every week — April through November.',
        es: 'Corte, bordeado, fertilización y control de maleza en horario semanal. Mismo equipo, mismo día, todas las semanas — de abril a noviembre.',
      },
      photoSlot: 'service.lawn-care.16x9',
    },
    whatsIncluded: [
      {
        headline: {en: 'Mowing & edging', es: 'Corte y bordeado'},
        description: {
          en: 'Cut to height-best 3.5". Hard edges along beds and walks.',
          es: 'Corte a la altura óptima de 3.5". Bordes definidos en arriates y senderos.',
        },
        icon: 'Scissors',
      },
      {
        headline: {en: 'Fertilization', es: 'Fertilización'},
        description: {
          en: '5-step program with slow-release nitrogen, soil-tested seasonally.',
          es: 'Programa de 5 pasos con nitrógeno de liberación lenta, con análisis de suelo cada temporada.',
        },
        icon: 'Sprout',
      },
      {
        headline: {en: 'Weed & pest control', es: 'Maleza y plagas'},
        description: {
          en: 'Pre-emergent in spring. Spot treatments as needed through the season.',
          es: 'Pre-emergente en primavera. Tratamientos puntuales según se necesite.',
        },
        icon: 'Leaf',
      },
      {
        headline: {en: 'Aeration & overseeding', es: 'Aireación y resiembra'},
        description: {
          en: 'Once per fall — relieves compaction and fills bare patches.',
          es: 'Una vez en otoño — alivia compactación y rellena áreas pelonas.',
        },
        icon: 'Wind',
      },
      {
        headline: {en: 'Cleanup before we leave', es: 'Limpieza antes de irnos'},
        description: {
          en: 'Drives and walks blown clean. Trash carried off-site.',
          es: 'Entradas y senderos soplados. Basura retirada del sitio.',
        },
        icon: 'Sparkles',
      },
    ],
    process: [
      {
        headline: {en: 'Free site visit', es: 'Visita gratis al sitio'},
        description: {
          en: 'We meet you on-site, walk the space, and listen.',
          es: 'Te visitamos, recorremos el espacio y escuchamos.',
        },
      },
      {
        headline: {en: 'Custom estimate', es: 'Presupuesto personalizado'},
        description: {
          en: 'Itemized within 48 hours. No high-pressure sales.',
          es: 'Detallado en 48 horas. Sin presiones de venta.',
        },
      },
      {
        headline: {en: 'Schedule the work', es: 'Agendamos el trabajo'},
        description: {
          en: 'Locked-in start date. Same crew throughout the season.',
          es: 'Fecha de inicio fija. Mismo equipo toda la temporada.',
        },
      },
      {
        headline: {en: 'Service guarantee', es: 'Garantía de servicio'},
        description: {
          en: 'If we miss something, we come back inside 24 hours.',
          es: 'Si fallamos algo, volvemos dentro de 24 horas.',
        },
      },
    ],
    whyUs: [
      {
        headline: {en: 'Same crew, every visit', es: 'Mismo equipo, cada visita'},
        description: {
          en: "Your Tuesday lead doesn't change mid-season.",
          es: 'Tu líder de los martes no cambia a media temporada.',
        },
        icon: 'Users',
      },
      {
        headline: {en: 'Bilingual lead', es: 'Líder bilingüe'},
        description: {
          en: 'Note in EN or ES; we handle the rest.',
          es: 'Avísanos en inglés o español; nosotros nos encargamos.',
        },
        icon: 'Languages',
      },
      {
        headline: {en: '24-hr service guarantee', es: 'Garantía de 24 horas'},
        description: {
          en: 'If we miss a spot, we come back inside 24 hours.',
          es: 'Si fallamos un punto, regresamos en 24 horas.',
        },
        icon: 'BadgeCheck',
      },
    ],
    pricing: {
      mode: 'explainer',
      explainerFactors: [
        {
          name: {en: 'Lot size', es: 'Tamaño del lote'},
          body: {
            en: 'Square footage of turf and bed line.',
            es: 'Metros cuadrados de césped y línea de arriate.',
          },
        },
        {
          name: {en: 'Service frequency', es: 'Frecuencia del servicio'},
          body: {
            en: 'Weekly vs every-other-week, season-long contracts.',
            es: 'Semanal vs cada dos semanas, contrato de temporada.',
          },
        },
        {
          name: {en: 'Add-ons', es: 'Servicios adicionales'},
          body: {
            en: 'Aeration, overseeding, spring + fall cleanup.',
            es: 'Aireación, resiembra, limpieza de primavera y otoño.',
          },
        },
      ],
    },
    projects: [
      {
        title: {en: 'Naperville HOA, lawn refresh', es: 'HOA en Naperville, renovación de césped'},
        meta: {en: 'Naperville · 2024 · 12,000 sqft', es: 'Naperville · 2024 · 12,000 ft²'},
        imageKey: 'lawn-care-1',
      },
      {
        title: {en: 'Wheaton estate', es: 'Finca en Wheaton'},
        meta: {en: 'Wheaton · 2024', es: 'Wheaton · 2024'},
        imageKey: 'lawn-care-2',
      },
    ],
    related: ['landscape-design', 'sprinkler-systems', 'driveway-snow-removal', 'seasonal-cleanup'],
    projectsTag: 'lawn-care',
  },

  {
    slug: 'landscape-design',
    division: 'landscape',
    audience: 'residential',
    icon: 'PencilRuler',
    name: {en: 'Landscape Design', es: 'Diseño de Paisaje'},
    hero: {
      h1: {
        en: 'Landscape Design in DuPage County.',
        es: 'Diseño de Paisaje en DuPage County.',
      },
      subhead: {
        en: 'Custom plans for full-yard transformations. We listen first, render second, and build third — coordinated with hardscape under one project lead.',
        es: 'Planes personalizados para transformar todo el jardín. Primero escuchamos, luego diseñamos y construimos — coordinado con hardscape bajo un solo líder de proyecto.',
      },
      photoSlot: 'service.landscape-design.16x9',
    },
    whatsIncluded: [
      {
        headline: {en: 'Site walk + listening', es: 'Visita y escucha'},
        description: {
          en: 'On-site session: who lives here, what stays, what frustrates you.',
          es: 'Visita en el sitio: quién vive aquí, qué se queda, qué te frustra.',
        },
        icon: 'MessageCircle',
      },
      {
        headline: {en: 'Concept renderings', es: 'Bocetos conceptuales'},
        description: {
          en: 'Two design directions in scaled rendering — pick or remix.',
          es: 'Dos direcciones de diseño en escala — eliges o combinas.',
        },
        icon: 'PencilRuler',
      },
      {
        headline: {en: 'Plant + materials list', es: 'Lista de plantas y materiales'},
        description: {
          en: 'Itemized: species, sizes, sources, hardscape spec.',
          es: 'Detallado: especies, tamaños, proveedores, hardscape.',
        },
        icon: 'ClipboardList',
      },
      {
        headline: {en: 'Phased build option', es: 'Construcción por fases'},
        description: {
          en: 'Spread the project across multiple seasons if budget calls.',
          es: 'Distribuye el proyecto en varias temporadas si lo requiere el presupuesto.',
        },
        icon: 'CalendarRange',
      },
      {
        headline: {en: 'Coordination with hardscape', es: 'Coordinación con hardscape'},
        description: {
          en: 'One project lead for plantings, paths, walls, and lighting.',
          es: 'Un solo líder para plantas, senderos, muros e iluminación.',
        },
        icon: 'Workflow',
      },
      {
        headline: {en: 'Aftercare plan', es: 'Plan de cuidado posterior'},
        description: {
          en: 'Year-one establishment care, watering, and pruning schedule.',
          es: 'Plan de cuidado del primer año, riego y poda.',
        },
        icon: 'Sprout',
      },
    ],
    process: [
      {
        headline: {en: 'Discovery', es: 'Descubrimiento'},
        description: {
          en: 'Site walk, listening session, and a budget conversation.',
          es: 'Visita, sesión de escucha y conversación de presupuesto.',
        },
      },
      {
        headline: {en: 'Concept', es: 'Concepto'},
        description: {
          en: 'Two scaled directions delivered as renderings.',
          es: 'Dos direcciones a escala como bocetos.',
        },
      },
      {
        headline: {en: 'Detailed plan', es: 'Plan detallado'},
        description: {
          en: 'Plant list, materials, hardscape spec, phased budget.',
          es: 'Lista de plantas, materiales, hardscape, presupuesto por fases.',
        },
      },
      {
        headline: {en: 'Build', es: 'Construcción'},
        description: {
          en: 'Same crew, single lead, locked-in start.',
          es: 'Mismo equipo, un solo líder, inicio fijo.',
        },
      },
      {
        headline: {en: 'Aftercare', es: 'Cuidado posterior'},
        description: {
          en: 'Year-one walks, watering plan, replacement guarantees.',
          es: 'Visitas del primer año, riego, garantías de reemplazo.',
        },
      },
    ],
    whyUs: [
      {
        headline: {en: 'In-house design + build', es: 'Diseño y construcción internos'},
        description: {
          en: 'No subcontracted handoffs between designer and crew.',
          es: 'Sin transferencias entre diseñador y equipo subcontratado.',
        },
        icon: 'Workflow',
      },
      {
        headline: {en: '25-yr local experience', es: '25 años de experiencia local'},
        description: {
          en: 'We know what survives the DuPage clay-loam.',
          es: 'Sabemos qué sobrevive el suelo arcilloso de DuPage.',
        },
        icon: 'Award',
      },
      {
        headline: {en: 'Bilingual handoff', es: 'Entrega bilingüe'},
        description: {
          en: 'Designer + crew lead both speak EN and ES.',
          es: 'Diseñador y líder de equipo hablan inglés y español.',
        },
        icon: 'Languages',
      },
    ],
    pricing: {mode: 'explainer', explainerFactors: GENERIC_FACTORS},
    projects: [
      {
        title: {en: 'Naperville full-yard refresh', es: 'Renovación total en Naperville'},
        meta: {en: 'Naperville · 2024', es: 'Naperville · 2024'},
        imageKey: 'landscape-design-1',
      },
      {
        title: {en: 'Wheaton garden plan', es: 'Plan de jardín en Wheaton'},
        meta: {en: 'Wheaton · 2024', es: 'Wheaton · 2024'},
        imageKey: 'landscape-design-2',
      },
      {
        title: {en: 'Aurora curated entry', es: 'Entrada curada en Aurora'},
        meta: {en: 'Aurora · 2024', es: 'Aurora · 2024'},
        imageKey: 'landscape-design-3',
      },
    ],
    related: ['lawn-care', 'tree-services', 'sprinkler-systems', 'seasonal-cleanup'],
    projectsTag: 'landscape-design',
  },

  {
    slug: 'tree-services',
    division: 'landscape',
    audience: 'residential',
    icon: 'Trees',
    name: {en: 'Tree Services', es: 'Servicios de Árboles'},
    hero: {
      h1: {
        en: 'Tree Services in Aurora & DuPage.',
        es: 'Servicios de Árboles en Aurora y DuPage.',
      },
      subhead: {
        en: 'ISA-trained pruning, removal, stump grinding, and same-day storm response. Insured up to $2M for residential properties.',
        es: 'Poda con entrenamiento ISA, remoción, trituración de tocones y respuesta el mismo día tras tormentas. Asegurados hasta $2M para propiedades residenciales.',
      },
      photoSlot: 'service.tree-services.16x9',
    },
    whatsIncluded: [
      {
        headline: {en: 'Pruning', es: 'Poda'},
        description: {
          en: 'Structural and aesthetic pruning per ISA best-practice standards.',
          es: 'Poda estructural y estética según estándares ISA.',
        },
        icon: 'Trees',
      },
      {
        headline: {en: 'Removal', es: 'Remoción'},
        description: {
          en: 'Sectional takedowns near structures; whole-tree drops in open yards.',
          es: 'Remoción seccionada cerca de estructuras; árboles completos en terrenos abiertos.',
        },
        icon: 'Axe',
      },
      {
        headline: {en: 'Stump grinding', es: 'Trituración de tocones'},
        description: {
          en: 'Ground 6"–8" below grade. Chips left or hauled per your call.',
          es: 'Triturado a 6–8 pulgadas bajo el nivel. Astillas se quedan o se llevan según prefieras.',
        },
        icon: 'Disc',
      },
      {
        headline: {en: 'Storm response', es: 'Respuesta a tormentas'},
        description: {
          en: 'Same-day for fallen-tree emergencies in DuPage County.',
          es: 'Mismo día para emergencias de árbol caído en DuPage.',
        },
        icon: 'Zap',
      },
    ],
    process: [
      {
        headline: {en: 'Inspection', es: 'Inspección'},
        description: {
          en: 'Site visit and tree-by-tree assessment with the ISA-trained lead.',
          es: 'Visita y evaluación árbol por árbol con líder ISA.',
        },
      },
      {
        headline: {en: 'Estimate', es: 'Presupuesto'},
        description: {
          en: 'Itemized within 48 hours. Insurance certificates on request.',
          es: 'Detallado en 48 horas. Certificados de seguro a pedido.',
        },
      },
      {
        headline: {en: 'Schedule', es: 'Agendado'},
        description: {
          en: 'Locked start date. Storm response moves to head of queue.',
          es: 'Fecha fija. Las emergencias de tormenta saltan al frente.',
        },
      },
      {
        headline: {en: 'Cleanup', es: 'Limpieza'},
        description: {
          en: 'Brush hauled. Driveways and walks blown clean before we leave.',
          es: 'Ramas retiradas. Entradas y senderos soplados antes de irnos.',
        },
      },
    ],
    whyUs: [
      {
        headline: {en: 'Insured up to $2M', es: 'Asegurados hasta $2M'},
        description: {
          en: 'Coverage you can ask for in writing before we cut.',
          es: 'Cobertura por escrito antes del primer corte.',
        },
        icon: 'ShieldCheck',
      },
      {
        headline: {en: 'ISA-trained lead', es: 'Líder con entrenamiento ISA'},
        description: {
          en: 'Pruning to industry standard, not by feel.',
          es: 'Poda al estándar de la industria, no por intuición.',
        },
        icon: 'Award',
      },
      {
        headline: {en: 'Same-day storm response', es: 'Respuesta el mismo día tras tormenta'},
        description: {
          en: 'Emergency dispatch within 4 hours after a storm passes.',
          es: 'Despacho de emergencia en 4 horas tras pasar la tormenta.',
        },
        icon: 'Zap',
      },
    ],
    pricing: {mode: 'explainer', explainerFactors: GENERIC_FACTORS},
    projects: [
      {
        title: {en: 'Naperville oak takedown', es: 'Remoción de roble en Naperville'},
        meta: {en: 'Naperville · 2024', es: 'Naperville · 2024'},
        imageKey: 'tree-services-1',
      },
      {
        title: {en: 'Aurora storm cleanup', es: 'Limpieza tras tormenta en Aurora'},
        meta: {en: 'Aurora · 2024', es: 'Aurora · 2024'},
        imageKey: 'tree-services-2',
      },
    ],
    related: ['lawn-care', 'landscape-design', 'seasonal-cleanup'],
    projectsTag: 'tree-services',
  },

  {
    slug: 'sprinkler-systems',
    division: 'landscape',
    audience: 'residential',
    icon: 'Droplets',
    name: {en: 'Sprinkler Systems', es: 'Sistemas de Riego'},
    hero: {
      h1: {
        en: 'Sprinkler Systems in DuPage County.',
        es: 'Sistemas de Riego en DuPage County.',
      },
      subhead: {
        en: 'Install, repair, and winterize. Licensed irrigators, smart-controller upgrades, and a 5-year workmanship warranty on new systems.',
        es: 'Instalación, reparación y preparación para invierno. Irrigadores con licencia, actualizaciones a controles inteligentes y 5 años de garantía de mano de obra en sistemas nuevos.',
      },
      photoSlot: 'service.sprinkler-systems.16x9',
    },
    whatsIncluded: [
      {
        headline: {en: 'New install', es: 'Instalación nueva'},
        description: {
          en: 'Zone design, head selection, low-impact trenching.',
          es: 'Diseño por zonas, selección de cabezales, zanjeo de bajo impacto.',
        },
        icon: 'Droplets',
      },
      {
        headline: {en: 'Repair + audit', es: 'Reparación y auditoría'},
        description: {
          en: 'Pressure check, head replacement, leak detection.',
          es: 'Revisión de presión, reemplazo de cabezales, detección de fugas.',
        },
        icon: 'Wrench',
      },
      {
        headline: {en: 'Smart-controller upgrade', es: 'Actualización a control inteligente'},
        description: {
          en: 'Wi-Fi controllers with weather-aware scheduling.',
          es: 'Controles Wi-Fi con horario sensible al clima.',
        },
        icon: 'Wifi',
      },
      {
        headline: {en: 'Spring start-up', es: 'Arranque de primavera'},
        description: {
          en: 'Pressurize, test, recalibrate every zone.',
          es: 'Presurizar, probar y recalibrar cada zona.',
        },
        icon: 'Sun',
      },
      {
        headline: {en: 'Winterization', es: 'Preparación para invierno'},
        description: {
          en: 'Compressed-air blowout — ensures no freeze damage.',
          es: 'Soplado con aire comprimido — sin daños por congelamiento.',
        },
        icon: 'Snowflake',
      },
    ],
    process: [
      {
        headline: {en: 'Site assessment', es: 'Evaluación del sitio'},
        description: {
          en: 'Map zones, water source, head spacing, slopes.',
          es: 'Mapeo de zonas, fuente de agua, espaciado de cabezales, pendientes.',
        },
      },
      {
        headline: {en: 'Quote', es: 'Cotización'},
        description: {
          en: 'Itemized within 48 hours including controller options.',
          es: 'Detallada en 48 horas con opciones de control.',
        },
      },
      {
        headline: {en: 'Install', es: 'Instalación'},
        description: {
          en: 'Trench, pipe, head install, controller wire-up.',
          es: 'Zanjeo, tubería, instalación de cabezales, cableado del control.',
        },
      },
      {
        headline: {en: 'Walkthrough', es: 'Recorrido'},
        description: {
          en: 'On-site walkthrough of every zone and the controller app.',
          es: 'Recorrido de cada zona y la app del control.',
        },
      },
    ],
    whyUs: [
      {
        headline: {en: 'Licensed irrigators', es: 'Irrigadores con licencia'},
        description: {
          en: 'IL-licensed plumbers on every install.',
          es: 'Plomeros con licencia de Illinois en cada instalación.',
        },
        icon: 'BadgeCheck',
      },
      {
        headline: {en: 'Same-week winterization', es: 'Preparación de invierno la misma semana'},
        description: {
          en: 'Schedule by Wednesday for service that week.',
          es: 'Agenda para el miércoles y servicio esa semana.',
        },
        icon: 'Snowflake',
      },
      {
        headline: {en: '5-yr workmanship warranty', es: '5 años de garantía de mano de obra'},
        description: {
          en: 'Workmanship covered five years on new systems.',
          es: 'Mano de obra cubierta cinco años en sistemas nuevos.',
        },
        icon: 'ShieldCheck',
      },
    ],
    pricing: {mode: 'explainer', explainerFactors: GENERIC_FACTORS},
    projects: [
      {
        title: {en: 'Aurora 8-zone install', es: 'Instalación de 8 zonas en Aurora'},
        meta: {en: 'Aurora · 2024', es: 'Aurora · 2024'},
        imageKey: 'sprinkler-systems-1',
      },
      {
        title: {en: 'Wheaton smart upgrade', es: 'Mejora inteligente en Wheaton'},
        meta: {en: 'Wheaton · 2024', es: 'Wheaton · 2024'},
        imageKey: 'sprinkler-systems-2',
      },
    ],
    related: ['lawn-care', 'landscape-design', 'seasonal-cleanup'],
    projectsTag: 'sprinkler-systems',
  },

  // Phase M.01e — residential `snow-removal` retired. Content merged into
  // `driveway-snow-removal`. Old URL `/residential/snow-removal/` 301-redirects
  // to `/snow-removal/driveway-snow-removal/` (see next.config.ts).

  {
    slug: 'seasonal-cleanup',
    division: 'landscape',
    audience: 'residential',
    icon: 'Leaf',
    name: {en: 'Seasonal Cleanup', es: 'Limpieza de Temporada'},
    hero: {
      h1: {
        en: 'Spring & Fall Cleanup in DuPage.',
        es: 'Limpieza de Primavera y Otoño en DuPage.',
      },
      subhead: {
        en: 'Two-pass leaf system, bed cleanup, pruning, mulching, and same-day haul-off. Free estimates and a clean property by sundown.',
        es: 'Sistema de hojas en dos pasadas, limpieza de arriates, poda, mantillo y retiro el mismo día. Presupuestos gratis y propiedad limpia al atardecer.',
      },
      photoSlot: 'service.seasonal-cleanup.16x9',
    },
    whatsIncluded: [
      {
        headline: {en: 'Leaf removal', es: 'Remoción de hojas'},
        description: {
          en: 'Two-pass system: vacuum sweep, then hand finish.',
          es: 'Sistema de dos pasadas: aspirado y luego acabado a mano.',
        },
        icon: 'Leaf',
      },
      {
        headline: {en: 'Bed cleanup', es: 'Limpieza de arriates'},
        description: {
          en: 'Cut back perennials, edge bed lines, remove debris.',
          es: 'Podar perennes, definir bordes, retirar escombros.',
        },
        icon: 'Sprout',
      },
      {
        headline: {en: 'Pruning', es: 'Poda'},
        description: {
          en: 'Shrubs and ornamentals shaped per species best practice.',
          es: 'Arbustos y ornamentales podados según especie.',
        },
        icon: 'Scissors',
      },
      {
        headline: {en: 'Mulching', es: 'Mantillo'},
        description: {
          en: 'Premium hardwood mulch refresh, 2–3 inches.',
          es: 'Mantillo de madera dura premium, 2–3 pulgadas.',
        },
        icon: 'Layers',
      },
      {
        headline: {en: 'Hauling', es: 'Retiro'},
        description: {
          en: 'All debris off-site same day. No piles left behind.',
          es: 'Todo retirado el mismo día. Sin pilas pendientes.',
        },
        icon: 'Truck',
      },
    ],
    process: [
      {
        headline: {en: 'Estimate', es: 'Presupuesto'},
        description: {
          en: 'Walk-through and itemized quote within 48 hours.',
          es: 'Recorrido y cotización detallada en 48 horas.',
        },
      },
      {
        headline: {en: 'Schedule', es: 'Agendar'},
        description: {
          en: 'Locked-in date in spring (Apr–May) or fall (Oct–Nov).',
          es: 'Fecha fija en primavera (abr–may) u otoño (oct–nov).',
        },
      },
      {
        headline: {en: 'Service', es: 'Servicio'},
        description: {
          en: 'Full-property cleanup completed in one visit.',
          es: 'Limpieza completa en una sola visita.',
        },
      },
      {
        headline: {en: 'Walkthrough', es: 'Recorrido final'},
        description: {
          en: 'Property walk before we leave; nothing missed.',
          es: 'Recorrido antes de irnos; nada se queda atrás.',
        },
      },
    ],
    whyUs: [
      {
        headline: {en: 'Two-pass leaf system', es: 'Sistema de dos pasadas'},
        description: {
          en: 'Vacuum sweep then hand finish — no wind-blown leftovers.',
          es: 'Aspirado y acabado a mano — sin restos por el viento.',
        },
        icon: 'Leaf',
      },
      {
        headline: {en: 'Same-day haul-off', es: 'Retiro el mismo día'},
        description: {
          en: 'Property is clean before sundown.',
          es: 'Propiedad limpia antes del atardecer.',
        },
        icon: 'Truck',
      },
      {
        headline: {en: 'Free estimate', es: 'Presupuesto gratis'},
        description: {
          en: 'Itemized within 48 hours, no obligation.',
          es: 'Detallado en 48 horas, sin compromiso.',
        },
        icon: 'BadgeCheck',
      },
    ],
    pricing: {mode: 'explainer', explainerFactors: GENERIC_FACTORS},
    projects: [
      {
        title: {en: 'Naperville fall cleanup', es: 'Limpieza otoñal en Naperville'},
        meta: {en: 'Naperville · 2024', es: 'Naperville · 2024'},
        imageKey: 'seasonal-cleanup-1',
      },
      {
        title: {en: 'Wheaton spring refresh', es: 'Renovación primaveral en Wheaton'},
        meta: {en: 'Wheaton · 2024', es: 'Wheaton · 2024'},
        imageKey: 'seasonal-cleanup-2',
      },
    ],
    related: ['lawn-care', 'tree-services', 'sprinkler-systems'],
    projectsTag: 'seasonal-cleanup',
  },

  // -------------------- COMMERCIAL (4) --------------------
  {
    slug: 'landscape-maintenance',
    division: 'landscape',
    audience: 'commercial',
    icon: 'Building2',
    name: {en: 'Landscape Maintenance', es: 'Mantenimiento de Paisaje'},
    hero: {
      h1: {
        en: 'Commercial Landscape Maintenance in DuPage County.',
        es: 'Mantenimiento Comercial de Paisaje en DuPage.',
      },
      subhead: {
        en: 'Mowing, bed care, pest and weed control, and quarterly walkthroughs for office parks, HOAs, and retail. COIs on file before day one.',
        es: 'Corte, cuidado de arriates, control de plagas y maleza, y revisiones trimestrales para oficinas, HOAs y comercio. COIs en archivo antes del primer día.',
      },
      photoSlot: 'service.landscape-maintenance.16x9',
    },
    whatsIncluded: [
      {
        headline: {en: 'Mowing + edging', es: 'Corte y bordeado'},
        description: {
          en: 'Weekly mow, hard edges, line-trimming around obstacles.',
          es: 'Corte semanal, bordes definidos, recorte cerca de obstáculos.',
        },
        icon: 'Scissors',
      },
      {
        headline: {en: 'Bed care', es: 'Cuidado de arriates'},
        description: {
          en: 'Mulch refresh, edging, weed control, perennials cared for.',
          es: 'Renovación de mantillo, bordes, maleza, perennes cuidados.',
        },
        icon: 'Sprout',
      },
      {
        headline: {en: 'Pest + weed', es: 'Plagas y maleza'},
        description: {
          en: 'Pre-emergent in spring, spot treatments through season.',
          es: 'Pre-emergente en primavera, tratamientos puntuales.',
        },
        icon: 'Leaf',
      },
      {
        headline: {en: 'Seasonal color', es: 'Color de temporada'},
        description: {
          en: 'Annual rotations at entries and visible planters.',
          es: 'Rotaciones anuales en entradas y maceteros visibles.',
        },
        icon: 'Flower',
      },
      {
        headline: {en: 'Cleanup', es: 'Limpieza'},
        description: {
          en: 'Drives blown clean every visit; debris hauled off-site.',
          es: 'Entradas sopladas cada visita; escombros retirados.',
        },
        icon: 'Truck',
      },
      {
        headline: {en: 'Quarterly walkthroughs', es: 'Revisiones trimestrales'},
        description: {
          en: 'Property manager walk every 90 days with action items.',
          es: 'Recorrido con el property manager cada 90 días con tareas.',
        },
        icon: 'ClipboardCheck',
      },
    ],
    process: [
      {
        headline: {en: 'Site assessment', es: 'Evaluación del sitio'},
        description: {
          en: 'Property walk and scope conversation with your manager.',
          es: 'Recorrido y conversación de alcance con tu manager.',
        },
      },
      {
        headline: {en: 'Proposal + COI', es: 'Propuesta y COI'},
        description: {
          en: 'Itemized proposal with COI attached before signing.',
          es: 'Propuesta detallada con COI antes de firmar.',
        },
      },
      {
        headline: {en: 'Onboarding', es: 'Integración'},
        description: {
          en: 'Crew lead introduction and after-hours contact card.',
          es: 'Presentación del líder y tarjeta de contacto fuera de horario.',
        },
      },
      {
        headline: {en: 'Service', es: 'Servicio'},
        description: {
          en: 'Same crew, locked schedule, predictable invoicing.',
          es: 'Mismo equipo, horario fijo, facturación predecible.',
        },
      },
      {
        headline: {en: 'Quarterly review', es: 'Revisión trimestral'},
        description: {
          en: '90-day walk with property manager, written action items.',
          es: 'Recorrido a 90 días con manager, tareas por escrito.',
        },
      },
    ],
    whyUs: [
      {
        headline: {en: 'Dedicated property manager', es: 'Property manager dedicado'},
        description: {
          en: 'Single point of contact, mobile + email, never a queue.',
          es: 'Un solo contacto, móvil y correo, nunca una cola.',
        },
        icon: 'UserCheck',
      },
      {
        headline: {en: 'COI on file before day 1', es: 'COI antes del primer día'},
        description: {
          en: 'Insurance certificate emailed during onboarding.',
          es: 'Certificado de seguro enviado durante la integración.',
        },
        icon: 'ShieldCheck',
      },
      {
        headline: {en: 'Uniformed crews', es: 'Equipos uniformados'},
        description: {
          en: 'Branded vehicles and uniforms — visible accountability.',
          es: 'Vehículos y uniformes con marca — responsabilidad visible.',
        },
        icon: 'Truck',
      },
    ],
    pricing: {mode: 'explainer', explainerFactors: GENERIC_FACTORS},
    projects: [
      {
        title: {en: 'Aurora corporate park', es: 'Parque corporativo en Aurora'},
        meta: {en: 'Aurora · 2024', es: 'Aurora · 2024'},
        imageKey: 'landscape-maintenance-1',
      },
      {
        title: {en: 'Naperville HOA', es: 'HOA en Naperville'},
        meta: {en: 'Naperville · 2024', es: 'Naperville · 2024'},
        imageKey: 'landscape-maintenance-2',
      },
    ],
    related: ['commercial-snow-plowing', 'property-enhancement', 'turf-management'],
    projectsTag: 'landscape-maintenance',
  },

  // Phase M.01e — commercial `snow-removal` retired. Content merged into
  // `commercial-snow-plowing` (which inherits the `commercial-snow-removal`
  // imageKey so the existing photo asset keeps rendering). Old URL
  // `/commercial/snow-removal/` 301-redirects to
  // `/snow-removal/commercial-snow-plowing/` (see next.config.ts).

  {
    slug: 'property-enhancement',
    division: 'landscape',
    audience: 'commercial',
    icon: 'Sparkles',
    name: {en: 'Property Enhancement', es: 'Mejora de Propiedades'},
    hero: {
      h1: {
        en: 'Property Enhancement for Commercial Sites.',
        es: 'Mejora de Propiedades para Sitios Comerciales.',
      },
      subhead: {
        en: 'Bed redesigns, annual color rotations, refreshed entries, seasonal lighting, and small hardscape repairs — coordinated under a single project lead.',
        es: 'Rediseños de arriates, color anual, entradas renovadas, iluminación de temporada y reparaciones menores de hardscape — bajo un solo líder.',
      },
      photoSlot: 'service.property-enhancement.16x9',
    },
    whatsIncluded: [
      {
        headline: {en: 'Bed redesign', es: 'Rediseño de arriates'},
        description: {
          en: 'Refresh tired plantings with designed alternatives.',
          es: 'Renovar plantaciones cansadas con alternativas diseñadas.',
        },
        icon: 'Sprout',
      },
      {
        headline: {en: 'Annual color', es: 'Color anual'},
        description: {
          en: 'Spring + summer + fall rotations at high-visibility entries.',
          es: 'Rotaciones de primavera, verano y otoño en entradas visibles.',
        },
        icon: 'Flower',
      },
      {
        headline: {en: 'Refreshed entries', es: 'Entradas renovadas'},
        description: {
          en: 'Updated planters, stone, lighting, and signage frames.',
          es: 'Maceteros, piedra, iluminación y marcos de señalización actualizados.',
        },
        icon: 'Building2',
      },
      {
        headline: {en: 'Seasonal lighting', es: 'Iluminación de temporada'},
        description: {
          en: 'Holiday + uplight installs and removal.',
          es: 'Instalación y retiro de iluminación festiva e iluminación.',
        },
        icon: 'Lightbulb',
      },
      {
        headline: {en: 'Hardscape repairs', es: 'Reparaciones de hardscape'},
        description: {
          en: 'Small paver resets, joint sand, and minor wall repointing.',
          es: 'Reasentado de adoquines, arena de juntas y rejuntado menor.',
        },
        icon: 'Hammer',
      },
    ],
    process: [
      {
        headline: {en: 'Site walk', es: 'Recorrido del sitio'},
        description: {
          en: 'Walk with property manager, photo every opportunity.',
          es: 'Recorrido con el manager, foto de cada oportunidad.',
        },
      },
      {
        headline: {en: 'Concept', es: 'Concepto'},
        description: {
          en: 'Design ideas + budget framing in 1–2 weeks.',
          es: 'Ideas de diseño y presupuesto en 1–2 semanas.',
        },
      },
      {
        headline: {en: 'Estimate', es: 'Presupuesto'},
        description: {
          en: 'Itemized scope — easy to phase or trim to budget.',
          es: 'Alcance detallado — fácil de hacer por fases o ajustar.',
        },
      },
      {
        headline: {en: 'Build', es: 'Construcción'},
        description: {
          en: 'Single project lead; no-disruption schedule for tenants.',
          es: 'Un solo líder; horario sin interrumpir a inquilinos.',
        },
      },
      {
        headline: {en: 'Walkthrough', es: 'Recorrido final'},
        description: {
          en: 'Manager walk before sign-off; punch list resolved in 7 days.',
          es: 'Recorrido con manager antes de firmar; lista resuelta en 7 días.',
        },
      },
    ],
    whyUs: [
      {
        headline: {en: 'Designer-led upgrades', es: 'Mejoras lideradas por diseñador'},
        description: {
          en: 'Plans drawn before plants are picked.',
          es: 'Planos hechos antes de elegir plantas.',
        },
        icon: 'PencilRuler',
      },
      {
        headline: {en: 'No-disruption schedule', es: 'Sin interrupciones'},
        description: {
          en: 'Work timed around peak hours per tenant lease.',
          es: 'Trabajo planificado alrededor de horas pico por contrato.',
        },
        icon: 'Clock',
      },
      {
        headline: {en: 'Single point of contact', es: 'Un solo contacto'},
        description: {
          en: 'Same project lead from concept to walkthrough.',
          es: 'Mismo líder de proyecto del concepto al recorrido.',
        },
        icon: 'UserCheck',
      },
    ],
    pricing: {mode: 'explainer', explainerFactors: GENERIC_FACTORS},
    projects: [
      {
        title: {en: 'Aurora HOA entry refresh', es: 'Renovación de entrada HOA en Aurora'},
        meta: {en: 'Aurora · 2024', es: 'Aurora · 2024'},
        imageKey: 'property-enhancement-1',
      },
      {
        title: {en: 'Naperville retail entry', es: 'Entrada de comercio en Naperville'},
        meta: {en: 'Naperville · 2024', es: 'Naperville · 2024'},
        imageKey: 'property-enhancement-2',
      },
    ],
    related: ['landscape-maintenance', 'turf-management'],
    projectsTag: 'property-enhancement',
  },

  {
    slug: 'turf-management',
    division: 'landscape',
    audience: 'commercial',
    icon: 'Sprout',
    name: {en: 'Turf Management', es: 'Manejo de Césped'},
    hero: {
      h1: {
        en: 'Commercial Turf Management in DuPage.',
        es: 'Manejo Comercial de Césped en DuPage.',
      },
      subhead: {
        en: 'Soil testing, aeration, overseeding, fertilization, weed control, and quarterly reporting — turf-specialist lead with eco-friendly options.',
        es: 'Análisis de suelo, aireación, resiembra, fertilización, control de maleza y reportes trimestrales — líder especialista con opciones ecológicas.',
      },
      photoSlot: 'service.turf-management.16x9',
    },
    whatsIncluded: [
      {
        headline: {en: 'Soil testing', es: 'Análisis de suelo'},
        description: {
          en: 'Annual baseline + targeted retests.',
          es: 'Línea base anual + repeticiones puntuales.',
        },
        icon: 'TestTube',
      },
      {
        headline: {en: 'Aeration', es: 'Aireación'},
        description: {
          en: 'Core aeration to relieve compaction.',
          es: 'Aireación con tarugos para aliviar compactación.',
        },
        icon: 'Wind',
      },
      {
        headline: {en: 'Overseeding', es: 'Resiembra'},
        description: {
          en: 'Cool-season blends, slit-seed application.',
          es: 'Mezclas de temporada fría, aplicación slit-seed.',
        },
        icon: 'Sprout',
      },
      {
        headline: {en: 'Fertilization', es: 'Fertilización'},
        description: {
          en: 'Custom program from soil-test data.',
          es: 'Programa personalizado según análisis de suelo.',
        },
        icon: 'Leaf',
      },
      {
        headline: {en: 'Weed control', es: 'Control de maleza'},
        description: {
          en: 'Pre-emergent + spot treatments by IDA-licensed applicator.',
          es: 'Pre-emergente + tratamientos con aplicador licenciado por IDA.',
        },
        icon: 'BadgeCheck',
      },
      {
        headline: {en: 'Reporting', es: 'Reportes'},
        description: {
          en: 'Quarterly PDF: applications, soil trends, recommendations.',
          es: 'PDF trimestral: aplicaciones, tendencias de suelo, recomendaciones.',
        },
        icon: 'FileText',
      },
    ],
    process: [
      {
        headline: {en: 'Soil baseline', es: 'Línea base de suelo'},
        description: {
          en: 'Sampling and lab analysis to establish the starting point.',
          es: 'Muestreo y análisis de laboratorio.',
        },
      },
      {
        headline: {en: 'Custom plan', es: 'Plan personalizado'},
        description: {
          en: 'Application schedule mapped to soil and turf type.',
          es: 'Calendario de aplicaciones según suelo y tipo de césped.',
        },
      },
      {
        headline: {en: 'Application', es: 'Aplicación'},
        description: {
          en: 'On-schedule applications, weather-aware.',
          es: 'Aplicaciones puntuales, sensibles al clima.',
        },
      },
      {
        headline: {en: 'Reporting', es: 'Reportes'},
        description: {
          en: 'Quarterly review with soil trends and next-cycle plan.',
          es: 'Revisión trimestral con tendencias y siguiente ciclo.',
        },
      },
    ],
    whyUs: [
      {
        headline: {en: 'Turf-specialist lead', es: 'Líder especialista en césped'},
        description: {
          en: 'Decade+ in turf management; not a generalist.',
          es: 'Más de una década en césped; no es generalista.',
        },
        icon: 'Award',
      },
      {
        headline: {en: 'Quarterly reporting', es: 'Reportes trimestrales'},
        description: {
          en: 'PDF report with soil trends and recommendations.',
          es: 'PDF con tendencias de suelo y recomendaciones.',
        },
        icon: 'FileText',
      },
      {
        headline: {en: 'Eco-friendly options', es: 'Opciones ecológicas'},
        description: {
          en: 'Reduced-chemical and organic-base programs available.',
          es: 'Programas de químicos reducidos y base orgánica disponibles.',
        },
        icon: 'Leaf',
      },
    ],
    pricing: {mode: 'explainer', explainerFactors: GENERIC_FACTORS},
    projects: [
      {
        title: {en: 'Naperville office park', es: 'Parque de oficinas en Naperville'},
        meta: {en: 'Naperville · 2024', es: 'Naperville · 2024'},
        imageKey: 'turf-management-1',
      },
      {
        title: {en: 'Aurora corporate campus', es: 'Campus corporativo en Aurora'},
        meta: {en: 'Aurora · 2024', es: 'Aurora · 2024'},
        imageKey: 'turf-management-2',
      },
    ],
    related: ['landscape-maintenance', 'property-enhancement'],
    projectsTag: 'turf-management',
  },

  // -------------------- HARDSCAPE (6) — D7 cross-sell --------------------
  {
    slug: 'patios-walkways',
    division: 'hardscape',
    audience: 'hardscape',
    icon: 'Layers',
    name: {en: 'Patios & Walkways', es: 'Patios y Senderos'},
    hero: {
      h1: {
        en: 'Patios & Walkways in Aurora & DuPage.',
        es: 'Patios y Senderos en Aurora y DuPage.',
      },
      subhead: {
        en: 'Unilock-trained crew, no subcontracted base prep, and a 5-year installation warranty. Two decades of paver experience under one project lead.',
        es: 'Equipo entrenado por Unilock, sin preparación de base subcontratada, y garantía de instalación de 5 años. Dos décadas de experiencia bajo un solo líder.',
      },
      photoSlot: 'service.patios-walkways.16x9',
    },
    whatsIncluded: [
      {
        headline: {en: 'Site grading', es: 'Nivelación del sitio'},
        description: {
          en: 'Drainage-first grading away from the structure.',
          es: 'Nivelado prioritizando drenaje fuera de la estructura.',
        },
        icon: 'TrendingDown',
      },
      {
        headline: {en: 'Base prep', es: 'Preparación de base'},
        description: {
          en: 'Excavation to 6"–12" + crushed-stone base + compaction.',
          es: 'Excavación de 6–12" + base de piedra triturada + compactación.',
        },
        icon: 'Layers',
      },
      {
        headline: {en: 'Paver install', es: 'Instalación de adoquines'},
        description: {
          en: 'Unilock pavers laid to design pattern, sand-set.',
          es: 'Adoquines Unilock al patrón de diseño, asentados en arena.',
        },
        icon: 'Grid3x3',
      },
      {
        headline: {en: 'Joint-sand sealing', es: 'Sellado de juntas'},
        description: {
          en: 'Polymeric sand applied + sealed against weed growth.',
          es: 'Arena polimérica aplicada y sellada contra maleza.',
        },
        icon: 'Droplets',
      },
      {
        headline: {en: 'Edge restraints', es: 'Restricciones de borde'},
        description: {
          en: 'Spike-anchored edge restraint to prevent shifting.',
          es: 'Restricción de borde anclada con clavos contra desplazamiento.',
        },
        icon: 'Anchor',
      },
      {
        headline: {en: 'Cleanup', es: 'Limpieza'},
        description: {
          en: 'Site swept, debris hauled — looks finished day one.',
          es: 'Sitio barrido, escombros retirados — luce terminado.',
        },
        icon: 'Sparkles',
      },
    ],
    process: [
      {
        headline: {en: 'Concept', es: 'Concepto'},
        description: {
          en: 'Design conversation, paver options, scope sketches.',
          es: 'Conversación de diseño, opciones de adoquines, bocetos.',
        },
      },
      {
        headline: {en: 'Site survey', es: 'Estudio del sitio'},
        description: {
          en: 'Drainage, utilities, soil — inputs to the design.',
          es: 'Drenaje, servicios, suelo — datos para el diseño.',
        },
      },
      {
        headline: {en: 'Detailed plan', es: 'Plan detallado'},
        description: {
          en: 'Plan + materials + permit handling + locked schedule.',
          es: 'Plan + materiales + permisos + horario fijo.',
        },
      },
      {
        headline: {en: 'Install', es: 'Instalación'},
        description: {
          en: 'Same crew throughout; daily progress photo log.',
          es: 'Mismo equipo; bitácora diaria con fotos.',
        },
      },
      {
        headline: {en: 'Walkthrough', es: 'Recorrido final'},
        description: {
          en: 'Walk with you, sand seal cure timeline, warranty paperwork.',
          es: 'Recorrido contigo, curado del sellado, papelería de garantía.',
        },
      },
    ],
    whyUs: [
      {
        headline: {en: 'Unilock-trained crew', es: 'Equipo entrenado por Unilock'},
        description: {
          en: 'Authorized Contractor — pavers laid to spec, every time.',
          es: 'Contratista autorizado — adoquines instalados al estándar.',
        },
        icon: 'Award',
      },
      {
        headline: {en: '5-yr installation warranty', es: '5 años de garantía de instalación'},
        description: {
          en: 'Workmanship covered five years; reset at no charge.',
          es: 'Mano de obra cubierta cinco años; reasentado sin costo.',
        },
        icon: 'BadgeCheck',
      },
      {
        headline: {en: 'No subcontracted base prep', es: 'Sin preparación de base subcontratada'},
        description: {
          en: 'Our crew digs the base — the part that makes it last.',
          es: 'Nuestro equipo hace la base — la parte que hace durar el patio.',
        },
        icon: 'ShieldCheck',
      },
    ],
    pricing: {mode: 'explainer', explainerFactors: HARDSCAPE_FACTORS},
    projects: [
      {
        title: {en: 'Naperville patio + fire feature', es: 'Patio y chimenea en Naperville'},
        meta: {en: 'Naperville · 2024', es: 'Naperville · 2024'},
        imageKey: 'patios-walkways-1',
      },
      {
        title: {en: 'Wheaton walkway', es: 'Sendero en Wheaton'},
        meta: {en: 'Wheaton · 2024', es: 'Wheaton · 2024'},
        imageKey: 'patios-walkways-2',
      },
      {
        title: {en: 'Aurora paver entry', es: 'Entrada de adoquines en Aurora'},
        meta: {en: 'Aurora · 2024', es: 'Aurora · 2024'},
        imageKey: 'patios-walkways-3',
      },
    ],
    related: ['retaining-walls', 'fire-pits-features', 'driveways', 'outdoor-kitchens'],
    projectsTag: 'patios-walkways',
  },

  {
    slug: 'retaining-walls',
    division: 'hardscape',
    audience: 'hardscape',
    icon: 'Wall',
    name: {en: 'Retaining Walls', es: 'Muros de Contención'},
    photoAlt: {
      en: 'A curved segmental-block retaining wall with capstone coping and stone steps enclosing a circular paver patio, edged by shrubs and hedges.',
      es: 'Un muro de contención curvo de bloques segmentados con remate de albardilla y escalones de piedra que rodea un patio circular de adoquines, bordeado de arbustos y setos.',
    },
    hero: {
      h1: {
        en: 'Retaining Walls in DuPage County.',
        es: 'Muros de Contención en DuPage County.',
      },
      subhead: {
        en: 'Engineered designs over 4 feet, drainage-first construction, and Unilock systems. Built to last with permits handled and a clean walk-away.',
        es: 'Diseños con ingeniería sobre 4 pies, construcción que prioriza drenaje y sistemas Unilock. Hecho para durar con permisos manejados.',
      },
      photoSlot: 'service.retaining-walls.16x9',
    },
    whatsIncluded: [
      {
        headline: {en: 'Engineering review', es: 'Revisión de ingeniería'},
        description: {
          en: 'Walls 4ft+ get stamped engineering before build.',
          es: 'Muros de 4 pies o más reciben ingeniería sellada antes de construir.',
        },
        icon: 'PencilRuler',
      },
      {
        headline: {en: 'Drainage', es: 'Drenaje'},
        description: {
          en: 'Drain tile + clean stone behind every wall — non-negotiable.',
          es: 'Tubería de drenaje + piedra limpia detrás de cada muro — innegociable.',
        },
        icon: 'TrendingDown',
      },
      {
        headline: {en: 'Geo-grid', es: 'Geomalla'},
        description: {
          en: 'Reinforcement grid into hill at engineer-spec depth.',
          es: 'Malla de refuerzo hacia el talud a la profundidad de ingeniería.',
        },
        icon: 'Layers',
      },
      {
        headline: {en: 'Block install', es: 'Instalación de bloque'},
        description: {
          en: 'Unilock structural blocks set per design.',
          es: 'Bloques estructurales Unilock al diseño.',
        },
        icon: 'Grid3x3',
      },
      {
        headline: {en: 'Cap finish', es: 'Acabado superior'},
        description: {
          en: 'Pinned cap stones, finished to match adjacent paving.',
          es: 'Tapas ancladas, acabadas al pavimento adyacente.',
        },
        icon: 'Sparkles',
      },
    ],
    process: [
      {
        headline: {en: 'Site survey', es: 'Estudio del sitio'},
        description: {
          en: 'Slope, soil, utilities, intended use.',
          es: 'Pendiente, suelo, servicios, uso previsto.',
        },
      },
      {
        headline: {en: 'Engineering', es: 'Ingeniería'},
        description: {
          en: 'Stamped drawings for walls 4ft+ or against structures.',
          es: 'Planos sellados para muros de 4 pies o cerca de estructuras.',
        },
      },
      {
        headline: {en: 'Permit', es: 'Permiso'},
        description: {
          en: 'Submitted to municipality + county per requirements.',
          es: 'Sometido al municipio y condado según lo requerido.',
        },
      },
      {
        headline: {en: 'Install', es: 'Instalación'},
        description: {
          en: 'Excavate, drainage, base, geo-grid, blocks, cap.',
          es: 'Excavación, drenaje, base, geomalla, bloques, tapa.',
        },
      },
      {
        headline: {en: 'Walkthrough', es: 'Recorrido final'},
        description: {
          en: 'Walk with you + warranty paperwork on the cap-finish day.',
          es: 'Recorrido contigo y papelería de garantía el día del acabado.',
        },
      },
    ],
    whyUs: [
      {
        headline: {en: 'Engineered designs over 4ft', es: 'Diseños con ingeniería sobre 4 pies'},
        description: {
          en: 'Stamped engineering protects the build and the owner.',
          es: 'La ingeniería sellada protege el muro y al dueño.',
        },
        icon: 'PencilRuler',
      },
      {
        headline: {en: 'Drainage-first build', es: 'Construcción que prioriza drenaje'},
        description: {
          en: 'No wall lasts without drainage; ours always have it.',
          es: 'Ningún muro dura sin drenaje; los nuestros siempre lo tienen.',
        },
        icon: 'TrendingDown',
      },
      {
        headline: {en: 'Unilock systems', es: 'Sistemas Unilock'},
        description: {
          en: 'Tested block systems with manufacturer warranty.',
          es: 'Sistemas de bloque probados con garantía del fabricante.',
        },
        icon: 'Award',
      },
    ],
    pricing: {mode: 'explainer', explainerFactors: HARDSCAPE_FACTORS},
    projects: [
      {
        title: {en: 'Lisle multi-tier wall', es: 'Muro multi-nivel en Lisle'},
        meta: {en: 'Lisle · 2024', es: 'Lisle · 2024'},
        imageKey: 'retaining-walls-1',
      },
      {
        title: {en: 'Naperville hillside seat wall', es: 'Muro asiento en Naperville'},
        meta: {en: 'Naperville · 2024', es: 'Naperville · 2024'},
        imageKey: 'retaining-walls-2',
      },
    ],
    related: ['patios-walkways', 'fire-pits-features', 'driveways'],
    projectsTag: 'retaining-walls',
  },

  {
    slug: 'fire-pits-features',
    division: 'hardscape',
    audience: 'hardscape',
    icon: 'Flame',
    name: {en: 'Fire Pits & Features', es: 'Chimeneas y Elementos de Fuego'},
    photoAlt: {
      en: 'A built stone-clad rectangular fire pit on a flagstone patio, ringed by fixed wooden bench seating under a timber pergola.',
      es: 'Una fogata rectangular de obra revestida de piedra sobre un patio de lajas, rodeada de bancas de madera fijas bajo una pérgola de madera.',
    },
    hero: {
      h1: {
        en: 'Fire Pits & Features in DuPage.',
        es: 'Chimeneas y Elementos de Fuego en DuPage.',
      },
      subhead: {
        en: 'Custom designs, licensed gas-line coordination, and surrounds in Unilock pavers. Seating walls and sealing included where they belong.',
        es: 'Diseños personalizados, coordinación de gas con licencia y rodeos en adoquines Unilock. Muros asiento y sellado donde corresponde.',
      },
      photoSlot: 'service.fire-pits-features.16x9',
    },
    whatsIncluded: [
      {
        headline: {en: 'Pit design', es: 'Diseño de chimenea'},
        description: {
          en: 'Wood-burning, gas, or hybrid — designed for the yard.',
          es: 'Leña, gas o híbrido — diseñado para el jardín.',
        },
        icon: 'Flame',
      },
      {
        headline: {en: 'Surround paving', es: 'Pavimentación del entorno'},
        description: {
          en: 'Unilock pavers around the pit, sized for seating circulation.',
          es: 'Adoquines Unilock alrededor, dimensionados para circulación.',
        },
        icon: 'Grid3x3',
      },
      {
        headline: {en: 'Gas-line coordination', es: 'Coordinación de gas'},
        description: {
          en: 'Licensed plumber for gas lines and shut-offs.',
          es: 'Plomero licenciado para líneas de gas y válvulas.',
        },
        icon: 'BadgeCheck',
      },
      {
        headline: {en: 'Seating walls', es: 'Muros asiento'},
        description: {
          en: 'Optional perimeter seating walls in matching block.',
          es: 'Muros asiento opcionales en bloque coordinado.',
        },
        icon: 'Wall',
      },
      {
        headline: {en: 'Sealing', es: 'Sellado'},
        description: {
          en: 'Joint-sand sealing and stone surface seal.',
          es: 'Sellado de juntas y superficie de piedra.',
        },
        icon: 'Droplets',
      },
    ],
    process: [
      {
        headline: {en: 'Concept', es: 'Concepto'},
        description: {
          en: 'Wood vs gas, size, integration with patio.',
          es: 'Leña vs gas, tamaño, integración con el patio.',
        },
      },
      {
        headline: {en: 'Plan', es: 'Plan'},
        description: {
          en: 'Detailed drawings + materials + locked budget.',
          es: 'Planos + materiales + presupuesto fijo.',
        },
      },
      {
        headline: {en: 'Permits', es: 'Permisos'},
        description: {
          en: 'Gas lines need permits — we file them.',
          es: 'Las líneas de gas necesitan permisos — los manejamos.',
        },
      },
      {
        headline: {en: 'Install', es: 'Instalación'},
        description: {
          en: 'Excavate, base, gas (if any), block install, finish.',
          es: 'Excavación, base, gas (si aplica), bloques, acabado.',
        },
      },
      {
        headline: {en: 'Walkthrough', es: 'Recorrido final'},
        description: {
          en: 'Lighting demo, gas-shutoff location, warranty paperwork.',
          es: 'Demo de encendido, ubicación de válvula, papelería de garantía.',
        },
      },
    ],
    whyUs: [
      {
        headline: {en: 'Licensed gas coordination', es: 'Gas con licencia'},
        description: {
          en: 'IL-licensed plumber on every gas-fed feature.',
          es: 'Plomero licenciado de Illinois en cada chimenea con gas.',
        },
        icon: 'BadgeCheck',
      },
      {
        headline: {en: 'Custom designs', es: 'Diseños personalizados'},
        description: {
          en: 'Sized to the yard, not pulled from a catalog.',
          es: 'Dimensionado al jardín, no del catálogo.',
        },
        icon: 'PencilRuler',
      },
      {
        headline: {en: 'Warranty on craft', es: 'Garantía de mano de obra'},
        description: {
          en: '5-year workmanship plus Unilock manufacturer warranty.',
          es: '5 años de mano de obra más garantía del fabricante.',
        },
        icon: 'ShieldCheck',
      },
    ],
    pricing: {mode: 'explainer', explainerFactors: HARDSCAPE_FACTORS},
    projects: [
      {
        title: {en: 'Glen Ellyn fire pit + seating', es: 'Chimenea con asientos en Glen Ellyn'},
        meta: {en: 'Glen Ellyn · 2024', es: 'Glen Ellyn · 2024'},
        imageKey: 'fire-pits-features-1',
      },
      {
        title: {en: 'Naperville gas fire feature', es: 'Chimenea de gas en Naperville'},
        meta: {en: 'Naperville · 2024', es: 'Naperville · 2024'},
        imageKey: 'fire-pits-features-2',
      },
    ],
    related: ['patios-walkways', 'outdoor-kitchens', 'pergolas-pavilions'],
    projectsTag: 'fire-pits-features',
  },

  {
    slug: 'pergolas-pavilions',
    division: 'hardscape',
    audience: 'hardscape',
    icon: 'Home',
    name: {en: 'Pergolas & Pavilions', es: 'Pérgolas y Pabellones'},
    hero: {
      h1: {
        en: 'Pergolas & Pavilions in DuPage County.',
        es: 'Pérgolas y Pabellones en DuPage County.',
      },
      subhead: {
        en: 'Footings, engineered framing, premium hardware, and warm-stained finishes. Licensed structural — built for thirty Chicago winters.',
        es: 'Cimentaciones, estructura con ingeniería, herrajes premium y acabados cálidos. Estructural con licencia — para treinta inviernos de Chicago.',
      },
      photoSlot: 'service.pergolas-pavilions.16x9',
    },
    whatsIncluded: [
      {
        headline: {en: 'Footings', es: 'Cimentaciones'},
        description: {
          en: 'Concrete footings sized to the structure + soil bearing.',
          es: 'Cimentaciones de concreto al tamaño de la estructura.',
        },
        icon: 'TrendingDown',
      },
      {
        headline: {en: 'Engineering', es: 'Ingeniería'},
        description: {
          en: 'Stamped engineering for any pavilion or roofed pergola.',
          es: 'Ingeniería sellada para cualquier pabellón o pérgola con techo.',
        },
        icon: 'PencilRuler',
      },
      {
        headline: {en: 'Frame', es: 'Estructura'},
        description: {
          en: 'Cedar or steel framing per design + permitting needs.',
          es: 'Cedro o acero según diseño y permisos.',
        },
        icon: 'Hammer',
      },
      {
        headline: {en: 'Roof', es: 'Techo'},
        description: {
          en: 'Open lattice, partial canopy, or full roof per spec.',
          es: 'Reja abierta, dosel parcial o techo completo según diseño.',
        },
        icon: 'Home',
      },
      {
        headline: {en: 'Stain + finish', es: 'Tinte y acabado'},
        description: {
          en: 'UV-stable warm-tone stain with year-1 touch-up.',
          es: 'Tinte cálido estable a UV con retoque del primer año.',
        },
        icon: 'Sparkles',
      },
    ],
    process: [
      {
        headline: {en: 'Concept', es: 'Concepto'},
        description: {
          en: 'Open vs roofed, attached vs freestanding, footprint.',
          es: 'Abierta vs con techo, anexa vs aislada, huella.',
        },
      },
      {
        headline: {en: 'Engineering', es: 'Ingeniería'},
        description: {
          en: 'Stamped drawings for permit and build.',
          es: 'Planos sellados para permiso y construcción.',
        },
      },
      {
        headline: {en: 'Permit', es: 'Permiso'},
        description: {
          en: 'Filed with the municipality; inspections scheduled.',
          es: 'Sometido al municipio; inspecciones agendadas.',
        },
      },
      {
        headline: {en: 'Build', es: 'Construcción'},
        description: {
          en: 'Footings, frame, roof, stain — same crew throughout.',
          es: 'Cimentaciones, marco, techo, tinte — mismo equipo.',
        },
      },
      {
        headline: {en: 'Walkthrough', es: 'Recorrido final'},
        description: {
          en: 'Walk with you, stain warranty, year-1 touch-up scheduled.',
          es: 'Recorrido contigo, garantía de tinte, retoque del año 1.',
        },
      },
    ],
    whyUs: [
      {
        headline: {en: 'Licensed structural', es: 'Estructural con licencia'},
        description: {
          en: 'Stamped engineering and permit handling on every build.',
          es: 'Ingeniería sellada y permisos en cada proyecto.',
        },
        icon: 'PencilRuler',
      },
      {
        headline: {en: 'Premium hardware', es: 'Herrajes premium'},
        description: {
          en: 'Stainless and powder-coated hardware — no rust streaks at year 5.',
          es: 'Herrajes de acero inoxidable y recubiertos — sin manchas al año 5.',
        },
        icon: 'Wrench',
      },
      {
        headline: {en: 'Stain warranty', es: 'Garantía de tinte'},
        description: {
          en: 'UV-stable stain with year-one warranty touch-up.',
          es: 'Tinte estable a UV con retoque del primer año.',
        },
        icon: 'BadgeCheck',
      },
    ],
    pricing: {mode: 'explainer', explainerFactors: HARDSCAPE_FACTORS},
    projects: [
      {
        title: {en: 'Naperville cedar pergola', es: 'Pérgola de cedro en Naperville'},
        meta: {en: 'Naperville · 2024', es: 'Naperville · 2024'},
        imageKey: 'pergolas-pavilions-1',
      },
      {
        title: {en: 'Wheaton pavilion', es: 'Pabellón en Wheaton'},
        meta: {en: 'Wheaton · 2024', es: 'Wheaton · 2024'},
        imageKey: 'pergolas-pavilions-2',
      },
    ],
    related: ['patios-walkways', 'outdoor-kitchens', 'fire-pits-features'],
    projectsTag: 'pergolas-pavilions',
  },

  {
    slug: 'driveways',
    division: 'hardscape',
    audience: 'hardscape',
    icon: 'Car',
    name: {en: 'Driveways', es: 'Entradas de Auto'},
    photoAlt: {
      en: 'A wide interlocking-paver driveway with dark border insets leading up to the garage and entrance of a modern two-story home.',
      es: 'Una amplia entrada de auto de adoquines entrelazados con franjas de borde oscuras que conduce al garaje y la entrada de una casa moderna de dos pisos.',
    },
    hero: {
      h1: {
        en: 'Paver Driveways in Aurora & DuPage.',
        es: 'Entradas de Adoquines en Aurora y DuPage.',
      },
      subhead: {
        en: 'Unilock-rated structural pavers, 25-year base spec, and permit handling. Looks like a high-end home from the curb — and is one to drive on.',
        es: 'Adoquines estructurales Unilock, base con especificación de 25 años y permisos manejados. Luce como una casa premium desde la calle.',
      },
      photoSlot: 'service.driveways.16x9',
    },
    whatsIncluded: [
      {
        headline: {en: 'Excavation', es: 'Excavación'},
        description: {
          en: '10"–14" excavation to good bearing; old asphalt removal.',
          es: 'Excavación de 10–14" hasta buena base; remoción del asfalto.',
        },
        icon: 'TrendingDown',
      },
      {
        headline: {en: 'Base prep', es: 'Preparación de base'},
        description: {
          en: 'Engineered base with crushed stone + compaction by lift.',
          es: 'Base con piedra triturada y compactación por capas.',
        },
        icon: 'Layers',
      },
      {
        headline: {en: 'Paver install', es: 'Instalación de adoquines'},
        description: {
          en: 'Structural-rated Unilock pavers laid in chosen pattern.',
          es: 'Adoquines Unilock estructurales en el patrón elegido.',
        },
        icon: 'Grid3x3',
      },
      {
        headline: {en: 'Edge restraints', es: 'Restricciones de borde'},
        description: {
          en: 'Spike-anchored edge restraint at every transition.',
          es: 'Restricción anclada en cada transición.',
        },
        icon: 'Anchor',
      },
      {
        headline: {en: 'Sealing', es: 'Sellado'},
        description: {
          en: 'Polymeric joint sand + optional surface sealer.',
          es: 'Arena polimérica + sellador de superficie opcional.',
        },
        icon: 'Droplets',
      },
    ],
    process: [
      {
        headline: {en: 'Site assessment', es: 'Evaluación del sitio'},
        description: {
          en: 'Drainage, slope, vehicle weight class, utilities.',
          es: 'Drenaje, pendiente, peso vehicular, servicios.',
        },
      },
      {
        headline: {en: 'Plan', es: 'Plan'},
        description: {
          en: 'Materials + pattern + cost + locked schedule.',
          es: 'Materiales + patrón + costo + horario fijo.',
        },
      },
      {
        headline: {en: 'Permit', es: 'Permiso'},
        description: {
          en: 'Driveway aprons need municipal permits — we file them.',
          es: 'Las accesos a entrada requieren permisos — los manejamos.',
        },
      },
      {
        headline: {en: 'Install', es: 'Instalación'},
        description: {
          en: 'Demo, excavate, base, pavers, restraints, sand seal.',
          es: 'Demolición, excavación, base, adoquines, restricciones, sellado.',
        },
      },
      {
        headline: {en: 'Walkthrough', es: 'Recorrido final'},
        description: {
          en: 'Walk with you + the cure-in timeline + warranty paperwork.',
          es: 'Recorrido contigo + tiempo de curado + papelería de garantía.',
        },
      },
    ],
    whyUs: [
      {
        headline: {en: 'Unilock-rated structural pavers', es: 'Adoquines Unilock estructurales'},
        description: {
          en: 'Rated for vehicle loading; not the patio paver in disguise.',
          es: 'Calificados para carga vehicular; no el adoquín de patio disfrazado.',
        },
        icon: 'Award',
      },
      {
        headline: {en: '25-yr base spec', es: 'Base con especificación de 25 años'},
        description: {
          en: 'Engineered base depth and compaction to 25-yr standard.',
          es: 'Base con profundidad y compactación al estándar de 25 años.',
        },
        icon: 'Layers',
      },
      {
        headline: {en: 'Permitting handled', es: 'Permisos manejados'},
        description: {
          en: 'Driveway aprons need municipal coordination; we file it all.',
          es: 'Los accesos requieren coordinación municipal; nosotros lo manejamos.',
        },
        icon: 'BadgeCheck',
      },
    ],
    pricing: {mode: 'explainer', explainerFactors: HARDSCAPE_FACTORS},
    projects: [
      {
        title: {en: 'Aurora paver driveway', es: 'Entrada de adoquines en Aurora'},
        meta: {en: 'Aurora · 2024', es: 'Aurora · 2024'},
        imageKey: 'driveways-1',
      },
      {
        title: {en: 'Naperville circle drive', es: 'Entrada circular en Naperville'},
        meta: {en: 'Naperville · 2024', es: 'Naperville · 2024'},
        imageKey: 'driveways-2',
      },
    ],
    related: ['retaining-walls', 'patios-walkways'],
    projectsTag: 'driveways',
  },

  {
    slug: 'outdoor-kitchens',
    division: 'hardscape',
    audience: 'hardscape',
    icon: 'ChefHat',
    name: {en: 'Outdoor Kitchens', es: 'Cocinas Exteriores'},
    photoAlt: {
      en: 'A built-in outdoor kitchen with a stainless grill, sink, and beverage fridge set into cabinetry under a wood-clad covered patio, beside a fenced lawn.',
      es: 'Una cocina exterior empotrada con parrilla de acero inoxidable, fregadero y refrigerador de bebidas integrados en los gabinetes, bajo un patio techado revestido de madera, junto a un césped cercado.',
    },
    hero: {
      h1: {
        en: 'Outdoor Kitchens in DuPage County.',
        es: 'Cocinas Exteriores en DuPage County.',
      },
      subhead: {
        en: 'Plumbing, gas, electric, premium counters and appliances. Licensed-trade coordination from the first sketch through the final connection.',
        es: 'Plomería, gas, electricidad, encimeras y electrodomésticos premium. Coordinación con oficios licenciados del primer boceto a la última conexión.',
      },
      photoSlot: 'service.outdoor-kitchens.16x9',
    },
    whatsIncluded: [
      {
        headline: {en: 'Layout', es: 'Distribución'},
        description: {
          en: 'L-shape, island, or galley designed to your patio.',
          es: 'En L, isla o galería diseñada para tu patio.',
        },
        icon: 'PencilRuler',
      },
      {
        headline: {en: 'Plumbing/gas/electric', es: 'Plomería, gas y electricidad'},
        description: {
          en: 'Licensed plumber, gas tech, and electrician.',
          es: 'Plomero, técnico de gas y electricista licenciados.',
        },
        icon: 'Wrench',
      },
      {
        headline: {en: 'Counters', es: 'Encimeras'},
        description: {
          en: 'Granite, quartzite, or sealed concrete options.',
          es: 'Opciones de granito, cuarcita o concreto sellado.',
        },
        icon: 'Square',
      },
      {
        headline: {en: 'Appliance install', es: 'Instalación de electrodomésticos'},
        description: {
          en: 'Built-in grill, side burner, fridge, sink, pizza oven.',
          es: 'Parrilla empotrada, quemador lateral, refri, fregadero, horno de pizza.',
        },
        icon: 'ChefHat',
      },
      {
        headline: {en: 'Finish', es: 'Acabado'},
        description: {
          en: 'Stone or stucco veneer + hardware + lighting.',
          es: 'Acabado en piedra o estuco + herrajes + iluminación.',
        },
        icon: 'Sparkles',
      },
    ],
    process: [
      {
        headline: {en: 'Concept', es: 'Concepto'},
        description: {
          en: 'Conversation about cooking style, party size, integration.',
          es: 'Conversación sobre estilo de cocina, tamaño de eventos, integración.',
        },
      },
      {
        headline: {en: 'Plan', es: 'Plan'},
        description: {
          en: 'Drawings + appliance spec + plumbing/gas/electric routing.',
          es: 'Planos + electrodomésticos + ruteo de plomería/gas/eléctrico.',
        },
      },
      {
        headline: {en: 'Permits', es: 'Permisos'},
        description: {
          en: 'Gas + electrical permits filed with municipality.',
          es: 'Permisos de gas y eléctrico con el municipio.',
        },
      },
      {
        headline: {en: 'Build', es: 'Construcción'},
        description: {
          en: 'Foundation, framing, MEP, counters, appliances, finish.',
          es: 'Cimentación, marco, MEP, encimeras, electrodomésticos, acabado.',
        },
      },
      {
        headline: {en: 'Walkthrough', es: 'Recorrido final'},
        description: {
          en: 'Cooking demo, appliance manuals, warranty paperwork.',
          es: 'Demo de cocina, manuales, papelería de garantía.',
        },
      },
    ],
    whyUs: [
      {
        headline: {en: 'Licensed trades coordination', es: 'Coordinación de oficios licenciados'},
        description: {
          en: 'Plumber, gas tech, electrician all licensed in Illinois.',
          es: 'Plomero, gas y eléctrico licenciados en Illinois.',
        },
        icon: 'BadgeCheck',
      },
      {
        headline: {en: 'Premium finishes', es: 'Acabados premium'},
        description: {
          en: 'Stone-veneer, sealed counters, professional-grade appliances.',
          es: 'Piedra natural, encimeras selladas, electrodomésticos profesionales.',
        },
        icon: 'Award',
      },
      {
        headline: {en: '5-yr workmanship', es: '5 años de mano de obra'},
        description: {
          en: 'Workmanship covered five years; appliance warranties run separately.',
          es: 'Mano de obra cinco años; garantías de electrodomésticos aparte.',
        },
        icon: 'ShieldCheck',
      },
    ],
    pricing: {mode: 'explainer', explainerFactors: HARDSCAPE_FACTORS},
    projects: [
      {
        title: {en: 'Naperville L-shape kitchen', es: 'Cocina en L en Naperville'},
        meta: {en: 'Naperville · 2024', es: 'Naperville · 2024'},
        imageKey: 'outdoor-kitchens-1',
      },
      {
        title: {en: 'Wheaton island kitchen', es: 'Cocina en isla en Wheaton'},
        meta: {en: 'Wheaton · 2024', es: 'Wheaton · 2024'},
        imageKey: 'outdoor-kitchens-2',
      },
    ],
    related: ['patios-walkways', 'fire-pits-features', 'pergolas-pavilions'],
    projectsTag: 'outdoor-kitchens',
  },

  // -------------------- WATERPROOFING (10) — Phase M.01d --------------------
  // Division added 2026-05-26. No `audience` field — these services don't
  // surface under /residential/ or /commercial/ in M.01d. M.01e wires the
  // /waterproofing/<slug>/ landing routes. Inclusions per the Phase M.01d
  // sub-service map. ES uses `tú` register (marketing/content surfaces).
  {
    slug: 'basement-waterproofing',
    division: 'waterproofing',
    icon: 'Droplets',
    name: {en: 'Basement Waterproofing', es: 'Impermeabilización de Sótanos'},
    photoAlt: {
      en: 'Pale mineral streaks left by water tracking down the surface of a weathered concrete wall.',
      es: 'Vetas minerales pálidas dejadas por el agua al escurrir por la superficie de un muro de hormigón desgastado.',
    },
    hero: {
      h1: {
        en: 'Basement Waterproofing in DuPage County.',
        es: 'Impermeabilización de Sótanos en DuPage County.',
      },
      subhead: {
        en: 'Interior drain tile, exterior membranes, crack repair, and vapor barriers. We diagnose the source before we sell you a solution — no over-spec, no upsell.',
        es: 'Drenaje interior, membranas exteriores, reparación de grietas y barreras de vapor. Diagnosticamos la fuente antes de venderte una solución — sin sobre-especificar, sin presionar.',
      },
      photoSlot: 'service.basement-waterproofing.16x9',
    },
    whatsIncluded: [
      {
        headline: {en: 'Interior drain tile', es: 'Drenaje interior'},
        description: {
          en: 'Perforated pipe under the basement slab, routed to a sump pit.',
          es: 'Tubería perforada bajo la losa del sótano, dirigida al pozo de sumidero.',
        },
        icon: 'Waves',
      },
      {
        headline: {en: 'Exterior waterproofing', es: 'Impermeabilización exterior'},
        description: {
          en: 'Excavate, clean the wall, apply a peel-and-stick membrane, backfill clean.',
          es: 'Excavamos, limpiamos el muro, aplicamos membrana adhesiva y rellenamos.',
        },
        icon: 'Shield',
      },
      {
        headline: {en: 'Wall crack repair', es: 'Reparación de grietas en muros'},
        description: {
          en: 'Polyurethane injection from inside — sealed for the life of the wall.',
          es: 'Inyección de poliuretano desde adentro — sellado por la vida del muro.',
        },
        icon: 'Wrench',
      },
      {
        headline: {en: 'Floor crack repair', es: 'Reparación de grietas en piso'},
        description: {
          en: 'Slab cracks routed, filled with hydraulic mortar, top-sealed.',
          es: 'Grietas en losa abiertas, rellenadas con mortero hidráulico y selladas.',
        },
        icon: 'Hammer',
      },
      {
        headline: {en: 'Water vapor barrier', es: 'Barrera de vapor'},
        description: {
          en: '12-mil reinforced sheet on walls and floor, taped at every seam.',
          es: 'Plástico reforzado de 12 mil en muros y piso, sellado en cada junta.',
        },
        icon: 'Layers',
      },
    ],
    process: [
      {
        headline: {en: 'Diagnose the source', es: 'Diagnosticamos la fuente'},
        description: {
          en: 'On-site walk, moisture meter readings, and a written cause-and-fix.',
          es: 'Visita en sitio, lecturas de humedad y un informe escrito de causa y solución.',
        },
      },
      {
        headline: {en: 'Itemized estimate', es: 'Estimado detallado'},
        description: {
          en: 'Within 48 hours. We tell you what you need, not what we want to sell.',
          es: 'En 48 horas. Te decimos lo que necesitas, no lo que queremos vender.',
        },
      },
      {
        headline: {en: 'Install', es: 'Instalación'},
        description: {
          en: 'Same crew, locked-in start. Most jobs finish in 2–4 days.',
          es: 'Mismo equipo, fecha fija de inicio. La mayoría termina en 2–4 días.',
        },
      },
      {
        headline: {en: 'Walkthrough + warranty', es: 'Recorrido y garantía'},
        description: {
          en: 'Final walkthrough, photo log, written warranty handed to you.',
          es: 'Recorrido final, registro fotográfico y garantía escrita en mano.',
        },
      },
    ],
    whyUs: [
      {
        headline: {en: 'Diagnose, then sell', es: 'Diagnóstico antes de vender'},
        description: {
          en: "We don't oversell exterior dig-outs when interior tile will fix it.",
          es: 'No te vendemos excavación exterior si el drenaje interior basta.',
        },
        icon: 'Search',
      },
      {
        headline: {en: 'Written warranty', es: 'Garantía por escrito'},
        description: {
          en: 'Lifetime on interior drain tile installs. Transferable on home sale.',
          es: 'De por vida en drenaje interior. Transferible al vender la casa.',
        },
        icon: 'ShieldCheck',
      },
      {
        headline: {en: '25 years local', es: '25 años en el área'},
        description: {
          en: 'We know which DuPage subdivisions have clay-loam that traps groundwater.',
          es: 'Sabemos qué subdivisiones de DuPage tienen arcilla que retiene el agua.',
        },
        icon: 'MapPin',
      },
    ],
    pricing: {mode: 'explainer', explainerFactors: GENERIC_FACTORS},
    projects: [
      {
        title: {en: 'Aurora basement reset', es: 'Renovación de sótano en Aurora'},
        meta: {en: 'Aurora · 2024', es: 'Aurora · 2024'},
        imageKey: 'landscape-maintenance-1',
      },
      {
        title: {en: 'Naperville interior drain tile', es: 'Drenaje interior en Naperville'},
        meta: {en: 'Naperville · 2024', es: 'Naperville · 2024'},
        imageKey: 'property-enhancement-1',
      },
      {
        title: {en: 'Wheaton exterior membrane', es: 'Membrana exterior en Wheaton'},
        meta: {en: 'Wheaton · 2024', es: 'Wheaton · 2024'},
        imageKey: 'property-enhancement-2',
      },
    ],
    related: ['foundation-repair', 'sump-pumps', 'crawl-spaces'],
    projectsTag: 'basement-waterproofing',
  },

  {
    slug: 'foundation-repair',
    division: 'waterproofing',
    icon: 'Construction',
    name: {en: 'Foundation Repair', es: 'Reparación de Cimientos'},
    photoAlt: {
      en: 'Structural cracks running across a concrete wall.',
      es: 'Grietas estructurales que atraviesan un muro de hormigón.',
    },
    hero: {
      h1: {
        en: 'Foundation Repair in DuPage County.',
        es: 'Reparación de Cimientos en DuPage County.',
      },
      subhead: {
        en: 'Carbon fiber, steel I-beam reinforcement, push piers, and joist replacement. Every job starts with a structural inspection — not a sales pitch.',
        es: 'Fibra de carbono, refuerzo con vigas de acero, pilares de empuje y reemplazo de viguetas. Cada trabajo empieza con una inspección estructural — no con una venta.',
      },
      photoSlot: 'service.foundation-repair.16x9',
    },
    whatsIncluded: [
      {
        headline: {en: 'Carbon fiber wall reinforcement', es: 'Refuerzo de fibra de carbono'},
        description: {
          en: 'Vertical straps bonded to bowed block walls — stops the bow, doesn\'t reverse it.',
          es: 'Tiras verticales adheridas a muros pandeados — detienen el pandeo, no lo revierten.',
        },
        icon: 'Grid3x3',
      },
      {
        headline: {en: 'Steel I-beam reinforcement', es: 'Refuerzo con vigas de acero'},
        description: {
          en: 'Anchored top + bottom for severely bowed or actively moving walls.',
          es: 'Ancladas arriba y abajo para muros con pandeo severo o movimiento activo.',
        },
        icon: 'Columns3',
      },
      {
        headline: {en: 'Crawl space joist replacement', es: 'Reemplazo de viguetas'},
        description: {
          en: 'Rotted or insect-damaged joists sistered or replaced full-length.',
          es: 'Viguetas podridas o dañadas por insectos hermanadas o reemplazadas completas.',
        },
        icon: 'Hammer',
      },
      {
        headline: {en: 'Foundation inspections', es: 'Inspecciones de cimientos'},
        description: {
          en: 'Written report with photo log — useful for closing or insurance claims.',
          es: 'Informe escrito con registro fotográfico — útil para cierre o seguro.',
        },
        icon: 'ClipboardCheck',
      },
      {
        headline: {en: 'Push pier installation', es: 'Pilares de empuje'},
        description: {
          en: 'Hydraulically driven steel piers to bedrock for settling foundations.',
          es: 'Pilares de acero hincados hidráulicamente hasta roca firme para cimientos asentados.',
        },
        icon: 'ArrowDownToLine',
      },
    ],
    process: [
      {
        headline: {en: 'Structural inspection', es: 'Inspección estructural'},
        description: {
          en: 'Visual walk, crack mapping, level readings. Written findings the same day.',
          es: 'Recorrido visual, mapeo de grietas, lecturas de nivel. Resultados por escrito el mismo día.',
        },
      },
      {
        headline: {en: 'Engineered estimate', es: 'Estimado con ingeniería'},
        description: {
          en: 'For load-bearing fixes, a licensed structural engineer signs off.',
          es: 'Para reparaciones estructurales, un ingeniero con licencia firma el plan.',
        },
      },
      {
        headline: {en: 'Install', es: 'Instalación'},
        description: {
          en: 'Same crew start-to-finish. Most fixes complete inside one week.',
          es: 'Mismo equipo de principio a fin. La mayoría termina en una semana.',
        },
      },
      {
        headline: {en: 'Re-inspection + warranty', es: 'Re-inspección y garantía'},
        description: {
          en: '6-month follow-up to verify the fix held. Written warranty handed over.',
          es: 'Seguimiento a 6 meses para verificar la reparación. Garantía por escrito.',
        },
      },
    ],
    whyUs: [
      {
        headline: {en: 'Engineer-signed when needed', es: 'Firmado por ingeniero cuando aplica'},
        description: {
          en: 'Load-bearing repairs come with the stamp; insurance and lenders accept it.',
          es: 'Reparaciones estructurales con sello; aseguradoras y bancos lo aceptan.',
        },
        icon: 'BadgeCheck',
      },
      {
        headline: {en: '6-month re-inspection', es: 'Re-inspección a 6 meses'},
        description: {
          en: "We come back to verify, not just to chase a referral.",
          es: 'Regresamos a verificar, no solo a buscar una referencia.',
        },
        icon: 'Repeat',
      },
      {
        headline: {en: 'Transferable warranty', es: 'Garantía transferible'},
        description: {
          en: 'Warranty transfers on home sale — adds resale value.',
          es: 'La garantía se transfiere al vender — agrega valor de reventa.',
        },
        icon: 'ShieldCheck',
      },
    ],
    pricing: {mode: 'explainer', explainerFactors: GENERIC_FACTORS},
    projects: [
      {
        title: {en: 'Wheaton wall stabilization', es: 'Estabilización de muro en Wheaton'},
        meta: {en: 'Wheaton · 2024', es: 'Wheaton · 2024'},
        imageKey: 'landscape-maintenance-1',
      },
      {
        title: {en: 'Naperville push-pier repair', es: 'Reparación con pilares en Naperville'},
        meta: {en: 'Naperville · 2024', es: 'Naperville · 2024'},
        imageKey: 'retaining-walls-1',
      },
      {
        title: {en: 'Aurora joist replacement', es: 'Reemplazo de viguetas en Aurora'},
        meta: {en: 'Aurora · 2024', es: 'Aurora · 2024'},
        imageKey: 'property-enhancement-1',
      },
    ],
    related: ['basement-waterproofing', 'crawl-spaces', 'concrete-raising'],
    projectsTag: 'foundation-repair',
  },

  {
    slug: 'sump-pumps',
    division: 'waterproofing',
    icon: 'Gauge',
    name: {en: 'Sump Pumps', es: 'Bombas de Sumidero'},
    imageKey: 'sprinkler-systems',
    hero: {
      h1: {
        en: 'Sump Pumps in DuPage County.',
        es: 'Bombas de Sumidero en DuPage County.',
      },
      subhead: {
        en: 'Install, replace, and service primary + battery-backup sump systems. Same-day emergency response when yours fails mid-storm.',
        es: 'Instalamos, reemplazamos y damos servicio a sistemas primarios y de respaldo con batería. Respuesta el mismo día cuando falla a media tormenta.',
      },
      photoSlot: 'service.sump-pumps.16x9',
    },
    whatsIncluded: [
      {
        headline: {en: 'Sump pump installation', es: 'Instalación de bomba'},
        description: {
          en: 'New basin, cast-iron primary pump, sealed lid, discharge line out.',
          es: 'Pozo nuevo, bomba primaria de hierro fundido, tapa sellada, línea de descarga.',
        },
        icon: 'Gauge',
      },
      {
        headline: {en: 'Battery backup sump pump', es: 'Bomba de respaldo con batería'},
        description: {
          en: 'Secondary DC pump on its own battery — runs when the power doesn\'t.',
          es: 'Bomba secundaria DC con su propia batería — funciona cuando no hay luz.',
        },
        icon: 'BatteryCharging',
      },
      {
        headline: {en: 'Maintenance & repair', es: 'Mantenimiento y reparación'},
        description: {
          en: 'Annual service: clean the basin, test the float, check the check-valve.',
          es: 'Servicio anual: limpiamos el pozo, probamos el flotador, revisamos la válvula.',
        },
        icon: 'Wrench',
      },
      {
        headline: {en: 'Sewage & ejector pumps', es: 'Bombas de aguas residuales y eyectoras'},
        description: {
          en: 'Solids-handling pumps for basement bathrooms and laundry.',
          es: 'Bombas para sólidos en baños y lavanderías de sótano.',
        },
        icon: 'CircleDot',
      },
    ],
    process: [
      {
        headline: {en: 'Site visit', es: 'Visita al sitio'},
        description: {
          en: 'We look at the existing pit, the discharge route, and the panel.',
          es: 'Revisamos el pozo existente, la ruta de descarga y el panel eléctrico.',
        },
      },
      {
        headline: {en: 'Estimate', es: 'Estimado'},
        description: {
          en: 'Itemized within 48 hours; emergency replacements quoted same day.',
          es: 'Detallado en 48 horas; reemplazos de emergencia el mismo día.',
        },
      },
      {
        headline: {en: 'Install', es: 'Instalación'},
        description: {
          en: 'Most installs finish in 4–6 hours. We test before we leave.',
          es: 'La mayoría termina en 4–6 horas. Probamos antes de irnos.',
        },
      },
      {
        headline: {en: 'Annual service reminder', es: 'Recordatorio anual'},
        description: {
          en: 'We text you each spring before storm season to schedule a check.',
          es: 'Te enviamos un mensaje cada primavera antes de la temporada de tormentas.',
        },
      },
    ],
    whyUs: [
      {
        headline: {en: 'Emergency response', es: 'Respuesta de emergencia'},
        description: {
          en: 'Same-day swap for a failed pump during heavy rain.',
          es: 'Cambio el mismo día por bomba fallida en lluvia fuerte.',
        },
        icon: 'Zap',
      },
      {
        headline: {en: 'Cast-iron, not plastic', es: 'Hierro fundido, no plástico'},
        description: {
          en: 'We install cast-iron primary pumps standard — they outlast plastic 3-to-1.',
          es: 'Instalamos bombas de hierro fundido por defecto — duran 3 veces más que las plásticas.',
        },
        icon: 'Award',
      },
      {
        headline: {en: 'Battery backup as standard offer', es: 'Respaldo con batería como opción'},
        description: {
          en: 'Every quote includes a battery-backup option, priced separately.',
          es: 'Cada cotización incluye opción de respaldo con batería, con precio aparte.',
        },
        icon: 'BatteryCharging',
      },
    ],
    pricing: {mode: 'explainer', explainerFactors: GENERIC_FACTORS},
    projects: [
      {
        title: {en: 'Naperville dual-pump install', es: 'Instalación de doble bomba en Naperville'},
        meta: {en: 'Naperville · 2024', es: 'Naperville · 2024'},
        imageKey: 'property-enhancement-1',
      },
      {
        title: {en: 'Aurora emergency replacement', es: 'Reemplazo de emergencia en Aurora'},
        meta: {en: 'Aurora · 2024', es: 'Aurora · 2024'},
        imageKey: 'landscape-maintenance-2',
      },
      {
        title: {en: 'Wheaton sewage ejector', es: 'Bomba eyectora en Wheaton'},
        meta: {en: 'Wheaton · 2024', es: 'Wheaton · 2024'},
        imageKey: 'property-enhancement-2',
      },
    ],
    related: ['basement-waterproofing', 'yard-drainage', 'crawl-spaces'],
    projectsTag: 'sump-pumps',
  },

  {
    slug: 'yard-drainage',
    division: 'waterproofing',
    icon: 'Waves',
    name: {en: 'Yard Drainage', es: 'Drenaje del Jardín'},
    photoAlt: {
      en: 'Corrugated drainage pipe bedded in gravel within an open excavated trench, before backfilling.',
      es: 'Tubería de drenaje corrugada asentada en grava dentro de una zanja excavada abierta, antes del relleno.',
    },
    hero: {
      h1: {
        en: 'Yard Drainage in DuPage County.',
        es: 'Drenaje del Jardín en DuPage County.',
      },
      subhead: {
        en: 'French drains, drain tile, downspout extensions, and grading. We follow the water from the roof to the curb — and fix the actual problem, not the symptom.',
        es: 'Drenajes franceses, tubería de drenaje, extensiones de bajantes y nivelación. Seguimos el agua del techo a la calle — arreglamos el problema, no el síntoma.',
      },
      photoSlot: 'service.yard-drainage.16x9',
    },
    whatsIncluded: [
      {
        headline: {en: 'French drain systems', es: 'Drenajes franceses'},
        description: {
          en: 'Perforated pipe in a gravel trench, wrapped in fabric, daylighted out.',
          es: 'Tubería perforada en zanja de grava, envuelta en tela, salida al exterior.',
        },
        icon: 'Waves',
      },
      {
        headline: {en: 'Drain tile', es: 'Tubería de drenaje'},
        description: {
          en: 'Solid PVC drain lines connecting catch basins and downspouts to daylight.',
          es: 'Tubería sólida de PVC conectando rejillas y bajantes a salida exterior.',
        },
        icon: 'GitBranch',
      },
      {
        headline: {en: 'Sump pump discharge lines', es: 'Líneas de descarga del sumidero'},
        description: {
          en: 'Frozen-pipe-resistant routing well away from the foundation.',
          es: 'Ruta resistente a congelamiento, lejos de los cimientos.',
        },
        icon: 'Snowflake',
      },
      {
        headline: {en: 'Window well drains', es: 'Drenajes de pozos de ventana'},
        description: {
          en: 'Tied into the perimeter drain tile so wells never fill.',
          es: 'Conectados al drenaje perimetral para que los pozos no se llenen.',
        },
        icon: 'CircleDot',
      },
      {
        headline: {en: 'Downspout drain lines', es: 'Líneas de bajantes'},
        description: {
          en: 'Buried 4" PVC carries roof water to the curb or a pop-up emitter.',
          es: 'PVC enterrado de 4" lleva el agua del techo al borde o a un emisor.',
        },
        icon: 'ArrowDownRight',
      },
      {
        headline: {en: 'Grate & pop-up drains', es: 'Rejillas y emisores'},
        description: {
          en: 'Surface inlets at low spots; pop-up outlets at the discharge.',
          es: 'Entradas en superficie en puntos bajos; emisores a la salida.',
        },
        icon: 'CircleEqual',
      },
    ],
    process: [
      {
        headline: {en: 'Walk the lot in rain', es: 'Recorrer en lluvia'},
        description: {
          en: 'We schedule the site visit during or right after rain when possible.',
          es: 'Programamos la visita durante o justo después de la lluvia cuando es posible.',
        },
      },
      {
        headline: {en: 'Map the flow', es: 'Mapear el flujo'},
        description: {
          en: 'Where water enters, pools, and exits — drawn on a site plan.',
          es: 'Dónde entra, se acumula y sale el agua — dibujado en un plano.',
        },
      },
      {
        headline: {en: 'Install', es: 'Instalación'},
        description: {
          en: 'Low-impact trenching; we replace sod, not bare-dirt-and-leave.',
          es: 'Zanjeo de bajo impacto; reponemos césped, no dejamos tierra expuesta.',
        },
      },
      {
        headline: {en: 'Verify in next storm', es: 'Verificar en la siguiente tormenta'},
        description: {
          en: 'We follow up after the next 1" storm — fix anything that didn\'t hold.',
          es: 'Volvemos tras la siguiente tormenta de 1" — arreglamos lo que no aguantó.',
        },
      },
    ],
    whyUs: [
      {
        headline: {en: 'We diagnose in rain', es: 'Diagnosticamos en lluvia'},
        description: {
          en: 'You can\'t fix drainage by looking at a dry yard.',
          es: 'No puedes arreglar drenaje mirando un patio seco.',
        },
        icon: 'CloudRain',
      },
      {
        headline: {en: 'Sod replaced, not abandoned', es: 'Césped repuesto'},
        description: {
          en: 'Trenches close with new sod, not bare dirt.',
          es: 'Las zanjas cierran con césped nuevo, no tierra expuesta.',
        },
        icon: 'Sprout',
      },
      {
        headline: {en: 'Post-storm verification', es: 'Verificación post-tormenta'},
        description: {
          en: 'We come back after the next 1" event to confirm it held.',
          es: 'Regresamos tras la siguiente tormenta de 1" para confirmar.',
        },
        icon: 'CheckCircle',
      },
    ],
    pricing: {mode: 'explainer', explainerFactors: GENERIC_FACTORS},
    projects: [
      {
        title: {en: 'Batavia French drain', es: 'Drenaje francés en Batavia'},
        meta: {en: 'Batavia · 2024', es: 'Batavia · 2024'},
        imageKey: 'landscape-maintenance-1',
      },
      {
        title: {en: 'Naperville downspout reroute', es: 'Re-ruta de bajantes en Naperville'},
        meta: {en: 'Naperville · 2024', es: 'Naperville · 2024'},
        imageKey: 'property-enhancement-1',
      },
      {
        title: {en: 'Aurora yard grading', es: 'Nivelación en Aurora'},
        meta: {en: 'Aurora · 2024', es: 'Aurora · 2024'},
        imageKey: 'seasonal-cleanup-1',
      },
    ],
    related: ['basement-waterproofing', 'sump-pumps', 'gutter-services'],
    projectsTag: 'yard-drainage',
  },

  {
    slug: 'gutter-services',
    division: 'waterproofing',
    icon: 'CloudRain',
    name: {en: 'Gutter Services', es: 'Servicios de Canaletas'},
    photoAlt: {
      en: 'Green-painted metal rain gutter and downspout running along the eave and down the wall of a residential building.',
      es: 'Canaleta y bajante de lluvia de metal pintado de verde que recorren el alero y bajan por la pared de un edificio residencial.',
    },
    hero: {
      h1: {
        en: 'Gutter Services in DuPage County.',
        es: 'Servicios de Canaletas en DuPage County.',
      },
      subhead: {
        en: 'Install, repair, guard, and extend. Gutters that hold leaves overflow during the storms you bought them for — we fix the system, not just the gutters.',
        es: 'Instalación, reparación, protección y extensión. Las canaletas tapadas se desbordan en las tormentas para las que las compraste — arreglamos el sistema, no solo las canaletas.',
      },
      photoSlot: 'service.gutter-services.16x9',
    },
    whatsIncluded: [
      {
        headline: {en: 'Gutter installation', es: 'Instalación de canaletas'},
        description: {
          en: 'Seamless 5" or 6" K-style aluminum, hidden hangers every 24".',
          es: 'Canaletas K-style de aluminio sin costuras 5" o 6", soportes ocultos cada 24".',
        },
        icon: 'CloudRain',
      },
      {
        headline: {en: 'Gutter repair', es: 'Reparación de canaletas'},
        description: {
          en: 'Re-pitch, re-hang, seam reseal, end-cap replacement.',
          es: 'Re-inclinación, re-colocación, sellado de juntas, reemplazo de tapas.',
        },
        icon: 'Wrench',
      },
      {
        headline: {en: 'Gutter guard systems', es: 'Sistemas de protección'},
        description: {
          en: 'Micro-mesh guards that keep leaves out without choking water flow.',
          es: 'Mallas finas que mantienen las hojas afuera sin ahogar el flujo.',
        },
        icon: 'Grid3x3',
      },
      {
        headline: {en: 'Downspout extensions', es: 'Extensiones de bajantes'},
        description: {
          en: 'Hard-piped or hinged extensions to move water 6+ ft from the foundation.',
          es: 'Extensiones rígidas o articuladas para alejar el agua 6+ pies de los cimientos.',
        },
        icon: 'ArrowDownRight',
      },
      {
        headline: {en: 'Buried downspout lines', es: 'Líneas de bajantes enterradas'},
        description: {
          en: 'Buried 4" PVC carries roof water to the street or a pop-up emitter.',
          es: 'PVC enterrado de 4" lleva el agua del techo a la calle o a un emisor.',
        },
        icon: 'CircleDot',
      },
    ],
    process: [
      {
        headline: {en: 'Inspection', es: 'Inspección'},
        description: {
          en: 'Roof-edge walk, downspout-route check, fascia condition.',
          es: 'Revisión del borde del techo, ruta de bajantes y condición de la fascia.',
        },
      },
      {
        headline: {en: 'Estimate', es: 'Estimado'},
        description: {
          en: 'Itemized within 48 hours. Color samples for fascia match.',
          es: 'Detallado en 48 horas. Muestras de color para hacer juego con la fascia.',
        },
      },
      {
        headline: {en: 'Install', es: 'Instalación'},
        description: {
          en: 'Most houses done in one day. We haul off the old material.',
          es: 'La mayoría de las casas en un día. Retiramos el material viejo.',
        },
      },
      {
        headline: {en: 'Post-storm check', es: 'Revisión post-tormenta'},
        description: {
          en: 'Free check after your first heavy storm to verify everything holds.',
          es: 'Revisión gratis tras la primera tormenta fuerte para verificar.',
        },
      },
    ],
    whyUs: [
      {
        headline: {en: 'Seamless on-site', es: 'Sin costuras en sitio'},
        description: {
          en: 'We bring the brake to your driveway and form gutters to exact length.',
          es: 'Llevamos la formadora a tu entrada y formamos canaletas a la medida exacta.',
        },
        icon: 'Ruler',
      },
      {
        headline: {en: 'Hidden hangers, not spikes', es: 'Soportes ocultos, no clavos'},
        description: {
          en: 'Hidden hangers every 24" — no sag, no pull-out over 20 years.',
          es: 'Soportes ocultos cada 24" — no se hunden ni se sueltan en 20 años.',
        },
        icon: 'Anchor',
      },
      {
        headline: {en: 'One-day finish', es: 'Terminado en un día'},
        description: {
          en: 'Most installs start at 7am and finish by 3pm same day.',
          es: 'La mayoría empieza a las 7am y termina a las 3pm el mismo día.',
        },
        icon: 'Clock',
      },
    ],
    pricing: {mode: 'explainer', explainerFactors: GENERIC_FACTORS},
    projects: [
      {
        title: {en: 'Wheaton seamless install', es: 'Instalación sin costuras en Wheaton'},
        meta: {en: 'Wheaton · 2024', es: 'Wheaton · 2024'},
        imageKey: 'seasonal-cleanup-1',
      },
      {
        title: {en: 'Aurora micro-mesh guards', es: 'Mallas finas en Aurora'},
        meta: {en: 'Aurora · 2024', es: 'Aurora · 2024'},
        imageKey: 'property-enhancement-1',
      },
      {
        title: {en: 'Naperville buried downspouts', es: 'Bajantes enterradas en Naperville'},
        meta: {en: 'Naperville · 2024', es: 'Naperville · 2024'},
        imageKey: 'landscape-maintenance-1',
      },
    ],
    related: ['yard-drainage', 'basement-waterproofing', 'window-wells'],
    projectsTag: 'gutter-services',
  },

  {
    slug: 'window-wells',
    division: 'waterproofing',
    icon: 'Square',
    name: {en: 'Window Wells', es: 'Pozos de Ventana'},
    photoAlt: {
      en: 'Low windows with stone sills set near ground level in the brick exterior walls of a building light-well.',
      es: 'Ventanas bajas con alféizares de piedra situadas casi al nivel del suelo en las paredes exteriores de ladrillo del patio de luces de un edificio.',
    },
    hero: {
      h1: {
        en: 'Window Wells in DuPage County.',
        es: 'Pozos de Ventana en DuPage County.',
      },
      subhead: {
        en: 'New wells, drains, liners, covers, and egress upgrades. We tie every well into the perimeter drain so it actually drains.',
        es: 'Pozos nuevos, drenajes, recubrimientos, tapas y mejoras de escape. Conectamos cada pozo al drenaje perimetral para que realmente drene.',
      },
      photoSlot: 'service.window-wells.16x9',
    },
    whatsIncluded: [
      {
        headline: {en: 'Window well installation', es: 'Instalación de pozos'},
        description: {
          en: 'Galvanized steel or composite wells set in clean gravel base.',
          es: 'Pozos de acero galvanizado o compuesto sobre base de grava limpia.',
        },
        icon: 'Square',
      },
      {
        headline: {en: 'Window well drainage', es: 'Drenaje del pozo'},
        description: {
          en: 'Each well tied into the perimeter drain or a dedicated dry well.',
          es: 'Cada pozo conectado al drenaje perimetral o a un pozo seco dedicado.',
        },
        icon: 'CircleDot',
      },
      {
        headline: {en: 'Window well liners', es: 'Recubrimientos'},
        description: {
          en: 'Composite liner inserts for rusted or stained galvanized wells.',
          es: 'Inserciones de compuesto para pozos oxidados o manchados.',
        },
        icon: 'Layers',
      },
      {
        headline: {en: 'Egress windows', es: 'Ventanas de escape'},
        description: {
          en: 'Code-compliant egress for finished basements — cut, frame, install.',
          es: 'Escapes según código para sótanos terminados — corte, marco, instalación.',
        },
        icon: 'DoorOpen',
      },
      {
        headline: {en: 'Window well repair', es: 'Reparación de pozos'},
        description: {
          en: 'Re-pin loose wells, replace failed caulking, restore the seal.',
          es: 'Re-anclar pozos sueltos, reemplazar sellador fallido, restaurar el sello.',
        },
        icon: 'Wrench',
      },
    ],
    process: [
      {
        headline: {en: 'Site visit', es: 'Visita al sitio'},
        description: {
          en: 'Measure each well, check the drain status and the foundation seal.',
          es: 'Medimos cada pozo, revisamos el estado del drenaje y el sello del cimiento.',
        },
      },
      {
        headline: {en: 'Estimate', es: 'Estimado'},
        description: {
          en: 'Itemized within 48 hours. Egress permits priced separately.',
          es: 'Detallado en 48 horas. Permisos de escape cotizados aparte.',
        },
      },
      {
        headline: {en: 'Install', es: 'Instalación'},
        description: {
          en: 'Most wells installed in half a day. Egress windows in 1–2 days.',
          es: 'La mayoría de los pozos en medio día. Ventanas de escape en 1–2 días.',
        },
      },
      {
        headline: {en: 'Cover + walkthrough', es: 'Tapa y recorrido'},
        description: {
          en: 'Polycarbonate cover fitted; we walk you through the egress release.',
          es: 'Tapa de policarbonato instalada; te mostramos el mecanismo de escape.',
        },
      },
    ],
    whyUs: [
      {
        headline: {en: 'Every well drains', es: 'Todos los pozos drenan'},
        description: {
          en: 'We don\'t install wells without tying them into a drain — period.',
          es: 'No instalamos pozos sin conectarlos a un drenaje — punto.',
        },
        icon: 'Waves',
      },
      {
        headline: {en: 'Code-compliant egress', es: 'Escapes según código'},
        description: {
          en: 'IL residential code met — useful for finished-basement permits.',
          es: 'Cumple código residencial de IL — útil para permisos de sótanos terminados.',
        },
        icon: 'BadgeCheck',
      },
      {
        headline: {en: 'Polycarbonate covers standard', es: 'Tapas de policarbonato'},
        description: {
          en: 'Clear cover lets light through while keeping leaves and animals out.',
          es: 'Tapa transparente que deja pasar luz y bloquea hojas y animales.',
        },
        icon: 'Shield',
      },
    ],
    pricing: {mode: 'explainer', explainerFactors: GENERIC_FACTORS},
    projects: [
      {
        title: {en: 'Wheaton egress upgrade', es: 'Mejora de escape en Wheaton'},
        meta: {en: 'Wheaton · 2024', es: 'Wheaton · 2024'},
        imageKey: 'property-enhancement-1',
      },
      {
        title: {en: 'Aurora 4-well refresh', es: 'Renovación de 4 pozos en Aurora'},
        meta: {en: 'Aurora · 2024', es: 'Aurora · 2024'},
        imageKey: 'landscape-maintenance-1',
      },
      {
        title: {en: 'Naperville drainage retrofit', es: 'Retrofit de drenaje en Naperville'},
        meta: {en: 'Naperville · 2024', es: 'Naperville · 2024'},
        imageKey: 'property-enhancement-2',
      },
    ],
    related: ['basement-waterproofing', 'yard-drainage', 'crawl-spaces'],
    projectsTag: 'window-wells',
  },

  {
    slug: 'crawl-spaces',
    division: 'waterproofing',
    icon: 'Home',
    name: {en: 'Crawl Spaces', es: 'Espacios Bajo el Piso'},
    photoAlt: {
      en: "An open crawl-space access hatch at the base of a home's shingled exterior wall, with a person crouched beside the opening.",
      es: 'Una trampilla de acceso abierta al espacio bajo el piso en la base de la pared exterior con tejuelas de una casa, con una persona agachada junto a la abertura.',
    },
    hero: {
      h1: {
        en: 'Crawl Space Encapsulation in DuPage.',
        es: 'Encapsulación de espacios bajo el piso en DuPage.',
      },
      subhead: {
        en: 'Encapsulation, insulation, vapor barriers, and dehumidification. We turn a damp crawl into conditioned storage that doesn\'t feed mold to the rooms above it.',
        es: 'Encapsulación, aislamiento, barreras de vapor y deshumidificación. Convertimos un espacio bajo el piso húmedo en almacenamiento acondicionado que no alimenta moho hacia los cuartos de arriba.',
      },
      photoSlot: 'service.crawl-spaces.16x9',
    },
    whatsIncluded: [
      {
        headline: {en: 'Crawl space encapsulation', es: 'Encapsulación'},
        description: {
          en: '20-mil reinforced liner on walls and floor, mechanically fastened.',
          es: 'Liner reforzado de 20 mil en muros y piso, sujetado mecánicamente.',
        },
        icon: 'Package',
      },
      {
        headline: {en: 'Insulation', es: 'Aislamiento'},
        description: {
          en: 'Closed-cell foam on rim joists; foil-faced board on walls when needed.',
          es: 'Espuma de celda cerrada en viguetas; tablero con foil en muros si aplica.',
        },
        icon: 'Layers',
      },
      {
        headline: {en: 'Vapor barrier installation', es: 'Barrera de vapor'},
        description: {
          en: 'Sealed at the wall-to-floor seam — no soil moisture leaks through.',
          es: 'Sellada en la unión muro-piso — sin escape de humedad del suelo.',
        },
        icon: 'Shield',
      },
      {
        headline: {en: 'Mold remediation', es: 'Remediación de moho'},
        description: {
          en: 'IICRC-protocol cleaning, HEPA vacuum, antimicrobial treatment.',
          es: 'Limpieza protocolo IICRC, aspirado HEPA, tratamiento antimicrobiano.',
        },
        icon: 'Sparkles',
      },
      {
        headline: {en: 'Dehumidifier installation', es: 'Instalación de deshumidificador'},
        description: {
          en: 'Energy-Star unit sized to the cubic footage, condensate routed out.',
          es: 'Unidad Energy-Star dimensionada al volumen, condensado dirigido afuera.',
        },
        icon: 'Wind',
      },
    ],
    process: [
      {
        headline: {en: 'Inspection', es: 'Inspección'},
        description: {
          en: 'Crawl entry, moisture readings, mold check, structural look.',
          es: 'Entrada al espacio bajo el piso, lecturas de humedad, revisión de moho y estructura.',
        },
      },
      {
        headline: {en: 'Plan + estimate', es: 'Plan y estimado'},
        description: {
          en: 'Itemized in 48 hours: liner, insulation, dehu, mold treatment as needed.',
          es: 'Detallado en 48 horas: liner, aislamiento, deshumidificador, tratamiento si aplica.',
        },
      },
      {
        headline: {en: 'Install', es: 'Instalación'},
        description: {
          en: 'Most jobs complete in 3–5 days. We bag and haul all debris.',
          es: 'La mayoría termina en 3–5 días. Sacamos todos los escombros.',
        },
      },
      {
        headline: {en: 'Annual humidity check', es: 'Revisión anual de humedad'},
        description: {
          en: 'Free annual return visit to verify the dehu is holding RH below 55%.',
          es: 'Visita anual gratis para verificar que la humedad relativa se mantiene bajo 55%.',
        },
      },
    ],
    whyUs: [
      {
        headline: {en: '20-mil liner standard', es: 'Liner de 20 mil estándar'},
        description: {
          en: 'Most contractors install 6-mil; we install 20-mil reinforced.',
          es: 'La mayoría instala 6 mil; nosotros instalamos 20 mil reforzado.',
        },
        icon: 'Award',
      },
      {
        headline: {en: 'IICRC mold protocol', es: 'Protocolo IICRC para moho'},
        description: {
          en: 'Industry-standard cleaning, not a shortcut bleach spray.',
          es: 'Limpieza estándar de la industria, no atajos con cloro.',
        },
        icon: 'BadgeCheck',
      },
      {
        headline: {en: 'Annual check included', es: 'Revisión anual incluida'},
        description: {
          en: "We come back yearly to confirm the dehu is doing its job.",
          es: 'Volvemos cada año para confirmar que el deshumidificador hace su trabajo.',
        },
        icon: 'Repeat',
      },
    ],
    pricing: {mode: 'explainer', explainerFactors: GENERIC_FACTORS},
    projects: [
      {
        title: {en: 'Wheaton full encapsulation', es: 'Encapsulación completa en Wheaton'},
        meta: {en: 'Wheaton · 2024', es: 'Wheaton · 2024'},
        imageKey: 'property-enhancement-1',
      },
      {
        title: {en: 'Aurora mold remediation', es: 'Remediación de moho en Aurora'},
        meta: {en: 'Aurora · 2024', es: 'Aurora · 2024'},
        imageKey: 'landscape-maintenance-1',
      },
      {
        title: {en: 'Naperville dehu retrofit', es: 'Actualización de deshumidificador en Naperville'},
        meta: {en: 'Naperville · 2024', es: 'Naperville · 2024'},
        imageKey: 'property-enhancement-2',
      },
    ],
    related: ['basement-waterproofing', 'foundation-repair', 'humidity-control'],
    projectsTag: 'crawl-spaces',
  },

  {
    slug: 'concrete-raising',
    division: 'waterproofing',
    icon: 'ArrowUp',
    name: {en: 'Concrete Raising', es: 'Nivelación de Concreto'},
    photoAlt: {
      en: 'A cracked and crazed concrete pavement surface strewn with fallen yellow flower petals.',
      es: 'Una superficie de pavimento de hormigón agrietada y cuarteada, cubierta de pétalos amarillos de flores caídos.',
    },
    hero: {
      h1: {
        en: 'Concrete Raising in DuPage County.',
        es: 'Nivelación de Concreto en DuPage County.',
      },
      subhead: {
        en: 'Mudjacking, polyurethane foam lifting, sealing, and leveling. We lift sunken slabs back into place for a fraction of replacement cost.',
        es: 'Mudjacking, levantamiento con espuma de poliuretano, sellado y nivelación. Levantamos losas hundidas a una fracción del costo de reemplazo.',
      },
      photoSlot: 'service.concrete-raising.16x9',
    },
    whatsIncluded: [
      {
        headline: {en: 'Mudjacking', es: 'Mudjacking'},
        description: {
          en: 'Slurry of soil + cement pumped under the slab through small ports.',
          es: 'Mezcla de tierra y cemento bombeada bajo la losa por puertos pequeños.',
        },
        icon: 'Layers',
      },
      {
        headline: {en: 'Polyurethane foam lifting', es: 'Levantamiento con espuma'},
        description: {
          en: 'Expanding foam — lighter, faster cure, no soil-displacement risk.',
          es: 'Espuma expansiva — más liviana, fragua más rápido, sin desplazamiento.',
        },
        icon: 'Droplet',
      },
      {
        headline: {en: 'Concrete sealing & repair', es: 'Sellado y reparación de concreto'},
        description: {
          en: 'Crack seal, joint caulk, surface sealer to prevent re-settling.',
          es: 'Sellado de grietas, juntas y superficie para prevenir asentamiento.',
        },
        icon: 'PaintBucket',
      },
      {
        headline: {en: 'Sidewalk & driveway leveling', es: 'Nivelación de aceras y entradas'},
        description: {
          en: 'Trip-hazard mitigation; we re-level slabs back to grade.',
          es: 'Mitigación de tropiezos; renivelamos las losas al nivel original.',
        },
        icon: 'AlignJustify',
      },
    ],
    process: [
      {
        headline: {en: 'Site visit', es: 'Visita al sitio'},
        description: {
          en: 'Measure slab tilt, photograph crack pattern, check void cause.',
          es: 'Medimos la inclinación, fotografiamos las grietas, revisamos la causa del vacío.',
        },
      },
      {
        headline: {en: 'Method recommendation', es: 'Recomendación de método'},
        description: {
          en: 'Mudjack for big slabs over stable soil; foam for tight access or weak soil.',
          es: 'Mudjack para losas grandes sobre suelo estable; espuma para acceso difícil o suelo débil.',
        },
      },
      {
        headline: {en: 'Lift', es: 'Levantamiento'},
        description: {
          en: 'Most slabs raised in under 4 hours; use is restored same-day for foam.',
          es: 'La mayoría se levanta en menos de 4 horas; uso restaurado el mismo día con espuma.',
        },
      },
      {
        headline: {en: 'Seal + warranty', es: 'Sellado y garantía'},
        description: {
          en: 'Joints and ports sealed; written warranty against re-settling.',
          es: 'Juntas y puertos sellados; garantía escrita contra re-asentamiento.',
        },
      },
    ],
    whyUs: [
      {
        headline: {en: 'Two methods, one quote', es: 'Dos métodos, una cotización'},
        description: {
          en: 'We quote both mudjack and foam — you pick the right tool for the job.',
          es: 'Cotizamos ambos métodos — eliges la herramienta correcta para el trabajo.',
        },
        icon: 'GitFork',
      },
      {
        headline: {en: 'Same-day use', es: 'Uso el mismo día'},
        description: {
          en: 'Foam-lifted slabs are driveable inside 30 minutes.',
          es: 'Las losas levantadas con espuma se pueden manejar en 30 minutos.',
        },
        icon: 'Clock',
      },
      {
        headline: {en: 'Written warranty', es: 'Garantía por escrito'},
        description: {
          en: '5-year warranty against re-settling on most residential slabs.',
          es: 'Garantía de 5 años contra re-asentamiento en la mayoría de losas residenciales.',
        },
        icon: 'ShieldCheck',
      },
    ],
    pricing: {mode: 'explainer', explainerFactors: GENERIC_FACTORS},
    projects: [
      {
        title: {en: 'Aurora driveway leveling', es: 'Nivelación de entrada en Aurora'},
        meta: {en: 'Aurora · 2024', es: 'Aurora · 2024'},
        imageKey: 'driveways-1',
      },
      {
        title: {en: 'Naperville sidewalk lift', es: 'Levantamiento de acera en Naperville'},
        meta: {en: 'Naperville · 2024', es: 'Naperville · 2024'},
        imageKey: 'patios-walkways-1',
      },
      {
        title: {en: 'Wheaton pool deck reset', es: 'Renivelación de borde de alberca en Wheaton'},
        meta: {en: 'Wheaton · 2024', es: 'Wheaton · 2024'},
        imageKey: 'patios-walkways-2',
      },
    ],
    related: ['foundation-repair', 'yard-drainage', 'basement-waterproofing'],
    projectsTag: 'concrete-raising',
  },

  {
    slug: 'humidity-control',
    division: 'waterproofing',
    icon: 'Wind',
    name: {en: 'Humidity Control', es: 'Control de Humedad'},
    photoAlt: {
      en: 'Heavy condensation and running water droplets covering the interior surface of a window pane.',
      es: 'Condensación intensa y gotas de agua escurriendo que cubren la superficie interior del cristal de una ventana.',
    },
    hero: {
      h1: {
        en: 'Humidity Control in DuPage County.',
        es: 'Control de Humedad en DuPage County.',
      },
      subhead: {
        en: 'Dehumidifiers, air-quality testing, ventilation, and moisture monitoring. We size the equipment to the room, not the catalog page.',
        es: 'Deshumidificadores, pruebas de calidad del aire, ventilación y monitoreo. Dimensionamos el equipo al cuarto, no a la página del catálogo.',
      },
      photoSlot: 'service.humidity-control.16x9',
    },
    whatsIncluded: [
      {
        headline: {en: 'Dehumidifier installation', es: 'Instalación de deshumidificador'},
        description: {
          en: 'Energy-Star units sized by cubic footage with continuous drain routing.',
          es: 'Unidades Energy-Star dimensionadas por volumen, con drenaje continuo.',
        },
        icon: 'Wind',
      },
      {
        headline: {en: 'Air quality testing', es: 'Pruebas de calidad del aire'},
        description: {
          en: 'Lab-grade meter for RH, particulate count, VOC presence.',
          es: 'Medidor de grado laboratorio para humedad, partículas y compuestos volátiles.',
        },
        icon: 'TestTube',
      },
      {
        headline: {en: 'Ventilation solutions', es: 'Soluciones de ventilación'},
        description: {
          en: 'Bath fans, dryer-vent routing, and supply-air balancing.',
          es: 'Extractores de baño, ruta de ventilación de secadora y balance de aire.',
        },
        icon: 'Fan',
      },
      {
        headline: {en: 'Moisture monitoring', es: 'Monitoreo de humedad'},
        description: {
          en: 'Wi-Fi-connected sensors with alerts when RH crosses your threshold.',
          es: 'Sensores Wi-Fi con alertas cuando la humedad supera tu umbral.',
        },
        icon: 'Activity',
      },
    ],
    process: [
      {
        headline: {en: 'Assessment', es: 'Evaluación'},
        description: {
          en: 'Site walk + 24-hour RH log to capture the daily swing.',
          es: 'Recorrido y registro de humedad por 24 horas para capturar el ciclo diario.',
        },
      },
      {
        headline: {en: 'Recommendation', es: 'Recomendación'},
        description: {
          en: 'Right-sized equipment with a target RH and a 30-day verification plan.',
          es: 'Equipo dimensionado correctamente con humedad objetivo y plan de verificación de 30 días.',
        },
      },
      {
        headline: {en: 'Install', es: 'Instalación'},
        description: {
          en: 'Most installs complete in half a day with continuous drain routing.',
          es: 'La mayoría termina en medio día con drenaje continuo.',
        },
      },
      {
        headline: {en: '30-day verification', es: 'Verificación de 30 días'},
        description: {
          en: 'We pull the sensor data 30 days in to confirm we hit target RH.',
          es: 'Revisamos los datos del sensor a 30 días para confirmar la humedad objetivo.',
        },
      },
    ],
    whyUs: [
      {
        headline: {en: 'Sized by data, not vibes', es: 'Dimensionado por datos'},
        description: {
          en: 'We log 24 hours of RH before sizing the unit — not a guess.',
          es: 'Registramos 24 horas de humedad antes de dimensionar — sin adivinar.',
        },
        icon: 'BarChart3',
      },
      {
        headline: {en: 'Continuous drain', es: 'Drenaje continuo'},
        description: {
          en: 'No bucket to empty — drain line plumbed to a sump or floor drain.',
          es: 'Sin cubeta que vaciar — línea de drenaje al sumidero o piso.',
        },
        icon: 'Droplet',
      },
      {
        headline: {en: '30-day data review', es: 'Revisión a 30 días'},
        description: {
          en: 'Wi-Fi sensor data confirms the install actually holds target RH.',
          es: 'Datos del sensor Wi-Fi confirman que la instalación mantiene la humedad.',
        },
        icon: 'CheckCircle',
      },
    ],
    pricing: {mode: 'explainer', explainerFactors: GENERIC_FACTORS},
    projects: [
      {
        title: {en: 'Wheaton whole-basement dehu', es: 'Deshu de sótano completo en Wheaton'},
        meta: {en: 'Wheaton · 2024', es: 'Wheaton · 2024'},
        imageKey: 'property-enhancement-1',
      },
      {
        title: {en: 'Naperville bath ventilation', es: 'Ventilación de baño en Naperville'},
        meta: {en: 'Naperville · 2024', es: 'Naperville · 2024'},
        imageKey: 'landscape-maintenance-2',
      },
      {
        title: {en: 'Aurora monitoring retrofit', es: 'Retrofit de monitoreo en Aurora'},
        meta: {en: 'Aurora · 2024', es: 'Aurora · 2024'},
        imageKey: 'property-enhancement-2',
      },
    ],
    related: ['crawl-spaces', 'basement-waterproofing', 'radon-mitigation'],
    projectsTag: 'humidity-control',
  },

  {
    slug: 'radon-mitigation',
    division: 'waterproofing',
    icon: 'Radiation',
    name: {en: 'Radon Mitigation', es: 'Mitigación de Radón'},
    photoAlt: {
      en: 'A grey-white PVC vent pipe protruding from the white stucco exterior wall of a building against a clear blue sky.',
      es: 'Un tubo de ventilación de PVC gris blanquecino que sobresale de la pared exterior de estuco blanco de un edificio contra un cielo azul despejado.',
    },
    hero: {
      h1: {
        en: 'Radon Mitigation in DuPage County.',
        es: 'Mitigación de Radón en DuPage County.',
      },
      subhead: {
        en: 'Testing, active soil depressurization, vent pipe install, and ongoing monitoring. Illinois-licensed mitigation contractors — DuPage averages above EPA action level.',
        es: 'Pruebas, despresurización activa del subsuelo, instalación de tubería de venteo y monitoreo continuo. Contratistas con licencia de Illinois — DuPage promedia por encima del nivel de acción de la EPA.',
      },
      photoSlot: 'service.radon-mitigation.16x9',
    },
    whatsIncluded: [
      {
        headline: {en: 'Radon testing', es: 'Prueba de radón'},
        description: {
          en: '48-hour continuous radon monitor placed by an IL-licensed measurement pro.',
          es: 'Monitor continuo de 48 horas colocado por un profesional licenciado en IL.',
        },
        icon: 'TestTube',
      },
      {
        headline: {en: 'Active soil depressurization', es: 'Despresurización activa del suelo'},
        description: {
          en: 'Suction point cored in the slab, fan-driven venting above the roofline.',
          es: 'Punto de succión en la losa, venteo con ventilador por encima del techo.',
        },
        icon: 'ArrowUpFromLine',
      },
      {
        headline: {en: 'Vent pipe installation', es: 'Instalación de tubería de venteo'},
        description: {
          en: '4" PVC routed exterior or interior, terminated above the roofline.',
          es: 'PVC de 4" exterior o interior, terminado sobre el nivel del techo.',
        },
        icon: 'Pipette',
      },
      {
        headline: {en: 'System monitoring', es: 'Monitoreo del sistema'},
        description: {
          en: 'Visible u-tube manometer + post-install retest to confirm reduction.',
          es: 'Manómetro en U visible + re-prueba posterior para confirmar reducción.',
        },
        icon: 'Activity',
      },
    ],
    process: [
      {
        headline: {en: 'Initial test', es: 'Prueba inicial'},
        description: {
          en: '48-hour test, lab-analyzed report with the radon level in pCi/L.',
          es: 'Prueba de 48 horas, informe de laboratorio con el nivel en pCi/L.',
        },
      },
      {
        headline: {en: 'Mitigation plan', es: 'Plan de mitigación'},
        description: {
          en: 'Suction-point location, pipe route, fan model — drawn before install.',
          es: 'Ubicación de succión, ruta de tubería, modelo de ventilador — antes de instalar.',
        },
      },
      {
        headline: {en: 'Install', es: 'Instalación'},
        description: {
          en: 'Most systems installed in one day. Manometer mounted at the panel.',
          es: 'La mayoría se instala en un día. Manómetro montado en el panel.',
        },
      },
      {
        headline: {en: 'Post-install retest', es: 'Re-prueba post-instalación'},
        description: {
          en: 'Free 48-hour retest 24 hours after install — confirms < 4 pCi/L.',
          es: 'Re-prueba gratis de 48 horas, 24 horas después de instalar — confirma < 4 pCi/L.',
        },
      },
    ],
    whyUs: [
      {
        headline: {en: 'IL-licensed mitigation', es: 'Mitigación con licencia de IL'},
        description: {
          en: 'Illinois IEMA-licensed mitigation pros — required for documented results.',
          es: 'Profesionales con licencia IEMA de Illinois — necesarios para resultados documentados.',
        },
        icon: 'BadgeCheck',
      },
      {
        headline: {en: 'Post-install retest free', es: 'Re-prueba post-instalación gratis'},
        description: {
          en: 'We confirm reduction with a real follow-up test, not a guarantee on paper.',
          es: 'Confirmamos la reducción con una prueba de seguimiento real, no una promesa.',
        },
        icon: 'CheckCircle',
      },
      {
        headline: {en: 'Above-roofline vent', es: 'Venteo sobre el techo'},
        description: {
          en: 'Code-compliant termination — not the cheaper sidewall shortcut.',
          es: 'Terminación según código — no el atajo más barato por la pared lateral.',
        },
        icon: 'ArrowUp',
      },
    ],
    pricing: {mode: 'explainer', explainerFactors: GENERIC_FACTORS},
    projects: [
      {
        title: {en: 'Wheaton mitigation install', es: 'Instalación en Wheaton'},
        meta: {en: 'Wheaton · 2024', es: 'Wheaton · 2024'},
        imageKey: 'property-enhancement-1',
      },
      {
        title: {en: 'Aurora real-estate pre-listing', es: 'Pre-listado de bienes raíces en Aurora'},
        meta: {en: 'Aurora · 2024', es: 'Aurora · 2024'},
        imageKey: 'landscape-maintenance-1',
      },
      {
        title: {en: 'Naperville garage-bunker fix', es: 'Solución en Naperville'},
        meta: {en: 'Naperville · 2024', es: 'Naperville · 2024'},
        imageKey: 'property-enhancement-2',
      },
    ],
    related: ['crawl-spaces', 'humidity-control', 'basement-waterproofing'],
    projectsTag: 'radon-mitigation',
  },

  // -------------------- SNOW REMOVAL (4 new) — Phase M.01d --------------------
  // These join the 2 existing snow-removal services (residential + commercial,
  // both `audience`-tagged). Slug `commercial-snow-plowing` renamed from the
  // candidate "snow-removal" to avoid the future /snow-removal/snow-removal/
  // double-slug under M.01e's /<division>/<slug>/ routes. ES uses `tú`.
  {
    slug: 'de-icing',
    division: 'snow-removal',
    icon: 'Droplets',
    name: {en: 'De-Icing', es: 'Deshielo'},
    photoAlt: {
      en: 'Close-up of coarse rock-salt crystals scattered across a dark surface — the granular material spread to de-ice snow- and ice-covered pavement.',
      es: 'Primer plano de gruesos cristales de sal de roca esparcidos sobre una superficie oscura — el material granular que se esparce para deshelar el pavimento cubierto de nieve y hielo.',
    },
    hero: {
      h1: {
        en: 'De-Icing in DuPage County.',
        es: 'Deshielo en DuPage County.',
      },
      subhead: {
        en: 'Salt and ice-melt application for driveways and walks. Pet-safe blends on request, rapid-response on storm events, 24/7 dispatch all winter.',
        es: 'Sal y derretidor de hielo en entradas y senderos. Mezclas pet-safe a pedido, respuesta rápida en tormentas, despacho 24/7 todo el invierno.',
      },
      photoSlot: 'service.de-icing.16x9',
    },
    whatsIncluded: [
      {
        headline: {en: 'Driveway salting', es: 'Sal en entrada'},
        description: {
          en: 'Calibrated spreader pass — no piles, no waste, no overspray on plants.',
          es: 'Pasada con esparcidor calibrado — sin pilas, sin desperdicio, sin daño a plantas.',
        },
        icon: 'Snowflake',
      },
      {
        headline: {en: 'Walkway + step de-icing', es: 'Deshielo en senderos y escalones'},
        description: {
          en: 'Hand-broadcast on walks, treads, and around door thresholds.',
          es: 'Esparcido a mano en senderos, escalones y umbrales de puertas.',
        },
        icon: 'Footprints',
      },
      {
        headline: {en: 'Pet-safe blends', es: 'Mezclas pet-safe'},
        description: {
          en: 'Calcium-magnesium acetate on request — kinder to paws and plantings.',
          es: 'Acetato de calcio-magnesio a pedido — mejor para patas y plantas.',
        },
        icon: 'Heart',
      },
      {
        headline: {en: 'Pre-storm application', es: 'Aplicación pre-tormenta'},
        description: {
          en: 'Anti-ice treatment 4–12 hours ahead of major storms when forecast warrants.',
          es: 'Tratamiento anti-hielo 4–12 horas antes de tormentas mayores cuando aplica.',
        },
        icon: 'Cloud',
      },
    ],
    process: [
      {
        headline: {en: 'Seasonal contract', es: 'Contrato de temporada'},
        description: {
          en: 'Sign once in October for the whole winter — fixed per-event rate.',
          es: 'Firma una vez en octubre para todo el invierno — tarifa fija por evento.',
        },
      },
      {
        headline: {en: 'Storm trigger', es: 'Activación por tormenta'},
        description: {
          en: 'Forecast + on-site verification triggers automatic dispatch.',
          es: 'Pronóstico y verificación en sitio activan el despacho automático.',
        },
      },
      {
        headline: {en: 'Service', es: 'Servicio'},
        description: {
          en: 'Treatment applied within 2 hours of the trigger.',
          es: 'Tratamiento aplicado dentro de 2 horas tras la activación.',
        },
      },
      {
        headline: {en: 'Post-event log', es: 'Bitácora post-evento'},
        description: {
          en: 'Photo + GPS log emailed to you after every service.',
          es: 'Registro con foto y GPS enviado por correo tras cada servicio.',
        },
      },
    ],
    whyUs: [
      {
        headline: {en: 'Calibrated spreaders', es: 'Esparcidores calibrados'},
        description: {
          en: 'No over-salt damage to concrete or plantings near the drive.',
          es: 'Sin daño por exceso de sal en concreto o plantas cercanas.',
        },
        icon: 'Gauge',
      },
      {
        headline: {en: 'Pet-safe option', es: 'Opción pet-safe'},
        description: {
          en: 'Pet-friendly blends priced inline — no surprise upcharge.',
          es: 'Mezclas amigables con mascotas con precio inline — sin recargos sorpresa.',
        },
        icon: 'Heart',
      },
      {
        headline: {en: 'Per-event log', es: 'Registro por evento'},
        description: {
          en: 'Photo + GPS proof of service — useful for HOAs and PMs.',
          es: 'Prueba de servicio con foto y GPS — útil para HOAs y administradores.',
        },
        icon: 'FileText',
      },
    ],
    pricing: {mode: 'explainer', explainerFactors: GENERIC_FACTORS},
    projects: [
      {
        title: {en: 'Naperville HOA winter program', es: 'Programa de invierno HOA en Naperville'},
        meta: {en: 'Naperville · 2023–2024', es: 'Naperville · 2023–2024'},
        imageKey: 'snow-removal-1',
      },
      {
        title: {en: 'Aurora pet-safe rotation', es: 'Rotación pet-safe en Aurora'},
        meta: {en: 'Aurora · 2023–2024', es: 'Aurora · 2023–2024'},
        imageKey: 'snow-removal-2',
      },
      {
        title: {en: 'Wheaton residential cluster', es: 'Cluster residencial en Wheaton'},
        meta: {en: 'Wheaton · 2023–2024', es: 'Wheaton · 2023–2024'},
        imageKey: 'commercial-snow-removal-1',
      },
    ],
    related: ['driveway-snow-removal', 'sidewalk-shoveling', 'commercial-snow-plowing'],
    projectsTag: 'de-icing',
  },

  {
    slug: 'sidewalk-shoveling',
    division: 'snow-removal',
    icon: 'Footprints',
    name: {en: 'Sidewalk Shoveling', es: 'Limpieza de Aceras'},
    photoAlt: {
      en: 'A person in a hooded winter coat shoveling deep snow from a walkway beside a house.',
      es: 'Una persona con un abrigo de invierno con capucha paleando nieve profunda de un sendero junto a una casa.',
    },
    hero: {
      h1: {
        en: 'Sidewalk Shoveling in DuPage County.',
        es: 'Limpieza de Aceras en DuPage County.',
      },
      subhead: {
        en: 'Manual sidewalk + walkway clearing for residential homes and HOAs. We get there before the morning commute — no exceptions, no missed visits.',
        es: 'Limpieza manual de senderos para hogares y HOAs. Llegamos antes del recorrido matutino — sin excepciones, sin visitas perdidas.',
      },
      photoSlot: 'service.sidewalk-shoveling.16x9',
    },
    whatsIncluded: [
      {
        headline: {en: 'Sidewalk clearing', es: 'Limpieza de senderos'},
        description: {
          en: 'Public-facing sidewalk shoveled curb-to-property-line.',
          es: 'Sendero público limpiado del borde a la línea de propiedad.',
        },
        icon: 'Footprints',
      },
      {
        headline: {en: 'Walkway + step clearing', es: 'Senderos y escalones'},
        description: {
          en: 'Front walk, side walks, and steps to door cleared by hand.',
          es: 'Senderos delanteros, laterales y escalones a la puerta limpiados a mano.',
        },
        icon: 'PersonStanding',
      },
      {
        headline: {en: 'Mail + delivery access', es: 'Acceso para correo y entregas'},
        description: {
          en: 'Path from sidewalk to mailbox and to the front porch.',
          es: 'Ruta desde sendero a buzón y al porche delantero.',
        },
        icon: 'Mail',
      },
      {
        headline: {en: 'De-icing if needed', es: 'Deshielo si aplica'},
        description: {
          en: 'Salt or pet-safe melt where treads remain slick after shoveling.',
          es: 'Sal o derretidor pet-safe donde los escalones quedan resbalosos.',
        },
        icon: 'Droplets',
      },
    ],
    process: [
      {
        headline: {en: 'Pre-season prep', es: 'Preparación pre-temporada'},
        description: {
          en: 'Mark walks and edges so they don\'t get cut into in October.',
          es: 'Marcamos senderos y bordes para no cortarlos en octubre.',
        },
      },
      {
        headline: {en: 'Storm trigger', es: 'Activación por tormenta'},
        description: {
          en: 'Forecast + on-site verification triggers dispatch by 5am.',
          es: 'Pronóstico y verificación en sitio activan el despacho para las 5am.',
        },
      },
      {
        headline: {en: 'Service', es: 'Servicio'},
        description: {
          en: 'Most homes done before 7am so the commute is clear.',
          es: 'La mayoría termina antes de las 7am para el recorrido matutino.',
        },
      },
      {
        headline: {en: 'Post-storm check', es: 'Revisión post-tormenta'},
        description: {
          en: 'Return pass to clear drift accumulation once snow stops.',
          es: 'Pasada de regreso para limpiar acumulación al detenerse la nieve.',
        },
      },
    ],
    whyUs: [
      {
        headline: {en: 'Pre-7am finish', es: 'Terminado antes de las 7am'},
        description: {
          en: 'Walks cleared before the morning commute, mail run, dog walk.',
          es: 'Senderos limpios antes del recorrido matutino, correo y paseos.',
        },
        icon: 'Clock',
      },
      {
        headline: {en: 'Hand-shoveled', es: 'Pala a mano'},
        description: {
          en: 'No snowblower scarring on stamped concrete or pavers.',
          es: 'Sin marcas de máquina en concreto estampado o adoquines.',
        },
        icon: 'Hand',
      },
      {
        headline: {en: 'HOA group rates', es: 'Tarifas grupales HOA'},
        description: {
          en: 'Multi-unit HOAs get a per-unit rate cut. We mow them in summer, too.',
          es: 'HOAs con varias unidades obtienen descuento por unidad. También cortamos en verano.',
        },
        icon: 'Users',
      },
    ],
    pricing: {mode: 'explainer', explainerFactors: GENERIC_FACTORS},
    projects: [
      {
        title: {en: 'Naperville cluster HOA', es: 'Cluster HOA en Naperville'},
        meta: {en: 'Naperville · 2023–2024', es: 'Naperville · 2023–2024'},
        imageKey: 'snow-removal-1',
      },
      {
        title: {en: 'Aurora elderly route', es: 'Ruta para adultos mayores en Aurora'},
        meta: {en: 'Aurora · 2023–2024', es: 'Aurora · 2023–2024'},
        imageKey: 'snow-removal-2',
      },
      {
        title: {en: 'Wheaton residential block', es: 'Cuadra residencial en Wheaton'},
        meta: {en: 'Wheaton · 2023–2024', es: 'Wheaton · 2023–2024'},
        imageKey: 'commercial-snow-removal-2',
      },
    ],
    related: ['driveway-snow-removal', 'de-icing', 'commercial-snow-plowing'],
    projectsTag: 'sidewalk-shoveling',
  },

  {
    slug: 'driveway-snow-removal',
    division: 'snow-removal',
    icon: 'Snowflake',
    name: {en: 'Driveway Snow Removal', es: 'Remoción de Nieve en Entradas'},
    photoAlt: {
      en: 'A person operating a two-stage snow blower to clear deep snow from a residential driveway.',
      es: 'Una persona operando una máquina quitanieves de dos etapas para despejar nieve profunda de la entrada de una casa.',
    },
    hero: {
      h1: {
        en: 'Driveway Snow Removal in DuPage.',
        es: 'Remoción de Nieve en Entradas en DuPage.',
      },
      subhead: {
        en: 'Single-family driveway plowing — seasonal contracts and per-event service. 2-inch trigger, 24/7 dispatch, 2-hour response after the trigger fires.',
        es: 'Limpieza de entradas residenciales — contratos de temporada y servicio por evento. Activación a 2 pulgadas, despacho 24/7, respuesta en 2 horas tras activación.',
      },
      photoSlot: 'service.driveway-snow-removal.16x9',
    },
    whatsIncluded: [
      {
        headline: {en: 'Driveway plow', es: 'Limpieza de entrada'},
        description: {
          en: 'Cleared to pavement, snow piled away from doors and walks.',
          es: 'Limpiado al pavimento, nieve apilada lejos de puertas y senderos.',
        },
        icon: 'Snowflake',
      },
      {
        headline: {en: 'Apron + curb cut', es: 'Acera y borde'},
        description: {
          en: 'Second pass after the village plow has come through.',
          es: 'Segunda pasada después de que pasa el quitanieves municipal.',
        },
        icon: 'Truck',
      },
      {
        headline: {en: '2-inch trigger', es: 'Activación a 2 pulgadas'},
        description: {
          en: 'We service every storm at or above 2 inches, automatically.',
          es: 'Servicio en cada tormenta de 2 pulgadas o más, automáticamente.',
        },
        icon: 'Ruler',
      },
      {
        headline: {en: 'Seasonal contract', es: 'Contrato de temporada'},
        description: {
          en: 'Flat-rate seasonal pricing — no per-event surprises in a heavy winter.',
          es: 'Tarifa fija por temporada — sin sorpresas por evento en un invierno fuerte.',
        },
        icon: 'CalendarRange',
      },
    ],
    process: [
      {
        headline: {en: 'Sign in October', es: 'Firma en octubre'},
        description: {
          en: 'Most contracts sign before Halloween. We mark drives in November.',
          es: 'La mayoría firma antes de Halloween. Marcamos entradas en noviembre.',
        },
      },
      {
        headline: {en: 'Storm trigger', es: 'Activación por tormenta'},
        description: {
          en: 'Forecast + on-site verification triggers automatic dispatch.',
          es: 'Pronóstico y verificación en sitio activan el despacho.',
        },
      },
      {
        headline: {en: 'Service', es: 'Servicio'},
        description: {
          en: 'Plow + clean-up pass inside 2 hours of the trigger.',
          es: 'Limpieza y pasada final dentro de 2 horas tras la activación.',
        },
      },
      {
        headline: {en: 'Apron return pass', es: 'Pasada de borde'},
        description: {
          en: 'Return pass after the village plow comes through.',
          es: 'Pasada de regreso después de que pasa el quitanieves municipal.',
        },
      },
    ],
    whyUs: [
      {
        headline: {en: '2-hour response', es: '2 horas de respuesta'},
        description: {
          en: 'You\'re served before most people are out of bed.',
          es: 'Atendido antes de que la mayoría se levante.',
        },
        icon: 'Clock',
      },
      {
        headline: {en: 'Apron return pass included', es: 'Pasada de borde incluida'},
        description: {
          en: 'Most contractors stop at one pass. We come back for the village pile.',
          es: 'La mayoría de contratistas se detiene en una pasada. Volvemos por la pila que deja el municipio.',
        },
        icon: 'Repeat',
      },
      {
        headline: {en: 'Insured fleet', es: 'Flotilla asegurada'},
        description: {
          en: 'Property-damage coverage on every plow on the road.',
          es: 'Cobertura por daños en cada vehículo de remoción de nieve.',
        },
        icon: 'ShieldCheck',
      },
    ],
    pricing: {mode: 'explainer', explainerFactors: GENERIC_FACTORS},
    projects: [
      {
        title: {en: 'Aurora 40-home subdivision', es: 'Subdivisión de 40 casas en Aurora'},
        meta: {en: 'Aurora · 2023–2024', es: 'Aurora · 2023–2024'},
        imageKey: 'snow-removal-1',
      },
      {
        title: {en: 'Naperville custom-driveway', es: 'Entrada personalizada en Naperville'},
        meta: {en: 'Naperville · 2023–2024', es: 'Naperville · 2023–2024'},
        imageKey: 'snow-removal-2',
      },
      {
        title: {en: 'Wheaton seasonal route', es: 'Ruta de temporada en Wheaton'},
        meta: {en: 'Wheaton · 2023–2024', es: 'Wheaton · 2023–2024'},
        imageKey: 'commercial-snow-removal-1',
      },
    ],
    related: ['de-icing', 'sidewalk-shoveling', 'commercial-snow-plowing'],
    projectsTag: 'driveway-snow-removal',
  },

  {
    slug: 'commercial-snow-plowing',
    division: 'snow-removal',
    icon: 'Building2',
    name: {en: 'Commercial Snow Plowing', es: 'Remoción Comercial de Nieve'},
    // Phase B-15 — dropped the `commercial-snow-removal` imageKey alias so this
    // service resolves to its own slug asset (hero-commercial-snow-plowing.jpg /
    // tiles/commercial-snow-plowing.jpg). The shared `commercial-snow-removal`
    // assets stay in place for the bolingbrook city + blog/resource surfaces.
    photoAlt: {
      en: 'A plow truck with a front plow blade clearing snow from an open paved area during heavy snowfall.',
      es: 'Un camión quitanieves con una pala frontal despejando nieve de una zona pavimentada abierta durante una fuerte nevada.',
    },
    hero: {
      h1: {
        en: 'Commercial Snow Plowing in DuPage.',
        es: 'Remoción Comercial de Nieve en DuPage.',
      },
      subhead: {
        en: 'Multi-property lots, HOA roadways, and property-management contracts. 24/7 storm response, ADA-compliant ice management, per-event documentation.',
        es: 'Lotes con múltiples propiedades, vías de HOA y contratos de administración. Respuesta 24/7, manejo de hielo según ADA, documentación por evento.',
      },
      photoSlot: 'service.commercial-snow-plowing.16x9',
    },
    whatsIncluded: [
      {
        headline: {en: 'Parking lot plowing', es: 'Limpieza de estacionamientos'},
        description: {
          en: 'Multi-truck dispatch sized to the lot — big lots get tandem plows.',
          es: 'Despacho de varios camiones según el lote — los grandes con quitanieves en tándem.',
        },
        icon: 'Truck',
      },
      {
        headline: {en: 'HOA roadway clearing', es: 'Limpieza de vías HOA'},
        description: {
          en: 'Private streets cleared curb-to-curb on the HOA\'s schedule.',
          es: 'Calles privadas limpiadas de borde a borde en el horario de la HOA.',
        },
        icon: 'Route',
      },
      {
        headline: {en: 'ADA ice management', es: 'Manejo de hielo ADA'},
        description: {
          en: 'Code-compliant entries, ramps, and accessible stalls treated first.',
          es: 'Entradas, rampas y plazas accesibles tratadas primero según código.',
        },
        icon: 'Accessibility',
      },
      {
        headline: {en: 'Per-event documentation', es: 'Documentación por evento'},
        description: {
          en: 'Photo log + GPS verification of every visit, emailed within 12 hours.',
          es: 'Registro fotográfico y GPS de cada visita, enviado en 12 horas.',
        },
        icon: 'FileText',
      },
      {
        headline: {en: 'Snow-pile management', es: 'Manejo de pilas de nieve'},
        description: {
          en: 'Pile-relocation passes mid-season so lot capacity stays usable.',
          es: 'Pasadas de reubicación de pilas a media temporada para mantener capacidad.',
        },
        icon: 'MoveRight',
      },
    ],
    process: [
      {
        headline: {en: 'Pre-season meeting', es: 'Reunión pre-temporada'},
        description: {
          en: 'Lot walk with the property manager, scope + COI in writing.',
          es: 'Recorrido del lote con el administrador, alcance y COI por escrito.',
        },
      },
      {
        headline: {en: 'Storm trigger', es: 'Activación por tormenta'},
        description: {
          en: 'Forecast + on-site verification triggers multi-truck dispatch.',
          es: 'Pronóstico y verificación activan el despacho de varios camiones.',
        },
      },
      {
        headline: {en: 'Service', es: 'Servicio'},
        description: {
          en: 'Plow + treat per the contracted SLA — usually 2 hours after trigger.',
          es: 'Limpieza y tratamiento según el SLA contratado — usualmente 2 horas tras activación.',
        },
      },
      {
        headline: {en: 'Per-event log', es: 'Registro por evento'},
        description: {
          en: 'Documentation emailed to the manager within 12 hours — useful for liability.',
          es: 'Documentación enviada al administrador en 12 horas — útil para responsabilidad civil.',
        },
      },
    ],
    whyUs: [
      {
        headline: {en: '24/7 dispatch', es: 'Despacho 24/7'},
        description: {
          en: 'Storm at 2am? We\'re already on the way.',
          es: '¿Tormenta a las 2am? Ya vamos en camino.',
        },
        icon: 'PhoneCall',
      },
      {
        headline: {en: 'ADA-compliant', es: 'Cumple ADA'},
        description: {
          en: 'Accessible entries and ramps prioritized — code-compliant ice management.',
          es: 'Entradas y rampas accesibles priorizadas — manejo de hielo según código.',
        },
        icon: 'Accessibility',
      },
      {
        headline: {en: 'COI on file before day 1', es: 'COI antes del primer día'},
        description: {
          en: 'Insurance certificate emailed during onboarding.',
          es: 'Certificado de seguro enviado durante la integración.',
        },
        icon: 'ShieldCheck',
      },
    ],
    pricing: {mode: 'explainer', explainerFactors: GENERIC_FACTORS},
    projects: [
      {
        title: {en: 'Lisle corporate park', es: 'Parque corporativo en Lisle'},
        meta: {en: 'Lisle · 2023–2024', es: 'Lisle · 2023–2024'},
        imageKey: 'commercial-snow-removal-1',
      },
      {
        title: {en: 'Bolingbrook retail center', es: 'Centro comercial en Bolingbrook'},
        meta: {en: 'Bolingbrook · 2023–2024', es: 'Bolingbrook · 2023–2024'},
        imageKey: 'commercial-snow-removal-2',
      },
      {
        title: {en: 'Aurora HOA roadways', es: 'Vías de HOA en Aurora'},
        meta: {en: 'Aurora · 2023–2024', es: 'Aurora · 2023–2024'},
        imageKey: 'snow-removal-1',
      },
    ],
    related: ['de-icing', 'driveway-snow-removal', 'sidewalk-shoveling'],
    projectsTag: 'commercial-snow-plowing',
  },

  {
    slug: 'conduit-installation',
    division: 'trenchless',
    icon: 'Cable',
    name: {en: 'Conduit Installation', es: 'Instalación de Conductos'},
    photoAlt: {
      en: 'Bundled lengths of grey PVC conduit staged on site before installation.',
      es: 'Tramos agrupados de conducto de PVC gris dispuestos en el sitio antes de la instalación.',
    },
    hero: {
      h1: {
        en: 'Conduit Installation in DuPage County.',
        es: 'Instalación de Conductos en DuPage County.',
      },
      subhead: {
        en: 'Underground PVC and HDPE conduit for power, fiber, low-voltage, and EV-charger runs — trenchless or open-cut. We locate before we dig and hand you a recorded as-built so the next crew knows exactly where the line sits.',
        es: 'Conducto subterráneo de PVC y HDPE para energía, fibra, bajo voltaje y cargadores EV — sin zanja o a cielo abierto. Localizamos antes de excavar y te entregamos un as-built registrado para que la próxima cuadrilla sepa exactamente dónde va la línea.',
      },
      photoSlot: 'service.conduit-installation.16x9',
    },
    whatsIncluded: [
      {
        headline: {en: 'PVC & HDPE conduit runs', es: 'Tramos de conducto PVC y HDPE'},
        description: {
          en: 'Schedule-40 PVC or fused HDPE sized to the run — trenchless bore or open-cut.',
          es: 'PVC cédula 40 o HDPE fusionado dimensionado al tramo — bore sin zanja o a cielo abierto.',
        },
        icon: 'Spline',
      },
      {
        headline: {en: 'Service to detached structures', es: 'Servicio a estructuras separadas'},
        description: {
          en: 'Power or data out to a detached garage, pool, shed, or new addition.',
          es: 'Energía o datos hasta un garaje separado, alberca, cobertizo o ampliación nueva.',
        },
        icon: 'Home',
      },
      {
        headline: {en: 'Low-voltage & data', es: 'Bajo voltaje y datos'},
        description: {
          en: 'Fiber, telecom, and landscape-lighting runs pulled clean in their own conduit.',
          es: 'Fibra, telecom e iluminación de jardín jalados limpios en su propio conducto.',
        },
        icon: 'Route',
      },
      {
        headline: {en: 'EV-charger circuits', es: 'Circuitos para cargador EV'},
        description: {
          en: 'Conduit sized for a Level 2 charger run from the panel to the parking spot.',
          es: 'Conducto dimensionado para un cargador Nivel 2 desde el panel hasta el estacionamiento.',
        },
        icon: 'Zap',
      },
      {
        headline: {en: 'Pull string, tape & as-built', es: 'Guía, cinta y as-built'},
        description: {
          en: 'Pull string and warning tape in every run, with depth recorded as-built.',
          es: 'Guía de jalado y cinta de advertencia en cada tramo, con la profundidad registrada en el as-built.',
        },
        icon: 'FileText',
      },
    ],
    process: [
      {
        headline: {en: 'Locate & plan', es: 'Localizamos y planeamos'},
        description: {
          en: 'We call 811, mark existing utilities, then map the cleanest path to the structure.',
          es: 'Llamamos al 811, marcamos los servicios existentes y trazamos la ruta más limpia hasta la estructura.',
        },
      },
      {
        headline: {en: 'Itemized estimate', es: 'Estimado detallado'},
        description: {
          en: 'Free, within 48 hours. Conduit size, method, and restoration all spelled out.',
          es: 'Gratis, en 48 horas. Tamaño de conducto, método y restauración, todo detallado.',
        },
      },
      {
        headline: {en: 'Install the conduit', es: 'Instalamos el conducto'},
        description: {
          en: 'Same crew bores or trenches the run, sets the conduit, and pulls a string through.',
          es: 'La misma cuadrilla hace el bore o la zanja, coloca el conducto y pasa una guía.',
        },
      },
      {
        headline: {en: 'Restore & walkthrough', es: 'Restauramos y recorremos'},
        description: {
          en: 'We restore the surface, then walk it with you and hand over a photo log and as-built depth.',
          es: 'Restauramos la superficie, recorremos contigo y entregamos un registro fotográfico y la profundidad as-built.',
        },
      },
    ],
    whyUs: [
      {
        headline: {en: 'Locate before we dig', es: 'Localizamos antes de excavar'},
        description: {
          en: '811 every time, marked and verified, before a single shovel goes in the ground.',
          es: '811 siempre, marcado y verificado, antes de meter una sola pala a la tierra.',
        },
        icon: 'SearchCheck',
      },
      {
        headline: {en: 'One crew, one contact', es: 'Una cuadrilla, un contacto'},
        description: {
          en: 'Same crew start to finish, with one person you call who actually answers.',
          es: 'La misma cuadrilla de principio a fin, con una persona a la que llamas y de verdad contesta.',
        },
        icon: 'UserCheck',
      },
      {
        headline: {en: 'Family-run since 2000', es: 'Familiar desde 2000'},
        description: {
          en: 'Licensed, insured, and bilingual EN·ES — a DuPage family business, not a call center.',
          es: 'Con licencia, asegurados y bilingües EN·ES — un negocio familiar de DuPage, no un call center.',
        },
        icon: 'ShieldCheck',
      },
    ],
    pricing: {mode: 'explainer', explainerFactors: TRENCHLESS_FACTORS},
    projects: [
      {
        title: {en: 'Naperville detached-garage power', es: 'Energía a garaje separado en Naperville'},
        meta: {en: 'Naperville · 2024', es: 'Naperville · 2024'},
        imageKey: 'driveways-1',
      },
      {
        title: {en: 'Wheaton EV-charger conduit', es: 'Conducto para cargador EV en Wheaton'},
        meta: {en: 'Wheaton · 2024', es: 'Wheaton · 2024'},
        imageKey: 'property-enhancement-1',
      },
    ],
    related: ['trenching-excavation', 'handhole-pull-box', 'pipe-fusing'],
    projectsTag: 'conduit-installation',
  },

  {
    slug: 'trenching-excavation',
    division: 'trenchless',
    icon: 'Shovel',
    name: {en: 'Trenching & Excavation', es: 'Zanjeo y Excavación'},
    photoAlt: {
      en: 'An open utility trench excavated across a construction site with drainage pipe staged alongside, before backfilling.',
      es: 'Una zanja de servicios abierta excavada a lo largo de una obra en construcción con tubería de drenaje dispuesta al lado, antes del relleno.',
    },
    hero: {
      h1: {
        en: 'Trenching & Excavation in DuPage County.',
        es: 'Zanjeo y Excavación en DuPage County.',
      },
      subhead: {
        en: 'Precise open-cut trenching for utilities, drainage, and footings — dug to the right depth and grade, then backfilled and restored. It\'s the open-cut complement to our trenchless work, and every dig starts with an 811 locate.',
        es: 'Zanjeo abierto y preciso para servicios, drenaje y cimientos — excavado a la profundidad y pendiente correctas, luego rellenado y restaurado. Es el complemento de zanja abierta a nuestro trabajo sin zanja, y cada excavación empieza con una localización 811.',
      },
      photoSlot: 'service.trenching-excavation.16x9',
    },
    whatsIncluded: [
      {
        headline: {en: 'Utility trenches to code depth', es: 'Zanjas de servicios a profundidad de código'},
        description: {
          en: 'Open-cut runs for water, gas, electric, and conduit, dug to the depth your inspector requires.',
          es: 'Tramos abiertos para agua, gas, electricidad y conducto, excavados a la profundidad que exige tu inspector.',
        },
        icon: 'Cable',
      },
      {
        headline: {en: 'Drainage trenches cut to grade', es: 'Zanjas de drenaje cortadas a pendiente'},
        description: {
          en: 'Trenches sloped to carry water where it should go — French drains, downspout lines, and tie-ins.',
          es: 'Zanjas con pendiente para llevar el agua donde debe ir — drenajes franceses, líneas de bajantes y conexiones.',
        },
        icon: 'Route',
      },
      {
        headline: {en: 'Footing & foundation excavation', es: 'Excavación de zapatas y cimientos'},
        description: {
          en: 'Clean, square excavation for footings, piers, and foundation walls, held to plan dimensions.',
          es: 'Excavación limpia y a escuadra para zapatas, pilares y muros de cimentación, según las dimensiones del plano.',
        },
        icon: 'Square',
      },
      {
        headline: {en: 'Hand-dig near marked utilities', es: 'Excavación a mano cerca de servicios marcados'},
        description: {
          en: 'After the 811 locate, we hand-dig and pothole around marked lines so nothing gets nicked.',
          es: 'Tras la localización 811, excavamos a mano y sondeamos alrededor de líneas marcadas para no dañar nada.',
        },
        icon: 'Pickaxe',
      },
      {
        headline: {en: 'Backfill, compaction & restoration', es: 'Relleno, compactación y restauración'},
        description: {
          en: 'We backfill in lifts, compact each one, and restore the surface — soil, gravel, or sod.',
          es: 'Rellenamos por capas, compactamos cada una y restauramos la superficie — tierra, grava o césped.',
        },
        icon: 'Layers',
      },
    ],
    process: [
      {
        headline: {en: 'Locate & plan', es: 'Localizar y planear'},
        description: {
          en: 'We call in the 811 utility locate and map the run, depth, and grade before a shovel moves.',
          es: 'Solicitamos la localización 811 y trazamos el tramo, la profundidad y la pendiente antes de mover una pala.',
        },
      },
      {
        headline: {en: 'Itemized estimate', es: 'Estimado detallado'},
        description: {
          en: 'Free, within 48 hours. You see the scope, the depth, and the restoration line by line.',
          es: 'Gratis, en 48 horas. Ves el alcance, la profundidad y la restauración línea por línea.',
        },
      },
      {
        headline: {en: 'Trench & excavate to depth', es: 'Zanjear y excavar a profundidad'},
        description: {
          en: 'We cut the trench to depth and grade, hand-digging close to any marked lines.',
          es: 'Cortamos la zanja a profundidad y pendiente, excavando a mano cerca de líneas marcadas.',
        },
      },
      {
        headline: {en: 'Backfill, compact & restore', es: 'Rellenar, compactar y restaurar'},
        description: {
          en: 'Backfill in compacted lifts, restore the surface, and a final walkthrough with a photo log.',
          es: 'Rellenamos en capas compactadas, restauramos la superficie y hacemos un recorrido final con registro fotográfico.',
        },
      },
    ],
    whyUs: [
      {
        headline: {en: 'Locate before we dig', es: 'Localizamos antes de excavar'},
        description: {
          en: 'Every job starts with an 811 locate and careful hand-digging around marked lines.',
          es: 'Cada trabajo empieza con una localización 811 y excavación a mano cuidadosa cerca de líneas marcadas.',
        },
        icon: 'SearchCheck',
      },
      {
        headline: {en: 'Same crew, one contact', es: 'Mismo equipo, un contacto'},
        description: {
          en: 'The same crew runs your trench start to finish, with one person accountable for the job.',
          es: 'El mismo equipo hace tu zanja de principio a fin, con una persona responsable del trabajo.',
        },
        icon: 'UserCheck',
      },
      {
        headline: {en: 'Family-run, licensed & insured', es: 'Familiar, con licencia y seguro'},
        description: {
          en: 'Family-run since 2000, licensed and insured, and bilingual in English and Spanish.',
          es: 'Familiar desde 2000, con licencia y seguro, y bilingüe en inglés y español.',
        },
        icon: 'BadgeCheck',
      },
    ],
    pricing: {mode: 'explainer', explainerFactors: TRENCHLESS_FACTORS},
    projects: [
      {
        title: {en: 'Glen Ellyn drainage trench', es: 'Zanja de drenaje en Glen Ellyn'},
        meta: {en: 'Glen Ellyn · 2024', es: 'Glen Ellyn · 2024'},
        imageKey: 'retaining-walls-1',
      },
      {
        title: {en: 'Lombard utility trench', es: 'Zanja de servicios en Lombard'},
        meta: {en: 'Lombard · 2024', es: 'Lombard · 2024'},
        imageKey: 'property-enhancement-2',
      },
    ],
    related: ['conduit-installation', 'sewer-line-replacement', 'yard-drainage'],
    projectsTag: 'trenching-excavation',
  },

  {
    slug: 'sewer-line-replacement',
    division: 'trenchless',
    icon: 'Waypoints',
    name: {en: 'Sewer Line Replacement', es: 'Reemplazo de Línea de Drenaje'},
    photoAlt: {
      en: 'Open excavation exposing underground utility pipes and connections during a pipe replacement.',
      es: 'Excavación abierta que expone tuberías y conexiones de servicios subterráneos durante un reemplazo de tubería.',
    },
    hero: {
      h1: {
        en: 'Sewer Line Replacement in DuPage County.',
        es: 'Reemplazo de Línea de Drenaje en DuPage County.',
      },
      subhead: {
        en: 'Root-intruded, bellied, or collapsed sewer laterals replaced house-to-main. We camera the line and locate the problem before we quote — across DuPage County, no guesswork, no upsell.',
        es: 'Líneas de drenaje invadidas por raíces, hundidas o colapsadas, reemplazadas de la casa al colector. Inspeccionamos con cámara y localizamos el problema antes de cotizar — en todo DuPage County, sin adivinar, sin presionar.',
      },
      photoSlot: 'service.sewer-line-replacement.16x9',
    },
    whatsIncluded: [
      {
        headline: {en: 'Camera inspection & locate', es: 'Inspección con cámara y localización'},
        description: {
          en: 'We run a sewer camera the full lateral, then mark depth and location before any dig.',
          es: 'Pasamos una cámara por toda la línea, luego marcamos profundidad y ubicación antes de excavar.',
        },
        icon: 'SearchCheck',
      },
      {
        headline: {en: 'Full lateral replacement', es: 'Reemplazo de línea completa'},
        description: {
          en: 'New pipe from the house connection out to the city main — no patched-together segments.',
          es: 'Tubería nueva desde la conexión de la casa hasta el colector municipal — sin tramos parchados.',
        },
        icon: 'Route',
      },
      {
        headline: {en: 'Trenchless pipe bursting', es: 'Reventado de tubería sin zanja'},
        description: {
          en: 'Where the run allows, we pull new pipe through the old path — no full-length trench.',
          es: 'Donde el tramo lo permite, jalamos tubería nueva por la ruta vieja — sin zanja de extremo a extremo.',
        },
        icon: 'Spline',
      },
      {
        headline: {en: 'Root & bellied-pipe repair', es: 'Reparación de raíces y hundimientos'},
        description: {
          en: 'We clear root intrusion and correct bellied sections so the line drains at proper slope.',
          es: 'Eliminamos la invasión de raíces y corregimos los tramos hundidos para que drene con la pendiente correcta.',
        },
        icon: 'Wrench',
      },
      {
        headline: {en: 'Cleanout & permit coordination', es: 'Registro y coordinación de permisos'},
        description: {
          en: 'We add an accessible cleanout and handle the permit and inspection scheduling for you.',
          es: 'Instalamos un registro accesible y gestionamos el permiso y la inspección por ti.',
        },
        icon: 'ClipboardCheck',
      },
    ],
    process: [
      {
        headline: {en: 'Camera inspection & locate', es: 'Inspección con cámara y localización'},
        description: {
          en: 'We scope the lateral on camera to confirm the failure, then locate and mark its depth.',
          es: 'Inspeccionamos la línea con cámara para confirmar la falla, luego localizamos y marcamos su profundidad.',
        },
      },
      {
        headline: {en: 'Itemized estimate', es: 'Estimado detallado'},
        description: {
          en: 'Free, within 48 hours. You see the camera findings and exactly what the fix involves.',
          es: 'Gratis, en 48 horas. Ves los hallazgos de la cámara y exactamente qué incluye la reparación.',
        },
      },
      {
        headline: {en: 'Replace the lateral', es: 'Reemplazamos la línea'},
        description: {
          en: 'Trenchless pipe bursting where the run allows; dig-and-replace where it doesn\'t.',
          es: 'Reventado sin zanja donde el tramo lo permite; excavación y reemplazo donde no.',
        },
      },
      {
        headline: {en: 'Backfill, restore & walkthrough', es: 'Relleno, restauración y recorrido'},
        description: {
          en: 'We backfill, restore the surface, then walk the finished job with you and a photo log.',
          es: 'Rellenamos, restauramos la superficie, luego recorremos el trabajo terminado contigo y un registro fotográfico.',
        },
      },
    ],
    whyUs: [
      {
        headline: {en: 'Camera-diagnose before we quote', es: 'Diagnóstico con cámara antes de cotizar'},
        description: {
          en: 'We see the problem and locate it before we dig — you pay for the fix you actually need.',
          es: 'Vemos el problema y lo localizamos antes de excavar — pagas por la reparación que de verdad necesitas.',
        },
        icon: 'SearchCheck',
      },
      {
        headline: {en: 'One crew, one contact', es: 'Un equipo, un contacto'},
        description: {
          en: 'The same crew runs the job start to finish, with one accountable person on your call.',
          es: 'El mismo equipo hace el trabajo de principio a fin, con una persona responsable atendiéndote.',
        },
        icon: 'UserCheck',
      },
      {
        headline: {en: 'Licensed, insured, family-run', es: 'Licenciados, asegurados y familiares'},
        description: {
          en: 'Licensed and insured, bilingual EN·ES, and family-run in DuPage County since 2000.',
          es: 'Licenciados y asegurados, bilingües EN·ES, y un negocio familiar en DuPage County desde 2000.',
        },
        icon: 'BadgeCheck',
      },
    ],
    pricing: {mode: 'explainer', explainerFactors: TRENCHLESS_FACTORS},
    projects: [
      {
        title: {en: 'Naperville lateral replacement', es: 'Reemplazo de línea en Naperville'},
        meta: {en: 'Naperville · 2024', es: 'Naperville · 2024'},
        imageKey: 'property-enhancement-1',
      },
      {
        title: {en: 'Wheaton pipe bursting', es: 'Reventado de tubería en Wheaton'},
        meta: {en: 'Wheaton · 2024', es: 'Wheaton · 2024'},
        imageKey: 'driveways-2',
      },
    ],
    related: ['trenching-excavation', 'missile-boring', 'yard-drainage'],
    projectsTag: 'sewer-line-replacement',
  },

  {
    slug: 'missile-boring',
    division: 'trenchless',
    icon: 'Drill',
    name: {en: 'Missile Boring', es: 'Perforación con Topo Neumático'},
    // B-16: 'driveways' now resolves to a stock paver-driveway photo, so this
    // alias moved to the preserved pre-B-16 copy — the page renders the exact
    // same placeholder as before (missile-boring stays on the diagram track).
    imageKey: 'legacy-driveways',
    hero: {
      h1: {
        en: 'Missile Boring in DuPage County.',
        es: 'Perforación con Topo Neumático en DuPage County.',
      },
      subhead: {
        en: 'A pneumatic piercing tool drives a small bore under your driveway, walk, or patio so a short utility run crosses without trenching the whole length. You keep the slab and the lawn — we work from two small pits, not an open cut.',
        es: 'Una herramienta de percusión neumática perfora un túnel pequeño bajo tu entrada, acera o patio para que un cruce de servicios corto pase sin abrir toda la zanja. Conservas la losa y el césped — trabajamos desde dos pozos pequeños, no desde un corte abierto.',
      },
      photoSlot: 'service.missile-boring.16x9',
    },
    whatsIncluded: [
      {
        headline: {en: 'Bores under driveways & walks', es: 'Cruces bajo entradas y aceras'},
        description: {
          en: 'The mole crosses under concrete and asphalt — no saw-cut, no patch seam.',
          es: 'El topo cruza bajo concreto y asfalto — sin corte de sierra, sin junta de parche.',
        },
        icon: 'Footprints',
      },
      {
        headline: {en: 'Under mature landscaping', es: 'Bajo jardinería establecida'},
        description: {
          en: 'Pass beneath established lawns and beds so the planting stays intact.',
          es: 'Pasamos bajo céspedes y arriates establecidos para que la siembra quede intacta.',
        },
        icon: 'Sparkles',
      },
      {
        headline: {en: 'Short utility crossings', es: 'Cruces de servicios cortos'},
        description: {
          en: 'Conduit, water lines, and gas sleeves pulled through on a single short run.',
          es: 'Conducto, líneas de agua y fundas de gas que jalamos en un solo tramo corto.',
        },
        icon: 'Cable',
      },
      {
        headline: {en: 'Launch + receiving pits only', es: 'Solo pozos de lanzamiento y recepción'},
        description: {
          en: 'We dig one small entry pit and one exit pit — the run between stays buried.',
          es: 'Excavamos un pozo de entrada y uno de salida — el tramo entre ellos queda enterrado.',
        },
        icon: 'Square',
      },
      {
        headline: {en: 'Line-and-grade check', es: 'Verificación de línea y nivel'},
        description: {
          en: 'We confirm direction and depth on every bore before we pull the line through.',
          es: 'Confirmamos dirección y profundidad en cada cruce antes de jalar la línea.',
        },
        icon: 'Ruler',
      },
    ],
    process: [
      {
        headline: {en: 'Locate & plan the bore', es: 'Localizamos y planeamos el cruce'},
        description: {
          en: '811 utility locate first, then we set the bore path, line, and grade.',
          es: 'Primero localización de servicios 811, luego fijamos la ruta, línea y nivel.',
        },
      },
      {
        headline: {en: 'Itemized estimate', es: 'Estimado detallado'},
        description: {
          en: 'Free, within 48 hours. You see the run, the pits, and the restoration.',
          es: 'Gratis, en 48 horas. Ves el tramo, los pozos y la restauración.',
        },
      },
      {
        headline: {en: 'Drive the bore', es: 'Perforamos el cruce'},
        description: {
          en: 'The mole drives across; we pull the line or sleeve through behind it.',
          es: 'El topo avanza y jalamos la línea o funda detrás de él.',
        },
      },
      {
        headline: {en: 'Restore + walkthrough', es: 'Restauración y recorrido'},
        description: {
          en: 'We backfill the launch and receiving pits, then walk it with a photo log.',
          es: 'Rellenamos los pozos de lanzamiento y recepción, y lo recorremos con registro fotográfico.',
        },
      },
    ],
    whyUs: [
      {
        headline: {en: 'No torn-up driveway', es: 'Sin entrada destrozada'},
        description: {
          en: 'We bore under the slab instead of cutting through it — minimal surface disruption.',
          es: 'Perforamos bajo la losa en vez de cortarla — mínima alteración de la superficie.',
        },
        icon: 'TrendingDown',
      },
      {
        headline: {en: 'Locate before we dig', es: 'Localizar antes de excavar'},
        description: {
          en: 'Every bore starts with an 811 locate — we know what is down there first.',
          es: 'Cada cruce empieza con una localización 811 — sabemos qué hay abajo primero.',
        },
        icon: 'SearchCheck',
      },
      {
        headline: {en: 'One crew, one contact', es: 'Un equipo, un contacto'},
        description: {
          en: 'Same crew start to finish, family-run since 2000, licensed and insured, EN·ES.',
          es: 'El mismo equipo de principio a fin, familiar desde 2000, con licencia y seguro, EN·ES.',
        },
        icon: 'UserCheck',
      },
    ],
    pricing: {mode: 'explainer', explainerFactors: TRENCHLESS_FACTORS},
    projects: [
      {
        title: {en: 'Naperville driveway crossing', es: 'Cruce bajo entrada en Naperville'},
        meta: {en: 'Naperville · 2025', es: 'Naperville · 2025'},
        imageKey: 'driveways-1',
      },
      {
        title: {en: 'Wheaton walkway bore', es: 'Cruce bajo acera en Wheaton'},
        meta: {en: 'Wheaton · 2025', es: 'Wheaton · 2025'},
        imageKey: 'driveways-2',
      },
    ],
    related: ['conduit-installation', 'trenching-excavation', 'sewer-line-replacement'],
    projectsTag: 'missile-boring',
  },

  {
    slug: 'handhole-pull-box',
    division: 'trenchless',
    icon: 'Box',
    name: {en: 'Handhole / Pull Box Installation', es: 'Cajas de Registro y de Tiro'},
    // B-16 Code: the sourced bridge photo FAILED verification (readable
    // Russian signage — "О ПОЖАРЕ ЗВОНИТЬ 101, 112" etc. — geolocates the
    // scene; never-acceptable per the B-16 accuracy rules). The page keeps
    // its placeholder alias like the sump-pumps GAP; flagged to Chat.
    imageKey: 'property-enhancement',
    hero: {
      h1: {
        en: 'Handhole / Pull Box Installation in DuPage County.',
        es: 'Cajas de Registro y de Tiro en DuPage County.',
      },
      subhead: {
        en: 'Underground handholes, pull boxes, and splice vaults set along your conduit or fiber run so wire can be pulled, spliced, and serviced later without re-digging. We place each box where the run actually needs access and tie it cleanly into the conduit.',
        es: 'Cajas de registro, cajas de tiro y bóvedas de empalme subterráneas colocadas a lo largo de tu tramo de conducto o fibra, para que el cable se jale, empalme y atienda después sin volver a excavar. Colocamos cada caja donde el tramo de verdad necesita acceso y la conectamos limpio al conducto.',
      },
      photoSlot: 'service.handhole-pull-box.16x9',
    },
    whatsIncluded: [
      {
        headline: {en: 'Polymer-concrete handholes', es: 'Cajas de registro de polímero'},
        description: {
          en: 'Polymer-concrete handholes and pull boxes sized to the run and the conductors inside.',
          es: 'Cajas de registro y de tiro de polímero-concreto dimensionadas al tramo y a los conductores que lleva.',
        },
        icon: 'Box',
      },
      {
        headline: {en: 'Junction & splice vaults', es: 'Bóvedas de unión y empalme'},
        description: {
          en: 'Larger vaults where runs branch or splice, with room to work the cable inside.',
          es: 'Bóvedas más grandes donde los tramos se ramifican o empalman, con espacio para trabajar el cable adentro.',
        },
        icon: 'Container',
      },
      {
        headline: {en: 'Set flush to grade', es: 'A ras del terreno'},
        description: {
          en: 'Each box set true to finished grade, with a traffic-rated lid where it sees vehicles.',
          es: 'Cada caja a ras del terreno terminado, con tapa para tráfico donde pasan vehículos.',
        },
        icon: 'Ruler',
      },
      {
        headline: {en: 'Gravel sump for drainage', es: 'Sumidero de grava para drenaje'},
        description: {
          en: 'A gravel base under the box lets water drain instead of pooling around the splice.',
          es: 'Una base de grava bajo la caja deja drenar el agua en vez de que se acumule junto al empalme.',
        },
        icon: 'Layers',
      },
      {
        headline: {en: 'Clean tie-in to the run', es: 'Conexión limpia al tramo'},
        description: {
          en: 'Conduit entered and sealed at the box so pulls run smooth and the box stays dry.',
          es: 'Conducto entrado y sellado en la caja para que los jalados corran suave y la caja quede seca.',
        },
        icon: 'Spline',
      },
    ],
    process: [
      {
        headline: {en: 'Locate & plan the boxes', es: 'Localizamos y planeamos las cajas'},
        description: {
          en: 'We call 811, then mark where access and splice points should fall along the run.',
          es: 'Llamamos al 811 y luego marcamos dónde deben caer los puntos de acceso y empalme en el tramo.',
        },
      },
      {
        headline: {en: 'Itemized estimate', es: 'Estimado detallado'},
        description: {
          en: 'Free, within 48 hours. Box sizes, lid rating, and restoration all spelled out.',
          es: 'Gratis, en 48 horas. Tamaños de caja, tapa y restauración, todo detallado.',
        },
      },
      {
        headline: {en: 'Set to grade & tie in', es: 'A ras y conectamos'},
        description: {
          en: 'Same crew sets each box true to grade, beds it on gravel, and ties in the conduit.',
          es: 'La misma cuadrilla coloca cada caja a ras, la asienta sobre grava y conecta el conducto.',
        },
      },
      {
        headline: {en: 'Backfill, restore & walkthrough', es: 'Rellenamos, restauramos y recorremos'},
        description: {
          en: 'We backfill, restore the surface, then walk it with you and hand over a photo log.',
          es: 'Rellenamos, restauramos la superficie, recorremos contigo y entregamos un registro fotográfico.',
        },
      },
    ],
    whyUs: [
      {
        headline: {en: 'Set true, tied in clean', es: 'A ras y bien conectado'},
        description: {
          en: 'Boxes set flush to grade with clean conduit tie-ins, so the next pull is easy.',
          es: 'Cajas a ras del terreno con conexiones de conducto limpias, para que el próximo jalado sea fácil.',
        },
        icon: 'SearchCheck',
      },
      {
        headline: {en: 'One crew, one contact', es: 'Una cuadrilla, un contacto'},
        description: {
          en: 'Same crew start to finish, with one person you call who actually answers.',
          es: 'La misma cuadrilla de principio a fin, con una persona a la que llamas y de verdad contesta.',
        },
        icon: 'UserCheck',
      },
      {
        headline: {en: 'Family-run since 2000', es: 'Familiar desde 2000'},
        description: {
          en: 'Licensed, insured, and bilingual EN·ES — a DuPage family business, not a call center.',
          es: 'Con licencia, asegurados y bilingües EN·ES — un negocio familiar de DuPage, no un call center.',
        },
        icon: 'ShieldCheck',
      },
    ],
    pricing: {mode: 'explainer', explainerFactors: TRENCHLESS_FACTORS},
    projects: [
      {
        title: {en: 'Naperville fiber splice vault', es: 'Bóveda de empalme de fibra en Naperville'},
        meta: {en: 'Naperville · 2024', es: 'Naperville · 2024'},
        imageKey: 'property-enhancement-1',
      },
      {
        title: {en: 'Wheaton pull-box run', es: 'Tramo con cajas de tiro en Wheaton'},
        meta: {en: 'Wheaton · 2024', es: 'Wheaton · 2024'},
        imageKey: 'property-enhancement-2',
      },
    ],
    related: ['conduit-installation', 'pipe-fusing', 'trenching-excavation'],
    projectsTag: 'handhole-pull-box',
  },

  {
    slug: 'pipe-fusing',
    division: 'trenchless',
    icon: 'Spline',
    name: {en: 'HDPE Pipe Fusing', es: 'Fusión de Tubería de Polietileno'},
    photoAlt: {
      en: 'A gloved worker aligning a length of yellow polyethylene pipe clamped in a hydraulic butt-fusion machine for joining.',
      es: 'Un trabajador con guantes alineando un tramo de tubería de polietileno amarilla sujeta en una máquina hidráulica de fusión a tope para su unión.',
    },
    hero: {
      h1: {
        en: 'HDPE Pipe Fusing in DuPage County.',
        es: 'Fusión de Tubería de Polietileno en DuPage County.',
      },
      subhead: {
        en: 'We heat-fuse HDPE pipe into one continuous, leak-free run with no couplings to fail underground — for water, gas, geothermal, or conduit. Fused sections pre-stage on the surface and pull cleanly behind a directional bore, so the line goes in monolithic and stays put.',
        es: 'Fusionamos por calor la tubería de polietileno en un solo tramo continuo y sin fugas, sin acoples que fallen bajo tierra — para agua, gas, geotermia o conducto. Las secciones fusionadas se preparan en la superficie y se jalan limpias detrás de un bore direccional, así la línea queda monolítica y firme.',
      },
      photoSlot: 'service.pipe-fusing.16x9',
    },
    whatsIncluded: [
      {
        headline: {en: 'Butt-fusion joints', es: 'Uniones por termofusión a tope'},
        description: {
          en: 'Pipe ends faced, heated, and fused into one wall — as strong as the pipe itself.',
          es: 'Los extremos se rectifican, calientan y fusionan en una sola pared — tan fuertes como el tubo mismo.',
        },
        icon: 'Spline',
      },
      {
        headline: {en: 'Electrofusion fittings', es: 'Accesorios por electrofusión'},
        description: {
          en: 'Coupler and saddle fittings fused with embedded coils where butt-fusion won\'t reach.',
          es: 'Acoples y sillas fusionados con resistencias internas donde la fusión a tope no alcanza.',
        },
        icon: 'Zap',
      },
      {
        headline: {en: 'Leak-free monolithic runs', es: 'Tramos monolíticos sin fugas'},
        description: {
          en: 'Water, gas, geothermal, or conduit joined end to end — no couplings to leak.',
          es: 'Agua, gas, geotermia o conducto unidos de extremo a extremo — sin acoples que goteen.',
        },
        icon: 'Waypoints',
      },
      {
        headline: {en: 'Pre-fused pull sections', es: 'Secciones fusionadas para jalado'},
        description: {
          en: 'Runs fused on the surface, then pulled in one piece behind a directional bore.',
          es: 'Tramos fusionados en la superficie y luego jalados en una pieza detrás de un bore direccional.',
        },
        icon: 'Route',
      },
      {
        headline: {en: 'Each joint logged', es: 'Cada unión registrada'},
        description: {
          en: 'Every fusion recorded joint by joint, so you have a written record of the run.',
          es: 'Cada fusión queda registrada unión por unión, así tienes un registro escrito del tramo.',
        },
        icon: 'FileText',
      },
    ],
    process: [
      {
        headline: {en: 'Plan the run & stage pipe', es: 'Planeamos el tramo y preparamos el tubo'},
        description: {
          en: 'We measure lengths, set the fittings, and lay out the fusion plan before any heat goes on.',
          es: 'Medimos las longitudes, definimos los accesorios y trazamos el plan de fusión antes de aplicar calor.',
        },
      },
      {
        headline: {en: 'Itemized estimate', es: 'Estimado detallado'},
        description: {
          en: 'Free, within 48 hours. Pipe size, joint count, and method all spelled out.',
          es: 'Gratis, en 48 horas. Tamaño del tubo, número de uniones y método, todo detallado.',
        },
      },
      {
        headline: {en: 'Fuse the joints', es: 'Fusionamos las uniones'},
        description: {
          en: 'Same crew runs the butt-fusion and electrofusion joints to spec, one after another.',
          es: 'La misma cuadrilla realiza las uniones por fusión a tope y electrofusión según especificación, una tras otra.',
        },
      },
      {
        headline: {en: 'Pressure-check & walkthrough', es: 'Prueba de presión y recorrido'},
        description: {
          en: 'We pressure-test the run, then walk it with you and hand over a photo and fusion log.',
          es: 'Probamos el tramo a presión, lo recorremos contigo y entregamos un registro fotográfico y de fusión.',
        },
      },
    ],
    whyUs: [
      {
        headline: {en: 'Leak-free, logged by joint', es: 'Sin fugas, registrado por unión'},
        description: {
          en: 'Fused joints have no coupling to fail, and we log every fusion joint by joint.',
          es: 'Las uniones fusionadas no tienen acople que falle, y registramos cada fusión unión por unión.',
        },
        icon: 'SearchCheck',
      },
      {
        headline: {en: 'One crew, one contact', es: 'Una cuadrilla, un contacto'},
        description: {
          en: 'Same crew start to finish, with one person you call who actually answers.',
          es: 'La misma cuadrilla de principio a fin, con una persona a la que llamas y de verdad contesta.',
        },
        icon: 'UserCheck',
      },
      {
        headline: {en: 'Family-run since 2000', es: 'Familiar desde 2000'},
        description: {
          en: 'Licensed, insured, and bilingual EN·ES — a DuPage family business, not a call center.',
          es: 'Con licencia, asegurados y bilingües EN·ES — un negocio familiar de DuPage, no un call center.',
        },
        icon: 'ShieldCheck',
      },
    ],
    pricing: {mode: 'explainer', explainerFactors: TRENCHLESS_FACTORS},
    projects: [
      {
        title: {en: 'Naperville geothermal loop fusing', es: 'Fusión de circuito geotérmico en Naperville'},
        meta: {en: 'Naperville · 2024', es: 'Naperville · 2024'},
        imageKey: 'property-enhancement-1',
      },
      {
        title: {en: 'Wheaton water-service fusing', es: 'Fusión de acometida de agua en Wheaton'},
        meta: {en: 'Wheaton · 2025', es: 'Wheaton · 2025'},
        imageKey: 'retaining-walls-2',
      },
    ],
    related: ['conduit-installation', 'sewer-line-replacement', 'missile-boring'],
    projectsTag: 'pipe-fusing',
  },
];

export const SERVICE_SLUGS = SERVICES.map((s) => s.slug);

// Phase M.11 — build-time invariant: service slugs MUST be globally unique
// (getService/getRelatedService resolve by slug via .find(); a duplicate would
// silently mis-route to the first match). Mirrors the FK assertion in projects.ts.
{
  const _seenSlugs = new Set<string>();
  for (const _s of SERVICES) {
    if (_seenSlugs.has(_s.slug)) {
      throw new Error(
        `[services.ts] Duplicate service slug "${_s.slug}" — service slugs must be globally unique.`,
      );
    }
    _seenSlugs.add(_s.slug);
  }
}

export const AUDIENCES: Audience[] = ['residential', 'commercial', 'hardscape'];

/**
 * Phase M.01e — service slugs are globally unique. The single-arg form is
 * canonical; the optional `audience` second arg is kept as a backwards-compat
 * for callers like blog crossLinks. If supplied it's tried first, then
 * falls back to the slug-only match so legacy `audience` tags don't fail
 * lookups for the 14 new services that have no audience.
 */
export function getService(slug: string, audience?: Audience): Service | undefined {
  if (audience) {
    return (
      SERVICES.find((s) => s.slug === slug && s.audience === audience) ??
      SERVICES.find((s) => s.slug === slug)
    );
  }
  return SERVICES.find((s) => s.slug === slug);
}

/**
 * Phase M.01e — service slugs are now globally unique (the previous
 * residential/commercial duplicate of `snow-removal` was retired and
 * replaced with `driveway-snow-removal` + `commercial-snow-plowing`).
 * `parentAudience` is no longer required; the single-arg form is sufficient.
 * A second arg is accepted for backwards-compat callers but ignored.
 */
export function getRelatedService(
  slug: string,
  _parentAudience?: Audience,
): Service | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

export function getServicesForAudience(audience: Audience): Service[] {
  return SERVICES.filter((s) => s.audience === audience);
}

/**
 * Phase M.01d — division-aware lookup. M.01e wires this into the new
 * /landscape/, /hardscape/, /waterproofing/, /snow-removal/ landings.
 */
export function getServicesForDivision(division: Division): Service[] {
  return SERVICES.filter((s) => s.division === division);
}

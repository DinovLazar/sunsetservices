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
 * Strings flagged inline as `[TBR]` go to native-Spanish review in
 * Phase 2.13. Final marketing copy is Erick's pass in Part 2.
 */

export type Audience = 'residential' | 'commercial' | 'hardscape';

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
  audience: Audience;
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

export const SERVICES: Service[] = [
  // -------------------- RESIDENTIAL (6) --------------------
  {
    slug: 'lawn-care',
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
    related: ['landscape-design', 'sprinkler-systems', 'snow-removal', 'seasonal-cleanup'],
    projectsTag: 'lawn-care',
  },

  {
    slug: 'landscape-design',
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

  {
    slug: 'snow-removal',
    audience: 'residential',
    icon: 'Snowflake',
    name: {en: 'Snow Removal', es: 'Remoción de Nieve'},
    hero: {
      h1: {
        en: 'Residential Snow Removal in DuPage.',
        es: 'Remoción de Nieve Residencial en DuPage.',
      },
      subhead: {
        en: 'Plowing, walks, steps, and de-icing on a 2-inch trigger. 24/7 dispatch and a 2-hour response window once we trigger.',
        es: 'Arado, senderos, escalones y deshielo con activación a 2 pulgadas. Despacho 24/7 y respuesta en 2 horas tras activar.',
      },
      photoSlot: 'service.snow-removal.16x9',
    },
    whatsIncluded: [
      {
        headline: {en: 'Plowing', es: 'Arado'},
        description: {
          en: 'Driveway plowed clear to pavement.',
          es: 'Entrada arada hasta el pavimento.',
        },
        icon: 'Snowflake',
      },
      {
        headline: {en: 'Shoveling walks + steps', es: 'Pala en senderos y escalones'},
        description: {
          en: 'Front walks and steps cleared by hand.',
          es: 'Senderos delanteros y escalones limpiados a mano.',
        },
        icon: 'Footprints',
      },
      {
        headline: {en: 'De-icing', es: 'Deshielo'},
        description: {
          en: 'Pet-safe melt applied where needed.',
          es: 'Sal pet-safe aplicada donde se necesita.',
        },
        icon: 'Droplets',
      },
      {
        headline: {en: '2" trigger', es: 'Activación a 2"'},
        description: {
          en: 'We service every storm at or above 2 inches.',
          es: 'Servicio en cada tormenta de 2 pulgadas o más.',
        },
        icon: 'Ruler',
      },
    ],
    process: [
      {
        headline: {en: 'Pre-season prep', es: 'Preparación pre-temporada'},
        description: {
          en: 'Mark drives, walk lines, and irrigation heads in October.',
          es: 'Marcamos entradas, senderos y cabezales de riego en octubre.',
        },
      },
      {
        headline: {en: 'Storm trigger', es: 'Activación por tormenta'},
        description: {
          en: 'Forecast plus on-site verification triggers dispatch.',
          es: 'Pronóstico y verificación en sitio activan el despacho.',
        },
      },
      {
        headline: {en: 'Service', es: 'Servicio'},
        description: {
          en: 'Plow, shovel, de-ice — usually inside 2 hours.',
          es: 'Arado, pala, deshielo — normalmente en 2 horas.',
        },
      },
      {
        headline: {en: 'Post-storm check', es: 'Revisión post-tormenta'},
        description: {
          en: 'Drive-by once snow stops to clear drift accumulation.',
          es: 'Pasada al detenerse la nieve para limpiar acumulación.',
        },
      },
    ],
    whyUs: [
      {
        headline: {en: '2-hr response after trigger', es: '2 horas tras activación'},
        description: {
          en: 'You\'re served before most people are out of bed.',
          es: 'Atendido antes de que la mayoría se levante.',
        },
        icon: 'Clock',
      },
      {
        headline: {en: '24/7 dispatch', es: 'Despacho 24/7'},
        description: {
          en: 'Storm at 2am? We\'re already on the way.',
          es: '¿Tormenta a las 2am? Ya vamos en camino.',
        },
        icon: 'PhoneCall',
      },
      {
        headline: {en: 'Insured fleet', es: 'Flotilla asegurada'},
        description: {
          en: 'Property-damage coverage on every plow on the road.',
          es: 'Cobertura por daños en cada vehículo de arado.',
        },
        icon: 'ShieldCheck',
      },
    ],
    pricing: {mode: 'explainer', explainerFactors: GENERIC_FACTORS},
    projects: [
      {
        title: {en: 'Naperville HOA, all-season', es: 'HOA en Naperville, temporada completa'},
        meta: {en: 'Naperville · 2023–2024', es: 'Naperville · 2023–2024'},
        imageKey: 'snow-removal-1',
      },
      {
        title: {en: 'Wheaton residential cluster', es: 'Cluster residencial en Wheaton'},
        meta: {en: 'Wheaton · 2023–2024', es: 'Wheaton · 2023–2024'},
        imageKey: 'snow-removal-2',
      },
    ],
    related: ['lawn-care', 'seasonal-cleanup'],
    projectsTag: 'snow-removal',
  },

  {
    slug: 'seasonal-cleanup',
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
    related: ['snow-removal', 'property-enhancement', 'turf-management'],
    projectsTag: 'landscape-maintenance',
  },

  {
    slug: 'snow-removal',
    audience: 'commercial',
    icon: 'Snowflake',
    name: {en: 'Commercial Snow Removal', es: 'Remoción Comercial de Nieve'},
    /** Asset key — disambiguates from residential `snow-removal` (same URL slug, different audience). */
    imageKey: 'commercial-snow-removal',
    hero: {
      h1: {
        en: 'Commercial Snow Removal in DuPage County.',
        es: 'Remoción Comercial de Nieve en DuPage.',
      },
      subhead: {
        en: 'Plowing, sidewalks, de-icing, 24/7 dispatch, and a per-event storm log. After-hours response with 2-hour SLA after trigger.',
        es: 'Arado, senderos, deshielo, despacho 24/7 y bitácora por evento. Respuesta fuera de horario con SLA de 2 horas tras activar.',
      },
      photoSlot: 'service.commercial-snow-removal.16x9',
    },
    whatsIncluded: [
      {
        headline: {en: 'Plowing', es: 'Arado'},
        description: {
          en: 'Parking lots and approaches plowed to pavement.',
          es: 'Estacionamientos y accesos arados al pavimento.',
        },
        icon: 'Snowflake',
      },
      {
        headline: {en: 'Sidewalks', es: 'Senderos'},
        description: {
          en: 'Walks shoveled and salted; ADA compliance maintained.',
          es: 'Senderos paleados y salados; cumple con ADA.',
        },
        icon: 'Footprints',
      },
      {
        headline: {en: 'De-icing', es: 'Deshielo'},
        description: {
          en: 'Calibrated salt or eco-melt per contract spec.',
          es: 'Sal calibrada o eco-melt según contrato.',
        },
        icon: 'Droplets',
      },
      {
        headline: {en: '24/7 dispatch', es: 'Despacho 24/7'},
        description: {
          en: 'Live operator response any hour during snow season.',
          es: 'Respuesta de operador en vivo a toda hora en temporada.',
        },
        icon: 'PhoneCall',
      },
      {
        headline: {en: 'Storm log', es: 'Bitácora de tormenta'},
        description: {
          en: 'Per-event timing, depths, and applications report.',
          es: 'Reporte por evento de tiempos, profundidades y aplicaciones.',
        },
        icon: 'FileText',
      },
    ],
    process: [
      {
        headline: {en: 'Pre-season audit', es: 'Auditoría pre-temporada'},
        description: {
          en: 'Lot mapping, drift analysis, equipment placement.',
          es: 'Mapeo del lote, análisis de drift, ubicación de equipo.',
        },
      },
      {
        headline: {en: 'Contract + COI', es: 'Contrato y COI'},
        description: {
          en: 'Master contract signed, COI issued before November 1.',
          es: 'Contrato maestro firmado, COI emitido antes del 1 de noviembre.',
        },
      },
      {
        headline: {en: 'Trigger', es: 'Activación'},
        description: {
          en: 'Forecast plus on-site verification triggers dispatch.',
          es: 'Pronóstico y verificación en sitio activan el despacho.',
        },
      },
      {
        headline: {en: 'Service', es: 'Servicio'},
        description: {
          en: 'Plow, walk, de-ice — all inside the 2-hour SLA.',
          es: 'Arado, senderos, deshielo — dentro del SLA de 2 horas.',
        },
      },
      {
        headline: {en: 'Reporting', es: 'Reportes'},
        description: {
          en: 'Storm-event log emailed before close of next business day.',
          es: 'Bitácora del evento por correo antes del próximo día hábil.',
        },
      },
    ],
    whyUs: [
      {
        headline: {en: 'After-hours dispatch', es: 'Despacho fuera de horario'},
        description: {
          en: 'Live operator at 2am, not a call-back tomorrow.',
          es: 'Operador en vivo a las 2am, no devolución mañana.',
        },
        icon: 'Clock',
      },
      {
        headline: {en: 'Storm-event reporting', es: 'Reportes por evento'},
        description: {
          en: 'PDF log per storm: timing, depth, application weights.',
          es: 'PDF por tormenta: tiempos, profundidad, pesos de aplicación.',
        },
        icon: 'FileText',
      },
      {
        headline: {en: '2-hr response SLA', es: 'SLA de 2 horas'},
        description: {
          en: 'Contractually committed response inside 2 hours after trigger.',
          es: 'Respuesta contractualmente garantizada en 2 horas tras activar.',
        },
        icon: 'BadgeCheck',
      },
    ],
    pricing: {mode: 'explainer', explainerFactors: GENERIC_FACTORS},
    projects: [
      {
        title: {en: 'Aurora retail center', es: 'Centro comercial en Aurora'},
        meta: {en: 'Aurora · 2023–2024', es: 'Aurora · 2023–2024'},
        imageKey: 'commercial-snow-removal-1',
      },
      {
        title: {en: 'Naperville office park', es: 'Parque de oficinas en Naperville'},
        meta: {en: 'Naperville · 2023–2024', es: 'Naperville · 2023–2024'},
        imageKey: 'commercial-snow-removal-2',
      },
    ],
    related: ['landscape-maintenance', 'property-enhancement'],
    projectsTag: 'commercial-snow-removal',
  },

  {
    slug: 'property-enhancement',
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
    pricing: {mode: 'explainer', explainerFactors: GENERIC_FACTORS},
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
    audience: 'hardscape',
    icon: 'Wall',
    name: {en: 'Retaining Walls', es: 'Muros de Contención'},
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
    pricing: {mode: 'explainer', explainerFactors: GENERIC_FACTORS},
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
    audience: 'hardscape',
    icon: 'Flame',
    name: {en: 'Fire Pits & Features', es: 'Chimeneas y Elementos de Fuego'},
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
    pricing: {mode: 'explainer', explainerFactors: GENERIC_FACTORS},
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
    pricing: {mode: 'explainer', explainerFactors: GENERIC_FACTORS},
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
    audience: 'hardscape',
    icon: 'Car',
    name: {en: 'Driveways', es: 'Entradas de Auto'},
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
    pricing: {mode: 'explainer', explainerFactors: GENERIC_FACTORS},
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
    audience: 'hardscape',
    icon: 'ChefHat',
    name: {en: 'Outdoor Kitchens', es: 'Cocinas Exteriores'},
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
    pricing: {mode: 'explainer', explainerFactors: GENERIC_FACTORS},
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
];

export const SERVICE_SLUGS = SERVICES.map((s) => s.slug);

export const AUDIENCES: Audience[] = ['residential', 'commercial', 'hardscape'];

/**
 * Lookup a service by URL slug. When `audience` is provided, the lookup is
 * scoped to that audience — required when two services share the same slug
 * across audiences (e.g., `snow-removal` exists for both residential and
 * commercial). Without `audience`, the first match wins.
 */
export function getService(slug: string, audience?: Audience): Service | undefined {
  if (audience) {
    return SERVICES.find((s) => s.slug === slug && s.audience === audience);
  }
  return SERVICES.find((s) => s.slug === slug);
}

/**
 * Resolve a related-service slug, preferring a same-audience match before
 * falling back to a cross-audience match. Encodes D7 (within-audience for
 * residential + commercial; cross-sell for hardscape) by relying on the
 * caller's audience to disambiguate slugs that exist in multiple audiences.
 */
export function getRelatedService(
  slug: string,
  parentAudience: Audience,
): Service | undefined {
  return (
    SERVICES.find((s) => s.slug === slug && s.audience === parentAudience) ??
    SERVICES.find((s) => s.slug === slug)
  );
}

export function getServicesForAudience(audience: Audience): Service[] {
  return SERVICES.filter((s) => s.audience === audience);
}

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

export type FaqItem = {
  question: Localized;
  answer: Localized;
};

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
  faq: FaqItem[];
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
    faq: [
      {
        question: {en: 'How often do you visit?', es: '¿Con qué frecuencia visitan?'},
        answer: {
          en: 'Weekly is the default. Every-other-week and one-time visits are available; weekly delivers the most consistent results between April and November.',
          es: 'Semanal es lo predeterminado. También ofrecemos cada dos semanas y visitas únicas; lo semanal da los resultados más consistentes de abril a noviembre.',
        },
      },
      {
        question: {en: 'Do you handle fertilizer separately?', es: '¿Manejan el fertilizante aparte?'},
        answer: {
          en: 'Fertilization is a separate 5-step program billed annually. Customers usually bundle it with weekly mowing, but they\'re independent contracts.',
          es: 'La fertilización es un programa de 5 pasos cobrado anualmente. La mayoría lo combina con corte semanal, pero son contratos independientes.',
        },
      },
      {
        question: {en: 'Can I switch to every-other-week?', es: '¿Puedo cambiar a cada dos semanas?'},
        answer: {
          en: 'Yes — you can switch frequency at the start of any month with two weeks\' notice. Pricing adjusts pro-rated.',
          es: 'Sí — puedes cambiar la frecuencia al inicio de cualquier mes avisando con dos semanas. El precio se ajusta proporcionalmente.',
        },
      },
      {
        question: {en: 'Do you bill per-visit or seasonally?', es: '¿Cobran por visita o por temporada?'},
        answer: {
          en: 'Either. Most homeowners pick a flat seasonal rate billed monthly April–November. Per-visit billing is available for irregular schedules.',
          es: 'Ambas. La mayoría elige una tarifa fija de temporada con cobro mensual de abril a noviembre. También ofrecemos pago por visita para horarios irregulares.',
        },
      },
      {
        question: {en: 'Are estimates free?', es: '¿Los presupuestos son gratis?'},
        answer: {
          en: 'Yes — site visit, measurements, and itemized estimate are free. Estimates land in your inbox within 48 hours of the visit.',
          es: 'Sí — visita, mediciones y presupuesto detallado son gratis. Los presupuestos llegan a tu correo en 48 horas después de la visita.',
        },
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
    faq: [
      {
        question: {en: 'How long does a design take?', es: '¿Cuánto tarda un diseño?'},
        answer: {
          en: 'Concept renderings are delivered in 2–3 weeks. The detailed plan adds 1–2 weeks. Build scheduling depends on scope.',
          es: 'Los bocetos conceptuales llegan en 2–3 semanas. El plan detallado suma 1–2 semanas. La construcción depende del alcance.',
        },
      },
      {
        question: {en: 'Do you build what you design?', es: '¿Construyen lo que diseñan?'},
        answer: {
          en: 'Yes — same company, single project lead. We don\'t hand off to a third-party crew.',
          es: 'Sí — misma empresa, un solo líder. No transferimos a equipos terceros.',
        },
      },
      {
        question: {en: 'Can I phase the build over multiple years?', es: '¿Puedo construir por fases en varios años?'},
        answer: {
          en: 'Yes — most full-yard projects phase across two or three seasons. We sequence so each phase looks finished on its own.',
          es: 'Sí — la mayoría de proyectos completos se hacen en dos o tres temporadas. Las secuenciamos para que cada fase luzca terminada.',
        },
      },
      {
        question: {en: 'Do I keep the renderings if I don\'t build?', es: '¿Me quedo los bocetos si no construyo?'},
        answer: {
          en: 'Yes — design and build are separate engagements. The plans are yours; we hope you build with us, but you\'re not locked in.',
          es: 'Sí — diseño y construcción son contratos separados. Los planos son tuyos; esperamos construir contigo, pero no hay obligación.',
        },
      },
      {
        question: {en: 'What\'s the design fee?', es: '¿Cuánto cuesta el diseño?'},
        answer: {
          en: 'Design fees are based on lot size and project complexity. The fee is credited toward the build if you proceed with us within twelve months.',
          es: 'La tarifa depende del tamaño del lote y la complejidad. Se acredita al costo de construcción si avanzas con nosotros en doce meses.',
        },
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
    faq: [
      {
        question: {en: 'Are you insured?', es: '¿Están asegurados?'},
        answer: {
          en: 'Yes — $2M general liability and full workers\' comp. We send the COI before the first cut.',
          es: 'Sí — $2M de responsabilidad general y compensación laboral completa. Enviamos el COI antes del primer corte.',
        },
      },
      {
        question: {en: 'Can you remove a tree near my house?', es: '¿Pueden retirar un árbol cerca de mi casa?'},
        answer: {
          en: 'Yes — sectional takedowns are routine. We rope and lower limbs in pieces; no surprise impact on the structure.',
          es: 'Sí — las remociones seccionadas son rutina. Bajamos ramas con cuerdas; sin impactos sorpresa en la estructura.',
        },
      },
      {
        question: {en: 'Do I need a permit?', es: '¿Necesito un permiso?'},
        answer: {
          en: 'DuPage County rarely requires permits for residential tree work. Some HOAs do; we check before we schedule.',
          es: 'DuPage rara vez requiere permisos para trabajo residencial. Algunas HOAs sí; verificamos antes de agendar.',
        },
      },
      {
        question: {en: 'How fast is storm response?', es: '¿Qué tan rápido responden a tormentas?'},
        answer: {
          en: 'Within 4 hours of a storm passing for emergencies (tree on house, blocked drive). Non-emergencies queue normally.',
          es: 'En 4 horas tras pasar la tormenta para emergencias (árbol sobre casa, entrada bloqueada). No-emergencias entran en la cola normal.',
        },
      },
      {
        question: {en: 'Will you grind the stump?', es: '¿Trituran el tocón?'},
        answer: {
          en: 'Stump grinding is an add-on, billed separately because the equipment is different. Most customers bundle it.',
          es: 'La trituración es un servicio adicional aparte porque usa otro equipo. La mayoría lo incluye.',
        },
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
    faq: [
      {
        question: {en: 'When should I winterize?', es: '¿Cuándo debo preparar para invierno?'},
        answer: {
          en: 'Before the first hard freeze — usually mid-October to early November in DuPage. We schedule by request through November 15.',
          es: 'Antes de la primera helada fuerte — normalmente entre mediados de octubre y principios de noviembre. Agendamos hasta el 15 de noviembre.',
        },
      },
      {
        question: {en: 'Can you upgrade my controller?', es: '¿Pueden actualizar mi control?'},
        answer: {
          en: 'Yes — most existing systems work with smart controllers like Rachio or Hunter Hydrawise. We swap and configure.',
          es: 'Sí — la mayoría de sistemas trabajan con controles inteligentes como Rachio o Hunter Hydrawise. Cambiamos y configuramos.',
        },
      },
      {
        question: {en: 'How long does an install take?', es: '¿Cuánto tarda una instalación?'},
        answer: {
          en: 'Typical 6–8 zone residential install is 2 days. Larger systems can take 3–4 days.',
          es: 'Una instalación residencial típica de 6–8 zonas toma 2 días. Sistemas más grandes pueden tardar 3–4 días.',
        },
      },
      {
        question: {en: 'Do you handle backflow inspection?', es: '¿Manejan la inspección de contraflujo?'},
        answer: {
          en: 'Yes — we install certified backflow preventers and can submit the annual inspection paperwork to your municipality.',
          es: 'Sí — instalamos preventores de contraflujo certificados y enviamos la documentación de inspección anual a tu municipio.',
        },
      },
      {
        question: {en: 'Will you damage my lawn?', es: '¿Dañarán mi césped?'},
        answer: {
          en: 'We use a vibratory plow that slits the turf with minimal disruption. Most lawns recover invisibly within 2–3 weeks.',
          es: 'Usamos un arado vibratorio que abre el césped con mínima interrupción. La mayoría se recupera invisiblemente en 2–3 semanas.',
        },
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
    faq: [
      {
        question: {en: 'What\'s your trigger depth?', es: '¿Cuál es la profundidad de activación?'},
        answer: {
          en: '2 inches by default. We\'ll adjust to 1 inch for medical-need households on request.',
          es: '2 pulgadas por defecto. Ajustamos a 1 pulgada para hogares con necesidades médicas a pedido.',
        },
      },
      {
        question: {en: 'When does the season start?', es: '¿Cuándo empieza la temporada?'},
        answer: {
          en: 'November 1 through April 15, with flexibility on the back end if late storms hit.',
          es: 'Del 1 de noviembre al 15 de abril, con flexibilidad si llegan tormentas tardías.',
        },
      },
      {
        question: {en: 'Do you de-ice walkways?', es: '¿Aplican deshielo en senderos?'},
        answer: {
          en: 'Yes — pet-safe ice melt on walks and steps after every plow visit.',
          es: 'Sí — sal pet-safe en senderos y escalones tras cada visita.',
        },
      },
      {
        question: {en: 'Can I cancel mid-season?', es: '¿Puedo cancelar a mitad de temporada?'},
        answer: {
          en: 'Seasonal contracts are non-cancellable; per-event billing is available if you want flexibility.',
          es: 'Los contratos de temporada no se cancelan; el cobro por evento ofrece flexibilidad.',
        },
      },
      {
        question: {en: 'How are you paid?', es: '¿Cómo se les paga?'},
        answer: {
          en: 'Flat seasonal rate billed in five monthly installments, or per-event billing after each storm.',
          es: 'Tarifa fija de temporada en cinco mensualidades, o cobro por evento tras cada tormenta.',
        },
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
    faq: [
      {
        question: {en: 'When do you do fall cleanup?', es: '¿Cuándo hacen limpieza otoñal?'},
        answer: {
          en: 'October through mid-November. We schedule on a rolling basis — first visits go to homes with mature deciduous trees.',
          es: 'De octubre a mediados de noviembre. Agendamos rotativamente — las primeras visitas son para casas con árboles caducifolios maduros.',
        },
      },
      {
        question: {en: 'Do you mulch in spring or fall?', es: '¿Aplican mantillo en primavera u otoño?'},
        answer: {
          en: 'Both — spring is the standard refresh, fall is for water retention before winter.',
          es: 'Ambas — primavera para la renovación estándar, otoño para retener humedad antes del invierno.',
        },
      },
      {
        question: {en: 'Will you haul off the leaves?', es: '¿Se llevan las hojas?'},
        answer: {
          en: 'Yes — included in the price. We never leave piles for the homeowner.',
          es: 'Sí — incluido en el precio. Nunca dejamos pilas para el dueño.',
        },
      },
      {
        question: {en: 'Can I bundle with weekly mowing?', es: '¿Puedo combinarla con corte semanal?'},
        answer: {
          en: 'Yes — most weekly customers add seasonal cleanup; the bundle saves on the visit minimum.',
          es: 'Sí — la mayoría de clientes semanales la agregan; el combo ahorra en la visita mínima.',
        },
      },
      {
        question: {en: 'How long does it take?', es: '¿Cuánto tarda?'},
        answer: {
          en: 'A typical residential cleanup is 4–6 hours with a 2–3 person crew. Larger lots take a full day.',
          es: 'Una limpieza residencial típica toma 4–6 horas con equipo de 2–3 personas. Lotes grandes toman un día completo.',
        },
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
    faq: [
      {
        question: {en: 'Do you serve HOAs?', es: '¿Atienden a HOAs?'},
        answer: {
          en: 'Yes — about 30% of our commercial portfolio is HOA properties. We handle board meetings, RFP responses, and standardized reporting.',
          es: 'Sí — alrededor del 30% de nuestro portafolio comercial son HOAs. Atendemos juntas, RFPs y reportes estandarizados.',
        },
      },
      {
        question: {en: "What's your minimum contract value?", es: '¿Cuál es el contrato mínimo?'},
        answer: {
          en: '$2,500 monthly recurring on 12-month contracts; one-time enhancements have a separate scope.',
          es: '$2,500 recurrente mensual en contratos de 12 meses; mejoras puntuales tienen alcance aparte.',
        },
      },
      {
        question: {en: 'Can you provide a COI?', es: '¿Pueden enviar un COI?'},
        answer: {
          en: 'Yes — $2M general liability and full workers\' comp. Sent during onboarding before the first visit.',
          es: 'Sí — $2M de responsabilidad y compensación laboral completa. Enviado en la integración antes de la primera visita.',
        },
      },
      {
        question: {en: 'How fast is your snow response?', es: '¿Qué tan rápido responden a nieve?'},
        answer: {
          en: '2-hour response after trigger for commercial accounts. Storm-event reporting included.',
          es: 'Respuesta en 2 horas tras activar para cuentas comerciales. Reportes de evento incluidos.',
        },
      },
      {
        question: {en: 'Do you provide a single-point property manager?', es: '¿Asignan un property manager único?'},
        answer: {
          en: 'Yes — every commercial account gets a named manager with their direct mobile and email. No call queue.',
          es: 'Sí — cada cuenta comercial recibe un manager nombrado con móvil directo y correo. Sin cola.',
        },
      },
    ],
    related: ['commercial-snow-removal', 'property-enhancement', 'turf-management'],
    projectsTag: 'landscape-maintenance',
  },

  {
    slug: 'commercial-snow-removal',
    audience: 'commercial',
    icon: 'Snowflake',
    name: {en: 'Commercial Snow Removal', es: 'Remoción Comercial de Nieve'},
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
    faq: [
      {
        question: {en: "What's your response SLA?", es: '¿Cuál es su SLA?'},
        answer: {
          en: '2 hours from trigger. Trigger is forecast confirmation plus on-site depth verification at your site.',
          es: '2 horas desde la activación. La activación es la confirmación del pronóstico más verificación en sitio.',
        },
      },
      {
        question: {en: 'Do you provide storm-event reports?', es: '¿Entregan reportes por evento?'},
        answer: {
          en: 'Yes — PDF log per storm: arrival, depth, salt weight, departure. Emailed before close of next business day.',
          es: 'Sí — PDF por tormenta: llegada, profundidad, peso de sal, salida. Enviado antes del próximo día hábil.',
        },
      },
      {
        question: {en: 'Are de-icers eco-friendly?', es: '¿Los deshielos son ecológicos?'},
        answer: {
          en: 'Standard is calibrated rock salt. Eco-melt (chloride-free, calcium magnesium acetate) available at premium per contract.',
          es: 'Estándar es sal calibrada. Eco-melt (sin cloruro, acetato de calcio-magnesio) disponible con prima según contrato.',
        },
      },
      {
        question: {en: 'Can you handle multiple sites?', es: '¿Pueden con varios sitios?'},
        answer: {
          en: 'Yes — multi-site portfolios are routine. Each site gets its own crew lead with consolidated reporting.',
          es: 'Sí — los portafolios multi-sitio son rutina. Cada sitio tiene su líder con reportes consolidados.',
        },
      },
      {
        question: {en: 'Do you provide a COI?', es: '¿Proveen COI?'},
        answer: {
          en: 'Yes — $2M general liability plus auto, workers\' comp, and an additional-insured endorsement on request.',
          es: 'Sí — $2M de responsabilidad más auto, compensación laboral y endoso de asegurado adicional a pedido.',
        },
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
    faq: [
      {
        question: {en: 'Can you work around tenant hours?', es: '¿Pueden trabajar fuera de horas pico?'},
        answer: {
          en: 'Yes — most enhancements happen outside peak business hours, weekends if necessary, with no-disruption planning.',
          es: 'Sí — la mayoría se hace fuera de horas pico, fines de semana si hace falta, con planificación sin interrupciones.',
        },
      },
      {
        question: {en: 'Do you handle the design?', es: '¿Manejan el diseño?'},
        answer: {
          en: 'Yes — designer-led from the first walk; we don\'t hand off to a third-party designer.',
          es: 'Sí — diseñador lidera desde el primer recorrido; no transferimos a terceros.',
        },
      },
      {
        question: {en: 'Can the project phase across budgets?', es: '¿El proyecto puede ir por fases?'},
        answer: {
          en: 'Yes — most enhancement scopes split into 2–3 phases over multiple seasons. We sequence so each phase looks finished.',
          es: 'Sí — la mayoría se divide en 2–3 fases en varias temporadas. Las secuenciamos para que cada fase luzca terminada.',
        },
      },
      {
        question: {en: 'Do you do holiday lighting?', es: '¿Instalan luces festivas?'},
        answer: {
          en: 'Yes — install in November, removal in January. Quoted separately from base maintenance.',
          es: 'Sí — instalación en noviembre, retiro en enero. Cotizado aparte del mantenimiento base.',
        },
      },
      {
        question: {en: 'How fast is the estimate?', es: '¿Qué tan rápido es el presupuesto?'},
        answer: {
          en: 'Site walk inside one week, concept + estimate inside two weeks of the walk.',
          es: 'Recorrido en una semana, concepto y presupuesto en dos semanas tras el recorrido.',
        },
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
    faq: [
      {
        question: {en: 'Do you do soil testing?', es: '¿Hacen análisis de suelo?'},
        answer: {
          en: 'Yes — annual baseline plus targeted retests when results suggest. Lab data drives the application program.',
          es: 'Sí — línea base anual y repeticiones puntuales cuando los resultados lo indican. Los datos guían las aplicaciones.',
        },
      },
      {
        question: {en: 'Are you IDA-licensed?', es: '¿Están licenciados por IDA?'},
        answer: {
          en: 'Yes — Illinois Department of Agriculture commercial-applicator licensed. License number on every report.',
          es: 'Sí — licenciados como aplicador comercial por el IDA. Número de licencia en cada reporte.',
        },
      },
      {
        question: {en: 'Can you do organic-only?', es: '¿Pueden ser solo orgánicos?'},
        answer: {
          en: 'Organic-base programs are available; pure organic on commercial turf is unusual but achievable with a multi-year transition.',
          es: 'Los programas base orgánica están disponibles; orgánico puro en césped comercial es inusual pero posible con transición plurianual.',
        },
      },
      {
        question: {en: 'How often are reports?', es: '¿Cada cuánto son los reportes?'},
        answer: {
          en: 'Quarterly PDF reports plus a year-end summary with soil trends and the next-year plan.',
          es: 'Reportes PDF trimestrales más un resumen anual con tendencias y plan del próximo año.',
        },
      },
      {
        question: {en: 'Is overseeding included?', es: '¿La resiembra está incluida?'},
        answer: {
          en: 'Annual fall overseeding is included; spring overseeding is an add-on if conditions warrant.',
          es: 'La resiembra anual de otoño está incluida; la de primavera es agregable según condiciones.',
        },
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
    faq: [
      {
        question: {en: 'How long does a typical patio take?', es: '¿Cuánto tarda un patio típico?'},
        answer: {
          en: 'A 400–600 sq ft residential paver patio runs 5–8 days from break-ground to walkthrough.',
          es: 'Un patio residencial de 400–600 ft² toma 5–8 días desde el inicio hasta el recorrido.',
        },
      },
      {
        question: {en: 'What pavers do you use?', es: '¿Qué adoquines usan?'},
        answer: {
          en: 'Unilock primarily; we\'re an Authorized Contractor. We can also work with Belgard or other premium lines on request.',
          es: 'Principalmente Unilock; somos contratista autorizado. También trabajamos con Belgard u otras líneas premium si se pide.',
        },
      },
      {
        question: {en: "What's the warranty?", es: '¿Cuál es la garantía?'},
        answer: {
          en: '5-year workmanship warranty on the install. Unilock\'s manufacturer warranty on the pavers themselves runs separately.',
          es: 'Garantía de mano de obra de 5 años. La garantía del fabricante Unilock sobre los adoquines corre aparte.',
        },
      },
      {
        question: {en: 'Do you handle permits?', es: '¿Manejan los permisos?'},
        answer: {
          en: 'Yes — DuPage County and the local municipality. Permits are usually included in the quote.',
          es: 'Sí — el Condado de DuPage y el municipio local. Los permisos suelen ir incluidos.',
        },
      },
      {
        question: {en: 'Can I see your previous work?', es: '¿Puedo ver trabajos previos?'},
        answer: {
          en: 'Yes — recent projects are featured below, and we\'ll arrange a drive-by of an installed patio in your neighborhood on request.',
          es: 'Sí — hay proyectos abajo, y arreglamos un drive-by de un patio terminado en tu zona si lo pides.',
        },
      },
      {
        question: {en: 'When can you start?', es: '¿Cuándo pueden empezar?'},
        answer: {
          en: 'Spring builds typically book by late February; we\'ll confirm a start window inside the quote.',
          es: 'Las construcciones de primavera se llenan a fines de febrero; confirmamos ventana en la cotización.',
        },
      },
    ],
    related: ['retaining-walls', 'fire-pits-features', 'outdoor-kitchens'],
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
    faq: [
      {
        question: {en: 'Do I need engineering?', es: '¿Necesito ingeniería?'},
        answer: {
          en: 'Walls 4 feet and taller, or any wall against a structure, must be engineered. We include the stamped drawings.',
          es: 'Muros de 4 pies o más, o cualquier muro contra una estructura, requieren ingeniería. Incluimos los planos sellados.',
        },
      },
      {
        question: {en: 'How long does a wall take to build?', es: '¿Cuánto tarda construir un muro?'},
        answer: {
          en: 'Typical 60-foot residential wall is 5–10 days. Longer walls or those needing engineering can take 2–4 weeks total with permitting.',
          es: 'Un muro residencial típico de 60 pies toma 5–10 días. Muros más largos o con ingeniería pueden tardar 2–4 semanas con permisos.',
        },
      },
      {
        question: {en: 'Will it leak?', es: '¿Se va a filtrar?'},
        answer: {
          en: 'Properly built walls don\'t. Drain tile + clean-stone backfill behind every wall — non-negotiable.',
          es: 'Muros bien hechos no. Tubería de drenaje y piedra limpia detrás — innegociable.',
        },
      },
      {
        question: {en: 'What\'s the warranty?', es: '¿Cuál es la garantía?'},
        answer: {
          en: '5-year installation warranty plus the Unilock manufacturer warranty on the blocks.',
          es: 'Garantía de instalación de 5 años más la garantía del fabricante Unilock sobre los bloques.',
        },
      },
      {
        question: {en: 'Do you handle permits?', es: '¿Manejan los permisos?'},
        answer: {
          en: 'Yes — DuPage and the local municipality. Engineering review packets included where required.',
          es: 'Sí — DuPage y el municipio local. Paquetes de ingeniería incluidos donde se requiere.',
        },
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
    faq: [
      {
        question: {en: 'Wood-burning or gas — which lasts longer?', es: '¿Leña o gas — cuál dura más?'},
        answer: {
          en: 'Both can last 25+ years if built right. Gas is lower-maintenance; wood-burning has a stronger ambiance trade-off.',
          es: 'Ambos pueden durar 25+ años si están bien hechos. Gas es bajo mantenimiento; leña tiene mejor ambiente.',
        },
      },
      {
        question: {en: 'Do I need a permit?', es: '¿Necesito permiso?'},
        answer: {
          en: 'Wood-burning pits usually no. Gas-fed features require gas-line permits in DuPage County and most municipalities — we file them.',
          es: 'Chimeneas de leña normalmente no. Las de gas requieren permisos de línea de gas en DuPage y la mayoría de municipios — los manejamos.',
        },
      },
      {
        question: {en: 'How big should it be?', es: '¿Qué tamaño debería tener?'},
        answer: {
          en: 'Most residential pits are 36"–48" outside diameter with 6–8 feet of paver circulation. We design to the yard.',
          es: 'La mayoría son de 36"–48" de diámetro exterior con 6–8 pies de circulación. Diseñamos al jardín.',
        },
      },
      {
        question: {en: 'Can it integrate with my patio?', es: '¿Puede integrarse con mi patio?'},
        answer: {
          en: 'Yes — most fire features get designed alongside or after the patio. Same Unilock paver line, seamless integration.',
          es: 'Sí — la mayoría se diseñan con o después del patio. Misma línea Unilock, integración fluida.',
        },
      },
      {
        question: {en: 'How long does install take?', es: '¿Cuánto tarda la instalación?'},
        answer: {
          en: 'Standalone fire pit: 3–5 days. With patio integration: schedule with the patio build.',
          es: 'Chimenea solita: 3–5 días. Con patio integrado: agendar con la construcción.',
        },
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
    faq: [
      {
        question: {en: 'Cedar or steel?', es: '¿Cedro o acero?'},
        answer: {
          en: 'Cedar reads warmer and ages naturally with stain refresh; steel is lower-maintenance and supports larger spans. We design for the yard.',
          es: 'El cedro luce más cálido y envejece natural con retoque; el acero es menos mantenimiento y soporta vanos más grandes. Diseñamos al jardín.',
        },
      },
      {
        question: {en: 'Do I need a permit?', es: '¿Necesito permiso?'},
        answer: {
          en: 'Most pavilions yes; open pergolas under 200 sqft sometimes no. We confirm with your municipality before quoting.',
          es: 'La mayoría de pabellones sí; pérgolas abiertas bajo 200 ft² a veces no. Confirmamos con tu municipio antes de cotizar.',
        },
      },
      {
        question: {en: 'How long does a build take?', es: '¿Cuánto tarda construir?'},
        answer: {
          en: 'Typical pergola: 1–2 weeks. Pavilion with engineering and permit: 4–6 weeks total.',
          es: 'Pérgola típica: 1–2 semanas. Pabellón con ingeniería y permiso: 4–6 semanas.',
        },
      },
      {
        question: {en: 'Will the wood last in Chicago winters?', es: '¿Sobrevive la madera al invierno de Chicago?'},
        answer: {
          en: 'Yes with cedar + UV-stable stain + year-1 touch-up. Most cedar pergolas hit 25+ years.',
          es: 'Sí con cedro + tinte estable a UV + retoque del año 1. La mayoría de pérgolas de cedro pasan los 25 años.',
        },
      },
      {
        question: {en: 'Can it integrate with my patio?', es: '¿Puede integrarse con mi patio?'},
        answer: {
          en: 'Yes — most pergolas attach to the house above the patio or sit freestanding inside the paver field.',
          es: 'Sí — la mayoría se anexan a la casa sobre el patio o quedan aisladas dentro del campo de adoquines.',
        },
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
    faq: [
      {
        question: {en: 'How long does it take?', es: '¿Cuánto tarda?'},
        answer: {
          en: 'Typical residential driveway: 7–10 days. Larger circle drives or shared drives: 2–3 weeks total with permitting.',
          es: 'Entrada residencial típica: 7–10 días. Circulares o compartidas: 2–3 semanas con permisos.',
        },
      },
      {
        question: {en: "Will the pavers handle vehicle weight?", es: '¿Aguantan los adoquines un auto?'},
        answer: {
          en: 'Yes — we use Unilock structural-rated pavers (not patio pavers) over an engineered base. Rated for residential vehicle loading.',
          es: 'Sí — usamos adoquines Unilock estructurales (no de patio) sobre base diseñada. Calificados para carga residencial.',
        },
      },
      {
        question: {en: "What's the warranty?", es: '¿Cuál es la garantía?'},
        answer: {
          en: '5-year installation warranty plus the Unilock manufacturer warranty on the pavers themselves.',
          es: 'Garantía de instalación de 5 años más la garantía del fabricante Unilock.',
        },
      },
      {
        question: {en: 'Do you handle the permit?', es: '¿Manejan el permiso?'},
        answer: {
          en: 'Yes — driveway-apron permits with the municipality and any DuPage County coordination are included.',
          es: 'Sí — permisos del acceso con el municipio y coordinación con DuPage incluidos.',
        },
      },
      {
        question: {en: 'Can I add a circle drive?', es: '¿Puedo agregar entrada circular?'},
        answer: {
          en: 'Yes — circle drives are common; we design them to flow with the front-yard plantings.',
          es: 'Sí — las entradas circulares son comunes; las diseñamos para integrarse con la jardinería frontal.',
        },
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
    faq: [
      {
        question: {en: 'How long does a build take?', es: '¿Cuánto tarda construir?'},
        answer: {
          en: 'Typical full outdoor kitchen: 4–6 weeks total including permits and trade coordination.',
          es: 'Una cocina exterior típica: 4–6 semanas en total incluyendo permisos y coordinación.',
        },
      },
      {
        question: {en: 'Do you sell appliances?', es: '¿Venden electrodomésticos?'},
        answer: {
          en: 'We don\'t sell appliances; we install yours or coordinate the purchase from supplier-approved partners.',
          es: 'No vendemos electrodomésticos; instalamos los tuyos o coordinamos la compra con socios aprobados.',
        },
      },
      {
        question: {en: 'Can it be covered for year-round use?', es: '¿Puede tener techo para uso todo el año?'},
        answer: {
          en: 'Yes — pavilion-roofed kitchens with vented ceilings and infrared heaters allow shoulder-season cooking. Winter use is rare in DuPage.',
          es: 'Sí — pabellones con techos ventilados e infrarrojos permiten cocinar en temporada media. Uso invernal es raro en DuPage.',
        },
      },
      {
        question: {en: "What's the warranty?", es: '¿Cuál es la garantía?'},
        answer: {
          en: '5-year workmanship warranty on the build. Appliance warranties run separately through their manufacturers.',
          es: '5 años de mano de obra en la construcción. Las garantías de electrodomésticos corren con sus fabricantes.',
        },
      },
      {
        question: {en: 'Do I need permits?', es: '¿Necesito permisos?'},
        answer: {
          en: 'Yes — gas and electrical permits are required and we file them. Plumbing permits depending on whether you add a sink.',
          es: 'Sí — permisos de gas y eléctrico son requeridos y los manejamos. Plomería según si agregas fregadero.',
        },
      },
    ],
    related: ['patios-walkways', 'fire-pits-features', 'pergolas-pavilions'],
    projectsTag: 'outdoor-kitchens',
  },
];

export const SERVICE_SLUGS = SERVICES.map((s) => s.slug);

export const AUDIENCES: Audience[] = ['residential', 'commercial', 'hardscape'];

export function getService(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

export function getServicesForAudience(audience: Audience): Service[] {
  return SERVICES.filter((s) => s.audience === audience);
}

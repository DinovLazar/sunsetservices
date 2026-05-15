/**
 * Typed Resources seed — Phase 1.18 §12.3 / §2 D18.
 *
 * Five evergreen guides at launch. Body is authored in Markdown; reading
 * time + word count are computed at build by `src/data/getResources.ts`.
 *
 * Cowork (Phase 2.04) sources real card thumbnails from Drive. Until then
 * the cards consume the same gray placeholder pattern the rest of the
 * site uses; the alt text already names what the photo *will* show.
 */

import type {Locale} from '@/i18n/locales';

export type ResourceCategory =
  | 'lawn-care'
  | 'hardscape'
  | 'snow-and-winter'
  | 'buying-guides'
  | 'local-permits';

export const RESOURCE_CATEGORIES: ResourceCategory[] = [
  'lawn-care',
  'hardscape',
  'snow-and-winter',
  'buying-guides',
  'local-permits',
];

export interface ResourceFAQ {
  /** Localized question. */
  q: Record<Locale, string>;
  /** Localized answer (markdown allowed; rendered with the prose stylesheet). */
  a: Record<Locale, string>;
}

export interface ResourceCardImage {
  /** `/images/resources/{slug}.jpg` placeholder; Cowork swaps in 2.04. */
  src: string;
  /** Locale-aware alt — describes the photo, not the post topic. ≤125 chars. */
  alt: Record<Locale, string>;
  width: number;
  height: number;
}

export interface ResourceEntry {
  /** kebab-case; identical across locales. */
  slug: string;
  category: ResourceCategory;
  schemaType: 'Article' | 'HowTo';
  title: Record<Locale, string>;
  dek: Record<Locale, string>;
  body: Record<Locale, string>;
  /** ≤160 chars; falls back to dek when omitted. */
  seoDescription?: Record<Locale, string>;
  /** Default `'Sunset Services Team'`; per-entry override allowed. */
  byline?: string;
  /** ISO 8601 — never displayed; powers `dateModified` + sitemap. */
  lastUpdated: string;
  faq?: ResourceFAQ[];
  inlineServiceCrossLink?: {
    audience: 'residential' | 'commercial' | 'hardscape';
    serviceSlug: string;
  };
  /** Optional card thumbnail. All 5 launch entries carry one. */
  cardImage?: ResourceCardImage;
  // computed at build (do NOT author):
  wordCount?: number;
  readingMinutes?: number;
}

export const RESOURCES: ResourceEntry[] = [
  // ============================================================
  // 1. Patio Materials Guide
  // ============================================================
  {
    slug: 'patio-materials-guide',
    category: 'hardscape',
    schemaType: 'Article',
    title: {
      en: 'Patio Materials Guide: Concrete vs. Pavers vs. Natural Stone',
      es: 'Guía de Materiales para Patios: Concreto, Adoquines y Piedra Natural',
    },
    dek: {
      en: 'A side-by-side decision matrix for DuPage homeowners weighing concrete pours, interlocking pavers, and natural-stone slabs.',
      es: 'Una matriz de decisión lado a lado para propietarios de DuPage que comparan concreto vertido, adoquines y piedra natural.',
    },
    seoDescription: {
      en: 'Concrete vs. pavers vs. natural stone for DuPage patios — costs, lifespans, freeze-thaw notes, and how each one fails. From a 25-year hardscape crew.',
      es: 'Concreto, adoquines o piedra natural para patios en DuPage — costos, vida útil, notas sobre heladas. De un equipo con 25 años.',
    },
    lastUpdated: '2026-04-12',
    cardImage: {
      src: '/images/resources/patio-materials-guide.jpg',
      alt: {
        en: 'A finished paver patio next to a poured concrete walkway, showing the texture difference between the two materials.',
        es: 'Un patio de adoquines terminado junto a una caminata de concreto, mostrando la diferencia de textura.',
      },
      width: 1280,
      height: 720,
    },
    inlineServiceCrossLink: {audience: 'hardscape', serviceSlug: 'patios-walkways'},
    body: {
      en: `Pick the wrong patio material and you'll repour it inside ten years. Pick the right one and your kids will host their college graduation on it. The choice is rarely about taste — it's about three things: how cold your soil gets, how much you'll spend the second time, and what failure looks like when (not if) it happens.

Most DuPage homeowners walking into our showroom in Aurora have already seen concrete fail in their parents' yards. They've seen pavers buckled by tree roots. They want a straight answer about what to put down. Here's what we'd put down on our own properties — and why.

## Concrete: the predictable workhorse

A 4-inch reinforced concrete slab is the cheapest way to roof a yard with a stone-like surface. It cures in 7 days, walks in 1, and lasts 25–30 years if it's installed over a 6-inch compacted CA-6 base. The base is rarely right.

Crews skip the base because it's invisible work — the homeowner sees the pour, not the compacted gravel underneath. So a yard that needs 6 inches of CA-6 gets 3 inches, and the slab cracks in winter three.

| Spec | Where it should land |
|---|---|
| Cost (DuPage, 2026) | $12–$18 / sq ft |
| Lifespan | 25–30 years if base is right |
| Freeze-thaw rating | Vulnerable above 1,000 sq ft |
| Repair cost | $4–$8 / sq ft (jackhammer + repour, color drift) |

### When to choose concrete

Choose it when budget is tight, the patio shape is rectangular, and you have less than 600 square feet to cover. We've poured 4-inch slabs in Aurora that look as good 12 years later as they did the day after we left. Those slabs all share three things: a 6-inch CA-6 base, control joints cut at 8-foot grids, and a fiber-reinforced mix.

> [!tip] Ask for the base depth in writing. "6 inches CA-6 compacted" is the floor — anything less and you're buying a slab with a built-in expiration date.

## Pavers: the maintenance-friendly upgrade

Interlocking concrete pavers cost 1.6–2.0× concrete per square foot, but each unit can be lifted and reset if a tree root displaces it. That's the whole pitch. A paver patio that costs $24/sq ft to install costs about $2/sq ft to repair — concrete repair runs five to ten times that.

Unilock is the brand most DuPage hardscape crews put down because the freeze-thaw rating is honest. We're an authorized Unilock contractor; we'd say it either way.

| Spec | Where it should land |
|---|---|
| Cost (DuPage, 2026) | $22–$32 / sq ft (Unilock Brussels Block, polymeric joints) |
| Lifespan | 30–40 years; surface refreshable |
| Freeze-thaw rating | Excellent — joint-tolerant |
| Repair cost | $2–$4 / sq ft (lift, reset, refill polymeric sand) |

### Where pavers fail

Pavers fail at the edges. A paver field with a flush concrete edge restraint will outlast the homeowner; a paver field with no edge restraint will spread two inches every spring and trip somebody by year five. Ask whether the bid includes a poured edge or aluminum restraint — if it doesn't, walk.

## Natural stone: the heirloom surface

Bluestone, limestone, and travertine are what we lay when the homeowner has decided this patio is the last patio. Cost lands at $36–$60/sq ft installed, and the finished surface reads as architecture, not landscaping.

Natural stone has the longest lifespan of the three (50+ years) and the lowest repair cost per square foot — but the highest replacement cost when a single piece chips. You can't color-match a 2026 bluestone slab to a 2014 one.

> [!warning] Natural stone is not pet-friendly underfoot in summer. Bluestone hits 140°F in direct July sun in Naperville. Plan shade or a lighter-color limestone if dogs use the patio.

### When natural stone makes sense

It makes sense over 600 square feet, on a property where the house architecture warrants the upgrade, and when the homeowner is OK with a phased build (some natural-stone yards take two seasons). It does not make sense as a budget compromise — the savings on the install never make up for the look of mid-tier flagstone next to a high-tier brick house.

## Costs side-by-side

Here's what 600 square feet looks like across the three materials, installed by a crew that does it right:

| Material | Total install (600 sq ft) | 25-year cost (incl. 1 repair cycle) |
|---|---|---|
| Concrete slab | $7,200–$10,800 | $9,000–$13,800 |
| Interlocking pavers (Unilock) | $13,200–$19,200 | $14,400–$21,600 |
| Natural stone (bluestone) | $21,600–$36,000 | $22,800–$38,400 |

The pavers row is where most of our hardscape work lands. The math is simple: 30% more upfront, 60% less in lifecycle cost.

## Permits, and what nobody mentions

Every DuPage municipality treats hardscape differently. Naperville requires a permit for any surface over 200 sq ft. Aurora requires one over 100 sq ft. Wheaton triggers a permit if the surface drains toward a neighbor's lot. A reputable contractor pulls the permit; a cheap contractor talks you out of it.

We have a separate guide on [hardscape permits in DuPage](/resources/dupage-hardscape-permits/) that walks you through the rules municipality-by-municipality.

## The 10-minute test

If you're not sure which material you want, do this. Drive past three properties in your neighborhood that have patios you like. Knock on the door. Ask what the patio is, who installed it, and what's broken.

We do the same thing when we scout for material samples. The owners always tell you the truth — and the truth is that the right patio material is the one that's still beautiful at year 15. Most of them are pavers, in DuPage County, in 2026.`,
      es: `Elige el material de patio equivocado y lo vas a verter de nuevo en menos de diez años. Elige el correcto y tus hijos celebrarán su graduación universitaria en él. La decisión rara vez es de gusto — depende de tres cosas: qué tan frío se pone tu suelo, cuánto gastarás la segunda vez, y cómo se ve la falla cuando (no si) ocurre.

La mayoría de propietarios de DuPage que entran a nuestro showroom en Aurora ya han visto concreto fallar en los patios de sus padres. Han visto adoquines abultados por raíces de árboles. Quieren una respuesta directa sobre qué poner. Esto es lo que pondríamos en nuestras propias propiedades — y por qué.

## Concreto: el caballo de batalla predecible

Una losa de concreto reforzado de 4 pulgadas es la forma más barata de cubrir un patio con una superficie tipo piedra. Cura en 7 días, se camina en 1, y dura 25–30 años si se instala sobre una base CA-6 compactada de 6 pulgadas. La base rara vez está bien.

Las cuadrillas omiten la base porque es trabajo invisible — el propietario ve el vertido, no la grava compactada debajo. Así un patio que necesita 6 pulgadas de CA-6 recibe 3, y la losa se agrieta en el tercer invierno.

| Especificación | Dónde debería estar |
|---|---|
| Costo (DuPage, 2026) | $12–$18 / pie² |
| Vida útil | 25–30 años si la base está bien |
| Resistencia heladas | Vulnerable arriba de 1,000 pie² |
| Costo de reparación | $4–$8 / pie² (martillo, vertir, color desigual) |

### Cuándo elegir concreto

Elígelo cuando el presupuesto está apretado, el patio es rectangular, y tienes menos de 600 pies cuadrados. Hemos vertido losas de 4 pulgadas en Aurora que se ven igual de bien 12 años después que el día siguiente al trabajo. Esas losas comparten tres cosas: una base CA-6 de 6 pulgadas, juntas de control cortadas en cuadrículas de 8 pies, y una mezcla con fibra reforzada.

> [!tip] Pide la profundidad de la base por escrito. "6 pulgadas de CA-6 compactado" es el mínimo — cualquier cosa menos y estás comprando una losa con fecha de caducidad incorporada.

## Adoquines: la mejora amigable con el mantenimiento

Los adoquines de concreto entrelazados cuestan 1.6–2.0× el concreto por pie cuadrado, pero cada unidad se puede levantar y reinstalar si una raíz la desplaza. Ese es el argumento completo. Un patio de adoquines que cuesta $24/pie² instalar cuesta unos $2/pie² reparar — la reparación de concreto cuesta de cinco a diez veces eso.

Unilock es la marca que la mayoría de las cuadrillas de hardscape de DuPage instalan porque la resistencia a heladas es honesta. Somos contratistas autorizados Unilock; lo diríamos igual sin esa etiqueta.

| Especificación | Dónde debería estar |
|---|---|
| Costo (DuPage, 2026) | $22–$32 / pie² (Unilock Brussels Block) |
| Vida útil | 30–40 años; superficie renovable |
| Resistencia heladas | Excelente — tolerante a juntas |
| Costo de reparación | $2–$4 / pie² (levantar, reinstalar, rellenar arena polimérica) |

### Dónde fallan los adoquines

Los adoquines fallan en los bordes. Un campo de adoquines con un borde de concreto vertido durará más que el propietario; uno sin restricción de borde se expandirá dos pulgadas cada primavera y hará tropezar a alguien al quinto año. Pregunta si la cotización incluye un borde vertido o restricción de aluminio — si no lo incluye, vete.

## Piedra natural: la superficie heredable

Bluestone, caliza y travertino son lo que ponemos cuando el propietario decidió que este patio es el último. El costo está entre $36–$60/pie² instalado, y la superficie terminada se lee como arquitectura, no como paisajismo.

La piedra natural tiene la vida útil más larga de las tres (50+ años) y el costo de reparación por pie cuadrado más bajo — pero el costo de reemplazo más alto cuando una sola pieza se astilla. No puedes hacer coincidir el color de una losa de bluestone de 2026 con una de 2014.

> [!warning] La piedra natural no es amigable con mascotas en verano. El bluestone alcanza 60°C bajo el sol directo de julio en Naperville. Planifica sombra o una caliza más clara si usas el patio con perros.

### Cuándo tiene sentido la piedra natural

Tiene sentido sobre 600 pies cuadrados, en una propiedad donde la arquitectura de la casa lo amerita, y cuando el propietario está bien con una construcción por fases (algunos patios de piedra natural toman dos temporadas). No tiene sentido como un compromiso de presupuesto — el ahorro en la instalación nunca compensa el aspecto de losas de gama media junto a una casa de ladrillo de gama alta.

## Costos lado a lado

Esto es lo que cuestan 600 pies cuadrados en los tres materiales, instalados por una cuadrilla que lo hace bien:

| Material | Instalación total (600 pie²) | Costo a 25 años (incl. 1 ciclo de reparación) |
|---|---|---|
| Losa de concreto | $7,200–$10,800 | $9,000–$13,800 |
| Adoquines entrelazados (Unilock) | $13,200–$19,200 | $14,400–$21,600 |
| Piedra natural (bluestone) | $21,600–$36,000 | $22,800–$38,400 |

La fila de adoquines es donde aterriza la mayoría de nuestro trabajo. La matemática es simple: 30% más por adelantado, 60% menos en costo de ciclo de vida.

## Permisos, y lo que nadie menciona

Cada municipio de DuPage trata el hardscape diferente. Naperville requiere permiso para cualquier superficie sobre 200 pie². Aurora lo requiere sobre 100 pie². Wheaton lo activa si la superficie drena hacia el lote del vecino. Un contratista respetable saca el permiso; uno barato te convence de no hacerlo.

Tenemos una guía separada de [permisos de hardscape en DuPage](/es/resources/dupage-hardscape-permits/) que repasa las reglas municipio por municipio.

## La prueba de los 10 minutos

Si no estás seguro de qué material quieres, haz esto. Pasa por tres propiedades en tu vecindario con patios que te gusten. Toca la puerta. Pregunta qué es el patio, quién lo instaló, y qué se ha roto.

Hacemos lo mismo cuando buscamos muestras de material. Los propietarios siempre te dicen la verdad — y la verdad es que el material correcto de patio es el que sigue siendo hermoso al año 15. La mayoría de ellos son adoquines, en el condado de DuPage, en 2026.`,
    },
    faq: [
      {
        q: {
          en: 'Do all three materials need a permit in DuPage?',
          es: '¿Los tres materiales requieren permiso en DuPage?',
        },
        a: {
          en: 'It depends on the municipality and the surface area. Naperville triggers at 200 sq ft, Aurora at 100, Wheaton at any size if drainage flows off-lot. The material itself does not change the permit threshold.',
          es: 'Depende del municipio y del área. Naperville lo activa a 200 pie², Aurora a 100, Wheaton a cualquier tamaño si el drenaje sale del lote. El material en sí no cambia el umbral.',
        },
      },
      {
        q: {
          en: 'How long until I can walk and drive on each?',
          es: '¿Cuánto tiempo hasta que se pueda caminar y manejar en cada uno?',
        },
        a: {
          en: 'Concrete: walkable at 24 hours, driveable at 7 days. Pavers: walkable immediately, driveable as soon as the joints are sanded (next day). Natural stone: walkable next day, driveable at 7 days if mortared.',
          es: 'Concreto: caminable a 24 horas, transitable en auto a 7 días. Adoquines: caminable de inmediato, transitable cuando se rellenan las juntas (día siguiente). Piedra natural: caminable al día siguiente, transitable a 7 días si está con mortero.',
        },
      },
      {
        q: {
          en: 'Which one survives DuPage freeze-thaw best?',
          es: '¿Cuál sobrevive mejor a las heladas de DuPage?',
        },
        a: {
          en: 'Pavers, by a wide margin. The polymeric-sand joints flex with the freeze-thaw cycle; concrete cracks at the same junctions every winter; natural stone is fine but pricey to replace if a single slab fractures.',
          es: 'Adoquines, por mucho. Las juntas con arena polimérica flexionan con el ciclo de heladas; el concreto se agrieta en las mismas juntas cada invierno; la piedra natural está bien pero cara de reemplazar si una losa se fractura.',
        },
      },
      {
        q: {
          en: 'Can I mix materials on one project?',
          es: '¿Puedo mezclar materiales en un proyecto?',
        },
        a: {
          en: 'Yes — and we recommend it. A common build is paver field + bluestone caps on retaining walls + concrete edge restraint. The eye reads it as one cohesive surface; the budget lands where it should.',
          es: 'Sí — y lo recomendamos. Una construcción común es campo de adoquines + tapa de bluestone en muros de contención + borde de concreto. La vista lo lee como una superficie cohesiva; el presupuesto cae donde debe.',
        },
      },
    ],
  },

  // ============================================================
  // 2. How to Choose a Landscaper (HowTo)
  // ============================================================
  {
    slug: 'how-to-choose-a-landscaper',
    category: 'buying-guides',
    schemaType: 'HowTo',
    byline: 'Erick Sotomayor',
    title: {
      en: "How to Choose a Landscaper: A DuPage Homeowner's Checklist",
      es: 'Cómo Elegir un Paisajista: Lista para Propietarios de DuPage',
    },
    dek: {
      en: 'Ten questions that surface the gap between a $4,000 quote and a $6,500 quote — and tell you which one to take.',
      es: 'Diez preguntas que revelan la diferencia entre una cotización de $4,000 y una de $6,500 — y cuál tomar.',
    },
    seoDescription: {
      en: 'Ten questions to ask any landscaping contractor in DuPage County before signing. From a 25-year-old crew that has watched the answers change.',
      es: 'Diez preguntas para cualquier contratista de paisajismo en DuPage antes de firmar. De un equipo con 25 años.',
    },
    lastUpdated: '2026-04-08',
    cardImage: {
      src: '/images/resources/how-to-choose-a-landscaper.jpg',
      alt: {
        en: 'A clipboard with a contractor estimate, a tape measure, and work gloves laid on a backyard step.',
        es: 'Un portapapeles con una cotización, una cinta métrica y guantes de trabajo en un escalón del patio.',
      },
      width: 1280,
      height: 720,
    },
    body: {
      en: `Before you start: this guide is for the DuPage homeowner sitting on three quotes that don't add up. The cheap one quoted lawn care for $80 a visit; the middle one is at $130; the expensive one is $185. They look like the same job. They are not the same job. Here are the ten questions that turn a brochure into a contract you can hold somebody to.

## Verify they are licensed for the work they bid

Illinois does not license general landscaping, but it licenses irrigation contractors, arborists who climb, and any crew touching electrical for low-voltage lighting. Ask for the IPLA arborist number if they bid tree work, the plumbing-license number if they touch sprinklers, and the electrical-contractor number for landscape lighting. Three out of four discount bids skip at least one of the three.

A licensed crew costs more because the licenses cost the company $4,000 to $11,000 a year to keep. That cost lands in the bid. It also lands in your warranty.

## Ask for the certificate of insurance, addressed to your name

Every legitimate contractor carries general liability and workers' comp. The cheap quote often does not. Ask the contractor's insurance agent (not the contractor) to email a Certificate of Insurance with **your name in the certificate-holder field**. This costs the contractor nothing and takes their agent ten minutes. Anyone who can't produce one inside two business days is uninsured for your job.

> [!warning] If a worker gets hurt on your property and the contractor isn't carrying workers' comp, your homeowners' policy is on the hook. We've seen $40,000 hospital bills land on the wrong policy. Ask for the certificate.

## Confirm they have done your specific job

Lawn care, hardscape, and snow management are three different businesses. A crew that mows 800 lawns a week is not the right crew to lay a 600-square-foot paver patio, and a hardscape crew won't show up reliably for snow at 4 a.m. Ask: "When was the last time you did this exact job? Can you give me three local addresses where I can drive past?" If they hesitate, you have your answer.

## Get a written scope, line by line

A good landscaper writes the scope before the price. The scope reads: "6-inch CA-6 compacted base; 1-inch concrete-sand setting bed; Unilock Brussels Block, Sierra blend; polymeric sand joints; aluminum edge restraint." If the scope is "patio installation," you don't have a contract — you have a hope.

We have walked into homes where the bid said "stone patio" and three months later the homeowner found out "stone" meant flagstone over sand, no edge restraint, no permit pull. Specificity is the cheapest insurance you can buy.

## Pin down who is on-site, every day

Some crews are owner-operated; the person who quoted is the person digging. Some crews are 60 employees and you'll never see the salesperson again. Both can do good work — but the contract should name the project foreman and confirm the foreman is on-site every day the crew is. If the foreman swaps mid-project, your scope drifts.

## Pull the permit, in their name

If the project needs a permit (most patios over 200 sq ft, every retaining wall over 4 feet, every electrical run for landscape lighting), the **contractor pulls the permit, in the contractor's name**. If they ask you to pull the permit "to save time" or "for the owner discount," that's a tell. They don't want their name on the permit because their inspection record is bad. Walk.

## Confirm the warranty in writing, with a duration

Most legitimate landscape warranties run 1–2 years on workmanship and pass through the manufacturer warranty on materials (paver manufacturers warranty for 25–40 years). Ask: "What's covered, for how long, and what voids it?" If the answer is verbal, the warranty is verbal — which means the warranty is fictional.

## Check three references, by phone, in the same neighborhood

Online reviews are useful but everyone has them now. Phone references in your neighborhood are the gold standard. Ask the references three things:

1.  Did the crew show up on the days they promised?
2.  Was the final invoice the same as the original bid?
3.  Has anything broken since the install, and if so, did the contractor come fix it without arguing?

The third question is the one that separates the field. Anyone can do good work; the test is what happens when something goes wrong.

## Sign a payment schedule that protects you

Standard DuPage hardscape jobs run 30% deposit, 30% on material delivery, 30% on substantial completion, 10% retainer for 30 days after final walkthrough. Anyone asking for 50%+ upfront is using your money to finish the job in front of you. This isn't always a scam, but it's always a risk.

## Read the cancellation clause

Illinois has a three-day right of rescission on home-improvement contracts signed in your home. After three days, your only out is whatever the cancellation clause in the contract says. Read it before you sign. If the clause says "non-refundable deposit," that's a $1,500–$3,000 risk you take on the day you sign.

## How we score our own bids

We give every prospective client a one-page bid that lists every spec by line. We name the foreman. We attach the certificate of insurance and the permit-pull policy. We list the warranty, in writing, with a duration. We don't always win the bid — sometimes the cheap quote wins because the homeowner doesn't know to ask these questions. We hope this guide changes that.

When you're ready to compare bids on a real project, [request a free estimate](/request-quote/) and we'll send the same one-pager to you. You can put it side-by-side with the other two bids and see what they're missing.`,
      es: `Antes de empezar: esta guía es para el propietario de DuPage que tiene tres cotizaciones que no cuadran. La barata cotizó jardín a $80 por visita; la media a $130; la cara a $185. Parecen el mismo trabajo. No son el mismo trabajo. Estas son las diez preguntas que convierten un folleto en un contrato exigible.

## Verifica que estén licenciados para el trabajo que cotizan

Illinois no licencia paisajismo general, pero sí licencia contratistas de riego, arboristas que escalan, y cualquier cuadrilla que toque eléctrica para iluminación de bajo voltaje. Pide el número de IPLA si cotizan trabajo de árboles, el número de plomería si tocan riego, y el número eléctrico para iluminación. Tres de cada cuatro cotizaciones de descuento omiten al menos uno.

Una cuadrilla licenciada cuesta más porque las licencias le cuestan a la empresa $4,000 a $11,000 al año. Ese costo aterriza en la cotización. También aterriza en tu garantía.

## Pide el certificado de seguro, dirigido a tu nombre

Todo contratista legítimo carga responsabilidad general y compensación a trabajadores. La cotización barata a menudo no. Pídele al agente de seguros del contratista (no al contratista) que envíe por correo un Certificado de Seguro con **tu nombre en el campo de tenedor del certificado**. Esto no le cuesta nada al contratista y le toma a su agente diez minutos. Quien no pueda producirlo en dos días hábiles está sin seguro para tu trabajo.

> [!warning] Si un trabajador se lastima en tu propiedad y el contratista no carga compensación, tu póliza de propietario está en riesgo. Hemos visto cuentas de hospital de $40,000 caer en la póliza equivocada.

## Confirma que han hecho tu trabajo específico

Jardín, hardscape y manejo de nieve son tres negocios distintos. Una cuadrilla que corta 800 jardines por semana no es la cuadrilla correcta para un patio de adoquines de 600 pies², y una cuadrilla de hardscape no se va a presentar confiable para nieve a las 4 a.m. Pregunta: "¿Cuándo fue la última vez que hicieron este trabajo exacto? ¿Pueden darme tres direcciones locales por donde pueda pasar?" Si dudan, tienes tu respuesta.

## Obtén un alcance escrito, línea por línea

Un buen paisajista escribe el alcance antes que el precio. El alcance se lee: "Base CA-6 compactada de 6 pulgadas; capa de arena de concreto de 1 pulgada; Unilock Brussels Block, mezcla Sierra; juntas de arena polimérica; restricción de aluminio". Si el alcance es "instalación de patio", no tienes un contrato — tienes una esperanza.

## Define quién está en sitio, todos los días

Algunas cuadrillas son operadas por dueño; quien cotizó es quien excava. Algunas son de 60 empleados y nunca verás al vendedor de nuevo. Ambas pueden hacer buen trabajo — pero el contrato debe nombrar al capataz y confirmar que está en sitio todos los días que la cuadrilla está. Si el capataz cambia a mitad de proyecto, tu alcance se desvía.

## Saca el permiso, a su nombre

Si el proyecto necesita permiso (la mayoría de patios sobre 200 pie², todo muro de contención sobre 4 pies, toda corrida eléctrica para iluminación), el **contratista saca el permiso, a nombre del contratista**. Si te piden sacarlo "para ahorrar tiempo" o "por el descuento de propietario", es señal de alerta. No quieren su nombre en el permiso porque su record de inspección es malo. Vete.

## Confirma la garantía por escrito, con duración

La mayoría de las garantías legítimas corren 1–2 años en mano de obra y pasan la garantía del fabricante en materiales (los fabricantes de adoquines garantizan 25–40 años). Pregunta: "¿Qué cubre, por cuánto tiempo, y qué la anula?" Si la respuesta es verbal, la garantía es verbal — lo que significa que la garantía es ficción.

## Verifica tres referencias, por teléfono, en el mismo vecindario

Las reseñas online son útiles pero todos las tienen ahora. Las referencias por teléfono en tu vecindario son el estándar de oro. Pregúntales tres cosas:

1.  ¿Llegó la cuadrilla en los días prometidos?
2.  ¿Fue la factura final igual a la cotización original?
3.  ¿Algo se ha roto desde la instalación, y si sí, vino el contratista a arreglarlo sin discutir?

La tercera pregunta es la que separa el campo. Cualquiera puede hacer buen trabajo; la prueba es qué pasa cuando algo sale mal.

## Firma un cronograma de pagos que te proteja

Los trabajos estándar de hardscape en DuPage corren 30% depósito, 30% al entregar material, 30% al completar, 10% retención por 30 días después del recorrido final. Quien pida 50%+ adelantado está usando tu dinero para terminar el trabajo enfrente tuyo. No siempre es estafa, pero siempre es riesgo.

## Lee la cláusula de cancelación

Illinois tiene un derecho de rescisión de tres días en contratos firmados en casa. Después de tres días, tu única salida es lo que diga la cláusula de cancelación. Léela antes de firmar. Si la cláusula dice "depósito no reembolsable", ese es un riesgo de $1,500–$3,000 que tomas el día que firmas.

## Cómo calificamos nuestras propias cotizaciones

Le damos a cada cliente prospecto una cotización de una página que lista cada especificación por línea. Nombramos al capataz. Adjuntamos el certificado de seguro y la política de permiso. Listamos la garantía, por escrito, con duración. No siempre ganamos la cotización — a veces gana la barata porque el propietario no sabe que debe preguntar. Esperamos que esta guía cambie eso.

Cuando estés listo para comparar cotizaciones en un proyecto real, [solicita una estimación gratis](/es/request-quote/) y te enviaremos la misma página. La puedes comparar lado a lado con las otras dos y ver qué les falta.`,
    },
  },

  // ============================================================
  // 3. Lawn Care Glossary
  // ============================================================
  {
    slug: 'lawn-care-glossary',
    category: 'lawn-care',
    schemaType: 'Article',
    title: {
      en: 'Lawn Care Glossary for DuPage Homeowners',
      es: 'Glosario de Cuidado de Jardín para Propietarios de DuPage',
    },
    dek: {
      en: 'Aerification to zoysia — every term in your lawn-care bid demystified, with what it costs and what it should look like.',
      es: 'De aireación a zoysia — cada término demystificado, con lo que cuesta y cómo debe verse.',
    },
    seoDescription: {
      en: 'Plain-English definitions of every lawn-care term in a DuPage homeowner bid — aerification, dethatching, pre-emergents, the works.',
      es: 'Definiciones en español claro de cada término de jardín en una cotización de DuPage — aireación, descope, pre-emergentes.',
    },
    lastUpdated: '2026-03-30',
    cardImage: {
      src: '/images/resources/lawn-care-glossary.jpg',
      alt: {
        en: 'Lawn care tools laid out on cut grass — a soil probe, a bag of seed, a spreader, and a hand rake.',
        es: 'Herramientas de jardín sobre césped cortado — sonda de suelo, bolsa de semilla, esparcidor y rastrillo.',
      },
      width: 1280,
      height: 720,
    },
    inlineServiceCrossLink: {audience: 'residential', serviceSlug: 'lawn-care'},
    body: {
      en: `If you've ever read a lawn-care bid and felt like the contractor was speaking another language, this glossary is for you. We use these terms in our own quotes; we'll define them the way they actually mean something in DuPage County, on the soils and grasses we work in every day.

## Soil and turf basics

These show up on every visit and every bid.

### Aerification (or core aeration)

A machine pulls 2–3 inch plugs out of the lawn at 4-inch intervals, leaving the cores on the surface. The plugs break down in 1–2 weeks and feed the soil. Aerification relieves compaction, lets water and fertilizer reach roots, and is the single highest-ROI service we sell. Cost in DuPage: $0.04–$0.07 per square foot, ~$160–$280 for a typical Aurora half-acre lot. Best timing: late August through mid-September.

### Dethatching

Mechanical removal of thatch, the dead-grass mat that builds up between live grass and soil. A dethatcher uses tines to rake out the layer. Most DuPage lawns don't need this every year — only when thatch exceeds half an inch. Aerification handles thatch maintenance for most homes.

### Topdressing

A thin (¼–½ inch) layer of compost or soil spread over the lawn after aerification. Improves soil tilth and feeds microbes. We charge $0.06–$0.10 per square foot when we do it; not every contractor offers it because it's labor-heavy.

### Overseeding

Adding new seed to a thinning lawn. Best paired with aerification — the seeds drop into the cores and germinate in soil contact. Overseeding alone (without aerification) on a compacted DuPage lawn is half the value.

### Tilth

Soil's physical structure — how easily it breaks apart and lets roots through. "Good tilth" reads as crumbly soil that breaks into clumps the size of corn kernels in your hand. Compacted clay (most of DuPage's east side) has bad tilth.

## Grass species in DuPage County

What's actually growing in your yard.

### Kentucky bluegrass (KBG)

The default cool-season grass for DuPage. Soft underfoot, blue-green color, recovers from damage by spreading rhizomes. Needs 1.5–2 inches of water per week. Goes dormant brown in July if not irrigated.

### Tall fescue

More heat- and drought-tolerant than KBG. Coarser blade, darker green. Doesn't spread by rhizomes (clumps grow upward), so it doesn't repair itself well; you'll overseed bare spots manually. Common in commercial properties for the lower water bill.

### Perennial ryegrass

Fast germination (5–7 days). Used as a "nurse grass" mixed with KBG so the lawn looks established while the slower KBG fills in over 2–3 seasons. Doesn't survive harsh winters as the dominant species — it's a supporting role.

### Zoysia

A warm-season grass we don't recommend for DuPage. It greens up in late May and goes dormant in October — half the year your lawn looks brown. Sold to homeowners as "low-maintenance"; for our climate, that's the wrong tradeoff.

## Fertilization and treatments

Where the bid line items start to get expensive.

### Pre-emergent

A weed-control product applied before crabgrass and other annual weeds germinate. Soil temperature is the trigger — apply when the soil hits 55°F, which in DuPage is mid-April most years. Miss the window and you're treating crabgrass instead of preventing it.

### Post-emergent

Weed control applied after the weed is up. More expensive than pre-emergent and harder on the lawn. The first round is broad-leaf herbicide for dandelions and clover; a second round in early summer hits crabgrass that the pre-emergent missed.

### Granular fertilizer

Slow-release pellets spread by a broadcast spreader. Releases nutrients over 6–12 weeks. Most DuPage programs run 4–5 granular applications per season — early spring, late spring, summer (low-nitrogen for heat tolerance), fall, and a final winterizer in October.

### Liquid fertilizer

Spray-applied. Faster uptake (1–2 weeks of color response) but shorter duration. We use liquid for spot treatment and color rescue, granular for the program.

### NPK ratio

The three numbers on every fertilizer bag — Nitrogen / Phosphorus / Potassium. A 24-0-12 bag is 24% N, 0% P, 12% K. Illinois banned phosphorus in residential lawn fertilizer (Lake-friendly law) — every legitimate bag at retail reads 0 in the middle. If you see a non-zero P number from a contractor, ask why.

## Mowing and edging

The visit-to-visit work.

### Cut height

The blade-tip-to-soil distance. Cool-season grasses (KBG, fescue) want 3.0–3.5 inches in DuPage summer. Cutting shorter stresses the roots and invites crabgrass. We mow at 3.0 inches in spring and fall, 3.5 inches in summer.

### Mulch mowing

Mowing with a mulch deck so the clippings drop back into the lawn. Returns about 25% of the lawn's nitrogen needs over the season. Free fertilizer; most programs don't offer it because the lawn looks "messier" for two days after each cut.

### Edging vs. trimming

Edging cuts a clean vertical line where lawn meets driveway, sidewalk, or bed; uses a powered edger with a steel blade. Trimming uses a string trimmer to cut grass the mower can't reach (around fences, posts, trees). Most bids list both as one line; ask what your bid covers.

### Cleanup

The blow-off. A two-stroke blower clears the driveway, walks, and patio of clippings after every cut. If the bid doesn't include cleanup, you'll find clippings in your house tracked in for a week.

## What the bid should look like

After reading the glossary, run your last bid through this filter:

- Does it specify cut height (3.0 / 3.5)?
- Does it list the number of fertilizer rounds (4 vs. 5 vs. 6)?
- Does it call out aerification timing and lot size?
- Does it specify pre- vs. post-emergent and the soil-temperature trigger?

If three of the four are missing, the bid is selling you "lawn care" without telling you what's in the box.

We have a lot to say about each of these — but the short answer for most DuPage homes is: KBG/fescue blend, mowed at 3.0–3.5 inches, 4-round granular program with a pre-emergent, aerification + overseeding in late August. Anything fancier is upsell unless your soil tells you otherwise.`,
      es: `Si has leído alguna vez una cotización de jardín y sentiste que el contratista hablaba otro idioma, este glosario es para ti. Usamos estos términos en nuestras propias cotizaciones; los definiremos como realmente significan algo en el condado de DuPage.

## Suelo y césped básico

Estos aparecen en cada visita y cada cotización.

### Aireación (o aireación de núcleo)

Una máquina extrae tapones de 2–3 pulgadas del jardín a intervalos de 4 pulgadas, dejándolos en la superficie. Los tapones se descomponen en 1–2 semanas y alimentan el suelo. La aireación alivia la compactación y deja que agua y fertilizante lleguen a las raíces. Es el servicio de mayor retorno que vendemos. Costo en DuPage: $0.04–$0.07 por pie², ~$160–$280 para un lote típico de medio acre en Aurora. Mejor temporada: finales de agosto a mediados de septiembre.

### Descope (Dethatching)

Eliminación mecánica del descope, la capa muerta entre el césped vivo y el suelo. Un descopeador usa púas para rasparla. La mayoría de jardines de DuPage no necesita esto cada año — solo cuando supera media pulgada.

### Recubrimiento (Topdressing)

Una capa delgada (¼–½ pulgada) de composta o suelo extendida después de aireación. Mejora la estructura del suelo y alimenta los microbios. Cobramos $0.06–$0.10 por pie² cuando lo hacemos.

### Resiembra

Agregar semilla nueva a un jardín que se está adelgazando. Mejor combinada con aireación — las semillas caen en los hoyos y germinan en contacto con el suelo. La resiembra sola (sin aireación) en un jardín compactado es la mitad del valor.

### Estructura del suelo (Tilth)

Cómo se desmenuza el suelo y deja pasar las raíces. "Buena estructura" se siente como suelo que se rompe en grumos del tamaño de granos de maíz. La arcilla compactada (la mayoría del este de DuPage) tiene mala estructura.

## Especies de césped en el condado de DuPage

Lo que realmente crece en tu jardín.

### Kentucky bluegrass (KBG)

El césped de temporada fría predeterminado en DuPage. Suave al pisar, color verde-azul, se recupera del daño extendiéndose por rizomas. Necesita 1.5–2 pulgadas de agua por semana. Se duerme y se pone marrón en julio si no se riega.

### Tall fescue

Más tolerante al calor y la sequía que el KBG. Hoja más gruesa, verde más oscuro. No se extiende por rizomas (crece en grupos hacia arriba), entonces no se repara solo. Común en propiedades comerciales por la cuenta de agua más baja.

### Ryegrass perenne

Germinación rápida (5–7 días). Se usa como "césped nodriza" mezclado con KBG para que el jardín se vea establecido mientras el KBG más lento llena en 2–3 temporadas.

### Zoysia

Un césped de temporada cálida que no recomendamos para DuPage. Se pone verde a finales de mayo y se duerme en octubre — la mitad del año tu jardín se ve marrón.

## Fertilización y tratamientos

Donde las líneas de la cotización se ponen caras.

### Pre-emergente

Un control de malezas aplicado antes de que el pasto cangrejo y otras malezas anuales germinen. La temperatura del suelo es el disparador — aplica cuando el suelo llega a 13°C, que en DuPage es a mediados de abril la mayoría de los años.

### Post-emergente

Control de malezas aplicado después de que la maleza está arriba. Más caro y más duro al jardín. La primera ronda es herbicida de hoja ancha para dientes de león y trébol.

### Fertilizante granular

Pellets de liberación lenta esparcidos. Libera nutrientes en 6–12 semanas. La mayoría de programas de DuPage corren 4–5 aplicaciones granulares por temporada.

### Fertilizante líquido

Aplicado por aspersión. Absorción más rápida (1–2 semanas de respuesta de color) pero duración más corta.

### Proporción NPK

Los tres números en cada bolsa — Nitrógeno / Fósforo / Potasio. Una bolsa 24-0-12 es 24% N, 0% P, 12% K. Illinois prohibió el fósforo en fertilizante residencial.

## Cortar y bordear

El trabajo visita a visita.

### Altura de corte

La distancia entre la punta de la cuchilla y el suelo. Los céspedes de temporada fría quieren 3.0–3.5 pulgadas en verano DuPage. Cortar más corto estresa las raíces.

### Corte mulching

Cortar con una cubierta mulching para que los recortes caigan de vuelta al jardín. Devuelve cerca del 25% de las necesidades de nitrógeno.

### Bordear vs. recortar

Bordear corta una línea vertical limpia donde el jardín se encuentra con la entrada o acera. Recortar usa un recortador de hilo para cortar pasto que el cortacésped no alcanza.

### Limpieza

El soplado. Un soplador de dos tiempos limpia la entrada, caminos y patio de recortes después de cada corte.

## Cómo debe verse la cotización

Después de leer el glosario, pasa tu última cotización por este filtro:

- ¿Especifica altura de corte (3.0 / 3.5)?
- ¿Lista el número de rondas de fertilizante (4 vs. 5 vs. 6)?
- ¿Menciona la temporada de aireación y tamaño del lote?
- ¿Especifica pre- vs. post-emergente y el disparador de temperatura del suelo?

Si tres de los cuatro faltan, la cotización te está vendiendo "cuidado de jardín" sin decirte qué hay en la caja.`,
    },
    faq: [
      {
        q: {
          en: 'What is the most cost-effective lawn-care service if I only do one thing?',
          es: '¿Cuál es el servicio más costo-efectivo si solo hago uno?',
        },
        a: {
          en: 'Aerification + overseeding in late August. It rebuilds the lawn from the soil up. We have lawns in Naperville that bounced from 30% to 80% turf cover after one September pass.',
          es: 'Aireación + resiembra a finales de agosto. Reconstruye el jardín desde el suelo. Hemos visto jardines en Naperville saltar de 30% a 80% de cobertura tras una pasada en septiembre.',
        },
      },
      {
        q: {
          en: 'Can I skip pre-emergent and just deal with crabgrass after?',
          es: '¿Puedo omitir el pre-emergente y solo tratar el pasto cangrejo después?',
        },
        a: {
          en: 'You can — but the math is bad. A pre-emergent round runs about $90 on a typical DuPage lot. The post-emergent round to clean up missed crabgrass runs $140 and stresses the lawn for 2 weeks. Pre-emergent is the cheapest insurance in the program.',
          es: 'Puedes — pero la matemática es mala. Una ronda pre-emergente cuesta unos $90 en un lote típico. La ronda post-emergente para limpiar el pasto cangrejo cuesta $140 y estresa el jardín por 2 semanas.',
        },
      },
      {
        q: {
          en: 'Is mulch mowing actually better than bagging?',
          es: '¿El corte mulching es realmente mejor que ensacar?',
        },
        a: {
          en: "Yes, in DuPage's climate. Mulched clippings break down in 5–7 days and feed the lawn. Bagging removes the nitrogen the lawn just used; you'll need 25% more fertilizer to compensate. The exception is the first cut after a long rain — clippings are too wet to mulch and clump up; bag that one.",
          es: 'Sí, en el clima de DuPage. Los recortes mulched se descomponen en 5–7 días y alimentan el jardín. La excepción es el primer corte tras una lluvia larga — los recortes están muy mojados; ensaca ese.',
        },
      },
    ],
  },

  // ============================================================
  // 4. Snow Service Levels for PMs
  // ============================================================
  {
    slug: 'snow-service-levels-for-pms',
    category: 'snow-and-winter',
    schemaType: 'Article',
    byline: 'Erick Sotomayor',
    title: {
      en: 'Snow Removal Service Levels Explained for Property Managers',
      es: 'Niveles de Servicio de Remoción de Nieve para Property Managers',
    },
    dek: {
      en: 'Three commercial snow service levels — what each one promises, what it costs, and how to write the contract that holds the vendor to it.',
      es: 'Tres niveles de servicio comercial — qué promete cada uno, qué cuesta, y cómo escribir el contrato.',
    },
    seoDescription: {
      en: 'A field-tested guide to commercial snow service levels in DuPage County. Trigger depths, response windows, and contract language that protects PMs.',
      es: 'Guía práctica de niveles de servicio comercial de nieve en DuPage. Profundidades, ventanas de respuesta y lenguaje contractual.',
    },
    lastUpdated: '2026-03-15',
    cardImage: {
      src: '/images/resources/snow-service-levels-for-pms.jpg',
      alt: {
        en: 'A commercial parking lot at sunrise, freshly plowed with snow piles at the perimeter and salt across the surface.',
        es: 'Un estacionamiento comercial al amanecer, recién arado con pilas de nieve y sal en la superficie.',
      },
      width: 1280,
      height: 720,
    },
    inlineServiceCrossLink: {audience: 'commercial', serviceSlug: 'snow-removal'},
    body: {
      en: `Property managers running multi-tenant commercial sites in DuPage know the snow phone calls. The 6 a.m. tenant complaint that the lot wasn't plowed by 7. The HOA board email asking why the salt is in piles instead of spread. The slip-and-fall claim that surfaces three weeks after the storm.

This guide is the contract you wish your last vendor had signed. Three service levels, what each one means in practice, and the language that holds the crew to it.

## Level 1: Standard Plow

The default tier. Triggered at 2 inches accumulation. Crew arrives within 4 hours of the trigger. Plows once, salts the lot perimeter, and leaves.

Most DuPage commercial sites buy this and complain about it for the rest of the winter. The complaint is fair — Level 1 is built for residential driveways, not commercial properties with tenant traffic.

| Spec | Where it should land |
|---|---|
| Trigger depth | 2 inches accumulation |
| Response window | 4 hours from trigger |
| Plow passes | 1 (post-storm only) |
| Salt | Perimeter only, walks not included |
| Per-event cost | $180–$320 for a 0.5-acre lot |
| Best for | Single-tenant retail, low-traffic small sites |

### Where Level 1 fails

A multi-tenant medical office gets traffic at 6 a.m., 7, 8, and through the day. By 7 a.m. the lot is half-plowed and half-trampled snow. Level 1 is built around the storm, not around your tenants' arrival schedule.

## Level 2: Multi-Pass Plow + Walks

Triggered at 1 inch accumulation. Crew arrives within 2 hours. Plows up to three passes during the storm, salts the perimeter and the main aisles, and clears walks (front entry, side entrances, ADA ramps, tenant doors).

This is the right tier for most DuPage commercial sites with tenant turnover before 8 a.m. — medical offices, multi-tenant retail strips, and HOA common-areas with foot traffic.

| Spec | Where it should land |
|---|---|
| Trigger depth | 1 inch accumulation |
| Response window | 2 hours from trigger |
| Plow passes | Up to 3 during the storm + 1 post-storm cleanup |
| Salt | Lot + walks; full re-application post-storm |
| Walks cleared | All entries, ADA ramps, tenant doors (1.5–2.5 inches per pass) |
| Per-event cost | $420–$780 for a 0.5-acre lot |
| Best for | Multi-tenant offices, medical, retail with morning traffic |

### What's not in Level 2

Level 2 doesn't include freezing-rain de-icing if the temperature stays above 32°F (no plowable accumulation but real ice forms). Add the de-icing rider; we'll get to that under Level 3.

## Level 3: Full-Service Premium

Triggered at any precipitation event (snow, sleet, freezing rain, mixed). Crew is on-site at the trigger and remains on-site for storm duration. Continuous plowing, walks cleared every 60 minutes during active snow, full salt program, and freezing-rain pre-treatment.

This is the right tier for medical campuses, hospitality (hotels), and any property where a slip-and-fall claim costs more than a season of premium service. We've serviced two Naperville medical sites at this tier for 15 years and never logged a winter slip claim against either property.

| Spec | Where it should land |
|---|---|
| Trigger | Any precipitation event |
| Response | On-site at trigger; remains for storm duration |
| Plow passes | Continuous — 60-minute cycle minimum |
| Salt | Full lot + walks; pre-treatment for forecast events |
| Walks cleared | Every 60 minutes during active snow |
| Per-event cost | $1,200–$2,400 for a 0.5-acre lot, depending on storm duration |
| Best for | Medical, hospitality, slip-and-fall-sensitive sites |

> [!tip] Premium service is priced per-event, not per-inch. Budget on a 25-event winter (DuPage average); a small mediation event still costs full-event price because the crew is on-site.

## Contract language that protects you

Whatever level you buy, the contract should specify five things. We've seen vendors weasel out of every one when the language is vague.

### Trigger depth in inches, measured at the site

"Plow on accumulation of 2 inches measured at [property address]" — not "plow on accumulation" or "plow as needed." Vendors who control the trigger control the bill.

### Response window in hours, with a clock-start definition

"Crew on-site within 2 hours of trigger; trigger clock starts at the time the depth is met at the site, not at the time of vendor's site arrival decision." Without this, the response clock starts when the vendor decides to leave the yard.

### Salt volume, in pounds per acre, per application

"100 lb/acre per salting pass; full re-application post-storm." Salt is the line item vendors pad. Pounds-per-acre puts a number on it.

### Documentation: time-stamped photos, every pass

"Crew photographs lot before and after each plow pass; photos uploaded to [shared folder] within 30 minutes of pass." This is the single most important clause. Photo logs end disputes before they start.

### Slip-and-fall response within 24 hours of report

"On notification of slip incident, crew returns to property within 24 hours to inspect, photograph, and re-treat affected area." The first 24 hours are the window where the vendor's response either supports your insurance defense or does not.

## How to score a snow vendor bid

Walk the bid through this checklist:

1.  Trigger depth named in inches (not "as needed").
2.  Response window in hours, with clock-start definition.
3.  Pre-treatment included for forecast events.
4.  Walks cleared at the same level as the lot.
5.  Photo documentation specified, with upload destination.
6.  Slip-and-fall response window in writing.
7.  Per-event cost — not per-inch (per-inch incentivizes the vendor to bury you in salt).
8.  Cancellation clause for missed events (3 strikes / out is industry standard).

If the bid carries fewer than six of the eight, you're looking at a vendor that wants flexibility you'll regret in February.

## What we ship in our PM contracts

Every Sunset Services PM contract includes the eight items above as standard language. We're happy to send a sample contract — most PMs find it useful to compare against the contract they have. Email us, or [request a free site walk](/request-quote/?from=resources) and we'll come measure the lot in person.`,
      es: `Los property managers que operan sitios comerciales multi-inquilino en DuPage conocen las llamadas de nieve. La queja del inquilino a las 6 a.m. de que el lote no estaba arado a las 7. El correo del consejo HOA preguntando por qué la sal está en pilas en vez de esparcida. La reclamación de resbalón que aparece tres semanas después.

Esta guía es el contrato que ojalá tu último vendor hubiera firmado. Tres niveles de servicio, qué significa cada uno en la práctica, y el lenguaje que mantiene a la cuadrilla cumpliendo.

## Nivel 1: Arado Estándar

El nivel predeterminado. Activado a 2 pulgadas de acumulación. La cuadrilla llega en 4 horas. Ara una vez, sala el perímetro del lote, y se va.

La mayoría de los sitios comerciales de DuPage compra esto y se queja el resto del invierno. La queja es justa — el Nivel 1 está diseñado para entradas residenciales, no para propiedades comerciales con tráfico de inquilinos.

| Especificación | Dónde debería estar |
|---|---|
| Disparador | 2 pulgadas |
| Ventana de respuesta | 4 horas |
| Pases de arado | 1 (post-tormenta) |
| Sal | Solo perímetro |
| Costo por evento | $180–$320 para 0.5 acre |
| Mejor para | Retail mono-inquilino, sitios pequeños |

### Donde falla el Nivel 1

Una oficina médica multi-inquilino recibe tráfico a las 6 a.m., 7, 8, y todo el día. A las 7 a.m. el lote está medio-arado y medio-pisado. El Nivel 1 está construido alrededor de la tormenta, no alrededor del horario de llegada de tus inquilinos.

## Nivel 2: Arado Multi-Pase + Caminos

Activado a 1 pulgada. La cuadrilla llega en 2 horas. Ara hasta tres veces durante la tormenta, sala perímetro y pasillos principales, y limpia caminos.

Este es el nivel correcto para la mayoría de sitios comerciales con tráfico antes de las 8 a.m. — oficinas médicas, plazas multi-inquilino, áreas comunes HOA con tráfico peatonal.

| Especificación | Dónde debería estar |
|---|---|
| Disparador | 1 pulgada |
| Ventana de respuesta | 2 horas |
| Pases de arado | Hasta 3 durante + 1 limpieza post |
| Sal | Lote + caminos; reaplicación completa post |
| Caminos | Entradas, rampas ADA, puertas |
| Costo por evento | $420–$780 para 0.5 acre |
| Mejor para | Oficinas multi-inquilino, médicas, retail matutino |

### Lo que NO está en el Nivel 2

El Nivel 2 no incluye descongelado si la temperatura se mantiene sobre 0°C (sin acumulación pero hielo real se forma). Agrega el adicional de descongelado.

## Nivel 3: Premium Servicio Completo

Activado en cualquier evento (nieve, aguanieve, lluvia helada, mixto). La cuadrilla está en sitio al disparador y permanece la duración de la tormenta.

Este es el nivel correcto para campus médicos, hospitalidad (hoteles), y cualquier propiedad donde una reclamación de resbalón cuesta más que una temporada de servicio premium. Hemos atendido dos sitios médicos en Naperville en este nivel por 15 años y no hemos registrado ninguna reclamación contra ninguna propiedad.

| Especificación | Dónde debería estar |
|---|---|
| Disparador | Cualquier evento |
| Respuesta | En sitio al disparador; permanece toda la tormenta |
| Pases de arado | Continuo — ciclo mínimo de 60 minutos |
| Sal | Lote + caminos; pre-tratamiento para pronóstico |
| Caminos | Cada 60 minutos durante nieve activa |
| Costo por evento | $1,200–$2,400 para 0.5 acre |
| Mejor para | Médico, hospitalidad, sitios sensibles a resbalones |

> [!tip] El servicio premium se cotiza por evento, no por pulgada. Presupuesta para un invierno de 25 eventos (promedio DuPage); un evento pequeño aún cuesta el precio completo porque la cuadrilla está en sitio.

## Lenguaje contractual que te protege

Cualquier nivel que compres, el contrato debe especificar cinco cosas. Hemos visto vendors escabullirse de cada una con lenguaje vago.

### Profundidad del disparador en pulgadas, medida en el sitio

"Arar a acumulación de 2 pulgadas medida en [dirección]" — no "arar según necesidad". Los vendors que controlan el disparador controlan la cuenta.

### Ventana de respuesta en horas, con definición de inicio del reloj

"Cuadrilla en sitio en 2 horas del disparador; el reloj empieza al alcanzar la profundidad en el sitio".

### Volumen de sal, en libras por acre, por aplicación

"100 lb/acre por pase; reaplicación completa post-tormenta". La sal es la línea que los vendors inflan. Libras-por-acre pone un número.

### Documentación: fotos con marca de tiempo, cada pase

"Cuadrilla fotografía lote antes y después de cada pase; fotos cargadas a [carpeta compartida] en 30 minutos". Esta es la cláusula más importante. Los registros fotográficos terminan disputas antes de que empiecen.

### Respuesta a resbalones en 24 horas

"Al notificar incidente de resbalón, cuadrilla regresa en 24 horas a inspeccionar, fotografiar y re-tratar". Las primeras 24 horas son la ventana donde la respuesta del vendor apoya tu defensa de seguro o no.

## Cómo calificar una cotización

Pasa la cotización por esta lista:

1.  Profundidad disparadora nombrada (no "según necesidad").
2.  Ventana de respuesta en horas, con definición de inicio.
3.  Pre-tratamiento incluido.
4.  Caminos al mismo nivel que el lote.
5.  Documentación fotográfica especificada.
6.  Ventana de respuesta a resbalones por escrito.
7.  Costo por evento — no por pulgada.
8.  Cláusula de cancelación por eventos perdidos (3 strikes estándar).

Si la cotización tiene menos de seis de ocho, estás viendo un vendor que quiere flexibilidad que lamentarás en febrero.`,
    },
    faq: [
      {
        q: {
          en: 'What does Level 2 service typically cost for a 1-acre commercial site?',
          es: '¿Cuánto cuesta típicamente Nivel 2 para un sitio de 1 acre?',
        },
        a: {
          en: 'In DuPage, Level 2 on a 1-acre commercial site averages $850–$1,400 per event, with a 25-event winter budget of $21,000–$35,000. The variance is mostly storm duration; a 12-hour storm hits the upper end.',
          es: 'En DuPage, el Nivel 2 en 1 acre promedia $850–$1,400 por evento, con un presupuesto invernal de 25 eventos de $21,000–$35,000.',
        },
      },
      {
        q: {
          en: 'How do I write a contract that lets me cancel a vendor mid-winter?',
          es: '¿Cómo escribo un contrato que permita cancelar a mitad de invierno?',
        },
        a: {
          en: '"Three documented service failures (missed trigger, late response by 90+ minutes, or photo-log gap) within a single season trigger a 7-day cure period; failure to cure terminates the contract with no further obligation." Most vendors will sign this.',
          es: '"Tres fallas documentadas (disparador perdido, respuesta tardía por 90+ minutos, o falta de fotos) en una temporada activan un período de cura de 7 días; falla en curar termina el contrato".',
        },
      },
    ],
  },

  // ============================================================
  // 5. DuPage Hardscape Permits
  // ============================================================
  {
    slug: 'dupage-hardscape-permits',
    category: 'local-permits',
    schemaType: 'Article',
    title: {
      en: 'Hardscape Permits in DuPage County: A Quick Reference',
      es: 'Permisos de Hardscape en el Condado de DuPage: Referencia Rápida',
    },
    dek: {
      en: 'Permit thresholds for patios, walls, and driveways across the six DuPage municipalities we work in — and what triggers an inspection.',
      es: 'Umbrales de permisos para patios, muros y entradas en los seis municipios de DuPage donde trabajamos.',
    },
    seoDescription: {
      en: 'Hardscape permit thresholds in Aurora, Naperville, Wheaton, Lisle, Bolingbrook, and Batavia — patios, retaining walls, and driveways. Updated 2026.',
      es: 'Umbrales de permisos de hardscape en Aurora, Naperville, Wheaton, Lisle, Bolingbrook y Batavia. Actualizado 2026.',
    },
    lastUpdated: '2026-04-01',
    cardImage: {
      src: '/images/resources/dupage-hardscape-permits.jpg',
      alt: {
        en: 'A blueprint, a permit application, and a measuring tape laid out on a clipboard with a paver in the corner.',
        es: 'Un plano, una solicitud de permiso y una cinta métrica en un portapapeles con un adoquín en la esquina.',
      },
      width: 1280,
      height: 720,
    },
    body: {
      en: `Three out of four hardscape disputes we mediate started with a missed permit. The crew didn't pull one. The homeowner didn't ask. The city found out at resale, when the inspection report flagged an unpermitted patio. Now the homeowner is paying for a retroactive permit, an engineering report, and sometimes a partial demolition — at sale time, when they had the least leverage.

This guide is the cheat sheet for the six municipalities Sunset Services works in. Thresholds are accurate as of April 2026; municipal rules change, so confirm at your village's building department before you sign.

## Patios and walkways

| Municipality | Threshold | Notes |
|---|---|---|
| Aurora | 100 sq ft | Plus any surface that drains toward neighbor's lot, regardless of size. |
| Naperville | 200 sq ft | Plus any surface within 5 ft of property line. |
| Wheaton | Any size | All hardscape requires a permit; threshold is zero. |
| Lisle | 200 sq ft | Stricter on impervious surface ratio (40% lot max). |
| Bolingbrook | 150 sq ft | Plus driveway extensions of any size. |
| Batavia | 200 sq ft | Plus any work in floodplain (parts of east Batavia). |

Every municipality except Wheaton uses a square-foot threshold. Wheaton's "any size" rule catches a lot of homeowners off-guard — even a 6×6 patio (36 sq ft) needs a permit there.

### Engineering required

Above 600 sq ft, most municipalities want a stamped engineering drawing (drainage plan, base spec, joint detail). Cost: $400–$900 with a local engineer. If the contractor's bid says "engineering included," ask which engineer and ask to see one of their stamped drawings.

## Retaining walls

| Wall height | Permit | Engineering |
|---|---|---|
| Under 30 inches | Most municipalities: no permit | Not required |
| 30–48 inches | Permit in every DuPage municipality | Stamped drawing usually required |
| Over 48 inches | Permit + structural engineering required | Geotechnical soil report often required |

The 48-inch threshold is the one that gets missed. A "decorative" wall built without engineering at 50 inches is a structural wall in the eyes of the inspector — and structural walls without engineering get red-tagged.

> [!warning] We have torn out two unpermitted retaining walls in Lisle this year. Both were 50–60 inches, both lacked engineering, both showed bulging at the base. Cost to redo with permit + engineering: $14,000–$22,000. Cost to do it right the first time: $9,000–$13,000.

## Driveways and driveway extensions

Every DuPage municipality permits driveway work. The thresholds we see most often:

- **New driveways:** permit required, regardless of size. Most cities cap impervious surface at 35–45% of lot.
- **Extensions:** permit required if the extension is more than 50 sq ft (most cities) or any size (Bolingbrook).
- **Resurfacing:** typically no permit if the resurface keeps the existing footprint and uses the same material.
- **Material changes:** permit required even on same-footprint resurface if material changes (asphalt to concrete, concrete to pavers).

### Apron permits

The "apron" is the section of driveway from the city sidewalk to the curb. Most municipalities require a separate apron permit pulled by the homeowner or contractor through the public works department. Cost: $50–$200 plus the construction-bond deposit.

## Outdoor kitchens, fire features, and landscape lighting

These are the three categories where homeowners assume "no permit needed" and are wrong.

### Outdoor kitchens

If gas or electrical is run, you need a permit. Period. Plumbing for a sink adds a plumbing-license requirement. Cost: $200–$400 mechanical/electrical permit, plus the contractor's licensed-trade subcontractor markup.

### Fire pits and fire features

Wood-burning: most municipalities allow without permit if the pit is freestanding and 25+ feet from any structure. Gas: requires a mechanical permit. Permanent stone fireplaces (chimney included): require a structural permit and sometimes a setback variance.

### Landscape lighting

Low-voltage (12V transformer): no permit in most DuPage cities. Line-voltage (120V direct): requires a licensed electrician and an electrical permit. The transformer-based systems we install are no-permit; full-voltage post lights down a long driveway are.

## What an unpermitted job costs at resale

The Cook and DuPage assessor's offices flag unpermitted work during the home's tax assessment review. At resale, the buyer's home inspector flags it again. The seller has three options:

1.  **Retroactive permit:** $400–$2,200 in permit + engineering, plus 4–8 weeks of inspection cycle. Sometimes triggers partial demolition if base spec was not met.
2.  **Demolish:** rip out the unpermitted work before listing. Costs $4,000–$15,000 depending on size.
3.  **Disclose and discount:** disclose to the buyer, offer a credit. Buyers' agents typically demand 1.3–1.8× the permit cost as the credit.

None of those options costs less than pulling the permit at install time.

## How we handle permits

Every Sunset Services hardscape contract includes the permit pull as a line item, in our name. We file the application, attach the stamped engineering when required, schedule the inspections, and pass the inspection certificate to the homeowner at job close. If the inspection finds a deficiency, we fix it on us — that's why our name is on the permit.

If you've already had a job done and you're wondering whether it was permitted, the village's building department will tell you over the phone. Five-minute call, costs nothing, and the answer is the answer.`,
      es: `Tres de cada cuatro disputas de hardscape que mediamos empezaron con un permiso perdido. La cuadrilla no lo sacó. El propietario no preguntó. La ciudad lo descubrió al revender, cuando el reporte de inspección marcó un patio sin permiso.

Esta guía es la chuleta para los seis municipios donde Sunset Services trabaja. Los umbrales son precisos a abril 2026; las reglas cambian, así que confirma en el departamento de construcción de tu villa antes de firmar.

## Patios y caminos

| Municipio | Umbral | Notas |
|---|---|---|
| Aurora | 100 pie² | Más cualquier superficie que drene hacia el lote del vecino. |
| Naperville | 200 pie² | Más cualquier superficie a 5 pies de línea de propiedad. |
| Wheaton | Cualquier tamaño | Todo hardscape requiere permiso; umbral es cero. |
| Lisle | 200 pie² | Más estricto en superficie impermeable (40% del lote máx.). |
| Bolingbrook | 150 pie² | Más extensiones de entrada de cualquier tamaño. |
| Batavia | 200 pie² | Más cualquier trabajo en zona de inundación. |

Cada municipio excepto Wheaton usa un umbral de pies cuadrados. La regla de "cualquier tamaño" de Wheaton agarra a muchos propietarios — incluso un patio de 6×6 (36 pie²) necesita permiso allí.

### Ingeniería requerida

Sobre 600 pie², la mayoría quiere un dibujo de ingeniería sellado (plan de drenaje, especificación de base, detalle de junta). Costo: $400–$900 con un ingeniero local.

## Muros de contención

| Altura del muro | Permiso | Ingeniería |
|---|---|---|
| Bajo 30 pulgadas | La mayoría: sin permiso | No requerida |
| 30–48 pulgadas | Permiso en cada municipio | Dibujo sellado usualmente requerido |
| Sobre 48 pulgadas | Permiso + ingeniería estructural | Reporte geotécnico a menudo requerido |

El umbral de 48 pulgadas es el que se pierde. Un muro "decorativo" construido sin ingeniería a 50 pulgadas es un muro estructural a ojos del inspector — y muros estructurales sin ingeniería son etiquetados rojo.

> [!warning] Hemos derribado dos muros sin permiso en Lisle este año. Ambos eran de 50–60 pulgadas, ambos carecían de ingeniería, ambos mostraban abultamiento en la base. Costo de rehacer: $14,000–$22,000. Costo de hacerlo bien la primera vez: $9,000–$13,000.

## Entradas y extensiones de entrada

Cada municipio de DuPage permite trabajo de entrada. Los umbrales más comunes:

- **Entradas nuevas:** permiso requerido, sin importar tamaño. La mayoría limita superficie impermeable al 35–45% del lote.
- **Extensiones:** permiso si la extensión supera 50 pie² (la mayoría) o cualquier tamaño (Bolingbrook).
- **Resuperficie:** típicamente sin permiso si mantiene la huella y usa el mismo material.
- **Cambios de material:** permiso requerido aún en misma huella si el material cambia.

### Permisos de delantal

El "delantal" es la sección de entrada desde la acera de la ciudad hasta el bordillo. La mayoría requiere un permiso separado por obras públicas. Costo: $50–$200 más el depósito de fianza.

## Cocinas exteriores, características de fuego, e iluminación

Estas son las tres categorías donde los propietarios asumen "no se necesita permiso" y están equivocados.

### Cocinas exteriores

Si se corre gas o eléctrica, necesitas permiso. Punto. Plomería para un fregadero agrega requisito de licencia de plomería.

### Fogatas y características de fuego

A leña: la mayoría permite sin permiso si la fogata es independiente y a 25+ pies de cualquier estructura. A gas: requiere permiso mecánico. Chimeneas permanentes de piedra: permiso estructural y a veces variante de retiro.

### Iluminación de paisaje

Bajo voltaje (transformador 12V): sin permiso en la mayoría. Voltaje de línea (120V directo): requiere electricista licenciado y permiso eléctrico.

## Lo que cuesta un trabajo sin permiso al revender

Las oficinas del tasador del condado marcan el trabajo sin permiso durante la revisión fiscal. Al revender, el inspector del comprador lo marca de nuevo. El vendedor tiene tres opciones:

1.  **Permiso retroactivo:** $400–$2,200 en permiso + ingeniería, más 4–8 semanas de ciclo de inspección.
2.  **Demoler:** quitar el trabajo sin permiso antes de listar. $4,000–$15,000 dependiendo del tamaño.
3.  **Divulgar y descontar:** los agentes del comprador típicamente exigen 1.3–1.8× el costo del permiso como crédito.

Ninguna de esas opciones cuesta menos que sacar el permiso en el momento de la instalación.

## Cómo manejamos los permisos

Cada contrato de hardscape de Sunset Services incluye el permiso como línea, a nuestro nombre. Presentamos la solicitud, adjuntamos la ingeniería sellada cuando se requiere, programamos las inspecciones, y pasamos el certificado de inspección al propietario al cerrar el trabajo.`,
    },
  },
];

export function isResourceCategory(value: string): value is ResourceCategory {
  return (RESOURCE_CATEGORIES as string[]).includes(value);
}

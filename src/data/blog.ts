/**
 * Typed Blog seed — Phase 1.18 §12.4 / §2 D19.
 *
 * Five posts at launch. Body is authored in Markdown; reading-time +
 * word count are computed at build by `src/data/getBlog.ts`. Featured
 * images are placeholders Cowork swaps in Phase 2.04.
 *
 * Byline assignments per ratified D14.7:
 *  - #1 Erick Sotomayor (cost guide — author signal matters)
 *  - #2 Sunset Services Team (seasonal calendar — institutional voice)
 *  - #3 Erick Sotomayor (Marcin candidate flagged for Cowork ratification)
 *  - #4 Erick Sotomayor (commercial trust-builder)
 *  - #5 Sunset Services Team
 */

import type {Locale} from '@/i18n/locales';

export type BlogCategory =
  | 'how-to'
  | 'cost-guide'
  | 'seasonal'
  | 'industry-news'
  | 'audience';

export const BLOG_CATEGORIES: BlogCategory[] = [
  'how-to',
  'cost-guide',
  'seasonal',
  'industry-news',
  'audience',
];

export interface BlogFAQ {
  q: Record<Locale, string>;
  a: Record<Locale, string>;
}

export interface BlogImage {
  /** `/images/blog/{slug}.jpg` placeholder; Cowork swaps in 2.04. */
  src: string;
  /** Mobile (4:3) variant. Optional — falls back to `src`. */
  srcMobile?: string;
  /** ≤125 chars; describes what's in the photo, not the post topic. */
  alt: Record<Locale, string>;
  width: number;
  height: number;
}

export interface BlogPostEntry {
  slug: string;
  category: BlogCategory;
  /** Only set when `category === 'audience'`. */
  subAudience?: 'residential' | 'commercial' | 'hardscape';
  schemaType: 'BlogPosting' | 'Article';
  title: Record<Locale, string>;
  dek: Record<Locale, string>;
  body: Record<Locale, string>;
  seoDescription?: Record<Locale, string>;
  /** Required on every post — no team-fallback default for blog. */
  byline: string;
  /** ISO 8601 — drives the visible date and `datePublished` schema. */
  publishedAt: string;
  /** ISO 8601 — `dateModified` falls back to `publishedAt`. */
  updatedAt?: string;
  featuredImage: BlogImage;
  faq?: BlogFAQ[];
  inlineServiceCrossLink?: {
    audience: 'residential' | 'commercial' | 'hardscape';
    serviceSlug: string;
  };
  /** city slug; renders `<ServiceAreaStrip>` in body if present. */
  inlineLocationCity?: string;
  // computed at build (do NOT author):
  wordCount?: number;
  readingMinutes?: number;
}

export const BLOG_POSTS: BlogPostEntry[] = [
  // ============================================================
  // 1. DuPage Patio Cost 2026 (cost-guide / Erick byline)
  // ============================================================
  {
    slug: 'dupage-patio-cost-2026',
    category: 'cost-guide',
    schemaType: 'BlogPosting',
    byline: 'Erick Sotomayor',
    title: {
      en: 'How Much Does a Patio Cost in DuPage County in 2026?',
      es: '¿Cuánto Cuesta un Patio en el Condado de DuPage en 2026?',
    },
    dek: {
      en: 'Real numbers from real bids — concrete, paver, and natural-stone — across the 6 cities we work in. Updated for the 2026 season.',
      es: 'Números reales de cotizaciones reales — concreto, adoquines y piedra natural — en las 6 ciudades donde trabajamos.',
    },
    seoDescription: {
      en: 'Patio cost in DuPage County in 2026: $12–$60/sq ft installed across concrete, paver, and natural stone. Real bid ranges from a 25-year crew.',
      es: 'Costo de patio en DuPage en 2026: $12–$60/pie² instalado en concreto, adoquines y piedra natural. Rangos reales. [TBR]',
    },
    publishedAt: '2026-04-12',
    featuredImage: {
      src: '/images/blog/dupage-patio-cost-2026.jpg',
      srcMobile: '/images/blog/dupage-patio-cost-2026-mobile.jpg',
      alt: {
        en: 'A finished paver patio at golden hour with mature plantings around the perimeter and a stone fire feature in the foreground.',
        es: 'Un patio de adoquines terminado al atardecer con plantas alrededor y una característica de fuego de piedra. [TBR]',
      },
      width: 1280,
      height: 720,
    },
    inlineServiceCrossLink: {audience: 'hardscape', serviceSlug: 'patios-walkways'},
    body: {
      en: `If you're in the bid-collection stage on a DuPage patio in 2026, three numbers will arrive in your inbox: a low one that's almost suspiciously cheap, a middle one that lines up with what your neighbor told you, and a high one that gives you sticker shock. They're usually all real bids — they're just for three different patios that you're being asked to imagine as the same one.

Here's what we've quoted across the six DuPage cities we work in this spring, and what each price actually buys.

## Concrete: $12–$18 per square foot

A 600-square-foot concrete patio in 2026 lands between $7,200 and $10,800 installed. The variance is mostly in the base. The cheap quote at $12/sq ft assumes a 4-inch stone-and-sand subbase; the better quote at $18/sq ft includes 6 inches of compacted CA-6 with control joints cut at 8-foot grids and fiber-reinforced mix.

The $12/sq ft slab will fail in 8–10 winters. The $18/sq ft slab will outlive your time in the house. The Naperville HOA we did last fall went for the upper end — they'd already replaced one patio in 2014 and were not interested in doing it again.

### What the cheap quote skips

- 4-inch base instead of 6 (saves ~$2/sq ft).
- No fiber reinforcement in the mix (saves ~$1/sq ft).
- No control joint cuts ($350 saved on labor on a 600-sq-ft patio).
- No permit pull (saves $200–$400 in permit + filing).

> [!warning] If a Naperville concrete patio bid comes in below $13/sq ft, the contractor is either not pulling the permit or is cutting the base. Either is a tell.

## Pavers: $22–$32 per square foot

Pavers are where most of our hardscape work lands in 2026. A 600-square-foot Unilock Brussels Block patio with polymeric joints and a poured concrete edge restraint runs $13,200 to $19,200 installed in DuPage.

The variance here is product line and base depth. Unilock's entry-level Stonehenge runs around $22/sq ft installed; the mid-range Brussels Block (most popular in DuPage) lands at $26–$28; the high-end Estate Wall + Senza pairings push to $32 with cap stones.

Aurora has been steady at $24–$26/sq ft for Brussels Block jobs this spring; Naperville and Wheaton run $1–$2 higher because the lots are larger and the landscape integration takes more crew time.

### Where pavers actually save you money

The 25-year math is where pavers beat concrete. A $19,000 paver install with $400 of polymeric-sand refresh every 5 years totals $21,000 over 25 years. A $9,000 concrete slab plus one $5,000 jackhammer-and-repour at year 12 totals $14,000 — but the homeowner now has a 13-year-old patio that doesn't match the rest of the property.

## Natural stone: $36–$60 per square foot

Bluestone is the most-quoted natural stone in DuPage, running $42–$50/sq ft installed for thermal-finish pieces. Travertine sits in the same range. Limestone (Indiana cut, popular here) runs $36–$45 installed. Premium custom bluestone with random-pattern thermal can push past $60/sq ft.

We did a 480-square-foot bluestone patio in Wheaton last August at $24,000 installed. Same job in concrete would have cost $7,000 less; in pavers, $3,500 less. The homeowner picked stone because the back of the house is stone, and the patio reads as architecture instead of landscaping.

## What changes the price

Five things move the price more than people expect:

- **Access.** A backyard reachable only through a 4-foot side gate adds $2–$4/sq ft because every wheelbarrow runs by hand.
- **Demolition.** Tearing out an existing surface adds $4–$8/sq ft. Some bids quote demo separately; some bury it in the install number.
- **Drainage.** A patio that drains toward the house needs French drain, swale, or both. Add $2,000–$5,000 for engineering.
- **Steps.** Steps off a slab add $400–$900 each. Stone steps add $1,200–$2,400.
- **Lighting.** Low-voltage in-paver lights add $80–$140 per fixture installed.

## City-by-city: 2026 averages we've quoted

Real spring bids on a 600-square-foot Unilock Brussels Block paver patio with polymeric joints and a poured edge restraint:

| City | Average bid | Range |
|---|---|---|
| Aurora | $14,800 | $13,200–$16,800 |
| Naperville | $16,400 | $15,400–$18,200 |
| Wheaton | $16,800 | $15,800–$18,800 |
| Lisle | $15,200 | $14,400–$17,000 |
| Bolingbrook | $14,200 | $13,200–$15,800 |
| Batavia | $14,600 | $13,800–$16,200 |

Naperville and Wheaton are the high end because larger lots, more landscape integration, and stricter permit review. Bolingbrook is the low end because the lots are flatter and the access is usually easier.

## What we'd write on the back of an envelope

If you're scoping a patio in 2026 and you want a starting number:

- **Concrete:** lot size × $15/sq ft = realistic average; add 15% for a quote that includes everything done right.
- **Pavers (Unilock):** lot size × $26/sq ft = realistic average; add 10% for premium product.
- **Natural stone (bluestone):** lot size × $46/sq ft = realistic average; add 25% for premium pattern.

Multiply by your square footage. That's the number to compare bids against. Anyone significantly below the realistic average is cutting something — usually the base or the permit.

## Get a real bid

We do free 30-minute site walks across DuPage County. We measure the lot, sketch the patio shape, list the spec line-by-line, and email a one-page bid within 48 hours. [Request a free estimate](/request-quote/?from=blog&slug=dupage-patio-cost-2026) and we'll come look at the property.`,
      es: `[TBR] Si estás en la etapa de recolección de cotizaciones de un patio de DuPage en 2026, tres números llegarán a tu correo: uno bajo casi sospechosamente barato, uno medio que cuadra con lo que te dijo tu vecino, y uno alto que te shockea. Usualmente son los tres cotizaciones reales — solo que para tres patios distintos que te están pidiendo imaginar como el mismo.

Esto es lo que hemos cotizado en las seis ciudades de DuPage donde trabajamos esta primavera, y qué compra realmente cada precio.

## Concreto: $12–$18 por pie cuadrado

Un patio de concreto de 600 pie² en 2026 cae entre $7,200 y $10,800 instalado. La variación es mayormente la base. La cotización barata a $12/pie² asume una subbase de 4 pulgadas de piedra y arena; la mejor a $18/pie² incluye 6 pulgadas de CA-6 compactado con juntas de control y mezcla con fibra.

La losa de $12/pie² fallará en 8–10 inviernos. La de $18/pie² te sobrevivirá en la casa.

### Lo que omite la cotización barata

- Base de 4 pulgadas en vez de 6 (ahorra ~$2/pie²).
- Sin refuerzo de fibra (ahorra ~$1/pie²).
- Sin cortes de juntas de control ($350 ahorrados).
- Sin permiso ($200–$400 ahorrados).

> [!warning] Si una cotización de patio de concreto en Naperville llega bajo $13/pie², el contratista no está sacando el permiso o está cortando la base.

## Adoquines: $22–$32 por pie cuadrado

Los adoquines son donde aterriza la mayoría de nuestro trabajo de hardscape en 2026. Un patio de Unilock Brussels Block de 600 pie² con juntas poliméricas y borde de concreto vertido cuesta $13,200 a $19,200 instalado en DuPage.

La variación es la línea del producto y profundidad de base. Unilock Stonehenge corre cerca de $22/pie² instalado; el Brussels Block intermedio (más popular) cae en $26–$28; las parejas Estate Wall + Senza altas empujan a $32.

### Donde los adoquines realmente ahorran

La matemática a 25 años es donde los adoquines vencen al concreto. Una instalación de adoquines de $19,000 con $400 de refresco polimérico cada 5 años totaliza $21,000 en 25 años. Una losa de concreto de $9,000 más una vertida a 12 años totaliza $14,000 — pero el propietario ahora tiene un patio de 13 años que no combina con el resto.

## Piedra natural: $36–$60 por pie cuadrado

Bluestone es la piedra más cotizada en DuPage, en $42–$50/pie² instalado. Travertino está en el mismo rango. Caliza (corte de Indiana, popular aquí) en $36–$45 instalado.

Hicimos un patio de bluestone de 480 pie² en Wheaton el agosto pasado a $24,000 instalado. El mismo trabajo en concreto habría costado $7,000 menos; en adoquines, $3,500 menos.

## Qué mueve el precio

Cinco cosas mueven el precio más de lo que la gente espera:

- **Acceso.** Un patio trasero alcanzable solo por una puerta lateral de 4 pies agrega $2–$4/pie².
- **Demolición.** Quitar una superficie existente agrega $4–$8/pie².
- **Drenaje.** Un patio que drena hacia la casa necesita drenaje francés. $2,000–$5,000 en ingeniería.
- **Escalones.** Escalones agregan $400–$900 cada uno.
- **Iluminación.** Luces en adoquines agregan $80–$140 por luminaria.

## Por ciudad: promedios 2026

Cotizaciones reales de primavera en un patio de adoquines Unilock de 600 pie²:

| Ciudad | Cotización promedio | Rango |
|---|---|---|
| Aurora | $14,800 | $13,200–$16,800 |
| Naperville | $16,400 | $15,400–$18,200 |
| Wheaton | $16,800 | $15,800–$18,800 |
| Lisle | $15,200 | $14,400–$17,000 |
| Bolingbrook | $14,200 | $13,200–$15,800 |
| Batavia | $14,600 | $13,800–$16,200 |

## Lo que escribiríamos al reverso de un sobre

Si estás dimensionando un patio en 2026:

- **Concreto:** tamaño del lote × $15/pie² = promedio realista; +15% por hacerlo bien.
- **Adoquines (Unilock):** lote × $26/pie² = promedio realista; +10% por producto premium.
- **Piedra natural (bluestone):** lote × $46/pie² = promedio realista; +25% por patrón premium.

## Obtén una cotización real

Hacemos recorridos de sitio gratis de 30 minutos. [Solicita una estimación gratis](/es/request-quote/?from=blog&slug=dupage-patio-cost-2026).`,
    },
    faq: [
      {
        q: {
          en: 'Can I get a patio for less than $10/sq ft in DuPage in 2026?',
          es: '¿Puedo obtener un patio por menos de $10/pie² en DuPage en 2026? [TBR]',
        },
        a: {
          en: 'Not from a contractor pulling permits and using a 6-inch CA-6 base. The cheap labor + thin base path runs about $9–$11/sq ft and produces a slab that fails in 6–8 years. Pay $15 once or pay $20 twice.',
          es: 'No de un contratista que saca permisos y usa base CA-6 de 6 pulgadas. La ruta barata produce una losa que falla en 6–8 años. Paga $15 una vez o $20 dos veces. [TBR]',
        },
      },
      {
        q: {
          en: 'How much does demolition of my old patio add to the bid?',
          es: '¿Cuánto agrega la demolición del patio viejo? [TBR]',
        },
        a: {
          en: 'Concrete demo runs $4–$6/sq ft (jackhammer, haul, dispose). Paver demo is cheaper at $2–$3/sq ft because the units lift cleanly. Stone demo runs $5–$8/sq ft because of the weight and disposal cost.',
          es: 'Demolición de concreto: $4–$6/pie² (martillo, acarreo, disposición). Adoquines más barato a $2–$3/pie². Piedra: $5–$8/pie² por peso y disposición. [TBR]',
        },
      },
      {
        q: {
          en: 'Why is Naperville more expensive than Bolingbrook for the same patio?',
          es: '¿Por qué Naperville es más caro que Bolingbrook para el mismo patio? [TBR]',
        },
        a: {
          en: 'Three reasons: larger lots mean more landscape integration time, stricter permit review extends the project by 1–2 weeks (which costs the contractor money), and the average property has more existing landscape to protect during the build.',
          es: 'Tres razones: lotes más grandes, revisión de permisos más estricta (1–2 semanas extra), y más paisaje existente que proteger. [TBR]',
        },
      },
    ],
  },

  // ============================================================
  // 2. Aurora Spring Lawn Calendar (seasonal)
  // ============================================================
  {
    slug: 'aurora-spring-lawn-calendar',
    category: 'seasonal',
    schemaType: 'BlogPosting',
    byline: 'Sunset Services Team',
    title: {
      en: 'Spring Lawn Care Calendar for Aurora, IL Homeowners',
      es: 'Calendario de Cuidado de Jardín en Primavera para Propietarios de Aurora, IL',
    },
    dek: {
      en: "Month-by-month checklist for first-year Aurora homeowners on the city's clay soil. What to do in March, April, May, and June — and why timing matters more than effort.",
      es: 'Lista mes-a-mes para nuevos propietarios de Aurora en suelo arcilloso. Qué hacer en marzo, abril, mayo y junio.',
    },
    seoDescription: {
      en: 'Spring lawn care calendar for Aurora, IL — when to dethatch, when to apply pre-emergent, when to seed. Built for clay soil and DuPage spring weather.',
      es: 'Calendario primaveral para Aurora, IL — cuándo descopear, aplicar pre-emergente, sembrar. Para suelo arcilloso. [TBR]',
    },
    publishedAt: '2026-04-04',
    featuredImage: {
      src: '/images/blog/aurora-spring-lawn-calendar.jpg',
      srcMobile: '/images/blog/aurora-spring-lawn-calendar-mobile.jpg',
      alt: {
        en: 'A residential front lawn in Aurora during early spring, with crisp edges along a paver walkway and fresh growth.',
        es: 'Un jardín frontal en Aurora en primavera, con bordes definidos junto a una caminata de adoquines. [TBR]',
      },
      width: 1280,
      height: 720,
    },
    inlineServiceCrossLink: {audience: 'residential', serviceSlug: 'lawn-care'},
    inlineLocationCity: 'aurora',
    body: {
      en: `Aurora soils are different from the rest of DuPage. The east side of the city sits on heavy clay carried down by the Fox River; the west side has sandier loam left by the same glaciers that carved the rest of the county. A lawn-care calendar that works in Naperville will under-fertilize the east-side Aurora yard and over-water the west.

This is the calendar we run on our own Aurora properties, adjusted for the soil under your feet.

## March: the soil-temp watch

Don't do anything to the lawn until the soil hits 40°F at 4 inches depth. In Aurora, that lands somewhere between March 15 and March 30 most years — but watch the soil, not the calendar.

A $12 soil-temp probe from any garden store does the work. Stick it 4 inches in, leave it 5 minutes, read the dial. Below 40°F, nothing in the soil is awake yet — fertilizer will wash off, seeds won't germinate, weed treatments will hit healthy roots and stress them.

### What to do in March

- **Walk the lawn.** Note bare patches, low spots that hold water, and any vole tunnels left from winter.
- **Pick up debris.** Sticks and leaves matt the lawn and slow the spring greenup. Rake gently — don't dethatch yet.
- **Sharpen the mower blade.** A dull blade tears grass instead of cutting it; the torn edges turn brown for 4–5 days after each cut.

## April: pre-emergent and the first cut

Pre-emergent timing in Aurora is the single biggest lever in your spring program. Hit the window and crabgrass never germinates; miss it and you'll fight crabgrass into August.

The window: soil temp 50–55°F sustained for 5+ days. In Aurora, that lands April 10–25 most years. Forsythia bushes in full bloom is the field signal — when forsythia is out, soil temp is at 55.

### What to do in April

- **Apply pre-emergent.** Dimension or Barricade are the two products most DuPage programs use. Dimension is the broader-spectrum; Barricade is cheaper. Either works.
- **First mow at 3.0 inches.** Don't lower the deck below 3.0; cool-season grasses need leaf area to wake up. Take 1/3 off the top, no more.
- **Top-dress bare patches with seed.** Use a Kentucky bluegrass / fescue blend (50/50). Press the seed in with the back of a rake; cover with straw.
- **Don't fertilize yet.** Roots aren't ready to take up nitrogen until the lawn is fully greened up.

> [!tip] If you spread pre-emergent and overseed in the same week, the pre-emergent kills your seeds. Either pre-emergent in early April + seed in late September, or skip pre-emergent and seed in April. Pick one.

## May: the first fertilizer round + irrigation startup

May is when the lawn gets serious. The grass is fully out, the roots are working, and the soil microbiome is active. Now nitrogen pays off.

### What to do in May

- **First granular fertilizer round.** A 24-0-12 (NPK) bag at the rate of 0.7 lb of nitrogen per 1,000 sq ft. Spread with a broadcast spreader, water in within 24 hours.
- **Irrigation system startup.** Schedule the sprinkler turn-on. We charge $185 for a six-zone Aurora startup (test, head-tune, programming, leak check). Turn on too early and you waste water; turn on too late and the lawn enters water stress in the first warm week.
- **Mow at 3.0 inches; mulch the clippings.** Bagged clippings are a missed opportunity in May — the grass is full of the nitrogen the roots just took up.
- **Spot-treat broadleaf weeds.** Dandelions, clover, and creeping Charlie respond to a liquid 2,4-D + dicamba spot spray. Treat at 65–75°F; lower or higher and the herbicide doesn't work.

## June: heat-prep and the second round

By June 1, the lawn is in heat-prep mode. Roots are deeper, the leaf is flexing for July's stress, and the program shifts.

### What to do in June

- **Second fertilizer round.** Same bag as May; same rate. This is the round that funds July's color.
- **Raise the mowing height to 3.5 inches.** Taller grass shades the soil, slows evaporation, and reduces weed germination. We raise the deck on every Aurora lawn at the first June visit.
- **Audit the irrigation.** Walk every zone, watch for misting, broken heads, dry spots. Irrigation systems drift between zones over the season; fixing in June saves the lawn in August.
- **Apply a second pre-emergent if your spring rounds were spotty.** A "split application" pre-emergent in June extends the crabgrass barrier through August. Optional — most lawns can skip if April was clean.

## What this calendar costs in Aurora

Run yourself: $300–$500 in product (pre-emergent, fertilizer, seed, soil amendment) + 12–18 hours of your weekends across March–June.

Run by us: our 5-round residential lawn-care program for an Aurora half-acre lot is $580–$720 per season. Includes pre-emergent, four fertilizer rounds, spring soil test, and weed monitoring. We mow weekly at $48–$58 per visit ($1,000–$1,200 across the 22-week season).

Either path works. We've kept lawns of both kinds alive for 25 years; the difference is your weekends.

## When timing matters more than effort

The Aurora homeowners who lose lawns in summer do so because they fertilized in mid-March (washed off), spread pre-emergent in early May (too late), or watered too lightly through June (shallow roots). Timing is the program. Effort is what fills it in.

If you want us to run the calendar for your property, [book a free site walk](/request-quote/?from=blog&slug=aurora-spring-lawn-calendar) and we'll tell you what your soil and shade situation actually needs.`,
      es: `[TBR] Los suelos de Aurora son distintos del resto de DuPage. El lado este se asienta sobre arcilla pesada arrastrada por el río Fox; el lado oeste tiene loam más arenoso de los mismos glaciares que tallaron el resto del condado. Un calendario que funciona en Naperville sub-fertilizará el este de Aurora y sobre-regará el oeste.

Este es el calendario que corremos en nuestras propias propiedades de Aurora, ajustado al suelo bajo tus pies.

## Marzo: la vigilancia de temperatura de suelo

No hagas nada al jardín hasta que el suelo llegue a 4°C a 4 pulgadas de profundidad. En Aurora, eso aterriza entre el 15 y el 30 de marzo la mayoría de los años — pero observa el suelo, no el calendario.

Una sonda de $12 hace el trabajo. Mete 4 pulgadas, déjala 5 minutos, lee. Debajo de 4°C, nada en el suelo está despierto — el fertilizante se lavará, las semillas no germinarán.

### Qué hacer en marzo

- **Camina el jardín.** Anota parches pelones, áreas bajas que retienen agua, y túneles de topillo del invierno.
- **Recoge escombros.** Palos y hojas apelmazan el jardín y retrasan el reverdecimiento.
- **Afila la cuchilla del cortacésped.** Una cuchilla desafilada rasga el pasto.

## Abril: pre-emergente y el primer corte

El tiempo del pre-emergente en Aurora es la palanca más grande. Acierta la ventana y el pasto cangrejo nunca germina; fállala y pelearás contra él hasta agosto.

La ventana: temperatura del suelo 10–13°C sostenida por 5+ días. En Aurora, eso aterriza del 10 al 25 de abril. Las forsitias en plena floración son la señal de campo.

### Qué hacer en abril

- **Aplica pre-emergente.** Dimension o Barricade son los dos productos. Dimension es más amplio; Barricade más barato.
- **Primer corte a 3.0 pulgadas.** No bajes la cubierta debajo de 3.0; los céspedes de temporada fría necesitan área de hoja para despertar.
- **Resiembra parches pelones con semilla.** Mezcla 50/50 KBG/fescue.
- **No fertilices todavía.** Las raíces no están listas para nitrógeno hasta que el jardín esté totalmente verde.

> [!tip] Si esparces pre-emergente y resiembras la misma semana, el pre-emergente mata tus semillas. Pre-emergente a inicio de abril + siembra a finales de septiembre, o sin pre-emergente y siembra en abril. Elige uno.

## Mayo: la primera ronda + arranque de riego

Mayo es cuando el jardín se pone serio. El pasto está afuera totalmente, las raíces trabajan, y el microbioma del suelo está activo. Ahora el nitrógeno paga.

### Qué hacer en mayo

- **Primera ronda granular.** Una bolsa 24-0-12 a razón de 0.7 lb de nitrógeno por 1,000 pie². Esparce, riega en 24 horas.
- **Arranque del sistema de riego.** Cobramos $185 por un arranque de seis zonas en Aurora.
- **Cortar a 3.0 pulgadas; mulch los recortes.**
- **Tratamiento puntual de hierba ancha.** Diente de león, trébol y Charlie trepador.

## Junio: prep de calor y segunda ronda

Para el 1 de junio, el jardín está en modo prep de calor. Las raíces están más profundas, la hoja se flexiona para el estrés de julio.

### Qué hacer en junio

- **Segunda ronda fertilizante.** Misma bolsa que mayo.
- **Sube la altura de corte a 3.5 pulgadas.**
- **Audita el riego.** Camina cada zona, observa rocío, cabezas rotas, áreas secas.
- **Aplica un segundo pre-emergente si las rondas de primavera fueron parchadas.**

## Lo que cuesta este calendario en Aurora

Hacerlo tú: $300–$500 en producto + 12–18 horas de tus fines de semana de marzo a junio.

Hacerlo nosotros: nuestro programa de 5 rondas para un lote de medio acre en Aurora es $580–$720 por temporada. Incluye pre-emergente, cuatro rondas, prueba de suelo de primavera, y monitoreo de maleza. Cortamos semanalmente a $48–$58 por visita.

## Cuándo el tiempo importa más que el esfuerzo

Los propietarios de Aurora que pierden el jardín en verano lo hacen porque fertilizaron a mediados de marzo (lavado), esparcieron pre-emergente a inicios de mayo (muy tarde), o regaron demasiado ligero en junio (raíces superficiales). El tiempo es el programa. El esfuerzo es lo que lo llena.

Si quieres que corramos el calendario para tu propiedad, [reserva un recorrido gratis](/es/request-quote/?from=blog&slug=aurora-spring-lawn-calendar).`,
    },
  },

  // ============================================================
  // 3. Why Unilock? (how-to)
  // ============================================================
  {
    slug: 'why-unilock-premium-pavers',
    category: 'how-to',
    schemaType: 'BlogPosting',
    byline: 'Erick Sotomayor',
    title: {
      en: 'Why Unilock? A Look at Premium Pavers',
      es: '¿Por Qué Unilock? Una Mirada a los Adoquines Premium',
    },
    dek: {
      en: 'A 25-year hardscape crew explains what separates Unilock from the discount brands — and where the premium actually shows up.',
      es: 'Un equipo de hardscape con 25 años explica qué separa Unilock de las marcas de descuento.',
    },
    seoDescription: {
      en: 'Why DuPage hardscape crews specify Unilock pavers — production tolerances, freeze-thaw rating, and the 25-year warranty. From an authorized installer.',
      es: 'Por qué los equipos de hardscape de DuPage especifican Unilock — tolerancias, resistencia a heladas, garantía. [TBR]',
    },
    publishedAt: '2026-03-22',
    featuredImage: {
      src: '/images/blog/why-unilock-premium-pavers.jpg',
      srcMobile: '/images/blog/why-unilock-premium-pavers-mobile.jpg',
      alt: {
        en: 'A close-up of a Unilock paver patio in mid-installation, showing tumbled edges and fresh polymeric sand in the joints.',
        es: 'Primer plano de un patio Unilock en instalación, mostrando los bordes y la arena polimérica fresca. [TBR]',
      },
      width: 1280,
      height: 720,
    },
    inlineServiceCrossLink: {audience: 'hardscape', serviceSlug: 'patios-walkways'},
    body: {
      en: `Most homeowners decide between paver brands by walking into the showroom and picking the color they like. Most installers decide between brands by which one comes back with a warranty problem. We've been laying Unilock since 2003 and laid two competitor brands during the 2008–2010 stretch when supply was tight. Here's what 23 years of installs have surfaced.

## The four things that separate paver brands

Pavers all look pretty similar in a brochure. Up close, four specs matter — and the brands that get it right cost 10–20% more for reasons that show up in year 8.

### Production tolerance

Unilock's spec sheet says ±1.5mm on dimensional tolerance. That means a "Brussels Block 6×6" paver is 6.000 inches wide give or take 1.5mm; a discount brand might run ±4mm. Tighter tolerances mean the joint width stays consistent across the patio — the eye reads it as a single field, not a checkered surface where some joints are tight and some are wide.

You don't notice this on the showroom display because the display has 8 perfect pieces. You notice it on a 600-square-foot patio where 200 pavers are 1mm tighter and 200 are 3mm looser. The discount brand looks unsettled; the premium brand reads like architecture.

### Freeze-thaw rating

Every paver carries a freeze-thaw rating expressed in cycles before degradation. Unilock's rating runs 1,000+ cycles; competitor pavers run 200–600.

DuPage gets about 80–100 freeze-thaw cycles per winter. Math: a 200-cycle paver degrades in two winters; a 1,000-cycle paver outlasts the homeowner. Discount-brand patios installed in 2018 are starting to face-spall in 2026.

### Color durability

Unilock pigments are integrated through the entire paver — the color you see is the color all the way through. Discount brands face-stamp the pigment; the bottom of the paver is gray concrete. When the surface wears, the discount paver shows the gray; the Unilock paver still shows the color.

We replaced one section of a 2014 discount-brand patio in Wheaton last year. The pigment had worn off the high-traffic areas; the homeowner could see the unfinished concrete underneath. Same patio in Unilock would have aged into the property; this one had to be reset.

### The warranty

Unilock backs their pavers with a 25-year transferable warranty — meaning the warranty follows the property if you sell. The discount brands run 5–10 years and don't transfer. Buyers and inspectors pay attention to this; we've seen it surface in resale negotiations as a $4,000–$8,000 swing.

## Where the premium actually shows up

The retail markup on Unilock vs. discount is about $0.80–$1.20/sq ft. On a 600-square-foot patio, that's $480–$720. The labor cost is the same. So a "Unilock" patio costs the homeowner $480–$720 more than a "discount" patio for the materials, full stop.

Where does that $720 go? Five places:

- Production tolerance keeps the install crew from cutting custom pieces ($240 of labor saved on a typical install).
- Freeze-thaw rating delays the first major repair by 8–10 years (saves $4,000–$6,000 in lifecycle cost).
- Color durability extends the "looks new" window by 4–5 years (immaterial in cash, material in resale appraisal).
- Transferable warranty adds documentation at resale (worth $4,000–$8,000 in negotiations per the homes we've sold).
- Unilock's installer-certification program makes the warranty enforceable. Discount brands often deny warranty claims unless the installer is "certified," which they sometimes don't enforce.

## What we'd actually pick from the catalog

The Unilock catalog runs ~80 SKUs. Most homeowners don't know which to pick, so they pick by what's on display in the showroom. Here's what we'd specify on our own properties:

- **Brussels Block (Sierra blend):** the workhorse. 90% of the patios we install. $26–$28/sq ft. Tumbled edge, three-color blend that hides minor wear.
- **Senza:** the contemporary line. $30–$32/sq ft. Smoother face, narrower joint look. Right for modern home architecture.
- **Estate Wall + caps:** for the retaining walls that frame patios. Pairs visually with Brussels Block. $42–$60 per linear foot installed.
- **Skip:** Stonehenge entry-level — looks fine, but the freeze-thaw rating runs 600 cycles which is borderline for DuPage.

## What we'd never specify

The discount brands. We've installed Cambridge and Pavestone on three jobs over the years where the homeowner's budget required it. Two of those jobs called us back inside 8 years for face-spalling; the third hasn't yet but we expect it.

The math is brutal: save $720 on the materials in 2026, spend $4,000–$6,000 in 2034 on a partial reset. Plus the homeowner-frustration cost of having a patio that looks tired at year 8.

## When discount makes sense

Two cases. First, a temporary install — a homeowner planning to sell in 5 years and wants the patio for the listing. Second, a back-of-house path that will rarely be seen and never carry weight. Anywhere in the high-visibility, high-use zones of the property, premium pays back in lifecycle cost and resale value.

## How we ship our quotes

Every Sunset Services hardscape bid lists the brand, the SKU, and the freeze-thaw rating in the spec line. If you're looking at three bids and two of them say "premium pavers" without naming the brand, you're being asked to imagine the same product across three quotes. They are not the same product.

[Request a free site walk](/request-quote/?from=blog&slug=why-unilock-premium-pavers) and we'll bring sample pieces of three Unilock product lines for you to see in your own light.`,
      es: `[TBR] La mayoría de propietarios decide entre marcas de adoquines caminando al showroom y eligiendo el color que les gusta. La mayoría de instaladores decide entre marcas por cuál regresa con un problema de garantía. Hemos puesto Unilock desde 2003 y pusimos dos marcas competidoras durante 2008–2010 cuando el suministro estaba apretado.

## Las cuatro cosas que separan a las marcas

Los adoquines se ven similares en un folleto. De cerca, cuatro especificaciones importan — y las marcas que las hacen bien cuestan 10–20% más por razones que aparecen en el año 8.

### Tolerancia de producción

La hoja de Unilock dice ±1.5mm en tolerancia dimensional. Eso significa que un "Brussels Block 6×6" mide 6.000 pulgadas más o menos 1.5mm; una marca de descuento puede correr ±4mm. Tolerancias más apretadas mantienen el ancho de junta consistente a través del patio — la vista lo lee como un solo campo.

### Resistencia a heladas

Cada adoquín tiene una calificación de heladas en ciclos. Unilock corre 1,000+ ciclos; los competidores 200–600. DuPage recibe 80–100 ciclos por invierno. Matemática: un adoquín de 200 ciclos se degrada en dos inviernos; uno de 1,000 ciclos te sobrevive.

### Durabilidad del color

Los pigmentos de Unilock se integran por todo el adoquín — el color que ves es el color hasta el fondo. Las marcas de descuento estampan el pigmento en la cara; el fondo es concreto gris.

### La garantía

Unilock respalda sus adoquines con una garantía transferible de 25 años — la garantía sigue a la propiedad si vendes. Las marcas de descuento corren 5–10 años y no transfieren.

## Dónde aparece realmente el premium

El recargo minorista Unilock vs. descuento es cerca de $0.80–$1.20/pie². En un patio de 600 pie², eso son $480–$720. El costo de mano de obra es el mismo.

¿A dónde va ese $720? Cinco lugares:

- Tolerancia de producción evita cortes personalizados ($240 ahorrados).
- Resistencia a heladas demora la primera reparación 8–10 años ($4,000–$6,000 ahorrados).
- Durabilidad del color extiende la ventana "se ve nuevo" 4–5 años.
- Garantía transferible agrega documentación al revender.
- Programa de certificación de instalador de Unilock hace la garantía exigible.

## Qué elegiríamos del catálogo

- **Brussels Block (mezcla Sierra):** el caballo de batalla. 90% de los patios que instalamos. $26–$28/pie². Borde rodado, mezcla de tres colores.
- **Senza:** la línea contemporánea. $30–$32/pie². Cara más lisa.
- **Estate Wall + tapas:** para muros de contención que enmarcan patios.
- **Saltar:** Stonehenge — se ve bien, pero la resistencia de 600 ciclos es marginal para DuPage.

## Cuándo tiene sentido el descuento

Dos casos. Primero, instalación temporal — propietario que planea vender en 5 años y quiere el patio para el listado. Segundo, un camino atrás que rara vez se ve. En cualquier zona de alta visibilidad y uso, el premium paga en costo de ciclo de vida.

## Cómo enviamos nuestras cotizaciones

Cada cotización de Sunset Services lista la marca, el SKU, y la resistencia a heladas en la línea. [Solicita un recorrido gratis](/es/request-quote/?from=blog&slug=why-unilock-premium-pavers).`,
    },
  },

  // ============================================================
  // 4. Snow Removal for Commercial Properties (audience/commercial)
  // ============================================================
  {
    slug: 'snow-for-commercial-properties',
    category: 'audience',
    subAudience: 'commercial',
    schemaType: 'BlogPosting',
    byline: 'Erick Sotomayor',
    title: {
      en: 'Snow Removal for Commercial Properties: What Property Managers Need to Know',
      es: 'Remoción de Nieve para Propiedades Comerciales: Lo que los Property Managers Deben Saber',
    },
    dek: {
      en: 'A 15-year vendor on the seven things that separate the snow contract that protects your property from the one that empties your reserves.',
      es: 'Un vendor de 15 años sobre las siete cosas que separan el contrato que protege tu propiedad del que vacía tus reservas.',
    },
    seoDescription: {
      en: 'Commercial snow removal in DuPage — what PMs should look for in a vendor contract. Trigger depths, response windows, slip-and-fall protection.',
      es: 'Remoción comercial en DuPage — qué buscar en contrato de vendor. Disparadores, ventanas, protección. [TBR]',
    },
    publishedAt: '2026-03-08',
    featuredImage: {
      src: '/images/blog/snow-for-commercial-properties.jpg',
      srcMobile: '/images/blog/snow-for-commercial-properties-mobile.jpg',
      alt: {
        en: 'A commercial parking lot during an active snow event, with two plows working in formation and salt being spread.',
        es: 'Un estacionamiento comercial durante un evento de nieve, con dos arados trabajando en formación. [TBR]',
      },
      width: 1280,
      height: 720,
    },
    inlineServiceCrossLink: {audience: 'commercial', serviceSlug: 'snow-removal'},
    body: {
      en: `If you manage commercial property in DuPage County, your snow vendor is one of the three line items that decides whether the year ends well. Bad vendor in February costs you a slip-and-fall claim, a tenant defection, and a budget overrun. Good vendor costs you 8–15% more upfront and is invisible the rest of the year.

These are the seven things we look for when we audit incumbent contracts for new clients — and the language we recommend for the next contract you sign.

## They name a foreman, not a crew

A 60-employee snow operator runs five trucks. Across an event, the truck that services your lot might be three different drivers. A foreman-named contract puts a single point of contact on your lot — somebody who walks the property in October before the season starts, knows where the storm drains are, and is in the truck at 5 a.m. on the storm.

The cost difference: about 8% on the per-event price. The risk difference: a foreman-named lot has 1/4 the slip-claim rate of a crew-routed lot, in our 15-year claim history.

## They run the trigger off the site, not the office

The trigger depth in the contract — 1 inch, 2 inches, whatever — has to be measured at the property, not at the dispatch office or the regional NWS station. Aurora can be at 0.7 inches when Naperville is at 1.3.

We measure with a permanent depth marker installed October 1 each year at the lot's center. Crew photographs the marker on arrival; the photo is the trigger documentation.

> [!warning] If your contract reads "trigger at 1 inch accumulation" without naming where it's measured, the vendor controls the trigger. Verbal "we use the airport" or "we use NWS" doesn't bind the vendor in court.

## They pre-treat for forecast events, not just plow during them

Pre-treating with brine 6–12 hours before a forecast event prevents bonding between snow and pavement. A pre-treated lot plows in 1/3 the time and 1/2 the salt. A non-pre-treated lot at the same depth requires twice the salt to break the ice bond — which costs you more in the salt line item that gets passed through.

The ROI: pre-treatment runs $0.06–$0.10 per square foot, saves $0.18–$0.30 per square foot in salt over the event. Net: 2–3× return on the pre-treat dollar.

## They photo-document every pass, every time

Slip-and-fall claims surface 7–21 days after the storm. The defense is the documentation. A vendor who photo-documents each pass with a timestamp creates a record that the lot was treated to spec on the day of the incident. A vendor who doesn't is asking your insurance carrier to take their word for it.

We push our photo log to a shared Google Drive folder within 30 minutes of each pass. The PM has access from the start of the season.

## They write the salt volume in pounds per acre

"Apply salt as needed" is not a contract clause — it's a billing strategy. Every legitimate vendor specifies salt volume in pounds per acre per application. Industry standard is 100 lb/acre per pass with full re-application after the storm.

If your bid says "salt included" without naming a volume, you're being upsold on every event. Pin the volume in the contract; pin the bag pickup audit twice per season; pin the price per ton at $145–$175 if the bid passes through.

## They include slip-and-fall response in writing

The single most important clause: "On notification of slip incident, vendor returns to property within 24 hours to inspect, photograph, and re-treat affected area." This is the clause that holds the vendor in the loop after the event — most vendors will never come back unless they've signed it.

We've responded to 11 slip notifications in our 15-year commercial book. Eight resolved without claim because the documentation showed the lot was treated to spec at the time of the incident. The other three settled small. Without the response clause, all 11 would have ended differently.

## They cap the season cost or define unlimited explicitly

Per-event pricing protects you in light winters and exposes you in heavy ones. The 2010-11 winter ran 36 events in DuPage; the 2017-18 winter ran 22. A per-event contract with a cap at 28 events transfers some of the heavy-winter risk to the vendor.

Alternative: a flat seasonal that includes "all events of all sizes" — typically 1.4× the average per-event cost × 25 events. Costs more in light winters, less in heavy.

We offer both structures and let the PM decide. Most pick the cap; a few with stable budgets pick the flat.

## What to do this October

If your current snow contract is a year-to-year auto-renewal, October is the time to audit it. Walk the seven items above through your current contract. If three or more are missing or vague, you have time to RFP before the season starts.

We do free contract audits for DuPage commercial properties — a 30-minute call with the PM, a 1-page report on what's protected and what's not, and a sample contract you can use to RFP whoever you'd like (including us).

If you want our crew on the lot, [request a free site walk](/request-quote/?from=blog&slug=snow-for-commercial-properties) and we'll measure the lot, sketch the priority paths, and propose a seasonal contract before October 15.`,
      es: `[TBR] Si manejas propiedad comercial en DuPage, tu vendor de nieve es una de las tres líneas que deciden si el año termina bien. Mal vendor en febrero te cuesta una reclamación de resbalón, una defección de inquilino, y un sobrecosto. Buen vendor cuesta 8–15% más por adelantado y es invisible el resto del año.

Estas son las siete cosas que buscamos al auditar contratos vigentes para nuevos clientes.

## Nombran a un capataz, no a una cuadrilla

Un operador de 60 empleados corre cinco camiones. A través de un evento, el camión que sirve tu lote puede ser tres conductores distintos. Un contrato con capataz nombrado pone un punto único de contacto en tu lote.

Diferencia de costo: cerca de 8% en el precio por evento. Diferencia de riesgo: un lote con capataz nombrado tiene 1/4 de la tasa de reclamaciones, en nuestro historial de 15 años.

## Corren el disparador desde el sitio, no la oficina

La profundidad disparadora en el contrato — 1 pulgada, 2, lo que sea — tiene que medirse en la propiedad, no en la oficina de despacho o estación NWS regional. Aurora puede estar en 0.7 pulgadas cuando Naperville está en 1.3.

> [!warning] Si tu contrato dice "disparador a 1 pulgada" sin nombrar dónde se mide, el vendor controla el disparador.

## Pre-tratan para eventos pronosticados

Pre-tratar con salmuera 6–12 horas antes de un evento previene el enlace entre nieve y pavimento. Un lote pre-tratado se ara en 1/3 del tiempo y 1/2 de la sal.

ROI: pre-tratamiento cuesta $0.06–$0.10 por pie², ahorra $0.18–$0.30 por pie² en sal por evento. 2–3× retorno.

## Documentan con foto cada pase, cada vez

Las reclamaciones de resbalones aparecen 7–21 días después de la tormenta. La defensa es la documentación.

## Escriben el volumen de sal en libras por acre

"Aplicar sal según se necesite" no es una cláusula de contrato — es una estrategia de facturación. Estándar de industria: 100 lb/acre por pase con reaplicación completa post-tormenta.

## Incluyen respuesta a resbalones por escrito

La cláusula más importante: "Al notificar incidente de resbalón, vendor regresa a la propiedad en 24 horas".

## Limitan el costo de temporada o definen ilimitado explícitamente

El precio por evento te protege en inviernos ligeros y te expone en pesados. Un contrato por evento con tope a 28 eventos transfiere parte del riesgo de invierno pesado al vendor.

## Qué hacer este octubre

Si tu contrato actual es renovación automática año a año, octubre es el momento de auditarlo. Camina las siete listas a través de tu contrato actual. Si tres o más faltan o son vagas, tienes tiempo para RFP antes de la temporada.

[Solicita un recorrido gratis](/es/request-quote/?from=blog&slug=snow-for-commercial-properties) y mediremos el lote antes del 15 de octubre.`,
    },
    faq: [
      {
        q: {
          en: "Can I get out of my current snow contract mid-season if the vendor isn't performing?",
          es: '¿Puedo salir de mi contrato actual a mitad de temporada si el vendor no rinde? [TBR]',
        },
        a: {
          en: 'Most contracts have a cure period: you document the failures, send written notice, the vendor has 7–14 days to fix. If they don\'t, the contract terminates. The trigger is documentation; without it, the cure clause is unenforceable.',
          es: 'La mayoría de contratos tiene un período de cura: documentas las fallas, envías aviso por escrito, el vendor tiene 7–14 días para arreglar. Si no lo hace, el contrato termina. [TBR]',
        },
      },
      {
        q: {
          en: 'What does pre-treatment cost on a 1-acre commercial lot?',
          es: '¿Cuánto cuesta el pre-tratamiento en un lote comercial de 1 acre? [TBR]',
        },
        a: {
          en: 'Brine pre-treatment runs $260–$430 per application on a 1-acre lot in DuPage. Most seasons see 8–14 pre-treatment events; budget $2,500–$6,000 for the season. The salt savings during the storms typically nets the program to break-even or slightly positive.',
          es: 'Pre-tratamiento de salmuera cuesta $260–$430 por aplicación en lote de 1 acre. La mayoría de temporadas ve 8–14 eventos; presupuesta $2,500–$6,000. [TBR]',
        },
      },
      {
        q: {
          en: 'Are slip-and-fall claims actually that common in DuPage commercial properties?',
          es: '¿Las reclamaciones de resbalón son realmente comunes en DuPage? [TBR]',
        },
        a: {
          en: 'They\'re less common than people fear and more expensive than people expect. DuPage commercial sites average 0.5 claims per acre per decade; average claim settles at $32,000. The cost of preventing one is the documentation routine — pre-treatment + photo log + 24-hour response. Cheap insurance.',
          es: 'Son menos comunes de lo que la gente teme y más caras de lo que esperan. Promedio: 0.5 reclamaciones por acre por década; reclamación promedio se asienta en $32,000. [TBR]',
        },
      },
      {
        q: {
          en: 'How do I tell if my current contract has the right structure without re-bidding?',
          es: '¿Cómo verifico si mi contrato actual tiene la estructura correcta sin re-cotizar? [TBR]',
        },
        a: {
          en: 'Walk it through the 7-point list in this post. If 5+ items are present, the contract is solid; you can keep it. If 3 or fewer, RFP. We\'re happy to do a free 30-minute audit call and tell you which side of that line your contract sits on — no obligation.',
          es: 'Camina los 7 puntos. Si 5+ están presentes, el contrato es sólido. Si 3 o menos, RFP. Hacemos auditoría gratis de 30 minutos. [TBR]',
        },
      },
    ],
  },

  // ============================================================
  // 5. 7 Sprinkler Tune-Up Signs (how-to + 7-Q FAQ)
  // ============================================================
  {
    slug: 'sprinkler-tune-up-7-signs',
    category: 'how-to',
    schemaType: 'BlogPosting',
    byline: 'Sunset Services Team',
    title: {
      en: '7 Signs Your Sprinkler System Needs a Tune-Up Before Summer',
      es: '7 Señales de Que Tu Sistema de Riego Necesita un Ajuste Antes del Verano',
    },
    dek: {
      en: "Walk the system at 6 a.m. — you'll spot most failures in 12 minutes. Here's the seven things to look for and what each one costs to fix.",
      es: 'Camina el sistema a las 6 a.m. — verás la mayoría de las fallas en 12 minutos. Aquí están las siete señales.',
    },
    seoDescription: {
      en: '7 visible signs your sprinkler system needs service before the summer heat — misting heads, dry zones, valve drift, and what each fix costs in DuPage.',
      es: '7 señales visibles de que tu sistema necesita servicio — cabezas con rocío, zonas secas, deriva de válvulas. [TBR]',
    },
    publishedAt: '2026-04-18',
    featuredImage: {
      src: '/images/blog/sprinkler-tune-up-7-signs.jpg',
      srcMobile: '/images/blog/sprinkler-tune-up-7-signs-mobile.jpg',
      alt: {
        en: 'A pop-up sprinkler head misting at sunrise, with the spray pattern visible against a green lawn.',
        es: 'Una cabeza de aspersión emergente con rocío al amanecer, mostrando el patrón de aspersión sobre césped verde. [TBR]',
      },
      width: 1280,
      height: 720,
    },
    inlineServiceCrossLink: {audience: 'residential', serviceSlug: 'sprinkler-systems'},
    body: {
      en: `Most DuPage sprinkler systems run for 22 weeks a year and get inspected once. The inspection happens in May at startup and catches the obvious failures — broken heads, blown valves, frozen pipes. The subtler failures show up in July when the lawn goes patchy and you can't tell whether it's the system or the heat.

Walk the system at 6 a.m. on a Saturday in mid-May. Watch each zone run through one cycle. Twelve minutes per yard is enough. Here are the seven things to look for.

## 1. Misting heads

If a head is throwing fine mist instead of solid droplets, water pressure is too high for that head. The mist drifts on the wind and never lands where you need it.

The fix: a pressure-regulating insert in the head, $4 retail. Or a pressure-regulating sprinkler body if the whole zone is misting, $18–$28 per head installed. Misting heads waste 25–40% of zone water; this is the cheapest meaningful fix in any sprinkler audit.

## 2. Dry zones in mid-rotation

Watch the head rotate through its arc. If the lawn at the 90° mark is getting water but the lawn at the 0° and 180° marks isn't, the head is throwing too narrow an arc. Either the head's nozzle is wrong, or the head itself is misaligned.

The fix: nozzle swap, $3 retail. Head re-alignment, no parts, 5 minutes of labor. If the head is throwing wrong because the spring inside is gone, replace the head — $24–$38 installed in DuPage.

## 3. Heads spraying the driveway, sidewalk, or fence

Wasted water on hard surfaces is the most visible failure on a sprinkler system. The water comes off the driveway, runs to the street, and ends up in the storm drain. Two things cause it: head drift over the season, and the original install put heads at the wrong spacing.

The fix: head re-aim, no parts. If the head is the wrong type for the zone (a fixed spray on a 30-foot run), upgrade to a rotor head — $42–$60 installed.

## 4. Wet spots that don't dry between cycles

A patch of lawn that stays wet for hours after the zone runs has either a stuck valve or a leaking head. Stuck valves are the more expensive fix.

The fix: leaking head replace, $24–$38. Stuck solenoid valve, $80–$140 installed (the valve itself is $20; the labor is digging it up). If the wet spot is over a manifold (where multiple zone valves cluster), the manifold is the suspect — $200–$450 to repair.

> [!warning] Wet spots that move down-slope after a zone runs are usually a leaking lateral pipe — the supply line between heads. Lateral leaks cost $200–$600 to repair because the pipe is buried 6–8 inches deep and the leak is somewhere along its length. Diagnostic flush + leak detection adds $120–$180 to the bill before any repair.

## 5. Valve box water at the curb

Walk to the curb where the main shutoff valve sits. If there's standing water in the valve box, the main shutoff is leaking. Cost: $90–$180 to replace the shutoff valve, plus the cost of the water leaked since last inspection.

This is the failure that quietly inflates your water bill in winter. The DuPage homeowners we audit who run "high winter water bills" without explanation usually have a leaky main shutoff. Fix it once.

## 6. Brown patches in irrigated zones

If the lawn is brown in a zone that's getting watered, the zone isn't getting watered as much as you think. Most likely: a head is throwing 80% of its rated arc because of low pressure, the rotation speed is wrong, or the runtime is set lower than the zone needs.

The fix: zone audit. We use a catch-cup audit — set 6–8 collection cups across the zone, run the zone for 15 minutes, measure water collected per cup. The variance tells you whether it's a head problem (catches differ widely) or a runtime problem (catches are uniform but low). Cost: $120 for the audit.

## 7. Controller programmed for May running in July

A sprinkler controller programmed in May for May watering runs the same schedule in July when the lawn needs 60% more water. Most homeowners never adjust the controller after the spring program goes in.

The fix: a smart controller upgrade, $280–$480 installed. The smart controllers (Rachio, Hunter Hydrawise, Rain Bird ESP-Me) read local rainfall and seasonal evapotranspiration and adjust runtime automatically. Saves 15–25% on the water bill in DuPage; pays back in 2 seasons.

Or, a manual program-shift: every May 15, June 15, July 15, August 15. Add 5 minutes to each runtime in May, 10 minutes in June, 5 minutes in July, drop back in August. Free, requires you to remember.

## What this all costs in 2026 DuPage

Standard 6-zone tune-up at startup: $185 (we included this in the residential program at the May visit). Adds: nozzle swaps ($3 each, 4–8 average), pressure-regulator inserts ($4 each, 2–4 average), one head replacement ($24–$38).

Total: $230–$310 in spring on a typical Aurora half-acre 6-zone system. Skip the tune-up and you'll spend $400–$700 in summer chasing brown patches that the tune-up would have prevented.

## When to call us vs. DIY

DIY zone walk + nozzle swap + head re-aim: 90% of the audit list above is within reach of a homeowner with a screwdriver and a Saturday morning. The exceptions are valve repair (you need to know what's under the valve box), lateral leaks (you need leak detection), and controller programming (most homeowners don't). [Schedule a sprinkler audit](/request-quote/?from=blog&slug=sprinkler-tune-up-7-signs) and we'll do the walk with you.`,
      es: `[TBR] La mayoría de sistemas de riego de DuPage corren 22 semanas al año y se inspeccionan una vez. La inspección sucede en mayo al arranque y atrapa las fallas obvias — cabezas rotas, válvulas reventadas, tuberías congeladas. Las fallas más sutiles aparecen en julio cuando el jardín se pone parchado y no puedes saber si es el sistema o el calor.

Camina el sistema a las 6 a.m. un sábado a mediados de mayo. Mira cada zona correr un ciclo. Doce minutos por jardín es suficiente. Aquí están las siete cosas a buscar.

## 1. Cabezas con rocío fino

Si una cabeza está lanzando rocío fino en vez de gotas sólidas, la presión del agua es muy alta. El rocío se va con el viento y nunca aterriza donde lo necesitas.

El arreglo: un inserto regulador de presión en la cabeza, $4 al detalle. O un cuerpo regulador si toda la zona tiene rocío, $18–$28 por cabeza instalada.

## 2. Zonas secas a mitad de rotación

Observa la cabeza rotar por su arco. Si el jardín a 90° recibe agua pero el de 0° y 180° no, la cabeza está lanzando un arco muy estrecho.

El arreglo: cambio de boquilla, $3 al detalle. Realineación, sin partes, 5 minutos.

## 3. Cabezas rociando la entrada, acera, o cerca

El agua desperdiciada en superficies duras es la falla más visible. El agua sale de la entrada, corre a la calle, y termina en el desagüe.

El arreglo: re-apuntar cabeza, sin partes. Si la cabeza es del tipo equivocado, sube a una rotor — $42–$60 instalada.

## 4. Áreas mojadas que no secan entre ciclos

Un parche de jardín que se mantiene mojado por horas después de correr la zona tiene una válvula atascada o una cabeza con fuga.

El arreglo: reemplazo de cabeza con fuga, $24–$38. Válvula solenoide atascada, $80–$140 instalada.

> [!warning] Las áreas mojadas que se mueven cuesta abajo después de correr una zona usualmente son una tubería lateral con fuga. Las fugas laterales cuestan $200–$600 reparar.

## 5. Agua en la caja de válvula del bordillo

Camina al bordillo donde está la válvula de cierre principal. Si hay agua estancada en la caja de válvula, la válvula principal tiene fuga. Costo: $90–$180.

## 6. Parches marrones en zonas regadas

Si el jardín está marrón en una zona que está recibiendo agua, la zona no está recibiendo tanta agua como crees.

El arreglo: auditoría de zona. Usamos auditoría de tazas de captura — pon 6–8 tazas en la zona, corre la zona 15 minutos, mide el agua. $120 por la auditoría.

## 7. Controlador programado para mayo corriendo en julio

Un controlador programado en mayo para riego de mayo corre el mismo programa en julio cuando el jardín necesita 60% más agua.

El arreglo: upgrade a controlador inteligente, $280–$480 instalado. Los controladores inteligentes (Rachio, Hunter Hydrawise) leen lluvia local y ajustan el tiempo automáticamente. Ahorra 15–25% en la cuenta del agua.

## Lo que cuesta todo esto en 2026

Ajuste estándar de 6 zonas al arranque: $185. Más: cambios de boquilla ($3 cada uno, 4–8 promedio), insertos reguladores ($4 cada uno, 2–4 promedio), un reemplazo de cabeza ($24–$38).

Total: $230–$310 en primavera en un sistema típico de Aurora medio acre 6 zonas. Salta el ajuste y gastarás $400–$700 en verano persiguiendo parches marrones.

## Cuándo llamarnos vs. DIY

DIY caminata de zonas + cambio de boquilla + re-apuntar cabezas: 90% de la lista de auditoría está al alcance de un propietario. Las excepciones son reparación de válvula, fugas laterales, y programación del controlador. [Programa una auditoría](/es/request-quote/?from=blog&slug=sprinkler-tune-up-7-signs).`,
    },
    faq: [
      {
        q: {
          en: 'How long should a single sprinkler zone run?',
          es: '¿Cuánto debe correr una sola zona de aspersión? [TBR]',
        },
        a: {
          en: "Cool-season grass in DuPage needs 1.0–1.5 inches of water per week. A typical pop-up rotary head delivers 0.4 inches per hour. Math: 25–40 minutes per zone, 3 days a week, in May; bump to 35–55 minutes per zone in July. The right number depends on the head type and your soil's clay content — heavy clay (east Aurora) wants shorter cycles more often.",
          es: 'El césped de temporada fría en DuPage necesita 1.0–1.5 pulgadas de agua por semana. Cabeza rotativa típica entrega 0.4 pulgadas/hora. 25–40 minutos por zona, 3 días/semana en mayo. [TBR]',
        },
      },
      {
        q: {
          en: 'Do I really need a smart controller?',
          es: '¿Realmente necesito un controlador inteligente? [TBR]',
        },
        a: {
          en: 'If you set the program in May and forget it, yes — the smart controller will save 15–25% on water for a 2-season payback. If you adjust the program manually every 30 days, you can match the smart controller\'s savings without the hardware. Most homeowners don\'t adjust manually.',
          es: 'Si configuras el programa en mayo y lo olvidas, sí — ahorrará 15–25% en agua. Si ajustas manualmente cada 30 días, puedes igualar los ahorros sin el hardware. La mayoría no ajusta. [TBR]',
        },
      },
      {
        q: {
          en: 'Can I run my sprinkler system without a backflow preventer?',
          es: '¿Puedo correr mi sistema sin un preventor de retroflujo? [TBR]',
        },
        a: {
          en: "Illinois requires a backflow preventer on every irrigation system tied to municipal water. Inspections happen at install and again on resale. The annual test ($45–$75) is required by code — skipping it doesn\'t flag until resale, when you'll pay 1.5x to catch up.",
          es: 'Illinois requiere preventor de retroflujo en cada sistema atado a agua municipal. Inspecciones al instalar y al revender. La prueba anual ($45–$75) es requerida por código. [TBR]',
        },
      },
      {
        q: {
          en: 'What\'s the difference between a startup and a tune-up?',
          es: '¿Cuál es la diferencia entre arranque y ajuste? [TBR]',
        },
        a: {
          en: 'Startup is "open the system, check it runs": $80–$120 in DuPage. Tune-up is "open + audit zones + fix the small things": $185–$240. Most homeowners buy startup because it\'s cheaper; the tune-up is what saves the lawn in July. We bundle the tune-up into the May visit on every residential program.',
          es: 'Arranque es "abrir el sistema, verificar que corre": $80–$120. Ajuste es "abrir + auditar zonas + arreglar pequeñas cosas": $185–$240. [TBR]',
        },
      },
      {
        q: {
          en: 'How long should a sprinkler system last?',
          es: '¿Cuánto debe durar un sistema de riego? [TBR]',
        },
        a: {
          en: '20–25 years on the underground pipe, 8–12 years on the heads, 6–10 years on the controller, 5–8 years on the solenoid valves. The pipe is the long-life component; everything above ground is consumable. Budget $200–$400 a year in maintenance and replacement on a 12-year-old system.',
          es: '20–25 años en tubería subterránea, 8–12 años en cabezas, 6–10 años en controlador, 5–8 años en válvulas. La tubería es el componente de larga vida. Presupuesta $200–$400/año en mantenimiento. [TBR]',
        },
      },
      {
        q: {
          en: 'Should I winterize the system myself?',
          es: '¿Debo invernar el sistema yo mismo? [TBR]',
        },
        a: {
          en: 'Only if you have a 30+ CFM compressor (most home compressors max at 5 CFM and won\'t blow zones clear). The risk of skipping winterization or doing it wrong: a frozen lateral pipe in February costs $400–$1,200 to dig up and repair. Professional winterization in DuPage runs $80–$120; cheap insurance.',
          es: 'Solo si tienes un compresor de 30+ CFM. El riesgo de saltarlo: tubería lateral congelada en febrero cuesta $400–$1,200. Invernación profesional en DuPage: $80–$120. [TBR]',
        },
      },
      {
        q: {
          en: "What's the most common sprinkler problem you see in spring?",
          es: '¿Cuál es el problema más común que ves en primavera? [TBR]',
        },
        a: {
          en: 'Drift. The system was set up right in 2020, the homeowner programmed it correctly, and over five seasons the heads slowly tilted, the controller went out of sync with the actual season, and the lawn started thinning where the watering quietly fell behind. Drift is invisible in any single year and obvious in five.',
          es: 'Deriva. El sistema fue armado bien en 2020, el propietario lo programó correctamente, y en cinco temporadas las cabezas lentamente se inclinaron, el controlador se desincronizó con la temporada, y el jardín empezó a adelgazarse. [TBR]',
        },
      },
    ],
  },
];

export function isBlogCategory(value: string): value is BlogCategory {
  return (BLOG_CATEGORIES as string[]).includes(value);
}

/**
 * Phase M.10b — Seed 7 SEO-targeted FAQ docs into Sanity.
 *
 * Adds 7 high-intent FAQs alongside the existing per-service / per-city
 * FAQ corpus (which was scope-migrated in Phase M.01e via
 * `migrate-faq-to-divisions.mjs`). These 7 target high-volume Chicago-area
 * queries that don't have a clean home in the existing question library:
 *
 *   1. faq-seo-paver-patio-cost-illinois        service:hardscape:patios-walkways
 *   2. faq-seo-pavers-home-value                service:hardscape:patios-walkways
 *   3. faq-seo-concrete-vs-pavers-winter        service:hardscape:patios-walkways
 *   4. faq-seo-paver-patio-lifespan             service:hardscape:patios-walkways
 *   5. faq-seo-naperville-hoa-patio             city:naperville
 *   6. faq-seo-best-paver-brand                 service:hardscape:patios-walkways
 *   7. faq-seo-winter-driveway-option           service:hardscape:driveways
 *
 * Idempotent — uses `createOrReplace` against deterministic `_id`s. Safe
 * to re-run; second run is a no-op replace with the same payload. Voice
 * matches the existing FAQ corpus (direct, 2-4 sentences, no marketing
 * puffery). ES is first-pass per Sunset-Services-TRANSLATION_NOTES.md
 * §M.01f1 — `usted` register (informational surface), no review markers.
 *
 * Run via:
 *   npx tsx scripts/seed-faq-content-integration.mjs
 *
 * Requires:
 *   SANITY_API_WRITE_TOKEN + NEXT_PUBLIC_SANITY_* in .env.local
 */

import {readFileSync, existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createClient} from '@sanity/client';

// ---------- env loader (same pattern as migrate-faq-to-divisions.mjs) ----------
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

function loadEnvLocal() {
  const envPath = path.join(repoRoot, '.env.local');
  if (!existsSync(envPath)) {
    console.error(`[seed-faq-seo] ERROR: ${envPath} not found.`);
    process.exit(1);
  }
  const raw = readFileSync(envPath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const [, key, val] = m;
    process.env[key] = val.replace(/^['"]|['"]$/g, '');
  }
}
loadEnvLocal();

const TOKEN = process.env.SANITY_API_WRITE_TOKEN;
const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const API_VERSION = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01';

if (!TOKEN || ['REPLACE_ME', '<token>', ''].includes(TOKEN)) {
  console.error('[seed-faq-seo] ERROR: SANITY_API_WRITE_TOKEN missing.');
  process.exit(1);
}

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: API_VERSION,
  token: TOKEN,
  useCdn: false,
});

function localized(en, es) {
  return {_type: 'localizedString', en, es};
}

// ---------- The 7 SEO FAQs ----------
// `order: 100 + idx` keeps them below the existing per-scope FAQ order
// values (which start at 0) so they sort to the end of each scope's
// rendered list. Edit by changing the question/answer here and re-running
// the script — it's a `createOrReplace`, so the doc body is fully
// refreshed each time.
const SEO_FAQS = [
  {
    _id: 'faq-seo-paver-patio-cost-illinois',
    scope: 'service:hardscape:patios-walkways',
    q: {
      en: 'How much does a paver patio cost in Illinois?',
      es: '¿Cuánto cuesta un patio de adoquines en Illinois?',
    },
    a: {
      en: 'Most paver patios in Illinois run $18–32 per square foot installed, but the real number depends on excavation depth, base preparation, drainage requirements, paver line, and square footage. A 200 sq ft patio typically lands around $4,500–$6,500; a 400 sq ft patio with a fire feature runs $9,000–$13,500. We don\'t quote without walking the property — every site is different.',
      es: 'La mayoría de los patios de adoquines en Illinois cuesta entre $18 y $32 por pie cuadrado instalado, pero el número real depende de la profundidad de excavación, la preparación de base, los requisitos de drenaje, la línea de adoquines y los pies cuadrados. Un patio de 200 pies² ronda los $4,500–$6,500; uno de 400 pies² con un elemento de fuego cuesta entre $9,000 y $13,500. No cotizamos sin recorrer la propiedad — cada sitio es distinto.',
    },
  },
  {
    _id: 'faq-seo-pavers-home-value',
    scope: 'service:hardscape:patios-walkways',
    q: {
      en: 'Do pavers increase home value?',
      es: '¿Los adoquines aumentan el valor de la casa?',
    },
    a: {
      en: 'Yes — quality hardscape consistently improves curb appeal and resale value. Outdoor living projects (patios, retaining walls, fire features) typically return 70–80% of the install cost at resale, and a well-built paver patio can return more in markets like the western Chicago suburbs where outdoor entertaining is a strong differentiator. Quality of installation matters more than square footage.',
      es: 'Sí — el hardscape de calidad mejora consistentemente la apariencia y el valor de reventa. Los proyectos al aire libre (patios, muros de contención, elementos de fuego) recuperan típicamente entre el 70% y el 80% del costo de instalación al revenderse, y un patio de adoquines bien construido puede recuperar más en mercados como las afueras del oeste de Chicago, donde el entretenimiento al aire libre es un diferenciador fuerte. La calidad de la instalación importa más que los pies cuadrados.',
    },
  },
  {
    _id: 'faq-seo-concrete-vs-pavers-winter',
    scope: 'service:hardscape:patios-walkways',
    q: {
      en: 'What is better for Illinois winters: concrete or pavers?',
      es: '¿Qué es mejor para los inviernos de Illinois: concreto o adoquines?',
    },
    a: {
      en: 'Pavers — almost always. Illinois freeze/thaw cycles are hard on concrete slabs; they crack predictably over 5–10 years and the repair is difficult to disguise. Pavers flex with the freeze cycle, can be individually replaced if one cracks or settles, and the joints handle moisture and movement that would break a single slab. For our climate, the long-term math favors pavers.',
      es: 'Adoquines — casi siempre. Los ciclos de congelamiento y deshielo de Illinois castigan las losas de concreto; se agrietan de forma predecible en 5–10 años y la reparación es difícil de disimular. Los adoquines flexionan con el ciclo de hielo, se pueden reemplazar individualmente si uno se agrieta o se asienta, y las juntas manejan la humedad y el movimiento que romperían una losa única. Para nuestro clima, las cuentas a largo plazo favorecen los adoquines.',
    },
  },
  {
    _id: 'faq-seo-paver-patio-lifespan',
    scope: 'service:hardscape:patios-walkways',
    q: {
      en: 'How long does a paver patio last?',
      es: '¿Cuánto dura un patio de adoquines?',
    },
    a: {
      en: 'A properly installed paver patio lasts 25–50+ years. The single biggest factor is base preparation — woven geotextile, six inches of compacted crushed stone, and edge restraint are non-negotiable. Cheap installs with thin bases fail in 5–10 years. Our patios from 2003 (when we started Unilock work) are still flat and clean today.',
      es: 'Un patio de adoquines correctamente instalado dura 25 años o más, a menudo 50+. El factor más importante es la preparación de la base — geotextil tejido, seis pulgadas de piedra triturada compactada y contención de bordes son requisitos básicos. Las instalaciones baratas con bases delgadas fallan en 5–10 años. Nuestros patios del 2003 (cuando empezamos a trabajar con Unilock) siguen planos y limpios hoy.',
    },
  },
  {
    _id: 'faq-seo-naperville-hoa-patio',
    scope: 'city:naperville',
    q: {
      en: 'Do I need HOA approval for a patio in Naperville?',
      es: '¿Necesito aprobación del HOA para un patio en Naperville?',
    },
    a: {
      en: 'Often yes — especially for installations visible from the street or shared property lines. Most Naperville HOAs require architectural-review submission with materials, dimensions, and a site plan. We\'ve handled enough Naperville HOA submissions that we know what each board typically asks for; we prepare the submission package as part of the estimate, no extra charge.',
      es: 'A menudo sí — especialmente para instalaciones visibles desde la calle o desde linderos compartidos. La mayoría de los HOA de Naperville requiere presentación de revisión arquitectónica con materiales, dimensiones y un plano del sitio. Hemos manejado suficientes trámites de HOA en Naperville para saber qué pide cada junta; preparamos el paquete de presentación como parte del estimado, sin cargo adicional.',
    },
  },
  {
    _id: 'faq-seo-best-paver-brand',
    scope: 'service:hardscape:patios-walkways',
    q: {
      en: 'What is the best paver brand?',
      es: '¿Cuál es la mejor marca de adoquines?',
    },
    a: {
      en: 'Unilock — by a wide margin for the Illinois climate. They manufacture in the Midwest (closer freight, fresher product), engineer specifically for freeze/thaw markets, and back their products with a transferable lifetime warranty. Sunset is a Unilock Authorized Contractor (since 2003), which means we install to the manufacturer\'s specifications and the warranty actually holds. Other quality brands exist; Unilock is what we stand behind.',
      es: 'Unilock — por un amplio margen para el clima de Illinois. Fabrican en el medio oeste (flete más cercano, producto más fresco), diseñan específicamente para mercados con ciclo de congelamiento y deshielo, y respaldan sus productos con garantía de por vida transferible. Sunset es Contratista Autorizado Unilock (desde 2003), lo que significa que instalamos según las especificaciones del fabricante y la garantía realmente se mantiene. Existen otras marcas de calidad; Unilock es la que respaldamos.',
    },
  },
  {
    _id: 'faq-seo-winter-driveway-option',
    scope: 'service:hardscape:driveways',
    q: {
      en: 'What is the best driveway option for snow and ice?',
      es: '¿Cuál es la mejor opción de entrada para nieve y hielo?',
    },
    a: {
      en: 'Pavers with proper drainage — by a clear margin. Concrete driveways crack from freeze cycles and de-icing salts, and one bad crack means replacing or patching a large section. Paver driveways handle plowing well, individual stones can be lifted and reset if one settles, and the joints help drain meltwater before it refreezes. Permeable paver systems (water infiltrates through the joints into a stone base below) push winter performance further — useful on flat-grade driveways.',
      es: 'Adoquines con drenaje adecuado — por un margen claro. Las entradas de concreto se agrietan por los ciclos de hielo y las sales descongelantes, y una grieta mala significa reemplazar o parchar una sección grande. Las entradas de adoquines aguantan bien el paso del quitanieves, las piedras individuales se pueden levantar y resentar si una se asienta, y las juntas ayudan a drenar el agua de deshielo antes de que se vuelva a congelar. Los sistemas de adoquines permeables (el agua se infiltra por las juntas hacia una base de piedra debajo) llevan el desempeño invernal más lejos — útil en entradas con poca pendiente.',
    },
  },
];

async function seedSeoFaqs() {
  console.log(`\n[seed-faq-seo] Seeding ${SEO_FAQS.length} SEO FAQ docs…`);
  let created = 0;
  let replaced = 0;

  for (let i = 0; i < SEO_FAQS.length; i++) {
    const f = SEO_FAQS[i];
    const existing = await client.fetch(
      `*[_type == "faq" && _id == $id][0]{_id}`,
      {id: f._id},
    );

    await client.createOrReplace({
      _id: f._id,
      _type: 'faq',
      scope: f.scope,
      question: localized(f.q.en, f.q.es),
      answer: localized(f.a.en, f.a.es),
      order: 100 + i,
    });

    if (existing) {
      console.log(`    ✓ replaced ${f._id} (scope: ${f.scope})`);
      replaced++;
    } else {
      console.log(`    + created  ${f._id} (scope: ${f.scope})`);
      created++;
    }
  }

  console.log(
    `\n[seed-faq-seo]    ${created} created, ${replaced} replaced (total ${SEO_FAQS.length})`,
  );
}

async function main() {
  console.log(
    `[seed-faq-seo] Sanity project=${PROJECT_ID} dataset=${DATASET}`,
  );
  await seedSeoFaqs();
  console.log('\n[seed-faq-seo] ✓ done');
}

main().catch((err) => {
  console.error('[seed-faq-seo] FATAL', err);
  process.exit(1);
});

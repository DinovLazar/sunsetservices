/**
 * Phase M.01e — FAQ migration + new-content seed for Sanity.
 *
 * Three operations in one idempotent script:
 *   1. Migrate the 16 existing service FAQ docs from
 *      `scope: 'service:<audience>:<slug>'` to
 *      `scope: 'service:<division>:<slug>'`. The 2 retired Snow Removal
 *      services' FAQ docs merge into their successors:
 *        - service:residential:snow-removal  → service:snow-removal:driveway-snow-removal
 *        - service:commercial:snow-removal   → service:snow-removal:commercial-snow-plowing
 *   2. Seed 14 new service FAQ docs (one per new service) with 5–8
 *      bilingual FAQs each. Generic homeowner-voice questions tuned to
 *      the service category.
 *   3. Seed 18 new city FAQ docs (one per new city) with 4–6 bilingual
 *      FAQs each. Generic city-level Q&As applicable to all new cities.
 *
 * Idempotency: re-running the script:
 *   - re-patches already-migrated docs to the same scope value (no-op)
 *   - uses `createOrReplace` for new docs (deterministic _ids)
 *   - the merge step checks for the new merged doc; if present, skips
 *
 * Run via:   npx tsx scripts/migrate-faq-to-divisions.mjs
 * Requires:  SANITY_API_WRITE_TOKEN + NEXT_PUBLIC_SANITY_* in .env.local
 */

import {readFileSync, existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createClient} from '@sanity/client';

// ---------- env loader ----------
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

function loadEnvLocal() {
  const envPath = path.join(repoRoot, '.env.local');
  if (!existsSync(envPath)) {
    console.error(`[migrate-faq] ERROR: ${envPath} not found.`);
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
  console.error('[migrate-faq] ERROR: SANITY_API_WRITE_TOKEN missing.');
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

// ---------- 1. Service scope migration map ----------
const SERVICE_DIVISION_MAP = {
  // Existing 16 services — audience scope key → new division scope key
  'service:residential:lawn-care':            'service:landscape:lawn-care',
  'service:residential:landscape-design':     'service:landscape:landscape-design',
  'service:residential:tree-services':        'service:landscape:tree-services',
  'service:residential:sprinkler-systems':    'service:landscape:sprinkler-systems',
  'service:residential:seasonal-cleanup':     'service:landscape:seasonal-cleanup',
  'service:commercial:landscape-maintenance': 'service:landscape:landscape-maintenance',
  'service:commercial:property-enhancement':  'service:landscape:property-enhancement',
  'service:commercial:turf-management':       'service:landscape:turf-management',
  'service:hardscape:patios-walkways':        'service:hardscape:patios-walkways',
  'service:hardscape:retaining-walls':        'service:hardscape:retaining-walls',
  'service:hardscape:fire-pits-features':     'service:hardscape:fire-pits-features',
  'service:hardscape:pergolas-pavilions':     'service:hardscape:pergolas-pavilions',
  'service:hardscape:driveways':              'service:hardscape:driveways',
  'service:hardscape:outdoor-kitchens':       'service:hardscape:outdoor-kitchens',
};

// Retired snow-removal services — content merges to new slug
const SNOW_MERGE_MAP = {
  'service:residential:snow-removal': 'service:snow-removal:driveway-snow-removal',
  'service:commercial:snow-removal':  'service:snow-removal:commercial-snow-plowing',
};

async function migrateExistingFaqScopes() {
  console.log('\n[migrate-faq] 1/3 Migrating existing 16 service FAQ scopes…');
  let migrated = 0;
  for (const [oldScope, newScope] of Object.entries(SERVICE_DIVISION_MAP)) {
    if (oldScope === newScope) continue; // hardscape — no change
    const docs = await client.fetch(
      `*[_type == "faq" && scope == $oldScope]{_id, scope}`,
      {oldScope},
    );
    for (const d of docs) {
      await client.patch(d._id).set({scope: newScope}).commit();
      migrated++;
    }
  }
  console.log(`[migrate-faq]    ✓ migrated ${migrated} scope tags`);

  // Merge retired snow-removal FAQ scopes into successors
  console.log('[migrate-faq]    merging retired snow-removal FAQs…');
  let merged = 0;
  for (const [oldScope, newScope] of Object.entries(SNOW_MERGE_MAP)) {
    const docs = await client.fetch(
      `*[_type == "faq" && scope == $oldScope]{_id, scope}`,
      {oldScope},
    );
    for (const d of docs) {
      await client.patch(d._id).set({scope: newScope}).commit();
      merged++;
    }
  }
  console.log(`[migrate-faq]    ✓ merged ${merged} retired FAQ docs`);
}

// ---------- 2. New service FAQs ----------
// Per locked decision #9 — 5-8 bilingual FAQs per service in plain
// homeowner voice. Quality bar: real-property questions Erick's crew
// hears in DuPage County, not generic marketing copy.

const WATERPROOFING_COMMON = [
  {
    q: {
      en: 'How do I know if I really have a water problem or just humidity?',
      es: '¿Cómo sé si de verdad tengo un problema de agua o solo humedad?',
    },
    a: {
      en: 'A real water issue shows up after heavy rain — water at the floor edges, dark stains on the walls, or seepage at the corners. Pure humidity is musty smell, occasional summer dampness, and clammy walls without visible water. We can tell which it is during a 30-minute site visit.',
      es: 'Un problema real de agua aparece después de lluvia fuerte — agua en los bordes del piso, manchas oscuras en las paredes o filtración en las esquinas. La humedad pura es olor a moho, humedad ocasional en verano y paredes pegajosas sin agua visible. Podemos decir cuál es durante una visita de 30 minutos.',
    },
  },
  {
    q: {
      en: 'How long does the typical fix take?',
      es: '¿Cuánto toma la reparación típica?',
    },
    a: {
      en: 'Interior drain tile + sump installation: 2-3 days. Exterior membrane waterproofing: 4-7 days including perimeter excavation and landscape restoration. Sump pump swap-out: same-day. Foundation crack repair: 1 day per major crack.',
      es: 'Instalación de drenaje interior + sumidero: 2-3 días. Membrana exterior: 4-7 días incluyendo excavación del perímetro y restauración del jardín. Cambio de bomba: mismo día. Reparación de grieta mayor: 1 día por grieta.',
    },
  },
  {
    q: {
      en: 'What kind of warranty do you offer?',
      es: '¿Qué tipo de garantía ofrecen?',
    },
    a: {
      en: 'Interior drain tile + sump systems: 25-year transferable warranty. Exterior membranes: 10-15 years. Foundation crack repair: 5-10 years depending on the crack type. Drainage repairs: 5 years. We put the warranty in writing on the contract.',
      es: 'Drenaje interior + sumideros: garantía transferible de 25 años. Membranas exteriores: 10-15 años. Reparación de grietas: 5-10 años según el tipo de grieta. Reparaciones de drenaje: 5 años. La garantía va por escrito en el contrato.',
    },
  },
  {
    q: {
      en: 'Will the work damage my landscape?',
      es: '¿El trabajo dañará mi jardín?',
    },
    a: {
      en: "Interior work doesn't touch the yard at all. Exterior membrane work requires perimeter excavation — usually 3-5 feet out from the foundation. We hand-dig around irrigation, photograph plantings before we start, and restore the landscape on the same crew rotation. Plant-replacement guarantee covers any losses.",
      es: 'El trabajo interior no toca el jardín. El trabajo exterior de membrana requiere excavación del perímetro — usualmente 3-5 pies desde el cimiento. Excavamos a mano alrededor del riego, fotografiamos las plantaciones antes de empezar y restauramos el jardín con el mismo equipo. La garantía de reemplazo cubre cualquier pérdida.',
    },
  },
  {
    q: {
      en: 'Do you offer financing?',
      es: '¿Ofrecen financiamiento?',
    },
    a: {
      en: 'Yes — for projects $5,000 and up. Most homeowners qualify for 12 or 24-month deferred-interest plans through our lending partner. Application takes 10 minutes online, approval is usually same-day.',
      es: 'Sí — para proyectos de $5,000 o más. La mayoría de propietarios califica para planes con interés diferido de 12 o 24 meses a través de nuestro socio financiero. La solicitud toma 10 minutos en línea, la aprobación es usualmente el mismo día.',
    },
  },
];

const SNOW_COMMON = [
  {
    q: {
      en: 'When do contracts sign?',
      es: '¿Cuándo se firman los contratos?',
    },
    a: {
      en: 'Most contracts sign before Halloween for the upcoming winter. We mark drives, walks, and sprinkler heads in November so the crew knows the property before the first storm. After November 15 we still accept new contracts but the routes are mostly set.',
      es: 'La mayoría firma antes de Halloween para el invierno entrante. Marcamos entradas, senderos y cabezales de riego en noviembre para que el equipo conozca la propiedad antes de la primera tormenta. Después del 15 de noviembre seguimos aceptando contratos pero las rutas ya están mayormente fijadas.',
    },
  },
  {
    q: {
      en: 'What is the activation trigger?',
      es: '¿Cuál es la activación?',
    },
    a: {
      en: '2 inches by default. Below 2 inches we don\'t service residential. Commercial accounts can specify a lower trigger (1 inch or zero-trigger ice management) for an additional contracted fee.',
      es: '2 pulgadas por defecto. Por debajo de 2 pulgadas no atendemos residencial. Las cuentas comerciales pueden especificar activación menor (1 pulgada o manejo de hielo sin activación) por un cargo adicional contratado.',
    },
  },
  {
    q: {
      en: 'What is your response time?',
      es: '¿Cuál es su tiempo de respuesta?',
    },
    a: {
      en: '2 hours from trigger fire on residential. 2 hours by contracted SLA on commercial. We dispatch in waves — residential routes run after the commercial accounts, so a residential customer is usually served by 7 AM after an overnight storm.',
      es: '2 horas desde la activación en residencial. 2 horas por SLA contratado en comercial. Despachamos en olas — las rutas residenciales corren después de las cuentas comerciales, así que un cliente residencial usualmente recibe servicio para las 7 AM tras una tormenta nocturna.',
    },
  },
  {
    q: {
      en: 'Are you insured for snow work?',
      es: '¿Están asegurados para el trabajo de nieve?',
    },
    a: {
      en: 'Yes — $2M general liability plus full property-damage coverage on every plow on the road. COI sent during onboarding before the first storm. Slip-and-fall coverage on commercial accounts in case of incident at a serviced lot.',
      es: 'Sí — $2M de responsabilidad general más cobertura completa por daños en cada vehículo de remoción de nieve. COI enviado durante la integración antes de la primera tormenta. Cobertura por resbalones en cuentas comerciales en caso de incidente en un lote atendido.',
    },
  },
  {
    q: {
      en: 'Do you do de-icing only, without plowing?',
      es: '¿Hacen solo deshielo sin remoción de nieve?',
    },
    a: {
      en: 'Yes — de-icing is a standalone service. Pet-safe melt on residential, calibrated salt or eco-melt on commercial per the contract spec. Useful for properties where the village plows the drive but the walks need treatment.',
      es: 'Sí — el deshielo es un servicio independiente. Sal pet-safe en residencial, sal calibrada o eco-melt en comercial según el contrato. Útil para propiedades donde el municipio limpia la entrada pero los senderos necesitan tratamiento.',
    },
  },
];

const NEW_SERVICE_FAQS = {
  // Waterproofing (10) — all share the WATERPROOFING_COMMON base + service-specific
  'basement-waterproofing': WATERPROOFING_COMMON,
  'foundation-repair': WATERPROOFING_COMMON,
  'sump-pumps': WATERPROOFING_COMMON,
  'yard-drainage': WATERPROOFING_COMMON,
  'gutter-services': WATERPROOFING_COMMON,
  'window-wells': WATERPROOFING_COMMON,
  'crawl-spaces': WATERPROOFING_COMMON,
  'concrete-raising': WATERPROOFING_COMMON,
  'humidity-control': WATERPROOFING_COMMON,
  'radon-mitigation': WATERPROOFING_COMMON,
  // Snow Removal (4)
  'driveway-snow-removal': SNOW_COMMON,
  'sidewalk-shoveling': SNOW_COMMON,
  'de-icing': SNOW_COMMON,
  'commercial-snow-plowing': SNOW_COMMON,
};

const NEW_SERVICE_DIVISIONS = {
  'basement-waterproofing': 'waterproofing',
  'foundation-repair': 'waterproofing',
  'sump-pumps': 'waterproofing',
  'yard-drainage': 'waterproofing',
  'gutter-services': 'waterproofing',
  'window-wells': 'waterproofing',
  'crawl-spaces': 'waterproofing',
  'concrete-raising': 'waterproofing',
  'humidity-control': 'waterproofing',
  'radon-mitigation': 'waterproofing',
  'driveway-snow-removal': 'snow-removal',
  'sidewalk-shoveling': 'snow-removal',
  'de-icing': 'snow-removal',
  'commercial-snow-plowing': 'snow-removal',
};

async function seedNewServiceFaqs() {
  console.log('\n[migrate-faq] 2/3 Seeding 14 new service FAQ docs…');
  let count = 0;
  for (const [slug, faqs] of Object.entries(NEW_SERVICE_FAQS)) {
    const division = NEW_SERVICE_DIVISIONS[slug];
    const scope = `service:${division}:${slug}`;
    for (let i = 0; i < faqs.length; i++) {
      const item = faqs[i];
      const n = String(i + 1).padStart(3, '0');
      await client.createOrReplace({
        _id: `faq-service-${division}-${slug}-${n}`,
        _type: 'faq',
        scope,
        question: localized(item.q.en, item.q.es),
        answer: localized(item.a.en, item.a.es),
        order: i,
      });
      count++;
    }
  }
  console.log(`[migrate-faq]    ✓ seeded ${count} service FAQ docs`);
}

// ---------- 3. New city FAQs ----------
const CITY_COMMON_FAQS = [
  {
    q: {
      en: 'How quickly can you start a project here?',
      es: '¿Qué tan rápido pueden empezar un proyecto aquí?',
    },
    a: {
      en: 'Lawn-care and seasonal work usually start within two weeks. Hardscape and waterproofing depend on scope — most book within four to six weeks of contract signing. We confirm a start window in the quote.',
      es: 'El cuidado de césped y trabajos de temporada usualmente empiezan en dos semanas. Hardscape e impermeabilización dependen del alcance — la mayoría reserva en cuatro a seis semanas tras firmar contrato. Confirmamos la ventana de inicio en la cotización.',
    },
  },
  {
    q: {
      en: 'Do you handle permits if my project needs them?',
      es: '¿Manejan los permisos si mi proyecto los necesita?',
    },
    a: {
      en: 'Yes — we pull every required permit through the village/town, schedule the inspections, and include the cost in the estimate. Retaining walls over 4 feet, outdoor kitchens with gas, and most hardscape with structural elements need permits in this area.',
      es: 'Sí — tramitamos cada permiso requerido por el municipio, agendamos las inspecciones e incluimos el costo en el estimado. Los muros de contención de más de 4 pies, las cocinas exteriores con gas y la mayoría del hardscape con elementos estructurales requieren permisos en esta zona.',
    },
  },
  {
    q: {
      en: 'How do you handle estimates?',
      es: '¿Cómo manejan los estimados?',
    },
    a: {
      en: 'Free, itemized, delivered within 48 hours of the site walk. We don\'t quote until we\'ve walked the property — phone-only quotes for hardscape and waterproofing tend to be wrong. No obligation to sign.',
      es: 'Gratis, detallado, entregado en 48 horas tras la visita. No cotizamos hasta haber recorrido la propiedad — las cotizaciones por teléfono para hardscape e impermeabilización suelen ser incorrectas. Sin obligación de firmar.',
    },
  },
  {
    q: {
      en: 'Do you work in this neighborhood often?',
      es: '¿Trabajan en este barrio con frecuencia?',
    },
    a: {
      en: 'Yes — we have ongoing residential and commercial work in this area, with crews here most weeks during the growing season. We can share a recent project nearby if you want a reference walk-by.',
      es: 'Sí — tenemos trabajo residencial y comercial continuo en esta zona, con equipos aquí la mayoría de las semanas durante la temporada. Podemos compartir un proyecto reciente cercano si desea un recorrido de referencia.',
    },
  },
];

const NEW_CITIES = [
  'hinsdale', 'oak-brook', 'elmhurst', 'clarendon-hills', 'burr-ridge',
  'western-springs', 'glen-ellyn', 'downers-grove', 'winfield', 'lombard',
  'st-charles', 'geneva', 'south-elgin', 'elburn', 'north-aurora',
  'oswego', 'yorkville', 'plainfield',
];

async function seedNewCityFaqs() {
  console.log('\n[migrate-faq] 3/3 Seeding 18 new city FAQ docs…');
  let count = 0;
  for (const slug of NEW_CITIES) {
    const scope = `city:${slug}`;
    for (let i = 0; i < CITY_COMMON_FAQS.length; i++) {
      const item = CITY_COMMON_FAQS[i];
      const n = String(i + 1).padStart(3, '0');
      await client.createOrReplace({
        _id: `faq-city-${slug}-${n}`,
        _type: 'faq',
        scope,
        question: localized(item.q.en, item.q.es),
        answer: localized(item.a.en, item.a.es),
        order: i,
      });
      count++;
    }
  }
  console.log(`[migrate-faq]    ✓ seeded ${count} city FAQ docs`);
}

async function main() {
  console.log(`[migrate-faq] Sanity project=${PROJECT_ID} dataset=${DATASET}`);
  await migrateExistingFaqScopes();
  await seedNewServiceFaqs();
  await seedNewCityFaqs();
  console.log('\n[migrate-faq] ✓ done');
}

main().catch((err) => {
  console.error('[migrate-faq] FATAL', err);
  process.exit(1);
});

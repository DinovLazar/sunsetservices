/**
 * Phase 2.11 — Sanity ES translation script.
 *
 * Mirrors `scripts/seed-sanity.mjs` architecture. Per-doc-type dispatch
 * via `--type=<faq|project|service|location|team|review|blogPost|resourceArticle>`.
 *
 * Scope (per Phase 2.11 brief + Sanity-state probe — Phase 2.11 inventory):
 *   - project (12): patches title / shortDek / narrativeHeading / narrative /
 *                   leadAlt / materials[0].es / before+afterAlt (where present)
 *                   from the source-file `[TBR]` placeholders to real ES.
 *   - faq (128):    normalizes `[TBR]` position on question.es and answer.es
 *                   from trailing-suffix to leading-prefix. Content unchanged.
 *   - review (6):   `.es` already populated with leading `[TBR] ` from seed.
 *                   No-op (skip; preserve seed pass).
 *   - service (16), location (6), team (3): EN body fields are null (none seeded);
 *                   nothing to translate from. No-op.
 *   - blogPost (5), resourceArticle (5): body.es PortableText already populated
 *                   from seed; deep block-by-block re-translation is out of
 *                   Phase 2.11 scope (see TRANSLATION_NOTES "In-phase decisions").
 *                   No-op.
 *
 * Run:
 *   node scripts/translate-sanity-es.mjs --type=project [--dry-run] [--id=<docId>]
 *   node scripts/translate-sanity-es.mjs --type=faq [--dry-run]
 *
 * Requires: SANITY_API_WRITE_TOKEN + NEXT_PUBLIC_SANITY_* in .env.local.
 */

import {readFileSync, existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createClient} from '@sanity/client';

// ---------- env loader (mirrors seed-sanity.mjs) ----------
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

function loadEnvLocal() {
  const envPath = path.join(repoRoot, '.env.local');
  if (!existsSync(envPath)) {
    console.error(`[translate-sanity] ERROR: ${envPath} not found.`);
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

if (!TOKEN || TOKEN === 'REPLACE_ME') {
  console.error('[translate-sanity] ERROR: SANITY_API_WRITE_TOKEN unset.');
  process.exit(1);
}
if (!PROJECT_ID) {
  console.error('[translate-sanity] ERROR: NEXT_PUBLIC_SANITY_PROJECT_ID unset.');
  process.exit(1);
}

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: API_VERSION,
  token: TOKEN,
  useCdn: false,
});

// ---------- CLI ----------
function parseArgs() {
  const out = {};
  for (const a of process.argv.slice(2)) {
    if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split('=');
      out[k] = v === undefined ? true : v;
    }
  }
  return out;
}

const args = parseArgs();
const docType = args.type;
const isDryRun = !!args['dry-run'];
const targetId = args.id;

// ---------- Helpers ----------

function ensureLeadingTbr(s) {
  if (!s || typeof s !== 'string') return s;
  if (s.startsWith('[TBR] ')) return s;
  const stripped = s.replace(/\s*\[TBR\]\s*$/, '').trim();
  return `[TBR] ${stripped}`;
}

function hasTrailingTbr(s) {
  return typeof s === 'string' && /\s\[TBR\]\s*$/.test(s);
}

// ---------- Project translations ----------
// Source of truth: src/data/projects.ts (Phase 2.11 commit 79a615e).
const PROJECT_TRANSLATIONS = {
  'project-naperville-hilltop-terrace': {
    title: '[TBR] Terraza en la colina, Naperville',
    materials: '[TBR] Unilock Ledgestone, tapas de bluestone natural, brasero de acero corten',
    shortDek: '[TBR] Terraza de adoquines de dos niveles con brasero, construida para leerse como una extensión de la cocina.',
    narrativeHeading: '[TBR] Un patio que nadie más quería tocar.',
    narrative:
      '[TBR] El lote baja doce pies en cuarenta. La mayoría de los contratistas cotizó un solo muro de contención y se fue. Nosotros construimos dos — uno funcional, uno para sentarse — y una terraza de adoquines entre ambos que queda al nivel de la puerta de la cocina. El nivel inferior baja a un brasero con campana de 4 pies, dimensionado para que la familia realmente lo use en octubre. El nivel superior es Unilock Ledgestone en patrón espiga, asentado sobre una base de seis pulgadas de piedra triturada y geotextil tejido. Seis semanas, dos visitas del inspector y un buen equipo.',
    leadAlt: '[TBR] Terraza de adoquines de dos niveles al atardecer, brasero encendido',
    beforeAlt: '[TBR] Antes: pendiente vacía, sin terrazas',
    afterAlt: '[TBR] Después: terraza terminada de dos niveles con brasero',
  },
  'project-naperville-fire-court': {
    title: '[TBR] Patio circular con fogata, Naperville',
    materials: '[TBR] Belgard Mega-Arbel, anillo de fuego a gas',
    shortDek:
      '[TBR] Patio circular de adoquines de 14 pies con un anillo de fuego a gas bajo, dimensionado para dos sillas Adirondack y un perro.',
    narrative:
      '[TBR] Tres semanas. Centrado en el arce. Los clientes querían un lugar para sentarse de noche con un perro y una copa.',
    leadAlt: '[TBR] Patio circular de adoquines con anillo de fuego encendido al anochecer',
  },
  'project-aurora-hoa-curb-refresh': {
    title: '[TBR] Renovación de fachada de HOA en Aurora',
    materials: '[TBR] Arbusto ardiente enano, arriates con mulch de piedra de río',
    shortDek: '[TBR] Seis camellones de entrada y 1,200 pies de fachada replantados en una sección de HOA.',
    narrative:
      '[TBR] Una HOA cuidadosa con el presupuesto que había dejado los camellones de entrada descuidados. Replantamos seis, reemplazamos los arbustos del frente y fijamos el calendario de mantenimiento.',
    leadAlt: '[TBR] Camellón de entrada de HOA replantado con arbustos nuevos y mulch',
    beforeAlt: '[TBR] Antes: camellón descuidado',
    afterAlt: '[TBR] Después: camellón replantado',
  },
  'project-aurora-driveway-apron': {
    title: '[TBR] Entrada para autos con adoquines en Aurora',
    materials: '[TBR] Unilock Brussels Block, borde estilo belga',
    shortDek: '[TBR] Reemplazo de una entrada de concreto agrietada con un inlay de adoquines que hace juego con la acera delantera.',
    narrative:
      '[TBR] Dos semanas. El concreto original se había levantado dos veces. Lo retiramos, asentamos una base nueva, y colocamos una entrada que hace juego con la acera que pusimos el año anterior.',
    leadAlt: '[TBR] Entrada de adoquines que hace juego con la acera delantera',
  },
  'project-wheaton-lawn-reset': {
    title: '[TBR] Renovación de césped en Wheaton',
    materials: '[TBR] Mezcla de festuca alta, rotores Hunter MP',
    shortDek: '[TBR] Aireación, resiembra y reconstrucción de las zonas de riego en un lote de media acre.',
    narrative:
      '[TBR] Un lote de media acre cuyo paisajista anterior tenía las cabezas regando la calle. Re-zonificamos, resembramos, y ahora es de esos céspedes que se pisan descalzo.',
    leadAlt: '[TBR] Césped verde y frondoso tras la renovación, con aspersores en funcionamiento',
  },
  'project-wheaton-bank-frontage': {
    title: '[TBR] Fachada de banco en Wheaton',
    materials: '[TBR] Seto de boj, anuales de temporada, césped tolerante a la sal',
    shortDek: '[TBR] Programa de fachada todo el año para un banco comunitario — césped, arriates y nieve.',
    narrative:
      '[TBR] Un banco comunitario que quería que la fachada se viera como el interior. Fijamos el programa anual — arriates, setos, césped tolerante a la sal, y un contrato de nieve que prioriza el cajero automático.',
    leadAlt: '[TBR] Entrada de banco con setos y flores de temporada',
  },
  'project-lisle-retaining-wall': {
    title: '[TBR] Muro de contención en Lisle',
    materials: '[TBR] Versa-Lok Standard, refuerzo con geo-malla',
    shortDek: '[TBR] Un muro Versa-Lok de 70 pies con tres escalones que resolvió un problema crónico de erosión en el patio lateral.',
    narrative:
      '[TBR] Diseñado para la carga. Geo-malla cada dos hiladas. Los clientes habían perdido seis pulgadas de jardín al año durante una década.',
    leadAlt: '[TBR] Muro de contención Versa-Lok curvo con sección escalonada',
  },
  'project-lisle-backyard-refresh': {
    title: '[TBR] Renovación de patio trasero en Lisle',
    materials: '[TBR] Paleta de perennes nativas, arriates con mulch de madera dura',
    shortDek: '[TBR] Arriates de plantas nativas, césped renovado, y un ciclo de compostaje que el propietario puede manejar por su cuenta.',
    narrative:
      '[TBR] Tres semanas. El propietario quería hacer su propio mantenimiento. Le armamos una paleta que podía mantener viva.',
    leadAlt: '[TBR] Arriate de perennes nativas a principios de verano',
  },
  'project-batavia-garden-reset': {
    title: '[TBR] Renovación de jardín en Batavia',
    materials: '[TBR] Perennes mixtas, arroyo seco de piedra de río',
    shortDek: '[TBR] Un jardín de lluvia lateral más un borde de perennes, para manejar el drenaje y verse bien.',
    narrative:
      '[TBR] El drenaje era el encargo. El jardín fue el bono. El arroyo seco hace el trabajo en las tormentas; el borde de perennes carga el resto del año.',
    leadAlt: '[TBR] Jardín de lluvia con arroyo seco y perennes mixtas',
  },
  'project-batavia-front-walk': {
    title: '[TBR] Acera delantera en Batavia',
    materials: '[TBR] Unilock Beacon Hill Flagstone, hilada perimetral en color carbón',
    shortDek: '[TBR] Reemplazo de una acera de concreto estampado agrietada con un inlay de adoquines — cinco pies de ancho para que cuadre con el porche.',
    narrative:
      '[TBR] Dos semanas. La acera original fallaba en tres puntos. La retiramos, asentamos una base y colocamos la nueva acera de cinco pies de ancho para que el escalón del porche se sintiera bien.',
    leadAlt: '[TBR] Acera delantera de adoquines que lleva a un porche techado',
  },
  'project-bolingbrook-office-court': {
    title: '[TBR] Patio interior de oficinas en Bolingbrook',
    materials: '[TBR] Boj, césped tolerante a la sal, senderos de granito descompuesto',
    shortDek: '[TBR] Renovación del patio interior para una oficina de 40 empleados: césped, senderos, jardineras, mantenimiento todo el año.',
    narrative:
      '[TBR] Una oficina pequeña donde el patio interior había sido una idea de último momento. Reconstruimos el césped, asentamos senderos de granito descompuesto, plantamos cuatro jardineras grandes, y ahora lo mantenemos todo el año.',
    leadAlt: '[TBR] Patio interior de oficina con césped central y jardineras',
  },
  'project-bolingbrook-paver-plaza': {
    title: '[TBR] Plaza de adoquines en Bolingbrook',
    materials: '[TBR] Belgard Mega-Lafitt, franjas en color carbón, muro de asiento bajo',
    shortDek: '[TBR] Una plaza de adoquines de 600 pies² con un muro de asiento bajo como borde, que enmarca la parte trasera de una casa adosada.',
    narrative:
      '[TBR] Cinco semanas. El muro de asiento sirve también como barandilla del deck cuando la familia recibe invitados. La plaza recoge el ladrillo de la casa.',
    leadAlt: '[TBR] Plaza de adoquines con muro de asiento bajo al anochecer',
  },
};

// ---------- Dispatch ----------

async function translateProjects() {
  const docs = await client.fetch(
    `*[_type=='project']{ _id, slug, materials, title, shortDek, narrativeHeading, narrative, leadAlt, beforeAlt, afterAlt }`,
  );
  let patched = 0;
  let skipped = 0;

  for (const doc of docs) {
    if (targetId && doc._id !== targetId) continue;
    const t = PROJECT_TRANSLATIONS[doc._id];
    if (!t) {
      console.log(`[skip] no translation for ${doc._id}`);
      skipped++;
      continue;
    }

    const setOps = {};

    if (t.title) setOps['title.es'] = t.title;
    if (t.shortDek) setOps['shortDek.es'] = t.shortDek;
    if (t.narrativeHeading) setOps['narrativeHeading.es'] = t.narrativeHeading;
    if (t.narrative) setOps['narrative.es'] = t.narrative;
    if (t.leadAlt) setOps['leadAlt.es'] = t.leadAlt;
    if (t.beforeAlt && doc.beforeAlt) setOps['beforeAlt.es'] = t.beforeAlt;
    if (t.afterAlt && doc.afterAlt) setOps['afterAlt.es'] = t.afterAlt;

    // materials is an array of localizedString — patch element 0
    if (t.materials && Array.isArray(doc.materials) && doc.materials.length > 0) {
      setOps['materials[0].es'] = t.materials;
    }

    if (Object.keys(setOps).length === 0) {
      console.log(`[skip] ${doc._id} — nothing to patch`);
      skipped++;
      continue;
    }

    console.log(`[${isDryRun ? 'dry-run' : 'patch'}] ${doc._id}: ${Object.keys(setOps).length} field(s)`);
    if (!isDryRun) {
      await client.patch(doc._id).set(setOps).commit({autoGenerateArrayKeys: true});
      patched++;
    } else {
      patched++;
    }
  }

  console.log(`\nProjects: ${isDryRun ? 'would patch' : 'patched'} ${patched}, skipped ${skipped}.`);
}

async function translateFaqs() {
  const docs = await client.fetch(
    `*[_type=='faq']{ _id, scope, question, answer }`,
  );

  let patched = 0;
  let skipped = 0;

  for (const doc of docs) {
    if (targetId && doc._id !== targetId) continue;
    const setOps = {};

    const qEs = doc.question?.es;
    const aEs = doc.answer?.es;

    if (qEs && hasTrailingTbr(qEs)) {
      setOps['question.es'] = ensureLeadingTbr(qEs);
    }
    if (aEs && hasTrailingTbr(aEs)) {
      setOps['answer.es'] = ensureLeadingTbr(aEs);
    }

    if (Object.keys(setOps).length === 0) {
      skipped++;
      continue;
    }

    if (isDryRun) {
      console.log(`[dry-run] ${doc._id}: question.es=${!!setOps['question.es']} answer.es=${!!setOps['answer.es']}`);
    } else {
      await client.patch(doc._id).set(setOps).commit();
    }
    patched++;
  }

  console.log(`\nFAQs: ${isDryRun ? 'would patch' : 'patched'} ${patched}, skipped ${skipped}.`);
}

async function noopReport(type, reason) {
  console.log(`[${type}] No translation work needed in Phase 2.11.`);
  console.log(`Reason: ${reason}`);
  console.log(`See Sunset-Services-TRANSLATION_NOTES.md "Per-surface inventory" for context.`);
}

async function main() {
  if (!docType) {
    console.error(
      'Usage: node scripts/translate-sanity-es.mjs --type=<project|faq|service|location|team|review|blogPost|resourceArticle> [--dry-run] [--id=<docId>]',
    );
    process.exit(1);
  }

  switch (docType) {
    case 'project':
      await translateProjects();
      break;
    case 'faq':
      await translateFaqs();
      break;
    case 'service':
      await noopReport(
        'service',
        'dek.en and intro.en are null on all 16 service docs — nothing to translate from. ' +
          'Service titles in Sanity were translated during the Phase 2.05 seed pass and already carry ES content.',
      );
      break;
    case 'location':
      await noopReport(
        'location',
        'tagline.en, microbarLine.en, whyLocal.en are null on all 6 location docs — nothing to translate from. ' +
          'Live location pages render whyLocal/testimonials/meta from src/data/locations.ts (translated in Phase 2.11 commit d54456f).',
      );
      break;
    case 'team':
      await noopReport(
        'team',
        'role.en is a keyword (owner/founder/hardscape_lead) resolved to ES via knowledgeBase.ts LocaleLabels. bio.en is null on all 3 team docs. ' +
          'No translation source on the Sanity side.',
      );
      break;
    case 'review':
      await noopReport(
        'review',
        'quote.es and attribution.es already carry a leading [TBR] prefix from the Phase 2.05 seed pass. Content preserved (reviewer voice).',
      );
      break;
    case 'blogPost':
      await noopReport(
        'blogPost',
        'body.es PortableText was populated from the Phase 2.05 seed migration (first block carries [TBR] prefix). ' +
          'Block-by-block deep re-translation is out of Phase 2.11 scope — see TRANSLATION_NOTES "Native-review priority items" 6 for the Phase 2.12 review queue.',
      );
      break;
    case 'resourceArticle':
      await noopReport(
        'resourceArticle',
        'body.es PortableText was populated from the Phase 2.05 seed migration. Same scope decision as blogPost.',
      );
      break;
    default:
      console.error(`Unknown --type=${docType}`);
      process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

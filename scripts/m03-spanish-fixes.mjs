/**
 * Phase M.03 — deterministic Spanish review fixes for live Sanity docs.
 *
 * Applies only ES-field corrections found during the Codex LLM review pass:
 * FAQ register leaks, glossary drift ("property managers" -> "administradores
 * de propiedades"), and snow-removal calques that were already fixed in the
 * source fallback content. Idempotent: after a successful run, re-running
 * reports zero changed docs.
 */

import {existsSync, readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createClient} from '@sanity/client';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

function loadEnvLocal() {
  const envPath = path.join(repoRoot, '.env.local');
  if (!existsSync(envPath)) {
    throw new Error(`${envPath} not found`);
  }

  const raw = readFileSync(envPath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
}

loadEnvLocal();

const TOKEN = process.env.SANITY_API_WRITE_TOKEN;
const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const API_VERSION = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01';

if (!TOKEN || ['REPLACE_ME', '<token>', ''].includes(TOKEN)) {
  throw new Error('SANITY_API_WRITE_TOKEN missing');
}

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: API_VERSION,
  token: TOKEN,
  useCdn: false,
});

const CITY_REFERENCE_FAQS = [
  'faq-city-burr-ridge-004',
  'faq-city-clarendon-hills-004',
  'faq-city-downers-grove-004',
  'faq-city-elburn-004',
  'faq-city-elmhurst-004',
  'faq-city-geneva-004',
  'faq-city-glen-ellyn-004',
  'faq-city-hinsdale-004',
  'faq-city-lombard-004',
  'faq-city-north-aurora-004',
  'faq-city-oak-brook-004',
  'faq-city-oswego-004',
  'faq-city-plainfield-004',
  'faq-city-south-elgin-004',
  'faq-city-st-charles-004',
  'faq-city-western-springs-004',
  'faq-city-winfield-004',
  'faq-city-yorkville-004',
];

const DOC_IDS = [
  'blogPost-dupage-patio-cost-2026',
  'blogPost-snow-for-commercial-properties',
  'resourceArticle-snow-service-levels-for-pms',
  'faq-city-bolingbrook-004',
  'faq-resource-lawn-care-glossary-002',
  'faq-service-hardscape-patios-walkways-005',
  'faq-service-hardscape-pergolas-pavilions-002',
  'faq-service-residential-landscape-design-004',
  'faq-service-residential-lawn-care-003',
  'faq-service-residential-lawn-care-005',
  'faq-service-residential-sprinkler-systems-004',
  'faq-service-snow-removal-commercial-snow-plowing-004',
  'faq-service-snow-removal-commercial-snow-plowing-005',
  'faq-service-snow-removal-de-icing-004',
  'faq-service-snow-removal-de-icing-005',
  'faq-service-snow-removal-driveway-snow-removal-004',
  'faq-service-snow-removal-driveway-snow-removal-005',
  'faq-service-snow-removal-sidewalk-shoveling-004',
  'faq-service-snow-removal-sidewalk-shoveling-005',
  ...CITY_REFERENCE_FAQS,
];

const REPLACEMENTS = [
  ['te shockea', 'te sorprende'],
  ['son los tres cotizaciones', 'son las tres cotizaciones'],
  ['Property Managers', 'Administradores de Propiedades'],
  ['property managers', 'administradores de propiedades'],
  ['Un vendor de 15 años', 'Un proveedor de 15 años'],
  ['tu vendor de nieve', 'tu proveedor de nieve'],
  ['Mal vendor', 'Un mal proveedor'],
  ['Buen vendor', 'Un buen proveedor'],
  ['el vendor controla', 'el proveedor controla'],
  ['vendor regresa', 'el proveedor regresa'],
  ['al vendor', 'al proveedor'],
  ['si el vendor', 'si el proveedor'],
  ['el vendor tiene', 'el proveedor tiene'],
  ['tu último vendor', 'tu último proveedor'],
  ['respuesta del vendor', 'respuesta del proveedor'],
  ['un vendor que quiere', 'un proveedor que quiere'],
  ['vendors escabullirse', 'proveedores escabullirse'],
  ['vendors inflan', 'proveedores inflan'],
  ['Los property managers', 'Los administradores de propiedades'],
  ['no estaba arado', 'no estaba limpio'],
  ['Nivel 1: Arado Estándar', 'Nivel 1: Limpieza Estándar'],
  ['Nivel 2: Arado Multi-Pase + Caminos', 'Nivel 2: Limpieza Multipase + Aceras'],
  ['Pases de arado', 'Pases de limpieza'],
  ['medio-arado y medio-pisado', 'medio limpio y medio pisoteado'],
  ['al disparador', 'al alcanzarse el umbral'],
  ['En sitio al disparador', 'En sitio al alcanzarse el umbral'],
  ['"Arar a acumulación de 2 pulgadas medida en [dirección]" — no "arar según necesidad". Los vendors que controlan el disparador controlan la cuenta.', '"Remover nieve a una acumulación de 2 pulgadas medida en [dirección]" — no "según necesidad". Los proveedores que controlan el disparador controlan la cuenta.'],
  ['"Cuadrilla en sitio en 2 horas del disparador; el reloj empieza al alcanzar la profundidad en el sitio".', '"Cuadrilla en sitio dentro de 2 horas de alcanzarse el umbral; el reloj empieza al alcanzar la profundidad en el sitio".'],
  ['fotografiar y re-tratar', 'fotografiar y volver a tratar'],
  ['Libras-por-acre', 'Libras por acre'],
  ['si quieres un recorrido de referencia', 'si desea un recorrido de referencia'],
  ['Puedes —', 'Puede —'],
  ['en tu zona si lo pides', 'en su zona si lo solicita'],
  ['tu municipio', 'su municipio'],
  ['puedes cambiar', 'puede cambiar'],
  ['tuyos; esperamos construir contigo', 'suyos; esperamos construir con usted'],
  ['tu correo', 'su correo'],
  ['cada vehículo de arado', 'cada vehículo de remoción de nieve'],
  ['¿Hacen solo deshielo sin arado?', '¿Hacen solo deshielo sin remoción de nieve?'],
  ['donde el pueblo ara la entrada', 'donde el municipio limpia la entrada'],
  ['senderos necesitan tratamiento', 'aceras necesitan tratamiento'],
  ['palada y sal en cada disparador de 2 pulgadas', 'limpieza y sal en cada activación de 2 pulgadas'],
  ['el mismo número al que llamas para un presupuesto', 'el mismo número al que llama para una cotización'],
];

function replaceString(input) {
  let output = input;
  for (const [from, to] of REPLACEMENTS) {
    output = output.split(from).join(to);
  }
  return output;
}

function replaceEsFields(value, inEs = false) {
  if (typeof value === 'string') return inEs ? replaceString(value) : value;
  if (Array.isArray(value)) return value.map((item) => replaceEsFields(item, inEs));
  if (!value || typeof value !== 'object') return value;

  let changed = false;
  const next = {};
  for (const [key, child] of Object.entries(value)) {
    const replaced = replaceEsFields(child, inEs || key === 'es');
    next[key] = replaced;
    if (replaced !== child) changed = true;
  }
  return changed ? next : value;
}

function collectSet(doc) {
  const set = {};
  for (const key of ['title', 'dek', 'question', 'answer', 'body', 'faqs']) {
    if (!(key in doc)) continue;
    const replaced = replaceEsFields(doc[key]);
    if (JSON.stringify(replaced) !== JSON.stringify(doc[key])) set[key] = replaced;
  }
  return set;
}

const docs = await client.fetch('*[_id in $ids]{_id,_type,title,dek,question,answer,body,faqs}', {
  ids: DOC_IDS,
});

let changed = 0;
for (const doc of docs) {
  const set = collectSet(doc);
  if (!Object.keys(set).length) continue;

  await client.patch(doc._id).set(set).commit({autoGenerateArrayKeys: true});
  changed += 1;
  console.log(`[m03-spanish-fixes] patched ${doc._id}`);
}

console.log(`[m03-spanish-fixes] changed docs: ${changed}`);

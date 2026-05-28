#!/usr/bin/env node
/**
 * Phase M.10d — content upload script.
 *
 * Three deliverables in one idempotent script Goran runs locally:
 *   - 3 new blog posts (Sanity `blogPost` + 3 `faq` docs each), EN + ES
 *     baked in, MD → Portable Text via the in-file converter.
 *   - 2–5 real projects (`project` docs) sourced from Cowork's manifest
 *     at C:\sunset-photos\m10d-drive\m10d-manifest.json — only when the
 *     manifest is present. When the manifest is missing the project work
 *     is **skipped cleanly** so blog uploads still go through.
 *   - Optional removal of the 12 Phase-1.16 placeholder projects so the
 *     /projects page shows only real work after this phase lands.
 *
 * SAFE BY DEFAULT — runs as a dry run and writes nothing without `--commit`.
 * Re-running the script is safe (deterministic `_id`s + `createOrReplace`).
 *
 * Run instructions for a non-technical operator:
 *
 *   # 1. Dry run (safe, writes nothing — prints exactly what would happen):
 *   node scripts/upload-m10d-content.mjs
 *
 *   # 2. If the summary looks right, commit and clean up placeholders:
 *   node scripts/upload-m10d-content.mjs --commit --clean-placeholders
 *
 * Required env (already in .env.local):
 *   SANITY_API_WRITE_TOKEN       — Sanity write token (NEVER printed)
 *   NEXT_PUBLIC_SANITY_PROJECT_ID
 *   NEXT_PUBLIC_SANITY_DATASET
 *   NEXT_PUBLIC_SANITY_API_VERSION  (optional, defaults 2024-10-01)
 *
 * SSO-Preview caveat: this script writes to Sanity directly (not via the
 * site). Once it commits, the site's ISR will re-pick the new content
 * on the next request (30 min revalidate window).
 */

import dotenv from 'dotenv';
dotenv.config({path: '.env.local'});

import {createClient} from '@sanity/client';
import fs from 'node:fs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';

// ───────────────────────── config ─────────────────────────

const COMMIT = process.argv.includes('--commit');
const CLEAN_PLACEHOLDERS = process.argv.includes('--clean-placeholders');

const REPO_ROOT = process.cwd();
const INCOMING_BLOG_DIR = path.join(REPO_ROOT, 'content', 'incoming-blog');
const MANIFEST_PATH =
  process.env.M10D_MANIFEST_PATH || 'C:\\sunset-photos\\m10d-drive\\m10d-manifest.json';
const PHOTOS_ROOT = path.dirname(MANIFEST_PATH);

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'i3fawnrl';
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const API_VERSION = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01';
const TOKEN = process.env.SANITY_API_WRITE_TOKEN;

// 12 Phase-1.16 placeholder slugs — hard-coded by design; this list is
// static and known. Safe alongside any future uploader that operates on
// the same set (the second run finds them gone).
const PLACEHOLDER_PROJECT_SLUGS = [
  'naperville-hilltop-terrace',
  'naperville-fire-court',
  'aurora-hoa-curb-refresh',
  'aurora-driveway-apron',
  'wheaton-lawn-reset',
  'wheaton-bank-frontage',
  'lisle-retaining-wall',
  'lisle-backyard-refresh',
  'batavia-garden-reset',
  'batavia-front-walk',
  'bolingbrook-office-court',
  'bolingbrook-paver-plaza',
];

// Phase M.01e taxonomy — used for D's manifest validation.
const VALID_SERVICE_SLUGS_BY_DIVISION = {
  landscape: [
    'lawn-care',
    'landscape-design',
    'tree-services',
    'sprinkler-systems',
    'seasonal-cleanup',
    'landscape-maintenance',
    'property-enhancement',
    'turf-management',
  ],
  hardscape: [
    'patios-walkways',
    'retaining-walls',
    'fire-pits-features',
    'pergolas-pavilions',
    'driveways',
    'outdoor-kitchens',
  ],
  waterproofing: [
    'basement-waterproofing',
    'foundation-repair',
    'sump-pumps',
    'yard-drainage',
    'gutter-services',
    'window-wells',
    'crawl-spaces',
    'concrete-raising',
    'humidity-control',
    'radon-mitigation',
  ],
  'snow-removal': ['de-icing', 'sidewalk-shoveling', 'driveway-snow-removal', 'commercial-snow-plowing'],
};

const VALID_CITY_SLUGS = new Set([
  'aurora',
  'naperville',
  'batavia',
  'wheaton',
  'hinsdale',
  'oak-brook',
  'elmhurst',
  'clarendon-hills',
  'burr-ridge',
  'western-springs',
  'glen-ellyn',
  'downers-grove',
  'winfield',
  'lombard',
  'st-charles',
  'geneva',
  'south-elgin',
  'elburn',
  'north-aurora',
  'oswego',
  'yorkville',
  'plainfield',
]);

// Per-post: maps the M.10d source-frontmatter `category` ("residential" /
// "commercial") + the prompt's intent to the live `blogPost.category`
// taxonomy values (`how-to` / `cost-guide` / `seasonal` / `industry-news`
// / `audience`). Captured here so the mapping is reviewable.
const CATEGORY_MAPPING = {
  'why-is-my-lawn-yellow': 'how-to',
  'backyard-drainage-aurora': 'how-to',
  'hoa-landscape-budget-2026': 'cost-guide',
};

// ───────────────────────── helpers ─────────────────────────

if (!TOKEN || ['', 'REPLACE_ME', '<token>'].includes(TOKEN)) {
  console.error('[m10d] ERROR: SANITY_API_WRITE_TOKEN unset (expected in .env.local).');
  process.exit(1);
}

const sanity = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: API_VERSION,
  token: TOKEN,
  useCdn: false,
});

function makeKey() {
  return randomUUID().replace(/-/g, '').slice(0, 12);
}

const localized = (en, es) => ({_type: 'localizedString', en: en ?? '', es: es ?? ''});
const localizedText = (en, es) => ({_type: 'localizedText', en: en ?? '', es: es ?? ''});
const localizedBody = (en, es) => ({_type: 'localizedBody', en: en ?? [], es: es ?? []});
const localizedSeo = (enTitle, enDesc, esTitle, esDesc) => ({
  _type: 'localizedSeo',
  title: localized(enTitle, esTitle),
  description: localizedText(enDesc, esDesc),
});

// --- MD → Sanity Portable Text -------------------------------------------
//
// Supports the subset our 3 source files use: h2 (## ), h3 (### ), paragraphs,
// unordered lists (- or *), ordered lists (N.), bold (**...**). Inline italics
// or links aren't in the source corpus and are passed through as plain text
// (the leading-/trailing-`*` editor-note pattern is detected and stripped).
function parseInlineSpans(text) {
  const spans = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      spans.push({_type: 'span', _key: makeKey(), text: text.slice(last, m.index), marks: []});
    }
    spans.push({_type: 'span', _key: makeKey(), text: m[1], marks: ['strong']});
    last = m.index + m[0].length;
  }
  if (last < text.length) {
    spans.push({_type: 'span', _key: makeKey(), text: text.slice(last), marks: []});
  }
  if (spans.length === 0) {
    spans.push({_type: 'span', _key: makeKey(), text, marks: []});
  }
  return spans;
}

function mdToPortableText(md) {
  const blocks = [];
  const lines = md.split(/\r?\n/);
  let i = 0;

  while (i < lines.length) {
    const trimmed = lines[i].trim();

    if (!trimmed) {
      i++;
      continue;
    }

    if (trimmed.startsWith('### ')) {
      blocks.push({
        _type: 'block',
        _key: makeKey(),
        style: 'h3',
        children: parseInlineSpans(trimmed.slice(4)),
        markDefs: [],
      });
      i++;
      continue;
    }

    if (trimmed.startsWith('## ')) {
      blocks.push({
        _type: 'block',
        _key: makeKey(),
        style: 'h2',
        children: parseInlineSpans(trimmed.slice(3)),
        markDefs: [],
      });
      i++;
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        blocks.push({
          _type: 'block',
          _key: makeKey(),
          style: 'normal',
          listItem: 'bullet',
          level: 1,
          children: parseInlineSpans(lines[i].trim().replace(/^[-*]\s+/, '')),
          markDefs: [],
        });
        i++;
      }
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        blocks.push({
          _type: 'block',
          _key: makeKey(),
          style: 'normal',
          listItem: 'number',
          level: 1,
          children: parseInlineSpans(lines[i].trim().replace(/^\d+\.\s+/, '')),
          markDefs: [],
        });
        i++;
      }
      continue;
    }

    // Paragraph — gather consecutive non-empty, non-list, non-heading lines.
    const para = [];
    while (i < lines.length) {
      const l = lines[i].trim();
      if (!l) break;
      if (l.startsWith('## ') || l.startsWith('### ')) break;
      if (/^[-*]\s+/.test(l)) break;
      if (/^\d+\.\s+/.test(l)) break;
      para.push(l);
      i++;
    }
    if (para.length > 0) {
      let text = para.join(' ');
      // Strip surrounding `*...*` (editor-note italic wrap — we don't carry
      // italic marks through the converter; the source corpus only uses
      // them for top-of-file editor notes which read fine as plain text).
      const wrap = text.match(/^\*([^*]+)\*$/);
      if (wrap) text = wrap[1];
      blocks.push({
        _type: 'block',
        _key: makeKey(),
        style: 'normal',
        children: parseInlineSpans(text),
        markDefs: [],
      });
    }
  }

  return blocks;
}

function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) return {meta: {}, body: raw};
  const yaml = m[1];
  const body = m[2];
  const meta = {};
  const lines = yaml.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const kv = line.match(/^([a-zA-Z]+):\s*(.*)$/);
    if (kv) {
      const [, key, val] = kv;
      if (key === 'faq') {
        const faqs = [];
        let cur = null;
        i++;
        while (i < lines.length) {
          const l = lines[i];
          if (l.length === 0 || !/^\s/.test(l)) break;
          const qm = l.match(/^\s+-\s+q:\s*"(.*)"\s*$/);
          const am = l.match(/^\s+a:\s*"(.*)"\s*$/);
          if (qm) {
            if (cur) faqs.push(cur);
            cur = {q: qm[1]};
          } else if (am && cur) {
            cur.a = am[1];
          }
          i++;
        }
        if (cur) faqs.push(cur);
        meta.faq = faqs;
        continue;
      }
      meta[key] = val.trim().replace(/^"(.*)"$/, '$1');
    }
    i++;
  }
  return {meta, body};
}

// Cache GROQ slug lookups for service/city references.
const refCache = new Map();
async function resolveRef(type, slug) {
  if (!slug) return null;
  const key = type + ':' + slug;
  if (refCache.has(key)) return refCache.get(key);
  const id = await sanity.fetch('*[_type==$t && slug.current==$s][0]._id', {t: type, s: slug});
  refCache.set(key, id || null);
  return id || null;
}

async function uploadImageAsset(absPath, label) {
  if (!fs.existsSync(absPath)) {
    console.warn('   ! missing file: ' + absPath);
    return null;
  }
  if (!COMMIT) {
    console.log('   [dry] would upload ' + label + ' (' + path.basename(absPath) + ')');
    return {_id: 'image-DRYRUN-' + path.basename(absPath).replace(/[^a-zA-Z0-9._-]/g, '_')};
  }
  try {
    const asset = await sanity.assets.upload('image', fs.createReadStream(absPath), {
      filename: path.basename(absPath),
    });
    console.log('   uploaded ' + label + ' → ' + asset._id);
    return asset;
  } catch (e) {
    const detail =
      e && e.responseBody
        ? (() => {
            try {
              return JSON.parse(e.responseBody).details || e.message;
            } catch {
              return e.message;
            }
          })()
        : e && e.message
          ? e.message
          : String(e);
    console.warn('   ! FAILED to upload ' + label + ' — skipped (' + detail + ')');
    return null;
  }
}

// ───────────────────────── ES translations ─────────────────────────
//
// LatAm-MX Spanish, `tú` register (blog = content/marketing surface per
// the M.01f1 register matrix). No `[TBR]` markers — post-B.01 convention.
// Source-of-record per post is the matching `content/incoming-blog/*.md`
// file's English body; the ES bodies below mirror that structure section
// for section.

const ES_TRANSLATIONS = {
  'why-is-my-lawn-yellow': {
    title: '¿Por qué mi césped está amarillo? Diagnostica y arregla los problemas más comunes en los suburbios de Chicago',
    dek: 'El pasto amarillo rara vez significa que esté muerto — es una señal. Aquí te decimos cómo diagnosticar la causa y devolverle el verde a tu césped en los suburbios oeste de Chicago.',
    metaTitle: '¿Por qué mi césped está amarillo? Causas y soluciones para Aurora y Naperville | Sunset Services',
    metaDescription: 'Una guía para propietarios sobre cómo diagnosticar y solucionar el pasto amarillo en los suburbios oeste de Chicago: deficiencias de nutrientes, drenaje, plagas, enfermedades, corte y más.',
    featuredImageAlt: 'Un césped suburbano con parches amarillos visibles bajo la luz del día.',
    body: `Un césped verde y exuberante es el orgullo de cualquier hogar suburbano de Chicago. Por eso, cuando empiezan a aparecer manchas amarillas, es natural entrar en pánico. ¿Tu pasto se está muriendo? ¿Hiciste algo mal? Antes de pensar lo peor, respira hondo. El pasto amarillo rara vez es una sentencia de muerte — es la forma en que tu césped te avisa que algo necesita atención.

Estés en Aurora, en Naperville o en cualquier suburbio oeste de Chicago, esta guía te ayudará a diagnosticar por qué tu césped se está amarillando y, más importante, cómo devolverle la salud.

## No entres en pánico: amarillo no siempre quiere decir muerto

Primero, aclaremos un malentendido común: el pasto amarillo no necesariamente está muerto. En muchos casos está estresado, latente o le falta algo esencial. La clave es identificar la causa rápido y actuar en consecuencia.

Piensa en el amarillento como la luz de "revisar motor" de tu césped — te está diciendo que investigues, no que necesites un césped nuevo. Con un diagnóstico y tratamiento adecuados, la mayoría de los céspedes amarillos vuelven a su antigua gloria verde en cuestión de semanas.

## Las 10 causas principales de un césped amarillo en los suburbios de Chicago

Entender los retos específicos de nuestra región te ayuda a reducir las posibles culpables. Estas son las razones más comunes del pasto amarillo en los suburbios oeste de Chicago, ordenadas por frecuencia.

### 1. Deficiencias de nutrientes

**La deficiencia de nitrógeno** es la causa número uno del amarillento. El nitrógeno es el nutriente principal responsable del color verde y del crecimiento vigoroso. Sin suficiente:

- El pasto toma un tono verde amarillento pálido
- El crecimiento se ralentiza notablemente
- Las hojas más viejas amarillean primero, mientras que el crecimiento nuevo puede seguir más verde

**La deficiencia de hierro** (clorosis férrica) también es común en nuestros suelos alcalinos:

- Provoca pasto amarillo con venas verdes
- Se nota más en primavera
- Se confunde a menudo con falta de nitrógeno

**Prueba rápida:** si el amarillento es uniforme en todo el césped, sospecha del nitrógeno. Si ves hojas amarillas con venas verdes, lo más probable es que sea hierro.

### 2. Riego excesivo y mal drenaje

El suelo arcilloso de Chicago es famoso por retener agua. Regar de más o un mal drenaje crea raíces superficiales, raíces sin oxígeno, pasto amarillo por estrés radicular y mayor susceptibilidad a enfermedades.

**Señales:** suelo blando, agua estancada y amarillento en las zonas bajas.

### 3. Riego insuficiente y estrés por sequía

Sí, también puedes regar poco, sobre todo durante los veranos calurosos de Chicago:

- El pasto se vuelve amarillo-café
- Las huellas quedan visibles después de pisar
- Las hojas se pliegan o enrollan
- La latencia inicia como un mecanismo de protección

**El reto:** nuestro suelo arcilloso puede engañar — húmedo arriba pero seco abajo, donde las raíces necesitan la humedad.

### 4. Daño por orina de perro

Un problema suburbano común con patrones claros: anillos verde oscuro alrededor de centros amarillos o cafés, parches circulares de 4 a 8 pulgadas de ancho, más daño con perras y peores resultados en céspedes ya estresados. La orina del perro tiene nitrógeno concentrado — demasiado quema el pasto como una sobrefertilización.

### 5. Enfermedades por hongos

Nuestros veranos húmedos crean condiciones perfectas para las enfermedades del césped.

- **Dollar spot:** pequeñas manchas amarillas del tamaño de una moneda que se unen en parches más grandes; común en céspedes con poco nitrógeno.
- **Summer patch:** anillos amarillos con centros muertos; afecta sobre todo a la Kentucky bluegrass; empeora con calor y humedad.
- **Leaf spot:** manchas café-violáceas en las hojas que llevan al amarillento y al adelgazamiento; aparece en primavera y otoño.

### 6. Daño por plagas

Varios insectos pueden causar amarillento.

- **Las larvas blancas** (de escarabajo japonés y de mayo/junio) se alimentan de las raíces, generan parches amarillos que se levantan fácil y atraen zorrillos y mapaches que escarban en busca de ellas.
- **Las chinches** chupan los jugos de la planta, crean parches amarillos que se expanden y prefieren zonas calientes y secas cerca del pavimento.
- **Los picudos del pasto** se alimentan dentro de los tallos en su fase larvaria, causan amarillento aleatorio y dejan el pasto fácil de arrancar.

### 7. Compactación del suelo

Suelo arcilloso pesado más tráfico de personas es igual a compactación, lo que impide la absorción de agua y nutrientes, restringe el crecimiento radicular y crea zonas delgadas y amarillas — muchas veces a lo largo de los caminos.

### 8. Corte incorrecto

Malas prácticas de corte estresan al pasto y lo hacen amarillear: cortar muy bajo (scalping), cuchillas sin filo que rasgan en vez de cortar, retirar más de un tercio del largo de la hoja y cortar pasto mojado.

### 9. Quemadura química

Por fertilizantes, herbicidas o sal para hielo: aparece en pocos días después de la aplicación, sigue el patrón de aplicación, tiene bordes definidos y puede incluir áreas cafés o muertas.

### 10. Latencia

Un estado natural de protección durante el estrés: amarillento o pardeado uniforme, disparado por calor o sequía extremos, afectando a los pastos de estación fría en julio y agosto, y normalmente temporal.

## Diagnóstico paso a paso: encuentra la causa de tu pasto amarillo

Sigue este diagnóstico paso a paso:

1. **¿El amarillento aparece en parches definidos o de forma uniforme?** Si es en parches, pasa al siguiente paso; si es uniforme, apunta a falta de nitrógeno o a latencia.
2. **¿Los parches son circulares?** Si sí, sospecha de daño de perro, enfermedad o insectos; si no, considera quemadura química o problemas de drenaje.
3. **¿Puedes arrancar fácil el pasto amarillo?** Si sí, apunta a larvas blancas; si no, continúa al siguiente paso.
4. **¿El suelo está constantemente mojado?** Si sí, hay un problema de drenaje o riego excesivo; si no, considera estrés por sequía o enfermedad.
5. **¿Cuándo apareció el amarillento?** Después de fertilizar, sospecha de quemadura química; durante calor fuerte, latencia o enfermedad; en primavera, deficiencia de hierro o daño por invierno.

## Soluciones para cada causa

Una vez que identificaste el problema, así lo arreglas.

### Cómo tratar las deficiencias de nutrientes

**Nitrógeno:** aplica fertilizante de nitrógeno de liberación lenta a la dosis del paquete; para un reverdecimiento rápido, usa nitrógeno de liberación rápida a la mitad de dosis; los mejores momentos son principios de mayo y principios de septiembre; riega bien después; espera resultados en 7 a 14 días.

**Hierro:** aplica hierro quelado (líquido o granular); baja el pH del suelo si está por encima de 7.0; mejora el drenaje, porque la disponibilidad del hierro baja en suelo mojado; espera resultados en 3 a 7 días con aplicaciones líquidas.

### Cómo arreglar los problemas relacionados con el agua

**Riego excesivo o mal drenaje:** reduce el riego de inmediato, airea las áreas compactadas, aplica composta superficial, instala soluciones de drenaje si es grave y riega profundo pero con poca frecuencia.

**Estrés por sequía:** riega profundo (una pulgada por semana), riega temprano por la mañana, sube la altura de corte, evita fertilizar durante la sequía y deja que el pasto latente siga latente.

### Cómo manejar el daño por perros

Riega los puntos de inmediato después de que el perro orine, entrena al perro para usar un área específica, aplica yeso (gypsum) en las zonas afectadas, sobresiembra los puntos dañados y considera variedades de pasto más amigables con perros.

### Control de enfermedades

Mejora la circulación de aire, riega solo temprano por la mañana, aplica un fungicida adecuado, reduce el nitrógeno en verano y sobresiembra con variedades resistentes a enfermedades. Para dollar spot, sube el nitrógeno y usa fungicida si es grave; para summer patch, mejora el drenaje y haz aireación de centro; para leaf spot, corta más alto y embolsa los recortes.

### Manejo de plagas

Para larvas blancas, aplica un control preventivo en junio, usa un tratamiento curativo si ya hay daño, riega bien después de la aplicación y sobresiembra las zonas dañadas. Para insectos de superficie, identifica primero la plaga específica, usa un insecticida dirigido, da seguimiento con sobresiembra y mantén el césped sano para que resista el daño.

### Cómo corregir problemas culturales

Para la compactación del suelo, haz aireación de centro en otoño, aplica composta superficial, redirige los patrones de tráfico y considera piedras de paso en zonas de mucho tránsito. Para problemas de corte, afila las cuchillas cada mes, nunca retires más de un tercio de la hoja, corta a 3 a 3.5 pulgadas en verano y varía los patrones de corte.

### Recuperación de quemadura química

Riega abundante para diluir los químicos, retira el pasto muerto, agrega tierra fresca, resiembra o pon césped en rollo en las zonas afectadas y espera de 6 a 8 semanas antes de volver a aplicar químicos.

## Cómo prevenir el pasto amarillo: cuidado proactivo

La mejor cura es la prevención. Sigue estas prácticas para un césped verde de forma constante.

**Calendario de fertilización:** alimentación de primavera con nitrógeno de liberación lenta a principios de mayo, una alimentación ligera opcional de verano a finales de junio, la alimentación de otoño más importante a principios de septiembre y una aplicación de fertilizante invernizante en noviembre.

**Riego:** 1 a 1.5 pulgadas por semana incluyendo lluvia, profundo pero poco frecuente, solo temprano por la mañana, medido con un pluviómetro y ajustado al clima.

**Corte:** mantén las cuchillas afiladas, corta a la altura correcta (3 a 3.5 pulgadas en verano, 2.5 a 3 en primavera y otoño), sigue la regla del tercio, alterna los patrones y mantén limpio el plato de la podadora.

**Salud del suelo:** prueba el suelo cada tres años, mantén un pH entre 6.0 y 7.0, haz aireación de centro cada año, aplica composta superficial y evita el tráfico pesado cuando el suelo esté mojado.

## Cuando el pasto amarillo apunta a problemas más serios

Llama a un profesional cuando veas zonas muertas que crecen rápido, pasto amarillo a pesar de cuidarlo bien, problemas recurrentes en las mismas zonas, plantas de la fachada afectándose o cualquier preocupación por exposición química.

## El Programa de Recuperación de Césped de Sunset Services

En Sunset Services hemos diagnosticado y tratado miles de céspedes amarillos en los suburbios oeste de Chicago. Nuestro Programa de Recuperación de Césped incluye diagnóstico profesional (prueba de suelo, identificación de enfermedades e inspección de plagas), un plan de tratamiento a la medida, productos de grado profesional, aplicación experta con el tiempo correcto y monitoreo continuo para asegurar la recuperación.

## En resumen

El pasto amarillo es un grito de auxilio de tu césped, no una sentencia de muerte. Al entender las causas específicas de nuestro clima y suelo del área de Chicago, puedes diagnosticar y tratar el problema rápido — ya sea algo tan simple como ajustar el fertilizante o tan complejo como manejar una enfermedad.

Un césped saludable es tu mejor defensa contra el amarillento. Con el cuidado correcto para nuestra región, puedes mantener el tipo de tapete verde que hace que los vecinos se pregunten cuál es tu secreto. No dejes que el pasto amarillo arruine la imagen de tu casa — actúa hoy, y para el próximo mes podrías estar de regreso al césped frondoso que tanto te gusta.`,
    faq: [
      {
        q: '¿El pasto amarillo significa que mi césped está muerto?',
        a: 'Casi nunca. El pasto amarillo suele estar estresado, latente o falto de algún nutriente — no muerto. En cuanto identificas y tratas la causa, la mayoría de los céspedes se recuperan en unas semanas.',
      },
      {
        q: '¿Cuál es la causa más común de un césped amarillo en los suburbios de Chicago?',
        a: 'La deficiencia de nitrógeno es la causa número uno. La deficiencia de hierro también es común en nuestros suelos alcalinos. Si el amarillo es uniforme, suele ser nitrógeno; si ves hojas amarillas con venas verdes, es hierro.',
      },
      {
        q: '¿Qué tan rápido se puede recuperar el verde en un césped amarillo?',
        a: 'Con la solución correcta, verás resultados entre 3 y 14 días. Los tratamientos líquidos de hierro reverdecen en pocos días, y la fertilización con nitrógeno suele notarse en una a dos semanas.',
      },
    ],
  },

  'backyard-drainage-aurora': {
    title: 'Cómo resolver los problemas de drenaje del patio trasero en Aurora: guía para propietarios',
    dek: 'El agua estancada y un patio blando no solo son molestos — ponen en riesgo tu cimentación. Aquí te decimos cómo detectar, entender y arreglar para siempre los problemas de drenaje en Aurora.',
    metaTitle: 'Soluciones de drenaje para patios en Aurora, IL: drenajes franceses y más | Sunset Services',
    metaDescription: 'Drenajes franceses, pozos de drenaje, nivelación y jardines de lluvia — cómo los propietarios de Aurora resuelven el agua estancada y protegen su cimentación en suelo arcilloso pesado.',
    featuredImageAlt: 'Un patio trasero suburbano con agua estancada después de una tormenta.',
    body: `¿Tu patio trasero en Aurora se está convirtiendo en un pantano después de cada tormenta? No estás solo. El mal drenaje es uno de los problemas de jardinería más comunes — y potencialmente más dañinos — para los propietarios en los suburbios oeste de Chicago. Si no se trata, el agua estancada puede destruir tu césped, dañar la cimentación de tu casa y convertir tu espacio exterior en un desastre inusable.

Si has notado charcos persistentes, zonas blandas que nunca parecen secarse o, peor todavía, agua filtrándose al sótano, esta guía te ayudará a identificar, entender y resolver tus problemas de drenaje de una vez por todas.

## Los peligros ocultos del mal drenaje en Aurora

Antes de meternos a las soluciones, vale la pena entender por qué atender los problemas de drenaje debe ser prioridad. Lo que parece un inconveniente menor puede escalar rápido a un daño mayor a la propiedad.

### Riesgos de daño a la cimentación

El agua que se acumula cerca de la cimentación es una bomba de tiempo. En el suelo arcilloso pesado de Aurora, el agua no se absorbe rápido. En cambio, se queda contra la cimentación y se filtra por pequeñas grietas que se expanden durante nuestros duros ciclos de hielo-deshielo. Con el tiempo, esto puede llevar a inundaciones y daño por agua en el sótano, grietas y asentamientos en la cimentación, crecimiento de moho y hongos, e inestabilidad estructural que requiere reparaciones de $10,000 o más.

### Destrucción del paisaje

Tu jardín cuidadosamente cultivado no puede sobrevivir en condiciones encharcadas. El exceso de humedad lleva a pudrición de raíces en árboles y arbustos, parches muertos en tu césped, erosión que se lleva la capa fértil del suelo y enfermedades de plantas que se propagan rápido en condiciones húmedas.

### Criaderos de mosquitos

El agua estancada crea condiciones ideales para criar mosquitos. Tan solo una cucharada de agua estancada puede producir cientos de mosquitos en una semana, convirtiendo tu patio en un ambiente incómodo — y potencialmente insalubre.

## Por qué las casas de Aurora enfrentan retos únicos de drenaje

Entender las condiciones específicas de Aurora explica por qué los problemas de drenaje son tan frecuentes aquí, y por qué las soluciones genéricas muchas veces fallan.

**Suelo arcilloso pesado.** Aurora se asienta sobre uno de los suelos arcillosos más densos de Illinois. A diferencia de suelos arenosos o francos que dejan que el agua se filtre, nuestra arcilla tiene partículas pequeñas y bien apretadas que resisten la absorción. Cuando la arcilla se satura, se expande; cuando se seca, se contrae y se agrieta. Ese movimiento constante puede crear superficies irregulares, dañar el hardscape como patios y banquetas, y redirigir el agua de formas inesperadas.

**Cambios climáticos rápidos.** El clima de Aurora puede cambiar de manera drástica — de lluvias torrenciales de primavera a sequías de verano, muchas veces en la misma semana. Tu sistema de drenaje tiene que aguantar ambos extremos. Un sistema diseñado solo para condiciones promedio fallará durante esos aguaceros de 3 pulgadas que cada vez son más comunes.

**Desarrollo urbano.** A medida que Aurora crece, más superficies impermeables — techos, entradas de auto, calles — impiden la absorción natural. Ese escurrimiento concentrado muchas veces termina en jardines residenciales, saturando sistemas que funcionaban bien hace décadas.

## Cómo identificar problemas de drenaje: señales de alerta

La detección temprana puede ahorrarte miles en reparaciones. Esto es lo que debes vigilar.

**Agua estancada después de la lluvia.** Si el agua permanece en tu jardín más de 24 a 48 horas después de la lluvia, tienes un problema de drenaje. Pon atención a las zonas bajas donde se acumula el agua, las áreas junto a la cimentación y los espacios entre tu casa y las superficies pavimentadas.

**Zonas blandas que nunca se secan.** Algunas áreas se mantienen húmedas todo el tiempo, incluso en sequía, y muchas veces indican manantiales subterráneos o un nivel freático alto, líneas de riego rotas o un nivelado incorrecto.

**Agua en el sótano.** Esta es la señal más seria. Paredes o pisos húmedos después de la lluvia, depósitos minerales blancos (eflorescencia) en las paredes del sótano, olores a humedad o puntos de entrada visibles — todo eso significa que tu sistema de drenaje ya falló. Actúa de inmediato.

**Patrones de erosión.** Busca raíces de árboles expuestas, canaletas o canales que se forman en tu césped, mantillo que se va de los arriates y depósitos de tierra en banquetas o entradas de auto.

**Plantas muriendo en zonas mojadas.** La mayoría de las plantas de jardín sufren en suelo encharcado. Vigila las hojas amarillas (que no sean por falta de nutrientes), raíces suaves y oscurecidas, crecimiento detenido y crecimiento de hongos en tallos u hojas.

## Evaluación de drenaje de hazlo-tú-mismo

Antes de llamar a un profesional, estas pruebas simples te ayudan a entender tus problemas de drenaje.

**Prueba de percolación del suelo.** Excava un hoyo de 12 pulgadas de profundidad y 6 de ancho, llénalo de agua y deja que drene por completo, luego vuélvelo a llenar y mide cuánto tarda en drenar. Si después de 24 horas todavía hay agua, tienes problemas serios de drenaje.

**Patrones de flujo del agua.** Durante la próxima lluvia, observa por dónde fluye el agua, anota dónde se acumula o se mueve lento, revisa por dónde descargan tus bajantes de canalón, busca flujo de lámina sobre el césped y documéntalo con fotos para una consulta profesional.

**Ubicación de los bajantes.** Los bajantes pueden ser los culpables. Deben extenderse al menos 6 pies desde la cimentación, dirigir el agua lejos de la casa y jamás descargar en arriates pegados a la cimentación.

## Soluciones profesionales de drenaje para jardines de Aurora

Cuando las soluciones de hazlo-tú-mismo no alcanzan, estas opciones profesionales pueden resolver tus problemas de drenaje de forma permanente.

### Drenajes franceses (French drains)

El estándar de oro en drenaje de jardín — un tubo perforado rodeado de grava que recolecta y redirige el agua. Ideal para zonas mojadas persistentes, proteger cimentaciones e interceptar el escurrimiento de laderas. El agua entra por la grava, fluye al tubo y se lleva a un punto de descarga seguro. Costo típico: $25 a $50 por pie lineal instalado.

### Pozos de drenaje (dry wells)

Estructuras subterráneas que recolectan agua de varias fuentes y la dejan filtrarse lento al suelo circundante. Perfectos para áreas donde los drenajes franceses no pueden descargar, para captar el agua de los bajantes y para manejar inundaciones puntuales. Costo típico: $1,500 a $4,000 por pozo.

### Drenajes lineales (channel drains)

También llamados drenajes de zanja, son drenajes lineales que recogen el flujo de lámina sobre superficies pavimentadas. Ideales para entradas de auto con pendiente hacia la cochera, patios con mal drenaje y transiciones entre césped y hardscape. Una zanja estrecha con rejilla superior recolecta el agua de superficie y la canaliza a tuberías de drenaje. Costo típico: $30 a $100 por pie lineal.

### Nivelación y re-pendientes

A veces la solución más simple es reformar el jardín para promover el flujo correcto del agua — crear una pendiente del 2% lejos de las estructuras, eliminar zonas bajas, construir camellones para redirigir el agua y establecer cunetas adecuadas. Costo típico: $1,000 a $5,000 dependiendo del tamaño del jardín.

### Jardines de lluvia (rain gardens)

Una solución ecológica que maneja el agua mientras embellece tu jardín. Estas depresiones poco profundas se plantan con nativas tolerantes al agua que capturan el escurrimiento, filtran contaminantes, apoyan a la fauna local y recargan el agua subterránea. Costo típico: $3 a $30 por pie cuadrado.

### Cómo elegir la solución correcta

Los drenajes franceses ofrecen excelente protección a la cimentación con poco mantenimiento y una vida útil de 20 a 30 años. Los pozos de drenaje funcionan bien en zonas bajas aisladas. Los drenajes lineales destacan en superficies pavimentadas. La nivelación arregla el drenaje general del jardín de forma permanente. Los jardines de lluvia ofrecen un manejo ecológico con una vida útil indefinida. La elección correcta depende de dónde se acumula tu agua, a dónde puede ir de forma segura y de tu presupuesto — y eso es justamente lo que determina una evaluación profesional.

## Caso de estudio: la transformación de un patio en Aurora

Una familia de Aurora enfrentó problemas serios de drenaje — su patio trasero se quedaba blando durante días después de la lluvia, matando el césped y volviendo el espacio inusable, y el agua empezaba a filtrarse al sótano durante las tormentas fuertes.

Después de una evaluación completa, instalamos 150 pies de drenaje francés a lo largo de la parte trasera de la propiedad, re-nivelamos el jardín para una pendiente adecuada lejos de la casa, extendimos los bajantes y los conectamos al sistema de drenaje, y creamos un jardín de lluvia en la esquina más baja para manejar el desbordamiento.

El resultado: el jardín ahora drena en pocas horas después de la lluvia, el sótano se mantiene seco por completo, el césped se recuperó y el jardín de lluvia agrega belleza mientras maneja el exceso de agua — una inversión total de $8,500, contra posibles reparaciones de cimentación de $15,000 o más.

## Cómo prevenir problemas de drenaje a futuro

Una vez resueltos los problemas actuales, mantén un buen drenaje con cuidado regular: limpia las canaletas dos veces al año, revisa las extensiones de los bajantes por temporada, monitorea por nuevas zonas bajas y mantén las entradas de drenaje libres de basura. Diseña tu jardín de forma inteligente con plantas nativas, evita compactar el suelo con maquinaria pesada, mantén el mantillo lejos de la cimentación y considera hardscape permeable para proyectos nuevos. Cada primavera, recorre tu propiedad bajo la lluvia para observar el flujo del agua, revisa la pendiente alrededor de la cimentación, prueba las bombas de sumidero antes de la temporada lluviosa y documenta cualquier cambio.

## Cuándo llamar a un profesional

Aunque algunos problemas de drenaje son proyectos de hazlo-tú-mismo, llama a los expertos cuando notes agua entrando al sótano, grandes áreas de agua estancada por más de 48 horas, erosión que amenaza estructuras o árboles, múltiples zonas problema que requieren soluciones integrales o cualquier problema de drenaje que afecte la cimentación. Una evaluación profesional asegura que atiendas las causas, no solo los síntomas — protegiendo tu inversión más grande, tu casa.

## Protege tu propiedad hoy

No dejes que los problemas de drenaje destruyan tu jardín o dañen tu casa. En Sunset Services hemos pasado más de 25 años resolviendo los retos de drenaje más difíciles de Aurora con un enfoque que atiende no solo el agua que ves, sino los problemas de fondo que la causan. Cada día que esperas, el agua sigue haciendo daño — así que vale la pena actuar antes de la próxima tormenta grande.`,
    faq: [
      {
        q: '¿Cuánto tiempo debería quedarse el agua en mi jardín después de la lluvia?',
        a: 'Si el agua permanece más de 24 a 48 horas después de la lluvia, tienes un problema de drenaje que vale la pena atender — idealmente antes de que llegue a la cimentación.',
      },
      {
        q: '¿Cuál es la mejor solución de drenaje para un patio mojado en Aurora?',
        a: 'Depende de la causa. Los drenajes franceses son el estándar de oro para zonas mojadas y para proteger la cimentación, mientras que la nivelación, los pozos de drenaje, los drenajes lineales y los jardines de lluvia se ajustan a situaciones específicas.',
      },
      {
        q: '¿Por qué los problemas de drenaje son tan comunes en Aurora?',
        a: 'Aurora se asienta sobre uno de los suelos arcillosos más densos de Illinois, que se resiste a absorber agua. Súmale los cambios bruscos de clima y más superficies impermeables por el desarrollo, y el agua no tiene a dónde ir.',
      },
    ],
  },

  'hoa-landscape-budget-2026': {
    title: 'Planeación del presupuesto de un HOA: cómo preparar tu presupuesto de jardinería 2026',
    dek: 'Una guía práctica para juntas de HOA y administradores de propiedades en los suburbios oeste de Chicago — cómo armar un presupuesto de jardinería realista que proteja los valores de propiedad.',
    metaTitle: 'Guía de planeación del presupuesto de jardinería para HOAs | Suburbios oeste de Chicago | Sunset Services',
    metaDescription: 'Cómo las juntas de HOA y los administradores de propiedades en Aurora, Naperville y St. Charles pueden armar un presupuesto estratégico de jardinería — categorías, consejos de ahorro y una plantilla de ejemplo.',
    featuredImageAlt: 'Una comunidad HOA con jardinería bien mantenida en los suburbios oeste de Chicago.',
    body: `*Una guía para juntas de HOA y administradores de propiedades en los suburbios oeste de Chicago.*

Conforme se acerca la temporada de planeación de presupuestos del próximo año, las juntas de HOA en Aurora, Naperville, St. Charles y comunidades aledañas enfrentan una tarea crítica: preparar el presupuesto de jardinería de 2026. Con más de 25 años aliándonos con HOAs en los suburbios oeste de Chicago, en Sunset Services entendemos que una buena planeación presupuestaria de jardinería puede ser la diferencia entre una comunidad próspera y una con mantenimiento aplazado y quejas de residentes.

Esta guía te lleva por los pasos esenciales para crear un presupuesto de jardinería realista y estratégico que mantenga los valores de propiedad mientras controla los costos.

## Por qué el final del verano es el momento correcto para planear

Empezar la planeación del presupuesto de jardinería a finales del verano tiene varias ventajas estratégicas: los contratistas tienen más tiempo para entregar propuestas detalladas antes de la temporada alta del otoño, ya tienes la mayor parte del año en datos de gasto para analizar, las condiciones del verano revelan necesidades de riego y zonas de alto tráfico, planear temprano te permite negociar mejores tarifas antes de los aumentos, y un arranque temprano asegura tiempo suficiente para la revisión y aprobación de la junta antes de fin de año.

## Entender tu gasto actual en jardinería

Antes de planear hacia adelante, haz un análisis completo de tus gastos actuales e históricos en jardinería. Esta base te ayuda a identificar tendencias, ineficiencias y oportunidades.

Revisa estas áreas clave: **mantenimiento regular** (frecuencia de corte y bordeado, limpieza estacional, mantillo, poda, fertilización y control de malezas); **manejo del riego** (uso y costo del agua, reparaciones y mejoras, arranque y cierre por temporada, programación del controlador); **manejo de nieve y hielo** (paleo y salado, limpieza de banquetas, uso de derretidor de hielo, cargos por respuesta de emergencia); **proyectos de mejora** (flores anuales, reemplazos de árboles y arbustos, reparaciones de hardscape, mejoras de drenaje); y **gastos imprevistos** (limpieza por tormenta, retiro de árboles de emergencia, fugas en líneas de riego, tratamientos por plagas y enfermedades).

## Cómo construir tu presupuesto de jardinería: enfoque paso a paso

### Paso 1: Establece tu base

Calcula tu gasto promedio de jardinería de los últimos tres años, ajustando por eventos inusuales o proyectos puntuales. Esta base es un punto de partida realista. No solo veas el gasto total — desglosa los costos por categoría para ver a dónde se va tu dinero y dónde podrías encontrar ahorros.

### Paso 2: Considera los cambios conocidos

Toma en cuenta los cambios confirmados que afectarán el presupuesto del próximo año: inflación (planea aumentos del 3 al 5 por ciento en mano de obra y materiales), crecimiento de la comunidad (nuevas amenidades o áreas comunes ampliadas), infraestructura envejecida (árboles maduros que necesitan más cuidado o retiro), cambios regulatorios (nuevos requisitos ambientales) y renovaciones de contrato (acuerdos que vencen y necesitan renegociarse).

### Paso 3: Identifica oportunidades de ahorro

Una planeación estratégica puede bajar costos sin sacrificar calidad.

- **Mantenimiento preventivo:** una fertilización regular reduce el costoso control de malezas, una poda adecuada previene daños por tormenta y retiros de emergencia, y reparaciones de riego a tiempo evitan el desperdicio de agua.
- **Compras en volumen:** coordina la entrega de mantillo con comunidades vecinas, compra el derretidor de hielo en verano para mejor precio y agrupa servicios con un solo contratista para descuentos por volumen.
- **Programación inteligente:** ajusta la frecuencia de corte al ritmo de crecimiento, programa las aplicaciones de fertilizante en el momento óptimo y agenda el trabajo no urgente en las temporadas bajas de los contratistas.
- **Prácticas sostenibles:** instala plantas tolerantes a la sequía para bajar el uso de agua, usa fertilizantes orgánicos para resultados más duraderos y aplica manejo integrado de plagas para minimizar tratamientos.

### Paso 4: Planea las mejoras de capital

Aparta fondos para mejoras a largo plazo que aumentan los valores de propiedad y reducen el mantenimiento futuro: conversiones a plantas nativas (menos mantenimiento y agua), mejoras de riego (controladores inteligentes y boquillas eficientes), soluciones de drenaje (que previenen erosión e inundaciones), un programa planeado de reemplazo de árboles y mejoras de hardscape que atienden tropiezos y superficies deterioradas.

### Paso 5: Crea tus categorías de presupuesto

Organiza tu presupuesto en categorías claras para un mejor seguimiento:

- **Mantenimiento de rutina (50–60%):** corte y bordeado, recorte y poda, retiro de hojas, limpieza general.
- **Servicios de temporada (15–20%):** limpieza de primavera y mantillo, limpieza de otoño, manejo de nieve y hielo, color estacional.
- **Salud de las plantas (10–15%):** fertilización, control de malezas, manejo de plagas y enfermedades, cuidado de árboles y arbustos.
- **Riego (5–10%):** mantenimiento del sistema, reparaciones y ajustes, costos del agua, cierre por invierno.
- **Mejoras de capital (10–15%):** mejoras del paisaje, equipo, renovaciones mayores, reserva de emergencia.

## Errores comunes de los HOA en el presupuesto de jardinería

1. **Subestimar el costo del agua.** Con las tarifas de agua al alza y posibles sequías, presupuesta aumentos del 10 al 15 por ciento en gastos de riego.
2. **Ignorar el cuidado de árboles.** Aplazar el mantenimiento de árboles lleva a emergencias caras; el cuidado regular cuesta mucho menos que la limpieza por tormenta o las demandas por daños.
3. **Presupuesto de nieve insuficiente.** Un invierno fuerte puede destruir un presupuesto de nieve subfinanciado — planea con cerca de un 20 por ciento por encima del promedio.
4. **Olvidar los aumentos contractuales.** Los contratos plurianuales muchas veces incluyen aumentos anuales; revisa todos los acuerdos por aumentos integrados.
5. **Sin fondo de emergencia.** Reserva entre el 5 y el 10 por ciento del presupuesto de jardinería para imprevistos como daños por tormenta o fallas de equipo.

## Herramientas tecnológicas para mejor gestión del presupuesto

Los HOAs modernos pueden usar software de gestión de jardinería para rastrear órdenes de trabajo y gastos en tiempo real, monitoreo del clima para ajustar los servicios a las condiciones reales, controladores de riego para monitorear el uso y detectar fugas, reportes digitales de trabajo para verificar servicios realizados y portales en línea para acceder a facturas y reportes con mejor supervisión.

## Cómo trabajar con tu contratista de jardinería

Un socio profesional puede mejorar mucho tu proceso de presupuestación. Pide propuestas detalladas con precios por partida, especificaciones y frecuencias claras y opciones de nivel de servicio. Agenda consultas de presupuesto — recorre la propiedad juntos, discute metas y prioridades y revisa los problemas históricos. Y negocia estratégicamente: agrupa servicios, considera contratos a más largo plazo para mayor estabilidad, pregunta por descuentos por pago anticipado y explora incentivos por desempeño.

## Ejemplo de presupuesto de jardinería para un HOA

Aquí un ejemplo práctico para una comunidad de 50 unidades con 10 acres de jardín mantenido, con un presupuesto anual de jardinería de $75,000:

- **Mantenimiento de rutina — $37,500 (50%):** corte en 30 visitas ($18,000), recorte y poda ($7,500), retiro de hojas ($6,000), limpieza general ($6,000).
- **Servicios de temporada — $15,000 (20%):** limpieza de primavera y mantillo ($5,000), limpieza de otoño ($3,000), retiro de nieve ($6,000), color estacional ($1,000).
- **Salud de las plantas — $11,250 (15%):** fertilización en 5 aplicaciones ($4,500), control de malezas ($3,000), cuidado de árboles y arbustos ($2,250), manejo de plagas ($1,500).
- **Riego — $3,750 (5%):** mantenimiento y reparaciones ($2,000), costo del agua ($1,500), cierre por invierno ($250).
- **Capital y reservas — $7,500 (10%):** mejoras ($4,000), fondo de emergencia ($3,500).

## Un calendario de planeación práctico

Un ciclo de planeación limpio avanza mes a mes: revisa el desempeño del año en curso y pide propuestas preliminares a finales del verano; evalúa las propuestas y recorre la propiedad a principios del otoño; finaliza la selección de contratistas y presenta un borrador del presupuesto a la junta; obtén la aprobación de la junta, firma contratos y comunica los planes a los residentes; después haz los ajustes finales y distribuye el presupuesto aprobado antes de la implementación en enero.

## Cómo sacar el mayor ROI a tu presupuesto de jardinería

Para asegurar que tu presupuesto de jardinería entregue el máximo valor: enfócate en la imagen exterior (las primeras impresiones cuentan para el valor de propiedad), prioriza la seguridad (atiende los riesgos antes que la estética), invierte en sostenibilidad (ahorros a largo plazo con prácticas eficientes), mantén constancia (el cuidado regular evita reparaciones caras) y comunica con claridad (mantén a los residentes informados sobre los planes de jardinería).

## Señales de que tu presupuesto necesita ajuste

Vigila las quejas crecientes de residentes sobre la apariencia del jardín, reparaciones de emergencia frecuentes o gastos no planeados, mantenimiento aplazado que ya se nota, un contratista incapaz de cumplir las especificaciones del servicio, facturas de agua muy por encima de lo proyectado y daños por tormenta que rebasan la reserva de emergencia.

## Conclusión: planear para tener éxito

Una buena planeación del presupuesto de jardinería de un HOA balancea la responsabilidad fiscal con mantener una comunidad atractiva y segura que proteja los valores de propiedad. Al arrancar el proceso temprano, le das a tu junta tiempo suficiente para un análisis completo, decisiones estratégicas y para conseguir los mejores acuerdos de servicio posibles. Tu paisaje suele ser lo primero que ven residentes y visitantes — un presupuesto bien planeado mantiene tus espacios exteriores como un activo, no como un pasivo.

Sunset Services ofrece consultas de presupuesto gratuitas para comunidades HOA en todos los suburbios oeste de Chicago, con más de 25 años de experiencia ayudando a las juntas a maximizar su inversión en jardinería mientras controlan los costos. Estamos listos para recorrer la propiedad y revisar un presupuesto cuando tu junta quiera arrancar la planeación.`,
    faq: [
      {
        q: '¿Qué proporción del presupuesto de jardinería de un HOA debe ir al mantenimiento de rutina?',
        a: 'Por lo general entre el 50 y el 60 por ciento — corte, bordeado, recorte, retiro de hojas y limpieza general — y el resto se reparte entre servicios de temporada, salud de las plantas, riego y reservas de capital.',
      },
      {
        q: '¿Cuál es el error más común al armar un presupuesto de jardinería de HOA?',
        a: 'Subfinanciar el retiro de nieve y el costo del agua, y omitir una reserva de emergencia. Planear cerca del 20 por ciento por encima del promedio para nieve y entre el 5 y el 10 por ciento para emergencias evita quedarte corto a media temporada.',
      },
      {
        q: '¿Cuándo debe empezar un HOA a planear el presupuesto de jardinería del próximo año?',
        a: 'Entre finales del verano y principios del otoño tienes datos históricos de gasto, mejor disponibilidad de contratistas y tiempo suficiente para negociar tarifas y conseguir la aprobación de la junta antes de fin de año.',
      },
    ],
  },
};

// ───────────────────────── blog upload ─────────────────────────

async function processBlogPost(slug, summary) {
  console.log('\n--- Blog post: ' + slug + ' ---');
  const mdPath = path.join(INCOMING_BLOG_DIR, slug + '.md');
  if (!fs.existsSync(mdPath)) {
    console.warn('   ! source MD missing: ' + mdPath + ' — skipping');
    summary.blogSkipped.push(slug);
    return;
  }
  const raw = fs.readFileSync(mdPath, 'utf8');
  const {meta, body} = parseFrontmatter(raw);
  const es = ES_TRANSLATIONS[slug];
  if (!es) {
    console.warn('   ! no ES translation block defined for ' + slug + ' — skipping');
    summary.blogSkipped.push(slug);
    return;
  }
  const category = CATEGORY_MAPPING[slug];
  if (!category) {
    console.warn('   ! no category mapping defined for ' + slug + ' — skipping');
    summary.blogSkipped.push(slug);
    return;
  }

  const enBody = mdToPortableText(body);
  const esBody = mdToPortableText(es.body);

  console.log('   title (EN): ' + meta.titleEn);
  console.log('   title (ES): ' + es.title);
  console.log('   category:   ' + category + ' (mapped from frontmatter "' + meta.category + '")');
  console.log('   publishedAt: ' + meta.publishedAt);
  console.log('   PT blocks:  EN=' + enBody.length + '  ES=' + esBody.length);
  console.log('   FAQs:       ' + (meta.faq?.length ?? 0) + ' EN / ' + es.faq.length + ' ES');
  console.log('   featuredImageFallback: ' + meta.featuredImageFallback);

  // ---- FAQ docs ----
  if ((meta.faq?.length ?? 0) !== 3 || es.faq.length !== 3) {
    console.warn('   ! expected 3 FAQs per language; got ' + (meta.faq?.length ?? 0) + ' EN / ' + es.faq.length + ' ES');
  }

  const faqRefs = [];
  for (let idx = 0; idx < 3; idx++) {
    const faqEn = meta.faq?.[idx];
    const faqEs = es.faq[idx];
    if (!faqEn || !faqEs) continue;
    const faqId = 'faq-blog-' + slug + '-' + (idx + 1);
    const faqDoc = {
      _id: faqId,
      _type: 'faq',
      question: localized(faqEn.q, faqEs.q),
      answer: localized(faqEn.a, faqEs.a),
      scope: 'blog:' + slug,
      order: idx,
    };
    if (COMMIT) {
      try {
        await sanity.createOrReplace(faqDoc);
        console.log('   FAQ ' + (idx + 1) + ' ' + faqId + ' → upserted');
      } catch (e) {
        console.warn('   ! FAILED FAQ ' + faqId + ': ' + e.message);
      }
    } else {
      console.log('   [dry] FAQ ' + (idx + 1) + ' ' + faqId + ' (createOrReplace)');
    }
    faqRefs.push({_type: 'reference', _ref: faqId, _key: makeKey()});
  }

  // ---- Featured image: from manifest if present, else leave unset and
  // rely on the static /public/images/blog/<slug>.jpg fallback that the
  // blog detail page renders (Phase 1.18 placeholder convention).
  let featuredImage = undefined;
  const manifestImage = summary.manifest?.blogImages?.[slug];
  if (manifestImage) {
    const abs = path.join(PHOTOS_ROOT, manifestImage);
    const asset = await uploadImageAsset(abs, 'blog featured image: ' + slug);
    if (asset) {
      featuredImage = {
        _type: 'image',
        asset: {_type: 'reference', _ref: asset._id},
      };
    }
  } else {
    console.log('   no manifest image; relying on /public/images/blog/' + slug + '.jpg static fallback');
  }

  // ---- Blog post doc ----
  const blogDoc = {
    _id: 'blogPost-' + slug,
    _type: 'blogPost',
    title: localized(meta.titleEn, es.title),
    slug: {_type: 'slug', current: slug},
    dek: localized(meta.dek, es.dek),
    body: localizedBody(enBody, esBody),
    publishedAt: meta.publishedAt,
    author: 'Sunset Services Team',
    category,
    featuredImageAlt: localized(
      meta.titleEn,
      es.featuredImageAlt ?? es.title,
    ),
    faqs: faqRefs,
    seo: localizedSeo(meta.metaTitle, meta.metaDescription, es.metaTitle, es.metaDescription),
    ...(featuredImage ? {featuredImage} : {}),
  };

  if (COMMIT) {
    try {
      await sanity.createOrReplace(blogDoc);
      console.log('   ✓ blogPost-' + slug + ' upserted');
      summary.blogCreated.push(slug);
    } catch (e) {
      console.warn('   ! FAILED to upsert blogPost-' + slug + ': ' + e.message);
      summary.blogSkipped.push(slug);
    }
  } else {
    console.log('   [dry] blogPost-' + slug + ' (createOrReplace) — ready to upsert');
    summary.blogCreated.push(slug);
  }
}

// ───────────────────────── project upload (D, gated) ─────────────────────────

async function processProject(p, idx, summary) {
  const slugHint = p.slugHint || ('m10d-project-' + (idx + 1));
  console.log('\n--- Project ' + (idx + 1) + ': ' + slugHint + ' ---');

  // Validate division + service
  if (!VALID_SERVICE_SLUGS_BY_DIVISION[p.division]) {
    console.warn('   ! invalid division "' + p.division + '" — skipping');
    summary.projectSkipped.push(slugHint);
    return;
  }
  const validServices = VALID_SERVICE_SLUGS_BY_DIVISION[p.division];
  if (!validServices.includes(p.primaryServiceSlug)) {
    console.warn('   ! service "' + p.primaryServiceSlug + '" not in division "' + p.division + '" — skipping');
    summary.projectSkipped.push(slugHint);
    return;
  }

  // Validate city
  let citySlug = null;
  if (p.city) {
    // Convert friendly name → slug (case-insensitive, replace spaces with dash).
    const candidate = p.city.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '');
    if (VALID_CITY_SLUGS.has(candidate)) {
      citySlug = candidate;
    } else {
      console.warn('   ! city "' + p.city + '" did not match any of the 22 location slugs — link left unset');
    }
  }

  // Resolve service + city refs
  const serviceRefId = await resolveRef('service', p.primaryServiceSlug);
  if (!serviceRefId) {
    console.warn('   ! service doc not found in Sanity for slug "' + p.primaryServiceSlug + '" — skipping');
    summary.projectSkipped.push(slugHint);
    return;
  }
  let cityRefId = null;
  if (citySlug) {
    cityRefId = await resolveRef('location', citySlug);
    if (!cityRefId) {
      console.warn('   ! location doc not found in Sanity for slug "' + citySlug + '" — link left unset');
    }
  }

  // De-duplicate slug
  let finalSlug = slugHint;
  if (COMMIT) {
    const existing = await sanity.fetch(
      '*[_type == "project" && slug.current == $s][0]._id',
      {s: finalSlug},
    );
    if (existing && existing !== 'project-m10d-' + slugHint) {
      finalSlug = slugHint + '-' + makeKey().slice(0, 4);
      console.log('   slug collision — using "' + finalSlug + '" instead');
    }
  }

  // Upload photos
  const photoAssets = [];
  for (let pi = 0; pi < (p.photos?.length || 0); pi++) {
    const relPath = p.photos[pi];
    const abs = path.join(PHOTOS_ROOT, relPath);
    const role = pi === 0 ? 'featured' : 'gallery #' + pi;
    const asset = await uploadImageAsset(abs, 'project "' + slugHint + '" ' + role);
    if (asset) photoAssets.push(asset);
  }
  if (photoAssets.length === 0) {
    console.warn('   ! no photos uploaded — skipping');
    summary.projectSkipped.push(slugHint);
    return;
  }

  // Before/after assets if provided
  let beforeAsset = null;
  let afterAsset = null;
  if (p.hasBeforeAfter && p.beforePhoto && p.afterPhoto) {
    beforeAsset = await uploadImageAsset(path.join(PHOTOS_ROOT, p.beforePhoto), 'project "' + slugHint + '" BEFORE');
    afterAsset = await uploadImageAsset(path.join(PHOTOS_ROOT, p.afterPhoto), 'project "' + slugHint + '" AFTER');
  }

  // Audience derivation per the plan §D rule
  const audience =
    p.division === 'hardscape' ? 'hardscape' : p.audience || 'residential';

  // Resolved division: derived the same way the live `getProjectDivision()`
  // helper does — audience === 'hardscape' overrides to hardscape; else
  // pull from the first service's division. We assert it matches `p.division`.
  let resolvedDivision;
  if (audience === 'hardscape') {
    resolvedDivision = 'hardscape';
  } else {
    // Look up the service's division from our static map.
    for (const [div, slugs] of Object.entries(VALID_SERVICE_SLUGS_BY_DIVISION)) {
      if (slugs.includes(p.primaryServiceSlug)) {
        resolvedDivision = div;
        break;
      }
    }
  }
  if (resolvedDivision !== p.division) {
    console.warn(
      '   ! division mismatch: manifest says "' + p.division + '" but resolved to "' + resolvedDivision +
        '" (audience=' + audience + ', service=' + p.primaryServiceSlug + ')',
    );
    summary.projectSkipped.push(slugHint);
    return;
  }
  if (resolvedDivision === 'landscape') summary.landscapeCount++;

  const description = p.description || '';
  const shortDek = description.length > 120 ? description.slice(0, 117) + '…' : description;

  const projectDoc = {
    _id: 'project-m10d-' + finalSlug,
    _type: 'project',
    title: localized(p.title, p.title),  // No ES translation in manifest — duplicate EN for now.
    slug: {_type: 'slug', current: finalSlug},
    audience,
    shortDek: localized(shortDek, shortDek),
    narrative: localizedText(description, description),
    services: [{_type: 'reference', _ref: serviceRefId, _key: makeKey()}],
    ...(cityRefId ? {city: {_type: 'reference', _ref: cityRefId}} : {}),
    featuredImage: {
      _type: 'image',
      asset: {_type: 'reference', _ref: photoAssets[0]._id},
    },
    gallery: photoAssets.slice(1).map((a) => ({
      _type: 'galleryItem',
      _key: makeKey(),
      asset: {_type: 'reference', _ref: a._id},
      alt: localized(p.title, p.title),
    })),
    publishedAt: new Date().toISOString().slice(0, 10),
    hasBeforeAfter: !!(p.hasBeforeAfter && beforeAsset && afterAsset),
    ...(beforeAsset
      ? {
          beforeImage: {
            _type: 'image',
            asset: {_type: 'reference', _ref: beforeAsset._id},
          },
          beforeAlt: localized('Before', 'Antes'),
        }
      : {}),
    ...(afterAsset
      ? {
          afterImage: {
            _type: 'image',
            asset: {_type: 'reference', _ref: afterAsset._id},
          },
          afterAlt: localized('After', 'Después'),
        }
      : {}),
  };

  if (COMMIT) {
    try {
      await sanity.createOrReplace(projectDoc);
      console.log('   ✓ project-m10d-' + finalSlug + ' upserted (division: ' + resolvedDivision + ')');
      summary.projectsCreated.push(finalSlug);
    } catch (e) {
      console.warn('   ! FAILED to upsert project-m10d-' + finalSlug + ': ' + e.message);
      summary.projectSkipped.push(slugHint);
    }
  } else {
    console.log('   [dry] project-m10d-' + finalSlug + ' (createOrReplace, division: ' + resolvedDivision + ')');
    summary.projectsCreated.push(finalSlug);
  }
}

// ───────────────────────── placeholder cleanup ─────────────────────────

async function cleanPlaceholders(summary) {
  console.log('\n--- Cleaning Phase 1.16 placeholder projects ---');
  for (const slug of PLACEHOLDER_PROJECT_SLUGS) {
    const id = await sanity.fetch(
      '*[_type == "project" && slug.current == $s][0]._id',
      {s: slug},
    );
    if (!id) {
      console.log('   - ' + slug + ' (already gone)');
      continue;
    }
    if (COMMIT) {
      try {
        await sanity.delete(id);
        console.log('   ✓ deleted ' + slug + ' (' + id + ')');
        summary.placeholdersRemoved.push(slug);
      } catch (e) {
        console.warn('   ! FAILED to delete ' + slug + ': ' + e.message);
      }
    } else {
      console.log('   [dry] would delete ' + slug + ' (' + id + ')');
      summary.placeholdersRemoved.push(slug);
    }
  }
}

// ───────────────────────── main ─────────────────────────

async function main() {
  const summary = {
    blogCreated: [],
    blogSkipped: [],
    projectsCreated: [],
    projectSkipped: [],
    landscapeCount: 0,
    placeholdersRemoved: [],
    manifest: null,
  };

  console.log('============================================================');
  console.log('Phase M.10d — content upload script');
  console.log('  Mode:                ' + (COMMIT ? 'COMMIT (writes will be performed)' : 'DRY RUN (no writes)'));
  console.log('  Clean placeholders:  ' + (CLEAN_PLACEHOLDERS ? 'yes' : 'no'));
  console.log('  Sanity project:      ' + PROJECT_ID + ' / dataset: ' + DATASET);
  console.log('  Incoming blog dir:   ' + INCOMING_BLOG_DIR);
  console.log('  Manifest path:       ' + MANIFEST_PATH);
  console.log('============================================================');

  // ---- Load manifest (optional — D is skipped when missing) ----
  if (fs.existsSync(MANIFEST_PATH)) {
    try {
      summary.manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
      console.log('Manifest loaded — ' + (summary.manifest.projects?.length ?? 0) + ' project(s), ' +
        Object.keys(summary.manifest.blogImages ?? {}).length + ' blog image(s) referenced.');
    } catch (e) {
      console.warn('! Failed to parse manifest at ' + MANIFEST_PATH + ' (' + e.message + ')');
      console.warn('! Continuing with blog uploads only.');
      summary.manifest = null;
    }
  } else {
    console.log('No manifest at ' + MANIFEST_PATH + ' — Phase D (projects) will be skipped.');
  }

  // ---- C: Blog posts ----
  console.log('\n=== C. Blog posts ===');
  for (const slug of ['why-is-my-lawn-yellow', 'backyard-drainage-aurora', 'hoa-landscape-budget-2026']) {
    await processBlogPost(slug, summary);
  }

  // ---- D: Projects (gated on manifest) ----
  console.log('\n=== D. Projects ===');
  if (summary.manifest?.projects?.length) {
    const projects = summary.manifest.projects;
    if (projects.length < 2 || projects.length > 5) {
      console.warn('! Manifest has ' + projects.length + ' projects; plan calls for 2–5. Proceeding anyway.');
    }
    for (let i = 0; i < projects.length; i++) {
      await processProject(projects[i], i, summary);
    }
    if (summary.landscapeCount < 2) {
      console.warn('! Only ' + summary.landscapeCount + ' landscape project(s) resolved — plan requires ≥ 2.');
    }
  } else {
    console.log('   (skipped — no manifest)');
  }

  // ---- Placeholder cleanup ----
  if (CLEAN_PLACEHOLDERS) {
    await cleanPlaceholders(summary);
  } else {
    console.log('\n--- Placeholder cleanup: not requested (pass --clean-placeholders to remove the 12 Phase 1.16 seeds) ---');
  }

  // ---- Final summary ----
  console.log('\n============================================================');
  console.log('SUMMARY (' + (COMMIT ? 'COMMITTED' : 'DRY RUN') + ')');
  console.log('  Blog posts created/upserted: ' + summary.blogCreated.length + '  (' + summary.blogCreated.join(', ') + ')');
  if (summary.blogSkipped.length) {
    console.log('  Blog posts SKIPPED:          ' + summary.blogSkipped.length + '  (' + summary.blogSkipped.join(', ') + ')');
  }
  console.log('  Projects created/upserted:   ' + summary.projectsCreated.length + ' (of which ' + summary.landscapeCount + ' landscape)');
  if (summary.projectSkipped.length) {
    console.log('  Projects SKIPPED:            ' + summary.projectSkipped.length + '  (' + summary.projectSkipped.join(', ') + ')');
  }
  console.log('  Placeholders removed:        ' + summary.placeholdersRemoved.length + (summary.placeholdersRemoved.length ? '  (' + summary.placeholdersRemoved.join(', ') + ')' : ''));
  console.log('============================================================');
  if (!COMMIT) {
    console.log('Dry run complete. To actually write, re-run with --commit (add --clean-placeholders to also remove the 12 Phase 1.16 seeds).');
  } else {
    console.log('Commit complete. ISR will refresh the live site within 30 minutes (or after a redeploy).');
  }
}

main().catch((err) => {
  console.error('[m10d] FATAL:', err);
  process.exit(1);
});

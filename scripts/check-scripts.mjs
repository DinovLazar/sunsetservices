import {spawnSync} from 'node:child_process';
import {readdirSync, statSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)));

function listMjsFiles(dir) {
  const entries = readdirSync(dir, {withFileTypes: true});
  return entries.flatMap((entry) => {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) return listMjsFiles(absolute);
    if (!entry.isFile() || !entry.name.endsWith('.mjs')) return [];
    return [absolute];
  });
}

const files = listMjsFiles(root).sort((a, b) => a.localeCompare(b));
let failed = 0;

for (const file of files) {
  const rel = path.relative(process.cwd(), file);
  const result = spawnSync(process.execPath, ['--check', file], {encoding: 'utf8'});
  if (result.status === 0) {
    console.log(`PASS ${rel}`);
    continue;
  }

  failed += 1;
  console.error(`FAIL ${rel}`);
  if (result.stderr) console.error(result.stderr.trim());
  if (result.stdout) console.error(result.stdout.trim());
}

const total = files.length;
console.log(`${total - failed}/${total} script syntax checks passed`);

if (failed > 0) process.exit(1);

// Touch statSync so this script fails fast if the scripts directory disappears
// in a future repo layout change.
statSync(root);

// Extrae las regiones marcadas con "#region demo" de los ficheros REALES de cada
// enfoque y genera un .ts con el codigo ya resaltado. Asi el snippet que se ve en
// la web no puede desincronizarse del codigo que se esta ejecutando, y el
// resaltado no cuesta ni un byte de JavaScript en el navegador.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';

hljs.registerLanguage('typescript', typescript);

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const SOURCES = [
  { id: 'rxjs', file: 'src/app/sections/approaches/variants/rxjs-search.component.ts' },
  { id: 'resource', file: 'src/app/sections/approaches/variants/resource-search.component.ts' },
  { id: 'store', file: 'src/app/sections/approaches/variants/wiki-search.store.ts' }
];

const START = '// #region demo';
const END = '// #endregion';

function extractRegion(source, file) {
  const lines = source.split(/\r?\n/);
  const start = lines.findIndex(line => line.trim() === START);
  const end = lines.findIndex(line => line.trim() === END);

  if (start === -1 || end === -1 || end < start) {
    throw new Error(`No encuentro la region "demo" en ${file}`);
  }

  const body = lines.slice(start + 1, end);

  // Quitamos la indentacion comun para que el snippet no salga desplazado.
  const indents = body
    .filter(line => line.trim().length)
    .map(line => line.match(/^\s*/)[0].length);
  const pad = indents.length ? Math.min(...indents) : 0;

  return body.map(line => line.slice(pad)).join('\n').trim();
}

const snippets = SOURCES.map(({ id, file }) => {
  const code = extractRegion(readFileSync(resolve(root, file), 'utf8'), file);
  const html = hljs.highlight(code, { language: 'typescript' }).value;
  return { id, file, code, html };
});

const output = `// GENERADO por scripts/generate-snippets.mjs — no editar a mano.
// Se regenera en cada build a partir del codigo fuente real de cada enfoque.

export interface Snippet {
  id: string;
  file: string;
  code: string;
  html: string;
}

export const SNIPPETS: Record<string, Snippet> = ${JSON.stringify(
  Object.fromEntries(snippets.map(s => [s.id, s])),
  null,
  2
)};
`;

const target = resolve(root, 'src/app/sections/approaches/data/snippets.generated.ts');
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, output);

console.log(`snippets generados: ${snippets.map(s => `${s.id} (${s.code.split('\n').length} lineas)`).join(', ')}`);

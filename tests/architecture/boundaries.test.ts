// Module boundaries of the modular architecture (docs/architecture.md). A failing test names the offending import.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, posix, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SRC = 'frontend/src';

const sourceFiles = (dir: string): string[] =>
  readdirSync(join(root, dir), { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? sourceFiles(`${dir}/${e.name}`) : /\.(ts|tsx)$/.test(e.name) ? [`${dir}/${e.name}`] : []
  );

/** Every relative import in frontend/src as { from, to }, both relative to frontend/src, extensions dropped. */
const imports = sourceFiles(SRC).flatMap((file) => {
  const from = posix.relative(SRC, file).replace(/\.tsx?$/, '');
  const specs = [...readFileSync(join(root, file), 'utf8').matchAll(/(?:from|import)\s+['"](\.{1,2}\/[^'"]+)['"]/g)];
  return specs.map(([, spec]) => {
    const to = posix.normalize(posix.join(posix.dirname(from), spec)).replace(/\.tsx?$/, '');
    return { from, to };
  });
});

const layer = (path: string) => path.split('/')[0]; // app | features | shared | ../… (outside frontend/src)
const feature = (path: string) => (path.startsWith('features/') ? path.split('/')[1] : null);
const show = (list: { from: string; to: string }[]) => list.map(({ from, to }) => `${from} -> ${to}`);

test('the boundary scan sees the app (guards against the test silently checking nothing)', () => {
  assert.ok(imports.some(({ from, to }) => from === 'app/App' && to === 'features/library'));
});

test('shared/ depends on nothing above it (no app/ or features/ imports)', () => {
  assert.deepEqual(show(imports.filter(({ from, to }) => layer(from) === 'shared' && layer(to) !== 'shared')), []);
});

test('features never import each other', () => {
  const crossing = imports.filter(({ from, to }) => feature(from) && feature(to) && feature(from) !== feature(to));
  assert.deepEqual(show(crossing), []);
});

test('code outside a feature uses only its public index.ts', () => {
  const deep = imports.filter(
    ({ from, to }) => feature(to) && feature(from) !== feature(to) && to !== `features/${feature(to)}` && to !== `features/${feature(to)}/index`
  );
  assert.deepEqual(show(deep), []);
});

test('data enters only through app/: features and UI never call the API', () => {
  const callers = imports.filter(({ from, to }) => to === 'shared/api/api' && layer(from) !== 'app');
  assert.deepEqual(show(callers), []);
});

test('mock data is reachable only through shared/api/api.ts', () => {
  const direct = imports.filter(({ from, to }) => to.startsWith('shared/api/mocks/') && from !== 'shared/api/api');
  assert.deepEqual(show(direct), []);
});

test('frontend never imports from outside frontend/src (backend/, database/, tests/)', () => {
  assert.deepEqual(show(imports.filter(({ to }) => to.startsWith('..'))), []);
});

test('backend never imports frontend code (they only share the HTTP contract)', () => {
  let files: string[] = [];
  try {
    files = sourceFiles('backend');
  } catch {
    return; // backend/ has no source yet (phase 3)
  }
  const leaks = files.filter((f) => /from\s+['"][^'"]*frontend\//.test(readFileSync(join(root, f), 'utf8')));
  assert.deepEqual(leaks.map((f) => relative(root, join(root, f))), []);
});

// End-to-end: the real frontend data-access layer (api.ts) against the real Express API and MySQL.
// Skips when MySQL is unreachable, like the other database-backed suites.
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { createApp } from '../../backend/index.ts';
import { pool } from '../../backend/db.ts';
import { getGames, getLibrary, saveUserGame } from '../../frontend/src/shared/api/api.ts';

let server: Server | undefined;
let base = '';
let skip: string | false = false;

const realFetch = globalThis.fetch;

try {
  await pool.query('SELECT 1');
} catch {
  skip = 'MySQL no disponible (revisa backend/.env o levanta el contenedor)';
}

before(async () => {
  if (skip) return;

  server = createApp().listen(0);
  await new Promise<void>((resolve) => server?.once('listening', () => resolve()));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

  // api.ts uses relative /api URLs, exactly like the browser behind the Vite proxy.
  globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' && input.startsWith('/') ? `${base}${input}` : input;
    return realFetch(url, init);
  }) as typeof fetch;
});

after(async () => {
  globalThis.fetch = realFetch;
  if (server !== undefined) await new Promise<void>((resolve) => server?.close(() => resolve()));
  await pool.end();
});

test('the frontend loads the catalog from the real API', { skip }, async () => {
  const games = await getGames();
  assert.ok(games.length > 0);

  const game = games.find((candidate) => candidate.id === 'baldurs-gate-3');
  assert.ok(game);
  assert.ok(Array.isArray(game.genres));
  assert.equal(typeof game.averageScore, 'number');
  assert.equal(typeof game.popularity, 'number');
});

test('saving through the frontend layer is visible on the next read', { skip }, async () => {
  const saved = await saveUserGame('baldurs-gate-3', {
    status: 'PAUSED',
    hoursPlayed: 11.5,
    isFavorite: true,
  });

  assert.equal(saved.gameId, 'baldurs-gate-3');
  assert.equal(saved.status, 'PAUSED');
  assert.equal(saved.hoursPlayed, 11.5);
  assert.equal(saved.isFavorite, true);

  const library = await getLibrary();
  assert.equal(library['baldurs-gate-3'].hoursPlayed, 11.5);
  assert.equal(library['baldurs-gate-3'].isFavorite, true);
});

test('API validation errors reach the caller as rejected promises', { skip }, async () => {
  await assert.rejects(saveUserGame('baldurs-gate-3', { score: 150 }), /score must be an integer/);
});

test('an unknown game rejects with the API 404 message', { skip }, async () => {
  await assert.rejects(saveUserGame('no-existe', { status: 'CURRENT' }), /juego no encontrado/);
});
